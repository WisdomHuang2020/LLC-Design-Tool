# LLC Design Tool 计算公式汇总

> 本文档从 `src/pages/Designer.tsx`、`Curves.tsx`、`Derivations.tsx`、`Operation.tsx`、`Fundamentals.tsx`、`Report.tsx` 中提取并整理，覆盖设计计算、曲线绘制、公式推导与损耗估算。

---

## 1. 基础定义与谐振参数

### 1.1 谐振频率

$$f_{r1} = \frac{1}{2\pi\sqrt{L_r C_r}}$$

$$\omega_{r1} = 2\pi f_{r1} = \frac{1}{\sqrt{L_r C_r}}$$

### 1.2 第二谐振频率（含励磁电感）

$$f_{r2} = \frac{1}{2\pi\sqrt{(L_r + L_m) C_r}} = \frac{f_{r1}}{\sqrt{1 + k}}$$

其中电感比：

$$k = \frac{L_m}{L_r}$$

### 1.3 特征阻抗

$$Z_r = Z_0 = \sqrt{\frac{L_r}{C_r}}$$

### 1.4 品质因数

$$Q = \frac{Z_r}{R_{ac}} = \frac{\sqrt{L_r/C_r}}{R_{ac}}$$

### 1.5 归一化频率

$$f_n = \frac{f_{sw}}{f_{r1}}$$

### 1.6 简单 LC 谐振带宽

$$BW = \frac{f_r}{Q} = f_2 - f_1$$

---

## 2. FHA 电压增益

### 2.1 代码实现（Designer / Curves）

```ts
function gainM(fn: number, k: number, q: number): number {
  const a = 1 + (1 / k) * (1 - 1 / (fn * fn))
  const b = q * (fn - 1 / fn)
  return 1 / Math.sqrt(a * a + b * b)
}
```

即：

$$M(f_n, k, Q) = \frac{1}{\sqrt{\left(1 + \frac{1}{k} - \frac{1}{k f_n^2}\right)^2 + \left[Q\left(f_n - \frac{1}{f_n}\right)\right]^2}}$$

### 2.2 标准形式（Derivations / Operation）

$$M(f_n, k, Q) = \frac{f_n^2 k}{\sqrt{\left[f_n^2(k+1) - 1\right]^2 + k^2 Q^2 (f_n^2 - 1)^2}}$$

### 2.3 峰值增益

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

$$\frac{dM}{df_n} = 0 \quad \text{at} \quad f_n = f_{n,\text{peak}}$$

---

## 3. 匝比与等效负载电阻

### 3.1 匝比 n

考虑整流二极管压降 $V_d$：

- **半桥**：

$$n = \frac{V_{in,nom}}{2(V_{out} + V_d)}$$

- **全桥**：

$$n = \frac{V_{in,nom}}{V_{out} + V_d}$$

### 3.2 等效 AC 电阻 $R_{ac}$

代码实现（Designer）使用全波整流形式：

```ts
const rac = (8 * n * n * vout * vout) / (Math.PI * Math.PI * pout)
```

即：

$$R_{ac} = \frac{8 n^2 V_{out}^2}{\pi^2 P_{out}} = \frac{8 n^2 R_{load}}{\pi^2}$$

推导页面同时给出：

- **全波 / 全桥整流**：

$$R_{ac} = \frac{8 n^2 R_{load}}{\pi^2}$$

- **中心抽头整流**：

$$R_{ac} = \frac{2 n^2 R_{load}}{\pi^2}$$

### 3.3 最小负载对应的等效电阻

```ts
const pMin = pout * (loadMin / 100)
const racMin = rac * (pout / pMin)
```

即负载越轻，$R_{ac}$ 越大：

$$R_{ac,min} = R_{ac} \cdot \frac{P_{out}}{P_{min}}$$

---

## 4. 设计所需增益与频率范围

### 4.1 输入电压范围对应的归一化增益

$$G_{max} = \frac{V_{in,nom}}{V_{in,min}} \quad (\text{最低输入时需要最大增益})$$

