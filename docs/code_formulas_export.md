# LLC Design Tool — Code Formula Export

This document is a comprehensive extraction of arithmetic / design-calculation expressions and displayed mathematical formulas from the current LLC Design Tool source code (`src/`).

- **Code-calculation files** (`Designer.tsx`, `Curves.tsx`, `Report.tsx`, `CompensationSection.tsx`, `DesignCompare.tsx`): extracted as Markdown/LaTeX formulas with brief notes.
- **Derivation pages** (`Derivations.tsx`, `Operation.tsx`, `Fundamentals.tsx`): extracted from `MathBlock latex="..."` / `MathBlock` KaTeX strings.
- Engineering annotations for `Qmax2`/`16`, `Coss` loss `2/3`, and body-diode `0.7` are inserted exactly where the relevant formulas appear.

---

## 1. `src/pages/Designer.tsx` — Main Design Calculations & Loss Analysis

### 1.1 E-Series standard-value helper

Nearest standard value:

\[
\text{exponent} = \lfloor \log_{10}(\text{value}) \rfloor,\quad
\text{mantissa} = \frac{\text{value}}{10^{\text{exponent}}}
\]

Return closest mantissa from `E12`/`E24` multiplied by \(10^{\text{exponent}}\).

### 1.2 LLC voltage gain (FHA)

\[
M(f_n,k,Q) = \frac{1}{\sqrt{\left[1 + \frac{1}{k}\left(1 - \frac{1}{f_n^{2}}\right)\right]^{2} + \left[Q\left(f_n - \frac{1}{f_n}\right)\right]^{2}}}
\]

Code implementation (`gainM`):

```ts
const a = 1 + (1 / k) * (1 - 1 / (fn * fn))
const b = q * (fn - 1 / fn)
return 1 / Math.sqrt(a * a + b * b)
```

**Note:** Peak gain is found by numerical search over \(f_n = 0.3 \sim 1.0\) (`peakGain`).

### 1.3 ZVS phase at resonance

At \(f_n = 1\), let \(x = kQ\). The input-impedance phase is:

\[
\varphi = \arctan2\left(\frac{x}{1+x^{2}},\; \frac{x^{2}}{1+x^{2}}\right) \times \frac{180}{\pi}
\]

Code (`zvsPhase`):

```ts
const x = k * q
const real = (x * x) / (1 + x * x)
const imag = x / (1 + x * x)
return Math.atan2(imag, real) * (180 / Math.PI)
```

### 1.4 Main design calculation flow (`handleCalculate`)

#### Unit conversions

\[
f_{sw} = f_{sw,\text{kHz}} \times 1000,\quad
C_{ossEq} = C_{ossEq,\text{pF}} \times 10^{-12},\quad
C_{ossEr} = C_{ossEr,\text{pF}} \times 10^{-12},\quad
C_j = C_{j,\text{pF}} \times 10^{-12},\quad
T_d = T_{d,\text{ns}} \times 10^{-9}
\]

#### Effective output voltage

\[
V_{out,eff} = V_{out} + V_d
\]

#### Transformer turns ratio

\[
n = \begin{cases}
\dfrac{V_{in,nom}}{2V_{out,eff}} & \text{half-bridge} \\[6pt]
\dfrac{V_{in,nom}}{V_{out,eff}} & \text{full-bridge}
\end{cases}
\]

#### Required normalized gains

\[
G_{max} = \frac{V_{in,nom}}{V_{in,min}},\quad
G_{min} = \frac{V_{in,nom}}{V_{in,max}},\quad
G_{nom} = 1.0
\]

#### No-load Region-1 gain & minimum \(k\)

\[
G_{empty} = 1 + \frac{1}{k},\qquad
k_{min} = \frac{1}{G_{max} - 1}
\]

#### Resonant frequency

\[
f_r = f_{sw}
\]

#### Equivalent AC resistance

\[
R_{ac} = \frac{8 n^{2} V_{out}^{2}}{\pi^{2} P_{out}}
\]

#### Light-load \(R_{ac}\)

\[
P_{min} = P_{out} \times \frac{load_{min}}{100},\qquad
R_{ac,min} = R_{ac} \times \frac{P_{out}}{P_{min}}
\]

#### Qmax1 — peak-gain constraint

