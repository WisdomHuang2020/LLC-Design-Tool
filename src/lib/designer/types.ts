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
  /** Q 裕量系数：q = qMargin · min(qmax1,qmax2,qmax3)，默认 0.95 */
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
  /** Q 裕量系数：q = qMargin · min(qmax1,qmax2,qmax3)；旧存档可能缺此字段，用时应兜底 0.95 */
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
  irRms: number
  imRms: number
  /**
   * 关断时刻励磁电流峰值 Im,off（A）。
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
  mosfetTr: number // ns
  mosfetTf: number // ns
  mosfetCoss: number // pF @ 0V
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
  rectVf: number // V
  syncRectRdsOn: number // mΩ
  lrDcr: number // mΩ
  crEsr: number // mΩ
}

/** 损耗分项（用于饼图 / 横向柱图） */
export interface LossBreakdown {
  name: string
  value: number
  color: string
}
