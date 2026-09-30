import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Activity,
  Waves,
  ToggleLeft,
  TrendingUp,
  Scale,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Gauge,
  Zap,
  Layers,
  ChevronDown,
} from 'lucide-react'
import MathBlock from '../components/MathBlock'
import GainChart from '../components/GainChart'
import KeyWaveformsSVG from '../components/KeyWaveformsSVG'
import { WAVEFORM_COLORS } from '../lib/waveformColors'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' as const },
  }),
}

/**
 * 「关键波形」图例条目。
 *
 * 条目顺序 = `KeyWaveformsSVG` 中自上而下的行序；
 * 色值**只能**取自 `lib/waveformColors`，图与图例同源，从根上杜绝「图例说 A 色、曲线画成 B 色」。
 * 新增/改色请改那一个文件，不要在这里写死十六进制。
 */
const WAVE_LEGEND = [
  {
    row: '第 1 行',
    chips: [
      { color: WAVEFORM_COLORS.vgsQ1, label: 'Vgs_Q1' },
      { color: WAVEFORM_COLORS.vgsQ2, label: 'Vgs_Q2' },
    ],
    title: 'Vgs — 栅极驱动',
    desc:
      '两个互补的方波（Vgs_Q1 / Vgs_Q2），之间留死区时间（Dead Time）。死区长度直接决定 ZVS 能否实现：太短则结电容来不及充放电，太长则励磁电流回灌、效率下降。',
  },
  {
    row: '第 2 行',
    chips: [
      { color: WAVEFORM_COLORS.vdsQ1, label: 'Vds_Q1（实线）' },
      { color: WAVEFORM_COLORS.vdsQ2, label: 'Vds_Q2（虚线）' },
    ],
    title: 'Vds — 漏极电压',
    desc:
      '半桥两管的 Vds 互补，任一时刻二者之和恒为 Vin。关键在于：Vds 在对应 Vgs 的上升沿之前就已被谐振电流拉到 0 —— 这就是 ZVS 的直接证据。图中为理想化情形，换流恰在死区内完成，实际设计必须留余量。',
  },
  {
    row: '第 3 行',
    chips: [{ color: WAVEFORM_COLORS.ir, label: 'Ir' }],
    title: 'Ir — 谐振电流',
    desc:
      '近似正弦，滞后驱动基波约 30°（谐振腔在开关频率上略呈感性）。正因为滞后，每个开通瞬间 Ir 尚未过零，其方向恰好是让结电容在死区内完成充放电的那一侧 —— 这是 ZVS 能成立的前提。',
  },
  {
    row: '第 4 行',
    chips: [{ color: WAVEFORM_COLORS.im, label: 'Im' }],
    title: 'Im — 励磁电流',
    desc:
      '加在 Lm 上的三角波，由副边反射过来的输出电压驱动：Q1 导通段线性上升、Q2 导通段线性下降，死区内近似保持（平台）。拐点出现在开关管关断时刻附近，此时励磁电流达到峰值。',
  },
  {
    row: '第 5 行',
    chips: [{ color: WAVEFORM_COLORS.isec, label: 'Isec' }],
    title: 'Isec — 副边电流',
    desc:
      '等于 n·(Ir − Im)，因此只在 |Ir| > |Im| 时有电流流通，对应整流二极管的导通时段。图中取 Im 峰值为 Ir 峰值的一半，使 |Ir| = |Im| 恰好落在死区中点 —— 于是「二极管换流」与「死区换流」同刻发生。Region 2 下由此自然实现 ZCS。',
  },
  {
    row: '第 6 行',
    chips: [{ color: WAVEFORM_COLORS.io, label: 'Io' }],
    title: 'Io — 输出电流',
    desc:
      'Isec 经整流与输出电容滤波后的结果：直流分量等于 |Isec| 的周期平均值，叠加频率为开关频率两倍的纹波。输出滤波电容主要就是滤掉这个二倍频纹波。',
  },
] as const

