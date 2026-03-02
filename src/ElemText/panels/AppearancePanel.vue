<template>
    <w-panel>
        <ui-container>
            <div class="accordions-wrapper">
            <!-- Прозрачность слоя -->
            <accordion-section
                title="Прозрачность"
                icon="opacity"
                :collapsed="!expandedSections.opacity"
                :enabled-count="getOpacityEnabledCount()"
                :total-count="1"
                @toggle="toggleSection('opacity')"
            >
                <div class="slider-row">
                    <input
                        type="range"
                        :value="opacityPercent"
                        min="0"
                        max="100"
                        class="slider-input"
                        @input="handleOpacityChange($event.target.value)"
                    />
                    <span class="slider-value">{{ opacityPercent }}%</span>
                </div>
            </accordion-section>

            <!-- Скругление углов -->
            <accordion-section
                title="Скругление"
                icon="rounded-corner"
                :collapsed="!expandedSections.radius"
                :enabled-count="getRadiusEnabledCount()"
                :total-count="1"
                @toggle="toggleSection('radius')"
            >
                <div class="radius-header">
                    <ui-checkbox v-model="linkCorners" @change="handleLinkCorners">
                        Связать углы
                    </ui-checkbox>
                </div>
                <div v-if="linkCorners" class="slider-with-input">
                    <input
                        type="range"
                        :value="radiusValue"
                        min="0"
                        max="100"
                        class="slider-input slider-input--flex"
                        @input="handleRadiusSlider($event.target.value)"
                    />
                    <ui-input-units
                        col-size="12"
                        min="0"
                        max="200"
                        :units="['px', '%', 'rem']"
                        v-model="borderRadiusStr"
                        @change="saveRadiusFromInput"
                        class="input-units-compact"
                    />
                </div>
                <div v-else class="corner-grid">
                    <ui-input-units
                        col-size="12"
                        min="0"
                        max="200"
                        :units="['px']"
                        v-model="cornerTopLeftStr"
                        @change="saveCorners"
                        class="corner-input"
                    >
                        Верх-лев
                    </ui-input-units>
                    <ui-input-units
                        col-size="12"
                        min="0"
                        max="200"
                        :units="['px']"
                        v-model="cornerTopRightStr"
                        @change="saveCorners"
                        class="corner-input"
                    >
                        Верх-прав
                    </ui-input-units>
                    <ui-input-units
                        col-size="12"
                        min="0"
                        max="200"
                        :units="['px']"
                        v-model="cornerBottomLeftStr"
                        @change="saveCorners"
                        class="corner-input"
                    >
                        Низ-лев
                    </ui-input-units>
                    <ui-input-units
                        col-size="12"
                        min="0"
                        max="200"
                        :units="['px']"
                        v-model="cornerBottomRightStr"
                        @change="saveCorners"
                        class="corner-input"
                    >
                        Низ-прав
                    </ui-input-units>
                </div>
            </accordion-section>

            <!-- Заливка -->
            <accordion-section
                title="Заливка"
                icon="format-color-fill"
                :collapsed="!expandedSections.fill"
                :enabled-count="getFillEnabledCount()"
                :total-count="2"
                @toggle="toggleSection('fill')"
            >
                <div class="color-row">
                    <span class="color-label">Цвет</span>
                    <ui-input-cp prop="fillColor" class="color-picker-inline" />
                </div>
                <div class="slider-row mt-2">
                    <span class="slider-label">Прозрачность</span>
                    <input
                        type="range"
                        :value="fillOpacityPercent"
                        min="0"
                        max="100"
                        class="slider-input slider-input--short"
                        @input="handleFillOpacityChange($event.target.value)"
                    />
                    <span class="slider-value">{{ fillOpacityPercent }}%</span>
                </div>
            </accordion-section>

            <!-- Обводка -->
            <accordion-section
                title="Обводка"
                icon="pencil"
                :collapsed="!expandedSections.stroke"
                :enabled-count="getStrokeEnabledCount()"
                :total-count="5"
                @toggle="toggleSection('stroke')"
            >
                <!-- Пресеты стилей (Figma-style) -->
                <div class="presets-row">
                    <button
                        v-for="preset in strokeStylePresets"
                        :key="preset.name"
                        :class="['preset-btn', { active: strokeStyleValue === preset.name }]"
                        :title="preset.label"
                        @click="applyStrokeStylePreset(preset)"
                    >
                        <span class="preset-icon">{{ preset.icon }}</span>
                    </button>
                </div>

                <!-- Цвет + Прозрачность -->
                <div class="color-row mt-2">
                    <span class="color-label">Цвет</span>
                    <ui-input-cp prop="strokeColor" class="color-picker-inline" />
                </div>
                <div class="slider-row mt-2">
                    <span class="slider-label">Прозрачность</span>
                    <input
                        type="range"
                        :value="strokeOpacityPercent"
                        min="0"
                        max="100"
                        class="slider-input slider-input--short"
                        @input="handleStrokeOpacityChange($event.target.value)"
                    />
                    <span class="slider-value">{{ strokeOpacityPercent }}%</span>
                </div>

                <!-- Толщина -->
                <div class="slider-with-input mt-2">
                    <span class="slider-label-inline">Толщина</span>
                    <input
                        type="range"
                        :value="strokeWidthValue"
                        min="0"
                        max="20"
                        class="slider-input slider-input--flex"
                        @input="handleStrokeWidthSlider($event.target.value)"
                    />
                    <ui-input-units
                        col-size="12"
                        min="0"
                        max="50"
                        :units="['px']"
                        v-model="strokeWidthStr"
                        @change="saveStrokeWidth"
                        class="input-units-compact"
                    />
                </div>

                <!-- Стиль линии -->
                <ui-select
                    v-model="strokeStyleValue"
                    :options="strokeStyleOptions"
                    label="Стиль"
                    class="mt-2"
                />

                <!-- Позиция -->
                <ui-select
                    v-model="strokePositionValue"
                    :options="strokePositionOptions"
                    label="Позиция"
                    class="mt-2"
                />

                <!-- Расширенные настройки (collapsible) -->
                <details class="advanced-stroke mt-2">
                    <summary class="advanced-stroke__summary">Расширенные настройки</summary>
                    <div class="advanced-stroke__content">
                        <!-- Dash Pattern -->
                        <div class="input-row mt-2">
                            <span class="input-label">Штрих</span>
                            <input
                                type="text"
                                v-model="strokeDasharrayValue"
                                placeholder="8,4"
                                class="text-input"
                                @change="saveStrokeDasharray"
                            />
                        </div>

                        <div class="hint-text mt-2">
                            Паттерн штриха (например "8,4" или "12,4,2,4"). Работает для стиля "Штриховая".
                        </div>
                    </div>
                </details>
            </accordion-section>

            <!-- Размерность текста (Figma) -->
            <accordion-section
                title="Размерность текста"
                icon="format-size"
                :collapsed="!expandedSections.textResize"
                :enabled-count="getTextResizeEnabledCount()"
                :total-count="1"
                @toggle="toggleSection('textResize')"
            >
                <ui-select
                    v-model="textAutoResizeValue"
                    :options="textAutoResizeOptions"
                    label="Авто-размер"
                />
                <div class="hint-text mt-2">
                    Определяет, как текст адаптируется к размеру контейнера (как в Figma)
                </div>
            </accordion-section>
            </div>
        </ui-container>
    </w-panel>
