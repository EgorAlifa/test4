<template>
    <ui-container>
        <ui-button @click="addInfoMetric">Добавить информацию</ui-button>
        <draggable v-model="infoMetrics" v-bind="DEFAULT_DRAG_OPTIONS" @change="updateModel">
            <ui-collapse class="p" v-for="(metric, idx) in infoMetrics" :key="idx">
                <template #header>
                    <div class="d-flex flex-v-center flex-h-space-between">
                        <div class="d-flex flex-v-center text-truncate">
                            <i class="mdi mdi-drag mdi-18px cursor-move drag-handle mar-right-3"></i>
                            <span class="text-truncate">
                                {{ metric.metric || 'Информация ' + (idx + 1) }}
                            </span>
                        </div>
                        <ui-button class="min-height-18" type="ghost" @click.stop="removeInfoMetric(idx)">
                            <i class="mdi mdi-delete color-red"></i>
                        </ui-button>
                    </div>
                </template>
                <ui-select class="p" v-model="metric.metric" :options="dimensionsMetricsOptions" @change="updateModel">
                    Измерение/метрика
                </ui-select>
                <ui-input-cp class="p" v-model="metric.color" @input="updateModel">Цвет</ui-input-cp>
                <ui-switch class="p" v-model="metric.useSum" @change="updateModel">Суммировать метрику</ui-switch>
                <ui-number-format class="p" v-model="metric.format" @change="updateModel">
                    Формат значения
                </ui-number-format>
                <ui-has-two-columns class="p">
                    <template #left>
                        <ui-input v-model="metric.prefix" @change="updateModel">Префикс</ui-input>
                    </template>
                    <template #right>
                        <ui-input v-model="metric.postfix" @change="updateModel">Постфикс</ui-input>
                    </template>
                </ui-has-two-columns>
            </ui-collapse>
        </draggable>
    </ui-container>
</template>

<script>
import { PanelUi } from '@goodt-wcore/components';
import { cloneDeep } from 'lodash';
import draggable from 'vuedraggable';

import { LayerTypesOptions } from '../config';
import { LayerType } from '../../constants';
import { DEFAULT_DRAG_OPTIONS } from '../constants';

export default {
    static: {
        LayerTypesOptions,
        LayerType,
        DEFAULT_DRAG_OPTIONS
    },
    components: { ...PanelUi, draggable },
    props: {
        value: { type: Array, required: true },
        dimensionsMetricsOptions: { type: Array, default: () => [] }
    },
    data: () => ({
        infoMetrics: null
    }),
    watch: {
        value: {
            handler(value) {
                this.infoMetrics = cloneDeep(value);
            },
            immediate: true
        }
    },
    methods: {
        addInfoMetric() {
            this.infoMetrics.push({
                metric: '',
                color: 'black',
                useSum: false,
                format: '',
                prefix: '',
                postfix: ''
            });
            this.updateModel();
        },
        removeInfoMetric(idx) {
            this.infoMetrics.splice(idx, 1);
            this.updateModel();
        },
        updateModel() {
            this.$emit('input', this.infoMetrics);
            this.$emit('change');
        }
    }
};
</script>
<style lang="pcss" scoped src="../defaultPanelStyles.pcss" />
