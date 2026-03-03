<template>
    <w-panel>
        <ui-container>

            <!-- ── Live preview ───────────────────────────────────────────── -->
            <div class="preview-wrap">
                <div
                    v-for="i in 3"
                    :key="i"
                    class="preview-item"
                    :style="previewItemStyle">
                    <div class="preview-header" :style="i === 1 ? previewHeaderOpenStyle : previewHeaderStyle">
                        <span class="preview-header__title">Раздел {{ i }}</span>
                        <i
                            :class="i === 1 ? (props.iconOpen || 'mdi mdi-chevron-up') : (props.iconClosed || 'mdi mdi-chevron-down')"
                            class="preview-header__icon"
                            :style="{ color: props.accentColor || '#4f6aff' }" />
                    </div>
                    <div v-if="i === 1" class="preview-body" :style="previewBodyStyle">
                        Содержимое раздела…
                    </div>
                </div>
            </div>

            <!-- ── Стиль ──────────────────────────────────────────────────── -->
            <div class="section-label">Стиль</div>
            <div class="opt-grid opt-grid--5">
                <div
                    v-for="v in stylePresetOptions"
                    :key="v.value"
                    class="opt-card"
                    :class="{ 'opt-card--active': stylePreset === v.value }"
                    @click="stylePreset = v.value">
                    <div class="opt-card__acc-prev" :class="`acc-prev--${v.value}`" />
                    <div class="opt-card__label">{{ v.label }}</div>
                </div>
            </div>

            <!-- ── Цветовые пресеты ───────────────────────────────────────── -->
            <div class="section-label">Цветовые пресеты</div>
            <div class="color-presets">
                <button
                    v-for="p in colorPresets"
                    :key="p.label"
                    class="color-preset"
                    :class="{ 'color-preset--active': (props.accentColor || '#4f6aff') === p.accent }"
                    :title="p.label"
                    :style="{ background: p.accent }"
                    @click="applyColorPreset(p)" />
            </div>

            <!-- ── Акцент ─────────────────────────────────────────────────── -->
            <div class="section-label">Акцентный цвет</div>
            <ui-input-cp prop="accentColor">Акцент (иконка, открытый заголовок)</ui-input-cp>

            <!-- ── Детальные цвета ────────────────────────────────────────── -->
            <ui-collapse>
                <template #header>Заголовок</template>
                <ui-container>
                    <ui-input-cp prop="headerBg">Фон заголовка</ui-input-cp>
                    <ui-input-cp prop="headerColor">Цвет текста</ui-input-cp>
                    <ui-input-cp prop="borderColor">Цвет рамки / разделителя</ui-input-cp>
                </ui-container>
            </ui-collapse>

            <ui-collapse>
                <template #header>Содержимое</template>
                <ui-container>
                    <ui-input-cp prop="contentBg">Фон</ui-input-cp>
                    <ui-input-cp prop="contentColor">Цвет текста</ui-input-cp>
                </ui-container>
            </ui-collapse>

            <!-- ── Размер шрифта заголовка ────────────────────────────────── -->
            <div class="section-label">Размер шрифта заголовка</div>
            <div class="size-chips">
                <button
                    v-for="s in fontSizeOptions"
                    :key="s.value"
                    class="size-chip"
                    :class="{ 'size-chip--active': (props.headerFontSize || '15px') === s.value }"
                    @click="setHeaderFontSize(s.value)">
                    {{ s.label }}
                </button>
            </div>

            <!-- ── Скругление ─────────────────────────────────────────────── -->
            <div class="section-label">Скругление блоков</div>
            <div class="radius-grid">
                <button
                    v-for="r in radiusPresets"
                    :key="r.label"
                    class="radius-card"
                    :class="{ 'radius-card--active': radiusActive === r.label }"
                    @click="applyRadiusPreset(r)">
                    <span class="radius-card__shape" :style="{ borderRadius: r.shape }" />
                    <span class="radius-card__label">{{ r.label }}</span>
                </button>
            </div>
            <div class="slider-row">
                <input
                    type="range"
                    class="slider"
                    min="0"
                    max="24"
                    step="1"
                    :value="radiusSliderPx"
                    @input="onRadiusSlider" />
                <span class="slider-val">{{ radiusSliderPx }}px</span>
            </div>

            <!-- ── Расстояние между блоками ───────────────────────────────── -->
            <div class="section-label">Расстояние между блоками</div>
            <div class="slider-row">
                <input
                    type="range"
                    class="slider"
                    min="0"
                    max="20"
                    step="1"
                    :value="gapSliderPx"
                    @input="onGapSlider" />
                <span class="slider-val">{{ gapSliderPx }}px</span>
            </div>
            <div class="gap-chips">
                <button
                    v-for="g in gapOptions"
                    :key="g.label"
                    class="size-chip"
                    :class="{ 'size-chip--active': (props.itemGap || '8px') === g.value }"
                    @click="setGap(g.value)">
                    {{ g.label }}
                </button>
            </div>

            <!-- ── Сброс ───────────────────────────────────────────────────── -->
            <ui-button type="ghost" @click="resetAll">Сбросить оформление</ui-button>

        </ui-container>
    </w-panel>
