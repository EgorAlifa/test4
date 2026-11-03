/**
 * Поиск целых разделов вики под вопрос (режим «sections»).
 *
 * Ранжирование страниц: заголовок ×6, лид ×3, тело ×1 (BM25-насыщение по длине),
 * всё умножено на IDF `log(1 + N/df)` — редкие слова решают, частые только склоняют.
 * Синонимы добавляются с половинным весом.
 *
 * Порядок страниц: текущая (если совпала) → выбранные роутингом → по словам со счётом
 * ≥ ⅓ лучшего (до 3) → fallback (текущая + обзорная). Пустой список не отдаётся никогда.
 * Раздел всегда целый: объём регулируется отбором, а не обрезкой.
 */

import { SEARCH_LIMITS } from '../config.js';
import { normalize, queryStems, textStems, wordCount } from './text-utils.js';
import { expandSynonyms } from './synonyms.js';

const BM25_K = 1.2;
const BM25_B = 0.75;
const SYNONYM_WEIGHT = 0.5;
const MIN_PREFIX_STEM = 4;
const LEAD_PREFIX = 'О странице: ';
const OVERVIEW_PAGE_IDS = ['index'];

/** @type {WeakMap<object, object>} */
const indexCache = new WeakMap();

const SUMMARY_MAX = 200;

/**
 * Описание страницы для оглавления и поля «лид»: лид, а если его нет — первая фраза текста.
 *
 * @param {import('../corpus/page-parser.js').CorpusPage} page
 * @return {string}
 */
export function pageSummary(page) {
    if (page.lead) {
        return page.lead;
    }
    const first = page.sections.length ? page.sections[0].text.replace(/\*\*/g, '') : '';
    const line = first.split('\n').find((l) => l.trim().length > 20) || '';
    const sentence = (line.match(/^.+?[.!?](\s|$)/) || [line])[0].trim();
    return sentence.length > SUMMARY_MAX ? `${sentence.slice(0, SUMMARY_MAX - 1)}…` : sentence;
}

/**
 * @param {string[]} stems
 * @return {Map<string, number>}
 */
function termFreq(stems) {
    const tf = new Map();
    stems.forEach((s) => tf.set(s, (tf.get(s) || 0) + 1));
    return tf;
}

/**
 * @param {import('../corpus/corpus-loader.js').Corpus} corpus
 */
function buildIndex(corpus) {
    const pages = corpus.pages.map((page) => {
        const sections = page.sections.map((section, order) => {
            const headingStems = textStems(section.heading);
            const bodyStems = textStems(section.text);
            return {
                section,
                order,
                headingTf: termFreq(headingStems),
                bodyTf: termFreq(bodyStems),
                length: bodyStems.length
            };
        });
        const bodyTf = new Map();
        let length = 0;
        sections.forEach((s) => {
            s.bodyTf.forEach((n, k) => bodyTf.set(k, (bodyTf.get(k) || 0) + n));
            s.headingTf.forEach((n, k) => bodyTf.set(k, (bodyTf.get(k) || 0) + n));
            length += s.length;
        });
        return {
            page,
            titleTf: termFreq(textStems(page.title)),
            leadTf: termFreq(textStems(pageSummary(page))),
            bodyTf,
            length,
            sections
        };
    });

    const vocab = new Map(); // stem → df (страниц)
    pages.forEach((p) => {
        const seen = new Set([...p.titleTf.keys(), ...p.leadTf.keys(), ...p.bodyTf.keys()]);
        seen.forEach((s) => vocab.set(s, (vocab.get(s) || 0) + 1));
    });

    const avgPageLength = pages.reduce((n, p) => n + p.length, 0) / Math.max(1, pages.length);
    const allSections = pages.flatMap((p) => p.sections);
    const avgSectionLength = allSections.reduce((n, s) => n + s.length, 0) / Math.max(1, allSections.length);

    return {
        corpusVersion: corpus.version,
        pages,
        vocab,
        vocabList: [...vocab.keys()],
        avgPageLength: avgPageLength || 1,
        avgSectionLength: avgSectionLength || 1,
        pagesById: new Map(corpus.pages.map((p) => [p.id, p])),
        pagesBySlug: new Map(corpus.pages.map((p) => [p.slug, p])),
        expansionCache: new Map()
    };
}

/**
 * Индекс корпуса (строится один раз на объект корпуса).
 *
 * @param {import('../corpus/corpus-loader.js').Corpus} corpus
 */
export function getSearchIndex(corpus) {
    let index = indexCache.get(corpus);
    if (!index) {
        index = buildIndex(corpus);
        indexCache.set(corpus, index);
    }
    return index;
}

/**
 * Стемы словаря, которые считаются совпадением со стемом запроса:
 * равенство, а для стемов ≥ 4 знаков — совпадение начала (в обе стороны).
 *
 * @param {object} index
 * @param {string} qs
 * @return {string[]}
 */
