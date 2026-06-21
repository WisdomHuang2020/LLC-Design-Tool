import type { CircuitState } from '../types'

/**
 * 将当前电路状态导出为纯 SVG 字符串（不含 React 事件和动画类）
 * 适用于保存或打印
 */
export function exportSVG(state: CircuitState): string {
  const { viewBox, nodes, elements, wires } = state

  // 1. 收集所有需要使用的 marker
  const markerDefs = `
    <defs>
      <marker id="arrowTeal" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
        <path d="M 0 0 L 8 4 L 0 8 L 2 4 Z" fill="#14b8a6" />
      </marker>
      <marker id="arrowAmber" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
        <path d="M 0 0 L 8 4 L 0 8 L 2 4 Z" fill="#f59e0b" />
      </marker>
      <marker id="arrowGreen" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
        <path d="M 0 0 L 8 4 L 0 8 L 2 4 Z" fill="#22c55e" />
      </marker>
    </defs>
  `.trim()

  // 2. 导出所有 wire（电流路径和非电流路径）
  const wirePaths = wires
    .map((w) => {
      const from = nodes[w.fromNode]
      const to = nodes[w.toNode]
      if (!from || !to) return ''
      const path = w.path || `M ${from.x} ${from.y} L ${to.x} ${to.y}`
      const sw = w.strokeWidth || 2
      const dash = w.dashed ? `stroke-dasharray="${w.dashed}"` : ''
      const anim = w.animClass ? `class="${w.animClass}"` : ''
      return `<path d="${path}" fill="none" stroke="${w.color || '#a3a3a3'}" stroke-width="${sw}" stroke-linecap="round" ${dash} ${anim} />`
    })
    .join('\n')

  // 3. 导出所有元件（简单版本：只输出节点位置标签，完整元件渲染需单独实现）
  // 这里输出的是简化版，完整的元件导出需要遍历元素类型渲染对应 SVG
  const elementSvg = Object.values(elements)
    .map((el) => {
      // 根据元件类型输出简化 SVG 标签（占位）
      const node = Object.values(el.nodes)[0]
      const n = nodes[node]
      if (!n) return ''
      return `<!-- ${el.label} (${el.type}) at (${n.x}, ${n.y}) -->`
    })
    .join('\n')

  // 4. 导出节点（调试用，可隐藏）
  const nodeDots = Object.values(nodes)
    .map((n) => `<circle cx="${n.x}" cy="${n.y}" r="2.5" fill="#a3a3a3" />`)
    .join('\n')

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}" width="100%" height="auto">
  ${markerDefs}
  ${elementSvg}
  ${wirePaths}
  ${nodeDots}
</svg>`

  return svg
}

/**
 * 下载 SVG 文件
 */
export function downloadSVG(svgString: string, filename = 'circuit.svg') {
  const blob = new Blob([svgString], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * 复制 SVG 字符串到剪贴板
 */
export async function copySVG(svgString: string) {
  try {
    await navigator.clipboard.writeText(svgString)
    return true
  } catch {
    return false
  }
}
