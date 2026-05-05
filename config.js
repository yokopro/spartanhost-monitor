/**
 * 斯巴达VPS补货监控 - 核心配置文件
 * 建议：敏感信息（密码、授权码）优先通过环境变量设置
 */

require('dotenv').config(); // 自动加载项目根目录下的 .env 文件

module.exports = {
    // ==================== 邮件通知配置 ====================
    email: {
        enabled: true,  // 是否启用邮件通知
        
        // SMTP 服务器设置
        // Gmail 建议: host: 'smtp.gmail.com', port: 587, secure: false
        // QQ/163 建议: host: 'smtp.qq.com', port: 465, secure: true
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true', // true 为 SSL (465端口), false 为 STARTTLS
        
        // 认证信息
        auth: {
            user: process.env.EMAIL_USER || '你的邮箱@gmail.com', 
            pass: process.env.EMAIL_PASS || '你的16位授权码' 
        },
        
        // 发件人显示名称和主题
        from: `"🛡️ 斯巴达监控助手" <${process.env.EMAIL_USER || '你的邮箱@gmail.com'}>`,
        subject: '🛡️ 斯巴达VPS补货提醒',
        
        // ==================== 性能与反垃圾邮件设置 ====================
        // 使用连接池避免频繁建立 SMTP 连接
        pool: true,
        maxConnections: 3,      // 最大同时连接数
        rateLimit: 2,           // 每秒最多发送封数（防止被 Gmail 判定为滥用）
        
        // ==================== 代理设置 ====================
        // 如果服务器在中国大陆且访问 Gmail 失败，请配置此处
        // 格式: 'http://127.0.0.1:7890' 或 null
        proxy: process.env.EMAIL_PROXY || null, 
    },
    
    // ==================== 监控逻辑设置 ====================
    monitor: {
        intervalMs: 120000,      // 监控频率：默认 120000 毫秒 (2分钟)
        timeout: 15000,          // 网页请求超时时间 (15秒)
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },

    // ==================== 通知规则 ====================
    notification: {
        // 同一产品在补货状态下，发送通知的冷却时间
        // 防止产品频繁切换状态导致“邮件轰炸”
        cooldownMinutes: 60,  
        retryLimit: 3,         // 发送失败重试次数
        retryDelayMs: 5000,    // 重试延迟时间
    },
    
    // ==================== 管理员与安全 ====================
    admin: {
        // 用于访问 /admin 或订阅管理页面的强密码
        password: process.env.ADMIN_PASSWORD || 'Admin@2026!Secure',
        jwtSecret: process.env.JWT_SECRET || 'spartan-monitor-secret-key' // 用于身份验证的密钥
    },

    // ==================== 数据持久化 ====================
    database: {
        type: 'json',          // 目前使用本地 JSON 文件存储
        path: './data/subscribers.json'
    }
};