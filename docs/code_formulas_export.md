# LLC 设计工具 — 代码公式导出

本文档全面提取自当前 LLC 设计工具源代码（`src/`）中的算术/设计计算表达式及显示的数学公式。

- **代码计算文件**（`Designer.tsx`、`Curves.tsx`、`Report.tsx`、`CompensationSection.tsx`、`DesignCompare.tsx`）：提取为 Markdown/LaTeX 公式，并附简要说明。
- **推导页面**（`Derivations.tsx`、`Operation.tsx`、`Fundamentals.tsx`）：提取自 `MathBlock latex="..."` / `MathBlock` 的 KaTeX 字符串。
- `Qmax2`/`16`、`Coss` 损耗 `2/3`、体二极管 `0.7` 的工程注释插入在相关公式出现的位置。

---

## 1. `src/pages/Designer.tsx` — 主设计计算与损耗分析

### 1.1 E 系列标准值辅助函数

最近标准值：

$$
\text{exponent} = \lfloor \log_{10}(\text{value}) \rfloor,\quad
\text{mantissa} = \frac{\text{value}}{10^{\text{exponent}}}
$$

返回 `E12`/`E24` 中最接近的尾数乘以 $10^{\text{exponent}}$。

### 1.2 LLC 电压增益（FHA）

$$
M(f_n,k,Q) = \frac{1}{\sqrt{\left[1 + \frac{1}{k}\left(1 - \frac{1}{f_n^{2}}\right)\right]^{2} + \left[Q\left(f_n - \frac{1}{f_n}\right)\right]^{2}}}
$$

代码实现（`gainM`）：

```ts
const a = 1 + (1 / k) * (1 - 1 / (fn * fn))
const b = q * (fn - 1 / fn)
return 1 / Math.sqrt(a * a + b * b)
```

**注：** 峰值增益通过对 $f_n = 0.3 \sim 1.0$ 进行数值搜索得到（`peakGain`）。

### 1.3 谐振点处的 ZVS 相位

在 $f_n = 1$ 处，令 $x = kQ$。输入阻抗相位为：

$$
\varphi = \arctan2\left(\frac{x}{1+x^{2}},\; \frac{x^{2}}{1+x^{2}}\right) \times \frac{180}{\pi}
$$

代码（`zvsPhase`）：

```ts
const x = k * q
const real = (x * x) / (1 + x * x)
const imag = x / (1 + x * x)
return Math.atan2(imag, real) * (180 / Math.PI)
```

### 1.4 主设计计算流程（`handleCalculate`）

#### 单位换算

$$
f_{sw} = f_{sw,\text{kHz}} \times 1000,\quad
C_{ossEq} = C_{ossEq,\text{pF}} \times 10^{-12},\quad
C_{ossEr} = C_{ossEr,\text{pF}} \times 10^{-12},\quad
C_j = C_{j,\text{pF}} \times 10^{-12},\quad
T_d = T_{d,\text{ns}} \times 10^{-9}
$$

#### 等效输出电压

$$
V_{out,eff} = V_{out} + V_d
$$

#### 变压器匝比

$$
n = \begin{cases}
\dfrac{V_{in,nom}}{2V_{out,eff}} & \text{半桥} \\[6pt]
\dfrac{V_{in,nom}}{V_{out,eff}} & \text{全桥}
\end{cases}
$$

#### 所需归一化增益

$$
G_{max} = \frac{V_{in,nom}}{V_{in,min}},\quad
G_{min} = \frac{V_{in,nom}}{V_{in,max}},\quad
G_{nom} = 1.0
$$

#### 空载 Region-1 增益与最小 $k$

$$
G_{empty} = 1 + \frac{1}{k},\qquad
k_{min} = \frac{1}{G_{max} - 1}
$$

#### 谐振频率

$$
f_r = f_{sw}
$$

#### 等效交流电阻

$$
R_{ac} = \frac{8 n^{2} V_{out}^{2}}{\pi^{2} P_{out}}
$$

#### 轻载 $R_{ac}$

$$
P_{min} = P_{out} \times \frac{load_{min}}{100},\qquad
R_{ac,min} = R_{ac} \times \frac{P_{out}}{P_{min}}
$$

#### Qmax1 — 峰值增益约束

