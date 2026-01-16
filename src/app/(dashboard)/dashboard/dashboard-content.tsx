'use client'

import { useMemo } from 'react'
import { Profile, Habit, DailyLog, QualityScore, AIInsight } from '@/types/database'
import { QualityRadarChart } from '@/components/charts/radar-chart'
import { ConsistencyHeatmap } from '@/components/charts/heatmap'
import { TrendLineChart } from '@/components/charts/line-chart'
import { AIInsightPanel } from '@/components/dashboard/ai-insight-panel'
import { ScoreCard } from '@/components/dashboard/score-card'
import { calculateDailyScores, calculateStreak, calculateConsistencyMultiplier, scoresToHeatmapLevels } from '@/lib/analytics/score-calculator'
import { Heart, Brain, Flame, Users, Target } from 'lucide-react'
import { format, subDays } from 'date-fns'

interface DashboardContentProps {
  profile: Profile | null
  habits: Habit[]
  dailyLogs: DailyLog[]
  qualityScores: QualityScore[]
  aiInsights: AIInsight[]
}

export function DashboardContent({
  profile,
  habits,
  dailyLogs,
  qualityScores,
  aiInsights,
}: DashboardContentProps) {
  // Calculate today's scores
  const todayScores = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd')
    const todayLogs = dailyLogs.filter(l => l.date === today)
    
    const habitsWithLogs = habits.map(habit => ({
      ...habit,
      log: todayLogs.find(l => l.habit_id === habit.id),
    }))
    
    // Calculate streak
    const activeDates = [...new Set(dailyLogs.map(l => l.date))].sort()
    const streakInfo = calculateStreak(activeDates)
    const multiplier = calculateConsistencyMultiplier(streakInfo.currentStreak)
    
    return calculateDailyScores(habitsWithLogs, multiplier)
  }, [habits, dailyLogs])

  // Get yesterday's scores for comparison
  const yesterdayScores = useMemo(() => {
    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd')
    const score = qualityScores.find(s => s.date === yesterday)
    return score || null
  }, [qualityScores])

  // Prepare radar chart data
  const radarData = useMemo(() => [
    { category: 'Vitality', value: todayScores.categoryScores.vitality, fullMark: 1 },
    { category: 'Focus', value: todayScores.categoryScores.focus, fullMark: 1 },
    { category: 'Discipline', value: todayScores.categoryScores.discipline, fullMark: 1 },
    { category: 'Social', value: todayScores.categoryScores.social, fullMark: 1 },
  ], [todayScores])

  // Prepare heatmap data
  const heatmapData = useMemo(() => {
    const scoreMap = new Map(qualityScores.map(s => [s.date, s.overall_score || 0]))
    
    return Array.from(scoreMap.entries()).map(([date, value]) => ({
      date,
      value: value || 0,
      level: (value === 0 ? 0 : value < 0.25 ? 1 : value < 0.5 ? 2 : value < 0.75 ? 3 : 4) as 0 | 1 | 2 | 3 | 4,
    }))
  }, [qualityScores])

  // Prepare trend data (last 7 days)
  const trendData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => 
      format(subDays(new Date(), 6 - i), 'yyyy-MM-dd')
    )
    
    return last7Days.map(date => {
      const score = qualityScores.find(s => s.date === date)
      return {
        date,
        vitality: score?.vitality_score || 0,
        focus: score?.focus_score || 0,
        discipline: score?.discipline_score || 0,
        social: score?.social_score || 0,
        overall: score?.overall_score || 0,
      }
    })
  }, [qualityScores])

  const isPro = profile?.subscription_status === 'pro'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}
        </h1>
        <p className="text-zinc-400 mt-1">
          Here&apos;s your habit performance overview
        </p>
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <ScoreCard
          title="Overall Score"
          score={todayScores.overallScore}
          previousScore={yesterdayScores?.overall_score ?? undefined}
          color="#f43f5e"
          icon={<Target className="w-4 h-4 text-rose-400" />}
        />
        <ScoreCard
          title="Vitality"
          score={todayScores.categoryScores.vitality}
          previousScore={yesterdayScores?.vitality_score ?? undefined}
          color="#10b981"
          icon={<Heart className="w-4 h-4 text-emerald-400" />}
        />
        <ScoreCard
          title="Focus"
          score={todayScores.categoryScores.focus}
          previousScore={yesterdayScores?.focus_score ?? undefined}
          color="#3b82f6"
          icon={<Brain className="w-4 h-4 text-blue-400" />}
        />
        <ScoreCard
          title="Discipline"
          score={todayScores.categoryScores.discipline}
          previousScore={yesterdayScores?.discipline_score ?? undefined}
          color="#f59e0b"
          icon={<Flame className="w-4 h-4 text-amber-400" />}
        />
        <ScoreCard
          title="Social"
          score={todayScores.categoryScores.social}
          previousScore={yesterdayScores?.social_score ?? undefined}
          color="#8b5cf6"
          icon={<Users className="w-4 h-4 text-violet-400" />}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QualityRadarChart data={radarData} />
        <TrendLineChart data={trendData} />
      </div>

      {/* Heatmap and AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ConsistencyHeatmap data={heatmapData} weeks={12} />
        <AIInsightPanel 
          insights={aiInsights} 
          isPro={isPro}
        />
      </div>
    </div>
  )
}
