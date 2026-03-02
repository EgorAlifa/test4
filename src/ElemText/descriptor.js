/**
 * ElemText Descriptor — VIBE 2.0 Prototype
 *
 * This descriptor demonstrates the new AI-first architecture:
 * - aiMeta with aiHint, aiPriority, aiKeywords for AI generation
 * - presets for quick AI-generated configurations
 * - examples for AI learning
 * - Platform-compatible cssVars format
 */

import panels from './panels';
import { cssVars } from './styles/css-vars';

// ═══════════════════════════════════════════════════════════════════════════
// AI METADATA — For AI generation and documentation (VIBE 2.0 extension)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * AI-specific metadata for intelligent widget selection and configuration
 */
export const aiMeta = {
    name: 'ElemText',
    title: 'Text',
    description: 'Display and edit text or HTML content with inline formatting',
    category: 'primitives',
    icon: 'text',

    // AI hints for widget selection
    aiHint: 'Use for displaying static text, headings, descriptions, paragraphs, or rich HTML content. Supports inline editing with formatting toolbar.',
    aiPriority: 5,  // Very commonly used (1-5 scale)
    aiKeywords: ['text', 'html', 'heading', 'paragraph', 'title', 'description', 'content', 'label', 'rich text'],
    aiAvoid: 'Do not use for interactive input fields (use ElemWowForm). Do not use for KPI values (use ElemKPI). Do not use for links that navigate (use ElemLink).',

    // Inline editing configuration
    inlineEditing: {
        enabled: true,
        fields: ['html'],
        toolbar: ['bold', 'italic', 'underline', 'strikethrough', 'color', 'highlight', 'link'],
        toolbarPosition: 'top',
        showOn: 'focus',
        placeholder: 'Click to edit text...'
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// PRESETS — Ready-to-use configurations for AI (VIBE 2.0 extension)
// ═══════════════════════════════════════════════════════════════════════════

export const presets = {
    heading: {
        description: 'Large page heading',
        props: { tag: 'h1', size: 'xlarge', weight: 'bold' }
    },
    sectionTitle: {
        description: 'Section title with medium size',
        props: { tag: 'h2', size: 'large', weight: 'semibold' }
    },
    body: {
        description: 'Regular body text paragraph',
        props: { tag: 'p', size: 'medium', weight: 'normal' }
    },
    caption: {
        description: 'Small caption or helper text',
        props: { tag: 'span', size: 'small', weight: 'normal' }
    },
    centeredTitle: {
        description: 'Centered page or card title',
        props: { tag: 'h2', size: 'large', weight: 'semibold', textAlign: 'center' }
    },
    label: {
        description: 'Static label text',
        props: { tag: 'span', size: 'small', weight: 'medium' }
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// EXAMPLES — Full configurations for AI learning (VIBE 2.0 extension)
// ═══════════════════════════════════════════════════════════════════════════

export const examples = [
    {
        description: 'Dashboard page title',
        config: { type: 'ElemText', preset: 'heading', props: { html: 'Sales Dashboard' } }
    },
    {
        description: 'Card section header',
        config: { type: 'ElemText', preset: 'sectionTitle', props: { html: 'Revenue Overview' } }
    },
    {
        description: 'Descriptive paragraph',
        config: { type: 'ElemText', preset: 'body', props: { html: 'This dashboard shows real-time metrics.' } }
    },
    {
        description: 'Footer caption',
        config: { type: 'ElemText', preset: 'caption', props: { html: 'Last updated: 2 minutes ago' } }
    }
];

// ═══════════════════════════════════════════════════════════════════════════
// VARIABLE BINDINGS — VIBE 2.0 cross-widget communication
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Variable bindings configuration for connecting widget properties
 * to IDP global store variables.
 *
 * Structure:
 * - groups: UI grouping for VariablesPanel
 * - listen: Properties that can read from variables (incoming)
 * - write: Actions that can write to variables (outgoing)
 */
export const varBindings = {
    // ─────────────────────────────────────────────────────────────────────
    // GROUPS — UI organization for VariablesPanel
    // ─────────────────────────────────────────────────────────────────────
    groups: {
        content: {
            label: 'Содержимое',
            icon: 'text',
            collapsed: false,
            order: 1
        },
        typography: {
            label: 'Типографика',
            icon: 'format-font',
            collapsed: true,
            order: 2
        },
        style: {
            label: 'Оформление',
            icon: 'palette',
            collapsed: true,
            order: 3
        },
        appearance: {
            label: 'Внешний вид',
            icon: 'eye',
            collapsed: true,
            order: 4
        },
        fill: {
            label: 'Заливка',
            icon: 'format-color-fill',
            collapsed: true,
            order: 5
        },
        stroke: {
            label: 'Обводка',
            icon: 'border-color',
            collapsed: true,
            order: 6
        },
        effects: {
            label: 'Эффекты',
            icon: 'blur',
            collapsed: true,
            order: 7
        }
    },

    // ─────────────────────────────────────────────────────────────────────
    // LISTEN — Properties that read from variables (incoming)
    // ─────────────────────────────────────────────────────────────────────
    listen: {
        // Content group
        html: {
            group: 'content',
            label: 'Текст',
            defaultEnabled: true,
            defaultVarName: 'text-content-value'
        },
        placeholder: {
            group: 'content',
            label: 'Placeholder',
            defaultEnabled: false,
            defaultVarName: 'text-content-placeholder'
        },

        // Typography group
        color: {
            group: 'typography',
            label: 'Цвет текста',
            defaultEnabled: false,
            defaultVarName: 'text-typo-color'
        },
        fontSize: {
            group: 'typography',
            label: 'Размер шрифта',
            defaultEnabled: false,
            defaultVarName: 'text-typo-font-size'
        },
        fontWeight: {
            group: 'typography',
            label: 'Насыщенность',
            defaultEnabled: false,
            defaultVarName: 'text-typo-font-weight'
        },
        fontFamily: {
            group: 'typography',
            label: 'Шрифт',
            defaultEnabled: false,
            defaultVarName: 'text-typo-font-family'
        },
        textAlign: {
            group: 'typography',
            label: 'Выравнивание',
            defaultEnabled: false,
            defaultVarName: 'text-typo-align'
        },
        lineHeight: {
            group: 'typography',
            label: 'Высота строки',
            defaultEnabled: false,
            defaultVarName: 'text-typo-line-height'
        },
        letterSpacing: {
            group: 'typography',
            label: 'Межбуквенный интервал',
            defaultEnabled: false,
            defaultVarName: 'text-typo-letter-spacing'
        },
        textTransform: {
            group: 'typography',
            label: 'Преобразование',
            defaultEnabled: false,
            defaultVarName: 'text-typo-transform'
        },

        // Style group
        backgroundColor: {
            group: 'style',
            label: 'Цвет фона',
            defaultEnabled: false,
            defaultVarName: 'text-style-bg-color'
        },
        borderColor: {
            group: 'style',
            label: 'Цвет границы',
            defaultEnabled: false,
            defaultVarName: 'text-style-border-color'
        },
        borderWidth: {
            group: 'style',
            label: 'Толщина границы',
            defaultEnabled: false,
            defaultVarName: 'text-style-border-width'
        },
        borderRadius: {
            group: 'style',
            label: 'Скругление',
            defaultEnabled: false,
            defaultVarName: 'text-style-border-radius'
        },
        padding: {
            group: 'style',
            label: 'Внутренний отступ',
            defaultEnabled: false,
            defaultVarName: 'text-style-padding'
        },
        margin: {
            group: 'style',
            label: 'Внешний отступ',
            defaultEnabled: false,
            defaultVarName: 'text-style-margin'
        },

        // Appearance group (Figma-parity)
        opacity: {
            group: 'appearance',
            label: 'Прозрачность',
            defaultEnabled: false,
            defaultVarName: 'text-appearance-opacity'
        },

        // Fill group (Figma-parity)
        fillColor: {
            group: 'fill',
            label: 'Цвет заливки',
            defaultEnabled: false,
            defaultVarName: 'text-fill-color'
        },
        fillOpacity: {
            group: 'fill',
            label: 'Прозрачность заливки',
            defaultEnabled: false,
            defaultVarName: 'text-fill-opacity'
        },

        // Stroke group (Figma-parity)
        strokeColor: {
            group: 'stroke',
            label: 'Цвет обводки',
            defaultEnabled: false,
            defaultVarName: 'text-stroke-color'
        },
        strokeWeight: {
            group: 'stroke',
            label: 'Толщина обводки',
            defaultEnabled: false,
            defaultVarName: 'text-stroke-weight'
        },
        strokeStyle: {
            group: 'stroke',
            label: 'Стиль обводки',
            defaultEnabled: false,
            defaultVarName: 'text-stroke-style'
        },
        strokeOpacity: {
            group: 'stroke',
            label: 'Прозрачность обводки',
            defaultEnabled: false,
            defaultVarName: 'text-stroke-opacity'
        },
        strokeDasharray: {
            group: 'stroke',
            label: 'Паттерн штриха',
            defaultEnabled: false,
            defaultVarName: 'text-stroke-dasharray'
        },

        // Effects group
        boxShadow: {
            group: 'effects',
            label: 'Тень блока',
            defaultEnabled: false,
            defaultVarName: 'text-effects-box-shadow'
        },
        textShadow: {
            group: 'effects',
            label: 'Тень текста',
            defaultEnabled: false,
            defaultVarName: 'text-effects-text-shadow'
        },
        blur: {
            group: 'effects',
            label: 'Размытие',
            defaultEnabled: false,
            defaultVarName: 'text-effects-blur'
        },
        backdropBlur: {
            group: 'effects',
            label: 'Размытие фона',
            defaultEnabled: false,
            defaultVarName: 'text-effects-backdrop-blur'
        }
    },

    // ─────────────────────────────────────────────────────────────────────
    // WRITE — Actions that write to variables (outgoing)
    // ─────────────────────────────────────────────────────────────────────
    write: {
        onClick: {
            label: 'По клику на текст',
            icon: 'cursor-default-click',
            defaultVarName: 'text-action-click',
            valueOptions: [
                { value: 'html', label: 'Текст' },
                { value: 'id', label: 'ID виджета' },
                { value: 'custom', label: 'Своё значение' }
            ]
        }
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// DESCRIPTOR — Platform-compatible format (function returning props)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * @description Don't change `descriptor` exported name
 * @return {ElemDescriptor}
 */
export const descriptor = () => ({
    props: {
        // Content
        html: {
            type: String,
            default: 'Текст...',
            hasConst: true
        },
        // Editor mode flag - switch between WYSIWYG and plain HTML editing
        isPlainHTMLShown: {
            type: Boolean,
            default: false
        },
        tag: {
            type: String,
            default: 'div'
        },

        // Design System
        designSystem: {
            type: String,
            default: 'insight'  // 'insight', 'apple', 'material', 'custom'
        },

        // Appearance - Typography
        textAlign: {
            type: String,
            default: 'left'
        },
        size: {
            type: String,
            default: 'medium'
        },
        weight: {
            type: String,
            default: 'normal'
        },
        color: {
            type: String,
            default: ''
        },
        fontSize: {
            type: [String, Object],
            default: ''
        },
        fontWeight: {
            type: [String, Number],
            default: ''
        },
        fontFamily: {
            type: String,
            default: ''
        },
        lineHeight: {
            type: [String, Object],
            default: ''
        },
        letterSpacing: {
            type: [String, Object],
            default: ''
        },
        textTransform: {
            type: String,
            default: ''
        },
        textShadow: {
            type: String,
            default: ''
        },
        textDecoration: {
            type: String,
            default: ''  // 'none', 'underline', 'line-through', 'underline line-through'
        },
        truncate: {
            type: [Boolean, Number],
            default: false
        },

        // Appearance - Colors (Designer Panel)
        backgroundColor: {
            type: String,
            default: ''
        },
        linkColor: {
            type: String,
            default: ''
        },
        linkHoverColor: {
            type: String,
            default: ''
        },

        // Appearance - Spacing (Designer Panel)
        padding: {
            type: String,
            default: ''
        },
        margin: {
            type: String,
            default: ''
        },

        // Appearance - Border (Designer Panel)
        borderColor: {
            type: String,
            default: ''
        },
        borderWidth: {
            type: [String, Object],
            default: ''
        },
        borderStyle: {
            type: String,
            default: ''
        },
        borderRadius: {
            type: [String, Object],
            default: ''
        },

        // Appearance - Effects (Designer Panel)
        boxShadow: {
            type: String,
            default: ''
        },
        opacity: {
            type: [String, Number],
            default: ''
        },

        // ═══════════════════════════════════════════════════════════════════
        // FIGMA-PARITY PROPS
        // ═══════════════════════════════════════════════════════════════════

        // Vertical alignment (requires flex wrapper)
        verticalAlign: {
            type: String,
            default: 'top'  // 'top' | 'middle' | 'bottom'
        },

        // Simple fill props (for ui-input-cp compatibility)
        fillColor: {
            type: String,
            default: ''
        },
        fillOpacity: {
            type: [String, Number],
            default: 1
        },

        // Simple stroke props (for ui-input-cp compatibility)
        strokeColor: {
            type: String,
            default: ''
        },
        strokeWidth: {
            type: [String, Number],
            default: ''
        },
        strokePosition: {
            type: String,
            default: 'inside'  // 'inside' | 'outside' | 'center'
        },
        // Stroke style (Figma-parity)
        strokeStyle: {
            type: String,
            default: 'solid'  // 'solid' | 'dashed' | 'dotted' | 'double'
        },
        // Stroke opacity (separate from color for finer control)
        strokeOpacity: {
            type: [String, Number],
            default: 1  // 0-1
        },
        // Line cap (for SVG rendering and future canvas support)
        strokeLinecap: {
            type: String,
            default: 'butt'  // 'butt' | 'round' | 'square'
        },
        // Line join (for corners)
        strokeLinejoin: {
            type: String,
            default: 'miter'  // 'miter' | 'bevel' | 'round'
        },
        // Dash pattern (e.g., '5,5' or '10,5,2,5')
        strokeDasharray: {
            type: String,
            default: ''
        },
        // Dash offset
        strokeDashoffset: {
            type: [String, Number],
            default: 0
        },

        // Fills (array for multiple fills like in Figma)
        // Each fill: { type: 'solid'|'linear-gradient'|'radial-gradient', color, opacity, visible, gradient }
        fills: {
            type: Array,
            default: () => []
        },

        // Strokes (array for multiple strokes like in Figma)
        // Each stroke: { color, opacity, weight, position: 'inside'|'outside'|'center', visible }
        strokes: {
            type: Array,
            default: () => []
        },

        // Effects (array for multiple effects like in Figma)
        // Each effect: { type: 'drop-shadow'|'inner-shadow'|'layer-blur'|'background-blur', enabled, ...params }
        effects: {
            type: Array,
            default: () => []
        },

        // ═══════════════════════════════════════════════════════════════════
        // FIGMA TEXT AUTO-RESIZE
        // Matches Figma's textAutoResize property for proper text sizing
        // ═══════════════════════════════════════════════════════════════════
        textAutoResize: {
            type: String,
            default: 'NONE'  // 'NONE' | 'WIDTH_AND_HEIGHT' | 'HEIGHT'
        },

        // Behavior
        editable: {
            type: Boolean,
            default: true
        },
        selectable: {
            type: Boolean,
            default: true
        },

        // Inline editing placeholder
        placeholder: {
            type: String,
            default: 'Click to edit text...'
        },

        // Variable bindings state (VIBE 2.0)
        // Stores the current configuration of variable bindings
        varBindings: {
            type: Object,
            default: () => ({
                listen: {},
                write: {}
            })
        }
    },
    // Required: vars object for store variables
    vars: {},
    // Required: events object for event bus
    events: {},
    // Variable bindings schema (VIBE 2.0)
    varBindings
});

// ═══════════════════════════════════════════════════════════════════════════
// META — Combined export for platform
// ═══════════════════════════════════════════════════════════════════════════

export const meta = {
    descriptor,
    panels,
    cssVars,
    // VIBE 2.0 extensions (not used by platform core, but available)
    aiMeta,
    presets,
    examples,
    varBindings,
    slotNames: ['default']
};

export default descriptor;
