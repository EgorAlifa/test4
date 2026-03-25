<template>
    <ui-collapse>
        <template #header>{{ axisTitle }}</template>
        <ui-container>
            <ui-has-panel>
                <ui-checkbox v-model="currentAxis.showAxisName" @change="toggleAxisName">
                    Отображать название оси
                </ui-checkbox>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Настройки названия оси', slot: 'name' }]">
                        <template #name>
                            <ui-container>
                                <ui-input-auto v-model="currentAxis.name" @change="returnAxis">
                                    <ui-hint>
                                        <template #label>Название оси</template>
                                        Для переноса используйте - \n
                                    </ui-hint>
                                </ui-input-auto>
                                <ui-input-cp v-model="currentAxis.nameTextStyle.color" @change="returnAxis">
                                    Цвет названия оси
                                </ui-input-cp>
                                <ui-input v-model="currentAxis.nameTextStyle.fontFamily" @change="returnAxis">
                                    Шрифт названия оси
                                </ui-input>
                                <ui-select
                                    v-model="currentAxis.nameLocation"
                                    :options="nameLocations"
                                    @change="returnAxis">
                                    Положение названия оси
                                </ui-select>
                                <ui-input
                                    col-size="6-12"
                                    type="number"
                                    v-model="currentAxis.nameGap"
                                    @change="returnAxis">
                                    Отступ названия оси
                                </ui-input>
                                <ui-input
                                    col-size="6-12"
                                    type="number"
                                    v-model="currentAxis.nameRotate"
                                    @change="returnAxis">
                                    Поворот названия оси
                                </ui-input>
                            </ui-container>
                        </template>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-input :value="displayingId" @change="returnAxis" disabled>ID</ui-input>

            <ui-select v-model="currentAxis.typeAxis" :options="axisDirTypes" @change="returnAxis">
                Направление оси
            </ui-select>

            <ui-select v-model="currentAxis.position" :options="axisPosOptions" @change="returnAxis">
                Позиция оси
            </ui-select>

            <ui-select v-model="currentAxis.type" :options="axisTypes" @change="returnAxis">Тип оси</ui-select>

            <template v-if="currentAxis.type === 'value'">
                <ui-input type="number" min="0" v-model.number="currentAxis.splitNumber" @change="returnAxis">
                    Число секторов оси
                </ui-input>

                <ui-select v-model="currentAxis.format" :options="axisValueFormats" @change="returnAxis">
                    Формат оси
                </ui-select>

                <ui-switch
                    class="p"
                    v-model="currentAxis.isFullPercentageScale"
                    @change="returnAxis"
                    v-if="currentAxis.format === 'percent'">
                    100% масштаб оси
                </ui-switch>

                <ui-has-panel>
                    <ui-checkbox v-model="currentAxis.calcMinMax" @change="returnAxis">
                        Задать ограничение оси
                    </ui-checkbox>
                    <template #panel>
                        <ui-panel
                            :groups="[
                                { name: 'Динамически', slot: 'dynamic' },
                                { name: 'Вручную', slot: 'manual' }
                            ]">
                            <template #dynamic>
                                <ui-switch
                                    class="p"
                                    v-model="currentAxis.isRoundedDynamicMinValue"
                                    @change="returnAxis">
                                    Округлить стартовое значение
                                </ui-switch>
                                <ui-switch
                                    class="p"
                                    v-model="currentAxis.isNotAboveZeroDynamicMinValue"
                                    @change="returnAxis">
                                    Стартовое значение не > 0
                                </ui-switch>
                                <ui-input
                                    class="p"
                                    type="number"
                                    step="any"
                                    v-model.number="currentAxis.dynamicMinValue"
                                    @change="returnAxis">
                                    Стартовое значение (%)
                                </ui-input>
                                <ui-switch
                                    class="p"
                                    v-model="currentAxis.isRoundedDynamicMaxValue"
                                    @change="returnAxis">
                                    Округлить конечное значение
                                </ui-switch>
                                <ui-input
                                    class="p"
                                    type="number"
                                    step="1"
                                    min="0"
                                    max="20"
                                    v-model.number="currentAxis.dynamicMaxValuePrecision"
                                    @change="returnAxis">
                                    Количество знаков после запятой
                                </ui-input>
                                <ui-input
                                    type="number"
                                    step="any"
                                    v-model.number="currentAxis.dynamicMaxValue"
                                    @change="returnAxis">
                                    Конечное значение (%)
                                </ui-input>
                            </template>
                            <template #manual>
                                <ui-switch class="p" v-model="currentAxis.manualMinMax" @change="returnAxis">
                                    Задавать значения вручную
                                </ui-switch>
                                <ui-input
                                    class="p"
                                    type="number"
                                    v-model.number="currentAxis.minValue"
                                    @change="returnAxis">
                                    Стартовое значение
                                </ui-input>
                                <ui-switch class="p" v-model="currentAxis.enableMax" @change="returnAxis">
                                    Задать конечное значение
                                </ui-switch>
                                <ui-input
                                    type="number"
                                    :min="currentAxis.min"
                                    v-model.number="currentAxis.maxValue"
                                    @change="returnAxis">
                                    Конечное значение
                                </ui-input>
                            </template>
                        </ui-panel>
                    </template>
                </ui-has-panel>
            </template>
            <template v-else>
                <ui-switch v-model="currentAxis.isShownNullLabels" @change="returnAxis">
                    Подписи нулевых значений
                </ui-switch>
            </template>

            <ui-switch v-model="currentAxis.show" @change="returnAxis">Отображать ось</ui-switch>

            <ui-switch v-model="currentAxis.inverse" @change="returnAxis">Инвертировать ось</ui-switch>

            <ui-switch v-model="currentAxis.hasGap" @change="returnAxis">Отступы от оси</ui-switch>

            <ui-switch :disabled="!currentAxis.show" v-model="currentAxis.axisTick.show" @change="returnAxis">
                Отображать насечки на линии
            </ui-switch>

            <ui-has-panel>
                <ui-checkbox :disabled="!currentAxis.show" v-model="currentAxis.axisLine.show" @change="returnAxis">
                    Отображать линию оси
                </ui-checkbox>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Настройка линии оси', slot: 'line' }]">
                        <template #line>
                            <ui-input-cp v-model="currentAxis.axisLine.lineStyle.color" @change="returnAxis">
                                Цвет линии
                            </ui-input-cp>
                        </template>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-has-panel>
                <ui-checkbox v-model="currentAxis.axisLabel.show" @change="returnAxis">
                    Отображать подписи оси
                </ui-checkbox>
                <template #panel>
                    <ui-panel
                        :groups="[
                            { name: 'Отображение', slot: 'label' },
                            { name: 'Шрифт', slot: 'font' }
                        ]">
                        <template #label>
                            <ui-container>
                                <template v-if="currentAxis.type === 'category'">
                                    <ui-select
                                        v-model="currentAxis.axisLabel.type"
                                        :options="AxisLabelTypes"
                                        @change="returnAxis">
                                        Тип подписи
                                    </ui-select>
                                    <ui-input
                                        type="number"
                                        v-model.number="currentAxis.axisLabel.margin"
                                        @change="returnAxis">
                                        Отступ от оси
                                    </ui-input>

                                    <ui-select
                                        v-model="currentAxis.axisLabel.imageMetric"
                                        :options="metricNames"
                                        @change="returnAxis">
                                        Метрика изображения
                                    </ui-select>
                                    <ui-input
                                        type="number"
                                        min="0"
                                        v-model.number="currentAxis.axisLabel.imageHeight"
                                        @change="returnAxis">
                                        Высота изображения
                                    </ui-input>

                                    <ui-additional-axis-label
                                        v-if="currentAxis.axisLabel.type === 'text&label'"
                                        :metrics-options="metricNames"
                                        :dremio-options="datasetNames"
                                        v-model="currentAxis.additionalAxisLabel"
                                        @input="returnAxis">
                                        Настройка доп.подписи
                                    </ui-additional-axis-label>
                                    <ui-has-panel>
                                        <div class="form-label form-label-small">Перенос подписей</div>
                                        <template #panel>
                                            <ui-panel :groups="[{ name: 'Перенос подписей', slot: 'default' }]">
                                                <template>
                                                    <ui-switch
                                                        class="p"
                                                        v-model="currentAxis.axisLabel.breakLongValues"
                                                        @change="returnAxis">
                                                        <ui-hint>
                                                            <template #label>По словам</template>
                                                            <span>Одно слово в строке</span>
                                                        </ui-hint>
                                                    </ui-switch>
                                                    <ui-input
                                                        type="number"
                                                        class="p"
                                                        :disabled="currentAxis.axisLabel.breakLongValues"
                                                        v-model.number="currentAxis.axisLabel.longValuesLength"
                                                        min="0"
                                                        @change="returnAxis">
                                                        Количество символов
                                                    </ui-input>
                                                </template>
                                            </ui-panel>
                                        </template>
                                    </ui-has-panel>

                                    <ui-input
                                        type="number"
                                        v-model.number="currentAxis.axisLabel.rotate"
                                        @change="returnAxis">
                                        Поворот подписи (°)
                                    </ui-input>
                                    <ui-input
                                        type="number"
                                        min="0"
                                        v-model.number="currentAxis.axisLabel.interval"
                                        @change="returnAxis">
                                        Интервал сегментации
                                    </ui-input>

                                    <ui-switch v-model="currentAxis.shouldHighlightSelectedLabels" @change="returnAxis">
                                        Выделение подписи при нажатии
                                    </ui-switch>
                                </template>
                                <template v-if="currentAxis.type === 'value'">
                                    <ui-select
                                        v-model="currentAxis.axisLabel.format"
                                        :disabled="isNumberFormatActive"
                                        :options="formatOptions"
                                        @change="returnAxis">
                                        Формат
                                    </ui-select>
                                    <ui-select
                                        v-model="currentAxis.axisLabel.separator"
                                        :disabled="isNumberFormatActive"
                                        :options="separatorOptions"
                                        @change="returnAxis">
                                        Формат разделителя разрядов
                                    </ui-select>
                                    <div class="row row-collapse">
                                        <ui-checkbox
                                            class="self-center"
                                            v-model="isNumberFormatActive"
                                            @change="returnAxis"></ui-checkbox>
                                        <ui-number-format
                                            class="col col-vmid"
                                            v-model="currentAxis.axisLabel.extendedFormat"
                                            @change="returnAxis">
                                            Числовой формат
                                        </ui-number-format>
                                    </div>
                                    <ui-has-two-columns>
                                        <template #left>
                                            <ui-input
                                                type="number"
                                                v-model.number="currentAxis.axisLabel.rotate"
                                                @change="returnAxis">
                                                Поворот подписи (°)
                                            </ui-input>
                                        </template>
                                        <template #right>
                                            <ui-input
                                                type="number"
                                                min="0"
                                                v-model.number="currentAxis.interval"
                                                @change="returnAxis">
                                                Интервал сегментации
                                            </ui-input>
                                        </template>
                                    </ui-has-two-columns>
                                </template>
                            </ui-container>
                        </template>
                        <template #font>
                            <ui-input-cp class="p" v-model="currentAxis.axisLabel.color" @change="returnAxis">
                                Цвет шрифта
                            </ui-input-cp>
                            <ui-input-auto class="p" v-model="currentAxis.axisLabel.fontFamily" @change="returnAxis">
                                Шрифт
                            </ui-input-auto>
                            <ui-input-units
                                col-size="6-12"
                                v-model="currentAxisValueFontSize"
                                :units="FontSizeFirstPxUnits"
                                @change="returnAxis">
                                Размер шрифта
                            </ui-input-units>
                        </template>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-has-panel>
                <ui-checkbox :disabled="!currentAxis.show" v-model="currentAxis.splitLine.show" @change="returnAxis">
                    Отображать линию разделения
                </ui-checkbox>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Настройка линии разделения', slot: 'split-line' }]">
                        <template #split-line>
                            <ui-input-cp class="p" v-model="currentAxis.splitLine.lineStyle.color" @change="returnAxis">
                                Цвет линии
                            </ui-input-cp>
                            <ui-select
                                v-model="currentAxis.splitLine.lineStyle.type"
                                :options="lineTypes"
                                @change="returnAxis">
                                Тип сетки
                            </ui-select>
                        </template>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-button type="error" @click="deleteAxis">Удалить</ui-button>
        </ui-container>
    </ui-collapse>