$$G_{min} = \frac{V_{in,nom}}{V_{in,max}} \quad (\text{最高输入时需要最小增益})$$

### 4.2 空载峰值增益（Region 1 极限）

$$G_{max,empty} = 1 + \frac{1}{k}$$

### 4.3 k 的最小值

$$k_{min} = \frac{1}{G_{max} - 1}$$

### 4.4 最高工作频率 $f_{max}$（Region 1，$f_n > 1$）

仅当 $G_{min} \ge \dfrac{k}{k+1}$ 时可行：

$$f_{max} = f_{r1} \sqrt{\frac{G_{min}}{G_{min}(k+1) - k}}$$

### 4.5 最低工作频率 $f_{min}$（Region 2，$f_n < 1$）

$$f_{min} = f_{r1} \sqrt{\frac{G_{max}}{G_{max}(k+1) + k}}$$

---

## 5. Qmax 约束与元件参数

### 5.1 Qmax1：峰值增益约束

通过二分查找满足：

$$M_{peak}(k, Q_{max1}) = G_{max}$$

```ts
function findQmax1(kVal: number, targetGain: number): number { /* 二分搜索 */ }
```

### 5.2 Qmax2：ZVS 死区时间约束

```ts
const fmaxEst = fmaxFeasible
  ? fr * Math.sqrt(Math.max(0.001, gMin / Math.max(1e-9, gMin * (k + 1) - k)))
  : Infinity

const qmax2 = fmaxFeasible
  ? ((k + 1) * vinMin * vinMin
      / Math.max(1e-15, 16 * fmaxEst * fmaxEst * k * k * cossTotal * vinMax * vinMax))
    * (2 * Math.PI * fr) / Math.max(1e-6, racMin)
  : Infinity
```

### 5.3 Qmax3：Coss 能量约束

```ts
const cEq = Math.max(1, 2 * cossEq + cj)
const qmax3 = fmaxFeasible
  ? Math.sqrt(Math.max(0,
      (k + 1) * (k + 1)
      * ((fmaxEst * fmaxEst) / (fr * fr) - 1)
      * Math.max(1e-6, racMin) * cEq))
  : Infinity
```

### 5.4 实际取用的 Q

$$Q_{max} = \min(Q_{max1}, Q_{max2}, Q_{max3})$$

$$Q = 0.95 \cdot Q_{max}$$

### 5.5 由 Q 反推元件值

$$Z_r = Q \cdot R_{ac,min}$$

$$L_r = \frac{Z_r}{2\pi f_{r1}}$$

$$C_r = \frac{1}{2\pi f_{r1} Z_r}$$

$$L_m = k \cdot L_r$$

---

## 6. ZVS 条件

### 6.1 励磁电流峰值（死区时间内）

- **全桥**：

$$I_m = \frac{V_{in,min}}{4 f_{max} L_m}$$

- **半桥**：

$$I_m = \frac{V_{in,min}}{8 f_{max} L_m}$$

代码实现：

```ts
const imDeadtime = vinMin / Math.max(1e-9,
  (topology === 'half-bridge' ? 8 : 4) * fmaxZvs * lm)
```

### 6.2 ZVS 能量判断

电感储能：

$$E_r = \frac{1}{2} L_m I_m^2$$

结电容储能：

$$E_c = \frac{1}{2} C_{oss,total} V_{in,max}^2$$

其中代码取：

```ts
const cossTotal = Math.max(1, 2 * cossEr + cj)
```

ZVS 条件：

$$E_r \ge E_c$$

### 6.3 ZVS 时间判断

$$t_{ZVS} = \frac{C_{oss,total} \cdot V_{in,max}}{I_m}$$

条件：

$$t_{ZVS} \le T_d$$

### 6.4 感性区相位（$f_n = 1$ 处）

令 $x = k Q$，则：

$$\text{Re}(Z_{in}) = \frac{x^2}{1 + x^2}, \quad \text{Im}(Z_{in}) = \frac{x}{1 + x^2}$$

