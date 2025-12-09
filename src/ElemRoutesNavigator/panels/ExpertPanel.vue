<template>
    <w-panel>
        <ui-container>
            <!-- Включить иерархию -->
            <ui-switch prop="enableHierarchy">Включить иерархию</ui-switch>

            <template v-if="props.enableHierarchy">
                <!-- Настройка навигации по родителям -->
                <ui-checkbox prop="navigateParents">Переходить при клике на раздел</ui-checkbox>

                <!-- Настройки визуализации иерархии -->
                <div class="form-label form-label-small mt-3">Визуализация иерархии</div>
                <ui-input
                    type="number"
                    min="0.5"
                    max="5"
                    step="0.1"
                    prop="hierarchyIndent"
                    placeholder="2.5">
                    Отступ уровня (rem)
                </ui-input>

                <!-- Список страниц с иерархией -->
                <div class="hierarchy-manager">
                    <div class="hierarchy-header">
                        <h4>Управление иерархией и порядком</h4>
                        <div class="hint">
                            • Перетащите НА элемент (центр) - сделать вложенной страницей<br>
                            • Перетащите ДО/ПОСЛЕ элемента (края) - изменить порядок
                        </div>
                    </div>

                    <!-- Кнопка включения/выключения всех страниц -->
                    <button
                        class="btn-toggle-all-compact"
                        @click="toggleAllPages"
                        :title="allPagesEnabled ? 'Отключить все страницы' : 'Включить все страницы'">
                        {{ allPagesEnabled ? '✓ Выключить все' : '👁️ Включить все' }}
                    </button>

                    <div
                        v-for="(route, index) in hierarchicalRoutes"
                        :key="route.id || index"
                        class="route-item"
                        :class="{
                            'is-parent': route.depth === 0 && hasChildren(route),
                            'is-child': route.depth > 0,
                            'drag-over-before': dragOverRoute === route && dropTargetIndex === 'before',
                            'drag-over-after': dragOverRoute === route && dropTargetIndex === 'after',
                            'drag-over-on': dragOverRoute === route && dropTargetIndex === 'on',
                            'is-disabled': isRouteDisabled(route)
                        }"
                        :style="{ paddingLeft: `${Math.max(route.depth * 1.5, 0.5)}rem` }"
                        draggable="true"
                        @dragstart="onDragStart(route, $event)"
                        @dragover="onDragOver(route, $event)"
                        @drop="onDrop(route, $event)"
                        @dragend="onDragEnd"
                    >
                        <div class="route-content">
                            <span class="drag-handle">⋮⋮</span>
                            <span class="route-title">{{ route.title || route.name }}</span>
                            <span v-if="route.slug" class="route-slug">{{ route.slug }}</span>
                        </div>

                        <div class="route-actions">
                            <button
                                class="btn-small btn-toggle"
                                :class="{ 'is-disabled': isRouteDisabled(route) }"
                                @click="toggleRouteEnabled(route)"
                                :title="isRouteDisabled(route) ? 'Включить страницу' : 'Отключить страницу'"
                            >
                                {{ isRouteDisabled(route) ? '👁️' : '✓' }}
                            </button>
                            <button
                                v-if="route.depth === 0 && hasChildren(route)"
                                class="btn-small"
                                @click="removeAllChildren(route)"
                                title="Убрать всех детей"
                            >
                                ✕
                            </button>
                            <button
                                v-if="route.depth > 0"
                                class="btn-small"
                                @click="removeFromParent(route)"
                                title="Вынести на верхний уровень"
                            >
                                ↑
                            </button>
                        </div>
                    </div>
                </div>
            </template>
        </ui-container>
    </w-panel>
</template>

<script>
import { Panel } from '@goodt-wcore/panel';
import { PanelInstanceTypeDescriptor } from '../types';

