import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Game of Life',
    short_name: 'game-of-life',
    description: 'Interactive Cellular Automaton Simulation',
    start_url: '/',
    display: 'standalone',
    background_color: '#09090b',
    theme_color: '#2dd4bf',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  }
}
