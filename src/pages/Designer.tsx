import { useState, useEffect } from 'react'
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
  Flame,
  BatteryCharging,
  Gauge,
  Save,
  GitCompare,
  LineChart as LineChartIcon,
  RotateCcw,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line, ReferenceLine } from 'recharts'
import CompensationSection from '../components/CompensationSection'
import DesignCompare, { saveDesignSnapshot } from '../components/DesignCompare'

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
// M = 1 / sqrt((1 + 1/k(1 - 1/fn²))² + (Q*(fn - 1/fn))²)
function gainM(fn: number, k: number, q: number): number {
  const a = 1 + (1 / k) * (1 - 1 / (fn * fn))
  const b = q * (fn - 1 / fn)
  return 1 / Math.sqrt(a * a + b * b)
}

function peakGain(k: number, q: number): number {
  let maxM = 0
  const step = 0.005
  for (let fn = 0.3; fn <= 1.0; fn += step) {
    const m = gainM(fn, k, q)
    if (m > maxM) maxM = m
  }
  return maxM
}

// ZVS phase check at fsw (fn = 1 since fr = fsw in our design)
function zvsPhase(k: number, q: number): number {
  // At fn=1, the real part of Zin is (ωLm)²Rac / (Rac² + (ωLm)²)
  // Imag part is ωLmRac² / (Rac² + (ωLm)²)
  // Since at fn=1, Lr and Cr cancel, Zin = jωLm || Rac
  // Let x = ωLm / Rac = 1 / (q * k) ... wait
  // Actually, Zr = q * Rac, and ωLm = Zr * k / (1) since at fr, ωLr = Zr and Lm = k*Lr, so ωLm = k*Zr = k*q*Rac
  // So ωLm / Rac = k * q
  const x = k * q
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
    k: number
    mMax: number
    mRequired: number
    mRequiredMin: number
    zvsPhase: number
    lr: number
    cr: number
    lm: number
    fsw: number
    efficiency: number
    qmax1: number
    qmax2: number
    qmax3: number
    gmaxEmpty: number
    zvsMargin: boolean
    zvsTimeOk: boolean
    tZvs: number
    er: number
    ec: number
    fmax: number
    fmin: number
    kMax: number
  }
): Suggestion[] {
  const s: Suggestion[] = []
  const { q, k, mMax, mRequired, mRequiredMin, zvsPhase, lr, cr, lm, fsw, efficiency, qmax1, qmax2, qmax3, gmaxEmpty, zvsMargin, zvsTimeOk, tZvs, er, ec, fmax, fmin, kMax } = results

  // 1. k值与空载增益约束上限 kMax
  // kMax = 1/(Gmax - 1)，是空载增益能满足 Gmax 的最大 k 值
  // 约束条件：k <= kMax，k 越小空载增益越高（裕量越大）
  if (k > kMax) {
    s.push({ text: `电感比k=${k.toFixed(2)}大于空载增益约束上限k_max=${kMax.toFixed(2)}，空载增益裕量不足。当前设计在最低输入电压下可能无法达到额定输出。建议减小k至≤${kMax.toFixed(2)}或提高最低输入电压。`, level: 'critical' })
  } else if (k > kMax * 0.8) {
    s.push({ text: `电感比k=${k.toFixed(2)}接近约束上限k_max=${kMax.toFixed(2)}（裕量<20%），空载增益裕量较小。建议减小k至≤${(kMax * 0.5).toFixed(2)}以获得更充裕的增益裕量。`, level: 'warn' })
  } else if (k > kMax * 0.3) {
    s.push({ text: `电感比k=${k.toFixed(2)}处于合理范围（k_max=${kMax.toFixed(2)}），空载峰值增益Gmax_empty=${gmaxEmpty.toFixed(3)} > 所需Gmax=${mRequired.toFixed(3)}，裕量良好。`, level: 'good' })
  } else {
    s.push({ text: `电感比k=${k.toFixed(2)}远小于约束上限k_max=${kMax.toFixed(2)}，空载增益裕量非常充裕。但k过小会导致励磁电流偏大，效率降低。建议考虑增大k至${(kMax * 0.3).toFixed(2)}~${(kMax * 0.7).toFixed(2)}区间以优化效率。`, level: 'good' })
  }

  // 2. Qmax对比分析
  const qmaxMin = Math.min(qmax1, qmax2, qmax3)
  if (qmax1 === qmaxMin) {
    s.push({ text: `Qmax1(增益限制)=${qmax1.toFixed(3)} 为最小约束，增益范围是设计瓶颈。`, level: 'warn' })
  } else if (qmax2 === qmaxMin) {
    s.push({ text: `Qmax2(ZVS死区限制)=${qmax2.toFixed(3)} 为最小约束，ZVS条件是设计瓶颈。建议增大死区时间或减小Lm。`, level: 'warn' })
  } else if (qmax3 === qmaxMin) {
    s.push({ text: `Qmax3(Coss能量限制)=${qmax3.toFixed(3)} 为最小约束，寄生电容是设计瓶颈。建议选用低Coss MOSFET。`, level: 'warn' })
  }
  s.push({ text: `Qmax分解：Qmax1=${qmax1.toFixed(3)}, Qmax2=${qmax2.toFixed(3)}, Qmax3=${qmax3.toFixed(3)}，实际取Q=${q.toFixed(3)}(95%裕量)。`, level: 'good' })

  // 3. Q value
  if (q > 1.0) {
    s.push({ text: 'Q值偏高（>1.0），谐振阻抗大，频率调节范围可能过宽。', level: 'critical' })
  } else if (q > 0.7) {
    s.push({ text: 'Q值略高，负载变化时频率调节范围可能较宽。', level: 'warn' })
  } else if (q < 0.2) {
    s.push({ text: 'Q值偏低（<0.2），谐振电流纹波较大，注意滤波设计。', level: 'warn' })
  } else {
    s.push({ text: `Q值=${q.toFixed(3)}处于合理范围（0.2~0.7），谐振特性良好。`, level: 'good' })
  }

  // 4. Peak gain vs required
  if (mMax < mRequired) {
    s.push({ text: `峰值增益不足（M_max=${mMax.toFixed(3)} < Gmax=${mRequired.toFixed(3)}），无法覆盖输入电压下限。建议增大k或降低Q。`, level: 'critical' })
  } else if (mMax < mRequired * 1.05) {
    s.push({ text: `峰值增益裕量较小（${((mMax/mRequired - 1)*100).toFixed(1)}%），建议留至少5%裕量。`, level: 'warn' })
  } else {
    s.push({ text: `峰值增益裕量充足（M_max=${mMax.toFixed(3)} vs Gmax=${mRequired.toFixed(3)}），设计可行。`, level: 'good' })
  }

  // 5. ZVS分析
  if (!zvsMargin) {
    s.push({ text: `ZVS条件不满足！Er=${(er*1e6).toFixed(3)}μJ < Ec=${(ec*1e6).toFixed(3)}μJ。建议增大死区时间、减小Lm或选用低Coss器件。`, level: 'critical' })
  } else {
    const zvsRatio = er / ec
    if (zvsRatio < 1.2) {
      s.push({ text: `ZVS裕量较小（Er/Ec=${zvsRatio.toFixed(2)}），建议增大励磁电流或死区时间。`, level: 'warn' })
    } else {
      s.push({ text: `ZVS条件良好（Er=${(er*1e6).toFixed(3)}μJ / Ec=${(ec*1e6).toFixed(3)}μJ，裕量比${zvsRatio.toFixed(2)}）。`, level: 'good' })
    }
  }
  if (!zvsTimeOk) {
    s.push({ text: `ZVS时间不足！t_ZVS=${(tZvs*1e9).toFixed(1)}ns > 死区时间Td=${(params.td).toFixed(0)}ns。需增大励磁电流Im或减小死区时间。`, level: 'critical' })
  } else {
    s.push({ text: `ZVS时间充裕：t_ZVS=${(tZvs*1e9).toFixed(1)}ns ≤ Td=${params.td}ns，可在死区内完成谐振腔放电。`, level: 'good' })
  }

  // 6. 频率范围
  const fmaxKHz = fmax / 1000
  const fminKHz = fmin / 1000
  const frKHz = fsw / 1000
  if (fmaxKHz > frKHz * 2.0) {
    s.push({ text: `频率调节范围过宽（fmax=${fmaxKHz.toFixed(1)}kHz >> fr=${frKHz.toFixed(1)}kHz），磁性元件设计困难。`, level: 'critical' })
  } else if (fmaxKHz > frKHz * 1.5) {
    s.push({ text: `频率范围较宽（fmin=${fminKHz.toFixed(1)}kHz ~ fmax=${fmaxKHz.toFixed(1)}kHz），注意磁性元件在宽频下的损耗。`, level: 'warn' })
  } else {
    s.push({ text: `频率范围合理：fmin=${fminKHz.toFixed(1)}kHz ~ fmax=${fmaxKHz.toFixed(1)}kHz（fr=${frKHz.toFixed(1)}kHz）。`, level: 'good' })
  }

  // 7. Efficiency target
  if (efficiency > 97) {
    s.push({ text: '目标效率>97%，需选用极低Rds(on) MOSFET、同步整流并优化磁芯与绕组。', level: 'warn' })
  } else if (efficiency < 92) {
    s.push({ text: '目标效率较为保守，容易达到，仍有优化空间。', level: 'good' })
  } else {
    s.push({ text: `目标效率${efficiency}%合理，通过优化磁芯与开关器件可实现。`, level: 'good' })
  }

  // 8. Component values
  if (cr < 1e-9) {
    s.push({ text: '谐振电容Cr<1nF，数值较小，PCB寄生电容可能影响谐振点。', level: 'warn' })
  }
  if (lm < 50e-6) {
    s.push({ text: '励磁电感Lm<50μH，注意磁芯损耗与饱和电流。', level: 'warn' })
  }
  if (fsw > 500000) {
    s.push({ text: '开关频率>500kHz，注意开关损耗与EMI。', level: 'warn' })
  }

  return s.slice(0, 10)
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
  k: number
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
// 新增计算结果
  fmax: number
  fmin: number
  gmaxEmpty: number
  zvsEr: number
  zvsEc: number
  qmax1: number
  qmax2: number
  qmax3: number
  gMin: number
  gMax: number
  gNom: number
  designFeasible: boolean
  // 新增字段
  zvsTimeOk: boolean
  tZvs: number
  irRms: number
  imRms: number
  bPeak: number
  gainCurveData: Array<{ fn: number; m: number }>
}

