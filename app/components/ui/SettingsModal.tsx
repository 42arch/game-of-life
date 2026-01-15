import { Grid3X3, Info, MousePointer2, Move, Settings, X } from 'lucide-react'
import React, { useState } from 'react'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  currentSize: number
  onSizeChange: (size: number) => void
  onColorsChange: (alive: string, dead: string) => void
}

// Helper to convert normalized Float32 array or hex to hex string for input type="color"
// Assuming current simple implementation uses hex strings from input to pass back
// But constants are Float32Array. We need conversion if we want to show initial values correctly.
// For simplicity in this step, I'll use default hex values that match the constants approx.
const DEFAULT_ALIVE_HEX = '#00ff87' // Neon Green
const DEFAULT_DEAD_HEX = '#050505' // Dark Grey

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentSize,
  onSizeChange,
  onColorsChange,
}) => {
  const [aliveColor, setAliveColor] = useState(DEFAULT_ALIVE_HEX)
  const [deadColor, setDeadColor] = useState(DEFAULT_DEAD_HEX)

  if (!isOpen)
    return null

  const handleAliveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setAliveColor(val)
    onColorsChange(val, deadColor)
  }

  const handleDeadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setDeadColor(val)
    onColorsChange(aliveColor, val)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white/5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Settings className="text-teal-400" />
          Settings
        </h2>

        <div className="space-y-6">
          {/* Grid Size */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 block">Grid Size (Resolution)</label>
            <div className="grid grid-cols-4 gap-2">
              {[512, 1024, 2048, 4096].map(size => (
                <button
                  key={size}
                  onClick={() => onSizeChange(size)}
                  className={`py-2 px-3 rounded-lg text-sm font-mono border transition-all ${
                    currentSize === size
                      ? 'bg-teal-500/20 border-teal-500 text-teal-300'
                      : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {size}
                  x
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Higher resolutions require more GPU power.
            </p>
          </div>

          <div className="h-px bg-white/10" />

          {/* Colors */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 block">Cell Colors</label>
            <div className="flex gap-4">
              <div className="flex-1 space-y-1">
                <span className="text-xs text-gray-500">Alive</span>
                <div className="flex items-center gap-2 bg-white/5 p-2 rounded-lg border border-white/5">
                  <input
                    type="color"
                    value={aliveColor}
                    onChange={handleAliveChange}
                    className="w-8 h-8 rounded cursor-pointer bg-transparent border-none p-0"
                  />
                  <span className="text-xs font-mono text-gray-300">{aliveColor}</span>
                </div>
              </div>
              <div className="flex-1 space-y-1">
                <span className="text-xs text-gray-500">Dead</span>
                <div className="flex items-center gap-2 bg-white/5 p-2 rounded-lg border border-white/5">
                  <input
                    type="color"
                    value={deadColor}
                    onChange={handleDeadChange}
                    className="w-8 h-8 rounded cursor-pointer bg-transparent border-none p-0"
                  />
                  <span className="text-xs font-mono text-gray-300">{deadColor}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="h-px bg-white/10" />

          {/* Controls Instructions */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Info size={16} />
              Controls
            </h3>
            <div className="space-y-2 text-sm text-gray-400 bg-white/5 p-4 rounded-xl border border-white/5">
              <div className="flex items-center gap-3">
                <Grid3X3 size={16} className="text-teal-400" />
                <span>Drag patterns to scene</span>
              </div>
              <div className="flex items-center gap-3">
                <MousePointer2 size={16} className="text-teal-400" />
                <span>Left Click to paint</span>
              </div>
              <div className="flex items-center gap-3">
                <Move size={16} className="text-teal-400" />
                <span>Scroll / Drag to zoom & pan</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
