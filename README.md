# LLC 谐振变换器设计工具

面向电力电子工程师、学生与研究者的 LLC 谐振变换器**知识学习 + 工程设计**网站。

- 线上地址：https://wisdomhuang2020.github.io/LLC-Design-Tool/
- 仓库地址：git@github.com:WisdomHuang2020/LLC-Design-Tool.git

## 功能

网站兼具两重定位：一是系统化的理论学习，二是可直接使用的参数设计工具。

| 路由 | 页面 | 内容 |
|------|------|------|
| `/` | 首页 | 导航与各模块入口 |
| `/fundamentals` | 谐振基础 | LC / LLC 谐振理论、串并联谐振对比、拓扑变体、关键参数定义 |
| `/operation` | 工作原理 | 开关模态、关键波形、ZVS 条件、增益特性与设计折衷 |
| `/derivations` | 公式推导 | FHA 近似、等效交流电路、增益方程、谐振频率、阻抗与电流应力完整推导 |
| `/curves` | 特性曲线 | 增益 / 阻抗 / 相位曲线，参数可交互调节 |
| `/designer` | 设计工具 | 输入 Vin / Vout / Pout 等条件，自动计算 n、Lr、Cr、Lm、Q、k、ZVS 裕量与电流应力，并给出优化建议 |
| `/report` | 报告预览 | 汇总设计结果生成工程报告，支持 PDF / Markdown 导出 |

## 技术栈

- 构建与框架：Vite 6、React 19、TypeScript 5.7、Tailwind CSS 4
- 公式渲染：KaTeX
- 图表：Recharts
- 动效：framer-motion
- 报告导出：html2pdf.js
- 图标：lucide-react

路由使用 `HashRouter`，并在 `vite.config.ts` 中设置 `base: './'`，以适配 GitHub Pages 的子路径部署。

## 本地开发

```bash
npm install
npm run dev       # 启动开发服务器
npm run build     # 生产构建
npm run preview   # 预览构建产物
npm run lint      # 代码检查
```

生产构建实际执行 `tsc -b && vite build && perl patch_dist_latex.pl`。
最后一步依赖 `perl`（用于修补 dist 产物中的 LaTeX 转义），Linux / macOS 与 GitHub Actions 环境自带，Windows 需另行安装，否则可单独执行前两步验证构建。

## 版本与发布

版本号以 `package.json` 的 `version` 字段为唯一来源，构建时经 `__APP_VERSION__` 注入前端。

提交并推送（自动将 patch 版本号 +1）：

```bash
./scripts/commit.sh "改动说明"
```

推送到 `main` 分支后，GitHub Actions 会按 `.github/workflows/deploy.yml` 自动执行 `npm ci` → `npm run build` → 发布到 GitHub Pages。

## 目录结构

```
src/
  pages/        7 个路由页面
  components/   布局、图表、电路符号、数学块等共享组件
  lib/          DesignContext（跨页面共享的设计状态）
docs/
  yang-papers/  LLC 理论参考资料与核心公式总结
design/
  design.md     产品设计文档（配色、排版、页面规格、状态契约）
research/
  audit_report.md  公式与计算逻辑审计报告
```

## 已知事项

- **本站为纯静态站点，不含后端。** 站点托管于 GitHub Pages，仅支持静态文件，所有设计的持久化均在浏览器本地完成（设计页「保存到本地」按钮，以及参数、结果、损耗模型的自动保存）。历史上曾存在的 `llc-server/`（Express + SQLite）与 `src/lib/api.ts` 已移除，如需查阅可在提交 `4e6b9dbe` 中取回。
- **后端后续以 API 形式解耦接入。** 接入时建议前端从**运行时**配置读取 API 基址（例如发布产物旁的 `config.json`，或挂载到 `window` 的配置对象），而不是构建时环境变量——后者需要重新构建前端才能切换后端，与解耦目标相悖。
- **公式审计存在遗留结论待复核。** `research/audit_report.md` 记录了 2026-06-20 的审计结果（14 项）。其中 `racMin`、`fmax` 边界、`irRms`、`imDeadtime` 四项已确认修复；`fmin` 一项（DES-02）经数值验算后确认**原代码正确、审计结论为误报**，无需修改。
- 构建产物单个 JS chunk 超过 1 MB，如需优化可考虑 `manualChunks` 拆分。
