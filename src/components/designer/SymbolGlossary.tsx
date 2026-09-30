// 符号与物理概念释义卡片 —— 挂在「设计工具」页结果列底部。
// 数据来自 symbolGlossary.ts（由「公式推导」页的 ParamRow 生成，两处同源）。
import { useState } from 'react'
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react'
import { SYMBOL_GROUPS, SYMBOL_TOTAL } from '../../lib/designer/symbolGlossary'

export default function SymbolGlossary() {
  // 默认折叠：释义有 60+ 条，展开会很长；标题写清"全部符号"并给出条数，需要时一键展开。
  const [open, setOpen] = useState(false)

  return (
    <div className="card-surface p-5">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary-light" />
          <h2 className="text-lg font-semibold text-text-primary">
            符号与物理概念释义（全部 {SYMBOL_TOTAL} 个）
          </h2>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
      </button>

      {!open && (
        <p className="text-sm text-text-secondary">
          结果卡里出现的每个符号（如 <span className="font-mono">Er</span>、
          <span className="font-mono">Ec</span>、<span className="font-mono">Mbnd</span>、
          <span className="font-mono">Qmax2</span>…）在这里都有名称、定义式与典型值，与
          「公式推导」页的符号表同一口径。点标题展开。
        </p>
      )}

      {open && (
        <div className="mt-3 space-y-5">
          <div className="rounded-lg border border-border bg-surface-elevated/30 p-4 text-sm text-text-secondary leading-relaxed">
            <b className="text-text-primary">符号体系（为什么增益有 G 和 M 两个字母）：</b>
            <br />
            · <b>G 系 = 设计需求</b>（"要多少增益"）：<span className="font-mono">Gmax</span>（最低输入所需）、
            <span className="font-mono">Gmin</span>（最高输入所需）、<span className="font-mono">Gempty</span>（空载增益下限）。
            <br />
            · <b>M 系 = 曲线能到多少</b>：<span className="font-mono">M</span> 是增益曲线纵轴、
            <span className="font-mono">Mpeak</span> 是峰顶、<span className="font-mono">Mbnd</span> 是感容分界点处的增益。
            <br />
            · 两者都是电压增益，区别在<b>"要求"与"可实现"</b>；<span className="font-mono">M</span> 沿用 LLC 文献与
            计算书的通用写法（M = 2n·Vo/Vin）。所以感性区增益上限叫 <b>Mbnd 而不是 Gbnd</b> ——
            它是 M 曲线上取的一个点，与纵轴同族；叫 Gbnd 会被误当成与 Gmax/Gmin 同类的需求值。
            <br />
            · 另有 <span className="font-mono">k / Q / fn / fr / Zr / Rac</span> 等谐振腔量，以及
            <span className="font-mono">C总 = 2·Coss,eq + Cj</span>（死区用总电容）等口径说明，见下表。
          </div>

          {SYMBOL_GROUPS.map((g) => (
            <div key={g.group}>
              <h3 className="text-sm font-semibold text-text-primary mb-2">
                {g.group}
                <span className="text-text-muted font-normal ml-2">（{g.rows.length} 项）</span>
              </h3>
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-xs">
                  <thead className="bg-surface-elevated text-text-muted">
                    <tr>
                      <th className="text-left py-2 px-2 font-medium">符号</th>
                      <th className="text-left py-2 px-2 font-medium">名称</th>
                      <th className="text-left py-2 px-2 font-medium">单位</th>
                      <th className="text-left py-2 px-2 font-medium">定义 / 说明</th>
                      <th className="text-left py-2 px-2 font-medium whitespace-nowrap">典型值</th>
                    </tr>
                  </thead>
                  <tbody className="text-text-secondary">
                    {g.rows.map((r) => (
                      <tr key={g.group + r.symbol} className="border-t border-border/50 align-top">
                        <td className="py-1.5 px-2 font-mono text-text-primary whitespace-nowrap">{r.symbol}</td>
                        <td className="py-1.5 px-2 text-text-primary">{r.name}</td>
                        <td className="py-1.5 px-2 font-mono">{r.unit}</td>
                        <td className="py-1.5 px-2 leading-relaxed">{r.desc}</td>
                        <td className="py-1.5 px-2">{r.typical}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
