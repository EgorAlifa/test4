<template>
    <w-panel>
        <ui-container>
            <div class="accordions-wrapper">
            <!-- Дизайн-система -->
            <accordion-section
                title="Дизайн-система"
                icon="palette-swatch"
                :collapsed="!expandedSections.designSystem"
                :enabled-count="getDesignSystemEnabledCount()"
                :total-count="3"
                @toggle="toggleSection('designSystem')"
            >
                <!-- Design System Selector -->
                <div class="form-label form-label-small">Система</div>
                <div class="design-system-selector">
                    <button
                        v-for="system in designSystemOptions"
                        :key="system.value"
                        class="design-system-btn"
                        :class="{ 'design-system-btn--active': props.designSystem === system.value }"
                        :title="system.description"
                        @click="setDesignSystem(system.value)"
                    >
                        {{ system.label }}
                    </button>
                </div>

                <!-- Quick Font Presets (dynamic based on design system) -->
                <div class="form-label form-label-small mt-3">Стиль текста</div>
                <div class="font-presets">
                    <button
                        v-for="preset in activeTypePresets"
                        :key="preset.name"
                        class="font-preset"
                        :class="{ 'font-preset--active': isPresetActive(preset) }"
                        :title="preset.description"
                        @click="applyFontPreset(preset)"
                    >
                        <span class="font-preset__label" :style="preset.previewStyle">{{ preset.label }}</span>
                    </button>
                </div>

                <!-- Quick Color Presets (dynamic based on design system) -->
                <div class="form-label form-label-small mt-3">Цвет текста</div>
                <div class="color-presets">
                    <button
                        v-for="colorPreset in activeColorPresets"
                        :key="colorPreset.name"
                        type="button"
                        class="color-preset"
                        :class="{ 'color-preset--active': props.color === colorPreset.value }"
                        :style="{ backgroundColor: colorPreset.display }"
                        :title="colorPreset.name"
                        @click="applyColor(colorPreset.value)"
                    />
                    <button
                        type="button"
                        class="color-preset color-preset--custom"
                        :class="{ 'color-preset--active': isCustomColor }"
                        title="Свой цвет"
                        @click="showCustomColorPicker"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 8v8M8 12h8" />
                        </svg>
                    </button>
                </div>

                <!-- Custom Color Input (shown when custom is selected) -->
                <div v-if="isCustomColorPickerVisible" class="custom-color-row">
                    <input
                        type="color"
                        :value="customColorValue"
                        class="color-input"
                        @input="applyCustomColor($event.target.value)"
                    />
                    <input
                        type="text"
                        :value="props.color"
                        class="color-text-input"
                        placeholder="#FFFFFF или rgb(...)"
                        @change="applyColor($event.target.value)"
                    />
                </div>
            </accordion-section>

            <!-- Содержимое -->
            <accordion-section
                title="Содержимое"
                icon="text"
                :collapsed="!expandedSections.content"
                :enabled-count="getContentEnabledCount()"
                :total-count="2"
                @toggle="toggleSection('content')"
            >
                <!-- HTML Content -->
                <div class="form-label form-label-small">HTML-контент</div>
                <ui-textarea prop="html" />
                <div class="help-text">
                    Для inline-редактирования нажмите на текст на холсте
                </div>

                <!-- Mode Toggle -->
                <ui-switch v-model="wysiwygEnabled" class="mt-3">
                    Визуальный редактор
                </ui-switch>
            </accordion-section>
            </div>
        </ui-container>
    </w-panel>
</template>

<script>
import { Panel } from '@goodt-wcore/panel';
import AccordionSection from './components/AccordionSection.vue';
import { getTypePresetsForSystem, designSystemOptions } from '../constants/designSystemPresets';
import { getColorPresetsForSystem } from '../constants/colorPresets';

