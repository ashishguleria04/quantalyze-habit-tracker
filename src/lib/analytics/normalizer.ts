import { GoalType } from '@/types/database'
import { NormalizationConfig, NormalizedResult } from '@/types/analytics'

/**
 * Normalize different data types to a 0-1.0 scale
 * 
 * Binary: Yes/No, 1/0 → 1.0 or 0.0
 * Number: 8000 of 10000 steps → min(value/goal, 1.0)
 * Duration: 45 of 60 mins → min(value/goal, 1.0)
 */
export function normalizeValue(config: NormalizationConfig): NormalizedResult {
    const { goalType, goalValue, rawValue } = config

    let numericValue: number

    // Convert raw value to numeric
    if (typeof rawValue === 'boolean') {
        numericValue = rawValue ? 1 : 0
    } else if (typeof rawValue === 'string') {
        numericValue = parseStringValue(rawValue, goalType)
    } else {
        numericValue = rawValue
    }

    let normalizedValue: number

    switch (goalType) {
        case 'binary':
            // Binary is simply 0 or 1
            normalizedValue = numericValue > 0 ? 1.0 : 0.0
            break

        case 'number':
        case 'duration':
            // For quantitative and duration goals, calculate ratio to goal
            if (goalValue && goalValue > 0) {
                normalizedValue = Math.min(numericValue / goalValue, 1.0)
            } else {
                // If no goal set, treat as binary (did something > 0)
                normalizedValue = numericValue > 0 ? 1.0 : 0.0
            }
            break

        default:
            normalizedValue = 0
    }

    return {
        normalizedValue: Math.round(normalizedValue * 1000) / 1000, // Round to 3 decimal places
        rawValue: numericValue,
        percentage: Math.round(normalizedValue * 100),
    }
}

/**
 * Parse string values into numeric format
 */
export function parseStringValue(value: string, goalType: GoalType): number {
    const trimmed = value.trim().toLowerCase()

    // Handle boolean strings
    if (['yes', 'true', 'y', '1', 'done', 'completed', '✓', '✔', 'x'].includes(trimmed)) {
        return 1
    }
    if (['no', 'false', 'n', '0', '', 'skip', 'skipped', '-'].includes(trimmed)) {
        return 0
    }

    // Handle duration strings (e.g., "1h 30m", "90 mins", "1:30")
    if (goalType === 'duration') {
        return parseDurationString(trimmed)
    }

    // Try to parse as number
    const parsed = parseFloat(value.replace(/[,\s]/g, ''))
    return isNaN(parsed) ? 0 : parsed
}

/**
 * Parse duration strings into minutes
 */
export function parseDurationString(value: string): number {
    // Handle "HH:MM" format
    if (value.includes(':')) {
        const parts = value.split(':').map(p => parseInt(p, 10))
        if (parts.length === 2) {
            return (parts[0] * 60) + parts[1]
        }
        if (parts.length === 3) {
            return (parts[0] * 60) + parts[1] + (parts[2] / 60)
        }
    }

    // Handle "Xh Ym" format
    const hourMatch = value.match(/(\d+(?:\.\d+)?)\s*h(?:ours?)?/i)
    const minMatch = value.match(/(\d+(?:\.\d+)?)\s*m(?:ins?|inutes?)?/i)

    let total = 0
    if (hourMatch) total += parseFloat(hourMatch[1]) * 60
    if (minMatch) total += parseFloat(minMatch[1])

    if (total > 0) return total

    // Try plain number (assume minutes)
    const plain = parseFloat(value)
    return isNaN(plain) ? 0 : plain
}

/**
 * Batch normalize an array of values
 */
export function normalizeValues(
    values: (string | number | boolean)[],
    goalType: GoalType,
    goalValue?: number
): NormalizedResult[] {
    return values.map(rawValue =>
        normalizeValue({ goalType, goalValue, rawValue })
    )
}

/**
 * Calculate average normalized value from an array
 */
export function calculateAverageNormalized(
    values: (string | number | boolean)[],
    goalType: GoalType,
    goalValue?: number
): number {
    if (values.length === 0) return 0

    const normalized = normalizeValues(values, goalType, goalValue)
    const sum = normalized.reduce((acc, r) => acc + r.normalizedValue, 0)

    return sum / values.length
}
