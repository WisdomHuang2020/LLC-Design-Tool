import { motion } from 'framer-motion'
import { Activity, ChevronDown } from 'lucide-react'
import CircuitCanvas from '../components/circuit-editor/CircuitCanvas'
import Toolbar from '../components/circuit-editor/Toolbar'
import { useCircuitState } from '../components/circuit-editor/hooks/useCircuitState'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' as const },
  }),
}

export default function CircuitEditor() {
  const { state, setPhase, moveNode, getActivePhase, getElementProps } = useCircuitState()

  const activePhase = getActivePhase()

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
      {/* Header */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        custom={0}
        className="mb-12 md:mb-16"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary-dark/40 flex items-center justify-center">
            <Activity className="w-6 h-6 text-primary-light" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gradient tracking-tight">
            电路图编辑器
          </h1>
        </div>
        <p className="text-text-secondary max-w-2xl text-lg leading-relaxed">
          可交互的 LLC 谐振变换器电路原理图。拖拽节点调整布局，切换阶段查看电流路径。
          青色 = 能量传输，琥珀 = 死区，绿色 = 体二极管导通（ZVS准备）。
        </p>
      </motion.div>

      {/* 工具栏 */}
      <motion.div variants={fadeUp} custom={1} initial="hidden" animate="visible">
        <Toolbar
          activePhase={activePhase}
          onPhaseChange={setPhase}
          onExport={() => {
            import('../components/circuit-editor/utils/export').then(({ exportSVG, downloadSVG }) => {
              const svg = exportSVG(state)
              downloadSVG(svg, 'llc-circuit.svg')
            })
          }}
          onExportCopy={() => {
            import('../components/circuit-editor/utils/export').then(({ exportSVG, copySVG }) => {
              const svg = exportSVG(state)
              copySVG(svg).then((ok) => {
                if (ok) alert('SVG 代码已复制到剪贴板')
                else alert('复制失败')
              })
            })
          }}
        />
      </motion.div>

      {/* 画布 */}
      <motion.div variants={fadeUp} custom={2} initial="hidden" animate="visible" className="mt-4">
        <CircuitCanvas
          state={state}
          onMoveNode={moveNode}
          onPhaseChange={setPhase}
          getElementProps={getElementProps}
        />
      </motion.div>

      {/* 说明 */}
      <motion.div variants={fadeUp} custom={3} initial="hidden" animate="visible" className="mt-6 p-4 bg-primary-dark/20 rounded-lg border border-primary/20">
        <h4 className="text-sm font-semibold text-primary-light mb-2">使用说明</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-text-secondary">
          <div>
            <p className="mb-1"><strong className="text-text-primary">拖拽节点：</strong>点击并拖动电路节点可调整元件位置，相连路径自动跟随。</p>
            <p className="mb-1"><strong className="text-text-primary">切换阶段：</strong>点击上方 6 个阶段按钮，查看不同开关状态下的电流路径。</p>
          </div>
          <div>
            <p className="mb-1"><strong className="text-text-primary">导出 SVG：</strong>点击"下载 SVG"保存文件，或"复制 SVG"获取代码。</p>
            <p className="mb-1"><strong className="text-text-primary">颜色含义：</strong>青色=能量传输，琥珀=死区时间，绿色=体二极管导通。</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
