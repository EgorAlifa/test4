<template>
    <w-panel>
        <ui-container>

            <!-- ══ LIVE PREVIEW ══════════════════════════════════════════ -->
            <div class="dialog-preview-wrap">
                <div class="dialog-preview-overlay" :style="previewOverlayStyle">
                    <div class="dialog-preview-dialog" :style="previewDialogStyle">
                        <i class="mdi mdi-alert-circle-outline dialog-preview-icon" :style="previewIconStyle" />
                        <div class="dialog-preview-title" :style="previewTextStyle">
                            {{ (props.labels && props.labels.warningTitle) || 'Сессия истекает' }}
                        </div>
                        <div class="dialog-preview-msg" :style="previewTextStyle">
                            Выход через <strong>30</strong> сек.
                        </div>
                        <button class="dialog-preview-btn" :style="previewBtnStyle">
                            {{ (props.labels && props.labels.stayLoggedIn) || 'Оставаться в системе' }}
                        </button>
                    </div>
                </div>
            </div>

            <!-- ══ PRESETS ═══════════════════════════════════════════════ -->
            <div class="section-label">Пресет</div>
            <div class="presets-row">
                <div
                    v-for="p in presets"
                    :key="p.label"
                    class="preset-chip"
                    :class="{ 'preset-chip--active': activePreset === p.label }"
                    :title="p.label"
                    @click="applyPreset(p)">
                    <div class="chip-overlay" :style="{ background: p.swatch.overlay }">
                        <div
                            class="chip-dialog"
                            :style="{
                                background:   p.swatch.dialog,
                                color:        p.swatch.text,
                                borderRadius: p.swatch.radius,
                                borderTop:    p.swatch.borderTop || null
                            }">
                            <div class="chip-icon" :style="{ color: p.swatch.icon }">⚠</div>
                            <div class="chip-bar"></div>
                            <div class="chip-btn" :style="{ background: p.swatch.btn }"></div>
                        </div>
                    </div>
                    <div class="chip-label">
                        <i v-if="activePreset === p.label" class="mdi mdi-check chip-check" />
                        {{ p.label }}
                    </div>
                </div>
            </div>

            <div class="divider" />

            <!-- ══ BUTTON COLOUR ═════════════════════════════════════════ -->
            <div class="section-label">Цветовые пресеты</div>
            <div class="color-presets">
                <button
                    v-for="cp in colorPresets"
                    :key="cp.label"
                    class="color-preset"
                    :class="{ 'color-preset--active': props.btnBgColor === cp.bg }"
                    :title="cp.label"
                    :style="{ background: cp.bg, color: cp.color, border: cp.border || 'none' }"
                    @click="applyColorPreset(cp)">
                    {{ cp.label }}
                </button>
            </div>
            <ui-input-cp prop="btnBgColor">Фон кнопки</ui-input-cp>
            <ui-input-cp prop="btnTextColor">Цвет текста кнопки</ui-input-cp>

            <!-- ══ DIALOG FONT ════════════════════════════════════════════ -->
            <div class="section-label">Шрифт диалога</div>
            <div class="font-grid">
                <button
                    v-for="f in fontFamilyOptions"
                    :key="f.value"
                    class="font-chip"
                    :class="{ 'font-chip--active': (props.dialogFontFamily || '') === f.value }"
                    :style="{ fontFamily: f.value || 'inherit' }"
                    @click="setDialogFontFamily(f.value)">
                    {{ f.label }}
                </button>
            </div>
            <div class="custom-font-row">
                <input
                    class="custom-font-input"
                    placeholder="Свой шрифт, напр. Comfortaa"
                    :value="customDialogFontInput"
                    @input="customDialogFontInput = $event.target.value"
                    @keydown.enter.prevent="applyCustomDialogFont" />
                <button class="custom-font-btn" :disabled="!customDialogFontInput.trim()" @click="applyCustomDialogFont">
                    <i class="mdi mdi-check" />
                </button>
            </div>

            <!-- ══ BUTTON FONT ════════════════════════════════════════════ -->
            <div class="section-label">Шрифт кнопки</div>
            <div class="font-grid">
                <button
                    v-for="f in fontFamilyOptions"
                    :key="f.value"
                    class="font-chip"
                    :class="{ 'font-chip--active': (props.btnFontFamily || '') === f.value }"
                    :style="{ fontFamily: f.value || 'inherit' }"
                    @click="setBtnFontFamily(f.value)">
                    {{ f.label }}
                </button>
            </div>
            <div class="custom-font-row">
                <input
                    class="custom-font-input"
                    placeholder="Свой шрифт, напр. Comfortaa"
                    :value="customFontInput"
                    @input="customFontInput = $event.target.value"
                    @keydown.enter.prevent="applyCustomFont" />
                <button class="custom-font-btn" :disabled="!customFontInput.trim()" @click="applyCustomFont">
                    <i class="mdi mdi-check" />
                </button>
            </div>

            <!-- ── Регистр ───────────────────────────────────────────── -->
            <div class="section-label">Регистр</div>
            <div class="opt-grid opt-grid--4">
                <div
                    v-for="t in textTransformOptions"
                    :key="t.value"
                    class="opt-card"
                    :class="{ 'opt-card--active': (props.btnTextTransform || 'none') === t.value }"
                    @click="setBtnTextTransform(t.value)">
                    <span class="opt-card__typo-preview" :style="{ textTransform: t.value }">Аа</span>
                    <div class="opt-card__label">{{ t.label }}</div>
                </div>
            </div>

            <!-- ── Межбуквенный интервал ─────────────────────────────── -->
            <div class="section-label">Межбуквенный интервал</div>
            <div class="slider-row">
                <input
                    type="range"
                    class="slider"
                    min="-5"
                    max="30"
                    step="1"
                    :value="letterSpacingSliderVal"
                    @input="onLetterSpacingSlider" />
                <span class="slider-val">{{ letterSpacingDisplay }}</span>
            </div>

            <!-- ══ BUTTON RADIUS ══════════════════════════════════════════ -->
            <div class="section-label">Скругление кнопки</div>
            <div class="radius-grid">
                <button
                    v-for="r in radiusPresets"
                    :key="r.label"
                    class="radius-card"
                    :class="{ 'radius-card--active': btnRadiusChipActive === r.label }"
                    @click="applyBtnRadius(r)">
                    <span class="radius-card__shape" :style="{ borderRadius: r.shape }"></span>
                    <span class="radius-card__label">{{ r.label }}</span>
                </button>
            </div>
            <div class="slider-row">
                <input
                    type="range"
                    class="slider"
                    min="0"
                    max="40"
                    step="1"
                    :value="props.btnRadius != null ? props.btnRadius : 8"
                    @input="onBtnRadiusSlider" />
                <span class="slider-val">{{ props.btnRadius != null ? props.btnRadius : 8 }}px</span>
            </div>

            <div class="divider" />

            <!-- ══ DIALOG ═════════════════════════════════════════════════ -->
            <div class="section-label">Диалог</div>
            <ui-input-cp prop="dialogBgColor">Фон диалога</ui-input-cp>
            <ui-input-cp prop="dialogTextColor">Цвет текста</ui-input-cp>
            <ui-input-cp prop="iconColor">Цвет иконки</ui-input-cp>
            <div class="section-label">Скругление диалога</div>
            <div class="slider-row">
                <input
                    type="range"
                    class="slider"
                    min="0"
                    max="40"
                    step="1"
                    :value="props.dialogRadius != null ? props.dialogRadius : 8"
                    @input="onDialogRadiusSlider" />
                <span class="slider-val">{{ props.dialogRadius != null ? props.dialogRadius : 8 }}px</span>
            </div>

            <!-- ══ OVERLAY ════════════════════════════════════════════════ -->
            <div class="section-label">Подложка</div>
            <ui-input-cp prop="overlayColor">Цвет подложки</ui-input-cp>
            <div class="section-label">Непрозрачность</div>
            <div class="slider-row">
                <input
                    type="range"
                    class="slider"
                    min="0"
                    max="100"
                    step="1"
                    :value="props.overlayOpacity != null ? props.overlayOpacity : 45"
                    @input="onOverlayOpacitySlider" />
                <span class="slider-val">{{ props.overlayOpacity != null ? props.overlayOpacity : 45 }}%</span>
            </div>

            <div class="divider" />
            <ui-button type="ghost" @click="resetAll">Сбросить оформление</ui-button>

        </ui-container>
    </w-panel>
