// server.js - 主服务器文件
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
const https = require('https');
const fs = require('fs');
const emailNotifier = require('./email-notifier');

const app = express();
const PORT = process.env.PORT || 3000;

// ⚠️ 在这里配置你的产品（需要修改）
const PRODUCTS = [ 
    // 顶级优化9929 分类
    { id: 426, name: '4C-4G-100GB', category: 'AS9929-CMIN2 Premium KVM VPS - Seattle' }, 
    { id: 427, name: '4C-6G-150GB', category: 'AS9929-CMIN2 Premium KVM VPS - Seattle' }, 
    { id: 428, name: '5C-8G-200GB', category: 'AS9929-CMIN2 Premium KVM VPS - Seattle' }, 
    { id: 429, name: '5C-10G-250GB', category: 'AS9929-CMIN2 Premium KVM VPS - Seattle' },
	{ id: 430, name: '6C-16G-400GB', category: 'AS9929-CMIN2 Premium KVM VPS - Seattle' },
	{ id: 431, name: '6C-20G-500GB', category: 'AS9929-CMIN2 Premium KVM VPS - Seattle' },
	{ id: 432, name: '7C-24.5G-600GB', category: 'AS9929-CMIN2 Premium KVM VPS - Seattle' },
	{ id: 433, name: '8C-32.7G-800GB', category: 'AS9929-CMIN2 Premium KVM VPS - Seattle' },
    
    // 普通优化4837 分类
    { id: 372, name: '4C-4G-100GB', category: 'China Optimised Premium KVM VPS - Seattle' }, 
    { id: 374, name: '4C-6G-150GB', category: 'China Optimised Premium KVM VPS - Seattle' }, 
    { id: 375, name: '5C-8G-200GB', category: 'China Optimised Premium KVM VPS - Seattle' }, 
    { id: 376, name: '5C-10G-250GB', category: 'China Optimised Premium KVM VPS - Seattle' },
	{ id: 377, name: '6C-16G-400GB', category: 'China Optimised Premium KVM VPS - Seattle' },
	{ id: 391, name: '6C-20G-500GB', category: 'China Optimised Premium KVM VPS - Seattle' },
	{ id: 392, name: '7C-24.5G-700GB', category: 'China Optimised Premium KVM VPS - Seattle' },
	{ id: 393, name: '8C-32.7G-800GB', category: 'China Optimised Premium KVM VPS - Seattle' },
    
    // 普通优化4837 分类
    { id: 341, name: '4C-4G-60GB', category: 'DDoS Protected SSD E5 KVM VPS - Seattle' }, 
    { id: 342, name: '4C-6G-90GB', category: 'DDoS Protected SSD E5 KVM VPS - Seattle' }, 
	{ id: 343, name: '5C-8G-120GB', category: 'DDoS Protected SSD E5 KVM VPS - Seattle' }, 
	{ id: 345, name: '5C-10G-150GB', category: 'DDoS Protected SSD E5 KVM VPS - Seattle' }, 
	{ id: 344, name: '6C-16G-240GB', category: 'DDoS Protected SSD E5 KVM VPS - Seattle' },
	{ id: 346, name: '7C-20G-300GB', category: 'DDoS Protected SSD E5 KVM VPS - Seattle' },
	{ id: 347, name: '8C-23.5G-450GB', category: 'DDoS Protected SSD E5 KVM VPS - Seattle' },
];

let productsStatus = [];
let lastCheckTime = null;
let isChecking = false;

// 邮件订阅管理
let subscribers = [];

function loadSubscribers() {
    try {
        if (fs.existsSync('subscribers.json')) {
            const data = fs.readFileSync('subscribers.json', 'utf8');
            subscribers = JSON.parse(data);
            console.log(`📧 已加载 ${subscribers.length} 个订阅者`);
        }
    } catch (error) {
        console.error('加载订阅者失败:', error.message);
        subscribers = [];
    }
}

function saveSubscribers() {
    try {
        fs.writeFileSync('subscribers.json', JSON.stringify(subscribers, null, 2));
        return true;
    } catch (error) {
        console.error('保存订阅者失败:', error.message);
        return false;
    }
}

loadSubscribers();

