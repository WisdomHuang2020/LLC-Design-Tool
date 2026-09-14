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
  gMin: number
  gMax: number
  gNom: number
  designFeasible: boolean
  kMax: number
  // 新增字段
  zvsTimeOk: boolean
  tZvs: number
  irRms: number
  imRms: number
  bPeak: number
  gainCurveData: Array<{ fn: number; m: number }>
}

/** 损耗模型输入参数 */
export interface LossParameters {
  mosfetRdsOn: number // mΩ
  mosfetTr: number // ns
  mosfetTf: number // ns
  mosfetCoss: number // pF @ 0V
  mosfetVsd: number // V body diode
  deadTime: number // ns
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
