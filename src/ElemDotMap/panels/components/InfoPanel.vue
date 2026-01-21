<template>
    <ui-container>
        <ui-button @click="addInfoPanel" inline>Добавить инфо-панель</ui-button>
        <ui-collapse v-for="(panel, idx) in level.panelTemplates" :key="idx">
            <template #header>
                <div class="d-flex flex-v-center flex-h-space-between">
                    <span class="text-truncate">Инфо-панель {{ idx + 1 }}</span>
                    <ui-button class="min-height-18" type="ghost" @click.stop="removeInfoPanel(idx)">
                        <i class="mdi mdi-delete color-red" />
                    </ui-button>
                </div>
            </template>
            <ui-select class="p" v-model="panel.layer" :options="layersOptions" @change="updateModel">Слой</ui-select>
            <ui-input class="p" v-model="panel.metricJSON" @change="updateModel">Идентификатор объекта в слое</ui-input>
            <ui-select class="p" v-model="panel.metricFilter" :options="dimensionsMetricsOptions" @change="updateModel">
                Идентификатор объекта в источнике
            </ui-select>
            <w-info-panel-metrics
                v-model="panel.metrics"
                :dimensions-metrics-options="dimensionsMetricsOptions"
                @change="updateModel" />
        </ui-collapse>
    </ui-container>
</template>

<script>
import { PanelUi } from '@goodt-wcore/components';
import { cloneDeep } from 'lodash';

import { LayerTypesOptions } from '../config';
import { LayerType } from '../../constants';
import WInfoPanelMetrics from './InfoPanelMetrics.vue';

export default {
    static: {
        LayerTypesOptions,
        LayerType
    },
    components: { ...PanelUi, WInfoPanelMetrics },
    props: {
        value: { type: Object, required: true },
        dimensionsMetricsOptions: { type: Array, default: () => [] },
        layers: { type: Array, default: () => [] }
    },
    data: () => ({
        level: null
    }),
    computed: {
        layersOptions() {
            return this.layers.map(({ id }, idx) => ({ value: id, label: `Слой ${idx + 1}` }));
        }
    },
    watch: {
        value: {
            handler(value) {
                this.level = cloneDeep(value);
            },
            immediate: true
        }
    },
    methods: {
        addInfoPanel() {
            this.level.panelTemplates.push({
                layer: null,
                metricJSON: null,
                metricFilter: null,
                metrics: []
            });
            this.updateModel();
        },
        removeInfoPanel(idx) {
            this.level.panelTemplates.splice(idx, 1);
            this.updateModel();
        },
        updateModel() {
            this.$emit('input', this.level);
            this.$emit('change');
        }
    }
};
</script>
<style lang="pcss" scoped src="../defaultPanelStyles.pcss" />
