import { useState, useCallback } from 'react'
import type { CircuitState, NodeId, CurrentSegment, Phase } from '../types'
import { PHASES, CANVAS } from '../constants'
import { lPath } from '../utils/path'

// ─── 默认 LLC 布局 — 6个阶段 6组电流路径 ───

const defaultNodes: Record<NodeId, any> = {
  // Vin 电源
  vin_pos: { x: 30, y: 65, type: 'terminal', label: 'Vin+' },
  vin_neg: { x: 30, y: 300, type: 'terminal', label: 'Vin-' },

  // Q1
  q1_d: { x: 90, y: 49, type: 'junction' },
  q1_g: { x: 75, y: 52, type: 'terminal' },
  q1_s: { x: 90, y: 75, type: 'junction' },
  q1_bd_top: { x: 100, y: 40, type: 'junction' },
  q1_bd_bottom: { x: 100, y: 70, type: 'junction' },

  // Q2
  q2_d: { x: 90, y: 235, type: 'junction' },
  q2_g: { x: 75, y: 257, type: 'terminal' },
  q2_s: { x: 90, y: 280, type: 'junction' },
  q2_bd_top: { x: 100, y: 245, type: 'junction' },
  q2_bd_bottom: { x: 100, y: 275, type: 'junction' },

  // SW 节点
  sw: { x: 90, y: 100, type: 'junction', label: 'SW' },

  // Cr
  cr_left: { x: 120, y: 100, type: 'junction' },
  cr_right: { x: 155, y: 100, type: 'junction' },

  // Lr
  lr_left: { x: 185, y: 100, type: 'junction' },
  lr_right: { x: 230, y: 100, type: 'junction' },

  // 并联节点 (Lr 后，Lm/np 前)
  parallel_top: { x: 230, y: 100, type: 'junction' },
  lm_top: { x: 210, y: 120, type: 'junction' },
  lm_bottom: { x: 230, y: 190, type: 'junction' },
  lm_gnd: { x: 230, y: 340, type: 'junction' },

  np_top: { x: 260, y: 120, type: 'junction' },
  np_bottom: { x: 230, y: 190, type: 'junction' },
  np_gnd: { x: 230, y: 340, type: 'junction' },

  // 耦合线
  ns1_top: { x: 300, y: 120, type: 'junction' },
  ns1_mid: { x: 300, y: 150, type: 'junction' },
  ns2_bottom: { x: 300, y: 180, type: 'junction' },

  // D1
  d1_anode: { x: 320, y: 120, type: 'junction' },
  d1_cathode: { x: 340, y: 120, type: 'junction' },

  // D2
  d2_anode: { x: 320, y: 180, type: 'junction' },
  d2_cathode: { x: 340, y: 180, type: 'junction' },
  d2_to_vo: { x: 340, y: 120, type: 'junction' },

  // Vo+ / Vo- 线
  vo_plus: { x: 580, y: 120, type: 'terminal', label: 'Vo+' },
  vo_minus: { x: 580, y: 150, type: 'terminal', label: 'Vo-' },

  // Cf 电容
  cf_top: { x: 500, y: 120, type: 'junction' },
  cf_bottom: { x: 500, y: 150, type: 'junction' },

  // GND
  gnd: { x: 230, y: 340, type: 'junction' },
  gnd_left: { x: 30, y: 340, type: 'junction' },
}

