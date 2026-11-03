<template>
    <w-panel>
        <div class="fab-panel">
            <div v-if="props.displayMode === 'inline'" class="fab-notice">
                Кнопка видна только в режиме «Плавающая кнопка» (панель «Настройки» → «Режим отображения»).
            </div>

            <!-- ── Живое превью: та же кнопка, что на странице ─────────── -->
            <div class="p-section__label">Превью</div>
            <div class="fab-stage" :class="{ 'fab-stage--left': isLeft }">
                <div class="fab-stage__page">
                    <div class="fab-stage__line fab-stage__line--title" />
                    <div class="fab-stage__line" />
                    <div class="fab-stage__line fab-stage__line--short" />
                    <div class="fab-stage__line" />
                    <div class="fab-stage__line fab-stage__line--short" />
                </div>
                <div class="fab-stage__fab" :style="stageOffsetStyle">
                    <fab-button :config="props" :title="props.title" :pulse="props.fabPulse !== false" />
                </div>
            </div>

            <!-- ── Пресеты ─────────────────────────────────────────────── -->
            <div class="p-section">
                <div class="p-section__label">Пресет</div>
                <div class="presets-grid">
                    <div
                        v-for="(preset, key) in presets"
                        :key="key"
                        role="button"
                        tabindex="0"
                        class="preset-card"
                        :class="{ 'preset-card--active': activePreset === key }"
                        @click="applyPreset(preset)"
                        @keydown.enter.prevent="applyPreset(preset)"
                        @keydown.space.prevent="applyPreset(preset)">
                        <span class="preset-card__preview">
                            <fab-button :config="presetPreviewConfig(preset)" :title="preset.label" tabindex="-1" />
                        </span>
                        <span class="preset-card__label">{{ preset.label }}</span>
                        <span v-if="activePreset === key" class="preset-card__check">
                            <svg width="10" height="8" viewBox="0 0 10 8">
                                <path
                                    d="M1 4l3 3 5-6"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    fill="none" />
                            </svg>
                        </span>
                    </div>
                </div>
            </div>

            <!-- ── Иконка и текст ──────────────────────────────────────── -->
            <div class="p-section">
                <div class="p-section__label">Иконка и текст</div>
                <div class="icon-grid">
                    <button
                        v-for="(icon, key) in icons"
                        :key="key"
                        type="button"
                        class="icon-chip"
                        :class="{ 'icon-chip--active': currentIcon === key }"
                        :title="icon.label"
                        @click="set('fabIcon', key)">
                        <svg v-if="icon.path" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                            <path fill="currentColor" :d="icon.path" />
                        </svg>
                        <span v-else class="icon-chip__none">Aa</span>
                    </button>
                </div>
                <div class="p-field-label" style="margin-top: 10px">Текст на кнопке</div>
                <input
                    class="text-input"
                    type="text"
                    maxlength="24"
                    placeholder="Пусто — только иконка"
                    :value="props.fabLabel"
                    @input="set('fabLabel', $event.target.value)" />
            </div>

            <!-- ── Форма и размер ──────────────────────────────────────── -->
            <div class="p-section">
                <div class="p-section__label">Форма и размер</div>
                <div class="seg-ctrl">
                    <button
                        v-for="shape in shapes"
                        :key="shape.value"
                        type="button"
                        class="seg-ctrl__btn"
                        :class="{ 'seg-ctrl__btn--active': (props.fabShape || 'circle') === shape.value }"
                        @click="set('fabShape', shape.value)">
                        <span class="seg-ctrl__shape" :class="`seg-ctrl__shape--${shape.value}`" />
                        {{ shape.label }}
                    </button>
                </div>
                <div class="p-field-label" style="margin-top: 10px">Размер</div>
                <div class="slider-row">
                    <input
                        type="range"
                        class="slider"
                        :min="size.min"
                        :max="size.max"
                        step="2"
                        :value="currentSize"
                        @input="set('fabSize', Number($event.target.value))" />
                    <span class="slider-val">{{ currentSize }}px</span>
                </div>
            </div>

            <!-- ── Цвета ───────────────────────────────────────────────── -->
            <div class="p-section">
                <div class="p-section__label">Цвета</div>
                <div class="color-row">
                    <ui-input-cp prop="fabBg">Фон</ui-input-cp>
                    <ui-input-cp prop="fabIconColor">Иконка и текст</ui-input-cp>
                </div>
                <div class="chip-row" style="margin-top: 6px">
                    <button type="button" class="mini-chip" @click="set('fabBg', '')">Фон = акцентный</button>
                    <button type="button" class="mini-chip" @click="set('fabIconColor', '')">Иконка = акцентный</button>
                </div>
            </div>

            <!-- ── Тень и рамка ────────────────────────────────────────── -->
            <div class="p-section">
                <div class="p-section__label">Тень и рамка</div>
                <div class="seg-ctrl">
                    <button
                        v-for="(shadow, key) in shadows"
                        :key="key"
                        type="button"
                        class="seg-ctrl__btn"
                        :class="{ 'seg-ctrl__btn--active': (props.fabShadow || 'm') === key }"
                        @click="set('fabShadow', key)">
                        {{ shadow.label }}
                    </button>
                </div>
                <div class="p-field-label" style="margin-top: 10px">Рамка</div>
                <div class="slider-row">
                    <input
                        type="range"
                        class="slider"
                        min="0"
                        max="4"
                        step="1"
                        :value="Number(props.fabBorderWidth) || 0"
                        @input="set('fabBorderWidth', Number($event.target.value))" />
                    <span class="slider-val">{{ Number(props.fabBorderWidth) || 0 }}px</span>
                </div>
                <div v-if="Number(props.fabBorderWidth) > 0" class="color-row" style="margin-top: 6px">
                    <ui-input-cp prop="fabBorderColor">Цвет рамки</ui-input-cp>
                </div>
                <label class="toggle-row" style="margin-top: 10px">
                    <span class="toggle-row__label">Пульсация до первого открытия</span>
                    <span
                        class="toggle"
                        :class="{ 'toggle--on': props.fabPulse !== false }"
                        @click="set('fabPulse', props.fabPulse === false)">
                        <span class="toggle__thumb" />
                    </span>
                </label>
            </div>

            <!-- ── Расположение ────────────────────────────────────────── -->
            <div class="p-section">
                <div class="p-section__label">Расположение</div>
                <div class="seg-ctrl">
                    <button
                        v-for="pos in positions"
                        :key="pos.value"
                        type="button"
                        class="seg-ctrl__btn"
                        :class="{ 'seg-ctrl__btn--active': (props.position || 'bottom-right') === pos.value }"
                        @click="set('position', pos.value)">
                        {{ pos.label }}
                    </button>
                </div>
                <div class="p-field-label" style="margin-top: 10px">Отступ от края экрана</div>
                <div class="slider-row">
                    <input
                        type="range"
                        class="slider"
                        min="0"
                        max="80"
                        step="2"
                        :value="currentOffset"
                        @input="set('offset', Number($event.target.value))" />
                    <span class="slider-val">{{ currentOffset }}px</span>
                </div>
                <div class="p-field-label" style="margin-top: 10px">Слой (z-index)</div>
                <input
                    class="text-input"
                    type="number"
                    min="0"
                    :value="props.zIndex"
                    @change="set('zIndex', Number($event.target.value) || 0)" />
            </div>
        </div>
    </w-panel>
