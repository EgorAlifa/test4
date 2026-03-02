<template>
    <div
        class="tiptap-editor"
        :class="{ 'is-focused': isFocused, 'is-empty': isEmpty }"
        @click="handleContainerClick"
    >
        <!-- Toolbar (shown on focus) -->
        <div
            v-if="editor && isFocused"
            class="tiptap-toolbar"
            :class="`tiptap-toolbar--${theme}`"
            @mousedown="handleToolbarMousedown"
            @mouseup="handleToolbarMouseup"
        >
            <!-- Row 1: History, Headings, Text formatting -->
            <div class="tiptap-toolbar__row">
                <!-- Undo/Redo -->
                <button
                    type="button"
                    :disabled="!editor.can().undo()"
                    @mousedown.prevent="editor.chain().focus().undo().run()"
                    title="Undo"
                >
                    <i class="mdi mdi-undo" />
                </button>
                <button
                    type="button"
                    :disabled="!editor.can().redo()"
                    @mousedown.prevent="editor.chain().focus().redo().run()"
                    title="Redo"
                >
                    <i class="mdi mdi-redo" />
                </button>

                <span class="tiptap-toolbar__divider" />

                <!-- Headings -->
                <button
                    type="button"
                    :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }"
                    @mousedown.prevent="editor.chain().focus().toggleHeading({ level: 1 }).run()"
                    title="Heading 1"
                >
                    <span class="tiptap-toolbar__text">H1</span>
                </button>
                <button
                    type="button"
                    :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }"
                    @mousedown.prevent="editor.chain().focus().toggleHeading({ level: 2 }).run()"
                    title="Heading 2"
                >
                    <span class="tiptap-toolbar__text">H2</span>
                </button>
                <button
                    type="button"
                    :class="{ 'is-active': editor.isActive('heading', { level: 3 }) }"
                    @mousedown.prevent="editor.chain().focus().toggleHeading({ level: 3 }).run()"
                    title="Heading 3"
                >
                    <span class="tiptap-toolbar__text">H3</span>
                </button>

                <span class="tiptap-toolbar__divider" />

                <!-- Text formatting -->
                <button
                    type="button"
                    :class="{ 'is-active': editor.isActive('bold') }"
                    @mousedown.prevent="editor.chain().focus().toggleBold().run()"
                    title="Bold"
                >
                    <i class="mdi mdi-format-bold" />
                </button>
                <button
                    type="button"
                    :class="{ 'is-active': editor.isActive('italic') }"
                    @mousedown.prevent="editor.chain().focus().toggleItalic().run()"
                    title="Italic"
                >
                    <i class="mdi mdi-format-italic" />
                </button>
                <button
                    type="button"
                    :class="{ 'is-active': editor.isActive('underline') }"
                    @mousedown.prevent="editor.chain().focus().toggleUnderline().run()"
                    title="Underline"
                >
                    <i class="mdi mdi-format-underline" />
                </button>
                <button
                    type="button"
                    :class="{ 'is-active': editor.isActive('strike') }"
                    @mousedown.prevent="editor.chain().focus().toggleStrike().run()"
                    title="Strikethrough"
                >
                    <i class="mdi mdi-format-strikethrough" />
                </button>
                <button
                    type="button"
                    :class="{ 'is-active': editor.isActive('code') }"
                    @mousedown.prevent="editor.chain().focus().toggleCode().run()"
                    title="Inline Code"
                >
                    <i class="mdi mdi-code-tags" />
                </button>

                <span class="tiptap-toolbar__divider" />

                <!-- Colors -->
                <div class="tiptap-toolbar__color-group">
                    <input
                        type="color"
                        class="tiptap-color-picker"
                        :value="currentTextColor"
                        @input="handleColorChange"
                        title="Text Color"
                    />
                    <span class="tiptap-toolbar__color-label">A</span>
                </div>
                <div class="tiptap-toolbar__color-group">
                    <input
                        type="color"
                        class="tiptap-color-picker"
                        :value="currentHighlightColor"
                        @input="handleHighlightChange"
                        title="Highlight Color"
                    />
                    <i class="mdi mdi-marker tiptap-toolbar__color-icon" />
                </div>
            </div>

            <!-- Row 2: Font size, Alignment, Lists, Blockquote, Link, Clear -->
            <div class="tiptap-toolbar__row">
                <!-- Font size -->
                <button
                    type="button"
                    @mousedown.prevent="decreaseFontSize"
                    title="Decrease font size"
                >
                    <i class="mdi mdi-format-font-size-decrease" />
                </button>
                <span class="tiptap-toolbar__font-size">{{ currentFontSize }}</span>
                <button
                    type="button"
                    @mousedown.prevent="increaseFontSize"
                    title="Increase font size"
                >
                    <i class="mdi mdi-format-font-size-increase" />
                </button>

                <span class="tiptap-toolbar__divider" />

                <!-- Alignment -->
                <button
                    type="button"
                    :class="{ 'is-active': editor.isActive({ textAlign: 'left' }) }"
                    @mousedown.prevent="editor.chain().focus().setTextAlign('left').run()"
                    title="Align Left"
                >
                    <i class="mdi mdi-format-align-left" />
                </button>
                <button
                    type="button"
                    :class="{ 'is-active': editor.isActive({ textAlign: 'center' }) }"
                    @mousedown.prevent="editor.chain().focus().setTextAlign('center').run()"
                    title="Align Center"
                >
                    <i class="mdi mdi-format-align-center" />
                </button>
                <button
                    type="button"
                    :class="{ 'is-active': editor.isActive({ textAlign: 'right' }) }"
                    @mousedown.prevent="editor.chain().focus().setTextAlign('right').run()"
                    title="Align Right"
                >
                    <i class="mdi mdi-format-align-right" />
                </button>

                <span class="tiptap-toolbar__divider" />

                <!-- Lists -->
                <button
                    type="button"
                    :class="{ 'is-active': editor.isActive('bulletList') }"
                    @mousedown.prevent="editor.chain().focus().toggleBulletList().run()"
                    title="Bullet List"
                >
                    <i class="mdi mdi-format-list-bulleted" />
                </button>
                <button
                    type="button"
                    :class="{ 'is-active': editor.isActive('orderedList') }"
                    @mousedown.prevent="editor.chain().focus().toggleOrderedList().run()"
                    title="Numbered List"
                >
                    <i class="mdi mdi-format-list-numbered" />
                </button>

                <span class="tiptap-toolbar__divider" />

                <!-- Blockquote -->
                <button
                    type="button"
                    :class="{ 'is-active': editor.isActive('blockquote') }"
                    @mousedown.prevent="editor.chain().focus().toggleBlockquote().run()"
                    title="Quote"
                >
                    <i class="mdi mdi-format-quote-close" />
                </button>

                <!-- Link -->
                <button
                    type="button"
                    :class="{ 'is-active': editor.isActive('link') }"
                    @mousedown.prevent="handleLinkClick"
                    title="Link"
                >
                    <i class="mdi mdi-link" />
                </button>

                <span class="tiptap-toolbar__divider" />

                <!-- Clear formatting -->
                <button
                    type="button"
                    @mousedown.prevent="clearFormatting"
                    title="Clear Formatting"
                >
                    <i class="mdi mdi-format-clear" />
                </button>
            </div>
        </div>

        <editor-content :editor="editor" class="tiptap-editor__content" />
    </div>
