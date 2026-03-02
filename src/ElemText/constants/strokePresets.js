/**
 * Stroke Presets for ElemText (Figma-parity)
 *
 * Defines stroke styles and presets similar to Figma:
 * - Style presets (solid, dashed, dotted, double)
 * - Combined presets with weight + style
 * - Decorative stroke patterns
 */

// ═══════════════════════════════════════════════════════════════════════════
// STROKE STYLE PRESETS — Quick style selectors
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Basic stroke styles for quick selection
 * icon field uses Unicode line characters for visual representation
 */
export const strokeStylePresets = [
    {
        name: 'solid',
        label: 'Сплошная',
        icon: '━',
        props: { strokeStyle: 'solid', strokeDasharray: '' }
    },
    {
        name: 'dashed',
        label: 'Штриховая',
        icon: '┅',
        props: { strokeStyle: 'dashed', strokeDasharray: '8,4' }
    },
    {
        name: 'dotted',
        label: 'Пунктирная',
        icon: '┈',
        props: { strokeStyle: 'dotted', strokeDasharray: '' }
    },
    {
        name: 'double',
        label: 'Двойная',
        icon: '═',
        props: { strokeStyle: 'double', strokeDasharray: '' }
    }
];

// ═══════════════════════════════════════════════════════════════════════════
// STROKE WIDTH PRESETS — Common stroke weights
// ═══════════════════════════════════════════════════════════════════════════

export const strokeWidthPresets = [
    { name: 'hairline', label: 'Волосяная', value: 1 },
    { name: 'thin', label: 'Тонкая', value: 2 },
    { name: 'medium', label: 'Средняя', value: 3 },
    { name: 'thick', label: 'Толстая', value: 4 },
    { name: 'heavy', label: 'Жирная', value: 6 }
];

// ═══════════════════════════════════════════════════════════════════════════
// COMBINED STROKE PRESETS — Full configurations
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Complete stroke presets combining style, width, and other properties
 */
