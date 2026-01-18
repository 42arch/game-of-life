import type { PrefabData } from '../constants'
import type { Stats } from '../types'
import { useCallback, useEffect, useRef, useState } from 'react'
import { GameEngine } from '../core/GameEngine'
import { GameState } from '../types'

interface UseLifeGameEngineProps {
  mountRef: React.RefObject<HTMLDivElement>
  speed: number
  brushSize: number
  drawMode: boolean
  activePrefab: PrefabData | null
  setActivePrefab: (p: PrefabData | null) => void
}

export function useLifeGameEngine({
  mountRef,
  speed,
  brushSize,
  drawMode,
  activePrefab,
  setActivePrefab,
}: UseLifeGameEngineProps) {
  // State
  const [gameState, setGameState] = useState<GameState>(GameState.STOPPED)
  const [stats, setStats] = useState<Stats>({ generation: 0, aliveCount: 0, deadCount: 0 })
  const [showGrid, setShowGrid] = useState(true)

  // Engine Instance
  const engineRef = useRef<GameEngine | null>(null)

  // Initialize Engine
  useEffect(() => {
    if (!mountRef.current)
      return

    const engine = new GameEngine(
      newStats => setStats(newStats),
      newState => setGameState(newState),
    )

    engine.init(mountRef.current)
    engineRef.current = engine

    return () => {
      engine.dispose()
      engineRef.current = null
    }
  }, []) // Run once on mount

  // Sync Props
  useEffect(() => {
    engineRef.current?.setSpeed(speed)
  }, [speed])

  useEffect(() => {
    engineRef.current?.setBrushSize(brushSize)
  }, [brushSize])

  useEffect(() => {
    engineRef.current?.setDrawMode(drawMode)
  }, [drawMode])

  // --- INTERACTION ---

  const handlePointer = useCallback((e: React.PointerEvent) => {
    if (!engineRef.current)
      return

    engineRef.current.handlePointerMove(e.clientX, e.clientY)

    if (e.type === 'pointerdown' && e.button === 0) {
      engineRef.current.setPointerDown(true)
    }
    else if (e.type === 'pointerup' || e.type === 'pointerleave') {
      engineRef.current.setPointerDown(false)
    }
  }, [])

  // --- DRAG AND DROP HANDLERS ---

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault() // Allow drop
    if (!activePrefab || !engineRef.current)
      return

    engineRef.current.handleDragOver(e.clientX, e.clientY, activePrefab)
  }, [activePrefab])

  const handleDragLeave = useCallback(() => {
    engineRef.current?.handleDragLeave()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!activePrefab || !engineRef.current)
      return

    engineRef.current.handleDrop(e.clientX, e.clientY, activePrefab)
    setActivePrefab(null)
  }, [activePrefab, setActivePrefab])

  const handleDragStart = useCallback((prefab: PrefabData, e: React.DragEvent) => {
    setActivePrefab(prefab)

    // Create a transparent drag image
    const img = new Image()
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
    e.dataTransfer.setDragImage(img, 0, 0)
    e.dataTransfer.effectAllowed = 'copy'

    // We don't need to manually update preview mesh here as dragOver handles position,
    // but we ensure the texture is ready in the engine via initPrefabTextures
  }, [setActivePrefab])

  // --- UI ACTIONS ---

  const resetGame = useCallback(() => {
    engineRef.current?.reset()
  }, [])

  const clearGame = useCallback(() => {
    engineRef.current?.clear()
  }, [])

  const togglePlay = useCallback(() => {
    engineRef.current?.togglePlay()
  }, [])

  const zoomIn = useCallback(() => {
    engineRef.current?.zoomIn()
  }, [])

  const zoomOut = useCallback(() => {
    engineRef.current?.zoomOut()
  }, [])

  const resetCamera = useCallback(() => {
    engineRef.current?.resetCamera()
  }, [])

  const setSceneDimensions = useCallback((width: number, height: number) => {
    engineRef.current?.setSceneDimensions(width, height)
  }, [])

  const setColors = useCallback((alive: string, dead: string) => {
    engineRef.current?.setColors(alive, dead)
  }, [])

  const toggleGrid = useCallback(() => {
    setShowGrid((prev) => {
      const next = !prev
      engineRef.current?.setGridVisible(next)
      return next
    })
  }, [])

  const setRandomPercentage = useCallback((percentage: number) => {
    engineRef.current?.setRandomPercentage(percentage)
  }, [])

  return {
    stats,
    gameState,
    togglePlay,
    resetGame,
    clearGame,
    handlePointer,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragStart,
    zoomIn,
    zoomOut,
    resetCamera,
    setSceneDimensions,
    setColors,
    setRandomPercentage,
    showGrid,
    toggleGrid,
  }
}
