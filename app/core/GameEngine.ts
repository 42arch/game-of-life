import type { PrefabData } from '../constants'
import type { Stats } from '../types'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/Addons.js'
import { COLOR_ALIVE, COLOR_DEAD, PREFABS, TEXTURE_SIZE } from '../constants'
import { RENDER_FRAGMENT_SHADER, SIMULATION_FRAGMENT_SHADER } from '../shaders/fragment.glsl'
import { VERTEX_SHADER } from '../shaders/vertex.glsl'
import { GameState } from '../types'

export class GameEngine {
  // State
  private gameState: GameState = GameState.STOPPED
  private speed: number = 30
  private brushSize: number = 0.01
  private drawMode: boolean = true
  private textureWidth: number = TEXTURE_SIZE
  private textureHeight: number = TEXTURE_SIZE
  private randomPercentage: number = 0.2

  // Internal State
  private isRunning: boolean = false
  private isDrawing: boolean = false
  private lastFrameTime: number = 0
  private generationCount: number = 0
  private mouseUv: THREE.Vector2 = new THREE.Vector2(-1, -1)
  private animationId: number = 0
  private lastStatsUpdate: number = 0
  private isUpdatingStats: boolean = false

  // Stamping
  private stampQueue: { texture: THREE.Texture, width: number, height: number, uv: THREE.Vector2 } | null = null
  private prefabTextures: Map<string, THREE.Texture> = new Map()

  // Three.js Objects
  private renderer: THREE.WebGLRenderer | null = null
  private scene: THREE.Scene | null = null
  private camera: THREE.OrthographicCamera | null = null
  private displayMaterial: THREE.ShaderMaterial | null = null
  private previewMesh: THREE.Mesh | null = null
  private controls: OrbitControls | null = null
  private mountContainer: HTMLElement | null = null

  // GPGPU Objects
  private simScene: THREE.Scene | null = null
  private simCamera: THREE.Camera | null = null
  private simMaterial: THREE.ShaderMaterial | null = null
  private fboA: THREE.WebGLRenderTarget | null = null
  private fboB: THREE.WebGLRenderTarget | null = null
  private raycaster: THREE.Raycaster = new THREE.Raycaster()
  private planeMesh: THREE.Mesh | null = null
  private borderMesh: THREE.LineLoop | null = null

  // Callbacks
  private onStatsUpdate: ((stats: Stats) => void) | null = null
  private onGameStateChange: ((state: GameState) => void) | null = null

  constructor(
    onStatsUpdate?: (stats: Stats) => void,
    onGameStateChange?: (state: GameState) => void,
  ) {
    if (onStatsUpdate)
      this.onStatsUpdate = onStatsUpdate
    if (onGameStateChange)
      this.onGameStateChange = onGameStateChange

    this.initPrefabTextures()
  }

  private initPrefabTextures() {
    PREFABS.forEach((prefab) => {
      const data = new Float32Array(prefab.width * prefab.height * 4)
      for (let i = 0; i < prefab.data.length; i++) {
        const val = prefab.data[i]
        const idx = i * 4
        data[idx] = val // R
        data[idx + 1] = 0 // G
        data[idx + 2] = 0 // B
        data[idx + 3] = 1 // A
      }
      const tex = new THREE.DataTexture(data, prefab.width, prefab.height, THREE.RGBAFormat, THREE.FloatType)
      tex.flipY = true
      tex.needsUpdate = true
      this.prefabTextures.set(prefab.name, tex)
    })
  }

