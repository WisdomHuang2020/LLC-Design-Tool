// LLC 设计工具 —— 元器件容差穷举（穷举法考察实际元件偏差的影响）
//
// 目的：引擎给出的是「按标称 Lr/Cr/Lm 算出的设计」。真实变压器感量、谐振电感、谐振电容都有容差，
//       三者的**组合**会把实际工作点推到标称值之外。这里用**穷举法**（每参数取 −容差 / 标称 / +容差，
//       共 3³ = 27 组）逐组重算，检查设计是否仍然成立：
//   ① 增益能力：Mbnd ≥ Gmax（感性区内仍够得着最低输入所需的增益）
//   ② ZVS 能量：Er ≥ Ec
//   ③ ZVS 时间：t_ZVS ≤ td（死区内能完成 C总 充放电）
//   ④ 调频范围：f_min ~ f_max 仍为有限值且跨度可接受
//
// ⚠️ 扫描范围与已知边界：
//   · 只扫 **Lr / Cr / Lm（变压器感量）** 三项 —— 它们决定谐振腔与励磁；Coss / Cj / td 未扫。
//   · 匝比 n 与 Gmax/Gmin 由电压规格决定，不随元件容差变化（变压器匝数是绕制时确定的）。
//   · Rac 不变（它只由负载与匝比决定）。
//   · 本分析只看「设计是否仍成立」，不含温漂与老化；±容差按用户输入，建议取实际来料分布的极值。
/**
 * 穷举所需的**最小输入集**（结构化类型）：既可由设计工具的 CalculatedData 满足，
 * 也可由报告页的 CalculatedResults 满足 —— 两边都取自同一引擎，不在本模块重算标称值。
 */
export interface ToleranceBase {
  /** 标称谐振电感 H */
  lr: number
  /** 标称谐振电容 F */
  cr: number
  /** 标称励磁电感 H */
  lm: number
  /** 折算到原边的等效交流电阻 Ω */
  rac: number
  /** 所需最大/最小增益 */
  gMax: number
  gMin: number
  vinMin: number
  topology: string
  /** 死区用总电容 C总 = 2·Coss_tr + Cj */
  cossZvs: number
  /** 预设死区时间 s */
  td: number
  /** 标称 ZVS 所需能量（Ec，与 Coss/Cj/Vin_max 有关，不随 Lr/Cr/Lm 容差变化） */
  zvsEc: number
  /** 标称调频上下限，仅用于小结文字 */
  fmin: number
  fmax: number
}
import { boundaryGain, fmaxZvs, fullLoadGainCrossing, magnetizingCurrentOffPeak, zvsStoredEnergy, zvsCrossTime } from './llcMath'

export interface ToleranceSpec {
  /** 变压器励磁电感 Lm 容差 ±% */
  lmPct: number
  /** 谐振电感 Lr（含变压器漏感）容差 ±% */
  lrPct: number
  /** 谐振电容 Cr 容差 ±% */
  crPct: number
}

export interface ToleranceRow {
  /** 组合标签，如「Lm +15% / Lr −5% / Cr 0%」 */
  label: string
  dLm: number
  dLr: number
  dCr: number
  lm: number
  lr: number
  cr: number
  /** 实际谐振频率 = 1/(2π√(Lr·Cr)) */
  fr: number
  /** 实际电感比 = Lm/Lr */
  k: number
  /** 实际品质因数 = √(Lr/Cr)/Rac */
  q: number
  /** 感性区增益上限 */
  mbnd: number
  /** 满载低输入下的调频下限 */
  fmin: number
  /** 空载降压下的调频上限 */
  fmax: number
  er: number
  ec: number
  tZvs: number
  okGain: boolean
  okZvsE: boolean
  okZvsT: boolean
  okAll: boolean
}

export interface ToleranceResult {
  rows: ToleranceRow[]
  /** 标称组合（偏差全 0）—— 应与引擎输出一致，用于自校验 */
  nominal: ToleranceRow
  /** 未通过任一判据的组合 */
  failing: ToleranceRow[]
  /** 增益裕量最小 / ZVS 能量余量最小 / t_ZVS 最大的组合 */
  worstGain: ToleranceRow
  worstZvsE: ToleranceRow
  worstZvsT: ToleranceRow
  /** f_min / f_max 的极值（跨全部组合） */
  fminMin: number
  fminMax: number
  fmaxMin: number
  fmaxMax: number
  allOk: boolean
}

const pct = (v: number) => Math.round(v * 100)

/**
 * 单个组合的复核。公式全部取自 llcMath（与引擎同一来源），保证"标称组合"与引擎输出逐位一致。
 */
