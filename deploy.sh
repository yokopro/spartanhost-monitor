#!/bin/bash

# ============================================================
# SpartanHost Monitor - 全能交互式部署脚本 (v5.0)
# 特性：自定义管理密码、全系统适配、交互配置、完整指令集
# ============================================================

clear
echo "=========================================="
echo "    SpartanHost Monitor 自动部署工具"
echo "=========================================="

# 1. 交互式收集配置信息
echo "--- 📧 邮件通知配置 ---"
read -p "请输入你的发件邮箱 (例如 xxx@gmail.com): " USER_EMAIL
read -p "请输入邮箱授权码 (Gmail 16位专用密码): " USER_PASS
read -p "请输入代理地址 (回车跳过, 示例 http://127.0.0.1:10808): " PROXY_URL
echo ""
echo "--- 🔑 管理员安全配置 ---"
read -p "请设置你的后台管理密码 (直接回车将随机生成): " USER_ADMIN_PASS
echo "------------------------------------------"

# 2. 系统环境识别
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
elif [ -f /etc/debian_version ]; then
    OS="debian"
else
    OS=$(uname -s)
fi

echo "[*] 检测到系统类型: $OS"

# 3. 自动生成配置文件
echo "[*] 正在生成 config.js..."
cat <<EOF > config.js
const crypto = require('crypto');

// 如果用户没输入，则生成随机密码
const finalPassword = '$USER_ADMIN_PASS' || crypto.randomBytes(6).toString('hex');

console.log('\n' + '='.repeat(40));
console.log('🛡️  斯巴达监控 - 系统启动');
console.log('🔑 管理密码: ' + finalPassword);
console.log('='.repeat(40) + '\n');

module.exports = {
    email: {
        enabled: true,
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: '$USER_EMAIL',
            pass: '$USER_PASS'
        },
        from: '$USER_EMAIL',
        to: [],
        subject: '🛡️ 斯巴达VPS补货提醒',
        proxy: '${PROXY_URL:-""}'
    },
    notification: {
        cooldownMinutes: 60,
    },
    admin: {
        password: finalPassword
    }
};
EOF

# 4. 根据系统安装 Node.js 和基础工具
case "$OS" in
    ubuntu|debian|raspbian)
        apt update -y && apt install -y curl git wget build-essential
        curl -fsSL https://deb.nodesource.com/setup_24.x | bash -
        apt install -y nodejs
        ;;
    centos|rhel|almalinux|rocky)
        yum update -y && yum install -y curl git wget gcc-c++ make
        curl -sL https://rpm.nodesource.com/setup_24.x | bash -
        yum install -y nodejs
        ;;
    fedora)
        dnf install -y curl git wget
        curl -sL https://rpm.nodesource.com/setup_24.x | bash -
        dnf install -y nodejs
        ;;
    *)
        echo "错误: 暂不支持的操作系统: $OS"
        exit 1
        ;;
esac

# 5. 安装 PM2
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi

# 6. 安装项目依赖
npm install --production

# 7. 启动程序
pm2 delete spartan-monitor 2>/dev/null
pm2 start server.js --name "spartan-monitor"

# 8. 设置开机自启
pm2 save

# 9. 开放防火墙端口
if command -v ufw >/dev/null 2>&1; then
    ufw allow 3000/tcp
    ufw reload
elif command -v firewall-cmd >/dev/null 2>&1; then
    firewall-cmd --permanent --add-port=3000/tcp
    firewall-cmd --reload
fi

# 10. 部署总结与操作指南
IP_ADDR=$(curl -s ifconfig.me)
echo ""
echo "=========================================================="
echo "✅ 部署大功告成！"
echo "=========================================================="
echo "🌐 访问地址: http://$IP_ADDR:3000"
echo "🔑 管理密码: ${USER_ADMIN_PASS:-[已随机生成，请查阅日志]}"
echo "----------------------------------------------------------"
echo "🛠️  应用管理常用命令:"
echo "  ▶️  启动监控:  pm2 start spartan-monitor"
echo "  ⏹️  停止监控:  pm2 stop spartan-monitor"
echo "  🔄  重启应用:  pm2 restart spartan-monitor"
echo "  🗑️  彻底卸载:  pm2 delete spartan-monitor && rm -rf $(pwd)"
echo "----------------------------------------------------------"
echo "🔗 详细 API 接口说明:"
echo "  1. 获取实时库存: GET http://$IP_ADDR:3000/api/stock"
echo "  2. 查看订阅者清单: GET http://$IP_ADDR:3000/api/subscribers"
echo "     (需在 Header 携带: password: 你的密码)"
echo "  3. 系统健康检查: GET http://$IP_ADDR:3000/health"
echo "=========================================================="