function expandStem(index, qs) {
    if (index.expansionCache.has(qs)) {
        return index.expansionCache.get(qs);
    }
    const result = [];
    if (qs.length < MIN_PREFIX_STEM) {
        if (index.vocab.has(qs)) {
            result.push(qs);
        }
    } else {
        index.vocabList.forEach((v) => {
            if (v === qs || (v.length >= MIN_PREFIX_STEM && (v.startsWith(qs) || qs.startsWith(v)))) {
                result.push(v);
            }
        });
    }
    index.expansionCache.set(qs, result);
    return result;
}

/**
 * @param {Map<string, number>} tf
 * @param {string[]} stems
 */
const sumTf = (tf, stems) => stems.reduce((n, s) => n + (tf.get(s) || 0), 0);

/**
 * @param {number} tf
 * @param {number} length
 * @param {number} avg
 */
const bm25 = (tf, length, avg) => (tf === 0 ? 0 : (tf * (BM25_K + 1)) / (tf + BM25_K * (1 - BM25_B + (BM25_B * length) / avg)));

/**
 * Термины запроса с весами и IDF.
 *
 * @param {object} index
 * @param {string} question
 * @return {{ stem: string, matches: string[], weight: number, idf: number }[]}
 */
export function buildQueryTerms(index, question) {
    const userStems = queryStems(question);
    const synStems = queryStems(expandSynonyms(normalize(question))).filter((s) => !userStems.includes(s));
    const n = index.pages.length;
    const terms = [];
    const add = (stemValue, weight) => {
        const matches = expandStem(index, stemValue);
        if (matches.length === 0) {
            return;
        }
        const df = index.pages.filter(
            (p) => sumTf(p.titleTf, matches) + sumTf(p.leadTf, matches) + sumTf(p.bodyTf, matches) > 0
        ).length;
        if (df === 0) {
            return;
        }
        terms.push({ stem: stemValue, matches, weight, idf: Math.log(1 + n / df) });
    };
    userStems.forEach((s) => add(s, 1));
    synStems.forEach((s) => add(s, SYNONYM_WEIGHT));
    return terms;
}

/**
 * @param {object} index
 * @param {object} entry — элемент index.pages
 * @param {ReturnType<typeof buildQueryTerms>} terms
 * @return {number}
 */
function scorePage(index, entry, terms) {
    const { weights } = SEARCH_LIMITS;
    let score = 0;
    let matched = 0;
    terms.forEach((t) => {
        const title = sumTf(entry.titleTf, t.matches) > 0 ? 1 : 0;
        const lead = sumTf(entry.leadTf, t.matches) > 0 ? 1 : 0;
        const body = bm25(sumTf(entry.bodyTf, t.matches), entry.length, index.avgPageLength);
        const s = weights.title * title + weights.lead * lead + weights.body * body;
        if (s > 0 && t.weight === 1) {
            matched += 1;
        }
        score += s * t.idf * t.weight;
    });
    const userTerms = terms.filter((t) => t.weight === 1).length;
    // доля найденных слов вопроса: страница, где есть все слова, выше страницы с одним частым
    const coverage = userTerms ? 0.5 + (0.5 * matched) / userTerms : 1;
    return score * coverage;
}

/**
 * @param {object} index
 * @param {object} s — элемент entry.sections
 * @param {ReturnType<typeof buildQueryTerms>} terms
 * @return {number}
 */
function scoreSection(index, s, terms) {
    const { weights } = SEARCH_LIMITS;
    return terms.reduce((score, t) => {
        const heading = sumTf(s.headingTf, t.matches) > 0 ? 1 : 0;
        const body = bm25(sumTf(s.bodyTf, t.matches), s.length, index.avgSectionLength);
        return score + (weights.title * heading + weights.body * body) * t.idf * t.weight;
    }, 0);
}

/**
 * Ранжированный список страниц по вопросу.
 *
 * @param {object} index
 * @param {string} question
 * @return {{ id: string, score: number }[]}
 */
export function searchPages(index, question) {
    const terms = buildQueryTerms(index, question);
    if (terms.length === 0) {
        return [];
    }
    return index.pages
        .map((entry) => ({ id: entry.page.id, score: scorePage(index, entry, terms) }))
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score);
}

/**
 * Разделы под вопрос — то, что уйдёт в `/ask` как `sections`.
 *
 * @param {object} index
 * @param {{
 *   question: string,
 *   previousQuestion?: string,
 *   routedPageIds?: string[],
 *   currentPageId?: string|null,
 *   extraPageIds?: string[]
 * }} params
 * @return {{
 *   sections: { pageId: string, title: string, heading: string, text: string }[],
 *   pageIds: string[],
 *   query: string,
 *   debug: { ranked: { id: string, score: number }[], reasons: Record<string, string> }
 * }}
 */