export default {
    extends: Panel,

    meta: { name: 'Режим эксперта', icon: 'cog-outline' },

    data: () => ({
        ...PanelInstanceTypeDescriptor,
        draggedRoute: null,
        dragOverRoute: null,
        routes: [],
        dropTargetIndex: null,
        storeUnsubscribe: null, // Функция отписки от Vuex store
        routesReloadDebounce: null // Таймер debounce для перезагрузки
    }),

    async mounted() {
        // Загружаем routes при монтировании панели
        await this.loadRoutes();

        // Настраиваем отслеживание изменений в Vuex store
        this.setupRoutesObserver();
    },

    beforeDestroy() {
        // Отписываемся от Vuex store при размонтировании
        if (this.storeUnsubscribe) {
            this.storeUnsubscribe();
            this.storeUnsubscribe = null;
        }

        // Очищаем таймер debounce
        if (this.routesReloadDebounce) {
            clearTimeout(this.routesReloadDebounce);
            this.routesReloadDebounce = null;
        }
    },

    watch: {
        // Следим за изменением enableHierarchy
        'props.enableHierarchy'(newValue, oldValue) {
            // Если иерархия выключается (было true, стало false)
            if (oldValue === true && newValue === false) {
                // Сбрасываем все настройки иерархии
                this.resetHierarchySettings();
            }
        }
    },

    computed: {

        // Иерархия из props
        hierarchy() {
            return this.props.hierarchy || {};
        },

        // Отключенные страницы из props
        disabledPages() {
            return this.props.disabledPages || [];
        },

        // Построение иерархического списка для отображения
        hierarchicalRoutes() {
            const routes = this.routes;
            const hierarchy = this.hierarchy;

            // Добавляем depth и parent информацию к каждому route
            const enriched = routes.map(route => {
                const routeId = route.id || route.pageId;
                const parentId = hierarchy[routeId];

                return {
                    ...route,
                    parentId,
                    depth: this.calculateDepth(routeId, hierarchy)
                };
            });

            // Сортируем: сначала родители, потом дети
            return this.sortByHierarchy(enriched);
        },

        // Проверяем все ли страницы включены
        allPagesEnabled() {
            if (this.routes.length === 0) return true;

            // Проверяем, есть ли хоть одна отключенная страница
            return this.routes.every(route => {
                const routeId = route.id || route.pageId;
                return !this.disabledPages.includes(routeId);
            });
        }
    },

    methods: {
        /**
         * Загружает routes из Vuex store (приоритет) или fallback на app.json
         */
        async loadRoutes() {
            // Приоритет 1: Загружаем из Vuex store
            const routesFromStore = this.loadRoutesFromVuexStore();
            if (routesFromStore && routesFromStore.length > 0) {
                this.routes = routesFromStore;
                return;
            }

            // Приоритет 2: Проверяем глобальные объекты (режим плеера)
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
                    this.routes = source.value.routes.filter(route => route.enabled !== false);
                    return;
                }
            }

            // Приоритет 3: Попытка загрузить app.json из сети (fallback)
            const smartUrl = this.buildAppJsonUrl();
            const possiblePaths = [
                this.props.appJsonUrl,
                smartUrl,
                'app.json',
                './app.json',
                '/app.json'
            ].filter(Boolean);

            const uniquePaths = [...new Set(possiblePaths)];

            for (const path of uniquePaths) {
                try {
                    const response = await fetch(path);
                    if (!response.ok) continue;

                    const appConfig = await response.json();
                    if (appConfig && appConfig.routes && Array.isArray(appConfig.routes)) {
                        this.routes = appConfig.routes.filter(route => route.enabled !== false);
                        return;
                    }
                } catch (error) {
                    // Игнорируем ошибки
                }
            }

            // Приоритет 4: Парсим из DOM как последний fallback
            const domRoutes = this.parseRoutesFromDOM();
            if (domRoutes.length > 0) {
                this.routes = domRoutes;
                return;
            }

            this.routes = [];
        },

        /**
         * Загружает routes напрямую из Vuex store
         * @returns {Array|null} - Массив routes или null
         */
        loadRoutesFromVuexStore() {
            try {
                let store = null;

                // Ищем store различными способами
                if (this.$store) {
                    store = this.$store;
                } else if (this.$root?.$store) {
                    store = this.$root.$store;
                } else if (typeof window !== 'undefined') {
                    if (window.$nuxt?.$store) {
                        store = window.$nuxt.$store;
                    } else if (window.__NUXT__?.$store) {
                        store = window.__NUXT__.$store;
                    } else if (window.__VUE__?.$store) {
                        store = window.__VUE__.$store;
                    }
                }

                if (!store || !store.state) {
                    return null;
                }

                const state = store.state;

                // Пытаемся получить routes из state.app.app.data.routes (основной путь)
                const possiblePaths = [
                    () => state?.app?.app?.data?.routes,
                    () => state?.app?.data?.routes,
                    () => state?.app?.routes,
                    () => state?.editor?.data?.routes,
                    () => state?.editor?.routes,
                    () => state?.routes
                ];

                for (const pathFn of possiblePaths) {
                    try {
                        const routes = pathFn();
                        if (routes && Array.isArray(routes) && routes.length > 0) {
                            return routes.filter(route => route.enabled !== false);
                        }
                    } catch (error) {
                        continue;
                    }
                }

                return null;
            } catch (error) {
                return null;
            }
        },

        /**
         * Строит URL для app.json (копия из основного виджета)
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
                    return `${baseUrl}/player/${appId}/app.json`;
                }
            }

            // Fallback: добавляем /app.json к текущему URL
            return `${window.location.origin}${currentPath}/app.json`.replace(/\/+/g, '/').replace(':/', '://');
        },

        /**
         * Получает ID приложения из URL (копия из основного виджета)
         */
        getApplicationId() {
            if (typeof window === 'undefined') return null;

            const urlPatterns = [
                /\/apps\/edit\/(\d+)/,
                /\/application\/(\d+)/
            ];

            for (const pattern of urlPatterns) {
                const urlMatch = window.location.pathname.match(pattern);
                if (urlMatch && urlMatch[1]) {
                    return urlMatch[1];
                }
            }

            return null;
        },

        /**
         * Парсит routes из DOM в режиме редактора
         * Копия метода из основного виджета
         */
        parseRoutesFromDOM() {
            if (typeof window === 'undefined') return [];

            // В режиме редактора виджет находится в iframe, а список страниц в родительском документе
            const doc = window.parent && window.parent.document ? window.parent.document : document;

            const routes = [];
            const pageItems = doc.querySelectorAll('.page-item[id]');

            pageItems.forEach(item => {
                const pageId = item.getAttribute('id');

                // Пропускаем элементы без валидного UUID
                if (!pageId || !pageId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
                    return;
                }

                // Ищем title и slug внутри элемента
                const titleEl = item.querySelector('[title]');
                const slugEl = item.querySelector('.page-item__slug .text-truncate');

                const title = titleEl ? titleEl.getAttribute('title') : `Page ${pageId.substring(0, 8)}`;
                const slug = slugEl ? slugEl.textContent.trim() : `/${pageId}`;

                routes.push({
                    id: pageId,
                    pageId,
                    title,
                    slug,
                    name: title,
                    enabled: true
                });
            });

            return routes;
        },

        // Проверяет отключена ли страница
        isRouteDisabled(route) {
            const routeId = route.id || route.pageId;
            return this.disabledPages.includes(routeId);
        },

        // Переключает enabled/disabled состояние страницы
        toggleRouteEnabled(route) {
            const routeId = route.id || route.pageId;
            const newDisabledPages = [...this.disabledPages];

            const index = newDisabledPages.indexOf(routeId);
            if (index !== -1) {
                // Страница отключена, включаем
                newDisabledPages.splice(index, 1);
            } else {
                // Страница включена, отключаем
                newDisabledPages.push(routeId);
            }

            this.updateDisabledPages(newDisabledPages);
        },

        // Переключает все страницы (включить/выключить все)
        toggleAllPages() {
            if (this.allPagesEnabled) {
                // Все включены - отключаем все
                const allRouteIds = this.routes.map(route => route.id || route.pageId);
                this.updateDisabledPages(allRouteIds);
            } else {
                // Есть отключенные - включаем все
                this.updateDisabledPages([]);
            }
        },

        // Вычисляем глубину вложенности
        calculateDepth(routeId, hierarchy, visited = new Set()) {
            if (visited.has(routeId)) return 0; // Защита от циклов

            const parentId = hierarchy[routeId];
            if (!parentId) return 0;

            visited.add(routeId);
            return 1 + this.calculateDepth(parentId, hierarchy, visited);
        },

        // Сортировка по иерархии (родители перед детьми) с учетом кастомного порядка
        sortByHierarchy(routes) {
            const result = [];
            const routeMap = new Map(routes.map(r => [(r.id || r.pageId), r]));
            const processed = new Set();
            const customOrder = this.props.routesOrder || [];

            const addRoute = (route) => {
                const routeId = route.id || route.pageId;
                if (processed.has(routeId)) return;

                processed.add(routeId);
                result.push(route);

                // Добавляем детей с учетом кастомного порядка
                let children = routes.filter(r => {
                    const rId = r.id || r.pageId;
                    return r.parentId === routeId && !processed.has(rId);
                });

                // Сортируем детей по кастомному порядку если он есть
                if (customOrder.length > 0) {
                    children = children.sort((a, b) => {
                        const aId = a.id || a.pageId;
                        const bId = b.id || b.pageId;
                        const aIndex = customOrder.indexOf(aId);
                        const bIndex = customOrder.indexOf(bId);

                        if (aIndex === -1 && bIndex === -1) return 0;
                        if (aIndex === -1) return 1;
                        if (bIndex === -1) return -1;
                        return aIndex - bIndex;
                    });
                }

                children.forEach(child => addRoute(child));
            };

            // Получаем корневые элементы
            let rootRoutes = routes.filter(r => !r.parentId);

            // Сортируем корневые элементы по кастомному порядку
            if (customOrder.length > 0) {
                rootRoutes = rootRoutes.sort((a, b) => {
                    const aId = a.id || a.pageId;
                    const bId = b.id || b.pageId;
                    const aIndex = customOrder.indexOf(aId);
                    const bIndex = customOrder.indexOf(bId);

                    if (aIndex === -1 && bIndex === -1) return 0;
                    if (aIndex === -1) return 1;
                    if (bIndex === -1) return -1;
                    return aIndex - bIndex;
                });
            }

            rootRoutes.forEach(route => addRoute(route));

            return result;
        },

        // Проверяем есть ли у route дети
        hasChildren(route) {
            const routeId = route.id || route.pageId;
            return Object.values(this.hierarchy).includes(routeId);
        },

        // Drag and drop handlers
        onDragStart(route, event) {
            this.draggedRoute = route;
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData('text/html', event.target.innerHTML);
        },

        onDragOver(route, event) {
            if (!this.draggedRoute) return;

            event.preventDefault();
            event.dataTransfer.dropEffect = 'move';
            this.dragOverRoute = route;

            // Определяем зону drop: верхняя половина, нижняя половина или на элемент
            const rect = event.currentTarget.getBoundingClientRect();
            const y = event.clientY - rect.top;
            const height = rect.height;

            if (y < height * 0.25) {
                this.dropTargetIndex = 'before';
            } else if (y > height * 0.75) {
                this.dropTargetIndex = 'after';
            } else {
                this.dropTargetIndex = 'on';
            }
        },

        onDrop(targetRoute, event) {
            event.preventDefault();

            if (!this.draggedRoute || this.draggedRoute === targetRoute) {
                this.draggedRoute = null;
                this.dragOverRoute = null;
                this.dropTargetIndex = null;
                return;
            }

            const draggedId = this.draggedRoute.id || this.draggedRoute.pageId;
            const targetId = targetRoute.id || targetRoute.pageId;

            // Не даем создать цикл (перетащить родителя на ребенка)
            if (this.isDescendant(targetId, draggedId)) {
                this.draggedRoute = null;
                this.dragOverRoute = null;
                this.dropTargetIndex = null;
                return;
            }

            if (this.dropTargetIndex === 'on') {
                // Перетащили НА элемент - создаем иерархию (делаем ребенком)
                const newHierarchy = { ...this.hierarchy };
                newHierarchy[draggedId] = targetId;
                this.updateHierarchy(newHierarchy);
            } else {
                // Перетащили ДО или ПОСЛЕ элемента - изменяем порядок
                this.reorderRoutes(this.draggedRoute, targetRoute, this.dropTargetIndex);
            }

            this.draggedRoute = null;
            this.dragOverRoute = null;
            this.dropTargetIndex = null;
        },

        onDragEnd() {
            this.draggedRoute = null;
            this.dragOverRoute = null;
            this.dropTargetIndex = null;
        },

        /**
         * Изменяет порядок страниц
         */
        reorderRoutes(draggedRoute, targetRoute, position) {
            const draggedId = draggedRoute.id || draggedRoute.pageId;
            const targetId = targetRoute.id || targetRoute.pageId;

            // Получаем текущий порядок или создаем новый из routes
            let currentOrder = [...(this.props.routesOrder || [])];

            // Если порядок пустой, создаем из текущих routes
            if (currentOrder.length === 0) {
                currentOrder = this.hierarchicalRoutes.map(r => r.id || r.pageId);
            }

            // Удаляем draggedId из текущей позиции
            const draggedIndex = currentOrder.indexOf(draggedId);
            if (draggedIndex !== -1) {
                currentOrder.splice(draggedIndex, 1);
            }

            // Находим позицию targetId
            const targetIndex = currentOrder.indexOf(targetId);

            if (targetIndex === -1) {
                // Если target не в списке, добавляем в конец
                currentOrder.push(draggedId);
            } else {
                // Вставляем draggedId до или после targetId
                const insertIndex = position === 'before' ? targetIndex : targetIndex + 1;
                currentOrder.splice(insertIndex, 0, draggedId);
            }

            // Обновляем prop
            this.updateRoutesOrder(currentOrder);
        },

        // Проверка является ли потомком
        isDescendant(childId, ancestorId) {
            let currentId = childId;
            const visited = new Set();

            while (currentId && !visited.has(currentId)) {
                if (currentId === ancestorId) return true;
                visited.add(currentId);
                currentId = this.hierarchy[currentId];
            }

            return false;
        },

        // Убрать route из родителя
        removeFromParent(route) {
            const routeId = route.id || route.pageId;
            const newHierarchy = { ...this.hierarchy };
            delete newHierarchy[routeId];
            this.updateHierarchy(newHierarchy);
        },

        // Убрать всех детей у родителя
        removeAllChildren(route) {
            const routeId = route.id || route.pageId;
            const newHierarchy = { ...this.hierarchy };

            // Находим всех детей
            Object.keys(newHierarchy).forEach(childId => {
                if (newHierarchy[childId] === routeId) {
                    delete newHierarchy[childId];
                }
            });

            this.updateHierarchy(newHierarchy);
        },

        // Обновить иерархию
        updateHierarchy(newHierarchy) {
            // Используем Vue.$set для реактивного обновления
            this.$set(this.props, 'hierarchy', newHierarchy);
            // Принудительно вызываем propChanged для уведомления системы
            this.propChanged('hierarchy');
        },

        // Обновить порядок страниц
        updateRoutesOrder(newOrder) {
            // Используем Vue.$set для реактивного обновления
            this.$set(this.props, 'routesOrder', newOrder);
            // Принудительно вызываем propChanged для уведомления системы
            this.propChanged('routesOrder');
        },

        // Обновить список отключенных страниц
        updateDisabledPages(newDisabledPages) {
            // Используем Vue.$set для реактивного обновления
            this.$set(this.props, 'disabledPages', newDisabledPages);
            // Принудительно вызываем propChanged для уведомления системы
            this.propChanged('disabledPages');
        },

        // Сбросить все настройки иерархии
        resetHierarchySettings() {
            // Включаем все страницы (очищаем disabledPages)
            this.updateDisabledPages([]);

            // Сбрасываем порядок к исходному (очищаем routesOrder)
            this.updateRoutesOrder([]);

            // Сбрасываем иерархию (очищаем hierarchy)
            this.updateHierarchy({});
        },

        /**
         * Настраивает отслеживание изменений routes в Vuex store
         * Аналогично основному виджету, но без лишних console.log
         */
        setupRoutesObserver() {
            if (typeof window === 'undefined') {
                return;
            }

            const trySetupStoreWatcher = () => {
                try {
                    let store = null;

                    // 1. Проверяем компонент (this.$store)
                    if (this.$store) {
                        store = this.$store;
                    }

                    // 2. Проверяем корневой компонент (this.$root.$store)
                    if (!store && this.$root?.$store) {
                        store = this.$root.$store;
                    }

                    // 3. Проверяем текущее окно
                    if (!store) {
                        if (window.$nuxt?.$store) {
                            store = window.$nuxt.$store;
                        } else if (window.__NUXT__?.$store) {
                            store = window.__NUXT__.$store;
                        } else if (window.__VUE__?.$store) {
                            store = window.__VUE__.$store;
                        }
                    }

                    // 4. Проверяем parent window (если в iframe)
                    if (!store && window.parent && window !== window.parent) {
                        if (window.parent.$nuxt?.$store) {
                            store = window.parent.$nuxt.$store;
                        } else if (window.parent.__NUXT__?.$store) {
                            store = window.parent.__NUXT__.$store;
                        } else if (window.parent.__VUE__?.$store) {
                            store = window.parent.__VUE__.$store;
                        }

                        // 5. Ищем через корневой элемент приложения в parent
                        if (!store) {
                            try {
                                const appEl = window.parent.document.getElementById('app') ||
                                              window.parent.document.querySelector('[data-app]') ||
                                              window.parent.document.querySelector('#__nuxt');

                                if (appEl && appEl.__vue__) {
                                    store = appEl.__vue__.$store;
                                }
                            } catch (err) {
                                // Игнорируем ошибки доступа к parent.document
                            }
                        }
                    }

                    // 6. Ищем через DOM элементы текущего окна
                    if (!store) {
                        const appEl = document.getElementById('app') ||
                                      document.querySelector('[data-app]') ||
                                      document.querySelector('#__nuxt');

                        if (appEl && appEl.__vue__) {
                            store = appEl.__vue__.$store;
                        }
                    }

                    if (!store) {
                        return false;
                    }

                    // Подписываемся на изменения в store
                    this.storeUnsubscribe = store.subscribe((mutation, state) => {
                        // Ищем мутации связанные с routes
                        const mutationType = mutation.type.toLowerCase();
                        if (mutationType.includes('route') ||
                            mutationType.includes('page') ||
                            mutationType.includes('setroutes')) {

                            // Используем debounce для избежания множественных обновлений
                            if (this.routesReloadDebounce) {
                                clearTimeout(this.routesReloadDebounce);
                            }

                            this.routesReloadDebounce = setTimeout(() => {
                                this.reloadRoutesFromStore(store, state);
                            }, 300); // eslint-disable-line no-magic-numbers
                        }
                    });

                    return true;
                } catch (error) {
                    return false;
                }
            };

            // Пытаемся настроить watcher сразу
            if (trySetupStoreWatcher()) {
                return;
            }

            // Если не получилось, пробуем через небольшой интервал
            let attempts = 0;
            const maxAttempts = 10; // eslint-disable-line no-magic-numbers
            const interval = setInterval(() => {
                attempts++;

                if (trySetupStoreWatcher() || attempts >= maxAttempts) {
                    clearInterval(interval);
                }
            }, 500); // eslint-disable-line no-magic-numbers
        },

        /**
         * Перезагружает список routes из Vuex store
         * @param {Object} store - Vuex store
         * @param {Object} state - Состояние store
         */
        async reloadRoutesFromStore(store, state) {
            try {
                // Пытаемся получить routes из разных возможных путей в state
                const possiblePaths = [
                    { name: 'state.app.app.data.routes', fn: () => state?.app?.app?.data?.routes },
                    { name: 'state.app.data.routes', fn: () => state?.app?.data?.routes },
                    { name: 'state.app.routes', fn: () => state?.app?.routes },
                    { name: 'state.editor.data.routes', fn: () => state?.editor?.data?.routes },
                    { name: 'state.editor.routes', fn: () => state?.editor?.routes },
                    { name: 'state.routes', fn: () => state?.routes }
                ];

                let newRoutes = null;

                for (const path of possiblePaths) {
                    try {
                        const routes = path.fn();
                        if (routes && Array.isArray(routes)) {
                            newRoutes = routes.filter(route => route.enabled !== false);
                            break;
                        }
                    } catch (error) {
                        continue;
                    }
                }

                if (!newRoutes || newRoutes.length === 0) {
                    return;
                }

                // Проверяем, изменились ли routes
                const oldRoutesCount = this.routes.length;
                const hasChanges = newRoutes.length !== oldRoutesCount ||
                    JSON.stringify(newRoutes.map(r => r.slug)) !== JSON.stringify(this.routes.map(r => r.slug));

                if (hasChanges) {
                    // Обновляем routes
                    this.$set(this, 'routes', newRoutes);

                    // Очищаем иерархию от ссылок на удаленные страницы
                    this.cleanupHierarchy(newRoutes);

                    this.$forceUpdate();
                }
            } catch (error) {
                // Игнорируем ошибки
            }
        },

        /**
         * Очищает иерархию от ссылок на несуществующие страницы
         * @param {Array} routes - Актуальный список routes
         */
        cleanupHierarchy(routes) {
            const hierarchy = this.props.hierarchy || {};

            // Если иерархия пустая, ничего не делаем
            if (Object.keys(hierarchy).length === 0) {
                return;
            }

            // Создаем Set из существующих ID для быстрого поиска
            const existingIds = new Set(routes.map(r => r.id || r.pageId));

            // Создаем новую иерархию, удаляя ссылки на несуществующие страницы
            const newHierarchy = {};
            let hasChanges = false;

            Object.keys(hierarchy).forEach(childId => {
                const parentId = hierarchy[childId];

                // Проверяем что и child и parent существуют в routes
                if (existingIds.has(childId) && existingIds.has(parentId)) {
                    newHierarchy[childId] = parentId;
                } else {
                    // Страница удалена, не добавляем в новую иерархию
                    hasChanges = true;
                }
            });

            // Если были изменения, обновляем иерархию
            if (hasChanges) {
                this.updateHierarchy(newHierarchy);
            }
        }
    }
};
</script>

