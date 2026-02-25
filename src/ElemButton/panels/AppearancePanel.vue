<template>
    <w-panel>
        <ui-container>

            <!-- ── Вариант стиля ───────────────────────────────────────── -->
            <div class="section-label">Стиль кнопки</div>
            <div class="opt-grid opt-grid--5">
                <div
                    v-for="v in variantOptions"
                    :key="v.value"
                    class="opt-card"
                    :class="{ 'opt-card--active': stylePreset === v.value }"
                    @click="stylePreset = v.value">
                    <div class="opt-card__variant-preview" :class="v.previewClass" />
                    <div class="opt-card__label">{{ v.label }}</div>
                </div>
            </div>

            <!-- ── Цвета ──────────────────────────────────────────────── -->
            <template v-if="!isGlass">
                <ui-input-cp prop="btnBg">{{ isGradient ? 'Начало градиента' : 'Фон кнопки' }}</ui-input-cp>
                <template v-if="isGradient">
                    <ui-input-cp prop="btnGradientTo">Конец градиента</ui-input-cp>
                    <div class="section-label">Угол градиента</div>
                    <div class="opt-grid opt-grid--4">
                        <div
                            v-for="a in angleOptions"
                            :key="a.value"
                            class="opt-card"
                            :class="{ 'opt-card--active': gradientAngle === a.value }"
                            @click="gradientAngle = a.value">
                            <i :class="a.icon" class="opt-card__icon-lg" />
                            <div class="opt-card__label">{{ a.label }}</div>
                        </div>
                    </div>
                </template>
                <ui-input-cp prop="btnColor">Цвет текста</ui-input-cp>
            </template>

            <!-- ── Эффект при наведении ───────────────────────────────── -->
            <div class="section-label">Эффект при наведении</div>
            <div class="opt-grid opt-grid--3">
                <div
                    v-for="e in hoverEffectOptions"
                    :key="e.value"
                    class="opt-card"
                    :class="{ 'opt-card--active': hoverEffect === e.value }"
                    @click="hoverEffect = e.value">
                    <i :class="e.icon" class="opt-card__icon-lg" />
                    <div class="opt-card__label">{{ e.label }}</div>
                </div>
            </div>

            <!-- ── Курсор ──────────────────────────────────────────────── -->
            <div class="section-label">Курсор мыши</div>
            <div class="opt-grid opt-grid--3">
                <div
                    v-for="c in cursorOptions"
                    :key="c.value"
                    class="opt-card"
                    :class="{ 'opt-card--active': cursorValue === c.value }"
                    @click="cursorValue = c.value">
                    <i :class="c.icon" class="opt-card__icon-lg" />
                    <div class="opt-card__label">{{ c.label }}</div>
                </div>
            </div>

            <!-- ── Иконки ─────────────────────────────────────────────── -->
            <div class="section-label">Иконки</div>
            <div class="icon-row">
                <div class="icon-field">
                    <div class="icon-preview">
                        <i v-if="props.btnIconLeft" :class="props.btnIconLeft" />
                        <span v-else class="icon-empty">←</span>
                    </div>
                    <ui-input prop="btnIconLeft" placeholder="mdi mdi-arrow-left">Слева</ui-input>
                </div>
                <div class="icon-field">
                    <div class="icon-preview">
                        <i v-if="props.btnIconRight" :class="props.btnIconRight" />
                        <span v-else class="icon-empty">→</span>
                    </div>
                    <ui-input prop="btnIconRight" placeholder="mdi mdi-arrow-right">Справа</ui-input>
                </div>
            </div>

            <!-- ── Размер ─────────────────────────────────────────────── -->
            <div class="section-label">Размер</div>
            <div class="size-grid">
                <div
                    v-for="s in sizePresets"
                    :key="s.label"
                    class="size-card"
                    :class="{ 'size-card--active': Math.abs(sizeSliderRem - s.rem) < 0.063 }"
                    @click="applySizeRem(s.rem)">
                    <div class="size-card__stage">
                        <span class="size-card__btn" :style="sizePreviewStyle(s)">Кн</span>
                    </div>
                    <div class="size-card__name">{{ s.label }}</div>
                </div>
            </div>
            <div class="slider-row">
                <input
                    type="range"
                    class="slider"
                    :value="sizeSliderRem"
                    min="0.25"
                    max="3"
                    step="0.125"
                    @input="onSizeSlider" />
                <span class="slider-val">{{ sizeSliderRem }} rem</span>
            </div>

            <!-- ── Скругление ─────────────────────────────────────────── -->
            <div class="section-label">Скругление углов</div>
            <div class="chip-row">
                <button
                    v-for="r in radiusPresets"
                    :key="r.label"
                    class="chip"
                    :class="{ 'chip--active': radiusChipActive === r.label }"
                    @click="applyRadiusPreset(r)">
                    <span class="chip__shape" :style="{ borderRadius: r.shape }"></span>
                    {{ r.label }}
                </button>
            </div>
            <div class="slider-row">
                <input
                    type="range"
                    class="slider"
                    :value="radiusSliderRem"
                    min="0"
                    max="2"
                    step="0.125"
                    @input="onRadiusSlider" />
                <span class="slider-val">{{ radiusSliderRem }} rem</span>
            </div>

            <!-- ── Тень ───────────────────────────────────────────────── -->
            <div class="section-label">Тень</div>
            <div class="opt-grid opt-grid--4">
                <div
                    v-for="sh in shadowOptions"
                    :key="sh.value"
                    class="opt-card"
                    :class="{ 'opt-card--active': shadowPreset === sh.value }"
                    @click="shadowPreset = sh.value">
                    <div class="opt-card__shadow-dot" :style="{ boxShadow: sh.previewShadow }" />
                    <div class="opt-card__label">{{ sh.label }}</div>
                </div>
            </div>

            <!-- ── Рамка ──────────────────────────────────────────────── -->
            <ui-switch v-model="hasBorder">Рамка</ui-switch>
            <ui-input-cp v-if="hasBorder" prop="btnBorderColor">Цвет рамки</ui-input-cp>

            <!-- ── Цвета Toggle-состояния ─────────────────────────────── -->
            <ui-collapse>
                <template #header>Цвета в активном состоянии (Toggle)</template>
                <ui-container>
                    <ui-input-cp prop="btnToggleBg">Фон (нажата)</ui-input-cp>
                    <ui-input-cp prop="btnToggleColor">Текст (нажата)</ui-input-cp>
                </ui-container>
            </ui-collapse>

            <!-- ── Свой CSS ────────────────────────────────────────────── -->
            <ui-collapse>
                <template #header>Свой CSS</template>
                <ui-container>
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
                            @input="onBtnCssChange" />
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
                            @input="onHoverCssChange" />
                    </div>
                </ui-container>
            </ui-collapse>

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
    btnBorderColor: 'transparent',
    btnGradientTo: '',
    btnIsGlass: false,
    btnHoverEffect: 'default',
    btnCursor: 'pointer',
    btnIconLeft: '',
    btnIconRight: ''
};