通过数值二分法（`findQmax1`）求解 $Q_{max1}$，使得峰值增益等于 $G_{max}$。

#### Qmax2 — ZVS 死区时间约束

Region-1 最小增益：

$$
G_{region1,min} = \frac{k}{k+1}
$$

估算最大频率（Region 1）：

$$
f_{max,est} = f_r \sqrt{\frac{G_{min}}{G_{min}(k+1) - k}}
$$

总寄生电容：

$$
C_{oss,total} = \max\left(10^{-12},\; 2C_{ossEr} + C_j\right)
$$

$$
Q_{max2} =
\frac{(k+1)V_{in,min}^{2}}{16\,f_{max,est}^{2}\,k^{2}\,C_{oss,total}\,V_{in,max}^{2}}
\times \frac{2\pi f_r}{R_{ac,min}}
$$

> 注：系数 16 来源于半桥 LLC 死区时间近似公式 $ t_{dead} = 16 \cdot C_{eq} \cdot f_r \cdot L_m $ 的反推。
> 若拓扑为全桥或死区定义不同，该系数需重新推导。

#### Qmax3 — Coss 能量约束

等效谐振电容 Coss：

$$
C_{eq} = \max\left(10^{-12},\; 2C_{ossEq} + C_j\right)
$$

$$
Q_{max3} = \sqrt{(k+1)^{2}\left(\frac{f_{max,est}^{2}}{f_r^{2}} - 1\right) R_{ac,min}\,C_{eq}}
$$

#### 选定的 $Q$

$$
Q_{max} = \max\left(0.001,\; \min(Q_{max1}, Q_{max2}, Q_{max3})\right),\qquad
Q = 0.95 \, Q_{max}
$$

#### 谐振腔元件

$$
Z_r = Q \, R_{ac,min},\qquad
L_r = \frac{Z_r}{2\pi f_r},\qquad
C_r = \frac{1}{2\pi f_r Z_r},\qquad
L_m = k L_r
$$

#### 工作频率限制

$$
f_{max} = f_r \sqrt{\frac{G_{min}}{G_{min}(k+1) - k}},\qquad
f_{min} = f_r \sqrt{\frac{G_{max}}{G_{max}(k+1) - k}}
$$

#### ZVS 能量校验

死区时间内的励磁电流：

$$
I_{m,dead} = \frac{V_{in,min}}{(8\text{ 或 }4)\,f_{max}\,L_m}
$$

（半桥取 8，全桥取 4。）

$$
E_r = \frac{1}{2} L_m I_{m,dead}^{2},\qquad
E_c = \frac{1}{2} C_{oss,total} V_{in,max}^{2},\qquad
\text{ZVS 裕量} = E_r \ge E_c
$$

#### ZVS 时间校验

$$
t_{ZVS} = \frac{C_{oss,total} V_{in,max}}{I_{m,dead}},\qquad
\text{ZVS 时间 OK} = t_{ZVS} \le T_d
$$

#### 电流计算

输出电流：

$$
I_o = \frac{P_{out}}{V_{out}}
$$

次级 RMS 电流：

$$
I_{s,rms} = \begin{cases}
\dfrac{\pi}{4} I_o & \text{中心抽头 / 同步中心抽头} \\[6pt]
\dfrac{\pi}{2\sqrt{2}} I_o & \text{全波 / 同步整流}
\end{cases}
$$

初级基波电压幅值：

$$
V_{fund} = \begin{cases}
\dfrac{2 V_{in,nom}}{\pi} & \text{半桥} \\[6pt]
\dfrac{4 V_{in,nom}}{\pi} & \text{全桥}
\end{cases}
$$

谐振电流 RMS：

$$
I_{r,rms} = \frac{V_{fund}}{\sqrt{2}\,R_{ac}}
$$

励磁电压与电流：

$$
V_{Lm} = \begin{cases}
V_{in,nom}/2 & \text{半桥} \\[4pt]
V_{in,nom} & \text{全桥}
\end{cases}
$$

$$
I_{m,rms} = \frac{V_{Lm}}{4\sqrt{3}\,f_r L_m}
$$

初级总 RMS 电流：

$$
I_{p,rms} = \sqrt{I_{r,rms}^{2} + I_{m,rms}^{2}}
$$

---

### 1.5 损耗分析（`calculateLosses`）

