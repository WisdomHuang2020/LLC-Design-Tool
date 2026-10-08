import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

export interface DesignParameters {
  vinMin: number
  vinMax: number
  vinNom: number
  vout: number
  pout: number
  efficiency: number
  fsw: number
  topology: 'half-bridge' | 'full-bridge'
  rectifier: 'full-wave' | 'center-tapped' | 'synchronous' | 'sync-center-tapped'
  loadMin: number
  loadMax: number
  // 新增参数
  cossEq: number
  cossEr: number
  cj: number
  td: number
  vd: number
  ioMax: number
  k: number
  /**
   * Q 裕量系数 m ∈ (0,1]，实际设计 Q = m · Qmax（Qmax = min(Qmax1,Qmax2,Qmax3)，三者均对 Q 设上限）。
   * m 越小 → Q 越小 → 峰值增益能力更强、ZVS 能量与 ZVS 时间裕量更大；
   * 代价是 Zr=Q·Rac 更小 ⇒ Lr 更小、Cr 更大，励磁环流占比与导通损耗上升。
   * 默认 0.95。
   */
  qMargin: number
  /**
   * Qmax1 采用哪条判据（v2.10.96 起）：
   * - 'boundary'（**默认**）：感容分界点增益 Mbnd = Gmax。分界点在峰顶右侧，只有这条判据能保证
   *   最坏工况下仍工作在**感性区**且够得着 Gmax。
   * - 'peak'（旧口径）：峰顶增益 Mpeak = Gmax。只保证增益数值达标，但峰顶本身位于**容性区**，
   *   不允许作为工作点，故不作为默认。
   */
  qmax1Criterion: 'boundary' | 'peak'
}

export interface CalculatedResults {
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
  // 新增计算结果
  fmax: number
  fmin: number
  gmaxEmpty: number
  /** 以下 4 项供报告页做「元器件容差穷举」等二次分析使用（值来自同一引擎，不是另算一遍） */
  topology: string
  vinMin: number
  td: number
  /** 死区用总电容 C总 = 2·Coss_tr + Cj */
  cossZvs: number
  zvsEr: number
  zvsEc: number
  qmax1: number
  qmax2: number
  qmax3: number
  gMin: number
  gMax: number
  gNom: number
  rac: number
  zr: number
  // 电流与ZVS时间
  irRms: number
  imRms: number
  bPeak: number
  zvsTimeOk: boolean
  tZvs: number
  // 设计可行性
  designFeasible: boolean
  // k最大值（空载降压约束上限，k ≤ Gmin/(1-Gmin)）
  kMax: number
  // 增益曲线数据（m: 满载，mLight: 最小负载）
  gainCurveData: Array<{ fn: number; m: number; mLight: number }>
}

export interface CurvesState {
  k: number
  q: number
}

// 默认参数 = 自制计算书 V02 的算例（2026-09-30 对齐，见 research/calcbook_v02_vs_site_20260930.md）
// 逐项来源（书原文 → 本站字段）：
//   Vin 380/400/420 V → vinMin/vinNom/vinMax ｜ Vo 24 V → vout ｜ Io 4 A（Po = 96 W）→ pout
//   η = 0.96 → efficiency 96 ｜ fr = 100 kHz → fsw ｜ k = 4 → k
//   Coss_tr 170 pF（2026-10-08 用户指定，取较大器件的单管值）/ Coss_er 35 pF / Cj 100 pF → cossEq/cossEr/cj
//   Td = 300 ns → td ｜ Iomax = 4.8 A（β = 1.2）→ ioMax ｜ Vd = 0 → vd ｜ Q 降额系数 α = 0.857 → qMargin
// ⚠️ 因 Coss_tr = 170 pF（单管），死区总电容 C总 = 2×170 + 100 = 440 pF ⇒ 本默认算例的 ZVS 死区约束
//    （Qmax2 = 0.355）成为最紧约束，会带 1 条 warn —— 这是 2026-10-08 用户明确要求的结果，**不是回归缺陷**。
const defaultParams: DesignParameters = {
  vinMin: 380,
  vinMax: 420,
  vinNom: 400,
  vout: 24,
  pout: 96,
  efficiency: 96,
  fsw: 100,
  topology: 'half-bridge',
  rectifier: 'sync-center-tapped',
  loadMin: 100,
  loadMax: 100,
  // 新增参数默认值
  cossEq: 170,
  cossEr: 35,
  cj: 100,
  td: 300,
  vd: 0,
  ioMax: 4.8,
  k: 4,
  qMargin: 0.857,
  qmax1Criterion: 'boundary',
}

