<template>
    <w-elem :placeholder="$placeholder">
        <div class="pivot-table-container-wrapper" @keydown="onCopySelected" tabindex="-1">
            <div class="pivot-table-container">
                <div class="preloader" v-if="canShownPreloader" />
                <div class="preloader-shadow" v-if="canShownPreloader" />
                <div class="pivot-table-container__item toolbox">
                    <div
                        class="toolbox__item toolbox__item--left"
                        v-for="({ title }, level) in playerFilters"
                        :key="level">
                        <div
                            class="toolbox-button toolbox-button--filter"
                            data-popover-target
                            @click="setFilterPopoverState({ fields: playerFilters, level, event: $event }, false)">
                            <span>{{ title }}</span>
                            <div class="scroller-table__drop" v-if="checkShownTitleFilter({ level, isFilters: true })">
                                <i class="mdi mdi-filter" />
                            </div>
                            <i class="toolbox-button__icon toolbox-button__icon--drop-down" />
                        </div>
                    </div>
                    <div class="toolbox__item" v-if="props.useFastSearch">
                        <label class="toolbox-search">
                            <input
                                type="text"
                                class="toolbox-search__input"
                                placeholder="Поиск"
                                @input="onSearchInput" />
                            <i class="toolbox-search__icon"></i>
                        </label>
                    </div>
                    <div class="toolbox__item" v-if="isShownUpdateStateButton">
                        <div class="toolbox-button" @click="updateWidget" title="Нажать для отображения правок">
                            <i class="toolbox-button__icon toolbox-button__icon--update" />
                            <span>Обновить</span>
                        </div>
                    </div>

                    <div class="toolbox__item" v-if="props.canCommitVars">
                        <div class="toolbox-button" @click="sendToStore">
                            <i class="toolbox-button__icon toolbox-button__icon--send-values"></i>
                            <span>Отправить</span>
                        </div>
                    </div>
                    <div class="toolbox__item">
                        <div class="toolbox-button" id="export-btn" @click="toggleExportPopover">
                            <i class="toolbox-button__icon toolbox-button__icon--export"></i>
                            <span>Выгрузка</span>
                        </div>
                    </div>
                    <div class="toolbox__item">
                        <div class="toolbox-button" data-popover-target @click="toggleEditPopover">
                            <i class="toolbox-button__icon toolbox-button__icon--pencil" />
                            <span>Форматирование</span>
                        </div>
                    </div>

                    <div class="toolbox__item">
                        <div class="toolbox-button" @click="toggleSettingsPopup">
                            <i class="toolbox-button__icon toolbox-button__icon--cog" />
                            <span>Настройки</span>
                        </div>
                    </div>
                    <div class="toolbox__item">
                        <div class="toolbox-button" @click="toggleFieldsPopup">
                            <i class="toolbox-button__icon toolbox-button__icon--table" />
                            <span>Поля</span>
                        </div>
                    </div>
                    <div class="toolbox__item">
                        <div class="toolbox-button" @click="toggleFullscreen">
                            <i class="toolbox-button__icon toolbox-button__icon--fullscreen" />
                        </div>
                    </div>
                </div>
                <div class="pivot-table-container__table resized-table" data-popover-table>
                    <ui-recycle-scroller
                        :key="scrollerKey"
                        v-bind="scrollerSettings"
                        class="scroller"
                        :class="scrollerClasses"
                        ref="recycleScroller">
                        <template #before>
                            <div
                                v-for="({ cells, id, size }, rowIndex) in tableHeadRows"
                                :key="id"
                                class="scroller-table__row"
                                :style="resolveRowCssStyles({ size, rowIndex })">
                                <template v-for="(cell, index) in cells">
                                    <div
                                        :key="index + id"
                                        class="scroller-table__cell"
                                        :class="resolveCellClasses({ id, rowIndex, index, cell })"
                                        @click="onCellClick({ ...cell, id, index }, $event)"
                                        :data-popover-target="buildCellKey(rowIndex, index)"
                                        :style="resolveCellCssStyle({ cell, rowIndex, index })"
                                        @mousedown="
                                            onCellMouseDown(
                                                {
                                                    index,
                                                    rowIndex
                                                },
                                                $event
                                            )
                                        "
                                        @mouseover="
                                            onCellMouseOver(
                                                {
                                                    index,
                                                    rowIndex
                                                },
                                                $event
                                            )
                                        ">
                                        <div
                                            class="scroller-table__drop"
                                            v-if="checkShownRowDropButton(cell)"
                                            @click="onCellCollapseClick(cell)">
                                            <i class="mdi" :class="resolveDropButtonSymbolClass(cell)" />
                                        </div>
                                        <div class="scroller-table__value" :class="resolveCellValueClasses(cell)">
                                            {{ resolveCellValue(cell) }}
                                        </div>
                                        <div class="scroller-table__drop" v-if="checkShownTitleFilter(cell)">
                                            <i class="mdi mdi-filter" />
                                        </div>
                                        <div class="scroller-table__drop" v-if="checkShownValueSort(cell)">
                                            <i class="mdi" :class="resolveSortButtonSymbolClass(cell)" />
                                        </div>
                                        <div class="scroller-table__drop" v-if="checkShownFilterDropButton(cell)">
                                            <i class="mdi" :class="resolveDropButtonSymbolClass(cell)" />
                                        </div>
                                        <div
                                            class="scroller-table__resizer-horizontal"
                                            @mousedown.stop="onResizeColumnStart($event, index)" />
                                        <div
                                            class="scroller-table__resizer-vertical"
                                            @mousedown.stop="onResizeRowStart($event, rowIndex)" />
                                    </div>
                                </template>
                            </div>
                        </template>
                        <template #default="{ item: { id, cells, size }, index: rowIndex }">
                            <div
                                class="scroller-table__row"
                                :style="resolveRowCssStyles({ size, rowIndex: resolveTableRowIndex(rowIndex) })">
                                <template v-for="(cell, index) in cells">
                                    <div
                                        class="scroller-table__cell"
                                        :class="
                                            resolveCellClasses({
                                                id,
                                                rowIndex: resolveTableRowIndex(rowIndex),
                                                index,
                                                cell
                                            })
                                        "
                                        :key="index + id"
                                        @click="onCellClick({ ...cell, id, index }, $event)"
                                        :data-popover-target="buildCellKey(resolveTableRowIndex(rowIndex), index)"
                                        :style="
                                            resolveCellCssStyle({
                                                cell,
                                                rowIndex: resolveTableRowIndex(rowIndex),
                                                index
                                            })
                                        "
                                        @mousedown="
                                            onCellMouseDown(
                                                {
                                                    index,
                                                    rowIndex: resolveTableRowIndex(rowIndex)
                                                },
                                                $event
                                            )
                                        "
                                        @mouseover="
                                            onCellMouseOver(
                                                {
                                                    index,
                                                    rowIndex: resolveTableRowIndex(rowIndex)
                                                },
                                                $event
                                            )
                                        "
                                        @dblclick="onCellDblClick(cell)">
                                        <div
                                            class="scroller-table__drop"
                                            v-if="checkShownRowDropButton(cell)"
                                            @click="onCellCollapseClick(cell)">
                                            <i class="mdi" :class="resolveDropButtonSymbolClass(cell)" />
                                        </div>
                                        <div class="scroller-table__value" :class="resolveCellValueClasses(cell)">
                                            {{ resolveCellValue(cell) }}
                                        </div>
                                        <!-- Для строчных заголовков итогов и заголовков значений показываем те же контролы, что и в шапке -->
                                        <div class="scroller-table__drop" v-if="checkShownTitleFilter(cell)">
                                            <i class="mdi mdi-filter" />
                                        </div>
                                        <div class="scroller-table__drop" v-if="checkShownValueSort(cell)">
                                            <i class="mdi" :class="resolveSortButtonSymbolClass(cell)" />
                                        </div>
                                        <div class="scroller-table__drop" v-if="checkShownFilterDropButton(cell)">
                                            <i class="mdi" :class="resolveDropButtonSymbolClass(cell)" />
                                        </div>
                                        <div
                                            class="scroller-table__resizer-horizontal"
                                            @mousedown.stop="onResizeColumnStart($event, index)" />
                                        <div
                                            class="scroller-table__resizer-vertical"
                                            @mousedown.stop="
                                                onResizeRowStart($event, resolveTableRowIndex(rowIndex))
                                            " />
                                    </div>
                                </template>
                            </div>
                        </template>
                        <template #after>
                            <div
                                class="resized-table__vertical-line"
                                :style="resizedLineStyles"
                                v-if="isShownVerticalResizingLine" />
                            <div
                                class="resized-table__horizontal-line"
                                :style="resizedLineStyles"
                                v-if="isShownHorizontalResizingLine" />
                        </template>
                    </ui-recycle-scroller>
                </div>
                <ui-pagination
                    class="pivot-table-container__item pagination"
                    v-if="canShownPagination"
                    v-bind="{ pages, page }"
                    @select="setPage">
                    <template #default="{ page, currentPage, selectPage }">
                        <div class="pagination__btn-container" @click="page && selectPage(page)">
                            <template v-if="page">
                                <div
                                    class="pagination__btn"
                                    :class="{ 'pagination__btn--active': currentPage === page }">
                                    {{ page }}
                                </div>
                            </template>
                            <template v-else>...</template>
                        </div>
                    </template>
                </ui-pagination>
            </div>
        </div>

        <ui-popover :show.sync="isShownExportPopover" target="#export-btn">
            <div class="options-popover">
                <div class="options-popover-option" @click="onExportBtnClick(toXlsx)">
                    <i class="options-popover-option__icon mdi-download" />
                    <span class="options-popover-option__label">Выгрузить срез данных</span>
                </div>
                <div class="options-popover-option" @click="onExportBtnClick(toUnlimitedXlsx)">
                    <i class="options-popover-option__icon mdi-download-multiple" />
                    <span class="options-popover-option__label">Выгрузить данные целиком</span>
                </div>
            </div>
        </ui-popover>
        <ui-popover :show.sync="isShownEditPopover" v-bind="editPopoverBinds">
            <div class="options-popover">
                <div class="options-popover-option" @click="toggleFormatPopup">
                    <i class="options-popover-option__icon mdi-format-textbox" />
                    <span class="options-popover-option__label">Формат ячеек</span>
                </div>
                <div class="options-popover-option" @click="toggleConditionPopup">
                    <i class="options-popover-option__icon mdi-table-edit" />
                    <span class="options-popover-option__label">Условное форматирование</span>
                </div>
            </div>
        </ui-popover>
        <ui-filter-popover
            :visible.sync="isShownSettingsPopover"
            v-bind="filterPopoverBinds"
            @saved="onFilterPopoverSave"
            @collapse="onFilterPopoverCollapse" />

        <ui-filter-popover
            :visible.sync="isShownValuesPopover"
            v-bind="valuesPopoverBinds"
            @saved="onFilterValuesSave" />

        <ui-fields-popup
            ref="fieldsPopup"
            :visible.sync="isVisibleFieldsPopup"
            v-bind="fieldsPopupBinds"
            @saved="onFieldsPopupSave"
            @need-confirm-close="onFieldsPopupNeedConfirm" />
        <ui-conditon-format-popup
            :visible.sync="isVisibleConditionsPopup"
            v-bind="conditionsPopupBinds"
            @saved="onConditionsPopupSave" />
        <ui-settings-popup
            :visible.sync="isVisibleSettingsPopup"
            v-bind="settingsPopupBinds"
            @saved="onSettingsPopupSave" />
        <ui-format-popup :visible.sync="isVisibleFormatPopup" v-bind="formatPopupBinds" @saved="onFormatPopupSave" />
        <w-unsaved-changes-popup
            :visible.sync="isVisibleUnsavedFieldsPopup"
            @confirm="onUnsavedFieldsConfirm"
            @discard="onUnsavedFieldsDiscard"
            @cancel="onUnsavedFieldsCancel" />
        <ui-popover v-bind="selectedPopoverBinds">
            <div class="selected-popover">
                <div class="selected-popover__row">
                    <div class="selected-popover__elem">
                        Сум:
                        <span class="text-bold">{{ selectedPopoverSum }}</span>
                    </div>
                    <div class="selected-popover__elem">
                        Счёт:
                        <span class="text-bold">{{ selectedPopoverCount }}</span>
                    </div>
                    <div class="selected-popover__elem">
                        Средн:
                        <span class="text-bold">{{ selectedPopoverAvg }}</span>
                    </div>
                </div>
            </div>
        </ui-popover>
    </w-elem>
</template>

<script>
import { cloneDeep, isEqual, merge, uniqWith } from 'lodash';
import Color from 'color';
import { Popover, Pagination } from 'goodteditor-ui';
import { SizeConverter, convertRgbaToHex, downloadBlobAsFile } from '@goodt-common/utils';
import { ValueObject, unwrapStoreValue } from '@goodt-wcore/managers';
import { NumberFormat, NumberFormatPattern } from '@goodt-common/utils-number';
import { Elem } from '@goodt-wcore/elem';
import { formatNumber } from '@goodt-widgets-insight/utils';
import { RecycleScroller } from 'vue-virtual-scroller';
import { ElemDatasetMixinTypes, DatasetRequestFactory, QueryModelsStrategies } from '@goodt-common/data';
import { ApiMixins, ApiMixinsTypeDescriptor } from './api';
import {
    FieldsPopup,
    SettingsPopup,
    FormatPopup,
    FilterPopover,
    ConditonFormatPopup,
    UnsavedChangesPopup
} from './components';
import {
    buildCellCssVars,
    buildRowCssVars,
    buildResizedCssVars,
    buildResizedLineOffsetCssVars
} from './styles/css-vars';
import { DatasetMixin } from './mixins';
import {
    asyncGenerateHtmlTable,
    asyncGenerateTableCells,
    asyncGenerateTableMaps,
    asyncGenerateFlatTable
} from './workers';

import {
    CellsTypes,
    MdiDropdownClasses,
    createCellSettings,
    createCondition,
    ConditionFunction,
    SubtotalType,
    SubtotalPosition,
    createSimpleCondition,
    ValueFilterLogicOperator,
    TableDrawTypes,
    RequestType,
    MetricType,
    LOADER_COLUMN_KEY,
    CELL_MIN_HEIGHT,
    KEY_CODE_C,
    FILTER_HEIGHT,
    FAST_SEARCH_DELAY,
    ConditionOperatorSymbol,
    TotalPositions
} from './utils/constants';
import { AggregateMethodsOptions, ConditionsOptions, ExportFileType } from './utils/config';
import {
    buildExportFilename,
    calcArrayAvg,
    calcArraySum,
    clearObjectVoidValues,
    createMemoization,
    createRangeBuilder,
    filterPaths,
    isOdd,
    uniqArray,
    updateEntriesValue
} from './utils/utils';
import { meta, Vars } from './descriptor';
import { ElemInstanceTypeDescriptor } from './types';

// eslint-disable-next-line no-restricted-syntax
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';

/**
 * @typedef {Object} TableSettings
 * @property {Record<string, any>[]} rows
 * @property {Record<string, any>[]} columns
 * @property {Record<string, any>[]} filters
 * @property {Record<string, any>[]} values
 * @property {Record<string, any>[]} calculatedValues
 * @property {Record<string, any>[]} conditions
 * @property {Record<string, any>} settings
 */

const convertToAbsoluteValue = SizeConverter.instance.convertToAbsoluteValue.bind(SizeConverter.instance);
const convertCssVarToValue = SizeConverter.instance.convertCssVarToValue.bind(SizeConverter.instance);
const rowMinHeight = convertToAbsoluteValue({ size: CELL_MIN_HEIGHT });

