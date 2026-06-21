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
  return (
    <svg
      viewBox="0 0 560 400"
      className="w-full max-w-2xl mx-auto h-auto"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Grid background */}
      <g stroke="#404040" strokeWidth="1" opacity="0.3">
        {[40, 80, 120, 160, 200, 240, 280, 320, 360, 400, 440, 480, 520].map(
          (x) => (
            <line key={`v${x}`} x1={x} y1="10" x2={x} y2="370" />
          )
        )}
        {[20, 60, 100, 140, 180, 220, 260, 300, 340].map((y) => (
          <line key={`h${y}`} x1="40" y1={y} x2="520" y2={y} />
        ))}
      </g>

      {/* ─── Vgs (Gate Drive) with dead time ─── */}
      <g transform="translate(0, 0)">
        <text x="10" y="25" fill="#a3a3a3" fontSize="11" textAnchor="end">
          Vgs
        </text>
        <line x1="40" y1="40" x2="520" y2="40" stroke="#404040" strokeWidth="1" />
        {/* Q1: high(40-90), dead(90-100), low(100-190), dead(190-200), high(200-290), dead(290-300), low(300-390), dead(390-400) */}
        <path
          d="M 40 40 L 40 20 L 90 20 L 90 40 L 100 40 L 190 40 L 190 20 L 200 20 L 290 20 L 290 40 L 300 40 L 390 40 L 390 20 L 400 20 L 490 20 L 490 40 L 500 40 L 520 40"
          fill="none"
          stroke="#14b8a6"
          strokeWidth="2"
        />
        <text x="530" y="25" fill="#14b8a6" fontSize="10">
          Q1
        </text>
        {/* Q2: low(40-90), dead(90-100), high(100-190), dead(190-200), low(200-290), dead(290-300), high(300-390), dead(390-400) */}
        <path
          d="M 40 40 L 90 40 L 90 20 L 100 20 L 100 40 L 190 40 L 190 20 L 200 20 L 200 40 L 290 40 L 290 20 L 300 20 L 300 40 L 390 40 L 390 20 L 400 20 L 400 40 L 520 40"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="2"
          strokeDasharray="4 3"
        />
        <text x="530" y="45" fill="#f59e0b" fontSize="10">
          Q2
        </text>
      </g>

      {/* ─── Vds (Drain Voltage) with ZVS during dead time ─── */}
      <g transform="translate(0, 80)">
        <text x="10" y="25" fill="#a3a3a3" fontSize="11" textAnchor="end">
          Vds
        </text>
        <line x1="40" y1="40" x2="520" y2="40" stroke="#404040" strokeWidth="1" />
        {/* Vds_Q1: low during Q1 on, rises during dead time, high during Q2 on, falls during dead time */}
        <path
          d="M 40 40 L 40 10 L 90 10 L 90 40 L 100 40 L 100 10 L 190 10 L 190 40 L 200 40 L 200 10 L 290 10 L 290 40 L 300 40 L 300 10 L 390 10 L 390 40 L 400 40 L 400 10 L 490 10 L 490 40 L 520 40"
          fill="none"
          stroke="#ef4444"
          strokeWidth="2"
        />
        {/* ZVS annotation: Vds drops to zero before Vgs rises */}
        <rect x="190" y="5" width="10" height="40" fill="rgba(34,197,94,0.15)" stroke="#22c55e" strokeWidth="1" strokeDasharray="3 2" />
        <text x="195" y="55" fill="#22c55e" fontSize="8" textAnchor="middle">ZVS</text>
        <text x="40" y="65" fill="#737373" fontSize="9">
          ZVS: Vds 先降至零，Vgs 再升高
        </text>
      </g>

      {/* ─── Ir (Resonant Current) ─── */}
      <g transform="translate(0, 160)">
        <text x="10" y="25" fill="#a3a3a3" fontSize="11" textAnchor="end">
          Ir
        </text>
        <line x1="40" y1="40" x2="520" y2="40" stroke="#404040" strokeWidth="1" />
        <path
          d="M 40 40 Q 70 10 100 40 Q 130 70 160 40 Q 190 10 220 40 Q 250 70 280 40 Q 310 10 340 40 Q 370 70 400 40 Q 430 10 460 40 Q 490 70 520 40"
          fill="none"
          stroke="#14b8a6"
          strokeWidth="2"
        />
        <text x="530" y="25" fill="#14b8a6" fontSize="10">
          谐振电流
        </text>
      </g>

      {/* ─── Im (Magnetizing Current) ─── */}
      <g transform="translate(0, 240)">
        <text x="10" y="25" fill="#a3a3a3" fontSize="11" textAnchor="end">
          Im
        </text>
        <line x1="40" y1="40" x2="520" y2="40" stroke="#404040" strokeWidth="1" />
        <path
          d="M 40 40 L 100 20 L 160 60 L 220 20 L 280 60 L 340 20 L 400 60 L 460 20 L 520 60"
          fill="none"
          stroke="#22c55e"
          strokeWidth="2"
        />
        <text x="530" y="25" fill="#22c55e" fontSize="10">
          励磁电流
        </text>
      </g>

      {/* ─── Io (Output Current) ─── */}
      <g transform="translate(0, 300)">
        <text x="10" y="25" fill="#a3a3a3" fontSize="11" textAnchor="end">
          Io
        </text>
        <line x1="40" y1="40" x2="520" y2="40" stroke="#404040" strokeWidth="1" />
        <path
          d="M 40 40 L 100 40 L 100 25 L 160 25 L 160 40 L 220 40 L 220 25 L 280 25 L 280 40 L 340 40 L 340 25 L 400 25 L 400 40 L 460 40 L 460 25 L 520 25 L 520 40"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="2"
        />
        <text x="530" y="25" fill="#f59e0b" fontSize="10">
          输出电流
        </text>
      </g>

      {/* Time axis */}
      <line x1="40" y1="370" x2="520" y2="370" stroke="#525252" strokeWidth="2" />
      <text x="280" y="390" fill="#737373" fontSize="10" textAnchor="middle">
        时间 t →
      </text>
    </svg>
  )
}

