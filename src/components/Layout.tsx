import { ReactNode } from 'react'
import Header from './Header'
import Footer from './Footer'
import FormulaNumbering from './FormulaNumbering'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-bg">
      <Header />
      <main className="flex-1 pt-16">
        {children}
      </main>
      <Footer />
      {/* 全站公式编号：挂在 Layout 上，靠 body 级 MutationObserver 覆盖所有路由与折叠展开 */}
      <FormulaNumbering />
    </div>
  )
}
