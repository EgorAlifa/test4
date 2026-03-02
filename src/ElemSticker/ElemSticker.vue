<template>
    <w-elem>
        <div class="elemsticker-wrapper">
            <div
                class="elemsticker-widget-root"
                :class="rootClasses"
                :style="rootStyles"
            >
            <!-- Tape decorations -->
            <div
                v-if="props.showTape && props.tapeStyle !== 'none'"
                class="elemsticker-tape"
                :class="tapeClasses"
                :style="tapeStyles"
            />

            <!-- Second tape for crossed style -->
            <div
                v-if="props.showTape && props.tapeStyle === 'crossed'"
                class="elemsticker-tape elemsticker-tape--secondary"
                :style="tapeStyles"
            />

            <!-- Pin decoration -->
            <div
                v-if="props.showPin && !props.showTape"
                class="elemsticker-pin"
                :class="`elemsticker-pin--${props.pinPosition}`"
                :style="pinStyles"
            >
                <svg viewBox="0 0 24 24" class="elemsticker-pin__svg">
                    <circle cx="12" cy="8" r="6" :fill="computedPinColor" />
                    <ellipse cx="10" cy="6" rx="2" ry="1.5" fill="rgba(255,255,255,0.4)" />
                    <ellipse cx="12" cy="14" rx="3" ry="1" fill="rgba(0,0,0,0.2)" />
                    <path d="M12 14 L12 22" stroke="#666" stroke-width="1.5" stroke-linecap="round" />
                </svg>
            </div>

            <!-- Priority indicator -->
            <div
                v-if="props.showPriority && props.priority"
                class="elemsticker-priority"
                :style="{ color: priorityConfig.color }"
            >
                <i :class="`mdi ${priorityConfig.icon}`" />
                <span class="elemsticker-priority__label">{{ priorityConfig.label }}</span>
            </div>

            <!-- Metadata (top position) -->
            <div
                v-if="props.showMetadata && props.metadataPosition === 'top'"
                class="elemsticker-metadata elemsticker-metadata--top"
            >
                <span v-if="props.author" class="elemsticker-metadata__author">
                    <i class="mdi mdi-account" /> {{ props.author }}
                </span>
                <span v-if="formattedModifiedAt" class="elemsticker-metadata__date">
                    {{ formattedModifiedAt }}
                </span>
            </div>

            <!-- Content area -->
            <div class="elemsticker-content" :style="contentStyles">
                <TiptapEditor
                    v-if="!props.isPlainHTMLShown"
                    :value="props.html"
                    :placeholder="props.placeholder"
                    theme="light"
                    class="elemsticker-editor"
                    @input="handleContentChange"
                    @change="handleContentChange"
                />
                <div
                    v-else
                    class="elemsticker-html"
                    v-html="props.html || props.placeholder"
                />
            </div>

            <!-- Tags -->
            <div
                v-if="props.showTags && props.tags && props.tags.length > 0"
                class="elemsticker-tags"
            >
                <span
                    v-for="(tag, index) in props.tags"
                    :key="index"
                    class="elemsticker-tag"
                >
                    {{ tag }}
                </span>
            </div>

            <!-- Metadata (bottom position) -->
            <div
                v-if="props.showMetadata && props.metadataPosition === 'bottom'"
                class="elemsticker-metadata elemsticker-metadata--bottom"
            >
                <span v-if="props.author" class="elemsticker-metadata__author">
                    <i class="mdi mdi-account" /> {{ props.author }}
                </span>
                <span v-if="formattedModifiedAt" class="elemsticker-metadata__date">
                    {{ formattedModifiedAt }}
                </span>
            </div>

            <!-- Folded corner effect -->
            <div
                v-if="props.showFoldedCorner"
                class="elemsticker-fold"
                :class="`elemsticker-fold--${props.foldedCornerPosition}`"
                :style="foldStyles"
            />

            <!-- Paper texture overlay -->
            <div
                v-if="props.paperTexture !== 'none'"
                class="elemsticker-texture"
                :class="`elemsticker-texture--${props.paperTexture}`"
            />

            <!-- Edge shadow for lifted effect -->
            <div
                v-if="props.edgeShadow"
                class="elemsticker-edge-shadow"
            />
        </div>
        </div>
    </w-elem>
</template>

