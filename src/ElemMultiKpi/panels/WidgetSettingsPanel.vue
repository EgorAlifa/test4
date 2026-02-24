<template>
    <w-panel>
        <ui-container>
            <ui-has-panel>
                <ui-checkbox prop="showNumberAnimation">Анимация цифр</ui-checkbox>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Анимация', slot: 'animation' }]">
                        <template #animation>
                            <ui-container>
                                <ui-switch prop="shouldCountingNumber" :disabled="props.showEditorNumberAnimation">
                                    Счетчик до числа
                                </ui-switch>

                                <ui-switch prop="showEditorNumberAnimation" :disabled="props.shouldCountingNumber">
                                    Отобразить анимацию
                                </ui-switch>

                                <ui-input prop="numberAnimationDigits" :disabled="props.shouldCountingNumber">
                                    Сколько знаков
                                </ui-input>

                                <ui-input prop="numberAnimationDelay">Задержка в миллисекундах</ui-input>
                            </ui-container>
                        </template>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-switch prop="showCard">Отобразить фон</ui-switch>

            <ui-has-panel>
                <ui-checkbox prop="backgroundGrad">Градиент</ui-checkbox>

                <template #panel>
                    <ui-panel :groups="[{ name: 'Градиент', slot: 'gradient' }]">
                        <template #gradient>
                            <ui-container>
                                <ui-input-cp prop="backgroundGradColor1">Первый цвет</ui-input-cp>

                                <ui-input-cp prop="backgroundGradColor2">Второй цвет</ui-input-cp>

                                <ui-select prop="backgroundGradPos" :options="GradientPositionOptions">
                                    Направление градиента
                                </ui-select>
                            </ui-container>
                        </template>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-input-cp prop="backgroundSimpleColor" :disabled="props.backgroundGrad">Цвет фона</ui-input-cp>

            <ui-switch prop="turnPadding">Убрать отступ</ui-switch>

            <ui-has-panel>
                <ui-checkbox prop="showTitle">Отобразить заголовок</ui-checkbox>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Настройки заголовка', slot: 'titleSettings' }]">
                        <template #titleSettings>
                            <ui-container>
                                <ui-input prop="textTitle" :disabled="props.isEntityNameTitle">Текст</ui-input>

                                <ui-switch prop="isEntityNameTitle">Название Метрики/Измерения</ui-switch>

                                <ui-complex-font v-model="titleSettingsFont"></ui-complex-font>
                            </ui-container>
                        </template>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-has-panel>
                <ui-checkbox prop="showHint">Отобразить подсказку</ui-checkbox>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Настройки подсказки', slot: 'hintSettings' }]">
                        <template #hintSettings>
                            <ui-container>
                                <ui-switch prop="cnpMode">Позиция рядом с метрикой</ui-switch>

                                <ui-switch prop="isHintShownByTitle">Позиция рядом с заголовком</ui-switch>

                                <ui-has-panel>
                                    <ui-checkbox prop="absoluteHint.isEnabled">Точное расположение</ui-checkbox>
                                    <template #panel>
                                        <ui-panel
                                            :groups="[{ name: 'Настройки точного расположения', slot: 'default' }]">
                                            <template #default>
                                                <ui-container>
                                                    <ui-input
                                                        type="number"
                                                        min="0"
                                                        max="100"
                                                        prop="absoluteHint.positionX">
                                                        <template #hint>В процентах</template>
                                                        Смещение по X
                                                    </ui-input>
                                                    <ui-input
                                                        type="number"
                                                        min="0"
                                                        max="100"
                                                        prop="absoluteHint.positionY">
                                                        <template #hint>В процентах</template>
                                                        Смещение по Y
                                                    </ui-input>
                                                </ui-container>
                                            </template>
                                        </ui-panel>
                                    </template>
                                </ui-has-panel>

                                <ui-input prop="textHint">Текст</ui-input>

                                <ui-select prop="positionHint" :options="HintPosition">Расположение</ui-select>

                                <ui-input-cp prop="colorHintText">Цвет текста</ui-input-cp>

                                <ui-input-cp prop="bgColorTooltipHint">Цвет фона</ui-input-cp>

                                <ui-input-units
                                    v-model="sizeHint"
                                    :units="units"
                                    @change="setFontSize('sizeHint', 'sizeUnitHint', ...arguments)">
                                    Размер шрифта
                                </ui-input-units>

                                <ui-input-cp prop="colorHint">Цвет иконки</ui-input-cp>

                                <ui-input-units
                                    v-model="sizeIcon"
                                    :units="units"
                                    @change="setFontSize('sizeIcon', 'sizeUnitIcon', ...arguments)">
                                    Размер иконки
                                </ui-input-units>

                                <ui-input-units
                                    v-model="sizeWidthHint"
                                    :units="units"
                                    @change="setFontSize('sizeWidthHint', 'sizeUnitWidthHint', ...arguments)">
                                    Ширина
                                </ui-input-units>
                            </ui-container>
                        </template>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-has-panel>
                <ui-checkbox prop="defaultDisabled">
                    Только значение из шины
                    <template #hint>
                        Отображение метрики при получении её значения через хранилище.
                        <br />
                        При отсутствии значения в хранилище/при наличии значения, которого нет в
                        <br />
                        источнике данных/при обнулении значения в хранилище - отображается плейсхолдер
                    </template>
                </ui-checkbox>

                <template #panel>
                    <ui-panel :groups="[{ name: 'Настройки значения', slot: 'eventBusValueSettings' }]">
                        <template #eventBusValueSettings>
                            <ui-input prop="defaultDisabledPlaceholder">Плейсхолдер пустого значения</ui-input>
                        </template>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-has-panel>
                <ui-checkbox prop="enablePlaceHolder">
                    Включить плейсхолдер
                    <template #hint>
                        Отображение плейсхолдера, когда источник данных по какой-либо причине пустой
                    </template>
                </ui-checkbox>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Настройки плейсхолдера', slot: 'defaultValueSettings' }]">
                        <template #defaultValueSettings>
                            <ui-container>
                                <ui-input prop="textPlaceHolder">Текст</ui-input>

                                <ui-input-units
                                    v-model="defaultValueFontSize"
                                    :units="units"
                                    @change="
                                        setFontSize('defaultValueFontSize', 'defaultValueFontSizeUnit', ...arguments)
                                    ">
                                    Размер шрифта
                                </ui-input-units>

                                <ui-input-cp prop="defaultValueColor">Цвет</ui-input-cp>
                            </ui-container>
                        </template>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-input prop="varForListen">Событие для обновления виджета</ui-input>

            <ui-switch prop="isViewModeAbsolute">
                Абсолютное позиционирование
                <template #hint>
                    Отображение содержимого через абсолютное позиционирование.
                    <br />
                    При задании ширины и высоты виджета как inherit, и отключения данной настройки - задается
                    относительная позиция,
                    <br />
                    тем самым размер окна виджета определяется его содержимым.
                    <br />
                    Настройка тесно связана с 'Отображением метрики посередине'
                </template>
            </ui-switch>

            <ui-has-panel>
                <ui-checkbox prop="isAwaitVariableMode">Ожидать фильтрацию из хранилища</ui-checkbox>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Параметры ожидания переменных', slot: 'titleSettings' }]">
                        <template #titleSettings>
                            <ui-select
                                v-model="props.awaitVariableModeSettings.variables"
                                :options="awaitModeVariableOptions"
                                multiple
                                @change="propChanged('awaitVariableModeSettings')">
                                Переменные
                            </ui-select>
                        </template>
                    </ui-panel>
                </template>
            </ui-has-panel>
        </ui-container>
    </w-panel>
