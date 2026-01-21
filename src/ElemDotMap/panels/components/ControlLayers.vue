<template>
    <ui-container>
        <ui-button class="p" @click="addControlLayer">Добавить слой</ui-button>
        <draggable v-bind="DEFAULT_DRAG_OPTIONS" v-model="controlLayers" @change="updateModel">
            <ui-collapse class="p" v-for="(layer, idx) in controlLayers" :key="idx">
                <template #header>
                    <div class="d-flex flex-v-center flex-h-space-between">
                        <div class="d-flex flex-v-center text-truncate">
                            <i class="mdi mdi-drag mdi-15px cursor-move drag-handle mar-right-3" />
                            <span class="text-truncate">{{ layer.title || 'Слой ' + (idx + 1) }}</span>
                        </div>
                        <ui-button class="min-height-18" type="ghost" @click="removeControlLayer(idx)">
                            <i class="mdi mdi-delete color-red" />
                        </ui-button>
                    </div>
                </template>
                <ui-container>
                    <ui-select v-model="layer.object" :options="layers" @change="updateModel">Объект</ui-select>
                    <ui-input v-model="layer.title" @change="updateModel">Изменить название на:</ui-input>
                </ui-container>
            </ui-collapse>
        </draggable>
    </ui-container>
</template>

<script>
import { PanelUi } from '@goodt-wcore/components';
import draggable from 'vuedraggable';
import { cloneDeep } from 'lodash';

import { SectionTypeOptions } from '../config';
import { SectionType } from '../../constants';
import { DEFAULT_DRAG_OPTIONS } from '../constants';

export default {
    components: { ...PanelUi, draggable },
    static: { SectionTypeOptions, SectionType, DEFAULT_DRAG_OPTIONS },
    props: {
        value: { type: Array, required: true },
        layers: { type: Array, default: () => [] }
    },
    data: () => ({
        controlLayers: null
    }),
    watch: {
        value: {
            handler(value) {
                this.controlLayers = cloneDeep(value);
            },
            immediate: true
        }
    },
    methods: {
        addControlLayer() {
            this.controlLayers.push({
                object: null,
                title: ''
            });
            this.updateModel();
        },
        removeControlLayer(idx) {
            this.controlLayers.splice(idx, 1);
            this.updateModel();
        },
        updateModel() {
            this.$emit('input', this.controlLayers);
            this.$emit('change');
        }
    }
};
</script>
<style lang="pcss" scoped src="../defaultPanelStyles.pcss" />
