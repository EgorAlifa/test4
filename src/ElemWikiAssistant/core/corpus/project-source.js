/**
 * Где лежат файлы проекта вики и как их получить.
 *
 * Плеер:    https://host/<base>/editor/player/<appId>/#/slug
 *           → https://host/<base>/editor/player/<appId>/app.json
 *           → https://host/<base>/editor/player/<appId>/pages/<pageId>.json
 * Редактор: https://host/<base>/editor/…/apps/edit/<appId>
 *           → те же адреса плеера (сохранённая версия проекта)
 *
 * Логика определения адреса повторяет ElemRoutesNavigator (buildAppJsonUrl).
 */

/**
 * @param {Location|URL|{href: string, pathname: string}} [loc]
 * @return {string|null}
 */
export function detectAppId(loc = typeof window !== 'undefined' ? window.location : null) {
    if (!loc) {
        return null;
    }
    const patterns = [/\/player\/(\d+)/, /\/apps\/edit\/(\d+)/, /\/application\/(\d+)/];
    for (const re of patterns) {
        const m = String(loc.pathname || '').match(re) || String(loc.href || '').match(re);
        if (m) {
            return m[1];
        }
    }
    return null;
}

/**
 * Базовый адрес проекта (с завершающим слешем), от которого берутся app.json и pages/.
 *
 * @param {{ override?: string, location?: Location|URL }} [options]
 * @return {string|null}
 */
export function resolveProjectBaseUrl({ override = '', location } = {}) {
    const loc = location || (typeof window !== 'undefined' ? window.location : null);
    if (override) {
        const base = loc ? new URL(override, loc.href).href : override;
        return base.endsWith('/') ? base : `${base}/`;
    }
    if (!loc) {
        return null;
    }
    const href = String(loc.href).replace(/#.*$/, '').replace(/\?.*$/, '');

    // Плеер: всё до /player/<id>/
    const player = href.match(/^(.*\/player\/\d+)(\/|$)/);
    if (player) {
        return `${player[1]}/`;
    }

    // Редактор: <до /editor>/player/<id>/
    const appId = detectAppId(loc);
    const editorIdx = href.indexOf('/editor/');
    if (appId && editorIdx !== -1) {
        return `${href.slice(0, editorIdx)}/editor/player/${appId}/`;
    }

    // Иначе — текущая папка (локальный плеер, распакованный ZIP)
    return href.replace(/[^/]*$/, '');
}

/**
 * Источник файлов проекта по HTTP.
 *
 * @param {{ baseUrl: string, fetchImpl?: typeof fetch, credentials?: RequestCredentials }} options
 */
export function createHttpProjectSource({ baseUrl, fetchImpl, credentials = 'same-origin' }) {
    const doFetch = fetchImpl || ((...args) => fetch(...args));

    /**
     * @param {string} path
     * @param {AbortSignal} [signal]
     * @return {Promise<string>}
     */
    const getText = async (path, signal) => {
        // no-cache: браузер переспросит сервер (If-None-Match/If-Modified-Since → дешёвый 304)
        const response = await doFetch(new URL(path, baseUrl).href, { cache: 'no-cache', credentials, signal });
        if (!response.ok) {
            const error = new Error(`HTTP ${response.status} for ${path}`);
            error.status = response.status;
            throw error;
        }
        return response.text();
    };

    return {
        key: baseUrl,
        getAppJson: (signal) => getText('app.json', signal),
        getPageJson: (pageId, signal) => getText(`pages/${encodeURIComponent(pageId)}.json`, signal)
    };
}
