<template>
    <w-panel>
        <ui-container>
            <div class="accordions-wrapper">
            <!-- Выравнивание -->
            <accordion-section
                title="Выравнивание"
                icon="format-align-center"
                :collapsed="!expandedSections.alignment"
                :enabled-count="getAlignmentEnabledCount()"
                :total-count="2"
                @toggle="toggleSection('alignment')"
            >
                <!-- Text Alignment with proper icons -->
                <div class="form-label form-label-small">Горизонтальное</div>
                <div class="alignment-group">
                    <button
                        v-for="align in alignmentOptions"
                        :key="align.value"
                        class="alignment-btn"
                        :class="{ 'alignment-btn--active': props.textAlign === align.value }"
                        :title="align.label"
                        @click="setAlignment(align.value)"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path v-if="align.value === 'left'" d="M3 6h18M3 12h12M3 18h18" />
                            <path v-else-if="align.value === 'center'" d="M3 6h18M6 12h12M3 18h18" />
                            <path v-else-if="align.value === 'right'" d="M3 6h18M9 12h12M3 18h18" />
                            <path v-else d="M3 6h18M3 12h18M3 18h18" />
                        </svg>
                    </button>
                </div>

                <!-- Vertical Alignment -->
                <div class="form-label form-label-small mt-3">Вертикальное</div>
                <div class="alignment-group">
                    <button
                        v-for="align in verticalAlignOptions"
                        :key="align.value"
                        class="alignment-btn"
                        :class="{ 'alignment-btn--active': props.verticalAlign === align.value }"
                        :title="align.label"
                        @click="setVerticalAlign(align.value)"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <!-- Top align: content at top -->
                            <path v-if="align.value === 'top'" d="M4 4h16M8 8h8M8 12h8" />
                            <!-- Middle align: content centered -->
                            <path v-else-if="align.value === 'middle'" d="M8 8h8M4 12h16M8 16h8" />
                            <!-- Bottom align: content at bottom -->
                            <path v-else d="M8 12h8M8 16h8M4 20h16" />
                        </svg>
                    </button>
                </div>
            </accordion-section>

            <!-- Шрифт -->
            <accordion-section
                title="Шрифт"
                icon="format-font"
                :collapsed="!expandedSections.font"
                :enabled-count="getFontEnabledCount()"
                :total-count="5"
                @toggle="toggleSection('font')"
            >
                <ui-has-panel>
                    <div class="form-label form-label-small">Семейство шрифта</div>
                    <template #panel>
                        <ui-panel :groups="[{ name: 'Настройки шрифта', slot: 'default' }]">
                            <ui-container>
                                <div class="form-row">
                                    <label class="form-label">Семейство шрифта</label>
                                    <w-custom-select
                                        v-model="props.fontFamily"
                                        :options="fontFamilyOptions"
                                        :show-font-preview="true"
                                        placeholder="Выберите шрифт"
                                        @change="propChanged('fontFamily')"
                                    />
                                </div>

                                <ui-input-units
                                    col-size="6-12"
                                    min="8"
                                    max="120"
                                    :units="sizeUnits"
                                    v-model="fontSizeString"
                                    @change="saveFontSize"
                                >
                                    Размер шрифта
                                </ui-input-units>

                                <div class="form-row">
                                    <label class="form-label">Насыщенность</label>
                                    <div class="weight-slider">
                                        <input
                                            type="range"
                                            :value="fontWeightValue"
                                            min="100"
                                            max="900"
                                            step="100"
                                            class="weight-slider__input"
                                            @input="handleWeightChange($event.target.value)"
                                        />
                                        <div class="weight-slider__labels">
                                            <span>Тонкий</span>
                                            <span>Обычный</span>
                                            <span>Жирный</span>
                                            <span>Чёрный</span>
                                        </div>
                                        <div class="weight-slider__value">{{ fontWeightValue }}</div>
                                    </div>
                                </div>

                                <ui-input-units
                                    col-size="6-12"
                                    min="0.8"
                                    max="3"
                                    step="0.1"
                                    :units="['', 'em', 'px']"
                                    v-model="lineHeightString"
                                    @change="saveLineHeight"
                                >
                                    Высота строки
                                </ui-input-units>

                                <ui-input-units
                                    col-size="6-12"
                                    min="-5"
                                    max="20"
                                    step="0.5"
                                    :units="['px', 'em']"
                                    v-model="letterSpacingString"
                                    @change="saveLetterSpacing"
                                >
                                    Межбуквенный интервал
                                </ui-input-units>
                            </ui-container>
                        </ui-panel>
                    </template>
                </ui-has-panel>
            </accordion-section>

            <!-- Преобразование -->
            <accordion-section
                title="Преобразование"
                icon="format-letter-case"
                :collapsed="!expandedSections.transform"
                :enabled-count="getTransformEnabledCount()"
                :total-count="1"
                @toggle="toggleSection('transform')"
            >
                <div class="transform-group">
                    <button
                        v-for="transform in transformOptions"
                        :key="transform.value"
                        class="transform-btn"
                        :class="{ 'transform-btn--active': props.textTransform === transform.value }"
                        @click="setTransform(transform.value)"
                    >
                        {{ transform.label }}
                    </button>
                </div>
            </accordion-section>

            <!-- Оформление -->
            <accordion-section
                title="Оформление"
                icon="format-underline"
                :collapsed="!expandedSections.decoration"
                :enabled-count="getDecorationEnabledCount()"
                :total-count="2"
                @toggle="toggleSection('decoration')"
            >
                <div class="decoration-group">
                    <button
                        class="decoration-btn"
                        :class="{ 'decoration-btn--active': hasUnderline }"
                        title="Подчёркнутый"
                        aria-label="Подчёркнутый текст"
                        @click="toggleDecoration('underline')"
                    >
                        <span class="decoration-btn__icon decoration-btn__icon--underline">П</span>
                    </button>
                    <button
                        class="decoration-btn"
                        :class="{ 'decoration-btn--active': hasLineThrough }"
                        title="Зачёркнутый"
                        aria-label="Зачёркнутый текст"
                        @click="toggleDecoration('line-through')"
                    >
                        <span class="decoration-btn__icon decoration-btn__icon--strikethrough">З</span>
                    </button>
                </div>

                <!-- Truncation -->
                <div class="truncate-row mt-3">
                    <ui-select
                        v-model="truncateModeValue"
                        :options="truncateOptions"
                        label="Обрезка текста"
                        class="truncate-select-ui"
                    />
                    <input
                        v-if="truncateMode === 'lines'"
                        type="number"
                        class="truncate-lines-input"
                        :value="truncateLines"
                        min="1"
                        max="10"
                        @change="truncateLines = parseInt($event.target.value, 10); handleTruncateLinesChange()"
                    />
                </div>
            </accordion-section>
            </div>
        </ui-container>
    </w-panel>