</template>

<script>
import { Panel } from 'goodt-wcore';

const DEFAULTS = {
    overlayColor: '#000000', overlayOpacity: 45,
    dialogBgColor: '', dialogTextColor: '', dialogRadius: 8,
    btnBgColor: '', btnTextColor: '', btnRadius: 8, iconColor: '',
    dialogFontFamily: '',
    btnFontFamily: '', btnFontSize: '', btnFontWeight: '', btnTextTransform: 'none', btnLetterSpacing: '',
    overlayCustomCss: '', dialogCustomCss: '', dialogBtnCustomCss: ''
};

const PRESETS = [
    {
        label: 'По умолч.',
        swatch: { overlay: 'rgba(0,0,0,0.45)', dialog: '#fff', text: '#1a1a1a', radius: '8px', icon: '#f59e0b', btn: '#4f6aff' },
        visual: { overlayColor: '#000000', overlayOpacity: 45, dialogBgColor: '', dialogTextColor: '', dialogRadius: 8, btnBgColor: '', btnTextColor: '', btnRadius: 8, iconColor: '', dialogFontFamily: '' },
        rawCss: { overlay: '', dialog: '', btn: '' }
    },
    {
        label: 'Тёмная',
        swatch: { overlay: 'rgba(0,0,0,0.72)', dialog: '#1e293b', text: '#f1f5f9', radius: '12px', icon: '#fbbf24', btn: '#3b82f6' },
        visual: { overlayColor: '#000000', overlayOpacity: 72, dialogBgColor: '#1e293b', dialogTextColor: '#f1f5f9', dialogRadius: 12, btnBgColor: '#3b82f6', btnTextColor: '#ffffff', btnRadius: 8, iconColor: '#fbbf24', dialogFontFamily: '' },
        rawCss: { overlay: '', dialog: '', btn: '' }
    },
    {
        label: 'Стекло',
        swatch: { overlay: 'linear-gradient(135deg,#0f172a,#1e3a5f)', dialog: 'rgba(15,23,42,0.75)', text: '#f0f4ff', radius: '20px', icon: '#93c5fd', btn: 'rgba(147,197,253,0.25)' },
        visual: { overlayColor: '#0f172a', overlayOpacity: 65, dialogBgColor: '', dialogTextColor: '#f0f4ff', dialogRadius: 20, btnBgColor: '', btnTextColor: '#f0f4ff', btnRadius: 10, iconColor: '#93c5fd', dialogFontFamily: '' },
        rawCss: {
            overlay: 'backdrop-filter: blur(6px);',
            dialog:  'background: rgba(15,23,42,0.72); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.12);',
            btn:     'background: rgba(255,255,255,0.15) !important; border: 1.5px solid rgba(255,255,255,0.3) !important;'
        }
    },
    {
        label: 'Опасность',
        swatch: { overlay: 'rgba(127,29,29,0.55)', dialog: '#fff', text: '#1a1a1a', radius: '12px', borderTop: '3px solid #ef4444', icon: '#ef4444', btn: '#ef4444' },
        visual: { overlayColor: '#7f1d1d', overlayOpacity: 55, dialogBgColor: '#ffffff', dialogTextColor: '#1a1a1a', dialogRadius: 12, btnBgColor: '#ef4444', btnTextColor: '#ffffff', btnRadius: 8, iconColor: '#ef4444', dialogFontFamily: '' },
        rawCss: { overlay: '', dialog: 'border-top: 4px solid #ef4444;', btn: '' }
    },
    {
        label: 'Мягкая',
        swatch: { overlay: 'rgba(100,116,139,0.35)', dialog: '#f8fafc', text: '#334155', radius: '20px', icon: '#f59e0b', btn: '#64748b' },
        visual: { overlayColor: '#64748b', overlayOpacity: 35, dialogBgColor: '#f8fafc', dialogTextColor: '#334155', dialogRadius: 20, btnBgColor: '#64748b', btnTextColor: '#ffffff', btnRadius: 10, iconColor: '#f59e0b', dialogFontFamily: '' },
        rawCss: { overlay: '', dialog: 'border: 1px solid #e2e8f0;', btn: '' }
    }
];