初级峰值电流：

$$
I_{p,pk} = I_{p,rms}\sqrt{2}
$$

原边开关管数量：

$$
N_{sw} = \begin{cases} 2 & \text{半桥} \\ 4 & \text{全桥} \end{cases}
$$

#### MOSFET 导通损耗

$$
P_{cond,per} = \frac{1}{2} I_{p,rms}^{2} R_{ds(on)},\qquad
P_{cond} = N_{sw} \, P_{cond,per}
$$

（单位：`mosfetRdsOn` 以 mΩ 输入，内部转换为 Ω。）

#### 开关损耗（线性近似）

$$
P_{on} = \frac{1}{2} V_{in} I_{p,pk} \, t_r \, f_{sw} \, N_{sw}
$$

$$
P_{off} = \frac{1}{2} V_{in} I_{p,pk} \, t_f \, f_{sw} \, N_{sw}
$$

（单位：$t_r, t_f$ 以 ns 输入，内部转换为秒。）

#### Coss 损耗

$$
C_{oss,F} = C_{oss,\text{pF}} \times 10^{-12}
$$

$$
E_{coss} = \frac{1}{2} C_{oss,F} V_{in}^{2} \times \frac{2}{3},\qquad
P_{coss} = E_{coss} \, f_{sw} \, N_{sw}
$$

> 注：系数 2/3 考虑了 MOSFET 结电容 $ C_{oss} $ 随 $ V_{ds} $ 的非线性变化。
> 不同厂商/型号的 $ C_{oss} $ 非线性特性不同，精确损耗建议查手册 $ E_{oss} $ 曲线。

#### 体二极管导通损耗

$$
I_{diode} = I_{p,pk} \times 0.7,\qquad
P_{diode} = V_{sd} \, I_{diode} \, T_d \, f_{sw} \, N_{sw}
$$

> 注：0.7 为经验系数，实际体二极管电流波形因死区时间、$ C_{oss} $ 充放电波形而异。
> 精确估算需时域仿真或示波器实测。

#### 变压器铁芯损耗（Steinmetz）

$$
A_e\,[m^{2}] = A_{e,\text{mm}^{2}} \times 10^{-6}
$$

$$
B_{peak} = \frac{V_{in} / (2\text{ 或 }1)}{4 f_{sw} N_p A_e}
$$

$$
P_{core} = k \left(\frac{f_{sw}}{1000}\right)^{\alpha} \left(B_{peak} \times 1000\right)^{\beta} V_e
$$

（半桥电压分母取 2，全桥取 1。）

#### 绕组损耗

$$
R_{dc} = R_{dc,\text{mΩ}} / 1000,\qquad
\text{freqRatio} = \frac{f_{sw}/1000}{f_{skin0}}
$$

$$
R_{ac,factor} = 1 + \text{freqRatio}^{2},\qquad
P_{winding} = I_{p,rms}^{2} R_{dc} R_{ac,factor}
$$

#### 整流器损耗

同步整流：

$$
N_{rect} = \begin{cases} 2 & \text{同步中心抽头} \\ 4 & \text{同步整流} \end{cases},\qquad
I_{s,per} = \frac{I_{s,rms}}{\sqrt{2}}
$$

$$
P_{rect} = N_{rect} \, I_{s,per}^{2} \, R_{ds(on),rect}
$$

二极管整流：

$$
N_{diodes} = \begin{cases} 2 & \text{中心抽头} \\ 4 & \text{全波} \end{cases},\qquad
I_{avg,diode} = \frac{I_o}{2}
$$

$$
P_{rect} = N_{diodes} \, V_f \, I_{avg,diode}
$$

#### 谐振元件损耗

$$
P_{Lr} = I_{p,rms}^{2} R_{DCR,Lr},\qquad
P_{Cr} = I_{p,rms}^{2} ESR_{Cr},\qquad
P_{res} = P_{Lr} + P_{Cr}
$$

#### 总损耗与效率

$$
P_{loss,total} = P_{cond} + P_{on} + P_{off} + P_{coss} + P_{diode} + P_{core} + P_{winding} + P_{rect} + P_{res}
$$

$$
\eta = \frac{P_{out}}{P_{out} + P_{loss,total}} \times 100\%
$$

---

