// LLC 设计工具 —— 磁芯材料库（让「磁芯材料」下拉真正参与磁损计算）
//
// 背景：此前 `coreMaterial` 只是个标签，不参与任何计算（换牌号磁损不变）——
//       本模块把它变成**参数预设**：切换材料时填充 P_cv 与 Steinmetz 系数，之后仍可手工微调。
//
// ★ 数值口径（v2.10.129 定稿）：
//   · `pcvRef` = 参考点损耗密度，条件**统一为工作温度 100 ℃ + 100 kHz、200 mT、正弦励磁**，单位 mW/cm³。
//     ⚠️ **必须同一温度**：PC40 在 25 ℃ 是 600、100 ℃ 只有 410 —— 混温度会算出错比例
//     （初版就因此把 PC95/PC40 算成 48%，正确约 71%）。
//   · **出处（逐项可查）**：
//     - TDK：**《Mn-Zn 系铁氧体 材质特性》**，TDK 股份有限公司编制，文档编号
//       `20260420 / ferrite_material_characteristics_zh`，封面版次 **April 2026**，共 18 页，
//       PDF 内嵌创建/修改时间 **2026-04-20 16:48:15 (+09:00)**（文件名 `tdk_material.pdf`）。
//       取数页：**p3「材质特性一览」**（开关电源用）+ **p4「开关电源用 PC95 系列 ■材质特性」**
//       （试验样品 T20×5×10，条件 100 kHz / 200 mT 正弦）。
//       ⇒ 100 ℃ 列：PC40 **420**、PC44 **300**、PC47 **250**、PC95 **280**、PC90 **320**。**本站据此取值**。
//       ⚠️ TDK 另有《材质标准特性表（变压器・扼流圈用）》给 PC40 410 / PC95 290（PC44/PC47/PC90 一致）。
//          **两份均为 TDK 官方、数值不等，差异源于测量版本**；本站**统一采用上表 20260420 版**
//          （其 PC95 覆盖 25/60/100/120 ℃ 四档，温度信息更全）。换版本时须重核并把结论写回这里。
//     - Ferroxcube：**官方材料册**（ferroxcube.com 下载页，id 94 = 3C95/3C97、id 90 = 3C96/3C98）——
//       3C95 **290**、3C96 **300**、3C97 **320**、3C98 **250**（100 ℃/100 kHz/200 mT），已逐项与手册表格核对一致；
//       3C90 **450** / 3C94 **350** 来自 Ferroxcube 材料表（经其代理商页面转载），标注为 `vendor-table`。
//   · ⚠️ **不在官方材质表内的牌号一律不预设**：PC45、PC46（TDK 现行表未列）与 Epcos N87/N97（未查到同条件
//     官方数据）均已移除 —— **宁可留空也不编**，这类材料走「自定义 / 其他牌号」按手册手填。
//   · ⚠️ **温度曲线形状**：PC47 的损耗谷在 100 ℃ 附近（250，本表最低）；PC95 是"全程低"（100 ℃ 时 280）。
//     选型要看实际工作温度区间，别只比一个点。
//   · **PC95 温度序列（与 `pcvRef` 同源，取自上面那份 TDK 20260420 原件 p4）**：
//     **25 / 60 / 100 / 120 ℃ = 350 / 300 / 280 / 330**。谷值在 100 ℃，两端各升约 18~25%，
//     这正是 PC95「宽温平坦」的体现，也是它相对 PC47/PC44（谷更深、但只窄温区好）的差异所在。
//   ⚠️ **note 里写温度序列时必须与 `pcvRef` 同源**：曾给 PC95 抄过《材质标准特性表》的
//      「25/100/120 ℃ = 350/290/350」（100 ℃ 写 290、且无 60 ℃），与本表 pcvRef 不一致 ⇒ 界面自相矛盾。
//     判别要点：**本站采用的 20260420 版里 PC95 是 25/60/100/120 四档、100 ℃ = 280**；
//      凡出现「100 ℃ = 290」或「只有三格、无 60 ℃」的序列，都来自另一份文档，**不要混用**。
//   · `alpha`/`beta` 是 Steinmetz 指数（f 用 kHz、B 用 mT 口径），典型范围 α≈1.3~1.7、β≈2.4~2.9；
//     Steinmetz 系数 `Cm` **由 pcvRef 反推**（`steinmetzCm()`），使两条口径在参考点自洽、可互校。
import type { LossParameters } from './types'

