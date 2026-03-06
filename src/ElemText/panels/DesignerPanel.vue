<template>
    <w-panel>
        <ui-container>
            <div class="designer-header">
                <span class="designer-icon">🎨</span>
                <span class="designer-title">Я дизайнер</span>
            </div>
            <div class="designer-description">
                Расширенные настройки стилей для точной кастомизации виджета
            </div>

            <div class="accordions-wrapper">
            <!-- Colors Section -->
            <ui-accordion-section
                title="Цвета"
                icon="palette"
                :collapsed="!expandedSections.colors"
                :enabled-count="getColorsEnabledCount()"
                :total-count="4"
                @toggle="toggleSection('colors')"
            >
                <ui-input-cp prop="color">Цвет текста</ui-input-cp>
                <ui-input-cp prop="backgroundColor">Фон</ui-input-cp>
                <ui-input-cp prop="linkColor">Цвет ссылок</ui-input-cp>
                <ui-input-cp prop="linkHoverColor">Цвет ссылок при наведении</ui-input-cp>
            </ui-accordion-section>

            <!-- Spacing Section -->
            <ui-accordion-section
                title="Отступы"
                icon="arrow-expand-all"
                :collapsed="!expandedSections.spacing"
                :enabled-count="getSpacingEnabledCount()"
                :total-count="4"
                @toggle="toggleSection('spacing')"
            >
                <div class="spacing-control">
                    <div class="spacing-label">Внутренние отступы (padding)</div>
                    <div class="spacing-inputs">
                        <div class="spacing-input-group">
                            <label>Верх</label>
                            <ui-input-units
                                col-size="12"
                                min="0"
                                max="100"
                                :units="['px', 'rem', 'em', '%']"
                                v-model="paddingTop"
                                @change="savePadding"
                            />
                        </div>
                        <div class="spacing-input-group">
                            <label>Справа</label>
                            <ui-input-units
                                col-size="12"
                                min="0"
                                max="100"
                                :units="['px', 'rem', 'em', '%']"
                                v-model="paddingRight"
                                @change="savePadding"
                            />
                        </div>
                        <div class="spacing-input-group">
                            <label>Низ</label>
                            <ui-input-units
                                col-size="12"
                                min="0"
                                max="100"
                                :units="['px', 'rem', 'em', '%']"
                                v-model="paddingBottom"
                                @change="savePadding"
                            />
                        </div>
                        <div class="spacing-input-group">
                            <label>Слева</label>
                            <ui-input-units
                                col-size="12"
                                min="0"
                                max="100"
                                :units="['px', 'rem', 'em', '%']"
                                v-model="paddingLeft"
                                @change="savePadding"
                            />
                        </div>
                    </div>
                    <ui-checkbox v-model="isLinkPaddingLinked" @change="handleLinkPadding">
                        Связать все стороны
                    </ui-checkbox>
                </div>
            </ui-accordion-section>

            <!-- Border Section -->
            <ui-accordion-section
                title="Рамка"
                icon="border-all"
                :collapsed="!expandedSections.border"
                :enabled-count="getBorderEnabledCount()"
                :total-count="4"
                @toggle="toggleSection('border')"
            >
                <ui-input-cp prop="borderColor">Цвет рамки</ui-input-cp>
                <ui-input-units
                    col-size="6-12"
                    min="0"
                    max="20"
                    :units="['px']"
                    v-model="borderWidthString"
                    @change="saveBorderWidth"
                >
                    Толщина рамки
                </ui-input-units>
                <ui-select
                    v-model="borderStyleValue"
                    :options="borderStyleOptions"
                    label="Стиль рамки"
                />
                <ui-input-units
                    col-size="6-12"
                    min="0"
                    max="50"
                    :units="['px', '%']"
                    v-model="borderRadiusString"
                    @change="saveBorderRadius"
                >
                    Скругление углов
                </ui-input-units>
            </ui-accordion-section>

            <!-- Effects Section -->
            <ui-accordion-section
                title="Эффекты"
                icon="blur"
                :collapsed="!expandedSections.effects"
                :enabled-count="getEffectsEnabledCount()"
                :total-count="3"
                @toggle="toggleSection('effects')"
            >
                <ui-select
                    v-model="shadowPreset"
                    :options="shadowOptions"
                    label="Тень"
                    @change="applyShadow"
                />

                <div class="form-row">
                    <label class="form-label">Прозрачность</label>
                    <div class="opacity-slider">
                        <input
                            type="range"
                            :value="opacityValue"
                            min="0"
                            max="100"
                            class="opacity-slider__input"
                            @input="handleOpacityChange($event.target.value)"
                        />
                        <span class="opacity-slider__value">{{ opacityValue }}%</span>
                    </div>
                </div>

                <ui-select
                    v-model="textShadowValue"
                    :options="textShadowOptions"
                    label="Тень текста"
                />
            </ui-accordion-section>
            </div>

            <!-- Reset Button -->
            <div class="reset-section">
                <ui-button type="default" size="small" @click="resetStyles">
                    <span class="reset-icon">↺</span>
                    Сбросить все стили
                </ui-button>
            </div>
        </ui-container>
    </w-panel>