function ZVSWaveformSVG() {
  return (
    <svg
      viewBox="0 0 400 160"
      className="w-full max-w-md mx-auto h-auto"
      xmlns="http://www.w3.org/2000/svg"
    >
      <text x="10" y="15" fill="#a3a3a3" fontSize="11" textAnchor="end">
        Vgs
      </text>
      <line x1="40" y1="20" x2="360" y2="20" stroke="#404040" strokeWidth="1" />
      <path
        d="M 40 20 L 40 5 L 80 5 L 80 20 L 100 20 L 100 5 L 140 5 L 140 20 L 160 20 L 160 5 L 200 5 L 200 20 L 220 20 L 220 5 L 260 5 L 260 20 L 280 20 L 280 5 L 320 5 L 320 20 L 360 20"
        fill="none"
        stroke="#14b8a6"
        strokeWidth="2"
      />

      <text x="10" y="55" fill="#a3a3a3" fontSize="11" textAnchor="end">
        Vds
      </text>
      <line x1="40" y1="60" x2="360" y2="60" stroke="#404040" strokeWidth="1" />
      <path
        d="M 40 60 L 40 30 L 70 30 L 70 60 L 80 60 L 100 60 L 105 30 L 135 30 L 135 60 L 160 60 L 180 60 L 185 30 L 215 30 L 215 60 L 240 60 L 260 60 L 265 30 L 295 30 L 295 60 L 320 60 L 340 60 L 345 30 L 360 30"
        fill="none"
        stroke="#ef4444"
        strokeWidth="2"
      />

      <text x="10" y="95" fill="#a3a3a3" fontSize="11" textAnchor="end">
        Id
      </text>
      <line x1="40" y1="100" x2="360" y2="100" stroke="#404040" strokeWidth="1" />
      <path
        d="M 40 100 L 80 100 L 85 85 Q 100 70 115 85 L 120 100 L 160 100 L 165 85 Q 180 70 195 85 L 200 100 L 240 100 L 245 85 Q 260 70 275 85 L 280 100 L 320 100 L 325 85 Q 340 70 355 85 L 360 100"
        fill="none"
        stroke="#f59e0b"
        strokeWidth="2"
      />

      {/* Dead time annotation */}
      <rect
        x="75"
        y="2"
        width="20"
        height="118"
        fill="rgba(245, 158, 11, 0.1)"
        stroke="#f59e0b"
        strokeWidth="1"
        strokeDasharray="3 3"
      />
      <text
        x="85"
        y="135"
        fill="#f59e0b"
        fontSize="10"
        textAnchor="middle"
      >
        死区时间
      </text>
      <text
        x="85"
        y="148"
        fill="#737373"
        fontSize="9"
        textAnchor="middle"
      >
        Vds 已降至零 → ZVS
      </text>
    </svg>
  )
}