<script>
import { Elem } from '@goodt-wcore/elem';
import { varBindingsMixin } from '../common/mixins/varBindingsMixin';
import TiptapEditor from '../ElemText/components/TiptapEditor.vue';
import { meta } from './descriptor';
import { getThemeColors } from './constants/stickerThemes';
import { getPriorityConfig } from './constants/priorityLevels';
import { getHandwritingFont, loadHandwritingFont } from './constants/handwritingFonts';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';

dayjs.locale('ru');

// eslint-disable-next-line no-magic-numbers
const RANDOM_ROTATION_RANGE = 5;

export default {
    name: 'ElemSticker',

    meta,

    extends: Elem,

    mixins: [varBindingsMixin],

    components: {
        TiptapEditor
    },

    data() {
        return {
            randomRotation: 0
        };
    },

    created() {
        if (this.props.rotationRandom) {
            this.randomRotation = this.generateRandomRotation();
        }
        if (!this.props.createdAt) {
            this.props.createdAt = new Date().toISOString();
        }
    },

    computed: {
        themeColors() {
            return getThemeColors(this.props.stickerTheme);
        },

        priorityConfig() {
            return getPriorityConfig(this.props.priority);
        },

        computedBackgroundColor() {
            return this.props.stickerColor || this.themeColors.background;
        },

        computedBackgroundStyle() {
            if (this.props.useGradient && this.themeColors.backgroundGradient) {
                return this.themeColors.backgroundGradient;
            }
            return this.computedBackgroundColor;
        },

        computedTextColor() {
            return this.props.textColor || this.themeColors.text;
        },

        computedPinColor() {
            return this.props.pinColor || this.themeColors.pin;
        },

        computedTapeColor() {
            return this.props.tapeColor || this.themeColors.tape || 'rgba(255, 235, 59, 0.6)';
        },

        computedFontFamily() {
            if (this.props.fontFamily) {
                return this.props.fontFamily;
            }
            if (this.props.useHandwritingFont) {
                const font = getHandwritingFont(this.props.handwritingFont);
                return font.fontFamily;
            }
            return 'inherit';
        },

        effectiveRotation() {
            if (this.props.rotationRandom) {
                return this.randomRotation;
            }
            return this.props.rotation || 0;
        },

        rootClasses() {
            return {
                [`elemsticker--theme-${this.props.stickerTheme}`]: true,
                [`elemsticker--paper-${this.props.paperStyle}`]: true,
                'elemsticker--has-pin': this.props.showPin && !this.props.showTape,
                'elemsticker--has-tape': this.props.showTape,
                'elemsticker--has-fold': this.props.showFoldedCorner,
                'elemsticker--has-gradient': this.props.useGradient,
                'elemsticker--has-border': this.props.showBorder,
                'elemsticker--has-edge-shadow': this.props.edgeShadow
            };
        },

        rootStyles() {
            const styles = {
                '--sticker-bg': this.computedBackgroundColor,
                '--sticker-bg-dark': this.themeColors.backgroundDark,
                '--sticker-text': this.computedTextColor,
                '--sticker-fold': this.themeColors.fold,
                '--sticker-border': this.themeColors.border,
                '--sticker-tape': this.computedTapeColor,
                color: this.computedTextColor,
                fontFamily: this.computedFontFamily,
                fontSize: this.normalizeSize(this.props.fontSize),
                fontWeight: this.props.fontWeight,
                lineHeight: this.props.lineHeight,
                textAlign: this.props.textAlign,
                padding: this.normalizeSize(this.props.padding),
                minHeight: this.normalizeSize(this.props.minHeight),
                minWidth: this.normalizeSize(this.props.minWidth) || undefined,
                aspectRatio: this.props.aspectRatio || undefined,
                borderRadius: this.normalizeSize(this.props.borderRadius),
                opacity: this.props.opacity
            };

            // Background (gradient or solid)
            if (this.props.useGradient && this.themeColors.backgroundGradient) {
                styles.background = this.themeColors.backgroundGradient;
            } else {
                styles.backgroundColor = this.computedBackgroundColor;
            }

            // Shadow
            if (this.props.boxShadow && this.props.boxShadow !== 'none') {
                styles.boxShadow = this.props.boxShadow;
            }

            // Border
            if (this.props.showBorder) {
                styles.border = `1px solid ${this.themeColors.border}`;
            }

            // Rotation
            if (this.effectiveRotation) {
                styles.transform = `rotate(${this.effectiveRotation}deg)`;
            }

            if (this.props.maxWidth) {
                styles.maxWidth = this.normalizeSize(this.props.maxWidth);
            }

            return styles;
        },

        tapeClasses() {
            return {
                [`elemsticker-tape--${this.props.tapeStyle}`]: true,
                [`elemsticker-tape--${this.props.tapePosition}`]: true
            };
        },

        tapeStyles() {
            return {
                '--tape-color': this.computedTapeColor,
                '--tape-rotation': `${this.props.tapeRotation || 0}deg`
            };
        },

        pinStyles() {
            return {
                '--pin-color': this.computedPinColor
            };
        },

        contentStyles() {
            return {
                fontFamily: this.computedFontFamily,
                fontSize: this.normalizeSize(this.props.fontSize),
                lineHeight: this.props.lineHeight
            };
        },

        foldStyles() {
            return {
                '--fold-color': this.themeColors.fold,
                '--fold-shadow': this.themeColors.backgroundDark
            };
        },

        formattedCreatedAt() {
            if (!this.props.createdAt) return '';
            return dayjs(this.props.createdAt).format(this.props.dateFormat);
        },

        formattedModifiedAt() {
            if (!this.props.modifiedAt) return '';
            return dayjs(this.props.modifiedAt).format(this.props.dateFormat);
        }
    },

    watch: {
        'props.useHandwritingFont': {
            immediate: true,
            handler(enabled) {
                if (enabled) {
                    loadHandwritingFont(this.props.handwritingFont);
                }
            }
        },
        'props.handwritingFont': {
            handler(fontName) {
                if (this.props.useHandwritingFont) {
                    loadHandwritingFont(fontName);
                }
            }
        }
    },

    methods: {
        handleContentChange(html) {
            if (this.props.html === html) return;

            this.props.html = html;
            this.props.modifiedAt = new Date().toISOString();
            this.propChanged('html');
            this.propChanged('modifiedAt');
            this.$emit('change', { html });
            this.commitBoundVar('onChange', html);
        },

        generateRandomRotation() {
            const range = RANDOM_ROTATION_RANGE;
            return (Math.random() * range * 2) - range; // eslint-disable-line no-magic-numbers
        },

        normalizeSize(value) {
            if (value == null || value === '') return undefined;
            if (typeof value === 'number') return `${value}px`;
            if (typeof value === 'object' && value.size != null) {
                return `${value.size}${value.unit || 'px'}`;
            }
            return String(value);
        }
    }
};
</script>

