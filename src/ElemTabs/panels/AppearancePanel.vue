<template>
    <w-panel>
        <ui-container>

            <!-- ── Live preview ───────────────────────────────────────────── -->
            <div class="preview-wrap">
                <div class="preview-bar" :style="previewBarStyle">
                    <div
                        v-for="i in 3"
                        :key="i"
                        class="preview-tab"
                        :style="i === 2 ? previewActiveTabStyle : previewTabStyle">
                        <span>Раздел {{ i }}</span>
                        <span
                            v-if="i === 2 && (props.indicatorType || 'underline') === 'underline'"
                            class="preview-underline"
                            :style="{ background: props.tabIndicatorColor || '#4f6aff' }" />
                    </div>
                </div>
                <div class="preview-content" :style="previewContentStyle">
                    Содержимое раздела…
                </div>
            </div>

            <!-- ── Стиль вкладок ──────────────────────────────────────────── -->
            <div class="section-label">Стиль вкладок</div>
            <div class="opt-grid opt-grid--5">
                <div
                    v-for="v in stylePresetOptions"
                    :key="v.value"
                    class="opt-card"
                    :class="{ 'opt-card--active': stylePreset === v.value }"
                    @click="stylePreset = v.value">
                    <div class="opt-card__tab-prev" :class="`tab-prev--${v.value}`" />
                    <div class="opt-card__label">{{ v.label }}</div>
                </div>
            </div>

            <!-- ── Маркер ─────────────────────────────────────────────────── -->
            <div class="section-label">Маркер активной вкладки</div>
            <div class="opt-grid opt-grid--3">
                <div
                    v-for="m in indicatorOptions"
                    :key="m.value"
                    class="opt-card"
                    :class="{ 'opt-card--active': (props.indicatorType || 'underline') === m.value }"
                    @click="setIndicatorType(m.value)">
                    <div class="opt-card__ind-prev" :class="`ind-prev--${m.value}`" />
                    <div class="opt-card__label">{{ m.label }}</div>
                </div>
            </div>

            <!-- ── Цветовые пресеты ───────────────────────────────────────── -->
            <div class="section-label">Цветовые пресеты</div>
            <div class="color-presets">
                <button
                    v-for="p in colorPresets"
                    :key="p.label"
                    class="color-preset"
                    :class="{ 'color-preset--active': isColorActive(p) }"
                    :title="p.label"
                    :style="{ background: p.accent }"
                    @click="applyColorPreset(p)" />
            </div>

            <!-- ── Акцент ─────────────────────────────────────────────────── -->
            <div class="section-label">Акцентный цвет</div>
            <ui-input-cp prop="tabIndicatorColor">Маркер / активная вкладка</ui-input-cp>
            <ui-input-cp prop="tabActiveColor">Цвет текста активной</ui-input-cp>

            <!-- ── Детальные цвета ────────────────────────────────────────── -->
            <ui-collapse>
                <template #header>Панель вкладок</template>
                <ui-container>
                    <ui-input-cp prop="tabBarBg">Фон панели</ui-input-cp>
                    <ui-input-cp prop="tabBarBorderColor">Разделитель</ui-input-cp>
                </ui-container>
            </ui-collapse>

            <ui-collapse>
                <template #header>Вкладки</template>
                <ui-container>
                    <ui-input-cp prop="tabBg">Фон неактивной</ui-input-cp>
                    <ui-input-cp prop="tabColor">Цвет текста неактивной</ui-input-cp>
                    <ui-input-cp prop="tabActiveBg">Фон активной</ui-input-cp>
                </ui-container>
            </ui-collapse>

            <ui-collapse>
                <template #header>Содержимое</template>
                <ui-container>
                    <ui-input-cp prop="contentBg">Фон</ui-input-cp>
                    <ui-input-cp prop="contentColor">Цвет текста</ui-input-cp>
                </ui-container>
            </ui-collapse>

            <!-- ── Скругление ─────────────────────────────────────────────── -->
            <div class="section-label">Скругление вкладок</div>
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

            <!-- ── Размер шрифта ───────────────────────────────────────────── -->
            <div class="section-label">Размер шрифта вкладок</div>
            <div class="size-chips">
                <button
                    v-for="s in fontSizeOptions"
                    :key="s.value"
                    class="size-chip"
                    :class="{ 'size-chip--active': (props.tabFontSize || '14px') === s.value }"
                    @click="setTabFontSize(s.value)">
                    {{ s.label }}
                </button>
            </div>

            <!-- ── Рамка ───────────────────────────────────────────────────── -->
            <ui-switch prop="showBorder">Рамка вокруг содержимого</ui-switch>

            <!-- ── Сброс ───────────────────────────────────────────────────── -->
            <ui-button type="ghost" @click="resetAll">Сбросить оформление</ui-button>

        </ui-container>
    </w-panel>
