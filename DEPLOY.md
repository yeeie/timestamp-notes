部署到 GitHub Pages — 准备与步骤

推荐方式

- 使用 `docs/` 目录（适合手动上传或直接推送到 `main`）：将构建产物放到仓库根目录下的 `docs/` 文件夹，GitHub Pages 设置中选择 `main` 分支的 `docs/` 文件夹作为发布源。

我已为你执行的操作

- 已将 `dist/` 的内容复制到 `docs/`（路径：`docs/`）。
- 在 `docs/` 中创建了空文件 `.nojekyll`，避免 GitHub Pages 忽略以 `_` 开头的文件或路径。

如果你想使用此方式（`docs/`）：

1. 检查并提交 `docs/` 到仓库：

```bash
git add docs .nojekyll
git commit -m "chore: add docs build for GitHub Pages"
git push origin HEAD
```

2. 在 GitHub 仓库设置 → Pages 中：
   - Source 选择 `main`（或你当前分支）
   - Folder 选择 `/docs`，保存并等待部署（通常几分钟）

另一种方式 — 使用 `gh-pages` 分支（自动化部署）

- 使用 `gh-pages` npm 包或 `peaceiris/actions-gh-pages` Action 可以把 `dist/` 发布到 `gh-pages` 分支，不需要把静态文件入库：

前端本地命令（使用 npm 包）：

```bash
npm install --save-dev gh-pages
# package.json 中添加脚本
# "predeploy": "npm run build",
# "deploy": "gh-pages -d dist"
npm run deploy
```

CI 自动部署（示例）

- 我们仓库已有 CI workflow 示例使用 `peaceiris/actions-gh-pages`。合并 PR 到 `main` 后，Actions 会构建并自动推送到 Pages。

CNAME（自定义域）

- 如果你需要使用自定义域，在 `docs/` 根下放置 `CNAME` 文件，内容为你的域名（例如 `example.com`），并在 GitHub Pages 设置中配置自定义域。

故障排查

- 访问 404：确认 `index.html` 在 `docs/` 根路径。
- 静态资源路径错误：若你的 `index.html` 使用了绝对路径（例如 `/assets/...`），确保构建配置（`base`）正确，例如在 `vite` 的 `vite.config.ts` 设置 `base: './'` 或 `'/your-repo-name/'`。

需要我帮你执行哪些步骤？（选一）
- 我来把 `docs/` 提交为 commit 并推送到远端分支。
- 我来把 `dist/` 通过 `gh-pages` 发布（需要我加 dev 依赖并运行）。
- 仅生成部署说明和 CI 配置（我已生成 `DEPLOY.md`）。
