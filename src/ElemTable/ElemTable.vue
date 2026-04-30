<template>
    <w-elem :placeholder="$placeholder">
        <w-table :is-loading="isLoading" :is-cards-mode="props.cardsMode.isEnabled">
            <template #header>
                <slot name="header"><code v-if="isEditorMode">Header slot</code></slot>
            </template>
            <template #default>
                <div class="d-flex flex-col">
                    <div :class="{ 'cards-grid': props.cardsMode.isEnabled }">
                        <w-data-aggregator
                            v-for="(rowData, rowIndex) of dataRows"
                            :key="resolvedRowKeys[rowIndex]"
                            v-bind="{
                                rowData,
                                rowIndex,
                                fieldToSelectFilter: props.fieldToSelectFilter,
                                metricForSelect: props.metricForSelect
                            }">
                            <slot>
                                <code v-if="isEditorMode">Data slot</code>
                            </slot>
                        </w-data-aggregator>
                    </div>

                    <div v-if="props.resultRow.isEnabled" class="result-row w-100" data-slot="resultRow">
                        <slot name="resultRow">
                            <code v-if="isEditorMode">Result slot</code>
                        </slot>
                    </div>
                </div>
            </template>
            <template #footer>
                <slot name="footer"><code v-if="isEditorMode">Footer slot</code></slot>
            </template>

            <template #preload>
                <w-table-skeleton
                    v-if="props.shouldDisplaySkeleton"
                    :rows-count="limit"
                    :columns-count="dimensionMetricNames.length" />
                <div v-else class="shim">
                    <div class="shim-content d-flex flex-center h-100">
                        <div class="preloader color-blue"></div>
                    </div>
                </div>
            </template>
        </w-table>
    </w-elem>
</template>
<script>
import { Elem } from '@goodt-wcore/elem';
import { useElemDatasetMixin, ElemDatasetMixinTypes } from '@goodt-common/data';
import { Url } from '@goodt-common/utils';
import { StoreManager } from '@goodt-wcore/managers';
import { useRouteQueryManager } from '@goodt-wcore/utils';
import { isEmpty, pick, omit, zipObject, zip, at, cloneDeep, differenceBy, uniqBy } from 'lodash';

import { useTable, ControlType } from '@goodt-widgets-insight/table-common';
import { meta } from './descriptor';
import { ElemInstanceTypeDescriptor } from './types';
import { Table as WTable, DataAggregator as WDataAggregator, TableSkeleton as WTableSkeleton } from './components';
import { buildTableChildren, filterOrExtendWith } from './utils';

/**
 * @typedef {import('@goodt-common/data').Request} IRequest
 * @typedef {import('@goodt-common/data').IDatasetResultExtended} IResult
 */

const DatasetMixin = useElemDatasetMixin({
    deviations: true,
    panel: { isMultiple: true }
});
const { addRouteQueryParams } = useRouteQueryManager();
const { store, ValueObject } = StoreManager;

