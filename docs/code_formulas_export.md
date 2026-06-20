# LLC Design Tool — Code Formula Export

> Auto-extracted from the `src/` TypeScript/TSX source. This file collects arithmetic design formulas, loss-model equations, compensator expressions, and the KaTeX `latex` strings displayed through `MathBlock` components.

---

## src/pages/Designer.tsx

### Component / E-series helper

- **E-series nearest-value selection**
  ```
  exponent = floor(log10(value))
  mantissa = value / 10^exponent
  closest  = argmin_v |mantissa - v|   (v from E12/E24 series)
  return closest * 10^exponent
  ```
  Selects a standard E12/E24 value for Lr/Cr.

### LLC gain and ZVS helpers

- **Normalized FHA voltage gain `gainM(fn,k,Q)`**
  $$
  M(f_n,k,Q)=\frac{1}{\sqrt{\left[1+\frac{1}{k}\left(1-\frac{1}{f_n^2}\right)\right]^2+\left[Q\left(f_n-\frac{1}{f_n}\right)\right]^2}}
  $$
  Computes the LLC resonant-tank gain versus normalized frequency.

- **Peak gain `peakGain(k,Q)`**
  $$
  M_{max}=\max_{f_n\in[0.3,1.0]} M(f_n,k,Q)
  $$
  Evaluated numerically in 0.005 steps.

- **Input-impedance phase at $f_n=1$ (`zvsPhase`)**
  $$
  x=kQ,\quad \text{Re}=\frac{x^2}{1+x^2},\quad \text{Im}=\frac{x}{1+x^2}
  $$
  $$
  \varphi=\arctan2(\text{Im},\text{Re})\cdot\frac{180}{\pi}
  $$
  Gives the inductive phase margin used for ZVS screening.

### Main design calculation (`handleCalculate`)

- **Unit scaling**
  $$
  f_{sw}=\text{form.fsw}\times1000,\quad C_{oss,eq}=\text{form.cossEq}\times10^{-12},\quad C_{oss,er}=\text{form.cossEr}\times10^{-12}
  $$
  $$
  C_j=\text{form.cj}\times10^{-12},\quad T_d=\text{form.td}\times10^{-9}
  $$

- **Effective output voltage (includes diode drop)**
  $$
  V_{out,eff}=V_{out}+V_d
  $$

- **Transformer turns ratio**
  $$
  n=\begin{cases}
  \dfrac{V_{in,nom}}{2V_{out,eff}} & \text{half-bridge}\\[6pt]
  \dfrac{V_{in,nom}}{V_{out,eff}} & \text{full-bridge}
  \end{cases}
  $$

- **Required normalized gain range**
  $$
  G_{max}=\frac{V_{in,nom}}{V_{in,min}},\quad G_{min}=\frac{V_{in,nom}}{V_{in,max}},\quad G_{nom}=1
  $$

- **No-load Region-1 gain and minimum $k$**
  $$
  G_{empty}=1+\frac{1}{k},\quad k_{min}=\frac{1}{G_{max}-1}
  $$

- **Resonant frequency assumption**
  $$
  f_r=f_{sw}
  $$

- **Equivalent AC load resistance (FHA)**
  $$
  R_{ac}=\frac{8n^2V_{out}^2}{\pi^2P_{out}}
  $$

- **Light-load $R_{ac}$**
  $$
  P_{min}=P_{out}\cdot\frac{\text{loadMin}}{100},\quad R_{ac,min}=R_{ac}\cdot\frac{P_{out}}{P_{min}}
  $$

- **Region-1 no-load gain limit and feasibility**
  $$
  G_{region1,min}=\frac{k}{k+1},\quad \text{feasible}=G_{min}\ge G_{region1,min}
  $$

- **Estimated maximum frequency**
  $$
  f_{max,est}=f_r\sqrt{\frac{G_{min}}{G_{min}(k+1)-k}}\quad(\text{when feasible})
  $$

- **Total switched-node capacitance**
  $$
  C_{oss,total}=\max\left(10^{-12},\;2C_{oss,er}+C_j\right)
  $$

- **Qmax constraints**
  $$
  Q_{max1}=\text{bisection solution of } M_{max}(k,Q)=G_{max}
  $$
  $$
  Q_{max2}=\frac{(k+1)V_{in,min}^2}{16f_{max,est}^2k^2C_{oss,total}V_{in,max}^2}\cdot\frac{2\pi f_r}{R_{ac,min}}
  $$
  $$
  C_{eq}=\max\left(1,\;2C_{oss,eq}+C_j\right)
  $$
  $$
  Q_{max3}=\sqrt{(k+1)^2\left(\frac{f_{max,est}^2}{f_r^2}-1\right)R_{ac,min}C_{eq}}
  $$

