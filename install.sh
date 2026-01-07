#!/bin/bash

# --- 颜色定义 ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # 重置颜色

echo -e "${GREEN}==============================================${NC}"
echo -e "${GREEN}   SpartanHost 补货监控一键安装脚本           ${NC}"
echo -e "${GREEN}==============================================${NC}"

# 1. 权限检查
if [ "$EUID" -ne 0 ]; then 
  echo -e "${RED}请使用 root 用户或 sudo 运行此脚本！${NC}"
  exit 1
fi

# 2. 系统更新与依赖安装
echo -e "${YELLOW}>>> 正在更新系统并安装基础依赖...${NC}"
apt update && apt install -y curl git wget build-essential

# 3. 安装 Node.js (如果没装)
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}>>> 正在安装 Node.js 18...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
else
    echo -e "${GREEN}✔ Node.js 已安装: $(node -v)${NC}"
fi

# 4. 安装 PM2 进程管理
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}>>> 正在安装 PM2...${NC}"
    npm install -g pm2
fi

# 5. 安装项目依赖
echo -e "${YELLOW}>>> 正在安装监控程序依赖...${NC}"
npm install

# 6. 配置文件初始化
if [ ! -f config.js ]; then
    echo -e "${YELLOW}>>> 正在创建默认 config.js...${NC}"
    cat > config.js <<EOF
module.exports = {
    email: 'your-email@gmail.com',
    password: 'your-app-password',
    smtpHost: 'smtp.gmail.com',
    checkInterval: 60000 // 1分钟检查一次
};
EOF
    echo -e "${RED}请手动编辑 config.js 修改你的邮箱配置！${NC}"
fi

# 7. 启动服务
echo -e "${GREEN}>>> 启动监控服务...${NC}"
pm2 start server.js --name spartan-monitor

# 8. 保存并设置自启
pm2 save
pm2 startup

echo -e "${GREEN}==============================================${NC}"
echo -e "${GREEN}🎉 安装完成！${NC}"
echo -e "查看日志: ${YELLOW}pm2 logs spartan-monitor${NC}"
echo -e "管理页面: ${YELLOW}http://你的服务器IP:3000${NC}"
echo -e "${GREEN}==============================================${NC}"