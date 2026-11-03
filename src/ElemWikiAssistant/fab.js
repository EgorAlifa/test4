/**
 * Оформление плавающей кнопки: иконки, тени, пресеты и расчёт стилей из пропсов.
 * Используется и виджетом, и превью в панели «Кнопка» — превью всегда совпадает с кнопкой на странице.
 */

/** Иконки 24×24 (одна path, fill: currentColor) */
export const FAB_ICONS = Object.freeze({
    chat: {
        label: 'Чат',
        path: 'M12 3C6.5 3 2 6.6 2 11c0 2.4 1.3 4.5 3.4 6L4.6 21l4.2-2.3c1 .2 2.1.3 3.2.3 5.5 0 10-3.6 10-8s-4.5-8-10-8Zm-4 9.3a1.3 1.3 0 1 1 0-2.6 1.3 1.3 0 0 1 0 2.6Zm4 0a1.3 1.3 0 1 1 0-2.6 1.3 1.3 0 0 1 0 2.6Zm4 0a1.3 1.3 0 1 1 0-2.6 1.3 1.3 0 0 1 0 2.6Z'
    },
    sparkle: {
        label: 'Искра',
        path: 'M10 2.5 11.8 8a3 3 0 0 0 1.9 1.9l5.5 1.8-5.5 1.8a3 3 0 0 0-1.9 1.9L10 21l-1.8-5.6a3 3 0 0 0-1.9-1.9L.8 11.7l5.5-1.8A3 3 0 0 0 8.2 8L10 2.5Zm9-1 .8 2.2c.1.4.4.7.8.8l2.2.8-2.2.7a1.3 1.3 0 0 0-.8.8L19 9l-.8-2.2a1.3 1.3 0 0 0-.8-.8L15.2 5.3l2.2-.8c.4-.1.7-.4.8-.8L19 1.5Z'
    },
    question: {
        label: 'Вопрос',
        path: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1.1 16h-2.2v-2.1h2.2V18Zm2.3-7.8-1 1c-.8.8-1.3 1.5-1.3 3.1h-2.1v-.5c0-1.2.5-2.3 1.3-3.1l1.3-1.3c.4-.4.6-.9.6-1.4a2 2 0 0 0-4 0H8.1a4 4 0 0 1 8 0c0 .9-.3 1.6-.7 2.2Z'
    },
    robot: {
        label: 'Бот',
        path: 'M13 2.1V4h4a3 3 0 0 1 3 3v2h1a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-1v2a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-2H3a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h1V7a3 3 0 0 1 3-3h4V2.1a1.5 1.5 0 1 1 2 0ZM9 9.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm6 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM8.5 15v1.5h7V15h-7Z'
    },
    book: {
        label: 'Книга',
        path: 'M4 4.5A2.5 2.5 0 0 1 6.5 2H20v16H6.5a1 1 0 0 0 0 2H20v2H6.5A2.5 2.5 0 0 1 4 19.5v-15ZM8 6v2h8V6H8Zm0 4v2h6v-2H8Z'
    },
    none: { label: 'Без иконки', path: '' }
});

export const FAB_SHAPES = Object.freeze([
    { label: 'Круг', value: 'circle' },
    { label: 'Скругл.', value: 'squircle' },
    { label: 'Квадрат', value: 'square' }
]);

export const FAB_SHADOWS = Object.freeze({
    none: { label: 'Нет', value: 'none' },
    s: { label: 'S', value: '0 2px 6px rgba(15, 23, 42, 0.16)' },
    m: { label: 'M', value: '0 8px 24px var(--aiw-fab-glow), 0 2px 6px rgba(15, 23, 42, 0.12)' },
    l: { label: 'L', value: '0 16px 40px var(--aiw-fab-glow), 0 4px 12px rgba(15, 23, 42, 0.16)' }
});

