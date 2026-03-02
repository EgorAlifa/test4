/**
 * Sticker Theme Definitions
 *
 * Pastel color palettes for sticky note appearance.
 * Each theme includes background, text, accent, and gradient colors.
 */

export const stickerThemes = {
    // ═══════════════════════════════════════════════════════════════════════════
    // CLASSIC STICKY NOTE COLORS
    // ═══════════════════════════════════════════════════════════════════════════
    yellow: {
        name: 'yellow',
        label: 'Yellow',
        emoji: '🟡',
        background: '#FFF9C4',
        backgroundDark: '#FFF59D',
        backgroundGradient: 'linear-gradient(135deg, #FFFDE7 0%, #FFF9C4 50%, #FFF59D 100%)',
        text: '#5D4037',
        pin: '#FF5252',
        tape: 'rgba(255, 235, 59, 0.6)',
        fold: '#F9A825',
        border: '#F9A825'
    },
    pink: {
        name: 'pink',
        label: 'Pink',
        emoji: '🩷',
        background: '#FCE4EC',
        backgroundDark: '#F8BBD0',
        backgroundGradient: 'linear-gradient(135deg, #FFF0F5 0%, #FCE4EC 50%, #F8BBD0 100%)',
        text: '#880E4F',
        pin: '#E91E63',
        tape: 'rgba(233, 30, 99, 0.3)',
        fold: '#EC407A',
        border: '#F48FB1'
    },
    blue: {
        name: 'blue',
        label: 'Blue',
        emoji: '🔵',
        background: '#E3F2FD',
        backgroundDark: '#BBDEFB',
        backgroundGradient: 'linear-gradient(135deg, #E8F4FD 0%, #E3F2FD 50%, #BBDEFB 100%)',
        text: '#0D47A1',
        pin: '#2196F3',
        tape: 'rgba(33, 150, 243, 0.3)',
        fold: '#42A5F5',
        border: '#90CAF9'
    },
    green: {
        name: 'green',
        label: 'Green',
        emoji: '🟢',
        background: '#E8F5E9',
        backgroundDark: '#C8E6C9',
        backgroundGradient: 'linear-gradient(135deg, #F1F8E9 0%, #E8F5E9 50%, #C8E6C9 100%)',
        text: '#1B5E20',
        pin: '#4CAF50',
        tape: 'rgba(76, 175, 80, 0.3)',
        fold: '#66BB6A',
        border: '#A5D6A7'
    },
    purple: {
        name: 'purple',
        label: 'Purple',
        emoji: '🟣',
        background: '#F3E5F5',
        backgroundDark: '#E1BEE7',
        backgroundGradient: 'linear-gradient(135deg, #F8EAF6 0%, #F3E5F5 50%, #E1BEE7 100%)',
        text: '#4A148C',
        pin: '#9C27B0',
        tape: 'rgba(156, 39, 176, 0.3)',
        fold: '#AB47BC',
        border: '#CE93D8'
    },
    orange: {
        name: 'orange',
        label: 'Orange',
        emoji: '🟠',
        background: '#FFF3E0',
        backgroundDark: '#FFE0B2',
        backgroundGradient: 'linear-gradient(135deg, #FFF8E1 0%, #FFF3E0 50%, #FFE0B2 100%)',
        text: '#E65100',
        pin: '#FF9800',
        tape: 'rgba(255, 152, 0, 0.4)',
        fold: '#FFA726',
        border: '#FFCC80'
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // NEUTRAL COLORS
    // ═══════════════════════════════════════════════════════════════════════════
    white: {
        name: 'white',
        label: 'White',
        emoji: '⬜',
        background: '#FFFFFF',
        backgroundDark: '#F5F5F5',
        backgroundGradient: 'linear-gradient(135deg, #FFFFFF 0%, #FAFAFA 50%, #F5F5F5 100%)',
        text: '#212121',
        pin: '#757575',
        tape: 'rgba(158, 158, 158, 0.4)',
        fold: '#BDBDBD',
        border: '#E0E0E0'
    },
    cream: {
        name: 'cream',
        label: 'Cream',
        emoji: '🏷️',
        background: '#FFFEF5',
        backgroundDark: '#FFF8E1',
        backgroundGradient: 'linear-gradient(135deg, #FFFFF8 0%, #FFFEF5 50%, #FFF8E1 100%)',
        text: '#4E342E',
        pin: '#8D6E63',
        tape: 'rgba(141, 110, 99, 0.3)',
        fold: '#BCAAA4',
        border: '#D7CCC8'
    },
    gray: {
        name: 'gray',
        label: 'Gray',
        emoji: '🩶',
        background: '#F5F5F5',
        backgroundDark: '#EEEEEE',
        backgroundGradient: 'linear-gradient(135deg, #FAFAFA 0%, #F5F5F5 50%, #EEEEEE 100%)',
        text: '#424242',
        pin: '#616161',
        tape: 'rgba(97, 97, 97, 0.3)',
        fold: '#9E9E9E',
        border: '#BDBDBD'
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // VIBRANT COLORS
    // ═══════════════════════════════════════════════════════════════════════════
    coral: {
        name: 'coral',
        label: 'Coral',
        emoji: '🔴',
        background: '#FFEBEE',
        backgroundDark: '#FFCDD2',
        backgroundGradient: 'linear-gradient(135deg, #FFF5F5 0%, #FFEBEE 50%, #FFCDD2 100%)',
        text: '#B71C1C',
        pin: '#FF5252',
        tape: 'rgba(255, 82, 82, 0.3)',
        fold: '#FF8A80',
        border: '#EF9A9A'
    },
    mint: {
        name: 'mint',
        label: 'Mint',
        emoji: '🌿',
        background: '#E0F2F1',
        backgroundDark: '#B2DFDB',
        backgroundGradient: 'linear-gradient(135deg, #E8F6F5 0%, #E0F2F1 50%, #B2DFDB 100%)',
        text: '#004D40',
        pin: '#009688',
        tape: 'rgba(0, 150, 136, 0.3)',
        fold: '#4DB6AC',
        border: '#80CBC4'
    },
    lavender: {
        name: 'lavender',
        label: 'Lavender',
        emoji: '💜',
        background: '#EDE7F6',
        backgroundDark: '#D1C4E9',
        backgroundGradient: 'linear-gradient(135deg, #F5F0FA 0%, #EDE7F6 50%, #D1C4E9 100%)',
        text: '#311B92',
        pin: '#673AB7',
        tape: 'rgba(103, 58, 183, 0.3)',
        fold: '#9575CD',
        border: '#B39DDB'
    },
    peach: {
        name: 'peach',
        label: 'Peach',
        emoji: '🍑',
        background: '#FBE9E7',
        backgroundDark: '#FFCCBC',
        backgroundGradient: 'linear-gradient(135deg, #FFF3E0 0%, #FBE9E7 50%, #FFCCBC 100%)',
        text: '#BF360C',
        pin: '#FF5722',
        tape: 'rgba(255, 87, 34, 0.3)',
        fold: '#FF8A65',
        border: '#FFAB91'
    },
    sky: {
        name: 'sky',
        label: 'Sky',
        emoji: '🩵',
        background: '#E0F7FA',
        backgroundDark: '#B2EBF2',
        backgroundGradient: 'linear-gradient(135deg, #E8FAFB 0%, #E0F7FA 50%, #B2EBF2 100%)',
        text: '#006064',
        pin: '#00BCD4',
        tape: 'rgba(0, 188, 212, 0.3)',
        fold: '#4DD0E1',
        border: '#80DEEA'
    },
    lemon: {
        name: 'lemon',
        label: 'Lemon',
        emoji: '🍋',
        background: '#F9FBE7',
        backgroundDark: '#F0F4C3',
        backgroundGradient: 'linear-gradient(135deg, #FCFDE8 0%, #F9FBE7 50%, #F0F4C3 100%)',
        text: '#827717',
        pin: '#CDDC39',
        tape: 'rgba(205, 220, 57, 0.4)',
        fold: '#DCE775',
        border: '#E6EE9C'
    }
};

/**
 * Get theme colors by name (with fallback to yellow)
 * @param {string} themeName - Theme name
 * @returns {object} Theme color object
 */
export function getThemeColors(themeName) {
    return stickerThemes[themeName] || stickerThemes.yellow;
}

/**
 * Theme options for dropdown selectors
 */
export const themeOptions = Object.entries(stickerThemes).map(([key, theme]) => ({
    value: key,
    label: theme.label,
    color: theme.background,
    emoji: theme.emoji
}));

/**
 * Color presets for quick selection (most common sticky note colors)
 */
export const colorPresets = [
    { name: 'yellow', color: '#FFF9C4', label: 'Жёлтый' },
    { name: 'pink', color: '#FCE4EC', label: 'Розовый' },
    { name: 'blue', color: '#E3F2FD', label: 'Голубой' },
    { name: 'green', color: '#E8F5E9', label: 'Зелёный' },
    { name: 'purple', color: '#F3E5F5', label: 'Фиолетовый' },
    { name: 'orange', color: '#FFF3E0', label: 'Оранжевый' },
    { name: 'coral', color: '#FFEBEE', label: 'Коралловый' },
    { name: 'mint', color: '#E0F2F1', label: 'Мятный' },
    { name: 'lavender', color: '#EDE7F6', label: 'Лавандовый' },
    { name: 'peach', color: '#FBE9E7', label: 'Персиковый' },
    { name: 'sky', color: '#E0F7FA', label: 'Небесный' },
    { name: 'lemon', color: '#F9FBE7', label: 'Лимонный' },
    { name: 'white', color: '#FFFFFF', label: 'Белый' },
    { name: 'cream', color: '#FFFEF5', label: 'Кремовый' },
    { name: 'gray', color: '#F5F5F5', label: 'Серый' }
];

/**
 * Shadow presets for sticker depth effects
 */
export const shadowPresets = {
    none: {
        name: 'none',
        label: 'Нет',
        value: 'none'
    },
    subtle: {
        name: 'subtle',
        label: 'Лёгкая',
        value: '1px 2px 4px rgba(0, 0, 0, 0.1)'
    },
    medium: {
        name: 'medium',
        label: 'Средняя',
        value: '2px 4px 8px rgba(0, 0, 0, 0.15)'
    },
    strong: {
        name: 'strong',
        label: 'Сильная',
        value: '3px 6px 12px rgba(0, 0, 0, 0.2)'
    },
    lifted: {
        name: 'lifted',
        label: 'Приподнятая',
        value: '0 8px 16px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)'
    },
    floating: {
        name: 'floating',
        label: 'Парящая',
        value: '0 12px 24px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.08)'
    }
};

export const shadowOptions = Object.entries(shadowPresets).map(([key, preset]) => ({
    value: preset.value,
    label: preset.label
}));

export default stickerThemes;
