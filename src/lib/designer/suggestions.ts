// LLC 设计工具 —— 优化建议生成
// 纯函数：由计算结果的标量投影生成建议清单，最多返回 10 条。
import type { DesignParameters } from '../DesignContext'
import type { Suggestion, SuggestionInputs } from './types'

export function generateSuggestions(
  params: DesignParameters,
  results: SuggestionInputs,
): Suggestion[] {
  const s: Suggestion[] = []
  const { q, k, mMax, mRequired, mRequiredMin, zvsPhase, lr, cr, lm, fsw, efficiency, qmax1, qmax2, qmax3, gmaxEmpty, zvsMargin, zvsTimeOk, tZvs, er, ec, fmax, fmin, kMax } = results

  // 1. k值与空载增益约束上限 kMax
  // kMax = 1/(Gmax - 1)，是空载增益能满足 Gmax 的最大 k 值
  // 约束条件：k <= kMax，k 越小空载增益越高（裕量越大）
  if (k > kMax) {
    s.push({ text: `电感比k=${k.toFixed(2)}大于空载增益约束上限k_max=${kMax.toFixed(2)}，空载增益裕量不足。当前设计在最低输入电压下可能无法达到额定输出。建议减小k至≤${kMax.toFixed(2)}或提高最低输入电压。`, level: 'critical' })
  } else if (k > kMax * 0.8) {
    s.push({ text: `电感比k=${k.toFixed(2)}接近约束上限k_max=${kMax.toFixed(2)}（裕量<20%），空载增益裕量较小。建议减小k至≤${(kMax * 0.5).toFixed(2)}以获得更充裕的增益裕量。`, level: 'warn' })
  } else if (k > kMax * 0.3) {
    s.push({ text: `电感比k=${k.toFixed(2)}处于合理范围（k_max=${kMax.toFixed(2)}），空载峰值增益Gmax_empty=${gmaxEmpty.toFixed(3)} > 所需Gmax=${mRequired.toFixed(3)}，裕量良好。`, level: 'good' })
  } else {
    s.push({ text: `电感比k=${k.toFixed(2)}远小于约束上限k_max=${kMax.toFixed(2)}，空载增益裕量非常充裕。但k过小会导致励磁电流偏大，效率降低。建议考虑增大k至${(kMax * 0.3).toFixed(2)}~${(kMax * 0.7).toFixed(2)}区间以优化效率。`, level: 'good' })
  }

  // 2. Qmax对比分析
  const qmaxMin = Math.min(qmax1, qmax2, qmax3)
  if (qmax1 === qmaxMin) {
    s.push({ text: `Qmax1(增益限制)=${qmax1.toFixed(3)} 为最小约束，增益范围是设计瓶颈。`, level: 'warn' })
  } else if (qmax2 === qmaxMin) {
    s.push({ text: `Qmax2(ZVS死区限制)=${qmax2.toFixed(3)} 为最小约束，ZVS条件是设计瓶颈。建议增大死区时间或减小Lm。`, level: 'warn' })
  } else if (qmax3 === qmaxMin) {
    s.push({ text: `Qmax3(Coss能量限制)=${qmax3.toFixed(3)} 为最小约束，寄生电容是设计瓶颈。建议选用低Coss MOSFET。`, level: 'warn' })
  }
  s.push({ text: `Qmax分解：Qmax1=${qmax1.toFixed(3)}, Qmax2=${qmax2.toFixed(3)}, Qmax3=${qmax3.toFixed(3)}，实际取Q=${q.toFixed(3)}(95%裕量)。`, level: 'good' })

  // 3. Q value
  if (q > 1.0) {
    s.push({ text: 'Q值偏高（>1.0），谐振阻抗大，频率调节范围可能过宽。', level: 'critical' })
  } else if (q > 0.7) {
    s.push({ text: 'Q值略高，负载变化时频率调节范围可能较宽。', level: 'warn' })
  } else if (q < 0.2) {
    s.push({ text: 'Q值偏低（<0.2），谐振电流纹波较大，注意滤波设计。', level: 'warn' })
  } else {
    s.push({ text: `Q值=${q.toFixed(3)}处于合理范围（0.2~0.7），谐振特性良好。`, level: 'good' })
  }

  // 4. Peak gain vs required
  if (mMax < mRequired) {
    s.push({ text: `峰值增益不足（M_max=${mMax.toFixed(3)} < Gmax=${mRequired.toFixed(3)}），无法覆盖输入电压下限。建议增大k或降低Q。`, level: 'critical' })
  } else if (mMax < mRequired * 1.05) {
    s.push({ text: `峰值增益裕量较小（${((mMax/mRequired - 1)*100).toFixed(1)}%），建议留至少5%裕量。`, level: 'warn' })
  } else {
    s.push({ text: `峰值增益裕量充足（M_max=${mMax.toFixed(3)} vs Gmax=${mRequired.toFixed(3)}），设计可行。`, level: 'good' })
  }

  // 5. ZVS分析
  if (!zvsMargin) {
    s.push({ text: `ZVS条件不满足！Er=${(er*1e6).toFixed(3)}μJ < Ec=${(ec*1e6).toFixed(3)}μJ。建议增大死区时间、减小Lm或选用低Coss器件。`, level: 'critical' })
  } else {
    const zvsRatio = er / ec
    if (zvsRatio < 1.2) {
      s.push({ text: `ZVS裕量较小（Er/Ec=${zvsRatio.toFixed(2)}），建议增大励磁电流或死区时间。`, level: 'warn' })
    } else {
      s.push({ text: `ZVS条件良好（Er=${(er*1e6).toFixed(3)}μJ / Ec=${(ec*1e6).toFixed(3)}μJ，裕量比${zvsRatio.toFixed(2)}）。`, level: 'good' })
    }
  }
  if (!zvsTimeOk) {
    s.push({ text: `ZVS时间不足！t_ZVS=${(tZvs*1e9).toFixed(1)}ns > 死区时间Td=${(params.td).toFixed(0)}ns。需增大励磁电流Im或减小死区时间。`, level: 'critical' })
  } else {
    s.push({ text: `ZVS时间充裕：t_ZVS=${(tZvs*1e9).toFixed(1)}ns ≤ Td=${params.td}ns，可在死区内完成谐振腔放电。`, level: 'good' })
  }

  // 6. 频率范围
  const fmaxKHz = fmax / 1000
  const fminKHz = fmin / 1000
  const frKHz = fsw / 1000
  if (fmaxKHz > frKHz * 2.0) {
    s.push({ text: `频率调节范围过宽（fmax=${fmaxKHz.toFixed(1)}kHz >> fr=${frKHz.toFixed(1)}kHz），磁性元件设计困难。`, level: 'critical' })
  } else if (fmaxKHz > frKHz * 1.5) {
    s.push({ text: `频率范围较宽（fmin=${fminKHz.toFixed(1)}kHz ~ fmax=${fmaxKHz.toFixed(1)}kHz），注意磁性元件在宽频下的损耗。`, level: 'warn' })
  } else {
    s.push({ text: `频率范围合理：fmin=${fminKHz.toFixed(1)}kHz ~ fmax=${fmaxKHz.toFixed(1)}kHz（fr=${frKHz.toFixed(1)}kHz）。`, level: 'good' })
  }

  // 7. Efficiency target
  if (efficiency > 97) {
    s.push({ text: '目标效率>97%，需选用极低Rds(on) MOSFET、同步整流并优化磁芯与绕组。', level: 'warn' })
  } else if (efficiency < 92) {
    s.push({ text: '目标效率较为保守，容易达到，仍有优化空间。', level: 'good' })
  } else {
    s.push({ text: `目标效率${efficiency}%合理，通过优化磁芯与开关器件可实现。`, level: 'good' })
  }

  // 8. Component values
  if (cr < 1e-9) {
    s.push({ text: '谐振电容Cr<1nF，数值较小，PCB寄生电容可能影响谐振点。', level: 'warn' })
  }
  if (lm < 50e-6) {
    s.push({ text: '励磁电感Lm<50μH，注意磁芯损耗与饱和电流。', level: 'warn' })
  }
  if (fsw > 500000) {
    s.push({ text: '开关频率>500kHz，注意开关损耗与EMI。', level: 'warn' })
  }

  return s.slice(0, 10)
}
