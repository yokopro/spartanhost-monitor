# 🛡️ SpartanHost Monitor (Universal Edition)

一款专为 **Spartan Host** 设计的工业级库存监控系统，支持多平台 **Linux** 自动适配。提供交互式部署流程、自动邮件提醒及 RESTful API 支持，能够轻松完成库存监控应用的搭建。

---

<p align="center">
  <img src="https://img.shields.io/github/license/yokopro/spartanhost-monitor?style=flat-square&color=blue" alt="License">
  <img src="https://img.shields.io/github/issues/yokopro/spartanhost-monitor?style=flat-square&color=orange" alt="Issues">
  <img src="https://img.shields.io/github/stars/yokopro/spartanhost-monitor?style=flat-square&color=yellow" alt="Stars">
  <img src="https://img.shields.io/badge/Node.js-%E2%89%A524-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Lint%20Code-passing-brightgreen?style=flat-square&logo=github" alt="Lint">
  <img src="https://img.shields.io/badge/Architecture-100%25-blueviolet?style=flat-square" alt="Architecture">
  <img src="https://img.shields.io/badge/Style-Standard-orange?style=flat-square" alt="Style">
  <img src="https://img.shields.io/badge/Security-Advanced-green?style=flat-square" alt="Security">
</p>

---

### 🚀 技术栈支持

<p align="left">
  <img src="https://img.shields.io/badge/-Linux-FCC624?style=for-the-badge&logo=linux&logoColor=black" />
  <img src="https://img.shields.io/badge/-Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/-PM2-2B037A?style=for-the-badge&logo=pm2&logoColor=white" />
  <img src="https://img.shields.io/badge/-Express-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/-JSON_DB-4479A1?style=for-the-badge&logo=json&logoColor=white" />
</p>

---

## ✨ 核心特性

- [x] **全系统适配**：一键支持 Ubuntu, Debian, CentOS, AlmaLinux, Rocky, Fedora。
- [x] **交互式部署**：安装时动态配置邮箱及密码，实现零代码基础配置。
- [x] **智能提醒**：支持 Gmail 等 SMTP 服务，内置防骚扰冷却机制。
- [x] **安全加固**：管理密码支持自定义或强随机生成，接口受鉴权保护。
- [x] **进程守护**：基于 PM2 实现开机自启、崩溃重启及实时日志监控。
- [x] **RESTful API**：预留库存数据及订阅者管理接口，方便二次开发。

---

## 🚀 快速开始

### 1️⃣ 克隆项目 (Git 方式)

```bash
git clone https://github.com/yokopro/spartanhost-monitor.git
cd spartanhost-monitor
```

### 2️⃣ 执行一键部署脚本

将自动识别系统环境并安装 **Node.js** 与 **PM2**。

```bash
# 修复换行符并赋予权限
sed -i 's/\r$//' deploy.sh && chmod +x deploy.sh

# 运行交互式安装
./deploy.sh
```

### 3️⃣ 查看管理密码

如果在安装时选择了随机生成密码，请运行以下命令查看密码：

```bash
pm2 logs spartan-monitor --lines 50
```

---

## 🛠️ 运维管理指令

| **需求**       | **指令**                                             |
|----------------|------------------------------------------------------|
| 实时日志       | `pm2 logs spartan-monitor`                           |
| 状态面板       | `pm2 status`                                         |
| 重启应用       | `pm2 restart spartan-monitor`                        |
| 停止监控       | `pm2 stop spartan-monitor`                           |
| 资源监控       | `pm2 monit`                                          |
| 彻底卸载       | `pm2 delete spartan-monitor && rm -rf $(pwd)`        |

---

## 🔗 API 接口文档

系统默认运行在 **3000** 端口。

### 1️⃣ 实时库存数据

- **Endpoint**: `GET /api/stock`
- **说明**: 返回当前监控的所有产品及其库存状态。

### 2️⃣ 查看订阅者清单

- **Endpoint**: `GET /api/subscribers`
- **认证**: 需在 `Request Header` 中添加：
  ```plaintext
  password: 你的管理密码
  ```

### 3️⃣ 系统健康检查

- **Endpoint**: `GET /health`

---

## 📂 项目结构

```plaintext
├── public/                # Web 前端页面 (订阅及展示)
├── server.js              # 后端核心逻辑与 API 服务
├── config.js              # 自动生成的配置文件 (由 deploy.sh 生成)
├── deploy.sh              # 终极全能交互式部署脚本
├── package.json           # 项目依赖清单
└── subscribers.json       # 订阅用户数据存储 (本地 JSON)
```

---

## ⚠️ 注意事项

1. **Gmail 用户**：
   - 请务必开启“两步验证”并使用 **16 位应用专用密码**，而非邮箱登录密码。

2. **防火墙设置**：
   - 本脚本会自动尝试开放 **3000 端口**，若无法访问，请检查云服务商的安全组设置。

3. **隐私保护**：
   - `.gitignore` 已默认忽略 `config.js`，请勿手动取消，防止授权码泄露至公共仓库。

### 联系我
📧邮件：mail.yaoyuan(@)gmail.com
如果还有其他需求或特色添加，请随时告诉我！ 😊
