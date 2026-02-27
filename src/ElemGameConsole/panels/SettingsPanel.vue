<template>
    <w-panel>
        <ui-input prop="emulatorJsPath"></ui-input>
        <ui-input prop="accentColor"></ui-input>
    </w-panel>
</template>
<script>
import { Panel } from '@goodt-wcore/panel';
import { PanelInstanceTypeDescriptor } from '../types';

export default {
    extends: Panel,
    meta: { name: 'Настройки', icon: 'cog' },
    data: () => ({
        ...PanelInstanceTypeDescriptor
    })
};
</script>
