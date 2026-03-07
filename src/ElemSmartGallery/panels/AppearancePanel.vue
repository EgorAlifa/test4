<template>
    <ui-panel-container>
        <ui-container>

            <!-- ── Пресеты ──────────────────────────────────────────────── -->
            <div class="section-label">Пресеты</div>
            <div class="presets-row">
                <button
                    v-for="p in stylePresets"
                    :key="p.label"
                    class="preset-chip"
                    :class="{ 'preset-chip--reset': p.isReset }"
                    :title="p.label"
                    @click="applyPreset(p)">
                    {{ p.label }}
                </button>
            </div>

            <!-- ── Фон ─────────────────────────────────────────────────── -->
            <div class="color-block">
                <div class="color-block__label">Фон</div>
                <div class="color-swatches">
                    <button
                        v-for="c in bgColors"
                        :key="c.value"
                        class="swatch"
                        :class="{
                            'swatch--active': props.backgroundColor === c.value,
                            'swatch--none': c.value === '',
                            'swatch--transparent': c.value === 'transparent'
                        }"
                        :style="c.value && c.value !== 'transparent' ? { background: c.value } : {}"
                        :title="c.label"
                        @click="set('backgroundColor', c.value)" />
                    <div class="swatch-cp-wrap" title="Свой цвет" @click="openCp('cp_bg')" />
                </div>
                <ui-input-cp ref="cp_bg" prop="backgroundColor" class="color-custom-input" />
            </div>

            <!-- ── Текст ─────────────────────────────────────────────────── -->
            <div class="color-block">
                <div class="color-block__label">Цвет текста</div>
                <div class="color-swatches">
                    <button
                        v-for="c in textColors"
                        :key="c.value"
                        class="swatch"
                        :class="{
                            'swatch--active': props.textColor === c.value,
                            'swatch--none': c.value === ''
                        }"
                        :style="c.value ? { background: c.value } : {}"
                        :title="c.label"
                        @click="set('textColor', c.value)" />
                    <div class="swatch-cp-wrap" title="Свой цвет" @click="openCp('cp_text')" />
                </div>
                <ui-input-cp ref="cp_text" prop="textColor" class="color-custom-input" />
            </div>

            <!-- ── Скругление ──────────────────────────────────────────── -->
            <div class="section-label">Скругление</div>
            <div class="radius-row">
                <button
                    v-for="r in radiusPresets"
                    :key="r.value"
                    class="radius-chip"
                    :class="{ 'radius-chip--active': props.borderRadius === r.value }"
                    @click="set('borderRadius', r.value)">
                    {{ r.label }}
                </button>
            </div>

            <!-- ── Тень ────────────────────────────────────────────────── -->
            <div class="section-label">Тень</div>
            <div class="shadow-row">
                <button
                    v-for="s in shadowPresets"
                    :key="s.label"
                    class="shadow-chip"
                    :class="{ 'shadow-chip--active': props.boxShadow === s.value }"
                    @click="set('boxShadow', s.value)">
                    {{ s.label }}
                </button>
            </div>

            <!-- ── Прозрачность ────────────────────────────────────────── -->
            <div class="section-label">Прозрачность ({{ opacityPct }}%)</div>
            <input
                type="range"
                class="slider"
                :value="opacityPct"
                min="0"
                max="100"
                step="5"
                @input="set('opacity', $event.target.value / 100)"
            />

        </ui-container>
    </ui-panel-container>
</template>

<script>
import { Panel } from '@goodt-wcore/panel';
import UiContainer from './components/UiContainer.vue';

const DEFAULT_PROPS = {
    backgroundColor: '',
    textColor: '',
    borderRadius: '0',
    boxShadow: '',
    opacity: 1,
};

const STYLE_PRESETS = [
    { label: 'Сброс', isReset: true },
    {
        label: 'Карточка',
        values: {
            backgroundColor: '#ffffff',
            textColor: '#1e293b',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06)',
            opacity: 1,
        }
    },
    {
        label: 'Тёмная',
        values: {
            backgroundColor: '#1e293b',
            textColor: '#f1f5f9',
            borderRadius: '12px',
            boxShadow: '0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)',
            opacity: 1,
        }
    },
    {
        label: 'Рамка',
        values: {
            backgroundColor: 'transparent',
            textColor: '',
            borderRadius: '8px',
            boxShadow: '',
            opacity: 1,
        }
    },
];

const BG_COLORS = [
    { value: '',            label: 'Без цвета' },
    { value: 'transparent', label: 'Прозрачный' },
    { value: '#ffffff',     label: 'Белый' },
    { value: '#f8fafc',     label: 'Светло-серый' },
    { value: '#f1f5f9',     label: 'Серый' },
    { value: '#1e293b',     label: 'Тёмно-синий' },
    { value: '#0f172a',     label: 'Очень тёмный' },
];

const TEXT_COLORS = [
    { value: '',        label: 'По умолчанию' },
    { value: '#0f172a', label: 'Почти чёрный' },
    { value: '#1e293b', label: 'Тёмный' },
    { value: '#64748b', label: 'Серый' },
    { value: '#94a3b8', label: 'Светло-серый' },
    { value: '#ffffff', label: 'Белый' },
];

const RADIUS_PRESETS = [
    { value: '0',    label: '□' },
    { value: '4px',  label: 'S' },
    { value: '8px',  label: 'M' },
    { value: '12px', label: 'L' },
    { value: '24px', label: 'XL' },
];

const SHADOW_PRESETS = [
    { label: 'Нет',      value: '' },
    { label: 'Мягкая',   value: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)' },
    { label: 'Средняя',  value: '0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06)' },
    { label: 'Глубокая', value: '0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)' },
];