</template>

<script>
import { Panel } from '@goodt-wcore/panel';
import AccordionSection from './components/AccordionSection.vue';
import WCustomSelect from './components/CustomSelect.vue';
import { fontFamilyOptions } from '../constants/fontFamilyOptions';

const SIZE_UNITS = ['px', 'rem', 'em', '%'];

export default {
    extends: Panel,

    components: {
        AccordionSection,
        WCustomSelect
    },

    meta: { name: 'Типографика', icon: 'format-text' },

    static: {
        sizeUnits: SIZE_UNITS
    },

    data() {
        return {
            expandedSections: {
                alignment: false,
                font: false,
                transform: false,
                decoration: false
            },
            fontFamilyOptions,
            alignmentOptions: [
                { value: 'left', label: 'По левому краю' },
                { value: 'center', label: 'По центру' },
                { value: 'right', label: 'По правому краю' },
                { value: 'justify', label: 'По ширине' }
            ],
            verticalAlignOptions: [
                { value: 'top', label: 'По верху' },
                { value: 'middle', label: 'По центру' },
                { value: 'bottom', label: 'По низу' }
            ],
            transformOptions: [
                { value: 'none', label: 'Aa' },
                { value: 'uppercase', label: 'AA' },
                { value: 'lowercase', label: 'aa' },
                { value: 'capitalize', label: 'Aa Aa' }
            ],
            truncateOptions: [
                { value: 'none', label: 'Без обрезки' },
                { value: 'single', label: 'Одна строка с многоточием' },
                { value: 'lines', label: 'Несколько строк' }
            ],
            truncateMode: 'none',
            truncateLines: 2 // eslint-disable-line no-magic-numbers
        };
    },

    computed: {
        fontSizeString: {
            get() {
                const size = this.props.fontSize || { size: 14, unit: 'px' }; // eslint-disable-line no-magic-numbers
                if (typeof size === 'object') {
                    return `${size.size}${size.unit}`;
                }
                return size;
            },
            set(val) {
                this.setSizeValue('fontSize', val);
            }
        },

        lineHeightString: {
            get() {
                const lh = this.props.lineHeight || { size: 1.5, unit: '' }; // eslint-disable-line no-magic-numbers
                if (typeof lh === 'object') {
                    return `${lh.size}${lh.unit}`;
                }
                return lh;
            },
            set(val) {
                this.setSizeValue('lineHeight', val);
            }
        },

        letterSpacingString: {
            get() {
                const ls = this.props.letterSpacing || { size: 0, unit: 'px' };
                if (typeof ls === 'object') {
                    return `${ls.size}${ls.unit}`;
                }
                return ls;
            },
            set(val) {
                this.setSizeValue('letterSpacing', val);
            }
        },

        fontWeightValue() {
            const weight = this.props.fontWeight;
            if (typeof weight === 'number') {
                return weight;
            }
            // Map named weights to numbers
            const weightMap = {
                light: 300, // eslint-disable-line no-magic-numbers
                normal: 400, // eslint-disable-line no-magic-numbers
                medium: 500, // eslint-disable-line no-magic-numbers
                semibold: 600, // eslint-disable-line no-magic-numbers
                bold: 700 // eslint-disable-line no-magic-numbers
            };
            return weightMap[weight] || 400; // eslint-disable-line no-magic-numbers
        },

        /**
         * Check if text has underline decoration
         */
        hasUnderline() {
            const decoration = this.props.textDecoration || '';
            return decoration.includes('underline');
        },

        /**
         * Check if text has line-through decoration
         */
        hasLineThrough() {
            const decoration = this.props.textDecoration || '';
            return decoration.includes('line-through');
        },

        /**
         * Computed v-model for truncate mode ui-select
         */
        truncateModeValue: {
            get() {
                return this.truncateMode;
            },
            set(val) {
                this.truncateMode = val;
                this.handleTruncateChange();
            }
        }
    },

    created() {
        // Initialize truncate mode from props
        if (this.props.truncate === true) {
            this.truncateMode = 'single';
        } else if (typeof this.props.truncate === 'number') {
            this.truncateMode = 'lines';
            this.truncateLines = this.props.truncate;
        }
    },

    methods: {
        toggleSection(section) {
            this.expandedSections[section] = !this.expandedSections[section];
        },

        // ═══════════════════════════════════════════════════════════════
        // ENABLED COUNTS FOR ACCORDION
        // ═══════════════════════════════════════════════════════════════
        getAlignmentEnabledCount() {
            let count = 0;
            if (this.props.textAlign && this.props.textAlign !== 'left') count++;
            if (this.props.verticalAlign && this.props.verticalAlign !== 'top') count++;
            return count;
        },

        getFontEnabledCount() {
            let count = 0;
            if (this.props.fontFamily) count++;
            if (this.props.fontSize) count++;
            if (this.props.fontWeight && this.props.fontWeight !== 400) count++; // eslint-disable-line no-magic-numbers
            if (this.props.lineHeight) count++;
            if (this.props.letterSpacing) count++;
            return count;
        },

        getTransformEnabledCount() {
            if (this.props.textTransform && this.props.textTransform !== 'none') return 1;
            return 0;
        },

        getDecorationEnabledCount() {
            let count = 0;
            if (this.hasUnderline) count++;
            if (this.hasLineThrough) count++;
            return count;
        },

        // ═══════════════════════════════════════════════════════════════
        // SIZE HELPERS
        // ═══════════════════════════════════════════════════════════════
        parseSizeString(val) {
            if (typeof val === 'string') {
                const match = val.match(/^(-?\d+(?:\.\d+)?)(px|rem|em|%)?$/);
                if (match != null) {
                    return { size: parseFloat(match[1]), unit: match[2] || '' };
                }
            }
            return null;
        },

        setSizeValue(propName, val) {
            if (typeof val === 'string') {
                const parsed = this.parseSizeString(val);
                if (parsed != null) {
                    this.$set(this.props, propName, parsed);
                }
            } else if (val != null && typeof val === 'object') {
                this.$set(this.props, propName, val);
            }
        },

        setAlignment(value) {
            this.$set(this.props, 'textAlign', value);
            this.propChanged('textAlign');
        },

        setVerticalAlign(value) {
            this.$set(this.props, 'verticalAlign', value);
            this.propChanged('verticalAlign');
        },

        setTransform(value) {
            this.$set(this.props, 'textTransform', value);
            this.propChanged('textTransform');
        },

        handleWeightChange(value) {
            this.$set(this.props, 'fontWeight', parseInt(value, 10));
            this.propChanged('fontWeight');
        },

        saveFontSize() {
            this.propChanged('fontSize');
        },

        saveLineHeight() {
            this.propChanged('lineHeight');
        },

        saveLetterSpacing() {
            this.propChanged('letterSpacing');
        },

        handleTruncateChange() {
            if (this.truncateMode === 'none') {
                this.$set(this.props, 'truncate', false);
            } else if (this.truncateMode === 'single') {
                this.$set(this.props, 'truncate', true);
            } else if (this.truncateMode === 'lines') {
                this.$set(this.props, 'truncate', this.truncateLines);
            }
            this.propChanged('truncate');
        },

        handleTruncateLinesChange() {
            this.$set(this.props, 'truncate', this.truncateLines);
            this.propChanged('truncate');
        },

        /**
         * Toggle text decoration (underline or line-through)
         * Supports combining both decorations
         */
        toggleDecoration(decoration) {
            const current = this.props.textDecoration || '';
            const decorations = current.split(' ').filter(d => d !== '');
            const index = decorations.indexOf(decoration);

            if (index === -1) {
                // Add decoration
                decorations.push(decoration);
            } else {
                // Remove decoration
                decorations.splice(index, 1);
            }

            const newValue = decorations.length > 0 ? decorations.join(' ') : 'none';
            this.$set(this.props, 'textDecoration', newValue);
            this.propChanged('textDecoration');
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

.form-label {
    display: block;
    font-size: 13px;
    font-weight: 500;
    color: #374151;
    margin-bottom: 6px;
}

.form-row {
    margin-bottom: 16px;
}

.mt-3 {
    margin-top: 16px;
}

/* Fix ui-has-panel alignment - pencil icon aligns with label */
::v-deep .ui-has-panel {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

::v-deep .ui-has-panel .form-label-small {
    margin-bottom: 0;
}

/* Alignment Group */
.alignment-group {
    display: flex;
    gap: 4px;
    padding: 4px;
    background: #f3f4f6;
    border-radius: 8px;
    margin-top: 8px;
}

.alignment-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
    border: none;
    background: transparent;
    border-radius: 6px;
    color: #6b7280;
    cursor: pointer;
    transition: all 0.15s ease;
}

.alignment-btn:hover {
    background: #e5e7eb;
    color: #374151;
}

.alignment-btn--active {
    background: #ffffff;
    color: #3b82f6;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Transform Group */
.transform-group {
    display: flex;
    gap: 4px;
}

.transform-btn {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid #e5e7eb;
    background: #ffffff;
    border-radius: 6px;
    font-size: 13px;
    color: #374151;
    cursor: pointer;
    transition: all 0.15s ease;
}

.transform-btn:hover {
    border-color: #93c5fd;
    background: #f0f9ff;
}

.transform-btn--active {
    border-color: #3b82f6;
    background: #eff6ff;
    color: #1d4ed8;
}

/* Weight Slider */
.weight-slider {
    position: relative;
}

.weight-slider__input {
    width: 100%;
    height: 6px;
    border-radius: 3px;
    background: linear-gradient(to right, #e5e7eb, #374151);
    appearance: none;
    cursor: pointer;
}

.weight-slider__input::-webkit-slider-thumb {
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #3b82f6;
    border: 2px solid #ffffff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    cursor: grab;
}

.weight-slider__labels {
    display: flex;
    justify-content: space-between;
    margin-top: 4px;
    font-size: 10px;
    color: #9ca3af;
}

.weight-slider__value {
    position: absolute;
    top: -24px;
    right: 0;
    font-size: 12px;
    font-weight: 600;
    color: #3b82f6;
}

/* Decoration Group */
.decoration-group {
    display: flex;
    gap: 4px;
}

.decoration-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 36px;
    border: 1px solid #e5e7eb;
    background: #ffffff;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.15s ease;
}

.decoration-btn:hover {
    border-color: #93c5fd;
    background: #f0f9ff;
}

.decoration-btn--active {
    border-color: #3b82f6;
    background: #eff6ff;
    color: #1d4ed8;
}

.decoration-btn__icon {
    font-size: 14px;
    font-weight: 600;
    color: #374151;
}

.decoration-btn--active .decoration-btn__icon {
    color: #1d4ed8;
}

.decoration-btn__icon--underline {
    text-decoration: underline;
}

.decoration-btn__icon--strikethrough {
    text-decoration: line-through;
}

/* Truncate Row */
.truncate-row {
    display: flex;
    gap: 8px;
    align-items: flex-end;
}

.truncate-select-ui {
    flex: 1;
}

.truncate-lines-input {
    width: 60px;
    height: 32px;
    padding: 0 8px;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    font-size: 13px;
    color: #374151;
    text-align: center;
    -moz-appearance: textfield;
}

.truncate-lines-input::-webkit-outer-spin-button,
.truncate-lines-input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

.truncate-lines-input:focus {
    outline: none;
    border-color: var(--color-primary, #0085FF);
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
