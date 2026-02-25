<template>
    <w-panel>
        <ui-container>

            <!-- ── Live button preview ────────────────────────────────── -->
            <div class="btn-preview-wrap">
                <div class="btn-preview" :style="fullPreviewStyle">
                    <i v-if="props.btnIconLeft" :class="props.btnIconLeft" />
                    <span v-if="props.btnShowText !== false">{{ props.btnText || 'Подробнее' }}</span>
                    <span v-else-if="!props.btnIconLeft && !props.btnIconRight" class="preview-icon-only">
                        <i class="mdi mdi-gesture-tap" />
                    </span>
                    <i v-if="props.btnIconRight" :class="props.btnIconRight" />
                </div>
            </div>
            <ui-switch prop="btnShowText">Показывать текст</ui-switch>
            <template v-if="props.btnShowText !== false">
                <div class="text-presets">
                    <button
                        v-for="t in textPresets"
                        :key="t"
                        class="text-preset"
                        :class="{ 'text-preset--active': props.btnText === t }"
                        @click="setBtnText(t)">
                        {{ t }}
                    </button>
                </div>
                <ui-input prop="btnText" placeholder="Подробнее">Свой текст</ui-input>
            </template>

            <!-- ── Вариант стиля ───────────────────────────────────── -->
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

            <!-- ── Цвета ──────────────────────────────────────────── -->
            <template v-if="!isGlass">
                <div class="section-label">Цветовые пресеты</div>
                <div class="color-presets">
                    <button
                        v-for="p in visibleColorPresets"
                        :key="p.label"
                        class="color-preset"
                        :class="{ 'color-preset--active': isColorPresetActive(p) }"
                        :title="p.label"
                        :style="colorPresetStyle(p)"
                        @click="applyColorPreset(p)">
                        {{ p.label }}
                    </button>
                </div>

                <ui-input-cp prop="btnBg">{{ isGradient ? 'Цвет начала' : 'Фон кнопки' }}</ui-input-cp>
                <template v-if="isGradient">
                    <div class="gradient-strip-row">
                        <div class="gradient-strip" :style="gradientStripStyle" />
                        <span class="gradient-strip-arrow">→</span>
                    </div>
                    <ui-input-cp prop="btnGradientTo">Цвет конца</ui-input-cp>
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

            <!-- ── Эффект при наведении ───────────────────────────── -->
            <div class="section-label">Эффект при наведении</div>
            <div class="opt-grid opt-grid--3">
                <div
                    v-for="e in hoverEffectOptions"
                    :key="e.value"
                    class="opt-card effect-card"
                    :class="{ 'opt-card--active': hoverEffect === e.value }"
                    @click="hoverEffect = e.value">
                    <div class="effect-demo" :class="`effect-demo--${e.value}`">
                        <span class="effect-demo__pill" />
                    </div>
                    <div class="opt-card__label">{{ e.label }}</div>
                </div>
            </div>

            <!-- ── Курсор ─────────────────────────────────────────── -->
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

            <!-- ── Иконки ─────────────────────────────────────────── -->
            <div class="section-label">Иконки</div>

            <div v-if="iconPickerOpen" class="icon-picker">
                <div class="icon-picker__hd">
                    <span class="icon-picker__title">
                        {{ iconPickerTarget === 'left'
                            ? (iconOnlyMode ? 'Иконка по центру' : 'Левая иконка')
                            : 'Правая иконка' }}
                    </span>
                    <button class="icon-picker__close" @click="iconPickerOpen = false">
                        <i class="mdi mdi-close" />
                    </button>
                </div>
                <div class="icon-picker__grid">
                    <button
                        v-for="ico in quickIcons"
                        :key="ico"
                        class="icon-picker__btn"
                        :class="{ 'icon-picker__btn--on': isActivePickerIcon(ico) }"
                        :title="ico"
                        @click="pickIcon(ico)">
                        <i :class="`mdi mdi-${ico}`" />
                    </button>
                </div>
            </div>

            <template v-if="iconOnlyMode">
                <div class="icon-solo">
                    <button
                        class="icon-solo__preview"
                        :class="{ 'icon-solo__preview--empty': !props.btnIconLeft }"
                        @click="openIconPicker('left')">
                        <i v-if="props.btnIconLeft" :class="props.btnIconLeft" />
                        <i v-else class="mdi mdi-plus-circle-outline" />
                    </button>
                    <div class="icon-solo__right">
                        <div class="icon-smart-wrap">
                            <span class="icon-pfx">mdi-</span>
                            <input
                                class="icon-txt"
                                :value="iconNameOnly(props.btnIconLeft)"
                                placeholder="home, star, arrow-right…"
                                @input="onIconInput('left', $event)" />
                            <button v-if="props.btnIconLeft" class="icon-x" @click="setIconProp('btnIconLeft', '')">
                                <i class="mdi mdi-close-circle" />
                            </button>
                        </div>
                        <div class="icon-solo__hint">Иконка центрируется автоматически</div>
                    </div>
                </div>
            </template>

            <template v-else>
                <div class="icon-row">
                    <div class="icon-field">
                        <button
                            class="icon-preview icon-preview--pick"
                            :class="{ 'icon-preview--empty': !props.btnIconLeft }"
                            @click="openIconPicker('left')">
                            <i v-if="props.btnIconLeft" :class="props.btnIconLeft" />
                            <i v-else class="mdi mdi-plus" />
                        </button>
                        <div class="icon-smart-wrap">
                            <span class="icon-pfx">mdi-</span>
                            <input
                                class="icon-txt"
                                :value="iconNameOnly(props.btnIconLeft)"
                                @input="onIconInput('left', $event)"
                                placeholder="home" />
                            <button v-if="props.btnIconLeft" class="icon-x" @click="setIconProp('btnIconLeft', '')">
                                <i class="mdi mdi-close-circle" />
                            </button>
                        </div>
                        <div class="icon-field__lbl">Слева</div>
                    </div>
                    <div class="icon-field">
                        <button
                            class="icon-preview icon-preview--pick"
                            :class="{ 'icon-preview--empty': !props.btnIconRight }"
                            @click="openIconPicker('right')">
                            <i v-if="props.btnIconRight" :class="props.btnIconRight" />
                            <i v-else class="mdi mdi-plus" />
                        </button>
                        <div class="icon-smart-wrap">
                            <span class="icon-pfx">mdi-</span>
                            <input
                                class="icon-txt"
                                :value="iconNameOnly(props.btnIconRight)"
                                @input="onIconInput('right', $event)"
                                placeholder="arrow-right" />
                            <button v-if="props.btnIconRight" class="icon-x" @click="setIconProp('btnIconRight', '')">
                                <i class="mdi mdi-close-circle" />
                            </button>
                        </div>
                        <div class="icon-field__lbl">Справа</div>
                    </div>
                </div>
            </template>

            <!-- ── Размер ──────────────────────────────────────────── -->
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

            <!-- ── Скругление ──────────────────────────────────────── -->
            <div class="section-label">Скругление углов</div>
            <div class="radius-grid">
                <button
                    v-for="r in radiusPresets"
                    :key="r.label"
                    class="radius-card"
                    :class="{ 'radius-card--active': radiusChipActive === r.label }"
                    @click="applyRadiusPreset(r)">
                    <span class="radius-card__shape" :style="{ borderRadius: r.shape }"></span>
                    <span class="radius-card__label">{{ r.label }}</span>
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

            <!-- ── Тень ────────────────────────────────────────────── -->
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

            <!-- ── Рамка ───────────────────────────────────────────── -->
            <ui-switch v-model="hasBorder">Рамка</ui-switch>
            <ui-input-cp v-if="hasBorder" prop="btnBorderColor">Цвет рамки</ui-input-cp>

            <!-- ── Toggle-состояние ────────────────────────────────── -->
            <ui-collapse>
                <template #header>Цвета в активном состоянии (Toggle)</template>
                <ui-container>
                    <ui-input-cp prop="btnToggleBg">Фон (нажата)</ui-input-cp>
                    <ui-input-cp prop="btnToggleColor">Текст (нажата)</ui-input-cp>
                </ui-container>
            </ui-collapse>

            <!-- ── Сброс ───────────────────────────────────────────── -->
            <ui-button type="ghost" @click="resetAll">Сбросить оформление</ui-button>

        </ui-container>
    </w-panel>