function evaluate(calc: ToleranceBase, dLm: number, dLr: number, dCr: number): ToleranceRow {
  const lr = calc.lr * (1 + dLr)
  const cr = calc.cr * (1 + dCr)
  const lm = calc.lm * (1 + dLm)
  const fr = 1 / (2 * Math.PI * Math.sqrt(lr * cr))
  const k = lm / lr
  const q = Math.sqrt(lr / cr) / Math.max(1e-6, calc.rac)
  const mbnd = boundaryGain(k, q)
  const fmax = fmaxZvs(fr, k, calc.gMin)
  const fnMin = fullLoadGainCrossing(k, q, calc.gMax)
  const fmin = Number.isFinite(fnMin) ? fr * fnMin : NaN
  const cossZvs = Number.isFinite(calc.cossZvs) && calc.cossZvs > 0 ? calc.cossZvs : 170e-12
  const imOff = magnetizingCurrentOffPeak(calc.vinMin, fmax, lm, calc.topology)
  const er = zvsStoredEnergy(lm, imOff)
  const ec = calc.zvsEc
  const tZvs = zvsCrossTime(fmax, lm, cossZvs, calc.topology)
  const td = calc.td
  const okGain = Number.isFinite(mbnd) && mbnd >= calc.gMax
  const okZvsE = er >= ec
  const okZvsT = tZvs <= td
  return {
    label: `Lm ${dLm > 0 ? '+' : ''}${pct(dLm)}% / Lr ${dLr > 0 ? '+' : ''}${pct(dLr)}% / Cr ${dCr > 0 ? '+' : ''}${pct(dCr)}%`,
    dLm, dLr, dCr, lm, lr, cr, fr, k, q, mbnd, fmin, fmax, er, ec, tZvs,
    okGain, okZvsE, okZvsT, okAll: okGain && okZvsE && okZvsT,
  }
}

/** 穷举三参数的 3×3×3 组合（含标称），返回逐组结果与最坏情况。 */
export function sweepTolerance(calc: ToleranceBase, spec: ToleranceSpec): ToleranceResult {
  const steps = [-1, 0, 1]
  const tLm = Math.abs(spec.lmPct) / 100
  const tLr = Math.abs(spec.lrPct) / 100
  const tCr = Math.abs(spec.crPct) / 100
  const rows: ToleranceRow[] = []
  for (const a of steps) for (const b of steps) for (const c of steps) {
    rows.push(evaluate(calc, a * tLm, b * tLr, c * tCr))
  }
  const nominal = rows.find((r) => r.dLm === 0 && r.dLr === 0 && r.dCr === 0) ?? rows[Math.floor(rows.length / 2)]
  const failing = rows.filter((r) => !r.okAll)
  const byGain = [...rows].sort((x, y) => (Number.isFinite(x.mbnd) ? x.mbnd / calc.gMax : -1) - (Number.isFinite(y.mbnd) ? y.mbnd / calc.gMax : -1))
  const byEr = [...rows].sort((x, y) => x.er / x.ec - y.er / y.ec)
  const byT = [...rows].sort((x, y) => y.tZvs - x.tZvs)
  const fin = (v: number[]) => v.filter(Number.isFinite)
  const fminAll = fin(rows.map((r) => r.fmin))
  const fmaxAll = fin(rows.map((r) => r.fmax))
  return {
    rows,
    nominal,
    failing,
    worstGain: byGain[0],
    worstZvsE: byEr[0],
    worstZvsT: byT[0],
    fminMin: fminAll.length ? Math.min(...fminAll) : NaN,
    fminMax: fminAll.length ? Math.max(...fminAll) : NaN,
    fmaxMin: fmaxAll.length ? Math.min(...fmaxAll) : NaN,
    fmaxMax: fmaxAll.length ? Math.max(...fmaxAll) : NaN,
    allOk: failing.length === 0,
  }
}

/** 默认容差：变压器感量取 ±15%（含气隙与装配分散）、谐振电感 ±5%、谐振电容 ±5%（常见 C0G/薄膜来料） */
export const defaultToleranceSpec: ToleranceSpec = { lmPct: 15, lrPct: 5, crPct: 5 }