function hexToRgb(hex) {
    if (!hex || !hex.startsWith('#')) return '0,0,0';
    return [parseInt(hex.slice(1, 3), 16) || 0, parseInt(hex.slice(3, 5), 16) || 0, parseInt(hex.slice(5, 7), 16) || 0].join(',');
}

export default {
    extends: Panel,
    meta: { name: 'Стиль', icon: 'code-braces' },
    data: () => ({
        activePreset: null,
        customFontInput: '',
        customDialogFontInput: '',
        presets: PRESETS,
        colorPresets: [
            { label: 'Синий',    bg: '#4f6aff', color: '#ffffff' },
            { label: 'Фиолет.',  bg: '#7c3aed', color: '#ffffff' },
            { label: 'Голубой',  bg: '#0ea5e9', color: '#ffffff' },
            { label: 'Зелёный',  bg: '#10b981', color: '#ffffff' },
            { label: 'Янтарный', bg: '#f59e0b', color: '#ffffff' },
            { label: 'Красный',  bg: '#ef4444', color: '#ffffff' },
            { label: 'Розовый',  bg: '#ec4899', color: '#ffffff' },
            { label: 'Тёмный',   bg: '#1e293b', color: '#ffffff' },
            { label: 'Светлый',  bg: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0' },
            { label: 'Белый',    bg: '#ffffff',  color: '#1e293b', border: '1px solid #e2e8f0' }
        ],
        fontFamilyOptions: [
            { label: 'По умолч.',    value: '' },
            { label: 'Inter',        value: 'Inter, sans-serif' },
            { label: 'Roboto',       value: 'Roboto, sans-serif' },
            { label: 'Montserrat',   value: 'Montserrat, sans-serif' },
            { label: 'Open Sans',    value: "'Open Sans', sans-serif" },
            { label: 'Lato',         value: 'Lato, sans-serif' },
            { label: 'Poppins',      value: 'Poppins, sans-serif' },
            { label: 'Nunito',       value: 'Nunito, sans-serif' },
            { label: 'Raleway',      value: 'Raleway, sans-serif' },
            { label: 'Oswald',       value: 'Oswald, sans-serif' },
            { label: 'PT Sans',      value: "'PT Sans', sans-serif" },
            { label: 'Ubuntu',       value: 'Ubuntu, sans-serif' },
            { label: 'Rubik',        value: 'Rubik, sans-serif' },
            { label: 'Exo 2',        value: "'Exo 2', sans-serif" }
        ],
        textTransformOptions: [
            { label: 'Обычный',   value: 'none' },
            { label: 'ЗАГЛАВНЫЕ', value: 'uppercase' },
            { label: 'Первые',    value: 'capitalize' },
            { label: 'строчные',  value: 'lowercase' }
        ],
        radiusPresets: [
            { label: 'Острые',  shape: '0',     px: 0 },
            { label: 'Мягкие',  shape: '4px',   px: 6 },
            { label: 'Круглые', shape: '10px',  px: 16 },
            { label: 'Пилюля',  shape: '999px', px: 999 }
        ]
    }),
    computed: {
        /* ── Preview styles ────────────────────────────────────────── */
        previewOverlayStyle() {
            const hex = this.props.overlayColor || '#000000';
            const a = ((this.props.overlayOpacity != null ? this.props.overlayOpacity : 45) / 100).toFixed(2);
            return { background: `rgba(${hexToRgb(hex)},${a})` };
        },
        previewDialogStyle() {
            const p = this.props;
            return {
                background:   p.dialogBgColor    || '#ffffff',
                color:        p.dialogTextColor   || '#1a1a1a',
                borderRadius: (p.dialogRadius != null ? p.dialogRadius : 8) + 'px',
                fontFamily:   p.dialogFontFamily  || 'inherit'
            };
        },
        previewBtnStyle() {
            const p = this.props;
            return {
                background:    p.btnBgColor       || '#4f6aff',
                color:         p.btnTextColor      || '#ffffff',
                borderRadius:  (p.btnRadius != null ? p.btnRadius : 8) + 'px',
                fontFamily:    p.btnFontFamily     || 'inherit',
                fontSize:      p.btnFontSize       || '13px',
                fontWeight:    p.btnFontWeight     || '500',
                textTransform: p.btnTextTransform  || 'none',
                letterSpacing: p.btnLetterSpacing  || '0.02em',
                pointerEvents: 'none'
            };
        },
        previewIconStyle() {
            return { color: this.props.iconColor || '#f59e0b' };
        },
        previewTextStyle() {
            return {
                fontFamily: this.props.dialogFontFamily || 'inherit',
                color: 'inherit'
            };
        },

        /* ── Letter spacing ────────────────────────────────────────── */
        letterSpacingSliderVal() {
            const raw = this.props.btnLetterSpacing || '';
            if (!raw) return 0;
            if (raw.endsWith('em')) return Math.round(parseFloat(raw) * 100);
            return 0;
        },
        letterSpacingDisplay() {
            const val = this.letterSpacingSliderVal;
            if (val === 0) return '0 (по умолч.)';
            return `${val > 0 ? '+' : ''}${(val / 100).toFixed(2)}em`;
        },

        /* ── Btn radius chip ───────────────────────────────────────── */
        btnRadiusChipActive() {
            const px = this.props.btnRadius != null ? this.props.btnRadius : 8;
            if (px >= 100) return 'Пилюля';
            if (px === 0)  return 'Острые';
            if (px <= 8)   return 'Мягкие';
            if (px <= 20)  return 'Круглые';
            return null;
        }
    },
    mounted() {
        this.activePreset = this.detectActivePreset();
    },
    methods: {
        /* ── Preset detection & application ───────────────────────── */
        detectActivePreset() {
            const p = this.props;
            return PRESETS.find((preset) => {
                const v = preset.visual;
                return (
                    v.overlayColor    === (p.overlayColor    || '#000000') &&
                    v.overlayOpacity  === (p.overlayOpacity  != null ? p.overlayOpacity  : 45) &&
                    v.dialogBgColor   === (p.dialogBgColor   || '') &&
                    v.dialogTextColor === (p.dialogTextColor || '') &&
                    v.dialogRadius    === (p.dialogRadius    != null ? p.dialogRadius    : 8) &&
                    v.btnBgColor      === (p.btnBgColor      || '') &&
                    v.btnTextColor    === (p.btnTextColor    || '') &&
                    v.btnRadius       === (p.btnRadius       != null ? p.btnRadius       : 8) &&
                    v.iconColor       === (p.iconColor       || '') &&
                    v.dialogFontFamily === (p.dialogFontFamily || '') &&
                    preset.rawCss.overlay === (p.overlayCustomCss   || '') &&
                    preset.rawCss.dialog  === (p.dialogCustomCss    || '') &&
                    preset.rawCss.btn     === (p.dialogBtnCustomCss || '')
                );
            })?.label ?? null;
        },

        applyPreset(preset) {
            this.activePreset = preset.label;
            Object.entries(preset.visual).forEach(([key, val]) => {
                this.props[key] = val; this.propChanged(key);
            });
            this.props.overlayCustomCss   = preset.rawCss.overlay; this.propChanged('overlayCustomCss');
            this.props.dialogCustomCss    = preset.rawCss.dialog;  this.propChanged('dialogCustomCss');
            this.props.dialogBtnCustomCss = preset.rawCss.btn;     this.propChanged('dialogBtnCustomCss');
        },

        /* ── Color presets ─────────────────────────────────────────── */
        applyColorPreset(cp) {
            this.props.btnBgColor   = cp.bg;    this.propChanged('btnBgColor');
            this.props.btnTextColor = cp.color; this.propChanged('btnTextColor');
            this.activePreset = this.detectActivePreset();
        },

        /* ── Dialog font ───────────────────────────────────────────── */
        setDialogFontFamily(val) {
            this.props.dialogFontFamily = val; this.propChanged('dialogFontFamily');
            this.customDialogFontInput = '';
            this.activePreset = this.detectActivePreset();
        },
        applyCustomDialogFont() {
            const raw = this.customDialogFontInput.trim();
            if (!raw) return;
            const val = raw.includes(',') ? raw : `${raw}, sans-serif`;
            this.props.dialogFontFamily = val; this.propChanged('dialogFontFamily');
            this.activePreset = this.detectActivePreset();
        },

        /* ── Button font ───────────────────────────────────────────── */
        setBtnFontFamily(val) {
            this.props.btnFontFamily = val; this.propChanged('btnFontFamily');
            this.customFontInput = '';
        },
        applyCustomFont() {
            const raw = this.customFontInput.trim();
            if (!raw) return;
            const val = raw.includes(',') ? raw : `${raw}, sans-serif`;
            this.props.btnFontFamily = val; this.propChanged('btnFontFamily');
        },
        setBtnTextTransform(val) {
            this.props.btnTextTransform = val; this.propChanged('btnTextTransform');
        },
        onLetterSpacingSlider(e) {
            const hundredths = parseInt(e.target.value, 10);
            this.props.btnLetterSpacing = hundredths === 0 ? '' : `${(hundredths / 100).toFixed(2)}em`;
            this.propChanged('btnLetterSpacing');
        },

        /* ── Radius ────────────────────────────────────────────────── */
        applyBtnRadius(r) {
            this.props.btnRadius = r.px; this.propChanged('btnRadius');
        },
        onBtnRadiusSlider(e) {
            this.props.btnRadius = parseInt(e.target.value, 10); this.propChanged('btnRadius');
        },
        onDialogRadiusSlider(e) {
            this.props.dialogRadius = parseInt(e.target.value, 10); this.propChanged('dialogRadius');
        },

        /* ── Overlay opacity ───────────────────────────────────────── */
        onOverlayOpacitySlider(e) {
            this.props.overlayOpacity = parseInt(e.target.value, 10); this.propChanged('overlayOpacity');
        },

        /* ── Reset ─────────────────────────────────────────────────── */
        resetAll() {
            Object.entries(DEFAULTS).forEach(([key, val]) => {
                this.props[key] = val; this.propChanged(key);
            });
            this.activePreset = null;
            this.customFontInput = '';
            this.customDialogFontInput = '';
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
    margin-top: 4px;
    margin-bottom: 4px;
}

/* ── Divider ──────────────────────────────────────────────────── */
.divider { height: 1px; background: #f1f5f9; margin: 10px 0 4px; }

/* ══ LIVE PREVIEW ═════════════════════════════════════════════════ */
.dialog-preview-wrap {
    border-radius: 10px;
    overflow: hidden;
    margin-bottom: 10px;
    background-image: repeating-conic-gradient(#e9ecef 0% 25%, #f8fafc 0% 50%);
    background-size: 12px 12px;
    min-height: 140px;
    display: flex;
    align-items: stretch;
}
.dialog-preview-overlay {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px;
    transition: background 0.2s;
}
.dialog-preview-dialog {
    width: 100%;
    max-width: 260px;
    padding: 14px 16px 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    text-align: center;
    box-shadow: 0 4px 18px rgba(0,0,0,0.18);
    transition: background 0.2s, color 0.2s, border-radius 0.2s;
}
.dialog-preview-icon { font-size: 22px; line-height: 1; transition: color 0.2s; }
.dialog-preview-title { font-size: 12px; font-weight: 700; }
.dialog-preview-msg { font-size: 11px; opacity: 0.75; }
.dialog-preview-btn {
    margin-top: 4px;
    padding: 6px 16px;
    border: none;
    font-size: 11px;
    cursor: default;
    transition: background 0.2s, color 0.2s, border-radius 0.2s;
}

/* ══ PRESETS ══════════════════════════════════════════════════════ */
.presets-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 2px; }
.preset-chip {
    flex: 1 1 0;
    min-width: 52px;
    max-width: 68px;
    border: 2px solid #e2e8f0;
    border-radius: 10px;
    overflow: hidden;
    cursor: pointer;
    transition: border-color 0.13s, box-shadow 0.13s;
    background: #fff;
}
.preset-chip:hover { border-color: #a5b4fc; }
.preset-chip--active { border-color: #4f6aff; box-shadow: 0 0 0 2px rgba(79,106,255,0.18); }

.chip-overlay { height: 50px; display: flex; align-items: center; justify-content: center; padding: 4px; }
.chip-dialog {
    width: 100%; padding: 3px 4px 4px;
    display: flex; flex-direction: column; align-items: center; gap: 2px;
    border-radius: 3px; box-shadow: 0 2px 5px rgba(0,0,0,0.18);
}
.chip-icon { font-size: 8px; line-height: 1; }
.chip-bar { width: 70%; height: 2px; background: currentColor; opacity: 0.2; border-radius: 1px; }
.chip-btn { width: 80%; height: 4px; border-radius: 2px; margin-top: 1px; }
.chip-label {
    padding: 3px 4px;
    font-size: 9.5px; font-weight: 600; color: #475569;
    text-align: center; background: #fafafa; border-top: 1px solid #f1f5f9;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    display: flex; align-items: center; justify-content: center; gap: 2px;
}
.preset-chip--active .chip-label { color: #4f6aff; background: #f5f7ff; }
.chip-check { font-size: 9px; color: #4f6aff; }

/* ══ COLOR PRESETS ════════════════════════════════════════════════ */
.color-presets { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 6px; }
.color-preset {
    padding: 3px 9px;
    border-radius: 20px;
    font-size: 11px; font-weight: 500;
    cursor: pointer;
    transition: opacity 0.12s, box-shadow 0.12s;
    white-space: nowrap;
}
.color-preset:hover { opacity: 0.85; }
.color-preset--active { box-shadow: 0 0 0 2px #fff, 0 0 0 4px #4f6aff; }

/* ══ FONT ═════════════════════════════════════════════════════════ */
.font-grid { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 6px; }
.font-chip {
    padding: 4px 10px;
    border: 1.5px solid #e2e8f0;
    border-radius: 20px;
    background: #fff; color: #475569;
    font-size: 12px; font-weight: 500;
    cursor: pointer;
    transition: border-color 0.12s, color 0.12s, background 0.12s;
    white-space: nowrap;
}
.font-chip:hover { border-color: #a5b4fc; color: #4f6aff; }
.font-chip--active { border-color: #4f6aff; background: #eff2ff; color: #4f6aff; font-weight: 600; }

.custom-font-row { display: flex; gap: 6px; margin-bottom: 4px; }
.custom-font-input {
    flex: 1; padding: 6px 10px;
    border: 1.5px solid #e2e8f0; border-radius: 8px;
    font-size: 12px; font-family: inherit; outline: none;
    transition: border-color 0.15s;
}
.custom-font-input:focus { border-color: #4f6aff; }
.custom-font-btn {
    padding: 6px 10px;
    border: none; border-radius: 8px;
    background: #4f6aff; color: #fff;
    cursor: pointer; font-size: 14px;
    transition: background 0.12s;
}
.custom-font-btn:hover { background: #3b55e6; }
.custom-font-btn:disabled { background: #cbd5e1; cursor: not-allowed; }

/* ══ OPT CARDS (text-transform) ══════════════════════════════════ */
.opt-grid { display: grid; gap: 6px; margin-bottom: 2px; }
.opt-grid--4 { grid-template-columns: repeat(4, 1fr); }
.opt-card {
    display: flex; flex-direction: column; align-items: center; gap: 5px;
    padding: 8px 4px 6px;
    border: 2px solid #e2e8f0; border-radius: 8px;
    cursor: pointer; transition: border-color 0.15s, background 0.15s, color 0.15s;
    text-align: center; color: #64748b; background: #fff;
    overflow: hidden; min-width: 0;
}
.opt-card:hover { border-color: #a5b4fc; color: #334155; }
.opt-card--active { border-color: #4f6aff; background: #eff2ff; color: #4f6aff; }
.opt-card__label { font-size: 10px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; line-height: 1.2; }
.opt-card__typo-preview { font-size: 16px; font-weight: 600; line-height: 1; }

/* ══ SLIDERS ══════════════════════════════════════════════════════ */
.slider-row { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.slider { flex: 1; height: 4px; cursor: pointer; accent-color: #4f6aff; }
.slider-val { font-size: 11px; color: #64748b; white-space: nowrap; min-width: 54px; text-align: right; }

/* ══ RADIUS CARDS ═════════════════════════════════════════════════ */
.radius-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 5px; margin-bottom: 6px; }
.radius-card {
    display: flex; flex-direction: column; align-items: center; gap: 5px;
    padding: 8px 4px 6px;
    border: 2px solid #e2e8f0; border-radius: 8px;
    cursor: pointer; transition: border-color 0.15s, background 0.15s;
    background: #fff; overflow: hidden;
}
.radius-card:hover { border-color: #a5b4fc; background: #f5f7ff; }
.radius-card--active { border-color: #4f6aff; background: #eff2ff; }
.radius-card__shape {
    display: block; width: 28px; height: 18px;
    background: #4f6aff; flex-shrink: 0;
}
.radius-card--active .radius-card__shape { background: #4f6aff; }
.radius-card__label { font-size: 10px; font-weight: 500; color: #64748b; white-space: nowrap; }
.radius-card--active .radius-card__label { color: #4f6aff; font-weight: 600; }
</style>
