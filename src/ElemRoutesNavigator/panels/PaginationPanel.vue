<template>
    <ui-panel-container>
        <ui-container>
            <!-- Включить пагинацию -->
            <ui-switch prop="enablePagination">
                Включить пагинацию
            </ui-switch>

            <!-- Настройки пагинации (только для dropdown/kebab) -->
            <template v-if="props.enablePagination && (props.orientation === 'dropdown' || props.orientation === 'kebab')">
                <div class="form-label form-label-small mt-3">Настройки пагинации</div>

                <ui-input
                    prop="itemsPerPage"
                    type="number"
                    :min="1"
                    placeholder="6">
                    Элементов на странице
                </ui-input>

                <ui-select
                    prop="openMode"
                    :options="options.openModes"
                    label="Режим открытия меню">
                </ui-select>
            </template>

            <!-- Стиль кнопок -->
            <div class="form-label form-label-small mt-3">Стиль кнопок</div>

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

            <ui-input prop="borderRadius" placeholder="0.375rem">Скругление углов</ui-input>

            <ui-input prop="fontFamily" placeholder="inherit">Семейство шрифта</ui-input>
        </ui-container>
    </ui-panel-container>
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

    data: () => ({
        /** @public */
        $meta: { name: 'Настройки пагинации', icon: 'book-open-page-variant-outline' },
        ...PanelInstanceTypeDescriptor,
        options: {
            orientations: ORIENTATION_OPTIONS,
            buttonStyles: BUTTON_STYLE_OPTIONS,
            openModes: [
                { label: 'По клику', value: 'click' },
                { label: 'При наведении', value: 'hover' }
            ]
        }
    }),

    static: {
        FontSizeFirstPxUnits
    },

    computed: {
        fontSizeString: {
            get() {
                const defaultSize = 0.875; // 0.875rem = 14px
                const fontSize = this.props.fontSize || { size: defaultSize, unit: 'rem' };
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
                const defaultSize = 0.75; // 0.75rem = 12px
                const padding = this.props.buttonPadding || { size: defaultSize, unit: 'rem' };
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
                const defaultSize = 0.5; // 0.5rem = 8px
                const gap = this.props.buttonGap || { size: defaultSize, unit: 'rem' };
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
