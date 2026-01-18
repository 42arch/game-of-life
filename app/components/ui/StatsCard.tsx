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
    <Card className={cn('w-64 bg-black/80 backdrop-blur-md border border-white/10 shadow-xl', className)}>
      <CardHeader className="p-4 pb-2 border-b border-white/10">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-teal-400">
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
          <span className="font-mono text-lg font-bold text-white">{generation.toLocaleString()}</span>
        </div>

        {/* Alive */}
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Activity className="h-3 w-3 text-green-400" />
            {' '}
            Alive
          </span>
          <span className="font-mono text-sm text-green-400">{aliveCount.toLocaleString()}</span>
        </div>

        {/* Dead */}
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Skull className="h-3 w-3 text-gray-500" />
            {' '}
            Dead
          </span>
          <span className="font-mono text-sm text-gray-400">{deadCount.toLocaleString()}</span>
        </div>

      </CardContent>
    </Card>
  )
}
