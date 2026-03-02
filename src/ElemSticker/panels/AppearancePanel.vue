<template>
    <w-panel>
        <div class="elemsticker-appearance-panel">
            <!-- Tape Style -->
            <div v-if="props.showTape" class="panel-section">
                <div class="panel-section__header">
                    <span class="panel-section__title">Стиль скотча</span>
                </div>

                <div class="tape-style-selector">
                    <button
                        v-for="style in tapeStyleOptions"
                        :key="style.value"
                        class="tape-style-btn"
                        :class="{ 'is-active': props.tapeStyle === style.value }"
                        @click="handleTapeStyleChange(style.value)"
                    >
                        <div class="tape-preview" :class="`tape-preview--${style.value}`" />
                        <span>{{ style.label }}</span>
                    </button>
                </div>

                <div class="panel-row panel-row--inline">
                    <span class="panel-label">Цвет скотча</span>
                    <ui-input-cp
                        :value="props.tapeColor"
                        placeholder="Из темы"
                        @input="handleTapeColorChange"
                    />
                </div>

                <div class="panel-row panel-row--inline">
                    <span class="panel-label">Позиция</span>
                    <ui-select
                        :value="props.tapePosition"
                        :options="tapePositionOptions"
                        @input="handleTapePositionChange"
                    />
                </div>
            </div>

            <!-- Pin Settings -->
            <div v-if="props.showPin" class="panel-section">
                <div class="panel-section__header">
                    <span class="panel-section__title">Кнопка</span>
                </div>

                <div class="panel-row panel-row--inline">
                    <span class="panel-label">Позиция</span>
                    <ui-select
                        :value="props.pinPosition"
                        :options="pinPositionOptions"
                        @input="handlePinPositionChange"
                    />
                </div>

                <div class="panel-row panel-row--inline">
                    <span class="panel-label">Цвет</span>
                    <ui-input-cp
                        :value="props.pinColor"
                        placeholder="Из темы"
                        @input="handlePinColorChange"
                    />
                </div>
            </div>

            <!-- Paper Style -->
            <div class="panel-section">
                <div class="panel-section__header">
                    <span class="panel-section__title">Стиль бумаги</span>
                </div>

                <div class="paper-style-selector">
                    <button
                        v-for="style in paperStyleOptions"
                        :key="style.value"
                        class="paper-style-btn"
                        :class="{ 'is-active': props.paperStyle === style.value }"
                        @click="handlePaperStyleChange(style.value)"
                    >
                        <div class="paper-preview" :class="`paper-preview--${style.value}`" />
                        <span>{{ style.label }}</span>
                    </button>
                </div>

                <div class="panel-row panel-row--inline">
                    <span class="panel-label">Текстура</span>
                    <ui-select
                        :value="props.paperTexture"
                        :options="paperTextureOptions"
                        @input="handlePaperTextureChange"
                    />
                </div>
            </div>

            <!-- Visual Effects -->
            <div class="panel-section">
                <div class="panel-section__header">
                    <span class="panel-section__title">Визуальные эффекты</span>
                </div>

                <div class="panel-row panel-row--inline">
                    <span class="panel-label">Градиентный фон</span>
                    <ui-switch
                        :value="props.useGradient"
                        @input="handleGradientToggle"
                    />
                </div>

                <div class="panel-row panel-row--inline">
                    <span class="panel-label">Показать рамку</span>
                    <ui-switch
                        :value="props.showBorder"
                        @input="handleBorderToggle"
                    />
                </div>

                <div class="panel-row panel-row--inline">
                    <span class="panel-label">Загнутый уголок</span>
                    <ui-switch
                        :value="props.showFoldedCorner"
                        @input="handleFoldedCornerChange"
                    />
                </div>

                <div v-if="props.showFoldedCorner" class="panel-row panel-row--inline">
                    <span class="panel-label">Позиция уголка</span>
                    <ui-select
                        :value="props.foldedCornerPosition"
                        :options="foldedCornerPositionOptions"
                        @input="handleFoldedCornerPositionChange"
                    />
                </div>

                <div class="panel-row panel-row--inline">
                    <span class="panel-label">Тень по краю</span>
                    <ui-switch
                        :value="props.edgeShadow"
                        @input="handleEdgeShadowChange"
                    />
                </div>
            </div>

            <!-- Rotation -->
            <div class="panel-section">
                <div class="panel-section__header">
                    <span class="panel-section__title">Поворот</span>
                </div>

                <div class="panel-row panel-row--inline">
                    <span class="panel-label">Угол ({{ props.rotation }}°)</span>
                    <input
                        type="range"
                        :value="props.rotation"
                        min="-10"
                        max="10"
                        step="1"
                        class="range-slider"
                        @input="handleRotationChange"
                    />
                </div>

                <div class="panel-row panel-row--inline">
                    <span class="panel-label">Случайный поворот</span>
                    <ui-switch
                        :value="props.rotationRandom"
                        @input="handleRandomRotationChange"
                    />
                </div>
            </div>

            <!-- Handwriting Font -->
            <div class="panel-section">
                <div class="panel-section__header">
                    <span class="panel-section__title">Рукописный шрифт</span>
                </div>

                <div class="panel-row panel-row--inline">
                    <span class="panel-label">Включить</span>
                    <ui-switch
                        :value="props.useHandwritingFont"
                        @input="handleHandwritingToggle"
                    />
                </div>

                <div v-if="props.useHandwritingFont" class="panel-row panel-row--inline">
                    <span class="panel-label">Шрифт</span>
                    <ui-select
                        :value="props.handwritingFont"
                        :options="handwritingFontOptions"
                        @input="handleHandwritingFontChange"
                    />
                </div>
            </div>

            <!-- Shadow -->
            <div class="panel-section">
                <div class="panel-section__header">
                    <span class="panel-section__title">Тень</span>
                </div>

                <div class="shadow-presets">
                    <button
                        v-for="shadow in shadowPresetOptions"
                        :key="shadow.value"
                        class="shadow-preset-btn"
                        :class="{ 'is-active': props.boxShadow === shadow.value }"
                        @click="handleShadowPresetChange(shadow.value)"
                    >
                        <div class="shadow-preview" :style="{ boxShadow: shadow.value }" />
                        <span>{{ shadow.label }}</span>
                    </button>
                </div>
            </div>

            <!-- Spacing -->
            <div class="panel-section">
                <div class="panel-section__header">
                    <span class="panel-section__title">Отступы</span>
                </div>

                <div class="panel-row panel-row--inline">
                    <span class="panel-label">Внутренний отступ</span>
                    <ui-input-units
                        :value="props.padding"
                        @input="handlePaddingChange"
                    />
                </div>

                <div class="panel-row panel-row--inline">
                    <span class="panel-label">Мин. высота</span>
                    <ui-input-units
                        :value="props.minHeight"
                        @input="handleMinHeightChange"
                    />
                </div>

                <div class="panel-row panel-row--inline">
                    <span class="panel-label">Скругление углов</span>
                    <ui-input-units
                        :value="props.borderRadius"
                        @input="handleBorderRadiusChange"
                    />
                </div>

                <div class="panel-row panel-row--inline">
                    <span class="panel-label">Прозрачность ({{ opacityPercent }}%)</span>
                    <input
                        type="range"
                        :value="opacityPercent"
                        min="0"
                        max="100"
                        step="5"
                        class="range-slider"
                        @input="handleOpacityChange"
                    />
                </div>
            </div>
        </div>
    </w-panel>
