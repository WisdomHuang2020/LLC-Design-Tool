/**
 * LLC 关键波形的配色单一来源。
 *
 * 为什么要单独抽出这一处：
 * 原来「关键波形」section 的配色是**两处独立手写**的 —— 图（一张 PLECS 导出的位图，
 * 再套 `invert brightness-90` 反色）和图例卡片（各自的 Tailwind 类）。
 * 两者没有任何约束关系，于是同时出现了两个问题：
 *   1) 图例里 Vgs 与 Ir 用了同一个色点（`bg-primary-light`），无法区分；
 *   2) 位图反色后，PLECS 原本按「测量组」上色的红/蓝/黑三色被映射成青/黄/近白，
 *      8 条曲线只剩 3 种显示色，且**与图例卡片的颜色毫无对应**。
 *
 * 现在的约定：**图与图例都只能从这里取值**。
 * 配色一改，两边同时变，不会再漂移。
 *
 * 选色依据：背景为 `--color-bg: #0a0a0a`（深色主题）。
 * 8 个色相在色环上尽量拉开，且刻意避开「同色系相邻」——
 * 相邻两行（如 Vgs_Q1 与 Vgs_Q2、Vds_Q1 与 Vds_Q2）必须一眼可辨。
 */
export const WAVEFORM_COLORS = {
  /** Vgs_Q1 —— 上管栅极驱动 */
  vgsQ1: '#22d3ee',
  /** Vgs_Q2 —— 下管栅极驱动 */
  vgsQ2: '#f59e0b',
  /** Vds_Q1 —— 上管漏源电压 */
  vdsQ1: '#ef4444',
  /** Vds_Q2 —— 下管漏源电压 */
  vdsQ2: '#f472b6',
  /** Ir —— 谐振电流 */
  ir: '#a78bfa',
  /** Im —— 励磁电流 */
  im: '#4ade80',
  /** Isec —— 副边（整流后原边折算）电流 */
  isec: '#60a5fa',
  /** Io —— 输出电流（整流滤波后） */
  io: '#e5e5e5',
} as const

export type WaveformColorKey = keyof typeof WAVEFORM_COLORS

/** 相位带配色：只用于「时间段」这一层语义，与上面的「信号」色是两套正交编码。 */
export const PHASE_COLORS = {
  /** 死区（Coss 充放电 / ZVS 换流窗口） */
  dead: 'rgba(245, 158, 11, 0.16)',
  deadLine: '#f59e0b',
} as const
