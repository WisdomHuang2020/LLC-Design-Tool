import { Link } from 'react-router-dom'
import { Github, BookOpen, Activity, Calculator } from 'lucide-react'
import BrandMark from './BrandMark'

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
              <BrandMark className="w-5 h-5" />
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
          <div className="flex flex-col items-center md:items-start gap-1">
            <p className="text-text-muted text-sm">
              © 2026 LLC Design Tool. 结果仅供工程估算与学习参考。
            </p>
            {/* 备案信息：工信部（ICP 备案）与公安部（公安联网备案）均要求网站底部公开展示。
                ICP 在前、公安图标居中、公安备案号在后，同一行排列。
                图标路径用相对 './'：同一份 dist 要同时服务自有域名根路径与 GitHub Pages
                子路径，写成绝对 '/beian.png' 会在 Pages 子路径下 404。 */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-2 gap-y-1">
              <a
                href="https://beian.miit.gov.cn/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-muted hover:text-text-secondary text-sm transition-colors"
              >
                苏ICP备2026073104号-1
              </a>
              <a
                href="https://beian.mps.gov.cn/#/query/webSearch?code=32021402005238"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-text-muted hover:text-text-secondary text-sm transition-colors"
              >
                <img src="./beian.png" alt="" className="h-4 w-auto" />
                苏公网安备32021402005238号
              </a>
            </div>
          </div>
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
        {/* 免责声明：分「工程决策」与「知识产权」两段，与站群其余站点保持同一文本。 */}
        <div className="mt-8 border-t border-border pt-6">
          <p className="text-text-muted text-xs leading-relaxed">
            <span className="font-medium text-text-secondary">免责声明：</span>
            本站为个人非商业性技术分享。全部计算结果基于公开理论模型与解析/半解析近似，
            仅供工程估算与学习研究参考，不构成设计保证，亦不替代器件数据手册、实测波形、
            仿真与第三方专业复核。任何主体引用本站内容或据此作出的工程决策，风险与责任
            由该主体自行承担；因使用本站内容所产生的间接损失，本站不予承担。
          </p>
          <p className="mt-2 text-text-muted text-xs leading-relaxed">
            站内图表、公式推导与文字内容为作者原创或基于公开资料整理，著作权归作者所有；
            文中提及的软件、标准、商标与厂商名称，权利均归各自权利人所有，仅作技术说明引用，
            不代表任何隶属、赞助或背书关系。
          </p>
        </div>
      </div>
    </footer>
  )
}
