/**
 * Конвертер HTML из ElemText.props.html в структурированные строки текста.
 *
 * Работает без DOM (регэксп-токенайзер), поэтому одинаково запускается
 * в браузере и в Node (скрипт проверки корпуса).
 *
 * Результат — массив блоков:
 *   { kind: 'sub', text }  — подзаголовок (h1–h6 или абзац целиком из <strong>/<b>)
 *   { kind: 'line', text } — обычная строка (абзац, пункт списка, строка таблицы)
 */

const NAMED_ENTITIES = {
    nbsp: ' ',
    amp: '&',
    lt: '<',
    gt: '>',
    quot: '"',
    apos: "'",
    laquo: '«',
    raquo: '»',
    ldquo: '“',
    rdquo: '”',
    bdquo: '„',
    lsquo: '‘',
    rsquo: '’',
    mdash: '—',
    ndash: '–',
    hellip: '…',
    middot: '·',
    bull: '•',
    copy: '©',
    reg: '®',
    trade: '™',
    times: '×',
    rarr: '→',
    larr: '←',
    shy: ''
};

const MAX_SUBHEADING_LENGTH = 100;
const LIST_INDENT = '  ';

/** Теги, которые завершают текущую строку при открытии/закрытии. */
const LINE_BREAK_TAGS = new Set([
    'p',
    'div',
    'li',
    'tr',
    'table',
    'ul',
    'ol',
    'pre',
    'blockquote',
    'section',
    'article',
    'details',
    'summary',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'hr',
    'dt',
    'dd'
]);

