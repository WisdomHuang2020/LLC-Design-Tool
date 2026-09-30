// LLC 设计工具 —— 损耗模型
// 由设计计算结果 + 器件/磁芯参数估算各项损耗与效率。
import type { CalculatedData, LossParameters, LossBreakdown } from './types'
import { magnetizingCurrentOffPeak } from './llcMath'

export const defaultLossParams: LossParameters = {
  mosfetRdsOn: 30,
  rdsonTempFactor: 1.6,
  mosfetTr: 15,
  mosfetTf: 10,
  mosfetVsd: 1.2,
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

  // 磁芯损耗：默认走手册 P_cv 法（PC95 @100℃/100kHz/0.2T ≈ 290 mW/cm³）
  coreLossMode: 'pcv',
  corePcv: 290,
  coreWaveK: 1.25,

  // 谐振电感铁损：默认给出有依据的量级值，而不是留 0
  //  · P_cv = 130 mW/cm³ —— PC95 手册 @100 kHz 查图：B ≈ 0.15 T 处约 130 mW/cm³（0.2 T / 290 mW/cm³ 按 B^2.5 折算约 141）
  //  · Ve   = 1.25 cm³   —— 取变压器 Ve（默认 5.0 cm³）的 1/4（谐振电感体积通常为变压器的 1/5~1/4）
  //  ⚠️ 这只是「典型量级」假设（默认 0.16 W）；实际必须按 Lr 所用磁芯的牌号、Ae、匝数与实测 B 重查，
  //     给默认值不等于免责 —— 换成实际磁芯数据后须重算。
  lrCorePcv: 130,
  lrCoreVe: 1.25,

  // 谐振电容：默认由 1kHz 损耗角正切 + 频率修正折算等效 ESR
  crEsrMode: 'df',
  crDf1k: 0.001,
  crDfK: 2.0,
}

export interface LossResult {
  mosfetCond: number
  mosfetSwitchOn: number
  mosfetSwitchOff: number
  mosfetCoss: number
  mosfetDiode: number
  coreLoss: number
  /** 磁芯损耗对照值：Steinmetz 拟合式（无论当前模式都计算，供并列展示） */
  coreLossSteinmetz: number
  /** 磁芯损耗对照值：手册 P_cv 法 */
  coreLossPcv: number
  bPeak: number
  windingLoss: number
  rectLoss: number
  /** 整流器件数 Nrect：中心抽头 2 / 全波（桥）4 */
  nRect: number
  /** 每个整流器件在整周期内的电流有效值 Is,sw = (π/4)·Io */
  isSw: number
  resonantLoss: number
  /** 谐振电感铜损 */
  lrCopperLoss: number
  /** 谐振电感铁损 */
  lrCoreLoss: number
  /** 谐振电容等效 ESR（Ω） */
  crEsrEff: number
  /** 谐振电容损耗 */
  crLoss: number
  totalLoss: number
  efficiency: number
  breakdown: LossBreakdown[]
}

