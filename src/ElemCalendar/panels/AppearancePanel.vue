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
                    <div class="preset-card__preview" :style="presetBorderStyle(p.props)">
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

                <!-- Визуальная сетка свотчей — быстрый обзор всех цветов -->
                <div class="swatch-grid">
                    <div
                        v-for="c in colorFields"
                        :key="c.key"
                        class="swatch-item"
                        :title="c.label">
                        <div class="swatch-item__dot" :style="{ background: props[c.key] }" />
                        <span class="swatch-item__label">{{ c.label }}</span>
                    </div>
                </div>

                <!-- ui-input-cp для редактирования -->
                <div class="cp-list">
                    <ui-input-cp prop="calHeaderBg">Фон шапки</ui-input-cp>
                    <ui-input-cp prop="calHeaderColor">Текст шапки</ui-input-cp>
                    <ui-input-cp prop="calBg">Фон виджета</ui-input-cp>
                    <ui-input-cp prop="calCellBg">Фон ячейки</ui-input-cp>
                    <ui-input-cp prop="calAccentColor">Акцент</ui-input-cp>
                    <ui-input-cp prop="calTodayBg">Фон «Сегодня»</ui-input-cp>
                    <ui-input-cp prop="calTodayColor">Число «Сегодня»</ui-input-cp>
                    <ui-input-cp prop="calSelectedBg">Фон выделения</ui-input-cp>
                    <ui-input-cp prop="calSelectedColor">Текст выделения</ui-input-cp>
                    <ui-input-cp prop="calWeekendColor">Выходные</ui-input-cp>
                    <ui-input-cp prop="calCellBorderColor">Границы ячеек</ui-input-cp>
                </div>
            </div>

            <!-- ── Шрифт ───────────────────────────────────────────── -->
            <div class="p-section">
                <div class="p-section__label">Шрифт</div>

                <!-- Font family chips -->
                <div class="font-grid">
                    <button
                        v-for="f in fontFamilyOptions"
                        :key="f.value"
                        class="font-chip"
                        :class="{ 'font-chip--active': (props.calFontFamily || '') === f.value }"
                        :style="{ fontFamily: f.value || 'inherit' }"
                        @click="set('calFontFamily', f.value)">
                        {{ f.label }}
                    </button>
                </div>

                <!-- Custom font input -->
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

                <!-- Font size -->
                <div class="p-field-label">Размер шрифта</div>
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

                <!-- Font weight -->
                <div class="p-field-label" style="margin-top:10px">Насыщенность</div>
                <div class="seg-ctrl seg-ctrl--wrap">
                    <button
                        v-for="fw in fontWeights"
                        :key="fw.value"
                        class="seg-ctrl__btn"
                        :class="{ 'seg-ctrl__btn--active': (props.calFontWeight || '400') === fw.value }"
                        :style="{ fontWeight: fw.value }"
                        @click="set('calFontWeight', fw.value)">
                        {{ fw.label }}
                    </button>
                </div>

                <!-- Text transform -->
                <div class="p-field-label" style="margin-top:10px">Регистр</div>
                <div class="opt-grid">
                    <div
                        v-for="t in textTransformOptions"
                        :key="t.value"
                        class="opt-card"
                        :class="{ 'opt-card--active': (props.calTextTransform || 'none') === t.value }"
                        @click="set('calTextTransform', t.value)">
                        <span class="opt-card__preview" :style="{ textTransform: t.value }">Аа</span>
                        <div class="opt-card__label">{{ t.label }}</div>
                    </div>
                </div>

                <!-- Letter spacing -->
                <div class="p-field-label" style="margin-top:10px">Межбуквенный интервал</div>
                <div class="slider-row">
                    <input
                        type="range"
                        class="slider"
                        min="-3"
                        max="20"
                        step="0.5"
                        :value="letterSpacingVal"
                        @input="onLetterSpacing($event.target.value)" />
                    <span class="slider-val">{{ props.calLetterSpacing || '0' }}</span>
                </div>
            </div>

            <!-- ── Форма и тень ─────────────────────────────────────── -->
            <div class="p-section">
                <div class="p-section__label">Форма и тень</div>

                <div class="p-field-label">Скруглeние виджета</div>
                <div class="slider-row">
                    <input type="range" class="slider" min="0" max="32"
                        :value="parseRadius(props.calRadius)"
                        @input="set('calRadius', $event.target.value + 'px')" />
                    <span class="slider-val">{{ props.calRadius }}</span>
                </div>

                <div class="p-field-label" style="margin-top:10px">Скруглeние событий</div>
                <div class="slider-row">
                    <input type="range" class="slider" min="0" max="20"
                        :value="parseRadius(props.calEventRadius)"
                        @input="set('calEventRadius', $event.target.value + 'px')" />
                    <span class="slider-val">{{ props.calEventRadius }}</span>
                </div>

                <div class="p-field-label" style="margin-top:10px">Тень</div>
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

        </ui-container>
    </w-panel>
