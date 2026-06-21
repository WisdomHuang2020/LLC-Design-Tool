import { useMemo, useCallback, useRef, useEffect } from 'react'
import type { CircuitNode, NodeId, Wire, CurrentSegment } from './types'
import { lPath } from './utils/path'
import { exportSVG, downloadSVG, copySVG } from './utils/export'

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

interface CircuitCanvasProps {
  state: CircuitState
  onMoveNode: (nodeId: NodeId, dx: number, dy: number) => void
  onPhaseChange: (phase: number) => void
  getElementProps: (elementId: string) => Record<string, any>
}

/**
 * 根据 wire 的两端节点自动计算 L-shape 路径
 */
function computeWirePath(wire: Wire, nodes: Record<string, CircuitNode>): string {
  const from = nodes[wire.fromNode]
  const to = nodes[wire.toNode]
  if (!from || !to) return ''
  return lPath(from, to, true, true)
}

/**
 * 根据电流段的两端节点计算路径
 */
function computeCurrentPath(segment: CurrentSegment, nodes: Record<string, CircuitNode>): string {
  const from = nodes[segment.fromNode]
  const to = nodes[segment.toNode]
  if (!from || !to) return ''
  return lPath(from, to, true, true)
}

export default function CircuitCanvas({ state, onMoveNode, getElementProps }: CircuitCanvasProps) {
  const { nodes, elements, wires, currentSegments, viewBox } = state

  // 拖拽
  const { svgRef, startDrag, moveDrag, endDrag } = useDrag(nodes, {
    onDragMove: (nodeId, dx, dy) => {
      onMoveNode(nodeId, dx, dy)
    },
  })

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      moveDrag(e.clientX, e.clientY)
    },
    [moveDrag]
  )

  const handleMouseUp = useCallback(() => {
    endDrag()
  }, [endDrag])

  const handleExport = useCallback(() => {
    const svg = exportSVG(state)
    downloadSVG(svg, 'llc-circuit.svg')
  }, [state])

  const handleExportCopy = useCallback(async () => {
    const svg = exportSVG(state)
    const ok = await copySVG(svg)
    if (ok) {
      alert('SVG 代码已复制到剪贴板')
    } else {
      alert('复制失败，请手动复制')
    }
  }, [state])

  // 渲染元件
  const renderedElements = useMemo(() => {
    return Object.values(elements).map((el) => {
      const props = getElementProps(el.id)

      switch (el.type) {
        case 'mosfet': {
          const d = nodes[el.nodes.d]
          const s = nodes[el.nodes.s]
          const g = nodes[el.nodes.g]
          const bdTop = nodes[el.nodes.bd_top]
          const bdBottom = nodes[el.nodes.bd_bottom]
          if (!d || !s || !g) return null
          return (
            <MOSFET
              key={el.id}
              d={d}
              s={s}
              g={g}
              bdTop={bdTop}
              bdBottom={bdBottom}
              label={el.label}
              active={props.active}
              activeColor={el.label === 'Q2' ? '#f59e0b' : '#14b8a6'}
              bodyDiode={props.bodyDiode}
            />
          )
        }
        case 'capacitor': {
          const left = nodes[el.nodes.left || el.nodes.top]
          const right = nodes[el.nodes.right || el.nodes.bottom]
          if (!left || !right) return null
          return (
            <Capacitor
              key={el.id}
              left={left}
              right={right}
              label={el.label}
              direction={el.direction === 90 ? 90 : 0}
            />
          )
        }
        case 'inductor': {
          const left = nodes[el.nodes.left || el.nodes.top]
          const right = nodes[el.nodes.right || el.nodes.bottom]
          if (!left || !right) return null
          return (
            <Inductor
              key={el.id}
              left={left}
              right={right}
              label={el.label}
              direction={el.direction === 90 ? 90 : 0}
              color={el.label === 'Lm' ? '#22c55e' : '#14b8a6'}
            />
          )
        }
        case 'transformer': {
          const pTop = nodes[el.nodes.p_top]
          const pBottom = nodes[el.nodes.p_bottom]
          const s1Top = nodes[el.nodes.s1_top]
          const s1Mid = nodes[el.nodes.s1_mid]
          const s2Bottom = nodes[el.nodes.s2_bottom]
          if (!pTop || !pBottom || !s1Top || !s1Mid || !s2Bottom) return null
          return (
            <Transformer
              key={el.id}
              pTop={pTop}
              pBottom={pBottom}
              s1Top={s1Top}
              s1Mid={s1Mid}
              s2Bottom={s2Bottom}
              pLabel="np"
              sLabel="ns"
            />
          )
        }
        case 'diode': {
          const anode = nodes[el.nodes.anode]
          const cathode = nodes[el.nodes.cathode]
          if (!anode || !cathode) return null
          return (
            <Diode
              key={el.id}
              anode={anode}
              cathode={cathode}
              label={el.label}
              active={props.active}
              direction={el.direction}
            />
          )
        }
        case 'source': {
          const pos = nodes[el.nodes.pos]
          const neg = nodes[el.nodes.neg]
          if (!pos || !neg) return null
          return <Source key={el.id} pos={pos} neg={neg} label={el.label} />
        }
        case 'ground': {
          const center = nodes[el.nodes.center]
          if (!center) return null
          return <Ground key={el.id} center={center} />
        }
        default:
          return null
      }
    })
  }, [elements, nodes, getElementProps])

  // 渲染静态连线
  const renderedWires = useMemo(() => {
    return wires.map((w) => {
      const path = w.path || computeWirePath(w, nodes)
      if (!path) return null
      return (
        <path
          key={w.id}
          d={path}
          fill="none"
          stroke={w.color || '#a3a3a3'}
          strokeWidth={w.strokeWidth || 2}
          strokeLinecap="round"
          strokeDasharray={w.dashed}
          className={w.animClass}
        />
      )
    })
  }, [wires, nodes])

  // 渲染电流路径
  const renderedCurrentPaths = useMemo(() => {
    return currentSegments.map((seg, i) => {
      const path = computeCurrentPath(seg, nodes)
      if (!path) return null
      return (
        <path
          key={`current-${i}`}
          d={path}
          fill="none"
          stroke={seg.color}
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray={seg.dashed || '8 6'}
          opacity={0.85}
          className={seg.animClass || 'dash-flow'}
        />
      )
    })
  }, [currentSegments, nodes])

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
        className="w-full h-auto bg-bg rounded-lg border border-border/50"
        xmlns="http://www.w3.org/2000/svg"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
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

        {/* 静态连线 */}
        {renderedWires}

        {/* 电流路径（在元件上方） */}
        {renderedCurrentPaths}

        {/* 元件 */}
        {renderedElements}

        {/* 输出标注 */}
        <text x={590} y={125} fill="#a3a3a3" fontSize={12} fontFamily="JetBrains Mono, monospace" textAnchor="start">Vo</text>
        {/* Io 输出电流箭头 */}
        <line x1={520} y1={110} x2={550} y2={110} stroke="#a3a3a3" strokeWidth={2} />
        <path d="M 550 110 L 540 106 L 540 114 Z" fill="#a3a3a3" />
        <text x={555} y={105} fill="#a3a3a3" fontSize={11} fontFamily="JetBrains Mono, monospace">Io</text>

        {/* 可拖拽节点（在最上层） */}
        {Object.values(nodes).map((n) => (
          <Node
            key={n.id}
            id={n.id}
            x={n.x}
            y={n.y}
            label={n.label}
            type={n.type}
            onMouseDown={(id, e) => startDrag(id, e.clientX, e.clientY)}
          />
        ))}
      </svg>
    </div>
  )
}
