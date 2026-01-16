import { HabitCategory } from '@/types/database'
import { HABIT_CATEGORIES } from '@/types/habits'

export const QUALITY_BUCKETS: Record<HabitCategory, {
    label: string
    description: string
    color: string
    defaultHabits: string[]
}> = {
    vitality: {
        label: 'Vitality',
        description: 'Physical health and energy',
        color: '#10b981',
        defaultHabits: [
            'Sleep (7-8 hours)',
            'Exercise',
            'Healthy eating',
            'Hydration (8 glasses)',
            'No alcohol',
            'Vitamins/Supplements',
        ],
    },
    focus: {
        label: 'Focus',
        description: 'Cognitive performance and deep work',
        color: '#3b82f6',
        defaultHabits: [
            'Deep work session',
            'Reading (30 mins)',
            'Learning/Course',
            'No social media',
            'Meditation',
            'Single-tasking',
        ],
    },
    discipline: {
        label: 'Discipline',
        description: 'Consistency and daily routines',
        color: '#f59e0b',
        defaultHabits: [
            'Wake up early',
            'Morning routine',
            'Cold shower',
            'Journaling',
            'Bed by 10pm',
            'No snooze',
        ],
    },
    social: {
        label: 'Social/Legacy',
        description: 'Relationships and meaningful connections',
        color: '#8b5cf6',
        defaultHabits: [
            'Family time',
            'Call a friend',
            'Networking',
            'Mentoring',
            'Community service',
            'Date night',
        ],
    },
}

export function getBucketColor(category: HabitCategory): string {
    return QUALITY_BUCKETS[category]?.color || '#6b7280'
}

export function getBucketLabel(category: HabitCategory): string {
    return QUALITY_BUCKETS[category]?.label || category
}

export function getAllBuckets() {
    return HABIT_CATEGORIES.map(cat => ({
        ...cat,
        ...QUALITY_BUCKETS[cat.value],
    }))
}

export function getDefaultHabitsForBucket(category: HabitCategory): string[] {
    return QUALITY_BUCKETS[category]?.defaultHabits || []
}
