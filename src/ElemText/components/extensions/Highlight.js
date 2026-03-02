/**
 * Highlight extension for Tiptap
 *
 * Adds background-color highlighting via a <mark> tag.
 * Usage: editor.chain().focus().setHighlight({ color: '#ffff00' }).run()
 *
 * Custom implementation — replaces @tiptap/extension-highlight
 */

import { Mark, mergeAttributes } from '@tiptap/core';

const Highlight = Mark.create({
    name: 'highlight',

    addOptions() {
        return {
            multicolor: false,
            HTMLAttributes: {}
        };
    },

    addAttributes() {
        if (!this.options.multicolor) {
            return {};
        }
        return {
            color: {
                default: null,
                parseHTML: element =>
                    element.getAttribute('data-color') || element.style.backgroundColor || null,
                renderHTML: attributes => {
                    if (!attributes.color) return {};
                    return {
                        'data-color': attributes.color,
                        style: `background-color: ${attributes.color}`
                    };
                }
            }
        };
    },

    parseHTML() {
        return [{ tag: 'mark' }];
    },

    renderHTML({ HTMLAttributes }) {
        return ['mark', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
    },

    addCommands() {
        return {
            setHighlight: attrs => ({ commands }) => {
                return commands.setMark(this.name, attrs);
            },
            toggleHighlight: attrs => ({ commands }) => {
                return commands.toggleMark(this.name, attrs, { extendEmptyMarkRange: true });
            },
            unsetHighlight: () => ({ commands }) => {
                return commands.unsetMark(this.name, { extendEmptyMarkRange: true });
            }
        };
    }
});

export default Highlight;
