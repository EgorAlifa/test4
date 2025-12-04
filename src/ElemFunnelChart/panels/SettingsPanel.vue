<template>
    <w-panel>
        <ui-container>
            <div style="padding: 20px; color: red; font-size: 18px;">
                ТЕСТ ПАНЕЛИ - ОБНОВЛЕНО!
            </div>
        </ui-container>
    </w-panel>
</template>

<script>
import { Panel } from '@goodt-wcore/panel';

export default {
    extends: Panel,

    meta: { name: 'Настройки виджета', icon: 'widgets' },
    
    created() {
        console.log('SettingsPanel created! - UPDATED');
    },

    data: () => ({})
};
</script>
