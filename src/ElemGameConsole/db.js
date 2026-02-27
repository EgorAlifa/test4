const DB_NAME = 'ElemGameConsoleDB';
const DB_VERSION = 1;
const STORE_GAMES = 'games';

const openDB = () =>
    new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);

        req.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_GAMES)) {
                const store = db.createObjectStore(STORE_GAMES, { keyPath: 'id' });
                store.createIndex('platformId', 'platformId', { unique: false });
                store.createIndex('addedAt', 'addedAt', { unique: false });
            }
        };

        req.onsuccess = (e) => resolve(e.target.result);
        req.onerror = (e) => reject(e.target.error);
    });

export const getAllGames = async () => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_GAMES, 'readonly');
        const req = tx.objectStore(STORE_GAMES).getAll();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
};

export const addGame = async (game) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_GAMES, 'readwrite');
        const req = tx.objectStore(STORE_GAMES).put(game);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
};

export const deleteGame = async (id) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_GAMES, 'readwrite');
        const req = tx.objectStore(STORE_GAMES).delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
    });
};

export const clearAllGames = async () => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_GAMES, 'readwrite');
        const req = tx.objectStore(STORE_GAMES).clear();
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
    });
};
