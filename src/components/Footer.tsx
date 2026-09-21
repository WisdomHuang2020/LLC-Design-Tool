import { Link } from 'react-router-dom'
import { Zap, Github, BookOpen, Activity, Calculator } from 'lucide-react'

// 构建时由 vite.config.ts 的 define 注入（源为 package.json 的 version）。
// fallback 用 'dev' 而非伪造一个版本号：define 未生效时应显式暴露异常，
// 不能显示一个看起来正常的版本，否则会误导线上版本核验。
const APP_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev'

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-border mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-primary-light" />
              <span className="font-bold text-text-primary">LLC Design Tool</span>
            </div>
            <p className="text-text-secondary text-sm leading-relaxed">
              专业的LLC谐振变换器学习与工程设计平台，涵盖理论推导、特性分析与参数优化。
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-text-primary mb-4 text-sm uppercase tracking-wider">学习资源</h4>
            <div className="space-y-2">
              <Link to="/fundamentals" className="flex items-center gap-2 text-text-secondary hover:text-primary-light text-sm transition-colors">
                <BookOpen className="w-4 h-4" /> 谐振基础
              </Link>
              <Link to="/operation" className="flex items-center gap-2 text-text-secondary hover:text-primary-light text-sm transition-colors">
                <Activity className="w-4 h-4" /> 工作原理
              </Link>
              <Link to="/derivations" className="flex items-center gap-2 text-text-secondary hover:text-primary-light text-sm transition-colors">
                <BookOpen className="w-4 h-4" /> 公式推导
              </Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-text-primary mb-4 text-sm uppercase tracking-wider">设计工具</h4>
            <div className="space-y-2">
              <Link to="/curves" className="flex items-center gap-2 text-text-secondary hover:text-primary-light text-sm transition-colors">
                <Activity className="w-4 h-4" /> 特性曲线
              </Link>
              <Link to="/designer" className="flex items-center gap-2 text-text-secondary hover:text-primary-light text-sm transition-colors">
                <Calculator className="w-4 h-4" /> 参数设计
              </Link>
              <Link to="/report" className="flex items-center gap-2 text-text-secondary hover:text-primary-light text-sm transition-colors">
                <BookOpen className="w-4 h-4" /> 报告输出
              </Link>
            </div>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-text-muted text-sm">
            © 2026 LLC Design Tool. 仅供学习与研究使用。
          </p>
          <div className="flex items-center gap-5">
            <span
              className="text-text-muted text-sm font-mono tracking-wide"
              title="构建版本号（源：package.json）"
            >
              v{APP_VERSION}
            </span>
            <a
              href="https://github.com/WisdomHuang2020/LLC-Design-Tool"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-text-muted hover:text-text-secondary text-sm transition-colors"
            >
              <Github className="w-4 h-4" /> GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