export default {
    extends: Panel,
    components: { UiContainer },

    meta: { name: 'Оформление', icon: 'palette-outline' },

    static: {
        bgColors: BG_COLORS,
        textColors: TEXT_COLORS,
        radiusPresets: RADIUS_PRESETS,
        shadowPresets: SHADOW_PRESETS,
        stylePresets: STYLE_PRESETS,
    },

    computed: {
        opacityPct() {
            return Math.round(parseFloat(this.props.opacity ?? 1) * 100); // eslint-disable-line no-magic-numbers
        }
    },

    methods: {
        set(prop, value) {
            this.$set(this.props, prop, value);
            this.propChanged(prop);
        },

        openCp(refName) {
            const cp = this.$refs[refName];
            if (!cp) return;
            if (typeof cp.togglePopover === 'function') {
                cp.togglePopover();
            } else if (cp.$el) {
                const trigger = cp.$el.querySelector('.ui-input-color-picker-icon-preview');
                if (trigger) trigger.click();
            }
        },

        applyPreset(preset) {
            if (preset.isReset) {
                Object.entries(DEFAULT_PROPS).forEach(([k, v]) => {
                    this.$set(this.props, k, v);
                    this.propChanged(k);
                });
                return;
            }
            Object.entries(preset.values).forEach(([k, v]) => {
                this.$set(this.props, k, v);
                this.propChanged(k);
            });
        }
    }
};
</script>

<style scoped>
/* ── Секции ───────────────────────────────────────────────────────── */
.section-label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #94a3b8;
    margin-bottom: 2px;
}

/* ── Пресеты ──────────────────────────────────────────────────────── */
.presets-row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}
.preset-chip {
    padding: 5px 11px;
    border-radius: 20px;
    border: 1.5px solid #e2e8f0;
    background: #fff;
    font-size: 12px;
    font-weight: 500;
    color: #475569;
    cursor: pointer;
    transition: border-color 0.12s, color 0.12s;
    white-space: nowrap;
}
.preset-chip:hover { border-color: #94a3b8; }
.preset-chip--reset {
    border-color: #fca5a5;
    color: #ef4444;
}
.preset-chip--reset:hover { border-color: #ef4444; }

/* ── Блок цвета ───────────────────────────────────────────────────── */
.color-block { display: flex; flex-direction: column; gap: 4px; }
.color-block__label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #94a3b8;
}

/* ── Свотчи ───────────────────────────────────────────────────────── */
.color-swatches {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
}
.swatch {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    border: 2px solid rgba(0, 0, 0, 0.08);
    cursor: pointer;
    flex-shrink: 0;
    transition: transform 0.1s, border-color 0.1s;
    padding: 0;
}
.swatch:hover { transform: scale(1.15); }
.swatch--active { border-color: #4f6aff; box-shadow: 0 0 0 2px rgba(79, 106, 255, 0.25); }
.swatch--transparent {
    background: repeating-conic-gradient(#e2e8f0 0% 25%, #fff 0% 50%) 0 0 / 8px 8px !important;
}
/* "без цвета" — белый с диагональной линией */
.swatch--none {
    background: #fff !important;
    position: relative;
    overflow: hidden;
}
.swatch--none::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
        to bottom right,
        transparent calc(50% - 1px),
        #e2e8f0 calc(50% - 1px),
        #e2e8f0 calc(50% + 1px),
        transparent calc(50% + 1px)
    );
}

/* ── Радужный кружок-триггер ──────────────────────────────────────── */
.swatch-cp-wrap {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: conic-gradient(red, yellow, lime, cyan, blue, magenta, red);
    border: 2px solid rgba(0, 0, 0, 0.1);
    flex-shrink: 0;
    cursor: pointer;
    transition: transform 0.1s;
}
.swatch-cp-wrap:hover { transform: scale(1.18); }

/* ui-input-cp под свотчами */
.color-custom-input {
    margin-top: 4px;
    width: 100%;
}

/* ── Скругление ───────────────────────────────────────────────────── */
.radius-row {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
}
.radius-chip {
    flex: 1;
    min-width: 36px;
    padding: 6px 4px;
    border-radius: 8px;
    border: 1.5px solid #e2e8f0;
    background: #fff;
    font-size: 12px;
    font-weight: 500;
    color: #475569;
    cursor: pointer;
    text-align: center;
    transition: border-color 0.12s;
}
.radius-chip:hover { border-color: #94a3b8; }
.radius-chip--active { border-color: #4f6aff; color: #4f6aff; background: #f5f7ff; }

/* ── Тень ─────────────────────────────────────────────────────────── */
.shadow-row {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
}
.shadow-chip {
    flex: 1;
    padding: 6px 6px;
    border-radius: 8px;
    border: 1.5px solid #e2e8f0;
    background: #fff;
    font-size: 11px;
    font-weight: 500;
    color: #475569;
    cursor: pointer;
    text-align: center;
    white-space: nowrap;
    transition: border-color 0.12s;
}
.shadow-chip:hover { border-color: #94a3b8; }
.shadow-chip--active { border-color: #4f6aff; color: #4f6aff; background: #f5f7ff; }

/* ── Слайдер ─────────────────────────────────────────────────────── */
.slider {
    width: 100%;
    height: 4px;
    appearance: none;
    background: #e2e8f0;
    border-radius: 2px;
    outline: none;
    display: block;
}
.slider::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
    background: #fff;
    border: 2px solid #4f6aff;
    border-radius: 50%;
    cursor: grab;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}
</style>
