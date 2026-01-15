'use client'

import type { PrefabData } from '../constants'
import { Menu, X } from 'lucide-react'
import React, { useRef, useState } from 'react'
import { PREFABS, TEXTURE_SIZE } from '../constants'
import { useLifeGameEngine } from '../hooks/useLifeGameEngine'
import { Controls } from './ui/Controls'
import { SettingsModal } from './ui/SettingsModal'
import { Sidebar } from './ui/Sidebar'
import { ViewControls } from './ui/ViewControls'

const LifeGame2D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // UI State
  const [speed, setSpeed] = useState<number>(30)
  const [brushSize, setBrushSize] = useState<number>(0.01)
  const [drawMode, setDrawMode] = useState<boolean>(true)
  const [activePrefab, setActivePrefab] = useState<PrefabData | null>(null)

  // Settings State
  const [gridSize, setGridSizeState] = useState<number>(TEXTURE_SIZE)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  // Responsive State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const {
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
    setGridSize,
    setColors,
  } = useLifeGameEngine({
    mountRef,
    speed,
    brushSize,
    drawMode,
    activePrefab,
    setActivePrefab,
  })

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen mode: ${err.message} (${err.name})`)
      })
    }
    else {
      document.exitFullscreen()
    }
  }

  const handleSizeChange = (size: number) => {
    setGridSizeState(size)
    setGridSize(size)
  }

  return (
    <div className="relative w-full h-full font-sans text-gray-200 flex flex-col md:flex-row overflow-hidden bg-black">

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentSize={gridSize}
        onSizeChange={handleSizeChange}
        onColorsChange={setColors}
      />

      {/* Mobile Header Logo (Visible only on mobile) */}
      <div className="md:hidden absolute top-6 left-6 pointer-events-none select-none z-10">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-green-500 drop-shadow-md">
          LIFE.GL
        </h1>
      </div>

      {/* Mobile Sidebar Toggle */}
      <div className="md:hidden absolute top-4 right-4 z-50">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-lg text-white shadow-lg hover:bg-white/10 transition-colors"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Canvas Container */}
      <div
        ref={containerRef}
        className="relative flex-grow h-full overflow-hidden bg-black"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onDragLeave={handleDragLeave}
      >
        <div
          ref={mountRef}
          className="w-full h-full cursor-crosshair touch-none"
          onPointerMove={handlePointer}
          onPointerDown={handlePointer}
          onPointerUp={handlePointer}
          onPointerLeave={handlePointer}
        />

        {/* Main Controls - Bottom Center */}
        <Controls
          gameState={gameState}
          togglePlay={togglePlay}
          clearGame={clearGame}
          resetGame={resetGame}
          drawMode={drawMode}
          setDrawMode={setDrawMode}
          brushSize={brushSize}
          setBrushSize={setBrushSize}
          speed={speed}
          setSpeed={setSpeed}
        />

        {/* View Controls - Bottom Right */}
        <div className="absolute bottom-8 right-8 z-10">
          <ViewControls
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            onResetCamera={resetCamera}
            onFullscreen={toggleFullscreen}
          />
        </div>
      </div>

      {/* Sidebar - Responsive Wrapper */}
      <div className={`
        fixed inset-y-0 right-0 z-40 h-full shadow-2xl md:shadow-none
        transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
      `}
      >
        <Sidebar
          prefabs={PREFABS}
          onDragStart={handleDragStart}
          generation={stats.generation}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-[2px]"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  )
}

export default LifeGame2D
