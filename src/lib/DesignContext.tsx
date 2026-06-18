import { createContext, useContext, useState, ReactNode } from 'react'

export interface DesignParameters {
  vinMin: number
  vinMax: number
  vinNom: number
  vout: number
  pout: number
  efficiency: number
  fsw: number
  topology: 'half-bridge' | 'full-bridge'
  rectifier: 'full-wave' | 'center-tapped' | 'synchronous'
  loadMin: number
  loadMax: number
  // 新增参数
  cossEq: number
  cossEr: number
  cj: number
  td: number
  vd: number
  ioMax: number
}

export interface CalculatedResults {
  n: number
  fr: number
  lr: number
  cr: number
  lm: number
  q: number
  lambda: number
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
  cossEq: 500,    // MOSFET Coss_eq (pF)
  cossEr: 800,    // MOSFET Coss_er (pF)
  cj: 100,        // PCB寄生电容 Cj (pF)
  td: 300,        // 死区时间 (ns)
  vd: 0.5,        // 输出二极管压降 (V)
  ioMax: 25,      // 最大输出电流 (A)
}

interface DesignContextType {
  params: DesignParameters
  setParams: (p: DesignParameters) => void
  results: CalculatedResults | null
  setResults: (r: CalculatedResults | null) => void
  suggestions: string[]
  setSuggestions: (s: string[]) => void
}

const DesignContext = createContext<DesignContextType>({
  params: defaultParams,
  setParams: () => {},
  results: null,
  setResults: () => {},
  suggestions: [],
  setSuggestions: () => {},
})

export function DesignProvider({ children }: { children: ReactNode }) {
  const [params, setParams] = useState<DesignParameters>(defaultParams)
  const [results, setResults] = useState<CalculatedResults | null>(null)
  const [suggestions, setSuggestions] = useState<string[]>([])

  return (
    <DesignContext.Provider value={{ params, setParams, results, setResults, suggestions, setSuggestions }}>
      {children}
    </DesignContext.Provider>
  )
}

export function useDesign() {
  return useContext(DesignContext)
}
