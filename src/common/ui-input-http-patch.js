/**
 * Патч для компонента ui-input из @goodt-wcore/components
 * Предотвращает автоматическую замену HTTP на HTTPS в полях ввода URL
 *
 * Используйте этот патч, если Leaflet патч не помог и URL все еще
 * меняется на HTTPS в самом поле ввода панели настроек
 */

/**
 * Этот патч перехватывает изменения в props виджета
 * и восстанавливает HTTP URL если они были изменены
 */
export function initUiInputHttpPatch() {
    // Патч будет применен через Vue mixin
    console.log('[UI Input HTTP Patch] Инициализация патча для ui-input');

    // Создаем глобальный флаг для отслеживания HTTP URLs
    if (typeof window !== 'undefined') {
        window.__HTTP_URLS_WHITELIST = window.__HTTP_URLS_WHITELIST || new Map();
    }
}

/**
 * Функция для сохранения HTTP URL в whitelist
 * @param {string} key - ключ для идентификации URL (например, 'tileLayer.url')
 * @param {string} url - HTTP URL который нужно сохранить
 */
export function preserveHttpUrl(key, url) {
    if (typeof window !== 'undefined' && url && url.startsWith('http://')) {
        window.__HTTP_URLS_WHITELIST.set(key, url);
        console.log(`[UI Input HTTP Patch] Сохранен HTTP URL для "${key}":`, url);
    }
}

/**
 * Функция для восстановления HTTP URL из whitelist
 * @param {string} key - ключ для идентификации URL
 * @param {string} currentUrl - текущий URL (возможно измененный на HTTPS)
 * @returns {string} - оригинальный HTTP URL или текущий URL
 */
export function restoreHttpUrl(key, currentUrl) {
    if (typeof window !== 'undefined' && window.__HTTP_URLS_WHITELIST.has(key)) {
        const originalUrl = window.__HTTP_URLS_WHITELIST.get(key);

        // Проверяем, был ли URL изменен на HTTPS
        if (currentUrl && currentUrl.startsWith('https://') &&
            currentUrl.replace('https://', 'http://') === originalUrl) {
            console.log(`[UI Input HTTP Patch] Восстановлен HTTP URL для "${key}":`, originalUrl);
            return originalUrl;
        }
    }

    return currentUrl;
}

/**
 * Vue Mixin для автоматического применения патча к виджету ElemDotMap
 * Подключите этот mixin в main.js:
 *
 * import { createHttpUrlMixin } from './common/ui-input-http-patch';
 * Vue.mixin(createHttpUrlMixin());
 */
export function createHttpUrlMixin() {
    return {
        beforeMount() {
            // Применяем только к виджету ElemDotMap
            if (this.$options.name === 'ElemDotMap' ||
                (this.$options.meta && this.$options.meta.descriptor)) {

                this._originalProps = null;

                // Перехватываем изменения props
                this.$watch('props.tileLayer.url', (newUrl, oldUrl) => {
                    if (oldUrl && oldUrl.startsWith('http://') &&
                        newUrl && newUrl.startsWith('https://')) {

                        console.warn('[UI Input HTTP Patch] Обнаружена замена HTTP на HTTPS');
                        console.warn('[UI Input HTTP Patch] Старый URL:', oldUrl);
                        console.warn('[UI Input HTTP Patch] Новый URL:', newUrl);

                        // Сохраняем оригинальный HTTP URL
                        preserveHttpUrl('tileLayer.url', oldUrl);

                        // Пытаемся восстановить HTTP URL
                        this.$nextTick(() => {
                            if (this.props.tileLayer.url.startsWith('https://')) {
                                this.props.tileLayer.url = oldUrl;
                                console.log('[UI Input HTTP Patch] HTTP URL восстановлен');
                            }
                        });
                    }
                }, { immediate: true });

                // То же самое для WMS server
                this.$watch('props.layerSettings', (newSettings) => {
                    if (!newSettings) return;

                    newSettings.forEach((levelSettings, levelIndex) => {
                        levelSettings.forEach((layer, layerIndex) => {
                            if (layer.type === 'wms' && layer.wms && layer.wms.server) {
                                const key = `layerSettings[${levelIndex}][${layerIndex}].wms.server`;

                                if (layer.wms.server.startsWith('http://')) {
                                    preserveHttpUrl(key, layer.wms.server);
                                }
                            }
                        });
                    });
                }, { deep: true, immediate: true });
            }
        }
    };
}

/**
 * Дополнительный патч: перехват событий input/change в DOM
 * Применяется к полям ввода URL в панелях настроек
 */
export function applyDomInputPatch() {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
        return;
    }

    // Функция для патча конкретного input элемента
    function patchInputElement(input) {
        if (input._httpPatched) return;
        input._httpPatched = true;

        const originalSetValue = Object.getOwnPropertyDescriptor(
            HTMLInputElement.prototype,
            'value'
        ).set;

        Object.defineProperty(input, 'value', {
            set: function(newValue) {
                // Если значение было HTTP, а стало HTTPS - отменяем
                const oldValue = this.getAttribute('data-http-original');

                if (oldValue && oldValue.startsWith('http://') &&
                    newValue && newValue.startsWith('https://') &&
                    newValue.replace('https://', 'http://') === oldValue) {

                    console.log('[UI Input HTTP Patch] DOM патч: предотвращена замена HTTP на HTTPS');
                    originalSetValue.call(this, oldValue);
                    return;
                }

                // Сохраняем HTTP URL как оригинальное значение
                if (newValue && newValue.startsWith('http://')) {
                    this.setAttribute('data-http-original', newValue);
                }

                originalSetValue.call(this, newValue);
            },
            get: function() {
                return this.value;
            }
        });
    }

    // Наблюдаем за добавлением новых input элементов
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) { // ELEMENT_NODE
                    // Проверяем сам элемент
                    if (node.tagName === 'INPUT' &&
                        (node.placeholder?.includes('URL') ||
                         node.placeholder?.includes('server') ||
                         node.name?.includes('url'))) {
                        patchInputElement(node);
                    }

                    // Проверяем вложенные элементы
                    const inputs = node.querySelectorAll('input');
                    inputs.forEach((input) => {
                        if (input.placeholder?.includes('URL') ||
                            input.placeholder?.includes('server') ||
                            input.name?.includes('url')) {
                            patchInputElement(input);
                        }
                    });
                }
            });
        });
    });

    // Начинаем наблюдение
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    console.log('[UI Input HTTP Patch] DOM патч активирован');
}

/**
 * Инициализация всех патчей
 */
export function initAllInputPatches() {
    initUiInputHttpPatch();

    // Применяем DOM патч после загрузки страницы
    if (typeof window !== 'undefined') {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', applyDomInputPatch);
        } else {
            applyDomInputPatch();
        }
    }
}

export default {
    initUiInputHttpPatch,
    initAllInputPatches,
    preserveHttpUrl,
    restoreHttpUrl,
    createHttpUrlMixin,
    applyDomInputPatch
};
