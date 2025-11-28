<template>
    <w-panel>
        <ui-container>
            <!-- Включить иерархию -->
            <ui-switch prop="enableHierarchy">Включить иерархию</ui-switch>

            <template v-if="props.enableHierarchy">
                <!-- Настройка навигации по родителям -->
                <ui-checkbox prop="navigateParents">Переходить по родителям</ui-checkbox>

                <hr>

                <!-- Список страниц с иерархией -->
                <div class="hierarchy-manager">
                    <div class="hierarchy-header">
                        <h4>Управление иерархией и порядком</h4>
                        <p class="hint">
                            • Перетащите НА элемент (центр) - сделать вложенной страницей<br>
                            • Перетащите ДО/ПОСЛЕ элемента (края) - изменить порядок
                        </p>
                    </div>

                    <!-- Отладка -->
                    <div v-if="!routes || routes.length === 0" style="padding: 1rem; background: #fef3c7; border-radius: 0.375rem; margin-bottom: 1rem;">
                        <p style="font-size: 0.75rem; color: #92400e;">
                            ⚠️ Страницы не загружены. Количество: {{ routes ? routes.length : 'undefined' }}
                        </p>
                        <p style="font-size: 0.75rem; color: #92400e; margin-top: 0.5rem;">
                            getRoutes: {{ getRoutes ? 'exists' : 'missing' }}
                        </p>
                    </div>

                    <div
                        v-for="(route, index) in hierarchicalRoutes"
                        :key="route.id || index"
                        class="route-item"
                        :class="{
                            'is-child': route.depth > 0,
                            'drag-over-before': dragOverRoute === route && dropTargetIndex === 'before',
                            'drag-over-after': dragOverRoute === route && dropTargetIndex === 'after',
                            'drag-over-on': dragOverRoute === route && dropTargetIndex === 'on'
                        }"
                        :style="{ paddingLeft: `${route.depth * 1.5}rem` }"
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
        dropTargetIndex: null
    }),

    async mounted() {
        // Загружаем routes при монтировании панели
        await this.loadRoutes();
    },

    computed: {

        // Иерархия из props
        hierarchy() {
            return this.props.hierarchy || {};
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
        }
    },

    methods: {
        /**
         * Загружает routes используя ту же логику что и основной виджет
         */
        async loadRoutes() {
            // Сначала проверяем глобальные объекты (режим плеера)
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
                    console.log('[ExpertPanel] Загружено routes из', source.name, ':', this.routes.length);
                    return;
                }
            }

            // Попытка загрузить app.json из сети (как в основном виджете)
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
                        console.log('[ExpertPanel] Загружено routes из app.json:', path, this.routes.length);
                        return;
                    }
                } catch (error) {
                    // Игнорируем ошибки
                }
            }

            // Если не удалось загрузить из app.json, парсим из DOM как fallback
            const domRoutes = this.parseRoutesFromDOM();
            if (domRoutes.length > 0) {
                this.routes = domRoutes;
                console.log('[ExpertPanel] Загружено routes из DOM (fallback):', this.routes.length);
                return;
            }

            console.warn('[ExpertPanel] Не удалось загрузить routes');
            this.routes = [];
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

        // Обновить иерархию через elapi
        updateHierarchy(newHierarchy) {
            this.elapi.updateProp('hierarchy', newHierarchy);
        },

        // Обновить порядок страниц через elapi
        updateRoutesOrder(newOrder) {
            this.elapi.updateProp('routesOrder', newOrder);
        }
    }
};
</script>

<style lang="pcss" scoped>
.hierarchy-manager {
    margin-top: 1rem;
}

.hierarchy-header {
    margin-bottom: 0.75rem;
}

.hierarchy-header h4 {
    font-size: 0.875rem;
    font-weight: 600;
    margin-bottom: 0.25rem;
}

.hierarchy-header .hint {
    font-size: 0.75rem;
    color: #6b7280;
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

.route-item.is-child {
    background: #eff6ff;
    border-color: #bfdbfe;
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
