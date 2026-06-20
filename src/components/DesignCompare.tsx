import { useState, useMemo } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  Cell,
} from 'recharts'
import { Save, Trash2, BarChart3, TrendingUp, Award, AlertTriangle, CheckCircle } from 'lucide-react'

interface DesignSnapshot {
  id: string
  name: string
  timestamp: number
  params: {
    vinMin: number
    vinMax: number
    vinNom: number
    vout: number
    pout: number
    efficiency: number
    fsw: number
    topology: string
    rectifier: string
    loadMin: number
    loadMax: number
  }
  results: {
    n: number
    fr: number
    lr: number
    cr: number
    lm: number
    q: number
    k: number
    mMax: number
    mRequired: number
    zvsMargin: boolean
    ipRms: number
    isRms: number
  }
}

const STORAGE_KEY = 'llc_design_compare'

function loadDesigns(): DesignSnapshot[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // ignore
  }
  return []
}

function saveDesigns(designs: DesignSnapshot[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(designs))
}

function calcGain(fn: number, k: number, q: number): number {
  const a = 1 + (1 / k) * (1 - 1 / (fn * fn))
  const b = q * (fn - 1 / fn)
  return 1 / Math.sqrt(a * a + b * b)
}

export default function DesignCompare() {
  const [designs, setDesigns] = useState<DesignSnapshot[]>(loadDesigns)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [showGainChart, setShowGainChart] = useState(true)
  const [showEffChart, setShowEffChart] = useState(true)

  const selectedDesigns = useMemo(
    () => designs.filter((d) => selectedIds.includes(d.id)),
    [designs, selectedIds]
  )

  const gainChartData = useMemo(() => {
    if (selectedDesigns.length === 0) return []
    const data: Array<Record<string, number>> = []
    for (let fn = 0.5; fn <= 2.0; fn += 0.02) {
      const row: Record<string, number> = { fn }
      selectedDesigns.forEach((d) => {
        row[`${d.name}_M`] = calcGain(fn, d.results.k, d.results.q)
      })
      data.push(row)
    }
    return data
  }, [selectedDesigns])

  const effChartData = useMemo(() => {
    return selectedDesigns.map((d) => ({
      name: d.name,
      efficiency: d.params.efficiency,
      fsw: d.params.fsw,
    }))
  }, [selectedDesigns])

  const COLORS = ['#14b8a6', '#f59e0b', '#3b82f6', '#ef4444', '#a855f7', '#22c55e']

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const handleDelete = (id: string) => {
    const next = designs.filter((d) => d.id !== id)
    setDesigns(next)
    saveDesigns(next)
    setSelectedIds((prev) => prev.filter((x) => x !== id))
  }

  const handleClearAll = () => {
    if (!confirm('确定要清空所有保存的设计吗？')) return
    setDesigns([])
    saveDesigns([])
    setSelectedIds([])
  }

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(designs, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'llc_designs.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const scoreDesign = (d: DesignSnapshot) => {
    // Efficiency score: linear up to 97%
    const effScore = Math.min(d.params.efficiency / 97, 1) * 40
    // Frequency range score: narrow range is better
    // Approximate fmax/fmin from gain curve: at mRequired, find fn
    // Simplified: use Q and k to estimate
    const q = d.results.q
    const k = d.results.k
    const freqRangeScore = Math.max(0, 1 - (q * 0.5 + k)) * 30
    // ZVS margin score
    const zvsScore = d.results.zvsMargin ? 30 : 0
    return effScore + freqRangeScore + zvsScore
  }

  const rankedDesigns = useMemo(() => {
    return [...selectedDesigns].sort((a, b) => scoreDesign(b) - scoreDesign(a))
  }, [selectedDesigns])

  const bestDesign = rankedDesigns[0]

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-surface border border-border rounded-lg p-3 shadow-xl">
        <p className="text-text-secondary text-sm font-mono mb-1">
          {typeof label === 'number' ? `fn = ${label.toFixed(2)}` : label}
        </p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm font-mono" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(3) : entry.value}
          </p>
        ))}
      </div>
    )
  }

  const cardClass = 'card-surface p-5'

  return (
    <div className={cardClass}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary-light" />
          <h2 className="text-lg font-semibold text-text-primary">A/B 设计对比</h2>
        </div>
        <div className="flex items-center gap-2">
          {designs.length > 0 && (
            <button
              onClick={handleExport}
              className="px-3 py-1.5 text-xs bg-surface-elevated border border-border rounded hover:border-border-light text-text-secondary transition-colors"
            >
              导出 JSON
            </button>
          )}
          {designs.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-3 py-1.5 text-xs bg-red-500/10 border border-red-500/30 rounded hover:bg-red-500/20 text-red-400 transition-colors"
            >
              清空全部
            </button>
          )}
        </div>
      </div>

      {designs.length === 0 ? (
        <div className="text-center py-8 text-text-muted">
          <Save className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p>暂无保存的设计。请在Designer页面点击“保存当前设计”按钮。</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Saved designs list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {designs.map((d) => {
              const isSelected = selectedIds.includes(d.id)
              return (
                <div
                  key={d.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-primary-dark/20 border-primary-light/50'
                      : 'bg-surface-elevated border-border hover:border-border-light'
                  }`}
                  onClick={() => toggleSelection(d.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-text-primary text-sm">{d.name}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(d.id)
                      }}
                      className="p-1 text-text-muted hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="text-xs text-text-secondary space-y-0.5 font-mono">
                    <p>Vin: {d.params.vinNom}V, Vout: {d.params.vout}V</p>
                    <p>fr: {(d.results.fr / 1000).toFixed(1)}kHz, Q: {d.results.q.toFixed(2)}</p>
                    <p>η: {d.params.efficiency}%</p>
                  </div>
                  <div className="mt-2 flex items-center gap-1">
                    {isSelected ? (
                      <CheckCircle className="w-3.5 h-3.5 text-primary-light" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-text-muted" />
                    )}
                    <span className="text-xs text-text-muted">{isSelected ? '已选中' : '点击选择'}</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Comparison Table */}
          {selectedDesigns.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-border text-text-secondary">
                    <th className="py-2 pr-4">参数</th>
                    {selectedDesigns.map((d) => (
                      <th key={d.id} className="py-2 pr-4 font-mono">
                        {d.name}
                      </th>
                    ))}
                    {selectedDesigns.length > 1 && <th className="py-2">差异</th>}
                  </tr>
                </thead>
                <tbody className="text-text-primary">
                  {[
                    { key: 'vinNom', label: 'Vin_nom (V)', fmt: (v: number) => v.toFixed(0) },
                    { key: 'vout', label: 'Vout (V)', fmt: (v: number) => v.toFixed(1) },
                    { key: 'pout', label: 'Pout (W)', fmt: (v: number) => v.toFixed(0) },
                    { key: 'fsw', label: 'fsw (kHz)', fmt: (v: number) => v.toFixed(0) },
                    { key: 'fr', label: 'fr (kHz)', fmt: (v: number) => (v / 1000).toFixed(1) },
                    { key: 'lr', label: 'Lr (μH)', fmt: (v: number) => (v * 1e6).toFixed(2) },
                    { key: 'cr', label: 'Cr (nF)', fmt: (v: number) => (v * 1e9).toFixed(2) },
                    { key: 'lm', label: 'Lm (μH)', fmt: (v: number) => (v * 1e6).toFixed(2) },
                    { key: 'q', label: 'Q', fmt: (v: number) => v.toFixed(2) },
                    { key: 'k', label: 'k', fmt: (v: number) => v.toFixed(2) },
                    { key: 'efficiency', label: 'η (%)', fmt: (v: number) => v.toFixed(1) },
                    { key: 'mMax', label: 'M_max', fmt: (v: number) => v.toFixed(3) },
                    { key: 'mRequired', label: 'M_req', fmt: (v: number) => v.toFixed(3) },
                    { key: 'zvsMargin', label: 'ZVS', fmt: (v: boolean | number) => (v ? '可达' : '不足') },
                  ].map((row) => {
                    const values = selectedDesigns.map((d) => {
                      const val = (row.key as string) in d.results
                        ? (d.results as any)[row.key]
                        : (d.params as any)[row.key]
                      return val
                    })
                    const numericValues = values.filter((v) => typeof v === 'number') as number[]
                    const minVal = numericValues.length > 0 ? Math.min(...numericValues) : null
                    const maxVal = numericValues.length > 0 ? Math.max(...numericValues) : null
                    const spread = minVal !== null && maxVal !== null && minVal !== 0 ? ((maxVal - minVal) / minVal) * 100 : null

                    return (
                      <tr key={row.key} className="border-b border-border/50">
                        <td className="py-2 pr-4 font-medium text-text-secondary">{row.label}</td>
                        {values.map((v, i) => (
                          <td
                            key={i}
                            className={`py-2 pr-4 font-mono ${
                              numericValues.length > 0 && v === maxVal && numericValues.length > 1
                                ? 'text-accent'
                                : numericValues.length > 0 && v === minVal && numericValues.length > 1
                                ? 'text-primary-light'
                                : ''
                            }`}
                          >
                            {row.fmt(v)}
                          </td>
                        ))}
                        {selectedDesigns.length > 1 && (
                          <td className="py-2 font-mono text-xs text-text-muted">
                            {spread !== null ? `${spread.toFixed(1)}%` : '—'}
                          </td>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Recommendation */}
          {bestDesign && selectedDesigns.length > 1 && (
            <div className="bg-primary-dark/20 border border-primary-light/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-primary-light" />
                <h3 className="text-sm font-semibold text-text-primary">设计推荐</h3>
              </div>
              <p className="text-sm text-text-secondary">
                综合评分（效率40% + 频率范围30% + ZVS裕量30%）最高的是{' '}
                <span className="text-primary-light font-semibold">{bestDesign.name}</span>
                ，评分 {scoreDesign(bestDesign).toFixed(1)} / 100。
              </p>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono text-text-muted">
                {selectedDesigns.map((d) => (
                  <div key={d.id} className="bg-surface rounded p-2 border border-border/50">
                    <span className={d.id === bestDesign.id ? 'text-primary-light' : 'text-text-muted'}>
                      {d.name}: {scoreDesign(d).toFixed(1)} 分
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Charts */}
          {selectedDesigns.length > 0 && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setShowGainChart(!showGainChart)}
                  className="px-3 py-1.5 text-xs bg-surface-elevated border border-border rounded hover:border-border-light text-text-secondary transition-colors flex items-center gap-1"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  {showGainChart ? '隐藏' : '显示'}增益曲线
                </button>
                <button
                  onClick={() => setShowEffChart(!showEffChart)}
                  className="px-3 py-1.5 text-xs bg-surface-elevated border border-border rounded hover:border-border-light text-text-secondary transition-colors flex items-center gap-1"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  {showEffChart ? '隐藏' : '显示'}效率对比
                </button>
              </div>

              {showGainChart && gainChartData.length > 0 && (
                <div className="card-surface p-4">
                  <h3 className="text-sm font-semibold text-text-primary mb-3">增益曲线对比</h3>
                  <div className="w-full h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={gainChartData} margin={{ top: 5, right: 20, bottom: 20, left: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                        <XAxis
                          dataKey="fn"
                          type="number"
                          domain={[0.5, 2.0]}
                          stroke="#a3a3a3"
                          tick={{ fill: '#a3a3a3', fontFamily: 'JetBrains Mono', fontSize: 12 }}
                          tickCount={7}
                          label={{ value: '归一化频率 fn', position: 'insideBottom', offset: -10, fill: '#a3a3a3', fontSize: 13 }}
                        />
                        <YAxis
                          domain={[0, 3]}
                          stroke="#a3a3a3"
                          tick={{ fill: '#a3a3a3', fontFamily: 'JetBrains Mono', fontSize: 12 }}
                          label={{ value: '电压增益 M', angle: -90, position: 'insideLeft', fill: '#a3a3a3', fontSize: 13 }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ color: '#f5f5f5', fontFamily: 'JetBrains Mono', fontSize: 13 }} />
                        {selectedDesigns.map((d, i) => (
                          <Line
                            key={d.id}
                            type="monotone"
                            dataKey={`${d.name}_M`}
                            stroke={COLORS[i % COLORS.length]}
                            strokeWidth={2}
                            dot={false}
                            name={`${d.name} (Q=${d.results.q.toFixed(2)}, k=${d.results.k.toFixed(2)})`}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {showEffChart && effChartData.length > 0 && (
                <div className="card-surface p-4">
                  <h3 className="text-sm font-semibold text-text-primary mb-3">效率与开关频率对比</h3>
                  <div className="w-full h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={effChartData} margin={{ top: 5, right: 20, bottom: 20, left: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                        <XAxis
                          dataKey="name"
                          stroke="#a3a3a3"
                          tick={{ fill: '#a3a3a3', fontFamily: 'JetBrains Mono', fontSize: 12 }}
                        />
                        <YAxis
                          yAxisId="left"
                          domain={[85, 100]}
                          stroke="#a3a3a3"
                          tick={{ fill: '#a3a3a3', fontFamily: 'JetBrains Mono', fontSize: 12 }}
                          label={{ value: '效率 (%)', angle: -90, position: 'insideLeft', fill: '#a3a3a3', fontSize: 13 }}
                        />
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          domain={[0, 500]}
                          stroke="#a3a3a3"
                          tick={{ fill: '#a3a3a3', fontFamily: 'JetBrains Mono', fontSize: 12 }}
                          label={{ value: 'fsw (kHz)', angle: 90, position: 'insideRight', fill: '#a3a3a3', fontSize: 13 }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ color: '#f5f5f5', fontFamily: 'JetBrains Mono', fontSize: 13 }} />
                        <Bar yAxisId="left" dataKey="efficiency" name="效率 (%)" radius={[4, 4, 0, 0]}>
                          {effChartData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                        <Bar yAxisId="right" dataKey="fsw" name="开关频率 (kHz)" fill="#737373" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function saveDesignSnapshot(
  name: string,
  params: DesignSnapshot['params'],
  results: DesignSnapshot['results']
) {
  const designs = loadDesigns()
  const snapshot: DesignSnapshot = {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name,
    timestamp: Date.now(),
    params,
    results,
  }
  // Limit to 8 designs
  if (designs.length >= 8) {
    designs.shift()
  }
  designs.push(snapshot)
  saveDesigns(designs)
  return designs
}

export function getSavedDesigns(): DesignSnapshot[] {
  return loadDesigns()
}
