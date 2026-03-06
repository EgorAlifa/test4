/**
 * FontSize extension for Tiptap
 *
 * Adds font-size support via TextStyle mark.
 * Usage: editor.chain().focus().setFontSize('16px').run()
 */

import { Extension } from '@tiptap/core';

const FontSize = Extension.create({
    name: 'fontSize',

    addOptions() {
        return {
            types: ['textStyle']
        };
    },

    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    fontSize: {
                        default: null,
                        parseHTML: element => element.style.fontSize?.replace(/['"]+/g, ''),
                        renderHTML: attributes => {
                            if (!attributes.fontSize) {
                                return {};
                            }

                            return {
                                style: `font-size: ${attributes.fontSize}`
                            };
                        }
                    }
                }
            }
        ];
    },

    addCommands() {
        return {
            setFontSize: fontSize => ({ commands }) => {
                return commands.setMark('textStyle', { fontSize });
            },
            unsetFontSize: () => ({ commands }) => {
                return commands.setMark('textStyle', { fontSize: null });
            }
        };
    }
});

export default FontSize;
