# LLC 谐振变换器电路图 — SVG 源码

> 以下是一个可独立运行的 SVG 文件源码。保存为 `.svg` 后可直接在浏览器中打开查看。
> 包含 6 个开关阶段的电流路径，通过简单的 CSS 切换即可显示不同阶段。

---

## 文件列表

| 文件 | 路径 | 说明 |
|------|------|------|
| 完整 SVG | `llc-circuit-full.svg` | 包含所有元件、连线、6阶段电流动画的独立 SVG |

---

## 完整 SVG 源码（可直接保存为 .svg 文件）

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="auto" style="background:#0a0a0a">
  <defs>
    <style>
      @keyframes dashFlow {
        0% { stroke-dashoffset: 28; }
        100% { stroke-dashoffset: 0; }
      }
      .dash-flow {
        stroke-dasharray: 8 6;
        animation: dashFlow 1s linear infinite;
      }
      .dash-flow-slow {
        stroke-dasharray: 10 8;
        animation: dashFlow 1.4s linear infinite;
      }
      .phase-0 .p0, .phase-1 .p1, .phase-2 .p2,
      .phase-3 .p3, .phase-4 .p4, .phase-5 .p5 {
        display: inline;
      }
      .p0, .p1, .p2, .p3, .p4, .p5 {
        display: none;
      }
      text { font-family: 'JetBrains Mono', monospace; }
    </style>
    <marker id="arrowTeal" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
      <path d="M 0 0 L 8 4 L 0 8 L 2 4 Z" fill="#14b8a6"/>
    </marker>
    <marker id="arrowAmber" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
      <path d="M 0 0 L 8 4 L 0 8 L 2 4 Z" fill="#f59e0b"/>
    </marker>
    <marker id="arrowGreen" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
      <path d="M 0 0 L 8 4 L 0 8 L 2 4 Z" fill="#22c55e"/>
    </marker>
  </defs>

  <!-- ═══════ 静态连线 ═══════ -->
  <!-- Vin 到 Q1/Q2 -->
  <line x1="30" y1="49" x2="90" y2="49" stroke="#a3a3a3" stroke-width="2"/>
  <line x1="90" y1="49" x2="90" y2="30" stroke="#a3a3a3" stroke-width="2"/>
  <line x1="30" y1="81" x2="30" y2="340" stroke="#a3a3a3" stroke-width="2"/>
  <line x1="30" y1="280" x2="90" y2="280" stroke="#a3a3a3" stroke-width="2"/>
  <line x1="30" y1="340" x2="350" y2="340" stroke="#a3a3a3" stroke-width="2"/>
  <!-- Q1 S 到 SW -->
  <line x1="90" y1="75" x2="90" y2="100" stroke="#a3a3a3" stroke-width="2"/>
  <line x1="90" y1="235" x2="90" y2="100" stroke="#a3a3a3" stroke-width="2"/>
  <circle cx="90" cy="100" r="3.5" fill="#f5f5f5" stroke="#a3a3a3" stroke-width="1"/>
  <!-- SW -> Cr -> Lr -->
  <line x1="90" y1="100" x2="120" y2="100" stroke="#a3a3a3" stroke-width="2"/>
  <line x1="128" y1="100" x2="155" y2="100" stroke="#a3a3a3" stroke-width="2"/>
  <line x1="185" y1="100" x2="230" y2="100" stroke="#a3a3a3" stroke-width="2"/>
  <!-- Lm 并联 -->
  <line x1="230" y1="100" x2="230" y2="120" stroke="#a3a3a3" stroke-width="2"/>
  <line x1="230" y1="120" x2="210" y2="120" stroke="#22c55e" stroke-width="2"/>
  <line x1="210" y1="190" x2="230" y2="190" stroke="#22c55e" stroke-width="2"/>
  <line x1="230" y1="190" x2="230" y2="340" stroke="#22c55e" stroke-width="2"/>
  <!-- np 并联 -->
  <line x1="230" y1="120" x2="260" y2="120" stroke="#a3a3a3" stroke-width="2"/>
  <line x1="260" y1="190" x2="230" y2="190" stroke="#a3a3a3" stroke-width="2"/>
  <line x1="230" y1="190" x2="230" y2="340" stroke="#a3a3a3" stroke-width="2"/>
  <!-- 耦合线 -->
  <line x1="268" y1="125" x2="292" y2="125" stroke="#a3a3a3" stroke-dasharray="4 3" stroke-width="1.5"/>
  <line x1="268" y1="185" x2="292" y2="185" stroke="#a3a3a3" stroke-dasharray="4 3" stroke-width="1.5"/>
  <!-- 次级到二极管 -->
  <line x1="300" y1="120" x2="300" y2="150" stroke="#a3a3a3" stroke-width="2"/>
  <line x1="300" y1="150" x2="580" y2="150" stroke="#a3a3a3" stroke-width="2"/>
  <line x1="300" y1="150" x2="300" y2="180" stroke="#a3a3a3" stroke-width="2"/>
  <!-- D1/D2 到 Vo+ -->
  <line x1="300" y1="120" x2="320" y2="120" stroke="#a3a3a3" stroke-width="2"/>
  <line x1="340" y1="120" x2="580" y2="120" stroke="#a3a3a3" stroke-width="2"/>
  <line x1="300" y1="180" x2="320" y2="180" stroke="#a3a3a3" stroke-width="2"/>
  <line x1="340" y1="180" x2="340" y2="120" stroke="#a3a3a3" stroke-width="2"/>
  <!-- Cf -->
  <line x1="500" y1="120" x2="500" y2="135" stroke="#a3a3a3" stroke-width="2"/>
  <line x1="495" y1="135" x2="505" y2="135" stroke="#a3a3a3" stroke-width="2"/>
  <line x1="495" y1="145" x2="505" y2="145" stroke="#a3a3a3" stroke-width="2"/>
  <line x1="500" y1="145" x2="500" y2="150" stroke="#a3a3a3" stroke-width="2"/>
  <!-- GND -->
  <line x1="230" y1="340" x2="30" y2="340" stroke="#a3a3a3" stroke-width="2"/>

  <!-- ═══════ 元件符号 ═══════ -->
  <!-- Vin 电源 -->
  <circle cx="30" cy="65" r="16" fill="none" stroke="#a3a3a3" stroke-width="2"/>
  <text x="30" y="58" fill="#a3a3a3" font-size="14" text-anchor="middle">+</text>
  <text x="30" y="74" fill="#a3a3a3" font-size="14" text-anchor="middle">-</text>
  <text x="30" y="28" fill="#a3a3a3" font-size="12" text-anchor="middle">Vin</text>
  <text x="10" y="344" fill="#a3a3a3" font-size="12">GND</text>

  <!-- Q1 MOSFET -->
  <line x1="90" y1="30" x2="90" y2="75" stroke="#a3a3a3" stroke-width="2"/>
  <line x1="75" y1="52" x2="90" y2="52" stroke="#a3a3a3" stroke-width="2"/>
  <line x1="85" y1="75" x2="95" y2="75" stroke="#a3a3a3" stroke-width="2"/>
  <line x1="100" y1="40" x2="100" y2="70" stroke="#a3a3a3" stroke-width="1.5"/>
  <line x1="96" y1="40" x2="104" y2="40" stroke="#a3a3a3" stroke-width="1.5"/>
  <path d="M 100 40 L 96 52 L 104 52 Z" fill="#a3a3a3"/>
  <text x="65" y="55" fill="#a3a3a3" font-size="12" text-anchor="end">Q1</text>

  <!-- Q2 MOSFET -->
  <line x1="90" y1="235" x2="90" y2="280" stroke="#a3a3a3" stroke-width="2"/>
  <line x1="75" y1="257" x2="90" y2="257" stroke="#a3a3a3" stroke-width="2"/>
  <line x1="85" y1="280" x2="95" y2="280" stroke="#a3a3a3" stroke-width="2"/>
  <line x1="100" y1="245" x2="100" y2="275" stroke="#a3a3a3" stroke-width="1.5"/>
  <line x1="96" y1="245" x2="104" y2="245" stroke="#a3a3a3" stroke-width="1.5"/>
  <path d="M 100 245 L 96 257 L 104 257 Z" fill="#a3a3a3"/>
  <text x="65" y="260" fill="#a3a3a3" font-size="12" text-anchor="end">Q2</text>

  <!-- Cr 电容 -->
  <line x1="122" y1="90" x2="122" y2="110" stroke="#f59e0b" stroke-width="2"/>
  <line x1="128" y1="90" x2="128" y2="110" stroke="#f59e0b" stroke-width="2"/>
  <text x="125" y="80" fill="#f59e0b" font-size="12" text-anchor="middle">Cr</text>

  <!-- Lr 电感 -->
  <path d="M 155 100 q 5 -12 10 0 q 5 12 10 0 q 5 -12 10 0 q 5 12 10 0" fill="none" stroke="#14b8a6" stroke-width="2" stroke-linecap="round"/>
  <text x="170" y="80" fill="#14b8a6" font-size="12" text-anchor="middle">Lr</text>

  <!-- Lm 电感（垂直） -->
  <path d="M 210 120 q -5 5 0 10 q -5 5 0 10 q -5 5 0 10 q -5 5 0 10 q -5 5 0 10 q -5 5 0 10 q -5 5 0 10" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round"/>
  <text x="220" y="105" fill="#22c55e" font-size="12" text-anchor="middle">Lm</text>

  <!-- np 原边绕组 -->
  <path d="M 260 120 q -5 5 0 10 q -5 5 0 10 q -5 5 0 10 q -5 5 0 10 q -5 5 0 10 q -5 5 0 10 q -5 5 0 10" fill="none" stroke="#a3a3a3" stroke-width="2" stroke-linecap="round"/>
  <text x="265" y="155" fill="#a3a3a3" font-size="12" text-anchor="start">np</text>
  <circle cx="262" cy="125" r="2.5" fill="#a3a3a3"/>

  <!-- 上次级 ns -->
  <path d="M 300 120 q -5 5 0 10 q -5 5 0 10 q -5 5 0 10" fill="none" stroke="#a3a3a3" stroke-width="2" stroke-linecap="round"/>
  <circle cx="302" cy="125" r="2.5" fill="#a3a3a3"/>
  <text x="305" y="140" fill="#a3a3a3" font-size="10" text-anchor="start">ns</text>

  <!-- 下次级 ns -->
  <path d="M 300 150 q -5 5 0 10 q -5 5 0 10 q -5 5 0 10" fill="none" stroke="#a3a3a3" stroke-width="2" stroke-linecap="round"/>
  <circle cx="302" cy="175" r="2.5" fill="#a3a3a3"/>
  <text x="305" y="170" fill="#a3a3a3" font-size="10" text-anchor="start">ns</text>

  <!-- D1 二极管 -->
  <line x1="320" y1="120" x2="340" y2="120" stroke="#a3a3a3" stroke-width="2"/>
  <path d="M 320 112 L 320 128 L 340 120 Z" fill="#a3a3a3"/>
  <line x1="320" y1="112" x2="320" y2="128" stroke="#a3a3a3" stroke-width="2"/>
  <text x="325" y="105" fill="#a3a3a3" font-size="11">D1</text>

  <!-- D2 二极管 -->
  <line x1="320" y1="180" x2="340" y2="180" stroke="#a3a3a3" stroke-width="2"/>
  <path d="M 320 172 L 320 188 L 340 180 Z" fill="#a3a3a3"/>
  <line x1="320" y1="172" x2="320" y2="188" stroke="#a3a3a3" stroke-width="2"/>
  <text x="325" y="165" fill="#a3a3a3" font-size="11">D2</text>

  <!-- Cf 电容 -->
  <text x="510" y="132" fill="#a3a3a3" font-size="12">Cf</text>

  <!-- Io 箭头 -->
  <line x1="520" y1="110" x2="550" y2="110" stroke="#a3a3a3" stroke-width="2"/>
  <path d="M 550 110 L 540 106 L 540 114 Z" fill="#a3a3a3"/>
  <text x="555" y="105" fill="#a3a3a3" font-size="11">Io</text>

  <!-- Vo 标注 -->
  <text x="585" y="105" fill="#a3a3a3" font-size="10" text-anchor="start">Vo+</text>
  <text x="585" y="145" fill="#a3a3a3" font-size="10" text-anchor="start">Vo-</text>
  <text x="585" y="125" fill="#a3a3a3" font-size="12" text-anchor="start">Vo</text>

  <!-- GND 符号 -->
  <line x1="220" y1="340" x2="240" y2="340" stroke="#a3a3a3" stroke-width="2"/>
  <line x1="224" y1="344" x2="236" y2="344" stroke="#a3a3a3" stroke-width="2"/>
  <line x1="227" y1="348" x2="233" y2="348" stroke="#a3a3a3" stroke-width="2"/>
  <text x="220" y="344" fill="#a3a3a3" font-size="12" text-anchor="end">GND</text>

  <!-- SW 标签 -->
  <text x="72" y="103" fill="#f5f5f5" font-size="10" text-anchor="end">SW</text>
  <text x="170" y="55" fill="#a3a3a3" font-size="12" text-anchor="end">Vin+</text>
  <text x="170" y="300" fill="#a3a3a3" font-size="12" text-anchor="end">Vin-</text>

  <!-- ═══════ 节点（白色圆点） ═══════ -->
  <circle cx="30" cy="49" r="4" fill="none" stroke="#a3a3a3" stroke-width="2"/>
  <circle cx="30" cy="340" r="4" fill="none" stroke="#a3a3a3" stroke-width="2"/>
  <circle cx="90" cy="49" r="3.5" fill="#f5f5f5" stroke="#a3a3a3"/>
  <circle cx="90" cy="75" r="3.5" fill="#f5f5f5" stroke="#a3a3a3"/>
  <circle cx="90" cy="100" r="3.5" fill="#f5f5f5" stroke="#a3a3a3"/>
  <circle cx="90" cy="235" r="3.5" fill="#f5f5f5" stroke="#a3a3a3"/>
  <circle cx="90" cy="280" r="3.5" fill="#f5f5f5" stroke="#a3a3a3"/>
  <circle cx="120" cy="100" r="3.5" fill="#f5f5f5" stroke="#a3a3a3"/>
  <circle cx="155" cy="100" r="3.5" fill="#f5f5f5" stroke="#a3a3a3"/>
  <circle cx="185" cy="100" r="3.5" fill="#f5f5f5" stroke="#a3a3a3"/>
  <circle cx="230" cy="100" r="3.5" fill="#f5f5f5" stroke="#a3a3a3"/>
  <circle cx="210" cy="120" r="3.5" fill="#f5f5f5" stroke="#a3a3a3"/>
  <circle cx="230" cy="190" r="3.5" fill="#f5f5f5" stroke="#a3a3a3"/>
  <circle cx="230" cy="340" r="3.5" fill="#f5f5f5" stroke="#a3a3a3"/>
  <circle cx="260" cy="120" r="3.5" fill="#f5f5f5" stroke="#a3a3a3"/>
  <circle cx="300" cy="120" r="3.5" fill="#f5f5f5" stroke="#a3a3a3"/>
  <circle cx="300" cy="150" r="3.5" fill="#f5f5f5" stroke="#a3a3a3"/>
  <circle cx="300" cy="180" r="3.5" fill="#f5f5f5" stroke="#a3a3a3"/>
  <circle cx="320" cy="120" r="3.5" fill="#f5f5f5" stroke="#a3a3a3"/>
  <circle cx="340" cy="120" r="3.5" fill="#f5f5f5" stroke="#a3a3a3"/>
  <circle cx="320" cy="180" r="3.5" fill="#f5f5f5" stroke="#a3a3a3"/>
  <circle cx="340" cy="180" r="3.5" fill="#f5f5f5" stroke="#a3a3a3"/>
  <circle cx="500" cy="120" r="3.5" fill="#f5f5f5" stroke="#a3a3a3"/>
  <circle cx="500" cy="150" r="3.5" fill="#f5f5f5" stroke="#a3a3a3"/>
  <circle cx="580" cy="120" r="4" fill="none" stroke="#a3a3a3" stroke-width="2"/>
  <circle cx="580" cy="150" r="4" fill="none" stroke="#a3a3a3" stroke-width="2"/>

  <!-- ═══════ 6 阶段电流动画路径 ═══════ -->
  <!-- Phase 0: Q1 ON (青色) -->
  <g class="p0">
    <path d="M 30 49 L 90 49 M 90 75 L 90 100 M 90 100 L 120 100 M 128 100 L 155 100 M 185 100 L 230 100 M 230 100 L 210 120 M 230 190 L 230 340 M 230 100 L 260 120 M 230 190 L 230 340 M 300 120 L 320 120 M 340 120 L 500 120 M 500 120 L 580 120" fill="none" stroke="#14b8a6" stroke-width="3" stroke-dasharray="8 6" stroke-linecap="round" class="dash-flow" opacity="0.85"/>
  </g>

  <!-- Phase 1: 死区 (Lm绿色 + T琥珀) -->
  <g class="p1">
    <path d="M 230 100 L 210 120 M 230 190 L 230 340" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-dasharray="6 4" stroke-linecap="round" class="dash-flow" opacity="0.75"/>
    <path d="M 230 100 L 260 120 M 230 190 L 230 340" fill="none" stroke="#f59e0b" stroke-width="3" stroke-dasharray="8 6" stroke-linecap="round" class="dash-flow" opacity="0.85"/>
  </g>

  <!-- Phase 2: D2导通 (绿色) -->
  <g class="p2">
    <path d="M 230 340 L 230 190 M 210 120 L 230 100 M 230 340 L 230 190 M 260 120 L 230 100 M 300 180 L 320 180 M 340 180 L 340 120 M 340 120 L 500 120 M 500 120 L 580 120" fill="none" stroke="#22c55e" stroke-width="3" stroke-dasharray="8 6" stroke-linecap="round" class="dash-flow" opacity="0.85"/>
  </g>

  <!-- Phase 3: Q2 ON (青色) -->
  <g class="p3">
    <path d="M 230 340 L 230 190 M 210 120 L 230 100 M 230 340 L 230 190 M 260 120 L 230 100 M 300 180 L 320 180 M 340 180 L 340 120 M 340 120 L 500 120 M 500 120 L 580 120" fill="none" stroke="#14b8a6" stroke-width="3" stroke-dasharray="8 6" stroke-linecap="round" class="dash-flow" opacity="0.85"/>
  </g>

  <!-- Phase 4: 死区 (Lm绿色 + T琥珀) -->
  <g class="p4">
    <path d="M 230 340 L 230 190 M 210 120 L 230 100 M 230 340 L 230 190 M 260 120 L 230 100" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-dasharray="6 4" stroke-linecap="round" class="dash-flow" opacity="0.75"/>
    <path d="M 230 100 L 260 120 M 230 190 L 230 340" fill="none" stroke="#f59e0b" stroke-width="3" stroke-dasharray="8 6" stroke-linecap="round" class="dash-flow" opacity="0.85"/>
  </g>

  <!-- Phase 5: D1导通 (绿色) -->
  <g class="p5">
    <path d="M 30 49 L 90 49 M 90 75 L 90 100 M 90 100 L 120 100 M 128 100 L 155 100 M 185 100 L 230 100 M 230 100 L 210 120 M 230 190 L 230 340 M 230 100 L 260 120 M 230 190 L 230 340 M 300 120 L 320 120 M 340 120 L 500 120 M 500 120 L 580 120" fill="none" stroke="#22c55e" stroke-width="3" stroke-dasharray="8 6" stroke-linecap="round" class="dash-flow" opacity="0.85"/>
  </g>
