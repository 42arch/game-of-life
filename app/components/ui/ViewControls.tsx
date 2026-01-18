import { Maximize, Minus, Plus, RotateCcw } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React from 'react'

interface ViewControlsProps {
  onZoomIn: () => void
  onZoomOut: () => void
  onResetCamera: () => void
  onFullscreen: () => void
}

export const ViewControls: React.FC<ViewControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onResetCamera,
  onFullscreen,
}) => {
  const t = useTranslations('Controls')

  return (
    <div className="flex flex-col gap-1 bg-card/80 backdrop-blur-xl p-1 rounded-lg border border-border/50 shadow-2xl">
      <button
        onClick={onZoomIn}
        className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
        title={t('zoomIn')}
      >
        <Plus size={16} />
      </button>
      <button
        onClick={onZoomOut}
        className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
        title={t('zoomOut')}
      >
        <Minus size={16} />
      </button>
      <button
        onClick={onResetCamera}
        className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
        title={t('resetView')}
      >
        <RotateCcw size={16} />
      </button>
      <div className="h-px w-full bg-border my-0.5"></div>
      <button
        onClick={onFullscreen}
        className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
        title={t('fullscreen')}
      >
        <Maximize size={16} />
      </button>
    </div>
  )
}
