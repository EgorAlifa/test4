<template>
    <w-panel>
        <ui-container>
            <ui-has-panel>
                <ui-checkbox prop="today.withHighlight">Выделять текущую дату</ui-checkbox>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Текущая дата', slot: 'default' }]">
                        <ui-container>
                            <ui-font-settings v-model="props.today" @change="propChanged('today')"></ui-font-settings>
                            <ui-input-cp prop="today.backgroundColor">Цвет фона</ui-input-cp>

                            <ui-gradient-settings
                                v-model="props.today.toneGradient"
                                @change="propChanged('today')"></ui-gradient-settings>

                            <ui-shadow-settings
                                v-model="props.today.shadow"
                                @change="propChanged('today')"></ui-shadow-settings>

                            <ui-border-settings
                                v-model="props.today.border"
                                @change="propChanged('today')"></ui-border-settings>

                            <ui-input-units prop="today.borderRadius" :units="SizeUnits">
                                Скругление углов
                            </ui-input-units>
                        </ui-container>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-has-panel>
                <ui-checkbox prop="isInputMode">Режим строки</ui-checkbox>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Настройка режима строки', slot: 'default' }]">
                        <ui-container>
                            <ui-input prop="inputMode.placeholder">Плейсхолдер</ui-input>

                            <ui-input-cp prop="inputMode.style.color">Цвет плейсхолдера</ui-input-cp>

                            <ui-has-two-columns>
                                <template #left>
                                    <ui-input prop="inputMode.inpStyle['font-family']">Шрифт текста</ui-input>
                                </template>
                                <template #right>
                                    <ui-input-units :units="SizeUnits" prop="inputMode.inpStyle['font-size']">
                                        Размер текста
                                    </ui-input-units>
                                </template>
                            </ui-has-two-columns>

                            <ui-input-cp prop="inputMode.inpStyle.color">Цвет текста</ui-input-cp>

                            <ui-switch prop="inputMode.isResetDate">Отображать "Сброс даты"</ui-switch>

                            <ui-switch prop="isManualDateInput" />
                            <ui-has-panel>
                                <div class="form-label form-label-small u-select-none">Фон</div>
                                <template #panel>
                                    <ui-panel :groups="[{ name: 'Настройки фона', slot: 'default' }]">
                                        <ui-container>
                                            <ui-input-cp prop="inputMode.style.background">Цвет фона</ui-input-cp>

                                            <ui-has-two-columns>
                                                <template #left>
                                                    <ui-input-units :units="SizeUnits" prop="inputMode.style.width">
                                                        Ширина
                                                    </ui-input-units>
                                                </template>
                                                <template #right>
                                                    <ui-input-units :units="SizeUnits" prop="inputMode.style.height">
                                                        Высота
                                                    </ui-input-units>
                                                </template>
                                            </ui-has-two-columns>

                                            <ui-gradient-settings
                                                v-model="props.inputMode.toneGradient"
                                                @change="propChanged('inputMode')"></ui-gradient-settings>
                                        </ui-container>
                                    </ui-panel>
                                </template>
                            </ui-has-panel>

                            <ui-has-panel>
                                <div class="form-label form-label-small u-select-none">Граница</div>
                                <template #panel>
                                    <ui-panel :groups="[{ name: 'Настройки границы', slot: 'default' }]">
                                        <ui-container>
                                            <ui-select :options="BorderStyleOptions" prop="inputMode.style.borderStyle">
                                                Стиль границы
                                            </ui-select>

                                            <ui-has-two-columns>
                                                <template #left>
                                                    <ui-input-units
                                                        :units="BorderWidthUnits"
                                                        prop="inputMode.style.borderWidth">
                                                        Толщина границы
                                                    </ui-input-units>
                                                </template>
                                                <template #right>
                                                    <ui-input-units
                                                        :units="SizeUnits"
                                                        prop="inputMode.style.borderRadius">
                                                        Скругление углов
                                                    </ui-input-units>
                                                </template>
                                            </ui-has-two-columns>

                                            <ui-input-cp prop="inputMode.style.borderColor">Цвет границы</ui-input-cp>
                                        </ui-container>
                                    </ui-panel>
                                </template>
                            </ui-has-panel>

                            <ui-has-panel>
                                <div class="form-label form-label-small u-select-none">Иконка</div>
                                <template #panel>
                                    <ui-panel :groups="[{ name: 'Настройки иконки', slot: 'default' }]">
                                        <ui-container>
                                            <ui-has-two-columns>
                                                <template #left>
                                                    <ui-input prop="inputMode.icon.class">Класс mdi иконки</ui-input>
                                                </template>
                                                <template #right>
                                                    <ui-input-units
                                                        :units="SizeUnits"
                                                        prop="inputMode.icon.style['font-size']">
                                                        Размер иконки
                                                    </ui-input-units>
                                                </template>
                                            </ui-has-two-columns>

                                            <ui-input-cp prop="inputMode.icon.style.color">Цвет иконки</ui-input-cp>
                                        </ui-container>
                                    </ui-panel>
                                </template>
                            </ui-has-panel>
                        </ui-container>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-has-panel>
                <ui-checkbox prop="range.active">Режим выбора диапазона</ui-checkbox>
                <template #panel>
                    <ui-panel
                        :groups="[
                            { name: 'Диапазон', slot: 'range' },
                            { name: 'Пресеты', slot: 'presets' }
                        ]">
                        <template #range>
                            <ui-container>
                                <ui-input-cp prop="range.color">Цвет шрифта</ui-input-cp>
                                <ui-input-cp prop="range.backgroundColor">Цвет заливки</ui-input-cp>
                                <ui-switch prop="range.shouldUseCustomStyle">
                                    <ui-hint>
                                        <template #label>Кастомные стили</template>
                                        Делает фон диапазона сплошным и позволяет применить "Цвет заливки"
                                        <br />
                                        в качестве заливки граничных дат диапазона.
                                    </ui-hint>
                                </ui-switch>
                                <ui-input-cp
                                    prop="range.backgroundRangeLine"
                                    :disabled="!props.range.shouldUseCustomStyle">
                                    Цвет закраски диапазона
                                </ui-input-cp>

                                <ui-switch prop="interval.isUsed">Раздельный ввод дат</ui-switch>
                                <ui-switch prop="isExpandedRange" />
                            </ui-container>
                        </template>
                        <template #presets>
                            <ui-container>
                                <ui-switch prop="enableOffsets">Отобразить пресеты</ui-switch>
                                <ui-switch prop="hardPresets" />
                                <ui-has-panel>
                                    <ui-checkbox prop="presetStyles.isEnabled" :disabled="!props.enableOffsets">
                                        Кастомная настройка пресетов
                                    </ui-checkbox>
                                    <template #panel>
                                        <ui-panel :groups="[{ slot: 'default', name: 'Настройка стилей пресетов' }]">
                                            <ui-container>
                                                <ui-input-cp prop="presetStyles.color">Цвет текста</ui-input-cp>
                                                <ui-input-units prop="presetStyles.fontSize" :units="SizeUnits">
                                                    Размер текста
                                                </ui-input-units>
                                                <ui-input prop="presetStyles.fontFamily">Шрифт текста</ui-input>
                                                <ui-select prop="presetStyles.fontWeight" :options="FontWeightOptions">
                                                    Насыщенность текста
                                                </ui-select>
                                                <ui-input-units prop="presetStyles.width" :units="SizeUnits">
                                                    Ширина кнопки
                                                </ui-input-units>
                                                <ui-input-units prop="presetStyles.height" :units="SizeUnits">
                                                    Высота кнопки
                                                </ui-input-units>
                                                <ui-input-cp prop="presetStyles.background">
                                                    Цвет заливки кнопки
                                                </ui-input-cp>
                                                <ui-input-cp prop="presetStyles.borderColor">
                                                    Цвет рамки кнопки
                                                </ui-input-cp>
                                                <ui-input-units
                                                    prop="presetStyles.borderWidth"
                                                    :units="BorderWidthUnits">
                                                    Толщина рамки
                                                </ui-input-units>
                                                <ui-input-units
                                                    prop="presetStyles.borderRadius"
                                                    :units="BorderWidthUnits">
                                                    Скругление углов рамки
                                                </ui-input-units>
                                                <ui-input-cp prop="presetStyles.activeColor">
                                                    Цвет активного текста
                                                </ui-input-cp>
                                                <ui-input-cp prop="presetStyles.activeBackground">
                                                    Цвет активной заливки
                                                </ui-input-cp>
                                                <ui-select
                                                    prop="presetStyles.position"
                                                    :options="PresetBtnPositionOptions">
                                                    Расположение пресетов
                                                </ui-select>
                                                <ui-select
                                                    prop="presetStyles.orientation"
                                                    :options="PresetBtnOrientationOptions">
                                                    Позиция пресетов
                                                </ui-select>
                                                <ui-input-cp prop="presetStyles.backgroundPreset">
                                                    Цвет фона пресетов
                                                </ui-input-cp>
                                            </ui-container>
                                        </ui-panel>
                                    </template>
                                </ui-has-panel>
                                <ui-has-two-columns v-for="(_, idx) of props.offsets" :key="idx">
                                    <template #left>
                                        <ui-input
                                            type="number"
                                            min="2"
                                            v-model.number="props.offsets[idx]"
                                            @change="propChanged('offsets')"></ui-input>
                                    </template>
                                    <template #right>
                                        <ui-button type="error" @click="deletePreset(idx)">Удалить</ui-button>
                                    </template>
                                </ui-has-two-columns>

                                <ui-button type="primary" @click="addPreset">Добавить пресет</ui-button>
                            </ui-container>
                        </template>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-input v-model.trim="props.popupUrl" @change="propChanged('popupUrl')">Url для открытия попапа</ui-input>

            <ui-input v-model.trim="props.eventName" @change="propChanged('eventName')">
                Событие при выборе даты
            </ui-input>

            <ui-input prop="events.autoRefresh"></ui-input>
            <ui-has-panel>
                <ui-checkbox prop="sqlLikeVarName.isEnable" />
                <template #panel>
                    <ui-panel :groups="[{ name: 'SQL like значение переменной', slot: 'default' }]">
                        <ui-container>
                            <ui-input prop="sqlLikeVarName.varName" />
                        </ui-container>
                    </ui-panel>
                </template>
            </ui-has-panel>
            <ui-has-panel>
                <span class="form-label form-label-small">Ограничения для дат</span>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Ограничения для дат', slot: 'default' }]">
                        <ui-container>
                            <label>
                                Нижняя граница ограничения даты
                                <br />
                                <ui-input-date-picker
                                    class="w-100"
                                    v-model="props.datePickerLimit.limitStart"
                                    @change="propChanged('datePickerLimit.limitStart')"
                                    @clear="propChanged('datePickerLimit.limitStart')"
                                    size="small" />
                            </label>
                            <label>
                                Верхняя граница ограничения даты
                                <br />
                                <ui-input-date-picker
                                    class="w-100"
                                    v-model="props.datePickerLimit.limitEnd"
                                    @change="propChanged('datePickerLimit.limitEnd')"
                                    @clear="propChanged('datePickerLimit.limitStart')"
                                    size="small" />
                            </label>
                        </ui-container>
                    </ui-panel>
                </template>
            </ui-has-panel>
        </ui-container>
    </w-panel>
