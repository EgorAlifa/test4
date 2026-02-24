<template>
    <ui-container>
        <ui-switch v-model="currentOptions.nullValues" @change="collectSettings">
            Убрать нулевые значения
            <template #hint>Скрывает графики, величина которых равна нулю</template>
        </ui-switch>

        <ui-switch v-model="currentOptions.voidValues" @change="collectSettings">
            Убрать пустые значения
            <template #hint>При включении настройки, пустые значения не будут отображаться на диаграмме.</template>
        </ui-switch>

        <ui-switch v-model="currentOptions.connectNulls" @change="collectSettings">
            Соединять пропуская пустые
            <template #hint>При выключении настройки, пустые значения будут обрывать диаграмму.</template>
        </ui-switch>

        <ui-switch v-model="currentOptions.isAbsoluteValue" @change="collectSettings">
            Выводить абсолютное значение
        </ui-switch>

        <ui-switch v-model="currentOptions.isAutoRound" @change="collectSettings">
            Авто-округление
            <template #hint>
                Активирует округление метрики по следующему алгоритму, где х - значение метрики:
                <br />
                а) если x>=1, то округление до целого значения;
                <br />
                б) если 0.1<=x<1, то отображение с 1 знаком после запятой;
                <br />
                в) если 0.01<=x<0.1, то отображение с 2 знаками после запятой;
                <br />
                г) если x<0.01, то отображение с 3 знаками после запятой.
            </template>
        </ui-switch>

        <ui-select
            :disabled="currentOptions.isAutoRound"
            v-model="currentOptions.metricFormat"
            :options="formatOptions"
            @change="collectSettings">
            Формат метрики
        </ui-select>

        <ui-select
            :disabled="currentOptions.isAutoRound"
            v-model="currentOptions.metricSeparator"
            :options="separatorOptions"
            @change="collectSettings">
            Формат разделителя разрядов
        </ui-select>

        <ui-has-two-columns>
            <template #left>
                <ui-input-auto v-model="currentOptions.metricPrefix" @change="collectSettings">Префикс</ui-input-auto>
            </template>
            <template #right>
                <ui-input-auto v-model="currentOptions.metricPostfix" @change="collectSettings">Постфикс</ui-input-auto>
            </template>
        </ui-has-two-columns>

        <ui-input-cp
            v-model="currentOptions.colorForLine"
            @change="collectAndUpdateColorsForLine"
            v-if="currentOptions.type === 'line'">
            Цвет линии
        </ui-input-cp>

        <ui-has-panel>
            <ui-checkbox
                v-model="currentOptions.fillLine"
                :disabled="currentOptions.customFillLine"
                @change="collectSettings">
                Заливка линии
            </ui-checkbox>
            <template #panel>
                <ui-panel
                    :groups="[
                        { name: 'Заливка', slot: 'fill' },
                        { name: 'Градиент', slot: 'gradient' }
                    ]">
                    <template #fill>
                        <ui-container>
                            <ui-switch v-model="currentOptions.shouldSyncColor" @change="collectSettings">
                                Цвет дублирует цвет графика
                            </ui-switch>
                            <ui-select
                                v-model="currentOptions.origin"
                                :options="fillPositions"
                                :disabled="currentOptions.smartFill"
                                @change="collectSettings">
                                Положение заливки
                            </ui-select>
                            <ui-switch v-model="currentOptions.smartFill" @change="collectSettings">
                                Умная заливка
                            </ui-switch>
                            <ui-input-cp v-model="currentOptions.fillColor" @change="collectSettings">
                                Настройка цвета
                            </ui-input-cp>
                        </ui-container>
                    </template>
                    <template #gradient>
                        <ui-container>
                            <ui-switch v-model="currentOptions.gradient" @change="collectSettings">
                                Градиент заливки
                            </ui-switch>
                            <ui-input-cp v-model="currentOptions.firstColor" @change="collectSettings">
                                Первый цвет
                            </ui-input-cp>
                            <ui-input
                                type="number"
                                min="0"
                                max="1"
                                step="0.1"
                                v-model="currentOptions.offSetFirstColor"
                                @change="collectSettings">
                                Смещение цвета
                            </ui-input>
                            <ui-input-cp v-model="currentOptions.secondColor" @change="collectSettings">
                                Второй цвет
                            </ui-input-cp>
                            <ui-input
                                type="number"
                                min="0"
                                max="1"
                                step="0.1"
                                v-model="currentOptions.offSetSecondColor"
                                @change="collectSettings">
                                Смещение цвета
                            </ui-input>
                            <ui-select
                                v-model="currentOptions.colorPos"
                                :options="gradientPosOptions"
                                @change="collectSettings">
                                Направление градиента
                            </ui-select>
                        </ui-container>
                    </template>
                </ui-panel>
            </template>
        </ui-has-panel>

        <ui-select v-model="currentOptions.lineStyle.type" :options="lineTypes" @change="collectSettings">
            Тип линии
        </ui-select>

        <ui-input-units :units="CommonSizeFirstPxUnits" v-model="lineStyleWidth" @change="collectSettings">
            Толщина линии
        </ui-input-units>

        <ui-has-panel>
            <ui-checkbox v-model="currentOptions.showSymbol" @change="collectSettings">Точки</ui-checkbox>
            <template #panel>
                <ui-panel :groups="[{ name: 'Настройка точек', slot: 'default' }]">
                    <ui-container>
                        <ui-select v-model="currentOptions.symbol" :options="symbolTypes" @change="collectSettings">
                            Вид
                        </ui-select>
                        <ui-input-units :units="CommonSizeFirstPxUnits" v-model="symbolSize" @change="collectSettings">
                            Размер
                        </ui-input-units>
                        <ui-switch v-model="currentOptions.fillSymbol" @change="collectColorForLine">
                            Задавать цвет
                        </ui-switch>
                        <ui-input-cp v-model="currentOptions.symbolColor" @change="collectColorForLine">
                            Цвет
                        </ui-input-cp>
                        <ui-input-units
                            :units="CommonSizeFirstPxUnits"
                            v-model="symbolBdrWidth"
                            @change="collectColorForLine">
                            Размер границы
                        </ui-input-units>
                        <ui-input-cp v-model="currentOptions.symbolBdrColor" @change="collectColorForLine">
                            Цвет границы
                        </ui-input-cp>
                        <ui-switch v-model="currentOptions.shouldDotsSyncColor" @change="collectSettings">
                            Цвет дублирует цвет графика
                        </ui-switch>
                    </ui-container>
                </ui-panel>
            </template>
        </ui-has-panel>

        <ui-has-panel>
            <div class="form-label form-label-small">Настройка тени</div>
            <template #panel>
                <ui-panel :groups="[{ name: 'Настройка тени', slot: 'default' }]">
                    <ui-container>
                        <ui-switch v-model="currentOptions.shouldSyncShadowColor" @change="collectSettings">
                            Цвет тени дублирует цвет графика
                        </ui-switch>
                        <ui-input
                            type="number"
                            v-model.number="currentOptions.itemStyle.shadowBlur"
                            @change="collectSettings">
                            Размытие тени
                        </ui-input>
                        <ui-input-cp v-model="currentOptions.itemStyle.shadowColor" @change="collectSettings">
                            Цвет тени
                        </ui-input-cp>
                        <ui-has-two-columns>
                            <template #left>
                                <ui-input
                                    type="number"
                                    v-model.number="currentOptions.itemStyle.shadowOffsetX"
                                    @change="collectSettings">
                                    Сдвиг по X
                                </ui-input>
                            </template>
                            <template #right>
                                <ui-input
                                    type="number"
                                    v-model.number="currentOptions.itemStyle.shadowOffsetY"
                                    @change="collectSettings">
                                    Сдвиг по Y
                                </ui-input>
                            </template>
                        </ui-has-two-columns>
                    </ui-container>
                </ui-panel>
            </template>
        </ui-has-panel>

        <ui-has-panel>
            <ui-checkbox v-model="currentOptions.label.show" @change="collectSettings">Подписи</ui-checkbox>
            <template #panel>
                <ui-panel :groups="[{ name: 'Настройка подписей', slot: 'default' }]">
                    <ui-container>
                        <ui-input-cp v-model="currentOptions.label.color" @change="collectSettings">
                            Настройка цвета
                        </ui-input-cp>
                        <ui-has-two-columns>
                            <template #left>
                                <ui-input-auto v-model="currentOptions.label.fontFamily" @change="collectSettings">
                                    Шрифт подписи
                                </ui-input-auto>
                            </template>
                            <template #right>
                                <ui-input-units
                                    v-model="labelFontSize"
                                    :units="FontSizeFirstPxUnits"
                                    @change="collectSettings">
                                    Размер шрифта
                                </ui-input-units>
                            </template>
                        </ui-has-two-columns>
                        <ui-select
                            v-model="currentOptions.label.position"
                            :options="labelPosOptions"
                            @change="collectSettings">
                            Расположение подписей
                        </ui-select>
                        <ui-select
                            v-model="currentOptions.label.align"
                            :options="LabelAlignOptions"
                            @change="collectSettings">
                            Горизонтальное выравнивание
                        </ui-select>
                        <ui-input
                            type="number"
                            min="-90"
                            max="90"
                            v-model.number="currentOptions.label.rotate"
                            @change="collectSettings">
                            Угол поворота подписей
                        </ui-input>
                        <ui-has-two-columns>
                            <template #left>
                                <ui-input
                                    type="number"
                                    v-model.number="currentOptions.label.offset[0]"
                                    @change="collectSettings">
                                    Отступ по оси X
                                </ui-input>
                            </template>
                            <template #right>
                                <ui-input
                                    type="number"
                                    v-model.number="currentOptions.label.offset[1]"
                                    @change="collectSettings">
                                    Отступ по оси Y
                                </ui-input>
                            </template>
                        </ui-has-two-columns>

                        <ui-has-panel>
                            <ui-checkbox disabled v-model="currentOptions.labelLayout.use" @change="collectSettings">
                                <ui-hint>
                                    <template #label>Подписи прямой линией</template>
                                    Функционал в данный момент не активен и находится в процессе доработки
                                </ui-hint>
                            </ui-checkbox>
                            <template #panel>
                                <ui-panel :groups="[{ name: 'Настройки для подписей в линию', slot: 'default' }]">
                                    <ui-container>
                                        <ui-input
                                            type="number"
                                            v-model.number="currentOptions.labelLayout.x"
                                            @change="collectSettings">
                                            Позиция по Х
                                        </ui-input>
                                        <ui-input
                                            type="number"
                                            v-model.number="currentOptions.labelLayout.y"
                                            @change="collectSettings">
                                            Позиция по Y
                                        </ui-input>
                                        <ui-select
                                            v-model="currentOptions.labelLayout.align"
                                            :options="LabelAlignOptions"
                                            @change="collectSettings">
                                            Выравнивание по Х
                                        </ui-select>
                                        <ui-select
                                            v-model="currentOptions.labelLayout.verticalAlign"
                                            :options="VerticalAlignOptions"
                                            @change="collectSettings">
                                            Выравнивание по Y
                                        </ui-select>
                                    </ui-container>
                                </ui-panel>
                            </template>
                        </ui-has-panel>

                        <ui-switch v-model="currentOptions.label.isZeroValueShown" @change="collectSettings">
                            Отображать нули
                        </ui-switch>
                    </ui-container>
                </ui-panel>
            </template>
        </ui-has-panel>
    </ui-container>
