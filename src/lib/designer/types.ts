// LLC 设计工具 —— 共享类型与默认值
// 从 pages/Designer.tsx 拆出，原样保留字段与语义。

/** 优化建议的严重程度 */
export type SuggestionLevel = 'good' | 'warn' | 'critical'

/** 一条优化建议 */
export interface Suggestion {
  text: string
  level: SuggestionLevel
}

/** 生成建议所需的计算输入（Designer 计算引擎的输出投影） */
export interface SuggestionInputs {
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
  /** Q 裕量系数：q = qMargin · min(qmax1,qmax2)（qmax3 是空载 ZVS 能量校核，不进设计约束），默认 0.95 */
  qMargin: number
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

/** 设计计算结果（含结果展示层的全部字段） */
export interface CalculatedData {
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
  /** 输出整流压降 Vf (V)：既用于匝比 n，也用于二极管整流的整流损耗（单一来源）。
   *  ⚠️ 内部字段名沿用 `vd`，但**界面符号统一写作 Vf** —— Vf 才是二极管正向压降的通用符号；
   *  `Vd` 在电力电子里惯例指漏极电压，勿用于本量。 */
  vd: number
  rac: number
  zr: number
  /**
   * 能量相关等效输出电容 Coss_er（pF，单管，≡ 规格书 Co(er)），随设计参数带入计算数据，
   * 供损耗模型直接取用（硬开关 Coss 损耗 E_oss = ½·Coss_er·V²）。
   * ⚠️ 旧存档（localStorage）可能缺该字段 ⇒ 使用时必须兜底（losses.ts 按典型值 35 pF）。
   */
  cossEr?: number
  // 新增计算结果
  fmax: number
  fmin: number
  gmaxEmpty: number
  zvsEr: number
  zvsEc: number
  qmax1: number
  qmax2: number
  qmax3: number
  /**
   * 本次 Qmax1 用的是哪条判据：'boundary'（感容分界点增益 = Gmax，默认）或 'peak'（峰顶增益 = Gmax）。
   * ⚠️ 旧存档（本地存储）可能缺此字段 —— 读取处一律写成 `=== 'peak' ? 'peak' : 'boundary'` 兜底。
   */
  qmax1Criterion?: 'boundary' | 'peak'
  /** Q 裕量系数：q = qMargin · min(qmax1,qmax2)（qmax3 为空载 ZVS 能量校核，不进设计约束）；旧存档可能缺此字段，用时应兜底 0.95 */
  qMargin: number
  gMin: number
  gMax: number
  gNom: number
  designFeasible: boolean
  kMax: number
  // 新增字段
  zvsTimeOk: boolean
  tZvs: number
  /**
   * 设计死区时间 Td（秒）。
   * v2.10.91 起作为**单一来源**：ZVS 换流窗口与损耗模型的体二极管导通窗口都以它为准，
   * 不再由损耗面板单独输入（此前两处独立取值会导致互相矛盾的结论）。
   * ⚠️ 旧存档（本地存储）可能缺此字段，使用时须兜底。
   */
  td: number
  /** 死区用的总电容 C总 = 2·Coss_tr + Cj（时间/电荷口径） */
  cossZvs: number
  irRms: number
  imRms: number
  /**
   * 关断时刻励磁电流峰值 Im_off（A）。
   * 即 ZVS 能量判据中参与换流的励磁电流，亦为关断损耗与死区体二极管损耗的正确电流取值。
   * ⚠️ 旧存档（本地存储）可能缺此字段，渲染时须兜底。
   */
  imOff: number
  bPeak: number
  gainCurveData: Array<{ fn: number; m: number; mLight: number }>
}

/** 损耗模型输入参数 */
export interface LossParameters {
  mosfetRdsOn: number // mΩ @25℃（规格书值）
  /**
   * Rds(on) 温度修正系数：导通损耗 = Ip²·Rds(on)·k_T。
   * 硅 MOSFET 的 Rds(on) 随结温正相关，100℃ 时典型为 25℃ 值的 1.5~2.0 倍。
   * 默认 1.6（约对应 100℃ 工况）。若按 25℃ 值直接算会低估导通损耗。
   */
  rdsonTempFactor: number
  /**
   * 开关损耗用的**交叉时间**参数（不用规格书的 t_r / t_f 直接当交叉时间）：
   * 规格书 t_r/t_f 是在特定测试条件（如 V_DD=400 V、I_D≈5 A、R_G=10 Ω、V_GS=10 V）下测的
   * **漏极电流 10%↔90% 过渡时间**，与损耗积分所需的「V_DS 与 I_D 重叠（米勒平台）时长」不是同一个量。
   * 交叉时间由栅极回路决定：`t_cr = Q_gd·R_g / ΔV_gate` —— 见 losses.ts 的推导注释。
   */
  qgd: number // Q_gd 米勒电荷 (nC)，取规格书栅荷曲线 Q_gd
  vPlateau: number // V_plat 米勒平台电压 (V)，同一曲线读
  rgTotal: number // R_g 栅极回路总电阻 (Ω) = 内部 R_G + 外部 R_g + 驱动下拉/上拉阻抗
  vDrv: number // V_drv 驱动电平 (V)，开通过程 ΔV = V_drv − V_plat；关断按 0
  /**
   * 平台电荷的两种取法（两者本质相同，都是「搬走米勒电荷」；差别只是电荷从哪来）：
   * - `'qgd'`（默认，推荐）：`Q_plat = Q_gd`。规格书栅荷曲线的 Q_gd **本身就是厂商实测的
   *   `∫Crss(V) dV`**（平台段电荷），且测试电压（如 V_DD=520 V）通常贴近实际母线 ⇒ 误差最小。
   * - `'crss'`：`Q_plat = Crss_eq · VDS_swing`。`Crss_eq` **必须**是「对 Crss(V) 曲线积分再除以电压」
   *   得到的等效值（面积÷电压）。⚠️ 直接填规格书**某一点**的 Crss（如 600 V 处 2 pF）会把平台电荷
   *   低估数倍 —— 因为 Crss 在近 0 V 段极大，积分主要由那一段贡献。
   */
  tcrMethod: 'qgd' | 'crss'
  /** 等效反向传输电容 Crss_eq (pF) = ∫Crss dV / V_DS（仅 tcrMethod='crss' 时参与计算） */
  crssEq: number
  /** 平台对应的 V_DS 摆幅 (V)：半桥一般就填母线电压 Vin（关断时器件从 0 承压到 Vin） */
  vdsSwing: number
  // 注：Coss 相关电容**不在此处**——损耗面板不再单独输入 Coss。
  //     硬开关 Coss 损耗与 ZVS 能量判据统一取设计参数 `DesignParameters.cossEr`（Coss_er ≡ Co(er)，
  //     能量相关等效电容），死区时间/电荷判据取 `cossEq`（Coss_tr ≡ Co(tr)）。单一来源，避免同一物理量两处输入。
  mosfetVsd: number // V body diode
  primaryTurns: number
  coreMaterial: string
  coreVe: number // cm³
  coreAe: number // mm²
  coreK: number
  coreAlpha: number
  coreBeta: number
  windingRdc: number // mΩ
  skinF0: number // kHz
  syncRectRdsOn: number // mΩ
  lrDcr: number // mΩ
  crEsr: number // mΩ（仅 crEsrMode='esr' 时使用）

