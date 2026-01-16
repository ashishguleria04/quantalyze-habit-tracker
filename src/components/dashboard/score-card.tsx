import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface ScoreCardProps {
  title: string
  score: number
  previousScore?: number
  color: string
  icon?: React.ReactNode
}

export function ScoreCard({ title, score, previousScore, color, icon }: ScoreCardProps) {
  const percentage = Math.round(score * 100)
  const trend = previousScore !== undefined ? score - previousScore : 0
  const trendPercentage = Math.round(Math.abs(trend) * 100)

  return (
    <Card className="border-zinc-800 bg-zinc-900/50">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-zinc-400">{title}</span>
          {icon && (
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${color}15` }}
            >
              {icon}
            </div>
          )}
        </div>
        
        <div className="flex items-end gap-2">
          <span 
            className="text-3xl font-bold"
            style={{ color }}
          >
            {percentage}%
          </span>
          
          {previousScore !== undefined && (
            <div className={cn(
              "flex items-center gap-1 text-sm mb-1",
              trend > 0 ? "text-emerald-400" : trend < 0 ? "text-rose-400" : "text-zinc-500"
            )}>
              {trend > 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : trend < 0 ? (
                <TrendingDown className="w-4 h-4" />
              ) : (
                <Minus className="w-4 h-4" />
              )}
              <span>{trendPercentage}%</span>
            </div>
          )}
        </div>
        
        {/* Progress bar */}
        <div className="mt-4 h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-500"
            style={{ 
              width: `${percentage}%`,
              backgroundColor: color 
            }}
          />
        </div>
      </CardContent>
    </Card>
  )
}