</template>

<script>
import { Panel } from 'goodt-wcore';

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

function toRem(cssVal) {
    if (!cssVal) return 0;
    const s = String(cssVal).trim();
    if (s.endsWith('rem')) return parseFloat(s) || 0;
    if (s.endsWith('px')) return Math.round((parseFloat(s) / 16) * 1000) / 1000;
    return parseFloat(s) || 0;
}

function snapRem(val, step = 0.125) {
    return Math.round(val / step) * step;
}

export default {
    extends: Panel,
    meta: { name: 'Стили', icon: 'palette' },
    data: () => ({
        iconPickerOpen: false,
        iconPickerTarget: 'left',
        quickIcons: [
            'home', 'arrow-left', 'arrow-right', 'arrow-up', 'arrow-down',
            'chevron-left', 'chevron-right', 'chevron-up', 'chevron-down',
            'plus', 'minus', 'close', 'check', 'pencil', 'delete-outline',
            'download', 'upload', 'share-variant', 'send', 'refresh', 'magnify',
            'star-outline', 'heart-outline', 'bookmark-outline', 'bell-outline',
            'eye-outline', 'eye-off-outline', 'lock-outline', 'account-circle-outline',
            'cog-outline', 'filter-variant', 'menu', 'dots-vertical',
            'email-outline', 'phone-outline', 'chat-outline',
            'play', 'pause', 'stop', 'skip-next', 'volume-high',
            'information-outline', 'alert-circle-outline', 'help-circle-outline',
            'check-circle-outline', 'close-circle-outline',
            'link-variant', 'map-marker-outline', 'calendar-outline',
            'clock-outline', 'lightning-bolt', 'cart-outline',
            'file-document-outline', 'image-outline', 'camera-outline', 'qrcode'
        ],
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
            { label: 'Стандарт',   value: 'default' },
            { label: 'Подъём',     value: 'lift' },
            { label: 'Свечение',   value: 'glow' },
            { label: 'Увеличение', value: 'scale' },
            { label: 'Пульс',      value: 'pulse' },
            { label: 'Без',        value: 'none' }
        ],
        cursorOptions: [
            { label: 'Рука',    value: 'pointer',   icon: 'mdi mdi-hand-pointing-right' },
            { label: 'Стрелка', value: 'default',   icon: 'mdi mdi-cursor-default-outline' },
            { label: 'Прицел',  value: 'crosshair', icon: 'mdi mdi-crosshairs' },
            { label: 'Лупа',    value: 'zoom-in',   icon: 'mdi mdi-magnify-plus' },
            { label: 'Помощь',  value: 'help',      icon: 'mdi mdi-help-circle-outline' },
            { label: 'Захват',  value: 'grab',      icon: 'mdi mdi-hand-back-left-outline' }
        ],
        textPresets: [
            'Подробнее', 'Сохранить', 'Далее', 'Назад',
            'Войти', 'Отправить', 'Купить', 'Скачать'
        ],
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
        iconOnlyMode() { return this.props.btnShowText === false; },

        gradientStripStyle() {
            const { btnBg, btnGradientTo } = this.props;
            return {
                background: `linear-gradient(to right, ${btnBg || '#4f6aff'}, ${btnGradientTo || '#7c3aed'})`
            };
        },

        visibleColorPresets() {
            if (!this.isGradient) return this.colorPresets;
            return this.colorPresets.filter((p) => p.bg !== '#f1f5f9' && p.bg !== '#ffffff');
        },

        fullPreviewStyle() {
            const {
                btnBg, btnColor, btnBorderRadius, btnFontSize, btnFontWeight,
                btnPaddingV, btnPaddingH, btnBorderWidth, btnBorderColor,
                btnGradientTo, btnGradientAngle, btnIsGlass
            } = this.props;
            let bg = btnBg || '#4f6aff';
            if (btnGradientTo) bg = `linear-gradient(${btnGradientAngle || '135deg'}, ${bg}, ${btnGradientTo})`;
            if (btnIsGlass) bg = 'rgba(255,255,255,0.15)';
            return {
                background: bg,
                color: btnColor || '#fff',
                borderRadius: btnBorderRadius || '8px',
                fontSize: btnFontSize || '14px',
                fontWeight: btnFontWeight || '500',
                padding: `${btnPaddingV || '10px'} ${btnPaddingH || '20px'}`,
                border: (btnBorderWidth && btnBorderWidth !== '0px')
                    ? `${btnBorderWidth} solid ${btnBorderColor || 'currentColor'}`
                    : 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                lineHeight: '1.4',
                maxWidth: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                boxSizing: 'border-box',
                pointerEvents: 'none'
            };
        },

        sizeSliderRem() {
            return Math.min(3, Math.max(0.25, snapRem(toRem(this.props.btnPaddingV || '10px'))));
        },

        radiusSliderRem() {
            const raw = this.props.btnBorderRadius || '8px';
            if (parseFloat(raw) >= 100) return 2;
            return Math.min(2, snapRem(toRem(raw)));
        },

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
    methods: {
        onSizeSlider(e) { this.applySizeRem(parseFloat(e.target.value)); },
        applySizeRem(rem) {
            const pxV = Math.round(rem * 16);
            const pxH = Math.round(rem * 32);
            const fontSize = Math.round(12 + (rem - 0.25) / (3 - 0.25) * 12);
            this.props.btnPaddingV = `${pxV}px`; this.propChanged('btnPaddingV');
            this.props.btnPaddingH = `${pxH}px`; this.propChanged('btnPaddingH');
            this.props.btnFontSize = `${fontSize}px`; this.propChanged('btnFontSize');
        },
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
        onRadiusSlider(e) {
            const rem = parseFloat(e.target.value);
            this.props.btnBorderRadius = `${rem}rem`;
            this.propChanged('btnBorderRadius');
        },
        applyRadiusPreset(r) {
            this.props.btnBorderRadius = r.css;
            this.propChanged('btnBorderRadius');
        },
        iconNameOnly(cls) {
            if (!cls) return '';
            return cls.replace(/^mdi\s+mdi-/, '').replace(/^mdi-/, '');
        },
        onIconInput(target, e) {
            const raw = (e.target.value || '').trim();
            const name = raw.replace(/^mdi\s+mdi-/, '').replace(/^mdi-/, '');
            const full = name ? `mdi mdi-${name}` : '';
            this.setIconProp(target === 'left' ? 'btnIconLeft' : 'btnIconRight', full);
        },
        setIconProp(prop, val) { this.props[prop] = val; this.propChanged(prop); },
        openIconPicker(target) {
            if (this.iconPickerOpen && this.iconPickerTarget === target) {
                this.iconPickerOpen = false;
            } else {
                this.iconPickerTarget = target;
                this.iconPickerOpen = true;
            }
        },
        pickIcon(ico) {
            const prop = this.iconPickerTarget === 'left' ? 'btnIconLeft' : 'btnIconRight';
            this.setIconProp(prop, `mdi mdi-${ico}`);
        },
        isActivePickerIcon(ico) {
            const prop = this.iconPickerTarget === 'left' ? 'btnIconLeft' : 'btnIconRight';
            return this.props[prop] === `mdi mdi-${ico}`;
        },
        colorPresetStyle(p) {
            const style = this.stylePreset;
            const angle = this.props.btnGradientAngle || '135deg';
            if (style === 'outlined') return { background: 'transparent', color: p.bg, border: `2px solid ${p.bg}` };
            if (style === 'ghost')    return { background: 'transparent', color: p.bg, border: '1.5px solid transparent' };
            if (style === 'gradient') return { background: `linear-gradient(${angle}, ${p.bg}, #7c3aed)`, color: '#fff', border: 'none' };
            return { background: p.bg, color: p.color, border: p.border || 'none' };
        },
        isColorPresetActive(p) {
            const style = this.stylePreset;
            if (style === 'outlined') return this.props.btnColor === p.bg && this.props.btnBorderColor === p.bg;
            if (style === 'ghost')    return this.props.btnColor === p.bg;
            return this.props.btnBg === p.bg && this.props.btnColor === p.color;
        },
        applyColorPreset(p) {
            const style = this.stylePreset;
            if (style === 'outlined') {
                this.props.btnBg = 'transparent';  this.propChanged('btnBg');
                this.props.btnColor = p.bg;        this.propChanged('btnColor');
                this.props.btnBorderColor = p.bg;  this.propChanged('btnBorderColor');
                return;
            }
            if (style === 'ghost') {
                this.props.btnBg = 'transparent';  this.propChanged('btnBg');
                this.props.btnColor = p.bg;        this.propChanged('btnColor');
                return;
            }
            if (style === 'gradient') {
                this.props.btnBg = p.bg; this.propChanged('btnBg');
                if (!this.props.btnGradientTo) { this.props.btnGradientTo = '#7c3aed'; this.propChanged('btnGradientTo'); }
                this.props.btnColor = '#ffffff'; this.propChanged('btnColor');
                return;
            }
            this.props.btnBg = p.bg;       this.propChanged('btnBg');
            this.props.btnColor = p.color; this.propChanged('btnColor');
            if (this.props.btnGradientTo) { this.props.btnGradientTo = ''; this.propChanged('btnGradientTo'); }
        },
        setBtnText(text) { this.props.btnText = text; this.propChanged('btnText'); },
        resetAll() {
            Object.entries(DEFAULTS).forEach(([key, val]) => {
                this.props[key] = val;
                this.propChanged(key);
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
    margin-top: 4px;
    margin-bottom: 4px;
}

/* ── Option grid ──────────────────────────────────────────────── */
.opt-grid { display: grid; gap: 6px; margin-bottom: 2px; }
.opt-grid--3 { grid-template-columns: repeat(3, 1fr); }
.opt-grid--4 { grid-template-columns: repeat(4, 1fr); }
.opt-grid--5 { grid-template-columns: repeat(5, 1fr); }

/* ── Option card ──────────────────────────────────────────────── */
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

/* ── Hover effect demos ──────────────────────────────────────── */
.effect-card { gap: 4px; padding-top: 10px; padding-bottom: 8px; }
.effect-demo {
    width: 38px; height: 22px;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.effect-demo__pill {
    display: block;
    width: 34px; height: 14px;
    background: #4f6aff;
    border-radius: 4px;
    transition: transform 0.22s ease, box-shadow 0.22s ease, filter 0.18s ease;
    box-shadow: 0 2px 6px rgba(79, 106, 255, 0.3);
}
.opt-card:hover .effect-demo--default .effect-demo__pill { filter: brightness(0.82); }
.opt-card:hover .effect-demo--lift .effect-demo__pill { transform: translateY(-5px); box-shadow: 0 8px 16px rgba(0,0,0,0.22); }
.opt-card:hover .effect-demo--glow .effect-demo__pill { box-shadow: 0 0 0 3px rgba(79,106,255,0.22), 0 0 14px rgba(79,106,255,0.7); }
.opt-card:hover .effect-demo--scale .effect-demo__pill { transform: scale(1.22); }
.effect-demo--pulse .effect-demo__pill { animation: effect-pill-pulse 1.8s ease-in-out infinite; }
@keyframes effect-pill-pulse {
    0%,100% { box-shadow: 0 2px 6px rgba(79,106,255,0.3), 0 0 0 0 rgba(79,106,255,0.45); }
    50%      { box-shadow: 0 2px 6px rgba(79,106,255,0.3), 0 0 0 6px rgba(79,106,255,0); }
}

/* ── Variant preview ──────────────────────────────────────────── */
.opt-card__variant-preview { width: 32px; height: 16px; border-radius: 4px; flex-shrink: 0; }
.preview--filled   { background: #4f6aff; }
.preview--outlined { background: transparent; border: 2px solid #4f6aff; }
.preview--ghost    { background: transparent; }
.preview--gradient { background: linear-gradient(135deg, #4f6aff, #7c3aed); }
.preview--glass    { background: rgba(79,106,255,0.15); border: 1px solid rgba(79,106,255,0.35); }

/* ── Shadow dot ──────────────────────────────────────────────── */
.opt-card__shadow-dot { width: 22px; height: 22px; background: #fff; border: 1px solid #e2e8f0; border-radius: 4px; flex-shrink: 0; }

/* ── Size preview cards ─────────────────────────────────────── */
.size-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 5px; margin-bottom: 6px; }
.size-card {
    display: flex; flex-direction: column; align-items: center; gap: 4px;
    padding: 6px 3px 5px;
    border: 2px solid #e2e8f0; border-radius: 8px;
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s;
    background: #fff; overflow: hidden;
}
.size-card:hover { border-color: #a5b4fc; background: #f5f7ff; }
.size-card--active { border-color: #4f6aff; background: #eff2ff; }
.size-card__stage { display: flex; align-items: center; justify-content: center; height: 38px; width: 100%; overflow: hidden; }
.size-card__name { font-size: 10px; font-weight: 500; color: #64748b; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%; padding: 0 2px; }
.size-card--active .size-card__name { color: #4f6aff; font-weight: 600; }

/* ── Radius grid (4-col) ────────────────────────────────────── */
.radius-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 6px;
    margin-bottom: 6px;
}
.radius-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    padding: 8px 4px 6px;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    background: #fff;
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s, color 0.15s;
    color: #64748b;
}
.radius-card:hover { border-color: #a5b4fc; color: #334155; }
.radius-card--active { border-color: #4f6aff; background: #eff2ff; color: #4f6aff; }
.radius-card__shape {
    display: inline-block;
    width: 22px; height: 14px;
    background: currentColor;
    opacity: 0.7;
    flex-shrink: 0;
}
.radius-card__label { font-size: 10px; font-weight: 500; white-space: nowrap; line-height: 1.2; }

/* ── Slider ──────────────────────────────────────────────────── */
.slider-row { display: flex; align-items: center; gap: 10px; margin-bottom: 2px; }
.slider {
    flex: 1; -webkit-appearance: none; appearance: none;
    height: 4px; border-radius: 2px; background: #e2e8f0; outline: none; cursor: pointer;
}
.slider::-webkit-slider-thumb {
    -webkit-appearance: none; appearance: none;
    width: 16px; height: 16px; border-radius: 50%;
    background: #4f6aff; cursor: pointer;
    border: 2px solid #fff; box-shadow: 0 1px 4px rgba(79,106,255,0.4);
    transition: transform 0.1s;
}
.slider::-webkit-slider-thumb:hover { transform: scale(1.2); }
.slider::-moz-range-thumb { width: 14px; height: 14px; border-radius: 50%; background: #4f6aff; cursor: pointer; border: 2px solid #fff; }
.slider-val { font-size: 11px; font-weight: 600; color: #4f6aff; white-space: nowrap; min-width: 52px; text-align: right; }

/* ── Color presets ───────────────────────────────────────────── */
.color-presets { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 6px; }
.color-preset {
    padding: 3px 10px; border-radius: 20px;
    font-size: 11px; font-weight: 600; cursor: pointer;
    transition: transform 0.1s, box-shadow 0.1s;
    white-space: nowrap; outline: none;
}
.color-preset:hover { transform: scale(1.07); box-shadow: 0 2px 8px rgba(0,0,0,0.18); }
.color-preset--active { box-shadow: 0 0 0 2px #4f6aff, 0 2px 8px rgba(79,106,255,0.3); transform: scale(1.05); }

/* ── Gradient strip ──────────────────────────────────────────── */
.gradient-strip-row { display: flex; align-items: center; gap: 8px; margin: 2px 0; }
.gradient-strip { flex: 1; height: 18px; border-radius: 6px; border: 1px solid rgba(0,0,0,0.08); }
.gradient-strip-arrow { font-size: 16px; color: #94a3b8; flex-shrink: 0; line-height: 1; }

/* ── Icon picker ─────────────────────────────────────────────── */
.icon-picker { border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; margin-bottom: 8px; background: #fff; box-shadow: 0 2px 12px rgba(0,0,0,0.07); }
.icon-picker__hd { display: flex; align-items: center; justify-content: space-between; padding: 7px 10px 6px; background: #f8fafc; border-bottom: 1px solid #f0f4f8; }
.icon-picker__title { font-size: 11px; font-weight: 600; color: #64748b; letter-spacing: 0.04em; text-transform: uppercase; }
.icon-picker__close { width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; border: none; background: transparent; color: #94a3b8; cursor: pointer; border-radius: 5px; font-size: 14px; transition: background 0.1s, color 0.1s; padding: 0; }
.icon-picker__close:hover { background: #fee2e2; color: #dc2626; }
.icon-picker__grid { display: grid; grid-template-columns: repeat(8, 1fr); gap: 2px; padding: 6px; max-height: 168px; overflow-y: auto; }
.icon-picker__btn { display: flex; align-items: center; justify-content: center; height: 32px; border: 1.5px solid transparent; border-radius: 7px; background: transparent; color: #475569; font-size: 17px; cursor: pointer; transition: background 0.1s, color 0.1s, border-color 0.1s; padding: 0; }
.icon-picker__btn:hover { background: #eff2ff; color: #4f6aff; }
.icon-picker__btn--on { background: #eff2ff; color: #4f6aff; border-color: #4f6aff; }

/* ── Icon solo (icon-only mode) ──────────────────────────────── */
.icon-solo { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 4px; }
.icon-solo__preview { flex-shrink: 0; width: 56px; height: 56px; display: flex; align-items: center; justify-content: center; background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 24px; color: #475569; cursor: pointer; transition: border-color 0.15s, background 0.15s, color 0.15s; padding: 0; }
.icon-solo__preview:hover { border-color: #a5b4fc; color: #4f6aff; background: #f5f7ff; }
.icon-solo__preview--empty { color: #c8d5e8; }
.icon-solo__right { flex: 1; display: flex; flex-direction: column; gap: 5px; padding-top: 4px; }
.icon-solo__hint { font-size: 10px; color: #94a3b8; }

/* ── Left/right icon fields ──────────────────────────────────── */
.icon-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 2px; }
.icon-field { display: flex; flex-direction: column; gap: 3px; min-width: 0; overflow: hidden; }
.icon-field__lbl { font-size: 10px; font-weight: 500; color: #94a3b8; text-align: center; }
.icon-preview { display: flex; align-items: center; justify-content: center; height: 36px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 7px; font-size: 20px; color: #475569; }
.icon-preview--pick { cursor: pointer; border-style: dashed; transition: border-color 0.15s, background 0.15s, color 0.15s; padding: 0; width: 100%; }
.icon-preview--pick:hover { border-color: #a5b4fc; color: #4f6aff; background: #f5f7ff; }
.icon-preview--empty { color: #c8d5e8; }

/* ── Smart icon input ────────────────────────────────────────── */
.icon-smart-wrap { display: flex; align-items: center; border: 1px solid #e2e8f0; border-radius: 7px; background: #fff; overflow: hidden; transition: border-color 0.15s; }
.icon-smart-wrap:focus-within { border-color: #4f6aff; }
.icon-pfx { font-size: 11px; font-family: monospace; color: #94a3b8; padding: 0 0 0 7px; white-space: nowrap; flex-shrink: 0; line-height: 1; user-select: none; }
.icon-txt { flex: 1; border: none; outline: none; background: transparent; font-size: 12px; font-family: monospace; color: #1e293b; padding: 5px 4px; min-width: 0; }
.icon-x { flex-shrink: 0; display: flex; align-items: center; justify-content: center; width: 22px; height: 22px; margin-right: 2px; border: none; background: transparent; color: #94a3b8; cursor: pointer; border-radius: 4px; font-size: 14px; padding: 0; transition: color 0.1s; }
.icon-x:hover { color: #dc2626; }

/* ── Live button preview ─────────────────────────────────────── */
.btn-preview-wrap {
    display: flex; align-items: center; justify-content: center;
    padding: 14px 8px;
    background: repeating-conic-gradient(#f0f0f0 0% 25%, #fafafa 0% 50%) 0 0 / 12px 12px;
    border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 4px; min-height: 56px;
}
.btn-preview { transition: all 0.15s; }
.preview-icon-only { opacity: 0.35; font-size: 18px; }

/* ── Text presets ────────────────────────────────────────────── */
.text-presets { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 4px; }
.text-preset { padding: 3px 9px; border-radius: 20px; border: 1.5px solid #e2e8f0; background: #fff; color: #475569; font-size: 11px; font-weight: 500; cursor: pointer; transition: border-color 0.12s, background 0.12s, color 0.12s; white-space: nowrap; }
.text-preset:hover { border-color: #a5b4fc; color: #4f6aff; }
.text-preset--active { border-color: #4f6aff; background: #eff2ff; color: #4f6aff; font-weight: 600; }
</style>