</svg>
```

---

## 使用说明

1. **复制上方代码**，保存为 `llc-circuit.svg`
2. **在浏览器中打开**即可查看静态电路图
3. **修改阶段显示**：在根 `<svg>` 标签上添加/切换 class：
   - `class="phase-0"` → 显示 Q1 ON 阶段电流
   - `class="phase-5"` → 显示 D1 导通阶段电流（与原图一致）

---

## 核心 React 组件源码（项目内部文件）

### CircuitCanvas.tsx（主画布）

```tsx
import { useMemo, useCallback } from 'react'
import type { CircuitNode, NodeId, Wire, CurrentSegment } from './types'
import { lPath } from './utils/path'

import Node from './elements/Node'
import MOSFET from './elements/MOSFET'
import Capacitor from './elements/Capacitor'
import Inductor from './elements/Inductor'
import Transformer from './elements/Transformer'
import Diode from './elements/Diode'
import Source from './elements/Source'
import Ground from './elements/Ground'
import { useDrag } from './hooks/useDrag'
import type { CircuitState } from './types'

function computeWirePath(wire: Wire, nodes: Record<string, CircuitNode>): string {
  const from = nodes[wire.fromNode]
  const to = nodes[wire.toNode]
  if (!from || !to) return ''
  return lPath(from, to, true, true)
}

