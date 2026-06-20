# LLC 谐振变换器设计工具 — 源代码审计报告

**审计日期**: 2026-06-20  
**审计范围**: `src/pages/Derivations.tsx`, `Designer.tsx`, `Fundamentals.tsx`, `Curves.tsx`, `Operation.tsx`  
**审计标准**: 标准 FHA 增益公式、等效负载电阻、匝比、特征阻抗、品质因数、谐振频率、空载增益、频率反推公式

---

## 一、总体结论

本次审计共发现 **14 项错误**，按严重程度分类：

| 严重程度 | 数量 | 说明 |
|---------|------|------|
| 🔴 严重 | 5 | 导致核心计算结果错误，影响设计参数选型 |
| 🟡 中等 | 6 | 公式推导或描述不准确，可能误导用户 |
| 🟢 轻微 | 3 | 图表显示范围或文字描述问题 |

**最严重的问题集中在 `Designer.tsx` 的设计计算逻辑中**，特别是等效电阻、谐振电流、工作频率和 ZVS 能量计算，这些错误会导致整个设计方案偏离正确值。

---

## 二、按文件详细审计

### 🔴 优先级 1: `src/pages/Derivations.tsx` — 公式推导页面

#### 🟡 错误 DER-01: FHA 基波电压未区分半桥/全桥

**位置**: 第 183–205 行  
**问题描述**: 方波基波电压公式只给出了全桥的 `4Vin/π`，没有区分半桥情况。

```tsx
// 第 184 行
<MathBlock latex="v_{AB}(t) = \frac{4V_{in}}{\pi} \sum_{\substack{n=1 \\ \text{ odd}}}^{\infty} \frac{1}{n} \sin(n\omega_s t)" />

// 第 189 行
<MathBlock latex="v_{FHA}(t) = \frac{4V_{in}}{\pi} \sin(\omega_s t)" />

// 第 199 行
<MathBlock latex="V_{FHA,peak} = \frac{4V_{in}}{\pi}, \quad V_{FHA,rms} = \frac{2\sqrt{2}V_{in}}{\pi}" />

// 第 204 行（最终公式）
<MathBlock latex="V_{FHA} = \frac{4V_{in}}{\pi}" />
```

**正确公式**:
- 全桥: `V_FHA,peak = 4Vin/π`, `V_FHA,rms = 2√2 Vin/π`
- 半桥: `V_FHA,peak = 2Vin/π`, `V_FHA,rms = √2 Vin/π`

**影响**: 推导页面的最终公式只标注全桥值，后续电流应力推导基于全桥假设，但未明确说明。用户若用于半桥设计，会得到 2 倍偏差的电流估算。

---

#### 🟡 错误 DER-02: 磁化电流 `Im,rms` 公式基础不准确

**位置**: 第 472–473 行

```tsx
<MathBlock latex="I_{m,rms} = \frac{V_{out,ac}}{\omega_s L_m} = \frac{2\sqrt{2}nV_{out}}{\pi \omega_s L_m}" />
```

**问题**: 公式使用 `nVout` 作为磁化电感上的电压基础。实际上，在 FHA 模型中，磁化电感 `Lm` 并联在变压器初级，其电压是**初级基波电压**，不是次级反射电压。在谐振频率 `fr1` 处，初级基波电压为 `4Vin/π`（全桥）或 `2Vin/π`（半桥），与 `nVout` 的关系取决于拓扑。

- 全桥: `V_Lm = 4Vin/π`（在 fr1 处），而非 `2√2 nVout/π`
- 半桥: `V_Lm = 2Vin/π`（在 fr1 处），而非 `√2 nVout/π`

**影响**: 推导不完整，可能导致用户混淆磁化电流与次级电压的关系。

---

#### 🟡 错误 DER-03: 次级电流 `I_sec,rms` 未区分整流方式

**位置**: 第 482 行

```tsx
<MathBlock latex="I_{sec,rms} = \frac{\pi}{2\sqrt{2}} I_{out} \approx 1.11 \, I_{out}" />
```

