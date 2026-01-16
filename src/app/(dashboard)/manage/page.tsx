import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ManageContent } from '@/app/(dashboard)/manage/manage-content'

export default async function ManagePage() {
  const supabase = await createClient()
  const user = await getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Fetch habits
  const { data: habits } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', user.id)
    .order('category')
    .order('display_order')

  // Fetch recent logs (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  const { data: dailyLogs } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('user_id', user.id)
    .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
    .order('date', { ascending: false })

  return (
    <ManageContent 
      initialHabits={habits || []} 
      initialLogs={dailyLogs || []} 
    />
  )
}