function computeCurrentPath(segment: CurrentSegment, nodes: Record<string, CircuitNode>): string {
  const from = nodes[segment.fromNode]
  const to = nodes[segment.toNode]
  if (!from || !to) return ''
  return lPath(from, to, true, true)
}

export default function CircuitCanvas({ state, onMoveNode, getElementProps }: {
  state: CircuitState
  onMoveNode: (nodeId: NodeId, dx: number, dy: number) => void
  getElementProps: (elementId: string) => Record<string, any>
}) {
  const { nodes, elements, wires, currentSegments, viewBox } = state

  const { svgRef, startDrag, moveDrag, endDrag } = useDrag(nodes, {
    onDragMove: (nodeId, dx, dy) => onMoveNode(nodeId, dx, dy),
  })

  const renderedElements = useMemo(() => {
    return Object.values(elements).map((el) => {
      const props = getElementProps(el.id)
      switch (el.type) {
        case 'mosfet': {
          const d = nodes[el.nodes.d], s = nodes[el.nodes.s], g = nodes[el.nodes.g]
          const bdTop = nodes[el.nodes.bd_top], bdBottom = nodes[el.nodes.bd_bottom]
          if (!d || !s || !g) return null
          return (
            <MOSFET key={el.id} d={d} s={s} g={g} bdTop={bdTop} bdBottom={bdBottom}
              label={el.label} active={props.active}
              activeColor={el.label === 'Q2' ? '#f59e0b' : '#14b8a6'}
              bodyDiode={props.bodyDiode} />
          )
        }
        case 'capacitor': {
          const left = nodes[el.nodes.left || el.nodes.top]
          const right = nodes[el.nodes.right || el.nodes.bottom]
          if (!left || !right) return null
          return <Capacitor key={el.id} left={left} right={right} label={el.label}
            direction={el.direction === 90 ? 90 : 0} />
        }
        case 'inductor': {
          const left = nodes[el.nodes.left || el.nodes.top]
          const right = nodes[el.nodes.right || el.nodes.bottom]
          if (!left || !right) return null
          return <Inductor key={el.id} left={left} right={right} label={el.label}
            direction={el.direction === 90 ? 90 : 0}
            color={el.label === 'Lm' ? '#22c55e' : '#14b8a6'} />
        }
        case 'transformer': {
          const pTop = nodes[el.nodes.p_top], pBottom = nodes[el.nodes.p_bottom]
          const s1Top = nodes[el.nodes.s1_top], s1Mid = nodes[el.nodes.s1_mid]
          const s2Bottom = nodes[el.nodes.s2_bottom]
          if (!pTop || !pBottom || !s1Top || !s1Mid || !s2Bottom) return null
          return <Transformer key={el.id} pTop={pTop} pBottom={pBottom}
            s1Top={s1Top} s1Mid={s1Mid} s2Bottom={s2Bottom} pLabel="np" sLabel="ns" />
        }
        case 'diode': {
          const anode = nodes[el.nodes.anode], cathode = nodes[el.nodes.cathode]
          if (!anode || !cathode) return null
          return <Diode key={el.id} anode={anode} cathode={cathode}
            label={el.label} active={props.active} direction={el.direction} />
        }
        case 'source': {
          const pos = nodes[el.nodes.pos], neg = nodes[el.nodes.neg]
          if (!pos || !neg) return null
          return <Source key={el.id} pos={pos} neg={neg} label={el.label} />
        }
        case 'ground': {
          const center = nodes[el.nodes.center]
          if (!center) return null
          return <Ground key={el.id} center={center} />
        }
        default: return null
      }
    })
  }, [elements, nodes, getElementProps])

  const renderedWires = useMemo(() => {
    return wires.map((w) => {
      const path = w.path || computeWirePath(w, nodes)
      if (!path) return null
      return <path key={w.id} d={path} fill="none" stroke={w.color || '#a3a3a3'}
        strokeWidth={w.strokeWidth || 2} strokeLinecap="round"
        strokeDasharray={w.dashed} className={w.animClass} />
    })
  }, [wires, nodes])

  const renderedCurrentPaths = useMemo(() => {
    return currentSegments.map((seg, i) => {
      const path = computeCurrentPath(seg, nodes)
      if (!path) return null
      return <path key={`current-${i}`} d={path} fill="none" stroke={seg.color}
        strokeWidth={3} strokeLinecap="round" strokeDasharray={seg.dashed || '8 6'}
        opacity={0.85} className={seg.animClass || 'dash-flow'} />
    })
  }, [currentSegments, nodes])

  return (
    <div className="relative">
      <svg ref={svgRef} viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
        className="w-full h-auto bg-bg rounded-lg border border-border/50"
        xmlns="http://www.w3.org/2000/svg"
        onMouseMove={(e) => moveDrag(e.clientX, e.clientY)}
        onMouseUp={endDrag} onMouseLeave={endDrag}>
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

        {renderedWires}
        {renderedCurrentPaths}
        {renderedElements}

        <text x={590} y={125} fill="#a3a3a3" fontSize={12}
          fontFamily="JetBrains Mono, monospace" textAnchor="start">Vo</text>
        <line x1={520} y1={110} x2={550} y2={110} stroke="#a3a3a3" strokeWidth={2} />
        <path d="M 550 110 L 540 106 L 540 114 Z" fill="#a3a3a3" />
        <text x={555} y={105} fill="#a3a3a3" fontSize={11}
          fontFamily="JetBrains Mono, monospace">Io</text>

        {Object.values(nodes).map((n) => (
          <Node key={n.id} id={n.id} x={n.x} y={n.y} label={n.label} type={n.type}
            onMouseDown={(id, e) => startDrag(id, e.clientX, e.clientY)} />
        ))}
      </svg>
    </div>
  )
}
```

### MOSFET.tsx（NMOS 符号）

```tsx
interface MOSFETProps {
  d: { x: number; y: number }
  s: { x: number; y: number }
  g: { x: number; y: number }
  bdTop?: { x: number; y: number }
  bdBottom?: { x: number; y: number }
  label?: string
  active?: boolean
  activeColor?: string
  bodyDiode?: boolean
}

