import { useState, useCallback, useRef } from 'react'
import type { DragState, CircuitNode, NodeId } from '../types'

interface UseDragOptions {
  onDragMove?: (nodeId: NodeId, dx: number, dy: number, allNodes: Record<NodeId, CircuitNode>) => void
  onDragEnd?: () => void
}

/**
 * 节点拖拽 Hook
 * 支持拖拽单个节点，同时通知外部所有节点的位移
 */
export function useDrag(nodes: Record<NodeId, CircuitNode>, options: UseDragOptions = {}) {
  const [dragState, setDragState] = useState<DragState>({
    active: false,
    nodeId: null,
    startX: 0,
    startY: 0,
    originalNodes: {},
  })

  const svgRef = useRef<SVGSVGElement | null>(null)

  const getSVGPoint = useCallback((clientX: number, clientY: number) => {
    if (!svgRef.current) return { x: clientX, y: clientY }
    const pt = svgRef.current.createSVGPoint()
    pt.x = clientX
    pt.y = clientY
    const ctm = svgRef.current.getScreenCTM()
    if (!ctm) return { x: clientX, y: clientY }
    const svgP = pt.matrixTransform(ctm.inverse())
    return { x: svgP.x, y: svgP.y }
  }, [])

  const startDrag = useCallback(
    (nodeId: NodeId, clientX: number, clientY: number) => {
      const originalNodes: Record<NodeId, { x: number; y: number }> = {}
      Object.entries(nodes).forEach(([id, n]) => {
        originalNodes[id] = { x: n.x, y: n.y }
      })
      const pt = getSVGPoint(clientX, clientY)
      setDragState({
        active: true,
        nodeId,
        startX: pt.x,
        startY: pt.y,
        originalNodes,
      })
    },
    [nodes, getSVGPoint]
  )

  const moveDrag = useCallback(
    (clientX: number, clientY: number) => {
      if (!dragState.active || !dragState.nodeId) return
      const pt = getSVGPoint(clientX, clientY)
      const dx = pt.x - dragState.startX
      const dy = pt.y - dragState.startY
      options.onDragMove?.(dragState.nodeId, dx, dy, nodes)
    },
    [dragState, getSVGPoint, options]
  )

  const endDrag = useCallback(() => {
    if (!dragState.active) return
    setDragState({
      active: false,
      nodeId: null,
      startX: 0,
      startY: 0,
      originalNodes: {},
    })
    options.onDragEnd?.()
  }, [dragState, options])

  return {
    svgRef,
    dragState,
    startDrag,
    moveDrag,
    endDrag,
  }
}
