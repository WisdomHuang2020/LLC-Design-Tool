import { useState, useRef, useCallback, useMemo, useEffect } from 'react'
import { useDesign } from '../lib/DesignContext'
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
import { Download, Link2, RotateCcw } from 'lucide-react'
import { Link } from 'react-router-dom'

const Q_PRESETS = [0.2, 0.5, 1.0, 2.0, 5.0]
const Q_COLORS = ['#14b8a6', '#0f766e', '#5eead4', '#2dd4bf', '#0d9488']

function calcGain(fn: number, k: number, Q: number): number {
  const a = 1 + (1 / k) * (1 - 1 / (fn * fn))
  const b = Q * (fn - 1 / fn)
  return 1 / Math.sqrt(a * a + b * b)
}

function calcImpedance(fn: number, k: number, Q: number) {
  const denom = Q * Q + fn * fn * k * k
  const re = (Q * fn * fn * k * k) / denom
  const im = (fn - 1 / fn) + (Q * Q * fn * k) / denom
  const mag = Math.sqrt(re * re + im * im)
  const phase = Math.atan2(im, re) * (180 / Math.PI)
  return { mag, phase }
}

function generateData(k: number, Q: number) {
  const gainData: Array<Record<string, number>> = []
  const impedanceData: Array<{ fn: number; mag: number; phase: number }> = []
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

    const { mag, phase } = calcImpedance(f, k, Q)
    if (Number.isFinite(mag) && Number.isFinite(phase)) {
      impedanceData.push({ fn: f, mag, phase })
    }
  }

  return { gainData, impedanceData, maxGain }
}

