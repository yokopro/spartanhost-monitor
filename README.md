🛡️ SpartanHost Monitor (斯巴达补货监控)
基于 Node.js 开发的轻量级 VPS 库存监控工具，专为斯巴达（Spartan Host）设计。具备 Apple 风格的前端展示界面，支持邮件即时通知和多用户订阅。

🌟 核心特性
实时监控：毫秒级轮询斯巴达补货状态。

美观界面：响应式 Apple 简约设计，支持移动端访问。

邮件通知：支持 Gmail、QQ 邮箱、163 邮箱等 SMTP 提醒。

订阅系统：访客可自行输入邮箱订阅特定型号。

进程守护：支持 PM2，确保服务 7x24 小时在线。

🐧 操作系统支持
本项目基于标准 Node.js 环境开发，支持绝大多数主流 Linux 发行版：

Ubuntu 20.04 LTS / 22.04 LTS (推荐)

Debian 10 / 11 / 12

CentOS 7 / 8 / Stream (需要配置防火墙)

Rocky Linux / AlmaLinux

Arch Linux

🚀 部署指南
1. 环境准备
确保你的服务器已安装 Node.js (v14+) 和 npm。

Bash
# 以 Ubuntu 为例
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
2. 克隆项目
Bash
git clone https://github.com/yokopro/spartanhost-monitor.git
cd spartanhost-monitor
3. 安装依赖
Bash
npm install
# 安装进程守护工具
npm install -g pm2
4. 配置环境变量
复制模板并修改你的个人信息：

Bash
cp .env.example .env
nano .env
配置项说明：

EMAIL_USER: 你的发送邮箱（如 Gmail）。

EMAIL_PASS: 邮箱的应用授权码（非登录密码）。

ADMIN_PASSWORD: 后台管理页面的访问密码。

5. 自定义监控列表
编辑 config.js 文件中的 monitor 和 email 部分，根据需要调整轮询频率和 SMTP 服务器。

6. 启动服务
Bash
# 使用 PM2 启动
pm2 start server.js --name "spartan-monitor"

# 设置开机自启
pm2 save
pm2 startup
🛠️ 常用管理命令
查看运行状态：pm2 list

实时监控日志：pm2 logs spartan-monitor

重启服务：pm2 restart spartan-monitor

清理所有日志：pm2 flush

📂 目录结构
/public: 前端展示页面及 CSS 样式。

/data: 存储订阅者信息的 JSON 文件。

server.js: Web 服务器核心逻辑。

email-notifier.js: 邮件发送逻辑。

config.js: 核心监控参数配置。

⚠️ 注意事项
防火墙：请确保 VPS 防火墙（或安全组）放行了 3000 端口。

Gmail 授权：使用 Gmail 发送邮件需在 Google 账号设置中开启“两步验证”并生成“应用专用密码”。

反爬虫：请勿将 intervalMs 设置得过低（建议 > 60000ms），以免触发官网防护。