$$\varphi = \arctan\left(\frac{\text{Im}}{\text{Re}}\right) \cdot \frac{180}{\pi}$$

---

## 7. 电流应力

### 7.1 输出电流

$$I_o = \frac{P_{out}}{V_{out}}$$

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

$$I_{m,rms} = \frac{V_{Lm}}{4\sqrt{3} f_{r1} L_m}$$

### 7.5 初级总电流

$$I_{p,rms} = \sqrt{I_{r,rms}^2 + I_{m,rms}^2}$$

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

---

## 9. 损耗估算（Designer 损耗面板）

### 9.1 MOSFET 导通损耗

$$P_{cond,per} = \frac{1}{2} I_{p,rms}^2 R_{ds(on)}$$

$$P_{cond} = P_{cond,per} \cdot N_{switches}$$

其中 $N_{switches} = 2$（半桥）或 $4$（全桥）。

### 9.2 开关损耗（线性近似）

$$P_{on} = \frac{1}{2} V_{in} I_{p,peak} \frac{t_r}{1\,\text{ns 单位}} f_{sw} N_{switches}$$

$$P_{off} = \frac{1}{2} V_{in} I_{p,peak} \frac{t_f}{1\,\text{ns 单位}} f_{sw} N_{switches}$$

### 9.3 Coss 损耗

$$E_{Coss} = \frac{1}{2} C_{oss} V_{in}^2 \cdot \frac{2}{3}$$

$$P_{Coss} = E_{Coss} f_{sw} N_{switches}$$

### 9.4 体二极管导通损耗

$$I_{diode} = 0.7 I_{p,peak}$$

$$P_{diode} = V_{sd} I_{diode} t_d f_{sw} N_{switches}$$

### 9.5 磁芯损耗（Steinmetz）

$$B_{peak} = \frac{V_{in} / (2\;\text{or}\;1)}{4 f_{sw} N_p A_e}$$

$$P_{core} = k f^\alpha (B_{peak} \cdot 1000)^\beta V_e$$

### 9.6 绕组损耗

$$P_{winding} = I_{p,rms}^2 R_{dc} \left[1 + \left(\frac{f_{sw}}{f_0}\right)^2\right]$$

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

$$\eta = \frac{P_{out}}{P_{out} + P_{loss,total}} \times 100\%$$

---

## 10. 推导页面完整公式

### 10.1 FHA 基波电压

- 全桥：

$$v_{AB}^{FB}(t) = \frac{4V_{in}}{\pi} \sum_{\substack{n=1 \\ n\text{ odd}}}^{\infty} \frac{1}{n} \sin(n\omega_s t)$$

- 半桥：

$$v_{AB}^{HB}(t) = \frac{2V_{in}}{\pi} \sum_{\substack{n=1 \\ n\text{ odd}}}^{\infty} \frac{1}{n} \sin(n\omega_s t)$$

基波分量：

$$v_{AB,1}^{FB}(t) = \frac{4V_{in}}{\pi} \sin(\omega_s t), \quad v_{AB,1}^{HB}(t) = \frac{2V_{in}}{\pi} \sin(\omega_s t)$$

峰值与有效值：

$$V_{AB,1,peak}^{FB} = \frac{4V_{in}}{\pi}, \quad V_{AB,1,rms}^{FB} = \frac{2\sqrt{2}V_{in}}{\pi}$$

$$V_{AB,1,peak}^{HB} = \frac{2V_{in}}{\pi}, \quad V_{AB,1,rms}^{HB} = \frac{\sqrt{2}V_{in}}{\pi}$$

### 10.2 等效 AC 电阻推导

次级基波电压峰值：

$$V_{sec,1,peak} = \frac{4nV_{out}}{\pi}$$

次级基波电流峰值：

$$I_{sec,1,peak} = \frac{\pi I_{out}}{2n}$$

有效值：

$$I_{sec,1,rms} = \frac{\pi I_{out}}{2\sqrt{2}n}$$

全桥整流：

