<template>
    <w-elem>
        <div class="elemtext-widget-root" :class="widgetClasses" :style="dynamicStyles">
            <!-- Flex wrapper for vertical alignment -->
            <div class="elemtext-content-wrapper" :style="contentWrapperStyles">
                <ui-tooltip position="left" :position-offset="[0, 5]">
                    <template #target="{ events, binds }">
                        <div v-bind="binds" v-on="events" @click="handleContentClick">
                            <!-- TiptapEditor in design mode -->
                            <tiptap-editor
                                v-if="shouldDisplayWysiwyg"
                                ref="tiptapEditor"
                                :value="editableHtml"
                                :autofocus="true"
                                placeholder="Click to edit..."
                                @change="onChange"
                                @click.native.stop
                                @mousedown.native.stop
                                @keyup.native.stop
                                @keydown.native.stop
                            />
                            <!-- Static HTML in view mode -->
                            <div v-else v-html="processedHtml" class="elemtext-widget-root__content" />
                        </div>
                    </template>
                    <template #tooltip>
                        <div
                            class="icon cursor-pointer shadow color-primary round bg-white"
                            @click="isPlainHTMLShown = !isPlainHTMLShown"
                        >
                            <i :class="iconClass" class="mdi-18px" />
                        </div>
                    </template>
                </ui-tooltip>
            </div>
        </div>
    </w-elem>
</template>

<script>
/**
 * ElemText — VIBE 2.0
 *
 * A text widget with inline editing via TiptapEditor.
 * Features:
 * - Inline editing with bubble menu (B, I, U, colors, alignment, links)
 * - Typography presets (heading, body, caption, etc.)
 * - Designer panel for CSS customization
 * - Variable bindings for cross-widget communication (VIBE 2.0)
 *
 * Click behavior optimizations:
 * - autofocus="true" - editor focuses immediately when rendered
 * - isEditorMode watcher - programmatic focus when entering edit mode
 * - v-on="events" (ungated) - tooltip events always active
 */

import { Tooltip as UiTooltip } from 'goodteditor-ui';
import { Elem } from '@goodt-wcore/core';
import { store, unwrapStoreValue } from '@goodt-wcore/managers';
import { resolveIconClass } from '@goodt-common/utils';

import { meta } from './descriptor';
import { varBindingsMixin } from '../common/mixins/varBindingsMixin';
import TiptapEditor from './components/TiptapEditor.vue';
import {
    STYLE_PROP_MAP,
    formatPropForCss,
    parseCssForProp,
    buildCssStyleFromProps,
    computePropUpdatesFromCssStyle,
    getCssKeyForProp
} from './utils/cssStyleSync';

