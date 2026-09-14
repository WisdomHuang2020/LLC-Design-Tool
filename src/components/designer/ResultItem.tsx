// 单个计算结果的展示条目：标签 + 数值 + 单位 + 公式出处。
import { Info } from 'lucide-react'

interface ResultItemProps {
  label: string
  value: string
  unit: string
  formula: string
  highlight?: 'good' | 'warn' | 'critical'
}

export default function ResultItem({ label, value, unit, formula, highlight }: ResultItemProps) {
  return (
    <div className="bg-surface-elevated rounded-lg p-3 border border-border hover:border-border-light transition-colors">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-text-secondary">{label}</span>
        <Info className="w-3.5 h-3.5 text-text-muted" />
      </div>
      <div className="flex items-baseline gap-1">
        <span
          className={`text-xl font-mono font-semibold ${
            highlight === 'good' ? 'text-success' : highlight === 'warn' ? 'text-warning' : highlight === 'critical' ? 'text-danger' : 'text-text-primary'
          }`}
        >
          {value}
        </span>
        <span className="text-sm text-text-muted">{unit}</span>
      </div>
      <div className="text-xs text-text-muted mt-1 font-mono">{formula}</div>
    </div>
  )
}
