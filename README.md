
<div align="center">
  <!-- Logo (如果你有Logo图片可以替换下面的占位符，没有则使用文字) -->
  <!-- <img src="public/logo.png" alt="Logo" width="120" height="120"> -->
  
  # 🌐 Virtual Horizon (虚视界)

  **下一代沉浸式虚拟电商与社交平台**
  
  <p>
    基于 React + Vite + Supabase 构建的现代化 Web 应用
  </p>

  <!-- Badges -->
  <p>
    <a href="https://github.com/hyyhf/xushijie">
      <img src="https://img.shields.io/github/last-commit/hyyhf/xushijie?style=flat-square&color=5D5FEF&label=updates" alt="Last Commit" />
    </a>
    <a href="https://github.com/hyyhf/xushijie">
      <img src="https://img.shields.io/github/repo-size/hyyhf/xushijie?style=flat-square&color=orange" alt="Repo Size" />
    </a>
    <img src="https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Vite-6.x-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
    <img src="https://img.shields.io/badge/Supabase-Database-3ECF8E?style=flat-square&logo=supabase&logoColor=white" alt="Supabase" />
    <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License" />
  </p>
  
  <p>
    <a href="#-功能亮点">✨ 功能亮点</a> •
    <a href="#-技术栈">🛠 技术栈</a> •
    <a href="#-快速开始">🚀 快速开始</a> •
    <a href="#-项目结构">📂 项目结构</a> •
    <a href="#-贡献指南">🤝 贡献指南</a>
  </p>
</div>

---

## 📖 项目简介

**Virtual Horizon (虚视界)** 是一个融合了虚拟形象技术、社交互动与电商购物的综合性平台。我们致力于为用户打造一个打破次元壁的在线空间，在这里，每个人都可以定义自己的数字分身，体验沉浸式的购物乐趣，并与志同道合的朋友建立连接。

## ✨ 功能亮点

### 👤 沉浸式用户体验
- **虚拟形象 (Avatar)**: 高度可定制的 3D/2D 虚拟形象系统，支持发型、妆容、服饰、动作的个性化搭配。
- **个人中心**: 精美的玻璃拟态 (Glassmorphism) UI 设计，直观展示用户动态、收藏与成就。

### 🛍️ 创新电商模式
- **虚拟试穿**: AI 驱动的虚拟试穿体验，让购物更直观、更有趣。
- **直播购物**: 沉浸式直播间，支持弹幕互动、商品详情实时查看。
- **商家后台**: 强大的数据可视化看板 (Dashboard)，实时监控流量、转化率与用户画像。

### 🌏 互动社区
- **动态分享**: 发布图文动态，支持标签 (#OOTD, #好物推荐) 与话题讨论。
- **社交互动**: 完整的点赞、评论、关注机制，构建活跃的社区氛围。
- **实时反馈**: 优化的点赞与交互反馈动画，提升操作愉悦感。

### 🔒 安全与性能
- **Supabase Auth**: 企业级身份验证系统，支持邮箱注册/登录。
- **性能优化**: 请求防抖、智能重试机制与超时保护，确保在弱网环境下也能流畅运行。

## 🛠 技术栈

<table>
  <tr>
    <td align="center" width="200">
      <img src="https://skillicons.dev/icons?i=react" width="48" height="48" alt="React" /><br>
      <b>React 18</b>
    </td>
    <td align="center" width="200">
      <img src="https://skillicons.dev/icons?i=ts" width="48" height="48" alt="TypeScript" /><br>
      <b>TypeScript</b>
    </td>
    <td align="center" width="200">
      <img src="https://skillicons.dev/icons?i=vite" width="48" height="48" alt="Vite" /><br>
      <b>Vite</b>
    </td>
    <td align="center" width="200">
      <img src="https://skillicons.dev/icons?i=supabase" width="48" height="48" alt="Supabase" /><br>
      <b>Supabase</b>
    </td>
  </tr>
  <tr>
    <td align="center" width="200">
      <img src="https://skillicons.dev/icons?i=tailwind" width="48" height="48" alt="Tailwind" /><br>
      <b>Tailwind CSS</b>
    </td>
    <td align="center" width="200">
      <img src="https://d3js.org/logo.svg" width="48" height="48" alt="Recharts" /><br>
      <b>D3.js</b>
    </td>
    <td align="center" width="200">
      <img src="https://lucide.dev/logo.svg" width="48" height="48" alt="Lucide" /><br>
      <b>Lucide Icons</b>
    </td>
    <td align="center" width="200">
      <img src="https://skillicons.dev/icons?i=git" width="48" height="48" alt="Git" /><br>
      <b>Git</b>
    </td>
  </tr>
</table>

## 🚀 快速开始

在本地运行该项目，请遵循以下步骤：

### 1. 克隆仓库

```bash
git clone https://github.com/hyyhf/xushijie.git
cd virtual-horizon
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

在项目根目录创建 `.env.local` 文件，并填入你的 Supabase 配置信息：

```env
VITE_SUPABASE_URL=你的_Supabase_URL
VITE_SUPABASE_ANON_KEY=你的_Supabase_Anon_Key
```

> **注意**: 如果不配置 Supabase，项目将自动以降级 Mock 模式运行，部分功能使用本地模拟数据。

### 4. 启动开发服务器

```bash
npm run dev
```

打开浏览器访问 [http://localhost:5173](http://localhost:5173) 即可看到效果。

## 📂 项目结构

```text
virtual-horizon/
├── src/
│   ├── components/      # 可复用的 UI 组件 (BottomNav 等)
│   ├── lib/             # 第三方库封装 (Supabase, Context)
│   ├── pages/           # 页面级组件 (Screen)
│   │   ├── LoginScreen.tsx       # 登录/注册
│   │   ├── HomeScreen.tsx        # 首页
│   │   ├── MerchantScreen.tsx    # 商家大屏
│   │   ├── AvatarScreen.tsx      # 虚拟形象定制
│   │   └── CommunityScreen.tsx   # 社区动态
│   ├── services/        # 业务逻辑与 API 接口
│   │   ├── authService.ts        # 认证服务
│   │   ├── postService.ts        # 帖子服务
│   │   └── ...
│   ├── App.tsx          # 根组件与路由逻辑
│   └── index.css        # 全局样式与 Tailwind 指令
├── .env.local           # 环境变量 (Git 忽略)
├── package.json         # 项目依赖
└── vite.config.ts       # Vite 配置
```

## 🤝 贡献指南

我们非常欢迎社区的贡献！如果你有好的想法：

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的修改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

---

<div align="center">
  <p>Made with ❤️ by Virtual Horizon Team</p>
</div>
