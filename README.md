[README.md](https://github.com/user-attachments/files/32139791/README.md)
# Timestamp Notes

轻量级时间戳记录工具，适用于会议纪要、作品反馈、项目评审等情境。该应用为纯前端静态站点，支持手动计时、时间戳记录、笔记编辑、多 Session 管理、JSON/Markdown 导出，以及本地 IndexedDB 持久化。

项目仓库名：`timestamp-notes`

访问地址示例（GitHub Pages）：

```text
https://yeeie.github.io/timestamp-notes/
```

---

## 1. 项目概览

技术栈：
- React 18
- Vite
- TypeScript
- IndexedDB（通过 `idb`）
- UUID（时间戳笔记/会话 ID）

核心能力：
- 手动计时器：开始 / 暂停 / 归零 / 设置时间
- 记录当前时间戳，并为每一条时间戳附加笔记
- 多 Session 管理：支持创建、切换、删除会话
- 批量选择与时间偏移：支持选中条目后统一增加/减少偏移
- JSON 导入 / 导出
- Markdown 导出 / 复制到剪贴板
- 本地自动保存（IndexedDB）
- 支持快捷键：`Space` 开始/暂停，`R` 记录当前时间，`Ctrl + Enter` 保存并跳到下一条

---

## 2. 目录结构

```text
timestamp-notes/
├─ .github/
│  └─ workflows/
│     ├─ ci-deploy.yml
│     └─ deploy.yml
├─ docs/
│  ├─ index.html
│  ├─ .nojekyll
│  └─ assets/
├─ public/
├─ src/
│  ├─ App.tsx
│  ├─ styles.css
│  ├─ main.tsx
│  ├─ types.ts
│  ├─ components/
│  │  ├─ Sidebar.tsx
│  │  ├─ NoteList.tsx
│  │  ├─ NoteItem.tsx
│  │  └─ ...
│  ├─ hooks/
│  │  └─ useTimer.ts
│  ├─ services/
│  │  ├─ storage.ts
│  │  └─ importExport.ts
│  └─ utils/
│     ├─ formatTime.ts
│     ├─ generateMarkdown.ts
│     └─ pathToFileUri.ts
├─ .gitignore
├─ .htmlvalidate.json
├─ DEPLOY.md
├─ README.md
├─ package.json
├─ tsconfig.json
├─ vite.config.ts
├─ dist/
├─ timestamp-notes-dist.zip
└─ index.html
```

---

## 3. 架构说明

### 3.1 App 层：`src/App.tsx`
这是整个应用的核心编排层，负责：
- 会话 state 管理
- 计时器与状态同步
- 时间戳记录、删除、偏移
- 导入/导出 JSON
- Markdown 导出
- 保存到 IndexedDB
- 键盘快捷键

它本质上是一个单页应用的“控制器 + 状态中心”。

### 3.2 计时器：`src/hooks/useTimer.ts`
定时逻辑模块，封装：
- `start()`
- `pause()`
- `reset()`
- `setTimeMs()`

它使用 `requestAnimationFrame` 进行 UI 级重绘，确保计时器可以平滑显示毫秒 / 格式化时间。

### 3.3 数据存储：`src/services/storage.ts`
使用 IndexedDB（`idb`）保存会话数据，避免持久化到本地存储的局限性：
- 会话数据结构：`Session[]`
- 时间戳记录：`TimestampNote[]`
- 自动保存延时写入，避免每次输入都立刻写库

### 3.4 导出 Markdown：`src/utils/generateMarkdown.ts`
负责把当前会话转换成 Markdown 文本，并为每个时间段生成可跳转链接。例如：
- `[00:10.00](#t=00:10.00)`
- 或带媒体网址前缀的链接

### 3.5 组件层：`src/components/*`
- `Sidebar.tsx`：会话列表与创建/删除会话
- `NoteList.tsx`：时间戳列表展示
- `NoteItem.tsx`：单条笔记编辑与选择
- 其余文件用于 UI 结构和交互收敛

### 3.6 样式层：`src/styles.css`
包含：
- 全局主题色
- 按钮样式
- 输入框样式
- 会话列表和笔记卡片样式
- 响应式布局

---

## 4. 本地开发

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

默认会启动 Vite 开发服务器，通常可在浏览器访问：

```text
http://localhost:5173/
```

### 生产构建

```bash
npm run build
```

构建产物输出到：

```text
dist/
```

### 本地预览生产包

```bash
npm run preview
```

### HTML 校验（CI 风格本地校验）

```bash
npm run ci-check
```

---

## 5. GitHub Pages 部署

本项目的静态网站部署采用了 GitHub Pages 的 `docs/` 目录方案：

1. 先执行构建：

```bash
npm run build
```

2. 复制 `dist/` 到 `docs/`：

```bash
rm -rf docs
mkdir docs
cp -r dist/* docs/
```

3. 生成 `.nojekyll`：

```bash
touch docs/.nojekyll
```

4. 提交到 branch 并在 GitHub Pages 中选择：
- Source: `Deploy from a branch`
- Branch: 你的部署分支（例如 `0906fix`）
- Folder: `/docs`

注意：
- `vite.config.ts` 中使用了 `base: './'`，确保资源路径为相对路径，避免在 GitHub Pages 及本地双击打开时出现空白页问题。
- GitHub Pages 默认会走 Jekyll，因此 `.nojekyll` 是必需的，确保静态站点不会被 Jekyll 错误处理。

---

## 6. 数据模型简述

```ts
interface Session {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  notes: TimestampNote[]
}

interface TimestampNote {
  id: string
  timestampMs: number
  note: string
  createdAt: string
  updatedAt: string
}
```

说明：
- `Session` 表示一次会议 / 一项记录任务
- `TimestampNote` 表示某个时间点记录的一条备注
- 存储使用 IndexedDB，不依赖后端

---

## 7. 维护建议

### 7.1 关注点
- `src/App.tsx`：主逻辑，改功能优先在这里看
- `src/hooks/useTimer.ts`：计时器核心逻辑
- `src/services/storage.ts`：存储行为与数据库结构
- `vite.config.ts`：部署相关基础路径配置

### 7.2 常见问题

#### 页面部署后空白
检查：
- `vite.config.ts` 是否保留 `base: './'`
- `docs/index.html` 资源是否为相对路径
- GitHub Pages 绑定的分支/目录是否正确
- `docs/.nojekyll` 是否存在

#### 记录时间显示异常
检查：
- `src/hooks/useTimer.ts`
- `src/utils/formatTime.ts`

#### 数据丢失
检查：
- `src/services/storage.ts`
- 浏览器 IndexedDB 是否被清理

---

## 8. 运行与验证命令速查

```bash
npm install
npm run dev
npm run build
npm run preview
npm run ci-check
```

---

## 9. 备注

- 本项目是纯前端，不依赖后端服务。
- 适合 GitHub Pages 等静态托管平台。
- 如果后续要扩展功能（例如同步服务、用户登录、云端存储），建议先抽离 `Storage` 层和 `Session` 模型，再重构 UI 逻辑。

---

如果后续需要继续开发，请优先从以下位置入手：
1. `src/App.tsx`（UI 与状态整合）
2. `src/hooks/useTimer.ts`（计时逻辑）
3. `src/services/storage.ts`（持久化）
4. `src/utils/generateMarkdown.ts`（导出能力）
5. `vite.config.ts`（部署与 Base 配置）