</template>

<script>
import { Panel } from 'goodt-wcore';
import { PRESETS, buildDemoEvents } from '../constants';

export default {
    extends: Panel,
    meta: { name: 'Оформление', icon: 'palette' },

    data: () => ({
        presets: PRESETS,
        customFontInput: '',
        colorFields: [
            { key: 'calHeaderBg',        label: 'Шапка' },
            { key: 'calHeaderColor',     label: 'Текст шапки' },
            { key: 'calBg',              label: 'Фон' },
            { key: 'calCellBg',          label: 'Ячейка' },
            { key: 'calAccentColor',     label: 'Акцент' },
            { key: 'calTodayBg',         label: 'Сегодня' },
            { key: 'calTodayColor',      label: 'Число' },
            { key: 'calSelectedBg',      label: 'Выделение' },
            { key: 'calSelectedColor',   label: 'Выбор текст' },
            { key: 'calWeekendColor',    label: 'Выходные' },
            { key: 'calCellBorderColor', label: 'Границы' }
        ],
        fontFamilyOptions: [
            { label: 'По умолчанию',  value: '' },
            { label: 'Inter',         value: 'Inter, sans-serif' },
            { label: 'Roboto',        value: 'Roboto, sans-serif' },
            { label: 'Montserrat',    value: 'Montserrat, sans-serif' },
            { label: 'Open Sans',     value: 'Open Sans, sans-serif' },
            { label: 'Raleway',       value: 'Raleway, sans-serif' },
            { label: 'Nunito',        value: 'Nunito, sans-serif' },
            { label: 'Playfair',      value: 'Playfair Display, serif' },
            { label: 'Mono',          value: 'JetBrains Mono, monospace' }
        ],
        fontSizes: [
            { label: 'XS', value: '11px' },
            { label: 'S',  value: '12px' },
            { label: 'M',  value: '13px' },
            { label: 'L',  value: '14px' },
            { label: 'XL', value: '16px' }
        ],
        fontWeights: [
            { label: 'Тонкий',  value: '300' },
            { label: 'Обычный', value: '400' },
            { label: 'Средний', value: '500' },
            { label: 'Полужирный', value: '600' },
            { label: 'Жирный',  value: '700' }
        ],
        textTransformOptions: [
            { label: 'Аа',   value: 'none' },
            { label: 'аа',   value: 'lowercase' },
            { label: 'АА',   value: 'uppercase' },
            { label: 'Ка.',  value: 'capitalize' }
        ],
        shadowPresets: [
            { label: 'Нет',  value: 'none' },
            { label: 'S',    value: '0 1px 4px rgba(0,0,0,0.08)' },
            { label: 'M',    value: '0 4px 24px rgba(79,106,255,0.10), 0 1px 4px rgba(0,0,0,0.06)' },
            { label: 'L',    value: '0 8px 40px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.08)' },
            { label: 'XL',   value: '0 16px 64px rgba(0,0,0,0.2), 0 4px 16px rgba(0,0,0,0.1)' }
        ]
    }),

    computed: {
        letterSpacingVal() {
            const v = parseFloat(this.props.calLetterSpacing || '0');
            return isNaN(v) ? 0 : v;
        }
    },

    methods: {
        set(key, val) {
            this.props[key] = val;
            this.propChanged(key);
        },

        openColor(key) {
            const ref = this.$refs[`clr_${key}`];
            const el = Array.isArray(ref) ? ref[0] : ref;
            if (el) el.click();
        },

        simpleColor(val) {
            if (!val) return '#000000';
            return val.startsWith('#') && val.length <= 9 ? val : '#4f6aff';
        },

        parseRadius(val) { return parseInt(val, 10) || 0; },

        applyCustomFont() {
            const f = this.customFontInput.trim();
            if (!f) return;
            this.set('calFontFamily', f);
            this.customFontInput = '';
        },

        onLetterSpacing(rawVal) {
            const num = parseFloat(rawVal);
            this.set('calLetterSpacing', num === 0 ? '0' : `${num}px`);
        },

        applyPreset(key, preset) {
            this.set('calPreset', key);
            const p = preset.props;
            Object.keys(p).forEach((k) => this.set(k, p[k]));
            if (key === 'demo') {
                const now = new Date();
                const events = buildDemoEvents(now.getFullYear(), now.getMonth() + 1);
                this.set('calEventsJson', JSON.stringify(events));
            }
        },

        presetBorderStyle(p) {
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
.p-field-label {
    font-size: 11px;
    font-weight: 600;
    color: #64748b;
    margin-bottom: 5px;
}

/* ── Presets ──────────────────────────────────────────────────── */
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
.preset-card:hover { border-color: #a5b4fc; transform: translateY(-1px); box-shadow: 0 3px 10px rgba(79,106,255,0.12); }
.preset-card--active { border-color: #4f6aff; box-shadow: 0 0 0 2px rgba(79,106,255,0.18); }
.preset-card__preview { width: 100%; height: 48px; display: flex; flex-direction: column; }
.preset-card__preview-hd { height: 14px; display: flex; align-items: center; gap: 3px; padding: 0 4px; }
.preset-card__preview-dot { width: 5px; height: 5px; border-radius: 50%; background: rgba(255,255,255,0.5); flex-shrink: 0; }
.preset-card__preview-line { height: 3px; flex: 1; background: rgba(255,255,255,0.35); border-radius: 2px; }
.preset-card__preview-body { flex: 1; display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; padding: 2px; }
.preset-card__preview-cell { border-radius: 2px; border: 1px solid; position: relative; }
.preset-card__preview-ev { position: absolute; bottom: 2px; left: 1px; right: 1px; height: 3px; border-radius: 2px; }
.preset-card__label { font-size: 10px; font-weight: 600; color: #64748b; white-space: nowrap; }
.preset-card__check { position: absolute; top: 4px; right: 4px; width: 16px; height: 16px; border-radius: 50%; background: #4f6aff; color: #fff; display: flex; align-items: center; justify-content: center; }

/* ── Color row ────────────────────────────────────────────────── */
.color-row { display: flex; flex-wrap: wrap; gap: 8px 12px; }
.color-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    width: 44px;
}
.color-item__swatch {
    position: relative;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    border: 2px solid rgba(0,0,0,0.1);
    transition: transform 0.12s, box-shadow 0.12s;
    overflow: hidden;
    flex-shrink: 0;
}
.color-item:hover .color-item__swatch { transform: scale(1.1); box-shadow: 0 2px 8px rgba(0,0,0,0.22); }
.color-item__input {
    position: absolute;
    inset: -4px;
    opacity: 0;
    width: calc(100% + 8px);
    height: calc(100% + 8px);
    cursor: pointer;
    padding: 0;
    border: none;
}
.color-item__label {
    font-size: 9px;
    font-weight: 600;
    color: #94a3b8;
    text-align: center;
    line-height: 1.3;
    width: 44px;
    white-space: normal;
    word-break: break-word;
    hyphens: auto;
}

/* ── Color swatch grid ────────────────────────────────────────── */
.swatch-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 8px;
    margin-bottom: 10px;
    padding: 10px;
    background: #f8fafc;
    border-radius: 10px;
    border: 1px solid #e8ecf4;
}
.swatch-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    width: 38px;
}
.swatch-item__dot {
    width: 24px;
    height: 24px;
    border-radius: 6px;
    border: 1.5px solid rgba(0, 0, 0, 0.10);
    flex-shrink: 0;
}
.swatch-item__label {
    font-size: 8px;
    font-weight: 600;
    color: #94a3b8;
    text-align: center;
    line-height: 1.2;
    width: 38px;
    white-space: normal;
    word-break: break-word;
}
.cp-list { display: flex; flex-direction: column; }

/* ── Font family chips ────────────────────────────────────────── */
.font-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    margin-bottom: 8px;
}
.font-chip {
    padding: 5px 11px;
    border: 1.5px solid #e2e8f0;
    border-radius: 20px;
    background: #fff;
    color: #334155;
    font-size: 12px;
    cursor: pointer;
    transition: border-color 0.12s, background 0.12s, color 0.12s;
    white-space: nowrap;
}
.font-chip:hover { border-color: #a5b4fc; color: #4f6aff; }
.font-chip--active { border-color: #4f6aff; background: #eff2ff; color: #4f6aff; font-weight: 600; }

/* ── Custom font row ──────────────────────────────────────────── */
.custom-font-row {
    display: flex;
    gap: 5px;
    margin-bottom: 8px;
}
.custom-font-input {
    flex: 1;
    padding: 7px 10px;
    border: 1.5px solid #e2e8f0;
    border-radius: 8px;
    font-size: 12px;
    font-family: inherit;
    outline: none;
    color: #334155;
    background: #f8fafc;
    transition: border-color 0.15s;
}
.custom-font-input:focus { border-color: #4f6aff; background: #fff; }
.custom-font-btn {
    width: 34px;
    height: 34px;
    border: 1.5px solid #e2e8f0;
    border-radius: 8px;
    background: #fff;
    color: #64748b;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
    flex-shrink: 0;
    transition: border-color 0.12s, background 0.12s, color 0.12s;
}
.custom-font-btn:not(:disabled):hover { border-color: #4f6aff; background: #eff2ff; color: #4f6aff; }
.custom-font-btn:disabled { opacity: 0.4; cursor: not-allowed; }

/* ── Segmented control ────────────────────────────────────────── */
.seg-ctrl { display: flex; background: #f1f5f9; border-radius: 7px; padding: 2px; gap: 1px; }
.seg-ctrl--wrap { flex-wrap: wrap; }
.seg-ctrl__btn { padding: 4px 9px; border: none; border-radius: 5px; background: transparent; color: #64748b; font-size: 11px; font-weight: 600; cursor: pointer; transition: background 0.12s, color 0.12s; white-space: nowrap; }
.seg-ctrl__btn:hover { color: #334155; }
.seg-ctrl__btn--active { background: #fff; color: #4f6aff; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }

/* ── Text transform cards ─────────────────────────────────────── */
.opt-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 5px;
}
.opt-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    padding: 7px 4px 6px;
    border: 1.5px solid #e2e8f0;
    border-radius: 8px;
    background: #fff;
    cursor: pointer;
    transition: border-color 0.12s, background 0.12s;
}
.opt-card:hover { border-color: #a5b4fc; background: #f8f9ff; }
.opt-card--active { border-color: #4f6aff; background: #eff2ff; }
.opt-card__preview { font-size: 14px; font-weight: 600; color: #334155; line-height: 1; }
.opt-card--active .opt-card__preview { color: #4f6aff; }
.opt-card__label { font-size: 9px; font-weight: 600; color: #94a3b8; text-align: center; }
.opt-card--active .opt-card__label { color: #4f6aff; }

/* ── Letter spacing slider ────────────────────────────────────── */
.slider-row { display: flex; align-items: center; gap: 8px; }
.slider {
    flex: 1;
    height: 4px;
    border-radius: 2px;
    background: #e2e8f0;
    outline: none;
    appearance: none;
    cursor: pointer;
}
.slider::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #4f6aff;
    cursor: pointer;
    box-shadow: 0 1px 4px rgba(79,106,255,0.3);
    transition: transform 0.1s;
}
.slider::-webkit-slider-thumb:hover { transform: scale(1.15); }
.slider-val { font-size: 11px; font-weight: 600; color: #334155; font-family: monospace; min-width: 36px; }

/* ── Shadow chips ─────────────────────────────────────────────── */
.shadow-chips { display: flex; gap: 5px; flex-wrap: wrap; }
.shadow-chip { padding: 4px 10px; border-radius: 20px; border: 1.5px solid #e2e8f0; background: #fff; color: #64748b; font-size: 11px; font-weight: 600; cursor: pointer; transition: border-color 0.12s, color 0.12s, background 0.12s; }
.shadow-chip:hover { border-color: #a5b4fc; color: #4f6aff; }
.shadow-chip--active { border-color: #4f6aff; background: #eff2ff; color: #4f6aff; }
</style>
