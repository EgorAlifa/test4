/**
 * Типы узлов графа (для цвета и подписи)
 */
export const NODE_TYPES = {
    FACTOR: 'factor',
    OPERATION: 'operation',
    CRITICAL: 'critical'
};

/**
 * Цвета узлов по умолчанию (как на скрине: фиолетовые узлы, красноватый критический)
 */
export const DEFAULT_NODE_COLORS = {
    [NODE_TYPES.FACTOR]: '#b8a9c9',
    [NODE_TYPES.OPERATION]: '#b8a9c9',
    [NODE_TYPES.CRITICAL]: '#e8a598'
};

/**
 * Размеры узлов (радиус в px)
 */
export const DEFAULT_NODE_SIZES = {
    [NODE_TYPES.FACTOR]: 28,
    [NODE_TYPES.OPERATION]: 28,
    [NODE_TYPES.CRITICAL]: 36
};

/**
 * Цвет рёбер по умолчанию
 */
export const DEFAULT_EDGE_COLOR = '#b8a9c9';

/**
 * Толщина ребра по умолчанию (если вес не задан)
 */
export const DEFAULT_EDGE_WIDTH = 1.5;

/**
 * Мин/макс толщина ребра по весу
 */
export const EDGE_WIDTH_MIN = 0.5;
export const EDGE_WIDTH_MAX = 4;

/**
 * Прозрачность ребра по умолчанию
 */
export const DEFAULT_EDGE_OPACITY = 0.6;
