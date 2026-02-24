<template>
    <w-panel>
        <ui-switch class="p" v-model="props.showBench" @change="propChanged('showBench')">
            Отобразить бенчмарк
        </ui-switch>

        <ui-select
            class="p"
            v-model="props.typeBenchData"
            :options="TypeDataOptions"
            @change="propChanged('typeBenchData')">
            Тип данных
        </ui-select>

        <template v-if="props.typeBenchData === 'metric'">
            <ui-select
                class="p"
                v-model="props.selectedBench"
                :options="metrics"
                @change="propChanged('selectedBench')">
                Выберите метрику
            </ui-select>
            <ui-number-format prop="benchFormat" class="p" @change="removeLegacyProps">Формат числа</ui-number-format>
        </template>

        <ui-select
            v-if="props.typeBenchData === 'dimension'"
            class="p"
            v-model="props.selectedBenchDimension"
            :options="dimensions"
            @change="propChanged('selectedBenchDimension')">
            Выберите измерение
        </ui-select>

        <ui-label>Расположение бенчмарка</ui-label>
        <ui-has-two-columns class="p">
            <template #left>
                <ui-select
                    v-model="props.positionBench"
                    :options="BenchmarkPositionOptions"
                    @change="propChanged('positionBench')"></ui-select>
            </template>
            <template #right>
                <ui-select
                    v-if="props.positionBench === 'top' || props.positionBench === 'bottom'"
                    v-model="props.posRelBench"
                    :options="HorizontalPositionBenchOptions"
                    @change="propChanged('posRelBench')"></ui-select>
                <ui-select
                    v-else
                    v-model="props.posRelBench"
                    :options="VerticalPositionBenchOptions"
                    @change="propChanged('posRelBench')"></ui-select>
            </template>
        </ui-has-two-columns>

        <ui-has-panel class="p">
            <ui-checkbox v-model="props.benchDynamicColor" @change="propChanged('benchDynamicColor')">
                Индикация цветом бенчмарка
            </ui-checkbox>
            <template #panel>
                <ui-panel :groups="[{ name: 'Индикация цветом', slot: 'conditionColor' }]">
                    <template #conditionColor>
                        <ui-condition-style
                            :param="props.conditionBenchStyle"
                            :param-types="MetricParamTypes"
                            :param-formats="MetricParamFormats"
                            :param-style-types="MetricParamStyleTypes"
                            :param-style-factory="PARAM_STYLE_FACTORY"
                            :dimension-metric-names="dimensionsMetrics"
                            :separate-param-types="MetricSeparateParamTypes"
                            @change="changedCustomBenchStyles"
                            :init-props="false"></ui-condition-style>
                    </template>
                </ui-panel>
            </template>
        </ui-has-panel>

        <ui-has-panel class="p">
            <ui-checkbox
                v-model="props.indicatorBenchmarkIcon.isVisible"
                @change="propChanged('indicatorBenchmarkIcon')">
                Иконки индикатора
            </ui-checkbox>
            <template #panel>
                <ui-panel :groups="[{ slot: 'default', name: 'Иконки индикатора' }]">
                    <ui-container>
                        <ui-select
                            v-model="props.indicatorBenchmarkIcon.targetSource"
                            :options="datasetOptions"
                            @change="propChanged('indicatorBenchmarkIcon')">
                            Источник
                        </ui-select>
                        <ui-select
                            v-model="props.indicatorBenchmarkIcon.metricValue"
                            :options="dimensionsMetricsByDataset[props.indicatorBenchmarkIcon.targetSource]"
                            @change="propChanged('indicatorBenchmarkIcon')">
                            Значение
                        </ui-select>
                        <ui-select
                            v-model="props.indicatorBenchmarkIcon.direction"
                            :options="IconPositionOptions"
                            @change="propChanged('indicatorBenchmarkIcon')">
                            Расположение от значения
                        </ui-select>
                        <w-indicator-icon-condition
                            :indicator-icon="props.indicatorBenchmarkIcon"
                            :settings="props.benchmarkIconRules"
                            :metrics="dimensionsMetricsByDataset[props.indicatorBenchmarkIcon.targetSource]"
                            @settings-changed="updateBenchmarkIconRules"
                            @indicator-icon-changed="updateIndicatorBenchmarkIcon" />
                    </ui-container>
                </ui-panel>
            </template>
        </ui-has-panel>

        <ui-has-panel class="p">
            <span class="text-small form-label">Настройки шрифта</span>
            <template #panel>
                <ui-panel :groups="[{ name: 'Настройки шрифта у бенчмарка', slot: 'font-settings' }]">
                    <template #font-settings>
                        <ui-complex-font v-model="benchSettingsFont"></ui-complex-font>
                    </template>
                </ui-panel>
            </template>
        </ui-has-panel>

        <ui-has-two-columns class="p">
            <template #left>
                <ui-input v-model="props.benchPreFix" @change="propChanged('benchPreFix')">Префикс</ui-input>
            </template>
            <template #right>
                <ui-input v-model="props.benchPostFix" @change="propChanged('benchPostFix')">Постфикс</ui-input>
            </template>
        </ui-has-two-columns>

        <ui-has-panel class="p">
            <span class="text-small form-label">Настройки префикса</span>
            <template #panel>
                <ui-panel :groups="[{ name: 'Настройки префикса у бенчмарка', slot: 'prefix-settings' }]">
                    <template #prefix-settings>
                        <ui-container>
                            <ui-complex-font v-model="benchPrefixSettingsFont"></ui-complex-font>

                            <ui-input-units
                                v-model="props.benchPrefixRightMargin"
                                col-size="6-12"
                                :units="units"
                                @change="propChanged('benchPrefixRightMargin')">
                                Отступ от бенчмарка
                            </ui-input-units>

                            <ui-input v-model="props.benchPrefixIcon" @change="propChanged('benchPrefixIcon')">
                                Класс иконки
                            </ui-input>

                            <ui-input-units
                                v-model="props.benchPrefixIconFontSize"
                                col-size="6-12"
                                :units="units"
                                @change="propChanged('benchPrefixIconFontSize')">
                                Размер иконки
                            </ui-input-units>

                            <ui-input-cp
                                v-model="props.benchPrefixIconColor"
                                @input="propChanged('benchPrefixIconColor')">
                                Цвет иконки
                            </ui-input-cp>
                        </ui-container>
                    </template>
                </ui-panel>
            </template>
        </ui-has-panel>

        <ui-has-panel>
            <span class="text-small form-label">Настройки постфикса</span>
            <template #panel>
                <ui-panel :groups="[{ name: 'Настройки постфикса у бенчмарка', slot: 'postfix-settings' }]">
                    <template #postfix-settings>
                        <ui-container>
                            <ui-complex-font v-model="benchPostfixSettingsFont"></ui-complex-font>

                            <ui-input-units
                                v-model="props.benchPostfixLeftMargin"
                                col-size="6-12"
                                :units="units"
                                @change="propChanged('benchPostfixLeftMargin')">
                                Отступ от бенчмарка
                            </ui-input-units>
                        </ui-container>
                    </template>
                </ui-panel>
            </template>
        </ui-has-panel>
    </w-panel>
