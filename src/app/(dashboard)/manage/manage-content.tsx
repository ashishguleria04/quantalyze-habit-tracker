'use client'

import { useState } from 'react'
import { Habit, DailyLog, Database } from '@/types/database'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { HABIT_CATEGORIES, GOAL_TYPES, WEIGHT_OPTIONS } from '@/types/habits'
import { HabitCategory, GoalType } from '@/types/database'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Calendar, Loader2 } from 'lucide-react'
import { format, subDays } from 'date-fns'

type HabitInsert = Database['public']['Tables']['habits']['Insert']
type DailyLogInsert = Database['public']['Tables']['daily_logs']['Insert']

interface ManageContentProps {
  initialHabits: Habit[]
  initialLogs: DailyLog[]
}

const CATEGORY_COLORS: Record<HabitCategory, string> = {
  vitality: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  focus: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  discipline: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  social: 'bg-violet-500/10 text-violet-400 border-violet-500/30',
}

export function ManageContent({ initialHabits, initialLogs }: ManageContentProps) {
  const supabase = createClient()
  const [habits, setHabits] = useState(initialHabits)
  const [logs, setLogs] = useState(initialLogs)
  const [isAddHabitOpen, setIsAddHabitOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  
  // Form state for new/edit habit
  const [habitForm, setHabitForm] = useState({
    name: '',
    category: 'discipline' as HabitCategory,
    weight: 3,
    goal_type: 'binary' as GoalType,
    goal_value: undefined as number | undefined,
    unit: '',
  })

  // Quick log state
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))

  const resetForm = () => {
    setHabitForm({
      name: '',
      category: 'discipline',
      weight: 3,
      goal_type: 'binary',
      goal_value: undefined,
      unit: '',
    })
    setEditingHabit(null)
  }

  const handleSaveHabit = async () => {
    if (!habitForm.name) {
      toast.error('Please enter a habit name')
      return
    }

    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      if (editingHabit) {
        // Update existing habit
        const updateData = {
          name: habitForm.name,
          category: habitForm.category,
          weight: habitForm.weight,
          goal_type: habitForm.goal_type,
          goal_value: habitForm.goal_value ?? null,
          unit: habitForm.unit || null,
        }
        const { data, error } = await supabase
          .from('habits')
          .update(updateData as any)
          .eq('id', editingHabit.id)
          .select()
          .single()

        if (error) throw error
        setHabits(habits.map(h => h.id === editingHabit.id ? data : h))
        toast.success('Habit updated')
      } else {
        // Create new habit
        const insertData: HabitInsert = {
          user_id: user.id,
          name: habitForm.name,
          category: habitForm.category,
          weight: habitForm.weight,
          goal_type: habitForm.goal_type,
          goal_value: habitForm.goal_value,
          unit: habitForm.unit || null,
          is_active: true,
        }
        const { data, error } = await supabase
          .from('habits')
          .insert(insertData as any)
          .select()
          .single()

        if (error) throw error
        setHabits([...habits, data])
        toast.success('Habit created')
      }

      setIsAddHabitOpen(false)
      resetForm()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save habit')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteHabit = async (id: string) => {
    if (!confirm('Are you sure you want to delete this habit? All associated logs will also be deleted.')) {
      return
    }

    try {
      const { error } = await supabase.from('habits').delete().eq('id', id)
      if (error) throw error
      setHabits(habits.filter(h => h.id !== id))
      toast.success('Habit deleted')
    } catch (error) {
      toast.error('Failed to delete habit')
    }
  }

  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit)
    setHabitForm({
      name: habit.name,
      category: habit.category,
      weight: habit.weight,
      goal_type: habit.goal_type,
      goal_value: habit.goal_value ?? undefined,
      unit: habit.unit ?? '',
    })
    setIsAddHabitOpen(true)
  }

  const handleLogValue = async (habitId: string, value: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const habit = habits.find(h => h.id === habitId)
      if (!habit) return

      // Calculate normalized value
      let normalizedValue = value
      if (habit.goal_type !== 'binary' && habit.goal_value) {
        normalizedValue = Math.min(value / habit.goal_value, 1)
      } else {
        normalizedValue = value > 0 ? 1 : 0
      }

      // Upsert log
      const upsertData: DailyLogInsert = {
        user_id: user.id,
        habit_id: habitId,
        date: selectedDate,
        value,
        normalized_value: normalizedValue,
      }
      const { data, error } = await supabase
        .from('daily_logs')
        .upsert(upsertData as any, {
          onConflict: 'user_id,habit_id,date',
        })
        .select()
        .single()

      if (error) throw error
      
      // Update local state
      setLogs(prev => {
        const existing = prev.findIndex(l => l.habit_id === habitId && l.date === selectedDate)
        if (existing >= 0) {
          return prev.map((l, i) => i === existing ? data : l)
        }
        return [data, ...prev]
      })
      
      toast.success('Log saved')
    } catch (error) {
      toast.error('Failed to save log')
    }
  }

  // Get log value for a specific habit and date
  const getLogValue = (habitId: string, date: string) => {
    const log = logs.find(l => l.habit_id === habitId && l.date === date)
    return log?.value ?? null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Manage Habits</h1>
          <p className="text-zinc-400 mt-1">Create, edit, and log your daily habits</p>
        </div>
        <Dialog open={isAddHabitOpen} onOpenChange={(open) => {
          setIsAddHabitOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Habit
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingHabit ? 'Edit Habit' : 'Add New Habit'}
              </DialogTitle>
              <DialogDescription>
                Configure your habit tracking settings
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">Name</Label>
                <Input
                  value={habitForm.name}
                  onChange={(e) => setHabitForm({ ...habitForm, name: e.target.value })}
                  placeholder="e.g., Morning Exercise"
                  className="border-zinc-700 bg-zinc-800/50 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-zinc-300">Category</Label>
                  <Select
                    value={habitForm.category}
                    onValueChange={(v) => setHabitForm({ ...habitForm, category: v as HabitCategory })}
                  >
                    <SelectTrigger className="border-zinc-700 bg-zinc-800/50 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-700">
                      {HABIT_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value} className="text-zinc-300 focus:bg-zinc-800">
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">Weight</Label>
                  <Select
                    value={String(habitForm.weight)}
                    onValueChange={(v) => setHabitForm({ ...habitForm, weight: parseInt(v) })}
                  >
                    <SelectTrigger className="border-zinc-700 bg-zinc-800/50 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-700">
                      {WEIGHT_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={String(opt.value)} className="text-zinc-300 focus:bg-zinc-800">
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Goal Type</Label>
                <Select
                  value={habitForm.goal_type}
                  onValueChange={(v) => setHabitForm({ ...habitForm, goal_type: v as GoalType })}
                >
                  <SelectTrigger className="border-zinc-700 bg-zinc-800/50 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-700">
                    {GOAL_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value} className="text-zinc-300 focus:bg-zinc-800">
                        {type.label} - {type.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {habitForm.goal_type !== 'binary' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-zinc-300">Target Value</Label>
                    <Input
                      type="number"
                      value={habitForm.goal_value ?? ''}
                      onChange={(e) => setHabitForm({ ...habitForm, goal_value: parseFloat(e.target.value) || undefined })}
                      placeholder="e.g., 10000"
                      className="border-zinc-700 bg-zinc-800/50 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-300">Unit</Label>
                    <Input
                      value={habitForm.unit}
                      onChange={(e) => setHabitForm({ ...habitForm, unit: e.target.value })}
                      placeholder="e.g., steps"
                      className="border-zinc-700 bg-zinc-800/50 text-white"
                    />
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddHabitOpen(false)} className="border-zinc-700 text-zinc-300">
                Cancel
              </Button>
              <Button onClick={handleSaveHabit} disabled={isLoading} className="bg-emerald-500 hover:bg-emerald-600 text-white">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingHabit ? 'Save Changes' : 'Add Habit')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="habits" className="space-y-4">
        <TabsList className="bg-zinc-800/50 border border-zinc-700">
          <TabsTrigger value="habits" className="data-[state=active]:bg-zinc-700 data-[state=active]:text-white">
            Habits
          </TabsTrigger>
          <TabsTrigger value="logs" className="data-[state=active]:bg-zinc-700 data-[state=active]:text-white">
            Quick Log
          </TabsTrigger>
        </TabsList>

        <TabsContent value="habits">
          <Card className="border-zinc-800 bg-zinc-900/50">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-800 hover:bg-transparent">
                    <TableHead className="text-zinc-400">Name</TableHead>
                    <TableHead className="text-zinc-400">Category</TableHead>
                    <TableHead className="text-zinc-400">Type</TableHead>
                    <TableHead className="text-zinc-400">Weight</TableHead>
                    <TableHead className="text-zinc-400 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {habits.map((habit) => (
                    <TableRow key={habit.id} className="border-zinc-800">
                      <TableCell className="font-medium text-white">{habit.name}</TableCell>
                      <TableCell>
                        <Badge className={CATEGORY_COLORS[habit.category]}>
                          {HABIT_CATEGORIES.find(c => c.value === habit.category)?.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-zinc-300">
                        {GOAL_TYPES.find(t => t.value === habit.goal_type)?.label}
                        {habit.goal_value && ` (${habit.goal_value}${habit.unit ? ` ${habit.unit}` : ''})`}
                      </TableCell>
                      <TableCell className="text-zinc-300">{habit.weight}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEditHabit(habit)} className="text-zinc-400 hover:text-white">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteHabit(habit.id)} className="text-zinc-400 hover:text-rose-400">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {habits.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-zinc-500 py-8">
                        No habits yet. Add your first habit to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card className="border-zinc-800 bg-zinc-900/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">Quick Log Entry</CardTitle>
                  <CardDescription>Log your habits for a specific date</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-zinc-400" />
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-40 border-zinc-700 bg-zinc-800/50 text-white"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {habits.filter(h => h.is_active).map((habit) => {
                  const currentValue = getLogValue(habit.id, selectedDate)
                  
                  return (
                    <div key={habit.id} className="flex items-center justify-between p-4 rounded-lg bg-zinc-800/30 border border-zinc-800">
                      <div>
                        <p className="font-medium text-white">{habit.name}</p>
                        <p className="text-xs text-zinc-500">
                          {GOAL_TYPES.find(t => t.value === habit.goal_type)?.label}
                          {habit.goal_value && ` • Target: ${habit.goal_value} ${habit.unit || ''}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {habit.goal_type === 'binary' ? (
                          <Button
                            variant={currentValue === 1 ? 'default' : 'outline'}
                            onClick={() => handleLogValue(habit.id, currentValue === 1 ? 0 : 1)}
                            className={currentValue === 1 
                              ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                              : 'border-zinc-700 text-zinc-300'}
                          >
                            {currentValue === 1 ? 'Done ✓' : 'Mark Done'}
                          </Button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              placeholder="Value"
                              defaultValue={currentValue ?? ''}
                              onBlur={(e) => {
                                const val = parseFloat(e.target.value)
                                if (!isNaN(val)) handleLogValue(habit.id, val)
                              }}
                              className="w-24 border-zinc-700 bg-zinc-800/50 text-white"
                            />
                            <span className="text-sm text-zinc-500">{habit.unit || ''}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {habits.length === 0 && (
                  <p className="text-center text-zinc-500 py-8">
                    No habits yet. Add your first habit to get started.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