function GainCurveSVG() {
  return (
    <svg
      viewBox="0 0 400 240"
      className="w-full max-w-md mx-auto h-auto"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Grid */}
      <g stroke="#404040" strokeWidth="1" opacity="0.3">
        {[20, 60, 100, 140, 180, 220, 260, 300, 340, 380].map((x) => (
          <line key={`v${x}`} x1={x} y1="20" x2={x} y2="200" />
        ))}
        {[20, 60, 100, 140, 180].map((y) => (
          <line key={`h${y}`} x1="20" y1={y} x2="380" y2={y} />
        ))}
      </g>

      {/* Axes */}
      <line x1="20" y1="200" x2="380" y2="200" stroke="#525252" strokeWidth="2" />
      <line x1="20" y1="20" x2="20" y2="200" stroke="#525252" strokeWidth="2" />
      <text x="200" y="230" fill="#a3a3a3" fontSize="10" textAnchor="middle">
        归一化频率 fn
      </text>
      <text
        x="8"
        y="110"
        fill="#a3a3a3"
        fontSize="10"
        textAnchor="middle"
        transform="rotate(-90 8 110)"
      >
        电压增益 M
      </text>

      {/* Fr1 marker */}
      <line x1="200" y1="20" x2="200" y2="200" stroke="#14b8a6" strokeWidth="1" strokeDasharray="6 4" opacity="0.6" />
      <text x="200" y="15" fill="#14b8a6" fontSize="9" textAnchor="middle">
        fr1
      </text>

      {/* Fr2 marker */}
      <line x1="120" y1="20" x2="120" y2="200" stroke="#f59e0b" strokeWidth="1" strokeDasharray="6 4" opacity="0.6" />
      <text x="120" y="15" fill="#f59e0b" fontSize="9" textAnchor="middle">
        fr2
      </text>

      {/* M=1 reference */}
      <line x1="20" y1="120" x2="380" y2="120" stroke="#737373" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
      <text x="375" y="117" fill="#737373" fontSize="9" textAnchor="end">
        M=1
      </text>

      {/* Gain curves for different loads: peak at fr2, all cross at M=1 on fr1 */}
      <path
        d="M 20 200 Q 60 140 100 60 Q 110 30 120 20 L 200 120 Q 250 140 300 155 Q 340 170 380 180"
        fill="none"
        stroke="#f59e0b"
        strokeWidth="2.5"
        opacity="0.9"
      />
      <path
        d="M 20 200 Q 60 180 100 120 Q 115 90 120 80 L 200 120 Q 240 130 280 140 Q 330 155 380 165"
        fill="none"
        stroke="#14b8a6"
        strokeWidth="2.5"
        opacity="0.9"
      />
      <path
        d="M 20 200 Q 60 190 100 165 Q 115 145 120 135 L 200 120 Q 250 130 300 140 Q 340 150 380 160"
        fill="none"
        stroke="#f5f5f5"
        strokeWidth="2"
        opacity="0.4"
      />

      {/* Legend */}
      <g transform="translate(260, 30)">
        <line x1="0" y1="0" x2="20" y2="0" stroke="#f59e0b" strokeWidth="2" />
        <text x="26" y="4" fill="#a3a3a3" fontSize="10">
          轻载 (Q=0.2)
        </text>
        <line x1="0" y1="16" x2="20" y2="16" stroke="#14b8a6" strokeWidth="2" />
        <text x="26" y="20" fill="#a3a3a3" fontSize="10">
          满载 (Q=1.0)
        </text>
        <line x1="0" y1="32" x2="20" y2="32" stroke="#f5f5f5" strokeWidth="2" opacity="0.4" />
        <text x="26" y="36" fill="#a3a3a3" fontSize="10">
          重载 (Q=5.0)
        </text>
      </g>

      {/* Operating region annotation */}
      <rect
        x="120"
        y="20"
        width="260"
        height="180"
        fill="rgba(34, 197, 94, 0.05)"
        stroke="#22c55e"
        strokeWidth="1"
        strokeDasharray="4 4"
        opacity="0.6"
      />
      <text x="250" y="180" fill="#22c55e" fontSize="9" textAnchor="middle">
        Region 1 &amp; 2: ZVS 区域
      </text>
    </svg>
  )
}

/* ─── Animated SVG Components ─── */

