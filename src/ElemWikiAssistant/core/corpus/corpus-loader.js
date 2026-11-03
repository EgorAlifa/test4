/**
 * Сборка корпуса вики из файлов проекта.
 *
 * app.json → routes (включённые, не попапы) → pages/<pageId>.json → parsePage.
 * Если передан предыдущий корпус, неизменившиеся страницы (тот же хеш JSON)
 * не разбираются заново.
 *
 * @typedef {import('./page-parser.js').CorpusPage} CorpusPage
 * @typedef {{
 *   formatVersion: number, version: string, builtAt: number, sourceKey: string,
 *   pages: CorpusPage[], rawHashes: Record<string, string>,
 *   stats: { routes: number, pages: number, sections: number, chars: number, failed: string[] }
 * }} Corpus
 */

import { parsePage, slugToPageId } from './page-parser.js';
import { hashString, hashList } from './hash.js';
import { LOADER_DEFAULTS } from '../config.js';

/**
 * Маршруты, из которых собирается корпус.
 *
 * @param {object} app — содержимое app.json
 * @param {{ excludedSlugs?: string[] }} [options]
 * @return {{ pageId: string, slug: string, title: string }[]}
 */
export function selectRoutes(app, { excludedSlugs = [] } = {}) {
    const data = app && (app.routes ? app : app.data) ? (app.routes ? app : app.data) : {};
    const routes = Array.isArray(data.routes) ? data.routes : [];
    const excluded = new Set(excludedSlugs.map((s) => slugToPageId(s, s)));
    const seen = new Set();
    return routes.filter((r) => {
        if (!r || !r.pageId || r.enabled === false || r.popup) {
            return false;
        }
        const id = slugToPageId(r.slug, r.pageId);
        if (excluded.has(id) || seen.has(id)) {
            return false;
        }
        seen.add(id);
        return true;
    });
}

/**
 * Пул с ограничением параллельности.
 *
 * @template T, R
 * @param {T[]} items
 * @param {number} limit
 * @param {(item: T, index: number) => Promise<R>} fn
 * @return {Promise<R[]>}
 */
async function mapPool(items, limit, fn) {
    const results = new Array(items.length);
    let next = 0;
    const worker = async () => {
        while (next < items.length) {
            const index = next++;
            results[index] = await fn(items[index], index);
        }
    };
    await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
    return results;
}

/**
 * @param {{
 *   source: { key: string, getAppJson: Function, getPageJson: Function },
 *   previous?: Corpus|null,
 *   excludedSlugs?: string[],
 *   parseOptions?: object,
 *   concurrency?: number,
 *   signal?: AbortSignal,
 *   onProgress?: (p: { loaded: number, total: number }) => void
 * }} options
 * @return {Promise<Corpus>}
 */
export async function loadCorpus({
    source,
    previous = null,
    excludedSlugs = [],
    parseOptions = {},
    concurrency = LOADER_DEFAULTS.concurrency,
    signal,
    onProgress
}) {
    const appText = await source.getAppJson(signal);
    const app = JSON.parse(appText);
    const routes = selectRoutes(app, { excludedSlugs });

    const reusable =
        previous && previous.formatVersion === LOADER_DEFAULTS.formatVersion && previous.sourceKey === source.key
            ? new Map(previous.pages.map((p) => [p.pageId, p]))
            : new Map();
    const prevHashes = (reusable.size && previous.rawHashes) || {};

    let loaded = 0;
    const failed = [];
    const rawHashes = {};

    const pages = await mapPool(routes, concurrency, async (route) => {
        try {
            const text = await source.getPageJson(route.pageId, signal);
            const hash = hashString(text);
            rawHashes[route.pageId] = hash;
            const prev = reusable.get(route.pageId);
            // страница та же, и маршрут не переименовали — берём разобранную
            if (prev && prevHashes[route.pageId] === hash && prev.slug === route.slug) {
                return prev;
            }
            return parsePage(JSON.parse(text), route, parseOptions);
        } catch (error) {
            if (error && error.name === 'AbortError') {
                throw error;
            }
            failed.push(route.slug);
            return null;
        } finally {
            loaded += 1;
            if (onProgress) {
                onProgress({ loaded, total: routes.length });
            }
        }
    });

    const list = pages.filter((p) => p && p.sections.length > 0);
    const version = hashList([
        String(LOADER_DEFAULTS.formatVersion),
        ...routes.map((r) => `${r.pageId}:${r.slug}:${r.title || ''}:${rawHashes[r.pageId] || '-'}`)
    ]);

    return {
        formatVersion: LOADER_DEFAULTS.formatVersion,
        version,
        builtAt: Date.now(),
        sourceKey: source.key,
        pages: list,
        rawHashes,
        stats: {
            routes: routes.length,
            pages: list.length,
            sections: list.reduce((n, p) => n + p.sections.length, 0),
            chars: list.reduce((n, p) => n + p.chars, 0),
            failed
        }
    };
}
