export const TEXTURE_SIZE = 512 // 512x512 = ~260k cells

export const COLOR_ALIVE = new Float32Array([0.17, 0.83, 0.75]) // Teal-400
export const COLOR_DEAD = new Float32Array([0.02, 0.02, 0.02]) // Dark Grey (normalized 0-1)

// Three.js constants
export const NEAR_PLANE = 0.1
export const FAR_PLANE = 1000

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://game-of-life.starllow.com' // Placeholder URL

export interface PrefabData {

  name: string

  category: 'Still Lifes' | 'Oscillators' | 'Spaceships' | 'Guns'

  width: number

  height: number

  data: number[] // Flat array row-by-row

}
