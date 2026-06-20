# LLC Design Tool 计算公式汇总

> 本文档基于当前 `src/pages/Designer.tsx`、`Curves.tsx`、`Derivations.tsx`、`Operation.tsx`、`Fundamentals.tsx`、`Report.tsx` 中的代码与 LaTeX 公式整理，覆盖 LLC 谐振变换器的设计计算、特性曲线、公式推导与损耗估算。

---

## 1. 基础定义与谐振参数

### 1.1 谐振频率（串联谐振点）

$$f_r = f_{r1} = \frac{1}{2\pi\sqrt{L_r C_r}}$$

$$\omega_r = \omega_{r1} = 2\pi f_r = \frac{1}{\sqrt{L_r C_r}}$$

### 1.2 第二谐振频率（含励磁电感）

$$f_m = f_{r2} = \frac{1}{2\pi\sqrt{(L_r + L_m) C_r}} = \frac{f_r}{\sqrt{1 + k}}$$

### 1.3 电感比

$$k = \frac{L_m}{L_r}$$

### 1.4 特征阻抗

$$Z_r = Z_0 = \sqrt{\frac{L_r}{C_r}}$$

### 1.5 品质因数

$$Q = \frac{Z_0}{R_{ac}} = \frac{\sqrt{L_r / C_r}}{R_{ac}}$$

### 1.6 归一化频率

$$f_n = \frac{f_{sw}}{f_r}$$

### 1.7 简单 LC 谐振带宽

$$BW = \frac{f_r}{Q} = f_2 - f_1$$

---

## 2. FHA 电压增益

### 2.1 代码实现（Designer / Curves）

```ts
function calcGain(fn: number, k: number, Q: number): number {
  const a = 1 + (1 / k) * (1 - 1 / (fn * fn))
  const b = Q * (fn - 1 / fn)
  return 1 / Math.sqrt(a * a + b * b)
}
```

等价于：

$$M(f_n, k, Q) = \frac{1}{\sqrt{\left(1 + \frac{1}{k} - \frac{1}{k f_n^2}\right)^2 + \left[Q\left(f_n - \frac{1}{f_n}\right)\right]^2}}$$

### 2.2 标准形式

$$M(f_n, k, Q) = \frac{f_n^2 k}{\sqrt{\left[f_n^2(k+1) - 1\right]^2 + k^2 Q^2 (f_n^2 - 1)^2}}$$

### 2.3 特殊点

- 谐振频率处增益与 $Q$ 无关：

$$M(1, k, Q) = 1$$

- 空载（$Q \to 0$）增益：

$$M_{empty}(f_n, k) = \frac{1}{\left|1 - \frac{1}{f_n^2(1 + k)}\right|}$$

### 2.4 峰值增益

代码通过数值搜索获得：

```ts
function peakGain(k: number, q: number): number {
  let maxM = 0
  const step = 0.005
  for (let fn = 0.3; fn <= 1.0; fn += step) {
    const m = gainM(fn, k, q)
    if (m > maxM) maxM = m
  }
  return maxM
}
```

理论条件：

$$\frac{dM}{df_n} = 0 \quad \text{at} \quad f_n = f_{n,peak}$$

---

## 3. 匝比与等效负载电阻

### 3.1 匝比 n

考虑输出整流压降 $V_f$（代码中为 `vd`）：

- **半桥**：

$$n = \frac{V_{in,nom}}{2(V_o + V_f)}$$

- **全桥**：

$$n = \frac{V_{in,nom}}{V_o + V_f}$$

### 3.2 等效 AC 电阻 $R_{ac}$

代码实现：

```ts
const rac = (8 * n * n * vout * vout) / (Math.PI * Math.PI * pout)
```

即：

$$R_{ac} = \frac{8 n^2 V_o^2}{\pi^2 P_o} = \frac{8 n^2 R_L}{\pi^2}$$

> 注：推导页面同时给出中心抽头整流形式 $R_{ac} = \dfrac{2 n^2 R_L}{\pi^2}$，当前 Designer 统一使用全波整流形式。

