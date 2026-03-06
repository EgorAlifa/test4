/**
 * Design System Typography Presets
 *
 * Defines complete type scales for 4 design systems:
 * - Insight UI (Goodt platform native)
 * - Apple Human Interface Guidelines
 * - Material Design 3
 * - Custom (basic presets for manual configuration)
 *
 * Each preset includes: fontSize, fontWeight, lineHeight, letterSpacing
 * Values follow official design system specifications.
 */

// ═══════════════════════════════════════════════════════════════════════════
// INSIGHT UI — Goodt Platform Native (Default)
// ═══════════════════════════════════════════════════════════════════════════

export const insightTypePresets = [
    {
        name: 'h1',
        label: 'H1',
        description: 'Заголовок страницы',
        previewStyle: { fontSize: '14px', fontWeight: '700' },
        props: {
            fontSize: { size: 32, unit: 'px' }, // eslint-disable-line no-magic-numbers
            fontWeight: 700, // eslint-disable-line no-magic-numbers
            lineHeight: { size: 1.2, unit: '' }, // eslint-disable-line no-magic-numbers
            letterSpacing: { size: -0.5, unit: 'px' } // eslint-disable-line no-magic-numbers
        }
    },
    {
        name: 'h2',
        label: 'H2',
        description: 'Заголовок раздела',
        previewStyle: { fontSize: '13px', fontWeight: '600' },
        props: {
            fontSize: { size: 24, unit: 'px' }, // eslint-disable-line no-magic-numbers
            fontWeight: 600, // eslint-disable-line no-magic-numbers
            lineHeight: { size: 1.25, unit: '' }, // eslint-disable-line no-magic-numbers
            letterSpacing: { size: -0.25, unit: 'px' } // eslint-disable-line no-magic-numbers
        }
    },
    {
        name: 'h3',
        label: 'H3',
        description: 'Подзаголовок',
        previewStyle: { fontSize: '12px', fontWeight: '600' },
        props: {
            fontSize: { size: 20, unit: 'px' }, // eslint-disable-line no-magic-numbers
            fontWeight: 600, // eslint-disable-line no-magic-numbers
            lineHeight: { size: 1.3, unit: '' }, // eslint-disable-line no-magic-numbers
            letterSpacing: { size: 0, unit: 'px' }
        }
    },
    {
        name: 'h4',
        label: 'H4',
        description: 'Малый заголовок',
        previewStyle: { fontSize: '11px', fontWeight: '600' },
        props: {
            fontSize: { size: 18, unit: 'px' }, // eslint-disable-line no-magic-numbers
            fontWeight: 600, // eslint-disable-line no-magic-numbers
            lineHeight: { size: 1.35, unit: '' }, // eslint-disable-line no-magic-numbers
            letterSpacing: { size: 0, unit: 'px' }
        }
    },
    {
        name: 'large',
        label: 'Large',
        description: 'Крупный текст',
        previewStyle: { fontSize: '13px', fontWeight: '400' },
        props: {
            fontSize: { size: 18, unit: 'px' }, // eslint-disable-line no-magic-numbers
            fontWeight: 400, // eslint-disable-line no-magic-numbers
            lineHeight: { size: 1.5, unit: '' }, // eslint-disable-line no-magic-numbers
            letterSpacing: { size: 0, unit: 'px' }
        }
    },
    {
        name: 'body',
        label: 'Body',
        description: 'Основной текст',
        previewStyle: { fontSize: '12px', fontWeight: '400' },
        props: {
            fontSize: { size: 16, unit: 'px' }, // eslint-disable-line no-magic-numbers
            fontWeight: 400, // eslint-disable-line no-magic-numbers
            lineHeight: { size: 1.5, unit: '' }, // eslint-disable-line no-magic-numbers
            letterSpacing: { size: 0, unit: 'px' }
        }
    },
    {
        name: 'small',
        label: 'Small',
        description: 'Мелкий текст',
        previewStyle: { fontSize: '10px', fontWeight: '400' },
        props: {
            fontSize: { size: 14, unit: 'px' }, // eslint-disable-line no-magic-numbers
            fontWeight: 400, // eslint-disable-line no-magic-numbers
            lineHeight: { size: 1.45, unit: '' }, // eslint-disable-line no-magic-numbers
            letterSpacing: { size: 0, unit: 'px' }
        }
    },
    {
        name: 'xsmall',
        label: 'XSmall',
        description: 'Подписи, метки',
        previewStyle: { fontSize: '9px', fontWeight: '400' },
        props: {
            fontSize: { size: 12, unit: 'px' }, // eslint-disable-line no-magic-numbers
            fontWeight: 400, // eslint-disable-line no-magic-numbers
            lineHeight: { size: 1.4, unit: '' }, // eslint-disable-line no-magic-numbers
            letterSpacing: { size: 0.1, unit: 'px' } // eslint-disable-line no-magic-numbers
        }
    }
];

