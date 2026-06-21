/**
 * 标准化电力电子电路符号库
 * 遵循 IEEE / IEC 图形约定，用于 LLC 设计工具的电路图绘制。
 */

/* ─── 颜色 ─── */
export const C = {
  wire: '#a3a3a3',
  mos: '#a3a3a3',
  diode: '#22c55e',
  inductor: '#14b8a6',
  capacitor: '#f59e0b',
  resistor: '#a3a3a3',
  text: '#a3a3a3',
}

export interface SymbolProps {
  x: number
  y: number
  color?: string
  strokeWidth?: number
  label?: string
  labelColor?: string
  labelSize?: number
}

export interface OrientedSymbolProps extends SymbolProps {
  direction?: 'up' | 'down' | 'left' | 'right'
  size?: number
}

/* ─── 辅助：标签偏移 ─── */

function labelOffsets(
  dir: 'up' | 'down' | 'left' | 'right'
): { dx: number; dy: number; textAnchor: 'start' | 'middle' | 'end' } {
  switch (dir) {
    case 'up':
      return { dx: -24, dy: 0, textAnchor: 'end' }
    case 'down':
      return { dx: -24, dy: 0, textAnchor: 'end' }
    case 'left':
      return { dx: 0, dy: -20, textAnchor: 'middle' }
    case 'right':
      return { dx: 0, dy: -20, textAnchor: 'middle' }
  }
}

function renderLabel(
  x: number,
  y: number,
  dir: 'up' | 'down' | 'left' | 'right',
  label: string,
  labelColor: string,
  labelSize: number
) {
  const off = labelOffsets(dir)
  return (
    <text
      x={x + off.dx}
      y={y + off.dy}
      fill={labelColor}
      fontSize={labelSize}
      fontFamily="JetBrains Mono, monospace"
      textAnchor={off.textAnchor}
      dominantBaseline="middle"
    >
      {label}
    </text>
  )
}

/* ─── N 沟道 MOSFET（垂直，默认漏极朝上） ───
 * direction: up = D在上S在下, down = D在下S在上,
 *            left = D在左S在右, right = D在右S在左
 */

export function NMOS({
  x,
  y,
  direction = 'up',
  size = 72,
  color = C.mos,
  strokeWidth = 2,
  label,
  labelColor = C.text,
  labelSize = 12,
}: OrientedSymbolProps) {
  const h = size / 2
  const cx = x + 2
  const gateLen = 14
  const gateX = x - 14

  const deg: Record<typeof direction, number> = {
    up: 0,
    down: 180,
    left: -90,
    right: 90,
  }
  const transform = deg[direction] ? `rotate(${deg[direction]} ${x} ${y})` : undefined

  return (
    <g>
      <g transform={transform}>
        <line x1={cx} y1={y - h} x2={cx} y2={y - h + 14} stroke={color} strokeWidth={strokeWidth} />
        <line x1={cx} y1={y + h - 14} x2={cx} y2={y + h} stroke={color} strokeWidth={strokeWidth} />
        <line x1={cx} y1={y - h + 14} x2={cx} y2={y + h - 14} stroke={color} strokeWidth={strokeWidth} />
        <line x1={gateX} y1={y} x2={gateX + gateLen} y2={y} stroke={color} strokeWidth={strokeWidth} />

        {/* 源极短横线 + N 沟道箭头（箭头指向沟道，向左） */}
        <line x1={cx} y1={y + h - 20} x2={cx + 10} y2={y + h - 20} stroke={color} strokeWidth={strokeWidth} />
        <path d={`M ${cx + 10} ${y + h - 20} L ${cx + 18} ${y + h - 16} L ${cx + 18} ${y + h - 24} Z`} fill={color} />

        {/* 体二极管：阳极接源极，阴极接漏极，画在沟道右侧 */}
        <line x1={cx + 14} y1={y + h - 20} x2={cx + 14} y2={y - h + 24} stroke={color} strokeWidth={1.5} />
        <line x1={cx + 10} y1={y - h + 24} x2={cx + 18} y2={y - h + 24} stroke={color} strokeWidth={strokeWidth} />
        <path d={`M ${cx + 14} ${y - h + 24} L ${cx + 10} ${y - h + 36} L ${cx + 18} ${y - h + 36} Z`} fill={color} />
      </g>
      {label && renderLabel(x, y, direction, label, labelColor, labelSize)}
    </g>
  )
}