**问题**: 该公式仅适用于全波/全桥整流情况。对于**中心抽头整流**，每个次级绕组只导通半周，其半波正弦 RMS 为 `π Iout / 4 ≈ 0.785 Iout`（每绕组），整流后总次级电流 RMS 仍为 `π Iout / (2√2) ≈ 1.11 Iout`，但整流二极管和绕组的电流应力不同。

**建议**: 应补充说明不同整流方式下的次级电流公式。

---

### 🔴 优先级 2: `src/pages/Designer.tsx` — 设计工具页面（核心计算错误）

#### 🔴 错误 DES-01: 最小负载等效电阻 `racMin` 计算完全颠倒

**位置**: 第 607–608 行

```tsx
const pMin = pout * (loadMin / 100)
const racMin = rac * (pMin / pout)   // ❌ 错误
```

**问题**: 等效负载电阻 `Rac` 与输出功率成反比。当负载减小到 `pMin` 时，输出电阻 `Ro` 增大为 `Ro * (pout/pMin)`，因此 `Rac` 也应增大为 `Rac * (pout/pMin)`。

**正确代码**:
```tsx
const racMin = rac * (pout / pMin)   // ✅ 正确: 当 loadMin=10% 时, racMin = 10 * rac
```

**影响程度**: 🔴 **严重**  
**影响分析**: 当 `loadMin = 10%` 时：
- 错误代码: `racMin = rac * 0.1`（比正确值小 **10 倍**）
- 正确值: `racMin = rac * 10`
- 后续计算:
  - `Zr = Q * racMin` → 比正确值小 10 倍
  - `Lr = Zr / (2π fr)` → 比正确值小 10 倍
  - `Cr = 1 / (2π fr * Zr)` → 比正确值大 10 倍
  - 所有基于 `racMin` 的 Qmax 约束、ZVS 计算均受影响

这会导致谐振电感、电容计算严重偏离实际值，整个设计方案不可行。

---

#### 🔴 错误 DES-02: `fmin` 计算使用错误的空载增益公式

**位置**: 第 653 行

```tsx
const fmin = fr * Math.sqrt(Math.max(0.001, gMax / Math.max(1e-9, gMax * (k + 1) - k)))
```

**问题**: `fmin` 对应最低输入电压（`Vin_min`），需要最大增益 `gMax = Vin_nom/Vin_min > 1`。这发生在 **Region 2**（`fn < 1/√(1+k)`），此时空载增益公式与 Region 1 不同。

**Region 2 空载增益公式**（`fn < 1/√(1+k)`，分母为负）:
```
M = k * fn² / (1 - fn²(1+k))
令 M = gMax → fn² = gMax / (gMax(1+k) + k)
```

**代码使用了 Region 1 公式**（分母用减法）:
```
fn² = gMax / (gMax(1+k) - k)   // ❌ 错误，这是 Region 1 的公式
```

**正确代码**:
```tsx
const fmin = fr * Math.sqrt(Math.max(0.001, gMax / Math.max(1e-9, gMax * (k + 1) + k)))
// 注意分母是 +k 而不是 -k
```

**影响**: 对于典型值（如 `gMax=1.2, k=5`）:
- 错误: `fn² = 1.2 / (1.2*6 - 5) = 1.2/2.2 = 0.545`, `fn = 0.738`（进入 Region 1）
- 正确: `fn² = 1.2 / (1.2*6 + 5) = 1.2/12.2 = 0.098`, `fn = 0.313`（Region 2）
- `fmin` 被高估约 **2.4 倍**，导致设计频率范围过宽。

---

#### 🔴 错误 DES-03: `fmax` 边界检查缺失，可能返回无意义值

**位置**: 第 652 行

```tsx
const fmax = fr * Math.sqrt(Math.max(0.001, gMin / Math.max(1e-9, gMin * (k + 1) - k)))
```

**问题**: 当 `gMin < k/(k+1)` 时，`gMin*(k+1) - k < 0`，此时 Region 1 空载增益的最小值（`fn→∞` 时 `M→k/(k+1)`）已经大于 `gMin`。这意味着在空载高输入电压时，**无法通过提高频率将增益降到所需值**，设计不成立。

