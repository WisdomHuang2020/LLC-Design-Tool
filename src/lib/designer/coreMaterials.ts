// LLC 设计工具 —— 磁芯材料库（让「磁芯材料」下拉真正参与磁损计算）
//
// 背景：此前 `coreMaterial` 只是个标签，不参与任何计算（换牌号磁损不变）——
//       本模块把它变成**参数预设**：切换材料时填充 P_cv 与 Steinmetz 系数，之后仍可手工微调。
//
// ★ 数值口径与可信度声明（务必读）：
//   · `pcvRef` 是**参考点损耗密度**：100 kHz、200 mT、100 ℃、**正弦**励磁，单位 mW/cm³。
//     取值来自各厂手册损耗曲线的常见量级（不同批次/牌号细分会有出入）。
//   · `alpha`/`beta` 是 Steinmetz 指数（f 用 kHz、B 用 mT 口径），典型范围 α≈1.3~1.7、β≈2.4~2.9。
//   · Steinmetz 系数 `Cm` **由 pcvRef 反推**（`steinmetzCm()`），使两条口径在参考点自洽，
//     而不是另抄一组可能口径不一致的 Cm —— 这样"手册法 / 拟合式"两种取法可互校。
//   · ⚠️ **投产前必须按实际牌号手册在目标温度/频率/B 下核对**，尤其是低损耗牌号（PC95/PC97/3C95/N97）。
//     本表的用途是"换材料时量级立刻跟着动"，不是替代查手册。界面上也照此提示。
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
  { id: 'PC40', name: 'PC40', family: 'TDK MnZn', pcvRef: 600, alpha: 1.35, beta: 2.5, note: '通用牌号，损耗偏高、价格低' },
  { id: 'PC44', name: 'PC44', family: 'TDK MnZn', pcvRef: 450, alpha: 1.35, beta: 2.5, note: 'PC40 的低损耗改良' },
  { id: 'PC47', name: 'PC47', family: 'TDK MnZn', pcvRef: 380, alpha: 1.4, beta: 2.6 },
  { id: 'PC95', name: 'PC95', family: 'TDK MnZn', pcvRef: 290, alpha: 1.4, beta: 2.5, note: '低损耗牌号（站内默认）' },
  { id: 'PC97', name: 'PC97', family: 'TDK MnZn', pcvRef: 250, alpha: 1.45, beta: 2.7, note: '高频低损耗，温度特性更平' },
  { id: 'N87', name: 'N87', family: 'Epcos/TDK MnZn', pcvRef: 550, alpha: 1.35, beta: 2.5 },
  { id: 'N97', name: 'N97', family: 'Epcos/TDK MnZn', pcvRef: 280, alpha: 1.45, beta: 2.7, note: '低损耗牌号' },
  { id: '3C90', name: '3C90', family: 'Ferroxcube MnZn', pcvRef: 600, alpha: 1.35, beta: 2.5 },
  { id: '3C95', name: '3C95', family: 'Ferroxcube MnZn', pcvRef: 300, alpha: 1.4, beta: 2.6, note: '低损耗牌号' },
  { id: '3C97', name: '3C97', family: 'Ferroxcube MnZn', pcvRef: 260, alpha: 1.45, beta: 2.7 },
  { id: 'custom', name: '自定义 / 其他牌号', family: '—', pcvRef: 400, alpha: 1.4, beta: 2.5, note: '保留当前填写的参数，请自行按手册填 P_cv 与系数' },
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
