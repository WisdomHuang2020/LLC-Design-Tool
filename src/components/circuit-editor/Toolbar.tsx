import type { Phase } from './types'
import { PHASES } from './constants'

interface ToolbarProps {
  activePhase: Phase
  onPhaseChange: (phase: number) => void
  onExport: () => void
  onExportCopy: () => void
}

/**
 * 电路编辑器工具栏
 * - 阶段选择器（6 个 LLC 开关阶段）
 * - 导出按钮
 */
export default function Toolbar({ activePhase, onPhaseChange, onExport, onExportCopy }: ToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      {/* 阶段选择器 */}
      <div className="flex flex-wrap gap-1.5">
        {PHASES.map((p) => (
          <button
            key={p.id}
            onClick={() => onPhaseChange(p.id)}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all font-mono border ${
              activePhase.id === p.id
                ? 'text-white shadow-sm'
                : 'bg-surface/80 text-text-secondary hover:bg-surface-elevated border-border/50'
            }`}
            style={activePhase.id === p.id ? { backgroundColor: p.color, borderColor: p.color } : {}}
          >
            <span className="block">{p.label}</span>
            <span className="block text-[10px] opacity-80">{p.name}</span>
          </button>
        ))}
      </div>

      {/* 分隔线 */}
      <div className="w-px h-8 bg-border" />

      {/* 当前阶段信息 */}
      <div className="flex items-center gap-2 text-sm">
        <span className="font-semibold" style={{ color: activePhase.color }}>
          {activePhase.name}
        </span>
        <span className="text-text-secondary text-xs">{activePhase.desc}</span>
      </div>

      <div className="flex-1" />

      {/* 导出按钮 */}
      <button
        onClick={onExportCopy}
        className="px-3 py-1.5 rounded-md text-xs font-medium bg-surface border border-border/50 text-text-secondary hover:text-text-primary hover:border-primary-light transition-all"
      >
        复制 SVG
      </button>
      <button
        onClick={onExport}
        className="px-3 py-1.5 rounded-md text-xs font-medium bg-primary-dark/40 border border-primary/30 text-primary-light hover:bg-primary-dark/60 transition-all"
      >
        下载 SVG
      </button>
    </div>
  )
}
