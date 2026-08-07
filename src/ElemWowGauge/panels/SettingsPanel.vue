<template>
    <w-panel>
        <ui-container>
            <ui-select prop="gaugeStyle" :options="options.gaugeStyles" label="Стиль датчика"></ui-select>
            <ui-select prop="theme" :options="options.themes" label="Тема"></ui-select>
            <ui-has-panel>
                <ui-checkbox prop="showValue">Значение</ui-checkbox>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Настройки значения', slot: 'value' }]">
                        <template #value>
                            <ui-container>
                                <ui-select prop="format" :options="options.formats" label="Формат метрики"></ui-select>
                                <ui-select prop="separator" :options="options.separators" label="Формат разделителя разрядов"></ui-select>
                                <ui-has-two-columns>
                                    <template #left>
                                        <ui-input prop="prefix" placeholder="Префикс"></ui-input>
                                    </template>
                                    <template #right>
                                        <ui-input prop="postfix" placeholder="Постфикс"></ui-input>
                                    </template>
                                </ui-has-two-columns>
                                <div class="form-label form-label-small">Шрифт</div>
                                <ui-input-cp v-model="props.valueFontColor" @change="propChanged('valueFontColor')">
                                    Цвет шрифта
                                </ui-input-cp>
                                <ui-input-auto v-model="props.valueFontFamily" @change="propChanged('valueFontFamily')">
                                    Шрифт
                                </ui-input-auto>
                                <ui-input-units
                                    col-size="6-12"
                                    min="0"
                                    :units="FontSizeFirstPxUnits"
                                    v-model="valueFontSizeString"
                                    @change="saveValueFontSize">
                                    Размер шрифта
                                </ui-input-units>
                            </ui-container>
                        </template>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-has-panel>
                <ui-checkbox prop="showTitle">Заголовок</ui-checkbox>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Настройки заголовка', slot: 'title' }]">
                        <template #title>
                            <ui-container>
                                <ui-input v-model="props.title" @change="propChanged('title')" placeholder="Текст заголовка"></ui-input>
                                <div class="form-label form-label-small">Шрифт</div>
                                <ui-input-cp v-model="props.titleFontColor" @change="propChanged('titleFontColor')">
                                    Цвет шрифта
                                </ui-input-cp>
                                <ui-input-auto v-model="props.titleFontFamily" @change="propChanged('titleFontFamily')">
                                    Шрифт
                                </ui-input-auto>
                                <ui-input-units
                                    col-size="6-12"
                                    min="0"
                                    :units="FontSizeFirstPxUnits"
                                    v-model="titleFontSizeString"
                                    @change="saveTitleFontSize">
                                    Размер шрифта
                                </ui-input-units>
                            </ui-container>
                        </template>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <template v-if="props.gaugeStyle !== 'needle'">
                <div class="form-label">Дизайн датчика</div>
                <ui-input-cp prop="activeColor" label="Цвет активных сегментов"></ui-input-cp>
                <ui-input-cp prop="inactiveColor" label="Цвет неактивных сегментов"></ui-input-cp>
            </template>

            <!-- Half Circle specific settings -->
            <template v-if="props.gaugeStyle === 'halfCircle'">
                <ui-select prop="segmentStyle" :options="options.segmentStyles" label="Стиль сегментов"></ui-select>
                <ui-input type="number" prop="numberOfSegments" label="Количество сегментов" placeholder="14"></ui-input>
            </template>

            <!-- Ring gauge specific settings -->
            <template v-if="props.gaugeStyle === 'ring'">
                <ui-input type="number" prop="numberOfDots" label="Количество точек" placeholder="16"></ui-input>
            </template>

            <!-- Needle (tachometer) gauge specific settings -->
            <template v-if="props.gaugeStyle === 'needle'">
                <div class="form-label">Шкала</div>
                <ui-input
                    type="number"
                    min="0.01"
                    step="0.01"
                    prop="needleScaleMax"
                    label="Значение (доля), соответствующее концу шкалы"
                    placeholder="1">
                </ui-input>
                <ui-switch prop="showTicks">Показывать деления</ui-switch>
                <ui-input
                    v-if="props.showTicks"
                    type="number"
                    min="2"
                    prop="numberOfTicks"
                    label="Количество делений"
                    placeholder="9">
                </ui-input>
                <ui-input-cp v-if="props.showTicks" prop="tickColor" label="Цвет делений"></ui-input-cp>

                <div class="form-label form-label-small">Цветовые зоны шкалы</div>
                <ui-hint>
                    <template #label>Как это работает</template>
                    Каждая зона задана верхней границей (доля от 0 до 1, где 1 = конец
                    <br />
                    шкалы). Первая зона всегда начинается с 0, следующая - с границы
                    <br />
                    предыдущей. Например: 0.9 красный, 1 зелёный - зона 0–90% красная,
                    <br />
                    90–100% зелёная.
                </ui-hint>
                <ui-button @click="addNeedleBand">Добавить зону</ui-button>
                <ui-container v-for="(band, idx) in props.needleBands" :key="idx" class="p pad-t1">
                    <ui-has-two-columns>
                        <template #left>
                            <ui-input
                                type="number"
                                min="0"
                                max="1"
                                step="0.01"
                                v-model.number="band.to"
                                @change="propChanged('needleBands')">
                                Верхняя граница
                            </ui-input>
                        </template>
                        <template #right>
                            <ui-input-cp v-model="band.color" @change="propChanged('needleBands')">
                                Цвет
                            </ui-input-cp>
                        </template>
                    </ui-has-two-columns>
                    <ui-button type="error" @click="removeNeedleBand(idx)">Удалить зону</ui-button>
                </ui-container>

                <div class="form-label form-label-small">Стрелка</div>
                <ui-select prop="needleBandStyle" :options="options.needleBandStyles" label="Стиль концов зон"></ui-select>
                <ui-input type="number" min="0.1" step="0.1" prop="needleBandWidth" label="Толщина зон шкалы" placeholder="1.6"></ui-input>
                <ui-input-cp prop="needleColor" label="Цвет стрелки"></ui-input-cp>
                <ui-input-cp prop="needlePivotColor" label="Цвет оси стрелки"></ui-input-cp>
            </template>

            <div class="form-label">Оформление</div>
            <ui-select prop="radius" :options="options.radiuses" label="Скругление углов"></ui-select>
            <ui-select prop="elevation" :options="options.elevation" label="Тень"></ui-select>
            <ui-switch prop="showBorder">Показывать рамку</ui-switch>
            <ui-input-units
                col-size="6-12"
                min="0"
                :units="FontSizeFirstPxUnits"
                v-model="containerPaddingString"
                @change="saveContainerPadding">
                Отступ контейнера
            </ui-input-units>

            <!-- Text position for half circle and needle gauges (both use the baseline layout) -->
            <ui-input
                v-if="props.gaugeStyle === 'halfCircle' || props.gaugeStyle === 'needle'"
                type="number"
                min="0"
                max="100"
                prop="textVerticalPosition"
                label="Позиция текста (%)"
                placeholder="70">
            </ui-input>

            <ui-has-panel>
                <ui-checkbox prop="animation">Анимация</ui-checkbox>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Настройка анимации', slot: 'animation' }]">
                        <template #animation>
                            <ui-container>
                                <ui-select prop="animationEasing" :options="options.animationEasings" label="Тип анимации"></ui-select>
                                <ui-input type="number" min="0" prop="animationDuration" label="Длительность (мс)" placeholder="1000"></ui-input>
                                <ui-input type="number" min="0" prop="animationDelay" label="Задержка (мс)" placeholder="0"></ui-input>
                            </ui-container>
                        </template>
                    </ui-panel>
                </template>
            </ui-has-panel>
        </ui-container>
    </w-panel>
