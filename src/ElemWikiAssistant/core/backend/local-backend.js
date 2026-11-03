/**
 * «Сервер» помощника внутри виджета: fetch-совместимая функция с тем же контрактом,
 * что серверный роутер wiki-assistant (`/status`, `/route`, `/ask`), но модель
 * вызывается прямо из браузера через OpenAI-совместимый `/chat/completions`.
 *
 * Перенесено с сервера: промпты, лимиты входа, история парами, повтор «plain» на 4xx,
 * чтение стрима провайдера, скрытие `<think>` (даже незакрытого), вычистка `[[id]]`
 * на страницы, которых не было в разделах, SSE к клиенту (`delta` / `done` / `error`).
 *
 * ВНИМАНИЕ: ключ провайдера, переданный сюда, виден любому зрителю страницы.
 * Для боевого стенда указывайте в baseUrl прокси на том же домене, который
 * добавляет ключ сам, а apiKey оставляйте пустым.
 */

import { SYSTEM_PROMPT, ROUTE_PROMPT, withAnswerLanguage, buildAskUserMessage, buildRouteUserMessage } from './prompts.js';

export const LOCAL_LIMITS = Object.freeze({
    maxQuestionChars: 500,
    maxSections: 8,
    maxSectionChars: 4000,
    maxSectionsTotal: 14000,
    minSectionRoom: 200,
    maxHistoryMessages: 6,
    maxHistoryChars: 2000,
    maxRoutePages: 200,
    maxRouteIds: 3,
    askTimeoutMs: 60000,
    routeTimeoutMs: 8000,
    routeMaxTokens: 60
});

const EMPTY_QUESTION_FALLBACK = 'Что на скриншоте и как решить проблему?';
const NO_ANSWER = 'В руководстве об этом не написано. Попробуйте переформулировать вопрос.';
const CITATION_RE = /\[\[([^\]\s]{1,200})\]\]/g;
const RETRYABLE_EXCLUDED = new Set([401, 403, 429]);

// ─── утилиты ответа ─────────────────────────────────────────────

/**
 * Видимая часть ответа во время стрима: закрытые <think>…</think> удаляются,
 * незакрытый <think> скрывает всё до конца, недописанный тег `<thi` тоже.
 *
 * @param {string} raw
 * @return {string}
 */
export function visibleAnswer(raw) {
    let text = String(raw || '').replace(/<think>[\s\S]*?<\/think>/gi, '');
    const open = text.search(/<think>/i);
    if (open !== -1) {
        text = text.slice(0, open);
    }
    return text.replace(/<\/?t(h(i(n(k)?)?)?)?$/i, '').replace(/^\s+/, '');
}

/**
 * Окончательный ответ: без <think> и без ссылок на страницы вне разрешённых.
 *
 * @param {string} raw
 * @param {Set<string>} allowedIds
 * @return {string}
 */
export function cleanAnswer(raw, allowedIds) {
    return visibleAnswer(raw)
        .replace(/<\/think>/gi, '')
        .replace(CITATION_RE, (match, id) => (allowedIds.has(id) ? match : ''))
        .replace(/[ \t]+\n/g, '\n')
        .trim();
}

/**
 * @param {string} text
 * @param {Set<string>} allowedIds
 * @return {string[]}
 */
function citedIds(text, allowedIds) {
    const out = [];
    let m;
    CITATION_RE.lastIndex = 0;
    while ((m = CITATION_RE.exec(text)) !== null) {
        if (allowedIds.has(m[1]) && !out.includes(m[1])) {
            out.push(m[1]);
        }
    }
    return out;
}

// ─── санитайзеры входа ──────────────────────────────────────────

/**
 * @param {unknown} sections
 * @return {{ pageId: string, title: string, heading: string, text: string }[]}
 */