export default {
    name: 'ElemText',
    meta,
    extends: Elem,
    mixins: [varBindingsMixin],
    components: {
        UiTooltip,
        TiptapEditor
    },

    /**
     * Initialize sync flags and perform initial cssStyle synchronization
     */
    created() {
        // Flags to prevent infinite sync loops
        this._syncingToCssStyle = false;
        this._syncingFromCssStyle = false;

        // Initial sync: merge our props into cssStyle (cssStyle has priority)
        this.initialSyncToCssStyle();
    },

    computed: {
        widgetClasses() {
            return {
                'elemtext-widget-root': true,
                [`is-size-${this.props.size}`]: this.props.size,
                [`is-weight-${this.props.weight}`]: this.props.weight,
                [`is-align-${this.props.textAlign}`]: this.props.textAlign,
                'is-truncated': this.props.truncate === true,
                'is-truncated-multiline': typeof this.props.truncate === 'number',
                'is-clickable': this.hasClickWriteBinding && !this.isEditorMode,
                // Figma textAutoResize support
                'is-auto-width': this.props.textAutoResize === 'WIDTH_AND_HEIGHT',
                'is-auto-height': this.props.textAutoResize === 'HEIGHT' || this.props.textAutoResize === 'WIDTH_AND_HEIGHT'
            };
        },

        dynamicStyles() {
            const styles = {};

            // Typography — DIRECT styles (not CSS variables) for reliable inheritance
            // Use getBoundPropValue for variable binding priority
            const color = this.getBoundPropValue('color');
            if (color) {
                styles.color = color;
            }

            const fontFamily = this.getBoundPropValue('fontFamily');
            if (fontFamily) {
                styles.fontFamily = fontFamily;
            }

            const fontSize = this.getBoundPropValue('fontSize');
            if (fontSize) {
                styles.fontSize = this.formatSizeValue(fontSize);
            }
            const fontWeight = this.getBoundPropValue('fontWeight');
            if (fontWeight) {
                styles.fontWeight = fontWeight;
            }

            const lineHeight = this.getBoundPropValue('lineHeight');
            if (lineHeight) {
                styles.lineHeight = this.formatSizeValue(lineHeight);
            }

            const letterSpacing = this.getBoundPropValue('letterSpacing');
            if (letterSpacing) {
                styles.letterSpacing = this.formatSizeValue(letterSpacing);
            }

            const textTransform = this.getBoundPropValue('textTransform');
            if (textTransform) {
                styles.textTransform = textTransform;
            }

            const textDecoration = this.getBoundPropValue('textDecoration');
            if (textDecoration && textDecoration !== 'none') {
                styles.textDecoration = textDecoration;
            }

            // Background
            const backgroundColor = this.getBoundPropValue('backgroundColor');
            if (backgroundColor) {
                styles.backgroundColor = backgroundColor;
            }

            // Spacing
            const padding = this.getBoundPropValue('padding');
            if (padding) {
                styles.padding = padding;
            }

            const margin = this.getBoundPropValue('margin');
            if (margin) {
                styles.margin = margin;
            }

            // Border
            const borderColor = this.getBoundPropValue('borderColor');
            if (borderColor) {
                styles.borderColor = borderColor;
            }

            const borderWidth = this.getBoundPropValue('borderWidth');
            if (borderWidth) {
                styles.borderWidth = this.formatSizeValue(borderWidth);
            }

            const borderRadius = this.getBoundPropValue('borderRadius');
            if (borderRadius) {
                styles.borderRadius = this.formatSizeValue(borderRadius);
            }

            // Effects
            const boxShadow = this.getBoundPropValue('boxShadow');
            if (boxShadow && boxShadow !== 'none') {
                styles.boxShadow = boxShadow;
            }

            const opacity = this.getBoundPropValue('opacity');
            if (opacity != null && opacity !== '') {
                styles.opacity = opacity;
            }

            // Multiline truncation
            if (typeof this.props.truncate === 'number') {
                styles['-webkit-line-clamp'] = this.props.truncate;
            }

            // ═══════════════════════════════════════════════════════════════
            // FIGMA-PARITY STYLES
            // ═══════════════════════════════════════════════════════════════

            // Simple fill props (priority over arrays)
            const fillColor = this.getBoundPropValue('fillColor');
            const fillOpacity = this.getBoundPropValue('fillOpacity');
            if (fillColor) {
                const opacity = fillOpacity != null && fillOpacity !== '' ? fillOpacity : 1;
                styles.background = this.colorWithOpacity(fillColor, opacity);
            } else {
                // Fallback to fills array
                const fillsCSS = this.generateFillsCSS();
                if (fillsCSS) {
                    styles.background = fillsCSS;
                }
            }

            // Simple stroke props (priority over arrays)
            const strokeColor = this.getBoundPropValue('strokeColor');
            const strokeWidth = this.getBoundPropValue('strokeWidth');
            if (strokeColor && strokeWidth) {
                const position = this.props.strokePosition || 'inside';
                const strokeStyle = this.props.strokeStyle || 'solid';
                const strokeOpacity = this.props.strokeOpacity ?? 1;
                const width = this.formatSizeValue(strokeWidth);
                const color = this.colorWithOpacity(strokeColor, strokeOpacity);

                if (position === 'inside') {
                    styles.border = `${width} ${strokeStyle} ${color}`;
                    styles.boxSizing = 'border-box';
                } else if (position === 'outside') {
                    styles.outline = `${width} ${strokeStyle} ${color}`;
                    styles.outlineOffset = '0px';
                } else {
                    styles.border = `${width} ${strokeStyle} ${color}`;
                }
            } else {
                // Fallback to strokes array
                const strokesCSS = this.generateStrokesCSS();
                Object.assign(styles, strokesCSS);
            }

            // Generate effects CSS (shadows, blur)
            const effectsCSS = this.generateEffectsCSS();
            Object.assign(styles, effectsCSS);

            return styles;
        },

        /**
         * Styles for the flex wrapper that handles vertical alignment
         */
        contentWrapperStyles() {
            const verticalAlign = this.props.verticalAlign;
            if (verticalAlign && verticalAlign !== 'top') {
                return {
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: verticalAlign === 'middle' ? 'center' : 'flex-end',
                    height: '100%',
                    width: '100%'
                };
            }
            return {
                height: '100%',
                width: '100%'
            };
        },

        isPlainHTMLShown: {
            get() {
                return this.props.isPlainHTMLShown;
            },
            set(val) {
                this.props.isPlainHTMLShown = val;
                this.propChanged('isPlainHTMLShown');
            }
        },

        /**
         * HTML content for the editor (unprocessed, raw template)
         */
        editableHtml() {
            const {
                initProps,
                descriptor: { props }
            } = this;
            return initProps.html ?? props.html.default;
        },

        /**
         * HTML content for display (with variable substitution)
         * Uses getBoundPropValue for variable binding priority
         */
        processedHtml() {
            // Get html value respecting variable binding (variable > props)
            const html = this.getBoundPropValue('html');
            if (!html) return '';

            // Process {{variable}} template syntax
            const matches = html.matchAll(/{{\s*(\S+)\s*}}/g);
            return [...matches].reduce((acc, [match, key]) => {
                const value = unwrapStoreValue(store.state[key]) ?? '';
                return acc.replace(match, value);
            }, html);
        },

        /**
         * Check if onClick write binding is enabled
         */
        hasClickWriteBinding() {
            return this.varBindingsState?.write?.onClick?.enabled ?? false;
        }
    },

    computedEditor: {
        shouldDisplayWysiwyg() {
            return this.isEditorMode && this.isPlainHTMLShown === false;
        },
        iconClass() {
            const icon = this.isPlainHTMLShown ? 'keyboard-off' : 'keyboard';
            return this.resolveIconClass(icon);
        }
    },

    watch: {
        /**
         * Auto-focus the editor when entering edit mode
         * This reduces clicks from 3-4 down to 2 (select widget + position cursor)
         */
        isEditorMode(val) {
            if (val && !this.isPlainHTMLShown) {
                // Wait for TiptapEditor to mount and render
                this.$nextTick(() => {
                    // Additional delay for Tiptap internal initialization
                    setTimeout(() => this.focusEditor(), 50); // eslint-disable-line no-magic-numbers
                });
            }
        },

        // ═══════════════════════════════════════════════════════════════════
        // CSS STYLE SYNCHRONIZATION WATCHERS
        // Two-way sync between individual props and platform's cssStyle
        // ═══════════════════════════════════════════════════════════════════

        // Typography props → cssStyle
        'props.color': { handler(v) { this.syncPropToCssStyle('color', v); }, deep: true },
        'props.fontSize': { handler(v) { this.syncPropToCssStyle('fontSize', v); }, deep: true },
        'props.fontWeight': { handler(v) { this.syncPropToCssStyle('fontWeight', v); }, deep: true },
        'props.fontFamily': { handler(v) { this.syncPropToCssStyle('fontFamily', v); }, deep: true },
        'props.textAlign': { handler(v) { this.syncPropToCssStyle('textAlign', v); }, deep: true },
        'props.lineHeight': { handler(v) { this.syncPropToCssStyle('lineHeight', v); }, deep: true },
        'props.letterSpacing': { handler(v) { this.syncPropToCssStyle('letterSpacing', v); }, deep: true },
        'props.textTransform': { handler(v) { this.syncPropToCssStyle('textTransform', v); }, deep: true },
        'props.textDecoration': { handler(v) { this.syncPropToCssStyle('textDecoration', v); }, deep: true },

        // Background props → cssStyle
        'props.backgroundColor': { handler(v) { this.syncPropToCssStyle('backgroundColor', v); }, deep: true },

        // Spacing props → cssStyle
        'props.padding': { handler(v) { this.syncPropToCssStyle('padding', v); }, deep: true },
        'props.margin': { handler(v) { this.syncPropToCssStyle('margin', v); }, deep: true },

        // Border props → cssStyle
        'props.borderColor': { handler(v) { this.syncPropToCssStyle('borderColor', v); }, deep: true },
        'props.borderWidth': { handler(v) { this.syncPropToCssStyle('borderWidth', v); }, deep: true },
        'props.borderStyle': { handler(v) { this.syncPropToCssStyle('borderStyle', v); }, deep: true },
        'props.borderRadius': { handler(v) { this.syncPropToCssStyle('borderRadius', v); }, deep: true },

        // Effects props → cssStyle
        'props.opacity': { handler(v) { this.syncPropToCssStyle('opacity', v); }, deep: true },
        'props.boxShadow': { handler(v) { this.syncPropToCssStyle('boxShadow', v); }, deep: true },
        'props.textShadow': { handler(v) { this.syncPropToCssStyle('textShadow', v); }, deep: true },

        // textAutoResize → cssStyle (Figma parity)
        'props.textAutoResize': {
            handler(newVal) {
                this.syncTextAutoResizeToCssStyle(newVal);
            }
        },

        // cssStyle → individual props (reverse sync)
        'props.cssStyle': {
            handler(newCssStyle) {
                this.syncCssStyleToProps(newCssStyle);
            },
            deep: true
        }
    },

    methods: {
        resolveIconClass,

        // ═══════════════════════════════════════════════════════════════════
        // CSS STYLE SYNCHRONIZATION METHODS
        // ═══════════════════════════════════════════════════════════════════

        /**
         * Initial sync: merge our props into cssStyle
         * Called once in created() hook
         * Priority: cssStyle values take precedence over props
         */
        initialSyncToCssStyle() {
            // Build cssStyle from our current props
            const propsStyle = buildCssStyleFromProps(this.props);
            const currentCssStyle = this.props.cssStyle || {};

            // Merge: cssStyle has priority (it may have user edits from platform panel)
            const merged = { ...propsStyle, ...currentCssStyle };

            // Only update if there's a difference
            if (JSON.stringify(merged) !== JSON.stringify(currentCssStyle)) {
                this._syncingToCssStyle = true;
                this.$set(this.props, 'cssStyle', merged);
                this.propChanged('cssStyle');
                this.$nextTick(() => {
                    this._syncingToCssStyle = false;
                });
            }

            // Also sync cssStyle → props for any values that were in cssStyle but not in props
            if (Object.keys(currentCssStyle).length > 0) {
                this._syncingFromCssStyle = true;
                const updates = computePropUpdatesFromCssStyle(currentCssStyle, this.props);
                for (const [propName, value] of Object.entries(updates)) {
                    this.$set(this.props, propName, value);
                    this.propChanged(propName);
                }
                this.$nextTick(() => {
                    this._syncingFromCssStyle = false;
                });
            }
        },

        /**
         * Sync a single prop change to cssStyle
         * Called by watchers when individual props change
         */
        syncPropToCssStyle(propName, value) {
            // Prevent infinite loop
            if (this._syncingFromCssStyle) return;

            const cssKey = getCssKeyForProp(propName);
            if (!cssKey) return;

            const formatted = formatPropForCss(propName, value);
            const currentCssStyle = this.props.cssStyle || {};

            // Check if update is needed
            if (formatted == null && !(cssKey in currentCssStyle)) return;
            if (currentCssStyle[cssKey] === formatted) return;

            this._syncingToCssStyle = true;

            const newCssStyle = { ...currentCssStyle };
            if (formatted != null) {
                newCssStyle[cssKey] = formatted;
            } else {
                delete newCssStyle[cssKey];
            }

            this.$set(this.props, 'cssStyle', newCssStyle);
            this.propChanged('cssStyle');

            this.$nextTick(() => {
                this._syncingToCssStyle = false;
            });
        },

        /**
         * Sync cssStyle changes back to individual props
         * Called when platform's "Style" panel modifies cssStyle
         */
        syncCssStyleToProps(cssStyle) {
            // Prevent infinite loop
            if (this._syncingToCssStyle) return;
            if (!cssStyle) return;

            const updates = computePropUpdatesFromCssStyle(cssStyle, this.props);
            if (Object.keys(updates).length === 0) return;

            this._syncingFromCssStyle = true;

            for (const [propName, value] of Object.entries(updates)) {
                this.$set(this.props, propName, value);
                this.propChanged(propName);
            }

            this.$nextTick(() => {
                this._syncingFromCssStyle = false;
            });
        },

        formatSizeValue(val) {
            if (val == null || val === '') return null;
            if (typeof val === 'object' && val.size !== undefined) {
                // Use explicit check for unit - empty string '' is valid (unitless values like lineHeight: 1.2)
                const unit = val.unit != null ? val.unit : 'px';
                return `${val.size}${unit}`;
            }
            return String(val);
        },

        /**
         * Focus the TiptapEditor programmatically
         */
        focusEditor() {
            const editor = this.$refs.tiptapEditor;
            if (editor && editor.focus) {
                editor.focus();
            }
        },

        /**
         * Handle click on content area
         * Focuses editor immediately when clicking in edit mode
         * Also handles write binding for onClick action
         */
        handleContentClick() {
            // Handle WYSIWYG focus in edit mode
            if (this.shouldDisplayWysiwyg) {
                // Small delay to let the click event propagate first
                setTimeout(() => this.focusEditor(), 0);
            }

            // Handle write binding for onClick (only in view mode, not edit mode)
            if (!this.isEditorMode && this.hasClickWriteBinding) {
                this.commitBoundVar('onClick');
            }
        },

        onChange(html) {
            this.props.html = html;
            this.propChanged('html');
        },

        /**
         * Sync textAutoResize prop to cssStyle
         * When WIDTH_AND_HEIGHT: add white-space: nowrap to prevent wrapping
         * When NONE or HEIGHT: remove white-space from cssStyle
         */
        syncTextAutoResizeToCssStyle(textAutoResize) {
            const cssStyle = { ...(this.props.cssStyle || {}) };

            if (textAutoResize === 'WIDTH_AND_HEIGHT') {
                cssStyle['white-space'] = 'nowrap';
            } else {
                delete cssStyle['white-space'];
            }

            this.$set(this.props, 'cssStyle', cssStyle);
            this.propChanged('cssStyle');
        },

        // ═══════════════════════════════════════════════════════════════════
        // FIGMA-PARITY CSS GENERATORS
        // ═══════════════════════════════════════════════════════════════════

        /**
         * Generate CSS background from fills array
         * Supports solid colors and gradients, multiple layers
         */
        generateFillsCSS() {
            const fills = this.props.fills;
            if (!fills || !fills.length) return null;

            const visibleFills = fills.filter(fill => fill.visible !== false);
            if (!visibleFills.length) return null;

            // CSS backgrounds are layered bottom-to-top, so reverse for Figma order
            const backgrounds = visibleFills.reverse().map(fill => {
                const opacity = fill.opacity != null ? fill.opacity : 1;

                if (fill.type === 'solid') {
                    return this.colorWithOpacity(fill.color, opacity);
                }

                if (fill.type === 'linear-gradient' && fill.gradient) {
                    const { angle = 90, stops = [] } = fill.gradient; // eslint-disable-line no-magic-numbers
                    const stopsCSS = stops.map(stop =>
                        `${this.colorWithOpacity(stop.color, stop.opacity ?? 1)} ${stop.position}%`
                    ).join(', ');
                    return `linear-gradient(${angle}deg, ${stopsCSS})`;
                }

                if (fill.type === 'radial-gradient' && fill.gradient) {
                    const { stops = [] } = fill.gradient;
                    const stopsCSS = stops.map(stop =>
                        `${this.colorWithOpacity(stop.color, stop.opacity ?? 1)} ${stop.position}%`
                    ).join(', ');
                    return `radial-gradient(circle, ${stopsCSS})`;
                }

                return fill.color || 'transparent';
            });

            return backgrounds.join(', ');
        },

        /**
         * Generate CSS for strokes (from strokes array)
         * Supports inside/outside/center positioning, style, opacity
         */
        generateStrokesCSS() {
            const strokes = this.props.strokes;
            if (!strokes || !strokes.length) return {};

            const visibleStrokes = strokes.filter(stroke => stroke.visible !== false);
            if (!visibleStrokes.length) return {};

            // For simplicity, use the first visible stroke as the primary border
            // Multiple strokes would require pseudo-elements or box-shadow tricks
            const stroke = visibleStrokes[0];
            const color = this.colorWithOpacity(stroke.color, stroke.opacity ?? 1);
            const weight = stroke.weight || 1;
            const position = stroke.position || 'inside';
            const style = stroke.style || 'solid';

            const styles = {};

            if (position === 'inside') {
                // Inside stroke: border with box-sizing: border-box
                styles.border = `${weight}px ${style} ${color}`;
                styles.boxSizing = 'border-box';
            } else if (position === 'outside') {
                // Outside stroke: use outline (doesn't affect layout)
                styles.outline = `${weight}px ${style} ${color}`;
                styles.outlineOffset = '0px';
            } else {
                // Center stroke: border that extends half inside, half outside
                styles.border = `${weight}px ${style} ${color}`;
            }

            return styles;
        },

        /**
         * Generate CSS for effects (shadows, blur)
         */
        generateEffectsCSS() {
            const effects = this.props.effects;
            if (!effects || !effects.length) return {};

            const styles = {};
            const shadows = [];
            const filters = [];

            effects.forEach(effect => {
                if (!effect.enabled) return;

                switch (effect.type) {
                    case 'drop-shadow': {
                        const { x = 0, y = 4, blur = 8, spread = 0, color = '#000000', opacity = 0.25 } = effect; // eslint-disable-line no-magic-numbers
                        shadows.push(`${x}px ${y}px ${blur}px ${spread}px ${this.colorWithOpacity(color, opacity)}`);
                        break;
                    }
                    case 'inner-shadow': {
                        const { x = 0, y = 2, blur = 4, spread = 0, color = '#000000', opacity = 0.15 } = effect; // eslint-disable-line no-magic-numbers
                        shadows.push(`inset ${x}px ${y}px ${blur}px ${spread}px ${this.colorWithOpacity(color, opacity)}`);
                        break;
                    }
                    case 'layer-blur': {
                        const { amount = 8 } = effect; // eslint-disable-line no-magic-numbers
                        filters.push(`blur(${amount}px)`);
                        break;
                    }
                    case 'background-blur': {
                        const { amount = 12 } = effect; // eslint-disable-line no-magic-numbers
                        styles.backdropFilter = `blur(${amount}px)`;
                        styles.webkitBackdropFilter = `blur(${amount}px)`;
                        break;
                    }
                }
            });

            if (shadows.length) {
                styles.boxShadow = shadows.join(', ');
            }

            if (filters.length) {
                styles.filter = filters.join(' ');
            }

            return styles;
        },

        /**
         * Convert color to rgba with opacity
         */
        colorWithOpacity(color, opacity) {
            if (opacity === 1) return color;

            // If already rgba, parse and modify
            if (color && color.startsWith('rgba')) {
                return color.replace(/[\d.]+\)$/, `${opacity})`);
            }

            // If hex, convert to rgba
            if (color && color.startsWith('#')) {
                const hex = color.slice(1);
                let r, g, b;
                if (hex.length === 3) { // eslint-disable-line no-magic-numbers
                    r = parseInt(hex[0] + hex[0], 16); // eslint-disable-line no-magic-numbers
                    g = parseInt(hex[1] + hex[1], 16); // eslint-disable-line no-magic-numbers
                    b = parseInt(hex[2] + hex[2], 16); // eslint-disable-line no-magic-numbers
                } else {
                    r = parseInt(hex.slice(0, 2), 16); // eslint-disable-line no-magic-numbers
                    g = parseInt(hex.slice(2, 4), 16); // eslint-disable-line no-magic-numbers
                    b = parseInt(hex.slice(4, 6), 16); // eslint-disable-line no-magic-numbers
                }
                return `rgba(${r}, ${g}, ${b}, ${opacity})`;
            }

            // If rgb, convert to rgba
            if (color && color.startsWith('rgb(')) {
                return color.replace('rgb(', 'rgba(').replace(')', `, ${opacity})`);
            }

            return color;
        }
    }
};
</script>

