// LLC 设计工具 —— 设计计算引擎
// 纯函数：输入规格 + 器件参数 → 计算结果 / 跨页投影 / 优化建议。
// 本文件由 pages/Designer.tsx 的 handleCalculate 逐行搬移而来，数学部分未做任何改动。
import type { DesignParameters, CalculatedResults } from '../DesignContext'
import type { CalculatedData, LossParameters, Suggestion } from './types'
import { gainM, peakGain, zvsPhase, fullLoadGainCrossing, magnetizingCurrentOffPeak, qmax1Boundary, qmax1Peak } from './llcMath'
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
  const loadMin = form.loadMin        // 最小负载（%），用于轻载增益曲线

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

  // 空载Region 1增益下限（fn→∞，Q→0时增益趋向 k/(k+1)）
  // 注：Region 2（fn<1/√(1+k)）空载增益在 fr2 处理论上趋于无穷大
  const gmaxEmpty = k / (k + 1)

  // k 的上限：最高输入电压空载时必须能把增益压到 Gmin
  // Region 1 空载增益下限 k/(k+1) ≤ Gmin  =>  k ≤ Gmin/(1-Gmin)
  // （与 fmaxFeasible 条件等价；Gmin ≥ 1 时该约束不存在）
  const kMax = gMin < 1 ? gMin / Math.max(1e-6, 1 - gMin) : Infinity

  // ─── 步骤4：计算Qmax ───
  const fr = fsw  // 设谐振频率fr = fsw

  // 等效AC电阻：匝比n已用Vout+Vd计算，因此Rac使用实际输出电压Vout
  // Q = Zr/Rac 按满载定义（标准设计方法：峰值增益能力由满载最坏情况决定，
  // 轻载 Q 减小、峰值增益自动更高，无需额外校验）
  const rac = (8 * n * n * vout * vout) / (Math.PI * Math.PI * pout)

  // Qmax1：增益能力约束。两条判据二选一（v2.10.96 起默认取**感容分界判据**）：
  //   · boundary（默认／推荐）：分界点增益 Mbnd = Gmax。峰顶在分界点左侧（容性区），
  //     感性区内增益最大值出现在分界点，故只有这条判据能保证「感性区内真的够得着 Gmax」。
  //     峰值判据只看增益数值达标，但那个峰值点本身已位于容性区，不允许作为工作点。
  //   · peak（旧口径）：峰顶 Mpeak = Gmax，仅保证增益数值，不保证感性区。
  // 分界判据要求 Gmax > 1（否则无分界交点），越界时自动回落到峰值判据。
  const qmax1PeakVal = qmax1Peak(k, gMax)
  const qmax1BndVal = qmax1Boundary(k, gMax)
  const useBoundary = form.qmax1Criterion !== 'peak' && Number.isFinite(qmax1BndVal)
  const qmax1Criterion: 'boundary' | 'peak' = useBoundary ? 'boundary' : 'peak'
  const qmax1 = useBoundary ? qmax1BndVal : qmax1PeakVal

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

  // Qmax2：ZVS 条件（死区时间）——「死区内把 Coss 充放电刚好用完 td」对应的 Q。
  // 按 v2.10.100 与自制计算书 V02 核对后的定论（书里叫「死区限制得出最大Q值」）：
  //   死区内励磁电流  I_{m,dead} = (V_in/2)/(4·f_max·L_m) = V_in/(γ·f_max·L_m)
  //   死区所需时间    t_dead = C_{oss,zvs}·V_in / I_{m,dead} = γ·f_max·L_m·C_{oss,zvs}
  //   ★ 上式分子分母的 V_in 精确相消 ⇒ t_dead 与输入电压无关，**不能用 2π·f·Lm·C 之外的 V_in 因子**。
  //     （旧实现写成 (k+1)V_in,min²/(16 f_max²k²C V_in,max²)：反推所需死区 4.6 µs ≫ td=300 ns，
  //      即那条式根本没有编码死区约束，数值虚大 15 倍、从不成为约束，属错误式。）
  //   令 t_dead = td 并代入 L_m = k·Q·R_ac/(2π f_r1) 即得下式。
  // 与计算书 V02 逐位复核：k=4、R_ac=337.737 Ω、C_oss,zvs=170 pF、f_max=111.803 kHz、td=300 ns
  //   ⇒ 本站 0.917631 vs 计算书 0.918 ✓（同时反代 Q=0.918 得 t_dead=300.2 ns=td，自洽）。
  const zvsCoeff = topology === 'half-bridge' ? 8 : 4
  const qmax2 = fmaxFeasible
    ? (2 * Math.PI * fr * td) / Math.max(1e-15, zvsCoeff * k * Math.max(1e-6, rac) * cossZvs * fmaxEst)
    : Infinity

  // Qmax3：ZVS 能量约束（由励磁电感储能 ≥ Coss 总能量推导出的 Q 上限）
  // 推导：Lm = k·Lr = k·Q·Rac/(2π fr) 必须满足
  //   0.5·Lm·(Vinmin/(coeff·fmax·Lm))² ≥ 0.5·Coss,total·Vin_max²
  // 其中 coeff = 8（半桥）/ 4（全桥），与后续 ZVS 能量校验一致。
  const qmax3 = fmaxFeasible
    ? (2 * Math.PI * fr * vinMin * vinMin)
      / Math.max(1e-15,
          zvsCoeff * zvsCoeff * fmaxEst * fmaxEst * k * cossTotal * vinMax * vinMax * Math.max(1e-6, rac))
    : Infinity

  // 取 Qmax，再按用户设定的裕量系数折减，得到实际设计 Q。
  // 裕量系数 m ∈ (0,1]：m 越小 → Q 越小 → 峰值增益能力更强、ZVS 能量与 ZVS 时间裕量都更大
  // （Er ∝ 1/Lm ∝ 1/Q，tZVS ∝ Lm ∝ Q）；代价是 Zr = Q·Rac 更小 ⇒ Lr 更小、Cr 更大，
  // 励磁环流占比与导通损耗上升。默认 m = 0.95。
  // 三条约束现在的分工（v2.10.100 起 qmax2 已含死区时间 td）：
  //   qmax1 → 增益能力（感性区够不够 Gmax）；qmax2 → 死区时间（t_dead ≤ td）；
  //   qmax3 → ZVS 能量（Er ≥ Ec）。qmax2 生效时 t_dead = m·td ≤ td 恒成立，
  //   后续 zvsTimeOk 退化为一致性复核；若 zvsTimeOk 报错（qmax2 未生效的情形），
  //   正确做法仍是**调小** m（而非调大）。
  const qmax = Math.max(0.001, Math.min(qmax1, qmax2, qmax3))
  const qMargin = Number.isFinite(form.qMargin)
    ? Math.min(1, Math.max(0.05, form.qMargin))
    : 0.95
  const q = Math.max(0.001, qmax * qMargin)

  // ─── 步骤5：计算谐振参数 ───
  // Zr = Q·Rac（满载定义）
  const zr = q * Math.max(1e-6, rac)
  const lr = zr / Math.max(1e-6, 2 * Math.PI * fr)
  const cr = 1 / Math.max(1e-15, 2 * Math.PI * fr * zr)
  const lm = k * lr

  // ─── 步骤6：验证 ───
  // fmax：从空载增益公式精确推导，对应 Region 1（fn>1），要求 gMin >= k/(k+1)
  const fmax = fmaxFeasible
    ? fr * Math.sqrt(Math.max(0.001, gMin / Math.max(1e-9, gMin * (k + 1) - k)))
    : Infinity
  // fmin：由**满载**增益曲线与 M=Gmax 的交点给出（取感性区一侧）。
  // 满载 + 最低母线是调频下限的最坏情况；轻载在同一增益要求下所需频率更高，不会更低。
  // 注：空载公式 M=Gmax 有两个根，其中 Region 2 根（fn < 1/√(1+k)）落在容性区、不可工作，
  //     仅代空载公式会把它误当成"最低频率"，故此处改用满载曲线（峰值频率右侧的交点）。
  const fmin = fr * fullLoadGainCrossing(k, q, gMax)

  // 整体设计可行性
  const designFeasible = fmaxFeasible && k <= kMax

  // ZVS能量验证
  // 只有励磁电感储能参与 ZVS 换流；死区期间 Lr 与 Lm 串联流过同一电流 i_m，
  // 故可用能量取 ½·Lm·i_m² （保守口径，与计算书 V02 的 ½(Lm+Lr)·i_m² 相比小 (Lm+Lr)/Lm = 1+1/k 倍）。
  // 两侧各取最坏输入：Er 用 V_in,min（励磁电流最小）、Ec 用 V_in,max（需要搬的电荷最多）——
  // 这一配对比计算书 V02 更严格（书里 Er/Ec 都用额定 V_in=400 V）。
  // 半桥谐振腔电压幅值为 Vin/2，因此分母为 8*f*Lm；全桥为 4*f*Lm
  const fmaxZvs = Number.isFinite(fmax) ? fmax : fr
  const imDeadtime = magnetizingCurrentOffPeak(vinMin, fmaxZvs, lm, topology)
  const er = 0.5 * lm * imDeadtime * imDeadtime
  const ec = 0.5 * cossTotal * vinMax * vinMax
  const zvsMargin = er >= ec

  // ZVS 时间验证：死区内是否能完成 Coss,zvs 充放电，需要 t_ZVS ≤ td
  //   t_ZVS = C_{oss,zvs}·V_in / I_{m,off}(V_in) = γ·f_max·Lm·C_{oss,zvs}
  // ★ 分子分母都是同一个 V_in 下的量，V_in 精确相消 ⇒ t_ZVS **与输入电压无关**。
  //   旧实现写成 C_{oss,total}·V_in,max / I_{m,off}(V_in,min)：分子取最高输入、分母取最低输入，
  //   两个不同工况混用，被虚增 V_in,max/V_in,min 倍（默认 1.105 倍），且误用了能量口径电容。
  // 与计算书 V02 复核：γ=8、f_max=111.803 kHz、Lm=1652.4 µH、C_oss,zvs=170 pF
  //   ⇒ 本站 251.248 ns vs 计算书 T_d_max 251.248 ns ✓（逐位一致）
  const tZvs = zvsCoeff * fmaxZvs * lm * cossZvs
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

  // 原边谐振电流（在谐振频率处，Zr=0，总阻抗≈Rac）
  // 原边电压基波分量幅值：半桥 2Vin/π，全桥 4Vin/π
  // vFund 是幅值，irRms 应使用有效值 = vFund / (√2 · rac)
  const vFund =
    topology === 'half-bridge'
      ? vinNom * 2 / Math.PI
      : vinNom * 4 / Math.PI
  const irRms = vFund / (Math.sqrt(2) * rac)

  // 励磁电流（在fr处，近似）
  const vLm = topology === 'half-bridge' ? vinNom / 2 : vinNom
  const imRms = vLm / (4 * Math.sqrt(3) * fr * lm)

  // 原边总电流
  const ipRms = Math.sqrt(irRms * irRms + imRms * imRms)

  // ─── 步骤8：设计增益曲线数据 ───
  // 满载曲线：Q = Zr/Rac（低输入电压所需最大增益的最坏情况）
  // 最小负载曲线：负载越轻，等效电阻越大（Rac_light = Rac·Pout/Pmin）、Q 越低、增益越高，
  // 用于轻载/空载校核（高输入电压下增益是否可压至 Gmin）
  const pMin = pout * (loadMin / 100)
  const racLight = pMin > 0 ? rac * (pout / pMin) : rac
  const qLight = zr / Math.max(1e-6, racLight)
  const gainCurveData: Array<{ fn: number; m: number; mLight: number }> = []
  for (let fn = 0.2; fn <= 2.0; fn += 0.01) {
    gainCurveData.push({
      fn: parseFloat(fn.toFixed(2)),
      m: gainM(fn, k, q),
      mLight: gainM(fn, k, qLight),
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
    td,
    cossEr: form.cossEr, // 能量相关等效电容（pF，单管）——供损耗模型的硬开关 Coss 损耗取用（单一来源）
    zvsPhase: zvsPhaseDeg,
    ipRms,
    irRms,
    imRms,
    imOff: imDeadtime,
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
    qmax1Criterion,
    qmax2,
    qmax3,
    qMargin,
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
    qMargin,
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
    s.unshift({
      text: `高输入电压空载时无法将增益降至所需值：Region 1 空载增益下限 k/(k+1)=${region1MinGain.toFixed(3)} > Gmin=${gMin.toFixed(3)}（等价于 k=${k.toFixed(2)} 超过上限 kmax=${Number.isFinite(kMax) ? kMax.toFixed(2) : '∞'}），设计不可行。请减小电感比 k 或缩窄输入电压上限。`,
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
