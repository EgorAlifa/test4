<template>
    <ui-panel-container>
        <ui-button @click="onShowSlot">Содержимое слота</ui-button>
    </ui-panel-container>
</template>
<script>
import { Panel } from '@goodt-wcore/core';
import { PanelInstanceTypeDescriptor } from '../types';

export default {
    extends: Panel,
    meta: { name: 'Панель отладки', icon: 'hammer-wrench' },
    data: () => ({
        ...PanelInstanceTypeDescriptor
    }),
    methods: {
        onShowSlot() {
            this.elementInstance.isBeingPrepared = !this.elementInstance.isBeingPrepared;
        }
    }
};
</script>
