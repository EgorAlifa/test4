<template>
    <w-panel>
        <ui-container>

            <!-- ── Стиль ──────────────────────────────────────────── -->
            <ui-select v-model="stylePreset" :options="styleOptions">Стиль кнопки</ui-select>

            <!-- ── Цвета ──────────────────────────────────────────── -->
            <ui-input-cp prop="btnBg">Цвет фона</ui-input-cp>
            <ui-input-cp prop="btnColor">Цвет текста</ui-input-cp>

            <!-- ── Форма ───────────────────────────────────────────── -->
            <ui-select v-model="radiusPreset" :options="radiusOptions">Скругление</ui-select>

            <!-- ── Размер ──────────────────────────────────────────── -->
            <ui-select v-model="sizePreset" :options="sizeOptions">Размер</ui-select>

            <!-- ── Тень ───────────────────────────────────────────── -->
            <ui-select v-model="shadowPreset" :options="shadowOptions">Тень</ui-select>

            <!-- ── Рамка ──────────────────────────────────────────── -->
            <ui-switch v-model="hasBorder">Рамка</ui-switch>
            <ui-input-cp v-if="hasBorder" prop="btnBorderColor">Цвет рамки</ui-input-cp>

            <!-- ── Я дизайнер (только для продвинутых) ────────────── -->
            <ui-collapse>
                <template #header>Я дизайнер</template>
                <ui-container>

                    <!-- .btn -->
                    <ui-has-panel>
                        <div class="form-label form-label-small">
                            Кнопка
                            <span :style="{ fontSize: '11px', opacity: '0.45', fontWeight: 'normal', marginLeft: '6px' }">.btn</span>
                        </div>
                        <template #panel>
                            <ui-panel :groups="[{ name: 'CSS кнопки', slot: 'btn' }]">
                                <template #btn>
                                    <ui-container>
                                        <div :style="{ marginBottom: '8px', padding: '8px', backgroundColor: '#fef3c7', borderRadius: '6px' }">
                                            <div :style="{ fontSize: '11px', fontWeight: '600', marginBottom: '4px', color: '#92400e' }">
                                                Текущие настройки:
                                            </div>
                                            <pre :style="{ fontSize: '11px', color: '#78350f', fontFamily: 'monospace', whiteSpace: 'pre-wrap', lineHeight: '1.4', margin: 0 }">{{ currentBtnCss }}</pre>
                                        </div>

                                        <div :style="{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }">
                                            <span class="form-label form-label-small" :style="{ margin: 0 }">CSS свойства</span>
                                            <button
                                                type="button"
                                                :style="{ fontSize: '11px', padding: '3px 8px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }"
                                                @click="fillBtnWithCurrent"
                                            >Заполнить текущими</button>
                                        </div>
                                        <textarea
                                            v-model="localBtnCss"
                                            spellcheck="false"
                                            :placeholder="currentBtnCss"
                                            :style="{ width: '100%', height: '120px', fontFamily: 'monospace', fontSize: '12px', padding: '8px', background: '#fff', color: '#111', border: '1px solid #d1d5db', borderRadius: '6px', resize: 'vertical', minHeight: '60px' }"
                                            @input="onBtnCssChange"
                                        />
                                        <div :style="{ marginTop: '6px', padding: '7px 10px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', fontSize: '12px', color: '#1e40af', lineHeight: '1.5' }">
                                            Только свойства без селектора:
                                            <code :style="{ background: '#dbeafe', borderRadius: '3px', padding: '1px 5px', fontFamily: 'monospace', fontSize: '11px' }">color: red;</code>
                                        </div>
                                        <ui-button type="ghost" class="mt-2" @click="resetBtnCss">Сбросить</ui-button>
                                    </ui-container>
                                </template>
                            </ui-panel>
                        </template>
                    </ui-has-panel>

                    <!-- .btn:hover -->
                    <ui-has-panel>
                        <div class="form-label form-label-small">
                            При наведении
                            <span :style="{ fontSize: '11px', opacity: '0.45', fontWeight: 'normal', marginLeft: '6px' }">.btn:hover</span>
                        </div>
                        <template #panel>
                            <ui-panel :groups="[{ name: 'CSS при наведении', slot: 'hover' }]">
                                <template #hover>
                                    <ui-container>
                                        <textarea
                                            v-model="localHoverCss"
                                            spellcheck="false"
                                            placeholder="background: #3b54f0;"
                                            :style="{ width: '100%', height: '80px', fontFamily: 'monospace', fontSize: '12px', padding: '8px', background: '#fff', color: '#111', border: '1px solid #d1d5db', borderRadius: '6px', resize: 'vertical', minHeight: '50px' }"
                                            @input="onHoverCssChange"
                                        />
                                        <ui-button type="ghost" class="mt-2" @click="resetHoverCss">Сбросить</ui-button>
                                    </ui-container>
                                </template>
                            </ui-panel>
                        </template>
                    </ui-has-panel>

                </ui-container>
            </ui-collapse>

            <!-- ── Сброс ───────────────────────────────────────────── -->
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
    meta: { name: 'Я дизайнер', icon: 'palette' },
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
        },
        currentBtnCss() {
            const p = this.props;
            const lines = [
                `background: ${p.btnBg || DEFAULTS.btnBg};`,
                `color: ${p.btnColor || DEFAULTS.btnColor};`,
                `border-radius: ${p.btnBorderRadius || DEFAULTS.btnBorderRadius};`,
                `font-size: ${p.btnFontSize || DEFAULTS.btnFontSize};`,
                `font-weight: ${p.btnFontWeight || DEFAULTS.btnFontWeight};`,
                `padding: ${p.btnPaddingV || DEFAULTS.btnPaddingV} ${p.btnPaddingH || DEFAULTS.btnPaddingH};`
            ];
            if (p.btnShadow) lines.push(`box-shadow: ${p.btnShadow};`);
            if ((p.btnBorderWidth || '0px') !== '0px') {
                lines.push(`border: ${p.btnBorderWidth} solid ${p.btnBorderColor || DEFAULTS.btnBorderColor};`);
            }
            return lines.join('\n');
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
        fillBtnWithCurrent() {
            this.localBtnCss = this.currentBtnCss;
            this.props.btnCustomCss = this.localBtnCss;
            this.propChanged('btnCustomCss');
        },
        resetBtnCss() {
            this.localBtnCss = '';
            this.props.btnCustomCss = '';
            this.propChanged('btnCustomCss');
        },
        resetHoverCss() {
            this.localHoverCss = '';
            this.props.btnHoverCss = '';
            this.propChanged('btnHoverCss');
        },
        resetAll() {
            Object.entries(DEFAULTS).forEach(([key, val]) => {
                this.props[key] = val;
                this.propChanged(key);
            });
            this.resetBtnCss();
            this.resetHoverCss();
        }
    }
};
</script>
