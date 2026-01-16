'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format, eachDayOfInterval, subDays, startOfWeek, getDay } from 'date-fns'
import { cn } from '@/lib/utils'

interface HeatmapDataPoint {
  date: string
  value: number
  level: 0 | 1 | 2 | 3 | 4
}

interface ConsistencyHeatmapProps {
  data: HeatmapDataPoint[]
  weeks?: number
}

const LEVEL_COLORS = {
  0: 'bg-zinc-800',
  1: 'bg-emerald-900/50',
  2: 'bg-emerald-700/60',
  3: 'bg-emerald-500/70',
  4: 'bg-emerald-400',
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function ConsistencyHeatmap({ data, weeks = 12 }: ConsistencyHeatmapProps) {
  const heatmapData = useMemo(() => {
    const today = new Date()
    const startDate = startOfWeek(subDays(today, weeks * 7))
    const days = eachDayOfInterval({ start: startDate, end: today })
    
    const dataMap = new Map(data.map(d => [d.date, d]))
    
    return days.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd')
      const existing = dataMap.get(dateStr)
      return {
        date: dateStr,
        dayOfWeek: getDay(day),
        value: existing?.value ?? 0,
        level: existing?.level ?? 0,
      }
    })
  }, [data, weeks])

  // Group by week
  const weeklyData = useMemo(() => {
    const result: typeof heatmapData[] = []
    let currentWeek: typeof heatmapData = []
    
    heatmapData.forEach((day, index) => {
      currentWeek.push(day)
      if (day.dayOfWeek === 6 || index === heatmapData.length - 1) {
        result.push([...currentWeek])
        currentWeek = []
      }
    })
    
    return result
  }, [heatmapData])

  return (
    <Card className="border-zinc-800 bg-zinc-900/50">
      <CardHeader>
        <CardTitle className="text-lg text-white">Consistency</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-1">
          {/* Weekday labels */}
          <div className="flex flex-col gap-1 mr-2">
            {WEEKDAYS.map((day, i) => (
              <div 
                key={day} 
                className={cn(
                  "h-3 w-8 text-[10px] text-zinc-500 flex items-center",
                  i % 2 === 0 ? "visible" : "invisible"
                )}
              >
                {day}
              </div>
            ))}
          </div>
          
          {/* Heatmap grid */}
          <div className="flex gap-1 overflow-x-auto">
            {weeklyData.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {Array.from({ length: 7 }).map((_, dayIndex) => {
                  const day = week.find(d => d.dayOfWeek === dayIndex)
                  return (
                    <div
                      key={dayIndex}
                      className={cn(
                        "w-3 h-3 rounded-sm transition-colors",
                        day ? LEVEL_COLORS[day.level as keyof typeof LEVEL_COLORS] : 'bg-zinc-800/50'
                      )}
                      title={day ? `${day.date}: ${Math.round(day.value * 100)}%` : undefined}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-end gap-2 mt-4">
          <span className="text-xs text-zinc-500">Less</span>
          {Object.entries(LEVEL_COLORS).map(([level, color]) => (
            <div key={level} className={cn("w-3 h-3 rounded-sm", color)} />
          ))}
          <span className="text-xs text-zinc-500">More</span>
        </div>
      </CardContent>
    </Card>
  )
}
