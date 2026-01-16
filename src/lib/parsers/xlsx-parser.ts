import * as XLSX from 'xlsx'
import { ParsedSpreadsheetData } from '@/types/habits'

/**
 * Parse Excel file (XLSX/XLS) and return structured data
 */
export async function parseXLSX(file: File): Promise<ParsedSpreadsheetData> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = (e) => {
            try {
                const data = e.target?.result
                if (!data) {
                    reject(new Error('Failed to read file'))
                    return
                }

                const workbook = XLSX.read(data, { type: 'array' })

                // Get first sheet
                const firstSheetName = workbook.SheetNames[0]
                if (!firstSheetName) {
                    reject(new Error('Excel file has no sheets'))
                    return
                }

                const worksheet = workbook.Sheets[firstSheetName]

                // Convert to JSON array
                const jsonData = XLSX.utils.sheet_to_json<(string | number)[]>(worksheet, {
                    header: 1,
                    defval: '',
                    blankrows: false,
                })

                if (jsonData.length === 0) {
                    reject(new Error('Excel sheet is empty'))
                    return
                }

                const headers = jsonData[0].map(h => String(h || '').trim())
                const rows = jsonData.slice(1)

                resolve({
                    headers,
                    rows,
                    rowCount: rows.length,
                })
            } catch (error) {
                reject(new Error(`Excel parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`))
            }
        }

        reader.onerror = () => {
            reject(new Error('Failed to read Excel file'))
        }

        reader.readAsArrayBuffer(file)
    })
}

/**
 * Parse Excel from buffer (for server-side processing)
 */
export function parseXLSXBuffer(buffer: Buffer | ArrayBuffer): ParsedSpreadsheetData {
    const workbook = XLSX.read(buffer, { type: 'array' })

    const firstSheetName = workbook.SheetNames[0]
    if (!firstSheetName) {
        throw new Error('Excel file has no sheets')
    }

    const worksheet = workbook.Sheets[firstSheetName]

    const jsonData = XLSX.utils.sheet_to_json<(string | number)[]>(worksheet, {
        header: 1,
        defval: '',
        blankrows: false,
    })

    if (jsonData.length === 0) {
        throw new Error('Excel sheet is empty')
    }

    const headers = jsonData[0].map(h => String(h || '').trim())
    const rows = jsonData.slice(1)

    return {
        headers,
        rows,
        rowCount: rows.length,
    }
}

/**
 * Get sheet names from Excel file
 */
export async function getSheetNames(file: File): Promise<string[]> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = (e) => {
            try {
                const data = e.target?.result
                if (!data) {
                    reject(new Error('Failed to read file'))
                    return
                }

                const workbook = XLSX.read(data, { type: 'array' })
                resolve(workbook.SheetNames)
            } catch (error) {
                reject(new Error(`Failed to read sheet names: ${error instanceof Error ? error.message : 'Unknown error'}`))
            }
        }

        reader.onerror = () => {
            reject(new Error('Failed to read Excel file'))
        }

        reader.readAsArrayBuffer(file)
    })
}

/**
 * Parse specific sheet from Excel file
 */
export async function parseXLSXSheet(file: File, sheetName: string): Promise<ParsedSpreadsheetData> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = (e) => {
            try {
                const data = e.target?.result
                if (!data) {
                    reject(new Error('Failed to read file'))
                    return
                }

                const workbook = XLSX.read(data, { type: 'array' })

                if (!workbook.SheetNames.includes(sheetName)) {
                    reject(new Error(`Sheet "${sheetName}" not found`))
                    return
                }

                const worksheet = workbook.Sheets[sheetName]

                const jsonData = XLSX.utils.sheet_to_json<(string | number)[]>(worksheet, {
                    header: 1,
                    defval: '',
                    blankrows: false,
                })

                if (jsonData.length === 0) {
                    reject(new Error('Excel sheet is empty'))
                    return
                }

                const headers = jsonData[0].map(h => String(h || '').trim())
                const rows = jsonData.slice(1)

                resolve({
                    headers,
                    rows,
                    rowCount: rows.length,
                })
            } catch (error) {
                reject(new Error(`Excel parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`))
            }
        }

        reader.onerror = () => {
            reject(new Error('Failed to read Excel file'))
        }

        reader.readAsArrayBuffer(file)
    })
}