<style lang="postcss" scoped>
/* Wrapper ensures overflow is visible for decorations */
.elemsticker-wrapper {
    width: 100%;
    height: 100%;
    overflow: visible !important;
    padding-top: 16px; /* Space for tape/pin */
    box-sizing: border-box;
}

.elemsticker-widget-root {
    position: relative;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    overflow: visible !important;

    &:hover {
        z-index: 1;
    }

    /* ═══════════════════════════════════════════════════════════════════════════ */
    /* PAPER STYLES */
    /* ═══════════════════════════════════════════════════════════════════════════ */

    &.elemsticker--paper-lined {
        background-image:
            repeating-linear-gradient(
                transparent,
                transparent 27px,
                rgba(0, 0, 0, 0.06) 27px,
                rgba(0, 0, 0, 0.06) 28px
            );
        background-position: 0 12px;
    }

    &.elemsticker--paper-grid {
        background-image:
            linear-gradient(rgba(0, 0, 0, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 0, 0, 0.04) 1px, transparent 1px);
        background-size: 20px 20px;
    }

    &.elemsticker--paper-dotted {
        background-image:
            radial-gradient(circle, rgba(0, 0, 0, 0.08) 1px, transparent 1px);
        background-size: 16px 16px;
    }

    &.elemsticker--paper-ruled {
        background-image:
            linear-gradient(transparent 0px, transparent 27px, #E57373 27px, #E57373 28px, transparent 28px),
            repeating-linear-gradient(
                transparent,
                transparent 27px,
                rgba(0, 0, 0, 0.05) 27px,
                rgba(0, 0, 0, 0.05) 28px
            );
        background-position: 0 12px;
    }

    /* ═══════════════════════════════════════════════════════════════════════════ */
    /* PAPER TEXTURE OVERLAYS */
    /* ═══════════════════════════════════════════════════════════════════════════ */

    .elemsticker-texture {
        position: absolute;
        inset: 0;
        pointer-events: none;
        border-radius: inherit;

        &--subtle {
            background: linear-gradient(
                135deg,
                rgba(255, 255, 255, 0.1) 0%,
                transparent 50%,
                rgba(0, 0, 0, 0.02) 100%
            );
        }

        &--paper {
            background:
                linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, transparent 40%),
                linear-gradient(315deg, rgba(0, 0, 0, 0.03) 0%, transparent 40%);
        }

        &--noisy {
            opacity: 0.03;
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
        }
    }

    /* ═══════════════════════════════════════════════════════════════════════════ */
    /* TAPE DECORATIONS */
    /* ═══════════════════════════════════════════════════════════════════════════ */

    .elemsticker-tape {
        position: absolute;
        z-index: 10;
        pointer-events: none;
        top: -12px;
        left: 50%;
        transform: translateX(-50%);
        width: 60px;
        height: 20px;

        /* Base tape appearance */
        background: var(--tape-color, rgba(255, 235, 59, 0.6));
        box-shadow:
            0 1px 3px rgba(0, 0, 0, 0.15),
            inset 0 0 0 1px rgba(255, 255, 255, 0.3);

        /* Tape styles */
        &--single {
            width: 60px;
            height: 20px;
        }

        &--strip {
            width: 80px;
            height: 24px;
            border-radius: 2px;
        }

        &--corner {
            width: 40px;
            height: 40px;
            top: 0;
            left: 0;
            transform: none;
            clip-path: polygon(0 0, 100% 0, 0 100%);
        }

        &--crossed {
            width: 50px;
            height: 18px;
            transform: translateX(-50%) rotate(-25deg);
        }

        &--secondary {
            transform: translateX(-50%) rotate(25deg) !important;
        }

        &--washi {
            width: 70px;
            height: 22px;
            background: repeating-linear-gradient(
                90deg,
                var(--tape-color, rgba(255, 235, 59, 0.6)),
                var(--tape-color, rgba(255, 235, 59, 0.6)) 4px,
                rgba(255, 255, 255, 0.3) 4px,
                rgba(255, 255, 255, 0.3) 8px
            );
            border-radius: 1px;
        }

        /* Position modifiers */
        &--top-left {
            left: 16px;
            transform: rotate(-12deg);
        }

        &--top-right {
            left: auto;
            right: 16px;
            transform: rotate(12deg);
        }
    }

    /* ═══════════════════════════════════════════════════════════════════════════ */
    /* PIN */
    /* ═══════════════════════════════════════════════════════════════════════════ */

    .elemsticker-pin {
        position: absolute;
        width: 28px;
        height: 28px;
        z-index: 10;
        pointer-events: none;
        filter: drop-shadow(1px 2px 3px rgba(0, 0, 0, 0.3));
        top: -14px;
        left: 50%;
        transform: translateX(-50%);

        &--top-left {
            left: 16px;
            transform: none;
        }

        &--top-center {
            left: 50%;
            transform: translateX(-50%);
        }

        &--top-right {
            left: auto;
            right: 16px;
            transform: none;
        }

        &__svg {
            width: 100%;
            height: 100%;
        }
    }

    /* ═══════════════════════════════════════════════════════════════════════════ */
    /* EDGE SHADOW (lifted paper effect) */
    /* ═══════════════════════════════════════════════════════════════════════════ */

    .elemsticker-edge-shadow {
        position: absolute;
        bottom: 0;
        left: 10%;
        right: 10%;
        height: 10px;
        background: radial-gradient(
            ellipse at center,
            rgba(0, 0, 0, 0.15) 0%,
            transparent 70%
        );
        transform: translateY(50%);
        pointer-events: none;
        z-index: -1;
    }

    /* ═══════════════════════════════════════════════════════════════════════════ */
    /* PRIORITY INDICATOR */
    /* ═══════════════════════════════════════════════════════════════════════════ */

    .elemsticker-priority {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 8px;
        opacity: 0.9;

        .mdi {
            font-size: 12px;
        }

        &__label {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
    }

    /* ═══════════════════════════════════════════════════════════════════════════ */
    /* CONTENT */
    /* ═══════════════════════════════════════════════════════════════════════════ */

    .elemsticker-content {
        flex: 1;
        min-height: 0;
        position: relative;
        z-index: 1;
    }

    .elemsticker-editor {
        min-height: 60px;
    }

    .elemsticker-html {
        word-wrap: break-word;
        overflow-wrap: break-word;

        &:empty::before {
            content: attr(data-placeholder);
            color: rgba(0, 0, 0, 0.4);
            font-style: italic;
        }
    }

    /* ═══════════════════════════════════════════════════════════════════════════ */
    /* TAGS */
    /* ═══════════════════════════════════════════════════════════════════════════ */

    .elemsticker-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        margin-top: 12px;
        padding-top: 8px;
        border-top: 1px dashed rgba(0, 0, 0, 0.1);
    }

    .elemsticker-tag {
        display: inline-block;
        padding: 2px 8px;
        font-size: 10px;
        font-weight: 500;
        background: rgba(0, 0, 0, 0.08);
        border-radius: 10px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    /* ═══════════════════════════════════════════════════════════════════════════ */
    /* METADATA */
    /* ═══════════════════════════════════════════════════════════════════════════ */

    .elemsticker-metadata {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 10px;
        opacity: 0.7;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

        &--top {
            margin-bottom: 8px;
            padding-bottom: 8px;
            border-bottom: 1px dashed rgba(0, 0, 0, 0.1);
        }

        &--bottom {
            margin-top: 12px;
            padding-top: 8px;
            border-top: 1px dashed rgba(0, 0, 0, 0.1);
        }

        &__author {
            display: flex;
            align-items: center;
            gap: 4px;

            .mdi {
                font-size: 12px;
            }
        }

        &__date {
            color: inherit;
        }
    }

    /* ═══════════════════════════════════════════════════════════════════════════ */
    /* FOLDED CORNER */
    /* ═══════════════════════════════════════════════════════════════════════════ */

    .elemsticker-fold {
        position: absolute;
        width: 0;
        height: 0;
        pointer-events: none;

        &--bottom-right {
            bottom: 0;
            right: 0;
            border-style: solid;
            border-width: 0 0 24px 24px;
            border-color: transparent transparent var(--fold-shadow, #ccc) transparent;

            &::before {
                content: '';
                position: absolute;
                bottom: -24px;
                right: 0;
                width: 0;
                height: 0;
                border-style: solid;
                border-width: 24px 24px 0 0;
                border-color: var(--fold-color, #ddd) transparent transparent transparent;
                filter: drop-shadow(-1px -1px 1px rgba(0, 0, 0, 0.1));
            }
        }

        &--bottom-left {
            bottom: 0;
            left: 0;
            border-style: solid;
            border-width: 24px 0 0 24px;
            border-color: transparent transparent transparent var(--fold-shadow, #ccc);

            &::before {
                content: '';
                position: absolute;
                bottom: -24px;
                left: 0;
                width: 0;
                height: 0;
                border-style: solid;
                border-width: 0 24px 24px 0;
                border-color: transparent var(--fold-color, #ddd) transparent transparent;
                filter: drop-shadow(1px -1px 1px rgba(0, 0, 0, 0.1));
            }
        }

        &--top-right {
            top: 0;
            right: 0;
            border-style: solid;
            border-width: 24px 0 0 24px;
            border-color: var(--fold-shadow, #ccc) transparent transparent transparent;

            &::before {
                content: '';
                position: absolute;
                top: -24px;
                right: 0;
                width: 0;
                height: 0;
                border-style: solid;
                border-width: 0 0 24px 24px;
                border-color: transparent transparent var(--fold-color, #ddd) transparent;
                filter: drop-shadow(-1px 1px 1px rgba(0, 0, 0, 0.1));
            }
        }

        &--top-left {
            top: 0;
            left: 0;
            border-style: solid;
            border-width: 0 24px 24px 0;
            border-color: transparent var(--fold-shadow, #ccc) transparent transparent;

            &::before {
                content: '';
                position: absolute;
                top: -24px;
                left: 0;
                width: 0;
                height: 0;
                border-style: solid;
                border-width: 24px 24px 0 0;
                border-color: transparent transparent transparent var(--fold-color, #ddd);
                filter: drop-shadow(1px 1px 1px rgba(0, 0, 0, 0.1));
            }
        }
    }
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/* DEEP STYLES FOR TIPTAP EDITOR */
/* ═══════════════════════════════════════════════════════════════════════════ */

.elemsticker-widget-root ::v-deep .tiptap-editor {
    .tiptap-prose {
        font-family: inherit;
        font-size: inherit;
        line-height: inherit;
        color: inherit;

        p {
            margin: 0;

            & + p {
                margin-top: 0.5em;
            }
        }

        p.is-editor-empty:first-child::before {
            color: rgba(0, 0, 0, 0.4);
        }
    }

    .tiptap-toolbar {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        /* Поднимаем тулбар выше виджета */
        margin-bottom: 75px;
    }
}
</style>