export function sanitizeSections(sections) {
    const L = LOCAL_LIMITS;
    const out = [];
    let total = 0;
    (Array.isArray(sections) ? sections : []).some((s) => {
        if (out.length >= L.maxSections || L.maxSectionsTotal - total <= L.minSectionRoom) {
            return true;
        }
        if (!s || typeof s.pageId !== 'string' || typeof s.text !== 'string') {
            return false;
        }
        const room = Math.min(L.maxSectionChars, L.maxSectionsTotal - total);
        const text = s.text
            .replace(/[ \t ]+/g, ' ')
            .replace(/\n{3,}/g, '\n\n')
            .trim()
            .slice(0, room);
        if (!text) {
            return false;
        }
        out.push({
            pageId: s.pageId.slice(0, 200),
            title: String(s.title || '').slice(0, 200),
            heading: String(s.heading || '').slice(0, 200),
            text
        });
        total += text.length;
        return false;
    });
    return out;
}

/**
 * Только целые пары user → assistant: строгие chat templates (vLLM, GigaChat, Gemma)
 * отвечают 4xx на два user-хода подряд.
 *
 * @param {unknown} history
 * @return {{ role: 'user'|'assistant', content: string }[]}
 */
export function sanitizeHistory(history) {
    const L = LOCAL_LIMITS;
    const list = Array.isArray(history) ? history : [];
    const pairs = [];
    for (let i = 0; i + 1 < list.length; i++) {
        const a = list[i];
        const b = list[i + 1];
        const isPair =
            a && b && a.role === 'user' && b.role === 'assistant' && typeof a.content === 'string' && typeof b.content === 'string';
        if (isPair && a.content.trim() && b.content.trim()) {
            pairs.push(
                { role: 'user', content: a.content.slice(0, L.maxHistoryChars) },
                { role: 'assistant', content: b.content.slice(0, L.maxHistoryChars) }
            );
            i += 1;
        }
    }
    const keep = L.maxHistoryMessages - (L.maxHistoryMessages % 2);
    return pairs.slice(-keep);
}

// ─── HTTP-ответы «сервера» ──────────────────────────────────────

/**
 * @param {number} status
 * @param {object} body
 * @return {Response}
 */
function json(status, body) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
}

class ProviderError extends Error {
    /**
     * @param {number} status — HTTP-статус «сервера» для клиента
     * @param {string} code
     * @param {string} [detail] — начало ответа провайдера (для консоли разработчика)
     */
    constructor(status, code, detail = '') {
        super(code);
        this.status = status;
        this.code = code;
        this.detail = detail;
    }
}

/**
 * @param {AbortSignal|undefined} outer
 * @param {number} timeoutMs
 * @return {{ signal: AbortSignal, isTimedOut: () => boolean, dispose: () => void }}
 */
function linkedSignal(outer, timeoutMs) {
    const controller = new AbortController();
    let timedOut = false;
    const timer = setTimeout(() => {
        timedOut = true;
        controller.abort();
    }, timeoutMs);
    const onAbort = () => controller.abort();
    if (outer) {
        if (outer.aborted) {
            controller.abort();
        } else {
            outer.addEventListener('abort', onAbort, { once: true });
        }
    }
    return {
        signal: controller.signal,
        isTimedOut: () => timedOut,
        dispose: () => {
            clearTimeout(timer);
            if (outer) {
                outer.removeEventListener('abort', onAbort);
            }
        }
    };
}

/** @return {Error} */
function abortError() {
    if (typeof DOMException === 'function') {
        return new DOMException('The operation was aborted.', 'AbortError');
    }
    const e = new Error('The operation was aborted.');
    e.name = 'AbortError';
    return e;
}

// ─── провайдер ──────────────────────────────────────────────────

/**
 * Чтение стрима `/chat/completions`: строки `data: {...}`, `[DONE]`, keep-alive пропускаются.
 *
 * @param {Response} response
 * @param {(text: string) => void} onText — приращение сырого текста
 * @param {AbortSignal} [signal] — при отмене читатель закрывает поток провайдера
 * @return {Promise<{ text: string, usage: object|null }>}
 */
