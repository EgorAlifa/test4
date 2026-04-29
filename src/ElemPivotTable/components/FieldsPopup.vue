<template>
    <ui-popup :visible="isVisible" v-bind="PopupSettings" @update:visible="onPopupVisibleUpdate">
        <template #body>
            <div class="settings-popup-body settings-popup-body--bordered">
                <div class="settings-popup-title">
                    <template v-if="calculatedMetric.isShown">Расчет значения</template>
                    <template v-else>Поля</template>
                </div>
                <div class="settings-popup-caption">
                    <template v-if="calculatedMetric.isShown">Перетащите поле в форму</template>
                    <template v-else>Перетащите поле в нужную область</template>
                </div>
            </div>
            <div class="settings-popup-body settings-popup-body--bordered">
                <div class="pos-rel">
                    <div class="settings-popup-grid settings-popup-grid--3-cols">
                        <div class="settings-popup-grid__main drag-container drag-container--main">
                            <div class="drag-container__elem drag-item drag-item--title">ВСЕ ПОЛЯ</div>
                            <div class="drag-container__drag-list-wrapper">
                                <div v-if="shouldShowFieldActionsContainer" class="drag-container__actions">
                                    <div
                                        v-if="$widget.props.shouldShowFieldSearch"
                                        class="drag-container__search-wrapper">
                                        <i class="mdi mdi-magnify"></i>
                                        <input
                                            type="text"
                                            class="drag-container__search"
                                            placeholder="Поиск"
                                            v-model="searchFieldValue" />

                                        <button
                                            v-if="searchFieldValue !== ''"
                                            class="btn btn-icon btn-small"
                                            @click="onFieldsSearchClear">
                                            <i class="mdi mdi-close"></i>
                                        </button>
                                    </div>
                                    <div v-if="$widget.props.shouldShowFieldActions" class="drag-container__buttons">
                                        <button
                                            class="drag-container__buttons--button"
                                            @click="onToggleAllMetricsDimensionsClick(true)">
                                            Выбрать все
                                        </button>
                                        <button
                                            class="drag-container__buttons--button"
                                            @click="onToggleAllMetricsDimensionsClick(false)">
                                            Сбросить все
                                        </button>
                                    </div>
                                </div>
                                <ui-draggable
                                    :list="searchedDraggableDimensions"
                                    v-bind="AllFieldsPopupDimensionsDraggableOptions">
                                    <div
                                        v-for="(
                                            { dataAlias, title, badgeBackgroundColor }, i
                                        ) in searchedDraggableDimensions"
                                        :key="i"
                                        class="drag-item"
                                        :data-alias="dataAlias">
                                        <div class="drag-item__label" :title="title">
                                            <input
                                                class="drag-item__checkbox"
                                                type="checkbox"
                                                v-model="dimensionsOptions[dataAlias]" />
                                            <span
                                                class="drag-item__title badge text-xsmall"
                                                :style="{ backgroundColor: badgeBackgroundColor }">
                                                {{ title }}
                                            </span>
                                        </div>
                                        <span class="drag-item__icon mdi mdi-drag drag-handle"></span>
                                    </div>
                                </ui-draggable>
                                <ui-draggable
                                    :list="searchedDraggableMetrics"
                                    v-bind="AllFieldsPopupMetricsDraggableOptions">
                                    <div
                                        v-for="(
                                            { dataAlias, title, aggregate, badgeBackgroundColor }, i
                                        ) in searchedDraggableMetrics"
                                        :key="i"
                                        class="drag-item">
                                        <div class="drag-item__label" :title="buildValueName({ title, aggregate })">
                                            <input
                                                class="drag-item__checkbox"
                                                type="checkbox"
                                                v-model="metricsOptions[dataAlias]" />
                                            <span
                                                class="drag-item__title badge text-xsmall"
                                                :style="{ backgroundColor: badgeBackgroundColor }">
                                                {{ buildValueName({ title, aggregate }) }}
                                            </span>
                                        </div>
                                        <span class="drag-item__icon mdi mdi-sigma"></span>
                                        <span class="drag-item__icon mdi mdi-drag drag-handle"></span>
                                    </div>
                                </ui-draggable>
                                <ui-draggable
                                    :list="searchedDraggableCalculatedValues"
                                    v-bind="AllFieldsPopupMetricsDraggableOptions">
                                    <div
                                        v-for="(dragValue, i) in searchedDraggableCalculatedValues"
                                        :key="i"
                                        class="drag-item">
                                        <div class="drag-item__label" :title="buildValueName(dragValue)">
                                            <input
                                                class="drag-item__checkbox"
                                                type="checkbox"
                                                v-model="calculatedValuesOptions[dragValue.dataAlias]" />
                                            <span class="drag-item__title">
                                                {{ buildValueName(dragValue) }}
                                            </span>
                                        </div>
                                        <span class="drag-item__icon mdi mdi-sigma"></span>
                                        <span class="drag-item__icon mdi mdi-drag drag-handle"></span>
                                    </div>
                                </ui-draggable>
                            </div>
                        </div>
                        <div v-if="!isFiltersHidden" class="drag-container">
                            <div class="drag-container__elem drag-item drag-item--title">Фильтры</div>
                            <div class="drag-container__caption">Перетащите сюда</div>
                            <ui-draggable
                                class="drag-container__drag-list"
                                :list="selectedData.filters"
                                v-bind="filtersDraggableOptions">
                                <div
                                    v-for="({ title, dataAlias, badgeBackgroundColor }, i) in selectedData.filters"
                                    :key="i"
                                    class="drag-item">
                                    <div
                                        class="drag-item__label badge text-xsmall"
                                        :title="title"
                                        :style="{ backgroundColor: badgeBackgroundColor }">
                                        <ui-changeable-title :title="title" v-model="selectedData.filters[i].title" />
                                    </div>
                                    <span
                                        class="drag-item__icon mdi mdi-close"
                                        @click="removeSelectedItem('filters', dataAlias)"></span>
                                    <span class="drag-item__icon mdi mdi-drag drag-handle"></span>
                                </div>
                            </ui-draggable>
                        </div>
                        <div class="drag-container">
                            <div class="drag-container__elem drag-item drag-item--title">Столбцы</div>
                            <div class="drag-container__caption">Перетащите сюда</div>
                            <ui-draggable
                                class="drag-container__drag-list"
                                :list="selectedData.columns"
                                v-bind="fieldsDraggableOptions">
                                <div
                                    v-for="({ title, dataAlias, badgeBackgroundColor }, i) in selectedData.columns"
                                    :key="i"
                                    class="drag-item"
                                    :data-alias="dataAlias">
                                    <div
                                        class="drag-item__label badge text-xsmall"
                                        :title="title"
                                        :style="{ backgroundColor: badgeBackgroundColor }">
                                        <ui-changeable-title :title="title" v-model="selectedData.columns[i].title" />
                                    </div>
                                    <span
                                        class="drag-item__icon mdi mdi-close"
                                        @click="removeSelectedItem('columns', dataAlias)"></span>
                                    <span class="drag-item__icon mdi mdi-drag drag-handle"></span>
                                </div>
                            </ui-draggable>
                        </div>

                        <div class="drag-container">
                            <div class="drag-container__elem drag-item drag-item--title">Строки</div>
                            <div class="drag-container__caption">Перетащите сюда</div>
                            <ui-draggable
                                class="drag-container__drag-list"
                                :list="selectedData.rows"
                                v-bind="fieldsDraggableOptions">
                                <div
                                    v-for="({ title, dataAlias, badgeBackgroundColor }, i) in selectedData.rows"
                                    :key="i"
                                    class="drag-item"
                                    :data-alias="dataAlias">
                                    <div
                                        class="drag-item__label badge text-xsmall"
                                        :title="title"
                                        :style="{ backgroundColor: badgeBackgroundColor }">
                                        <ui-changeable-title :title="title" v-model="selectedData.rows[i].title" />
                                    </div>
                                    <span
                                        class="drag-item__icon mdi mdi-close"
                                        @click="removeSelectedItem('rows', dataAlias)"></span>
                                    <span class="drag-item__icon mdi mdi-drag drag-handle"></span>
                                </div>
                            </ui-draggable>
                        </div>

                        <div class="drag-container">
                            <div class="drag-container__elem drag-item drag-item--title">Метрики</div>
                            <div class="drag-container__caption">Перетащите сюда</div>
                            <ui-draggable
                                class="drag-container__drag-list"
                                :list="selectedData.values"
                                v-bind="FieldsPopupValuesDraggableOptions">
                                <div
                                    v-for="(
                                        { title, aggregate, isCalculated, dataAlias, badgeBackgroundColor }, i
                                    ) in selectedData.values"
                                    :key="i"
                                    class="drag-item">
                                    <div
                                        class="drag-item__label badge text-xsmall"
                                        :title="buildValueName({ title, aggregate, isCalculated, dataAlias })"
                                        :style="{ backgroundColor: badgeBackgroundColor }">
                                        <ui-changeable-title
                                            :title="buildValueName({ title, aggregate, isCalculated, dataAlias })"
                                            v-model="selectedData.values[i].title" />
                                    </div>
                                    <span class="drag-item__icon mdi mdi-sigma"></span>
                                    <span
                                        class="drag-item__icon mdi mdi-menu-down"
                                        v-if="!isCalculated"
                                        @click="onOpenValueSelectClick($event, i)"></span>
                                    <span
                                        class="drag-item__icon mdi mdi-close"
                                        @click="removeSelectedItem('values', dataAlias, isCalculated)"></span>
                                    <span class="drag-item__icon mdi mdi-drag drag-handle"></span>
                                </div>
                            </ui-draggable>
                        </div>
                    </div>
                    <div class="calculated-container" v-if="calculatedMetric.isShown">
                        <div class="settings-popup-grid settings-popup-grid--3-cols calculated-container__body">
                            <div class="calculated-container__shadow" @click="hideCalculatedMetric"></div>
                            <div class="settings-popup-grid__main calculated-col">
                                <input
                                    type="text"
                                    class="calculated-col__input"
                                    placeholder="Название поля"
                                    v-model="calculatedMetric.title" />
                                <div class="calculated-col__items">
                                    <div
                                        v-for="({ dataAlias, title, aggregate }, i) in searchedDraggableMetrics"
                                        :key="i"
                                        class="drag-item"
                                        :class="{
                                            'drag-item--border-top': i === 0
                                        }"
                                        :draggable="checkMetricDraggable(dataAlias)"
                                        @dragend="onMetricDragEnd">
                                        <div class="drag-item__label" :title="buildValueName({ title, aggregate })">
                                            {{ buildValueName({ title, aggregate }) }}
                                        </div>
                                        <span class="drag-item__icon mdi mdi -sigma" />
                                        <span
                                            class="drag-item__icon mdi mdi-drag"
                                            @mousedown="onMetricDragStart(dataAlias, aggregate)" />
                                    </div>
                                </div>
                                <div class="calculated-col__textarea">
                                    <div class="calculated-tools">
                                        <div
                                            class="calculated-tools__item"
                                            v-for="{ label, value } in CalculatedMetricsOperatorsOptions"
                                            :key="label">
                                            <div class="calc-button" @click="appendTextareaData(value)">
                                                {{ label }}
                                            </div>
                                        </div>
                                        <div
                                            class="calculated-tools__item"
                                            v-for="{ label, value } in CalculatedMetricsAggregateOptions"
                                            :key="label">
                                            <div
                                                class="calc-button calc-button--small"
                                                @click="appendTextareaData(value)">
                                                {{ label }}
                                            </div>
                                        </div>
                                    </div>
                                    <textarea
                                        class="calculated-textarea"
                                        :class="textareaClasses"
                                        placeholder="Перетащите поля и формулы сюда"
                                        @dragover="onDragOver"
                                        ref="textarea"
                                        @drop="onDragEnd"
                                        @input="onFormulaChange"></textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ui-popover v-bind="aggregatePopoverBinds" :show.sync="aggregatePopover.isVisible">
                <ui-datalist v-bind="aggregateDatalistBinds" @select-option="onDatalistClick">
                    <template #option="{ option, index, cursorIndex }">
                        <li :class="resolveDatalistItemClass({ index, cursorIndex })" @click="onDatalistClick(option)">
                            <div class="text-truncate">
                                {{ resolveOptionLabel(option) }}
                            </div>
                        </li>
                    </template>
                </ui-datalist>
            </ui-popover>
        </template>
        <template #footer>
            <div class="settings-popup-body">
                <div class="d-flex">
                    <div class="add-metric-btn" @click="showCalculatedMetric" :disabled="calculatedMetric.isShown">
                        <div class="add-metric-btn__icon"><i class="mdi mdi-calculator-variant"></i></div>
                        <div class="label">Добавить расчетное значение</div>
                    </div>
                    <div
                        class="btn btn-primary mar-left-auto mar-right-4"
                        @click="onSave">
                        Сохранить
                    </div>
                    <div class="btn btn-outline" @click="onClose">Отменить</div>
                </div>
            </div>
        </template>
    </ui-popup>
