import type { Metadata } from 'next'
import { ThemeProvider } from './components/theme-provider'
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
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
