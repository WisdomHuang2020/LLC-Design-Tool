import { useEffect } from 'react'

/**
 * 全站公式编号（侧效应组件，不渲染任何 DOM）。
 *
 * 编号规则：**（章.序）**
 *   · 章 = 公式所在分区在本页的序号，取自最近的 `[data-section-index]` 祖先
 *     （推导页 `FormulaSection number`、基础/工作原理页 `SectionCard index`）；
 *   · 序 = 该分区内第几个公式块，按 **DOM 文档顺序** 计数。
 * 若整页都没有分区（如首页的示例公式），退回本页顺序编号 `(1) (2) …`。
 *
 * 为什么用「渲染后按 DOM 顺序整体重算」而不是在 React 渲染期计数：
 *   1. React 里在渲染期自增计数器在 StrictMode / 并发渲染下会跳号（副作用时机不确定）；
 *   2. 本页的区域是**可折叠**的（推导页 8 个 Section 默认收起、展开后才进 DOM），
 *      分区内公式数量随交互变化，必须在每次 DOM 变化后重算；
 *   3. **每次全量重算 ⇒ 幂等**，双调用/重复触发都不会产生错号。
 * 因此用一个 body 级 MutationObserver + rAF 去抖；写入前比对文本，相同则不写
 * （这一步同时切断了「写入 → 触发 observer → 再写入」的自激循环）。
 */
export default function FormulaNumbering() {
  useEffect(() => {
    let raf = 0
    let disposed = false

    const apply = () => {
      if (disposed) return
      const blocks = Array.from(document.querySelectorAll<HTMLElement>('.math-block'))
      if (!blocks.length) return

      const pageHasSections = document.querySelector('[data-section-index]') !== null
      const perSection = new Map<string, number>()
      let globalSeq = 0

      for (const el of blocks) {
        const secEl = el.closest<HTMLElement>('[data-section-index]')
        const sec = secEl?.dataset.sectionIndex ?? ''
        globalSeq += 1

        let text: string
        if (pageHasSections && sec) {
          const k = (perSection.get(sec) ?? 0) + 1
          perSection.set(sec, k)
          text = `(${sec}.${k})`
        } else {
          text = `(${globalSeq})`
        }

        const slot = el.querySelector<HTMLElement>('.math-block-number')
        // 仅在内容变化时写入：既省渲染，也避免 MutationObserver 自激
        if (slot && slot.textContent !== text) slot.textContent = text
      }
    }

    const schedule = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(apply)
    }

    apply()
    const obs = new MutationObserver(schedule)
    obs.observe(document.body, { childList: true, subtree: true })

    return () => {
      disposed = true
      obs.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [])

  return null
}
