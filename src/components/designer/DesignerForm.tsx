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
              <span className="text-xs text-text-muted mt-1 block">Vinmin</span>
            </div>
            <div>
              <input
                type="number"
                className={inputClass}
                value={form.vinNom}
                onChange={(e) => update('vinNom', Number(e.target.value))}
                placeholder="Nom"
              />
              <span className="text-xs text-text-muted mt-1 block">Vinnom</span>
            </div>
            <div>
              <input
                type="number"
                className={inputClass}
                value={form.vinMax}
                onChange={(e) => update('vinMax', Number(e.target.value))}
                placeholder="Max"
              />
              <span className="text-xs text-text-muted mt-1 block">Vinmax</span>
            </div>
          </div>
        </div>

        <div>
          <label className={labelClass}>输出电压 Vo (V)</label>
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
            onChange={(e) => {
              // 与「输出整流压降 Vf」联动：整流损耗直接用这个 Vf（单一来源；内部字段名 vd），
              // 所以换整流方式时给出与类型匹配的默认压降，避免"选了二极管却按 0 V 算成无损耗"。
              const next = e.target.value as DesignParameters['rectifier']
              const sync = next === 'synchronous' || next === 'sync-center-tapped'
              update('rectifier', next)
              if (!sync && form.vd < 0.2) update('vd', 0.6)
              else if (sync && Math.abs(form.vd - 0.6) < 1e-9) update('vd', 0)
            }}
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
        <div>
          <label className={labelClass}>Q 裕量系数 m</label>
          <input
            type="number"
            className={inputClass}
            value={form.qMargin}
            onChange={(e) => update('qMargin', Number(e.target.value))}
            step="0.05"
            min="0.3"
            max="1"
          />
          <span className="text-xs text-text-muted mt-1 block">Q = m · Qmax，默认 0.857（= 计算书算例的降额系数 α）</span>
          <span className="text-xs text-text-muted mt-1 block">
            调小 m（如 0.85）→ Q 更小 → ZVS 能量与时间裕量更大，但 Lr 更小 / Cr 更大、环流损耗上升
          </span>
        </div>
        <div>
          <label className={labelClass}>Qmax1 判据</label>
          <select
            className={inputClass}
            value={form.qmax1Criterion === 'peak' ? 'peak' : 'boundary'}
            onChange={(e) => update('qmax1Criterion', e.target.value as DesignParameters['qmax1Criterion'])}
          >
            <option value="boundary">感容分界判据（推荐／默认）</option>
            <option value="peak">峰值增益判据（备选，仅供对照）</option>
          </select>
          <span className="text-xs text-text-muted mt-1 block">
            感容分界点在峰值点<b className="text-text-secondary">右侧</b>；峰值点位于容性区，
            只保证增益数值达标、不能保证工作在感性区，故限制条件应取「分界点增益 ∩ Gmax」
          </span>
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
            <label className={labelClass}>MOSFET Coss,eq (pF)</label>
            <input
              type="number"
              className={inputClass}
              value={form.cossEq}
              onChange={(e) => update('cossEq', Number(e.target.value))}
              placeholder="等效输出电容"
            />
            <span className="text-xs text-text-muted mt-1 block">时间相关等效（≡ 规格书 Co(tr)）：恒流充到 V<sub>DS</sub> 的<b>电荷/时间</b>与真实 Coss 相同。填<b>单管值</b> —— 死区用总电容按 <b>C总 = 2·Coss,eq + Cj</b> 计入两只管</span>
          </div>
          <div>
            <label className={labelClass}>MOSFET Coss,er (pF)</label>
            <input
              type="number"
              className={inputClass}
              value={form.cossEr}
              onChange={(e) => update('cossEr', Number(e.target.value))}
              placeholder="能量相关Coss"
            />
            <span className="text-xs text-text-muted mt-1 block">能量相关等效（≡ 规格书 Co(er)）：充到 V<sub>DS</sub> 的<b>储能</b>与真实 Coss 相同。填<b>单管值</b> —— ZVS 能量判据与 Coss 损耗按 <b>2·Coss,er + Cj</b>（两只管之和 + 寄生）计入</span>
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
            <label className={labelClass}>输出整流压降 Vf (V)</label>
            <input
              type="number"
              className={inputClass}
              value={form.vd}
              onChange={(e) => update('vd', Number(e.target.value))}
              step="0.1"
              placeholder="整流二极管"
            />
            <span className="text-xs text-text-muted mt-1 block">输出整流压降 V<sub>f</sub>：<b>同时用于</b>匝比 n 与整流损耗（二极管 0.6~1.2 V；同步整流填 0）</span>
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