<style lang="pcss" scoped>
.hierarchy-manager {
    margin-top: 0.75rem;
}

.hierarchy-header {
    margin-bottom: 0.75rem;
}

.hierarchy-header h4 {
    font-size: 0.875rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
}

.hierarchy-header .hint {
    font-size: 0.75rem;
    color: #9ca3af;
    line-height: 1.5;
    opacity: 0.85;
}

.route-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 0.75rem;
    margin-bottom: 0.25rem;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 0.375rem;
    cursor: move;
    transition: all 0.2s;
}

.route-item:hover {
    background: #f3f4f6;
    border-color: #d1d5db;
}

.route-item.is-parent {
    background: #f0fdf4;
    border-color: #bbf7d0;
}

.route-item.is-child {
    background: #eff6ff;
    border-color: #bfdbfe;
}

.route-item.is-disabled {
    opacity: 0.5;
    background: #f3f4f6;
}

.route-item.is-disabled .route-title {
    text-decoration: line-through;
    color: #9ca3af;
}

.route-content {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex: 1;
    min-width: 0;
}

.drag-handle {
    color: #9ca3af;
    cursor: grab;
    user-select: none;
}

.route-title {
    font-weight: 500;
    color: #1f2937;
}

.route-slug {
    font-size: 0.75rem;
    color: #6b7280;
}

.route-actions {
    display: flex;
    gap: 0.25rem;
}

.btn-small {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
    background: white;
    border: 1px solid #d1d5db;
    border-radius: 0.25rem;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-small:hover {
    background: #f3f4f6;
    border-color: #9ca3af;
}

.btn-toggle.is-disabled {
    background: #fee;
    border-color: #fca5a5;
}

/* Кнопка включения/выключения всех страниц */
.btn-toggle-all-compact {
    width: 100%;
    padding: 0.375rem 0.5rem;
    margin-bottom: 0.75rem;
    font-size: 0.75rem;
    font-weight: 500;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 0.25rem;
    cursor: pointer;
    transition: all 0.15s;
    text-align: center;
}

.btn-toggle-all-compact:hover {
    background: #2563eb;
}

.btn-toggle-all-compact:active {
    background: #1d4ed8;
}

/* Drag and drop визуальные индикаторы */
.route-item.drag-over-before {
    border-top: 3px solid #3b82f6;
}

.route-item.drag-over-after {
    border-bottom: 3px solid #3b82f6;
}

.route-item.drag-over-on {
    background: #dbeafe !important;
    border-color: #3b82f6 !important;
    border-width: 2px;
}
</style>
