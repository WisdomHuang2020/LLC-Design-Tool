// LLC 设计工具 —— 符号与物理概念释义（**由「公式推导」页的 ParamRow 生成，勿手改**）
//
// 生成方式：node .workbuddy/tmp/v02/gen_glossary.cjs（解析 Derivations.tsx 的 ParamRow）
// 用途：设计工具页底部的「符号与物理概念释义」卡片 —— 与「公式推导」页符号表**同源**，
//       避免两处各写一份后慢慢不一致（新增符号时：先改 Derivations，再重跑上面这条命令）。
//
// ★ 符号体系（回答"增益为什么有两个字母"）：
//   · `G` 系 = **设计需求**（"要多少增益"）：Gmax / Gmin / Gempty；
//   · `M` 系 = **曲线上能到多少**：M 是增益曲线纵轴、Mpeak 是峰顶、Mbnd 是感容分界点处的增益。
//   两者都是电压增益，区别在"要求"与"可实现"；`M` 沿用 LLC 文献与计算书的通用写法（M = 2n·Vo/Vin）。
//   ⇒ 所以感性区增益上限叫 **Mbnd 而不是 Gbnd**：它是"M 曲线上取的一个点"，与纵轴 M 同族；
//      若叫 Gbnd 会被误当成与 Gmax/Gmin 同类的"需求值"。

export interface SymbolRow {
  symbol: string
  name: string
  unit: string
  desc: string
  typical: string
}

export interface SymbolGroup {
  group: string
  rows: SymbolRow[]
}

