<template>
    <w-panel>
        <ui-container>

            <!-- ── Пресеты ─────────────────────────────────────────── -->
            <div class="p-section__label">Пресет оформления</div>
            <div class="presets-grid">
                <button
                    v-for="(p, key) in presets"
                    :key="key"
                    class="preset-card"
                    :class="{ 'preset-card--active': props.calPreset === key }"
                    @click="applyPreset(key, p)">
                    <div class="preset-card__preview" :style="presetPreviewStyle(p.props)">
                        <div class="preset-card__preview-hd" :style="{ background: p.props.calHeaderBg, color: p.props.calHeaderColor }">
                            <div class="preset-card__preview-dot" />
                            <div class="preset-card__preview-line" />
                        </div>
                        <div class="preset-card__preview-body" :style="{ background: p.props.calBg }">
                            <div v-for="i in 3" :key="i" class="preset-card__preview-cell" :style="{ background: p.props.calCellBg, borderColor: p.props.calCellBorderColor }">
                                <div v-if="i === 2" class="preset-card__preview-ev" :style="{ background: p.props.calAccentColor }" />
                            </div>
                        </div>
                    </div>
                    <span class="preset-card__label">{{ p.label }}</span>
                    <div v-if="props.calPreset === key" class="preset-card__check">
                        <svg width="10" height="8" viewBox="0 0 10 8"><path d="M1 4l3 3 5-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>
                    </div>
                </button>
            </div>

            <!-- ── Цвета ───────────────────────────────────────────── -->
            <div class="p-section">
                <div class="p-section__label">Цвета</div>

                <div class="color-row">
                    <label class="color-item" v-for="c in colorFields" :key="c.key">
                        <div class="color-item__swatch" :style="{ background: props[c.key] }" />
                        <input
                            type="color"
                            class="color-item__input"
                            :value="simpleColor(props[c.key])"
                            @input="setColor(c.key, $event.target.value)" />
                        <span class="color-item__label">{{ c.label }}</span>
                    </label>
                </div>
            </div>

            <!-- ── Форма ───────────────────────────────────────────── -->
            <div class="p-section">
                <div class="p-section__label">Форма и тень</div>

                <div class="p-field">
                    <span class="p-field__label">Скруглeние виджета</span>
                    <div class="p-field__row">
                        <input
                            type="range"
                            class="p-range"
                            min="0"
                            max="32"
                            :value="parseRadius(props.calRadius)"
                            @input="set('calRadius', $event.target.value + 'px')" />
                        <span class="p-field__val">{{ props.calRadius }}</span>
                    </div>
                </div>

                <div class="p-field">
                    <span class="p-field__label">Скруглeние событий</span>
                    <div class="p-field__row">
                        <input
                            type="range"
                            class="p-range"
                            min="0"
                            max="20"
                            :value="parseRadius(props.calEventRadius)"
                            @input="set('calEventRadius', $event.target.value + 'px')" />
                        <span class="p-field__val">{{ props.calEventRadius }}</span>
                    </div>
                </div>

                <div class="p-field">
                    <span class="p-field__label">Тень</span>
                    <div class="shadow-chips">
                        <button
                            v-for="s in shadowPresets"
                            :key="s.label"
                            class="shadow-chip"
                            :class="{ 'shadow-chip--active': props.calShadow === s.value }"
                            @click="set('calShadow', s.value)">
                            {{ s.label }}
                        </button>
                    </div>
                </div>
            </div>

            <!-- ── Типографика ─────────────────────────────────────── -->
            <div class="p-section">
                <div class="p-section__label">Типографика</div>

                <div class="p-field">
                    <span class="p-field__label">Размер шрифта</span>
                    <div class="seg-ctrl">
                        <button
                            v-for="fs in fontSizes"
                            :key="fs.value"
                            class="seg-ctrl__btn"
                            :class="{ 'seg-ctrl__btn--active': props.calFontSize === fs.value }"
                            @click="set('calFontSize', fs.value)">
                            {{ fs.label }}
                        </button>
                    </div>
                </div>
            </div>

        </ui-container>
    </w-panel>
