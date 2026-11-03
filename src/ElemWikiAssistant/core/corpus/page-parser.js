/**
 * Разбор страницы проекта вики (`pages/<pageId>.json`) в страницу корпуса.
 *
 * Страница проекта — массив корневых узлов `{ id, type, props, children }`.
 * Текст вики живёт в `ElemText.props.html`, роль блока задаёт CSS-класс:
 *   textPageName → заголовок страницы, textDesc → лид, textHeader → начало раздела,
 *   остальное → тело текущего раздела.
 * Порядок блоков задаёт `grid.areas` у разметки (`ElemGridLayout`), а не порядок `children`.
 *
 * @typedef {{ kind: 'sub'|'line', text: string }} TextBlock
 * @typedef {{ id: string, heading: string, text: string }} CorpusSection
 * @typedef {{
 *   id: string, pageId: string, slug: string, title: string, lead: string,
 *   sections: CorpusSection[], chars: number
 * }} CorpusPage
 */

import { htmlToBlocks, htmlToPlainText } from './html-to-text.js';
import { PARSE_DEFAULTS } from '../config.js';

/**
 * Стабильный id страницы для ссылок `[[id]]`: slug без ведущего слеша.
 *
 * @param {string} slug
 * @param {string} fallback
 * @return {string}
 */
