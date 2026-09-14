import { useEffect, useState, useSyncExternalStore } from 'react'
import { useDesign, DesignParameters, defaultParams } from '../lib/DesignContext'
import { Calculator, XCircle, GitCompare, TrendingUp, LineChart as LineChartIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import CompensationSection from '../components/CompensationSection'
import DesignCompare from '../components/DesignCompare'
import {
  MAX_SNAPSHOTS,
  getSnapshots,
  removeSnapshot,
  saveDesignSnapshot,
  subscribeSnapshots,
} from '../lib/designSnapshots'
import { computeDesign } from '../lib/designer/computeDesign'
import { generateSuggestions } from '../lib/designer/suggestions'
import { defaultLossParams } from '../lib/designer/losses'
import {
  DEFAULT_COLLAPSED,
  clearDesignerState,
  loadCalculated,
  loadCollapsed,
  loadLossParams,
  loadShowResults,
  saveDesignerState,
} from '../lib/designer/persistence'
import type { CalculatedData, LossParameters, Suggestion } from '../lib/designer/types'
import CollapsibleCard from '../components/designer/CollapsibleCard'
import DesignerForm from '../components/designer/DesignerForm'
import ResultsSummaryCard from '../components/designer/ResultsSummaryCard'
import SuggestionsCard from '../components/designer/SuggestionsCard'
import ComponentSelectionCard from '../components/designer/ComponentSelectionCard'
import WaveformPreview from '../components/designer/WaveformPreview'
import LossAnalysisPanel from '../components/designer/LossAnalysisPanel'
import SnapshotCard from '../components/designer/SnapshotCard'

// ─── Main Component ───
// 本文件只负责：状态、副作用、事件处理器与页面组装。
// 领域逻辑在 src/lib/designer/，展示组件在 src/components/designer/。
export default function Designer() {
  const { params, setParams, setResults, setSuggestions, reset } = useDesign()
  const [form, setForm] = useState<DesignParameters>(params)
  const [showResults, setShowResults] = useState(loadShowResults)
  const [calculated, setCalculated] = useState<CalculatedData | null>(loadCalculated)
  const [suggestions, setLocalSuggestions] = useState<Suggestion[]>([])
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>(loadCollapsed)
  const [lossParams, setLossParams] = useState<LossParameters>(loadLossParams)
  const [needsRecalculation, setNeedsRecalculation] = useState(false)
  const [lastFormSnapshot, setLastFormSnapshot] = useState<DesignParameters | null>(null)
  const snapshots = useSyncExternalStore(subscribeSnapshots, getSnapshots)
  const [snapshotName, setSnapshotName] = useState('')
  const [snapshotStatus, setSnapshotStatus] = useState<{ text: string; error: boolean } | null>(null)

  // Load suggestions from calculated data on mount
  useEffect(() => {
    if (calculated) {
      const s = generateSuggestions(form, {
        q: calculated.q,
        k: calculated.k,
        mMax: calculated.mMax,
        mRequired: calculated.mRequired,
        mRequiredMin: calculated.mRequiredMin,
        zvsPhase: calculated.zvsPhase,
        lr: calculated.lr,
        cr: calculated.cr,
        lm: calculated.lm,
        fsw: calculated.fsw,
        efficiency: calculated.efficiency,
        qmax1: calculated.qmax1,
        qmax2: calculated.qmax2,
        qmax3: calculated.qmax3,
        gmaxEmpty: calculated.gmaxEmpty,
        zvsMargin: calculated.zvsMargin,
        zvsTimeOk: calculated.zvsTimeOk,
        tZvs: calculated.tZvs,
        er: calculated.zvsEr,
        ec: calculated.zvsEc,
        fmax: calculated.fmax,
        fmin: calculated.fmin,
        kMax: calculated.kMax,
      })
      setLocalSuggestions(s)
      setSuggestions(s.map((item) => item.text))
      setLastFormSnapshot({ ...form })
    }
  }, [])

  // Detect parameter changes → prompt for recalculation
  useEffect(() => {
    if (calculated && lastFormSnapshot) {
      const changed = JSON.stringify(form) !== JSON.stringify(lastFormSnapshot)
      setNeedsRecalculation(changed)
    }
  }, [form, lastFormSnapshot, calculated])

  // Save designer state whenever key states change
  useEffect(() => {
    saveDesignerState(calculated, lossParams, showResults, collapsedSections)
  }, [calculated, lossParams, showResults, collapsedSections])

  const handleCalculate = () => {
    const { data, results, suggestions: nextSuggestions } = computeDesign(form, lossParams)

    setCalculated(data)
    setLocalSuggestions(nextSuggestions)
    setParams(form)
    setLastFormSnapshot({ ...form })
    setNeedsRecalculation(false)
    setResults(results)
    setSuggestions(nextSuggestions.map((item) => item.text))
    setShowResults(true)
  }

  const toggleSection = (key: string) => {
    setCollapsedSections((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSaveSnapshot = () => {
    if (!calculated) return
    const name = snapshotName.trim() || `设计 ${snapshots.length + 1}`
    const { ok, error, dropped } = saveDesignSnapshot(name, form, {
      n: calculated.n,
      fr: calculated.fr,
      lr: calculated.lr,
      cr: calculated.cr,
      lm: calculated.lm,
      q: calculated.q,
      k: calculated.k,
      mMax: calculated.mMax,
      mRequired: calculated.gMax,
      zvsMargin: calculated.zvsMargin,
      ipRms: calculated.ipRms,
      isRms: calculated.isRms,
    })
    if (!ok) {
      setSnapshotStatus({ text: `保存失败：${error ?? '浏览器本地存储不可用'}`, error: true })
      return
    }
    setSnapshotName('')
    setSnapshotStatus({
      text: dropped
        ? `已保存「${name}」；上限 ${MAX_SNAPSHOTS} 条，最旧的「${dropped.name}」已被移除`
        : `已保存「${name}」，可在下方「A/B 设计对比」中勾选对比`,
      error: false,
    })
    // Reveal the comparison panel so the saved snapshot is immediately visible.
    setCollapsedSections((prev) => ({ ...prev, compare: false }))
  }

  const handleReset = () => {
    if (confirm('确定要复位所有设计参数和计算结果吗？')) {
      clearDesignerState()
      reset()
      setForm(defaultParams)
      setShowResults(false)
      setCalculated(null)
      setLocalSuggestions([])
      setLossParams(defaultLossParams)
      setNeedsRecalculation(false)
      setLastFormSnapshot(null)
      setCollapsedSections({ ...DEFAULT_COLLAPSED })
    }
  }

  const update = <K extends keyof DesignParameters>(key: K, value: DesignParameters[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Calculator className="w-8 h-8 text-primary-light" />
          <h1 className="text-3xl md:text-4xl font-bold text-gradient tracking-tight">LLC设计工具</h1>
        </div>
        <p className="text-text-secondary max-w-2xl">
          输入电源规格，自动计算谐振参数、增益裕量与元件选型建议。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Form */}
        <div className="lg:col-span-5 space-y-4">
          <DesignerForm
            form={form}
            update={update}
            onCalculate={handleCalculate}
            onReset={handleReset}
            needsRecalculation={needsRecalculation}
          />
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-7 space-y-4">
          {calculated && (
            <>
              {/* Linkage banner */}
              <div className="card-surface p-4 border border-primary/30">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-sm text-primary-light font-medium">设计参数已同步</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm font-mono text-text-secondary">
                    <span>k = {calculated.k.toFixed(2)}</span>
                    <span>Q = {calculated.q.toFixed(3)}</span>
                    <span className="text-text-muted">|</span>
                    <span>fr = {(calculated.fr / 1000).toFixed(1)} kHz</span>
                  </div>
                  <div className="ml-auto">
                    <Link
                      to="/curves"
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-primary text-white hover:bg-primary-light transition-colors"
                    >
                      <LineChartIcon size={14} />
                      查看增益曲线
                    </Link>
                  </div>
                </div>
              </div>

              {!calculated.designFeasible && (
                <div className="card-surface p-4 border border-danger/30 bg-danger/10">
                  <div className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-danger font-medium">设计参数不可行</p>
                      <p className="text-xs text-text-secondary mt-1">
                        高输入电压下所需最小增益低于 Region 1 空载极限 k/(k+1)。请增大电感比 k 或降低输入电压上限。
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Calculated Results */}
              <ResultsSummaryCard
                calculated={calculated}
                td={form.td}
                collapsed={collapsedSections.results}
                onToggle={() => toggleSection('results')}
              />

              {/* Optimization Suggestions */}
              <SuggestionsCard
                suggestions={suggestions}
                collapsed={collapsedSections.suggestions}
                onToggle={() => toggleSection('suggestions')}
              />

              {/* Component Selection */}
              <ComponentSelectionCard
                calculated={calculated}
                collapsed={collapsedSections.components}
                onToggle={() => toggleSection('components')}
              />

              {/* Waveform Preview */}
              <WaveformPreview topology={calculated.topology} vin={calculated.vinMax} />

              {/* Loss Analysis Panel */}
              <LossAnalysisPanel
                calc={calculated}
                params={lossParams}
                setParams={setLossParams}
                collapsed={collapsedSections.loss}
                onToggle={() => toggleSection('loss')}
              />

              {/* Save Design & Compare */}
              <SnapshotCard
                snapshots={snapshots}
                name={snapshotName}
                onNameChange={setSnapshotName}
                onSave={handleSaveSnapshot}
                onRemove={removeSnapshot}
                status={snapshotStatus}
              />

              {/* Compensation Design */}
              <CollapsibleCard
                icon={<TrendingUp className="w-5 h-5 text-primary-light" />}
                title="环路补偿设计"
                collapsed={collapsedSections.compensation}
                onToggle={() => toggleSection('compensation')}
              >
                <CompensationSection />
              </CollapsibleCard>

              {/* A/B Compare */}
              <CollapsibleCard
                icon={<GitCompare className="w-5 h-5 text-primary-light" />}
                title="A/B 设计对比"
                collapsed={collapsedSections.compare}
                onToggle={() => toggleSection('compare')}
              >
                <DesignCompare />
              </CollapsibleCard>
            </>
          )}

          {!calculated && (
            <div className="card-surface p-8 flex flex-col items-center justify-center text-center min-h-[300px]">
              <Calculator className="w-12 h-12 text-text-muted mb-4" />
              <p className="text-text-secondary text-lg">输入参数并点击“计算”以查看结果</p>
              <p className="text-text-muted text-sm mt-2">系统将自动计算谐振参数、增益裕量与优化建议</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