/** Пресеты: набор пропсов кнопки. Пустой fabBg — акцентный цвет виджета. */
export const FAB_PRESETS = Object.freeze({
    classic: {
        label: 'Классика',
        props: { fabShape: 'circle', fabBg: '', fabIconColor: '#ffffff', fabIcon: 'chat', fabLabel: '', fabSize: 56, fabShadow: 'm', fabBorderWidth: 0 }
    },
    pill: {
        label: 'Пилюля',
        props: { fabShape: 'circle', fabBg: '', fabIconColor: '#ffffff', fabIcon: 'sparkle', fabLabel: 'Спросить', fabSize: 52, fabShadow: 'm', fabBorderWidth: 0 }
    },
    dark: {
        label: 'Тёмная',
        props: { fabShape: 'squircle', fabBg: '#111827', fabIconColor: '#facc15', fabIcon: 'sparkle', fabLabel: '', fabSize: 56, fabShadow: 'l', fabBorderWidth: 0 }
    },
    light: {
        label: 'Светлая',
        props: { fabShape: 'circle', fabBg: '#ffffff', fabIconColor: '', fabIcon: 'question', fabLabel: '', fabSize: 52, fabShadow: 's', fabBorderWidth: 1, fabBorderColor: '#e2e8f0' }
    },
    bot: {
        label: 'Бот',
        props: { fabShape: 'squircle', fabBg: '#10b981', fabIconColor: '#ffffff', fabIcon: 'robot', fabLabel: '', fabSize: 56, fabShadow: 'm', fabBorderWidth: 0 }
    },
    minimal: {
        label: 'Минимал',
        props: { fabShape: 'square', fabBg: '#f1f5f9', fabIconColor: '#334155', fabIcon: 'book', fabLabel: '', fabSize: 44, fabShadow: 'none', fabBorderWidth: 1, fabBorderColor: '#cbd5e1' }
    }
});

export const FAB_SIZE = Object.freeze({ min: 36, max: 88, default: 56 });

/**
 * @param {unknown} value
 * @param {number} fallback
 */
const num = (value, fallback) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
};

/**
 * Внешний вид кнопки по пропсам виджета.
 *
 * @param {object} p — props виджета
 * @return {{ style: object, iconPath: string, iconSize: number, label: string, shape: string }}
 */
export function fabVisual(p) {
    const accent = p.accentColor || '#4f46e5';
    const bg = p.fabBg || accent;
    const size = Math.min(FAB_SIZE.max, Math.max(FAB_SIZE.min, num(p.fabSize, FAB_SIZE.default)));
    const label = String(p.fabLabel || '').trim();
    const icon = FAB_ICONS[p.fabIcon] || FAB_ICONS.chat;
    const shape = ['circle', 'squircle', 'square'].includes(p.fabShape) ? p.fabShape : 'circle';
    const radius = { circle: `${size / 2}px`, squircle: `${Math.round(size * 0.3)}px`, square: `${Math.round(size * 0.12)}px` }[shape];
    const shadow = (FAB_SHADOWS[p.fabShadow] || FAB_SHADOWS.m).value;
    const borderWidth = Math.max(0, num(p.fabBorderWidth, 0));
    return {
        shape,
        label,
        iconPath: icon.path,
        iconSize: Math.round(size * 0.46),
        style: {
            '--aiw-fab-glow': `color-mix(in srgb, ${bg} 40%, transparent)`,
            '--aiw-fab-bg': bg,
            height: `${size}px`,
            minWidth: `${size}px`,
            padding: label ? `0 ${Math.round(size * 0.36)}px 0 ${Math.round(size * (icon.path ? 0.28 : 0.36))}px` : '0',
            borderRadius: radius,
            background: bg,
            color: p.fabIconColor || accent,
            boxShadow: shadow,
            border: borderWidth ? `${borderWidth}px solid ${p.fabBorderColor || 'rgba(0, 0, 0, 0.12)'}` : 'none',
            fontSize: `${Math.max(12, Math.round(size * 0.27))}px`
        }
    };
}
