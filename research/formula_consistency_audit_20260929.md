# 全站公式一致性审计报告

- **日期**：2026-09-29
- **审计对象**：llc-design-tool 线上版本 **v2.10.93**（提交 `182feca`）
- **范围**：设计工具页（`Designer` → `ResultsSummaryCard` / `LossAnalysisPanel`）与公式推导页（`Derivations`），
  并旁及 `Fundamentals` / `Operation` / `Curves` 及引擎（`src/lib/designer/`）
- **方法**：源码逐条提取 + 引擎实跑数值对照（esbuild 打包 `computeDesign`/`llcMath` 后真实执行）
- **性质**：**只读审计，未改动任何代码**

---

## 结论摘要

| 级别 | 条目 | 数量 |
|---|---|---|
| **A · 确凿错误或直接矛盾** | A1 Curves 阻抗公式 Q 幂次写反；A2 卡片 Qmax2 说成「死区时间约束」；A3 `Mmax` 一符两义 | 3 |
| **B · 口径漂移 / 缺项** | B1 损耗节与引擎脱节；B2 fmin 缺失（fmax 无定义式）；B3 损耗面板漏开关数因子；B4 Qmax3 命名不一 | 4 |
| **C · 代码组织风险** | C1 `gainM` 被重复实现 3 次；C2 环路补偿公式未在推导页覆盖 | 2 |
| **D · 措辞（可选）** | D1 Q 的 m·Qmax 未体现；D2 `Vin1` 未标 RMS；D3 `M` 在两类页面口径不同 | 3 |

**核对通过（一致）**：谐振腔参数定义、LLC 增益式（含等价形式）、gMax/gMin/gmaxEmpty/kmax、
Qmax1/Qmax2/Qmax3 公式本体、Qs = m·Qmax、ZVS 能量式、Im,off、tZVS、Qdead、
ipRms/irRms/imRms、isRms、Rac、n、Bpeak、Lr/Cr/Lm 计算式、Zin 的三个表达（互相自洽）。

---

## A 级：确凿错误 / 直接矛盾

### A1 · Curves 页阻抗/相位公式与引擎、推导页不一致 ⚠️ 最严重

**位置**：`src/pages/Curves.tsx:19-26` 的 `calcImpedance()`

**推导页的正确定义**（`Derivations.tsx:362 / 368 / 377`）：

```
Zin/Zr = j(fn − 1/fn) + j·fn·k / (1 + j·fn·k·Q)
⇒ Re(Zin)/Zr = fn²k²Q / (1 + fn²k²Q²)
   Im(Zin)/Zr = (fn − 1/fn) + fn·k / (1 + fn²k²Q²)
```

**Curves 的实现**：

```ts
const denom = Q * Q + fn * fn * k * k
const re = (Q * fn * fn * k * k) / denom
const im = (fn - 1 / fn) + (Q * Q * fn * k) / denom
```

**数值对照（k=4，Q=0.862121）**：

| fn | Curves 相位 | 推导页/引擎 相位 | 差值 | Curves 把 Q→1/Q |
|---|---|---|---|---|
| 0.50 | −58.50° | −48.95° | **9.55°** | −48.95° ✅ |
| 0.80 | −16.20° | −4.37° | **11.83°** | −4.37° ✅ |
| 0.90 | −1.11° | +6.92° | **8.03°** | +6.92° ✅ |
| 1.00 | +12.16° | +16.17° | **4.01°** | +16.17° ✅ |
| 1.20 | +31.74° | +29.95° | 1.79° | +29.95° ✅ |
| 1.50 | +48.50° | +43.19° | 5.31° | +43.19° ✅ |
| 2.00 | +61.84° | +55.69° | 6.15° | +55.69° ✅ |

- 引擎 `llcMath.zvsPhase(k, q)` 在 fn=1 给出 **16.171°**，与推导页一致，与 Curves 差 **4.01°**。
- **把 Curves 里的 `Q` 换成 `1/Q` 后，逐点与推导页完全一致**（差 0，示例中已验证）⇒
  **公式本身正确，但 Q 的幂次写反**（`Q²+fn²k²` 应为 `1+fn²k²Q²`；分子 `Q·fn²k²` 应为 `fn²k²Q`）。
- **影响**：Curves 页的阻抗幅值曲线、相位曲线、以及「感性区/容性区」分界位置全部偏移。
  相位过零处（即 Im(Zin)=0 的感性/容性分界）：修正前 **fn ≈ 0.9078**，修正后 **fn ≈ 0.8365**（k=4、Q=0.862）。

> **勘误（2026-09-29 自纠）**：本报告初稿曾写「正确值 ≈ fn 0.804，正是峰值增益频率」——**这是错的**。
> 实测表明**峰值增益频率与 Im(Zin)=0 的分界频率并不重合**：
> k=4,Q=0.86 → 峰值 0.8035 / 分界 0.8357；k=6,Q=0.86 → 0.8702 / 0.8860；
> 仅当 Q 较大（如 1.5）时两者趋近（0.9413 / 0.9446）。此处已按实测更正。