const defaultElements = {
  q1: {
    id: 'q1',
    type: 'mosfet' as const,
    label: 'Q1',
    nodes: { d: 'q1_d', g: 'q1_g', s: 'q1_s', bd_top: 'q1_bd_top', bd_bottom: 'q1_bd_bottom' },
    direction: 0 as const,
    props: {},
  },
  q2: {
    id: 'q2',
    type: 'mosfet' as const,
    label: 'Q2',
    nodes: { d: 'q2_d', g: 'q2_g', s: 'q2_s', bd_top: 'q2_bd_top', bd_bottom: 'q2_bd_bottom' },
    direction: 180 as const,
    props: {},
  },
  cr: {
    id: 'cr',
    type: 'capacitor' as const,
    label: 'Cr',
    nodes: { left: 'cr_left', right: 'cr_right' },
    direction: 0 as const,
    props: {},
  },
  lr: {
    id: 'lr',
    type: 'inductor' as const,
    label: 'Lr',
    nodes: { left: 'lr_left', right: 'lr_right' },
    direction: 0 as const,
    props: {},
  },
  lm: {
    id: 'lm',
    type: 'inductor' as const,
    label: 'Lm',
    nodes: { top: 'lm_top', bottom: 'lm_bottom' },
    direction: 90 as const,
    props: {},
  },
  tx: {
    id: 'tx',
    type: 'transformer' as const,
    label: 'T',
    nodes: { p_top: 'np_top', p_bottom: 'np_bottom', s1_top: 'ns1_top', s1_mid: 'ns1_mid', s2_bottom: 'ns2_bottom' },
    direction: 0 as const,
    props: {},
  },
  d1: {
    id: 'd1',
    type: 'diode' as const,
    label: 'D1',
    nodes: { anode: 'd1_anode', cathode: 'd1_cathode' },
    direction: 0 as const,
    props: {},
  },
  d2: {
    id: 'd2',
    type: 'diode' as const,
    label: 'D2',
    nodes: { anode: 'd2_anode', cathode: 'd2_cathode' },
    direction: 0 as const,
    props: {},
  },
  vin: {
    id: 'vin',
    type: 'source' as const,
    label: 'Vin',
    nodes: { pos: 'vin_pos', neg: 'vin_neg' },
    direction: 0 as const,
    props: {},
  },
  gnd: {
    id: 'gnd',
    type: 'ground' as const,
    label: 'GND',
    nodes: { center: 'gnd' },
    direction: 0 as const,
    props: {},
  },
  cf: {
    id: 'cf',
    type: 'capacitor' as const,
    label: 'Cf',
    nodes: { top: 'cf_top', bottom: 'cf_bottom' },
    direction: 90 as const,
    props: {},
  },
}

// 静态连线（不参与电流动画的）
const staticWires = [
  // Vin 到 Q1/Q2
  { id: 'w_vin_q1', fromNode: 'vin_pos', toNode: 'q1_d', color: '#a3a3a3' },
  { id: 'w_vin_q2', fromNode: 'vin_neg', toNode: 'q2_s', color: '#a3a3a3' },
  // GND 连接
  { id: 'w_gnd', fromNode: 'gnd', toNode: 'gnd_left', color: '#a3a3a3' },
  { id: 'w_vin_gnd', fromNode: 'gnd_left', toNode: 'vin_neg', color: '#a3a3a3' },
  // SW
  { id: 'w_q1_s_sw', fromNode: 'q1_s', toNode: 'sw', color: '#a3a3a3' },
  { id: 'w_q2_d_sw', fromNode: 'q2_d', toNode: 'sw', color: '#a3a3a3' },
  // SW -> Cr
  { id: 'w_sw_cr', fromNode: 'sw', toNode: 'cr_left', color: '#a3a3a3' },
  // Cr -> Lr
  { id: 'w_cr_lr', fromNode: 'cr_right', toNode: 'lr_left', color: '#a3a3a3' },
  // Lr -> parallel
  { id: 'w_lr_parallel', fromNode: 'lr_right', toNode: 'parallel_top', color: '#a3a3a3' },
  // Lm 并联
  { id: 'w_lm_top', fromNode: 'parallel_top', toNode: 'lm_top', color: '#22c55e' },
  { id: 'w_lm_bottom', fromNode: 'lm_bottom', toNode: 'lm_gnd', color: '#22c55e' },
  // np 并联
  { id: 'w_np_top', fromNode: 'parallel_top', toNode: 'np_top', color: '#a3a3a3' },
  { id: 'w_np_bottom', fromNode: 'np_bottom', toNode: 'np_gnd', color: '#a3a3a3' },
  // 耦合线
  { id: 'w_couple1', fromNode: 'ns1_top', toNode: 'd1_anode', color: '#a3a3a3' },
  { id: 'w_couple2', fromNode: 'ns2_bottom', toNode: 'd2_anode', color: '#a3a3a3' },
  // D1 -> Vo+
  { id: 'w_d1_vo', fromNode: 'd1_cathode', toNode: 'vo_plus', color: '#a3a3a3' },
  // D2 -> Vo+
  { id: 'w_d2_vo', fromNode: 'd2_cathode', toNode: 'd2_to_vo', color: '#a3a3a3' },
  { id: 'w_d2_vo_up', fromNode: 'd2_to_vo', toNode: 'vo_plus', color: '#a3a3a3' },
  // Vo- 中心抽头
  { id: 'w_vo_minus', fromNode: 'ns1_mid', toNode: 'vo_minus', color: '#a3a3a3' },
  // Cf
  { id: 'w_cf_top', fromNode: 'cf_top', toNode: 'vo_plus', color: '#a3a3a3' },
  { id: 'w_cf_bottom', fromNode: 'cf_bottom', toNode: 'vo_minus', color: '#a3a3a3' },
]