Numerical bisection (`findQmax1`) finds \(Q_{max1}\) such that the peak gain equals \(G_{max}\).

#### Qmax2 — ZVS dead-time constraint

Region-1 minimum gain:

\[
G_{region1,min} = \frac{k}{k+1}
\]

Estimated maximum frequency (Region 1):

\[
f_{max,est} = f_r \sqrt{\frac{G_{min}}{G_{min}(k+1) - k}}
\]

Total parasitic capacitance:

\[
C_{oss,total} = \max\left(10^{-12},\; 2C_{ossEr} + C_j\right)
\]

\[
Q_{max2} =
\frac{(k+1)V_{in,min}^{2}}{16\,f_{max,est}^{2}\,k^{2}\,C_{oss,total}\,V_{in,max}^{2}}
\times \frac{2\pi f_r}{R_{ac,min}}
\]

> 注：系数 16 来源于半桥 LLC 死区时间近似公式 \( t_{dead} = 16 \cdot C_{eq} \cdot f_r \cdot L_m \) 的反推。
> 若拓扑为全桥或死区定义不同，该系数需重新推导。

#### Qmax3 — Coss energy constraint

Equivalent resonant-capacitor Coss:

\[
C_{eq} = \max\left(10^{-12},\; 2C_{ossEq} + C_j\right)
\]

\[
Q_{max3} = \sqrt{(k+1)^{2}\left(\frac{f_{max,est}^{2}}{f_r^{2}} - 1\right) R_{ac,min}\,C_{eq}}
\]

#### Selected \(Q\)

\[
Q_{max} = \max\left(0.001,\; \min(Q_{max1}, Q_{max2}, Q_{max3})\right),\qquad
Q = 0.95 \, Q_{max}
\]

#### Resonant tank elements

\[
Z_r = Q \, R_{ac,min},\qquad
L_r = \frac{Z_r}{2\pi f_r},\qquad
C_r = \frac{1}{2\pi f_r Z_r},\qquad
L_m = k L_r
\]

#### Operating frequency limits

\[
f_{max} = f_r \sqrt{\frac{G_{min}}{G_{min}(k+1) - k}},\qquad
f_{min} = f_r \sqrt{\frac{G_{max}}{G_{max}(k+1) - k}}
\]

#### ZVS energy check

Dead-time magnetizing current:

\[
I_{m,dead} = \frac{V_{in,min}}{(8\text{ or }4)\,f_{max}\,L_m}
\]

(Use 8 for half-bridge, 4 for full-bridge.)

\[
E_r = \frac{1}{2} L_m I_{m,dead}^{2},\qquad
E_c = \frac{1}{2} C_{oss,total} V_{in,max}^{2},\qquad
\text{ZVS margin} = E_r \ge E_c
\]

#### ZVS time check

\[
t_{ZVS} = \frac{C_{oss,total} V_{in,max}}{I_{m,dead}},\qquad
\text{ZVS time OK} = t_{ZVS} \le T_d
\]

#### Current calculations

Output current:

\[
I_o = \frac{P_{out}}{V_{out}}
\]

Secondary RMS current:

\[
I_{s,rms} = \begin{cases}
\dfrac{\pi}{4} I_o & \text{center-tapped / sync-center-tapped} \\[6pt]
\dfrac{\pi}{2\sqrt{2}} I_o & \text{full-wave / synchronous}
\end{cases}
\]

Primary fundamental voltage amplitude:

\[
V_{fund} = \begin{cases}
\dfrac{2 V_{in,nom}}{\pi} & \text{half-bridge} \\[6pt]
\dfrac{4 V_{in,nom}}{\pi} & \text{full-bridge}
\end{cases}
\]

Resonant current RMS:

\[
I_{r,rms} = \frac{V_{fund}}{\sqrt{2}\,R_{ac}}
\]

Magnetizing voltage and current:

\[
V_{Lm} = \begin{cases}
V_{in,nom}/2 & \text{half-bridge} \\[4pt]
V_{in,nom} & \text{full-bridge}
\end{cases}
\]

\[
I_{m,rms} = \frac{V_{Lm}}{4\sqrt{3}\,f_r L_m}
\]

Total primary RMS current:

\[
I_{p,rms} = \sqrt{I_{r,rms}^{2} + I_{m,rms}^{2}}
\]

---