</template>

<script>
import { Panel } from 'goodt-wcore';
import { PRESETS } from '../constants';

export default {
    extends: Panel,
    meta: { name: 'Оформление', icon: 'palette' },

    data: () => ({
        presets: PRESETS,
        colorFields: [
            { key: 'calHeaderBg', label: 'Шапка' },
            { key: 'calHeaderColor', label: 'Текст шапки' },
            { key: 'calBg', label: 'Фон' },
            { key: 'calCellBg', label: 'Ячейка' },
            { key: 'calAccentColor', label: 'Акцент' },
            { key: 'calTodayBg', label: 'Сегодня' },
            { key: 'calTodayColor', label: 'Цифра сегодня' },
            { key: 'calSelectedBg', label: 'Выделение' },
            { key: 'calSelectedColor', label: 'Текст выбора' },
            { key: 'calWeekendColor', label: 'Выходные' },
            { key: 'calCellBorderColor', label: 'Граница ячеек' }
        ],
        shadowPresets: [
            { label: 'Нет', value: 'none' },
            { label: 'S', value: '0 1px 4px rgba(0,0,0,0.08)' },
            { label: 'M', value: '0 4px 24px rgba(79,106,255,0.10), 0 1px 4px rgba(0,0,0,0.06)' },
            { label: 'L', value: '0 8px 40px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.08)' },
            { label: 'XL', value: '0 16px 64px rgba(0,0,0,0.2), 0 4px 16px rgba(0,0,0,0.1)' }
        ],
        fontSizes: [
            { label: 'XS', value: '11px' },
            { label: 'S', value: '12px' },
            { label: 'M', value: '13px' },
            { label: 'L', value: '14px' },
            { label: 'XL', value: '16px' }
        ]
    }),

    methods: {
        set(key, val) {
            this.props[key] = val;
            this.propChanged(key);
        },

        setColor(key, val) {
            this.set(key, val);
        },

        simpleColor(val) {
            if (!val) return '#000000';
            // Return as-is if hex; otherwise fallback
            return val.startsWith('#') && val.length <= 9 ? val : '#4f6aff';
        },

        parseRadius(val) {
            return parseInt(val, 10) || 0;
        },

        applyPreset(key, preset) {
            this.props.calPreset = key;
            this.propChanged('calPreset');
            const p = preset.props;
            Object.keys(p).forEach((k) => {
                this.props[k] = p[k];
                this.propChanged(k);
            });
        },

        presetPreviewStyle(p) {
            return {
                borderRadius: p.calRadius || '8px',
                overflow: 'hidden',
                boxShadow: p.calShadow && p.calShadow !== 'none' ? '0 2px 8px rgba(0,0,0,0.15)' : 'none'
            };
        }
    }
};
</script>

<style scoped>
.p-section {
    margin-top: 14px;
    padding-top: 14px;
    border-top: 1px solid #f1f5f9;
}

.p-section__label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #94a3b8;
    margin-bottom: 8px;
}

/* ── Preset grid ──────────────────────────────────────────────── */
.presets-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
    margin-bottom: 4px;
}

.preset-card {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    padding: 6px;
    border: 1.5px solid #e2e8f0;
    border-radius: 10px;
    background: #fff;
    cursor: pointer;
    transition: border-color 0.12s, box-shadow 0.12s, transform 0.1s;
}
.preset-card:hover {
    border-color: #a5b4fc;
    transform: translateY(-1px);
    box-shadow: 0 3px 10px rgba(79, 106, 255, 0.12);
}
.preset-card--active {
    border-color: #4f6aff;
    box-shadow: 0 0 0 2px rgba(79, 106, 255, 0.18);
}