  public init(container: HTMLElement) {
    this.mountContainer = container

    // 1. Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' })
    this.renderer.setSize(container.clientWidth, container.clientHeight)
    this.renderer.setPixelRatio(window.devicePixelRatio)
    container.appendChild(this.renderer.domElement)

    // 2. FBO Setup
    const fboOptions = {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
    }
    this.fboA = new THREE.WebGLRenderTarget(this.textureWidth, this.textureHeight, fboOptions)
    this.fboB = new THREE.WebGLRenderTarget(this.textureWidth, this.textureHeight, fboOptions)

    // 3. Initial Data
    const data = new Float32Array(this.textureWidth * this.textureHeight * 4)
    for (let i = 0; i < data.length; i += 4) {
      const val = Math.random() < this.randomPercentage ? 1.0 : 0.0
      data[i] = val
      data[i + 1] = 0
      data[i + 2] = 0
      data[i + 3] = 1
    }
    const startTexture = new THREE.DataTexture(data, this.textureWidth, this.textureHeight, THREE.RGBAFormat, THREE.FloatType)
    startTexture.needsUpdate = true

    // 4. Simulation Scene
    this.simScene = new THREE.Scene()
    this.simCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    const simGeo = new THREE.PlaneGeometry(2, 2)
    this.simMaterial = new THREE.ShaderMaterial({
      uniforms: {
        tSource: { value: startTexture },
        uResolution: { value: new THREE.Vector2(this.textureWidth, this.textureHeight) },
        uMouse: { value: new THREE.Vector2(-100, -100) },
        uBrushSize: { value: this.brushSize },
        uIsDrawing: { value: 0.0 },
        uSimulate: { value: 0.0 },

        // Stamp Uniforms
        uIsStamping: { value: 0.0 },
        uStampTexture: { value: null },
        uStampUV: { value: new THREE.Vector2(0, 0) },
        uStampSize: { value: new THREE.Vector2(0, 0) },
      },
      vertexShader: VERTEX_SHADER,
      fragmentShader: SIMULATION_FRAGMENT_SHADER,
    })
    const simQuad = new THREE.Mesh(simGeo, this.simMaterial)
    this.simScene.add(simQuad)

    // Pre-render
    this.renderer.setRenderTarget(this.fboA)
    this.renderer.render(this.simScene, this.simCamera)
    this.renderer.setRenderTarget(null)

    // 5. Display Scene
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x050505)

    const aspect = container.clientWidth / container.clientHeight
    const viewSize = 1.2
    this.camera = new THREE.OrthographicCamera(
      -viewSize * aspect,
      viewSize * aspect,
      viewSize,
      -viewSize,
      0.1,
      100,
    )
    this.camera.position.set(0, 0, 10)
    this.camera.lookAt(0, 0, 0)
    this.camera.zoom = 10.0
    this.camera.updateProjectionMatrix()

    const displayGeo = new THREE.PlaneGeometry(1, 1)
    this.displayMaterial = new THREE.ShaderMaterial({
      uniforms: {
        tMap: { value: this.fboA.texture },
        uColorAlive: { value: new THREE.Vector3(...COLOR_ALIVE) },
        uColorDead: { value: new THREE.Vector3(...COLOR_DEAD) },
        uResolution: { value: new THREE.Vector2(this.textureWidth, this.textureHeight) },
        uGridVisible: { value: 0.0 },
      },
      vertexShader: VERTEX_SHADER,
      fragmentShader: RENDER_FRAGMENT_SHADER,
    })
    this.planeMesh = new THREE.Mesh(displayGeo, this.displayMaterial)
    // Scale mesh to match aspect ratio
    this.planeMesh.scale.set(this.textureWidth / this.textureHeight, 1, 1)
    this.scene.add(this.planeMesh)

    // Border Mesh
    const borderGeo = new THREE.BufferGeometry()
    const vertices = new Float32Array([
      -0.5,
      0.5,
      0,
      0.5,
      0.5,
      0,
      0.5,
      -0.5,
      0,
      -0.5,
      -0.5,
      0,
    ])
    borderGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
    const borderMat = new THREE.LineBasicMaterial({ color: 0x333333 })
    this.borderMesh = new THREE.LineLoop(borderGeo, borderMat)
    this.borderMesh.position.z = 0.001
    // Scale border to match aspect ratio
    this.borderMesh.scale.set(this.textureWidth / this.textureHeight, 1, 1)
    this.scene.add(this.borderMesh)

    // Preview Mesh
    const previewGeo = new THREE.PlaneGeometry(1, 1)
    const previewMat = new THREE.MeshBasicMaterial({
      color: 0x00FF00,
      transparent: true,
      opacity: 0.4,
      map: null,
    })
    this.previewMesh = new THREE.Mesh(previewGeo, previewMat)
    this.previewMesh.visible = false
    this.previewMesh.position.z = 0.01
    this.scene.add(this.previewMesh)

    // 6. Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableRotate = false
    this.controls.enableZoom = true
    this.controls.screenSpacePanning = true
    this.controls.mouseButtons = {
      LEFT: THREE.MOUSE.PAN,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.PAN,
    }
    this.controls.minZoom = 0.5
    this.controls.maxZoom = 50

    // 7. Event Listeners
    window.addEventListener('resize', this.handleResize)

