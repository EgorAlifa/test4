/**
 * Корпус вики в памяти: один на проект, общий для всех экземпляров виджета.
 *
 * get():
 *   1. есть в памяти и проверяли недавно → сразу отдаём;
 *   2. есть в памяти, но пора проверить (или markStale) → отдаём текущий,
 *      пересборка идёт в фоне (меняются только изменившиеся страницы);
 *   3. в памяти нет → пробуем IndexedDB (отдаём и проверяем в фоне), иначе собираем и ждём.
 * force: true — ждать свежую сборку.
 *
 * Подписчики (subscribe) узнают о новой версии корпуса.
 */

import { loadCorpus } from './corpus-loader.js';
import { readCachedCorpus, writeCachedCorpus } from './corpus-cache.js';
import { LOADER_DEFAULTS } from '../config.js';

/** @type {Map<string, ReturnType<typeof createCorpusManager>>} */
const managers = new Map();

/**
 * @param {{
 *   source: { key: string, getAppJson: Function, getPageJson: Function },
 *   excludedSlugs?: string[],
 *   parseOptions?: object,
 *   revalidateMs?: number,
 *   persist?: boolean
 * }} options
 */
function createCorpusManager({
    source,
    excludedSlugs = [],
    parseOptions = {},
    revalidateMs = LOADER_DEFAULTS.revalidateMs,
    persist = true
}) {
    const cacheKey = `${source.key}|${[...excludedSlugs].sort().join(',')}`;
    let corpus = null;
    let checkedAt = 0;
    let isStale = false;
    let inflight = null;
    let progress = { loaded: 0, total: 0 };
    const listeners = new Set();
    const progressListeners = new Set();

    const emit = () => listeners.forEach((fn) => {
        try {
            fn(corpus);
        } catch (e) {
            // слушатель не должен ломать сборку
        }
    });

    const rebuild = () => {
        if (inflight) {
            return inflight;
        }
        progress = { loaded: 0, total: 0 };
        inflight = loadCorpus({
            source,
            previous: corpus,
            excludedSlugs,
            parseOptions,
            onProgress: (p) => {
                progress = p;
                progressListeners.forEach((fn) => fn(p));
            }
        })
            .then((next) => {
                checkedAt = Date.now();
                isStale = false;
                if (!corpus || corpus.version !== next.version) {
                    corpus = next;
                    if (persist) {
                        writeCachedCorpus(cacheKey, next);
                    }
                    emit();
                }
                return corpus;
            })
            .finally(() => {
                inflight = null;
            });
        return inflight;
    };

    const restoreFromCache = async () => {
        if (!persist || corpus) {
            return corpus;
        }
        const cached = await readCachedCorpus(cacheKey);
        if (cached && !corpus) {
            corpus = cached;
            emit();
        }
        return corpus;
    };

    return {
        key: cacheKey,

        /**
         * @param {{ force?: boolean, onProgress?: (p: {loaded: number, total: number}) => void }} [options]
         * @return {Promise<import('./corpus-loader.js').Corpus>}
         */
        async get({ force = false, onProgress } = {}) {
            if (onProgress) {
                progressListeners.add(onProgress);
            }
            try {
                if (!corpus) {
                    await restoreFromCache();
                }
                const isDue = isStale || Date.now() - checkedAt > revalidateMs;
                if (corpus && !force) {
                    if (isDue) {
                        // фоновая проверка; ошибка не мешает отвечать по прошлой версии
                        rebuild().catch(() => {});
                    }
                    return corpus;
                }
                return await rebuild();
            } finally {
                if (onProgress) {
                    progressListeners.delete(onProgress);
                }
            }
        },

        /** @return {import('./corpus-loader.js').Corpus|null} */
        peek: () => corpus,

        /** Проект изменился (сохранение в редакторе) — следующий get() проверит обновления. */
        markStale() {
            isStale = true;
        },

        get isLoading() {
            return Boolean(inflight);
        },

        get progress() {
            return progress;
        },

        /**
         * @param {(corpus: object) => void} fn
         * @return {() => void}
         */
        subscribe(fn) {
            listeners.add(fn);
            return () => listeners.delete(fn);
        },

        /**
         * @param {(p: {loaded: number, total: number}) => void} fn
         * @return {() => void}
         */
        subscribeProgress(fn) {
            progressListeners.add(fn);
            return () => progressListeners.delete(fn);
        }
    };
}

/**
 * Менеджер корпуса для источника (один на проект и набор исключений).
 *
 * @param {Parameters<typeof createCorpusManager>[0]} options
 * @return {ReturnType<typeof createCorpusManager>}
 */
export function getCorpusManager(options) {
    const key = `${options.source.key}|${[...(options.excludedSlugs || [])].sort().join(',')}`;
    let manager = managers.get(key);
    if (!manager) {
        manager = createCorpusManager(options);
        managers.set(key, manager);
    }
    return manager;
}
