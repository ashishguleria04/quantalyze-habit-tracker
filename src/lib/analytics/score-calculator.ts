import { HabitCategory, Habit, DailyLog } from '@/types/database'
import { ScoreCalculationResult, StreakInfo, DailyQualityScores } from '@/types/analytics'
import { normalizeValue } from './normalizer'
import { differenceInDays, parseISO, format, subDays } from 'date-fns'

interface HabitWithLog extends Habit {
    log?: DailyLog
}

/**
 * Calculate the Quantalyze Score for a given date
 * 
 * Formula: Score = (Σ(NormalizedValue × Weight) / TotalPossibleWeight) × ConsistencyMultiplier
 */
export function calculateDailyScores(
    habits: HabitWithLog[],
    consistencyMultiplier: number = 1.0
): ScoreCalculationResult {
    const categories: HabitCategory[] = ['vitality', 'focus', 'discipline', 'social']
    const categoryScores: Record<HabitCategory, number> = {
        vitality: 0,
        focus: 0,
        discipline: 0,
        social: 0,
    }

    const details: ScoreCalculationResult['details'] = []

    for (const category of categories) {
        const categoryHabits = habits.filter(h => h.category === category && h.is_active)

        if (categoryHabits.length === 0) {
            details.push({
                category,
                totalWeight: 0,
                weightedSum: 0,
                habitCount: 0,
            })
            continue
        }

        let totalWeight = 0
        let weightedSum = 0

        for (const habit of categoryHabits) {
            const weight = habit.weight
            totalWeight += weight

            if (habit.log) {
                const normalized = normalizeValue({
                    goalType: habit.goal_type,
                    goalValue: habit.goal_value ?? undefined,
                    rawValue: habit.log.value,
                })
                weightedSum += normalized.normalizedValue * weight
            }
            // If no log, contribution is 0
        }

        const rawScore = totalWeight > 0 ? weightedSum / totalWeight : 0
        categoryScores[category] = Math.round(rawScore * consistencyMultiplier * 1000) / 1000

        details.push({
            category,
            totalWeight,
            weightedSum,
            habitCount: categoryHabits.length,
        })
    }

    // Calculate overall score (average of all category scores with at least one habit)
    const activeCategories = details.filter(d => d.habitCount > 0)
    const overallScore = activeCategories.length > 0
        ? activeCategories.reduce((sum, d) => sum + categoryScores[d.category], 0) / activeCategories.length
        : 0

    return {
        categoryScores,
        overallScore: Math.round(overallScore * 1000) / 1000,
        consistencyMultiplier,
        details,
    }
}

/**
 * Calculate consistency multiplier based on streak
 * 
 * Base: 1.0
 * 7+ days: 1.05
 * 14+ days: 1.10
 * 30+ days: 1.15
 * 60+ days: 1.20
 */
export function calculateConsistencyMultiplier(streakDays: number): number {
    if (streakDays >= 60) return 1.20
    if (streakDays >= 30) return 1.15
    if (streakDays >= 14) return 1.10
    if (streakDays >= 7) return 1.05
    return 1.0
}

/**
 * Calculate streak information from daily logs
 */
export function calculateStreak(
    dates: string[], // Dates with any activity, sorted ascending
    today: Date = new Date()
): StreakInfo {
    if (dates.length === 0) {
        return {
            currentStreak: 0,
            longestStreak: 0,
            lastActiveDate: null,
        }
    }

    const sortedDates = [...dates].sort()
    const lastActiveDate = sortedDates[sortedDates.length - 1]

    // Check if streak is still active (last activity was today or yesterday)
    const daysSinceLastActive = differenceInDays(today, parseISO(lastActiveDate))

    let currentStreak = 0
    if (daysSinceLastActive <= 1) {
        // Count consecutive days backwards from last active
        currentStreak = 1
        for (let i = sortedDates.length - 2; i >= 0; i--) {
            const prevDate = parseISO(sortedDates[i])
            const currDate = parseISO(sortedDates[i + 1])
            if (differenceInDays(currDate, prevDate) === 1) {
                currentStreak++
            } else {
                break
            }
        }
    }

    // Calculate longest streak
    let longestStreak = 1
    let tempStreak = 1
    for (let i = 1; i < sortedDates.length; i++) {
        const prevDate = parseISO(sortedDates[i - 1])
        const currDate = parseISO(sortedDates[i])
        if (differenceInDays(currDate, prevDate) === 1) {
            tempStreak++
            longestStreak = Math.max(longestStreak, tempStreak)
        } else {
            tempStreak = 1
        }
    }

    return {
        currentStreak,
        longestStreak: Math.max(longestStreak, currentStreak),
        lastActiveDate,
    }
}

/**
 * Generate quality scores for a date range
 */
export function generateScoresForDateRange(
    habits: Habit[],
    logs: DailyLog[],
    startDate: Date,
    endDate: Date
): DailyQualityScores[] {
    const scores: DailyQualityScores[] = []
    const logsByDate = new Map<string, DailyLog[]>()

    // Group logs by date
    for (const log of logs) {
        const dateKey = log.date
        if (!logsByDate.has(dateKey)) {
            logsByDate.set(dateKey, [])
        }
        logsByDate.get(dateKey)!.push(log)
    }

    // Calculate streak for consistency multiplier
    const activeDates = [...logsByDate.keys()]
    const streakInfo = calculateStreak(activeDates, endDate)
    const consistencyMultiplier = calculateConsistencyMultiplier(streakInfo.currentStreak)

    // Generate scores for each day
    let currentDate = new Date(startDate)
    while (currentDate <= endDate) {
        const dateKey = format(currentDate, 'yyyy-MM-dd')
        const dayLogs = logsByDate.get(dateKey) || []

        // Attach logs to habits
        const habitsWithLogs: HabitWithLog[] = habits.map(habit => ({
            ...habit,
            log: dayLogs.find(l => l.habit_id === habit.id),
        }))

        const result = calculateDailyScores(habitsWithLogs, consistencyMultiplier)

        scores.push({
            date: dateKey,
            vitality: result.categoryScores.vitality,
            focus: result.categoryScores.focus,
            discipline: result.categoryScores.discipline,
            social: result.categoryScores.social,
            overall: result.overallScore,
            consistencyMultiplier,
        })

        currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000)
    }

    return scores
}

/**
 * Convert scores to heatmap format (GitHub-style levels 0-4)
 */
export function scoresToHeatmapLevels(
    scores: DailyQualityScores[]
): { date: string; value: number; level: 0 | 1 | 2 | 3 | 4 }[] {
    return scores.map(s => ({
        date: s.date,
        value: s.overall,
        level: getHeatmapLevel(s.overall),
    }))
}

function getHeatmapLevel(score: number): 0 | 1 | 2 | 3 | 4 {
    if (score === 0) return 0
    if (score < 0.25) return 1
    if (score < 0.5) return 2
    if (score < 0.75) return 3
    return 4
}