### 3.3 最小负载对应的等效电阻

```ts
const pMin = pout * (loadMin / 100)
const racMin = rac * (pout / pMin)
```

即负载越轻，$R_{ac}$ 越大：

$$R_{ac,min} = R_{ac} \cdot \frac{P_o}{P_{min}}$$

---

## 4. 设计所需增益与频率范围

### 4.1 输入电压范围对应的归一化增益

$$M_{max} = \frac{V_{in,nom}}{V_{in,min}} \quad (\text{最低输入时需要最大增益})$$

$$M_{min} = \frac{V_{in,nom}}{V_{in,max}} \quad (\text{最高输入时需要最小增益})$$

### 4.2 空载峰值增益（Region 1 极限）

$$M_{max,empty} = 1 + \frac{1}{k}$$

### 4.3 k 的最小值

$$k_{min} = \frac{1}{M_{max} - 1}$$

### 4.4 最高工作频率 $f_{max}$（Region 1）

仅当 $M_{min} \ge \dfrac{k}{k+1}$ 时可行：

$$f_{max} = f_r \sqrt{\frac{M_{min}}{M_{min}(k+1) - k}}$$

### 4.5 最低工作频率 $f_{min}$（Region 2）

$$f_{min} = f_r \sqrt{\frac{M_{max}}{M_{max}(k+1) - k}}$$

---

## 5. Qmax 约束与元件参数

### 5.1 Qmax1：峰值增益约束

通过二分查找满足：

$$M_{peak}(k, Q_{max1}) = M_{max}$$

```ts
function findQmax1(kVal: number, targetGain: number): number { /* 二分搜索 */ }
```

### 5.2 Qmax2：ZVS 死区时间约束

```ts
const region1MinGain = k / (k + 1)
const fmaxFeasible = gMin >= region1MinGain
const fmaxEst = fmaxFeasible
  ? fr * Math.sqrt(Math.max(0.001, gMin / Math.max(1e-9, gMin * (k + 1) - k)))
  : Infinity

const cossTotal = Math.max(1e-12, 2 * cossEr + cj)

const qmax2 = fmaxFeasible
  ? ((k + 1) * vinMin * vinMin
      / Math.max(1e-15, 16 * fmaxEst * fmaxEst * k * k * cossTotal * vinMax * vinMax))
    * (2 * Math.PI * fr) / Math.max(1e-6, racMin)
  : Infinity
```

> 注：系数 16 来源于半桥 LLC 死区时间近似公式 \( t_{dead} = 16 \cdot C_{eq} \cdot f_r \cdot L_m \) 的反推。
> 若拓扑为全桥或死区定义不同，该系数需重新推导。

### 5.3 Qmax3：ZVS 能量约束（Coss 能量上限）

由励磁电感储能在 $f_{max}$ 处不小于总开关节点电容能量推导出的 $Q$ 上限：

$$Q_{max3} = \frac{2\pi f_r V_{in,min}^2}{c_{oeff}^2 \, f_{max,est}^2 \, k \, C_{oss,total} \, V_{in,max}^2 \, R_{ac,min}}$$

其中：
- $c_{oeff} = 8$（半桥），$4$（全桥）
- $C_{oss,total} = 2C_{oss,er} + C_j$

```ts
const zvsCoeff = topology === 'half-bridge' ? 8 : 4
const qmax3 = fmaxFeasible
  ? (2 * Math.PI * fr * vinMin * vinMin)
    / Math.max(1e-15,
        zvsCoeff * zvsCoeff * fmaxEst * fmaxEst * k * cossTotal * vinMax * vinMax * Math.max(1e-6, racMin))
  : Infinity
```

> 注：旧版代码中 `Qmax3` 公式量纲不一致（`\sqrt{R_{ac} C_{oss}}` 单位为 $\sqrt{s}$），会把 $Q$ 压得过低、导致 $C_r$ 异常偏大。当前版本已修正为与后续 ZVS 能量校验一致的推导式。

