import { HabitCategory } from './database'

// Analytics types for quality scoring and visualization
export interface BucketScore {
    category: HabitCategory
    label: string
    score: number // 0-1 scale
    color: string
    habitCount: number
    completionRate: number
}

export interface DailyQualityScores {
    date: string
    vitality: number
    focus: number
    discipline: number
    social: number
    overall: number
    consistencyMultiplier: number
}

export interface HeatmapDataPoint {
    date: string
    value: number // 0-1 scale representing overall completion
    level: 0 | 1 | 2 | 3 | 4 // GitHub-style intensity levels
}

export interface TrendData {
    date: string
    vitality: number
    focus: number
    discipline: number
    social: number
    overall: number
}

export interface RadarChartData {
    category: string
    value: number
    fullMark: number
}

export interface StreakInfo {
    currentStreak: number
    longestStreak: number
    lastActiveDate: string | null
}

export interface AnalyticsSummary {
    bucketScores: BucketScore[]
    weeklyTrend: TrendData[]
    monthlyHeatmap: HeatmapDataPoint[]
    overallScore: number
    consistencyMultiplier: number
    streakInfo: StreakInfo
    totalHabitsTracked: number
    totalLogsThisWeek: number
}

export interface ScoreCalculationResult {
    categoryScores: Record<HabitCategory, number>
    overallScore: number
    consistencyMultiplier: number
    details: {
        category: HabitCategory
        totalWeight: number
        weightedSum: number
        habitCount: number
    }[]
}

// Normalization utilities
export interface NormalizationConfig {
    goalType: 'binary' | 'number' | 'duration'
    goalValue?: number
    rawValue: number | string | boolean
}

export interface NormalizedResult {
    normalizedValue: number // 0-1 scale
    rawValue: number
    percentage: number // 0-100 for display
}
