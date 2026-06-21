interface DiodeProps {
  /** 阳极节点 */
  anode: { x: number; y: number }
  /** 阴极节点 */
  cathode: { x: number; y: number }
  label?: string
  /** 是否高亮（导通） */
  active?: boolean
  /** 方向：0=水平右向, 180=水平左向, 90=垂直下向, 270=垂直上向 */
  direction?: 0 | 90 | 180 | 270
}

/**
 * 二极管符号（箭头+横线）
 * 默认箭头指向 cathode（阳极->阴极）
 */
export default function Diode({
  anode,
  cathode,
  label = 'D',
  active = false,
  direction = 0,
}: DiodeProps) {
  const color = active ? '#22c55e' : '#a3a3a3'
  const strokeWidth = active ? 3 : 2
  const isHorizontal = direction === 0 || direction === 180

  if (isHorizontal) {
    const arrowTipX = cathode.x
    const barX = anode.x + (cathode.x - anode.x) * 0.6
    const y = anode.y
    const h = 16 // 三角形高度

    return (
      <g>
        {/* 阳极到三角形前 */}
        <line x1={anode.x} y1={y} x2={barX} y2={y} stroke="#a3a3a3" strokeWidth={2} />
        {/* 三角形（箭头） */}
        <path d={`M ${barX} ${y - h / 2} L ${barX} ${y + h / 2} L ${arrowTipX} ${y} Z`} fill={color} />
        <line x1={barX} y1={y - h / 2} x2={barX} y2={y + h / 2} stroke={color} strokeWidth={strokeWidth} />
        {/* 阴极横线 */}
        <line x1={arrowTipX} y1={y} x2={cathode.x} y2={y} stroke="#a3a3a3" strokeWidth={2} />
        {/* 标签 */}
        <text x={anode.x + 10} y={y - 10} fill={color} fontSize={11} fontFamily="JetBrains Mono, monospace">
          {label}
        </text>
      </g>
    )
  }

  // 垂直
  const arrowTipY = cathode.y
  const barY = anode.y + (cathode.y - anode.y) * 0.6
  const x = anode.x
  const h = 16

  return (
    <g>
      <line x1={x} y1={anode.y} x2={x} y2={barY} stroke="#a3a3a3" strokeWidth={2} />
      <path d={`M ${x - h / 2} ${barY} L ${x + h / 2} ${barY} L ${x} ${arrowTipY} Z`} fill={color} />
      <line x1={x - h / 2} y1={barY} x2={x + h / 2} y2={barY} stroke={color} strokeWidth={strokeWidth} />
      <line x1={x} y1={arrowTipY} x2={x} y2={cathode.y} stroke="#a3a3a3" strokeWidth={2} />
      <text x={x + 10} y={anode.y + 10} fill={color} fontSize={11} fontFamily="JetBrains Mono, monospace">
        {label}
      </text>
    </g>
  )
}