export default function MOSFET({ d, s, g, bdTop, bdBottom, label = 'Q',
  active = false, activeColor = '#14b8a6', bodyDiode = false }: MOSFETProps) {
  const gateColor = active ? activeColor : '#a3a3a3'
  const gateWidth = active ? 3 : 2
  const bdColor = bodyDiode ? '#22c55e' : '#a3a3a3'
  const bdWidth = bodyDiode ? 3 : 1.5
  const labelColor = active ? activeColor : bodyDiode ? '#22c55e' : '#a3a3a3'
  const hasBodyDiode = bdTop && bdBottom

  return (
    <g>
      <line x1={d.x} y1={d.y} x2={s.x} y2={s.y} stroke="#a3a3a3" strokeWidth={2} />
      <line x1={g.x} y1={g.y} x2={d.x} y2={g.y} stroke={gateColor} strokeWidth={gateWidth} />
      <line x1={s.x - 5} y1={s.y} x2={s.x + 5} y2={s.y} stroke="#a3a3a3" strokeWidth={2} />
      {hasBodyDiode && bdTop && bdBottom && (
        <g>
          <line x1={bdTop.x} y1={bdTop.y} x2={bdBottom.x} y2={bdBottom.y}
            stroke={bdColor} strokeWidth={bdWidth} />
          <line x1={bdTop.x - 4} y1={bdTop.y} x2={bdTop.x + 4} y2={bdTop.y}
            stroke={bdColor} strokeWidth={bdWidth} />
          <path d={`M ${bdTop.x} ${bdTop.y} L ${bdTop.x - 4} ${bdTop.y + 12} L ${bdTop.x + 4} ${bdTop.y + 12} Z`}
            fill={bdColor} />
        </g>
      )}
      {label && (
        <text x={g.x - 10} y={g.y + 3} fill={labelColor} fontSize={12}
          fontFamily="JetBrains Mono, monospace" textAnchor="end">{label}</text>
      )}
    </g>
  )
}
```

### Capacitor.tsx（电容符号）

```tsx
interface CapacitorProps {
  left: { x: number; y: number }
  right: { x: number; y: number }
  label?: string
  direction?: 0 | 90
}

