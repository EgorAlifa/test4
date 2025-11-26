/* place constant values, magic numbers here */

export const DEFAULT_BUTTON_PADDING = { size: 12, unit: 'px' }; // eslint-disable-line no-magic-numbers
export const DEFAULT_BUTTON_GAP = { size: 8, unit: 'px' }; // eslint-disable-line no-magic-numbers
export const DEFAULT_FONT_SIZE = { size: 14, unit: 'px' }; // eslint-disable-line no-magic-numbers
export const DEFAULT_BORDER_RADIUS = '6px';

export const DEFAULT_COLORS = {
    ACTIVE: '#3b82f6',
    HOVER: '#60a5fa',
    BACKGROUND: '#ffffff',
    TEXT: '#1f2937'
};

export const MOCK_ROUTES = [
    {
        id: 'mock-1',
        title: 'Главная',
        name: 'index',
        slug: '/',
        enabled: true,
        icon: '🏠'
    },
    {
        id: 'mock-2',
        title: 'Страница 1',
        name: 'page1',
        slug: '/page1',
        enabled: true,
        icon: '📄'
    },
    {
        id: 'mock-3',
        title: 'Страница 2',
        name: 'page2',
        slug: '/page2',
        enabled: true,
        icon: '📋'
    }
];