export default {
    extends: Elem,
    components: { WTable, WDataAggregator, WTableSkeleton },
    mixins: [useTable(), DatasetMixin],
    inject: {
        $setElemChildren: {
            default: null
        },
        $createEntity: {
            default: null
        },
        childTable: {
            default: null
        }
    },
    meta,
    hooks: {
        before(cancel) {
            this.onLoadDataHookBefore(cancel);
        },
        then(result) {
            this.onLoadDataHookThen(result);
        }
    },
    data: (/* vm */) => ({
        /** @type {IResult['rows'][]} */
        dataRows: [],
        /**
         * @property {Record<string, any>[]}
         */
        selectedRows: [],
        /**
         * @property {string[]}
         */
        checkedFormControls: [],
        unwatchDataRows: null
    }),
    computed: {
        /**
         * @public
         * @return string[]
         */
        dimensionMetricNames() {
            return [...this.dimensions, ...this.metrics];
        },
        /**
         * @return {boolean}
         */
        hasDeviations() {
            return this.props[this.DEVIATIONS_PROP].refDatasetIndex != null;
        },
        /**
         * @public
         * @return string[]
         */
        deviationsNames() {
            return this.props[this.DEVIATIONS_PROP]?.rules.map(({ name }) => name) ?? [];
        },
        /**
         * @return {IResult['schema']}
         */
        mergedSchema() {
            return this.hasDeviations
                ? this.results
                      .filter(Boolean)
                      .reduce((acc, { schema }) => [...acc, ...differenceBy(schema, acc, 'name')], [])
                : this.result?.schema;
        },
        /**
         * @override
         * @return {IRequest|null}
         */
        request() {
            const { refDatasetIndex } = this.props[this.DEVIATIONS_PROP];
            return this.requests[refDatasetIndex ?? 0];
        },
        rowKeyField() {
            const { metricForSelect, fieldToSelectFilter } = this.props;

            if (metricForSelect != null && metricForSelect !== '') {
                return metricForSelect;
            }

            if (fieldToSelectFilter != null && fieldToSelectFilter !== '') {
                return fieldToSelectFilter;
            }

            return this.dimensions[0] ?? null;
        },
        resolvedRowKeys() {
            const rowKeyCounters = {};
            const { dataRows, rowKeyField } = this;

            return dataRows.map((rowData, rowIndex) => {
                const rowKeyValue = rowKeyField != null ? rowData?.[rowKeyField] : null;
                const isRowKeyPrimitive = ['string', 'number', 'boolean'].includes(typeof rowKeyValue);
                const isRowKeyValid = isRowKeyPrimitive && `${rowKeyValue}` !== '';
                const baseKey = isRowKeyValid ? `${rowKeyField}:${rowKeyValue}` : `rowIndex:${rowIndex}`;
                const counter = rowKeyCounters[baseKey] ?? 0;

                rowKeyCounters[baseKey] = counter + 1;
                return counter === 0 ? baseKey : `${baseKey}#${counter}`;
            });
        }
    },
    created() {
        this.unwatchDataRows = this.$watch(
            () => (this.hasDeviations ? this.results : this.result),
            () => {
                this.buildDataRows();
            }
        );
    },
    beforeDestroy() {
        if (typeof this.unwatchDataRows === 'function') {
            this.unwatchDataRows();
            this.unwatchDataRows = null;
        }

        this.checkedFormControls = [];
        this.selectedRows = [];
        this.dataRows = [];
    },
    methods: {
        ...ElemDatasetMixinTypes,
        ...ElemInstanceTypeDescriptor,
        isMetricForSelectSpecified(metricForSelect = this.props.metricForSelect) {
            return metricForSelect != null && metricForSelect !== '';
        },
        buildDataRows() {
            const { results, props, deviations } = this;
            const { refDatasetIndex } = props[this.DEVIATIONS_PROP];
            const { metricForSelect } = this.props;
            const refResult = results[refDatasetIndex];

            if (refResult == null) {
                this.dataRows = this.result?.rows ?? [];
                this.syncSelectedRowsWithDataRows();
                if (this.isMetricForSelectSpecified(metricForSelect)) {
                    const stateValue = this.$storeState[metricForSelect];
                    this.setSelectedRowsByDataValues(stateValue);
                    this.setCheckedFormControls();
                }
                return;
            }

            const resultsRows = results.map((result) => result?.rows ?? []);
            const rowsCount = refResult.rows.length;
            const mergedRows = new Array(rowsCount);
            for (let index = 0; index < rowsCount; index++) {
                const deviationRow = deviations?.rows[index];
                const mergedRow = deviationRow == null ? {} : { ...deviationRow };

                for (let rowIndex = 0; rowIndex < resultsRows.length; rowIndex++) {
                    const row = resultsRows[rowIndex][index];
                    if (row != null) {
                        Object.assign(mergedRow, row);
                    }
                }

                mergedRows[index] = mergedRow;
            }
            this.dataRows = mergedRows;
            this.syncSelectedRowsWithDataRows();

            if (this.isMetricForSelectSpecified(metricForSelect)) {
                const stateValue = this.$storeState[metricForSelect];
                this.setSelectedRowsByDataValues(stateValue);
                this.setCheckedFormControls();
            }
        },
        /**
         * @param {null|string|string[]} stateValue
         */
        setSelectedRowsByDataValues(stateValue) {
            const { metricForSelect } = this.props;

            if (metricForSelect == null || metricForSelect === '' || stateValue == null) {
                this.selectedRows = [];
                return;
            }

            const stateValueSet = new Set(
                [stateValue].flat().flatMap((v) =>
                    String(v)
                        .split(',')
                        .map((s) => s.trim())
                )
            );
            const selectedRows = [...this.selectedRows, ...this.dataRows].filter((row) =>
                stateValueSet.has(String(row?.[metricForSelect]))
            );

            this.selectedRows = uniqBy(selectedRows, metricForSelect);
        },
        syncSelectedRowsWithDataRows() {
            const {
                selectedRows,
                dataRows,
                props: { metricForSelect }
            } = this;

            if (metricForSelect == null || metricForSelect === '') {
                return;
            }

            if (selectedRows.length === 0) {
                return;
            }

            const normalizeKey = (value) => (value == null ? null : String(value));

            const dataRowsByKey = dataRows.reduce((acc, rowData) => {
                const rowKey = normalizeKey(rowData?.[metricForSelect]);
                if (rowKey != null && rowKey !== '' && acc.has(rowKey) === false) {
                    acc.set(rowKey, rowData);
                }
                return acc;
            }, new Map());

            const syncedSelectedRows = selectedRows.reduce((acc, rowData) => {
                const rowKey = normalizeKey(rowData?.[metricForSelect]);
                if (rowKey == null || rowKey === '') {
                    return acc;
                }

                const actualRowData = dataRowsByKey.get(rowKey);
                if (actualRowData != null) {
                    acc.push(actualRowData);
                }
                return acc;
            }, []);

            this.selectedRows = uniqBy(syncedSelectedRows, metricForSelect);
        },
        /**
         * @public
         */
        $queryInitParamsStoreFilters() {
            const { metricForSelect } = this.props;
            const metricForSelectToOmit = this.isMetricForSelectSpecified(metricForSelect) ? metricForSelect : [];
            const paramsState = omit(pick(this.$storeState, this.$storeWatchHandlerVars), metricForSelectToOmit);
            this.$storeApplyQueryFilters(paramsState);
        },
        /**
         * Store state watch handler
         * @public
         * @param {Record<string, any>} state
         */
        $storeWatchHandler(state) {
            const { metricForSelect } = this.props;

            const stateClearedFromEmptyArrays = Object.fromEntries(
                Object.entries(state).map(([key, value]) =>
                    Array.isArray(value) && value.length === 0 ? [key, null] : [key, value]
                )
            );

            if (this.isMetricForSelectSpecified(metricForSelect)) {
                const stateValue = stateClearedFromEmptyArrays[metricForSelect];
                this.setSelectedRowsByDataValues(stateValue);
                this.setCheckedFormControls();

                this.super(DatasetMixin).$storeWatchHandler.call(
                    this,
                    omit(stateClearedFromEmptyArrays, metricForSelect)
                );
                return;
            }

            const isEmptyState =
                Object.keys(stateClearedFromEmptyArrays).length === 0 ||
                Object.values(stateClearedFromEmptyArrays).every((stateValue) => stateValue == null);

            if (isEmptyState) {
                this.selectedRows = [];
                this.checkedFormControls = [];
            }

            const metricForSelectToOmit = this.isMetricForSelectSpecified(metricForSelect) ? metricForSelect : [];
            this.super(DatasetMixin).$storeWatchHandler.call(
                this,
                omit(stateClearedFromEmptyArrays, metricForSelectToOmit)
            );
        },
        /**
         * @param {() => {}} cancel
         */
        onLoadDataHookBefore(cancel) {
            const {
                $storeState,
                childTable,
                request,
                QueryFilterOperator,
                props: { isWaitingForState, fieldToApplyFilter }
            } = this;
            const isEmptyStore = isEmpty($storeState) || Object.values($storeState).every(Boolean) === false;
            const shouldHideTable = isWaitingForState && isEmptyStore;

            if (shouldHideTable) {
                this.result = null;
                this.dataRows = [];
                this.selectedRows = [];
                this.checkedFormControls = [];
                cancel();
                return;
            }

            if (childTable?.filter != null && fieldToApplyFilter != null) {
                const filterInfo = {
                    name: fieldToApplyFilter,
                    operator: QueryFilterOperator.EQ,
                    value: childTable.filter
                };
                request.query.filterAdd(filterInfo);
            }
        },
        /**
         * @param {import('@goodt-common/data').IDatasetResult} result
         */
        onLoadDataHookThen() {
            const { dataRows } = this;
            if (dataRows.length === 0) {
                return;
            }

            const { shouldChooseFirst, dataField, value: presetValue } = this.props.rowPreset;
            const { metricForSelect } = this.props;

            const commitStoreReducer = (acc, item) => ({ ...acc, [dataField]: item[dataField] });

            if (shouldChooseFirst) {
                this.selectedRows = [dataRows[0]];
                this.$storeCommit(this.selectedRows.reduce(commitStoreReducer, {}));
                return;
            }

            const foundRow = dataRows.find(({ [dataField]: fieldValue }) => fieldValue === presetValue);
            this.selectedRows = foundRow == null ? this.selectedRows : [foundRow];

            if (foundRow != null) {
                this.$storeCommit(this.selectedRows.reduce(commitStoreReducer, {}));
            }

            if (this.isMetricForSelectSpecified(metricForSelect)) {
                const stateValue = this.$storeState[metricForSelect];
                this.setSelectedRowsByDataValues(stateValue);
                this.setCheckedFormControls();
            }
        },
        /**
         * @param {null|string|string[]} value
         */
        setCheckedFormControls() {
            const { metricForSelect } = this.props;
            if (this.isMetricForSelectSpecified(metricForSelect) === false) {
                this.checkedFormControls = [];
                return;
            }
            this.checkedFormControls = this.selectedRows.map((row) => row[metricForSelect]);
        },
        /**
         * @public
         * @param {string} dataField
         * @param {any} value
         * @param {string} controlType
         */
        toggleFormControl({ dataField, value, controlType }) {
            const isCheckbox = controlType === ControlType.CHECKBOX;
            this.checkedFormControls = filterOrExtendWith(this.checkedFormControls, value, isCheckbox, false);
            this.$storeCommit({ [dataField]: isCheckbox ? this.checkedFormControls : value });
        },
        /**
         * @public
         * @param {number} page = 1
         */
        loadDataPage(page = 1) {
            this.page = page;
            this.loadData();
        },
        /**
         * @public
         * @param {Record<string, any>} row
         */
        setSelectedRow(row) {
            const { canMultipleSelect } = this.props;
            this.selectedRows = filterOrExtendWith(this.selectedRows, row, canMultipleSelect);
        },
        /**
         * @public
         * @param {{sourceVars: string[], userVarsMap: Record<string, any>}} varsToCommit
         * @param {string[]} events
         * @param {Record<string, any>} [link={}]
         */
        runActions({ varsToCommit, events, link = {} }) {
            this.commit(varsToCommit);
            events.forEach(this.$eventTrigger);

            const { url: path, query, isTargetBlank, queryMetrics, isLinkUrl } = link;
            this.navigate({ path, query: { ...query, ...queryMetrics } }, isTargetBlank, isLinkUrl);
            this.addRouteQueryParams();
        },
        /**
         * @param {string[]} sourceVars
         * @param {Record<string, any>} userVarsMap
         */
        commit({ sourceVars, userVarsMap }) {
            if (isEmpty(userVarsMap) === false) {
                this.$storeCommit(userVarsMap, { global: true });
            }

            if (sourceVars.length === 0) {
                return;
            }

            const { selectedRows, props } = this;
            const { canMultipleSelect } = props;

            if (canMultipleSelect) {
                /*
                 * если мультиселект - собираем из массива this.selectedRows объект для отправки
                 * this.selectedRows пустой? Ресетим соответствующие varsFromSource переменные в хранилище
                 */
                const dataToCommit =
                    selectedRows.length > 0
                        ? zipObject(sourceVars, zip(...selectedRows.map((row) => at(row, sourceVars))))
                        : sourceVars.reduce((acc, variable) => ({ ...acc, [variable]: null }), {});

                this.$storeCommit(dataToCommit);
                return;
            }
            /*
             * если не мультиселект - забираем первый объект из this.selectedRows и формируем для отправки
             * Нет выбранной строки? Ресетим соответствующие varsFromSource переменные в хранилище
             */
            const [selectedRow] = selectedRows;
            const isSelectedRowExist = selectedRow != null;
            const dataToCommit = sourceVars.reduce(
                (acc, variable) => ({
                    ...acc,
                    [variable]: isSelectedRowExist ? selectedRow[variable] : null
                }),
                {}
            );

            this.$storeCommit(dataToCommit);
        },
        /**
         * @param {string} path
         * @param {Record<string, any>} query
         * @param {boolean} shouldOpenNewTab
         */
        navigate({ path, query }, shouldOpenNewTab = false, shouldFollowTheLink = false) {
            if ([null, undefined, ''].includes(path)) {
                return;
            }

            const [pathBeforeHash, pathAfterHash = ''] = path?.split('#');

            const options = pathAfterHash.startsWith('/')
                ? { hash: Url.create({ href: pathAfterHash, query }).toString() }
                : { hash: pathAfterHash, query };

            const url = Url.create({ href: pathBeforeHash, ...options });

            // case '/some-path/#/route-path?id=1'
            if (url.isRelative && pathAfterHash.startsWith('/')) {
                // make url absolute
                url.host = window.location.host;
                url.protocol = window.location.protocol;
            }

            if (url.isAbsolute || shouldFollowTheLink) {
                const target = shouldOpenNewTab === true ? '_blank' : '_self';
                const opened = window.open(url, target, 'noopener,noreferrer');
                // https://cwe.mitre.org/data/definitions/1022.html
                // https://owasp.org/www-project-top-ten/2017/A6_2017-Security_Misconfiguration.html
                opened.opener = null;
                return;
            }

            this.$routeNavigate(url);
        },
        /**
         * @public
         */
        generateTable() {
            const { dimensionMetricNames, mergedSchema, id } = this;
            const children = buildTableChildren(this.$createEntity, dimensionMetricNames, mergedSchema);

            this.$setElemChildren({ id, children });
        },
        /**
         * @public
         * @param {string} fieldName
         * @param {number} offset
         * @param {number} limit
         * @param {string} searchInput
         * @return {Promise<any>}
         */
        async fetchHeaderFilterData(fieldName, { offset, limit }, searchInput) {
            const { request, dimensions, metrics, QuerySortDirection, QueryFilterOperator } = this;
            const headerFilterRequest = cloneDeep(request);
            const { query: headerFilterQuery } = headerFilterRequest;
            const isDimension = dimensions.includes(fieldName);

            headerFilterRequest.offset = offset;
            headerFilterRequest.limit = limit;
            headerFilterQuery.dimensions = isDimension
                ? dimensions.filter((dimension) => dimension === fieldName)
                : dimensions;
            headerFilterQuery.metrics = isDimension ? [] : metrics.filter((metric) => metric === fieldName);
            headerFilterQuery.sort = [{ name: fieldName, direction: QuerySortDirection.ASC }];
            const filterOperator = this.props.isQueryFilterOperatorLike
                ? QueryFilterOperator.LIKE
                : QueryFilterOperator.LIKE_CI;
            searchInput === ''
                ? headerFilterQuery.filterRemove(fieldName)
                : headerFilterQuery.filterAdd({
                      name: fieldName,
                      operator: filterOperator,
                      // eslint-disable-next-line no-restricted-syntax
                      value: [`%${searchInput}%`]
                  });

            try {
                return await headerFilterRequest.send();
            } catch (error) {
                this.$handleError(error);
                return null;
            }
        },
        /**
         * @public
         * @param {string[]|null} filter
         */
        commitHeaderFilter(filter) {
            this.$storeCommit(filter);
        },

        addRouteQueryParams() {
            const { writeMap } = this.$storeMeta.vars;
            const triggerAliases = Object.values(pick(writeMap, this.props.routeQueryParamNames));
            const pickedStoreState = pick(store.state, triggerAliases);
            const storeValues = Object.entries(pickedStoreState).reduce(
                (acc, [key, value]) => ({ ...acc, [key]: ValueObject.getValue(value) }),
                {}
            );
            addRouteQueryParams(storeValues);
        }
    }
};
</script>
<style scoped lang="pcss" src="./style.pcss"></style>