</template>

<script>
import { Panel } from '@goodt-wcore/panel';
import { PanelInstanceTypeDescriptor } from '../types';

const DEFAULTS = {
    headerBg: '#ffffff',
    headerColor: '#1e293b',
    headerFontSize: '15px',
    headerFontWeight: '600',
    headerPadding: '16px 20px',
    contentBg: '#f8fafc',
    contentColor: '#475569',
    contentFontSize: '14px',
    contentPadding: '12px 20px 16px',
    accentColor: '#4f6aff',
    borderColor: '#e2e8f0',
    borderRadius: '12px',
    itemGap: '8px'
};

const STYLE_PRESETS = {
    classic: {
        headerBg: '#ffffff',
        headerColor: '#1e293b',
        contentBg: '#f8fafc',
        contentColor: '#475569',
        accentColor: '#4f6aff',
        borderColor: '#e2e8f0',
        borderRadius: '12px',
        itemGap: '8px'
    },
    cards: {
        headerBg: '#ffffff',
        headerColor: '#1e293b',
        contentBg: '#ffffff',
        contentColor: '#475569',
        accentColor: '#4f6aff',
        borderColor: '#e2e8f0',
        borderRadius: '16px',
        itemGap: '12px'
    },
    dark: {
        headerBg: '#1e293b',
        headerColor: '#f8fafc',
        contentBg: '#0f172a',
        contentColor: '#94a3b8',
        accentColor: '#4f6aff',
        borderColor: '#334155',
        borderRadius: '12px',
        itemGap: '8px'
    },
    minimal: {
        headerBg: 'transparent',
        headerColor: '#334155',
        contentBg: 'transparent',
        contentColor: '#64748b',
        accentColor: '#4f6aff',
        borderColor: '#e2e8f0',
        borderRadius: '0px',
        itemGap: '0px'
    },
    lined: {
        headerBg: '#ffffff',
        headerColor: '#1e293b',
        contentBg: '#ffffff',
        contentColor: '#475569',
        accentColor: '#4f6aff',
        borderColor: '#e2e8f0',
        borderRadius: '0px',
        itemGap: '0px'
    }
};

function parsePx(val) {
    if (!val) return 0;
    const n = parseFloat(String(val));
    return isNaN(n) ? 0 : Math.round(n);
}