</template>

<script>
import { cloneDeep as _cloneDeep, merge as _merge } from 'lodash';
import { Components } from 'goodt-wcore';
import { AxisTemplate } from '../../utils/constants';
import AdditionalAxisLabel from './AdditionalAxisLabel.vue';

import {
    SEPARATOR_OPTIONS,
    METRIC_FORMAT_OPTIONS,
    LINE_TYPES,
    NAME_LOCATIONS,
    AXIS_DIR_TYPES,
    AXIS_TYPES,
    AXIS_VALUE_FORMATS,
    AxisLabelTypes,
    FontSizeFirstPxUnits
} from '../config';

export default {
    components: {
        ...Components.PanelUi,
        uiAdditionalAxisLabel: AdditionalAxisLabel
    },
    props: {
        index: Number,
        axis: Object,
        // eslint-disable-next-line vue/no-unused-properties
        id: {
            type: Number,
            default: 0
        },
        metricNames: {
            type: Array,
            default: () => []
        },
        datasetNames: {
            type: Array,
            default: () => []
        }
    },

    data() {
        return {
            currentAxis: {}
        };
    },

    computed: {
        currentAxisValueFontSize: {
            get() {
                const { valueFontSize } = this.currentAxis;
                return `${valueFontSize}`;
            },
            set(val) {
                const { currentAxis } = this;
                currentAxis.valueFontSize = val;
            }
        },
        displayingId() {
            return this.currentAxis.id + 1;
        },
        axisTitle() {
            return `${this.currentAxis.typeAxis} ${this.index}`;
        },
        axisPosOptions() {
            return this.currentAxis.typeAxis === 'x'
                ? [
                      { value: 'top', label: 'Сверху' },
                      { value: 'bottom', label: 'Снизу' }
                  ]
                : [
                      { value: 'left', label: 'Слева' },
                      { value: 'right', label: 'Справа' }
                  ];
        },
        isNumberFormatActive: {
            get() {
                const { isNumberFormatActive } = this.currentAxis.axisLabel;
                return isNumberFormatActive;
            },
            set(val) {
                const { axisLabel } = this.currentAxis;
                axisLabel.isNumberFormatActive = val;
            }
        }
    },

    static: {
        separatorOptions: SEPARATOR_OPTIONS,
        formatOptions: METRIC_FORMAT_OPTIONS,
        lineTypes: LINE_TYPES,
        nameLocations: NAME_LOCATIONS,
        axisDirTypes: AXIS_DIR_TYPES,
        axisTypes: AXIS_TYPES,
        axisValueFormats: AXIS_VALUE_FORMATS,
        AxisLabelTypes,
        FontSizeFirstPxUnits
    },

    watch: {
        currentAxis: {
            deep: true,
            handler(axis, oldAxis) {
                const shouldChangeColor =
                    oldAxis.nameTextStyle != null && axis.nameTextStyle.color !== oldAxis.nameTextStyle.color;

                if (shouldChangeColor) {
                    this.returnAxis();
                }
            }
        }
    },

    created() {
        this.currentAxis = _merge(AxisTemplate(), _cloneDeep(this.axis));
    },

    methods: {
        toggleAxisName() {
            const { showAxisName, nameTextStyle } = this.currentAxis;
            nameTextStyle.color = showAxisName ? '#333333' : 'transparent';
            this.returnAxis();
        },
        returnAxis(event) {
            this.$emit('change-axis', this.currentAxis, this.index);
        },
        deleteAxis() {
            this.$emit('delete-axis', this.index);
        }
    }
};
</script>
