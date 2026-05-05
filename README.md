\# 🛡️ SpartanHost Monitor (斯巴达补货监控)



基于 Node.js 开发的轻量级 VPS 库存监控工具，专为斯巴达（Spartan Host）设计。具备 Apple 风格的前端展示界面，支持邮件即时通知和多用户订阅。



\## 🌟 核心特性



\* \*\*实时监控\*\*：毫秒级轮询斯巴达补货状态。

\* \*\*美观界面\*\*：采用 Apple 简约审美设计，支持移动端自适应访问。

\* \*\*邮件通知\*\*：支持 Gmail、QQ 邮箱、163 邮箱等 SMTP 提醒，并设有发送冷却保护。

\* \*\*订阅系统\*\*：访客可自行输入邮箱订阅特定型号。

\* \*\*进程守护\*\*：原生支持 PM2，确保服务在 Linux 环境下 7x24 小时在线。



\---



\## 🐧 操作系统支持



本项目基于标准 Node.js 环境开发，支持绝大多数主流 Linux 发行版：



\* \*\*Ubuntu\*\* 20.04 / 22.04 LTS (推荐)

\* \*\*Debian\*\* 11 / 12

\* \*\*CentOS\*\* 7 / 8 / Stream

\* \*\*Arch Linux\*\*



\---



\## 🚀 快速部署指南



\### 1. 环境准备



确保你的服务器已安装 \*\*Node.js (v14+)\*\* 和 \*\*npm\*\*。



```bash

\# 以 Ubuntu 为例安装 Node.js

curl -fsSL \[https://deb.nodesource.com/setup\_18.x](https://deb.nodesource.com/setup\_18.x) | sudo -E bash -

sudo apt-get install -y nodejs

```



\## 2. 克隆项目



```

git clone \[https://github.com/yokopro/spartanhost-monitor.git](https://github.com/yokopro/spartanhost-monitor.git)

cd spartanhost-monitor

```



\### 3. 安装依赖



```

npm install

\# 安装进程守护工具 PM2

npm install -g pm2

```



\### 4. 配置环境变量



```

cp .env.example .env

nano .env

```



\*\*配置参数：\*\*



\* `EMAIL\_USER`: 你的发送邮箱（如 Gmail）。



\* `EMAIL\_PASS`: 邮箱的应用授权码（非登录密码）。



\* `ADMIN\_PASSWORD`: 后台管理页面的访问密码。



\### 5. 启动服务



使用 PM2 启动并设置开机自启：



```

pm2 start server.js --name "spartan-monitor"

pm2 save

pm2 startup

```



\## 🛠️ 常用管理命令



\* \*\*查看运行状态\*\*：`pm2 list`



\* \*\*实时日志追踪\*\*：`pm2 logs spartan-monitor`



\* \*\*平滑重启服务\*\*：`pm2 restart spartan-monitor`



\* \*\*清理日志缓存\*\*：`pm2 flush`



\---



\## 📂 目录结构



\* `/public`: 前端展示页面（Apple Design Style）。



\* `/data`: 存储订阅者信息的 JSON 数据库。



\* `server.js`: Web 服务器及监控核心逻辑。



\* `email-notifier.js`: 邮件通知模块。



\* `config.js`: 核心业务逻辑配置。



\---



\## ⚠️ 注意事项



1\. \*\*端口开放\*\*：请确保 VPS 防火墙或安全组已放行 `3000` 端口。



2\. \*\*Gmail 授权\*\*：使用 Gmail 需开启"两步验证"并使用"应用专用密码"。



3\. \*\*频率限制\*\*：建议监控频率保持在 2 分钟以上，以免触发官网反爬虫机制。



\---



© 2026 Yaoyuan (Xu Yaoyuan). 保留所有权利。