// ─── Loss Analysis Types & Defaults ───
interface LossParameters {
  mosfetRdsOn: number // mΩ
  mosfetTr: number // ns
  mosfetTf: number // ns
  mosfetCoss: number // pF @ 0V
  mosfetVsd: number // V body diode
  deadTime: number // ns
  primaryTurns: number
  coreMaterial: string
  coreVe: number // cm³
  coreAe: number // mm²
  coreK: number
  coreAlpha: number
  coreBeta: number
  windingRdc: number // mΩ
  skinF0: number // kHz
  rectVf: number // V
  syncRectRdsOn: number // mΩ
  lrDcr: number // mΩ
  crEsr: number // mΩ
}

const defaultLossParams: LossParameters = {
  mosfetRdsOn: 30,
  mosfetTr: 15,
  mosfetTf: 10,
  mosfetCoss: 150,
  mosfetVsd: 1.2,
  deadTime: 200,
  primaryTurns: 30,
  coreMaterial: 'PC95',
  coreVe: 5.0,
  coreAe: 80,
  coreK: 1.5e-6,
  coreAlpha: 1.3,
  coreBeta: 2.5,
  windingRdc: 50,
  skinF0: 100,
  rectVf: 0.6,
  syncRectRdsOn: 5,
  lrDcr: 30,
  crEsr: 20,
}

interface LossBreakdown {
  name: string
  value: number
  color: string
}

