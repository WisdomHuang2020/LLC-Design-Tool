interface InductorProps {
  /** 左/上端节点 */
  left: { x: number; y: number }
  /** 右/下端节点 */
  right: { x: number; y: number }
  label?: string
  /** 方向：0=水平, 90=垂直 */
  direction?: 0 | 90
  color?: string
}

/**
 * 电感符号（线圈 — 水平或垂直）
 */
export default function Inductor({ left, right, label = 'L', direction = 0, color = '#14b8a6' }: InductorProps) {
  const isHorizontal = direction === 0

  if (isHorizontal) {
    const loops = 4
    const segW = (right.x - left.x) / loops
    let d = `M ${left.x} ${left.y}`
    for (let i = 0; i < loops; i++) {
      const sx = left.x + i * segW
      d += ` q ${segW / 2} -12 ${segW} 0`
    }

    return (
      <g>
        <path d={d} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" />
        <text x={(left.x + right.x) / 2} y={left.y - 14} fill={color} fontSize={12} fontFamily="JetBrains Mono, monospace" textAnchor="middle">
          {label}
        </text>
      </g>
    )
  }

  // 垂直
  const loops = 4
  const segH = (right.y - left.y) / loops
  let d = `M ${left.x} ${left.y}`
  for (let i = 0; i < loops; i++) {
    const sy = left.y + i * segH
    d += ` q -12 ${segH / 2} 0 ${segH}`
  }

  return (
    <g>
      <path d={d} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <text x={left.x + 12} y={(left.y + right.y) / 2} fill={color} fontSize={12} fontFamily="JetBrains Mono, monospace" textAnchor="start" dominantBaseline="middle">
        {label}
      </text>
    </g>
  )
}
