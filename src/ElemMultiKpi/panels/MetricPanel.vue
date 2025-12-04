<template>
    <w-panel>
        <ui-container>
            <ui-select prop="type" :options="TypeDataOptions">Тип данных</ui-select>

            <ui-select v-if="props.type === 'metric'" prop="selectedMetric" :options="metrics">
                Выберите метрику
            </ui-select>

            <ui-select v-if="props.type === 'dimension'" prop="selectedDimension" :options="dimensions">
                Выберите измерение
            </ui-select>

            <ui-has-panel v-if="props.type === 'metric'">
                <ui-checkbox prop="isMetricNumber" @change="removeLegacyProps">
                    Работа с числовыми значениями
                </ui-checkbox>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Работа с числовыми значениями', slot: 'default' }]">
                        <ui-container>
                            <ui-number-format prop="metricFormat" @change="removeLegacyProps">
                                Формат числа
                                <template #hint>Применяется при отключенном "Авто-округлении"</template>
                            </ui-number-format>
                            <ui-switch prop="isRoundValue">
                                Авто-округление
                                <template #hint>
                                    <div class="p">
                                        Активирует округление метрики по следующему алгоритму, где х - значение метрики:
                                    </div>
                                    <div>а) если x>=1, то округление до целого значения;</div>
                                    <!-- спец символ "<", дабы избежать ошибок
                                    ESLint: Parsing error: invalid-first-character-of-tag-name(vue/no-parsing-error) -->
                                    <div>б) если 0.1&lt;=x&lt;1, то отображение с 1 знаком после запятой;</div>
                                    <div>в) если 0.01&lt;=x&lt;0.1, то отображение с 2 знаками после запятой;</div>
                                    <div class="p">г) если x&lt;0.01, то отображение с 3 знаками после запятой.</div>
                                    <div>В том числе работает с отрицательными значениями по аналогичной логике</div>
                                </template>
                            </ui-switch>
                        </ui-container>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-has-panel>
                <ui-checkbox v-model="props.metricDynamicColor" @change="propChanged('metricDynamicColor')">
                    Индикация значения цветом
                </ui-checkbox>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Индикация цветом', slot: 'conditionColor' }]">
                        <template #conditionColor>
                            <ui-condition-style
                                :param="props.conditionMetricStyle"
                                :param-types="MetricParamTypes"
                                :param-formats="MetricParamFormats"
                                :param-style-types="MetricParamStyleTypes"
                                :param-style-factory="PARAM_STYLE_FACTORY"
                                :dimension-metric-names="dimensionsMetrics"
                                :separate-param-types="MetricSeparateParamTypes"
                                @change="(styles) => changedConditionStyles('conditionMetricStyle', styles)"
                                :init-props="false"></ui-condition-style>
                        </template>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-has-panel>
                <ui-checkbox v-model="props.indicatorMetricIcon.isVisible" @change="propChanged('indicatorMetricIcon')">
                    Иконки индикатора
                </ui-checkbox>
                <template #panel>
                    <ui-panel :groups="[{ slot: 'default', name: 'Иконки индикатора' }]">
                        <ui-container>
                            <ui-select
                                v-model="props.indicatorMetricIcon.targetSource"
                                :options="datasetOptions"
                                @change="propChanged('indicatorMetricIcon')">
                                Источник
                            </ui-select>
                            <ui-select
                                v-model="props.indicatorMetricIcon.metricValue"
                                :options="dimensionsMetricsByDataset[props.indicatorMetricIcon.targetSource]"
                                @change="propChanged('indicatorMetricIcon')">
                                Значение
                            </ui-select>
                            <ui-select
                                v-model="props.indicatorMetricIcon.direction"
                                :options="IconPositionOptions"
                                @change="propChanged('indicatorMetricIcon')">
                                Расположение от значения
                            </ui-select>

                            <w-indicator-icon-condition
                                :indicator-icon="props.indicatorMetricIcon"
                                :settings="props.metricIconRules"
                                :metrics="dimensionsMetricsByDataset[props.indicatorMetricIcon.targetSource]"
                                @settings-changed="updateMetricIconRules"
                                @indicator-icon-changed="updateIndicatorMetricIcon" />
                        </ui-container>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-has-panel>
                <span class="text-small form-label">Настройки шрифта</span>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Настройки шрифта у метрики', slot: 'font-settings' }]">
                        <template #font-settings>
                            <ui-container>
                                <ui-complex-font v-model="metricSettingsFont"></ui-complex-font>
                            </ui-container>
                        </template>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-switch
                v-model="props.posCenterMetric"
                @change="propChanged('posCenterMetric')"
                :disabled="!props.isViewModeAbsolute">
                Отобразить метрику посередине
                <template #hint>Настройка совместима только со включённым Абсолютным позиционированием.</template>
            </ui-switch>

            <ui-select
                col-size="6-12"
                v-model="props.positionMetric"
                :options="MetricPositionOptions"
                @change="propChanged('positionMetric')">
                Расположение метрики
            </ui-select>

            <ui-has-two-columns>
                <template #left>
                    <ui-input v-model="props.preFix" @change="propChanged('preFix')">Префикс</ui-input>
                </template>
                <template #right>
                    <ui-input v-model="props.postFix" @change="propChanged('postFix')">Постфикс</ui-input>
                </template>
            </ui-has-two-columns>

            <ui-has-panel>
                <span class="text-small form-label">Настройки префикса</span>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Настройки префикса у метрики', slot: 'prefix-settings' }]">
                        <template #prefix-settings>
                            <ui-container>
                                <ui-complex-font v-model="metricPrefixSettingsFont"></ui-complex-font>

                                <ui-input-units
                                    v-model="props.prefixRightMargin"
                                    col-size="6-12"
                                    :units="units"
                                    @change="propChanged('prefixRightMargin')">
                                    Отступ от метрики
                                </ui-input-units>

                                <ui-input v-model="props.prefixIcon" @change="propChanged('prefixIcon')">
                                    Класс иконки
                                </ui-input>

                                <ui-input-units
                                    v-model="prefixIconFontSize"
                                    :units="units"
                                    @change="setFontSize('prefixIconFontSize', 'prefixIconFontSizeUnit', ...arguments)">
                                    Размер иконки
                                </ui-input-units>

                                <ui-has-panel>
                                    <ui-checkbox
                                        v-model="props.conditionPrefixIconStyle.enable"
                                        @change="propChanged('conditionPrefixIconStyle')">
                                        Индикация иконки
                                    </ui-checkbox>
                                    <template #panel>
                                        <ui-panel :groups="[{ name: 'Индикация', slot: 'conditions' }]">
                                            <template #conditions>
                                                <ui-condition-style
                                                    :param="props.conditionPrefixIconStyle"
                                                    :param-types="MetricParamTypes"
                                                    :param-formats="MetricParamFormats"
                                                    :param-style-types="MetricParamStyleTypes"
                                                    :param-style-factory="PARAM_STYLE_FACTORY"
                                                    :dimension-metric-names="dimensionsMetrics"
                                                    :separate-param-types="MetricSeparateParamTypes"
                                                    @change="
                                                        (styles) =>
                                                            changedConditionStyles('conditionPrefixIconStyle', styles)
                                                    "></ui-condition-style>
                                            </template>
                                        </ui-panel>
                                    </template>
                                </ui-has-panel>

                                <ui-input-cp
                                    :disabled="props.conditionPrefixIconStyle.enable"
                                    v-model="props.prefixIconColor"
                                    @input="propChanged('prefixIconColor')">
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
                    <ui-panel :groups="[{ name: 'Настройки постфикса у метрики', slot: 'postfix-settings' }]">
                        <template #postfix-settings>
                            <ui-container>
                                <ui-complex-font v-model="metricPostfixSettingsFont"></ui-complex-font>

                                <ui-input-units
                                    v-model="props.postfixLeftMargin"
                                    :units="units"
                                    @change="propChanged('postfixLeftMargin')">
                                    Отступ от метрики
                                </ui-input-units>
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
import { PanelDatasetMixinTypes } from '@goodt-common/data';
import { UiComplexFont } from '@goodt-wcore/panel-ui';
import { createFont } from '@goodt-wcore/panel-ui/utils';

