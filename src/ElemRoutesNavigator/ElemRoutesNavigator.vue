<template>
    <w-elem :placeholder="$placeholder">
        <div v-if="isReady" class="routes-navigator-container" :style="containerStyle">
            <!-- Title -->
            <h2 v-if="props.showTitle && props.title" class="navigator-title" :style="titleStyle">
                {{ props.title }}
            </h2>

            <!-- Dropdown -->
            <nav v-if="props.orientation === 'dropdown'" class="routes-nav-dropdown">
                <button
                    class="dropdown-toggle"
                    :class="{ 'dropdown-toggle-open': isMenuOpen }"
                    @click="props.openMode === 'click' && toggleMenu()"
                    @mouseenter="props.openMode === 'hover' && openMenu()"
                    @mouseleave="props.openMode === 'hover' && closeMenu()"
                    type="button"
                    :style="dropdownToggleStyle"
                >
                    <span class="route-title">{{ props.dropdownText }}</span>
                    <span class="dropdown-arrow">▼</span>
                </button>
                <div
                    v-if="isMenuOpen"
                    class="dropdown-menu"
                    :style="dropdownMenuStyle"
                    @mouseenter="props.openMode === 'hover' && openMenu()"
                    @mouseleave="props.openMode === 'hover' && closeMenu()">
                    <button
                        v-for="(route, index) in displayRoutes"
                        :key="route.id || index"
                        class="route-button"
                        :class="getButtonClass(route)"
                        :style="getButtonStyle(route, index)"
                        @click="navigateToRoute(route); isMenuOpen = false"
                        @mouseenter="hoveredIndex = index"
                        @mouseleave="hoveredIndex = null"
                        type="button"
                    >
                        <span class="route-title">{{ route.title || route.name }}</span>
                        <span v-if="props.showSlug && route.slug" class="route-slug">{{ route.slug }}</span>
                    </button>
                </div>
            </nav>

            <!-- Kebab Menu (Hamburger) -->
            <nav v-else-if="props.orientation === 'kebab'" class="routes-nav-kebab">
                <button
                    class="kebab-toggle"
                    :class="{ 'kebab-toggle-open': isMenuOpen }"
                    @click="props.openMode === 'click' && toggleMenu()"
                    @mouseenter="props.openMode === 'hover' && openMenu()"
                    @mouseleave="props.openMode === 'hover' && closeMenu()"
                    type="button"
                    :style="kebabToggleStyle"
                >
                    <span class="kebab-line"></span>
                    <span class="kebab-line"></span>
                    <span class="kebab-line"></span>
                </button>
                <div
                    v-if="isMenuOpen"
                    class="kebab-menu"
                    :style="kebabMenuStyle"
                    @mouseenter="props.openMode === 'hover' && openMenu()"
                    @mouseleave="props.openMode === 'hover' && closeMenu()">
                    <button
                        v-for="(route, index) in displayRoutes"
                        :key="route.id || index"
                        class="route-button"
                        :class="getButtonClass(route)"
                        :style="getButtonStyle(route, index)"
                        @click="navigateToRoute(route); isMenuOpen = false"
                        @mouseenter="hoveredIndex = index"
                        @mouseleave="hoveredIndex = null"
                        type="button"
                    >
                        <span class="route-title">{{ route.title || route.name }}</span>
                        <span v-if="props.showSlug && route.slug" class="route-slug">{{ route.slug }}</span>
                    </button>
                </div>
            </nav>

            <!-- Regular Navigation (Vertical/Horizontal) -->
            <nav v-else class="routes-nav" :style="navStyle">
                <button
                    v-for="(route, index) in displayRoutes"
                    :key="route.id || index"
                    class="route-button"
                    :class="getButtonClass(route, index)"
                    :style="getButtonStyle(route, index)"
                    :draggable="canReorder"
                    @click="navigateToRoute(route)"
                    @mouseenter="hoveredIndex = index"
                    @mouseleave="hoveredIndex = null"
                    @dragstart="onDragStart(index, $event)"
                    @dragover="onDragOver(index, $event)"
                    @drop="onDrop(index, $event)"
                    @dragend="onDragEnd"
                    type="button"
                >
                    <span v-if="canReorder" class="drag-handle" @mousedown.stop>⋮⋮</span>
                    <span class="route-title">{{ route.title || route.name }}</span>
                    <span v-if="props.showSlug && route.slug" class="route-slug">{{ route.slug }}</span>
                </button>
            </nav>

            <!-- Empty State -->
            <div v-if="displayRoutes.length === 0" class="empty-state">
                <p>⚠️ Страницы не найдены</p>
                <p class="empty-state-hint">
                    В редакторе создайте страницы - они автоматически появятся в навигации.<br>
                    В плеере виджет загрузит маршруты из app.json
                </p>
            </div>
        </div>
    </w-elem>