export default function Curves() {
  const { results, curves, setCurves } = useDesign()
  const hasResults = results !== null

  const [k, setK] = useState(curves.k)
  const [Q, setQ] = useState(curves.q)

  // Sync with results when they change (Designer -> Curves linkage)
  useEffect(() => {
    if (results) {
      setK(results.k)
      setQ(results.q)
    }
  }, [results?.k, results?.q])

  // Persist manual slider changes
  useEffect(() => {
    setCurves({ k, q: Q })
  }, [k, Q, setCurves])

  const { gainData, impedanceData, maxGain } = useMemo(
    () => generateData(k, Q),
    [k, Q]
  )

  const fr1 = 1.0
  const fr2 = 1 / Math.sqrt(1 + k)

  const gainChartRef = useRef<HTMLDivElement>(null)
  const impedanceChartRef = useRef<HTMLDivElement>(null)

  const exportChart = useCallback(
    (ref: React.RefObject<HTMLDivElement | null>, filename: string) => {
      if (!ref.current) return
      const svg = ref.current.querySelector('svg')
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
        link.download = filename
        link.href = url
        link.click()
      }
      img.src =
        'data:image/svg+xml;base64,' +
        btoa(unescape(encodeURIComponent(svgData)))
    },
    []
  )

  const syncToDesign = useCallback(() => {
    if (results) {
      setK(results.k)
      setQ(results.q)
      setCurves({ k: results.k, q: results.q })
    }
  }, [results, setCurves])

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

  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      {/* Title */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gradient mb-4">特性曲线分析</h1>
        <p className="text-text-secondary max-w-2xl">
          LLC 谐振变换器的增益特性与阻抗特性随归一化频率的变化关系。
          调节 k 和 Q 参数，观察不同工况下的曲线形态。
        </p>
      </div>

      {/* Linkage Banner */}
      {hasResults && (
        <div className="card-surface p-4 mb-6 border border-primary/30">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm text-primary-light font-medium">
                已关联设计参数
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm font-mono text-text-secondary">
              <span>k = {results.k.toFixed(2)}</span>
              <span>Q = {results.q.toFixed(3)}</span>
              <span className="text-text-muted">|</span>
              <span>fr = {(results.fr / 1000).toFixed(1)} kHz</span>
            </div>
            <div className="flex gap-2 ml-auto">
              <button
                onClick={syncToDesign}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-primary/30 text-primary-light hover:bg-primary/10 transition-colors"
              >
                <RotateCcw size={14} />
                同步到设计参数
              </button>
              <Link
                to="/designer"
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-primary text-white hover:bg-primary-light transition-colors"
              >
                <Link2 size={14} />
                返回设计工具
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Control Panel */}
      <div className="card-surface p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* k Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-text-primary font-mono">
                k = {k.toFixed(2)}
              </label>
              <span className="text-xs text-text-muted">电感比 Lm/Lr</span>
            </div>
            <input
              type="range"
              min={2.0}
              max={10.0}
              step={0.1}
              value={k}
              onInput={(e) => setK(parseFloat((e.target as HTMLInputElement).value))}
              className="w-full h-2 bg-surface-elevated rounded-lg cursor-pointer accent-teal-500"
            />
            <div className="flex justify-between text-xs text-text-muted mt-1 font-mono">
              <span>2.0</span>
              <span>10.0</span>
            </div>
          </div>

          {/* Q Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-text-primary font-mono">
                Q = {Q.toFixed(1)}
              </label>
              <span className="text-xs text-text-muted">品质因数</span>
            </div>
            <input
              type="range"
              min={0.1}
              max={5.0}
              step={0.1}
              value={Q}
              onInput={(e) => setQ(parseFloat((e.target as HTMLInputElement).value))}
              className="w-full h-2 bg-surface-elevated rounded-lg cursor-pointer accent-teal-500"
            />
            <div className="flex justify-between text-xs text-text-muted mt-1 font-mono">
              <span>0.1</span>
              <span>5.0</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-6 text-sm font-mono text-text-secondary">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-accent" />
            <span>fr₁ = 1.000</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-accent" />
            <span>fr₂ = {fr2.toFixed(3)}</span>
          </div>
          {hasResults && (
            <div className="flex items-center gap-2 text-primary-light">
              <span className="w-3 h-3 rounded-full bg-primary animate-pulse" />
              <span>设计点: k = {results.k.toFixed(2)}, Q = {results.q.toFixed(3)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Gain Curve */}
      <div className="card-surface p-6 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <h2 className="text-xl font-semibold text-text-primary">
            增益-频率曲线
          </h2>
          <button
            onClick={() =>
              exportChart(
                gainChartRef,
                `gain_curve_k${k.toFixed(2)}_Q${Q.toFixed(1)}.png`
              )
            }
            className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white text-sm rounded-lg hover:bg-primary-light transition-colors"
          >
            <Download size={16} />
            导出 PNG
          </button>
        </div>
        <div ref={gainChartRef} className="w-full h-96">
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
              <Legend
                wrapperStyle={{
                  color: '#f5f5f5',
                  fontFamily: 'JetBrains Mono',
                  fontSize: 13,
                  paddingTop: 20,
                }}
              />
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
              <Line
                type="linear"
                isAnimationActive={false}
                dataKey="currentQ"
                stroke="#f59e0b"
                strokeWidth={2.5}
                strokeDasharray="8 4"
                dot={false}
                name={`当前 Q=${Q.toFixed(1)}`}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Impedance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Impedance Magnitude */}
        <div className="card-surface p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
            <h2 className="text-xl font-semibold text-text-primary">
              输入阻抗幅值
            </h2>
            <button
              onClick={() =>
                exportChart(
                  impedanceChartRef,
                  `impedance_mag_k${k.toFixed(2)}_Q${Q.toFixed(1)}.png`
                )
              }
              className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white text-sm rounded-lg hover:bg-primary-light transition-colors"
            >
              <Download size={16} />
              导出
            </button>
          </div>
          <div ref={impedanceChartRef} className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={impedanceData}
                margin={{ top: 5, right: 20, bottom: 20, left: 10 }}
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
                  stroke="#a3a3a3"
                  tick={{
                    fill: '#a3a3a3',
                    fontFamily: 'JetBrains Mono',
                    fontSize: 12,
                  }}
                  label={{
                    value: '|Zin| / Zr',
                    angle: -90,
                    position: 'insideLeft',
                    fill: '#a3a3a3',
                    fontSize: 13,
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
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
                <Line
                  type="linear"
                  isAnimationActive={false}
                  dataKey="mag"
                  stroke="#14b8a6"
                  strokeWidth={2}
                  dot={false}
                  name="阻抗幅值"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Impedance Phase */}
        <div className="card-surface p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-text-primary">
              输入阻抗相位
            </h2>
          </div>
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={impedanceData}
                margin={{ top: 5, right: 20, bottom: 20, left: 10 }}
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
                  stroke="#a3a3a3"
                  tick={{
                    fill: '#a3a3a3',
                    fontFamily: 'JetBrains Mono',
                    fontSize: 12,
                  }}
                  label={{
                    value: '相位 (°)',
                    angle: -90,
                    position: 'insideLeft',
                    fill: '#a3a3a3',
                    fontSize: 13,
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
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
                <ReferenceLine y={0} stroke="#404040" />
                <Line
                  type="linear"
                  isAnimationActive={false}
                  dataKey="phase"
                  stroke="#2dd4bf"
                  strokeWidth={2}
                  dot={false}
                  name="阻抗相位"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}