</template>

<script>
import { Datalist, Popover } from 'goodteditor-ui';
import { Popup as UiPopup } from '@goodt-wcore/components';

import draggable from 'vuedraggable';
import { cloneDeep, isEqual } from 'lodash';
import ChangeableTitle from './ChangeableTitle.vue';
import {
    createCalculatedMetricsSettings,
    createCellSettings,
    FieldsPopupDraggableGroupNames,
    PopupSettings
} from '../utils/constants';
import {
    AggregateMethodsOptions,
    AllFieldsPopupDimensionsDraggableOptions,
    AllFieldsPopupMetricsDraggableOptions,
    FieldsPopupDraggableOptions,
    FieldsPopupValuesDraggableOptions,
    CalculatedMetricsAggregateOptions,
    CalculatedMetricsOperatorsOptions,
    AggregateMethodFunction
} from '../utils/config';
import { buildArgsAliases, calculate, buildExpression, findArrayMax } from '../utils/utils';

export default {
    name: 'FieldsPopup',
    components: {
        UiPopup,
        UiDraggable: draggable,
        UiChangeableTitle: ChangeableTitle,
        UiPopover: Popover,
        UiDatalist: Datalist
    },
    inject: ['$widget'],
    static: {
        AllFieldsPopupDimensionsDraggableOptions,
        AllFieldsPopupMetricsDraggableOptions,
        FieldsPopupValuesDraggableOptions,
        AggregateMethodsOptions,
        PopupSettings,
        CalculatedMetricsAggregateOptions,
        CalculatedMetricsOperatorsOptions
    },
    props: {
        visible: {
            type: Boolean,
            default: false
        },
        dimensions: {
            type: Object,
            default: () => ({})
        },
        metrics: {
            type: Object,
            default: () => ({})
        },
        rows: {
            type: Array,
            default: () => []
        },
        columns: {
            type: Array,
            default: () => []
        },
        values: {
            type: Array,
            default: () => []
        },
        selectedRows: {
            type: Array,
            default: () => []
        },
        selectedColumns: {
            type: Array,
            default: () => []
        },
        selectedFilters: {
            type: Array,
            default: () => []
        },
        selectedValues: {
            type: Array,
            default: () => []
        },
        calculatedValues: {
            type: Array,
            default: () => []
        },
        isFiltersHidden: {
            type: Boolean,
            default: false
        }
    },

    data: (vm) => ({
        isVisible: vm.visible,

        dimensionsOptions: {},
        draggableDimensions: [],
        searchedDraggableDimensions: [],

        metricsOptions: {},
        draggableMetrics: [],
        searchedDraggableMetrics: [],

        calculatedValuesOptions: {},
        draggableCalculatedValues: [],
        searchedDraggableCalculatedValues: [],

        searchFieldValue: '',
        selectedData: {
            rows: [],
            columns: [],
            filters: [],
            values: []
        },
        aggregatePopover: {
            isVisible: false,
            el: null,
            level: 0
        },
        calculatedMetric: createCalculatedMetricsSettings(),

        initialState: null
    }),
    computed: {
        shouldShowFieldActionsContainer() {
            const {
                calculatedMetric: { isShown },
                $widget: {
                    props: { shouldShowFieldSearch, shouldShowFieldActions }
                }
            } = this;
            return !isShown && (shouldShowFieldSearch || shouldShowFieldActions);
        },
        aggregatePopoverBinds() {
            return {
                appendToBody: false,
                autoWidth: false,
                target: this.aggregatePopover.el
            };
        },
        aggregateDatalistBinds() {
            return {
                options: AggregateMethodsOptions
            };
        },
        filtersDraggableOptions() {
            return {
                ...FieldsPopupDraggableOptions,
                group: {
                    name: FieldsPopupDraggableGroupNames.FILTERS,
                    // eslint-disable-next-line no-restricted-syntax
                    pull: [FieldsPopupDraggableGroupNames.FIELDS],
                    put: this.onFieldsPut
                }
            };
        },
        fieldsDraggableOptions() {
            return {
                ...FieldsPopupDraggableOptions,
                group: {
                    name: FieldsPopupDraggableGroupNames.FIELDS,
                    // eslint-disable-next-line no-restricted-syntax
                    pull: [FieldsPopupDraggableGroupNames.FILTERS, FieldsPopupDraggableGroupNames.FIELDS],
                    put: this.onFieldsPut
                }
            };
        },
        textareaClasses() {
            return {
                invalid: this.isErrorCalculatedMetric
            };
        },
        isErrorCalculatedMetric() {
            const aliases = buildArgsAliases(Object.keys(this.metrics));
            const expression = buildExpression(this.calculatedMetric.expression, aliases);

            return (
                calculate(expression, {
                    ...Object.values(aliases).reduce((acc, name) => ({ ...acc, [name]: 1 }), {}),
                    ...AggregateMethodFunction
                }) === null
            );
        },
        hasChanges() {
            if (this.initialState == null) {
                return false;
            }
            return isEqual(this.initialState, this.buildStateSnapshot()) === false;
        },
        isButtonSaveDisabled() {
            return !this.hasChanges;
        }
    },
    watch: {
        visible(isNextVisible) {
            this.setVisibility(isNextVisible);
        },
        dimensionsOptions: {
            deep: true,
            handler() {
                const { selectedData, dimensionsOptions, rows: baseRows, columns: baseColumns } = this;
                const { filters, rows, columns } = selectedData;
                const dimensionFields = [...filters, ...rows, ...columns];
                Object.keys(dimensionsOptions).forEach((aliasKey) => {
                    if (
                        dimensionsOptions[aliasKey] === false ||
                        dimensionsOptions[aliasKey] == null ||
                        dimensionFields.some(({ dataAlias }) => dataAlias === aliasKey)
                    ) {
                        return;
                    }
                    rows.push(
                        createCellSettings(
                            baseRows.find(({ dataAlias }) => dataAlias === aliasKey) ??
                                baseColumns.find(({ dataAlias }) => dataAlias === aliasKey) ?? {
                                    dataAlias: aliasKey,
                                    title: aliasKey
                                }
                        )
                    );
                });

                selectedData.filters = filters
                    .filter(({ dataAlias }) => dimensionsOptions[dataAlias])
                    .map(this.composeDimensionsMetricsColorMapper);
                selectedData.rows = rows
                    .filter(({ dataAlias }) => dimensionsOptions[dataAlias])
                    .map(this.composeDimensionsMetricsColorMapper);
                selectedData.columns = columns
                    .filter(({ dataAlias }) => dimensionsOptions[dataAlias])
                    .map(this.composeDimensionsMetricsColorMapper);
            }
        },
        metricsOptions: {
            deep: true,
            handler() {
                const { selectedData, metricsOptions, values: baseValues } = this;
                const { values } = selectedData;
                Object.keys(metricsOptions).forEach((aliasKey) => {
                    if (
                        metricsOptions[aliasKey] === false ||
                        metricsOptions[aliasKey] == null ||
                        values.some(({ dataAlias }) => dataAlias === aliasKey)
                    ) {
                        return;
                    }
                    values.push(
                        baseValues.find(({ dataAlias }) => dataAlias === aliasKey) ??
                            createCellSettings(
                                baseValues.find(({ dataAlias }) => dataAlias === aliasKey) ?? {
                                    dataAlias: aliasKey,
                                    title: aliasKey
                                }
                            )
                    );
                });
                selectedData.values = values
                    .filter(({ dataAlias, isCalculated }) => isCalculated || metricsOptions[dataAlias])
                    .map(this.composeDimensionsMetricsColorMapper);
            }
        },
        calculatedValuesOptions: {
            deep: true,
            handler() {
                const { selectedData, calculatedValuesOptions, draggableCalculatedValues: baseValues } = this;
                const { values } = selectedData;
                Object.entries(calculatedValuesOptions).forEach(([aliasKey = null, isUsed = false]) => {
                    if (!isUsed || values.some(({ dataAlias }) => dataAlias === aliasKey)) {
                        return;
                    }
                    values.push(
                        createCellSettings(
                            baseValues.find(({ dataAlias }) => dataAlias === Number(aliasKey)) ??
                                baseValues.find(({ dataAlias }) => dataAlias === aliasKey) ?? {
                                    dataAlias: aliasKey,
                                    title: aliasKey
                                }
                        )
                    );
                });

                selectedData.values = values
                    .filter(
                        ({ dataAlias, isCalculated }) => !isCalculated || calculatedValuesOptions[dataAlias] === true
                    )
                    .map(this.composeDimensionsMetricsColorMapper);
            }
        },
        'selectedData.values': {
            handler() {
                this.updateSelectedDataValues();
            }
        },
        'selectedData.rows': {
            handler() {
                this.updateSelectedDataFields();
            }
        },
        'selectedData.columns': {
            handler() {
                this.updateSelectedDataFields();
            }
        },
        'selectedData.filters': {
            handler() {
                this.updateSelectedDataFields();
            }
        },
        searchFieldValue: {
            handler(value) {
                const { draggableDimensions, draggableMetrics, draggableCalculatedValues } = this;
                const realValue = value.toLowerCase();
                const filterMapper = (titleAdapter) => (item) =>
                    realValue != null &&
                    (titleAdapter ? titleAdapter(item) : item.title).toLowerCase().includes(realValue);
                this.searchedDraggableDimensions = draggableDimensions.filter(filterMapper());
                this.searchedDraggableMetrics = draggableMetrics.filter(
                    filterMapper(({ title, aggregate }) => this.buildValueName({ title, aggregate }))
                );
                this.searchedDraggableCalculatedValues = draggableCalculatedValues.filter(
                    filterMapper((dragValue) => this.buildValueName(dragValue))
                );
            }
        }
    },
    created() {
        this.updateData();
        if (this.visible) {
            this.captureInitialState();
        }
    },
    methods: {
        setVisibility(isNextVisible, { isForce = false } = {}) {
            if (!isForce && isNextVisible === false && this.hasChanges) {
                this.$emit('update:visible', true);
                this.$emit('need-confirm-close');
                return;
            }

            if (!isForce && isNextVisible === this.isVisible) {
                return;
            }

            this.isVisible = isNextVisible;
            this.$emit('update:visible', isNextVisible);
            this.searchFieldValue = '';

            if (isNextVisible) {
                this.updateData();
                this.$nextTick(() => this.captureInitialState());
                return;
            }

            this.calculatedMetric = createCalculatedMetricsSettings();
        },
        onPopupVisibleUpdate(isNextVisible) {
            this.setVisibility(isNextVisible);
        },
        captureInitialState() {
            this.initialState = this.buildStateSnapshot();
        },
        buildStateSnapshot() {
            return {
                selectedData: cloneDeep(this.selectedData),
                calculatedValues: cloneDeep(this.draggableCalculatedValues),
                calculatedMetric: cloneDeep(this.calculatedMetric)
            };
        },
        forceCloseWithoutSave() {
            this.setVisibility(false, { isForce: true });
        },
        requestCloseWithConfirm() {
            if (this.hasChanges) {
                this.$emit('need-confirm-close');
                return;
            }
            this.forceCloseWithoutSave();
        },
        onFieldsSearchClear() {
            this.searchFieldValue = '';
        },
        onToggleAllMetricsDimensionsClick(checked) {
            const {
                dimensionsOptions,
                metricsOptions,
                searchedDraggableDimensions,
                searchedDraggableMetrics,
                searchedDraggableCalculatedValues
            } = this;

            searchedDraggableDimensions.forEach((dimension) => {
                dimensionsOptions[dimension.dataAlias] = checked;
            });
            searchedDraggableMetrics.forEach((metric) => {
                metricsOptions[metric.dataAlias] = checked;
            });
            searchedDraggableCalculatedValues.forEach((dragValue) => {
                this.calculatedValuesOptions[dragValue.dataAlias] = checked;
            });
        },
        composeDimensionsMetricsColorMapper(item) {
            const { metrics, dimensions } = this;
            const { dataAlias } = item;
            let badgeBackgroundColor = '';

            if (Object.keys(dimensions).includes(dataAlias)) {
                badgeBackgroundColor = 'var(--color-orange-focus)';
            } else if (Object.keys(metrics).includes(dataAlias)) {
                badgeBackgroundColor = 'var(--color-primary-focus)';
            }

            return { ...item, badgeBackgroundColor };
        },
        showCalculatedMetric() {
            this.calculatedMetric.isShown = true;
        },
        hideCalculatedMetric() {
            this.calculatedMetric = createCalculatedMetricsSettings();
        },
        onFormulaChange(event) {
            this.calculatedMetric.expression = event.target.value;
        },
        onMetricDragEnd() {
            this.calculatedMetric.dragMetric = -1;
            this.calculatedMetric.dragValue = null;
        },
        onDragOver(event) {
            if (this.calculatedMetric.dragValue == null) {
                return;
            }
            event.preventDefault();
            event.target.focus();
        },
        onDragEnd() {
            const {
                calculatedMetric: { dragValue }
            } = this;
            if (dragValue == null) {
                return;
            }
            this.appendTextareaData(dragValue);
        },
        appendTextareaData(value) {
            const { textarea } = this.$refs;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const oldVal = textarea.value;
            const newVal = `${oldVal.slice(0, start)}${value}${oldVal.slice(end)}`;
            const position = end + newVal.length - oldVal.length;
            textarea.value = newVal;
            textarea.selectionStart = position;
            textarea.selectionEnd = position;
            this.calculatedMetric.expression = newVal;
        },
        checkMetricDraggable(metric) {
            return this.calculatedMetric.dragMetric === metric;
        },
        onMetricDragStart(metric, aggregate) {
            this.calculatedMetric.dragMetric = metric;
            this.setDragValue(`${aggregate}(${metric})`);
        },
        setDragValue(value) {
            this.calculatedMetric.dragValue = value;
        },
        createOptions(options, fields) {
            return Object.keys(options).reduce(
                (acc, key) => ({
                    ...acc,
                    [key]: fields.some(({ dataAlias }) => dataAlias === key)
                }),
                {}
            );
        },
        createDraggableOptions(dataAliases, fields) {
            return Object.keys(dataAliases)
                .filter((key) => dataAliases[key])
                .map((key) => {
                    const baseField = fields.find(({ dataAlias }) => dataAlias === key) ?? {};
                    const { isCalculated = false, title = '' } = baseField;
                    return createCellSettings({
                        ...baseField,
                        dataAlias: key,
                        title: isCalculated ? title : key
                    });
                })
                .map(this.composeDimensionsMetricsColorMapper);
        },
        resolveOptionLabel(option) {
            return option?.label ?? option;
        },
        buildValueName({ aggregate = null, title = '', isCalculated = false, dataAlias = '' } = {}) {
            if (isCalculated) {
                return `#${dataAlias}(${title})`;
            }

            const aggregateOption = AggregateMethodsOptions.find(({ value }) => value === aggregate);
            if (aggregateOption == null) {
                return title;
            }
            const { label } = aggregateOption;
            return `${label} (${title})`;
        },
        resolveDatalistItemClass({ index, cursorIndex }) {
            return { active: index === cursorIndex };
        },
        updateData() {
            const {
                selectedRows: rows,
                selectedColumns: columns,
                selectedFilters: filters,
                selectedValues: values
            } = this;
            this.selectedData = {
                filters: filters.map(createCellSettings),
                columns: columns.map(createCellSettings),
                rows: rows.map(createCellSettings),
                values: values.map(createCellSettings)
            };
            this.calculatedMetric = createCalculatedMetricsSettings();
            this.updateOptions();
        },
        updateMetricsOptions() {
            const {
                createDraggableOptions,
                values,
                selectedData: { values: selectedValues },
                createOptions,
                metrics
            } = this;

            this.metricsOptions = createOptions(metrics, selectedValues);
            this.draggableMetrics = createDraggableOptions(metrics, values);
            this.searchedDraggableMetrics = this.draggableMetrics;
        },
        updateDimensionOptions() {
            const {
                rows,
                columns,
                selectedData: { rows: selectedRows, columns: selectedColumns, filters: selectedFilters },
                dimensions
            } = this;
            const dimensionFields = [...rows, ...columns];
            const selectedFields = [...selectedRows, ...selectedColumns, ...selectedFilters];
            this.dimensionsOptions = this.createOptions(dimensions, selectedFields);
            this.draggableDimensions = this.createDraggableOptions(dimensions, dimensionFields);
            this.searchedDraggableDimensions = this.draggableDimensions;
        },
        updateOptions() {
            this.updateCalculatedOptions();
            this.updateMetricsOptions();
            this.updateDimensionOptions();
        },
        updateCalculatedOptions() {
            const {
                calculatedValues,
                selectedData: { values: selectedValues }
            } = this;
            const calculatedValuesAliases = calculatedValues.reduce(
                (acc, { dataAlias }) => ({ ...acc, [dataAlias]: true }),
                {}
            );
            this.calculatedValuesOptions = this.createOptions(
                calculatedValuesAliases,
                selectedValues.filter(({ isCalculated }) => isCalculated)
            );
            this.draggableCalculatedValues = this.createDraggableOptions(calculatedValuesAliases, calculatedValues);
            this.searchedDraggableCalculatedValues = this.draggableCalculatedValues;
        },
        updateSelectedDataFields() {
            const {
                dimensionsOptions,
                selectedData: { columns, rows, filters }
            } = this;
            const dimensionFields = [...columns, ...rows, ...filters];
            Object.keys(dimensionsOptions).forEach((aliasKey) => {
                const isContainsKey = dimensionFields.some(({ dataAlias }) => dataAlias === aliasKey);
                const isExistAlias = dimensionsOptions[aliasKey] === true && dimensionsOptions[aliasKey] != null;
                if ((isContainsKey && isExistAlias) || (!isContainsKey && !isExistAlias)) {
                    return;
                }
                this.dimensionsOptions[aliasKey] = isContainsKey;
            });
        },
        updateSelectedDataValues() {
            const {
                metricsOptions,
                calculatedValuesOptions,
                selectedData: { values }
            } = this;
            Object.keys(metricsOptions).forEach((aliasKey) => {
                const isContainsKey = values.some(({ dataAlias }) => dataAlias === aliasKey);
                const isExistAlias = metricsOptions[aliasKey] === true && metricsOptions[aliasKey] != null;
                if ((!isContainsKey && !isExistAlias) || (!isContainsKey && !isExistAlias)) {
                    return;
                }
                this.metricsOptions[aliasKey] = isContainsKey;
            });
            Object.keys(calculatedValuesOptions).forEach((aliasKey) => {
                const isContainsKey = values.some(({ dataAlias }) => dataAlias === aliasKey);
                const isExistAlias =
                    calculatedValuesOptions[aliasKey] === true && calculatedValuesOptions[aliasKey] != null;
                if ((!isContainsKey && !isExistAlias) || (!isContainsKey && !isExistAlias)) {
                    return;
                }
                this.calculatedValuesOptions[aliasKey] = isContainsKey;
            });
        },

        removeSelectedItem(zone, dataAlias, isCalculated = false) {
            if (zone === 'values') {
                if (isCalculated) {
                    this.$set(this.calculatedValuesOptions, dataAlias, false);
                } else {
                    this.$set(this.metricsOptions, dataAlias, false);
                }
            } else {
                this.$set(this.dimensionsOptions, dataAlias, false);
            }
        },

        onDatalistClick(option) {
            this.selectedData.values[this.aggregatePopover.level].aggregate = option?.value ?? option;
            this.aggregatePopover.isVisible = false;
        },
        onOpenValueSelectClick(event, level) {
            const { target } = event;
            this.aggregatePopover.el = target;
            this.aggregatePopover.level = level;
            this.aggregatePopover.isVisible = true;
        },
        onFieldsPut(elTo, elFrom, el) {
            const {
                selectedData: { rows, columns, filters }
            } = this;
            const {
                options: {
                    group: { name: fromGroupName }
                }
            } = elFrom;
            if (
                ![
                    FieldsPopupDraggableGroupNames.FIELDS,
                    FieldsPopupDraggableGroupNames.FILTERS,
                    FieldsPopupDraggableGroupNames.DIMENSIONS
                ].includes(fromGroupName)
            ) {
                return false;
            }
            const {
                dataset: { alias }
            } = el;
            if (FieldsPopupDraggableGroupNames.DIMENSIONS === fromGroupName) {
                return [...rows, ...columns, ...filters].every(({ dataAlias }) => dataAlias !== alias);
            }
            return true;
        },
        appendCalculatedMetric() {
            const {
                draggableCalculatedValues,
                calculatedValuesOptions,
                calculatedMetric: { expression, title },
                selectedData: { values }
            } = this;
            const id =
                draggableCalculatedValues.length === 0
                    ? 0
                    : findArrayMax(draggableCalculatedValues.map(({ dataAlias }) => Number(dataAlias))) + 1;
            draggableCalculatedValues.push(
                createCellSettings({
                    expression,
                    title,
                    isCalculated: true,
                    dataAlias: `${id}`,
                    aggregate: null
                })
            );
            this.$set(calculatedValuesOptions, `${id}`, true);
        },

        onSave({ isCloseAfterCalculatedMetric = false } = {}) {
            if (this.calculatedMetric.isShown) {
                if (this.isErrorCalculatedMetric) {
                    this.$refs.textarea.focus();
                    return;
                }
                this.appendCalculatedMetric();
                this.hideCalculatedMetric();
                if (!isCloseAfterCalculatedMetric) {
                    return;
                }
            }
            this.$emit('saved', {
                ...this.selectedData,
                calculatedValues: this.draggableCalculatedValues
            });
            this.initialState = this.buildStateSnapshot();
            this.setVisibility(false, { isForce: true });
        },
        saveAndCloseFromParent() {
            this.onSave({ isCloseAfterCalculatedMetric: true });
        },
        discardChangesAndClose() {
            if (this.initialState != null) {
                const { selectedData, calculatedValues, calculatedMetric } = this.initialState;
                this.selectedData = cloneDeep(selectedData);
                this.draggableCalculatedValues = cloneDeep(calculatedValues);
                this.searchedDraggableCalculatedValues = this.draggableCalculatedValues;
                this.calculatedMetric = cloneDeep(calculatedMetric);
                this.updateOptions();
                this.initialState = this.buildStateSnapshot();
            }
            this.setVisibility(false, { isForce: true });
        },
        onClose() {
            this.setVisibility(false);
        }
    },
    implicitCssModule: true
};
</script>

<style src="./styles/settingsPopup.pcss" lang="pcss" module></style>
