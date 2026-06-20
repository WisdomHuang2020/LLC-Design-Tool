# LLC Resonant Converter Design Tool — Design Document

## Product Concept

A professional, interactive web-based learning and design tool for LLC resonant converter power supply topology. Target users: power electronics engineers, students, and researchers who need to understand, design, and optimize LLC resonant converters.

The site serves dual purpose:
1. **Learning hub**: Comprehensive theoretical coverage with animated circuit diagrams, step-by-step formula derivations, and interactive visualizations.
2. **Design tool**: Input-driven parameter calculator with real-time curve plotting, optimization guidance, and exportable design reports.

## Template Choice

No bundled template. Greenfield build from Vite + React + TypeScript + Tailwind CSS + shadcn/ui for maximum control over the technical/engineering aesthetic. The design should feel like a modern engineering CAD/EDA tool — clean, precise, information-dense, with strong visual hierarchy for mathematical content.

## Page/Routes Map

| Route | Page | Purpose | Worker |
|-------|------|---------|--------|
| `/` | Home | Hero + feature cards + quick navigation to all sections | scaffold |
| `/fundamentals` | Resonant Fundamentals | LC/LLC resonant theory, circuit basics, terminology | page-fundamentals |
| `/operation` | Operating Principles | Half-bridge/full-bridge topology, switching modes, waveforms | page-operation |
| `/derivations` | Formula Derivations | Complete mathematical derivation of gain equation, Q factor, resonant frequencies, impedance | page-derivations |
| `/curves` | Characteristic Curves | Interactive gain curve, impedance curve, phase plot with parameter sliders | page-curves |
| `/designer` | Design Tool | Input form (Vin, Vout, Pout, fsw), auto-calculate resonant parameters, optimization suggestions | page-designer |
| `/report` | Report Preview | Generated design report preview with download (PDF/Markdown) | page-report |

## Color Palette

**Primary**: `#0f766e` (teal-700) — engineering precision, calm authority
**Primary Light**: `#14b8a6` (teal-500) — interactive highlights, sliders
**Primary Dark**: `#134e4a` (teal-900) — headers, dark sections

**Accent**: `#f59e0b` (amber-500) — warnings, critical values, optimization tips
**Accent Light**: `#fbbf24` (amber-400) — hover states

**Background**: `#0a0a0a` (near-black) — main canvas, dark mode feel
**Surface**: `#171717` (neutral-900) — cards, panels, code blocks
**Surface Elevated**: `#262626` (neutral-800) — modals, elevated cards

**Text Primary**: `#f5f5f5` (neutral-100) — main body text
**Text Secondary**: `#a3a3a3` (neutral-400) — captions, labels
**Text Muted**: `#737373` (neutral-500) — disabled, footnotes

**Success**: `#22c55e` (green-500) — valid parameters, good margins
**Danger**: `#ef4444` (red-500) — out-of-range, errors

**Border**: `#404040` (neutral-700) — dividers, card borders
**Border Light**: `#525252` (neutral-600) — hover borders

## Typography

- **Font Family**: `Inter` for UI, `JetBrains Mono` for code/math (loaded via Google Fonts)
- **Heading H1**: 36px / 700 weight / tracking-tight / line-height 1.2
- **Heading H2**: 28px / 600 weight / tracking-tight / line-height 1.3
- **Heading H3**: 20px / 600 weight / line-height 1.4
- **Body**: 16px / 400 weight / line-height 1.6
- **Caption**: 14px / 400 weight / line-height 1.5
- **Code/Math**: 15px / 400 weight / JetBrains Mono / line-height 1.6
- **Nav**: 14px / 500 weight / uppercase tracking-wider

## Layout Rules

- **Max Width**: 1280px for content, 100% for full-width sections (curves, designer)
- **Grid**: 12-column on desktop, 6 on tablet, 1 on mobile
- **Section Padding**: 80px vertical on desktop, 48px on mobile
- **Card Padding**: 24px internal, 16px gap between cards
- **Border Radius**: 8px for cards/buttons, 4px for inline elements, 12px for modals
- **Sidebar**: Fixed 280px left sidebar on desktop for in-page navigation (anchor links), collapsible on mobile

## Shared Components

### Header/Nav
- Fixed top bar, 64px height, surface background with bottom border
- Logo + title on left, nav links center, dark/light toggle on right
- Nav links: Home, Fundamentals, Operation, Derivations, Curves, Designer, Report
- Active state: primary color underline + text color
- Mobile: hamburger menu with sheet overlay