- 例如 `k=5, gMin=0.8`: `k/(k+1) = 5/6 ≈ 0.833 > 0.8`
- `gMin*(k+1) - k = 0.8*6 - 5 = -0.2 < 0`
- 代码中 `max(1e-9, -0.2) = 1e-9`，`gMin/1e-9 = 8e8`，`sqrt(8e8) ≈ 28284`
- `fmax = fr * 28284` → 完全无意义

**建议**: 添加边界检查，当 `gMin < k/(k+1)` 时返回错误提示，告知用户无法在该 λ 下满足高输入电压的增益要求。

---

#### 🔴 错误 DES-04: 初级谐振电流 `irRms` 计算的是峰值而非 RMS

**位置**: 第 682–686 行

```tsx
const vFund =
  topology === 'half-bridge'
    ? vinNom * 2 / Math.PI   // 半桥基波峰值
    : vinNom * 4 / Math.PI   // 全桥基波峰值
const irRms = vFund / rac    // ❌ 这是峰值电流，不是 RMS
```

**问题**: `vFund` 是**基波峰值电压**（`2Vin/π` 或 `4Vin/π`），除以 `Rac` 得到的是**峰值电流** `Ip_peak`，而非 RMS 电流。

**正确计算**:
```tsx
const irRms = vFund / (Math.sqrt(2) * rac)   // ✅ 峰值除以 √2 = RMS
```

或直接使用有效值:
```tsx
const vFundRms = topology === 'half-bridge'
    ? vinNom * Math.sqrt(2) / Math.PI
    : vinNom * 2 * Math.sqrt(2) / Math.PI
const irRms = vFundRms / rac
```

**影响**: `irRms` 被高估 **√2 ≈ 1.414 倍**。后续：
- `ipRms = sqrt(irRms² + imRms²)` → 被高估
- 损耗计算中的 MOSFET 导通损耗、绕组损耗等全部基于偏大的电流
- 元件选型建议中的电流额定值被高估约 41%

---

#### 🔴 错误 DES-05: ZVS 励磁电流 `imDeadtime` 未区分半桥/全桥

**位置**: 第 656 行

```tsx
const imDeadtime = vinMin / Math.max(1e-9, 4 * fmax * lm)
```

**问题**: 励磁电流三角波峰值公式 `Im = V_Lm / (4 f Lm)` 中，`V_Lm` 是**谐振腔电压幅值**。

- 全桥: `V_Lm = Vin` → `Im = Vin / (4 f Lm)`
- 半桥: `V_Lm = Vin/2` → `Im = Vin / (8 f Lm)`

代码中统一使用 `Vin / (4 f Lm)`，对半桥情况**高估 2 倍**。

**正确代码**:
```tsx
const imDeadtime = topology === 'half-bridge'
    ? vinMin / Math.max(1e-9, 8 * fmax * lm)
    : vinMin / Math.max(1e-9, 4 * fmax * lm)
```

**影响**: 
- 半桥时 `imDeadtime` 被高估 2 倍
- ZVS 能量 `Er = 0.5 * (Lm+Lr) * Im²` 被高估 **4 倍**
- ZVS 裕量判断 `zvsMargin = Er >= Ec` 过于乐观，可能误判为 ZVS 可行而实际不可行
- ZVS 时间 `tZvs = Coss * Vin / Im` 被低估 2 倍，可能误判 ZVS 时间充足

---

#### 🟡 错误 DES-06: 等效电阻 `Rac` 计算重复补偿二极管压降

**位置**: 第 603–604 行

```tsx
const rac = (8 * n * n * voutEff * voutEff) / (Math.PI * Math.PI * pout)
// voutEff = vout + vd
```

**问题**: 匝比 `n` 已经使用 `voutEff = vout + vd` 计算（补偿了二极管压降），`Rac` 应基于实际输出电压 `vout` 和功率 `pout`。

**正确公式**:
```tsx
const rac = (8 * n * n * vout * vout) / (Math.PI * Math.PI * pout)
```