.preset-card__preview {
    width: 100%;
    height: 48px;
    border-radius: 6px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.preset-card__preview-hd {
    height: 14px;
    display: flex;
    align-items: center;
    gap: 3px;
    padding: 0 4px;
}
.preset-card__preview-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.5);
    flex-shrink: 0;
}
.preset-card__preview-line {
    height: 3px;
    flex: 1;
    background: rgba(255, 255, 255, 0.35);
    border-radius: 2px;
}

.preset-card__preview-body {
    flex: 1;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1px;
    padding: 2px;
}
.preset-card__preview-cell {
    border-radius: 2px;
    border: 1px solid;
    position: relative;
}
.preset-card__preview-ev {
    position: absolute;
    bottom: 2px;
    left: 1px;
    right: 1px;
    height: 3px;
    border-radius: 2px;
}

.preset-card__label {
    font-size: 10px;
    font-weight: 600;
    color: #64748b;
    white-space: nowrap;
}

.preset-card__check {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #4f6aff;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* ── Color row ────────────────────────────────────────────────── */
.color-row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 10px;
}

.color-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    cursor: pointer;
    position: relative;
}

.color-item__swatch {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    border: 2px solid rgba(0, 0, 0, 0.1);
    transition: transform 0.12s, box-shadow 0.12s;
    cursor: pointer;
}
.color-item:hover .color-item__swatch {
    transform: scale(1.12);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
}

.color-item__input {
    position: absolute;
    opacity: 0;
    width: 28px;
    height: 28px;
    top: 0;
    left: 0;
    cursor: pointer;
}

.color-item__label {
    font-size: 9px;
    font-weight: 600;
    color: #94a3b8;
    text-align: center;
    line-height: 1.2;
    max-width: 40px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* ── Fields ───────────────────────────────────────────────────── */
.p-field { margin-bottom: 10px; }
.p-field__label {
    display: block;
    font-size: 11px;
    font-weight: 600;
    color: #64748b;
    margin-bottom: 5px;
}
.p-field__row {
    display: flex;
    align-items: center;
    gap: 8px;
}
.p-field__val {
    font-size: 11px;
    color: #334155;
    font-weight: 600;
    font-family: monospace;
    min-width: 36px;
}

/* ── Range slider ─────────────────────────────────────────────── */
.p-range {
    flex: 1;
    height: 4px;
    border-radius: 2px;
    background: #e2e8f0;
    outline: none;
    appearance: none;
    cursor: pointer;
}
.p-range::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #4f6aff;
    cursor: pointer;
    box-shadow: 0 1px 4px rgba(79, 106, 255, 0.3);
    transition: transform 0.1s;
}
.p-range::-webkit-slider-thumb:hover { transform: scale(1.15); }

/* ── Shadow chips ─────────────────────────────────────────────── */
.shadow-chips { display: flex; gap: 5px; flex-wrap: wrap; }
.shadow-chip {
    padding: 4px 10px;
    border-radius: 20px;
    border: 1.5px solid #e2e8f0;
    background: #fff;
    color: #64748b;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    transition: border-color 0.12s, color 0.12s, background 0.12s;
}
.shadow-chip:hover { border-color: #a5b4fc; color: #4f6aff; }
.shadow-chip--active {
    border-color: #4f6aff;
    background: #eff2ff;
    color: #4f6aff;
}

/* ── Segmented control ────────────────────────────────────────── */
.seg-ctrl {
    display: flex;
    background: #f1f5f9;
    border-radius: 7px;
    padding: 2px;
    gap: 1px;
}
.seg-ctrl__btn {
    padding: 4px 9px;
    border: none;
    border-radius: 5px;
    background: transparent;
    color: #64748b;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.12s, color 0.12s;
    white-space: nowrap;
}
.seg-ctrl__btn:hover { color: #334155; }
.seg-ctrl__btn--active {
    background: #fff;
    color: #4f6aff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
</style>