export default {
    extends: Panel,

    components: {
        AccordionSection
    },

    meta: { name: 'Основные', icon: 'text' },

    data() {
        return {
            expandedSections: {
                designSystem: false,
                content: false
            },
            designSystemOptions,
            isCustomColorPickerVisible: false
        };
    },

    computed: {
        /**
         * Get type presets for the currently selected design system
         */
        activeTypePresets() {
            return getTypePresetsForSystem(this.props.designSystem || 'insight');
        },

        /**
         * Get color presets for the currently selected design system
         */
        activeColorPresets() {
            return getColorPresetsForSystem(this.props.designSystem || 'insight');
        },

        /**
         * Check if the current color is a custom color (not in presets)
         */
        isCustomColor() {
            const color = this.props.color;
            if (color == null || color === '') {
                return false;
            }
            return !this.activeColorPresets.some(preset => preset.value === color);
        },

        /**
         * Get a valid hex color for the color picker
         * (color picker doesn't support CSS variables or rgba)
         */
        customColorValue() {
            const color = this.props.color;
            // If it's a hex color, return it
            if (color && color.startsWith('#')) {
                return color;
            }
            // Default to black
            return '#000000';
        },

        wysiwygEnabled: {
            get() {
                return !this.props.isPlainHTMLShown;
            },
            set(val) {
                this.props.isPlainHTMLShown = !val;
                this.propChanged('isPlainHTMLShown');
            }
        }
    },

    methods: {
        toggleSection(section) {
            this.expandedSections[section] = !this.expandedSections[section];
        },

        // ═══════════════════════════════════════════════════════════════
        // ENABLED COUNTS FOR ACCORDION
        // ═══════════════════════════════════════════════════════════════
        getDesignSystemEnabledCount() {
            let count = 0;
            if (this.props.designSystem && this.props.designSystem !== 'insight') count++;
            // Check if any font preset is active (fontSize, fontWeight changed from default)
            if (this.props.fontSize || this.props.fontWeight) count++;
            if (this.props.color) count++;
            return count;
        },

        getContentEnabledCount() {
            let count = 0;
            if (this.props.html) count++;
            if (this.props.isPlainHTMLShown) count++;
            return count;
        },

        /**
         * Set the design system and update presets
         */
        setDesignSystem(systemId) {
            this.props.designSystem = systemId;
            this.propChanged('designSystem');
        },

        /**
         * Apply a color preset
         */
        applyColor(colorValue) {
            this.props.color = colorValue;
            this.propChanged('color');
            this.isCustomColorPickerVisible = false;
        },

        /**
         * Apply a custom color from the color picker
         */
        applyCustomColor(colorValue) {
            this.props.color = colorValue;
            this.propChanged('color');
        },

        /**
         * Show the custom color picker
         */
        showCustomColorPicker() {
            this.isCustomColorPickerVisible = !this.isCustomColorPickerVisible;
        },

        /**
         * Apply font preset - sets all typography properties at once
         */
        applyFontPreset(preset) {
            Object.entries(preset.props).forEach(([key, value]) => {
                this.props[key] = value;
                this.propChanged(key);
            });
        },

        /**
         * Check if a preset is currently active
         * Compares all props in the preset with current values
         */
        isPresetActive(preset) {
            return Object.entries(preset.props).every(([key, value]) => {
                const currentVal = this.props[key];
                // Deep compare for objects (like fontSize: { size: 16, unit: 'px' })
                if (typeof value === 'object' && value !== null) {
                    if (typeof currentVal !== 'object' || currentVal === null) {
                        return false;
                    }
                    return Object.entries(value).every(([k, v]) => currentVal[k] === v);
                }
                return currentVal === value;
            });
        }
    }
};
</script>

<style scoped>
.form-label-small {
    font-size: 13px;
    font-weight: 600;
    color: #374151;
    margin-bottom: 8px;
}

.mt-3 {
    margin-top: 16px;
}

.help-text {
    margin-top: 4px;
    margin-bottom: 8px;
    font-size: 12px;
    color: #6b7280;
    line-height: 1.5;
}

/* Design System Selector */
.design-system-selector {
    display: flex;
    gap: 4px;
    padding: 4px;
    background: #f3f4f6;
    border-radius: 8px;
    margin-bottom: 8px;
}

.design-system-btn {
    flex: 1;
    padding: 8px 4px;
    border: none;
    background: transparent;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 500;
    color: #6b7280;
    cursor: pointer;
    transition: all 0.15s ease;
    white-space: nowrap;
}

.design-system-btn:hover {
    background: #e5e7eb;
    color: #374151;
}

.design-system-btn--active {
    background: #ffffff;
    color: #3b82f6;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Font Presets */
.font-presets {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-bottom: 8px;
}

.font-preset {
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    min-width: 40px;
    padding: 10px 12px !important;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    background: #ffffff;
    cursor: pointer;
    transition: all 0.15s ease;
    overflow: visible !important;
    line-height: normal !important;
    height: auto !important;
}

.font-preset:hover {
    border-color: #93c5fd;
    background: #f0f9ff;
}

.font-preset--active {
    border-color: #3b82f6;
    background: #eff6ff;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.font-preset__label {
    color: #374151;
    white-space: nowrap;
    overflow: visible !important;
    line-height: 1.2 !important;
    display: inline-block !important;
}

.font-preset--active .font-preset__label {
    color: #1d4ed8;
}

/* Color Presets */
.color-presets {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-bottom: 8px;
}

.color-preset {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    border: 2px solid transparent;
    cursor: pointer;
    transition: all 0.15s ease;
    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.1);
}

.color-preset:hover {
    transform: scale(1.15);
}

.color-preset--active {
    border-color: #374151;
    box-shadow: 0 0 0 2px #ffffff, 0 0 0 4px #3b82f6;
}

.color-preset--custom {
    background: linear-gradient(135deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ffffff;
}

.color-preset--custom svg {
    filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.3));
}

/* Custom Color Row */
.custom-color-row {
    display: flex;
    gap: 8px;
    margin-bottom: 8px;
    align-items: center;
}

.color-input {
    width: 36px;
    height: 28px;
    padding: 0;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    cursor: pointer;
}

.color-input::-webkit-color-swatch-wrapper {
    padding: 2px;
}

.color-input::-webkit-color-swatch {
    border: none;
    border-radius: 2px;
}

.color-text-input {
    flex: 1;
    height: 28px;
    padding: 0 8px;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    font-size: 12px;
    font-family: monospace;
}

.color-text-input:focus {
    outline: none;
    border-color: #3b82f6;
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
