/**
 * Ответ без модели: выборка из найденных разделов тех фрагментов, что отвечают на вопрос.
 *
 * Раздел режется на фрагменты: абзац, подзаголовок (**…**) вместе с текстом под ним,
 * строка-вводная вместе со списком под ней (шаги и пункты не разрываются).
 * Фрагменты ранжируются по словам вопроса (стеммер и синонимы поиска, IDF по фрагментам),
 * в ответ идут лучшие фрагменты лучшего раздела в исходном порядке и ссылки на соседние страницы.
 * Если слова вопроса нигде не встретились — честное «не нашёл» и подходящие страницы.
 */

import { normalize, queryStems, textStems } from '../search/text-utils.js';
import { expandSynonyms } from '../search/synonyms.js';

const LIMITS = Object.freeze({
    answerChars: 1100,
    chunks: 3,
    relatedPages: 3,
    /** соседний раздел попадает в «ещё по теме», если его счёт ≥ доли лучшего */
    relatedShare: 0.35,
    /** фрагмент берётся в ответ, если его счёт ≥ доли лучшего фрагмента */
    chunkShare: 0.3
});

const SYNONYM_WEIGHT = 0.5;
const MIN_PREFIX = 4;
const LEAD_RE = /^О странице:\s*/;
const LIST_RE = /^\s*(?:[-*•]|\d+[.)])\s+/;
const HOWTO_RE = /\b(как|каким образом|где|что нужно|порядок|шаг|настро|добав|созда|включ|подключ)/;

/**
 * @param {string} text
 * @return {{ text: string, isList: boolean, isLead: boolean }[]}
 */
export function splitChunks(text) {
    const chunks = [];
    let current = null;
    const flush = () => {
        if (current && current.lines.length) {
            chunks.push({
                text: current.lines.join('\n').trim(),
                isList: current.lines.some((l) => LIST_RE.test(l)),
                isLead: current.isLead
            });
        }
        current = null;
    };
    String(text || '')
        .split('\n')
        .forEach((raw) => {
            const line = raw.replace(/\s+$/, '');
            if (!line.trim()) {
                return;
            }
            if (LEAD_RE.test(line)) {
                flush();
                chunks.push({ text: line.replace(LEAD_RE, '').trim(), isList: false, isLead: true });
                return;
            }
            const isSub = /^\*\*.+\*\*$/.test(line.trim());
            const isItem = LIST_RE.test(line);
            if (isSub) {
                flush();
                current = { lines: [line], isLead: false, hasBody: false };
                return;
            }
            if (isItem) {
                // пункт списка продолжает текущий фрагмент (вводная строка + список)
                if (!current) {
                    current = { lines: [], isLead: false, hasBody: false };
                }
                current.lines.push(line);
                current.inList = true;
                return;
            }
            // обычная строка: после списка или после абзаца — новый фрагмент,
            // сразу после подзаголовка — его текст
            if (current && !current.inList && !current.hasBody && /^\*\*/.test(current.lines[0])) {
                current.lines.push(line);
                current.hasBody = true;
                return;
            }
            flush();
            current = { lines: [line], isLead: false, hasBody: true };
        });
    flush();
    return chunks;
}

/**
 * @param {string[]} vocab — стемы фрагмента
 * @param {string} q — стем запроса
 */
const hasStem = (vocab, q) =>
    vocab.some((v) => v === q || (q.length >= MIN_PREFIX && v.length >= MIN_PREFIX && (v.startsWith(q) || q.startsWith(v))));

/**
 * @param {string} question
 * @param {{ pageId: string, title?: string, heading?: string, text: string }[]} sections
 * @return {{ answer: string, pageIds: string[], isFound: boolean }}
 */
