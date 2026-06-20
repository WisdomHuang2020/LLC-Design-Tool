import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown,
  Lightbulb,
  BookOpen,
  Zap,
  Sigma,
  TrendingUp,
  Activity,
  Gauge,
  Layers,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react'
import MathBlock from '../components/MathBlock'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
}

type HighlightType = 'info' | 'warning' | 'success'

function HighlightBox({
  children,
  type = 'info',
}: {
  children: React.ReactNode
  type?: HighlightType
}) {
  const style: Record<
    HighlightType,
    { border: string; bg: string; icon: React.ReactNode }
  > = {
    info: {
      border: 'border-primary-light',
      bg: 'bg-primary-dark/20',
      icon: <Lightbulb className="w-5 h-5 text-primary-light" />,
    },
    warning: {
      border: 'border-accent',
      bg: 'bg-accent/10',
      icon: <AlertTriangle className="w-5 h-5 text-accent" />,
    },
    success: {
      border: 'border-success',
      bg: 'bg-success/10',
      icon: <CheckCircle2 className="w-5 h-5 text-success" />,
    },
  }

  const s = style[type]
  return (
    <div className={`my-4 p-4 rounded-lg border-l-4 ${s.border} ${s.bg} border border-border`}>
      <div className="flex items-start gap-3">
        {s.icon}
        <div className="text-text-secondary text-sm leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  )
}

interface DerivationSectionProps {
  id: string
  number: number
  title: string
  icon: React.ReactNode
  defaultOpen?: boolean
  children: React.ReactNode
}

function DerivationSection({
  id,
  number,
  title,
  icon,
  defaultOpen = false,
  children,
}: DerivationSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <motion.div
      id={id}
      variants={itemVariants}
      className="card-surface mb-6 overflow-hidden"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-surface-elevated/50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="text-primary-light">{icon}</div>
          <div>
            <span className="text-sm font-medium text-primary-light uppercase tracking-wider">
              Section {number}
            </span>
            <h2 className="text-xl font-semibold text-text-primary">{title}</h2>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-6 h-6 text-text-secondary" />
        </motion.div>
      </button>

      {isOpen && (
        <AnimatePresence>
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' as const }}
          >
            <div className="px-6 pb-6 pt-2">
              {children}
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </motion.div>
  )
}

export default function Derivations() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12"
      >
        <div className="flex items-center gap-3 mb-4">
          <Sigma className="w-8 h-8 text-primary-light" />
          <h1 className="text-4xl font-bold text-gradient">公式推导</h1>
        </div>
        <p className="text-text-secondary text-lg max-w-3xl">
          LLC 谐振变换器核心公式的完整数学推导。从谐振腔分析到功率器件损耗，涵盖稳态增益、FHA 等效电路、应力计算、损耗模型及设计公式，为工程设计和理论学习提供严谨的数学基础。
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
      >
        {/* Section 1: 基本拓扑与工作原理 */}
        <DerivationSection
          id="topology"
          number={1}
          title="基本拓扑与工作原理"
          icon={<BookOpen className="w-5 h-5" />}
          defaultOpen={true}
        >
          <p className="text-text-secondary mt-4 mb-2">
            LLC 谐振变换器由三部分构成：方波产生电路（开关网络）、谐振网络（L_r、C_r、L_m）以及整流及输出滤波电路。
          </p>

          <p className="text-text-secondary mt-4 mb-2">
            谐振腔包含三个核心元件：谐振电感 L_r、谐振电容 C_r 和励磁电感 L_m。由于引入 L_m，网络具有两个固有的特征谐振频率：
          </p>

          <MathBlock
            latex="\\omega_r = \\frac{1}{\\sqrt{L_r C_r}} \\quad \\Rightarrow \\quad f_r = \\frac{1}{2\\pi\\sqrt{L_r C_r}}"
            stepNumber={1}
            label="第一谐振频率（串联谐振）"
          />

          <p className="text-text-secondary mt-2 mb-2">
            当副边整流管导通时，L_m 被输出电压钳位，仅 L_r 和 C_r 参与谐振。
          </p>

          <MathBlock
            latex="\\omega_m = \\frac{1}{\\sqrt{(L_r + L_m) C_r}} \\quad \\Rightarrow \\quad f_m = \\frac{1}{2\\pi\\sqrt{(L_r + L_m) C_r}}"
            stepNumber={2}
            label="第二谐振频率（串并联谐振）"
          />

          <p className="text-text-secondary mt-2 mb-2">
            当副边整流管关断，L_m 解除钳位，与 L_r、C_r 共同谐振。
          </p>

          <MathBlock
            latex="\\begin{aligned} f_m &= \\frac{1}{2\\pi\\sqrt{(L_r + L_m) C_r}} \\\\ &= \\frac{1}{2\\pi\\sqrt{L_r C_r \\cdot \\left(1 + \\frac{L_m}{L_r}\\right)}} \\\\ &= \\frac{f_r}{\\sqrt{1 + k}} \\end{aligned}"
            multiline
            stepNumber={3}
            label="两个谐振频率的关系"
          />

          <HighlightBox type="info">
            <strong>电感比 k：</strong>
            k = L_m / L_r 决定了两个谐振频率的间距。典型取值范围为 3 ~ 10，其中 5 ~ 7 较为常见。
          </HighlightBox>

          <p className="text-text-secondary mt-4 mb-2">
            LLC 采用脉冲频率调制（PFM）进行控制。通过固定占空比（约 50%），调节开关频率 f_s 来改变谐振网络的阻抗，从而调节分压比，稳定输出电压。
          </p>

          <div className="mt-6">
            <p className="text-text-muted text-sm mb-2 font-medium">核心参数</p>
            <MathBlock
              latex="k = \\frac{L_m}{L_r}, \\quad f_r = \\frac{1}{2\\pi\\sqrt{L_r C_r}}, \\quad f_m = \\frac{f_r}{\\sqrt{1 + k}}"
              important
            />
          </div>
        </DerivationSection>

        {/* Section 2: 稳态增益与FHA推导 */}
        <DerivationSection
          id="fha-gain"
          number={2}
          title="稳态增益与 FHA 推导"
          icon={<TrendingUp className="w-5 h-5" />}
          defaultOpen={true}
        >
          <p className="text-text-secondary mt-4 mb-2">
            基波近似法（FHA）假设只有基波分量参与能量传递，将系统简化为线性正弦交流电路。首先对开关网络输出的方波电压进行傅里叶展开，仅取基波分量：
          </p>

          <MathBlock
            latex="V_{ab,1} = \\frac{2\\sqrt{2}}{\\pi} V_{in} \\quad \\text{(半桥有效值)}"
            stepNumber={1}
            label="半桥基波电压有效值"
          />
          <MathBlock
            latex="V_{ab,1} = \\frac{4\\sqrt{2}}{\\pi} V_{in} \\quad \\text{(全桥有效值)}"
            stepNumber={2}
            label="全桥基波电压有效值"
          />

          <p className="text-text-secondary mt-4 mb-2">
            {'将直流负载通过整流网络和变压器折算到原边，成为与励磁电感 L_m 并联的等效交流电阻 R_{ac}：'}
          </p>

          <MathBlock
            latex="\\begin{aligned} R_{ac} &= \\frac{8n^2}{\\pi^2} \\cdot R_L \\\\ &= \\frac{8n^2}{\\pi^2} \\cdot \\frac{V_o^2}{P_o} \\end{aligned}"
            multiline
            stepNumber={3}
            label="等效交流负载电阻"
          />

          <p className="text-text-secondary mt-4 mb-2">
            其中 n 为变压器原边对副边的匝比，R_L = V_o^2 / P_o 为直流负载电阻。
          </p>

          <HighlightBox type="warning">
            <strong>推导关键：</strong>
            {'副边基波电压有效值 V_{sec,1} = (2√2/π) · nV_o，基波电流有效值 I_{sec,1} = (π/2√2) · (I_o/n)。折算到原边后得到 R_{ac} = V_{sec,1} / (I_{sec,1}/n^2) = 8n^2 R_L / π^2。'}
          </HighlightBox>

          <p className="text-text-secondary mt-4 mb-2">
            {'完整的 FHA 等效电路由正弦电压源、线性电抗元件及电阻构成。串联支路阻抗 Z_1 = jωL_r + 1/(jωC_r)，并联支路 Z_2 = (jωL_m) // R_{ac}。应用分压定律得到电压增益：'}
          </p>

          <MathBlock
            latex="M = \\left| \\frac{Z_2}{Z_1 + Z_2} \\right|"
            stepNumber={4}
            label="电压增益定义"
          />

          <p className="text-text-secondary mt-4 mb-2">
            {'定义三个无量纲参数：归一化频率 f_n = f_s / f_r，电感比 k = L_m / L_r，品质因数 Q = √(L_r/C_r) / R_{ac}。代入化简后得到标准增益公式：'}
          </p>

          <MathBlock
            latex="\\begin{aligned} M(f_n, k, Q) &= \\frac{1}{\\sqrt{\\left(1 + \\frac{1}{k} - \\frac{1}{k f_n^2}\\right)^2 + \\left[Q\\left(f_n - \\frac{1}{f_n}\\right)\\right]^2}} \\\\ &= \\frac{f_n^2 k}{\\sqrt{\\left[f_n^2(k+1) - 1\\right]^2 + k^2 Q^2 (f_n^2 - 1)^2}} \\end{aligned}"
            multiline
            stepNumber={5}
            label="标准 LLC 增益方程"
          />

          <p className="text-text-secondary mt-4 mb-2">
            负载独立点：当 f_n = 1 时，电压增益恒为 1，与负载大小无关。这是 LLC 拓扑最突出的优点之一。
          </p>

          <MathBlock
            latex="M(1, k, Q) = 1 \\quad \\text{（与 } Q \\text{ 无关）}"
            stepNumber={6}
            label="负载独立点"
          />

          <p className="text-text-secondary mt-4 mb-2">
            {'空载增益：当 Q = 0（R_{ac} → ∞）时，增益公式简化为：'}
          </p>

          <MathBlock
            latex="M_{empty}(f_n, k) = \\frac{1}{\\left|1 - \\frac{1}{f_n^2(1 + k)}\\right|}"
            stepNumber={7}
            label="空载增益"
          />

          <div className="mt-6">
            <p className="text-text-muted text-sm mb-2 font-medium">最终公式</p>
            <MathBlock
              latex="M = \\frac{1}{\\sqrt{\\left(1 + \\frac{1}{k} - \\frac{1}{k f_n^2}\\right)^2 + \\left[Q\\left(f_n - \\frac{1}{f_n}\\right)\\right]^2}}"
              important
            />
          </div>
        </DerivationSection>

        {/* Section 3: 谐振频率与特征参数 */}
        <DerivationSection
          id="frequencies"
          number={3}
          title="谐振频率与特征参数"
          icon={<Activity className="w-5 h-5" />}
        >
          <p className="text-text-secondary mt-4 mb-2">
            LLC 谐振腔存在两个特征谐振频率，由不同的元件组合决定：
          </p>

          <MathBlock
            latex="f_r = \\frac{1}{2\\pi\\sqrt{L_r C_r}}"
            stepNumber={1}
            label="第一谐振频率（串联）"
          />

          <MathBlock
            latex="f_m = \\frac{1}{2\\pi\\sqrt{(L_r + L_m) C_r}} = \\frac{f_r}{\\sqrt{1 + k}}"
            stepNumber={2}
            label="第二谐振频率（串并联）"
          />

          <p className="text-text-secondary mt-4 mb-2">
            特征阻抗 Z_0 与品质因数 Q 是联系谐振腔参数与负载的关键变量：
          </p>

          <MathBlock
            latex="Z_0 = \\sqrt{\\frac{L_r}{C_r}} = \\omega_r L_r = \\frac{1}{\\omega_r C_r}"
            stepNumber={3}
            label="特征阻抗"
          />

          <MathBlock
            latex="Q = \\frac{Z_0}{R_{ac}} = \\frac{\\sqrt{L_r / C_r}}{R_{ac}}"
            stepNumber={4}
            label="品质因数"
          />

          <HighlightBox type="info">
            <strong>物理意义：</strong>
            {'Q 值反映负载情况，负载越重（R_{ac} 越小），Q 值越大。高 Q 时增益曲线陡峭，低 Q 时曲线平坦。'}
          </HighlightBox>

          <div className="mt-6">
            <p className="text-text-muted text-sm mb-2 font-medium">最终公式</p>
            <MathBlock
              latex="f_r = \\frac{1}{2\\pi\\sqrt{L_r C_r}}, \\quad f_m = \\frac{f_r}{\\sqrt{1 + k}}, \\quad Z_0 = \\sqrt{\\frac{L_r}{C_r}}, \\quad Q = \\frac{Z_0}{R_{ac}}"
              important
            />
          </div>
        </DerivationSection>

        {/* Section 4: 峰值增益与边界条件 */}
        <DerivationSection
          id="peak-gain"
          number={4}
          title="峰值增益与边界条件"
          icon={<TrendingUp className="w-5 h-5" />}
        >
          <p className="text-text-secondary mt-4 mb-2">
            峰值增益决定了变换器能否在最低输入电压下维持输出电压。令 x = f_n^2，对增益平方求导：
          </p>

          <MathBlock
            latex="M^2 = \\frac{x^2 k^2}{\\left[x(k+1) - 1\\right]^2 + x k^2 Q^2 (x-1)^2}"
            stepNumber={1}
            label="增益平方表达式"
          />

          <p className="text-text-secondary mt-4 mb-2">
            对 x 求导并令 d(M²)/dx = 0，等价于求解 2D(x) - x · D'(x) = 0，其中 D(x) = [x(k+1) - 1]² + x k² Q² (x-1)²。该方程通常采用数值方法求解。
          </p>

          <HighlightBox type="warning">
            <strong>工程简化：</strong>
            {'空载（Q = 0）时，峰值增益趋向无穷大，出现在 f_n = 1/√(1+k) 处。实际设计中，峰值增益必须大于最大增益需求 M_max = V_{in,nom} / V_{in,min}。'}
          </HighlightBox>

          <p className="text-text-secondary mt-4 mb-2">
            变频调压原理：通过调节开关频率改变增益，输入电压升高时提高频率（f_n &gt; 1）以降低增益；输入电压降低时降低频率（f_n &lt; 1）以提高增益。
          </p>

          <div className="mt-6">
            <p className="text-text-muted text-sm mb-2 font-medium">边界条件</p>
            <MathBlock
              latex="\\frac{dM}{df_n} = 0 \\quad \\text{at} \\quad f_n = f_{n,peak}"
              important
            />
          </div>
        </DerivationSection>

        {/* Section 5: 输入阻抗与ZVS条件 */}
        <DerivationSection
          id="impedance"
          number={5}
          title="输入阻抗与 ZVS 条件"
          icon={<Gauge className="w-5 h-5" />}
        >
          <p className="text-text-secondary mt-4 mb-2">
            输入阻抗决定了变换器从电源侧看进去的等效负载特性：
          </p>

          <MathBlock
            latex="Z_{in} = j\\omega_s L_r + \\frac{1}{j\\omega_s C_r} + \\left(j\\omega_s L_m \\parallel R_{ac}\\right)"
            stepNumber={1}
            label="输入阻抗定义"
          />

          <p className="text-text-secondary mt-4 mb-2">
            代入归一化参数化简，将实部和虚部分离：
          </p>

          <MathBlock
            latex="\\begin{aligned} \\text{Re}(Z_{in}) &= Z_0 \\cdot \\frac{f_n^2 k^2 Q}{Q^2 + f_n^2 k^2} \\\\ \\text{Im}(Z_{in}) &= Z_0 \\left( f_n - \\frac{1}{f_n} + \\frac{f_n k Q^2}{Q^2 + f_n^2 k^2} \\right) \\end{aligned}"
            multiline
            stepNumber={2}
            label="实部与虚部"
          />

          <HighlightBox type="info">
            <strong>ZVS 条件：</strong>
            {'为实现主开关管的零电压开通，谐振槽必须在开关频率处呈现感性（Im(Z_{in}) > 0）。这意味着开关频率必须高于感性边界频率。'}
          </HighlightBox>

          <p className="text-text-secondary mt-4 mb-2">
            感性/容性边界条件：
          </p>

          <MathBlock
            latex="\\text{Im}(Z_{in}) = 0 \\quad \\Rightarrow \\quad f_n - \\frac{1}{f_n} + \\frac{f_n k Q^2}{Q^2 + f_n^2 k^2} = 0"
            stepNumber={3}
            label="边界条件"
          />

          <p className="text-text-secondary mt-4 mb-2">
            ZVS 能量准则：在参数初步确定后，应复核关断时刻谐振腔存储的磁能是否大于寄生电容充放电所需的电能。
          </p>

          <MathBlock
            latex="\\frac{1}{2} L_m I_{m,off}^2 \\geq \\frac{1}{2} C_{oss} V_{in}^2"
            stepNumber={4}
            label="ZVS 能量准则"
          />

          <div className="mt-6">
            <p className="text-text-muted text-sm mb-2 font-medium">最终公式</p>
            <MathBlock
              latex="Z_{in} = jZ_0\\left(f_n - \\frac{1}{f_n}\\right) + \\frac{j f_n Z_0 k}{1 + j f_n k Q}"
              important
            />
          </div>
        </DerivationSection>

        {/* Section 6: 功率器件应力计算 */}
        <DerivationSection
          id="stress"
          number={6}
          title="功率器件应力计算"
          icon={<Zap className="w-5 h-5" />}
        >
          <p className="text-text-secondary mt-4 mb-2">
            准确的功率器件应力计算是确保变换器可靠性的关键。
          </p>

          <p className="text-text-secondary mt-4 mb-2 font-medium">
            1. 原边 MOSFET 应力
          </p>

          <MathBlock
            latex="V_{ds,max} = V_{in}"
            stepNumber={1}
            label="MOSFET 电压应力（半桥/全桥）"
          />

          <p className="text-text-secondary mt-2 mb-2">
            MOSFET 峰值电流（以半桥为例，f_s &lt; f_r 时）：
          </p>

          <MathBlock
            latex="I_{pk} = \\frac{2n(V_o + V_f)}{\\pi Z_0 Q} + \\frac{n(V_o + V_f)}{2 f_s L_m}"
            stepNumber={2}
            label="MOSFET 峰值电流"
          />

          <MathBlock
            latex="I_{rms} = \\frac{I_{pk}}{\\sqrt{2}}"
            stepNumber={3}
            label="MOSFET 有效值电流"
          />

          <p className="text-text-secondary mt-4 mb-2 font-medium">
            2. 副边整流二极管应力
          </p>

          <MathBlock
            latex="V_{RRM} = 2V_o"
            stepNumber={4}
            label="二极管反向电压应力"
          />

          <MathBlock
            latex="I_{avg} = \\frac{I_o}{2}"
            stepNumber={5}
            label="二极管平均电流"
          />

          <p className="text-text-secondary mt-4 mb-2 font-medium">
            3. 谐振电容与磁性元件电流应力
          </p>

          <MathBlock
            latex="I_{C_r,rms} = I_{r,rms}"
            stepNumber={6}
            label="谐振电容电流"
          />

          <MathBlock
            latex="I_{p,rms} = \\sqrt{I_{r,rms}^2 + I_{m,rms}^2}"
            stepNumber={7}
            label="变压器原边电流有效值"
          />

          <HighlightBox type="warning">
            <strong>选型裕量：</strong>
            MOSFET 电压额定值需留 1.5~2 倍裕量；电流定额需在计算峰值/有效值基础上预留约 40% 裕量，以应对瞬态冲击与温升。
          </HighlightBox>
        </DerivationSection>

        {/* Section 7: 功率器件损耗模型 */}
        <DerivationSection
          id="loss"
          number={7}
          title="功率器件损耗模型"
          icon={<Activity className="w-5 h-5" />}
        >
          <p className="text-text-secondary mt-4 mb-2">
            LLC 的高效率源于软开关工作，但功率器件损耗仍是影响整体效率的关键。
          </p>

          <p className="text-text-secondary mt-4 mb-2 font-medium">
            1. MOSFET 损耗
          </p>

          <MathBlock
            latex="P_{cond} = I_{rms}^2 \\cdot R_{ds(on)}"
            stepNumber={1}
            label="导通损耗"
          />

          <MathBlock
            latex="P_{diode} = V_f \\cdot I_{avg,diode}"
            stepNumber={2}
            label="体二极管损耗（简化）"
          />

          <MathBlock
            latex="P_{off} = \\frac{1}{2} V_{in} \\cdot I_{m,pk} \\cdot (t_r + t_f) \\cdot f_s"
            stepNumber={3}
            label="关断损耗"
          />

          <MathBlock
            latex="P_{drv} = Q_g \\cdot V_{drv} \\cdot f_s"
            stepNumber={4}
            label="驱动损耗"
          />

          <MathBlock
            latex="P_{total,MOS} = P_{cond} + P_{diode} + P_{off} + P_{drv}"
            stepNumber={5}
            label="MOSFET 总损耗"
          />

          <p className="text-text-secondary mt-4 mb-2 font-medium">
            2. 整流二极管损耗
          </p>

          <MathBlock
            latex="P_{cond,D} = V_f \\cdot I_o"
            stepNumber={6}
            label="二极管导通损耗（简化）"
          />

          <MathBlock
            latex="P_{rr} = \\frac{1}{2} Q_{rr} \\cdot V_{RRM} \\cdot f_s"
            stepNumber={7}
            label="反向恢复损耗（仅 f_s &lt; f_r 时）"
          />

          <p className="text-text-secondary mt-4 mb-2 font-medium">
            3. 磁性元件损耗
          </p>

          <MathBlock
            latex="P_{Cu} = I_p^2 \\cdot R_{ac,pri} + I_s^2 \\cdot R_{ac,sec}"
            stepNumber={8}
            label="变压器铜损"
          />

          <MathBlock
            latex="P_{core} = C_m \\cdot f^\\alpha \\cdot B^\\beta \\cdot V_e"
            stepNumber={9}
            label="磁芯损耗（Steinmetz 公式）"
          />

          <MathBlock
            latex="B = \\frac{V_p}{4 N_p A_e f_s}"
            stepNumber={10}
            label="工作磁密（方波激励）"
          />
        </DerivationSection>

        {/* Section 8: 谐振腔与变压器设计 */}
        <DerivationSection
          id="design"
          number={8}
          title="谐振腔与变压器设计"
          icon={<Layers className="w-5 h-5" />}
        >
          <p className="text-text-secondary mt-4 mb-2">
            基于 FHA 模型的系统化设计流程，核心目标是在满足电压增益范围与全负载范围 ZVS 的前提下，解算谐振参数。
          </p>

          <p className="text-text-secondary mt-4 mb-2 font-medium">
            1. 变压器匝比 n
          </p>

          <MathBlock
            latex="n = \\frac{V_{in,nom}}{2(V_o + V_f)} \\quad \\text{（半桥）}"
            stepNumber={1}
            label="匝比（半桥）"
          />

          <MathBlock
            latex="n = \\frac{V_{in,nom}}{V_o + V_f} \\quad \\text{（全桥）}"
            stepNumber={2}
            label="匝比（全桥）"
          />

          <p className="text-text-secondary mt-4 mb-2 font-medium">
            2. 等效交流负载电阻
          </p>

          <MathBlock
            latex="R_{ac} = \\frac{8n^2}{\\pi^2} \\cdot \\frac{V_o^2}{P_o}"
            stepNumber={3}
            label="等效负载电阻"
          />

          <p className="text-text-secondary mt-4 mb-2 font-medium">
            3. 增益需求与电感比 k
          </p>

          <MathBlock
            latex="\\begin{aligned} M_{max} &= \\frac{V_{in,nom}}{V_{in,min}} \\\\ M_{min} &= \\frac{V_{in,nom}}{V_{in,max}} \\end{aligned}"
            multiline
            stepNumber={4}
            label="最大/最小增益需求"
          />

          <p className="text-text-secondary mt-2 mb-2">
            电感比 k 典型取值 3 ~ 10，其中 5 ~ 7 较为常见。较小的 k 提供更高峰值增益，但会增大励磁电流和导通损耗。
          </p>

          <p className="text-text-secondary mt-4 mb-2 font-medium">
            4. 品质因数 Q 的确定与 ZVS 验证
          </p>

          <MathBlock
            latex="Q_{max} = \\min(Q_{max1}, Q_{max2})"
            stepNumber={5}
            label="最大允许品质因数"
          />

          <p className="text-text-secondary mt-2 mb-2">
            {'Q_{max1} 对应满载感性边界条件，Q_{max2} 对应轻载 ZVS 能量条件。设计品质因数取 Q_s = (0.9 ~ 0.95) · Q_{max}。'}
          </p>

          <p className="text-text-secondary mt-4 mb-2 font-medium">
            5. 谐振腔参数计算
          </p>

          <MathBlock
            latex="Z_0 = Q_s \\cdot R_{ac}"
            stepNumber={6}
            label="特征阻抗"
          />

          <MathBlock
            latex="C_r = \\frac{1}{2\\pi f_r Z_0} = \\frac{1}{2\\pi f_r Q_s R_{ac}}"
            stepNumber={7}
            label="谐振电容"
          />

          <MathBlock
            latex="L_r = \\frac{Z_0}{2\\pi f_r} = \\frac{Q_s R_{ac}}{2\\pi f_r}"
            stepNumber={8}
            label="谐振电感"
          />

          <MathBlock
            latex="L_m = k \\cdot L_r = \\frac{k Q_s R_{ac}}{2\\pi f_r}"
            stepNumber={9}
            label="励磁电感"
          />

          <HighlightBox type="success">
            <strong>设计流程：</strong>
            {'定义规格 → 计算匝比 n → 计算等效电阻 R_{ac} → 计算增益需求 → 选取电感比 k → 确定品质因数 Q_s → 解算 L_r, C_r, L_m → 全面验证与迭代。'}
          </HighlightBox>

          <div className="mt-6">
            <p className="text-text-muted text-sm mb-2 font-medium">最终公式</p>
            <MathBlock
              latex="L_r = \\frac{Q_s R_{ac}}{2\\pi f_r}, \\quad C_r = \\frac{1}{2\\pi f_r Q_s R_{ac}}, \\quad L_m = k L_r"
              important
            />
          </div>
        </DerivationSection>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="card-surface p-6 mt-12"
      >
        <div className="flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-primary-light mt-0.5" />
          <div>
            <h3 className="font-semibold text-text-primary mb-2">推导说明</h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              以上推导基于 FHA（一阶谐波近似）假设，适用于开关频率接近谐振频率的高 Q 值工作条件。当开关频率远离谐振频率时，实际波形畸变加剧，高次谐波的影响不可忽略，此时需采用时域分析法或引入谐波校正的扩展模型。尽管如此，FHA 法建立的模型和公式仍然是理解 LLC 工作原理和进行初步设计的基石。
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
