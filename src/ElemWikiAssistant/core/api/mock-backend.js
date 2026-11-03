/**
 * Мок серверного API помощника: fetch-совместимая функция, позволяющая запускать виджет без сервера.
 *
 * Пути: `…/status`, `…/route`, `…/ask` (с потоком SSE или JSON). Модель не вызывается:
 * роутинг — пересечение слов, ответ — склейка начала найденных разделов со ссылками `[[pageId]]`.
 * Что это мок, виджет показывает в строке статуса, а не в тексте ответа.
 */

const MOCK_EMPTY = 'В руководстве об этом не написано. Попробуйте переформулировать вопрос.';
const SNIPPET_CHARS = 300;

/**
 * @return {Error}
 */
function abortError() {
    if (typeof DOMException === 'function') {
        return new DOMException('The operation was aborted.', 'AbortError');
    }
    const error = new Error('The operation was aborted.');
    error.name = 'AbortError';
    return error;
}

/**
 * Пауза, прерываемая сигналом.
 *
 * @param {number} ms
 * @param {AbortSignal} [signal]
 * @return {Promise<void>}
 */
function sleep(ms, signal) {
    return new Promise((resolve, reject) => {
        if (signal && signal.aborted) {
            reject(abortError());
            return;
        }
        const onAbort = () => {
            clearTimeout(timer);
            reject(abortError());
        };
        const timer = setTimeout(() => {
            if (signal) {
                signal.removeEventListener('abort', onAbort);
            }
            resolve();
        }, ms);
        if (signal) {
            signal.addEventListener('abort', onAbort, { once: true });
        }
    });
}

/**
 * @param {number} status
 * @param {object} body
 * @return {Response}
 */
function jsonResponse(status, body) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
}

/**
 * Стемы слов (≥ 4 букв, первые 5 знаков).
 *
 * @param {string} text
 * @return {Set<string>}
 */
function stems(text) {
    const words = String(text || '')
        .toLowerCase()
        .replace(/ё/g, 'е')
        .match(/[\p{L}\p{N}]+/gu);
    const out = new Set();
    (words || []).forEach((word) => {
        if (word.length >= 4) {
            out.add(word.slice(0, 5));
        }
    });
    return out;
}

/**
 * @param {{ question?: string, pages?: Array<{ id: string, title?: string, lead?: string }> }} body
 * @return {string[]}
 */
function mockRoute(body) {
    const query = stems(body.question);
    if (query.size === 0) {
        return [];
    }
    return (Array.isArray(body.pages) ? body.pages : [])
        .map((page, index) => {
            const words = stems(`${page.title || ''} ${page.lead || ''}`);
            let score = 0;
            query.forEach((stem) => {
                if (words.has(stem)) {
                    score += 1;
                }
            });
            return { id: page.id, score, index };
        })
        .filter((x) => x.score > 0 && x.id)
        .sort((a, b) => b.score - a.score || a.index - b.index)
        .slice(0, 3)
        .map((x) => x.id);
}

/**
 * Начало текста раздела, обрезанное по границе предложения/строки (≤ SNIPPET_CHARS).
 *
 * @param {string} text
 * @return {string}
 */
function snippet(text) {
    const clean = String(text || '').trim();
    if (clean.length <= SNIPPET_CHARS) {
        return clean;
    }
    const head = clean.slice(0, SNIPPET_CHARS);
    let cut = -1;
    const re = /[.!?…](?=\s)|\n/g;
    let match;
    while ((match = re.exec(head)) !== null) {
        cut = match.index + (match[0] === '\n' ? 0 : 1);
    }
    if (cut < SNIPPET_CHARS / 3) {
        const space = head.lastIndexOf(' ');
        return `${head.slice(0, space > 0 ? space : SNIPPET_CHARS).trim()}…`;
    }
    return head.slice(0, cut).trim();
}

/**
 * @param {Array<{ pageId: string, heading?: string, title?: string, text?: string }>} sections
 * @return {{ answer: string, pageIds: string[] }}
 */
function mockAnswer(sections) {
    const list = (Array.isArray(sections) ? sections : []).filter((s) => s && s.pageId).slice(0, 3);
    if (list.length === 0) {
        return { answer: MOCK_EMPTY, pageIds: [] };
    }
    const parts = [];
    const pageIds = [];
    list.forEach((section) => {
        const heading = section.heading || section.title || section.pageId;
        parts.push(`**${heading}**\n${snippet(section.text)} [[${section.pageId}]]`);
        if (!pageIds.includes(section.pageId)) {
            pageIds.push(section.pageId);
        }
    });
    return { answer: parts.join('\n\n'), pageIds };
}