或等价于:
```tsx
const ro = vout * vout / pout   // 实际负载电阻
const rac = (8 / (Math.PI * Math.PI)) * n * n * ro
```

**影响**: 当 `Vd = 0.6V, Vout = 12V` 时，`Rac` 被高估约 `(1 + 0.6/12)² = 1.05² ≈ 1.10` 倍，即 **约 10%** 误差。这会导致 Q 值和元件参数轻微偏离。

---

#### 🟡 错误 DES-07: 同步整流损耗 `rectSwitches` 判断条件错误

**位置**: 第 486–489 行

```tsx
if (calc.rectifier === 'synchronous') {
    const rectSwitches = (calc.rectifier as string) === 'center-tapped' ? 2 : 4
    // ❌ calc.rectifier === 'synchronous'，所以 rectSwitches 永远是 4
    const isPerSwitch = calc.isRms / Math.sqrt(2)
    rectLoss = rectSwitches * isPerSwitch * isPerSwitch * (lp.syncRectRdsOn / 1000)
}
```

**问题**: 当 `rectifier === 'synchronous'` 时，条件判断 `(calc.rectifier as string) === 'center-tapped'` 永远为 `false`，因此 `rectSwitches` 永远是 4。但同步整流也可以配合中心抽头变压器（仅 2 只同步整流管）。

**正确代码**: 需要额外的状态来标识同步整流 + 中心抽头组合，或修改 `rectifier` 枚举为 `'sync-full-bridge'` 和 `'sync-center-tapped'`。

**影响**: 中心抽头 + 同步整流时，损耗被高估 2 倍。

---

#### 🟡 错误 DES-08: 增益公式注释与 `gainM` 实现一致但可改进

**位置**: 第 48–54 行

```tsx
// M = 1 / sqrt((1 + 1/λ(1 - 1/fn²))² + (Q*(fn - 1/fn))²)
function gainM(fn: number, lambda: number, q: number): number {
  const a = 1 + (1 / lambda) * (1 - 1 / (fn * fn))
  const b = q * (fn - 1 / fn)
  return 1 / Math.sqrt(a * a + b * b)
}
```

**验证**: 展开 `a = 1 + 1/λ - 1/(λ·fn²)`，标准 FHA 增益可写为:
```
M = 1 / √[(1 + 1/λ - 1/(λ·fn²))² + (Q(fn - 1/fn))²]
```

代码实现与标准公式一致。✅ 公式正确。

---

### 🔴 优先级 3: `src/pages/Fundamentals.tsx` — 基础理论页面

#### 🟡 错误 FUN-01: 导通损耗对比表错误

**位置**: 第 883–885 行（拓扑对比表）

```tsx
<tr className="border-b border-border/50">
  <td className="py-3 px-4 font-medium text-text-primary">导通损耗</td>
  <td className="py-3 px-4">较低（仅 2 管导通）</td>
  <td className="py-3 px-4">较高（4 管导通，但电流减半）</td>
</tr>
```

**问题**: 对于相同输出功率，全桥的导通损耗**低于**半桥，而非高于。

**推导**:
- 半桥谐振腔电压 = `Vin/2`，电流 = `2I`（半桥为达到相同功率，电流需加倍）
- 半桥 2 管导通，每管损耗 = `0.5 * (2I)² * Rds = 2I²Rds`，总损耗 = `4I²Rds`
- 全桥谐振腔电压 = `Vin`，电流 = `I`
- 全桥 4 管导通，每管损耗 = `0.5 * I² * Rds = 0.5I²Rds`，总损耗 = `2I²Rds`

**结论**: 全桥总导通损耗是半桥的 **一半**，而非更高。

**影响**: 文字描述错误，可能误导用户选择拓扑。

---

### 🔴 优先级 4: `src/pages/Curves.tsx` — 特性曲线页面

#### 🟢 错误 CUR-01: 增益曲线 Y 轴范围可能截断高 Q 峰值

**位置**: 第 246 行

```tsx
<YAxis domain={[0, 2]} ... />
```

