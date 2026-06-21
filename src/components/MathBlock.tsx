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

/**
 * 自动剥离常见的 LaTeX 定界符：
 *   $$...$$ 、 \[...\] 、 \( ... \) 、 $...$ 、 \begin{equation}...\end{equation} 等
 * 这样用户可以直接传入从 Markdown 或文档中复制出来的原始字符串。
 */
function stripDelimiters(raw: string): string {
  let s = raw.trim()

  // 1. 块级 $$ ... $$
  if (s.startsWith('$$') && s.endsWith('$$')) {
    s = s.slice(2, -2).trim()
  }
  // 2. 块级 \[ ... \]
  else if (s.startsWith('\\[') && s.endsWith('\\]')) {
    s = s.slice(2, -2).trim()
  }
  // 3. 行内 \( ... \)
  else if (s.startsWith('\\(') && s.endsWith('\\)')) {
    s = s.slice(2, -2).trim()
  }
  // 4. 单行 $...$
  else if (s.startsWith('$') && s.endsWith('$') && !s.startsWith('$$')) {
    s = s.slice(1, -1).trim()
  }
  // 5. \begin{equation}...\end{equation}
  else if (s.startsWith('\\begin{equation}') && s.endsWith('\\end{equation}')) {
    s = s.slice(18, -16).trim()
  }
  // 6. \begin{align}...\end{align}
  else if (s.startsWith('\\begin{align}') && s.endsWith('\\end{align}')) {
    s = s.slice(14, -12).trim()
  }
  // 7. \begin{gather}...\end{gather}
  else if (s.startsWith('\\begin{gather}') && s.endsWith('\\end{gather}')) {
    s = s.slice(15, -13).trim()
  }

  return s
}

export default function MathBlock({
  latex,
  display = true,
  important = false,
  multiline = false,
  label,
  stepNumber,
}: MathBlockProps) {
  const ref = useRef<HTMLDivElement>(null)

  // 自动剥离 $$ \[ \] 等定界符，得到纯 LaTeX
  const cleanLatex = stripDelimiters(latex)

  useEffect(() => {
    if (ref.current) {
      katex.render(cleanLatex, ref.current, {
        throwOnError: false,
        displayMode: display,
        macros: {
          '\vec': '\mathbf',
        },
      })
    }
  }, [cleanLatex, display])

  return (
    <div
      className={`math-block ${important ? 'important' : ''} ${multiline ? 'multiline' : ''} ${label || stepNumber ? 'has-label' : ''} my-4`}
    >
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
