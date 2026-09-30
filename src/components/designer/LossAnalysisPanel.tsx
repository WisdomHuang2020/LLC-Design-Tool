// 损耗分析面板：器件/磁芯参数输入 + 损耗汇总 + 饼图/柱图 + 分项明细表。
import { useState } from 'react'
import type { ReactNode } from 'react'
import { Eye, EyeOff, Flame } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import CollapsibleCard from './CollapsibleCard'
import { calculateLosses } from '../../lib/designer/losses'
import type { CalculatedData, LossParameters } from '../../lib/designer/types'
import { loadLossNotesHidden, saveLossNotesHidden } from '../../lib/designer/persistence'
import { CORE_MATERIALS, applyCoreMaterial, coreMaterialById, materialPresetMatches, steinmetzCm } from '../../lib/designer/coreMaterials'

interface LossAnalysisPanelProps {
  calc: CalculatedData
  params: LossParameters
  setParams: (p: LossParameters) => void
  collapsed: boolean
  onToggle: () => void
}

const inputClass = 'input-field w-full'
const labelClass = 'block text-xs font-medium text-text-secondary mb-1'

/**
 * 参数下方的注释小字。注释整体可由标题栏的「注释」开关隐藏（见 notesHidden）——
 * 各字段注释行数差别很大，隐藏后同一行输入框才能规整对齐。
 */
function Note({ hidden, children }: { hidden: boolean; children: ReactNode }) {
  if (hidden) return null
  return <div className="text-[10px] text-text-muted mt-0.5">{children}</div>
}

