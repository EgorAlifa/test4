/**
 * Простой HTTPS прокси-сервер для перенаправления запросов к HTTP tile серверу
 *
 * Установка зависимостей:
 * npm install express http-proxy-middleware cors
 *
 * Для production также установите:
 * npm install helmet compression
 *
 * Использование:
 * node http-proxy-server.js
 */

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// ===================================================================
// КОНФИГУРАЦИЯ
// ===================================================================

const CONFIG = {
    // HTTP tile сервер, к которому будет проксироваться запрос
    TARGET_HTTP_SERVER: process.env.TARGET_SERVER || 'http://tile.openstreetmap.org',

    // Порт для HTTPS прокси
    HTTPS_PORT: process.env.HTTPS_PORT || 8443,

    // Порт для HTTP (опционально, для редиректа)
    HTTP_PORT: process.env.HTTP_PORT || 8080,

    // Пути к SSL сертификатам
    SSL_KEY: process.env.SSL_KEY || path.join(__dirname, 'certs', 'key.pem'),
    SSL_CERT: process.env.SSL_CERT || path.join(__dirname, 'certs', 'cert.pem'),

    // Включить кэширование
    ENABLE_CACHE: process.env.ENABLE_CACHE === 'true',

    // Время кэширования в секундах
    CACHE_TIME: parseInt(process.env.CACHE_TIME || '604800'), // 7 дней по умолчанию
};

// ===================================================================
// ИНИЦИАЛИЗАЦИЯ
// ===================================================================

const app = express();

// Middleware для логирования
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
    next();
});

// CORS
app.use(cors({
    origin: '*',
    methods: ['GET', 'OPTIONS'],
    allowedHeaders: ['Origin', 'Content-Type', 'Accept']
}));

// Compression (если установлен)
try {
    const compression = require('compression');
    app.use(compression());
    console.log('✓ Compression включен');
} catch (e) {
    console.log('ℹ Compression не установлен (опционально)');
}

// Helmet для безопасности (если установлен)
try {
    const helmet = require('helmet');
    app.use(helmet());
    console.log('✓ Helmet включен');
} catch (e) {
    console.log('ℹ Helmet не установлен (опционально)');
}

// ===================================================================
// ПРОКСИ MIDDLEWARE
// ===================================================================

const proxyMiddleware = createProxyMiddleware({
    target: CONFIG.TARGET_HTTP_SERVER,
    changeOrigin: true,
    ws: false,

    // Обработка ошибок
    onError: (err, req, res) => {
        console.error('Proxy error:', err.message);
        res.status(502).json({
            error: 'Proxy Error',
            message: 'Не удалось подключиться к целевому серверу',
            target: CONFIG.TARGET_HTTP_SERVER
        });
    },

    // Логирование прокси запросов
    onProxyReq: (proxyReq, req, res) => {
        console.log(`→ Proxying to: ${CONFIG.TARGET_HTTP_SERVER}${req.url}`);
    },

    // Обработка ответа
    onProxyRes: (proxyRes, req, res) => {
        console.log(`← Response status: ${proxyRes.statusCode}`);

        // Добавляем заголовки кэширования
        if (CONFIG.ENABLE_CACHE && proxyRes.statusCode === 200) {
            res.setHeader('Cache-Control', `public, max-age=${CONFIG.CACHE_TIME}`);
            res.setHeader('Expires', new Date(Date.now() + CONFIG.CACHE_TIME * 1000).toUTCString());
        }
    },

    // Логирование
    logLevel: 'info'
});

// Применяем прокси ко всем запросам
app.use('/', proxyMiddleware);

// ===================================================================
// HEALTH CHECK
// ===================================================================

app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        target: CONFIG.TARGET_HTTP_SERVER,
        timestamp: new Date().toISOString()
    });
});

// ===================================================================
// SSL СЕРТИФИКАТЫ
// ===================================================================

function loadSSLCertificates() {
    try {
        const key = fs.readFileSync(CONFIG.SSL_KEY);
        const cert = fs.readFileSync(CONFIG.SSL_CERT);
        console.log('✓ SSL сертификаты загружены');
        return { key, cert };
    } catch (err) {
        console.error('✗ Ошибка загрузки SSL сертификатов:', err.message);
        console.log('\nСоздайте self-signed сертификаты командой:');
        console.log(`  mkdir -p ${path.dirname(CONFIG.SSL_KEY)}`);
        console.log(`  openssl req -x509 -newkey rsa:2048 -nodes \\`);
        console.log(`    -keyout ${CONFIG.SSL_KEY} \\`);
        console.log(`    -out ${CONFIG.SSL_CERT} \\`);
        console.log(`    -days 365 -subj "/CN=localhost"`);
        process.exit(1);
    }
}

// ===================================================================
// ЗАПУСК СЕРВЕРОВ
// ===================================================================

function startServers() {
    const sslOptions = loadSSLCertificates();

    // HTTPS сервер
    const httpsServer = https.createServer(sslOptions, app);
    httpsServer.listen(CONFIG.HTTPS_PORT, () => {
        console.log('\n' + '='.repeat(60));
        console.log('🚀 HTTPS Proxy Server запущен');
        console.log('='.repeat(60));
        console.log(`📍 HTTPS URL: https://localhost:${CONFIG.HTTPS_PORT}`);
        console.log(`🎯 Target: ${CONFIG.TARGET_HTTP_SERVER}`);
        console.log(`💾 Cache: ${CONFIG.ENABLE_CACHE ? 'Включен' : 'Выключен'}`);
        console.log('='.repeat(60));
        console.log('\nИспользование в ElemDotMap:');
        console.log(`  https://localhost:${CONFIG.HTTPS_PORT}/{z}/{x}/{y}.png`);
        console.log('\nHealth check:');
        console.log(`  https://localhost:${CONFIG.HTTPS_PORT}/health`);
        console.log('\nДля остановки нажмите Ctrl+C\n');
    });

    // HTTP сервер (редирект на HTTPS)
    const httpServer = http.createServer((req, res) => {
        res.writeHead(301, {
            'Location': `https://${req.headers.host?.replace(CONFIG.HTTP_PORT, CONFIG.HTTPS_PORT)}${req.url}`
        });
        res.end();
    });

    httpServer.listen(CONFIG.HTTP_PORT, () => {
        console.log(`↪ HTTP redirect server: http://localhost:${CONFIG.HTTP_PORT}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
        console.log('\n⚠ Получен сигнал SIGTERM, завершение работы...');
        httpsServer.close(() => {
            httpServer.close(() => {
                console.log('✓ Серверы остановлены');
                process.exit(0);
            });
        });
    });

    process.on('SIGINT', () => {
        console.log('\n⚠ Получен сигнал SIGINT, завершение работы...');
        httpsServer.close(() => {
            httpServer.close(() => {
                console.log('✓ Серверы остановлены');
                process.exit(0);
            });
        });
    });
}

// ===================================================================
// ЗАПУСК
// ===================================================================

if (require.main === module) {
    startServers();
}

module.exports = { app, startServers };
