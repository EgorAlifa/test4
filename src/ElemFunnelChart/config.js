// Конфигурация для ElemFunnelChart виджета

// Настройки рендеринга данных, UI контролов, списки опций, CSS классы и стили
export const FUNNEL_CONFIG = {
    // Настройки по умолчанию для новых экземпляров виджета
    defaults: {
        orientation: 'vertical',
        sort: 'descending',
        labelPosition: 'outside',
        showPercentage: true,
        funnelWidth: '80%',
        funnelHeight: '80%',
        gap: 2,
        colorScheme: 'default',
        showTitle: true,
        showLegend: true,
        legendPosition: 'right'
    },
    
    // CSS классы для различных состояний
    cssClasses: {
        container: 'elem-funnel-chart',
        loading: 'elem-funnel-chart--loading',
        error: 'elem-funnel-chart--error',
        empty: 'elem-funnel-chart--empty',
        interactive: 'elem-funnel-chart--interactive'
    },
    
    // Настройки анимации
    animation: {
        duration: 1000,
        easing: 'cubicOut',
        delay: 0
    },
    
    // Настройки производительности
    performance: {
        maxDataPoints: 50,
        enableLazyUpdate: true,
        throttleResize: 200
    },
    
    // Настройки доступности
    accessibility: {
        ariaLabel: 'Диаграмма воронки',
        keyboardNavigation: true,
        highContrast: false
    },
    
    // Настройки экспорта
    export: {
        formats: ['png', 'jpg', 'svg', 'pdf'],
        quality: 1,
        backgroundColor: '#ffffff'
    }
};

// Текстовые константы для интерфейса
export const UI_TEXTS = {
    loading: 'Загрузка данных...',
    noData: 'Нет данных для отображения',
    noDataset: 'Датасет не выбран',
    error: 'Произошла ошибка при отображении диаграммы',
    drilldownAvailable: 'Детализация доступна',
    drilldownUnavailable: 'Детализация недоступна',
    back: 'Назад',
    selectMetric: 'Выберите метрику',
    selectDimension: 'Выберите измерение'
};

// Настройки валидации
export const VALIDATION_RULES = {
    metric: {
        required: true,
        message: 'Метрика обязательна для отображения воронки'
    },
    dimension: {
        required: true,
        message: 'Измерение обязательно для отображения воронки'
    },
    funnelWidth: {
        pattern: /^(\d+(%|px)|\d+\.?\d*%)$/,
        message: 'Ширина должна быть в формате "80%" или "400px"'
    },
    funnelHeight: {
        pattern: /^(\d+(%|px)|\d+\.?\d*%)$/,
        message: 'Высота должна быть в формате "80%" или "300px"'
    },
    gap: {
        min: 0,
        max: 20,
        message: 'Расстояние должно быть от 0 до 20 пикселей'
    }
};

// Рекомендуемые настройки для различных сценариев
export const RECOMMENDATIONS = {
    salesFunnel: {
        orientation: 'vertical',
        sort: 'descending',
        showPercentage: true,
        colorScheme: 'blue',
        description: 'Оптимально для воронки продаж'
    },
    conversionFunnel: {
        orientation: 'vertical',
        sort: 'descending',
        showPercentage: true,
        colorScheme: 'green',
        labelPosition: 'inside',
        description: 'Подходит для анализа конверсии'
    },
    processFunnel: {
        orientation: 'horizontal',
        sort: 'none',
        showPercentage: false,
        colorScheme: 'orange',
        description: 'Для отображения последовательных процессов'
    }
}; 