### 5.4 实际取用的 Q

$$Q_{max} = \min(Q_{max1}, Q_{max2}, Q_{max3})$$

$$Q = 0.95 \cdot Q_{max}$$

### 5.5 由 Q 反推元件值

$$Z_0 = Q \cdot R_{ac,min}$$

$$L_r = \frac{Z_0}{2\pi f_r}$$

$$C_r = \frac{1}{2\pi f_r Z_0}$$

$$L_m = k \cdot L_r$$

---

## 6. ZVS 条件

### 6.1 励磁电流峰值（死区时间内）

- **全桥**：

$$I_{m,off} = \frac{V_{in,min}}{4 f_{max} L_m}$$

- **半桥**：

$$I_{m,off} = \frac{V_{in,min}}{8 f_{max} L_m}$$

代码实现：

```ts
const fmaxZvs = Number.isFinite(fmax) ? fmax : fr
const imDeadtime = vinMin / Math.max(1e-9,
  (topology === 'half-bridge' ? 8 : 4) * fmaxZvs * lm)
```

### 6.2 ZVS 能量判断

电感储能：

$$E_r = \frac{1}{2} L_m I_{m,off}^2$$

结电容储能：

$$E_c = \frac{1}{2} C_{oss,total} V_{in,max}^2$$

ZVS 条件：

$$E_r \ge E_c$$

### 6.3 ZVS 时间判断

$$t_{ZVS} = \frac{C_{oss,total} \cdot V_{in,max}}{I_{m,off}}$$

条件：

$$t_{ZVS} \le T_d$$

### 6.4 感性区相位（$f_n = 1$ 处，归一化形式）

令 $x = kQ$，则归一化输入阻抗：

$$\frac{\text{Re}(Z_{in})}{Z_0} = \frac{x^2}{1 + x^2}, \quad \frac{\text{Im}(Z_{in})}{Z_0} = \frac{x}{1 + x^2}$$

$$\varphi = \arctan\left(\frac{1}{x}\right) \cdot \frac{180}{\pi} = \arctan\left(\frac{1}{kQ}\right) \cdot \frac{180}{\pi}$$

---

## 7. 电流应力

### 7.1 输出电流

$$I_o = \frac{P_o}{V_o}$$

### 7.2 次级电流有效值

- **中心抽头整流**（每绕组半波）：

$$I_{sec,rms} = \frac{\pi}{4} I_o \approx 0.785 I_o$$

- **全波 / 全桥整流**：

$$I_{sec,rms} = \frac{\pi}{2\sqrt{2}} I_o \approx 1.11 I_o$$

### 7.3 初级谐振电流有效值

基波电压峰值：

- 半桥：$V_{FHA,peak} = \dfrac{2 V_{in}}{\pi}$
- 全桥：$V_{FHA,peak} = \dfrac{4 V_{in}}{\pi}$

代码取 RMS：

```ts
const vFund = topology === 'half-bridge'
  ? vinNom * 2 / Math.PI
  : vinNom * 4 / Math.PI
const irRms = vFund / (Math.sqrt(2) * rac)
```

即：

$$I_{r,rms} = \frac{V_{FHA,rms}}{R_{ac}}$$

### 7.4 励磁电流有效值

- 半桥：$V_{Lm} = V_{in}/2$
- 全桥：$V_{Lm} = V_{in}$

$$I_{m,rms} = \frac{V_{Lm}}{4\sqrt{3} f_r L_m}$$

### 7.5 初级总电流

$$I_{p,rms} = \sqrt{I_{r,rms}^2 + I_{m,rms}^2}$$

### 7.6 峰值电流估算（推导页面）

$$I_{pk} = \frac{2n(V_o + V_f)}{\pi Z_0 Q} + \frac{n(V_o + V_f)}{2 f_s L_m}$$

$$I_{rms} = \frac{I_{pk}}{\sqrt{2}}$$

---

## 8. 输入阻抗（Curves 页面）

