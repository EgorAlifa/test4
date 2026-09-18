<template>
    <div class="filter-root" :style="cssStyle" :class="cssClass">
        <div v-if="!props.isSmartSearch" class="w-100 h-100 pos-rel">
            <div
                class="filter-wrapper"
                :class="{
                    'filter-wrapper--opened': isFiltersShown,
                    'filter-wrapper--opened-no-search': isFiltersShown && !props.isSearchMode
                }"
                @mouseenter="toggleMenuByCursor"
                @mouseleave="toggleMenuByCursor">
                <!--INFO_DIV-->
                <div class="w-100" @click="toggleMenu">
                    <w-filter-header
                        v-bind="headerBinds"
                        @single-dimension-deleted="deleteSingleDimension"
                        @all-dimensions-deleted="deleteAllDimensions"
                        @value-entered="resolveSearchValue"
                        @smart-search-dimensions-deleted="clearStore"
                        @smart-search-enter-keyup="triggerSelectEvent"
                        @search-value-cleared="shouldClearEnteredValue = false"></w-filter-header>
                </div>

                <!--HIDDEN_CONTENT-->
                <div v-if="isFiltersShown" class="menu-wrapper">
                    <!--TAGS-->
                    <div v-if="props.multiCount && multiSelect.length > 0" class="tags-wrapper">
                        <div class="tags">
                            <div v-for="(tag, index) in multiSelect" :key="tag.name" class="tags__tag">
                                <span class="text-truncate" :title="tag.name">{{ tag.name }}</span>
                                <div class="btn btn-inline mar-left-2" @click.stop="deleteDimension(tag, index)">
                                    &times;
                                </div>
                            </div>
                        </div>
                    </div>
                    <!--TAGS-->

                    <!--INPUT-->
                    <div v-if="!props.isSearchMode && props.useEmbeddedSearch" class="search">
                        <input
                            v-model="findDimension"
                            type="text"
                            class="search__input"
                            placeholder="Поиск"
                            @change="filterDremio" />
                        <i v-if="findDimension !== ''" class="search__icon" @click.stop="clearInput"></i>
                    </div>
                    <!--INPUT-->

                    <!--SINGLE_LIST-->

                    <ui-dynamic-scroller
                        v-if="isSingleListShown"
                        :items="filteredList"
                        :min-item-size="40"
                        key-field="index"
                        class="h-100 mar-top-5">
                        <template #default="{ item, index, active }">
                            <ui-dynamic-scroller-item
                                v-if="!props.multiMode"
                                :ref="index"
                                class="cursor-pointer"
                                :item="item"
                                :active="active"
                                :size-dependencies="[item.name]"
                                :data-index="index">
                                <div
                                    class="item-wrapper"
                                    v-if="!props.useRadioButton"
                                    @click="selectSingleDimension(item.name, item.metric)">
                                    <span class="option" :class="resolveOptionClasses(item.name)">
                                        {{ item.name }}
                                    </span>
                                    <span v-if="props.isDisplayMetric && item.metric" class="metric">
                                        {{ formatMetric(item.metric) }}
                                    </span>
                                </div>

                                <div class="pad-v-3" v-else>
                                    <div class="item-wrapper">
                                        <label class="cursor-pointer">
                                            <input
                                                class="custom-radio__input"
                                                type="radio"
                                                v-model="singleSelect"
                                                :value="item.name"
                                                @change="selectSingleDimension(singleSelect, item.metric)" />
                                            <span class="custom-radio__label" :class="resolveOptionClasses(item.name)">
                                                {{ item.name }}
                                            </span>
                                        </label>
                                        <span v-if="props.isDisplayMetric && item.metric" class="metric">
                                            {{ formatMetric(item.metric) }}
                                        </span>
                                    </div>
                                </div>
                            </ui-dynamic-scroller-item>
                        </template>
                    </ui-dynamic-scroller>

                    <!--SINGLE_LIST-->

                    <!--MULTI_LIST-->
                    <div
                        class="multi-list-wrapper"
                        :class="{
                            'multi-list-wrapper--full-growth': props.paginationOptions.isEnable
                        }"
                        v-else-if="isMultiListShown">
                        <div
                            v-if="props.multiMode && props.clearEnable"
                            class="button-wrapper"
                            :style="buttonIconStyle">
                            <button
                                v-if="props.btnClear.isShown !== false"
                                class="button-wrapper__btn-clear"
                                :class="buttonsInfo.btnClear.classes"
                                :style="buttonsInfo.btnClear.style"
                                @click="deleteAllDimensions">
                                <i
                                    v-if="buttonsInfo.btnClear.iconIsUsed"
                                    class="mdi button-wrapper__btn-clear-icon"
                                    :class="props.btnClear.icon.class"></i>
                                {{ props.btnClear.text }}
                            </button>
                            <button
                                v-if="props.btnDo.isShown !== false"
                                class="button-wrapper__btn-do"
                                :class="buttonsInfo.btnDo.classes"
                                :style="buttonsInfo.btnDo.style"
                                @click="pushDimensionsToState">
                                <i
                                    v-if="buttonsInfo.btnDo.iconIsUsed"
                                    class="mdi button-wrapper__btn-do-icon"
                                    :class="props.btnDo.icon.class"></i>
                                {{ props.btnDo.text }}
                            </button>
                            <button
                                v-if="props.btnSelectAllEnable"
                                class="button-wrapper__btn-all"
                                :class="buttonsInfo.btnSelectAll.classes"
                                :style="buttonsInfo.btnSelectAll.style"
                                @click="selectAllDimensions">
                                <i
                                    v-if="buttonsInfo.btnSelectAll.iconIsUsed"
                                    class="mdi button-wrapper__btn-all-icon"
                                    :class="props.btnSelectAll.icon.class"></i>
                                {{ props.btnSelectAll.text }}
                            </button>
                        </div>

                        <ui-dynamic-scroller
                            :items="filteredList"
                            :min-item-size="40"
                            key-field="index"
                            list-tag="ul"
                            item-tag="li"
                            class="multi-list multi-list-scroll">
                            <template #default="{ item, index, active }">
                                <ui-dynamic-scroller-item
                                    :item="item"
                                    :active="active"
                                    :size-dependencies="[item.name]"
                                    :data-index="index"
                                    :class="{ 'mar-top-l1': !!index }"
                                    class="multi-list__element cursor-pointer"
                                    @click.native="changeSelect(item)">
                                    <label>
                                        <input
                                            class="checkbox"
                                            :class="{ checked: item.selected }"
                                            :checked="item.selected"
                                            type="checkbox" />
                                        <i></i>
                                    </label>
                                    <div class="item-wrapper w-100">
                                        <a class="multi-list__link">{{ item.name }}</a>
                                        <span v-if="props.isDisplayMetric && item.metric" class="metric">
                                            {{ formatMetric(item.metric) }}
                                        </span>
                                    </div>
                                </ui-dynamic-scroller-item>
                            </template>
                        </ui-dynamic-scroller>
                    </div>

                    <w-pagination
                        v-if="pages > 1 && props.paginationOptions.isEnable"
                        v-bind="{ page, pages, numItems: props.paginationOptions.numItems }"
                        @select="(page) => loadDataPage(page)"></w-pagination>
                </div>
            </div>
        </div>
        <div v-else class="smart-search">
            <w-smart-search-view
                v-bind="{
                    headerBinds,
                    isResizable: props.isResizable,
                    closingMode: props.closingMode,
                    isClickedOutside,
                    isOpeningByEnter: props.isOpeningByEnter,
                    isSmartSearchGeneralPreview: props.isSmartSearchGeneralPreview,
                    disableContentHiding: props.disableContentHiding
                }"
                @single-dimension-cleared="deleteSingleDimension"
                @all-dimensions-cleared="deleteAllDimensions"
                @value-entered="resolveSearchValue"
                @smart-dimensions-cleared="clearStore"
                @smart-search-enter-keyup="triggerSelectEvent"
                @search-value-cleared="shouldClearEnteredValue = false">
                <slot></slot>
            </w-smart-search-view>
        </div>
    </div>
