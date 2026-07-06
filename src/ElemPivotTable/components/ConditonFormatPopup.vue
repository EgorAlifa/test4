<template>
    <ui-popup :visible.sync="isVisible" v-bind="PopupSettings">
        <template #body>
            <div class="settings-popup-body settings-popup-body--bordered">
                <div class="settings-popup-title">Условное форматирование</div>
            </div>
            <div class="settings-popup-body settings-popup-body--bordered">
                <w-condition-rules-editor
                    v-model="settings"
                    :values-settings="valuesSettings"
                    :rows-settings="rowsSettings"
                    :columns-settings="columnsSettings"
                    :filters-settings="filtersSettings" />
            </div>
        </template>
        <template #footer="{ close }">
            <div class="settings-popup-body">
                <div class="text-right">
                    <div class="btn btn-primary mar-right-4" @click="onSave">Сохранить</div>
                    <div class="btn btn-outline" @click="close">Отменить</div>
                </div>
            </div>
        </template>
    </ui-popup>
</template>

<script>
import { Popup } from 'goodteditor-ui';
import { ConditionPopupSettings, createCondition } from '../utils/constants';
import ConditionRulesEditor from './ConditionRulesEditor.vue';

export default {
    components: {
        UiPopup: Popup,
        WConditionRulesEditor: ConditionRulesEditor
    },
    props: {
        visible: {
            type: Boolean,
            default: false
        },
        valuesSettings: {
            type: Array,
            default: () => []
        },
        rowsSettings: {
            type: Array,
            default: () => []
        },
        columnsSettings: {
            type: Array,
            default: () => []
        },
        filtersSettings: {
            type: Array,
            default: () => []
        },
        conditions: {
            type: Array,
            default: () => []
        }
    },
    static: {
        PopupSettings: ConditionPopupSettings
    },
    data: (vm) => ({
        isVisible: vm.visible,
        settings: vm.conditions.map(createCondition)
    }),
    watch: {
        visible() {
            this.isVisible = this.visible;
            this.updateData();
        },
        isVisible() {
            this.$emit('update:visible', this.isVisible);
            this.updateData();
        }
    },
    methods: {
        updateData() {
            this.settings = this.conditions.map(createCondition);
        },
        onSave() {
            this.$emit('saved', this.settings.map(createCondition));
            this.isVisible = false;
        }
    },
    implicitCssModule: true
};
</script>

<style src="./styles/settingsPopup.pcss" lang="pcss" module></style>
