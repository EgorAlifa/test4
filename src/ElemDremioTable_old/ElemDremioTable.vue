<template>
    <div :class="cssClasses" :style="cssStyles">
        <template v-if="isEditorMode">
            <div v-if="!props.dremio" class="alert alert-warn">
                <div class="alert-body text-small">Query schema not defined.</div>
            </div>
        </template>
        <template v-if="result != null">
            <button
                v-if="anyDimensionStateGoPrevAvailable"
                class="btn btn-inline pull-right"
                @click="anyDimensionStateGoPrev">
                <i class="mdi mdi-undo"></i>
            </button>

            <ui-grid class="grid-table" :class="{ 'table-borders': props.rowBorder.enable }" v-bind="GridProps">
                <template #thead="{ style }">
                    <div v-if="showHeader" ref="thead" class="thead" :style="style">
                        <w-top-header
                            v-if="props.topHeaders.length > 0"
                            v-bind="{ parentRefs: $refs, topHeaders: props.topHeaders }" />
                        <component :is="rowRender" class="tr">
                            <component
                                v-for="(column, i) in props.columns"
                                ref="headCells"
                                :is="headCellRender"
                                :key="i"
                                :style="getColumnStyle(column)"
                                v-bind="buildHeadCellBinds(column)"
                                class="th"
                                @column-sorted="onHeaderSortClick" />
                        </component>
                    </div>
                </template>
                <template #tbody="{ style }">
                    <div ref="tbody" class="tbody scroll-y" :style="style">
                        <div v-if="noRows">
                            <div :class="props.alertNoRows.classes">{{ props.alertNoRows.text }}</div>
                        </div>

                        <component
                            v-for="(row, rowIndex) in result.rows"
                            :is="rowRender"
                            :key="rowIndex"
                            :data-row="rowIndex"
                            v-bind="buildRowBinds(row)"
                            class="tr"
                            v-on="rowMouseEvents">
                            <template #default="{ select }">
                                <component
                                    v-for="(column, cellIndex) in props.columns"
                                    :is="getRenderComponent(column.render)"
                                    :key="cellIndex"
                                    class="td"
                                    :style="getColumnStyleCell(column)"
                                    :data-row="rowIndex"
                                    :data-column="cellIndex"
                                    v-bind="getRenderBinds(column, rowIndex, row)"
                                    v-on="{ click: select, ...resolveRenderEvents(column) }" />
                            </template>
                            <template #table>
                                <slot name="table">
                                    <code v-if="isEditorMode">table slot</code>
                                </slot>
                            </template>
                        </component>
                        <div v-if="props.isRowSlotShown" class="result-row tr w-100" data-slot="row">
                            <slot name="row">
                                <code v-if="isEditorMode">row slot</code>
                            </slot>
                        </div>
                    </div>
                </template>
                <template #tfoot="{ style }">
                    <div class="tfoot" :style="style">
                        <component
                            :is="paginationRender"
                            v-if="pages > 1"
                            v-bind="{ page, pages, settings: props.pagination }"
                            @select="(page) => loadDataPage(page)"></component>

                        <div class="w-100" v-if="props.isFooterSlotShown" data-slot="footer">
                            <slot name="footer">
                                <code v-if="isEditorMode">footer slot</code>
                            </slot>
                        </div>
                    </div>
                </template>
            </ui-grid>
        </template>

        <div v-if="loading" class="shim" :class="shimClass">
            <div class="shim-content d-flex flex-v-center flex-h-center h-100">
                <div class="preloader pad-l1 color-primary"></div>
            </div>
        </div>
        <div v-if="props.columns.length === 0" class="alert alert-warn">
            <div class="alert-body text-small">No columns defined.</div>
        </div>
    </div>
</template>
<script>
import { Elem } from '@goodt-wcore/elem';
import { Query, mixin as DremioMixin } from '@goodt-common/dremio';
import { Tooltip as UiTooltip, Grid as UiGrid } from 'goodteditor-ui';

