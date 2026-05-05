# 🛡️ Spartan VPS 补货监控系统

基于 Node.js 的轻量化斯巴达 VPS 补货监控程序，支持邮件订阅与 Apple 风格前端展示。

## ✨ 特性
- **实时监控**：自动轮询斯巴达官网库存。
- **邮件通知**：支持 Gmail/QQ/163 等多种 SMTP 服务，支持群发频率控制。
- **Apple 极简风**：响应式前端页面，带毛玻璃效果。
- **安全设计**：支持环境变量配置，保护隐私。

## 🚀 快速开始

### 1. 克隆项目
git clone https://github.com/你的用户名/项目名.git
cd 项目名

### 2. 安装依赖
npm install

### 3. 配置
复制 `config.example.js` 并重命名为 `config.js`，或者创建 `.env` 文件：
cp .env.example .env
# 然后编辑 .env 填写你的邮箱授权码

### 4. 运行
node index.js