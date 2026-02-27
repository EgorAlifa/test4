<template>
    <w-panel>
        <ui-input prop="accentColor"></ui-input>
        <ui-input prop="maxWaves"></ui-input>
        <ui-input prop="turnSensitivity"></ui-input>
        <ui-input prop="secretEnabled"></ui-input>
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
