import { Activity, Skull, Zap } from 'lucide-react'
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
  return (
    <Card className={cn('w-64 bg-card/80 backdrop-blur-md border border-border/50 shadow-xl', className)}>
      <CardHeader className="p-4 pb-2 border-b border-border/50">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-primary">
          <Activity className="h-4 w-4" />
          {' '}
          Live Statistics
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">

        {/* Generation */}
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Zap className="h-3 w-3" />
            {' '}
            Generation
          </span>
          <span className="font-mono text-lg font-bold text-foreground">{generation.toLocaleString()}</span>
        </div>

        {/* Alive */}
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Activity className="h-3 w-3 text-primary" />
            {' '}
            Alive
          </span>
          <span className="font-mono text-sm text-primary">{aliveCount.toLocaleString()}</span>
        </div>

        {/* Dead */}
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Skull className="h-3 w-3 text-muted-foreground" />
            {' '}
            Dead
          </span>
          <span className="font-mono text-sm text-muted-foreground">{deadCount.toLocaleString()}</span>
        </div>

      </CardContent>
    </Card>
  )
}