### 1.5 Loss analysis (`calculateLosses`)

Peak primary current:

\[
I_{p,pk} = I_{p,rms}\sqrt{2}
\]

Number of primary switches:

\[
N_{sw} = \begin{cases} 2 & \text{half-bridge} \\ 4 & \text{full-bridge} \end{cases}
\]

#### MOSFET conduction loss

\[
P_{cond,per} = \frac{1}{2} I_{p,rms}^{2} R_{ds(on)},\qquad
P_{cond} = N_{sw} \, P_{cond,per}
\]

(Units: `mosfetRdsOn` is in mΩ, converted to Ω.)

#### Switching loss (linear approximation)

\[
P_{on} = \frac{1}{2} V_{in} I_{p,pk} \, t_r \, f_{sw} \, N_{sw}
\]

\[
P_{off} = \frac{1}{2} V_{in} I_{p,pk} \, t_f \, f_{sw} \, N_{sw}
\]

(Units: \(t_r, t_f\) in ns, converted to seconds.)

#### Coss loss

\[
C_{oss,F} = C_{oss,\text{pF}} \times 10^{-12}
\]

\[
E_{coss} = \frac{1}{2} C_{oss,F} V_{in}^{2} \times \frac{2}{3},\qquad
P_{coss} = E_{coss} \, f_{sw} \, N_{sw}
\]

> 注：系数 2/3 考虑了 MOSFET 结电容 \( C_{oss} \) 随 \( V_{ds} \) 的非线性变化。
> 不同厂商/型号的 \( C_{oss} \) 非线性特性不同，精确损耗建议查手册 \( E_{oss} \) 曲线。

#### Body-diode conduction loss

\[
I_{diode} = I_{p,pk} \times 0.7,\qquad
P_{diode} = V_{sd} \, I_{diode} \, T_d \, f_{sw} \, N_{sw}
\]

> 注：0.7 为经验系数，实际体二极管电流波形因死区时间、\( C_{oss} \) 充放电波形而异。
> 精确估算需时域仿真或示波器实测。

#### Transformer core loss (Steinmetz)

\[
A_e\,[m^{2}] = A_{e,\text{mm}^{2}} \times 10^{-6}
\]

\[
B_{peak} = \frac{V_{in} / (2\text{ or }1)}{4 f_{sw} N_p A_e}
\]

\[
P_{core} = k \left(\frac{f_{sw}}{1000}\right)^{\alpha} \left(B_{peak} \times 1000\right)^{\beta} V_e
\]

(Use 2 for half-bridge voltage denominator, 1 for full-bridge.)

#### Winding loss

\[
R_{dc} = R_{dc,\text{mΩ}} / 1000,\qquad
\text{freqRatio} = \frac{f_{sw}/1000}{f_{skin0}}
\]

\[
R_{ac,factor} = 1 + \text{freqRatio}^{2},\qquad
P_{winding} = I_{p,rms}^{2} R_{dc} R_{ac,factor}
\]

#### Rectifier loss

Synchronous rectifier:

\[
N_{rect} = \begin{cases} 2 & \text{sync-center-tapped} \\ 4 & \text{synchronous} \end{cases},\qquad
I_{s,per} = \frac{I_{s,rms}}{\sqrt{2}}
\]

\[
P_{rect} = N_{rect} \, I_{s,per}^{2} \, R_{ds(on),rect}
\]

Diode rectifier:

\[
N_{diodes} = \begin{cases} 2 & \text{center-tapped} \\ 4 & \text{full-wave} \end{cases},\qquad
I_{avg,diode} = \frac{I_o}{2}
\]

\[
P_{rect} = N_{diodes} \, V_f \, I_{avg,diode}
\]

#### Resonant-element loss

\[
P_{Lr} = I_{p,rms}^{2} R_{DCR,Lr},\qquad
P_{Cr} = I_{p,rms}^{2} ESR_{Cr},\qquad
P_{res} = P_{Lr} + P_{Cr}
\]

#### Total loss and efficiency

\[
P_{loss,total} = P_{cond} + P_{on} + P_{off} + P_{coss} + P_{diode} + P_{core} + P_{winding} + P_{rect} + P_{res}
\]

\[
\eta = \frac{P_{out}}{P_{out} + P_{loss,total}} \times 100\%
\]

---

