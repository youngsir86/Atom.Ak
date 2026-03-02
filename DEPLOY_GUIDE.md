# GitHub 分支同步部署指南

## 问题说明
当前环境网络连接不稳定，无法直接推送到 GitHub。请按照以下步骤手动完成部署。

## 前置准备

### 1. 确保本地提交已完成
```bash
git status
```
应该看到类似输出：
```
On branch master
Your branch is ahead of 'origin/master' by 3 commits.
  (use "git push" to publish your local commits)
```

### 2. 配置 Git（优化网络连接）
```bash
git config --global http.postBuffer 524288000
git config --global http.lowSpeedLimit 0
```

## 部署步骤

### 方式一：使用自动化脚本（推荐）

**网络稳定时执行：**
```powershell
.\sync-git.ps1
```

脚本会自动完成：
- ✅ 检查网络连接
- ✅ 推送 master 分支
- ✅ 同步 main 分支
- ✅ 构建并部署 gh-pages

### 方式二：手动逐步执行

如果脚本执行失败，请手动执行以下命令：

#### 步骤 1：推送 master 分支
```bash
git checkout master
git push origin master
```

#### 步骤 2：同步 main 分支
```bash
git checkout main
git merge master --no-edit
git push origin main
```

#### 步骤 3：部署 GitHub Pages
```bash
git checkout master
npm run build:gh
npm run deploy:gh
```

## 常见问题解决

### 问题 1: Connection reset
**错误信息：** `fatal: unable to access 'https://github.com/...': Recv failure: Connection was reset`

**解决方案：**
1. 检查网络连接
2. 配置 Git 缓冲区：
   ```bash
   git config --global http.postBuffer 524288000
   ```
3. 稍后重试，或使用手机热点

### 问题 2: Could not connect to server
**错误信息：** `fatal: unable to access 'https://github.com/...': Failed to connect to github.com port 443`

**解决方案：**
1. 检查防火墙设置
2. 尝试使用 SSH 方式：
   ```bash
   git remote set-url origin git@github.com:youngsir86/Atom.Ak.git
   git push origin master
   ```

### 问题 3: 合并冲突
**错误信息：** `CONFLICT (content): Merge conflict in ...`

**解决方案：**
1. 手动解决冲突文件
2. 标记冲突已解决：
   ```bash
   git add <文件名>
   git commit -m "解决合并冲突"
   ```
3. 继续推送：
   ```bash
   git push origin main
   ```

## 验证部署

### 1. 检查 GitHub 仓库
访问：https://github.com/youngsir86/Atom.Ak

确认三个分支都已更新：
- ✅ master 分支
- ✅ main 分支  
- ✅ gh-pages 分支

### 2. 检查 GitHub Pages
访问：https://youngsir86.github.io/Atom.Ak/

确认页面显示：
- ✅ V1.0.0 版本号
- ✅ 登录界面正常
- ✅ 集团成本分摊功能可用
- ✅ 检测底价模式有悬停提示

### 3. 检查 Zeabur/Vercel 部署
如果使用 Zeabur 或 Vercel 部署，确认自动构建已触发并成功。

## 本地验证

在推送前，确保本地功能正常：

### 启动开发服务器
```bash
npm run dev
```

访问 http://localhost:5173/

### 验证功能点
1. **登录页面** - 显示 "大搜渠道利润测算模型 V1.0.0"
2. **主页面** - 标题显示 "大搜渠道利润测算模型 V1.0.0"
3. **策略矩阵模拟** - 包含集团成本分摊输入框
4. **检测底价模式** - 鼠标悬停显示计算规则

## 联系支持

如果遇到问题，请检查：
- 网络连接是否稳定
- Git 配置是否正确
- GitHub 账号权限是否正常
- 本地代码是否已提交

---
**最后更新：** 2026-03-02
**版本：** V1.0.0
