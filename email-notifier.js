// email-notifier.js - 邮件通知模块
const nodemailer = require('nodemailer');
const config = require('./config');
const fs = require('fs');

// 记录已通知的产品
const notifiedProducts = new Map();

// 创建邮件发送器
let emailTransporter = null;
if (config.email.enabled) {
    const transportConfig = {
        auth: config.email.auth
    };
    
    if (config.email.service) {
        transportConfig.service = config.email.service;
    } else {
        transportConfig.host = config.email.host;
        transportConfig.port = config.email.port;
        transportConfig.secure = config.email.secure;
    }
    
    emailTransporter = nodemailer.createTransport(transportConfig);
}

// 检查是否在冷却期内
function isInCooldown(productId) {
    if (!notifiedProducts.has(productId)) {
        return false;
    }
    
    const lastNotifyTime = notifiedProducts.get(productId);
    const cooldownMs = config.notification.cooldownMinutes * 60 * 1000;
    return (Date.now() - lastNotifyTime) < cooldownMs;
}

// 记录通知时间
function recordNotification(productId) {
    notifiedProducts.set(productId, Date.now());
}

// 获取状态文本
function getStatusText(status) {
    switch(status) {
        case 'in_stock': return '✅ 有货';
        case 'out_of_stock': return '❌ 缺货';
        case 'checking': return '🔄 检查中';
        case 'unknown': return '❓ 未知';
        case 'error': return '⚠️ 错误';
        case null: return '⚪ 首次检查';
        default: return '❓ 未知';
    }
}

