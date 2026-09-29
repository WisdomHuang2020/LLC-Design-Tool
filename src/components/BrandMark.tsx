/**
 * LLC 品牌标记 —— 与本站 public/favicon.svg 完全同源。
 *
 * 造型：谐振尖峰脉冲（本站首页主图标 Activity 的加粗版）。
 * 语义：LC 谐振腔的电压/电流波形，与主入口站 sites.json 的 icon=activity 一致。
 *
 * ⚠️ 与 public/favicon.svg 使用同一套 path 数据：改一处必须同步另一处。
 * 主形用站群统一 teal #14b8a6；amber 点落在尖峰顶，为站群固定标记。
 */
export default function BrandMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="7" fill="#0a0a0a" />
      <path
        d="M3 16 H10 L13 6 L17 26 L20.5 16 H29"
        fill="none"
        stroke="#14b8a6"
        strokeWidth={3.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="13" cy="6" r="2.3" fill="#f59e0b" />
    </svg>
  )
}
