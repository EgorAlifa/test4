/**
 * Клиент серверного API помощника: `status`, `route`, `ask`.
 *
 * `ask` умеет читать как JSON-ответ, так и поток SSE (`delta` → приращение текста,
 * `done` → итоговый очищенный ответ, `error` → ошибка модели).
 *
 * @typedef {{ isAvailable: boolean, isFullGuide?: boolean, reason?: 'signed-out'|'unavailable'|'disabled' }} StatusInfo
 * @typedef {{ id: string, title: string, lead?: string }} RoutePage
 * @typedef {{ pageId: string, title: string, heading: string, text: string }} AskSection
 * @typedef {{ role: 'user'|'assistant', content: string }} HistoryEntry
 * @typedef {{ question: string, sections: AskSection[], history?: HistoryEntry[], pageId?: string }} AskPayload
 * @typedef {{ answer: string, pageIds: string[], mode: string }} AskResult
 */

import { API_LIMITS } from '../config.js';
import { createSseParser } from './sse.js';

/** Ошибка запроса к API помощника */
export class ApiError extends Error {
    /**
     * @param {number} status HTTP-статус (0 — сетевая ошибка)
     * @param {string} [code] код ошибки сервера (`BUDGET_EXCEEDED`, `UNAVAILABLE`, …)
     * @param {string} [message]
     */
    constructor(status, code = '', message = '') {
        super(message || `Assistant API error ${status}${code ? ` ${code}` : ''}`);
        this.name = 'ApiError';
        this.status = status;
        this.code = code;
    }
}

/**
 * @param {string} base
 * @return {string}
 */
function normalizeBase(base) {
    const str = String(base || '');
    return str.endsWith('/') ? str : `${str}/`;
}

/**
 * @param {unknown} error
 * @return {boolean}
 */
function isAbortError(error) {
    return !!error && /** @type {any} */ (error).name === 'AbortError';
}

/**
 * @return {Error}
 */
function makeAbortError() {
    if (typeof DOMException === 'function') {
        return new DOMException('Aborted', 'AbortError');
    }
    const error = new Error('Aborted');
    error.name = 'AbortError';
    return error;
}

/**
 * Сигнал, срабатывающий по внешнему сигналу или по таймауту.
 *
 * @param {AbortSignal|undefined} external
 * @param {number} timeoutMs
 * @return {{ signal: AbortSignal, isTimedOut: () => boolean, dispose: () => void }}
 */
function linkSignal(external, timeoutMs) {
    const controller = new AbortController();
    let timedOut = false;
    const onAbort = () => controller.abort();
    if (external) {
        if (external.aborted) {
            controller.abort();
        } else {
            external.addEventListener('abort', onAbort, { once: true });
        }
    }
    const timer = setTimeout(() => {
        timedOut = true;
        controller.abort();
    }, timeoutMs);
    return {
        signal: controller.signal,
        isTimedOut: () => timedOut,
        dispose() {
            clearTimeout(timer);
            if (external) {
                external.removeEventListener('abort', onAbort);
            }
        }
    };
}

/**
 * Код ошибки из JSON-тела ответа (если есть).
 *
 * @param {Response} response
 * @return {Promise<string>}
 */
async function readErrorCode(response) {
    try {
        const body = await response.json();
        return body && typeof body.code === 'string' ? body.code : '';
    } catch (e) {
        return '';
    }
}

/**
 * @param {unknown} value
 * @return {string[]}
 */
function toIdList(value) {
    return Array.isArray(value) ? value.filter((x) => typeof x === 'string' && x) : [];
}

/**
 * @param {any} data
 * @param {string} fallbackAnswer
 * @return {AskResult}
 */
function toAskResult(data, fallbackAnswer = '') {
    const obj = data && typeof data === 'object' ? data : {};
    return {
        answer: typeof obj.answer === 'string' ? obj.answer : fallbackAnswer,
        pageIds: toIdList(obj.pageIds),
        mode: typeof obj.mode === 'string' ? obj.mode : ''
    };
}

/**
 * Каталог страниц для роутинга с учётом лимитов по количеству и объёму.
 *
 * @param {RoutePage[]} pages
 * @return {RoutePage[]}
 */
function trimCatalog(pages) {
    const out = [];
    let total = 0;
    for (const page of Array.isArray(pages) ? pages : []) {
        if (out.length >= API_LIMITS.maxRoutePages) {
            break;
        }
        if (!page || !page.id) {
            continue;
        }
        const item = { id: String(page.id), title: String(page.title || '') };
        if (page.lead) {
            item.lead = String(page.lead);
        }
        const size = item.id.length + item.title.length + (item.lead ? item.lead.length : 0) + 30;
        if (total + size > API_LIMITS.maxRouteCatalogChars) {
            if (item.lead) {
                // пробуем без лида
                delete item.lead;
                const shortSize = item.id.length + item.title.length + 30;
                if (total + shortSize > API_LIMITS.maxRouteCatalogChars) {
                    break;
                }
                total += shortSize;
                out.push(item);
                continue;
            }
            break;
        }
        total += size;
        out.push(item);
    }
    return out;
}

/**
 * Создать клиент API помощника.
 *
 * @param {{
 *   apiBase: string,
 *   fetchImpl?: typeof fetch,
 *   locale?: string,
 *   credentials?: RequestCredentials,
 *   getHeaders?: () => Record<string, string> | undefined
 * }} options
 */