export async function readCompletionStream(response, onText, signal) {
    const reader = response.body.getReader();
    const onAbort = () => reader.cancel().catch(() => {});
    if (signal) {
        signal.addEventListener('abort', onAbort, { once: true });
    }
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let text = '';
    let usage = null;
    let isDone = false;
    const handleLine = (line) => {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) {
            return;
        }
        const data = trimmed.slice(5).trim();
        if (data === '[DONE]') {
            isDone = true;
            return;
        }
        try {
            const chunk = JSON.parse(data);
            if (chunk.usage) {
                ({ usage } = chunk);
            }
            const choice = chunk.choices && chunk.choices[0];
            const piece = choice && ((choice.delta && choice.delta.content) || (choice.message && choice.message.content));
            if (typeof piece === 'string' && piece) {
                text += piece;
                onText(piece);
            }
        } catch (e) {
            // мусор и неполные строки пропускаем
        }
    };
    while (!isDone) {
        const { value, done } = await reader.read();
        if (done) {
            break;
        }
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split(/\r?\n/);
        buffer = lines.pop();
        lines.forEach(handleLine);
    }
    buffer += decoder.decode();
    if (buffer) {
        handleLine(buffer);
    }
    if (signal) {
        signal.removeEventListener('abort', onAbort);
    }
    if (isDone) {
        reader.cancel().catch(() => {});
    }
    return { text, usage };
}

/**
 * @param {object} config
 * @return {Record<string, string>}
 */
export function providerHeaders(config) {
    const headers = { 'Content-Type': 'application/json' };
    if (config.apiKey) {
        const name = String(config.authHeader || 'Authorization').replace(/[^A-Za-z0-9-]/g, '');
        const prefix = config.authPrefix == null ? 'Bearer ' : String(config.authPrefix);
        headers[name || 'Authorization'] = `${prefix}${config.apiKey}`.replace(/[\r\n]/g, '');
    }
    return headers;
}

/**
 * @param {object} config
 * @param {object} body
 * @param {AbortSignal} signal
 * @return {Promise<Response>}
 */
async function callProvider(config, body, signal) {
    const url = `${String(config.baseUrl).replace(/\/+$/, '')}/chat/completions`;
    try {
        return await config.fetchImpl(url, {
            method: 'POST',
            headers: providerHeaders(config),
            body: JSON.stringify(body),
            signal,
            redirect: 'error',
            credentials: config.credentials || 'omit'
        });
    } catch (error) {
        if (error && error.name === 'AbortError') {
            throw error;
        }
        // CORS, DNS, нет сети — из браузера это неотличимо
        throw new ProviderError(503, 'PROVIDER_UNREACHABLE', String((error && error.message) || error));
    }
}

/**
 * @param {Response} response
 * @return {Promise<string>}
 */
async function readJsonAnswer(response) {
    const data = await response.json().catch(() => null);
    const choice = data && data.choices && data.choices[0];
    const content = choice && ((choice.message && choice.message.content) || choice.text);
    return typeof content === 'string' ? content : '';
}

/**
 * @param {Response} response
 * @return {Promise<string>}
 */
async function providerSaid(response) {
    try {
        return (await response.text()).slice(0, 300);
    } catch (e) {
        return '';
    }
}

/**
 * Ошибка провайдера → ошибка «сервера» для клиента.
 *
 * @param {number} status
 * @param {string} detail
 * @param {boolean} hasImages
 * @return {ProviderError}
 */
function mapProviderError(status, detail, hasImages) {
    if (hasImages && status >= 400 && status < 500 && !RETRYABLE_EXCLUDED.has(status)) {
        return new ProviderError(502, 'IMAGE_REJECTED', detail);
    }
    if (status === 401 || status === 403) {
        return new ProviderError(502, 'PROVIDER_AUTH', detail);
    }
    if (status === 429) {
        return new ProviderError(429, 'RATE_LIMITED', detail);
    }
    return new ProviderError(502, 'PROVIDER_ERROR', detail);
}