</template>

<script>
import { Panel } from '@goodt-wcore/panel';
import AccordionSection from './components/AccordionSection.vue';

export default {
    extends: Panel,

    components: {
        UiAccordionSection: AccordionSection
    },

    meta: { name: 'Я дизайнер', icon: 'palette' },

    data() {
        return {
            expandedSections: {
                colors: false,
                spacing: false,
                border: false,
                effects: false
            },
            isLinkPaddingLinked: true,
            paddingTop: '0px',
            paddingRight: '0px',
            paddingBottom: '0px',
            paddingLeft: '0px',
            shadowPreset: 'none',
            borderStyleOptions: [
                { value: 'none', label: 'Без рамки' },
                { value: 'solid', label: '─── Сплошная' },
                { value: 'dashed', label: '- - - Пунктир' },
                { value: 'dotted', label: '··· Точечная' },
                { value: 'double', label: '═══ Двойная' }
            ],
            shadowOptions: [
                { value: 'none', label: 'Без тени' },
                { value: 'small', label: 'Маленькая' },
                { value: 'medium', label: 'Средняя' },
                { value: 'large', label: 'Большая' },
                { value: 'xLarge', label: 'Очень большая' }
            ],
            textShadowOptions: [
                { value: 'none', label: 'Без тени' },
                { value: '0 1px 2px rgba(0,0,0,0.1)', label: 'Лёгкая' },
                { value: '0 2px 4px rgba(0,0,0,0.15)', label: 'Средняя' },
                { value: '0 4px 8px rgba(0,0,0,0.2)', label: 'Сильная' }
            ]
        };
    },

    computed: {
        borderWidthString: {
            get() {
                return this.getSizeString('borderWidth', 0);
            },
            set(val) {
                this.setSizeValue('borderWidth', val);
            }
        },

        borderRadiusString: {
            get() {
                return this.getSizeString('borderRadius', 0);
            },
            set(val) {
                this.setSizeValue('borderRadius', val);
            }
        },

        opacityValue() {
            const { opacity } = this.props;
            if (opacity == null || opacity === '') { return 100; } // eslint-disable-line no-magic-numbers
            return Math.round(parseFloat(opacity) * 100); // eslint-disable-line no-magic-numbers
        },

        borderStyleValue: {
            get() {
                return this.props.borderStyle || 'none';
            },
            set(val) {
                this.$set(this.props, 'borderStyle', val);
                this.propChanged('borderStyle');
            }
        },

        textShadowValue: {
            get() {
                return this.props.textShadow || 'none';
            },
            set(val) {
                this.$set(this.props, 'textShadow', val);
                this.propChanged('textShadow');
            }
        }
    },

    created() {
        this.initPaddingValues();
    },

    methods: {
        toggleSection(section) {
            this.expandedSections[section] = !this.expandedSections[section];
        },

        // ═══════════════════════════════════════════════════════════════
        // ENABLED COUNTS FOR ACCORDION
        // ═══════════════════════════════════════════════════════════════
        getColorsEnabledCount() {
            let count = 0;
            if (this.props.color != null) { count++; }
            if (this.props.backgroundColor != null) { count++; }
            if (this.props.linkColor != null) { count++; }
            if (this.props.linkHoverColor != null) { count++; }
            return count;
        },

        getSpacingEnabledCount() {
            const { padding } = this.props;
            if (padding == null || padding === '0px 0px 0px 0px') { return 0; }
            // Count non-zero values
            const parts = String(padding).split(' ').filter(part => part !== '' && part !== '0px' && part !== '0');
            return parts.length > 0 ? 4 : 0; // eslint-disable-line no-magic-numbers
        },

        getBorderEnabledCount() {
            let count = 0;
            if (this.props.borderColor != null) { count++; }
            if (this.props.borderWidth != null && this.parseNumber(this.getSizeString('borderWidth', 0)) > 0) { count++; }
            if (this.props.borderStyle != null && this.props.borderStyle !== 'none') { count++; }
            if (this.props.borderRadius != null && this.parseNumber(this.getSizeString('borderRadius', 0)) > 0) { count++; }
            return count;
        },

        getEffectsEnabledCount() {
            let count = 0;
            if (this.props.boxShadow != null && this.props.boxShadow !== 'none') { count++; }
            if (this.props.opacity != null && this.props.opacity !== '' && parseFloat(this.props.opacity) < 1) { count++; }
            if (this.props.textShadow != null && this.props.textShadow !== 'none') { count++; }
            return count;
        },

        parseNumber(str) {
            const match = String(str).match(/^(-?\d+)/);
            return match != null ? parseInt(match[1], 10) : 0;
        },

        // ═══════════════════════════════════════════════════════════════
        // SIZE HELPERS
        // ═══════════════════════════════════════════════════════════════
        getSizeString(propName, defaultSize) {
            const val = this.props[propName];
            if (val == null || val === '') { return `${defaultSize}px`; }
            if (typeof val === 'object' && val.size !== undefined) {
                return `${val.size}${val.unit || 'px'}`;
            }
            return String(val);
        },

        setSizeValue(propName, val) {
            if (typeof val === 'string') {
                const match = val.match(/^(-?\d+(?:\.\d+)?)(px|rem|em|%)?$/);
                if (match != null) {
                    this.$set(this.props, propName, { size: parseFloat(match[1]), unit: match[2] || 'px' });
                }
            }
        },

        initPaddingValues() {
            const { padding } = this.props;
            if (padding != null && padding !== '') {
                // Parse padding shorthand
                const parts = String(padding).split(' ');
                if (parts.length === 1) {
                    const [singleVal] = parts;
                    this.paddingTop = singleVal;
                    this.paddingRight = singleVal;
                    this.paddingBottom = singleVal;
                    this.paddingLeft = singleVal;
                } else if (parts.length === 4) { // eslint-disable-line no-magic-numbers
                    [this.paddingTop, this.paddingRight, this.paddingBottom, this.paddingLeft] = parts;
                }
            }
        },

        handleLinkPadding() {
            if (this.isLinkPaddingLinked) {
                this.paddingRight = this.paddingTop;
                this.paddingBottom = this.paddingTop;
                this.paddingLeft = this.paddingTop;
                this.savePadding();
            }
        },

        savePadding() {
            if (this.isLinkPaddingLinked) {
                this.paddingRight = this.paddingTop;
                this.paddingBottom = this.paddingTop;
                this.paddingLeft = this.paddingTop;
            }
            const padding = `${this.paddingTop} ${this.paddingRight} ${this.paddingBottom} ${this.paddingLeft}`;
            this.$set(this.props, 'padding', padding);
            this.propChanged('padding');
        },

        saveBorderWidth() {
            this.propChanged('borderWidth');
        },

        saveBorderRadius() {
            this.propChanged('borderRadius');
        },

        applyShadow() {
            const shadowMap = {
                none: 'none',
                small: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                medium: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                large: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                xLarge: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            };
            this.$set(this.props, 'boxShadow', shadowMap[this.shadowPreset]);
            this.propChanged('boxShadow');
        },

        handleOpacityChange(value) {
            const opacity = parseInt(value, 10) / 100; // eslint-disable-line no-magic-numbers
            this.$set(this.props, 'opacity', opacity);
            this.propChanged('opacity');
        },

        resetStyles() {
            const resetProps = [
                'color', 'backgroundColor', 'linkColor', 'linkHoverColor',
                'padding', 'borderColor', 'borderWidth', 'borderStyle', 'borderRadius',
                'boxShadow', 'opacity', 'textShadow'
            ];

            resetProps.forEach(propName => {
                this.$set(this.props, propName, '');
                this.propChanged(propName);
            });

            // Reset local state
            this.paddingTop = '0px';
            this.paddingRight = '0px';
            this.paddingBottom = '0px';
            this.paddingLeft = '0px';
            this.shadowPreset = 'none';
        },

        // setBorderStyle and setTextShadow handled via computed setters
    }
};
</script>