// ═══════════════════════════════════════════════════════════════════════════
// APPLE HUMAN INTERFACE GUIDELINES
// Based on iOS/macOS Typography specifications
// ═══════════════════════════════════════════════════════════════════════════

export const appleTypePresets = [
    {
        name: 'largeTitle',
        label: 'Large Title',
        description: 'Большой заголовок',
        previewStyle: { fontSize: '17px', fontWeight: '400' },
        props: {
            fontSize: { size: 34, unit: 'px' }, // eslint-disable-line no-magic-numbers
            fontWeight: 400, // eslint-disable-line no-magic-numbers
            lineHeight: { size: 41, unit: 'px' }, // eslint-disable-line no-magic-numbers
            letterSpacing: { size: 0.37, unit: 'px' } // eslint-disable-line no-magic-numbers
        }
    },
    {
        name: 'title1',
        label: 'Title 1',
        description: 'Заголовок 1',
        previewStyle: { fontSize: '15px', fontWeight: '400' },
        props: {
            fontSize: { size: 28, unit: 'px' }, // eslint-disable-line no-magic-numbers
            fontWeight: 400, // eslint-disable-line no-magic-numbers
            lineHeight: { size: 34, unit: 'px' }, // eslint-disable-line no-magic-numbers
            letterSpacing: { size: 0.36, unit: 'px' } // eslint-disable-line no-magic-numbers
        }
    },
    {
        name: 'title2',
        label: 'Title 2',
        description: 'Заголовок 2',
        previewStyle: { fontSize: '14px', fontWeight: '400' },
        props: {
            fontSize: { size: 22, unit: 'px' }, // eslint-disable-line no-magic-numbers
            fontWeight: 400, // eslint-disable-line no-magic-numbers
            lineHeight: { size: 28, unit: 'px' }, // eslint-disable-line no-magic-numbers
            letterSpacing: { size: 0.35, unit: 'px' } // eslint-disable-line no-magic-numbers
        }
    },
    {
        name: 'title3',
        label: 'Title 3',
        description: 'Заголовок 3',
        previewStyle: { fontSize: '13px', fontWeight: '400' },
        props: {
            fontSize: { size: 20, unit: 'px' }, // eslint-disable-line no-magic-numbers
            fontWeight: 400, // eslint-disable-line no-magic-numbers
            lineHeight: { size: 25, unit: 'px' }, // eslint-disable-line no-magic-numbers
            letterSpacing: { size: 0.38, unit: 'px' } // eslint-disable-line no-magic-numbers
        }
    },
    {
        name: 'headline',
        label: 'Headline',
        description: 'Выделенный текст',
        previewStyle: { fontSize: '13px', fontWeight: '600' },
        props: {
            fontSize: { size: 17, unit: 'px' }, // eslint-disable-line no-magic-numbers
            fontWeight: 600, // eslint-disable-line no-magic-numbers
            lineHeight: { size: 22, unit: 'px' }, // eslint-disable-line no-magic-numbers
            letterSpacing: { size: -0.41, unit: 'px' } // eslint-disable-line no-magic-numbers
        }
    },
    {
        name: 'body',
        label: 'Body',
        description: 'Основной текст',
        previewStyle: { fontSize: '13px', fontWeight: '400' },
        props: {
            fontSize: { size: 17, unit: 'px' }, // eslint-disable-line no-magic-numbers
            fontWeight: 400, // eslint-disable-line no-magic-numbers
            lineHeight: { size: 22, unit: 'px' }, // eslint-disable-line no-magic-numbers
            letterSpacing: { size: -0.41, unit: 'px' } // eslint-disable-line no-magic-numbers
        }
    },
    {
        name: 'callout',
        label: 'Callout',
        description: 'Выноска',
        previewStyle: { fontSize: '12px', fontWeight: '400' },
        props: {
            fontSize: { size: 16, unit: 'px' }, // eslint-disable-line no-magic-numbers
            fontWeight: 400, // eslint-disable-line no-magic-numbers
            lineHeight: { size: 21, unit: 'px' }, // eslint-disable-line no-magic-numbers
            letterSpacing: { size: -0.32, unit: 'px' } // eslint-disable-line no-magic-numbers
        }
    },
    {
        name: 'subhead',
        label: 'Subhead',
        description: 'Подзаголовок',
        previewStyle: { fontSize: '12px', fontWeight: '400' },
        props: {
            fontSize: { size: 15, unit: 'px' }, // eslint-disable-line no-magic-numbers
            fontWeight: 400, // eslint-disable-line no-magic-numbers
            lineHeight: { size: 20, unit: 'px' }, // eslint-disable-line no-magic-numbers
            letterSpacing: { size: -0.24, unit: 'px' } // eslint-disable-line no-magic-numbers
        }
    },
    {
        name: 'footnote',
        label: 'Footnote',
        description: 'Сноска',
        previewStyle: { fontSize: '11px', fontWeight: '400' },
        props: {
            fontSize: { size: 13, unit: 'px' }, // eslint-disable-line no-magic-numbers
            fontWeight: 400, // eslint-disable-line no-magic-numbers
            lineHeight: { size: 18, unit: 'px' }, // eslint-disable-line no-magic-numbers
            letterSpacing: { size: -0.08, unit: 'px' } // eslint-disable-line no-magic-numbers
        }
    },
    {
        name: 'caption1',
        label: 'Caption 1',
        description: 'Подпись 1',
        previewStyle: { fontSize: '10px', fontWeight: '400' },
        props: {
            fontSize: { size: 12, unit: 'px' }, // eslint-disable-line no-magic-numbers
            fontWeight: 400, // eslint-disable-line no-magic-numbers
            lineHeight: { size: 16, unit: 'px' }, // eslint-disable-line no-magic-numbers
            letterSpacing: { size: 0, unit: 'px' }
        }
    },
    {
        name: 'caption2',
        label: 'Caption 2',
        description: 'Подпись 2',
        previewStyle: { fontSize: '10px', fontWeight: '400' },
        props: {
            fontSize: { size: 11, unit: 'px' }, // eslint-disable-line no-magic-numbers
            fontWeight: 400, // eslint-disable-line no-magic-numbers
            lineHeight: { size: 13, unit: 'px' }, // eslint-disable-line no-magic-numbers
            letterSpacing: { size: 0.07, unit: 'px' } // eslint-disable-line no-magic-numbers
        }
    }
];