</template>

<script>
/**
 * TiptapEditor - Full-featured inline editor for ElemText
 *
 * Features:
 * - Undo/Redo
 * - Headings (H1, H2, H3)
 * - Text formatting (Bold, Italic, Underline, Strike, Code)
 * - Font size adjustment
 * - Text alignment
 * - Lists (bullet, numbered)
 * - Blockquote
 * - Links
 * - Text color & highlight
 * - Clear formatting
 */

import { Editor, EditorContent } from '@tiptap/vue-2';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import FontSize from './extensions/FontSize';

const DEFAULT_FONT_SIZE = 16; // eslint-disable-line no-magic-numbers
const FONT_SIZE_STEP = 2; // eslint-disable-line no-magic-numbers
const MIN_FONT_SIZE = 8; // eslint-disable-line no-magic-numbers
const MAX_FONT_SIZE = 72; // eslint-disable-line no-magic-numbers

export default {
    name: 'TiptapEditor',

    components: {
        EditorContent
    },

    props: {
        value: {
            type: String,
            default: ''
        },
        placeholder: {
            type: String,
            default: 'Click to edit...'
        },
        autofocus: {
            type: [Boolean, String],
            default: 'end'
        },
        theme: {
            type: String,
            default: 'light',
            validator: val => ['light', 'dark'].includes(val)
        }
    },

    data() {
        return {
            editor: null,
            isFocused: false,
            isToolbarInteraction: false,
            blurTimeout: null
        };
    },

    computed: {
        isEmpty() {
            return this.editor ? this.editor.isEmpty : true;
        },

        currentTextColor() {
            if (!this.editor) return '#000000';
            const color = this.editor.getAttributes('textStyle').color;
            return color || '#000000';
        },

        currentHighlightColor() {
            if (!this.editor) return '#ffff00';
            const highlight = this.editor.getAttributes('highlight').color;
            return highlight || '#ffff00';
        },

        currentFontSize() {
            if (!this.editor) return DEFAULT_FONT_SIZE;
            const fontSize = this.editor.getAttributes('textStyle').fontSize;
            return fontSize ? parseInt(fontSize, 10) : DEFAULT_FONT_SIZE;
        }
    },

    watch: {
        value(val) {
            if (this.editor && val !== this.editor.getHTML()) {
                this.editor.commands.setContent(val, false);
            }
        }
    },

    mounted() {
        this.initEditor();
    },

    beforeDestroy() {
        if (this.editor) {
            this.editor.destroy();
        }
    },

    methods: {
        initEditor() {
            this.editor = new Editor({
                extensions: [
                    StarterKit.configure({
                        heading: {
                            levels: [1, 2, 3] // eslint-disable-line no-magic-numbers
                        }
                    }),
                    Underline,
                    Link.configure({
                        openOnClick: false,
                        HTMLAttributes: {
                            target: '_blank',
                            rel: 'noopener noreferrer'
                        }
                    }),
                    TextAlign.configure({
                        types: ['heading', 'paragraph']
                    }),
                    TextStyle,
                    FontSize,
                    Color,
                    Highlight.configure({
                        multicolor: true
                    }),
                    Placeholder.configure({
                        placeholder: this.placeholder
                    })
                ],
                content: this.value,
                autofocus: this.autofocus,
                editorProps: {
                    attributes: {
                        class: 'tiptap-prose'
                    }
                },
                onUpdate: ({ editor }) => {
                    this.$emit('input', editor.getHTML());
                    this.$emit('change', editor.getHTML());
                },
                onFocus: () => {
                    clearTimeout(this.blurTimeout);
                    this.isFocused = true;
                    this.$emit('focus');
                },
                onBlur: () => {
                    // Delay blur to allow toolbar interactions (color picker, etc.)
                    this.blurTimeout = setTimeout(() => {
                        if (!this.isToolbarInteraction) {
                            this.isFocused = false;
                            this.$emit('blur');
                        }
                    }, 200); // eslint-disable-line no-magic-numbers
                }
            });
        },

        handleContainerClick(event) {
            if (this.editor && !this.isFocused) {
                this.editor.commands.focus('end');
            }
        },

        handleLinkClick() {
            const previousUrl = this.editor.getAttributes('link').href;
            // eslint-disable-next-line no-alert
            const url = window.prompt('Enter URL:', previousUrl || 'https://');

            if (url === null) {
                return;
            }

            if (url === '') {
                this.editor.chain().focus().extendMarkRange('link').unsetLink().run();
                return;
            }

            this.editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
        },

        handleToolbarMousedown() {
            this.isToolbarInteraction = true;
        },

        handleToolbarMouseup() {
            this.isToolbarInteraction = false;
            // Refocus editor after toolbar interaction
            this.$nextTick(() => {
                this.editor?.commands.focus();
            });
        },

        handleColorChange(event) {
            this.isToolbarInteraction = false;
            this.editor.chain().focus().setColor(event.target.value).run();
        },

        handleHighlightChange(event) {
            this.isToolbarInteraction = false;
            this.editor.chain().focus().setHighlight({ color: event.target.value }).run();
        },

        increaseFontSize() {
            const newSize = Math.min(this.currentFontSize + FONT_SIZE_STEP, MAX_FONT_SIZE);
            this.editor.chain().focus().setFontSize(`${newSize}px`).run();
        },

        decreaseFontSize() {
            const newSize = Math.max(this.currentFontSize - FONT_SIZE_STEP, MIN_FONT_SIZE);
            this.editor.chain().focus().setFontSize(`${newSize}px`).run();
        },

        clearFormatting() {
            this.editor
                .chain()
                .focus()
                .unsetAllMarks()  // Remove bold, italic, color, etc.
                .clearNodes()     // Convert headings/lists to paragraphs
                .run();
        },

        focus() {
            if (this.editor) {
                this.editor.commands.focus('end');
            }
        },

        blur() {
            if (this.editor) {
                this.editor.commands.blur();
            }
        }
    }
};
</script>