- **Selected quality factor (95 % margin)**
  $$
  Q_{max}=\max\left(0.001,\;\min(Q_{max1},Q_{max2},Q_{max3})\right),\quad Q=\max\left(0.001,\;0.95Q_{max}\right)
  $$

- **Resonant-tank elements**
  $$
  Z_r=Q\,R_{ac,min},\quad L_r=\frac{Z_r}{2\pi f_r},\quad C_r=\frac{1}{2\pi f_rZ_r},\quad L_m=kL_r
  $$

- **Exact operating frequency limits**
  $$
  f_{max}=f_r\sqrt{\frac{G_{min}}{G_{min}(k+1)-k}},\quad f_{min}=f_r\sqrt{\frac{G_{max}}{G_{max}(k+1)-k}}
  $$

- **ZVS magnetizing current and energy check**
  $$
  f_{max,ZVS}=\text{isFinite}(f_{max})?f_{max}:f_r
  $$
  $$
  I_{m,dead}=\frac{V_{in,min}}{(8\text{ or }4)\,f_{max,ZVS}\,L_m}
  $$
  (8 for half-bridge, 4 for full-bridge)
  $$
  E_r=\frac{1}{2}L_mI_{m,dead}^2,\quad E_c=\frac{1}{2}C_{oss,total}V_{in,max}^2,\quad \text{zvsMargin}=E_r\ge E_c
  $$

- **ZVS transition-time check**
  $$
  t_{ZVS}=\frac{C_{oss,total}V_{in,max}}{I_{m,dead}},\quad \text{zvsTimeOk}=t_{ZVS}\le T_d
  $$

- **Output and winding currents**
  $$
  I_o=\frac{P_{out}}{V_{out}}
  $$
  $$
  I_{s,rms}=\begin{cases}
  \dfrac{\pi}{4}I_o & \text{center-tapped / sync-center-tapped}\\[6pt]
  \dfrac{\pi}{2\sqrt{2}}I_o & \text{full-wave / synchronous}
  \end{cases}
  $$

- **Primary resonant and magnetizing currents (at $f_r$)**
  $$
  V_{fund}=\begin{cases}
  \dfrac{2V_{in,nom}}{\pi} & \text{half-bridge}\\[6pt]
  \dfrac{4V_{in,nom}}{\pi} & \text{full-bridge}
  \end{cases}
  $$
  $$
  I_{r,rms}=\frac{V_{fund}}{\sqrt{2}\,R_{ac}},\quad V_{Lm}=\begin{cases}V_{in,nom}/2 & \text{half-bridge}\\ V_{in,nom} & \text{full-bridge}\end{cases}
  $$
  $$
  I_{m,rms}=\frac{V_{Lm}}{4\sqrt{3}\,f_rL_m},\quad I_{p,rms}=\sqrt{I_{r,rms}^2+I_{m,rms}^2}
  $$

### Loss model (`calculateLosses`)

- **Peak primary current and output current**
  $$
  I_{p,peak}=I_{p,rms}\sqrt{2},\quad I_o=\frac{P_{out}}{V_{out}}
  $$

- **MOSFET conduction loss**
  $$
  P_{cond,per}=0.5\,I_{p,rms}^2\,R_{ds(on)},\quad P_{cond}=P_{cond,per}\cdot N_{switches}
  $$
  where $N_{switches}=2$ (half-bridge) or $4$ (full-bridge).

- **Linear switching losses**
  $$
  P_{on}=0.5\,V_{in}\,I_{p,peak}\,\frac{t_r}{10^9}\,f_{sw}\,N_{switches}
  $$
  $$
  P_{off}=0.5\,V_{in}\,I_{p,peak}\,\frac{t_f}{10^9}\,f_{sw}\,N_{switches}
  $$

- **Coss energy loss**
  $$
  C_{oss}=\frac{C_{oss,pF}}{10^{12}},\quad E_{coss}=0.5\,C_{oss}\,V_{in}^2\cdot\frac{2}{3},\quad P_{coss}=E_{coss}\,f_{sw}\,N_{switches}
  $$

- **Body-diode conduction loss**
  $$
  I_{diode}=0.7\,I_{p,peak},\quad P_{diode}=V_{sd}\,I_{diode}\,\frac{T_d}{10^9}\,f_{sw}\,N_{switches}
  $$

