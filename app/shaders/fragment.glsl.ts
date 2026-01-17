export const SIMULATION_FRAGMENT_SHADER = `
  uniform sampler2D tSource;
  uniform vec2 uResolution;
  uniform vec2 uMouse;
  uniform float uBrushSize;
  uniform bool uIsDrawing;
  uniform float uSeed;
  uniform bool uSimulate;

  // Stamping Uniforms
  uniform bool uIsStamping;
  uniform sampler2D uStampTexture;
  uniform vec2 uStampUV;
  uniform vec2 uStampSize; // (width/res, height/res)

  varying vec2 vUv;

  float get(float x, float y) {
      return texture2D(tSource, vUv + vec2(x, y) / uResolution).r;
  }

  void main() {
      // 1. Stamping (Single Frame Operation)
      if (uIsStamping) {
          // Calculate UV relative to the stamp box
          // Box is centered at uStampUV, size uStampSize
          vec2 boxMin = uStampUV - uStampSize * 0.5;
          vec2 boxMax = uStampUV + uStampSize * 0.5;
          
          // Check if current pixel is inside the stamp box
          if (vUv.x >= boxMin.x && vUv.x < boxMax.x && vUv.y >= boxMin.y && vUv.y < boxMax.y) {
              // Map vUv to stamp texture UV (0..1)
              // vUv = boxMin -> 0
              // vUv = boxMax -> 1
              vec2 stampLocalUV = (vUv - boxMin) / uStampSize;
              
              // Flip Y for texture coordinate system match if needed (GL coords vs texture)
              // stampLocalUV.y = 1.0 - stampLocalUV.y; 
              
              float stampVal = texture2D(uStampTexture, stampLocalUV).r;
              if (stampVal > 0.5) {
                  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
                  return;
              }
          }
      }

      // 2. Drawing / Interaction (Brush)
      if (uIsDrawing) {
          float aspect = uResolution.x / uResolution.y;
          vec2 diff = vUv - uMouse;
          diff.x *= aspect;
          float dist = length(diff);
          if (dist < uBrushSize) {
              gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
              return;
          }
      }

      // 3. Game of Life Logic
      float current = get(0.0, 0.0);
      float next = current;

      if (uSimulate) {
          // Neighbors
          float sum = 
              get(-1.0, -1.0) + get(0.0, -1.0) + get(1.0, -1.0) +
              get(-1.0,  0.0) +                  get(1.0,  0.0) +
              get(-1.0,  1.0) + get(0.0,  1.0) + get(1.0,  1.0);

          if (current > 0.5) {
              // Alive
              if (sum < 1.9 || sum > 3.1) next = 0.0; // Die
          } else {
              // Dead
              if (sum > 2.9 && sum < 3.1) next = 1.0; // Reproduce
          }
      }

      gl_FragColor = vec4(next, 0.0, 0.0, 1.0);
  }
`

export const RENDER_FRAGMENT_SHADER = `
  uniform sampler2D tMap;
  uniform vec3 uColorAlive;
  uniform vec3 uColorDead;
  uniform vec2 uResolution;
  uniform float uGridVisible;
  varying vec2 vUv;

  void main() {
      float state = texture2D(tMap, vUv).r;
      vec3 color = mix(uColorDead, uColorAlive, state);

      if (uGridVisible > 0.5) {
          vec2 grid = abs(fract(vUv * uResolution - 0.5) - 0.5) / fwidth(vUv * uResolution);
          float line = min(grid.x, grid.y);
          float gridVal = 1.0 - min(line, 1.0);
          color = mix(color, uColorDead * 0.5, gridVal * 0.4);
      }

      gl_FragColor = vec4(color, 1.0);
  }
`
