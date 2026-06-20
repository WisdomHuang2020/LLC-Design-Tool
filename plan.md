# LLC Design Tool 全面修正计划

## 错误清单（基于杨波博士论文、TI/MPS/Fairchild 权威文献交叉验证）

### 1. Operation.tsx — 工作模式定义完全相反（最严重）
- **错误**：Region 1/2/3 编号与标准定义相反。网站说模式1是 f < fr2（对应 Region 3），模式3是 f > fr1（对应 Region 1）。
- **标准定义**（杨波论文、TI、MPS）：
  - Region 1：f > fr1，ZVS区域，Lm被输出电压钳位
  - Region 2：fr2 < f < fr1，ZVS区域，Lm参与谐振
  - Region 3：f < fr2，ZCS区域，应避免
- **修正**：全面重写模式定义，确保与杨波论文和业界标准一致。
- **影响**：用户学习错误概念，设计可能出错。

### 2. Designer.tsx — 多项计算错误
- **错误 2a**：使用 Mv = k/(k-1) 虚拟增益计算匝比。与标准 FHA 方法矛盾（谐振频率处增益应为1，不是 k/(k-1)）。
  - **修正**：使用标准方法：全桥 n = Vin_nom/(Vout+Vd)，半桥 n = Vin_nom/(2(Vout+Vd))。
- **错误 2b**：ZVS能量使用 `0.5*(lm+lr)*im²`。正确应为 `0.5*lm*im²`（只有Lm储能参与ZVS）。
- **错误 2c**：初级谐振电流 Ir_rms 使用幅值计算：`vFund/rac`。应为 `vFund/(Math.sqrt(2)*rac)`（基波有效值）。
- **错误 2d**：中心抽头次级电流 isRms = (π/2)*Io 是峰值。正确应为 π*Io/4 ≈ 0.785*Io（半波正弦RMS）。
- **错误 2e**：fmax/fmin 公式已修正为 `fr·√(G/(G(k+1)-k))`，这是对的，保持。
- **错误 2f**：Qmax2 的 lrMaxZvs 公式推导有问题，需重新验证。
- **错误 2g**：空载峰值增益 Gmax_empty = 1 + 1/k。对于 Region 1（fn>1），空载增益趋向 1+1/k。但设计时应使用峰值增益（从增益曲线计算），不是空载公式。

### 3. Derivations.tsx — 公式推导准确性
- **检查**：增益公式 `M = (fn²·λ)/√[(fn²(1+λ)-1)²+(fn·Q·(fn²-1))²·λ²]` 是正确的。
- **检查**：等效电阻 Rac = 8n²Rload/π² 是正确的。
- **补充**：增加详细的阻抗推导步骤，特别是输入阻抗 Zin 的实部和虚部分解。
- **补充**：增加峰值增益条件的推导（dM/dfn = 0）。

### 4. Curves.tsx — 阻抗计算验证
- **检查**：`calcImpedance` 公式已验证，基本正确。但分母应为 `Q² + (λ·fn)²`，代码中写的是 `1 + Q²·fn²·λ²`。
- 让我重新验证：
  - Zin = Zr + Zp，Zr = j(fn-1/fn)，Zp = jλfn || Q
  - Zp = jλfn·Q / (Q + jλfn) = λfnQ(λfn - jQ) / (Q²+(λfn)²) = λ²fn²Q/(Q²+(λfn)²) + jλfnQ²/(Q²+(λfn)²)
  - Zin/Z0 = λ²fn²Q/(Q²+(λfn)²) + j[fn-1/fn + λfnQ²/(Q²+(λfn)²)]
- **结论**：代码中分母 `1 + Q*Q*fn*fn*lambda*lambda` 应该是 `Q*Q + fn*fn*lambda*lambda`。
- **修正**：修正分母。同时检查实部和虚部系数。

### 5. Report.tsx — 跟随Designer错误
- 匝比公式、电流计算、增益分析等跟随 Designer 的错误，需同步修正。

### 6. Fundamentals.tsx — 补充与完善
- 补充 Q 值和带宽的关系。
- 补充 LLC 与 SRC/PRC 的区别。
- 修正术语：统一使用标准术语（如"特征阻抗"而非"特性阻抗"）。

## 执行计划

### Stage 1: 并行修正（4个子代理）
- **Worker A**: 修正 Operation.tsx（工作模式、波形、ZVS描述）
- **Worker B**: 修正 Designer.tsx（计算逻辑、公式、电流、ZVS能量）
- **Worker C**: 修正 Derivations.tsx + Curves.tsx（推导过程、阻抗公式）
- **Worker D**: 修正 Report.tsx + Fundamentals.tsx（报告内容、基础知识）

### Stage 2: 统一验证
- 检查所有页面的一致性
- 验证公式之间的自洽性
- 确保增益公式在 Operation、Curves、Designer、Derivations 中一致

### Stage 3: 构建与部署
- 本地构建验证
- 推送 GitHub
- 部署

## 参考来源
- 杨波博士论文（Bo Yang, Virginia Tech, 2007）
- Fairchild AN-4151
- TI UCC25600/400 设计指南
- MPS LLC Design Guide
- 全网搜索验证的公式