function SwitchingAnimationSVG() {
  return (
    <svg viewBox="0 0 600 300" className="w-full max-w-2xl mx-auto h-auto" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id="arrowTeal" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <circle cx="3" cy="3" r="2" fill="#14b8a6" />
        </marker>
        <marker id="arrowAmber" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <circle cx="3" cy="3" r="2" fill="#f59e0b" />
        </marker>
      </defs>
      {/* Grid */}
      <g stroke="#404040" strokeWidth="1" opacity="0.2">
        {[40, 80, 120, 160, 200, 240, 280, 320, 360, 400, 440, 480, 520, 560].map((x) => (
          <line key={`v${x}`} x1={x} y1="10" x2={x} y2="280" />
        ))}
        {[20, 60, 100, 140, 180, 220, 260].map((y) => (
          <line key={`h${y}`} x1="40" y1={y} x2="560" y2={y} />
        ))}
      </g>

      {/* Vgs Q1 */}
      <g transform="translate(0, 10)">
        <text x="30" y="15" fill="#a3a3a3" fontSize="11" textAnchor="end">Vgs_Q1</text>
        <line x1="40" y1="20" x2="560" y2="20" stroke="#404040" strokeWidth="1" />
        <path d="M 40 20 L 40 5 L 120 5 L 120 20 L 160 20 L 160 5 L 240 5 L 240 20 L 280 20 L 280 5 L 360 5 L 360 20 L 400 20 L 400 5 L 480 5 L 480 20 L 520 20 L 520 5 L 560 5 L 560 20" fill="none" stroke="#14b8a6" strokeWidth="2">
          <animate attributeName="stroke-opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
        </path>
        {/* Dead-time labels */}
        <text x="140" y="38" fill="#f59e0b" fontSize="8" textAnchor="middle">死区</text>
        <text x="260" y="38" fill="#f59e0b" fontSize="8" textAnchor="middle">死区</text>
        <text x="440" y="38" fill="#f59e0b" fontSize="8" textAnchor="middle">死区</text>
      </g>

      {/* Vgs Q2 */}
      <g transform="translate(0, 50)">
        <text x="30" y="15" fill="#a3a3a3" fontSize="11" textAnchor="end">Vgs_Q2</text>
        <line x1="40" y1="20" x2="560" y2="20" stroke="#404040" strokeWidth="1" />
        <path d="M 40 20 L 120 20 L 120 5 L 160 5 L 160 20 L 240 20 L 240 5 L 280 5 L 280 20 L 360 20 L 360 5 L 400 5 L 400 20 L 480 20 L 480 5 L 520 5 L 520 20 L 560 20" fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 2">
          <animate attributeName="stroke-opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" begin="0.5s" />
        </path>
      </g>

      {/* Vds Q1 */}
      <g transform="translate(0, 100)">
        <text x="30" y="15" fill="#a3a3a3" fontSize="11" textAnchor="end">Vds_Q1</text>
        <line x1="40" y1="20" x2="560" y2="20" stroke="#404040" strokeWidth="1" />
        <path d="M 40 20 L 40 5 L 95 5 L 95 20 L 100 20 L 120 20 L 125 5 L 175 5 L 175 20 L 200 20 L 220 20 L 225 5 L 275 5 L 275 20 L 300 20 L 320 20 L 325 5 L 375 5 L 375 20 L 400 20 L 420 20 L 425 5 L 475 5 L 475 20 L 520 20 L 520 5 L 560 5" fill="none" stroke="#ef4444" strokeWidth="2" className="dash-flow-slow">
          <animate attributeName="stroke" values="#ef4444;#22c55e;#ef4444" dur="2s" repeatCount="indefinite" />
        </path>
        {/* ZVS highlight: Vds drops to zero before Vgs rises */}
        <rect x="95" y="2" width="25" height="24" fill="rgba(34,197,94,0.15)" stroke="#22c55e" strokeWidth="1" strokeDasharray="3 2">
          <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite" />
        </rect>
        <text x="108" y="-5" fill="#22c55e" fontSize="9" textAnchor="middle">ZVS</text>
      </g>

      {/* Ir */}
      <g transform="translate(0, 160)">
        <text x="30" y="15" fill="#a3a3a3" fontSize="11" textAnchor="end">Ir</text>
        <line x1="40" y1="30" x2="560" y2="30" stroke="#404040" strokeWidth="1" />
        <path d="M 40 30 Q 70 5 100 30 Q 130 55 160 30 Q 190 5 220 30 Q 250 55 280 30 Q 310 5 340 30 Q 370 55 400 30 Q 430 5 460 30 Q 490 55 520 30" fill="none" stroke="#14b8a6" strokeWidth="2" className="dash-flow" />
        {/* Animated dot on current */}
        <circle r="3" fill="#14b8a6">
          <animateMotion dur="1s" repeatCount="indefinite" path="M 40 30 Q 70 5 100 30 Q 130 55 160 30 Q 190 5 220 30 Q 250 55 280 30 Q 310 5 340 30 Q 370 55 400 30 Q 430 5 460 30 Q 490 55 520 30" />
        </circle>
      </g>

      {/* Im */}
      <g transform="translate(0, 220)">
        <text x="30" y="15" fill="#a3a3a3" fontSize="11" textAnchor="end">Im</text>
        <line x1="40" y1="20" x2="560" y2="20" stroke="#404040" strokeWidth="1" />
        <path d="M 40 20 L 100 5 L 160 35 L 220 5 L 280 35 L 340 5 L 400 35 L 460 5 L 520 35 L 560 20" fill="none" stroke="#22c55e" strokeWidth="2" className="dash-flow-slow" />
      </g>

      {/* Time axis */}
      <line x1="40" y1="280" x2="560" y2="280" stroke="#525252" strokeWidth="2" />
      <text x="300" y="295" fill="#737373" fontSize="10" textAnchor="middle">时间 t →</text>
    </svg>
  )
}

