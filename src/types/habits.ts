import { HabitCategory, GoalType } from './database'

// Habit-related types for the application
export interface HabitFormData {
    name: string
    description?: string
    category: HabitCategory
    weight: number
    goal_type: GoalType
    goal_value?: number
    unit?: string
}

export interface HabitWithLogs {
    id: string
    name: string
    description: string | null
    category: HabitCategory
    weight: number
    goal_type: GoalType
    goal_value: number | null
    unit: string | null
    is_active: boolean
    logs: {
        date: string
        value: number
        normalized_value: number | null
    }[]
}

export interface ColumnMapping {
    columnIndex: number
    columnName: string
    habitId?: string
    habitName?: string
    category: HabitCategory
    goal_type: GoalType
    goal_value?: number
    unit?: string
    weight: number
}

export interface ImportConfig {
    dateColumn: number
    dateFormat: string
    columnMappings: ColumnMapping[]
}

export interface ParsedSpreadsheetData {
    headers: string[]
    rows: (string | number)[][]
    rowCount: number
}

export const HABIT_CATEGORIES: { value: HabitCategory; label: string; description: string; color: string }[] = [
    {
        value: 'vitality',
        label: 'Vitality',
        description: 'Physical health habits (Sleep, Exercise, Diet)',
        color: '#10b981' // emerald
    },
    {
        value: 'focus',
        label: 'Focus',
        description: 'Cognitive performance (Deep Work, Reading, Learning)',
        color: '#3b82f6' // blue
    },
    {
        value: 'discipline',
        label: 'Discipline',
        description: 'Consistency habits (Wake early, Cold showers, Journaling)',
        color: '#f59e0b' // amber
    },
    {
        value: 'social',
        label: 'Social/Legacy',
        description: 'Relationship-building and networking',
        color: '#8b5cf6' // violet
    },
]

export const GOAL_TYPES: { value: GoalType; label: string; description: string }[] = [
    { value: 'binary', label: 'Yes/No', description: 'Simple completion tracking (Did you do it?)' },
    { value: 'number', label: 'Quantity', description: 'Track a specific number (steps, pages, etc.)' },
    { value: 'duration', label: 'Duration', description: 'Track time spent (minutes, hours)' },
]

export const WEIGHT_OPTIONS = [
    { value: 1, label: '1 - Low', description: 'Nice to have' },
    { value: 2, label: '2 - Below Average', description: 'Somewhat important' },
    { value: 3, label: '3 - Average', description: 'Standard importance' },
    { value: 4, label: '4 - Above Average', description: 'High priority' },
    { value: 5, label: '5 - Critical', description: 'Must do every day' },
]
