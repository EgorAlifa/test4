<template>
    <ui-panel-container>
        <ui-container>
            <ui-select v-if="!props.isSmartSearch" prop="selectedDimension" :options="dimensionsOptions">Измерение</ui-select>

            <template v-if="props.isSmartSearch">
                <div class="d-flex items-end" v-for="(dimension, index) in props.smartSearchDimensions" :key="index">
                    <ui-select
                        class="w-100"
                        v-model="dimension.name"
                        :options="dimensionsOptions"
                        @change="propChanged('smartSearchDimensions')">
                        Измерение
                    </ui-select>

                    <i class="mdi mdi-close mar-left-4 mar-bot-2 cursor-pointer" @click="deleteDimension(dimension.name)"></i>
                </div>

                <ui-button class="w-100" @click="addDimension">Добавить измерение</ui-button>
            </template>

            <ui-select prop="metricNavigateLink" :options="urlFieldOptions">Переход по ссылке</ui-select>

            <ui-switch prop="isOpenedUrlFromNewTab">Открытие в новой вкладке</ui-switch>

            <ui-has-panel>
                <ui-checkbox prop="isMetricDisplayed">Метрика</ui-checkbox>

                <template #panel>
                    <ui-panel :groups="[{ name: 'Настройки метрики', slot: 'metricSettings' }]">
                        <template #metricSettings>
                            <ui-container>
                                <ui-select prop="selectedMetric" :options="metricsOptions">Метрика</ui-select>

                                <ui-input-cp prop="metricOptions.color">Цвет текста</ui-input-cp>

                                <ui-has-two-columns>
                                    <template #left>
                                        <ui-input prop="metricOptions.fontFamily">Шрифт</ui-input>
                                    </template>
                                    <template #right>
                                        <ui-input-units :units="SizeUnits" prop="metricOptions.fontSize">
                                            Размер шрифта
                                        </ui-input-units>
                                    </template>
                                </ui-has-two-columns>

                                <ui-select prop="metricOptions.fontWeight" :options="FontWeightOptions">
                                    Начертание шрифта
                                </ui-select>

                                <ui-input-cp prop="metricOptions.backgroundColor">Цвет фона</ui-input-cp>

                                <ui-select prop="metricOptions.textAlign" :options="AlignOptions">
                                    Выравнивание
                                </ui-select>

                                <ui-number-format prop="metricOptions.format" :value="props.metricOptions.format">
                                    Числовой формат
                                </ui-number-format>
                            </ui-container>
                        </template>
                    </ui-panel>
                </template>
            </ui-has-panel>
        </ui-container>
    </ui-panel-container>
</template>
<script>
import { cloneDeep, isEqual } from 'lodash';
import { Panel } from '@goodt-wcore/panel';
import { usePanelDatasetMixin, PanelDatasetMixinTypes } from '@goodt-common/data';
import { FontWeightOptions } from '@goodt-wcore/panels';
import { AlignOptions, SizeUnits } from '../config';
import { EMPTY_FIELD_URL } from '../constants';
import { PanelInstanceTypeDescriptor } from '../types';
import { normalizeEntityProp } from '../utils';

/**
 * @type {IComponentOptions}
 */
export default {
    extends: Panel,
    mixins: [usePanelDatasetMixin()],
    meta: { name: 'Измерение/Метрика', icon: 'gauge' },
    static: { FontWeightOptions, SizeUnits, AlignOptions },
    computed: {
        dimensionsOptions() {
            return this.dimensions.map((name, index) => ({ label: name, value: index }));
        },
        metricsOptions() {
            return this.metrics.map((name, index) => ({ label: name, value: index }));
        },
        urlFieldOptions() {
            return [EMPTY_FIELD_URL, ...this.dimensionsMetrics];
        }
    },
    created() {
        const { props, dimensions, metrics } = this;
        const clonedProps = cloneDeep(props);
        props.selectedDimension = normalizeEntityProp(props.selectedDimension, dimensions);
        props.selectedMetric = normalizeEntityProp(props.selectedMetric, metrics);
        props.smartSearchDimensions = props.smartSearchDimensions.map((dimension) => ({
            ...dimension,
            name: normalizeEntityProp(dimension.name, dimensions)
        }));

        if (isEqual(props, clonedProps) === false) {
            this.propChanged();
        }
    },
    methods: {
        ...PanelInstanceTypeDescriptor,
        ...PanelDatasetMixinTypes,

        addDimension() {
            this.props.smartSearchDimensions = [...this.props.smartSearchDimensions, { name: null }];
            this.propChanged('smartSearchDimensions');
        },
        deleteDimension(name) {
            this.props.smartSearchDimensions = this.props.smartSearchDimensions.filter(
                ({ name: dimensionName }) => dimensionName !== name
            );
            this.propChanged('smartSearchDimensions');
        }
    }
};
</script>
