<template>
    <ui-panel-container>
        <ui-container>

            <!-- ── Пресеты стилей ──────────────────────────────────────── -->
            <div class="section-label">Пресеты стилей</div>
            <div class="presets-row">
                <button
                    v-for="p in stylePresets"
                    :key="p.label"
                    class="preset-chip"
                    :title="p.label"
                    @click="applyPreset(p)">
                    {{ p.label }}
                </button>
            </div>

            <!-- ── Пагинация ───────────────────────────────────────────── -->
            <div class="section-label">Пагинация</div>

            <ui-switch prop="enablePagination">Включить пагинацию</ui-switch>

            <template v-if="props.enablePagination && (props.orientation === 'vertical' || props.orientation === 'dropdown' || props.orientation === 'burger')">
                <ui-select
                    prop="paginationType"
                    :options="options.paginationTypes"
                    label="Тип пагинации" />

                <ui-input-cp
                    v-if="props.paginationType === 'pages'"
                    prop="paginationActiveColor">
                    Цвет текущего номера
                </ui-input-cp>

                <ui-input
                    prop="itemsPerPage"
                    type="number"
                    :min="1"
                    placeholder="6">
                    Элементов на странице
                </ui-input>
            </template>

            <template v-if="props.enablePagination && (props.orientation === 'dropdown' || props.orientation === 'burger')">
                <ui-select
                    prop="openMode"
                    :options="options.openModes"
                    label="Режим открытия меню" />
            </template>

            <!-- ── Кнопки ─────────────────────────────────────────────── -->
            <div class="section-label">Кнопки</div>

            <ui-select prop="buttonStyle" :options="options.buttonStyles" label="Стиль кнопок" />

            <ui-input-cp prop="buttonBackgroundColor">Фон кнопок</ui-input-cp>

            <ui-input-cp prop="textColor">
                Цвет текста
                <template v-if="overriddenValues.textColor" #hint>
                    <span class="hint-override">⚠ Переопределено: {{ overriddenValues.textColor }}</span>
                </template>
            </ui-input-cp>

            <template v-if="props.highlightActivePage">
                <ui-input-cp prop="activeColor">
                    Цвет активной страницы
                    <template v-if="overriddenValues.activeColor" #hint>
                        <span class="hint-override">⚠ Переопределено: {{ overriddenValues.activeColor }}</span>
                    </template>
                </ui-input-cp>
            </template>

            <ui-switch prop="enableHoverColor">Эффект наведения</ui-switch>

            <ui-input-cp v-if="props.enableHoverColor" prop="hoverColor">
                Цвет при наведении
                <template v-if="overriddenValues.hoverColor" #hint>
                    <span class="hint-override">⚠ Переопределено: {{ overriddenValues.hoverColor }}</span>
                </template>
            </ui-input-cp>

            <!-- ── Фон контейнера ──────────────────────────────────────── -->
            <div class="section-label">Контейнер</div>

            <ui-input-cp prop="backgroundColor">
                Фон контейнера
                <template v-if="overriddenValues.backgroundColor" #hint>
                    <span class="hint-override">⚠ Переопределено: {{ overriddenValues.backgroundColor }}</span>
                </template>
            </ui-input-cp>

            <!-- ── Типографика ─────────────────────────────────────────── -->
            <div class="section-label">Типографика</div>

            <ui-input-units
                col-size="6-12"
                min="0"
                :units="FontSizeFirstPxUnits"
                v-model="fontSizeString"
                @change="saveFontSize">
                Размер шрифта
            </ui-input-units>

            <ui-input prop="fontFamily" placeholder="inherit">Семейство шрифта</ui-input>

            <!-- ── Геометрия ───────────────────────────────────────────── -->
            <div class="section-label">Геометрия</div>

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

            <!-- ── Тени ───────────────────────────────────────────────── -->
            <div class="section-label">Тени</div>

            <ui-input prop="boxShadow" placeholder="0 4px 6px rgba(0,0,0,0.1)">Тень контейнера</ui-input>
            <ui-input prop="buttonShadow" placeholder="0 2px 4px rgba(0,0,0,0.05)">Тень кнопок</ui-input>
            <ui-input prop="menuShadow" placeholder="0 4px 6px rgba(0,0,0,0.1)">Тень меню</ui-input>

            <!-- ── Границы (только dropdown / burger) ─────────────────── -->
            <template v-if="props.orientation === 'dropdown' || props.orientation === 'burger'">
                <div class="section-label">Границы</div>

                <ui-checkbox prop="showMenuBorder">Граница списка</ui-checkbox>
                <ui-input-cp v-if="props.showMenuBorder" prop="menuBorderColor">
                    Цвет границы списка
                </ui-input-cp>

                <ui-checkbox prop="showToggleBorder">Граница кнопки</ui-checkbox>
                <ui-input-cp v-if="props.showToggleBorder" prop="toggleBorderColor">
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