</template>

<script>
import { Elem } from '@goodt-wcore/elem';
import { meta } from './descriptor';
import { ElemInstanceTypeDescriptor } from './types';

export default {
    extends: Elem,

    meta,

    /* static data used in <template></template> */
    static: {},

    data: () => ({
        ...ElemInstanceTypeDescriptor,
        routes: [],
        currentSlug: null,
        hoveredIndex: null,
        isPlayerMode: false,
        loadAttempts: 0,
        maxAttempts: 5,
        isReady: false,
        isMenuOpen: false,
        draggedIndex: null,
        dragOverIndex: null,
        isDragging: false
    }),

    computed: {
        displayRoutes() {
            // В плеере показываем routes из app.json
            // В редакторе показываем routes распарсенные из HTML
            return this.routes;
        },

        canReorder() {
            // Перетаскивание доступно только в редакторе
            return !this.isPlayerMode;
        },

        containerStyle() {
            return {
                backgroundColor: this.props.backgroundColor || '#ffffff',
                color: this.props.textColor || '#1f2937',
                borderRadius: this.props.borderRadius || '0.375rem',
                padding: '1rem'
            };
        },

        titleStyle() {
            const defaultFontSize = 1.125; // 1.125rem = 18px
            const fontSizeObj = this.props.fontSize || { size: defaultFontSize, unit: 'rem' };
            const fontSize = `${fontSizeObj.size * 1.2}${fontSizeObj.unit}`;

            return {
                fontSize,
                fontWeight: '600',
                marginBottom: '0.75rem',
                color: this.props.textColor || '#1f2937',
                fontFamily: this.props.fontFamily || 'inherit'
            };
        },

        navStyle() {
            const defaultGap = 0.5; // 0.5rem = 8px
            const gapObj = this.props.buttonGap || { size: defaultGap, unit: 'rem' };
            const gap = `${gapObj.size}${gapObj.unit}`;

            return {
                display: 'flex',
                flexDirection: this.props.orientation === 'horizontal' ? 'row' : 'column',
                gap,
                flexWrap: this.props.orientation === 'horizontal' ? 'wrap' : 'nowrap'
            };
        },

        kebabToggleStyle() {
            const defaultPadding = 0.75; // 0.75rem = 12px
            const paddingObj = this.props.buttonPadding || { size: defaultPadding, unit: 'rem' };
            const padding = `${paddingObj.size}${paddingObj.unit}`;

            return {
                padding,
                borderRadius: this.props.borderRadius || '0.375rem',
                border: `1px solid ${this.props.textColor || '#1f2937'}`,
                backgroundColor: this.props.backgroundColor || '#ffffff',
                cursor: 'pointer'
            };
        },

        kebabMenuStyle() {
            const defaultGap = 0.5; // 0.5rem = 8px
            const gapObj = this.props.buttonGap || { size: defaultGap, unit: 'rem' };
            const gap = `${gapObj.size}${gapObj.unit}`;

            const baseStyle = {
                display: 'flex',
                flexDirection: 'column',
                gap,
                marginTop: gap,
                padding: gap,
                backgroundColor: this.props.backgroundColor || '#ffffff',
                border: `1px solid ${this.props.textColor || '#1f2937'}`,
                borderRadius: this.props.borderRadius || '0.375rem',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            };

            // Добавляем пагинацию со скроллом
            if (this.routes.length > this.props.itemsPerPage) {
                const itemHeight = 2.5; // Примерная высота одной кнопки в rem
                const maxHeight = this.props.itemsPerPage * itemHeight;
                baseStyle.maxHeight = `${maxHeight}rem`;
                baseStyle.overflowY = 'auto';
            }

            return baseStyle;
        },

        activeRoute() {
            return this.displayRoutes.find(route => route.slug === this.currentSlug);
        },

        dropdownToggleStyle() {
            const defaultPadding = 0.75; // 0.75rem = 12px
            const paddingObj = this.props.buttonPadding || { size: defaultPadding, unit: 'rem' };
            const padding = `${paddingObj.size}${paddingObj.unit}`;

            const defaultFontSize = 0.875; // 0.875rem = 14px
            const fontSizeObj = this.props.fontSize || { size: defaultFontSize, unit: 'rem' };
            const fontSize = `${fontSizeObj.size}${fontSizeObj.unit}`;

            return {
                padding,
                fontSize,
                borderRadius: this.props.borderRadius || '0.375rem',
                border: `1px solid ${this.props.textColor || '#1f2937'}`,
                backgroundColor: this.props.backgroundColor || '#ffffff',
                color: this.props.textColor || '#1f2937',
                cursor: 'pointer',
                fontFamily: this.props.fontFamily || 'inherit'
            };
        },

        dropdownMenuStyle() {
            const defaultGap = 0.5; // 0.5rem = 8px
            const gapObj = this.props.buttonGap || { size: defaultGap, unit: 'rem' };
            const gap = `${gapObj.size}${gapObj.unit}`;

            const baseStyle = {
                display: 'flex',
                flexDirection: 'column',
                gap,
                marginTop: gap,
                padding: gap,
                backgroundColor: this.props.backgroundColor || '#ffffff',
                border: `1px solid ${this.props.textColor || '#1f2937'}`,
                borderRadius: this.props.borderRadius || '0.375rem',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            };

            // Добавляем пагинацию со скроллом
            if (this.routes.length > this.props.itemsPerPage) {
                const itemHeight = 2.5; // Примерная высота одной кнопки в rem
                const maxHeight = this.props.itemsPerPage * itemHeight;
                baseStyle.maxHeight = `${maxHeight}rem`;
                baseStyle.overflowY = 'auto';
            }

            return baseStyle;
        }
    },

    async mounted() {
        await this.loadRoutes();
        this.detectCurrentSlug();

        // Небольшая задержка перед показом чтобы не мелькали моки
        await new Promise(resolve => setTimeout(resolve, 100)); // eslint-disable-line no-magic-numbers
        this.isReady = true;
    },

    methods: {
        /**
         * Получает ID приложения из URL
         */
        getApplicationId() {
            if (typeof window === 'undefined') return null;

            // Извлекаем из URL
            // Поддерживаем разные паттерны URL:
            // - /apps/edit/3096 (редактор)
            // - /application/3096 (плеер)
            const urlPatterns = [
                /\/apps\/edit\/(\d+)/,
                /\/application\/(\d+)/
            ];

            for (const pattern of urlPatterns) {
                const urlMatch = window.location.pathname.match(pattern);
                if (urlMatch && urlMatch[1]) {
                    console.log('[ElemRoutesNavigator] Extracted application ID from URL:', urlMatch[1]);
                    return urlMatch[1];
                }
            }

            console.warn('[ElemRoutesNavigator] Could not find application ID in URL');
            return null;
        },

        /**
         * Строит URL для app.json на основе текущего URL
         * Логика:
         * 1. Для редактора: обрезает до /editor и добавляет /player/{id}/app.json
         * 2. Для плеера: добавляет /app.json к текущему URL
         */
        buildAppJsonUrl() {
            if (typeof window === 'undefined') return null;

            const appId = this.getApplicationId();
            const currentUrl = window.location.href;
            const currentPath = window.location.pathname;

            // Для редактора: обрезаем до /editor и добавляем /player/{id}/app.json
            if (currentPath.includes('/editor/')) {
                const editorIndex = currentUrl.indexOf('/editor/');
                if (editorIndex !== -1 && appId) {
                    const baseUrl = currentUrl.substring(0, editorIndex + '/editor'.length);
                    const appJsonUrl = `${baseUrl}/player/${appId}/app.json`;
                    console.log('[ElemRoutesNavigator] Built app.json URL for editor:', appJsonUrl);
                    return appJsonUrl;
                }
            }

            // Fallback: добавляем /app.json к текущему URL
            const fallbackUrl = `${window.location.origin}${currentPath}/app.json`.replace(/\/+/g, '/').replace(':/', '://');
            console.log('[ElemRoutesNavigator] Built fallback app.json URL:', fallbackUrl);
            return fallbackUrl;
        },

        async loadRoutes(retryDelay = 0) {
            this.loadAttempts += 1;

            // ВЕРСИЯ ВИДЖЕТА ДЛЯ ОТЛАДКИ
            console.log('[ElemRoutesNavigator] 🚀 Version: 2025-11-27-v11-RemUnits | Attempt:', this.loadAttempts);

            // Сначала проверяем глобальные объекты
            console.log('[ElemRoutesNavigator] Checking global objects for app.json...');
            const globalSources = [
                { name: 'window.__APP_CONFIG__', value: typeof window !== 'undefined' ? window.__APP_CONFIG__ : null },
                { name: 'window.appConfig', value: typeof window !== 'undefined' ? window.appConfig : null },
                { name: 'window.APP_CONFIG', value: typeof window !== 'undefined' ? window.APP_CONFIG : null },
                { name: 'window.$appConfig', value: typeof window !== 'undefined' ? window.$appConfig : null },
                { name: 'window.goodt?.config', value: typeof window !== 'undefined' && window.goodt ? window.goodt.config : null },
                { name: 'window.goodt?.appConfig', value: typeof window !== 'undefined' && window.goodt ? window.goodt.appConfig : null }
            ];

            for (const source of globalSources) {
                if (source.value && source.value.routes && Array.isArray(source.value.routes)) {
                    console.log('[ElemRoutesNavigator] ✅ Found app.json in', source.name);
                    console.log('[ElemRoutesNavigator] Config:', source.value);
                    this.routes = source.value.routes.filter(route => route.enabled !== false);
                    this.isPlayerMode = true;
                    console.log('[ElemRoutesNavigator] ✅ Successfully loaded', this.routes.length, 'routes from global object');
                    console.log('[ElemRoutesNavigator] Routes:', this.routes);
                    return true;
                }
            }

            console.log('[ElemRoutesNavigator] No app.json found in global objects, trying fetch...');

            // Если это retry, ждем перед попыткой
            if (retryDelay > 0) {
                console.log(`[ElemRoutesNavigator] Retry attempt ${this.loadAttempts}/${this.maxAttempts} after ${retryDelay}ms delay`);
                await new Promise(resolve => setTimeout(resolve, retryDelay));
            }

            // Строим URL для app.json
            const smartUrl = this.buildAppJsonUrl();

            // Попытка загрузить app.json из сети
            const possiblePaths = [
                this.props.appJsonUrl, // Если пользователь указал вручную
                smartUrl, // Умный URL на основе текущего URL
                'app.json',
                './app.json',
                '/app.json'
            ].filter(Boolean); // Удаляем null/undefined

            // Убираем дубликаты
            const uniquePaths = [...new Set(possiblePaths)];

            for (const path of uniquePaths) {
                try {
                    console.log('[ElemRoutesNavigator] Trying to fetch app.json from:', path);
                    const response = await fetch(path);

                    if (!response.ok) {
                        console.warn('[ElemRoutesNavigator] Failed to fetch from', path, '- status:', response.status);
                        continue;
                    }

                    const appConfig = await response.json();
                    console.log('[ElemRoutesNavigator] Received config from', path, ':', appConfig);

                    if (appConfig && appConfig.routes && Array.isArray(appConfig.routes)) {
                        this.routes = appConfig.routes.filter(route => route.enabled !== false);
                        this.isPlayerMode = true;
                        console.log('[ElemRoutesNavigator] ✅ Successfully loaded', this.routes.length, 'routes from', path, `(attempt ${this.loadAttempts})`);
                        console.log('[ElemRoutesNavigator] Routes:', this.routes);
                        return true;
                    }

                    console.warn('[ElemRoutesNavigator] app.json found at', path, 'but no routes array');
                } catch (error) {
                    console.warn('[ElemRoutesNavigator] Error fetching from', path, ':', error.message);
                }
            }

            // Не удалось загрузить - пробуем retry
            if (this.loadAttempts < this.maxAttempts) {
                // Экспоненциальная задержка: 100ms, 300ms, 500ms, 1000ms, 2000ms
                const delays = [100, 300, 500, 1000, 2000]; // eslint-disable-line no-magic-numbers
                const nextDelay = delays[this.loadAttempts - 1] || 2000; // eslint-disable-line no-magic-numbers
                return this.loadRoutes(nextDelay);
            }

            // Все попытки исчерпаны
            console.log(`[ElemRoutesNavigator] ❌ Could not fetch app.json after ${this.loadAttempts} attempts.`);
            console.log('[ElemRoutesNavigator] ⚠️ No routes found, widget will be empty');
            this.isPlayerMode = true;
            this.routes = [];
            return false;
        },

        detectCurrentSlug() {
            if (typeof window !== 'undefined') {
                this.currentSlug = window.location.pathname;
            }
        },

        /**
         * Переключает состояние меню (для режима click)
         */
        toggleMenu() {
            this.isMenuOpen = !this.isMenuOpen;
        },

        /**
         * Открывает меню (для режима hover)
         */
        openMenu() {
            this.isMenuOpen = true;
        },

        /**
         * Закрывает меню (для режима hover)
         */
        closeMenu() {
            this.isMenuOpen = false;
        },

        /**
         * Проверяет изменились ли routes
         */
        routesChanged(newRoutes) {
            if (this.routes.length !== newRoutes.length) {
                return true;
            }

            // Сравниваем slugs в том же порядке
            for (let i = 0; i < this.routes.length; i++) {
                if (this.routes[i].slug !== newRoutes[i].slug || this.routes[i].title !== newRoutes[i].title) {
                    return true;
                }
            }

            return false;
        },

        /**
         * Публичный метод для принудительной перезагрузки routes
         * Можно вызвать из консоли: widgetInstance.reloadRoutes()
         */
        async reloadRoutes() {
            console.log('[ElemRoutesNavigator] Manual reload requested');
            this.loadAttempts = 0;
            this.routes = [];
            this.isPlayerMode = false;
            await this.loadRoutes();
        },

        navigateToRoute(route) {
            // Если было перетаскивание, не делаем навигацию
            if (this.isDragging) {
                this.isDragging = false;
                return;
            }

            if (!route.slug) {
                console.warn('[ElemRoutesNavigator] Route has no slug:', route);
                return;
            }

            // Проверяем что не пытаемся перейти на текущую страницу
            if (this.currentSlug === route.slug) {
                console.log('[ElemRoutesNavigator] Already on this route:', route.slug);
                return;
            }

            this.currentSlug = route.slug;

            // Эмитим событие для родительских компонентов
            this.$emit('navigate', route);

            // В режиме плеера пытаемся реально перейти
            if (this.isPlayerMode && typeof window !== 'undefined') {
                // Проверяем наличие роутера
                if (this.$router) {
                    // Используем catch для подавления ошибки NavigationDuplicated
                    this.$router.push(route.slug).catch(err => {
                        if (err.name !== 'NavigationDuplicated') {
                            console.error('[ElemRoutesNavigator] Navigation error:', err);
                        }
                    });
                } else {
                    // Fallback на обычную навигацию
                    window.location.href = route.slug;
                }
            } else {
                console.log('[ElemRoutesNavigator] Navigate to:', route.slug, '(editor mode, no actual navigation)');
            }
        },

        getButtonClass(route, index) {
            const classes = [];

            if (this.props.buttonStyle) {
                classes.push(`button-style-${this.props.buttonStyle}`);
            }

            if (this.isActive(route)) {
                classes.push('route-button-active');
            }

            if (this.canReorder) {
                classes.push('draggable');
            }

            if (this.draggedIndex === index) {
                classes.push('dragging');
            }

            if (this.dragOverIndex === index && this.draggedIndex !== index) {
                classes.push('drag-over');
            }

            return classes;
        },

        getButtonStyle(route, index) {
            const defaultPadding = 0.75; // 0.75rem = 12px
            const defaultFontSize = 0.875; // 0.875rem = 14px

            const paddingObj = this.props.buttonPadding || { size: defaultPadding, unit: 'rem' };
            const padding = `${paddingObj.size}${paddingObj.unit}`;

            const fontSizeObj = this.props.fontSize || { size: defaultFontSize, unit: 'rem' };
            const fontSize = `${fontSizeObj.size}${fontSizeObj.unit}`;

            const baseStyle = {
                padding,
                fontSize,
                borderRadius: this.props.borderRadius || '0.375rem',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                width: this.props.orientation === 'vertical' ? '100%' : 'auto',
                textAlign: 'left',
                fontFamily: this.props.fontFamily || 'inherit'
            };

            // Определяем цвет кнопки
            if (this.isActive(route)) {
                baseStyle.backgroundColor = this.props.activeColor || '#3b82f6';
                baseStyle.color = '#ffffff';
            } else if (this.hoveredIndex === index) {
                baseStyle.backgroundColor = this.props.hoverColor || '#60a5fa';
                baseStyle.color = '#ffffff';
            } else {
                if (this.props.buttonStyle === 'filled') {
                    baseStyle.backgroundColor = '#f3f4f6';
                    baseStyle.color = this.props.textColor || '#1f2937';
                } else if (this.props.buttonStyle === 'outlined') {
                    baseStyle.backgroundColor = 'transparent';
                    baseStyle.border = `1px solid ${this.props.textColor || '#1f2937'}`;
                    baseStyle.color = this.props.textColor || '#1f2937';
                } else {
                    baseStyle.backgroundColor = 'transparent';
                    baseStyle.color = this.props.textColor || '#1f2937';
                }
            }

            return baseStyle;
        },

        isActive(route) {
            return this.currentSlug === route.slug;
        },

        /**
         * Обработчик начала перетаскивания
         */
        onDragStart(index, event) {
            if (!this.canReorder) return;

            event.stopPropagation(); // Не даем перетаскивать весь виджет

            this.isDragging = true;
            this.draggedIndex = index;
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData('text/html', event.target.innerHTML);

            // Добавляем класс для визуального эффекта
            event.target.classList.add('dragging');
        },

        /**
         * Обработчик перетаскивания над элементом
         */
        onDragOver(index, event) {
            if (!this.canReorder || this.draggedIndex === null) return;

            event.preventDefault();
            event.stopPropagation(); // Не даем перетаскивать весь виджет
            event.dataTransfer.dropEffect = 'move';

            this.dragOverIndex = index;
        },

        /**
         * Обработчик отпускания элемента
         */
        onDrop(index, event) {
            if (!this.canReorder || this.draggedIndex === null) return;

            event.preventDefault();
            event.stopPropagation();

            // Меняем местами элементы
            if (this.draggedIndex !== index) {
                const fromIndex = this.draggedIndex;
                const toIndex = index;

                // Обновляем локальный массив для отображения
                const newRoutes = [...this.routes];
                const draggedItem = newRoutes[fromIndex];

                // Удаляем из старой позиции
                newRoutes.splice(fromIndex, 1);
                // Вставляем в новую позицию
                newRoutes.splice(toIndex, 0, draggedItem);

                this.routes = newRoutes;

                console.log('[ElemRoutesNavigator] 🔄 Routes reordered:', fromIndex, '→', toIndex);
                console.log('[ElemRoutesNavigator] Note: Changes are visual only, not saved');
            }

            this.draggedIndex = null;
            this.dragOverIndex = null;
        },

        /**
         * Обработчик завершения перетаскивания
         */
        onDragEnd(event) {
            event.stopPropagation(); // Не даем перетаскивать весь виджет
            event.target.classList.remove('dragging');
            this.draggedIndex = null;
            this.dragOverIndex = null;

            // Сбрасываем флаг перетаскивания с небольшой задержкой
            // чтобы событие click не сработало
            setTimeout(() => {
                this.isDragging = false;
            }, 100); // eslint-disable-line no-magic-numbers
        }
    }
};
</script>

<style lang="pcss" scoped src="./style.pcss"></style>