</template>
<style module src="./styles/style.module.pcss" lang="pcss"></style>
<style scoped src="./styles/style.css"></style>
<!--
    vue-virtual-scroller's own CSS is also imported below as a bare
    "import '...css'" inside the script block, but that relies on the host
    build picking up a plain CSS import from an npm package - if it doesn't,
    the library's hidden resize-measurement helper element (normally
    opacity:0, z-index:-1) falls back to the browser's default "broken
    object" placeholder, rendering as a small square before every row.
    Inlining the essential rules here guarantees they ship with the widget
    regardless of how the host bundles that import.
-->
<style>
.vue-recycle-scroller {
    position: relative;
}
.vue-recycle-scroller.direction-vertical:not(.page-mode) {
    overflow-y: auto;
}
.vue-recycle-scroller.direction-horizontal:not(.page-mode) {
    overflow-x: auto;
}
.vue-recycle-scroller.direction-horizontal {
    display: flex;
}
.vue-recycle-scroller__slot {
    flex: auto 0 0;
}
.vue-recycle-scroller__item-wrapper {
    flex: 1;
    box-sizing: border-box;
    overflow: hidden;
    position: relative;
}
.vue-recycle-scroller.ready .vue-recycle-scroller__item-view {
    position: absolute;
    top: 0;
    left: 0;
    will-change: transform;
}
.vue-recycle-scroller.direction-vertical .vue-recycle-scroller__item-wrapper {
    width: 100%;
}
.vue-recycle-scroller.direction-horizontal .vue-recycle-scroller__item-wrapper {
    height: 100%;
}
.vue-recycle-scroller.ready.direction-vertical .vue-recycle-scroller__item-view {
    width: 100%;
}
.vue-recycle-scroller.ready.direction-horizontal .vue-recycle-scroller__item-view {
    height: 100%;
}
.resize-observer {
    position: absolute;
    top: 0;
    left: 0;
    z-index: -1;
    width: 100%;
    height: 100%;
    border: none;
    background-color: transparent;
    pointer-events: none;
    display: block;
    overflow: hidden;
    opacity: 0;
}
.resize-observer object {
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    overflow: hidden;
    pointer-events: none;
    z-index: -1;
}
</style>
<script>
/**
 * @typedef {import('./ElemStandardFilter').IComponentOptions} IComponentOptions
 * @typedef {import('./ElemStandardFilter').IInstance} IInstance
 */
import { Elem } from '@goodt-wcore/core';
import { StoreManager } from '@goodt-wcore/managers';
import { Query, useDremio, useSDKDataProvider } from '@goodt-common/dremio';
import { get as _get, cloneDeep, isEqual, truncate as _truncate, isEmpty, kebabCase, uniq, omit } from 'lodash';
import { useNavigate } from '@goodt-wcore/utils';
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller';
import { formatNumber } from '@goodt-widgets-insight/utils';
import { meta, Events, Vars } from './descriptor';
// eslint-disable-next-line no-restricted-syntax
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';
import { FilterHeader, SmartSearchView, Pagination } from './components';
import { DremioFieldTypes, NonExistentValues, TooltipOptions, Buttons } from './config';
import { TOGGLE_MENU_DELAY, EMPTY_FIELD_URL } from './constants';
import { buildCssStyle } from './utils';
import { DremioNormalizeMixin } from '@goodt-widgets-insight/utils';

const { store, ValueObject } = StoreManager;

const { navigate } = useNavigate();

/**
 * @typedef {object} SelectOption
 * @property {string} name
 * @property {number} index
 * @property {boolean} selected
 */

/**
 * @type {IComponentOptions}
 */
