<template>
    <ui-panel-container>
        <ui-container>
            <ui-select prop="tileLayer.tile" :options="TilesOptions">Базовый слой</ui-select>
            <ui-input prop="tileLayer.url" :disabled="props.tileLayer.tile !== 'url'">URL слоя</ui-input>
            <ui-select prop="layerDataset" :options="datasetOptions">Источник</ui-select>
            <hr />
            <p class="form-label form-label-small">Уровень 1 (доп. слои)</p>
            <w-layers
                v-model="props.layerSettings[0]"
                :second-level-layers="secondLevelLayers"
                :dimensions-metrics-options="dimensionMetricsOptions"
                @change="propChanged('layerSettings')" />
            <hr />
            <ui-switch prop="shouldUseSecondLevel" :disabled="isDisabledSecondLevel">Уровень 2 (доп. слои)</ui-switch>
            <ui-switch
                prop="showPointsOnlyOnSecondLevel"
                :disabled="isDisabledSecondLevel || !props.isDrilldown || !props.shouldUseSecondLevel">
                Точки только на 2 уровне
            </ui-switch>
            <ui-switch prop="hasFilterPointsByRegion" :disabled="isDisabledFilterPoints">Фильтровать точки</ui-switch>
            <w-layers
                v-model="props.layerSettings[1]"
                is-second-level
                :is-disabled-level="isDisabledSecondLevel || !props.shouldUseSecondLevel"
                :dimensions-metrics-options="dimensionMetricsOptions"
                @change="propChanged('layerSettings')" />
            <hr />
            <ui-switch prop="isDrilldown" :disabled="isDisabledSecondLevel || !props.shouldUseSecondLevel">
                Дриллдаун
            </ui-switch>

            <ui-has-panel>
                <ui-checkbox prop="infoPanel.isVisible">Инфо-панель</ui-checkbox>
                <template #panel>
                    <p>Настройки инфо-панели</p>
                    <ui-panel
                        :groups="[
                            { slot: 'firstLevel', name: '1 уровень' },
                            { slot: 'secondLevel', name: '2 уровень' }
                        ]">
                        <template #firstLevel>
                            <ui-container>
                                <ui-input prop="infoPanel.firstLevel.hint">Подсказка для первого уровня</ui-input>
                                <w-info-panel
                                    v-model="props.infoPanel.firstLevel"
                                    :dimensions-metrics-options="dimensionMetricsOptions"
                                    :layers="props.layerSettings[0]"
                                    @change="propChanged('infoPanel')" />
                            </ui-container>
                        </template>
                        <template #secondLevel>
                            <ui-container>
                                <ui-input prop="infoPanel.secondLevel.hint">Подсказка для второго уровня</ui-input>
                                <w-info-panel
                                    v-model="props.infoPanel.secondLevel"
                                    :dimensions-metrics-options="dimensionMetricsOptions"
                                    :layers="props.layerSettings[1]"
                                    @change="propChanged('infoPanel')" />
                            </ui-container>
                        </template>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-has-panel>
                <ui-checkbox prop="defaultStyleInHover.isEnabled">Стили при наведении</ui-checkbox>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Стили при наведении', slot: 'default' }]">
                        <ui-container>
                            <ui-input-cp prop="defaultStyleInHover.fillColor">Цвет заливки</ui-input-cp>
                            <ui-input-cp prop="defaultStyleInHover.color">Цвет границы</ui-input-cp>
                            <ui-input type="number" prop="defaultStyleInHover.weight">Толщина границы</ui-input>
                        </ui-container>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <w-layer-management
                v-model="props.layerManagement"
                :layers="layers"
                :rules="pointsRules"
                @change="propChanged('layerManagement')">
                <template #baseLayer>
                    <ui-switch prop="isBaseLayerVisible">Стандартный слой</ui-switch>
                    <ui-switch prop="isBaseLayerOnBottom">Расположение снизу</ui-switch>
                </template>
                <template #pointSwitchLayer>
                    <ui-switch prop="isDotsOnTop">
                        <ui-hint>
                            <template #label>Точки всегда сверху</template>
                            Настройка позволяет игнорировать логику управления слоями - когда слои и точки накладываются
                            друг на друга в порядке их включения, и выводит точки всегда выше всех слоев.
                        </ui-hint>
                    </ui-switch>
                </template>
            </w-layer-management>
        </ui-container>
    </ui-panel-container>