</template>

<script>
import { Panel } from '@goodt-wcore/panel';
import { SizeUnits, FontWeightOptions } from '@goodt-wcore/panels';
import { createFont } from '@goodt-wcore/panel-ui/utils';

import PanelMixin from './mixins';
import { HintPosition } from './config';

export default {
    extends: Panel,
    mixins: [PanelMixin],

    meta: { name: 'Настройки виджета', icon: 'altimeter' },

    static: {
        FontWeightOptions,
        units: SizeUnits,
        HintPosition,
        GradientPositionOptions: [
            { value: 'to top', label: '↑' },
            { value: 'to left', label: '←' },
            { value: 'to right', label: '→' },
            { value: 'to bottom', label: '↓' },
            { value: 'to top left', label: '↖' },
            { value: 'to top right', label: '↗' },
            { value: 'to bottom right', label: '↘' },
            { value: 'to bottom left', label: '↙' }
        ]
    },
    data() {
        return {
            sizeMarginLeft: '',
            sizeHint: '',
            sizeIcon: '',
            sizeWidthHint: '',
            defaultValueFontSize: ''
        };
    },
    computed: {
        awaitModeVariableOptions() {
            return Object.keys({
                ...this.descriptor.vars,
                ...this.elementInstance?.descriptor.vars
            }).sort();
        },
        titleSettingsFont: {
            get() {
                const { colorTitle, fontTitle, titleFontWeight, sizeTitle, sizeUnitTitle } = this.props;

                return createFont({
                    color: colorTitle,
                    fontSize: typeof sizeTitle === 'string' ? sizeTitle : `${sizeTitle}${sizeUnitTitle}`,
                    fontFamily: fontTitle,
                    fontWeight: titleFontWeight
                });
            },
            set({ color, fontSize, fontFamily, fontWeight }) {
                this.props.fontTitle = fontFamily;
                this.props.titleFontWeight = fontWeight;
                this.props.sizeTitle = fontSize;
                this.props.colorTitle = color;
                this.propChanged(['fontTitle', 'titleFontWeight', 'sizeTitle', 'colorTitle']);
            }
        }
    },
    created() {
        this.sizeMarginLeft = this.props.sizeMarginLeft + this.props.sizeUnitMarginLeft;
        this.sizeHint = this.props.sizeHint + this.props.sizeUnitHint;
        this.sizeIcon = this.props.sizeIcon + this.props.sizeUnitIcon;
        this.sizeWidthHint = this.props.sizeWidthHint + this.props.sizeUnitWidthHint;
        this.defaultValueFontSize = this.props.defaultValueFontSize + this.props.defaultValueFontSizeUnit;
    }
};
</script>
