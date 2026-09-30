// 可折叠卡片外壳 —— Designer 结果区各分区的统一容器。
// 标题行为整宽按钮：左侧图标 + 标题，右侧折叠指示箭头。
// headerExtra：可选的标题栏右侧附加控件（如「隐藏注释」开关）—— 注意它必须与折叠按钮**平级**，
// 不能塞进按钮内部（HTML 不允许按钮嵌套）。
import type { ReactNode } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface CollapsibleCardProps {
  icon: ReactNode
  title: string
  collapsed: boolean
  onToggle: () => void
  /** 标题栏右侧的附加控件（与折叠按钮平级，点击不会触发展开/收起） */
  headerExtra?: ReactNode
  children: ReactNode
}

export default function CollapsibleCard({ icon, title, collapsed, onToggle, headerExtra, children }: CollapsibleCardProps) {
  return (
    <div className="card-surface p-5">
      <div className="flex items-center gap-2 mb-2">
        <button onClick={onToggle} className="flex-1 min-w-0 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            {icon}
            <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
          </div>
          {collapsed ? <ChevronDown className="w-4 h-4 text-text-muted" /> : <ChevronUp className="w-4 h-4 text-text-muted" />}
        </button>
        {headerExtra}
      </div>
      {!collapsed && children}
    </div>
  )
}