// ═══════════════════════════════════════════════════════════════════════════
// MATERIAL DESIGN 3
// Based on Material Design 3 Typography specifications
// ═══════════════════════════════════════════════════════════════════════════

export const materialTypePresets = [
    {
        name: 'displayLarge',
        label: 'Display L',
        description: 'Дисплей большой',
        previewStyle: { fontSize: '18px', fontWeight: '400' },
        props: {
            fontSize: { size: 57, unit: 'px' }, // eslint-disable-line no-magic-numbers
            fontWeight: 400, // eslint-disable-line no-magic-numbers
            lineHeight: { size: 64, unit: 'px' }, // eslint-disable-line no-magic-numbers
            letterSpacing: { size: -0.25, unit: 'px' } // eslint-disable-line no-magic-numbers
        }
    },
    {
        name: 'displayMedium',
        label: 'Display M',
        description: 'Дисплей средний',
        previewStyle: { fontSize: '16px', fontWeight: '400' },
        props: {
            fontSize: { size: 45, unit: 'px' }, // eslint-disable-line no-magic-numbers
            fontWeight: 400, // eslint-disable-line no-magic-numbers
            lineHeight: { size: 52, unit: 'px' }, // eslint-disable-line no-magic-numbers
            letterSpacing: { size: 0, unit: 'px' }
        }
    },
    {
        name: 'displaySmall',
        label: 'Display S',
        description: 'Дисплей малый',
        previewStyle: { fontSize: '15px', fontWeight: '400' },
        props: {
            fontSize: { size: 36, unit: 'px' }, // eslint-disable-line no-magic-numbers
            fontWeight: 400, // eslint-disable-line no-magic-numbers
            lineHeight: { size: 44, unit: 'px' }, // eslint-disable-line no-magic-numbers
            letterSpacing: { size: 0, unit: 'px' }
        }
    },
    {
        name: 'headlineLarge',
        label: 'Headline L',
        description: 'Заголовок большой',
        previewStyle: { fontSize: '15px', fontWeight: '400' },
        props: {
            fontSize: { size: 32, unit: 'px' }, // eslint-disable-line no-magic-numbers
            fontWeight: 400, // eslint-disable-line no-magic-numbers
            lineHeight: { size: 40, unit: 'px' }, // eslint-disable-line no-magic-numbers
            letterSpacing: { size: 0, unit: 'px' }
        }
    },
    {
        name: 'headlineMedium',
        label: 'Headline M',
        description: 'Заголовок средний',
        previewStyle: { fontSize: '14px', fontWeight: '400' },
        props: {
            fontSize: { size: 28, unit: 'px' }, // eslint-disable-line no-magic-numbers
            fontWeight: 400, // eslint-disable-line no-magic-numbers
            lineHeight: { size: 36, unit: 'px' }, // eslint-disable-line no-magic-numbers
            letterSpacing: { size: 0, unit: 'px' }
        }
    },
    {
        name: 'headlineSmall',
        label: 'Headline S',
        description: 'Заголовок малый',
        previewStyle: { fontSize: '14px', fontWeight: '400' },
        props: {
            fontSize: { size: 24, unit: 'px' }, // eslint-disable-line no-magic-numbers
            fontWeight: 400, // eslint-disable-line no-magic-numbers
            lineHeight: { size: 32, unit: 'px' }, // eslint-disable-line no-magic-numbers
            letterSpacing: { size: 0, unit: 'px' }
        }
    },
    {
        name: 'titleLarge',
        label: 'Title L',
        description: 'Название большое',
        previewStyle: { fontSize: '14px', fontWeight: '400' },
        props: {
            fontSize: { size: 22, unit: 'px' }, // eslint-disable-line no-magic-numbers
            fontWeight: 400, // eslint-disable-line no-magic-numbers
            lineHeight: { size: 28, unit: 'px' }, // eslint-disable-line no-magic-numbers
            letterSpacing: { size: 0, unit: 'px' }
        }
    },
    {
        name: 'titleMedium',
        label: 'Title M',
        description: 'Название среднее',
        previewStyle: { fontSize: '13px', fontWeight: '500' },
        props: {
            fontSize: { size: 16, unit: 'px' }, // eslint-disable-line no-magic-numbers
            fontWeight: 500, // eslint-disable-line no-magic-numbers
            lineHeight: { size: 24, unit: 'px' }, // eslint-disable-line no-magic-numbers
            letterSpacing: { size: 0.15, unit: 'px' } // eslint-disable-line no-magic-numbers
        }
    },
    {
        name: 'titleSmall',
        label: 'Title S',
        description: 'Название малое',
        previewStyle: { fontSize: '12px', fontWeight: '500' },
        props: {
            fontSize: { size: 14, unit: 'px' }, // eslint-disable-line no-magic-numbers
            fontWeight: 500, // eslint-disable-line no-magic-numbers
            lineHeight: { size: 20, unit: 'px' }, // eslint-disable-line no-magic-numbers
            letterSpacing: { size: 0.1, unit: 'px' } // eslint-disable-line no-magic-numbers
        }
    },
    {
        name: 'bodyLarge',
        label: 'Body L',
        description: 'Текст большой',
        previewStyle: { fontSize: '13px', fontWeight: '400' },
        props: {
            fontSize: { size: 16, unit: 'px' }, // eslint-disable-line no-magic-numbers
            fontWeight: 400, // eslint-disable-line no-magic-numbers
            lineHeight: { size: 24, unit: 'px' }, // eslint-disable-line no-magic-numbers
            letterSpacing: { size: 0.5, unit: 'px' } // eslint-disable-line no-magic-numbers
        }
    },
    {
        name: 'bodyMedium',
        label: 'Body M',
        description: 'Текст средний',
        previewStyle: { fontSize: '12px', fontWeight: '400' },
        props: {
            fontSize: { size: 14, unit: 'px' }, // eslint-disable-line no-magic-numbers
            fontWeight: 400, // eslint-disable-line no-magic-numbers
            lineHeight: { size: 20, unit: 'px' }, // eslint-disable-line no-magic-numbers
            letterSpacing: { size: 0.25, unit: 'px' } // eslint-disable-line no-magic-numbers
        }
    },
    {
        name: 'bodySmall',
        label: 'Body S',
        description: 'Текст малый',
        previewStyle: { fontSize: '11px', fontWeight: '400' },
        props: {
            fontSize: { size: 12, unit: 'px' }, // eslint-disable-line no-magic-numbers
            fontWeight: 400, // eslint-disable-line no-magic-numbers
            lineHeight: { size: 16, unit: 'px' }, // eslint-disable-line no-magic-numbers
            letterSpacing: { size: 0.4, unit: 'px' } // eslint-disable-line no-magic-numbers
        }
    },
    {
        name: 'labelLarge',
        label: 'Label L',
        description: 'Метка большая',
        previewStyle: { fontSize: '12px', fontWeight: '500' },
        props: {
            fontSize: { size: 14, unit: 'px' }, // eslint-disable-line no-magic-numbers
            fontWeight: 500, // eslint-disable-line no-magic-numbers
            lineHeight: { size: 20, unit: 'px' }, // eslint-disable-line no-magic-numbers
            letterSpacing: { size: 0.1, unit: 'px' } // eslint-disable-line no-magic-numbers
        }
    },
    {
        name: 'labelMedium',
        label: 'Label M',
        description: 'Метка средняя',
        previewStyle: { fontSize: '11px', fontWeight: '500' },
        props: {
            fontSize: { size: 12, unit: 'px' }, // eslint-disable-line no-magic-numbers
            fontWeight: 500, // eslint-disable-line no-magic-numbers
            lineHeight: { size: 16, unit: 'px' }, // eslint-disable-line no-magic-numbers
            letterSpacing: { size: 0.5, unit: 'px' } // eslint-disable-line no-magic-numbers
        }
    },
    {
        name: 'labelSmall',
        label: 'Label S',
        description: 'Метка малая',
        previewStyle: { fontSize: '10px', fontWeight: '500' },
        props: {
            fontSize: { size: 11, unit: 'px' }, // eslint-disable-line no-magic-numbers
            fontWeight: 500, // eslint-disable-line no-magic-numbers
            lineHeight: { size: 16, unit: 'px' }, // eslint-disable-line no-magic-numbers
            letterSpacing: { size: 0.5, unit: 'px' } // eslint-disable-line no-magic-numbers
        }
    }
];