</template>

<script>
import { Panel } from '@goodt-wcore/panel';
import { SizeUnits, BorderStyleOptions, BorderWidthUnits, FontWeightOptions } from '@goodt-wcore/panels';
import { PresetBtnPositionOptions, PresetBtnOrientationOptions } from './constants';
import { UiFontSettings, UiShadowSettings, UiGradientSettings, UiBorderSettings } from './components';
import { IntervalVars } from '../constants';
import { PanelInstanceTypeDescriptor } from '../types';
import { InputDatePicker as UiInputDatePicker } from 'goodteditor-ui';

export default {
    extends: Panel,
    components: { UiFontSettings, UiShadowSettings, UiGradientSettings, UiBorderSettings, UiInputDatePicker },
    meta: { name: 'Настройки виджета', icon: 'widgets' },
    data() {
        return {
            ...PanelInstanceTypeDescriptor
        };
    },
    static: {
        SizeUnits,
        BorderWidthUnits,
        BorderStyleOptions,
        FontWeightOptions,
        PresetBtnPositionOptions,
        PresetBtnOrientationOptions
    },
    watch: {
        'props.range.active': {
            handler(val) {
                if (val === false) {
                    this.props.enableOffsets = false;
                    this.propChanged('enableOffsets');
                }
            }
        },
        'props.interval.isUsed': {
            handler(val) {
                const action = val === true ? '$set' : '$delete';
                Object.values(IntervalVars).forEach((name) => {
                    this[action](this.descriptor.vars, name, { description: name });
                });
                this.propChanged('varAliases');
            }
        }
    },
    methods: {
        deletePreset(idx) {
            this.props.offsets.splice(idx, 1);
            this.propChanged('offsets');
        },
        addPreset() {
            this.props.offsets.push(0);
            this.propChanged('offsets');
        }
    }
};
</script>
