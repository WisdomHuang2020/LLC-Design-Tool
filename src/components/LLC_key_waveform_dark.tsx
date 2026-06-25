export function LLC_key_waveform_dark() {
  return (
    <div className="flex justify-center w-full">
      <div
        className="w-full max-w-3xl h-auto"
        dangerouslySetInnerHTML={{
          __html: `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 660 720">
  <!-- 6个相位背景色带 -->
  <g opacity="0.08">
    <!-- Q1 ON: t1→t2, t1'→t2' -->
    <rect x="60" y="10" width="110" height="560" fill="#14b8a6"/>
    <rect x="520" y="10" width="60" height="560" fill="#14b8a6"/>
    <!-- 死区: t2→t3, t5→t6 -->
    <rect x="170" y="10" width="60" height="560" fill="#f59e0b"/>
    <rect x="420" y="10" width="60" height="560" fill="#f59e0b"/>
    <!-- 体二极管导通: t3→t4, t6→t1' -->
    <rect x="230" y="10" width="80" height="560" fill="#22c55e"/>
    <rect x="480" y="10" width="40" height="560" fill="#22c55e"/>
  </g>

  <!-- Grid -->
  <g stroke="#404040" stroke-width="1" opacity="0.25">
    <!-- Vertical grid lines -->
    <line x1="60" y1="10" x2="60" y2="570" />
    <line x1="100" y1="10" x2="100" y2="570" />
    <line x1="140" y1="10" x2="140" y2="570" />
    <line x1="180" y1="10" x2="180" y2="570" />
    <line x1="220" y1="10" x2="220" y2="570" />
    <line x1="260" y1="10" x2="260" y2="570" />
    <line x1="300" y1="10" x2="300" y2="570" />
    <line x1="340" y1="10" x2="340" y2="570" />
    <line x1="380" y1="10" x2="380" y2="570" />
    <line x1="420" y1="10" x2="420" y2="570" />
    <line x1="460" y1="10" x2="460" y2="570" />
    <line x1="500" y1="10" x2="500" y2="570" />
    <line x1="540" y1="10" x2="540" y2="570" />
    <line x1="580" y1="10" x2="580" y2="570" />
    <!-- Horizontal grid lines -->
    <line x1="60" y1="10" x2="580" y2="10" />
    <line x1="60" y1="58" x2="580" y2="58" />
    <line x1="60" y1="106" x2="580" y2="106" />
    <line x1="60" y1="154" x2="580" y2="154" />
    <line x1="60" y1="202" x2="580" y2="202" />
    <line x1="60" y1="250" x2="580" y2="250" />
    <line x1="60" y1="298" x2="580" y2="298" />
    <line x1="60" y1="346" x2="580" y2="346" />
    <line x1="60" y1="394" x2="580" y2="394" />
    <line x1="60" y1="442" x2="580" y2="442" />
    <line x1="60" y1="490" x2="580" y2="490" />
    <line x1="60" y1="538" x2="580" y2="538" />
  </g>

  <defs>
    <marker id="arrTeal" marker-width="6" marker-height="6" refX="3" refY="3" orient="auto">
      <circle cx="3" cy="3" r="2" fill="#14b8a6"/>
    </marker>
  </defs>

  <!-- Vgs_Q1 -->
  <g transform="translate(0, 0)">
    <text x="48" y="28" fill="#a3a3a3" font-size="12" text-anchor="end" dominant-baseline="middle">Vgs_Q1</text>
    <line x1="60" y1="40" x2="580" y2="40" stroke="#525252" stroke-width="1"/>
    <path d="M 60 40 L 60 16 L 170 16 L 170 40 L 520 40 L 520 16 L 580 16 L 580 40" fill="none" stroke="#14b8a6" stroke-width="2"/>
    <text x="592" y="28" fill="#14b8a6" font-size="11" dominant-baseline="middle">Q1</text>
  </g>

  <!-- Vgs_Q2 -->
  <g transform="translate(0, 80)">
    <text x="48" y="28" fill="#a3a3a3" font-size="12" text-anchor="end" dominant-baseline="middle">Vgs_Q2</text>
    <line x1="60" y1="40" x2="580" y2="40" stroke="#525252" stroke-width="1"/>
    <path d="M 60 40 L 310 40 L 310 16 L 420 16 L 420 40 L 580 40" fill="none" stroke="#f59e0b" stroke-width="2" stroke-dasharray="5 4"/>
    <text x="592" y="28" fill="#f59e0b" font-size="11" dominant-baseline="middle">Q2</text>
  </g>

  <!-- Ir -->
  <g transform="translate(0, 160)">
    <text x="48" y="28" fill="#a3a3a3" font-size="12" text-anchor="end" dominant-baseline="middle">Ir</text>
    <line x1="60" y1="40" x2="580" y2="40" stroke="#525252" stroke-width="1"/>
    <path d="M 60 60 C 100 55 130 40 170 20 C 190 12 210 8 230 10 C 250 14 280 25 310 30 C 350 38 380 55 420 60 C 440 62 460 68 480 70 C 495 68 510 55 520 60 C 540 55 560 40 580 30" fill="none" stroke="#14b8a6" stroke-width="2" stroke-dasharray="6 4"/>
    <text x="592" y="28" fill="#14b8a6" font-size="11" dominant-baseline="middle">谐振电流</text>
  </g>

  <!-- Im -->
  <g transform="translate(0, 250)">
    <text x="48" y="28" fill="#a3a3a3" font-size="12" text-anchor="end" dominant-baseline="middle">Im</text>
    <line x1="60" y1="40" x2="580" y2="40" stroke="#525252" stroke-width="1"/>
    <path d="M 60 45 L 170 12 L 230 18 L 310 25 L 420 55 L 480 48 L 520 42 L 580 12" fill="none" stroke="#22c55e" stroke-width="2" stroke-dasharray="6 4"/>
    <text x="592" y="28" fill="#22c55e" font-size="11" dominant-baseline="middle">励磁电流（三角波）</text>
  </g>

  <!-- Vds_Q1 -->
  <g transform="translate(0, 340)">
    <text x="48" y="28" fill="#a3a3a3" font-size="12" text-anchor="end" dominant-baseline="middle">Vds_Q1</text>
    <line x1="60" y1="40" x2="580" y2="40" stroke="#525252" stroke-width="1"/>
    <path d="M 60 40 L 170 40 L 230 10 L 420 10 L 480 40 L 580 40" fill="none" stroke="#ef4444" stroke-width="2"/>
    <text x="592" y="28" fill="#ef4444" font-size="11" dominant-baseline="middle">漏极电压</text>
  </g>

  <!-- Isec -->
  <g transform="translate(0, 430)">
    <text x="48" y="28" fill="#a3a3a3" font-size="12" text-anchor="end" dominant-baseline="middle">Isec</text>
    <line x1="60" y1="40" x2="580" y2="40" stroke="#525252" stroke-width="1"/>
    <path d="M 60 40 C 90 20 110 8 140 5 C 170 8 190 20 210 40" fill="none" stroke="#8b5cf6" stroke-width="2"/>
    <path d="M 520 40 C 540 20 555 8 570 5 C 580 8 580 20 580 40" fill="none" stroke="#8b5cf6" stroke-width="2"/>
    <path d="M 310 40 C 340 20 360 8 390 5 C 420 8 440 20 460 40" fill="none" stroke="#8b5cf6" stroke-width="2" stroke-dasharray="4 3"/>
    <text x="592" y="28" fill="#8b5cf6" font-size="11" dominant-baseline="middle">副边电流</text>
  </g>

  <!-- Io -->
  <g transform="translate(0, 520)">
    <text x="48" y="28" fill="#a3a3a3" font-size="12" text-anchor="end" dominant-baseline="middle">Io</text>
    <line x1="60" y1="40" x2="580" y2="40" stroke="#525252" stroke-width="1"/>
    <path d="M 60 40 L 60 38 L 200 38 L 200 40 L 340 40 L 340 38 L 480 38 L 480 40 L 580 40" fill="none" stroke="#f59e0b" stroke-width="2"/>
    <text x="592" y="28" fill="#f59e0b" font-size="11" dominant-baseline="middle">输出电流</text>
  </g>

  <!-- 时间轴 -->
  <line x1="60" y1="570" x2="580" y2="570" stroke="#525252" stroke-width="2" marker-end="url(#arrTeal)"/>
  <text x="320" y="595" fill="#737373" font-size="11" text-anchor="middle">时间 t →</text>

  <!-- 时间标注虚线 -->
  <line x1="60" y1="10" x2="60" y2="580" stroke="#a3a3a3" stroke-width="1" stroke-dasharray="3 2" opacity="0.5"/>
  <line x1="170" y1="10" x2="170" y2="580" stroke="#a3a3a3" stroke-width="1" stroke-dasharray="3 2" opacity="0.5"/>
  <line x1="230" y1="10" x2="230" y2="580" stroke="#a3a3a3" stroke-width="1" stroke-dasharray="3 2" opacity="0.5"/>
  <line x1="310" y1="10" x2="310" y2="580" stroke="#a3a3a3" stroke-width="1" stroke-dasharray="3 2" opacity="0.5"/>
  <line x1="420" y1="10" x2="420" y2="580" stroke="#a3a3a3" stroke-width="1" stroke-dasharray="3 2" opacity="0.5"/>
  <line x1="480" y1="10" x2="480" y2="580" stroke="#a3a3a3" stroke-width="1" stroke-dasharray="3 2" opacity="0.5"/>
  <line x1="520" y1="10" x2="520" y2="580" stroke="#a3a3a3" stroke-width="1" stroke-dasharray="3 2" opacity="0.5"/>
  <line x1="580" y1="10" x2="580" y2="580" stroke="#a3a3a3" stroke-width="1" stroke-dasharray="3 2" opacity="0.5"/>

  <!-- 时间标注文字 -->
  <text x="60" y="615" fill="#a3a3a3" font-size="11" text-anchor="middle">t1</text>
  <text x="170" y="615" fill="#a3a3a3" font-size="11" text-anchor="middle">t2</text>
  <text x="230" y="615" fill="#a3a3a3" font-size="11" text-anchor="middle">t3</text>
  <text x="310" y="615" fill="#a3a3a3" font-size="11" text-anchor="middle">t4</text>
  <text x="420" y="615" fill="#a3a3a3" font-size="11" text-anchor="middle">t5</text>
  <text x="480" y="615" fill="#a3a3a3" font-size="11" text-anchor="middle">t6</text>
  <text x="520" y="615" fill="#a3a3a3" font-size="11" text-anchor="middle">t1'</text>
  <text x="580" y="615" fill="#a3a3a3" font-size="11" text-anchor="middle">t2'</text>

  <!-- 相位标注文字 -->
  <text x="115" y="635" fill="#14b8a3" font-size="11" text-anchor="middle">Q1 ON</text>
  <text x="200" y="635" fill="#f59e0b" font-size="11" text-anchor="middle">死区</text>
  <text x="270" y="635" fill="#22c55e" font-size="11" text-anchor="middle">D2导通</text>
  <text x="365" y="635" fill="#f59e0b" font-size="11" text-anchor="middle">Q2 ON</text>
  <text x="450" y="635" fill="#f59e0b" font-size="11" text-anchor="middle">死区</text>
  <text x="500" y="635" fill="#22c55e" font-size="11" text-anchor="middle">D1导通</text>
  <text x="550" y="635" fill="#14b8a3" font-size="11" text-anchor="middle">Q1 ON</text>

  <!-- 底部说明文字 -->
  <text x="60" y="655" fill="#737373" font-size="10" text-anchor="start">t1→t2: Q1导通, 正半周能量传输</text>
  <text x="230" y="655" fill="#737373" font-size="10" text-anchor="middle">t2→t3: 死区, Coss充放电</text>
  <text x="310" y="655" fill="#737373" font-size="10" text-anchor="middle">t3→t4: Q2体二极管导通, ZVS准备</text>
  <text x="60" y="675" fill="#737373" font-size="10" text-anchor="start">t4→t5: Q2导通, 负半周能量传输</text>
  <text x="230" y="675" fill="#737373" font-size="10" text-anchor="middle">t5→t6: 死区, Coss充放电</text>
  <text x="420" y="675" fill="#737373" font-size="10" text-anchor="middle">t6→t1': Q1体二极管导通, ZVS准备</text>
</svg>`
        }}
      />
    </div>
  );
}
