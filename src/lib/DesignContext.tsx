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