</template>

<script>
import { Dremio, Panel } from 'goodt-wcore';
import { SizeUnits } from '@goodt-wcore/panels';

import { TilesOptions } from './config';
import { WLayers, WInfoPanel, WLayerManagement } from './components';

const { Query } = Dremio;

export default {
    extends: Panel,
    components: { WLayers, WInfoPanel, WLayerManagement },
    static: { TilesOptions, SizeUnits },
    data() {
        return {
            /** @public */
            $meta: { name: 'Настройка слоев', icon: 'layers-triple-outline' }
        };
    },
    computed: {
        isDisabledFilterPoints() {
            return (
                this.isDisabledSecondLevel ||
                !this.props.showPointsOnlyOnSecondLevel ||
                !this.props.isDrilldown ||
                !this.props.shouldUseSecondLevel
            );
        },
        metrics() {
            const { layerDataset } = this.props;
            const defaultMetric = { label: '-', value: null };
            if (layerDataset == null) {
                return [defaultMetric];
            }

            if (layerDataset === 'main') {
                const { dremio } = this.props;
                if (dremio == null) {
                    return [defaultMetric];
                }

                const metrics = Query.queryMetricNames(dremio.query).map((value) => ({
                    label: value,
                    value
                }));

                return [defaultMetric, ...metrics];
            }

            const { additionalDremio } = this.props;
            if (additionalDremio == null) {
                return [defaultMetric];
            }

            const metrics = Query.queryMetricNames(additionalDremio.query).map((value) => ({
                label: value,
                value
            }));
            return [defaultMetric, ...metrics];
        },
        dimensions() {
            const { layerDataset } = this.props;

            if (layerDataset == null) {
                return [];
            }

            if (layerDataset === 'main') {
                const { dremio } = this.props;
                if (dremio == null) {
                    return [];
                }

                return Object.keys(dremio.dimensionList);
            }

            const { additionalDremio } = this.props;
            if (additionalDremio == null) {
                return [];
            }

            return Object.keys(additionalDremio.dimensionList);
        },
        dimensionMetricsOptions() {
            return [...this.metrics, ...this.dimensions];
        },
        queryHelper() {
            return this.elementInstance ? this.elementInstance.queryHelper : null;
        },
        datasetOptions() {
            const defaultOption = { value: null, label: '-' };
            if (this.queryHelper == null) {
                return [defaultOption];
            }

            const mainDatasetOption = {
                value: 'main',
                label: this.queryHelper.query[Query.KEY.FROM].slice(-1)[0]
            };

            const { additionalDremio } = this.props;
            if (additionalDremio == null) {
                return [defaultOption, mainDatasetOption];
            }

            const additionalDatasetOption = {
                value: '0',
                label:
                    additionalDremio.query[Query.KEY.FROM].slice(-1)[0] === mainDatasetOption.label
                        ? `${additionalDremio.query[Query.KEY.FROM].slice(-1)[0]} - доп источник`
                        : additionalDremio.query[Query.KEY.FROM].slice(-1)[0]
            };

            return [defaultOption, mainDatasetOption, additionalDatasetOption];
        },
        secondLevelLayers() {
            return this.props.layerSettings[1].map(({ id }, idx) => ({ value: id, label: `Слой ${idx + 1}` }));
        },
        isDisabledSecondLevel() {
            return this.props.layerSettings[0].length === 0;
        },
        layers() {
            return this.props.layerSettings.flatMap((layers, index) =>
                layers.map((layer, subIndex) => ({
                    label: `Слой ${index + 1}.${subIndex + 1}`,
                    value: `${index},${layer.id}`
                }))
            );
        },
        pointsRules() {
            const {
                viewByRules: { rules }
            } = this.props.points;

            return rules.map((rule, index) => ({ label: `Условие ${index + 1}`, value: index }));
        }
    },
    created() {
        this.modifyProps();
    },
    methods: {
        modifyProps() {
            const { layerManagement } = this.props;
            if (layerManagement.isBaseLayerVisible == null) {
                layerManagement.isBaseLayerVisible = true;
            }
        }
    }
};
</script>
