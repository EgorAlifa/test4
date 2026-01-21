<template>
    <ui-container>
        <draggable v-model="layers" v-bind="DEFAULT_DRAG_OPTIONS" @change="updateModel">
            <ui-collapse class="p" v-for="(layer, idx) in layers" :key="idx">
                <template #header>
                    <div class="d-flex flex-v-center flex-h-space-between">
                        <div class="d-flex flex-v-center">
                            <i class="mdi mdi-drag mdi-15px cursor-move drag-handle mar-right-3" />
                            <span>Слой {{ idx + 1 }}</span>
                        </div>
                        <ui-button class="min-height-18" type="ghost" @click.stop="removeLayer(idx)">
                            <i class="mdi mdi-delete color-red" />
                        </ui-button>
                    </div>
                </template>
                <ui-container>
                    <ui-select v-model="layer.type" :options="LayerTypesOptions" @change="updateModel">
                        Тип слоя
                    </ui-select>
                    <w-wms-layer v-if="layer.type === LayerType.WMS" v-model="layer.wms" @change="updateModel" />
                    <w-geo-json-layer
                        v-else
                        v-model="layer.geoJson"
                        :is-second-level="isSecondLevel"
                        :second-level-layers="secondLevelLayers"
                        :dimensions-metrics-options="dimensionsMetricsOptions"
                        @change="updateModel" />
                </ui-container>
            </ui-collapse>
        </draggable>
        <ui-button :disabled="isDisabledLevel" @click="addLayer">Добавить слой</ui-button>
    </ui-container>
</template>

<script>
import { PanelUi } from '@goodt-wcore/components';
import { cloneDeep } from 'lodash';
import draggable from 'vuedraggable';

import { LayerTypesOptions } from '../config';
import { LayerType } from '../../constants';
import { DEFAULT_DRAG_OPTIONS } from '../constants';
import WWmsLayer from './WmsLayer.vue';
import WGeoJsonLayer from './GeoJsonLayer.vue';

export default {
    static: { LayerTypesOptions, LayerType, DEFAULT_DRAG_OPTIONS },
    components: { ...PanelUi, draggable, WWmsLayer, WGeoJsonLayer },
    props: {
        value: { type: Array, required: true },
        dimensionsMetricsOptions: { type: Array, default: () => [] },
        secondLevelLayers: { type: Array, default: () => [] },
        isSecondLevel: { type: Boolean, default: false },
        isDisabledLevel: { type: Boolean, default: false }
    },
    data: () => ({
        layers: null
    }),
    watch: {
        value: {
            handler(value) {
                this.layers = cloneDeep(value);
            },
            immediate: true
        }
    },
    methods: {
        addLayer() {
            this.layers.push({
                id: Math.max(0, ...this.layers.map(({ id }) => id)) + 1,
                isSecondLevel: this.isSecondLevel,
                type: LayerType.WMS,
                wms: {
                    properties: [],
                    server: null
                },
                geoJson: {
                    files: [],
                    metricJSON: null,
                    metricFilter: null,
                    drillDownLayer: null,
                    drillDownMetricJSON: null,
                    zoomFrom: null,
                    zoomTo: null,
                    fillColor: '#0000ff',
                    borderWidth: 1,
                    borderColor: '#000000',
                    shouldUseCustomColors: false,
                    colorMetric: null,
                    colorRules: [],
                    gradient: {
                        useGradientColor: false,
                        gradientColorMax: 'rgba(255, 0, 0, 1)',
                        gradientColorMin: 'rgba(0, 255, 0, 1)',
                        gradientSmoothing: 12
                    },
                    legend: {
                        shouldShowLegend: false,
                        title: '',
                        styleTitle: {
                            color: '#000',
                            fontSize: '14px',
                            fontFamily: '',
                            marginBottom: null,
                            textAlign: 'left'
                        },
                        styleValues: {
                            color: '#000',
                            fontSize: '14px',
                            fontFamily: '',
                            padding: null,
                            textAlign: 'left',
                            size: '10px'
                        },
                        format: ''
                    },
                    labels: {
                        isVisible: false,
                        settings: [],
                        shouldShowWhenHover: false
                    },
                    metricEvent: null,
                    path: ''
                }
            });
            this.updateModel();
        },
        removeLayer(idx) {
            this.layers.splice(idx, 1);
            this.updateModel();
        },
        updateModel() {
            this.$emit('input', this.layers);
            this.$emit('change');
        }
    }
};
</script>
<style lang="pcss" scoped src="../defaultPanelStyles.pcss" />
