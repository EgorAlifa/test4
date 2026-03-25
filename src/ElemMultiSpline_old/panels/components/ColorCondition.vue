<template>
    <ui-container>
        <ui-has-two-columns>
            <template #left>
                <ui-select v-model="model.type" :options="conditionStyleTypes" @change="saveModel">Условие</ui-select>
            </template>
            <template #right>
                <ui-input type="number" v-model="model.comparedValue" @change="saveModel">
                    Сравниваемое значение
                </ui-input>
            </template>
        </ui-has-two-columns>
        <ui-input-cp v-model="model.color" @change="saveModel">Цвет</ui-input-cp>
        <ui-button type="error" @click="$emit('delete')">Удалить</ui-button>
    </ui-container>
</template>

<script>
import { PanelUi } from '@goodt-wcore/components';

import { ColorConditionFactory } from '../../utils/constants';
import { condStyleTypes } from '../../utils';

export default {
    components: { ...PanelUi },
    props: {
        value: {
            type: Object,
            default: () => ColorConditionFactory()
        }
    },
    data: (vm) => ({
        model: ColorConditionFactory(vm.value)
    }),
    computed: {
        conditionStyleTypes() {
            return Object.entries(condStyleTypes).map(([key, val]) => ({ label: val.name, value: key }));
        }
    },
    watch: {
        value: {
            deep: true,
            immediate: true,
            handler() {
                this.model = ColorConditionFactory(this.value);
            }
        }
    },
    methods: {
        saveModel() {
            const result = ColorConditionFactory(this.model);
            this.$emit('change', result);
            this.$emit('input', result);
        }
    }
};
</script>