### A2 · 设计工具页把 Qmax2 说成「死区时间约束」

**位置**：`ResultsSummaryCard.tsx:140`
```
<ResultItem label="Qmax2 (ZVS)" ... formula="死区时间约束" />
```
**推导页明确写着相反的结论**（`Derivations.tsx:474-478`、`502`）：

> **注意：死区时间约束不在上述三条之内。** Qmax2 只含 Coss 与 fmax，**不含死区时间 td**。
> 死区时间内能否完成 Coss 充放电由下式单独校验……

**数值裁决**（把设计参数 `td` 从 200 ns 改到 400 ns）：

| td | qmax2 | tZvs | zvsTimeOk |
|---|---|---|---|
| 200 ns | **12.932178305** | 249.2 ns | false |
| 400 ns | **12.932178305** | 249.2 ns | true |

`qmax2` **逐位不变**，而 `zvsTimeOk` 翻转 ⇒ **卡片那句「死区时间约束」是错的**，
且与推导页直接矛盾（推导页是对的）。

### A3 · `Mmax` 一符两义

| 出处 | 含义 | 默认参数下的值 |
|---|---|---|
| 推导页 `Derivations.tsx:499` | `Mmax` = **最大增益需求**（最低输入电压时所需） | 1.052632（= 引擎 `gMax`） |
| 推导页 `Derivations.tsx:454` | `Qmax1: max M(fn,k,Q) = Mmax` —— 用的正是上面那个含义 | 与引擎 `findQmax1(k, gMax)` 一致 |
| 设计工具页 `ResultsSummaryCard.tsx:59` | 「峰值增益 **Mmax**」= **增益曲线峰值** | 1.060621（= 引擎 `mMax`） |

- 两者默认相差 **0.759%**，且随参数变化会进一步分离。
- 设计工具页里跟推导页 `Mmax` 同义的量，实际叫 **`Gmax`**（「所需增益 Gmax」）。
  ⇒ 同一符号在全站有两个含义，**必须改名统一**（建议：推导页改用 `Gmax/Gmin`，
  或把曲线峰值改称 `Mpeak`，与 `Qmax1` 的约束式配套）。

---

## B 级：口径漂移 / 缺项

### B1 · 损耗节（推导页第 7 节）与引擎现状脱节

| 推导页 `Derivations.tsx` | 引擎现状 | 判定 |
|---|---|---|
| `Pcore = Cm·f^α·B^β·Ve`（:583） | v2.10.92 起**默认改用手册 `P_cv` 法**（`Pcv·Ve·k_wave`）；推导页**完全没有** `P_cv` 字样 | ⚠️ 脱节 |
| `Pcond = Ip,rms²·Rds(on)`（:571） | 引擎还有**温度系数 kT**（Rds(on) 折算到结温）与**开关数因子** | ⚠️ 缺项 |
| `Pdrv = Qg·Vdrv·fsw`（:575） | **引擎根本没有计算驱动损耗**（该分项在推导页有、在损耗面板里没有） | ⚠️ 悬空项 |
| `Prect = Ndiode·Vf·Io/2`（:579） | 同步整流走 `Is²·Rds(on)` 口径，推导页未出现 | ⚠️ 缺一支 |
| `PCu = Ip,rms²·Rac,pri + Is,rms²·Rac,sec`（:588） | 引擎：原边 `Ip²·Rdc·(1+(f/f0)²)` + 副边计入整流项 | 口径可接受 |
| `Bpeak = Vp/(4·Np·Ae·fsw)`（:588） | 引擎一致 | ✅ |

### B2 · `fmin` 在推导页完全缺失，`fmax` 没有定义式

- `Derivations.tsx` 中 `f_{min}` 出现次数 = **0**；`f_{max}` 出现 4 次，**只被引用、从未定义**。
- 设计工具页却直接给出两者的值（默认参数：`fmin = 86.672 kHz`、`fmax = 111.803 kHz`）。
- 尤其应写明**两者口径不对称**：`fmax` 用空载推导、`fmin` 用满载增益交点 —— 目前只在设计工具页的
  说明块里提到，推导页无对应内容。

### B3 · 损耗面板三处公式漏写开关数因子

| 面板公式文字 | 引擎实现 |
|---|---|
| `Pon = 0.5·Vin·Ip·tr·fsw` | `× nSwitches`（半桥 2 / 全桥 4） |
| `Poff = 0.5·Vin·Im,off·tf·fsw` | `× nSwitches` |
| `Pdiode = Vsd·Im,off·(td−tZVS)·fsw` | `× nSwitches` |

显示**数值**含该因子，公式**文字**不含 ⇒ 文字与数值不自洽（全桥下差 4 倍）。

### B4 · Qmax3 命名不一

设计工具页写「Qmax3 (Coss) · 寄生电容约束」，推导页写「Qmax3 · ZVS 能量约束 Q」。
指同一个量，措辞不同（推导页更准确）。