- **Transformer core loss (Steinmetz)**
  $$
  A_e[m^2]=A_{e,mm^2}\cdot10^{-6},\quad B_{peak}=\frac{V_{in}/(\text{1 or 2})}{4f_{sw}N_pA_e}
  $$
  $$
  P_{core}=K\,\left(\frac{f_{sw}}{10^3}\right)^\alpha\,(B_{peak}\cdot1000)^\beta\,V_e
  $$

- **Winding loss (DC + skin effect)**
  $$
  R_{dc}=\frac{R_{dc,m\Omega}}{1000},\quad FR=1+\left(\frac{f_{sw}/1000}{f_0}\right)^2,\quad P_w=I_{p,rms}^2R_{dc}\,FR
  $$

- **Rectifier loss**
  - Synchronous: $N_{sr}=2$ (center-tapped) or $4$ (full-wave),
    $$
    I_{sr,per}=\frac{I_{s,rms}}{\sqrt{2}},\quad P_{rect}=N_{sr}\,I_{sr,per}^2\,R_{ds(on),sr}
    $$
  - Diode: $N_D=2$ (center-tapped) or $4$ (full-wave),
    $$
    I_{D,avg}=\frac{I_o}{2},\quad P_{rect}=N_D\,V_f\,I_{D,avg}
    $$

- **Resonant-element ESR/DCR loss**
  $$
  P_{Lr}=I_{p,rms}^2\,R_{DCR,Lr},\quad P_{Cr}=I_{p,rms}^2\,R_{ESR,Cr},\quad P_{res}=P_{Lr}+P_{Cr}
  $$

- **Total loss and actual efficiency**
  $$
  P_{loss}=P_{cond}+P_{on}+P_{off}+P_{coss}+P_{diode}+P_{core}+P_w+P_{rect}+P_{res}
  $$
  $$
  \eta=\frac{P_{out}}{P_{out}+P_{loss}}\times100
  $$

### Design-rule thresholds (`generateSuggestions`)

- $k < 1.05k_{min}$ → critical (too close to minimum $k$)
- $k < 1.2k_{min}$ → warning
- $Q > 1.0$ → critical; $Q > 0.7$ → warning; $Q < 0.2$ → warning
- $M_{max} < G_{max}$ → critical; $M_{max} < 1.05G_{max}$ → warning
- $E_r/E_c < 1.2$ → warning
- $t_{ZVS} > T_d$ → critical
- $f_{max}>2f_r$ → critical; $f_{max}>1.5f_r$ → warning
- $C_r<1\text{nF}$, $L_m<50\mu\text{H}$, $f_{sw}>500\text{kHz}$ → warnings

### Component-stress / selection rules shown in the UI

- Primary MOSFET voltage rating suggestion: $\lceil V_{in,max}\rceil$ (half-bridge) or $\lceil 1.2V_{in,max}\rceil$ (full-bridge).
- Primary MOSFET current suggestion: $2.5\,I_{p,rms}$.
- Secondary rectifier voltage suggestion: $\lceil 2.5V_{out}\rceil$ (center-tapped) or $\lceil 2V_{out}\rceil$ (full-wave).
- Secondary rectifier current suggestion: $1.5\,I_{s,rms}$.
- Resonant-capacitor voltage estimate: $V_{in,max}/2$ (half-bridge) or $V_{in,max}$ (full-bridge).


---

## src/pages/Curves.tsx

- **Normalized FHA gain (same model as Designer)**
  $$
  M(f_n,k,Q)=\frac{1}{\sqrt{\left[1+\frac{1}{k}\left(1-\frac{1}{f_n^2}\right)\right]^2+\left[Q\left(f_n-\frac{1}{f_n}\right)\right]^2}}
  $$

- **Input impedance in normalized form (`calcImpedance`)**
  $$
  D=Q^2+f_n^2k^2
  $$
  $$
  \text{Re}(Z_{in}/Z_r)=\frac{Qf_n^2k^2}{D}
  $$
  $$
  \text{Im}(Z_{in}/Z_r)=\left(f_n-\frac{1}{f_n}\right)+\frac{Q^2f_nk}{D}
  $$
  $$
  |Z_{in}/Z_r|=\sqrt{\text{Re}^2+\text{Im}^2},\quad \varphi=\arctan2(\text{Im},\text{Re})\cdot\frac{180}{\pi}
  $$

- **Characteristic resonant frequencies marked on charts**
  $$
  f_{r1}=1,\quad f_{r2}=\frac{1}{\sqrt{1+k}}
  $$

---

## src/pages/Report.tsx

### Derived parameters

