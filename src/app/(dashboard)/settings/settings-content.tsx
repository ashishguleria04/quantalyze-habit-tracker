'use client'

import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { Profile } from '@/types/database'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getSupabaseClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { 
  User as UserIcon, 
  CreditCard, 
  Link as LinkIcon, 
  Shield, 
  Loader2,
  Check,
  Crown,
  ExternalLink
} from 'lucide-react'

interface SettingsContentProps {
  user: User
  profile: Profile | null
}

export function SettingsContent({ user, profile }: SettingsContentProps) {
  const supabase = getSupabaseClient()
  const [isLoading, setIsLoading] = useState(false)
  const [fullName, setFullName] = useState(profile?.full_name || '')
  
  const isPro = profile?.subscription_status === 'pro'

  const handleUpdateProfile = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', user.id)

      if (error) throw error
      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleManageBilling = async () => {
    // In production, this would redirect to Stripe Customer Portal
    toast.info('Stripe billing portal integration coming soon!')
  }

  const handleConnectGoogleSheets = async () => {
    // In production, this would initiate Google OAuth for Sheets API
    toast.info('Google Sheets integration coming soon!')
  }

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user.email?.slice(0, 2).toUpperCase() || 'U'

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-zinc-400 mt-1">Manage your account and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-zinc-800/50 border border-zinc-700">
          <TabsTrigger value="profile" className="data-[state=active]:bg-zinc-700 data-[state=active]:text-white">
            <UserIcon className="w-4 h-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="billing" className="data-[state=active]:bg-zinc-700 data-[state=active]:text-white">
            <CreditCard className="w-4 h-4 mr-2" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="integrations" className="data-[state=active]:bg-zinc-700 data-[state=active]:text-white">
            <LinkIcon className="w-4 h-4 mr-2" />
            Integrations
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="border-zinc-800 bg-zinc-900/50">
            <CardHeader>
              <CardTitle className="text-white">Profile Information</CardTitle>
              <CardDescription>Update your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile?.avatar_url || ''} />
                  <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-blue-500 text-white text-xl">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-white font-medium">{profile?.full_name || 'User'}</p>
                  <p className="text-sm text-zinc-400">{user.email}</p>
                  <div className="mt-2">
                    {isPro ? (
                      <Badge className="bg-gradient-to-r from-amber-500/20 to-amber-600/20 text-amber-400 border-amber-500/30">
                        <Crown className="w-3 h-3 mr-1" />
                        Pro Member
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-zinc-800 text-zinc-400 border-zinc-700">
                        Free Plan
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <Separator className="bg-zinc-800" />

              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label className="text-zinc-300">Full Name</Label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your name"
                    className="border-zinc-700 bg-zinc-800/50 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">Email</Label>
                  <Input
                    value={user.email || ''}
                    disabled
                    className="border-zinc-700 bg-zinc-800/50 text-zinc-400"
                  />
                  <p className="text-xs text-zinc-500">Email cannot be changed</p>
                </div>
              </div>

              <Button 
                onClick={handleUpdateProfile} 
                disabled={isLoading}
                className="bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Check className="w-4 h-4 mr-2" />
                )}
                Save Changes
              </Button>
            </CardContent>
          </Card>

          <Card className="border-zinc-800 bg-zinc-900/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-rose-400" />
                Danger Zone
              </CardTitle>
              <CardDescription>Irreversible actions</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" className="bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20">
                Delete Account
              </Button>
              <p className="text-xs text-zinc-500 mt-2">
                This will permanently delete your account and all associated data.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-6">
          <Card className="border-zinc-800 bg-zinc-900/50">
            <CardHeader>
              <CardTitle className="text-white">Subscription</CardTitle>
              <CardDescription>Manage your subscription plan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">
                      {isPro ? 'Pro Plan' : 'Free Plan'}
                    </p>
                    <p className="text-sm text-zinc-400">
                      {isPro ? '$12/month' : 'Basic features'}
                    </p>
                  </div>
                  {isPro ? (
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                      Active
                    </Badge>
                  ) : (
                    <Button className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white">
                      Upgrade to Pro
                    </Button>
                  )}
                </div>
              </div>

              {isPro && (
                <Button 
                  variant="outline" 
                  onClick={handleManageBilling}
                  className="border-zinc-700 text-zinc-300"
                >
                  Manage Billing
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              )}

              <Separator className="bg-zinc-800" />

              <div>
                <h4 className="text-sm font-medium text-white mb-4">Plan Comparison</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-zinc-800/30 border border-zinc-800">
                    <h5 className="font-medium text-zinc-300 mb-3">Free</h5>
                    <ul className="space-y-2 text-sm text-zinc-400">
                      <li>• Up to 10 habits</li>
                      <li>• CSV import only</li>
                      <li>• 30-day history</li>
                      <li>• Basic analytics</li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-emerald-500/30">
                    <h5 className="font-medium text-white mb-3 flex items-center gap-2">
                      Pro <Crown className="w-4 h-4 text-amber-400" />
                    </h5>
                    <ul className="space-y-2 text-sm text-zinc-300">
                      <li>• Unlimited habits</li>
                      <li>• CSV & Excel import</li>
                      <li>• Google Sheets sync</li>
                      <li>• AI insights & suggestions</li>
                      <li>• Unlimited history</li>
                      <li>• Priority support</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-6">
          <Card className="border-zinc-800 bg-zinc-900/50">
            <CardHeader>
              <CardTitle className="text-white">Google Sheets</CardTitle>
              <CardDescription>Sync your habit data from Google Sheets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-800/30 border border-zinc-800">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.385 2H4.615A2.615 2.615 0 002 4.615v14.77A2.615 2.615 0 004.615 22h14.77A2.615 2.615 0 0022 19.385V4.615A2.615 2.615 0 0019.385 2zM8.462 17.538H5.538v-2.923h2.923v2.923zm0-4.461H5.538v-2.924h2.923v2.924zm0-4.462H5.538V5.692h2.923v2.923zm5.538 8.923h-4v-2.923h4v2.923zm0-4.461h-4v-2.924h4v2.924zm0-4.462h-4V5.692h4v2.923zm4 8.923h-2.538v-2.923H18v2.923zm0-4.461h-2.538v-2.924H18v2.924zm0-4.462h-2.538V5.692H18v2.923z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-white">Google Sheets</p>
                    <p className="text-sm text-zinc-400">Not connected</p>
                  </div>
                </div>
                <Button 
                  onClick={handleConnectGoogleSheets}
                  disabled={!isPro}
                  className={isPro 
                    ? "bg-emerald-500 hover:bg-emerald-600 text-white" 
                    : "bg-zinc-800 text-zinc-500 cursor-not-allowed"}
                >
                  {isPro ? 'Connect' : 'Pro Only'}
                </Button>
              </div>
              {!isPro && (
                <p className="text-sm text-zinc-500 mt-4">
                  Upgrade to Pro to connect your Google Sheets and enable automatic syncing.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-zinc-800 bg-zinc-900/50">
            <CardHeader>
              <CardTitle className="text-white">API Access</CardTitle>
              <CardDescription>Connect external tools via API</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-xl bg-zinc-800/30 border border-zinc-800 text-center">
                <p className="text-zinc-400">API access coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