/** 供报告用的纯文本小结（不含渲染） */
export function toleranceSummary(calc: ToleranceBase, res: ToleranceResult, spec: ToleranceSpec): string {
  const f = (x: number, n = 0) => (Number.isFinite(x) ? x.toFixed(n) : '—')
  const line1 = `容差设定：Lm ±${spec.lmPct}%、Lr ±${spec.lrPct}%、Cr ±${spec.crPct}%（共 ${res.rows.length} 组穷举）`
  const line2 = res.allOk
    ? `结论：${res.rows.length} 组全部满足 增益能力 / ZVS 能量 / ZVS 时间 三项判据。`
    : `结论：${res.failing.length} / ${res.rows.length} 组不满足判据，见下表标红行。`
  const line3 = `调频范围随容差漂移：f_min ${f(res.fminMin / 1000, 1)}~${f(res.fminMax / 1000, 1)} kHz、f_max ${f(res.fmaxMin / 1000, 1)}~${f(res.fmaxMax / 1000, 1)} kHz（标称 ${f(calc.fmin / 1000, 1)} / ${f(calc.fmax / 1000, 1)} kHz）`
  const line4 = `最坏组合：增益裕量最小 ${res.worstGain.label}（Mbnd/Gmax = ${f(res.worstGain.mbnd / calc.gMax, 3)}）；ZVS 能量余量最小 ${res.worstZvsE.label}（Er/Ec = ${f(res.worstZvsE.er / res.worstZvsE.ec, 2)}）；t_ZVS 最大 ${res.worstZvsT.label}（${f(res.worstZvsT.tZvs * 1e9, 1)} ns vs td ${f(calc.td * 1e9, 0)} ns）`
  return [line1, line2, line3, line4].join('\n')
}


// ─────────────────────────────────────────────────────────────────────────────
// 蒙特卡洛（Monte Carlo）—— 与上面的「极值组合法」是两种**不同**方法，别混称：
//   · 极值组合法 / 最坏情况分析（worst-case）：每参数取 −容差 / 标称 / +容差，确定性地覆盖极值，
//     回答「最坏能做到多坏」。组数少（3ⁿ）、可复现、对单调响应能严格给出最坏点。
//   · 蒙特卡洛：按**分布**随机抽样 N 次，回答「**通过率（良率）多少**、余量怎么分布、离失效有多远」。
//     需要分布假设与更多样本，反映的是统计特性而不是确定极值。
//   工程上两者互补：极值法定"能不能用"，蒙特卡洛定"批量做出来有多少不合格"。
// ─────────────────────────────────────────────────────────────────────────────

export type Distribution = 'uniform' | 'normal'

export interface MonteCarloSpec extends ToleranceSpec {
  /** 抽样次数（建议 2000~20000） */
  samples: number
  /** 'uniform'：±容差内等概率；'normal'：3σ = 容差，并截断在 ±容差内 */
  distribution: Distribution
  /** 随机种子 —— 固定种子保证报告可复现（同一份报告每次导出结果一致） */
  seed: number
}

export interface MarginStats {
  name: string
  min: number
  mean: number
  max: number
  sd: number
}

export interface MonteCarloResult {
  samples: number
  distribution: Distribution
  seed: number
  /** 三项判据同时满足的比例（良率／通过率） */
  yieldAll: number
  passGain: number
  passZvsE: number
  passZvsT: number
  /** 各判据的余量比统计（Mbnd/Gmax、Er/Ec、td/tZVS —— 均以 ≥1 为通过） */
  stats: MarginStats[]
  /** 综合余量最小的样本（三项余量比取最小值后最小者） */
  worst: ToleranceRow
  /** t_ZVS/td 的直方图 */
  histTime: { lo: number; hi: number; n: number }[]
  /** Mbnd/Gmax 的直方图 */
  histGain: { lo: number; hi: number; n: number }[]
}

/** mulberry32：小、快、可复现的 PRNG（同一 seed ⇒ 同一结果，报告必须可复现） */
function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** 截断正态：3σ = tol，超出 ±tol 直接夹紧（不重采样，保证样本数正好） */
function sampleDeviation(rnd: () => number, tol: number, dist: Distribution): number {
  if (tol <= 0) return 0
  if (dist === 'uniform') return (rnd() * 2 - 1) * tol
  const u1 = Math.max(1e-12, rnd())
  const u2 = rnd()
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
  const d = (z * tol) / 3
  return Math.max(-tol, Math.min(tol, d))
}

function histogram(values: number[], bins = 10) {
  if (!values.length) return []
  const lo = Math.min(...values)
  const hi = Math.max(...values)
  if (!(hi > lo)) return [{ lo, hi, n: values.length }]
  const w = (hi - lo) / bins
  const out = Array.from({ length: bins }, (_, i) => ({ lo: lo + i * w, hi: lo + (i + 1) * w, n: 0 }))
  for (const v of values) {
    const idx = Math.min(bins - 1, Math.max(0, Math.floor((v - lo) / w)))
    out[idx].n++
  }
  return out
}

