'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sparkles, ArrowRight, CheckCircle2, X } from 'lucide-react'
import { AIInsight } from '@/types/database'

interface AIInsightPanelProps {
  insights: AIInsight[]
  isPro: boolean
  onDismiss?: (id: string) => void
  onMarkRead?: (id: string) => void
}

export function AIInsightPanel({ insights, isPro, onDismiss, onMarkRead }: AIInsightPanelProps) {
  if (!isPro) {
    return (
      <Card className="border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-blue-500/5" />
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            AI Insights
            <Badge variant="secondary" className="ml-2 bg-amber-500/10 text-amber-400 border-amber-500/20">
              Pro
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <p className="text-zinc-400 mb-4">
            Unlock AI-powered habit stacking suggestions and personalized recommendations.
          </p>
          <Button className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white">
            Upgrade to Pro
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    )
  }

  const activeInsights = insights.filter(i => !i.is_dismissed).slice(0, 3)

  if (activeInsights.length === 0) {
    return (
      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <p className="text-zinc-400">All caught up! No new insights.</p>
            <p className="text-zinc-500 text-sm mt-1">Keep tracking to generate new suggestions.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-zinc-800 bg-zinc-900/50">
      <CardHeader>
        <CardTitle className="text-lg text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          AI Insights
          {activeInsights.filter(i => !i.is_read).length > 0 && (
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
              {activeInsights.filter(i => !i.is_read).length} new
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {activeInsights.map((insight) => (
          <div
            key={insight.id}
            className={`p-4 rounded-lg border transition-colors ${
              insight.is_read
                ? 'bg-zinc-800/30 border-zinc-800'
                : 'bg-zinc-800/50 border-zinc-700'
            }`}
            onClick={() => !insight.is_read && onMarkRead?.(insight.id)}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                {insight.title && (
                  <h4 className="text-sm font-medium text-white mb-1">{insight.title}</h4>
                )}
                <p className="text-sm text-zinc-400">{insight.content}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-zinc-500 hover:text-zinc-300"
                onClick={(e) => {
                  e.stopPropagation()
                  onDismiss?.(insight.id)
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
