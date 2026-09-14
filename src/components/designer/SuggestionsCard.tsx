// 优化建议列表：按 good / warn / critical 三档着色。
import { AlertTriangle, Server, XCircle } from 'lucide-react'
import CollapsibleCard from './CollapsibleCard'
import type { Suggestion } from '../../lib/designer/types'

interface SuggestionsCardProps {
  suggestions: Suggestion[]
  collapsed: boolean
  onToggle: () => void
}

export default function SuggestionsCard({ suggestions, collapsed, onToggle }: SuggestionsCardProps) {
  return (
    <CollapsibleCard
      icon={<AlertTriangle className="w-5 h-5 text-accent" />}
      title="优化建议"
      collapsed={collapsed}
      onToggle={onToggle}
    >
      <div className="space-y-3 mt-3">
        {suggestions.map((s, i) => (
          <div
            key={i}
            className={`flex items-start gap-3 p-3 rounded-lg border ${
              s.level === 'good'
                ? 'bg-green-500/10 border-green-500/30'
                : s.level === 'warn'
                ? 'bg-amber-500/10 border-amber-500/30'
                : 'bg-red-500/10 border-red-500/30'
            }`}
          >
            {s.level === 'good' ? (
              <Server className="w-5 h-5 text-success shrink-0 mt-0.5" />
            ) : s.level === 'warn' ? (
              <AlertTriangle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
            )}
            <p
              className={`text-sm ${
                s.level === 'good'
                  ? 'text-green-400'
                  : s.level === 'warn'
                  ? 'text-amber-400'
                  : 'text-red-400'
              }`}
            >
              {s.text}
            </p>
          </div>
        ))}
      </div>
    </CollapsibleCard>
  )
}
