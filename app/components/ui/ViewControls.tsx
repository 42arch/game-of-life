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
    <div className="flex flex-col gap-2 bg-card/80 backdrop-blur-xl p-2 rounded-xl border border-border/50 shadow-2xl">
      <button
        onClick={onZoomIn}
        className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
        title={t('zoomIn')}
      >
        <Plus size={20} />
      </button>
      <button
        onClick={onZoomOut}
        className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
        title={t('zoomOut')}
      >
        <Minus size={20} />
      </button>
      <button
        onClick={onResetCamera}
        className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
        title={t('resetView')}
      >
        <RotateCcw size={20} />
      </button>
      <div className="h-px w-full bg-border my-0.5"></div>
      <button
        onClick={onFullscreen}
        className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
        title={t('fullscreen')}
      >
        <Maximize size={20} />
      </button>
    </div>
  )
}