export default function Capacitor({ left, right, label = 'C', direction = 0 }: CapacitorProps) {
  const isHorizontal = direction === 0
  const color = '#f59e0b'

  if (isHorizontal) {
    const plateGap = 6
    const cx = (left.x + right.x) / 2
    return (
      <g>
        <line x1={left.x} y1={left.y} x2={cx - plateGap} y2={left.y} stroke="#a3a3a3" strokeWidth={2} />
        <line x1={cx + plateGap} y1={right.y} x2={right.x} y2={right.y} stroke="#a3a3a3" strokeWidth={2} />
        <line x1={cx - plateGap} y1={left.y - 10} x2={cx - plateGap} y2={left.y + 10} stroke={color} strokeWidth={2} />
        <line x1={cx + plateGap} y1={right.y - 10} x2={cx + plateGap} y2={right.y + 10} stroke={color} strokeWidth={2} />
        <text x={cx} y={left.y - 14} fill={color} fontSize={12}
          fontFamily="JetBrains Mono, monospace" textAnchor="middle">{label}</text>
      </g>
    )
  }

  const plateGap = 6
  const cy = (left.y + right.y) / 2
  return (
    <g>
      <line x1={left.x} y1={left.y} x2={left.x} y2={cy - plateGap} stroke="#a3a3a3" strokeWidth={2} />
      <line x1={right.x} y1={cy + plateGap} x2={right.x} y2={right.y} stroke="#a3a3a3" strokeWidth={2} />
      <line x1={left.x - 10} y1={cy - plateGap} x2={left.x + 10} y2={cy - plateGap} stroke={color} strokeWidth={2} />
      <line x1={right.x - 10} y1={cy + plateGap} x2={right.x + 10} y2={cy + plateGap} stroke={color} strokeWidth={2} />
      <text x={left.x + 14} y={cy} fill={color} fontSize={12}
        fontFamily="JetBrains Mono, monospace" textAnchor="start" dominantBaseline="middle">{label}</text>
    </g>
  )
}
```

### Inductor.tsx（电感符号）

```tsx
interface InductorProps {
  left: { x: number; y: number }
  right: { x: number; y: number }
  label?: string
  direction?: 0 | 90
  color?: string
}

