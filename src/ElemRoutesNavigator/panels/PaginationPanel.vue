<template>
    <ui-panel-container>
        <ui-container>
            <!-- Включить пагинацию -->
            <ui-switch prop="enablePagination">
                Включить пагинацию
            </ui-switch>

            <!-- Тип пагинации -->
            <template v-if="props.enablePagination && (props.orientation === 'vertical' || props.orientation === 'dropdown' || props.orientation === 'burger')">
                <ui-select
                    prop="paginationType"
                    :options="options.paginationTypes"
                    label="Тип пагинации">
                </ui-select>

                <ui-input-cp
                    v-if="props.paginationType === 'pages'"
                    prop="paginationActiveColor">
                    Цвет активной страницы
                </ui-input-cp>
            </template>

            <!-- Настройки пагинации (для vertical/dropdown/burger) -->
            <template v-if="props.enablePagination && (props.orientation === 'vertical' || props.orientation === 'dropdown' || props.orientation === 'burger')">
                <ui-input
                    prop="itemsPerPage"
                    type="number"
                    :min="1"
                    placeholder="6">
                    Элементов на странице
                </ui-input>
            </template>

            <!-- Режим открытия меню (только для dropdown/burger) -->
            <template v-if="props.enablePagination && (props.orientation === 'dropdown' || props.orientation === 'burger')">
                <ui-select
                    prop="openMode"
                    :options="options.openModes"
                    label="Режим открытия меню">
                </ui-select>
            </template>

            <ui-select prop="buttonStyle" :options="options.buttonStyles" label="Стиль кнопок"></ui-select>

            <ui-checkbox prop="highlightActivePage">Активная страница</ui-checkbox>

            <template v-if="props.highlightActivePage">
                <ui-input-cp prop="activeColor">
                    Цвет активной кнопки
                    <template v-if="overriddenValues.activeColor" #hint>
                        <span :style="{ color: '#f59e0b', fontSize: '0.75rem' }">
                            ⚠️ Переопределено: {{ overriddenValues.activeColor }}
                        </span>
                    </template>
                </ui-input-cp>
            </template>

            <ui-switch prop="enableHoverColor">Цвет при наведении</ui-switch>

            <template v-if="props.enableHoverColor">
                <ui-input-cp prop="hoverColor">
                    Цвет при наведении
                    <template v-if="overriddenValues.hoverColor" #hint>
                        <span :style="{ color: '#f59e0b', fontSize: '0.75rem' }">
                            ⚠️ Переопределено: {{ overriddenValues.hoverColor }}
                        </span>
                    </template>
                </ui-input-cp>
            </template>

            <ui-input-cp prop="buttonBackgroundColor">
                Цвет фона кнопок
            </ui-input-cp>

            <ui-input-cp prop="backgroundColor">
                Фон контейнера
                <template v-if="overriddenValues.backgroundColor" #hint>
                    <span :style="{ color: '#f59e0b', fontSize: '0.75rem' }">
                        ⚠️ Переопределено: {{ overriddenValues.backgroundColor }}
                    </span>
                </template>
            </ui-input-cp>

            <ui-input-cp prop="textColor">
                Цвет текста
                <template v-if="overriddenValues.textColor" #hint>
                    <span :style="{ color: '#f59e0b', fontSize: '0.75rem' }">
                        ⚠️ Переопределено: {{ overriddenValues.textColor }}
                    </span>
                </template>
            </ui-input-cp>

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

            <!-- Тени -->
            <ui-input prop="boxShadow" placeholder="0 4px 6px rgba(0,0,0,0.1)">Тень контейнера</ui-input>
            <ui-input prop="buttonShadow" placeholder="0 2px 4px rgba(0,0,0,0.05)">Тень кнопок</ui-input>
            <ui-input prop="menuShadow" placeholder="0 4px 6px rgba(0,0,0,0.1)">Тень выпадающих меню</ui-input>

            <!-- Границы (только для dropdown/burger) -->
            <template v-if="props.orientation === 'dropdown' || props.orientation === 'burger'">
                <ui-checkbox prop="showMenuBorder">Показывать границу списка</ui-checkbox>

                <ui-input-cp
                    v-if="props.showMenuBorder"
                    prop="menuBorderColor">
                    Цвет границы списка
                </ui-input-cp>

                <ui-checkbox prop="showToggleBorder">Показывать границу кнопки</ui-checkbox>

                <ui-input-cp
                    v-if="props.showToggleBorder"
                    prop="toggleBorderColor">
                    Цвет границы кнопки
                </ui-input-cp>
            </template>
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
            ],
            paginationTypes: [
                { label: 'Прокрутка', value: 'scroll' },
                { label: 'Нумерация страниц', value: 'pages' }
            ]
        }
    }),

    static: {
        FontSizeFirstPxUnits
    },

    computed: {
        // Извлекаем переопределенные значения из customStyles
        overriddenValues() {
            const customStyles = this.props.customStyles || {};
            const overrides = {};

            // Парсим CSS и ищем переопределенные значения
            Object.keys(customStyles).forEach(key => {
                const css = customStyles[key];
                if (!css || !css.trim()) return;

                // Парсим цвета и другие значения
                const colorMatch = css.match(/(?:background-)?color:\s*([^;!]+)/i);
                if (colorMatch) {
                    if (key === 'button' || key === 'container') {
                        const bgMatch = css.match(/background-color:\s*([^;!]+)/i);
                        const textMatch = css.match(/(?:^|;)\s*color:\s*([^;!]+)/i);
                        if (bgMatch) overrides.backgroundColor = bgMatch[1].trim();
                        if (textMatch) overrides.textColor = textMatch[1].trim();
                    }
                    if (key === 'buttonHover') {
                        overrides.hoverColor = colorMatch[1].trim();
                    }
                    if (key === 'buttonActive') {
                        overrides.activeColor = colorMatch[1].trim();
                    }
                }
            });

            return overrides;
        },

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
