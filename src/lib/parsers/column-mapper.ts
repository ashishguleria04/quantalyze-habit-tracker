import { ColumnMapping, ParsedSpreadsheetData, ImportConfig } from '@/types/habits'
import { HabitCategory, GoalType } from '@/types/database'
import { parseCSV } from './csv-parser'
import { parseXLSX } from './xlsx-parser'
import { parse, isValid } from 'date-fns'

/**
 * Parse any spreadsheet file (CSV or XLSX)
 */
export async function parseSpreadsheet(file: File): Promise<ParsedSpreadsheetData> {
    const extension = file.name.split('.').pop()?.toLowerCase()

    if (extension === 'csv') {
        return parseCSV(file)
    } else if (['xlsx', 'xls'].includes(extension || '')) {
        return parseXLSX(file)
    } else {
        throw new Error(`Unsupported file format: ${extension}. Please use CSV or Excel files.`)
    }
}

/**
 * Auto-detect column types based on sample values
 */
export function detectColumnType(values: (string | number)[]): {
    goalType: GoalType
    suggestedGoalValue?: number
} {
    // Sample first 10 non-empty values
    const samples = values
        .filter(v => v !== '' && v != null)
        .slice(0, 10)
        .map(v => String(v).toLowerCase().trim())

    if (samples.length === 0) {
        return { goalType: 'binary' }
    }

    // Check for binary values
    const binaryValues = ['yes', 'no', 'y', 'n', 'true', 'false', '1', '0', 'done', 'skip', '✓', '✔', 'x', '-']
    const isBinary = samples.every(s => binaryValues.includes(s))

    if (isBinary) {
        return { goalType: 'binary' }
    }

    // Check for duration values
    const durationPatterns = [
        /^\d+:\d+/, // HH:MM
        /\d+\s*h/i, // Xh
        /\d+\s*m/i, // Xm
        /\d+\s*min/i, // X min
        /\d+\s*hour/i, // X hour
    ]

    const isDuration = samples.some(s =>
        durationPatterns.some(pattern => pattern.test(s))
    )

    if (isDuration) {
        return { goalType: 'duration', suggestedGoalValue: 60 }
    }

    // Check for numeric values
    const numericValues = samples
        .filter(s => !isNaN(parseFloat(s.replace(/[,\s]/g, ''))))
        .map(s => parseFloat(s.replace(/[,\s]/g, '')))

    if (numericValues.length > samples.length * 0.7) {
        const maxValue = Math.max(...numericValues)
        return {
            goalType: 'number',
            suggestedGoalValue: Math.ceil(maxValue)
        }
    }

    // Default to binary
    return { goalType: 'binary' }
}

/**
 * Auto-detect category based on column name
 */
export function detectCategory(columnName: string): HabitCategory {
    const name = columnName.toLowerCase()

    // Vitality keywords
    if (['sleep', 'exercise', 'workout', 'gym', 'run', 'walk', 'diet', 'food', 'eat', 'water', 'hydrat', 'vitamin', 'health', 'steps', 'weight'].some(k => name.includes(k))) {
        return 'vitality'
    }

    // Focus keywords
    if (['work', 'read', 'learn', 'study', 'course', 'book', 'code', 'project', 'focus', 'meditat', 'social media', 'phone'].some(k => name.includes(k))) {
        return 'focus'
    }

    // Discipline keywords
    if (['wake', 'morning', 'routine', 'journal', 'cold', 'shower', 'early', 'bed', 'snooze', 'habit'].some(k => name.includes(k))) {
        return 'discipline'
    }

    // Social keywords
    if (['family', 'friend', 'call', 'network', 'mentor', 'community', 'date', 'social', 'relationship'].some(k => name.includes(k))) {
        return 'social'
    }

    // Default to discipline
    return 'discipline'
}

/**
 * Create automatic column mappings from headers
 */
export function autoMapColumns(
    data: ParsedSpreadsheetData,
    dateColumnIndex: number
): ColumnMapping[] {
    const mappings: ColumnMapping[] = []

    for (let i = 0; i < data.headers.length; i++) {
        // Skip date column
        if (i === dateColumnIndex) continue

        const header = data.headers[i]

        // Get sample values for this column
        const sampleValues = data.rows.map(row => row[i])
        const { goalType, suggestedGoalValue } = detectColumnType(sampleValues)
        const category = detectCategory(header)

        mappings.push({
            columnIndex: i,
            columnName: header,
            habitName: header,
            category,
            goal_type: goalType,
            goal_value: suggestedGoalValue,
            weight: 3, // Default weight
        })
    }

    return mappings
}

/**
 * Parse date from various formats
 */
export function parseDate(value: string | number): Date | null {
    if (typeof value === 'number') {
        // Excel serial date
        const excelEpoch = new Date(1899, 11, 30)
        const date = new Date(excelEpoch.getTime() + value * 24 * 60 * 60 * 1000)
        return isValid(date) ? date : null
    }

    const dateFormats = [
        'yyyy-MM-dd',
        'MM/dd/yyyy',
        'dd/MM/yyyy',
        'M/d/yyyy',
        'd/M/yyyy',
        'yyyy/MM/dd',
        'MMM d, yyyy',
        'MMMM d, yyyy',
        'd MMM yyyy',
    ]

    for (const format of dateFormats) {
        const parsed = parse(value, format, new Date())
        if (isValid(parsed)) {
            return parsed
        }
    }

    // Try native Date parsing as fallback
    const native = new Date(value)
    if (isValid(native)) {
        return native
    }

    return null
}

/**
 * Process imported data with column mappings
 */
export function processImportedData(
    data: ParsedSpreadsheetData,
    config: ImportConfig
): {
    date: Date
    values: { columnIndex: number; value: string | number }[]
}[] {
    const results: {
        date: Date
        values: { columnIndex: number; value: string | number }[]
    }[] = []

    for (const row of data.rows) {
        const dateValue = row[config.dateColumn]
        const date = parseDate(String(dateValue))

        if (!date) continue

        const values: { columnIndex: number; value: string | number }[] = []

        for (const mapping of config.columnMappings) {
            values.push({
                columnIndex: mapping.columnIndex,
                value: row[mapping.columnIndex],
            })
        }

        results.push({ date, values })
    }

    return results
}