/**
 * Разбить текст на куски по 1–3 слова (с сохранением пробелов и переводов строк).
 *
 * @param {string} text
 * @return {string[]}
 */
function wordChunks(text) {
    const tokens = text.match(/\S+\s*/g) || [];
    const chunks = [];
    let i = 0;
    let n = 0;
    while (i < tokens.length) {
        const size = (n % 3) + 1;
        chunks.push(tokens.slice(i, i + size).join(''));
        i += size;
        n += 1;
    }
    const leading = text.match(/^\s+/);
    if (leading && chunks.length) {
        chunks[0] = leading[0] + chunks[0];
    }
    return chunks;
}

/**
 * @param {string} name
 * @param {object} data
 * @return {string}
 */
function sseEvent(name, data) {
    return `event: ${name}\ndata: ${JSON.stringify(data)}\n\n`;
}

/**
 * Ответ SSE: дельты по словам с задержкой, затем `done`.
 *
 * @param {{ answer: string, pageIds: string[] }} result
 * @param {number} delayMs
 * @param {AbortSignal} [signal]
 * @return {Response}
 */
function streamResponse(result, delayMs, signal) {
    const encoder = new TextEncoder();
    const chunks = wordChunks(result.answer);
    let cancelled = false;
    const stream = new ReadableStream({
        async start(controller) {
            const onAbort = () => {
                if (!cancelled) {
                    cancelled = true;
                    try {
                        controller.error(abortError());
                    } catch (e) {
                        // поток уже закрыт
                    }
                }
            };
            if (signal) {
                signal.addEventListener('abort', onAbort, { once: true });
            }
            try {
                controller.enqueue(encoder.encode(': mock stream\n\n'));
                for (const text of chunks) {
                    await sleep(delayMs, signal);
                    if (cancelled) {
                        return;
                    }
                    controller.enqueue(encoder.encode(sseEvent('delta', { text })));
                }
                if (cancelled) {
                    return;
                }
                controller.enqueue(
                    encoder.encode(
                        sseEvent('done', { answer: result.answer, pageIds: result.pageIds, mode: 'sections' })
                    )
                );
                controller.close();
            } catch (error) {
                onAbort();
            } finally {
                if (signal) {
                    signal.removeEventListener('abort', onAbort);
                }
            }
        },
        cancel() {
            cancelled = true;
        }
    });
    return new Response(stream, {
        status: 200,
        headers: { 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-cache' }
    });
}

/**
 * @param {any} body
 * @return {any}
 */
function parseBody(body) {
    if (!body) {
        return {};
    }
    if (typeof body === 'string') {
        try {
            return JSON.parse(body) || {};
        } catch (e) {
            return {};
        }
    }
    return typeof body === 'object' ? body : {};
}

/**
 * Создать fetch-совместимую функцию мок-сервера.
 *
 * @param {{ delayMs?: number, latencyMs?: number }} [options]
 *   delayMs — пауза между дельтами потока, latencyMs — задержка перед ответом
 * @return {(url: string|URL|Request, init?: RequestInit) => Promise<Response>}
 */
export function createMockFetch({ delayMs = 18, latencyMs = 400 } = {}) {
    return async function mockFetch(url, init = {}) {
        const signal = init.signal || undefined;
        const href = typeof url === 'string' ? url : url instanceof URL ? url.href : String((url && url.url) || url);
        const path = href.split(/[?#]/)[0].replace(/\/+$/, '');
        await sleep(latencyMs, signal);

        if (path.endsWith('/status') || path === 'status') {
            return jsonResponse(200, { isAvailable: true, isFullGuide: false, mock: true });
        }
        if (path.endsWith('/route') || path === 'route') {
            return jsonResponse(200, { pageIds: mockRoute(parseBody(init.body)) });
        }
        if (path.endsWith('/ask') || path === 'ask') {
            const body = parseBody(init.body);
            if (!String(body.question || '').trim()) {
                return jsonResponse(400, { code: 'EMPTY_QUESTION' });
            }
            const result = mockAnswer(body.sections);
            if (body.stream) {
                return streamResponse(result, delayMs, signal);
            }
            return jsonResponse(200, { answer: result.answer, pageIds: result.pageIds, mode: 'sections' });
        }
        return jsonResponse(404, { code: 'NOT_FOUND' });
    };
}
