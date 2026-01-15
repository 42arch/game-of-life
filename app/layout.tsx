import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Game of Life - Three.js WebGPU',
  description: 'Game of Life implemented with Three.js TSL and WebGPU',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
