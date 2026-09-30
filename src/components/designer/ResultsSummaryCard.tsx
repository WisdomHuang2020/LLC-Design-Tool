// 计算结果卡片：关键参数网格 + 增益-频率特性曲线。
import { useState } from 'react'
import { TrendingUp } from 'lucide-react'
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import CollapsibleCard from './CollapsibleCard'
import ResultItem from './ResultItem'
import { boundaryFn, boundaryGain, fminTextbook, qmax1Boundary } from '../../lib/designer/llcMath'
import type { CalculatedData } from '../../lib/designer/types'

interface ResultsSummaryCardProps {
  calculated: CalculatedData
  /** 死区时间（ns），用于 ZVS 时间裕量条目的公式说明 */
  td: number
  collapsed: boolean
  onToggle: () => void
}

/**
 * Qmax1 的展示口径 —— 两条**不同判据**，不是谁近似谁：
 * - peak：本站默认。令增益曲线**峰值**（dM/dfn=0）恰等于 Gmax。
 * - boundary：令**感容分界点**（Im Zin = 0）的增益恰等于 Gmax；其解析解即教材闭式。
 * 仅影响展示，不参与设计计算（设计始终用 peak 判据，除非另有说明）。
 */
type Qmax1Mode = 'peak' | 'boundary'

