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