- **Equivalent AC resistance**
  $$
  R_{ac}=\frac{8n^2V_{out}^2}{\pi^2P_{out}}
  $$

- **Characteristic impedance**
  $$
  Z_r=\sqrt{\frac{L_r}{C_r}}
  $$

- **Resonant frequency**
  $$
  f_r=\frac{1}{2\pi\sqrt{L_rC_r}}
  $$

### Gain analysis

- **Required gain at input extremes**
  $$
  M_{req,min}=\begin{cases}\dfrac{2nV_{out}}{V_{in,min}} & \text{half-bridge}\\[6pt]\dfrac{nV_{out}}{V_{in,min}} & \text{full-bridge}\end{cases}
  $$
  $$
  M_{req,max}=\begin{cases}\dfrac{2nV_{out}}{V_{in,max}} & \text{half-bridge}\\[6pt]\dfrac{nV_{out}}{V_{in,max}} & \text{full-bridge}\end{cases}
  $$

- **Design gain margin**
  $$
  \text{GainMargin}=\left(\frac{M_{max}}{M_{req,min}}-1\right)\times100\%
  $$

### Currents

- **Output DC current**
  $$
  I_o=\frac{P_{out}}{V_{out}}
  $$

### Stress estimates

- **Primary MOSFET voltage/current stress**
  $$
  V_{DS,suggest}=\begin{cases}V_{in,max} & \text{half-bridge}\\ 1.2V_{in,max} & \text{full-bridge}\end{cases}
  $$
  $$
  I_{MOS,suggest}=2.5\,I_{p,rms}
  $$

- **Secondary rectifier stress**
  $$
  V_{RRM,suggest}=\begin{cases}2.5V_{out} & \text{center-tapped}\\ 2V_{out} & \text{full-wave}\end{cases}
  $$
  $$
  I_{rec,suggest}=1.5\,I_{s,rms}
  $$

- **Resonant-capacitor voltage estimate**
  $$
  V_{Cr}=\begin{cases}0.5V_{in,max} & \text{half-bridge}\\ V_{in,max} & \text{full-bridge}\end{cases}
  $$

---

## src/components/CompensationSection.tsx

### Helpers

- **Engineering unit formatter**
  ```
  value >= 1e6  → value/1e6  M
  value >= 1e3  → value/1e3  k
  value >= 1    → value
  value >= 1e-3 → value*1e3  m
  value >= 1e-6 → value*1e6  μ
  value >= 1e-9 → value*1e9  n
  else          → exponential
  ```

- **Radians to degrees**
  $$
  \theta_{deg}=\theta_{rad}\cdot\frac{180}{\pi}
  $$

### Plant transfer-function (`plantGainPhase`)

- **Angular frequency**
  $$
  \omega=2\pi f
  $$

- **Integrator model**
  $$
  G_p(s)=\frac{K_p}{s}\Rightarrow |G_p|=\frac{K_p}{\omega},\quad \varphi_p=-90^{\circ}
  $$

- **Integrator + output pole**
  $$
  G_p(s)=\frac{K_p}{s(1+s/\omega_{p,out})}\Rightarrow |G_p|=\frac{K_p}{\omega\sqrt{1+(\omega/\omega_{p,out})^2}}
  $$
  $$
  \varphi_p=-90^{\circ}-\arctan\left(\frac{\omega}{\omega_{p,out}}\right)
  $$

- **Integrator + pole + ESR zero**
  $$
  G_p(s)=\frac{K_p(1+s/\omega_{z,ESR})}{s(1+s/\omega_{p,out})}
  $$
  $$
  |G_p|=\frac{K_p\sqrt{1+(\omega/\omega_{z,ESR})^2}}{\omega\sqrt{1+(\omega/\omega_{p,out})^2}}
  $$
  $$
  \varphi_p=-90^{\circ}+\arctan\left(\frac{\omega}{\omega_{z,ESR}}\right)-\arctan\left(\frac{\omega}{\omega_{p,out}}\right)
  $$

- **dB conversion**
  $$
  G_{dB}=20\log_{10}\bigl(\max(|G_p|,10^{-12})\bigr)
  $$

### Plant poles/zeros from component values

- **Output pole**
  $$
  \omega_{p,out}=\frac{1}{R_{load}C_{out}\cdot10^{-6}}
  $$

- **ESR zero**
  $$
  \omega_{z,ESR}=\frac{1}{R_{ESR}\cdot10^{-3}\cdot C_{out}\cdot10^{-6}}
  $$

### Compensator transfer-function (`compGainPhase`)

