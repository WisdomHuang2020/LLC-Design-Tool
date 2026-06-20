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
          LLC 谐振变换器核心公式的完整数学推导。从一阶谐波近似（FHA）出发，逐步推导等效电路、电压增益、谐振频率、输入阻抗、峰值增益、电流应力及元件选型，为工程设计和理论学习提供严谨的数学基础。
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
      >
        {/* 1. FHA */}
        <DerivationSection
          id="fha"
          number={1}
          title="一阶谐波近似 (FHA)"
          icon={<BookOpen className="w-5 h-5" />}
          defaultOpen={true}
        >
          <p className="text-text-secondary mt-4 mb-2">
            LLC 谐振变换器分析的核心工具是 FHA（First Harmonic Approximation）。开关管产生的方波电压包含丰富的谐波分量，但谐振腔对高次谐波有强烈抑制作用，因此仅基波分量对功率传输起主导作用。
          </p>

          <p className="text-text-secondary mt-4 mb-2">
            全桥逆变器输出方波电压可展开为傅里叶级数（半桥幅值为其一半）：
          </p>
          <MathBlock
            latex="v_{AB}^{\\text{FB}}(t) = \\frac{4V_{in}}{\\pi} \\sum_{\\substack{n=1 \\\\ n\\text{ odd}}}^{\\infty} \\frac{1}{n} \\sin(n\\omega_s t)"
            stepNumber={1}
            label="全桥逆变器输出"
          />
          <MathBlock
            latex="v_{AB}^{\\text{HB}}(t) = \\frac{2V_{in}}{\\pi} \\sum_{\\substack{n=1 \\\\ n\\text{ odd}}}^{\\infty} \\frac{1}{n} \\sin(n\\omega_s t)"
            stepNumber={2}
            label="半桥逆变器输出"
          />

          <p className="text-text-secondary mt-4 mb-2">
            FHA 假设仅保留基波（n = 1）分量：
          </p>
          <MathBlock
            latex="\\begin{aligned} v_{AB,1}^{\\text{FB}}(t) &= \\frac{4V_{in}}{\\pi} \\sin(\\omega_s t) \\\\ v_{AB,1}^{\\text{HB}}(t) &= \\frac{2V_{in}}{\\pi} \\sin(\\omega_s t) \\end{aligned}"
            multiline
            stepNumber={3}
            label="基波分量"
          />

          <HighlightBox type="info">
            <strong>关键假设：</strong>
            仅当谐振腔对高次谐波有足够衰减时（高 Q 值），FHA 才具有良好精度。工程上通常要求 Q &gt; 0.3 以保证误差小于 2%。
          </HighlightBox>

          <p className="text-text-secondary mt-4 mb-2">
            基波分量的峰值与有效值：
          </p>
          <MathBlock
            latex="\\begin{aligned} V_{AB,1,\\text{peak}}^{\\text{FB}} &= \\frac{4V_{in}}{\\pi} \\quad & V_{AB,1,\\text{rms}}^{\\text{FB}} &= \\frac{2\\sqrt{2}V_{in}}{\\pi} \\\\ V_{AB,1,\\text{peak}}^{\\text{HB}} &= \\frac{2V_{in}}{\\pi} \\quad & V_{AB,1,\\text{rms}}^{\\text{HB}} &= \\frac{\\sqrt{2}V_{in}}{\\pi} \\end{aligned}"
            multiline
            stepNumber={4}
            label="峰值与有效值"
          />

          <div className="mt-6">
            <p className="text-text-muted text-sm mb-2 font-medium">最终公式</p>
            <MathBlock
              latex="V_{FHA}^{\\text{FB}} = \\frac{2\\sqrt{2}V_{in}}{\\pi}, \\quad V_{FHA}^{\\text{HB}} = \\frac{\\sqrt{2}V_{in}}{\\pi}"
              important
            />
          </div>
        </DerivationSection>

        {/* 2. Equivalent AC Resistance */}
        <DerivationSection
          id="rac"
          number={2}
          title="等效 AC 负载电阻 R_{ac}"
          icon={<Zap className="w-5 h-5" />}
        >
          <p className="text-text-secondary mt-4 mb-2">
            为使用 AC 分析方法，需将整流器与负载转换为等效 AC 电阻 R_ac。利用功率守恒：等效 AC 电阻消耗的功率等于实际负载功率。
          </p>

          <MathBlock
            latex="P_{ac} = P_{out} = \\frac{V_{out}^2}{R_{load}}"
            stepNumber={1}
            label="功率守恒"
          />

          <p className="text-text-secondary mt-4 mb-2">
            次级侧基波电压（全桥整流，中心抽头为 nV_out 等效）：
          </p>
          <MathBlock
            latex="V_{sec,1,\\text{peak}} = \\frac{4nV_{out}}{\\pi}"
            stepNumber={2}
            label="次级基波电压峰值"
          />
          <MathBlock
            latex="V_{sec,1,\\text{rms}} = \\frac{V_{sec,1,\\text{peak}}}{\\sqrt{2}} = \\frac{2\\sqrt{2}nV_{out}}{\\pi}"
            stepNumber={3}
            label="次级基波电压有效值"
          />

          <p className="text-text-secondary mt-4 mb-2">
            次级侧基波电流（近似正弦，全桥整流）：
          </p>
          <MathBlock
            latex="I_{sec,1,\\text{peak}} = \\frac{\\pi I_{out}}{2n}"
            stepNumber={4}
            label="次级基波电流峰值"
          />
          <MathBlock
            latex="I_{sec,1,\\text{rms}} = \\frac{I_{sec,1,\\text{peak}}}{\\sqrt{2}} = \\frac{\\pi I_{out}}{2\\sqrt{2}n}"
            stepNumber={5}
            label="次级基波电流有效值"
          />

          <HighlightBox type="info">
            <strong>推导关键：</strong>
            对于全桥整流，R_ac = V_sec1,rms / I_sec1,rms = 8n²R_load/π²；对于中心抽头整流，R_ac = 2n²R_load/π²。
          </HighlightBox>

          <p className="text-text-secondary mt-4 mb-2">
            因此等效 AC 电阻（全桥整流）：
          </p>
          <MathBlock
            latex="\\begin{aligned} R_{ac} &= \\frac{V_{sec,1,\\text{rms}}}{I_{sec,1,\\text{rms}}} \\\\ &= \\frac{2\\sqrt{2}nV_{out}/\\pi}{\\pi I_{out}/(2\\sqrt{2}n)} \\\\ &= \\frac{8n^2 R_{load}}{\\pi^2} \\end{aligned}"
            multiline
            stepNumber={6}
            label="等效负载电阻推导"
          />

          <div className="mt-6">
            <p className="text-text-muted text-sm mb-2 font-medium">最终公式</p>
            <MathBlock
              latex="R_{ac} = \\frac{8n^2 R_{load}}{\\pi^2} \\quad \\text{(全桥整流)}"
              important
            />
            <MathBlock
              latex="R_{ac} = \\frac{2n^2 R_{load}}{\\pi^2} \\quad \\text{(中心抽头整流)}"
              important
            />
          </div>
        </DerivationSection>

        {/* 3. Voltage Gain Derivation */}
        <DerivationSection
          id="gain"
          number={3}
          title="电压增益 M 推导（核心公式）"
          icon={<TrendingUp className="w-5 h-5" />}
          defaultOpen={true}
        >
          <p className="text-text-secondary mt-4 mb-2">
            这是 LLC 设计中最核心的推导。定义归一化参数：
          </p>
          <MathBlock
            latex="f_n = \\frac{f_s}{f_{r1}}, \\quad k = \\frac{L_m}{L_r}, \\quad Q = \\frac{Z_0}{R_{ac}} = \\frac{\\sqrt{L_r/C_r}}{R_{ac}}"
            stepNumber={1}
            label="归一化参数定义"
          />

          <p className="text-text-secondary mt-4 mb-2">
            串联谐振支路的阻抗：
          </p>
          <MathBlock
            latex="\\begin{aligned} Z_s &= j\\omega_s L_r + \\frac{1}{j\\omega_s C_r} \\\\ &= jZ_0 \\left( f_n - \\frac{1}{f_n} \\right) \\end{aligned}"
            multiline
            stepNumber={2}
            label="串联谐振阻抗"
          />

          <p className="text-text-secondary mt-4 mb-2">
            其中 Z_0 = √(L_r/C_r) 为特征阻抗。磁化电感与等效负载的并联阻抗：
          </p>
          <MathBlock
            latex="\\begin{aligned} Z_p &= j\\omega_s L_m \\parallel R_{ac} \\\\ &= \\frac{j\\omega_s L_m \\cdot R_{ac}}{R_{ac} + j\\omega_s L_m} \\end{aligned}"
            multiline
            stepNumber={3}
            label="并联阻抗"
          />

          <p className="text-text-secondary mt-4 mb-2">
            代入归一化参数 ω_s L_m = f_n Z_0 k 和 R_ac = Z_0 / Q：
          </p>
          <MathBlock
            latex="\\begin{aligned} Z_p &= \\frac{j f_n Z_0 k \\cdot (Z_0/Q)}{Z_0/Q + j f_n Z_0 k} \\\\ &= \\frac{j f_n Z_0 k}{1 + j f_n k Q} \\end{aligned}"
            multiline
            stepNumber={4}
            label="归一化并联阻抗"
          />

          <HighlightBox type="warning">
            <strong>推导要点：</strong>
            通过代入归一化参数，将实际电路参数转换为无量纲表达式，这是增益分析的关键步骤。
          </HighlightBox>

          <p className="text-text-secondary mt-4 mb-2">
            输入总阻抗：
          </p>
          <MathBlock
            latex="\\begin{aligned} Z_{in} &= Z_s + Z_p \\\\ &= jZ_0 \\left( f_n - \\frac{1}{f_n} \\right) + \\frac{j f_n Z_0 k}{1 + j f_n k Q} \\end{aligned}"
            multiline
            stepNumber={5}
            label="输入总阻抗"
          />

          <p className="text-text-secondary mt-4 mb-2">
            电压增益定义为输出电压基波与输入电压基波之比：
          </p>
          <MathBlock
            latex="M = \\left| \\frac{V_{out,1}}{V_{in,1}} \\right| = \\left| \\frac{Z_p}{Z_{in}} \\right| = \\left| \\frac{Z_p}{Z_s + Z_p} \\right|"
            stepNumber={6}
            label="电压增益定义"
          />

          <p className="text-text-secondary mt-4 mb-2">
            将 Z_s 和 Z_p 代入，经过复数运算和化简：
          </p>
          <MathBlock
            latex="\\begin{aligned} M &= \\left| \\frac{j f_n Z_0 k}{jZ_0\\left(f_n - \\frac{1}{f_n}\\right)(1 + j f_n k Q) + j f_n Z_0 k} \\right| \\\\ &= \\left| \\frac{f_n k}{f_n k + \\left(f_n - \\frac{1}{f_n}\\right)(1 + j f_n k Q)} \\right| \\end{aligned}"
            multiline
            stepNumber={7}
            label="代入化简"
          />

          <p className="text-text-secondary mt-4 mb-2">
            进一步化简分母：
          </p>
          <MathBlock
            latex="\\begin{aligned} &f_n k + \\left(f_n - \\frac{1}{f_n}\\right)(1 + j f_n k Q) \\\\ &= f_n k + f_n - \\frac{1}{f_n} + j f_n^2 k Q - j k Q \\\\ &= f_n(k + 1) - \\frac{1}{f_n} + j k Q (f_n^2 - 1) \\end{aligned}"
            multiline
            stepNumber={8}
            label="分母展开"
          />

          <p className="text-text-secondary mt-4 mb-2">
            最终得到标准的 LLC 增益方程：
          </p>
          <MathBlock
            latex="M = \\frac{f_n^2 k}{\\sqrt{\\left[f_n^2(k+1) - 1\\right]^2 + \\left[f_n k Q(f_n^2 - 1)\\right]^2}}"
            stepNumber={9}
            label="标准增益方程"
          />

          <div className="mt-6">
            <p className="text-text-muted text-sm mb-2 font-medium">最终公式</p>
            <MathBlock
              latex="\\begin{aligned} M(f_n, k, Q) &= \\frac{f_n^2 k}{\\sqrt{\\left[f_n^2(k+1) - 1\\right]^2 + \\left[f_n k Q(f_n^2 - 1)\\right]^2}} \\\\ &= \\frac{1}{\\sqrt{\\left(1 + \\frac{1}{k} - \\frac{1}{k f_n^2}\\right)^2 + \\left[Q\\left(f_n - \\frac{1}{f_n}\\right)\\right]^2}} \\end{aligned}"
              important
              multiline
            />
          </div>
        </DerivationSection>

        {/* 4. Resonant Frequencies */}
        <DerivationSection
          id="frequencies"
          number={4}
          title="谐振频率"
          icon={<Activity className="w-5 h-5" />}
        >
          <p className="text-text-secondary mt-4 mb-2">
            LLC 谐振腔存在两个特征谐振频率：
          </p>

          <p className="text-text-secondary mt-4 mb-2">
            第一谐振频率 f_r1：由串联谐振电感 L_r 与谐振电容 C_r 决定
          </p>
          <MathBlock
            latex="\\omega_{r1} = \\frac{1}{\\sqrt{L_r C_r}} \\quad \\Rightarrow \\quad f_{r1} = \\frac{1}{2\\pi\\sqrt{L_r C_r}}"
            stepNumber={1}
            label="串联谐振频率"
          />

          <p className="text-text-secondary mt-4 mb-2">
            第二谐振频率 f_r2：由总电感 (L_r + L_m) 与 C_r 决定
          </p>
          <MathBlock
            latex="\\omega_{r2} = \\frac{1}{\\sqrt{(L_r + L_m)C_r}} \\quad \\Rightarrow \\quad f_{r2} = \\frac{1}{2\\pi\\sqrt{(L_r + L_m)C_r}}"
            stepNumber={2}
            label="并联谐振频率"
          />

          <p className="text-text-secondary mt-4 mb-2">
            当 f_s = f_r1 时，串联支路谐振，L_r 与 C_r 的阻抗相互抵消，增益为 1。当 f_s = f_r2 时，总电感与 C_r 谐振，对应空载（Q = 0）时的增益极限。
          </p>

          <p className="text-text-secondary mt-4 mb-2">
            两个谐振频率的关系：
          </p>
          <MathBlock
            latex="\\begin{aligned} f_{r2} &= \\frac{1}{2\\pi\\sqrt{(L_r + L_m)C_r}} \\\\ &= \\frac{1}{2\\pi\\sqrt{L_r C_r \\cdot (1 + k)}} \\\\ &= \\frac{f_{r1}}{\\sqrt{1 + k}} \\end{aligned}"
            multiline
            stepNumber={3}
            label="谐振频率关系"
          />

          <div className="mt-6">
            <p className="text-text-muted text-sm mb-2 font-medium">最终公式</p>
            <MathBlock
              latex="f_{r1} = \\frac{1}{2\\pi\\sqrt{L_r C_r}}, \\quad f_{r2} = \\frac{1}{2\\pi\\sqrt{(L_r + L_m)C_r}} = \\frac{f_{r1}}{\\sqrt{1 + k}}"
              important
            />
          </div>
        </DerivationSection>

        {/* 5. Peak Gain */}
        <DerivationSection
          id="peak-gain"
          number={5}
          title="峰值增益 M_{peak}"
          icon={<TrendingUp className="w-5 h-5" />}
        >
          <p className="text-text-secondary mt-4 mb-2">
            峰值增益是设计中最关键的参数，决定了变换器能否在最低输入电压下维持输出电压。峰值增益发生在 dM/df_n = 0 处。
          </p>

          <MathBlock
            latex="\\frac{dM}{df_n} = 0"
            stepNumber={1}
            label="极值条件"
          />

          <p className="text-text-secondary mt-4 mb-2">
            令 x = f_n²，对增益平方求导：
          </p>
          <MathBlock
            latex="M^2 = \\frac{x^2 k^2}{\\left[x(k+1) - 1\\right]^2 + x k^2 Q^2 (x-1)^2}"
            stepNumber={2}
            label="增益平方表达式"
          />

          <p className="text-text-secondary mt-4 mb-2">
            对 x 求导并令 d(M²)/dx = 0，等价于求解：
          </p>
          <MathBlock
            latex="2D(x) - x \\cdot D'(x) = 0"
            stepNumber={3}
            label="求导方程"
          />
          <p className="text-text-secondary mt-2 mb-2">
            其中 D(x) = [x(k+1) - 1]² + x k² Q² (x-1)² 为增益表达式的分母。该方程是关于 x 的三次方程，通常采用数值方法求解。
          </p>

          <HighlightBox type="warning">
            <strong>工程简化：</strong>
            上述解析条件较为繁琐。实际工程中通常通过数值方法求解 dM/df_n = 0，或者使用曲线工具直接读取峰值增益。空载（Q = 0）时，峰值增益趋向无穷大，出现在 f_n = 1/√(1+k) 处。
          </HighlightBox>

          <p className="text-text-secondary mt-4 mb-2">
            在峰值增益频率处，系统的增益达到最大值。对于给定的 k 和 Q，将数值求得的 f_n,peak 代入增益公式即可得到 M_peak。
          </p>

          <div className="mt-6">
            <p className="text-text-muted text-sm mb-2 font-medium">最终条件</p>
            <MathBlock
              latex="\\frac{dM}{df_n} = 0 \\quad \\text{at} \\quad f_n = f_{n,\\text{peak}}"
              important
            />
          </div>
        </DerivationSection>

        {/* 6. Input Impedance */}
        <DerivationSection
          id="impedance"
          number={6}
          title="输入阻抗分析"
          icon={<Gauge className="w-5 h-5" />}
        >
          <p className="text-text-secondary mt-4 mb-2">
            输入阻抗决定了变换器从电源侧看进去的等效负载特性，对于 ZVS（零电压开通）条件至关重要。
          </p>
          <MathBlock
            latex="Z_{in} = j\\omega_s L_r + \\frac{1}{j\\omega_s C_r} + \\left(j\\omega_s L_m \\parallel R_{ac}\\right)"
            stepNumber={1}
            label="输入阻抗定义"
          />

          <p className="text-text-secondary mt-4 mb-2">
            代入归一化参数化简：
          </p>
          <MathBlock
            latex="\\begin{aligned} Z_{in} &= jZ_0\\left(f_n - \\frac{1}{f_n}\\right) + \\frac{j f_n Z_0 k}{1 + j f_n k Q} \\\\ &= Z_0 \\left[ \\frac{f_n^2 k^2 Q}{Q^2 + f_n^2 k^2} + j\\left(f_n - \\frac{1}{f_n} + \\frac{f_n k Q^2}{Q^2 + f_n^2 k^2}\\right) \\right] \\end{aligned}"
            multiline
            stepNumber={2}
            label="归一化输入阻抗"
          />

          <p className="text-text-secondary mt-4 mb-2">
            将实部和虚部分离：
          </p>
          <MathBlock
            latex="\\begin{aligned} \\text{Re}(Z_{in}) &= Z_0 \\cdot \\frac{f_n^2 k^2 Q}{Q^2 + f_n^2 k^2} \\\\ \\text{Im}(Z_{in}) &= Z_0 \\left( f_n - \\frac{1}{f_n} + \\frac{f_n k Q^2}{Q^2 + f_n^2 k^2} \\right) \\end{aligned}"
            multiline
            stepNumber={3}
            label="实部与虚部"
          />

          <HighlightBox type="info">
            <strong>ZVS 条件：</strong>
            为实现主开关管的零电压开通，谐振槽必须在开关频率处呈现感性（Im(Z_in) &gt; 0）。这意味着开关频率必须位于感性区域内。
          </HighlightBox>

          <p className="text-text-secondary mt-4 mb-2">
            感性/容性边界条件：
          </p>
          <MathBlock
            latex="\\text{Im}(Z_{in}) = 0 \\quad \\Rightarrow \\quad f_n - \\frac{1}{f_n} + \\frac{f_n k Q^2}{Q^2 + f_n^2 k^2} = 0"
            stepNumber={4}
            label="边界条件"
          />

          <p className="text-text-secondary mt-4 mb-2">
            解此方程可得边界频率。对于 LLC 变换器，当 f_s &gt; f_r1 时，Z_in 呈感性；在 f_r2 与 f_r1 之间，阻抗性质取决于负载条件。
          </p>

          <div className="mt-6">
            <p className="text-text-muted text-sm mb-2 font-medium">最终公式</p>
            <MathBlock
              latex="Z_{in} = jZ_0\\left(f_n - \\frac{1}{f_n}\\right) + \\frac{j f_n Z_0 k}{1 + j f_n k Q}"
              important
            />
          </div>
        </DerivationSection>

        {/* 7. Current Stress */}
        <DerivationSection
          id="current-stress"
          number={7}
          title="电流应力"
          icon={<Activity className="w-5 h-5" />}
        >
          <p className="text-text-secondary mt-4 mb-2">
            电流应力计算是器件选型和热设计的基础。基于 FHA 的初级谐振电流有效值：
          </p>
          <MathBlock
            latex="I_{r,\\text{rms}} = \\frac{V_{FHA,\\text{rms}}}{|Z_{in}|} = \\frac{2\\sqrt{2}V_{in}}{\\pi |Z_{in}|}"
            stepNumber={1}
            label="初级谐振电流（全桥）"
          />

          <p className="text-text-secondary mt-4 mb-2">
            在谐振频率 f_r1 处，|Z_in| = R_ac（纯阻性），此时电流达到近似最小值：
          </p>
          <MathBlock
            latex="I_{r,\\text{rms}}(f_{r1}) = \\frac{2\\sqrt{2}V_{in}}{\\pi R_{ac}} = \\frac{2\\sqrt{2}V_{in} Q}{\\pi Z_0}"
            stepNumber={2}
            label="谐振频率处电流"
          />

          <p className="text-text-secondary mt-4 mb-2">
            磁化电流有效值（仅在 L_m 上）。磁化电感并联在变压器初级，其电压为初级基波电压：
          </p>
          <MathBlock
            latex="I_{m,\\text{rms}} = \\frac{V_{FHA,\\text{rms}}}{\\omega_s L_m} = \\frac{2\\sqrt{2}V_{in}}{\\pi \\omega_s L_m}"
            stepNumber={3}
            label="磁化电流（全桥）"
          />

          <HighlightBox type="warning">
            <strong>峰值电流：</strong>
            峰值谐振电流出现在启动和负载瞬态期间。设计时应确保 MOSFET 的电流额定值至少为峰值谐振电流的 1.5 倍。
          </HighlightBox>

          <p className="text-text-secondary mt-4 mb-2">
            次级电流有效值（整流后）：
          </p>
          <MathBlock
            latex="I_{sec,\\text{rms}}^{\\text{full}} = \\frac{\\pi}{2\\sqrt{2}} I_{out} \\approx 1.11 \\, I_{out} \\quad \\text{(全波/全桥整流)}"
            stepNumber={4}
            label="次级电流（全桥）"
          />
          <MathBlock
            latex="I_{sec,\\text{rms}}^{\\text{CT}} = \\frac{\\pi}{4} I_{out} \\approx 0.785 \\, I_{out} \\quad \\text{(中心抽头：每绕组半波)}"
            stepNumber={5}
            label="次级电流（中心抽头）"
          />

          <div className="mt-6">
            <p className="text-text-muted text-sm mb-2 font-medium">最终公式</p>
            <MathBlock
              latex="I_{r,\\text{rms}}^{\\text{FB}} = \\frac{2\\sqrt{2}V_{in}}{\\pi |Z_{in}|}, \\quad I_{m,\\text{rms}}^{\\text{FB}} = \\frac{2\\sqrt{2}V_{in}}{\\pi \\omega_s L_m}"
              important
            />
          </div>
        </DerivationSection>

        {/* 8. Component Selection */}
        <DerivationSection
          id="component-selection"
          number={8}
          title="元件选择"
          icon={<Layers className="w-5 h-5" />}
        >
          <p className="text-text-secondary mt-4 mb-2">
            基于设计参数（Q, k, f_r1）确定 L_r, C_r, L_m 的值。首先确定特征阻抗 Z_0 与等效负载电阻 R_ac 的关系：
          </p>

          <MathBlock
            latex="Z_0 = Q \\cdot R_{ac} = Q \\cdot \\frac{8n^2 R_{load}}{\\pi^2}"
            stepNumber={1}
            label="特征阻抗"
          />

          <p className="text-text-secondary mt-4 mb-2">
            由谐振频率与特征阻抗：
          </p>
          <MathBlock
            latex="Z_0 = \\sqrt{\\frac{L_r}{C_r}} = \\omega_{r1} L_r = \\frac{1}{\\omega_{r1} C_r}"
            stepNumber={2}
            label="谐振频率关系"
          />

          <p className="text-text-secondary mt-4 mb-2">
            谐振电感：
          </p>
          <MathBlock
            latex="\\begin{aligned} L_r &= \\frac{Z_0}{\\omega_{r1}} = \\frac{Z_0}{2\\pi f_{r1}} \\\\ &= \\frac{Q R_{ac}}{2\\pi f_{r1}} \\end{aligned}"
            multiline
            stepNumber={3}
            label="谐振电感"
          />

          <p className="text-text-secondary mt-4 mb-2">
            谐振电容：
          </p>
          <MathBlock
            latex="\\begin{aligned} C_r &= \\frac{1}{\\omega_{r1} Z_0} = \\frac{1}{2\\pi f_{r1} Z_0} \\\\ &= \\frac{1}{2\\pi f_{r1} Q R_{ac}} \\end{aligned}"
            multiline
            stepNumber={4}
            label="谐振电容"
          />

          <p className="text-text-secondary mt-4 mb-2">
            磁化电感：
          </p>
          <MathBlock
            latex="\\begin{aligned} L_m &= k \\cdot L_r \\\\ &= \\frac{k Q R_{ac}}{2\\pi f_{r1}} \\end{aligned}"
            multiline
            stepNumber={5}
            label="磁化电感"
          />

          <HighlightBox type="success">
            <strong>设计流程：</strong>
            1. 根据电压增益范围确定 k；2. 根据负载范围和 ZVS 要求确定 Q；3. 根据效率和体积选择 f_r1；4. 按上述公式计算 L_r, C_r, L_m。
          </HighlightBox>

          <div className="mt-6">
            <p className="text-text-muted text-sm mb-2 font-medium">最终公式</p>
            <MathBlock
              latex="L_r = \\frac{Q R_{ac}}{2\\pi f_{r1}}, \\quad C_r = \\frac{1}{2\\pi f_{r1} Q R_{ac}}, \\quad L_m = k L_r"
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
              以上推导基于 FHA（一阶谐波近似）假设，适用于高 Q 值（Q &gt; 0.3）工作条件。对于低 Q 值或极端负载条件，建议使用时域仿真（如 PSIM、LTspice）进行验证。实际设计中，元件的寄生参数（ESR、漏感等）也会影响变换器性能，需要在 PCB 布局和元件选型中予以考虑。
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
