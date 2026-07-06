<template>
    <ui-popup :visible.sync="isVisible" v-bind="PopupSettings">
        <template #body>
            <div class="settings-popup-body settings-popup-body--bordered">
                <div class="settings-popup-title">Настройки</div>
            </div>
            <div class="settings-popup-body settings-popup-body--bordered settings-popup-grid">
                <div class="settings-popup-grid">
                    <div class="settings-popup-body__title">Тип отображения</div>
                    <div class="settings-popup-control">
                        <ui-select class="w-100" v-model="copyProps.tableDrawType" :options="TableDrawOptions" />
                    </div>
                    <div class="settings-popup-body__title">Позиция метрик</div>
                    <div class="settings-popup-control">
                        <ui-select class="w-100" v-model="copyProps.metricsPosition" :options="MetricsPositionOptions" />
                    </div>
                    <div class="settings-popup-control">
                        <label class="settings-popup-control__label">
                            <div class="settings-popup-control__name">Пагинация</div>
                            <input
                                type="checkbox"
                                class="settings-popup-control__switch"
                                v-model="copyProps.isPagination" />
                        </label>
                    </div>
                    <div class="settings-popup-control" v-if="!isFlatType">
                        <label class="settings-popup-control__label">
                            <div class="settings-popup-control__name">Дриллдаун</div>
                            <input
                                type="checkbox"
                                class="settings-popup-control__switch"
                                v-model="copyProps.isUsedCollapse" />
                        </label>
                    </div>
                    <div class="settings-popup-control">
                        <label class="settings-popup-control__label">
                            <div class="settings-popup-control__name">Нумерация</div>
                            <input
                                type="checkbox"
                                class="settings-popup-control__switch"
                                v-model="copyProps.isUsedIndexes" />
                        </label>
                    </div>
                    <div class="settings-popup-control" v-if="!isFlatType">
                        <label class="settings-popup-control__label">
                            <div class="settings-popup-control__name">Дублирование измерений</div>
                            <input
                                type="checkbox"
                                class="settings-popup-control__switch"
                                v-model="copyProps.isDuplicateDimensions" />
                        </label>
                    </div>
                    <div class="settings-popup-control">
                        <label class="settings-popup-control__label">
                            <div class="settings-popup-control__name">Закреплять заголовок</div>
                            <input
                                type="checkbox"
                                class="settings-popup-control__switch"
                                v-model="copyProps.shouldBeFixedHeader" />
                        </label>
                    </div>
                    <div class="settings-popup-control">
                        <label class="settings-popup-control__label">
                            <div class="settings-popup-control__name">Закрепить первый столбец</div>
                            <input
                                type="checkbox"
                                class="settings-popup-control__switch"
                                v-model="copyProps.shouldBeFixedFirstColumn" />
                        </label>
                    </div>
                </div>
                <div class="settings-popup-grid" v-if="!isFlatType">
                    <div class="settings-popup-body__title">Промежуточные итоги</div>
                    <div class="settings-popup-control">
                        <ui-select class="w-100" v-model="copyProps.subtotal.type" :options="SubtotalTypeOptions" />
                    </div>
                    <div class="settings-popup-control">
                        <ui-select
                            class="w-100"
                            v-model="copyProps.subtotal.rowPosition"
                            :options="SubtotalRowsPositionOptions" />
                    </div>
                </div>
                <div class="settings-popup-grid">
                    <div class="settings-popup-body__title">Общий итог</div>
                    <div class="settings-popup-control">
                        <label class="settings-popup-control__label">
                            <div class="settings-popup-control__name">По строкам</div>
                            <input
                                type="checkbox"
                                class="settings-popup-control__switch"
                                v-model="copyProps.isShownColumnsTotal" />
                        </label>
                    </div>
                    <div class="settings-popup-control" v-if="!isFlatType">
                        <label class="settings-popup-control__label">
                            <div class="settings-popup-control__name">По столбцам</div>
                            <input
                                type="checkbox"
                                class="settings-popup-control__switch"
                                v-model="copyProps.isShownRowTotal" />
                        </label>
                    </div>
                </div>
                <div class="settings-popup-grid">
                    <div class="settings-popup-body__title">Общий итог по строкам</div>
                    <div class="settings-popup-control">
                        <label class="settings-popup-control__label">
                            <input
                                type="radio"
                                class="settings-popup-control__radio"
                                :value="TotalPositions.START"
                                :disabled="!copyProps.isShownColumnsTotal"
                                v-model="copyProps.columnsTotalPosition" />
                            <div class="settings-popup-control__name">Сверху</div>
                        </label>
                    </div>
                    <div class="settings-popup-control">
                        <label class="settings-popup-control__label">
                            <input
                                type="radio"
                                class="settings-popup-control__radio"
                                :value="TotalPositions.END"
                                :disabled="!copyProps.isShownColumnsTotal"
                                v-model="copyProps.columnsTotalPosition" />
                            <div class="settings-popup-control__name">Снизу</div>
                        </label>
                    </div>
                </div>

                <div class="settings-popup-grid" v-if="!isFlatType">
                    <div class="settings-popup-body__title">Общий итог по столбцам</div>
                    <div class="settings-popup-control">
                        <label class="settings-popup-control__label">
                            <input
                                type="radio"
                                class="settings-popup-control__radio"
                                :value="TotalPositions.START"
                                :disabled="!copyProps.isShownRowTotal"
                                v-model="copyProps.rowTotalPosition" />
                            <div class="settings-popup-control__name">Слева</div>
                        </label>
                    </div>
                    <div class="settings-popup-control">
                        <label class="settings-popup-control__label">
                            <input
                                type="radio"
                                class="settings-popup-control__radio"
                                :value="TotalPositions.END"
                                :disabled="!copyProps.isShownRowTotal"
                                v-model="copyProps.rowTotalPosition" />
                            <div class="settings-popup-control__name">Справа</div>
                        </label>
                    </div>
                </div>
                <div class="settings-popup-grid" v-if="!isFlatType && copyProps.isUsedCollapse && rowsCount > 1">
                    <div class="settings-popup-body__title">Цвет строк по уровням</div>
                    <div v-for="n in rowsCount" :key="n" class="settings-popup-control">
                        <label class="settings-popup-control__label">
                            <div class="settings-popup-control__name">Уровень {{ n }}</div>
                            <span class="settings-popup-control__level-color">
                                <input
                                    type="checkbox"
                                    class="settings-popup-control__switch"
                                    style="margin-left: 0"
                                    :checked="!!copyProps.levelRowColors[n - 1]"
                                    @change="toggleLevelColor(n - 1, $event.target.checked)" />
                                <input
                                    v-if="copyProps.levelRowColors[n - 1]"
                                    type="color"
                                    class="settings-popup-control__color"
                                    :value="copyProps.levelRowColors[n - 1]"
                                    @input="setLevelColor(n - 1, $event.target.value)" />
                            </span>
                        </label>
                    </div>
                </div>
            </div>
        </template>
        <template #footer="{ close }">
            <div class="settings-popup-body">
                <div class="text-right">
                    <div class="btn btn-primary mar-right-4" @click="onSave">Сохранить</div>
                    <div class="btn btn-outline" @click="close">Отменить</div>
                </div>
            </div>
        </template>
    </ui-popup>