- **Type-II**
  $$
  G_c(s)=K\frac{1+s/\omega_{z1}}{s(1+s/\omega_{p1})}
  $$

- **Type-III**
  $$
  G_c(s)=K\frac{(1+s/\omega_{z1})(1+s/\omega_{z2})}{s(1+s/\omega_{p1})(1+s/\omega_{p2})}
  $$

- Magnitude is evaluated as the product of zero/pole distances from the $j\omega$ axis and converted to dB.

### Compensator design (`handleDesign`)

- **Crossover angular frequency**
  $$
  \omega_c=2\pi f_c
  $$

- **Required compensator gain at crossover**
  $$
  |G_p(f_c)|_{lin}=10^{|G_p(f_c)|_{dB}/20},\quad G_{c,needed}=\frac{1}{|G_p(f_c)|_{lin}}
  $$

- **Required compensator phase**
  $$
  \varphi_{c,req}=PM_{target}-180^{\circ}-\varphi_p(f_c)
  $$

- **Target phase boost and K-factor (Type-II)**
  $$
  \text{boost}=\varphi_{c,req}+180^{\circ},\quad \text{boost}\in[10^{\circ},160^{\circ}]
  $$
  $$
  K=\tan\left(\frac{\text{boost}\cdot\pi}{360}\right),\quad K\in[0.2,10]
  $$

- **Target phase boost and K-factor (Type-III)**
  $$
  \text{boost}\in[10^{\circ},170^{\circ}]
  $$
  $$
  K=\tan\left(\frac{(\text{boost}+180^{\circ})\pi}{720}\right),\quad K\in[0.2,20]
  $$

- **Zero / pole placement**
  $$
  f_{z1}=\frac{f_c}{K},\quad f_{p1}=Kf_c
  $$
  For Type-III: $f_{z2}=f_{z1}$ and $f_{p2}=f_{p1}$.

- **Feedback resistor $R_2$**
  $$
  R_2=\begin{cases}R_1\,G_{c,needed} & \text{Type-II}\\[4pt]\dfrac{R_1\,G_{c,needed}}{K} & \text{Type-III}\end{cases}
  $$
  Clamped to $[1\text{k}\Omega,10\text{M}\Omega]$.

- **Compensator capacitors**
  $$
  C_1=\frac{1}{R_2\,2\pi f_{z1}}
  $$
  $$
  C_2=\frac{1}{R_2\,2\pi f_{p1}}
  $$
  For Type-III:
  $$
  R_3=\max\left(\frac{R_1}{10},100\Omega\right),\quad C_3=\frac{1}{R_3\,2\pi f_{p2}}
  $$

- **Actual phase margin**
  $$
  PM_{actual}=180^{\circ}+\varphi_p(f_c)+\varphi_c(f_c)
  $$

- **Crossover search**
  $$
  |G_{ol}(f)|_{dB}=|G_p(f)|_{dB}+|G_c(f)|_{dB},\quad f_{c,actual}=\argmin_f\bigl||G_{ol}(f)|_{dB}\bigr|
  $$

### Bode chart data

- **Open-loop response**
  $$
  |G_{ol}|_{dB}=|G_p|_{dB}+|G_c|_{dB},\quad \varphi_{ol}=\varphi_p+\varphi_c
  $$

---

## src/components/DesignCompare.tsx

- **Normalized FHA gain (re-used for comparison curves)**
  $$
  M(f_n,k,Q)=\frac{1}{\sqrt{\left[1+\frac{1}{k}\left(1-\frac{1}{f_n^2}\right)\right]^2+\left[Q\left(f_n-\frac{1}{f_n}\right)\right]^2}}
  $$

- **Design score (`scoreDesign`)**
  $$
  S_{eff}=\min\left(\frac{\eta}{97},1\right)\times40
  $$
  $$
  S_{freq}=\max\bigl(0,\;1-(0.5Q+k)\bigr)\times30
  $$
  $$
  S_{ZVS}=\begin{cases}30 & \text{if zvsMargin}\\0 & \text{otherwise}\end{cases}
  $$
  $$
  S_{total}=S_{eff}+S_{freq}+S_{ZVS}
  $$

- **Comparison-table spread**
  $$
  \text{Spread}=\frac{\max-\min}{\min}\times100\%
  $$


---

## src/pages/Derivations.tsx

> The following `MathBlock` LaTeX strings are reproduced verbatim (with JSX backslash escaping normalized so they render correctly in Markdown).

### Section 1 — 基本拓扑与工作原理