</template>

<script>
import { Panel } from '@goodt-wcore/panel';
import { UiSelect, UiSwitch, UiInputCp, UiInputUnits } from '@goodt-wcore/panel-ui';
import { shadowOptions } from '../constants/stickerThemes';
import { handwritingFontOptions } from '../constants/handwritingFonts';

export default {
    name: 'AppearancePanel',

    extends: Panel,

    meta: { name: 'Оформление', icon: 'palette' },

    components: {
        UiSelect,
        UiSwitch,
        UiInputCp,
        UiInputUnits
    },

    data() {
        return {
            handwritingFontOptions,
            shadowPresetOptions: shadowOptions,
            tapeStyleOptions: [
                { value: 'single', label: 'Одиночный' },
                { value: 'strip', label: 'Широкий' },
                { value: 'crossed', label: 'Крестом' },
                { value: 'corner', label: 'Уголок' },
                { value: 'washi', label: 'Васи' }
            ],
            tapePositionOptions: [
                { value: 'top-left', label: 'Сверху слева' },
                { value: 'top-center', label: 'Сверху по центру' },
                { value: 'top-right', label: 'Сверху справа' }
            ],
            pinPositionOptions: [
                { value: 'top-left', label: 'Сверху слева' },
                { value: 'top-center', label: 'Сверху по центру' },
                { value: 'top-right', label: 'Сверху справа' }
            ],
            paperStyleOptions: [
                { value: 'standard', label: 'Чистый' },
                { value: 'lined', label: 'В линейку' },
                { value: 'grid', label: 'В клетку' },
                { value: 'dotted', label: 'В точку' },
                { value: 'ruled', label: 'С полями' }
            ],
            paperTextureOptions: [
                { value: 'none', label: 'Нет' },
                { value: 'subtle', label: 'Лёгкая' },
                { value: 'paper', label: 'Бумага' },
                { value: 'noisy', label: 'Шумная' }
            ],
            foldedCornerPositionOptions: [
                { value: 'bottom-right', label: 'Снизу справа' },
                { value: 'bottom-left', label: 'Снизу слева' },
                { value: 'top-right', label: 'Сверху справа' },
                { value: 'top-left', label: 'Сверху слева' }
            ]
        };
    },

    computed: {
        opacityPercent() {
            return Math.round(parseFloat(this.props.opacity || 1) * 100); // eslint-disable-line no-magic-numbers
        }
    },

    methods: {
        handleTapeStyleChange(value) {
            this.$set(this.props, 'tapeStyle', value);
            this.propChanged('tapeStyle');
        },

        handleTapeColorChange(value) {
            this.$set(this.props, 'tapeColor', value);
            this.propChanged('tapeColor');
        },

        handleTapePositionChange(value) {
            this.$set(this.props, 'tapePosition', value);
            this.propChanged('tapePosition');
        },

        handlePinPositionChange(value) {
            this.$set(this.props, 'pinPosition', value);
            this.propChanged('pinPosition');
        },

        handlePinColorChange(value) {
            this.$set(this.props, 'pinColor', value);
            this.propChanged('pinColor');
        },

        handlePaperStyleChange(value) {
            this.$set(this.props, 'paperStyle', value);
            this.propChanged('paperStyle');
        },

        handlePaperTextureChange(value) {
            this.$set(this.props, 'paperTexture', value);
            this.propChanged('paperTexture');
        },

        handleGradientToggle(value) {
            this.$set(this.props, 'useGradient', value);
            this.propChanged('useGradient');
        },

        handleBorderToggle(value) {
            this.$set(this.props, 'showBorder', value);
            this.propChanged('showBorder');
        },

        handleFoldedCornerChange(value) {
            this.$set(this.props, 'showFoldedCorner', value);
            this.propChanged('showFoldedCorner');
        },

        handleFoldedCornerPositionChange(value) {
            this.$set(this.props, 'foldedCornerPosition', value);
            this.propChanged('foldedCornerPosition');
        },

        handleEdgeShadowChange(value) {
            this.$set(this.props, 'edgeShadow', value);
            this.propChanged('edgeShadow');
        },

        handleRotationChange(event) {
            const value = parseInt(event.target.value, 10);
            this.$set(this.props, 'rotation', value);
            this.propChanged('rotation');
        },

        handleRandomRotationChange(value) {
            this.$set(this.props, 'rotationRandom', value);
            this.propChanged('rotationRandom');
        },

        handleHandwritingToggle(value) {
            this.$set(this.props, 'useHandwritingFont', value);
            this.propChanged('useHandwritingFont');
        },

        handleHandwritingFontChange(value) {
            this.$set(this.props, 'handwritingFont', value);
            this.propChanged('handwritingFont');
        },

        handleShadowPresetChange(value) {
            this.$set(this.props, 'boxShadow', value);
            this.propChanged('boxShadow');
        },

        handlePaddingChange(value) {
            this.$set(this.props, 'padding', value);
            this.propChanged('padding');
        },

        handleMinHeightChange(value) {
            this.$set(this.props, 'minHeight', value);
            this.propChanged('minHeight');
        },

        handleBorderRadiusChange(value) {
            this.$set(this.props, 'borderRadius', value);
            this.propChanged('borderRadius');
        },

        handleOpacityChange(event) {
            const percent = parseInt(event.target.value, 10);
            const opacity = percent / 100; // eslint-disable-line no-magic-numbers
            this.$set(this.props, 'opacity', opacity);
            this.propChanged('opacity');
        }
    }
};
</script>

