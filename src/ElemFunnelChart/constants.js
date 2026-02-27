// Константы для воронки
export const ORIENTATION_OPTIONS = [
    { label: 'Вертикальная', value: 'vertical' },
    { label: 'Горизонтальная', value: 'horizontal' }
];

export const SORT_OPTIONS = [
    { label: 'По убыванию', value: 'descending' },
    { label: 'По возрастанию', value: 'ascending' },
    { label: 'Без сортировки', value: 'none' }
];

export const LABEL_POSITION_OPTIONS = [
    { label: 'Снаружи', value: 'outside' },
    { label: 'Внутри', value: 'inside' },
    { label: 'Слева', value: 'left' },
    { label: 'Справа', value: 'right' },
    { label: 'Сверху', value: 'top' },
    { label: 'Снизу', value: 'bottom' },
    { label: 'По центру', value: 'center' }
];

export const COLOR_SCHEMES = [
    { label: 'По умолчанию', value: 'default' },
    { label: 'Синий градииент', value: 'blue' },
    { label: 'Зеленый градиент', value: 'green' },
    { label: 'Оранжевый градиент', value: 'orange' },
    { label: 'Пурпурный градиент', value: 'purple' },
    { label: 'Радуга', value: 'rainbow' }
];

export const LEGEND_POSITION_OPTIONS = [
    { label: 'Справа', value: 'right' },
    { label: 'Слева', value: 'left' },
    { label: 'Сверху', value: 'top' },
    { label: 'Снизу', value: 'bottom' }
];

// Цветовые палитры
export const COLOR_PALETTES = {
    default: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'],
    blue: ['#1e3a8a', '#1e40af', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'],
    green: ['#14532d', '#166534', '#15803d', '#16a34a', '#22c55e', '#4ade80', '#86efac', '#bbf7d0'],
    orange: ['#9a3412', '#c2410c', '#ea580c', '#f97316', '#fb923c', '#fdba74', '#fed7aa', '#ffedd5'],
    purple: ['#581c87', '#6b21a8', '#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe'],
    rainbow: ['#ff0000', '#ff8000', '#ffff00', '#80ff00', '#00ff00', '#00ff80', '#00ffff', '#0080ff', '#0000ff', '#8000ff']
};

// Настройки анимации
export const ANIMATION_DURATION = 1000;
export const ANIMATION_EASING = 'cubicOut';

// Размеры по умолчанию
export const DEFAULT_FUNNEL_WIDTH = '80%';
export const DEFAULT_FUNNEL_HEIGHT = '80%';
export const DEFAULT_GAP = 2;

// Форматирование данных
export const VALUE_FORMATTER = (value) => {
    if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
};

export const PERCENTAGE_FORMATTER = (params) => {
    return `${params.name}: ${params.value} (${params.percent}%)`;
}; 