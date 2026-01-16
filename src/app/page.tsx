import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  BarChart3, 
  Brain, 
  FileSpreadsheet, 
  Sparkles, 
  Target, 
  TrendingUp,
  ArrowRight,
  CheckCircle2
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Quantalyze</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost" className="text-zinc-400 hover:text-white">
                  Log in
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white">
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-800/50 border border-zinc-700/50 mb-8">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-zinc-300">AI-Powered Habit Analytics</span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
            Turn Data into{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">
              Discipline
            </span>
          </h1>
          
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10">
            Import your habit spreadsheets and transform them into weighted Quality Scores. 
            Get AI insights that actually help you build lasting habits.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white px-8 h-12 text-lg">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 px-8 h-12 text-lg">
                See How It Works
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything you need to master your habits
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              From spreadsheet import to AI-powered insights—all in one platform.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 backdrop-blur">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4">
                <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Smart Import</h3>
              <p className="text-zinc-400">
                Upload CSV or Excel files. Our parser auto-detects columns and maps them to habits.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 backdrop-blur">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Quality Buckets</h3>
              <p className="text-zinc-400">
                Organize habits into Vitality, Focus, Discipline, and Social categories with weighted scoring.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 backdrop-blur">
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-violet-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">AI Insights</h3>
              <p className="text-zinc-400">
                Get personalized habit stacking suggestions powered by advanced AI analysis.
              </p>
            </div>
            
            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 backdrop-blur">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Visual Analytics</h3>
              <p className="text-zinc-400">
                Radar charts, heatmaps, and trend lines to visualize your progress at a glance.
              </p>
            </div>
            
            {/* Feature 5 */}
            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 backdrop-blur">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-rose-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Quantalyze Score</h3>
              <p className="text-zinc-400">
                One number that represents your overall habit quality with consistency multipliers.
              </p>
            </div>
            
            {/* Feature 6 */}
            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 backdrop-blur">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Google Sheets Sync</h3>
              <p className="text-zinc-400">
                Connect your Google Sheets for automatic daily syncing. No manual uploads needed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-zinc-400 text-lg">
              Start free, upgrade when you&apos;re ready for more power.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <div className="p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800/50">
              <h3 className="text-xl font-semibold text-white mb-2">Free</h3>
              <div className="text-4xl font-bold text-white mb-6">$0<span className="text-lg font-normal text-zinc-400">/month</span></div>
              <ul className="space-y-3 mb-8">
                {['Up to 10 habits', 'CSV import', 'Basic analytics', '30-day history'].map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-zinc-300">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/signup">
                <Button variant="outline" className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                  Get Started
                </Button>
              </Link>
            </div>
            
            {/* Pro Tier */}
            <div className="p-8 rounded-2xl bg-gradient-to-b from-emerald-500/10 to-blue-500/10 border border-emerald-500/30 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full text-xs font-medium text-white">
                Most Popular
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Pro</h3>
              <div className="text-4xl font-bold text-white mb-6">$12<span className="text-lg font-normal text-zinc-400">/month</span></div>
              <ul className="space-y-3 mb-8">
                {['Unlimited habits', 'Excel & Google Sheets sync', 'AI insights & suggestions', 'Unlimited history', 'Priority support'].map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-zinc-300">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/signup?plan=pro">
                <Button className="w-full bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white">
                  Start Free Trial
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 py-12 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">Quantalyze</span>
          </div>
          <p className="text-zinc-500 text-sm">
            © 2026 Quantalyze. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