```ts
function calcImpedance(fn: number, k: number, Q: number) {
  const denom = Q * Q + fn * fn * k * k
  const re = (Q * fn * fn * k * k) / denom
  const im = (fn - 1 / fn) + (Q * Q * fn * k) / denom
  const mag = Math.sqrt(re * re + im * im)
  const phase = Math.atan2(im, re) * (180 / Math.PI)
  return { mag, phase }
}
```

对应：

$$\text{Re}(Z_{in}) = Z_0 \cdot \frac{f_n^2 k^2 Q}{Q^2 + f_n^2 k^2}$$

$$\text{Im}(Z_{in}) = Z_0 \left( f_n - \frac{1}{f_n} + \frac{f_n k Q^2}{Q^2 + f_n^2 k^2} \right)$$

$$|Z_{in}| = \sqrt{\text{Re}^2 + \text{Im}^2}$$

$$\varphi_{Zin} = \arctan\left(\frac{\text{Im}}{\text{Re}}\right) \cdot \frac{180}{\pi}$$

感性/容性边界：

$$\text{Im}(Z_{in}) = 0$$

---

## 9. 损耗估算（Designer 损耗面板）

### 9.1 MOSFET 导通损耗

$$P_{cond,per} = \frac{1}{2} I_{p,rms}^2 R_{ds(on)}$$

$$P_{cond} = P_{cond,per} \cdot N_{switches}$$

其中 $N_{switches} = 2$（半桥）或 $4$（全桥）。

### 9.2 开关损耗（线性近似）

$$P_{on} = \frac{1}{2} V_{in} I_{p,peak} \frac{t_r}{1\,\text{ns 单位}} f_s N_{switches}$$

$$P_{off} = \frac{1}{2} V_{in} I_{p,peak} \frac{t_f}{1\,\text{ns 单位}} f_s N_{switches}$$

### 9.3 Coss 损耗

$$E_{Coss} = \frac{1}{2} C_{oss} V_{in}^2 \cdot \frac{2}{3}$$

$$P_{Coss} = E_{Coss} f_s N_{switches}$$

> 注：系数 2/3 考虑了 MOSFET 结电容 \( C_{oss} \) 随 \( V_{ds} \) 的非线性变化。
> 不同厂商/型号的 \( C_{oss} \) 非线性特性不同，精确损耗建议查手册 \( E_{oss} \) 曲线。

### 9.4 体二极管导通损耗

$$I_{diode} = 0.7 I_{p,peak}$$

$$P_{diode} = V_{sd} I_{diode} t_d f_s N_{switches}$$

> 注：0.7 为经验系数，实际体二极管电流波形因死区时间、\( C_{oss} \) 充放电波形而异。
> 精确估算需时域仿真或示波器实测。

### 9.5 磁芯损耗（Steinmetz）

$$B_{peak} = \frac{V_{in} / (2\;\text{或}\;1)}{4 f_s N_p A_e}$$

$$P_{core} = C_m f^\alpha (B_{peak} \cdot 1000)^\beta V_e$$

### 9.6 绕组损耗

$$P_{winding} = I_{p,rms}^2 R_{dc} \left[1 + \left(\frac{f_s}{f_0}\right)^2\right]$$

### 9.7 整流损耗

**同步整流**：

$$P_{rect} = N_{sync} \cdot \left(\frac{I_{sec,rms}}{\sqrt{2}}\right)^2 R_{ds(on),sync}$$

其中中心抽头 $N_{sync}=2$，全桥 $N_{sync}=4$。

**二极管整流**：

$$P_{rect} = N_{diode} \cdot V_f \cdot \frac{I_o}{2}$$

其中中心抽头 $N_{diode}=2$，全桥 $N_{diode}=4$。

### 9.8 谐振元件损耗

$$P_{res} = I_{p,rms}^2 (R_{Lr} + R_{Cr})$$

### 9.9 总损耗与效率

$$P_{loss,total} = \sum P$$

$$\eta = \frac{P_o}{P_o + P_{loss,total}} \times 100\%$$