$$R_{ac} = \frac{V_{sec,1,rms}}{I_{sec,1,rms}} = \frac{8n^2 R_{load}}{\pi^2}$$

中心抽头整流：

$$R_{ac} = \frac{2n^2 R_{load}}{\pi^2}$$

### 10.3 增益公式推导

串联支路阻抗：

$$Z_s = j\omega_s L_r + \frac{1}{j\omega_s C_r} = jZ_0\left(f_n - \frac{1}{f_n}\right)$$

并联支路阻抗：

$$Z_p = j\omega_s L_m \parallel R_{ac} = \frac{j f_n Z_0 k}{1 + j f_n k Q}$$

总输入阻抗：

$$Z_{in} = Z_s + Z_p = jZ_0\left(f_n - \frac{1}{f_n}\right) + \frac{j f_n Z_0 k}{1 + j f_n k Q}$$

电压增益：

$$M = \left|\frac{Z_p}{Z_{in}}\right|$$

展开后：

$$M = \frac{f_n^2 k}{\sqrt{\left[f_n^2(k+1) - 1\right]^2 + k^2 Q^2 (f_n^2 - 1)^2}}$$

等价形式：

$$M = \frac{1}{\sqrt{\left(1 + \frac{1}{k} - \frac{1}{k f_n^2}\right)^2 + \left[Q\left(f_n - \frac{1}{f_n}\right)\right]^2}}$$

### 10.4 输入阻抗实部与虚部

$$\text{Re}(Z_{in}) = Z_0 \cdot \frac{f_n^2 k^2 Q}{Q^2 + f_n^2 k^2}$$

$$\text{Im}(Z_{in}) = Z_0 \left( f_n - \frac{1}{f_n} + \frac{f_n k Q^2}{Q^2 + f_n^2 k^2} \right)$$

感性/容性边界：

$$\text{Im}(Z_{in}) = 0$$

### 10.5 元件选择公式

$$Z_0 = Q R_{ac}$$

$$Z_0 = \sqrt{\frac{L_r}{C_r}} = \omega_{r1} L_r = \frac{1}{\omega_{r1} C_r}$$

$$L_r = \frac{Q R_{ac}}{2\pi f_{r1}}$$

$$C_r = \frac{1}{2\pi f_{r1} Q R_{ac}}$$

$$L_m = k L_r = \frac{k Q R_{ac}}{2\pi f_{r1}}$$

### 10.6 电流应力（推导页面）

$$I_{r,rms} = \frac{V_{FHA,rms}}{|Z_{in}|} = \frac{2\sqrt{2}V_{in}}{\pi |Z_{in}|}$$

谐振频率处：

$$I_{r,rms}(f_{r1}) = \frac{2\sqrt{2}V_{in}}{\pi R_{ac}} = \frac{2\sqrt{2}V_{in} Q}{\pi Z_0}$$

励磁电流（全桥）：

$$I_{m,rms} = \frac{V_{FHA,rms}}{\omega_s L_m} = \frac{2\sqrt{2}V_{in}}{\pi \omega_s L_m}$$

半桥时上述值为一半。

### 10.7 ZVS 能量条件（Operation 页面）

$$\frac{1}{2} L_p I_p^2 \ge \frac{1}{2} C_{oss} V_{in}^2 \cdot 2$$

---

## 11. 报告页面公式

报告中的增益与应力计算与 Designer 保持一致：

- 匝比：$n = V_{in,nom}/(2V_{out})$（半桥）或 $V_{in,nom}/V_{out}$（全桥）
- $R_{ac} = 8n^2V_{out}^2/(\pi^2 P_{out})$
- $Z_r = \sqrt{L_r/C_r}$
- 所需增益：$M = 2nV_{out}/V_{in}$（半桥）或 $nV_{out}/V_{in}$（全桥）
- 设计裕量：$\dfrac{M_{max}}{M_{required}} - 1$
- 次级整流耐压：$2.5 V_{out}$（中心抽头）或 $2 V_{out}$（全桥）

---

*文档生成时间：2026-06-20*
