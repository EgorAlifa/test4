/* Конфигурация для рендера данных виджета API */

export const HTTP_METHOD_OPTIONS = [
    { label: 'GET', value: 'GET' },
    { label: 'POST', value: 'POST' },
    { label: 'PUT', value: 'PUT' },
    { label: 'DELETE', value: 'DELETE' }
];

export const BODY_FORMAT_OPTIONS = [
    { label: 'JSON', value: 'json' },
    { label: 'Form Data', value: 'formData' },
    { label: 'Raw Text', value: 'raw' },
    { label: 'None', value: 'none' }
];

export const JSON_DISPLAY_OPTIONS = [
    { label: 'Дерево', value: 'tree' },
    { label: 'Сырой JSON', value: 'raw' },
    { label: 'Таблица', value: 'table' }
];

export const DEPTH_OPTIONS = [
    { label: '1 уровень', value: 1 },
    { label: '2 уровня', value: 2 },
    { label: '3 уровня', value: 3 },
    { label: '4 уровня', value: 4 },
    { label: '5 уровней', value: 5 },
    { label: 'Все уровни', value: -1 }
];

export const SIZE_OPTIONS = [
    { label: 'Маленький', value: 'small' },
    { label: 'Средний', value: 'medium' },
    { label: 'Большой', value: 'large' }
];

export const FONT_SIZE_OPTIONS = [
    { label: '12px', value: '12px' },
    { label: '14px', value: '14px' },
    { label: '16px', value: '16px' },
    { label: '18px', value: '18px' },
    { label: '20px', value: '20px' }
];