</template>

<script>
import { Panel } from '@goodt-wcore/panel';
import AccordionSection from './components/AccordionSection.vue';

// Inline stroke presets to avoid loading external file
// Full presets library available in constants/strokePresets.js for programmatic use
const STROKE_STYLE_PRESETS = [
    { name: 'solid', label: 'Сплошная', icon: '—', props: { strokeStyle: 'solid', strokeDasharray: '' } },
    { name: 'dashed', label: 'Штриховая', icon: '- -', props: { strokeStyle: 'dashed', strokeDasharray: '8,4' } },
    { name: 'dotted', label: 'Пунктирная', icon: '···', props: { strokeStyle: 'dotted', strokeDasharray: '' } },
    { name: 'double', label: 'Двойная', icon: '=', props: { strokeStyle: 'double', strokeDasharray: '' } }
];

export default {
    extends: Panel,

    components: {
        AccordionSection
    },

    meta: { name: 'Внешний вид', icon: 'palette' },

    data() {
        return {
            expandedSections: {
                opacity: false,
                radius: false,
                fill: false,
                stroke: false,
                textResize: false
            },
            linkCorners: true,
            radiusValue: 0,
            borderRadiusStr: '0px',
            cornerTopLeftStr: '0px',
            cornerTopRightStr: '0px',
            cornerBottomLeftStr: '0px',
            cornerBottomRightStr: '0px',
            strokeWidthValue: 0,
            strokeWidthStr: '0px',
            strokePositionOptions: [
                { value: 'inside', label: 'Внутри' },
                { value: 'outside', label: 'Снаружи' },
                { value: 'center', label: 'По центру' }
            ],
            strokeStyleOptions: [
                { value: 'solid', label: 'Сплошная' },
                { value: 'dashed', label: 'Штриховая' },
                { value: 'dotted', label: 'Пунктирная' },
                { value: 'double', label: 'Двойная' }
            ],
            strokeStylePresets: STROKE_STYLE_PRESETS,
            textAutoResizeOptions: [
                { value: 'NONE', label: 'Фиксированный' },
                { value: 'WIDTH_AND_HEIGHT', label: 'Авто (ширина и высота)' },
                { value: 'HEIGHT', label: 'Авто (только высота)' }
            ]
        };
    },

    computed: {
        opacityPercent() {
            const opacity = this.props.opacity;
            if (opacity == null || opacity === '') return 100; // eslint-disable-line no-magic-numbers
            return Math.round(parseFloat(opacity) * 100); // eslint-disable-line no-magic-numbers
        },

        fillOpacityPercent() {
            const opacity = this.props.fillOpacity;
            if (opacity == null || opacity === '') return 100; // eslint-disable-line no-magic-numbers
            return Math.round(parseFloat(opacity) * 100); // eslint-disable-line no-magic-numbers
        },

        strokePositionValue: {
            get() {
                return this.props.strokePosition || 'center';
            },
            set(val) {
                this.$set(this.props, 'strokePosition', val);
                this.propChanged('strokePosition');
            }
        },

        textAutoResizeValue: {
            get() {
                return this.props.textAutoResize || 'NONE';
            },
            set(val) {
                this.$set(this.props, 'textAutoResize', val);
                this.propChanged('textAutoResize');
            }
        },

        // Stroke extended props
        strokeOpacityPercent() {
            const opacity = this.props.strokeOpacity;
            if (opacity == null || opacity === '') return 100; // eslint-disable-line no-magic-numbers
            return Math.round(parseFloat(opacity) * 100); // eslint-disable-line no-magic-numbers
        },

        strokeStyleValue: {
            get() {
                return this.props.strokeStyle || 'solid';
            },
            set(val) {
                this.$set(this.props, 'strokeStyle', val);
                this.propChanged('strokeStyle');
            }
        },

        strokeDasharrayValue: {
            get() {
                return this.props.strokeDasharray || '';
            },
            set(val) {
                this.$set(this.props, 'strokeDasharray', val);
            }
        },

    },

    created() {
        this.initCornerRadius();
        this.initStrokeWidth();
    },

    methods: {
        toggleSection(section) {
            this.expandedSections[section] = !this.expandedSections[section];
        },

        // ═══════════════════════════════════════════════════════════════
        // ENABLED COUNTS FOR ACCORDION
        // ═══════════════════════════════════════════════════════════════
        getOpacityEnabledCount() {
            const opacity = this.props.opacity;
            if (opacity != null && opacity !== '' && parseFloat(opacity) < 1) return 1;
            return 0;
        },

        getRadiusEnabledCount() {
            const radius = this.props.borderRadius;
            if (!radius) return 0;
            if (typeof radius === 'object') {
                if (radius.size && radius.size > 0) return 1;
                if (radius.topLeft || radius.topRight || radius.bottomLeft || radius.bottomRight) return 1;
            }
            if (this.parseNumber(radius) > 0) return 1;
            return 0;
        },

        getFillEnabledCount() {
            let count = 0;
            if (this.props.fillColor) count++;
            const fillOpacity = this.props.fillOpacity;
            if (fillOpacity != null && fillOpacity !== '' && parseFloat(fillOpacity) < 1) count++;
            return count;
        },

        getStrokeEnabledCount() {
            let count = 0;
            if (this.props.strokeColor) count++;
            if (this.strokeWidthValue > 0) count++;
            if (this.props.strokePosition && this.props.strokePosition !== 'center') count++;
            return count;
        },

        getTextResizeEnabledCount() {
            const resize = this.props.textAutoResize;
            if (resize && resize !== 'NONE') return 1;
            return 0;
        },

        // ═══════════════════════════════════════════════════════════════
        // OPACITY
        // ═══════════════════════════════════════════════════════════════
        handleOpacityChange(value) {
            const opacity = parseInt(value, 10) / 100; // eslint-disable-line no-magic-numbers
            this.$set(this.props, 'opacity', opacity);
            this.propChanged('opacity');
        },

        handleFillOpacityChange(value) {
            const opacity = parseInt(value, 10) / 100; // eslint-disable-line no-magic-numbers
            this.$set(this.props, 'fillOpacity', opacity);
            this.propChanged('fillOpacity');
        },

        // ═══════════════════════════════════════════════════════════════
        // CORNER RADIUS
        // ═══════════════════════════════════════════════════════════════
        parseNumber(str) {
            const match = String(str).match(/^(-?\d+)/);
            return match != null ? parseInt(match[1], 10) : 0;
        },

        initCornerRadius() {
            const radius = this.props.borderRadius;
            if (radius && typeof radius === 'object' && radius.topLeft !== undefined) {
                this.linkCorners = false;
                this.cornerTopLeftStr = `${radius.topLeft || 0}px`;
                this.cornerTopRightStr = `${radius.topRight || 0}px`;
                this.cornerBottomLeftStr = `${radius.bottomLeft || 0}px`;
                this.cornerBottomRightStr = `${radius.bottomRight || 0}px`;
            } else if (radius && typeof radius === 'object' && radius.size !== undefined) {
                this.radiusValue = radius.size || 0;
                this.borderRadiusStr = `${radius.size}${radius.unit || 'px'}`;
            } else if (radius) {
                this.radiusValue = this.parseNumber(radius);
                this.borderRadiusStr = typeof radius === 'string' ? radius : `${radius}px`;
            }
        },

        handleLinkCorners() {
            if (this.linkCorners) {
                this.radiusValue = this.parseNumber(this.cornerTopLeftStr);
                this.borderRadiusStr = `${this.radiusValue}px`;
                this.saveRadiusAll();
            }
        },

        handleRadiusSlider(value) {
            this.radiusValue = parseInt(value, 10);
            // Сохраняем единицу измерения из текущего значения
            const match = this.borderRadiusStr.match(/(px|%|rem)$/);
            const unit = match ? match[1] : 'px';
            this.borderRadiusStr = `${this.radiusValue}${unit}`;
            this.saveRadiusAll();
        },

        saveRadiusFromInput() {
            this.radiusValue = this.parseNumber(this.borderRadiusStr);
            this.saveRadiusAll();
        },

        saveRadiusAll() {
            const match = this.borderRadiusStr.match(/^(\d+)(px|%|rem)?$/);
            if (match != null) {
                const value = parseInt(match[1], 10);
                const unit = match[2] || 'px';
                this.$set(this.props, 'borderRadius', { size: value, unit });
                this.propChanged('borderRadius');
            }
        },

        saveCorners() {
            this.$set(this.props, 'borderRadius', {
                topLeft: this.parseNumber(this.cornerTopLeftStr),
                topRight: this.parseNumber(this.cornerTopRightStr),
                bottomLeft: this.parseNumber(this.cornerBottomLeftStr),
                bottomRight: this.parseNumber(this.cornerBottomRightStr),
                unit: 'px'
            });
            this.propChanged('borderRadius');
        },

        // ═══════════════════════════════════════════════════════════════
        // STROKE
        // ═══════════════════════════════════════════════════════════════
        initStrokeWidth() {
            const width = this.props.strokeWidth;
            if (width) {
                if (typeof width === 'object' && width.size !== undefined) {
                    this.strokeWidthValue = width.size || 0;
                    this.strokeWidthStr = `${width.size}${width.unit || 'px'}`;
                } else {
                    this.strokeWidthValue = typeof width === 'number' ? width : this.parseNumber(width);
                    this.strokeWidthStr = typeof width === 'string' ? width : `${width}px`;
                }
            }
        },

        handleStrokeWidthSlider(value) {
            this.strokeWidthValue = parseInt(value, 10);
            this.strokeWidthStr = `${this.strokeWidthValue}px`;
            this.$set(this.props, 'strokeWidth', this.strokeWidthValue);
            this.propChanged('strokeWidth');
        },

        saveStrokeWidth() {
            this.strokeWidthValue = this.parseNumber(this.strokeWidthStr);
            this.$set(this.props, 'strokeWidth', this.strokeWidthValue);
            this.propChanged('strokeWidth');
        },

        handleStrokeOpacityChange(value) {
            const opacity = parseInt(value, 10) / 100; // eslint-disable-line no-magic-numbers
            this.$set(this.props, 'strokeOpacity', opacity);
            this.propChanged('strokeOpacity');
        },

        applyStrokeStylePreset(preset) {
            // Apply all props from the preset
            Object.entries(preset.props).forEach(([key, val]) => {
                this.$set(this.props, key, val);
                this.propChanged(key);
            });
        },

        saveStrokeDasharray() {
            this.propChanged('strokeDasharray');
        }
    }
};
</script>