export default function ResultsSummaryCard({ calculated, td, collapsed, onToggle }: ResultsSummaryCardProps) {
  // 展示口径开关（本地视图状态，不持久化）
  const [qmax1Mode, setQmax1Mode] = useState<Qmax1Mode>('peak')
  const qmax1BndVal = qmax1Boundary(calculated.k, calculated.gMax)
  const fminTextbookVal = fminTextbook(calculated.fr, calculated.k, calculated.gMax)
  const showBoundary = qmax1Mode === 'boundary' && Number.isFinite(qmax1BndVal)

  // 感性/容性分界点：本站判据（峰值）与感性区可用上限（分界点）之差由此量化
  const fnBnd = boundaryFn(calculated.k, calculated.q)
  const mBnd = boundaryGain(calculated.k, calculated.q)
  const bndOk = Number.isFinite(mBnd)

  return (
    <CollapsibleCard
      icon={<TrendingUp className="w-5 h-5 text-primary-light" />}
      title="计算结果"
      collapsed={collapsed}
      onToggle={onToggle}
    >
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
          <ResultItem label="匝比 n" value={calculated.n.toFixed(2)} unit="" formula="n = Vinnom/(2·(Vo+Vf)) 或 Vinnom/(Vo+Vf)" />
          <ResultItem label="谐振频率 fr" value={(calculated.fr / 1000).toFixed(1)} unit="kHz" formula="fr = 1/(2π√(Lr·Cr))" />
          <ResultItem label="谐振电感 Lr" value={(calculated.lr * 1e6).toFixed(2)} unit="μH" formula="Lr = Zr / (2π·fr)" />
          <ResultItem label="谐振电容 Cr" value={(calculated.cr * 1e9).toFixed(2)} unit="nF" formula="Cr = 1/(2π·fr·Zr)" />
          <ResultItem label="励磁电感 Lm" value={(calculated.lm * 1e6).toFixed(2)} unit="μH" formula="Lm = k·Lr" />
          <ResultItem label="品质因数 Q" value={calculated.q.toFixed(3)} unit="" formula="Q = m · Qmax（满载，Qmax = min(Qmax1~3)）；等价定义 Q = Zr / Rac" />
          <ResultItem label="电感比 k" value={calculated.k.toFixed(2)} unit="" formula="k = Lm / Lr" />
          <ResultItem
            label="所需增益 Gmin"
            value={calculated.gMin.toFixed(3)}
            unit=""
            formula="Gmin = Vinnom/Vinmax"
            highlight="good"
          />
          <ResultItem
            label="所需增益 Gmax"
            value={calculated.gMax.toFixed(3)}
            unit=""
            formula="Gmax = Vinnom/Vinmin"
            highlight={calculated.mMax >= calculated.gMax * 1.05 ? 'good' : calculated.mMax >= calculated.gMax ? 'warn' : 'critical'}
          />
          <ResultItem
            label="空载增益下限"
            value={calculated.gmaxEmpty.toFixed(3)}
            unit=""
            formula="Gempty = k/(k+1)（Region 1 高频极限，须 ≤ Gmin）"
            highlight={calculated.gmaxEmpty <= calculated.gMin * 0.95 ? 'good' : calculated.gmaxEmpty <= calculated.gMin ? 'warn' : 'critical'}
          />
          <ResultItem
            label="峰值增益 Mpeak"
            value={calculated.mMax.toFixed(3)}
            unit=""
            formula="数值寻优峰顶（dM/dfn = 0）；⚠ 峰顶恒落在容性区，感性区内取不到此值 —— 判断「够不够」请看下行的 Mbnd"
            highlight={calculated.mMax >= calculated.gMax * 1.05 ? 'good' : calculated.mMax >= calculated.gMax ? 'warn' : 'critical'}
          />
          <ResultItem
            label="感性区增益上限 Mbnd"
            value={bndOk ? mBnd.toFixed(3) : '—'}
            unit=""
            formula={
              bndOk
                ? `分界点（Im Zin = 0，fn=${fnBnd.toFixed(3)}）处的增益；感性区内 M 随 fn 单调下降，此即真正可达的上限（须 ≥ Gmax=${calculated.gMax.toFixed(3)}）`
                : '分界点不可解（参数越界）'
            }
            highlight={!bndOk ? undefined : mBnd >= calculated.gMax * 1.05 ? 'good' : mBnd >= calculated.gMax ? 'warn' : 'critical'}
          />
          <ResultItem label="fmax（高输入）" value={Number.isFinite(calculated.fmax) ? (calculated.fmax / 1000).toFixed(1) : '—'} unit={Number.isFinite(calculated.fmax) ? 'kHz' : ''} formula="fmax = fr·√[Gmin/(Gmin·(k+1)-k)]（空载推导口径；与 fmin 不对称）" />
          <ResultItem label="fmin（满载低输入）" value={(calculated.fmin / 1000).toFixed(1)} unit="kHz" formula="满载增益曲线 M=Gmax 的交点（感性区，最坏工况）" />
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
            formula={`tZVS=${(calculated.tZvs * 1e9).toFixed(1)}ns / Td=${td}ns`}
            highlight={calculated.zvsTimeOk ? 'good' : 'critical'}
          />
          <ResultItem label="谐振电流 Ir,rms（负载支路分量）" value={calculated.irRms.toFixed(2)} unit="A" formula="Ir,rms = VFHA,rms / Rac（基波有效值；FHA 等效负载支路分量）；与 Im,rms 方和根 = 原边总电流" />
          <ResultItem label="励磁电流 Im,rms（有效值）" value={calculated.imRms.toFixed(2)} unit="A" formula="Im,rms = VLm/(4√3·f·Lm)（VLm=Vin/2 半桥，Vin 全桥）" />
          <ResultItem label="励磁电流 Im,off（关断峰值）" value={Number.isFinite(calculated.imOff) ? calculated.imOff.toFixed(3) : '—'} unit={Number.isFinite(calculated.imOff) ? 'A' : ''} formula="Im,off = Vin,min/(8·fmax·Lm)（半桥；全桥系数 4），ZVS 能量判据用此值" />
          <ResultItem label="原边总电流 Ip,rms" value={calculated.ipRms.toFixed(2)} unit="A" formula="Ip,rms = √(Ir,rms² + Im,rms²)，即流过 Lr、Cr 与变压器原边绕组的电流" />
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
          <ResultItem
            label="Qmax1（增益能力约束）"
            value={
              showBoundary
                ? qmax1BndVal.toFixed(3)
                : Number.isFinite(calculated.qmax1)
                  ? calculated.qmax1.toFixed(3)
                  : '—'
            }
            unit=""
            formula={
              showBoundary
                ? '分界判据：令分界点增益 Mbnd 恰等于 Gmax｜解析解 = 教材式 1/(k·Gmax)·√(k+Gmax²/(Gmax²−1))，保证感性区内够得着'
                : '峰值判据：令峰值增益 Mpeak 恰等于 Gmax｜峰顶在容性区，故感性区内略够不到（默认参数差 0.15%）'
            }
            action={
              <div className="flex gap-0.5 shrink-0">
                {(['peak', 'boundary'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setQmax1Mode(m)}
                    className={`px-1.5 py-0.5 rounded text-[10px] leading-none border transition-colors ${
                      qmax1Mode === m
                        ? 'bg-primary/20 border-primary/50 text-primary-light'
                        : 'border-border text-text-muted hover:text-text-secondary'
                    }`}
                  >
                    {m === 'peak' ? '峰值判据' : '分界判据'}
                  </button>
                ))}
              </div>
            }
          />
          <ResultItem label="Qmax2（Coss,eq 约束）" value={Number.isFinite(calculated.qmax2) ? calculated.qmax2.toFixed(3) : '—'} unit="" formula="由原边 Coss,eq / Cj 与 fmax 决定；不含死区时间（死区由「ZVS时间裕量」单独校验）" />
          <ResultItem label="Qmax3（ZVS 能量约束）" value={Number.isFinite(calculated.qmax3) ? calculated.qmax3.toFixed(3) : '—'} unit="" formula="励磁电感储能 ≥ 结电容总能量，用 Coss,er / Cj 口径" />
          <ResultItem label="等效AC电阻 Rac" value={calculated.rac.toFixed(2)} unit="Ω" formula="Rac = 8n²Vout²/(π²Po)" />
        </div>

        {/* fmin / fmax 口径说明（两值并列，供对照；不参与设计计算） */}
        <div className="mt-4 rounded-lg border border-border bg-surface-elevated p-3 text-xs leading-relaxed">
          <p className="font-medium text-text-primary mb-1.5">fmin / fmax 的口径说明</p>
          <div className="space-y-1 font-mono text-text-secondary">
            <div>fmax = {Number.isFinite(calculated.fmax) ? (calculated.fmax / 1000).toFixed(1) : '—'} kHz —— 空载增益公式推导（fn&gt;1 侧）</div>
            <div>fmin = {(calculated.fmin / 1000).toFixed(1)} kHz —— 本站口径：满载增益曲线 M=Gmax 的交点（感性区，最坏工况）</div>
            <div>fmin(教材式) = {Number.isFinite(fminTextbookVal) ? (fminTextbookVal / 1000).toFixed(1) : '—'} kHz —— fr/√(1+k(1−1/Gmax²))，即「感容分界轨迹 ∩ Gmax」的精确 fn（ZVS 安全下限，非近似）</div>
          </div>
          <p className="mt-1.5 text-text-muted">
            本站 fmax 取空载口径、fmin 取满载口径，两者不对称是有意为之（分别对应最高/最低输入电压的最坏工况）；
            教材 fmin 式与本站满载交点式<b className="text-text-secondary">是两条不同曲线与 Gmax 的交点</b>：
            本站是「<b className="text-text-secondary">设计曲线 ∩ Gmax</b>」（实际工作频率），教材式是「<b className="text-text-secondary">感容分界轨迹 ∩ Gmax</b>」（ZVS 安全下限）。
            本站值只要高于自身分界频率（本设计 {Number.isFinite(fnBnd) ? (fnBnd * calculated.fr / 1000).toFixed(1) : '—'} kHz）即为安全。
          </p>
        </div>

        {/* Qmax1 两种判据 + 感性区可用上限（并列展示，供对照；不参与设计计算） */}
        <div className="mt-4 rounded-lg border border-border bg-surface-elevated p-3 text-xs leading-relaxed">
          <p className="font-medium text-text-primary mb-1.5">Qmax1 的两种判据与「感性区够不够得着」</p>
          <div className="space-y-1 font-mono text-text-secondary">
            <div>峰值判据（本站默认）Qmax1 = {Number.isFinite(calculated.qmax1) ? calculated.qmax1.toFixed(5) : '—'} —— 令峰顶 Mpeak = Gmax</div>
            <div>分界判据（教材闭式）Qmax1 = {Number.isFinite(qmax1BndVal) ? qmax1BndVal.toFixed(5) : '—'} —— 令分界点 Mbnd = Gmax，更保守</div>
            <div>本设计分界点 fn = {Number.isFinite(fnBnd) ? fnBnd.toFixed(4) : '—'}，该点 Mbnd = {bndOk ? mBnd.toFixed(5) : '—'}，Mpeak = {calculated.mMax.toFixed(5)}</div>
            <div>感性区可用裕量 = {bndOk ? ((mBnd - calculated.gMax) / calculated.gMax * 100).toFixed(3) : '—'}%（按 Mbnd），曲线峰顶显示裕量 = {((calculated.mMax - calculated.gMax) / calculated.gMax * 100).toFixed(3)}%</div>
          </div>
          <p className="mt-1.5 text-text-muted">
            两条判据都自洽，<b className="text-text-secondary">不是谁近似谁</b>：峰顶恒在分界点左侧（实测左移 2%~15%，Q 越小偏得越多），
            即<b className="text-text-secondary">峰顶位于容性区</b>；
            感性区内增益最大值出现在分界点。故按峰值判据取 Qmax1 时，感性区内实际<b className="text-text-secondary">略够不到</b> Gmax
            （默认参数差约 0.15%，平时被 m 裕量掩盖）。若需与计算书逐位对齐或取最保守口径，请把上行切到「分界判据」。
          </p>
        </div>

        {/* 增益-频率曲线 */}
        <div className="mt-6 pt-4 border-t border-border">
          <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary-light" />
            增益-频率特性曲线（k={calculated.k.toFixed(1)}, Q满载={calculated.q.toFixed(3)}）
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
                  domain={[0, (dataMax: number) => Math.max(2, Math.ceil(dataMax * 1.1))]}
                  ticks={[0, 0.5, 1, 1.5, 2]}
                  label={{ value: 'M(fn)', angle: -90, position: 'insideLeft', offset: 5, fill: '#94a3b8', fontSize: 12 }}
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '6px', fontSize: '12px' }}
                  labelFormatter={(v: number) => `fn = ${v.toFixed(2)}`}
                  formatter={(v: number, name: string) => [`M = ${v.toFixed(3)}`, name === 'm' ? '满载' : '最小负载']}
                />
                <Line type="monotone" dataKey="m" stroke="#38bdf8" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="mLight" stroke="#a78bfa" strokeWidth={1.5} dot={false} strokeDasharray="6 3" />
                {/* 参考线：Gmax, Gmin, fr */}
                <ReferenceLine y={calculated.gMax} stroke="#ef4444" strokeDasharray="5 5" strokeWidth={1} label={{ value: `Gmax=${calculated.gMax.toFixed(3)}`, fill: '#ef4444', fontSize: 10, position: 'right' }} />
                <ReferenceLine y={calculated.gMin} stroke="#22c55e" strokeDasharray="5 5" strokeWidth={1} label={{ value: `Gmin=${calculated.gMin.toFixed(3)}`, fill: '#22c55e', fontSize: 10, position: 'right' }} />
                <ReferenceLine x={1} stroke="#94a3b8" strokeDasharray="3 3" strokeWidth={1} label={{ value: 'fr', fill: '#94a3b8', fontSize: 10, position: 'top' }} />
                {/* 感容分界点：左侧为容性区（不可工作），右侧为感性区 */}
                {Number.isFinite(fnBnd) && (
                  <ReferenceLine
                    x={Number(fnBnd.toFixed(2))}
                    stroke="#f59e0b"
                    strokeDasharray="4 2"
                    strokeWidth={1.5}
                    label={{ value: `分界 fn=${fnBnd.toFixed(3)}`, fill: '#f59e0b', fontSize: 10, position: 'top' }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-4 mt-2 text-xs text-text-secondary">
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-[#38bdf8]" /> 满载增益曲线</span>
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-[#a78bfa]" /> 最小负载增益曲线</span>
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-[#ef4444] border-dashed" /> Gmax = {calculated.gMax.toFixed(3)}</span>
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-[#22c55e] border-dashed" /> Gmin = {calculated.gMin.toFixed(3)}</span>
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-[#94a3b8]" /> fr (fn=1)</span>
            {Number.isFinite(fnBnd) && (
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-[#f59e0b]" /> 感容分界 fn={fnBnd.toFixed(3)}（左侧容性区）</span>
            )}
          </div>
        </div>
      </div>
    </CollapsibleCard>
  )
}