## 2. `src/pages/Curves.tsx` — Gain & Impedance Characteristic Curves

### 2.1 LLC gain (normalized)

Same FHA formula as Designer:

\[
M(f_n,k,Q) = \frac{1}{\sqrt{\left[1 + \frac{1}{k}\left(1 - \frac{1}{f_n^{2}}\right)\right]^{2} + \left[Q\left(f_n - \frac{1}{f_n}\right)\right]^{2}}}
\]

### 2.2 Input impedance (normalized to \(Z_r\))

\[
D = Q^{2} + f_n^{2} k^{2}
\]

\[
\text{Re}(Z_{in}) = Z_r \frac{Q f_n^{2} k^{2}}{D},\qquad
\text{Im}(Z_{in}) = Z_r \left(f_n - \frac{1}{f_n} + \frac{Q^{2} f_n k}{D}\right)
\]

\[
|Z_{in}| = \sqrt{\text{Re}^{2} + \text{Im}^{2}},\qquad
\varphi = \arctan2(\text{Im}, \text{Re}) \times \frac{180}{\pi}
\]

### 2.3 Resonance markers

\[
f_{r1} = 1.0\;\text{(normalized)},\qquad
f_{r2} = \frac{1}{\sqrt{1+k}}
\]

---

## 3. `src/pages/Report.tsx` — Design Report Generation

### 3.1 Derived parameters used in report tables

\[
R_{ac} = \frac{8 n^{2} V_{out}^{2}}{\pi^{2} P_{out}}
\]

### 3.2 Required gains

Half-bridge:

\[
M_{req,min} = \frac{2n(V_{out}+V_d)}{V_{in,min}},\qquad
M_{req,max} = \frac{2n(V_{out}+V_d)}{V_{in,max}}
\]

Full-bridge:

\[
M_{req,min} = \frac{n(V_{out}+V_d)}{V_{in,min}},\qquad
M_{req,max} = \frac{n(V_{out}+V_d)}{V_{in,max}}
\]

### 3.3 Gain margin

\[
\text{Gain margin} = \left(\frac{M_{max}}{M_{req,min}} - 1\right) \times 100\%
\]

### 3.4 Stress estimates

Primary MOSFET voltage recommendation:

\[
V_{ds,max} = \begin{cases} V_{in,max} & \text{half-bridge} \\ 1.2 V_{in,max} & \text{full-bridge} \end{cases}
\]

Primary MOSFET current recommendation:

\[
I_{MOS,rms} = 2.5 \, I_{p,rms}
\]

Secondary rectifier voltage recommendation:

\[
V_{RRM} = \begin{cases} 2.5 V_{out} & \text{center-tapped / sync-center-tapped} \\ 2 V_{out} & \text{full-wave / synchronous} \end{cases}
\]

Secondary rectifier current recommendation:

\[
I_{sec,rms} = 1.5 \, I_{s,rms}
\]

Resonant-capacitor voltage estimate:

\[
V_{Cr,peak} = \begin{cases} 0.5 V_{in,max} & \text{half-bridge} \\ V_{in,max} & \text{full-bridge} \end{cases}
\]

---

## 4. `src/components/CompensationSection.tsx` — Loop Compensation Design

### 4.1 E-Series / value formatting

Same `nearestE` helper as Designer.

### 4.2 Power-stage poles

Output pole:

\[
\omega_{p,out} = \frac{1}{R_{load} C_{out}}
\]

ESR zero:

\[
\omega_{p,zero} = \frac{1}{ESR \cdot C_{out}}
\]

(Units: \(C_{out}\) in μF, \(ESR\) in mΩ, converted to F/Ω internally.)

### 4.3 Plant transfer-function models

**Integrator:**

\[
G_p(s) = \frac{K_p}{s},\qquad |G_p| = \frac{K_p}{\omega},\qquad \angle G_p = -90°
\]

**Integrator + output pole:**

\[
G_p(s) = \frac{K_p}{s(1 + s/\omega_{p,out})},\qquad
|G_p| = \frac{K_p}{\omega \sqrt{1 + (\omega/\omega_{p,out})^{2}}}
\]

\[
\angle G_p = -90° - \tan^{-1}\left(\frac{\omega}{\omega_{p,out}}\right)
\]

**Integrator + pole + ESR zero:**

