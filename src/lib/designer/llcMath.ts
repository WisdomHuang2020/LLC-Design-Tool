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

/**
 * 谐振腔输入阻抗（以特征阻抗 Zr 归一化）：Zin / Zr
 *
 *   Zin/Zr = j(fn − 1/fn) + j·fn·k / (1 + j·fn·k·Q)
 *   ⇒ Re(Zin)/Zr = fn²k²Q / (1 + fn²k²Q²)
 *     Im(Zin)/Zr = (fn − 1/fn) + fn·k / (1 + fn²k²Q²)
 *
 * 与「公式推导」页 `Derivations.tsx` 的 Zin 三式逐字对应；
 * 曲线页「|Zin| / Zr」与「相位」两张图都以本函数为**唯一来源**。
 *
 * ⚠️ 历史缺陷（v2.10.94 修正）：曲线页曾把分母写成 `Q² + fn²k²`（相当于把 Q 取了倒数），
 *    与自身 Y 轴标签「|Zin| / Zr」不符；相位在 fn=1 处偏 4.01°、fn=0.8 处偏 11.83°，
 *    感性/容性分界因此由正确的 fn≈0.804 偏移到 ≈0.895。
 */
export function inputImpedanceNorm(
  fn: number,
  k: number,
  q: number,
): { re: number; im: number; mag: number; phase: number } {
  const d = 1 + fn * fn * k * k * q * q
  const re = (fn * fn * k * k * q) / d
  const im = fn - 1 / fn + (fn * k) / d
  return { re, im, mag: Math.sqrt(re * re + im * im), phase: (Math.atan2(im, re) * 180) / Math.PI }
}

// ─── 感性 / 容性分界点（Im(Zin) = 0）───

/**
 * 给定 Q 的增益曲线上，**感性区与容性区的分界点**归一化频率 fn（Im(Zin) = 0）。
 *
 * 由 `inputImpedanceNorm` 的虚部为零解出（令 x = fn²，是 x 的二次方程）：
 *
 *   Im(Zin)/Zr = (fn − 1/fn) + fn·k/(1 + fn²k²Q²) = 0
 *   ⇒ k²Q²x² + (1 + k − k²Q²)x − 1 = 0      （x = fn²）
 *   ⇒ x = [ −(1+k−k²Q²) + √((1+k−k²Q²)² + 4k²Q²) ] / (2k²Q²)   （取正根）
 *
 * fn < fn_b ⇒ 容性区（不能稳定工作）; fn > fn_b ⇒ 感性区（可 ZVS）。
 * 实测残差 |Im(Zin)| < 1e-16。
 */
export function boundaryFn(k: number, q: number): number {
  const a = k * k * q * q
  if (!(a > 0) || !(k > 0)) return NaN
  const b = 1 + k - a
  const disc = b * b + 4 * a
  const x = (-b + Math.sqrt(disc)) / (2 * a)
  return x > 0 ? Math.sqrt(x) : NaN
}

/**
 * **感性区内实际可达的增益上限** = 分界点处的增益 M(fn_b)。
 *
 * 为什么不是峰值增益：增益曲线的峰值（dM/dfn = 0）恒落在分界点**左侧**（实测左移 2%~15%，
 * Q 越小偏得越多），即**峰值位于容性区**。感性区内 M 随 fn 单调下降，最大值出现在分界点。
 * 因此判断「够不够得着 Gmax」必须用本值，用 Mpeak 会乐观若干个百分点。
 */
export function boundaryGain(k: number, q: number): number {
  const fn = boundaryFn(k, q)
  return Number.isFinite(fn) ? gainM(fn, k, q) : NaN
}

/**
 * 「感容分界判据」下的 Q 上限：**分界点增益恰等于 Gmax** 的 Q。
 *
 * 与本站默认判据（峰值增益 = Gmax，`computeDesign.findQmax1`）的区别：
 * 本判据保证在最坏工况下**感性区内仍够得着** Gmax，故更保守；本站默认判据的峰值落在容性区，
 * 代入后在感性区内实际差一点点（默认参数下差 0.15%）。
 *
 * 本函数按判据定义二分求解；其**精确解析解即 `qmax1Textbook`**（实测相对差 < 1e-12），
 * 对应的分界点频率即 `fminTextbook` 的归一化值（实测 0.0000% 一致）。
 */
export function qmax1Boundary(k: number, gMax: number): number {
  if (!(k > 0) || !(gMax > 1)) return NaN
  let lo = 1e-4
  let hi = 20
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2
    if (boundaryGain(k, mid) > gMax) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}

/**
 * 「峰值判据」下的 Q 上限：令增益曲线**峰顶** Mpeak 恰等于 Gmax 的 Q（二分）。
 *
 * ⚠️ 该判据**只保证增益数值达标，不保证工作在感性区**：峰顶恒位于分界点左侧（容性区），
 * 因此按此值取 Q 时，感性区内实际够不到 Gmax（默认参数差约 0.15%）。
 * 本站 v2.10.96 起设计默认改用 `qmax1Boundary`；本函数保留供对照与旧口径复现。
 *
 * 单一来源：引擎 `computeDesign` 与结果卡展示都调用它（旧实现是 `computeDesign` 内的局部函数）。
 */