<style lang="postcss" scoped>
/**
 * ElemText Styles — VIBE 2.0
 * SCOPED styles to prevent leaking into other widgets
 */

.elemtext-widget-root {
    position: relative;
    height: 100%;

    /* Size presets */
    &.is-size-small { font-size: 12px; }
    &.is-size-medium { font-size: 14px; }
    &.is-size-large { font-size: 18px; }
    &.is-size-xlarge { font-size: 24px; }

    /* Weight presets */
    &.is-weight-light { font-weight: 300; }
    &.is-weight-normal { font-weight: 400; }
    &.is-weight-medium { font-weight: 500; }
    &.is-weight-semibold { font-weight: 600; }
    &.is-weight-bold { font-weight: 700; }

    /* Alignment */
    &.is-align-left { text-align: left; }
    &.is-align-center { text-align: center; }
    &.is-align-right { text-align: right; }
    &.is-align-justify { text-align: justify; }

    /* Truncation */
    &.is-truncated {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    &.is-truncated-multiline {
        display: -webkit-box;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    /* Clickable state (when onClick write binding is enabled) */
    &.is-clickable {
        cursor: pointer;
        transition: opacity 0.15s ease;
    }

    &.is-clickable:hover {
        opacity: 0.8;
    }

    /* Figma textAutoResize support */
    &.is-auto-width {
        white-space: nowrap;
        overflow: visible;
        width: fit-content !important;
        min-width: 0;
    }

    &.is-auto-height {
        height: auto !important;
        min-height: 0;
        overflow: visible;
    }
}

/* Content wrapper for vertical alignment */
.elemtext-content-wrapper {
    min-height: 0;
}

/* Content area (static HTML) */
.elemtext-widget-root__content {
    h1, h2, h3, h4, h5, h6 { margin: 0; }
    p { margin: 0; }
    p + p { margin-top: 0.75em; }
    img { display: block; max-width: 100%; }
}

/* TiptapEditor deep styles — ::v-deep required for scoped to pierce child components */
.elemtext-widget-root ::v-deep .tiptap-editor {
    font-family: inherit;
    font-size: inherit;
    font-weight: inherit;
    line-height: inherit;
    letter-spacing: inherit;
    text-transform: inherit;
    color: inherit;
    text-align: inherit;
}

.elemtext-widget-root ::v-deep .tiptap-prose {
    font-family: inherit !important;
    font-size: inherit !important;
    font-weight: inherit !important;
    line-height: inherit !important;
    letter-spacing: inherit !important;
    text-transform: inherit !important;
    color: inherit !important;
    text-align: inherit !important;
    outline: none;
}

.elemtext-widget-root ::v-deep .tiptap-prose:focus {
    outline: none;
}

.elemtext-widget-root ::v-deep .tiptap-prose p {
    margin: 0;
    font-size: inherit !important;
    font-weight: inherit !important;
    line-height: inherit !important;
    letter-spacing: inherit !important;
}

.elemtext-widget-root ::v-deep .tiptap-prose p + p {
    margin-top: 0.5em;
}
</style>
