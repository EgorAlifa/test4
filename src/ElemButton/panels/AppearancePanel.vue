<template>
    <w-panel>
        <ui-container>

            <!-- ── Стиль ──────────────────────────────────────────────── -->
            <ui-select v-model="stylePreset" :options="styleOptions">Стиль</ui-select>

            <!-- ── Цвета ──────────────────────────────────────────────── -->
            <ui-input-cp prop="btnBg">Фон кнопки</ui-input-cp>
            <ui-input-cp prop="btnColor">Цвет текста</ui-input-cp>

            <!-- ── Форма ───────────────────────────────────────────────── -->
            <ui-select v-model="radiusPreset" :options="radiusOptions">Скругление углов</ui-select>

            <!-- ── Размер ──────────────────────────────────────────────── -->
            <ui-select v-model="sizePreset" :options="sizeOptions">Размер</ui-select>

            <!-- ── Тень ───────────────────────────────────────────────── -->
            <ui-select v-model="shadowPreset" :options="shadowOptions">Тень</ui-select>

            <!-- ── Рамка ──────────────────────────────────────────────── -->
            <ui-switch v-model="hasBorder">Рамка</ui-switch>
            <ui-input-cp v-if="hasBorder" prop="btnBorderColor">Цвет рамки</ui-input-cp>

            <!-- ── Свой CSS ────────────────────────────────────────────── -->
            <div class="css-section">
                <div class="css-section__header">
                    <span class="form-label form-label-small">CSS кнопки</span>
                    <code class="css-section__tag">.elem-btn</code>
                </div>
                <textarea
                    v-model="localBtnCss"
                    class="css-section__textarea"
                    spellcheck="false"
                    placeholder="color: red; border: 2px dashed blue;"
                    @input="onBtnCssChange"
                />
            </div>

            <div class="css-section">
                <div class="css-section__header">
                    <span class="form-label form-label-small">CSS при наведении</span>
                    <code class="css-section__tag">.elem-btn:hover</code>
                </div>
                <textarea
                    v-model="localHoverCss"
                    class="css-section__textarea"
                    spellcheck="false"
                    placeholder="opacity: 0.85; transform: scale(1.02);"
                    @input="onHoverCssChange"
                />
            </div>

            <!-- ── Сброс ───────────────────────────────────────────────── -->
            <ui-button type="ghost" @click="resetAll">Сбросить оформление</ui-button>

        </ui-container>
    </w-panel>
</template>

<script>
import { Panel } from 'goodt-wcore';

/**
 * @typedef {import('./OptionsPanel').TInstance} TInstance
 * @type {TInstance}
 */
const ComponentInstanceTypeDescriptor = undefined;

const DEFAULTS = {
    btnBg: '#4f6aff',
    btnColor: '#ffffff',
    btnBorderRadius: '8px',
    btnFontSize: '14px',
    btnFontWeight: '500',
    btnPaddingV: '10px',
    btnPaddingH: '20px',
    btnShadow: '0 2px 12px rgba(79,106,255,0.3), 0 1px 3px rgba(0,0,0,0.1)',
    btnBorderWidth: '0px',
    btnBorderColor: 'transparent'
};

const SHADOWS = {
    none: '',
    sm: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.06)',
    md: '0 2px 12px rgba(79,106,255,0.3), 0 1px 3px rgba(0,0,0,0.1)',
    lg: '0 8px 24px rgba(79,106,255,0.4), 0 3px 8px rgba(0,0,0,0.15)'
};

const SIZES = {
    sm: { btnFontSize: '12px', btnFontWeight: '500', btnPaddingV: '6px',  btnPaddingH: '14px' },
    md: { btnFontSize: '14px', btnFontWeight: '500', btnPaddingV: '10px', btnPaddingH: '20px' },
    lg: { btnFontSize: '16px', btnFontWeight: '600', btnPaddingV: '14px', btnPaddingH: '28px' }
};

