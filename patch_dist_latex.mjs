#!/usr/bin/env node
/**
 * 构建后处理：把 dist 主 bundle 里 latex:"..." 字符串内的**四连反斜杠折半成二连**。
 *
 * 为什么需要这一步
 * ----------------
 * 本项目 JSX 里把 LaTeX 写成属性字面量 `latex="\\frac{1}{2}"`（源码里两个反斜杠）。
 * 但 **JSX 的属性字符串不处理 JS 转义序列** —— 属性值就是字面上的两个反斜杠；
 * 打包器为了在 JS 字符串字面量里如实表达这两个反斜杠，会再转义一层，
 * 于是产物里是 `\\\\frac`（四个）。运行时 KaTeX 于是收到**两个**反斜杠，
 * 而 `\\` 在 LaTeX 里是「换行」命令，`\frac` 被当普通文字渲染 ——
 * 整站公式显示成 "M(f_n, k, Q) = frac{1}{sqrt{..." 这种原样命令。
 *
 * 所以构建后必须把 latex:"..." 内部每 4 个连续反斜杠折半为 2 个，让运行时拿到单反斜杠的正确 LaTeX。
 *
 * 与 patch_dist_latex.pl 的关系
 * ----------------------------
 * 本脚本是该 perl 脚本的 Node 移植，**输出逐字节等价**（已用真实 bundle 比对 md5 相同）。
 * 改用 Node 的原因：构建链第三步原先依赖 perl，而本机沙箱 PATH 里没有 perl，
 * 于是"本地验证只跑前两步"，漏掉这一步会产出**公式静默损坏**的产物 ——
 * 2026-09-27 已因此白跑一轮全站公式排查。Node 是 Vite 构建本就需要的运行时，无额外依赖。
 *
 * 幂等性
 * ------
 * 安全：只对**含四连反斜杠**的 latex 串做折半。已处理过（正确）的 bundle 里
 * 这些串只含二连反斜杠，故重复执行是 **no-op**，不会把公式越改越坏。
 * （实测：线上正式产物的 latex 串全部只有二连反斜杠，无四连。）
 *
 * ⚠️ 反斜杠计数陷阱（本脚本第一版就栽在这里）
 * ------------------------------------------
 * 正则里匹配 **N 个连续反斜杠，源串需要 2N 个反斜杠字符**。
 * 故匹配 4 连要 `BS.repeat(8)`，匹配 2 连要 `BS.repeat(4)` —— 少写一倍会静默变成
 * "匹配 1 连"或"匹配 2 连"，脚本照常退出 0 但什么也没改。下面用 `bsRun(n)` 把这条
 * 规则显式化，避免再犯。
 *
 * 用法:
 *   node patch_dist_latex.mjs                    # 自动定位 dist/assets/index-*.js
 *   node patch_dist_latex.mjs path/to/bundle.js  # 指定文件
 */
import fs from 'node:fs'
import path from 'node:path'

const BS = String.fromCharCode(92) // 反斜杠本体；不用字面量，避免各层转义干扰

/** 匹配 n 个连续反斜杠（源串需 2n 个反斜杠字符） */
const bsRun = (n) => new RegExp(BS.repeat(2 * n))
/** 匹配 n 个连续反斜杠，全局替换用 */
const bsRunG = (n) => new RegExp(BS.repeat(2 * n), 'g')

// 字符串体：允许「非引号非反斜杠」字符，或「反斜杠+任意字符」的转义对，故不会跨越字符串边界。
// 注意 `[^"\\]` 与 `\\.` 各只需 2 个反斜杠字符（= 匹配 1 个反斜杠本体）。
const attrRe = new RegExp('(latex:")((?:[^"' + BS + BS + ']|' + BS + BS + '.)*)(")', 'g')
const FOUR_RUN = bsRun(4)
const TWO_RUN_G = bsRunG(2)
// 折半 = 把每一对反斜杠替换成单个反斜杠（与 perl 的 s/\\\\/\\/g 等价）。
// ⚠️ 别写成「匹配 2 个、替换成 2 个」—— 那是恒等替换，脚本会静默什么都不做。

function pickBundle() {
  if (process.argv[2]) return process.argv[2]
  const dir = 'dist/assets'
  let entries
  try {
    entries = fs.readdirSync(dir)
  } catch {
    console.error(`No ${dir} directory found.`)
    process.exit(1)
  }
  const candidates = entries
    .filter((f) => f.startsWith('index-') && f.endsWith('.js'))
    .map((f) => path.join(dir, f))
  if (candidates.length === 0) {
    console.error('No dist/assets/index-*.js bundle found.')
    process.exit(1)
  }
  if (candidates.length > 1) {
    console.error(`Multiple dist/assets/index-*.js bundles found: ${candidates.join(' ')}`)
    process.exit(1)
  }
  return candidates[0]
}

const file = pickBundle()
const original = fs.readFileSync(file, 'utf8')
let touched = 0

const replaced = original.replace(attrRe, (m, pre, body, post) => {
  if (!FOUR_RUN.test(body)) return m // 已处理过 / 本就无需处理
  touched++
  return pre + body.replace(TWO_RUN_G, BS) + post
})

if (replaced === original) {
  console.log(`No changes made (${file} already correct).`)
  process.exit(0)
}

fs.writeFileSync(file, replaced)
console.log(`Patched ${file} (${touched} latex string(s))`)
