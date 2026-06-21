interface SourceProps {
  /** 正极节点 */
  pos: { x: number; y: number }
  /** 负极节点 */
  neg: { x: number; y: number }
  label?: string
}

/**
 * 直流电源符号（圆圈内 +/-）
 */
export default function Source({ pos, neg, label = 'Vin' }: SourceProps) {
  const cx = (pos.x + neg.x) / 2
  const cy = (pos.y + neg.y) / 2
  const r = 16

  return (
    <g>
      {/* 引线到圆圈 */}
      <line x1={pos.x} y1={pos.y} x2={cx} y2={cy - r} stroke="#a3a3a3" strokeWidth={2} />
      <line x1={neg.x} y1={neg.y} x2={cx} y2={cy + r} stroke="#a3a3a3" strokeWidth={2} />

      {/* 圆圈 */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#a3a3a3" strokeWidth={2} />

      {/* + / - */}
      <text x={cx} y={cy - 4} fill="#a3a3a3" fontSize={14} fontFamily="JetBrains Mono, monospace" textAnchor="middle" dominantBaseline="middle">
        +
      </text>
      <text x={cx} y={cy + 10} fill="#a3a3a3" fontSize={14} fontFamily="JetBrains Mono, monospace" textAnchor="middle" dominantBaseline="middle">
        -
      </text>

      {/* 标签 */}
      <text x={cx} y={cy - r - 6} fill="#a3a3a3" fontSize={12} fontFamily="JetBrains Mono, monospace" textAnchor="middle">
        {label}
      </text>
    </g>
  )
}
