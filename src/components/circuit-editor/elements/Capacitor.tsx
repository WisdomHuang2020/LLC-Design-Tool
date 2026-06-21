interface CapacitorProps {
  /** 左/上端节点 */
  left: { x: number; y: number }
  /** 右/下端节点 */
  right: { x: number; y: number }
  label?: string
  /** 方向：0=水平, 90=垂直 */
  direction?: 0 | 90
}

/**
 * 电容符号（水平或垂直）
 */
export default function Capacitor({ left, right, label = 'C', direction = 0 }: CapacitorProps) {
  const isHorizontal = direction === 0
  const color = '#f59e0b'

  if (isHorizontal) {
    const plateGap = 6
    const cx = (left.x + right.x) / 2

    return (
      <g>
        {/* 左侧引线 */}
        <line x1={left.x} y1={left.y} x2={cx - plateGap} y2={left.y} stroke="#a3a3a3" strokeWidth={2} />
        {/* 右侧引线 */}
        <line x1={cx + plateGap} y1={right.y} x2={right.x} y2={right.y} stroke="#a3a3a3" strokeWidth={2} />
        {/* 左极板 */}
        <line x1={cx - plateGap} y1={left.y - 10} x2={cx - plateGap} y2={left.y + 10} stroke={color} strokeWidth={2} />
        {/* 右极板 */}
        <line x1={cx + plateGap} y1={right.y - 10} x2={cx + plateGap} y2={right.y + 10} stroke={color} strokeWidth={2} />
        {/* 标签 */}
        <text x={cx} y={left.y - 14} fill={color} fontSize={12} fontFamily="JetBrains Mono, monospace" textAnchor="middle">
          {label}
        </text>
      </g>
    )
  }

  // 垂直
  const plateGap = 6
  const cy = (left.y + right.y) / 2

  return (
    <g>
      <line x1={left.x} y1={left.y} x2={left.x} y2={cy - plateGap} stroke="#a3a3a3" strokeWidth={2} />
      <line x1={right.x} y1={cy + plateGap} x2={right.x} y2={right.y} stroke="#a3a3a3" strokeWidth={2} />
      <line x1={left.x - 10} y1={cy - plateGap} x2={left.x + 10} y2={cy - plateGap} stroke={color} strokeWidth={2} />
      <line x1={right.x - 10} y1={cy + plateGap} x2={right.x + 10} y2={cy + plateGap} stroke={color} strokeWidth={2} />
      <text x={left.x + 14} y={cy} fill={color} fontSize={12} fontFamily="JetBrains Mono, monospace" textAnchor="start" dominantBaseline="middle">
        {label}
      </text>
    </g>
  )
}