export function qmax1Peak(k: number, gMax: number): number {
  if (!(k > 0) || !(gMax > 0)) return NaN
  let lo = 0.001
  let hi = 5
  const tolerance = 1e-6
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2
    if (peakGain(k, mid) > gMax) lo = mid
    else hi = mid
    if (hi - lo < tolerance) break
  }
  return (lo + hi) / 2
}

// ZVS phase check at fsw (fn = 1 since fr = fsw in our design)
export function zvsPhase(k: number, q: number): number {
  // 原实现用 x = k·q、real = x²/(1+x²)、imag = x/(1+x²)，即 Re/Rac 与 Im/Rac 的归一化形式。
  // 它与「以 Zr 归一化」的 inputImpedanceNorm(1,k,q) 只差一个常数因子 Q，**相位完全相同**
  // （两者等价于 atan2(1, k·q)），故直接复用后者，避免同一套数学写两遍。
  return inputImpedanceNorm(1, k, q).phase
}

// ─── 教材对照式（仅供页面并列展示，不参与本站设计计算）───

/**
 * 教材/常用资料给出的「Q 上限」闭式解（DTU 等资料同式）：
 *
 *   Qmax = 1/(k·Gmax) · √( k + Gmax²/(Gmax² − 1) )
 *
 * ✅ 该式**不是近似式**，而是「**感容分界点**增益 = Gmax」这条判据的**精确解析解**
 * （与 `qmax1Boundary` 的二分解相对差 < 1e-12，实测 k=3~8、Gmax=1.05~1.35 全部逐位相同）。
 *
 * 它与本站默认的「峰值增益 = Gmax」是**两条不同判据**，不是谁近似谁：
 * 峰值点恒在分界点左侧（落在容性区），故同一 Gmax 下本式给出的 Q 上限**更小、更保守**，
 * 但它保证感性区内真的够得着 Gmax（默认参数下 0.896744 vs 0.90727，差 1.2%）。
 *
 * 本站默认用数值二分求**峰值判据**解（`computeDesign.findQmax1`，令峰值增益恰为 Gmax）；
 * 保留此式供与教材/计算书对照，并在结果卡并列展示两种判据。
 */
export function qmax1Textbook(k: number, gMax: number): number {
  const denom = gMax * gMax - 1
  if (!(k > 0) || !(denom > 0)) return NaN
  return (1 / (k * gMax)) * Math.sqrt(k + (gMax * gMax) / denom)
}

/**
 * 教材/常用资料给出的「最低工作频率」闭式解（ZVS 安全下限）：
 *
 *   fn,min = 1 / √( 1 + k(1 − 1/Gmax²) )    ⇒    fmin = fr / √(1 + k(1 − 1/Gmax²))
 *
 * ✅ 该式**不是「忽略 Q 项的近似」**，而是「**感容分界轨迹** ∩ M = Gmax」这一点的**精确 fn 坐标**
 * （实测：该 fn 上分界轨迹对应的 Q 恰为 `qmax1Textbook`，该点增益与 Gmax 相对差 0.0000%）。
 * 物理含义 = **ZVS 安全下限**：越过它就进入容性区。
 *
 * ⚠️ 与本站 fmin **定义不同**：本站取**满载增益曲线** M=Gmax 的交点
 * （`fullLoadGainCrossing`，满载 + 最低母线下的**实际工作频率**，默认参数 88.6 kHz）；
 * 本式对应「Q 顶到分界判据上限」的最坏情形（默认参数 84.8 kHz）。
 * 二者均成立 —— 本站值若**高于**自身分界频率（本设计 88.6 > 79.8 kHz）即安全。
 * 页面并列展示供对照。
 */
export function fminTextbook(fr: number, k: number, gMax: number): number {
  const g2 = gMax * gMax
  if (!(g2 > 0)) return NaN
  return fr / Math.sqrt(1 + k * (1 - 1 / g2))
}

/**
 * 关断时刻励磁电流峰值 I_{m,off}（A）—— ZVS 换流与关断损耗所依据的电流。
 *
 *   I_{m,off} = Vin,min / (coeff · fmax · Lm)，  半桥 coeff = 8，全桥 coeff = 4
 *
 * 物理含义：MOSFET 在半个周期结束时关断，此刻负载折算分量恰好归零
 * （次级整流管换流），原边电流只剩励磁分量，故关断瞬间的电流即 I_{m,off}。
 * 该值是「死区内给 Coss 充放电」的唯一能量来源，也是关断损耗的正确电流取值。
 *
 * 单一来源：引擎（computeDesign）与损耗模型（losses）都从这里取，避免两处各写一遍。
 * 对非有限 fmax（设计不可行）返回 0，调用方需自行兜底。
 */
export function magnetizingCurrentOffPeak(
  vinMin: number,
  fmax: number,
  lm: number,
  topology: string,
): number {
  const coeff = topology === 'half-bridge' ? 8 : 4
  const f = Number.isFinite(fmax) && fmax > 0 ? fmax : 0
  if (!(f > 0) || !(lm > 0) || !(vinMin > 0)) return 0
  return vinMin / (coeff * f * lm)
}