export function extractiveAnswer(question, sections) {
    const list = (Array.isArray(sections) ? sections : []).filter((s) => s && s.pageId && s.text);
    const userStems = queryStems(question);
    const synStems = queryStems(expandSynonyms(normalize(question))).filter((s) => !userStems.includes(s));
    const terms = [...userStems.map((s) => ({ s, w: 1 })), ...synStems.map((s) => ({ s, w: SYNONYM_WEIGHT }))];
    const isHowTo = HOWTO_RE.test(normalize(question));

    // фрагменты всех разделов
    const all = [];
    list.forEach((section, si) => {
        const headingStems = [...new Set(textStems(`${section.title || ''} ${section.heading || ''}`))];
        splitChunks(section.text).forEach((chunk, ci) => {
            all.push({ si, ci, chunk, stems: [...new Set(textStems(chunk.text))], headingStems });
        });
    });

    // IDF термина по фрагментам: слово, которое есть везде, почти ничего не решает
    const idf = new Map();
    terms.forEach(({ s }) => {
        const df = all.filter((x) => hasStem(x.stems, s)).length;
        idf.set(s, df ? Math.log(1 + all.length / df) : 0);
    });

    all.forEach((x) => {
        let score = 0;
        terms.forEach(({ s, w }) => {
            if (hasStem(x.stems, s)) {
                score += idf.get(s) * w;
            }
        });
        if (score > 0 && isHowTo && x.chunk.isList) {
            score *= 1.25; // на «как…» лучше отвечают шаги
        }
        x.score = score;
    });

    // счёт раздела: лучший фрагмент + совпадения в заголовке
    const sectionScores = list.map((section, si) => {
        const own = all.filter((x) => x.si === si);
        const best = own.reduce((m, x) => Math.max(m, x.score), 0);
        const head = own.length ? own[0].headingStems : [];
        const headScore = terms.reduce((n, { s, w }) => n + (hasStem(head, s) ? (idf.get(s) || 0.5) * w : 0), 0);
        return { si, score: best + 0.5 * headScore };
    });
    sectionScores.sort((a, b) => b.score - a.score || a.si - b.si);

    const top = sectionScores[0];
    if (!top || top.score <= 0) {
        const pages = [...new Set(list.map((s) => s.pageId))].slice(0, LIMITS.relatedPages);
        const answer = pages.length
            ? `Точного ответа в вики я не нашёл. Возможно, поможет: ${pages.map((id) => `[[${id}]]`).join(', ')}.\n\nПопробуйте переформулировать вопрос — например, назвать виджет или настройку.`
            : 'Точного ответа в вики я не нашёл. Попробуйте переформулировать вопрос — например, назвать виджет или настройку.';
        return { answer, pageIds: pages, isFound: false };
    }

    // лучшие фрагменты лучшего раздела — в исходном порядке
    const section = list[top.si];
    const own = all.filter((x) => x.si === top.si && x.score > 0 && !x.chunk.isLead);
    const bestChunk = own.reduce((m, x) => Math.max(m, x.score), 0);
    const picked = [];
    let size = 0;
    own.filter((x) => x.score >= bestChunk * LIMITS.chunkShare)
        .sort((a, b) => b.score - a.score)
        .some((x) => {
            if (picked.length >= LIMITS.chunks) {
                return true;
            }
            if (picked.length && size + x.chunk.text.length > LIMITS.answerChars) {
                return false;
            }
            picked.push(x);
            size += x.chunk.text.length;
            return false;
        });
    picked.sort((a, b) => a.ci - b.ci);

    let body = picked.map((x) => x.chunk.text).join('\n\n');
    if (!body) {
        // совпал только заголовок — берём начало раздела
        body = splitChunks(section.text)
            .filter((c) => !c.isLead)
            .slice(0, 2)
            .map((c) => c.text)
            .join('\n\n');
    }
    if (body.length > LIMITS.answerChars * 1.6) {
        body = `${body.slice(0, LIMITS.answerChars * 1.6).replace(/\s+\S*$/, '')}…`;
    }

    const heading = section.heading && section.heading !== section.title ? `${section.title} — ${section.heading}` : section.title || section.heading;
    // подзаголовок фрагмента, уже вошедший в заголовок ответа, не повторяем
    body = body.replace(/^\*\*(.+?)\*\*\n?/, (m, sub) => (heading.endsWith(sub.trim()) ? '' : m)).trim();
    const parts = [`**${heading}**`, body, `Подробнее: [[${section.pageId}]]`];

    const related = [];
    sectionScores.slice(1).forEach((x) => {
        const s = list[x.si];
        if (x.score >= top.score * LIMITS.relatedShare && s.pageId !== section.pageId && !related.includes(s.pageId)) {
            related.push(s.pageId);
        }
    });
    if (related.length) {
        parts.push(`Ещё по теме: ${related.slice(0, LIMITS.relatedPages).map((id) => `[[${id}]]`).join(', ')}`);
    }

    return { answer: parts.join('\n\n'), pageIds: [section.pageId, ...related.slice(0, LIMITS.relatedPages)], isFound: true };
}
