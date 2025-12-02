<template>
    <w-elem :placeholder="$placeholder">
        <div v-if="isReady" class="routes-navigator-container" :style="containerStyle">
            <!-- Title -->
            <h2 v-if="props.showTitle && props.title" class="navigator-title" :style="titleStyle">
                {{ props.title }}
            </h2>

            <!-- Dropdown -->
            <nav
                v-if="props.orientation === 'dropdown'"
                class="routes-nav-dropdown"
            >
                <button
                    class="dropdown-toggle"
                    :class="{ 'dropdown-toggle-open': isMenuOpen }"
                    @click="props.openMode === 'click' && toggleMenu()"
                    @mouseenter="props.openMode === 'hover' && openMenu()"
                    @mouseleave="props.openMode === 'hover' && scheduleCloseMenu()"
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
                    @mouseleave="props.openMode === 'hover' && scheduleCloseMenu()"
                >
                    <button
                        v-for="(route, index) in displayRoutes"
                        :key="route.id || index"
                        class="route-button"
                        :class="getButtonClass(route)"
                        :style="getButtonStyle(route, index)"
                        @click="props.enableHierarchy ? handleRouteClick(route) : navigateToRoute(route); isMenuOpen = false"
                        @mouseenter="hoveredIndex = index"
                        @mouseleave="hoveredIndex = null"
                        type="button"
                    >
                        <span
                            v-if="props.enableHierarchy && route.hasChildren"
                            class="expand-icon"
                            :style="{ fontSize: props.expandIconSize || '0.75rem' }"
                            @click.stop="toggleRouteExpansion(route)"
                        >
                            <!-- MDI иконки если указаны -->
                            <template v-if="props.expandIconExpanded && props.expandIconCollapsed">
                                <i v-if="route.isExpanded" :class="props.expandIconExpanded" class="mdi"></i>
                                <i v-else :class="props.expandIconCollapsed" class="mdi"></i>
                            </template>
                            <!-- Дефолтные символы -->
                            <template v-else>
                                {{ route.isExpanded ? '▼' : '▶' }}
                            </template>
                        </span>
                        <span class="route-title">{{ route.title || route.name }}</span>
                        <span v-if="props.showSlug && route.slug" class="route-slug">{{ route.slug }}</span>
                    </button>

                    <!-- Pagination Controls for dropdown -->
                    <div
                        v-if="props.enablePagination && props.paginationType === 'pages' && totalPages > 1"
                        class="pagination-controls"
                        :style="paginationControlsStyle"
                    >
                        <button
                            v-for="page in totalPages"
                            :key="page"
                            class="pagination-button"
                            :class="{ 'pagination-button-active': page === currentPage }"
                            :style="getPaginationButtonStyle(page)"
                            @click="goToPage(page)"
                            type="button"
                        >
                            {{ page }}
                        </button>
                    </div>
                </div>
            </nav>

            <!-- Burger Menu (Hamburger) -->
            <nav
                v-else-if="props.orientation === 'burger'"
                class="routes-nav-burger"
            >
                <button
                    class="burger-toggle"
                    :class="{ 'burger-toggle-open': isMenuOpen }"
                    @click="props.openMode === 'click' && toggleMenu()"
                    @mouseenter="props.openMode === 'hover' && openMenu()"
                    @mouseleave="props.openMode === 'hover' && scheduleCloseMenu()"
                    type="button"
                    :style="burgerToggleStyle"
                >
                    <!-- MDI иконки если указаны -->
                    <template v-if="props.burgerIconOpen && props.burgerIconClosed">
                        <i v-if="isMenuOpen" :class="props.burgerIconOpen" class="mdi burger-icon" :style="{ fontSize: props.burgerIconSize || '1.5rem' }"></i>
                        <i v-else :class="props.burgerIconClosed" class="mdi burger-icon" :style="{ fontSize: props.burgerIconSize || '1.5rem' }"></i>
                    </template>
                    <!-- Дефолтные линии -->
                    <template v-else>
                        <span class="burger-line"></span>
                        <span class="burger-line"></span>
                        <span class="burger-line"></span>
                    </template>
                </button>
                <div
                    v-if="isMenuOpen"
                    class="burger-menu"
                    :style="burgerMenuStyle"
                    @mouseenter="props.openMode === 'hover' && openMenu()"
                    @mouseleave="props.openMode === 'hover' && scheduleCloseMenu()"
                >
                    <button
                        v-for="(route, index) in displayRoutes"
                        :key="route.id || index"
                        class="route-button"
                        :class="getButtonClass(route)"
                        :style="getButtonStyle(route, index)"
                        @click="props.enableHierarchy ? handleRouteClick(route) : navigateToRoute(route); isMenuOpen = false"
                        @mouseenter="hoveredIndex = index"
                        @mouseleave="hoveredIndex = null"
                        type="button"
                    >
                        <span
                            v-if="props.enableHierarchy && route.hasChildren"
                            class="expand-icon"
                            :style="{ fontSize: props.expandIconSize || '0.75rem' }"
                            @click.stop="toggleRouteExpansion(route)"
                        >
                            <!-- MDI иконки если указаны -->
                            <template v-if="props.expandIconExpanded && props.expandIconCollapsed">
                                <i v-if="route.isExpanded" :class="props.expandIconExpanded" class="mdi"></i>
                                <i v-else :class="props.expandIconCollapsed" class="mdi"></i>
                            </template>
                            <!-- Дефолтные символы -->
                            <template v-else>
                                {{ route.isExpanded ? '▼' : '▶' }}
                            </template>
                        </span>
                        <span class="route-title">{{ route.title || route.name }}</span>
                        <span v-if="props.showSlug && route.slug" class="route-slug">{{ route.slug }}</span>
                    </button>

                    <!-- Pagination Controls for burger menu -->
                    <div
                        v-if="props.enablePagination && props.paginationType === 'pages' && totalPages > 1"
                        class="pagination-controls"
                        :style="paginationControlsStyle"
                    >
                        <button
                            v-for="page in totalPages"
                            :key="page"
                            class="pagination-button"
                            :class="{ 'pagination-button-active': page === currentPage }"
                            :style="getPaginationButtonStyle(page)"
                            @click="goToPage(page)"
                            type="button"
                        >
                            {{ page }}
                        </button>
                    </div>
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
                    @click="props.enableHierarchy ? handleRouteClick(route) : navigateToRoute(route)"
                    @mouseenter="hoveredIndex = index"
                    @mouseleave="hoveredIndex = null"
                    @dragstart="onDragStart(index, $event)"
                    @dragover="onDragOver(index, $event)"
                    @drop="onDrop(index, $event)"
                    @dragend="onDragEnd"
                    type="button"
                >
                    <span v-if="canReorder" class="drag-handle" @mousedown.stop>⋮⋮</span>
                    <span
                        v-if="props.enableHierarchy && route.hasChildren"
                        class="expand-icon"
                        @click.stop="toggleRouteExpansion(route)"
                    >
                        <!-- MDI иконки если указаны -->
                        <template v-if="props.expandIconExpanded && props.expandIconCollapsed">
                            <i v-if="route.isExpanded" :class="props.expandIconExpanded" class="mdi"></i>
                            <i v-else :class="props.expandIconCollapsed" class="mdi"></i>
                        </template>
                        <!-- Дефолтные символы -->
                        <template v-else>
                            {{ route.isExpanded ? '▼' : '▶' }}
                        </template>
                    </span>
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

            <!-- Pagination Controls (only for vertical orientation) -->
            <div
                v-if="props.enablePagination && props.paginationType === 'pages' && totalPages > 1 &&
                    props.orientation === 'vertical'"
                class="pagination-controls"
                :style="paginationControlsStyle"
            >
                <button
                    v-for="page in totalPages"
                    :key="page"
                    class="pagination-button"
                    :class="{ 'pagination-button-active': page === currentPage }"
                    :style="getPaginationButtonStyle(page)"
                    @click="goToPage(page)"
                    type="button"
                >
                    {{ page }}
                </button>
            </div>
        </div>

        <!-- Custom Styles from Designer Panel -->
        <component :is="'style'" v-if="hasCustomStyles">
            {{ customStylesCSS }}
        </component>
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
        currentPageId: null,
        hoveredIndex: null,
        isPlayerMode: false,
        loadAttempts: 0,
        maxAttempts: 5,
        isReady: false,
        isMenuOpen: false,
        draggedIndex: null,
        dragOverIndex: null,
        isDragging: false,
        closeMenuTimer: null,
        expandedRoutes: new Set(), // Для отслеживания развернутых разделов
        hierarchyUpdateKey: 0, // Ключ для принудительного обновления
        currentPage: 1 // Текущая страница пагинации
    }),

    computed: {
        displayRoutes() {
            // Используем hierarchyUpdateKey для принудительного пересчета
            const _key = this.hierarchyUpdateKey; // eslint-disable-line no-unused-vars

            let result = this.routes;

            // Фильтруем отключенные страницы
            const disabledPages = this.props.disabledPages || [];
            if (disabledPages.length > 0) {
                result = result.filter(route => {
                    const routeId = route.id || route.pageId;
                    return !disabledPages.includes(routeId);
                });
            }

            // Применяем кастомный порядок ТОЛЬКО если иерархия включена
            if (this.props.enableHierarchy && this.props.routesOrder && this.props.routesOrder.length > 0) {
                result = this.applySortOrder(result);
            }

            if (!this.props.enableHierarchy) {
                // Без иерархии - показываем все routes как есть (порядок из app.json)
                result = result.map(route => ({
                    ...route,
                    depth: 0,
                    hasChildren: false,
                    isExpanded: false
                }));
            } else {
                // С иерархией - строим дерево и фильтруем по expanded
                result = this.buildHierarchicalRoutes(result);
            }

            // Применяем пагинацию с номерами страниц если включена
            if (this.props.enablePagination && this.props.paginationType === 'pages' &&
                (this.props.orientation === 'vertical' || this.props.orientation === 'dropdown' || this.props.orientation === 'burger')) {
                const start = (this.currentPage - 1) * this.props.itemsPerPage;
                const end = start + this.props.itemsPerPage;
                return result.slice(start, end);
            }

            return result;
        },

        // Общее количество страниц для пагинации
        totalPages() {
            if (!this.props.enablePagination || this.props.paginationType !== 'pages') return 1;
            if (this.props.orientation !== 'vertical' && this.props.orientation !== 'dropdown' && this.props.orientation !== 'burger') return 1;

            const totalRoutes = this.routes.filter(route => {
                const routeId = route.id || route.pageId;
                const disabledPages = this.props.disabledPages || [];
                return !disabledPages.includes(routeId);
            }).length;

            return Math.ceil(totalRoutes / this.props.itemsPerPage) || 1;
        },

        canReorder() {
            // Перетаскивание доступно только в редакторе
            return !this.isPlayerMode;
        },

        containerStyle() {
            const style = {
                backgroundColor: this.props.backgroundColor || '#ffffff',
                color: this.props.textColor || '#1f2937',
                borderRadius: this.props.borderRadius || '0.375rem',
                padding: '1rem'
            };

            // Добавляем тень контейнера если указана
            if (this.props.boxShadow) {
                style.boxShadow = this.props.boxShadow;
            }

            return style;
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

            const baseStyle = {
                display: 'flex',
                flexDirection: this.props.orientation === 'horizontal' ? 'row' : 'column',
                gap,
                flexWrap: this.props.orientation === 'horizontal' ? 'wrap' : 'nowrap'
            };

            // Добавляем пагинацию со скроллом для вертикальной ориентации (если включена и тип scroll)
            if (this.props.orientation === 'vertical' && this.props.enablePagination &&
                this.props.paginationType === 'scroll' && this.routes.length > this.props.itemsPerPage) {
                const itemHeight = 3.0; // Высота одной кнопки с отступами в rem для вертикальной ориентации
                const maxHeight = this.props.itemsPerPage * itemHeight;
                baseStyle.maxHeight = `${maxHeight}rem`;
                baseStyle.overflowY = 'auto';
            }

            return baseStyle;
        },

        burgerToggleStyle() {
            const defaultPadding = 0.75; // 0.75rem = 12px
            const paddingObj = this.props.buttonPadding || { size: defaultPadding, unit: 'rem' };
            const padding = `${paddingObj.size}${paddingObj.unit}`;

            const borderColor = this.props.showToggleBorder
                ? (this.props.toggleBorderColor || '#1f2937')
                : 'transparent';

            return {
                padding,
                borderRadius: this.props.borderRadius || '0.375rem',
                border: `1px solid ${borderColor}`,
                backgroundColor: this.props.backgroundColor || '#ffffff',
                cursor: 'pointer'
            };
        },

        burgerMenuStyle() {
            const defaultGap = 0.5; // 0.5rem = 8px
            const gapObj = this.props.buttonGap || { size: defaultGap, unit: 'rem' };
            const gap = `${gapObj.size}${gapObj.unit}`;

            const borderColor = this.props.showMenuBorder
                ? (this.props.menuBorderColor || '#1f2937')
                : 'transparent';

            const baseStyle = {
                display: 'flex',
                flexDirection: 'column',
                gap,
                marginTop: gap,
                padding: gap,
                backgroundColor: this.props.backgroundColor || '#ffffff',
                border: `1px solid ${borderColor}`,
                borderRadius: this.props.borderRadius || '0.375rem',
                boxShadow: this.props.menuShadow || '0 4px 6px rgba(0, 0, 0, 0.1)'
            };

            // Добавляем пагинацию со скроллом (если включена и тип scroll)
            if (this.props.enablePagination && this.props.paginationType === 'scroll' && this.routes.length > this.props.itemsPerPage) {
                const itemHeight = 3.1; // Высота одной кнопки с отступами в rem для бургер меню
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

            const borderColor = this.props.showToggleBorder
                ? (this.props.toggleBorderColor || '#1f2937')
                : 'transparent';

            return {
                padding,
                fontSize,
                borderRadius: this.props.borderRadius || '0.375rem',
                border: `1px solid ${borderColor}`,
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

            const borderColor = this.props.showMenuBorder
                ? (this.props.menuBorderColor || '#1f2937')
                : 'transparent';

            const baseStyle = {
                display: 'flex',
                flexDirection: 'column',
                gap,
                marginTop: gap,
                padding: gap,
                backgroundColor: this.props.backgroundColor || '#ffffff',
                border: `1px solid ${borderColor}`,
                borderRadius: this.props.borderRadius || '0.375rem',
                boxShadow: this.props.menuShadow || '0 4px 6px rgba(0, 0, 0, 0.1)'
            };

            // Добавляем пагинацию со скроллом (если включена и тип scroll)
            if (this.props.enablePagination && this.props.paginationType === 'scroll' && this.routes.length > this.props.itemsPerPage) {
                const itemHeight = 3.1; // Высота одной кнопки с отступами в rem для выпадающего списка
                const maxHeight = this.props.itemsPerPage * itemHeight;
                baseStyle.maxHeight = `${maxHeight}rem`;
                baseStyle.overflowY = 'auto';
            }

            return baseStyle;
        },

        // Стиль для контейнера пагинации
        paginationControlsStyle() {
            const defaultGap = 0.5; // 0.5rem = 8px
            const gapObj = this.props.buttonGap || { size: defaultGap, unit: 'rem' };
            const gap = `${gapObj.size}${gapObj.unit}`;

            return {
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap,
                marginTop: '1rem'
            };
        },

        // Проверяет есть ли кастомные стили
        hasCustomStyles() {
            const customStyles = this.props.customStyles || {};
            return Object.keys(customStyles).some(key => customStyles[key] && customStyles[key].trim() !== '');
        },

        // Генерирует CSS из кастомных стилей с !important для переопределения inline стилей
        customStylesCSS() {
            const customStyles = this.props.customStyles || {};
            let css = '';

            const styleMap = {
                container: '.routes-navigator-container',
                title: '.navigator-title',
                button: '.route-button',
                buttonHover: '.route-button:hover',
                buttonActive: '.route-button-active',
                dropdownToggle: '.dropdown-toggle',
                dropdownMenu: '.dropdown-menu',
                burgerToggle: '.burger-toggle',
                burgerMenu: '.burger-menu',
                burgerLine: '.burger-line',
                routeSlug: '.route-slug',
                expandIcon: '.expand-icon'
            };

            Object.keys(styleMap).forEach(key => {
                if (customStyles[key] && customStyles[key].trim() !== '') {
                    // Добавляем !important к каждому свойству для переопределения inline стилей
                    const importantStyles = customStyles[key]
                        .split(';')
                        .filter(rule => rule.trim())
                        .map(rule => {
                            const trimmed = rule.trim();
                            // Если !important уже есть, не добавляем
                            if (trimmed.includes('!important')) {
                                return trimmed;
                            }
                            return `${trimmed} !important`;
                        })
                        .join('; ');

                    css += `${styleMap[key]} { ${importantStyles}; }\n`;
                }
            });

            return css;
        }
    },

    async mounted() {
        await this.loadRoutes();
        this.detectCurrentSlug();

        // Инициализируем expandedRoutes - по умолчанию все развернуты
        if (this.props.enableHierarchy) {
            this.initializeExpandedState();
        }

        // Небольшая задержка перед показом чтобы не мелькали моки
        await new Promise(resolve => setTimeout(resolve, 100)); // eslint-disable-line no-magic-numbers
        this.isReady = true;
    },

    watch: {
        // Следим за изменениями hierarchy и пересчитываем expandedRoutes
        'props.hierarchy': {
            handler() {
                if (this.props.enableHierarchy) {
                    this.initializeExpandedState();
                }
                // Инкрементируем ключ для принудительного пересчета
                this.hierarchyUpdateKey++;
            },
            deep: true
        },

        // Следим за изменениями порядка страниц
        'props.routesOrder': {
            handler() {
                // Инкрементируем ключ для принудительного пересчета
                this.hierarchyUpdateKey++;
            },
            deep: true
        },

        // Следим за включением/выключением иерархии
        'props.enableHierarchy'(newVal) {
            if (newVal) {
                this.initializeExpandedState();
            } else {
                // При выключении иерархии сбрасываем expandedRoutes
                this.expandedRoutes = new Set();
            }
            // Инкрементируем ключ для принудительного пересчета
            this.hierarchyUpdateKey++;
        },

        // Следим за отключенными страницами
        'props.disabledPages': {
            handler() {
                this.hierarchyUpdateKey++;
            },
            deep: true
        }
    },

    methods: {
        /**
         * Переход на указанную страницу пагинации
         */
        goToPage(pageNum) {
            if (pageNum >= 1 && pageNum <= this.totalPages) {
                this.currentPage = pageNum;
            }
        },

        /**
         * Стиль для кнопки пагинации
         */
        getPaginationButtonStyle(page) {
            const defaultPadding = 0.5; // Меньше чем для обычных кнопок
            const paddingObj = this.props.buttonPadding || { size: 0.75, unit: 'rem' };
            const padding = `${paddingObj.size * 0.67}${paddingObj.unit}`;

            const defaultFontSize = 0.875; // 0.875rem = 14px
            const fontSizeObj = this.props.fontSize || { size: defaultFontSize, unit: 'rem' };
            const fontSize = `${fontSizeObj.size}${fontSizeObj.unit}`;

            const baseStyle = {
                padding,
                fontSize,
                borderRadius: this.props.borderRadius || '0.375rem',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                minWidth: '2rem',
                fontFamily: this.props.fontFamily || 'inherit'
            };

            // Добавляем тень кнопок если указана
            if (this.props.buttonShadow) {
                baseStyle.boxShadow = this.props.buttonShadow;
            }

            // Определяем цвет кнопки
            if (page === this.currentPage) {
                baseStyle.backgroundColor = this.props.paginationActiveColor || this.props.activeColor || '#3b82f6';
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

        /**
         * Применяет кастомный порядок сортировки к routes
         */
        applySortOrder(routes) {
            const customOrder = this.props.routesOrder || [];
            if (customOrder.length === 0) return routes;

            // Создаем копию routes для сортировки
            const sortedRoutes = [...routes];

            sortedRoutes.sort((a, b) => {
                const aId = a.id || a.pageId;
                const bId = b.id || b.pageId;
                const aIndex = customOrder.indexOf(aId);
                const bIndex = customOrder.indexOf(bId);

                // Если оба элемента не в списке порядка, сохраняем исходный порядок
                if (aIndex === -1 && bIndex === -1) return 0;
                // Если только один элемент не в списке, он идет в конец
                if (aIndex === -1) return 1;
                if (bIndex === -1) return -1;
                // Оба элемента в списке - сортируем по их позиции
                return aIndex - bIndex;
            });

            return sortedRoutes;
        },

        /**
         * Строит иерархический список routes с учетом expanded state и кастомного порядка
         */
        buildHierarchicalRoutes(routes = null) {
            const hierarchy = this.props.hierarchy || {};
            const routesToUse = routes || this.routes;
            const customOrder = this.props.routesOrder || [];
            const result = [];

            // Создаем обогащенные routes с depth и hasChildren
            const enrichedRoutes = routesToUse.map(route => {
                const routeId = route.id || route.pageId;
                const depth = this.calculateRouteDepth(routeId, hierarchy);
                const hasChildren = this.hasRouteChildren(routeId, hierarchy);
                const isExpanded = this.expandedRoutes.has(routeId);

                return {
                    ...route,
                    depth,
                    hasChildren,
                    isExpanded,
                    parentId: hierarchy[routeId]
                };
            });

            // Функция сортировки по кастомному порядку
            const sortByCustomOrder = (routesList) => {
                if (customOrder.length === 0) {
                    return routesList;
                }

                return routesList.sort((a, b) => {
                    const aId = a.id || a.pageId;
                    const bId = b.id || b.pageId;
                    const aIndex = customOrder.indexOf(aId);
                    const bIndex = customOrder.indexOf(bId);

                    if (aIndex === -1 && bIndex === -1) return 0;
                    if (aIndex === -1) return 1;
                    if (bIndex === -1) return -1;
                    return aIndex - bIndex;
                });
            };

            // Рекурсивная функция для добавления route и его видимых детей
            const addRouteWithChildren = (route, parentExpanded = true) => {
                // Добавляем route если родитель развернут (или это корневой элемент)
                if (parentExpanded || route.depth === 0) {
                    result.push(route);

                    // Если route развернут, добавляем его детей
                    if (route.isExpanded || route.depth === 0) {
                        let children = enrichedRoutes.filter(r => r.parentId === (route.id || route.pageId));

                        // Сортируем детей по кастомному порядку
                        children = sortByCustomOrder(children);

                        children.forEach(child => addRouteWithChildren(child, route.isExpanded));
                    }
                }
            };

            // Начинаем с корневых элементов (без родителя)
            let rootRoutes = enrichedRoutes.filter(r => !r.parentId);

            // Сортируем корневые элементы по кастомному порядку
            rootRoutes = sortByCustomOrder(rootRoutes);

            rootRoutes.forEach(route => addRouteWithChildren(route, true));

            return result;
        },

        /**
         * Вычисляет глубину route в иерархии
         */
        calculateRouteDepth(routeId, hierarchy, visited = new Set()) {
            if (visited.has(routeId)) return 0; // Защита от циклов

            const parentId = hierarchy[routeId];
            if (!parentId) return 0;

            visited.add(routeId);
            return 1 + this.calculateRouteDepth(parentId, hierarchy, visited);
        },

        /**
         * Проверяет есть ли у route дети
         */
        hasRouteChildren(routeId, hierarchy) {
            return Object.values(hierarchy || {}).includes(routeId);
        },

        /**
         * Переключает развернутость route
         */
        toggleRouteExpansion(route) {
            const routeId = route.id || route.pageId;

            if (this.expandedRoutes.has(routeId)) {
                this.expandedRoutes.delete(routeId);
            } else {
                this.expandedRoutes.add(routeId);
            }

            // Триггерим реактивность
            this.expandedRoutes = new Set(this.expandedRoutes);
        },

        /**
         * Обработка клика по route с учетом иерархии
         */
        handleRouteClick(route) {
            // Если у route есть дети и navigateParents = false, только разворачиваем
            if (route.hasChildren && !this.props.navigateParents) {
                this.toggleRouteExpansion(route);
                return;
            }

            // Если navigateParents = true, сначала разворачиваем (если есть дети)
            if (route.hasChildren) {
                this.toggleRouteExpansion(route);
            }

            // Затем переходим
            this.navigateToRoute(route);
        },

        /**
         * Инициализирует состояние развернутости - по умолчанию все развернуты
         */
        initializeExpandedState() {
            const hierarchy = this.props.hierarchy || {};

            // Находим все routes которые являются родителями
            const parentIds = new Set(Object.values(hierarchy).filter(Boolean));

            // Разворачиваем всех родителей
            this.expandedRoutes = new Set(parentIds);
        },

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
                    return urlMatch[1];
                }
            }

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
                    return `${baseUrl}/player/${appId}/app.json`;
                }
            }

            // Fallback: добавляем /app.json к текущему URL
            return `${window.location.origin}${currentPath}/app.json`.replace(/\/+/g, '/').replace(':/', '://');
        },

        async loadRoutes(retryDelay = 0) {
            this.loadAttempts += 1;

            // ВЕРСИЯ ВИДЖЕТА ДЛЯ ОТЛАДКИ
            console.log('[ElemRoutesNavigator] 🚀 Version: 2025-11-28-v28-HierarchyOrder | Attempt:', this.loadAttempts);

            // Сначала проверяем глобальные объекты
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
                    this.isPlayerMode = true;
                    return true;
                }
            }

            // Если это retry, ждем перед попыткой
            if (retryDelay > 0) {
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
                    const response = await fetch(path);

                    if (!response.ok) {
                        continue;
                    }

                    const appConfig = await response.json();

                    if (appConfig && appConfig.routes && Array.isArray(appConfig.routes)) {
                        this.routes = appConfig.routes.filter(route => route.enabled !== false);
                        this.isPlayerMode = true;
                        return true;
                    }
                } catch (error) {
                    // Игнорируем ошибки
                }
            }

            // Не удалось загрузить - пробуем retry
            if (this.loadAttempts < this.maxAttempts) {
                // Экспоненциальная задержка: 100ms, 300ms, 500ms, 1000ms, 2000ms
                const delays = [100, 300, 500, 1000, 2000]; // eslint-disable-line no-magic-numbers
                const nextDelay = delays[this.loadAttempts - 1] || 2000; // eslint-disable-line no-magic-numbers
                return this.loadRoutes(nextDelay);
            }

            // Все попытки исчерпаны - пробуем парсить из DOM (режим редактора)
            const domRoutes = this.parseRoutesFromDOM();
            if (domRoutes.length > 0) {
                this.routes = domRoutes;
                this.isPlayerMode = false;
                return true;
            }

            // Совсем ничего не нашли
            this.isPlayerMode = true;
            this.routes = [];
            return false;
        },

        /**
         * Парсит routes из DOM в режиме редактора
         * Ищет элементы .page-item с id (UUID) и slug в родительском документе
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
                    id: pageId, // Для обратной совместимости
                    pageId, // ID страницы (как в app.json)
                    title,
                    slug,
                    name: title,
                    enabled: true
                });
            });

            return routes;
        },

        detectCurrentSlug() {
            if (typeof window === 'undefined') return;

            // Сбрасываем оба значения для чистого состояния
            this.currentSlug = null;
            this.currentPageId = null;

            if (!this.props.highlightActivePage) {
                // Old behavior: just use pathname
                this.currentSlug = window.location.pathname;
                return;
            }

            // Player mode: parse hash like #/1 → /1
            if (window.location.hash) {
                const hash = window.location.hash;
                // Extract everything after # (e.g., #/1 → /1)
                const match = hash.match(/^#(.+)$/);
                if (match) {
                    this.currentSlug = match[1];
                    return;
                }
            }

            // Editor mode: parse query param 'page' for UUID
            const urlParams = new URLSearchParams(window.location.search);
            const pageId = urlParams.get('page');

            if (pageId) {
                this.currentPageId = pageId;
                return;
            }

            // Fallback to pathname if nothing else works
            this.currentSlug = window.location.pathname;
        },

        /**
         * Переключает состояние меню (для режима click)
         */
        toggleMenu() {
            this.isMenuOpen = !this.isMenuOpen;
        },

        /**
         * Открывает меню (для режима hover)
         * Отменяет запланированное закрытие
         */
        openMenu() {
            if (this.closeMenuTimer) {
                clearTimeout(this.closeMenuTimer);
                this.closeMenuTimer = null;
            }
            this.isMenuOpen = true;
        },

        /**
         * Закрывает меню (для режима hover)
         */
        closeMenu() {
            this.isMenuOpen = false;
        },

        /**
         * Планирует закрытие меню с задержкой (для режима hover)
         */
        scheduleCloseMenu() {
            if (this.closeMenuTimer) {
                clearTimeout(this.closeMenuTimer);
            }
            this.closeMenuTimer = setTimeout(() => {
                this.isMenuOpen = false;
                this.closeMenuTimer = null;
            }, 150); // Задержка 150ms для плавного перехода между элементами
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
                return;
            }

            // Проверяем что не пытаемся перейти на текущую страницу
            if (this.currentSlug === route.slug) {
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
                    this.$router.push(route.slug).catch(() => {
                        // Игнорируем ошибки навигации
                    });
                } else {
                    // Fallback на обычную навигацию
                    window.location.href = route.slug;
                }
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

            // Определяем выравнивание для vertical, dropdown, burger
            let justifyContent = 'flex-start';
            let textAlign = 'left';

            if (this.props.orientation === 'vertical' || this.props.orientation === 'dropdown' || this.props.orientation === 'burger') {
                const alignment = this.props.buttonAlignment || 'left';
                if (alignment === 'center') {
                    justifyContent = 'center';
                    textAlign = 'center';
                } else if (alignment === 'right') {
                    justifyContent = 'flex-end';
                    textAlign = 'right';
                }
            }

            const baseStyle = {
                padding,
                fontSize,
                borderRadius: this.props.borderRadius || '0.375rem',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent,
                gap: '0.5rem',
                width: this.props.orientation === 'vertical' ? '100%' : 'auto',
                textAlign,
                fontFamily: this.props.fontFamily || 'inherit'
            };

            // Добавляем тень кнопок если указана
            if (this.props.buttonShadow) {
                baseStyle.boxShadow = this.props.buttonShadow;
            }

            // Добавляем отступ для вложенных элементов
            if (this.props.enableHierarchy && route.depth > 0) {
                const indent = route.depth * 1.5; // 1.5rem на каждый уровень
                baseStyle.paddingLeft = `${indent + paddingObj.size}rem`;
            }

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
            if (!this.props.highlightActivePage) {
                return this.currentSlug === route.slug;
            }

            // Editor mode: match by pageId if we have currentPageId
            if (this.currentPageId) {
                // В app.json routes имеют поле pageId (ID страницы в редакторе)
                // В DOM парсинге мы сохраняем id который тоже является pageId
                if (route.pageId) {
                    return this.currentPageId === route.pageId;
                }
                // Fallback на id для обратной совместимости
                if (route.id) {
                    return this.currentPageId === route.id;
                }
                return false;
            }

            // Player mode or fallback: match by slug
            if (this.currentSlug && route.slug) {
                return this.currentSlug === route.slug;
            }

            return false;
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
