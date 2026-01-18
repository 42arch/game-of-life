import { Activity, Skull, Zap } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from './card'

interface StatsCardProps {
  generation: number
  aliveCount: number
  deadCount: number
  className?: string
}

export const StatsCard: React.FC<StatsCardProps> = ({
  generation,
  aliveCount,
  deadCount,
  className,
}) => {
  const t = useTranslations('Stats')

  return (
    <Card className={cn('w-52 bg-card/80 backdrop-blur-md border border-border/50 shadow-xl', className)}>
      <CardHeader className="p-2 px-3 border-b border-border/50">
        <CardTitle className="text-xs font-semibold flex items-center gap-2 text-primary opacity-90">
          <Activity className="h-3.5 w-3.5" />
          {t('title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-2 space-y-1.5">

        {/* Generation */}
        <div className="flex justify-between items-center">
          <span className="text-[10px] text-muted-foreground flex items-center gap-1.5">
            <Zap className="h-3 w-3" />
            {t('generation')}
          </span>
          <span className="font-mono text-base font-bold text-foreground">{generation.toLocaleString()}</span>
        </div>

        {/* Alive */}
        <div className="flex justify-between items-center">
          <span className="text-[10px] text-muted-foreground flex items-center gap-1.5">
            <Activity className="h-3 w-3 text-primary" />
            {t('alive')}
          </span>
          <span className="font-mono text-xs font-medium text-primary">{aliveCount.toLocaleString()}</span>
        </div>

        {/* Dead */}
        <div className="flex justify-between items-center">
          <span className="text-[10px] text-muted-foreground flex items-center gap-1.5">
            <Skull className="h-3 w-3 text-muted-foreground" />
            {t('dead')}
          </span>
          <span className="font-mono text-xs font-medium text-muted-foreground">{deadCount.toLocaleString()}</span>
        </div>

      </CardContent>
    </Card>
  )
}
