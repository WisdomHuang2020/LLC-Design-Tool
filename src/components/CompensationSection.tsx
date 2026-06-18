import { useState, useMemo } from 'react'
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
import { Activity, Sliders, Info, CheckCircle, AlertTriangle } from 'lucide-react'

interface CompensationData {
  freq: number
  plantGain: number
  plantPhase: number
  compGain: number
  compPhase: number
  openLoopGain: number
  openLoopPhase: number
}

interface CompensationResult {
  type: 'type2' | 'type3'
  fc: number
  pm: number
  K: number
  fz1: number
  fz2: number
  fp1: number
  fp2: number
  R1: number
  R2: number
  R3: number
  C1: number
  C2: number
  C3: number
  plantGainAtFc: number
  plantPhaseAtFc: number
  actualPM: number
  crossoverFreq: number
}

// E-Series helpers
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

function formatValue(v: number): string {
  if (v >= 1e6) return `${(v / 1e6).toFixed(2)} M`
  if (v >= 1e3) return `${(v / 1e3).toFixed(2)} k`
  if (v >= 1) return `${v.toFixed(2)} `
  if (v >= 1e-3) return `${(v * 1e3).toFixed(2)} m`
  if (v >= 1e-6) return `${(v * 1e6).toFixed(2)} μ`
  if (v >= 1e-9) return `${(v * 1e9).toFixed(2)} n`
  return `${v.toExponential(2)}`
}

function formatUnit(v: number, unit: string): string {
  return `${formatValue(v)}${unit}`
}

function toDegrees(rad: number): number {
  return (rad * 180) / Math.PI
}

function plantGainPhase(
  f: number,
  Kp: number,
  wpOut: number,
  wpZero: number,
  plantModel: string
): { gain: number; phase: number } {
  const w = 2 * Math.PI * f
  let gain = Kp
  let phase = 0

  if (plantModel === 'integrator') {
    // Gp(s) = Kp / s
    gain = gain / w
    phase = -90
  } else if (plantModel === 'pole') {
    // Gp(s) = Kp / [s * (1 + s/wpOut)]
    gain = gain / (w * Math.sqrt(1 + (w / wpOut) ** 2))
    phase = -90 - toDegrees(Math.atan(w / wpOut))
  } else if (plantModel === 'pole-zero') {
    // Gp(s) = Kp * (1 + s/wpZero) / [s * (1 + s/wpOut)]
    const num = Math.sqrt(1 + (w / wpZero) ** 2)
    const den = w * Math.sqrt(1 + (w / wpOut) ** 2)
    gain = (gain * num) / den
    phase = -90 + toDegrees(Math.atan(w / wpZero)) - toDegrees(Math.atan(w / wpOut))
  }

  return { gain: 20 * Math.log10(Math.max(gain, 1e-12)), phase }
}

function compGainPhase(
  f: number,
  type: 'type2' | 'type3',
  K: number,
  fz1: number,
  fp1: number,
  fz2: number,
  fp2: number
): { gain: number; phase: number } {
  const w = 2 * Math.PI * f

  // Gc(s) = K * (1+s/wz1) / [s * (1+s/wp1)] for Type II
  // Gc(s) = K * (1+s/wz1)(1+s/wz2) / [s * (1+s/wp1)(1+s/wp2)] for Type III

  const s = { re: 0, im: w }

  // Numerator: K * prod(1 + s/wzi)
  let numMag = K
  let numPhase = 0

  const wz1 = 2 * Math.PI * fz1
  const wz1p = 1 + (w / wz1) ** 2
  numMag *= Math.sqrt(wz1p)
  numPhase += toDegrees(Math.atan(w / wz1))

  if (type === 'type3') {
    const wz2 = 2 * Math.PI * fz2
    const wz2p = 1 + (w / wz2) ** 2
    numMag *= Math.sqrt(wz2p)
    numPhase += toDegrees(Math.atan(w / wz2))
  }

  // Denominator: s * prod(1 + s/wpi)
  let denMag = w
  let denPhase = 90

  const wp1 = 2 * Math.PI * fp1
  const wp1p = 1 + (w / wp1) ** 2
  denMag *= Math.sqrt(wp1p)
  denPhase += toDegrees(Math.atan(w / wp1))

  if (type === 'type3') {
    const wp2 = 2 * Math.PI * fp2
    const wp2p = 1 + (w / wp2) ** 2
    denMag *= Math.sqrt(wp2p)
    denPhase += toDegrees(Math.atan(w / wp2))
  }

  const gain = 20 * Math.log10(Math.max(numMag / denMag, 1e-12))
  const phase = numPhase - denPhase

  return { gain, phase }
}

