# 大搜渠道利润测算模型 V1.0.0

核心业务：亲子鉴定（无创/个人/司法） | 核心渠道：百度搜索

## 功能特性

### 1. 核心功能
- 💰 大搜渠道利润测算
- 📊 多维度成本分析（推广、人力、变动成本）
- 🎯 策略矩阵模拟分析器（盈亏平衡点追踪）
- ✨ AI 智能洞察（基于 Gemini AI）
- 📈 历史测算记录快照

### 2. 业务线管理
- **无创产前检测**：高客单价、高转化率
- **个人健康检测**：中等客单价、稳定流量
- **司法鉴定**：高客单价、特殊成本结构

### 3. 成本核算
- 推广费用动态分配
- 人力成本精确核算（售前/售中/管理层）
- 变动成本自动计算（检测费、提成、受理费）

### 4. 新增功能（V1.0.0）
- ✅ 集团成本分摊输入框（策略矩阵模拟分析器中）
- ✅ 检测底价模式（悬停显示计算规则）
  - 无创：300 元/单
  - 个人：150 元/单
  - 司法：0.5（费率）

## 技术栈

- **前端框架**：React 18.3.1
- **构建工具**：Vite 5.4.0
- **样式方案**：Tailwind CSS（CDN）
- **图标库**：Lucide Icons
- **AI 集成**：Gemini API

## 本地开发

### 环境要求
- Node.js >= 16.x
- npm >= 8.x

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

访问 http://localhost:5173/

### 构建生产版本
```bash
npm run build
```

### 预览生产构建
```bash
npm run preview
```

## 部署指南

### GitHub Pages 部署
```bash
npm run deploy:gh
```

访问：https://yourusername.github.io/Atom.Ak/

### Zeabur 部署
1. 连接 GitHub 仓库
2. 选择 main 分支
3. 自动构建部署

### Vercel 部署
1. 导入 GitHub 仓库
2. 自动检测 Vite 框架
3. 一键部署

### 分支管理
项目使用三个分支：
- **master**: 主要开发分支，用于 Zeabur/Vercel 部署
- **main**: 备用主分支，与 master 保持同步
- **gh-pages**: GitHub Pages 部署分支（自动构建）

#### 同步所有分支到 GitHub
Windows 系统可以运行以下脚本：

**方式 1：使用 PowerShell 脚本**
```powershell
.\sync-branches.ps1
```

**方式 2：使用批处理脚本**
```batch
sync-all-branches.bat
```

**方式 3：手动执行命令**
```bash
# 1. 推送到 master
git checkout master
git push origin master

# 2. 同步 main 分支
git checkout main
git merge master --no-edit
git push origin main

# 3. 构建并部署 gh-pages
git checkout master
npm run deploy:gh
```

## 使用说明

### 登录系统
- 默认密码：666666
- 权限开通请联系：杨洪海

### 参数设置
1. **全局大盘与薪资设置**
   - 综合单成本
   - 总日均售中量
   - 售前/售中薪资
   - 管理层薪酬

2. **各业务线配置**
   - 流量占比
   - 转化率
   - 客单价
   - 部门经理人数
   - 售中人均接待量

3. **变动成本要素**
   - 检测费（无创/个人：固定金额，司法：营收百分比）
   - 提成率
   - 受理费（自动联动计算）

### 策略矩阵模拟
1. 点击"🎯 策略矩阵模拟"按钮
2. 调整参数范围：
   - 综合单成本区间
   - 日均量区间
   - 各业务线转化率
   - 各业务线客单价
3. 启用"检测底价模式"查看底价策略效果
4. 输入"集团成本分摊"金额计算净利润
5. 查看盈亏平衡点（最接近 0 的单元格）

### AI 智能洞察
1. 点击"✨ AI 智能洞察"按钮
2. 需要配置 Gemini API Key：
   ```javascript
   localStorage.setItem('GEMINI_API_KEY', 'your-api-key')
   ```
3. 获取专业的财务诊断报告

## 版本历史

### V1.0.0 (2026-02-28)
- ✅ 新增集团成本分摊功能
- ✅ 新增检测底价模式及悬停提示
- ✅ 优化策略矩阵模拟分析器
- ✅ 添加版本号显示

## 文件结构

```
d:\new/
├── src/
│   ├── app.jsx          # 主应用组件
│   └── main.jsx         # 应用入口
├── index.html           # HTML 模板
├── package.json         # 依赖配置
├── vite.config.js       # Vite 配置
├── README.md            # 项目文档
└── deploy.bat           # 部署脚本
```

## 注意事项

1. **浏览器缓存**：开发服务器已配置无缓存响应，如仍看到旧版本请强制刷新（Ctrl+F5）
2. **API Key 安全**：Gemini API Key 存储在本地 localStorage，请勿泄露
3. **数据持久化**：配置数据保存在浏览器 localStorage，清除缓存会丢失数据

## 技术支持

如有问题或建议，请联系开发团队。
