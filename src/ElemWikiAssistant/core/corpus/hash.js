/**
 * Быстрый некриптографический хеш строки (FNV-1a, 32 бита → 8 hex).
 * Нужен только чтобы заметить, что страница изменилась.
 *
 * @param {string} str
 * @param {number} [seed]
 * @return {string}
 */
export function hashString(str, seed = 0x811c9dc5) {
    let h = seed >>> 0;
    const s = String(str);
    for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 0x01000193) >>> 0;
    }
    return h.toString(16).padStart(8, '0');
}

/**
 * Хеш списка строк (порядок важен).
 *
 * @param {string[]} parts
 * @return {string}
 */
export function hashList(parts) {
    // два независимых хеша → 64 бита, чтобы коллизии версий были практически невозможны
    const joined = parts.join('\u0001');
    return hashString(joined) + hashString(joined, 0x01000193);
}
