import type { PrefabData } from '../../constants'
import {
  Activity,
  Brush,
  Cpu,
  Dices,
  Github,
  Grid3X3,
  Languages,
  LayoutTemplate,
  Moon,
  Palette,
  PanelRightClose,
  PanelRightOpen,
  Ruler,
  Scan,
  Settings,
  Sun,
  Zap,
} from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'
import React from 'react'
import { usePathname, useRouter } from '@/i18n/routing'
import { cn } from '@/lib/utils'
import { RulesDialog } from '../RulesDialog'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './accordion'
import { Button } from './button'
import { HoverCard, HoverCardContent, HoverCardTrigger } from './hover-card'
import { Label } from './label'
import { ScrollArea } from './scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'
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
  brushSize: number
  setBrushSize: (v: number) => void
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
  showZoomControls: boolean
  toggleZoomControls: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({
  prefabs,
  onDragStart,
  className = '',
  isOpen,
  onToggle,
  speed,
  setSpeed,
  brushSize,
  setBrushSize,
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
  showZoomControls,
  toggleZoomControls,
}) => {
  const { theme, setTheme } = useTheme()
  const t = useTranslations('Sidebar')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const handleLanguageChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale })
  }

  const groupedPrefabs = React.useMemo(() => {
    const groups: Record<string, PrefabData[]> = {}
    prefabs.forEach((prefab) => {
      const category = prefab.category || 'Others'
      if (!groups[category])
        groups[category] = []
      groups[category].push(prefab)
    })
    return groups
  }, [prefabs])

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
        <div className="flex items-center gap-3">
          {/* Logo - 3x3 Glider Pattern */}
          <div className="grid grid-cols-3 gap-0.5 p-1 bg-primary/10 rounded-md border border-primary/20 shrink-0">
            {[0, 1, 0, 0, 0, 1, 1, 1, 1].map((cell, i) => (
              <div
                key={i}
                className={cn(
                  'w-1.5 h-1.5 rounded-sm transition-colors duration-500',
                  cell ? 'bg-primary shadow-[0_0_4px_rgba(45,212,191,0.5)]' : 'bg-muted/20',
                )}
              />
            ))}
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground leading-none">
              Game of Life
            </h1>
            <p className="text-[10px] text-muted-foreground mt-1 opacity-80">Conway's Game of Life</p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 px-4">
        <div className="flex flex-col gap-6 py-4">

          <Accordion type="multiple" defaultValue={['layouts', 'params', 'settings']} className="w-full">

            {/* Layouts */}
            <AccordionItem value="layouts" className="border-border/50">
              <AccordionTrigger className="text-sm hover:no-underline py-3">
                <div className="flex items-center gap-2">
                  <LayoutTemplate className="h-4 w-4 text-teal-500" />
                  <span>{t('layouts')}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2 px-2">
                <p className="text-[10px] text-muted-foreground mb-4 italic">
                  {t('layoutHint')}
                </p>
                <div className="space-y-4">
                  {Object.entries(groupedPrefabs).map(([category, items]) => (
                    <div key={category}>
                      <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                        {category}
                      </h4>
                      <div className="flex flex-col gap-1">
                        {items.map(prefab => (
                          <HoverCard key={prefab.name} openDelay={200}>
                            <HoverCardTrigger asChild>
                              <div
                                draggable
                                onDragStart={e => onDragStart(prefab, e)}
                                className="group relative flex items-center px-3 py-1 bg-secondary/5 hover:bg-secondary/20 rounded border border-border/30 hover:border-primary/50 cursor-grab active:cursor-grabbing transition-all h-8"
                              >
                                <span className="text-[11px] font-medium text-foreground/70 group-hover:text-primary transition-colors truncate">
                                  {prefab.name}
                                </span>
                              </div>
                            </HoverCardTrigger>
                            <HoverCardContent side="right" align="start" className="w-48 p-2">
                              <div className="space-y-2">
                                <div className="flex justify-between items-center border-b border-border/50 pb-1">
                                  <span className="font-semibold text-xs">{prefab.name}</span>
                                  <span className="text-[10px] font-mono text-muted-foreground">
                                    {prefab.width}
                                    ×
                                    {prefab.height}
                                  </span>
                                </div>
                                <div className="aspect-square w-full bg-black/20 rounded border border-border/50 flex items-center justify-center p-2">
                                  {/* Preview Grid */}
                                  <div
                                    className="grid gap-[1px]"
                                    style={{
                                      gridTemplateColumns: `repeat(${prefab.width}, 1fr)`,
                                      width: '100%',
                                      aspectRatio: `${prefab.width}/${prefab.height}`,
                                    }}
                                  >
                                    {prefab.data.map((cell, i) => (
                                      <div
                                        key={i}
                                        className={cn(
                                          'w-full h-full rounded-[0.5px]',
                                          cell ? 'bg-teal-400 shadow-[0_0_2px_rgba(45,212,191,0.5)]' : 'bg-muted/20',
                                        )}
                                      />
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Parameters */}
            <AccordionItem value="params" className="border-border/50">
              <AccordionTrigger className="text-sm hover:no-underline py-3">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-teal-500" />
                  <span>{t('parameters')}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-6 pt-2 px-2">
                {/* Speed */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label className="text-xs flex items-center gap-2">
                      <Zap className="h-3 w-3" />
                      {' '}
                      {t('speed')}
                    </Label>
                    <span className="text-xs text-muted-foreground">
                      {speed}
                      {' '}
                      {t('gensPerSecond')}
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

                {/* Brush Size */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label className="text-xs flex items-center gap-2">
                      <Brush className="h-3 w-3" />
                      {' '}
                      {t('brushSize')}
                    </Label>
                    <span className="text-xs text-muted-foreground">
                      {brushSize}
                    </span>
                  </div>
                  <Slider
                    value={[brushSize]}
                    min={1}
                    max={10}
                    step={1}
                    onValueChange={([v]) => setBrushSize(v)}
                    className="py-1"
                  />
                </div>

                {/* Random Percentage */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label className="text-xs flex items-center gap-2">
                      <Dices className="h-3 w-3" />
                      {' '}
                      {t('randomFill')}
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

                {/* Scene Dimensions */}
                <div className="space-y-4">
                  <Label className="text-xs flex items-center gap-2">
                    <Ruler className="h-3 w-3" />
                    {' '}
                    {t('sceneDimensions')}
                  </Label>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[10px] text-muted-foreground">{t('width')}</span>
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
                      <span className="text-[10px] text-muted-foreground">{t('height')}</span>
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
                    {t('colors')}
                  </Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] text-muted-foreground block">{t('alive')}</span>
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
                      <span className="text-[10px] text-muted-foreground block">{t('dead')}</span>
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
              </AccordionContent>
            </AccordionItem>

            {/* System Settings */}
            <AccordionItem value="settings" className="border-none">
              <AccordionTrigger className="text-sm hover:no-underline py-3">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-teal-500" />
                  <span>{t('settings')}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-6 pt-2 px-2">
                {/* Theme */}
                <div className="space-y-3">
                  <Label className="text-xs flex items-center gap-2">
                    {theme === 'dark' ? <Moon className="h-3 w-3" /> : <Sun className="h-3 w-3" />}
                    {' '}
                    {t('themeMode')}
                  </Label>
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder={t('selectTheme')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">{t('themes.light')}</SelectItem>
                      <SelectItem value="dark">{t('themes.dark')}</SelectItem>
                      <SelectItem value="system">{t('themes.system')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Language */}
                <div className="space-y-3">
                  <Label className="text-xs flex items-center gap-2">
                    <Languages className="h-3 w-3" />
                    {' '}
                    {t('language')}
                  </Label>
                  <Select value={locale} onValueChange={handleLanguageChange}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder={t('selectLanguage')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">{t('languages.en')}</SelectItem>
                      <SelectItem value="zh">{t('languages.zh')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Toggles */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground flex items-center gap-2">
                      <Grid3X3 className="h-3 w-3" />
                      {' '}
                      {t('showGrid')}
                    </Label>
                    <Switch checked={showGrid} onCheckedChange={toggleGrid} className="scale-75" />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground flex items-center gap-2">
                      <Activity className="h-3 w-3" />
                      {' '}
                      {t('showStats')}
                    </Label>
                    <Switch checked={showStats} onCheckedChange={toggleStats} className="scale-75" />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground flex items-center gap-2">
                      <Scan className="h-3 w-3" />
                      {' '}
                      {t('showZoomControls')}
                    </Label>
                    <Switch checked={showZoomControls} onCheckedChange={toggleZoomControls} className="scale-75" />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

          </Accordion>
        </div>
      </ScrollArea>

      {/* Footer Info */}
      <div className="p-4 border-t border-border/50 bg-muted/5 space-y-2">
        <div className="text-[10px] text-muted-foreground leading-relaxed">
          <strong className="text-teal-500">Game of Life</strong>
          {' '}
          {t('footer')}
          {' '}
          <RulesDialog>
            <span className="text-primary hover:underline cursor-pointer">
              {t('showDetails')}
            </span>
          </RulesDialog>
        </div>
        <div className="flex items-center gap-2">
          <Github className="h-3 w-3 text-muted-foreground" />
          <a
            href="https://github.com/42arch/game-of-life"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-muted-foreground hover:text-primary transition-colors"
          >
            {t('github')}
          </a>
        </div>
      </div>

    </div>
  )
}
