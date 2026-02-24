<template>
    <w-panel>
        <ui-container>
            <ui-switch prop="isCopyStore" :disabled="props.shouldCopyText" />

            <ui-switch prop="shouldCopyText" :disabled="props.isCopyStore">
                <template v-if="props.isCopyStore" #hint>
                    Недоступно при включённом «Копировать состояние экрана»
                </template>
            </ui-switch>

            <ui-textarea v-if="props.shouldCopyText" prop="textToCopy">Текст для копирования</ui-textarea>
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
    meta: { name: 'Копирование в буфер', icon: 'content-copy' },
    data: () => ({
        ...ComponentInstanceTypeDescriptor
    }),
};
</script>
