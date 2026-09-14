// 设计快照卡片：命名保存当前设计 + 实时快照列表（可单条删除）。
import { GitCompare, Save, Trash2 } from 'lucide-react'
import { MAX_SNAPSHOTS, type DesignSnapshot } from '../../lib/designSnapshots'

interface SnapshotCardProps {
  snapshots: DesignSnapshot[]
  name: string
  onNameChange: (value: string) => void
  onSave: () => void
  onRemove: (id: string) => void
  status: { text: string; error: boolean } | null
}

export default function SnapshotCard({ snapshots, name, onNameChange, onSave, onRemove, status }: SnapshotCardProps) {
  return (
    <div className="card-surface p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <GitCompare className="w-5 h-5 text-primary-light" />
          <h2 className="text-lg font-semibold text-text-primary">设计快照</h2>
        </div>
        <span className="text-xs font-mono text-text-muted">
          已保存 {snapshots.length} / {MAX_SNAPSHOTS}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSave()
          }}
          placeholder="快照名称（留空则自动命名）"
          className="flex-1 px-3 py-1.5 text-sm rounded-lg bg-surface-elevated border border-border text-text-primary placeholder:text-text-muted focus:border-primary-light focus:outline-none"
        />
        <button
          onClick={onSave}
          className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary-light text-white text-sm rounded-lg transition-colors"
        >
          <Save className="w-3.5 h-3.5" />
          保存到本地
        </button>
      </div>

      {status && (
        <p className={`mt-2 text-xs ${status.error ? 'text-red-400' : 'text-primary-light'}`}>
          {status.text}
        </p>
      )}

      {snapshots.length > 0 ? (
        <ul className="mt-3 space-y-1.5">
          {snapshots.map((s) => (
            <li
              key={s.id}
              className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-surface-elevated border border-border"
            >
              <div className="min-w-0">
                <p className="text-sm text-text-primary truncate">{s.name}</p>
                <p className="text-xs font-mono text-text-muted truncate">
                  {s.params.vinNom}V→{s.params.vout}V · {s.params.pout}W · fr {(s.results.fr / 1000).toFixed(1)}kHz · Q {s.results.q.toFixed(2)} · k {s.results.k.toFixed(2)}
                </p>
              </div>
              <button
                onClick={() => onRemove(s.id)}
                title="删除该快照"
                className="shrink-0 p-1 text-text-muted hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-xs text-text-muted">
          还没有快照。点击「保存到本地」把当前计算结果存下来，之后可在下方「A/B 设计对比」中勾选对比。
        </p>
      )}

      <p className="mt-3 text-xs text-text-muted">
        快照保存在浏览器本地存储，仅当前设备与浏览器可见；换设备或清理浏览器数据会丢失。需要留档请用「A/B 设计对比」中的「导出 JSON」。
      </p>
    </div>
  )
}
