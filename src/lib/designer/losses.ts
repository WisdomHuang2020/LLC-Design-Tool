// LLC 设计工具 —— 损耗模型
// 由设计计算结果 + 器件/磁芯参数估算各项损耗与效率。
import type { CalculatedData, LossParameters, LossBreakdown } from './types'

export const defaultLossParams: LossParameters = {
  mosfetRdsOn: 30,
  mosfetTr: 15,
  mosfetTf: 10,
  mosfetCoss: 150,
  mosfetVsd: 1.2,
  deadTime: 200,
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
}

export interface LossResult {
  mosfetCond: number
  mosfetSwitchOn: number
  mosfetSwitchOff: number
  mosfetCoss: number
  mosfetDiode: number
  coreLoss: number
  bPeak: number
  windingLoss: number
  rectLoss: number
  resonantLoss: number
  totalLoss: number
  efficiency: number
  breakdown: LossBreakdown[]
}

export function calculateLosses(calc: CalculatedData, lp: LossParameters): LossResult {
  const vin = calc.vinNom
  const fsw = calc.fsw
  const ipRms = calc.ipRms
  const ipPeak = ipRms * Math.sqrt(2)
  const io = calc.pout / calc.vout
  const nSwitches = calc.topology === 'half-bridge' ? 2 : 4

  // 1. MOSFET conduction loss
  const mosfetCondPer = 0.5 * ipRms * ipRms * (lp.mosfetRdsOn / 1000)
  const mosfetCond = mosfetCondPer * nSwitches

  // ZVS 状态下开通损耗与 Coss 损耗可忽略（谐振电流在死区完成电容充放电）
  const zvsOn = calc.zvsMargin && calc.zvsTimeOk

  // 2. Switching loss (linear approximation; with ZVS Pon ideally 0)
  const switchV = vin
  const switchOn = zvsOn ? 0 : 0.5 * switchV * ipPeak * (lp.mosfetTr / 1e9) * fsw * nSwitches
  const switchOff = 0.5 * switchV * ipPeak * (lp.mosfetTf / 1e9) * fsw * nSwitches

  // 3. Coss loss (non-linear model, simplified)
  // 系数 2/3 考虑了 MOSFET 结电容 C_oss 随 V_ds 的非线性变化
  // 不同厂商/型号的 C_oss 非线性特性不同，精确损耗建议查手册 E_oss 曲线
  // ZVS 下 Coss 储能被谐振电流回收，损耗近似为 0
  const cossF = lp.mosfetCoss / 1e12
  const ecoss = 0.5 * cossF * vin * vin * (2 / 3)
  const cossLoss = zvsOn ? 0 : ecoss * fsw * nSwitches

  // 4. Body diode conduction loss (approximate dead time current = Ip_peak * 0.7)
  // 0.7 为经验系数，实际体二极管电流波形因死区时间、C_oss 充放电波形而异
  // 精确估算需时域仿真或示波器实测
  const idiode = ipPeak * 0.7
  const diodeLoss = lp.mosfetVsd * idiode * (lp.deadTime / 1e9) * fsw * nSwitches

  // 5. Transformer core loss (Steinmetz)
  // 公式: P_core = C_m * f_sw^α * B_peak^β * V_e
  // 注意: C_m 的单位基于 kHz、mT、cm³，计算结果为 mW，需 /1000 转为 W:
  //   - fsw 需要 /1000 转换为 kHz
  //   - B_peak 需要 *1000 转换为 mT
  //   - V_e 单位为 cm³
  //   - 最终结果需 /1000 转换为 W
  const aeM2 = lp.coreAe * 1e-6
  const bPeak = (vin / (calc.topology === 'half-bridge' ? 2 : 1)) / (4 * fsw * lp.primaryTurns * aeM2)
  const coreLoss = lp.coreK * Math.pow(fsw / 1e3, lp.coreAlpha) * Math.pow(bPeak * 1000, lp.coreBeta) * lp.coreVe / 1000
  const bPeakMt = bPeak * 1000

  // 6. Winding loss (DC + skin effect)
  const rdc = lp.windingRdc / 1000
  const freqRatio = fsw / 1000 / lp.skinF0
  const racFactor = 1 + freqRatio * freqRatio
  const windingLoss = ipRms * ipRms * rdc * racFactor

  // 7. Rectifier loss
  let rectLoss = 0
  const isSync = calc.rectifier === 'synchronous' || calc.rectifier === 'sync-center-tapped'
  if (isSync) {
    const rectSwitches = calc.rectifier === 'sync-center-tapped' ? 2 : 4
    const isPerSwitch = calc.isRms / Math.sqrt(2)
    rectLoss = rectSwitches * isPerSwitch * isPerSwitch * (lp.syncRectRdsOn / 1000)
  } else {
    const rectDiodes = calc.rectifier === 'center-tapped' ? 2 : 4
    const iAvgPerDiode = io / 2
    rectLoss = rectDiodes * lp.rectVf * iAvgPerDiode
  }

  // 8. Resonant element loss
  const lrLoss = ipRms * ipRms * (lp.lrDcr / 1000)
  const crLoss = ipRms * ipRms * (lp.crEsr / 1000)
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
    mosfetCoss: cossLoss,
    mosfetDiode: diodeLoss,
    coreLoss,
    bPeak: bPeakMt,
    windingLoss,
    rectLoss,
    resonantLoss,
    totalLoss,
    efficiency,
    breakdown,
  }
}
