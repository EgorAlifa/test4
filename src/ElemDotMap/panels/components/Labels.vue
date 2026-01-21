<template>
    <ui-container>
        <ui-button class="p" @click="addLabel">Добавить объект</ui-button>
        <draggable v-model="labels" v-bind="DEFAULT_DRAG_OPTIONS" @change="updateModel">
            <ui-collapse class="p" v-for="(label, idx) in labels" :key="idx">
                <template #header>
                    <div class="d-flex flex-v-center flex-h-space-between">
                        <div class="d-flex flex-v-center text-truncate">
                            <i class="mdi mdi-drag mdi-15px cursor-move drag-handle mar-right-3" />
                            <span class="text-truncate">{{ label.metric || 'Подпись ' + (idx + 1) }}</span>
                        </div>
                        <ui-button class="min-height-18" type="ghost" @click="removeLabel(idx)">
                            <i class="mdi mdi-delete color-red" />
                        </ui-button>
                    </div>
                </template>
                <ui-container>
                    <ui-select v-model="label.metric" :options="dimensionsMetricsOptions" @change="updateModel">
                        Значение
                    </ui-select>
                    <ui-input-cp v-model="label.style.color" @change="updateModel">Цвет значения</ui-input-cp>

                    <ui-has-panel>
                        <span class="form-label form-label-small">Настройки шрифта</span>
                        <template #panel>
                            <ui-panel :groups="[{ slot: 'default', name: 'Настройки шрифта' }]">
                                <ui-has-two-columns class="p">
                                    <template #left>
                                        <ui-input v-model="label.style.fontFamily" @change="updateModel">
                                            Шрифт
                                        </ui-input>
                                    </template>
                                    <template #right>
                                        <ui-input-units
                                            v-model="label.style.fontSize"
                                            :units="SizeUnits"
                                            @change="updateModel">
                                            Размер шрифта
                                        </ui-input-units>
                                    </template>
                                </ui-has-two-columns>
                                <ui-select
                                    v-model="label.style.fontWeight"
                                    :options="FontWeightOptions"
                                    @change="updateModel">
                                    Начертание шрифта
                                </ui-select>
                            </ui-panel>
                        </template>
                    </ui-has-panel>

                    <ui-number-format v-model="label.format" @change="updateModel">Формат подписи</ui-number-format>

                    <ui-has-two-columns>
                        <template #left>
                            <ui-input v-model="label.prefix" @change="updateModel">Префикс</ui-input>
                        </template>
                        <template #right>
                            <ui-input v-model="label.postfix" @change="updateModel">Постфикс</ui-input>
                        </template>
                    </ui-has-two-columns>

                    <ui-has-panel>
                        <span class="form-label form-label-small">Настройки префикса</span>
                        <template #panel>
                            <ui-panel :groups="[{ slot: 'default', name: 'Настройки префикса' }]">
                                <ui-input-cp class="p" v-model="label.prefixStyle.color" @change="updateModel">
                                    Цвет текста
                                </ui-input-cp>
                                <ui-has-two-columns class="p">
                                    <template #left>
                                        <ui-input v-model="label.prefixStyle.fontFamily" @change="updateModel">
                                            Шрифт
                                        </ui-input>
                                    </template>
                                    <template #right>
                                        <ui-input-units
                                            v-model="label.prefixStyle.fontSize"
                                            :units="SizeUnits"
                                            @change="updateModel">
                                            Размер шрифта
                                        </ui-input-units>
                                    </template>
                                </ui-has-two-columns>
                                <ui-select
                                    v-model="label.prefixStyle.fontWeight"
                                    :options="FontWeightOptions"
                                    @change="updateModel">
                                    Начертание шрифта
                                </ui-select>
                            </ui-panel>
                        </template>
                    </ui-has-panel>

                    <ui-has-panel>
                        <span class="form-label form-label-small">Настройки постфикса</span>
                        <template #panel>
                            <ui-panel :groups="[{ slot: 'default', name: 'Настройки постфикса' }]">
                                <ui-input-cp class="p" v-model="label.postfixStyle.color" @change="updateModel">
                                    Цвет текста
                                </ui-input-cp>
                                <ui-has-two-columns class="p">
                                    <template #left>
                                        <ui-input v-model="label.postfixStyle.fontFamily" @change="updateModel">
                                            Шрифт
                                        </ui-input>
                                    </template>
                                    <template #right>
                                        <ui-input-units
                                            v-model="label.postfixStyle.fontSize"
                                            :units="SizeUnits"
                                            @change="updateModel">
                                            Размер шрифта
                                        </ui-input-units>
                                    </template>
                                </ui-has-two-columns>
                                <ui-select
                                    v-model="label.postfixStyle.fontWeight"
                                    :options="FontWeightOptions"
                                    @change="updateModel">
                                    Начертание шрифта
                                </ui-select>
                            </ui-panel>
                        </template>
                    </ui-has-panel>
                </ui-container>
            </ui-collapse>
        </draggable>
    </ui-container>
</template>

<script>
import { SizeUnits, FontWeightOptions } from '@goodt-wcore/panels';
import { PanelUi } from '@goodt-wcore/components';
import draggable from 'vuedraggable';
import { cloneDeep } from 'lodash';

import { DEFAULT_DRAG_OPTIONS } from '../constants';

export default {
    components: { ...PanelUi, draggable },
    static: { SizeUnits, FontWeightOptions, DEFAULT_DRAG_OPTIONS },
    props: {
        value: { type: Array, required: true },
        dimensionsMetricsOptions: { type: Array, default: () => [] }
    },
    data: () => ({
        labels: null
    }),
    watch: {
        value: {
            handler(value) {
                this.labels = cloneDeep(value);
            },
            immediate: true
        }
    },
    methods: {
        addLabel() {
            this.labels.push({
                metric: null,
                style: {
                    color: '#fff',
                    fontFamily: 'Roboto',
                    fontSize: '1rem',
                    fontWeight: null
                },
                format: '',
                prefix: '',
                postfix: '',
                prefixStyle: {
                    color: '#fff',
                    fontFamily: 'Roboto',
                    fontSize: '1rem',
                    fontWeight: null
                },
                postfixStyle: {
                    color: '#fff',
                    fontFamily: 'Roboto',
                    fontSize: '1rem',
                    fontWeight: null
                }
            });
            this.updateModel();
        },
        removeLabel(idx) {
            this.labels.splice(idx, 1);
            this.updateModel();
        },
        updateModel() {
            this.$emit('input', this.labels);
            this.$emit('change');
        }
    }
};
</script>
<style lang="pcss" scoped src="../defaultPanelStyles.pcss" />
