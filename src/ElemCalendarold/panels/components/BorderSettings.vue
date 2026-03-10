<template>
    <ui-container>
        <ui-select v-model="model.borderStyle" :options="BorderStyleOptions" @change="saveModel">
            Стиль границы
        </ui-select>

        <ui-has-two-columns>
            <template #left>
                <ui-input-units v-model="model.borderWidth" :units="SizeUnits" @change="saveModel">
                    Толщина границы
                </ui-input-units>
            </template>
            <template #right>
                <ui-input-cp v-model="model.borderColor" @change="saveModel">Цвет границы</ui-input-cp>
            </template>
        </ui-has-two-columns>
    </ui-container>
</template>

<script>
import { PanelUi } from '@goodt-wcore/components';
import { SizeUnits, BorderStyleOptions } from '@goodt-wcore/panels';

export default {
    components: { ...PanelUi },
    props: {
        value: {
            type: Object,
            default: null
        }
    },
    static: {
        SizeUnits,
        BorderStyleOptions
    },
    computed: {
        model() {
            return this.value ?? {};
        }
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