export default function CompensationSection() {
  const [compType, setCompType] = useState<'type2' | 'type3'>('type2')
  const [fc, setFc] = useState(10000) // Hz
  const [pmTarget, setPmTarget] = useState(60) // degrees
  const [Kp, setKp] = useState(1e6) // power stage DC gain
  const [fr, setFr] = useState(100000) // Hz
  const [Rload, setRload] = useState(1.0) // ohms (full load)
  const [Cout, setCout] = useState(1000) // uF
  const [ESR, setESR] = useState(10) // mOhm
  const [plantModel, setPlantModel] = useState<'integrator' | 'pole' | 'pole-zero'>('pole')
  const [R1, setR1] = useState(10000) // ohms
  const [showChart, setShowChart] = useState(true)
  const [result, setResult] = useState<CompensationResult | null>(null)

  const wpOut = useMemo(() => 1 / (Rload * Cout * 1e-6), [Rload, Cout])
  const wpZero = useMemo(() => 1 / (ESR * 1e-3 * Cout * 1e-6), [ESR, Cout])

  const handleDesign = () => {
    const wFc = 2 * Math.PI * fc
    const { gain: plantGainDb, phase: plantPhase } = plantGainPhase(fc, Kp, wpOut, wpZero, plantModel)
    const plantGainLinear = Math.pow(10, plantGainDb / 20)

    // Required compensator gain at fc
    const compGainNeeded = 1 / plantGainLinear

    let Kfactor: number
    let fz1: number, fp1: number, fz2: number, fp2: number

    if (compType === 'type2') {
      // Type II: max phase boost from zero is 90°, but effective boost is less
      // Required compensator phase at fc: PMtarget - 180° - plantPhase
      const requiredCompPhase = pmTarget - 180 - plantPhase
      // Type II phase at fc: arctan(fc/fz) - 90° - arctan(fc/fp)
      // Using K-factor: fz = fc/K, fp = K*fc
      // phase = arctan(K) - 90° - arctan(1/K) = 2*arctan(K) - 180°
      // So 2*arctan(K) - 180° = requiredCompPhase
      // K = tan((requiredCompPhase + 180°)/2)
      let targetBoost = requiredCompPhase + 180
      // Clamp to practical range (10° to 160° effective boost, i.e., K ~ 0.18 to 11.4)
      if (targetBoost < 10) targetBoost = 10
      if (targetBoost > 160) targetBoost = 160
      Kfactor = Math.tan((targetBoost * Math.PI) / 360)
      if (Kfactor < 0.2) Kfactor = 0.2
      if (Kfactor > 10) Kfactor = 10

      fz1 = fc / Kfactor
      fp1 = fc * Kfactor
      fz2 = 0
      fp2 = 0
    } else {
      // Type III: phase range -90° to +90° (boost 0° to 180°)
      // Using two coincident zeros and two coincident poles for K-factor
      const requiredCompPhase = pmTarget - 180 - plantPhase
      let targetBoost = requiredCompPhase + 180
      if (targetBoost < 10) targetBoost = 10
      if (targetBoost > 170) targetBoost = 170
      // Type III with symmetric zeros/poles: phase = 4*arctan(K) - 270°
      // boost = 4*arctan(K) - 180°
      // 4*arctan(K) - 180° = targetBoost
      // arctan(K) = (targetBoost + 180°)/4
      Kfactor = Math.tan(((targetBoost + 180) * Math.PI) / 720)
      if (Kfactor < 0.2) Kfactor = 0.2
      if (Kfactor > 20) Kfactor = 20

      fz1 = fc / Kfactor
      fz2 = fc / Kfactor
      fp1 = fc * Kfactor
      fp2 = fc * Kfactor
    }

    // Component calculation
    // For Type II: Gc(fc) = R2/R1 (approx)
    // For Type III: Gc(fc) = R2*K/R1 (approx)
    let R2calc: number
    if (compType === 'type2') {
      R2calc = R1 * compGainNeeded
    } else {
      R2calc = R1 * compGainNeeded / Kfactor
    }
    // Clamp R2 to practical range
    if (R2calc < 1000) R2calc = 1000
    if (R2calc > 10e6) R2calc = 10e6

    const C1calc = 1 / (R2calc * 2 * Math.PI * fz1)
    let C2calc: number
    if (compType === 'type2') {
      C2calc = 1 / (R2calc * 2 * Math.PI * fp1)
    } else {
      // For Type III, approximate C2 from fp1 pole
      C2calc = 1 / (R2calc * 2 * Math.PI * fp1)
    }

    let R3calc = 0
    let C3calc = 0
    if (compType === 'type3') {
      // Using standard Type III topology: R3 often chosen as R1/10 or R2/10
      R3calc = R1 / 10
      if (R3calc < 100) R3calc = 100
      // C3 from fp2 pole: fp2 = 1/(R3*C3) => C3 = 1/(R3*2π*fp2)
      // But there are multiple standard Type III topologies; use ideal for chart
      C3calc = 1 / (R3calc * 2 * Math.PI * fp2)
    }

    // Compute actual open-loop PM at designed fc
    const { phase: compPhaseFc } = compGainPhase(fc, compType, Kfactor, fz1, fp1, fz2, fp2)
    const actualPM = 180 + plantPhase + compPhaseFc

    // Find actual crossover frequency (where |openLoop| = 0 dB)
    // Scan around fc
    let actualFc = fc
    let minDiff = Infinity
    for (let f = fc * 0.1; f <= fc * 10; f *= 1.01) {
      const { gain: pg } = plantGainPhase(f, Kp, wpOut, wpZero, plantModel)
      const { gain: cg } = compGainPhase(f, compType, Kfactor, fz1, fp1, fz2, fp2)
      const olg = pg + cg
      const diff = Math.abs(olg)
      if (diff < minDiff) {
        minDiff = diff
        actualFc = f
      }
    }

    const res: CompensationResult = {
      type: compType,
      fc,
      pm: pmTarget,
      K: Kfactor,
      fz1,
      fz2,
      fp1,
      fp2,
      R1,
      R2: R2calc,
      R3: R3calc,
      C1: C1calc,
      C2: C2calc,
      C3: C3calc,
      plantGainAtFc: plantGainDb,
      plantPhaseAtFc: plantPhase,
      actualPM,
      crossoverFreq: actualFc,
    }

    setResult(res)
  }

  const chartData = useMemo(() => {
    if (!result) return []
    const data: CompensationData[] = []
    for (let f = 10; f <= 1e6; f *= 1.15) {
      const { gain: plantGain, phase: plantPhase } = plantGainPhase(f, Kp, wpOut, wpZero, plantModel)
      const { gain: compGain, phase: compPhase } = compGainPhase(
        f,
        result.type,
        result.K,
        result.fz1,
        result.fp1,
        result.fz2,
        result.fp2
      )
      data.push({
        freq: f,
        plantGain,
        plantPhase,
        compGain,
        compPhase,
        openLoopGain: plantGain + compGain,
        openLoopPhase: plantPhase + compPhase,
      })
    }
    return data
  }, [result, Kp, wpOut, wpZero, plantModel])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-surface border border-border rounded-lg p-3 shadow-xl">
        <p className="text-text-secondary text-sm font-mono mb-1">
          f = {Number(label).toFixed(0)} Hz
        </p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm font-mono" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}
          </p>
        ))}
      </div>
    )
  }

  const inputClass = 'input-field w-full'
  const labelClass = 'block text-sm font-medium text-text-secondary mb-1'
  const cardClass = 'card-surface p-5'

  return (
    <div className={cardClass}>
      <div className="flex items-center gap-2 mb-4">
        <Sliders className="w-5 h-5 text-primary-light" />
        <h2 className="text-lg font-semibold text-text-primary">环路补偿设计</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Inputs */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelClass}>补偿器类型</label>
              <select
                className={inputClass}
                value={compType}
                onChange={(e) => setCompType(e.target.value as 'type2' | 'type3')}
              >
                <option value="type2">Type II (单零点+单极点)</option>
                <option value="type3">Type III (双零点+双极点)</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>穿越频率 fc (Hz)</label>
              <input
                type="number"
                className={inputClass}
                value={fc}
                onChange={(e) => setFc(Number(e.target.value))}
              />
              <span className="text-xs text-text-muted mt-1 block">建议 fsw/10 ~ fsw/20</span>
            </div>
            <div>
              <label className={labelClass}>目标相位裕度 (°)</label>
              <input
                type="number"
                className={inputClass}
                value={pmTarget}
                onChange={(e) => setPmTarget(Number(e.target.value))}
              />
            </div>
            <div>
              <label className={labelClass}>功率级直流增益 Kp</label>
              <input
                type="number"
                className={inputClass}
                value={Kp}
                onChange={(e) => setKp(Number(e.target.value))}
              />
              <span className="text-xs text-text-muted mt-1 block">通常 1e5 ~ 1e7</span>
            </div>
            <div>
              <label className={labelClass}>谐振频率 fr (Hz)</label>
              <input
                type="number"
                className={inputClass}
                value={fr}
                onChange={(e) => setFr(Number(e.target.value))}
              />
            </div>
            <div>
              <label className={labelClass}>负载电阻 Rload (Ω)</label>
              <input
                type="number"
                className={inputClass}
                value={Rload}
                onChange={(e) => setRload(Number(e.target.value))}
              />
            </div>
            <div>
              <label className={labelClass}>输出电容 Cout (μF)</label>
              <input
                type="number"
                className={inputClass}
                value={Cout}
                onChange={(e) => setCout(Number(e.target.value))}
              />
            </div>
            <div>
              <label className={labelClass}>ESR (mΩ)</label>
              <input
                type="number"
                className={inputClass}
                value={ESR}
                onChange={(e) => setESR(Number(e.target.value))}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>功率级模型</label>
              <select
                className={inputClass}
                value={plantModel}
                onChange={(e) => setPlantModel(e.target.value as any)}
              >
                <option value="integrator">简化积分器 Gp = Kp/s</option>
                <option value="pole">积分器+输出极点 Gp = Kp/[s(1+s/wp)]</option>
                <option value="pole-zero">积分器+极点+ESR零点</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>R1 (Ω) 上分压电阻</label>
              <input
                type="number"
                className={inputClass}
                value={R1}
                onChange={(e) => setR1(Number(e.target.value))}
              />
              <span className="text-xs text-text-muted mt-1 block">典型 10kΩ</span>
            </div>
          </div>

          <button
            onClick={handleDesign}
            className="w-full bg-primary hover:bg-primary-light text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Activity className="w-4 h-4" />
            设计补偿器
          </button>
        </div>

        {/* Right: Results */}
        <div className="space-y-4">
          {result && (
            <>
              <div className="bg-surface-elevated rounded-lg p-4 border border-border">
                <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                  <Info className="w-4 h-4 text-primary-light" />
                  补偿器传递函数
                </h3>
                <div className="font-mono text-xs text-text-secondary bg-surface p-3 rounded border border-border/50 overflow-x-auto">
                  {result.type === 'type2' ? (
                    <p>
                      Gc(s) = K · (1 + s/ωz₁) / [s · (1 + s/ωp₁)]
                      <br />
                      K = {result.K.toFixed(3)}
                      <br />
                      fz₁ = {(result.fz1 / 1000).toFixed(1)} kHz
                      <br />
                      fp₁ = {(result.fp1 / 1000).toFixed(1)} kHz
                    </p>
                  ) : (
                    <p>
                      Gc(s) = K · (1+s/ωz₁)(1+s/ωz₂) / [s · (1+s/ωp₁)(1+s/ωp₂)]
                      <br />
                      K = {result.K.toFixed(3)}
                      <br />
                      fz₁ = {(result.fz1 / 1000).toFixed(1)} kHz, fz₂ = {(result.fz2 / 1000).toFixed(1)} kHz
                      <br />
                      fp₁ = {(result.fp1 / 1000).toFixed(1)} kHz, fp₂ = {(result.fp2 / 1000).toFixed(1)} kHz
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-surface-elevated rounded-lg p-4 border border-border">
                <h3 className="text-sm font-semibold text-text-primary mb-3">元件计算值</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <CompValue label="R1" value={formatUnit(result.R1, 'Ω')} e24={formatUnit(nearestE(result.R1, E24), 'Ω')} />
                  <CompValue label="R2" value={formatUnit(result.R2, 'Ω')} e24={formatUnit(nearestE(result.R2, E24), 'Ω')} />
                  {result.type === 'type3' && (
                    <CompValue label="R3" value={formatUnit(result.R3, 'Ω')} e24={formatUnit(nearestE(result.R3, E24), 'Ω')} />
                  )}
                  <CompValue label="C1" value={formatUnit(result.C1, 'F')} e24={formatUnit(nearestE(result.C1, E24), 'F')} />
                  <CompValue label="C2" value={formatUnit(result.C2, 'F')} e24={formatUnit(nearestE(result.C2, E24), 'F')} />
                  {result.type === 'type3' && (
                    <CompValue label="C3" value={formatUnit(result.C3, 'F')} e24={formatUnit(nearestE(result.C3, E24), 'F')} />
                  )}
                </div>
              </div>

              <div className="bg-surface-elevated rounded-lg p-4 border border-border">
                <h3 className="text-sm font-semibold text-text-primary mb-3">验证结果</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-2 rounded bg-surface border border-border/50">
                    <span className="text-xs text-text-secondary">功率级在fc处增益</span>
                    <p className="text-lg font-mono text-text-primary">{result.plantGainAtFc.toFixed(1)} dB</p>
                  </div>
                  <div className="p-2 rounded bg-surface border border-border/50">
                    <span className="text-xs text-text-secondary">功率级在fc处相位</span>
                    <p className="text-lg font-mono text-text-primary">{result.plantPhaseAtFc.toFixed(1)}°</p>
                  </div>
                  <div className="p-2 rounded bg-surface border border-border/50">
                    <span className="text-xs text-text-secondary">实际穿越频率</span>
                    <p className="text-lg font-mono text-text-primary">
                      {(result.crossoverFreq / 1000).toFixed(1)} kHz
                    </p>
                  </div>
                  <div
                    className={`p-2 rounded border flex items-center gap-2 ${
                      result.actualPM >= 45
                        ? 'bg-green-500/10 border-green-500/30'
                        : result.actualPM >= 30
                        ? 'bg-amber-500/10 border-amber-500/30'
                        : 'bg-red-500/10 border-red-500/30'
                    }`}
                  >
                    {result.actualPM >= 45 ? (
                      <CheckCircle className="w-5 h-5 text-success shrink-0" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-accent shrink-0" />
                    )}
                    <div>
                      <span className="text-xs text-text-secondary">实际相位裕度</span>
                      <p
                        className={`text-lg font-mono ${
                          result.actualPM >= 45 ? 'text-success' : result.actualPM >= 30 ? 'text-amber-400' : 'text-red-400'
                        }`}
                      >
                        {result.actualPM.toFixed(1)}°
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowChart(!showChart)}
                className="w-full bg-surface-elevated hover:bg-surface text-text-primary font-medium py-2 px-4 rounded-lg border border-border transition-colors"
              >
                {showChart ? '隐藏波特图' : '显示波特图'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Bode Plot */}
      {result && showChart && chartData.length > 0 && (
        <div className="mt-6 space-y-6">
          <div className="card-surface p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-3">幅频特性 (dB)</h3>
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 20, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                  <XAxis
                    dataKey="freq"
                    type="number"
                    scale="log"
                    domain={[10, 1e6]}
                    tick={{ fill: '#a3a3a3', fontFamily: 'JetBrains Mono', fontSize: 12 }}
                    stroke="#a3a3a3"
                    label={{ value: '频率 (Hz)', position: 'insideBottom', offset: -10, fill: '#a3a3a3', fontSize: 13 }}
                  />
                  <YAxis
                    domain={[-80, 80]}
                    tick={{ fill: '#a3a3a3', fontFamily: 'JetBrains Mono', fontSize: 12 }}
                    stroke="#a3a3a3"
                    label={{ value: '增益 (dB)', angle: -90, position: 'insideLeft', fill: '#a3a3a3', fontSize: 13 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ color: '#f5f5f5', fontFamily: 'JetBrains Mono', fontSize: 13 }} />
                  <ReferenceLine y={0} stroke="#737373" strokeDasharray="3 3" />
                  <ReferenceLine x={fc} stroke="#f59e0b" strokeDasharray="5 5" label={{ value: 'fc', fill: '#f59e0b', position: 'insideTopLeft', fontSize: 12 }} />
                  <Line type="monotone" dataKey="plantGain" stroke="#14b8a6" strokeWidth={2} dot={false} name="功率级" />
                  <Line type="monotone" dataKey="compGain" stroke="#f59e0b" strokeWidth={2} dot={false} name="补偿器" />
                  <Line type="monotone" dataKey="openLoopGain" stroke="#a3a3a3" strokeWidth={2} strokeDasharray="6 3" dot={false} name="开环" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card-surface p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-3">相频特性 (°)</h3>
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 20, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                  <XAxis
                    dataKey="freq"
                    type="number"
                    scale="log"
                    domain={[10, 1e6]}
                    tick={{ fill: '#a3a3a3', fontFamily: 'JetBrains Mono', fontSize: 12 }}
                    stroke="#a3a3a3"
                    label={{ value: '频率 (Hz)', position: 'insideBottom', offset: -10, fill: '#a3a3a3', fontSize: 13 }}
                  />
                  <YAxis
                    domain={[-270, 90]}
                    tick={{ fill: '#a3a3a3', fontFamily: 'JetBrains Mono', fontSize: 12 }}
                    stroke="#a3a3a3"
                    label={{ value: '相位 (°)', angle: -90, position: 'insideLeft', fill: '#a3a3a3', fontSize: 13 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ color: '#f5f5f5', fontFamily: 'JetBrains Mono', fontSize: 13 }} />
                  <ReferenceLine y={-180} stroke="#737373" strokeDasharray="3 3" />
                  <ReferenceLine x={fc} stroke="#f59e0b" strokeDasharray="5 5" label={{ value: 'fc', fill: '#f59e0b', position: 'insideTopLeft', fontSize: 12 }} />
                  <Line type="monotone" dataKey="plantPhase" stroke="#14b8a6" strokeWidth={2} dot={false} name="功率级" />
                  <Line type="monotone" dataKey="compPhase" stroke="#f59e0b" strokeWidth={2} dot={false} name="补偿器" />
                  <Line type="monotone" dataKey="openLoopPhase" stroke="#a3a3a3" strokeWidth={2} strokeDasharray="6 3" dot={false} name="开环" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CompValue({ label, value, e24 }: { label: string; value: string; e24: string }) {
  return (
    <div className="p-2 rounded bg-surface border border-border/50">
      <span className="text-xs text-text-secondary">{label}</span>
      <p className="text-sm font-mono text-text-primary">{value}</p>
      <p className="text-xs font-mono text-text-muted">E24: {e24}</p>
    </div>
  )
}
