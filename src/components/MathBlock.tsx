import { useEffect, useRef } from 'react'
import katex from 'katex'

interface MathBlockProps {
  latex: string
  display?: boolean
  important?: boolean
  multiline?: boolean
  label?: string
  stepNumber?: number
}

export default function MathBlock({ 
  latex, 
  display = true, 
  important = false, 
  multiline = false,
  label,
  stepNumber 
}: MathBlockProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current) {
      katex.render(latex, ref.current, {
        throwOnError: false,
        displayMode: display,
        macros: {
          '\vec': '\mathbf',
        },
      })
    }
  }, [latex, display])

  return (
    <div className={`math-block ${important ? 'important' : ''} ${multiline ? 'multiline' : ''} ${label || stepNumber ? 'has-label' : ''} my-4`}>
      {(label || stepNumber !== undefined) && (
        <div className="math-block-label">
          {stepNumber !== undefined && (
            <span className="step-number">Step {stepNumber}</span>
          )}
          {label && <span className="label-text">{label}</span>}
        </div>
      )}
      <div ref={ref} />
    </div>
  )
}
