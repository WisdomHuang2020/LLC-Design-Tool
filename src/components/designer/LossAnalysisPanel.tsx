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
            <label className={labelClass}>MOSFET Rds(on) (mΩ)</label>
            <input type="number" className={inputClass} value={params.mosfetRdsOn} onChange={(e) => update('mosfetRdsOn', Number(e.target.value))} />
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
            <label className={labelClass}>Coss (pF, 0V 标称/能量等效)</label>
            <input type="number" className={inputClass} value={params.mosfetCoss} onChange={(e) => update('mosfetCoss', Number(e.target.value))} />
          </div>
          <div>
            <label className={labelClass}>Vsd (V)</label>
            <input type="number" className={inputClass} value={params.mosfetVsd} onChange={(e) => update('mosfetVsd', Number(e.target.value))} />
          </div>
          <div>
            <label className={labelClass}>死区时间 (ns)</label>
            <input type="number" className={inputClass} value={params.deadTime} onChange={(e) => update('deadTime', Number(e.target.value))} />
          </div>
          <div>
            <label className={labelClass}>初级匝数 Np</label>
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
            <label className={labelClass}>Steinmetz C_m (mW·cm⁻³·kHz⁻ᵃ·mT⁻ᵝ)</label>
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
            <label className={labelClass}>Cr ESR (mΩ)</label>
            <input type="number" className={inputClass} value={params.crEsr} onChange={(e) => update('crEsr', Number(e.target.value))} />
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
                <td className="py-2 text-text-secondary">Pcond = Ip²·Rds(on)（每管半周）</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2 pr-4 font-medium">MOSFET 开通损耗</td>
                <td className="py-2 pr-4 font-mono">{losses.mosfetSwitchOn.toFixed(3)}</td>
                <td className="py-2 pr-4">{((losses.mosfetSwitchOn / losses.totalLoss) * 100).toFixed(1)}%</td>
                <td className="py-2 text-text-secondary">Pon = 0.5·Vin·Ip·tr·fsw（ZVS下≈0）</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2 pr-4 font-medium">MOSFET 关断损耗</td>
                <td className="py-2 pr-4 font-mono">{losses.mosfetSwitchOff.toFixed(3)}</td>
                <td className="py-2 pr-4">{((losses.mosfetSwitchOff / losses.totalLoss) * 100).toFixed(1)}%</td>
                <td className="py-2 text-text-secondary">Poff = 0.5·Vin·Ip·tf·fsw</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2 pr-4 font-medium">Coss 损耗</td>
                <td className="py-2 pr-4 font-mono">{losses.mosfetCoss.toFixed(3)}</td>
                <td className="py-2 pr-4">{((losses.mosfetCoss / losses.totalLoss) * 100).toFixed(1)}%</td>
                <td className="py-2 text-text-secondary">Ecoss ≈ 0.5·Coss·Vin²·(2/3)，ZVS 下≈0</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2 pr-4 font-medium">体二极管导通</td>
                <td className="py-2 pr-4 font-mono">{losses.mosfetDiode.toFixed(3)}</td>
                <td className="py-2 pr-4">{((losses.mosfetDiode / losses.totalLoss) * 100).toFixed(1)}%</td>
                <td className="py-2 text-text-secondary">Pdiode = Vsd·Id·td·fsw</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2 pr-4 font-medium">磁芯损耗</td>
                <td className="py-2 pr-4 font-mono">{losses.coreLoss.toFixed(3)}</td>
                <td className="py-2 pr-4">{((losses.coreLoss / losses.totalLoss) * 100).toFixed(1)}%</td>
                <td className="py-2 text-text-secondary">Pcore = k·f^α·B^β·Ve</td>
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
                <td className="py-2 text-text-secondary">{calc.rectifier === 'synchronous' || calc.rectifier === 'sync-center-tapped' ? 'P = Is²·Rds(on)' : 'P = Vf·Io'}</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2 pr-4 font-medium">谐振元件损耗</td>
                <td className="py-2 pr-4 font-mono">{losses.resonantLoss.toFixed(3)}</td>
                <td className="py-2 pr-4">{((losses.resonantLoss / losses.totalLoss) * 100).toFixed(1)}%</td>
                <td className="py-2 text-text-secondary">P = Ip²·(DCR+ESR)</td>
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