**问题**: 当 `Q` 很大（如 `Q=5`）且 `λ` 较小（如 `λ=2`）时，在 `fr2` 附近空载或轻载峰值增益可能超过 2。Y 轴固定 `[0, 2]` 会截断峰值。

**建议**: 动态调整 Y 轴范围，或根据 `λ` 和 `Q` 预计算最大增益值设置上限。

**影响**: 轻微，仅为显示问题，不影响底层计算。

---

### 🔴 优先级 5: `src/pages/Operation.tsx` — 工作模式页面

#### 🟡 错误 OPR-01: 增益曲线 SVG 中 Q=5.0 曲线形状严重错误

**位置**: `GainCurveSVG` 函数，第 346–352 行

```tsx
<path
  d="M 20 200 Q 60 195 100 170 Q 110 150 120 125 L 200 120 Q 230 125 270 130 Q 320 140 380 150"
  fill="none"
  stroke="#f5f5f5"
  strokeWidth="2"
  opacity="0.4"
/>
```

**问题**: 该白色曲线标记为"重载 (Q=5.0)"，但在 `fr2`（x=120）处增益 `y=125`（即 `M≈1`），这与实际严重不符。

**验证**: 对于 `λ=3`（`fr2≈0.5`，x=120 对应 `fn≈0.6`），`Q=5.0`:
```
a = 1 + 1/3 * (1 - 1/0.36) ≈ 0
d = 1 + Q²fn²λ² = 1 + 25*0.36*9 = 82
Re = Q*fn²*λ²/d = 5*0.36*9/82 ≈ 0.198
Im = (fn - 1/fn) + fn*λ/d = (0.6 - 1.667) + 0.6*3/82 = -1.067 + 0.022 ≈ -1.045
M = 1 / √(Re² + Im²) ≈ 1 / √(0.039 + 1.092) ≈ 1/1.062 ≈ 0.94
```

实际上在 `fn=0.6`（接近 `fr2`）处，`Q=5.0` 的增益应接近 **0.94** 或更低，取决于精确的 `fn` 值。但图中白色曲线在 `fr2` 处与 `M=1` 几乎重合，然后才缓慢下降，这更像是**中等 Q 值**（如 `Q=0.5`）的曲线形状。

**更严重的问题**: 图中 `Q=5.0` 曲线在 `fr2` 之后（`fn` 从 0.6 到 1.0）只从 `M≈1` 轻微下降到 `M≈1`（在 `fr1` 处），然后继续缓慢下降。这完全不符合 `Q=5.0` 时曲线应在 `fr1` 处精确穿过 `M=1` 且 `fr2` 处应有明显峰值的特征（对于 `Q=5.0`，`fr2` 处实际上峰值被阻尼压制，但 `fr2` 处仍应低于 `M=1`）。

**影响**: 示意图误导用户对重载增益特性的理解。

---

#### 🟢 错误 OPR-02: ZVS 推荐条件过于保守

**位置**: 第 877 行

```tsx
<p>...推荐 fsw &gt; fr1 以确保全负载范围内ZVS；在轻载时 fsw &gt; fr2 亦可满足感性条件。</p>
```

**问题**: `fsw > fr1` 确实能保证全负载感性，但 `fr2 < fsw < fr1`（Region 2）在重载时也是感性的，ZVS 可以实现。推荐始终 `fsw > fr1` 过于保守，会牺牲轻载效率和增益调节范围。

**建议**: 修改为"推荐设计工作点在 `fr2 < fsw < fr1` 的最优区间，仅在必要时（如极轻载）将频率提升到 `fr1` 以上"。

---

## 三、错误汇总表