\[
G_p(s) = \frac{K_p(1 + s/\omega_{p,zero})}{s(1 + s/\omega_{p,out})}
\]

\[
|G_p| = K_p \frac{\sqrt{1 + (\omega/\omega_{p,zero})^{2}}}{\omega \sqrt{1 + (\omega/\omega_{p,out})^{2}}}
\]

\[
\angle G_p = -90° + \tan^{-1}\left(\frac{\omega}{\omega_{p,zero}}\right) - \tan^{-1}\left(\frac{\omega}{\omega_{p,out}}\right)
\]

### 4.4 Compensator gain/phase

Type II / Type III transfer-function magnitude/phase evaluated numerically at each frequency.

### 4.5 Required compensator gain at crossover

\[
G_{c,needed} = \frac{1}{G_{p,linear}(f_c)}
\]

### 4.6 K-factor design

Required compensator phase:

\[
\varphi_{c,req} = PM_{target} - 180° - \varphi_{plant}(f_c)
\]

Target boost:

\[
\text{boost}_{target} = \varphi_{c,req} + 180°\quad (\text{clamped to practical range})
\]

**Type II:**

\[
K = \tan\left(\frac{\text{boost}_{target} \cdot \pi}{360}\right),\qquad
f_{z1} = \frac{f_c}{K},\qquad
f_{p1} = K f_c
\]

**Type III:**

\[
K = \tan\left(\frac{(\text{boost}_{target} + 180°)\pi}{720}\right),\qquad
f_{z1}=f_{z2}=\frac{f_c}{K},\qquad
f_{p1}=f_{p2}=K f_c
\]

### 4.7 Component calculation

\[
R_2 = \begin{cases}
R_1 \, G_{c,needed} & \text{Type II} \\[4pt]
R_1 \, G_{c,needed} / K & \text{Type III}
\end{cases}
\]

\[
C_1 = \frac{1}{R_2 \, 2\pi f_{z1}},\qquad
C_2 = \frac{1}{R_2 \, 2\pi f_{p1}}
\]

For Type III:

\[
R_3 = \max(100,\; R_1/10),\qquad
C_3 = \frac{1}{R_3 \, 2\pi f_{p2}}
\]

### 4.8 Verification

\[
PM_{actual} = 180° + \varphi_{plant}(f_c) + \varphi_{comp}(f_c)
\]

Actual crossover frequency is found by scanning \(0.1 f_c \sim 10 f_c\) and minimizing \(|G_{open}|\) in dB.

---

## 5. `src/components/DesignCompare.tsx` — A/B Design Comparison

### 5.1 Gain curve comparison

Same FHA `calcGain` formula evaluated for each saved design.

### 5.2 Design scoring

\[
\text{effScore} = \min\left(\frac{\eta}{97}, 1\right) \times 40
\]

\[
\text{freqRangeScore} = \max\left(0,\; 1 - (0.5 Q + k)\right) \times 30
\]

\[
\text{zvsScore} = \begin{cases} 30 & \text{ZVS OK} \\ 0 & \text{otherwise} \end{cases}
\]

\[
\text{totalScore} = \text{effScore} + \text{freqRangeScore} + \text{zvsScore}
\]

### 5.3 Parameter spread

For numeric compared values:

\[
\text{spread} = \frac{\max - \min}{\min} \times 100\%
\]

---

## 6. `src/pages/Derivations.tsx` — Formula Derivations (KaTeX Display Math)

### 6.1 Section 1 — Basic Topology & Operating Principle

**First resonant frequency (series resonance):**

\[
\omega_r = \frac{1}{\sqrt{L_r C_r}} \quad \Rightarrow \quad f_r = \frac{1}{2\pi\sqrt{L_r C_r}}
\]

**Second resonant frequency (series-parallel resonance):**

\[
\omega_m = \frac{1}{\sqrt{(L_r + L_m) C_r}} \quad \Rightarrow \quad f_m = \frac{1}{2\pi\sqrt{(L_r + L_m) C_r}}
\]

**Relation between the two resonant frequencies:**

\[
\begin{aligned}
f_m &= \frac{1}{2\pi\sqrt{(L_r + L_m) C_r}} \\
&= \frac{1}{2\pi\sqrt{L_r C_r \cdot \left(1 + \frac{L_m}{L_r}\right)}} \\
&= \frac{f_r}{\sqrt{1 + k}}
\end{aligned}
\]

