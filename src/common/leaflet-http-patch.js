/**
 * Патч для Leaflet, позволяющий использовать HTTP URL для tile layers
 * даже когда браузер пытается автоматически обновить их до HTTPS
 *
 * ВАЖНО: Этот файл должен быть подключен ДО инициализации виджета ElemDotMap
 */

// Сохраняем оригинальный метод
let originalTileLayer = null;

/**
 * Функция инициализации патча
 * Вызовите её в main.js или в точке входа приложения
 */
export function initLeafletHttpPatch() {
    // Ждем, пока Leaflet будет доступен
    const checkLeaflet = () => {
        if (typeof window !== 'undefined' && window.L && window.L.tileLayer) {
            applyPatch();
        } else {
            // Повторяем проверку через 100ms
            setTimeout(checkLeaflet, 100);
        }
    };

    checkLeaflet();
}

function applyPatch() {
    const L = window.L;

    // Сохраняем оригинальный метод, если еще не сохранили
    if (!originalTileLayer) {
        originalTileLayer = L.tileLayer;
    }

    // Переопределяем метод L.tileLayer
    L.tileLayer = function(url, options) {
        // Если URL явно указан как HTTP, сохраняем его
        // Это позволяет обойти автоматическое обновление до HTTPS
        if (typeof url === 'string' && url.startsWith('http://')) {
            console.warn('[Leaflet HTTP Patch] Использование HTTP URL для tile layer:', url);
            console.warn('[Leaflet HTTP Patch] ВНИМАНИЕ: Это может вызвать предупреждения Mixed Content в браузере');

            // Создаем tile layer с оригинальным HTTP URL
            const layer = originalTileLayer.call(this, url, options);

            // Дополнительно: устанавливаем флаг, чтобы другие части кода знали об HTTP
            layer._isHttpLayer = true;
            layer._originalHttpUrl = url;

            return layer;
        }

        // Для HTTPS и других URL используем оригинальный метод
        return originalTileLayer.call(this, url, options);
    };

    // Копируем все статические свойства и методы
    Object.keys(originalTileLayer).forEach(key => {
        L.tileLayer[key] = originalTileLayer[key];
    });

    console.log('[Leaflet HTTP Patch] Патч успешно применен');
}

/**
 * Альтернативный вариант: прямое подключение без экспорта
 * Раскомментируйте, если хотите автоматическую инициализацию при импорте
 */
// initLeafletHttpPatch();

export default {
    initLeafletHttpPatch
};