// 创建 axios 实例
const axiosInstance = axios.create({
    timeout: 60000,
    httpsAgent: new https.Agent({ 
        rejectUnauthorized: false,
        keepAlive: true,
    }),
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
    },
    maxRedirects: 5,
    validateStatus: status => status >= 200 && status < 500,
});

// 检查单个产品
async function checkProductStock(productId) {
    const url = `https://billing.spartanhost.net/aff.php?aff=2704&pid=${productId}`;
    console.log(`正在检查产品 ${productId}...`);
    
    try {
        const startTime = Date.now();
        const response = await axiosInstance.get(url);
        const duration = Date.now() - startTime;
        
        console.log(`  ✓ 请求成功 (耗时: ${duration}ms)`);
        
        const $ = cheerio.load(response.data);
        const bodyText = $('body').text().toLowerCase();
        const pageTitle = $('title').text();
        
        console.log(`  页面标题: ${pageTitle}`);
        
        const outOfStockPatterns = [
            /product.*out of stock/i,
            /item.*out of stock/i,
            /currently out of stock/i,
            /sold out/i,
            /product.*unavailable/i,
            /item.*unavailable/i,
            /stock.*unavailable/i,
        ];
        
        let hasOutOfStock = false;
        
        for (const pattern of outOfStockPatterns) {
            const match = bodyText.match(pattern);
            if (match) {
                console.log(`    ✗ 发现缺货标识: "${match[0]}"`);
                hasOutOfStock = true;
                break;
            }
        }
        
        const dangerAlerts = $('.alert-danger, .alert-error').map((i, el) => $(el).text().toLowerCase()).get();
        for (const alert of dangerAlerts) {
            if ((alert.includes('stock') || alert.includes('sold out') || 
                (alert.includes('unavailable') && !alert.includes('description') && !alert.includes('tagline')))) {
                console.log(`    ✗ 警告框提示缺货`);
                hasOutOfStock = true;
                break;
            }
        }
        
        if (!hasOutOfStock) {
            console.log(`    ✓ 未发现缺货标识`);
        }
        
        if (hasOutOfStock) {
            console.log(`  结果: ❌ 缺货`);
            return 'out_of_stock';
        }
        
        const isCartPage = pageTitle.toLowerCase().includes('cart');
        const hasOrderButton = bodyText.includes('order now');
        const hasContinue = bodyText.includes('continue');
        
        if (isCartPage || hasOrderButton || hasContinue) {
            console.log(`  结果: ✅ 有货`);
            return 'in_stock';
        }
        
        console.log(`  结果: ✅ 有货（默认）`);
        return 'in_stock';
        
    } catch (error) {
        console.error(`  ✗ 错误: ${error.message}`);
        return 'error';
    }
}

// 检查所有产品
async function checkAllProducts() {
    if (isChecking) {
        console.log('⚠️  检查任务进行中，跳过本次检查');
        return;
    }
    
    isChecking = true;
    console.log('\n========================================');
    console.log('🔍 开始检查所有产品');
    console.log('⏰ 时间:', new Date().toLocaleString('zh-CN'));
    console.log('========================================');
    
    const results = [];
    
    for (let i = 0; i < PRODUCTS.length; i++) {
        const product = PRODUCTS[i];
        console.log(`\n[${i + 1}/${PRODUCTS.length}] ${product.name}`);
        
        const previousProduct = productsStatus.find(p => p.id === product.id);
        const previousStatus = previousProduct ? previousProduct.status : null;
        
        const status = await checkProductStock(product.id);
        const newProduct = {
            id: product.id,
            name: product.name,
            category: product.category,
            status: status,
            url: `https://billing.spartanhost.net/aff.php?aff=2704&pid=${product.id}`,
            lastCheck: new Date().toISOString()
        };
        
        results.push(newProduct);
        
        // 发送邮件通知
        try {
            const notifyResult = await emailNotifier.notify(newProduct, previousStatus);
            if (notifyResult.skipped) {
                console.log(`  ⏭️  跳过通知: ${notifyResult.reason}`);
            }
        } catch (error) {
            console.error(`  ❌ 通知失败:`, error.message);
        }
        
        if (i < PRODUCTS.length - 1) {
            console.log('  ⏳ 等待 3 秒...');
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
    }
    
    productsStatus = results;
    lastCheckTime = new Date();
    
    const inStockCount = results.filter(r => r.status === 'in_stock').length;
    const outOfStockCount = results.filter(r => r.status === 'out_of_stock').length;
    const errorCount = results.filter(r => r.status === 'error').length;
    
    console.log('\n========================================');
    console.log('✅ 检查完成！');
    console.log('========================================');
    console.log(`📊 统计: 有货 ${inStockCount} | 缺货 ${outOfStockCount} | 错误 ${errorCount}`);
    console.log('----------------------------------------');
    
    results.forEach(r => {
        const emoji = r.status === 'in_stock' ? '✅' : 
                     r.status === 'out_of_stock' ? '❌' : '⚠️';
        console.log(`${emoji} ${r.name}: ${r.status}`);
    });
    console.log('========================================\n');
    
    isChecking = false;
}

// 中间件
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// 密码验证中间件
function requireAuth(req, res, next) {
    const password = req.headers['x-admin-password'] || req.query.password;
    const config = require('./config');
    
    if (password === config.admin.password) {
        next();
    } else {
        res.status(401).json({
            success: false,
            message: '需要管理员密码'
        });
    }
}

// ==================== API 路由 ====================

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/status', (req, res) => {
    res.json({
        products: productsStatus,
        lastCheck: lastCheckTime,
        nextCheck: lastCheckTime ? new Date(lastCheckTime.getTime() + 2 * 60 * 1000) : null,
        isChecking: isChecking,
        totalProducts: PRODUCTS.length
    });
});