export interface CoreMaterial {
  /** 下拉框用的标识，同时也是 LossParameters.coreMaterial 的取值 */
  id: string
  /** 厂牌 + 牌号 */
  name: string
  family: string
  /** 参考点损耗密度 mW/cm³（100 kHz、200 mT、100 ℃、正弦） */
  pcvRef: number
  /** Steinmetz 指数（f: kHz、B: mT 口径） */
  alpha: number
  beta: number
  /** 数据核对状态：official = 厂商官方文档逐项核对；vendor-table = 厂商材料表（经转载）； */
  verified: 'official' | 'vendor-table'
  /** 出处（文档名） */
  source: string
  note?: string
}

export const CORE_MATERIALS: CoreMaterial[] = [
  { id: 'PC40', name: 'PC40', family: 'TDK MnZn', pcvRef: 420, alpha: 1.35, beta: 2.5, verified: 'official', source: 'TDK《Mn-Zn系铁氧体 材质特性》20260420 版 p3/p4（100 ℃/100 kHz/200 mT 正弦）', note: '通用牌号，损耗偏高、价格低' },
  { id: 'PC44', name: 'PC44', family: 'TDK MnZn', pcvRef: 300, alpha: 1.35, beta: 2.5, verified: 'official', source: 'TDK《Mn-Zn系铁氧体 材质特性》20260420 版 p3（100 ℃/100 kHz/200 mT 正弦）', note: '损耗谷在 100 ℃ 附近' },
  { id: 'PC47', name: 'PC47', family: 'TDK MnZn', pcvRef: 250, alpha: 1.4, beta: 2.6, verified: 'official', source: 'TDK《Mn-Zn系铁氧体 材质特性》20260420 版 p3（100 ℃/100 kHz/200 mT 正弦）', note: '100 ℃ 单点损耗最低（谷温在 100 ℃ 附近）' },
  { id: 'PC95', name: 'PC95', family: 'TDK MnZn', pcvRef: 280, alpha: 1.4, beta: 2.5, verified: 'official', source: 'TDK《Mn-Zn系铁氧体 材质特性》20260420 版 p4（100 ℃/100 kHz/200 mT 正弦）', note: '宽温低损耗：25/60/100/120 ℃ = 350/300/280/330（100 ℃ 谷值，工作温区内损耗平坦），站内默认' },
  { id: 'PC90', name: 'PC90', family: 'TDK MnZn', pcvRef: 320, alpha: 1.4, beta: 2.5, verified: 'official', source: 'TDK《Mn-Zn系铁氧体 材质特性》20260420 版 p3（100 ℃/100 kHz/200 mT 正弦）', note: '高 Bs、低损耗' },
  { id: '3C90', name: '3C90', family: 'Ferroxcube MnZn', pcvRef: 450, alpha: 1.35, beta: 2.5, verified: 'vendor-table', source: 'Ferroxcube 材料表（经代理转载）', note: '损耗谷在 100 ℃' },
  { id: '3C94', name: '3C94', family: 'Ferroxcube MnZn', pcvRef: 350, alpha: 1.4, beta: 2.6, verified: 'vendor-table', source: 'Ferroxcube 材料表（经代理转载）', note: '低成本低损耗牌号' },
  { id: '3C95', name: '3C95', family: 'Ferroxcube MnZn', pcvRef: 290, alpha: 1.4, beta: 2.6, verified: 'official', source: 'Ferroxcube《3C95/3C97》官方材料册', note: '宽温（25/100 ℃ = 350/290）' },
  { id: '3C96', name: '3C96', family: 'Ferroxcube MnZn', pcvRef: 300, alpha: 1.4, beta: 2.6, verified: 'official', source: 'Ferroxcube《3C96, 3C98》官方材料册', note: '损耗谷在 100 ℃' },
  { id: '3C97', name: '3C97', family: 'Ferroxcube MnZn', pcvRef: 320, alpha: 1.45, beta: 2.7, verified: 'official', source: 'Ferroxcube《3C95/3C97》官方材料册', note: '60/100/140 ℃ = 320/320/380，谷温宽' },
  { id: '3C98', name: '3C98', family: 'Ferroxcube MnZn', pcvRef: 250, alpha: 1.45, beta: 2.7, verified: 'official', source: 'Ferroxcube《3C96, 3C98》官方材料册', note: '损耗谷在 100 ℃' },
  { id: 'custom', name: '自定义 / 其他牌号', family: '—', pcvRef: 300, alpha: 1.4, beta: 2.5, verified: 'vendor-table', source: '—', note: '保留当前填写的参数；表内没有的牌号（PC45/PC46/N87/N97 等）请按手册手填 P_cv 与系数' },
]


