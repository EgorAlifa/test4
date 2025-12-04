/* Утилиты для виджета API */

/**
 * Парсит заголовки из строки в объект
 * @param {string} headersString - строка с заголовками
 * @returns {object} объект заголовков
 */
export const parseHeaders = (headersString) => {
    if (!headersString) return {};
    
    const headers = {};
    const lines = headersString.split('\n');
    
    lines.forEach(line => {
        const separatorIndex = line.indexOf(':');
        if (separatorIndex > 0) {
            const key = line.substring(0, separatorIndex).trim();
            const value = line.substring(separatorIndex + 1).trim();
            if (key && value) {
                headers[key] = value;
            }
        }
    });
    
    return headers;
};

/**
 * Парсит тело запроса в зависимости от формата
 * @param {string} bodyString - строка тела запроса
 * @param {string} format - формат тела (json, formData, raw)
 * @returns {any} обработанное тело запроса
 */
export const parseBody = (bodyString, format) => {
    if (!bodyString) return null;
    
    try {
        switch (format) {
            case 'json':
                return JSON.parse(bodyString);
            case 'formData':
                const formData = new FormData();
                const pairs = bodyString.split('\n');
                pairs.forEach(pair => {
                    const [key, value] = pair.split('=').map(s => s.trim());
                    if (key && value) {
                        formData.append(key, value);
                    }
                });
                return formData;
            case 'raw':
            default:
                return bodyString;
        }
    } catch (error) {
        console.error('Ошибка парсинга тела запроса:', error);
        return bodyString;
    }
};

/**
 * Извлекает значение из вложенного объекта по пути
 * @param {object} obj - объект
 * @param {string} path - путь (например, 'data.user.name')
 * @returns {any} значение по указанному пути
 */
export const getValueByPath = (obj, path) => {
    if (!obj || !path) return obj;
    
    const keys = path.split('.');
    let result = obj;
    
    for (const key of keys) {
        if (result && typeof result === 'object' && key in result) {
            result = result[key];
        } else {
            return undefined;
        }
    }
    
    return result;
};

/**
 * Ограничивает глубину объекта
 * @param {any} obj - объект для ограничения
 * @param {number} maxDepth - максимальная глубина (-1 для неограниченной)
 * @param {number} currentDepth - текущая глубина
 * @returns {any} объект с ограниченной глубиной
 */
export const limitDepth = (obj, maxDepth, currentDepth = 0) => {
    if (maxDepth === -1) return obj;
    if (currentDepth >= maxDepth) return '[...]';
    
    if (Array.isArray(obj)) {
        return obj.map(item => limitDepth(item, maxDepth, currentDepth + 1));
    }
    
    if (obj !== null && typeof obj === 'object') {
        const result = {};
        for (const [key, value] of Object.entries(obj)) {
            result[key] = limitDepth(value, maxDepth, currentDepth + 1);
        }
        return result;
    }
    
    return obj;
};

/**
 * Форматирует JSON для отображения
 * @param {any} data - данные для форматирования
 * @param {number} indent - отступ
 * @returns {string} отформатированная строка JSON
 */
export const formatJson = (data, indent = 2) => {
    try {
        return JSON.stringify(data, null, indent);
    } catch (error) {
        return String(data);
    }
};

/**
 * Определяет тип значения для отображения
 * @param {any} value - значение
 * @returns {string} тип значения
 */
export const getValueType = (value) => {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (Array.isArray(value)) return 'array';
    return typeof value;
};

/**
 * Конвертирует объект в массив для табличного отображения
 * @param {object|array} data - данные
 * @returns {array} массив объектов
 */
export const convertToTableData = (data) => {
    if (Array.isArray(data)) {
        return data;
    }
    
    if (data && typeof data === 'object') {
        return [data];
    }
    
    return [];
};