function SectionCard({
  children,
  header,
  className = '',
  index = 0,
  defaultOpen = true,
}: {
  children: React.ReactNode
  header: React.ReactNode
  className?: string
  index?: number
  defaultOpen?: boolean
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      variants={fadeUp}
      custom={index}
      className={`card-surface overflow-hidden ${className}`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 md:px-8 md:pt-8 text-left hover:bg-surface-elevated/50 transition-colors"
      >
        <div>{header}</div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-6 h-6 text-text-secondary" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' as const }}
          >
            <div className="px-6 md:px-8 pb-6 md:pb-8 pt-2">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function SectionTitle({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  subtitle?: string
}) {
  return (
    <div className="flex items-start gap-3 mb-6">
      <div className="w-10 h-10 rounded-lg bg-primary-dark/40 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-primary-light" />
      </div>
      <div>
        <h2 className="text-xl md:text-2xl font-semibold text-text-primary tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-text-secondary text-sm mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  )
}

/* ─── Animated SVG Components ─── */

function SwitchingAnimationSVG() {
  // 时间轴：一个完整周期 t1→t7 = 450 单位，半周期 225 单位。
  // 死区与体二极管导通窗口各取 20 单位（合计 40 单位，占半周期 17.8%、单个死区 8.9%），
  // 对应 100 kHz 下约 445 ns 死区，与实际 300~500 ns 同量级；
  // 不能画得与驱动高电平时间（Q1 ON = 185 单位）相当。
  const t1 = 60
  const t2 = 245
  const t3 = 265
  const t4 = 285
  const t5 = 470
  const t6 = 490
  const t7 = 510
  const t8 = 630

  // row: 标签行号。死区 / 体二极管导通窗口很窄（各 20 单位），标签若同排必然互相压字，
  // 故把它们错到第二行（row=1），行 0 放 ON 窗与第一段死区。
  const phases = [
    { start: t1, end: t2, color: 'rgba(20,184,166,0.12)', label: 'Q1 ON', labelColor: '#14b8a6', row: 0 },
    { start: t2, end: t3, color: 'rgba(245,158,11,0.12)', label: '死区', labelColor: '#f59e0b', row: 0 },
    { start: t3, end: t4, color: 'rgba(34,197,94,0.15)', label: 'D2导通', labelColor: '#22c55e', row: 1 },
    { start: t4, end: t5, color: 'rgba(20,184,166,0.12)', label: 'Q2 ON', labelColor: '#14b8a6', row: 0 },
    { start: t5, end: t6, color: 'rgba(245,158,11,0.12)', label: '死区', labelColor: '#f59e0b', row: 0 },
    { start: t6, end: t7, color: 'rgba(34,197,94,0.15)', label: 'D1导通', labelColor: '#22c55e', row: 1 },
    { start: t7, end: t8, color: 'rgba(20,184,166,0.12)', label: 'Q1 ON', labelColor: '#14b8a6', row: 0 },
  ]

  const timeMarkers = [
    { t: t1, label: 't₁' },
    { t: t2, label: 't₂' },
    { t: t3, label: 't₃' },
    { t: t4, label: 't₄' },
    { t: t5, label: 't₅' },
    { t: t6, label: 't₆' },
    { t: t7, label: "t₁'" },
    { t: t8, label: "t₂'" },
  ]

  // 谐振电流：y = 30 − 18·sin(2π(x−75)/450)，零线 y=30，y 越小电流越正。
  // 过零点取 75 / 300 / 525，即**滞后于驱动开通瞬间** 15 单位。
  // 注意：15/450 = 3.33% 周期 ≈ **12°**（早期注释写的 54° 是错的，已订正）；
  // 本节上一张「关键波形」图按 30° 滞后绘制，两者是不同用途的示意，不必强行取同值。
  // Q2 开通（x=285）时电流仍为正（y≈26.3），Q1 开通（x=510）时电流仍为负（y≈33.7），
  // 这样才体现感性、并支撑"死区内体二极管续流完成 ZVS"的叙述。
  const irPath = 'M 60 33.7 L 75 30.0 L 90 26.3 L 105 22.7 L 120 19.4 L 135 16.6 L 150 14.4 L 165 12.9 L 180 12.1 L 195 12.1 L 210 12.9 L 225 14.4 L 240 16.6 L 255 19.4 L 270 22.7 L 285 26.3 L 300 30.0 L 315 33.7 L 330 37.3 L 345 40.6 L 360 43.4 L 375 45.6 L 390 47.1 L 405 47.9 L 420 47.9 L 435 47.1 L 450 45.6 L 465 43.4 L 480 40.6 L 495 37.3 L 510 33.7 L 525 30.0 L 540 26.3 L 555 22.7 L 570 19.4 L 585 16.6 L 600 14.4 L 615 12.9 L 630 12.1'

  const imPath = 'M 60 45 L 170 12 L 230 18 L 310 25 L 420 55 L 480 48 L 520 42 L 580 12'

  return (
    <svg viewBox="0 0 700 460" className="w-full max-w-3xl mx-auto h-auto" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id="arrowTealAnim" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <circle cx="3" cy="3" r="2" fill="#14b8a6" />
        </marker>
        <linearGradient id="vdsFallGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
      </defs>

      {/* Grid */}
      <g stroke="#404040" strokeWidth="1" opacity="0.2">
        {Array.from({ length: 16 }, (_, i) => 40 + i * 40).map((x) => (
          <line key={`v${x}`} x1={x} y1="10" x2={x} y2="255" />
        ))}
        {Array.from({ length: 7 }, (_, i) => 15 + i * 40).map((y) => (
          <line key={`h${y}`} x1="40" y1={y} x2="660" y2={y} />
        ))}
      </g>

      {/* Phase background strips */}
      {phases.map((p, i) => (
        <rect key={i} x={p.start} y="10" width={p.end - p.start} height="245" fill={p.color} />
      ))}

      {/* Phase labels on strip */}
      {phases.map((p, i) => (
        <text key={`l${i}`} x={(p.start + p.end) / 2} y={p.row === 1 ? 278 : 264} fill={p.labelColor} fontSize="9" textAnchor="middle" fontFamily="JetBrains Mono, monospace" opacity="0.9">
          {p.label}
        </text>
      ))}

      {/* Time marker lines */}
      {timeMarkers.map((m, i) => (
        <line key={`m${i}`} x1={m.t} y1="10" x2={m.t} y2="255" stroke="#525252" strokeWidth="1" strokeDasharray="3 2" opacity="0.6" />
      ))}

      {/* Vgs Q1 */}
      <g>
        <text x="45" y="28" fill="#a3a3a3" fontSize="11" textAnchor="end" dominantBaseline="middle" fontFamily="JetBrains Mono, monospace">Vgs_Q1</text>
        <line x1={t1} y1="40" x2={t8} y2="40" stroke="#525252" strokeWidth="1" />
        <path d={`M ${t1} 40 L ${t1} 15 L ${t2} 15 L ${t2} 40 L ${t7} 40 L ${t7} 15 L ${t8} 15 L ${t8} 40`} fill="none" stroke={WAVEFORM_COLORS.vgsQ1} strokeWidth="2" />
        <text x={(t1 + t2) / 2} y="12" fill={WAVEFORM_COLORS.vgsQ1} fontSize="8" textAnchor="middle">Q1 ON</text>
        <text x={(t7 + t8) / 2} y="12" fill={WAVEFORM_COLORS.vgsQ1} fontSize="8" textAnchor="middle">Q1 ON</text>
      </g>

      {/* Vgs Q2 */}
      <g transform="translate(0, 45)">
        <text x="45" y="28" fill="#a3a3a3" fontSize="11" textAnchor="end" dominantBaseline="middle" fontFamily="JetBrains Mono, monospace">Vgs_Q2</text>
        <line x1={t1} y1="40" x2={t8} y2="40" stroke="#525252" strokeWidth="1" />
        <path d={`M ${t1} 40 L ${t4} 40 L ${t4} 15 L ${t5} 15 L ${t5} 40 L ${t8} 40`} fill="none" stroke={WAVEFORM_COLORS.vgsQ2} strokeWidth="2" strokeDasharray="4 2" />
        <text x={(t4 + t5) / 2} y="12" fill={WAVEFORM_COLORS.vgsQ2} fontSize="8" textAnchor="middle">Q2 ON</text>
      </g>

      {/* Vds Q1 */}
      <g transform="translate(0, 140)">
        <text x="45" y="28" fill="#a3a3a3" fontSize="11" textAnchor="end" dominantBaseline="middle" fontFamily="JetBrains Mono, monospace">Vds_Q1</text>
        <line x1={t1} y1="40" x2={t8} y2="40" stroke="#525252" strokeWidth="1" />
        <path d={`M ${t1} 40 L ${t2} 40 L ${t3} 10 L ${t5} 10 L ${t6} 40 L ${t7} 40 L ${t8} 40`} fill="none" stroke={WAVEFORM_COLORS.vdsQ1} strokeWidth="2" />
        <line x1={t5} y1="10" x2={t6} y2="40" stroke="url(#vdsFallGrad)" strokeWidth="2" />
        <rect x={t6} y="8" width={t7 - t6} height="36" fill="rgba(34,197,94,0.15)" stroke="#22c55e" strokeWidth="1" strokeDasharray="3 2" />
        <text x={(t6 + t7) / 2} y="56" fill="#22c55e" fontSize="9" textAnchor="middle">ZVS</text>
        <text x={(t2 + t3) / 2} y="56" fill="#f59e0b" fontSize="9" textAnchor="middle">死区</text>
        <text x={(t5 + t6) / 2} y="56" fill="#f59e0b" fontSize="9" textAnchor="middle">死区</text>
      </g>

      {/* Ir */}
      <g transform="translate(0, 145)">
        {/* 标签组内 y=44 → 绝对 y=189。原值 20（绝对 165）与 Vds_Q1 标签（绝对 168）
            仅差 3 单位、字号 11，二者必然叠字；下移到 189 后：
            与 Vds_Q1(168) 间距 21、与 Im(220) 间距 31，均大于字高。 */}
        <text x="45" y="44" fill="#a3a3a3" fontSize="11" textAnchor="end" dominantBaseline="middle" fontFamily="JetBrains Mono, monospace">Ir</text>
        <line x1={t1} y1="30" x2={t8} y2="30" stroke="#525252" strokeWidth="1" />
        <path d={irPath} fill="none" stroke={WAVEFORM_COLORS.ir} strokeWidth="2" className="dash-flow" />
        <text x={t8 + 12} y="28" fill={WAVEFORM_COLORS.ir} fontSize="11" dominantBaseline="middle">谐振电流</text>
      </g>

      {/* Im */}
      <g transform="translate(0, 200)">
        <text x="45" y="20" fill="#a3a3a3" fontSize="11" textAnchor="end" dominantBaseline="middle" fontFamily="JetBrains Mono, monospace">Im</text>
        <line x1={t1} y1="30" x2={t8} y2="30" stroke="#525252" strokeWidth="1" />
        <path d={imPath} fill="none" stroke={WAVEFORM_COLORS.im} strokeWidth="2" className="dash-flow-slow" />
        <text x={t8 + 12} y="28" fill={WAVEFORM_COLORS.im} fontSize="11" dominantBaseline="middle">励磁电流</text>
      </g>

      {/* Time axis */}
      <line x1={t1} y1="312" x2={t8} y2="312" stroke="#525252" strokeWidth="2" markerEnd="url(#arrowTealAnim)" />
      <text x={(t1 + t8) / 2} y="330" fill="#737373" fontSize="11" textAnchor="middle">时间 t →</text>

      {/* Phase markers and labels */}
      {timeMarkers.map((m, i) => (
        <g key={`pl${i}`}>
          <line x1={m.t} y1="255" x2={m.t} y2="262" stroke="#525252" strokeWidth="1.5" />
          <text x={m.t} y="296" fill="#a3a3a3" fontSize="10" textAnchor="middle" fontFamily="JetBrains Mono, monospace">{m.label}</text>
        </g>
      ))}

      {/* Legend */}
      <g transform="translate(80, 356)">
        <rect x="0" y="-8" width="14" height="14" fill="rgba(20,184,166,0.15)" />
        <text x="20" y="0" fill="#a3a3a3" fontSize="10" dominantBaseline="middle">Q1/Q2 ON (能量传输)</text>
        <rect x="170" y="-8" width="14" height="14" fill="rgba(245,158,11,0.15)" />
        <text x="190" y="0" fill="#a3a3a3" fontSize="10" dominantBaseline="middle">死区时间</text>
        <rect x="270" y="-8" width="14" height="14" fill="rgba(34,197,94,0.15)" />
        <text x="290" y="0" fill="#a3a3a3" fontSize="10" dominantBaseline="middle">体二极管导通 (ZVS)</text>
        <rect x="430" y="-8" width="14" height="14" fill="rgba(239,68,68,0.15)" />
        <text x="450" y="0" fill="#a3a3a3" fontSize="10" dominantBaseline="middle">Vds高电平</text>
      </g>

      {/* Phase description */}
      <text x="80" y="386" fill="#a3a3a3" fontSize="10" fontFamily="JetBrains Mono, monospace">t₁→t₂: Q1导通, 正半周能量传输 | t₂→t₃: 死区, Coss充放电 | t₃→t₄: Q2体二极管导通, ZVS准备</text>
      <text x="80" y="401" fill="#a3a3a3" fontSize="10" fontFamily="JetBrains Mono, monospace">t₄→t₅: Q2导通, 负半周能量传输 | t₅→t₆: 死区, Coss充放电 | t₆→t₁': Q1体二极管导通, ZVS准备</text>
    </svg>
  )
}

function CurrentFlowCircuitSVG() {
  const [phase, setPhase] = useState(0)

  const phases = [
    { id: 0, label: 't₁-t₂', name: 'Q1 ON', desc: '正半周能量传输', color: '#14b8a6' },
    { id: 1, label: 't₂-t₃', name: '死区', desc: 'Q1关断, Coss充放电', color: '#f59e0b' },
    { id: 2, label: 't₃-t₄', name: 'D2导通', desc: 'Q2体二极管导通, ZVS准备', color: '#22c55e' },
    { id: 3, label: 't₄-t₅', name: 'Q2 ON', desc: '负半周能量传输, ZVS实现', color: '#14b8a6' },
    { id: 4, label: 't₅-t₆', name: '死区', desc: 'Q2关断, Coss充放电', color: '#f59e0b' },
    { id: 5, label: 't₆-t₁', name: 'D1导通', desc: 'Q1体二极管导通, ZVS准备', color: '#22c55e' },
  ]

  const activePhase = phases[phase]
  const q1Active = phase === 0 || phase === 5
  const q2Active = phase === 2 || phase === 3
  const d1Active = phase === 0 || phase === 1 || phase === 5
  const d2Active = phase === 2 || phase === 3 || phase === 4
  const q1BodyDiode = phase === 5
  const q2BodyDiode = phase === 2

  /* Lm 励磁电流路径 — 只走 Lm，不经过变压器次级 */
  const lmPos = 'M 230 100 L 230 120 L 210 120 L 210 190 L 230 190 L 230 340'
  const lmNeg = 'M 230 340 L 230 190 L 210 190 L 210 120 L 230 120 L 230 100'

  const tPosPath = 'M 25 49 L 25 30 L 90 30 L 90 75 L 90 100 L 122 100 L 128 100 L 185 100 L 230 100 L 230 120 L 260 120 L 260 190 L 230 190 L 230 340 M 300 150 L 300 120 L 320 120 L 340 120 L 500 120 L 500 135 L 500 145 L 500 150 L 300 150'
  const tNegPath = 'M 230 340 L 90 340 L 90 280 L 90 235 L 90 100 L 122 100 L 128 100 L 185 100 L 230 100 L 230 120 L 260 120 L 260 190 L 230 190 L 230 340 M 300 150 L 300 180 L 320 180 L 340 180 L 340 120 L 500 120 L 500 135 L 500 145 L 500 150 L 300 150'
  const tDeadPos = 'M 230 100 L 230 120 L 260 120 L 260 190 L 230 190 L 230 340'
  const tDeadNeg = 'M 230 100 L 230 120 L 260 120 L 260 190 L 230 190 L 230 340'
  const tBodyQ2 = 'M 230 340 L 90 340 L 90 280 L 90 235 L 90 100 L 122 100 L 128 100 L 185 100 L 230 100 L 230 120 L 260 120 L 260 190 L 230 190 L 230 340 M 300 150 L 300 180 L 320 180 L 340 180 L 340 120 L 500 120 L 500 135 L 500 145 L 500 150 L 300 150'
  const tBodyQ1 = 'M 25 49 L 25 30 L 90 30 L 90 75 L 90 100 L 122 100 L 128 100 L 185 100 L 230 100 L 230 120 L 260 120 L 260 190 L 230 190 L 230 340 M 300 150 L 300 120 L 320 120 L 340 120 L 500 120 L 500 135 L 500 145 L 500 150 L 300 150'

  const currentPaths = [
    { lm: lmPos, t: tPosPath, colorLm: '#22c55e', colorT: '#14b8a6', label: '正半周: Lm电流+T传递电流' },
    { lm: lmPos, t: tDeadPos, colorLm: '#22c55e', colorT: '#f59e0b', label: '死区: Lm电流+T环流' },
    { lm: lmNeg, t: tBodyQ2, colorLm: '#22c55e', colorT: '#22c55e', label: 'Q2体二极管: Lm电流+T传递电流' },
    { lm: lmNeg, t: tNegPath, colorLm: '#22c55e', colorT: '#14b8a6', label: '负半周: Lm电流+T传递电流' },
    { lm: lmNeg, t: tDeadNeg, colorLm: '#22c55e', colorT: '#f59e0b', label: '死区: Lm电流+T环流' },
    { lm: lmPos, t: tBodyQ1, colorLm: '#22c55e', colorT: '#22c55e', label: 'Q1体二极管: Lm电流+T传递电流' },
  ]

  const currentPath = currentPaths[phase]

  return (
    <div>
      {/* Phase selector */}
      <div className="flex flex-wrap gap-1.5 mb-3 justify-center">
        {phases.map((p) => (
          <button
            key={p.id}
            onClick={() => setPhase(p.id)}
            className={`px-2 py-1 rounded text-xs font-medium transition-all font-mono border ${
              phase === p.id
                ? 'text-white shadow-sm'
                : 'bg-bg/80 text-text-secondary hover:bg-surface-elevated border-border/50'
            }`}
            style={phase === p.id ? { backgroundColor: p.color, borderColor: p.color } : {}}
          >
            <span className="block">{p.label}</span>
            <span className="block text-[10px] opacity-80">{p.name}</span>
          </button>
        ))}
      </div>

      {/* Phase info */}
      <div className="text-center mb-3">
        <span className="text-sm font-semibold" style={{ color: activePhase.color }}>{activePhase.name}</span>
        <span className="text-xs text-text-secondary ml-2">{activePhase.desc}</span>
        <span className="block text-xs text-text-muted mt-1">{currentPath.label}</span>
      </div>

      <svg viewBox="0 0 680 360" className="w-full max-w-3xl mx-auto h-auto" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="arrowTealCircuit" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <path d="M 0 0 L 8 4 L 0 8 L 2 4 Z" fill="#14b8a6" />
          </marker>
          <marker id="arrowAmberCircuit" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <path d="M 0 0 L 8 4 L 0 8 L 2 4 Z" fill="#f59e0b" />
          </marker>
          <marker id="arrowGreenCircuit" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <path d="M 0 0 L 8 4 L 0 8 L 2 4 Z" fill="#22c55e" />
          </marker>
        </defs>

        {/* Vin 输入电源 */}
        <circle cx="25" cy="65" r="16" fill="none" stroke="#a3a3a3" strokeWidth="2" />
        <text x="25" y="58" fill="#a3a3a3" fontSize="14" fontFamily="JetBrains Mono, monospace" textAnchor="middle">+</text>
        <text x="25" y="74" fill="#a3a3a3" fontSize="14" fontFamily="JetBrains Mono, monospace" textAnchor="middle">-</text>
        <text x="45" y="65" fill="#a3a3a3" fontSize="12" fontFamily="JetBrains Mono, monospace" textAnchor="start">Vin</text>

        {/* Vin+ — 从圆圈顶部到Vin+线，再到Q1 D */}
        <line x1="25" y1="49" x2="25" y2="30" stroke="#a3a3a3" strokeWidth="2" />
        <line x1="25" y1="30" x2="90" y2="30" stroke="#a3a3a3" strokeWidth="2" />

        {/* Vin- 到 GND */}
        <line x1="25" y1="81" x2="25" y2="340" stroke="#a3a3a3" strokeWidth="2" />
        <line x1="90" y1="280" x2="90" y2="340" stroke="#a3a3a3" strokeWidth="2" />
        <line x1="25" y1="340" x2="230" y2="340" stroke="#a3a3a3" strokeWidth="2" />
        <text x="10" y="355" fill="#a3a3a3" fontSize="12" fontFamily="JetBrains Mono, monospace">GND</text>

        {/* Q1 标准 NMOS — D(y=30) S(y=75) */}
        <line x1="90" y1="30" x2="90" y2="75" stroke="#a3a3a3" strokeWidth="2" />
        <line x1="75" y1="52" x2="90" y2="52" stroke={q1Active ? '#14b8a6' : '#a3a3a3'} strokeWidth={q1Active ? '3' : '2'} />
        <line x1="85" y1="75" x2="95" y2="75" stroke="#a3a3a3" strokeWidth="2" />
        <line x1="100" y1="30" x2="100" y2="75" stroke={q1BodyDiode ? '#22c55e' : '#a3a3a3'} strokeWidth={q1BodyDiode ? '3' : '1.5'} />
        <line x1="96" y1="30" x2="104" y2="30" stroke={q1BodyDiode ? '#22c55e' : '#a3a3a3'} strokeWidth={q1BodyDiode ? '3' : '1.5'} />
        <path d="M 100 30 L 96 42 L 104 42 Z" fill={q1BodyDiode ? '#22c55e' : '#a3a3a3'} />
        <text x="65" y="52" fill={q1Active ? '#14b8a6' : q1BodyDiode ? '#22c55e' : '#a3a3a3'} fontSize="12" fontFamily="JetBrains Mono, monospace" textAnchor="end">Q1</text>

        {/* Q2 标准 NMOS — D(y=235) S(y=280) */}
        <line x1="90" y1="235" x2="90" y2="280" stroke="#a3a3a3" strokeWidth="2" />
        <line x1="75" y1="257" x2="90" y2="257" stroke={q2Active ? '#f59e0b' : '#a3a3a3'} strokeWidth={q2Active ? '3' : '2'} />
        <line x1="85" y1="280" x2="95" y2="280" stroke="#a3a3a3" strokeWidth="2" />
        <line x1="100" y1="235" x2="100" y2="280" stroke={q2BodyDiode ? '#22c55e' : '#a3a3a3'} strokeWidth={q2BodyDiode ? '3' : '1.5'} />
        <line x1="96" y1="235" x2="104" y2="235" stroke={q2BodyDiode ? '#22c55e' : '#a3a3a3'} strokeWidth={q2BodyDiode ? '3' : '1.5'} />
        <path d="M 100 235 L 96 247 L 104 247 Z" fill={q2BodyDiode ? '#22c55e' : '#a3a3a3'} />
        <text x="65" y="257" fill={q2Active ? '#f59e0b' : q2BodyDiode ? '#22c55e' : '#a3a3a3'} fontSize="12" fontFamily="JetBrains Mono, monospace" textAnchor="end">Q2</text>

        {/* Q1 S → SW */}
        <line x1="90" y1="75" x2="90" y2="100" stroke="#a3a3a3" strokeWidth="2" />
        {/* Q2 D → SW */}
        <line x1="90" y1="235" x2="90" y2="100" stroke="#a3a3a3" strokeWidth="2" />
        {/* SW 节点 */}
        <circle cx="90" cy="100" r="3.5" fill="#f5f5f5" stroke="#a3a3a3" strokeWidth="1" />
        <text x="70" y="88" fill="#f5f5f5" fontSize="10" fontFamily="JetBrains Mono, monospace" textAnchor="end">SW</text>

        {/* SW 到 Cr */}
        <line x1="90" y1="100" x2="120" y2="100" stroke="#a3a3a3" strokeWidth="2" />

        {/* Cr — 水平电容 */}
        <line x1="122" y1="90" x2="122" y2="110" stroke="#f59e0b" strokeWidth="2" />
        <line x1="128" y1="90" x2="128" y2="110" stroke="#f59e0b" strokeWidth="2" />
        <text x="125" y="72" fill="#f59e0b" fontSize="12" fontFamily="JetBrains Mono, monospace" textAnchor="middle">Cr</text>

        {/* Cr 到 Lr */}
        <line x1="128" y1="100" x2="155" y2="100" stroke="#a3a3a3" strokeWidth="2" />

        {/* Lr — 水平电感 */}
        <path d="M 155 100 q 5 -12 10 0 q 5 12 10 0 q 5 -12 10 0 q 5 12 10 0" fill="none" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round" />
        <text x="170" y="72" fill="#14b8a6" fontSize="12" fontFamily="JetBrains Mono, monospace" textAnchor="middle">Lr</text>

        {/* Lr 到并联节点 */}
        <line x1="185" y1="100" x2="230" y2="100" stroke="#a3a3a3" strokeWidth="2" />

        {/* 并联节点 — Lm 和 np 并联 */}
        <line x1="230" y1="100" x2="230" y2="120" stroke="#a3a3a3" strokeWidth="2" />

        {/* Lm — 垂直，并联在并联节点和 GND 之间 */}
        <line x1="230" y1="120" x2="210" y2="120" stroke="#22c55e" strokeWidth="2" />
        <path d="M 210 120 q 5 5 0 10 q -5 5 0 10 q 5 5 0 10 q -5 5 0 10 q 5 5 0 10 q -5 5 0 10 q 5 5 0 10" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
        <line x1="210" y1="190" x2="230" y2="190" stroke="#22c55e" strokeWidth="2" />
        <text x="220" y="112" fill="#22c55e" fontSize="12" fontFamily="JetBrains Mono, monospace" textAnchor="middle">Lm</text>
        <line x1="230" y1="190" x2="230" y2="340" stroke="#22c55e" strokeWidth="2" />

        {/* np 原边绕组 — 垂直，并联在并联节点和 GND 之间 */}
        <line x1="230" y1="120" x2="260" y2="120" stroke="#a3a3a3" strokeWidth="2" />
        <path d="M 260 120 q 5 5 0 10 q -5 5 0 10 q 5 5 0 10 q -5 5 0 10 q 5 5 0 10 q -5 5 0 10 q 5 5 0 10" fill="none" stroke="#a3a3a3" strokeWidth="2" strokeLinecap="round" />
        <line x1="260" y1="190" x2="230" y2="190" stroke="#a3a3a3" strokeWidth="2" />
        <text x="265" y="148" fill="#a3a3a3" fontSize="12" fontFamily="JetBrains Mono, monospace" textAnchor="start">np</text>
        <line x1="230" y1="190" x2="230" y2="340" stroke="#a3a3a3" strokeWidth="2" />
        <circle cx="262" cy="125" r="2.5" fill="#a3a3a3" />

        {/* 耦合线 */}
        <line x1="268" y1="125" x2="292" y2="125" stroke="#a3a3a3" strokeDasharray="4 3" strokeWidth="1.5" />
        <line x1="268" y1="185" x2="292" y2="185" stroke="#a3a3a3" strokeDasharray="4 3" strokeWidth="1.5" />

        {/* 上次级 ns 绕组 */}
        <line x1="300" y1="120" x2="300" y2="150" stroke="#a3a3a3" strokeWidth="2" />
        <path d="M 300 120 q 5 5 0 10 q -5 5 0 10 q 5 5 0 10" fill="none" stroke="#a3a3a3" strokeWidth="2" strokeLinecap="round" />
        <circle cx="302" cy="125" r="2.5" fill="#a3a3a3" />
        <text x="305" y="132" fill="#a3a3a3" fontSize="10" fontFamily="JetBrains Mono, monospace" textAnchor="start">ns</text>

        {/* 中心抽头 */}
        <line x1="300" y1="150" x2="580" y2="150" stroke="#a3a3a3" strokeWidth="2" />
        <text x="585" y="160" fill="#a3a3a3" fontSize="10" fontFamily="JetBrains Mono, monospace" textAnchor="start">Vo-</text>

        {/* 下次级 ns 绕组 */}
        <line x1="300" y1="150" x2="300" y2="180" stroke="#a3a3a3" strokeWidth="2" />
        <path d="M 300 150 q 5 5 0 10 q -5 5 0 10 q 5 5 0 10" fill="none" stroke="#a3a3a3" strokeWidth="2" strokeLinecap="round" />
        <circle cx="302" cy="175" r="2.5" fill="#a3a3a3" />
        <text x="305" y="162" fill="#a3a3a3" fontSize="10" fontFamily="JetBrains Mono, monospace" textAnchor="start">ns</text>

        {/* D1 — 水平，阳极接上次级上端，阴极向右接Vo+ */}
        <line x1="300" y1="120" x2="320" y2="120" stroke="#a3a3a3" strokeWidth="2" />
        <line x1="320" y1="120" x2="340" y2="120" stroke={d1Active ? '#22c55e' : '#a3a3a3'} strokeWidth={d1Active ? '3' : '2'} />
        <path d="M 320 112 L 320 128 L 340 120 Z" fill={d1Active ? '#22c55e' : '#a3a3a3'} />
        <line x1="320" y1="112" x2="320" y2="128" stroke={d1Active ? '#22c55e' : '#a3a3a3'} strokeWidth={d1Active ? '3' : '2'} />
        <text x="325" y="100" fill={d1Active ? '#22c55e' : '#a3a3a3'} fontSize="11" fontFamily="JetBrains Mono, monospace">D1</text>

        {/* Vo+ 线 */}
        <line x1="340" y1="120" x2="580" y2="120" stroke="#a3a3a3" strokeWidth="2" />
        <text x="585" y="90" fill="#a3a3a3" fontSize="10" fontFamily="JetBrains Mono, monospace" textAnchor="start">Vo+</text>

        {/* D2 — 水平，阳极接下次级下端，阴极向右 */}
        <line x1="300" y1="180" x2="320" y2="180" stroke="#a3a3a3" strokeWidth="2" />
        <line x1="320" y1="180" x2="340" y2="180" stroke={d2Active ? '#22c55e' : '#a3a3a3'} strokeWidth={d2Active ? '3' : '2'} />
        <path d="M 320 172 L 320 188 L 340 180 Z" fill={d2Active ? '#22c55e' : '#a3a3a3'} />
        <line x1="320" y1="172" x2="320" y2="188" stroke={d2Active ? '#22c55e' : '#a3a3a3'} strokeWidth={d2Active ? '3' : '2'} />
        <text x="325" y="160" fill={d2Active ? '#22c55e' : '#a3a3a3'} fontSize="11" fontFamily="JetBrains Mono, monospace">D2</text>

        {/* D1/D2 阴极连接竖线 */}
        <line x1="340" y1="120" x2="340" y2="180" stroke="#a3a3a3" strokeWidth="2" />

        {/* Cf 输出滤波电容 */}
        <line x1="500" y1="120" x2="500" y2="135" stroke="#a3a3a3" strokeWidth="2" />
        <line x1="495" y1="135" x2="505" y2="135" stroke="#a3a3a3" strokeWidth="2" />
        <line x1="495" y1="145" x2="505" y2="145" stroke="#a3a3a3" strokeWidth="2" />
        <line x1="500" y1="145" x2="500" y2="150" stroke="#a3a3a3" strokeWidth="2" />
        <text x="510" y="95" fill="#a3a3a3" fontSize="12" fontFamily="JetBrains Mono, monospace">Cf</text>

        {/* Io 输出电流 */}
        <line x1="520" y1="110" x2="550" y2="110" stroke="#a3a3a3" strokeWidth="2" />
        <path d="M 550 110 L 540 106 L 540 114 Z" fill="#a3a3a3" />
        <text x="555" y="102" fill="#a3a3a3" fontSize="11" fontFamily="JetBrains Mono, monospace">Io</text>

        {/* Lm 励磁电流路径 — 只走 Lm，不经过变压器次级 */}
        <path
          d={currentPath.lm}
          fill="none"
          stroke={currentPath.colorLm}
          strokeWidth="2.5"
          strokeDasharray="6 4"
          strokeLinecap="round"
          opacity="0.75"
          className="dash-flow"
        />

        {/* T 原边→次级传递电流路径 */}
        <path
          d={currentPath.t}
          fill="none"
          stroke={currentPath.colorT}
          strokeWidth="3"
          strokeDasharray="8 6"
          strokeLinecap="round"
          opacity="0.85"
          className="dash-flow"
        />
      </svg>
    </div>
  )
}

function ZVSZoomAnimatedSVG({ idSuffix = '' }: { idSuffix?: string }) {
  const tA = 80
  const tB = 200
  const tC = 320
  const tD = 460

  return (
    <svg viewBox="0 0 600 320" className="w-full mx-auto h-auto" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id={`arrowTealZvs${idSuffix}`} markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
          <path d="M 0 0 L 7 3.5 L 0 7 L 1.5 3.5 Z" fill="#14b8a6" />
        </marker>
        <marker id={`arrowGreenZvs${idSuffix}`} markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
          <path d="M 0 0 L 7 3.5 L 0 7 L 1.5 3.5 Z" fill="#22c55e" />
        </marker>
        <marker id={`arrowRedZvs${idSuffix}`} markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
          <path d="M 0 0 L 7 3.5 L 0 7 L 1.5 3.5 Z" fill="#ef4444" />
        </marker>
        <linearGradient id={`vdsFallZvs${idSuffix}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
      </defs>

      {/* Grid */}
      <g stroke="#404040" strokeWidth="1" opacity="0.2">
        {[60, 100, 140, 180, 220, 260, 300, 340, 380, 420, 460, 500, 540].map((x) => (
          <line key={`v${x}`} x1={x} y1="0" x2={x} y2="180" />
        ))}
        {[30, 70, 110, 150, 180].map((y) => (
          <line key={`h${y}`} x1="60" y1={y} x2="580" y2={y} />
        ))}
      </g>

      {/* ========== Vgs_Q2 (Top) ========== */}
      <text x="55" y="15" fill="#a3a3a3" fontSize="12" textAnchor="end" fontFamily="JetBrains Mono, monospace">Vgs_Q2</text>
      <line x1="60" y1="20" x2="580" y2="20" stroke="#525252" strokeWidth="1" />
      <path d={`M 60 20 L ${tA} 20 L ${tD} 20 L ${tD} 5 L ${tD + 60} 5 L ${tD + 60} 20 L 580 20`} fill="none" stroke="#14b8a6" strokeWidth="2" />
      <text x={tD + 65} y="12" fill="#14b8a6" fontSize="10" fontFamily="JetBrains Mono, monospace">Vgs上升</text>

      {/* ========== Vds_Q2 (Middle) ========== */}
      <text x="55" y="65" fill="#a3a3a3" fontSize="12" textAnchor="end" fontFamily="JetBrains Mono, monospace">Vds_Q2</text>
      <line x1="60" y1="70" x2="580" y2="70" stroke="#525252" strokeWidth="1" />
      <path d={`M 60 70 L ${tA} 70 L ${tB} 70 L ${tC} 100 L ${tD} 100 L ${tD + 60} 100 L ${tD + 60} 70 L 580 70`} fill="none" stroke="#ef4444" strokeWidth="2" />
      <line x1={tB} y1="70" x2={tC} y2="100" stroke={`url(#vdsFallZvs${idSuffix})`} strokeWidth="2" />

      {/* Vin label (above Vds high level) */}
      <text x={tB + 8} y="62" fill="#ef4444" fontSize="10" fontFamily="JetBrains Mono, monospace">Vin</text>
      {/* 0V label (below Vds low level) */}
      <text x={tC + 8} y="112" fill="#22c55e" fontSize="10" fontFamily="JetBrains Mono, monospace">0V</text>

      {/* ========== Ir (Bottom) ========== */}
      <text x="55" y="125" fill="#a3a3a3" fontSize="12" textAnchor="end" fontFamily="JetBrains Mono, monospace">Ir</text>
      <line x1="60" y1="130" x2="580" y2="130" stroke="#525252" strokeWidth="1" />
      <path d={`M 60 130 L ${tA} 130 L ${tD} 120`} fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="8 6" strokeLinecap="round" className="dash-flow" />
      <text x={tA + 8} y="140" fill="#f59e0b" fontSize="10" fontFamily="JetBrains Mono, monospace">谐振电流续流</text>

      {/* ========== Zone labels (above Vgs) ========== */}
      <rect x={tA} y="5" width={tD - tA} height="50" fill="rgba(245,158,11,0.08)" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 2" opacity="0.5" />
      <text x={(tA + tD) / 2} y="10" fill="#f59e0b" fontSize="9" textAnchor="middle" fontFamily="JetBrains Mono, monospace">死区时间</text>

      <rect x={tC} y="5" width={tD - tC} height="50" fill="rgba(239,68,68,0.08)" stroke="#ef4444" strokeWidth="1" strokeDasharray="3 2" opacity="0.5" />
      <text x={(tC + tD) / 2} y="10" fill="#ef4444" fontSize="9" textAnchor="middle" fontFamily="JetBrains Mono, monospace">体二极管导通</text>

      {/* ========== Timing annotations (staggered, outside waveforms) ========== */}
      <line x1={tA} y1="155" x2={tA} y2="180" stroke="#525252" strokeWidth="1" strokeDasharray="2 2" />
      <text x={tA} y="195" fill="#14b8a6" fontSize="10" textAnchor="middle" fontFamily="JetBrains Mono, monospace">tA: Q1关断</text>

      <line x1={tB} y1="155" x2={tB} y2="180" stroke="#525252" strokeWidth="1" strokeDasharray="2 2" />
      <text x={tB} y="210" fill="#f59e0b" fontSize="10" textAnchor="middle" fontFamily="JetBrains Mono, monospace">tB: Vds开始下降</text>

      <line x1={tC} y1="155" x2={tC} y2="180" stroke="#525252" strokeWidth="1" strokeDasharray="2 2" />
      <text x={tC} y="195" fill="#ef4444" fontSize="10" textAnchor="middle" fontFamily="JetBrains Mono, monospace">tC: Vds=0</text>

      <line x1={tD} y1="155" x2={tD} y2="180" stroke="#525252" strokeWidth="1" strokeDasharray="2 2" />
      <text x={tD} y="210" fill="#22c55e" fontSize="10" textAnchor="middle" fontFamily="JetBrains Mono, monospace">tD: Vgs上升, ZVS导通</text>

      {/* ========== Arrow annotations (clear of waveforms) ========== */}
      <line x1={tC} y1="55" x2={tC} y2="68" stroke="#22c55e" strokeWidth="1" strokeDasharray="2 2" markerEnd={`url(#arrowGreenZvs${idSuffix})`} />
      <text x={tC + 8} y="60" fill="#22c55e" fontSize="10" fontFamily="JetBrains Mono, monospace">Vds=0</text>

      <line x1={tD} y1="22" x2={tD} y2="35" stroke="#14b8a6" strokeWidth="1" strokeDasharray="2 2" />
      <text x={tD + 65} y="30" fill="#14b8a6" fontSize="10" fontFamily="JetBrains Mono, monospace">ZVS导通</text>

      <line x1={tA} y1="55" x2={tA} y2="68" stroke="#ef4444" strokeWidth="1" strokeDasharray="2 2" markerEnd={`url(#arrowRedZvs${idSuffix})`} />
      <text x={tA + 8} y="60" fill="#ef4444" fontSize="10" fontFamily="JetBrains Mono, monospace">Q1关断</text>

      {/* ========== Description ========== */}
      <text x="320" y="245" fill="#a3a3a3" fontSize="10" textAnchor="middle">
        死区时间内，谐振电流经Q2体二极管续流，将Vds_Q2钳位至接近0V，实现ZVS。
      </text>
      <text x="320" y="260" fill="#a3a3a3" fontSize="10" textAnchor="middle">
        tA→tB: Coss充放电 | tB→tC: Vds线性下降 | tC→tD: 体二极管导通窗口
      </text>
    </svg>
  )
}

/* ─── Page ─── */

export default function Operation() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
      {/* Header */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        custom={0}
        className="mb-12 md:mb-16"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary-dark/40 flex items-center justify-center">
            <Activity className="w-6 h-6 text-primary-light" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gradient tracking-tight">
            LLC 工作原理
          </h1>
        </div>
        <p className="text-text-secondary max-w-2xl text-lg leading-relaxed">
          深入解析 LLC 谐振变换器的三种开关工作模式、关键波形特征、ZVS 实现机制以及增益-频率特性曲线。理解这些内容，是进行参数设计与优化调试的基础。
        </p>
      </motion.div>

      <div className="space-y-6 md:space-y-8">
        {/* Section 1: Switching Modes */}
        <SectionCard index={1} header={<SectionTitle
            icon={ToggleLeft}
            title="开关工作模式"
            subtitle="根据开关频率与谐振频率的相对关系划分三种模式"
          />}>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-bg/50 rounded-lg p-5 border border-border/50">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-primary-light/20 flex items-center justify-center">
                  <span className="text-primary-light font-bold text-sm">1</span>
                </div>
                <h3 className="text-sm font-semibold text-text-primary">
                  Region 1: f &gt; fr1（高于第一谐振）
                </h3>
              </div>
              <p className="text-text-secondary text-sm leading-relaxed mb-3">
                类似SRC，Lm被输出电压钳位，不参与谐振。轻载时可能出现DCM。ZVS可靠但开关损耗增大。
              </p>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span className="text-success">ZVS 可靠，但开关损耗增大</span>
              </div>
            </div>

            <div className="bg-bg/50 rounded-lg p-5 border border-primary/30">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-primary-light font-bold text-sm">2</span>
                </div>
                <h3 className="text-sm font-semibold text-text-primary">
                  Region 2: fr2 &lt; f &lt; fr1（最优区间）
                </h3>
              </div>
              <p className="text-text-secondary text-sm leading-relaxed mb-3">
                Lm参与谐振，可获得高增益。ZVS+ZCS。最优设计区域。
              </p>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span className="text-success">最优工作区域，推荐设计点</span>
              </div>
            </div>

            <div className="bg-bg/50 rounded-lg p-5 border border-accent/30">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                  <span className="text-accent font-bold text-sm">3</span>
                </div>
                <h3 className="text-sm font-semibold text-text-primary">
                  Region 3: f &lt; fr2（低于第二谐振）
                </h3>
              </div>
              <p className="text-text-secondary text-sm leading-relaxed mb-3">
                容性区，ZCS。应避免。
              </p>
              <div className="flex items-center gap-2 text-sm">
                <AlertCircle className="w-4 h-4 text-accent" />
                <span className="text-accent">容性区，ZCS，设计时应避免</span>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-primary-dark/20 rounded-lg border border-primary/20">
            <h4 className="text-sm font-semibold text-primary-light mb-2">
              模式边界条件
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MathBlock
                latex="f_{r1} = \\frac{1}{2\\pi\\sqrt{L_r C_r}}"
                important
              />
              <MathBlock
                latex="f_{r2} = \\frac{1}{2\\pi\\sqrt{(L_r + L_m) C_r}} = \\frac{f_{r1}}{\\sqrt{1 + k}}"
                important
              />
            </div>
            <p className="text-text-secondary text-sm mt-2">
              fr2 始终小于 fr1，因此 LLC 总是具有两个不同的谐振频率点。Region 1 和 Region 2 是 ZVS 工作区，Region 3 是 ZCS 工作区，设计时应避免。
            </p>
          </div>
        </SectionCard>

        {/* Section 2: Key Waveforms */}
        <SectionCard index={2} header={<SectionTitle
            icon={Waves}
            title="关键波形"
            subtitle="稳态运行时的电压与电流波形特征"
          />}>

          <KeyWaveformsSVG />

          <p className="text-text-secondary text-sm mt-4 leading-relaxed">
            上图为一个开关周期内六组信号的时间关系（自绘矢量图，不依赖任何图片素材）。
            图中时间刻度 <code className="font-mono text-text-primary">t₁ … t₁′</code> 与下一节「开关过程动画」共用同一套命名，
            两张图可对照阅读；下方说明按图中自上而下的行序排列，色点与曲线一一对应。
          </p>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {WAVE_LEGEND.map((item) => (
              <div
                key={item.title}
                className="p-4 bg-bg/50 rounded-lg border-l-2"
                style={{ borderLeftColor: item.chips[0].color }}
              >
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
                  {item.chips.map((c) => (
                    <span key={c.label} className="inline-flex items-center gap-1.5 text-[11px] font-mono text-text-secondary">
                      <span className="w-3 h-3 rounded-full inline-block shrink-0" style={{ backgroundColor: c.color }} />
                      {c.label}
                    </span>
                  ))}
                  <span className="ml-auto text-[10px] text-text-muted">{item.row}</span>
                </div>
                <h4 className="text-sm font-semibold text-text-primary mb-1">{item.title}</h4>
                <p className="text-text-secondary text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <figure className="mt-8">
            <div className="bg-bg/50 rounded-lg p-4">
              <img
                src="./LLC_key_waveform.svg"
                className="w-full max-w-3xl mx-auto invert brightness-90"
                alt="PLECS 仿真实测波形：输出侧、MOSFET 侧与二极管侧共 8 个测量量的示波器拼图"
              />
            </div>
            <figcaption className="mt-3 text-xs text-text-muted leading-relaxed">
              <span className="text-text-secondary font-medium">附图 · PLECS 仿真实测</span>
              （4 行 × 2 列共 8 个测量量，与上图那六组信号不是同一套测量量）。
              左列自上而下为 <code className="font-mono">Vo</code>、<code className="font-mono">Io</code>、
              <code className="font-mono">&lt;MOSFET current&gt;</code>、<code className="font-mono">&lt;MOSFET voltage&gt;</code>；
              右列为 <code className="font-mono">ILm</code>、<code className="font-mono">ILr</code>、
              <code className="font-mono">&lt;Diode current&gt;</code>、<code className="font-mono">&lt;Diode voltage&gt;</code>。
              注意 PLECS 是<b>按测量组上色</b>的（MOSFET 侧红、二极管侧蓝、辅助量黑），
              本页为适配深色主题对该图整体反色，于是红→青、蓝→黄、黑→近白，
              <b>8 条曲线只剩 3 种显示色</b>，同组之间无法区分。
              因此这张图只用来看真实仿真下的波形形态与相位关系，
              要逐条区分信号请以上方的自绘矢量图为准。
            </figcaption>
          </figure>
        </SectionCard>

        {/* Section 2.5: Animated Switching Process */}
        <SectionCard index={2} header={<SectionTitle
            icon={Zap}
            title="开关过程动画"
            subtitle="半桥LLC的实时开关波形与电流流动示意"
          />}>

          <div className="bg-bg/50 rounded-lg p-4 mb-6">
            <SwitchingAnimationSVG />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-bg/50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-primary-light mb-3">谐振电流流动路径</h4>
              <CurrentFlowCircuitSVG />
              <p className="text-text-secondary text-xs mt-3 leading-relaxed">
                点击上方按钮切换不同阶段，查看对应开关状态下的电流路径。高亮元件表示当前导通的开关/二极管，虚线箭头表示谐振电流流动方向。青色代表能量传输阶段，琥珀色代表死区时间，绿色代表体二极管导通（ZVS准备）。
              </p>
            </div>
            <div className="bg-bg/50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-primary-light mb-3">ZVS 过程特写</h4>
              <ZVSZoomAnimatedSVG idSuffix="-top" />
              <p className="text-text-secondary text-xs mt-3 leading-relaxed">
                死区时间内，Q2 体二极管导通将 Vds_Q2 钳位至接近 0V。随后 Vgs_Q2 上升，MOSFET 在零电压条件下导通，实现 ZVS。上图标注了 tA~tD 四个关键时序点，清晰展示 ZVS 的实现过程。
              </p>
            </div>
          </div>
        </SectionCard>

        {/* Section 3: ZVS Conditions */}
        <SectionCard index={3} header={<SectionTitle
            icon={CheckCircle2}
            title="ZVS 条件"
            subtitle="为什么 LLC 能实现零电压开关（ZVS）及其必要条件"
          />}>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <p className="text-text-primary leading-relaxed">
                LLC 谐振变换器最核心的优势之一，是能够在较宽负载范围内实现原边 MOSFET 的
                <strong className="text-primary-light">零电压开关（ZVS）</strong>
                。ZVS 意味着 MOSFET 在漏极电压已降至零（或体二极管正向导通）后才导通，消除了开通损耗（Coss 充放电损耗）。
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-success text-xs font-bold">1</span>
                  </div>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    <strong className="text-text-primary">感性区运行：</strong>
                    感性区运行的条件是输入阻抗呈感性，即相位 &gt; 0°。对于典型设计推荐工作在 Region 1 或 Region 2。在 Region 1 (fsw &gt; fr1) 或 Region 2 (fr2 &lt; fsw &lt; fr1) 均可实现 ZVS，其中 Region 2 可获得更高增益，Region 1 的 ZVS 更可靠。
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-success text-xs font-bold">2</span>
                  </div>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    <strong className="text-text-primary">足够的死区时间：</strong>
                    死区时间必须足够长，以完成对开关管结电容（Coss）的完全充放电。死区时间过短会导致 ZVS 失败。
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-success text-xs font-bold">3</span>
                  </div>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    <strong className="text-text-primary">足够的谐振电流：</strong>
                    死区时间内的谐振电流峰值必须满足能量条件，使存储在电感中的磁能将结电容完全放电。
                  </p>
                </div>
              </div>

              <div className="mt-4 p-3 bg-bg/50 rounded-lg border border-border/50">
                <p className="text-text-secondary text-sm mb-2">
                  ZVS 能量条件（半桥）：
                </p>
                <MathBlock
                  latex="\\frac{1}{2} L_m I_{m,off}^2 \\geq \\frac{1}{2} (2C_{oss,er} + C_j) V_{in,max}^2"
                  important
                />
                <p className="text-text-secondary text-xs mt-1 leading-relaxed">
                  其中 Lm 为励磁电感，I<sub>m,off</sub> 为关断时刻的励磁电流峰值，
                  V<sub>in,max</sub> 为最高输入电压（最恶劣工况）；右边是开关节点等效总输出电容的储能
                  —— 半桥时为 2·C<sub>oss,er</sub> + C<sub>j</sub>（两只开关管的输出电容之和 + 变压器/PCB 寄生），
                  <b>必须用能量相关等效电容 C<sub>oss,er</sub>（≡ 规格书 Co(er)）</b>，
                  <span className="text-primary-light">这与本站「公式推导」页的 ZVS 能量判据完全一致</span>。
                  关断时刻励磁电流峰值 I<sub>m,off</sub> = V<sub>in,min</sub> / (8 f<sub>max</sub> Lm)（半桥）。
                </p>
              </div>
            </div>

            <div className="bg-bg/50 rounded-lg p-4">
              <ZVSZoomAnimatedSVG idSuffix="-side" />
            </div>
          </div>

          <div className="mt-6 p-4 bg-accent/10 rounded-lg border border-accent/20">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-accent mb-1">
                  死区时间设计要点
                </h4>
                <p className="text-text-secondary text-sm leading-relaxed">
                  死区时间过短会导致 ZVS 失败，结电容通过 MOSFET 硬开关充放电，产生巨大的开通损耗与 EMI；死区时间过长则会增加体二极管导通损耗，降低效率，并可能在轻载时引起电流反向。典型设计值为开关周期的 2% ~ 5%，在 100kHz 时约为 200ns ~ 500ns。
                </p>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Section 4: Gain Characteristics */}
        <SectionCard index={4} header={<SectionTitle
            icon={TrendingUp}
            title="增益特性"
            subtitle="电压增益 M 与频率、负载的关系"
          />}>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="bg-bg/50 rounded-lg p-4">
              <GainChart k={5} Q={1} height={240} showCurrentQ={false} showLegend={false} showTitle={false} className="w-full" />
            </div>
            <div className="space-y-4">
              <p className="text-text-primary leading-relaxed">
                LLC 谐振变换器的电压增益定义为输出反射电压与输入电压之比（半桥取 2nVout/Vin，全桥取 nVout/Vin）：
              </p>
              <MathBlock
                latex="M = \\frac{n V_o}{V_{in}} \\;(\\text{全桥}) \\quad M = \\frac{2n V_o}{V_{in}} \\;(\\text{半桥})"
                important
              />
              <p className="text-text-secondary text-sm leading-relaxed">
                基于 FHA（First Harmonic Approximation）方法，完整的 LLC 电压增益方程为：
              </p>
              <MathBlock
                latex="M(f_n, k, Q) = \\frac{f_n^2 \\cdot k}{\\sqrt{(f_n^2(1+k)-1)^2 + f_n^2 k^2 Q^2 (f_n^2-1)^2}}"
                important
              />
              <p className="text-text-secondary text-sm leading-relaxed">
                其中 <span className="font-mono text-primary-light">fn = fsw / fr1</span> 为归一化频率，<span className="font-mono text-primary-light">k = Lm / Lr</span> 为电感比，<span className="font-mono text-primary-light">Q = Zr / Rac</span> 为品质因数。
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-bg/50 rounded-lg border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <Gauge className="w-4 h-4 text-primary-light" />
                <h4 className="text-sm font-semibold text-text-primary">频率调节</h4>
              </div>
              <p className="text-text-secondary text-sm leading-relaxed">
                增益在 Region 1 (f &gt; fr1) 随频率升高而单调下降；在 Region 2 (fr2 &lt; f &lt; fr1) 可能出现峰值增益；Region 3 (f &lt; fr2) 为容性区，应避免。
              </p>
            </div>
            <div className="p-4 bg-bg/50 rounded-lg border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <ArrowRight className="w-4 h-4 text-accent" />
                <h4 className="text-sm font-semibold text-text-primary">负载影响</h4>
              </div>
              <p className="text-text-secondary text-sm leading-relaxed">
                轻载时（Q 小）增益曲线峰值更高，且 Region 1 段更平缓 —— 同样幅度的增益变化需要更大的频率调节量，轻载/空载的调压裕度最紧；重载时（Q 大）峰值虽低，但 Region 1 段更陡，增益对频率更敏感（即控制增益更高），有利于稳压精度。
              </p>
            </div>
            <div className="p-4 bg-bg/50 rounded-lg border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-success" />
                <h4 className="text-sm font-semibold text-text-primary">峰值增益</h4>
              </div>
              <p className="text-text-secondary text-sm leading-relaxed">
                峰值大小由 k 和 Q 共同决定。设计时必须确保峰值增益大于所需的最大增益（对应最低输入电压、最大负载）。
              </p>
            </div>
          </div>
        </SectionCard>

        {/* Section 5: Design Trade-offs */}
        <SectionCard index={5} header={<SectionTitle
            icon={Scale}
            title="设计权衡"
            subtitle="效率、频率、损耗与体积之间的工程折中"
          />}>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-bg/50 rounded-lg border border-border/50">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-md bg-primary-dark/40 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-primary-light" />
                </div>
                <h3 className="text-sm font-semibold text-text-primary">
                  效率 vs 开关频率
                </h3>
              </div>
              <p className="text-text-secondary text-sm leading-relaxed mb-3">
                更高的开关频率可以减小磁性元件和电容体积，但会带来更大的开关损耗与磁芯损耗。LLC 通过 ZVS 消除了开通损耗，但关断损耗（与关断瞬间的 Ir 相关）和磁芯损耗（与频率成正比）仍然存在。
              </p>
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <span className="inline-block w-2 h-2 rounded-full bg-success" />
                推荐：100kHz ~ 300kHz 是功率密度与效率的较好平衡点
              </div>
            </div>

            <div className="p-5 bg-bg/50 rounded-lg border border-border/50">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-md bg-accent/20 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-accent" />
                </div>
                <h3 className="text-sm font-semibold text-text-primary">
                  导通损耗 vs 开关损耗
                </h3>
              </div>
              <p className="text-text-secondary text-sm leading-relaxed mb-3">
                导通损耗与 RMS 电流的平方成正比（I²R），开关损耗与开关频率和电压电流交越面积成正比。在轻载时开关损耗占主导；在重载时导通损耗占主导。LLC 的 ZVS 特性使得轻载效率优于传统 PWM 变换器。
              </p>
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <span className="inline-block w-2 h-2 rounded-full bg-success" />
                优化策略：选择低 RDS(on) 的 MOSFET 以降低导通损耗
              </div>
            </div>

            <div className="p-5 bg-bg/50 rounded-lg border border-border/50">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-md bg-success/20 flex items-center justify-center">
                  <Layers className="w-4 h-4 text-success" />
                </div>
                <h3 className="text-sm font-semibold text-text-primary">
                  变压器尺寸优化
                </h3>
              </div>
              <p className="text-text-secondary text-sm leading-relaxed mb-3">
                较大的 k（Lm/Lr）可减小励磁电流（环流），但峰值增益能力下降、轻载 ZVS 更难实现。需要注意 Lm = k·Lr 中的 Lr 本身随 k 变化：k 越大，按增益要求反解出的 Q 越小、Lr 越小，因此 k 与 Lm 并非简单正比，不能直接推论「k 大则磁芯小」——磁芯的磁通摆幅 ΔB 只由伏秒与 N·Ae 决定、与 Lm 无关，要得到更大的 Lm 只能在同一磁芯上增加匝数、或换用 Ae 更大的磁芯。较低的 k 峰值增益更高、轻载 ZVS 更容易，代价是励磁电流更大。
              </p>
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <span className="inline-block w-2 h-2 rounded-full bg-success" />
                典型范围：k = 3 ~ 10 为常见工程取值
              </div>
            </div>

            <div className="p-5 bg-bg/50 rounded-lg border border-border/50">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-md bg-primary-light/20 flex items-center justify-center">
                  <Waves className="w-4 h-4 text-primary-light" />
                </div>
                <h3 className="text-sm font-semibold text-text-primary">
                  谐振腔损耗
                </h3>
              </div>
              <p className="text-text-secondary text-sm leading-relaxed mb-3">
                谐振电容 Cr 在谐振时承受较大的交流电压，其等效串联电阻（ESR）和介质损耗（DF）会产生显著的功率损耗。谐振电感 Lr（或变压器漏感）的铜损与磁芯损耗同样不可忽视。
              </p>
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <span className="inline-block w-2 h-2 rounded-full bg-success" />
                建议：选用 NP0/C0G 或聚丙烯薄膜电容，降低 ESR
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-primary-dark/20 rounded-lg border border-primary/20">
            <h4 className="text-sm font-semibold text-primary-light mb-3">
              设计参数对性能的影响汇总
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-2 px-3 text-text-primary font-semibold">设计选择</th>
                    <th className="py-2 px-3 text-success font-semibold">优点</th>
                    <th className="py-2 px-3 text-danger font-semibold">缺点</th>
                  </tr>
                </thead>
                <tbody className="text-text-secondary">
                  <tr className="border-b border-border/50">
                    <td className="py-2 px-3 font-medium text-text-primary">高 k（&gt;8）</td>
                    <td className="py-2 px-3">环流小，导通损耗低</td>
                    <td className="py-2 px-3">ZVS 范围窄，峰值增益低，变压器匝数可能增多</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 px-3 font-medium text-text-primary">低 k（&lt;5）</td>
                    <td className="py-2 px-3">ZVS 范围宽，峰值增益高</td>
                    <td className="py-2 px-3">励磁电流大，励磁损耗高，变压器体积可能偏大</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 px-3 font-medium text-text-primary">高 Q（&gt;1，重载）</td>
                    <td className="py-2 px-3">增益曲线陡峭，调节范围窄</td>
                    <td className="py-2 px-3">峰值增益低，重载电流应力大，对元件容差敏感</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 px-3 font-medium text-text-primary">低 Q（&lt;0.5，轻载）</td>
                    <td className="py-2 px-3">峰值增益高，电流应力小</td>
                    <td className="py-2 px-3">增益曲线平坦，轻载频率可能较高，驱动/磁芯损耗增加</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium text-text-primary">高频率（&gt;300kHz）</td>
                    <td className="py-2 px-3">元件体积小，功率密度高</td>
                    <td className="py-2 px-3">磁芯损耗大，EMI 难控制</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-text-muted leading-relaxed">
              注：“调节范围窄/宽”指为覆盖相同输入电压范围所需的频率变化量。窄调节范围意味着对频率控制精度要求高，但系统响应快；宽调节范围意味着对元件容差容忍度高，但轻载时频率可能跑高。
            </p>
          </div>
        </SectionCard>
      </div>
    </div>
  )
}