export default {
    extends: Panel,
    meta: { name: 'Внешний вид', icon: 'format-paint' },
    data: () => ({
        ...PanelInstanceTypeDescriptor,
        stylePresetOptions: [
            { label: 'Классик', value: 'classic' },
            { label: 'Карточки', value: 'cards' },
            { label: 'Тёмный', value: 'dark' },
            { label: 'Минимал', value: 'minimal' },
            { label: 'Линии', value: 'lined' }
        ],
        colorPresets: [
            { label: 'Синий',    accent: '#4f6aff' },
            { label: 'Фиолет.',  accent: '#7c3aed' },
            { label: 'Голубой',  accent: '#0ea5e9' },
            { label: 'Зелёный',  accent: '#10b981' },
            { label: 'Янтарный', accent: '#f59e0b' },
            { label: 'Красный',  accent: '#ef4444' },
            { label: 'Розовый',  accent: '#ec4899' },
            { label: 'Тёмный',   accent: '#1e293b' },
            { label: 'Серый',    accent: '#64748b' },
            { label: 'Коричн.',  accent: '#92400e' }
        ],
        radiusPresets: [
            { label: 'Острые',  shape: '0',    css: '0px' },
            { label: 'Мягкие',  shape: '5px',  css: '6px' },
            { label: 'Округл.', shape: '9px',  css: '12px' },
            { label: 'Крупн.',  shape: '14px', css: '16px' }
        ],
        fontSizeOptions: [
            { label: 'S 13px',  value: '13px' },
            { label: 'M 14px',  value: '14px' },
            { label: 'L 15px',  value: '15px' },
            { label: 'XL 16px', value: '16px' },
            { label: 'XXL 18px', value: '18px' }
        ],
        gapOptions: [
            { label: 'Вплотную', value: '0px' },
            { label: '4px', value: '4px' },
            { label: '8px', value: '8px' },
            { label: '12px', value: '12px' },
            { label: '16px', value: '16px' }
        ]
    }),
    computed: {
        previewItemStyle() {
            const radius = this.props.borderRadius || '12px';
            const gap = this.props.itemGap || '8px';
            return {
                border: `1px solid ${this.props.borderColor || '#e2e8f0'}`,
                borderRadius: radius,
                marginBottom: gap,
                overflow: 'hidden',
                background: this.props.headerBg || '#ffffff'
            };
        },
        previewHeaderStyle() {
            return {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '7px 10px',
                background: this.props.headerBg || '#ffffff',
                color: this.props.headerColor || '#1e293b',
                fontSize: '10px',
                fontWeight: '600',
                cursor: 'default'
            };
        },
        previewHeaderOpenStyle() {
            return {
                ...this.previewHeaderStyle,
                color: this.props.accentColor || '#4f6aff',
                borderBottom: `1px solid ${this.props.borderColor || '#e2e8f0'}`
            };
        },
        previewBodyStyle() {
            return {
                background: this.props.contentBg || '#f8fafc',
                color: this.props.contentColor || '#475569',
                fontSize: '10px',
                padding: '6px 10px 8px',
                lineHeight: '1.4'
            };
        },
        stylePreset: {
            get() {
                const { headerBg, borderRadius, itemGap } = this.props;
                const bg = headerBg || '#ffffff';
                if (bg === '#1e293b') return 'dark';
                if (bg === 'transparent') return 'minimal';
                const radius = parsePx(borderRadius || '12px');
                const gap = parsePx(itemGap || '8px');
                if (radius === 0 && gap === 0) return 'lined';
                if (radius >= 14) return 'cards';
                return 'classic';
            },
            set(val) {
                const p = STYLE_PRESETS[val];
                if (!p) return;
                Object.entries(p).forEach(([key, value]) => {
                    this.props[key] = value;
                    this.propChanged(key);
                });
            }
        },
        radiusSliderPx() {
            return Math.min(24, parsePx(this.props.borderRadius || '12px'));
        },
        radiusActive() {
            const px = parsePx(this.props.borderRadius || '12px');
            if (px === 0) return 'Острые';
            if (px <= 7) return 'Мягкие';
            if (px <= 13) return 'Округл.';
            if (px <= 17) return 'Крупн.';
            return null;
        },
        gapSliderPx() {
            return Math.min(20, parsePx(this.props.itemGap || '8px'));
        }
    },
    methods: {
        applyColorPreset(p) {
            this.props.accentColor = p.accent;
            this.propChanged('accentColor');
        },
        applyRadiusPreset(r) {
            this.props.borderRadius = r.css;
            this.propChanged('borderRadius');
        },
        onRadiusSlider(e) {
            this.props.borderRadius = `${e.target.value}px`;
            this.propChanged('borderRadius');
        },
        setGap(val) {
            this.props.itemGap = val;
            this.propChanged('itemGap');
        },
        onGapSlider(e) {
            this.props.itemGap = `${e.target.value}px`;
            this.propChanged('itemGap');
        },
        setHeaderFontSize(val) {
            this.props.headerFontSize = val;
            this.propChanged('headerFontSize');
        },
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

/* ── Live preview ─────────────────────────────────────────────── */
.preview-wrap {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 8px;
    margin-bottom: 12px;
}

.preview-item {
    margin-bottom: 4px;
}
.preview-item:last-child { margin-bottom: 0; }

.preview-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 7px 10px;
    font-size: 10px;
    font-weight: 600;
    line-height: 1.3;
    user-select: none;
}

.preview-header__title { flex: 1; }
.preview-header__icon { font-size: 12px; flex-shrink: 0; }

.preview-body {
    font-size: 10px;
    padding: 6px 10px 8px;
    line-height: 1.4;
    color: #64748b;
}

/* ── Option grid ──────────────────────────────────────────────── */
.opt-grid { display: grid; gap: 5px; margin-bottom: 6px; }
.opt-grid--5 { grid-template-columns: repeat(5, 1fr); }

/* ── Option card ──────────────────────────────────────────────── */
.opt-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    padding: 7px 4px 6px;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s;
    text-align: center;
    color: #64748b;
    background: #fff;
}
.opt-card:hover { border-color: #a5b4fc; }
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

/* ── Accordion preset mini-previews ───────────────────────────── */
.opt-card__acc-prev {
    width: 32px;
    height: 18px;
    border-radius: 4px;
    border: 1px solid #e2e8f0;
    background: #fff;
    position: relative;
    overflow: hidden;
    flex-shrink: 0;
}
.opt-card__acc-prev::before {
    content: '';
    position: absolute;
    top: 3px; left: 3px; right: 3px;
    height: 5px;
    border-radius: 2px;
    background: #f1f5f9;
    border-left: 2px solid #4f6aff;
}
.opt-card__acc-prev::after {
    content: '';
    position: absolute;
    top: 11px; left: 3px; right: 3px;
    height: 3px;
    border-radius: 1px;
    background: #f1f5f9;
}
/* cards variant */
.acc-prev--cards { border-radius: 6px; border-color: #c7d2fe; }
.acc-prev--cards::before { border-radius: 3px; background: #eff2ff; }
/* dark variant */
.acc-prev--dark { background: #1e293b; border-color: #334155; }
.acc-prev--dark::before { background: #334155; border-left-color: #4f6aff; }
.acc-prev--dark::after { background: #0f172a; }
/* minimal variant */
.acc-prev--minimal { background: transparent; border-color: transparent; border-bottom-color: #e2e8f0; border-radius: 0; }
.acc-prev--minimal::before { background: transparent; border-left: none; border-bottom: 1px solid #e2e8f0; border-radius: 0; }
.acc-prev--minimal::after { background: transparent; }
/* lined variant */
.acc-prev--lined { border-radius: 0; border-color: transparent; border-top-color: #e2e8f0; border-bottom-color: #e2e8f0; }
.acc-prev--lined::before { border-radius: 0; background: #fff; border-bottom: 1px solid #e2e8f0; }

/* ── Color presets ────────────────────────────────────────────── */
.color-presets {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    margin-bottom: 8px;
}
.color-preset {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    border: 2px solid transparent;
    cursor: pointer;
    transition: transform 0.15s, border-color 0.15s;
    flex-shrink: 0;
}
.color-preset:hover { transform: scale(1.15); }
.color-preset--active { border-color: #fff; box-shadow: 0 0 0 2px #4f6aff; transform: scale(1.1); }

/* ── Radius grid ──────────────────────────────────────────────── */
.radius-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 5px;
    margin-bottom: 6px;
}
.radius-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 7px 4px 5px;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    background: #fff;
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s;
}
.radius-card:hover { border-color: #a5b4fc; }
.radius-card--active { border-color: #4f6aff; background: #eff2ff; }
.radius-card__shape {
    display: block;
    width: 22px;
    height: 14px;
    background: #e2e8f0;
    border: 2px solid #94a3b8;
}
.radius-card--active .radius-card__shape { background: #c7d2fe; border-color: #4f6aff; }
.radius-card__label {
    font-size: 10px;
    font-weight: 500;
    color: #64748b;
    white-space: nowrap;
}
.radius-card--active .radius-card__label { color: #4f6aff; font-weight: 600; }

/* ── Slider ───────────────────────────────────────────────────── */
.slider-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
}
.slider {
    flex: 1;
    height: 4px;
    cursor: pointer;
    accent-color: #4f6aff;
}
.slider-val {
    font-size: 11px;
    color: #64748b;
    min-width: 36px;
    text-align: right;
    font-variant-numeric: tabular-nums;
}

/* ── Chips ────────────────────────────────────────────────────── */
.size-chips,
.gap-chips {
    display: flex;
    gap: 5px;
    flex-wrap: wrap;
    margin-bottom: 8px;
}
.size-chip {
    padding: 4px 8px;
    font-size: 10px;
    font-weight: 500;
    border: 2px solid #e2e8f0;
    border-radius: 6px;
    background: #fff;
    color: #64748b;
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s;
    white-space: nowrap;
}
.size-chip:hover { border-color: #a5b4fc; }
.size-chip--active { border-color: #4f6aff; background: #eff2ff; color: #4f6aff; font-weight: 600; }
</style>