</template>

<script>
// eslint-disable-next-line no-restricted-syntax
import { Popup, Select } from 'goodteditor-ui';

import { createSubtotalSettings, MetricsPosition, SettingsPopupSettings, TableDrawTypes, TotalPositions } from '../utils/constants';
import { SubtotalRowsPositionOptions, SubtotalTypeOptions, TableDrawOptions, MetricsPositionOptions } from '../utils/config';

export default {
    components: {
        UiPopup: Popup,
        UiSelect: Select
    },
    props: {
        visible: {
            type: Boolean,
            default: false
        },
        subtotal: {
            type: Object,
            default: () => createSubtotalSettings()
        },
        isUsedCollapse: {
            type: Boolean,
            default: false
        },
        isUsedIndexes: {
            type: Boolean,
            default: false
        },
        isShownColumnsTotal: {
            type: Boolean,
            default: false
        },
        isDuplicateDimensions: {
            type: Boolean,
            default: true
        },
        shouldBeFixedHeader: {
            type: Boolean,
            default: true
        },
        shouldBeFixedFirstColumn: {
            type: Boolean,
            default: false
        },
        columnsTotalPosition: {
            type: String,
            default: ''
        },
        isShownRowTotal: {
            type: Boolean,
            default: false
        },
        rowTotalPosition: {
            type: String,
            default: TotalPositions.END
        },
        tableDrawType: {
            type: String,
            default: TableDrawTypes.TABLE
        },
        metricsPosition: {
            type: String,
            default: MetricsPosition.COLUMNS
        },
        isPagination: {
            type: Boolean,
            default: false
        },
        levelRowColors: {
            type: Array,
            default: () => []
        },
        rowsCount: {
            type: Number,
            default: 0
        }
    },
    static: {
        PopupSettings: SettingsPopupSettings,
        TotalPositions,
        SubtotalRowsPositionOptions,
        SubtotalTypeOptions,
        TableDrawOptions,
        MetricsPositionOptions
    },
    data: (vm) => ({
        isVisible: vm.visible,
        copyProps: {
            isUsedCollapse: false,
            isUsedIndexes: false,
            isShownColumnsTotal: false,
            columnsTotalPosition: '',
            isDuplicateDimensions: '',
            isShownRowTotal: false,
            shouldBeFixedHeader: false,
            shouldBeFixedFirstColumn: false,
            rowTotalPosition: '',
            tableDrawType: '',
            metricsPosition: '',
            isPagination: false,
            subtotal: createSubtotalSettings(),
            levelRowColors: []
        }
    }),
    computed: {
        isFlatType() {
            return this.copyProps.tableDrawType === TableDrawTypes.FLAT;
        }
    },
    watch: {
        /** .sync modifier supported */
        visible() {
            this.isVisible = this.visible;
            this.updateData();
        },
        isVisible() {
            this.$emit('update:visible', this.isVisible);
            this.updateData();
        }
    },
    created() {
        this.updateData();
    },
    methods: {
        updateData() {
            const {
                isUsedCollapse,
                isUsedIndexes,
                isShownColumnsTotal,
                columnsTotalPosition,
                isDuplicateDimensions,
                shouldBeFixedHeader,
                shouldBeFixedFirstColumn,
                isShownRowTotal,
                rowTotalPosition,
                subtotal,
                isPagination,
                tableDrawType,
                metricsPosition,
                levelRowColors
            } = this;

            this.copyProps.isUsedCollapse = isUsedCollapse;
            this.copyProps.isUsedIndexes = isUsedIndexes;
            this.copyProps.isShownColumnsTotal = isShownColumnsTotal;
            this.copyProps.columnsTotalPosition = columnsTotalPosition;
            this.copyProps.isShownRowTotal = isShownRowTotal;
            this.copyProps.rowTotalPosition = rowTotalPosition;
            this.copyProps.isDuplicateDimensions = isDuplicateDimensions;
            this.copyProps.shouldBeFixedHeader = shouldBeFixedHeader;
            this.copyProps.shouldBeFixedFirstColumn = shouldBeFixedFirstColumn;
            this.copyProps.subtotal = subtotal;
            this.copyProps.tableDrawType = tableDrawType;
            this.copyProps.metricsPosition = metricsPosition;
            this.copyProps.isPagination = isPagination;
            this.copyProps.levelRowColors = levelRowColors ? [...levelRowColors] : [];
        },
        setLevelColor(index, color) {
            const colors = [...(this.copyProps.levelRowColors || [])];
            while (colors.length <= index) colors.push('');
            colors[index] = color;
            this.copyProps.levelRowColors = colors;
        },
        toggleLevelColor(index, enabled) {
            const colors = [...(this.copyProps.levelRowColors || [])];
            while (colors.length <= index) colors.push('');
            colors[index] = enabled ? '#ffffff' : '';
            this.copyProps.levelRowColors = colors;
        },
        onSave() {
            const { copyProps } = this;
            this.$emit('saved', { ...copyProps });
            this.isVisible = false;
        }
    },
    implicitCssModule: true
};
</script>

<style src="./styles/settingsPopup.pcss" lang="pcss" module></style>
