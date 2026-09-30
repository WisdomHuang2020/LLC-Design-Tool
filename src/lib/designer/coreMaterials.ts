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
//     - TDK：**《材质标准特性表（变压器・扼流圈用）》**（100 ℃ / 100 kHz / 200 mT 正弦列）——
//       PC40 **410**、PC44 **300**、PC47 **250**、PC95 **290**、PC90 **320** ⇒ 本站据此取值。
//       ⚠️ TDK 另一份文档《Mn-Zn 系铁氧体 材质特性》官方目录（20260420）与之略有出入：
//       **PC40 给了 420、PC95 给了 280**（PC44/PC47/PC90 三档一致）—— 两份均为 TDK 官方，
//       差异源于测量版本；**本站统一采用《材质标准特性表》的 410 / 290**。换版本时须重核并把结论写回这里。
//     - Ferroxcube：**官方材料册**（ferroxcube.com 下载页，id 94 = 3C95/3C97、id 90 = 3C96/3C98）——
//       3C95 **290**、3C96 **300**、3C97 **320**、3C98 **250**（100 ℃/100 kHz/200 mT），已逐项与手册表格核对一致；
//       3C90 **450** / 3C94 **350** 来自 Ferroxcube 材料表（经其代理商页面转载），标注为 `vendor-table`。
//   · ⚠️ **不在官方材质表内的牌号一律不预设**：PC45、PC46（TDK 现行表未列）与 Epcos N87/N97（未查到同条件
//     官方数据）均已移除 —— **宁可留空也不编**，这类材料走「自定义 / 其他牌号」按手册手填。
//   · ⚠️ **温度曲线形状**：PC47 的损耗谷在 100 ℃ 附近（250，本表最低）；PC95 是"全程低"（100 ℃ 时 290）。
//     选型要看实际工作温度区间，别只比一个点。
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
  { id: 'PC40', name: 'PC40', family: 'TDK MnZn', pcvRef: 410, alpha: 1.35, beta: 2.5, verified: 'official', source: 'TDK《材质标准特性表（变压器・扼流圈用）》100 ℃/100 kHz/200 mT', note: '通用牌号，损耗偏高、价格低' },
  { id: 'PC44', name: 'PC44', family: 'TDK MnZn', pcvRef: 300, alpha: 1.35, beta: 2.5, verified: 'official', source: 'TDK《材质标准特性表（变压器・扼流圈用）》100 ℃/100 kHz/200 mT', note: '损耗谷在 100 ℃ 附近' },
  { id: 'PC47', name: 'PC47', family: 'TDK MnZn', pcvRef: 250, alpha: 1.4, beta: 2.6, verified: 'official', source: 'TDK《材质标准特性表（变压器・扼流圈用）》100 ℃/100 kHz/200 mT', note: '100 ℃ 单点损耗最低（谷温在 100 ℃ 附近）' },
  { id: 'PC95', name: 'PC95', family: 'TDK MnZn', pcvRef: 290, alpha: 1.4, beta: 2.5, verified: 'official', source: 'TDK《材质标准特性表（变压器・扼流圈用）》100 ℃/100 kHz/200 mT', note: '全程低损耗（25/60/100/120 ℃ = 350/300/280/330），站内默认' },
  { id: 'PC90', name: 'PC90', family: 'TDK MnZn', pcvRef: 320, alpha: 1.4, beta: 2.5, verified: 'official', source: 'TDK《材质标准特性表（变压器・扼流圈用）》100 ℃/100 kHz/200 mT', note: '高 Bs、低损耗' },
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
 * 由参考点损耗密度反推 Steinmetz 系数 Cm，使
 *   P = Cm·f^α·B^β  在 (100 kHz, 200 mT) 处恰等于 pcvRef
 * ⇒ Cm = pcvRef / (f_ref^α · B_ref^β)。单位沿用站内约定（f: kHz、B: mT、结果 mW/cm³）。
 */
export function steinmetzCm(m: CoreMaterial): number {
  return m.pcvRef / (Math.pow(PCV_REF_F_KHZ, m.alpha) * Math.pow(PCV_REF_B_MT, m.beta))
}

/**
 * 切换磁材：把该牌号的预设参数写进损耗参数（P_cv 与 Steinmetz 三系数）。
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
  )
}