</template>

<script>
import { Panel } from '@goodt-wcore/panel';
import { PanelInstanceTypeDescriptor } from '../types';
import FabButton from '../components/FabButton.vue';
import { FAB_ICONS, FAB_PRESETS, FAB_SHADOWS, FAB_SHAPES, FAB_SIZE } from '../fab';

/** Превью на «экране» уменьшено: отступ показываем в масштабе */
const STAGE_SCALE = 0.5;
const PRESET_PREVIEW_SIZE = 34;

export default {
    extends: Panel,
    components: { FabButton },
    meta: { name: 'Кнопка', icon: 'gesture-tap-button' },

    data: () => ({
        ...PanelInstanceTypeDescriptor,
        presets: FAB_PRESETS,
        icons: FAB_ICONS,
        shapes: FAB_SHAPES,
        shadows: FAB_SHADOWS,
        size: FAB_SIZE,
        positions: [
            { label: 'Справа внизу', value: 'bottom-right' },
            { label: 'Слева внизу', value: 'bottom-left' }
        ]
    }),

    computed: {
        isLeft() {
            return this.props.position === 'bottom-left';
        },
        currentSize() {
            const n = Number(this.props.fabSize);
            return Number.isFinite(n) && n > 0 ? n : FAB_SIZE.default;
        },
        currentOffset() {
            const n = Number(this.props.offset);
            return Number.isFinite(n) ? n : 24;
        },
        currentIcon() {
            return FAB_ICONS[this.props.fabIcon] ? this.props.fabIcon : 'chat';
        },
        stageOffsetStyle() {
            const offset = `${Math.max(6, Math.round(this.currentOffset * STAGE_SCALE))}px`;
            return this.isLeft ? { left: offset, bottom: offset } : { right: offset, bottom: offset };
        },
        /** Пресет, с которым совпадают текущие пропсы (иначе — «свои настройки») */
        activePreset() {
            const entry = Object.entries(FAB_PRESETS).find(([, preset]) =>
                Object.entries(preset.props).every(([key, value]) => this.isSame(this.props[key], value))
            );
            return entry ? entry[0] : '';
        }
    },

    methods: {
        set(key, value) {
            this.props[key] = value;
            this.propChanged(key);
        },

        applyPreset(preset) {
            Object.entries(preset.props).forEach(([key, value]) => this.set(key, value));
        },

        /** Мини-кнопка пресета: те же пропсы, но маленькая и без текста */
        presetPreviewConfig(preset) {
            return {
                ...this.props,
                ...preset.props,
                fabLabel: preset.props.fabLabel ? '…' : '',
                fabSize: PRESET_PREVIEW_SIZE
            };
        },

        isSame(a, b) {
            const norm = (v) => (v == null ? '' : String(v).toLowerCase());
            return norm(a) === norm(b);
        }
    }
};
</script>