## 2. `src/pages/Curves.tsx` — 增益与阻抗特性曲线

### 2.1 LLC 增益（归一化）

与 Designer 相同的 FHA 公式：

$$
M(f_n,k,Q) = \frac{1}{\sqrt{\left[1 + \frac{1}{k}\left(1 - \frac{1}{f_n^{2}}\right)\right]^{2} + \left[Q\left(f_n - \frac{1}{f_n}\right)\right]^{2}}}
$$

### 2.2 输入阻抗（相对于 $Z_r$ 归一化）

$$
D = Q^{2} + f_n^{2} k^{2}
$$

$$
\text{Re}(Z_{in}) = Z_r \frac{Q f_n^{2} k^{2}}{D},\qquad
\text{Im}(Z_{in}) = Z_r \left(f_n - \frac{1}{f_n} + \frac{Q^{2} f_n k}{D}\right)
$$

$$
|Z_{in}| = \sqrt{\text{Re}^{2} + \text{Im}^{2}},\qquad
\varphi = \arctan2(\text{Im}, \text{Re}) \times \frac{180}{\pi}
$$

### 2.3 谐振标记点

$$
f_{r1} = 1.0\;\text{（归一化）},\qquad
f_{r2} = \frac{1}{\sqrt{1+k}}
$$

---

## 3. `src/pages/Report.tsx` — 设计报告生成

### 3.1 报告表格中使用的导出参数

$$
R_{ac} = \frac{8 n^{2} V_{out}^{2}}{\pi^{2} P_{out}}
$$

### 3.2 所需增益

半桥：

$$
M_{req,min} = \frac{2n(V_{out}+V_d)}{V_{in,min}},\qquad
M_{req,max} = \frac{2n(V_{out}+V_d)}{V_{in,max}}
$$

全桥：

$$
M_{req,min} = \frac{n(V_{out}+V_d)}{V_{in,min}},\qquad
M_{req,max} = \frac{n(V_{out}+V_d)}{V_{in,max}}
$$

### 3.3 增益裕量

$$
\text{增益裕量} = \left(\frac{M_{max}}{M_{req,min}} - 1\right) \times 100\%
$$

### 3.4 应力估算

原边 MOSFET 电压建议：

$$
V_{ds,max} = \begin{cases} V_{in,max} & \text{半桥} \\ 1.2 V_{in,max} & \text{全桥} \end{cases}
$$

原边 MOSFET 电流建议：

$$
I_{MOS,rms} = 2.5 \, I_{p,rms}
$$

次级整流器电压建议：

$$
V_{RRM} = \begin{cases} 2.5 V_{out} & \text{中心抽头 / 同步中心抽头} \\ 2 V_{out} & \text{全波 / 同步整流} \end{cases}
$$

次级整流器电流建议：

$$
I_{sec,rms} = 1.5 \, I_{s,rms}
$$

谐振电容电压估算：

$$
V_{Cr,peak} = \begin{cases} 0.5 V_{in,max} & \text{半桥} \\ V_{in,max} & \text{全桥} \end{cases}
$$

---

## 4. `src/components/CompensationSection.tsx` — 环路补偿设计

### 4.1 E 系列 / 数值格式化

与 Designer 中相同的 `nearestE` 辅助函数。

### 4.2 功率级极点

输出极点：

$$
\omega_{p,out} = \frac{1}{R_{load} C_{out}}
$$

ESR 零点：

$$
\omega_{p,zero} = \frac{1}{ESR \cdot C_{out}}
$$

（单位：$C_{out}$ 以 μF 输入，$ESR$ 以 mΩ 输入，内部转换为 F/Ω。）

### 4.3 被控对象传递函数模型

**积分器：**

$$
G_p(s) = \frac{K_p}{s},\qquad |G_p| = \frac{K_p}{\omega},\qquad \angle G_p = -90°
$$

**积分器 + 输出极点：**

$$
G_p(s) = \frac{K_p}{s(1 + s/\omega_{p,out})},\qquad
|G_p| = \frac{K_p}{\omega \sqrt{1 + (\omega/\omega_{p,out})^{2}}}
$$

$$
\angle G_p = -90° - \tan^{-1}\left(\frac{\omega}{\omega_{p,out}}\right)
$$

**积分器 + 极点 + ESR 零点：**

