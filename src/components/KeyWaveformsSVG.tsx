import { WAVEFORM_COLORS as C, PHASE_COLORS } from '../lib/waveformColors'

/**
 * 半桥 LLC 稳态关键波形（**理想化示意，一个开关周期**）。
 *
 * 为什么自绘而不用 PLECS 截图：
 * 原来的 `public/LLC_key_waveform.svg` 是 PLECS 导出的 4×2 示波器拼图，
 * 页面靠 `invert brightness-90` 反色来适配深色主题。反色会把 PLECS 按「测量组」
 * 上的红/蓝/黑三色整体映射成青/黄/近白 —— **8 条曲线只剩 3 种显示色**，
 * 而同组内无法区分；且它测的是 Vo/Io/ILm/ILr/MOSFET·current/voltage/Diode·current/voltage，
 * 与下方图例讲的 Vgs/Ir/Im/Vds/Isec/Io **根本不是同一套信号**。
 * 本图为自绘矢量图：一条曲线一个颜色（取自 `lib/waveformColors`，图例卡片同源），
 * 不依赖任何滤镜，缩放不糊。
 *
 * --- 时间基准 ---
 * 窗口 t ∈ [−0.02, 1.02]（略多于一个周期，好让周期边界两侧的驱动沿都看得见）。
 * 相位沿用「开关过程动画」那张图的命名，便于两张图对照：
 *   t₁ = 0.00  Q1 开通        t₂ = 0.46  Q1 关断
 *   t₃ = 0.48  换流完成        t₄ = 0.50  Q2 开通
 *   t₅ = 0.96  Q2 关断        t₆ = 0.98  换流完成     t₁′ = 1.00  Q1 开通（下一周期）
 * 死区 = 0.04 周期（占半周期的 8%）。
 *
 * --- 波形之间必须自洽的物理约束（图与图例都按这个口径写）---
 * 1. Vgs_Q1 与 Vgs_Q2 严格互补，中间留死区。
 * 2. Vds 在对应 Vgs 的**上升沿之前**已降到 0 ⇒ ZVS。本图为理想化：换流恰在死区结束时完成，
 *    实际设计必须留有余量（见 `zvsTimeOk` 校验）。
 * 3. Ir 滞后驱动基波 **30°**（谐振腔在开关频率上略呈感性）。取这个角度后：
 *    Q1 开通瞬间 Ir ≈ −0.39Imax（负）、Q2 开通瞬间 Ir ≈ +0.39Imax（正）——
 *    方向正好是在死区里把开关节点充/放到位的那一个，这是 ZVS 成立的前提。
 * 4. Im 是 Lm 上的三角波，由二次侧反射电压驱动，在各自导通段线性上升/下降。
 * 5. Isec = n·(Ir − Im)，只在 |Ir| > |Im| 时由整流二极管导通。
 *    取 Im_peak = 0.5·Ir_peak 后，|Ir| = |Im| 恰好落在**死区中点**（t₃ / t₆），
 *    于是 Isec 的换流与死区换流同刻发生 —— 这正是图中要表达的因果链。
 * 6. Io 为 Isec 整流后经输出电容滤波的结果：直流分量等于 |Isec| 的周期平均值，
 *    叠加 2·f_sw 的小纹波。图中直线高度由**数值积分算出**，不是拍的。
 */

// ─────────────────────────── 时间与幅值基准 ───────────────────────────
const T0 = -0.02
const T1 = 1.02
const TSPAN = T1 - T0

const T_Q1_OFF = 0.46
const T_Q2_ON = 0.5
const T_Q2_OFF = 0.96

const IR_LAG_DEG = 30
const IR_REF_ZERO = 0.98 // 开关节点基波（s=+1 于 Q1 导通段）的上升过零点 = Q1 开通换流中点
const IR_PHASE = IR_REF_ZERO + IR_LAG_DEG / 360 // Ir 的零点相位（滞后）

const IR_PEAK = 1
const IM_PEAK = 0.5 // 见注释 5

const IO_RIPPLE = 0.07 // Io 相对纹波（2·f_sw）

// ─────────────────────────── 归一化波形函数（纵轴为 ±1 量级） ───────────────────────────
const wrap = (t: number) => ((t % 1) + 1) % 1

/** 谐振电流：滞后驱动基波 IR_LAG_DEG 度的正弦。 */
const irAt = (t: number) => IR_PEAK * Math.sin(2 * Math.PI * (t - IR_PHASE))

