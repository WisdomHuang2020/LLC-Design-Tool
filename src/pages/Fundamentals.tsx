import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen,
  GitCompare,
  Zap,
  Layers,
  Settings2,
  Table,
  Triangle,
  Square,
  ChevronDown,
} from 'lucide-react'
import MathBlock from '../components/MathBlock'
import InlineMath from '../components/InlineMath'

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

/* ─── SVG Circuit Diagrams ─── */
/* ─── Page ─── */

export default function Fundamentals() {
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
            <BookOpen className="w-6 h-6 text-primary-light" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gradient tracking-tight">
            谐振电路基础
          </h1>
        </div>
        <p className="text-text-secondary max-w-2xl text-lg leading-relaxed">
          从 LC 谐振原理到 LLC 谐振腔结构，建立谐振变换器设计的理论基础。理解谐振频率、品质因数、特征阻抗等核心参数的定义与物理意义。
        </p>
      </motion.div>

      <div className="space-y-6 md:space-y-8">
        {/* Section 1: What is Resonance? */}
        <SectionCard index={1} header={<SectionTitle
            icon={Zap}
            title="什么是谐振？"
            subtitle="LC 谐振电路的基本概念与阻抗特性"
          />}>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <p className="text-text-primary leading-relaxed">
                当电感（L）与电容（C）共同组成电路时，在特定频率下，电感的感抗与电容的容抗大小相等、相位相反，电路呈现纯电阻特性。这一现象称为
                <strong className="text-primary-light">谐振</strong>
                。谐振变换器正是利用这一原理实现软开关与高效率能量传输。
              </p>
              <p className="text-text-secondary text-sm leading-relaxed">
                在谐振频率处，串联 LC 的阻抗最小（接近零），并联 LC 的阻抗最大（理论上无穷大）。这一极端特性使得谐振电路可以作为高效的能量传输通道或选频滤波器。
              </p>
              <div className="flex flex-wrap gap-4 mt-4">
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <div className="w-3 h-3 rounded-full bg-primary-light" />
                  <span>谐振频率 fr</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <div className="w-3 h-3 rounded-full bg-accent" />
                  <span>阻抗最小点</span>
                </div>
              </div>
            </div>
            <div className="bg-bg/50 rounded-lg p-4">
              <img
                src="v1_dark_modern.png"
                alt="串联 LC 谐振电路"
                className="w-full max-w-xl mx-auto h-auto rounded-lg"
              />
            </div>
          </div>

          <div className="mt-6">
            <p className="text-text-primary text-sm mb-3">
              串联 LC 谐振电路的谐振频率与角频率：
            </p>
            <MathBlock
              latex="f_r = \\frac{1}{2\\pi\\sqrt{L_r C_r}}"
              important
            />
            <MathBlock
              latex="\\omega_r = 2\\pi f_r = \\frac{1}{\\sqrt{L_r C_r}}"
            />
            <p className="text-text-secondary text-sm mt-3 leading-relaxed">
              在谐振频率处，电感感抗
              <span className="text-primary-light font-mono">XL = ωL</span>
              与电容容抗
              <span className="text-primary-light font-mono">XC = 1/(ωC)</span>
              相互抵消，电路总阻抗由等效串联电阻（ESR）决定。
            </p>
          </div>
        </SectionCard>

        {/* Section 2: Series vs Parallel Resonance */}
        <SectionCard index={2} header={<SectionTitle
            icon={GitCompare}
            title="串联与并联谐振"
            subtitle="两种谐振结构的阻抗特性与适用场景对比"
          />}>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-3 px-4 text-text-primary font-semibold">特性</th>
                  <th className="py-3 px-4 text-primary-light font-semibold">串联谐振</th>
                  <th className="py-3 px-4 text-accent font-semibold">并联谐振</th>
                </tr>
              </thead>
              <tbody className="text-text-secondary">
                <tr className="border-b border-border/50">
                  <td className="py-3 px-4 font-medium text-text-primary">谐振时阻抗</td>
                  <td className="py-3 px-4">最小（Z ≈ R）</td>
                  <td className="py-3 px-4">最大（Z → ∞）</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3 px-4 font-medium text-text-primary">电流特性</td>
                  <td className="py-3 px-4">电流最大</td>
                  <td className="py-3 px-4">电流最小</td>
                </tr>
                  <tr className="border-b border-border/50">
                  <td className="py-3 px-4 font-medium text-text-primary">电压特性</td>
                  <td className="py-3 px-4">L、C 两端电压放大 Q 倍</td>
                  <td className="py-3 px-4">回路电压最大，支路电流放大 Q 倍</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3 px-4 font-medium text-text-primary">典型应用</td>
                  <td className="py-3 px-4">LLC 变换器谐振腔</td>
                  <td className="py-3 px-4">无线电能传输</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-text-primary">空载特性</td>
                  <td className="py-3 px-4">Q 降低，阻抗升高</td>
                  <td className="py-3 px-4">Q 升高，选择性增强</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-bg/50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-text-primary mb-3">
                品质因数 Q
              </h4>
              <p className="text-text-secondary text-sm mb-3">
                Q 因子反映谐振电路的储能与耗能之比，决定谐振峰值的尖锐程度与带宽。对于 LLC 谐振变换器，Q 定义为：
              </p>
              <MathBlock
                latex="Q = \\frac{Z_r}{R_{ac}} = \\frac{\\sqrt{L_r/C_r}}{R_{ac}}"
                important
              />
              <p className="text-text-secondary text-sm mt-2">
                在串联谐振电路中，Q 也可写作
                <InlineMath latex="Q = \\frac{\\omega_r L}{R} = \\frac{1}{\\omega_r C R}" />
                。Q 越高，谐振曲线越尖锐，带宽越窄，选择性越好。
              </p>
            </div>
            <div className="bg-bg/50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-text-primary mb-3">
                带宽 BW
              </h4>
              <p className="text-text-secondary text-sm mb-3">
                带宽定义为增益下降至最大值的
                <span className="text-accent">1/√2 (-3dB)</span>
                时的频率范围：
              </p>
              <MathBlock
                latex="BW = \\frac{f_r}{Q} = f_2 - f_1"
                important
              />
              <p className="text-text-secondary text-sm mt-2">
                高 Q 电路具有窄带宽，适合精确的频率选择；低 Q 电路带宽较宽，适合宽范围调压。
              </p>
            </div>
          </div>
        </SectionCard>

        {/* Section 3: LLC Resonant Tank */}
        <SectionCard index={3} header={<SectionTitle
            icon={Layers}
            title="LLC 谐振腔"
            subtitle="Lr、Cr、Lm 三元件谐振腔结构与等效电路模型"
          />}>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="bg-bg/50 rounded-lg p-4">
              <img
                src="llc_noarrow_v2_dark.png"
                alt="LLC 谐振腔等效电路"
                className="w-full max-w-xl mx-auto h-auto rounded-lg"
              />
            </div>
            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-md bg-primary-dark/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary-light font-mono text-sm font-bold">
                    Lr
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-text-primary">
                    谐振电感 Resonant Inductor
                  </h4>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    与谐振电容 Cr 共同决定第一谐振频率 fr1。Lr 可以是独立的电感，也可以是变压器漏感。Lr 的大小直接影响变换器的 Q 值与电流应力。
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-md bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-accent font-mono text-sm font-bold">
                    Cr
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-text-primary">
                    谐振电容 Resonant Capacitor
                  </h4>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    与 Lr 构成串联谐振回路。Cr 在谐振时承受较大的交流电压，选型时需关注耐压与纹波电流能力。Cr 通常选用 C0G/NP0 或薄膜电容。
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-md bg-success/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-success font-mono text-sm font-bold">
                    Lm
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-text-primary">
                    励磁电感 Magnetizing Inductance
                  </h4>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    并联在谐振回路与变压器之间，不参与第一谐振频率 fr1，但影响第二谐振频率 fr2。LLC 存在两个谐振频率：fr1（Lr 与 Cr）和 fr2（Lr+Lm 与 Cr），其中 fr2 = fr1 / √(1+k)。Lm 决定空载增益与 ZVS 范围，k = Lm/Lr 是关键设计参数。
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-primary-dark/20 rounded-lg border border-primary/20">
            <h4 className="text-sm font-semibold text-primary-light mb-2">
              为什么 LLC 而不是 LC？
            </h4>
            <p className="text-text-secondary text-sm leading-relaxed">
              纯 LC 串联谐振变换器在空载时增益理论上趋于无穷大，无法实现电压调节。引入并联励磁电感 Lm 后，LLC 拓扑在空载时形成分压结构，增益被钳位在有限范围内，从而实现宽负载范围的稳定电压输出。此外，LLC 的感性区运行特性使得原边开关管在较宽负载范围内都能实现零电压开关（ZVS）。
            </p>
          </div>

          <div className="mt-6 p-4 bg-accent/10 rounded-lg border border-accent/20">
            <h4 className="text-sm font-semibold text-accent mb-2">
              LLC 与 SRC、PRC 的对比
            </h4>
            <p className="text-text-secondary text-sm leading-relaxed mb-3">
              LLC 谐振变换器结合了串联谐振变换器 SRC（Series Resonant Converter）和并联谐振变换器 PRC（Parallel Resonant Converter）的优点：
            </p>
            <ul className="text-sm text-text-secondary space-y-2 list-disc list-inside">
              <li>
                <strong className="text-text-primary">SRC</strong>：谐振腔环流小、效率高，但空载时无法调压，轻载频率漂移大。
              </li>
              <li>
                <strong className="text-text-primary">PRC</strong>：宽负载范围可稳定调压，但谐振腔环流大、轻载效率低。
              </li>
              <li>
                <strong className="text-text-primary">LLC</strong>：通过引入励磁电感 Lm，在重载时近似于 SRC（低环流、高效率），在轻载/空载时利用 Lm 的分流作用实现宽范围调压（类似 PRC 的优点），同时保持原边 ZVS 能力。
              </li>
            </ul>
            <p className="text-text-secondary text-sm mt-3 leading-relaxed">
              从直流特性来看，LLC 谐振的增益曲线有两个谐振点：Lr、Cr 谐振是高频谐振点（fr1），Cr 与 Lm 和 Lr 串联的谐振是低频谐振点（fr2）。高频谐振点位于 ZVS 工作区，是 LLC 设计的核心工作点。
            </p>
          </div>

          <div className="mt-6 p-4 bg-bg/50 rounded-lg border border-border">
            <h4 className="text-sm font-semibold text-text-primary mb-2">
              FHA 归一化增益
            </h4>
            <p className="text-text-secondary text-sm leading-relaxed mb-3">
              在基波近似（FHA）方法中，归一化增益定义为谐振频率处输出与输入电压之比。谐振频率处归一化增益 M = 1，高于谐振频率时 M &lt; 1，低于谐振频率时 M &gt; 1：
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MathBlock
                latex="M = \\frac{n \\cdot V_{out}}{V_{in}} \\quad (全桥)"
              />
              <MathBlock
                latex="M = \\frac{2n \\cdot V_{out}}{V_{in}} \\quad (半桥)"
              />
            </div>
            <p className="text-text-secondary text-sm mt-3 leading-relaxed">
              在谐振频率 fr1 处，无论负载如何，归一化增益恒为 1。设计时通过在最低输入电压处计算所需增益，确保峰值增益裕量充足。
            </p>
          </div>
        </SectionCard>

        {/* Section 4: Key Parameters */}
        <SectionCard index={4} header={<SectionTitle
            icon={Settings2}
            title="关键参数定义"
            subtitle="LLC 谐振变换器设计的核心参数与符号约定"
          />}>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-3 px-4 text-text-primary font-semibold">参数</th>
                  <th className="py-3 px-4 text-text-primary font-semibold">符号</th>
                  <th className="py-3 px-4 text-text-primary font-semibold">定义 / 公式</th>
                  <th className="py-3 px-4 text-text-primary font-semibold">物理意义</th>
                </tr>
              </thead>
              <tbody className="text-text-secondary">
                <tr className="border-b border-border/50">
                  <td className="py-3 px-4 font-medium text-text-primary">第一谐振频率</td>
                  <td className="py-3 px-4 font-mono text-primary-light">fr1</td>
                  <td className="py-3 px-4">
                    <code className="text-xs bg-bg px-2 py-1 rounded">
                      <InlineMath latex="f_{r1} = \\frac{1}{2\\pi\\sqrt{L_r C_r}}" />
                    </code>
                  </td>
                  <td className="py-3 px-4">Lr 与 Cr 的串联谐振频率</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3 px-4 font-medium text-text-primary">第二谐振频率</td>
                  <td className="py-3 px-4 font-mono text-primary-light">fr2</td>
                  <td className="py-3 px-4">
                    <code className="text-xs bg-bg px-2 py-1 rounded">
                      <InlineMath latex="f_{r2} = \\frac{1}{2\\pi\\sqrt{(L_r+L_m)C_r}}" />
                    </code>
                    <br />
                    <code className="text-xs bg-bg px-2 py-1 rounded mt-1 inline-block">
                      <InlineMath latex="f_{r2} = \\frac{f_{r1}}{\\sqrt{1+k}}" />
                    </code>
                  </td>
                  <td className="py-3 px-4">总电感与 Cr 的谐振频率</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3 px-4 font-medium text-text-primary">特征阻抗</td>
                  <td className="py-3 px-4 font-mono text-primary-light">Zr</td>
                  <td className="py-3 px-4">
                    <code className="text-xs bg-bg px-2 py-1 rounded">
                      <InlineMath latex="Z_r = \\sqrt{\\frac{L_r}{C_r}}" />
                    </code>
                  </td>
                  <td className="py-3 px-4">谐振腔的特征阻抗值</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3 px-4 font-medium text-text-primary">品质因数</td>
                  <td className="py-3 px-4 font-mono text-primary-light">Q</td>
                  <td className="py-3 px-4">
                    <code className="text-xs bg-bg px-2 py-1 rounded">
                      <InlineMath latex="Q = \\frac{Z_r}{R_{ac}} = \\frac{\\sqrt{L_r/C_r}}{R_{ac}}" />
                    </code>
                  </td>
                  <td className="py-3 px-4">反映负载与谐振腔的匹配程度</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3 px-4 font-medium text-text-primary">电感比</td>
                  <td className="py-3 px-4 font-mono text-primary-light">k</td>
                  <td className="py-3 px-4">
                    <code className="text-xs bg-bg px-2 py-1 rounded"><InlineMath latex="k = \\frac{L_m}{L_r}" /></code>
                  </td>
                  <td className="py-3 px-4">决定增益曲线的峰值与 ZVS 范围</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3 px-4 font-medium text-text-primary">归一化频率</td>
                  <td className="py-3 px-4 font-mono text-primary-light">fn</td>
                  <td className="py-3 px-4">
                    <code className="text-xs bg-bg px-2 py-1 rounded"><InlineMath latex="f_n = \\frac{f_{sw}}{f_{r1}}" /></code>
                  </td>
                  <td className="py-3 px-4">开关频率相对于谐振频率的比值</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-text-primary">电压增益</td>
                  <td className="py-3 px-4 font-mono text-primary-light">M</td>
                  <td className="py-3 px-4">
                    <code className="text-xs bg-bg px-2 py-1 rounded">
                      n·Vout / Vin (全桥)
                    </code>
                    <br />
                    <code className="text-xs bg-bg px-2 py-1 rounded mt-1 inline-block">
                      2n·Vout / Vin (半桥)
                    </code>
                  </td>
                  <td className="py-3 px-4">反映变换器的电压变换能力</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <MathBlock
              latex="f_{r1} = \\frac{1}{2\\pi\\sqrt{L_r C_r}}"
              important
            />
            <MathBlock
              latex="f_{r2} = \\frac{1}{2\\pi\\sqrt{(L_r + L_m) C_r}} = \\frac{f_{r1}}{\\sqrt{1 + k}}"
              important
            />
            <MathBlock
              latex="Z_r = \\sqrt{\\frac{L_r}{C_r}}"
            />
            <MathBlock
              latex="Q = \\frac{Z_r}{R_{ac}}"
            />
            <MathBlock
              latex="k = \\frac{L_m}{L_r}"
              important
            />
            <MathBlock
              latex="f_n = \\frac{f_{sw}}{f_{r1}}"
            />
          </div>
        </SectionCard>

        {/* Section 5: Topology Variants */}
        <SectionCard index={5} header={<SectionTitle
            icon={Table}
            title="拓扑变体"
            subtitle="半桥与全桥 LLC 拓扑的结构对比与适用功率等级"
          />}>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-bg/50 rounded-lg p-4">
              <img
                src="hb_ref_dark.png"
                alt="半桥 LLC 拓扑"
                className="w-full h-auto rounded-lg"
              />
            </div>
            <div className="bg-bg/50 rounded-lg p-4">
              <img
                src="fb_ref_dark.png"
                alt="全桥 LLC 拓扑"
                className="w-full h-auto rounded-lg"
              />
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-3 px-4 text-text-primary font-semibold">对比项</th>
                  <th className="py-3 px-4 text-primary-light font-semibold">半桥 Half-Bridge</th>
                  <th className="py-3 px-4 text-accent font-semibold">全桥 Full-Bridge</th>
                </tr>
              </thead>
              <tbody className="text-text-secondary">
                <tr className="border-b border-border/50">
                  <td className="py-3 px-4 font-medium text-text-primary">开关数量</td>
                  <td className="py-3 px-4">2 只 MOSFET</td>
                  <td className="py-3 px-4">4 只 MOSFET</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3 px-4 font-medium text-text-primary">谐振腔电压</td>
                  <td className="py-3 px-4">Vin / 2</td>
                  <td className="py-3 px-4">Vin</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3 px-4 font-medium text-text-primary">适用功率</td>
                  <td className="py-3 px-4">中低功率（典型 100W ~ 3kW）</td>
                  <td className="py-3 px-4">中大功率（典型 &gt; 3kW，或超高输入电压应用）</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3 px-4 font-medium text-text-primary">器件应力</td>
                  <td className="py-3 px-4">Vds = Vin</td>
                  <td className="py-3 px-4">Vds = Vin</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3 px-4 font-medium text-text-primary">导通损耗</td>
                  <td className="py-3 px-4">较高（2 管导通，单管电流为全桥的 2 倍）</td>
                  <td className="py-3 px-4">较低（4 管导通，单管电流减半，总损耗约为半桥的 1/2）</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3 px-4 font-medium text-text-primary">整流拓扑灵活性</td>
                  <td className="py-3 px-4">可配中心抽头或全桥整流</td>
                  <td className="py-3 px-4">通常配全桥整流（中心抽头较少用）</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3 px-4 font-medium text-text-primary">同步整流适用性</td>
                  <td className="py-3 px-4">适用（MOSFET 替代二极管）</td>
                  <td className="py-3 px-4">适用（MOSFET 替代二极管）</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-text-primary">成本 / 复杂度</td>
                  <td className="py-3 px-4">成本低，驱动简单</td>
                  <td className="py-3 px-4">成本高，需 4 路驱动</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-4 bg-bg/50 rounded-lg border border-border">
            <h4 className="text-sm font-semibold text-text-primary mb-3">
              整流方式说明
            </h4>
            <div className="flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-2 bg-primary-dark/20 rounded-md text-sm text-text-secondary">
                <Triangle className="w-4 h-4 text-primary-light" />
                <span>中心抽头整流：可配合半桥或全桥，低压大电流输出更常用</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-2 bg-primary-dark/20 rounded-md text-sm text-text-secondary">
                <Square className="w-4 h-4 text-accent" />
                <span>全桥整流：通常配合全桥拓扑，适用于高压小电流输出</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-2 bg-primary-dark/20 rounded-md text-sm text-text-secondary">
                <Zap className="w-4 h-4 text-success" />
                <span>同步整流：MOSFET 替代二极管，可应用于任何整流方式</span>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
