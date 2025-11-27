<template>
    <w-elem :placeholder="$placeholder">
        <div v-if="isReady" class="routes-navigator-container" :style="containerStyle">
            <!-- Title -->
            <h2 v-if="props.showTitle && props.title" class="navigator-title" :style="titleStyle">
                {{ props.title }}
            </h2>

            <!-- Информационная подсказка для редактора -->
            <div v-if="!isPlayerMode && routes.length === 0 && props.showHint" class="editor-hint">
                💡 Тестовый режим
            </div>

            <!-- Dropdown -->
            <nav v-if="props.orientation === 'dropdown'" class="routes-nav-dropdown">
                <button
                    class="dropdown-toggle"
                    :class="{ 'dropdown-toggle-open': isMenuOpen }"
                    @click="isMenuOpen = !isMenuOpen"
                    type="button"
                    :style="dropdownToggleStyle"
                >
                    <span class="route-title">{{ activeRoute ? (activeRoute.title || activeRoute.name) : 'Выберите страницу' }}</span>
                    <span class="dropdown-arrow">▼</span>
                </button>
                <div v-if="isMenuOpen" class="dropdown-menu" :style="dropdownMenuStyle">
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
                    @click="isMenuOpen = !isMenuOpen"
                    type="button"
                    :style="kebabToggleStyle"
                >
                    <span class="kebab-line"></span>
                    <span class="kebab-line"></span>
                    <span class="kebab-line"></span>
                </button>
                <div v-if="isMenuOpen" class="kebab-menu" :style="kebabMenuStyle">
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
                    :class="getButtonClass(route)"
                    :style="getButtonStyle(route, index)"
                    @click="navigateToRoute(route)"
                    @mouseenter="hoveredIndex = index"
                    @mouseleave="hoveredIndex = null"
                    type="button"
                >
                    <span class="route-title">{{ route.title || route.name }}</span>
                    <span v-if="props.showSlug && route.slug" class="route-slug">{{ route.slug }}</span>
                </button>
            </nav>

            <!-- Empty State -->
            <div v-if="displayRoutes.length === 0" class="empty-state">
                <p>⚠️ Маршруты не найдены</p>
                <p class="empty-state-hint">
                    Сейчас показываются тестовые данные для настройки дизайна.<br>
                    В режиме плеера виджет автоматически загрузит реальные маршруты из app.json
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
        isMenuOpen: false
    }),

    computed: {
        displayRoutes() {
            // В режиме плеера показываем routes из app.json
            // В редакторе показываем mock данные
            if (this.routes.length > 0) {
                return this.routes;
            }

            // Тестовые данные для настройки внешнего вида в редакторе
            // В режиме плеера виджет загрузит реальные маршруты из app.json
            return [
                {
                    id: 'mock-demo-1',
                    title: 'Главная страница',
                    name: 'home',
                    slug: '/',
                    enabled: true
                },
                {
                    id: 'mock-demo-2',
                    title: 'О компании',
                    name: 'about',
                    slug: '/about',
                    enabled: true
                },
                {
                    id: 'mock-demo-3',
                    title: 'Услуги',
                    name: 'services',
                    slug: '/services',
                    enabled: true
                },
                {
                    id: 'mock-demo-4',
                    title: 'Контакты',
                    name: 'contacts',
                    slug: '/contacts',
                    enabled: true
                }
            ];
        },

        containerStyle() {
            return {
                backgroundColor: this.props.backgroundColor || '#ffffff',
                color: this.props.textColor || '#1f2937',
                borderRadius: this.props.borderRadius || '6px',
                padding: '16px'
            };
        },

        titleStyle() {
            const defaultFontSize = 18; // eslint-disable-line no-magic-numbers
            const fontSizeObj = this.props.fontSize || { size: defaultFontSize, unit: 'px' };
            const fontSize = `${fontSizeObj.size * 1.2}${fontSizeObj.unit}`;

            return {
                fontSize,
                fontWeight: '600',
                marginBottom: '12px',
                color: this.props.textColor || '#1f2937'
            };
        },

        navStyle() {
            const defaultGap = 8; // eslint-disable-line no-magic-numbers
            const gapObj = this.props.buttonGap || { size: defaultGap, unit: 'px' };
            const gap = `${gapObj.size}${gapObj.unit}`;

            return {
                display: 'flex',
                flexDirection: this.props.orientation === 'horizontal' ? 'row' : 'column',
                gap,
                flexWrap: this.props.orientation === 'horizontal' ? 'wrap' : 'nowrap'
            };
        },

        kebabToggleStyle() {
            const defaultPadding = 12; // eslint-disable-line no-magic-numbers
            const paddingObj = this.props.buttonPadding || { size: defaultPadding, unit: 'px' };
            const padding = `${paddingObj.size}${paddingObj.unit}`;

            return {
                padding,
                borderRadius: this.props.borderRadius || '6px',
                border: `1px solid ${this.props.textColor || '#1f2937'}`,
                backgroundColor: this.props.backgroundColor || '#ffffff',
                cursor: 'pointer'
            };
        },

        kebabMenuStyle() {
            const defaultGap = 8; // eslint-disable-line no-magic-numbers
            const gapObj = this.props.buttonGap || { size: defaultGap, unit: 'px' };
            const gap = `${gapObj.size}${gapObj.unit}`;

            return {
                display: 'flex',
                flexDirection: 'column',
                gap,
                marginTop: gap,
                padding: gap,
                backgroundColor: this.props.backgroundColor || '#ffffff',
                border: `1px solid ${this.props.textColor || '#1f2937'}`,
                borderRadius: this.props.borderRadius || '6px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            };
        },

        activeRoute() {
            return this.displayRoutes.find(route => route.slug === this.currentSlug);
        },

        dropdownToggleStyle() {
            const defaultPadding = 12; // eslint-disable-line no-magic-numbers
            const paddingObj = this.props.buttonPadding || { size: defaultPadding, unit: 'px' };
            const padding = `${paddingObj.size}${paddingObj.unit}`;

            const defaultFontSize = 14; // eslint-disable-line no-magic-numbers
            const fontSizeObj = this.props.fontSize || { size: defaultFontSize, unit: 'px' };
            const fontSize = `${fontSizeObj.size}${fontSizeObj.unit}`;

            return {
                padding,
                fontSize,
                borderRadius: this.props.borderRadius || '6px',
                border: `1px solid ${this.props.textColor || '#1f2937'}`,
                backgroundColor: this.props.backgroundColor || '#ffffff',
                color: this.props.textColor || '#1f2937',
                cursor: 'pointer'
            };
        },

        dropdownMenuStyle() {
            const defaultGap = 8; // eslint-disable-line no-magic-numbers
            const gapObj = this.props.buttonGap || { size: defaultGap, unit: 'px' };
            const gap = `${gapObj.size}${gapObj.unit}`;

            return {
                display: 'flex',
                flexDirection: 'column',
                gap,
                marginTop: gap,
                padding: gap,
                backgroundColor: this.props.backgroundColor || '#ffffff',
                border: `1px solid ${this.props.textColor || '#1f2937'}`,
                borderRadius: this.props.borderRadius || '6px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            };
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
        async loadRoutes(retryDelay = 0) {
            this.loadAttempts += 1;

            // ВЕРСИЯ ВИДЖЕТА ДЛЯ ОТЛАДКИ
            console.log('[ElemRoutesNavigator] 🚀 Version: 2025-11-27-v2 | Attempt:', this.loadAttempts);

            // СНАЧАЛА пытаемся найти уже загруженный app.json в глобальных объектах
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

            // Попытка загрузить app.json из сети
            // Используем prop appJsonUrl в первую очередь, затем fallback пути
            const possiblePaths = [
                this.props.appJsonUrl || 'app.json',
                'app.json',
                './app.json',
                '/app.json',
                'config/app.json',
                '/config/app.json'
            ];

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

            // Все попытки исчерпаны - переходим в режим редактора
            console.log(`[ElemRoutesNavigator] ❌ Could not fetch app.json after ${this.loadAttempts} attempts. Running in editor mode with mock data.`);
            this.isPlayerMode = false;
            this.routes = [];
            return false;
        },

        detectCurrentSlug() {
            if (typeof window !== 'undefined') {
                this.currentSlug = window.location.pathname;
            }
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

        getButtonClass(route) {
            const classes = [];

            if (this.props.buttonStyle) {
                classes.push(`button-style-${this.props.buttonStyle}`);
            }

            if (this.isActive(route)) {
                classes.push('route-button-active');
            }

            return classes;
        },

        getButtonStyle(route, index) {
            const defaultPadding = 12; // eslint-disable-line no-magic-numbers
            const defaultFontSize = 14; // eslint-disable-line no-magic-numbers

            const paddingObj = this.props.buttonPadding || { size: defaultPadding, unit: 'px' };
            const padding = `${paddingObj.size}${paddingObj.unit}`;

            const fontSizeObj = this.props.fontSize || { size: defaultFontSize, unit: 'px' };
            const fontSize = `${fontSizeObj.size}${fontSizeObj.unit}`;

            const baseStyle = {
                padding,
                fontSize,
                borderRadius: this.props.borderRadius || '6px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: this.props.orientation === 'vertical' ? '100%' : 'auto',
                textAlign: 'left'
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
        }
    }
};
</script>

<style lang="pcss" scoped src="./style.pcss"></style>
