<template>
    <ui-container>
        <ui-select v-model="model.additional.metric" :options="metricNamesOptions" @change="saveModel">
            Метрика
        </ui-select>
        <ui-input-cp v-model="model.additional.color" @change="saveModel">Цвет</ui-input-cp>
        <ui-has-two-columns>
            <template #left>
                <ui-input v-model="model.additional.fontFamily" @change="saveModel">Шрифт</ui-input>
            </template>
            <template #right>
                <ui-input-units v-model="additionalFontSize" :units="FontSizeFirstPxUnits" @change="saveModel">
                    Размер шрифта
                </ui-input-units>
            </template>
        </ui-has-two-columns>
        <ui-select v-model="model.additional.fontWeight" :options="FontWeightOptions" @change="saveModel">
            Начертание шрифта
        </ui-select>
        <ui-number-format v-model="model.additional.format" @change="saveModel">Формат числа</ui-number-format>

        <ui-select v-model="model.additional.align" :options="LabelAlignOptions" @change="saveModel">
            Горизонтальное выравнивание
        </ui-select>
        <ui-select v-model="model.additional.position" :options="AdditionalLabelPositionOptions" @change="saveModel">
            Расположение
        </ui-select>

        <ui-has-panel>
            <div class="form-label form-label-small">Цвета по условию</div>
            <template #panel>
                <ui-panel :groups="[{ name: 'Цвета по условию', slot: 'default' }]">
                    <ui-container>
                        <ui-collapse v-for="(condition, idx) of model.additional.colorConditions" :key="idx">
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
                                <ui-input-cp v-model="condition.color" @change="saveModel">Цвет</ui-input-cp>
                                <ui-button type="error" @click="deleteColorCondition(idx)">Удалить</ui-button>
                            </ui-container>
                        </ui-collapse>
                        <ui-button @click="addStyleCondition">Добавить условие</ui-button>
                    </ui-container>
                </ui-panel>
            </template>
        </ui-has-panel>
        <ui-input-cp v-model="model.additional.backgroundColor" @change="saveModel">Цвет фона</ui-input-cp>
        <ui-input v-model.number="model.additional.gap" type="number" min="0" @change="saveModel">
            Отступ от основой подписи
        </ui-input>
        <ui-has-two-columns>
            <template #left>
                <ui-input v-model.number="model.additional.padding[2]" type="number" @change="saveModel">
                    Отступ сверху
                </ui-input>
            </template>
            <template #right>
                <ui-input v-model.number="model.additional.padding[0]" type="number" @change="saveModel">
                    Отступ снизу
                </ui-input>
            </template>
        </ui-has-two-columns>
        <ui-has-two-columns>
            <template #left>
                <ui-input v-model.number="model.additional.padding[1]" type="number" @change="saveModel">
                    Отступ справа
                </ui-input>
            </template>
            <template #right>
                <ui-input v-model.number="model.additional.padding[3]" type="number" @change="saveModel">
                    Отступ слева
                </ui-input>
            </template>
        </ui-has-two-columns>
        <ui-has-panel>
            <div class="form-label form-label-small">Префикс/Постфикс</div>
            <template #panel>
                <ui-panel
                    :groups="[
                        { name: 'Префикс', slot: 'prefix' },
                        { name: 'Постфикс', slot: 'postfix' }
                    ]">
                    <template #prefix>
                        <ui-pfix-settings
                            key="prefix"
                            v-model="model.prefix"
                            v-bind="{ condStyleTypes }"
                            @change="saveModel" />
                    </template>
                    <template #postfix>
                        <ui-pfix-settings
                            key="postfix"
                            v-model="model.postfix"
                            v-bind="{ condStyleTypes }"
                            @change="saveModel" />
                    </template>
                </ui-panel>
            </template>
        </ui-has-panel>
        <ui-has-panel>
            <div class="form-label form-label-small">Скругление углов</div>
            <template #panel>
                <ui-has-two-columns>
                    <template #left>
                        <ui-input type="number" v-model.number="model.additional.borderRadius[0]" @change="saveModel">
                            Слева сверху
                        </ui-input>
                    </template>
                    <template #right>
                        <ui-input type="number" v-model.number="model.additional.borderRadius[1]" @change="saveModel">
                            Справа сверху
                        </ui-input>
                    </template>
                </ui-has-two-columns>
                <ui-has-two-columns>
                    <template #left>
                        <ui-input type="number" v-model.number="model.additional.borderRadius[3]" @change="saveModel">
                            Слева снизу
                        </ui-input>
                    </template>
                    <template #right>
                        <ui-input type="number" v-model.number="model.additional.borderRadius[2]" @change="saveModel">
                            Справа снизу
                        </ui-input>
                    </template>
                </ui-has-two-columns>
            </template>
        </ui-has-panel>
    </ui-container>
</template>

<script>
import { cloneDeep, merge } from 'lodash';
import { PanelUi } from '@goodt-wcore/components';
import { FontWeightOptions } from '@goodt-wcore/panels';

import UiPfixSettings from './PfixSettings.vue';
import { AdditionalLabelFactory } from '../../utils/constants';
import { AdditionalLabelPositionOptions, LabelAlignOptions, FontSizeFirstPxUnits } from '../config';

export default {
    components: { ...PanelUi, UiPfixSettings },
    props: {
        value: {
            type: Object,
            default: null
        },
        metricNamesOptions: {
            type: Array,
            default: () => []
        },
        condStyleTypes: {
            type: Array,
            default: () => []
        }
    },
    data: () => ({
        model: null
    }),
    computed: {
        additionalFontSize: {
            get() {
                const {
                    additional: { fontSize }
                } = this.model;
                return `${fontSize}`;
            },
            set(val) {
                const { additional } = this.model;
                additional.fontSize = val;
            }
        }
    },
    static: {
        FontWeightOptions,
        AdditionalLabelPositionOptions,
        LabelAlignOptions,
        FontSizeFirstPxUnits
    },
    created() {
        this.model = merge(AdditionalLabelFactory(), cloneDeep(this.value));
        this.saveModel();
    },
    methods: {
        saveModel() {
            this.$emit('change', this.model);
            this.$emit('input', this.model);
        },
        addStyleCondition() {
            this.model.additional.colorConditions.push({
                comparedValue: null,
                type: null,
                color: null
            });
            this.saveModel();
        },
        deleteColorCondition(idx) {
            this.model.additional.colorConditions.splice(idx, 1);
            this.saveModel();
        }
    }
};
</script>
