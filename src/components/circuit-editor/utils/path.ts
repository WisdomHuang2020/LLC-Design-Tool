import type { CircuitNode } from '../types'
import { CORNER_RADIUS } from '../constants'

/**
 * 两点之间的直线距离
 */
export function dist(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}

/**
 * 判断两点是否接近
 */
export function near(a: { x: number; y: number }, b: { x: number; y: number }, threshold: number) {
  return dist(a, b) <= threshold
}

/**
 * 生成 L-shape 路径（先水平后垂直，或先垂直后水平）
 * 选择拐角更自然的方案（较短的方案）
 * @param from 起点
 * @param to 终点
 * @param preferHorizontal 优先水平先走（默认 true）
 * @param rounded 是否圆角
 */
export function lPath(
  from: { x: number; y: number },
  to: { x: number; y: number },
  preferHorizontal = true,
  rounded = true
): string {
  const dx = to.x - from.x
  const dy = to.y - from.y

  // 同一直线
  if (Math.abs(dx) < 1 || Math.abs(dy) < 1) {
    return `M ${from.x} ${from.y} L ${to.x} ${to.y}`
  }

  const r = rounded ? Math.min(CORNER_RADIUS, Math.abs(dx) / 2, Math.abs(dy) / 2) : 0

  if (preferHorizontal) {
    // 水平 -> 垂直
    const cornerX = to.x
    const cornerY = from.y
    if (r > 0) {
      const rx = dx > 0 ? r : -r
      const ry = dy > 0 ? r : -r
      // 先水平到拐角前，圆弧，再垂直到目标
      return `M ${from.x} ${from.y} L ${cornerX - rx} ${cornerY} q ${rx} 0 ${rx} ${ry} L ${to.x} ${to.y}`
    }
    return `M ${from.x} ${from.y} L ${cornerX} ${cornerY} L ${to.x} ${to.y}`
  } else {
    // 垂直 -> 水平
    const cornerX = from.x
    const cornerY = to.y
    if (r > 0) {
      const rx = dx > 0 ? r : -r
      const ry = dy > 0 ? r : -r
      return `M ${from.x} ${from.y} L ${cornerX} ${cornerY - ry} q 0 ${ry} ${rx} ${ry} L ${to.x} ${to.y}`
    }
    return `M ${from.x} ${from.y} L ${cornerX} ${cornerY} L ${to.x} ${to.y}`
  }
}

/**
 * 生成 S-shape（阶梯）路径 — 用于避开障碍物或更复杂的布线
 * 先水平再垂直再水平
 */
export function sPath(
  from: { x: number; y: number },
  to: { x: number; y: number },
  midX?: number,
  rounded = true
): string {
  const dx = to.x - from.x
  const dy = to.y - from.y

  if (Math.abs(dx) < 1 || Math.abs(dy) < 1) {
    return lPath(from, to, true, rounded)
  }

  const mx = midX !== undefined ? midX : (from.x + to.x) / 2
  const r = rounded ? Math.min(CORNER_RADIUS, Math.abs(dx) / 4, Math.abs(dy) / 2) : 0

  if (r > 0) {
    const rx1 = dx > 0 ? r : -r
    const ry1 = dy > 0 ? r : -r
    const rx2 = dx > 0 ? -r : r
    // M -> 拐角1前 -> 圆弧 -> 垂直 -> 拐角2前 -> 圆弧 -> 终点
    return (
      `M ${from.x} ${from.y} ` +
      `L ${mx - rx1} ${from.y} q ${rx1} 0 ${rx1} ${ry1} ` +
      `L ${mx} ${to.y - ry1} q 0 ${ry1} ${rx2} ${ry1} ` +
      `L ${to.x} ${to.y}`
    )
  }

  return `M ${from.x} ${from.y} L ${mx} ${from.y} L ${mx} ${to.y} L ${to.x} ${to.y}`
}

/**
 * 根据两个节点 ID 从节点表中查找坐标并计算路径
 */
export function pathBetweenNodes(
  nodes: Record<string, CircuitNode>,
  fromId: string,
  toId: string,
  preferHorizontal = true,
  rounded = true
): string {
  const from = nodes[fromId]
  const to = nodes[toId]
  if (!from || !to) return ''
  return lPath(from, to, preferHorizontal, rounded)
}

/**
 * 计算路径长度（近似）
 */
export function pathLength(d: string): number {
  // 简单解析：提取所有 M/L 后的坐标，累加线段长度
  const coords: number[] = []
  const tokens = d.match(/[ML]\s*(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)/g) || []
  tokens.forEach((token) => {
    const m = token.match(/(-?\d+(?:\.\d+)?)/g)
    if (m) coords.push(parseFloat(m[0]), parseFloat(m[1]))
  })

  let len = 0
  for (let i = 2; i < coords.length; i += 2) {
    len += Math.sqrt((coords[i] - coords[i - 2]) ** 2 + (coords[i + 1] - coords[i - 1]) ** 2)
  }
  return len
}

/**
 * 生成圆形箭头 marker 的 defs
 */
export function markerDefs(idSuffix: string): string {
  return `
    <marker id="arrowTeal${idSuffix}" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
      <path d="M 0 0 L 8 4 L 0 8 L 2 4 Z" fill="#14b8a6" />
    </marker>
    <marker id="arrowAmber${idSuffix}" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
      <path d="M 0 0 L 8 4 L 0 8 L 2 4 Z" fill="#f59e0b" />
    </marker>
    <marker id="arrowGreen${idSuffix}" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
      <path d="M 0 0 L 8 4 L 0 8 L 2 4 Z" fill="#22c55e" />
    </marker>
  `.trim()
}