app.get('/api/check', async (req, res) => {
    if (isChecking) {
        return res.json({ success: false, message: '检查任务进行中，请稍后再试' });
    }
    checkAllProducts().catch(console.error);
    res.json({ success: true, message: '检查任务已启动' });
});

app.get('/api/products', (req, res) => {
    res.json({
        success: true,
        products: PRODUCTS,
        total: PRODUCTS.length,
        categories: [...new Set(PRODUCTS.map(p => p.category))]
    });
});

app.get('/api/stats', (req, res) => {
    const stats = {
        total: productsStatus.length,
        inStock: productsStatus.filter(p => p.status === 'in_stock').length,
        outOfStock: productsStatus.filter(p => p.status === 'out_of_stock').length,
        error: productsStatus.filter(p => p.status === 'error').length,
        lastCheck: lastCheckTime,
        isChecking: isChecking,
        categories: {}
    };
    
    const categories = [...new Set(PRODUCTS.map(p => p.category))];
    categories.forEach(category => {
        const categoryProducts = productsStatus.filter(p => p.category === category);
        stats.categories[category] = {
            total: categoryProducts.length,
            inStock: categoryProducts.filter(p => p.status === 'in_stock').length,
            outOfStock: categoryProducts.filter(p => p.status === 'out_of_stock').length,
        };
    });
    
    res.json(stats);
});

app.get('/api/test-email', async (req, res) => {
    try {
        const result = await emailNotifier.testEmail();
        res.json({
            success: true,
            message: '测试邮件已发送，请检查收件箱',
            result: result
        });
    } catch (error) {
        res.json({
            success: false,
            error: error.message
        });
    }
});

app.get('/api/notification-stats', (req, res) => {
    const stats = emailNotifier.getNotificationStats();
    res.json({
        success: true,
        stats: stats,
        config: {
            cooldownMinutes: require('./config').notification.cooldownMinutes
        }
    });
});

// ==================== 邮件订阅 API ====================

// 获取订阅者列表（需要密码）
app.get('/api/subscribers', requireAuth, (req, res) => {
    res.json({
        success: true,
        subscribers: subscribers,
        total: subscribers.length
    });
});

// 添加订阅者（不需要密码 - 游客可以订阅）
app.post('/api/subscribe', (req, res) => {
    const { email, name } = req.body;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        return res.json({
            success: false,
            message: '请输入有效的邮箱地址'
        });
    }
    
    if (subscribers.some(s => s.email === email)) {
        return res.json({
            success: false,
            message: '该邮箱已订阅'
        });
    }
    
    const subscriber = {
        id: Date.now(),
        email: email,
        name: name || email.split('@')[0],
        subscribedAt: new Date().toISOString(),
        active: true
    };
    
    subscribers.push(subscriber);
    saveSubscribers();
    
    console.log(`📧 新增订阅者: ${email}`);
    
    res.json({
        success: true,
        message: '订阅成功',
        subscriber: subscriber
    });
});

