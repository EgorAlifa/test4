/**
 * Тексты ошибок помощника для пользователя.
 */

/**
 * Текст ошибки по `ApiError` (или любой другой ошибке).
 *
 * @param {{ status?: number, code?: string } | Error | null | undefined} error
 * @return {string}
 */
export function errorText(error) {
    const err = /** @type {any} */ (error) || {};
    const code = typeof err.code === 'string' ? err.code : '';
    const status = typeof err.status === 'number' ? err.status : -1;

    if (code === 'IMAGE_REJECTED' || code === 'BAD_IMAGES') {
        return 'Не удалось обработать изображение. Попробуйте другое изображение или задайте вопрос текстом.';
    }
    // коды встроенного бэкенда (модель вызывается из браузера)
    if (code === 'PROVIDER_AUTH') {
        return 'Модель отклонила ключ доступа. Проверьте ключ и заголовок авторизации в настройках виджета.';
    }
    if (code === 'PROVIDER_UNREACHABLE') {
        return 'Не удалось связаться с моделью: адрес недоступен или провайдер не разрешает запросы из браузера (CORS).';
    }
    if (code === 'BUDGET_EXCEEDED' || status === 402) {
        return 'Лимит запросов к помощнику исчерпан. Попробуйте позже.';
    }
    if (status === 429 || code === 'RATE_LIMITED') {
        return 'Слишком много вопросов подряд. Подождите немного и попробуйте снова.';
    }
    if (status === 401 || code === 'UNAUTHORIZED') {
        return 'Нужно войти в систему, чтобы пользоваться помощником.';
    }
    if (status === 504 || code === 'TIMEOUT') {
        return 'Помощник не успел ответить. Попробуйте ещё раз или упростите вопрос.';
    }
    if (status === 413 || code === 'TOO_LARGE') {
        return 'Слишком большой запрос. Сократите вопрос и попробуйте снова.';
    }
    if (status === 503 || status === 0 || code === 'UNAVAILABLE' || code === 'NETWORK') {
        return 'Помощник сейчас недоступен. Попробуйте позже.';
    }
    return 'Не удалось получить ответ. Попробуйте ещё раз.';
}