### Sidebar (in-page TOC)
- Fixed left, 280px width, collapsible on tablet/mobile
- Auto-generated from section headings via IntersectionObserver
- Active section highlighted with primary color left border
- Smooth scroll to section on click

### Footer
- Full width, surface background, 64px padding
- Links grouped by category, copyright, GitHub link

### MathBlock
- Dark surface card with subtle border
- Left accent border (4px primary color) for theorem/derivation blocks
- Supports LaTeX rendering via KaTeX
- Copy button for equations

### ParameterCard
- Surface card with labeled input fields
- Unit suffixes (Hz, V, A, Ω, H, F)
- Real-time validation with color feedback (green valid, red invalid, amber warning)
- Tooltip with parameter description on hover

### CurveCanvas
- Full-width responsive canvas using Chart.js or Recharts
- Dark theme styling, grid lines in muted color
- Interactive: hover tooltips, legend toggle, zoom
- Parameter overlay panel on the right or bottom

### InfoTooltip
- Small info icon, hover shows description popover
- Used for technical terms and parameter explanations

### DownloadModal
- Modal for report preview
- Two tabs: Preview (HTML render) / Download (PDF + Markdown buttons)
- PDF generation via html2pdf.js or jsPDF

## Interaction Language

- **Hover**: Buttons scale to 1.02, cards get border-light color, 200ms ease-out
- **Focus**: 2px primary color ring offset by 2px
- **Active/Pressed**: Scale to 0.98, 100ms
- **Section Entrance**: Fade up (translateY 20px → 0, opacity 0 → 1), 500ms, ease-out, staggered by 100ms for child elements
- **Tab Switch**: Crossfade 200ms
- **Curve Update**: Smooth transition on parameter change, 300ms
- **Loading**: Skeleton pulse on cards, spinner on curve canvas
- **Math Reveal**: Equations fade in line by line on scroll trigger

## Dependencies

- `react`, `react-dom`, `react-router-dom` (HashRouter)
- `typescript`, `vite`
- `tailwindcss`, `@tailwindcss/vite` (or postcss), `tailwind-merge`, `clsx`
- `@radix-ui/*` (via shadcn/ui)
- `lucide-react` (icons)
- `recharts` (interactive curves)
- `katex` (math rendering)
- `html2pdf.js` or `jspdf` + `html2canvas` (PDF generation)
- `framer-motion` (animations)
- `shadcn/ui` components: button, card, input, slider, tabs, dialog, tooltip, sheet, accordion, select, label, separator, badge, scroll-area, table

## Asset Manifest

No custom images needed. All visuals are:
- SVG circuit diagrams (inline or component-based)
- Animated CSS/SVG waveforms
- Programmatically generated charts (Recharts)
- KaTeX-rendered equations

SVG Circuit Assets (to be drawn as inline React components):
- `HalfBridgeLLC.svg` (inline component) — half-bridge LLC topology
- `FullBridgeLLC.svg` (inline component) — full-bridge LLC topology
- `ResonantTank.svg` — Lr, Cr, Lm resonant tank detail
- `Waveforms.svg` — key voltage/current waveforms

## Responsive Behavior

- **Desktop (≥1280px)**: Full sidebar + main content, max-width container
- **Tablet (768–1279px)**: Collapsible sidebar (drawer), 2-column cards
- **Mobile (<768px)**: No sidebar, single column, hamburger nav, stacked inputs
- **Curve Canvas**: Full-width on all sizes, legend becomes bottom scrollable on mobile
- **Math Blocks**: Horizontal scroll on overflow, smaller font on mobile

## Worker Grouping

1. **Designer** (plan agent): Creates design.md + per-page specs
2. **Scaffold** (main agent or coder): Vite init, Tailwind, shadcn, routing, global layout, home page
3. **Fundamentals + Operation** (coder): Pages with static content, SVG diagrams, math blocks
4. **Derivations** (coder): Heavy math content, KaTeX integration, step-by-step derivations
5. **Curves + Designer** (coder): Interactive charts, parameter inputs, calculation engine
6. **Report** (coder): Report generation, PDF export, document preview

---

## Page: Home (`/`)

