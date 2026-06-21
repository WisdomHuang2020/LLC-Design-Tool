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
  // k最大值（空载增益约束上限）
  kMax: number
  // 增益曲线数据
  gainCurveData: Array<{ fn: number; m: number }>
}

export interface CurvesState {
  k: number
  q: number
}

const defaultParams: DesignParameters = {
  vinMin: 350,
  vinMax: 420,
  vinNom: 385,
  vout: 12,
  pout: 300,
  efficiency: 96,
  fsw: 100,
  topology: 'half-bridge',
  rectifier: 'full-wave',
  loadMin: 10,
  loadMax: 100,
  // 新增参数默认值
  cossEq: 500,
  cossEr: 800,
  cj: 100,
  td: 300,
  vd: 0.5,
  ioMax: 25,
  k: 5,
}

const defaultCurves: CurvesState = { k: 5.0, q: 0.8 }

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

  return (
    <DesignContext.Provider value={{ params, setParams, results, setResults, suggestions, setSuggestions, curves, setCurves }}>
      {children}
    </DesignContext.Provider>
  )
}

export function useDesign() {
  return useContext(DesignContext)
}