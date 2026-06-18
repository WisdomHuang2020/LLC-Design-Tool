import { useEffect, useRef } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'

interface MathBlockProps {
  latex: string
  display?: boolean
  important?: boolean
  multiline?: boolean
}

export default function MathBlock({ latex, display = true, important = false, multiline = false }: MathBlockProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current) {
      katex.render(latex, ref.current, {
        throwOnError: false,
        displayMode: display,
        macros: {
          '\\vec': '\\mathbf',
        },
      })
    }
  }, [latex, display])

  return (
    <div
      className={`math-block ${important ? 'important' : ''} ${multiline ? 'multiline' : ''} my-4`}
    >
      <div ref={ref} />
    </div>
  )
}
