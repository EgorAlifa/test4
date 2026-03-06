<template>
    <w-panel>
        <ui-container>
            <div class="accordions-wrapper">
            <!-- Тень -->
            <ui-accordion-section
                title="Тень"
                icon="box-shadow"
                :collapsed="!expandedSections.shadow"
                :enabled-count="getShadowEnabledCount()"
                :total-count="7"
                @toggle="toggleSection('shadow')"
            >
                <div class="effect-toggle">
                    <ui-checkbox v-model="isShadowEnabled" @change="toggleShadow">
                        Включить тень
                    </ui-checkbox>
                </div>

                <div v-if="isShadowEnabled" class="effect-settings">
                    <div class="shadow-params">
                        <div class="param-row-inline">
                            <span class="param-label">Смещение X</span>
                            <input
                                type="number"
                                :value="parseNumber(shadowX)"
                                min="-50"
                                max="50"
                                class="param-input"
                                @input="shadowX = $event.target.value + 'px'; saveShadow()"
                            />
                            <span class="param-unit">px</span>
                        </div>
                        <div class="param-row-inline">
                            <span class="param-label">Смещение Y</span>
                            <input
                                type="number"
                                :value="parseNumber(shadowY)"
                                min="-50"
                                max="50"
                                class="param-input"
                                @input="shadowY = $event.target.value + 'px'; saveShadow()"
                            />
                            <span class="param-unit">px</span>
                        </div>
                        <div class="param-row-inline">
                            <span class="param-label">Размытие</span>
                            <input
                                type="number"
                                :value="parseNumber(shadowBlur)"
                                min="0"
                                max="100"
                                class="param-input"
                                @input="shadowBlur = $event.target.value + 'px'; saveShadow()"
                            />
                            <span class="param-unit">px</span>
                        </div>
                        <div class="param-row-inline">
                            <span class="param-label">Расширение</span>
                            <input
                                type="number"
                                :value="parseNumber(shadowSpread)"
                                min="-20"
                                max="50"
                                class="param-input"
                                @input="shadowSpread = $event.target.value + 'px'; saveShadow()"
                            />
                            <span class="param-unit">px</span>
                        </div>
                    </div>

                    <div class="color-row">
                        <span class="color-label">Цвет</span>
                        <ui-input-cp prop="shadowColor" @change="saveShadow" class="color-picker-inline" />
                    </div>

                    <div class="slider-row">
                        <span class="slider-label">Прозрачность</span>
                        <input
                            type="range"
                            :value="shadowOpacityPercent"
                            min="0"
                            max="100"
                            class="slider-input slider-input--short"
                            @input="handleShadowOpacityChange($event.target.value)"
                        />
                        <span class="slider-value">{{ shadowOpacityPercent }}%</span>
                    </div>

                    <ui-checkbox v-model="isShadowInset" @change="saveShadow" class="mt-2">
                        Внутренняя тень
                    </ui-checkbox>
                </div>
            </ui-accordion-section>

            <!-- Размытие слоя -->
            <ui-accordion-section
                title="Размытие слоя"
                icon="blur"
                :collapsed="!expandedSections.layerBlur"
                :enabled-count="getLayerBlurEnabledCount()"
                :total-count="1"
                @toggle="toggleSection('layerBlur')"
            >
                <div class="effect-toggle">
                    <ui-checkbox v-model="isLayerBlurEnabled" @change="toggleLayerBlur">
                        Включить размытие
                    </ui-checkbox>
                </div>
                <div v-if="isLayerBlurEnabled" class="effect-settings">
                    <div class="slider-row">
                        <span class="slider-label">Радиус</span>
                        <input
                            type="range"
                            :value="layerBlurAmount"
                            min="0"
                            max="50"
                            class="slider-input slider-input--short"
                            @input="handleLayerBlurChange($event.target.value)"
                        />
                        <span class="slider-value">{{ layerBlurAmount }}px</span>
                    </div>
                </div>
            </ui-accordion-section>

            <!-- Размытие фона -->
            <ui-accordion-section
                title="Размытие фона"
                icon="blur-radial"
                :collapsed="!expandedSections.backdropBlur"
                :enabled-count="getBackdropBlurEnabledCount()"
                :total-count="1"
                @toggle="toggleSection('backdropBlur')"
            >
                <div class="effect-toggle">
                    <ui-checkbox v-model="isBackdropBlurEnabled" @change="toggleBackdropBlur">
                        Включить размытие фона
                    </ui-checkbox>
                </div>
                <div v-if="isBackdropBlurEnabled" class="effect-settings">
                    <div class="slider-row">
                        <span class="slider-label">Радиус</span>
                        <input
                            type="range"
                            :value="backdropBlurAmount"
                            min="0"
                            max="50"
                            class="slider-input slider-input--short"
                            @input="handleBackdropBlurChange($event.target.value)"
                        />
                        <span class="slider-value">{{ backdropBlurAmount }}px</span>
                    </div>
                    <div class="help-text">
                        Эффект стекла. Работает при полупрозрачном фоне.
                    </div>
                </div>
            </ui-accordion-section>
            </div>
        </ui-container>
    </w-panel>