/**
 * Основной запрос с повтором «plain»: на 4xx (кроме 401/403/429, без картинок) повторяем
 * без stream / temperature / max_tokens / history — reasoning-модели и часть шлюзов
 * отвергают эти параметры.
 *
 * @param {object} config
 * @param {{ messages: object[], plainMessages: object[], stream: boolean, temperature?: number, maxTokens?: number, hasImages?: boolean }} req
 * @param {AbortSignal} signal
 * @return {Promise<{ response: Response, isPlain: boolean }>}
 */
async function requestWithRetry(config, req, signal) {
    const body = { model: config.model, messages: req.messages };
    if (req.stream) {
        body.stream = true;
    }
    if (req.temperature != null && Number.isFinite(req.temperature)) {
        body.temperature = req.temperature;
    }
    if (req.maxTokens) {
        body.max_tokens = req.maxTokens;
    }
    const response = await callProvider(config, body, signal);
    if (response.ok) {
        return { response, isPlain: false };
    }
    const detail = await providerSaid(response);
    const canRetry = response.status >= 400 && response.status < 500 && !RETRYABLE_EXCLUDED.has(response.status) && !req.hasImages;
    if (!canRetry) {
        throw mapProviderError(response.status, detail, req.hasImages);
    }
    const plain = await callProvider(config, { model: config.model, messages: req.plainMessages }, signal);
    if (!plain.ok) {
        throw mapProviderError(plain.status, `${detail}\n---\n${await providerSaid(plain)}`, false);
    }
    return { response: plain, isPlain: true };
}

// ─── эндпоинты ──────────────────────────────────────────────────

/**
 * @param {object} config
 * @return {Response}
 */
function handleStatus(config) {
    const isConfigured = Boolean(config.baseUrl && config.model);
    return json(200, isConfigured ? { isAvailable: true, isFullGuide: false, local: true } : { isAvailable: false, reason: 'unavailable' });
}

/**
 * @param {object} config
 * @param {object} body
 * @param {AbortSignal} [outerSignal]
 * @return {Promise<Response>}
 */
async function handleRoute(config, body, outerSignal) {
    const question = String((body && body.question) || '').trim().slice(0, LOCAL_LIMITS.maxQuestionChars);
    const pages = (Array.isArray(body && body.pages) ? body.pages : [])
        .filter((p) => p && typeof p.id === 'string')
        .slice(0, LOCAL_LIMITS.maxRoutePages);
    if (!question || pages.length === 0) {
        return json(400, { code: 'EMPTY_INPUT' });
    }
    const known = new Set(pages.map((p) => p.id));
    const link = linkedSignal(outerSignal, LOCAL_LIMITS.routeTimeoutMs);
    try {
        const messages = [
            { role: 'system', content: ROUTE_PROMPT },
            { role: 'user', content: buildRouteUserMessage(pages, question) }
        ];
        const { response } = await requestWithRetry(
            config,
            { messages, plainMessages: messages, stream: false, temperature: 0, maxTokens: LOCAL_LIMITS.routeMaxTokens },
            link.signal
        );
        const answer = visibleAnswer(await readJsonAnswer(response));
        // id из присланного каталога, в порядке упоминания
        const ids = [];
        (answer.match(/[A-Za-z0-9][\w\-/.]*/g) || []).forEach((token) => {
            const id = token.replace(/[.,;]+$/, '');
            if (known.has(id) && !ids.includes(id)) {
                ids.push(id);
            }
        });
        return json(200, { pageIds: ids.slice(0, LOCAL_LIMITS.maxRouteIds) });
    } catch (error) {
        if (outerSignal && outerSignal.aborted) {
            throw abortError();
        }
        // роутинг не должен мешать: любой сбой — пустой список
        return json(200, { pageIds: [] });
    } finally {
        link.dispose();
    }
}

