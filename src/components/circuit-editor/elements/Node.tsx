import type { NodeId } from '../types'

interface NodeProps {
  id: NodeId
  x: number
  y: number
  label?: string
  type?: 'anchor' | 'junction' | 'terminal'
  onMouseDown?: (id: NodeId, e: React.MouseEvent) => void
  selected?: boolean
}

/**
 * 电路节点 — 可拖拽的连接点
 * terminal: 大圆，带标签（电源端子等）
 * junction: 小圆，电路中的连接点
 * anchor: 不可见的锚点（元件内部）
 */
export default function Node({ id, x, y, label, type = 'junction', onMouseDown, selected }: NodeProps) {
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    onMouseDown?.(id, e)
  }

  if (type === 'anchor') {
    // 隐藏锚点，只用于拖拽检测（扩大热区）
    return (
      <circle
        cx={x}
        cy={y}
        r={10}
        fill="transparent"
        stroke="transparent"
        className="cursor-move"
        onMouseDown={handleMouseDown}
        style={{ pointerEvents: 'all' }}
      />
    )
  }

  const isTerminal = type === 'terminal'
  const r = isTerminal ? 4 : 3.5
  const stroke = selected ? '#14b8a6' : isTerminal ? '#a3a3a3' : '#f5f5f5'
  const fill = isTerminal ? 'none' : '#f5f5f5'

  return (
    <g className="cursor-move" onMouseDown={handleMouseDown}>
      <circle
        cx={x}
        cy={y}
        r={r}
        fill={fill}
        stroke={stroke}
        strokeWidth={selected ? 2 : 1}
      />
      {label && (
        <text
          x={x}
          y={y - (isTerminal ? 10 : 8)}
          fill="#a3a3a3"
          fontSize={isTerminal ? 12 : 10}
          fontFamily="JetBrains Mono, monospace"
          textAnchor="middle"
        >
          {label}
        </text>
      )}
    </g>
  )
}
