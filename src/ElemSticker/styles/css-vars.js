/**
 * CSS Variables mapping for ElemSticker
 *
 * Maps CSS custom property names to component prop paths.
 * Used for platform theming integration.
 */

export const cssVars = {
    // Sticker appearance
    'sticker_background-color': 'stickerColor',
    'sticker_text-color': 'textColor',
    'sticker_rotation': 'rotation',

    // Pin
    'sticker_pin-color': 'pinColor',

    // Typography
    'sticker_font-family': 'fontFamily',
    'sticker_font-size': 'fontSize',
    'sticker_font-weight': 'fontWeight',
    'sticker_line-height': 'lineHeight',
    'sticker_text-align': 'textAlign',

    // Spacing
    'sticker_padding': 'padding',

    // Border
    'sticker_border-radius': 'borderRadius',

    // Effects
    'sticker_box-shadow': 'boxShadow',
    'sticker_opacity': 'opacity'
};

/**
 * Designer config for VIBE 2.0 "I'm a Designer" panel
 */
export const designerConfig = {
    groups: [
        {
            name: 'appearance',
            label: 'Sticker',
            icon: 'mdi-note',
            vars: [
                'sticker_background-color',
                'sticker_text-color',
                'sticker_rotation'
            ]
        },
        {
            name: 'pin',
            label: 'Pin',
            icon: 'mdi-pin',
            vars: ['sticker_pin-color']
        },
        {
            name: 'typography',
            label: 'Typography',
            icon: 'mdi-format-font',
            vars: [
                'sticker_font-family',
                'sticker_font-size',
                'sticker_font-weight',
                'sticker_line-height',
                'sticker_text-align'
            ]
        },
        {
            name: 'effects',
            label: 'Effects',
            icon: 'mdi-blur',
            vars: [
                'sticker_box-shadow',
                'sticker_opacity'
            ]
        }
    ]
};

export default cssVars;
