import Papa from 'papaparse'
import { ParsedSpreadsheetData } from '@/types/habits'

/**
 * Parse CSV file and return structured data
 */
export async function parseCSV(file: File): Promise<ParsedSpreadsheetData> {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: false,
            skipEmptyLines: true,
            dynamicTyping: true,
            complete: (results) => {
                if (results.errors.length > 0) {
                    reject(new Error(`CSV parsing error: ${results.errors[0].message}`))
                    return
                }

                const data = results.data as (string | number)[][]

                if (data.length === 0) {
                    reject(new Error('CSV file is empty'))
                    return
                }

                // First row is headers
                const headers = data[0].map(h => String(h || '').trim())
                const rows = data.slice(1)

                resolve({
                    headers,
                    rows,
                    rowCount: rows.length,
                })
            },
            error: (error) => {
                reject(new Error(`CSV parsing failed: ${error.message}`))
            },
        })
    })
}

/**
 * Parse CSV from text content
 */
export function parseCSVText(content: string): ParsedSpreadsheetData {
    const results = Papa.parse(content, {
        header: false,
        skipEmptyLines: true,
        dynamicTyping: true,
    })

    if (results.errors.length > 0) {
        throw new Error(`CSV parsing error: ${results.errors[0].message}`)
    }

    const data = results.data as (string | number)[][]

    if (data.length === 0) {
        throw new Error('CSV content is empty')
    }

    const headers = data[0].map(h => String(h || '').trim())
    const rows = data.slice(1)

    return {
        headers,
        rows,
        rowCount: rows.length,
    }
}

/**
 * Detect date column from headers
 */
export function detectDateColumn(headers: string[]): number {
    const dateKeywords = ['date', 'day', 'time', 'timestamp', 'when']

    for (let i = 0; i < headers.length; i++) {
        const header = headers[i].toLowerCase()
        if (dateKeywords.some(keyword => header.includes(keyword))) {
            return i
        }
    }

    // Default to first column if no date column found
    return 0
}

/**
 * Validate parsed data
 */
export function validateParsedData(data: ParsedSpreadsheetData): {
    isValid: boolean
    errors: string[]
} {
    const errors: string[] = []

    if (data.headers.length === 0) {
        errors.push('No headers found in the file')
    }

    if (data.rowCount === 0) {
        errors.push('No data rows found in the file')
    }

    if (data.headers.length < 2) {
        errors.push('File must have at least 2 columns (date + at least one habit)')
    }

    // Check for consistent column count
    const headerCount = data.headers.length
    const inconsistentRows = data.rows.filter(row => row.length !== headerCount)
    if (inconsistentRows.length > 0) {
        errors.push(`${inconsistentRows.length} rows have inconsistent column counts`)
    }

    return {
        isValid: errors.length === 0,
        errors,
    }
}