export default function Inductor({ left, right, label = 'L', direction = 0, color = '#14b8a6' }: InductorProps) {
  const isHorizontal = direction === 0

  if (isHorizontal) {
    const loops = 4
    const segW = (right.x - left.x) / loops
    let d = `M ${left.x} ${left.y}`
    for (let i = 0; i < loops; i++) {
      const sx = left.x + i * segW
      d += ` q ${segW / 2} -12 ${segW} 0`
    }
    return (
      <g>
        <path d={d} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" />
        <text x={(left.x + right.x) / 2} y={left.y - 14} fill={color} fontSize={12}
          fontFamily="JetBrains Mono, monospace" textAnchor="middle">{label}</text>
      </g>
    )
  }

  const loops = 4
  const segH = (right.y - left.y) / loops
  let d = `M ${left.x} ${left.y}`
  for (let i = 0; i < loops; i++) {
    const sy = left.y + i * segH
    d += ` q -12 ${segH / 2} 0 ${segH}`
  }
  return (
    <g>
      <path d={d} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <text x={left.x + 12} y={(left.y + right.y) / 2} fill={color} fontSize={12}
        fontFamily="JetBrains Mono, monospace" textAnchor="start" dominantBaseline="middle">{label}</text>
    </g>
  )
}
```

### Transformer.tsx（变压器符号）

```tsx
interface TransformerProps {
  pTop: { x: number; y: number }
  pBottom: { x: number; y: number }
  s1Top: { x: number; y: number }
  s1Mid: { x: number; y: number }
  s2Bottom: { x: number; y: number }
  pLabel?: string
  sLabel?: string
}

