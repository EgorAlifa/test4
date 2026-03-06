<template>
    <w-panel>
        <div class="elemsticker-content-panel">
            <!-- Color Presets -->
            <div class="panel-section">
                <div class="panel-section__header">
                    <span class="panel-section__title">Цвет</span>
                </div>
                <div class="color-presets">
                    <button
                        v-for="preset in colorPresets"
                        :key="preset.name"
                        class="color-preset-btn"
                        :class="{ 'is-active': props.stickerTheme === preset.name }"
                        :style="{ backgroundColor: preset.color }"
                        :title="preset.label"
                        @click="setTheme(preset.name)"
                    >
                        <i v-if="props.stickerTheme === preset.name" class="mdi mdi-check" />
                    </button>
                </div>
            </div>

            <!-- Decoration Style -->
            <div class="panel-section">
                <div class="panel-section__header">
                    <span class="panel-section__title">Декорация</span>
                </div>
                <div class="decoration-selector">
                    <button
                        v-for="deco in decorationOptions"
                        :key="deco.value"
                        class="decoration-btn"
                        :class="{ 'is-active': isDecorationActive(deco.value) }"
                        @click="setDecoration(deco.value)"
                    >
                        <i :class="`mdi ${deco.icon}`" />
                        <span>{{ deco.label }}</span>
                    </button>
                </div>
            </div>

            <!-- Content -->
            <div class="panel-section">
                <div class="panel-section__header">
                    <span class="panel-section__title">Текст</span>
                </div>

                <div class="panel-row">
                    <ui-textarea
                        :value="props.html"
                        placeholder="Введите текст (поддерживается HTML)"
                        :rows="4"
                        @input="handleHtmlChange"
                    />
                </div>

                <div class="panel-row panel-row--inline">
                    <span class="panel-label">Плейсхолдер</span>
                    <ui-input
                        :value="props.placeholder"
                        placeholder="Нажмите для ввода..."
                        @input="handlePlaceholderChange"
                    />
                </div>

                <div class="panel-row panel-row--inline">
                    <span class="panel-label">Режим HTML</span>
                    <ui-switch
                        :value="props.isPlainHTMLShown"
                        @input="handlePlainHtmlToggle"
                    />
                </div>
            </div>

            <!-- Quick Effects -->
            <div class="panel-section">
                <div class="panel-section__header">
                    <span class="panel-section__title">Эффекты</span>
                </div>

                <div class="effect-toggles">
                    <button
                        class="effect-toggle"
                        :class="{ 'is-active': props.useGradient }"
                        @click="toggleEffect('useGradient')"
                    >
                        <i class="mdi mdi-gradient-horizontal" />
                        <span>Градиент</span>
                    </button>
                    <button
                        class="effect-toggle"
                        :class="{ 'is-active': props.showFoldedCorner }"
                        @click="toggleEffect('showFoldedCorner')"
                    >
                        <i class="mdi mdi-page-layout-footer" />
                        <span>Уголок</span>
                    </button>
                    <button
                        class="effect-toggle"
                        :class="{ 'is-active': props.useHandwritingFont }"
                        @click="toggleEffect('useHandwritingFont')"
                    >
                        <i class="mdi mdi-format-font" />
                        <span>Рукопись</span>
                    </button>
                    <button
                        class="effect-toggle"
                        :class="{ 'is-active': props.showBorder }"
                        @click="toggleEffect('showBorder')"
                    >
                        <i class="mdi mdi-border-all" />
                        <span>Рамка</span>
                    </button>
                </div>
            </div>

            <!-- Presets -->
            <div class="panel-section">
                <div class="panel-section__header">
                    <span class="panel-section__title">Быстрые пресеты</span>
                </div>
                <div class="preset-buttons">
                    <button
                        v-for="(preset, key) in presets"
                        :key="key"
                        class="preset-btn"
                        :title="preset.description"
                        @click="applyPreset(key)"
                    >
                        {{ formatPresetName(key) }}
                    </button>
                </div>
            </div>
        </div>
    </w-panel>
</template>

<script>
import { Panel } from '@goodt-wcore/panel';
import { UiInput, UiTextarea, UiSwitch } from '@goodt-wcore/panel-ui';
import { colorPresets } from '../constants/stickerThemes';
import { presets } from '../descriptor';