</template>

<script>
import { Panel } from '@goodt-wcore/panel';
import { PanelDatasetMixinTypes } from '@goodt-common/data';
import { createFont } from '@goodt-wcore/panel-ui/utils';

import UiConditionStyle from './components/ConditionStyle.vue';
import WIndicatorIconCondition from './components/IndicatorIconCondition.vue';
import { BenchmarkPositionOptions } from '../utils/constants';
import PanelMixin from './mixins';

export default {
    extends: Panel,
    components: { UiConditionStyle, WIndicatorIconCondition },
    mixins: [PanelMixin],

    meta: { name: 'Бенчмарк', icon: 'box-shadow' },

    static: {
        BenchmarkPositionOptions,
        HorizontalPositionBenchOptions: [
            { value: 'flex-start', label: 'Слева' },
            { value: 'center', label: 'По центру' },
            { value: 'flex-end', label: 'Справа' }
        ],
        VerticalPositionBenchOptions: [
            { value: 'flex-end', label: 'Cнизу' },
            { value: 'center', label: 'По центру' },
            { value: 'flex-start', label: 'Сверху' }
        ]
    },
    data() {
        return {
            ...PanelDatasetMixinTypes
        };
    },
    computed: {
        benchSettingsFont: {
            get() {
                const { fontBench, benchmarkFontWeight, sizeBench, sizeUnitBench, colorBench } = this.props;
                return createFont({
                    color: colorBench,
                    fontSize: typeof sizeBench === 'string' ? sizeBench : `${sizeBench}${sizeUnitBench}`,
                    fontFamily: fontBench,
                    fontWeight: benchmarkFontWeight
                });
            },
            set({ color, fontSize, fontFamily, fontWeight }) {
                this.props.fontBench = fontFamily;
                this.props.benchmarkFontWeight = fontWeight;
                this.props.sizeBench = fontSize;
                this.props.colorBench = color;
                this.propChanged(['fontBench', 'benchmarkFontWeight', 'sizeBench', 'colorBench']);
            }
        },
        benchPrefixSettingsFont: {
            get() {
                const { benchPrefixColor, benchPrefixFont, benchPrefixFontWeight, benchPrefixFontSize } = this.props;
                return createFont({
                    color: benchPrefixColor,
                    fontSize: benchPrefixFontSize,
                    fontFamily: benchPrefixFont,
                    fontWeight: benchPrefixFontWeight
                });
            },
            set({ color, fontSize, fontFamily, fontWeight }) {
                this.props.benchPrefixFont = fontFamily;
                this.props.benchPrefixFontWeight = fontWeight;
                this.props.benchPrefixFontSize = fontSize;
                this.props.benchPrefixColor = color;
                this.propChanged([
                    'benchPrefixFont',
                    'benchPrefixFontWeight',
                    'benchPrefixFontSize',
                    'benchPrefixColor'
                ]);
            }
        },
        benchPostfixSettingsFont: {
            get() {
                const { benchPostfixColor, benchPostfixFont, benchPostfixFontWeight, benchPostfixFontSize } =
                    this.props;
                return createFont({
                    color: benchPostfixColor,
                    fontSize: benchPostfixFontSize,
                    fontFamily: benchPostfixFont,
                    fontWeight: benchPostfixFontWeight
                });
            },
            set({ color, fontSize, fontFamily, fontWeight }) {
                this.props.benchPostfixFont = fontFamily;
                this.props.benchPostfixFontWeight = fontWeight;
                this.props.benchPostfixFontSize = fontSize;
                this.props.benchPostfixColor = color;
                this.propChanged([
                    'benchPostfixFont',
                    'benchPostfixFontWeight',
                    'benchPostfixFontSize',
                    'benchPostfixColor'
                ]);
            }
        }
    },
    methods: {
        removeLegacyProps() {
            this.$delete(this.props, 'formatterBench');
            this.propChanged();
        },
        changedCustomBenchStyles(styles) {
            this.props.conditionBenchStyle = styles;
            this.propChanged();
        },
        updateBenchmarkIconRules(benchmarkIconRules) {
            this.props.benchmarkIconRules = benchmarkIconRules;
            this.propChanged('benchmarkIconRules');
        },
        updateIndicatorBenchmarkIcon(indicatorBenchmarkIcon) {
            this.props.indicatorBenchmarkIcon = indicatorBenchmarkIcon;
            this.propChanged('indicatorBenchmarkIcon');
        }
    }
};
</script>