import { isEqual, isEmpty } from 'lodash';

import { meta } from './descriptor';
import { mixin as DeviationMixin } from './deviations/DeviationMixin';
import {
    cssStrToObj,
    ColumnParamTypes,
    ColumnParamFormats,
    ColumnParamStyleTypes,
    ColumnParamStyleValueTypes,
    GridProps,
    RenderTypes,
    ColumnRenders,
    shouldUseCssRule
} from './utils';

import Panels, { ContextPanelAsync, PaginationPanelAsync } from './panels';
import { AdditionalDremioPanelAsync, DeviationPanelAsync } from './deviations/panels';
import { HeadCell, Pagination, TableRow, TopHeader as WTopHeader } from './components';
import { ElemInstanceTypeDescriptor } from './types';

export default {
    extends: Elem,
    meta,
    components: { UiTooltip, UiGrid, WTopHeader },
    mixins: [DremioMixin, DeviationMixin],
    provide() {
        return {
            cssStrToObj: this.cssStrToObj,
            getAllSelectedRows: this.getAllSelectedRows,
            updateAllSelectedRows: this.updateAllSelectedRows
        };
    },
    props: {
        columnRenders: {
            type: Object,
            default() {
                return ColumnRenders;
            }
        },
        columnParamFormats: {
            type: Object,
            default() {
                return ColumnParamFormats;
            }
        },
        // eslint-disable-next-line vue/no-unused-properties
        columnParamStyleTypes: {
            type: Object,
            default() {
                return ColumnParamStyleTypes;
            }
        },
        // eslint-disable-next-line vue/no-unused-properties
        columnParamStyleValueTypes: {
            type: Object,
            default() {
                return ColumnParamStyleValueTypes;
            }
        },
        columnParamTypes: {
            type: Object,
            default() {
                return ColumnParamTypes;
            }
        },
        rowRender: {
            type: Object,
            default() {
                return TableRow;
            }
        },
        paginationRender: {
            type: Object,
            default() {
                return Pagination;
            }
        },
        headCellRender: {
            type: Object,
            default() {
                return HeadCell;
            }
        }
    },
    data() {
        return {
            /** @public */
            slotDefault: 'table',
            rowMouseEvents: {
                click: this.onRowMouseEvent,
                mouseenter: this.onRowMouseEvent,
                mouseleave: this.onRowMouseEvent,
                'update:selected-row': this.onUpdateSelectedRow
            },
            /** @public */
            loadDataHooks: {
                before: (cancel) => {
                    const isRequestCanceled = this.onLoadDataHookBefore(cancel);

                    if (isRequestCanceled) {
                        return;
                    }

                    this.loadDataHooks.defaults.before(cancel);
                },
                then: (res) => {
                    this.onLoadDataHookThen(res);
                }
            },
            selectedRow: null,
            currentRoute: null,
            allSelectedRows: [],
            ...ElemInstanceTypeDescriptor
        };
    },
    computed: {
        /**
         * @return {Record<string, boolean>}
         */
        shimClass() {
            return { compacted: this.props.shouldShimBlockTable };
        },
        /**
         * @return boolean
         */
        anyDimensionStateGoPrevAvailable() {
            const { queryHelper } = this;
            if (queryHelper == null) {
                return false;
            }
            return Object.keys(queryHelper.dimensionList).some(
                (name) => queryHelper.dimensionStateExists(name) && !queryHelper.dimensionStateIsFirst(name)
            );
        },
        /**
         * @return Record<string, number>
         */
        metricsMaxValues() {
            const { queryHelper, result } = this;
            const metricNames = Query.queryMetricNames(queryHelper.query);
            return metricNames.reduce((obj, name) => {
                obj[name] = Math.max(...result.rows.map(({ [name]: value }) => value));
                return obj;
            }, {});
        },
        /**
         * @return Record<string, string>
         */
        cssClasses() {
            return Object.fromEntries(Object.entries(this.cssClass).filter(([className]) => className !== 'scroll-y'));
        },
        /**
         * @return Record<string, string>
         */
        cssStyles() {
            return Object.fromEntries(
                Object.entries(this.cssStyle).filter(([styleName]) => styleName !== 'overflow-y')
            );
        },
        /**
         * @return boolean
         */
        noRows() {
            const { result, props } = this;
            return result?.rows.length === 0 && props.alertNoRows.isShown;
        },
        /**
         * @return boolean
         */
        showHeader() {
            const { noRows, props } = this;
            return noRows ? props.alertNoRows.withColumns : props.showHead;
        }
    },
    static: {
        GridProps
    },
    watch: {
        /**
         * @param {Record<string, any>} row
         */
        selectedRow(row) {
            this.onSelectedRowChange(row);
        }
    },
    mounted() {
        this.currentRoute = { ...this.$routeCurrent };
        this.createMutationObserver();
    },
    beforeDestroy() {
        this.resetSelectedRow();
        this.observer?.disconnect();
    },
    methods: {
        /**
         * @public
         * @return {import('vue/types/options').AsyncComponentFactory[]}
         */
        getPanels() {
            return [
                ...Panels,
                this.getPaginationPanel(),
                this.getContextPanel(),
                this.getAdditionalDremioPanel(),
                this.getDeviationPanel()
            ];
        },
        /**
         * @return {import('vue/types/options').AsyncComponentFactory}
         */
        getPaginationPanel() {
            return PaginationPanelAsync;
        },
        /**
         * @return {import('vue/types/options').AsyncComponentFactory}
         */
        getContextPanel() {
            return ContextPanelAsync;
        },
        /**
         * @return {import('vue/types/options').AsyncComponentFactory}
         */
        getAdditionalDremioPanel() {
            return AdditionalDremioPanelAsync;
        },
        /**
         * @return {import('vue/types/options').AsyncComponentFactory}
         */
        getDeviationPanel() {
            return DeviationPanelAsync;
        },
        /**
         * @param {string} str
         * @return Record<string, string>
         */
        cssStrToObj(str) {
            return cssStrToObj(str);
        },
        /**
         *  @effect selectedRow
         */
        setSelectedRow() {
            const { result } = this;
            const { rowSelectFieldsMap } = this.splitDremioFilters(this.$storeState);

            if (isEmpty(rowSelectFieldsMap) || result == null) {
                return;
            }

            const { rows = [] } = result;

            if (
                rows.some((row) =>
                    Object.entries(rowSelectFieldsMap).some(([key, value]) => key in row && value === null)
                )
            ) {
                // selected row can be an array in a successor
                this.selectedRow = Array.isArray(this.selectedRow) ? [] : null;
                return;
            }

            const foundRow = rows.find((row) =>
                Object.entries(row).some(([key, value]) => rowSelectFieldsMap[key] === value)
            );

            if (foundRow != null) {
                this.selectedRow = Array.isArray(this.selectedRow) ? [foundRow] : foundRow;
            }
        },
        /**
         *  @effect selectedRow
         */
        setDefaultSelectedRow() {
            const { enable, field, value } = this.props.defaultValue;

            if (enable === false || field == null) {
                return;
            }
            const foundRow = this.result?.rows.find((row) => row[field] === value);
            if (foundRow != null) {
                // selected row can be an array in the successor
                this.selectedRow = Array.isArray(this.selectedRow) ? [foundRow] : foundRow;
            }
        },
        /**
         *  @param {Record<string, any>} row
         */
        onSelectedRowChange(row) {
            const { filterValueKey } = this.props;
            const state = row == null ? { [filterValueKey]: null } : { [filterValueKey]: row[filterValueKey] };
            this.$storeCommit(state);
        },
        /**
         *  @param {number} [page=1]
         *  @effect page
         */
        loadDataPage(page = 1) {
            this.page = page;
            this.loadData();
        },
        /**
         *
         */
        anyDimensionStateGoPrev() {
            Object.keys(this.queryHelper.dimensionList).forEach((dimensionName) =>
                this.queryHelper.dimensionStateGoPrev(dimensionName)
            );
            this.loadDataPage();
        },
        /**
         *  @public
         *  @param {string} dimensionName
         *  @return boolean
         */
        canGoNextDimension(dimensionName) {
            return this.queryHelper ? !this.queryHelper.dimensionStateIsLast(dimensionName) : false;
        },
        /**
         *  @public
         *  @param {string} dimensionName
         *  @param {any} value
         */
        goNextDimension(dimensionName, value) {
            if (this.queryHelper == null) {
                return;
            }
            this.queryHelper.dimensionStateGoNext(dimensionName, [value], Query.FILTER_TYPE.EQ);
            this.loadData();
        },
        /**
         *  @public
         *  @param {DColumn} column
         *  @return Query.SORT_TYPE
         */
        getColumnSortType(column) {
            const sortItem = this.queryHelper.query[Query.KEY.SORT].find((el) => Query.getSortName(el) === column.sort);
            return sortItem ? Query.getSortType(sortItem) : Query.SORT_TYPE.ASC;
        },
        /**
         *  @param {DColumn} column
         *  @return Record<string, string>
         */
        getColumnStyle(column) {
            return this.cssStrToObj(column.style);
        },
        /**
         *  @param {DColumn} column
         *  @return Record<string, string>
         */
        getColumnStyleCell(column) {
            return this.cssStrToObj(column.styleCell);
        },
        /**
         *  @param {Record<string, string>} row
         *  @return Record<string, any>
         */
        buildRowBinds(row) {
            return {
                row,
                selected: this.selectedRow,
                hasStylePriority: this.props.hasRowStylePriority
            };
        },
        /**
         *  @param {string} renderKey
         *  @return {Record<string, any>|null}
         */
        getRenderComponent(renderKey) {
            const info = this.columnRenders[renderKey];
            return info ? info.component : null;
        },
        /**
         *  @param {DColumn} column
         *  @param {number} rowIndex
         *  @param {Record<string, any>} row
         *  @return Record<string, any>
         */
        getRenderBinds({ render, tooltip, params }, rowIndex, row) {
            const { queryHelper, loadDataPage, offset } = this;
            const { canRowToggleItself } = this.props;
            const binds = {
                queryHelper,
                queryLoadData: loadDataPage,
                canRowToggleItself,
                tooltip: tooltip.value == null ? tooltip : {...tooltip, value: row[tooltip.value]},
                rowIndex,
                queryOffset: offset
            };
            if (render === RenderTypes.PROGRESS) {
                binds.metricsMaxValues = this.metricsMaxValues;
            }
            const createParamBind = ({ value, type, format, formatOpt, style }) => {
                const typeInfo = this.columnParamTypes[type];
                const formatInfo = this.columnParamFormats[format];
                //
                const valueReplaced = typeInfo != null ? typeInfo.handler(value, row) : value;
                const formatHandler = () => (formatInfo ? formatInfo.handler(valueReplaced, formatOpt) : valueReplaced);
                const styleHandler = () => this.buildColumnParamStyle(style, row, valueReplaced);
                const cssClassHandler = () => this.buildColumnParamCssClass(style, row, valueReplaced);
                return {
                    name: value,
                    value: valueReplaced,
                    format: formatHandler,
                    style: styleHandler,
                    cssClass: cssClassHandler
                };
            };
            Object.entries(params).forEach(([name, val]) => {
                binds[name] = Array.isArray(val) ? val.map(createParamBind) : createParamBind(val);
            });
            return binds;
        },
        /**
         *  @param {DColumnParamStyle[]} conditions
         *  @param {Record<string, any>} row
         *  @param {string} valueReplaced
         *  @return Record<string, string>
         */
        buildColumnParamStyle(conditions, row, valueReplaced) {
            return conditions.reduce((acc, condition) => {
                if (shouldUseCssRule(condition, row, valueReplaced) === false) {
                    return acc;
                }
                return { ...acc, ...this.cssStrToObj(condition.style) };
            }, {});
        },
        /**
         *  @param {DColumnParamStyle[]} conditions
         *  @param {Record<string, any>} row
         *  @param {string} valueReplaced
         *  @return string[]
         */
        buildColumnParamCssClass(conditions, row, valueReplaced) {
            return conditions.reduce((acc, condition) => {
                if (shouldUseCssRule(condition, row, valueReplaced) === false) {
                    return acc;
                }
                const { cssClass = [] } = condition;
                return [...acc, ...cssClass];
            }, []);
        },
        /**
         *  method for overwrite by successor
         *  @param {DColumn} column
         *  @return Record<string, any>
         */
        resolveRenderEvents(column) {
            return {};
        },
        /**
         *  @param {DColumn} column
         *  @return Record<string, any>
         */
        buildHeadCellBinds(column) {
            return {
                column,
                getColumnSortType: this.getColumnSortType
            };
        },
        /**
         *  @param {MouseEvent} e
         */
        onRowMouseEvent(e) {
            const { currentTarget: elem } = e;
            // eslint-disable-next-line no-underscore-dangle
            const elVue = elem.__vue__;
            let children = elVue
                ? elVue.$children
                : [...elem.querySelectorAll('[data-row]')]
                    // eslint-disable-next-line no-underscore-dangle
                    .map((el) => el.__vue__)
                    .filter((el) => el != null);
            children = children.filter((el) => el.type !== this.type);
            // eslint-disable-next-line no-restricted-syntax
            for (const child of children) {
                const res = child.onRowMouseEvent?.(e);
                if (res === false) {
                    return;
                }
            }
        },
        /**
         *  @param {Record<string, any>} row
         *  @effect selectedRow
         */
        onUpdateSelectedRow(row) {
            this.updateAllSelectedRows(row);
            this.selectedRow = isEqual(this.selectedRow, row) ? null : row;
        },
        /**
         *  @return {Record<string, any>}[]
         */
        getAllSelectedRows() {
            const { allSelectedRows } = this;
            return allSelectedRows;
        },
        /**
         *  @param {Record<string, any>} row
         *  @effect allSelectedRows
         */
        updateAllSelectedRows(row) {
            const { allSelectedRows } = this;

            const includedRowIndex = allSelectedRows.findIndex((selectedRow) => isEqual(selectedRow, row));
            if (includedRowIndex === -1) {
                this.allSelectedRows = [...this.allSelectedRows, row];
                return;
            }
            allSelectedRows.splice(includedRowIndex, 1);
        },
        /**
         *  @param {DColumn} column
         */
        onHeaderSortClick({ sort }) {
            const { query, dimensionList } = this.queryHelper;
            const dimensionMetricNames = [...Query.queryMetricNames(query), ...Object.keys(dimensionList)];
            const {
                KEY: { SORT },
                SORT_TYPE: { ASC, DESC }
            } = Query;

            if (!dimensionMetricNames.includes(sort)) {
                return;
            }

            const sortFiltered = query[SORT].filter((el) => Query.getSortName(el) === sort);
            const [sortItem] = sortFiltered;

            if (sortItem != null) {
                const type = Query.getSortType(sortItem) === ASC ? DESC : ASC;
                Query.createSort({ type }, sortItem);
            } else {
                sortFiltered.unshift(Query.createSort({ name: sort, type: ASC }));
            }

            query[SORT] = sortFiltered;

            this.loadDataPage(this.page);
        },
        /**
         * @param {import('goodt-dremio-sdk').DremioResult} result
         */
        async onLoadDataHookThen(/* result */) {
            await this.loadAddlData();
            this.setDefaultSelectedRow();
            this.setSelectedRow();
        },
        /**
         * @param {Function} cancel
         * @return {boolean} canceled request already or not
         */
        onLoadDataHookBefore(cancel) {
            const { isWaitingForStoreState } = this.props;
            const { dremioFiltersMap } = this.splitDremioFilters(this.$storeState);
            const shouldHideTable =
                isWaitingForStoreState && Object.values(dremioFiltersMap).every((filter) => filter == null);

            if (shouldHideTable) {
                this.result = null;
                cancel();
                return true;
            }

            return false;
        },
        /**
         * Creates a new dremio query filter
         * @public
         * @param {string} filterName                           metric/dimension/field name
         * @param {string|string[]} value                       filter value
         * @return {Filter}
         */
        createDremioFilter(filterName, value) {
            const isArray = Array.isArray(value);
            const filterValue = [value].flat();
            const isLike = this.props.filterLikeFields.includes(filterName);
            const isNull = filterValue.includes(null);
            const { FILTER_TYPE } = Query;

            if (isNull) {
                return Query.createFilter({
                    name: filterName,
                    type: FILTER_TYPE.IS,
                    value: filterValue
                });
            }
            if (isLike) {
                return Query.createFilter({
                    name: filterName,
                    type: FILTER_TYPE.LIKE,
                    value: filterValue
                });
            }
            if (isArray) {
                return Query.createFilter({
                    name: filterName,
                    type: FILTER_TYPE.IN,
                    value: filterValue
                });
            }
            return Query.createFilter({
                name: filterName,
                type: FILTER_TYPE.EQ,
                value: filterValue
            });
        },
        /**
         *  @public
         *  @param {Record<string, any>} state
         */
        storeStateWatcher(state) {
            if (isEmpty(state)) {
                return;
            }

            const { dremioFiltersMap: filters } = this.splitDremioFilters(state);
            const applyAnyDremioFilters = this.applyAddlDremioFilters(filters) || this.applyDremioFilters(filters);

            // eslint-disable-next-line no-restricted-syntax
            if (applyAnyDremioFilters) {
                this.loadDataPage();
                return;
            }

            this.setDefaultSelectedRow();
            this.setSelectedRow();
        },
        /**
         *  @param {Record<string, any>} state
         *  @return {{dremioFiltersMap: Record<string, any>, rowSelectFieldsMap: Record<string, any>}}
         */
        splitDremioFilters(state) {
            const { varAliases } = this.props;
            return Object.entries(state).reduce(
                (obj, [key, value]) => {
                    const alias = varAliases[key];
                    if (alias != null && 'listen' in alias && 'trigger' in alias) {
                        obj.rowSelectFieldsMap[key] = value;
                        return obj;
                    }
                    obj.dremioFiltersMap[key] = value;
                    return obj;
                },
                { dremioFiltersMap: {}, rowSelectFieldsMap: {} }
            );
        },
        resetSelectedRow() {
            const { selectedRow, currentRoute, $routeCurrent } = this;
            const { shouldResetSelectedRow } = this.props;

            if (selectedRow != null && shouldResetSelectedRow && currentRoute?.path === $routeCurrent?.path) {
                this.onSelectedRowChange(null);
            }
        },
        /**
         * @effect observer
         *
         */
        createMutationObserver() {
            const config = {
                childList: true,
                attributes: true,
                // eslint-disable-next-line no-restricted-syntax
                attributeFilter: ['class', 'style']
            };

            this.observer = new MutationObserver((mutations) => {
                const offsetClass = 'scroll-offset';

                mutations.filter(Boolean).forEach(() => {
                    const { thead, tbody } = this.$refs;

                    if ([thead, tbody].some(isEmpty)) {
                        return;
                    }

                    thead.classList[tbody.clientWidth - thead.clientWidth !== 0 ? 'add' : 'remove'](offsetClass);
                });
            });

            this.observer.observe(this.$el, config);
        }
    }
};
</script>
<style scoped lang="less" src="./styles/style.less"></style>
