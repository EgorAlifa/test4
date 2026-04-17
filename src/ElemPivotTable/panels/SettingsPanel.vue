<template>
    <ui-panel-container>
        <ui-container>
            <ui-input-auto prop="reportApplicationApiUrl">Api выгрузки</ui-input-auto>
            <ui-select prop="tableDrawType" :options="TableDrawOptions" />
            <ui-select prop="metricsPosition" :options="MetricsPositionOptions" />
            <ui-switch prop="isPagination" />
            <ui-switch prop="canCommitVars" />
            <ui-switch prop="canCommitMultiVars" :disabled="!props.canCommitVars" />
            <ui-switch prop="isUsedCollapse" :disabled="isFlatType" />
            <ui-switch prop="isUncollapsedAll" :disabled="isFlatType || !props.isUsedCollapse" />
            <ui-switch prop="useFastSearch" />
            <ui-switch prop="isDuplicateDimensions" :disabled="isFlatType" />
            <ui-switch prop="canDropFiltersAfterStoreChange" />
            <ui-switch prop="shouldFilterFiltersOnStoreChange" />
            <ui-switch prop="isHiddenFiltrationEnabled" />
            <ui-switch prop="shouldBeFixedHeader" />
            <ui-switch prop="shouldShowFieldSearch" />
            <ui-switch prop="shouldShowFieldActions" />
            <ui-switch prop="shouldShowAggregateNames" />
            <ui-switch prop="isDatasetTotalAggregation" />
            <ui-switch prop="shouldHideFilters" />
            <ui-has-panel>
                <ui-checkbox prop="isUsedIndexes" />
                <template #panel>
                    <ui-panel :groups="[{ name: 'Настройки нумерации', slot: 'default' }]">
                        <ui-container>
                            <ui-input-cp prop="baseIndexesSettings.backgroundColor">Цвет фона</ui-input-cp>
                            <ui-complex-font v-bind="complexFontBinds" v-model="indexesFontStyles"></ui-complex-font>
                        </ui-container>
                    </ui-panel>
                </template>
            </ui-has-panel>
            <ui-has-panel>
                <ui-checkbox prop="useZebra" />
                <template #panel>
                    <ui-panel :groups="[{ name: 'Режим Зебра', slot: 'default' }]">
                        <ui-container>
                            <ui-input-cp prop="zebraSettings.color">Цвет шрифта</ui-input-cp>
                            <ui-input-cp prop="zebraSettings.backgroundColor">Цвет фона</ui-input-cp>
                        </ui-container>
                    </ui-panel>
                </template>
            </ui-has-panel>
            <ui-has-panel>
                <ui-label label-size="small">Общий итог</ui-label>
                <template #panel>
                    <ui-panel
                        :groups="[
                            { name: 'По строкам', slot: 'columns' },
                            ...(isFlatType ? [] : [{ name: 'По столбцам', slot: 'rows' }])
                        ]">
                        <template #columns>
                            <ui-container>
                                <ui-switch prop="isShownColumnsTotal">Отображать</ui-switch>
                                <ui-select prop="columnsTotalPosition" :options="TotalPositionOptions">
                                    Расположение
                                </ui-select>
                                <ui-input-cp prop="rowTotalSettings.backgroundColor">Цвет фона</ui-input-cp>
                                <ui-has-panel>
                                    <ui-label label-size="small">Шрифт</ui-label>
                                    <template #panel>
                                        <ui-panel :groups="[{ name: 'Настройки шрифта', slot: 'default' }]">
                                            <ui-complex-font
                                                v-bind="complexFontBinds"
                                                v-model="rowTotalSettingsFontStyles"></ui-complex-font>
                                        </ui-panel>
                                    </template>
                                </ui-has-panel>
                                <ui-has-panel>
                                    <ui-label label-size="small">Настройки заголовка</ui-label>
                                    <template #panel>
                                        <ui-panel :groups="[{ name: 'Настройки заголовка', slot: 'default' }]">
                                            <div>
                                                <ui-label label-size="small">Выравнивание</ui-label>
                                                <ui-has-two-columns>
                                                    <template #left>
                                                        <ui-label label-size="small">По горизонтали</ui-label>
                                                        <ui-radio-buttons
                                                            prop="rowTotalSettings.titleSettings.verticalAlign"
                                                            v-bind="verticalBinds" />
                                                    </template>
                                                    <template #right>
                                                        <ui-label label-size="small">По вертикали</ui-label>
                                                        <ui-radio-buttons
                                                            prop="rowTotalSettings.titleSettings.horizontalAlign"
                                                            v-bind="horizontalBinds" />
                                                    </template>
                                                </ui-has-two-columns>
                                            </div>
                                        </ui-panel>
                                    </template>
                                </ui-has-panel>
                            </ui-container>
                        </template>
                        <template #rows>
                            <ui-container>
                                <ui-switch prop="isShownRowTotal">Отображать</ui-switch>
                                <ui-select prop="rowTotalPosition" :options="VerticalTotalPositionOptions">
                                    Расположение
                                </ui-select>
                                <ui-input-cp prop="columnsTotalSettings.backgroundColor">Цвет фона</ui-input-cp>
                                <ui-has-panel>
                                    <ui-label label-size="small">Шрифт</ui-label>
                                    <template #panel>
                                        <ui-panel :groups="[{ name: 'Настройки шрифта', slot: 'default' }]">
                                            <ui-complex-font
                                                v-bind="complexFontBinds"
                                                v-model="columnsTotalSettingsFontStyles"></ui-complex-font>
                                        </ui-panel>
                                    </template>
                                </ui-has-panel>
                                <ui-has-panel>
                                    <ui-label label-size="small">Настройки заголовка</ui-label>
                                    <template #panel>
                                        <ui-panel :groups="[{ name: 'Настройки заголовка', slot: 'default' }]">
                                            <div>
                                                <ui-label label-size="small">Выравнивание</ui-label>
                                                <ui-has-two-columns>
                                                    <template #left>
                                                        <ui-label label-size="small">По горизонтали</ui-label>
                                                        <ui-radio-buttons
                                                            prop="columnsTotalSettings.titleSettings.verticalAlign"
                                                            v-bind="verticalBinds" />
                                                    </template>
                                                    <template #right>
                                                        <ui-label label-size="small">По вертикали</ui-label>
                                                        <ui-radio-buttons
                                                            prop="columnsTotalSettings.titleSettings.horizontalAlign"
                                                            v-bind="horizontalBinds" />
                                                    </template>
                                                </ui-has-two-columns>
                                            </div>
                                        </ui-panel>
                                    </template>
                                </ui-has-panel>
                            </ui-container>
                        </template>
                    </ui-panel>
                </template>
            </ui-has-panel>
            <ui-has-panel>
                <ui-label label-size="small">Панель кнопок</ui-label>
                <template #panel>
                    <ui-panel
                        :groups="[
                            { name: 'По умолчанию', slot: 'base' },
                            { name: 'При наведении', slot: 'hover' }
                        ]">
                        <template #base>
                            <ui-container>
                                <ui-input-cp prop="toolboxButtonBackground">Фон кнопки</ui-input-cp>
                                <ui-input-cp prop="toolboxButtonFontColor">Цвет шрифта</ui-input-cp>
                                <ui-input-cp prop="toolboxButtonIconColor">Цвет иконки</ui-input-cp>
                            </ui-container>
                        </template>
                        <template #hover>
                            <ui-container>
                                <ui-input-cp prop="toolboxButtonBackgroundHover">Фон кнопки</ui-input-cp>
                                <ui-input-cp prop="toolboxButtonFontColorHover">Цвет шрифта</ui-input-cp>
                                <ui-input-cp prop="toolboxButtonIconColorHover">Цвет иконки</ui-input-cp>
                            </ui-container>
                        </template>
                    </ui-panel>
                </template>
            </ui-has-panel>
            <ui-has-panel>
                <ui-label label-size="small">Границы</ui-label>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Настройки границ', slot: 'default' }]">
                        <ui-container>
                            <ui-input-cp prop="tableBorderColor">Цвет</ui-input-cp>
                            <ui-input-units :units="SizeUnits" prop="tableBorderWeight">Толщина</ui-input-units>
                        </ui-container>
                    </ui-panel>
                </template>
            </ui-has-panel>
            <ui-has-panel>
                <ui-label label-size="small">Промежуточные итоги</ui-label>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Промежуточные итоги', slot: 'default' }]">
                        <ui-container>
                            <ui-select prop="subtotal.type" :options="SubtotalTypeOptions" :disabled="isFlatType">
                                Отображение
                            </ui-select>
                            <ui-select
                                prop="subtotal.rowPosition"
                                :disabled="isDisabledSubtotalRowPosition"
                                :options="SubtotalRowsPositionOptions">
                                Позиция строк
                            </ui-select>
                        </ui-container>
                    </ui-panel>
                </template>
            </ui-has-panel>
            <ui-has-panel>
                <ui-label label-size="small">Выгрузка</ui-label>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Выгрузка', slot: 'default' }]">
                        <ui-container>
                            <ui-input-auto prop="xlsxFilename" :options="SubtotalTypeOptions">
                                Название файла
                            </ui-input-auto>
                            <ui-input-auto prop="xlsxBlankName" :options="SubtotalTypeOptions">
                                Название листа
                            </ui-input-auto>
                            <ui-switch prop="xlsxAddDate" :options="SubtotalRowsPositionOptions">
                                Дата скачивания
                            </ui-switch>
                            <ui-switch prop="showSliceExport" :options="SubtotalRowsPositionOptions">
                                Кнопка «Выгрузить срез данных»
                            </ui-switch>
                            <ui-switch prop="showUnlimitedExport" :options="SubtotalRowsPositionOptions">
                                Кнопка «Выгрузить данные целиком»
                            </ui-switch>
                        </ui-container>
                    </ui-panel>
                </template>
            </ui-has-panel>
            <ui-has-panel>
                <ui-checkbox prop="isReplacingEmptyFields" />
                <template #panel>
                    <ui-panel :groups="[{ name: 'Настройки замены пустых ячеек', slot: 'default' }]">
                        <ui-container>
                            <ui-input prop="replacingVoidValue" />
                            <ui-input prop="replacingNullValue" />
                        </ui-container>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-has-panel>
                <ui-label label-size="small">Условное форматирование</ui-label>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Условное форматирование', slot: 'default' }]">
                        <template #default>
                            <ui-container>
                                <ui-draggable-accordion prop="playerConditions" v-bind="{ toolboxControls }">
                                    <template #header="{ item }">
                                        {{ getMetricName(item.dataAlias) }} {{ getConditionLabel(item.operator) }}
                                        {{ item.value }}
                                    </template>
                                    <template #default="{ item }">
                                        <ui-container>
                                            <ui-select
                                                :prop="composePlayerConditionsFieldProp(item, 'dataAlias')"
                                                :options="metricOptions">
                                                Метрика
                                            </ui-select>
                                            <ui-select
                                                :prop="composePlayerConditionsFieldProp(item, 'operator')"
                                                :options="ConditionsOptions">
                                                Условие
                                            </ui-select>
                                            <ui-input
                                                :prop="composePlayerConditionsFieldProp(item, 'value')"
                                                type="number"
                                                step="0.000001">
                                                Значение
                                            </ui-input>

                                            <ui-input-cp
                                                :prop="composePlayerConditionsFieldProp(item, 'cellSettings.color')">
                                                Цвет текста
                                            </ui-input-cp>
                                            <ui-input-cp
                                                :prop="
                                                    composePlayerConditionsFieldProp(
                                                        item,
                                                        'cellSettings.backgroundColor'
                                                    )
                                                ">
                                                Цвет фона
                                            </ui-input-cp>
                                            <ui-switch
                                                :prop="composePlayerConditionsFieldProp(item, 'isFormattingTotal')">
                                                Форматировать итоги
                                            </ui-switch>
                                        </ui-container>
                                    </template>
                                </ui-draggable-accordion>

                                <ui-button @click="addCondition">Добавить условие</ui-button>
                            </ui-container>
                        </template>
                    </ui-panel>
                </template>
            </ui-has-panel>
        </ui-container>
    </ui-panel-container>
