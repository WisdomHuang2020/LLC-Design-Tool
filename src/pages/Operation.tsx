import { motion } from 'framer-motion'
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
} from 'lucide-react'
import MathBlock from '../components/MathBlock'

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
  className = '',
  index = 0,
}: {
  children: React.ReactNode
  className?: string
  index?: number
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      variants={fadeUp}
      custom={index}
      className={`card-surface p-6 md:p-8 ${className}`}
    >
      {children}
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
      viewBox="0 0 560 380"
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

      {/* ─── Vgs (Gate Drive) ─── */}
      <g transform="translate(0, 0)">
        <text x="10" y="25" fill="#a3a3a3" fontSize="11" textAnchor="end">
          Vgs
        </text>
        <line x1="40" y1="40" x2="520" y2="40" stroke="#404040" strokeWidth="1" />
        <path
          d="M 40 40 L 40 20 L 100 20 L 100 40 L 120 40 L 120 20 L 180 20 L 180 40 L 200 40 L 200 20 L 260 20 L 260 40 L 280 40 L 280 20 L 340 20 L 340 40 L 360 40 L 360 20 L 420 20 L 420 40 L 440 40 L 440 20 L 500 20 L 500 40 L 520 40"
          fill="none"
          stroke="#14b8a6"
          strokeWidth="2"
        />
        <text x="530" y="25" fill="#14b8a6" fontSize="10">
          Q1
        </text>
        <path
          d="M 40 40 L 100 40 L 100 20 L 120 20 L 120 40 L 200 40 L 200 20 L 220 20 L 220 40 L 300 40 L 300 20 L 320 20 L 320 40 L 400 40 L 400 20 L 420 20 L 420 40 L 520 40"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="2"
          strokeDasharray="4 3"
        />
        <text x="530" y="45" fill="#f59e0b" fontSize="10">
          Q2
        </text>
      </g>

      {/* ─── Vds (Drain Voltage) ─── */}
      <g transform="translate(0, 80)">
        <text x="10" y="25" fill="#a3a3a3" fontSize="11" textAnchor="end">
          Vds
        </text>
        <line x1="40" y1="40" x2="520" y2="40" stroke="#404040" strokeWidth="1" />
        <path
          d="M 40 40 L 40 10 L 95 10 L 95 40 L 100 40 L 120 40 L 125 10 L 175 10 L 175 40 L 200 40 L 220 40 L 225 10 L 275 10 L 275 40 L 300 40 L 320 40 L 325 10 L 375 10 L 375 40 L 400 40 L 420 40 L 425 10 L 475 10 L 475 40 L 520 40"
          fill="none"
          stroke="#ef4444"
          strokeWidth="2"
        />
        <text x="40" y="55" fill="#737373" fontSize="9">
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
      <text x="280" y="395" fill="#737373" fontSize="10" textAnchor="middle">
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

      {/* Gain curves for different loads */}
      <path
        d="M 20 200 Q 50 190 80 160 Q 100 130 120 80 L 200 40 Q 250 60 300 90 Q 340 110 380 120"
        fill="none"
        stroke="#f59e0b"
        strokeWidth="2.5"
        opacity="0.9"
      />
      <path
        d="M 20 200 Q 60 195 90 175 Q 120 150 140 110 L 200 80 Q 240 95 280 110 Q 330 120 380 120"
        fill="none"
        stroke="#14b8a6"
        strokeWidth="2.5"
        opacity="0.9"
      />
      <path
        d="M 20 200 Q 70 198 100 185 Q 130 170 150 145 L 200 120 Q 230 130 270 125 Q 320 122 380 120"
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
        x="200"
        y="20"
        width="180"
        height="180"
        fill="rgba(34, 197, 94, 0.05)"
        stroke="#22c55e"
        strokeWidth="1"
        strokeDasharray="4 4"
        opacity="0.6"
      />
      <text x="290" y="180" fill="#22c55e" fontSize="9" textAnchor="middle">
        ZVS 区域 (f &gt; fr1)
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
        <SectionCard index={1}>
          <SectionTitle
            icon={ToggleLeft}
            title="开关工作模式"
            subtitle="根据开关频率与谐振频率的相对关系划分三种模式"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-bg/50 rounded-lg p-5 border border-border/50">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                  <span className="text-accent font-bold text-sm">1</span>
                </div>
                <h3 className="text-sm font-semibold text-text-primary">
                  f &lt; fr1（低于第一谐振）
                </h3>
              </div>
              <p className="text-text-secondary text-sm leading-relaxed mb-3">
                开关频率低于谐振频率 Lr-Cr 的谐振点。谐振电流呈正弦半波，但周期比开关周期长，导致二极管在电流过零后仍然导通一段时间（断续导通模式，DCM）。
              </p>
              <div className="flex items-center gap-2 text-sm">
                <AlertCircle className="w-4 h-4 text-accent" />
                <span className="text-accent">ZVS 可能丢失，需谨慎使用</span>
              </div>
            </div>

            <div className="bg-bg/50 rounded-lg p-5 border border-primary/30">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-primary-light font-bold text-sm">2</span>
                </div>
                <h3 className="text-sm font-semibold text-text-primary">
                  fr1 &lt; f &lt; fr2（最优区间）
                </h3>
              </div>
              <p className="text-text-secondary text-sm leading-relaxed mb-3">
                开关频率介于两个谐振频率之间。谐振电流在死区时间内完成换向，Lm 被输出电压钳位，不参与谐振。此模式下原边 MOSFET 自然实现 ZVS，副边二极管自然实现 ZCS。
              </p>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span className="text-success">最优工作区域，推荐设计点</span>
              </div>
            </div>

            <div className="bg-bg/50 rounded-lg p-5 border border-border/50">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-primary-light/20 flex items-center justify-center">
                  <span className="text-primary-light font-bold text-sm">3</span>
                </div>
                <h3 className="text-sm font-semibold text-text-primary">
                  f &gt; fr2（高于第二谐振）
                </h3>
              </div>
              <p className="text-text-secondary text-sm leading-relaxed mb-3">
                开关频率高于第二谐振频率。Lm 不再被输出电压完全钳位，开始参与谐振过程。增益随频率升高而单调下降，变换器始终工作在感性区，ZVS 可靠实现。
              </p>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span className="text-success">ZVS 可靠，但开关损耗增大</span>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-primary-dark/20 rounded-lg border border-primary/20">
            <h4 className="text-sm font-semibold text-primary-light mb-2">
              模式边界条件
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MathBlock
                latex="f_{r1} = \frac{1}{2\pi\sqrt{L_r C_r}}"
                important
              />
              <MathBlock
                latex="f_{r2} = \frac{1}{2\pi\sqrt{(L_r + L_m) C_r}} = \frac{f_{r1}}{\sqrt{1 + \lambda}}"
                important
              />
            </div>
            <p className="text-text-secondary text-sm mt-2">
              其中 λ = Lm/Lr。fr2 始终小于 fr1，因此 LLC 总是具有两个不同的谐振频率点。
            </p>
          </div>
        </SectionCard>

        {/* Section 2: Key Waveforms */}
        <SectionCard index={2}>
          <SectionTitle
            icon={Waves}
            title="关键波形"
            subtitle="稳态运行时的电压与电流波形特征"
          />

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
                仅在谐振电流绝对值大于励磁电流时流通，对应整流二极管导通时段。在 fr1 &lt; f &lt; fr2 时自然实现 ZCS。
              </p>
            </div>
          </div>
        </SectionCard>

        {/* Section 3: ZVS Conditions */}
        <SectionCard index={3}>
          <SectionTitle
            icon={CheckCircle2}
            title="ZVS 条件"
            subtitle="为什么 LLC 能实现零电压开关（ZVS）及其必要条件"
          />

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
                    开关频率必须高于谐振频率（fsw &gt; fr1），使输入阻抗呈感性。感性电流滞后于电压，确保在死区时间内电流方向正确。
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
                  latex="\frac{1}{2} L_p I_p^2 \geq \frac{1}{2} C_{oss} V_{in}^2 \cdot 2"
                  important
                />
                <p className="text-text-secondary text-xs mt-1">
                  其中 Lp 为等效初级电感，Ip 为死区开始时电流峰值，Coss 为 MOSFET 输出电容。
                </p>
              </div>
            </div>

            <div className="bg-bg/50 rounded-lg p-4">
              <ZVSWaveformSVG />
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
        <SectionCard index={4}>
          <SectionTitle
            icon={TrendingUp}
            title="增益特性"
            subtitle="电压增益 M 与频率、负载的关系"
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="bg-bg/50 rounded-lg p-4">
              <GainCurveSVG />
            </div>
            <div className="space-y-4">
              <p className="text-text-primary leading-relaxed">
                LLC 谐振变换器的电压增益定义为输出反射电压与输入电压之比：
              </p>
              <MathBlock
                latex="M = \frac{2n V_{out}}{V_{in}}"
                important
              />
              <p className="text-text-secondary text-sm leading-relaxed">
                基于 FHA（First Harmonic Approximation）方法，完整的 LLC 电压增益方程为：
              </p>
              <MathBlock
                latex="M(f_n, \lambda, Q) = \left| \frac{f_n^2 \cdot \lambda}{\sqrt{(f_n^2(1+\lambda)-1)^2 + (f_n Q (f_n^2-1))^2 \cdot \lambda^2}} \right|"
                important
              />
              <p className="text-text-secondary text-sm leading-relaxed">
                其中 <span className="font-mono text-primary-light">fn = fsw / fr1</span> 为归一化频率，<span className="font-mono text-primary-light">λ = Lm / Lr</span> 为电感比，<span className="font-mono text-primary-light">Q = Zr / Rac</span> 为品质因数。
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
                在感性区（fn &gt; 1），增益随频率升高而单调下降。通过提高开关频率降低增益，通过降低开关频率提高增益，实现宽输入电压范围的稳压输出。
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
                最大增益出现在 f = fr2 附近，峰值大小由 λ 和 Q 共同决定。设计时必须确保峰值增益大于所需的最大增益（对应最低输入电压、最大负载）。
              </p>
            </div>
          </div>
        </SectionCard>

        {/* Section 5: Design Trade-offs */}
        <SectionCard index={5}>
          <SectionTitle
            icon={Scale}
            title="设计权衡"
            subtitle="效率、频率、损耗与体积之间的工程折中"
          />

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
                较高的 λ（Lm/Lr）意味着更大的励磁电感，可减小变压器磁芯体积，但会缩小 ZVS 范围并降低峰值增益。较低的 λ 需要更大的磁芯以容纳更大的励磁电感，但有利于轻载 ZVS 与更高的峰值增益。
              </p>
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <span className="inline-block w-2 h-2 rounded-full bg-success" />
                典型范围：λ = 3 ~ 10 为常见工程取值
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
                    <td className="py-2 px-3 font-medium text-text-primary">高 λ（&gt;8）</td>
                    <td className="py-2 px-3">变压器体积小，环流小</td>
                    <td className="py-2 px-3">ZVS 范围窄，峰值增益低</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 px-3 font-medium text-text-primary">低 λ（&lt;5）</td>
                    <td className="py-2 px-3">ZVS 范围宽，峰值增益高</td>
                    <td className="py-2 px-3">变压器体积大，励磁损耗高</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 px-3 font-medium text-text-primary">高 Q（&gt;1）</td>
                    <td className="py-2 px-3">增益曲线平坦，稳压好</td>
                    <td className="py-2 px-3">重载电流应力大，频带宽</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 px-3 font-medium text-text-primary">低 Q（&lt;0.5）</td>
                    <td className="py-2 px-3">电流应力小，效率高</td>
                    <td className="py-2 px-3">增益曲线陡峭，调节范围大</td>
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
