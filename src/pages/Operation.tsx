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

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' as const },
  }),
}

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

/* ─── SVG Waveform Diagrams ─── */

function WaveformsSVG() {
  const W = 620
  const left = 60
  const right = 560
  const colors = {
    q1: '#14b8a6',
    q2: '#f59e0b',
    vds: '#ef4444',
    ir: '#14b8a6',
    im: '#22c55e',
    io: '#f59e0b',
  }

  return (
    <svg
      viewBox={`0 0 ${W} 540`}
      className="w-full max-w-3xl mx-auto h-auto"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Grid */}
      <g stroke="#404040" strokeWidth="1" opacity="0.25">
        {Array.from({ length: 14 }, (_, i) => left + i * 40).map((x) => (
          <line key={`v${x}`} x1={x} y1="20" x2={x} y2="490" />
        ))}
        {Array.from({ length: 11 }, (_, i) => 20 + i * 48).map((y) => (
          <line key={`h${y}`} x1={left} y1={y} x2={right} y2={y} />
        ))}
      </g>

      <defs>
        <marker id="arrTeal" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <circle cx="3" cy="3" r="2" fill={colors.q1} />
        </marker>
      </defs>

      {/* Vgs */}
      <g transform="translate(0, 10)">
        <text x={left - 12} y="28" fill="#a3a3a3" fontSize="12" textAnchor="end" dominantBaseline="middle">
          Vgs
        </text>
        <line x1={left} y1="40" x2={right} y2="40" stroke="#525252" strokeWidth="1" />
        <path
          d={`M ${left} 40 L ${left} 16 L 130 16 L 130 40 L 150 40 L 150 16 L 250 16 L 250 40 L 270 40 L 270 16 L 370 16 L 370 40 L 390 40 L 390 16 L 490 16 L 490 40 L 510 40 L 510 16 L ${right} 16 L ${right} 40`}
          fill="none"
          stroke={colors.q1}
          strokeWidth="2"
        />
        <path
          d={`M ${left} 40 L 130 40 L 130 16 L 150 16 L 150 40 L 250 40 L 250 16 L 270 16 L 270 40 L 370 40 L 370 16 L 390 16 L 390 40 L 490 40 L 490 16 L 510 16 L 510 40 L ${right} 40`}
          fill="none"
          stroke={colors.q2}
          strokeWidth="2"
          strokeDasharray="5 4"
        />
        <text x={right + 12} y="20" fill={colors.q1} fontSize="11" dominantBaseline="middle">Q1</text>
        <text x={right + 12} y="40" fill={colors.q2} fontSize="11" dominantBaseline="middle">Q2</text>
      </g>

      {/* Vds */}
      <g transform="translate(0, 90)">
        <text x={left - 12} y="28" fill="#a3a3a3" fontSize="12" textAnchor="end" dominantBaseline="middle">
          Vds
        </text>
        <line x1={left} y1="40" x2={right} y2="40" stroke="#525252" strokeWidth="1" />
        <path
          d={`M ${left} 40 L ${left} 8 L 125 8 L 125 40 L 150 40 L 150 8 L 245 8 L 245 40 L 270 40 L 270 8 L 365 8 L 365 40 L 390 40 L 390 8 L 485 8 L 485 40 L 510 40 L 510 8 L ${right} 8 L ${right} 40`}
          fill="none"
          stroke={colors.vds}
          strokeWidth="2"
        />
        <rect x="125" y="4" width="25" height="40" fill="rgba(34,197,94,0.12)" stroke="#22c55e" strokeWidth="1" strokeDasharray="3 2" />
        <rect x="365" y="4" width="25" height="40" fill="rgba(34,197,94,0.12)" stroke="#22c55e" strokeWidth="1" strokeDasharray="3 2" />
        <text x="137" y="58" fill="#22c55e" fontSize="9" textAnchor="middle">ZVS</text>
        <text x="377" y="58" fill="#22c55e" fontSize="9" textAnchor="middle">ZVS</text>
      </g>

      {/* Ir */}
      <g transform="translate(0, 170)">
        <text x={left - 12} y="28" fill="#a3a3a3" fontSize="12" textAnchor="end" dominantBaseline="middle">
          Ir
        </text>
        <line x1={left} y1="40" x2={right} y2="40" stroke="#525252" strokeWidth="1" />
        <path
          d={`M ${left} 40 Q 90 8 125 20 L 130 20 L 150 20 L 160 30 Q 190 72 240 40 Q 290 8 325 20 L 330 20 L 350 20 L 360 30 Q 390 72 440 40 Q 490 8 525 20 L 530 20 L 550 20 L ${right} 40`}
          fill="none"
          stroke={colors.ir}
          strokeWidth="2"
        />
        <text x={right + 12} y="28" fill={colors.ir} fontSize="11" dominantBaseline="middle">谐振电流</text>
      </g>

      {/* Im */}
      <g transform="translate(0, 250)">
        <text x={left - 12} y="28" fill="#a3a3a3" fontSize="12" textAnchor="end" dominantBaseline="middle">
          Im
        </text>
        <line x1={left} y1="40" x2={right} y2="40" stroke="#525252" strokeWidth="1" />
        <path
          d={`M ${left} 40 L 110 16 L 180 64 L 250 16 L 320 64 L 390 16 L 460 64 L ${right} 40`}
          fill="none"
          stroke={colors.im}
          strokeWidth="2"
        />
        <text x={right + 12} y="28" fill={colors.im} fontSize="11" dominantBaseline="middle">励磁电流</text>
      </g>

      {/* Id — 整流二极管电流 */}
      <g transform="translate(0, 330)">
        <text x={left - 12} y="28" fill="#a3a3a3" fontSize="12" textAnchor="end" dominantBaseline="middle">
          Id
        </text>
        <line x1={left} y1="40" x2={right} y2="40" stroke="#525252" strokeWidth="1" />
        {/* D1 电流 — 正半周导通 */}
        <path
          d={`M ${left} 40 L 110 40 L 110 18 L 180 18 L 180 40 M 390 40 L 390 18 L 460 18 L 460 40`}
          fill="none"
          stroke="#14b8a6"
          strokeWidth="2"
        />
        {/* D2 电流 — 负半周导通 */}
        <path
          d={`M 250 40 L 250 62 L 320 62 L 320 40 M 460 40 L 460 62 L 530 62 L 530 40`}
          fill="none"
          stroke="#f59e0b"
          strokeWidth="2"
        />
        <text x={right + 12} y="28" fill="#a3a3a3" fontSize="11" dominantBaseline="middle">整流二极管电流</text>
      </g>

      {/* Io */}
      <g transform="translate(0, 410)">
        <text x={left - 12} y="28" fill="#a3a3a3" fontSize="12" textAnchor="end" dominantBaseline="middle">
          Io
        </text>
        <line x1={left} y1="40" x2={right} y2="40" stroke="#525252" strokeWidth="1" />
        <path
          d={`M ${left} 40 L 110 40 L 110 18 L 180 18 L 180 40 L 250 40 L 250 18 L 320 18 L 320 40 L 390 40 L 390 18 L 460 18 L 460 40 L ${right} 40`}
          fill="none"
          stroke={colors.io}
          strokeWidth="2"
        />
        <text x={right + 12} y="28" fill={colors.io} fontSize="11" dominantBaseline="middle">输出电流</text>
      </g>

      {/* Time axis */}
      <line x1={left} y1="490" x2={right} y2="490" stroke="#525252" strokeWidth="2" markerEnd="url(#arrTeal)" />
      <text x={(left + right) / 2} y="515" fill="#737373" fontSize="11" textAnchor="middle">
        时间 t →
      </text>
    </svg>
  )
}