$$
G_p(s) = \frac{K_p(1 + s/\omega_{p,zero})}{s(1 + s/\omega_{p,out})}
$$

$$
|G_p| = K_p \frac{\sqrt{1 + (\omega/\omega_{p,zero})^{2}}}{\omega \sqrt{1 + (\omega/\omega_{p,out})^{2}}}
$$

$$
\angle G_p = -90° + \tan^{-1}\left(\frac{\omega}{\omega_{p,zero}}\right) - \tan^{-1}\left(\frac{\omega}{\omega_{p,out}}\right)
$$

### 4.4 补偿器增益/相位

Type II / Type III 传递函数的幅值/相位在每个频率点进行数值计算。

### 4.5 穿越频率处所需补偿器增益

$$
G_{c,needed} = \frac{1}{G_{p,linear}(f_c)}
$$

### 4.6 K 因子设计

所需补偿器相位：

$$
\varphi_{c,req} = PM_{target} - 180° - \varphi_{plant}(f_c)
$$

目标相位提升：

$$
\text{boost}_{target} = \varphi_{c,req} + 180°\quad (\text{限制在实用范围内})
$$

**Type II：**

$$
K = \tan\left(\frac{\text{boost}_{target} \cdot \pi}{360}\right),\qquad
f_{z1} = \frac{f_c}{K},\qquad
f_{p1} = K f_c
$$

**Type III：**

$$
K = \tan\left(\frac{(\text{boost}_{target} + 180°)\pi}{720}\right),\qquad
f_{z1}=f_{z2}=\frac{f_c}{K},\qquad
f_{p1}=f_{p2}=K f_c
$$

### 4.7 元件计算

$$
R_2 = \begin{cases}
R_1 \, G_{c,needed} & \text{Type II} \\[4pt]
R_1 \, G_{c,needed} / K & \text{Type III}
\end{cases}
$$

$$
C_1 = \frac{1}{R_2 \, 2\pi f_{z1}},\qquad
C_2 = \frac{1}{R_2 \, 2\pi f_{p1}}
$$

对于 Type III：

$$
R_3 = \max(100,\; R_1/10),\qquad
C_3 = \frac{1}{R_3 \, 2\pi f_{p2}}
$$

### 4.8 校验

$$
PM_{actual} = 180° + \varphi_{plant}(f_c) + \varphi_{comp}(f_c)
$$

实际穿越频率通过扫描 $0.1 f_c \sim 10 f_c$ 并最小化 $|G_{open}|$ 的 dB 值得到。

---

## 5. `src/components/DesignCompare.tsx` — A/B 设计方案对比

### 5.1 增益曲线对比

对每个保存的设计评估相同的 FHA `calcGain` 公式。

### 5.2 设计评分

$$
\text{effScore} = \min\left(\frac{\eta}{97}, 1\right) \times 40
$$

$$
\text{freqRangeScore} = \max\left(0,\; 1 - (0.5 Q + k)\right) \times 30
$$

$$
\text{zvsScore} = \begin{cases} 30 & \text{ZVS OK} \\ 0 & \text{otherwise} \end{cases}
$$

$$
\text{totalScore} = \text{effScore} + \text{freqRangeScore} + \text{zvsScore}
$$

### 5.3 参数离散度

对于参与对比的数值：

$$
\text{spread} = \frac{\max - \min}{\min} \times 100\%
$$

---

## 6. `src/pages/Derivations.tsx` — 公式推导（KaTeX 行间公式）

### 6.1 第 1 节 — 基本拓扑与工作原理

**第一谐振频率（串联谐振）：**

$$
\omega_r = \frac{1}{\sqrt{L_r C_r}} \quad \Rightarrow \quad f_r = \frac{1}{2\pi\sqrt{L_r C_r}}
$$

**第二谐振频率（串并联谐振）：**

$$
\omega_m = \frac{1}{\sqrt{(L_r + L_m) C_r}} \quad \Rightarrow \quad f_m = \frac{1}{2\pi\sqrt{(L_r + L_m) C_r}}
$$

**两个谐振频率之间的关系：**