<style scoped>
.fab-panel {
    padding: 12px;
}

.fab-notice {
    margin-bottom: 12px;
    padding: 8px 10px;
    border-radius: 8px;
    background: #fef3c7;
    color: #92400e;
    font-size: 11px;
    line-height: 1.4;
}

.p-section {
    margin-top: 14px;
    padding-top: 14px;
    border-top: 1px solid #f1f5f9;
}
.p-section__label {
    margin-bottom: 8px;
    color: #94a3b8;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
}
.p-field-label {
    margin-bottom: 5px;
    color: #64748b;
    font-size: 11px;
    font-weight: 600;
}

/* ── Превью ───────────────────────────────────────────────────── */
.fab-stage {
    position: relative;
    height: 170px;
    overflow: hidden;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    background: linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%);
}
.fab-stage__page {
    display: flex;
    flex-direction: column;
    gap: 7px;
    padding: 14px 16px;
}
.fab-stage__line {
    width: 78%;
    height: 6px;
    border-radius: 3px;
    background: #dde3eb;
}
.fab-stage__line--title {
    width: 45%;
    height: 10px;
    margin-bottom: 4px;
    background: #cfd7e2;
}
.fab-stage__line--short {
    width: 52%;
}
.fab-stage__fab {
    position: absolute;
    display: flex;
    transition: left 0.2s ease, right 0.2s ease, bottom 0.2s ease;
}

/* ── Пресеты ──────────────────────────────────────────────────── */
.presets-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
}
.preset-card {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 10px 4px 6px;
    border: 1.5px solid #e2e8f0;
    border-radius: 10px;
    background: #fff;
    cursor: pointer;
    transition: border-color 0.12s, box-shadow 0.12s, transform 0.1s;
}
.preset-card:hover {
    border-color: #a5b4fc;
    box-shadow: 0 3px 10px rgba(79, 106, 255, 0.12);
    transform: translateY(-1px);
}
.preset-card--active {
    border-color: #4f6aff;
    box-shadow: 0 0 0 2px rgba(79, 106, 255, 0.18);
}
.preset-card__preview {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 40px;
    pointer-events: none;
}
.preset-card__label {
    color: #64748b;
    font-size: 10px;
    font-weight: 600;
    white-space: nowrap;
}
.preset-card__check {
    position: absolute;
    top: 4px;
    right: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #4f6aff;
    color: #fff;
}

/* ── Иконки ───────────────────────────────────────────────────── */
.icon-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 6px;
}
.icon-chip {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 34px;
    border: 1.5px solid #e2e8f0;
    border-radius: 8px;
    background: #fff;
    color: #475569;
    cursor: pointer;
    transition: border-color 0.12s, color 0.12s;
}
.icon-chip:hover {
    border-color: #a5b4fc;
}
.icon-chip--active {
    border-color: #4f6aff;
    background: #eef2ff;
    color: #4f6aff;
}
.icon-chip__none {
    font-size: 11px;
    font-weight: 700;
}

/* ── Поля ─────────────────────────────────────────────────────── */
.text-input {
    box-sizing: border-box;
    width: 100%;
    height: 30px;
    padding: 0 8px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 12px;
    outline: none;
}
.text-input:focus {
    border-color: #4f6aff;
}

.seg-ctrl {
    display: flex;
    gap: 2px;
    padding: 2px;
    border-radius: 8px;
    background: #f1f5f9;
}
.seg-ctrl__btn {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    gap: 5px;
    height: 26px;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: #64748b;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
}
.seg-ctrl__btn--active {
    background: #fff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    color: #4f6aff;
}
.seg-ctrl__shape {
    width: 10px;
    height: 10px;
    background: currentColor;
}
.seg-ctrl__shape--circle {
    border-radius: 50%;
}
.seg-ctrl__shape--squircle {
    border-radius: 3px;
}
.seg-ctrl__shape--square {
    border-radius: 1px;
}

.slider-row {
    display: flex;
    align-items: center;
    gap: 8px;
}
.slider {
    flex: 1;
    accent-color: #4f6aff;
}
.slider-val {
    min-width: 38px;
    color: #475569;
    font-size: 11px;
    font-weight: 600;
    text-align: right;
}

.color-row {
    display: flex;
    flex-direction: column;
    gap: 6px;
}
.chip-row {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
}
.mini-chip {
    padding: 3px 8px;
    border: 1px solid #e2e8f0;
    border-radius: 999px;
    background: #fff;
    color: #64748b;
    font-size: 10px;
    cursor: pointer;
}
.mini-chip:hover {
    border-color: #a5b4fc;
    color: #4f6aff;
}

.toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    cursor: pointer;
}
.toggle-row__label {
    color: #475569;
    font-size: 12px;
}
.toggle {
    position: relative;
    flex-shrink: 0;
    width: 32px;
    height: 18px;
    border-radius: 9px;
    background: #cbd5e1;
    transition: background 0.15s;
}
.toggle--on {
    background: #4f6aff;
}
.toggle__thumb {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    transition: transform 0.15s;
}
.toggle--on .toggle__thumb {
    transform: translateX(14px);
}
</style>
