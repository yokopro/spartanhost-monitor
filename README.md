🛡️ SpartanHost Monitor (Universal Edition)!一款专为 Spartan Host 设计的工业级库存监控系统。支持多平台 Linux 自动适配，具备交互式部署流程、自动邮件提醒及 RESTful API 支持。✨ 核心特性全系统适配：一键支持 Ubuntu, Debian, CentOS, AlmaLinux, Rocky, Fedora。交互式部署：安装时动态配置邮箱及密码，无需手动修改代码。多维度提醒：支持 Gmail 等主流 SMTP 服务，内置防骚扰冷却机制。安全加固：管理密码支持自定义设置或动态随机生成，保护 API 接口安全。进程守护：基于 PM2 实现开机自启、崩溃重启及实时日志监控。RESTful API：预留库存数据及订阅者管理接口，方便二次开发。🚀 快速开始1. 克隆项目 (Git 方式)Bashgit clone https://github.com/你的用户名/spartan-monitor.git
cd spartan-monitor
2. 执行一键部署脚本将自动识别系统环境并安装 Node.js 与 PM2。Bash# 修复换行符并赋予权限
sed -i 's/\r$//' deploy.sh && chmod +x deploy.sh

# 运行交互式安装
./deploy.sh
3. 查看管理密码如果在安装时选择了随机生成密码，请运行以下命令查看：Bashpm2 logs spartan-monitor --lines 50
🛠️ 运维管理指令需求指令实时日志pm2 logs spartan-monitor状态面板pm2 status重启应用pm2 restart spartan-monitor停止监控pm2 stop spartan-monitor资源监控pm2 monit彻底卸载pm2 delete spartan-monitor && rm -rf $(pwd)🔗 API 接口文档系统默认运行在 3000 端口。1. 实时库存数据Endpoint: GET /api/stock说明: 返回当前监控的所有产品及其库存状态。2. 查看订阅者清单Endpoint: GET /api/subscribers认证: 需在 Request Header 中添加 password: 你的管理密码。3. 系统健康检查Endpoint: GET /health📂 项目结构Plaintext├── public/                # Web 前端页面 (订阅及展示)
├── server.js              # 后端核心逻辑与 API 服务
├── config.js              # 自动生成的配置文件 (由 deploy.sh 生成)
├── deploy.sh              # 终极全能交互式部署脚本
├── package.json           # 项目依赖清单
└── subscribers.json       # 订阅用户数据存储 (本地 JSON)
⚠️ 注意事项Gmail 用户：请务必开启“两步验证”并使用生成的 16位应用专用密码，而非邮箱登录密码。防火墙：本脚本会自动尝试开放 3000 端口，若无法访问，请检查云服务商的安全组设置。隐私保护：.gitignore 已默认忽略 config.js，请勿手动取消，防止授权码泄露至公共仓库。Would you like me to add a section about setting up a Telegram Bot for notifications in this README as well?