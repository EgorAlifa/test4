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
                        <h4>Управление иерархией</h4>
                        <p class="hint">Перетащите страницу на родителя чтобы сделать ее вложенной</p>
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
                        :class="{ 'is-child': route.depth > 0 }"
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
        dragOverRoute: null
    }),

    computed: {
        // Получаем routes напрямую из глобальных объектов (как в основном компоненте)
        routes() {
            // Проверяем глобальные объекты window
            const globalSources = [
                typeof window !== 'undefined' ? window.__APP_CONFIG__ : null,
                typeof window !== 'undefined' ? window.appConfig : null,
                typeof window !== 'undefined' ? window.APP_CONFIG : null,
                typeof window !== 'undefined' ? window.$appConfig : null,
                typeof window !== 'undefined' && window.goodt ? window.goodt.config : null,
                typeof window !== 'undefined' && window.goodt ? window.goodt.appConfig : null
            ];

            for (const source of globalSources) {
                if (source && source.routes && Array.isArray(source.routes)) {
                    return source.routes.filter(route => route.enabled !== false);
                }
            }

            return [];
        },

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
        // Вычисляем глубину вложенности
        calculateDepth(routeId, hierarchy, visited = new Set()) {
            if (visited.has(routeId)) return 0; // Защита от циклов

            const parentId = hierarchy[routeId];
            if (!parentId) return 0;

            visited.add(routeId);
            return 1 + this.calculateDepth(parentId, hierarchy, visited);
        },

        // Сортировка по иерархии (родители перед детьми)
        sortByHierarchy(routes) {
            const result = [];
            const routeMap = new Map(routes.map(r => [(r.id || r.pageId), r]));
            const processed = new Set();

            const addRoute = (route) => {
                const routeId = route.id || route.pageId;
                if (processed.has(routeId)) return;

                processed.add(routeId);
                result.push(route);

                // Добавляем детей
                const children = routes.filter(r => {
                    const rId = r.id || r.pageId;
                    return r.parentId === routeId && !processed.has(rId);
                });

                children.forEach(child => addRoute(child));
            };

            // Сначала добавляем корневые элементы
            routes.filter(r => !r.parentId).forEach(route => addRoute(route));

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
        },

        onDrop(targetRoute, event) {
            event.preventDefault();

            if (!this.draggedRoute || this.draggedRoute === targetRoute) {
                return;
            }

            const draggedId = this.draggedRoute.id || this.draggedRoute.pageId;
            const targetId = targetRoute.id || targetRoute.pageId;

            // Не даем создать цикл (перетащить родителя на ребенка)
            if (this.isDescendant(targetId, draggedId)) {
                return;
            }

            // Обновляем иерархию
            const newHierarchy = { ...this.hierarchy };
            newHierarchy[draggedId] = targetId;

            this.updateHierarchy(newHierarchy);

            this.draggedRoute = null;
            this.dragOverRoute = null;
        },

        onDragEnd() {
            this.draggedRoute = null;
            this.dragOverRoute = null;
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
</style>