<style scoped>
.mt-2 {
    margin-top: 8px;
}

/* Slider Row */
.slider-row {
    display: flex;
    align-items: center;
    gap: 6px;
}

.slider-label {
    font-size: 13px;
    color: #6b7280;
    flex-shrink: 0;
    width: 90px;
}

.slider-input {
    flex: 1;
    min-width: 0;
    height: 4px;
    border-radius: 2px;
    background: linear-gradient(to right, #e5e7eb, var(--color-primary, #0085FF));
    appearance: none;
    cursor: pointer;
}

.slider-input--short {
    flex: 1 1 80px;
    max-width: 100px;
}

.slider-input--flex {
    flex: 1;
    min-width: 60px;
}

.slider-input::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #ffffff;
    border: 2px solid var(--color-primary, #0085FF);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    cursor: grab;
}

.slider-input::-webkit-slider-thumb:active {
    cursor: grabbing;
}

/* Slider with input field */
.slider-with-input {
    display: flex;
    align-items: center;
    gap: 12px;
}

.slider-label-inline {
    font-size: 13px;
    color: #6b7280;
    white-space: nowrap;
    flex-shrink: 0;
}

.input-units-compact {
    flex-shrink: 0;
    width: 90px;
}

.slider-value {
    font-size: 14px;
    font-weight: 600;
    color: #374151;
    width: 40px;
    flex-shrink: 0;
    text-align: right;
    white-space: nowrap;
}

/* Radius Header */
.radius-header {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    margin-bottom: 12px;
}

/* Corner Grid */
.corner-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
}

