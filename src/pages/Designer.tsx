import { useState } from 'react'
import { useDesign, DesignParameters } from '../lib/DesignContext'
import {
  Calculator,
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowRight,
  Info,
  Layers,
  Waves,
  Package,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

// ─── E-Series helpers ───
const E12 = [1.0, 1.2, 1.5, 1.8, 2.2, 2.7, 3.3, 3.9, 4.7, 5.6, 6.8, 8.2]
const E24 = [
  1.0, 1.1, 1.2, 1.3, 1.5, 1.6, 1.8, 2.0, 2.2, 2.4, 2.7, 3.0, 3.3, 3.6, 3.9, 4.3, 4.7, 5.1, 5.6, 6.2, 6.8, 7.5, 8.2, 9.1,
]

function nearestE(value: number, series: number[]): number {
  const exponent = Math.floor(Math.log10(value))
  const mantissa = value / Math.pow(10, exponent)
  let closest = series[0]
  let minDiff = Math.abs(mantissa - closest)
  for (const v of series) {
    const diff = Math.abs(mantissa - v)
    if (diff < minDiff) {
      minDiff = diff
      closest = v
    }
  }
  return closest * Math.pow(10, exponent)
}

// ─── LLC gain formula (standard FHA) ───
// M(fn, λ, Q) = 1 / sqrt((1 + λ - λ/fn²)² + (Q*(fn - 1/fn))²)
function gainM(fn: number, lambda: number, q: number): number {
  const a = 1 + lambda - lambda / (fn * fn)
  const b = q * (fn - 1 / fn)
  return 1 / Math.sqrt(a * a + b * b)
}

function peakGain(lambda: number, q: number): number {
  let maxM = 0
  const step = 0.005
  for (let fn = 0.3; fn <= 1.0; fn += step) {
    const m = gainM(fn, lambda, q)
    if (m > maxM) maxM = m
  }
  return maxM
}

// ZVS phase check at fsw (fn = 1 since fr = fsw in our design)
function zvsPhase(lambda: number, q: number): number {
  // At fn=1, the real part of Zin is (ωLm)²Rac / (Rac² + (ωLm)²)
  // Imag part is ωLmRac² / (Rac² + (ωLm)²)
  // Since at fn=1, Lr and Cr cancel, Zin = jωLm || Rac
  // Let x = ωLm / Rac = 1 / (q * λ) ... wait
  // Actually, Zr = q * Rac, and ωLm = Zr * λ / (1) since at fr, ωLr = Zr and Lm = λ*Lr, so ωLm = λ*Zr = λ*q*Rac
  // So ωLm / Rac = λ * q
  const x = lambda * q
  const real = (x * x) / (1 + x * x)
  const imag = x / (1 + x * x)
  return Math.atan2(imag, real) * (180 / Math.PI)
}

// ─── Optimization suggestions ───
type Suggestion = { text: string; level: 'good' | 'warn' | 'critical' }

function generateSuggestions(
  params: DesignParameters,
  results: {
    q: number
    lambda: number
    mMax: number
    mRequired: number
    mRequiredMin: number
    zvsPhase: number
    lr: number
    cr: number
    lm: number
    fsw: number
    efficiency: number
  }
): Suggestion[] {
  const s: Suggestion[] = []

  // 1. Q value
  if (results.q > 1.0) {
    s.push({ text: 'Q值偏高（>1.0），建议增大谐振电容Cr或减小谐振电感Lr以降低谐振阻抗。', level: 'critical' })
  } else if (results.q > 0.7) {
    s.push({ text: 'Q值略高，负载变化时频率调节范围可能较宽。', level: 'warn' })
  } else if (results.q < 0.2) {
    s.push({ text: 'Q值偏低（<0.2），谐振电流纹波较大，注意滤波设计。', level: 'warn' })
  } else {
    s.push({ text: `Q值=${results.q.toFixed(2)}处于合理范围（0.2~0.7），谐振特性良好。`, level: 'good' })
  }

  // 2. Peak gain vs required
  if (results.mMax < results.mRequiredMin) {
    s.push({ text: `峰值增益不足（M_max=${results.mMax.toFixed(2)} < M_req=${results.mRequiredMin.toFixed(2)}），建议增大电感比λ或降低Q值。`, level: 'critical' })
  } else if (results.mMax < results.mRequiredMin * 1.1) {
    s.push({ text: '峰值增益裕量较小，建议留至少10%裕量。', level: 'warn' })
  } else {
    s.push({ text: `峰值增益裕量充足（M_max=${results.mMax.toFixed(2)} vs M_req=${results.mRequiredMin.toFixed(2)}），设计可行。`, level: 'good' })
  }

  // 3. Lambda
  if (results.lambda > 0.5) {
    s.push({ text: `电感比λ偏大（${results.lambda.toFixed(2)}），励磁电流可能过大，效率受限。`, level: 'warn' })
  } else if (results.lambda < 0.15) {
    s.push({ text: `电感比λ偏小（${results.lambda.toFixed(2)}），可能影响轻载ZVS实现。`, level: 'warn' })
  } else {
    s.push({ text: `电感比λ=${results.lambda.toFixed(2)}合理，兼顾增益范围与励磁电流。`, level: 'good' })
  }

  // 4. ZVS
  if (results.zvsPhase < 5) {
    s.push({ text: `ZVS裕量较小（相位=${results.zvsPhase.toFixed(1)}°），建议增加死区时间或提高开关频率。`, level: 'critical' })
  } else if (results.zvsPhase < 15) {
    s.push({ text: `ZVS条件基本满足（相位=${results.zvsPhase.toFixed(1)}°），建议留更多裕量。`, level: 'warn' })
  } else {
    s.push({ text: `ZVS条件良好（相位=${results.zvsPhase.toFixed(1)}°），可实现零电压开通。`, level: 'good' })
  }

  // 5. Efficiency target
  if (results.efficiency > 97) {
    s.push({ text: '目标效率>97%，需选用极低Rds(on) MOSFET并优化磁芯与绕组。', level: 'warn' })
  } else if (results.efficiency < 92) {
    s.push({ text: '目标效率较为保守，容易达到，仍有优化空间。', level: 'good' })
  } else {
    s.push({ text: `目标效率${results.efficiency}%合理，通过优化磁芯与开关器件可实现。`, level: 'good' })
  }

  // 6. Component values
  if (results.cr < 1e-9) {
    s.push({ text: '谐振电容Cr<1nF，数值较小，PCB寄生电容可能影响谐振点。', level: 'warn' })
  }
  if (results.lm < 50e-6) {
    s.push({ text: '励磁电感Lm<50μH，注意磁芯损耗与饱和电流。', level: 'warn' })
  }
  if (results.fsw > 500000) {
    s.push({ text: '开关频率>500kHz，注意开关损耗与EMI。', level: 'warn' })
  }

  return s.slice(0, 7)
}

// ─── Waveform SVG ───
function WaveformPreview({ topology, vin }: { topology: string; vin: number }) {
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

interface CalculatedData {
  n: number
  fr: number
  lr: number
  cr: number
  lm: number
  q: number
  lambda: number
  mMax: number
  mRequired: number
  mRequiredMin: number
  zvsMargin: boolean
  zvsPhase: number
  ipRms: number
  isRms: number
  vinNom: number
  vout: number
  pout: number
  fsw: number
  efficiency: number
  vinMin: number
  vinMax: number
  topology: string
  rectifier: string
  rac: number
  zr: number
}

// ─── Main Component ───
export default function Designer() {
  const { params, setParams, setResults, setSuggestions } = useDesign()
  const [form, setForm] = useState<DesignParameters>(params)
  const [showResults, setShowResults] = useState(false)
  const [calculated, setCalculated] = useState<CalculatedData | null>(null)
  const [suggestions, setLocalSuggestions] = useState<Suggestion[]>([])
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    results: false,
    suggestions: false,
    components: false,
    waveforms: false,
  })

  const handleCalculate = () => {
    const vinNom = form.vinNom
    const vout = form.vout
    const pout = form.pout
    const fsw = form.fsw * 1000
    const topology = form.topology
    const rectifier = form.rectifier
    const efficiency = form.efficiency
    const vinMin = form.vinMin
    const vinMax = form.vinMax

    // Turns ratio
    const n =
      topology === 'half-bridge'
        ? vinNom / (2 * vout)
        : vinNom / vout

    // Equivalent AC resistance
    const rac = (8 * n * n * vout * vout) / (Math.PI * Math.PI * pout)

    // Initial design: set fr = fsw, Q = 0.5, λ = 0.3
    const q = 0.5
    const lambda = 0.3
    const fr = fsw
    const zr = rac / q
    const lr = zr / (2 * Math.PI * fr)
    const cr = 1 / (2 * Math.PI * fr * zr)
    const lm = lambda * lr

    // Gain requirements
    const mRequiredMin = topology === 'half-bridge' ? (2 * n * vout) / vinMin : (n * vout) / vinMin
    const mRequiredMax = topology === 'half-bridge' ? (2 * n * vout) / vinMax : (n * vout) / vinMax

    // Peak gain
    const mMax = peakGain(lambda, q)

    // ZVS phase at fr (fn=1)
    const zvsPhaseDeg = zvsPhase(lambda, q)
    const zvsMargin = zvsPhaseDeg > 5

    // Current estimates
    const io = pout / vout
    let isRms: number
    if (rectifier === 'center-tapped') {
      isRms = (Math.PI / 2) * io
    } else {
      isRms = (Math.PI / (2 * Math.sqrt(2))) * io
    }
    const ipLoad = isRms / n
    const vLm = topology === 'half-bridge' ? vinNom / 2 : vinNom
    const imRms = vLm / (4 * Math.sqrt(3) * fsw * lm)
    const ipRms = Math.sqrt(ipLoad * ipLoad + imRms * imRms)

    const data: CalculatedData = {
      n,
      fr,
      lr,
      cr,
      lm,
      q,
      lambda,
      mMax,
      mRequired: mRequiredMax,
      mRequiredMin,
      zvsMargin,
      zvsPhase: zvsPhaseDeg,
      ipRms,
      isRms,
      vinNom,
      vout,
      pout,
      fsw,
      efficiency,
      vinMin,
      vinMax,
      topology,
      rectifier,
      rac,
      zr,
    }

    const s = generateSuggestions(form, {
      q,
      lambda,
      mMax,
      mRequired: mRequiredMax,
      mRequiredMin,
      zvsPhase: zvsPhaseDeg,
      lr,
      cr,
      lm,
      fsw,
      efficiency,
    })

    setCalculated(data)
    setLocalSuggestions(s)
    setParams(form)
    setResults({
      n,
      fr,
      lr,
      cr,
      lm,
      q,
      lambda,
      mMax,
      mRequired: mRequiredMax,
      zvsMargin,
      ipRms,
      isRms,
    })
    setSuggestions(s.map((item) => item.text))
    setShowResults(true)
  }

  const toggleSection = (key: string) => {
    setCollapsedSections((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const update = <K extends keyof DesignParameters>(key: K, value: DesignParameters[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const inputClass = 'input-field w-full'
  const labelClass = 'block text-sm font-medium text-text-secondary mb-1'
  const cardClass = 'card-surface p-5'

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Calculator className="w-8 h-8 text-primary-light" />
          <h1 className="text-3xl md:text-4xl font-bold text-gradient tracking-tight">LLC设计工具</h1>
        </div>
        <p className="text-text-secondary max-w-2xl">
          输入电源规格，自动计算谐振参数、增益裕量与元件选型建议。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Form */}
        <div className="lg:col-span-5 space-y-4">
          <div className={cardClass}>
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-primary-light" />
              <h2 className="text-lg font-semibold text-text-primary">输入规格</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={labelClass}>输入电压范围 (V)</label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <input
                      type="number"
                      className={inputClass}
                      value={form.vinMin}
                      onChange={(e) => update('vinMin', Number(e.target.value))}
                      placeholder="Min"
                    />
                    <span className="text-xs text-text-muted mt-1 block">Vin_min</span>
                  </div>
                  <div>
                    <input
                      type="number"
                      className={inputClass}
                      value={form.vinNom}
                      onChange={(e) => update('vinNom', Number(e.target.value))}
                      placeholder="Nom"
                    />
                    <span className="text-xs text-text-muted mt-1 block">Vin_nom</span>
                  </div>
                  <div>
                    <input
                      type="number"
                      className={inputClass}
                      value={form.vinMax}
                      onChange={(e) => update('vinMax', Number(e.target.value))}
                      placeholder="Max"
                    />
                    <span className="text-xs text-text-muted mt-1 block">Vin_max</span>
                  </div>
                </div>
              </div>

              <div>
                <label className={labelClass}>输出电压 Vout (V)</label>
                <input
                  type="number"
                  className={inputClass}
                  value={form.vout}
                  onChange={(e) => update('vout', Number(e.target.value))}
                />
              </div>
              <div>
                <label className={labelClass}>输出功率 Pout (W)</label>
                <input
                  type="number"
                  className={inputClass}
                  value={form.pout}
                  onChange={(e) => update('pout', Number(e.target.value))}
                />
              </div>
              <div>
                <label className={labelClass}>目标效率 η (%)</label>
                <input
                  type="number"
                  className={inputClass}
                  value={form.efficiency}
                  onChange={(e) => update('efficiency', Number(e.target.value))}
                />
              </div>
              <div>
                <label className={labelClass}>开关频率 fsw (kHz)</label>
                <input
                  type="number"
                  className={inputClass}
                  value={form.fsw}
                  onChange={(e) => update('fsw', Number(e.target.value))}
                />
              </div>
              <div>
                <label className={labelClass}>拓扑</label>
                <select
                  className={inputClass}
                  value={form.topology}
                  onChange={(e) => update('topology', e.target.value as any)}
                >
                  <option value="half-bridge">半桥 (Half-bridge)</option>
                  <option value="full-bridge">全桥 (Full-bridge)</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>整流方式</label>
                <select
                  className={inputClass}
                  value={form.rectifier}
                  onChange={(e) => update('rectifier', e.target.value as any)}
                >
                  <option value="full-wave">全波整流</option>
                  <option value="center-tapped">中心抽头</option>
                  <option value="synchronous">同步整流</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>负载范围 (%)</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <input
                      type="number"
                      className={inputClass}
                      value={form.loadMin}
                      onChange={(e) => update('loadMin', Number(e.target.value))}
                    />
                    <span className="text-xs text-text-muted mt-1 block">最小负载</span>
                  </div>
                  <div>
                    <input
                      type="number"
                      className={inputClass}
                      value={form.loadMax}
                      onChange={(e) => update('loadMax', Number(e.target.value))}
                    />
                    <span className="text-xs text-text-muted mt-1 block">最大负载</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleCalculate}
              className="mt-5 w-full bg-primary hover:bg-primary-light text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Calculator className="w-4 h-4" />
              计算
            </button>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-7 space-y-4">
          {calculated && (
            <>
              {/* Calculated Results */}
              <div className={cardClass}>
                <button
                  onClick={() => toggleSection('results')}
                  className="w-full flex items-center justify-between mb-2"
                >
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary-light" />
                    <h2 className="text-lg font-semibold text-text-primary">计算结果</h2>
                  </div>
                  {collapsedSections.results ? (
                    <ChevronDown className="w-4 h-4 text-text-muted" />
                  ) : (
                    <ChevronUp className="w-4 h-4 text-text-muted" />
                  )}
                </button>
                {!collapsedSections.results && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                    <ResultItem label="匝比 n" value={calculated.n.toFixed(2)} unit="" formula="n = Vin / (2·Vout)" />
                    <ResultItem label="谐振频率 fr" value={(calculated.fr / 1000).toFixed(1)} unit="kHz" formula="fr = 1/(2π√(Lr·Cr))" />
                    <ResultItem label="谐振电感 Lr" value={(calculated.lr * 1e6).toFixed(2)} unit="μH" formula="Lr = Zr / (2π·fr)" />
                    <ResultItem label="谐振电容 Cr" value={(calculated.cr * 1e9).toFixed(2)} unit="nF" formula="Cr = 1/(2π·fr·Zr)" />
                    <ResultItem label="励磁电感 Lm" value={(calculated.lm * 1e6).toFixed(2)} unit="μH" formula="Lm = λ·Lr" />
                    <ResultItem label="品质因数 Q" value={calculated.q.toFixed(2)} unit="" formula="Q = Zr / Rac" />
                    <ResultItem label="电感比 λ" value={calculated.lambda.toFixed(2)} unit="" formula="λ = Lm / Lr" />
                    <ResultItem
                      label="所需增益 M_req"
                      value={calculated.mRequiredMin.toFixed(3)}
                      unit=""
                      formula="M = 2nVout/Vin"
                      highlight={calculated.mMax < calculated.mRequiredMin ? 'critical' : 'good'}
                    />
                    <ResultItem
                      label="峰值增益 M_max"
                      value={calculated.mMax.toFixed(3)}
                      unit=""
                      formula="数值寻优峰值"
                      highlight={calculated.mMax >= calculated.mRequiredMin ? 'good' : 'critical'}
                    />
                    <ResultItem
                      label="ZVS裕量"
                      value={calculated.zvsMargin ? '可达' : '不足'}
                      unit=""
                      formula={`相位 ${calculated.zvsPhase.toFixed(1)}°`}
                      highlight={calculated.zvsMargin ? 'good' : 'critical'}
                    />
                    <ResultItem label="初级电流 RMS" value={calculated.ipRms.toFixed(2)} unit="A" formula="Ip = √(Iload² + Im²)" />
                    <ResultItem label="次级电流 RMS" value={calculated.isRms.toFixed(2)} unit="A" formula="Is = (π/2√2)·Io" />
                  </div>
                )}
              </div>

              {/* Optimization Suggestions */}
              <div className={cardClass}>
                <button
                  onClick={() => toggleSection('suggestions')}
                  className="w-full flex items-center justify-between mb-2"
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-accent" />
                    <h2 className="text-lg font-semibold text-text-primary">优化建议</h2>
                  </div>
                  {collapsedSections.suggestions ? (
                    <ChevronDown className="w-4 h-4 text-text-muted" />
                  ) : (
                    <ChevronUp className="w-4 h-4 text-text-muted" />
                  )}
                </button>
                {!collapsedSections.suggestions && (
                  <div className="space-y-3 mt-3">
                    {suggestions.map((s, i) => (
                      <div
                        key={i}
                        className={`flex items-start gap-3 p-3 rounded-lg border ${
                          s.level === 'good'
                            ? 'bg-green-500/10 border-green-500/30'
                            : s.level === 'warn'
                            ? 'bg-amber-500/10 border-amber-500/30'
                            : 'bg-red-500/10 border-red-500/30'
                        }`}
                      >
                        {s.level === 'good' ? (
                          <CheckCircle className="w-5 h-5 text-success shrink-0 mt-0.5" />
                        ) : s.level === 'warn' ? (
                          <AlertTriangle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
                        )}
                        <p
                          className={`text-sm ${
                            s.level === 'good'
                              ? 'text-green-400'
                              : s.level === 'warn'
                              ? 'text-amber-400'
                              : 'text-red-400'
                          }`}
                        >
                          {s.text}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Component Selection */}
              <div className={cardClass}>
                <button
                  onClick={() => toggleSection('components')}
                  className="w-full flex items-center justify-between mb-2"
                >
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-primary-light" />
                    <h2 className="text-lg font-semibold text-text-primary">元件选型</h2>
                  </div>
                  {collapsedSections.components ? (
                    <ChevronDown className="w-4 h-4 text-text-muted" />
                  ) : (
                    <ChevronUp className="w-4 h-4 text-text-muted" />
                  )}
                </button>
                {!collapsedSections.components && (
                  <div className="mt-3 space-y-4">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead>
                          <tr className="border-b border-border text-text-secondary">
                            <th className="py-2 pr-4">元件</th>
                            <th className="py-2 pr-4">计算值</th>
                            <th className="py-2 pr-4">E12 推荐</th>
                            <th className="py-2 pr-4">E24 推荐</th>
                            <th className="py-2">备注</th>
                          </tr>
                        </thead>
                        <tbody className="text-text-primary">
                          <tr className="border-b border-border/50">
                            <td className="py-2 pr-4 font-medium">Lr</td>
                            <td className="py-2 pr-4">{(calculated.lr * 1e6).toFixed(2)} μH</td>
                            <td className="py-2 pr-4">{(nearestE(calculated.lr * 1e6, E12)).toFixed(1)} μH</td>
                            <td className="py-2 pr-4">{(nearestE(calculated.lr * 1e6, E24)).toFixed(1)} μH</td>
                            <td className="py-2 text-text-secondary">谐振电感，需承受Ip_rms</td>
                          </tr>
                          <tr className="border-b border-border/50">
                            <td className="py-2 pr-4 font-medium">Cr</td>
                            <td className="py-2 pr-4">{(calculated.cr * 1e9).toFixed(2)} nF</td>
                            <td className="py-2 pr-4">{(nearestE(calculated.cr * 1e9, E12)).toFixed(1)} nF</td>
                            <td className="py-2 pr-4">{(nearestE(calculated.cr * 1e9, E24)).toFixed(1)} nF</td>
                            <td className="py-2 text-text-secondary">薄膜电容，低损耗</td>
                          </tr>
                          <tr className="border-b border-border/50">
                            <td className="py-2 pr-4 font-medium">Lm</td>
                            <td className="py-2 pr-4">{(calculated.lm * 1e6).toFixed(2)} μH</td>
                            <td className="py-2 pr-4">—</td>
                            <td className="py-2 pr-4">—</td>
                            <td className="py-2 text-text-secondary">变压器集成，通过气隙调节</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-surface-elevated rounded-lg p-3 border border-border">
                        <h4 className="text-sm font-semibold text-text-primary mb-2 flex items-center gap-2">
                          <Layers className="w-4 h-4 text-primary-light" />
                          MOSFET 建议
                        </h4>
                        <ul className="text-sm text-text-secondary space-y-1">
                          <li>
                            耐压: ≥{' '}
                            <span className="text-text-primary font-mono">
                              {Math.ceil(calculated.topology === 'half-bridge' ? calculated.vinMax : calculated.vinMax * 1.2)}
                            </span>{' '}
                            V
                          </li>
                          <li>
                            电流: ≥{' '}
                            <span className="text-text-primary font-mono">
                              {(calculated.ipRms * 2.5).toFixed(1)}
                            </span>{' '}
                            A (RMS × 2.5 裕量)
                          </li>
                          <li>
                            推荐: 低Rds(on) SJ-MOS / GaN (fsw {'>'} 300kHz)
                          </li>
                        </ul>
                      </div>
                      <div className="bg-surface-elevated rounded-lg p-3 border border-border">
                        <h4 className="text-sm font-semibold text-text-primary mb-2 flex items-center gap-2">
                          <ArrowRight className="w-4 h-4 text-primary-light" />
                          整流器件建议
                        </h4>
                        <ul className="text-sm text-text-secondary space-y-1">
                          <li>
                            类型:{' '}
                            {calculated.rectifier === 'synchronous'
                              ? '同步整流 MOSFET'
                              : calculated.rectifier === 'center-tapped'
                              ? '肖特基二极管（中心抽头）'
                              : '肖特基二极管（全桥）'}
                          </li>
                          <li>
                            耐压: ≥{' '}
                            <span className="text-text-primary font-mono">
                              {Math.ceil(calculated.vout * (calculated.rectifier === 'center-tapped' ? 2.5 : 2))}
                            </span>{' '}
                            V
                          </li>
                          <li>
                            电流: ≥{' '}
                            <span className="text-text-primary font-mono">
                              {(calculated.isRms * 1.5).toFixed(1)}
                            </span>{' '}
                            A
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Waveform Preview */}
              <WaveformPreview topology={calculated.topology} vin={calculated.vinMax} />
            </>
          )}

          {!calculated && (
            <div className="card-surface p-8 flex flex-col items-center justify-center text-center min-h-[300px]">
              <Calculator className="w-12 h-12 text-text-muted mb-4" />
              <p className="text-text-secondary text-lg">输入参数并点击“计算”以查看结果</p>
              <p className="text-text-muted text-sm mt-2">系统将自动计算谐振参数、增益裕量与优化建议</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ResultItem({
  label,
  value,
  unit,
  formula,
  highlight,
}: {
  label: string
  value: string
  unit: string
  formula: string
  highlight?: 'good' | 'critical'
}) {
  return (
    <div className="bg-surface-elevated rounded-lg p-3 border border-border hover:border-border-light transition-colors">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-text-secondary">{label}</span>
        <Info className="w-3.5 h-3.5 text-text-muted" />
      </div>
      <div className="flex items-baseline gap-1">
        <span
          className={`text-xl font-mono font-semibold ${
            highlight === 'good' ? 'text-success' : highlight === 'critical' ? 'text-danger' : 'text-text-primary'
          }`}
        >
          {value}
        </span>
        <span className="text-sm text-text-muted">{unit}</span>
      </div>
      <div className="text-xs text-text-muted mt-1 font-mono">{formula}</div>
    </div>
  )
}
