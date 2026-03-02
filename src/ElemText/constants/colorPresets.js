/**
 * Color Presets for Design Systems
 *
 * Defines color palettes for 4 design systems:
 * - Insight UI (Goodt platform native with CSS variables)
 * - Apple HIG system colors
 * - Material Design 3 color roles
 * - Semantic colors (generic fallback)
 *
 * Each color includes: name, value (CSS), display (preview hex)
 */

// ═══════════════════════════════════════════════════════════════════════════
// INSIGHT UI — Goodt Platform Native Colors (using CSS variables)
// ═══════════════════════════════════════════════════════════════════════════

export const insightColorPresets = [
    { name: 'Основной', value: 'var(--color-primary)', display: '#0085FF' },
    { name: 'Ссылка', value: 'var(--color-link)', display: '#0066CC' },
    { name: 'Текст', value: 'var(--color-body)', display: '#333333' },
    { name: 'Чёрный', value: 'var(--color-black)', display: '#000000' },
    { name: 'Белый', value: 'var(--color-white)', display: '#FFFFFF' },
    { name: 'Красный', value: 'var(--color-red)', display: '#EF4444' },
    { name: 'Зелёный', value: 'var(--color-green)', display: '#10B981' },
    { name: 'Жёлтый', value: 'var(--color-yellow)', display: '#F59E0B' },
    { name: 'Оранжевый', value: 'var(--color-orange)', display: '#F97316' },
    { name: 'Серый', value: 'var(--color-grey)', display: '#6B7280' },
    { name: 'Серый тёмный', value: 'var(--color-grey-dark)', display: '#374151' },
    { name: 'Серый светлый', value: 'var(--color-grey-light)', display: '#D1D5DB' },
    { name: 'Приглушённый', value: 'var(--color-muted)', display: '#9CA3AF' },
    { name: 'Неактивный', value: 'var(--color-disabled)', display: '#E5E7EB' }
];

// ═══════════════════════════════════════════════════════════════════════════
// APPLE HIG — System Colors
// ═══════════════════════════════════════════════════════════════════════════

export const appleColorPresets = [
    { name: 'Label', value: '#000000', display: '#000000' },
    { name: 'Secondary Label', value: 'rgba(60, 60, 67, 0.6)', display: '#8E8E93' },
    { name: 'Tertiary Label', value: 'rgba(60, 60, 67, 0.3)', display: '#C7C7CC' },
    { name: 'System Blue', value: '#007AFF', display: '#007AFF' },
    { name: 'System Green', value: '#34C759', display: '#34C759' },
    { name: 'System Red', value: '#FF3B30', display: '#FF3B30' },
    { name: 'System Orange', value: '#FF9500', display: '#FF9500' },
    { name: 'System Yellow', value: '#FFCC00', display: '#FFCC00' },
    { name: 'System Pink', value: '#FF2D55', display: '#FF2D55' },
    { name: 'System Purple', value: '#AF52DE', display: '#AF52DE' },
    { name: 'System Teal', value: '#5AC8FA', display: '#5AC8FA' },
    { name: 'System Indigo', value: '#5856D6', display: '#5856D6' }
];

// ═══════════════════════════════════════════════════════════════════════════
// MATERIAL DESIGN 3 — Color Roles
// ═══════════════════════════════════════════════════════════════════════════

export const materialColorPresets = [
    { name: 'Primary', value: '#6750A4', display: '#6750A4' },
    { name: 'On Primary', value: '#FFFFFF', display: '#FFFFFF' },
    { name: 'Secondary', value: '#625B71', display: '#625B71' },
    { name: 'Tertiary', value: '#7D5260', display: '#7D5260' },
    { name: 'Error', value: '#B3261E', display: '#B3261E' },
    { name: 'Surface', value: '#FFFBFE', display: '#FFFBFE' },
    { name: 'On Surface', value: '#1C1B1F', display: '#1C1B1F' },
    { name: 'Surface Variant', value: '#E7E0EC', display: '#E7E0EC' },
    { name: 'Outline', value: '#79747E', display: '#79747E' },
    { name: 'Outline Variant', value: '#CAC4D0', display: '#CAC4D0' },
    { name: 'Inverse Surface', value: '#313033', display: '#313033' },
    { name: 'Inverse Primary', value: '#D0BCFF', display: '#D0BCFF' }
];

// ═══════════════════════════════════════════════════════════════════════════
// SEMANTIC — Generic fallback colors
// ═══════════════════════════════════════════════════════════════════════════

export const semanticColorPresets = [
    { name: 'Основной', value: 'var(--color-primary)', display: '#0085FF' },
    { name: 'Тёмный', value: '#1f1f1f', display: '#1f1f1f' },
    { name: 'Серый', value: '#6b7280', display: '#6b7280' },
    { name: 'Успех', value: 'var(--color-green)', display: '#10b981' },
    { name: 'Внимание', value: 'var(--color-yellow)', display: '#f59e0b' },
    { name: 'Ошибка', value: 'var(--color-red)', display: '#ef4444' },
    { name: 'Фиолетовый', value: '#8b5cf6', display: '#8b5cf6' },
    { name: 'Розовый', value: '#ec4899', display: '#ec4899' }
];

// ═══════════════════════════════════════════════════════════════════════════
// COLOR PALETTES BY DESIGN SYSTEM
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Color palettes mapped by design system ID
 */
export const colorPalettesBySystem = {
    insight: insightColorPresets,
    apple: appleColorPresets,
    material: materialColorPresets,
    custom: semanticColorPresets
};

/**
 * Get color presets for a specific design system
 * @param {string} systemId - Design system ID
 * @returns {Array} Color presets array
 */
export function getColorPresetsForSystem(systemId) {
    return colorPalettesBySystem[systemId] || semanticColorPresets;
}

export default colorPalettesBySystem;
