// 设计输入表单：电源规格、拓扑/整流方式、电感比、负载范围、MOSFET 与寄生参数。
import { Zap, Layers, RotateCcw, Calculator } from 'lucide-react'
import type { DesignParameters } from '../../lib/DesignContext'

interface DesignerFormProps {
  form: DesignParameters
  update: <K extends keyof DesignParameters>(key: K, value: DesignParameters[K]) => void
  onCalculate: () => void
  onReset: () => void
  needsRecalculation: boolean
}

const inputClass = 'input-field w-full'
const labelClass = 'block text-sm font-medium text-text-secondary mb-1'

export default function DesignerForm({ form, update, onCalculate, onReset, needsRecalculation }: DesignerFormProps) {
  return (
    <div className="card-surface p-5">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-primary-light" />
        <h2 className="text-lg font-semibold text-text-primary">输入规格</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className={labelClass}>输入电压范围 (V)</label>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <input
                type="number"
                className={inputClass}
                value={form.vinMin}
                onChange={(e) => update('vinMin', Number(e.target.value))}
                placeholder="Min"
              />
              <span className="text-xs text-text-muted mt-1 block">Vin_min</span>
            </div>
            <div>
              <input
                type="number"
                className={inputClass}
                value={form.vinNom}
                onChange={(e) => update('vinNom', Number(e.target.value))}
                placeholder="Nom"
              />
              <span className="text-xs text-text-muted mt-1 block">Vin_nom</span>
            </div>
            <div>
              <input
                type="number"
                className={inputClass}
                value={form.vinMax}
                onChange={(e) => update('vinMax', Number(e.target.value))}
                placeholder="Max"
              />
              <span className="text-xs text-text-muted mt-1 block">Vin_max</span>
            </div>
          </div>
        </div>

        <div>
          <label className={labelClass}>输出电压 Vout (V)</label>
          <input
            type="number"
            className={inputClass}
            value={form.vout}
            onChange={(e) => update('vout', Number(e.target.value))}
          />
        </div>
        <div>
          <label className={labelClass}>输出功率 Pout (W)</label>
          <input
            type="number"
            className={inputClass}
            value={form.pout}
            onChange={(e) => update('pout', Number(e.target.value))}
          />
        </div>
        <div>
          <label className={labelClass}>目标效率 η (%)</label>
          <input
            type="number"
            className={inputClass}
            value={form.efficiency}
            onChange={(e) => update('efficiency', Number(e.target.value))}
          />
        </div>
        <div>
          <label className={labelClass}>开关频率 fsw (kHz)</label>
          <input
            type="number"
            className={inputClass}
            value={form.fsw}
            onChange={(e) => update('fsw', Number(e.target.value))}
          />
        </div>
        <div>
          <label className={labelClass}>拓扑</label>
          <select
            className={inputClass}
            value={form.topology}
            onChange={(e) => update('topology', e.target.value as DesignParameters['topology'])}
          >
            <option value="half-bridge">半桥 (Half-bridge)</option>
            <option value="full-bridge">全桥 (Full-bridge)</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>整流方式</label>
          <select
            className={inputClass}
            value={form.rectifier}
            onChange={(e) => update('rectifier', e.target.value as DesignParameters['rectifier'])}
          >
            <option value="full-wave">全波整流</option>
            <option value="center-tapped">中心抽头</option>
            <option value="synchronous">同步整流（全桥）</option>
            <option value="sync-center-tapped">同步整流（中心抽头）</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>电感比 k (Lm/Lr)</label>
          <input
            type="number"
            className={inputClass}
            value={form.k}
            onChange={(e) => update('k', Number(e.target.value))}
            step="0.5"
            min="2"
            max="20"
          />
          <span className="text-xs text-text-muted mt-1 block">建议 3~10</span>
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>负载范围 (%)</label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <input
                type="number"
                className={inputClass}
                value={form.loadMin}
                onChange={(e) => update('loadMin', Number(e.target.value))}
              />
              <span className="text-xs text-text-muted mt-1 block">最小负载</span>
            </div>
            <div>
              <input
                type="number"
                className={inputClass}
                value={form.loadMax}
                onChange={(e) => update('loadMax', Number(e.target.value))}
              />
              <span className="text-xs text-text-muted mt-1 block">最大负载</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── MOSFET / 寄生参数 ─── */}
      <div className="mt-5 pt-4 border-t border-border">
        <h3 className="text-sm font-semibold text-text-secondary mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4 text-primary-light" />
          MOSFET 与寄生参数
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>MOSFET Coss_eq (pF)</label>
            <input
              type="number"
              className={inputClass}
              value={form.cossEq}
              onChange={(e) => update('cossEq', Number(e.target.value))}
              placeholder="等效输出电容"
            />
            <span className="text-xs text-text-muted mt-1 block">等效Coss（谐振腔）</span>
          </div>
          <div>
            <label className={labelClass}>MOSFET Coss_er (pF)</label>
            <input
              type="number"
              className={inputClass}
              value={form.cossEr}
              onChange={(e) => update('cossEr', Number(e.target.value))}
              placeholder="能量相关Coss"
            />
            <span className="text-xs text-text-muted mt-1 block">能量相关Coss（ZVS）</span>
          </div>
          <div>
            <label className={labelClass}>PCB 寄生电容 Cj (pF)</label>
            <input
              type="number"
              className={inputClass}
              value={form.cj}
              onChange={(e) => update('cj', Number(e.target.value))}
              placeholder="PCB寄生"
            />
            <span className="text-xs text-text-muted mt-1 block">PCB走线/变压器寄生</span>
          </div>
          <div>
            <label className={labelClass}>死区时间 Td (ns)</label>
            <input
              type="number"
              className={inputClass}
              value={form.td}
              onChange={(e) => update('td', Number(e.target.value))}
              placeholder="死区时间"
            />
            <span className="text-xs text-text-muted mt-1 block">驱动死区</span>
          </div>
          <div>
            <label className={labelClass}>二极管压降 Vd (V)</label>
            <input
              type="number"
              className={inputClass}
              value={form.vd}
              onChange={(e) => update('vd', Number(e.target.value))}
              step="0.1"
              placeholder="整流二极管"
            />
            <span className="text-xs text-text-muted mt-1 block">输出整流压降</span>
          </div>
          <div>
            <label className={labelClass}>最大输出电流 Iomax (A)</label>
            <input
              type="number"
              className={inputClass}
              value={form.ioMax}
              onChange={(e) => update('ioMax', Number(e.target.value))}
              placeholder="最大电流"
            />
            <span className="text-xs text-text-muted mt-1 block">过载/满载电流</span>
          </div>
        </div>
      </div>

      {needsRecalculation && (
        <div className="mt-4 p-3 bg-accent/10 border border-accent/30 rounded-lg flex items-start gap-2">
          <RotateCcw className="w-4 h-4 text-accent shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-accent font-medium">参数已变更</p>
            <p className="text-xs text-text-secondary">输入参数已修改，请重新计算以获取最新结果。</p>
          </div>
        </div>
      )}

      <button
        onClick={onCalculate}
        className="mt-5 w-full bg-primary hover:bg-primary-light text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <Calculator className="w-4 h-4" />
        {needsRecalculation ? '重新计算' : '计算'}
      </button>
      <button
        onClick={onReset}
        className="mt-2 w-full border border-border hover:bg-surface-elevated text-text-secondary font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <RotateCcw className="w-4 h-4" />
        复位
      </button>
    </div>
  )
}