function CurrentFlowCircuitSVG() {
  return (
    <svg viewBox="0 0 540 360" className="w-full max-w-2xl mx-auto h-auto" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Arrow markers for current direction */}
        <marker id="arrowTealCircuit" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <path d="M 0 0 L 8 4 L 0 8 L 2 4 Z" fill="#14b8a6" />
        </marker>
        <marker id="arrowAmberCircuit" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <path d="M 0 0 L 8 4 L 0 8 L 2 4 Z" fill="#f59e0b" />
        </marker>
        <linearGradient id="gradTeal" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0f766e" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id="gradAmber" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#b45309" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.8" />
        </linearGradient>
      </defs>

      {/* DC input rails */}
      <line x1="40" y1="50" x2="120" y2="50" stroke="#a3a3a3" strokeWidth="2" />
      <line x1="40" y1="310" x2="120" y2="310" stroke="#a3a3a3" strokeWidth="2" />
      <text x="20" y="54" fill="#a3a3a3" fontSize="11">Vin+</text>
      <text x="20" y="314" fill="#a3a3a3" fontSize="11">GND</text>

      {/* Q1 (high-side) */}
      <rect x="120" y="30" width="44" height="44" fill="none" stroke="#14b8a6" strokeWidth="2" rx="2" />
      <text x="142" y="57" fill="#14b8a6" fontSize="11" textAnchor="middle">Q1</text>
      <line x1="142" y1="74" x2="142" y2="110" stroke="#a3a3a3" strokeWidth="2" />

      {/* Q2 (low-side) */}
      <rect x="120" y="286" width="44" height="44" fill="none" stroke="#f59e0b" strokeWidth="2" rx="2" />
      <text x="142" y="313" fill="#f59e0b" fontSize="11" textAnchor="middle">Q2</text>
      <line x1="142" y1="286" x2="142" y2="250" stroke="#a3a3a3" strokeWidth="2" />

      {/* Switch node */}
      <line x1="142" y1="110" x2="142" y2="250" stroke="#a3a3a3" strokeWidth="2" />
      <circle cx="142" cy="180" r="4" fill="#f5f5f5" stroke="#a3a3a3" strokeWidth="1" />
      <text x="120" y="184" fill="#f5f5f5" fontSize="9" textAnchor="end">SW</text>

      {/* Resonant inductor Lr */}
      <path d="M 142 180 L 170 180 L 170 170 L 180 190 L 190 170 L 200 190 L 210 170 L 220 190 L 230 180 L 260 180" fill="none" stroke="#14b8a6" strokeWidth="2" />
      <text x="200" y="165" fill="#14b8a6" fontSize="11" textAnchor="middle">Lr</text>

      {/* Resonant capacitor Cr */}
      <line x1="260" y1="165" x2="260" y2="195" stroke="#f59e0b" strokeWidth="2" />
      <line x1="270" y1="165" x2="270" y2="195" stroke="#f59e0b" strokeWidth="2" />
      <text x="285" y="184" fill="#f59e0b" fontSize="11">Cr</text>

      {/* Transformer primary connection */}
      <line x1="270" y1="180" x2="310" y2="180" stroke="#a3a3a3" strokeWidth="2" />

      {/* Transformer (center-tapped primary shown as two coupled inductors) */}
      <path d="M 310 160 Q 322 170 310 180 Q 322 190 310 200" fill="none" stroke="#a3a3a3" strokeWidth="2" />
      <path d="M 330 160 Q 342 170 330 180 Q 342 190 330 200" fill="none" stroke="#a3a3a3" strokeWidth="2" />
      {/* Coupling arc */}
      <path d="M 316 158 Q 322 150 328 158" fill="none" stroke="#a3a3a3" strokeWidth="1" />
      <path d="M 316 202 Q 322 210 328 202" fill="none" stroke="#a3a3a3" strokeWidth="1" />
      <text x="320" y="150" fill="#a3a3a3" fontSize="11" textAnchor="middle">T</text>

      {/* Center tap / secondary */}
      <line x1="330" y1="180" x2="360" y2="180" stroke="#a3a3a3" strokeWidth="2" />
      <line x1="360" y1="150" x2="360" y2="210" stroke="#a3a3a3" strokeWidth="2" />
      <path d="M 360 150 Q 372 160 360 170 Q 372 180 360 190" fill="none" stroke="#a3a3a3" strokeWidth="2" />
      <path d="M 375 150 Q 387 160 375 170 Q 387 180 375 190" fill="none" stroke="#a3a3a3" strokeWidth="2" />

      {/* Rectifier diodes */}
      <polygon points="390,140 400,150 380,150" fill="none" stroke="#22c55e" strokeWidth="2" />
      <line x1="390" y1="150" x2="390" y2="160" stroke="#22c55e" strokeWidth="2" />
      <text x="402" y="147" fill="#22c55e" fontSize="10">D1</text>

      <polygon points="390,220 400,210 380,210" fill="none" stroke="#22c55e" strokeWidth="2" />
      <line x1="390" y1="210" x2="390" y2="200" stroke="#22c55e" strokeWidth="2" />
      <text x="402" y="223" fill="#22c55e" fontSize="10">D2</text>

      {/* Output capacitor / load */}
      <line x1="390" y1="150" x2="460" y2="150" stroke="#a3a3a3" strokeWidth="2" />
      <line x1="390" y1="210" x2="460" y2="210" stroke="#a3a3a3" strokeWidth="2" />
      <line x1="460" y1="150" x2="460" y2="165" stroke="#a3a3a3" strokeWidth="2" />
      <line x1="455" y1="165" x2="465" y2="165" stroke="#a3a3a3" strokeWidth="2" />
      <line x1="455" y1="175" x2="465" y2="175" stroke="#a3a3a3" strokeWidth="2" />
      <line x1="460" y1="175" x2="460" y2="210" stroke="#a3a3a3" strokeWidth="2" />
      <text x="470" y="174" fill="#a3a3a3" fontSize="11">Co/Ro</text>
      <text x="470" y="155" fill="#a3a3a3" fontSize="10">Vo+</text>
      <text x="470" y="208" fill="#a3a3a3" fontSize="10">Vo-</text>

      {/* Positive half-cycle current loop: Vin+ -> Q1 -> Lr -> Cr -> T -> D1 -> Co -> GND -> Vin- */}
      <path
        id="pathPos"
        d="M 60 50 L 120 50 L 142 50 L 142 110 L 142 180 L 170 180 L 230 180 L 260 180 L 270 180 L 310 180 L 330 180 L 360 180 L 360 150 L 390 150 L 460 150 L 460 210 L 390 210 L 360 210 L 360 250 L 142 250 L 142 310 L 120 310 L 60 310 L 60 50"
        fill="none"
        stroke="url(#gradTeal)"
        strokeWidth="3"
        strokeDasharray="8 6"
        strokeLinecap="round"
        markerEnd="url(#arrowTealCircuit)"
        opacity="0.75"
      >
        <animate attributeName="stroke-dashoffset" values="28;0" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.75;0.75;0;0;0.75" dur="2s" repeatCount="indefinite" keyTimes="0;0.45;0.5;0.95;1" />
      </path>
      <circle r="4" fill="#14b8a6" opacity="0.75">
        <animate attributeName="opacity" values="0.75;0.75;0;0;0.75" dur="2s" repeatCount="indefinite" keyTimes="0;0.45;0.5;0.95;1" />
        <animateMotion dur="2s" repeatCount="indefinite" path="M 60 50 L 120 50 L 142 50 L 142 110 L 142 180 L 170 180 L 230 180 L 260 180 L 270 180 L 310 180 L 330 180 L 360 180 L 360 150 L 390 150 L 460 150 L 460 210 L 390 210 L 360 210 L 360 250 L 142 250 L 142 310 L 120 310 L 60 310 L 60 50" />
      </circle>
      <text x="85" y="100" fill="#14b8a6" fontSize="11" fontWeight="600">+Ir</text>

      {/* Negative half-cycle current loop: GND -> Q2 -> Lr -> Cr -> T -> D2 -> Co -> Vin+ -> GND (mirror) */}
      <path
        id="pathNeg"
        d="M 60 310 L 120 310 L 142 310 L 142 250 L 142 180 L 170 180 L 230 180 L 260 180 L 270 180 L 310 180 L 330 180 L 360 180 L 360 210 L 390 210 L 460 210 L 460 150 L 390 150 L 360 150 L 360 110 L 142 110 L 142 50 L 120 50 L 60 50 L 60 310"
        fill="none"
        stroke="url(#gradAmber)"
        strokeWidth="3"
        strokeDasharray="8 6"
        strokeLinecap="round"
        markerEnd="url(#arrowAmberCircuit)"
        opacity="0"
      >
        <animate attributeName="stroke-dashoffset" values="28;0" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0;0;0.75;0.75;0" dur="2s" repeatCount="indefinite" keyTimes="0;0.5;0.55;0.95;1" />
      </path>
      <circle r="4" fill="#f59e0b" opacity="0">
        <animate attributeName="opacity" values="0;0;1;1;0" dur="2s" repeatCount="indefinite" keyTimes="0;0.5;0.55;0.95;1" />
        <animateMotion dur="2s" repeatCount="indefinite" path="M 60 310 L 120 310 L 142 310 L 142 250 L 142 180 L 170 180 L 230 180 L 260 180 L 270 180 L 310 180 L 330 180 L 360 180 L 360 210 L 390 210 L 460 210 L 460 150 L 390 150 L 360 150 L 360 110 L 142 110 L 142 50 L 120 50 L 60 50 L 60 310" />
      </circle>
      <text x="85" y="270" fill="#f59e0b" fontSize="11" fontWeight="600">-Ir</text>

      {/* Legend */}
      <g transform="translate(40, 340)">
        <line x1="0" y1="0" x2="20" y2="0" stroke="#14b8a6" strokeWidth="3" strokeDasharray="4 3" />
        <text x="26" y="4" fill="#14b8a6" fontSize="10">正半周电流路径</text>
        <line x1="150" y1="0" x2="170" y2="0" stroke="#f59e0b" strokeWidth="3" strokeDasharray="4 3" />
        <text x="176" y="4" fill="#f59e0b" fontSize="10">负半周电流路径</text>
      </g>
    </svg>
  )
}

