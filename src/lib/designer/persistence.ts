// LLC 设计工具 —— Designer 页面状态持久化
// 全部落浏览器本地存储；读写失败一律静默降级，不抛错。
import type { CalculatedData, LossParameters } from './types'
import { defaultLossParams } from './losses'

const DESIGNER_CALC_KEY = 'llc-designer-calculated'
const DESIGNER_LOSS_KEY = 'llc-designer-loss-params'
const DESIGNER_SHOW_KEY = 'llc-designer-show-results'
const DESIGNER_COLLAPSED_KEY = 'llc-designer-collapsed'
const DESIGNER_LOSS_NOTES_KEY = 'llc-designer-loss-notes-hidden'

/**
 * 损耗面板「参数下方注释小字」是否隐藏 —— 纯显示偏好，不参与任何计算。
 * 各参数下方注释长短不一（有的 1 行、有的 4 行），会撑出参差的行高；需要对齐输入框时整体隐藏。
 * 与折叠状态不同：**「复位」不清除本偏好**（用户隐藏注释通常是长期诉求）。
 */
export function loadLossNotesHidden(): boolean {
  try {
    return localStorage.getItem(DESIGNER_LOSS_NOTES_KEY) === '1'
  } catch { /* ignore */ }
  return false
}

export function saveLossNotesHidden(hidden: boolean): void {
  try {
    localStorage.setItem(DESIGNER_LOSS_NOTES_KEY, hidden ? '1' : '0')
  } catch { /* ignore */ }
}

/** 折叠状态的初始值。注意 waveforms 键为历史遗留（该区块当前不可折叠）。 */
export const DEFAULT_COLLAPSED: Record<string, boolean> = {
  results: false,
  suggestions: false,
  components: false,
  waveforms: false,
  loss: false,
  compensation: true,
  compare: true,
}

export function loadCalculated(): CalculatedData | null {
  try {
    const raw = localStorage.getItem(DESIGNER_CALC_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return null
}

export function loadLossParams(): LossParameters {
  try {
    const raw = localStorage.getItem(DESIGNER_LOSS_KEY)
    if (raw) return { ...defaultLossParams, ...JSON.parse(raw) }
  } catch { /* ignore */ }
  return defaultLossParams
}

export function loadShowResults(): boolean {
  try {
    const raw = localStorage.getItem(DESIGNER_SHOW_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return false
}

export function loadCollapsed(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(DESIGNER_COLLAPSED_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return DEFAULT_COLLAPSED
}

export function saveDesignerState(
  calculated: CalculatedData | null,
  lossParams: LossParameters,
  showResults: boolean,
  collapsed: Record<string, boolean>,
) {
  try {
    if (calculated) localStorage.setItem(DESIGNER_CALC_KEY, JSON.stringify(calculated))
    else localStorage.removeItem(DESIGNER_CALC_KEY)
    localStorage.setItem(DESIGNER_LOSS_KEY, JSON.stringify(lossParams))
    localStorage.setItem(DESIGNER_SHOW_KEY, JSON.stringify(showResults))
    localStorage.setItem(DESIGNER_COLLAPSED_KEY, JSON.stringify(collapsed))
  } catch { /* ignore */ }
}

export function clearDesignerState() {
  try {
    localStorage.removeItem(DESIGNER_CALC_KEY)
    localStorage.removeItem(DESIGNER_LOSS_KEY)
    localStorage.removeItem(DESIGNER_SHOW_KEY)
    localStorage.removeItem(DESIGNER_COLLAPSED_KEY)
  } catch { /* ignore */ }
}
