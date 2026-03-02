/**
 * Placeholder extension for Tiptap
 *
 * Adds a placeholder text to an empty editor via CSS (data-placeholder + ::before).
 * Marks the first empty child with class `is-editor-empty` and sets data-placeholder.
 *
 * Custom implementation — replaces @tiptap/extension-placeholder
 */

import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

const PlaceholderPluginKey = new PluginKey('placeholder');

const Placeholder = Extension.create({
    name: 'placeholder',

    addOptions() {
        return {
            placeholder: 'Write something…',
            showOnlyCurrent: true
        };
    },

    addProseMirrorPlugins() {
        const { placeholder, showOnlyCurrent } = this.options;

        return [
            new Plugin({
                key: PlaceholderPluginKey,
                props: {
                    decorations: ({ doc, selection }) => {
                        if (!this.editor.isEditable) return null;

                        const decorations = [];
                        const { anchor } = selection;

                        doc.descendants((node, pos) => {
                            if (!node.isBlock || node.isLeaf || node.childCount) return;

                            const hasAnchor = anchor >= pos && anchor <= pos + node.nodeSize;
                            if (!showOnlyCurrent || hasAnchor) {
                                decorations.push(
                                    Decoration.node(pos, pos + node.nodeSize, {
                                        class: 'is-editor-empty',
                                        'data-placeholder':
                                            typeof placeholder === 'function'
                                                ? placeholder({ editor: this.editor, node })
                                                : placeholder
                                    })
                                );
                            }
                        });

                        return DecorationSet.create(doc, decorations);
                    }
                }
            })
        ];
    }
});

export default Placeholder;