export const SYMBOL_GROUPS: SymbolGroup[] = [
  {
    group: '谐振腔与频率',
    rows: [
      { symbol: 'Lr', name: '谐振电感', unit: 'H', desc: '与谐振电容共同决定串联谐振频率，通常为变压器漏感或外接电感', typical: '数十 μH ~ 数百 μH' },
      { symbol: 'Cr', name: '谐振电容', unit: 'F', desc: '谐振腔串联电容，承受谐振电流交流分量', typical: 'nF ~ 数十 nF' },
      { symbol: 'Lm', name: '励磁电感', unit: 'H', desc: '变压器励磁电感，参与第二谐振频率并影响 ZVS 能量', typical: '数百 μH ~ 数 mH' },
      { symbol: 'fr / fr1', name: '谐振频率（第一谐振频率）', unit: 'Hz', desc: 'Lr 与 Cr 的串联谐振频率，也是负载独立点；★ 站内结果卡/报告中的「谐振频率 fr」即指 fr1', typical: '100 kHz ~ 500 kHz' },
      { symbol: 'fr2', name: '第二谐振频率', unit: 'Hz', desc: '(Lr + Lm) 与 Cr 的谐振频率，fr2 = fr1 / √(1+k)', typical: '0.3 fr1 ~ 0.5 fr1' },
      { symbol: 'k', name: '电感比', unit: '-', desc: 'Lm / Lr，决定两个谐振频率间距与峰值增益能力', typical: '3 ~ 10（常用 5 ~ 7）' },
      { symbol: 'Q', name: '品质因数', unit: '-', desc: '反映负载轻重，Q = Zr / Rac；负载越重 Q 越大', typical: '0.3 ~ 1.0' },
      { symbol: 'Zr', name: '特征阻抗', unit: 'Ω', desc: '谐振腔阻抗尺度，Zr = √(Lr/Cr)', typical: '数十 Ω ~ 数百 Ω' },
      { symbol: 'fn', name: '归一化频率', unit: '-', desc: '开关频率相对谐振频率的比值 fsw / fr1', typical: '0.5 ~ 1.5' },
      { symbol: 'M', name: '电压增益', unit: '-', desc: '输出电压折算值与输入电压基波分量的比值。本文与设计工具页统一用「归一化」口径：谐振频率处 M = 1；理论页（工作原理 / 基础）另有「原始直流增益 n·Vo/Vin」的定义，两者不可混用', typical: '0.5 ~ 1.5' },
      { symbol: 'n', name: '变压器匝比', unit: '-', desc: '原边匝数与副边匝数之比（中心抽头按半绕组计算）', typical: '按输入输出电压设计' },
      { symbol: 'Zin', name: '输入阻抗', unit: 'Ω', desc: '从开关网络看入谐振腔的等效阻抗', typical: '-' },
      { symbol: 'Re(Zin)', name: '输入阻抗实部', unit: 'Ω', desc: '有功分量，决定基波电流同相分量', typical: '-' },
      { symbol: 'Im(Zin)', name: '输入阻抗虚部', unit: 'Ω', desc: '无功分量；大于 0 表示感性，小于 0 表示容性', typical: '-' },
      { symbol: 'φ', name: '阻抗相位角', unit: '°', desc: 'φ = arctan(Im/Re)；感性区 φ &gt; 0', typical: '10° ~ 60°' },
      { symbol: 'RL', name: '直流负载电阻', unit: 'Ω', desc: 'RL = Vo² / Po', typical: '随输出功率变化' },
      { symbol: 'Rac', name: '等效交流电阻', unit: 'Ω', desc: '折算到原边的交流负载，用于 FHA 等效电路', typical: '数十 Ω ~ 数百 Ω' },
    ],
  },
  {
    group: '增益与判据',
    rows: [
      { symbol: 'Vin,nom', name: '额定输入电压', unit: 'V', desc: '变换器标称直流输入电压', typical: '380 V / 400 Vdc' },
      { symbol: 'Vo', name: '输出电压', unit: 'V', desc: '额定输出直流电压', typical: '12 V / 24 V / 48 V' },
      { symbol: 'Vf', name: '输出整流压降', unit: 'V', desc: '★ 单一来源：设计参数里的「输出整流压降」，同时用于匝比 n 与二极管整流的损耗（Nrect·Vf·(Io/2)）。二极管取 0.6~1.2 V，同步整流填 0', typical: '0（同步）/ 0.6~1.2 V（二极管）' },
      { symbol: 'Gmax', name: '最大增益需求', unit: '-', desc: '最低输入电压时所需的电压增益（V_in,nom / V_in,min）', typical: '1.1 ~ 1.4' },
      { symbol: 'Gmin', name: '最小增益需求', unit: '-', desc: '最高输入电压时所需的电压增益（V_in,nom / V_in,max）', typical: '0.6 ~ 0.9' },
      { symbol: 'Gempty', name: '空载增益下限', unit: '-', desc: '空载（Q→0）时 Region 1 的增益下限 k/(k+1)；Gmin 必须 ≥ 它，否则高输入空载降压不了（对应 k ≤ kmax）', typical: '≈ 0.75 ~ 0.9' },
      { symbol: 'Mpeak', name: '峰值增益（曲线峰顶）', unit: '-', desc: '给定 (k, Q) 下增益曲线的最大值（dM/dfn = 0）；⚠ 峰顶恒落在容性区，感性区内取不到此值', typical: '数值求解' },
      { symbol: 'Mbnd', name: '感性区增益上限', unit: '-', desc: '感容分界点（Im Zin = 0）处的增益；感性区内 M 随 fn 单调下降，此即真正可达的上限，判「够不够」须用此值', typical: '数值求解' },
      { symbol: 'Qmax1', name: '增益能力约束 Q', unit: '-', desc: '本站默认取【分界判据】：满足 Mbnd(k,Q) = Gmax 的最大 Q（数值二分，与教材闭式差 <1e-12）；表单可切换为【峰值判据】Mpeak = Gmax —— 该判据数值更宽松，但工作点已落在容性区，不推荐', typical: '0.3 ~ 1.0' },
      { symbol: 'Qmax2', name: '死区时间约束 Q', unit: '-', desc: '死区内刚好完成 C总 充放电（t_dead = td）对应的 Q；C总 = 2·Coss,eq + Cj（时间口径）', typical: '0.3 ~ 1.5' },
      { symbol: 'Qmax3', name: 'ZVS 能量约束 Q', unit: '-', desc: '由励磁电感储能 ≥ 结电容总能量（2Coss,er + Cj：两只管之和 + 寄生）决定，Coss,er 为单管值', typical: '数值求解' },
      { symbol: 'Er', name: '可提供的 ZVS 储能', unit: 'J', desc: '关断时刻励磁电感储存的能量 Er = ½·Lm·I_m,off²（用 V_in,min 求 I_m,off，取最坏）', typical: '数十 μJ' },
      { symbol: 'Ec', name: 'ZVS 所需能量', unit: 'J', desc: '把开关节点电容 C总 从 0 充/放到 V_in 所需能量 Ec = ½·(2·Coss,er + Cj)·V_in,max²（用 V_in,max，取最坏）；Er ≥ Ec 才够 ZVS', typical: '数 μJ ~ 数十 μJ' },
      { symbol: 'fmin', name: '调频下限（满载低输入）', unit: 'Hz', desc: '满载增益曲线与 M = Gmax 的交点频率 —— 最低母线满载是最坏工况，需要最低频率', typical: '数十 ~ 百余 kHz' },
      { symbol: 'fmax', name: '调频上限（空载降压）', unit: 'Hz', desc: '空载（Q→0）曲线与 M = Gmin 的交点频率；⚠ 与 fmin 取不同工况是有意为之（降压最坏在空载）', typical: '百余 ~ 数百 kHz' },
      { symbol: 'Qs', name: '设计品质因数', unit: '-', desc: 'Qs = m · Qmax，m 为可设定裕量系数（默认 0.857 = 计算书算例的 α，在设计工具页「Q 裕量系数 m」调整）', typical: '0.3 ~ 0.8' },
    ],
  },
  {
    group: '电流、应力与死区',
    rows: [
      { symbol: 'Ip,rms', name: '原边总电流有效值', unit: 'A', desc: '流过 Lr、Cr 与变压器原边绕组的电流（Ir,rms 与 Im,rms 的方和根）', typical: '-' },
      { symbol: 'Ir,rms', name: '谐振电流有效值', unit: 'A', desc: 'FHA 等效模型中流入负载支路（Rac）的电流分量；非 Lr/Cr 支路的实际电流', typical: '-' },
      { symbol: 'Im,rms', name: '励磁电流有效值', unit: 'A', desc: '仅流过变压器励磁电感的电流', typical: '-' },
      { symbol: 'Im,off', name: '关断时刻励磁电流峰值', unit: 'A', desc: '副边换流完毕后原边只剩励磁电流，关断就发生在这一刻 ⇒ 它既用于 ZVS 储能 Er，也用于关断损耗 P_off（不是谐振峰值电流）', typical: '0.2 ~ 0.5 A' },
      { symbol: 'Vds,max', name: 'MOSFET 耐压', unit: 'V', desc: '关断时承受的最大漏源电压', typical: '等于输入电压最大值' },
      { symbol: 'VRRM', name: '整流管反向耐压', unit: 'V', desc: '二极管/同步整流管关断时承受的反向电压', typical: '2Vo 或 Vo' },
      { symbol: 'Isec,rms', name: '副边电流有效值', unit: 'A', desc: '每个副边绕组或整流支路的电流', typical: '0.785 Io 或 1.11 Io' },
      { symbol: 'tZVS', name: 'ZVS 换流所需时间', unit: 'ns', desc: '死区内把 C总 充/放完所需时间 t_ZVS = γ·f_max·Lm·C总（γ = 8 半桥 / 4 全桥）；V_in 精确相消 ⇒ 与输入电压无关。判据 t_ZVS ≤ td', typical: '150 ~ 350 ns' },
      { symbol: 'td', name: '死区时间', unit: 'ns', desc: '取自设计参数（单一来源）；决定体二极管净导通时间 td − tZVS', typical: '100 ~ 400 ns' },
    ],
  },
  {
    group: '开关与驱动',
    rows: [
      { symbol: 'Rds(on)', name: 'MOSFET 导通电阻', unit: 'mΩ', desc: '25℃ 规格书值；实际导通损耗按 ×kT 折算到结温', typical: 'mΩ 级' },
      { symbol: 'kT', name: 'Rds(on) 温度修正系数', unit: '-', desc: '硅管 100℃ 时约为 25℃ 值的 1.5~2.0 倍，工具默认 1.6', typical: '1.5 ~ 2.0' },
      { symbol: 'tcr', name: '开关交叉时间（米勒平台时长）', unit: 'ns', desc: 't_cr = Q_plat·R_g/ΔV_gate；关断 ΔV = V_plat、开通 ΔV = V_drv − V_plat。平台电荷 Q_plat 有两种等价取法（Q_gd 法 / Crss 积分法，见上方警示框）。★ 不能用规格书 t_r/t_f 代替：那是特定测试条件下的漏极电流过渡时间，既非本机工况也不是 V·I 重叠时长', typical: '10 ~ 40 ns' },
      { symbol: 'Qgd', name: '米勒电荷', unit: 'nC', desc: '规格书栅荷曲线的 Q_gd（平台段电荷），交叉时间公式的分子', typical: '查规格书栅荷曲线' },
      { symbol: 'Vplat', name: '米勒平台电压', unit: 'V', desc: '同一条栅荷曲线的平台电压；规格书值多在较大测试电流下取得，低电流实际值略低', typical: 'V_th ~ 6 V' },
      { symbol: 'Rg', name: '栅极回路总电阻', unit: 'Ω', desc: '器件内部 R_G + 外部 R_g + 驱动上/下拉阻抗；⚠ 不是规格书 t_r/t_f 测试条件里的 10 Ω', typical: '5 ~ 20 Ω' },
      { symbol: 'Vdrv', name: '驱动电平', unit: 'V', desc: '开通交叉时间用 ΔV = V_drv − V_plat；关断按栅极被拉到 0 处理', typical: '10 ~ 15 V' },
      { symbol: 'Crss_eq', name: '等效反向传输电容（Crss 积分法用）', unit: 'pF', desc: '= ∫Crss(V)dV ÷ V_DS（面积÷电压）。★ 不是规格书某一点的 Crss：低压段 Crss 可达成百上千 pF，积分主要由 0~25 V 段贡献，等效值通常有十几 pF；填高压段单点值（0.5~2 pF）会把平台电荷低估近一个数量级', typical: '10 ~ 20 pF' },
      { symbol: 'VDS,swing', name: '平台对应的 V_DS 摆幅（Crss 积分法用）', unit: 'V', desc: '关断时器件由 0 承压到母线电压，故一般就填母线 V_in；保守可取器件耐压（会偏保守）', typical: '= V_in' },
      { symbol: 'Qg', name: '栅极电荷', unit: 'nC', desc: '仅用于驱动损耗参考式；工具损耗模型未计入该项', typical: 'datasheet 值' },
    ],
  },
  {
    group: '电容口径',
    rows: [
      { symbol: 'Coss,eq', name: '时间相关等效输出电容（≡ Co(tr)）', unit: 'pF', desc: '单管值。恒流充到 V_DS 的电荷/时间与真实 Coss 相同 ⇒ 用于死区时间约束；不是整桥总量', typical: '查规格书 Co(tr)' },
      { symbol: 'Coss,er', name: '能量相关等效输出电容（≡ Co(er)）', unit: 'pF', desc: '单管值。充到 V_DS 的储能与真实 Coss 相同 ⇒ 用于 ZVS 能量判据与硬开关 Coss 损耗（½·Coss,er·V²，定义式无需修正系数）', typical: '查规格书 Co(er)' },
      { symbol: 'Cj', name: 'PCB / 变压器寄生电容', unit: 'pF', desc: '经验取值，随布板与变压器结构变；与两只管的 Coss 相加后构成总电容', typical: '50 ~ 150 pF' },
      { symbol: 'C总', name: '死区时间用总电容', unit: 'pF', desc: 'C总 = 2·Coss,eq + Cj（半桥）。死区的电荷/时间约束用它；⚠ 能量判据用的是 2·Coss,er + Cj，两者不是同一个电容', typical: '数值求解' },
    ],
  },
  {
    group: '磁芯、绕组与整流',
    rows: [
      { symbol: 'Pcv,Lr', name: 'Lr 磁芯损耗密度（手册值）', unit: 'mW/cm³', desc: '按 Lr 实际磁牌号与 B_Lr 查手册；默认 179（≈PC95 @100kHz / B_Lr≈0.165 T）。正弦激励，不乘 k_wave', typical: '查手册' },
      { symbol: 'Ve,Lr', name: 'Lr 磁芯有效体积', unit: 'cm³', desc: '默认取变压器 Ve 的 1/4（谐振电感体积通常为变压器的 1/5~1/4）', typical: '1 ~ 2 cm³' },
      { symbol: 'k_wave', name: '波形修正系数', unit: '-', desc: '手册曲线多为正弦标定，LLC 变压器为方波励磁，工具默认 1.25；⚠ 仅用于变压器磁芯，Lr 不用', typical: '1.2 ~ 1.4' },
      { symbol: 'Cm, α, β', name: 'Steinmetz 系数（对照口径）', unit: 'mW·cm⁻³·kHz⁻ᵃ·mT⁻ᵝ', desc: '正弦激励拟合系数，方波励磁下有偏差，仅作并列对照', typical: '查磁芯 datasheet' },
      { symbol: 'Bpeak', name: '磁芯峰值磁通密度', unit: 'T', desc: '变压器磁芯中的磁通密度峰值', typical: '0.1 ~ 0.3 T' },
      { symbol: 'Np', name: '原边匝数', unit: '匝', desc: '变压器原边绕组匝数', typical: '按 Ae 与 B 设计' },
      { symbol: 'Ns', name: '副边匝数', unit: '匝', desc: '副边半绕组匝数（中心抽头按半绕组计）；n = Np/Ns', typical: '按 n 与整流拓扑确定' },
      { symbol: 'Ae', name: '磁芯有效截面积', unit: 'm²', desc: '磁芯几何有效截面积', typical: 'datasheet 值' },
      { symbol: 'Nrect', name: '整流器件数', unit: '个', desc: '同时参与导通的整流器件总数：中心抽头 2 / 全波桥 4（二极管与同步整流同一套数）', typical: '2 或 4' },
      { symbol: 'Is,sw', name: '单个整流器件电流 RMS', unit: 'A', desc: '整周期内每个整流器件的电流有效值；两种拓扑同为 (π/4)·Io ≈ 0.785 Io', typical: '0.785 Io' },
    ],
  },
]

export const SYMBOL_TOTAL = SYMBOL_GROUPS.reduce((a, g) => a + g.rows.length, 0)