function stat(name: string, v: number[]): MarginStats {
  const mean = v.reduce((a, b) => a + b, 0) / v.length
  const sd = Math.sqrt(v.reduce((a, b) => a + (b - mean) * (b - mean), 0) / v.length)
  return { name, min: Math.min(...v), mean, max: Math.max(...v), sd }
}

/**
 * 蒙特卡洛抽样：Lr / Cr / Lm 按分布抽取，逐样本复核三项判据，给出通过率与余量分布。
 * 与极值法共用同一个 `evaluate()` 与同一套 llcMath 公式（口径不会分叉）。
 */
export function monteCarlo(base: ToleranceBase, spec: MonteCarloSpec): MonteCarloResult {
  const n = Math.max(100, Math.min(200000, Math.round(spec.samples || 2000)))
  const rnd = mulberry32(spec.seed || 20260930)
  const tLm = Math.abs(spec.lmPct) / 100
  const tLr = Math.abs(spec.lrPct) / 100
  const tCr = Math.abs(spec.crPct) / 100
  const rows: ToleranceRow[] = []
  const mGain: number[] = []
  const mEnergy: number[] = []
  const mTime: number[] = []
  for (let i = 0; i < n; i++) {
    const dLm = sampleDeviation(rnd, tLm, spec.distribution)
    const dLr = sampleDeviation(rnd, tLr, spec.distribution)
    const dCr = sampleDeviation(rnd, tCr, spec.distribution)
    const r = evaluate(base, dLm, dLr, dCr)
    rows.push(r)
    mGain.push(Number.isFinite(r.mbnd) ? r.mbnd / base.gMax : 0)
    mEnergy.push(r.er / r.ec)
    mTime.push(base.td / r.tZvs) // 以 ≥1 为通过，与另两项口径一致
  }
  const passGain = mGain.filter((v) => v >= 1).length / n
  const passZvsE = mEnergy.filter((v) => v >= 1).length / n
  const passZvsT = mTime.filter((v) => v >= 1).length / n
  const yieldAll = rows.filter((r) => r.okAll).length / n
  let worstIdx = 0
  let worstScore = Infinity
  for (let i = 0; i < n; i++) {
    const s = Math.min(mGain[i], mEnergy[i], mTime[i])
    if (s < worstScore) { worstScore = s; worstIdx = i }
  }
  return {
    samples: n,
    distribution: spec.distribution,
    seed: spec.seed,
    yieldAll,
    passGain,
    passZvsE,
    passZvsT,
    stats: [
      stat('Mbnd/Gmax', mGain),
      stat('Er/Ec', mEnergy),
      stat('td/tZVS', mTime),
    ],
    worst: { ...rows[worstIdx], label: rows[worstIdx].label + '（蒙特卡洛最坏样本）' },
    histTime: histogram(mTime),
    histGain: histogram(mGain),
  }
}

/** 蒙特卡洛小结文字（供报告与导出使用） */
export function monteCarloSummary(base: ToleranceBase, res: MonteCarloResult, spec: MonteCarloSpec): string {
  const pc = (x: number) => (x * 100).toFixed(2) + '%'
  const f = (x: number, k = 3) => (Number.isFinite(x) ? x.toFixed(k) : '—')
  const dist = spec.distribution === 'uniform' ? '±容差内均匀分布' : '正态分布（3σ = 容差，截断在 ±容差内）'
  const l1 = '抽样 ' + res.samples + ' 组（' + dist + '；Lm ±' + spec.lmPct + '%、Lr ±' + spec.lrPct + '%、Cr ±' + spec.crPct + '%；种子 ' + res.seed + '，可复现）'
  const l2 = '综合通过率 ' + pc(res.yieldAll) + '（增益能力 ' + pc(res.passGain) + '／ZVS 能量 ' + pc(res.passZvsE) + '／ZVS 时间 ' + pc(res.passZvsT) + '）'
  const l3 = res.stats.map((s) => s.name + '：最小 ' + f(s.min) + '／均值 ' + f(s.mean) + '／最大 ' + f(s.max) + '（σ=' + f(s.sd, 3) + '）').join('；')
  const l4 = '最坏样本：' + res.worst.label + '（Mbnd/Gmax = ' + f(res.worst.mbnd / base.gMax) + '、Er/Ec = ' + f(res.worst.er / res.worst.ec, 2) + '、t_ZVS = ' + f(res.worst.tZvs * 1e9, 1) + ' ns vs td ' + f(base.td * 1e9, 0) + ' ns）'
  return [l1, l2, l3, l4].join('\n')
}