export function pickSections(index, { question, previousQuestion = '', routedPageIds = [], currentPageId = null, extraPageIds = [] }) {
    const L = SEARCH_LIMITS;

    // короткое уточнение («а как поделиться?») ищем вместе с предыдущим вопросом
    const query =
        previousQuestion && wordCount(question) <= L.followUpMaxWords ? `${previousQuestion} ${question}` : question;

    const terms = buildQueryTerms(index, query);
    const entriesById = new Map(index.pages.map((e) => [e.page.id, e]));
    const scores = new Map(index.pages.map((e) => [e.page.id, terms.length ? scorePage(index, e, terms) : 0]));
    const ranked = [...scores.entries()]
        .filter(([, score]) => score > 0)
        .sort((a, b) => b[1] - a[1])
        .map(([id, score]) => ({ id, score }));

    const order = [];
    const reasons = {};
    const push = (id, reason) => {
        if (id && entriesById.has(id) && !order.includes(id)) {
            order.push(id);
            reasons[id] = reason;
        }
    };

    if (currentPageId && scores.get(currentPageId) > 0) {
        push(currentPageId, 'current');
    }
    extraPageIds.forEach((id) => push(id, 'extra'));
    routedPageIds.forEach((id) => push(id, 'routed'));
    const best = ranked.length ? ranked[0].score : 0;
    ranked
        .filter((x) => x.score >= best * L.relativeThreshold)
        .slice(0, L.maxWordPages)
        .forEach((x) => push(x.id, 'words'));
    if (order.length === 0) {
        push(currentPageId, 'fallback');
        OVERVIEW_PAGE_IDS.forEach((id) => push(id, 'fallback'));
        if (order.length === 0 && index.pages.length) {
            push(index.pages[0].page.id, 'fallback');
        }
    }

    // кандидаты-разделы каждой страницы, лучшие первыми
    const candidates = order.map((id) => {
        const entry = entriesById.get(id);
        const scored = entry.sections
            .map((s) => ({ s, score: terms.length ? scoreSection(index, s, terms) : 0 }))
            .sort((a, b) => b.score - a.score || a.s.order - b.s.order);
        const hasMatch = scored.length && scored[0].score > 0;
        // страница без совпадений в разделах (роутинг, fallback) — берём вступление
        const list = hasMatch ? scored.filter((x) => x.score > 0) : scored.slice().sort((a, b) => a.s.order - b.s.order);
        return { entry, list: list.slice(0, L.sectionsPerPage) };
    });

    // текст раздела для модели: к первому разделу страницы — «О странице: <лид>»
    const leadShown = new Set();
    const render = (entry, item) => {
        const { page } = entry;
        let text = item.s.section.text;
        if (text.length > L.maxSectionChars) {
            // страховка от патологически длинного блока без подзаголовков
            text = text.slice(0, L.maxSectionChars);
        }
        if (page.lead && !leadShown.has(page.id) && text !== page.lead) {
            text = `${LEAD_PREFIX}${page.lead}\n${text}`;
        }
        return text;
    };

    // по кругу: сначала лучший раздел каждой страницы, потом вторые — шире охват
    const chosen = [];
    let total = 0;
    for (let round = 0; round < L.sectionsPerPage; round++) {
        candidates.forEach(({ entry, list }) => {
            const item = list[round];
            if (!item || chosen.length >= L.maxSections) {
                return;
            }
            const text = render(entry, item);
            if (chosen.length > 0 && total + text.length > L.maxTotalChars) {
                return;
            }
            leadShown.add(entry.page.id);
            chosen.push({ entry, item, text });
            total += text.length;
        });
    }

    // выдаём сгруппированно по страницам, разделы страницы — в порядке на странице;
    // лид переносим к первому по порядку разделу страницы
    const pageOrder = new Map(order.map((id, i) => [id, i]));
    chosen.sort(
        (a, b) => pageOrder.get(a.entry.page.id) - pageOrder.get(b.entry.page.id) || a.item.s.order - b.item.s.order
    );
    const withLead = new Set();
    const sections = chosen.map(({ entry, item, text }) => {
        const { page } = entry;
        let body = text.startsWith(LEAD_PREFIX) ? text.slice(text.indexOf('\n') + 1) : text;
        if (page.lead && !withLead.has(page.id) && body !== page.lead) {
            body = `${LEAD_PREFIX}${page.lead}\n${body}`;
        }
        withLead.add(page.id);
        return { pageId: page.id, title: page.title, heading: item.s.section.heading, text: body };
    });

    const pageIds = [...new Set(sections.map((s) => s.pageId))];
    return { sections, pageIds, query, debug: { ranked: ranked.slice(0, 10), reasons } };
}

/**
 * Оглавление для `/route`: `{ id, title, lead }`.
 *
 * @param {import('../corpus/corpus-loader.js').Corpus} corpus
 * @param {number} [maxLead]
 * @return {{ id: string, title: string, lead: string }[]}
 */
export function buildRouteCatalog(corpus, maxLead = 160) {
    return corpus.pages.map((p) => ({
        id: p.id,
        title: p.title,
        lead: (() => {
            const summary = pageSummary(p);
            return summary.length > maxLead ? `${summary.slice(0, maxLead - 1)}…` : summary;
        })()
    }));
}