- **第一谐振频率（串联谐振）**
  $$
  \omega_r=\frac{1}{\sqrt{L_rC_r}}\quad\Rightarrow\quad f_r=\frac{1}{2\pi\sqrt{L_rC_r}}
  $$

- **第二谐振频率（串并联谐振）**
  $$
  \omega_m=\frac{1}{\sqrt{(L_r+L_m)C_r}}\quad\Rightarrow\quad f_m=\frac{1}{2\pi\sqrt{(L_r+L_m)C_r}}
  $$

- **两个谐振频率的关系**
  $$
  \begin{aligned}
  f_m&=\frac{1}{2\pi\sqrt{(L_r+L_m)C_r}}\\
  &=\frac{1}{2\pi\sqrt{L_rC_r\cdot\left(1+\frac{L_m}{L_r}\right)}}\\
  &=\frac{f_r}{\sqrt{1+k}}
  \end{aligned}
  $$

- **核心参数汇总**
  $$
  k=\frac{L_m}{L_r},\quad f_r=\frac{1}{2\pi\sqrt{L_rC_r}},\quad f_m=\frac{f_r}{\sqrt{1+k}}
  $$

### Section 2 — 稳态增益与 FHA 推导

- **半桥基波电压有效值**
  $$
  V_{ab,1}=\frac{2\sqrt{2}}{\pi}V_{in}
  $$

- **全桥基波电压有效值**
  $$
  V_{ab,1}=\frac{4\sqrt{2}}{\pi}V_{in}
  $$

- **等效交流负载电阻**
  $$
  \begin{aligned}
  R_{ac}&=\frac{8n^2}{\pi^2}\cdot R_L\\
  &=\frac{8n^2}{\pi^2}\cdot\frac{V_o^2}{P_o}
  \end{aligned}
  $$

- **电压增益定义（分压形式）**
  $$
  M=\left|\frac{Z_2}{Z_1+Z_2}\right|
  $$

- **标准 LLC 增益方程**
  $$
  \begin{aligned}
  M(f_n,k,Q)&=\frac{1}{\sqrt{\left(1+\frac{1}{k}-\frac{1}{kf_n^2}\right)^2+\left[Q\left(f_n-\frac{1}{f_n}\right)\right]^2}}\\
  &=\frac{f_n^2k}{\sqrt{\left[f_n^2(k+1)-1\right]^2+k^2Q^2(f_n^2-1)^2}}
  \end{aligned}
  $$

- **负载独立点**
  $$
  M(1,k,Q)=1
  $$

- **空载增益**
  $$
  M_{empty}(f_n,k)=\frac{1}{\left|1-\frac{1}{f_n^2(1+k)}\right|}
  $$

- **最终 FHA 增益公式**
  $$
  M=\frac{1}{\sqrt{\left(1+\frac{1}{k}-\frac{1}{kf_n^2}\right)^2+\left[Q\left(f_n-\frac{1}{f_n}\right)\right]^2}}
  $$

### Section 3 — 谐振频率与特征参数

- **第一 / 第二谐振频率**
  $$
  f_r=\frac{1}{2\pi\sqrt{L_rC_r}}
  $$
  $$
  f_m=\frac{1}{2\pi\sqrt{(L_r+L_m)C_r}}=\frac{f_r}{\sqrt{1+k}}
  $$

- **特征阻抗**
  $$
  Z_0=\sqrt{\frac{L_r}{C_r}}=\omega_rL_r=\frac{1}{\omega_rC_r}
  $$

- **品质因数**
  $$
  Q=\frac{Z_0}{R_{ac}}=\frac{\sqrt{L_r/C_r}}{R_{ac}}
  $$

- **最终公式汇总**
  $$
  f_r=\frac{1}{2\pi\sqrt{L_rC_r}},\quad f_m=\frac{f_r}{\sqrt{1+k}},\quad Z_0=\sqrt{\frac{L_r}{C_r}},\quad Q=\frac{Z_0}{R_{ac}}
  $$

### Section 4 — 峰值增益与边界条件

- **增益平方表达式**
  $$
  M^2=\frac{x^2k^2}{\left[x(k+1)-1\right]^2+xk^2Q^2(x-1)^2},\quad x=f_n^2
  $$

- **峰值频率边界条件**
  $$
  \frac{dM}{df_n}=0\quad\text{at}\quad f_n=f_{n,peak}
  $$

### Section 5 — 输入阻抗与 ZVS 条件

- **输入阻抗定义**
  $$
  Z_{in}=j\omega_sL_r+\frac{1}{j\omega_sC_r}+\left(j\omega_sL_m\parallel R_{ac}\right)
  $$

