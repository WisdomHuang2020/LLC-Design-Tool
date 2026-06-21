interface GroundProps {
  center: { x: number; y: number }
}

/**
 * 地符号（三条递减横线）
 */
export default function Ground({ center }: GroundProps) {
  return (
    <g>
      <line x1={center.x - 10} y1={center.y} x2={center.x + 10} y2={center.y} stroke="#a3a3a3" strokeWidth={2} />
      <line x1={center.x - 6} y1={center.y + 4} x2={center.x + 6} y2={center.y + 4} stroke="#a3a3a3" strokeWidth={2} />
      <line x1={center.x - 3} y1={center.y + 8} x2={center.x + 3} y2={center.y + 8} stroke="#a3a3a3" strokeWidth={2} />
      <text x={center.x - 12} y={center.y + 4} fill="#a3a3a3" fontSize={12} fontFamily="JetBrains Mono, monospace" textAnchor="end">
        GND
      </text>
    </g>
  )
}
