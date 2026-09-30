// 损耗分析面板：器件/磁芯参数输入 + 损耗汇总 + 饼图/柱图 + 分项明细表。
import { Flame } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import CollapsibleCard from './CollapsibleCard'
import { calculateLosses } from '../../lib/designer/losses'
import type { CalculatedData, LossParameters } from '../../lib/designer/types'

interface LossAnalysisPanelProps {
  calc: CalculatedData
  params: LossParameters
  setParams: (p: LossParameters) => void
  collapsed: boolean
  onToggle: () => void
}

const inputClass = 'input-field w-full'
const labelClass = 'block text-xs font-medium text-text-secondary mb-1'

export default function LossAnalysisPanel({ calc, params, setParams, collapsed, onToggle }: LossAnalysisPanelProps) {
  const losses = calculateLosses(calc, params)
  const update = <K extends keyof LossParameters>(key: K, value: LossParameters[K]) => {
    setParams({ ...params, [key]: value })
  }

  const effDiff = losses.efficiency - calc.efficiency
  const tdNs = Number.isFinite(calc.td) ? (calc.td * 1e9).toFixed(0) : '—'
  // Coss,er 取自设计参数（单一来源）；旧存档缺该字段时与损耗模型同口径兜底
  const cossErP = Number.isFinite(Number(calc.cossEr)) && Number(calc.cossEr) > 0 ? Number(calc.cossEr) : 35

  return (
    <CollapsibleCard
      icon={<Flame className="w-5 h-5 text-danger" />}
      title="损耗分析"
      collapsed={collapsed}
      onToggle={onToggle}
    >
      <div className="mt-3 space-y-5">
        {/* Input parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className={labelClass}>MOSFET Rds(on) (mΩ, 25℃)</label>
            <input type="number" className={inputClass} value={params.mosfetRdsOn} onChange={(e) => update('mosfetRdsOn', Number(e.target.value))} />
          </div>
          <div>
            <label className={labelClass}>Rds(on) 温度修正系数 kT</label>
            <input type="number" step="0.1" className={inputClass} value={params.rdsonTempFactor} onChange={(e) => update('rdsonTempFactor', Number(e.target.value))} />
            <div className="text-[10px] text-text-muted mt-0.5">原边 MOSFET 与同步整流共用；硅管 100℃ 典型 1.5~2.0</div>
          </div>
          <div>
            <label className={labelClass}>tr (ns)</label>
            <input type="number" className={inputClass} value={params.mosfetTr} onChange={(e) => update('mosfetTr', Number(e.target.value))} />
          </div>
          <div>
            <label className={labelClass}>tf (ns)</label>
            <input type="number" className={inputClass} value={params.mosfetTf} onChange={(e) => update('mosfetTf', Number(e.target.value))} />
          </div>
          <div>
            <label className={labelClass}>Coss,er (pF)</label>
            <div className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-2 flex items-center justify-between">
              <span className="font-mono text-sm text-text-primary">{cossErP}</span>
              <span className="text-[10px] text-text-muted">取自设计参数</span>
            </div>
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
            <select className={inputClass} value={params.coreMaterial} onChange={(e) => update('coreMaterial', e.target.value)}>
              <option value="PC40">PC40</option>
              <option value="PC95">PC95</option>
              <option value="PC200">PC200</option>
              <option value="3C95">3C95</option>
              <option value="3C97">3C97</option>
            </select>
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
            <label className={labelClass}>{calc.rectifier === 'synchronous' || calc.rectifier === 'sync-center-tapped' ? '同步整流 Rds(on) (mΩ)' : '整流 Vf (V)'}</label>
            <input type="number" step="0.1" className={inputClass} value={calc.rectifier === 'synchronous' || calc.rectifier === 'sync-center-tapped' ? params.syncRectRdsOn : params.rectVf} onChange={(e) => update(calc.rectifier === 'synchronous' || calc.rectifier === 'sync-center-tapped' ? 'syncRectRdsOn' : 'rectVf', Number(e.target.value))} />
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
                <div className="text-[10px] text-text-muted mt-0.5">规格书惯例值（如 0.001）</div>
              </div>
              <div>
                <label className={labelClass}>Cr DF 频率修正倍数</label>
                <input type="number" step="0.1" className={inputClass} value={params.crDfK} onChange={(e) => update('crDfK', Number(e.target.value))} />
                <div className="text-[10px] text-text-muted mt-0.5">1kHz → fsw 的 tanδ 倍数</div>
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
            <div className="text-[10px] text-text-muted mt-0.5">目标温度/频率/B 下查手册</div>
          </div>
          <div>
            <label className={labelClass}>波形修正 k_wave</label>
            <input type="number" step="0.05" className={inputClass} value={params.coreWaveK} onChange={(e) => update('coreWaveK', Number(e.target.value))} />
            <div className="text-[10px] text-text-muted mt-0.5">方波励磁相对正弦，默认 1.25</div>
          </div>
          <div>
            <label className={labelClass}>Lr 磁芯 P_cv (mW/cm³)</label>
            <input type="number" className={inputClass} value={params.lrCorePcv} onChange={(e) => update('lrCorePcv', Number(e.target.value))} />
            <div className="text-[10px] text-text-muted mt-0.5">默认按 B_Lr≈0.15 T 查 PC95 手册；须按实际磁芯重查（填 0 则不计）</div>
          </div>
          <div>
            <label className={labelClass}>Lr 磁芯 Ve (cm³)</label>
            <input type="number" step="0.1" className={inputClass} value={params.lrCoreVe} onChange={(e) => update('lrCoreVe', Number(e.target.value))} />
            <div className="text-[10px] text-text-muted mt-0.5">默认取变压器 Ve 的 1/4；正弦激励，不乘 k_wave</div>
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
                <td className="py-2 text-text-secondary">Pon = 0.5·Vin·Ip·tr·fsw·Nsw（ZVS下≈0）</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2 pr-4 font-medium">MOSFET 关断损耗</td>
                <td className="py-2 pr-4 font-mono">{losses.mosfetSwitchOff.toFixed(3)}</td>
                <td className="py-2 pr-4">{((losses.mosfetSwitchOff / losses.totalLoss) * 100).toFixed(1)}%</td>
                <td className="py-2 text-text-secondary">Poff = 0.5·Vin·Im,off·tf·fsw·Nsw（关断瞬间为励磁电流峰值）</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2 pr-4 font-medium">Coss 损耗</td>
                <td className="py-2 pr-4 font-mono">{losses.mosfetCoss.toFixed(3)}</td>
                <td className="py-2 pr-4">{((losses.mosfetCoss / losses.totalLoss) * 100).toFixed(1)}%</td>
                <td className="py-2 text-text-secondary">E_oss = ½·C<sub>oss,er</sub>·V<sub>in,nom</sub>²·f<sub>sw</sub>·N<sub>sw</sub>（C<sub>oss,er</sub> ≡ 规格书 Co(er)，定义式无需 2/3 修正；ZVS 下 ≈0，储能被谐振腔回收）</td>
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
                  {calc.rectifier === 'synchronous' || calc.rectifier === 'sync-center-tapped'
                    ? `P = Nrect(${losses.nRect})·Is,sw²·Rds(on)·kT；Is,sw = ${losses.isSw.toFixed(2)} A = (π/4)·Io（每个整流管整周期 RMS）`
                    : `P = Nrect(${losses.nRect})·Vf·(Io/2)；Io = ${(calc.pout / calc.vout).toFixed(2)} A`}
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