</template>

<script>
import { Panel } from '@goodt-wcore/panel';
import UiAccordionSection from './components/AccordionSection.vue';

export default {
    extends: Panel,

    components: {
        UiAccordionSection
    },

    meta: { name: 'Эффекты', icon: 'blur' },

    data() {
        return {
            expandedSections: {
                shadow: false,
                layerBlur: false,
                backdropBlur: false
            },
            isShadowEnabled: false,
            shadowX: '0px',
            shadowY: '4px',
            shadowBlur: '8px',
            shadowSpread: '0px',
            shadowOpacity: 0.25, // eslint-disable-line no-magic-numbers
            isShadowInset: false,
            isLayerBlurEnabled: false,
            layerBlurAmount: 8, // eslint-disable-line no-magic-numbers
            isBackdropBlurEnabled: false,
            backdropBlurAmount: 12 // eslint-disable-line no-magic-numbers
        };
    },

    computed: {
        shadowOpacityPercent() {
            return Math.round(this.shadowOpacity * 100); // eslint-disable-line no-magic-numbers
        },

        effects() {
            return this.props.effects || [];
        }
    },

    created() {
        this.initFromProps();
    },

    methods: {
        toggleSection(section) {
            this.expandedSections[section] = !this.expandedSections[section];
        },

        // ═══════════════════════════════════════════════════════════════
        // ENABLED COUNTS FOR ACCORDION
        // ═══════════════════════════════════════════════════════════════
        getShadowEnabledCount() {
            if (!this.isShadowEnabled) { return 0; }
            let count = 0;
            if (this.parseNumber(this.shadowX) !== 0) { count++; }
            if (this.parseNumber(this.shadowY) !== 0) { count++; }
            if (this.parseNumber(this.shadowBlur) !== 0) { count++; }
            if (this.parseNumber(this.shadowSpread) !== 0) { count++; }
            if (this.props.shadowColor) { count++; }
            if (this.shadowOpacity < 1) { count++; }
            if (this.isShadowInset) { count++; }
            return count;
        },

        getLayerBlurEnabledCount() {
            return this.isLayerBlurEnabled ? 1 : 0;
        },

        getBackdropBlurEnabledCount() {
            return this.isBackdropBlurEnabled ? 1 : 0;
        },

        // ═══════════════════════════════════════════════════════════════
        // INIT
        // ═══════════════════════════════════════════════════════════════
        initFromProps() {
            // Initialize shadow from effects array
            const dropShadow = this.effects.find(e => e.type === 'drop-shadow');
            const innerShadow = this.effects.find(e => e.type === 'inner-shadow');
            const shadow = dropShadow || innerShadow;

            if (shadow && shadow.enabled !== false) {
                this.isShadowEnabled = true;
                this.shadowX = `${shadow.x || 0}px`;
                this.shadowY = `${shadow.y || 4}px`; // eslint-disable-line no-magic-numbers
                this.shadowBlur = `${shadow.blur || 8}px`; // eslint-disable-line no-magic-numbers
                this.shadowSpread = `${shadow.spread || 0}px`;
                this.shadowOpacity = shadow.opacity || 0.25; // eslint-disable-line no-magic-numbers
                this.isShadowInset = shadow.type === 'inner-shadow';

                // Set shadow color prop for ui-input-cp
                if (shadow.color) {
                    this.$set(this.props, 'shadowColor', shadow.color);
                }
            }

            // Initialize blur effects
            const layerBlur = this.effects.find(e => e.type === 'layer-blur');
            if (layerBlur && layerBlur.enabled !== false) {
                this.isLayerBlurEnabled = true;
                this.layerBlurAmount = layerBlur.amount || 8; // eslint-disable-line no-magic-numbers
            }

            const backdropBlur = this.effects.find(e => e.type === 'background-blur');
            if (backdropBlur && backdropBlur.enabled !== false) {
                this.isBackdropBlurEnabled = true;
                this.backdropBlurAmount = backdropBlur.amount || 12; // eslint-disable-line no-magic-numbers
            }
        },

        parseNumber(str) {
            const match = str.match(/^(-?\d+)/);
            return match != null ? parseInt(match[1], 10) : 0;
        },

        // ═══════════════════════════════════════════════════════════════
        // SHADOW
        // ═══════════════════════════════════════════════════════════════
        toggleShadow() {
            this.saveShadow();
        },

        handleShadowOpacityChange(value) {
            this.shadowOpacity = parseInt(value, 10) / 100; // eslint-disable-line no-magic-numbers
            this.saveShadow();
        },

        saveShadow() {
            // Remove existing shadow effects
            const newEffects = this.effects.filter(e => e.type !== 'drop-shadow' && e.type !== 'inner-shadow');

            if (this.isShadowEnabled) {
                const shadowEffect = {
                    type: this.isShadowInset ? 'inner-shadow' : 'drop-shadow',
                    enabled: true,
                    x: this.parseNumber(this.shadowX),
                    y: this.parseNumber(this.shadowY),
                    blur: this.parseNumber(this.shadowBlur),
                    spread: this.parseNumber(this.shadowSpread),
                    color: this.props.shadowColor || '#000000',
                    opacity: this.shadowOpacity
                };
                newEffects.push(shadowEffect);
            }

            this.$set(this.props, 'effects', newEffects);
            this.propChanged('effects');
        },

        // ═══════════════════════════════════════════════════════════════
        // LAYER BLUR
        // ═══════════════════════════════════════════════════════════════
        toggleLayerBlur() {
            this.saveLayerBlur();
        },

        handleLayerBlurChange(value) {
            this.layerBlurAmount = parseInt(value, 10);
            this.saveLayerBlur();
        },

        saveLayerBlur() {
            const newEffects = this.effects.filter(e => e.type !== 'layer-blur');

            if (this.isLayerBlurEnabled) {
                newEffects.push({
                    type: 'layer-blur',
                    enabled: true,
                    amount: this.layerBlurAmount
                });
            }

            this.$set(this.props, 'effects', newEffects);
            this.propChanged('effects');
        },

        // ═══════════════════════════════════════════════════════════════
        // BACKDROP BLUR
        // ═══════════════════════════════════════════════════════════════
        toggleBackdropBlur() {
            this.saveBackdropBlur();
        },

        handleBackdropBlurChange(value) {
            this.backdropBlurAmount = parseInt(value, 10);
            this.saveBackdropBlur();
        },

        saveBackdropBlur() {
            const newEffects = this.effects.filter(e => e.type !== 'background-blur');

            if (this.isBackdropBlurEnabled) {
                newEffects.push({
                    type: 'background-blur',
                    enabled: true,
                    amount: this.backdropBlurAmount
                });
            }

            this.$set(this.props, 'effects', newEffects);
            this.propChanged('effects');
        }
    }
};
</script>

