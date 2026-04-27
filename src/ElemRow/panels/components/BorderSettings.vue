<template>
    <ui-has-panel>
        <ui-checkbox :prop="`${prop}.isDisplayed`">Отображать границу</ui-checkbox>
        <template #panel>
            <ui-panel :groups="[{ name: 'Настройки границы', slot: 'default' }]">
                <ui-container>
                    <ui-complex-border :prop="`${prop}.borders`" />
                    <ui-complex-border-radius :prop="`${prop}.borderRadius`" :units="SizeUnits" />
                </ui-container>
            </ui-panel>
        </template>
    </ui-has-panel>
</template>
<script>
import { PanelUi } from '@goodt-wcore/components';
import { SizeUnits } from '@goodt-wcore/panels';

export default {
    components: {
        ...PanelUi
    },
    static: {
        SizeUnits
    },
    props: {
        prop: {
            type: String,
            default: ''
        }
    }
};
</script>