const DEFAULTS = {
    buttonStyle: 'filled',
    activeColor: '#3b82f6',
    hoverColor: '#60a5fa',
    buttonBackgroundColor: '#f3f4f6',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    borderRadius: '0.375rem',
    boxShadow: '',
    buttonShadow: '',
    menuShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    showMenuBorder: true,
    menuBorderColor: '#1f2937',
    showToggleBorder: true,
    toggleBorderColor: '#1f2937'
};

export default {
    extends: Panel,

    data: () => ({
        /** @public */
        $meta: { name: 'Оформление', icon: 'palette-outline' },
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
        },
        stylePresets: [
            {
                label: 'Минимал',
                buttonStyle: 'text',
                buttonBackgroundColor: 'transparent',
                backgroundColor: 'transparent',
                borderRadius: '0.25rem',
                boxShadow: '',
                buttonShadow: '',
                menuShadow: '0 4px 6px rgba(0,0,0,0.1)',
                showMenuBorder: false,
                showToggleBorder: false
            },
            {
                label: 'Заполненный',
                buttonStyle: 'filled',
                buttonBackgroundColor: '#f3f4f6',
                backgroundColor: '#ffffff',
                borderRadius: '0.375rem',
                boxShadow: '',
                buttonShadow: '',
                menuShadow: '0 4px 6px rgba(0,0,0,0.1)',
                showMenuBorder: true,
                showToggleBorder: true
            },
            {
                label: 'Контурный',
                buttonStyle: 'outlined',
                buttonBackgroundColor: 'transparent',
                backgroundColor: 'transparent',
                borderRadius: '0.375rem',
                boxShadow: '',
                buttonShadow: '',
                menuShadow: '0 4px 6px rgba(0,0,0,0.1)',
                showMenuBorder: true,
                showToggleBorder: true
            },
            {
                label: 'Пилюли',
                buttonStyle: 'filled',
                buttonBackgroundColor: '#f3f4f6',
                backgroundColor: '#ffffff',
                borderRadius: '2rem',
                boxShadow: '',
                buttonShadow: '',
                menuShadow: '0 4px 6px rgba(0,0,0,0.1)',
                showMenuBorder: false,
                showToggleBorder: false
            },
            {
                label: 'Карточки',
                buttonStyle: 'filled',
                buttonBackgroundColor: '#ffffff',
                backgroundColor: '#f8fafc',
                borderRadius: '0.5rem',
                boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                buttonShadow: '0 1px 3px rgba(0,0,0,0.1)',
                menuShadow: '0 8px 24px rgba(0,0,0,0.12)',
                showMenuBorder: false,
                showToggleBorder: false
            },
            {
                label: 'Сброс',
                ...DEFAULTS
            }
        ]
    }),

    static: {
        FontSizeFirstPxUnits
    },

    computed: {
        overriddenValues() {
            const customStyles = this.props.customStyles || {};
            const overrides = {};

            Object.keys(customStyles).forEach(key => {
                const css = customStyles[key];
                if (!css || !css.trim()) return;

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
                const fontSize = this.props.fontSize || { size: 0.875, unit: 'rem' };
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
                const padding = this.props.buttonPadding || { size: 0.75, unit: 'rem' };
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
                const gap = this.props.buttonGap || { size: 0.5, unit: 'rem' };
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
        },

        applyPreset(preset) {
            const keys = [
                'buttonStyle', 'buttonBackgroundColor', 'backgroundColor',
                'borderRadius', 'boxShadow', 'buttonShadow', 'menuShadow',
                'showMenuBorder', 'menuBorderColor', 'showToggleBorder', 'toggleBorderColor'
            ];
            keys.forEach(key => {
                if (preset[key] !== undefined) {
                    this.props[key] = preset[key];
                    this.propChanged(key);
                }
            });
        }
    }
};
</script>

<style scoped>
/* ── Section label ────────────────────────────────────────────── */
.section-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #94a3b8;
    margin-top: 10px;
    margin-bottom: 4px;
}

/* ── Preset chips ─────────────────────────────────────────────── */
.presets-row {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    margin-bottom: 6px;
}

.preset-chip {
    padding: 4px 11px;
    border-radius: 20px;
    border: 1.5px solid #e2e8f0;
    background: #fff;
    color: #475569;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: border-color 0.12s, background 0.12s, color 0.12s;
    white-space: nowrap;
}
.preset-chip:hover {
    border-color: #a5b4fc;
    color: #4f6aff;
    background: #f5f7ff;
}
.preset-chip:last-child:hover {
    border-color: #fca5a5;
    color: #dc2626;
    background: #fef2f2;
}

/* ── Override hint ────────────────────────────────────────────── */
.hint-override {
    color: #f59e0b;
    font-size: 0.75rem;
}
</style>