**Core parameters:**

\[
k = \frac{L_m}{L_r}, \quad f_r = \frac{1}{2\pi\sqrt{L_r C_r}}, \quad f_m = \frac{f_r}{\sqrt{1 + k}}
\]

### 6.2 Section 2 — Steady-State Gain & FHA Derivation

**Half-bridge fundamental RMS voltage:**

\[
V_{ab,1} = \frac{2\sqrt{2}}{\pi} V_{in}
\]

**Full-bridge fundamental RMS voltage:**

\[
V_{ab,1} = \frac{4\sqrt{2}}{\pi} V_{in}
\]

**Equivalent AC load resistance:**

\[
\begin{aligned}
R_{ac} &= \frac{8n^2}{\pi^2} \cdot R_L \\ &= \frac{8n^2}{\pi^2} \cdot \frac{V_o^2}{P_o}
\end{aligned}
\]

**Voltage gain definition:**

\[
M = \left| \frac{Z_2}{Z_1 + Z_2} \right|
\]

**Standard LLC gain equation:**

\[
\begin{aligned}
M(f_n, k, Q) &= \frac{1}{\sqrt{\left(1 + \frac{1}{k} - \frac{1}{k f_n^2}\right)^2 + \left[Q\left(f_n - \frac{1}{f_n}\right)\right]^2}} \\ &= \frac{f_n^2 k}{\sqrt{\left[f_n^2(k+1) - 1\right]^2 + k^2 Q^2 (f_n^2 - 1)^2}}
\end{aligned}
\]

**Load-independent point:**

\[
M(1, k, Q) = 1 \quad \text{（与 } Q \text{ 无关）}
\]

**No-load gain:**

\[
M_{empty}(f_n, k) = \frac{1}{\left|1 - \frac{1}{f_n^2(1 + k)}\right|}
\]

**Final formula:**

\[
M = \frac{1}{\sqrt{\left(1 + \frac{1}{k} - \frac{1}{k f_n^2}\right)^2 + \left[Q\left(f_n - \frac{1}{f_n}\right)\right]^2}}
\]

### 6.3 Section 3 — Resonant Frequencies & Characteristic Parameters

**First resonant frequency:**

\[
f_r = \frac{1}{2\pi\sqrt{L_r C_r}}
\]

**Second resonant frequency:**

\[
f_m = \frac{1}{2\pi\sqrt{(L_r + L_m) C_r}} = \frac{f_r}{\sqrt{1 + k}}
\]

**Characteristic impedance:**

\[
Z_0 = \sqrt{\frac{L_r}{C_r}} = \omega_r L_r = \frac{1}{\omega_r C_r}
\]

**Quality factor:**

\[
Q = \frac{Z_0}{R_{ac}} = \frac{\sqrt{L_r / C_r}}{R_{ac}}
\]

**Final formulas:**

\[
f_r = \frac{1}{2\pi\sqrt{L_r C_r}}, \quad f_m = \frac{f_r}{\sqrt{1 + k}}, \quad Z_0 = \sqrt{\frac{L_r}{C_r}}, \quad Q = \frac{Z_0}{R_{ac}}
\]

### 6.4 Section 4 — Peak Gain & Boundary Conditions

**Squared gain expression:**

\[
M^2 = \frac{x^2 k^2}{\left[x(k+1) - 1\right]^2 + x k^2 Q^2 (x-1)^2}
\]

where \(x = f_n^2\).

**Boundary condition:**

\[
\frac{dM}{df_n} = 0 \quad \text{at} \quad f_n = f_{n,peak}
\]

### 6.5 Section 5 — Input Impedance & ZVS Conditions

**Input impedance:**

\[
Z_{in} = j\omega_s L_r + \frac{1}{j\omega_s C_r} + \left(j\omega_s L_m \parallel R_{ac}\right)
\]

**Real / imaginary parts:**

\[
\begin{aligned}
\text{Re}(Z_{in}) &= Z_0 \cdot \frac{f_n^2 k^2 Q}{Q^2 + f_n^2 k^2} \\ \text{Im}(Z_{in}) &= Z_0 \left( f_n - \frac{1}{f_n} + \frac{f_n k Q^2}{Q^2 + f_n^2 k^2} \right)
\end{aligned}
\]

