<template>
    <ui-container>
        <ui-has-panel>
            <div class="form-label form-label-small"><slot></slot></div>
            <template #panel>
                <ui-panel :groups="[{ name: 'Настройки подписи', slot: 'label' }]">
                    <template #label>
                        <ui-container>
                            <ui-select :options="dremioOptions" v-model="model.datasetIndex" @change="saveModel">
                                Источник
                            </ui-select>
                            <ui-select :options="metricsOptions" v-model="model.metric" @change="saveModel">
                                Метрика
                            </ui-select>
                            <ui-select
                                :options="AdditionalAxisLabelPositionOptions"
                                v-model="model.position"
                                @change="saveModel">
                                Расположение
                            </ui-select>
                            <ui-input-cp v-model="model.color" @change="saveModel">Цвет</ui-input-cp>
                            <ui-input v-model="model.fontFamily" @change="saveModel">Шрифт</ui-input>
                            <ui-input-units :units="FontSizeFirstPxUnits" v-model="modelFontSize" @change="saveModel">
                                Размер шрифта
                            </ui-input-units>
                            <ui-input v-model="model.textOffset" type="number" @change="saveModel">
                                Отступ от основной подписи
                            </ui-input>
                            <ui-number-format v-model="model.format" @change="saveModel">
                                Числовой формат
                            </ui-number-format>
                            <ui-switch v-model="model.enablePlusValues" @change="saveModel">Отображать с "+"</ui-switch>
                            <ui-has-panel>
                                <div class="form-label form-label-small">Цвета по условию</div>
                                <template #panel>
                                    <ui-panel :groups="[{ name: 'Цвета по условию', slot: 'default' }]">
                                        <ui-container>
                                            <ui-collapse v-for="(condition, index) of model.conditions" :key="index">
                                                <template #header>Условие {{ index + 1 }}</template>
                                                <ui-color-condition
                                                    v-model="model.conditions[index]"
                                                    @input="saveModel"
                                                    @delete="deleteColorCondition(index)"></ui-color-condition>
                                            </ui-collapse>
                                            <ui-button @click="addColorCondition">Добавить условие</ui-button>
                                        </ui-container>
                                    </ui-panel>
                                </template>
                            </ui-has-panel>
                        </ui-container>
                    </template>
                </ui-panel>
            </template>
        </ui-has-panel>
    </ui-container>
</template>

<script>
import { PanelUi } from '@goodt-wcore/components';
import { FontWeightOptions } from '@goodt-wcore/panels';

import UiColorCondition from './ColorCondition.vue';
import { AdditionalAxisLabelFactory, ColorConditionFactory } from '../../utils/constants';
import { AdditionalAxisLabelPositionOptions, FontSizeFirstPxUnits } from '../config';

export default {
    components: { ...PanelUi, UiColorCondition },
    props: {
        value: {
            type: Object,
            default: () => AdditionalAxisLabelFactory()
        },
        dremioOptions: {
            type: Array,
            default: () => []
        },
        metricsOptions: {
            type: Array,
            default: () => []
        }
    },
    data: (vm) => ({
        model: AdditionalAxisLabelFactory(vm.value)
    }),
    computed: {
        modelFontSize: {
            get() {
                const { fontSize } = this.model;
                return `${fontSize}`;
            },
            set(val) {
                const { model } = this;
                model.fontSize = val;
            }
        }
    },
    watch: {
        value: {
            deep: true,
            immediate: true,
            handler() {
                this.model = AdditionalAxisLabelFactory(this.value);
            }
        }
    },
    static: {
        FontWeightOptions,
        AdditionalAxisLabelPositionOptions,
        FontSizeFirstPxUnits
    },
    methods: {
        saveModel() {
            const result = AdditionalAxisLabelFactory(this.model);
            this.$emit('change', result);
            this.$emit('input', result);
        },
        addColorCondition() {
            this.model.conditions.push(ColorConditionFactory());
            this.saveModel();
        },
        deleteColorCondition(index) {
            this.model.conditions.splice(index, 1);
            this.saveModel();
        }
    }
};
</script>