| 编号 | 文件 | 严重程度 | 类型 | 错误描述 |
|------|------|---------|------|---------|
| DER-01 | Derivations.tsx | 🟡 | 公式 | FHA 基波电压未区分半桥/全桥 |
| DER-02 | Derivations.tsx | 🟡 | 公式 | `Im,rms` 使用 `nVout` 而非初级电压 |
| DER-03 | Derivations.tsx | 🟡 | 公式 | `I_sec,rms` 未区分整流方式 |
| **DES-01** | **Designer.tsx** | **🔴** | **计算** | **`racMin` 计算颠倒（×0.1 应为 ×10）** |
| **DES-02** | **Designer.tsx** | **🔴** | **计算** | **`fmin` 使用 Region 1 公式而非 Region 2** |
| **DES-03** | **Designer.tsx** | **🔴** | **计算** | **`fmax` 边界检查缺失，可能返回无意义值** |
| **DES-04** | **Designer.tsx** | **🔴** | **计算** | **`irRms` 计算的是峰值而非 RMS** |
| **DES-05** | **Designer.tsx** | **🔴** | **计算** | **`imDeadtime` 未区分半桥/全桥（半桥高估 2×）** |
| DES-06 | Designer.tsx | 🟡 | 计算 | `Rac` 重复补偿二极管压降（约 10% 误差） |
| DES-07 | Designer.tsx | 🟡 | 计算 | 同步整流 `rectSwitches` 判断永远返回 4 |
| FUN-01 | Fundamentals.tsx | 🟡 | 描述 | 全桥导通损耗描述错误（实际低于半桥） |
| CUR-01 | Curves.tsx | 🟢 | 图表 | Y 轴范围 `[0,2]` 可能截断高 Q 峰值 |
| OPR-01 | Operation.tsx | 🟡 | 图表 | `Q=5.0` 增益曲线形状与实际严重不符 |
| OPR-02 | Operation.tsx | 🟢 | 描述 | ZVS 推荐 `fsw > fr1` 过于保守 |

## 四、修复优先级建议

1. **立即修复**（DES-01, DES-04, DES-05）：这些错误导致核心设计参数（Lr, Cr, 电流应力, ZVS 裕量）严重偏离，直接影响设计可行性。
2. **尽快修复**（DES-02, DES-03, DES-07）：影响频率范围计算和损耗分析，可能导致设计范围判断错误。
3. **建议修复**（DES-06, DER-01~03, FUN-01, OPR-01）：影响准确性或用户体验，但不会导致设计完全失败。
4. **可选优化**（CUR-01, OPR-02）：显示和描述改进。

## 五、标准公式验证

以下是与代码中使用的标准公式逐项对比：

| 标准公式 | 代码实现 | 状态 |
|---------|---------|------|
| `M = fn²·λ / √[(fn²(1+λ)-1)² + (fn·Q·(fn²-1))²·λ²]` | `Designer.tsx` `gainM()` / `Curves.tsx` `calcGain()` | ✅ 正确 |
| `Rac = (8/π²)·Ro·n²` | `Designer.tsx` `rac`（但使用 `voutEff` 而非 `vout`） | ⚠️ 近似正确 |
| `n = (Vin/2)/(Vo+Vf)·Mv`（半桥） | `Designer.tsx` `n` 计算 | ✅ 正确 |
| `Zr = √(Lr/Cr)` | `Fundamentals.tsx` / `Designer.tsx` | ✅ 正确 |
| `Q = Zr/Rac` | `Fundamentals.tsx` / `Designer.tsx` | ✅ 正确 |
| `fr = 1/(2π√(Lr·Cr))` | `Fundamentals.tsx` / `Designer.tsx` | ✅ 正确 |
| `fr2 = fr/√(1+λ)` | `Fundamentals.tsx` / `Curves.tsx` | ✅ 正确 |
| `M = 1/|1+1/λ-1/(λ·fn²)|`（空载） | `Designer.tsx` 中用于 `fmax/fmin` 推导 | ⚠️ 部分正确（Region 1） |
| `fn² = G/(G(λ+1)-λ)` | `Designer.tsx` `fmax` | ✅ Region 1 正确 |
| `fn² = G/(G(λ+1)+λ)` | `Designer.tsx` `fmin` | ❌ 代码用减法而非加法 |

---

*报告生成时间: 2026-06-20*  
*审计基于标准 FHA 分析方法，参考 Erickson 和 Maksimovic《Fundamentals of Power Electronics》及典型 LLC 设计文献*