---

## 10. 推导页面完整公式

### 10.1 谐振频率与基本参数

$$\omega_r = \frac{1}{\sqrt{L_r C_r}} \quad \Rightarrow \quad f_r = \frac{1}{2\pi\sqrt{L_r C_r}}$$

$$\omega_m = \frac{1}{\sqrt{(L_r + L_m) C_r}} \quad \Rightarrow \quad f_m = \frac{1}{2\pi\sqrt{(L_r + L_m) C_r}}$$

$$f_m = \frac{f_r}{\sqrt{1 + k}}$$

### 10.2 FHA 基波电压

- 半桥有效值：

$$V_{ab,1} = \frac{2\sqrt{2}}{\pi} V_{in}$$

- 全桥有效值：

$$V_{ab,1} = \frac{4\sqrt{2}}{\pi} V_{in}$$

### 10.3 等效 AC 电阻

$$R_{ac} = \frac{8n^2}{\pi^2} \cdot R_L = \frac{8n^2}{\pi^2} \cdot \frac{V_o^2}{P_o}$$

### 10.4 电压增益完整推导

分压形式：

$$M = \left| \frac{Z_2}{Z_1 + Z_2} \right|$$

展开后两种等价形式：

$$M(f_n, k, Q) = \frac{1}{\sqrt{\left(1 + \frac{1}{k} - \frac{1}{k f_n^2}\right)^2 + \left[Q\left(f_n - \frac{1}{f_n}\right)\right]^2}}$$

$$M(f_n, k, Q) = \frac{f_n^2 k}{\sqrt{\left[f_n^2(k+1) - 1\right]^2 + k^2 Q^2 (f_n^2 - 1)^2}}$$

### 10.5 峰值增益条件

令 $x = f_n^2$，则：

$$M^2 = \frac{x^2 k^2}{\left[x(k+1) - 1\right]^2 + x k^2 Q^2 (x-1)^2}$$

峰值点满足：

$$\frac{dM}{df_n} = 0 \quad \text{at} \quad f_n = f_{n,peak}$$

### 10.6 输入阻抗

$$Z_{in} = j\omega_s L_r + \frac{1}{j\omega_s C_r} + \left(j\omega_s L_m \parallel R_{ac}\right)$$

$$Z_{in} = jZ_0\left(f_n - \frac{1}{f_n}\right) + \frac{j f_n Z_0 k}{1 + j f_n k Q}$$

实部与虚部：

$$\text{Re}(Z_{in}) = Z_0 \cdot \frac{f_n^2 k^2 Q}{Q^2 + f_n^2 k^2}$$

$$\text{Im}(Z_{in}) = Z_0 \left( f_n - \frac{1}{f_n} + \frac{f_n k Q^2}{Q^2 + f_n^2 k^2} \right)$$

### 10.7 ZVS 能量条件

$$\frac{1}{2} L_m I_{m,off}^2 \ge \frac{1}{2} C_{oss} V_{in}^2$$

### 10.8 器件应力

- 初级 MOSFET 最大耐压：

$$V_{ds,max} = V_{in,max}$$

- 次级整流二极管反向耐压：
  - **中心抽头**整流：$V_{RRM} = 2V_o$
  - **全桥 / 全波**整流：$V_{RRM} = V_o$

- 次级整流二极管平均电流：

$$I_{avg} = \frac{I_o}{2}$$

- 谐振电容 RMS 电流：

$$I_{C_r,rms} = I_{r,rms}$$

- 初级总电流：

$$I_{p,rms} = \sqrt{I_{r,rms}^2 + I_{m,rms}^2}$$

### 10.9 损耗公式（推导页面）

- MOSFET 导通损耗：

$$P_{cond} = I_{rms}^2 R_{ds(on)}$$

- 体二极管导通损耗：

$$P_{diode} = V_f I_{avg,diode}$$

- 开关损耗：

$$P_{off} = \frac{1}{2} V_{in} I_{m,pk} (t_r + t_f) f_s$$