// 删除订阅者（需要密码）
app.delete('/api/subscribe/:id', requireAuth, (req, res) => {
    const id = parseInt(req.params.id);
    const index = subscribers.findIndex(s => s.id === id);
    
    if (index === -1) {
        return res.json({
            success: false,
            message: '订阅者不存在'
        });
    }
    
    const removed = subscribers.splice(index, 1)[0];
    saveSubscribers();
    
    console.log(`📧 删除订阅者: ${removed.email}`);
    
    res.json({
        success: true,
        message: '取消订阅成功',
        removed: removed
    });
});

// 更新订阅者（需要密码）
app.put('/api/subscribe/:id', requireAuth, (req, res) => {
    const id = parseInt(req.params.id);
    const { email, name, active } = req.body;
    const subscriber = subscribers.find(s => s.id === id);
    
    if (!subscriber) {
        return res.json({
            success: false,
            message: '订阅者不存在'
        });
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
        return res.json({
            success: false,
            message: '请输入有效的邮箱地址'
        });
    }
    
    if (email) subscriber.email = email;
    if (name) subscriber.name = name;
    if (active !== undefined) subscriber.active = active;
    subscriber.updatedAt = new Date().toISOString();
    
    saveSubscribers();
    
    console.log(`📧 更新订阅者: ${subscriber.email}`);
    
    res.json({
        success: true,
        message: '更新成功',
        subscriber: subscriber
    });
});

// 批量导入（不需要密码 - 方便批量添加）
app.post('/api/subscribers/import', (req, res) => {
    const { emails } = req.body;
    
    if (!Array.isArray(emails) || emails.length === 0) {
        return res.json({
            success: false,
            message: '请提供邮箱列表'
        });
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const added = [];
    const skipped = [];
    
    emails.forEach(email => {
        email = email.trim();
        
        if (!emailRegex.test(email)) {
            skipped.push({ email, reason: '格式无效' });
            return;
        }
        
        if (subscribers.some(s => s.email === email)) {
            skipped.push({ email, reason: '已存在' });
            return;
        }
        
        const subscriber = {
            id: Date.now() + Math.random(),
            email: email,
            name: email.split('@')[0],
            subscribedAt: new Date().toISOString(),
            active: true
        };
        
        subscribers.push(subscriber);
        added.push(subscriber);
    });
    
    saveSubscribers();
    
    console.log(`📧 批量导入: 成功 ${added.length} 个，跳过 ${skipped.length} 个`);
    
    res.json({
        success: true,
        message: `成功添加 ${added.length} 个订阅者`,
        added: added,
        skipped: skipped
    });
});

// ==================== 启动服务器 ====================

app.listen(PORT, async () => {
    console.log('\n========================================');
    console.log('🛡️  斯巴达VPS补货监控系统');
    console.log('========================================');
    console.log(`🌐 访问地址: http://localhost:${PORT}`);
    console.log(`📦 监控产品数: ${PRODUCTS.length}`);
    console.log(`⏰ 检查间隔: 2分钟`);
    console.log(`⏱️  超时时间: 60秒`);
    console.log('========================================');
    console.log('\n📚 可用页面:');
    console.log(`  http://localhost:${PORT}/              - 监控主页`);
    console.log(`  http://localhost:${PORT}/subscribe.html - 邮件订阅管理`);
    console.log('\n📚 可用 API:');
    console.log(`  GET  /api/status           - 获取产品状态`);
    console.log(`  GET  /api/check            - 手动触发检查`);
    console.log(`  GET  /api/stats            - 获取统计信息`);
    console.log(`  GET  /api/test-email       - 测试邮件通知`);
    console.log(`  GET  /api/subscribers      - 获取订阅者列表（需要密码）`);
    console.log(`  POST /api/subscribe        - 添加订阅者`);
    console.log('========================================\n');
    
    console.log('✅ 服务器启动成功！');
    console.log('📡 正在进行首次检查...\n');
    
    await checkAllProducts();
    
    // 每2分钟检查一次
    setInterval(() => {
        checkAllProducts().catch(err => {
            console.error('定时检查出错:', err);
        });
    }, 2 * 60 * 1000);
});

process.on('SIGINT', () => {
    console.log('\n\n👋 正在关闭服务器...');
    process.exit(0);
});