// LLC 设计工具 —— 基础数学
// E 系列选值 + 标准 FHA 增益模型。纯函数，无副作用。

// ─── E-Series helpers ───
export const E12 = [1.0, 1.2, 1.5, 1.8, 2.2, 2.7, 3.3, 3.9, 4.7, 5.6, 6.8, 8.2]
export const E24 = [
  1.0, 1.1, 1.2, 1.3, 1.5, 1.6, 1.8, 2.0, 2.2, 2.4, 2.7, 3.0, 3.3, 3.6, 3.9, 4.3, 4.7, 5.1, 5.6, 6.2, 6.8, 7.5, 8.2, 9.1,
]

/** 把数值吸附到最近的 E 系列标称值（按十进制量级归一后比较尾数） */
export function nearestE(value: number, series: number[]): number {
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
export function gainM(fn: number, k: number, q: number): number {
  const a = 1 + (1 / k) * (1 - 1 / (fn * fn))
  const b = q * (fn - 1 / fn)
  return 1 / Math.sqrt(a * a + b * b)
}

/** 在 fn ∈ [0.3, 1.0] 上数值寻优求峰值增益 */
export function peakGain(k: number, q: number): number {
  let maxM = 0
  const step = 0.005
  for (let fn = 0.3; fn <= 1.0; fn += step) {
    const m = gainM(fn, k, q)
    if (m > maxM) maxM = m
  }
  return maxM
}

/**
 * 满载增益曲线（给定 Q）上 M = target 的交点频率（归一化 fn），取**感性区一侧**（峰值频率右侧）。
 *
 * 为什么取右侧：LLC 增益曲线在峰值频率处达到最大，向右（频率升高）单调下降，控制环才能稳定；
 * 峰值左侧 dM/dfn > 0，属折叠区（容性），环路无法稳定停留。
 * 该交点即「满载 + 最低母线」所需的最低开关频率 —— 轻载在同一增益要求下所需频率更高，
 * 故满载是最坏情况，此值即全工况的最低开关频率。
 *
 * @returns 归一化频率 fn；若满载峰值增益都达不到 target，则返回峰值频率本身
 */
export function fullLoadGainCrossing(k: number, q: number, target: number): number {
  const fnLower = 1 / Math.sqrt(1 + k) // 空载极点，Region 1 / Region 2 分界
  const step = 0.001
  let fnPeak = fnLower + step
  let mPeak = -Infinity
  for (let fn = fnLower + step; fn <= 1; fn += step) {
    const m = gainM(fn, k, q)
    if (m > mPeak) {
      mPeak = m
      fnPeak = fn
    }
  }
  if (mPeak <= target) return fnPeak // 峰值即最大增益能力，达不到 target
  // 在 [fnPeak, 1] 上二分：gainM 在此区间随 fn 单调下降
  let lo = fnPeak
  let hi = 1
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2
    if (gainM(mid, k, q) >= target) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}

// ZVS phase check at fsw (fn = 1 since fr = fsw in our design)
export function zvsPhase(k: number, q: number): number {
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

// ─── 教材对照式（仅供页面并列展示，不参与本站设计计算）───

/**
 * 教材/常用资料给出的「Q 上限」闭式解（DTU 等资料同式）：
 *
 *   Qmax = 1/(k·Gmax) · √( k + Gmax²/(Gmax² − 1) )
 *
 * ⚠️ 该式是**近似式**：并不保证代入后增益曲线的峰值恰为 Gmax。
 * 实测（k=4, Gmax=1.0526）峰值增益 = 1.05434 > Gmax，**偏保守**（留了额外余量）；
 * 参数越极端偏差越大（k=8, Gmax=1.35 时约 −5.4%）。
 * 本站默认用数值二分求**精确解**（`computeDesign.findQmax1` 令峰值增益恰为 Gmax）。
 * 保留此式仅为与教材结果对照。
 */
export function qmax1Textbook(k: number, gMax: number): number {
  const denom = gMax * gMax - 1
  if (!(k > 0) || !(denom > 0)) return NaN
  return (1 / (k * gMax)) * Math.sqrt(k + (gMax * gMax) / denom)
}

/**
 * 教材/常用资料给出的「最低工作频率」闭式解（忽略 Q 项的近似）：
 *
 *   fn,min = 1 / √( 1 + k(1 − 1/Gmax²) )    ⇒    fmin = fr / √(1 + k(1 − 1/Gmax²))
 *
 * ⚠️ 定义与本站不同：本站 fmin 取**满载增益曲线 M=Gmax 的交点**
 * （`fullLoadGainCrossing`，满载 + 最低母线的最坏工况，更保守）；
 * 本式是把增益式分母第一项单独置为 1/Gmax 得到的解析近似，**忽略 Q 项**。
 * 二者均成立、数值略有差异（默认参数下 84.8 kHz vs 86.7 kHz），页面并列展示供对照。
 */
export function fminTextbook(fr: number, k: number, gMax: number): number {
  const g2 = gMax * gMax
  if (!(g2 > 0)) return NaN
  return fr / Math.sqrt(1 + k * (1 - 1 / g2))
}
