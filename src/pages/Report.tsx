import { useState, useRef } from 'react'
import { useDesign } from '../lib/DesignContext'
import {
  FileText,
  Download,
  Copy,
  Check,
  Printer,
  ArrowLeft,
  Calendar,
  Hash,
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Waves,
  Info,
} from 'lucide-react'
// @ts-ignore
import html2pdf from 'html2pdf.js'

export default function Report() {
  const { params, results, suggestions } = useDesign()
  const [notes, setNotes] = useState('')
  const [copied, setCopied] = useState(false)
  const reportRef = useRef<HTMLDivElement>(null)

  const dateStr = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const generateMarkdown = (): string => {
    const r = results
    const p = params
    if (!r) return '# LLC谐振变换器设计报告\n\n> 尚未完成设计计算。请先在 Designer 页面执行计算。\n'

    return `# LLC谐振变换器设计报告

**生成日期**: ${dateStr}  
**设计工具**: LLC Design Tool v2.2（专业修正版）

---

## 1. 输入规格

| 参数 | 数值 | 单位 |
|------|------|------|
| 输入电压范围 | ${p.vinMin} ~ ${p.vinMax} | V |
| 额定输入电压 | ${p.vinNom} | V |
| 输出电压 | ${p.vout} | V |
| 输出功率 | ${p.pout} | W |
| 目标效率 | ${p.efficiency} | % |
| 开关频率 | ${p.fsw} | kHz |
| 拓扑 | ${p.topology === 'half-bridge' ? '半桥' : '全桥'} | — |
| 整流方式 | ${p.rectifier === 'full-wave' ? '全波' : p.rectifier === 'center-tapped' ? '中心抽头' : p.rectifier === 'synchronous' ? '同步整流（全桥）' : '同步整流（中心抽头）'} | — |
| 负载范围 | ${p.loadMin}% ~ ${p.loadMax}% | — |

## 2. 推导参数

| 参数 | 公式 | 数值 |
|------|------|------|
| 匝比 n | ${p.topology === 'half-bridge' ? 'Vin_nom / (2·Vout)' : 'Vin_nom / Vout'}（基于额定输入，谐振频率处 M=1） | ${r.n.toFixed(3)} |
| 等效负载 Rac | 8n²Vout² / (π²·Pout) | ${((8 * r.n * r.n * p.vout * p.vout) / (Math.PI * Math.PI * p.pout)).toFixed(2)} Ω |
| 特征阻抗 Zr | Rac / Q | ${((8 * r.n * r.n * p.vout * p.vout) / (Math.PI * Math.PI * p.pout) / r.q).toFixed(2)} Ω |
| 谐振频率 fr | 1 / (2π·√(Lr·Cr)) | ${(r.fr / 1000).toFixed(1)} kHz |

## 3. 元件值

| 元件 | 计算值 | 说明 |
|------|--------|------|
| 谐振电感 Lr | ${(r.lr * 1e6).toFixed(2)} μH | 决定谐振阻抗 |
| 谐振电容 Cr | ${(r.cr * 1e9).toFixed(2)} nF | 决定谐振频率 |
| 励磁电感 Lm | ${(r.lm * 1e6).toFixed(2)} μH | 影响增益范围与ZVS |
| 品质因数 Q | ${r.q.toFixed(3)} | 负载敏感度 |
| 电感比 λ | ${r.lambda.toFixed(3)} | Lm / Lr |

## 4. 增益分析（FHA 方法）

- **所需增益**（Vin_min 时）: ${(p.topology === 'half-bridge' ? (2 * r.n * p.vout) / p.vinMin : (r.n * p.vout) / p.vinMin).toFixed(3)}（谐振频率处 M = 1）
- **所需增益**（Vin_max 时）: ${(p.topology === 'half-bridge' ? (2 * r.n * p.vout) / p.vinMax : (r.n * p.vout) / p.vinMax).toFixed(3)}
- **峰值增益 M_max**: ${r.mMax.toFixed(3)}
- **设计裕量**: ${((r.mMax / ((p.topology === 'half-bridge' ? (2 * r.n * p.vout) / p.vinMin : (r.n * p.vout) / p.vinMin)) - 1) * 100).toFixed(1)}%

${r.mMax >= (p.topology === 'half-bridge' ? (2 * r.n * p.vout) / p.vinMin : (r.n * p.vout) / p.vinMin) ? '✅ 峰值增益充足，设计可行。' : '⚠️ 峰值增益不足，需调整 λ 或 Q。'}

${r.designFeasible === false ? '⚠️ **设计不可行**：高输入电压下所需最小增益低于 Region 1 空载极限 k/(k+1)。请增大电感比 k 或缩窄输入电压上限。' : ''}

## 5. 电流估算（FHA 等效）

| 参数 | 数值 | 说明 |
|------|------|------|
| 初级电流 RMS | ${r.ipRms.toFixed(2)} A | 谐振腔电流，含励磁分量 |
| 次级电流 RMS | ${r.isRms.toFixed(2)} A | ${p.rectifier === 'center-tapped' || p.rectifier === 'sync-center-tapped' ? '中心抽头整流：每个绕组半波导通' : '全波整流：方波等效'} |
| 输出电流 Io | ${(p.pout / p.vout).toFixed(2)} A | 直流输出电流 |

## 6. 工作点与 ZVS 分析

- **ZVS 条件**: ${r.zvsMargin ? '满足' : '不满足'}（感性区运行，Region 1 或 Region 2 均可实现 ZVS）
- **开关频率范围**: ${r.designFeasible === false ? '当前参数不可行，无法给出频率范围' : `fmin=${(r.fmin / 1000).toFixed(1)} kHz ~ fmax=${Number.isFinite(r.fmax) ? (r.fmax / 1000).toFixed(1) : '—'} kHz，感性区运行保证 ZVS`}

## 7. 应力分析

| 器件 | 电压应力 | 电流应力 |
|------|----------|----------|
| 初级 MOSFET | ${Math.ceil(p.topology === 'half-bridge' ? p.vinMax : p.vinMax * 1.2)} V (耐压建议) | ${(r.ipRms * 2.5).toFixed(1)} A (RMS × 2.5) |
| 次级整流 | ${Math.ceil(p.vout * (p.rectifier === 'center-tapped' || p.rectifier === 'sync-center-tapped' ? 2.5 : 2))} V (耐压建议) | ${(r.isRms * 1.5).toFixed(1)} A (RMS × 1.5) |
| 谐振电容 Cr | ${(p.vinMax * (p.topology === 'half-bridge' ? 0.5 : 1)).toFixed(0)} V (峰值，近似值) | ${r.ipRms.toFixed(2)} A (RMS) |
| 谐振电感 Lr | — | ${r.ipRms.toFixed(2)} A (RMS) |

## 8. 优化摘要

${suggestions.map((s) => `- ${s}`).join('\n')}

## 9. 建议与下一步

1. 使用 SPICE/Simulink 进行详细时域仿真，验证软开关与效率。
2. 根据 E12/E24 标准值选择实际 Cr，并微调 Lr 保持 fr 不变。
3. 设计变压器：通过气隙调节 Lm，同时保证漏感满足 Lr 需求。
4. 验证 PCB 布局：最小化谐振回路寄生电感与电容。
5. 制作原型并测试：满载效率、温升、EMI、负载瞬态。

${notes ? `## 备注\n\n${notes}\n` : ''}

---
*本报告由 LLC Design Tool v2.2（专业修正版）自动生成，仅供工程参考。基于 FHA 等效方法，电流与应力值为近似估算。*
`
  }

  const downloadMarkdown = () => {
    const md = generateMarkdown()
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `LLC-Design-Report-${new Date().toISOString().split('T')[0]}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const downloadPDF = () => {
    if (!reportRef.current) return
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `LLC-Design-Report-${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: '#0a0a0a' },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    }
    html2pdf().set(opt).from(reportRef.current).save()
  }

  const printReport = () => {
    window.print()
  }

  const copyToClipboard = async () => {
    const md = generateMarkdown()
    try {
      await navigator.clipboard.writeText(md)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
      const textarea = document.createElement('textarea')
      textarea.value = md
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const r = results
  const p = params
  const hasData = !!r

  // Helper values for report rendering
  const racVal = hasData ? (8 * r.n * r.n * p.vout * p.vout) / (Math.PI * Math.PI * p.pout) : 0
  const mReqMin = hasData
    ? p.topology === 'half-bridge'
      ? (2 * r.n * p.vout) / p.vinMin
      : (r.n * p.vout) / p.vinMin
    : 0
  const mReqMax = hasData
    ? p.topology === 'half-bridge'
      ? (2 * r.n * p.vout) / p.vinMax
      : (r.n * p.vout) / p.vinMax
    : 0
  const gainMargin = hasData ? ((r.mMax / mReqMin - 1) * 100) : 0

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-8 h-8 text-primary-light" />
            <h1 className="text-3xl md:text-4xl font-bold text-gradient tracking-tight">设计报告</h1>
          </div>
          <p className="text-text-secondary">预览、编辑并导出 LLC 谐振变换器设计报告。</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={downloadMarkdown}
            className="inline-flex items-center gap-2 bg-surface hover:bg-surface-elevated text-text-primary border border-border px-4 py-2 rounded-lg transition-colors text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            Markdown
          </button>
          <button
            onClick={downloadPDF}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-light text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
          >
            <Printer className="w-4 h-4" />
            PDF
          </button>
          <button
            onClick={printReport}
            className="inline-flex items-center gap-2 bg-surface hover:bg-surface-elevated text-text-primary border border-border px-4 py-2 rounded-lg transition-colors text-sm font-medium"
          >
            <Printer className="w-4 h-4" />
            打印
          </button>
          <button
            onClick={copyToClipboard}
            className="inline-flex items-center gap-2 bg-surface hover:bg-surface-elevated text-text-primary border border-border px-4 py-2 rounded-lg transition-colors text-sm font-medium"
          >
            {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
            {copied ? '已复制' : '复制'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Custom Notes */}
        <div className="lg:col-span-4 space-y-4 print:hidden">
          <div className="card-surface p-5">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-5 h-5 text-primary-light" />
              <h2 className="text-lg font-semibold text-text-primary">自定义备注</h2>
            </div>
            <textarea
              className="input-field w-full h-40 resize-none"
              placeholder="在此添加项目备注、设计约束或评审意见..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <p className="text-xs text-text-muted mt-2">备注将包含在 Markdown 导出和报告末尾。</p>
          </div>

          <div className="card-surface p-5">
            <div className="flex items-center gap-2 mb-3">
              <ArrowLeft className="w-5 h-5 text-primary-light" />
              <h2 className="text-lg font-semibold text-text-primary">操作提示</h2>
            </div>
            <ul className="text-sm text-text-secondary space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-success shrink-0 mt-0.5" />
                报告数据自动同步自 Designer 页面计算结果。
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-success shrink-0 mt-0.5" />
                PDF 导出使用 html2pdf.js，保留深色主题。
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-success shrink-0 mt-0.5" />
                Markdown 文件可直接导入 Notion / Typora / GitHub。
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-success shrink-0 mt-0.5" />
                打印预览使用浏览器打印，建议启用背景图形。
              </li>
            </ul>
          </div>

          {!hasData && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <p className="text-sm text-amber-400">
                  尚未检测到计算结果。请前往 Designer 页面执行计算后，再返回查看完整报告。
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right: Report Preview */}
        <div className="lg:col-span-8">
          <div
            ref={reportRef}
            className="card-surface p-6 md:p-8 space-y-8 print:bg-white print:text-black print:border-none"
          >
            {/* Report Header */}
            <div className="border-b border-border pb-6 print:border-gray-300">
              <div className="flex items-center gap-3 mb-2">
                <Zap className="w-6 h-6 text-primary-light print:text-gray-700" />
                <h2 className="text-2xl font-bold text-text-primary print:text-black">
                  LLC 谐振变换器设计报告
                </h2>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-text-secondary print:text-gray-600">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {dateStr}
                </span>
                <span className="flex items-center gap-1">
                  <Hash className="w-4 h-4" />
                  LLC Design Tool v2.2（专业修正版）
                </span>
              </div>
            </div>

            {/* Section 1: Input Specs */}
            <section>
              <h3 className="text-lg font-semibold text-text-primary print:text-black mb-3 flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-primary text-white text-xs font-bold">
                  1
                </span>
                输入规格
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-border print:border-gray-300">
                  <thead className="bg-surface-elevated print:bg-gray-100">
                    <tr className="text-text-secondary print:text-gray-700">
                      <th className="text-left px-3 py-2 border-b border-border print:border-gray-300">参数</th>
                      <th className="text-left px-3 py-2 border-b border-border print:border-gray-300">数值</th>
                      <th className="text-left px-3 py-2 border-b border-border print:border-gray-300">单位</th>
                    </tr>
                  </thead>
                  <tbody className="text-text-primary print:text-black">
                    <tr className="border-b border-border/50 print:border-gray-200">
                      <td className="px-3 py-2">输入电压范围</td>
                      <td className="px-3 py-2 font-mono">{p.vinMin} ~ {p.vinMax}</td>
                      <td className="px-3 py-2">V</td>
                    </tr>
                    <tr className="border-b border-border/50 print:border-gray-200">
                      <td className="px-3 py-2">额定输入电压</td>
                      <td className="px-3 py-2 font-mono">{p.vinNom}</td>
                      <td className="px-3 py-2">V</td>
                    </tr>
                    <tr className="border-b border-border/50 print:border-gray-200">
                      <td className="px-3 py-2">输出电压</td>
                      <td className="px-3 py-2 font-mono">{p.vout}</td>
                      <td className="px-3 py-2">V</td>
                    </tr>
                    <tr className="border-b border-border/50 print:border-gray-200">
                      <td className="px-3 py-2">输出功率</td>
                      <td className="px-3 py-2 font-mono">{p.pout}</td>
                      <td className="px-3 py-2">W</td>
                    </tr>
                    <tr className="border-b border-border/50 print:border-gray-200">
                      <td className="px-3 py-2">目标效率</td>
                      <td className="px-3 py-2 font-mono">{p.efficiency}</td>
                      <td className="px-3 py-2">%</td>
                    </tr>
                    <tr className="border-b border-border/50 print:border-gray-200">
                      <td className="px-3 py-2">开关频率</td>
                      <td className="px-3 py-2 font-mono">{p.fsw}</td>
                      <td className="px-3 py-2">kHz</td>
                    </tr>
                    <tr className="border-b border-border/50 print:border-gray-200">
                      <td className="px-3 py-2">拓扑</td>
                      <td className="px-3 py-2">{p.topology === 'half-bridge' ? '半桥' : '全桥'}</td>
                      <td className="px-3 py-2">—</td>
                    </tr>
                    <tr className="border-b border-border/50 print:border-gray-200">
                      <td className="px-3 py-2">整流方式</td>
                      <td className="px-3 py-2">
                        {p.rectifier === 'full-wave' ? '全波整流' : p.rectifier === 'center-tapped' ? '中心抽头' : p.rectifier === 'synchronous' ? '同步整流（全桥）' : '同步整流（中心抽头）'}
                      </td>
                      <td className="px-3 py-2">—</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2">负载范围</td>
                      <td className="px-3 py-2 font-mono">{p.loadMin}% ~ {p.loadMax}%</td>
                      <td className="px-3 py-2">—</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 2: Derived Parameters */}
            <section>
              <h3 className="text-lg font-semibold text-text-primary print:text-black mb-3 flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-primary text-white text-xs font-bold">
                  2
                </span>
                推导参数
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-border print:border-gray-300">
                  <thead className="bg-surface-elevated print:bg-gray-100">
                    <tr className="text-text-secondary print:text-gray-700">
                      <th className="text-left px-3 py-2 border-b border-border print:border-gray-300">参数</th>
                      <th className="text-left px-3 py-2 border-b border-border print:border-gray-300">公式</th>
                      <th className="text-left px-3 py-2 border-b border-border print:border-gray-300">数值</th>
                    </tr>
                  </thead>
                  <tbody className="text-text-primary print:text-black">
                    <tr className="border-b border-border/50 print:border-gray-200">
                      <td className="px-3 py-2">匝比 n</td>
                      <td className="px-3 py-2 font-mono text-text-secondary print:text-gray-600">
                        {p.topology === 'half-bridge' ? 'Vin_nom / (2·Vout)' : 'Vin_nom / Vout'}
                      </td>
                      <td className="px-3 py-2 font-mono">{hasData ? r.n.toFixed(3) : '—'}</td>
                    </tr>
                    <tr className="border-b border-border/50 print:border-gray-200">
                      <td className="px-3 py-2">等效负载 Rac</td>
                      <td className="px-3 py-2 font-mono text-text-secondary print:text-gray-600">8n²Vout² / (π²·Pout)</td>
                      <td className="px-3 py-2 font-mono">{hasData ? racVal.toFixed(2) : '—'} Ω</td>
                    </tr>
                    <tr className="border-b border-border/50 print:border-gray-200">
                      <td className="px-3 py-2">特征阻抗 Zr</td>
                      <td className="px-3 py-2 font-mono text-text-secondary print:text-gray-600">√(Lr / Cr)</td>
                      <td className="px-3 py-2 font-mono">{hasData ? (Math.sqrt(r.lr / r.cr)).toFixed(2) : '—'} Ω</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2">谐振频率 fr</td>
                      <td className="px-3 py-2 font-mono text-text-secondary print:text-gray-600">1 / (2π·√(Lr·Cr))</td>
                      <td className="px-3 py-2 font-mono">{hasData ? (r.fr / 1000).toFixed(1) : '—'} kHz</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 3: Component Values */}
            <section>
              <h3 className="text-lg font-semibold text-text-primary print:text-black mb-3 flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-primary text-white text-xs font-bold">
                  3
                </span>
                元件值
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-border print:border-gray-300">
                  <thead className="bg-surface-elevated print:bg-gray-100">
                    <tr className="text-text-secondary print:text-gray-700">
                      <th className="text-left px-3 py-2 border-b border-border print:border-gray-300">元件</th>
                      <th className="text-left px-3 py-2 border-b border-border print:border-gray-300">计算值</th>
                      <th className="text-left px-3 py-2 border-b border-border print:border-gray-300">关键参数</th>
                      <th className="text-left px-3 py-2 border-b border-border print:border-gray-300">说明</th>
                    </tr>
                  </thead>
                  <tbody className="text-text-primary print:text-black">
                    <tr className="border-b border-border/50 print:border-gray-200">
                      <td className="px-3 py-2 font-medium">Lr</td>
                      <td className="px-3 py-2 font-mono">{hasData ? (r.lr * 1e6).toFixed(2) : '—'} μH</td>
                      <td className="px-3 py-2 font-mono">Q = {hasData ? r.q.toFixed(3) : '—'}</td>
                      <td className="px-3 py-2 text-text-secondary print:text-gray-600">决定谐振阻抗</td>
                    </tr>
                    <tr className="border-b border-border/50 print:border-gray-200">
                      <td className="px-3 py-2 font-medium">Cr</td>
                      <td className="px-3 py-2 font-mono">{hasData ? (r.cr * 1e9).toFixed(2) : '—'} nF</td>
                      <td className="px-3 py-2 font-mono">fr = {hasData ? (r.fr / 1000).toFixed(1) : '—'} kHz</td>
                      <td className="px-3 py-2 text-text-secondary print:text-gray-600">薄膜电容，低损耗</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 font-medium">Lm</td>
                      <td className="px-3 py-2 font-mono">{hasData ? (r.lm * 1e6).toFixed(2) : '—'} μH</td>
                      <td className="px-3 py-2 font-mono">λ = {hasData ? r.lambda.toFixed(3) : '—'}</td>
                      <td className="px-3 py-2 text-text-secondary print:text-gray-600">变压器集成，气隙调节</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 4: Gain Analysis */}
            <section>
              <h3 className="text-lg font-semibold text-text-primary print:text-black mb-3 flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-primary text-white text-xs font-bold">
                  4
                </span>
                增益分析
              </h3>
              <div className="bg-surface-elevated print:bg-gray-50 rounded-lg p-4 border border-border print:border-gray-300 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <div className="text-xs text-text-secondary print:text-gray-600 mb-1">所需增益 (Vin_min)</div>
                    <div className="text-xl font-mono font-semibold text-text-primary print:text-black">
                      {hasData ? mReqMin.toFixed(3) : '—'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-text-secondary print:text-gray-600 mb-1">所需增益 (Vin_max)</div>
                    <div className="text-xl font-mono font-semibold text-text-primary print:text-black">
                      {hasData ? mReqMax.toFixed(3) : '—'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-text-secondary print:text-gray-600 mb-1">峰值增益 M_max</div>
                    <div className={`text-xl font-mono font-semibold ${hasData && r.mMax >= mReqMin ? 'text-success' : 'text-danger'}`}>
                      {hasData ? r.mMax.toFixed(3) : '—'}
                    </div>
                  </div>
                </div>
                <div className="border-t border-border print:border-gray-300 pt-3">
                  <p className="text-sm text-text-secondary print:text-gray-700">
                    在输入电压最低时（{p.vinMin} V），变换器需要最高增益 {hasData ? mReqMin.toFixed(3) : '—'}。
                    设计的峰值增益为 {hasData ? r.mMax.toFixed(3) : '—'}，
                    {hasData
                      ? r.mMax >= mReqMin
                        ? `裕量约 ${gainMargin.toFixed(1)}%，设计可行。`
                        : '裕量不足，建议增大 λ 或降低 Q。'
                      : ''}
                  </p>
                </div>
              </div>
            </section>

            {/* Section 5: Operating Point Analysis */}
            <section>
              <h3 className="text-lg font-semibold text-text-primary print:text-black mb-3 flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-primary text-white text-xs font-bold">
                  5
                </span>
                工作点分析
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-surface-elevated print:bg-gray-50 rounded-lg p-4 border border-border print:border-gray-300">
                  <div className="flex items-center gap-2 mb-2">
                    <Waves className="w-4 h-4 text-primary-light" />
                    <span className="text-sm font-medium text-text-primary print:text-black">ZVS 条件</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasData && r.zvsMargin ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-success" />
                        <span className="text-sm text-success">满足</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-danger" />
                        <span className="text-sm text-danger">不满足</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-text-muted mt-2">
                    基于谐振腔阻抗相位判断（fn=1 时）。初级电流为谐振腔电流，包含负载分量与励磁分量。
                  </p>
                </div>
                <div className="bg-surface-elevated print:bg-gray-50 rounded-lg p-4 border border-border print:border-gray-300">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-primary-light" />
                    <span className="text-sm font-medium text-text-primary print:text-black">电流估算</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-secondary print:text-gray-600">初级 RMS</span>
                      <span className="font-mono text-text-primary print:text-black">
                        {hasData ? r.ipRms.toFixed(2) : '—'} A
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary print:text-gray-600">次级 RMS</span>
                      <span className="font-mono text-text-primary print:text-black">
                        {hasData ? r.isRms.toFixed(2) : '—'} A
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary print:text-gray-600">输出电流 Io</span>
                      <span className="font-mono text-text-primary print:text-black">
                        {(p.pout / p.vout).toFixed(2)} A
                      </span>
                    </div>
                    {hasData && (
                      <p className="text-xs text-text-muted mt-2">
                        {p.rectifier === 'center-tapped' || p.rectifier === 'sync-center-tapped'
                          ? '中心抽头整流：每个次级绕组电流为半波，RMS 值与全波整流不同。'
                          : '全波整流：次级电流为方波，RMS 值由 FHA 等效计算。'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Section 6: Stress Analysis */}
            <section>
              <h3 className="text-lg font-semibold text-text-primary print:text-black mb-3 flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-primary text-white text-xs font-bold">
                  6
                </span>
                应力分析
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-border print:border-gray-300">
                  <thead className="bg-surface-elevated print:bg-gray-100">
                    <tr className="text-text-secondary print:text-gray-700">
                      <th className="text-left px-3 py-2 border-b border-border print:border-gray-300">器件</th>
                      <th className="text-left px-3 py-2 border-b border-border print:border-gray-300">电压应力</th>
                      <th className="text-left px-3 py-2 border-b border-border print:border-gray-300">电流应力</th>
                    </tr>
                  </thead>
                  <tbody className="text-text-primary print:text-black">
                    <tr className="border-b border-border/50 print:border-gray-200">
                      <td className="px-3 py-2">初级 MOSFET</td>
                      <td className="px-3 py-2 font-mono">
                        {Math.ceil(p.topology === 'half-bridge' ? p.vinMax : p.vinMax * 1.2)} V (耐压建议)
                      </td>
                      <td className="px-3 py-2 font-mono">
                        {hasData ? (r.ipRms * 2.5).toFixed(1) : '—'} A
                      </td>
                    </tr>
                    <tr className="border-b border-border/50 print:border-gray-200">
                      <td className="px-3 py-2">次级整流</td>
                      <td className="px-3 py-2 font-mono">
                        {Math.ceil(p.vout * (p.rectifier === 'center-tapped' || p.rectifier === 'sync-center-tapped' ? 2.5 : 2))} V (耐压建议)
                      </td>
                      <td className="px-3 py-2 font-mono">
                        {hasData ? (r.isRms * 1.5).toFixed(1) : '—'} A
                      </td>
                    </tr>
                    <tr className="border-b border-border/50 print:border-gray-200">
                      <td className="px-3 py-2">谐振电容 Cr</td>
                      <td className="px-3 py-2 font-mono">
                        {(p.vinMax * (p.topology === 'half-bridge' ? 0.5 : 1)).toFixed(0)} V (峰值，近似值)
                      </td>
                      <td className="px-3 py-2 font-mono">{hasData ? r.ipRms.toFixed(2) : '—'} A</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2">谐振电感 Lr</td>
                      <td className="px-3 py-2">—</td>
                      <td className="px-3 py-2 font-mono">{hasData ? r.ipRms.toFixed(2) : '—'} A</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 7: Optimization Summary */}
            <section>
              <h3 className="text-lg font-semibold text-text-primary print:text-black mb-3 flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-primary text-white text-xs font-bold">
                  7
                </span>
                优化摘要
              </h3>
              <ul className="space-y-2">
                {suggestions.length > 0 ? (
                  suggestions.map((s, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-text-secondary print:text-gray-700"
                    >
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/20 text-primary text-xs font-bold shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      {s}
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-text-muted">暂无优化建议。请先在 Designer 页面执行计算。</li>
                )}
              </ul>
            </section>

            {/* Section 8: Recommendations */}
            <section>
              <h3 className="text-lg font-semibold text-text-primary print:text-black mb-3 flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-primary text-white text-xs font-bold">
                  8
                </span>
                建议与下一步
              </h3>
              <ol className="space-y-2 text-sm text-text-secondary print:text-gray-700 list-decimal list-inside">
                <li>使用 SPICE / Simulink 进行详细时域仿真，验证软开关与效率。</li>
                <li>根据 E12 / E24 标准值选择实际 Cr，并微调 Lr 保持 fr 不变。</li>
                <li>设计变压器：通过气隙调节 Lm，同时保证漏感满足 Lr 需求。</li>
                <li>验证 PCB 布局：最小化谐振回路寄生电感与电容。</li>
                <li>制作原型并测试：满载效率、温升、EMI、负载瞬态。</li>
              </ol>
            </section>

            {/* Custom Notes */}
            {notes && (
              <section className="border-t border-border print:border-gray-300 pt-6">
                <h3 className="text-lg font-semibold text-text-primary print:text-black mb-3">备注</h3>
                <div className="bg-surface-elevated print:bg-gray-50 rounded-lg p-4 border border-border print:border-gray-300 whitespace-pre-wrap text-sm text-text-secondary print:text-gray-700">
                  {notes}
                </div>
              </section>
            )}

            {/* Footer */}
            <div className="border-t border-border print:border-gray-300 pt-4 text-center text-xs text-text-muted print:text-gray-500">
              本报告由 LLC Resonant Converter Design Tool 自动生成，仅供工程参考。
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


