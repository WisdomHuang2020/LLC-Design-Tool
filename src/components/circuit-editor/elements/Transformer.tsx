interface TransformerProps {
  /** 原边 top */
  pTop: { x: number; y: number }
  /** 原边 bottom */
  pBottom: { x: number; y: number }
  /** 上次级 top */
  s1Top: { x: number; y: number }
  /** 上次级 mid (中心抽头) */
  s1Mid: { x: number; y: number }
  /** 下次级 bottom */
  s2Bottom: { x: number; y: number }
  /** 原边标签 */
  pLabel?: string
  /** 次级标签 */
  sLabel?: string
}

/**
 * 变压器符号（带中心抽头）
 * 包含：np 原边绕组、两个 ns 次级绕组、耦合线
 */
export default function Transformer({
  pTop,
  pBottom,
  s1Top,
  s1Mid,
  s2Bottom,
  pLabel = 'np',
  sLabel = 'ns',
}: TransformerProps) {
  const pLoops = 7
  const pSegH = (pBottom.y - pTop.y) / pLoops
  const sLoops = 3
  const s1SegH = (s1Mid.y - s1Top.y) / sLoops
  const s2SegH = (s2Bottom.y - s1Mid.y) / sLoops

  // 原边绕组路径
  let pPath = `M ${pTop.x} ${pTop.y}`
  for (let i = 0; i < pLoops; i++) {
    const sy = pTop.y + i * pSegH
    pPath += ` q -5 ${pSegH / 2} 0 ${pSegH}`
  }

  // 上次级绕组路径
  let s1Path = `M ${s1Top.x} ${s1Top.y}`
  for (let i = 0; i < sLoops; i++) {
    const sy = s1Top.y + i * s1SegH
    s1Path += ` q -5 ${s1SegH / 2} 0 ${s1SegH}`
  }

  // 下次级绕组路径
  let s2Path = `M ${s1Mid.x} ${s1Mid.y}`
  for (let i = 0; i < sLoops; i++) {
    const sy = s1Mid.y + i * s2SegH
    s2Path += ` q -5 ${s2SegH / 2} 0 ${s2SegH}`
  }

  // 耦合线位置（原边右侧和上次级左侧之间）
  const coupleStart = pTop.x + 8
  const coupleEnd = s1Top.x - 8
  const coupleY1 = pTop.y + 5
  const coupleY2 = pBottom.y - 5

  return (
    <g>
      {/* 原边绕组 */}
      <line x1={pTop.x} y1={pTop.y} x2={pTop.x} y2={pTop.y} stroke="#a3a3a3" strokeWidth={2} />
      <path d={pPath} fill="none" stroke="#a3a3a3" strokeWidth={2} strokeLinecap="round" />
      <line x1={pBottom.x} y1={pBottom.y} x2={pBottom.x} y2={pBottom.y} stroke="#a3a3a3" strokeWidth={2} />
      <text x={pTop.x + 12} y={(pTop.y + pBottom.y) / 2} fill="#a3a3a3" fontSize={12} fontFamily="JetBrains Mono, monospace" textAnchor="start" dominantBaseline="middle">
        {pLabel}
      </text>

      {/* 耦合点圆点 */}
      <circle cx={pTop.x + 2} cy={pTop.y + 5} r={2.5} fill="#a3a3a3" />

      {/* 耦合线（虚线） */}
      <line x1={coupleStart} y1={coupleY1} x2={coupleEnd} y2={coupleY1} stroke="#a3a3a3" strokeDasharray="4 3" strokeWidth={1.5} />
      <line x1={coupleStart} y1={coupleY2} x2={coupleEnd} y2={coupleY2} stroke="#a3a3a3" strokeDasharray="4 3" strokeWidth={1.5} />

      {/* 上次级绕组 */}
      <line x1={s1Top.x} y1={s1Top.y} x2={s1Top.x} y2={s1Top.y} stroke="#a3a3a3" strokeWidth={2} />
      <path d={s1Path} fill="none" stroke="#a3a3a3" strokeWidth={2} strokeLinecap="round" />
      <circle cx={s1Top.x + 2} cy={s1Top.y + 5} r={2.5} fill="#a3a3a3" />
      <text x={s1Top.x + 8} y={s1Top.y + 20} fill="#a3a3a3" fontSize={10} fontFamily="JetBrains Mono, monospace" textAnchor="start">
        {sLabel}
      </text>

      {/* 下次级绕组 */}
      <path d={s2Path} fill="none" stroke="#a3a3a3" strokeWidth={2} strokeLinecap="round" />
      <circle cx={s1Mid.x + 2} cy={s1Mid.y + 5} r={2.5} fill="#a3a3a3" />
      <text x={s1Mid.x + 8} y={s1Mid.y + 20} fill="#a3a3a3" fontSize={10} fontFamily="JetBrains Mono, monospace" textAnchor="start">
        {sLabel}
      </text>
    </g>
  )
}
