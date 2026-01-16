import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardContent } from './dashboard-content'

export default async function DashboardPage() {
  const supabase = await createClient()
  const user = await getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Fetch user's profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch user's habits
  const { data: habits } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('display_order')

  // Fetch recent daily logs (last 90 days)
  const ninetyDaysAgo = new Date()
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
  
  const { data: dailyLogs } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('user_id', user.id)
    .gte('date', ninetyDaysAgo.toISOString().split('T')[0])
    .order('date', { ascending: false })

  // Fetch recent quality scores
  const { data: qualityScores } = await supabase
    .from('quality_scores')
    .select('*')
    .eq('user_id', user.id)
    .gte('date', ninetyDaysAgo.toISOString().split('T')[0])
    .order('date', { ascending: false })

  // Fetch AI insights
  const { data: aiInsights } = await supabase
    .from('ai_insights')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_dismissed', false)
    .order('created_at', { ascending: false })
    .limit(5)

  // Redirect to onboarding if no habits
  if (!habits || habits.length === 0) {
    redirect('/onboarding')
  }

  return (
    <DashboardContent
      profile={profile}
      habits={habits || []}
      dailyLogs={dailyLogs || []}
      qualityScores={qualityScores || []}
      aiInsights={aiInsights || []}
    />
  )
}
