<template>
    <ui-popup
        :visible="visible"
        v-bind="PopupSettings"
        @update:visible="onUpdateVisible"
        :dialogBody="{ class: $style['unsaved-popup__body'] }">
        <template #body>
            <div class="unsaved-popup__title">Сохранить изменения?</div>
        </template>
        <template #footer>
            <div class="unsaved-popup__caption">Если выйти без сохранения, то изменения не будут внесены</div>
            <div class="unsaved-popup__footer">
              <button class="btn btn-primary" @click="$emit('confirm')">Сохранить</button>
              <button class="btn btn-secondary" @click="$emit('discard')">Не сохранять</button>
            </div>
        </template>
    </ui-popup>
</template>

<script>
import { Popup as UiPopup } from '@goodt-wcore/components';
import { DialogPopupSettings } from '../utils/constants';

export default {
    name: 'UnsavedChangesPopup',
    components: { UiPopup },
    props: {
        visible: {
            type: Boolean,
            default: false
        }
    },
    methods: {
        onUpdateVisible(value) {
            if (value === false) {
                this.$emit('cancel');
            }
        }
    },
    static: {
        PopupSettings: DialogPopupSettings
    },
    implicitCssModule: true
};
</script>

<style src="./styles/unsavedChangesPopup.pcss" lang="pcss" module></style>
