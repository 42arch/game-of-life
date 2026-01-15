import type { PrefabData } from '../../constants'
import { Grid3X3, Settings } from 'lucide-react'
import React from 'react'

interface SidebarProps {
  prefabs: PrefabData[]
  generation: number
  onDragStart: (prefab: PrefabData, e: React.DragEvent) => void
  onOpenSettings: () => void
  className?: string
}

export const Sidebar: React.FC<SidebarProps> = ({ prefabs, generation, onDragStart, onOpenSettings, className = '' }) => {
  return (
    <div className={`w-80 bg-black/95 border-l border-white/10 flex flex-col h-full shrink-0 z-20 ${className}`}>
      {/* Header Section: Logo & Stats */}
      <div className="p-6 border-b border-white/10 bg-linear-to-b from-white/5 to-transparent">
        <div className="flex justify-between items-end mb-5">
          <div>
            <span className="text-[10px] text-white/50 tracking-[0.2em] font-medium block mb-1">
              CONWAY'S
            </span>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-teal-400 to-green-500 drop-shadow-md">
              Game of Life
            </h1>
          </div>
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            title="Settings"
          >
            <Settings size={20} />
          </button>
        </div>

        <div className="bg-black/40 backdrop-blur-sm p-3 rounded-lg border border-white/5 space-y-1.5 shadow-inner">
          <div className="flex justify-between text-sm items-center">
            <span className="text-gray-400 font-medium">Generation</span>
            <span className="font-mono text-teal-300 text-base">{generation}</span>
          </div>
          <div className="flex justify-between text-sm items-center">
            <span className="text-gray-400 font-medium">Cells</span>
            <span className="font-mono text-gray-500 text-xs">~1,000,000</span>
          </div>
        </div>
      </div>

      {/* Patterns Header */}
      <div className="p-4 py-3 bg-white/5 font-semibold text-gray-200 text-sm flex items-center gap-2 border-b border-white/5">
        <Grid3X3 size={16} className="text-teal-400" />
        <span>Library</span>
        <span className="text-xs text-gray-600 font-normal ml-auto">
          {prefabs.length}
          {' '}
          items
        </span>
      </div>

      {/* Pattern Grid */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div className="grid grid-cols-2 gap-3">
          {prefabs.map(prefab => (
            <div
              key={prefab.name}
              draggable
              onDragStart={e => onDragStart(prefab, e)}
              className="group relative flex flex-col bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 hover:border-teal-500/50 cursor-grab active:cursor-grabbing transition-all hover:shadow-lg hover:shadow-teal-500/5 overflow-hidden aspect-square"
            >
              {/* Pattern Preview - Centered */}
              <div className="flex-1 flex items-center justify-center p-2 bg-black/20">
                <div
                  className="grid gap-[1px]"
                  style={{
                    gridTemplateColumns: `repeat(${prefab.width}, 1fr)`,
                    width: '80%',
                    maxWidth: '64px', // Limit max size
                    aspectRatio: `${prefab.width}/${prefab.height}`,
                  }}
                >
                  {prefab.data.map((cell, i) => (
                    <div
                      key={i}
                      className={`${cell ? 'bg-teal-400 shadow-[0_0_4px_rgba(45,212,191,0.5)]' : 'bg-white/5'} w-full h-full rounded-[0.5px]`}
                    />
                  ))}
                </div>
              </div>

              {/* Pattern Info Footer */}
              <div className="p-2 bg-white/5 border-t border-white/5 flex flex-col items-center">
                <span className="font-medium text-xs text-gray-300 group-hover:text-teal-300 truncate w-full text-center">{prefab.name}</span>
                <span className="text-[10px] text-gray-600 font-mono scale-90">
                  {prefab.width}
                  ×
                  {prefab.height}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Hints */}
      <div className="p-3 border-t border-white/10 bg-white/5 text-[10px] text-gray-500 text-center">
        Tip: Drag patterns or check settings for controls.
      </div>
    </div>
  )
}