</template>

<script>
import { Panel } from '@goodt-wcore/panel';
import { usePanelDatasetMixin, PanelDatasetMixinTypes } from '@goodt-common/data';
import { PanelInstanceTypeDescriptor } from '../types';
import { options } from '../config';

const FontSizeFirstPxUnits = ['px', 'rem', 'em', '%'];

export default {
    extends: Panel,
    mixins: [usePanelDatasetMixin()],

    meta: { name: 'Настройки виджета', icon: 'widgets' },

    static: {
        FontSizeFirstPxUnits
    },

    data: () => ({
        options
    }),

    computed: {
        containerPaddingString: {
            get() {
                const padding = this.props.containerPadding || { size: 16, unit: 'px' }; // eslint-disable-line no-magic-numbers
                return `${padding.size}${padding.unit}`;
            },
            set(val) {
                // ui-input-units returns string like "20px" or object like {size: 20, unit: 'px'}
                if (typeof val === 'string') {
                    // Parse string "20px" into object
                    const match = val.match(/^(\d+(?:\.\d+)?)(px|rem|em|%)$/);
                    if (match != null) {
                        this.props.containerPadding = { size: parseFloat(match[1]), unit: match[2] };
                    }
                } else if (val != null && typeof val === 'object') {
                    // Already an object
                    this.props.containerPadding = val;
                }
            }
        },
        valueFontSizeString: {
            get() {
                const fontSize = this.props.valueFontSize || { size: 4, unit: 'rem' }; // eslint-disable-line no-magic-numbers
                return `${fontSize.size}${fontSize.unit}`;
            },
            set(val) {
                if (typeof val === 'string') {
                    const match = val.match(/^(\d+(?:\.\d+)?)(px|rem|em|%)$/);
                    if (match != null) {
                        this.props.valueFontSize = { size: parseFloat(match[1]), unit: match[2] };
                    }
                } else if (val != null && typeof val === 'object') {
                    this.props.valueFontSize = val;
                }
            }
        },
        titleFontSizeString: {
            get() {
                const fontSize = this.props.titleFontSize || { size: 3, unit: 'rem' }; // eslint-disable-line no-magic-numbers
                return `${fontSize.size}${fontSize.unit}`;
            },
            set(val) {
                if (typeof val === 'string') {
                    const match = val.match(/^(\d+(?:\.\d+)?)(px|rem|em|%)$/);
                    if (match != null) {
                        this.props.titleFontSize = { size: parseFloat(match[1]), unit: match[2] };
                    }
                } else if (val != null && typeof val === 'object') {
                    this.props.titleFontSize = val;
                }
            }
        }
    },

    watch: {
        'props.theme': {
            handler(newTheme) {
                const isDark = newTheme === 'dark';
                
                // Update value font color to match theme
                if (this.props.valueFontColor === '#ffffff' || this.props.valueFontColor === '#0a0a0a') {
                    this.props.valueFontColor = isDark ? '#ffffff' : '#0a0a0a';
                    this.propChanged('valueFontColor');
                }
                
                // Update title font color to match theme
                if (this.props.titleFontColor === '#ffffff' || this.props.titleFontColor === '#0a0a0a' || this.props.titleFontColor === '#6b7280') {
                    this.props.titleFontColor = isDark ? '#ffffff' : '#0a0a0a';
                    this.propChanged('titleFontColor');
                }
            }
        }
    },

    methods: {
        ...PanelInstanceTypeDescriptor,
        ...PanelDatasetMixinTypes,
        saveContainerPadding() {
            this.propChanged('containerPadding');
        },
        saveValueFontSize() {
            this.propChanged('valueFontSize');
        },
        saveTitleFontSize() {
            this.propChanged('titleFontSize');
        },
        addNeedleBand() {
            const lastBand = this.props.needleBands[this.props.needleBands.length - 1];
            const lastTo = lastBand ? lastBand.to : 0;
            const defaultStep = 0.1;
            this.props.needleBands.push({ to: Math.min(1, lastTo + defaultStep), color: '#22c55e' });
            this.propChanged('needleBands');
        },
        removeNeedleBand(idx) {
            this.props.needleBands.splice(idx, 1);
            this.propChanged('needleBands');
        }
    }
};
</script>
