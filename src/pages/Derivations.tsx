import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown,
  Lightbulb,
  BookOpen,
  Zap,
  Sigma,
  Activity,
  Gauge,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Calculator,
} from 'lucide-react'
import MathBlock from '../components/MathBlock'
import InlineMath from '../components/InlineMath'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
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

interface FormulaSectionProps {
  id: string
  number: number
  title: string
  icon: React.ReactNode
  defaultOpen?: boolean
  children: React.ReactNode
}

function FormulaSection({
  id,
  number,
  title,
  icon,
  defaultOpen = false,
  children,
}: FormulaSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <motion.div
      id={id}
      data-section-index={number}
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

interface ParamRowProps {
  symbol: string
  name: string
  unit?: string
  description: string
  typical?: string
}

function ParamTable({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto my-4 rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-surface-elevated text-text-secondary">
          <tr>
            <th className="px-4 py-3 text-left font-semibold w-24">符号</th>
            <th className="px-4 py-3 text-left font-semibold">参数名称</th>
            <th className="px-4 py-3 text-left font-semibold w-24">单位</th>
            <th className="px-4 py-3 text-left font-semibold">物理意义 / 说明</th>
            <th className="px-4 py-3 text-left font-semibold w-40">典型值 / 备注</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {children}
        </tbody>
      </table>
    </div>
  )
}

function ParamRow({ symbol, name, unit = '-', description, typical = '-' }: ParamRowProps) {
  return (
    <tr className="hover:bg-surface-elevated/30 transition-colors">
      <td className="px-4 py-3 font-mono text-primary-light font-medium">{symbol}</td>
      <td className="px-4 py-3 text-text-primary">{name}</td>
      <td className="px-4 py-3 text-text-secondary font-mono text-xs">{unit}</td>
      <td className="px-4 py-3 text-text-secondary">{description}</td>
      <td className="px-4 py-3 text-text-secondary text-xs">{typical}</td>
    </tr>
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
          LLC 谐振变换器拓扑架构的核心公式与参数解释。本节以工程速查形式汇总谐振腔、FHA 增益、变压器折算、ZVS 条件、器件应力及损耗估算等关键公式，并给出每个参数的物理意义、单位与典型取值范围。
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
      >
        {/* Section 1: LLC 拓扑架构与核心参数 */}
        <FormulaSection
          id="topology-params"
          number={1}
          title="LLC 拓扑架构与核心参数"
          icon={<BookOpen className="w-5 h-5" />}
          defaultOpen={true}
        >
          <p className="text-text-secondary mt-4 mb-2">
            LLC 谐振变换器由开关网络（半桥/全桥）、谐振腔（L<sub>r</sub>、C<sub>r</sub>、L<sub>m</sub>）、隔离变压器及整流滤波网络组成。谐振腔引入励磁电感 L<sub>m</sub>，使拓扑具备两个特征谐振频率，并可在宽输入/负载范围内实现零电压开关（ZVS）。
          </p>

          <MathBlock
            latex="f_{r1} = \\frac{1}{2\\pi\\sqrt{L_r C_r}}, \\quad f_{r2} = \\frac{f_{r1}}{\\sqrt{1 + k}}, \\quad k = \\frac{L_m}{L_r}, \\quad Z_r = \\sqrt{\\frac{L_r}{C_r}}, \\quad Q = \\frac{Z_r}{R_{ac}}, \\quad f_n = \\frac{f_{sw}}{f_{r1}}"
            important
            label="LLC 核心参数定义"
          />

          <ParamTable>
            <ParamRow symbol="Lr" name="谐振电感" unit="H" description="与谐振电容共同决定串联谐振频率，通常为变压器漏感或外接电感" typical="数十 μH ~ 数百 μH" />
            <ParamRow symbol="Cr" name="谐振电容" unit="F" description="谐振腔串联电容，承受谐振电流交流分量" typical="nF ~ 数十 nF" />
            <ParamRow symbol="Lm" name="励磁电感" unit="H" description="变压器励磁电感，参与第二谐振频率并影响 ZVS 能量" typical="数百 μH ~ 数 mH" />
            <ParamRow symbol="fr / fr1" name="谐振频率（第一谐振频率）" unit="Hz" description="Lr 与 Cr 的串联谐振频率，也是负载独立点；★ 站内结果卡/报告中的「谐振频率 fr」即指 fr1" typical="100 kHz ~ 500 kHz" />
            <ParamRow symbol="fr2" name="第二谐振频率" unit="Hz" description="(Lr + Lm) 与 Cr 的谐振频率，fr2 = fr1 / √(1+k)" typical="0.3 fr1 ~ 0.5 fr1" />
            <ParamRow symbol="k" name="电感比" unit="-" description="Lm / Lr，决定两个谐振频率间距与峰值增益能力" typical="3 ~ 10（常用 5 ~ 7）" />
            <ParamRow symbol="Zr" name="特征阻抗" unit="Ω" description="谐振腔阻抗尺度，Zr = √(Lr/Cr)" typical="数十 Ω ~ 数百 Ω" />
            <ParamRow symbol="Q" name="品质因数" unit="-" description="反映负载轻重，Q = Zr / Rac；负载越重 Q 越大" typical="0.3 ~ 1.0" />
            <ParamRow symbol="fn" name="归一化频率" unit="-" description="开关频率相对谐振频率的比值 fsw / fr1" typical="0.5 ~ 1.5" />
          </ParamTable>

          <HighlightBox type="info">
            <strong>工作区域划分：</strong>当 fn = 1 时，LLC 增益恒为 1 且与负载无关；fn &lt; 1 时进入升压增益区（Region 2，增益 &gt; 1），可提供峰值增益；fn &gt; 1 时进入降压区（Region 1，增益 &lt; 1），增益随频率升高而下降。
          </HighlightBox>
        </FormulaSection>

        {/* Section 2: FHA 电压增益 */}
        <FormulaSection
          id="fha-gain"
          number={2}
          title="FHA 电压增益公式"
          icon={<Activity className="w-5 h-5" />}
          defaultOpen={true}
        >
          <p className="text-text-secondary mt-4 mb-2">
            基波近似法（FHA）将开关网络输出的方波电压取基波分量，并将整流负载折算到原边，从而把 LLC 谐振腔简化为线性正弦交流电路。电压增益 M 定义为输出折算到原边的基波电压与输入基波电压之比。
          </p>

          <MathBlock
            latex="M(f_n, k, Q) = \\frac{1}{\\sqrt{\\left(1 + \\frac{1}{k} - \\frac{1}{k f_n^2}\\right)^2 + \\left[Q\\left(f_n - \\frac{1}{f_n}\\right)\\right]^2}}"
            important
            label="标准 LLC 电压增益（FHA）"
          />

          <p className="text-text-secondary mt-4 mb-2">
            上式也可写成如下等价形式，便于编程实现：
          </p>

          <MathBlock
            latex="M(f_n, k, Q) = \\frac{f_n^2 k}{\\sqrt{\\left[f_n^2(k+1) - 1\\right]^2 + f_n^2 k^2 Q^2 \\left(f_n^2 - 1\\right)^2}}"
            label="FHA 增益的等价形式"
          />

          <div className="mt-4 p-4 rounded-lg border border-border bg-surface-elevated/30">
            <p className="text-text-muted text-xs uppercase tracking-wider mb-3">推导与验证</p>
            <p className="text-text-secondary text-sm leading-relaxed">
              在 LLC 谐振变换器基于 FHA（一次谐波近似）的经典推导中，标准的电压增益公式通常写为：
            </p>
            <MathBlock latex="M = \\frac{1}{\\sqrt{\\left(1 + \\frac{1}{k} - \\frac{1}{k f_n^2}\\right)^2 + Q^2\\left(f_n - \\frac{1}{f_n}\\right)^2}}" />
            <p className="text-text-secondary text-sm leading-relaxed">
              如果对上述标准公式进行通分化简（分子分母同乘 <InlineMath latex="f_n^2 k" />），再整体开方，就会得到上方等价形式：
            </p>
            <MathBlock latex="M = \\frac{f_n^2 k}{\\sqrt{\\left(f_n^2(k+1)-1\\right)^2 + f_n^2 k^2 Q^2 \\left(f_n^2 - 1\\right)^2}}" />
            <p className="text-text-secondary text-sm leading-relaxed">
              可以看出，上方公式完美符合标准推导的化简结果 —— 两者在代数上严格恒等，本工具的计算引擎 <span className="font-mono text-primary-light">gainM()</span> 内部即采用标准式实现，与仅用于展示的等价形式数值一致（相对误差在浮点精度 1e-15 量级）。
            </p>
            <p className="text-text-secondary text-sm leading-relaxed mt-2">
              <strong className="text-text-primary">常见笔误提醒：</strong>等价形式根号内第二项是 <InlineMath latex="f_n^2 k^2 Q^2" />（含 <InlineMath latex="f_n^2" />）。若误写成 <InlineMath latex="k^2 Q^2" />（漏掉 <InlineMath latex="f_n^2" />），在 <InlineMath latex="f_n \lt 1" /> 的升压区会严重低估增益，峰值增益偏差可达 50% 以上，务必注意。
            </p>
          </div>

          <ParamTable>
            <ParamRow symbol="M" name="电压增益" unit="-" description="输出电压折算值与输入电压基波分量的比值。本文与设计工具页统一用「归一化」口径：谐振频率处 M = 1；理论页（工作原理 / 基础）另有「原始直流增益 n·Vo/Vin」的定义，两者不可混用" typical="0.5 ~ 1.5" />
            <ParamRow symbol="fn" name="归一化频率" unit="-" description="fsw / fr1，调频控制的核心变量" typical="0.5 ~ 1.5" />
            <ParamRow symbol="k" name="电感比" unit="-" description="Lm / Lr，影响峰值增益与增益曲线斜率" typical="3 ~ 10" />
            <ParamRow symbol="Q" name="品质因数" unit="-" description="反映负载情况，Q 越大增益曲线越陡峭" typical="0.3 ~ 1.0" />
          </ParamTable>

          <div className="grid md:grid-cols-2 gap-4 my-4">
            <div className="p-4 rounded-lg border border-border bg-surface-elevated/30">
              <p className="text-text-muted text-xs uppercase tracking-wider mb-2">谐振点特性</p>
              <MathBlock latex="M(1, k, Q) = 1" />
              <p className="text-text-secondary text-sm mt-2">负载独立点，增益恒为 1，与 Q 无关。</p>
            </div>
            <div className="p-4 rounded-lg border border-border bg-surface-elevated/30">
              <p className="text-text-muted text-xs uppercase tracking-wider mb-2">空载特性</p>
              <MathBlock latex="G_{empty}(f_n, k) = \\frac{1}{\\left|1 + \\frac{1}{k} - \\frac{1}{k f_n^2}\\right|} = \\frac{k f_n^2}{\\left|f_n^2(1 + k) - 1\\right|}" />
              <p className="text-text-secondary text-sm mt-2">Q → 0 时的极限增益：fn → 1/√(1+k)（即 fr2）时趋于无穷大，fn → ∞ 时趋向 k/(k+1)。</p>
            </div>
          </div>

          <HighlightBox type="warning">
            <strong>FHA 适用范围：</strong>仅当开关频率接近谐振频率且谐振腔 Q 值较高时精度较好。当 fn 远离 1 或波形畸变严重时，需使用时域仿真或高次谐波修正模型。
          </HighlightBox>
        </FormulaSection>

        {/* Section 3: 变压器匝比与等效负载 */}
        <FormulaSection
          id="transformer-rac"
          number={3}
          title="变压器匝比与等效交流负载"
          icon={<Layers className="w-5 h-5" />}
        >
          <p className="text-text-secondary mt-4 mb-2">
            变压器匝比 n 由原边额定输入与输出电压决定；副边整流负载通过变压器和整流网络折算到原边，成为与 L<sub>m</sub> 并联的等效交流电阻 R<sub>ac</sub>。
          </p>

          <MathBlock
            latex="n = \\frac{V_{in,nom}}{2(V_o + V_f)} \\quad \\text{（半桥）}, \\qquad n = \\frac{V_{in,nom}}{V_o + V_f} \\quad \\text{（全桥）}"
            important
            label="变压器匝比"
          />

          <MathBlock
            latex="R_{ac} = \\frac{8n^2}{\\pi^2} \\cdot R_L = \\frac{8n^2 V_o^2}{\\pi^2 P_o}"
            important
            label="等效交流负载电阻（全波整流）"
          />

          <ParamTable>
            <ParamRow symbol="n" name="变压器匝比" unit="-" description="原边匝数与副边匝数之比（中心抽头按半绕组计算）" typical="按输入输出电压设计" />
            <ParamRow symbol="Vin_nom" name="额定输入电压" unit="V" description="变换器标称直流输入电压" typical="380 V / 400 Vdc" />
            <ParamRow symbol="Vo" name="输出电压" unit="V" description="额定输出直流电压" typical="12 V / 24 V / 48 V" />
            <ParamRow symbol="Vf" name="输出整流压降" unit="V" description="★ 单一来源：设计参数里的「输出整流压降」，同时用于匝比 n 与二极管整流的损耗（Nrect·Vf·(Io/2)）。二极管取 0.6~1.2 V，同步整流填 0" typical="0（同步）/ 0.6~1.2 V（二极管）" />
            <ParamRow symbol="RL" name="直流负载电阻" unit="Ω" description="RL = Vo² / Po" typical="随输出功率变化" />
            <ParamRow symbol="Rac" name="等效交流电阻" unit="Ω" description="折算到原边的交流负载，用于 FHA 等效电路" typical="数十 Ω ~ 数百 Ω" />
          </ParamTable>

          <HighlightBox type="info">
            <strong>折算关系：</strong>副边基波电压有效值 V<sub>sec,1</sub> = (2√2/π) · Vo，基波电流有效值 I<sub>sec,1</sub> = (π/2√2) · Io。折算到原边后得到 R<sub>ac</sub> = 8n²RL / π²。
          </HighlightBox>
        </FormulaSection>

        {/* Section 4: 输入阻抗与 ZVS 条件 */}
        <FormulaSection
          id="impedance-zvs"
          number={4}
          title="输入阻抗与 ZVS 条件"
          icon={<Gauge className="w-5 h-5" />}
        >
          <p className="text-text-secondary mt-4 mb-2">
            从原边开关网络看入的输入阻抗决定了变换器能否实现零电压开通（ZVS）。感性输入阻抗（Im(Z<sub>in</sub>) &gt; 0）是实现 ZVS 的必要条件。
          </p>

          <MathBlock
            latex="Z_{in} = jZ_r\\left(f_n - \\frac{1}{f_n}\\right) + \\frac{j f_n Z_r k}{1 + j f_n k Q}"
            important
            label={<>输入阻抗（<InlineMath latex="Z_r = \\sqrt{L_r/C_r}" /> 为特征阻抗，非归一化）</>}
          />

          <MathBlock
            latex="\\text{Re}(Z_{in}) = Z_r \\cdot \\frac{f_n^2 k^2 Q}{1 + f_n^2 k^2 Q^2}, \\qquad \\text{Im}(Z_{in}) = Z_r \\left( f_n - \\frac{1}{f_n} + \\frac{f_n k}{1 + f_n^2 k^2 Q^2} \\right)"
            label="输入阻抗实部与虚部"
          />

          <p className="text-text-secondary text-sm mt-2">
            对 R<sub>ac</sub> 归一化（利用 Q = Z<sub>r</sub>/R<sub>ac</sub>）后形式更简洁，也便于与感性/容性判据对照：
          </p>

          <MathBlock
            latex="\\frac{\\text{Re}(Z_{in})}{R_{ac}} = \\frac{f_n^2 k^2 Q^2}{1 + f_n^2 k^2 Q^2}, \\qquad \\frac{\\text{Im}(Z_{in})}{R_{ac}} = Q\\left(f_n - \\frac{1}{f_n}\\right) + \\frac{f_n k Q}{1 + f_n^2 k^2 Q^2}"
            label="归一化输入阻抗（对 Rac）"
          />

          <p className="text-text-secondary text-sm mt-2">
            自检：令 f<sub>n</sub> = 1，L<sub>r</sub> 与 C<sub>r</sub> 抵消，Z<sub>in</sub> 退化为 L<sub>m</sub> ∥ R<sub>ac</sub>，
            于是 Re(Z<sub>in</sub>)/R<sub>ac</sub> = (kQ)²/(1+(kQ)²)、Im(Z<sub>in</sub>)/R<sub>ac</sub> = kQ/(1+(kQ)²)。
          </p>

          <ParamTable>
            <ParamRow symbol="Zin" name="输入阻抗" unit="Ω" description="从开关网络看入谐振腔的等效阻抗" typical="-" />
            <ParamRow symbol="Re(Zin)" name="输入阻抗实部" unit="Ω" description="有功分量，决定基波电流同相分量" typical="-" />
            <ParamRow symbol="Im(Zin)" name="输入阻抗虚部" unit="Ω" description="无功分量；大于 0 表示感性，小于 0 表示容性" typical="-" />
            <ParamRow symbol="φ" name="阻抗相位角" unit="°" description="φ = arctan(Im/Re)；感性区 φ &gt; 0" typical="10° ~ 60°" />
          </ParamTable>

          <p className="text-text-secondary mt-4 mb-2 font-medium">ZVS 能量条件</p>
          <MathBlock
            latex="\\frac{1}{2} L_m I_{m,off}^2 \\geq \\frac{1}{2} (2C_{oss,er} + C_j) V_{in,max}^2"
            important
            label="ZVS 能量判据"
          />

          <p className="text-text-secondary mt-2 mb-2 text-sm leading-relaxed">
            判据左侧为死区内励磁电感释放的能量，右侧为开关节点电容需被充/放电的能量。
            <strong className="text-text-primary">半桥拓扑</strong>下，
            总电容 = 2·C<sub>oss,er</sub>（上下两个开关管输出电容之和）+
            C<sub>j</sub>（变压器原边等效寄生结电容），即
            <InlineMath latex="2C_{oss,er} + C_j" />（本站按能量口径直接写开，不另起符号）；
            <b>能量判据必须用 Co(er)</b>（能量相关等效），不能用 Co(tr) 或规格书标称 Coss。
            全桥拓扑同理为四个管子的输出电容折算值。电压取 V<sub>in,max</sub>（最恶劣工况）。
            <span className="text-primary-light">本节判据与本站「工作原理」页的 ZVS 能量条件一致。</span>
          </p>

          <HighlightBox type="info">
            <strong>三个容易混淆的 Coss 口径（选用前必读）：</strong>
            ① <b>Coss_tr ≡ 规格书 Co(tr)</b>（时间/电荷相关等效）：恒流充电下充到 V<sub>DS</sub> 所需
            <b>电荷相同</b>（故时间也相同），对应真实 Q<sub>oss</sub>(V)；
            <b>只用于死区的电荷/时间约束</b>（本站 Q<sub>max2</sub> 与 t<sub>ZVS</sub>）。
            ② <b>Coss_er ≡ 规格书 Co(er)</b>（能量相关等效）：充到 V<sub>DS</sub> 时<b>储能相同</b>；
            用于<b>能量型判据与损耗</b>（本站 E<sub>r</sub> ≥ E<sub>c</sub> 与硬开关 Coss 损耗
            E<sub>oss</sub> = ½·C<sub>oss,er</sub>V²）。
            ③ <b>规格书标称的 Coss</b>（多标在 0 V 或低压处）既不是①也不是②，数值明显偏大，
            <b>不能直接代入</b>。
          </HighlightBox>

          <p className="text-text-secondary mt-2 mb-2 text-sm leading-relaxed">
            <b>两个等效值都不是器件给出的独立参数，而是对同一条 C<sub>oss</sub>(V) 曲线积分得到的</b>：
            <b>Coss_tr = (1/V)·∫<sub>0</sub><sup>V</sup>C<sub>oss</sub>(v) dv</b>（等权平均 ⇒ 由<b>低压段主导</b>，
            因为低压处 C<sub>oss</sub> 最大）；<b>Coss_er = (2/V²)·∫<sub>0</sub><sup>V</sup>C<sub>oss</sub>(v)·v dv</b>
            （权重随 v 线性增大 ⇒ <b>向高压段偏移</b>，而高压处 C<sub>oss</sub> 最小）。
            因 C<sub>oss</sub> 随 V 单调递减，故恒有 <b>Coss_er &lt; Coss_tr</b>（实测比值约 0.4 ~ 0.7）；
            两者相等只出现在 C<sub>oss</sub> 与电压无关的极端理想情形，<b>比值须查规格书各自的 Co(tr)/Co(er)，不要互相代替</b>。
            <br />
            ⇒ 规格书若标注 <b>Co(tr)/Co(er)</b>，两者各自直接对应；若只给<b>单点 Coss</b>，
            则取自<b>高压 / 工作电压段</b>的那个值与 <b>Coss_er</b> 同侧（两者都偏重高压段），
            而标在 0 V / 低压处的大值两种口径都不是。
            <br />
            ⚠️ <b>「Co(eq)」本身是个有歧义的符号</b>：有的规格书把它等同于 Co(tr)，有的计算书用它表示
            「2·C<sub>tr</sub> + 寄生」这样的<b>整桥总量</b>。本站因此回避 <b>eq</b> 记法 ——
            时间口径统一写作 <b>Coss_tr</b>（≡ Co(tr)），总量统一写作计算书的 <b>C总 = 2·Coss_tr + Cj</b>（死区用）；
            能量侧不另起符号，直接写开
            <InlineMath latex="2C_{oss,er} + C_j" />。
          </p>

          <ParamTable>
            <ParamRow symbol="Coss_tr" name="时间相关等效输出电容（≡ Co(tr)）" unit="pF" description="单管值。由 Coss(V) 曲线积分得到：Coss_tr = (1/V)·∫Coss dv（等权平均，由低压段主导）。恒流充到 V_DS 的电荷/时间与真实 Coss 相同 ⇒ 用于死区时间约束；不是整桥总量" typical="查规格书 Co(tr)" />
            <ParamRow symbol="Coss_er" name="能量相关等效输出电容（≡ Co(er)）" unit="pF" description="单管值。由 Coss(V) 曲线积分得到：Coss_er = (2/V²)·∫Coss·v dv（按 v 加权，偏向高压段）。充到 V_DS 的储能与真实 Coss 相同 ⇒ 用于 ZVS 能量判据与硬开关 Coss 损耗（½·Coss_er·V²，定义式无需修正系数）。恒有 Coss_er < Coss_tr" typical="查规格书 Co(er)" />
            <ParamRow symbol="Cj" name="PCB / 变压器寄生电容" unit="pF" description="经验取值，随布板与变压器结构变；与两只管的 Coss 相加后构成总电容" typical="50 ~ 150 pF" />
            <ParamRow symbol="C总" name="死区时间用总电容" unit="pF" description="C总 = 2·Coss_tr + Cj（半桥）。死区的电荷/时间约束用它；⚠ 能量判据用的是 2·Coss_er + Cj，两者不是同一个电容" typical="数值求解" />
          </ParamTable>

          <p className="text-text-secondary mt-4 mb-2">
            其中关断时刻励磁电流峰值 I<sub>m,off</sub> 与最高工作频率 f<sub>max</sub> 相关：
          </p>

          <MathBlock
            latex="I_{m,off} = \\frac{V_{in,min}}{8 f_{max} L_m}  \\text{（半桥）}, \\qquad I_{m,off} = \\frac{V_{in,min}}{4 f_{max} L_m}  \\text{（全桥）}"
            label="励磁电流峰值"
          />

          <HighlightBox type="success">
            <strong>ZVS 实现要点：</strong>① 开关频率必须高于感性边界频率；② 死区时间内励磁电感释放的能量须大于开关节点寄生电容所需的充放电能量；③ 死区时间须足够长，能在 t<sub>d</sub> 内完成 C<sub>oss</sub> 充放电（t<sub>ZVS</sub> ≤ t<sub>d</sub>）；④ 实际设计取 Q<sub>s</sub> = m · Q<sub>max</sub> 保留裕量，m 默认 0.857（= 计算书算例的 α），可在设计工具页调整 —— m 越小，ZVS 能量与时间裕量越大。
          </HighlightBox>
        </FormulaSection>

        {/* Section 5: 设计流程公式 */}
        <FormulaSection
          id="design-flow"
          number={5}
          title="系统化设计流程公式"
          icon={<Calculator className="w-5 h-5" />}
        >
          <p className="text-text-secondary mt-4 mb-2">
            基于 FHA 模型的系统化设计流程：先由输入输出规格确定匝比与等效电阻，再由增益需求确定 k 与 Q，最后反解谐振腔元件参数。
          </p>

          <MathBlock
            latex="G_{max} = \\frac{V_{in,nom}}{V_{in,min}}, \\qquad G_{min} = \\frac{V_{in,nom}}{V_{in,max}}"
            label="所需电压增益范围"
          />

          <MathBlock
            latex="k_{max} = \\frac{G_{min}}{1 - G_{min}} \\; (G_{min} < 1), \\qquad G_{empty}(f_n \\to \\infty) = \\frac{k}{k + 1}"
            label="电感比 k 的空载降压约束"
          />

          <p className="text-text-secondary text-sm mt-2">
            最高输入电压空载时须将增益降至 G<sub>min</sub>：Region 1 空载增益下限为 k/(k+1)，故要求 k/(k+1) ≤ G<sub>min</sub>，即 k ≤ k<sub>max</sub>。若 k 超过该上限，即使频率无限升高输出仍会过压，设计不可行。
          </p>

          <MathBlock
            latex="f_{max} = f_{r1}\\sqrt{\\frac{G_{min}}{G_{min}(k+1) - k}} \\ \\ (G_{min} \\ge \\tfrac{k}{k+1}), \\qquad f_{min} = f_{r1}\\, f_n^{\\ast} \\ \\ \\text{其中}\\ M(f_n^{\\ast}, k, Q_s) = G_{max}"
            label="边界工作频率 —— fmax 取空载口径、fmin 取满载增益交点"
          />

          <p className="text-text-secondary text-sm mt-2">
            两者<b>口径并不对称，且系有意为之</b>：<b>f<sub>max</sub></b> 对应「最高输入电压 + 空载」这一降压最坏工况，
            由 Region 1 空载增益式反解；<b>f<sub>min</sub></b> 对应「最低输入电压 + 满载」这一升压最坏工况，
            取满载增益曲线 M = G<sub>max</sub> 与<b>峰值右侧</b>的交点（峰值左侧属折叠区，控制环无法稳定停留；
            轻载在同一增益要求下所需频率更高，故满载即全工况最低开关频率）。
          </p>

          <p className="text-text-secondary mt-4 mb-2">
            Q<sub>max</sub> 由两条<b>设计约束</b>（Q<sub>max1</sub> 增益能力、Q<sub>max2</sub> 死区时间）取最严者得到；
            第三条 ZVS 能量式（Q<sub>max3</sub>）是<b>空载 / 轻载校核</b>、不参与取小。三条定义式如下（与本工具计算引擎的实现逐字对应）：
          </p>

          <MathBlock
            latex="Q_{max1} = \\frac{1}{k\\,G_{max}}\\sqrt{k + \\frac{G_{max}^2}{G_{max}^2 - 1}} \\quad\\Longleftarrow\\quad M_{bnd}(f_n,k,Q) = G_{max}"
            label="约束一 · 感性区增益能力（默认：感容分界判据——令分界点增益 Mbnd = Gmax）"
          />

          <MathBlock
            latex="Q_{max2} = \\frac{2\\pi f_{r1}\\,t_d}{\\gamma\\,f_{max}\\,k\\,C_{\\text{总}}\\,R_{ac}}, \\qquad C_{\\text{总}} = 2C_{oss,eq} + C_j,\\quad \\gamma = 8\\,(\\text{半桥})/4\\,(\\text{全桥})"
            label="约束二 · 死区时间约束（死区内恰好完成 Coss 充放电：t_dead = γ·f_max·L_m·C总 = t_d）"
          />

          <MathBlock
            latex="Q_{max3} = \\frac{2\\pi f_{r1}\\,V_{in,min}^2}{\\gamma^2\\,f_{max}^2\\,k\\,(2C_{oss,er}+C_j)\\,V_{in,max}^2\\,R_{ac}}"
            label="约束三 · ZVS 能量校核（空载 / 轻载条件，不参与 Q_max 取小；γ = 8 半桥 / 4 全桥；总电容按能量口径写开 = 2Coss_er + Cj）"
          />

          <MathBlock
            latex="Q_{max} = \\min(Q_{max1}, Q_{max2}), \\qquad Q_s = m \\cdot Q_{max}"
            important
            label="最大允许 Q 与设计 Q（m 为裕量系数，默认 0.857）"
          />

          <p className="text-text-secondary text-sm mt-2 mb-2">
            <b>Q<sub>max</sub> 为什么只取 Q<sub>max1</sub>、Q<sub>max2</sub>：</b>
            Q<sub>max1</sub>（增益能力）与 Q<sub>max2</sub>（死区时间）都是<b>设计点（满载）</b>的约束；
            而 <b>Q<sub>max3</sub> 是空载 / 轻载的 ZVS 能量条件</b>（E<sub>r</sub> ≥ E<sub>c</sub>：用 f<sub>max</sub>
            即空载频率，并以 V<sub>in,min</sub> 求励磁电流、V<sub>in,max</sub> 求所需电荷，取最坏组合），
            它不属于设计点，故<b>不作设计约束</b>，只作为<b>独立校核</b>（其结论即 E<sub>r</sub> ≥ E<sub>c</sub> 的判定）。
            对物理上成立的输入（Coss_er ≤ Coss_tr）恒有 Q<sub>max3</sub> ≳ 3·Q<sub>max2</sub>
            ⇒ 它从不成为瓶颈，移出 min 不改变任何数值，只是把语义摆正。
          </p>

          <HighlightBox type="warning">
            <strong>死区时间约束即「约束二（Q<sub>max2</sub>）」本身。</strong>
            Q<sub>max2</sub> 的含义就是「死区内刚好把 C<sub>总</sub> 充放电用完 t<sub>d</sub>」所对应的 Q，
            所以 <b>t<sub>ZVS</sub> = m·t<sub>d</sub> ≤ t<sub>d</sub></b> 在 Q<sub>max2</sub> 生效时按构造成立，
            下面的 t<sub>ZVS</sub> 公式即退化为一致性复核（Q<sub>max2</sub> 未生效时它才是唯一把关项）：
          </HighlightBox>

          <MathBlock
            latex="t_{ZVS} = \\frac{C_{\\text{总}}\\,V_{in}}{I_{m,off}(V_{in})} \\equiv \\gamma\\,f_{max}\\,L_m\\,C_{\\text{总}} \\le t_d"
            label="死区时间校核：分子分母同为 Vin，Vin 精确相消 ⇒ t_ZVS 与输入电压无关；C总 = 2Coss_tr + Cj 用时间口径"
          />

          <p className="text-text-secondary text-sm mt-2">
            裕量系数 m 是 ZVS 两个裕量的直接旋钮：<b>t<sub>ZVS</sub> ∝ L<sub>m</sub> ∝ Q</b>，
            而 <b>ZVS 能量 E<sub>r</sub> ∝ 1/L<sub>m</sub> ∝ 1/Q</b>，所以调小 m（如 0.85）可同时放宽两者，
            代价是 L<sub>r</sub> 更小、C<sub>r</sub> 更大、励磁环流占比与导通损耗上升。
            因此当出现「ZVS 时间不足」告警时，应当<b>调小</b> m，而不是调大。
          </p>

          <MathBlock
            latex="Z_r = Q_s R_{ac}, \\quad L_r = \\frac{Q_s R_{ac}}{2\\pi f_{r1}}, \\quad C_r = \\frac{1}{2\\pi f_{r1} Q_s R_{ac}}, \\quad L_m = k L_r"
            important
            label="谐振腔参数计算"
          />

          {/* ⚠️ 这段整段说明必须放在 <ParamTable> **外面**：一旦作为表格的直接子元素，
              表格布局会把它当成一个单元格挤进第一列，被压成极窄的竖长条。
              凡是 HighlightBox / <p> / 说明性 div，都不得放进 ParamTable。 */}
          <HighlightBox type="info">
            <strong>增益的符号体系（G 系 vs M 系）：</strong>
            <b>G 系 = 设计需求</b>（"要多少增益"）—— G<sub>max</sub> 是<em>最低</em>输入所需的增益、
            G<sub>min</sub> 是<em>最高</em>输入所需的增益、G<sub>empty</sub> 是空载增益下限；
            <b>M 系 = 曲线能到多少</b> —— M 是增益曲线的纵轴、M<sub>peak</sub> 是峰顶、
            <b>M<sub>bnd</sub></b> 是感容分界点处的增益。两者都是电压增益，区别在"<b>要求</b>"与"<b>可实现</b>"。
            所以感性区增益上限叫 <b>M<sub>bnd</sub> 而不是 G<sub>bnd</sub></b>：它是 M 曲线上取的一个点、
            与纵轴 M 同族；叫 G<sub>bnd</sub> 会被误当成与 G<sub>max</sub>/G<sub>min</sub> 同类的需求值。
            M 也沿用 LLC 文献与计算书的通用写法（M = 2n·V<sub>o</sub>/V<sub>in</sub>）。
          </HighlightBox>

          <ParamTable>
<ParamRow symbol="Gempty" name="空载增益下限" unit="-" description="空载（Q→0）时 Region 1 的增益下限 k/(k+1)；Gmin 必须 ≥ 它，否则高输入空载降压不了（对应 k ≤ kmax）" typical="≈ 0.75 ~ 0.9" />
            <ParamRow symbol="Gmax" name="最大增益需求" unit="-" description="最低输入电压时所需的电压增益（Vin_nom / Vin_min）" typical="1.1 ~ 1.4" />
            <ParamRow symbol="Gmin" name="最小增益需求" unit="-" description="最高输入电压时所需的电压增益（Vin_nom / Vin_max）" typical="0.6 ~ 0.9" />
            <ParamRow symbol="Mpeak" name="峰值增益（曲线峰顶）" unit="-" description="给定 (k, Q) 下增益曲线的最大值（dM/dfn = 0）；⚠ 峰顶恒落在容性区，感性区内取不到此值" typical="数值求解" />
            <ParamRow symbol="Mbnd" name="感性区增益上限" unit="-" description="感容分界点（Im Zin = 0）处的增益；感性区内 M 随 fn 单调下降，此即真正可达的上限，判「够不够」须用此值" typical="数值求解" />
            <ParamRow symbol="Qmax1" name="增益能力约束 Q" unit="-" description="本站默认取【分界判据】：满足 Mbnd(k,Q) = Gmax 的最大 Q（数值二分，与教材闭式差 <1e-12）；表单可切换为【峰值判据】Mpeak = Gmax —— 该判据数值更宽松，但工作点已落在容性区，不推荐" typical="0.3 ~ 1.0" />
            <ParamRow symbol="Qmax2" name="死区时间约束 Q" unit="-" description="死区内刚好完成 C总 充放电（t_dead = td）对应的 Q；C总 = 2·Coss_tr + Cj（时间口径）" typical="0.3 ~ 1.5" />
            <ParamRow symbol="Qmax3" name="ZVS 能量校核 Q（空载 / 轻载）" unit="-" description="由励磁电感储能 ≥ 结电容总能量（2Coss_er + Cj：两只管之和 + 寄生）决定，Coss_er 为单管值。⚠️ 它是【空载/轻载】条件的独立校核，不参与 Qmax = min(Qmax1,Qmax2) 的取小" typical="数值求解" />
            <ParamRow symbol="Er" name="可提供的 ZVS 储能" unit="J" description="关断时刻励磁电感储存的能量 Er = ½·Lm·Im_off²（用 Vin_min 求 Im_off，取最坏）" typical="数十 μJ" />
            <ParamRow symbol="Ec" name="ZVS 所需能量" unit="J" description="把开关节点电容 C总 从 0 充/放到 Vin 所需能量 Ec = ½·(2·Coss_er + Cj)·Vin_max²（用 Vin_max，取最坏）；Er ≥ Ec 才够 ZVS" typical="数 μJ ~ 数十 μJ" />
            <ParamRow symbol="fmin" name="调频下限（满载低输入）" unit="Hz" description="满载增益曲线与 M = Gmax 的交点频率 —— 最低母线满载是最坏工况，需要最低频率" typical="数十 ~ 百余 kHz" />
            <ParamRow symbol="fmax" name="调频上限（空载降压）" unit="Hz" description="空载（Q→0）曲线与 M = Gmin 的交点频率；⚠ 与 fmin 取不同工况是有意为之（降压最坏在空载）" typical="百余 ~ 数百 kHz" />
            <ParamRow symbol="Qs" name="设计品质因数" unit="-" description="Qs = m · Qmax，m 为可设定裕量系数（默认 0.857 = 计算书算例的 α，在设计工具页「Q 裕量系数 m」调整）" typical="0.3 ~ 0.8" />
          </ParamTable>

          <HighlightBox type="warning">
            <strong>Q<sub>max1</sub> 必须由「感容分界点增益 ∩ G<sub>max</sub>」给出 —— 峰值增益点在容性区，不能用来限制：</strong>
            ① <b>感容分界点在峰值增益点的右边一点点</b>（实测右移 2%~15%，Q 越小差得越多）；分界点左侧为容性区、右侧为感性区。
            ② <b>峰值判据</b>（备选做法）：令增益曲线<b>峰顶</b> M<sub>peak</sub> = G<sub>max</sub>，
            只能保证「增益数值达标」，但那个峰顶本身已处于<b>容性区</b>，容性区<b>不允许工作</b>（无法 ZVS、环路不能稳定停留）。
            ③ 因此要<b>确保工作在感性区</b>，限制条件必须取<b>感容分界判据</b>：令分界点（Im Z<sub>in</sub> = 0）增益
            M<sub>bnd</sub> = G<sub>max</sub>；其精确解析解即教材闭式
            Q<sub>max1</sub> = 1/(k·G<sub>max</sub>)·√(k + G<sub>max</sub>²/(G<sub>max</sub>²−1)) —— <b>不是近似式</b>。
            本站默认采用分界判据；如需改用峰值判据，可在设计工具页表单「Qmax1 判据」切换。
          </HighlightBox>

          <HighlightBox type="info">
            <strong>设计流程：</strong>定义规格 → 计算匝比 n → 计算 R<sub>ac</sub> → 确定 G<sub>max</sub>/G<sub>min</sub> → 选取 k → 求解 Q<sub>max</sub> → 取 Q<sub>s</sub> → 解算 L<sub>r</sub>、C<sub>r</sub>、L<sub>m</sub> → 校验应力、损耗与磁密。
          </HighlightBox>
        </FormulaSection>

        {/* Section 6: 器件应力 */}
        <FormulaSection
          id="stress"
          number={6}
          title="功率器件应力"
          icon={<Zap className="w-5 h-5" />}
        >
          <p className="text-text-secondary mt-4 mb-2">
            合理的器件选型需要准确计算电压、电流应力，并预留足够的安全裕量。
          </p>

          <MathBlock
            latex="V_{ds,max} = V_{in,max}  \\text{（MOSFET 电压应力）}"
            label="原边 MOSFET"
          />

          <MathBlock
            latex="I_{p,rms} = \\sqrt{I_{r,rms}^2 + I_{m,rms}^2}, \\qquad I_{r,rms} = \\frac{V_{FHA,rms}}{R_{ac}}, \\qquad I_{m,rms} = \\frac{V_{Lm}}{4\\sqrt{3} f_{r1} L_m}"
            label="原边电流有效值"
          />

          <MathBlock
            latex="V_{RRM} = 2V_o  \\text{（中心抽头）}, \\qquad V_{RRM} = V_o  \\text{（全桥/全波）}"
            label="副边整流二极管电压应力"
          />

          <MathBlock
            latex="I_{sec,rms} = \\frac{\\pi}{4} I_o  \\text{（中心抽头）}, \\qquad I_{sec,rms} = \\frac{\\pi}{2\\sqrt{2}} I_o  \\text{（全波/全桥）}"
            label="副边绕组电流有效值"
          />

          <ParamTable>
            <ParamRow symbol="Vds_max" name="MOSFET 耐压" unit="V" description="关断时承受的最大漏源电压" typical="等于输入电压最大值" />
            <ParamRow symbol="Ip_rms" name="原边总电流有效值" unit="A" description="流过 Lr、Cr 与变压器原边绕组的电流（Ir_rms 与 Im_rms 的方和根）" typical="-" />
            <ParamRow symbol="Ir_rms" name="谐振电流有效值" unit="A" description="FHA 等效模型中流入负载支路（Rac）的电流分量；非 Lr/Cr 支路的实际电流" typical="-" />
            <ParamRow symbol="Im_rms" name="励磁电流有效值" unit="A" description="仅流过变压器励磁电感的电流" typical="-" />
            <ParamRow symbol="Im_off" name="关断时刻励磁电流峰值" unit="A" description="副边换流完毕后原边只剩励磁电流，关断就发生在这一刻 ⇒ 它既用于 ZVS 储能 Er，也用于关断损耗 P_off（不是谐振峰值电流）" typical="0.2 ~ 0.5 A" />
            <ParamRow symbol="VRRM" name="整流管反向耐压" unit="V" description="二极管/同步整流管关断时承受的反向电压" typical="2Vo 或 Vo" />
            <ParamRow symbol="Isec_rms" name="副边电流有效值" unit="A" description="每个副边绕组或整流支路的电流" typical="0.785 Io 或 1.11 Io" />
          </ParamTable>

          <HighlightBox type="warning">
            <strong>选型裕量：</strong>MOSFET 电压定额建议留 1.5 ~ 2 倍裕量；电流定额在计算有效值基础上预留约 40% 裕量，以应对瞬态冲击、温升及器件参数离散性。
          </HighlightBox>
        </FormulaSection>

        {/* Section 7: 损耗估算 */}
        <FormulaSection
          id="losses"
          number={7}
          title="损耗估算模型"
          icon={<Activity className="w-5 h-5" />}
        >
          <p className="text-text-secondary mt-4 mb-2">
            LLC 的高效率得益于软开关，但仍需对 MOSFET、整流、磁性元件等损耗进行估算，以优化热设计和效率。
          </p>

          <p className="text-text-secondary mt-2 mb-2">
            下列各式与设计工具页「损耗分析」面板<b>逐项对应</b>（同一套口径）：N<sub>sw</sub> 为 MOSFET 数
            （半桥 2 / 全桥 4），k<sub>T</sub> 为 R<sub>ds(on)</sub> 的温度修正系数（<b>原边与同步整流共用</b>），
            N<sub>rect</sub> 为整流器件数（中心抽头 2 / 全波桥 4），t<sub>ZVS</sub> 见上一节的死区校验式。
          </p>

          <div className="grid md:grid-cols-2 gap-4 my-4">
            <div className="p-4 rounded-lg border border-border bg-surface-elevated/30">
              <p className="text-text-muted text-xs uppercase tracking-wider mb-2">MOSFET 导通损耗</p>
              <MathBlock latex="P_{cond} = \\tfrac{1}{2}\\, I_{p,rms}^2 R_{ds(on)} k_T N_{sw}" />
            </div>
            <div className="p-4 rounded-lg border border-border bg-surface-elevated/30">
              <p className="text-text-muted text-xs uppercase tracking-wider mb-2">MOSFET 开通损耗</p>
              <MathBlock latex="P_{on} = \\tfrac{1}{2} V_{in} I_{p,peak} t_{cr,on} f_{sw} N_{sw} \\quad (\\text{ZVS 下} \\approx 0)" />
            </div>
            <div className="p-4 rounded-lg border border-border bg-surface-elevated/30">
              <p className="text-text-muted text-xs uppercase tracking-wider mb-2">MOSFET 关断损耗</p>
              <MathBlock latex="P_{off} = \\tfrac{1}{2} V_{in} I_{m,off} t_{cr,off} f_{sw} N_{sw}" />
            </div>
            <div className="p-4 rounded-lg border border-border bg-surface-elevated/30">
              <p className="text-text-muted text-xs uppercase tracking-wider mb-2">交叉时间（由栅极回路算出）</p>
              <MathBlock latex="t_{cr} = \frac{Q_{plat} R_g}{\Delta V_{gate}}, \quad \Delta V_{gate} = V_{plat}\ (\text{关断}),\ V_{drv} - V_{plat}\ (\text{开通})" />
            </div>
            <div className="p-4 rounded-lg border border-border bg-surface-elevated/30">
              <p className="text-text-muted text-xs uppercase tracking-wider mb-2">平台电荷的两种取法（等价）</p>
              <MathBlock latex="Q_{plat} = Q_{gd}\ \ (\text{法一，默认})" />
              <MathBlock latex="Q_{plat} = \overline{C}_{rss}\, V_{DS}, \quad \overline{C}_{rss} = \frac{1}{V_{DS}}\int_0^{V_{DS}} C_{rss}(V)\,dV\ \ (\text{法二})" />
            </div>
            <div className="p-4 rounded-lg border border-border bg-surface-elevated/30">
              <p className="text-text-muted text-xs uppercase tracking-wider mb-2">体二极管导通损耗</p>
              <MathBlock latex="P_{diode} = V_{sd} I_{m,off} (t_d - t_{ZVS}) f_{sw} N_{sw}" />
            </div>
            <div className="p-4 rounded-lg border border-border bg-surface-elevated/30">
              <p className="text-text-muted text-xs uppercase tracking-wider mb-2">副边整流电流口径（中心抽头 / 全桥共用）</p>
              <MathBlock latex="I_{s,sw} = \\frac{\\pi}{4} I_o, \\qquad N_{rect} = 2\\ (\\text{中心抽头}) \\ / \\ 4\\ (\\text{全波桥})" />
            </div>
            <div className="p-4 rounded-lg border border-border bg-surface-elevated/30">
              <p className="text-text-muted text-xs uppercase tracking-wider mb-2">整流损耗（同步须乘 kT）</p>
              <MathBlock latex="P_{rect} = N_{rect} I_{s,sw}^2 R_{ds(on)} k_T\ \ (\text{同步整流})" />
              <MathBlock latex="P_{rect} = N_{rect} V_f \frac{I_o}{2}\ \ (\text{二极管整流；}V_f\text{ 取自设计参数})" />
            </div>
            <div className="p-4 rounded-lg border border-border bg-surface-elevated/30">
              <p className="text-text-muted text-xs uppercase tracking-wider mb-2">磁芯损耗（默认走手册法）</p>
              <MathBlock latex="P_{core} = P_{cv} V_e k_{wave}\ \ (\text{手册法，默认})" />
              <MathBlock latex="P_{core} = C_m f_{sw}^{\alpha} B_{peak}^{\beta} V_e\ \ (\text{Steinmetz 对照})" />
            </div>
          </div>

          <MathBlock
            latex="B_{peak} = \\frac{V_p}{4 N_p A_e f_{sw}}, \\qquad P_{Cu} = I_{p,rms}^2 R_{dc,pri}\\left[1 + (f_{sw}/f_0)^2\\right]"
            label="磁密与原边铜损"
          />

          <MathBlock
            latex="P_{res} = \\underbrace{I_{p,rms}^2 R_{dc,Lr}}_{\\text{Lr 铜损}} + \\underbrace{P_{cv,Lr} V_{e,Lr}}_{\\text{Lr 铁损（正弦，不乘 } k_{wave}\\text{）}} + \\underbrace{I_{p,rms}^2 R_{esr,Cr}}_{\\text{Cr 损耗}}"
            label="谐振元件损耗（三项）"
          />

          <HighlightBox type="warning">
            <strong>开关损耗的交叉时间 t<sub>cr</sub> 必须算，不能抄规格书的 t<sub>r</sub>/t<sub>f</sub>：</strong>
            规格书的 t<sub>r</sub>/t<sub>f</sub> 是<b>特定测试条件</b>下（如 V<sub>DD</sub>=400 V、I<sub>D</sub>≈5 A、R<sub>G</sub>=10 Ω、V<sub>GS</sub>=10 V）
            测得的<b>漏极电流 10%↔90% 过渡时间</b>；而损耗积分 <InlineMath latex="\int v\,i\,dt" /> 需要的是
            <b>V<sub>DS</sub> 与 I<sub>D</sub> 重叠（米勒平台）的时长</b> —— 测试条件不同、物理量也不是同一个。
            正确做法是按栅极电荷守恒算：米勒平台期间栅压恒定在 V<sub>plat</sub>，栅极电流
            <InlineMath latex="I_g = \Delta V_{gate}/R_g" />，移走平台电荷 Q<sub>plat</sub> 所需时间
            <InlineMath latex="t_{cr} = Q_{plat} R_g / \Delta V_{gate}" />。
            其中 R<sub>g</sub> 取<b>回路总电阻</b>（器件内部 R<sub>G</sub> + 外部 R<sub>g</sub> + 驱动阻抗），
            不是规格书测试条件里的那个 10 Ω。
            <br />
            ⚠️ 本项偏乐观之处：V<sub>plat</sub> 取自规格书栅荷曲线，其测试电流远大于 LLC 的关断电流
            （本设计关断电流只有励磁电流量级）⇒ 实际平台电压略低、交叉时间略长。有实测平台电压时应填实测值。
          </HighlightBox>

          <HighlightBox type="warning">
            <strong>平台电荷 Q<sub>plat</sub> 的两种取法（等价，可互校）：</strong>
            两者本质相同 —— 都是「把 V<sub>DS</sub> 从 0 推到摆幅电压所需搬走的栅-漏电荷」：
            <br />
            <b>法一 · Q<sub>gd</sub> 法（默认，推荐）：</b>直接取规格书栅荷曲线的
            <b>Q<sub>gd</sub></b>。它<b>本身就是厂商实测的 ∫Crss dV</b>（平台段电荷），
            且其测试电压（如 V<sub>DD</sub> = 520 V）通常贴近实际母线 ⇒ 误差最小。
            <br />
            <b>法二 · Crss 积分法（备选）：</b>
            <InlineMath latex="Q_{plat} = \bar{C}_{rss}\, V_{DS}" />，其中
            <InlineMath latex="\bar{C}_{rss} = \frac{1}{V_{DS}}\int_0^{V_{DS}} C_{rss}(V)\,dV" />
            是<b>对 Crss(V) 曲线积分后再除以电压</b>得到的等效电容。
            <br />
            ⚠️ <b>法二最容易错的地方：用「某一点的 Crss」代替「积分平均」。</b>
            Crss 在近 0 V 段可达成百上千 pF（规格书曲线左端），积分主要由那一段贡献，
            而规格书表格给出的常是 100 V、600 V 这类<b>高压段单点值</b>（只有 0.5~2 pF）——
            直接代入会把平台电荷低估一个数量级、交叉时间与关断损耗同步低估。
            <br />
            实测对照（650 V 器件、400 V 母线、R<sub>g</sub> = 12 Ω、V<sub>plat</sub> = 4 V）：

            <div className="mt-2 overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="text-text-muted">
                  <tr>
                    <th className="text-left py-1 pr-3 font-medium">取法</th>
                    <th className="text-left py-1 pr-3 font-medium">平台电荷 Q<sub>plat</sub></th>
                    <th className="text-left py-1 pr-3 font-medium">关断交叉时间 t<sub>cr,off</sub></th>
                  </tr>
                </thead>
                <tbody className="font-mono text-text-secondary">
                  <tr className="border-t border-border/50">
                    <td className="py-1 pr-3">Q<sub>gd</sub> 法（规格书实测 6.3 nC @520 V）</td>
                    <td className="py-1 pr-3">6.3 nC（折算 0→400 V 约 6.1 nC）</td>
                    <td className="py-1 pr-3">18.9 ns ← 真值量级</td>
                  </tr>
                  <tr className="border-t border-border/50">
                    <td className="py-1 pr-3">Crss 积分法（等效 ≈15 pF × 400 V）</td>
                    <td className="py-1 pr-3">≈6.1 nC</td>
                    <td className="py-1 pr-3">18.4 ns ✓ 与法一差 3%</td>
                  </tr>
                  <tr className="border-t border-border/50 text-amber-300">
                    <td className="py-1 pr-3">✗ 误用单点 Crss(600 V) ≈2 pF × 400 V</td>
                    <td className="py-1 pr-3">0.80 nC</td>
                    <td className="py-1 pr-3">2.4 ns —— 低估约 8 倍</td>
                  </tr>
                  <tr className="border-t border-border/50 text-amber-300">
                    <td className="py-1 pr-3">✗ 误用单点 Crss(100 V) 0.86 pF × 400 V</td>
                    <td className="py-1 pr-3">0.34 nC</td>
                    <td className="py-1 pr-3">1.0 ns —— 低估约 18 倍</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <br />
            <b>结论</b>：两种方法<b>都能用</b>，前提是「法二必须真的做积分」。
            有 Q<sub>gd</sub> 时优先用它（厂商已替你积分且条件贴近实际）；只有电容曲线、没有栅荷曲线时，
            才自己按曲线积分求 <InlineMath latex="\bar{C}_{rss}" />，并用法一或 Q<sub>g</sub> 量级复核。
            设计工具页的「平台电荷取法」可切换，并会把两法的 Q 与 t<sub>cr</sub> 并列显示，便于互校。
          </HighlightBox>

          <HighlightBox type="warning">
            <strong>整流与谐振元件损耗的三处易错口径：</strong>
            ① <b>N<sub>rect</sub> 与 I<sub>s,sw</sub> 必须同一口径</b> —— I<sub>s,sw</sub> 是「每个整流器件整周期的 RMS」，
            两种拓扑下都等于 (π/4)·I<sub>o</sub>：中心抽头绕组本身只导通半波（RMS = π·I<sub>o</sub>/4，直接就是每管值），
            全波桥的<b>绕组</b> RMS 是 π·I<sub>o</sub>/(2√2)，但每个管只导半周 ⇒ 再除 √2 后同样落到 π·I<sub>o</sub>/4。
            若把中心抽头按「绕组 RMS 再除一次 √2」处理，功率会<b>整整少算一半</b>；
            ② <b>同步整流的 R<sub>ds(on)</sub> 同为 25℃ 值</b>，须与原边一样乘 k<sub>T</sub>；
            ③ <b>Lr 铁损不乘 k<sub>wave</sub></b> —— 谐振电感是正弦激励，手册 P<sub>cv</sub> 曲线本就按正弦标定，
            k<sub>wave</sub> 修的是「手册正弦标定 vs 变压器方波励磁」的差异，套到 Lr 上只会虚增。
          </HighlightBox>

          <HighlightBox type="warning">
            <strong>Coss 损耗的电容口径：</strong>
            硬开关（非 ZVS）时 Coss 储能全部在开通瞬间由沟道耗散，
            <b>必须用能量相关等效电容 C<sub>oss,er</sub>（≡ 规格书 Co(er)）</b>：
            <InlineMath latex="E_{oss} = \frac{1}{2} C_{oss,er} V_{DS}^2" />
            是 C<sub>oss,er</sub> 的<b>定义式</b>，不需要任何「非线性修正系数」。
            用时间口径的 Co(tr)、或规格书标称 Coss（多为 0 V 值）都会算错。
            本站 C<sub>oss,er</sub> 取自<b>设计参数</b>（单一来源，与死区时间 t<sub>d</sub> 同一做法）。
          </HighlightBox>

          <HighlightBox type="warning">
            <strong>与「工具」的两处有意差异：</strong>
            ① <b>栅极驱动损耗</b> <InlineMath latex="P_{drv} = Q_g V_{drv} f_{sw}" /> 是真实损耗，
            但本工具的损耗模型<b>未计入该项</b>（需驱动电压与 Q<sub>g</sub>，属器件级细节），此处仅列式供设计参考；
            ② 磁芯损耗给出<b>两条口径</b> —— 工具默认用「手册 P<sub>cv</sub> 法」（更贴近实测），
            Steinmetz 拟合作为并列对照值同时显示。
          </HighlightBox>

          <ParamTable>
            <ParamRow symbol="Rds(on)" name="MOSFET 导通电阻" unit="mΩ" description="25℃ 规格书值；实际导通损耗按 ×kT 折算到结温" typical="mΩ 级" />
            <ParamRow symbol="kT" name="Rds(on) 温度修正系数" unit="-" description="硅管 100℃ 时约为 25℃ 值的 1.5~2.0 倍，工具默认 1.6" typical="1.5 ~ 2.0" />
            <ParamRow symbol="tcr" name="开关交叉时间（米勒平台时长）" unit="ns" description="t_cr = Q_plat·R_g/ΔV_gate；关断 ΔV = V_plat、开通 ΔV = V_drv − V_plat。平台电荷 Q_plat 有两种等价取法（Q_gd 法 / Crss 积分法，见上方警示框）。★ 不能用规格书 t_r/t_f 代替：那是特定测试条件下的漏极电流过渡时间，既非本机工况也不是 V·I 重叠时长" typical="10 ~ 40 ns" />
            <ParamRow symbol="Qgd" name="米勒电荷" unit="nC" description="规格书栅荷曲线的 Q_gd（平台段电荷），交叉时间公式的分子" typical="查规格书栅荷曲线" />
            <ParamRow symbol="Vplat" name="米勒平台电压" unit="V" description="同一条栅荷曲线的平台电压；规格书值多在较大测试电流下取得，低电流实际值略低" typical="V_th ~ 6 V" />
            <ParamRow symbol="Rg" name="栅极回路总电阻" unit="Ω" description="器件内部 R_G + 外部 R_g + 驱动上/下拉阻抗；⚠ 不是规格书 t_r/t_f 测试条件里的 10 Ω" typical="5 ~ 20 Ω" />
            <ParamRow symbol="Vdrv" name="驱动电平" unit="V" description="开通交叉时间用 ΔV = V_drv − V_plat；关断按栅极被拉到 0 处理" typical="10 ~ 15 V" />
            <ParamRow symbol="Crss_eq" name="等效反向传输电容（Crss 积分法用）" unit="pF" description="= ∫Crss(V)dV ÷ V_DS（面积÷电压）。★ 不是规格书某一点的 Crss：低压段 Crss 可达成百上千 pF，积分主要由 0~25 V 段贡献，等效值通常有十几 pF；填高压段单点值（0.5~2 pF）会把平台电荷低估近一个数量级" typical="10 ~ 20 pF" />
            <ParamRow symbol="VDS_swing" name="平台对应的 V_DS 摆幅（Crss 积分法用）" unit="V" description="关断时器件由 0 承压到母线电压，故一般就填母线 Vin；保守可取器件耐压（会偏保守）" typical="= Vin" />
            <ParamRow symbol="Qg" name="栅极电荷" unit="nC" description="仅用于驱动损耗参考式；工具损耗模型未计入该项" typical="datasheet 值" />
            <ParamRow symbol="Nrect" name="整流器件数" unit="个" description="同时参与导通的整流器件总数：中心抽头 2 / 全波桥 4（二极管与同步整流同一套数）" typical="2 或 4" />
            <ParamRow symbol="Is_sw" name="单个整流器件电流 RMS" unit="A" description="整周期内每个整流器件的电流有效值；两种拓扑同为 (π/4)·Io ≈ 0.785 Io" typical="0.785 Io" />
            <ParamRow symbol="Vf" name="整流管压降（= 设计参数值）" unit="V" description="单管压降；与匝比 n 用的是同一个数（单一来源）。二极管 0.6~1.2 V，同步整流按 Io·Rds(on) 折算后通常填 0" typical="0 / 0.6 ~ 1.2 V" />
            <ParamRow symbol="Pcv_Lr" name="Lr 磁芯损耗密度（手册值）" unit="mW/cm³" description="按 Lr 实际磁牌号与 B_Lr 查手册；随「磁芯材料」按 Pcv_ref×(B_Lr/0.2 T)^β 自动折算（B_Lr≈0.165 T；默认牌号 PC95 ⇒ 173）。正弦激励，不乘 k_wave" typical="查手册" />
            <ParamRow symbol="Ve_Lr" name="Lr 磁芯有效体积" unit="cm³" description="默认取变压器 Ve 的 1/4（谐振电感体积通常为变压器的 1/5~1/4）" typical="1 ~ 2 cm³" />
            <ParamRow symbol="k_wave" name="波形修正系数" unit="-" description="手册曲线多为正弦标定，LLC 变压器为方波励磁，工具默认 1.25；⚠ 仅用于变压器磁芯，Lr 不用" typical="1.2 ~ 1.4" />
            <ParamRow symbol="Cm, α, β" name="Steinmetz 系数（对照口径）" unit="mW·cm⁻³·kHz⁻ᵃ·mT⁻ᵝ" description="正弦激励拟合系数，方波励磁下有偏差，仅作并列对照" typical="查磁芯 datasheet" />
            <ParamRow symbol="Bpeak" name="磁芯峰值磁通密度" unit="T" description="变压器磁芯中的磁通密度峰值" typical="0.1 ~ 0.3 T" />
            <ParamRow symbol="Np" name="原边匝数" unit="匝" description="变压器原边绕组匝数" typical="按 Ae 与 B 设计" />
            <ParamRow symbol="Ns" name="副边匝数" unit="匝" description="副边半绕组匝数（中心抽头按半绕组计）；n = Np/Ns" typical="按 n 与整流拓扑确定" />
            <ParamRow symbol="Ae" name="磁芯有效截面积" unit="m²" description="磁芯几何有效截面积" typical="datasheet 值" />
            <ParamRow symbol="td" name="死区时间" unit="ns" description="取自设计参数（单一来源）；决定体二极管净导通时间 td − tZVS" typical="100 ~ 400 ns" />
            <ParamRow symbol="tZVS" name="ZVS 换流所需时间" unit="ns" description="死区内把 C总 充/放完所需时间 t_ZVS = γ·f_max·Lm·C总（γ = 8 半桥 / 4 全桥）；Vin 精确相消 ⇒ 与输入电压无关。判据 t_ZVS ≤ td" typical="150 ~ 350 ns" />
          </ParamTable>

          <HighlightBox type="info">
            <strong>效率估算：</strong>总损耗为各部分损耗之和，η = Po / (Po + Ploss_total) × 100%。实际工程中建议结合热仿真和样机测试进行校准。
          </HighlightBox>

          <HighlightBox type="info">
            <strong>本节范围说明：</strong>以上为 FHA 参数与损耗的估算模型。
            <b>环路补偿设计</b>（功率级传函 G<sub>p</sub>(s)；Type II 补偿器
            G<sub>c</sub>(s) = K(1 + s/ω<sub>z1</sub>)/[s(1 + s/ω<sub>p1</sub>)]，Type III 为
            K(1 + s/ω<sub>z1</sub>)(1 + s/ω<sub>z2</sub>)/[s(1 + s/ω<sub>p1</sub>)(1 + s/ω<sub>p2</sub>)]；
            以及 K-factor 法 f<sub>z</sub> = f<sub>c</sub>/K、f<sub>p</sub> = K·f<sub>c</sub> 与 R/C 反解）
            属<b>独立子系统</b>，本文未展开 —— 请见设计工具页的「环路补偿设计」面板，那里给出完整传函、
            补偿器选型与元件反解计算。
          </HighlightBox>
        </FormulaSection>

        {/* Section 8: 参数速查表 */}
        <FormulaSection
          id="quick-reference"
          number={8}
          title="参数速查表"
          icon={<Sigma className="w-5 h-5" />}
          defaultOpen={true}
        >
          <p className="text-text-secondary mt-4 mb-2">
            下表汇总 LLC 设计中最常用的公式，便于快速查阅。
          </p>

          <div className="overflow-x-auto my-4 rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-surface-elevated text-text-secondary">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">类别</th>
                  <th className="px-4 py-3 text-left font-semibold">公式</th>
                  <th className="px-4 py-3 text-left font-semibold">说明</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-text-secondary">
                <tr className="hover:bg-surface-elevated/30">
                  <td className="px-4 py-3 text-text-primary font-medium">谐振频率</td>
                  <td className="px-4 py-3"><InlineMath latex="f_{r1} = \\frac{1}{2\\pi\\sqrt{L_r C_r}}" /></td>
                  <td className="px-4 py-3">串联谐振频率</td>
                </tr>
                <tr className="hover:bg-surface-elevated/30">
                  <td className="px-4 py-3 text-text-primary font-medium">第二谐振</td>
                  <td className="px-4 py-3"><InlineMath latex="f_{r2} = \\frac{f_{r1}}{\\sqrt{1 + k}}" /></td>
                  <td className="px-4 py-3">含励磁电感的谐振频率</td>
                </tr>
                <tr className="hover:bg-surface-elevated/30">
                  <td className="px-4 py-3 text-text-primary font-medium">电感比</td>
                  <td className="px-4 py-3"><InlineMath latex="k = \\frac{L_m}{L_r}" /></td>
                  <td className="px-4 py-3">典型 5 ~ 7</td>
                </tr>
                <tr className="hover:bg-surface-elevated/30">
                  <td className="px-4 py-3 text-text-primary font-medium">特征阻抗</td>
                  <td className="px-4 py-3"><InlineMath latex="Z_r = \\sqrt{\\frac{L_r}{C_r}}" /></td>
                  <td className="px-4 py-3">谐振腔阻抗尺度</td>
                </tr>
                <tr className="hover:bg-surface-elevated/30">
                  <td className="px-4 py-3 text-text-primary font-medium">品质因数</td>
                  <td className="px-4 py-3"><InlineMath latex="Q = \\frac{Z_r}{R_{ac}}" /></td>
                  <td className="px-4 py-3">负载越重 Q 越大</td>
                </tr>
                <tr className="hover:bg-surface-elevated/30">
                  <td className="px-4 py-3 text-text-primary font-medium">FHA 增益</td>
                  <td className="px-4 py-3"><InlineMath latex="M = \\frac{1}{\\sqrt{\\left(1+\\frac{1}{k}-\\frac{1}{k f_n^2}\\right)^2 + \\left(Q\\left(f_n-\\frac{1}{f_n}\\right)\\right)^2}}" /></td>
                  <td className="px-4 py-3">标准电压增益</td>
                </tr>
                <tr className="hover:bg-surface-elevated/30">
                  <td className="px-4 py-3 text-text-primary font-medium">匝比（半桥）</td>
                  <td className="px-4 py-3"><InlineMath latex="n = \\frac{V_{in,nom}}{2(V_o + V_f)}" /></td>
                  <td className="px-4 py-3">考虑整流压降</td>
                </tr>
                <tr className="hover:bg-surface-elevated/30">
                  <td className="px-4 py-3 text-text-primary font-medium">等效电阻</td>
                  <td className="px-4 py-3"><InlineMath latex="R_{ac} = \\frac{8n^2 V_o^2}{\\pi^2 P_o}" /></td>
                  <td className="px-4 py-3">全波整流折算</td>
                </tr>
                <tr className="hover:bg-surface-elevated/30">
                  <td className="px-4 py-3 text-text-primary font-medium">谐振电感</td>
                  <td className="px-4 py-3"><InlineMath latex="L_r = \\frac{Q_s R_{ac}}{2\\pi f_{r1}}" /></td>
                  <td className="px-4 py-3">由 Q 反推</td>
                </tr>
                <tr className="hover:bg-surface-elevated/30">
                  <td className="px-4 py-3 text-text-primary font-medium">谐振电容</td>
                  <td className="px-4 py-3"><InlineMath latex="C_r = \\frac{1}{2\\pi f_{r1} Q_s R_{ac}}" /></td>
                  <td className="px-4 py-3">由 Q 反推</td>
                </tr>
                <tr className="hover:bg-surface-elevated/30">
                  <td className="px-4 py-3 text-text-primary font-medium">励磁电感</td>
                  <td className="px-4 py-3"><InlineMath latex="L_m = k L_r" /></td>
                  <td className="px-4 py-3">决定 ZVS 能量</td>
                </tr>
                <tr className="hover:bg-surface-elevated/30">
                  <td className="px-4 py-3 text-text-primary font-medium">ZVS 能量</td>
                  <td className="px-4 py-3"><InlineMath latex="\\frac{1}{2} L_m I_{m,off}^2 \\geq \\frac{1}{2} (2C_{oss,er} + C_j) V_{in,max}^2" /></td>
                  <td className="px-4 py-3">确保零电压开通</td>
                </tr>
              </tbody>
            </table>
          </div>
        </FormulaSection>
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
            <h3 className="font-semibold text-text-primary mb-2">使用说明</h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              以上公式均基于 FHA（一阶谐波近似）模型，适用于 LLC 谐振变换器的初步设计与参数分析。实际工程中建议结合本工具的“设计工具”页面进行数值计算，并通过“特性曲线”页面观察增益、阻抗随频率的变化趋势，最后利用“报告输出”页面生成完整设计文档。
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
