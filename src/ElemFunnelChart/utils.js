import { COLOR_PALETTES, VALUE_FORMATTER, PERCENTAGE_FORMATTER } from './constants';

/**
 * Трансформирует данные из dataset в формат для funnel диаграммы
 * @param {Array} rows - строки данных из dataset
 * @param {string} dimensionField - поле измерения 
 * @param {string} metricField - поле метрики
 * @param {string} sortType - тип сортировки ('ascending', 'descending', 'none')
 * @returns {Array} данные в формате ECharts funnel
 */
export const transformDataForFunnel = (rows, dimensionField, metricField, sortType = 'descending') => {
    if (!rows || !dimensionField || !metricField) {
        return [];
    }

    let data = rows.map(row => ({
        name: row[dimensionField] || 'Неизвестно',
        value: Number(row[metricField]) || 0
    }));

    // Применяем сортировку
    if (sortType === 'descending') {
        data.sort((a, b) => b.value - a.value);
    } else if (sortType === 'ascending') {
        data.sort((a, b) => a.value - b.value);
    }
    // Для 'none' не сортируем

    return data;
};

/**
 * Получает цветовую палитру по названию схемы
 * @param {string} schemeName - название цветовой схемы
 * @returns {Array} массив цветов
 */
export const getColorPalette = (schemeName = 'default') => {
    return COLOR_PALETTES[schemeName] || COLOR_PALETTES.default;
};

/**
 * Генерирует градиентные цвета для funnel диаграммы
 * @param {Array} data - данные funnel диаграммы
 * @param {string} colorScheme - цветовая схема
 * @returns {Array} массив цветов для каждого сегмента
 */
export const generateFunnelColors = (data, colorScheme = 'default') => {
    const palette = getColorPalette(colorScheme);
    const colors = [];
    
    for (let i = 0; i < data.length; i++) {
        const colorIndex = i % palette.length;
        colors.push(palette[colorIndex]);
    }
    
    return colors;
};

/**
 * Создает конфигурацию ECharts для funnel диаграммы
 * @param {Object} params - параметры конфигурации
 * @returns {Object} ECharts option object
 */
export const createFunnelOption = ({
    data,
    orientation = 'vertical',
    labelPosition = 'outside',
    showPercentage = true,
    funnelWidth = '80%',
    funnelHeight = '80%',
    gap = 2,
    colorScheme = 'default',
    showTitle = true,
    title = '',
    showLegend = true,
    legendPosition = 'right'
}) => {
    const colors = generateFunnelColors(data, colorScheme);
    
    const option = {
        color: colors,
        tooltip: {
            trigger: 'item',
            formatter: showPercentage ? PERCENTAGE_FORMATTER : '{b}: {c}'
        },
        series: [{
            name: 'Воронка',
            type: 'funnel',
            orient: orientation,
            left: orientation === 'horizontal' ? '10%' : 'center',
            top: orientation === 'horizontal' ? 'center' : '60',
            width: funnelWidth,
            height: funnelHeight,
            gap: gap,
            sort: 'none', // сортировка уже применена в данных
            label: {
                show: true,
                position: labelPosition,
                formatter: showPercentage ? 
                    (params) => `${params.name}\n${VALUE_FORMATTER(params.value)} (${params.percent}%)` :
                    (params) => `${params.name}\n${VALUE_FORMATTER(params.value)}`
            },
            labelLine: {
                show: labelPosition === 'outside',
                length: 10,
                lineStyle: {
                    width: 1,
                    type: 'solid'
                }
            },
            itemStyle: {
                borderColor: '#fff',
                borderWidth: 1
            },
            emphasis: {
                itemStyle: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            },
            data: data
        }]
    };

    // Добавляем заголовок
    if (showTitle && title) {
        option.title = {
            text: title,
            left: 'center',
            top: '20',
            textStyle: {
                fontSize: 18,
                fontWeight: 'bold'
            }
        };
    }

    // Добавляем легенду
    if (showLegend) {
        option.legend = {
            orient: legendPosition === 'top' || legendPosition === 'bottom' ? 'horizontal' : 'vertical',
            left: legendPosition === 'left' ? '10' : legendPosition === 'right' ? 'right' : 'center',
            top: legendPosition === 'top' ? '10' : legendPosition === 'bottom' ? 'bottom' : 'middle',
            data: data.map(item => item.name)
        };
    }

    return option;
};

/**
 * Обрабатывает клик по сегменту воронки для drilldown
 * @param {Object} params - параметры события ECharts
 * @param {Function} drilldownHandler - функция обработки drilldown
 */
export const handleFunnelClick = (params, drilldownHandler) => {
    if (drilldownHandler && params.name) {
        drilldownHandler(params.name, params.value);
    }
};

/**
 * Вычисляет размеры контейнера для funnel диаграммы
 * @param {Object} containerRef - ссылка на DOM элемент контейнера
 * @returns {Object} объект с width и height
 */
export const calculateContainerSize = (containerRef) => {
    if (!containerRef) {
        return { width: '100%', height: '400px' };
    }
    
    const rect = containerRef.getBoundingClientRect();
    return {
        width: rect.width || 400,
        height: rect.height || 400
    };
};

/**
 * Проверяет валидность данных для funnel диаграммы
 * @param {Array} data - данные для проверки
 * @returns {boolean} true если данные валидны
 */
export const validateFunnelData = (data) => {
    if (!Array.isArray(data) || data.length === 0) {
        return false;
    }
    
    return data.every(item => 
        item && 
        typeof item.name === 'string' && 
        typeof item.value === 'number' && 
        item.value >= 0
    );
}; 