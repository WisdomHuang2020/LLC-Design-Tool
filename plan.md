# 电路编辑器重构计划

## 目标
将 LLC 电路原理图的硬编码 SVG 重构为：
- 组件化的 React 结构
- 可拖拽的电路编辑界面
- 自动连线系统
- 状态驱动的电流动画
- 输出 SVG 代码

## 文件结构

```
src/components/circuit-editor/
  types.ts                    # 核心类型定义
  constants.ts                # 默认布局、颜色常量
  utils/
    layout.ts                 # 布局计算、自动连线
    export.ts                 # SVG 导出
    path.ts                   # 路径计算（L-shape, S-shape）
  hooks/
    useDrag.ts                # 拖拽逻辑
    useCircuitState.ts        # 电路状态管理
  elements/
    BaseElement.tsx           # 基础元件包装
    Node.tsx                  # 连接节点（拖拽点）
    MOSFET.tsx                # NMOS 符号
    Capacitor.tsx             # 电容符号
    Inductor.tsx              # 电感符号
    Transformer.tsx           # 变压器符号
    Diode.tsx                 # 二极管符号
    Source.tsx                # 电源符号
    Ground.tsx                # 地符号
    CurrentPath.tsx           # 动态电流路径
  CircuitCanvas.tsx           # 主画布（SVG + 交互层）
  Toolbar.tsx                 # 工具栏（阶段选择、导出）

src/pages/
  CircuitEditor.tsx           # 新页面入口
```

## 架构设计

### 坐标系统
- 以 "节点 (Node)" 为原子单位，每个元件有输入/输出节点
- 连线基于节点坐标自动计算 L-shape 或 S-shape 路径
- 拖拽节点时，相连的元件和连线自动跟随

### 状态设计
```typescript
interface CircuitNode {
  id: string
  x: number
  y: number
  type: 'anchor' | 'junction' | 'terminal'
}

interface CircuitElement {
  id: string
  type: 'mosfet' | 'capacitor' | 'inductor' | 'transformer' | 'diode' | 'source' | 'ground'
  nodes: Record<string, string>  // 端口名 -> 节点ID
  rotation: 0 | 90 | 180 | 270
  props: Record<string, any>
}

interface Wire {
  id: string
  fromNode: string
  toNode: string
  path?: string
  color?: string
  dashed?: boolean
}

interface CircuitState {
  nodes: Record<string, CircuitNode>
  elements: Record<string, CircuitElement>
  wires: Wire[]
  currentPhase: number
}
```

### 自动连线策略
- 水平优先：先水平移动再垂直
- 避让：检测与已有元件的碰撞，自动绕行
- 路径类型：L-shape（直角）、S-shape（阶梯）、直线

### 电流动画
- 电流路径根据 `phase` 状态动态计算
- 路径上的节点序列驱动虚线动画方向
- 颜色根据阶段类型变化（能量传输=青色，死区=琥珀，体二极管=绿色）

## 实现顺序

1. **类型定义** (`types.ts`, `constants.ts`)
2. **基础元件** (`BaseElement`, `Node`, `MOSFET`, `Capacitor`, `Inductor`, `Transformer`, `Diode`, `Source`, `Ground`)
3. **路径工具** (`utils/path.ts`) — L-shape, S-shape, 碰撞避让
4. **拖拽 Hook** (`hooks/useDrag.ts`) — 节点级拖拽，拖拽时更新所有连接
5. **电路状态 Hook** (`hooks/useCircuitState.ts`) — 包含 LLC 默认布局
6. **电流路径** (`elements/CurrentPath.tsx`) — 根据阶段和节点坐标动态生成
7. **画布** (`CircuitCanvas.tsx`) — 整合所有元素、连线、拖拽
8. **工具栏** (`Toolbar.tsx`) — 阶段切换、导出按钮
9. **页面** (`CircuitEditor.tsx`) — 入口
10. **路由** — 添加到 App.tsx