/* ─── 标准二极管 ───
 * direction 表示导通方向（三角形尖端指向的方向），默认向下。
 */

export function Diode({
  x,
  y,
  direction = 'down',
  size = 32,
  color = C.diode,
  strokeWidth = 2,
  label,
  labelColor = C.text,
  labelSize = 11,
}: OrientedSymbolProps) {
  const h = size / 2
  const deg: Record<typeof direction, number> = {
    up: 0,
    down: 180,
    left: -90,
    right: 90,
  }
  const transform = deg[direction] ? `rotate(${deg[direction]} ${x} ${y})` : undefined

  return (
    <g>
      <g transform={transform}>
        <line x1={x} y1={y - h} x2={x} y2={y - 6} stroke={color} strokeWidth={strokeWidth} />
        <line x1={x} y1={y + 6} x2={x} y2={y + h} stroke={color} strokeWidth={strokeWidth} />
        <path d={`M ${x} ${y - h + 8} L ${x - 8} ${y + 4} L ${x + 8} ${y + 4} Z`} fill={color} />
        <line x1={x - 8} y1={y + 4} x2={x + 8} y2={y + 4} stroke={color} strokeWidth={strokeWidth} />
      </g>
      {label && renderLabel(x, y, direction, label, labelColor, labelSize)}
    </g>
  )
}

/* ─── 电感 ───
 * direction: right/left 水平, up/down 垂直
 */

export function Inductor({
  x,
  y,
  direction = 'right',
  length = 60,
  color = C.inductor,
  strokeWidth = 2,
  label,
  labelColor = C.text,
  labelSize = 12,
}: OrientedSymbolProps & { length?: number }) {
  const half = length / 2
  const turns = 4
  const turnW = length / turns
  const amp = 9

  const deg: Record<typeof direction, number> = {
    right: 0,
    left: 0,
    up: -90,
    down: 90,
  }
  const isHoriz = direction === 'right' || direction === 'left'
  const transform = deg[direction] ? `rotate(${deg[direction]} ${x} ${y})` : undefined

  let d = ''
  const startX = x - half
  for (let i = 0; i < turns; i++) {
    const sx = startX + i * turnW
    d += `M ${sx} ${y} q ${turnW / 2} ${-amp} ${turnW} 0 `
  }

  return (
    <g>
      <g transform={transform}>
        <line x1={x - half - 8} y1={y} x2={x - half} y2={y} stroke={color} strokeWidth={strokeWidth} />
        <path d={d} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
        <line x1={x + half} y1={y} x2={x + half + 8} y2={y} stroke={color} strokeWidth={strokeWidth} />
      </g>
      {label && (
        <text
          x={isHoriz ? x : x - 16}
          y={isHoriz ? y - 16 : y}
          fill={labelColor}
          fontSize={labelSize}
          fontFamily="JetBrains Mono, monospace"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {label}
        </text>
      )}
    </g>
  )
}

/* ─── 电容 ───
 * direction: right/left 水平, up/down 垂直
 */

