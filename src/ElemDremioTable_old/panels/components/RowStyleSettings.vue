<template>
    <ui-panel :groups="[{ name: 'Настройки стилей', slot: 'settings' }]">
        <template #settings>
            <ui-input-cp class="p" v-model="internalSettings.color" @change="onChange">Цвет шрифта</ui-input-cp>
            <ui-input-cp class="p" v-model="internalSettings.backgroundColor" @change="onChange">
                Цвет заливки
            </ui-input-cp>
            <ui-select class="p" v-model="internalSettings.fontWeight" :options="FontWeightOptions" @change="onChange">
                Толщина шрифта
            </ui-select>
            <ui-input
                type="number"
                min="0"
                step="100"
                v-model.number="internalSettings.transitionDuration"
                @change="onChange">
                Длительность анимации (мс)
            </ui-input>
        </template>
    </ui-panel>
</template>

<script>
import { PanelUi } from '@goodt-wcore/components';
import { FontWeightOptions } from '@goodt-wcore/panels';

export default {
    components: { ...PanelUi },
    props: {
        propName: {
            type: String,
            default: ''
        },
        propSettings: {
            type: Object,
            default: () => ({})
        }
    },
    data: () => ({ internalSettings: null }),
    static: { FontWeightOptions },
    watch: {
        propName: {
            handler() {
                this.internalSettings = { ...this.propSettings };
            },
            immediate: true
        }
    },
    methods: {
        onChange() {
            this.$emit('change', this.propName, this.internalSettings);
        }
    }
};
</script>