/* Color Row - inline layout */
.color-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 4px;
}

.color-label {
    font-size: 13px;
    color: #6b7280;
    min-width: 90px;
}

.color-picker-inline {
    flex: 1;
}

/* Скрываем английские имена пропсов */
.color-picker-inline ::v-deep .ui-input-cp__label,
.color-picker-inline ::v-deep .ui-input-cp__name,
.color-picker-inline ::v-deep [class*="label"],
.color-picker-inline ::v-deep [class*="name"] {
    display: none !important;
}

/* Скрываем label у ui-input-units в компактном режиме */
.input-units-compact ::v-deep .ui-input-units__label,
.input-units-compact ::v-deep [class*="label"]:not(input) {
    display: none !important;
}

/* ui-input-units - достаточная ширина для читаемости */
.input-units-compact {
    flex-shrink: 0;
    min-width: 110px;
}

.input-units-compact ::v-deep input {
    text-align: right;
    min-width: 55px;
}

/* Corner grid inputs */
.corner-input {
    min-width: 0;
}

.corner-input ::v-deep input {
    text-align: center;
}

/* Accordions wrapper */
.accordions-wrapper {
    display: flex;
    flex-direction: column;
    gap: 0 !important;
}

.accordions-wrapper ::v-deep .accordion-section {
    margin-bottom: 8px !important;
}