export function Capacitor({
  x,
  y,
  direction = 'right',
  size = 30,
  color = C.capacitor,
  strokeWidth = 2,
  label,
  labelColor = C.text,
  labelSize = 12,
}: OrientedSymbolProps) {
  const half = size / 2
  const deg: Record<typeof direction, number> = {
    right: 0,
    left: 0,
    up: -90,
    down: 90,
  }
  const isHoriz = direction === 'right' || direction === 'left'
  const transform = deg[direction] ? `rotate(${deg[direction]} ${x} ${y})` : undefined

  return (
    <g>
      <g transform={transform}>
        <line x1={x - half - 8} y1={y} x2={x - 3} y2={y} stroke={color} strokeWidth={strokeWidth} />
        <line x1={x + 3} y1={y} x2={x + half + 8} y2={y} stroke={color} strokeWidth={strokeWidth} />
        <line x1={x - 3} y1={y - 12} x2={x - 3} y2={y + 12} stroke={color} strokeWidth={strokeWidth} />
        <line x1={x + 3} y1={y - 12} x2={x + 3} y2={y + 12} stroke={color} strokeWidth={strokeWidth} />
      </g>
      {label && (
        <text
          x={isHoriz ? x : x - 16}
          y={isHoriz ? y - 18 : y}
          fill={labelColor}
          fontSize={labelSize}
          fontFamily="JetBrains Mono, monospace"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {label}
        </text>
      )}
    </g>
  )
}

/* ─── 电阻 ───
 * direction: right/left 水平, up/down 垂直
 */

export function Resistor({
  x,
  y,
  direction = 'right',
  length = 50,
  color = C.resistor,
  strokeWidth = 2,
  label,
  labelColor = C.text,
  labelSize = 12,
}: OrientedSymbolProps & { length?: number }) {
  const half = length / 2
  const deg: Record<typeof direction, number> = {
    right: 0,
    left: 0,
    up: -90,
    down: 90,
  }
  const isHoriz = direction === 'right' || direction === 'left'
  const transform = deg[direction] ? `rotate(${deg[direction]} ${x} ${y})` : undefined

  return (
    <g>
      <g transform={transform}>
        <line x1={x - half - 8} y1={y} x2={x - half} y2={y} stroke={color} strokeWidth={strokeWidth} />
        <path
          d={`M ${x - half} ${y} l 5 0 l 4 -10 l 8 20 l 8 -20 l 8 20 l 8 -20 l 8 20 l 4 -10 l 5 0`}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
        <line x1={x + half} y1={y} x2={x + half + 8} y2={y} stroke={color} strokeWidth={strokeWidth} />
      </g>
      {label && (
        <text
          x={isHoriz ? x : x - 16}
          y={isHoriz ? y - 16 : y}
          fill={labelColor}
          fontSize={labelSize}
          fontFamily="JetBrains Mono, monospace"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {label}
        </text>
      )}
    </g>
  )
}

/* ─── 变压器（垂直方向，原边在左，副边在右） ─── */

export interface TransformerProps extends SymbolProps {
  height?: number
  turns?: number
  showDots?: boolean
  dotSide?: 'both' | 'primary' | 'secondary' | 'none'
  ratioLabel?: string
}

export function Transformer({
  x,
  y,
  height = 80,
  turns = 4,
  color = C.wire,
  strokeWidth = 2,
  showDots = true,
  dotSide = 'both',
  ratioLabel,
  labelColor = C.text,
  labelSize = 12,
}: TransformerProps) {
  const halfH = height / 2
  const coilW = 16
  const turnH = height / turns
  const gap = 6
  const leftCX = x - gap / 2 - coilW / 2
  const rightCX = x + gap / 2 + coilW / 2

  const makeCoil = (cx: number) => {
    let d = ''
    for (let i = 0; i < turns; i++) {
      const sy = y - halfH + i * turnH
      d += `M ${cx} ${sy} q ${coilW / 2} ${turnH / 2} 0 ${turnH} `
    }
    return d
  }

  return (
    <g>
      <path d={makeCoil(leftCX)} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <path d={makeCoil(rightCX)} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <line x1={x - 1} y1={y - halfH + 4} x2={x - 1} y2={y + halfH - 4} stroke={color} strokeWidth={1.5} strokeDasharray="4 3" />
      <line x1={x + 1} y1={y - halfH + 4} x2={x + 1} y2={y + halfH - 4} stroke={color} strokeWidth={1.5} strokeDasharray="4 3" />

      {showDots && (dotSide === 'both' || dotSide === 'primary') && (
        <circle cx={leftCX - coilW / 2 + 4} cy={y - halfH + turnH / 2} r={2.5} fill={color} />
      )}
      {showDots && (dotSide === 'both' || dotSide === 'secondary') && (
        <circle cx={rightCX - coilW / 2 + 4} cy={y - halfH + turnH / 2} r={2.5} fill={color} />
      )}

      {ratioLabel && (
        <text
          x={x + 32}
          y={y}
          fill={labelColor}
          fontSize={labelSize}
          fontFamily="JetBrains Mono, monospace"
          textAnchor="start"
          dominantBaseline="middle"
        >
          {ratioLabel}
        </text>
      )}
    </g>
  )
}

