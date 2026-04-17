<template>
    <ui-popup :visible.sync="isVisible" v-bind="PopupSettings">
        <template #body>
            <div class="settings-popup-body settings-popup-body--bordered">
                <div class="settings-popup-title">Формат ячеек</div>
            </div>
            <div class="settings-popup-body settings-popup-body--bordered" v-if="isShownBody">
                <div class="settings-popup-grid settings-popup-grid--2-cols">
                    <div>
                        <div class="settings-popup-body__title">Выберите метрику</div>
                        <ui-select
                            class="settings-popup-body__select"
                            v-model="selectedOptionIndex"
                            :options="metricOptions">
                            Выберите метрику
                        </ui-select>
                    </div>
                    <div>
                        <div class="settings-popup-body__title">Тип метрики</div>
                        <ui-select
                            v-model="settings[selectedOptionIndex].type"
                            class="settings-popup-body__select"
                            :options="NumberFormatTypesOptions"></ui-select>
                    </div>
                    <div>
                        <div class="settings-popup-body__title">Знаков дробной части</div>
                        <input
                            v-model="settings[selectedOptionIndex].digits"
                            class="settings-popup-body__input"
                            type="number"
                            min="0"
                            :max="NUMBER_FORMAT_DIGITS_MAX" />
                    </div>
                    <div>
                        <div class="settings-popup-body__title">Постфикс</div>
                        <input
                            v-model="settings[selectedOptionIndex].unit"
                            class="settings-popup-body__input"
                            type="text" />
                    </div>
                    <div class="settings-popup-grid">
                        <div
                            v-for="{ label, value } in NumberFormatPatternModifierOptions"
                            class="settings-popup-control"
                            :key="value">
                            <label class="settings-popup-control__label">
                                <div class="settings-popup-control__name">
                                    {{ label }}
                                </div>
                                <input
                                    @change="toggleNumberFormatModifier(value)"
                                    :checked="hasNumberFormatModifier(value)"
                                    type="checkbox"
                                    class="settings-popup-control__switch" />
                            </label>
                        </div>
                    </div>
                    <div>
                        <div class="settings-popup-body__title">Выравнивание текста</div>
                        <div class="settings-popup-radio-icons">
                            <div
                                class="settings-popup-radio-icon settings-popup-radio-icons__item"
                                :class="resolveRadioIconClasses(value, settings[selectedOptionIndex].verticalAlign)"
                                v-for="({ label, value }, i) in VerticalAlignsOptions"
                                :key="i"
                                :title="label"
                                @click="onRadioIconClick(value)">
                                <span class="mdi" :class="resolveRadioIconSpanClasses(value)"></span>
                            </div>
                        </div>
                    </div>
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
import { Select } from 'goodteditor-ui';
import { Popup as UiPopup } from '@goodt-wcore/components';
import { NumberFormat, NumberFormatPattern } from '@goodt-common/utils-number';
import {
    FormatPopupSettings,
    NUMBER_FORMAT_DIGITS_MAX,
    createCellSettings,
    VerticalAlignsOptionsIcons
} from '../utils/constants';
import { NumberFormatTypesOptions, NumberFormatPatternModifierOptions, VerticalAlignsOptions } from '../utils/config';

export default {
    components: {
        UiPopup,
        UiSelect: Select
    },
    props: {
        visible: {
            type: Boolean,
            default: false
        },
        valuesSettings: {
            type: Array,
            default: () => []
        }
    },
    static: {
        PopupSettings: FormatPopupSettings,
        NUMBER_FORMAT_DIGITS_MAX,
        NumberFormatTypesOptions,
        NumberFormatPatternModifierOptions,
        VerticalAlignsOptions
    },
    data: (vm) => ({
        isVisible: vm.visible,
        settings: [],
        selectedOptionIndex: 0
    }),
    computed: {
        metrics() {
            return this.valuesSettings.map(({ title }) => title);
        },
        isShownBody() {
            const { settings, selectedOptionIndex } = this;
            return settings.length > 0 && settings[selectedOptionIndex] != null;
        },
        metricOptions() {
            const { metrics } = this;
            return metrics.map((label, value) => ({ label, value }));
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
    created() {
        this.updateData();
    },
    methods: {
        toggleNumberFormatModifier(modifier) {
            const { modifiers } = this.settings[this.selectedOptionIndex];
            const index = modifiers.findIndex((usedModifier) => usedModifier === modifier);
            if (index === -1) {
                modifiers.push(modifier);
                return;
            }
            modifiers.splice(index, 1);
        },
        hasNumberFormatModifier(modifier) {
            const { Modifier } = NumberFormatPattern;
            const { modifiers } = this.settings[this.selectedOptionIndex];
            const hasModifier = modifiers.includes(modifier);
            return Modifier.FIXED === modifier ? !hasModifier : hasModifier;
        },
        resolveRadioIconSpanClasses(value) {
            return {
                [VerticalAlignsOptionsIcons[value]]: true
            };
        },
        resolveRadioIconClasses(value, activeValue) {
            return {
                'settings-popup-radio-icon--active': value === activeValue
            };
        },
        updateData() {
            const { valuesSettings } = this;
            this.selectedOptionIndex = 0;
            this.settings = valuesSettings.map(({ format, ...valueSettings }) => {
                const { pattern, type } = format === '' ? new NumberFormat() : NumberFormat.fromString(format);
                const { digits, unit, modifiers } = pattern;
                return { digits, unit, modifiers, type, ...createCellSettings(valueSettings) };
            });
        },
        onRadioIconClick(value) {
            this.settings[this.selectedOptionIndex].verticalAlign = value;
            if (this.settings[this.selectedOptionIndex].titleSettings != null) {
                this.settings[this.selectedOptionIndex].titleSettings.verticalAlign = value;
            }
        },
        onSave() {
            this.$emit(
                'saved',
                this.settings.map(({ digits, unit, modifiers, type, ...valuesSettings }) =>
                    createCellSettings({
                        ...valuesSettings,
                        format: new NumberFormat({
                            pattern: new NumberFormatPattern({ digits, unit, modifiers }),
                            type
                        }).toString()
                    })
                )
            );
            this.isVisible = false;
        }
    },
    implicitCssModule: true
};
</script>

<style src="./styles/settingsPopup.pcss" lang="pcss" module></style>