export function createAssistantApi({ apiBase, fetchImpl, locale = 'ru', credentials = 'same-origin', getHeaders }) {
    const base = normalizeBase(apiBase);
    const doFetch = fetchImpl || ((...a) => fetch(...a));

    /**
     * @param {boolean} hasBody
     * @return {Record<string, string>}
     */
    const buildHeaders = (hasBody) => {
        const headers = { Accept: 'application/json, text/event-stream', 'X-UI-Locale': locale };
        if (hasBody) {
            headers['Content-Type'] = 'application/json';
        }
        const extra = typeof getHeaders === 'function' ? getHeaders() : null;
        return extra ? { ...headers, ...extra } : headers;
    };

    /**
     * @param {string} path
     * @param {object|null} body
     * @param {AbortSignal} signal
     * @return {Promise<Response>}
     */
    const request = (path, body, signal) =>
        doFetch(base + path, {
            method: body ? 'POST' : 'GET',
            headers: buildHeaders(!!body),
            body: body ? JSON.stringify(body) : undefined,
            credentials,
            signal
        });

    /**
     * Доступность помощника для текущего пользователя.
     *
     * @param {{ signal?: AbortSignal }} [options]
     * @return {Promise<StatusInfo>}
     */
    async function status({ signal } = {}) {
        let response;
        try {
            response = await request('status', null, signal);
        } catch (error) {
            if (isAbortError(error) && signal && signal.aborted) {
                throw error;
            }
            return { isAvailable: false, reason: 'unavailable' };
        }
        if (response.status === 401) {
            return { isAvailable: false, reason: 'signed-out' };
        }
        if (!response.ok) {
            return { isAvailable: false, reason: 'unavailable' };
        }
        try {
            const data = await response.json();
            if (!data || typeof data !== 'object') {
                return { isAvailable: false, reason: 'unavailable' };
            }
            return { ...data, isAvailable: !!data.isAvailable };
        } catch (error) {
            return { isAvailable: false, reason: 'unavailable' };
        }
    }

    /**
     * Выбор страниц по каталогу (роутинг). Любая ошибка — пустой список.
     *
     * @param {{ question: string, pages: RoutePage[] }} payload
     * @param {{ signal?: AbortSignal }} [options]
     * @return {Promise<string[]>}
     */
    async function route({ question, pages }, { signal } = {}) {
        const link = linkSignal(signal, API_LIMITS.routeTimeoutMs);
        try {
            const body = {
                question: String(question || '').slice(0, API_LIMITS.maxQuestionChars),
                pages: trimCatalog(pages)
            };
            const response = await request('route', body, link.signal);
            if (!response.ok) {
                return [];
            }
            const data = await response.json();
            return toIdList(data && data.pageIds).slice(0, 3);
        } catch (error) {
            if (signal && signal.aborted) {
                throw isAbortError(error) ? error : makeAbortError();
            }
            return [];
        } finally {
            link.dispose();
        }
    }

    /**
     * Чтение потока SSE ответа.
     *
     * @param {Response} response
     * @param {((text: string) => void) | undefined} onDelta
     * @return {Promise<AskResult>}
     */
    async function readStream(response, onDelta) {
        let accumulated = '';
        /** @type {AskResult|null} */
        let result = null;
        /** @type {ApiError|null} */
        let streamError = null;
        const parser = createSseParser((name, data) => {
            if (result || streamError) {
                return;
            }
            if (name === 'delta') {
                const text = data && typeof data.text === 'string' ? data.text : '';
                if (text) {
                    accumulated += text;
                    if (onDelta) {
                        onDelta(text);
                    }
                }
            } else if (name === 'done') {
                result = toAskResult(data, accumulated);
            } else if (name === 'error') {
                streamError = new ApiError(502, (data && data.code) || 'STREAM_ERROR');
            }
        });
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        try {
            while (!result && !streamError) {
                const { done, value } = await reader.read();
                if (done) {
                    parser.feed(decoder.decode());
                    parser.end();
                    break;
                }
                parser.feed(decoder.decode(value, { stream: true }));
            }
        } finally {
            if (result || streamError) {
                reader.cancel().catch(() => {});
            }
            try {
                reader.releaseLock();
            } catch (e) {
                // поток уже освобождён
            }
        }
        if (streamError) {
            throw streamError;
        }
        return result || { answer: accumulated, pageIds: [], mode: '' };
    }

    /**
     * Вопрос модели по найденным разделам.
     *
     * @param {AskPayload} payload
     * @param {{ signal?: AbortSignal, onDelta?: (text: string) => void }} [options]
     * @return {Promise<AskResult>}
     */
    async function ask(payload, { signal, onDelta } = {}) {
        const link = linkSignal(signal, API_LIMITS.askTimeoutMs);
        const body = {
            ...payload,
            question: String((payload && payload.question) || '').slice(0, API_LIMITS.maxQuestionChars),
            sections: (payload && payload.sections) || [],
            history: (payload && payload.history) || [],
            stream: true
        };
        if (!body.pageId) {
            delete body.pageId;
        }
        try {
            const response = await request('ask', body, link.signal);
            if (!response.ok) {
                throw new ApiError(response.status, await readErrorCode(response));
            }
            const type = (response.headers.get('Content-Type') || '').toLowerCase();
            if (type.includes('text/event-stream') && response.body) {
                return await readStream(response, onDelta);
            }
            return toAskResult(await response.json());
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            if (link.isTimedOut() && !(signal && signal.aborted)) {
                throw new ApiError(504, 'TIMEOUT');
            }
            if (isAbortError(error) || (signal && signal.aborted)) {
                throw isAbortError(error) ? error : makeAbortError();
            }
            if (error instanceof TypeError) {
                throw new ApiError(0, 'NETWORK');
            }
            if (error instanceof SyntaxError) {
                throw new ApiError(502, 'BAD_RESPONSE');
            }
            throw new ApiError(0, 'NETWORK', error && error.message);
        } finally {
            link.dispose();
        }
    }

    return { status, route, ask };
}
