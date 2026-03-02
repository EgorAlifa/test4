/**
 * ElemSticker Descriptor
 *
 * Defines props, metadata, panels, and AI generation hints
 * for the sticky note widget.
 */

import { themeOptions, shadowOptions, colorPresets } from './constants/stickerThemes';
import { priorityOptions } from './constants/priorityLevels';
import { handwritingFontOptions } from './constants/handwritingFonts';
import panels from './panels';

// ═══════════════════════════════════════════════════════════════════════════
// AI METADATA
// ═══════════════════════════════════════════════════════════════════════════

export const aiMeta = {
    name: 'ElemSticker',
    category: 'primitives',
    title: 'Sticker Note',
    aiHint: 'Use for sticky notes, reminders, annotations, quick notes, memos, and post-it style content. Supports inline WYSIWYG editing, 15 pastel color themes, decorative pins/tape, paper effects (lined/grid/dotted), and metadata. Perfect for dashboards needing visual note-taking elements.',
    aiPriority: 3, // eslint-disable-line no-magic-numbers
    aiKeywords: [
        'sticker', 'note', 'sticky', 'reminder', 'memo', 'post-it',
        'annotation', 'comment', 'todo', 'idea', 'handwritten', 'tape'
    ],
    inlineEditing: {
        enabled: true,
        fields: ['html'],
        instructions: 'Click to edit sticker content. Toolbar appears on focus.'
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// PRESETS
// ═══════════════════════════════════════════════════════════════════════════

export const presets = {
    reminder: {
        description: 'Yellow reminder with tape',
        props: {
            stickerTheme: 'yellow',
            showTape: true,
            tapeStyle: 'single',
            useHandwritingFont: true,
            handwritingFont: 'caveat',
            useGradient: true,
            showFoldedCorner: true
        }
    },
    todo: {
        description: 'Blue todo with lined paper',
        props: {
            stickerTheme: 'blue',
            showPin: true,
            showPriority: true,
            priority: 'medium',
            paperStyle: 'lined',
            useGradient: true
        }
    },
    idea: {
        description: 'Green idea with lightbulb',
        props: {
            stickerTheme: 'green',
            html: '<p>💡 Idea:</p>',
            showTape: true,
            tapeStyle: 'washi',
            useHandwritingFont: true,
            handwritingFont: 'indieFlower',
            useGradient: true
        }
    },
    important: {
        description: 'Pink important with priority',
        props: {
            stickerTheme: 'pink',
            showPin: true,
            showPriority: true,
            priority: 'high',
            useGradient: true,
            edgeShadow: true
        }
    },
    note: {
        description: 'White lined paper',
        props: {
            stickerTheme: 'white',
            paperStyle: 'lined',
            showFoldedCorner: true,
            useHandwritingFont: true,
            handwritingFont: 'patrickHand',
            showBorder: true
        }
    },
    urgent: {
        description: 'Coral urgent alert',
        props: {
            stickerTheme: 'coral',
            showTape: true,
            tapeStyle: 'crossed',
            showPriority: true,
            priority: 'urgent',
            useGradient: true
        }
    },
    taped: {
        description: 'Classic taped note',
        props: {
            stickerTheme: 'yellow',
            showTape: true,
            tapeStyle: 'strip',
            paperTexture: 'paper',
            useGradient: true,
            rotation: 2 // eslint-disable-line no-magic-numbers
        }
    },
    minimal: {
        description: 'Clean minimal note',
        props: {
            stickerTheme: 'cream',
            paperStyle: 'plain',
            showBorder: true,
            boxShadow: '1px 2px 4px rgba(0, 0, 0, 0.1)'
        }
    },
    dotGrid: {
        description: 'Dotted grid note',
        props: {
            stickerTheme: 'lavender',
            paperStyle: 'dotted',
            showPin: true,
            useGradient: true
        }
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// EXAMPLES (for AI learning)
// ═══════════════════════════════════════════════════════════════════════════

export const examples = [
    {
        description: 'Simple reminder with tape',
        props: {
            html: '<p>Remember to check Q4 reports!</p>',
            stickerTheme: 'yellow',
            showTape: true,
            tapeStyle: 'single',
            rotation: 2, // eslint-disable-line no-magic-numbers
            useHandwritingFont: true,
            useGradient: true
        }
    },
    {
        description: 'Meeting notes with metadata',
        props: {
            html: '<p><strong>Meeting Notes</strong></p><ul><li>Review budget</li><li>Assign tasks</li></ul>',
            stickerTheme: 'blue',
            showMetadata: true,
            author: 'John D.',
            showPin: true,
            paperStyle: 'lined',
            useGradient: true
        }
    },
    {
        description: 'High priority task',
        props: {
            html: '<p>DEADLINE: Submit proposal by Friday</p>',
            stickerTheme: 'pink',
            showPriority: true,
            priority: 'high',
            showTape: true,
            tapeStyle: 'crossed',
            rotation: -1,
            useGradient: true
        }
    },
    {
        description: 'Idea note with washi tape',
        props: {
            html: '<p>💡 New feature concept</p>',
            stickerTheme: 'mint',
            showTape: true,
            tapeStyle: 'washi',
            useHandwritingFont: true,
            paperTexture: 'paper'
        }
    }
];

// ═══════════════════════════════════════════════════════════════════════════
// VARIABLE BINDINGS (VIBE 2.0)
// ═══════════════════════════════════════════════════════════════════════════

export const varBindings = {
    groups: {
        content: { label: 'Содержимое', icon: 'text', order: 1 },
        appearance: { label: 'Оформление', icon: 'palette', order: 2 },
        metadata: { label: 'Метаданные', icon: 'information-outline', order: 3 }
    },

    listen: {
        // ─────────────────────────────────────────────────────────────────
        // СОДЕРЖИМОЕ
        // ─────────────────────────────────────────────────────────────────
        html: {
            group: 'content',
            label: 'HTML-содержимое',
            description: 'Текст стикера в формате HTML',
            defaultEnabled: false,
            defaultVarName: 'sticker_content'
        },
        placeholder: {
            group: 'content',
            label: 'Плейсхолдер',
            description: 'Текст-подсказка при пустом содержимом',
            defaultEnabled: false,
            defaultVarName: 'sticker_placeholder'
        },

        // ─────────────────────────────────────────────────────────────────
        // ОФОРМЛЕНИЕ
        // ─────────────────────────────────────────────────────────────────
        stickerTheme: {
            group: 'appearance',
            label: 'Тема',
            description: 'Цветовая тема (yellow, pink, blue, green, purple, orange...)',
            defaultEnabled: false,
            defaultVarName: 'sticker_theme'
        },
        stickerColor: {
            group: 'appearance',
            label: 'Цвет фона',
            description: 'Кастомный цвет фона стикера',
            defaultEnabled: false,
            defaultVarName: 'sticker_bg_color'
        },
        textColor: {
            group: 'appearance',
            label: 'Цвет текста',
            description: 'Кастомный цвет текста',
            defaultEnabled: false,
            defaultVarName: 'sticker_text_color'
        },
        showPin: {
            group: 'appearance',
            label: 'Показать булавку',
            description: 'Показывать декоративную булавку',
            defaultEnabled: false,
            defaultVarName: 'sticker_show_pin'
        },
        showTape: {
            group: 'appearance',
            label: 'Показать скотч',
            description: 'Показывать декоративный скотч',
            defaultEnabled: false,
            defaultVarName: 'sticker_show_tape'
        },
        tapeStyle: {
            group: 'appearance',
            label: 'Стиль скотча',
            description: 'Стиль скотча (single, strip, crossed, corner, washi)',
            defaultEnabled: false,
            defaultVarName: 'sticker_tape_style'
        },
        paperStyle: {
            group: 'appearance',
            label: 'Стиль бумаги',
            description: 'Стиль бумаги (standard, lined, grid, dotted, ruled)',
            defaultEnabled: false,
            defaultVarName: 'sticker_paper_style'
        },
        showFoldedCorner: {
            group: 'appearance',
            label: 'Загнутый уголок',
            description: 'Показывать загнутый уголок',
            defaultEnabled: false,
            defaultVarName: 'sticker_folded_corner'
        },
        rotation: {
            group: 'appearance',
            label: 'Поворот',
            description: 'Угол поворота стикера (-10 до 10)',
            defaultEnabled: false,
            defaultVarName: 'sticker_rotation'
        },
        useHandwritingFont: {
            group: 'appearance',
            label: 'Рукописный шрифт',
            description: 'Использовать рукописный шрифт',
            defaultEnabled: false,
            defaultVarName: 'sticker_handwriting'
        },
        handwritingFont: {
            group: 'appearance',
            label: 'Шрифт',
            description: 'Название рукописного шрифта (caveat, indieFlower, patrickHand)',
            defaultEnabled: false,
            defaultVarName: 'sticker_font'
        },
        boxShadow: {
            group: 'appearance',
            label: 'Тень',
            description: 'CSS тень стикера',
            defaultEnabled: false,
            defaultVarName: 'sticker_shadow'
        },
        opacity: {
            group: 'appearance',
            label: 'Прозрачность',
            description: 'Прозрачность стикера (0-1)',
            defaultEnabled: false,
            defaultVarName: 'sticker_opacity'
        },

        // ─────────────────────────────────────────────────────────────────
        // МЕТАДАННЫЕ
        // ─────────────────────────────────────────────────────────────────
        showMetadata: {
            group: 'metadata',
            label: 'Показать метаданные',
            description: 'Показывать секцию метаданных',
            defaultEnabled: false,
            defaultVarName: 'sticker_show_metadata'
        },
        author: {
            group: 'metadata',
            label: 'Автор',
            description: 'Имя автора заметки',
            defaultEnabled: false,
            defaultVarName: 'sticker_author'
        },
        createdAt: {
            group: 'metadata',
            label: 'Дата создания',
            description: 'Дата создания (ISO формат)',
            defaultEnabled: false,
            defaultVarName: 'sticker_created_at'
        },
        modifiedAt: {
            group: 'metadata',
            label: 'Дата изменения',
            description: 'Дата последнего изменения (ISO формат)',
            defaultEnabled: false,
            defaultVarName: 'sticker_modified_at'
        },
        showPriority: {
            group: 'metadata',
            label: 'Показать приоритет',
            description: 'Показывать индикатор приоритета',
            defaultEnabled: false,
            defaultVarName: 'sticker_show_priority'
        },
        priority: {
            group: 'metadata',
            label: 'Приоритет',
            description: 'Уровень приоритета (low, medium, high, urgent)',
            defaultEnabled: false,
            defaultVarName: 'sticker_priority'
        },
        showTags: {
            group: 'metadata',
            label: 'Показать теги',
            description: 'Показывать секцию тегов',
            defaultEnabled: false,
            defaultVarName: 'sticker_show_tags'
        },
        tags: {
            group: 'metadata',
            label: 'Теги',
            description: 'Массив тегов',
            defaultEnabled: false,
            defaultVarName: 'sticker_tags'
        }
    },

    write: {
        onChange: {
            label: 'При изменении содержимого',
            description: 'Записать значение при изменении содержимого стикера',
            defaultVarName: 'sticker_updated_content',
            valueOptions: [
                { value: 'html', label: 'HTML-содержимое' },
                { value: 'text', label: 'Простой текст' }
            ]
        }
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// DESCRIPTOR FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

export function descriptor() {
    return {
        props: {
            // ─────────────────────────────────────────────────────────────────
            // CONTENT
            // ─────────────────────────────────────────────────────────────────
            html: {
                type: String,
                default: '',
                description: 'HTML content of the sticker'
            },
            placeholder: {
                type: String,
                default: 'Нажмите для ввода...',
                description: 'Placeholder text when empty'
            },
            isPlainHTMLShown: {
                type: Boolean,
                default: false,
                description: 'Show raw HTML instead of WYSIWYG editor'
            },

            // ─────────────────────────────────────────────────────────────────
            // STICKER THEME & COLORS
            // ─────────────────────────────────────────────────────────────────
            stickerTheme: {
                type: String,
                default: 'yellow',
                description: 'Predefined color theme',
                options: themeOptions
            },
            stickerColor: {
                type: String,
                default: '',
                description: 'Custom background color (overrides theme)'
            },
            textColor: {
                type: String,
                default: '',
                description: 'Custom text color (overrides theme)'
            },
            useGradient: {
                type: Boolean,
                default: true,
                description: 'Use gradient background for depth'
            },
            showBorder: {
                type: Boolean,
                default: false,
                description: 'Show subtle border'
            },

            // ─────────────────────────────────────────────────────────────────
            // ROTATION
            // ─────────────────────────────────────────────────────────────────
            rotation: {
                type: Number,
                default: 0,
                description: 'Rotation angle in degrees (-10 to 10)'
            },
            rotationRandom: {
                type: Boolean,
                default: false,
                description: 'Apply random slight rotation on mount'
            },

            // ─────────────────────────────────────────────────────────────────
            // PIN DECORATION
            // ─────────────────────────────────────────────────────────────────
            showPin: {
                type: Boolean,
                default: true,
                description: 'Show decorative pushpin'
            },
            pinPosition: {
                type: String,
                default: 'top-center',
                description: 'Pin position',
                options: [
                    { value: 'top-left', label: 'Top Left' },
                    { value: 'top-center', label: 'Top Center' },
                    { value: 'top-right', label: 'Top Right' }
                ]
            },
            pinColor: {
                type: String,
                default: '',
                description: 'Custom pin color (uses theme default if empty)'
            },

            // ─────────────────────────────────────────────────────────────────
            // TAPE DECORATION
            // ─────────────────────────────────────────────────────────────────
            showTape: {
                type: Boolean,
                default: false,
                description: 'Show decorative tape'
            },
            tapeStyle: {
                type: String,
                default: 'single',
                description: 'Tape style',
                options: [
                    { value: 'none', label: 'None' },
                    { value: 'single', label: 'Single Strip' },
                    { value: 'strip', label: 'Wide Strip' },
                    { value: 'crossed', label: 'Crossed' },
                    { value: 'corner', label: 'Corner' },
                    { value: 'washi', label: 'Washi Tape' }
                ]
            },
            tapePosition: {
                type: String,
                default: 'top-center',
                description: 'Tape position',
                options: [
                    { value: 'top-left', label: 'Top Left' },
                    { value: 'top-center', label: 'Top Center' },
                    { value: 'top-right', label: 'Top Right' }
                ]
            },
            tapeColor: {
                type: String,
                default: '',
                description: 'Custom tape color'
            },
            tapeRotation: {
                type: Number,
                default: 0,
                description: 'Tape rotation (-15 to 15)'
            },

            // ─────────────────────────────────────────────────────────────────
            // PAPER STYLE & TEXTURE
            // ─────────────────────────────────────────────────────────────────
            paperStyle: {
                type: String,
                default: 'standard',
                description: 'Paper background pattern',
                options: [
                    { value: 'standard', label: 'Standard' },
                    { value: 'lined', label: 'Lined' },
                    { value: 'grid', label: 'Grid' },
                    { value: 'dotted', label: 'Dotted' },
                    { value: 'ruled', label: 'Ruled (Red Line)' },
                    { value: 'plain', label: 'Plain' }
                ]
            },
            paperTexture: {
                type: String,
                default: 'none',
                description: 'Paper texture overlay',
                options: [
                    { value: 'none', label: 'None' },
                    { value: 'subtle', label: 'Subtle' },
                    { value: 'paper', label: 'Paper' },
                    { value: 'noisy', label: 'Noisy' }
                ]
            },
            showFoldedCorner: {
                type: Boolean,
                default: true,
                description: 'Show folded corner effect'
            },
            foldedCornerPosition: {
                type: String,
                default: 'bottom-right',
                description: 'Folded corner position',
                options: [
                    { value: 'bottom-right', label: 'Bottom Right' },
                    { value: 'bottom-left', label: 'Bottom Left' },
                    { value: 'top-right', label: 'Top Right' },
                    { value: 'top-left', label: 'Top Left' }
                ]
            },
            edgeShadow: {
                type: Boolean,
                default: false,
                description: 'Show lifted paper edge shadow'
            },

            // ─────────────────────────────────────────────────────────────────
            // HANDWRITING FONTS
            // ─────────────────────────────────────────────────────────────────
            useHandwritingFont: {
                type: Boolean,
                default: false,
                description: 'Use handwriting-style font'
            },
            handwritingFont: {
                type: String,
                default: 'caveat',
                description: 'Handwriting font family',
                options: handwritingFontOptions
            },

            // ─────────────────────────────────────────────────────────────────
            // METADATA
            // ─────────────────────────────────────────────────────────────────
            showMetadata: {
                type: Boolean,
                default: true,
                description: 'Show metadata section'
            },
            metadataPosition: {
                type: String,
                default: 'bottom',
                description: 'Metadata position',
                options: [
                    { value: 'top', label: 'Top' },
                    { value: 'bottom', label: 'Bottom' }
                ]
            },
            createdAt: {
                type: String,
                default: '',
                description: 'Creation date (ISO format)'
            },
            modifiedAt: {
                type: String,
                default: '',
                description: 'Last modification date (ISO format)'
            },
            author: {
                type: String,
                default: '',
                description: 'Note author'
            },
            dateFormat: {
                type: String,
                default: 'DD MMM YYYY',
                description: 'Date display format (dayjs)'
            },

            // ─────────────────────────────────────────────────────────────────
            // PRIORITY & TAGS
            // ─────────────────────────────────────────────────────────────────
            showPriority: {
                type: Boolean,
                default: false,
                description: 'Show priority indicator'
            },
            priority: {
                type: String,
                default: '',
                description: 'Priority level',
                options: priorityOptions
            },
            showTags: {
                type: Boolean,
                default: false,
                description: 'Show tags section'
            },
            tags: {
                type: Array,
                default: () => [],
                description: 'List of tags'
            },

            // ─────────────────────────────────────────────────────────────────
            // TYPOGRAPHY
            // ─────────────────────────────────────────────────────────────────
            fontFamily: {
                type: String,
                default: '',
                description: 'Font family (overrides theme/handwriting)'
            },
            fontSize: {
                type: [String, Object],
                default: '14px', // eslint-disable-line no-magic-numbers
                description: 'Font size'
            },
            fontWeight: {
                type: [String, Number],
                default: 400, // eslint-disable-line no-magic-numbers
                description: 'Font weight'
            },
            lineHeight: {
                type: [String, Number],
                default: 1.5, // eslint-disable-line no-magic-numbers
                description: 'Line height'
            },
            textAlign: {
                type: String,
                default: 'left',
                description: 'Text alignment'
            },

            // ─────────────────────────────────────────────────────────────────
            // SPACING & SIZING
            // ─────────────────────────────────────────────────────────────────
            padding: {
                type: [String, Object],
                default: '16px', // eslint-disable-line no-magic-numbers
                description: 'Inner padding'
            },
            minHeight: {
                type: [String, Object],
                default: '60px', // eslint-disable-line no-magic-numbers
                description: 'Minimum height'
            },
            minWidth: {
                type: [String, Object],
                default: '',
                description: 'Minimum width'
            },
            maxWidth: {
                type: [String, Object],
                default: '',
                description: 'Maximum width'
            },
            aspectRatio: {
                type: String,
                default: '',
                description: 'Aspect ratio (e.g., "1 / 1" for square, "4 / 3" for wide)'
            },

            // ─────────────────────────────────────────────────────────────────
            // BORDER & EFFECTS
            // ─────────────────────────────────────────────────────────────────
            borderRadius: {
                type: [String, Object],
                default: '2px', // eslint-disable-line no-magic-numbers
                description: 'Corner radius'
            },
            boxShadow: {
                type: String,
                default: '2px 4px 8px rgba(0, 0, 0, 0.15)',
                description: 'Box shadow',
                options: shadowOptions
            },
            opacity: {
                type: [String, Number],
                default: 1,
                description: 'Opacity (0-1)'
            },

            // ─────────────────────────────────────────────────────────────────
            // FIGMA PARITY (optional)
            // ─────────────────────────────────────────────────────────────────
            fills: {
                type: Array,
                default: () => [],
                description: 'Figma-style fill layers'
            },
            strokes: {
                type: Array,
                default: () => [],
                description: 'Figma-style stroke layers'
            },
            effects: {
                type: Array,
                default: () => [],
                description: 'Figma-style effects (shadows, blur)'
            },

            // ─────────────────────────────────────────────────────────────────
            // VIBE 2.0
            // ─────────────────────────────────────────────────────────────────
            varBindings: {
                type: Object,
                default: () => ({}),
                description: 'Variable binding configuration'
            }
        },

        vars: {},

        events: {
            change: {
                description: 'Emitted when content changes',
                payload: { html: 'string' }
            }
        },

        varBindings
    };
}

// ═══════════════════════════════════════════════════════════════════════════
// META EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export { colorPresets };

export const meta = {
    descriptor,
    panels,
    aiMeta,
    presets,
    examples,
    varBindings,
    slotNames: ['default']
};

export default descriptor;