export default {
    extends: Panel,
    meta: { name: 'Оформление', icon: 'palette' },
    data: () => ({
        ...ComponentInstanceTypeDescriptor,
        localBtnCss: '',
        localHoverCss: '',
        debounceTimer: null,
        styleOptions: [
            { label: 'Заливка',     value: 'filled'   },
            { label: 'С обводкой', value: 'outlined' },
            { label: 'Прозрачная', value: 'ghost'    }
        ],
        radiusOptions: [
            { label: 'Острые',       value: '0px'   },
            { label: 'Скруглённые', value: '8px'   },
            { label: 'Пилюля',      value: '999px' }
        ],
        sizeOptions: [
            { label: 'Маленький', value: 'sm' },
            { label: 'Средний',   value: 'md' },
            { label: 'Большой',   value: 'lg' }
        ],
        shadowOptions: [
            { label: 'Нет',      value: 'none' },
            { label: 'Лёгкая',   value: 'sm'   },
            { label: 'Средняя',  value: 'md'   },
            { label: 'Объёмная', value: 'lg'   }
        ]
    }),
    computed: {
        stylePreset: {
            get() {
                const { btnBg, btnBorderWidth } = this.props;
                const isTransparent = !btnBg || btnBg === 'transparent';
                const hasBorder = btnBorderWidth && btnBorderWidth !== '0px';
                if (isTransparent && hasBorder) return 'outlined';
                if (isTransparent) return 'ghost';
                return 'filled';
            },
            set(val) {
                const presets = {
                    filled:   { btnBg: '#4f6aff', btnColor: '#ffffff', btnBorderWidth: '0px',  btnBorderColor: 'transparent' },
                    outlined: { btnBg: 'transparent', btnColor: '#4f6aff', btnBorderWidth: '1px', btnBorderColor: '#4f6aff'    },
                    ghost:    { btnBg: 'transparent', btnColor: '#4f6aff', btnBorderWidth: '0px',  btnBorderColor: 'transparent' }
                };
                const p = presets[val];
                if (!p) return;
                Object.entries(p).forEach(([key, value]) => {
                    this.props[key] = value;
                    this.propChanged(key);
                });
            }
        },
        radiusPreset: {
            get() {
                const v = this.props.btnBorderRadius || '8px';
                if (v === '0px' || v === '0') return '0px';
                if (parseFloat(v) >= 100) return '999px';
                return '8px';
            },
            set(val) {
                this.props.btnBorderRadius = val;
                this.propChanged('btnBorderRadius');
            }
        },
        sizePreset: {
            get() {
                const v = this.props.btnPaddingV;
                if (v === '6px') return 'sm';
                if (v === '14px') return 'lg';
                return 'md';
            },
            set(val) {
                const s = SIZES[val];
                if (!s) return;
                Object.entries(s).forEach(([key, value]) => {
                    this.props[key] = value;
                    this.propChanged(key);
                });
            }
        },
        shadowPreset: {
            get() {
                const v = this.props.btnShadow || '';
                if (!v) return 'none';
                if (v === SHADOWS.sm || v.includes('rgba(0,0,0,0.12)')) return 'sm';
                if (v === SHADOWS.lg || v.includes('rgba(79,106,255,0.4)')) return 'lg';
                return 'md';
            },
            set(val) {
                this.props.btnShadow = SHADOWS[val] ?? SHADOWS.md;
                this.propChanged('btnShadow');
            }
        },
        hasBorder: {
            get() {
                return (this.props.btnBorderWidth || '0px') !== '0px';
            },
            set(val) {
                this.props.btnBorderWidth = val ? '1px' : '0px';
                this.propChanged('btnBorderWidth');
                if (val && (!this.props.btnBorderColor || this.props.btnBorderColor === 'transparent')) {
                    this.props.btnBorderColor = this.props.btnBg || DEFAULTS.btnBg;
                    this.propChanged('btnBorderColor');
                }
            }
        }
    },
    mounted() {
        this.localBtnCss = this.props.btnCustomCss || '';
        this.localHoverCss = this.props.btnHoverCss || '';
    },
    beforeUnmount() {
        if (this.debounceTimer) clearTimeout(this.debounceTimer);
    },
    methods: {
        onBtnCssChange() {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => {
                this.props.btnCustomCss = this.localBtnCss;
                this.propChanged('btnCustomCss');
            }, 300);
        },
        onHoverCssChange() {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => {
                this.props.btnHoverCss = this.localHoverCss;
                this.propChanged('btnHoverCss');
            }, 300);
        },
        resetAll() {
            Object.entries(DEFAULTS).forEach(([key, val]) => {
                this.props[key] = val;
                this.propChanged(key);
            });
            this.localBtnCss = '';
            this.props.btnCustomCss = '';
            this.propChanged('btnCustomCss');
            this.localHoverCss = '';
            this.props.btnHoverCss = '';
            this.propChanged('btnHoverCss');
        }
    }
};
</script>

<style scoped>
.css-section {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-top: 4px;
}

.css-section__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.css-section__header .form-label {
    margin: 0;
}

.css-section__tag {
    font-size: 11px;
    opacity: 0.45;
    font-weight: normal;
    font-family: monospace;
    background: transparent;
    border: none;
    padding: 0;
}

.css-section__textarea {
    width: 100%;
    height: 80px;
    font-family: monospace;
    font-size: 12px;
    padding: 8px;
    background: #fff;
    color: #111;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    resize: vertical;
    min-height: 50px;
    box-sizing: border-box;
    line-height: 1.5;
}

.css-section__textarea:focus {
    outline: none;
    border-color: #4f6aff;
}
</style>
