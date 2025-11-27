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
                    @click="isMenuOpen = !isMenuOpen"
                    type="button"
                    :style="dropdownToggleStyle"
                >
                    <span class="route-title">{{ props.dropdownText || 'Меню навигации' }}</span>
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
        pollingInterval: null,
        draggedIndex: null,
        dragOverIndex: null,
        isDragging: false,
        applicationData: null // Данные из API /api/application/{id}
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
                borderRadius: this.props.borderRadius || '6px',
                padding: '16px'
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

        // В редакторе запускаем периодический опрос данных
        if (!this.isPlayerMode) {
            this.startEditorDataPolling();
        }

        // Небольшая задержка перед показом чтобы не мелькали моки
        await new Promise(resolve => setTimeout(resolve, 100)); // eslint-disable-line no-magic-numbers
        this.isReady = true;
    },

    beforeDestroy() {
        // Останавливаем polling при удалении виджета
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
        }
    },

    methods: {
        /**
         * Получает ID приложения из глобальных переменных
         */
        getApplicationId() {
            if (typeof window === 'undefined') return null;

            // Пробуем разные источники
            const sources = [
                window.__APPLICATION_ID__,
                window.applicationId,
                window.appId,
                window.goodt?.applicationId,
                window.goodt?.appId
            ];

            for (const source of sources) {
                if (source) {
                    console.log('[ElemRoutesNavigator] Found application ID:', source);
                    return source;
                }
            }

            // Пробуем извлечь из URL
            const urlMatch = window.location.pathname.match(/\/application\/(\d+)/);
            if (urlMatch && urlMatch[1]) {
                console.log('[ElemRoutesNavigator] Extracted application ID from URL:', urlMatch[1]);
                return urlMatch[1];
            }

            console.warn('[ElemRoutesNavigator] Could not find application ID');
            return null;
        },

        /**
         * Получает данные приложения из API /api/application/{id}
         */
        async fetchApplicationData() {
            if (typeof window === 'undefined') return null;

            const appId = this.getApplicationId();
            if (!appId) {
                console.warn('[ElemRoutesNavigator] No application ID found, cannot fetch data');
                return null;
            }

            try {
                // Строим URL относительно текущего хоста
                const apiUrl = `/api/application/${appId}`;
                console.log('[ElemRoutesNavigator] Fetching application data from:', apiUrl);

                const response = await fetch(apiUrl);
                if (!response.ok) {
                    console.warn('[ElemRoutesNavigator] Failed to fetch application data:', response.status);
                    return null;
                }

                const result = await response.json();
                console.log('[ElemRoutesNavigator] Received application data:', result);

                // Парсим JSON из поля data
                if (result.data && typeof result.data === 'string') {
                    const appData = JSON.parse(result.data);
                    console.log('[ElemRoutesNavigator] Parsed application data:', appData);

                    // Сохраняем полные данные для последующего обновления
                    this.applicationData = {
                        meta: result.meta,
                        rawData: appData
                    };

                    // Извлекаем routes
                    if (appData.routes && Array.isArray(appData.routes)) {
                        console.log('[ElemRoutesNavigator] ✅ Found', appData.routes.length, 'routes in application data');
                        return appData.routes.filter(route => route.enabled !== false);
                    }
                }

                console.warn('[ElemRoutesNavigator] No routes found in application data');
                return null;
            } catch (error) {
                console.error('[ElemRoutesNavigator] Error fetching application data:', error);
                return null;
            }
        },

        /**
         * Запускает периодическое обновление данных в редакторе
         * Проверяет изменения каждые 3 секунды
         */
        startEditorDataPolling() {
            if (typeof window === 'undefined') return;

            const pollInterval = 3000; // 3 секунды

            const poll = async () => {
                const newRoutes = await this.fetchApplicationData();

                if (newRoutes && newRoutes.length > 0 && this.routesChanged(newRoutes)) {
                    this.routes = newRoutes;
                    console.log('[ElemRoutesNavigator] ✅ Routes updated from API:', this.routes.length);
                }
            };

            // Запускаем периодический опрос
            this.pollingInterval = setInterval(poll, pollInterval);
            console.log('[ElemRoutesNavigator] ✅ Started polling application data every', pollInterval, 'ms');
        },

        async loadRoutes(retryDelay = 0) {
            this.loadAttempts += 1;

            // ВЕРСИЯ ВИДЖЕТА ДЛЯ ОТЛАДКИ
            console.log('[ElemRoutesNavigator] 🚀 Version: 2025-11-27-v9-API | Attempt:', this.loadAttempts);

            // СНАЧАЛА проверяем, находимся ли мы в редакторе
            // Пробуем получить данные из API /api/application/{id}
            const editorRoutes = await this.fetchApplicationData();

            if (editorRoutes && editorRoutes.length > 0) {
                console.log('[ElemRoutesNavigator] 🎨 Editor mode detected, loaded from API');
                console.log('[ElemRoutesNavigator] ✅ Loaded', editorRoutes.length, 'routes from API');
                this.routes = editorRoutes;
                this.isPlayerMode = false;
                return true;
            }

            // Если не в редакторе, пытаемся загрузить app.json (режим плеера)
            console.log('[ElemRoutesNavigator] 🎮 Player mode detected, loading app.json...');
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

            // Все попытки исчерпаны - не удалось загрузить app.json в режиме плеера
            console.log(`[ElemRoutesNavigator] ❌ Could not fetch app.json after ${this.loadAttempts} attempts.`);
            console.log('[ElemRoutesNavigator] ⚠️ No routes found, widget will be empty');
            this.isPlayerMode = true; // Остаемся в режиме плеера, но без данных
            this.routes = [];
            return false;
        },

        detectCurrentSlug() {
            if (typeof window !== 'undefined') {
                this.currentSlug = window.location.pathname;
            }
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
                gap: '8px',
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
         * Обновляет порядок routes в applicationData и сохраняет через API
         */
        async updateRoutesOrder(fromIndex, toIndex) {
            if (!this.canReorder || !this.applicationData) return;

            try {
                console.log('[ElemRoutesNavigator] 🔄 Updating routes order:', fromIndex, '→', toIndex);

                // Обновляем порядок в applicationData.rawData.routes
                const routes = this.applicationData.rawData.routes;
                const movedRoute = routes[fromIndex];

                // Удаляем из старой позиции
                routes.splice(fromIndex, 1);
                // Вставляем в новую позицию
                routes.splice(toIndex, 0, movedRoute);

                // Обновляем applicationData
                this.applicationData.rawData.routes = routes;

                // Сохраняем изменения через API
                await this.saveApplicationData();

                console.log('[ElemRoutesNavigator] ✅ Routes order updated and saved');
            } catch (error) {
                console.error('[ElemRoutesNavigator] Error updating routes order:', error);
            }
        },

        /**
         * Сохраняет изменения applicationData обратно через API
         */
        async saveApplicationData() {
            if (!this.applicationData || !this.applicationData.meta) return;

            const appId = this.applicationData.meta.id;
            if (!appId) {
                console.warn('[ElemRoutesNavigator] No application ID, cannot save');
                return;
            }

            try {
                const apiUrl = `/api/application/${appId}`;
                console.log('[ElemRoutesNavigator] Saving application data to:', apiUrl);

                // Преобразуем rawData обратно в JSON-строку
                const dataString = JSON.stringify(this.applicationData.rawData);

                const response = await fetch(apiUrl, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        ...this.applicationData.meta,
                        data: dataString
                    })
                });

                if (!response.ok) {
                    console.error('[ElemRoutesNavigator] Failed to save application data:', response.status);
                    return;
                }

                console.log('[ElemRoutesNavigator] ✅ Application data saved successfully');
            } catch (error) {
                console.error('[ElemRoutesNavigator] Error saving application data:', error);
            }
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
        async onDrop(index, event) {
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

                // Сохраняем изменения в applicationData и через API
                await this.updateRoutesOrder(fromIndex, toIndex);
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
