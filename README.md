
# 🚀 SpartanHost Stock Monitor (斯巴达补货监控)Beta1.0

![Node.js](https://img.shields.io/badge/Node.js-v20+-green)
![License](https://img.shields.io/badge/License-MIT-blue)
![PM2](https://img.shields.io/badge/Process_Manager-PM2-orange)

一个轻量级的 SpartanHost VPS 补货监控系统。支持网页实时状态显示、邮件自动订阅与补货通知、以及一键 Linux 部署脚本。

---

## 🛠️ 快速安装 (首次部署)

在你的 Linux 服务器（Ubuntu/Debian）上依次执行：

```bash
# 1. 克隆代码到本地
git clone [https://github.com/yokopro/spartanhost-monitor.git](https://github.com/yokopro/spartanhost-monitor.git)
cd spartanhost-monitor

# 2. 赋予脚本执行权限并运行
# 该脚本会自动安装 Node.js 20, PM2 并启动服务
chmod +x install.sh
sudo ./install.sh

```

---

## 📖 日常管理指令手册

### 1. 进程状态与日志 (PM2)

这是维护程序最常用的指令集：

| 指令 | 作用 |
| --- | --- |
| `pm2 status` | **查看概览**：确认监控程序是否正在运行 (online) |
| `pm2 logs spartan-monitor` | **查看日志**：实时观察抓取记录、错误或邮件发送状态 |
| `pm2 restart spartan-monitor` | **重启服务**：修改配置文件后必须重启以生效 |
| `pm2 stop spartan-monitor` | **停止服务**：暂时关闭监控任务 |
| `pm2 save` | **保存状态**：将当前列表保存，确保服务器重启后自动开机 |

### 2. 配置与数据修改

* **修改邮箱或监控频率**：
```bash
nano config.js
# 修改后按 Ctrl+O 保存，Ctrl+X 退出，然后执行 pm2 restart spartan-monitor

```


* **手动查看订阅名单**：
```bash
cat subscribers.json

```



### 3. 域名与 SSL 维护 (Nginx)

* **检查 Nginx 配置文件是否正确**：`nginx -t`
* **重启 Nginx 映射服务**：`systemctl restart nginx`
* **更新 SSL 证书 (Certbot)**：`certbot renew`

---

## ⚙️ 配置文件 `config.js` 详解

```javascript
module.exports = {
    email: 'xxx@gmail.com',         // 你的发件邮箱
    password: 'xxxx xxxx xxxx',     // 邮箱生成的 APP Password (授权码)
    smtpHost: 'smtp.gmail.com',      // SMTP 地址
    checkInterval: 60000,            // 抓取频率 (毫秒)，建议不要低于 30000
    port: 3000                       // Web 访问端口
};

```

---

## ⚠️ 免责声明

本项目仅用于个人学习和 VPS 补货提醒。请勿设置过高的抓取频率以免造成目标服务器负担或导致您的 IP 被封禁。

## 📄 开源协议

[MIT License](https://www.google.com/search?q=LICENSE)

```
