import { Eraser, MousePointer2, Pause, Play, Shuffle, Zap } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React from 'react'
import { cn } from '@/lib/utils'
import { Button } from './button'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { Separator } from './separator'
import { Slider } from './slider'

interface PlaybackControlsProps {
  isRunning: boolean
  onTogglePlay: () => void
  onClear: () => void
  onRandom: () => void
  drawMode: boolean
  onToggleDrawMode: () => void
  speed: number
  onSpeedChange: (speed: number) => void
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isRunning,
  onTogglePlay,
  onClear,
  onRandom,
  drawMode,
  onToggleDrawMode,
  speed,
  onSpeedChange,
}) => {
  const t = useTranslations('Controls')

  return (
    <div className="flex items-center gap-2 rounded-full bg-card/80 p-2 px-4 backdrop-blur-md border border-border/50 shadow-2xl">
      {/* Play/Pause - Left */}
      <Button
        variant="default"
        size="icon"
        className={cn(
          'h-10 w-10 rounded-full transition-all',
          isRunning
            ? 'bg-destructive hover:bg-destructive/90 text-primary-foreground shadow-[0_0_15px_rgba(239,68,68,0.5)]'
            : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_15px_rgba(45,212,191,0.5)]',
        )}
        onClick={onTogglePlay}
        title={isRunning ? t('pause') : t('play')}
      >
        {isRunning ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current ml-1" />}
      </Button>

      <Separator orientation="vertical" className="h-8 mx-2 bg-border" />

      {/* Speed Control */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent"
            title={t('speed')}
          >
            <Zap className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-40 p-3" side="top" sideOffset={10}>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-medium text-muted-foreground">{t('speed')}</span>
              <span className="text-[10px] font-mono">
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
              onValueChange={([v]) => onSpeedChange(v)}
              className="py-1"
            />
          </div>
        </PopoverContent>
      </Popover>

      {/* Right Controls */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent"
          onClick={onClear}
          title={t('clear')}
        >
          <Eraser className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent"
          onClick={onRandom}
          title={t('random')}
        >
          <Shuffle className="h-4 w-4" />
        </Button>

        <Button
          variant={drawMode ? 'secondary' : 'ghost'}
          size="icon"
          className={cn(
            'h-9 w-9 rounded-full transition-colors',
            drawMode
              ? 'bg-primary/20 text-primary hover:bg-primary/30 border border-primary/50'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent',
          )}
          onClick={onToggleDrawMode}
          title={drawMode ? t('drawOn') : t('drawOff')}
        >
          <MousePointer2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
