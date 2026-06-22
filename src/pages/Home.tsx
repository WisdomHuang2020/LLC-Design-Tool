import { useDesign } from '../lib/DesignContext'
import GainChart from '../components/GainChart'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Zap,
  BookOpen,
  Activity,
  PenTool,
  Calculator,
  ArrowRight,
  Waves,
  TrendingUp,
} from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' as const },
  }),
}

const features = [
  {
    icon: BookOpen,
    title: '谐振基础',
    desc: '从 LC 谐振到 LLC 拓扑，系统理解谐振变换器的基本概念与核心参数。',
    href: '/fundamentals',
    color: 'text-primary-light',
  },
  {
    icon: Activity,
    title: '工作原理',
    desc: '深入解析开关模式、ZVS 条件、关键波形与增益特性，掌握运行机理。',
    href: '/operation',
    color: 'text-accent',
  },
  {
    icon: PenTool,
    title: '公式推导',
    desc: '基于 FHA 的完整增益方程推导，逐步展示从电路模型到设计公式的全过程。',
    href: '/derivations',
    color: 'text-primary-light',
  },
  {
    icon: Calculator,
    title: '设计工具',
    desc: '输入电气规格，自动计算谐振参数、元件选型与优化建议，生成设计报告。',
    href: '/designer',
    color: 'text-accent',
  },
]

function HeroCircuitBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.08]"
        viewBox="0 0 1200 600"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" className="text-primary-light" />

        {/* Animated resonant tank circuit symbol */}
        <g className="text-primary-light" stroke="currentColor" fill="none">
          <circle cx="240" cy="300" r="40" strokeWidth="2" opacity="0.3">
            <animate attributeName="r" values="40;44;40" dur="4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.3;0.15;0.3" dur="4s" repeatCount="indefinite" />
          </circle>
          <circle cx="960" cy="300" r="40" strokeWidth="2" opacity="0.3">
            <animate attributeName="r" values="40;44;40" dur="4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.3;0.15;0.3" dur="4s" repeatCount="indefinite" />
          </circle>

          {/* Sinusoidal wave connecting them */}
          <path
            d="M 240,300 Q 420,180 600,300 T 960,300"
            strokeWidth="2"
            opacity="0.4"
          >
            <animate
              attributeName="d"
              values="
                M 240,300 Q 420,180 600,300 T 960,300;
                M 240,300 Q 420,420 600,300 T 960,300;
                M 240,300 Q 420,180 600,300 T 960,300
              "
              dur="3s"
              repeatCount="indefinite"
            />
          </path>

          {/* Small floating nodes */}
          <circle cx="420" cy="210" r="3" fill="currentColor" opacity="0.5">
            <animate attributeName="cy" values="210;180;210" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="780" cy="390" r="3" fill="currentColor" opacity="0.5">
            <animate attributeName="cy" values="390;420;390" dur="3s" repeatCount="indefinite" />
          </circle>
        </g>
      </svg>
    </div>
  )
}