### Sections
1. **Hero**: Full-width dark background, animated circuit SVG background (subtle), title "LLC Resonant Converter Design Tool", subtitle "从理论到设计 — 完整的LLC谐振变换器学习与工程化工具", CTA buttons: "开始学习" → /fundamentals, "打开设计工具" → /designer
2. **Feature Grid**: 4 cards (2×2 desktop, 1×4 mobile): 谐振基础 / 工作原理 / 公式推导 / 设计工具 — each with icon, brief description, link
3. **Quick Preview**: Embedded mini-curve widget (non-interactive preview) showing gain vs frequency curve, click to /curves
4. **Footer**: Links to all pages, version info

---

## Page: Fundamentals (`/fundamentals`)

### Sections
1. **What is Resonance?**: LC tank circuit basics, resonant frequency formula, impedance behavior, animated SVG of LC tank with sinusoidal waveforms
2. **Series vs Parallel Resonance**: Comparison table, impedance curves, Q factor definition, bandwidth
3. **LLC Resonant Tank**: The three components Lr, Cr, Lm, their roles, equivalent circuit model, why LLC not just LC
4. **Key Parameters**: Definitions table — resonant frequency fr, normalized frequency fn, inductance ratio λ (Lm/Lr), quality factor Q, characteristic impedance Zr
5. **Topology Variants**: Half-bridge vs full-bridge, transformer integration, center-tapped vs bridge rectifier

### Math Content
- fr = 1 / (2π√(Lr×Cr))
- Zr = √(Lr/Cr)
- Q = Zr / Rac = √(Lr/Cr) / Rac
- λ = Lm / Lr

---

## Page: Operation (`/operation`)

### Sections
1. **Switching Modes**: 
   - Mode 1 (f < fr1): Below first resonance, ZVS possible, details
   - Mode 2 (fr1 < f < fr2): Between resonances, optimal operation
   - Mode 3 (f > fr2): Above second resonance, Lm不参与
   - Animated mode transition diagram
2. **Key Waveforms**: 
   - Vgs (gate drive), Vds (drain voltage), resonant current Ir, magnetizing current Im, output current Io
   - SVG waveform diagrams with time axes, labels
3. **ZVS Conditions**: Why LLC achieves ZVS, necessary conditions, body diode conduction, dead time requirements
4. **Gain Characteristics**: Voltage gain M = 2nVout/Vin, how it varies with frequency and load, peak gain point
5. **Design Trade-offs**: Efficiency vs switching frequency, conduction loss vs switching loss, transformer size optimization

---

## Page: Derivations (`/derivations`)

### Sections (each with full derivation, step-by-step, with justifications)
1. **FHA (First Harmonic Approximation)**: Why FHA is used, Fourier analysis of square wave, assumptions
2. **Equivalent AC Circuit Model**: Converting rectifier + load to equivalent Rac, derivation of Rac = 8n²Rload/π²
3. **Voltage Gain Derivation**: Starting from FHA, deriving the complete gain equation:
   - M(fn, λ, Q) = | (fn² × λ) / √[ (fn²(1+λ)-1)² + (fn×Q×(fn²-1))² × λ² ] |
   - Step-by-step derivation with circuit analysis, complex impedance, voltage divider
4. **Resonant Frequencies**: Derivation of fr1 = 1/(2π√(LrCr)) and fr2 = 1/(2π√((Lr+Lm)Cr))
5. **Peak Gain**: Condition for maximum gain, solving dM/dfn = 0, expression for peak gain
6. **Impedance Analysis**: Input impedance Zin derivation, resonant condition, inductive/capacitive region boundary
7. **Current Stress**: Derivation of primary current, secondary current, RMS values, peak current at switching transitions
8. **Component Selection**: Lr, Cr, Lm selection formulas based on Q, λ, and power requirements

### Layout
- Each derivation is a collapsible accordion or numbered section
- Key steps highlighted with colored boxes
- Final boxed formula at the end of each section
- Interactive parameter substitution widget: enter values, see formula evaluate

---

## Page: Curves (`/curves`)

### Sections
1. **Gain vs Frequency**: Main interactive chart
   - X-axis: Normalized frequency fn (0.5 to 2.0)
   - Y-axis: Voltage gain M (0 to 3.0)
   - Multiple curves for different Q values (0.2, 0.5, 1.0, 2.0, 5.0)
   - Sliders: λ (0.1 to 0.5), Q (0.1 to 5.0)
   - Highlight point: current operating frequency, hover tooltip shows exact gain
   - Mark fr1 and fr2 as vertical reference lines