// 六个阶段的电流路径定义（节点序列）
const phaseCurrentSegments: CurrentSegment[][] = [
  // Phase 0: t1-t2, Q1 ON — 正半周能量传输
  [
    { fromNode: 'vin_pos', toNode: 'q1_d', color: '#14b8a6', animClass: 'dash-flow' },
    { fromNode: 'q1_s', toNode: 'sw', color: '#14b8a6', animClass: 'dash-flow' },
    { fromNode: 'sw', toNode: 'cr_left', color: '#14b8a6', animClass: 'dash-flow' },
    { fromNode: 'cr_right', toNode: 'lr_left', color: '#14b8a6', animClass: 'dash-flow' },
    { fromNode: 'lr_right', toNode: 'parallel_top', color: '#14b8a6', animClass: 'dash-flow' },
    // Lm 路径（绿色）
    { fromNode: 'parallel_top', toNode: 'lm_top', color: '#22c55e', animClass: 'dash-flow' },
    { fromNode: 'lm_bottom', toNode: 'lm_gnd', color: '#22c55e', animClass: 'dash-flow' },
    // T 传递路径
    { fromNode: 'parallel_top', toNode: 'np_top', color: '#14b8a6', animClass: 'dash-flow' },
    { fromNode: 'np_bottom', toNode: 'np_gnd', color: '#14b8a6', animClass: 'dash-flow' },
    // 次级
    { fromNode: 'ns1_top', toNode: 'd1_anode', color: '#14b8a6', animClass: 'dash-flow' },
    { fromNode: 'd1_cathode', toNode: 'vo_plus', color: '#14b8a6', animClass: 'dash-flow' },
  ],
  // Phase 1: t2-t3, 死区 — Lm电流+T环流
  [
    { fromNode: 'parallel_top', toNode: 'lm_top', color: '#22c55e', animClass: 'dash-flow' },
    { fromNode: 'lm_bottom', toNode: 'lm_gnd', color: '#22c55e', animClass: 'dash-flow' },
    // T 环流（只走原边，不走次级）
    { fromNode: 'parallel_top', toNode: 'np_top', color: '#f59e0b', animClass: 'dash-flow' },
    { fromNode: 'np_bottom', toNode: 'np_gnd', color: '#f59e0b', animClass: 'dash-flow' },
  ],
  // Phase 2: t3-t4, D2导通 — Q2体二极管导通
  [
    { fromNode: 'lm_gnd', toNode: 'lm_bottom', color: '#22c55e', animClass: 'dash-flow' },
    { fromNode: 'lm_top', toNode: 'parallel_top', color: '#22c55e', animClass: 'dash-flow' },
    // T 传递路径
    { fromNode: 'np_gnd', toNode: 'np_bottom', color: '#22c55e', animClass: 'dash-flow' },
    { fromNode: 'np_top', toNode: 'parallel_top', color: '#22c55e', animClass: 'dash-flow' },
    // 次级 D2 导通
    { fromNode: 'ns2_bottom', toNode: 'd2_anode', color: '#22c55e', animClass: 'dash-flow' },
    { fromNode: 'd2_cathode', toNode: 'd2_to_vo', color: '#22c55e', animClass: 'dash-flow' },
  ],
  // Phase 3: t4-t5, Q2 ON — 负半周能量传输
  [
    { fromNode: 'lm_gnd', toNode: 'lm_bottom', color: '#22c55e', animClass: 'dash-flow' },
    { fromNode: 'lm_top', toNode: 'parallel_top', color: '#22c55e', animClass: 'dash-flow' },
    // T 传递路径
    { fromNode: 'np_gnd', toNode: 'np_bottom', color: '#14b8a6', animClass: 'dash-flow' },
    { fromNode: 'np_top', toNode: 'parallel_top', color: '#14b8a6', animClass: 'dash-flow' },
    // 次级
    { fromNode: 'ns2_bottom', toNode: 'd2_anode', color: '#14b8a6', animClass: 'dash-flow' },
    { fromNode: 'd2_cathode', toNode: 'd2_to_vo', color: '#14b8a6', animClass: 'dash-flow' },
  ],
  // Phase 4: t5-t6, 死区 — Lm电流+T环流
  [
    { fromNode: 'lm_gnd', toNode: 'lm_bottom', color: '#22c55e', animClass: 'dash-flow' },
    { fromNode: 'lm_top', toNode: 'parallel_top', color: '#22c55e', animClass: 'dash-flow' },
    { fromNode: 'np_gnd', toNode: 'np_bottom', color: '#f59e0b', animClass: 'dash-flow' },
    { fromNode: 'np_top', toNode: 'parallel_top', color: '#f59e0b', animClass: 'dash-flow' },
  ],
  // Phase 5: t6-t1, D1导通 — Q1体二极管导通
  [
    { fromNode: 'vin_pos', toNode: 'q1_d', color: '#22c55e', animClass: 'dash-flow' },
    { fromNode: 'q1_s', toNode: 'sw', color: '#22c55e', animClass: 'dash-flow' },
    { fromNode: 'sw', toNode: 'cr_left', color: '#22c55e', animClass: 'dash-flow' },
    { fromNode: 'cr_right', toNode: 'lr_left', color: '#22c55e', animClass: 'dash-flow' },
    { fromNode: 'lr_right', toNode: 'parallel_top', color: '#22c55e', animClass: 'dash-flow' },
    { fromNode: 'parallel_top', toNode: 'lm_top', color: '#22c55e', animClass: 'dash-flow' },
    { fromNode: 'lm_bottom', toNode: 'lm_gnd', color: '#22c55e', animClass: 'dash-flow' },
    // T 传递
    { fromNode: 'parallel_top', toNode: 'np_top', color: '#22c55e', animClass: 'dash-flow' },
    { fromNode: 'np_bottom', toNode: 'np_gnd', color: '#22c55e', animClass: 'dash-flow' },
    // 次级 D1
    { fromNode: 'ns1_top', toNode: 'd1_anode', color: '#22c55e', animClass: 'dash-flow' },
    { fromNode: 'd1_cathode', toNode: 'vo_plus', color: '#22c55e', animClass: 'dash-flow' },
  ],
]

