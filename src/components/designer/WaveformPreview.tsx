// 开关波形示意图（示意，非仿真）：Vds / Ir / Im 三条曲线，两个周期。
import { Waves } from 'lucide-react'

export default function WaveformPreview({ topology, vin }: { topology: string; vin: number }) {
  const W = 600
  const H = 240
  const margin = { top: 20, right: 20, bottom: 30, left: 40 }
  const width = W - margin.left - margin.right
  const height = H - margin.top - margin.bottom

  // Draw 2 periods
  const periods = 2
  const points = 200

  const vds: string[] = []
  const ir: string[] = []
  const im: string[] = []

  for (let i = 0; i <= points; i++) {
    const t = (i / points) * periods
    const x = margin.left + (i / points) * width
    const phase = t * 2 * Math.PI

    // Vds: square wave 0/Vin for half-bridge, -Vin/Vin for full-bridge
    const vdsVal =
      topology === 'half-bridge'
        ? Math.sin(phase) >= 0 ? vin : 0
        : Math.sin(phase) >= 0 ? vin : -vin
    const vdsNorm = vdsVal / vin // normalize to -1..1
    const yVds = margin.top + height / 2 - vdsNorm * (height * 0.25)
    vds.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${yVds.toFixed(1)}`)

    // Ir: sinusoidal with slight ripple
    const irNorm = 0.8 * Math.sin(phase - 0.3)
    const yIr = margin.top + height / 2 - irNorm * (height * 0.25)
    ir.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${yIr.toFixed(1)}`)

    // Im: lower amplitude, triangular-ish
    const imNorm = 0.35 * Math.sin(phase - 0.6)
    const yIm = margin.top + height / 2 - imNorm * (height * 0.25)
    im.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${yIm.toFixed(1)}`)
  }

  return (
    <div className="card-surface p-4">
      <div className="flex items-center gap-2 mb-3">
        <Waves className="w-5 h-5 text-primary-light" />
        <h3 className="text-lg font-semibold text-text-primary">波形预览</h3>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto max-h-64">
        {/* Grid */}
        {Array.from({ length: 5 }).map((_, i) => {
          const y = margin.top + (i / 4) * height
          return (
            <line
              key={`h${i}`}
              x1={margin.left}
              y1={y}
              x2={margin.left + width}
              y2={y}
              stroke="#404040"
              strokeDasharray="2,2"
            />
          )
        })}
        {Array.from({ length: 3 }).map((_, i) => {
          const x = margin.left + (i / 2) * width
          return (
            <line
              key={`v${i}`}
              x1={x}
              y1={margin.top}
              x2={x}
              y2={margin.top + height}
              stroke="#404040"
              strokeDasharray="2,2"
            />
          )
        })}
        {/* Center line */}
        <line
          x1={margin.left}
          y1={margin.top + height / 2}
          x2={margin.left + width}
          y2={margin.top + height / 2}
          stroke="#525252"
          strokeWidth={1}
        />
        {/* Paths */}
        <path d={vds.join(' ')} fill="none" stroke="#14b8a6" strokeWidth={2} />
        <path d={ir.join(' ')} fill="none" stroke="#f59e0b" strokeWidth={2} />
        <path d={im.join(' ')} fill="none" stroke="#a3a3a3" strokeWidth={2} strokeDasharray="4,2" />
        {/* Labels */}
        <text x={margin.left + 10} y={margin.top + 14} fill="#14b8a6" fontSize={12} fontFamily="JetBrains Mono, monospace">
          Vds
        </text>
        <text x={margin.left + 50} y={margin.top + 14} fill="#f59e0b" fontSize={12} fontFamily="JetBrains Mono, monospace">
          Ir
        </text>
        <text x={margin.left + 80} y={margin.top + 14} fill="#a3a3a3" fontSize={12} fontFamily="JetBrains Mono, monospace">
          Im
        </text>
        {/* Axes */}
        <line
          x1={margin.left}
          y1={margin.top + height}
          x2={margin.left + width}
          y2={margin.top + height}
          stroke="#737373"
          strokeWidth={1}
        />
        <text
          x={margin.left + width / 2}
          y={H - 4}
          fill="#737373"
          fontSize={11}
          textAnchor="middle"
          fontFamily="JetBrains Mono, monospace"
        >
          t / T
        </text>
      </svg>
      <p className="text-xs text-text-muted mt-2 text-center">
        示意波形（Vds: 青色，Ir: 琥珀色，Im: 灰色虚线）
      </p>
    </div>
  )
}
