'use client'

import type { PrefabData } from '../constants'
import { useTheme } from 'next-themes'
import React, { useEffect, useRef, useState } from 'react'
import { TEXTURE_SIZE } from '../constants'
import { useLifeGameEngine } from '../hooks/useLifeGameEngine'
import { PREFABS } from '../prefabs'
import { PlaybackControls } from './ui/PlaybackControls'
import { Sidebar } from './ui/Sidebar'
import { StatsCard } from './ui/StatsCard'
import { ViewControls } from './ui/ViewControls'

const LifeGame2D: React.FC = () => {
  const { theme } = useTheme()
  const mountRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // UI State
  const [speed, setSpeed] = useState<number>(4)
  const [brushSize, setBrushSize] = useState<number>(2)
  const [drawMode, setDrawMode] = useState<boolean>(false)
  const [activePrefab, setActivePrefab] = useState<PrefabData | null>(null)

  // Settings State
  const [sceneWidth, setSceneWidth] = useState<number>(TEXTURE_SIZE)
  const [sceneHeight, setSceneHeight] = useState<number>(TEXTURE_SIZE)
  const [aliveColor, setAliveColor] = useState('#2dd4bf') // Teal-400
  const [deadColor, setDeadColor] = useState('#050505')
  const [randomPercentage, setRandomPercentageState] = useState<number>(0.2)
  const [showStats, setShowStats] = useState(true)
  const [showZoomControls, setShowZoomControls] = useState(true)

  // Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

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
    setSceneDimensions,
    setColors,
    setRandomPercentage,
    setBackgroundColor,
    showGrid,
    toggleGrid,
  } = useLifeGameEngine({
    mountRef,
    speed,
    brushSize: (brushSize / 2.0) / sceneHeight,
    drawMode,
    activePrefab,
    setActivePrefab,
  })

  // Theme Sync
  useEffect(() => {
    if (!theme)
      return
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

    // Update Canvas Background
    const bg = isDark ? '#050505' : '#ffffff'
    setBackgroundColor(bg)

    // Update Dead Color to match BG if it hasn't been manually changed significantly?
    // For simplicity, let's just reset colors to defaults on theme switch,
    // OR we can leave it to the user. The prompt says "implement switch", implying it should switch appearance.
    const newDead = isDark ? '#050505' : '#ffffff'
    const newAlive = isDark ? '#2dd4bf' : '#0d9488' // Teal-400 vs Teal-600

    setDeadColor(newDead)
    setAliveColor(newAlive)
    setColors(newAlive, newDead)
  }, [theme, setBackgroundColor, setColors])

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

  const handleWidthChange = (val: number) => {
    setSceneWidth(val)
    setSceneDimensions(val, sceneHeight)
  }

  const handleHeightChange = (val: number) => {
    setSceneHeight(val)
    setSceneDimensions(sceneWidth, val)
  }

  const handleColorChange = (alive: string, dead: string) => {
    setAliveColor(alive)
    setDeadColor(dead)
    setColors(alive, dead)
  }

  const handleRandomPercentageChange = (val: number) => {
    setRandomPercentageState(val)
    setRandomPercentage(val)
  }

  const isRunning = gameState === 1 // GameState.RUNNING

  return (
    <div className="relative w-full h-full font-sans text-foreground flex overflow-hidden bg-background">

      {/* Canvas Container */}
      <div
        ref={containerRef}
        className="relative flex-grow h-full overflow-hidden bg-black/90"
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

        {/* Floating Playback Controls - Bottom Center */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
          <PlaybackControls
            isRunning={isRunning}
            onTogglePlay={togglePlay}
            onClear={clearGame}
            onRandom={resetGame}
            drawMode={drawMode}
            onToggleDrawMode={() => setDrawMode(!drawMode)}
            speed={speed}
            onSpeedChange={setSpeed}
          />
        </div>

        {/* View Controls - Bottom Right */}
        {showZoomControls && (
          <div className="absolute bottom-8 right-8 z-10">
            <ViewControls
              onZoomIn={zoomIn}
              onZoomOut={zoomOut}
              onResetCamera={resetCamera}
              onFullscreen={toggleFullscreen}
            />
          </div>
        )}

        {/* Stats Card - Top Right */}
        {showStats && (
          <div className="absolute top-4 left-4 z-10">
            <StatsCard
              generation={stats.generation}
              aliveCount={stats.aliveCount}
              deadCount={stats.deadCount}
            />
          </div>
        )}
      </div>

      {/* Sidebar - Right Side */}
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        prefabs={PREFABS}
        onDragStart={handleDragStart}

        // Controls
        speed={speed}
        setSpeed={setSpeed}
        brushSize={brushSize}
        setBrushSize={setBrushSize}
        sceneWidth={sceneWidth}
        setSceneWidth={handleWidthChange}
        sceneHeight={sceneHeight}
        setSceneHeight={handleHeightChange}
        aliveColor={aliveColor}
        setAliveColor={c => handleColorChange(c, deadColor)}
        deadColor={deadColor}
        setDeadColor={c => handleColorChange(aliveColor, c)}
        randomPercentage={randomPercentage}
        setRandomPercentage={handleRandomPercentageChange}
        showGrid={showGrid}
        toggleGrid={toggleGrid}
        showStats={showStats}
        toggleStats={() => setShowStats(!showStats)}
        showZoomControls={showZoomControls}
        toggleZoomControls={() => setShowZoomControls(!showZoomControls)}

        // Actions
      />
    </div>
  )
}

export default LifeGame2D
