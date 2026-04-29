<template>
    <ui-container>
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
        <ui-select v-model="model.fontWeight" :options="FontWeightOptions" @change="saveModel">
            Начертание шрифта
        </ui-select>
        <ui-input-cp v-model="model.color" @change="saveModel">{{ colorTitle }}</ui-input-cp>
    </ui-container>
</template>

<script>
import { UiContainer, UiHasTwoColumns, UiInput, UiInputCp, UiSelect, UiInputUnits } from '@goodt-wcore/components';
import { SizeUnits, FontWeightOptions } from '@goodt-wcore/panels';

export default {
    components: {
        UiContainer,
        UiHasTwoColumns,
        UiInput,
        UiInputCp,
        UiSelect,
        UiInputUnits
    },
    props: {
        value: {
            type: Object,
            default: null
        },
        colorTitle: {
            type: String,
            default: 'Цвет'
        }
    },
    computed: {
        model() {
            return this.value ?? { fontFamily: '', fontSize: null, fontWeight: null, color: null };
        }
    },
    static: {
        SizeUnits,
        FontWeightOptions: [{ value: null, label: '-' }, ...FontWeightOptions]
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