  // ── 磁芯损耗：手册 P_cv 法 vs Steinmetz 拟合（v2.10.92 起 P_cv 为默认口径）──
  /** 'pcv'：按手册损耗密度 × 体积 × 波形系数算（推荐）；'steinmetz'：按拟合式算 */
  coreLossMode: 'pcv' | 'steinmetz'
  /** 手册磁芯损耗密度 P_cv（mW/cm³）—— 在目标温度/频率/B 工况下查手册得到 */
  corePcv: number
  /** 波形修正系数：LLC 变压器为方波励磁，而手册曲线多为正弦标定 → 默认 1.25 */
  coreWaveK: number

  // ── 谐振电感铁损（两项默认 0 ⇒ 不计算该分项）──
  /** 谐振电感磁芯损耗密度（mW/cm³），查 Lr 磁芯手册 */
  lrCorePcv: number
  /** 谐振电感磁芯有效体积（cm³） */
  lrCoreVe: number

  // ── 谐振电容：损耗角正切法 vs 直接给 ESR ──
  /** 'df'：由损耗角正切推算等效 ESR（推荐，规格书一般只给 DF）；'esr'：直接给 ESR */
  crEsrMode: 'df' | 'esr'
  /** Cr 在 1 kHz 下的损耗角正切（规格书常给值，如 0.001） */
  crDf1k: number
  /** 损耗角正切由 1 kHz 折算到开关频率的修正倍数（100 kHz 常见 ≈2） */
  crDfK: number
}

/** 损耗分项（用于饼图 / 横向柱图） */
export interface LossBreakdown {
  name: string
  value: number
  color: string
}
