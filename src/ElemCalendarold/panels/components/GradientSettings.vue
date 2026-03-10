<template>
    <ui-has-panel>
        <ui-checkbox v-model="model.isUsed" @change="saveModel"><slot>Градиент фона</slot></ui-checkbox>
        <template #panel>
            <ui-panel :groups="[{ name: 'Настройка градиента', slot: 'default' }]">
                <ui-container>
                    <ui-input-cp v-model="model.colors[0]" @change="saveModel">Первый цвет</ui-input-cp>
                    <ui-input-cp v-model="model.colors[1]" @change="saveModel">Второй цвет</ui-input-cp>
                    <ui-select v-model="model.direction" :options="GradientDirectionOptions" @change="saveModel">
                        Направление градиента
                    </ui-select>
                </ui-container>
            </ui-panel>
        </template>
    </ui-has-panel>
</template>

<script>
import { PanelUi } from '@goodt-wcore/components';
import { GradientDirectionOptions } from '../constants';

export default {
    components: { ...PanelUi },
    props: {
        value: {
            type: Object,
            default: null
        }
    },
    static: {
        GradientDirectionOptions
    },
    computed: {
        model() {
            return this.value ?? { isUsed: false, direction: 'to bottom', colors: [null, null] };
        }
    },
    methods: {
        saveModel() {
            this.$emit('input', this.model);
            this.$emit('change', this.model);
        }
    }
};
</script>
