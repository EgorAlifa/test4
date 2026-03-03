<template>
    <w-panel>
        <div class="oform-panel">

            <!-- ─── Цвета ──────────────────────────────────────────────── -->
            <div class="oform-section">
                <div class="oform-section__title">Цвета</div>
                <div class="oform-row">
                    <span class="oform-label">Фон</span>
                    <ui-input-cp
                        :value="props.backgroundColor"
                        @input="set('backgroundColor', $event)"
                    />
                </div>
                <div class="oform-row">
                    <span class="oform-label">Цвет текста</span>
                    <ui-input-cp
                        :value="props.textColor"
                        @input="set('textColor', $event)"
                    />
                </div>
            </div>

            <!-- ─── Форма ──────────────────────────────────────────────── -->
            <div class="oform-section">
                <div class="oform-section__title">Форма</div>
                <div class="oform-row">
                    <span class="oform-label">Скругление</span>
                    <ui-input-units
                        :value="props.borderRadius"
                        @input="set('borderRadius', $event)"
                    />
                </div>
            </div>

            <!-- ─── Тень ───────────────────────────────────────────────── -->
            <div class="oform-section">
                <div class="oform-section__title">Тень</div>
                <div class="shadow-presets">
                    <button
                        v-for="s in shadowPresets"
                        :key="s.label"
                        class="shadow-btn"
                        :class="{ 'shadow-btn--active': props.boxShadow === s.value }"
                        :style="{ boxShadow: s.value || 'none' }"
                        @click="set('boxShadow', s.value)"
                    >{{ s.label }}</button>
                </div>
            </div>

            <!-- ─── Прозрачность ───────────────────────────────────────── -->
            <div class="oform-section">
                <div class="oform-section__title">
                    Прозрачность ({{ opacityPct }}%)
                </div>
                <input
                    type="range"
                    :value="opacityPct"
                    min="0" max="100" step="5"
                    class="oform-slider"
                    @input="setOpacity($event.target.value)"
                />
            </div>

        </div>
    </w-panel>
</template>

<script>
import { Panel } from '@goodt-wcore/panel';

const SHADOW_PRESETS = [
    { label: 'Нет',      value: '' },
    { label: 'Лёгкая',   value: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)' },
    { label: 'Средняя',  value: '0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06)' },
    { label: 'Глубокая', value: '0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)' },
    { label: 'Чёткая',   value: '0 1px 3px rgba(0,0,0,0.3)' }
];

export default {
    extends: Panel,

    meta: { name: 'Оформление', icon: 'palette-outline' },

    data: () => ({
        shadowPresets: SHADOW_PRESETS
    }),

    computed: {
        opacityPct() {
            const v = parseFloat(this.props.opacity ?? 1);
            return Math.round(v * 100); // eslint-disable-line no-magic-numbers
        }
    },

    methods: {
        set(prop, value) {
            this.$set(this.props, prop, value);
            this.propChanged(prop);
        },
        setOpacity(pct) {
            this.set('opacity', parseInt(pct, 10) / 100); // eslint-disable-line no-magic-numbers
        }
    }
};
</script>

<style scoped>
.oform-panel { padding: 12px; }

.oform-section {
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid #f1f5f9;
}
.oform-section:last-child { border-bottom: none; margin-bottom: 0; }

.oform-section__title {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #94a3b8;
    margin-bottom: 8px;
}

.oform-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 8px;
}
.oform-row:last-child { margin-bottom: 0; }

.oform-label {
    font-size: 12px;
    color: #475569;
    flex-shrink: 0;
}

.shadow-presets { display: flex; flex-wrap: wrap; gap: 6px; }
.shadow-btn {
    padding: 6px 10px;
    border-radius: 8px;
    border: 1.5px solid #e2e8f0;
    background: #fff;
    font-size: 11px;
    font-weight: 500;
    color: #475569;
    cursor: pointer;
    transition: border-color 0.12s;
}
.shadow-btn:hover { border-color: #94a3b8; }
.shadow-btn--active { border-color: #4f6aff; color: #4f6aff; background: #f5f7ff; }

.oform-slider {
    width: 100%;
    height: 4px;
    appearance: none;
    background: #e2e8f0;
    border-radius: 2px;
    outline: none;
}
.oform-slider::-webkit-slider-thumb {
    appearance: none;
    width: 16px; height: 16px;
    background: #fff;
    border: 2px solid #4f6aff;
    border-radius: 50%;
    cursor: grab;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}
</style>
