/* place utility functions here */

/**
 * Валидация URL изображения
 * @param {string} url - URL для проверки
 * @returns {boolean} - true если URL валиден
 */
export const isValidImageUrl = (url) => {
    if (typeof url !== 'string' || url.trim() === '') {
        return false;
    }

    const trimmed = url.trim();
    
    // Принимаем любую непустую строку как потенциальный URL
    // Более строгая валидация может отсеять валидные относительные пути
    if (trimmed.length === 0) {
        return false;
    }

    // Проверяем абсолютные URL
    try {
        const urlObj = new URL(trimmed);
        return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
        // Если не валидный абсолютный URL, проверяем на относительный путь или просто принимаем как есть
        return trimmed.startsWith('/') || trimmed.startsWith('./') || trimmed.startsWith('../') || trimmed.length > 0;
    }
};

/**
 * Получение массива изображений из результатов датасета
 * @param {Array|Object} results - Результаты датасета (может быть массивом или объектом)
 * @param {string} imageField - Поле с URL изображения
 * @returns {Array<string>} - Массив URL изображений
 */
export const extractImagesFromDataset = (results, imageField) => {
    if (!imageField) {
        return [];
    }

    if (!results) {
        return [];
    }

    const images = [];
    
    // Если results - это объект с полем rows (один результат датасета)
    if (results.rows && Array.isArray(results.rows)) {
        results.rows.forEach((row) => {
            if (row && row[imageField] != null) {
                const url = String(row[imageField]).trim();
                if (url && url.length > 0) {
                    images.push(url);
                }
            }
        });
        return images;
    }
    
    // Если results - это массив результатов
    if (Array.isArray(results)) {
        results.forEach((result) => {
            // Каждый элемент может быть объектом с rows
            if (result && result.rows && Array.isArray(result.rows)) {
                result.rows.forEach((row) => {
                    if (row && row[imageField] != null) {
                        const url = String(row[imageField]).trim();
                        if (url && url.length > 0) {
                            images.push(url);
                        }
                    }
                });
            } else if (result && typeof result === 'object') {
                // Если элемент - объект, но без rows, проверяем напрямую
                if (result[imageField] != null) {
                    const url = String(result[imageField]).trim();
                    if (url && url.length > 0) {
                        images.push(url);
                    }
                }
            }
        });
        return images;
    }
    
    return [];
};

/**
 * Фильтрация массива изображений, оставляя только валидные URL
 * @param {Array<string>} images - Массив URL
 * @returns {Array<string>} - Отфильтрованный массив
 */
export const filterValidImages = (images) => {
    if (!Array.isArray(images)) {
        return [];
    }

    return images.filter((url) => {
        if (typeof url !== 'string') {
            return false;
        }
        return isValidImageUrl(url.trim());
    });
};