</template>

<script>
import { Panel } from '@goodt-wcore/panel';
import { PanelInstanceTypeDescriptor } from '../types';

const DEFAULTS = {
    indicatorType: 'underline',
    tabBarBg: '#ffffff',
    tabBarBorderColor: '#e2e8f0',
    tabBg: 'transparent',
    tabColor: '#64748b',
    tabFontSize: '14px',
    tabFontWeight: '500',
    tabPadding: '10px 18px',
    tabBorderRadius: '8px',
    tabActiveBg: 'transparent',
    tabActiveColor: '#4f6aff',
    tabIndicatorColor: '#4f6aff',
    contentBg: '#ffffff',
    contentColor: '#334155',
    contentFontSize: '14px',
    contentPadding: '20px',
    contentBorderRadius: '0 0 12px 12px',
    borderColor: '#e2e8f0',
    showBorder: true
};

const STYLE_PRESETS = {
    classic: {
        indicatorType: 'underline',
        tabBarBg: '#ffffff',
        tabBarBorderColor: '#e2e8f0',
        tabBg: 'transparent',
        tabColor: '#64748b',
        tabActiveBg: 'transparent',
        tabActiveColor: '#4f6aff',
        tabIndicatorColor: '#4f6aff',
        tabBorderRadius: '0px',
        contentBg: '#ffffff',
        showBorder: true,
        borderColor: '#e2e8f0'
    },
    cards: {
        indicatorType: 'border',
        tabBarBg: '#f1f5f9',
        tabBarBorderColor: 'transparent',
        tabBg: 'transparent',
        tabColor: '#64748b',
        tabActiveBg: '#ffffff',
        tabActiveColor: '#1e293b',
        tabIndicatorColor: '#4f6aff',
        tabBorderRadius: '8px',
        contentBg: '#ffffff',
        showBorder: true,
        borderColor: '#e2e8f0'
    },
    pills: {
        indicatorType: 'pill',
        tabBarBg: '#f1f5f9',
        tabBarBorderColor: 'transparent',
        tabBg: 'transparent',
        tabColor: '#64748b',
        tabActiveBg: '#4f6aff',
        tabActiveColor: '#ffffff',
        tabIndicatorColor: '#4f6aff',
        tabBorderRadius: '999px',
        contentBg: '#ffffff',
        showBorder: false,
        borderColor: '#e2e8f0'
    },
    dark: {
        indicatorType: 'underline',
        tabBarBg: '#1e293b',
        tabBarBorderColor: '#334155',
        tabBg: 'transparent',
        tabColor: '#94a3b8',
        tabActiveBg: 'transparent',
        tabActiveColor: '#ffffff',
        tabIndicatorColor: '#4f6aff',
        tabBorderRadius: '0px',
        contentBg: '#0f172a',
        showBorder: false,
        borderColor: '#334155'
    },
    minimal: {
        indicatorType: 'underline',
        tabBarBg: 'transparent',
        tabBarBorderColor: '#e2e8f0',
        tabBg: 'transparent',
        tabColor: '#94a3b8',
        tabActiveBg: 'transparent',
        tabActiveColor: '#334155',
        tabIndicatorColor: '#334155',
        tabBorderRadius: '0px',
        contentBg: 'transparent',
        showBorder: false,
        borderColor: 'transparent'
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
            { label: 'Пилюли', value: 'pills' },
            { label: 'Тёмный', value: 'dark' },
            { label: 'Минимал', value: 'minimal' }
        ],
        indicatorOptions: [
            { label: 'Подчёрк.', value: 'underline' },
            { label: 'Пилюля', value: 'pill' },
            { label: 'Рамка', value: 'border' }
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
            { label: 'Острые', shape: '0',    css: '0px' },
            { label: 'Мягкие', shape: '5px',  css: '6px' },
            { label: 'Округл.', shape: '9px', css: '10px' },
            { label: 'Пилюля', shape: '999px', css: '999px' }
        ],
        fontSizeOptions: [
            { label: 'XS 11px', value: '11px' },
            { label: 'S 12px',  value: '12px' },
            { label: 'M 14px',  value: '14px' },
            { label: 'L 15px',  value: '15px' },
            { label: 'XL 16px', value: '16px' }
        ]
    }),
    computed: {
        previewBarStyle() {
            return {
                background: this.props.tabBarBg || '#ffffff',
                borderBottom: `1px solid ${this.props.tabBarBorderColor || '#e2e8f0'}`,
                display: 'flex',
                gap: '2px',
                padding: '6px 6px 0'
            };
        },
        previewTabStyle() {
            return {
                position: 'relative',
                padding: '5px 10px',
                borderRadius: `${this.props.tabBorderRadius || '8px'} ${this.props.tabBorderRadius || '8px'} 0 0`,
                background: this.props.tabBg || 'transparent',
                color: this.props.tabColor || '#64748b',
                fontSize: '10px',
                fontWeight: '500',
                cursor: 'default'
            };
        },
        previewActiveTabStyle() {
            return {
                position: 'relative',
                padding: '5px 10px',
                borderRadius: `${this.props.tabBorderRadius || '8px'} ${this.props.tabBorderRadius || '8px'} 0 0`,
                background: this.props.tabActiveBg || 'transparent',
                color: this.props.tabActiveColor || '#4f6aff',
                fontSize: '10px',
                fontWeight: '600',
                cursor: 'default'
            };
        },
        previewContentStyle() {
            return {
                background: this.props.contentBg || '#ffffff',
                color: this.props.contentColor || '#334155',
                fontSize: '10px',
                padding: '8px 10px',
                border: this.props.showBorder !== false ? `1px solid ${this.props.borderColor || '#e2e8f0'}` : 'none',
                borderTop: 'none',
                borderRadius: '0 0 6px 6px',
                minHeight: '32px'
            };
        },
        stylePreset: {
            get() {
                const { tabBarBg, tabActiveBg, indicatorType } = this.props;
                const barBg = tabBarBg || '#ffffff';
                if (barBg === '#1e293b' || barBg === '#0f172a') return 'dark';
                if (barBg === 'transparent') return 'minimal';
                const activeBg = tabActiveBg || 'transparent';
                if (indicatorType === 'pill' && activeBg !== 'transparent') return 'pills';
                if (activeBg === '#ffffff' && barBg === '#f1f5f9') return 'cards';
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
            const raw = this.props.tabBorderRadius || '8px';
            if (parseFloat(raw) >= 100) return 24;
            return Math.min(24, parsePx(raw));
        },
        radiusActive() {
            const raw = this.props.tabBorderRadius || '8px';
            if (parseFloat(raw) >= 100) return 'Пилюля';
            const px = parsePx(raw);
            if (px === 0) return 'Острые';
            if (px <= 7) return 'Мягкие';
            if (px <= 11) return 'Округл.';
            return null;
        }
    },
    methods: {
        setIndicatorType(val) {
            this.props.indicatorType = val;
            this.propChanged('indicatorType');
        },
        isColorActive(p) {
            return this.props.tabIndicatorColor === p.accent
                && this.props.tabActiveColor === p.accent;
        },
        applyColorPreset(p) {
            this.props.tabIndicatorColor = p.accent;
            this.propChanged('tabIndicatorColor');
            this.props.tabActiveColor = p.accent;
            this.propChanged('tabActiveColor');
            const preset = this.stylePreset;
            if (preset === 'pills') {
                this.props.tabActiveBg = p.accent;
                this.propChanged('tabActiveBg');
                this.props.tabActiveColor = '#ffffff';
                this.propChanged('tabActiveColor');
            }
        },
        applyRadiusPreset(r) {
            this.props.tabBorderRadius = r.css;
            this.propChanged('tabBorderRadius');
        },
        onRadiusSlider(e) {
            const px = parseInt(e.target.value, 10);
            this.props.tabBorderRadius = `${px}px`;
            this.propChanged('tabBorderRadius');
        },
        setTabFontSize(val) {
            this.props.tabFontSize = val;
            this.propChanged('tabFontSize');
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
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 12px;
    background: #f8fafc;
}

.preview-bar {
    display: flex;
    gap: 2px;
    padding: 6px 6px 0;
}

.preview-tab {
    position: relative;
    padding: 5px 10px;
    border-radius: 8px 8px 0 0;
    font-size: 10px;
    font-weight: 500;
    white-space: nowrap;
    user-select: none;
    line-height: 1.4;
}

.preview-underline {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    border-radius: 2px 2px 0 0;
}

.preview-content {
    font-size: 10px;
    padding: 8px 10px;
    min-height: 32px;
    line-height: 1.4;
    color: #64748b;
}

/* ── Option grid ──────────────────────────────────────────────── */
.opt-grid { display: grid; gap: 5px; margin-bottom: 6px; }
.opt-grid--3 { grid-template-columns: repeat(3, 1fr); }
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

/* ── Style preset mini-previews ───────────────────────────────── */
.opt-card__tab-prev {
    width: 32px;
    height: 16px;
    border-radius: 4px 4px 0 0;
    border-bottom: 2px solid #e2e8f0;
    position: relative;
    background: #f1f5f9;
    flex-shrink: 0;
}
.opt-card__tab-prev::after {
    content: '';
    position: absolute;
    left: 4px;
    top: 3px;
    width: 10px;
    height: 7px;
    border-radius: 3px 3px 0 0;
}
/* classic: underline marker */
.tab-prev--classic { background: #fff; border-bottom-color: #e2e8f0; }
.tab-prev--classic::after { background: #fff; border-bottom: 2px solid #4f6aff; }
/* cards: filled tab on grey bar */
.tab-prev--cards { background: #f1f5f9; border-bottom-color: #e2e8f0; }
.tab-prev--cards::after { background: #fff; border: 1px solid #e2e8f0; border-bottom: none; }
/* pills: pill shape */
.tab-prev--pills { background: #f1f5f9; border-bottom-color: transparent; }
.tab-prev--pills::after { background: #4f6aff; border-radius: 999px; top: 4px; height: 6px; }
/* dark: dark bar */
.tab-prev--dark { background: #1e293b; border-bottom-color: #334155; }
.tab-prev--dark::after { background: transparent; border-bottom: 2px solid #4f6aff; }
/* minimal: transparent */
.tab-prev--minimal { background: transparent; border-bottom-color: #e2e8f0; }
.tab-prev--minimal::after { background: transparent; border-bottom: 2px solid #64748b; }

/* ── Indicator mini-previews ──────────────────────────────────── */
.opt-card__ind-prev {
    width: 34px;
    height: 14px;
    border-radius: 3px;
    background: #f1f5f9;
    position: relative;
    flex-shrink: 0;
}
.ind-prev--underline::after {
    content: '';
    position: absolute;
    bottom: 0; left: 4px; right: 4px;
    height: 2px;
    background: #4f6aff;
    border-radius: 1px;
}
.ind-prev--pill {
    border-radius: 999px;
    background: #4f6aff;
}
.ind-prev--border {
    border: 2px solid #4f6aff;
    border-radius: 4px;
    background: #fff;
}

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
    .radius-card--active & { background: #c7d2fe; border-color: #4f6aff; }
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
    margin-bottom: 8px;
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

/* ── Font size chips ──────────────────────────────────────────── */
.size-chips {
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