/** 励磁电流：在 Q1/Q2 导通段线性上升/下降，死区内保持（平台）。 */
const imAt = (t: number) => {
  const u = wrap(t)
  if (u <= T_Q1_OFF) return -IM_PEAK + (2 * IM_PEAK * u) / T_Q1_OFF
  if (u <= T_Q2_ON) return IM_PEAK
  if (u <= T_Q2_OFF) return IM_PEAK - (2 * IM_PEAK * (u - T_Q2_ON)) / (T_Q2_OFF - T_Q2_ON)
  return -IM_PEAK
}

/** 副边电流（原边折算）：只有 |Ir| > |Im| 时二极管导通。 */
const isecAt = (t: number) => irAt(t) - imAt(t)

/** Io 的直流分量：对 |Isec| 在一个完整周期上做数值积分。 */
const IO_MEAN = (() => {
  const N = 4096
  let s = 0
  for (let i = 0; i < N; i++) s += Math.abs(isecAt((i + 0.5) / N))
  return s / N
})()

const ioAt = (t: number) => IO_MEAN * (1 + IO_RIPPLE * Math.cos(4 * Math.PI * (t - 0.23)))

const smooth = (x: number) => x * x * (3 - 2 * x)

// ─────────────────────────── 画布与行位 ───────────────────────────
const VB_W = 780
const VB_H = 660

const PL = 96
const PR = 712
const PW = PR - PL

const X = (t: number) => PL + ((t - T0) / TSPAN) * PW

const ROW = {
  vgsQ1: { hi: 20, lo: 46 },
  vgsQ2: { hi: 72, lo: 98 },
  vdsQ1: { hi: 142, lo: 170 },
  vdsQ2: { hi: 194, lo: 222 },
  ir: { zero: 300, amp: 34 },
  im: { zero: 384, amp: 28 },
  isec: { zero: 466, amp: 40 },
  io: { y: 548, amp: 13 },
} as const

const GRID_TOP = 8
const GRID_BOTTOM = 566
const AXIS_Y = 578

// ─────────────────────────── 路径构造 ───────────────────────────
type Pt = readonly [number, number]

const poly = (pts: readonly Pt[]) =>
  pts.map(([t, y], i) => `${i === 0 ? 'M' : 'L'} ${X(t).toFixed(1)} ${y.toFixed(1)}`).join(' ')

const sample = (fn: (t: number) => number, map: (v: number) => number, n = 320): Pt[] =>
  Array.from({ length: n + 1 }, (_, i) => {
    const t = T0 + (i / n) * TSPAN
    return [t, map(fn(t))] as Pt
  })

/** 数字/梯形量：给出电平切换时刻，自动生成含垂直沿的折线。 */
const stepPath = (edges: readonly Pt[], map: (v: number) => number) =>
  poly(edges.map(([t, v]) => [t, map(v)] as Pt))

const vgsQ1Path = stepPath(
  [
    [T0, 0], [0, 0], [0, 1], [T_Q1_OFF, 1], [T_Q1_OFF, 0], [1, 0], [1, 1], [T1, 1],
  ],
  (v) => (v ? ROW.vgsQ1.hi : ROW.vgsQ1.lo),
)

const vgsQ2Path = stepPath(
  [
    [T0, 0], [T_Q2_ON, 0], [T_Q2_ON, 1], [T_Q2_OFF, 1], [T_Q2_OFF, 0], [T1, 0],
  ],
  (v) => (v ? ROW.vgsQ2.hi : ROW.vgsQ2.lo),
)

/** Vds：导通为 0，死区内用 smoothstep 模拟 Coss 谐振换流。 */
const vdsQ1At = (t: number) => {
  const u = wrap(t)
  if (u <= T_Q1_OFF) return 0
  if (u <= T_Q2_ON) return smooth((u - T_Q1_OFF) / (T_Q2_ON - T_Q1_OFF))
  if (u <= T_Q2_OFF) return 1
  return 1 - smooth((u - T_Q2_OFF) / (1 - T_Q2_OFF))
}
const vdsQ2At = (t: number) => 1 - vdsQ1At(t)
const yVdsQ1 = (v: number) => ROW.vdsQ1.hi + (1 - v) * (ROW.vdsQ1.lo - ROW.vdsQ1.hi)
const yVdsQ2 = (v: number) => ROW.vdsQ2.hi + (1 - v) * (ROW.vdsQ2.lo - ROW.vdsQ2.hi)

const vdsQ1Path = poly(sample(vdsQ1At, yVdsQ1, 480))
const vdsQ2Path = poly(sample(vdsQ2At, yVdsQ2, 480))

