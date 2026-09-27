import { BrowserRouter, HashRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Fundamentals from './pages/Fundamentals'
import Operation from './pages/Operation'
import Derivations from './pages/Derivations'
import Curves from './pages/Curves'
import Designer from './pages/Designer'
import Report from './pages/Report'
import { DesignProvider } from './lib/DesignContext'

// 路由模式按托管环境选择，同一份构建产物适配两处：
//  • 正式站（自有域名）由 nginx 提供 SPA 回退（try_files … /index.html），
//    可用 BrowserRouter 得到不带 # 的干净 URL（/derivations、/designer …）。
//  • GitHub Pages 是子路径托管（/LLC-Design-Tool/）且没有服务端回退，
//    深链接直接访问/刷新会 404，故那里保持 HashRouter。
const isGitHubPages =
  typeof window !== 'undefined' && /\.github\.io$/i.test(window.location.hostname)

// 兼容历史分享的 #/xxx 链接：先改写为浏览器路由再交给 Router 解析
if (!isGitHubPages && typeof window !== 'undefined' && window.location.hash.startsWith('#/')) {
  window.history.replaceState(null, '', window.location.hash.slice(1))
}

const Router = isGitHubPages ? HashRouter : BrowserRouter

function App() {
  return (
    <DesignProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/fundamentals" element={<Fundamentals />} />
            <Route path="/operation" element={<Operation />} />
            <Route path="/derivations" element={<Derivations />} />
            <Route path="/curves" element={<Curves />} />
            <Route path="/designer" element={<Designer />} />
            <Route path="/report" element={<Report />} />
          </Routes>
        </Layout>
      </Router>
    </DesignProvider>
  )
}

export default App