export const strokePresets = {
    // Тонкие сплошные
    hairline: {
        label: 'Волосяная',
        description: 'Минимальная обводка 1px',
        props: { strokeWidth: 1, strokeStyle: 'solid', strokeOpacity: 1 }
    },
    thin: {
        label: 'Тонкая',
        description: 'Тонкая обводка 2px',
        props: { strokeWidth: 2, strokeStyle: 'solid', strokeOpacity: 1 }
    },

    // Средние
    medium: {
        label: 'Средняя',
        description: 'Стандартная обводка 3px',
        props: { strokeWidth: 3, strokeStyle: 'solid', strokeOpacity: 1 }
    },

    // Толстые
    thick: {
        label: 'Толстая',
        description: 'Толстая обводка 4px',
        props: { strokeWidth: 4, strokeStyle: 'solid', strokeOpacity: 1 }
    },
    heavy: {
        label: 'Жирная',
        description: 'Жирная обводка 6px',
        props: { strokeWidth: 6, strokeStyle: 'solid', strokeOpacity: 1 }
    },

    // Штриховые
    dashedThin: {
        label: 'Штрих тонкий',
        description: 'Тонкая штриховая линия',
        props: { strokeWidth: 1, strokeStyle: 'dashed', strokeDasharray: '4,4', strokeOpacity: 1 }
    },
    dashedMedium: {
        label: 'Штрих средний',
        description: 'Средняя штриховая линия',
        props: { strokeWidth: 2, strokeStyle: 'dashed', strokeDasharray: '8,4', strokeOpacity: 1 }
    },
    dashedLong: {
        label: 'Штрих длинный',
        description: 'Длинные штрихи',
        props: { strokeWidth: 2, strokeStyle: 'dashed', strokeDasharray: '12,6', strokeOpacity: 1 }
    },

    // Пунктирные
    dottedThin: {
        label: 'Точки тонкие',
        description: 'Тонкая пунктирная линия',
        props: { strokeWidth: 1, strokeStyle: 'dotted', strokeOpacity: 1 }
    },
    dottedMedium: {
        label: 'Точки средние',
        description: 'Средняя пунктирная линия',
        props: { strokeWidth: 2, strokeStyle: 'dotted', strokeOpacity: 1 }
    },

    // Рамки с цветами
    frameThin: {
        label: 'Рамка тонкая',
        description: 'Тонкая серая рамка',
        props: { strokeWidth: 1, strokeStyle: 'solid', strokeColor: '#e5e7eb', strokeOpacity: 1 }
    },
    frameMedium: {
        label: 'Рамка средняя',
        description: 'Средняя серая рамка',
        props: { strokeWidth: 2, strokeStyle: 'solid', strokeColor: '#d1d5db', strokeOpacity: 1 }
    },
    frameAccent: {
        label: 'Рамка акцент',
        description: 'Рамка с акцентным цветом',
        props: { strokeWidth: 2, strokeStyle: 'solid', strokeColor: 'var(--color-primary)', strokeOpacity: 1 }
    },
    frameError: {
        label: 'Рамка ошибка',
        description: 'Красная рамка для валидации',
        props: { strokeWidth: 2, strokeStyle: 'solid', strokeColor: 'var(--color-red)', strokeOpacity: 1 }
    },

    // Декоративные
    doubleLine: {
        label: 'Двойная линия',
        description: 'Двойная обводка',
        props: { strokeWidth: 3, strokeStyle: 'double', strokeOpacity: 1 }
    },
    dashDot: {
        label: 'Штрих-точка',
        description: 'Паттерн штрих-точка',
        props: { strokeWidth: 2, strokeStyle: 'dashed', strokeDasharray: '8,4,2,4', strokeOpacity: 1 }
    },

    // Полупрозрачные
    ghostThin: {
        label: 'Призрачная тонкая',
        description: 'Полупрозрачная тонкая',
        props: { strokeWidth: 1, strokeStyle: 'solid', strokeOpacity: 0.5 }
    },
    ghostMedium: {
        label: 'Призрачная средняя',
        description: 'Полупрозрачная средняя',
        props: { strokeWidth: 2, strokeStyle: 'solid', strokeOpacity: 0.3 }
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// LINE CAP OPTIONS — For SVG and canvas rendering
// ═══════════════════════════════════════════════════════════════════════════

export const linecapOptions = [
    { value: 'butt', label: 'Плоское', description: 'Срезанное окончание' },
    { value: 'round', label: 'Круглое', description: 'Скруглённое окончание' },
    { value: 'square', label: 'Квадратное', description: 'Квадратное окончание' }
];

// ═══════════════════════════════════════════════════════════════════════════
// LINE JOIN OPTIONS — For corners
// ═══════════════════════════════════════════════════════════════════════════

export const linejoinOptions = [
    { value: 'miter', label: 'Острое', description: 'Острый угол' },
    { value: 'bevel', label: 'Срезанное', description: 'Срезанный угол' },
    { value: 'round', label: 'Круглое', description: 'Скруглённый угол' }
];

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get stroke preset by name
 * @param {string} presetName - Preset name
 * @returns {Object|null} Preset configuration or null
 */
export function getStrokePreset(presetName) {
    return strokePresets[presetName] || null;
}

/**
 * Get stroke style preset by name
 * @param {string} styleName - Style name (solid, dashed, dotted, double)
 * @returns {Object|null} Style preset or null
 */
export function getStrokeStylePreset(styleName) {
    return strokeStylePresets.find(s => s.name === styleName) || null;
}

/**
 * Detect current stroke style from props
 * @param {Object} props - Widget props
 * @returns {string} Detected style name
 */
export function detectStrokeStyle(props) {
    const style = props.strokeStyle || 'solid';
    const dasharray = props.strokeDasharray || '';

    // If dasharray is set and style is dashed, use dashed
    if (dasharray && style === 'dashed') return 'dashed';

    return style;
}

export default strokePresets;