$$
\begin{aligned}
f_m &= \frac{1}{2\pi\sqrt{(L_r + L_m) C_r}} \\
&= \frac{1}{2\pi\sqrt{L_r C_r \cdot \left(1 + \frac{L_m}{L_r}\right)}} \\
&= \frac{f_r}{\sqrt{1 + k}}
\end{aligned}
$$

**核心参数：**

$$
k = \frac{L_m}{L_r}, \quad f_r = \frac{1}{2\pi\sqrt{L_r C_r}}, \quad f_m = \frac{f_r}{\sqrt{1 + k}}
$$

### 6.2 第 2 节 — 稳态增益与 FHA 推导

**半桥基波 RMS 电压：**

$$
V_{ab,1} = \frac{2\sqrt{2}}{\pi} V_{in}
$$

**全桥基波 RMS 电压：**

$$
V_{ab,1} = \frac{4\sqrt{2}}{\pi} V_{in}
$$

**等效交流负载电阻：**

$$
\begin{aligned}
R_{ac} &= \frac{8n^2}{\pi^2} \cdot R_L \\ &= \frac{8n^2}{\pi^2} \cdot \frac{V_o^2}{P_o}
\end{aligned}
$$

**电压增益定义：**

$$
M = \left| \frac{Z_2}{Z_1 + Z_2} \right|
$$

**标准 LLC 增益方程：**

$$
\begin{aligned}
M(f_n, k, Q) &= \frac{1}{\sqrt{\left(1 + \frac{1}{k} - \frac{1}{k f_n^2}\right)^2 + \left[Q\left(f_n - \frac{1}{f_n}\right)\right]^2}} \\ &= \frac{f_n^2 k}{\sqrt{\left[f_n^2(k+1) - 1\right]^2 + k^2 Q^2 (f_n^2 - 1)^2}}
\end{aligned}
$$

**负载无关点：**

$$
M(1, k, Q) = 1 \quad \text{（与 } Q \text{ 无关）}
$$

**空载增益：**

$$
M_{empty}(f_n, k) = \frac{1}{\left|1 - \frac{1}{f_n^2(1 + k)}\right|}
$$

**最终公式：**

$$
M = \frac{1}{\sqrt{\left(1 + \frac{1}{k} - \frac{1}{k f_n^2}\right)^2 + \left[Q\left(f_n - \frac{1}{f_n}\right)\right]^2}}
$$

### 6.3 第 3 节 — 谐振频率与特征参数

**第一谐振频率：**

$$
f_r = \frac{1}{2\pi\sqrt{L_r C_r}}
$$

**第二谐振频率：**

$$
f_m = \frac{1}{2\pi\sqrt{(L_r + L_m) C_r}} = \frac{f_r}{\sqrt{1 + k}}
$$

**特征阻抗：**

$$
Z_0 = \sqrt{\frac{L_r}{C_r}} = \omega_r L_r = \frac{1}{\omega_r C_r}
$$

**品质因数：**

$$
Q = \frac{Z_0}{R_{ac}} = \frac{\sqrt{L_r / C_r}}{R_{ac}}
$$

**最终公式：**

$$
f_r = \frac{1}{2\pi\sqrt{L_r C_r}}, \quad f_m = \frac{f_r}{\sqrt{1 + k}}, \quad Z_0 = \sqrt{\frac{L_r}{C_r}}, \quad Q = \frac{Z_0}{R_{ac}}
$$

### 6.4 第 4 节 — 峰值增益与边界条件

**增益平方表达式：**

$$
M^2 = \frac{x^2 k^2}{\left[x(k+1) - 1\right]^2 + x k^2 Q^2 (x-1)^2}
$$

其中 $x = f_n^2$。

**边界条件：**

$$
\frac{dM}{df_n} = 0 \quad \text{at} \quad f_n = f_{n,peak}
$$

### 6.5 第 5 节 — 输入阻抗与 ZVS 条件

**输入阻抗：**

$$
Z_{in} = j\omega_s L_r + \frac{1}{j\omega_s C_r} + \left(j\omega_s L_m \parallel R_{ac}\right)
$$

**实部 / 虚部：**

$$
\begin{aligned}
\text{Re}(Z_{in}) &= Z_0 \cdot \frac{f_n^2 k^2 Q}{Q^2 + f_n^2 k^2} \\ \text{Im}(Z_{in}) &= Z_0 \left( f_n - \frac{1}{f_n} + \frac{f_n k Q^2}{Q^2 + f_n^2 k^2} \right)
\end{aligned}
$$