function GainCurvePreview() {
  const { results } = useDesign()
  const hasResults = results !== null
  const k = hasResults ? results.k : 5
  const Q = hasResults ? results.q : 1

  return (
    <Link to="/curves" className="block group">
      <div className="card-surface p-6 md:p-8 transition-all duration-200 hover:border-border-light hover:scale-[1.01]">
        <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary-dark/40 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary-light" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary">增益特性预览</h3>
            </div>
            <p className="text-text-secondary text-sm leading-relaxed mb-4">
              LLC 谐振变换器的电压增益随归一化频率变化。不同负载（Q值）下曲线形态各异，轻载（Q 小）时峰值增益更高、曲线更平缓；重载（Q 大）时峰值增益更低、曲线更陡峭（尖锐）。
            </p>
            <div className="flex items-center gap-2 text-primary-light text-sm font-medium group-hover:gap-3 transition-all">
              <span>查看交互式曲线</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          <div className="w-full md:w-72 h-48 flex-shrink-0">
            <GainChart
              k={k}
              Q={Q}
              height={192}
              showCurrentQ={false}
              showLegend={false}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative w-full bg-bg overflow-hidden">
        <HeroCircuitBackground />
        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-28 lg:py-32">
          <div className="flex flex-col lg:flex-row items-center gap-8 xl:gap-12">
            <div className="flex-1 max-w-3xl">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={0}
              className="flex items-center gap-2 mb-6"
            >
              <div className="w-10 h-10 rounded-lg bg-primary-dark/40 flex items-center justify-center">
                <Waves className="w-5 h-5 text-primary-light" />
              </div>
              <span className="text-primary-light font-medium text-sm tracking-wider uppercase">
                Power Electronics Design
              </span>
            </motion.div>

            <motion.h1
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={1}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary tracking-tight leading-tight mb-6"
            >
              LLC谐振变换器
              <br />
              <span className="text-gradient">设计工具</span>
            </motion.h1>

            <motion.p
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={2}
              className="text-lg md:text-xl text-text-secondary leading-relaxed mb-10 max-w-2xl"
            >
              从理论到设计 — 完整的LLC谐振变换器学习与工程化工具
            </motion.p>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={3}
              className="flex flex-wrap gap-4"
            >
              <Link
                to="/fundamentals"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary-light transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                <BookOpen className="w-4 h-4" />
                开始学习
              </Link>
              <Link
                to="/designer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-surface-elevated text-text-primary border border-border rounded-lg font-medium text-sm hover:border-border-light hover:bg-surface transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Calculator className="w-4 h-4" />
                打开设计工具
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>

          {/* Right: Half-bridge LLC architecture diagram */}
          <div className="hidden lg:flex flex-1 items-center justify-center max-w-xl">
            <img
              src="./半桥LLC架构.svg"
              alt="半桥LLC架构"
              className="w-full max-w-[520px] h-auto drop-shadow-2xl opacity-90 invert hue-rotate-180"
            />
          </div>
        </div>
      </div>
    </section>

      {/* Features */}
      <section className="w-full py-16 md:py-20 bg-bg">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={fadeUp}
            custom={0}
            className="text-center mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-semibold text-text-primary tracking-tight mb-3">
              核心功能模块
            </h2>
            <p className="text-text-secondary max-w-xl mx-auto">
              覆盖从理论学习到工程设计的完整链路，每一步都有可视化辅助与交互工具。
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.href}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-40px' }}
                  variants={fadeUp}
                  custom={index + 1}
                >
                  <Link
                    to={feature.href}
                    className="card-surface block p-6 md:p-8 h-full transition-all duration-200 hover:border-border-light hover:scale-[1.01] group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-lg bg-primary-dark/30 flex items-center justify-center flex-shrink-0">
                        <Icon className={`w-5 h-5 ${feature.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-text-primary">{feature.title}</h3>
                          <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-primary-light group-hover:translate-x-1 transition-all" />
                        </div>
                        <p className="text-text-secondary text-sm leading-relaxed">{feature.desc}</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Quick Preview */}
      <section className="w-full py-16 md:py-20 bg-surface/30">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={fadeUp}
            custom={0}
            className="text-center mb-10"
          >
            <h2 className="text-2xl md:text-3xl font-semibold text-text-primary tracking-tight mb-3">
              特性曲线速览
            </h2>
            <p className="text-text-secondary max-w-xl mx-auto">
              LLC 变换器的核心设计依据：增益-频率特性曲线，直观展示不同负载下的电压调节能力。
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={fadeUp}
            custom={1}
          >
            <GainCurvePreview />
          </motion.div>
        </div>
      </section>

      {/* CTA Bottom */}
      <section className="w-full py-16 md:py-20 bg-bg">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={fadeUp}
            custom={0}
            className="card-surface p-8 md:p-12 text-center"
          >
            <div className="w-12 h-12 rounded-xl bg-primary-dark/40 flex items-center justify-center mx-auto mb-5">
              <Zap className="w-6 h-6 text-primary-light" />
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold text-text-primary tracking-tight mb-3">
              开始你的 LLC 设计
            </h2>
            <p className="text-text-secondary max-w-lg mx-auto mb-8">
              无论您是初次学习还是进行实际工程设计，本工具都能提供清晰的理论指导和高效的计算支持。
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/fundamentals"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary-light transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                <BookOpen className="w-4 h-4" />
                从基础开始
              </Link>
              <Link
                to="/designer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-surface-elevated text-text-primary border border-border rounded-lg font-medium text-sm hover:border-border-light hover:bg-surface transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Calculator className="w-4 h-4" />
                直接进入设计工具
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