<style lang="postcss">
/* TiptapEditor styles */
.tiptap-editor {
    position: relative;
    min-height: 1em;
    cursor: text;

    &__content {
        outline: none;

        .tiptap-prose {
            outline: none;

            &:focus {
                outline: none;
            }

            p {
                margin: 0;

                & + p {
                    margin-top: 0.5em;
                }
            }

            h1, h2, h3 {
                margin: 0 0 0.5em 0;
                font-weight: 600;
            }

            h1 { font-size: 2em; }
            h2 { font-size: 1.5em; }
            h3 { font-size: 1.25em; }

            a {
                color: var(--primary-color, #1976d2);
                text-decoration: underline;
                cursor: pointer;
            }

            ul, ol {
                padding-left: 1.5em;
                margin: 0.5em 0;
                list-style-position: outside;
            }

            li {
                display: list-item;

                p {
                    display: inline;
                }
            }

            blockquote {
                margin: 0.5em 0;
                padding-left: 1em;
                border-left: 3px solid #ccc;
                color: #666;
            }

            code {
                background: rgba(0, 0, 0, 0.1);
                padding: 0.1em 0.3em;
                border-radius: 3px;
                font-family: monospace;
                font-size: 0.9em;
            }

            p.is-editor-empty:first-child::before {
                content: attr(data-placeholder);
                float: left;
                color: rgba(0, 0, 0, 0.4);
                font-style: italic;
                pointer-events: none;
                height: 0;
            }
        }
    }
}

/* Toolbar base */
.tiptap-toolbar {
    position: absolute;
    bottom: 100%;
    left: 0;
    margin-bottom: 8px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 6px 8px;
    border-radius: 6px;
    z-index: 1000;

    &__row {
        display: flex;
        align-items: center;
        gap: 2px;
        white-space: nowrap;
    }

    button {
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 28px;
        height: 28px;
        padding: 0 4px;
        background: transparent;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.15s;

        &:disabled {
            opacity: 0.4;
            cursor: not-allowed;
        }

        i {
            font-size: 18px;
        }
    }

    &__divider {
        width: 1px;
        height: 20px;
        margin: 0 4px;
    }

    &__text {
        font-size: 12px;
        font-weight: 600;
    }

    &__font-size {
        min-width: 28px;
        text-align: center;
        font-size: 11px;
    }

    &__color-group {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
    }

    &__color-label {
        position: absolute;
        font-size: 14px;
        font-weight: 700;
        pointer-events: none;
    }

    &__color-icon {
        position: absolute;
        font-size: 14px;
        pointer-events: none;
    }

    /* Light theme (default) */
    &--light {
        background: #ffffff;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
        border: 1px solid rgba(0, 0, 0, 0.1);

        button {
            color: #333;

            &:hover:not(:disabled) {
                background: rgba(0, 0, 0, 0.08);
            }

            &.is-active {
                background: rgba(0, 0, 0, 0.12);
                color: #1976d2;
            }
        }

        .tiptap-toolbar__divider {
            background: rgba(0, 0, 0, 0.15);
        }

        .tiptap-toolbar__font-size {
            color: #666;
        }

        .tiptap-toolbar__color-group {
            background: transparent;
            border-radius: 4px;

            &:hover {
                background: rgba(0, 0, 0, 0.08);
            }
        }

        .tiptap-toolbar__color-label {
            color: #333;
            text-shadow:
                -1px -1px 0 #fff,
                1px -1px 0 #fff,
                -1px 1px 0 #fff,
                1px 1px 0 #fff;
        }

        .tiptap-toolbar__color-icon {
            color: #333;
            text-shadow:
                -1px -1px 0 #fff,
                1px -1px 0 #fff,
                -1px 1px 0 #fff,
                1px 1px 0 #fff;
        }

        .tiptap-color-picker {
            border-color: rgba(0, 0, 0, 0.2);
        }
    }

    /* Dark theme */
    &--dark {
        background: #1a1a1a;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);

        button {
            color: #fff;

            &:hover:not(:disabled) {
                background: rgba(255, 255, 255, 0.1);
            }

            &.is-active {
                background: rgba(255, 255, 255, 0.2);
                color: #4fc3f7;
            }
        }

        .tiptap-toolbar__divider {
            background: rgba(255, 255, 255, 0.2);
        }

        .tiptap-toolbar__font-size {
            color: #aaa;
        }

        .tiptap-toolbar__color-label {
            color: #fff;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
        }

        .tiptap-toolbar__color-icon {
            color: #fff;
        }

        .tiptap-color-picker {
            border-color: rgba(255, 255, 255, 0.3);
        }
    }
}

/* Color pickers */
.tiptap-color-picker {
    width: 24px;
    height: 24px;
    padding: 0;
    border: 2px solid;
    border-radius: 4px;
    cursor: pointer;
    background: none;
    opacity: 0.8;

    &:hover {
        opacity: 1;
    }

    &::-webkit-color-swatch-wrapper {
        padding: 0;
    }

    &::-webkit-color-swatch {
        border: none;
        border-radius: 2px;
    }
}
</style>