export function useCircuitState() {
  const [state, setState] = useState<CircuitState>({
    nodes: defaultNodes,
    elements: defaultElements,
    wires: staticWires.map((w) => ({ ...w, path: undefined, zIndex: 0 })),
    currentSegments: phaseCurrentSegments[0],
    currentPhase: 0,
    viewBox: CANVAS.viewBox,
  })

  const setPhase = useCallback((phase: number) => {
    setState((prev) => ({
      ...prev,
      currentPhase: phase,
      currentSegments: phaseCurrentSegments[phase] || [],
    }))
  }, [])

  const moveNode = useCallback((nodeId: NodeId, dx: number, dy: number) => {
    setState((prev) => {
      const node = prev.nodes[nodeId]
      if (!node) return prev
      const newNodes = { ...prev.nodes, [nodeId]: { ...node, x: node.x + dx, y: node.y + dy } }
      // 重新计算所有 wire 的路径
      const newWires = prev.wires.map((w) => ({
        ...w,
        path: undefined, // 会在渲染时重新计算
      }))
      return { ...prev, nodes: newNodes, wires: newWires }
    })
  }, [])

  const getActivePhase = useCallback((): Phase => {
    return PHASES[state.currentPhase] || PHASES[0]
  }, [state.currentPhase])

  const getElementProps = useCallback((elementId: string) => {
    const phase = state.currentPhase
    const el = state.elements[elementId]
    if (!el) return {}

    // 根据阶段计算高亮状态
    const q1Active = phase === 0 || phase === 5
    const q2Active = phase === 2 || phase === 3
    const q1BodyDiode = phase === 5
    const q2BodyDiode = phase === 2
    const d1Active = phase === 0 || phase === 1 || phase === 5
    const d2Active = phase === 2 || phase === 3 || phase === 4

    switch (elementId) {
      case 'q1':
        return { ...el.props, active: q1Active, bodyDiode: q1BodyDiode }
      case 'q2':
        return { ...el.props, active: q2Active, bodyDiode: q2BodyDiode }
      case 'd1':
        return { ...el.props, active: d1Active }
      case 'd2':
        return { ...el.props, active: d2Active }
      default:
        return el.props
    }
  }, [state.currentPhase, state.elements])

  return {
    state,
    setPhase,
    moveNode,
    getActivePhase,
    getElementProps,
  }
}