function calculateLosses(
  calc: CalculatedData,
  lp: LossParameters
): {
  mosfetCond: number
  mosfetSwitchOn: number
  mosfetSwitchOff: number
  mosfetCoss: number
  mosfetDiode: number
  coreLoss: number
  bPeak: number
  windingLoss: number
  rectLoss: number
  resonantLoss: number
  totalLoss: number
  efficiency: number
  breakdown: LossBreakdown[]
} {
  const vin = calc.vinNom
  const fsw = calc.fsw
  const ipRms = calc.ipRms
  const ipPeak = ipRms * Math.sqrt(2)
  const io = calc.pout / calc.vout
  const nSwitches = calc.topology === 'half-bridge' ? 2 : 4

  // 1. MOSFET conduction loss
  const mosfetCondPer = 0.5 * ipRms * ipRms * (lp.mosfetRdsOn / 1000)
  const mosfetCond = mosfetCondPer * nSwitches

  // ZVS 状态下开通损耗与 Coss 损耗可忽略（谐振电流在死区完成电容充放电）
  const zvsOn = calc.zvsMargin && calc.zvsTimeOk

  // 2. Switching loss (linear approximation; with ZVS Pon ideally 0)
  const switchV = vin
  const switchOn = zvsOn ? 0 : 0.5 * switchV * ipPeak * (lp.mosfetTr / 1e9) * fsw * nSwitches
  const switchOff = 0.5 * switchV * ipPeak * (lp.mosfetTf / 1e9) * fsw * nSwitches

  // 3. Coss loss (non-linear model, simplified)
  // 系数 2/3 考虑了 MOSFET 结电容 C_oss 随 V_ds 的非线性变化
  // 不同厂商/型号的 C_oss 非线性特性不同，精确损耗建议查手册 E_oss 曲线
  // ZVS 下 Coss 储能被谐振电流回收，损耗近似为 0
  const cossF = lp.mosfetCoss / 1e12
  const ecoss = 0.5 * cossF * vin * vin * (2 / 3)
  const cossLoss = zvsOn ? 0 : ecoss * fsw * nSwitches

  // 4. Body diode conduction loss (approximate dead time current = Ip_peak * 0.7)
  // 0.7 为经验系数，实际体二极管电流波形因死区时间、C_oss 充放电波形而异
  // 精确估算需时域仿真或示波器实测
  const idiode = ipPeak * 0.7
  const diodeLoss = lp.mosfetVsd * idiode * (lp.deadTime / 1e9) * fsw * nSwitches

  // 5. Transformer core loss (Steinmetz)
  // 公式: P_core = C_m * f_sw^α * B_peak^β * V_e
  // 注意: C_m 的单位基于 kHz、mT、cm³，计算结果为 mW，需 /1000 转为 W:
  //   - fsw 需要 /1000 转换为 kHz
  //   - B_peak 需要 *1000 转换为 mT
  //   - V_e 单位为 cm³
  //   - 最终结果需 /1000 转换为 W
  const aeM2 = lp.coreAe * 1e-6
  const bPeak = (vin / (calc.topology === 'half-bridge' ? 2 : 1)) / (4 * fsw * lp.primaryTurns * aeM2)
  const coreLoss = lp.coreK * Math.pow(fsw / 1e3, lp.coreAlpha) * Math.pow(bPeak * 1000, lp.coreBeta) * lp.coreVe / 1000
  const bPeakMt = bPeak * 1000

  // 6. Winding loss (DC + skin effect)
  const rdc = lp.windingRdc / 1000
  const freqRatio = fsw / 1000 / lp.skinF0
  const racFactor = 1 + freqRatio * freqRatio
  const windingLoss = ipRms * ipRms * rdc * racFactor

  // 7. Rectifier loss
  let rectLoss = 0
  const isSync = calc.rectifier === 'synchronous' || calc.rectifier === 'sync-center-tapped'
  if (isSync) {
    const rectSwitches = calc.rectifier === 'sync-center-tapped' ? 2 : 4
    const isPerSwitch = calc.isRms / Math.sqrt(2)
    rectLoss = rectSwitches * isPerSwitch * isPerSwitch * (lp.syncRectRdsOn / 1000)
  } else {
    const rectDiodes = calc.rectifier === 'center-tapped' ? 2 : 4
    const iAvgPerDiode = io / 2
    rectLoss = rectDiodes * lp.rectVf * iAvgPerDiode
  }

  // 8. Resonant element loss
  const lrLoss = ipRms * ipRms * (lp.lrDcr / 1000)
  const crLoss = ipRms * ipRms * (lp.crEsr / 1000)
  const resonantLoss = lrLoss + crLoss

  const totalLoss = mosfetCond + switchOn + switchOff + cossLoss + diodeLoss + coreLoss + windingLoss + rectLoss + resonantLoss
  const efficiency = (calc.pout / (calc.pout + totalLoss)) * 100

  const breakdown: LossBreakdown[] = [
    { name: 'MOSFET导通', value: mosfetCond, color: '#14b8a6' },
    { name: 'MOSFET开通', value: switchOn, color: '#0f766e' },
    { name: 'MOSFET关断', value: switchOff, color: '#134e4a' },
    { name: 'Coss损耗', value: cossLoss, color: '#f59e0b' },
    { name: '体二极管', value: diodeLoss, color: '#ef4444' },
    { name: '磁芯损耗', value: coreLoss, color: '#22c55e' },
    { name: '绕组损耗', value: windingLoss, color: '#a3a3a3' },
    { name: '整流损耗', value: rectLoss, color: '#fbbf24' },
    { name: '谐振元件', value: resonantLoss, color: '#737373' },
  ].filter((d) => d.value > 0.001)

  return {
    mosfetCond,
    mosfetSwitchOn: switchOn,
    mosfetSwitchOff: switchOff,
    mosfetCoss: cossLoss,
    mosfetDiode: diodeLoss,
    coreLoss,
    bPeak: bPeakMt,
    windingLoss,
    rectLoss,
    resonantLoss,
    totalLoss,
    efficiency,
    breakdown,
  }
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
    loss: false,
    compensation: true,
    compare: true,
  })
  const [lossParams, setLossParams] = useState<LossParameters>(defaultLossParams)
  const [needsRecalculation, setNeedsRecalculation] = useState(false)
  const [lastFormSnapshot, setLastFormSnapshot] = useState<DesignParameters | null>(null)

  // Detect parameter changes → prompt for recalculation
  useEffect(() => {
    if (calculated && lastFormSnapshot) {
      const changed = JSON.stringify(form) !== JSON.stringify(lastFormSnapshot)
      setNeedsRecalculation(changed)
    }
  }, [form, lastFormSnapshot, calculated])

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
    const vd = form.vd
    const cossEq = form.cossEq * 1e-12  // pF -> F
    const cossEr = form.cossEr * 1e-12  // pF -> F
    const cj = form.cj * 1e-12          // pF -> F
    const td = form.td * 1e-9           // ns -> s
    const ioMax = form.ioMax
    const loadMin = form.loadMin

    const voutEff = vout + vd  // 考虑二极管压降的有效输出电压

    // ─── 步骤1：确定电感比k（k=Lm/Lr）───
    // k为预设值，典型范围3~10
    const k = form.k

    // ─── 步骤2：计算匝比n ───
    // 标准FHA方法：谐振频率处增益 = 1，不使用虚拟增益
    const n =
      topology === 'half-bridge'
        ? vinNom / (2 * voutEff)
        : vinNom / voutEff

    // ─── 步骤3：计算增益范围（归一化到谐振频率=1）───
    // Gmax/Gmin 基于标准FHA方法：谐振频率处增益 = 1
    // 不包含Mv，谐振频率处归一化增益为1
    const gMax = vinNom / vinMin
    const gMin = vinNom / vinMax
    const gNom = 1.0  // 谐振频率处归一化增益为1

    // 空载Region 1增益（fn>1，Q→0时增益趋向 1+1/k）
    // 注：在Region 2（fn<1）空载增益理论上无穷大，此处给出Region 1工程参考值
    const gmaxEmpty = 1 + 1 / k

    // k的最大值：满足空载增益 >= Gmax 的约束上限
    // 空载增益 G_empty = 1 + 1/k >= Gmax  =>  1/k >= Gmax - 1  =>  k <= 1/(Gmax - 1)
    // 因此 k_max 是 k 的上限，k 越小空载增益裕量越大
    const kMax = 1 / Math.max(1e-6, gMax - 1)

    // ─── 步骤4：计算Qmax ───
    const fr = fsw  // 设谐振频率fr = fsw

    // 等效AC电阻：匝比n已用Vout+Vd计算，因此Rac使用实际输出电压Vout
    const rac = (8 * n * n * vout * vout) / (Math.PI * Math.PI * pout)

    // 最小负载对应的Rac（负载越轻，等效电阻越大）
    const pMin = pout * (loadMin / 100)
    const racMin = rac * (pout / pMin)

    // Qmax1：峰值增益约束（Gmax为归一化增益，peakGain直接比较）
    function findQmax1(kVal: number, targetGain: number): number {
      let lowQ = 0.001
      let highQ = 5.0
      const tolerance = 0.001
      for (let iter = 0; iter < 50; iter++) {
        const midQ = (lowQ + highQ) / 2
        const peakM = peakGain(kVal, midQ)
        if (peakM > targetGain) {
          lowQ = midQ
        } else {
          highQ = midQ
        }
        if (highQ - lowQ < tolerance) break
      }
      return (lowQ + highQ) / 2
    }
    const qmax1 = findQmax1(k, gMax)

    // Qmax2：ZVS条件（死区时间），基于能量守恒推导
    // 系数 16 来源于半桥 LLC 死区时间近似公式 t_dead = 16·C_eq·f_r·L_m 的反推
    // 若拓扑为全桥或死区定义不同，该系数需重新推导
    // fmax估计：基于空载增益公式 fn² = G/(G*(k+1)-k)，仅当 gMin >= k/(k+1) 时可行
    const region1MinGain = k / (k + 1)
    const fmaxFeasible = gMin >= region1MinGain
    const fmaxEst = fmaxFeasible
      ? fr * Math.sqrt(Math.max(0.001, gMin / Math.max(1e-9, gMin * (k + 1) - k)))
      : Infinity
    // Coss 参数区分：
    // - cossEq：等效输出电容（用于 ZVS 死区时间 / qmax2）
    // - cossEr：能量相关电容（用于 ZVS 能量 / qmax3 及后续能量校验）
    const cossZvs = Math.max(1e-12, 2 * cossEq + cj)  // 保护：最小1pF = 1e-12 F
    const cossTotal = Math.max(1e-12, 2 * cossEr + cj)

    // Qmax2：ZVS条件（死区时间），基于能量守恒推导
    // 系数 16 来源于半桥 LLC 死区时间近似公式 t_dead = 16·C_eq·f_r·L_m 的反推
    // 若拓扑为全桥或死区定义不同，该系数需重新推导
    const qmax2 = fmaxFeasible
      ? ((k + 1) * vinMin * vinMin / Math.max(1e-15, 16 * fmaxEst * fmaxEst * k * k * cossZvs * vinMax * vinMax)) * (2 * Math.PI * fr) / Math.max(1e-6, racMin)
      : Infinity

    // Qmax3：ZVS 能量约束（由励磁电感储能 ≥ Coss 总能量推导出的 Q 上限）
    // 推导：Lm = k·Lr = k·Q·Rac_min/(2π fr) 必须满足
    //   0.5·Lm·(Vin_min/(coeff·fmax·Lm))² ≥ 0.5·Coss_total·Vin_max²
    // 其中 coeff = 8（半桥）/ 4（全桥），与后续 ZVS 能量校验一致。
    const zvsCoeff = topology === 'half-bridge' ? 8 : 4
    const qmax3 = fmaxFeasible
      ? (2 * Math.PI * fr * vinMin * vinMin)
        / Math.max(1e-15,
            zvsCoeff * zvsCoeff * fmaxEst * fmaxEst * k * cossTotal * vinMax * vinMax * Math.max(1e-6, racMin))
      : Infinity

    // 取Qmax，留95%裕量
    const qmax = Math.max(0.001, Math.min(qmax1, qmax2, qmax3))
    const q = Math.max(0.001, qmax * 0.95)

    // ─── 步骤5：计算谐振参数 ───
    const zr = q * Math.max(1e-6, racMin)
    const lr = zr / Math.max(1e-6, 2 * Math.PI * fr)
    const cr = 1 / Math.max(1e-15, 2 * Math.PI * fr * zr)
    const lm = k * lr

    // ─── 步骤6：验证 ───
    // fmax/fmin：从空载增益公式精确推导
    // fmax 对应 Region 1（fn>1），要求 gMin >= k/(k+1)
    const fmax = fmaxFeasible
      ? fr * Math.sqrt(Math.max(0.001, gMin / Math.max(1e-9, gMin * (k + 1) - k)))
      : Infinity
    // fmin 对应 Region 2（fn<1），分母为 -k
    const fmin = fr * Math.sqrt(Math.max(0.001, gMax / Math.max(1e-9, gMax * (k + 1) - k)))

    // 整体设计可行性
    const designFeasible = fmaxFeasible && k <= kMax

    // ZVS能量验证
    // 只有励磁电感 Lm 中的储能参与ZVS，Lr 在死区时间内与 Cr 谐振，不贡献ZVS能量
    // 半桥谐振腔电压幅值为 Vin/2，因此分母为 8*f*Lm；全桥为 4*f*Lm
    const fmaxZvs = Number.isFinite(fmax) ? fmax : fr
    const imDeadtime = vinMin / Math.max(1e-9, (topology === 'half-bridge' ? 8 : 4) * fmaxZvs * lm)
    const er = 0.5 * lm * imDeadtime * imDeadtime
    const ec = 0.5 * cossTotal * vinMax * vinMax
    const zvsMargin = er >= ec

    // ZVS时间验证：死区时间内是否完成充放电
    // t_zvs = 2*Coss*Vds / Im，需要 t_zvs <= td
    const tZvs = cossTotal * vinMax / Math.max(1e-9, imDeadtime)
    const zvsTimeOk = tZvs <= td

    // ZVS相位（在fr处）
    const zvsPhaseDeg = zvsPhase(k, q)

    // ─── 步骤7：电流计算 ───
    const io = pout / Math.max(1e-6, vout)

    // 次级电流
    // 中心抽头：每个绕组电流是半波正弦，峰值 = π·Io/2，有效值 = 峰值/2 = π·Io/4
    // 全波：isRms = π·Io/(2√2) ≈ 1.11·Io
    let isRms: number
    if (rectifier === 'center-tapped' || rectifier === 'sync-center-tapped') {
      isRms = (Math.PI / 4) * io
    } else {
      isRms = (Math.PI / (2 * Math.sqrt(2))) * io
    }

    // 初级谐振电流（在谐振频率处，Zr=0，总阻抗≈Rac）
    // 初级电压基波分量幅值：半桥 2Vin/π，全桥 4Vin/π
    // vFund 是幅值，irRms 应使用有效值 = vFund / (√2 · rac)
    const vFund =
      topology === 'half-bridge'
        ? vinNom * 2 / Math.PI
        : vinNom * 4 / Math.PI
    const irRms = vFund / (Math.sqrt(2) * rac)

    // 励磁电流（在fr处，近似）
    const vLm = topology === 'half-bridge' ? vinNom / 2 : vinNom
    const imRms = vLm / (4 * Math.sqrt(3) * fr * lm)

    // 初级总电流
    const ipRms = Math.sqrt(irRms * irRms + imRms * imRms)

    // ─── 步骤8：设计增益曲线数据 ───
    // 生成当前设计参数的增益曲线数据
    const gainCurveData: Array<{ fn: number; m: number }> = []
    for (let fn = 0.2; fn <= 2.0; fn += 0.01) {
      gainCurveData.push({
        fn: parseFloat(fn.toFixed(2)),
        m: gainM(fn, k, q),
      })
    }

    // 变压器峰值磁密（用于结果展示与磁芯损耗校验）
    const aeM2 = lossParams.coreAe * 1e-6
    const bPeak =
      (vinNom / (topology === 'half-bridge' ? 2 : 1)) /
      (4 * fsw * lossParams.primaryTurns * aeM2)

    const data: CalculatedData = {
      n,
      fr,
      lr,
      cr,
      lm,
      q,
      k: k,
      mMax: peakGain(k, q),
      mRequired: gMax,
      mRequiredMin: gMin,
      zvsMargin,
      zvsTimeOk,
      tZvs,
      zvsPhase: zvsPhaseDeg,
      ipRms,
      irRms,
      imRms,
      bPeak,
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
      fmax,
      fmin,
      gmaxEmpty,
      zvsEr: er,
      zvsEc: ec,
      qmax1,
      qmax2,
      qmax3,
      gMin,
      gMax,
      gNom,
      designFeasible,
      gainCurveData,
    }

    const s = generateSuggestions(form, {
      q,
      k: k,
      mMax: peakGain(k, q),
      mRequired: gMax,
      mRequiredMin: gMin,
      zvsPhase: zvsPhaseDeg,
      lr,
      cr,
      lm,
      fsw,
      efficiency,
      qmax1,
      qmax2,
      qmax3,
      gmaxEmpty,
      zvsMargin,
      zvsTimeOk,
      tZvs,
      er,
      ec,
      fmax,
      fmin,
      kMax,
    })

    if (!designFeasible) {
      const kTooLarge = k > kMax
      s.unshift({
        text: kTooLarge
          ? `电感比k=${k.toFixed(2)}超过空载增益约束上限k_max=${kMax.toFixed(2)}，设计不可行。空载增益裕量不足，当前设计在最低输入电压下可能无法达到额定输出。建议减小k至≤${kMax.toFixed(2)}或提高最低输入电压。`
          : `高输入电压下所需最小增益 Gmin=${gMin.toFixed(3)} 低于 Region 1 空载极限 k/(k+1)=${region1MinGain.toFixed(3)}，当前 k 无法满足。请增大电感比 k 或缩窄输入电压上限。`,
        level: 'critical',
      })
    }

    setCalculated(data)
    setLocalSuggestions(s)
    setParams(form)
    setLastFormSnapshot({ ...form })
    setNeedsRecalculation(false)
    setResults({
      n,
      fr,
      lr,
      cr,
      lm,
      q,
      k: k,
      mMax: peakGain(k, q),
      mRequired: gMax,
      zvsMargin,
      ipRms,
      isRms,
      fmax,
      fmin,
      gmaxEmpty,
      zvsEr: er,
      zvsEc: ec,
      qmax1,
      qmax2,
      qmax3,
      gMin,
      gMax,
      gNom,
      rac,
      zr,
      irRms,
      imRms,
      bPeak,
      zvsTimeOk,
      tZvs,
      designFeasible,
      kMax,
      gainCurveData,
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
                  <option value="synchronous">同步整流（全桥）</option>
                  <option value="sync-center-tapped">同步整流（中心抽头）</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>电感比 k (Lm/Lr)</label>
                <input
                  type="number"
                  className={inputClass}
                  value={form.k}
                  onChange={(e) => update('k', Number(e.target.value))}
                  step="0.5"
                  min="2"
                  max="20"
                />
                <span className="text-xs text-text-muted mt-1 block">建议 3~10</span>
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

            {/* ─── MOSFET / 寄生参数 ─── */}
            <div className="mt-5 pt-4 border-t border-border">
              <h3 className="text-sm font-semibold text-text-secondary mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary-light" />
                MOSFET 与寄生参数
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>MOSFET Coss_eq (pF)</label>
                  <input
                    type="number"
                    className={inputClass}
                    value={form.cossEq}
                    onChange={(e) => update('cossEq', Number(e.target.value))}
                    placeholder="等效输出电容"
                  />
                  <span className="text-xs text-text-muted mt-1 block">等效Coss（谐振腔）</span>
                </div>
                <div>
                  <label className={labelClass}>MOSFET Coss_er (pF)</label>
                  <input
                    type="number"
                    className={inputClass}
                    value={form.cossEr}
                    onChange={(e) => update('cossEr', Number(e.target.value))}
                    placeholder="能量相关Coss"
                  />
                  <span className="text-xs text-text-muted mt-1 block">能量相关Coss（ZVS）</span>
                </div>
                <div>
                  <label className={labelClass}>PCB 寄生电容 Cj (pF)</label>
                  <input
                    type="number"
                    className={inputClass}
                    value={form.cj}
                    onChange={(e) => update('cj', Number(e.target.value))}
                    placeholder="PCB寄生"
                  />
                  <span className="text-xs text-text-muted mt-1 block">PCB走线/变压器寄生</span>
                </div>
                <div>
                  <label className={labelClass}>死区时间 Td (ns)</label>
                  <input
                    type="number"
                    className={inputClass}
                    value={form.td}
                    onChange={(e) => update('td', Number(e.target.value))}
                    placeholder="死区时间"
                  />
                  <span className="text-xs text-text-muted mt-1 block">驱动死区</span>
                </div>
                <div>
                  <label className={labelClass}>二极管压降 Vd (V)</label>
                  <input
                    type="number"
                    className={inputClass}
                    value={form.vd}
                    onChange={(e) => update('vd', Number(e.target.value))}
                    step="0.1"
                    placeholder="整流二极管"
                  />
                  <span className="text-xs text-text-muted mt-1 block">输出整流压降</span>
                </div>
                <div>
                  <label className={labelClass}>最大输出电流 Iomax (A)</label>
                  <input
                    type="number"
                    className={inputClass}
                    value={form.ioMax}
                    onChange={(e) => update('ioMax', Number(e.target.value))}
                    placeholder="最大电流"
                  />
                  <span className="text-xs text-text-muted mt-1 block">过载/满载电流</span>
                </div>
              </div>
            </div>

            {needsRecalculation && (
              <div className="mt-4 p-3 bg-accent/10 border border-accent/30 rounded-lg flex items-start gap-2">
                <RotateCcw className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-accent font-medium">参数已变更</p>
                  <p className="text-xs text-text-secondary">输入参数已修改，请重新计算以获取最新结果。</p>
                </div>
              </div>
            )}

            <button
              onClick={handleCalculate}
              className="mt-5 w-full bg-primary hover:bg-primary-light text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Calculator className="w-4 h-4" />
              {needsRecalculation ? '重新计算' : '计算'}
            </button>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-7 space-y-4">
          {calculated && (
            <>
              {/* Linkage banner */}
              <div className="card-surface p-4 border border-primary/30">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-sm text-primary-light font-medium">设计参数已同步</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm font-mono text-text-secondary">
                    <span>k = {calculated.k.toFixed(2)}</span>
                    <span>Q = {calculated.q.toFixed(3)}</span>
                    <span className="text-text-muted">|</span>
                    <span>fr = {(calculated.fr / 1000).toFixed(1)} kHz</span>
                  </div>
                  <div className="ml-auto">
                    <Link
                      to="/curves"
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-primary text-white hover:bg-primary-light transition-colors"
                    >
                      <LineChartIcon size={14} />
                      查看增益曲线
                    </Link>
                  </div>
                </div>
              </div>

              {!calculated.designFeasible && (
                <div className="card-surface p-4 border border-danger/30 bg-danger/10">
                  <div className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-danger font-medium">设计参数不可行</p>
                      <p className="text-xs text-text-secondary mt-1">
                        高输入电压下所需最小增益低于 Region 1 空载极限 k/(k+1)。请增大电感比 k 或降低输入电压上限。
                      </p>
                    </div>
                  </div>
                </div>
              )}

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
                  <div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                      <ResultItem label="匝比 n" value={calculated.n.toFixed(2)} unit="" formula="n = Vin_nom/(2·(Vout+Vd)) 或 Vin_nom/(Vout+Vd)" />
                      <ResultItem label="谐振频率 fr" value={(calculated.fr / 1000).toFixed(1)} unit="kHz" formula="fr = 1/(2π√(Lr·Cr))" />
                      <ResultItem label="谐振电感 Lr" value={(calculated.lr * 1e6).toFixed(2)} unit="μH" formula="Lr = Zr / (2π·fr)" />
                      <ResultItem label="谐振电容 Cr" value={(calculated.cr * 1e9).toFixed(2)} unit="nF" formula="Cr = 1/(2π·fr·Zr)" />
                      <ResultItem label="励磁电感 Lm" value={(calculated.lm * 1e6).toFixed(2)} unit="μH" formula="Lm = k·Lr" />
                      <ResultItem label="品质因数 Q" value={calculated.q.toFixed(3)} unit="" formula="Q = Zr / Racmin" />
                      <ResultItem label="电感比 k" value={calculated.k.toFixed(2)} unit="" formula="k = Lm / Lr" />
                      <ResultItem
                        label="所需增益 Gmin"
                        value={calculated.gMin.toFixed(3)}
                        unit=""
                        formula="Gmin = Vin_nom/Vin_max"
                        highlight="good"
                      />
                      <ResultItem
                        label="所需增益 Gmax"
                        value={calculated.gMax.toFixed(3)}
                        unit=""
                        formula="Gmax = Vin_nom/Vin_min"
                        highlight={calculated.mMax >= calculated.gMax * 1.05 ? 'good' : calculated.mMax >= calculated.gMax ? 'warn' : 'critical'}
                      />
                      <ResultItem
                        label="空载峰值增益"
                        value={calculated.gmaxEmpty.toFixed(3)}
                        unit=""
                        formula="Gempty = 1 + 1/k"
                        highlight={calculated.gmaxEmpty >= calculated.gMax * 1.05 ? 'good' : calculated.gmaxEmpty >= calculated.gMax ? 'warn' : 'critical'}
                      />
                      <ResultItem
                        label="峰值增益 Mmax"
                        value={calculated.mMax.toFixed(3)}
                        unit=""
                        formula="数值寻优峰值"
                        highlight={calculated.mMax >= calculated.gMax * 1.05 ? 'good' : calculated.mMax >= calculated.gMax ? 'warn' : 'critical'}
                      />
                      <ResultItem label="fmax（高输入）" value={Number.isFinite(calculated.fmax) ? (calculated.fmax / 1000).toFixed(1) : '—'} unit={Number.isFinite(calculated.fmax) ? 'kHz' : ''} formula="fmax = fr·√[Gmin/(Gmin·(k+1)-k)]" />
                      <ResultItem label="fmin（低输入）" value={(calculated.fmin / 1000).toFixed(1)} unit="kHz" formula="fmin = fr·√[Gmax/(Gmax·(k+1)-k)]" />
                      <ResultItem
                        label="ZVS能量裕量"
                        value={calculated.zvsMargin ? '可达' : '不足'}
                        unit=""
                        formula={`Er=${(calculated.zvsEr * 1e6).toFixed(3)}μJ / Ec=${(calculated.zvsEc * 1e6).toFixed(3)}μJ`}
                        highlight={calculated.zvsMargin ? 'good' : 'critical'}
                      />
                      <ResultItem
                        label="ZVS时间裕量"
                        value={calculated.zvsTimeOk ? '充裕' : '不足'}
                        unit=""
                        formula={`t_ZVS=${(calculated.tZvs * 1e9).toFixed(1)}ns / Td=${form.td}ns`}
                        highlight={calculated.zvsTimeOk ? 'good' : 'critical'}
                      />
                      <ResultItem label="谐振电流 Ir" value={calculated.irRms.toFixed(2)} unit="A" formula="Ir = V_in1 / Rac（谐振频率处近似）" />
                      <ResultItem label="励磁电流 Im" value={calculated.imRms.toFixed(2)} unit="A" formula="Im = Vin/(4·f·Lm)" />
                      <ResultItem label="初级电流 RMS" value={calculated.ipRms.toFixed(2)} unit="A" formula="Ip = √(Ir² + Im²)" />
                      <ResultItem label="次级电流 RMS" value={calculated.isRms.toFixed(2)} unit="A" formula={calculated.rectifier === 'center-tapped' || calculated.rectifier === 'sync-center-tapped' ? 'Is = (π/4)·Io' : 'Is = (π/2√2)·Io'} />
                      <ResultItem
                        label="峰值磁密 Bpeak"
                        value={(calculated.bPeak * 1000).toFixed(1)}
                        unit="mT"
                        formula="Bpeak = Vp/(4·f·Np·Ae)"
                        highlight={
                          calculated.bPeak * 1000 > 300
                            ? 'critical'
                            : calculated.bPeak * 1000 > 200
                              ? 'warn'
                              : 'good'
                        }
                      />
                      <ResultItem label="Qmax1 (增益)" value={calculated.qmax1.toFixed(3)} unit="" formula="峰值增益约束" />
                      <ResultItem label="Qmax2 (ZVS)" value={calculated.qmax2.toFixed(3)} unit="" formula="死区时间约束" />
                      <ResultItem label="Qmax3 (Coss)" value={calculated.qmax3.toFixed(3)} unit="" formula="寄生电容约束" />
                      <ResultItem label="等效AC电阻 Rac" value={calculated.rac.toFixed(2)} unit="Ω" formula="Rac = 8n²Vout²/(π²Po)" />
                    </div>

                    {/* 增益-频率曲线 */}
                    <div className="mt-6 pt-4 border-t border-border">
                      <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-primary-light" />
                        增益-频率特性曲线 (k={calculated.k.toFixed(1)}, Q={calculated.q.toFixed(3)})
                      </h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={calculated.gainCurveData} margin={{ top: 5, right: 20, left: 10, bottom: 25 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis
                              dataKey="fn"
                              type="number"
                              domain={[0, 2]}
                              ticks={[0, 0.5, 1, 1.5, 2]}
                              label={{ value: 'fn = f/fr', position: 'insideBottom', offset: -10, fill: '#94a3b8', fontSize: 12 }}
                              stroke="#64748b"
                              tick={{ fill: '#94a3b8', fontSize: 11 }}
                            />
                            <YAxis
                              domain={[0, 2]}
                              ticks={[0, 0.5, 1, 1.5, 2]}
                              label={{ value: 'M(fn)', angle: -90, position: 'insideLeft', offset: 5, fill: '#94a3b8', fontSize: 12 }}
                              stroke="#64748b"
                              tick={{ fill: '#94a3b8', fontSize: 11 }}
                            />
                            <Tooltip
                              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '6px', fontSize: '12px' }}
                              labelFormatter={(v: number) => `fn = ${v.toFixed(2)}`}
                              formatter={(v: number) => [`M = ${v.toFixed(3)}`, '增益']}
                            />
                            <Line type="monotone" dataKey="m" stroke="#38bdf8" strokeWidth={2} dot={false} />
                            {/* 参考线：Gmax, Gmin, fr */}
                            <ReferenceLine y={calculated.gMax} stroke="#ef4444" strokeDasharray="5 5" strokeWidth={1} label={{ value: `Gmax=${calculated.gMax.toFixed(3)}`, fill: '#ef4444', fontSize: 10, position: 'right' }} />
                            <ReferenceLine y={calculated.gMin} stroke="#22c55e" strokeDasharray="5 5" strokeWidth={1} label={{ value: `Gmin=${calculated.gMin.toFixed(3)}`, fill: '#22c55e', fontSize: 10, position: 'right' }} />
                            <ReferenceLine x={1} stroke="#94a3b8" strokeDasharray="3 3" strokeWidth={1} label={{ value: 'fr', fill: '#94a3b8', fontSize: 10, position: 'top' }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex flex-wrap gap-4 mt-2 text-xs text-text-secondary">
                        <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-[#38bdf8]" /> 增益曲线 M(fn)</span>
                        <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-[#ef4444] border-dashed" /> Gmax = {calculated.gMax.toFixed(3)}</span>
                        <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-[#22c55e] border-dashed" /> Gmin = {calculated.gMin.toFixed(3)}</span>
                        <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-[#94a3b8]" /> fr (fn=1)</span>
                      </div>
                    </div>
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
                            {calculated.rectifier === 'synchronous' || calculated.rectifier === 'sync-center-tapped'
                              ? '同步整流 MOSFET'
                              : calculated.rectifier === 'center-tapped'
                              ? '肖特基二极管（中心抽头）'
                              : '肖特基二极管（全桥）'}
                          </li>
                          <li>
                            耐压: ≥{' '}
                            <span className="text-text-primary font-mono">
                              {Math.ceil(calculated.vout * (calculated.rectifier === 'center-tapped' || calculated.rectifier === 'sync-center-tapped' ? 2.5 : 2))}
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

              {/* Loss Analysis Panel */}
              <LossAnalysisPanel calc={calculated} params={lossParams} setParams={setLossParams} toggle={() => toggleSection('loss')} collapsed={collapsedSections.loss} />

              {/* Save Design & Compare */}
              <div className={cardClass}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GitCompare className="w-5 h-5 text-primary-light" />
                    <h2 className="text-lg font-semibold text-text-primary">设计快照</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const name = prompt('保存设计名称:', `设计 ${new Date().toLocaleTimeString()}`)
                        if (name && calculated) {
                          saveDesignSnapshot(name, form, {
                            n: calculated.n,
                            fr: calculated.fr,
                            lr: calculated.lr,
                            cr: calculated.cr,
                            lm: calculated.lm,
                            q: calculated.q,
                            k: calculated.k,
                            mMax: calculated.mMax,
                            mRequired: calculated.gMax,
                            zvsMargin: calculated.zvsMargin,
                            ipRms: calculated.ipRms,
                            isRms: calculated.isRms,
                          })
                          alert(`已保存: ${name}`)
                        }
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary-light text-white text-sm rounded-lg transition-colors"
                    >
                      <Save className="w-3.5 h-3.5" />
                      保存当前设计
                    </button>
                  </div>
                </div>
              </div>

              {/* Compensation Design */}
              <div className={cardClass}>
                <button
                  onClick={() => toggleSection('compensation')}
                  className="w-full flex items-center justify-between mb-2"
                >
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary-light" />
                    <h2 className="text-lg font-semibold text-text-primary">环路补偿设计</h2>
                  </div>
                  {collapsedSections.compensation ? (
                    <ChevronDown className="w-4 h-4 text-text-muted" />
                  ) : (
                    <ChevronUp className="w-4 h-4 text-text-muted" />
                  )}
                </button>
                {!collapsedSections.compensation && <CompensationSection />}
              </div>

              {/* A/B Compare */}
              <div className={cardClass}>
                <button
                  onClick={() => toggleSection('compare')}
                  className="w-full flex items-center justify-between mb-2"
                >
                  <div className="flex items-center gap-2">
                    <GitCompare className="w-5 h-5 text-primary-light" />
                    <h2 className="text-lg font-semibold text-text-primary">A/B 设计对比</h2>
                  </div>
                  {collapsedSections.compare ? (
                    <ChevronDown className="w-4 h-4 text-text-muted" />
                  ) : (
                    <ChevronUp className="w-4 h-4 text-text-muted" />
                  )}
                </button>
                {!collapsedSections.compare && <DesignCompare />}
              </div>
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
  highlight?: 'good' | 'warn' | 'critical'
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
            highlight === 'good' ? 'text-success' : highlight === 'warn' ? 'text-warning' : highlight === 'critical' ? 'text-danger' : 'text-text-primary'
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

function LossAnalysisPanel({
  calc,
  params,
  setParams,
  toggle,
  collapsed,
}: {
  calc: CalculatedData
  params: LossParameters
  setParams: (p: LossParameters) => void
  toggle: () => void
  collapsed: boolean
}) {
  const losses = calculateLosses(calc, params)
  const update = <K extends keyof LossParameters>(key: K, value: LossParameters[K]) => {
    setParams({ ...params, [key]: value })
  }
  const inputClass = 'input-field w-full'
  const labelClass = 'block text-xs font-medium text-text-secondary mb-1'

  const effDiff = losses.efficiency - calc.efficiency

  return (
    <div className="card-surface p-5">
      <button onClick={toggle} className="w-full flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-danger" />
          <h2 className="text-lg font-semibold text-text-primary">损耗分析</h2>
        </div>
        {collapsed ? <ChevronDown className="w-4 h-4 text-text-muted" /> : <ChevronUp className="w-4 h-4 text-text-muted" />}
      </button>

      {!collapsed && (
        <div className="mt-3 space-y-5">
          {/* Input parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className={labelClass}>MOSFET Rds(on) (mΩ)</label>
              <input type="number" className={inputClass} value={params.mosfetRdsOn} onChange={(e) => update('mosfetRdsOn', Number(e.target.value))} />
            </div>
            <div>
              <label className={labelClass}>tr (ns)</label>
              <input type="number" className={inputClass} value={params.mosfetTr} onChange={(e) => update('mosfetTr', Number(e.target.value))} />
            </div>
            <div>
              <label className={labelClass}>tf (ns)</label>
              <input type="number" className={inputClass} value={params.mosfetTf} onChange={(e) => update('mosfetTf', Number(e.target.value))} />
            </div>
            <div>
              <label className={labelClass}>Coss (pF, 0V 标称/能量等效)</label>
              <input type="number" className={inputClass} value={params.mosfetCoss} onChange={(e) => update('mosfetCoss', Number(e.target.value))} />
            </div>
            <div>
              <label className={labelClass}>Vsd (V)</label>
              <input type="number" className={inputClass} value={params.mosfetVsd} onChange={(e) => update('mosfetVsd', Number(e.target.value))} />
            </div>
            <div>
              <label className={labelClass}>死区时间 (ns)</label>
              <input type="number" className={inputClass} value={params.deadTime} onChange={(e) => update('deadTime', Number(e.target.value))} />
            </div>
            <div>
              <label className={labelClass}>初级匝数 Np</label>
              <input type="number" className={inputClass} value={params.primaryTurns} onChange={(e) => update('primaryTurns', Number(e.target.value))} />
            </div>
            <div>
              <label className={labelClass}>磁芯材料</label>
              <select className={inputClass} value={params.coreMaterial} onChange={(e) => update('coreMaterial', e.target.value)}>
                <option value="PC40">PC40</option>
                <option value="PC95">PC95</option>
                <option value="PC200">PC200</option>
                <option value="3C95">3C95</option>
                <option value="3C97">3C97</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Ve (cm³)</label>
              <input type="number" className={inputClass} value={params.coreVe} onChange={(e) => update('coreVe', Number(e.target.value))} />
            </div>
            <div>
              <label className={labelClass}>Ae (mm²)</label>
              <input type="number" className={inputClass} value={params.coreAe} onChange={(e) => update('coreAe', Number(e.target.value))} />
            </div>
            <div>
              <label className={labelClass}>Steinmetz C_m (mW·cm⁻³·kHz⁻ᵃ·mT⁻ᵝ)</label>
              <input type="number" step="any" className={inputClass} value={params.coreK} onChange={(e) => update('coreK', Number(e.target.value))} />
            </div>
            <div>
              <label className={labelClass}>α</label>
              <input type="number" step="0.1" className={inputClass} value={params.coreAlpha} onChange={(e) => update('coreAlpha', Number(e.target.value))} />
            </div>
            <div>
              <label className={labelClass}>β</label>
              <input type="number" step="0.1" className={inputClass} value={params.coreBeta} onChange={(e) => update('coreBeta', Number(e.target.value))} />
            </div>
            <div>
              <label className={labelClass}>绕组 Rdc (mΩ)</label>
              <input type="number" className={inputClass} value={params.windingRdc} onChange={(e) => update('windingRdc', Number(e.target.value))} />
            </div>
            <div>
              <label className={labelClass}>趋肤拐点 f0 (kHz)</label>
              <input type="number" className={inputClass} value={params.skinF0} onChange={(e) => update('skinF0', Number(e.target.value))} />
            </div>
            <div>
              <label className={labelClass}>{calc.rectifier === 'synchronous' || calc.rectifier === 'sync-center-tapped' ? '同步整流 Rds(on) (mΩ)' : '整流 Vf (V)'}</label>
              <input type="number" step="0.1" className={inputClass} value={calc.rectifier === 'synchronous' || calc.rectifier === 'sync-center-tapped' ? params.syncRectRdsOn : params.rectVf} onChange={(e) => update(calc.rectifier === 'synchronous' || calc.rectifier === 'sync-center-tapped' ? 'syncRectRdsOn' : 'rectVf', Number(e.target.value))} />
            </div>
            <div>
              <label className={labelClass}>Lr DCR (mΩ)</label>
              <input type="number" className={inputClass} value={params.lrDcr} onChange={(e) => update('lrDcr', Number(e.target.value))} />
            </div>
            <div>
              <label className={labelClass}>Cr ESR (mΩ)</label>
              <input type="number" className={inputClass} value={params.crEsr} onChange={(e) => update('crEsr', Number(e.target.value))} />
            </div>
          </div>

          {/* Efficiency summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-surface-elevated rounded-lg p-4 border border-border">
              <div className="text-xs text-text-secondary mb-1">总损耗</div>
              <div className="text-2xl font-mono font-semibold text-danger">{losses.totalLoss.toFixed(2)} W</div>
            </div>
            <div className="bg-surface-elevated rounded-lg p-4 border border-border">
              <div className="text-xs text-text-secondary mb-1">实际效率</div>
              <div className="text-2xl font-mono font-semibold text-primary-light">{losses.efficiency.toFixed(2)}%</div>
            </div>
            <div className="bg-surface-elevated rounded-lg p-4 border border-border">
              <div className="text-xs text-text-secondary mb-1">与目标效率差</div>
              <div className={`text-2xl font-mono font-semibold ${effDiff >= 0 ? 'text-success' : 'text-accent'}`}>
                {effDiff >= 0 ? '+' : ''}{effDiff.toFixed(2)}%
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-surface-elevated rounded-lg p-4 border border-border">
              <h4 className="text-sm font-semibold text-text-primary mb-3">损耗分布</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={losses.breakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value" nameKey="name">
                      {losses.breakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#171717', border: '1px solid #404040', borderRadius: 6, color: '#f5f5f5' }}
                      formatter={(value: number) => [`${value.toFixed(2)} W`, '损耗']}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-surface-elevated rounded-lg p-4 border border-border">
              <h4 className="text-sm font-semibold text-text-primary mb-3">损耗分项对比</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={losses.breakdown} layout="vertical" margin={{ left: 20, right: 20, top: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                    <XAxis type="number" stroke="#a3a3a3" fontSize={12} tickFormatter={(v) => `${v.toFixed(1)}W`} />
                    <YAxis type="category" dataKey="name" stroke="#a3a3a3" fontSize={11} width={70} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#171717', border: '1px solid #404040', borderRadius: 6, color: '#f5f5f5' }}
                      formatter={(value: number) => [`${value.toFixed(2)} W`, '损耗']}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {losses.breakdown.map((entry, index) => (
                        <Cell key={`bar-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Detailed loss table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-border text-text-secondary">
                  <th className="py-2 pr-4">损耗项</th>
                  <th className="py-2 pr-4">功率 (W)</th>
                  <th className="py-2 pr-4">占比</th>
                  <th className="py-2">公式说明</th>
                </tr>
              </thead>
              <tbody className="text-text-primary">
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4 font-medium">MOSFET 导通损耗</td>
                  <td className="py-2 pr-4 font-mono">{losses.mosfetCond.toFixed(3)}</td>
                  <td className="py-2 pr-4">{((losses.mosfetCond / losses.totalLoss) * 100).toFixed(1)}%</td>
                  <td className="py-2 text-text-secondary">Pcond = Ip²·Rds(on)（每管半周）</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4 font-medium">MOSFET 开通损耗</td>
                  <td className="py-2 pr-4 font-mono">{losses.mosfetSwitchOn.toFixed(3)}</td>
                  <td className="py-2 pr-4">{((losses.mosfetSwitchOn / losses.totalLoss) * 100).toFixed(1)}%</td>
                  <td className="py-2 text-text-secondary">Pon = 0.5·Vin·Ip·tr·fsw（ZVS下≈0）</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4 font-medium">MOSFET 关断损耗</td>
                  <td className="py-2 pr-4 font-mono">{losses.mosfetSwitchOff.toFixed(3)}</td>
                  <td className="py-2 pr-4">{((losses.mosfetSwitchOff / losses.totalLoss) * 100).toFixed(1)}%</td>
                  <td className="py-2 text-text-secondary">Poff = 0.5·Vin·Ip·tf·fsw</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4 font-medium">Coss 损耗</td>
                  <td className="py-2 pr-4 font-mono">{losses.mosfetCoss.toFixed(3)}</td>
                  <td className="py-2 pr-4">{((losses.mosfetCoss / losses.totalLoss) * 100).toFixed(1)}%</td>
                  <td className="py-2 text-text-secondary">Ecoss ≈ 0.5·Coss·Vin²·(2/3)，ZVS 下≈0</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4 font-medium">体二极管导通</td>
                  <td className="py-2 pr-4 font-mono">{losses.mosfetDiode.toFixed(3)}</td>
                  <td className="py-2 pr-4">{((losses.mosfetDiode / losses.totalLoss) * 100).toFixed(1)}%</td>
                  <td className="py-2 text-text-secondary">Pdiode = Vsd·Id·td·fsw</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4 font-medium">磁芯损耗</td>
                  <td className="py-2 pr-4 font-mono">{losses.coreLoss.toFixed(3)}</td>
                  <td className="py-2 pr-4">{((losses.coreLoss / losses.totalLoss) * 100).toFixed(1)}%</td>
                  <td className="py-2 text-text-secondary">Pcore = k·f^α·B^β·Ve</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4 font-medium">绕组损耗</td>
                  <td className="py-2 pr-4 font-mono">{losses.windingLoss.toFixed(3)}</td>
                  <td className="py-2 pr-4">{((losses.windingLoss / losses.totalLoss) * 100).toFixed(1)}%</td>
                  <td className="py-2 text-text-secondary">Pw = Ip²·Rdc·(1+(f/f0)²)</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4 font-medium">整流损耗</td>
                  <td className="py-2 pr-4 font-mono">{losses.rectLoss.toFixed(3)}</td>
                  <td className="py-2 pr-4">{((losses.rectLoss / losses.totalLoss) * 100).toFixed(1)}%</td>
                  <td className="py-2 text-text-secondary">{calc.rectifier === 'synchronous' || calc.rectifier === 'sync-center-tapped' ? 'P = Is²·Rds(on)' : 'P = Vf·Io'}</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4 font-medium">谐振元件损耗</td>
                  <td className="py-2 pr-4 font-mono">{losses.resonantLoss.toFixed(3)}</td>
                  <td className="py-2 pr-4">{((losses.resonantLoss / losses.totalLoss) * 100).toFixed(1)}%</td>
                  <td className="py-2 text-text-secondary">P = Ip²·(DCR+ESR)</td>
                </tr>
                <tr className="bg-surface-elevated">
                  <td className="py-2 pr-4 font-bold text-primary-light">总损耗</td>
                  <td className="py-2 pr-4 font-mono font-bold text-primary-light">{losses.totalLoss.toFixed(3)}</td>
                  <td className="py-2 pr-4 font-bold">100%</td>
                  <td className="py-2 text-text-secondary">η = Po / (Po + Ploss)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
