/**
 * 构建后给 favicon 的引用加上内容哈希戳（形如 ./favicon.svg?v=6af990fe）。
 *
 * 为什么需要它：
 *   favicon 是浏览器缓存最顽固的资源 —— 比普通 JS/CSS 还狠。Chrome 对图标
 *   走的是独立缓存，**强制刷新（Ctrl+F5）也常常不重新拉取**。
 *   2026-09-29 站群统一图标时就踩到：服务端文件已更新、三方 md5 一致，
 *   但用户标签页仍显示旧图标，只能手动清缓存。
 *
 *   根因有二：
 *     ① URL 不变（恒为 /favicon.svg）→ 浏览器没有任何"变了"的信号；
 *     ② nginx 对该静态文件只给 ETag / Last-Modified，没有 Cache-Control，
 *        浏览器遂启用启发式缓存（按 (now - Last-Modified) × 10% 估算有效期）。
 *
 *   解法沿用 optical 站的做法：把资源内容哈希拼进 URL。
 *   favicon 一变 → 哈希变 → URL 变 → 浏览器必然重新请求。
 *   （哈希取自文件字节，故它与文件内容严格一一对应，无需手工维护。）
 *
 * 幂等：对已带 ?v= 的引用会先剥掉旧戳再加新戳，重复构建结果稳定。
 * 由 package.json 的 build 脚本在 vite build 之后调用。
 */
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const favicon = resolve(root, 'dist', 'favicon.svg')
const html = resolve(root, 'dist', 'index.html')

if (!existsSync(favicon)) {
  // 用 throw 而非 process.exit(1)：不依赖 Node 全局变量，
  // 以免 eslint 的 no-undef 在未声明 node 环境的 scripts/ 目录下报错。
  throw new Error(`[stamp-favicon] 找不到 ${favicon} —— 是否漏跑 vite build？`)
}
if (!existsSync(html)) {
  throw new Error(`[stamp-favicon] 找不到 ${html} —— 是否漏跑 vite build？`)
}

const hash = createHash('sha256').update(readFileSync(favicon)).digest('hex').slice(0, 8)

let src = readFileSync(html, 'utf8')

// 先剥旧戳再打新戳（幂等），同时兼容 ./favicon.svg 与 /favicon.svg 两种写法
const BEFORE = /(["'/])favicon\.svg(?:\?v=[0-9a-f]+)?(["'])/g
const stamped = src.replace(BEFORE, (_m, a, b) => `${a}favicon.svg?v=${hash}${b}`)

if (stamped === src && !src.includes(`favicon.svg?v=${hash}`)) {
  throw new Error('[stamp-favicon] index.html 中未找到 favicon.svg 的引用 —— 引用写法变了？')
}

writeFileSync(html, stamped)
console.log(`[stamp-favicon] index.html 中的 favicon 引用 -> ?v=${hash}`)
