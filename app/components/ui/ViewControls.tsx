import { Grid, Maximize, Minus, Plus, RotateCcw } from 'lucide-react'
import React from 'react'

interface ViewControlsProps {
  onZoomIn: () => void
  onZoomOut: () => void
  onResetCamera: () => void
  onFullscreen: () => void
  onToggleGrid: () => void
  showGrid: boolean
}

export const ViewControls: React.FC<ViewControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onResetCamera,
  onFullscreen,
  onToggleGrid,
  showGrid,
}) => {
  return (
    <div className="flex flex-col gap-2 bg-black/80 backdrop-blur-xl p-2 rounded-xl border border-white/10 shadow-2xl">
      <button
        onClick={onZoomIn}
        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
        title="Zoom In"
      >
        <Plus size={20} />
      </button>
      <button
        onClick={onZoomOut}
        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
        title="Zoom Out"
      >
        <Minus size={20} />
      </button>
      <button
        onClick={onResetCamera}
        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
        title="Reset View"
      >
        <RotateCcw size={20} />
      </button>
      <div className="h-px w-full bg-white/10 my-0.5"></div>
      <button
        onClick={onToggleGrid}
        className={`p-2 rounded-lg transition-colors ${showGrid ? 'bg-teal-500/20 text-teal-400' : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white'}`}
        title="Toggle Grid"
      >
        <Grid size={20} />
      </button>
      <div className="h-px w-full bg-white/10 my-0.5"></div>
      <button
        onClick={onFullscreen}
        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
        title="Fullscreen"
      >
        <Maximize size={20} />
      </button>
    </div>
  )
}
