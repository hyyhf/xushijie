
<div align="center">
  <br />
  <h1>🌌 Virtual Horizon</h1>
  <h3>虚视界 · 穿越次元的购物体验</h3>
  <p>
    <b>下一代 3D 虚拟电商与社交平台</b>
  </p>
  <p>
    基于 React 18 + Vite + Supabase + Three.js 构建
  </p>

  <!-- Badges -->
  <p>
    <a href="https://github.com/hyyhf/xushijie">
      <img src="https://img.shields.io/github/last-commit/hyyhf/xushijie?style=flat-square&color=6366f1&label=Active" alt="Last Commit" />
    </a>
    <img src="https://img.shields.io/badge/Status-Beta-orange?style=flat-square" alt="Status" />
    <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License" />
  </p>

  <br />
</div>

## ✨ 项目亮点

Virtual Horizon 不仅仅是一个电商平台，它是连接虚拟与现实的桥梁。在这里，购物不再是枯燥的浏览列表，而是一场探索未知的旅程。

### 🛒 沉浸式购物体系
- **完整闭环**: 从浏览热销好物、加入购物车、到模拟支付与订单追踪，提供丝滑流畅的购物体验。
- **智能购物车**: 本地化存储加云端同步（Supabase），确保你的心仪好物永不丢失，支持离线操作。
- **订单管理**: 实时查看订单状态（待付款/发货/收货/评价），每一步都清晰可见。

### 💃 3D 虚拟化身 (Avatar)
- **数字替身**: 内置轻量级 3D 引擎，支持查看和互动虚拟形象。
- **个性定制**: (开发中) 捏脸、换装，打造独一无二的元宇宙身份。

### 🌏 互动社区与直播
- **实时直播**: 模拟带货直播间，弹幕互动，商品秒杀，还原真实热闹的购物氛围。
- **动态广场**: 分享好物，点赞评论，建立基于兴趣的社交圈子。

### 🎨 极致 UI/UX 设计
- **Glassmorphism**: 全局采用现代化的玻璃拟态设计，视觉通透，质感高级。
- **微交互**: 细腻的加载动画、点击反馈与转场效果，让每一次操作都令人愉悦。

---

## 🛠 技术栈

<div align="center">
  <br />
  <img src="https://skillicons.dev/icons?i=react,ts,vite,supabase,tailwind,threejs,git,vscode" alt="Tech Stack" />
  <br />
  <br />
</div>

---

## 🚀 快速开始

只需三步，开启你的虚拟视界之旅：

### 1. 克隆项目
```bash
git clone https://github.com/hyyhf/xushijie.git
cd virtual-horizon
```

### 2. 安装依赖
```bash
npm install
```

### 3. 启动星门
```bash
npm run dev
```
访问 `http://localhost:5173`，开始探索！

> **Tips**: 项目内置了完善的 Mock 数据回退机制。即使不配置 Supabase 数据库，你依然可以体验完整的购物、浏览和互动流程（数据将保存在本地）。

---

## 📂 核心架构

```text
src/
├── components/   # 原子组件 (Avatar3DViewer, BottomNav...)
├── pages/        # 页面视图 (ProductDetail, Cart, OrderList...)
├── services/     # 业务逻辑 (cartService, orderService...)
├── lib/          # 基础设施 (Supabase Client, Context)
└── types/        # 类型定义
```

---

<div align="center">
  <p>Made with ❤️ by Virtual Horizon Team</p>
</div>