const yIr = (v: number) => ROW.ir.zero - v * ROW.ir.amp
const yIm = (v: number) => ROW.im.zero - v * ROW.im.amp
const yIsec = (v: number) => ROW.isec.zero - v * ROW.isec.amp
const yIo = (v: number) => ROW.io.y - (v / IO_MEAN - 1) * (ROW.io.amp / IO_RIPPLE)

const irPath = poly(sample(irAt, yIr))
const imPath = poly([
  [T0, yIm(imAt(T0))],
  [T_Q1_OFF, yIm(IM_PEAK)],
  [T_Q2_ON, yIm(IM_PEAK)],
  [T_Q2_OFF, yIm(-IM_PEAK)],
  [1, yIm(-IM_PEAK)],
  [T1, yIm(imAt(T1))],
])
const isecPath = poly(sample(isecAt, yIsec))
const ioPath = poly(sample(ioAt, yIo))

// 死区竖带 [起点, 终点]
// 窗口左端 t=−0.02 落在被周期环绕过来的死区 [0.96, 1.00] 内，
// 所以要单独补一段 [T0, 0]，否则图左侧那截换流窗口没有底色，看起来像"凭空多出一段低电平"。
const DEAD_BANDS: readonly (readonly [number, number])[] = [
  [T0, 0],
  [T_Q1_OFF, T_Q2_ON],
  [T_Q2_OFF, 1],
]

// 时间刻度（与动画那张图同名，便于对照）
const TICKS: readonly { t: number; label: string }[] = [
  { t: 0, label: 't₁' },
  { t: T_Q1_OFF, label: 't₂' },
  { t: T_Q2_ON, label: 't₄' },
  { t: T_Q2_OFF, label: 't₅' },
  { t: 1, label: "t₁′" },
]

const MONO = 'JetBrains Mono, ui-monospace, monospace'

const LABELS: readonly { y: number; text: string; color: string }[] = [
  { y: ROW.vgsQ1.lo, text: 'Vgs_Q1', color: C.vgsQ1 },
  { y: ROW.vgsQ2.lo, text: 'Vgs_Q2', color: C.vgsQ2 },
  { y: ROW.vdsQ1.lo, text: 'Vds_Q1', color: C.vdsQ1 },
  { y: ROW.vdsQ2.lo, text: 'Vds_Q2', color: C.vdsQ2 },
  { y: ROW.ir.zero, text: 'Ir', color: C.ir },
  { y: ROW.im.zero, text: 'Im', color: C.im },
  { y: ROW.isec.zero, text: 'Isec', color: C.isec },
  { y: ROW.io.y, text: 'Io', color: C.io },
]