- **实部与虚部**
  $$
  \begin{aligned}
  \text{Re}(Z_{in})&=Z_0\cdot\frac{f_n^2k^2Q}{Q^2+f_n^2k^2}\\
  \text{Im}(Z_{in})&=Z_0\left(f_n-\frac{1}{f_n}+\frac{f_nkQ^2}{Q^2+f_n^2k^2}\right)
  \end{aligned}
  $$

- **感性 / 容性边界**
  $$
  \text{Im}(Z_{in})=0\quad\Rightarrow\quad f_n-\frac{1}{f_n}+\frac{f_nkQ^2}{Q^2+f_n^2k^2}=0
  $$

- **ZVS 能量准则**
  $$
  \frac{1}{2}L_mI_{m,off}^2\ge\frac{1}{2}C_{oss}V_{in}^2
  $$

- **感性区相位（$f_n=1$）**
  $$
  \begin{aligned}
  \text{令 }x&=kQ\\
  \frac{\text{Im}(Z_{in})}{Z_0}&=\frac{x}{1+x^2},\quad \frac{\text{Re}(Z_{in})}{Z_0}=\frac{x^2}{1+x^2}\\
  \frac{\text{Im}}{\text{Re}}&=\frac{1}{x}=\frac{1}{kQ}\\
  \varphi&=\arctan\left(\frac{1}{kQ}\right)\cdot\frac{180}{\pi}
  \end{aligned}
  $$

- **最终输入阻抗公式**
  $$
  Z_{in}=jZ_0\left(f_n-\frac{1}{f_n}\right)+\frac{jf_nZ_0k}{1+jf_nkQ}
  $$

### Section 6 — 功率器件应力计算

- **MOSFET 电压应力**
  $$
  V_{ds,max}=V_{in}
  $$

- **MOSFET 峰值电流**
  $$
  I_{pk}=\frac{2n(V_o+V_f)}{\pi Z_0Q}+\frac{n(V_o+V_f)}{2f_sL_m}
  $$

- **MOSFET 有效值电流**
  $$
  I_{rms}=\frac{I_{pk}}{\sqrt{2}}
  $$

- **副边整流二极管反向电压**
  $$
  V_{RRM}=2V_o\quad\text{（中心抽头整流）}
  $$
  $$
  V_{RRM}=V_o\quad\text{（全桥 / 全波整流）}
  $$

- **二极管平均电流**
  $$
  I_{avg}=\frac{I_o}{2}
  $$

- **谐振电容电流**
  $$
  I_{C_r,rms}=I_{r,rms}
  $$

- **变压器原边电流有效值**
  $$
  I_{p,rms}=\sqrt{I_{r,rms}^2+I_{m,rms}^2}
  $$

### Section 7 — 功率器件损耗模型

- **MOSFET 导通损耗**
  $$
  P_{cond}=I_{rms}^2\cdot R_{ds(on)}
  $$

- **体二极管损耗（简化）**
  $$
  P_{diode}=V_f\cdot I_{avg,diode}
  $$

- **关断损耗**
  $$
  P_{off}=\frac{1}{2}V_{in}\cdot I_{m,pk}\cdot(t_r+t_f)\cdot f_s
  $$

- **驱动损耗**
  $$
  P_{drv}=Q_g\cdot V_{drv}\cdot f_s
  $$

- **MOSFET 总损耗**
  $$
  P_{total,MOS}=P_{cond}+P_{diode}+P_{off}+P_{drv}
  $$

- **整流二极管导通损耗**
  $$
  P_{cond,D}=V_f\cdot I_o
  $$

- **反向恢复损耗**
  $$
  P_{rr}=\frac{1}{2}Q_{rr}\cdot V_{RRM}\cdot f_s
  $$

- **变压器铜损**
  $$
  P_{Cu}=I_p^2\cdot R_{ac,pri}+I_s^2\cdot R_{ac,sec}
  $$

- **磁芯损耗（Steinmetz）**
  $$
  P_{core}=C_m\cdot f^{\alpha}\cdot B^{\beta}\cdot V_e
  $$

- **工作磁密（方波激励）**
  $$
  B=\frac{V_p}{4N_pA_ef_s}
  $$

### Section 8 — 谐振腔与变压器设计

- **变压器匝比（半桥）**
  $$
  n=\frac{V_{in,nom}}{2(V_o+V_f)}
  $$

- **变压器匝比（全桥）**
  $$
  n=\frac{V_{in,nom}}{V_o+V_f}
  $$

- **等效交流负载电阻**
  $$
  R_{ac}=\frac{8n^2}{\pi^2}\cdot\frac{V_o^2}{P_o}
  $$

