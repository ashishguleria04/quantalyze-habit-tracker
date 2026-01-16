'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface TrendData {
  date: string
  vitality: number
  focus: number
  discipline: number
  social: number
  overall: number
}

interface TrendLineChartProps {
  data: TrendData[]
}

const CATEGORY_COLORS = {
  vitality: '#10b981',
  focus: '#3b82f6',
  discipline: '#f59e0b',
  social: '#8b5cf6',
  overall: '#f43f5e',
}

export function TrendLineChart({ data }: TrendLineChartProps) {
  return (
    <Card className="border-zinc-800 bg-zinc-900/50">
      <CardHeader>
        <CardTitle className="text-lg text-white">Weekly Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
              <XAxis 
                dataKey="date" 
                stroke="#71717a"
                fontSize={12}
                tickFormatter={(value) => value.slice(5)} // Show MM-DD
              />
              <YAxis
                stroke="#71717a"
                fontSize={12}
                domain={[0, 1]}
                tickFormatter={(value) => `${Math.round(value * 100)}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#18181b',
                  border: '1px solid #3f3f46',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#fafafa' }}
                formatter={(value: number | undefined, name: string | undefined) => [
                  `${Math.round((value ?? 0) * 100)}%`,
                  (name ?? '').charAt(0).toUpperCase() + (name ?? '').slice(1),
                ]}
              />
              <Legend
                wrapperStyle={{ paddingTop: '20px' }}
                formatter={(value) => (
                  <span className="text-zinc-300 text-sm capitalize">{value}</span>
                )}
              />
              <Line
                type="monotone"
                dataKey="overall"
                stroke={CATEGORY_COLORS.overall}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="vitality"
                stroke={CATEGORY_COLORS.vitality}
                strokeWidth={1.5}
                dot={false}
                strokeDasharray="4 2"
              />
              <Line
                type="monotone"
                dataKey="focus"
                stroke={CATEGORY_COLORS.focus}
                strokeWidth={1.5}
                dot={false}
                strokeDasharray="4 2"
              />
              <Line
                type="monotone"
                dataKey="discipline"
                stroke={CATEGORY_COLORS.discipline}
                strokeWidth={1.5}
                dot={false}
                strokeDasharray="4 2"
              />
              <Line
                type="monotone"
                dataKey="social"
                stroke={CATEGORY_COLORS.social}
                strokeWidth={1.5}
                dot={false}
                strokeDasharray="4 2"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
