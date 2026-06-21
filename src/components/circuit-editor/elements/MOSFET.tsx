interface MOSFETProps {
  /** 漏极节点位置 */
  d: { x: number; y: number }
  /** 源极节点位置 */
  s: { x: number; y: number }
  /** 栅极节点位置 */
  g: { x: number; y: number }
  /** 体二极管上端 */
  bdTop?: { x: number; y: number }
  /** 体二极管下端 */
  bdBottom?: { x: number; y: number }
  label?: string
  /** 是否处于导通状态（高亮栅极） */
  active?: boolean
  /** 导通时的颜色（默认青色） */
  activeColor?: string
  /** 体二极管是否导通（高亮） */
  bodyDiode?: boolean
  /** 方向：0=垂直D上S下, 180=垂直D下S上 */
  direction?: 0 | 90 | 180 | 270
}

/**
 * 标准 NMOS 符号（垂直）
 * D-S 竖线 | G 栅极 | S 短横线 | 体二极管
 */
export default function MOSFET({
  d,
  s,
  g,
  bdTop,
  bdBottom,
  label = 'Q',
  active = false,
  activeColor = '#14b8a6',
  bodyDiode = false,
}: MOSFETProps) {
  const gateColor = active ? activeColor : '#a3a3a3'
  const gateWidth = active ? 3 : 2
  const bdColor = bodyDiode ? '#22c55e' : '#a3a3a3'
  const bdWidth = bodyDiode ? 3 : 1.5
  const labelColor = active ? activeColor : bodyDiode ? '#22c55e' : '#a3a3a3'

  // 体二极管：阴极在 D 侧，阳极在 S 侧（内部二极管箭头指向 S）
  const hasBodyDiode = bdTop && bdBottom

  return (
    <g>
      {/* D-S 竖线 */}
      <line x1={d.x} y1={d.y} x2={s.x} y2={s.y} stroke="#a3a3a3" strokeWidth={2} />

      {/* G 栅极 — 水平短横线 */}
      <line x1={g.x} y1={g.y} x2={d.x} y2={g.y} stroke={gateColor} strokeWidth={gateWidth} />

      {/* S 短横线 */}
      <line x1={s.x - 5} y1={s.y} x2={s.x + 5} y2={s.y} stroke="#a3a3a3" strokeWidth={2} />

      {/* 体二极管 */}
      {hasBodyDiode && bdTop && bdBottom && (
        <g>
          {/* 体二极管竖线 */}
          <line
            x1={bdTop.x}
            y1={bdTop.y}
            x2={bdBottom.x}
            y2={bdBottom.y}
            stroke={bdColor}
            strokeWidth={bdWidth}
          />
          {/* 阴极横线（D 侧） */}
          <line
            x1={bdTop.x - 4}
            y1={bdTop.y}
            x2={bdTop.x + 4}
            y2={bdTop.y}
            stroke={bdColor}
            strokeWidth={bdWidth}
          />
          {/* 箭头（指向 S = 阳极） */}
          <path
            d={`M ${bdTop.x} ${bdTop.y} L ${bdTop.x - 4} ${bdTop.y + 12} L ${bdTop.x + 4} ${bdTop.y + 12} Z`}
            fill={bdColor}
          />
        </g>
      )}

      {/* 标签 */}
      {label && (
        <text
          x={g.x - 10}
          y={g.y + 3}
          fill={labelColor}
          fontSize={12}
          fontFamily="JetBrains Mono, monospace"
          textAnchor="end"
        >
          {label}
        </text>
      )}
    </g>
  )
}