**感性/容性边界：**

$$
\text{Im}(Z_{in}) = 0 \quad \Rightarrow \quad f_n - \frac{1}{f_n} + \frac{f_n k Q^2}{Q^2 + f_n^2 k^2} = 0
$$

**ZVS 能量判据：**

$$
\frac{1}{2} L_m I_{m,off}^2 \geq \frac{1}{2} C_{oss} V_{in}^2
$$

**$f_n = 1$ 处的相位：**

$$
\begin{aligned}
\text{令 } x &= kQ \\
\frac{\text{Im}(Z_{in})}{Z_0} &= \frac{x}{1 + x^2}, \quad \frac{\text{Re}(Z_{in})}{Z_0} = \frac{x^2}{1 + x^2} \\
\frac{\text{Im}}{\text{Re}} &= \frac{x}{x^2} = \frac{1}{x} = \frac{1}{kQ} \\
\varphi &= \arctan\left(\frac{1}{kQ}\right) \cdot \frac{180}{\pi}
\end{aligned}
$$

**最终公式：**

$$
Z_{in} = jZ_0\left(f_n - \frac{1}{f_n}\right) + \frac{j f_n Z_0 k}{1 + j f_n k Q}
$$

### 6.6 第 6 节 — 功率器件应力计算

**MOSFET 电压应力：**

$$
V_{ds,max} = V_{in}
$$

**MOSFET 峰值电流：**

$$
I_{pk} = \frac{2n(V_o + V_f)}{\pi Z_0 Q} + \frac{n(V_o + V_f)}{2 f_s L_m}
$$

**MOSFET RMS 电流：**

$$
I_{rms} = \frac{I_{pk}}{\sqrt{2}}
$$

**二极管反向电压（中心抽头）：**

$$
V_{RRM} = 2V_o
$$

**二极管反向电压（全桥 / 全波）：**

$$
V_{RRM} = V_o
$$

**二极管平均电流：**

$$
I_{avg} = \frac{I_o}{2}
$$

**谐振电容 RMS 电流：**

$$
I_{C_r,rms} = I_{r,rms}
$$

**变压器初级 RMS 电流：**

$$
I_{p,rms} = \sqrt{I_{r,rms}^2 + I_{m,rms}^2}
$$

### 6.7 第 7 节 — 功率器件损耗模型

**MOSFET 导通损耗：**

$$
P_{cond} = I_{rms}^2 \cdot R_{ds(on)}
$$

**体二极管损耗（简化）：**

$$
P_{diode} = V_f \cdot I_{avg,diode}
$$

**MOSFET 关断损耗：**

$$
P_{off} = \frac{1}{2} V_{in} \cdot I_{m,pk} \cdot (t_r + t_f) \cdot f_s
$$

**栅极驱动损耗：**

$$
P_{drv} = Q_g \cdot V_{drv} \cdot f_s
$$

**MOSFET 总损耗：**

$$
P_{total,MOS} = P_{cond} + P_{diode} + P_{off} + P_{drv}
$$

**整流二极管导通损耗：**

$$
P_{cond,D} = V_f \cdot I_o
$$

**反向恢复损耗：**

$$
P_{rr} = \frac{1}{2} Q_{rr} \cdot V_{RRM} \cdot f_s
$$

**变压器铜损：**

$$
P_{Cu} = I_p^2 \cdot R_{ac,pri} + I_s^2 \cdot R_{ac,sec}
$$

**铁芯损耗（Steinmetz）：**

$$
P_{core} = C_m \cdot f^\alpha \cdot B^\beta \cdot V_e
$$

**磁通密度（方波激励）：**

$$
B = \frac{V_p}{4 N_p A_e f_s}
$$

### 6.8 第 8 节 — 谐振腔与变压器设计

**匝比：**

$$
n = \frac{V_{in,nom}}{2(V_o + V_f)} \quad \text{（半桥）}
$$

$$
n = \frac{V_{in,nom}}{V_o + V_f} \quad \text{（全桥）}
$$

**等效负载电阻：**

$$
R_{ac} = \frac{8n^2}{\pi^2} \cdot \frac{V_o^2}{P_o}
$$

**最大 / 最小所需增益：**

