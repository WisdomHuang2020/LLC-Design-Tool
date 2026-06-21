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
            latex="f_r = \\frac{1}{2\\pi\\sqrt{L_r C_r}}, \\quad f_m = \\frac{f_r}{\\sqrt{1 + k}}, \\quad k = \\frac{L_m}{L_r}, \\quad Z_0 = \\sqrt{\\frac{L_r}{C_r}}, \\quad Q = \\frac{Z_0}{R_{ac}}, \\quad f_n = \\frac{f_s}{f_r}"
            important
            label="LLC 核心参数定义"
          />

          <ParamTable>
            <ParamRow symbol="L_r" name="谐振电感" unit="H" description="与谐振电容共同决定串联谐振频率，通常为变压器漏感或外接电感" typical="数十 μH ~ 数百 μH" />
            <ParamRow symbol="C_r" name="谐振电容" unit="F" description="谐振腔串联电容，承受谐振电流交流分量" typical="nF ~ 数十 nF" />
            <ParamRow symbol="L_m" name="励磁电感" unit="H" description="变压器励磁电感，参与第二谐振频率并影响 ZVS 能量" typical="数百 μH ~ 数 mH" />
            <ParamRow symbol="f_r" name="第一谐振频率" unit="Hz" description="L_r 与 C_r 的串联谐振频率，也是负载独立点" typical="100 kHz ~ 500 kHz" />
            <ParamRow symbol="f_m" name="第二谐振频率" unit="Hz" description="(L_r + L_m) 与 C_r 的谐振频率，f_m = f_r / √(1+k)" typical="0.3 f_r ~ 0.5 f_r" />
            <ParamRow symbol="k" name="电感比" unit="-" description="L_m / L_r，决定两个谐振频率间距与峰值增益能力" typical="3 ~ 10（常用 5 ~ 7）" />
            <ParamRow symbol="Z_0" name="特征阻抗" unit="Ω" description="谐振腔阻抗尺度，Z_0 = √(L_r/C_r)" typical="数十 Ω ~ 数百 Ω" />
            <ParamRow symbol="Q" name="品质因数" unit="-" description="反映负载轻重，Q = Z_0 / R_ac；负载越重 Q 越大" typical="0.3 ~ 1.0" />
            <ParamRow symbol="f_n" name="归一化频率" unit="-" description="开关频率相对谐振频率的比值 f_s / f_r" typical="0.5 ~ 1.5" />
          </ParamTable>

          <HighlightBox type="info">
            <strong>工作区域划分：</strong>当 f_n = 1 时，LLC 增益恒为 1 且与负载无关；f_n &lt; 1 时进入降压增益区（Region 2），可提供峰值增益；f_n &gt; 1 时进入降压区（Region 1），增益随频率升高而下降。
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
            latex="M(f_n, k, Q) = \\frac{f_n^2 k}{\\sqrt{\\left[f_n^2(k+1) - 1\\right]^2 + k^2 Q^2 (f_n^2 - 1)^2}}"
            label="FHA 增益的等价形式"
          />

          <ParamTable>
            <ParamRow symbol="M" name="电压增益" unit="-" description="输出电压折算值与输入电压基波分量的比值" typical="0.5 ~ 1.5" />
            <ParamRow symbol="f_n" name="归一化频率" unit="-" description="f_s / f_r，调频控制的核心变量" typical="0.5 ~ 1.5" />
            <ParamRow symbol="k" name="电感比" unit="-" description="L_m / L_r，影响峰值增益与增益曲线斜率" typical="3 ~ 10" />
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
              <MathBlock latex="M_{empty}(f_n, k) = \\frac{1}{\\left|1 - \\frac{1}{f_n^2(1 + k)}\\right|}" />
              <p className="text-text-secondary text-sm mt-2">Q → 0 时的极限增益，用于评估轻载稳定性。</p>
            </div>
          </div>

          <HighlightBox type="warning">
            <strong>FHA 适用范围：</strong>仅当开关频率接近谐振频率且谐振腔 Q 值较高时精度较好。当 f_n 远离 1 或波形畸变严重时，需使用时域仿真或高次谐波修正模型。
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
            <ParamRow symbol="V_{in,nom}" name="额定输入电压" unit="V" description="变换器标称直流输入电压" typical="380 V / 400 Vdc" />
            <ParamRow symbol="V_o" name="输出电压" unit="V" description="额定输出直流电压" typical="12 V / 24 V / 48 V" />
            <ParamRow symbol="V_f" name="整流管压降" unit="V" description="二极管或同步整流管的导通压降" typical="0.3 ~ 0.7 V（二极管）" />
            <ParamRow symbol="R_L" name="直流负载电阻" unit="Ω" description="R_L = V_o² / P_o" typical="随输出功率变化" />
            <ParamRow symbol="R_{ac}" name="等效交流电阻" unit="Ω" description="折算到原边的交流负载，用于 FHA 等效电路" typical="数十 Ω ~ 数百 Ω" />
          </ParamTable>

          <HighlightBox type="info">
            <strong>折算关系：</strong>副边基波电压有效值 V<sub>sec,1</sub> = (2√2/π) · V_o，基波电流有效值 I<sub>sec,1</sub> = (π/2√2) · I_o。折算到原边后得到 R<sub>ac</sub> = 8n²R_L / π²。
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
            latex="Z_{in} = jZ_0\\left(f_n - \\frac{1}{f_n}\\right) + \\frac{j f_n Z_0 k}{1 + j f_n k Q}"
            important
            label="归一化输入阻抗"
          />

          <MathBlock
            latex="\\text{Re}(Z_{in}) = Z_0 \\cdot \\frac{f_n^2 k^2 Q}{Q^2 + f_n^2 k^2}, \\qquad \\text{Im}(Z_{in}) = Z_0 \\left( f_n - \\frac{1}{f_n} + \\frac{f_n k Q^2}{Q^2 + f_n^2 k^2} \\right)"
            label="输入阻抗实部与虚部"
          />

          <ParamTable>
            <ParamRow symbol="Z_{in}" name="输入阻抗" unit="Ω" description="从开关网络看入谐振腔的等效阻抗" typical="-" />
            <ParamRow symbol="Re(Z_in)" name="输入阻抗实部" unit="Ω" description="有功分量，决定基波电流同相分量" typical="-" />
            <ParamRow symbol="Im(Z_in)" name="输入阻抗虚部" unit="Ω" description="无功分量；大于 0 表示感性，小于 0 表示容性" typical="-" />
            <ParamRow symbol="φ" name="阻抗相位角" unit="°" description="φ = arctan(Im/Re)；感性区 φ &gt; 0" typical="10° ~ 60°" />
          </ParamTable>

          <p className="text-text-secondary mt-4 mb-2 font-medium">ZVS 能量条件</p>
          <MathBlock
            latex="\\frac{1}{2} L_m I_{m,off}^2 \\geq \\frac{1}{2} C_{oss,total} V_{in,max}^2"
            important
            label="ZVS 能量判据"
          />

          <p className="text-text-secondary mt-4 mb-2">
            其中关断时刻励磁电流峰值 I<sub>m,off</sub> 与最高工作频率 f<sub>max</sub> 相关：
          </p>

          <MathBlock
            latex="I_{m,off} = \\frac{V_{in,min}}{8 f_{max} L_m}  \\text{（半桥）}, \\qquad I_{m,off} = \\frac{V_{in,min}}{4 f_{max} L_m}  \\text{（全桥）}"
            label="励磁电流峰值"
          />

          <HighlightBox type="success">
            <strong>ZVS 实现要点：</strong>① 开关频率必须高于感性边界频率；② 死区时间内励磁电感释放的能量须大于开关节点寄生电容所需的充放电能量；③ 实际设计中通常取 Q_s = 0.9 ~ 0.95 · Q<sub>max</sub> 以保留裕量。
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
            latex="M_{max} = \\frac{V_{in,nom}}{V_{in,min}}, \\qquad M_{min} = \\frac{V_{in,nom}}{V_{in,max}}"
            label="所需电压增益范围"
          />

          <MathBlock
            latex="k_{min} = \\frac{1}{M_{max} - 1}, \\qquad M_{max,empty} = 1 + \\frac{1}{k}"
            label="电感比 k 的约束"
          />

          <MathBlock
            latex="Q_{max} = \\min(Q_{max1}, Q_{max2}, Q_{max3}), \\qquad Q_s = 0.95 \\cdot Q_{max}"
            label="最大允许 Q 与设计 Q"
          />

          <MathBlock
            latex="Z_0 = Q_s R_{ac}, \\quad L_r = \\frac{Q_s R_{ac}}{2\\pi f_r}, \\quad C_r = \\frac{1}{2\\pi f_r Q_s R_{ac}}, \\quad L_m = k L_r"
            important
            label="谐振腔参数计算"
          />

          <ParamTable>
            <ParamRow symbol="M_{max}" name="最大增益需求" unit="-" description="最低输入电压时所需的电压增益" typical="1.1 ~ 1.4" />
            <ParamRow symbol="M_{min}" name="最小增益需求" unit="-" description="最高输入电压时所需的电压增益" typical="0.6 ~ 0.9" />
            <ParamRow symbol="Q_{max1}" name="峰值增益约束 Q" unit="-" description="满足 M_peak(k,Q) = M_max 的最大 Q" typical="数值求解" />
            <ParamRow symbol="Q_{max2}" name="ZVS 死区约束 Q" unit="-" description="由死区时间与寄生电容决定" typical="数值求解" />
            <ParamRow symbol="Q_{max3}" name="ZVS 能量约束 Q" unit="-" description="由励磁电感储能决定" typical="数值求解" />
            <ParamRow symbol="Q_s" name="设计品质因数" unit="-" description="实际取用的 Q，通常取 0.9 ~ 0.95 Q_max" typical="0.3 ~ 0.8" />
          </ParamTable>

          <HighlightBox type="info">
            <strong>设计流程：</strong>定义规格 → 计算匝比 n → 计算 R<sub>ac</sub> → 确定 M<sub>max</sub>/M<sub>min</sub> → 选取 k → 求解 Q<sub>max</sub> → 取 Q<sub>s</sub> → 解算 L<sub>r</sub>、C<sub>r</sub>、L<sub>m</sub> → 校验应力、损耗与磁密。
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
            latex="I_{p,rms} = \\sqrt{I_{r,rms}^2 + I_{m,rms}^2}, \\qquad I_{r,rms} = \\frac{V_{FHA,rms}}{R_{ac}}, \\qquad I_{m,rms} = \\frac{V_{Lm}}{4\\sqrt{3} f_r L_m}"
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
            <ParamRow symbol="V_{ds,max}" name="MOSFET 耐压" unit="V" description="关断时承受的最大漏源电压" typical="等于输入电压最大值" />
            <ParamRow symbol="I_{p,rms}" name="原边总电流有效值" unit="A" description="谐振电流与励磁电流的方和根" typical="-" />
            <ParamRow symbol="I_{r,rms}" name="谐振电流有效值" unit="A" description="流过 L_r、C_r 和变压器原边的电流" typical="-" />
            <ParamRow symbol="I_{m,rms}" name="励磁电流有效值" unit="A" description="仅流过变压器励磁电感的电流" typical="-" />
            <ParamRow symbol="V_{RRM}" name="整流管反向耐压" unit="V" description="二极管/同步整流管关断时承受的反向电压" typical="2V_o 或 V_o" />
            <ParamRow symbol="I_{sec,rms}" name="副边电流有效值" unit="A" description="每个副边绕组或整流支路的电流" typical="0.785 I_o 或 1.11 I_o" />
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

          <div className="grid md:grid-cols-2 gap-4 my-4">
            <div className="p-4 rounded-lg border border-border bg-surface-elevated/30">
              <p className="text-text-muted text-xs uppercase tracking-wider mb-2">MOSFET 导通损耗</p>
              <MathBlock latex="P_{cond} = I_{p,rms}^2 \\cdot R_{ds(on)}" />
            </div>
            <div className="p-4 rounded-lg border border-border bg-surface-elevated/30">
              <p className="text-text-muted text-xs uppercase tracking-wider mb-2">驱动损耗</p>
              <MathBlock latex="P_{drv} = Q_g \\cdot V_{drv} \\cdot f_s" />
            </div>
            <div className="p-4 rounded-lg border border-border bg-surface-elevated/30">
              <p className="text-text-muted text-xs uppercase tracking-wider mb-2">二极管整流损耗</p>
              <MathBlock latex="P_{rect} = N_{diode} \\cdot V_f \\cdot \\frac{I_o}{2}" />
            </div>
            <div className="p-4 rounded-lg border border-border bg-surface-elevated/30">
              <p className="text-text-muted text-xs uppercase tracking-wider mb-2">磁芯损耗</p>
              <MathBlock latex="P_{core} = C_m \\cdot f_{sw}^{\\alpha} \\cdot B_{peak}^{\\beta} \\cdot V_e" />
            </div>
          </div>

          <MathBlock
            latex="B_{peak} = \\frac{V_p}{4 N_p A_e f_s}, \\qquad P_{Cu} = I_{p,rms}^2 R_{ac,pri} + I_{s,rms}^2 R_{ac,sec}"
            label="磁密与铜损"
          />

          <ParamTable>
            <ParamRow symbol="R_{ds(on)}" name="MOSFET 导通电阻" unit="Ω" description="结温下的导通电阻" typical="mΩ 级" />
            <ParamRow symbol="Q_g" name="栅极电荷" unit="nC" description="开关一次所需的栅极电荷量" typical=" datasheet 值" />
            <ParamRow symbol="V_f" name="整流管正向压降" unit="V" description="二极管导通压降或同步整流等效压降" typical="0.3 ~ 0.7 V" />
            <ParamRow symbol="C_m, α, β" name="Steinmetz 系数" unit="mW·cm⁻³·kHz⁻ᵃ·mT⁻ᵝ" description="磁芯材料损耗拟合系数，C_m 典型值约 10⁻⁶ 量级" typical="查磁芯 datasheet" />
            <ParamRow symbol="B_{peak}" name="磁芯峰值磁通密度" unit="T" description="变压器磁芯中的磁通密度峰值，B_{peak} = V_p / (4 N_p A_e f_s)" typical="0.1 ~ 0.3 T" />
            <ParamRow symbol="N_p" name="原边匝数" unit="匝" description="变压器原边绕组匝数" typical="按 A_e 与 B 设计" />
            <ParamRow symbol="A_e" name="磁芯有效截面积" unit="m²" description="磁芯几何有效截面积" typical=" datasheet 值" />
          </ParamTable>

          <HighlightBox type="info">
            <strong>效率估算：</strong>总损耗为各部分损耗之和，η = P_o / (P_o + P_loss,total) × 100%。实际工程中建议结合热仿真和样机测试进行校准。
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
                  <td className="px-4 py-3"><InlineMath latex="f_r = \\frac{1}{2\\pi\\sqrt{L_r C_r}}" /></td>
                  <td className="px-4 py-3">串联谐振频率</td>
                </tr>
                <tr className="hover:bg-surface-elevated/30">
                  <td className="px-4 py-3 text-text-primary font-medium">第二谐振</td>
                  <td className="px-4 py-3"><InlineMath latex="f_m = \\frac{f_r}{\\sqrt{1 + k}}" /></td>
                  <td className="px-4 py-3">含励磁电感的谐振频率</td>
                </tr>
                <tr className="hover:bg-surface-elevated/30">
                  <td className="px-4 py-3 text-text-primary font-medium">电感比</td>
                  <td className="px-4 py-3"><InlineMath latex="k = \\frac{L_m}{L_r}" /></td>
                  <td className="px-4 py-3">典型 5 ~ 7</td>
                </tr>
                <tr className="hover:bg-surface-elevated/30">
                  <td className="px-4 py-3 text-text-primary font-medium">特征阻抗</td>
                  <td className="px-4 py-3"><InlineMath latex="Z_0 = \\sqrt{\\frac{L_r}{C_r}}" /></td>
                  <td className="px-4 py-3">谐振腔阻抗尺度</td>
                </tr>
                <tr className="hover:bg-surface-elevated/30">
                  <td className="px-4 py-3 text-text-primary font-medium">品质因数</td>
                  <td className="px-4 py-3"><InlineMath latex="Q = \\frac{Z_0}{R_{ac}}" /></td>
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
                  <td className="px-4 py-3"><InlineMath latex="L_r = \\frac{Q_s R_{ac}}{2\\pi f_r}" /></td>
                  <td className="px-4 py-3">由 Q 反推</td>
                </tr>
                <tr className="hover:bg-surface-elevated/30">
                  <td className="px-4 py-3 text-text-primary font-medium">谐振电容</td>
                  <td className="px-4 py-3"><InlineMath latex="C_r = \\frac{1}{2\\pi f_r Q_s R_{ac}}" /></td>
                  <td className="px-4 py-3">由 Q 反推</td>
                </tr>
                <tr className="hover:bg-surface-elevated/30">
                  <td className="px-4 py-3 text-text-primary font-medium">励磁电感</td>
                  <td className="px-4 py-3"><InlineMath latex="L_m = k L_r" /></td>
                  <td className="px-4 py-3">决定 ZVS 能量</td>
                </tr>
                <tr className="hover:bg-surface-elevated/30">
                  <td className="px-4 py-3 text-text-primary font-medium">ZVS 能量</td>
                  <td className="px-4 py-3"><InlineMath latex="\\frac{1}{2} L_m I_{m,off}^2 \\geq \\frac{1}{2} C_{oss,total} V_{in,max}^2" /></td>
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