export default {
    extends: Elem,
    components: {
        WFilterHeader: FilterHeader,
        UiDynamicScroller: DynamicScroller,
        UiDynamicScrollerItem: DynamicScrollerItem,
        WSmartSearchView: SmartSearchView,
        WPagination: Pagination
    },
    mixins: [DremioNormalizeMixin, useDremio().mixin],
    meta,
    data() {
        return {
            loadDataHooks: {
                then: (_, { isDatasetFiltered }) => {
                    this.createFilterData();
                    this.triggerEventAndCommitToStore({ isDatasetFiltered });
                }
            },
            isMenuVisible: false,
            singleSelect: '',
            singleSelectMetric: '',
            valueDimension: '',
            // eslint-disable-next-line no-restricted-syntax
            multiSelect: [],
            // eslint-disable-next-line goodt-rules/data-boolean-key-naming,no-restricted-syntax
            data: [],
            findDimension: '',
            isFirstAppearance: true,
            state: null,
            subState: null,
            firstSubState: null,
            firstDimensionValues: [],
            shouldClearEnteredValue: false,
            isClickedOutside: false
        };
    },
    computedEditor: {
        dimensions() {
            return this.queryHelper.reduce((arr, { dimensionList }) => [...arr, ...Object.keys(dimensionList)], []);
        },
        metrics() {
            const metrics = this.queryHelper.reduce((arr, { query }) => [...arr, ...query[Query.KEY.METRICS]], []);
            return metrics.map((metric) => Query.getMetricName(metric));
        },
        selectedMetric() {
            const {
                props: { selectedMetric },
                metrics
            } = this;

            return metrics.find((metric) => metric === selectedMetric) ?? null;
        }
    },
    computed: {
        /**
         * @return {string}
         */
        title() {
            let singleSelectText = this.singleSelect;

            if (this.props.trimTheLine) {
                singleSelectText = _truncate(singleSelectText, {
                    length: this.props.cutStringLength
                });
            }

            if (this.props.multiMode === false) {
                return this.isMenuVisible ? this.props.textPlaceholder : singleSelectText || this.props.textPlaceholder;
            }

            return '';
        },
        /**
         * @return {SelectOption[]}
         */
        dimensionList() {
            const list = cloneDeep(this.data);
            return list.sort((a, b) => {
                if (a.selected && b.selected) {
                    return a.index > b.index ? 1 : -1;
                }
                if (a.selected && b.selected === false) {
                    return -1;
                }
                if (a.selected === false && b.selected) {
                    return 1;
                }
                return a.index > b.index ? 1 : -1;
            });
        },
        /**
         * @return {SelectOption[]}
         */
        typeList() {
            return this.props.multiCount ? this.data : this.dimensionList;
        },
        /**
         * @return {SelectOption[]}
         */
        filteredList() {
            const {
                typeList,
                findDimension,
                props: { paginationOptions }
            } = this;

            if (paginationOptions.isEnable) {
                return typeList;
            }

            return typeList.filter(({ name }) => name.toLowerCase().includes(findDimension.toLowerCase()));
        },
        /**
         * @return {string}
         */
        selectedList() {
            return this.multiSelect.map((item) => item.name).join(', ');
        },
        /**
         * @return {Object.<string,any>}
         */
        dataRow() {
            const {
                singleSelect,
                singleSelectMetric,
                props: { selectedDimension, isDisplayMetric, selectedMetric }
            } = this;

            return this.allDatasetsRows.find(
                (row) =>
                    row[selectedDimension] === singleSelect &&
                    (!isDisplayMetric || row[selectedMetric] === singleSelectMetric)
            );
        },
        /**
         * @return {boolean}
         */
        isDeleteSingleDimBtnShown() {
            const {
                singleSelect,
                props: { multiMode, noReset }
            } = this;
            return Boolean(!multiMode && singleSelect && !noReset);
        },
        /**
         * @return {boolean}
         */
        isDeleteAllDimsBtnShown() {
            const {
                multiSelect,
                props: { multiMode, multiCount }
            } = this;
            return multiMode && !multiCount && multiSelect.length > 0;
        },
        /**
         * @return {boolean}
         */
        isDeleteSmartSearchDims() {
            return this.props.isSmartSearch;
        },
        /**
         * @return {boolean}
         */
        isTooltipShown() {
            const { singleSelect, selectedList } = this;
            return singleSelect !== '' || selectedList !== '';
        },
        /**
         * @return {Object}
         */
        buttonsInfo() {
            return Buttons.reduce((struct, btn) => {
                const { styles = [], icon = {}, classes = [] } = this.props[btn];
                const style = buildCssStyle(styles);
                const iconIsUsed = icon.isUsed;
                const attributes = ['color', 'background'];
                const extraClasses = attributes
                    .filter((attribute) => this.props[btn][attribute].trim() !== '')
                    .map((attr) => `button-wrapper__${kebabCase(btn).replace('select-', '')}--${attr}`);

                return { ...struct, [btn]: { iconIsUsed, style, classes: [...classes, ...extraClasses] } };
            }, {});
        },
        /**
         * @return {Object}
         */
        buttonIconStyle() {
            const vars = Buttons.reduce((acc, btn) => {
                const { icon = {} } = this.props[btn];
                const { margin = [] } = icon.style ?? {};
                return { ...acc, [`${kebabCase(btn).replace('select-', '')}__icon_margin`]: margin.join(' ') };
            }, {});

            return this.$genCssVarsStyle(vars);
        },
        /**
         * @return {Object}
         */
        headerBinds() {
            return {
                parentProps: this.props,
                valueDimension: this.valueDimension,
                isTooltipShown: this.isTooltipShown,
                isMenuVisible: this.isMenuVisible,
                selectedList: this.selectedList,
                singleSelect: this.singleSelect,
                isDeleteSingleDimBtnShown: this.isDeleteSingleDimBtnShown,
                isDeleteAllDimsBtnShown: this.isDeleteAllDimsBtnShown,
                isDeleteSmartSearchDims: this.isDeleteSmartSearchDims,
                title: this.title,
                // eslint-disable-next-line no-restricted-syntax
                multiSelect: [...this.multiSelect],
                tooltipOptions: TooltipOptions,
                shouldClearEnteredValue: this.shouldClearEnteredValue
            };
        },
        allDatasetsRows() {
            if (this.result === null || this.result.length === 0) {
                return [];
            }

            const allRows = this.result
                .map((dataset) => {
                    if (dataset == null) {
                        return [];
                    }

                    return dataset.rows;
                })
                .flat();

            const {
                props: { selectedDimension, paginationOptions },
                subState
            } = this;

            if (paginationOptions.isEnable) {
                const { dimensionValues: selectedDimensionValues } = this.resolveStateSelectedDimensionValues({
                    results: this.result,
                    subState
                });

                const stateDimensions = [...new Set(selectedDimensionValues)]
                    .filter((dim) => !allRows.some((row) => row[selectedDimension] === dim))
                    .map((dim) => ({ [selectedDimension]: dim }));
                return [...stateDimensions, ...allRows];
            }

            return allRows;
        },
        smartSearchDimensions() {
            return this.props.smartSearchDimensions.map(({ name }) => name);
        },
        isFiltersShown() {
            if (this.props.isGeneralPreview && this.props.isSearchMode) {
                return this.findDimension !== '';
            }

            return this.isMenuVisible;
        },
        isSingleListShown() {
            // eslint-disable-next-line no-restricted-syntax
            if (!this.props.multiMode && this.props.isGeneralPreview) {
                return this.findDimension !== '';
            }

            return !this.props.multiMode;
        },
        isMultiListShown() {
            if (this.props.multiMode && this.props.isGeneralPreview) {
                return this.findDimension !== '';
            }

            return this.props.multiMode;
        },
        /** @public */
        rowCount() {
            if (this.result == null || this.result.length === 0) {
                return 0;
            }
            const foundResult = this.result.find(({ schema }) =>
                schema.find(({ name }) => name === this.props.selectedDimension)
            );

            return foundResult?.rowCount ?? 0;
        },
        selectedDremio() {
            const { dremio } = this.props;

            if (isEmpty(dremio)) {
                return null;
            }

            if (!Array.isArray(dremio)) {
                return this.props.dremio;
            }

            return dremio.find(({ dimensionList }) =>
                Object.keys(dimensionList).find((dimKey) => dimKey === this.props.selectedDimension)
            );
        },
        /** @public */
        limit() {
            return this.selectedDremio?.limit ?? 0;
        },
        isAllowedLoadData() {
            const {
                isAwaitVariableMode,
                awaitVariableModeSettings: { variables }
            } = this.props;
            if (!isAwaitVariableMode) {
                return true;
            }

            return variables.every((variable) => this.$storeState[variable] != null);
        }
    },
    subscribe: [
        {
            event: Events.HARD_RELOAD,
            handler() {
                this.shouldClearEnteredValue = true;
                this.isFirstAppearance = true;
                this.loadData();
            }
        }
    ],
    watch: {
        /**
         * @param {string} value
         */
        singleSelect(value) {
            if (value === '') {
                this.data = this.data.map((dimension) => ({
                    ...dimension,
                    selected: false
                }));
            }
        }
    },
    watchStore: [
        {
            handler(_, state) {
                const { selectedDimension, isSmartSearch } = this.props;

                if (isSmartSearch && selectedDimension in state) {
                    this.valueDimension = state[selectedDimension];
                }

                if (state[selectedDimension] === null) {
                    this.triggerResetEvent();
                }
            }
        },
        {
            all: true,
            vars: [Vars.EXCLUDE_FILTER_VALUE],
            handler() {
                this.resolveExcludeFilterValue();
            }
        }
    ],
    watchEditor: {
        'props.isAwaitVariableMode': {
            handler() {
                this.loadData();
            }
        }
    },
    destroyed() {
        document.removeEventListener('click', this.onDocClick);
    },
    created() {
        if (!Array.isArray(this.props.dremio)) {
            this.formattedDremio = this.props.dremio == null ? [] : [this.props.dremio];
        }

        document.addEventListener('click', this.onDocClick);
        if (this.isEditorMode) {
            this.$watch(
                'props.dremio',
                (newDremio, oldDremio) => {
                    if (isEqual(newDremio, oldDremio) === false) {
                        this.dremioHandler();
                    }
                    this.createFilterData();
                },
                { deep: true }
            );
            this.$watch(
                'props',
                () => {
                    this.data.forEach((item) => {
                        item.selected = false;
                    });
                },
                { deep: true }
            );
        }
    },
    methods: {
        loadDataPage(page = 1) {
            this.page = page;
            this.loadData();
        },
        /**
         * @typedef {object} MouseEvent
         */

        /** @public */
        getQueryHelper() {
            if (!Array.isArray(this.queryHelper)) {
                return [this.queryHelper];
            }
            return this.queryHelper;
        },
        /**
         * @param {import('./descriptor').FilterItem[]} filters
         */
        buildStateFromFilters(filters) {
            return filters.reduce(
                (acc, { name, data }) => ({ ...acc, [name]: new ValueObject(data, store.state[name]?.meta) }),
                {}
            );
        },
        applyStoreFilters() {
            const { filters } = this.props;
            if (filters.length > 0) {
                store.commit(this.buildStateFromFilters(filters), { context: this });
            }
        },
        /** @public */
        loadData({ isDatasetFiltered = false } = {}) {
            if (!this.isAllowedLoadData) {
                return [];
            }

            this.dremioSdk.cancelActiveRequests();
            this.loadDataHooks.before();

            if (!Array.isArray(this.queryHelper)) {
                this.queryHelper = [this.queryHelper];
            }

            return Promise.all(
                this.queryHelper.map((helper, index) =>
                    useSDKDataProvider(this.dremioSdk, this.props.dremio[index]).getData(
                        helper.buildQuery(),
                        this.offset,
                        this.resolveLimit(index)
                    )
                )
            )
                .then((result) => {
                    this.result = result;
                    this.loadDataHooks.then(result, { isDatasetFiltered });
                })
                .catch(this.loadDataHooks.catch)
                .finally(this.loadDataHooks.finally);
        },
        /** @public */
        getDremioQueryParamNames() {
            if (this.queryHelper == null) {
                return [];
            }

            const { fields, metrics, dimensions } = this.queryHelper.reduce(
                (obj, { query, dimensionList }) => {
                    obj.fields = [...obj.fields, ...Query.queryFieldNames(query)];
                    obj.metrics = [...obj.metrics, ...Query.queryMetricNames(query)];
                    obj.dimensions = [...obj.dimensions, ...Object.keys(dimensionList)];
                    return obj;
                },
                { fields: [], metrics: [], dimensions: [] }
            );

            return [...metrics, ...dimensions, ...fields];
        },
        /** @public */
        dremioHandler() {
            const { dremio } = this.props;
            if (dremio == null) {
                this.result = [];
                return;
            }

            this.formattedDremio = Array.isArray(dremio) ? dremio : [dremio];

            if (this.formattedDremio.length === 0) {
                this.result = [];
                return;
            }

            this.queryHelper = this.formattedDremio.map((dataset) => new Query(cloneDeep(dataset)));
            this.setDremioVars();
            this.loadData();
        },
        applyDremioFilters(params) {
            if (this.queryHelper == null) {
                return false;
            }

            const paramEntries = Object.entries(params);

            let isAnyFilterApplied = false;
            this.queryHelper.forEach((helper) => {
                let { query } = helper;
                const originalQuery = cloneDeep(query);
                const metricDimensionNames = [...Query.queryMetricNames(query), ...Query.queryFieldNames(query)];

                paramEntries.forEach(([name, paramVal]) => {
                    if (!metricDimensionNames.includes(name)) {
                        return;
                    }

                    if (paramVal !== null) {
                        const filter = this.createDremioFilter(name, paramVal);
                        query = Query.queryInsertUpdateFilter(query, filter);
                    } else {
                        query = Query.queryRemoveFilter(query, name);
                    }

                    if (!isAnyFilterApplied) {
                        isAnyFilterApplied = isEqual(query, originalQuery) === false;
                    }
                });
            });

            return isAnyFilterApplied;
        },
        resolveLimit(index) {
            const { dremio } = this.props;

            if (dremio == null) {
                return 0;
            }

            return dremio[index] && dremio[index].limit != null ? dremio[index].limit : 0;
        },
        async loadFilterData() {
            this.dremioSdk.cancelActiveRequests();
            this.loadDataHooks.before();
            if (!Array.isArray(this.queryHelper)) {
                this.queryHelper = [this.queryHelper];
            }

            const result = await Promise.all(
                this.queryHelper.map((helper, index) =>
                    useSDKDataProvider(this.dremioSdk, this.props.dremio[index]).getData(
                        helper.buildQuery(),
                        this.offset,
                        this.resolveLimit(index)
                    )
                )
            )
                .catch(this.loadDataHooks.catch)
                .finally(this.loadDataHooks.finally);

            if (result == null) {
                return;
            }
            this.result = result;

            this.createFilterData({ isDatasetFiltered: true });
        },
        /**
         * @param {string[]} values
         */
        setFilterValues(values) {
            const { multiMode: isMultiMode } = this.props;
            if (isMultiMode) {
                this.multiSelect = this.data
                    .filter(({ name }) => values.includes(name))
                    .map(({ selected, ...rest }) => ({ ...rest, selected: true }));
                const selectedNames = this.multiSelect.map(({ name }) => name);
                this.data.forEach((filterItem) => {
                    if (selectedNames.includes(filterItem.name)) {
                        filterItem.selected = true;
                    }
                });
                return;
            }

            if (values.length > 0) {
                this.data = this.data.map((filterItem) => ({ ...filterItem, selected: false }));
                const { result } = this.createStandardSingleFilter(values[values.length - 1]);
                this.singleSelect = result;
            }
        },
        resolveExcludeFilterValue() {
            const excludeFilterValue = this.$storeState[Vars.EXCLUDE_FILTER_VALUE];
            const { excludedField } = this.props;
            if (excludeFilterValue == null) {
                this.queryHelper.forEach((helper) => {
                    helper.query = Query.queryRemoveFilter(helper.query, excludedField);
                });
                this.loadDataPage();
                return;
            }
            const filter = Query.createFilter({
                name: excludedField,
                value: [excludeFilterValue].flat(),
                type: Query.FILTER_TYPE.IN_NOT
            });
            this.queryHelper.forEach((helper) => {
                helper.query = Query.queryInsertUpdateFilter(helper.query, filter);
            });
            this.loadDataPage();
        },
        createFilterData() {
            const { selectedDimension } = this.props;
            const multiSelectNames = new Set(this.multiSelect.map(({ name }) => name));
            this.data = this.allDatasetsRows
                .filter((row) => row[selectedDimension] != null)
                .map((row, index) => {
                    const name = row[selectedDimension];
                    const metric = row[this.selectedMetric];
                    return {
                        name,
                        metric,
                        index,
                        selected: multiSelectNames.has(name)
                    };
                });
        },
        triggerEventAndCommitToStore({ isDatasetFiltered = false } = {}) {
            const { result: results, subState } = this;
            if ((results?.length ?? 0) === 0) {
                return;
            }

            const { selectedDimension, multiMode, paginationOptions, isAlwaysFirstValue } = this.props;

            if (this.isFirstAppearance) {
                this.isFirstAppearance = false;
                this.triggerDefaultValues();
            } else if (isAlwaysFirstValue && isDatasetFiltered) {
                this.multiSelect = [];
                this.triggerFirstValue(isDatasetFiltered);
            }

            let isOnlySelectedDimension = true;
            if (!isEmpty(subState)) {
                const { isAnotherDimension, dimensionValues: selectedDimensionValues } =
                    this.resolveStateSelectedDimensionValues({ results, subState });
                isOnlySelectedDimension = !isAnotherDimension;
                if (this.firstSubState == null) {
                    this.firstSubState = cloneDeep(subState);
                    this.firstDimensionValues = cloneDeep(selectedDimensionValues);
                }
                if (
                    multiMode &&
                    selectedDimensionValues.length > 0 &&
                    selectedDimensionValues.every((val) => val == null)
                ) {
                    this.multiSelect = [];
                    this.data = this.data.map((dimension) => ({
                        ...dimension,
                        selected: false
                    }));
                    if (!paginationOptions.isEnable) {
                        this.findDimension = '';
                    }
                } else {
                    this.setFilterValues(selectedDimensionValues);
                }
                if (!isOnlySelectedDimension) {
                    this.state = {
                        ...this.state,
                        [selectedDimension]: selectedDimensionValues
                    };
                    this.$storeCommit(this.state);
                }
            }

            if ((multiMode && this.multiSelect.length > 0) || this.singleSelect !== '' || !isOnlySelectedDimension) {
                this.triggerSelectEvent();
            }
        },
        /**
         * @param {string} dimension
         * @param {string} metric
         */
        selectSingleDimension(dimension, metric) {
            if (this.props.isDisplayMetric && metric != null) {
                this.singleSelectMetric = metric;
                this.triggerEventAndCommitToStore();
            }
            this.singleSelect = dimension;
            this.formStateToCommit();
            this.isMenuVisible = false;
            this.triggerSelectEvent();
            this.navigateSelectedUrl();
        },
        /**
         * @param {SelectOption} selectedItem
         */
        changeSelect(selectedItem) {
            const {
                data,
                multiSelect,
                dimensions,
                props: { clearEnable, selectedDimension }
            } = this;
            const dimension = data.find((dim) => dim.index === selectedItem.index);

            dimension.selected = !dimension.selected;

            if (dimension.selected) {
                multiSelect.push(dimension);
                this.triggerSelectEvent();
            } else {
                const index = multiSelect.findIndex((i) => i.index === selectedItem.index);
                multiSelect.splice(index, 1);
                this.triggerResetEvent();
            }

            if (!this.props.isSearchMode) {
                this.findDimension = '';
            }

            if (clearEnable === true) {
                return;
            }
            if (multiSelect.length > 0) {
                this.formStateToCommit();
            } else {
                this.state = {
                    ...this.state,
                    ...dimensions.reduce((state, dimension) => ({ ...state, [dimension]: null }), {})
                };

                this.$storeCommit(this.state);
            }
        },
        pushDimensionsToState() {
            const { multiSelect } = this;
            if (multiSelect.length > 0) {
                this.formStateToCommit();
            }
            this.findDimension = '';
        },
        /**
         * @param {SelectOption} dimension
         * @param {number} index
         */
        deleteDimension(dimension, index) {
            const { selectedDimension } = this.props;
            const foundDimensionIndex = this.data.findIndex((dim) => dim.index === dimension.index);
            if (foundDimensionIndex !== -1) {
                this.multiSelect.splice(index, 1);
                // eslint-disable-next-line no-restricted-syntax
                this.data[foundDimensionIndex].selected = !this.data[foundDimensionIndex].selected;

                if (this.multiSelect.length > 0) {
                    this.formStateToCommit();
                } else {
                    this.clearStore();
                }
                this.triggerResetEvent();
            }
        },
        deleteAllDimensions() {
            const { isResetToDefault, paginationOptions } = this.props;

            const isFullReset = isEqual(
                this.multiSelect.filter(({ selected }) => selected === true).map(({ name }) => name),
                this.firstDimensionValues
            );

            this.multiSelect = [];
            this.data =
                !isFullReset && isResetToDefault
                    ? this.data.map((dimension) => {
                          const isFirstDimension = this.firstDimensionValues.includes(dimension.name);
                          if (isFirstDimension) {
                              this.multiSelect.push({ ...dimension, selected: true });
                          }

                          return {
                              ...dimension,
                              selected: isFirstDimension
                          };
                      })
                    : (this.data = this.data.map((dimension) => ({
                          ...dimension,
                          selected: false
                      })));

            this.findDimension = '';
            this.clearStore(isFullReset);
            this.triggerResetEvent();

            if (paginationOptions.isEnable) {
                this.filterDremio();
            }
        },
        /**
         * @param {MouseEvent} event
         */
        toggleMenu(event) {
            const {
                $refs: { closeIcon },
                props: { multiCount }
            } = this;
            if (closeIcon == null || closeIcon.contains(event.target) === false || multiCount === false) {
                this.isMenuVisible = !this.isMenuVisible;
            }
        },
        toggleMenuByCursor() {
            if (!this.props.isShowMenuByCursor) {
                return;
            }
            if (this.isMenuVisible) {
                setTimeout(() => {
                    this.isMenuVisible = false;
                }, TOGGLE_MENU_DELAY);
            }
            this.isMenuVisible = true;
        },
        /**
         * @param {string} paramVal
         */
        createStandardSingleFilter(paramVal) {
            const {
                props: { isDisplayMetric },
                singleSelectMetric
            } = this;
            const foundDimension = this.data.find(
                ({ name, metric }) =>
                    name === paramVal &&
                    (!isDisplayMetric || singleSelectMetric === '' || metric === singleSelectMetric)
            );
            if (foundDimension == null || foundDimension.selected) {
                return {
                    result: '',
                    exist: false
                };
            }
            const exist = true;
            foundDimension.selected = true;

            return {
                exist,
                result: foundDimension.name
            };
        },
        /**
         * @param {MouseEvent} event
         */
        onDocClick(event) {
            event.stopPropagation();

            if (this.$el.contains(event.target) === false) {
                this.isMenuVisible = false;
                this.isClickedOutside = true;

                if (this.props.isGeneralPreview) {
                    this.findDimension = '';
                }
                return;
            }

            this.isClickedOutside = false;
        },
        deleteSingleDimension() {
            const { paginationOptions } = this.props;
            const isFullReset = this.firstDimensionValues.includes(this.singleSelect);
            this.singleSelect = '';

            this.findDimension = '';
            this.clearStore(isFullReset);
            this.triggerResetEvent();

            if (paginationOptions.isEnable) {
                this.filterDremio();
            }
        },
        triggerDefaultValues() {
            const { defaultValues, firstValue, selectedDimension, multiMode, isAlwaysFirstValue } = this.props;
            const { [selectedDimension]: dimensionValue } = this.$storeState;

            if (dimensionValue != null) {
                return;
            }

            const values = defaultValues.map(({ name }) => name);

            if ((firstValue || isAlwaysFirstValue) && selectedDimension !== '' && this.result.length > 0) {
                const value = _get(this.result[0], `rows[0][${selectedDimension}]`, null);
                const isNotDimension = value === null ? false : !values.includes(value);

                if (value !== null && isNotDimension) {
                    values.push(value);
                }
            }

            if (multiMode === true) {
                values.forEach((dimensionName) => {
                    const foundDim = this.data.find(({ name }) => name === dimensionName);
                    if (foundDim != null) {
                        foundDim.selected = true;
                        const foundDimMultiSelect = this.multiSelect.find(({ name }) => name === dimensionName);
                        if (foundDimMultiSelect != null) {
                            foundDimMultiSelect.selected = true;
                        } else {
                            this.multiSelect.push(cloneDeep(foundDim));
                        }
                    }
                });
            } else {
                this.singleSelect = values[0] || '';
            }

            if (values.length > 0) {
                this.formStateToCommit();
                this.triggerSelectEvent();
            }
        },
        triggerFirstValue(isDatasetFiltered) {
            if (!isDatasetFiltered) {
                return;
            }

            const { selectedDimension, multiMode } = this.props;
            const value = this.result[0]?.rows[0]?.[selectedDimension];

            if (value == null) {
                return;
            }

            if (multiMode === true) {
                const foundDimension = this.data.find(({ name }) => name === value);
                foundDimension.selected = true;
                const foundDimensionMultiSelect = this.multiSelect.find(({ name }) => name === value);

                if (foundDimensionMultiSelect == null) {
                    this.multiSelect.push(cloneDeep(foundDimension));
                } else {
                    foundDimensionMultiSelect.selected = true;
                }
            } else {
                this.singleSelect = value;
            }

            this.formStateToCommit();
            this.triggerSelectEvent();
        },
        formStateToCommit() {
            const { multiMode: isMultiMode, selectedDimension } = this.props;
            let state = this.dataRow;
            if (isMultiMode) {
                const multiSelectNames = this.multiSelect.map(({ name }) => name);
                const filteredRows = this.allDatasetsRows.filter((row) =>
                    multiSelectNames.includes(row[selectedDimension])
                );

                state = filteredRows.reduce((obj, row) => {
                    const entries = Object.entries(row);
                    entries.forEach(([key, value]) => {
                        if (obj[key] == null) {
                            obj[key] = [value];
                        } else {
                            obj[key].push(value);
                        }
                    });
                    return obj;
                }, {});
            }
            this.state = state;

            this.$storeCommit(state);
        },
        triggerSelectEvent(domEvent) {
            const { customEvent, dynamicEvent, multiMode, isSmartSearch } = this.props;
            if (customEvent.enable === false) {
                return;
            }

            const resolveEventType = () => {
                if (dynamicEvent.enable && multiMode === false) {
                    const dataRow = this.data.find(({ name }) => name === domEvent?.target.value);
                    return isSmartSearch ? dataRow?.name : this.dataRow[dynamicEvent.onSelectName];
                }
                return customEvent.onSelectName;
            };

            const eventType = resolveEventType();

            if (eventType == null) {
                return;
            }

            this.$eventTrigger(eventType);
        },
        triggerResetEvent() {
            const { customEvent, dynamicEvent, multiMode } = this.props;
            if (customEvent.enable === false) {
                return;
            }

            const eventType = dynamicEvent.enable && !multiMode ? dynamicEvent.onResetName : customEvent.onResetName;

            this.$eventTrigger(eventType, {});
        },
        navigateSelectedUrl() {
            const { dremioUrlFieldName, isOpenedUrlFromNewTab } = this.props;

            if (this.dataRow == null || dremioUrlFieldName === EMPTY_FIELD_URL) {
                return;
            }

            const url = this.dataRow[dremioUrlFieldName];

            if (url != null && url.length > 0) {
                navigate({ url }, { isNewWindow: isOpenedUrlFromNewTab });
            }
        },
        /**
         * @public
         * @param {object} state
         */

        storeStateWatcher(state) {
            const { isSmartSearch, dremio, filtrationMode } = this.props;

            if (isSmartSearch || isEmpty(dremio)) {
                return;
            }

            const shouldLoadData = Object.keys(state).length > 0 && filtrationMode && !isEqual(this.state, state);

            if (!shouldLoadData) {
                this.subState = this.resolveStateWithSelectedDimensions(state);
                return;
            }
            this.state = cloneDeep(state);

            const subState = this.resolveStateWithSelectedDimensions(state);

            this.$nextTick(() => {
                const isDataSetFiltered = this.applyDremioFilters(omit(state, Object.keys(subState)));

                if (isDataSetFiltered) {
                    this.offset = 0;
                    this.subState = subState;
                    this.loadData({ isDatasetFiltered: true });
                    return;
                }
                if (isEqual(this.subState, subState) === false) {
                    this.subState = subState;
                    this.triggerEventAndCommitToStore();
                }
            });
        },
        resolveStateWithSelectedDimensions(state) {
            const dremioFields = this.queryHelper.reduce(
                (acc, { query, dimensionList }) => [
                    ...acc,
                    ...Query.queryMetricNames(query),
                    ...Object.keys(dimensionList)
                ],
                []
            );

            const newState = Object.entries(state)
                .filter(([key]) => dremioFields.includes(key))
                .reduce(
                    (acc, [key, value]) => ({
                        ...acc,
                        [key]: value
                    }),
                    {}
                );

            return Object.values(newState).length === 0 ? {} : newState;
        },
        resolveStateSelectedDimensionValues({ results = this.result, subState }) {
            const { selectedDimension } = this.props;
            let isAnotherDimension = false;
            const flattedRows = results.flatMap(({ rows }) => rows);

            const dimensionValues = Object.entries(subState ?? {}).flatMap(([key, value]) => {
                if (key === selectedDimension) {
                    return value;
                }

                const storeValues = Array.isArray(value) ? value.map((val) => String(val)) : [String(value)];
                return flattedRows
                    .filter((row) => {
                        if (Object.entries(row).every(([rowKey]) => rowKey !== key)) {
                            return false;
                        }

                        isAnotherDimension = true;
                        return storeValues.includes(String(row[key]));
                    })
                    .map((row) => row[selectedDimension]);
            });

            return {
                dimensionValues: uniq(dimensionValues),
                isAnotherDimension
            };
        },
        clearStore(isFullReset = false) {
            this.applyStoreFilters();

            const { metrics, dimensions } = this.queryHelper.reduce(
                (obj, { query, dimensionList }) => {
                    obj.metrics = [...obj.metrics, ...Query.queryMetricNames(query)];
                    obj.dimensions = [...obj.dimensions, ...Object.keys(dimensionList)];
                    return obj;
                },
                { metrics: [], dimensions: [] }
            );

            let clearedState = [...metrics, ...dimensions].reduce(
                (acc, key) => ({
                    ...acc,
                    [key]: null
                }),
                {}
            );

            if (this.props.isResetToDefault && !isFullReset) {
                clearedState = {
                    ...clearedState,
                    ...this.firstSubState,
                    [this.props.selectedDimension]:
                        this.firstDimensionValues.length > 0 ? this.firstDimensionValues : null
                };
            }
            this.state = clearedState;

            this.$storeCommit(clearedState);
            this.valueDimension = '';
            this.triggerResetEvent();
        },
        buildNewState(dimension) {
            const filteredRows = this.allDatasetsRows.filter((row) => {
                const rowEntries = Object.entries(row);
                return (
                    rowEntries.some(([key]) => this.smartSearchDimensions.includes(key)) &&
                    rowEntries.some(
                        ([key, value]) =>
                            dimension !== '' && String(value).toLowerCase().includes(dimension.toLowerCase())
                    )
                );
            });

            if (filteredRows.length === 0) {
                const foundRowKeys = this.smartSearchDimensions.flatMap((dim) => {
                    const foundRow = this.allDatasetsRows.find((row) => Object.keys(row).includes(dim));

                    return foundRow != null ? Object.keys(foundRow) : [];
                });

                return foundRowKeys.reduce((acc, key) => {
                    const foundDremio = this.result.find(({ schema }) => schema.some(({ name }) => key === name));
                    const { schema = [] } = foundDremio;
                    const foundDimType = schema.find(({ name }) => name === key);
                    const NonExistentValue = DremioFieldTypes.NUMBER_TYPES.includes(foundDimType.type)
                        ? NonExistentValues.NUMBER
                        : NonExistentValues.STRING;

                    return {
                        ...acc,
                        [key]: dimension === '' ? null : NonExistentValue
                    };
                }, {});
            }

            return filteredRows.reduce((state, row) => {
                const rowEntries = Object.entries(row);

                return rowEntries.reduce((acc, [key, value]) => {
                    if (acc[key] == null) {
                        acc[key] = [value];
                    }

                    acc[key] = [...new Set([...acc[key], value])];

                    return acc;
                }, state);
            }, {});
        },
        resolveSearchValue(value) {
            if ((this.findDimension === value || this.props.minSearchingLength > value.length) && value !== '') {
                return;
            }

            const {
                props: { isSmartSearch, paginationOptions }
            } = this;
            this.singleSelect = '';

            if (isSmartSearch) {
                const newState = this.buildNewState(value);

                this.$storeCommit(newState);
                this.findDimension = this.valueDimension;
                return;
            }

            this.findDimension = value;

            if (paginationOptions.isEnable) {
                this.filterDremio();
            }
        },
        /**
         * @param {string} paramVal
         * @return {Object}
         */
        resolveOptionClasses(dimensionName) {
            const {
                props: { isSingleSelectBacklight },
                singleSelect
            } = this;
            return {
                'option--selected': isSingleSelectBacklight && singleSelect === dimensionName
            };
        },
        selectAllDimensions() {
            const dataIds = this.filteredList.map(({ index }) => index);
            this.data = this.data.map((filter) => ({ ...filter, selected: dataIds.includes(filter.index) }));
            this.multiSelect = [...this.data.filter(({ selected }) => selected)];
        },
        filterDremio() {
            const {
                props: { paginationOptions, isSmartSearch, dremio }
            } = this;
            if (!paginationOptions.isEnable || isSmartSearch) {
                return;
            }

            if (dremio.length === 0) {
                return;
            }

            this.page = 1;

            if (this.findDimension === '') {
                this.queryHelper = this.queryHelper.map((helper) => {
                    if (!Object.keys(helper.dimensionList).includes(this.props.selectedDimension)) {
                        return helper;
                    }
                    helper.query = Query.queryRemoveFilter(helper.query, this.props.selectedDimension);
                    return helper;
                });
                this.loadData();
                return;
            }

            const newFilter = Query.createFilter({
                name: this.props.selectedDimension,
                type: Query.FILTER_TYPE.LIKE,
                // eslint-disable-next-line no-restricted-syntax
                value: [`%${this.findDimension}%`]
            });

            this.queryHelper = this.queryHelper.map((helper) => {
                if (!Object.keys(helper.dimensionList).includes(this.props.selectedDimension)) {
                    return helper;
                }
                helper.query = Query.queryInsertUpdateFilter(helper.query, newFilter);
                return helper;
            });

            this.loadData();
        },
        clearInput() {
            this.findDimension = '';
            this.filterDremio();
            this.applyStoreFilters();
        },
        formatMetric(metric) {
            const { format } = this.props.metricOptions;
            return formatNumber(metric, format);
        }
    },
    implicitCssModule: true
};
</script>
