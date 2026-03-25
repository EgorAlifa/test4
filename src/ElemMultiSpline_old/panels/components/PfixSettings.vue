<template>
    <ui-container>
        <ui-input v-model="model.value" @change="saveModel">Значение</ui-input>
        <ui-input v-model.number="model.offset" type="number" min="0" @change="saveModel">Отступ</ui-input>
        <ui-input-cp v-model="model.color" @change="saveModel">Цвет</ui-input-cp>
        <ui-has-two-columns>
            <template #left>
                <ui-input v-model="model.fontFamily" @change="saveModel">Шрифт</ui-input>
            </template>
            <template #right>
                <ui-input-units v-model="modelFontSize" :units="FontSizeFirstPxUnits" @change="saveModel">
                    Размер шрифта
                </ui-input-units>
            </template>
        </ui-has-two-columns>
        <ui-select v-model="model.fontWeight" :options="FontWeightOptions" @change="saveModel">
            Начертание шрифта
        </ui-select>
        <ui-has-panel>
            <div class="form-label form-label-small">Значение по условию</div>
            <template #panel>
                <ui-panel :groups="[{ name: 'Значение по условию', slot: 'default' }]">
                    <ui-container>
                        <ui-collapse v-for="(condition, idx) of model.valueConditions" :key="idx">
                            <template #header>Условие {{ idx + 1 }}</template>
                            <ui-container>
                                <ui-has-two-columns>
                                    <template #left>
                                        <ui-select
                                            v-model="condition.type"
                                            :options="condStyleTypes"
                                            @change="saveModel">
                                            Условие
                                        </ui-select>
                                    </template>
                                    <template #right>
                                        <ui-input
                                            type="number"
                                            v-model.number="condition.comparedValue"
                                            :disabled="condition.type === 'ALL'"
                                            @change="saveModel">
                                            Сравниваемое значение
                                        </ui-input>
                                    </template>
                                </ui-has-two-columns>
                                <ui-input v-model="condition.displayedValue" @change="saveModel">
                                    Отображаемое значение
                                </ui-input>
                                <ui-button type="error" @click="deleteValueCondition(idx)">Удалить</ui-button>
                            </ui-container>
                        </ui-collapse>
                        <ui-button @click="addValueCondition">Добавить условие</ui-button>
                    </ui-container>
                </ui-panel>
            </template>
        </ui-has-panel>
    </ui-container>
</template>

<script>
import { cloneDeep } from 'lodash';
import { PanelUi } from '@goodt-wcore/components';
import { FontWeightOptions } from '@goodt-wcore/panels';

import { AdditionalLabelPrefixFactory } from '../../utils/constants';
import { FontSizeFirstPxUnits } from '../config';

export default {
    components: { ...PanelUi },
    props: {
        value: {
            type: Object,
            default: null
        },
        condStyleTypes: {
            type: Array,
            default: () => []
        }
    },
    data: () => ({
        model: null
    }),
    static: {
        FontWeightOptions,
        FontSizeFirstPxUnits
    },
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
    created() {
        this.model = cloneDeep(this.value) ?? AdditionalLabelPrefixFactory();
        this.saveModel();
    },
    methods: {
        saveModel() {
            this.$emit('change', this.model);
            this.$emit('input', this.model);
        },
        addValueCondition() {
            this.model.valueConditions.push({
                type: null,
                comparedValue: null,
                displayedValue: null
            });
            this.saveModel();
        },
        deleteValueCondition(idx) {
            this.model.valueConditions.splice(idx, 1);
            this.saveModel();
        }
    }
};
</script>
