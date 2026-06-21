import { useEffect, useRef } from 'react'
import katex from 'katex'

interface InlineMathProps {
  latex: string
  className?: string
}

/**
 * 内联数学公式渲染器，用于表格、段落等小空间场景。
 * 与 MathBlock 的区别：不添加卡片容器，只渲染公式本身。
 */
export default function InlineMath({ latex, className = '' }: InlineMathProps) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (ref.current) {
      try {
        katex.render(latex, ref.current, {
          throwOnError: false,
          displayMode: false,
        })
      } catch {
        // 渲染失败时回退显示原始文本
        ref.current.textContent = latex
      }
    }
  }, [latex])

  return <span ref={ref} className={`inline-math ${className}`} />
}
