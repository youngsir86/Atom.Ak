# 大搜渠道利润测算模型（GitHub Pages 版）

这是一个基于 **Vite + React** 的前端项目，可直接部署到 GitHub Pages。  
页面结构仍然由 `index.html` + `src/app.jsx` 组成，但通过 Vite 进行打包和本地开发。

## 功能特点

- 实时利润测算：支持多维度参数调节，实现实时利润计算
- 业务线分离：分别管理无创、个人、司法三条业务线
- 成本控制：精细的成本分配与分摊机制
- 数据可视化：提供盈亏平衡点矩阵分析
- AI洞察：集成Gemini AI进行智能财务分析
- 历史记录：保存测算快照便于跟踪对比
- 访问控制：新增登录验证功能

## 新增功能

- 添加了登录验证功能，密码为：`666666`
- 权限开通联系人：杨洪海
- 账户管理与权限控制
- 安全验证流程
- 用户身份确认机制

## 目录结构

- `index.html`：页面入口（Vite / GitHub Pages 直接识别）
- `src/main.jsx`：应用入口，挂载 React
- `src/app.jsx`：React 应用主体代码（从原单文件抽离）
- `vite.config.js`：Vite 配置（React + SWC）

## 本地预览

### 方式 1：直接用 Vite（推荐，用于开发）

先在项目根目录安装依赖（只需一次）：

```bash
npm install react react-dom vite @vitejs/plugin-react-swc
```

然后本地启动开发服务器：

```bash
npm run dev
```

Vite 会在终端输出一个本地地址，你可以在浏览器或 Cursor Browse 里访问并实时预览。

### 方式 2：不跑 Vite，直接静态打开

仍然可以直接双击 `index.html`（`file://`）或用简单静态服务器：

```bash
cd d:\new
python -m http.server 8000
```

然后在浏览器访问 `http://localhost:8000/`。

## 部署到 GitHub Pages（最简单）

1. 在 GitHub 新建仓库（例如 `profit-model`）
2. 把本目录下的文件推送到仓库的 `main` 分支根目录
3. 打开仓库 Settings → Pages
4. 选择：
   - **Build and deployment**: Deploy from a branch
   - **Branch**: `main`
   - **Folder**: `/ (root)`
5. 保存后等待 1-2 分钟，Pages 会给出站点地址

## 部署到 Zeabur（推荐）

将此项目推送到 GitHub 后，可通过 Zeabur 直接部署：

1. 注册并登录 [Zeabur](https://zeabur.com/)
2. 通过 Git 连接您的 GitHub 仓库
3. 选择此仓库进行自动化部署
4. 部署完成后，您将获得一个访问域名

### 部署注意事项：

- Framework: React
- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm install`

## 访问控制说明

- 默认访问密码：`666666`
- 权限开通联系人：杨洪海
- 登录成功后可正常使用所有功能

## AI 智能洞察（Gemini Key）

页面不会把 Key 写死在仓库里。你可以在浏览器控制台执行：

```js
localStorage.setItem('GEMINI_API_KEY','你的key')
```

然后点击页面右上角「AI 智能洞察」即可。