</template>

<script>
import { FontWeightOptions, SizeUnits } from '@goodt-wcore/panels';
import { Panel } from '@goodt-wcore/panel';
import { UiDraggableAccordion } from '@goodt-wcore/panel-ui';
import { findIndex } from 'lodash';
import { PanelInstanceTypeDescriptor } from '../types';
import {
    ConditionsOptions,
    SubtotalRowsPositionOptions,
    SubtotalTypeOptions,
    TableDrawOptions,
    MetricsPositionOptions
} from '../utils/config';
import { SubtotalType, TableDrawTypes, createConditionWithUid, createFont } from '../utils/constants';
import {
    TotalPositionOptions,
    VerticalTotalPositionOptions,
    HorizontalAlignOptions,
    VerticalAlignOptions
} from './config';

export default {
    extends: Panel,
    static: {
        TotalPositionOptions,
        VerticalTotalPositionOptions,
        SizeUnits,
        complexFontBinds: {
            units: SizeUnits,
            fontWeightOptions: FontWeightOptions
        },
        verticalBinds: {
            options: VerticalAlignOptions
        },
        horizontalBinds: {
            options: HorizontalAlignOptions
        },
        SubtotalType,
        SubtotalRowsPositionOptions,
        SubtotalTypeOptions,
        TableDrawOptions,
        MetricsPositionOptions,
        ConditionsOptions
    },
    components: { UiDraggableAccordion },
    meta: { name: 'Настройки виджета', icon: 'widgets' },
    data: (vm) => ({
        toolboxControls: [
            { icon: 'mdi-minus-box-outline', label: 'Удалить', handler: vm.deleteCondition },
            { icon: 'mdi-content-copy', label: 'Копировать', handler: vm.copyCondition }
        ],
        ...PanelInstanceTypeDescriptor
    }),
    computed: {
        isDisabledSubtotalRowPosition() {
            const {
                props: {
                    subtotal: { type }
                },
                isFlatType
            } = this;
            return type === SubtotalType.EXCLUDED || type === SubtotalType.COLUMNS || isFlatType;
        },
        isFlatType() {
            return this.props.tableDrawType === TableDrawTypes.FLAT;
        },
        indexesFontStyles: {
            get() {
                return createFont({ ...this.props.baseIndexesSettings });
            },
            set(val) {
                this.props.baseIndexesSettings = {
                    ...this.props.baseIndexesSettings,
                    ...val
                };
                this.propChanged('baseIndexesSettings');
            }
        },
        rowTotalSettingsFontStyles: {
            get() {
                return createFont({ ...this.props.rowTotalSettings });
            },
            set(val) {
                this.props.rowTotalSettings = {
                    ...this.props.rowTotalSettings,
                    ...val
                };
                this.propChanged('rowTotalSettings');
            }
        },
        columnsTotalSettingsFontStyles: {
            get() {
                return createFont({ ...this.props.columnsTotalSettings });
            },
            set(val) {
                this.props.columnsTotalSettings = {
                    ...this.props.columnsTotalSettings,
                    ...val
                };
                this.propChanged('columnsTotalSettings');
            }
        },
        metricOptions() {
            const { values } = this.props;
            return [
                { label: 'Все метрики', value: '' },
                ...values.map(({ title: label, dataAlias }) => ({ label, value: dataAlias }))
            ];
        }
    },
    methods: {
        composePlayerConditionsFieldProp(item, key) {
            const { playerConditions } = this.props;
            return `playerConditions[${findIndex(playerConditions, item)}].${key}`;
        },
        getMetricName(alias) {
            const { metricOptions } = this;
            const findMetric = metricOptions.find(({ value }) => value === alias);
            return findMetric?.label ?? '';
        },
        getConditionLabel(val) {
            const { label = '' } = ConditionsOptions.find(({ value }) => value === val) ?? {};
            return label;
        },
        addCondition() {
            const {
                props: { playerConditions }
            } = this;

            playerConditions.push(createConditionWithUid());
            this.propChanged('playerConditions');
        },
        copyCondition(idx) {
            const {
                props: { playerConditions }
            } = this;

            playerConditions.push(createConditionWithUid(structuredClone(playerConditions[idx])));
            this.propChanged('playerConditions');
        },
        deleteCondition(idx) {
            this.props.playerConditions.splice(idx, 1);
            this.propChanged('playerConditions');
        }
    }
};
</script>
