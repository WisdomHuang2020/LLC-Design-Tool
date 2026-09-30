// LLC 设计工具 —— 磁芯材料库（让「磁芯材料」下拉真正参与磁损计算）
//
// 背景：此前 `coreMaterial` 只是个标签，不参与任何计算（换牌号磁损不变）——
//       本模块把它变成**参数预设**：切换材料时填充 P_cv 与 Steinmetz 系数，之后仍可手工微调。
//
// ★ 数值口径（务必读，v2.10.125 修正过一次）：
//   · `pcvRef` = 参考点损耗密度，条件**统一为 100 kHz、200 mT、100 ℃、正弦励磁**，单位 mW/cm³。
//     ⚠️ **必须同一温度**：PC40 在 25 ℃ 是 600 mW/cm³、在 100 ℃ 只有 410 —— 拿 25 ℃ 的 PC40 去比
//        100 ℃ 的 PC95，会算出「PC95 只有 PC40 的 48%」这种错比例（正确约 78%）。本表全部取 **100 ℃**，
//        与站内"MOS 稳态 100 ℃"的假设一致（Rds(on) 用 kT=1.6 也是这个前提）。
//   · 出处：TDK PC 系列参数表（100 kHz/200 mT/100 ℃ 列：PC40 410 / PC44 300 / PC45 460 / PC46 660 /
//     PC47 250 / PC95 320 / PC90 320 mW/cm³，见 MDPI Nanomaterials 12(20):3662 表 5 转引）；
//     Ferroxcube 官方材料表（Pv @100 ℃/100 kHz/200 mT：3C90 450 / 3C94 350 / 3C95 290 / 3C96 300 /
//     3C97 320 / 3C98 250 / 3C99 140 kW/m³ = mW/cm³）。
//   · ⚠️ **注意温度曲线形状**：PC47/PC44 的损耗谷在 100 ℃ 附近（PC47 250 < PC95 320），
//     而 PC95 的优势是 **25~120 ℃ 全程平坦**（各温度约 280~350）。所以"100 ℃ 单点排序"里
//     PC95 不一定最优 —— 选型要看实际工作温度区间，别只看一个点。
//   · `alpha`/`beta` 是 Steinmetz 指数（f 用 kHz、B 用 mT 口径），典型范围 α≈1.3~1.7、β≈2.4~2.9。
//   · Steinmetz 系数 `Cm` **由 pcvRef 反推**（`steinmetzCm()`），使两条口径在参考点自洽，
//     而不是另抄一组可能口径不一致的 Cm —— 这样"手册法 / 拟合式"两种取法可互校。
//   · ⚠️ 表内之外的牌号（如 Epcos N87/N97）**本表不给预设值** —— 没查到可引用的同条件数据，
//     宁可留空也不要编：这类材料请选「自定义 / 其他牌号」后按手册手填 P_cv 与系数。
//   · 投产前必须按实际牌号手册在**目标温度/频率/B** 下复核。界面上也照此提示。
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
  note?: string
}

export const CORE_MATERIALS: CoreMaterial[] = [
  { id: 'PC40', name: 'PC40', family: 'TDK MnZn', pcvRef: 410, alpha: 1.35, beta: 2.5, note: '通用牌号，损耗偏高、价格低（100 ℃）' },
  { id: 'PC44', name: 'PC44', family: 'TDK MnZn', pcvRef: 300, alpha: 1.35, beta: 2.5, note: '损耗谷在 100 ℃ 附近；100 ℃ 单点优于 PC95' },
  { id: 'PC45', name: 'PC45', family: 'TDK MnZn', pcvRef: 460, alpha: 1.35, beta: 2.5, note: '损耗谷在 60~80 ℃；100 ℃ 下反而变差，本工具按 100 ℃ 计' },
  { id: 'PC46', name: 'PC46', family: 'TDK MnZn', pcvRef: 660, alpha: 1.35, beta: 2.5, note: '损耗谷在 40~50 ℃；100 ℃ 下明显变差' },
  { id: 'PC47', name: 'PC47', family: 'TDK MnZn', pcvRef: 250, alpha: 1.4, beta: 2.6, note: '损耗谷在 100 ℃ 附近，100 ℃ 单点是本表最低' },
  { id: 'PC95', name: 'PC95', family: 'TDK MnZn', pcvRef: 320, alpha: 1.4, beta: 2.5, note: '宽温低损耗（25~120 ℃ 约 280~350），站内默认' },
  { id: 'PC90', name: 'PC90', family: 'TDK MnZn', pcvRef: 320, alpha: 1.4, beta: 2.5, note: '宽温低损耗、Bs 更高' },
  { id: '3C90', name: '3C90', family: 'Ferroxcube MnZn', pcvRef: 450, alpha: 1.35, beta: 2.5, note: '损耗谷在 100 ℃' },
  { id: '3C94', name: '3C94', family: 'Ferroxcube MnZn', pcvRef: 350, alpha: 1.4, beta: 2.6, note: '低成本低损耗牌号' },
  { id: '3C95', name: '3C95', family: 'Ferroxcube MnZn', pcvRef: 290, alpha: 1.4, beta: 2.6, note: '宽温（25~100 ℃ 平坦）' },
  { id: '3C96', name: '3C96', family: 'Ferroxcube MnZn', pcvRef: 300, alpha: 1.4, beta: 2.6, note: '损耗谷在 100 ℃' },
  { id: '3C97', name: '3C97', family: 'Ferroxcube MnZn', pcvRef: 320, alpha: 1.45, beta: 2.7, note: '损耗谷 60~140 ℃，适合高温环境' },
  { id: '3C98', name: '3C98', family: 'Ferroxcube MnZn', pcvRef: 250, alpha: 1.45, beta: 2.7, note: '损耗谷在 100 ℃' },
  { id: 'custom', name: '自定义 / 其他牌号', family: '—', pcvRef: 400, alpha: 1.4, beta: 2.5, note: '保留当前填写的参数；表内没有的牌号（如 N87/N97）请按手册手填 P_cv 与系数' },
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
