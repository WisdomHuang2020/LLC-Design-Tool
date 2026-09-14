// LLC 设计工具 —— 设计计算引擎
// 纯函数：输入规格 + 器件参数 → 计算结果 / 跨页投影 / 优化建议。
// 本文件由 pages/Designer.tsx 的 handleCalculate 逐行搬移而来，数学部分未做任何改动。
import type { DesignParameters, CalculatedResults } from '../DesignContext'
import type { CalculatedData, LossParameters, Suggestion } from './types'
import { gainM, peakGain, zvsPhase } from './llcMath'
import { generateSuggestions } from './suggestions'

export interface DesignComputation {
  /** 结果展示层使用的完整计算结果 */
  data: CalculatedData
  /** 跨页面共享的结果投影（写入 DesignContext 与本地存储） */
  results: CalculatedResults
  /** 优化建议；设计不可行时会在首位插入一条 critical 告警 */
  suggestions: Suggestion[]
}

export function computeDesign(form: DesignParameters, lossParams: LossParameters): DesignComputation {
  const vinNom = form.vinNom
  const vout = form.vout
  const pout = form.pout
  const fsw = form.fsw * 1000
  const topology = form.topology
  const rectifier = form.rectifier
  const efficiency = form.efficiency
  const vinMin = form.vinMin
  const vinMax = form.vinMax
  const vd = form.vd
  const cossEq = form.cossEq * 1e-12  // pF -> F
  const cossEr = form.cossEr * 1e-12  // pF -> F
  const cj = form.cj * 1e-12          // pF -> F
  const td = form.td * 1e-9           // ns -> s
  const loadMin = form.loadMin

  const voutEff = vout + vd  // 考虑二极管压降的有效输出电压

  // ─── 步骤1：确定电感比k（k=Lm/Lr）───
  // k为预设值，典型范围3~10
  const k = form.k

  // ─── 步骤2：计算匝比n ───
  // 标准FHA方法：谐振频率处增益 = 1，不使用虚拟增益
  const n =
    topology === 'half-bridge'
      ? vinNom / (2 * voutEff)
      : vinNom / voutEff

  // ─── 步骤3：计算增益范围（归一化到谐振频率=1）───
  // Gmax/Gmin 基于标准FHA方法：谐振频率处增益 = 1
  // 不包含Mv，谐振频率处归一化增益为1
  const gMax = vinNom / vinMin
  const gMin = vinNom / vinMax
  const gNom = 1.0  // 谐振频率处归一化增益为1

  // 空载Region 1增益（fn>1，Q→0时增益趋向 1+1/k）
  // 注：在Region 2（fn<1）空载增益理论上无穷大，此处给出Region 1工程参考值
  const gmaxEmpty = 1 + 1 / k

  // k的最大值：满足空载增益 >= Gmax 的约束上限
  // 空载增益 G_empty = 1 + 1/k >= Gmax  =>  1/k >= Gmax - 1  =>  k <= 1/(Gmax - 1)
  // 因此 k_max 是 k 的上限，k 越小空载增益裕量越大
  const kMax = 1 / Math.max(1e-6, gMax - 1)

  // ─── 步骤4：计算Qmax ───
  const fr = fsw  // 设谐振频率fr = fsw

  // 等效AC电阻：匝比n已用Vout+Vd计算，因此Rac使用实际输出电压Vout
  const rac = (8 * n * n * vout * vout) / (Math.PI * Math.PI * pout)

  // 最小负载对应的Rac（负载越轻，等效电阻越大）
  const pMin = pout * (loadMin / 100)
  const racMin = rac * (pout / pMin)

  // Qmax1：峰值增益约束（Gmax为归一化增益，peakGain直接比较）
  function findQmax1(kVal: number, targetGain: number): number {
    let lowQ = 0.001
    let highQ = 5.0
    const tolerance = 0.001
    for (let iter = 0; iter < 50; iter++) {
      const midQ = (lowQ + highQ) / 2
      const peakM = peakGain(kVal, midQ)
      if (peakM > targetGain) {
        lowQ = midQ
      } else {
        highQ = midQ
      }
      if (highQ - lowQ < tolerance) break
    }
    return (lowQ + highQ) / 2
  }
  const qmax1 = findQmax1(k, gMax)

  // Qmax2：ZVS条件（死区时间），基于能量守恒推导
  // 系数 16 来源于半桥 LLC 死区时间近似公式 t_dead = 16·C_eq·f_r·L_m 的反推
  // 若拓扑为全桥或死区定义不同，该系数需重新推导
  // fmax估计：基于空载增益公式 fn² = G/(G*(k+1)-k)，仅当 gMin >= k/(k+1) 时可行
  const region1MinGain = k / (k + 1)
  const fmaxFeasible = gMin >= region1MinGain
  const fmaxEst = fmaxFeasible
    ? fr * Math.sqrt(Math.max(0.001, gMin / Math.max(1e-9, gMin * (k + 1) - k)))
    : Infinity
  // Coss 参数区分：
  // - cossEq：等效输出电容（用于 ZVS 死区时间 / qmax2）
  // - cossEr：能量相关电容（用于 ZVS 能量 / qmax3 及后续能量校验）
  const cossZvs = Math.max(1e-12, 2 * cossEq + cj)  // 保护：最小1pF = 1e-12 F
  const cossTotal = Math.max(1e-12, 2 * cossEr + cj)

  // Qmax2：ZVS条件（死区时间），基于能量守恒推导
  // 系数 16 来源于半桥 LLC 死区时间近似公式 t_dead = 16·C_eq·f_r·L_m 的反推
  // 若拓扑为全桥或死区定义不同，该系数需重新推导
  const qmax2 = fmaxFeasible
    ? ((k + 1) * vinMin * vinMin / Math.max(1e-15, 16 * fmaxEst * fmaxEst * k * k * cossZvs * vinMax * vinMax)) * (2 * Math.PI * fr) / Math.max(1e-6, racMin)
    : Infinity

  // Qmax3：ZVS 能量约束（由励磁电感储能 ≥ Coss 总能量推导出的 Q 上限）
  // 推导：Lm = k·Lr = k·Q·Rac_min/(2π fr) 必须满足
  //   0.5·Lm·(Vin_min/(coeff·fmax·Lm))² ≥ 0.5·Coss_total·Vin_max²
  // 其中 coeff = 8（半桥）/ 4（全桥），与后续 ZVS 能量校验一致。
  const zvsCoeff = topology === 'half-bridge' ? 8 : 4
  const qmax3 = fmaxFeasible
    ? (2 * Math.PI * fr * vinMin * vinMin)
      / Math.max(1e-15,
          zvsCoeff * zvsCoeff * fmaxEst * fmaxEst * k * cossTotal * vinMax * vinMax * Math.max(1e-6, racMin))
    : Infinity

  // 取Qmax，留95%裕量
  const qmax = Math.max(0.001, Math.min(qmax1, qmax2, qmax3))
  const q = Math.max(0.001, qmax * 0.95)

  // ─── 步骤5：计算谐振参数 ───
  const zr = q * Math.max(1e-6, racMin)
  const lr = zr / Math.max(1e-6, 2 * Math.PI * fr)
  const cr = 1 / Math.max(1e-15, 2 * Math.PI * fr * zr)
  const lm = k * lr

  // ─── 步骤6：验证 ───
  // fmax/fmin：从空载增益公式精确推导
  // fmax 对应 Region 1（fn>1），要求 gMin >= k/(k+1)
  const fmax = fmaxFeasible
    ? fr * Math.sqrt(Math.max(0.001, gMin / Math.max(1e-9, gMin * (k + 1) - k)))
    : Infinity
  // fmin 对应 Region 2（fn<1），分母为 -k
  const fmin = fr * Math.sqrt(Math.max(0.001, gMax / Math.max(1e-9, gMax * (k + 1) - k)))

  // 整体设计可行性
  const designFeasible = fmaxFeasible && k <= kMax

  // ZVS能量验证
  // 只有励磁电感 Lm 中的储能参与ZVS，Lr 在死区时间内与 Cr 谐振，不贡献ZVS能量
  // 半桥谐振腔电压幅值为 Vin/2，因此分母为 8*f*Lm；全桥为 4*f*Lm
  const fmaxZvs = Number.isFinite(fmax) ? fmax : fr
  const imDeadtime = vinMin / Math.max(1e-9, (topology === 'half-bridge' ? 8 : 4) * fmaxZvs * lm)
  const er = 0.5 * lm * imDeadtime * imDeadtime
  const ec = 0.5 * cossTotal * vinMax * vinMax
  const zvsMargin = er >= ec

  // ZVS时间验证：死区时间内是否完成充放电
  // t_zvs = 2*Coss*Vds / Im，需要 t_zvs <= td
  const tZvs = cossTotal * vinMax / Math.max(1e-9, imDeadtime)
  const zvsTimeOk = tZvs <= td

  // ZVS相位（在fr处）
  const zvsPhaseDeg = zvsPhase(k, q)

  // ─── 步骤7：电流计算 ───
  const io = pout / Math.max(1e-6, vout)

  // 次级电流
  // 中心抽头：每个绕组电流是半波正弦，峰值 = π·Io/2，有效值 = 峰值/2 = π·Io/4
  // 全波：isRms = π·Io/(2√2) ≈ 1.11·Io
  let isRms: number
  if (rectifier === 'center-tapped' || rectifier === 'sync-center-tapped') {
    isRms = (Math.PI / 4) * io
  } else {
    isRms = (Math.PI / (2 * Math.sqrt(2))) * io
  }

  // 初级谐振电流（在谐振频率处，Zr=0，总阻抗≈Rac）
  // 初级电压基波分量幅值：半桥 2Vin/π，全桥 4Vin/π
  // vFund 是幅值，irRms 应使用有效值 = vFund / (√2 · rac)
  const vFund =
    topology === 'half-bridge'
      ? vinNom * 2 / Math.PI
      : vinNom * 4 / Math.PI
  const irRms = vFund / (Math.sqrt(2) * rac)

  // 励磁电流（在fr处，近似）
  const vLm = topology === 'half-bridge' ? vinNom / 2 : vinNom
  const imRms = vLm / (4 * Math.sqrt(3) * fr * lm)

  // 初级总电流
  const ipRms = Math.sqrt(irRms * irRms + imRms * imRms)

  // ─── 步骤8：设计增益曲线数据 ───
  // 生成当前设计参数的增益曲线数据
  const gainCurveData: Array<{ fn: number; m: number }> = []
  for (let fn = 0.2; fn <= 2.0; fn += 0.01) {
    gainCurveData.push({
      fn: parseFloat(fn.toFixed(2)),
      m: gainM(fn, k, q),
    })
  }

  // 变压器峰值磁密（用于结果展示与磁芯损耗校验）
  const aeM2 = lossParams.coreAe * 1e-6
  const bPeak =
    (vinNom / (topology === 'half-bridge' ? 2 : 1)) /
    (4 * fsw * lossParams.primaryTurns * aeM2)

  const mMaxVal = peakGain(k, q)

  const data: CalculatedData = {
    n,
    fr,
    lr,
    cr,
    lm,
    q,
    k: k,
    mMax: mMaxVal,
    mRequired: gMax,
    mRequiredMin: gMin,
    zvsMargin,
    zvsTimeOk,
    tZvs,
    zvsPhase: zvsPhaseDeg,
    ipRms,
    irRms,
    imRms,
    bPeak,
    isRms,
    vinNom,
    vout,
    pout,
    fsw,
    efficiency,
    vinMin,
    vinMax,
    topology,
    rectifier,
    rac,
    zr,
    fmax,
    fmin,
    gmaxEmpty,
    zvsEr: er,
    zvsEc: ec,
    qmax1,
    qmax2,
    qmax3,
    gMin,
    gMax,
    gNom,
    designFeasible,
    kMax,
    gainCurveData,
  }

  const s = generateSuggestions(form, {
    q,
    k: k,
    mMax: mMaxVal,
    mRequired: gMax,
    mRequiredMin: gMin,
    zvsPhase: zvsPhaseDeg,
    lr,
    cr,
    lm,
    fsw,
    efficiency,
    qmax1,
    qmax2,
    qmax3,
    gmaxEmpty,
    zvsMargin,
    zvsTimeOk,
    tZvs,
    er,
    ec,
    fmax,
    fmin,
    kMax,
  })

  if (!designFeasible) {
    const kTooLarge = k > kMax
    s.unshift({
      text: kTooLarge
        ? `电感比k=${k.toFixed(2)}超过空载增益约束上限k_max=${kMax.toFixed(2)}，设计不可行。空载增益裕量不足，当前设计在最低输入电压下可能无法达到额定输出。建议减小k至≤${kMax.toFixed(2)}或提高最低输入电压。`
        : `高输入电压下所需最小增益 Gmin=${gMin.toFixed(3)} 低于 Region 1 空载极限 k/(k+1)=${region1MinGain.toFixed(3)}，当前 k 无法满足。请增大电感比 k 或缩窄输入电压上限。`,
      level: 'critical',
    })
  }

  // 跨页面共享的结果投影（字段与 CalculatedResults 一一对应）
  const results: CalculatedResults = {
    n,
    fr,
    lr,
    cr,
    lm,
    q,
    k: k,
    mMax: mMaxVal,
    mRequired: gMax,
    zvsMargin,
    ipRms,
    isRms,
    fmax,
    fmin,
    gmaxEmpty,
    zvsEr: er,
    zvsEc: ec,
    qmax1,
    qmax2,
    qmax3,
    gMin,
    gMax,
    gNom,
    rac,
    zr,
    irRms,
    imRms,
    bPeak,
    zvsTimeOk,
    tZvs,
    designFeasible,
    kMax,
    gainCurveData,
  }

  return { data, results, suggestions: s }
}