- **最大 / 最小增益需求**
  $$
  \begin{aligned}
  M_{max}&=\frac{V_{in,nom}}{V_{in,min}}\\
  M_{min}&=\frac{V_{in,nom}}{V_{in,max}}
  \end{aligned}
  $$

- **最大允许品质因数**
  $$
  Q_{max}=\min(Q_{max1},Q_{max2})
  $$

- **特征阻抗**
  $$
  Z_0=Q_s\cdot R_{ac}
  $$

- **谐振电容**
  $$
  C_r=\frac{1}{2\pi f_rZ_0}=\frac{1}{2\pi f_rQ_sR_{ac}}
  $$

- **谐振电感**
  $$
  L_r=\frac{Z_0}{2\pi f_r}=\frac{Q_sR_{ac}}{2\pi f_r}
  $$

- **励磁电感**
  $$
  L_m=k\cdot L_r=\frac{kQ_sR_{ac}}{2\pi f_r}
  $$

- **最终谐振腔公式汇总**
  $$
  L_r=\frac{Q_sR_{ac}}{2\pi f_r},\quad C_r=\frac{1}{2\pi f_rQ_sR_{ac}},\quad L_m=kL_r
  $$


---

## src/pages/Operation.tsx

> `MathBlock` LaTeX strings (normalized for Markdown rendering).

- **第一谐振频率**
  $$
  f_{r1}=\frac{1}{2\pi\sqrt{L_rC_r}}
  $$

- **第二谐振频率**
  $$
  f_{r2}=\frac{1}{2\pi\sqrt{(L_r+L_m)C_r}}=\frac{f_{r1}}{\sqrt{1+k}}
  $$

- **ZVS 能量条件（半桥）**
  $$
  \frac{1}{2}L_pI_p^2\ge\frac{1}{2}C_{oss}V_{in}^2\cdot2
  $$

- **电压增益定义**
  $$
  M=\frac{nV_{out}}{V_{in}}\;(\text{全桥})\quad M=\frac{2nV_{out}}{V_{in}}\;(\text{半桥})
  $$

- **完整 FHA LLC 电压增益方程**
  $$
  M(f_n,k,Q)=\frac{f_n^2\cdot k}{\sqrt{\left(f_n^2(1+k)-1\right)^2+k^2Q^2(f_n^2-1)^2}}
  $$

---

## src/pages/Fundamentals.tsx

> `MathBlock` LaTeX strings (normalized for Markdown rendering).

- **串联 LC 谐振频率**
  $$
  f_r=\frac{1}{2\pi\sqrt{L_rC_r}}
  $$

- **角频率关系**
  $$
  \omega_r=2\pi f_r=\frac{1}{\sqrt{L_rC_r}}
  $$

- **LLC 品质因数**
  $$
  Q=\frac{Z_r}{R_{ac}}=\frac{\sqrt{L_r/C_r}}{R_{ac}}
  $$

- **串联谐振带宽**
  $$
  BW=\frac{f_r}{Q}=f_2-f_1
  $$

- **归一化增益（全桥）**
  $$
  M=\frac{n\cdot V_{out}}{V_{in}}
  $$

- **归一化增益（半桥）**
  $$
  M=\frac{2n\cdot V_{out}}{V_{in}}
  $$

- **LLC 第一谐振频率**
  $$
  f_{r1}=\frac{1}{2\pi\sqrt{L_rC_r}}
  $$

- **LLC 第二谐振频率**
  $$
  f_{r2}=\frac{1}{2\pi\sqrt{(L_r+L_m)C_r}}=\frac{f_{r1}}{\sqrt{1+k}}
  $$

- **特征阻抗**
  $$
  Z_r=\sqrt{\frac{L_r}{C_r}}
  $$

- **品质因数**
  $$
  Q=\frac{Z_r}{R_{ac}}
  $$

- **电感比**
  $$
  k=\frac{L_m}{L_r}
  $$

- **归一化频率**
  $$
  f_n=\frac{f_{sw}}{f_{r1}}
  $$

---

## Summary

- **Output file:** `docs/code_formulas_export.md`
- **Files covered:** `src/pages/Designer.tsx`, `src/pages/Curves.tsx`, `src/pages/Report.tsx`, `src/components/CompensationSection.tsx`, `src/components/DesignCompare.tsx`, `src/pages/Derivations.tsx`, `src/pages/Operation.tsx`, `src/pages/Fundamentals.tsx`
- **Formula count:** 152 extracted expressions/formulas.