---

## C 级：代码组织风险（当前数值一致，非公式错误）

### C1 · `gainM` 被重复实现 3 次

| 位置 | 形式 |
|---|---|
| `src/lib/designer/llcMath.ts` `gainM()` | 引擎唯一来源 |
| `src/components/GainChart.tsx:20` `calcGain()` | 逐字相同 |
| `src/components/DesignCompare.tsx:26` `calcGain()` | 逐字相同 |

三处表达式**当前完全一致**（`a = 1 + (1/k)(1 − 1/fn²)`；`b = Q(fn − 1/fn)`；`M = 1/√(a²+b²)`），
但违反本项目「计算逻辑只写 `lib`」的约定 —— **任一处单独修改都会静默分叉**（v2.10.86 的漏 `f_n²`
就是这类分叉的产物）。

### C2 · 环路补偿公式未覆盖

`CompensationSection.tsx` 含整套 Gp(s)/Gc(s)、K-factor 计算与公式展示，
推导页（`Derivations`）完全没有对应章节 —— 属独立子系统，建议在推导页加一节或明确标注「不在本文范围」。

---

## D 级：措辞（可选）

- **D1** 设计工具页 `Q = Zr / Rac（满载）` 未体现 `Qs = m·Qmax`（虽然设计表单上有
  「Q = m · Qmax，默认 0.95」提示，推导页也有 `Qs = m·Qmax`）。
- **D2** 设计工具页 `Ir,rms = Vin1/Rac` 未标注 `Vin1` 是基波**有效值**（推导页写的是 `V_{FHA,rms}/R_ac`）。
- **D3** `M` 在理论页（`Fundamentals` / `Operation`：原始直流增益 `nVo/Vin`）与设计页/推导页
  （归一化增益，fr 处 = 1）口径不同 —— 两套都在用，建议显式标注适用范围。

---

## 核对通过（一致）的部分

| 项 | 核对结论 |
|---|---|
| `fr1 = 1/(2π√(LrCr))`、`fr2 = fr1/√(1+k)`、`k = Lm/Lr`、`Zr = √(Lr/Cr)`、`Q = Zr/Rac`、`fn = fsw/fr1` | 推导页 / Fundamentals / Operation / 引擎 四处一致 |
| LLC 增益式 | 引擎用标准式；推导页同时给出标准式与等价形式（并已证恒等）；`Operation:982` 用等价形式 —— 三者一致 |
| `Mmax/Mmin`（需求增益）、`kmax = Mmin/(1−Mmin)`、`Mempty(∞) = k/(k+1)` | 与引擎 `gMax/gMin/kMax/gmaxEmpty` 一致 |
| `Qmax1`（数值二分 `max M = Mmax`） | 与引擎 `findQmax1(k, gMax)` 一致 |
| `Qmax2` 公式本体、`Coss,zvs = 2Coss,eq + Cj` | 与引擎逐字对应 |
| `Qmax3` 公式本体、`γ = 8 半桥 / 4 全桥`、`Coss,total = 2Coss,er + Cj` | γ 在推导页 label 中有定义，与引擎 `zvsCoeff` 一致 |
| `Qmax = min(...)`、`Qs = m·Qmax` | 一致（表单也有提示） |
| ZVS 能量式 `½Lm Im,off² ≥ ½Coss,total Vin,max²` | 推导页 / Operation / 速查表 / 引擎 四处一致（v2.10.87 已统一） |
| `Im,off = Vin,min/(γ·fmax·Lm)` | 与引擎 `magnetizingCurrentOffPeak()` 一致 |
| `tZVS = Coss,total·Vin,max/Im,off ≤ td` | 与引擎 `tZvs` 一致 |
| `Qdead` 反解式 | 推导正确，且推导页已明确标注「仅供手工校核」（引擎不实现，不构成矛盾） |
| `Ip,rms = √(Ir,rms²+Im,rms²)`、`Ir,rms = V_FHA,rms/Rac`、`Im,rms = VLm/(4√3·fr1·Lm)` | 与引擎一致（v2.10.93 已把描述归位） |
| `Rac = 8n²Vo²/(π²Po)`、`n`、`Isec,rms`、`Bpeak`、`Lr/Cr/Lm` 计算式 | 与引擎一致 |
| `Zin` 的三个表达（`Derivations:362/368/377`） | 互相自洽（已代数验算：`Zr = Q·Rac` 换算后逐项相等） |

---

## 建议处置顺序

1. **A1（Curves 阻抗公式）** —— 唯一会产生错误曲线的一处，建议优先修（改动局限于 1 个函数）。
2. **A2（Qmax2 文案）** —— 一行文案，但属于「页面自相矛盾」，必修。
3. **B3（漏 nSwitches）** —— 三行文案，改完数值与文字才自洽。
4. **A3（Mmax 改名）** —— 涉及多页，需先定命名方案。
5. **B1 / B2 / B4 / C1 / C2 / D\*** —— 成批处理。
