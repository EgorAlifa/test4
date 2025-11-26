<template>
    <w-panel>
        <ui-container>
            <!-- Заголовок -->
            <ui-has-panel>
                <ui-checkbox prop="showTitle">Показывать заголовок</ui-checkbox>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Настройки заголовка', slot: 'title' }]">
                        <template #title>
                            <ui-container>
                                <ui-input prop="title" placeholder="Навигация"></ui-input>
                            </ui-container>
                        </template>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <!-- Источник данных -->
            <div class="form-label form-label-small mt-3">Источник данных</div>

            <ui-input prop="appJsonUrl" placeholder="app.json">Путь к app.json</ui-input>

            <!-- Основные настройки -->
            <div class="form-label form-label-small mt-3">Основные настройки</div>

            <ui-checkbox prop="showIcons">Показывать иконки</ui-checkbox>

            <ui-select prop="orientation" :options="options.orientations" label="Ориентация"></ui-select>

            <ui-select prop="buttonStyle" :options="options.buttonStyles" label="Стиль кнопок"></ui-select>

            <!-- Цвета -->
            <div class="form-label form-label-small mt-3">Цвета</div>

            <ui-input-cp prop="activeColor">Цвет активной кнопки</ui-input-cp>
            <ui-input-cp prop="hoverColor">Цвет при наведении</ui-input-cp>
            <ui-input-cp prop="backgroundColor">Фон контейнера</ui-input-cp>
            <ui-input-cp prop="textColor">Цвет текста</ui-input-cp>

            <!-- Размеры -->
            <div class="form-label form-label-small mt-3">Размеры</div>

            <ui-input-units
                col-size="6-12"
                min="0"
                :units="FontSizeFirstPxUnits"
                v-model="fontSizeString"
                @change="saveFontSize">
                Размер шрифта
            </ui-input-units>

            <ui-input-units
                col-size="6-12"
                min="0"
                :units="FontSizeFirstPxUnits"
                v-model="buttonPaddingString"
                @change="saveButtonPadding">
                Отступ кнопок
            </ui-input-units>

            <ui-input-units
                col-size="6-12"
                min="0"
                :units="FontSizeFirstPxUnits"
                v-model="buttonGapString"
                @change="saveButtonGap">
                Расстояние между кнопками
            </ui-input-units>

            <ui-input prop="borderRadius" placeholder="6px">Скругление углов</ui-input>
        </ui-container>
    </w-panel>
</template>

<script>
import { Panel } from '@goodt-wcore/panel';
import { PanelInstanceTypeDescriptor } from '../types';
import {
    ORIENTATION_OPTIONS,
    BUTTON_STYLE_OPTIONS,
    FontSizeFirstPxUnits
} from '../config';

export default {
    extends: Panel,

    meta: { name: 'Настройки', icon: 'cog' },

    static: {
        FontSizeFirstPxUnits
    },

    data: () => ({
        ...PanelInstanceTypeDescriptor,
        options: {
            orientations: ORIENTATION_OPTIONS,
            buttonStyles: BUTTON_STYLE_OPTIONS
        }
    }),

    computed: {
        fontSizeString: {
            get() {
                const defaultSize = 14; // eslint-disable-line no-magic-numbers
                const fontSize = this.props.fontSize || { size: defaultSize, unit: 'px' };
                return `${fontSize.size}${fontSize.unit}`;
            },
            set(val) {
                if (typeof val === 'string') {
                    const match = val.match(/^(\d+(?:\.\d+)?)(px|rem|em|%)$/);
                    if (match != null) {
                        this.props.fontSize = { size: parseFloat(match[1]), unit: match[2] };
                    }
                } else if (val != null && typeof val === 'object') {
                    this.props.fontSize = val;
                }
            }
        },

        buttonPaddingString: {
            get() {
                const defaultSize = 12; // eslint-disable-line no-magic-numbers
                const padding = this.props.buttonPadding || { size: defaultSize, unit: 'px' };
                return `${padding.size}${padding.unit}`;
            },
            set(val) {
                if (typeof val === 'string') {
                    const match = val.match(/^(\d+(?:\.\d+)?)(px|rem|em|%)$/);
                    if (match != null) {
                        this.props.buttonPadding = { size: parseFloat(match[1]), unit: match[2] };
                    }
                } else if (val != null && typeof val === 'object') {
                    this.props.buttonPadding = val;
                }
            }
        },

        buttonGapString: {
            get() {
                const defaultSize = 8; // eslint-disable-line no-magic-numbers
                const gap = this.props.buttonGap || { size: defaultSize, unit: 'px' };
                return `${gap.size}${gap.unit}`;
            },
            set(val) {
                if (typeof val === 'string') {
                    const match = val.match(/^(\d+(?:\.\d+)?)(px|rem|em|%)$/);
                    if (match != null) {
                        this.props.buttonGap = { size: parseFloat(match[1]), unit: match[2] };
                    }
                } else if (val != null && typeof val === 'object') {
                    this.props.buttonGap = val;
                }
            }
        }
    },

    methods: {
        saveFontSize() {
            this.propChanged('fontSize');
        },

        saveButtonPadding() {
            this.propChanged('buttonPadding');
        },

        saveButtonGap() {
            this.propChanged('buttonGap');
        }
    }
};
</script>