**Inductive/capacitive boundary:**

\[
\text{Im}(Z_{in}) = 0 \quad \Rightarrow \quad f_n - \frac{1}{f_n} + \frac{f_n k Q^2}{Q^2 + f_n^2 k^2} = 0
\]

**ZVS energy criterion:**

\[
\frac{1}{2} L_m I_{m,off}^2 \geq \frac{1}{2} C_{oss} V_{in}^2
\]

**Phase at \(f_n = 1\):**

\[
\begin{aligned}
\text{令 } x &= kQ \\
\frac{\text{Im}(Z_{in})}{Z_0} &= \frac{x}{1 + x^2}, \quad \frac{\text{Re}(Z_{in})}{Z_0} = \frac{x^2}{1 + x^2} \\
\frac{\text{Im}}{\text{Re}} &= \frac{x}{x^2} = \frac{1}{x} = \frac{1}{kQ} \\
\varphi &= \arctan\left(\frac{1}{kQ}\right) \cdot \frac{180}{\pi}
\end{aligned}
\]

**Final formula:**

\[
Z_{in} = jZ_0\left(f_n - \frac{1}{f_n}\right) + \frac{j f_n Z_0 k}{1 + j f_n k Q}
\]

### 6.6 Section 6 — Power-Device Stress Calculations

**MOSFET voltage stress:**

\[
V_{ds,max} = V_{in}
\]

**MOSFET peak current:**

\[
I_{pk} = \frac{2n(V_o + V_f)}{\pi Z_0 Q} + \frac{n(V_o + V_f)}{2 f_s L_m}
\]

**MOSFET RMS current:**

\[
I_{rms} = \frac{I_{pk}}{\sqrt{2}}
\]

**Diode reverse voltage (center-tapped):**

\[
V_{RRM} = 2V_o
\]

**Diode reverse voltage (full-bridge / full-wave):**

\[
V_{RRM} = V_o
\]

**Diode average current:**

\[
I_{avg} = \frac{I_o}{2}
\]

**Resonant-capacitor RMS current:**

\[
I_{C_r,rms} = I_{r,rms}
\]

**Transformer primary RMS current:**

\[
I_{p,rms} = \sqrt{I_{r,rms}^2 + I_{m,rms}^2}
\]

### 6.7 Section 7 — Power-Device Loss Models

**MOSFET conduction loss:**

\[
P_{cond} = I_{rms}^2 \cdot R_{ds(on)}
\]

**Body-diode loss (simplified):**

\[
P_{diode} = V_f \cdot I_{avg,diode}
\]

**MOSFET turn-off loss:**

\[
P_{off} = \frac{1}{2} V_{in} \cdot I_{m,pk} \cdot (t_r + t_f) \cdot f_s
\]

**Gate-drive loss:**

\[
P_{drv} = Q_g \cdot V_{drv} \cdot f_s
\]

**Total MOSFET loss:**

\[
P_{total,MOS} = P_{cond} + P_{diode} + P_{off} + P_{drv}
\]

**Rectifier-diode conduction loss:**

\[
P_{cond,D} = V_f \cdot I_o
\]

**Reverse-recovery loss:**

\[
P_{rr} = \frac{1}{2} Q_{rr} \cdot V_{RRM} \cdot f_s
\]

**Transformer copper loss:**

\[
P_{Cu} = I_p^2 \cdot R_{ac,pri} + I_s^2 \cdot R_{ac,sec}
\]

**Core loss (Steinmetz):**

\[
P_{core} = C_m \cdot f^\alpha \cdot B^\beta \cdot V_e
\]

**Flux density (square-wave excitation):**

\[
B = \frac{V_p}{4 N_p A_e f_s}
\]

### 6.8 Section 8 — Resonant Tank & Transformer Design

**Turns ratio:**

\[
n = \frac{V_{in,nom}}{2(V_o + V_f)} \quad \text{（半桥）}
\]

\[
n = \frac{V_{in,nom}}{V_o + V_f} \quad \text{（全桥）}
\]

**Equivalent load resistance:**

\[
R_{ac} = \frac{8n^2}{\pi^2} \cdot \frac{V_o^2}{P_o}
\]

**Maximum / minimum required gain:**