export function calculateLosses(calc: CalculatedData, lp: LossParameters): LossResult {
  const vin = calc.vinNom
  const fsw = calc.fsw
  const ipRms = calc.ipRms
  const ipPeak = ipRms * Math.sqrt(2)
  // 关断时刻励磁电流峰值 I_{m,off}：关断损耗与死区体二极管损耗的正确电流取值。
  // 优先用引擎算好的 calc.imOff；旧存档（本地存储）可能缺该字段，用同一公式兜底重算。
  const imOff =
    Number.isFinite(calc.imOff) && calc.imOff > 0
      ? calc.imOff
      : magnetizingCurrentOffPeak(
          calc.vinMin,
          Number.isFinite(calc.fmax) ? calc.fmax : fsw,
          calc.lm,
          calc.topology,
        )
  const io = calc.pout / calc.vout
  const nSwitches = calc.topology === 'half-bridge' ? 2 : 4

  // 1. MOSFET conduction loss
  // Rds(on) 用 25℃ 规格书值 × 温度修正系数 kT（默认 1.6，约对应 100℃ 结温）。
  // 若直接用 25℃ 值，导通损耗会被显著低估。
  const kT = Number.isFinite(lp.rdsonTempFactor) && lp.rdsonTempFactor > 0 ? lp.rdsonTempFactor : 1
  const mosfetCondPer = 0.5 * ipRms * ipRms * (lp.mosfetRdsOn / 1000) * kT
  const mosfetCond = mosfetCondPer * nSwitches

  // ZVS 状态下开通损耗与 Coss 损耗可忽略（谐振电流在死区完成电容充放电）
  const zvsOn = calc.zvsMargin && calc.zvsTimeOk

  // 2. Switching loss (linear approximation; with ZVS Pon ideally 0)
  const switchV = vin
  const switchOn = zvsOn ? 0 : 0.5 * switchV * ipPeak * (lp.mosfetTr / 1e9) * fsw * nSwitches
  // 关断瞬间电流 = 励磁电流峰值 Im,off（此刻负载折算分量已归零，原边只剩励磁电流），
  // 而非原边总电流峰值 ipPeak。
  const switchOff = 0.5 * switchV * imOff * (lp.mosfetTf / 1e9) * fsw * nSwitches

  // 3. Coss loss —— 硬开关（非 ZVS）时 Coss 储能全部在开通瞬间由沟道耗散
  //   Coss 随 V_ds 非线性变化，故必须用**能量相关等效电容 C_oss,er**（≡ 规格书 Co(er)）：
  //     按定义 C_oss,er(V) = 2·E_oss(V)/V²  ⇒  E_oss = ½·C_oss,er·V_DS²，**无需任何非线性修正系数**。
  //   ⚠️ 与「时间相关等效 C_oss,eq（≡ Co(tr)）」不是同一个量：C_er < C_tr（Coss 单调递减时），
  //      Co(tr) 只用于死区**电荷/时间**约束（→ qmax2 / tZVS），不可拿来算损耗。
  //   ⚠️ 规格书里的标称 Coss（常标 0V 或低压处）既不是 Co(tr) 也不是 Co(er)，不能直接用。
  //   C_oss,er 取自**设计参数**（单一来源，与 td 同一做法），旧存档缺该字段时按典型值 35 pF 兜底。
  //   V_DS 取额定输入 V_in,nom（效率标称点）；若要评估最坏工况应按 V_in,max 另计。
  //   注：qmax2/qmax3 把 ZVS 条件写进了 Q 约束，多数设计点下 zvsMargin/zvsTimeOk 自动成立、
  //       本项为 0；但 q 有 0.001 下限、fmax 又随压差放大，扫参实测仍有约 9% 的配置会触发这两个
  //       校验（此时本项非 0），因此这里用 Co(er) 的取值是决定性的，不是摆设。
  const cossErIn = Number(calc.cossEr)
  const cossErP = Number.isFinite(cossErIn) && cossErIn > 0 ? cossErIn : 35
  const ecoss = 0.5 * (cossErP / 1e12) * vin * vin
  const cossLoss = zvsOn ? 0 : ecoss * fsw * nSwitches

  // 4. Body diode conduction loss
  // 死区内分两段：前段 tZVS 内电流用于给 Coss 充/放电，体二极管**尚未导通**；
  // 电压完成翻转后的剩余时间 (td − tZVS) 电流才经体二极管续流。
  // 故导通时间取「净放电时间」而非整个死区，电流取励磁电流峰值 Im,off。
  // ⚠️ 死区时间取自**设计参数**（calc.td），不再由损耗面板单独输入（v2.10.91 起单一来源）：
  //    此前两处各自取值，会出现「损耗模型说体二极管导通 0 ns、而 zvsTimeOk 判定死区充裕」这种自相矛盾。
  const td = Number.isFinite(calc.td) && calc.td > 0 ? calc.td : 0
  const tDiode = Math.max(0, td - (Number.isFinite(calc.tZvs) ? calc.tZvs : 0))
  const diodeLoss = lp.mosfetVsd * imOff * tDiode * fsw * nSwitches

  // 5. Transformer core loss —— 两条口径并列计算，按 coreLossMode 选用，另一条作对照
  //  (a) 手册 P_cv 法（默认，推荐）：P = P_cv × Ve × k_wave / 1000
  //      P_cv 是手册给出的损耗密度（mW/cm³），在目标温度/频率/B 下直接查得，比拟合式更贴近实际；
  //      k_wave 修正「手册曲线按正弦标定、而 LLC 变压器为方波励磁」的差异（典型 1.25）。
  //  (b) Steinmetz 拟合式：P = Cm · f^α · B^β · Ve
  //      单位约定：f 用 kHz、B 用 mT、Ve 用 cm³ ⇒ 结果 mW，再 /1000 得 W。
  //      ⚠️ Cm/α/β 来自**正弦**激励拟合，方波励磁下本就有偏差，故不再作为默认口径。
  const aeM2 = lp.coreAe * 1e-6
  const bPeak = (vin / (calc.topology === 'half-bridge' ? 2 : 1)) / (4 * fsw * lp.primaryTurns * aeM2)
  const bPeakMt = bPeak * 1000

  const coreWaveK = Number.isFinite(lp.coreWaveK) && lp.coreWaveK > 0 ? lp.coreWaveK : 1
  const coreLossSteinmetz =
    (lp.coreK * Math.pow(fsw / 1e3, lp.coreAlpha) * Math.pow(bPeak * 1000, lp.coreBeta) * lp.coreVe) / 1000
  const coreLossPcv = (lp.corePcv * lp.coreVe * coreWaveK) / 1000
  const coreLoss = lp.coreLossMode === 'steinmetz' ? coreLossSteinmetz : coreLossPcv

  // 6. Winding loss (DC + skin effect)
  // ⚠️ 电流必须用原边**总电流有效值** ipRms = √(Ir² + Im²)，**不可**用励磁电流 imRms。
  //    依据 MMF 平衡 Np·ip = Ns·is + Np·im：原边绕组这一个导体上，**负载折算分量与励磁分量
  //    同时流过**（负载电流经磁耦合折算回原边，并非"只在副边流"）；二者近似正交，
  //    故有效值按平方和相加。默认参数下 ipRms=0.70A、imRms=0.22A，误用后者会把铜损
  //    低估约 10 倍（0.049W → 0.005W），进而严重低估温升、导致变压器欠设计。
  //    （2026-09-29 审核结论：此项曾被外部意见列为"应改用 Im"，实为误报。）
  const rdc = lp.windingRdc / 1000
  const freqRatio = fsw / 1000 / lp.skinF0
  const racFactor = 1 + freqRatio * freqRatio
  const windingLoss = ipRms * ipRms * rdc * racFactor

  // 7. Rectifier loss
  // ⌾ 口径（v2.10.98 厘清，此前两处串味导致中心抽头少算一半）：
  //    Is,sw = **每个整流器件在整周期内的电流有效值**；Nrect = 同时计数的器件数。
  //    · 中心抽头（含同步）：每个绕组/整流管半波导通，波形是半波正弦，
  //      峰值 π·Io/2 ⇒ RMS = 峰值/2 = π·Io/4 ≈ 0.785 Io，Nrect = 2
  //    · 全波/整流桥（含同步）：副边绕组整周期正弦，RMS = π·Io/(2√2) ≈ 1.11 Io；
  //      但每个整流管只导通半周 ⇒ Is,sw = 绕组 RMS / √2 = π·Io/4 ⇒ **同样是 π·Io/4**，Nrect = 4
  //    ⟹ 两种拓扑下 Is,sw 同为 (π/4)·Io，差别只在 Nrect（2 / 4）；整流桥导通损耗恰为中心抽头的 2 倍。
  //    ⚠️ 旧实现统一按 calc.isRms/√2 取 Is,sw —— 对全波口径正确，却把中心抽头的
  //       「本就是每管 RMS」的量又除了一次 √2 ⇒ 功率少算 2 倍（v2.10.98 修正）。
  //    ⚠️ 同步整流的 Rds(on) 与原边一样是 25℃ 值，必须同乘温度修正 kT（v2.10.98 补）。
  const isCt = calc.rectifier === 'center-tapped' || calc.rectifier === 'sync-center-tapped'
  const isSync = calc.rectifier === 'synchronous' || calc.rectifier === 'sync-center-tapped'
  const nRect = isCt ? 2 : 4
  const isSw = (Math.PI / 4) * io
  let rectLoss = 0
  if (isSync) {
    rectLoss = nRect * isSw * isSw * (lp.syncRectRdsOn / 1000) * kT
  } else {
    // 二极管口径不变：每个管子平均电流 Io/2（Iavg），Nrect 个管子的 Vf·Iavg 之和
    rectLoss = nRect * lp.rectVf * (io / 2)
  }

  // 8. Resonant element loss
  //  · 谐振电感：铜损 + 铁损（正弦激励 ⇒ 手册 P_cv 直接用，不乘 k_wave）
  //  · 谐振电容：等效 ESR 两种口径 ——
  //      'esr'：直接给 ESR（mΩ）；
  //      'df' ：规格书一般只给 1kHz 损耗角正切，需按频率折算：
  //             ESR(f) = tanδ(f) / (2π·f·Cr)，其中 tanδ(f) = DF_1k × k
  const lrCopperLoss = ipRms * ipRms * (lp.lrDcr / 1000)
  // ⚠️ Lr 铁损**不乘 k_wave**：谐振电感流过的是正弦谐振电流，而手册 P_cv 曲线本就按正弦标定，
  //    k_wave（默认 1.25）修的是「手册正弦标定 vs LLC 变压器方波励磁」的差异，套到 Lr 上会虚增 25%。
  const lrCoreLoss = (lp.lrCorePcv * lp.lrCoreVe) / 1000
  const lrLoss = lrCopperLoss + lrCoreLoss

  const crEsrEff =
    lp.crEsrMode === 'esr'
      ? lp.crEsr / 1000
      : (lp.crDf1k * lp.crDfK) / Math.max(1e-15, 2 * Math.PI * fsw * calc.cr)
  const crLoss = ipRms * ipRms * crEsrEff

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
    mosfetCoss: cossLoss, // 与 mosfetCond/mosfetSwitchOn/mosfetDiode 同族命名；此处是损耗（W），不再是电容参数
    mosfetDiode: diodeLoss,
    coreLoss,
    coreLossSteinmetz,
    coreLossPcv,
    bPeak: bPeakMt,
    windingLoss,
    rectLoss,
    nRect,
    isSw,
    resonantLoss,
    lrCopperLoss,
    lrCoreLoss,
    crEsrEff,
    crLoss,
    totalLoss,
    efficiency,
    breakdown,
  }
}