export default function LossAnalysisPanel({ calc, params, setParams, collapsed, onToggle }: LossAnalysisPanelProps) {
  const losses = calculateLosses(calc, params)
  const update = <K extends keyof LossParameters>(key: K, value: LossParameters[K]) => {
    setParams({ ...params, [key]: value })
  }

  // 参数下方注释小字是否隐藏：纯显示偏好（持久化，不参与计算）。
  // 注释长短不一会撑出参差行高；隐藏后配合 .loss-field-grid 的 CSS 让同一行输入框对齐。
  const [notesHidden, setNotesHidden] = useState(loadLossNotesHidden)
  const toggleNotes = () => {
    setNotesHidden((v) => {
      saveLossNotesHidden(!v)
      return !v
    })
  }

  const effDiff = losses.efficiency - calc.efficiency
  const tdNs = Number.isFinite(calc.td) ? (calc.td * 1e9).toFixed(0) : '—'
  // Coss,er 取自设计参数（单一来源）；旧存档缺该字段时与损耗模型同口径兜底
  // 整流分支的联动显示：整流方式来自**设计参数**，面板据此切换输入项与公式（二极管用的 Vd 也是设计参数）
  const isSyncRect = calc.rectifier === 'synchronous' || calc.rectifier === 'sync-center-tapped'
  const isCtRect = calc.rectifier === 'center-tapped' || calc.rectifier === 'sync-center-tapped'
  const nRectVal = isCtRect ? 2 : 4
  const rectLabel = isSyncRect
    ? (isCtRect ? '同步整流（中心抽头）' : '同步整流（全波桥）')
    : (isCtRect ? '二极管整流（中心抽头）' : '二极管整流（全波桥）')
  const vdDesign = Number.isFinite(Number(calc.vd)) ? Number(calc.vd) : 0
  const cossErP = Number.isFinite(Number(calc.cossEr)) && Number(calc.cossEr) > 0 ? Number(calc.cossEr) : 35
  // 交叉时间（由 losses.ts 依「平台电荷·R_g/ΔV」算出；这里只做显示）
  const tCrossOffNs = (losses.tCrossOff * 1e9).toFixed(1)
  const tCrossOnNs = (losses.tCrossOn * 1e9).toFixed(1)
  // 两种平台电荷取法的并列对照：都用同一 R_g / V_plat 换算成关断交叉时间，便于判断数量级是否可信
  const qQgd = losses.qPlateauQgd * 1e9
  const qCrss = losses.qPlateauCrss * 1e9
  const rgUse = Number.isFinite(params.rgTotal) ? params.rgTotal : 12
  const vPlatUse = Number.isFinite(params.vPlateau) ? params.vPlateau : 4.5
  // ⚠️ losses.qPlateau* 的单位是**库仑(C)**，不是纳库仑 —— 换算 t = Q·R/ΔV 时不要再乘 1e-9
  const toffNs = (qC: number) => ((qC * rgUse) / vPlatUse) * 1e9
  const tOffQgd = toffNs(losses.qPlateauQgd)
  const tOffCrss = toffNs(losses.qPlateauCrss)
  const qRatio = qCrss > 1e-12 ? qQgd / qCrss : NaN
  // 两法差值的分级提示（按倍数，不按百分比 —— 1.33× 与 0.75× 是同一件事）
  const ratioNote = !Number.isFinite(qRatio)
    ? ''
    : qRatio > 3
      ? `（Qgd 法比 Crss 法大 ${qRatio.toFixed(1)}× ⇒ 高度怀疑 Crss 等效值误取了单点，请按曲线积分复核）`
      : qRatio < 1 / 3
        ? `（Qgd 法比 Crss 法小 ${(1 / qRatio).toFixed(1)}× ⇒ 请复核 Qgd / 摆幅取值）`
        : Math.abs(qRatio - 1) > 0.25
          ? `（两法相差 ${(qRatio > 1 ? qRatio : 1 / qRatio).toFixed(2)}×，同一量级）`
          : '（两法相差 <25%，一致）'

  return (
    <CollapsibleCard
      icon={<Flame className="w-5 h-5 text-danger" />}
      title="损耗分析"
      collapsed={collapsed}
      onToggle={onToggle}
      headerExtra={
        // 注释开关：与折叠按钮平级，点击只切换注释显示，不会收起卡片。
        // 隐藏后各字段等高（label 吸收行高差），同一行输入框横向对齐。
        <button
          type="button"
          onClick={toggleNotes}
          title={notesHidden ? '显示各参数下方的注释小字' : '隐藏各参数下方的注释小字（输入框可横向对齐）'}
          className="shrink-0 flex items-center gap-1 text-xs px-2 py-1 rounded-md border border-border text-text-secondary hover:text-text-primary hover:border-primary-light/60 transition-colors"
        >
          {notesHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          {notesHidden ? '显示注释' : '隐藏注释'}
        </button>
      }
    >
      <div className="mt-3 space-y-5">
        {/* Input parameters */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 loss-field-grid${notesHidden ? ' hide-notes' : ''}`}>
          <div>
            <label className={labelClass}>MOSFET Rds(on) (mΩ, 25℃)</label>
            <input type="number" className={inputClass} value={params.mosfetRdsOn} onChange={(e) => update('mosfetRdsOn', Number(e.target.value))} />
          </div>
          <div>
            <label className={labelClass}>Rds(on) 温度修正系数 kT</label>
            <input type="number" step="0.1" className={inputClass} value={params.rdsonTempFactor} onChange={(e) => update('rdsonTempFactor', Number(e.target.value))} />
            <Note hidden={notesHidden}>原边 MOSFET 与同步整流共用；硅管 100℃ 典型 1.5~2.0</Note>
          </div>
          <div>
            <label className={labelClass}>Qgd 米勒电荷 (nC)</label>
            <input type="number" step="0.1" className={inputClass} value={params.qgd} onChange={(e) => update('qgd', Number(e.target.value))} />
            <Note hidden={notesHidden}>取规格书栅荷曲线 Q<sub>gd</sub></Note>
          </div>
          <div>
            <label className={labelClass}>Vplat 平台电压 (V)</label>
            <input type="number" step="0.1" className={inputClass} value={params.vPlateau} onChange={(e) => update('vPlateau', Number(e.target.value))} />
            <Note hidden={notesHidden}>同一条曲线的平台电压</Note>
          </div>
          <div>
            <label className={labelClass}>Rg 栅极回路总电阻 (Ω)</label>
            <input type="number" step="0.1" className={inputClass} value={params.rgTotal} onChange={(e) => update('rgTotal', Number(e.target.value))} />
            <Note hidden={notesHidden}>内部 R<sub>G</sub> + 外部 R<sub>g</sub> + 驱动阻抗</Note>
          </div>
          <div>
            <label className={labelClass}>Vdrv 驱动电平 (V)</label>
            <input type="number" step="0.1" className={inputClass} value={params.vDrv} onChange={(e) => update('vDrv', Number(e.target.value))} />
            <Note hidden={notesHidden}>开通交叉时间用；关断按 0</Note>
          </div>
          <div>
            <label className={labelClass}>交叉时间 t_cr（由平台电荷算出）</label>
            <div className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-2 flex items-center">
              <span className="font-mono text-sm text-text-primary truncate">关断 {tCrossOffNs} ｜ 开通 {tCrossOnNs} ns</span>
            </div>
            <Note hidden={notesHidden}>
              t_cr = Q<sub>plat</sub>·R<sub>g</sub>/ΔV（关断 ΔV = V<sub>plat</sub>、开通 ΔV = V<sub>drv</sub> − V<sub>plat</sub>）。
              ⚠️ 不要直接填规格书 t<sub>r</sub>/t<sub>f</sub>：那是特定测试条件（如 V<sub>DD</sub>=400 V、I<sub>D</sub>≈5 A、R<sub>G</sub>=10 Ω）下测的
              <b>漏极电流 10%↔90% 过渡时间</b>，既非本机工况、也不是损耗积分所需的 V·I 重叠时长
            </Note>
          </div>
          <div>
            <label className={labelClass}>平台电荷取法</label>
            <select
              className={inputClass}
              value={params.tcrMethod}
              onChange={(e) => update('tcrMethod', e.target.value as LossParameters['tcrMethod'])}
            >
              <option value="qgd">Qgd 法（规格书实测 ∫Crss dV，推荐）</option>
              <option value="crss">Crss 积分法（等效 Crss × V_DS）</option>
            </select>
            <Note hidden={notesHidden}>
              两法并列：<b>Qgd 法</b> Q = {qQgd.toFixed(2)} nC ⇒ 关断 {tOffQgd.toFixed(1)} ns（参与计算）｜
              <b>Crss 法</b> Q = {qCrss.toFixed(2)} nC ⇒ 关断 {tOffCrss.toFixed(1)} ns
              {ratioNote}
            </Note>
          </div>
          {params.tcrMethod === 'crss' && (
            <>
              <div>
                <label className={labelClass}>Crss 等效值 (pF)</label>
                <input type="number" step="0.1" className={inputClass} value={params.crssEq} onChange={(e) => update('crssEq', Number(e.target.value))} />
                <Note hidden={notesHidden}>
                  必须是「∫Crss(V) dV ÷ 电压」（面积÷电压），400 V 级器件通常<b>十几个 pF</b>；
                  ⚠️ 直接填规格书<b>某一点</b>的 Crss（低压段 0.5~2 pF）会低估数倍 —— Crss 近 0 V 处可达成百上千 pF，积分主要由那一段贡献
                </Note>
              </div>
              <div>
                <label className={labelClass}>V_DS 平台摆幅 (V)</label>
                <input type="number" className={inputClass} value={params.vdsSwing} onChange={(e) => update('vdsSwing', Number(e.target.value))} />
                <Note hidden={notesHidden}>一般就填母线电压 V<sub>in</sub>（关断时器件由 0 承压到 V<sub>in</sub>）</Note>
              </div>
            </>
          )}
          <div>
            <label className={labelClass}>Coss,er (pF)</label>
            <div className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-2 flex items-center justify-between">
              <span className="font-mono text-sm text-text-primary">{cossErP}</span>
              <span className="text-[10px] text-text-muted">取自设计参数</span>
            </div>
            <Note hidden={notesHidden}>单管值（≡ 规格书 Co(er)）；能量判据与损耗按 2·Coss,er + Cj / ×N<sub>sw</sub> 计入两只管</Note>
          </div>
          <div>
            <label className={labelClass}>Vsd (V)</label>
            <input type="number" className={inputClass} value={params.mosfetVsd} onChange={(e) => update('mosfetVsd', Number(e.target.value))} />
          </div>
          <div>
            <label className={labelClass}>死区时间 (ns)</label>
            <div className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-2 flex items-center justify-between">
              <span className="font-mono text-sm text-text-primary">{tdNs}</span>
              <span className="text-[10px] text-text-muted">取自设计参数</span>
            </div>
          </div>
          <div>
            <label className={labelClass}>原边匝数 Np</label>
            <input type="number" className={inputClass} value={params.primaryTurns} onChange={(e) => update('primaryTurns', Number(e.target.value))} />
          </div>
          <div>
            <label className={labelClass}>磁芯材料</label>
            <select
              className={inputClass}
              value={params.coreMaterial}
              onChange={(e) => setParams(applyCoreMaterial(params, e.target.value))}
            >
              {CORE_MATERIALS.map((m) => (
                <option key={m.id} value={m.id}>{m.name}（{m.family}）</option>
              ))}
            </select>
            <Note hidden={notesHidden}>
              {(() => {
                const m = coreMaterialById(params.coreMaterial)
                if (!m) return '切换牌号会按参考点（100 kHz / 200 mT / 100 ℃ 正弦）自动填入 P_cv 与 Steinmetz 系数，之后仍可手工微调'
                if (m.id === 'custom') return m.note
                return (
                  <>
                    已按 <b>{m.name}</b> 预设：P_cv = {m.pcvRef} mW/cm³、α = {m.alpha}、β = {m.beta}、
                    Cm = {steinmetzCm(m).toExponential(3)}
                    {materialPresetMatches(params) ? '' : '（当前数值已被手工修改，不再等于预设）'}
                    {m.note ? `｜${m.note}` : ''}
                    <br />
                    ⚠️ 预设是"参考点常见量级"，**投产前须按 {m.name} 手册在目标温度/频率/B 下核对**
                  </>
                )
              })()}
            </Note>
          </div>
          <div>
            <label className={labelClass}>Ve (cm³)</label>
            <input type="number" className={inputClass} value={params.coreVe} onChange={(e) => update('coreVe', Number(e.target.value))} />
          </div>
          <div>
            <label className={labelClass}>Ae (mm²)</label>
            <input type="number" className={inputClass} value={params.coreAe} onChange={(e) => update('coreAe', Number(e.target.value))} />
          </div>
          <div>
            <label className={labelClass}>Steinmetz Cm (mW·cm⁻³·kHz⁻ᵃ·mT⁻ᵝ)</label>
            <input type="number" step="any" className={inputClass} value={params.coreK} onChange={(e) => update('coreK', Number(e.target.value))} />
          </div>
          <div>
            <label className={labelClass}>α</label>
            <input type="number" step="0.1" className={inputClass} value={params.coreAlpha} onChange={(e) => update('coreAlpha', Number(e.target.value))} />
          </div>
          <div>
            <label className={labelClass}>β</label>
            <input type="number" step="0.1" className={inputClass} value={params.coreBeta} onChange={(e) => update('coreBeta', Number(e.target.value))} />
          </div>
          <div>
            <label className={labelClass}>绕组 Rdc (mΩ)</label>
            <input type="number" className={inputClass} value={params.windingRdc} onChange={(e) => update('windingRdc', Number(e.target.value))} />
          </div>
          <div>
            <label className={labelClass}>趋肤拐点 f0 (kHz)</label>
            <input type="number" className={inputClass} value={params.skinF0} onChange={(e) => update('skinF0', Number(e.target.value))} />
          </div>
          <div>
            <label className={labelClass}>{isSyncRect ? '同步整流 Rds(on) (mΩ)' : '整流压降 Vd (V)'}</label>
            {isSyncRect ? (
              <input type="number" step="0.1" className={inputClass} value={params.syncRectRdsOn} onChange={(e) => update('syncRectRdsOn', Number(e.target.value))} />
            ) : (
              <div className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-2 flex items-center justify-between">
                <span className="font-mono text-sm text-text-primary">{vdDesign.toFixed(2)}</span>
                <span className="text-[10px] text-text-muted">取自设计参数</span>
              </div>
            )}
            <Note hidden={notesHidden}>
              当前整流方式：<b>{rectLabel}</b>（由上方「设计参数」决定）⇒
              {isSyncRect
                ? ` 按 P_rect = Nrect·Is,sw²·Rds(on)·kT 计（Nrect = ${nRectVal}）`
                : ` 按 P_rect = Nrect·Vd·(Io/2) 计（Nrect = ${nRectVal}）；Vd 与匝比 n 用的是同一个压降，改它请到「设计参数」区的「输出整流压降 Vd」`}
              {!isSyncRect && vdDesign < 0.2 ? ' ⚠️ 当前 Vd ≈ 0 ⇒ 整流损耗会被算成 0，二极管应填 0.6~1.2 V' : ''}
            </Note>
          </div>
          <div>
            <label className={labelClass}>Lr DCR (mΩ)</label>
            <input type="number" className={inputClass} value={params.lrDcr} onChange={(e) => update('lrDcr', Number(e.target.value))} />
          </div>
          <div>
            <label className={labelClass}>Cr 等效电阻取法</label>
            <select className={inputClass} value={params.crEsrMode} onChange={(e) => update('crEsrMode', e.target.value as LossParameters['crEsrMode'])}>
              <option value="df">由损耗角正切推算</option>
              <option value="esr">直接给 ESR</option>
            </select>
          </div>
          {params.crEsrMode === 'esr' ? (
            <div>
              <label className={labelClass}>Cr ESR (mΩ)</label>
              <input type="number" className={inputClass} value={params.crEsr} onChange={(e) => update('crEsr', Number(e.target.value))} />
            </div>
          ) : (
            <>
              <div>
                <label className={labelClass}>Cr 1kHz 损耗角正切</label>
                <input type="number" step="0.0001" className={inputClass} value={params.crDf1k} onChange={(e) => update('crDf1k', Number(e.target.value))} />
                <Note hidden={notesHidden}>规格书惯例值（如 0.001）</Note>
              </div>
              <div>
                <label className={labelClass}>Cr DF 频率修正倍数</label>
                <input type="number" step="0.1" className={inputClass} value={params.crDfK} onChange={(e) => update('crDfK', Number(e.target.value))} />
                <Note hidden={notesHidden}>1kHz → fsw 的 tanδ 倍数</Note>
              </div>
            </>
          )}
          <div>
            <label className={labelClass}>磁芯损耗算法</label>
            <select className={inputClass} value={params.coreLossMode} onChange={(e) => update('coreLossMode', e.target.value as LossParameters['coreLossMode'])}>
              <option value="pcv">手册 P_cv 法</option>
              <option value="steinmetz">Steinmetz 拟合</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>P_cv (mW/cm³)</label>
            <input type="number" className={inputClass} value={params.corePcv} onChange={(e) => update('corePcv', Number(e.target.value))} />
            <Note hidden={notesHidden}>目标温度/频率/B 下查手册</Note>
          </div>
          <div>
            <label className={labelClass}>波形修正 k_wave</label>
            <input type="number" step="0.05" className={inputClass} value={params.coreWaveK} onChange={(e) => update('coreWaveK', Number(e.target.value))} />
            <Note hidden={notesHidden}>方波励磁相对正弦，默认 1.25</Note>
          </div>
          <div>
            <label className={labelClass}>Lr 磁芯 P_cv (mW/cm³)</label>
            <input type="number" className={inputClass} value={params.lrCorePcv} onChange={(e) => update('lrCorePcv', Number(e.target.value))} />
            <Note hidden={notesHidden}>默认按 B_Lr≈0.15 T 查 PC95 手册；须按实际磁芯重查（填 0 则不计）</Note>
          </div>
          <div>
            <label className={labelClass}>Lr 磁芯 Ve (cm³)</label>
            <input type="number" step="0.1" className={inputClass} value={params.lrCoreVe} onChange={(e) => update('lrCoreVe', Number(e.target.value))} />
            <Note hidden={notesHidden}>默认取变压器 Ve 的 1/4；正弦激励，不乘 k_wave</Note>
          </div>
        </div>

        {/* Efficiency summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-surface-elevated rounded-lg p-4 border border-border">
            <div className="text-xs text-text-secondary mb-1">总损耗</div>
            <div className="text-2xl font-mono font-semibold text-danger">{losses.totalLoss.toFixed(2)} W</div>
          </div>
          <div className="bg-surface-elevated rounded-lg p-4 border border-border">
            <div className="text-xs text-text-secondary mb-1">实际效率</div>
            <div className="text-2xl font-mono font-semibold text-primary-light">{losses.efficiency.toFixed(2)}%</div>
          </div>
          <div className="bg-surface-elevated rounded-lg p-4 border border-border">
            <div className="text-xs text-text-secondary mb-1">与目标效率差</div>
            <div className={`text-2xl font-mono font-semibold ${effDiff >= 0 ? 'text-success' : 'text-accent'}`}>
              {effDiff >= 0 ? '+' : ''}{effDiff.toFixed(2)}%
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-surface-elevated rounded-lg p-4 border border-border">
            <h4 className="text-sm font-semibold text-text-primary mb-3">损耗分布</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={losses.breakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value" nameKey="name">
                    {losses.breakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#171717', border: '1px solid #404040', borderRadius: 6, color: '#f5f5f5' }}
                    formatter={(value: number) => [`${value.toFixed(2)} W`, '损耗']}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-surface-elevated rounded-lg p-4 border border-border">
            <h4 className="text-sm font-semibold text-text-primary mb-3">损耗分项对比</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={losses.breakdown} layout="vertical" margin={{ left: 20, right: 20, top: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                  <XAxis type="number" stroke="#a3a3a3" fontSize={12} tickFormatter={(v) => `${v.toFixed(1)}W`} />
                  <YAxis type="category" dataKey="name" stroke="#a3a3a3" fontSize={11} width={70} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#171717', border: '1px solid #404040', borderRadius: 6, color: '#f5f5f5' }}
                    formatter={(value: number) => [`${value.toFixed(2)} W`, '损耗']}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {losses.breakdown.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Detailed loss table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-border text-text-secondary">
                <th className="py-2 pr-4">损耗项</th>
                <th className="py-2 pr-4">功率 (W)</th>
                <th className="py-2 pr-4">占比</th>
                <th className="py-2">公式说明</th>
              </tr>
            </thead>
            <tbody className="text-text-primary">
              <tr className="border-b border-border/50">
                <td className="py-2 pr-4 font-medium">MOSFET 导通损耗</td>
                <td className="py-2 pr-4 font-mono">{losses.mosfetCond.toFixed(3)}</td>
                <td className="py-2 pr-4">{((losses.mosfetCond / losses.totalLoss) * 100).toFixed(1)}%</td>
                <td className="py-2 text-text-secondary">Pcond = 0.5·Ip²·Rds(on)·kT·Nsw（每管半周；Nsw = 半桥2 / 全桥4）</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2 pr-4 font-medium">MOSFET 开通损耗</td>
                <td className="py-2 pr-4 font-mono">{losses.mosfetSwitchOn.toFixed(3)}</td>
                <td className="py-2 pr-4">{((losses.mosfetSwitchOn / losses.totalLoss) * 100).toFixed(1)}%</td>
                <td className="py-2 text-text-secondary">P<sub>on</sub> = ½·V<sub>in</sub>·I<sub>p,peak</sub>·t<sub>cr,on</sub>·f<sub>sw</sub>·N<sub>sw</sub>（ZVS 下 ≈0，无 V·I 重叠）；t<sub>cr,on</sub> = Q<sub>plat</sub>·R<sub>g</sub>/(V<sub>drv</sub>−V<sub>plat</sub>) = {tCrossOnNs} ns</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2 pr-4 font-medium">MOSFET 关断损耗</td>
                <td className="py-2 pr-4 font-mono">{losses.mosfetSwitchOff.toFixed(3)}</td>
                <td className="py-2 pr-4">{((losses.mosfetSwitchOff / losses.totalLoss) * 100).toFixed(1)}%</td>
                <td className="py-2 text-text-secondary">P<sub>off</sub> = ½·V<sub>in</sub>·I<sub>m,off</sub>·t<sub>cr,off</sub>·f<sub>sw</sub>·N<sub>sw</sub>（关断电流为励磁电流峰值，与 ZVS 无关）；t<sub>cr,off</sub> = Q<sub>plat</sub>·R<sub>g</sub>/V<sub>plat</sub> = {tCrossOffNs} ns —— 不用规格书 t<sub>f</sub></td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2 pr-4 font-medium">Coss 损耗</td>
                <td className="py-2 pr-4 font-mono">{losses.mosfetCoss.toFixed(3)}</td>
                <td className="py-2 pr-4">{((losses.mosfetCoss / losses.totalLoss) * 100).toFixed(1)}%</td>
                <td className="py-2 text-text-secondary">E_oss = ½·C<sub>oss,er</sub>·V<sub>in,nom</sub>²·f<sub>sw</sub>·N<sub>sw</sub>（C<sub>oss,er</sub> ≡ 规格书 Co(er) <b>单管值</b>，N<sub>sw</sub> = 半桥 2 / 全桥 4 只管各计一次；定义式无需 2/3 修正；ZVS 下 ≈0，储能被谐振腔回收）</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2 pr-4 font-medium">体二极管导通</td>
                <td className="py-2 pr-4 font-mono">{losses.mosfetDiode.toFixed(3)}</td>
                <td className="py-2 pr-4">{((losses.mosfetDiode / losses.totalLoss) * 100).toFixed(1)}%</td>
                <td className="py-2 text-text-secondary">Pdiode = Vsd·Im,off·(td−tZVS)·fsw·Nsw（净放电时间）</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2 pr-4 font-medium">磁芯损耗</td>
                <td className="py-2 pr-4 font-mono">{losses.coreLoss.toFixed(3)}</td>
                <td className="py-2 pr-4">{((losses.coreLoss / losses.totalLoss) * 100).toFixed(1)}%</td>
                <td className="py-2 text-text-secondary">
                  {params.coreLossMode === 'pcv'
                    ? `Pcore = P_cv·Ve·k_wave（手册法）｜Steinmetz 拟合估算 ${losses.coreLossSteinmetz.toFixed(3)} W`
                    : `Pcore = Cm·f^α·B^β·Ve（拟合）｜手册法估算 ${losses.coreLossPcv.toFixed(3)} W`}
                </td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2 pr-4 font-medium">绕组损耗</td>
                <td className="py-2 pr-4 font-mono">{losses.windingLoss.toFixed(3)}</td>
                <td className="py-2 pr-4">{((losses.windingLoss / losses.totalLoss) * 100).toFixed(1)}%</td>
                <td className="py-2 text-text-secondary">Pw = Ip²·Rdc·(1+(f/f0)²)</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2 pr-4 font-medium">整流损耗</td>
                <td className="py-2 pr-4 font-mono">{losses.rectLoss.toFixed(3)}</td>
                <td className="py-2 pr-4">{((losses.rectLoss / losses.totalLoss) * 100).toFixed(1)}%</td>
                <td className="py-2 text-text-secondary">
                  <b>{rectLabel}</b>：
                  {isSyncRect
                    ? `P = Nrect(${losses.nRect})·Is,sw²·Rds(on)·kT；Is,sw = ${losses.isSw.toFixed(2)} A = (π/4)·Io（每个整流管整周期 RMS）`
                    : `P = Nrect(${losses.nRect})·Vd(${vdDesign.toFixed(2)} V)·(Io/2)；Io = ${(calc.pout / calc.vout).toFixed(2)} A（Vd 取自设计参数）`}
                </td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2 pr-4 font-medium">谐振元件损耗</td>
                <td className="py-2 pr-4 font-mono">{losses.resonantLoss.toFixed(3)}</td>
                <td className="py-2 pr-4">{((losses.resonantLoss / losses.totalLoss) * 100).toFixed(1)}%</td>
                <td className="py-2 text-text-secondary">
                  {`P = Ip²·DCR(${losses.lrCopperLoss.toFixed(3)}) + Lr铁损(${losses.lrCoreLoss.toFixed(3)}, 正弦激励不乘 k_wave) + Ip²·ESR(${losses.crLoss.toFixed(3)}, ESR_eff=${(losses.crEsrEff * 1000).toFixed(1)} mΩ)`}
                </td>
              </tr>
              <tr className="bg-surface-elevated">
                <td className="py-2 pr-4 font-bold text-primary-light">总损耗</td>
                <td className="py-2 pr-4 font-mono font-bold text-primary-light">{losses.totalLoss.toFixed(3)}</td>
                <td className="py-2 pr-4 font-bold">100%</td>
                <td className="py-2 text-text-secondary">η = Po / (Po + Ploss)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </CollapsibleCard>
  )
}