\[
\begin{aligned}
M_{max} &= \frac{V_{in,nom}}{V_{in,min}} \\ M_{min} &= \frac{V_{in,nom}}{V_{in,max}}
\end{aligned}
\]

**Maximum allowable \(Q\):**

\[
Q_{max} = \min(Q_{max1}, Q_{max2})
\]

**Resonant tank parameters:**

\[
Z_0 = Q_s \cdot R_{ac}
\]

\[
C_r = \frac{1}{2\pi f_r Z_0} = \frac{1}{2\pi f_r Q_s R_{ac}}
\]

\[
L_r = \frac{Z_0}{2\pi f_r} = \frac{Q_s R_{ac}}{2\pi f_r}
\]

\[
L_m = k \cdot L_r = \frac{k Q_s R_{ac}}{2\pi f_r}
\]

**Final formulas:**

\[
L_r = \frac{Q_s R_{ac}}{2\pi f_r}, \quad C_r = \frac{1}{2\pi f_r Q_s R_{ac}}, \quad L_m = k L_r
\]

---

## 7. `src/pages/Operation.tsx` — LLC Operating Principles (KaTeX Display Math)

### 7.1 Mode boundary resonant frequencies

\[
f_{r1} = \frac{1}{2\pi\sqrt{L_r C_r}}
\]

\[
f_{r2} = \frac{1}{2\pi\sqrt{(L_r + L_m) C_r}} = \frac{f_{r1}}{\sqrt{1 + k}}
\]

### 7.2 ZVS energy condition (half-bridge)

\[
\frac{1}{2} L_p I_p^2 \geq \frac{1}{2} C_{oss} V_{in}^2 \cdot 2
\]

### 7.3 Voltage-gain definitions

\[
M = \frac{n V_{out}}{V_{in}} \;(\text{全桥}) \quad M = \frac{2n V_{out}}{V_{in}} \;(\text{半桥})
\]

### 7.4 FHA LLC gain equation

\[
M(f_n, k, Q) = \frac{f_n^2 \cdot k}{\sqrt{(f_n^2(1+k)-1)^2 + k^2 Q^2 (f_n^2-1)^2}}
\]

---

## 8. `src/pages/Fundamentals.tsx` — Resonance Fundamentals (KaTeX Display Math)

### 8.1 Series LC resonance

\[
f_r = \frac{1}{2\pi\sqrt{L_r C_r}}
\]

\[
\omega_r = 2\pi f_r = \frac{1}{\sqrt{L_r C_r}}
\]

### 8.2 Quality factor

\[
Q = \frac{Z_r}{R_{ac}} = \frac{\sqrt{L_r/C_r}}{R_{ac}}
\]

### 8.3 Bandwidth

\[
BW = \frac{f_r}{Q} = f_2 - f_1
\]

### 8.4 FHA normalized gain

\[
M = \frac{n \cdot V_{out}}{V_{in}} \quad (全桥)
\]

\[
M = \frac{2n \cdot V_{out}}{V_{in}} \quad (半桥)
\]

### 8.5 Key parameter definitions

\[
f_{r1} = \frac{1}{2\pi\sqrt{L_r C_r}}
\]

\[
f_{r2} = \frac{1}{2\pi\sqrt{(L_r + L_m) C_r}} = \frac{f_{r1}}{\sqrt{1 + k}}
\]

\[
Z_r = \sqrt{\frac{L_r}{C_r}}
\]

\[
Q = \frac{Z_r}{R_{ac}}
\]

\[
k = \frac{L_m}{L_r}
\]

\[
f_n = \frac{f_{sw}}{f_{r1}}
\]

---

## Summary

- **File written:** `docs/code_formulas_export.md`
- **Formula sources:**
  - `src/pages/Designer.tsx`
  - `src/pages/Curves.tsx`
  - `src/pages/Report.tsx`
  - `src/components/CompensationSection.tsx`
  - `src/components/DesignCompare.tsx`
  - `src/pages/Derivations.tsx` (KaTeX `MathBlock`)
  - `src/pages/Operation.tsx` (KaTeX `MathBlock`)
  - `src/pages/Fundamentals.tsx` (KaTeX `MathBlock`)
- **Engineering annotations included:** `Qmax2`/`16`, `Coss` loss `2/3`, body-diode `0.7`.
