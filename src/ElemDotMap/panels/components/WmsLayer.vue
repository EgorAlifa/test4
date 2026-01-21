<template>
    <ui-container>
        <ui-input-auto v-model="wmsLayer.server" @change="updateModel">WMS server</ui-input-auto>
        <ui-collapse v-for="(property, idx) in wmsLayer.properties" :key="idx">
            <template #header>
                <div class="d-flex flex-v-center flex-h-space-between">
                    <span>Свойство {{ idx + 1 }}</span>
                    <ui-button class="min-height-18" type="ghost" @click.stop="removeProperty(idx)">
                        <i class="mdi mdi-delete color-red" />
                    </ui-button>
                </div>
            </template>
            <ui-input class="p" v-model="property.key" @change="updateModel">Ключ</ui-input>
            <ui-input v-model="property.value" @change="updateModel">Значение</ui-input>
        </ui-collapse>
        <ui-button @click="addProperty">Добавить свойство</ui-button>
    </ui-container>
</template>

<script>
import { PanelUi } from '@goodt-wcore/components';
import { cloneDeep } from 'lodash';

export default {
    components: { ...PanelUi },
    props: {
        value: { type: Object, required: true }
    },
    data: () => ({
        wmsLayer: null
    }),
    watch: {
        value: {
            handler(value) {
                this.wmsLayer = cloneDeep(value);
            },
            immediate: true
        }
    },
    methods: {
        addProperty() {
            this.wmsLayer.properties.push({ key: '', value: '' });
            this.updateModel();
        },
        removeProperty(idx) {
            this.wmsLayer.properties.splice(idx, 1);
            this.updateModel();
        },
        updateModel() {
            this.$emit('input', this.wmsLayer);
            this.$emit('change');
        }
    }
};
</script>
<style lang="pcss" scoped src="../defaultPanelStyles.pcss" />
