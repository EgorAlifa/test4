/**
 * Постоянный кеш корпуса в IndexedDB: повторный заход не скачивает вики заново,
 * а сразу берёт прошлую версию и проверяет обновления в фоне.
 *
 * Все обращения обёрнуты в try/catch: хранилище может быть недоступно
 * (приватное окно, запрет сайта, отсутствие indexedDB в Node).
 */

import { LOADER_DEFAULTS } from '../config.js';

let dbPromise = null;

/** @return {Promise<IDBDatabase|null>} */
function openDb() {
    if (dbPromise) {
        return dbPromise;
    }
    dbPromise = new Promise((resolve) => {
        try {
            if (typeof indexedDB === 'undefined') {
                resolve(null);
                return;
            }
            const request = indexedDB.open(LOADER_DEFAULTS.idbName, 1);
            request.onupgradeneeded = () => {
                if (!request.result.objectStoreNames.contains(LOADER_DEFAULTS.idbStore)) {
                    request.result.createObjectStore(LOADER_DEFAULTS.idbStore);
                }
            };
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => resolve(null);
            request.onblocked = () => resolve(null);
        } catch (e) {
            resolve(null);
        }
    });
    return dbPromise;
}

/**
 * @param {'readonly'|'readwrite'} mode
 * @param {(store: IDBObjectStore) => IDBRequest} fn
 * @return {Promise<any>}
 */
async function withStore(mode, fn) {
    const db = await openDb();
    if (!db) {
        return null;
    }
    return new Promise((resolve) => {
        try {
            const tx = db.transaction(LOADER_DEFAULTS.idbStore, mode);
            const request = fn(tx.objectStore(LOADER_DEFAULTS.idbStore));
            request.onsuccess = () => resolve(request.result ?? null);
            request.onerror = () => resolve(null);
        } catch (e) {
            resolve(null);
        }
    });
}

/**
 * @param {string} key
 * @return {Promise<import('./corpus-loader.js').Corpus|null>}
 */
export async function readCachedCorpus(key) {
    const value = await withStore('readonly', (store) => store.get(key));
    if (!value || value.formatVersion !== LOADER_DEFAULTS.formatVersion || !Array.isArray(value.pages)) {
        return null;
    }
    return value;
}

/**
 * @param {string} key
 * @param {import('./corpus-loader.js').Corpus} corpus
 */
export async function writeCachedCorpus(key, corpus) {
    await withStore('readwrite', (store) => store.put(corpus, key));
}