export default {
    name: 'ContentPanel',

    extends: Panel,

    meta: { name: 'Содержимое', icon: 'text' },

    components: {
        UiInput,
        UiTextarea,
        UiSwitch
    },

    data() {
        return {
            colorPresets,
            presets,
            decorationOptions: [
                { value: 'none', label: 'Нет', icon: 'mdi-close' },
                { value: 'tape', label: 'Скотч', icon: 'mdi-minus' },
                { value: 'pin', label: 'Кнопка', icon: 'mdi-pin' },
                { value: 'washi', label: 'Васи', icon: 'mdi-palette-swatch' }
            ]
        };
    },

    methods: {
        setTheme(themeName) {
            this.$set(this.props, 'stickerTheme', themeName);
            this.propChanged('stickerTheme');
        },

        isDecorationActive(value) {
            if (value === 'none') {
                return !this.props.showTape && !this.props.showPin;
            }
            if (value === 'tape') {
                return this.props.showTape && this.props.tapeStyle !== 'washi';
            }
            if (value === 'pin') {
                return this.props.showPin;
            }
            if (value === 'washi') {
                return this.props.showTape && this.props.tapeStyle === 'washi';
            }
            return false;
        },

        setDecoration(value) {
            if (value === 'none') {
                this.$set(this.props, 'showTape', false);
                this.$set(this.props, 'showPin', false);
                this.propChanged('showTape');
                this.propChanged('showPin');
            } else if (value === 'tape') {
                this.$set(this.props, 'showTape', true);
                this.$set(this.props, 'showPin', false);
                this.$set(this.props, 'tapeStyle', 'single');
                this.propChanged('showTape');
                this.propChanged('showPin');
                this.propChanged('tapeStyle');
            } else if (value === 'pin') {
                this.$set(this.props, 'showTape', false);
                this.$set(this.props, 'showPin', true);
                this.propChanged('showTape');
                this.propChanged('showPin');
            } else if (value === 'washi') {
                this.$set(this.props, 'showTape', true);
                this.$set(this.props, 'showPin', false);
                this.$set(this.props, 'tapeStyle', 'washi');
                this.propChanged('showTape');
                this.propChanged('showPin');
                this.propChanged('tapeStyle');
            }
        },

        handleHtmlChange(value) {
            this.$set(this.props, 'html', value);
            this.propChanged('html');
        },

        handlePlaceholderChange(value) {
            this.$set(this.props, 'placeholder', value);
            this.propChanged('placeholder');
        },

        handlePlainHtmlToggle(value) {
            this.$set(this.props, 'isPlainHTMLShown', value);
            this.propChanged('isPlainHTMLShown');
        },

        toggleEffect(prop) {
            const currentValue = this.props[prop];
            this.$set(this.props, prop, !currentValue);
            this.propChanged(prop);
        },

        applyPreset(presetKey) {
            const preset = this.presets[presetKey];
            if (!preset || !preset.props) return;

            Object.entries(preset.props).forEach(([prop, value]) => {
                this.$set(this.props, prop, value);
                this.propChanged(prop);
            });
        },

        formatPresetName(key) {
            return key.charAt(0).toUpperCase() + key.slice(1);
        }
    }
};
</script>

<style lang="postcss" scoped>
.elemsticker-content-panel {
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
        }
    }

    .panel-label {
        font-size: 12px;
        color: #333;
    }

    /* Color Presets Grid */
    .color-presets {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 6px;
    }

    .color-preset-btn {
        aspect-ratio: 1;
        border: 2px solid transparent;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.15s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
        position: relative;

        &:hover {
            transform: scale(1.1);
            z-index: 1;
        }

        &.is-active {
            border-color: #333;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);

            .mdi {
                font-size: 14px;
                color: rgba(0, 0, 0, 0.6);
                text-shadow: 0 1px 1px rgba(255, 255, 255, 0.5);
            }
        }
    }

    /* Decoration Selector */
    .decoration-selector {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 6px;
    }

    .decoration-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
        padding: 8px 4px;
        font-size: 10px;
        background: #f5f5f5;
        border: 2px solid transparent;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.15s ease;

        .mdi {
            font-size: 18px;
            color: #666;
        }

        &:hover {
            background: #eee;
        }

        &.is-active {
            border-color: #1976d2;
            background: #e3f2fd;

            .mdi {
                color: #1976d2;
            }
        }
    }

    /* Effect Toggles */
    .effect-toggles {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 6px;
    }

    .effect-toggle {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
        padding: 8px 4px;
        font-size: 9px;
        background: #f5f5f5;
        border: 2px solid transparent;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.15s ease;

        .mdi {
            font-size: 16px;
            color: #666;
        }

        &:hover {
            background: #eee;
        }

        &.is-active {
            border-color: #4CAF50;
            background: #E8F5E9;

            .mdi {
                color: #4CAF50;
            }
        }
    }

    /* Presets */
    .preset-buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
    }

    .preset-btn {
        padding: 6px 12px;
        font-size: 11px;
        font-weight: 500;
        background: #f5f5f5;
        border: 1px solid #ddd;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.15s ease;

        &:hover {
            background: #eee;
            border-color: #ccc;
        }
    }
}
</style>
