// LLC 设计工具 —— 优化建议生成
// 纯函数：由计算结果的标量投影生成建议清单，最多返回 10 条。
import type { DesignParameters } from '../DesignContext'
import type { Suggestion, SuggestionInputs } from './types'
import { boundaryGain, GAIN_RESERVE_FLOOR } from './llcMath'

/** 非有限值格式化：避免 Infinity 被直接渲染成 "Infinity"（与 ResultsSummaryCard 的显示口径一致） */
const fmt = (v: number, digits = 3): string =>
  Number.isFinite(v) ? v.toFixed(digits) : Number.isNaN(v) ? '—' : '∞'

/** 计算书建议的 Q 降额系数区间（书原文：一般 Q 取值降额系数 0.9~0.95 就够了） */
const BOOK_M_LO = 0.9
const BOOK_M_HI = 0.95

export function generateSuggestions(
  params: DesignParameters,
  results: SuggestionInputs,
): Suggestion[] {
  const s: Suggestion[] = []
  const { q, k, mRequired, mRequiredMin, cr, lm, fsw, efficiency, qmax1, qmax2, qmax3, qMargin, gmaxEmpty, zvsMargin, zvsTimeOk, tZvs, er, ec, fmax, fmin, kMax } = results

  // 裕量系数兜底：旧存档 / 旧调用点可能未提供该字段
  const margin = Number.isFinite(qMargin) && qMargin > 0 ? qMargin : 0.95 // 旧存档兜底

  // 1. k值与空载降压约束上限 kMax
  // kMax = Gmin/(1-Gmin)（仅当 Gmin<1 时有约束）：Region 1 空载增益下限 k/(k+1)
  // 必须 ≤ Gmin，否则最高输入电压空载时输出过压，设计不可行
  if (!Number.isFinite(kMax)) {
    s.push({ text: `Gmin=${mRequiredMin.toFixed(3)}≥1，空载降压约束不存在，k 取值不受高输入电压限制。`, level: 'good' })
  } else if (k > kMax) {
    s.push({ text: `电感比k=${k.toFixed(3)}超过空载降压约束上限kmax=${kMax.toFixed(3)}：Region 1 空载增益下限 k/(k+1)=${gmaxEmpty.toFixed(3)} > Gmin=${mRequiredMin.toFixed(3)}，最高输入电压空载时无法将增益降至所需值，输出过压。建议减小k至≤${kMax.toFixed(2)}或缩窄输入电压上限。`, level: 'critical' })
  } else if (k > kMax * 0.8) {
    s.push({ text: `电感比k=${k.toFixed(3)}接近空载降压约束上限kmax=${kMax.toFixed(3)}（裕量<20%）。建议减小k至≤${(kMax * 0.5).toFixed(2)}以获得更充裕的空载降压裕量。`, level: 'warn' })
  } else {
    s.push({ text: `电感比k=${k.toFixed(3)}满足空载降压约束（kmax=${kMax.toFixed(3)}）：Region 1 空载增益下限 k/(k+1)=${gmaxEmpty.toFixed(3)} ≤ Gmin=${mRequiredMin.toFixed(3)}，裕量良好。`, level: 'good' })
  }

  // 2. Qmax 对比：**设计约束**（Qmax1 增益能力 / Qmax2 死区时间）里哪条最紧
  //    ⚠️ Qmax3 只是「空载 / 轻载 ZVS 能量」的**校核项**，不参与设计 Q 的取小（见 computeDesign.ts）。
  //    ⚠️ Qmax1 分支只作**信息**（good）：「Qmax1 最紧」在增益受限的设计里几乎是必然结果，本身不需要动作；
  //       它的后果（增益裕量够不够）由第 4 条按 Mbnd 判定，避免同一件事报两次、且报警无对应动作。
  //       Qmax2 最紧时能给出具体杠杆（死区时间 / Lm），故保留 warn。
  const qmaxMin = Math.min(qmax1, qmax2)
  const critLabel = params.qmax1Criterion === 'peak' ? '峰值判据（备选，工作点落在容性区）' : '感容分界判据'
  if (qmax1 === qmaxMin) {
    s.push({
      text: `设计约束中最紧的是 Qmax1=${fmt(qmax1)}（${critLabel}）：瓶颈在增益能力（ZVS 死区侧 Qmax2=${fmt(qmax2)} 宽裕）。`,
      level: 'good',
    })
  } else if (qmax2 === qmaxMin) {
    s.push({ text: `Qmax2(ZVS死区限制)=${qmax2.toFixed(3)} 为设计约束中最紧者，ZVS 时间条件是设计瓶颈。建议增大死区时间或减小 Lm。`, level: 'warn' })
  }
  const zvsEnergyChkOk = qmax3 >= qmaxMin
  s.push({
    text: `Qmax 分解：Qmax1=${fmt(qmax1)}, Qmax2=${fmt(qmax2)} ⇒ Qmax = min(Qmax1,Qmax2) = ${fmt(qmaxMin)}；另 Qmax3（空载 ZVS 能量校核）=${fmt(qmax3)}，${zvsEnergyChkOk ? '高于设计上限、校核通过' : '⚠️ 低于设计上限，极端轻载可能失去 ZVS'}。裕量系数 m=${margin.toFixed(2)} → 设计 Q=${q.toFixed(3)}。`,
    level: zvsEnergyChkOk ? 'good' : 'warn',
  })

  // 3. Q 值：本流程里 Q 不是自由变量（Q = m·Qmax），此处只陈述其连带效应，不预判结果。
  //    连带效应已实测（默认 400V/24V/120W、半桥、k=4）：
  //      Q 0.897 → 0.538 时，Lr 385.6 → 231.4 µH、Lm 1542 → 925 µH、Er/Ec 3.90 → 6.50、
  //      fmin 84.8 → 90.3 kHz（调频半跨度 13.5% → 10.7%）
  //    ⇒ Q 越大 ⇒ Lr、Lm 越大 ⇒ 励磁电流与 ZVS 能量越小、调频跨度越宽。
  //    ⚠️ 此处**不再声称「频率调节范围可能较宽」**（v2.10.99 修正）：跨度由第 6 条按实测 fmin~fmax 判定，
  //       两条并存时曾出现「Q 略高 → 范围可能较宽」与「频率范围合理」自相矛盾的输出。
  if (q > 1.0) {
    s.push({
      text: `Q=${q.toFixed(3)}（>1.0）：特征阻抗已大于满载 R_ac，Lr、Lm 同比例偏大（Lm = k·Q·R_ac/2πfr）⇒ 励磁电流与 ZVS 能量偏小。ZVS 与调频跨度请看下方两条实测判据。`,
      level: 'warn',
    })
  } else if (q < 0.2) {
    s.push({ text: `Q值偏低（<0.2），谐振电流纹波较大，注意滤波设计。`, level: 'warn' })
  } else {
    s.push({
      text: `Q=${q.toFixed(3)}：由增益上限反算（Q = m·Qmax = ${margin.toFixed(2)}×${fmt(qmaxMin)}），Lm=${(lm * 1e6).toFixed(0)} µH。Q 越大则 Lr/Lm 越大、ZVS 励磁能量越小、调频跨度越宽 —— 本例的 ZVS 与跨度见下方两条实测判据。`,
      level: 'good',
    })
  }

  // 4. 增益裕量 —— 必须按**感容分界点增益 Mbnd**（感性区内真正可达的上限）判定
  //    ⚠️ 曲线峰顶 Mpeak 恒落在容性区、不能作为工作点，用它对标 Gmax 会**高估**裕量：
  //       算例 Mpeak=1.0627（+0.96%）而 Mbnd=1.080（+0.73%）——v2.10.99 起统一改用 Mbnd。
  //    判据口径见 llcMath.GAIN_RESERVE_FLOOR 说明：v2.10.103 起取消自设的 ≥5% 阈值。
  const mBnd = boundaryGain(k, q)
  const reserveRatio = mBnd / mRequired
  // 由裕量反推「还能容忍输入跌到多少 V」：
  //   谐振腔所需增益 M(V) = 2n(Vo+Vf)/V = Vin_nom/V（本工具 n 由 Vin_nom 定义），设计可交付上限为 Mbnd
  //   ⇒ 能稳压的最低输入 = Vin_nom / Mbnd = Vin_min / 裕量比
  //   ★ 必须**除以**裕量比（裕量越大 ⇒ 能撑到越低的输入）；乘以裕量比方向就写反了（会算出高于 Vin_min 的值）。
  const sagFloor = params.vinMin / reserveRatio
  const sagTolerance = params.vinMin - sagFloor
  if (!Number.isFinite(mBnd)) {
    s.push({ text: `增益裕量无法判定：k=${k}、Q=${q.toFixed(3)} 越界，感容分界点无实数解。请检查 k 与输入电压范围。`, level: 'warn' })
  } else if (mBnd < mRequired) {
    s.push({
      text: `感性区增益不足（Mbnd=${mBnd.toFixed(3)} < Gmax=${mRequired.toFixed(3)}）：增益在感容分界点就够不到 Gmax，工作点会被挤进容性区。请减小 k、下调 m（降低 Q）或收窄最低输入电压。`,
      level: 'critical',
    })
  } else if (reserveRatio < GAIN_RESERVE_FLOOR) {
    // 裕量几乎为零 ⇒ 输入几乎不能再跌，给出计算书建议区间（0.90~0.95）的具体后果
    const gLo = boundaryGain(k, BOOK_M_LO * qmaxMin)
    const gHi = boundaryGain(k, BOOK_M_HI * qmaxMin)
    const lever = margin > BOOK_M_LO && Number.isFinite(gLo)
      ? `把 m 降到 ${BOOK_M_LO.toFixed(2)} 可得 +${((gLo / mRequired - 1) * 100).toFixed(2)}%、降到 ${BOOK_M_HI.toFixed(2)} 可得 +${((gHi / mRequired - 1) * 100).toFixed(2)}%`
      : `当前 m=${margin.toFixed(2)} 已低于计算书建议区间（${BOOK_M_LO}~${BOOK_M_HI}）仍不足 ⇒ 说明瓶颈不是增益上限，请检查约束 Qmax2（死区）/Qmax3（能量）是否更紧，或减小 k`
    s.push({
      text: `感性区增益裕量几乎为零：Mbnd=${mBnd.toFixed(3)} vs Gmax=${mRequired.toFixed(3)}，仅 +${((reserveRatio - 1) * 100).toFixed(2)}% ⇒ 输入只能再跌约 ${sagTolerance.toFixed(1)} V（至 ${sagFloor.toFixed(1)} V）就无法稳压。本流程 Q = m·Qmax 恒贴在增益上限，裕量基本只由 m 决定；计算书建议降额系数 α 取 ${BOOK_M_LO}~${BOOK_M_HI}（当前 m=${margin.toFixed(2)}），${lever}。`,
      level: 'warn',
    })
  } else {
    s.push({
      text: `感性区增益裕量 +${((reserveRatio - 1) * 100).toFixed(2)}%：Mbnd=${mBnd.toFixed(3)} vs Gmax=${mRequired.toFixed(3)} ⇒ 输入可再跌至 ${sagFloor.toFixed(1)} V 仍能稳压（规格下限 ${params.vinMin} V，即还有 ${sagTolerance.toFixed(1)} V 余量）。`,
      level: 'good',
    })
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
    s.push({ text: `ZVS时间不足！tZVS=${(tZvs*1e9).toFixed(1)}ns > 死区时间Td=${(params.td).toFixed(0)}ns。tZVS ∝ Lm ∝ Q，可下调裕量系数 m（当前 ${margin.toFixed(2)}）以减小 Q，或增大死区时间、选用低 Coss 器件。`, level: 'critical' })
  } else {
    s.push({ text: `ZVS时间充裕：tZVS=${(tZvs*1e9).toFixed(1)}ns ≤ Td=${params.td}ns，可在死区内完成谐振腔放电。`, level: 'good' })
  }

  // 6. 频率范围
  const fmaxKHz = fmax / 1000
  const fminKHz = fmin / 1000
  const frKHz = fsw / 1000
  // fmax 非有限 = 设计不可行（Gmin < k/(k+1)），此时不给频率范围建议，
  // 否则会渲染出 "fmax=InfinitykHz" 这类无意义文本；原因已由上方 kmax 告警说明。
  if (Number.isFinite(fmax)) {
    if (fmaxKHz > frKHz * 2.0) {
      s.push({ text: `频率调节范围过宽（fmax=${fmaxKHz.toFixed(1)}kHz >> fr=${frKHz.toFixed(1)}kHz），磁性元件设计困难。`, level: 'critical' })
    } else if (fmaxKHz > frKHz * 1.5) {
      s.push({ text: `频率范围较宽（fmin=${fminKHz.toFixed(1)}kHz ~ fmax=${fmaxKHz.toFixed(1)}kHz），注意磁性元件在宽频下的损耗。`, level: 'warn' })
    } else {
      s.push({ text: `频率范围合理：fmin=${fminKHz.toFixed(1)}kHz ~ fmax=${fmaxKHz.toFixed(1)}kHz（fr=${frKHz.toFixed(1)}kHz）。`, level: 'good' })
    }
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
