/**
 * 颜色常量 — 与现有项目 Tailwind 主题对齐
 */
export const COLORS = {
  teal: '#14b8a6',
  tealDark: '#0f766e',
  amber: '#f59e0b',
  green: '#22c55e',
  red: '#ef4444',
  purple: '#8b5cf6',
  white: '#f5f5f5',
  gray400: '#a3a3a3',
  gray500: '#737373',
  gray600: '#525252',
  gray700: '#404040',
  gray800: '#262626',
  black: '#0a0a0a',
} as const

/** 阶段定义（6 个 LLC 开关阶段） */
export const PHASES = [
  { id: 0, label: 't₁-t₂', name: 'Q1 ON', desc: '正半周能量传输', color: COLORS.teal },
  { id: 1, label: 't₂-t₃', name: '死区', desc: 'Q1关断, Coss充放电', color: COLORS.amber },
  { id: 2, label: 't₃-t₄', name: 'D2导通', desc: 'Q2体二极管导通, ZVS准备', color: COLORS.green },
  { id: 3, label: 't₄-t₅', name: 'Q2 ON', desc: '负半周能量传输, ZVS实现', color: COLORS.teal },
  { id: 4, label: 't₅-t₆', name: '死区', desc: 'Q2关断, Coss充放电', color: COLORS.amber },
  { id: 5, label: 't₆-t₁', name: 'D1导通', desc: 'Q1体二极管导通, ZVS准备', color: COLORS.green },
] as const

/** 默认画布尺寸 */
export const CANVAS = {
  width: 800,
  height: 500,
  viewBox: { x: 0, y: 0, w: 800, h: 500 },
} as const

/** 节点捕捉半径（拖拽时吸附到元件端点） */
export const SNAP_RADIUS = 12

/** 连线拐角半径（直角弯的圆角） */
export const CORNER_RADIUS = 6
