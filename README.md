# CleanText

一个使用 React、TypeScript 与 TDesign 构建的轻量文本清理工具。处理过程完全发生在浏览器本地，支持实时预览、中英文界面、明暗主题、自动历史快照、按句悬浮复制与跨片段拖选。所有结果区复制操作均强制输出纯文本，避免携带网页样式。

## 本地开发

```bash
npm install
npm run dev
```

质量检查：

```bash
npm test
npm run lint
npm run build
```

## 部署到 Cloudflare Pages

仓库已包含 `wrangler.jsonc` 与安全响应头配置。使用 Wrangler 直接部署：

```bash
npm run build
npm run deploy
```

也可以在 Cloudflare Dashboard 中连接 Git 仓库：

- 构建命令：`npm run build`
- 部署命令：`npm run deploy:only`（如果控制台提供此字段）
- 输出目录：`dist`
- 根目录：本项目所在目录

这是一个 Pages 项目，不要使用 `npx wrangler deploy`；该命令用于 Workers，会因为没有 Worker 入口文件而失败。

## 隐私

应用没有服务端接口、分析脚本或外部字体。输入内容不会被上传；当前草稿、语言、主题偏好与最近 30 个文本快照仅保存在浏览器的 `localStorage`，可以随时在历史面板中删除。

© 2026 DimLoong