.accordions-wrapper ::v-deep .accordion-section:last-child {
    margin-bottom: 0 !important;
}

/* Hint text for explanations */
.hint-text {
    font-size: 11px;
    color: #9ca3af;
    line-height: 1.4;
}

/* Stroke Style Presets Row */
.presets-row {
    display: flex;
    gap: 6px;
    margin-bottom: 12px;
}

.preset-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 44px;
    height: 32px;
    padding: 0 8px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    background: #ffffff;
    color: #374151;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
}

.preset-btn:hover {
    background: #f3f4f6;
    border-color: #9ca3af;
}

.preset-btn.active {
    background: var(--color-primary, #0085FF);
    border-color: var(--color-primary, #0085FF);
    color: #fff;
}

.preset-icon {
    font-size: 13px;
    font-weight: 600;
    white-space: nowrap;
}

/* Advanced Stroke Section (collapsible) */
.advanced-stroke {
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    overflow: hidden;
}

.advanced-stroke__summary {
    padding: 8px 12px;
    font-size: 12px;
    color: #6b7280;
    cursor: pointer;
    background: #f9fafb;
    user-select: none;
    list-style: none;
}

.advanced-stroke__summary::-webkit-details-marker {
    display: none;
}

.advanced-stroke__summary::before {
    content: '▸';
    display: inline-block;
    margin-right: 6px;
    transition: transform 0.2s ease;
}

.advanced-stroke[open] .advanced-stroke__summary::before {
    transform: rotate(90deg);
}

.advanced-stroke__content {
    padding: 8px 12px 12px;
    border-top: 1px solid #e5e7eb;
}

/* Input Row for text inputs */
.input-row {
    display: flex;
    align-items: center;
    gap: 12px;
}

.input-label {
    font-size: 13px;
    color: #6b7280;
    flex-shrink: 0;
    width: 100px;
}

.text-input {
    flex: 1;
    height: 32px;
    padding: 0 10px;
    font-size: 13px;
    color: #374151;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    outline: none;
    transition: border-color 0.15s ease;
}

.text-input:focus {
    border-color: var(--color-primary, #0085FF);
}

.text-input::placeholder {
    color: #9ca3af;
}
</style>