export default function KeyWaveformsSVG() {
  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      className="w-full max-w-4xl mx-auto h-auto"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="半桥 LLC 稳态关键波形：Vgs、Vds、Ir、Im、Isec、Io 在一个开关周期内的时间关系"
    >
      {/* 死区竖带：把「换流窗口」在整幅图上打通 */}
      {DEAD_BANDS.map(([a, b], i) => (
        <g key={i}>
          <rect x={X(a)} y={GRID_TOP} width={X(b) - X(a)} height={GRID_BOTTOM - GRID_TOP} fill={PHASE_COLORS.dead} />
          <line x1={X(a)} y1={GRID_TOP} x2={X(a)} y2={GRID_BOTTOM} stroke={PHASE_COLORS.deadLine} strokeWidth="1" opacity="0.5" />
          <line x1={X(b)} y1={GRID_TOP} x2={X(b)} y2={GRID_BOTTOM} stroke={PHASE_COLORS.deadLine} strokeWidth="1" opacity="0.5" />
        </g>
      ))}

      {/* 时间刻度虚线 */}
      {TICKS.map((m, i) => (
        <line key={`tm${i}`} x1={X(m.t)} y1={GRID_TOP} x2={X(m.t)} y2={GRID_BOTTOM} stroke="#525252" strokeWidth="1" strokeDasharray="3 3" opacity="0.55" />
      ))}

      {/* 导通段标注 */}
      <text x={X(0.23)} y={14} fill={C.vgsQ1} fontSize="10" textAnchor="middle">Q1 ON</text>
      <text x={X(0.73)} y={14} fill={C.vgsQ2} fontSize="10" textAnchor="middle">Q2 ON</text>

      {/* 零电平参考线 */}
      {[ROW.vgsQ1.lo, ROW.vgsQ2.lo, ROW.vdsQ1.lo, ROW.vdsQ2.lo, ROW.ir.zero, ROW.im.zero, ROW.isec.zero].map((y, i) => (
        <line key={`z${i}`} x1={PL} y1={y} x2={PR} y2={y} stroke="#404040" strokeWidth="1" strokeDasharray="2 4" />
      ))}
      <line x1={PL} y1={ROW.io.y} x2={PR} y2={ROW.io.y} stroke="#404040" strokeWidth="1" strokeDasharray="2 4" />

      {/* Vgs_Q1 */}
      <path d={vgsQ1Path} fill="none" stroke={C.vgsQ1} strokeWidth="2" strokeLinejoin="round" />
      {/* Vgs_Q2 */}
      <path d={vgsQ2Path} fill="none" stroke={C.vgsQ2} strokeWidth="2" strokeLinejoin="round" />

      {/* Vds_Q1 / Vds_Q2 */}
      <path d={vdsQ1Path} fill="none" stroke={C.vdsQ1} strokeWidth="2" />
      <path d={vdsQ2Path} fill="none" stroke={C.vdsQ2} strokeWidth="2" strokeDasharray="5 3" />

      {/* Ir / Im */}
      <path d={irPath} fill="none" stroke={C.ir} strokeWidth="2" />
      <path d={imPath} fill="none" stroke={C.im} strokeWidth="2" />

      {/* Isec / Io */}
      <path d={isecPath} fill="none" stroke={C.isec} strokeWidth="2" />
      <path d={ioPath} fill="none" stroke={C.io} strokeWidth="2" />

      {/* 纵轴电平标注（Vds 行） */}
      <text x={718} y={ROW.vdsQ1.hi + 3} fill="#737373" fontSize="8" fontFamily={MONO}>Vin</text>
      <text x={718} y={ROW.vdsQ1.lo + 3} fill="#737373" fontSize="8" fontFamily={MONO}>0</text>

      {/* ZVS 标注 */}
      <text x={X(0.48)} y={132} fill="#22c55e" fontSize="9" textAnchor="middle">ZVS 换流</text>
      <text x={X(0.98)} y={132} fill="#22c55e" fontSize="9" textAnchor="middle">ZVS</text>

      {/* Isec 换流标注 */}
      <text x={X(0.48)} y={520} fill={C.isec} fontSize="9" textAnchor="middle">Ir = Im，二极管换流</text>

      {/* 左侧信号名 */}
      {LABELS.map((l) => (
        <text
          key={l.text}
          x={88}
          y={l.y + 3}
          fill={l.color}
          fontSize="11"
          textAnchor="end"
          fontFamily={MONO}
        >
          {l.text}
        </text>
      ))}

      {/* 时间轴 */}
      <line x1={PL} y1={AXIS_Y} x2={PR} y2={AXIS_Y} stroke="#525252" strokeWidth="1.5" />
      {TICKS.map((m, i) => (
        <g key={`tk${i}`}>
          <line x1={X(m.t)} y1={AXIS_Y} x2={X(m.t)} y2={AXIS_Y + 5} stroke="#525252" strokeWidth="1.5" />
          <text x={X(m.t)} y={AXIS_Y + 18} fill="#a3a3a3" fontSize="10" textAnchor="middle" fontFamily={MONO}>{m.label}</text>
        </g>
      ))}
      <text x={VB_W - 6} y={AXIS_Y + 18} fill="#737373" fontSize="10" textAnchor="end">时间 t →</text>

      {/* 图内时序说明 */}
      <text x={PL} y={AXIS_Y + 42} fill="#a3a3a3" fontSize="10" fontFamily={MONO}>
        t₁→t₂ Q1 导通（能量传输） │ t₂→t₄ 死区：Coss 充放电，换流在 t₃ 完成 │ t₄→t₅ Q2 导通
      </text>
      <text x={PL} y={AXIS_Y + 58} fill="#a3a3a3" fontSize="10" fontFamily={MONO}>
        t₅→t₁′ 死区：Coss 充放电，换流在 t₆ 完成 │ Vds 在对应 Vgs 上升沿之前已为 0 ⇒ ZVS
      </text>

      {/* 相位带说明 */}
      <rect x={PL} y={AXIS_Y + 68} width="12" height="10" fill={PHASE_COLORS.dead} stroke={PHASE_COLORS.deadLine} strokeWidth="0.8" />
      <text x={PL + 18} y={AXIS_Y + 77} fill="#a3a3a3" fontSize="10">死区（ZVS 换流窗口）</text>
      <line x1={PL + 168} y1={AXIS_Y + 73} x2={PL + 190} y2={AXIS_Y + 73} stroke={C.vdsQ2} strokeWidth="2" strokeDasharray="5 3" />
      <text x={PL + 196} y={AXIS_Y + 77} fill="#a3a3a3" fontSize="10">虚线 = 互补管（Vds_Q2）</text>
    </svg>
  )
}