function GainCurveSVG() {
  return (
    <svg
      viewBox="0 0 420 260"
      className="w-full max-w-md mx-auto h-auto"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g stroke="#404040" strokeWidth="1" opacity="0.25">
        {[30, 70, 110, 150, 190, 230, 270, 310, 350, 390].map((x) => (
          <line key={`v${x}`} x1={x} y1="20" x2={x} y2="200" />
        ))}
        {[30, 70, 110, 150, 190].map((y) => (
          <line key={`h${y}`} x1="20" y1={y} x2="400" y2={y} />
        ))}
      </g>

      <line x1="20" y1="200" x2="400" y2="200" stroke="#525252" strokeWidth="2" />
      <line x1="20" y1="20" x2="20" y2="200" stroke="#525252" strokeWidth="2" />
      <text x="210" y="235" fill="#a3a3a3" fontSize="10" textAnchor="middle">归一化频率 fn</text>
      <text x="10" y="110" fill="#a3a3a3" fontSize="10" textAnchor="middle" transform="rotate(-90 10 110)">
        电压增益 M
      </text>

      <line x1="210" y1="20" x2="210" y2="200" stroke="#14b8a6" strokeWidth="1" strokeDasharray="6 4" opacity="0.6" />
      <text x="210" y="14" fill="#14b8a6" fontSize="9" textAnchor="middle">fr1</text>

      <line x1="120" y1="20" x2="120" y2="200" stroke="#f59e0b" strokeWidth="1" strokeDasharray="6 4" opacity="0.6" />
      <text x="120" y="14" fill="#f59e0b" fontSize="9" textAnchor="middle">fr2</text>

      <line x1="20" y1="120" x2="400" y2="120" stroke="#737373" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
      <text x="395" y="116" fill="#737373" fontSize="9" textAnchor="end">M=1</text>

      <path
        d="M 20 200 Q 60 150 100 70 Q 110 38 120 24 L 210 120 Q 260 142 310 158 Q 350 170 400 182"
        fill="none"
        stroke="#f59e0b"
        strokeWidth="2.5"
        opacity="0.9"
      />
      <path
        d="M 20 200 Q 60 185 100 125 Q 115 95 120 82 L 210 120 Q 250 132 290 142 Q 340 156 400 168"
        fill="none"
        stroke="#14b8a6"
        strokeWidth="2.5"
        opacity="0.9"
      />
      <path
        d="M 20 200 Q 60 192 100 168 Q 115 148 120 138 L 210 120 Q 260 132 310 142 Q 350 152 400 162"
        fill="none"
        stroke="#f5f5f5"
        strokeWidth="2"
        opacity="0.4"
      />

      <g transform="translate(260, 28)">
        <line x1="0" y1="0" x2="20" y2="0" stroke="#f59e0b" strokeWidth="2" />
        <text x="26" y="4" fill="#a3a3a3" fontSize="10">轻载 (Q=0.2)</text>
        <line x1="0" y1="16" x2="20" y2="16" stroke="#14b8a6" strokeWidth="2" />
        <text x="26" y="20" fill="#a3a3a3" fontSize="10">满载 (Q=1.0)</text>
        <line x1="0" y1="32" x2="20" y2="32" stroke="#f5f5f5" strokeWidth="2" opacity="0.4" />
        <text x="26" y="36" fill="#a3a3a3" fontSize="10">重载 (Q=5.0)</text>
      </g>

      <rect
        x="120"
        y="20"
        width="270"
        height="180"
        fill="rgba(34, 197, 94, 0.05)"
        stroke="#22c55e"
        strokeWidth="1"
        strokeDasharray="4 4"
        opacity="0.6"
      />
      <text x="255" y="185" fill="#22c55e" fontSize="9" textAnchor="middle">Region 1 &amp; 2: ZVS 区域</text>
    </svg>
  )
}

