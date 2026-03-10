<template>
    <w-panel>
        <ui-container>
            <ui-has-panel>
                <div class="form-label form-label-small u-select-none">Заголовок</div>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Настройки заголовка', slot: 'default' }]">
                        <ui-container>
                            <ui-font-settings v-model="props.header" @change="propChanged('header')"></ui-font-settings>
                            <ui-input-units prop="header.width" :units="SizeUnits">Ширина</ui-input-units>
                            <ui-input-units prop="header.height" :units="SizeUnits">Высота</ui-input-units>
                            <ui-select prop="header.classPosition" :options="AlignClassOptions">
                                Выравнивание заголовка
                            </ui-select>
                            <ui-input-cp prop="header.backgroundColor">Цвет фона</ui-input-cp>
                            <ui-gradient-settings
                                v-model="props.header.toneGradient"
                                @change="propChanged('header')"></ui-gradient-settings>

                            <ui-input-cp prop="header.iBackgroundColor">Цвет фона иконок</ui-input-cp>
                            <ui-gradient-settings v-model="props.header.iconGradient" @change="propChanged('header')">
                                Градиент фона иконок
                            </ui-gradient-settings>

                            <ui-has-panel>
                                <ui-checkbox prop="caption.show">Дополнительный текст</ui-checkbox>
                                <template #panel>
                                    <ui-panel :groups="[{ name: 'Стиль', slot: 'default' }]">
                                        <ui-container>
                                            <ui-input prop="caption.text">Текст</ui-input>

                                            <ui-input-cp prop="caption.style.color">Цвет текста</ui-input-cp>

                                            <ui-has-two-columns>
                                                <template #left>
                                                    <ui-input prop="caption.style.fontFamily">Шрифт</ui-input>
                                                </template>
                                                <template #right>
                                                    <ui-input-units :units="SizeUnits" prop="caption.style.fontSize">
                                                        Размер шрифта
                                                    </ui-input-units>
                                                </template>
                                            </ui-has-two-columns>

                                            <ui-select :options="CaptionPositionOptions" prop="caption.classPosition">
                                                Местоположение
                                            </ui-select>
                                        </ui-container>
                                    </ui-panel>
                                </template>
                            </ui-has-panel>
                        </ui-container>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-has-panel>
                <div class="form-label form-label-small u-select-none">Дни недели</div>
                <template #panel>
                    <ui-panel
                        :groups="[
                            { name: 'Дни недели', slot: 'weekdays' },
                            { name: 'Выходные', slot: 'weekend' }
                        ]">
                        <template #weekdays>
                            <ui-container>
                                <ui-font-settings v-model="props.days" @change="propChanged('days')"></ui-font-settings>
                                <ui-input-cp prop="days.backgroundColor">Цвет фона</ui-input-cp>
                            </ui-container>
                        </template>
                        <template #weekend>
                            <ui-container>
                                <ui-switch prop="days.highlightWeekend">Выделять выходные дни</ui-switch>
                                <ui-input-cp prop="days.weekendColor">Цвет шрифта</ui-input-cp>
                                <ui-has-two-columns>
                                    <template #left><ui-input prop="days.weekendFontFamily">Шрифт</ui-input></template>
                                    <template #right>
                                        <ui-input-units prop="days.weekendFontSize" :units="SizeUnits">
                                            Размер шрифта
                                        </ui-input-units>
                                    </template>
                                </ui-has-two-columns>
                                <ui-select prop="days.weekendFontStyle" :options="FontStyleOptions">
                                    Начертание шрифта
                                </ui-select>
                                <ui-select prop="days.weekendFontWeight" :options="FontWeightOptions">
                                    Плотность шрифта
                                </ui-select>
                            </ui-container>
                        </template>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-has-panel>
                <div class="form-label form-label-small u-select-none">Даты календаря</div>
                <template #panel>
                    <ui-panel
                        :groups="[
                            { name: 'Будние', slot: 'workDates' },
                            { name: 'Выходные', slot: 'weekendDates' }
                        ]">
                        <template #workDates>
                            <ui-container>
                                <ui-font-settings
                                    v-model="props.cellStyle.workDates.font"
                                    @change="propChanged('cellStyle')"></ui-font-settings>
                                <ui-shadow-settings
                                    v-model="props.cellStyle.workDates.shadow"
                                    @change="propChanged('cellStyle')"></ui-shadow-settings>
                                <ui-input-units prop="cellStyle.workDates.borderRadius" :units="SizeUnits">
                                    Скругление углов
                                </ui-input-units>
                            </ui-container>
                        </template>
                        <template #weekendDates>
                            <ui-container>
                                <ui-font-settings
                                    v-model="props.cellStyle.weekendDates.font"
                                    @change="propChanged('cellStyle')"></ui-font-settings>
                                <ui-shadow-settings
                                    v-model="props.cellStyle.weekendDates.shadow"
                                    @change="propChanged('cellStyle')"></ui-shadow-settings>
                                <ui-input-units prop="cellStyle.weekendDates.borderRadius" :units="SizeUnits">
                                    Скругление углов
                                </ui-input-units>
                            </ui-container>
                        </template>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-has-panel>
                <div class="form-label form-label-small u-select-none">Стили ячеек для пресетов</div>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Стили ячеек для пресетов', slot: 'default' }]">
                        <ui-container>
                            <ui-font-settings
                                v-model="props.presetCellStyle.font"
                                @change="propChanged('presetCellStyle')"></ui-font-settings>
                            <ui-shadow-settings
                                v-model="props.presetCellStyle.shadow"
                                @change="propChanged('presetCellStyle')"></ui-shadow-settings>
                            <ui-input-units prop="presetCellStyle.borderRadius" :units="SizeUnits">
                                Скругление углов
                            </ui-input-units>
                        </ui-container>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-has-panel>
                <div class="form-label form-label-small u-select-none">Выбранная дата</div>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Выбранная дата', slot: 'default' }]">
                        <ui-container>
                            <ui-font-settings
                                v-model="props.selectedDate"
                                @change="propChanged('selectedDate')"></ui-font-settings>

                            <ui-input-cp prop="selectedDate.backgroundColor">Цвет фона</ui-input-cp>

                            <ui-gradient-settings
                                v-model="props.selectedDate.toneGradient"
                                @change="propChanged('selectedDate')"></ui-gradient-settings>
                            <ui-shadow-settings
                                v-model="props.selectedDate.shadow"
                                @change="propChanged('selectedDate')"></ui-shadow-settings>
                            <ui-border-settings
                                v-model="props.selectedDate.border"
                                @change="propChanged('selectedDate')"></ui-border-settings>

                            <ui-input-units prop="selectedDate.borderRadius" :units="SizeUnits">
                                Скругление углов
                            </ui-input-units>
                        </ui-container>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-has-panel>
                <div class="form-label form-label-small u-select-none">Не текущий месяц</div>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Дата не текущего месяца', slot: 'default' }]">
                        <ui-container>
                            <ui-font-settings
                                v-model="props.notCurrentMonthDate"
                                @change="propChanged('notCurrentMonthDate')"></ui-font-settings>

                            <ui-switch prop="notCurrentMonthDate.allDates">Применять ко всему календарю</ui-switch>
                        </ui-container>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-has-panel>
                <div class="form-label form-label-small u-select-none">Размеры ячеек и отступы</div>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Настройки размеров и отступов', slot: 'default' }]">
                        <ui-container>
                            <ui-input-units prop="cellHeight" :units="SizeUnits">Высота клетки</ui-input-units>
                            <ui-input-units prop="cellWidth" :units="SizeUnits">Ширина клетки</ui-input-units>
                            <ui-input-units prop="gap.vertical" :units="SizeUnits">Вертикальный отступ</ui-input-units>
                            <ui-input-units prop="gap.horizontal" :units="SizeUnits">
                                Горизонтальный отступ
                            </ui-input-units>
                        </ui-container>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-has-panel>
                <div class="form-label form-label-small u-select-none">Фон</div>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Настройка фона', slot: 'default' }]">
                        <ui-container>
                            <ui-input-cp prop="calendarBackground">Цвет фона</ui-input-cp>
                            <ui-gradient-settings
                                v-model="props.calendarExtra.toneGradient"
                                @change="propChanged('calendarExtra')"></ui-gradient-settings>
                            <ui-shadow-settings
                                v-model="props.calendarExtra.shadow"
                                @change="propChanged('calendarExtra')"></ui-shadow-settings>
                            <ui-border-settings
                                v-model="props.calendarExtra.border"
                                @change="propChanged('calendarExtra')"></ui-border-settings>
                            <ui-input-units prop="calendarExtra.border.borderRadius" :units="SizeUnits">
                                Скругление углов
                            </ui-input-units>
                        </ui-container>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-has-panel>
                <div class="form-label form-label-small u-select-none">Кнопка сброса</div>
                <template #panel>
                    <!-- text: 'Сбросить', enabled: true, color: '' fontSize: '', bgColor: '', width: '', height: '',
                    borderRadius: '', align: 'center', marginTop: '', marginBottom: '' -->

                    <ui-panel :groups="[{ name: 'Настройки', slot: 'default' }]">
                        <ui-container>
                            <ui-checkbox prop="resetBtn.enabled">Показывать кнопку сброса</ui-checkbox>
                            <ui-input prop="resetBtn.text">Текст</ui-input>
                            <ui-input-cp prop="resetBtn.color">Цвет текста</ui-input-cp>
                            <ui-input-cp prop="resetBtn.bgColor">Цвет фона</ui-input-cp>
                            <ui-input-units prop="resetBtn.fontSize" :units="SizeUnits">Размер шрифта</ui-input-units>
                            <ui-input-units prop="resetBtn.width" :units="SizeUnits">Ширина</ui-input-units>
                            <ui-input-units prop="resetBtn.height" :units="SizeUnits">Высота</ui-input-units>
                            <ui-input-units prop="resetBtn.borderRadius" :units="SizeUnits">
                                Скругление углов
                            </ui-input-units>
                            <ui-select prop="resetBtn.align" :options="ResetAlignOptions">Выравнивание</ui-select>
                            <ui-input-units prop="resetBtn.marginInline" :units="SizeUnits">
                                Отступ горизонтальный
                            </ui-input-units>
                            <ui-input-units prop="resetBtn.marginBlock" :units="SizeUnits">
                                Отступ вертикальный
                            </ui-input-units>
                        </ui-container>
                    </ui-panel>
                </template>
            </ui-has-panel>
        </ui-container>
    </w-panel>
