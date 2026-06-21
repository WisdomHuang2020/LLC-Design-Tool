import { HashRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Fundamentals from './pages/Fundamentals'
import Operation from './pages/Operation'
import Derivations from './pages/Derivations'
import Curves from './pages/Curves'
import Designer from './pages/Designer'
import Report from './pages/Report'
import { DesignProvider } from './lib/DesignContext'
import CircuitEditor from './pages/CircuitEditor'

function App() {
  return (
    <DesignProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/fundamentals" element={<Fundamentals />} />
            <Route path="/operation" element={<Operation />} />
            <Route path="/derivations" element={<Derivations />} />
            <Route path="/curves" element={<Curves />} />
            <Route path="/designer" element={<Designer />} />
            <Route path="/circuit-editor" element={<CircuitEditor />} />
          </Routes>
        </Layout>
      </HashRouter>
    </DesignProvider>
  )
}

export default App
