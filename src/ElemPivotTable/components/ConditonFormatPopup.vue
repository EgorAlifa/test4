<template>
    <ui-popup :visible.sync="isVisible" v-bind="PopupSettings">
        <template #body>
            <div class="settings-popup-body settings-popup-body--bordered">
                <div class="settings-popup-title">Условное форматирование</div>
            </div>
            <div class="settings-popup-body settings-popup-body--bordered">
                <ui-draggable :list="settings" v-bind="DraggableOptions">
                    <div class="settings-popup-condition" v-for="(condition, index) in settings" :key="index">
                        <div class="settings-popup-condition__label">
                            {{ getMetricName(condition.dataAlias) }}
                        </div>
                        <div class="settings-popup-condition__drag drag-handle">
                            <div class="icon"><i class="mdi mdi-drag-vertical"></i></div>
                        </div>
                        <ui-select
                            :options="metricOptions"
                            v-model="settings[index].dataAlias"
                            class="settings-popup-condition__select" />
                        <ui-select
                            class="settings-popup-condition__select settings-popup-condition__select--small"
                            :options="ConditionsOptions"
                            v-model="settings[index].operator"></ui-select>
                        <input
                            type="number"
                            step="0.000001"
                            class="settings-popup-condition__input"
                            v-model="settings[index].value" />

                        <ui-input-color-picker
                            class="settings-popup-condition__color-picker"
                            :append-to-body="false"
                            v-model="settings[index].cellSettings.color">
                            <template #input><span></span></template>
                            <template #icon="{ value, toggle: togglePopover }">
                                <div class="icon" :style="resolveColorStyle(value)" @click="togglePopover">
                                    <i class="mdi mdi-format-text-variant"></i>
                                </div>
                            </template>
                        </ui-input-color-picker>
                        <ui-input-color-picker
                            class="settings-popup-condition__color-picker"
                            :append-to-body="false"
                            v-model="settings[index].cellSettings.backgroundColor">
                            <template #input><span></span></template>
                            <template #icon="{ value, toggle: togglePopover }">
                                <div class="icon" :style="resolveBgStyle(value)" @click="togglePopover">
                                    <i class="mdi mdi-format-color-fill"></i>
                                </div>
                            </template>
                        </ui-input-color-picker>
                        <!-- <div class="icon" :style="resolveBgStyle(condition.backgroundColor)">
                            <i class="mdi mdi-format-color-fill"></i>
                        </div>-->
                        <div
                            class="settings-popup-condition__preview"
                            :style="
                                resolvePreviewStyles(
                                    condition.cellSettings.color,
                                    condition.cellSettings.backgroundColor
                                )
                            ">
                            {{ condition.value }}
                        </div>
                        <button class="settings-popup-condition__remove" @click="onRemove(index)">
                            <span class="icon"><i class="mdi mdi-delete-forever"></i></span>
                        </button>
                        <div class="settings-popup-condition__switch">
                            <div class="settings-popup-control">
                                <label class="settings-popup-control__label">
                                    <div class="settings-popup-control__name">Форматировать итоги</div>
                                    <input
                                        type="checkbox"
                                        class="settings-popup-control__switch"
                                        v-model="settings[index].isFormattingTotal" />
                                </label>
                            </div>
                        </div>
                    </div>
                </ui-draggable>
                <div class="btn btn-primary" @click="addCondition">
                    <div class="icon"><i class="mdi mdi-plus"></i></div>
                    <div class="label">Добавить</div>
                </div>
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
import draggable from 'vuedraggable';
import { Select, Popup, InputColorPicker } from 'goodteditor-ui';
import { ConditionPopupSettings, createCondition } from '../utils/constants';
import { ConditionsOptions, DraggableOptions } from '../utils/config';

export default {
    components: {
        UiPopup: Popup,
        UiDraggable: draggable,
        UiSelect: Select,
        UiInputColorPicker: InputColorPicker
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
        conditions: {
            type: Array,
            default: () => []
        }
    },
    static: {
        PopupSettings: ConditionPopupSettings,
        ConditionsOptions,
        DraggableOptions
    },
    data: (vm) => ({
        isVisible: vm.visible,
        settings: [],
        colorPopoverEl: null,
        colorPopoverColor: '',
        isShownColorPopover: null
    }),
    created() {
        this.updateData();
    },
    computed: {
        colorPopoverBinds() {
            const { colorPopoverEl } = this;
            return {
                appendToBody: false,
                target: colorPopoverEl
            };
        },
        metricOptions() {
            const { valuesSettings } = this;
            return [
                { label: 'Все метрики', value: '' },
                ...valuesSettings.map(({ title: label, dataAlias }) => ({ label, value: dataAlias }))
            ];
        }
    },
    watch: {
        /** .sync modifier supported */
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
        getMetricName(alias) {
            const { metricOptions } = this;
            const findMetric = metricOptions.find(({ value }) => value === alias);
            return findMetric?.label ?? '';
        },
        resolvePreviewStyles(color, bg) {
            const { resolveBgStyle, resolveColorStyle } = this;
            return { ...resolveBgStyle(bg), ...resolveColorStyle(color) };
        },
        resolveBgStyle(color) {
            return {
                backgroundColor: color
            };
        },
        resolveColorStyle(color) {
            return {
                color
            };
        },
        updateData() {
            const { conditions } = this;
            this.settings = conditions.map(createCondition);
        },
        addCondition() {
            this.settings.push(createCondition());
        },
        onSave() {
            const { settings } = this;
            this.$emit('saved', settings.map(createCondition));
            this.isVisible = false;
        },
        onRemove(index) {
            const { settings } = this;
            settings.splice(index, 1);
        }
    },
    implicitCssModule: true
};
</script>

<style src="./styles/settingsPopup.pcss" lang="pcss" module></style>