$$
\begin{aligned}
M_{max} &= \frac{V_{in,nom}}{V_{in,min}} \\ M_{min} &= \frac{V_{in,nom}}{V_{in,max}}
\end{aligned}
$$

**最大允许 $Q$：**

$$
Q_{max} = \min(Q_{max1}, Q_{max2})
$$

**谐振腔参数：**

$$
Z_0 = Q_s \cdot R_{ac}
$$

$$
C_r = \frac{1}{2\pi f_r Z_0} = \frac{1}{2\pi f_r Q_s R_{ac}}
$$

$$
L_r = \frac{Z_0}{2\pi f_r} = \frac{Q_s R_{ac}}{2\pi f_r}
$$

$$
L_m = k \cdot L_r = \frac{k Q_s R_{ac}}{2\pi f_r}
$$

**最终公式：**

$$
L_r = \frac{Q_s R_{ac}}{2\pi f_r}, \quad C_r = \frac{1}{2\pi f_r Q_s R_{ac}}, \quad L_m = k L_r
$$

---

## 7. `src/pages/Operation.tsx` — LLC 工作原理（KaTeX 行间公式）

### 7.1 模式边界谐振频率

$$
f_{r1} = \frac{1}{2\pi\sqrt{L_r C_r}}
$$

$$
f_{r2} = \frac{1}{2\pi\sqrt{(L_r + L_m) C_r}} = \frac{f_{r1}}{\sqrt{1 + k}}
$$

### 7.2 ZVS 能量条件（半桥）

$$
\frac{1}{2} L_p I_p^2 \geq \frac{1}{2} C_{oss} V_{in}^2 \cdot 2
$$

### 7.3 电压增益定义

$$
M = \frac{n V_{out}}{V_{in}} \;(\text{全桥}) \quad M = \frac{2n V_{out}}{V_{in}} \;(\text{半桥})
$$

### 7.4 FHA LLC 增益方程

$$
M(f_n, k, Q) = \frac{f_n^2 \cdot k}{\sqrt{(f_n^2(1+k)-1)^2 + k^2 Q^2 (f_n^2-1)^2}}
$$

---

## 8. `src/pages/Fundamentals.tsx` — 谐振基础（KaTeX 行间公式）

### 8.1 串联 LC 谐振

$$
f_r = \frac{1}{2\pi\sqrt{L_r C_r}}
$$

$$
\omega_r = 2\pi f_r = \frac{1}{\sqrt{L_r C_r}}
$$

### 8.2 品质因数

$$
Q = \frac{Z_r}{R_{ac}} = \frac{\sqrt{L_r/C_r}}{R_{ac}}
$$

### 8.3 带宽

$$
BW = \frac{f_r}{Q} = f_2 - f_1
$$

### 8.4 FHA 归一化增益

$$
M = \frac{n \cdot V_{out}}{V_{in}} \quad (全桥)
$$

$$
M = \frac{2n \cdot V_{out}}{V_{in}} \quad (半桥)
$$

### 8.5 关键参数定义

$$
f_{r1} = \frac{1}{2\pi\sqrt{L_r C_r}}
$$

$$
f_{r2} = \frac{1}{2\pi\sqrt{(L_r + L_m) C_r}} = \frac{f_{r1}}{\sqrt{1 + k}}
$$

$$
Z_r = \sqrt{\frac{L_r}{C_r}}
$$

$$
Q = \frac{Z_r}{R_{ac}}
$$

$$
k = \frac{L_m}{L_r}
$$

$$
f_n = \frac{f_{sw}}{f_{r1}}
$$

---

## 总结

- **写入文件：** `docs/code_formulas_export.md`
- **公式来源：**
  - `src/pages/Designer.tsx`
  - `src/pages/Curves.tsx`
  - `src/pages/Report.tsx`
  - `src/components/CompensationSection.tsx`
  - `src/components/DesignCompare.tsx`
  - `src/pages/Derivations.tsx`（KaTeX `MathBlock`）
  - `src/pages/Operation.tsx`（KaTeX `MathBlock`）
  - `src/pages/Fundamentals.tsx`（KaTeX `MathBlock`）
- **包含的工程注释：** `Qmax2`/`16`、`Coss` 损耗 `2/3`、体二极管 `0.7`。