<style scoped>
.mt-2 {
    margin-top: 8px;
}

/* Effect Toggle - checkbox at top of section */
.effect-toggle {
    margin-bottom: 8px;
}

.effect-toggle ::v-deep .ui-checkbox {
    font-weight: 500;
    font-size: 13px;
    color: #374151;
}

/* Effect Settings (shown when enabled) */
.effect-settings {
    margin-top: 12px;
    padding: 12px;
    background: #f9fafb;
    border-radius: 8px;
}

/* Shadow Parameters - vertical list layout */
.shadow-params {
    margin-bottom: 12px;
}

.param-row-inline {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
}

.param-label {
    font-size: 13px;
    color: #6b7280;
    min-width: 80px;
}

.param-input {
    width: 70px;
    height: 32px;
    padding: 0 8px;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    color: #374151;
    text-align: right;
    background: #fff;
    -moz-appearance: textfield;
}

.param-input::-webkit-outer-spin-button,
.param-input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

.param-input:focus {
    outline: none;
    border-color: var(--color-primary, #0085FF);
}

.param-unit {
    font-size: 12px;
    color: #9ca3af;
    min-width: 20px;
}

/* Color Row - inline layout */
.color-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 8px;
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

/* Slider Row */
.slider-row {
    display: flex;
    align-items: center;
    gap: 6px;
}

.slider-label {
    font-size: 13px;
    color: #6b7280;
    width: 90px;
    flex-shrink: 0;
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

.slider-value {
    font-size: 14px;
    font-weight: 600;
    color: #374151;
    width: 40px;
    flex-shrink: 0;
    text-align: right;
    white-space: nowrap;
}

/* Help Text */
.help-text {
    margin-top: 8px;
    font-size: 12px;
    color: #9ca3af;
    line-height: 1.4;
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
</style>