</template>

<script>
import { Panel } from '@goodt-wcore/panel';
import { SizeUnits, BorderStyleOptions, FontStyleOptions, FontWeightOptions } from '@goodt-wcore/panels';
import { PanelInstanceTypeDescriptor } from '../types';
import {
    CaptionPositionOptions,
    IndexLocationsOptions,
    IndexPositionOptions,
    MarkPositionOptions,
    AlignClassOptions,
    ResetAlignOptions
} from './constants';
import { UiFontSettings, UiShadowSettings, UiGradientSettings, UiBorderSettings } from './components';

export default {
    extends: Panel,
    components: { UiFontSettings, UiShadowSettings, UiGradientSettings, UiBorderSettings },
    meta: { name: 'Настройки отображения', icon: 'calendar-month' },
    data() {
        return {
            ...PanelInstanceTypeDescriptor
        };
    },

    static: {
        SizeUnits,
        BorderStyleOptions,
        MarkPositionOptions,
        IndexPositionOptions,
        IndexLocationsOptions,
        CaptionPositionOptions,
        FontStyleOptions,
        FontWeightOptions,
        AlignClassOptions,
        ResetAlignOptions
    },
    mounted() {
        const {
            props: { days },
            descriptor: {
                props: {
                    days: { composeDays }
                }
            },
            propChanged
        } = this;

        this.props.days = composeDays(days);
        propChanged('days');
    }
};
</script>