/**
 * @param {object} config
 * @param {object} body
 * @param {AbortSignal} [outerSignal]
 * @return {Promise<Response>}
 */
async function handleAsk(config, body, outerSignal) {
    if (!config.baseUrl || !config.model) {
        return json(503, { code: 'UNAVAILABLE' });
    }
    const images = Array.isArray(body && body.images) ? body.images.filter((x) => typeof x === 'string').slice(0, 3) : [];
    let question = String((body && body.question) || '').trim().slice(0, LOCAL_LIMITS.maxQuestionChars);
    if (!question && images.length) {
        question = EMPTY_QUESTION_FALLBACK;
    }
    if (!question) {
        return json(400, { code: 'EMPTY_QUESTION' });
    }
    const sections = sanitizeSections(body.sections);
    if (sections.length === 0) {
        return json(400, { code: 'EMPTY_SECTIONS' });
    }
    const allowed = new Set(sections.map((s) => s.pageId));
    const pageIds = [...allowed];
    const system = { role: 'system', content: withAnswerLanguage(SYSTEM_PROMPT, config.locale) };
    const userText = buildAskUserMessage(sections, question);
    const user = images.length
        ? {
              role: 'user',
              content: [
                  { type: 'text', text: userText },
                  ...images.map((url) => ({ type: 'image_url', image_url: { url } }))
              ]
          }
        : { role: 'user', content: userText };
    const messages = [system, ...sanitizeHistory(body.history), user];
    const wantsStream = Boolean(body.stream) && config.stream !== false;

    const link = linkedSignal(outerSignal, LOCAL_LIMITS.askTimeoutMs);
    const fail = (error) => {
        if (outerSignal && outerSignal.aborted) {
            return abortError();
        }
        if (link.isTimedOut()) {
            return new ProviderError(504, 'TIMEOUT');
        }
        return error;
    };

    let result;
    try {
        result = await requestWithRetry(
            config,
            {
                messages,
                plainMessages: [system, user],
                stream: wantsStream,
                temperature: config.temperature,
                maxTokens: config.maxTokens,
                hasImages: images.length > 0
            },
            link.signal
        );
    } catch (error) {
        link.dispose();
        const mapped = fail(error);
        if (mapped instanceof ProviderError) {
            logDetail(config, mapped);
            return json(mapped.status, { code: mapped.code });
        }
        throw mapped;
    }

    const { response } = result;
    const isEventStream = /text\/event-stream/i.test(response.headers.get('content-type') || '');

    // провайдер (или plain-повтор) ответил JSON — отвечаем JSON, клиент понимает оба формата
    if (!isEventStream) {
        try {
            const raw = await readJsonAnswer(response);
            if (outerSignal && outerSignal.aborted) {
                throw abortError();
            }
            const answer = cleanAnswer(raw, allowed);
            if (!answer) {
                return json(502, { code: 'EMPTY_ANSWER' });
            }
            return json(200, { answer, pageIds, mode: 'sections', cited: citedIds(answer, allowed) });
        } catch (error) {
            const mapped = fail(error);
            if (mapped.name === 'AbortError') {
                throw mapped;
            }
            return json(502, { code: 'PROVIDER_ERROR' });
        } finally {
            link.dispose();
        }
    }

    // SSE к клиенту: только прирост видимого текста
    const encoder = new TextEncoder();
    const send = (controller, name, data) => controller.enqueue(encoder.encode(`event: ${name}\ndata: ${JSON.stringify(data)}\n\n`));
    const stream = new ReadableStream({
        async start(controller) {
            let raw = '';
            let sent = '';
            let isClosed = false;
            // отмена (новый вопрос, «Стоп», закрытие) обрывает и наш поток, и поток провайдера
            const onAbort = () => {
                isClosed = true;
                try {
                    controller.error(fail(abortError()));
                } catch (e) {
                    // поток уже закрыт
                }
            };
            if (link.signal.aborted) {
                onAbort();
                link.dispose();
                return;
            }
            link.signal.addEventListener('abort', onAbort, { once: true });
            try {
                await readCompletionStream(response, (piece) => {
                    if (isClosed) {
                        return;
                    }
                    raw += piece;
                    const visible = visibleAnswer(raw);
                    if (visible.length > sent.length && visible.startsWith(sent)) {
                        send(controller, 'delta', { text: visible.slice(sent.length) });
                        sent = visible;
                    }
                }, link.signal);
                if (isClosed) {
                    return;
                }
                const answer = cleanAnswer(raw, allowed) || NO_ANSWER;
                send(controller, 'done', { answer, pageIds, mode: 'sections', cited: citedIds(answer, allowed) });
            } catch (error) {
                const mapped = fail(error);
                if (!isClosed && mapped.name !== 'AbortError') {
                    send(controller, 'error', { code: mapped.code || 'PROVIDER_ERROR' });
                }
            } finally {
                link.signal.removeEventListener('abort', onAbort);
                link.dispose();
                try {
                    if (!isClosed) {
                        controller.close();
                    }
                } catch (e) {
                    // поток уже отменён читателем
                }
            }
        },
        cancel() {
            link.dispose();
            response.body.cancel().catch(() => {});
        }
    });
    return new Response(stream, {
        status: 200,
        headers: { 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-cache' }
    });
}

/**
 * «Provider said» — единственная подсказка, почему провайдер отказал. Пишем в консоль, не в UI.
 *
 * @param {object} config
 * @param {ProviderError} error
 */
function logDetail(config, error) {
    if (config.onError) {
        config.onError(error);
    } else if (typeof console !== 'undefined' && error.detail) {
        // eslint-disable-next-line no-console
        console.warn(`[ElemWikiAssistant] ${error.code}: ${error.detail}`);
    }
}

// ─── фабрика ────────────────────────────────────────────────────

/**
 * @param {{
 *   baseUrl: string, apiKey?: string, model: string,
 *   authHeader?: string, authPrefix?: string,
 *   temperature?: number, maxTokens?: number, stream?: boolean,
 *   locale?: string, credentials?: RequestCredentials,
 *   fetchImpl?: typeof fetch, onError?: (e: Error) => void
 * }} options
 * @return {(url: string, init?: RequestInit) => Promise<Response>}
 */
export function createLocalBackendFetch(options = {}) {
    const config = {
        baseUrl: String(options.baseUrl || '').trim(),
        apiKey: String(options.apiKey || '').trim(),
        model: String(options.model || '').trim(),
        authHeader: options.authHeader,
        authPrefix: options.authPrefix,
        temperature: options.temperature == null ? 0.2 : Number(options.temperature),
        maxTokens: options.maxTokens == null ? 1200 : Number(options.maxTokens) || 0,
        stream: options.stream !== false,
        locale: options.locale || 'ru',
        credentials: options.credentials,
        fetchImpl: options.fetchImpl || ((...args) => fetch(...args)),
        onError: options.onError
    };

    return async function localBackendFetch(url, init = {}) {
        const path = String(url).replace(/[?#].*$/, '');
        const signal = init.signal;
        if (signal && signal.aborted) {
            throw abortError();
        }
        let body = {};
        if (init.body) {
            try {
                body = JSON.parse(init.body);
            } catch (e) {
                return json(400, { code: 'BAD_JSON' });
            }
        }
        if (/\/status$/.test(path)) {
            return handleStatus(config);
        }
        if (/\/route$/.test(path)) {
            return handleRoute(config, body, signal);
        }
        if (/\/ask$/.test(path)) {
            return handleAsk(config, body, signal);
        }
        return json(404, { code: 'NOT_FOUND' });
    };
}