const SHADOWS = {
    none: '',
    sm: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.06)',
    md: '0 2px 12px rgba(79,106,255,0.3), 0 1px 3px rgba(0,0,0,0.1)',
    lg: '0 8px 24px rgba(79,106,255,0.4), 0 3px 8px rgba(0,0,0,0.15)'
};

/** Parse px/rem string → rem number */
function toRem(cssVal) {
    if (!cssVal) return 0;
    const s = String(cssVal).trim();
    if (s.endsWith('rem')) return parseFloat(s) || 0;
    if (s.endsWith('px')) return Math.round((parseFloat(s) / 16) * 1000) / 1000;
    return parseFloat(s) || 0;
}

/** Round to nearest slider step */
function snapRem(val, step = 0.125) {
    return Math.round(val / step) * step;
}

export default {
    extends: Panel,
    meta: { name: 'Я дизайнер', icon: 'palette' },
    data: () => ({
        ...ComponentInstanceTypeDescriptor,
        localBtnCss: '',
        localHoverCss: '',
        debounceTimer: null,
        variantOptions: [
            { label: 'Заливка',    value: 'filled',   previewClass: 'preview--filled' },
            { label: 'Обводка',    value: 'outlined', previewClass: 'preview--outlined' },
            { label: 'Прозрачная', value: 'ghost',    previewClass: 'preview--ghost' },
            { label: 'Градиент',   value: 'gradient', previewClass: 'preview--gradient' },
            { label: 'Стекло',     value: 'glass',    previewClass: 'preview--glass' }
        ],
        angleOptions: [
            { label: '45°',  value: '45deg',  icon: 'mdi mdi-arrow-top-right' },
            { label: '90°',  value: '90deg',  icon: 'mdi mdi-arrow-right' },
            { label: '135°', value: '135deg', icon: 'mdi mdi-arrow-bottom-right' },
            { label: '180°', value: '180deg', icon: 'mdi mdi-arrow-down' }
        ],
        hoverEffectOptions: [
            { label: 'Стандарт',   value: 'default', icon: 'mdi mdi-cursor-default-click' },
            { label: 'Подъём',     value: 'lift',    icon: 'mdi mdi-arrow-up-bold-outline' },
            { label: 'Свечение',   value: 'glow',    icon: 'mdi mdi-flare' },
            { label: 'Увеличение', value: 'scale',   icon: 'mdi mdi-magnify-plus-outline' },
            { label: 'Пульс',      value: 'pulse',   icon: 'mdi mdi-heart-pulse' },
            { label: 'Без',        value: 'none',    icon: 'mdi mdi-minus-circle-outline' }
        ],
        cursorOptions: [
            { label: 'Рука',    value: 'pointer',   icon: 'mdi mdi-hand-pointing-right' },
            { label: 'Стрелка', value: 'default',   icon: 'mdi mdi-cursor-default-outline' },
            { label: 'Прицел',  value: 'crosshair', icon: 'mdi mdi-crosshairs' },
            { label: 'Лупа',    value: 'zoom-in',   icon: 'mdi mdi-magnify-plus' },
            { label: 'Помощь',  value: 'help',      icon: 'mdi mdi-help-circle-outline' },
            { label: 'Захват',  value: 'grab',      icon: 'mdi mdi-hand-back-left-outline' }
        ],
        sizePresets: [
            { label: 'Малая',   rem: 0.375 },
            { label: 'Средняя', rem: 0.625 },
            { label: 'Обычная', rem: 0.875 },
            { label: 'Крупная', rem: 1.25 }
        ],
        radiusPresets: [
            { label: 'Острые',  shape: '0',     rem: 0,    css: '0rem' },
            { label: 'Мягкие',  shape: '4px',   rem: 0.5,  css: '0.5rem' },
            { label: 'Круглые', shape: '10px',  rem: 1,    css: '1rem' },
            { label: 'Пилюля',  shape: '999px', rem: null, css: '999px' }
        ],
        shadowOptions: [
            { label: 'Нет',      value: 'none', previewShadow: 'none' },
            { label: 'Лёгкая',   value: 'sm',   previewShadow: '0 2px 6px rgba(0,0,0,0.18)' },
            { label: 'Средняя',  value: 'md',   previewShadow: '0 4px 14px rgba(79,106,255,0.45)' },
            { label: 'Объёмная', value: 'lg',   previewShadow: '0 8px 24px rgba(79,106,255,0.55)' }
        ]
    }),
    computed: {
        isGlass() { return this.stylePreset === 'glass'; },
        isGradient() { return this.stylePreset === 'gradient'; },

        /** Current padding-v in rem, snapped to slider step */
        sizeSliderRem() {
            return Math.min(3, Math.max(0.25, snapRem(toRem(this.props.btnPaddingV || '10px'))));
        },

        /** Current border-radius in rem (capped at 2 for slider; pill returns 2) */
        radiusSliderRem() {
            const raw = this.props.btnBorderRadius || '8px';
            if (parseFloat(raw) >= 100) return 2;
            return Math.min(2, snapRem(toRem(raw)));
        },

        /** Active chip label for radius */
        radiusChipActive() {
            const raw = this.props.btnBorderRadius || '8px';
            if (parseFloat(raw) >= 100) return 'Пилюля';
            const r = snapRem(toRem(raw));
            if (r === 0) return 'Острые';
            if (r === 0.5) return 'Мягкие';
            if (r === 1) return 'Круглые';
            return null;
        },

        stylePreset: {
            get() {
                const { btnIsGlass, btnGradientTo, btnBg, btnBorderWidth } = this.props;
                if (btnIsGlass) return 'glass';
                if (btnGradientTo) return 'gradient';
                const isTransparent = !btnBg || btnBg === 'transparent';
                const hasBorder = btnBorderWidth && btnBorderWidth !== '0px';
                if (isTransparent && hasBorder) return 'outlined';
                if (isTransparent) return 'ghost';
                return 'filled';
            },
            set(val) {
                const presets = {
                    filled:   { btnBg: '#4f6aff', btnColor: '#ffffff', btnBorderWidth: '0px',  btnBorderColor: 'transparent', btnGradientTo: '', btnIsGlass: false },
                    outlined: { btnBg: 'transparent', btnColor: '#4f6aff', btnBorderWidth: '1px', btnBorderColor: '#4f6aff', btnGradientTo: '', btnIsGlass: false },
                    ghost:    { btnBg: 'transparent', btnColor: '#4f6aff', btnBorderWidth: '0px',  btnBorderColor: 'transparent', btnGradientTo: '', btnIsGlass: false },
                    gradient: { btnBg: '#4f6aff', btnColor: '#ffffff', btnBorderWidth: '0px',  btnBorderColor: 'transparent', btnGradientTo: '#7c3aed', btnIsGlass: false },
                    glass:    { btnBg: 'rgba(255,255,255,0.12)', btnColor: '#ffffff', btnBorderWidth: '1px', btnBorderColor: 'rgba(255,255,255,0.25)', btnGradientTo: '', btnIsGlass: true }
                };
                const p = presets[val];
                if (!p) return;
                Object.entries(p).forEach(([key, value]) => {
                    this.props[key] = value;
                    this.propChanged(key);
                });
            }
        },
        gradientAngle: {
            get() { return this.props.btnGradientAngle || '135deg'; },
            set(val) { this.props.btnGradientAngle = val; this.propChanged('btnGradientAngle'); }
        },
        hoverEffect: {
            get() { return this.props.btnHoverEffect || 'default'; },
            set(val) { this.props.btnHoverEffect = val; this.propChanged('btnHoverEffect'); }
        },
        cursorValue: {
            get() { return this.props.btnCursor || 'pointer'; },
            set(val) { this.props.btnCursor = val; this.propChanged('btnCursor'); }
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
            get() { return (this.props.btnBorderWidth || '0px') !== '0px'; },
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
        /** Size slider: paddingV in rem → px, paddingH proportional, fontSize scaled */
        onSizeSlider(e) {
            this.applySizeRem(parseFloat(e.target.value));
        },

        /** Apply size preset rem value — used by both S/M/L chips and the slider */
        applySizeRem(rem) {
            const pxV = Math.round(rem * 16);
            const pxH = Math.round(rem * 32);
            // Font size: 12px at min (0.25rem) → 24px at max (3rem)
            const fontSize = Math.round(12 + (rem - 0.25) / (3 - 0.25) * 12);
            this.props.btnPaddingV = `${pxV}px`;
            this.propChanged('btnPaddingV');
            this.props.btnPaddingH = `${pxH}px`;
            this.propChanged('btnPaddingH');
            this.props.btnFontSize = `${fontSize}px`;
            this.propChanged('btnFontSize');
        },

        /** Generate inline styles for the size preview mini-button (uses real button props) */
        sizePreviewStyle(s) {
            const { btnBg, btnColor, btnBorderRadius, btnBorderWidth, btnBorderColor } = this.props;
            const pxV = Math.max(2, Math.round(s.rem * 9));
            const pxH = Math.max(5, Math.round(s.rem * 18));
            const fs = Math.max(8, Math.round(9 + (s.rem - 0.25) / (3 - 0.25) * 5));
            return {
                background: btnBg || '#4f6aff',
                color: btnColor || '#fff',
                borderRadius: btnBorderRadius || '8px',
                border: (btnBorderWidth && btnBorderWidth !== '0px')
                    ? `1px solid ${btnBorderColor || '#4f6aff'}`
                    : 'none',
                padding: `${pxV}px ${pxH}px`,
                fontSize: `${fs}px`,
                fontWeight: '500',
                lineHeight: '1.3',
                display: 'inline-block',
                whiteSpace: 'nowrap',
                pointerEvents: 'none'
            };
        },

        /** Radius slider: value in rem */
        onRadiusSlider(e) {
            const rem = parseFloat(e.target.value);
            this.props.btnBorderRadius = `${rem}rem`;
            this.propChanged('btnBorderRadius');
        },

        applyRadiusPreset(r) {
            this.props.btnBorderRadius = r.css;
            this.propChanged('btnBorderRadius');
        },

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
/* ── Section label ─────────────────────────────────────────────── */
.section-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #94a3b8;
    margin-top: 4px;
    margin-bottom: 4px;
}

/* ── Option grid ───────────────────────────────────────────────── */
.opt-grid {
    display: grid;
    gap: 6px;
    margin-bottom: 2px;
}
.opt-grid--3 { grid-template-columns: repeat(3, 1fr); }
.opt-grid--4 { grid-template-columns: repeat(4, 1fr); }
.opt-grid--5 { grid-template-columns: repeat(5, 1fr); }

/* ── Option card ───────────────────────────────────────────────── */
.opt-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    padding: 8px 4px 6px;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s, color 0.15s;
    text-align: center;
    color: #64748b;
    background: #fff;
}
.opt-card:hover { border-color: #a5b4fc; color: #334155; }
.opt-card--active { border-color: #4f6aff; background: #eff2ff; color: #4f6aff; }

.opt-card__label {
    font-size: 10px;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
    line-height: 1.2;
}
.opt-card__icon-lg { font-size: 18px; line-height: 1; }

/* ── Variant preview ───────────────────────────────────────────── */
.opt-card__variant-preview {
    width: 32px;
    height: 16px;
    border-radius: 4px;
    flex-shrink: 0;
}
.preview--filled   { background: #4f6aff; }
.preview--outlined { background: transparent; border: 2px solid #4f6aff; }
.preview--ghost    { background: transparent; }
.preview--gradient { background: linear-gradient(135deg, #4f6aff, #7c3aed); }
.preview--glass    { background: rgba(79,106,255,0.15); border: 1px solid rgba(79,106,255,0.35); }

/* ── Shadow preview ────────────────────────────────────────────── */
.opt-card__shadow-dot {
    width: 22px;
    height: 22px;
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    flex-shrink: 0;
}

/* ── Size preview cards ─────────────────────────────────────────── */
.size-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 5px;
    margin-bottom: 6px;
}
.size-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 6px 3px 5px;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s, box-shadow 0.12s;
    background: #fff;
    overflow: hidden;
}
.size-card:hover {
    border-color: #a5b4fc;
    background: #f5f7ff;
    box-shadow: 0 2px 8px rgba(79,106,255,0.1);
}
.size-card--active {
    border-color: #4f6aff;
    background: #eff2ff;
    box-shadow: 0 0 0 1px #4f6aff33;
}
.size-card__stage {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 38px;
    width: 100%;
    overflow: hidden;
}
.size-card__name {
    font-size: 10px;
    font-weight: 500;
    color: #64748b;
    text-align: center;
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
    padding: 0 2px;
}
.size-card--active .size-card__name { color: #4f6aff; font-weight: 600; }

/* ── Chip row (radius presets) ──────────────────────────────────── */
.chip-row {
    display: flex;
    gap: 6px;
    margin-bottom: 6px;
}
.chip {
    flex: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    padding: 5px 8px;
    border: 2px solid #e2e8f0;
    border-radius: 6px;
    background: #fff;
    color: #64748b;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s, color 0.15s;
    white-space: nowrap;
}
.chip:hover { border-color: #a5b4fc; color: #334155; }
.chip--active { border-color: #4f6aff; background: #eff2ff; color: #4f6aff; }

.chip__shape {
    display: inline-block;
    width: 14px;
    height: 10px;
    background: currentColor;
    opacity: 0.7;
    flex-shrink: 0;
}

/* ── Slider row ────────────────────────────────────────────────── */
.slider-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 2px;
}
.slider {
    flex: 1;
    -webkit-appearance: none;
    appearance: none;
    height: 4px;
    border-radius: 2px;
    background: #e2e8f0;
    outline: none;
    cursor: pointer;
}
.slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #4f6aff;
    cursor: pointer;
    border: 2px solid #fff;
    box-shadow: 0 1px 4px rgba(79,106,255,0.4);
    transition: transform 0.1s;
}
.slider::-webkit-slider-thumb:hover { transform: scale(1.2); }
.slider::-moz-range-thumb {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #4f6aff;
    cursor: pointer;
    border: 2px solid #fff;
    box-shadow: 0 1px 4px rgba(79,106,255,0.4);
}
.slider-val {
    font-size: 11px;
    font-weight: 600;
    color: #4f6aff;
    white-space: nowrap;
    min-width: 52px;
    text-align: right;
}

/* ── Icon inputs ───────────────────────────────────────────────── */
.icon-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-bottom: 2px;
}
.icon-field { display: flex; flex-direction: column; gap: 4px; }
.icon-preview {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 32px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 18px;
    color: #475569;
}
.icon-empty { font-size: 13px; color: #cbd5e1; }

/* ── Custom CSS ────────────────────────────────────────────────── */
.css-section { display: flex; flex-direction: column; gap: 4px; margin-top: 4px; }
.css-section__header { display: flex; align-items: center; justify-content: space-between; }
.css-section__header .form-label { margin: 0; }
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
    height: 72px;
    font-family: monospace;
    font-size: 12px;
    padding: 8px;
    background: #fff;
    color: #111;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    resize: vertical;
    min-height: 48px;
    box-sizing: border-box;
    line-height: 1.5;
}
.css-section__textarea:focus { outline: none; border-color: #4f6aff; }
</style>