export default function Transformer({ pTop, pBottom, s1Top, s1Mid, s2Bottom, pLabel = 'np', sLabel = 'ns' }: TransformerProps) {
  const pLoops = 7, pSegH = (pBottom.y - pTop.y) / pLoops
  const sLoops = 3, s1SegH = (s1Mid.y - s1Top.y) / sLoops, s2SegH = (s2Bottom.y - s1Mid.y) / sLoops

  let pPath = `M ${pTop.x} ${pTop.y}`
  for (let i = 0; i < pLoops; i++) pPath += ` q -5 ${pSegH / 2} 0 ${pSegH}`

  let s1Path = `M ${s1Top.x} ${s1Top.y}`
  for (let i = 0; i < sLoops; i++) s1Path += ` q -5 ${s1SegH / 2} 0 ${s1SegH}`

  let s2Path = `M ${s1Mid.x} ${s1Mid.y}`
  for (let i = 0; i < sLoops; i++) s2Path += ` q -5 ${s2SegH / 2} 0 ${s2SegH}`

  const coupleStart = pTop.x + 8, coupleEnd = s1Top.x - 8
  const coupleY1 = pTop.y + 5, coupleY2 = pBottom.y - 5

  return (
    <g>
      <path d={pPath} fill="none" stroke="#a3a3a3" strokeWidth={2} strokeLinecap="round" />
      <text x={pTop.x + 12} y={(pTop.y + pBottom.y) / 2} fill="#a3a3a3" fontSize={12}
        fontFamily="JetBrains Mono, monospace" textAnchor="start" dominantBaseline="middle">{pLabel}</text>
      <circle cx={pTop.x + 2} cy={pTop.y + 5} r={2.5} fill="#a3a3a3" />
      <line x1={coupleStart} y1={coupleY1} x2={coupleEnd} y2={coupleY1}
        stroke="#a3a3a3" strokeDasharray="4 3" strokeWidth={1.5} />
      <line x1={coupleStart} y1={coupleY2} x2={coupleEnd} y2={coupleY2}
        stroke="#a3a3a3" strokeDasharray="4 3" strokeWidth={1.5} />
      <path d={s1Path} fill="none" stroke="#a3a3a3" strokeWidth={2} strokeLinecap="round" />
      <circle cx={s1Top.x + 2} cy={s1Top.y + 5} r={2.5} fill="#a3a3a3" />
      <text x={s1Top.x + 8} y={s1Top.y + 20} fill="#a3a3a3" fontSize={10"
        fontFamily="JetBrains Mono, monospace" textAnchor="start">{sLabel}</text>
      <path d={s2Path} fill="none" stroke="#a3a3a3" strokeWidth={2} strokeLinecap="round" />
      <circle cx={s1Mid.x + 2} cy={s1Mid.y + 5} r={2.5} fill="#a3a3a3" />
      <text x={s1Mid.x + 8} y={s1Mid.y + 20} fill="#a3a3a3" fontSize={10"
        fontFamily="JetBrains Mono, monospace" textAnchor="start">{sLabel}</text>
    </g>
  )
}
```

### Diode.tsx（二极管符号）

```tsx
interface DiodeProps {
  anode: { x: number; y: number }
  cathode: { x: number; y: number }
  label?: string
  active?: boolean
  direction?: 0 | 90 | 180 | 270
}

export default function Diode({ anode, cathode, label = 'D', active = false, direction = 0 }: DiodeProps) {
  const color = active ? '#22c55e' : '#a3a3a3'
  const strokeWidth = active ? 3 : 2
  const isHorizontal = direction === 0 || direction === 180

  if (isHorizontal) {
    const arrowTipX = cathode.x
    const barX = anode.x + (cathode.x - anode.x) * 0.6
    const y = anode.y, h = 16
    return (
      <g>
        <line x1={anode.x} y1={y} x2={barX} y2={y} stroke="#a3a3a3" strokeWidth={2} />
        <path d={`M ${barX} ${y - h / 2} L ${barX} ${y + h / 2} L ${arrowTipX} ${y} Z`} fill={color} />
        <line x1={barX} y1={y - h / 2} x2={barX} y2={y + h / 2} stroke={color} strokeWidth={strokeWidth} />
        <line x1={arrowTipX} y1={y} x2={cathode.x} y2={y} stroke="#a3a3a3" strokeWidth={2} />
        <text x={anode.x + 10} y={y < 150 ? y - 14 : y + 18} fill={color} fontSize={11"
          fontFamily="JetBrains Mono, monospace" dominantBaseline={y < 150 ? "auto" : "hanging"}>{label}</text>
      </g>
    )
  }

  const arrowTipY = cathode.y
  const barY = anode.y + (cathode.y - anode.y) * 0.6
  const x = anode.x, h = 16
  return (
    <g>
      <line x1={x} y1={anode.y} x2={x} y2={barY} stroke="#a3a3a3" strokeWidth={2} />
      <path d={`M ${x - h / 2} ${barY} L ${x + h / 2} ${barY} L ${x} ${arrowTipY} Z`} fill={color} />
      <line x1={x - h / 2} y1={barY} x2={x + h / 2} y2={barY} stroke={color} strokeWidth={strokeWidth} />
      <line x1={x} y1={arrowTipY} x2={x} y2={cathode.y} stroke="#a3a3a3" strokeWidth={2} />
      <text x={x + 10} y={anode.y + 10} fill={color} fontSize={11">{label}</text>
    </g>
  )
}
```

### Source.tsx / Ground.tsx（电源与地）

```tsx
// Source.tsx
export default function Source({ pos, neg, label = 'Vin' }: {
  pos: { x: number; y: number }, neg: { x: number; y: number }, label?: string
}) {
  const cx = (pos.x + neg.x) / 2, cy = (pos.y + neg.y) / 2, r = 16
  return (
    <g>
      <line x1={pos.x} y1={pos.y} x2={cx} y2={cy - r} stroke="#a3a3a3" strokeWidth={2} />
      <line x1={neg.x} y1={neg.y} x2={cx} y2={cy + r} stroke="#a3a3a3" strokeWidth={2} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#a3a3a3" strokeWidth={2} />
      <text x={cx} y={cy - 4} fill="#a3a3a3" fontSize="14" textAnchor="middle" dominantBaseline="middle">+</text>
      <text x={cx} y={cy + 10} fill="#a3a3a3" fontSize="14" textAnchor="middle" dominantBaseline="middle">-</text>
      <text x={cx} y={cy - r - 6} fill="#a3a3a3" fontSize="12" textAnchor="middle">{label}</text>
    </g>
  )
}

// Ground.tsx
export default function Ground({ center }: { center: { x: number; y: number } }) {
  return (
    <g>
      <line x1={center.x - 10} y1={center.y} x2={center.x + 10} y2={center.y} stroke="#a3a3a3" strokeWidth={2} />
      <line x1={center.x - 6} y1={center.y + 4} x2={center.x + 6} y2={center.y + 4} stroke="#a3a3a3" strokeWidth={2} />
      <line x1={center.x - 3} y1={center.y + 8} x2={center.x + 3} y2={center.y + 8} stroke="#a3a3a3" strokeWidth={2} />
      <text x={center.x - 12} y={center.y + 4} fill="#a3a3a3" fontSize="12" textAnchor="end">GND</text>
    </g>
  )
}
```

### Node.tsx（可拖拽节点）

```tsx
export default function Node({ id, x, y, label, type = 'junction', onMouseDown }: {
  id: string, x: number, y: number, label?: string, type?: 'anchor' | 'junction' | 'terminal',
  onMouseDown?: (id: string, e: React.MouseEvent) => void
}) {
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    onMouseDown?.(id, e)
  }
  if (type === 'anchor') {
    return <circle cx={x} cy={y} r={10} fill="transparent" stroke="transparent"
      className="cursor-move" onMouseDown={handleMouseDown} style={{ pointerEvents: 'all' }} />
  }
  const isTerminal = type === 'terminal'
  const r = isTerminal ? 4 : 3.5
  return (
    <g className="cursor-move" onMouseDown={handleMouseDown}>
      <circle cx={x} cy={y} r={r} fill={isTerminal ? 'none' : '#f5f5f5'}
        stroke={isTerminal ? '#a3a3a3' : '#f5f5f5'} strokeWidth={1} />
      {label && <text x={x} y={y - (isTerminal ? 10 : 8)} fill="#a3a3a3"
        fontSize={isTerminal ? 12 : 10} fontFamily="JetBrains Mono, monospace" textAnchor="middle">{label}</text>}
    </g>
  )
}
```