/* ─── 交流电压源 ─── */

export function ACSource({
  x,
  y,
  radius = 18,
  color = C.wire,
  strokeWidth = 2,
  label,
  labelColor = C.text,
  labelSize = 13,
}: SymbolProps & { radius?: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={radius} stroke={color} strokeWidth={strokeWidth} fill="none" />
      <path
        d={`M ${x - 10} ${y} Q ${x - 6} ${y - 8} ${x - 2} ${y} Q ${x + 2} ${y + 8} ${x + 6} ${y} Q ${x + 10} ${y - 8} ${x + 14} ${y}`}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
      />
      {label && (
        <text
          x={x - radius - 10}
          y={y + 4}
          fill={labelColor}
          fontSize={labelSize}
          fontFamily="JetBrains Mono, monospace"
          textAnchor="end"
          dominantBaseline="middle"
        >
          {label}
        </text>
      )}
    </g>
  )
}

/* ─── 接地符号 ─── */

export function Ground({
  x,
  y,
  color = C.wire,
  strokeWidth = 2,
}: Omit<SymbolProps, 'label'>) {
  return (
    <g>
      <line x1={x} y1={y - 10} x2={x} y2={y} stroke={color} strokeWidth={strokeWidth} />
      <line x1={x - 12} y1={y} x2={x + 12} y2={y} stroke={color} strokeWidth={strokeWidth} />
      <line x1={x - 8} y1={y + 5} x2={x + 8} y2={y + 5} stroke={color} strokeWidth={strokeWidth} />
      <line x1={x - 4} y1={y + 10} x2={x + 4} y2={y + 10} stroke={color} strokeWidth={strokeWidth} />
    </g>
  )
}

/* ─── 节点小圆点 ─── */

export function Node({ x, y, color = C.wire, r = 3 }: { x: number; y: number; color?: string; r?: number }) {
  return <circle cx={x} cy={y} r={r} fill={color} />
}

/* ─── 带标签的节点 ─── */

export function LabeledNode({
  x,
  y,
  label,
  color = C.wire,
  labelColor = C.text,
  labelSize = 11,
}: SymbolProps) {
  return (
    <g>
      <circle cx={x} cy={y} r={3} fill={color} />
      <text
        x={x}
        y={y - 8}
        fill={labelColor}
        fontSize={labelSize}
        fontFamily="JetBrains Mono, monospace"
        textAnchor="middle"
        dominantBaseline="auto"
      >
        {label}
      </text>
    </g>
  )
}

/* ─── 电流路径（CSS dash-flow） ─── */

export interface CurrentPathProps {
  d: string
  color?: string
  width?: number
  dashArray?: string
  className?: string
  markerEnd?: string
  opacity?: number
  animate?: boolean
}

export function CurrentPath({
  d,
  color = '#14b8a6',
  width = 3,
  dashArray = '8 6',
  className = '',
  markerEnd,
  opacity = 0.8,
  animate = true,
}: CurrentPathProps) {
  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeDasharray={dashArray}
      strokeLinecap="round"
      markerEnd={markerEnd}
      opacity={opacity}
      className={`${animate ? 'dash-flow' : ''} ${className}`}
    />
  )
}