export default {
    extends: Elem,
    components: {
        UiRecycleScroller: RecycleScroller,
        UiFieldsPopup: FieldsPopup,
        UiSettingsPopup: SettingsPopup,
        UiFilterPopover: FilterPopover,
        UiConditonFormatPopup: ConditonFormatPopup,
        UiFormatPopup: FormatPopup,
        WUnsavedChangesPopup: UnsavedChangesPopup,
        UiPopover: Popover,
        UiPagination: Pagination
    },
    mixins: [DatasetMixin, ...ApiMixins],
    meta,
    hooks: {
        before(cancelRequest) {
            if (this.canLoadData) {
                return;
            }
            cancelRequest();
            if (!this.isFirstLoad) {
                return;
            }
            this.loadSlicedData();
        },
        then() {
            this.isFirstInitTableMaps = false;
            this.buildData();
        }
    },
    data: () => ({
        /** @public */
        testTable: '',
        fetchRowsUseCancel: true,

        editPopoverEl: null,
        isShownEditPopover: false,
        isShownExportPopover: false,
        selectedRow: null,
        selectedColumn: null,
        isShownSettingsPopover: false,
        isShownValuesPopover: false,

        valuesPopoverLevel: 0,
        valuesPopoverPath: null,
        playerConditionsFilters: [[]],
        valuesFilters: [],

        rowsPaginationData: {},

        settingsPopoverCellType: CellsTypes.CELL,
        settingsPopoverLevel: 0,
        isShownSettingsPopoverSort: false,
        settingsPopoverFields: [],
        settingsPopoverFilterLevel: 0,
        settingsPopoverEl: null,
        playerFiltersValues: [[]],

        isVisibleFieldsPopup: false,
        isVisibleUnsavedFieldsPopup: false,
        isVisibleSettingsPopup: false,
        isVisibleConditionsPopup: false,
        isVisibleFormatPopup: false,
        tableMapsHook: null,
        uniqDimensionsFieldsBuf: null,
        isGeneratedTableMaps: false,

        dataTableRows: [],
        tableHeadRowsHook: null,

        collapsedRows: [],
        collapsedColumns: [],
        playerConditions: [],
        playerFilters: [],
        playerRows: [],
        playerColumns: [],
        playerValues: [],
        playerSettings: {},
        playerCalculatedValues: [],
        columnSortOptions: {
            isUsed: false,
            sortDesc: false,
            path: null,
            isTotal: false,
            level: 0
        },
        isFirstInitTableMaps: false,
        isShownLoader: false,
        fastSearchTimeoutId: null,
        filteredRowsPaths: null,
        filteredColumnsPaths: null,
        isNeedUpdateFilters: true,
        initFiltersHook: null,

        isFirstLoad: true,

        selectedCells: [],
        selectedPopoverTarget: null,

        changedStoreValues: {},

        canLoadData: false, //если true идет загрузка в load()
        needLoad: false, //если true нужно повторно обновлять данные в uploudFilters и loadSlicedData()|load()
        totalDataCache: null,
        pendingDefaultTotalsPromise: null,

        resizedColumnsIndexes: [],
        resizedRowsIndexes: [],
        resizedStart: 0,
        resizedIndex: null,
        resizedCurSize: 0,
        resizedLineOffset: 0,
        resizedLineSize: 0,
        isVerticalResizedLine: false,
        resizedTableOffset: 0,

        flatSortField: null,

        scrollerKey: Symbol(''),

        filterPopoverBinds: {
            settings: {},
            isSortDesc: false,
            shownSort: false,
            filters: [],
            usedFilters: [],
            isSort: true,
            isCollapsable: false
        },

        updatedSingleFilters: []
    }),
    computedEditor: {
        baseRowsCssVars() {
            const {
                props: { baseRowsSettings }
            } = this;
            return this.genCellCssVarsStyle(baseRowsSettings);
        },
        baseColumnsCssVars() {
            const {
                props: { baseColumnsSettings }
            } = this;
            return this.genCellCssVarsStyle(baseColumnsSettings);
        },
        baseValuesCssVars() {
            const {
                props: { baseValuesSettings }
            } = this;
            return this.genCellCssVarsStyle(baseValuesSettings);
        },
        baseIndexesCssVars() {
            const {
                props: { baseIndexesSettings }
            } = this;
            return this.genCellCssVarsStyle(baseIndexesSettings);
        },
        zebraCssVars() {
            const {
                props: { zebraSettings }
            } = this;
            return this.genCellCssVarsStyle(zebraSettings);
        },
        rowTotalCssVars() {
            const {
                props: { rowTotalSettings }
            } = this;
            return this.genCellCssVarsStyle(rowTotalSettings);
        },
        rowTotalTitleCssVars() {
            const {
                props: {
                    rowTotalSettings: { titleSettings }
                }
            } = this;
            return this.genCellCssVarsStyle(titleSettings);
        },
        columnsTotalCssVars() {
            const {
                props: { columnsTotalSettings }
            } = this;
            return this.genCellCssVarsStyle(columnsTotalSettings);
        },
        columnsTotalTitleCssVars() {
            const {
                props: {
                    columnsTotalSettings: { titleSettings }
                }
            } = this;
            return this.genCellCssVarsStyle(titleSettings);
        }
    },
    computed: {
        isShownRowsSubtotals() {
            const { playerSettings } = this;
            return [SubtotalType.ROWS, SubtotalType.ALL].includes(playerSettings?.subtotal?.type);
        },
        isCollapsedAll() {
            return this.playerSettings?.isUncollapsedAll === false;
        },
        isPagType() {
            return !this.isFlat && this.canShownPagination && !this.isCollapsedAll;
        },
        canShownPagination() {
            return this.playerSettings?.isPagination === true;
        },
        isFlat() {
            return this.playerSettings?.tableDrawType === TableDrawTypes.FLAT;
        },
        isResizing() {
            return this.resizedIndex != null;
        },
        isShownVerticalResizingLine() {
            return this.isResizing && this.isVerticalResizedLine;
        },
        isShownHorizontalResizingLine() {
            return this.isResizing && !this.isVerticalResizedLine;
        },
        scrollerSettings() {
            const { tableRows: items = [] } = this;
            return {
                items,
                skipHover: true
            };
        },
        canShownPreloader() {
            return this.isShownLoader || this.isLoading;
        },
        scrollerClasses() {
            const {
                playerSettings: { shouldBeFixedHeader }
            } = this;
            return {
                'scroller--fixed-header': shouldBeFixedHeader
            };
        },
        isShownUpdateStateButton() {
            const { loading, isEditorMode } = this;
            return !loading && isEditorMode;
        },
        valueConditionsFilters() {
            const { playerValues, getConditionsByAlias } = this;
            return playerValues
                .map(({ dataAlias }) => getConditionsByAlias(dataAlias))
                .map((conditions) =>
                    conditions.map(({ operator, value, cellSettings, id }) => {
                        const operatorOpt = ConditionsOptions.find(({ value: optsVal }) => optsVal === operator);
                        const operatorLabel = operatorOpt.label;
                        return {
                            id,
                            name: `${operatorLabel} ${value}`,
                            colorSettings: cellSettings,
                            size: FILTER_HEIGHT
                        };
                    })
                );
        },
        valuesPopoverBinds() {
            const {
                settingsPopoverBinds,
                valuesPopoverLevel,
                valuesPopoverPath,
                valueConditionsFilters,
                playerConditionsFilters,
                valuesFilters,
                playerValues,
                columnSortOptions: { sortDesc: isSortDesc, path: sortPath, isTotal, level },
                flatSortField,
                isFlat
            } = this;

            const isSort =
                !isTotal && sortPath !== null && sortPath.every((name, index) => name === valuesPopoverPath[index]);

            return {
                valuesFilterFirst: createSimpleCondition(valuesFilters?.[valuesPopoverLevel]?.valuesFilterFirst ?? {}),
                valuesFilterSecond: createSimpleCondition(
                    valuesFilters?.[valuesPopoverLevel]?.valuesFilterSecond ?? {}
                ),
                valuesFilterOperator:
                    valuesFilters?.[valuesPopoverLevel]?.valuesFilterOperator ?? ValueFilterLogicOperator.AND,
                settings: settingsPopoverBinds ?? {},
                shownSearch: false,
                shownVoidFilters: false,
                shownValuesFilter: true,
                shownSort: (isFlat && playerValues[valuesPopoverLevel].isCalculated) === false,
                isSortDesc,
                isSort: isFlat ? flatSortField === playerValues[level] : level === valuesPopoverLevel && isSort,
                filterKey: 'id',
                filters: valueConditionsFilters[valuesPopoverLevel],
                usedFilters: playerConditionsFilters[valuesPopoverLevel]
            };
        },

        cellsCssVars() {
            const {
                playerRows,
                playerColumns,
                playerValues,
                baseRowsCssVars,
                baseColumnsCssVars,
                baseValuesCssVars,
                baseIndexesCssVars,
                rowTotalCssVars,
                rowTotalTitleCssVars,
                columnsTotalCssVars,
                columnsTotalTitleCssVars,
                props: {
                    baseRowsSettings: { spaceBackgroundColor: spaceColor },
                    columnsWidth
                }
            } = this;

            const rowStyles = playerRows.map((row) => ({
                ...baseRowsCssVars,
                ...this.genCellCssVarsStyle(row)
            }));

            const spaceStyles = playerRows.map(({ width }) =>
                this.genCellCssVarsStyle({ width, backgroundColor: spaceColor })
            );

            const colStyles = playerColumns.map((col) => ({
                ...baseColumnsCssVars,
                ...this.genCellCssVarsStyle({ ...col, width: columnsWidth })
            }));

            const cellStyles = playerValues.map((value) => ({
                ...baseValuesCssVars,
                ...this.genCellCssVarsStyle({ ...value, width: columnsWidth })
            }));

            const totalRowCellStyles = playerValues.map((value) => {
                const perMetricStyle = this.genCellCssVarsStyle({ ...value, width: columnsWidth });
                const alignVars = {};
                if ('--w-vertical-align' in perMetricStyle) {
                    alignVars['--w-vertical-align'] = perMetricStyle['--w-vertical-align'];
                }
                if ('--w-vertical-align-justify' in perMetricStyle) {
                    alignVars['--w-vertical-align-justify'] = perMetricStyle['--w-vertical-align-justify'];
                }
                if ('--w-horizontal-align' in perMetricStyle) {
                    alignVars['--w-horizontal-align'] = perMetricStyle['--w-horizontal-align'];
                }
                return { ...perMetricStyle, ...rowTotalCssVars, ...alignVars };
            });
            const totalColumnCellStyles = playerValues.map((value) => {
                const perMetricStyle = this.genCellCssVarsStyle({ ...value, width: columnsWidth });
                const alignVars = {};
                if ('--w-vertical-align' in perMetricStyle) {
                    alignVars['--w-vertical-align'] = perMetricStyle['--w-vertical-align'];
                }
                if ('--w-vertical-align-justify' in perMetricStyle) {
                    alignVars['--w-vertical-align-justify'] = perMetricStyle['--w-vertical-align-justify'];
                }
                if ('--w-horizontal-align' in perMetricStyle) {
                    alignVars['--w-horizontal-align'] = perMetricStyle['--w-horizontal-align'];
                }
                return { ...perMetricStyle, ...columnsTotalCssVars, ...alignVars };
            });

            const rowTitleStyles = playerRows.map(({ titleSettings, width }) => ({
                ...baseRowsCssVars,
                ...this.genCellCssVarsStyle({ ...titleSettings, width })
            }));

            const colTitleStyles = playerColumns.map(({ titleSettings, width }) => ({
                ...baseColumnsCssVars,
                ...this.genCellCssVarsStyle({ ...titleSettings, width: playerRows?.[0]?.width ?? width })
            }));

            const valueTitleStyles = playerValues.map(({ titleSettings }) => ({
                ...baseValuesCssVars,
                ...this.genCellCssVarsStyle({ ...titleSettings, width: columnsWidth })
            }));

            const totalValueTitleStyles = playerValues.map(({ titleSettings }) => {
                const perMetricStyle = this.genCellCssVarsStyle({ ...titleSettings, width: columnsWidth });
                const alignVars = {};
                if ('--w-vertical-align' in perMetricStyle) {
                    alignVars['--w-vertical-align'] = perMetricStyle['--w-vertical-align'];
                }
                if ('--w-vertical-align-justify' in perMetricStyle) {
                    alignVars['--w-vertical-align-justify'] = perMetricStyle['--w-vertical-align-justify'];
                }
                if ('--w-horizontal-align' in perMetricStyle) {
                    alignVars['--w-horizontal-align'] = perMetricStyle['--w-horizontal-align'];
                }
                return { ...perMetricStyle, ...columnsTotalCssVars, ...alignVars };
            });

            const totalColumnStyles = playerColumns.map(({ verticalAlign, horizontalAlign }) => ({
                ...columnsTotalCssVars,
                ...this.genCellCssVarsStyle({ width: columnsWidth, verticalAlign, horizontalAlign }),
                ...columnsTotalTitleCssVars
            }));

            // Цвета для SPACE в колоночных итогах
            const totalSpaceStyles = playerColumns.map(() => ({
                ...this.genCellCssVarsStyle({ width: columnsWidth, backgroundColor: spaceColor })
            }));

            const totalRowStyles = [
                ...playerRows.map(({ width, verticalAlign, horizontalAlign }) => ({
                    ...rowTotalCssVars,
                    ...this.genCellCssVarsStyle({ width, verticalAlign, horizontalAlign }),
                    ...rowTotalTitleCssVars
                })),
                ...playerColumns.map(({ verticalAlign, horizontalAlign }) => ({
                    ...rowTotalCssVars,
                    ...this.genCellCssVarsStyle({ verticalAlign, horizontalAlign }),
                    ...rowTotalTitleCssVars
                }))
            ];

            const rowsIndexesStyles = [{ ...baseIndexesCssVars }];

            const columnIndexesStyles = playerRows.map(({ width }) => ({
                ...baseIndexesCssVars,
                ...this.genCellCssVarsStyle({ width })
            }));
            columnIndexesStyles.push({
                ...baseIndexesCssVars,
                ...this.genCellCssVarsStyle({ width: columnsWidth })
            });

            return {
                [CellsTypes.ROW]: rowStyles,
                [CellsTypes.ROW_TITLE]: rowTitleStyles,
                [CellsTypes.COLUMN]: colStyles,
                [CellsTypes.TITLE]: colTitleStyles,
                [CellsTypes.CELL]: cellStyles,
                [CellsTypes.TOTAL_ROW_CELL]: totalRowCellStyles,
                [CellsTypes.TOTAL_CELL]: totalColumnCellStyles,
                [CellsTypes.VALUE_TITLE]: valueTitleStyles,
                [CellsTypes.TOTAL_VALUE_TITLE]: totalValueTitleStyles,
                [CellsTypes.TOTAL_COLUMN]: totalColumnStyles,
                [CellsTypes.TOTAL_ROW]: totalRowStyles,
                [CellsTypes.COLUMN_INDEX]: columnIndexesStyles,
                [CellsTypes.ROW_INDEX]: rowsIndexesStyles,
                [CellsTypes.ZERO_INDEX]: rowsIndexesStyles,
                [CellsTypes.SPACE]: spaceStyles,
                [CellsTypes.TOTAL_SPACE]: totalSpaceStyles
            };
        },
        settingsPopoverBinds() {
            return {
                appendToBody: false,
                target: this.settingsPopoverEl
            };
        },
        settingsPopupBinds() {
            return this.playerSettings;
        },
        formatPopupBinds() {
            const { playerValues: valuesSettings } = this;
            return {
                valuesSettings
            };
        },
        conditionsPopupBinds() {
            const { playerValues, playerConditions } = this;
            return {
                valuesSettings: playerValues,
                conditions: playerConditions
            };
        },
        fieldsPopupBinds() {
            const {
                props: { rows, columns, values, filters, shouldHideFilters },
                playerRows: selectedRows,
                playerFilters: selectedFilters,
                playerColumns: selectedColumns,
                playerValues: selectedValues,
                playerCalculatedValues: calculatedValues,
                metrics,
                dimensions
            } = this;
            const regex = /\(([^()]+)\)$/;
            const { metricsCustom } = this.buildRequestMetrics();
            return {
                dimensions: dimensions.reduce(
                    (acc, dimension) => ({
                        ...acc,
                        [dimension]: filters?.[dimension] ?? true
                    }),
                    {}
                ),

                metrics: metrics
                    .concat(
                        metricsCustom.map(({ name }) => {
                            const match = regex.exec(name);
                            return match ? match[1] : name;
                        })
                    )
                    .reduce((acc, metric) => ({ ...acc, [metric]: true }), {}),
                rows,
                columns,
                values,
                selectedFilters,
                selectedRows,
                selectedColumns,
                calculatedValues,
                selectedValues,
                isFiltersHidden: shouldHideFilters
            };
        },
        editPopoverBinds() {
            return {
                appendToBody: false,
                target: this.editPopoverEl
            };
        },
        uniqDimensionsFields: {
            get() {
                const { uniqDimensionsFieldsHook } = this;
                return this.uniqDimensionsFieldsBuf ?? [];
            },
            set(val) {
                this.uniqDimensionsFieldsBuf = val;
                this.uniqDimensionsFieldsHook = Symbol('');
            }
        },
        tableMaps: {
            get() {
                const { tableMapsHook } = this;
                return this.tableMapsBuf ?? {};
            },
            set(val) {
                this.tableMapsBuf = val;
                this.tableMapsHook = Symbol('');
            }
        },
        tableRows: {
            get() {
                return this.dataTableRows;
            },
            set(val) {
                this.dataTableRows = val.map(({ cells, ...other }) => ({ ...other, cells: Object.freeze(cells) }));
            }
        },
        tableHeadRows: {
            get() {
                // hack vue data to minimize observable data
                const { tableHeadRowsHook } = this;
                return this.tableHeadRowsBuf ?? [];
            },
            set(val) {
                this.tableHeadRowsBuf = val;
                this.tableHeadRowsHook = Symbol('');
            }
        },

        selectedPopoverTargetCell() {
            const { selectedCells } = this;
            const rows = Object.fromEntries(this.selectedCells.filter(([_, indexes]) => indexes.length > 0));
            const rowIndex = selectedCells.length > 0 ? Math.max(...Object.keys(rows).map(Number)) : null;
            const index = rows[rowIndex] != null && rows[rowIndex].length > 0 ? Math.max(...rows[rowIndex]) : null;
            return { rowIndex, index };
        },
        selectedPopoverCalculatedCells() {
            const {
                selectedCells,
                tableRows,
                playerRows,
                playerColumns,
                tableHeadRows,
                playerSettings: { isUsedIndexes },
                isFlat
            } = this;
            const headLength = tableHeadRows.length;
            const rowsLength = playerRows.length + (isFlat ? playerColumns.length : 0);
            return selectedCells.reduce((acc, [rowIndex, indexes]) => {
                if (rowIndex < headLength) {
                    return acc;
                }
                const onlyCellsIndexes = indexes.filter((index) => index >= rowsLength + (isUsedIndexes ? 1 : 0));
                if (onlyCellsIndexes.length === 0) {
                    return acc;
                }
                const { cells } = tableRows[rowIndex - headLength];
                return [...acc, onlyCellsIndexes.map((index) => cells[index].value)];
            }, []);
        },
        isShownSelectedPopover() {
            return this.selectedPopoverCalculatedCells.flat().length > 1;
        },
        selectedPopoverSum() {
            return calcArraySum(this.selectedPopoverCalculatedCells.flat());
        },
        selectedPopoverCount() {
            return this.selectedPopoverCalculatedCells.filter((indexes) => indexes.length > 0).flat().length;
        },
        selectedPopoverAvg() {
            return calcArrayAvg(this.selectedPopoverCalculatedCells.flat());
        },
        selectedPopoverBinds() {
            const { selectedPopoverTarget: target, isShownSelectedPopover: show } = this;
            return {
                target,
                show,
                appendToBody: false,
                position: 'br',
                // eslint-disable-next-line no-restricted-syntax, no-magic-numbers
                positionOffset: [0, -2],
                key: Symbol('')
            };
        },
        resizedLineStyles() {
            const { resizedLineOffset: offset, resizedLineSize: size } = this;
            return this.$genCssVarsStyle(buildResizedLineOffsetCssVars({ offset, size }));
        },
        initFilters: {
            get() {
                const { initFiltersHook } = this;
                return this.initFiltersBuf ?? null;
            },
            set(value) {
                this.initFiltersBuf = value;
                this.initFiltersHook = Symbol('');
            }
        }
    },
    watchEditor: {
        'props.canCommitVars': {
            handler() {
                this.selectedCells = [];
            }
        },
        'props.canCommitMultiVars': {
            handler() {
                this.selectedCells = [];
            }
        },
        'props.rows': {
            handler() {
                this.syncPlayerRowsWithPropsRows();
            },
            deep: true
        },
        'props.columns': {
            handler() {
                this.syncPlayerColumnsWithPropsColumns();
            },
            deep: true
        },
        'props.values': {
            handler() {
                this.syncPlayerValuesWithPropsValues();
            },
            deep: true
        }
    },
    watch: {
        playerRows() {
            this.selectedCells = [];
        },
        playerColumns() {
            this.selectedCells = [];
        }
    },
    watchStore: [
        {
            vars: [Vars.SETTINGS],
            /** @param {TableSettings} tableSettings */
            handler([tableSettings]) {
                this.restoreTableSettings(Array.isArray(tableSettings) ? tableSettings.at(-1) : tableSettings);
            }
        }
    ],
    created() {
        this.requestsMap = {
            [RequestType.DATA]: null,
            [RequestType.ROWS]: null,
            [RequestType.ALL_COLUMNS]: null,
            [RequestType.PAGINATION_DATA]: null,
            [RequestType.TOTAL]: null
        };
        // Non-reactive flag: prevents createDefaultTableSettings() from overriding
        // player state that was already restored from the store in restoreTableSettings().
        // Needed because watchStore fires before hooks.before on page load.
        this._settingsRestored = null;
    },
    destroyed() {
        document.removeEventListener('mouseup', this.onCellValueMouseUp);
    },
    methods: {
        $storeWatchHandler(state) {
            const newState = Object.fromEntries(
                Object.entries(cloneDeep(state)).map(([key, value]) => [
                    key,
                    unwrapStoreValue(ValueObject.getValue(value)) === '' ? null : ValueObject.getValue(value)
                ])
            );
            this.super(DatasetMixin).$storeWatchHandler.call(this, isEqual(state, newState) ? state : newState);
        },
        setFilterPopoverBinds() {
            const {
                settingsPopoverBinds,
                settingsPopoverLevel,
                isShownSettingsPopoverSort,
                settingsPopoverFields,
                uniqDimensionsFields,
                settingsPopoverFilterLevel,
                playerFiltersValues,
                flatSortField,
                dimensions,
                isFlat
            } = this;

            this.filterPopoverBinds = {
                settings: settingsPopoverBinds ?? {},
                isSortDesc: settingsPopoverFields?.[settingsPopoverLevel]?.sortDesc ?? false,
                shownSort: isShownSettingsPopoverSort,
                filters: uniqDimensionsFields?.[dimensions[settingsPopoverFilterLevel]] ?? [],
                usedFilters: playerFiltersValues?.[settingsPopoverFilterLevel] ?? [],
                isSort: isFlat ? flatSortField === settingsPopoverFields?.[settingsPopoverLevel] : true,
                isCollapsable: settingsPopoverLevel < settingsPopoverFields.length - 1
            };
        },
        buildFilters(filters) {
            const {
                QueryFilterOperator,
                dimensions,
                uniqDimensionsFields,
                playerRows,
                playerColumns,
                playerFilters,
                props
            } = this;
            const { isHiddenFiltrationEnabled } = props;
            const dimIndexes = [...playerRows, ...playerColumns, ...playerFilters].map(({ dataAlias }) =>
                dimensions.findIndex((dim) => dim === dataAlias)
            );

            return filters.reduce((acc, filter, index) => {
                const dimensionName = dimensions[index];
                const initDimValues = this.initFilters?.[dimensionName] ?? [];
                const dimValues = uniqDimensionsFields?.[dimensionName] ?? [];
                const filterLength = filter?.length ?? 0;
                if (
                    filter == null ||
                    filter === 'null' ||
                    (filterLength === initDimValues.length && filterLength === dimValues.length)
                ) {
                    return acc;
                }

                const filterIndex = dimIndexes.findIndex((dimIndex) => dimIndex === index);
                if (isHiddenFiltrationEnabled === false && filterIndex < 0) {
                    return acc;
                }

                const isInNotOperator =
                    initDimValues.length === dimValues.length &&
                    filter?.length != null &&
                    dimValues?.length != null &&
                    dimValues.length > 0 &&
                    filter.length > dimValues.length / 2;

                acc.push({
                    name: dimensionName,
                    operator: isInNotOperator ? QueryFilterOperator.IN_NOT : QueryFilterOperator.IN,
                    value: isInNotOperator
                        ? Array.from(new Set(dimValues.map(({ name }) => name)).difference(new Set(filter)))
                        : filter
                });

                return acc;
            }, []);
        },
        async fetchRows({
            path = [],
            offset = null,
            fetchAllData = false,
            buildMap = true,
            dataFilters = [],
            filterAlias = null,
            limit = null,
            tableMaps = this.tableMaps,
            startIndex = null
        } = {}) {
            if (this.fetchRowsUseCancel) {
                this.cancelRequests(RequestType.ROWS);
            }
            const { playerRows, playerColumns, QuerySortDirection, playerFiltersValues, dimensions } = this;
            const settings = playerRows.slice(0, path.length + 1).concat(fetchAllData ? playerColumns : []);
            const filterAliasDimIndex = dimensions.findIndex((dim) => dim === filterAlias);
            const dimIndexes = playerRows
                .slice(0, path.length)
                .map(({ dataAlias }) => dimensions.findIndex((dim) => dim === dataAlias));

            const filterValues = playerFiltersValues.map((filter, index) => {
                if (filterAliasDimIndex === index) {
                    return dataFilters;
                }

                const pathIndex = dimIndexes.findIndex((dimIndex) => dimIndex === index);
                if (pathIndex < 0) {
                    return filter;
                }
                return [path[pathIndex]];
            });

            const filters = this.buildFilters(filterValues);
            const { metrics, metricsCustom } = this.buildRequestMetrics();
            const request = (this.requestsMap[RequestType.ROWS] = this.buildRequest({
                dimensions: settings
                    .flatMap(({ dataAlias, sortAlias }) => [dataAlias, sortAlias])
                    .filter((dim) => dim !== ''),
                metrics,
                metricsCustom,
                filters,
                offset,
                limit
            }));
            settings.forEach(({ sortDesc, sortAlias, dataAlias }) => {
                request.query.sortAdd({
                    name: sortAlias || dataAlias,
                    direction: sortDesc ? QuerySortDirection.DESC : QuerySortDirection.ASC
                });
            });
            try {
                const result = await request.send();
                const { rows, rowCount } = result;

                const map = buildMap
                    ? await this.buildTableMaps(rows, {
                          path,
                          filters: [],
                          updateRowsHeap: fetchAllData ? tableMaps.rowsHeap : null,
                          updateColumnsHeap: fetchAllData ? tableMaps.columnsHeap : null,
                          columns: fetchAllData ? playerColumns : [],
                          startIndex: fetchAllData ? startIndex ?? this.result.rows.length : 0
                      })
                    : null;
                return {
                    rows,
                    rowCount,
                    result,
                    map
                };
            } catch (e) {
                this.$handleError(e);
                return {};
            }
        },

        findPropRowByDataAlias(dataAlias) {
            return this.props.rows.find(({ dataAlias: dataAliasRow }) => dataAliasRow === dataAlias) ?? {};
        },

        buildTotalRequest() {
            const { playerFiltersValues } = this;
            const filters = this.buildFilters(playerFiltersValues);
            const { metrics, metricsCustom } = this.buildRequestMetrics();
            const request = this.buildRequest({
                dimensions: [],
                metrics,
                metricsCustom,
                filters,
                offset: 0,
                limit: 0
            });

            request.query.sortRemoveAll();

            return request;
        },
        buildRequestCacheKey(request) {
            return JSON.stringify({
                query: request.query.prepared,
                offset: request.offset,
                limit: request.limit
            });
        },
        async fetchTotal() {
            const request = this.buildTotalRequest();
            const cacheKey = this.buildRequestCacheKey(request);

            if (this.totalDataCache?.key === cacheKey) {
                return { rows: this.totalDataCache.rows };
            }

            this.cancelRequests(RequestType.TOTAL);
            this.requestsMap[RequestType.TOTAL] = request;

            try {
                const { rows } = await request.send();
                this.totalDataCache = {
                    key: cacheKey,
                    rows
                };
                return { rows };
            } catch (e) {
                this.$handleError(e);
                return {};
            }
        },

        async fetchTotalsForPath(path = [], level = 0) {
            const { playerRows, playerFiltersValues, dimensions, QuerySortDirection } = this;
            const splicedPlayerRows = playerRows.slice(0, level + 2);
            const filterValues = playerFiltersValues.map((filter, index) => {
                const rowIndex = splicedPlayerRows.findIndex(({ dataAlias }) => dimensions[index] === dataAlias);
                if (rowIndex > -1 && path?.[rowIndex] != null) {
                    return [path[rowIndex]];
                }
                return filter;
            });
            const filters = this.buildFilters(filterValues);
            const { metrics, metricsCustom } = this.buildRequestMetrics();
            const request = this.buildRequest({
                dimensions: splicedPlayerRows
                    .flatMap(({ dataAlias, sortAlias }) => [dataAlias, sortAlias])
                    .filter((dim) => dim !== ''),
                metrics,
                metricsCustom,
                filters,
                offset: 0,
                limit: 0
            });
            splicedPlayerRows.forEach(({ sortDesc, sortAlias, dataAlias }) => {
                request.query.sortAdd({
                    name: sortAlias || dataAlias,
                    direction: sortDesc ? QuerySortDirection.DESC : QuerySortDirection.ASC
                });
            });
            try {
                const { rows } = await request.send();
                const map = await this.buildTableMaps(rows, {
                    filters: [],
                    rows: splicedPlayerRows,
                    columns: []
                });
                return { rows, map };
            } catch (e) {
                this.$handleError(e);
                return { rows: [], map: {} };
            }
        },

        async fetchAllColumns({ startIndex = this.result?.rows?.length ?? 0 } = {}) {
            this.cancelRequests(RequestType.ALL_COLUMNS);
            const { playerColumns, QuerySortDirection, playerFiltersValues } = this;
            const filters = this.buildFilters(playerFiltersValues);
            const { metrics, metricsCustom } = this.buildRequestMetrics();
            this.requestsMap[RequestType.ALL_COLUMNS] = this.buildRequest({
                dimensions: playerColumns
                    .flatMap(({ dataAlias, sortAlias }) => {
                        const { sortAlias: propRowSortAlias } = this.findPropRowByDataAlias(dataAlias);
                        const effectiveSortAlias = sortAlias || propRowSortAlias;
                        return effectiveSortAlias ? [dataAlias, effectiveSortAlias] : [dataAlias];
                    })
                    .filter((dim) => dim !== ''),
                metrics,
                metricsCustom,
                filters,
                offset: 0,
                limit: 0
            });
            const request = this.requestsMap[RequestType.ALL_COLUMNS];
            playerColumns.forEach(({ sortDesc, sortAlias, dataAlias }) => {
                const { sortAlias: propRowSortAlias } = this.findPropRowByDataAlias(dataAlias);
                request.query.sortAdd({
                    name: sortAlias || propRowSortAlias || dataAlias,
                    direction: sortDesc ? QuerySortDirection.DESC : QuerySortDirection.ASC
                });
            });
            try {
                const { rows } = await request.send();
                const map = await this.buildTableMaps(rows, {
                    filters: [],
                    rows: [],
                    startIndex
                });
                return {
                    map,
                    rows
                };
            } catch (e) {
                this.$handleError(e);
                return {};
            }
        },
        buildRequestMetrics() {
            const { metrics: datasetMetrics, playerValues } = this;
            const playerValuesExpressions = playerValues
                .filter(({ isCalculated }) => isCalculated)
                .map(({ expression }) => expression);
            const playerValuesMetrics = uniqArray(
                playerValues.flatMap(
                    ({
                        metricType,
                        dataAlias,
                        sortAlias,
                        calculatedCell: { dataAlias: calcAlias, isUsed: IsUsedCalc }
                    }) =>
                        metricType === MetricType.CUSTOM
                            ? []
                            : [dataAlias, sortAlias, ...(IsUsedCalc ? [calcAlias] : [])]
                )
            ).filter((val) => val !== '');
            const metrics = [...datasetMetrics]
                .sort((first, second) => second.length - first.length)
                .filter(
                    (metric) =>
                        playerValuesMetrics.includes(metric) ||
                        playerValuesExpressions.some((expression) => expression.includes(metric))
                );
            const metricsCustom = playerValues
                .filter(({ metricType }) => metricType === MetricType.CUSTOM)
                .map(({ dataAlias, aggregate }) => ({
                    name: this.resolveCellValueByAggregate({ value: dataAlias, aggregate }),
                    field: dataAlias,
                    func: aggregate
                }));
            return { metrics, metricsCustom };
        },
        buildSlicedRequest({ limit = null, offset = null, playerRows = this.playerRows, isFlat = this.isFlat } = {}) {
            const {
                playerColumns,
                playerValues,
                playerFiltersValues,
                QuerySortDirection,
                metrics,
                flatSortField,
                columnSortOptions
            } = this;
            const playerValuesExpressions = playerValues
                .filter(({ isCalculated }) => isCalculated)
                .map(({ expression }) => expression);
            const playerValuesMetrics = uniqArray(
                playerValues.flatMap(
                    ({ dataAlias, sortAlias, calculatedCell: { dataAlias: calcAlias, isUsed: IsUsedCalc } }) => [
                        dataAlias,
                        sortAlias,
                        ...(IsUsedCalc ? [calcAlias] : [])
                    ]
                )
            ).filter((val) => val !== '');
            const neededDimensions = uniqArray([
                ...playerRows.flatMap(({ dataAlias, sortAlias }) => [dataAlias, sortAlias]),
                ...playerColumns.flatMap(({ dataAlias, sortAlias }) => [dataAlias, sortAlias])
            ]).filter((val) => val !== '');
            const neededMetrics = [...metrics]
                .sort((first, second) => second.length - first.length)
                .filter(
                    (metric) =>
                        playerValuesMetrics.includes(metric) ||
                        playerValuesExpressions.some((expression) => expression.includes(metric))
                );

            const filters = this.buildFilters(playerFiltersValues);
            const { metricsCustom } = this.buildRequestMetrics();

            if (!isFlat) {
                return this.buildRequest({
                    dimensions: neededDimensions,
                    metrics: neededMetrics,
                    metricsCustom,
                    filters,
                    limit,
                    offset
                });
            }
            const { isUsed, sortDesc } = columnSortOptions;

            const values = [...playerRows, ...playerColumns, ...playerValues];
            const neededMetricDimension = [...neededDimensions, ...neededMetrics].find(
                (name) => name === flatSortField?.sortAlias || name === flatSortField?.dataAlias
            );
            const neededValue =
                values.find(
                    ({ dataAlias, sortAlias }) =>
                        sortAlias === neededMetricDimension || dataAlias === neededMetricDimension
                ) ??
                values[0] ??
                {};
            const sortSettings = {
                ...neededValue,
                ...(isUsed ? { sortDesc } : {})
            };
            const sort = (() => {
                const {
                    sortDesc: sortDescSetting,
                    sortAlias: sortAliasSetting,
                    dataAlias: dataAliasSetting
                } = sortSettings ?? {};

                if ((sortAliasSetting == null && dataAliasSetting == null) || dataAliasSetting == null) {
                    return null;
                }

                return {
                    name: sortAliasSetting || dataAliasSetting,
                    direction: sortDescSetting ? QuerySortDirection.DESC : QuerySortDirection.ASC
                };
            })();

            return this.buildRequest({
                dimensions: neededDimensions,
                metrics: neededMetrics,
                metricsCustom,
                filters,
                sort,
                offset,
                limit
            });
        },
        buildRequest({
            dimensions = [],
            metrics = [],
            metricsCustom = [],
            filters = [],
            sort = null,
            offset = null,
            limit = null,
            isClearedFilters = false,
            isFiltersHardClear = false
        } = {}) {
            const {
                props: { [this.DATASET_PROP]: datasets },
                request: oldRequest,
                QueryKey
            } = this;

            const [dataset] = datasets;

            const {
                limit: oldLimit,
                offset: oldOffset,
                query: { raw: oldRequestQuery, sort: oldRequestSort = [] }
            } = oldRequest;

            const request = DatasetRequestFactory(
                {
                    ...dataset,
                    query: {
                        ...oldRequestQuery,
                        [QueryKey.DIMENSIONS]: dimensions,
                        [QueryKey.METRICS]: metrics,
                        [QueryKey.METRICS_CUSTOM]: metricsCustom,
                        [QueryKey.SORT]: []
                    }
                },
                { queryModelStrategy: QueryModelsStrategies.CUSTOM_METRICS }
            );

            const { query } = request;
            request.offset = offset ?? oldOffset;
            request.limit = limit ?? oldLimit;

            query.metricCustomRemoveAll();
            metricsCustom.forEach((metric) => {
                query.metricCustomAdd(metric);
            });

            if (isClearedFilters === false) {
                if (isFiltersHardClear === true) {
                    query.filterRemoveAll();
                }
                filters.forEach((filter) => {
                    query.filterAdd(filter);
                });
            } else {
                query.filterRemoveAll();
            }

            const sortableFields = new Set([...dimensions, ...metrics, ...metricsCustom.map(({ name }) => name)]);
            oldRequestSort
                .filter(({ name }) => sortableFields.has(name))
                .forEach((item) => {
                    query.sortAdd(item);
                });
            if (sort != null) {
                query.sortAdd(sort);
            }

            return request;
        },
        async fetchData({
            dimensions = [],
            metrics = [],
            filters = [],
            sort = null,
            offset = 0,
            limit = null,
            isClearedFilters = false
        }) {
            const request = this.buildRequest({ dimensions, metrics, sort, filters, offset, limit, isClearedFilters });
            (this.requestsMap[RequestType.DATA] ??= []).push(request);
            try {
                const result = await request.send();
                return result;
            } catch (e) {
                this.$handleError(e);
                return null;
            }
        },
        async fetchDimension({ dimension, isClearedFilters = false }) {
            const result = await this.fetchData({ dimensions: [dimension], limit: 0, isClearedFilters });

            return result == null ? [] : result.rows.map((row) => row[dimension]);
        },

        /**
         * @param {number} [page=1]
         */
        setPage(page = 1) {
            this.page = page;
            this.loadSlicedData();
        },
        /** @public */
        $requestChanged(requests) {
            const [request] = requests;
            if (request == null) {
                return;
            }
            this.totalDataCache = null;
            this.pendingDefaultTotalsPromise = null;
            if (this.props.canDropFiltersAfterStoreChange) {
                this.playerFiltersValues = new Array(this.dimensions.length).fill(null);
            }
            this.isNeedUpdateFilters = true;
            this.setPage(1);
        },

        onResizeColumnMove(event) {
            const { clientX } = event;
            const {
                recycleScroller: { $el: recycleScroller }
            } = this.$refs;
            const { scrollLeft } = recycleScroller;
            this.resizedLineOffset = clientX - this.resizedTableOffset + scrollLeft;
        },
        onResizeColumnEnd(event) {
            const { clientX } = event;
            const {
                recycleScroller: { $el: recycleScroller }
            } = this.$refs;
            const { scrollLeft: tableScrollLeft } = recycleScroller;
            this.setResizedColumns(
                this.resizedIndex,
                this.resizedCurSize + clientX - this.resizedTableOffset + tableScrollLeft - this.resizedStart
            );
            this.resizedIndex = null;
            document.removeEventListener('mouseup', this.onResizeColumnEnd);
            document.removeEventListener('mousemove', this.onResizeColumnMove);
        },
        onResizeColumnStart(event, index) {
            const { clientX, target } = event;
            const {
                recycleScroller: { $el: recycleScroller }
            } = this.$refs;
            this.resizedIndex = index;
            const { width: targetWidth } = target.closest('[data-popover-target]').getBoundingClientRect();
            const { left: tableOffsetLeft } = recycleScroller.getBoundingClientRect();
            this.resizedTableOffset = tableOffsetLeft;
            const { scrollLeft, scrollHeight } = recycleScroller;
            this.resizedCurSize = targetWidth;
            this.resizedLineOffset = clientX - tableOffsetLeft + scrollLeft;
            this.resizedLineSize = scrollHeight;
            this.resizedStart = clientX - tableOffsetLeft + scrollLeft;
            this.isVerticalResizedLine = true;
            document.addEventListener('mouseup', this.onResizeColumnEnd);
            document.addEventListener('mousemove', this.onResizeColumnMove);
        },
        onResizeRowMove(event) {
            const { clientY } = event;
            const {
                recycleScroller: { $el: recycleScroller }
            } = this.$refs;
            const { scrollTop } = recycleScroller;
            this.resizedLineOffset = clientY - this.resizedTableOffset + scrollTop;
        },
        onResizeRowEnd(event) {
            const { clientY } = event;
            const {
                recycleScroller: { $el: recycleScroller }
            } = this.$refs;
            const { scrollTop: tableScrollTop } = recycleScroller;
            this.setResizedRows(
                this.resizedIndex,
                this.resizedCurSize + clientY - this.resizedTableOffset + tableScrollTop - this.resizedStart
            );
            this.resizedIndex = null;
            document.removeEventListener('mouseup', this.onResizeRowEnd);
            document.removeEventListener('mousemove', this.onResizeRowMove);
        },
        onResizeRowStart(event, index) {
            const { clientY, target } = event;
            const {
                recycleScroller: { $el: recycleScroller }
            } = this.$refs;
            this.resizedIndex = index;
            const { height: targetHeight } = target.closest('[data-popover-target]').getBoundingClientRect();
            const { top: tableOffsetTop } = recycleScroller.getBoundingClientRect();
            this.resizedTableOffset = tableOffsetTop;
            const { scrollTop, scrollWidth } = recycleScroller;
            this.resizedCurSize = targetHeight;
            this.resizedLineOffset = clientY - tableOffsetTop + scrollTop;
            this.resizedLineSize = scrollWidth;
            this.resizedStart = clientY - tableOffsetTop + scrollTop;
            this.isVerticalResizedLine = false;
            document.addEventListener('mouseup', this.onResizeRowEnd);
            document.addEventListener('mousemove', this.onResizeRowMove);
        },
        setResizedColumns(index, size) {
            const { resizedColumnsIndexes } = this;
            this.resizedColumnsIndexes = updateEntriesValue(resizedColumnsIndexes, index, size);
        },

        setResizedRows(index, size) {
            const { resizedRowsIndexes, tableRows, tableHeadRows } = this;
            const realSize = Math.max(rowMinHeight, size);
            this.resizedRowsIndexes = updateEntriesValue(resizedRowsIndexes, index, realSize);
            const rowIndex = index - tableHeadRows.length;

            if (tableRows?.[rowIndex] == null) {
                return;
            }
            tableRows[rowIndex].size = realSize;
        },
        buildResizedCellStyleByIndexes(index) {
            const width = Object.fromEntries(this.resizedColumnsIndexes)[index];
            return width == null ? {} : this.$genCssVarsStyle(buildResizedCssVars({ width }));
        },

        buildResizedRowStyleByIndexes(index) {
            const size = Object.fromEntries(this.resizedRowsIndexes)[index];
            return size == null ? {} : this.$genCssVarsStyle(buildRowCssVars({ size }));
        },

        buildSelectedColumnsStoreValue() {
            const {
                selectedCells,
                tableHeadRows,
                tableRows,
                playerRows,
                playerColumns,
                playerSettings: { isUsedIndexes },
                isFlat
            } = this;
            const rowsLength = playerRows.length + (isUsedIndexes ? 1 : 0);
            if (isFlat) {
                const headLength = tableHeadRows.length;

                return playerColumns.map((_, level) =>
                    selectedCells.reduce((acc, [rowIndex, indexes]) => {
                        if (rowIndex < headLength || !indexes.includes(rowsLength + level)) {
                            return acc;
                        }
                        const val = tableRows[rowIndex - headLength].cells[rowsLength + level].path[level];
                        if (val == null || acc.includes(val)) {
                            return acc;
                        }
                        return [...acc, val];
                    }, [])
                );
            }
            return playerColumns.map((_, level) => {
                const [__, indexes = []] =
                    selectedCells.find(([rowIndex]) => level + (isUsedIndexes ? 1 : 0) === rowIndex) ?? [];
                return indexes.reduce((acc, index) => {
                    if (index < rowsLength) {
                        return acc;
                    }
                    const val = tableHeadRows[level + (isUsedIndexes ? 1 : 0)].cells[index].path[level];

                    if (val == null || acc.includes(val)) {
                        return acc;
                    }
                    return [...acc, val];
                }, []);
            });
        },
        buildSelectedRowsStoreValue() {
            const {
                selectedCells,
                tableRows,
                playerRows,
                tableHeadRows,
                playerSettings: { isUsedIndexes }
            } = this;
            const headLength = tableHeadRows.length;
            return playerRows.map((_, level) =>
                selectedCells.reduce((acc, [rowIndex, indexes]) => {
                    if (rowIndex < headLength || !indexes.includes(level + (isUsedIndexes ? 1 : 0))) {
                        return acc;
                    }
                    const val = tableRows[rowIndex - headLength].cells[level + (isUsedIndexes ? 1 : 0)].path[level];
                    if (val == null || acc.includes(val)) {
                        return acc;
                    }
                    return [...acc, val];
                }, [])
            );
        },
        sendToStore() {
            const {
                playerRows,
                playerColumns,
                props: { canCommitVars },
                changedStoreValues
            } = this;
            if (!canCommitVars) {
                return;
            }
            const storeRowsValues = this.buildSelectedRowsStoreValue();
            const storeColumnsValues = this.buildSelectedColumnsStoreValue();
            const storeRows = playerRows.reduce((acc, { dataAlias }, level) => {
                const values = storeRowsValues[level];
                if (values.length === 0 && changedStoreValues[dataAlias] == null) {
                    return acc;
                }
                this.$set(changedStoreValues, dataAlias, true);
                return { ...acc, [dataAlias]: values.length === 0 ? null : values };
            }, {});
            const storeColumns = playerColumns.reduce((acc, { dataAlias }, level) => {
                const values = storeColumnsValues[level];
                if (values.length === 0 && changedStoreValues[dataAlias] == null) {
                    return acc;
                }
                this.$set(changedStoreValues, dataAlias, true);
                return { ...acc, [dataAlias]: values.length === 0 ? null : values };
            }, {});
            const result = { ...storeRows, ...storeColumns };
            if (Object.keys(result).length === 0) {
                return;
            }
            this.$storeCommit(result);
        },
        async fetchPaginationData(rowFilter) {
            this.cancelRequests(RequestType.PAGINATION_DATA);
            const { playerRows, playerColumns, QuerySortDirection, playerFiltersValues, dimensions } = this;
            const [row = null] = playerRows;
            const rows = row == null ? [] : [row];
            const columnDimensions = playerColumns.flatMap(({ dataAlias, sortAlias }) => {
                const { sortAlias: propRowSortAlias } = this.findPropRowByDataAlias(dataAlias);
                return [dataAlias, sortAlias, propRowSortAlias];
            });
            const usedDimensions = [
                ...rows.flatMap(({ dataAlias, sortAlias }) => [dataAlias, sortAlias]),
                ...columnDimensions
            ].filter((dim) => dim != null && dim !== '');

            const dimIndexes = rows.map(({ dataAlias }) => dimensions.findIndex((dim) => dim === dataAlias));
            const filterValues = playerFiltersValues.map((filter, index) => {
                const pathIndex = dimIndexes.findIndex((dimIndex) => dimIndex === index);
                if (pathIndex < 0) {
                    return filter;
                }
                return rowFilter;
            });

            const filters = this.buildFilters(filterValues);
            const { metrics, metricsCustom } = this.buildRequestMetrics();
            const request = (this.requestsMap[RequestType.PAGINATION_DATA] = this.buildRequest({
                dimensions: usedDimensions,
                metrics,
                metricsCustom,
                filters,
                limit: 0,
                offset: 0
            }));
            rows.forEach(({ sortDesc, sortAlias, dataAlias }) => {
                request.query.sortAdd({
                    name: sortAlias || dataAlias,
                    direction: sortDesc ? QuerySortDirection.DESC : QuerySortDirection.ASC
                });
            });
            playerColumns.forEach(({ sortDesc, sortAlias, dataAlias }) => {
                const { sortAlias: propRowSortAlias } = this.findPropRowByDataAlias(dataAlias);
                request.query.sortAdd({
                    name: sortAlias || propRowSortAlias || dataAlias,
                    direction: sortDesc ? QuerySortDirection.DESC : QuerySortDirection.ASC
                });
            });

            try {
                const { rows: result } = await request.send();
                return result ?? [];
            } catch (e) {
                this.$handleError(e);
                return [];
            }
        },

        async load() {
            if (this.canLoadData) {
                //если уже была вызвана загрузка отменяем текущую
                this.needLoad = true; //ставим в очередь новую загрузку
                return;
            }
            this.needLoad = false; //сбрасываем чтобы исключить рекурсию
            this.canLoadData = true; //флаг что загрузка начата
            let isLoaderStarted = false;
            try {
                if (this.isFirstLoad) {
                    this.updateStartedData();
                    this.isFirstLoad = false;
                }
                // нет настроенных строк/колонок, чтобы загружать данные
                if (
                    this.playerColumns.length +
                        this.playerRows.length +
                        this.playerFilters.length +
                        this.playerValues.length ===
                    0
                ) {
                    return;
                }

                this.loaderStart();
                isLoaderStarted = true;
                this.pendingDefaultTotalsPromise = null;

                if (this.isFlat && this.canShownPagination) {
                    const request = this.buildSlicedRequest();
                    const [result, { rows: totalData } = {}] = await Promise.all([request.send(), this.fetchTotal()]);
                    this.result = result;
                    this.isFirstInitTableMaps = false;

                    await this.generateTableMaps(this.result.rows);
                    this.tableMaps.totalData = totalData;
                    await this.generateTableRows();
                    return;
                }

                if (this.isPagType === false) {
                    //легаси загрузка в обычном режиме
                    if (this.props.isDatasetTotalAggregation) {
                        this.pendingDefaultTotalsPromise = this.fetchTotalsForPath([]);
                    }
                    await this.loadData(this.buildSlicedRequest());
                    return;
                }

                const {
                    rowCount,
                    rows: columnTotalData,
                    result,
                    map: { rowsPaths = [], rowsHeap: RowsTotalHeap }
                } = await this.fetchRows();
                const names = rowsPaths.map(([name]) => name);
                const paginationDataPromise =
                    names.length > 0 ? this.fetchPaginationData(rowsPaths.map(([name]) => name)) : Promise.resolve([]);
                const totalPromise = this.props.isDatasetTotalAggregation ? this.fetchTotal() : Promise.resolve({ rows: [] });
                const pagResult = await paginationDataPromise;
                this.result = result;
                this.result.rows = pagResult;
                this.result.rowCount = rowCount;
                this.isFirstInitTableMaps = false;
                const columnsPromise = this.fetchAllColumns({
                    startIndex: pagResult.length
                });
                const [
                    {
                        rows: columnsTotalData = [],
                        map: { columnsPaths, collapsedColumnsPaths, columnsHeap: ColumnsTotalHeap } = {}
                    } = {},
                    { rows: totalData = [] } = {}
                ] = await Promise.all([columnsPromise, totalPromise, this.generateTableMaps(pagResult)]);
                this.result.rows.push(...columnsTotalData);
                this.tableMaps.collapsedRowsPaths = rowsPaths;
                this.tableMaps.rowsTotalHeap = RowsTotalHeap;
                this.tableMaps.columnsPaths = columnsPaths;
                this.tableMaps.columnsTotalHeap = ColumnsTotalHeap;
                this.tableMaps.rowTotalData = this.props.isDatasetTotalAggregation ? totalData : null;
                this.tableMaps.columnTotalData = columnTotalData;
                this.collapsedRows = rowsPaths;
                this.collapsedColumns = collapsedColumnsPaths.filter((col) => col.length <= 1);
                await this.generateTableRows();
            } catch (e) {
                if (e.isCancel) {
                    return;
                }
                this.$handleError(e);
            } finally {
                this.canLoadData = false;
                if (isLoaderStarted) {
                    this.loaderEnd();
                }
            }
        },

        async loadSlicedData() {
            await this.load(); //попытка загрузки данных
            if (this.canLoadData) {
                //если идет загрузка отменяем текущую
                return;
            }
            if (this.needLoad === false) {
                //если дозагрзука не требуется отменяем загрузку
                return;
            }
            await this.loadSlicedData(); //рекурсивно догружаем если были еще запросы на обновление в процессе загрузки
        },
        checkSelectedCell({ rowIndex, index }) {
            return (
                this.selectedCells.find(
                    ([sRowIndex, sIndexes]) => rowIndex === sRowIndex && sIndexes.includes(index)
                ) != null
            );
        },

        async buildData() {
            if (this?.result != null) {
                this.loaderStart();
                await this.updateFilters();
                await this.generateTableMaps(this.result.rows);
                await this.generateTableRows();
                this.loaderEnd();
            }
        },
        async generateFlatTable() {
            const {
                playerSettings,
                playerRows: rowsSettings,
                playerColumns: columnsSettings,
                playerValues: valuesSettigns,
                props: { rowsHeight, titleHeight, indexesHeight },
                metrics,
                tableMaps,
                resizedRowsIndexes,
                filteredRowsPaths,
                filteredColumnsPaths
            } = this;
            const { isUsedIndexes = false } = playerSettings;
            const tableRows = await asyncGenerateFlatTable({
                ...tableMaps,
                ...playerSettings,
                rowsSettings,
                columnsSettings,
                valuesSettigns,
                data: this.result.rows,
                rowsHeight,
                titleHeight,
                indexesHeight,
                resizedRowsIndexes,
                rowMinHeight,
                metrics,
                isUsedIndexes,
                rowsPaths: filteredRowsPaths ?? tableMaps.rowsPaths,
                columnsPaths: filteredColumnsPaths ?? tableMaps.columnsPaths
            });
            const tableHeadRows = tableRows.splice(0, isUsedIndexes ? 2 : 1);
            this.tableRows = tableRows.filter(({ cells }) => this.checkCellsValuesFilters(cells));
            this.tableHeadRows = tableHeadRows;
        },

        async generateBasicTable() {
            const {
                playerSettings,
                playerRows: rows,
                playerColumns: columns,
                playerValues: valuesData,
                collapsedRows,
                collapsedColumns,
                columnSortOptions,
                filteredRowsPaths,
                filteredColumnsPaths,
                props: { rowsHeight, titleHeight, indexesHeight, isDatasetTotalAggregation },
                metrics,
                resizedColumnsIndexes,
                resizedRowsIndexes
            } = this;
            const { isUsedIndexes = false } = playerSettings;
            const isShownRowsSubtotals =
                playerSettings.subtotal.type === SubtotalType.ROWS || playerSettings.subtotal.type === SubtotalType.ALL;

            if (isDatasetTotalAggregation) {
                const isNeedDefaultTotals =
                    !Array.isArray(this.tableMaps.rowTotalData) ||
                    !Array.isArray(this.tableMaps.columnTotalData) ||
                    this.tableMaps.rowsTotalHeap == null ||
                    this.tableMaps.columnsTotalHeap == null;
                if (isNeedDefaultTotals) {
                    const { rows: totalsRows, map: totalsMap } =
                        this.pendingDefaultTotalsPromise != null
                            ? await this.pendingDefaultTotalsPromise
                            : await this.fetchTotalsForPath([]);
                    this.pendingDefaultTotalsPromise = null;
                    this.tableMaps = {
                        ...this.tableMaps,
                        rowTotalData: totalsRows,
                        columnTotalData: totalsRows,
                        rowsTotalHeap: totalsMap?.rowsHeap,
                        columnsTotalHeap: totalsMap?.columnsHeap
                    };
                }
            }

            const tableRows = await asyncGenerateTableCells({
                ...this.tableMaps,
                ...playerSettings,
                rowTotalsMap: {
                    default: { rowTotalData: this.tableMaps.rowTotalData, rowsTotalHeap: this.tableMaps.rowsTotalHeap },
                    ...(this.tableMaps.scopedRowTotals ?? {})
                },
                columnTotalsMap: {
                    default: {
                        columnTotalData: this.tableMaps.columnTotalData,
                        columnsTotalHeap: this.tableMaps.columnsTotalHeap
                    },
                    ...(this.tableMaps.scopedColumnTotals ?? {})
                },
                rowsPaths: filteredRowsPaths ?? this.tableMaps.rowsPaths,
                columnsPaths: filteredColumnsPaths ?? this.tableMaps.columnsPaths,
                collapsedColumns: playerSettings.isUsedCollapse ? collapsedColumns : [],
                rows,
                rowsHeight,
                titleHeight,
                indexesHeight,
                columns,
                collapsedRows: playerSettings.isUsedCollapse ? collapsedRows : [],
                valuesData,
                columnSortOptions,
                isBottomSubtotal: playerSettings.subtotal.rowPosition === SubtotalPosition.BOTTOM,
                isShownRowsSubtotals,
                data: this.result.rows,
                metrics,
                resizedColumnsIndexes,
                resizedRowsIndexes,
                rowMinHeight,
                tableDrawType: playerSettings?.tableDrawType || this.props.tableDrawType,
                metricsPosition: playerSettings?.metricsPosition || this.props.metricsPosition,
                isDatasetTotalAggregation
            });
            const headRowsCount = columns.length + 1 + (isUsedIndexes ? 1 : 0);
            const tableHeadRows = tableRows.splice(0, headRowsCount);
            this.tableRows = tableRows.filter(({ cells }) => this.checkCellsValuesFilters(cells));
            this.tableHeadRows = tableHeadRows;
        },
        async generateTableRows() {
            if (this.isGeneratedTableRows) {
                return;
            }
            if (!this.isGeneratedTableMaps) {
                return;
            }
            this.loaderStart();
            this.selectedCells = [];
            this.isGeneratedTableRows = true;
            if (this.isFlat) {
                await this.generateFlatTable();
                this.isGeneratedTableRows = false;
                this.loaderEnd();
                return;
            }
            await this.generateBasicTable();
            this.isGeneratedTableRows = false;
            this.loaderEnd();
        },
        checkCellsValuesFilters(cells) {
            const { valuesFilters } = this;
            const activeFilters = valuesFilters
                .map((filter, level) => ({ ...filter, level }))
                .filter(
                    ({ valuesFilterFirst: { value: fval }, valuesFilterSecond: { value: sval } }) =>
                        fval !== '' || sval !== ''
                );
            const onlyTypeCellCells = cells.filter(({ type }) => type === CellsTypes.CELL);

            return (
                onlyTypeCellCells.length === 0 ||
                activeFilters.length === 0 ||
                activeFilters.every(
                    ({ level: flevel, valuesFilterOperator, valuesFilterFirst, valuesFilterSecond }) => {
                        const filters = [valuesFilterFirst, valuesFilterSecond].filter(({ value }) => value !== '');
                        return onlyTypeCellCells
                            .filter(({ level }) => level === flevel)
                            .some(({ value }) =>
                                filters[valuesFilterOperator === '' ? 'every' : 'some'](({ value: fvalue, operator }) =>
                                    ConditionFunction[operator](fvalue, value)
                                )
                            );
                    }
                )
            );
        },
        async buildTableMaps(
            data = this.result.rows,
            {
                path,
                filters = this.playerFilters,
                rows = this.playerRows,
                columns = this.playerColumns,
                startIndex = 0,
                updateRowsHeap = null,
                updateColumnsHeap = null
            } = {}
        ) {
            const {
                playerSettings,
                props: { isReplacingEmptyFields, replacingVoidValue, replacingNullValue }
            } = this;

            const map = await asyncGenerateTableMaps({
                rowPath: path,
                data,
                rows,
                columns,
                filters,
                isShownRowsSubtotals:
                    playerSettings.subtotal.type === SubtotalType.ROWS ||
                    playerSettings.subtotal.type === SubtotalType.ALL,
                isShownColumnsSubtotals:
                    playerSettings.subtotal.type === SubtotalType.COLUMNS ||
                    playerSettings.subtotal.type === SubtotalType.ALL,
                isReplacingEmptyFields,
                replacingVoidValue,
                replacingNullValue,
                startIndex,
                updateRowsHeap,
                updateColumnsHeap
            });
            return map;
        },

        async updateSingleFilters(fields) {
            const { playerFiltersValues, dimensions, uniqDimensionsFields } = this;
            const filterFields = Array.from(new Set(fields.map(({ dataAlias }) => dataAlias)));
            this.updatedSingleFilters = this.updatedSingleFilters.concat(filterFields);

            const prepareFilters = (dataFilters) =>
                dataFilters.reduce((acc, values, index) => {
                    acc[filterFields[index]] = values
                        .filter((name) => name != null)
                        .map((name, id) => ({ id, name, size: FILTER_HEIGHT }));
                    return acc;
                }, {});

            try {
                const updatedFilters = await Promise.all(
                    filterFields.map((dim) => this.fetchDimension({ dimension: dim }))
                );
                const updatedFiltersOptionsMap = prepareFilters(updatedFilters);

                this.uniqDimensionsFields = {
                    ...uniqDimensionsFields,
                    ...updatedFiltersOptionsMap
                };
                this.playerFiltersValues = dimensions.map(
                    (dimension, index) =>
                        playerFiltersValues[index] ??
                        updatedFiltersOptionsMap?.[dimension]?.map(({ name }) => name) ??
                        null
                );
                this.initFilters = { ...this.initFilters, ...updatedFiltersOptionsMap };
                if (this.needLoad === false) {
                    this.isNeedUpdateFilters = false;
                }
            } catch (e) {
                this.$handleError(e);
            }
        },

        async updateFilters({
            filters = this.playerFilters,
            rows = this.playerRows,
            columns = this.playerColumns
        } = {}) {
            const {
                playerFiltersValues,
                dimensions,
                props: { shouldFilterFiltersOnStoreChange },
                uniqDimensionsFields
            } = this;
            const dataAliasSet = new Set([...rows, ...columns, ...filters].map(({ dataAlias }) => dataAlias));
            const filterFields = Array.from(
                this.isNeedUpdateFilters
                    ? dataAliasSet
                    : dataAliasSet.difference(new Set(Object.keys(uniqDimensionsFields)))
            );

            try {
                const updatedFilters = await Promise.all(
                    filterFields.map((dim) => this.fetchDimension({ dimension: dim }))
                );
                const updatedFiltersOptionsMap = updatedFilters.reduce((acc, values, index) => {
                    acc[filterFields[index]] = values
                        .filter((name) => name != null)
                        .map((name, id) => ({ id, name, size: FILTER_HEIGHT }));
                    return acc;
                }, {});
                const clearedFilters = await Promise.all(
                    shouldFilterFiltersOnStoreChange
                        ? updatedFilters
                        : filterFields.map((dim) => this.fetchDimension({ dimension: dim, isClearedFilters: true }))
                );
                const clearedFiltersOptionsMap = clearedFilters.reduce((acc, values, index) => {
                    acc[filterFields[index]] = values
                        .filter((name) => name != null)
                        .map((name, id) => ({
                            id,
                            name,
                            size: FILTER_HEIGHT
                        }));
                    return acc;
                }, {});

                this.uniqDimensionsFields = {
                    ...uniqDimensionsFields,
                    ...clearedFiltersOptionsMap
                };
                this.playerFiltersValues = dimensions.map(
                    (dimension, index) =>
                        playerFiltersValues[index] ??
                        updatedFiltersOptionsMap?.[dimension]?.map(({ name }) => name) ??
                        null
                );
                this.initFilters = { ...this.initFilters, ...updatedFiltersOptionsMap };
                if (this.needLoad === false) {
                    this.isNeedUpdateFilters = false;
                }
            } catch (e) {
                this.$handleError(e);
            }
        },
        async generateTableMaps(
            data,
            { filters = this.playerFilters, rows = this.playerRows, columns = this.playerColumns } = {}
        ) {
            this.isGeneratedTableMaps = false;
            const {
                isFirstInitTableMaps,
                props: { isUncollapsedAll }
            } = this;

            const map = await this.buildTableMaps(data, { filters, rows, columns });
            if (isFirstInitTableMaps) {
                this.tableMaps = { ...this.tableMaps, ...map };
                this.isGeneratedTableMaps = true;
                return;
            }

            this.cancelRequests(RequestType.DATA);

            const { collapsedColumnsPaths, collapsedRowsPaths } = map;
            this.collapsedRows = isUncollapsedAll ? [] : collapsedRowsPaths;
            this.collapsedColumns = isUncollapsedAll ? [] : collapsedColumnsPaths;
            this.tableMaps = { ...this.tableMaps, ...map };
            this.isFirstInitTableMaps = true;
            this.isGeneratedTableMaps = true;
        },
        mixColors2Pivot({ borderRgba, bgRgba = 'rgba(255,0,0, 0.7)', textRgba = 'rgba(0,255,0, 0.5)' } = {}) {
            const white = Color('rgb(255,255,255)');
            const borderColor = Color(this.resolveColorWithFromCssVar(borderRgba));
            const bgColor = Color(this.resolveColorWithFromCssVar(bgRgba, 'rgb(255,255,255)'));
            const color = Color(this.resolveColorWithFromCssVar(textRgba));

            const borderColorAlpha = bgColor.alpha();
            const bgColorAlpha = bgColor.alpha();
            const colorAlpha = color.alpha();

            const exportedborderColor = white.mix(borderColor.alpha(1), borderColorAlpha);
            const exportedBgColor = white.mix(bgColor.alpha(1), bgColorAlpha);
            const exportedColor = white.mix(color.alpha(1), colorAlpha);

            return {
                bgColor: exportedBgColor.rgb().array().map(Math.round),
                color: exportedColor.rgb().array().map(Math.round),
                ...(borderRgba && { borderColor: exportedborderColor.rgb().array().map(Math.round) })
            };
        },
        composeCreateReportPivotFileds(fields) {
            const {
                props: { baseRowsSettings, baseColumnsSettings, baseValuesSettings, tableBorderColor },
                playerValues,
                playerConditions,
                playerRows,
                playerColumns,
                isFlat
            } = this;

            const addType = (arr, type) => arr.map((item) => ({ ...item, type }));

            const values = [].concat(
                addType(playerRows, 'row'),
                addType(playerColumns, 'column'),
                addType(playerValues, 'value')
            );

            const preparedFields = fields.filter((field) => !values.map((value) => value.sortAlias).includes(field));
            return preparedFields.map((field) => {
                const {
                    format = '',
                    dataAlias = '',
                    backgroundColor = '',
                    color = '',
                    type
                } = values.find((value) => value.dataAlias === field) ?? {};
                const { pattern } = format === '' ? new NumberFormat() : NumberFormat.fromString(format);
                const { digits = 0, modifiers = NumberFormatPattern.Modifier.FIXED } = pattern;
                const isPercent = modifiers.includes(NumberFormatPattern.Modifier.PERCENT);
                let settingsType = isPercent ? 'percent' : 'number';
                let adaptType = type;
                if (['row', 'column'].includes(adaptType)) {
                    settingsType = 'text';
                    if (isFlat) {
                        adaptType = 'row';
                    }
                }

                const baseSettings = (() => {
                    if (type === 'row') {
                        return baseRowsSettings;
                    }
                    if (type === 'column') {
                        return baseColumnsSettings;
                    }
                    return baseValuesSettings;
                })();

                const conditions = playerConditions.flatMap(
                    ({ value, operator, dataAlias: conditionDataAlias, cellSettings }) => {
                        const conds = [];
                        if (conditionDataAlias === '' || conditionDataAlias === dataAlias) {
                            conds.push({
                                condition: ConditionOperatorSymbol[operator],
                                value: parseFloat(value),
                                settings: {
                                    type: isPercent ? 'percent' : 'number',
                                    borderStyle: 'THIN',
                                    ...this.mixColors2Pivot({
                                        bgRgba: cellSettings.backgroundColor || 'rgba(255, 255, 255, 1)',
                                        textRgba: cellSettings.color || 'rgba(44, 44, 44, 1)'
                                    })
                                }
                            });
                        }

                        return conds;
                    }
                );

                return {
                    field,
                    type: adaptType,
                    settings: {
                        type: settingsType,
                        decimals: digits,
                        borderStyle: 'THIN',
                        ...this.mixColors2Pivot({
                            borderRgba: tableBorderColor,
                            bgRgba: backgroundColor || baseSettings.backgroundColor || 'rgba(255, 255, 255, 1)',
                            textRgba: color || baseSettings.color || 'rgba(44, 44, 44, 1)'
                        })
                    },
                    conditions
                };
            });
        },
        async composeCreateReportPivotTotal(fields, { dimensions, metrics, filters }) {
            const {
                props: { baseRowsSettings, tableBorderColor, rowTotalSettings, columnsTotalSettings },
                playerValues,
                playerConditions,
                playerRows,
                playerColumns,
                playerSettings: { columnsTotalPosition, rowTotalPosition, isShownColumnsTotal, isShownRowTotal },
                QuerySortDirection,
                isFlat
            } = this;

            const values = [].concat(playerRows, playerColumns, playerValues);
            const conditions = uniqWith(
                fields.flatMap((field) => {
                    const { format = '', dataAlias = '' } = values.find((value) => value.dataAlias === field) ?? {};
                    const { pattern } = format === '' ? new NumberFormat() : NumberFormat.fromString(format);
                    const { modifiers = NumberFormatPattern.Modifier.FIXED } = pattern;
                    const isPercent = modifiers.includes(NumberFormatPattern.Modifier.PERCENT);

                    return playerConditions
                        .filter(({ isFormattingTotal }) => isFormattingTotal)
                        .flatMap(({ value, operator, dataAlias: conditionDataAlias, cellSettings }) => {
                            const conds = [];
                            if (conditionDataAlias === '' || conditionDataAlias === dataAlias) {
                                conds.push({
                                    condition: ConditionOperatorSymbol[operator],
                                    value: parseFloat(value),
                                    settings: {
                                        type: isPercent ? 'percent' : 'number',
                                        borderStyle: 'THIN',
                                        ...this.mixColors2Pivot({
                                            bgRgba: cellSettings.backgroundColor || 'rgba(255, 255, 255, 1)',
                                            textRgba: cellSettings.color || 'rgba(44, 44, 44, 1)'
                                        })
                                    }
                                });
                            }

                            return conds;
                        });
                }),
                isEqual
            );

            const prepareDimestions = (data) =>
                dimensions.filter((dim) =>
                    data.flatMap(({ sortAlias, dataAlias }) => [sortAlias, dataAlias]).includes(dim)
                );

            const getQuery = (data) => {
                const preparedDimensions = prepareDimestions(data);

                const request = this.buildRequest({
                    metrics,
                    dimensions: isFlat ? [] : preparedDimensions,
                    filters,
                    offset: 0,
                    limit: 0,
                    isFiltersHardClear: true
                });

                if (!isFlat) {
                    values.forEach(({ sortDesc, sortAlias, dataAlias }) => {
                        if (!preparedDimensions.includes(dataAlias)) {
                            return;
                        }
                        request.query.sortAdd({
                            name: sortAlias || dataAlias,
                            direction: sortDesc ? QuerySortDirection.DESC : QuerySortDirection.ASC
                        });
                    });
                }

                const { query: { prepared = {} } = {} } = request ?? {};
                return prepared;
            };
            const rowsQueryPrepared = getQuery(playerRows);
            const columnsQueryPrepared = getQuery(isFlat ? playerColumns.concat(playerRows) : playerColumns);

            const composeTotal = ({ totalSettings, query, position }) => {
                const totalFormat = totalSettings.format || baseRowsSettings.format;
                const { pattern: totalPattern } =
                    totalFormat === '' ? new NumberFormat() : NumberFormat.fromString(totalFormat);
                const { digits: totalDigits = 0 } = totalPattern;

                return {
                    data: { limit: 0, offset: 0, query },
                    settings: {
                        type: 'number',
                        decimals: totalDigits,
                        borderStyle: 'THIN',
                        ...this.mixColors2Pivot({
                            borderRgba: tableBorderColor,
                            bgRgba:
                                totalSettings.backgroundColor ||
                                baseRowsSettings.backgroundColor ||
                                'rgba(255, 255, 255, 1)',
                            textRgba: totalSettings.color || baseRowsSettings.color || 'rgba(44, 44, 44, 1)'
                        })
                    },
                    conditions,
                    position: position === TotalPositions.START ? TotalPositions.END : TotalPositions.START
                };
            };
            return {
                rows: composeTotal({
                    totalSettings: columnsTotalSettings,
                    query: isShownRowTotal && !isFlat ? rowsQueryPrepared : null,
                    // * Cтавим null чтобы скрыть итоги из файла выгрузки
                    // query: null,
                    position: columnsTotalPosition
                }),
                columns: composeTotal({
                    totalSettings: rowTotalSettings,
                    query: isShownColumnsTotal ? columnsQueryPrepared : null,
                    // * Cтавим null чтобы скрыть итоги из файла выгрузки
                    // query: null,
                    position: rowTotalPosition
                })
            };
        },

        async toUnlimitedXlsx() {
            const {
                props: { xlsxFilename, xlsxBlankName, xlsxAddDate },
                playerRows,
                playerColumns,
                playerValues,
                playerSettings,
                QuerySortDirection,
                QueryKey
            } = this;
            this.loaderStart();
            const request = this.buildSlicedRequest({
                limit: 0,
                offset: 0,
                isFlat: true
            });

            [].concat(playerRows, playerColumns).forEach(({ sortDesc, sortAlias, dataAlias }) => {
                request.query.sortAdd({
                    name: sortAlias || dataAlias,
                    direction: sortDesc ? QuerySortDirection.DESC : QuerySortDirection.ASC
                });
            });

            const { query, limit, offset } = request ?? {};
            const playerValuesMetrics = uniqArray(
                playerValues.flatMap(
                    ({ dataAlias, sortAlias, calculatedCell: { dataAlias: calcAlias, isUsed: IsUsedCalc } }) => [
                        dataAlias,
                        sortAlias,
                        ...(IsUsedCalc ? [calcAlias] : [])
                    ]
                )
            ).filter((val) => val !== '');
            const sortMetrics = (metrics) =>
                metrics.sort((a, b) => playerValuesMetrics.indexOf(a) - playerValuesMetrics.indexOf(b));
            const metrics = sortMetrics(this.metrics.filter((metric) => playerValuesMetrics.includes(metric)));
            const fields = this.composeCreateReportPivotFileds([...query.dimensions, ...metrics]);
            const total = await this.composeCreateReportPivotTotal([...query.dimensions, ...metrics], {
                dimensions: query.dimensions,
                metrics,
                filters: query.filters
            });
            const fileName = buildExportFilename([xlsxFilename, ExportFileType.EXCEL], {
                withDate: xlsxAddDate
            });
            const { isError, result, error } = await this.reportApiService.createReportPivot({
                fileName,
                data: {
                    query: {
                        ...query.prepared,
                        [QueryKey.METRICS]: sortMetrics(query.prepared[QueryKey.METRICS])
                    },
                    limit,
                    offset
                },
                fields,
                total,
                metricsPosition: playerSettings.metricsPosition
            });
            if (isError) {
                this.$handleError(error);
                this.loaderEnd();
                return;
            }
            downloadBlobAsFile(result, { filename: fileName });
            this.loaderEnd();
        },
        async toXlsx() {
            const {
                resolveExportCellStyles,
                props: { xlsxFilename, xlsxBlankName, xlsxAddDate }
            } = this;
            this.loaderStart();
            const tableRows = [...this.tableHeadRows, ...this.tableRows].map(({ cells, ...data }, rowIndex) => ({
                ...data,
                cells: cells.map((cell) => ({
                    ...cell,
                    styles: resolveExportCellStyles({ cell, rowIndex })
                }))
            }));
            /** @type {import('@goodt-widgets-insight/api').ReportTableFieldSettings[][]} */
            const fields = tableRows.map((row) =>
                row.cells.map(({ value, level, type: cellType, styles }) => {
                    const borderColor = this.resolveColorWithFromCssVar(this?.props?.tableBorderColor);
                    const bgColor = this.resolveColorWithFromCssVar(styles['--w-background-color'], 'rgb(255,255,255)');
                    const color = this.resolveColorWithFromCssVar(styles['--w-color']);
                    let decimals = 0;
                    /** @type {import('@goodt-widgets-insight/api').CellType} */
                    let type = 'text';
                    if ([CellsTypes.CELL, CellsTypes.TOTAL_CELL, CellsTypes.TOTAL_ROW_CELL].includes(cellType)) {
                        const { format = null } = this.playerValues[level] ?? {};
                        const { pattern } = format === '' ? new NumberFormat() : NumberFormat.fromString(format);
                        const { digits = 0, modifiers = NumberFormatPattern.Modifier.FIXED } = pattern;
                        type = modifiers.includes(NumberFormatPattern.Modifier.PERCENT) ? 'percent' : 'number';
                        decimals = digits;
                    }
                    /** @type {import('@goodt-widgets-insight/api').ReportTableFieldSettings} */
                    const settings = {
                        bgColor,
                        borderColor,
                        borderStyle: 'THIN',
                        color,
                        decimals,
                        type
                    };
                    return { value, settings };
                })
            );
            const fileName = buildExportFilename([xlsxFilename, ExportFileType.EXCEL], {
                withDate: xlsxAddDate
            });
            const { isError, result, error } = await this.reportApiService.createReportTable({ fileName, fields });
            if (isError) {
                this.$handleError(error);
                this.loaderEnd();
                return;
            }
            downloadBlobAsFile(result, { filename: fileName });
            this.loaderEnd();
        },
        /**
         * @param {?string} colorString
         * @param {?string} defaultColor
         * @return {number[]|undefined}
         */
        resolveColorWithFromCssVar(colorString, defaultColor = 'rgb(0,0,0)') {
            const extractRgb = (color) => new Color(color).rgb().array().slice(0, 3);
            const resolveColor = (color) => {
                const regex = /^var\(([^()]+)\)$/;
                const match = color?.match(regex);
                return match != null ? getComputedStyle(this.$el).getPropertyValue(match[1]) : color || defaultColor;
            };

            try {
                return extractRgb(resolveColor(colorString));
            } catch {
                return extractRgb(defaultColor);
            }
        },
        onExportBtnClick(exportFunc) {
            this.toggleExportPopover();
            exportFunc();
        },

        loaderStart() {
            this.isShownLoader = true;
        },
        loaderEnd() {
            this.isShownLoader = false;
        },

        resolveCellValueClasses({ type, hasBeenCollapsed, level, isLoader }) {
            const { playerRows, playerSettings } = this;
            return {
                'scroller-table__value--with-space':
                    type === CellsTypes.ROW &&
                    level !== playerRows.length - 1 &&
                    !hasBeenCollapsed &&
                    playerSettings.isUsedCollapse,
                'scroller-table__value--loader': isLoader
            };
        },
        resolveTableRowIndex(index) {
            const { tableHeadRows } = this;
            return index + tableHeadRows.length;
        },
        resolveCellClasses({ id, rowIndex, index, cell }) {
            const { type } = cell;
            const {
                checkShownRowDropButton,
                checkShownFilterDropButton,
                checkShownValueSort,
                selectedRow,
                selectedColumn
            } = this;
            const isSelected = this.checkSelectedCell({ rowIndex, index });
            return {
                'cursor-pointer':
                    checkShownRowDropButton(cell) ||
                    checkShownFilterDropButton(cell) ||
                    checkShownValueSort(cell) ||
                    type === CellsTypes.ROW_INDEX ||
                    type === CellsTypes.COLUMN_INDEX,
                'scroller-table__cell--bold':
                    checkShownRowDropButton(cell) ||
                    type === CellsTypes.TITLE ||
                    type === CellsTypes.ROW_TITLE ||
                    type === CellsTypes.SUBTOTAL_ROW,
                'scroller-table__cell--cell': type === CellsTypes.CELL || type === CellsTypes.TOTAL_CELL,
                'scroller-table__cell--total-cell':
                    type === CellsTypes.TOTAL_CELL || type === CellsTypes.TOTAL_ROW_CELL,
                'scroller-table__cell--total-column': type === CellsTypes.TOTAL_COLUMN,
                'scroller-table__cell--total-row': type === CellsTypes.TOTAL_ROW,
                'scroller-table__cell--total-value-title': type === CellsTypes.TOTAL_VALUE_TITLE,
                'scroller-table__cell--space': type === CellsTypes.SPACE,
                'scroller-table__cell--column-title': type === CellsTypes.TITLE,
                'scroller-table__cell--title': type === CellsTypes.ROW_TITLE,
                'scroller-table__cell--column':
                    type === CellsTypes.TITLE ||
                    type === CellsTypes.COLUMN ||
                    type === CellsTypes.VALUE_TITLE ||
                    type === CellsTypes.TOTAL_VALUE_TITLE ||
                    type === CellsTypes.TOTAL_COLUMN,
                'scroller-table__cell--value-title': type === CellsTypes.VALUE_TITLE,
                'scroller-table__cell--row':
                    type === CellsTypes.ROW || type === CellsTypes.TOTAL_ROW || type === CellsTypes.SUBTOTAL_ROW,
                'scroller-table__cell--index':
                    type === CellsTypes.COLUMN_INDEX || type === CellsTypes.ROW_INDEX || type === CellsTypes.ZERO_INDEX,
                'scroller-table__cell--col-index': type === CellsTypes.COLUMN_INDEX || type === CellsTypes.ZERO_INDEX,
                'scroller-table__cell--row-index': type === CellsTypes.ROW_INDEX || type === CellsTypes.ZERO_INDEX,
                'scroller-table__cell--first-row': rowIndex === 0,
                'scroller-table__cell--first-cell': index === 0,
                'scroller-table__cell--selected-index':
                    (type === CellsTypes.COLUMN_INDEX && index === selectedColumn) ||
                    (type === CellsTypes.ROW_INDEX && id === selectedRow),
                'scroller-table__cell--selected': index === selectedColumn || id === selectedRow,
                'scroller-table__cell--selected-item-bl':
                    isSelected && !this.checkSelectedCell({ rowIndex, index: index - 1 }),
                'scroller-table__cell--selected-item-bt':
                    isSelected && !this.checkSelectedCell({ rowIndex: rowIndex - 1, index }),
                'scroller-table__cell--selected-item-br':
                    isSelected && !this.checkSelectedCell({ rowIndex, index: index + 1 }),
                'scroller-table__cell--selected-item-bb':
                    isSelected && !this.checkSelectedCell({ rowIndex: rowIndex + 1, index }),
                'scroller-table__cell--selected-item': this.checkSelectedCell({ rowIndex, index })
            };
        },
        resolveCellValueByAggregate({ value, aggregate }) {
            const { shouldShowAggregateNames } = this.props;
            return shouldShowAggregateNames ? `${aggregate}(${value})` : value;
        },
        resolveCellValue({ type, value, level, hasBeenCollapsed }) {
            if (type === CellsTypes.VALUE_TITLE || type === CellsTypes.TOTAL_VALUE_TITLE) {
                const { playerValues } = this;
                const { aggregate, title } = playerValues[level] ?? {};
                const aggregateOption = AggregateMethodsOptions.find(({ value: val }) => val === aggregate);
                if (aggregateOption == null) {
                    return title;
                }
                const { label } = aggregateOption;
                return this.resolveCellValueByAggregate({ value: title, aggregate: label });
            }
            if (type === CellsTypes.CELL || type === CellsTypes.TOTAL_CELL || type === CellsTypes.TOTAL_ROW_CELL) {
                const { playerValues, QueryAggregateFunctionName } = this;
                const { aggregate, format } = playerValues[level] ?? {};
                const { GROUP_CONCAT, GROUP_UCONCAT } = QueryAggregateFunctionName;
                if ([GROUP_CONCAT, GROUP_UCONCAT].includes(aggregate)) {
                    return (value ?? []).map((val) => this.memoFormatNumber(val, format)).join(' ,');
                }
                return this.memoFormatNumber(value, format);
            }
            if (type === CellsTypes.ROW || type === CellsTypes.COLUMN) {
                const {
                    playerRows,
                    playerColumns,
                    playerSettings: { isDuplicateDimensions },
                    isFlat
                } = this;

                if (isFlat) {
                    return value;
                }

                if (
                    !isDuplicateDimensions &&
                    !hasBeenCollapsed &&
                    level < (type === CellsTypes.ROW ? playerRows : playerColumns).length - 1
                ) {
                    return '';
                }
                return value;
            }

            return value;
        },
        resolveRowCssStyles({ size, rowIndex }) {
            const style = this.$genCssVarsStyle(buildRowCssVars({ size }));
            const resizedStyle = this.buildResizedRowStyleByIndexes(rowIndex);

            return { ...style, ...resizedStyle };
        },
        resolveSortButtonSymbolClass({ type, path, level }) {
            const {
                columnSortOptions: { isUsed, sortDesc, path: sortPath, level: sortLevel, isTotal }
            } = this;
            if (type === CellsTypes.TOTAL_VALUE_TITLE) {
                const isCur = isUsed && isTotal && level === sortLevel;
                const isDesc = isCur && sortDesc;
                return {
                    [MdiDropdownClasses.ASC]: !isDesc,
                    [MdiDropdownClasses.DESC]: isDesc,
                    'opacity-60': !isCur
                };
            }
            const isUsedSort = sortPath !== null && sortPath.every((name, index) => name === path[index]);
            const isCur = isUsed && isUsedSort && level === sortLevel;
            const isDesc = isCur && sortDesc;
            return {
                [MdiDropdownClasses.ASC]: !isDesc,
                [MdiDropdownClasses.DESC]: isDesc,
                'opacity-60': !isCur
            };
        },
        resolveDropButtonSymbolClass({ path, type }) {
            const { checkCollapsedRow, checkCollapsedColumn } = this;
            const collapsedRowIndex = checkCollapsedRow({ path, type });
            const collapsedColumnIndex = checkCollapsedColumn({ path, type });

            return {
                [MdiDropdownClasses.DOWN]:
                    type === CellsTypes.ROW_TITLE ||
                    type === CellsTypes.TITLE ||
                    type === CellsTypes.VALUE_TITLE ||
                    type === CellsTypes.SUBTOTAL_ROW ||
                    collapsedRowIndex === -1 ||
                    collapsedColumnIndex === -1,
                [MdiDropdownClasses.TOP]:
                    (collapsedRowIndex !== null && collapsedRowIndex !== -1) ||
                    (collapsedColumnIndex !== null && collapsedColumnIndex !== -1)
            };
        },

        resolveExportCellColor(color) {
            if (color == null) {
                return null;
            }
            const hexColor = convertRgbaToHex(convertCssVarToValue(color));
            // eslint-disable-next-line no-magic-numbers
            return /^#/.test(hexColor) ? hexColor.slice(0, 7) : null;
        },

        resolveExportCellStyles({ cell, rowIndex }) {
            const { resolveCellCssStyle } = this;
            const styles = resolveCellCssStyle({ cell, rowIndex });
            // eslint-disable-next-line no-useless-computed-key
            const { ['--w-font-size']: fontSize, ['--w-color']: color, ...otherStyles } = styles;
            const resultColor = this.resolveExportCellColor(color);
            return {
                ...otherStyles,
                ...(fontSize != null && fontSize !== ''
                    ? // eslint-disable-next-line no-useless-computed-key
                      { ['--w-font-size']: `${convertToAbsoluteValue({ size: fontSize })}px` }
                    : {}),

                // eslint-disable-next-line no-useless-computed-key
                ...(resultColor != null && resultColor !== '' ? { ['--w-color']: resultColor } : {})
            };
        },
        resolveCellCssStyle({ cell, rowIndex, index }) {
            const {
                props: { useZebra },
                zebraCssVars
            } = this;
            const { type } = cell;
            const style = this.getCellCssStyle(cell);
            const condStyle = this.genCellCssVarsStyle(this.getCellCssStyleByCondition(cell));
            const resizeColStyle = this.buildResizedCellStyleByIndexes(index);
            return useZebra && rowIndex != null && isOdd(rowIndex) && type !== CellsTypes.ROW_INDEX
                ? { ...style, ...zebraCssVars, ...condStyle, ...resizeColStyle }
                : { ...style, ...condStyle, ...resizeColStyle };
        },

        getCellCssStyle({ type, level, rowIndex }) {
            const { cellsCssVars, playerRows } = this;
            if (type === CellsTypes.SUBTOTAL_ROW) {
                return cellsCssVars?.[CellsTypes.ROW]?.[level] ?? {};
            }
            if (type === CellsTypes.SPACE) {
                return cellsCssVars?.[type]?.[rowIndex] ?? {};
            }
            if (type === CellsTypes.COLUMN_INDEX && playerRows?.[level] == null) {
                return cellsCssVars?.[type]?.[playerRows.length] ?? {};
            }
            return cellsCssVars?.[type]?.[level] ?? {};
        },
        getCellCssStyleByCondition(cell) {
            const {
                playerConditions,
                checkCellCondition,
                props: { values }
            } = this;
            const activeCond = playerConditions.find((condition, id) =>
                checkCellCondition({ condition: { ...condition, id }, cell })
            );
            const conditionSettings = activeCond?.cellSettings ?? {};
            const result = {
                color: conditionSettings.color ?? '',
                backgroundColor: conditionSettings.backgroundColor ?? ''
            };
            const isMetricCell = [CellsTypes.CELL, CellsTypes.TOTAL_CELL, CellsTypes.TOTAL_ROW_CELL].includes(
                cell?.type
            );
            if (!isMetricCell) {
                return result;
            }
            const metricSettings = values?.[cell.level] ?? {};
            const isHasMetricVerticalAlign = Object.prototype.hasOwnProperty.call(metricSettings, 'verticalAlign');
            const isHasMetricHorizontalAlign = Object.prototype.hasOwnProperty.call(metricSettings, 'horizontalAlign');
            if (
                conditionSettings.verticalAlign != null &&
                conditionSettings.verticalAlign !== '' &&
                (isHasMetricVerticalAlign === false ||
                    metricSettings.verticalAlign == null ||
                    metricSettings.verticalAlign === '')
            ) {
                result.verticalAlign = conditionSettings.verticalAlign;
            }
            if (
                conditionSettings.horizontalAlign != null &&
                conditionSettings.horizontalAlign !== '' &&
                (isHasMetricHorizontalAlign === false ||
                    metricSettings.horizontalAlign == null ||
                    metricSettings.horizontalAlign === '')
            ) {
                result.horizontalAlign = conditionSettings.horizontalAlign;
            }
            return result;
        },

        async shadowUpdate({ fields }) {
            if (
                this.isNeedUpdateFilters ||
                fields.some(({ dataAlias }) => !this.updatedSingleFilters.includes(dataAlias))
            ) {
                await this.updateSingleFilters(fields);
            }
        },

        async setFilterPopoverState({ fields, level, event, cellType = CellsTypes.CELL }, shownSort = true) {
            const { shouldHideFilters } = this.props;

            if (shouldHideFilters === false) {
                await this.shadowUpdate({ fields });
            }

            this.isShownSettingsPopover = !this.isShownSettingsPopover;
            this.settingsPopoverCellType = cellType;
            this.settingsPopoverLevel = level;
            this.settingsPopoverFields = fields;
            this.isShownSettingsPopoverSort = shownSort;
            this.settingsPopoverFilterLevel = this.dimensions.findIndex(
                (dimension) => dimension === fields[level].dataAlias
            );
            this.settingsPopoverEl = event.target.closest('[data-popover-target]');
            this.setFilterPopoverBinds();
        },

        setValuesPopoverState({ level, path }, event) {
            this.isShownValuesPopover = !this.isShownValuesPopover;
            this.valuesPopoverLevel = level;
            this.valuesPopoverPath = path;
            this.settingsPopoverEl = event.target.closest('[data-popover-target]');
        },

        createDefaultTableSettings() {
            const {
                isUsedCollapse,
                isUsedIndexes,
                isShownColumnsTotal,
                columnsTotalPosition,
                isShownRowTotal,
                isDuplicateDimensions,
                shouldBeFixedHeader,
                rowTotalPosition,
                rows,
                columns,
                filters,
                filtersData,
                values,
                subtotal,
                tableDrawType,
                metricsPosition,
                isPagination,
                playerConditions
            } = this.props;
            this.playerCalculatedValues = [];
            this.playerFilters = filtersData
                .map(createCellSettings)
                .filter(({ dataAlias }) => filters?.[dataAlias] ?? true);
            this.playerRows = rows
                .map(createCellSettings)
                .filter(({ dataAlias, isShown }) => isShown && (filters?.[dataAlias] ?? true));
            this.playerColumns = columns
                .map(createCellSettings)
                .filter(({ dataAlias }) => filters?.[dataAlias] ?? true);
            this.playerValues = values.map(createCellSettings).filter(({ isShown }) => isShown);
            this.playerSettings = {
                isUsedCollapse,
                isUsedIndexes,
                isShownColumnsTotal,
                columnsTotalPosition,
                isShownRowTotal,
                isDuplicateDimensions,
                shouldBeFixedHeader,
                rowTotalPosition,
                subtotal,
                tableDrawType,
                metricsPosition,
                isPagination
            };
            this.updateValuesFilters();
            this.updateConditions(playerConditions);
        },

        updateStartedData() {
            if (this._settingsRestored == null) {
                this.createDefaultTableSettings();
            }
            this._settingsRestored = null;
            this.tableMaps = {};
            this.tableRows = [];
            this.memoFormatNumber = createMemoization(formatNumber);
            this.collapsedRows = [];
            this.collapsedColumns = [];
            this.totalDataCache = null;
            this.pendingDefaultTotalsPromise = null;
            this.playerConditionsFilters = this.playerValues.map(() => []);
            this.playerFiltersValues = new Array(this.dimensions.length).fill(null);
            this.isFirstInitTableMaps = false;
            this.columnSortOptions.isUsed = false;
            this.columnSortOptions.path = null;
            this.columnSortOptions.sortDesc = false;
            this.columnSortOptions.level = -1;
            this.columnSortOptions.isTotal = false;
            this.resizedColumnsIndexes = [];
            this.resizedRowsIndexes = [];
        },
        updateWidget() {
            this.isFirstLoad = true;
            this.setPage(1);
        },
        syncPlayerRowsWithPropsRows() {
            const {
                props: { rows, filters },
                playerRows
            } = this;
            const nextRows = rows.filter(({ dataAlias, isShown = true }) => isShown && (filters?.[dataAlias] ?? true));
            if (
                nextRows.length !== playerRows.length ||
                nextRows.some(({ dataAlias }, index) => playerRows[index]?.dataAlias !== dataAlias)
            ) {
                return;
            }
            this.playerRows = playerRows.map((row, index) => merge({}, row, nextRows[index]));
        },
        syncPlayerColumnsWithPropsColumns() {
            const {
                props: { columns, filters },
                playerColumns
            } = this;
            const nextColumns = columns.filter(({ dataAlias }) => filters?.[dataAlias] ?? true);
            if (
                nextColumns.length !== playerColumns.length ||
                nextColumns.some(({ dataAlias }, index) => playerColumns[index]?.dataAlias !== dataAlias)
            ) {
                return;
            }
            this.playerColumns = playerColumns.map((column, index) => merge({}, column, nextColumns[index]));
        },
        syncPlayerValuesWithPropsValues() {
            const {
                props: { values },
                playerValues
            } = this;
            const nextValues = values.filter(({ isShown = true }) => isShown);
            if (
                nextValues.length !== playerValues.length ||
                nextValues.some(({ dataAlias }, index) => playerValues[index]?.dataAlias !== dataAlias)
            ) {
                return;
            }
            this.playerValues = playerValues.map((value, index) => merge({}, value, nextValues[index]));
        },

        getConditionsByAlias(dataAlias) {
            const { playerConditions } = this;
            return playerConditions
                .map((item, id) => ({ ...item, id }))
                .filter(({ dataAlias: condAlias }) => condAlias === '' || condAlias === dataAlias);
        },
        checkCellCondition({
            condition: { dataAlias: condAlias, operator, isFormattingTotal, value: condValue, id },
            cell: { level, type, value }
        }) {
            const { playerValues, playerConditionsFilters } = this;

            if (
                ![
                    CellsTypes.CELL,
                    ...(isFormattingTotal ? [CellsTypes.TOTAL_CELL, CellsTypes.TOTAL_ROW_CELL] : [])
                ]?.includes(type) ||
                !playerConditionsFilters[level]?.includes(id)
            ) {
                return false;
            }
            return condAlias === ''
                ? ConditionFunction[operator](condValue, value)
                : condAlias === playerValues[level].dataAlias && ConditionFunction[operator](condValue, value);
        },
        checkShownValueSort(cell) {
            const {
                columnSortOptions: { path: colSortPath, level: colSortLevel, isUsed: colSortIsUsed }
            } = this;
            const { type, level, path } = cell;
            if (type === CellsTypes.VALUE_TITLE) {
                return path.every((name, i) => name === colSortPath?.[i]) && colSortLevel === level && colSortIsUsed;
            }
            return type === CellsTypes.TOTAL_VALUE_TITLE;
        },
        checkShownFilterDropButton(cell) {
            const { type } = cell;
            return (
                type === CellsTypes.ROW_TITLE ||
                type === CellsTypes.TITLE ||
                type === CellsTypes.VALUE_TITLE ||
                // показывать иконки и меню для заголовков метрик в строчных итогах
                type === CellsTypes.TOTAL_VALUE_TITLE
            );
        },
        checkUsedFilter(dataAlias) {
            const { playerFiltersValues, dimensions, uniqDimensionsFields } = this;
            const originFilters = dimensions.map((dimension) => uniqDimensionsFields?.[dimension]?.length ?? 0);
            const isUsedFilters = originFilters.map(
                (originLength, index) => originLength > (playerFiltersValues?.[index]?.length ?? 0)
            );
            return isUsedFilters?.[this.dimensions.findIndex((dimension) => dimension === dataAlias)] ?? false;
        },
        checkShownTitleFilter({ type, level, isFilters }) {
            const {
                playerRows,
                playerColumns,
                playerFilters,
                playerConditionsFilters,
                valueConditionsFilters,
                valuesFilters
            } = this;
            if (type === CellsTypes.ROW_TITLE || type === CellsTypes.TITLE) {
                return this.checkUsedFilter(
                    (type === CellsTypes.ROW_TITLE ? playerRows : playerColumns)?.[level]?.dataAlias
                );
            }
            if (type === CellsTypes.VALUE_TITLE) {
                return (
                    playerConditionsFilters?.[level]?.length !== valueConditionsFilters?.[level]?.length ||
                    [
                        valuesFilters[level]?.valuesFilterFirst ?? {},
                        valuesFilters[level]?.valuesFilterSecond ?? {}
                    ].some(({ value }) => value !== '')
                );
            }
            if (type === CellsTypes.TOTAL_VALUE_TITLE) {
                // вести себя как VALUE_TITLE: показывать иконку фильтра/меню при активных фильтрах по метрике
                return (
                    playerConditionsFilters?.[level]?.length !== valueConditionsFilters?.[level]?.length ||
                    [
                        valuesFilters[level]?.valuesFilterFirst ?? {},
                        valuesFilters[level]?.valuesFilterSecond ?? {}
                    ].some(({ value }) => value !== '')
                );
            }
            if (isFilters) {
                return this.checkUsedFilter(playerFilters[level].dataAlias);
            }
            return false;
        },
        checkShownRowDropButton(cell) {
            const { type, hasBeenCollapsed, value, isLoader } = cell;
            const {
                playerSettings: { isUsedCollapse }
            } = this;

            return (
                isUsedCollapse &&
                (type === CellsTypes.ROW || type === CellsTypes.COLUMN || CellsTypes.SUBTOTAL_ROW) &&
                hasBeenCollapsed &&
                value !== null &&
                !isLoader
            );
        },
        checkCollapsedRow({ path, type }) {
            const { findCollapsedRowIndexByPath } = this;
            if (type !== CellsTypes.ROW && type !== CellsTypes.SUBTOTAL_ROW) {
                return null;
            }
            return findCollapsedRowIndexByPath(path);
        },
        checkCollapsedColumn({ path, type }) {
            const { findCollapsedColumnIndexByPath } = this;
            if (type !== CellsTypes.COLUMN) {
                return null;
            }
            return findCollapsedColumnIndexByPath(path);
        },

        toggleFullscreen() {
            if (document.fullscreenElement !== null && document.fullscreenElement === this.$el) {
                document.exitFullscreen();
                return;
            }
            this.$el.requestFullscreen();
        },
        toggleFieldsPopup() {
            if (this.isVisibleFieldsPopup) {
                const popup = this.$refs.fieldsPopup;
                if (popup?.hasChanges) {
                    popup.requestCloseWithConfirm();
                    return;
                }
            }
            this.isVisibleFieldsPopup = !this.isVisibleFieldsPopup;
        },
        onFieldsPopupNeedConfirm() {
            this.isVisibleUnsavedFieldsPopup = true;
        },
        onUnsavedFieldsCancel() {
            this.isVisibleUnsavedFieldsPopup = false;
        },
        onUnsavedFieldsConfirm() {
            this.isVisibleUnsavedFieldsPopup = false;
            this.$refs.fieldsPopup?.saveAndCloseFromParent?.();
        },
        onUnsavedFieldsDiscard() {
            this.isVisibleUnsavedFieldsPopup = false;
            this.$refs.fieldsPopup?.discardChangesAndClose?.();
        },
        toggleSettingsPopup() {
            this.isVisibleSettingsPopup = !this.isVisibleSettingsPopup;
        },
        toggleFormatPopup() {
            this.isShownEditPopover = false;
            this.isVisibleFormatPopup = !this.isVisibleFormatPopup;
        },
        toggleConditionPopup() {
            this.isShownEditPopover = false;
            this.isVisibleConditionsPopup = !this.isVisibleConditionsPopup;
        },
        toggleEditPopover(event) {
            this.editPopoverEl = event.target.closest('[data-popover-target]');
            this.isShownEditPopover = true;
        },
        toggleExportPopover() {
            this.isShownExportPopover = !this.isShownExportPopover;
        },

        findCollapsedRowIndexByPath(path) {
            const { collapsedRows } = this;
            return collapsedRows.findIndex((item) =>
                item.every((name, level) => path?.[level] != null && name === path[level])
            );
        },
        findCollapsedColumnIndexByPath(path) {
            const { collapsedColumns } = this;
            return collapsedColumns.findIndex((item) =>
                item.every((name, level) => path?.[level] != null && name === path[level])
            );
        },

        onSearchInput(event) {
            const {
                target: { value }
            } = event;
            const { fastSearchTimeoutId, tableMaps: { rowsPaths = [], columnsPaths = [] } = {} } = this;
            if (fastSearchTimeoutId != null) {
                clearTimeout(fastSearchTimeoutId);
            }
            this.fastSearchTimeoutId = setTimeout(() => {
                this.filteredRowsPaths = filterPaths(value, rowsPaths);
                this.filteredColumnsPaths = filterPaths(value, columnsPaths);
                this.generateTableRows();
            }, FAST_SEARCH_DELAY);
        },
        onFilterPopoverCollapse() {
            const { settingsPopoverLevel: level, settingsPopoverCellType: cellType } = this;
            /** @type {{ collapsedRows:string[][] }} */
            const { collapsedRows, collapsedColumns } = this;
            const pathSeen = {};
            const targetLevel = level + 1;
            const isRowMode = cellType === CellsTypes.ROW_TITLE;
            const entities = isRowMode ? collapsedRows : collapsedColumns;
            const pathsToCollapse = entities
                .filter((path) => path.length > targetLevel)
                .map((path) => path.slice(0, targetLevel))
                .filter((path) => {
                    const key = path.join('.');
                    if (pathSeen[key]) {
                        return false;
                    }
                    pathSeen[key] = true;
                    return true;
                });

            pathsToCollapse
                .reduce(
                    (acc, path) =>
                        acc.then(() =>
                            this.toggleCollapse(
                                {
                                    path,
                                    type: isRowMode ? CellsTypes.ROW : CellsTypes.COLUMN,
                                    hasBeenCollapsed: true,
                                    level: targetLevel
                                },
                                false
                            )
                        ),
                    Promise.resolve()
                )
                .then(() => {
                    this.generateTableRows();
                });
            this.isShownSettingsPopover = false;
        },
        onFilterPopoverSave({ isSortDesc, usedFilters, isSort }) {
            const { settingsPopoverFields, settingsPopoverLevel, settingsPopoverFilterLevel } = this;
            if (settingsPopoverFields[settingsPopoverLevel].sortDesc !== isSortDesc) {
                this.columnSortOptions.isUsed = false;
                this.columnSortOptions.path = null;
                this.columnSortOptions.sortDesc = false;
                this.columnSortOptions.level = -1;
                this.columnSortOptions.isTotal = false;
            }
            settingsPopoverFields[settingsPopoverLevel].sortDesc = isSortDesc;

            if (this.isFlat && isSort) {
                this.flatSortField = settingsPopoverFields[settingsPopoverLevel];
                this.columnSortOptions.isUsed = false;
            }
            this.playerFiltersValues[settingsPopoverFilterLevel] = usedFilters;
            this.setPage(1);
        },
        onFormatPopupSave(valuesSettings) {
            this.playerValues = valuesSettings;
            this.updateValuesFilters();
            this.commitTableSettingsToStore();
            this.generateTableRows();
        },
        onSettingsPopupSave({
            isUsedCollapse,
            isUsedIndexes,
            isShownColumnsTotal,
            columnsTotalPosition,
            isDuplicateDimensions,
            shouldBeFixedHeader,
            isShownRowTotal,
            rowTotalPosition,
            subtotal,
            tableDrawType,
            metricsPosition,
            isPagination
        }) {
            const previousTableDrawType = this.playerSettings?.tableDrawType;
            const previousIsPagination = this.playerSettings?.isPagination;
            this.playerSettings = {
                isUsedCollapse,
                isUsedIndexes,
                isShownColumnsTotal,
                columnsTotalPosition,
                isDuplicateDimensions,
                shouldBeFixedHeader,
                isShownRowTotal,
                rowTotalPosition,
                subtotal,
                tableDrawType,
                metricsPosition,
                isPagination
            };
            this.commitTableSettingsToStore();
            if (this.playerSettings.isPagination) {
                const isTableDrawTypeChanged = previousTableDrawType !== tableDrawType;
                const isPaginationEnabled = previousIsPagination !== true && isPagination === true;
                if (isTableDrawTypeChanged || isPaginationEnabled) {
                    this.setPage(1);
                    return;
                }
                this.loadSlicedData();
                return;
            }
            this.buildData();
        },
        setSelectedPopoverState({ rowIndex, event }) {
            const { rowIndex: pRowIndex, index: pIndex } = this.selectedPopoverTargetCell;
            this.selectedPopoverTarget = (pRowIndex !== rowIndex ? this.selectedPopoverTarget : event.target)
                .closest('[data-popover-table]')
                .querySelector(`[data-popover-target="${this.buildCellKey(pRowIndex, pIndex)}"]`);
        },
        async onCopySelected(event) {
            const { selectedCells, tableHeadRows, tableRows } = this;
            if ((event.ctrlKey !== true && event.metaKey !== true) || event.keyCode !== KEY_CODE_C) {
                return;
            }
            event.preventDefault();
            const clearedSelectedCells = selectedCells.filter(([_, indexes]) => indexes.length > 0);
            if (clearedSelectedCells.length === 0) {
                return;
            }
            const rowsIndexes = clearedSelectedCells.map(([rowIndex]) => rowIndex);
            const startRow = Math.min(...rowsIndexes);
            const endRow = Math.max(...rowsIndexes);
            const [startCol, endCol] = clearedSelectedCells.reduce(
                ([start, end], [_, indexes]) => [Math.min(start, ...indexes), Math.max(end, ...indexes)],
                [Infinity, -Infinity]
            );
            const rows = Object.fromEntries(clearedSelectedCells);
            let copyStr = '';
            const tableHeadRowsLength = tableHeadRows.length;
            for (let rowIndex = startRow; rowIndex <= endRow; rowIndex++) {
                if (rowIndex > startRow) {
                    copyStr += '\n';
                }
                const row = rows?.[rowIndex] ?? [];
                for (let colIndex = startCol; colIndex <= endCol; colIndex++) {
                    if (colIndex > startCol) {
                        copyStr += '\t';
                    }
                    if (row.includes(colIndex)) {
                        copyStr += this.resolveCellValue(
                            (tableHeadRows?.[rowIndex] ?? tableRows[rowIndex - tableHeadRowsLength]).cells[colIndex]
                        );
                    }
                }
            }
            await navigator.clipboard.writeText(copyStr);
        },
        onCellMouseDown({ index, rowIndex }, event) {
            if (this.isResizing) {
                return;
            }
            const {
                selectedCells,
                props: { canCommitMultiVars, canCommitVars }
            } = this;
            if (!canCommitVars) {
                return;
            }
            if (event.ctrlKey && canCommitMultiVars) {
                const fieldIndex = selectedCells.findIndex(([sRowIndex]) => rowIndex === sRowIndex);
                if (fieldIndex === -1) {
                    selectedCells.push([rowIndex, [index]]);
                    this.setSelectedPopoverState({ rowIndex, event });
                    return;
                }
                const [_, sIndexes] = selectedCells[fieldIndex];
                const sIndexPosition = sIndexes.findIndex((sIndex) => sIndex === index);
                if (sIndexPosition === -1) {
                    sIndexes.push(index);
                    this.setSelectedPopoverState({ rowIndex, event });
                    return;
                }
                sIndexes.splice(sIndexPosition, 1);
                this.setSelectedPopoverState({ rowIndex, event });
                return;
            }
            this.buildRange = createRangeBuilder([index, rowIndex]);
            this.selectedCells = this.buildRange([index, rowIndex]);
            if (canCommitMultiVars) {
                this.setSelectedPopoverState({ rowIndex, event });
                document.addEventListener('mouseup', this.onCellValueMouseUp);
            }
        },
        onCellValueMouseUp() {
            if (this.isResizing) {
                return;
            }
            document.removeEventListener('mouseup', this.onCellValueMouseUp);
            this.buildRange = null;
        },
        onCellMouseOver({ index, rowIndex }, event) {
            if (this.buildRange == null || !this.props.canCommitMultiVars || this.isResizing) {
                return;
            }
            this.selectedCells = this.buildRange([index, rowIndex]);
            this.setSelectedPopoverState({ rowIndex, event });
        },
        onCellCollapseClick(cell) {
            const {
                props: { canCommitVars }
            } = this;
            if (!canCommitVars) {
                return;
            }
            this.toggleCollapse(cell);
        },
        onCellClick(cell, event) {
            if (this.isResizing) {
                return;
            }
            const { type, value, level, id, isLoader } = cell;

            if (isLoader) {
                return;
            }
            const {
                playerRows,
                playerColumns,
                playerSettings: { tableDrawType },
                props: { canCommitVars }
            } = this;
            if (type === CellsTypes.COLUMN_INDEX) {
                this.selectedRow = null;
                this.selectedColumn = this.selectedColumn === value ? null : value;
                return;
            }

            if (type === CellsTypes.ROW_INDEX) {
                this.selectedColumn = null;
                this.selectedRow = this.selectedRow === id ? null : id;
                return;
            }

            if (type === CellsTypes.ROW_TITLE || type === CellsTypes.TITLE) {
                const isRowLevel = playerRows[level] != null;
                const targetLevel =
                    tableDrawType === TableDrawTypes.TABLE
                        ? level
                        : !isRowLevel && level >= playerRows.length
                        ? level - playerRows.length
                        : level;
                this.setFilterPopoverState({
                    cellType: type,
                    fields: type === CellsTypes.ROW_TITLE && isRowLevel ? playerRows : playerColumns,
                    level: targetLevel,
                    event
                });
                return;
            }
            if (type === CellsTypes.VALUE_TITLE) {
                this.setValuesPopoverState(cell, event);
                return;
            }

            if (type === CellsTypes.TOTAL_VALUE_TITLE) {
                const {
                    columnSortOptions: { isUsed, sortDesc: isSortDesc, level: sortLevel, isTotal }
                } = this;
                const isDesc = isUsed && isTotal && level === sortLevel && !isSortDesc;

                this.columnSortOptions.isUsed = true;
                this.columnSortOptions.sortDesc = isDesc;
                this.columnSortOptions.path = null;
                this.columnSortOptions.level = level;
                this.columnSortOptions.isTotal = true;
                this.generateTableRows();
                return;
            }
            if (
                (type === CellsTypes.ROW || type === CellsTypes.SUBTOTAL_ROW || type === CellsTypes.COLUMN) &&
                canCommitVars
            ) {
                return;
            }
            this.toggleCollapse(cell);
        },
        async onCellDblClick(cell) {
            const { isLoader } = cell;
            if (!isLoader) {
                return;
            }
            await this.loadAdditionalRows(cell);
            this.generateTableRows();
        },
        async loadAdditionalRows({ path, level, isLoader = false }) {
            this.loaderStart();
            const {
                tableMaps,
                request: { limit }
            } = this;
            const { dataAlias: filterAlias } = this.playerRows[path.length];
            const slicedPath = path.slice(0, level + 1);
            let rowsNode = tableMaps.rowsHeap;
            slicedPath.forEach((name) => {
                rowsNode = rowsNode[name];
            });
            const { offset } = rowsNode;
            if (offset != null && !isLoader) {
                const pathString = path.join('.');
                const hasChildren = this.collapsedRows.some(
                    (row) => row.length > path.length && row.slice(0, path.length).join('.') === pathString
                );

                if (hasChildren) {
                    this.collapsedRows = this.collapsedRows.filter(
                        (row) => !row.join('.').startsWith(pathString) || row.length === path.length
                    );
                    if (!this.collapsedRows.some((row) => row.join('.') === pathString)) {
                        this.collapsedRows.push([...path]);
                    }
                } else {
                    this.collapsedRows = this.collapsedRows.filter((row) => row.join('.') !== pathString);

                    const children = tableMaps.rowsPaths.filter(
                        (val) => val.join('.').startsWith(pathString) && val.length > path.length
                    );

                    const existingPaths = new Set(this.collapsedRows.map((row) => row.join('.')));
                    children.forEach((child) => {
                        const childPath = child.join('.');
                        if (!existingPaths.has(childPath)) {
                            this.collapsedRows.push(child);
                        }
                    });
                }
                return;
            }
            const { rows: uniqueRows, rowCount } = await this.fetchRows({
                path: slicedPath,
                offset: offset ?? 0,
                buildMap: false
            });
            const { rows, map } = await this.fetchRows({
                path: slicedPath,
                offset: offset ?? 0,
                limit: 0,
                dataFilters: uniqueRows.map((row) => row[filterAlias]),
                filterAlias,
                fetchAllData: true
            });
            // патчим существующие данные, правильно или нет не понятно, но так надо, в будущем надо будет переработать на частичные запросы
            tableMaps.rowsHeap = map.rowsHeap;
            tableMaps.columnsHeap = map.columnsHeap;

            rowsNode = tableMaps.rowsHeap;
            slicedPath.forEach((name) => {
                rowsNode = rowsNode[name];
            });

            this.result.rows = [...this.result.rows, ...rows];
            if (offset == null && !this.isShownRowsSubtotals) {
                tableMaps.rowsPaths.splice(
                    tableMaps.rowsPaths.findIndex((mapsPath) =>
                        mapsPath.every((mapsPathName, mapsPathLevel) => mapsPathName === slicedPath[mapsPathLevel])
                    ),
                    1
                );
            }
            tableMaps.rowsPaths = tableMaps.rowsPaths.concat(map.rowsPaths);
            this.collapsedRows = this.collapsedRows.concat(map.rowsPaths);
            rowsNode.offset = (offset ?? 0) + limit;
            // eslint-disable-next-line no-restricted-syntax
            const loaderPath = [...slicedPath, LOADER_COLUMN_KEY];
            if (offset == null) {
                tableMaps.rowsPaths.push(loaderPath);
            }
            if (rowCount - rowsNode.offset <= 0) {
                const index = tableMaps.rowsPaths.findIndex((rowPath) => isEqual(rowPath, loaderPath));
                if (index > -1) {
                    tableMaps.rowsPaths.splice(index, 1);
                }
            }

            if (this.props.isDatasetTotalAggregation) {
                const { rows: totalsRows, map: totalsMap } = await this.fetchTotalsForPath(slicedPath, level);
                const pathKey = slicedPath.join('.');
                this.tableMaps = {
                    ...this.tableMaps,
                    scopedRowTotals: {
                        ...(this.tableMaps.scopedRowTotals ?? {}),
                        [pathKey]: { rowTotalData: totalsRows, rowsTotalHeap: totalsMap?.rowsHeap }
                    },
                    scopedColumnTotals: {
                        ...(this.tableMaps.scopedColumnTotals ?? {}),
                        [pathKey]: { columnTotalData: totalsRows, columnsTotalHeap: totalsMap?.columnsHeap }
                    }
                };
            }
            this.loaderEnd();
        },

        async toggleCollapse(cell, needDraw = true) {
            const { path, type, level, hasBeenCollapsed } = cell;
            const { collapsedRows, collapsedColumns, playerSettings } = this;
            if (
                (type === CellsTypes.ROW || type === CellsTypes.SUBTOTAL_ROW) &&
                hasBeenCollapsed &&
                playerSettings?.isUsedCollapse
            ) {
                const findRow = this.findCollapsedRowIndexByPath(path);
                if (findRow === -1) {
                    const exclude = collapsedRows.filter((row) => row.join('.').startsWith(path.join('.')));
                    this.collapsedRows = this.collapsedRows.filter((v) => !exclude.includes(v));
                    this.collapsedRows.push(path);
                    needDraw && (await this.generateTableRows());
                    return;
                }
                collapsedRows.splice(findRow, 1);

                if (this.isPagType) {
                    await this.loadAdditionalRows(cell);
                }
                needDraw && (await this.generateTableRows());
                return;
            }
            if (type === CellsTypes.COLUMN && hasBeenCollapsed && playerSettings?.isUsedCollapse) {
                const findColumn = this.findCollapsedColumnIndexByPath(path);
                const pathString = path.join('.');
                const pathLength = path.length;

                const shouldExpand = !this.collapsedColumns.some(
                    (column) => column.length > pathLength && column.slice(0, pathLength).join('.') === pathString
                );

                if (shouldExpand) {
                    if (findColumn !== -1) {
                        collapsedColumns.splice(findColumn, 1);
                    }

                    const children = [];
                    const seen = new Set();

                    for (const val of this.tableMaps.columnsPaths) {
                        if (
                            val.length === pathLength + 1 &&
                            JSON.stringify(val.slice(0, pathLength)) === JSON.stringify(path)
                        ) {
                            const childKey = val.join('.');
                            if (!seen.has(childKey)) {
                                seen.add(childKey);
                                children.push(val);
                            }
                        }
                    }

                    this.collapsedColumns.push(...children);
                } else {
                    this.collapsedColumns = this.collapsedColumns.filter(
                        (column) =>
                            !(column.length > pathLength && column.slice(0, pathLength).join('.') === pathString)
                    );
                    if (findColumn === -1) {
                        this.collapsedColumns.push(path);
                    }
                }

                needDraw && (await this.generateTableRows());
            }
        },
        onFieldsPopupSave({ rows, columns, values, filters, calculatedValues }) {
            this.playerRows = rows;
            this.playerColumns = columns;
            this.playerValues = values;
            this.playerFilters = filters;
            this.playerCalculatedValues = calculatedValues;
            this.updateConditionsFilters();
            this.updateValuesFilters();
            this.commitTableSettingsToStore();
            this.setPage(1);
        },
        async onFilterValuesSave({
            usedFilters,
            isSortDesc,
            isSort,
            valuesFilterFirst,
            valuesFilterSecond,
            valuesFilterOperator
        }) {
            this.loaderStart();
            const { valuesPopoverLevel, isFlat } = this;
            this.$set(this.playerConditionsFilters, valuesPopoverLevel, usedFilters);
            this.valuesFilters[valuesPopoverLevel].valuesFilterFirst = createSimpleCondition(valuesFilterFirst);
            this.valuesFilters[valuesPopoverLevel].valuesFilterSecond = createSimpleCondition(valuesFilterSecond);
            this.valuesFilters[valuesPopoverLevel].valuesFilterOperator = valuesFilterOperator;
            this.valuesFilters[valuesPopoverLevel].path = this.valuesPopoverPath;
            if (isSort) {
                this.columnSortOptions.isUsed = isSort;
                this.columnSortOptions.sortDesc = isSortDesc;
                this.columnSortOptions.path = this.valuesPopoverPath;
                this.columnSortOptions.level = this.valuesPopoverLevel;
                this.columnSortOptions.isTotal = false;
                this.flatSortField = this.playerValues[valuesPopoverLevel];
            }
            if (isFlat && isSort) {
                await this.loadSlicedData();
            }
            await this.buildData();
            this.loaderEnd();
        },
        genCellCssVarsStyle(settings) {
            return this.$genCssVarsStyle(clearObjectVoidValues(buildCellCssVars(settings)));
        },

        updateConditionsFilters() {
            this.playerConditionsFilters = this.playerValues.map((_, i) =>
                this.valueConditionsFilters[i].map(({ id }) => id)
            );
        },
        updateValuesFilters() {
            this.valuesFilters = this.playerValues.map(() => ({
                valuesFilterFirst: createSimpleCondition(),
                valuesFilterSecond: createSimpleCondition(),
                valuesFilterOperator: ValueFilterLogicOperator.AND
            }));
        },
        buildCellKey(rowIndex, index) {
            return `${rowIndex}-${index}`;
        },
        onConditionsPopupSave(conditions) {
            this.playerConditions = conditions.map(createCondition);
            this.updateConditionsFilters();
            this.commitTableSettingsToStore();
            if (this.isPagType) {
                return;
            }
            this.buildData();
        },
        updateConditions(conditions) {
            this.playerConditions = conditions;
            this.updateConditionsFilters();
        },
        /**
         * @override
         * @param {RequestType} requestType
         */
        cancelRequests(requestType) {
            this.$requestCancel(this.requestsMap[requestType]);
            this.requestsMap[requestType] = null;
        },

        /**
         * @override
         * @param {Error} error
         * @throws {import('@goodt-common/net').HttpTransportRequestCancel}
         */
        $handleError(error) {
            this.super().$handleError.call(this, error);
            if (error.isCancel) {
                throw error;
            }
        },

        commitTableSettingsToStore() {
            const {
                playerRows,
                playerColumns,
                playerValues,
                playerFilters,
                playerSettings,
                playerConditions,
                playerCalculatedValues
            } = this;
            const [rows, columns, filters] = [playerRows, playerColumns, playerFilters].map((fields) =>
                fields.map(({ dataAlias, title, sortAlias, width }) => ({ dataAlias, title, sortAlias, width }))
            );
            const [values, calculatedValues] = [playerValues, playerCalculatedValues].map((fields) =>
                fields.map(({ dataAlias, title, aggregate, format, expression, isCalculated }) => ({
                    dataAlias,
                    title,
                    aggregate,
                    format,
                    expression,
                    isCalculated
                }))
            );
            const conditions = playerConditions.map(
                ({ dataAlias, operator, value, isFormattingTotal, cellSettings }) => ({
                    dataAlias,
                    operator,
                    value,
                    isFormattingTotal,
                    cellSettings: {
                        color: cellSettings.color,
                        backgroundColor: cellSettings.backgroundColor
                    }
                })
            );
            /** @type {TableSettings} */
            const settings = {
                rows,
                columns,
                filters,
                values,
                calculatedValues,
                conditions,
                settings: playerSettings
            };

            this.$storeCommit({ [Vars.SETTINGS]: JSON.stringify(settings) });
        },

        /**
         * @param {TableSettings|null} tableSettings
         */
        restoreTableSettings(tableSettings) {
            if (tableSettings == null) {
                this.createDefaultTableSettings();
                this.setPage();
                return;
            }
            let parsedSettings = null;
            try {
                parsedSettings = JSON.parse(tableSettings);
            } catch (e) {
                return;
            }
            const { rows, columns, filters, values, calculatedValues, settings, conditions } = parsedSettings;
            const {
                playerRows,
                playerColumns,
                playerValues,
                playerFilters,
                playerSettings,
                playerConditions,
                playerCalculatedValues
            } = this;
            const previousState = cloneDeep({
                rows: playerRows,
                columns: playerColumns,
                filters: playerFilters,
                values: playerValues,
                calculatedValues: playerCalculatedValues,
                settings: playerSettings,
                conditions: playerConditions
            });

            [this.playerRows, this.playerColumns, this.playerFilters, this.playerValues, this.playerCalculatedValues] =
                Object.entries({ rows, columns, filters, values, calculatedValues }).map(([name, fields]) =>
                    fields.reduce((acc, field) => {
                        const foundField = previousState[name].find(({ dataAlias }) => dataAlias === field.dataAlias);
                        return [...acc, foundField == null ? createCellSettings(field) : merge({}, foundField, field)];
                    }, [])
                );
            this.playerConditions = conditions.reduce((acc, condition) => {
                const foundCondition = this.playerConditions.find(({ dataAlias }) => dataAlias === condition.dataAlias);
                return [
                    ...acc,
                    foundCondition == null ? createCondition(condition) : merge({}, foundCondition, condition)
                ];
            }, []);
            this.playerSettings = settings;

            const newState = {
                rows: this.playerRows,
                columns: this.playerColumns,
                filters: this.playerFilters,
                values: this.playerValues,
                calculatedValues: this.playerCalculatedValues,
                conditions: this.playerConditions,
                settings: this.playerSettings
            };

            if (isEqual(previousState, newState) === false) {
                this.updateValuesFilters();
                this.updateConditionsFilters();
                this._settingsRestored = true;
                this.needLoad = true;
                this.setPage();
            }
        },

        ...ElemInstanceTypeDescriptor,
        ...ElemDatasetMixinTypes,
        ...ApiMixinsTypeDescriptor
    },
    implicitCssModule: true
};
</script>

<style src="./styles/styles.pcss" lang="pcss" module></style>
