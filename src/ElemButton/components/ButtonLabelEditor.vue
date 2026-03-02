<template>
    <div
        class="btn-label-editor"
        @click.stop
        @mousedown.stop
        @pointerdown.stop
    >
        <editor-content :editor="editor" class="btn-label-editor__content" />
    </div>
</template>

<script>
import { Editor, EditorContent } from '@tiptap/vue-2';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '../../ElemText/components/extensions/Placeholder';

export default {
    name: 'ButtonLabelEditor',

    components: { EditorContent },

    props: {
        value: {
            type: String,
            default: ''
        },
        placeholder: {
            type: String,
            default: 'Кнопка'
        }
    },

    data() {
        return { editor: null };
    },

    watch: {
        value(val) {
            if (this.editor && val !== this.editor.getText()) {
                this.editor.commands.setContent(val ? `<p>${val}</p>` : '', false);
            }
        }
    },

    mounted() {
        this.editor = new Editor({
            content: this.value ? `<p>${this.value}</p>` : '',
            autofocus: 'end',
            extensions: [
                StarterKit.configure({
                    heading: false,
                    blockquote: false,
                    bulletList: false,
                    orderedList: false,
                    listItem: false,
                    codeBlock: false,
                    horizontalRule: false,
                    hardBreak: false
                }),
                Placeholder.configure({
                    placeholder: this.placeholder
                })
            ],
            editorProps: {
                attributes: { class: 'btn-label-editor__prose' },
                handleKeyDown: (view, event) => {
                    // Single-line: block Enter
                    if (event.key === 'Enter') {
                        event.preventDefault();
                        return true;
                    }
                    // Stop propagation so platform doesn't intercept keyboard
                    event.stopPropagation();
                    return false;
                }
            },
            onUpdate: ({ editor }) => {
                const text = editor.getText();
                this.$emit('input', text);
                this.$emit('change', text);
            }
        });
    },

    beforeDestroy() {
        if (this.editor) {
            this.editor.destroy();
        }
    }
};
</script>

<style lang="postcss" scoped>
.btn-label-editor {
    display: contents; /* transparent wrapper — inherits button layout */
}

.btn-label-editor__content {
    display: contents;
}

/* ProseMirror root element */
.btn-label-editor__content ::v-deep .ProseMirror {
    outline: none;
    border: none;
    background: transparent;
    padding: 0;
    margin: 0;
    min-width: 1ch;
    color: inherit;
    font: inherit;
    letter-spacing: inherit;
    text-transform: inherit;
    text-align: inherit;
    white-space: nowrap;
    cursor: text;
    user-select: text;
    -webkit-user-select: text;

    /* Single line: no wrapping, no paragraph spacing */
    p {
        margin: 0;
        padding: 0;
        display: inline;
    }
}

/* Placeholder */
.btn-label-editor__content ::v-deep .ProseMirror p.is-editor-empty:first-child::before {
    content: attr(data-placeholder);
    float: left;
    color: rgba(255, 255, 255, 0.5);
    pointer-events: none;
    height: 0;
}
</style>
