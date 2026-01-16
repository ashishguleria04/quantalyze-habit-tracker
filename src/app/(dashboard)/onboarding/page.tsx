'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileUploader } from '@/components/onboarding/file-uploader'
import { ColumnMapper } from '@/components/onboarding/column-mapper'
import { ColumnMapping, ParsedSpreadsheetData } from '@/types/habits'
import { Habit, Database } from '@/types/database'
import { parseSpreadsheet } from '@/lib/parsers/column-mapper'
import { detectDateColumn, autoMapColumns } from '@/lib/parsers/column-mapper'
import { getSupabaseClient } from '@/lib/supabase/client'
import { normalizeValue } from '@/lib/analytics/normalizer'
import { parseDate } from '@/lib/parsers/column-mapper'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { ArrowLeft, ArrowRight, Check, Loader2, Sparkles } from 'lucide-react'

type Step = 'upload' | 'map' | 'confirm'

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = getSupabaseClient()
  
  const [step, setStep] = useState<Step>('upload')
  const [isLoading, setIsLoading] = useState(false)
  const [parsedData, setParsedData] = useState<ParsedSpreadsheetData | null>(null)
  const [dateColumn, setDateColumn] = useState(0)
  const [mappings, setMappings] = useState<ColumnMapping[]>([])

  const handleFileSelect = async (file: File) => {
    setIsLoading(true)
    try {
      const data = await parseSpreadsheet(file)
      setParsedData(data)
      
      // Auto-detect date column and mappings
      const detectedDateCol = detectDateColumn(data.headers)
      setDateColumn(detectedDateCol)
      
      const autoMappings = autoMapColumns(data, detectedDateCol)
      setMappings(autoMappings)
      
      setStep('map')
      toast.success(`Parsed ${data.rowCount} rows successfully`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to parse file')
    } finally {
      setIsLoading(false)
    }
  }

  const handleImport = async () => {
    if (!parsedData || mappings.length === 0) return
    
    setIsLoading(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // 1. Create habits
      const habitsToCreate: Database['public']['Tables']['habits']['Insert'][] = mappings.map(m => ({
        user_id: user.id,
        name: m.habitName || m.columnName,
        category: m.category,
        weight: m.weight,
        goal_type: m.goal_type,
        goal_value: m.goal_value,
        unit: m.unit,
        is_active: true,
      }))

      const { data: createdHabits, error: habitsError } = await supabase
        .from('habits')
        .insert(habitsToCreate as any)
        .select() as { data: Habit[] | null, error: Error | null }

      if (habitsError) throw habitsError

      // 2. Create daily logs
      const logsToCreate: {
        user_id: string
        habit_id: string
        date: string
        value: number
        normalized_value: number
      }[] = []

      for (const row of parsedData.rows) {
        const dateValue = row[dateColumn]
        const date = parseDate(String(dateValue))
        if (!date) continue

        const dateStr = format(date, 'yyyy-MM-dd')

        for (const mapping of mappings) {
          const habit = createdHabits?.find(h => h.name === (mapping.habitName || mapping.columnName))
          if (!habit) continue

          const rawValue = row[mapping.columnIndex]
          const normalized = normalizeValue({
            goalType: mapping.goal_type,
            goalValue: mapping.goal_value,
            rawValue,
          })

          logsToCreate.push({
            user_id: user.id,
            habit_id: habit.id,
            date: dateStr,
            value: normalized.rawValue,
            normalized_value: normalized.normalizedValue,
          })
        }
      }

      // Insert logs in batches
      const batchSize = 500
      for (let i = 0; i < logsToCreate.length; i += batchSize) {
        const batch = logsToCreate.slice(i, i + batchSize)
        const { error: logsError } = await supabase
          .from('daily_logs')
          .insert(batch as any)
        
        if (logsError) {
          console.error('Error inserting logs batch:', logsError)
        }
      }

      toast.success(`Imported ${createdHabits?.length} habits and ${logsToCreate.length} log entries!`)
      router.push('/dashboard')
    } catch (error) {
      console.error('Import error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to import data')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Import Your Habit Data</h1>
        <p className="text-zinc-400 mt-1">
          Upload your spreadsheet and map columns to habits
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-4 mb-8">
        {(['upload', 'map', 'confirm'] as Step[]).map((s, index) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                step === s
                  ? 'bg-emerald-500 text-white'
                  : index < ['upload', 'map', 'confirm'].indexOf(step)
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-zinc-800 text-zinc-500'
              }`}
            >
              {index < ['upload', 'map', 'confirm'].indexOf(step) ? (
                <Check className="w-4 h-4" />
              ) : (
                index + 1
              )}
            </div>
            {index < 2 && (
              <div
                className={`w-12 h-0.5 ml-4 ${
                  index < ['upload', 'map', 'confirm'].indexOf(step)
                    ? 'bg-emerald-500'
                    : 'bg-zinc-800'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      {step === 'upload' && (
        <FileUploader onFileSelect={handleFileSelect} isLoading={isLoading} />
      )}

      {step === 'map' && parsedData && (
        <>
          <ColumnMapper
            data={parsedData}
            dateColumn={dateColumn}
            mappings={mappings}
            onDateColumnChange={setDateColumn}
            onMappingsChange={setMappings}
          />
          
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => setStep('upload')}
              className="border-zinc-700 text-zinc-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={() => setStep('confirm')}
              disabled={mappings.length === 0}
              className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white"
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </>
      )}

      {step === 'confirm' && (
        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardHeader>
            <CardTitle className="text-xl text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Ready to Import
            </CardTitle>
            <CardDescription>
              Review your import configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-zinc-800/50">
                <p className="text-sm text-zinc-400">Total Rows</p>
                <p className="text-2xl font-bold text-white">{parsedData?.rowCount}</p>
              </div>
              <div className="p-4 rounded-lg bg-zinc-800/50">
                <p className="text-sm text-zinc-400">Habits to Create</p>
                <p className="text-2xl font-bold text-white">{mappings.length}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-zinc-300">Habits:</p>
              <div className="flex flex-wrap gap-2">
                {mappings.map((m) => (
                  <span
                    key={m.columnIndex}
                    className="px-3 py-1 rounded-full bg-zinc-800 text-sm text-zinc-300"
                  >
                    {m.habitName || m.columnName}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => setStep('map')}
                className="border-zinc-700 text-zinc-300"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleImport}
                disabled={isLoading}
                className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    Import Data
                    <Check className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