/* ─── Animated SVG Components ─── */

function SwitchingAnimationSVG() {
  const t1 = 60
  const t2 = 180
  const t3 = 230
  const t4 = 280
  const t5 = 400
  const t6 = 450
  const t7 = 510
  const t8 = 630

  const phases = [
    { start: t1, end: t2, color: 'rgba(20,184,166,0.12)', label: 'Q1 ON', labelColor: '#14b8a6' },
    { start: t2, end: t3, color: 'rgba(245,158,11,0.12)', label: '死区', labelColor: '#f59e0b' },
    { start: t3, end: t4, color: 'rgba(34,197,94,0.15)', label: 'D2导通', labelColor: '#22c55e' },
    { start: t4, end: t5, color: 'rgba(20,184,166,0.12)', label: 'Q2 ON', labelColor: '#14b8a6' },
    { start: t5, end: t6, color: 'rgba(245,158,11,0.12)', label: '死区', labelColor: '#f59e0b' },
    { start: t6, end: t7, color: 'rgba(34,197,94,0.15)', label: 'D1导通', labelColor: '#22c55e' },
    { start: t7, end: t8, color: 'rgba(20,184,166,0.12)', label: 'Q1 ON', labelColor: '#14b8a6' },
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

  const irPath = 'M 60 30.0 L 75 26.3 L 90 22.7 L 105 19.4 L 120 16.6 L 135 14.4 L 150 12.9 L 165 12.1 L 180 12.1 L 195 12.9 L 210 14.4 L 225 16.6 L 240 19.4 L 255 22.7 L 270 26.3 L 285 30.0 L 300 33.7 L 315 37.3 L 330 40.6 L 345 43.4 L 360 45.6 L 375 47.1 L 390 47.9 L 405 47.9 L 420 47.1 L 435 45.6 L 450 43.4 L 465 40.6 L 480 37.3 L 495 33.7 L 510 30.0 L 525 26.3 L 540 22.7 L 555 19.4 L 570 16.6 L 585 14.4 L 600 12.9 L 615 12.1 L 630 12.1'

  const imPath = 'M 60 48 L 180 30 L 285 12 L 400 30 L 510 48 L 630 30'

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
        <text key={`l${i}`} x={(p.start + p.end) / 2} y="262" fill={p.labelColor} fontSize="9" textAnchor="middle" fontFamily="JetBrains Mono, monospace" opacity="0.9">
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
        <path d={`M ${t1} 40 L ${t1} 15 L ${t2} 15 L ${t2} 40 L ${t7} 40 L ${t7} 15 L ${t8} 15 L ${t8} 40`} fill="none" stroke="#14b8a6" strokeWidth="2" />
        <text x={(t1 + t2) / 2} y="12" fill="#14b8a6" fontSize="8" textAnchor="middle">Q1 ON</text>
        <text x={(t7 + t8) / 2} y="12" fill="#14b8a6" fontSize="8" textAnchor="middle">Q1 ON</text>
      </g>

      {/* Vgs Q2 */}
      <g transform="translate(0, 45)">
        <text x="45" y="28" fill="#a3a3a3" fontSize="11" textAnchor="end" dominantBaseline="middle" fontFamily="JetBrains Mono, monospace">Vgs_Q2</text>
        <line x1={t1} y1="40" x2={t8} y2="40" stroke="#525252" strokeWidth="1" />
        <path d={`M ${t1} 40 L ${t4} 40 L ${t4} 15 L ${t5} 15 L ${t5} 40 L ${t8} 40`} fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 2" />
        <text x={(t4 + t5) / 2} y="12" fill="#f59e0b" fontSize="8" textAnchor="middle">Q2 ON</text>
      </g>

      {/* Vds Q1 */}
      <g transform="translate(0, 90)">
        <text x="45" y="28" fill="#a3a3a3" fontSize="11" textAnchor="end" dominantBaseline="middle" fontFamily="JetBrains Mono, monospace">Vds_Q1</text>
        <line x1={t1} y1="40" x2={t8} y2="40" stroke="#525252" strokeWidth="1" />
        <path d={`M ${t1} 40 L ${t2} 40 L ${t3} 10 L ${t5} 10 L ${t6} 40 L ${t7} 40 L ${t8} 40`} fill="none" stroke="#ef4444" strokeWidth="2" />
        <line x1={t5} y1="10" x2={t6} y2="40" stroke="url(#vdsFallGrad)" strokeWidth="2" />
        <rect x={t6} y="8" width={t7 - t6} height="36" fill="rgba(34,197,94,0.15)" stroke="#22c55e" strokeWidth="1" strokeDasharray="3 2" />
        <text x={(t6 + t7) / 2} y="56" fill="#22c55e" fontSize="9" textAnchor="middle">ZVS</text>
        <text x={(t2 + t3) / 2} y="56" fill="#f59e0b" fontSize="9" textAnchor="middle">死区</text>
        <text x={(t5 + t6) / 2} y="56" fill="#f59e0b" fontSize="9" textAnchor="middle">死区</text>
      </g>

      {/* Ir */}
      <g transform="translate(0, 145)">
        <text x="45" y="20" fill="#a3a3a3" fontSize="11" textAnchor="end" dominantBaseline="middle" fontFamily="JetBrains Mono, monospace">Ir</text>
        <line x1={t1} y1="30" x2={t8} y2="30" stroke="#525252" strokeWidth="1" />
        <path d={irPath} fill="none" stroke="#14b8a6" strokeWidth="2" className="dash-flow" />
        <text x={t8 + 12} y="28" fill="#14b8a6" fontSize="11" dominantBaseline="middle">谐振电流</text>
      </g>

      {/* Im */}
      <g transform="translate(0, 200)">
        <text x="45" y="20" fill="#a3a3a3" fontSize="11" textAnchor="end" dominantBaseline="middle" fontFamily="JetBrains Mono, monospace">Im</text>
        <line x1={t1} y1="30" x2={t8} y2="30" stroke="#525252" strokeWidth="1" />
        <path d={imPath} fill="none" stroke="#22c55e" strokeWidth="2" className="dash-flow-slow" />
        <text x={t8 + 12} y="28" fill="#22c55e" fontSize="11" dominantBaseline="middle">励磁电流</text>
      </g>

      {/* Time axis */}
      <line x1={t1} y1="295" x2={t8} y2="295" stroke="#525252" strokeWidth="2" markerEnd="url(#arrowTealAnim)" />
      <text x={(t1 + t8) / 2} y="315" fill="#737373" fontSize="11" textAnchor="middle">时间 t →</text>

      {/* Phase markers and labels */}
      {timeMarkers.map((m, i) => (
        <g key={`pl${i}`}>
          <line x1={m.t} y1="255" x2={m.t} y2="265" stroke="#525252" strokeWidth="1.5" />
          <text x={m.t} y="278" fill="#a3a3a3" fontSize="10" textAnchor="middle" fontFamily="JetBrains Mono, monospace">{m.label}</text>
        </g>
      ))}

      {/* Legend */}
      <g transform="translate(80, 340)">
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
      <text x="80" y="370" fill="#a3a3a3" fontSize="10" fontFamily="JetBrains Mono, monospace">t₁→t₂: Q1导通, 正半周能量传输 | t₂→t₃: 死区, Coss充放电 | t₃→t₄: Q2体二极管导通, ZVS准备</text>
      <text x="80" y="385" fill="#a3a3a3" fontSize="10" fontFamily="JetBrains Mono, monospace">t₄→t₅: Q2导通, 负半周能量传输 | t₅→t₆: 死区, Coss充放电 | t₆→t₁': Q1体二极管导通, ZVS准备</text>
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

  const posPath = 'M 70 55 L 130 55 L 150 55 L 150 85 L 150 180 L 170 180 L 180 180 L 210 180 L 240 180 L 270 180 L 300 180 L 300 150 L 320 150 L 320 220 L 300 220 L 300 325 L 130 325 L 70 325 L 70 55 M 390 185 L 390 150 L 450 150 L 450 96 L 540 96 L 540 264 L 450 264 L 450 185 L 390 185'
  const negPath = 'M 70 325 L 130 325 L 300 325 L 300 220 L 320 220 L 320 150 L 300 150 L 300 180 L 270 180 L 240 180 L 210 180 L 180 180 L 170 180 L 150 180 L 150 85 L 150 55 L 130 55 L 70 55 L 70 325 M 390 185 L 390 220 L 450 220 L 450 264 L 450 185 L 390 185'
  const deadPosPath = 'M 70 55 L 130 55 L 150 55 L 150 85 L 150 180 L 170 180 L 180 180 L 210 180 L 240 180 L 270 180 L 300 180 L 300 150 L 320 150 L 320 220 L 300 220 L 300 325 L 130 325 L 70 325 L 70 55 M 390 185 L 390 150 L 450 150 L 450 96 L 540 96 L 540 264 L 450 264 L 450 185 L 390 185'
  const deadNegPath = 'M 70 325 L 130 325 L 300 325 L 300 220 L 320 220 L 320 150 L 300 150 L 300 180 L 270 180 L 240 180 L 210 180 L 180 180 L 170 180 L 150 180 L 150 85 L 150 55 L 130 55 L 70 55 L 70 325 M 390 185 L 390 220 L 450 220 L 450 264 L 450 185 L 390 185'

  const currentPaths = [
    { d: posPath, color: '#14b8a6', marker: 'url(#arrowTealCircuit)', label: '正半周能量传输' },
    { d: deadPosPath, color: '#f59e0b', marker: 'url(#arrowAmberCircuit)', label: 'Coss充放电' },
    { d: negPath, color: '#22c55e', marker: 'url(#arrowGreenCircuit)', label: 'Q2体二极管续流' },
    { d: negPath, color: '#14b8a6', marker: 'url(#arrowTealCircuit)', label: '负半周能量传输' },
    { d: deadNegPath, color: '#f59e0b', marker: 'url(#arrowAmberCircuit)', label: 'Coss充放电' },
    { d: posPath, color: '#22c55e', marker: 'url(#arrowGreenCircuit)', label: 'Q1体二极管续流' },
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

      <svg viewBox="0 0 600 340" className="w-full max-w-3xl mx-auto h-auto" xmlns="http://www.w3.org/2000/svg">
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

        {/* DC input rails */}
        <line x1="50" y1="55" x2="130" y2="55" stroke="#a3a3a3" strokeWidth="2" />
        <line x1="50" y1="325" x2="340" y2="325" stroke="#a3a3a3" strokeWidth="2" />
        <text x="10" y="59" fill="#a3a3a3" fontSize="12" fontFamily="JetBrains Mono, monospace">Vin+</text>
        <text x="10" y="329" fill="#a3a3a3" fontSize="12" fontFamily="JetBrains Mono, monospace">GND</text>

        {/* Q1 high-side NMOS */}
        <line x1="130" y1="55" x2="150" y2="55" stroke="#a3a3a3" strokeWidth="2" />
        <line x1="150" y1="55" x2="150" y2="85" stroke="#a3a3a3" strokeWidth="2" />
        <line x1="150" y1="85" x2="150" y2="155" stroke="#a3a3a3" strokeWidth="2" />
        <line x1="150" y1="155" x2="150" y2="180" stroke="#a3a3a3" strokeWidth="2" />
        {/* Channel */}
        <line x1="150" y1="85" x2="150" y2="155" stroke={q1Active ? '#14b8a6' : '#a3a3a3'} strokeWidth={q1Active ? '3' : '2'} />
        {/* Gate */}
        <line x1="128" y1="120" x2="142" y2="120" stroke={q1Active ? '#14b8a6' : '#a3a3a3'} strokeWidth={q1Active ? '3' : '2'} />
        {/* Source short bar + N arrow */}
        <line x1="150" y1="148" x2="164" y2="148" stroke={q1Active ? '#14b8a6' : '#a3a3a3'} strokeWidth={q1Active ? '3' : '2'} />
        <path d="M 150 148 L 158 144 L 158 152 Z" fill={q1Active ? '#14b8a6' : '#a3a3a3'} />
        {/* Body diode */}
        <line x1="164" y1="95" x2="164" y2="148" stroke={q1BodyDiode ? '#22c55e' : '#a3a3a3'} strokeWidth={q1BodyDiode ? '3' : '1.5'} />
        <line x1="160" y1="95" x2="168" y2="95" stroke={q1BodyDiode ? '#22c55e' : '#a3a3a3'} strokeWidth={q1BodyDiode ? '3' : '1.5'} />
        <path d="M 164 95 L 160 110 L 168 110 Z" fill={q1BodyDiode ? '#22c55e' : '#a3a3a3'} />
        <text x="120" y="124" fill={q1Active ? '#14b8a6' : q1BodyDiode ? '#22c55e' : '#a3a3a3'} fontSize="12" fontFamily="JetBrains Mono, monospace" textAnchor="end">Q1</text>

        {/* Q2 low-side NMOS */}
        <line x1="150" y1="180" x2="150" y2="200" stroke="#a3a3a3" strokeWidth="2" />
        <line x1="150" y1="200" x2="150" y2="270" stroke="#a3a3a3" strokeWidth="2" />
        <line x1="150" y1="270" x2="150" y2="295" stroke="#a3a3a3" strokeWidth="2" />
        <line x1="150" y1="295" x2="150" y2="325" stroke="#a3a3a3" strokeWidth="2" />
        <line x1="150" y1="200" x2="150" y2="270" stroke={q2Active ? '#f59e0b' : '#a3a3a3'} strokeWidth={q2Active ? '3' : '2'} />
        <line x1="128" y1="235" x2="142" y2="235" stroke={q2Active ? '#f59e0b' : '#a3a3a3'} strokeWidth={q2Active ? '3' : '2'} />
        <line x1="150" y1="263" x2="164" y2="263" stroke={q2Active ? '#f59e0b' : '#a3a3a3'} strokeWidth={q2Active ? '3' : '2'} />
        <path d="M 150 263 L 158 259 L 158 267 Z" fill={q2Active ? '#f59e0b' : '#a3a3a3'} />
        <line x1="164" y1="200" x2="164" y2="263" stroke={q2BodyDiode ? '#22c55e' : '#a3a3a3'} strokeWidth={q2BodyDiode ? '3' : '1.5'} />
        <line x1="160" y1="200" x2="168" y2="200" stroke={q2BodyDiode ? '#22c55e' : '#a3a3a3'} strokeWidth={q2BodyDiode ? '3' : '1.5'} />
        <path d="M 164 200 L 160 215 L 168 215 Z" fill={q2BodyDiode ? '#22c55e' : '#a3a3a3'} />
        <text x="120" y="239" fill={q2Active ? '#f59e0b' : q2BodyDiode ? '#22c55e' : '#a3a3a3'} fontSize="12" fontFamily="JetBrains Mono, monospace" textAnchor="end">Q2</text>

        {/* Switch node */}
        <circle cx="150" cy="180" r="3.5" fill="#f5f5f5" stroke="#a3a3a3" strokeWidth="1" />
        <text x="124" y="184" fill="#f5f5f5" fontSize="10" fontFamily="JetBrains Mono, monospace" textAnchor="end">SW</text>

        {/* Cr — 串联在 SW 节点和 Lr 之间 */}
        <line x1="150" y1="180" x2="170" y2="180" stroke="#a3a3a3" strokeWidth="2" />
        <line x1="170" y1="164" x2="170" y2="196" stroke="#f59e0b" strokeWidth="2" />
        <line x1="180" y1="164" x2="180" y2="196" stroke="#f59e0b" strokeWidth="2" />
        <line x1="180" y1="180" x2="210" y2="180" stroke="#f59e0b" strokeWidth="2" />
        <text x="175" y="154" fill="#f59e0b" fontSize="12" fontFamily="JetBrains Mono, monospace" textAnchor="middle">Cr</text>

        {/* Lr — 串联在 Cr 和并联节点之间 */}
        <line x1="210" y1="180" x2="240" y2="180" stroke="#a3a3a3" strokeWidth="2" />
        <path d="M 240 180 q 5 -12 10 0 q 5 12 10 0 q 5 -12 10 0 q 5 12 10 0" fill="none" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round" />
        <line x1="270" y1="180" x2="300" y2="180" stroke="#14b8a6" strokeWidth="2" />
        <text x="255" y="162" fill="#14b8a6" fontSize="12" fontFamily="JetBrains Mono, monospace" textAnchor="middle">Lr</text>

        {/* 并联节点 — Lm 和 T 原边并联 */}
        <line x1="300" y1="180" x2="300" y2="150" stroke="#a3a3a3" strokeWidth="2" />

        {/* Lm — 竖直，并联在并联节点和 GND 之间 */}
        <line x1="300" y1="150" x2="280" y2="150" stroke="#22c55e" strokeWidth="2" />
        <path d="M 280 150 q 5 5 0 10 q -5 5 0 10 q 5 5 0 10 q -5 5 0 10 q 5 5 0 10 q -5 5 0 10 q 5 5 0 10" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
        <line x1="280" y1="220" x2="300" y2="220" stroke="#22c55e" strokeWidth="2" />
        <text x="290" y="142" fill="#22c55e" fontSize="12" fontFamily="JetBrains Mono, monospace" textAnchor="middle">Lm</text>

        {/* Lm 下端到 GND */}
        <line x1="300" y1="220" x2="300" y2="325" stroke="#22c55e" strokeWidth="2" />

        {/* 变压器原边 — 竖直，并联在并联节点和 GND 之间 */}
        <line x1="300" y1="150" x2="320" y2="150" stroke="#a3a3a3" strokeWidth="2" />
        <path d="M 320 150 q 5 5 0 10 q -5 5 0 10 q 5 5 0 10 q -5 5 0 10 q 5 5 0 10 q -5 5 0 10 q 5 5 0 10" fill="none" stroke="#a3a3a3" strokeWidth="2" strokeLinecap="round" />
        <line x1="320" y1="220" x2="300" y2="220" stroke="#a3a3a3" strokeWidth="2" />

        {/* T 原边下端到 GND */}
        <line x1="300" y1="220" x2="300" y2="325" stroke="#a3a3a3" strokeWidth="2" />

        {/* Coupling between primary and secondary */}
        <line x1="328" y1="160" x2="382" y2="160" stroke="#a3a3a3" strokeDasharray="4 3" strokeWidth="1.5" />
        <line x1="328" y1="210" x2="382" y2="210" stroke="#a3a3a3" strokeDasharray="4 3" strokeWidth="1.5" />

        {/* Transformer secondary — center-tapped full-wave rectifier */}
        {/* 上次级绕组 */}
        <line x1="390" y1="150" x2="390" y2="185" stroke="#a3a3a3" strokeWidth="2" />
        <path d="M 390 150 q 5 5 0 10 q -5 5 0 10 q 5 5 0 10" fill="none" stroke="#a3a3a3" strokeWidth="2" strokeLinecap="round" />
        {/* 下次级绕组 */}
        <line x1="390" y1="185" x2="390" y2="220" stroke="#a3a3a3" strokeWidth="2" />
        <path d="M 390 185 q 5 5 0 10 q -5 5 0 10 q 5 5 0 10" fill="none" stroke="#a3a3a3" strokeWidth="2" strokeLinecap="round" />

        {/* 中心抽头 */}
        <circle cx="390" cy="185" r="3" fill="#a3a3a3" />
        <line x1="390" y1="185" x2="450" y2="185" stroke="#a3a3a3" strokeWidth="2" />
        <line x1="450" y1="185" x2="450" y2="264" stroke="#a3a3a3" strokeWidth="2" />
        <text x="455" y="180" fill="#a3a3a3" fontSize="10" fontFamily="JetBrains Mono, monospace">中心抽头</text>

        {/* Dots on windings */}
        <circle cx="322" cy="156" r="2.5" fill="#a3a3a3" />
        <circle cx="392" cy="156" r="2.5" fill="#a3a3a3" />

        {/* T label */}
        <text x="375" y="170" fill="#a3a3a3" fontSize="12" fontFamily="JetBrains Mono, monospace" textAnchor="start">T</text>

        {/* Rectifier diodes */}
        <line x1="390" y1="150" x2="450" y2="150" stroke="#a3a3a3" strokeWidth="2" />
        <line x1="450" y1="150" x2="450" y2="130" stroke={d1Active ? '#22c55e' : '#a3a3a3'} strokeWidth={d1Active ? '3' : '2'} />
        <path d="M 450 116 L 442 130 L 458 130 Z" fill={d1Active ? '#22c55e' : '#a3a3a3'} />
        <line x1="442" y1="130" x2="458" y2="130" stroke={d1Active ? '#22c55e' : '#a3a3a3'} strokeWidth={d1Active ? '3' : '2'} />
        <line x1="450" y1="116" x2="450" y2="96" stroke={d1Active ? '#22c55e' : '#a3a3a3'} strokeWidth={d1Active ? '3' : '2'} />
        <text x="465" y="126" fill={d1Active ? '#22c55e' : '#a3a3a3'} fontSize="11" fontFamily="JetBrains Mono, monospace">D1</text>

        <line x1="390" y1="220" x2="450" y2="220" stroke="#a3a3a3" strokeWidth="2" />
        <line x1="450" y1="220" x2="450" y2="230" stroke={d2Active ? '#22c55e' : '#a3a3a3'} strokeWidth={d2Active ? '3' : '2'} />
        <path d="M 450 244 L 442 230 L 458 230 Z" fill={d2Active ? '#22c55e' : '#a3a3a3'} />
        <line x1="442" y1="230" x2="458" y2="230" stroke={d2Active ? '#22c55e' : '#a3a3a3'} strokeWidth={d2Active ? '3' : '2'} />
        <line x1="450" y1="244" x2="450" y2="264" stroke={d2Active ? '#22c55e' : '#a3a3a3'} strokeWidth={d2Active ? '3' : '2'} />
        <text x="465" y="240" fill={d2Active ? '#22c55e' : '#a3a3a3'} fontSize="11" fontFamily="JetBrains Mono, monospace">D2</text>

        {/* Output capacitor / load */}
        <line x1="450" y1="96" x2="540" y2="96" stroke="#a3a3a3" strokeWidth="2" />
        <line x1="450" y1="264" x2="540" y2="264" stroke="#a3a3a3" strokeWidth="2" />
        <line x1="540" y1="96" x2="540" y2="120" stroke="#a3a3a3" strokeWidth="2" />
        <line x1="534" y1="120" x2="546" y2="120" stroke="#a3a3a3" strokeWidth="2" />
        <line x1="534" y1="132" x2="546" y2="132" stroke="#a3a3a3" strokeWidth="2" />
        <line x1="540" y1="132" x2="540" y2="264" stroke="#a3a3a3" strokeWidth="2" />
        <text x="552" y="132" fill="#a3a3a3" fontSize="12" fontFamily="JetBrains Mono, monospace">Co/Ro</text>
        <text x="552" y="108" fill="#a3a3a3" fontSize="10" fontFamily="JetBrains Mono, monospace">Vo+</text>
        <text x="552" y="258" fill="#a3a3a3" fontSize="10" fontFamily="JetBrains Mono, monospace">Vo-</text>

        {/* Current path */}
        <path
          d={currentPath.d}
          fill="none"
          stroke={currentPath.color}
          strokeWidth="3"
          strokeDasharray="8 6"
          strokeLinecap="round"
          markerEnd={currentPath.marker}
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

          <div className="bg-bg/50 rounded-lg p-4">
            <WaveformsSVG />
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-bg/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-primary-light" />
                <h4 className="text-sm font-semibold text-text-primary">Vgs — 栅极驱动</h4>
              </div>
              <p className="text-text-secondary text-sm leading-relaxed">
                两个互补的方波信号，之间存在死区时间（Dead Time）。死区时间长度直接影响 ZVS 能否成功实现。
              </p>
            </div>
            <div className="p-4 bg-bg/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-danger" />
                <h4 className="text-sm font-semibold text-text-primary">Vds — 漏极电压</h4>
              </div>
              <p className="text-text-secondary text-sm leading-relaxed">
                在死区时间内，通过谐振电流对结电容充放电，Vds 在 Vgs 升高之前降至零。这是 ZVS 的关键特征。
              </p>
            </div>
            <div className="p-4 bg-bg/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-primary-light" />
                <h4 className="text-sm font-semibold text-text-primary">Ir — 谐振电流</h4>
              </div>
              <p className="text-text-secondary text-sm leading-relaxed">
                近似正弦的交流电流，包含 Lr 与 Cr 谐振分量。Ir 在死区时间内的方向决定结电容的充放电方向。
              </p>
            </div>
            <div className="p-4 bg-bg/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-success" />
                <h4 className="text-sm font-semibold text-text-primary">Im — 励磁电流</h4>
              </div>
              <p className="text-text-secondary text-sm leading-relaxed">
                三角波或近似三角波，由输出电压反射到原边后加在 Lm 上产生。Im 峰值在谐振电流过零时达到最大。
              </p>
            </div>
            <div className="p-4 bg-bg/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-accent" />
                <h4 className="text-sm font-semibold text-text-primary">Io — 输出电流</h4>
              </div>
              <p className="text-text-secondary text-sm leading-relaxed">
                经整流后的脉动直流，频率为开关频率的两倍。输出滤波电容主要滤除此二倍频纹波。
              </p>
            </div>
            <div className="p-4 bg-bg/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-text-muted" />
                <h4 className="text-sm font-semibold text-text-primary">Isec — 副边电流</h4>
              </div>
              <p className="text-text-secondary text-sm leading-relaxed">
                仅在谐振电流绝对值大于励磁电流时流通，对应整流二极管导通时段。在 Region 2 时自然实现 ZCS。
              </p>
            </div>
          </div>
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
                  latex="\\frac{1}{2} L_p I_p^2 \\geq \\frac{1}{2} C_{oss} V_{in}^2 \\cdot 2"
                  important
                />
                <p className="text-text-secondary text-xs mt-1">
                  其中 Lp 为等效初级电感，Ip 为死区开始时电流峰值，Coss 为 MOSFET 输出电容。
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
                latex="M = \\frac{n V_{out}}{V_{in}} \\;(\\text{全桥}) \\quad M = \\frac{2n V_{out}}{V_{in}} \\;(\\text{半桥})"
                important
              />
              <p className="text-text-secondary text-sm leading-relaxed">
                基于 FHA（First Harmonic Approximation）方法，完整的 LLC 电压增益方程为：
              </p>
              <MathBlock
                latex="M(f_n, k, Q) = \\frac{f_n^2 \\cdot k}{\\sqrt{(f_n^2(1+k)-1)^2 + k^2 Q^2 (f_n^2-1)^2}}"
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
                轻载时（Q 小）增益曲线峰值更高，需要更大的频率调节范围；重载时（Q 大）曲线更平坦，增益变化对频率不敏感，有利于稳压精度。
              </p>
            </div>
            <div className="p-4 bg-bg/50 rounded-lg border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-success" />
                <h4 className="text-sm font-semibold text-text-primary">峰值增益</h4>
              </div>
              <p className="text-text-secondary text-sm leading-relaxed">
                最大增益出现在 f = fr2 附近，峰值大小由 k 和 Q 共同决定。设计时必须确保峰值增益大于所需的最大增益（对应最低输入电压、最大负载）。
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
                更高的开关频率可以减小磁性元件和电容体积，但会带来更大的开关损耗与磁芯损耗。LLC 通过 ZVS 消除了开通损耗，但关断损耗（与 Ir 峰值相关）和磁芯损耗（与频率成正比）仍然存在。
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
                较高的 k（Lm/Lr）意味着更大的励磁电感，可减小变压器磁芯体积，但会缩小 ZVS 范围并降低峰值增益。较低的 k 需要更大的磁芯以容纳更大的励磁电感，但有利于轻载 ZVS 与更高的峰值增益。
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