function ZVSZoomAnimatedSVG({ idSuffix = '' }: { idSuffix?: string }) {
  return (
    <svg viewBox="0 0 420 210" className="w-full max-w-lg mx-auto h-auto" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id={`arrowTealZvs${idSuffix}`} markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <path d="M 0 0 L 8 4 L 0 8 L 2 4 Z" fill="#14b8a6" />
        </marker>
        <marker id={`arrowGreenZvs${idSuffix}`} markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <path d="M 0 0 L 8 4 L 0 8 L 2 4 Z" fill="#22c55e" />
        </marker>
      </defs>
      {/* Grid */}
      <g stroke="#404040" strokeWidth="1" opacity="0.2">
        {[40, 80, 120, 160, 200, 240, 280, 320, 360, 400].map((x) => (
          <line key={`v${x}`} x1={x} y1="10" x2={x} y2="180" />
        ))}
        {[20, 60, 100, 140, 180].map((y) => (
          <line key={`h${y}`} x1="40" y1={y} x2="400" y2={y} />
        ))}
      </g>

      {/* Vgs */}
      <text x="30" y="15" fill="#a3a3a3" fontSize="10" textAnchor="end">Vgs</text>
      <line x1="40" y1="20" x2="400" y2="20" stroke="#404040" strokeWidth="1" />
      <path d="M 40 20 L 40 5 L 80 5 L 80 20 L 100 20 L 100 5 L 140 5 L 140 20 L 160 20" fill="none" stroke="#14b8a6" strokeWidth="2">
        <animate attributeName="stroke-opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" />
      </path>
      {/* Vgs rising arrow */}
      <path d="M 100 5 L 105 15 L 95 15 Z" fill="#14b8a6">
        <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" begin="0.3s" />
      </path>
      <text x="145" y="12" fill="#14b8a6" fontSize="9">Vgs 上升</text>

      {/* Vds */}
      <text x="30" y="55" fill="#a3a3a3" fontSize="10" textAnchor="end">Vds</text>
      <line x1="40" y1="60" x2="400" y2="60" stroke="#404040" strokeWidth="1" />
      <path d="M 40 60 L 40 30 L 70 30 L 70 60 L 80 60 L 100 60 L 105 30 L 135 30 L 135 60 L 160 60" fill="none" stroke="#ef4444" strokeWidth="2">
        <animate attributeName="stroke" values="#ef4444;#22c55e;#ef4444" dur="1.5s" repeatCount="indefinite" />
      </path>
      {/* Vds dropping arrow */}
      <path d="M 75 50 L 80 40 L 85 50 Z" fill="#22c55e">
        <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" />
      </path>
      <text x="140" y="52" fill="#22c55e" fontSize="9">Vds 降至 0</text>

      {/* Id / Ir */}
      <text x="30" y="95" fill="#a3a3a3" fontSize="10" textAnchor="end">Ir</text>
      <line x1="40" y1="100" x2="400" y2="100" stroke="#404040" strokeWidth="1" />
      <path d="M 40 100 L 60 100 L 65 85 Q 80 70 95 85 L 100 100 L 120 100 L 125 85 Q 140 70 155 85 L 160 100" fill="none" stroke="#f59e0b" strokeWidth="2" className="dash-flow" />

      {/* Body diode conduction zone */}
      <rect x="70" y="25" width="30" height="80" fill="rgba(239,68,68,0.1)" stroke="#ef4444" strokeWidth="1" strokeDasharray="3 2">
        <animate attributeName="opacity" values="0.2;0.6;0.2" dur="1.5s" repeatCount="indefinite" />
      </rect>
      <text x="25" y="70" fill="#ef4444" fontSize="9" textAnchor="end">体二极管导通钳位</text>

      {/* Dead time zone */}
      <rect x="80" y="2" width="20" height="140" fill="rgba(245,158,11,0.08)" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 2">
        <animate attributeName="opacity" values="0.1;0.4;0.1" dur="1.5s" repeatCount="indefinite" />
      </rect>
      <text x="90" y="155" fill="#f59e0b" fontSize="9" textAnchor="middle">死区时间</text>

      {/* Annotation arrows */}
      <line x1="70" y1="140" x2="70" y2="108" stroke="#22c55e" strokeWidth="1" strokeDasharray="2 2" markerEnd={`url(#arrowGreenZvs${idSuffix})`} />
      <text x="55" y="125" fill="#22c55e" fontSize="9" textAnchor="end">Vds=0</text>

      <line x1="100" y1="140" x2="100" y2="25" stroke="#14b8a6" strokeWidth="1" strokeDasharray="2 2" markerEnd={`url(#arrowTealZvs${idSuffix})`} />
      <text x="115" y="85" fill="#14b8a6" fontSize="9">Vgs 上升</text>

      {/* Explanation text */}
      <text x="220" y="190" fill="#a3a3a3" fontSize="10" textAnchor="middle">
        死区时间内，谐振电流经体二极管续流，将 Vds 钳位到 0V，实现 ZVS。
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
                青色虚线表示正半周电流回路（Vin+ → Q1 → Lr → Cr → T → D1 → 负载 → GND），琥珀色虚线表示负半周回路（GND → Q2 → Lr → Cr → T → D2 → 负载 → Vin+）。小圆点沿闭合回路流动，清晰展示谐振电流方向随开关状态交替变化。
              </p>
            </div>
            <div className="bg-bg/50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-primary-light mb-3">ZVS 过程特写</h4>
              <ZVSZoomAnimatedSVG idSuffix="-top" />
              <p className="text-text-secondary text-xs mt-3 leading-relaxed">
                死区时间内，体二极管导通将 Vds 钳位至接近 0V。随后 Vgs 上升，MOSFET 在零电压条件下导通，实现 ZVS。这一过程消除了开通损耗（Coss 充放电损耗）。
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
                    <td className="py-2 px-3">环流大，励磁损耗高，变压器体积往往偏大</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 px-3 font-medium text-text-primary">高 Q（&gt;1，重载）</td>
                    <td className="py-2 px-3">增益曲线陡峭，调节范围窄</td>
                    <td className="py-2 px-3">峰值增益低，重载电流应力大</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 px-3 font-medium text-text-primary">低 Q（&lt;0.5，轻载）</td>
                    <td className="py-2 px-3">峰值增益高，电流应力小</td>
                    <td className="py-2 px-3">增益曲线平坦，调节范围宽，轻载效率下降</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium text-text-primary">高频率（&gt;300kHz）</td>
                    <td className="py-2 px-3">元件体积小，功率密度高</td>
                    <td className="py-2 px-3">磁芯损耗大，EMI 难控制</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  )
}