export function slugToPageId(slug, fallback = '') {
    const clean = String(slug || '')
        .trim()
        .replace(/^[#/]+/, '')
        .replace(/\/+$/, '');
    return clean || (slug === '/' ? 'index' : fallback);
}

/**
 * @param {string} type
 * @return {string}
 */
function bareType(type) {
    const str = String(type || '');
    const idx = str.lastIndexOf('::');
    return idx === -1 ? str : str.slice(idx + 2);
}

/**
 * Дети узла в визуальном порядке: по `grid.areas` (сверху вниз, слева направо).
 *
 * @param {object} node
 * @return {object[]}
 */
export function orderedChildren(node) {
    const children = Array.isArray(node.children) ? node.children : [];
    const areas = node.props && node.props.grid && node.props.grid.areas;
    if (!Array.isArray(areas) || areas.length === 0 || children.length < 2) {
        return children;
    }
    const order = new Map();
    areas.forEach((row) => {
        (Array.isArray(row) ? row : [row]).forEach((area) => {
            if (!order.has(area)) {
                order.set(area, order.size);
            }
        });
    });
    // стабильная сортировка: дети без слота остаются в исходном порядке в конце
    return children
        .map((child, index) => ({ child, index, rank: order.get(child.props && child.props.slot) }))
        .sort((a, b) => {
            const ra = a.rank == null ? Number.MAX_SAFE_INTEGER : a.rank;
            const rb = b.rank == null ? Number.MAX_SAFE_INTEGER : b.rank;
            return ra - rb || a.index - b.index;
        })
        .map((x) => x.child);
}

/**
 * @param {string[]} classes
 * @param {string[]} list
 */
const hasClass = (classes, list) => classes.some((c) => list.includes(c));

/**
 * @param {unknown} cssClass
 * @return {string[]}
 */
function toClassList(cssClass) {
    if (Array.isArray(cssClass)) {
        return cssClass.flatMap((c) => String(c).split(/\s+/)).filter(Boolean);
    }
    if (typeof cssClass === 'string') {
        return cssClass.split(/\s+/).filter(Boolean);
    }
    return [];
}

/**
 * Обход дерева: плоский список текстовых элементов в визуальном порядке.
 *
 * @param {object[]} nodes
 * @param {typeof PARSE_DEFAULTS} opts
 * @return {{ role: 'title'|'lead'|'header'|'body', html: string }[]}
 */
export function collectTextItems(nodes, opts = PARSE_DEFAULTS) {
    const items = [];
    const visit = (node) => {
        if (!node || typeof node !== 'object') {
            return;
        }
        const type = bareType(node.type);
        if (opts.skipTypePattern && opts.skipTypePattern.test(type)) {
            return;
        }
        if (opts.textTypes.includes(type)) {
            const props = node.props || {};
            const html = typeof props.html === 'string' ? props.html : '';
            const classes = toClassList(props.cssClass);
            if (html && !hasClass(classes, opts.skipClasses)) {
                let role = 'body';
                if (hasClass(classes, opts.titleClasses)) {
                    role = 'title';
                } else if (hasClass(classes, opts.leadClasses)) {
                    role = 'lead';
                } else if (hasClass(classes, opts.headerClasses)) {
                    role = 'header';
                }
                items.push({ role, html });
            }
        }
        orderedChildren(node).forEach(visit);
    };
    (Array.isArray(nodes) ? nodes : [nodes]).forEach(visit);
    return items;
}

/**
 * @param {TextBlock[]} blocks
 * @return {string}
 */
function blocksToText(blocks) {
    return blocks
        .map((b) => (b.kind === 'sub' ? `**${b.text}**` : b.text))
        .join('\n')
        .trim();
}

/**
 * Строка — продолжение списка или кода? Перед такой строкой раздел не режем.
 *
 * @param {TextBlock} block
 */
const isContinuation = (block) => block.kind === 'line' && /^(\s+|\d+\.\s)/.test(block.text);

/**
 * Режет длинный раздел на части по подзаголовкам (аналог h3).
 * Раздел целиком режется только если иначе не помещается; посреди списка — никогда.
 *
 * @param {string} heading
 * @param {TextBlock[]} blocks
 * @param {number} maxChars
 * @return {{ heading: string, blocks: TextBlock[] }[]}
 */
export function splitSection(heading, blocks, maxChars) {
    const total = blocks.reduce((sum, b) => sum + b.text.length + 1, 0);
    if (total <= maxChars) {
        return [{ heading, blocks }];
    }

    // 1. группы, каждая начинается с подзаголовка
    const groups = [];
    let current = { sub: '', blocks: [], chars: 0 };
    blocks.forEach((b) => {
        if (b.kind === 'sub' && current.blocks.length > 0) {
            groups.push(current);
            current = { sub: b.text, blocks: [], chars: 0 };
        } else if (b.kind === 'sub' && !current.sub) {
            current.sub = b.text;
        }
        current.blocks.push(b);
        current.chars += b.text.length + 1;
    });
    if (current.blocks.length) {
        groups.push(current);
    }

    // 2. группа больше лимита — режем по строкам, но не перед продолжением списка
    const pieces = [];
    groups.forEach((g) => {
        if (g.chars <= maxChars) {
            pieces.push(g);
            return;
        }
        let part = { sub: g.sub, blocks: [], chars: 0 };
        g.blocks.forEach((b) => {
            const len = b.text.length + 1;
            if (part.chars + len > maxChars && part.blocks.length > 0 && !isContinuation(b)) {
                pieces.push(part);
                part = { sub: g.sub, blocks: [], chars: 0, isContinued: true };
            }
            part.blocks.push(b);
            part.chars += len;
        });
        if (part.blocks.length) {
            pieces.push(part);
        }
    });

    // 3. соседние маленькие куски склеиваем обратно, пока помещаются
    const parts = [];
    pieces.forEach((p) => {
        const last = parts[parts.length - 1];
        if (last && last.chars + p.chars <= maxChars) {
            last.blocks.push(...p.blocks);
            last.chars += p.chars;
        } else {
            parts.push({ ...p, blocks: [...p.blocks] });
        }
    });

    return parts.map((p, i) => {
        let partHeading = heading;
        if (p.sub && p.sub !== heading) {
            partHeading = `${heading} — ${p.sub}`;
        } else if (i > 0) {
            partHeading = `${heading} (продолжение)`;
        }
        if (p.isContinued && i > 0 && p.sub) {
            partHeading += ' (продолжение)';
        }
        return { heading: partHeading, blocks: p.blocks };
    });
}

/**
 * @param {object[]} nodes — содержимое `pages/<pageId>.json`
 * @param {{ pageId: string, slug: string, title?: string }} route — маршрут из `app.json`
 * @param {Partial<typeof PARSE_DEFAULTS>} [options]
 * @return {CorpusPage}
 */
export function parsePage(nodes, route, options = {}) {
    const opts = { ...PARSE_DEFAULTS, ...options };
    const id = slugToPageId(route.slug, route.pageId);
    const items = collectTextItems(nodes, opts);

    let title = '';
    let lead = '';
    const rawSections = [];
    let current = { heading: '', blocks: [] };

    items.forEach((item) => {
        if (item.role === 'title') {
            if (!title) {
                title = htmlToPlainText(item.html);
            }
            return;
        }
        if (item.role === 'lead') {
            const text = htmlToPlainText(item.html);
            if (!lead) {
                lead = text;
            } else if (text) {
                current.blocks.push({ kind: 'line', text });
            }
            return;
        }
        if (item.role === 'header') {
            const heading = htmlToPlainText(item.html);
            if (!heading) {
                return;
            }
            if (current.blocks.length || current.heading) {
                rawSections.push(current);
            }
            current = { heading, blocks: [] };
            return;
        }
        current.blocks.push(...htmlToBlocks(item.html));
    });
    rawSections.push(current);

    title = title || String(route.title || route.name || id).trim();

    const sections = [];
    rawSections.forEach((raw) => {
        const heading = raw.heading || title;
        splitSection(heading, raw.blocks, opts.maxSectionChars).forEach((part) => {
            const text = blocksToText(part.blocks);
            if (text.length < opts.minSectionChars) {
                return;
            }
            sections.push({ id: `${id}#${sections.length + 1}`, heading: part.heading, text });
        });
    });

    // Страница без тела, но с лидом — один раздел из лида, чтобы её можно было найти
    if (sections.length === 0 && lead) {
        sections.push({ id: `${id}#1`, heading: title, text: lead });
    }

    const chars = sections.reduce((sum, s) => sum + s.text.length, lead.length);
    return { id, pageId: route.pageId, slug: route.slug, title, lead, sections, chars };
}
