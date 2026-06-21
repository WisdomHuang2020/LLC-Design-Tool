import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Zap, BookOpen, Activity, Calculator, FileText, Settings, PenTool } from 'lucide-react'

const navLinks = [
  { path: '/', label: '首页', icon: Zap },
  { path: '/fundamentals', label: '谐振基础', icon: BookOpen },
  { path: '/operation', label: '工作原理', icon: Activity },
  { path: '/derivations', label: '公式推导', icon: PenTool },
  { path: '/curves', label: '特性曲线', icon: Activity },
  { path: '/designer', label: '设计工具', icon: Calculator },
  { path: '/report', label: '报告输出', icon: FileText },
]

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-surface border-b border-border">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-text-primary hover:text-primary-light transition-colors">
          <Zap className="w-6 h-6 text-primary-light" />
          <span className="font-bold text-lg tracking-tight">LLC Design</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path
            const Icon = link.icon
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  isActive
                    ? 'text-primary-light bg-primary-dark/30'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden lg:inline">{link.label}</span>
              </Link>
            )
          })}
        </nav>

        <button
          className="md:hidden p-2 text-text-secondary hover:text-text-primary"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-surface border-b border-border">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path
              const Icon = link.icon
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all ${
                    isActive
                      ? 'text-primary-light bg-primary-dark/30'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {link.label}
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </header>
  )
}