// 发送邮件通知
async function sendEmail(product, previousStatus = null) {
    if (!config.email.enabled || !emailTransporter) {
        return { success: false, reason: '邮件通知未启用' };
    }
    
    try {
        // 从订阅列表读取收件人
        let recipients = [];
        try {
            if (fs.existsSync('subscribers.json')) {
                const data = fs.readFileSync('subscribers.json', 'utf8');
                const subscribers = JSON.parse(data);
                recipients = subscribers
                    .filter(s => s.active)
                    .map(s => s.email);
            }
        } catch (error) {
            recipients = config.email.to;
        }
        
        if (recipients.length === 0) {
            return { success: false, reason: '没有活跃的订阅者' };
        }
        
        // 构建状态变更信息
        let statusChangeText = '';
        if (previousStatus) {
            statusChangeText = `<p><strong>状态变更：</strong>${getStatusText(previousStatus)} → ${getStatusText(product.status)}</p>`;
        } else {
            statusChangeText = `<p><strong>首次检测到补货！</strong></p>`;
        }
        
        // HTML 邮件内容
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif; background: #f5f5f7; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #0071e3 0%, #0077ed 100%); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
        .content { padding: 40px 30px; }
        .alert { background: linear-gradient(135deg, #d1f4e0 0%, #b8f0d0 100%); border-left: 4px solid #007a3d; padding: 25px; border-radius: 8px; margin-bottom: 30px; }
        .alert h2 { margin: 0 0 10px 0; color: #007a3d; font-size: 24px; font-weight: 600; }
        .alert p { margin: 0; color: #005a2d; font-size: 16px; }
        .product-info { background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 20px 0; }
        .product-info p { margin: 12px 0; color: #1d1d1f; font-size: 15px; line-height: 1.6; }
        .product-info strong { color: #000; font-weight: 600; }
        .status-badge { display: inline-block; padding: 10px 20px; border-radius: 20px; font-weight: 600; font-size: 15px; margin: 15px 0; background: #d1f4e0; color: #007a3d; }
        .btn { display: inline-block; background: #0071e3; color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; margin-top: 20px; font-weight: 600; font-size: 17px; }
        .warning { background: #fff4e5; border-left: 4px solid #f56300; padding: 15px; border-radius: 8px; margin-top: 20px; color: #c45500; font-size: 14px; }
        .footer { text-align: center; padding: 30px; color: #86868b; font-size: 13px; border-top: 1px solid #d2d2d7; }
        .footer p { margin: 5px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🛡️ 斯巴达VPS补货提醒</h1>
        </div>
        <div class="content">
            <div class="alert">
                <h2>🎉 产品已补货！</h2>
                <p>您关注的产品现在有货了，赶快下单吧！</p>
            </div>
            <div class="product-info">
                <p><strong>产品名称：</strong>${product.name}</p>
                <p><strong>产品ID：</strong>${product.id}</p>
                <p><strong>产品分类：</strong>${product.category}</p>
                ${statusChangeText}
                <div class="status-badge">${getStatusText(product.status)}</div>
            </div>
            <p style="color: #6e6e73; font-size: 14px;">
                <strong>检查时间：</strong>${new Date(product.lastCheck).toLocaleString('zh-CN')}
            </p>
            <center>
                <a href="${product.url}" class="btn">立即购买 →</a>
            </center>
            <div class="warning">
                ⚠️ <strong>温馨提示：</strong>库存有限，建议尽快下单。此邮件仅在补货时发送一次。
            </div>
        </div>
        <div class="footer">
            <p>此邮件由斯巴达VPS补货监控系统自动发送</p>
            <p>${new Date().toLocaleString('zh-CN')}</p>
        </div>
    </div>
</body>
</html>
        `;
        
        const mailOptions = {
            from: `"斯巴达VPS监控" <${config.email.from}>`,
            to: recipients.join(', '),
            subject: `${config.email.subject} - ${product.name} 已补货！`,
            html: htmlContent
        };
        
        await emailTransporter.sendMail(mailOptions);
        console.log(`  📧 邮件通知已发送: ${product.name}`);
        console.log(`     收件人: ${recipients.join(', ')}`);
        
        return { 
            success: true,
            recipients: recipients.length,
            sentAt: new Date().toISOString()
        };
        
    } catch (error) {
        console.error(`  ❌ 邮件发送失败:`, error.message);
        return { 
            success: false, 
            error: error.message 
        };
    }
}

// 主通知函数
async function notify(product, previousStatus = null) {
    // 只在状态为"有货"时才考虑通知
    if (product.status !== 'in_stock') {
        return { skipped: true, reason: '当前状态不是有货，不通知' };
    }
    
    // 如果之前已经是有货状态，不重复通知
    if (previousStatus === 'in_stock') {
        return { skipped: true, reason: '之前已经有货，不重复通知' };
    }
    
    // 检查冷却时间
    if (isInCooldown(product.id)) {
        const lastTime = notifiedProducts.get(product.id);
        const elapsed = Math.floor((Date.now() - lastTime) / 60000);
        const remaining = config.notification.cooldownMinutes - elapsed;
        return { 
            skipped: true, 
            reason: `冷却中，剩余 ${remaining} 分钟` 
        };
    }
    
    console.log(`\n📢 ========== 补货提醒 ==========`);
    console.log(`   产品: ${product.name}`);
    console.log(`   状态变化: ${getStatusText(previousStatus)} → ${getStatusText(product.status)}`);
    console.log(`================================\n`);
    
    const result = await sendEmail(product, previousStatus);
    
    if (result.success) {
        recordNotification(product.id);
        console.log(`  ✅ 通知发送成功`);
    }
    
    return {
        notified: result.success,
        product: product.name,
        status: product.status,
        previousStatus: previousStatus,
        email: result
    };
}

// 测试邮件
async function testEmail() {
    const testProduct = {
        id: 999,
        name: '测试产品 - Premium Minecraft Plan',
        category: '测试分类',
        status: 'in_stock',
        url: 'https://billing.spartanhost.net/cart.php?a=add&pid=427',
        lastCheck: new Date().toISOString()
    };
    
    console.log('\n🧪 测试邮件通知...\n');
    const result = await sendEmail(testProduct, 'out_of_stock');
    console.log('\n测试结果:', JSON.stringify(result, null, 2));
    return result;
}

function getNotificationStats() {
    const stats = {
        totalNotified: notifiedProducts.size,
        products: []
    };
    
    notifiedProducts.forEach((timestamp, productId) => {
        stats.products.push({
            productId: productId,
            lastNotified: new Date(timestamp).toLocaleString('zh-CN'),
            minutesAgo: Math.floor((Date.now() - timestamp) / 60000)
        });
    });
    
    return stats;
}

function clearNotificationRecord(productId) {
    if (notifiedProducts.has(productId)) {
        notifiedProducts.delete(productId);
        return { success: true, message: `产品 ${productId} 的通知记录已清除` };
    }
    return { success: false, message: `产品 ${productId} 没有通知记录` };
}

module.exports = {
    notify,
    testEmail,
    getNotificationStats,
    clearNotificationRecord
};