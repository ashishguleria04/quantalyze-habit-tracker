import { createClient } from '@/lib/supabase/server'
import { getUser, getProfile } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SettingsContent } from './settings-content'

export default async function SettingsPage() {
  const user = await getUser()
  
  if (!user) {
    redirect('/login')
  }

  const profile = await getProfile()

  return <SettingsContent user={user} profile={profile} />
}
