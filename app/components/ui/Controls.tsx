import { MousePointer2, Pause, Play, Shuffle, Trash2 } from 'lucide-react'
import React from 'react'
import { GameState } from '../../types'

interface ControlsProps {
  gameState: GameState
  togglePlay: () => void
  clearGame: () => void
  resetGame: () => void
  drawMode: boolean
  setDrawMode: (mode: boolean) => void
  brushSize: number
  setBrushSize: (size: number) => void
  speed: number
  setSpeed: (speed: number) => void
}

export const Controls: React.FC<ControlsProps> = ({
  gameState,
  togglePlay,
  clearGame,
  resetGame,
  drawMode,
  setDrawMode,
  brushSize,
  setBrushSize,
  speed,
  setSpeed,
}) => {
  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/80 backdrop-blur-xl p-3 px-6 rounded-2xl border border-white/10 shadow-2xl z-10">

      <button
        onClick={togglePlay}
        className={`p-4 rounded-full transition-all duration-300 ${gameState === GameState.RUNNING
          ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 ring-1 ring-red-500/50'
          : 'bg-green-500/20 text-green-400 hover:bg-green-500/30 ring-1 ring-green-500/50'
        }`}
      >
        {gameState === GameState.RUNNING ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
      </button>

      <div className="w-px h-10 bg-white/10 mx-2"></div>

      <button onClick={clearGame} className="group flex flex-col items-center gap-1 text-gray-400 hover:text-white transition-colors">
        <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
          <Trash2 size={20} />
        </div>
        <span className="text-[10px] uppercase tracking-wider font-semibold">Clear</span>
      </button>

      <button onClick={resetGame} className="group flex flex-col items-center gap-1 text-gray-400 hover:text-white transition-colors">
        <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
          <Shuffle size={20} />
        </div>
        <span className="text-[10px] uppercase tracking-wider font-semibold">Random</span>
      </button>

      <div className="w-px h-10 bg-white/10 mx-2"></div>

      <button
        onClick={() => setDrawMode(!drawMode)}
        className={`flex flex-col items-center gap-1 transition-colors ${drawMode ? 'text-teal-400' : 'text-gray-500'}`}
      >
        <div className={`p-2 rounded-lg transition-colors ${drawMode ? 'bg-teal-500/20 ring-1 ring-teal-500/40' : 'bg-white/5'}`}>
          <MousePointer2 size={20} />
        </div>
        <span className="text-[10px] uppercase tracking-wider font-semibold">Brush</span>
      </button>

      {/* Brush Size */}
      <div className="flex flex-col gap-1 w-24">
        <div className="flex justify-between text-[10px] uppercase tracking-wider font-semibold text-gray-400">
          <span>Size</span>
        </div>
        <input
          type="range"
          min="0.001"
          max="0.05"
          step="0.001"
          value={brushSize}
          onChange={e => setBrushSize(Number.parseFloat(e.target.value))}
          className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-teal-500 hover:accent-teal-400"
        />
      </div>

      <div className="w-px h-10 bg-white/10 mx-2"></div>

      {/* Speed Control */}
      <div className="flex flex-col gap-1 w-24">
        <div className="flex justify-between text-[10px] uppercase tracking-wider font-semibold text-gray-400">
          <span>Speed</span>
        </div>
        <input
          type="range"
          min="1"
          max="60"
          step="1"
          value={speed}
          onChange={e => setSpeed(Number.parseInt(e.target.value))}
          className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-teal-500 hover:accent-teal-400"
        />
      </div>

    </div>
  )
}
