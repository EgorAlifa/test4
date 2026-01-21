<template>
    <div>
        <ui-has-panel>
            <ui-checkbox v-model="layerManagement.isEnabled" @change="updateModel">Управление слоями</ui-checkbox>
            <template #panel>
                <p>Управление слоями</p>
                <ui-panel
                    :groups="[
                        { slot: 'generalSettings', name: 'Параметры' },
                        { slot: 'sections', name: 'Разделы' }
                    ]">
                    <template #generalSettings>
                        <ui-container>
                            <ui-select
                                v-model="layerManagement.position"
                                :options="LayerControlPositionOptions"
                                @change="updateModel">
                                Расположение на карте
                            </ui-select>
                            <ui-has-two-columns>
                                <template #left>
                                    <ui-input-cp v-model="layerManagement.style.color" @change="updateModel">
                                        Цвет значений
                                    </ui-input-cp>
                                </template>
                                <template #right>
                                    <ui-input-units
                                        v-model="layerManagement.style.fontSize"
                                        :units="SizeUnits"
                                        @change="updateModel">
                                        Размер значений
                                    </ui-input-units>
                                </template>
                            </ui-has-two-columns>
                            <ui-has-two-columns>
                                <template #left>
                                    <ui-input v-model="layerManagement.style.fontFamily" @change="updateModel">
                                        Шрифт значений
                                    </ui-input>
                                </template>
                                <template #right>
                                    <ui-input-units
                                        v-model="layerManagement.style.offset"
                                        :units="SizeUnits"
                                        @change="updateModel">
                                        Отступ значений
                                    </ui-input-units>
                                </template>
                            </ui-has-two-columns>
                            <ui-select
                                v-model="layerManagement.style.textAlign"
                                :options="TextAlignOptions"
                                @change="updateModel">
                                Расположение значений
                            </ui-select>
                            <ui-has-two-columns>
                                <template #left>
                                    <ui-input-cp v-model="layerManagement.style.buttonColor" @change="updateModel">
                                        Цвет кнопок
                                    </ui-input-cp>
                                </template>
                                <template #right>
                                    <ui-input-units
                                        v-model="layerManagement.style.buttonSize"
                                        :units="SizeUnits"
                                        @change="updateModel">
                                        Размер кнопок
                                    </ui-input-units>
                                </template>
                            </ui-has-two-columns>
                            <ui-select
                                v-model="layerManagement.style.direction"
                                :options="DirectionOptions"
                                @change="updateModel">
                                Расположение кнопок
                            </ui-select>
                        </ui-container>
                    </template>
                    <template #sections>
                        <ui-container>
                            <ui-collapse>
                                <template #header>
                                    <span>Базовые слои</span>
                                </template>
                                <ui-container>
                                    <slot name="baseLayer" />
                                    <ui-input v-model="layerManagement.defaultBaseTileLayerName" @change="updateModel">
                                        Название стандартного слоя
                                    </ui-input>
                                    <w-control-layers
                                        v-model="layerManagement.baseLayers"
                                        :layers="TilesOptions"
                                        @change="updateModel" />
                                </ui-container>
                            </ui-collapse>
                            <draggable v-model="overLayers" v-bind="DEFAULT_DRAG_OPTIONS">
                                <ui-collapse class="p" v-for="overLayer in overLayers" :key="overLayer.id">
                                    <template #header>
                                        <div>
                                            <i class="mdi mdi-drag drag-handle cursor-move" />
                                            <span>
                                                {{ overLayer.id === 1 ? 'Дополнительные слои' : 'Маркеры/Кластеры' }}
                                            </span>
                                        </div>
                                    </template>

                                    <w-control-layers
                                        v-if="overLayer.id === 1"
                                        v-model="layerManagement.additionalLayers"
                                        :layers="layers"
                                        @change="updateModel" />
                                    <ui-container v-else>
                                        <ui-switch v-model="layerManagement.markers.isEnabled" @change="updateModel">
                                            Включить слой
                                        </ui-switch>
                                        <ui-input v-model="layerManagement.markers.name" @change="updateModel">
                                            Название слоя
                                        </ui-input>

                                        <ui-select
                                            v-model="currentRuleIndex"
                                            :disabled="rules.length === 0"
                                            :options="rules">
                                            <ui-hint>
                                                <template #label>Условие</template>
                                                Настройка подписей, при включеном свитче "Отображение по условию" на
                                                панели "Настройки точек"
                                            </ui-hint>
                                        </ui-select>
                                        <ui-input
                                            v-if="layerManagement.markers.rules.length > 0"
                                            v-model="layerManagement.markers.rules[currentRuleIndex].name"
                                            @change="updateModel">
                                            Заменить название на:
                                        </ui-input>
                                    </ui-container>
                                </ui-collapse>
                            </draggable>

                            <slot name="pointSwitchLayer" />
                        </ui-container>
                    </template>
                </ui-panel>
            </template>
        </ui-has-panel>
    </div>
</template>

<script>
/* eslint-disable goodt-rules/no-long-prop-chains */
import { PanelUi } from '@goodt-wcore/components';
import { cloneDeep } from 'lodash';
import { SizeUnits } from '@goodt-wcore/panels';
import draggable from 'vuedraggable';

import WControlLayers from './ControlLayers.vue';

import {
    SectionTypeOptions,
    TextAlignOptions,
    LayerControlPositionOptions,
    DirectionOptions,
    TilesOptions
} from '../config';
import { SectionType } from '../../constants';
import { DEFAULT_DRAG_OPTIONS } from '../constants';

export default {
    components: { ...PanelUi, WControlLayers, draggable },
    static: {
        SectionTypeOptions,
        SectionType,
        TextAlignOptions,
        SizeUnits,
        DirectionOptions,
        LayerControlPositionOptions,
        TilesOptions,
        DEFAULT_DRAG_OPTIONS
    },
    props: {
        value: { type: Object, required: true },
        layers: { type: Array, required: true },
        rules: { type: Array, default: () => [] }
    },
    data: () => ({
        layerManagement: null,
        overLayers: [
            { id: 1, label: 'layers' },
            { id: 2, label: 'points' }
        ],
        currentRuleIndex: 0
    }),
    watch: {
        value: {
            handler(value) {
                this.layerManagement = cloneDeep(value);
            },
            immediate: true
        },
        rules: {
            handler(rules) {
                if (rules.length === 0 || rules.length === this.layerManagement.markers.rules.length) {
                    return;
                }
                this.layerManagement.markers.rules = rules.map((rule) => ({ name: rule.label }));
                this.updateModel();
            },
            deep: true,
            immediate: true
        },
        overLayers: {
            handler(overLayers) {
                this.layerManagement.overLayers = overLayers;
                this.updateModel();
            },
            immediate: true
        }
    },
    methods: {
        updateModel() {
            this.$emit('input', this.layerManagement);
            this.$emit('change');
        }
    }
};
</script>
<style lang="pcss" scoped src="../defaultPanelStyles.pcss" />
