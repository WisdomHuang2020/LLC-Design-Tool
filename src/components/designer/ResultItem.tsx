// 单个计算结果的展示条目：标签 + 数值 + 单位 + 公式出处。
import type { ReactNode } from 'react'
import { Info } from 'lucide-react'

interface ResultItemProps {
  label: string
  value: string
  unit: string
  formula: string
  highlight?: 'good' | 'warn' | 'critical'
  /** 可选的右上角自定义控件（用于切换口径等）；不传则显示信息图标 */
  action?: ReactNode
}

export default function ResultItem({ label, value, unit, formula, highlight, action }: ResultItemProps) {
  return (
    <div className="bg-surface-elevated rounded-lg p-3 border border-border hover:border-border-light transition-colors">
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="text-xs text-text-secondary">{label}</span>
        {action ?? <Info className="w-3.5 h-3.5 text-text-muted shrink-0" />}
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