</template>

<script>
/* eslint-disable id-length */
import { cloneDeep, get as _get } from 'lodash';
import Color from 'color';
import { PanelUi } from '@goodt-wcore/components';
import { convertCssVarToComputedValue } from '@goodt-common/utils';

import { utils } from '../../utils';
import { unit2PxMixin } from '../../utils/mixins';
import {
    METRIC_FORMAT_OPTIONS,
    SEPARATOR_OPTIONS,
    GRADIENT_POS_OPTIONS,
    LABEL_POS_OPTIONS,
    FILL_POSITIONS,
    LINE_TYPES,
    SYMBOL_TYPES,
    LabelAlignOptions,
    SortOptions,
    VerticalAlignOptions,
    CommonSizeFirstPxUnits,
    FontSizeFirstPxUnits
} from '../config';
import { SeriesTopTemplate } from '../../utils/constants';

const DRAG_ANIMATION_TIME = 200;

export default {
    components: {
        ...PanelUi
    },
    mixins: [unit2PxMixin],
    props: {
        styles: {
            type: Object,
            default: () => ({})
        },
        axis: {
            type: Array,
            default: () => []
        },
        minorDimensionNames: {
            type: Array,
            default: () => []
        },
        elemComputedStyles: {
            type: CSSStyleDeclaration,
            default: () => ({})
        }
    },
    data() {
        return {
            currentOptions: {},
            customColor: {
                name: ''
            }
        };
    },

    computed: {
        lineStyleWidth: {
            get() {
                const { lineStyle } = this.currentOptions;
                return `${lineStyle.width}`;
            },
            set(val) {
                const { lineStyle } = this.currentOptions;
                lineStyle.width = val;
            }
        },
        symbolSize: {
            get() {
                return `${this.currentOptions.symbolSize}`;
            },
            set(val) {
                this.currentOptions.symbolSize = val;
            }
        },
        symbolBdrWidth: {
            get() {
                return `${this.currentOptions.symbolBdrWidth}`;
            },
            set(val) {
                this.currentOptions.symbolBdrWidth = val;
            }
        },
        labelFontSize: {
            get() {
                const {
                    label: { fontSize }
                } = this.currentOptions;
                return `${fontSize}`;
            },
            set(val) {
                const { label } = this.currentOptions;
                label.fontSize = val;
            }
        },
        categoryAxisType() {
            const categoryAxis = this.axis.find((item) => item.type === 'category');
            return categoryAxis?.typeAxis ?? '';
        }
    },

    static: {
        formatOptions: METRIC_FORMAT_OPTIONS,
        separatorOptions: SEPARATOR_OPTIONS,
        gradientPosOptions: GRADIENT_POS_OPTIONS,
        labelPosOptions: LABEL_POS_OPTIONS,
        fillPositions: FILL_POSITIONS,
        lineTypes: LINE_TYPES,
        symbolTypes: SYMBOL_TYPES,
        LabelAlignOptions,
        VerticalAlignOptions,
        SortOptions,
        CommonSizeFirstPxUnits,
        FontSizeFirstPxUnits
    },

    watch: {
        'customColor.name': {
            handler() {
                const {
                    currentOptions: { customColors }
                } = this;
                const index = customColors.findIndex(({ name }) => name === this.customColor.name);
                this.customColor = {
                    ...this.customColor,
                    color: customColors?.[index]?.color ?? '',
                    fillColor: customColors?.[index]?.fillColor ?? '',
                    gradient: customColors?.[index]?.gradient ?? false,
                    firstColor: customColors?.[index]?.firstColor ?? '',
                    offSetFirstColor: customColors?.[index]?.offSetFirstColor ?? '0',
                    secondColor: customColors?.[index]?.secondColor ?? '',
                    offSetSecondColor: customColors?.[index]?.offSetSecondColor ?? '1',
                    colorPos: customColors?.[index]?.colorPos ?? '0 0 0 1'
                };
            }
        },
        categoryAxisType(value, oldValue) {
            if (value !== oldValue) {
                this.collectSettings();
            }
        },
        'currentOptions.colorStep': {
            handler(colorStep, oldColorStep) {
                if (oldColorStep != null && colorStep !== oldColorStep) {
                    this.onColorStepChange(colorStep, oldColorStep);
                }
            }
        }
    },

    mounted() {
        this.collectSettings();
        this.collectAndUpdateColorsForLine();
    },

    created() {
        this.currentOptions = { ...SeriesTopTemplate, ...cloneDeep(this.styles) };

        if (_get(this.currentOptions, 'areaStyle', null)) {
            if (this.currentOptions.fillUnderLine && this.currentOptions.gradient === false) {
                this.currentOptions.fillColor = _get(this.currentOptions.areaStyle, 'colorStops[0].color', '#d74545');
            } else if (this.currentOptions.fillUnderLine) {
                this.currentOptions.firstColor = _get(this.currentOptions.areaStyle.color, 'colorStops[0].color');
                this.currentOptions.offSetFirstColor = _get(
                    this.currentOptions.areaStyle.color,
                    'colorStops[0].offset'
                );
                this.currentOptions.secondColor = _get(this.currentOptions.areaStyle.color, 'colorStops[1].color');
                this.currentOptions.offSetSecondColor = _get(
                    this.currentOptions.areaStyle.color,
                    'colorStops[1].offset'
                );
            }
        }
    },

    methods: {
        resolveColorValue(color) {
            return convertCssVarToComputedValue(color, this.elemComputedStyles);
        },
        onColorStepChange(colorStep, oldColorStep) {
            const customColors = this.currentOptions.customColors.map(({ name, color }) => {
                let newColor = Color(color);
                const { l: light } = newColor.hsl().object();
                newColor = newColor.lightness((light / oldColorStep) * colorStep).string();
                return { name, color: newColor };
            });

            this.currentOptions.colorStep = colorStep;
            this.currentOptions.customColors = customColors;
            this.changed();
        },
        collectSettings() {
            const { type, smooth, gradient, fillLine, itemStyle, isRoundedBarBorder, roundedBarBorder } =
                this.currentOptions;

            if (fillLine) {
                this.currentOptions.areaStyle = {};
                const { areaStyle } = this.currentOptions;
                if (gradient && fillLine) {
                    const [x, y, x2, y2] = this.currentOptions.colorPos.split(' ');

                    areaStyle.color = {
                        type: 'linear',
                        x,
                        y,
                        x2,
                        y2,
                        colorStops: [
                            {
                                offset: this.currentOptions.offSetFirstColor,
                                color: this.currentOptions.firstColor
                            },
                            {
                                offset: this.currentOptions.offSetSecondColor,
                                color: this.currentOptions.secondColor
                            }
                        ]
                    };
                    areaStyle.shadowBlur = 10;
                    areaStyle.shadowColor = 'rgba(0, 0, 0, 0.1)';
                    areaStyle.origin = this.currentOptions.smartFill ? 'auto' : this.currentOptions.origin;
                } else if (fillLine) {
                    this.currentOptions.areaStyle = {
                        origin: this.currentOptions.smartFill ? 'auto' : this.currentOptions.origin
                    };
                    if (this.currentOptions.fillColor !== '') {
                        areaStyle.color = {
                            type: 'linear',
                            x: 0,
                            y: 0,
                            x2: 0,
                            y2: 1,
                            colorStops: [
                                {
                                    offset: '0',
                                    color: this.currentOptions.fillColor
                                },
                                {
                                    offset: '1',
                                    color: this.currentOptions.fillColor
                                }
                            ]
                        };
                    }
                }
            } else {
                this.currentOptions.areaStyle = null;
            }
            this.changed();
        },
        collectAndUpdateColorsForLine() {
            const { minorDimensionNames: dimensionNames, currentOptions } = this;
            const { colorForLine, colorStep } = currentOptions;
            const resolvedColor = this.resolveColorValue(colorForLine);
            this.currentOptions = {
                ...currentOptions,
                customColors: utils.buildColorSet(resolvedColor, colorStep, dimensionNames)
            };
            this.collectColorForLine();
        },
        collectColorForLine() {
            const { colorForLine, fillSymbol, symbolColor, symbolBdrWidth, symbolBdrColor, lineStyle, itemStyle } =
                this.currentOptions;
            this.currentOptions = {
                ...this.currentOptions,
                color: colorForLine,
                itemStyle: {
                    ...itemStyle,
                    color: fillSymbol ? symbolColor : colorForLine,
                    borderWidth: convertCssVarToComputedValue(symbolBdrWidth, this.elemComputedStyles),
                    borderColor: symbolBdrColor
                },
                lineStyle: { ...lineStyle, color: colorForLine }
            };
            this.changed();
        },
        changed() {
            this.$emit('change-style', this.currentOptions);
        }
    }
};
</script>
