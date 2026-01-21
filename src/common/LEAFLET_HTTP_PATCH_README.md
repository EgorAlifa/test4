# Решение проблемы HTTP URL в панели настройки слоев ElemDotMap

## Проблема
При указании HTTP URL в панели настройки слоев виджета ElemDotMap, URL автоматически заменяется на HTTPS. Это происходит из-за политики безопасности браузера (Mixed Content Policy) - когда сайт загружен по HTTPS, браузер блокирует или автоматически обновляет HTTP ресурсы.

## Решение 1: Leaflet HTTP Patch (Рекомендуется)

### Шаг 1: Подключение патча

В главном файле приложения (обычно `main.js`, `index.js` или `app.js`) добавьте:

```javascript
import { initLeafletHttpPatch } from './common/leaflet-http-patch';

// ВАЖНО: Вызовите до инициализации Vue приложения
initLeafletHttpPatch();

// Далее идет инициализация приложения
// new Vue({ ... })
// или createApp({ ... })
```

### Шаг 2: Настройка виджета

После применения патча вы сможете указывать HTTP URL в панели настройки слоев:
1. Откройте панель "Настройка слоев" виджета ElemDotMap
2. В поле "Базовый слой" выберите "url"
3. В поле "URL слоя" укажите HTTP URL, например: `http://example.com/tiles/{z}/{x}/{y}.png`

### Предупреждения

⚠️ **ВАЖНО**:
- Браузер будет показывать предупреждения о Mixed Content (смешанное содержимое)
- Некоторые современные браузеры могут полностью блокировать HTTP контент на HTTPS страницах
- Это решение работает только если политика безопасности браузера позволяет загружать HTTP контент

---

## Решение 2: HTTP Proxy через HTTPS

Более безопасный подход - создать HTTPS прокси, который перенаправляет запросы на HTTP сервер.

### Вариант 2.1: Nginx прокси

Создайте конфигурацию Nginx:

```nginx
server {
    listen 443 ssl;
    server_name tiles-proxy.example.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        # Перенаправление на HTTP tile server
        proxy_pass http://your-http-tile-server.com;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;

        # CORS заголовки если нужно
        add_header Access-Control-Allow-Origin *;
    }
}
```

Затем используйте в виджете: `https://tiles-proxy.example.com/tiles/{z}/{x}/{y}.png`

### Вариант 2.2: Node.js прокси

Создайте простой Express прокси:

```javascript
const express = require('express');
const https = require('https');
const httpProxy = require('http-proxy');
const fs = require('fs');

const app = express();
const proxy = httpProxy.createProxyServer({});

app.use('*', (req, res) => {
    proxy.web(req, res, {
        target: 'http://your-http-tile-server.com',
        changeOrigin: true
    });
});

const options = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
};

https.createServer(options, app).listen(443);
```

---

## Решение 3: Использование локального HTTP сервера (для разработки)

Для локальной разработки можно настроить браузер на игнорирование Mixed Content:

### Chrome:
Запустите с флагом: `--allow-running-insecure-content`

### Firefox:
1. Откройте `about:config`
2. Найдите `security.mixed_content.block_active_content`
3. Установите в `false`

⚠️ **НЕ РЕКОМЕНДУЕТСЯ для production!**

---

## Решение 4: Конфигурация Content Security Policy

Если у вас есть доступ к настройке CSP заголовков, добавьте:

```html
<meta http-equiv="Content-Security-Policy"
      content="upgrade-insecure-requests;
               img-src 'self' http: https: data:;">
```

Или в заголовках сервера:
```
Content-Security-Policy: upgrade-insecure-requests; img-src 'self' http: https: data:;
```

---

## Проверка работы патча

После применения патча откройте консоль браузера. При использовании HTTP URL вы должны увидеть сообщения:
```
[Leaflet HTTP Patch] Патч успешно применен
[Leaflet HTTP Patch] Использование HTTP URL для tile layer: http://...
[Leaflet HTTP Patch] ВНИМАНИЕ: Это может вызвать предупреждения Mixed Content в браузере
```

---

## Рекомендации

1. **Для production** используйте **Решение 2** (HTTPS прокси) - это наиболее безопасный подход
2. **Для разработки** используйте **Решение 1** (Leaflet HTTP Patch) - быстро и просто
3. **Никогда не используйте** Решение 3 в production окружении

---

## Troubleshooting

### Патч не работает
- Убедитесь, что патч подключен ДО инициализации виджета
- Проверьте консоль на наличие сообщения "Патч успешно применен"
- Убедитесь, что Leaflet загружен

### Браузер блокирует HTTP контент
- Используйте HTTPS прокси (Решение 2)
- Проверьте настройки CSP
- Проверьте настройки безопасности браузера

### URL все еще меняется на HTTPS
- Возможно, замена происходит на уровне компонента ui-input
- Проверьте, что URL в консоли показывается как HTTP
- Если URL в консоли HTTPS, проблема в компоненте панели (требуется патч компонента)