export function coreMaterialById(id: string): CoreMaterial | undefined {
  return CORE_MATERIALS.find((m) => m.id === id)
}

/** 参考点：100 kHz、200 mT */
export const PCV_REF_F_KHZ = 100
export const PCV_REF_B_MT = 200

/**
 * 折算 Lr 磁芯损耗密度时假定的 **Lr 工作磁密**（T）。
 * 谐振电感通常比变压器小一档、磁密更低，取 0.165 T 作为典型量级；
 * 这只是量级假设 —— 实际须按 Lr 所用磁芯的 Ae、匝数与实测 B 重算。
 */
export const LR_CORE_B_T = 0.165

/**
 * 由某牌号的参考点损耗密度，按 B^β 折算到 Lr 工作磁密，得到 **Lr 磁芯的 P_cv**（mW/cm³）。
 *   P_cv,Lr = P_cv,ref × (B_Lr / B_ref)^β
 * 例：PC95（280 @0.2 T、β=2.5）⇒ 280×(0.165/0.2)^2.5 ≈ 173。
 * ⚠️ 必须**随所选牌号**折算（β 也随牌号取），不能写死成某个牌号的值。
 */
export function lrCorePcvFrom(m: CoreMaterial): number {
  return Math.round(m.pcvRef * Math.pow(LR_CORE_B_T / (PCV_REF_B_MT / 1000), m.beta))
}

/**
 * 由参考点损耗密度反推 Steinmetz 系数 Cm，使
 *   P = Cm·f^α·B^β  在 (100 kHz, 200 mT) 处恰等于 pcvRef
 * ⇒ Cm = pcvRef / (f_ref^α · B_ref^β)。单位沿用站内约定（f: kHz、B: mT、结果 mW/cm³）。
 */
export function steinmetzCm(m: CoreMaterial): number {
  return m.pcvRef / (Math.pow(PCV_REF_F_KHZ, m.alpha) * Math.pow(PCV_REF_B_MT, m.beta))
}

/**
 * 切换磁材：把该牌号的预设参数写进损耗参数（P_cv 与 Steinmetz 三系数，以及 Lr 磁芯 P_cv）。
 * `'custom'` 保留用户当前数值不动 —— 便于"我知道自己在填什么"的场景。
 */
export function applyCoreMaterial(params: LossParameters, id: string): LossParameters {
  const m = coreMaterialById(id)
  if (!m || m.id === 'custom') return { ...params, coreMaterial: id }
  return {
    ...params,
    coreMaterial: id,
    corePcv: m.pcvRef,
    coreAlpha: m.alpha,
    coreBeta: m.beta,
    coreK: steinmetzCm(m),
    // Lr 磁芯与变压器磁芯同牌号 ⇒ Lr 的 P_cv 也要跟着折算，否则换了牌号而 Lr 损耗纹丝不动
    lrCorePcv: lrCorePcvFrom(m),
  }
}

/** 当前材料是否为库内牌号（用于界面判断"参数是否被改过"） */
export function materialPresetMatches(params: LossParameters): boolean {
  const m = coreMaterialById(params.coreMaterial)
  if (!m || m.id === 'custom') return false
  return (
    Math.abs(params.corePcv - m.pcvRef) < 1e-9 &&
    Math.abs(params.coreAlpha - m.alpha) < 1e-9 &&
    Math.abs(params.coreBeta - m.beta) < 1e-9 &&
    Math.abs(params.coreK - steinmetzCm(m)) < 1e-15
    // 注：**不**在这里比对 lrCorePcv —— 「已被手工修改」的提示挂在各自字段旁，
  )
}
