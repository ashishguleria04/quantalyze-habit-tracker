'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { ColumnMapping, ParsedSpreadsheetData, HABIT_CATEGORIES, GOAL_TYPES, WEIGHT_OPTIONS } from '@/types/habits'
import { HabitCategory, GoalType } from '@/types/database'
import { Calendar, Hash, Clock, ToggleLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ColumnMapperProps {
  data: ParsedSpreadsheetData
  dateColumn: number
  mappings: ColumnMapping[]
  onDateColumnChange: (index: number) => void
  onMappingsChange: (mappings: ColumnMapping[]) => void
}

const GOAL_TYPE_ICONS = {
  binary: ToggleLeft,
  number: Hash,
  duration: Clock,
}

export function ColumnMapper({
  data,
  dateColumn,
  mappings,
  onDateColumnChange,
  onMappingsChange,
}: ColumnMapperProps) {
  const [selectedColumns, setSelectedColumns] = useState<Set<number>>(
    new Set(mappings.map(m => m.columnIndex))
  )

  const toggleColumn = (index: number) => {
    const newSelected = new Set(selectedColumns)
    if (newSelected.has(index)) {
      newSelected.delete(index)
      onMappingsChange(mappings.filter(m => m.columnIndex !== index))
    } else {
      newSelected.add(index)
      const newMapping: ColumnMapping = {
        columnIndex: index,
        columnName: data.headers[index],
        habitName: data.headers[index],
        category: 'discipline' as HabitCategory,
        goal_type: 'binary' as GoalType,
        weight: 3,
      }
      onMappingsChange([...mappings, newMapping])
    }
    setSelectedColumns(newSelected)
  }

  const updateMapping = (columnIndex: number, updates: Partial<ColumnMapping>) => {
    onMappingsChange(
      mappings.map(m => 
        m.columnIndex === columnIndex ? { ...m, ...updates } : m
      )
    )
  }

  // Get sample values for display
  const getSampleValues = (columnIndex: number) => {
    return data.rows.slice(0, 3).map(row => String(row[columnIndex] || '-'))
  }

  return (
    <div className="space-y-6">
      {/* Date Column Selection */}
      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            Date Column
          </CardTitle>
          <CardDescription>
            Select the column that contains your dates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={String(dateColumn)}
            onValueChange={(value) => onDateColumnChange(parseInt(value))}
          >
            <SelectTrigger className="w-full border-zinc-700 bg-zinc-800/50 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-700">
              {data.headers.map((header, index) => (
                <SelectItem 
                  key={index} 
                  value={String(index)}
                  className="text-zinc-300 focus:bg-zinc-800 focus:text-white"
                >
                  {header}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Habit Columns Selection */}
      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardHeader>
          <CardTitle className="text-lg text-white">Map Habit Columns</CardTitle>
          <CardDescription>
            Select columns to import as habits and configure their settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.headers.map((header, index) => {
              if (index === dateColumn) return null
              
              const isSelected = selectedColumns.has(index)
              const mapping = mappings.find(m => m.columnIndex === index)
              const samples = getSampleValues(index)
              
              return (
                <div
                  key={index}
                  className={cn(
                    "border rounded-xl transition-colors",
                    isSelected
                      ? "border-emerald-500/50 bg-emerald-500/5"
                      : "border-zinc-800 bg-zinc-800/30"
                  )}
                >
                  {/* Column Header */}
                  <div className="p-4 flex items-center gap-4">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleColumn(index)}
                      className="border-zinc-600 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{header}</p>
                      <p className="text-xs text-zinc-500">
                        Sample: {samples.join(', ')}
                      </p>
                    </div>
                  </div>

                  {/* Mapping Configuration */}
                  {isSelected && mapping && (
                    <div className="border-t border-zinc-800 p-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Habit Name */}
                        <div className="space-y-2">
                          <Label className="text-zinc-400 text-xs">Habit Name</Label>
                          <Input
                            value={mapping.habitName || ''}
                            onChange={(e) => updateMapping(index, { habitName: e.target.value })}
                            placeholder="Enter habit name"
                            className="border-zinc-700 bg-zinc-800/50 text-white"
                          />
                        </div>

                        {/* Category */}
                        <div className="space-y-2">
                          <Label className="text-zinc-400 text-xs">Category</Label>
                          <Select
                            value={mapping.category}
                            onValueChange={(value) => updateMapping(index, { category: value as HabitCategory })}
                          >
                            <SelectTrigger className="border-zinc-700 bg-zinc-800/50 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-700">
                              {HABIT_CATEGORIES.map((cat) => (
                                <SelectItem 
                                  key={cat.value} 
                                  value={cat.value}
                                  className="text-zinc-300 focus:bg-zinc-800 focus:text-white"
                                >
                                  <div className="flex items-center gap-2">
                                    <div 
                                      className="w-2 h-2 rounded-full"
                                      style={{ backgroundColor: cat.color }}
                                    />
                                    {cat.label}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Goal Type */}
                        <div className="space-y-2">
                          <Label className="text-zinc-400 text-xs">Goal Type</Label>
                          <Select
                            value={mapping.goal_type}
                            onValueChange={(value) => updateMapping(index, { goal_type: value as GoalType })}
                          >
                            <SelectTrigger className="border-zinc-700 bg-zinc-800/50 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-700">
                              {GOAL_TYPES.map((type) => {
                                const Icon = GOAL_TYPE_ICONS[type.value]
                                return (
                                  <SelectItem 
                                    key={type.value} 
                                    value={type.value}
                                    className="text-zinc-300 focus:bg-zinc-800 focus:text-white"
                                  >
                                    <div className="flex items-center gap-2">
                                      <Icon className="w-4 h-4" />
                                      {type.label}
                                    </div>
                                  </SelectItem>
                                )
                              })}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Weight */}
                        <div className="space-y-2">
                          <Label className="text-zinc-400 text-xs">Weight (1-5)</Label>
                          <Select
                            value={String(mapping.weight)}
                            onValueChange={(value) => updateMapping(index, { weight: parseInt(value) })}
                          >
                            <SelectTrigger className="border-zinc-700 bg-zinc-800/50 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-700">
                              {WEIGHT_OPTIONS.map((opt) => (
                                <SelectItem 
                                  key={opt.value} 
                                  value={String(opt.value)}
                                  className="text-zinc-300 focus:bg-zinc-800 focus:text-white"
                                >
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Goal Value (for number/duration types) */}
                        {(mapping.goal_type === 'number' || mapping.goal_type === 'duration') && (
                          <>
                            <div className="space-y-2">
                              <Label className="text-zinc-400 text-xs">Target Value</Label>
                              <Input
                                type="number"
                                value={mapping.goal_value || ''}
                                onChange={(e) => updateMapping(index, { goal_value: parseFloat(e.target.value) || undefined })}
                                placeholder="e.g., 10000"
                                className="border-zinc-700 bg-zinc-800/50 text-white"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-zinc-400 text-xs">Unit</Label>
                              <Input
                                value={mapping.unit || ''}
                                onChange={(e) => updateMapping(index, { unit: e.target.value })}
                                placeholder="e.g., steps, minutes"
                                className="border-zinc-700 bg-zinc-800/50 text-white"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
