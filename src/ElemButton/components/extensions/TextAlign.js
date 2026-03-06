/**
 * TextAlign extension for Tiptap
 *
 * Adds text-align support to paragraph and heading nodes.
 * Usage: editor.chain().focus().setTextAlign('left').run()
 *
 * Custom implementation — replaces @tiptap/extension-text-align
 */

import { Extension } from '@tiptap/core';

const TextAlign = Extension.create({
    name: 'textAlign',

    addOptions() {
        return {
            types: ['heading', 'paragraph'],
            alignments: ['left', 'center', 'right', 'justify'],
            defaultAlignment: null
        };
    },

    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    textAlign: {
                        default: this.options.defaultAlignment,
                        parseHTML: element =>
                            element.style.textAlign || this.options.defaultAlignment,
                        renderHTML: attributes => {
                            if (attributes.textAlign === this.options.defaultAlignment) {
                                return {};
                            }
                            return { style: `text-align: ${attributes.textAlign}` };
                        }
                    }
                }
            }
        ];
    },

    addCommands() {
        return {
            setTextAlign: alignment => ({ commands }) => {
                if (!this.options.alignments.includes(alignment)) return false;
                return this.options.types
                    .map(type => commands.updateAttributes(type, { textAlign: alignment }))
                    .every(Boolean);
            },
            unsetTextAlign: () => ({ commands }) => {
                return this.options.types
                    .map(type => commands.resetAttributes(type, 'textAlign'))
                    .every(Boolean);
            }
        };
    }
});

export default TextAlign;