<style scoped>
.designer-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
}

.designer-icon {
    font-size: 20px;
}

.designer-title {
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
}

.designer-description {
    font-size: 13px;
    color: #6b7280;
    margin-bottom: 16px;
    line-height: 1.5;
}

/* Spacing Control */
.spacing-control {
    margin-bottom: 8px;
}

.spacing-label {
    font-size: 13px;
    font-weight: 500;
    color: #374151;
    margin-bottom: 12px;
}

.spacing-inputs {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-bottom: 12px;
}

.spacing-input-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.spacing-input-group label {
    font-size: 11px;
    color: #6b7280;
    text-transform: uppercase;
}

/* Form Elements */
.form-row {
    margin-bottom: 12px;
}

.form-label {
    display: block;
    font-size: 13px;
    font-weight: 500;
    color: #374151;
    margin-bottom: 6px;
}

/* Opacity Slider */
.opacity-slider {
    display: flex;
    align-items: center;
    gap: 6px;
}

.opacity-slider__input {
    flex: 1;
    min-width: 0;
    height: 6px;
    border-radius: 3px;
    background: linear-gradient(to right, transparent, #374151);
    appearance: none;
    cursor: pointer;
}

.opacity-slider__input::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #3b82f6;
    border: 2px solid #ffffff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    cursor: grab;
}

.opacity-slider__value {
    font-size: 13px;
    font-weight: 600;
    color: #374151;
    width: 40px;
    flex-shrink: 0;
    text-align: right;
    white-space: nowrap;
}

/* Reset Section */
.reset-section {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #e5e7eb;
}

.reset-icon {
    margin-right: 6px;
}
/* Accordions wrapper - removes any inherited gaps */
.accordions-wrapper {
    display: flex;
    flex-direction: column;
    gap: 0 !important;
}

.accordions-wrapper > * {
    margin-top: 0 !important;
}

.accordions-wrapper ::v-deep .accordion-section {
    margin-bottom: 8px !important;
}

.accordions-wrapper ::v-deep .accordion-section:last-child {
    margin-bottom: 0 !important;
}
</style>
