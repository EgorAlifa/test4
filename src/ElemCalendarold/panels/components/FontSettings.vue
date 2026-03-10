<template>
    <ui-container>
        <ui-input-cp v-model="model.color" @change="saveModel">Цвет шрифта</ui-input-cp>

        <ui-has-two-columns>
            <template #left>
                <ui-input v-model="model.fontFamily" @change="saveModel">Шрифт</ui-input>
            </template>
            <template #right>
                <ui-input-units v-model="model.fontSize" :units="SizeUnits" @change="saveModel">
                    Размер шрифта
                </ui-input-units>
            </template>
        </ui-has-two-columns>

        <ui-select v-model="model.fontStyle" :options="FontStyleOptions" @change="saveModel">
            Начертание шрифта
        </ui-select>

        <ui-select v-model="model.fontWeight" :options="FontWeightOptions" @change="saveModel">
            Плотность шрифта
        </ui-select>
    </ui-container>
</template>

<script>
import { UiContainer, UiInputCp, UiHasTwoColumns, UiInput, UiInputUnits, UiSelect } from '@goodt-wcore/components';
import { SizeUnits, FontStyleOptions, FontWeightOptions } from '@goodt-wcore/panels';

export default {
    components: { UiContainer, UiInputCp, UiHasTwoColumns, UiInput, UiInputUnits, UiSelect },
    props: {
        value: {
            type: Object,
            default: null
        }
    },
    computed: {
        model() {
            return this.value ?? {};
        }
    },
    static: {
        SizeUnits,
        FontStyleOptions,
        FontWeightOptions
    },
    methods: {
        saveModel() {
            const { model } = this;
            this.$emit('input', model);
            this.$emit('change', model);
        }
    }
};
</script>
