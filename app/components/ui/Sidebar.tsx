import type { PrefabData } from '../../constants'
import {
  Activity,
  Cpu,
  Dices,
  Grid3X3,
  LayoutTemplate,
  Palette,
  PanelRightClose,
  PanelRightOpen,
} from 'lucide-react'
import React from 'react'
import { cn } from '@/lib/utils'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './accordion'
import { Button } from './button'
import { Label } from './label'
import { ScrollArea } from './scroll-area'
import { Slider } from './slider'
import { Switch } from './switch'

interface SidebarProps {
  prefabs: PrefabData[]
  onDragStart: (prefab: PrefabData, e: React.DragEvent) => void
  className?: string
  isOpen: boolean
  onToggle: () => void

  // Controls
  speed: number
  setSpeed: (v: number) => void
  sceneWidth: number
  setSceneWidth: (v: number) => void
  sceneHeight: number
  setSceneHeight: (v: number) => void
  aliveColor: string
  setAliveColor: (c: string) => void
  deadColor: string
  setDeadColor: (c: string) => void
  randomPercentage: number
  setRandomPercentage: (v: number) => void
  showGrid: boolean
  toggleGrid: () => void
  showStats: boolean
  toggleStats: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({
  prefabs,
  onDragStart,
  className = '',
  isOpen,
  onToggle,
  speed,
  setSpeed,
  sceneWidth,
  setSceneWidth,
  sceneHeight,
  setSceneHeight,
  aliveColor,
  setAliveColor,
  deadColor,
  setDeadColor,
  randomPercentage,
  setRandomPercentage,
  showGrid,
  toggleGrid,
  showStats,
  toggleStats,
}) => {
  if (!isOpen) {
    return (
      <div className={cn('relative h-full border-l bg-background/95 backdrop-blur-sm transition-all duration-300 w-0 border-none', className)}>
        <Button
          variant="secondary"
          size="icon"
          className="absolute -left-10 top-4 z-50 rounded-r-none border-r-0 shadow-md bg-background/80 backdrop-blur-md"
          onClick={onToggle}
        >
          <PanelRightOpen className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className={cn('relative flex h-full w-80 flex-col border-l bg-card/50 backdrop-blur-xl transition-all duration-300', className)}>
      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-4 z-50 h-8 w-8 text-muted-foreground hover:text-foreground"
        onClick={onToggle}
      >
        <PanelRightClose className="h-4 w-4" />
      </Button>

      {/* Header */}
      <div className="flex flex-col gap-4 p-6 pb-2">
        <div>
          <h1 className="text-xl font-bold text-foreground">
            Game of Life
          </h1>
          <p className="text-xs text-muted-foreground">Conway's Game of Life</p>
        </div>
      </div>

      <ScrollArea className="flex-1 px-4">
        <div className="flex flex-col gap-6 py-4">

          <Accordion type="multiple" defaultValue={['params', 'layouts', 'actions']} className="w-full">

            {/* Parameters */}
            <AccordionItem value="params" className="border-border/50">
              <AccordionTrigger className="text-sm hover:no-underline py-3">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-teal-500" />
                  <span>Parameters</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-6 pt-2">
                {/* Speed */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label className="text-xs">Simulation Speed</Label>
                    <span className="text-xs text-muted-foreground">
                      {speed}
                      {' '}
                      gen/s
                    </span>
                  </div>
                  <Slider
                    value={[speed]}
                    min={1}
                    max={60}
                    step={1}
                    onValueChange={([v]) => setSpeed(v)}
                    className="py-1"
                  />
                </div>

                {/* Random Percentage */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label className="text-xs flex items-center gap-2">
                      <Dices className="h-3 w-3" />
                      {' '}
                      Random Fill
                    </Label>
                    <span className="text-xs text-muted-foreground">
                      {(randomPercentage * 100).toFixed(0)}
                      %
                    </span>
                  </div>
                  <Slider
                    value={[randomPercentage]}
                    min={0}
                    max={0.5}
                    step={0.01}
                    onValueChange={([v]) => setRandomPercentage(v)}
                    className="py-1"
                  />
                </div>

                {/* Grid Size */}
                <div className="space-y-4">
                  <Label className="text-xs">Scene Dimensions</Label>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[10px] text-muted-foreground">Width</span>
                      <span className="text-[10px] font-mono">{sceneWidth}</span>
                    </div>
                    <Slider
                      value={[sceneWidth]}
                      min={128}
                      max={2048}
                      step={128}
                      onValueChange={([v]) => setSceneWidth(v)}
                      className="py-1"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[10px] text-muted-foreground">Height</span>
                      <span className="text-[10px] font-mono">{sceneHeight}</span>
                    </div>
                    <Slider
                      value={[sceneHeight]}
                      min={128}
                      max={2048}
                      step={128}
                      onValueChange={([v]) => setSceneHeight(v)}
                      className="py-1"
                    />
                  </div>
                </div>
                {/* Colors */}
                <div className="space-y-3 pt-2">
                  <Label className="text-xs flex items-center gap-2">
                    <Palette className="h-3 w-3" />
                    {' '}
                    Colors
                  </Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] text-muted-foreground block">Alive</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={aliveColor}
                          onChange={e => setAliveColor(e.target.value)}
                          className="h-6 w-8 rounded cursor-pointer border-none bg-transparent p-0"
                        />
                        <span className="text-[10px] font-mono text-muted-foreground">{aliveColor}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-muted-foreground block">Dead</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={deadColor}
                          onChange={e => setDeadColor(e.target.value)}
                          className="h-6 w-8 rounded cursor-pointer border-none bg-transparent p-0"
                        />
                        <span className="text-[10px] font-mono text-muted-foreground">{deadColor}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Toggles */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground flex items-center gap-2">
                      <Grid3X3 className="h-3 w-3" />
                      {' '}
                      Show Grid
                    </Label>
                    <Switch checked={showGrid} onCheckedChange={toggleGrid} className="scale-75" />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground flex items-center gap-2">
                      <Activity className="h-3 w-3" />
                      {' '}
                      Show Statistics
                    </Label>
                    <Switch checked={showStats} onCheckedChange={toggleStats} className="scale-75" />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Layouts */}
            <AccordionItem value="layouts" className="border-none">
              <AccordionTrigger className="text-sm hover:no-underline py-3">
                <div className="flex items-center gap-2">
                  <LayoutTemplate className="h-4 w-4 text-teal-500" />
                  <span>Default Layouts</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2">
                {' '}
                <div className="grid grid-cols-2 gap-2">
                  {prefabs.map(prefab => (
                    <div
                      key={prefab.name}
                      draggable
                      onDragStart={e => onDragStart(prefab, e)}
                      className="group relative flex aspect-square flex-col overflow-hidden rounded-md border border-border/50 bg-secondary/10 hover:border-teal-500/50 hover:bg-secondary/20 transition-all cursor-grab active:cursor-grabbing"
                    >
                      <div className="flex-1 flex items-center justify-center p-2 opacity-70 group-hover:opacity-100">
                        <div
                          className="grid gap-[1px]"
                          style={{
                            gridTemplateColumns: `repeat(${prefab.width}, 1fr)`,
                            width: '70%',
                            aspectRatio: `${prefab.width}/${prefab.height}`,
                          }}
                        >
                          {prefab.data.map((cell, i) => (
                            <div
                              key={i}
                              className={`${cell ? 'bg-teal-400' : 'bg-muted/20'} w-full h-full rounded-[0.5px]`}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="p-1.5 bg-background/50 backdrop-blur-sm border-t border-border/10 text-center">
                        <span className="block text-[10px] font-medium truncate">{prefab.name}</span>
                      </div>
                    </div>
                  ))}
                  {' '}

                </div>
                {' '}

              </AccordionContent>
            </AccordionItem>

          </Accordion>
        </div>
      </ScrollArea>

      {/* Footer Info */}
      <div className="p-4 border-t border-border/50 bg-muted/5">
        <div className="text-[10px] text-muted-foreground leading-relaxed">
          <strong className="text-teal-500">Game of Life</strong>
          {' '}
          is a cellular automaton devised by John Horton Conway. Cells live or die based on their neighbors.
        </div>
      </div>

    </div>
  )
}