const defaultCurves: CurvesState = { k: 4.0, q: 0.8 }

const STORAGE_KEY = 'llc-design-tool-params'
const RESULTS_KEY = 'llc-design-tool-results'
const SUGGESTIONS_KEY = 'llc-design-tool-suggestions'
const CURVES_KEY = 'llc-design-tool-curves'

function loadParams(): DesignParameters {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...defaultParams, ...JSON.parse(raw) }
  } catch { /* ignore */ }
  return defaultParams
}

function loadResults(): CalculatedResults | null {
  try {
    const raw = localStorage.getItem(RESULTS_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return null
}

function loadSuggestions(): string[] {
  try {
    const raw = localStorage.getItem(SUGGESTIONS_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return []
}

function loadCurves(): CurvesState {
  try {
    const raw = localStorage.getItem(CURVES_KEY)
    if (raw) return { ...defaultCurves, ...JSON.parse(raw) }
  } catch { /* ignore */ }
  return defaultCurves
}

interface DesignContextType {
  params: DesignParameters
  setParams: (p: DesignParameters) => void
  results: CalculatedResults | null
  setResults: (r: CalculatedResults | null) => void
  suggestions: string[]
  setSuggestions: (s: string[]) => void
  curves: CurvesState
  setCurves: (c: CurvesState) => void
  reset: () => void
}

const DesignContext = createContext<DesignContextType>({
  params: defaultParams,
  setParams: () => {},
  results: null,
  setResults: () => {},
  suggestions: [],
  setSuggestions: () => {},
  curves: defaultCurves,
  setCurves: () => {},
  reset: () => {},
})

export function DesignProvider({ children }: { children: ReactNode }) {
  const [params, setParamsState] = useState<DesignParameters>(loadParams)
  const [results, setResultsState] = useState<CalculatedResults | null>(loadResults)
  const [suggestions, setSuggestionsState] = useState<string[]>(loadSuggestions)
  const [curves, setCurvesState] = useState<CurvesState>(loadCurves)

  const setParams = useCallback((p: DesignParameters) => {
    setParamsState(p)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)) } catch { /* ignore */ }
  }, [])

  const setResults = useCallback((r: CalculatedResults | null) => {
    setResultsState(r)
    try { localStorage.setItem(RESULTS_KEY, r ? JSON.stringify(r) : '') } catch { /* ignore */ }
  }, [])

  const setSuggestions = useCallback((s: string[]) => {
    setSuggestionsState(s)
    try { localStorage.setItem(SUGGESTIONS_KEY, JSON.stringify(s)) } catch { /* ignore */ }
  }, [])

  const setCurves = useCallback((c: CurvesState) => {
    setCurvesState(c)
    try { localStorage.setItem(CURVES_KEY, JSON.stringify(c)) } catch { /* ignore */ }
  }, [])

  const reset = useCallback(() => {
    setParamsState(defaultParams)
    setResultsState(null)
    setSuggestionsState([])
    setCurvesState(defaultCurves)
    try {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(RESULTS_KEY)
      localStorage.removeItem(SUGGESTIONS_KEY)
      localStorage.removeItem(CURVES_KEY)
    } catch { /* ignore */ }
  }, [])

  return (
    <DesignContext.Provider value={{ params, setParams, results, setResults, suggestions, setSuggestions, curves, setCurves, reset }}>
      {children}
    </DesignContext.Provider>
  )
}

export function useDesign() {
  return useContext(DesignContext)
}

export { defaultParams }