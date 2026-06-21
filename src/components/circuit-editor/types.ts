export type NodeId = string
export type ElementId = string
export type WireId = string

/** 端口方向（元件在空间中的朝向） */
export type Direction = 0 | 90 | 180 | 270

/** 节点类型 */
export type NodeType = 'anchor' | 'junction' | 'terminal'

/** 电路节点 — 连接点 */
export interface CircuitNode {
  id: NodeId
  x: number
  y: number
  type: NodeType
  label?: string
}

/** 元件支持的类型 */
export type ElementType =
  | 'mosfet'
  | 'capacitor'
  | 'inductor'
  | 'transformer'
  | 'diode'
  | 'source'
  | 'ground'
  | 'load'

/** 通用元件定义 */
export interface CircuitElement {
  id: ElementId
  type: ElementType
  /** 元件名称标签 */
  label: string
  /** 各端口绑定的节点ID */
  nodes: Record<string, NodeId>
  /** 朝向 */
  direction: Direction
  /** 额外属性（如体二极管高亮、MOSFET开关状态等） */
  props: Record<string, any>
}

/** 连线 */
export interface Wire {
  id: WireId
  fromNode: NodeId
  toNode: NodeId
  /** 是否是高亮的电流路径 */
  isCurrentPath?: boolean
  /** 线段颜色 */
  color?: string
  /** 虚线模式 */
  dashed?: string
  /** 线宽 */
  strokeWidth?: number
  /** 自定义路径（否则自动计算） */
  path?: string
  /** 动画类名 */
  animClass?: string
  /** z-index */
  zIndex?: number
}

/** 电流流动段 — 用于动态路径 */
export interface CurrentSegment {
  fromNode: NodeId
  toNode: NodeId
  color: string
  dashed?: string
  animClass?: string
  label?: string
}

/** 工作阶段 */
export interface Phase {
  id: number
  label: string
  name: string
  desc: string
  color: string
}

/** 完整电路状态 */
export interface CircuitState {
  nodes: Record<NodeId, CircuitNode>
  elements: Record<ElementId, CircuitElement>
  wires: Wire[]
  currentSegments: CurrentSegment[]
  currentPhase: number
  /** 画布视口 */
  viewBox: { x: number; y: number; w: number; h: number }
}

/** 拖拽状态 */
export interface DragState {
  active: boolean
  nodeId: NodeId | null
  startX: number
  startY: number
  /** 拖拽开始时所有节点的原始坐标（用于相对移动） */
  originalNodes: Record<NodeId, { x: number; y: number }>
}

/** 导出的 SVG 数据 */
export interface SVGExportData {
  svgString: string
  width: number
  height: number
}