    // Start loop
    this.animate(0)
  }

  public dispose() {
    window.removeEventListener('resize', this.handleResize)
    cancelAnimationFrame(this.animationId)

    if (this.mountContainer && this.renderer) {
      this.mountContainer.removeChild(this.renderer.domElement)
    }

    this.renderer?.dispose()
    this.fboA?.dispose()
    this.fboB?.dispose()
    this.displayMaterial?.dispose()
    this.simMaterial?.dispose()
  }

  private handleResize = () => {
    if (!this.mountContainer || !this.renderer || !this.camera)
      return
    const w = this.mountContainer.clientWidth
    const h = this.mountContainer.clientHeight
    const asp = w / h
    const frustumSize = (this.camera.top - this.camera.bottom)
    this.camera.left = -frustumSize * asp / 2
    this.camera.right = frustumSize * asp / 2
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(w, h)
  }

  private animate = (time: number) => {
    this.animationId = requestAnimationFrame(this.animate)

    if (!this.renderer || !this.simMaterial || !this.fboA || !this.fboB || !this.simScene || !this.simCamera || !this.scene || !this.camera || !this.displayMaterial)
      return

    const shouldSimulate = this.isRunning || this.isDrawing || this.stampQueue !== null
    const delta = time - this.lastFrameTime
    const interval = 1000 / this.speed

    const isStamping = this.stampQueue !== null

    if (shouldSimulate && (this.isDrawing || isStamping || delta > interval)) {
      // Update Uniforms
      this.simMaterial.uniforms.tSource.value = this.fboA.texture
      this.simMaterial.uniforms.uIsDrawing.value = this.isDrawing ? 1.0 : 0.0
      this.simMaterial.uniforms.uMouse.value = this.mouseUv
      this.simMaterial.uniforms.uBrushSize.value = this.brushSize

      // Only simulate physics if the game is running
      // If we are just drawing/stamping in pause mode, uSimulate should be false
      this.simMaterial.uniforms.uSimulate.value = (this.isRunning && (delta > interval)) ? 1.0 : 0.0

      // Handle Stamping
      if (isStamping && this.stampQueue) {
        const stamp = this.stampQueue
        this.simMaterial.uniforms.uIsStamping.value = 1.0
        this.simMaterial.uniforms.uStampTexture.value = stamp.texture
        this.simMaterial.uniforms.uStampUV.value = stamp.uv
        this.simMaterial.uniforms.uStampSize.value.set(stamp.width / this.textureWidth, stamp.height / this.textureHeight)
      }
      else {
        this.simMaterial.uniforms.uIsStamping.value = 0.0
      }

      // Render Sim
      this.renderer.setRenderTarget(this.fboB)
      this.renderer.render(this.simScene, this.simCamera)
      this.renderer.setRenderTarget(null)

      if (isStamping) {
        this.stampQueue = null
        this.simMaterial.uniforms.uIsStamping.value = 0.0
      }

      // Swap
      const temp = this.fboA
      this.fboA = this.fboB
      this.fboB = temp

      // Stats
      if (this.isRunning) {
        this.lastFrameTime = time - (delta % interval)
        this.generationCount++
      }
    }

    // Always sync tMap to show the current state (including drawing while paused)
    this.displayMaterial.uniforms.tMap.value = this.fboA.texture
    this.renderer.render(this.scene, this.camera)

    // Update Stats (Throttle to every 1000ms)
    if (time - this.lastStatsUpdate > 1000 && this.onStatsUpdate && this.renderer && this.fboA && !this.isUpdatingStats) {
      this.lastStatsUpdate = time
      this.updateStats()
    }
  }

  private async updateStats() {
    if (!this.renderer || !this.fboA || this.isUpdatingStats)
      return

    this.isUpdatingStats = true
    const width = this.textureWidth
    const height = this.textureHeight
    const buffer = new Float32Array(width * height * 4)

    // Use async read if available, otherwise sync (which might stutter)
    try {
      if ('readRenderTargetPixelsAsync' in this.renderer) {
        // @ts-expect-error - Three.js types might not be up to date for this method
        const pixelBuffer = await this.renderer.readRenderTargetPixelsAsync(this.fboA, 0, 0, width, height, buffer)
        if (pixelBuffer) {
          this.countCells(pixelBuffer as Float32Array)
          this.isUpdatingStats = false
          return
        }
      }

      // Fallback to sync
      this.renderer.readRenderTargetPixels(this.fboA, 0, 0, width, height, buffer)
      this.countCells(buffer)
    }
    catch (e) {
      console.warn('Stats update failed', e)
    }
    this.isUpdatingStats = false
  }

  private countCells(buffer: Float32Array | Uint8Array | Uint16Array) {
    let alive = 0
    // Loop through red channel (index 0, 4, 8...)
    for (let i = 0; i < buffer.length; i += 4) {
      if (buffer[i] > 0.5)
        alive++
    }
    const total = this.textureWidth * this.textureHeight

    if (this.onStatsUpdate) {
      this.onStatsUpdate({
        generation: this.generationCount,
        aliveCount: alive,
        deadCount: total - alive,
      })
    }
  }

  // --- Interaction Methods ---

  private getIntersects(clientX: number, clientY: number) {
    if (!this.mountContainer || !this.camera || !this.planeMesh)
      return null
    const rect = this.mountContainer.getBoundingClientRect()
    const x = ((clientX - rect.left) / rect.width) * 2 - 1
    const y = -((clientY - rect.top) / rect.height) * 2 + 1
    this.raycaster.setFromCamera(new THREE.Vector2(x, y), this.camera)
    const intersects = this.raycaster.intersectObject(this.planeMesh)
    return intersects.length > 0 ? intersects[0] : null
  }

  public handlePointerMove(clientX: number, clientY: number) {
    const intersect = this.getIntersects(clientX, clientY)
    if (intersect && intersect.uv) {
      this.mouseUv.set(intersect.uv.x, intersect.uv.y)
    }
    else {
      this.mouseUv.set(-100, -100)
    }
  }

  public setPointerDown(isDown: boolean) {
    if (this.drawMode) {
      this.isDrawing = isDown
    }
  }

  public handleDragOver(clientX: number, clientY: number, activePrefab: PrefabData | null) {
    if (!activePrefab || !this.previewMesh)
      return
    const intersect = this.getIntersects(clientX, clientY)
    if (intersect && intersect.point) {
      this.previewMesh.position.set(intersect.point.x, intersect.point.y, 0.01)

      // Ensure preview mesh is updated
      const tex = this.prefabTextures.get(activePrefab.name)
      if (tex) {
        const scaleX = activePrefab.width / this.textureWidth
        const scaleY = activePrefab.height / this.textureHeight
        this.previewMesh.scale.set(scaleX, scaleY, 1);
        (this.previewMesh.material as THREE.MeshBasicMaterial).map = tex;
        (this.previewMesh.material as THREE.MeshBasicMaterial).needsUpdate = true
      }
      this.previewMesh.visible = true
    }
  }

  public handleDragLeave() {
    if (this.previewMesh) {
      this.previewMesh.visible = false
    }
  }

  public handleDrop(clientX: number, clientY: number, activePrefab: PrefabData | null) {
    if (this.previewMesh)
      this.previewMesh.visible = false
    if (!activePrefab)
      return

    const intersect = this.getIntersects(clientX, clientY)
    if (intersect && intersect.uv) {
      const tex = this.prefabTextures.get(activePrefab.name)
      if (tex) {
        this.stampQueue = {
          texture: tex,
          width: activePrefab.width,
          height: activePrefab.height,
          uv: intersect.uv,
        }
      }
    }
  }

  // --- Controls ---

  public setSpeed(speed: number) {
    this.speed = speed
  }

  public setBrushSize(size: number) {
    this.brushSize = size
  }

  public setDrawMode(mode: boolean) {
    this.drawMode = mode
    // Reset drawing state if mode changes
    if (!mode)
      this.isDrawing = false
  }

  public togglePlay() {
    if (this.gameState === GameState.RUNNING) {
      this.gameState = GameState.PAUSED
      this.isRunning = false
    }
    else {
      this.gameState = GameState.RUNNING
      this.isRunning = true
    }
    if (this.onGameStateChange)
      this.onGameStateChange(this.gameState)
  }

  public clear() {
    if (!this.renderer || !this.simMaterial || !this.fboA)
      return

    const data = new Float32Array(this.textureWidth * this.textureHeight * 4).fill(0)
    const tex = new THREE.DataTexture(data, this.textureWidth, this.textureHeight, THREE.RGBAFormat, THREE.FloatType)
    tex.needsUpdate = true

    this.simMaterial.uniforms.tSource.value = tex
    this.simMaterial.uniforms.uIsDrawing.value = 0.0

    this.renderer.setRenderTarget(this.fboA)
    this.renderer.render(this.simScene!, this.simCamera!)
    this.renderer.setRenderTarget(null)

    this.gameState = GameState.STOPPED
    this.isRunning = false
    this.generationCount = 0
    if (this.onStatsUpdate)
      this.onStatsUpdate({ generation: 0, aliveCount: 0, deadCount: this.textureWidth * this.textureHeight })
    if (this.onGameStateChange)
      this.onGameStateChange(this.gameState)
  }

  public reset() {
    if (!this.renderer || !this.simMaterial || !this.fboA)
      return

    const data = new Float32Array(this.textureWidth * this.textureHeight * 4)
    for (let i = 0; i < data.length; i += 4) {
      const val = Math.random() < this.randomPercentage ? 1.0 : 0.0
      data[i] = val
      data[i + 1] = 0
      data[i + 2] = 0
      data[i + 3] = 1
    }
    const tex = new THREE.DataTexture(data, this.textureWidth, this.textureHeight, THREE.RGBAFormat, THREE.FloatType)
    tex.needsUpdate = true

    this.simMaterial.uniforms.tSource.value = tex
    this.simMaterial.uniforms.uIsDrawing.value = 0.0

    this.renderer.setRenderTarget(this.fboA)
    this.renderer.render(this.simScene!, this.simCamera!)
    this.renderer.setRenderTarget(null)

    this.generationCount = 0
    // Trigger initial stats update after reset
    this.updateStats()
  }

  // --- Camera Controls ---

  public zoomIn() {
    if (!this.camera)
      return
    this.camera.zoom = Math.min(this.camera.zoom * 1.2, 50)
    this.camera.updateProjectionMatrix()
  }

  public zoomOut() {
    if (!this.camera)
      return
    this.camera.zoom = Math.max(this.camera.zoom / 1.2, 0.5)
    this.camera.updateProjectionMatrix()
  }

  public resetCamera() {
    if (!this.camera || !this.controls)
      return
    this.camera.zoom = 10.0
    this.camera.position.set(0, 0, 10)
    this.camera.lookAt(0, 0, 0)
    this.controls.target.set(0, 0, 0)
    this.camera.updateProjectionMatrix()
    this.controls.update()
  }

  // --- Configuration ---

  public setSceneDimensions(width: number, height: number) {
    if (width === this.textureWidth && height === this.textureHeight)
      return
    this.textureWidth = width
    this.textureHeight = height

    // Update Mesh Scale
    const aspect = width / height
    if (this.planeMesh) {
      this.planeMesh.scale.set(aspect, 1, 1)
    }
    if (this.borderMesh) {
      this.borderMesh.scale.set(aspect, 1, 1)
    }

    // Dispose old targets
    this.fboA?.dispose()
    this.fboB?.dispose()

    // Create new targets
    const fboOptions = {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
    }
    this.fboA = new THREE.WebGLRenderTarget(width, height, fboOptions)
    this.fboB = new THREE.WebGLRenderTarget(width, height, fboOptions)

    // Reset Data
    const data = new Float32Array(width * height * 4)
    for (let i = 0; i < data.length; i += 4) {
      const val = Math.random() < this.randomPercentage ? 1.0 : 0.0
      data[i] = val
      data[i + 1] = 0
      data[i + 2] = 0
      data[i + 3] = 1
    }
    const startTexture = new THREE.DataTexture(data, width, height, THREE.RGBAFormat, THREE.FloatType)
    startTexture.needsUpdate = true

    // Update Sim Material
    if (this.simMaterial) {
      this.simMaterial.uniforms.tSource.value = startTexture
      this.simMaterial.uniforms.uResolution.value.set(width, height)
    }

    // Update Display Material
    if (this.displayMaterial) {
      this.displayMaterial.uniforms.uResolution.value.set(width, height)
    }

    // Initial Render
    if (this.renderer && this.simScene && this.simCamera) {
      this.renderer.setRenderTarget(this.fboA)
      this.renderer.render(this.simScene, this.simCamera)
      this.renderer.setRenderTarget(null)
    }

    // Update Display Material
    if (this.displayMaterial && this.fboA) {
      this.displayMaterial.uniforms.tMap.value = this.fboA.texture
    }

    this.generationCount = 0
    // Trigger update
    this.updateStats()
  }

  public setColors(aliveHex: string, deadHex: string) {
    if (!this.displayMaterial)
      return
    const alive = new THREE.Color(aliveHex)
    const dead = new THREE.Color(deadHex)
    this.displayMaterial.uniforms.uColorAlive.value.set(alive.r, alive.g, alive.b)
    this.displayMaterial.uniforms.uColorDead.value.set(dead.r, dead.g, dead.b)
  }

  public setGridVisible(visible: boolean) {
    if (this.displayMaterial) {
      this.displayMaterial.uniforms.uGridVisible.value = visible ? 1.0 : 0.0
    }
  }

  public setRandomPercentage(percentage: number) {
    this.randomPercentage = percentage
  }
}
