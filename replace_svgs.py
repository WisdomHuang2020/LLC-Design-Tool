import math

def main(ctx):
    filepath = r"C:\Users\xuexi\Documents\kimi\workspace\llc-design-tool\src\pages\Operation.tsx"
    
    with open(filepath, "r", encoding="utf-8") as f:
        lines = f.readlines()
    
    # Build new SwitchingAnimationSVG (lines 322-477, 0-indexed: 321-476)
    ir_points = []
    for x in range(60, 631, 15):
        angle = (x - 60) / 450 * 2 * math.pi
        y = round(30 - 18 * math.sin(angle), 1)
        ir_points.append(f"L {x} {y}")
    ir_path = "M 60 30.0 " + " ".join(ir_points[1:])
    
    switching_svg = '''function SwitchingAnimationSVG() {
  const t1 = 60
  const t2 = 180
  const t3 = 230
  const t4 = 280
  const t5 = 400
  const t6 = 450
  const t7 = 510
  const t8 = 630

  const phases = [
    { start: t1, end: t2, color: 'rgba(20,184,166,0.12)', label: 'Q1 ON', labelColor: '#14b8a6' },
    { start: t2, end: t3, color: 'rgba(245,158,11,0.12)', label: '死区', labelColor: '#f59e0b' },
    { start: t3, end: t4, color: 'rgba(34,197,94,0.15)', label: 'D2导通', labelColor: '#22c55e' },
    { start: t4, end: t5, color: 'rgba(20,184,166,0.12)', label: 'Q2 ON', labelColor: '#14b8a6' },
    { start: t5, end: t6, color: 'rgba(245,158,11,0.12)', label: '死区', labelColor: '#f59e0b' },
    { start: t6, end: t7, color: 'rgba(34,197,94,0.15)', label: 'D1导通', labelColor: '#22c55e' },
    { start: t7, end: t8, color: 'rgba(20,184,166,0.12)', label: 'Q1 ON', labelColor: '#14b8a6' },
  ]

  const timeMarkers = [
    { t: t1, label: 't₁' },
    { t: t2, label: 't₂' },
    { t: t3, label: 't₃' },
    { t: t4, label: 't₄' },
    { t: t5, label: 't₅' },
    { t: t6, label: 't₆' },
    { t: t7, label: "t₁'" },
    { t: t8, label: "t₂'" },
  ]

  const irPath = 'M 60 30.0 L 75 26.3 L 90 22.7 L 105 19.4 L 120 16.6 L 135 14.4 L 150 12.9 L 165 12.1 L 180 12.1 L 195 12.9 L 210 14.4 L 225 16.6 L 240 19.4 L 255 22.7 L 270 26.3 L 285 30.0 L 300 33.7 L 315 37.3 L 330 40.6 L 345 43.4 L 360 45.6 L 375 47.1 L 390 47.9 L 405 47.9 L 420 47.1 L 435 45.6 L 450 43.4 L 465 40.6 L 480 37.3 L 495 33.7 L 510 30.0 L 525 26.3 L 540 22.7 L 555 19.4 L 570 16.6 L 585 14.4 L 600 12.9 L 615 12.1 L 630 12.1'

  const imPath = 'M 60 48 L 180 30 L 285 12 L 400 30 L 510 48 L 630 30'

  return (
    <svg viewBox="0 0 700 460" className="w-full max-w-3xl mx-auto h-auto" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id="arrowTealAnim" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <circle cx="3" cy="3" r="2" fill="#14b8a6" />
        </marker>
        <linearGradient id="vdsFallGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
      </defs>

      {/* Grid */}
      <g stroke="#404040" strokeWidth="1" opacity="0.2">
        {Array.from({ length: 16 }, (_, i) => 40 + i * 40).map((x) => (
          <line key={`v${x}`} x1={x} y1="10" x2={x} y2="255" />
        ))}
        {Array.from({ length: 7 }, (_, i) => 15 + i * 40).map((y) => (
          <line key={`h${y}`} x1="40" y1={y} x2="660" y2={y} />
        ))}
      </g>

      {/* Phase background strips */}
      {phases.map((p, i) => (
        <rect key={i} x={p.start} y="10" width={p.end - p.start} height="245" fill={p.color} />
      ))}

      {/* Phase labels on strip */}
      {phases.map((p, i) => (
        <text key={`l${i}`} x={(p.start + p.end) / 2} y="262" fill={p.labelColor} fontSize="9" textAnchor="middle" fontFamily="JetBrains Mono, monospace" opacity="0.9">
          {p.label}
        </text>
      ))}

      {/* Time marker lines */}
      {timeMarkers.map((m, i) => (
        <line key={`m${i}`} x1={m.t} y1="10" x2={m.t} y2="255" stroke="#525252" strokeWidth="1" strokeDasharray="3 2" opacity="0.6" />
      ))}

      {/* Vgs Q1 */}
      <g>
        <text x="65" y="28" fill="#a3a3a3" fontSize="11" textAnchor="end" dominantBaseline="middle" fontFamily="JetBrains Mono, monospace">Vgs_Q1</text>
        <line x1={t1} y1="40" x2={t8} y2="40" stroke="#525252" strokeWidth="1" />
        <path d={`M ${t1} 40 L ${t1} 15 L ${t2} 15 L ${t2} 40 L ${t7} 40 L ${t7} 15 L ${t8} 15 L ${t8} 40`} fill="none" stroke="#14b8a6" strokeWidth="2" />
        <text x={(t1 + t2) / 2} y="12" fill="#14b8a6" fontSize="8" textAnchor="middle">Q1 ON</text>
        <text x={(t7 + t8) / 2} y="12" fill="#14b8a6" fontSize="8" textAnchor="middle">Q1 ON</text>
      </g>

      {/* Vgs Q2 */}
      <g transform="translate(0, 45)">
        <text x="65" y="28" fill="#a3a3a3" fontSize="11" textAnchor="end" dominantBaseline="middle" fontFamily="JetBrains Mono, monospace">Vgs_Q2</text>
        <line x1={t1} y1="40" x2={t8} y2="40" stroke="#525252" strokeWidth="1" />
        <path d={`M ${t1} 40 L ${t4} 40 L ${t4} 15 L ${t5} 15 L ${t5} 40 L ${t8} 40`} fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 2" />
        <text x={(t4 + t5) / 2} y="12" fill="#f59e0b" fontSize="8" textAnchor="middle">Q2 ON</text>
      </g>

      {/* Vds Q1 */}
      <g transform="translate(0, 90)">
        <text x="65" y="28" fill="#a3a3a3" fontSize="11" textAnchor="end" dominantBaseline="middle" fontFamily="JetBrains Mono, monospace">Vds_Q1</text>
        <line x1={t1} y1="40" x2={t8} y2="40" stroke="#525252" strokeWidth="1" />
        <path d={`M ${t1} 40 L ${t2} 40 L ${t3} 10 L ${t5} 10 L ${t6} 40 L ${t7} 40 L ${t8} 40`} fill="none" stroke="#ef4444" strokeWidth="2" />
        <line x1={t5} y1="10" x2={t6} y2="40" stroke="url(#vdsFallGrad)" strokeWidth="2" />
        <rect x={t6} y="8" width={t7 - t6} height="36" fill="rgba(34,197,94,0.15)" stroke="#22c55e" strokeWidth="1" strokeDasharray="3 2" />
        <text x={(t6 + t7) / 2} y="56" fill="#22c55e" fontSize="9" textAnchor="middle">ZVS</text>
        <text x={(t2 + t3) / 2} y="56" fill="#f59e0b" fontSize="9" textAnchor="middle">死区</text>
        <text x={(t5 + t6) / 2} y="56" fill="#f59e0b" fontSize="9" textAnchor="middle">死区</text>
      </g>

      {/* Ir */}
      <g transform="translate(0, 145)">
        <text x="65" y="20" fill="#a3a3a3" fontSize="11" textAnchor="end" dominantBaseline="middle" fontFamily="JetBrains Mono, monospace">Ir</text>
        <line x1={t1} y1="30" x2={t8} y2="30" stroke="#525252" strokeWidth="1" />
        <path d={irPath} fill="none" stroke="#14b8a6" strokeWidth="2" className="dash-flow" />
        <text x={t8 + 12} y="28" fill="#14b8a6" fontSize="11" dominantBaseline="middle">谐振电流</text>
      </g>

      {/* Im */}
      <g transform="translate(0, 200)">
        <text x="65" y="20" fill="#a3a3a3" fontSize="11" textAnchor="end" dominantBaseline="middle" fontFamily="JetBrains Mono, monospace">Im</text>
        <line x1={t1} y1="30" x2={t8} y2="30" stroke="#525252" strokeWidth="1" />
        <path d={imPath} fill="none" stroke="#22c55e" strokeWidth="2" className="dash-flow-slow" />
        <text x={t8 + 12} y="28" fill="#22c55e" fontSize="11" dominantBaseline="middle">励磁电流</text>
      </g>

      {/* Time axis */}
      <line x1={t1} y1="295" x2={t8} y2="295" stroke="#525252" strokeWidth="2" markerEnd="url(#arrowTealAnim)" />
      <text x={(t1 + t8) / 2} y="315" fill="#737373" fontSize="11" textAnchor="middle">时间 t →</text>

      {/* Phase markers and labels */}
      {timeMarkers.map((m, i) => (
        <g key={`pl${i}`}>
          <line x1={m.t} y1="255" x2={m.t} y2="265" stroke="#525252" strokeWidth="1.5" />
          <text x={m.t} y="278" fill="#a3a3a3" fontSize="10" textAnchor="middle" fontFamily="JetBrains Mono, monospace">{m.label}</text>
        </g>
      ))}

      {/* Legend */}
      <g transform="translate(80, 340)">
        <rect x="0" y="-8" width="14" height="14" fill="rgba(20,184,166,0.15)" />
        <text x="20" y="0" fill="#a3a3a3" fontSize="10" dominantBaseline="middle">Q1/Q2 ON (能量传输)</text>
        <rect x="170" y="-8" width="14" height="14" fill="rgba(245,158,11,0.15)" />
        <text x="190" y="0" fill="#a3a3a3" fontSize="10" dominantBaseline="middle">死区时间</text>
        <rect x="270" y="-8" width="14" height="14" fill="rgba(34,197,94,0.15)" />
        <text x="290" y="0" fill="#a3a3a3" fontSize="10" dominantBaseline="middle">体二极管导通 (ZVS)</text>
        <rect x="430" y="-8" width="14" height="14" fill="rgba(239,68,68,0.15)" />
        <text x="450" y="0" fill="#a3a3a3" fontSize="10" dominantBaseline="middle">Vds高电平</text>
      </g>

      {/* Phase description */}
      <text x="80" y="370" fill="#a3a3a3" fontSize="10" fontFamily="JetBrains Mono, monospace">t₁→t₂: Q1导通, 正半周能量传输 | t₂→t₃: 死区, Coss充放电 | t₃→t₄: Q2体二极管导通, ZVS准备</text>
      <text x="80" y="385" fill="#a3a3a3" fontSize="10" fontFamily="JetBrains Mono, monospace">t₄→t₅: Q2导通, 负半周能量传输 | t₅→t₆: 死区, Coss充放电 | t₆→t₁': Q1体二极管导通, ZVS准备</text>
    </svg>
  )
}
'''

    # Build new CurrentFlowCircuitSVG (lines 479-673, 0-indexed: 478-672)
    current_flow_svg = '''function CurrentFlowCircuitSVG() {
  const [phase, setPhase] = useState(0)

  const phases = [
    { id: 0, label: 't₁-t₂', name: 'Q1 ON', desc: '正半周能量传输', color: '#14b8a6' },
    { id: 1, label: 't₂-t₃', name: '死区', desc: 'Q1关断, Coss充放电', color: '#f59e0b' },
    { id: 2, label: 't₃-t₄', name: 'D2导通', desc: 'Q2体二极管导通, ZVS准备', color: '#22c55e' },
    { id: 3, label: 't₄-t₅', name: 'Q2 ON', desc: '负半周能量传输, ZVS实现', color: '#14b8a6' },
    { id: 4, label: 't₅-t₆', name: '死区', desc: 'Q2关断, Coss充放电', color: '#f59e0b' },
    { id: 5, label: 't₆-t₁', name: 'D1导通', desc: 'Q1体二极管导通, ZVS准备', color: '#22c55e' },
  ]

  const activePhase = phases[phase]
  const q1Active = phase === 0 || phase === 5
  const q2Active = phase === 2 || phase === 3
  const d1Active = phase === 0 || phase === 1 || phase === 5
  const d2Active = phase === 2 || phase === 3 || phase === 4
  const q1BodyDiode = phase === 5
  const q2BodyDiode = phase === 2

  const posPath = 'M 70 55 L 130 55 L 150 55 L 150 85 L 150 180 L 190 180 L 220 180 L 250 180 L 270 180 L 280 180 L 340 180 L 380 180 L 410 180 L 410 150 L 430 150 L 460 150 L 540 150 L 540 96 L 540 264 L 460 264 L 430 210 L 410 210 L 410 180 L 340 180 L 150 180 L 150 270 L 150 295 L 150 325 L 130 325 L 70 325 L 70 55'
  const negPath = 'M 70 325 L 130 325 L 150 325 L 150 270 L 150 180 L 190 180 L 220 180 L 250 180 L 270 180 L 280 180 L 340 180 L 380 180 L 410 180 L 410 210 L 430 210 L 460 264 L 540 264 L 540 96 L 540 150 L 460 150 L 430 150 L 410 150 L 410 180 L 340 180 L 150 180 L 150 85 L 150 55 L 130 55 L 70 55 L 70 325'
  const deadPosPath = 'M 70 55 L 130 55 L 150 55 L 150 85 L 150 180 L 190 180 L 220 180 L 250 180 L 270 180 L 280 180 L 340 180 L 380 180 L 410 180 L 410 210 L 430 210 L 460 264 L 540 264 L 540 150 L 460 150 L 430 150 L 410 150 L 410 180 L 340 180 L 150 180 L 150 270 L 150 295 L 150 325 L 130 325 L 70 325 L 70 55'
  const deadNegPath = 'M 70 325 L 130 325 L 150 325 L 150 270 L 150 180 L 190 180 L 220 180 L 250 180 L 270 180 L 280 180 L 340 180 L 380 180 L 410 180 L 410 150 L 430 150 L 460 150 L 540 150 L 540 264 L 460 264 L 430 210 L 410 210 L 410 180 L 340 180 L 150 180 L 150 85 L 150 55 L 130 55 L 70 55 L 70 325'

  const currentPaths = [
    { d: posPath, color: '#14b8a6', marker: 'url(#arrowTealCircuit)', label: '正半周能量传输' },
    { d: deadPosPath, color: '#f59e0b', marker: 'url(#arrowAmberCircuit)', label: 'Coss充放电' },
    { d: negPath, color: '#22c55e', marker: 'url(#arrowGreenCircuit)', label: 'Q2体二极管续流' },
    { d: negPath, color: '#14b8a6', marker: 'url(#arrowTealCircuit)', label: '负半周能量传输' },
    { d: deadNegPath, color: '#f59e0b', marker: 'url(#arrowAmberCircuit)', label: 'Coss充放电' },
    { d: posPath, color: '#22c55e', marker: 'url(#arrowGreenCircuit)', label: 'Q1体二极管续流' },
  ]

  const currentPath = currentPaths[phase]

  return (
    <div>
      {/* Phase selector */}
      <div className="flex flex-wrap gap-1.5 mb-3 justify-center">
        {phases.map((p) => (
          <button
            key={p.id}
            onClick={() => setPhase(p.id)}
            className={`px-2 py-1 rounded text-xs font-medium transition-all font-mono border ${
              phase === p.id
                ? 'text-white shadow-sm'
                : 'bg-bg/80 text-text-secondary hover:bg-surface-elevated border-border/50'
            }`}
            style={phase === p.id ? { backgroundColor: p.color, borderColor: p.color } : {}}
          >
            <span className="block">{p.label}</span>
            <span className="block text-[10px] opacity-80">{p.name}</span>
          </button>
        ))}
      </div>

      {/* Phase info */}
      <div className="text-center mb-3">
        <span className="text-sm font-semibold" style={{ color: activePhase.color }}>{activePhase.name}</span>
        <span className="text-xs text-text-secondary ml-2">{activePhase.desc}</span>
        <span className="block text-xs text-text-muted mt-1">{currentPath.label}</span>
      </div>

      <svg viewBox="0 0 600 340" className="w-full max-w-3xl mx-auto h-auto" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="arrowTealCircuit" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <path d="M 0 0 L 8 4 L 0 8 L 2 4 Z" fill="#14b8a6" />
          </marker>
          <marker id="arrowAmberCircuit" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <path d="M 0 0 L 8 4 L 0 8 L 2 4 Z" fill="#f59e0b" />
          </marker>
          <marker id="arrowGreenCircuit" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <path d="M 0 0 L 8 4 L 0 8 L 2 4 Z" fill="#22c55e" />
          </marker>
        </defs>

        {/* DC input rails */}
        <line x1="50" y1="55" x2="130" y2="55" stroke="#a3a3a3" strokeWidth="2" />
        <line x1="50" y1="325" x2="130" y2="325" stroke="#a3a3a3" strokeWidth="2" />
        <text x="28" y="59" fill="#a3a3a3" fontSize="12" fontFamily="JetBrains Mono, monospace">Vin+</text>
        <text x="28" y="329" fill="#a3a3a3" fontSize="12" fontFamily="JetBrains Mono, monospace">GND</text>

        {/* Q1 high-side NMOS */}
        <line x1="130" y1="55" x2="150" y2="55" stroke="#a3a3a3" strokeWidth="2" />
        <line x1="150" y1="55" x2="150" y2="85" stroke="#a3a3a3" strokeWidth="2" />
        <line x1="150" y1="85" x2="150" y2="155" stroke="#a3a3a3" strokeWidth="2" />
        <line x1="150" y1="155" x2="150" y2="180" stroke="#a3a3a3" strokeWidth="2" />
        {/* Channel */}
        <line x1="150" y1="85" x2="150" y2="155" stroke={q1Active ? '#14b8a6' : '#a3a3a3'} strokeWidth={q1Active ? '3' : '2'} />
        {/* Gate */}
        <line x1="128" y1="120" x2="142" y2="120" stroke={q1Active ? '#14b8a6' : '#a3a3a3'} strokeWidth={q1Active ? '3' : '2'} />
        {/* Source short bar + N arrow */}
        <line x1="150" y1="148" x2="164" y2="148" stroke={q1Active ? '#14b8a6' : '#a3a3a3'} strokeWidth={q1Active ? '3' : '2'} />
        <path d="M 150 148 L 158 144 L 158 152 Z" fill={q1Active ? '#14b8a6' : '#a3a3a3'} />
        {/* Body diode */}
        <line x1="164" y1="95" x2="164" y2="148" stroke={q1BodyDiode ? '#22c55e' : '#a3a3a3'} strokeWidth={q1BodyDiode ? '3' : '1.5'} />
        <line x1="160" y1="95" x2="168" y2="95" stroke={q1BodyDiode ? '#22c55e' : '#a3a3a3'} strokeWidth={q1BodyDiode ? '3' : '1.5'} />
        <path d="M 164 95 L 160 110 L 168 110 Z" fill={q1BodyDiode ? '#22c55e' : '#a3a3a3'} />
        <text x="120" y="124" fill={q1Active ? '#14b8a6' : q1BodyDiode ? '#22c55e' : '#a3a3a3'} fontSize="12" fontFamily="JetBrains Mono, monospace" textAnchor="end">Q1</text>

        {/* Q2 low-side NMOS */}
        <line x1="150" y1="180" x2="150" y2="200" stroke="#a3a3a3" strokeWidth="2" />
        <line x1="150" y1="200" x2="150" y2="270" stroke="#a3a3a3" strokeWidth="2" />
        <line x1="150" y1="270" x2="150" y2="295" stroke="#a3a3a3" strokeWidth="2" />
        <line x1="150" y1="295" x2="150" y2="325" stroke="#a3a3a3" strokeWidth="2" />
        <line x1="150" y1="200" x2="150" y2="270" stroke={q2Active ? '#f59e0b' : '#a3a3a3'} strokeWidth={q2Active ? '3' : '2'} />
        <line x1="128" y1="235" x2="142" y2="235" stroke={q2Active ? '#f59e0b' : '#a3a3a3'} strokeWidth={q2Active ? '3' : '2'} />
        <line x1="150" y1="263" x2="164" y2="263" stroke={q2Active ? '#f59e0b' : '#a3a3a3'} strokeWidth={q2Active ? '3' : '2'} />
        <path d="M 150 263 L 158 259 L 158 267 Z" fill={q2Active ? '#f59e0b' : '#a3a3a3'} />
        <line x1="164" y1="200" x2="164" y2="263" stroke={q2BodyDiode ? '#22c55e' : '#a3a3a3'} strokeWidth={q2BodyDiode ? '3' : '1.5'} />
        <line x1="160" y1="200" x2="168" y2="200" stroke={q2BodyDiode ? '#22c55e' : '#a3a3a3'} strokeWidth={q2BodyDiode ? '3' : '1.5'} />
        <path d="M 164 200 L 160 215 L 168 215 Z" fill={q2BodyDiode ? '#22c55e' : '#a3a3a3'} />
        <text x="120" y="239" fill={q2Active ? '#f59e0b' : q2BodyDiode ? '#22c55e' : '#a3a3a3'} fontSize="12" fontFamily="JetBrains Mono, monospace" textAnchor="end">Q2</text>

        {/* Switch node */}
        <circle cx="150" cy="180" r="3.5" fill="#f5f5f5" stroke="#a3a3a3" strokeWidth="1" />
        <text x="124" y="184" fill="#f5f5f5" fontSize="10" fontFamily="JetBrains Mono, monospace" textAnchor="end">SW</text>

        {/* Lr */}
        <line x1="150" y1="180" x2="190" y2="180" stroke="#a3a3a3" strokeWidth="2" />
        <path d="M 190 180 q 5 -12 10 0 q 5 12 10 0 q 5 -12 10 0 q 5 12 10 0" fill="none" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round" />
        <line x1="220" y1="180" x2="250" y2="180" stroke="#14b8a6" strokeWidth="2" />
        <text x="205" y="162" fill="#14b8a6" fontSize="12" fontFamily="JetBrains Mono, monospace" textAnchor="middle">Lr</text>

        {/* Cr */}
        <line x1="250" y1="180" x2="270" y2="180" stroke="#f59e0b" strokeWidth="2" />
        <line x1="270" y1="164" x2="270" y2="196" stroke="#f59e0b" strokeWidth="2" />
        <line x1="280" y1="164" x2="280" y2="196" stroke="#f59e0b" strokeWidth="2" />
        <line x1="280" y1="180" x2="310" y2="180" stroke="#f59e0b" strokeWidth="2" />
        <text x="275" y="154" fill="#f59e0b" fontSize="12" fontFamily="JetBrains Mono, monospace" textAnchor="middle">Cr</text>

        {/* Transformer primary / Lm */}
        <line x1="310" y1="180" x2="340" y2="180" stroke="#a3a3a3" strokeWidth="2" />
        <g stroke="#a3a3a3" strokeWidth="2" fill="none">
          <path d="M 340 150 q 5 -12 10 0 q 5 12 10 0 q 5 -12 10 0 q 5 12 10 0" />
          <path d="M 380 150 q 5 -12 10 0 q 5 12 10 0 q 5 -12 10 0 q 5 12 10 0" />
          <line x1="368" y1="152" x2="368" y2="208" strokeDasharray="4 3" strokeWidth="1.5" />
          <line x1="376" y1="152" x2="376" y2="208" strokeDasharray="4 3" strokeWidth="1.5" />
        </g>
        <circle cx="342" cy="156" r="2.5" fill="#a3a3a3" />
        <circle cx="382" cy="156" r="2.5" fill="#a3a3a3" />
        <text x="412" y="170" fill="#a3a3a3" fontSize="12" fontFamily="JetBrains Mono, monospace" textAnchor="start">T</text>

        {/* Lm branch down */}
        <line x1="340" y1="180" x2="340" y2="250" stroke="#22c55e" strokeWidth="2" />
        <path d="M 340 250 q 5 -12 10 0 q 5 12 10 0 q 5 -12 10 0 q 5 12 10 0" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
        <line x1="350" y1="250" x2="350" y2="270" stroke="#22c55e" strokeWidth="2" />
        <line x1="340" y1="270" x2="380" y2="270" stroke="#22c55e" strokeWidth="2" />
        <text x="390" y="274" fill="#22c55e" fontSize="12" fontFamily="JetBrains Mono, monospace" textAnchor="start">Lm</text>

        {/* Transformer secondary */}
        <line x1="380" y1="180" x2="410" y2="180" stroke="#a3a3a3" strokeWidth="2" />
        <line x1="410" y1="150" x2="410" y2="210" stroke="#a3a3a3" strokeWidth="2" />
        <path d="M 410 150 q 5 -12 10 0 q 5 12 10 0 q 5 -12 10 0 q 5 12 10 0" fill="none" stroke="#a3a3a3" strokeWidth="2" strokeLinecap="round" />
        <path d="M 430 150 q 5 -12 10 0 q 5 12 10 0 q 5 -12 10 0 q 5 12 10 0" fill="none" stroke="#a3a3a3" strokeWidth="2" strokeLinecap="round" />
        <line x1="430" y1="150" x2="430" y2="210" stroke="#a3a3a3" strokeWidth="2" />

        {/* Rectifier diodes */}
        <line x1="430" y1="150" x2="460" y2="150" stroke="#a3a3a3" strokeWidth="2" />
        <line x1="460" y1="150" x2="460" y2="130" stroke={d1Active ? '#22c55e' : '#a3a3a3'} strokeWidth={d1Active ? '3' : '2'} />
        <path d="M 460 130 L 452 116 L 468 116 Z" fill={d1Active ? '#22c55e' : '#a3a3a3'} />
        <line x1="452" y1="116" x2="468" y2="116" stroke={d1Active ? '#22c55e' : '#a3a3a3'} strokeWidth={d1Active ? '3' : '2'} />
        <line x1="460" y1="116" x2="460" y2="96" stroke={d1Active ? '#22c55e' : '#a3a3a3'} strokeWidth={d1Active ? '3' : '2'} />
        <text x="475" y="126" fill={d1Active ? '#22c55e' : '#a3a3a3'} fontSize="11" fontFamily="JetBrains Mono, monospace">D1</text>

        <line x1="430" y1="210" x2="460" y2="210" stroke="#a3a3a3" strokeWidth="2" />
        <line x1="460" y1="210" x2="460" y2="230" stroke={d2Active ? '#22c55e' : '#a3a3a3'} strokeWidth={d2Active ? '3' : '2'} />
        <path d="M 460 230 L 452 244 L 468 244 Z" fill={d2Active ? '#22c55e' : '#a3a3a3'} />
        <line x1="452" y1="244" x2="468" y2="244" stroke={d2Active ? '#22c55e' : '#a3a3a3'} strokeWidth={d2Active ? '3' : '2'} />
        <line x1="460" y1="244" x2="460" y2="264" stroke={d2Active ? '#22c55e' : '#a3a3a3'} strokeWidth={d2Active ? '3' : '2'} />
        <text x="475" y="240" fill={d2Active ? '#22c55e' : '#a3a3a3'} fontSize="11" fontFamily="JetBrains Mono, monospace">D2</text>

        {/* Output capacitor / load */}
        <line x1="460" y1="96" x2="540" y2="96" stroke="#a3a3a3" strokeWidth="2" />
        <line x1="460" y1="264" x2="540" y2="264" stroke="#a3a3a3" strokeWidth="2" />
        <line x1="540" y1="96" x2="540" y2="120" stroke="#a3a3a3" strokeWidth="2" />
        <line x1="534" y1="120" x2="546" y2="120" stroke="#a3a3a3" strokeWidth="2" />
        <line x1="534" y1="132" x2="546" y2="132" stroke="#a3a3a3" strokeWidth="2" />
        <line x1="540" y1="132" x2="540" y2="264" stroke="#a3a3a3" strokeWidth="2" />
        <text x="552" y="132" fill="#a3a3a3" fontSize="12" fontFamily="JetBrains Mono, monospace">Co/Ro</text>
        <text x="552" y="108" fill="#a3a3a3" fontSize="10" fontFamily="JetBrains Mono, monospace">Vo+</text>
        <text x="552" y="258" fill="#a3a3a3" fontSize="10" fontFamily="JetBrains Mono, monospace">Vo-</text>

        {/* Current path */}
        <path
          d={currentPath.d}
          fill="none"
          stroke={currentPath.color}
          strokeWidth="3"
          strokeDasharray="8 6"
          strokeLinecap="round"
          markerEnd={currentPath.marker}
          opacity="0.85"
          className="dash-flow"
        />
      </svg>
    </div>
  )
}
'''

    # Build new ZVSZoomAnimatedSVG (lines 675-753, 0-indexed: 674-752)
    zvs_svg = '''function ZVSZoomAnimatedSVG({ idSuffix = '' }: { idSuffix?: string }) {
  const tA = 50
  const tB = 70
  const tC = 100
  const tD = 130

  return (
    <svg viewBox="0 0 440 260" className="w-full max-w-xl mx-auto h-auto" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id={`arrowTealZvs${idSuffix}`} markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
          <path d="M 0 0 L 7 3.5 L 0 7 L 1.5 3.5 Z" fill="#14b8a6" />
        </marker>
        <marker id={`arrowGreenZvs${idSuffix}`} markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
          <path d="M 0 0 L 7 3.5 L 0 7 L 1.5 3.5 Z" fill="#22c55e" />
        </marker>
        <marker id={`arrowRedZvs${idSuffix}`} markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
          <path d="M 0 0 L 7 3.5 L 0 7 L 1.5 3.5 Z" fill="#ef4444" />
        </marker>
        <linearGradient id={`vdsFallZvs${idSuffix}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
      </defs>
      <g stroke="#404040" strokeWidth="1" opacity="0.2">
        {[40, 80, 120, 160, 200, 240, 280, 320, 360, 400].map((x) => (
          <line key={`v${x}`} x1={x} y1="10" x2={x} y2="180" />
        ))}
        {[20, 60, 100, 140, 180].map((y) => (
          <line key={`h${y}`} x1="40" y1={y} x2="400" y2={y} />
        ))}
      </g>

      {/* Dead time zone */}
      <rect x={tA} y="10" width={tD - tA} height="140" fill="rgba(245,158,11,0.12)" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 2" opacity="0.6" />
      <text x={(tA + tD) / 2} y="24" fill="#f59e0b" fontSize="9" textAnchor="middle" fontFamily="JetBrains Mono, monospace">死区时间</text>

      {/* Body diode conduction zone */}
      <rect x={tC} y="10" width={tD - tC} height="140" fill="rgba(239,68,68,0.12)" stroke="#ef4444" strokeWidth="1" strokeDasharray="3 2" opacity="0.6" />
      <text x={(tC + tD) / 2} y="24" fill="#ef4444" fontSize="9" textAnchor="middle" fontFamily="JetBrains Mono, monospace">体二极管导通</text>

      {/* Vgs_Q2 */}
      <text x="32" y="16" fill="#a3a3a3" fontSize="11" textAnchor="end" dominantBaseline="middle" fontFamily="JetBrains Mono, monospace">Vgs_Q2</text>
      <line x1="40" y1="22" x2="400" y2="22" stroke="#525252" strokeWidth="1" />
      <path d={`M 40 22 L ${tA} 22 L ${tD} 22 L ${tD} 6 L 200 6 L 200 22 L 400 22`} fill="none" stroke="#14b8a6" strokeWidth="2" />
      <text x={tD + 8} y="14" fill="#14b8a6" fontSize="10" fontFamily="JetBrains Mono, monospace">Vgs上升</text>

      {/* Vds_Q2 */}
      <text x="32" y="58" fill="#a3a3a3" fontSize="11" textAnchor="end" dominantBaseline="middle" fontFamily="JetBrains Mono, monospace">Vds_Q2</text>
      <line x1="40" y1="64" x2="400" y2="64" stroke="#525252" strokeWidth="1" />
      <path d={`M 40 64 L ${tA} 64 L ${tB} 64 L ${tC} 90 L ${tD} 90 L 200 90 L 200 64 L 400 64`} fill="none" stroke="#ef4444" strokeWidth="2" />
      <line x1={tB} y1="64" x2={tC} y2="90" stroke={`url(#vdsFallZvs${idSuffix})`} strokeWidth="2" />
      <text x={tB + 5} y="56" fill="#ef4444" fontSize="9" fontFamily="JetBrains Mono, monospace">Vin</text>
      <text x={tC + 5} y="96" fill="#22c55e" fontSize="9" fontFamily="JetBrains Mono, monospace">0V</text>

      {/* Ir */}
      <text x="32" y="100" fill="#a3a3a3" fontSize="11" textAnchor="end" dominantBaseline="middle" fontFamily="JetBrains Mono, monospace">Ir</text>
      <line x1="40" y1="106" x2="400" y2="106" stroke="#525252" strokeWidth="1" />
      <path d={`M 40 106 L ${tA} 106 L ${tD} 96`} fill="none" stroke="#f59e0b" strokeWidth="2" className="dash-flow" />
      <text x={tA + 8} y="100" fill="#f59e0b" fontSize="9" fontFamily="JetBrains Mono, monospace">谐振电流续流</text>

      {/* Timing annotations */}
      <line x1={tA} y1="150" x2={tA} y2="180" stroke="#525252" strokeWidth="1" strokeDasharray="2 2" />
      <text x={tA} y="192" fill="#14b8a6" fontSize="9" textAnchor="middle" fontFamily="JetBrains Mono, monospace">tA: Q1关断</text>

      <line x1={tB} y1="150" x2={tB} y2="180" stroke="#525252" strokeWidth="1" strokeDasharray="2 2" />
      <text x={tB} y="192" fill="#f59e0b" fontSize="9" textAnchor="middle" fontFamily="JetBrains Mono, monospace">tB: Vds开始下降</text>

      <line x1={tC} y1="150" x2={tC} y2="180" stroke="#525252" strokeWidth="1" strokeDasharray="2 2" />
      <text x={tC} y="192" fill="#ef4444" fontSize="9" textAnchor="middle" fontFamily="JetBrains Mono, monospace">tC: Vds=0, 体二极管导通</text>

      <line x1={tD} y1="150" x2={tD} y2="180" stroke="#525252" strokeWidth="1" strokeDasharray="2 2" />
      <text x={tD} y="192" fill="#22c55e" fontSize="9" textAnchor="middle" fontFamily="JetBrains Mono, monospace">tD: Vgs上升, ZVS导通</text>

      {/* Arrow annotations */}
      <line x1={tC} y1="78" x2={tC} y2="92" stroke="#22c55e" strokeWidth="1" strokeDasharray="2 2" markerEnd={`url(#arrowGreenZvs${idSuffix})`} />
      <text x={tC + 8} y="86" fill="#22c55e" fontSize="9" fontFamily="JetBrains Mono, monospace">Vds=0</text>

      <line x1={tD} y1="28" x2={tD} y2="10" stroke="#14b8a6" strokeWidth="1" strokeDasharray="2 2" markerEnd={`url(#arrowTealZvs${idSuffix})`} />
      <text x={tD + 8} y="20" fill="#14b8a6" fontSize="9" fontFamily="JetBrains Mono, monospace">ZVS导通</text>

      <line x1={tA} y1="78" x2={tA} y2="64" stroke="#ef4444" strokeWidth="1" strokeDasharray="2 2" markerEnd={`url(#arrowRedZvs${idSuffix})`} />
      <text x={tA + 8} y="72" fill="#ef4444" fontSize="9" fontFamily="JetBrains Mono, monospace">Q1关断</text>

      {/* Description */}
      <text x="220" y="220" fill="#a3a3a3" fontSize="10" textAnchor="middle">
        死区时间内，谐振电流经Q2体二极管续流，将Vds_Q2钳位至接近0V，实现ZVS。
      </text>
      <text x="220" y="235" fill="#a3a3a3" fontSize="10" textAnchor="middle">
        tA→tB: Coss充放电 | tB→tC: Vds线性下降 | tC→tD: 体二极管导通窗口
      </text>
    </svg>
  )
}
'''

    # Assemble new file
    # Lines before SwitchingAnimationSVG (1-321, 0-indexed 0-320)
    new_lines = lines[:321]
    
    # Add new SwitchingAnimationSVG
    new_lines.append(switching_svg)
    
    # Add newline separator
    new_lines.append('\n')
    
    # Add new CurrentFlowCircuitSVG
    new_lines.append(current_flow_svg)
    
    # Add newline separator
    new_lines.append('\n')
    
    # Add new ZVSZoomAnimatedSVG
    new_lines.append(zvs_svg)
    
    # Lines after ZVSZoomAnimatedSVG (754 onwards, 0-indexed 753+)
    new_lines.extend(lines[753:])
    
    # Write back
    with open(filepath, "w", encoding="utf-8") as f:
        f.writelines(new_lines)
    
    return {
        "status": "ok",
        "original_lines": len(lines),
        "new_lines": len(new_lines),
        "switching_svg_lines": switching_svg.count('\n'),
        "current_flow_svg_lines": current_flow_svg.count('\n'),
        "zvs_svg_lines": zvs_svg.count('\n'),
    }