// ═══════════════════════════════════════════════════════════════════════════
// CUSTOM — Basic presets for manual configuration
// ═══════════════════════════════════════════════════════════════════════════

export const customTypePresets = [
    {
        name: 'heading',
        label: 'H1',
        description: 'Заголовок страницы',
        previewStyle: { fontSize: '16px', fontWeight: '700' },
        props: {
            fontSize: { size: 24, unit: 'px' }, // eslint-disable-line no-magic-numbers
            fontWeight: 700, // eslint-disable-line no-magic-numbers
            lineHeight: { size: 1.2, unit: '' }, // eslint-disable-line no-magic-numbers
            letterSpacing: { size: 0, unit: 'px' }
        }
    },
    {
        name: 'section',
        label: 'H2',
        description: 'Заголовок раздела',
        previewStyle: { fontSize: '14px', fontWeight: '600' },
        props: {
            fontSize: { size: 18, unit: 'px' }, // eslint-disable-line no-magic-numbers
            fontWeight: 600, // eslint-disable-line no-magic-numbers
            lineHeight: { size: 1.3, unit: '' }, // eslint-disable-line no-magic-numbers
            letterSpacing: { size: 0, unit: 'px' }
        }
    },
    {
        name: 'body',
        label: 'Aa',
        description: 'Основной текст',
        previewStyle: { fontSize: '13px', fontWeight: '400' },
        props: {
            fontSize: { size: 14, unit: 'px' }, // eslint-disable-line no-magic-numbers
            fontWeight: 400, // eslint-disable-line no-magic-numbers
            lineHeight: { size: 1.5, unit: '' }, // eslint-disable-line no-magic-numbers
            letterSpacing: { size: 0, unit: 'px' }
        }
    },
    {
        name: 'caption',
        label: 'Aa',
        description: 'Подпись / мелкий текст',
        previewStyle: { fontSize: '11px', fontWeight: '400' },
        props: {
            fontSize: { size: 12, unit: 'px' }, // eslint-disable-line no-magic-numbers
            fontWeight: 400, // eslint-disable-line no-magic-numbers
            lineHeight: { size: 1.4, unit: '' }, // eslint-disable-line no-magic-numbers
            letterSpacing: { size: 0, unit: 'px' }
        }
    },
    {
        name: 'label',
        label: 'Label',
        description: 'Метка',
        previewStyle: { fontSize: '11px', fontWeight: '500' },
        props: {
            fontSize: { size: 12, unit: 'px' }, // eslint-disable-line no-magic-numbers
            fontWeight: 500, // eslint-disable-line no-magic-numbers
            lineHeight: { size: 1.3, unit: '' }, // eslint-disable-line no-magic-numbers
            letterSpacing: { size: 0.5, unit: 'px' } // eslint-disable-line no-magic-numbers
        }
    }
];

// ═══════════════════════════════════════════════════════════════════════════
// DESIGN SYSTEMS CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Design system definitions with their type presets
 */
export const designSystems = {
    insight: {
        id: 'insight',
        name: 'Insight UI',
        description: 'Дизайн-система платформы Goodt',
        presets: insightTypePresets
    },
    apple: {
        id: 'apple',
        name: 'Apple HIG',
        description: 'Human Interface Guidelines',
        presets: appleTypePresets
    },
    material: {
        id: 'material',
        name: 'Material 3',
        description: 'Material Design 3',
        presets: materialTypePresets
    },
    custom: {
        id: 'custom',
        name: 'Свой стиль',
        description: 'Базовые пресеты',
        presets: customTypePresets
    }
};

/**
 * Get type presets for a specific design system
 * @param {string} systemId - Design system ID
 * @returns {Array} Type presets array
 */
export function getTypePresetsForSystem(systemId) {
    const system = designSystems[systemId];
    return system ? system.presets : customTypePresets;
}

/**
 * Design system options for dropdown
 */
export const designSystemOptions = Object.values(designSystems).map(system => ({
    value: system.id,
    label: system.name,
    description: system.description
}));

export default designSystems;
