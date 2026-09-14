// 计算结果卡片：关键参数网格 + 增益-频率特性曲线。
import { TrendingUp } from 'lucide-react'
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import CollapsibleCard from './CollapsibleCard'
import ResultItem from './ResultItem'
import type { CalculatedData } from '../../lib/designer/types'

interface ResultsSummaryCardProps {
  calculated: CalculatedData
  /** 死区时间（ns），用于 ZVS 时间裕量条目的公式说明 */
  td: number
  collapsed: boolean
  onToggle: () => void
}

export default function ResultsSummaryCard({ calculated, td, collapsed, onToggle }: ResultsSummaryCardProps) {
  return (
    <CollapsibleCard
      icon={<TrendingUp className="w-5 h-5 text-primary-light" />}
      title="计算结果"
      collapsed={collapsed}
      onToggle={onToggle}
    >
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
          <ResultItem label="匝比 n" value={calculated.n.toFixed(2)} unit="" formula="n = Vin_nom/(2·(Vout+Vd)) 或 Vin_nom/(Vout+Vd)" />
          <ResultItem label="谐振频率 fr" value={(calculated.fr / 1000).toFixed(1)} unit="kHz" formula="fr = 1/(2π√(Lr·Cr))" />
          <ResultItem label="谐振电感 Lr" value={(calculated.lr * 1e6).toFixed(2)} unit="μH" formula="Lr = Zr / (2π·fr)" />
          <ResultItem label="谐振电容 Cr" value={(calculated.cr * 1e9).toFixed(2)} unit="nF" formula="Cr = 1/(2π·fr·Zr)" />
          <ResultItem label="励磁电感 Lm" value={(calculated.lm * 1e6).toFixed(2)} unit="μH" formula="Lm = k·Lr" />
          <ResultItem label="品质因数 Q" value={calculated.q.toFixed(3)} unit="" formula="Q = Zr / Racmin" />
          <ResultItem label="电感比 k" value={calculated.k.toFixed(2)} unit="" formula="k = Lm / Lr" />
          <ResultItem
            label="所需增益 Gmin"
            value={calculated.gMin.toFixed(3)}
            unit=""
            formula="Gmin = Vin_nom/Vin_max"
            highlight="good"
          />
          <ResultItem
            label="所需增益 Gmax"
            value={calculated.gMax.toFixed(3)}
            unit=""
            formula="Gmax = Vin_nom/Vin_min"
            highlight={calculated.mMax >= calculated.gMax * 1.05 ? 'good' : calculated.mMax >= calculated.gMax ? 'warn' : 'critical'}
          />
          <ResultItem
            label="空载峰值增益"
            value={calculated.gmaxEmpty.toFixed(3)}
            unit=""
            formula="Gempty = 1 + 1/k"
            highlight={calculated.gmaxEmpty >= calculated.gMax * 1.05 ? 'good' : calculated.gmaxEmpty >= calculated.gMax ? 'warn' : 'critical'}
          />
          <ResultItem
            label="峰值增益 Mmax"
            value={calculated.mMax.toFixed(3)}
            unit=""
            formula="数值寻优峰值"
            highlight={calculated.mMax >= calculated.gMax * 1.05 ? 'good' : calculated.mMax >= calculated.gMax ? 'warn' : 'critical'}
          />
          <ResultItem label="fmax（高输入）" value={Number.isFinite(calculated.fmax) ? (calculated.fmax / 1000).toFixed(1) : '—'} unit={Number.isFinite(calculated.fmax) ? 'kHz' : ''} formula="fmax = fr·√[Gmin/(Gmin·(k+1)-k)]" />
          <ResultItem label="fmin（低输入）" value={(calculated.fmin / 1000).toFixed(1)} unit="kHz" formula="fmin = fr·√[Gmax/(Gmax·(k+1)-k)]" />
          <ResultItem
            label="ZVS能量裕量"
            value={calculated.zvsMargin ? '可达' : '不足'}
            unit=""
            formula={`Er=${(calculated.zvsEr * 1e6).toFixed(3)}μJ / Ec=${(calculated.zvsEc * 1e6).toFixed(3)}μJ`}
            highlight={calculated.zvsMargin ? 'good' : 'critical'}
          />
          <ResultItem
            label="ZVS时间裕量"
            value={calculated.zvsTimeOk ? '充裕' : '不足'}
            unit=""
            formula={`t_ZVS=${(calculated.tZvs * 1e9).toFixed(1)}ns / Td=${td}ns`}
            highlight={calculated.zvsTimeOk ? 'good' : 'critical'}
          />
          <ResultItem label="谐振电流 Ir" value={calculated.irRms.toFixed(2)} unit="A" formula="Ir = V_in1 / Rac（谐振频率处近似）" />
          <ResultItem label="励磁电流 Im" value={calculated.imRms.toFixed(2)} unit="A" formula="Im = Vin/(4·f·Lm)" />
          <ResultItem label="初级电流 RMS" value={calculated.ipRms.toFixed(2)} unit="A" formula="Ip = √(Ir² + Im²)" />
          <ResultItem label="次级电流 RMS" value={calculated.isRms.toFixed(2)} unit="A" formula={calculated.rectifier === 'center-tapped' || calculated.rectifier === 'sync-center-tapped' ? 'Is = (π/4)·Io' : 'Is = (π/2√2)·Io'} />
          <ResultItem
            label="峰值磁密 Bpeak"
            value={(calculated.bPeak * 1000).toFixed(1)}
            unit="mT"
            formula="Bpeak = Vp/(4·f·Np·Ae)"
            highlight={
              calculated.bPeak * 1000 > 300
                ? 'critical'
                : calculated.bPeak * 1000 > 200
                  ? 'warn'
                  : 'good'
            }
          />
          <ResultItem label="Qmax1 (增益)" value={calculated.qmax1.toFixed(3)} unit="" formula="峰值增益约束" />
          <ResultItem label="Qmax2 (ZVS)" value={calculated.qmax2.toFixed(3)} unit="" formula="死区时间约束" />
          <ResultItem label="Qmax3 (Coss)" value={calculated.qmax3.toFixed(3)} unit="" formula="寄生电容约束" />
          <ResultItem label="等效AC电阻 Rac" value={calculated.rac.toFixed(2)} unit="Ω" formula="Rac = 8n²Vout²/(π²Po)" />
        </div>

        {/* 增益-频率曲线 */}
        <div className="mt-6 pt-4 border-t border-border">
          <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary-light" />
            增益-频率特性曲线 (k={calculated.k.toFixed(1)}, Q={calculated.q.toFixed(3)})
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={calculated.gainCurveData} margin={{ top: 5, right: 20, left: 10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="fn"
                  type="number"
                  domain={[0, 2]}
                  ticks={[0, 0.5, 1, 1.5, 2]}
                  label={{ value: 'fn = f/fr', position: 'insideBottom', offset: -10, fill: '#94a3b8', fontSize: 12 }}
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                />
                <YAxis
                  domain={[0, 2]}
                  ticks={[0, 0.5, 1, 1.5, 2]}
                  label={{ value: 'M(fn)', angle: -90, position: 'insideLeft', offset: 5, fill: '#94a3b8', fontSize: 12 }}
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '6px', fontSize: '12px' }}
                  labelFormatter={(v: number) => `fn = ${v.toFixed(2)}`}
                  formatter={(v: number) => [`M = ${v.toFixed(3)}`, '增益']}
                />
                <Line type="monotone" dataKey="m" stroke="#38bdf8" strokeWidth={2} dot={false} />
                {/* 参考线：Gmax, Gmin, fr */}
                <ReferenceLine y={calculated.gMax} stroke="#ef4444" strokeDasharray="5 5" strokeWidth={1} label={{ value: `Gmax=${calculated.gMax.toFixed(3)}`, fill: '#ef4444', fontSize: 10, position: 'right' }} />
                <ReferenceLine y={calculated.gMin} stroke="#22c55e" strokeDasharray="5 5" strokeWidth={1} label={{ value: `Gmin=${calculated.gMin.toFixed(3)}`, fill: '#22c55e', fontSize: 10, position: 'right' }} />
                <ReferenceLine x={1} stroke="#94a3b8" strokeDasharray="3 3" strokeWidth={1} label={{ value: 'fr', fill: '#94a3b8', fontSize: 10, position: 'top' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-4 mt-2 text-xs text-text-secondary">
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-[#38bdf8]" /> 增益曲线 M(fn)</span>
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-[#ef4444] border-dashed" /> Gmax = {calculated.gMax.toFixed(3)}</span>
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-[#22c55e] border-dashed" /> Gmin = {calculated.gMin.toFixed(3)}</span>
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-[#94a3b8]" /> fr (fn=1)</span>
          </div>
        </div>
      </div>
    </CollapsibleCard>
  )
}