<style lang="postcss" scoped>
.elemsticker-appearance-panel {
    padding: 12px;

    .panel-section {
        margin-bottom: 16px;

        &:last-child {
            margin-bottom: 0;
        }

        &__header {
            display: flex;
            align-items: center;
            margin-bottom: 8px;
        }

        &__title {
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            color: #666;
            letter-spacing: 0.5px;
        }
    }

    .panel-row {
        margin-bottom: 8px;

        &:last-child {
            margin-bottom: 0;
        }

        &--inline {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
        }
    }

    .panel-label {
        font-size: 12px;
        color: #333;
        flex-shrink: 0;
    }

    .range-slider {
        width: 120px;
        height: 4px;
        -webkit-appearance: none;
        appearance: none;
        background: #ddd;
        border-radius: 2px;
        outline: none;

        &::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 14px;
            height: 14px;
            background: #1976d2;
            border-radius: 50%;
            cursor: pointer;
        }
    }

    /* Tape Style Selector */
    .tape-style-selector {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 6px;
        margin-bottom: 12px;
    }

    .tape-style-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        padding: 8px 4px;
        background: #f5f5f5;
        border: 2px solid transparent;
        border-radius: 6px;
        cursor: pointer;
        font-size: 9px;
        transition: all 0.15s ease;

        &:hover {
            background: #eee;
        }

        &.is-active {
            border-color: #1976d2;
            background: #e3f2fd;
        }
    }

    .tape-preview {
        width: 32px;
        height: 10px;
        background: rgba(255, 235, 59, 0.7);
        border-radius: 1px;

        &--crossed {
            position: relative;
            transform: rotate(-15deg);

            &::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(255, 235, 59, 0.7);
                transform: rotate(30deg);
            }
        }

        &--strip {
            height: 12px;
            border-radius: 2px;
        }

        &--corner {
            width: 20px;
            height: 20px;
            clip-path: polygon(0 0, 100% 0, 0 100%);
        }

        &--washi {
            background: repeating-linear-gradient(
                90deg,
                rgba(255, 235, 59, 0.7),
                rgba(255, 235, 59, 0.7) 3px,
                rgba(255, 255, 255, 0.4) 3px,
                rgba(255, 255, 255, 0.4) 6px
            );
        }
    }

    /* Paper Style Selector */
    .paper-style-selector {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 6px;
        margin-bottom: 12px;
    }

    .paper-style-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        padding: 6px 4px;
        background: #f5f5f5;
        border: 2px solid transparent;
        border-radius: 6px;
        cursor: pointer;
        font-size: 9px;
        transition: all 0.15s ease;

        &:hover {
            background: #eee;
        }

        &.is-active {
            border-color: #1976d2;
            background: #e3f2fd;
        }
    }

    .paper-preview {
        width: 28px;
        height: 28px;
        background: #FFF9C4;
        border-radius: 2px;
        box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.1);

        &--lined {
            background-image:
                repeating-linear-gradient(
                    transparent,
                    transparent 6px,
                    rgba(0, 0, 0, 0.1) 6px,
                    rgba(0, 0, 0, 0.1) 7px
                );
            background-color: #FFF9C4;
        }

        &--grid {
            background-image:
                linear-gradient(rgba(0, 0, 0, 0.08) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0, 0, 0, 0.08) 1px, transparent 1px);
            background-size: 7px 7px;
            background-color: #FFF9C4;
        }

        &--dotted {
            background-image:
                radial-gradient(circle, rgba(0, 0, 0, 0.1) 1px, transparent 1px);
            background-size: 6px 6px;
            background-color: #FFF9C4;
        }

        &--ruled {
            background-image:
                linear-gradient(transparent 0px, transparent 6px, #E57373 6px, #E57373 7px, transparent 7px),
                repeating-linear-gradient(
                    transparent,
                    transparent 6px,
                    rgba(0, 0, 0, 0.05) 6px,
                    rgba(0, 0, 0, 0.05) 7px
                );
            background-color: #FFF9C4;
        }
    }

    /* Shadow Presets */
    .shadow-presets {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 6px;
    }

    .shadow-preset-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        padding: 8px 4px;
        background: #f5f5f5;
        border: 2px solid transparent;
        border-radius: 6px;
        cursor: pointer;
        font-size: 9px;
        transition: all 0.15s ease;

        &:hover {
            background: #eee;
        }

        &.is-active {
            border-color: #1976d2;
            background: #e3f2fd;
        }
    }

    .shadow-preview {
        width: 24px;
        height: 24px;
        background: #FFF9C4;
        border-radius: 2px;
    }
}
</style>
