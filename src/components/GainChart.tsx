import { useRef, useCallback, useMemo } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts'
import { Download } from 'lucide-react'

const Q_PRESETS = [0.2, 0.5, 1.0, 2.0, 5.0]
const Q_COLORS = ['#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ef4444']

function calcGain(fn: number, k: number, Q: number): number {
  const a = 1 + (1 / k) * (1 - 1 / (fn * fn))
  const b = Q * (fn - 1 / fn)
  return 1 / Math.sqrt(a * a + b * b)
}

function generateData(k: number, Q: number) {
  const gainData: Array<Record<string, number>> = []
  let maxGain = 0

  for (let fn = 0.1; fn <= 2.0; fn += 0.005) {
    const f = parseFloat(fn.toFixed(3))

    const gainPoint: Record<string, number> = { fn: f }
    Q_PRESETS.forEach((q) => {
      const g = calcGain(f, k, q)
      const safeG = Number.isFinite(g) ? g : 0
      gainPoint[`Q_${q}`] = safeG
      if (safeG > maxGain) maxGain = safeG
    })
    const g = calcGain(f, k, Q)
    const safeG = Number.isFinite(g) ? g : 0
    gainPoint.currentQ = safeG
    if (safeG > maxGain) maxGain = safeG
    gainData.push(gainPoint)
  }

  return { gainData, maxGain }
}

interface GainChartProps {
  k: number
  Q: number
  height?: number | string
  showCurrentQ?: boolean
  showLegend?: boolean
  showExportButton?: boolean
  showTitle?: boolean
  title?: string
  className?: string
}

export default function GainChart({
  k,
  Q,
  height = '100%',
  showCurrentQ = true,
  showLegend = true,
  showExportButton = false,
  showTitle = false,
  title = '增益-频率曲线',
  className = '',
}: GainChartProps) {
  const { gainData, maxGain } = useMemo(
    () => generateData(k, Q),
    [k, Q]
  )

  const fr1 = 1.0
  const fr2 = 1 / Math.sqrt(1 + k)
  const chartRef = useRef<HTMLDivElement>(null)

  const exportChart = useCallback(() => {
    if (!chartRef.current) return
    const svg = chartRef.current.querySelector('svg')
    if (!svg) return

    const rect = svg.getBoundingClientRect()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const scale = 2
    canvas.width = Math.max(1, Math.floor(rect.width * scale))
    canvas.height = Math.max(1, Math.floor(rect.height * scale))

    const svgData = new XMLSerializer().serializeToString(svg)
    const img = new Image()
    img.onload = () => {
      ctx.fillStyle = '#0a0a0a'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      const url = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = `gain_curve_k${k.toFixed(2)}_Q${Q.toFixed(1)}.png`
      link.href = url
      link.click()
    }
    img.src =
      'data:image/svg+xml;base64,' +
      btoa(unescape(encodeURIComponent(svgData)))
  }, [k, Q])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-surface border border-border rounded-lg p-3 shadow-xl">
        <p className="text-text-secondary text-sm font-mono mb-1">
          fn = {Number(label).toFixed(3)}
        </p>
        {payload.map((entry: any, index: number) => (
          <p
            key={index}
            className="text-sm font-mono"
            style={{ color: entry.color }}
          >
            {entry.name}: {entry.value?.toFixed(3)}
          </p>
        ))}
      </div>
    )
  }

  const chartStyle =
    typeof height === 'number' ? { height: `${height}px` } : { height }

  return (
    <div className={className}>
      {(showTitle || showExportButton) && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          {showTitle && (
            <h2 className="text-xl font-semibold text-text-primary">{title}</h2>
          )}
          {showExportButton && (
            <button
              onClick={exportChart}
              className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white text-sm rounded-lg hover:bg-primary-light transition-colors"
            >
              <Download size={16} />
              导出 PNG
            </button>
          )}
        </div>
      )}
      <div ref={chartRef} style={chartStyle}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={gainData}
            margin={{ top: 5, right: 20, bottom: 40, left: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
            <XAxis
              dataKey="fn"
              type="number"
              domain={[0, 2.0]}
              stroke="#a3a3a3"
              tick={{
                fill: '#a3a3a3',
                fontFamily: 'JetBrains Mono',
                fontSize: 12,
              }}
              tickCount={9}
              label={{
                value: '归一化频率 fn',
                position: 'insideBottom',
                offset: -10,
                fill: '#a3a3a3',
                fontSize: 13,
              }}
            />
            <YAxis
              domain={[0, Math.max(2, Math.ceil(maxGain * 1.1))]}
              stroke="#a3a3a3"
              tick={{
                fill: '#a3a3a3',
                fontFamily: 'JetBrains Mono',
                fontSize: 12,
              }}
              label={{
                value: '电压增益 M',
                angle: -90,
                position: 'insideLeft',
                fill: '#a3a3a3',
                fontSize: 13,
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && (
              <Legend
                wrapperStyle={{
                  color: '#f5f5f5',
                  fontFamily: 'JetBrains Mono',
                  fontSize: 13,
                  paddingTop: 20,
                }}
              />
            )}
            <ReferenceLine
              x={fr1}
              stroke="#f59e0b"
              strokeDasharray="5 5"
              label={{
                value: 'fr₁',
                fill: '#f59e0b',
                position: 'insideTopLeft',
                fontSize: 12,
              }}
            />
            <ReferenceLine
              x={fr2}
              stroke="#f59e0b"
              strokeDasharray="5 5"
              label={{
                value: 'fr₂',
                fill: '#f59e0b',
                position: fr2 < 0.6 ? 'insideTopLeft' : 'insideTopRight',
                fontSize: 12,
              }}
            />
            {Q_PRESETS.map((q, i) => (
              <Line
                key={q}
                type="linear"
                isAnimationActive={false}
                dataKey={`Q_${q}`}
                stroke={Q_COLORS[i]}
                strokeWidth={2}
                dot={false}
                name={`Q=${q}`}
              />
            ))}
            {showCurrentQ && (
              <Line
                type="linear"
                isAnimationActive={false}
                dataKey="currentQ"
                stroke="#f5f5f5"
                strokeWidth={2.5}
                strokeDasharray="8 4"
                dot={false}
                name={`当前 Q=${Q.toFixed(1)}`}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