const HEADING_TAGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'summary']);
const BOLD_TAGS = new Set(['strong', 'b']);
const SKIP_CONTENT_TAGS = new Set(['script', 'style', 'svg', 'template']);
// Тег целиком, с учётом кавычек: в атрибутах бывает `>` (onclick="() => …")
const TOKEN_RE = /<!--[\s\S]*?-->|<\/?[a-zA-Z](?:[^>"']|"[^"]*"|'[^']*')*>|[^<]+|</g;
const TAG_RE = /^<(\/?)([a-zA-Z0-9]+)([\s\S]*)>$/;

/**
 * @param {string} str
 * @return {string}
 */
export function decodeEntities(str) {
    if (!str || str.indexOf('&') === -1) {
        return str;
    }
    return str.replace(/&(#x[0-9a-f]+|#\d+|[a-z][a-z0-9]*);/gi, (match, code) => {
        if (code[0] === '#') {
            const isHex = code[1] === 'x' || code[1] === 'X';
            const num = parseInt(code.slice(isHex ? 2 : 1), isHex ? 16 : 10);
            if (!Number.isFinite(num) || num <= 0 || num > 0x10ffff) {
                return '';
            }
            // неразрывный пробел → обычный
            return num === 160 ? ' ' : String.fromCodePoint(num);
        }
        const named = NAMED_ENTITIES[code.toLowerCase()];
        return named == null ? match : named;
    });
}

/**
 * @param {string} attrs
 * @param {string} name
 * @return {string}
 */
function readAttr(attrs, name) {
    const re = new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i');
    const m = attrs.match(re);
    if (!m) {
        return '';
    }
    return decodeEntities(m[2] ?? m[3] ?? m[4] ?? '');
}

/**
 * @param {string} html
 * @return {{kind: 'sub'|'line', text: string}[]}
 */
export function htmlToBlocks(html) {
    const blocks = [];
    if (!html || typeof html !== 'string') {
        return blocks;
    }

    const listStack = []; // { type: 'ul'|'ol', counter }
    let buf = '';
    let prefix = '';
    let boldDepth = 0;
    let preDepth = 0;
    let skipDepth = 0;
    let isHeading = false;
    let isListItem = false;
    let hasPlainText = false; // в строке есть текст вне <strong>
    let hasBoldText = false;
    let cellIndex = 0;

    const resetLine = () => {
        buf = '';
        prefix = '';
        isHeading = false;
        isListItem = false;
        hasPlainText = false;
        hasBoldText = false;
        cellIndex = 0;
    };

    const flush = () => {
        const text = buf.replace(/[ \t\f\v ]+/g, ' ').trim();
        if (text) {
            const isBoldOnly = hasBoldText && !hasPlainText && !isListItem;
            const isSub = (isHeading || isBoldOnly) && text.length <= MAX_SUBHEADING_LENGTH;
            blocks.push({ kind: isSub ? 'sub' : 'line', text: isSub ? text : prefix + text });
        }
        resetLine();
    };

    const appendText = (raw) => {
        if (skipDepth > 0) {
            return;
        }
        let text = decodeEntities(raw);
        if (preDepth > 0) {
            // в <pre> сохраняем переносы строк: каждая строка — отдельный блок
            const lines = text.split(/\r?\n/);
            lines.forEach((line, i) => {
                if (i > 0) {
                    flush();
                }
                if (line.trim()) {
                    buf += line.replace(/\t/g, LIST_INDENT);
                    hasPlainText = true;
                }
            });
            return;
        }
        text = text.replace(/\s+/g, ' ');
        if (!text.trim()) {
            if (buf && !buf.endsWith(' ')) {
                buf += ' ';
            }
            return;
        }
        if (boldDepth > 0) {
            hasBoldText = true;
        } else {
            hasPlainText = true;
        }
        buf += text;
    };

    const tokens = html.match(TOKEN_RE) || [];
    for (const token of tokens) {
        if (token.startsWith('<!--')) {
            continue;
        }
        const tag = token.match(TAG_RE);
        if (!tag) {
            appendText(token);
            continue;
        }
        const isClose = tag[1] === '/';
        const name = tag[2].toLowerCase();
        const attrs = tag[3] || '';

        if (SKIP_CONTENT_TAGS.has(name)) {
            skipDepth = Math.max(0, skipDepth + (isClose ? -1 : 1));
            continue;
        }
        if (skipDepth > 0) {
            continue;
        }

        if (name === 'br') {
            flush();
            continue;
        }
        if (BOLD_TAGS.has(name)) {
            boldDepth = Math.max(0, boldDepth + (isClose ? -1 : 1));
            continue;
        }
        if (name === 'img' && !isClose) {
            const alt = readAttr(attrs, 'alt').trim();
            if (alt) {
                appendText(` [рисунок: ${alt}] `);
            }
            continue;
        }
        if (name === 'td' || name === 'th') {
            if (!isClose) {
                if (cellIndex > 0) {
                    buf += ' | ';
                }
                cellIndex += 1;
            }
            continue;
        }
        if (name === 'pre') {
            flush();
            preDepth = Math.max(0, preDepth + (isClose ? -1 : 1));
            continue;
        }
        if (name === 'ul' || name === 'ol') {
            flush();
            if (isClose) {
                listStack.pop();
            } else {
                listStack.push({ type: name, counter: 0 });
            }
            continue;
        }
        if (name === 'li') {
            flush();
            if (!isClose) {
                const list = listStack[listStack.length - 1];
                const depth = Math.max(0, listStack.length - 1);
                let marker = '- ';
                if (list && list.type === 'ol') {
                    list.counter += 1;
                    marker = `${list.counter}. `;
                }
                prefix = LIST_INDENT.repeat(depth) + marker;
                isListItem = true;
            }
            continue;
        }
        if (LINE_BREAK_TAGS.has(name)) {
            // Абзац внутри <li> продолжает пункт списка, а не начинает новую строку
            if (name === 'p' && isListItem && !buf.trim()) {
                continue;
            }
            const keepPrefix = name === 'p' && isListItem && !isClose ? prefix : '';
            flush();
            if (keepPrefix) {
                prefix = keepPrefix;
                isListItem = true;
            }
            if (!isClose && HEADING_TAGS.has(name)) {
                isHeading = true;
            }
        }
        // прочие инлайновые теги (a, span, em, code, …) — только текст
    }
    flush();
    return blocks;
}

/**
 * Плоский текст (для заголовков, лидов).
 *
 * @param {string} html
 * @return {string}
 */
export function htmlToPlainText(html) {
    return htmlToBlocks(html)
        .map((b) => b.text)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
}
