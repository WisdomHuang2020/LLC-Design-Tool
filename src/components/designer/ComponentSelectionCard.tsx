// 元件选型卡片：谐振元件 E12/E24 吸附建议 + MOSFET / 整流器件选型建议。
import { Package, Layers, ArrowRight } from 'lucide-react'
import CollapsibleCard from './CollapsibleCard'
import { E12, E24, nearestE } from '../../lib/designer/llcMath'
import type { CalculatedData } from '../../lib/designer/types'

interface ComponentSelectionCardProps {
  calculated: CalculatedData
  collapsed: boolean
  onToggle: () => void
}

export default function ComponentSelectionCard({ calculated, collapsed, onToggle }: ComponentSelectionCardProps) {
  return (
    <CollapsibleCard
      icon={<Package className="w-5 h-5 text-primary-light" />}
      title="元件选型"
      collapsed={collapsed}
      onToggle={onToggle}
    >
      <div className="mt-3 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-border text-text-secondary">
                <th className="py-2 pr-4">元件</th>
                <th className="py-2 pr-4">计算值</th>
                <th className="py-2 pr-4">E12 推荐</th>
                <th className="py-2 pr-4">E24 推荐</th>
                <th className="py-2">备注</th>
              </tr>
            </thead>
            <tbody className="text-text-primary">
              <tr className="border-b border-border/50">
                <td className="py-2 pr-4 font-medium">Lr</td>
                <td className="py-2 pr-4">{(calculated.lr * 1e6).toFixed(2)} μH</td>
                <td className="py-2 pr-4">{(nearestE(calculated.lr * 1e6, E12)).toFixed(1)} μH</td>
                <td className="py-2 pr-4">{(nearestE(calculated.lr * 1e6, E24)).toFixed(1)} μH</td>
                <td className="py-2 text-text-secondary">谐振电感，需承受Ip_rms</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2 pr-4 font-medium">Cr</td>
                <td className="py-2 pr-4">{(calculated.cr * 1e9).toFixed(2)} nF</td>
                <td className="py-2 pr-4">{(nearestE(calculated.cr * 1e9, E12)).toFixed(1)} nF</td>
                <td className="py-2 pr-4">{(nearestE(calculated.cr * 1e9, E24)).toFixed(1)} nF</td>
                <td className="py-2 text-text-secondary">薄膜电容，低损耗</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2 pr-4 font-medium">Lm</td>
                <td className="py-2 pr-4">{(calculated.lm * 1e6).toFixed(2)} μH</td>
                <td className="py-2 pr-4">—</td>
                <td className="py-2 pr-4">—</td>
                <td className="py-2 text-text-secondary">变压器集成，通过气隙调节</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-surface-elevated rounded-lg p-3 border border-border">
            <h4 className="text-sm font-semibold text-text-primary mb-2 flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary-light" />
              MOSFET 建议
            </h4>
            <ul className="text-sm text-text-secondary space-y-1">
              <li>
                耐压: ≥{' '}
                <span className="text-text-primary font-mono">
                  {Math.ceil(calculated.topology === 'half-bridge' ? calculated.vinMax : calculated.vinMax * 1.2)}
                </span>{' '}
                V
              </li>
              <li>
                电流: ≥{' '}
                <span className="text-text-primary font-mono">
                  {(calculated.ipRms * 2.5).toFixed(1)}
                </span>{' '}
                A (RMS × 2.5 裕量)
              </li>
              <li>
                推荐: 低Rds(on) SJ-MOS / GaN (fsw {'>'} 300kHz)
              </li>
            </ul>
          </div>
          <div className="bg-surface-elevated rounded-lg p-3 border border-border">
            <h4 className="text-sm font-semibold text-text-primary mb-2 flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-primary-light" />
              整流器件建议
            </h4>
            <ul className="text-sm text-text-secondary space-y-1">
              <li>
                类型:{' '}
                {calculated.rectifier === 'synchronous' || calculated.rectifier === 'sync-center-tapped'
                  ? '同步整流 MOSFET'
                  : calculated.rectifier === 'center-tapped'
                  ? '肖特基二极管（中心抽头）'
                  : '肖特基二极管（全桥）'}
              </li>
              <li>
                耐压: ≥{' '}
                <span className="text-text-primary font-mono">
                  {Math.ceil(calculated.vout * (calculated.rectifier === 'center-tapped' || calculated.rectifier === 'sync-center-tapped' ? 2.5 : 2))}
                </span>{' '}
                V
              </li>
              <li>
                电流: ≥{' '}
                <span className="text-text-primary font-mono">
                  {(calculated.isRms * 1.5).toFixed(1)}
                </span>{' '}
                A
              </li>
            </ul>
          </div>
        </div>
      </div>
    </CollapsibleCard>
  )
}