2. **Impedance vs Frequency**: 
   - Input impedance magnitude and phase vs frequency
   - Shows resonant dips and peaks
3. **3D Gain Surface** (optional): Gain as function of fn and Q, λ fixed, interactive rotation
4. **Load Regulation**: Gain vs load (Q) at fixed frequency, showing how load affects gain
5. **Phase Plot**: Phase angle of input impedance vs frequency, critical for ZVS region identification

### Controls Panel
- Left panel: parameter inputs (λ slider, Q slider, fn range)
- Right/main: chart canvas
- Top: toggle which curves to display (gain, impedance, phase)
- Export: PNG download of current chart

---

## Page: Designer (`/designer`)

### Sections
1. **Input Requirements Form**:
   - Input Voltage: Vin_min, Vin_max, Vin_nom (V)
   - Output Voltage: Vout (V)
   - Output Power: Pout (W)
   - Target Efficiency: η (%)
   - Switching Frequency: fsw (kHz), or target range
   - Topology: Half-bridge / Full-bridge
   - Rectifier: Full-wave / Center-tapped / Synchronous
   - Load Range: min to max (%)
   - "Calculate" button
2. **Calculated Results Panel**:
   - Turns ratio n
   - Resonant frequency fr
   - Lr, Cr, Lm values
   - Q, λ values
   - Peak gain required vs achieved
   - ZVS margin check
   - Current stress estimates
3. **Optimization Suggestions**:
   - If Q too high → suggest lower Lr or higher Cr
   - If peak gain insufficient → suggest higher λ or lower fr
   - If efficiency target not met → suggest frequency/loss trade-off
   - If ZVS margin small → suggest dead time adjustment
   - Color-coded: green (good), amber (warning), red (critical)
4. **Component Selection Table**:
   - Standard values for Lr, Cr from E series
   - Nearest available Lm for transformer
   - MOSFET voltage/current rating suggestions
   - Diode/rectifier selection
5. **Waveform Preview**:
   - Estimated key waveforms based on calculated parameters
   - SVG/Canvas drawing of Vds, Ir, Im

---

## Page: Report (`/report`)

### Sections
1. **Report Preview**:
   - Full HTML render of the design report
   - Sections: Design Specifications, Calculated Parameters, Component Selection, Operating Analysis, Optimization Notes, Waveform Summary, Recommendations
   - Professional engineering report formatting
2. **Download Options**:
   - Download as PDF (styled print CSS + html2pdf)
   - Download as Markdown (.md file)
   - Copy to clipboard
3. **Custom Notes**: Textarea for user to add custom notes before generating report

### Report Content Structure (auto-generated from designer page data)
- Header: Project title, date, designer
- Section 1: Input Specifications (table)
- Section 2: Derived Parameters (table with formulas)
- Section 3: Component Values (table with standard values)
- Section 4: Gain Analysis (gain curve screenshot or embedded chart)
- Section 5: Operating Point Analysis (waveform descriptions)
- Section 6: Stress Analysis (current, voltage stress table)
- Section 7: Optimization Summary (bullet list from suggestions)
- Section 8: Recommendations (next steps, simulation, prototype)

---

## Design Tool State Architecture (Shared Contract)

The designer page and report page share state. Store in a React context or URL query params for shareability.

```typescript
interface DesignParameters {
  vinMin: number;      // V
  vinMax: number;      // V
  vinNom: number;      // V
  vout: number;        // V
  pout: number;        // W
  efficiency: number;  // % (0-100)
  fsw: number;         // kHz
  topology: 'half-bridge' | 'full-bridge';
  rectifier: 'full-wave' | 'center-tapped' | 'synchronous';
  loadMin: number;     // %
  loadMax: number;     // %
}

interface CalculatedResults {
  n: number;           // turns ratio
  fr: number;          // Hz
  lr: number;          // H
  cr: number;          // F
  lm: number;          // H
  q: number;           // quality factor
  k: number;           // Lm/Lr
  mMax: number;        // peak gain
  mRequired: number;   // required gain at vinMax
  zvsMargin: boolean;  // ZVS achievable
  ipRms: number;       // A
  isRms: number;       // A
}
```

State flows:
- Designer page owns the input form and calculation logic
- Results are stored in shared context or localStorage
- Report page reads from shared context to render
- Curves page can read λ and Q from context to pre-populate sliders
