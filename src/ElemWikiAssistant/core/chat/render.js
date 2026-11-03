/**
 * Безопасный рендер ответа модели в HTML.
 *
 * Сначала весь текст экранируется, затем применяется минимальная разметка markdown:
 * абзацы, маркированные и нумерованные списки, `**жирный**`, `_курсив_`, `` `код` ``,
 * переносы строк. Ссылки `[[pageId]]` превращаются в ссылки на известные страницы,
 * неизвестные — удаляются. Сырой HTML модели никогда не выводится.
 */

/** Ссылка на страницу в ответе модели: `[[pageId]]` */
const CITE_RE = /\[\[\s*([\p{L}\p{N}_\-/.]+)\s*\]\]/gu;
const BULLET_RE = /^\s*[-*•]\s+(.*)$/;
const ORDERED_RE = /^\s*\d{1,3}[.)]\s+(.*)$/;
const HEADING_RE = /^\s{0,3}#{1,6}\s+(.*?)\s*#*\s*$/;
const PH = '\u0000';

/**
 * Экранировать HTML.
 *
 * @param {unknown} str
 * @return {string}
 */
export function escapeHtml(str) {
    return String(str == null ? '' : str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/**
 * Текст ответа в процессе стриминга: скрыть незакрытую ссылку `[[…` в конце
 * и блоки размышлений `<think>…</think>` (незакрытый блок — до конца текста).
 *
 * @param {string} text
 * @return {string}
 */
export function partialAnswer(text) {
    return String(text || '')
        .replace(/<think>[\s\S]*?<\/think>\s*/gi, '')
        .replace(/<think>[\s\S]*$/i, '')
        .replace(/<\/?t(?:h(?:i(?:n(?:k)?)?)?)?$/i, '')
        .replace(/\[\[[^\]\n]*\]?$/, '')
        .replace(/\[$/, '');
}

/**
 * Уникальные id страниц, на которые ссылается ответ, в порядке появления (только известные).
 *
 * @param {string} text
 * @param {Set<string>|Map<string, any>} knownIds
 * @return {string[]}
 */
export function citedPageIds(text, knownIds) {
    const out = [];
    const re = new RegExp(CITE_RE.source, CITE_RE.flags);
    let match;
    while ((match = re.exec(String(text || ''))) !== null) {
        const id = match[1];
        if ((!knownIds || knownIds.has(id)) && !out.includes(id)) {
            out.push(id);
        }
    }
    return out;
}

/**
 * Инлайн-разметка уже экранированной строки.
 *
 * @param {string} line экранированный текст
 * @param {Map<string, { title?: string }>} pagesById
 * @return {string}
 */
function renderInline(line, pagesById) {
    const stash = [];
    const keep = (html) => {
        stash.push(html);
        return `${PH}${stash.length - 1}${PH}`;
    };
    let out = line.replace(/`([^`\n]+)`/g, (m, code) => keep(`<code>${code}</code>`));
    out = out.replace(new RegExp(`\\s*${CITE_RE.source}`, CITE_RE.flags), (m, id) => {
        const page = pagesById && pagesById.get(id);
        if (!page) {
            return '';
        }
        const lead = /^\s/.test(m) ? ' ' : '';
        const title = escapeHtml(page.title || id);
        // id уже экранирован вместе со всей строкой
        return lead + keep(`<a href="#" class="aiw-cite" data-page-id="${id}">${title}</a>`);
    });
    out = out.replace(/\*\*(?=\S)([^*]+?)\*\*/g, '<strong>$1</strong>');
    out = out.replace(
        /(^|[^\p{L}\p{N}_])_(?=[^\s_])([^_]*?[^\s_])_(?![\p{L}\p{N}_])/gu,
        (m, before, inner) => `${before}<em>${inner}</em>`
    );
    return out.replace(new RegExp(`${PH}(\\d+)${PH}`, 'g'), (m, idx) => stash[Number(idx)]);
}

/**
 * Безопасный HTML ответа модели.
 *
 * @param {string} text сырой текст ответа
 * @param {Map<string, { title?: string }>} pagesById известные страницы
 * @return {string}
 */
export function answerHtml(text, pagesById) {
    const pages = pagesById || new Map();
    const source = escapeHtml(String(text || '').replace(/\u0000/g, '')).replace(/\r\n?/g, '\n');
    const lines = source.split('\n');
    const blocks = [];
    /** @type {{ type: 'p'|'ul'|'ol', items: string[] } | null} */
    let current = null;

    const flush = () => {
        if (current && current.items.length) {
            blocks.push(current);
        }
        current = null;
    };
    const push = (type, content) => {
        if (!current || current.type !== type) {
            flush();
            current = { type, items: [] };
        }
        current.items.push(content);
    };

    lines.forEach((raw) => {
        if (!raw.trim()) {
            flush();
            return;
        }
        let m = raw.match(BULLET_RE);
        if (m && m[1].trim()) {
            push('ul', m[1].trim());
            return;
        }
        m = raw.match(ORDERED_RE);
        if (m && m[1].trim()) {
            push('ol', m[1].trim());
            return;
        }
        m = raw.match(HEADING_RE);
        if (m && m[1]) {
            flush();
            blocks.push({ type: 'p', items: [`**${m[1].replace(/^\*\*|\*\*$/g, '')}**`] });
            return;
        }
        if (current && current.type !== 'p' && /^\s+\S/.test(raw)) {
            // продолжение пункта списка
            current.items[current.items.length - 1] += `\n${raw.trim()}`;
            return;
        }
        push('p', raw.trim());
    });
    flush();

    return blocks
        .map((block) => {
            const items = block.items.map((item) =>
                item
                    .split('\n')
                    .map((line) => renderInline(line, pages))
                    .join('<br>')
            );
            if (block.type === 'p') {
                const html = items.join('<br>').trim();
                return html ? `<p>${html}</p>` : '';
            }
            const lis = items.map((item) => `<li>${item}</li>`).join('');
            return `<${block.type}>${lis}</${block.type}>`;
        })
        .filter(Boolean)
        .join('');
}
