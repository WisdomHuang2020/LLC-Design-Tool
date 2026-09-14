// 可折叠卡片外壳 —— Designer 结果区各分区的统一容器。
// 标题行为整宽按钮：左侧图标 + 标题，右侧折叠指示箭头。
import type { ReactNode } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface CollapsibleCardProps {
  icon: ReactNode
  title: string
  collapsed: boolean
  onToggle: () => void
  children: ReactNode
}

export default function CollapsibleCard({ icon, title, collapsed, onToggle, children }: CollapsibleCardProps) {
  return (
    <div className="card-surface p-5">
      <button onClick={onToggle} className="w-full flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
        </div>
        {collapsed ? <ChevronDown className="w-4 h-4 text-text-muted" /> : <ChevronUp className="w-4 h-4 text-text-muted" />}
      </button>
      {!collapsed && children}
    </div>
  )
}
