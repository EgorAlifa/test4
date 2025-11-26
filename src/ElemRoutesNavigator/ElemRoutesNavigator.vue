<template>
    <w-elem :placeholder="$placeholder">
        <div class="routes-navigator-container" :style="containerStyle">
            <!-- Title -->
            <h2 v-if="props.showTitle && props.title" class="navigator-title" :style="titleStyle">
                {{ props.title }}
            </h2>

            <!-- Routes Navigation -->
            <nav class="routes-nav" :style="navStyle">
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
                    <span v-if="props.showIcons && route.icon" class="route-icon">
                        {{ route.icon }}
                    </span>
                    <span class="route-title">{{ route.title || route.name }}</span>
                    <span v-if="route.slug" class="route-slug">{{ route.slug }}</span>
                </button>
            </nav>

            <!-- Empty State -->
            <div v-if="displayRoutes.length === 0" class="empty-state">
                <p>Маршруты не найдены</p>
                <p class="empty-state-hint">
                    В режиме плеера виджет автоматически загрузит маршруты из app.json
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
        isPlayerMode: false
    }),

    computed: {
        displayRoutes() {
            // В режиме плеера показываем routes из app.json
            // В редакторе показываем mock данные
            if (this.routes.length > 0) {
                return this.routes;
            }

            // Mock данные для редактора
            return [
                {
                    id: 'mock-1',
                    title: 'Главная',
                    name: 'index',
                    slug: '/',
                    enabled: true,
                    icon: '🏠'
                },
                {
                    id: 'mock-2',
                    title: 'Страница 1',
                    name: 'page1',
                    slug: '/page1',
                    enabled: true,
                    icon: '📄'
                },
                {
                    id: 'mock-3',
                    title: 'Страница 2',
                    name: 'page2',
                    slug: '/page2',
                    enabled: true,
                    icon: '📋'
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
        }
    },

    mounted() {
        this.loadRoutes();
        this.detectCurrentSlug();
    },

    methods: {
        loadRoutes() {
            // Попытка получить routes из app.json через различные источники
            let appConfig = null;

            // Вариант 1: Глобальный объект window.__APP_CONFIG__
            if (typeof window !== 'undefined' && window.__APP_CONFIG__) {
                appConfig = window.__APP_CONFIG__;
            }

            // Вариант 2: Глобальный объект window.appConfig
            if (!appConfig && typeof window !== 'undefined' && window.appConfig) {
                appConfig = window.appConfig;
            }

            // Вариант 3: Попытка найти в window.goodt или других возможных местах
            if (!appConfig && typeof window !== 'undefined' && window.goodt && window.goodt.config) {
                appConfig = window.goodt.config;
            }

            // Если нашли конфиг с routes
            if (appConfig && appConfig.routes && Array.isArray(appConfig.routes)) {
                this.routes = appConfig.routes.filter(route => route.enabled !== false);
                this.isPlayerMode = true;
                console.log('[ElemRoutesNavigator] Loaded routes from app.json:', this.routes);
            } else {
                console.log('[ElemRoutesNavigator] Running in editor mode, using mock data');
                this.isPlayerMode = false;
            }
        },

        detectCurrentSlug() {
            if (typeof window !== 'undefined') {
                this.currentSlug = window.location.pathname;
            }
        },

        navigateToRoute(route) {
            if (!route.slug) {
                console.warn('[ElemRoutesNavigator] Route has no slug:', route);
                return;
            }

            this.currentSlug = route.slug;

            // Эмитим событие для родительских компонентов
            this.$emit('navigate', route);

            // В режиме плеера пытаемся реально перейти
            if (this.isPlayerMode && typeof window !== 'undefined') {
                // Проверяем наличие роутера
                if (this.$router) {
                    this.$router.push(route.slug);
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
