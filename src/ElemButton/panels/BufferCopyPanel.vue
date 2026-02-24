<template>
    <w-panel>
        <ui-container>
            <ui-switch prop="isCopyStore" :disabled="props.shouldCopyText" />
            <ui-switch prop="shouldCopyText" :disabled="props.isCopyStore" />
            <div>
                <ui-has-panel autoWidth>
                    <ui-label label-size="small">Текст для копирования</ui-label>
                    <template #panel>
                        <ui-panel :groups="[{ name: 'Текст для копирования', slot: 'default' }]">
                            <ui-textarea resizeBoth class="textarea-panel" prop="textToCopy">{{ '' }}</ui-textarea>
                        </ui-panel>
                    </template>
                </ui-has-panel>
                <ui-textarea prop="textToCopy">{{ '' }}</ui-textarea>
            </div>
        </ui-container>
    </w-panel>
</template>
<script>
import { Panel } from 'goodt-wcore';

/**
 * @typedef {import('./OptionsPanel').TInstance} TInstance
 * @type {TInstance}
 */
const ComponentInstanceTypeDescriptor = undefined;

export default {
    extends: Panel,
    meta: { name: 'Копирование в буфер', icon: 'copyright' },
    data: () => ({
        ...ComponentInstanceTypeDescriptor
    }),
    implicitCssModule: true
};
</script>
<style module lang="pcss">
.textarea-panel {
    min-width: 17rem;
}
</style>