- 驱动损耗：

$$P_{drv} = Q_g V_{drv} f_s$$

- MOSFET 总损耗：

$$P_{total,MOS} = P_{cond} + P_{diode} + P_{off} + P_{drv}$$

- 次级二极管导通损耗：

$$P_{cond,D} = V_f I_o$$

- 二极管反向恢复损耗：

$$P_{rr} = \frac{1}{2} Q_{rr} V_{RRM} f_s$$

- 变压器铜损：

$$P_{Cu} = I_p^2 R_{ac,pri} + I_s^2 R_{ac,sec}$$

- 变压器磁芯损耗（Steinmetz）：

$$P_{core} = C_m f^\alpha B^\beta V_e$$

其中磁通密度：

$$B = \frac{V_p}{4 N_p A_e f_s}$$

### 10.10 设计流程公式

- 匝比：

$$n = \frac{V_{in,nom}}{2(V_o + V_f)} \quad (\text{半桥})$$

$$n = \frac{V_{in,nom}}{V_o + V_f} \quad (\text{全桥})$$

- 等效负载：

$$R_{ac} = \frac{8n^2}{\pi^2} \cdot \frac{V_o^2}{P_o}$$

- 所需增益范围：

$$M_{max} = \frac{V_{in,nom}}{V_{in,min}}, \quad M_{min} = \frac{V_{in,nom}}{V_{in,max}}$$

- 最大 Q 值：

$$Q_{max} = \min(Q_{max1}, Q_{max2})$$

- 特征阻抗与元件值：

$$Z_0 = Q_s R_{ac}$$

$$C_r = \frac{1}{2\pi f_r Z_0} = \frac{1}{2\pi f_r Q_s R_{ac}}$$

$$L_r = \frac{Z_0}{2\pi f_r} = \frac{Q_s R_{ac}}{2\pi f_r}$$

$$L_m = k L_r = \frac{k Q_s R_{ac}}{2\pi f_r}$$

---

## 11. 报告页面公式

报告中的计算与 Designer 保持一致：

- 匝比：$n = V_{in,nom}/(2V_o)$（半桥）或 $V_{in,nom}/V_o$（全桥）
- $R_{ac} = 8n^2V_o^2/(\pi^2 P_o)$
- $Z_r = \sqrt{L_r/C_r}$
- 所需增益：$M = 2nV_o/V_{in}$（半桥）或 $nV_o/V_{in}$（全桥）
- 设计裕量：$\dfrac{M_{max}}{M_{required}} - 1$
- 次级整流耐压：$2.5 V_o$（中心抽头）或 $2 V_o$（全桥）

---

## 12. 最大磁密峰值校验（正向设计公式）

### 12.1 电流峰值法（推荐用于二次校验）

$$B_m = \frac{L_m \cdot I_{m\_peak}}{N_1 \cdot A_e}$$

其中：

- $L_m$：励磁电感 [H]
- $I_{m\_peak}$：励磁电感电流峰值 [A]（即原文档中的 $I_{\text{mmax}}$）
- $N_1$：变压器原边匝数
- $A_e$：磁芯有效截面积 [m²]

### 12.2 电压-匝数-频率法（等价形式）

正弦波近似下，最大磁密峰值也可由法拉第感应定律求得：

$$B_m = \frac{V_{in}}{4 \cdot f_{sw} \cdot N_1 \cdot A_e}$$

> **应用场景区分**：
> - 用 $B = \dfrac{V}{4fNA_e}$ 进行 **初步匝数设计**（确定 $N_1$）；
> - 用 $B = \dfrac{L \cdot I}{N \cdot A_e}$ 进行 **电流峰值二次校验**（验算磁芯裕量）。
>
> **禁止使用** $B = \dfrac{\mu_0 N I}{\delta}$ 进行 LLC 变压器的饱和校验——该公式仅适用于已知气隙长度的电感器设计，在 LLC 变压器设计中会导致物理概念错误。

---

*文档生成时间：2026-06-20*
