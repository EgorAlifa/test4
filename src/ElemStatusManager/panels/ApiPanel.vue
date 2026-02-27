<template>
    <w-panel>
        <ui-container>
            <ui-input-auto prop="taskSettingsApiUrl">task settings 2</ui-input-auto>
        </ui-container>
    </w-panel>
</template>
<script>
import { Panel } from '@goodt-wcore/core';

export default {
    extends: Panel,
    meta: { name: 'Настройки API', icon: 'api' }
};
</script>
