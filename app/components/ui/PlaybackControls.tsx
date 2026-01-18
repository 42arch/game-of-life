import { Eraser, MousePointer2, Pause, Play, Shuffle } from 'lucide-react'
import React from 'react'
import { cn } from '@/lib/utils'
import { Button } from './button'
import { Separator } from './separator'

interface PlaybackControlsProps {
  isRunning: boolean
  onTogglePlay: () => void
  onClear: () => void
  onRandom: () => void
  drawMode: boolean
  onToggleDrawMode: () => void
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isRunning,
  onTogglePlay,
  onClear,
  onRandom,
  drawMode,
  onToggleDrawMode,
}) => {
  return (
    <div className="flex items-center gap-2 rounded-full bg-black/80 p-2 px-4 backdrop-blur-md border border-white/10 shadow-2xl">
      {/* Play/Pause - Left */}
      <Button
        variant="default"
        size="icon"
        className={cn(
          'h-10 w-10 rounded-full transition-all',
          isRunning
            ? 'bg-red-500 hover:bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]'
            : 'bg-teal-500 hover:bg-teal-600 text-white shadow-[0_0_15px_rgba(45,212,191,0.5)]',
        )}
        onClick={onTogglePlay}
      >
        {isRunning ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current ml-1" />}
      </Button>

      <Separator orientation="vertical" className="h-8 mx-2 bg-white/20" />

      {/* Right Controls */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full text-gray-400 hover:text-white hover:bg-white/10"
          onClick={onClear}
          title="Clear Board"
        >
          <Eraser className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full text-gray-400 hover:text-white hover:bg-white/10"
          onClick={onRandom}
          title="Randomize"
        >
          <Shuffle className="h-4 w-4" />
        </Button>

        <Button
          variant={drawMode ? 'secondary' : 'ghost'}
          size="icon"
          className={cn(
            'h-9 w-9 rounded-full transition-colors',
            drawMode
              ? 'bg-teal-500/20 text-teal-400 hover:bg-teal-500/30 border border-teal-500/50'
              : 'text-gray-400 hover:text-white hover:bg-white/10',
          )}
          onClick={onToggleDrawMode}
          title={drawMode ? 'Draw Mode On' : 'Draw Mode Off'}
        >
          <MousePointer2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
