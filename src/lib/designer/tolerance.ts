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
  /** 死区用总电容 C总 = 2·Coss,eq + Cj */
  cossZvs: number
  /** 预设死区时间 s */
  td: number
  /** 标称 ZVS 所需能量（Ec，与 Coss/Cj/Vin,max 有关，不随 Lr/Cr/Lm 容差变化） */
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