import UiConditionStyle from './components/ConditionStyle.vue';
import { MetricPositionOptions } from '../utils/constants';
import PanelMixin from './mixins';
import { DatasetPanelMixin } from './DatasetPanelMixin';
import WIndicatorIconCondition from './components/IndicatorIconCondition.vue';

export default {
    extends: Panel,
    components: { UiConditionStyle, WIndicatorIconCondition, UiComplexFont },
    mixins: [PanelMixin, DatasetPanelMixin],

    meta: { name: 'Метрика', icon: 'passport-biometric' },

    static: {
        MetricPositionOptions
    },
    data() {
        return {
            prefixIconFontSize: '',
            ...PanelDatasetMixinTypes
        };
    },
    computed: {
        metricSettingsFont: {
            get() {
                const { fontMetric, metricFontWeight, sizeMetric, sizeUnitMetric, colorMetric } = this.props;
                return createFont({
                    color: colorMetric,
                    fontSize: typeof sizeMetric === 'string' ? sizeMetric : `${sizeMetric}${sizeUnitMetric}`,
                    fontFamily: fontMetric,
                    fontWeight: metricFontWeight
                });
            },
            set({ color, fontSize, fontFamily, fontWeight }) {
                this.props.fontMetric = fontFamily;
                this.props.metricFontWeight = fontWeight;
                this.props.sizeMetric = fontSize;
                this.props.colorMetric = color;
                this.propChanged(['fontMetric', 'metricFontWeight', 'sizeMetric', 'colorMetric']);
            }
        },
        metricPrefixSettingsFont: {
            get() {
                const { prefixColor, prefixFont, prefixFontWeight, prefixFontSize, prefixFontSizeUnit } = this.props;
                return createFont({
                    color: prefixColor,
                    fontSize:
                        typeof prefixFontSize === 'string' ? prefixFontSize : `${prefixFontSize}${prefixFontSizeUnit}`,
                    fontFamily: prefixFont,
                    fontWeight: prefixFontWeight
                });
            },
            set({ color, fontSize, fontFamily, fontWeight }) {
                this.props.prefixFont = fontFamily;
                this.props.prefixFontWeight = fontWeight;
                this.props.prefixFontSize = fontSize;
                this.props.prefixColor = color;
                this.propChanged(['prefixFont', 'prefixFontWeight', 'prefixFontSize', 'prefixColor']);
            }
        },
        metricPostfixSettingsFont: {
            get() {
                const { postfixColor, postfixFont, postfixFontWeight, postfixFontSize, postfixFontSizeUnit } =
                    this.props;
                return createFont({
                    color: postfixColor,
                    fontSize:
                        typeof postfixFontSize === 'string'
                            ? postfixFontSize
                            : `${postfixFontSize}${postfixFontSizeUnit}`,
                    fontFamily: postfixFont,
                    fontWeight: postfixFontWeight
                });
            },
            set({ color, fontSize, fontFamily, fontWeight }) {
                this.props.postfixFont = fontFamily;
                this.props.postfixFontWeight = fontWeight;
                this.props.postfixFontSize = fontSize;
                this.props.postfixColor = color;
                this.propChanged(['postfixFont', 'postfixFontWeight', 'postfixFontSize', 'postfixColor']);
            }
        }
    },
    created() {
        this.prefixIconFontSize = this.props.prefixIconFontSize + this.props.prefixIconFontSizeUnit;
    },
    methods: {
        removeLegacyProps() {
            this.props.metricFormatter = null;
            this.propChanged();
        },
        changedConditionStyles(propName, styles) {
            this.props[propName] = styles;
            this.propChanged(propName);
        },
        updateMetricIconRules(metricIconRules) {
            this.props.metricIconRules = metricIconRules;
            this.propChanged('metricIconRules');
        },
        updateIndicatorMetricIcon(indicatorMetricIcon) {
            this.props.indicatorMetricIcon = indicatorMetricIcon;
            this.propChanged('indicatorMetricIcon');
        }
    }
};
</script>
