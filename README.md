# 安安的奇妙旅行

像素地图互动网站，包含背景故事、换装、小游戏、回忆小屋、风景图鉴、表情博物馆和碎碎念。

## 发布

GitHub Pages 使用 `main` 分支的 `/docs` 目录。`docs/.nojekyll` 确保 `_next` 中的脚本正常发布。

## 开发

使用 Node.js 22.13 或更新版本，通过 `pnpm install --frozen-lockfile` 安装依赖，`pnpm dev` 本地预览，`pnpm build` 导出静态网站到 `dist/client`。

更新后将 `dist/client` 内容复制到 `docs`，保留 `.nojekyll`，提交并推送即可更新 Pages。

网站进度与碎碎念使用浏览器本地存储，不会在设备之间同步。
