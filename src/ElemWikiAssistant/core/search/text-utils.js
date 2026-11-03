/**
 * Нормализация, токенизация и лёгкий стеммер (RU + EN) для поиска разделов.
 *
 * Стеммер не морфологический: отрезает типичное окончание, корень ≥ 3 букв,
 * сравниваются первые 6 знаков. Этого хватает, чтобы «фильтры», «фильтра»,
 * «фильтрация» совпадали, а «процент» не находился по «проце…сс».
 */

import { SEARCH_LIMITS } from '../config.js';

const WORD_RE = /[\p{L}\p{N}]+/gu;

/** Окончания: длинные раньше коротких (альтернация берёт самое левое совпадение = самое длинное). */
const RU_ENDING_RE = new RegExp(
    '(иями|ями|ами|ости|ость|ение|ения|ений|ением|ировать|ировал|ирует|ующий|ующая|ующие|' +
        'ого|его|ому|ему|ыми|ими|ией|ий|ый|ой|ая|яя|ое|ее|ые|ие|ия|ии|ах|ях|ам|ям|ом|ем|ую|юю|' +
        'ов|ев|ей|ешь|ете|ить|ать|ять|еть|ут|ют|ит|ет|ся|сь|ть|а|я|о|е|ы|и|у|ю|ь|й)$'
);
const EN_ENDING_RE = /(ings|ing|ers|er|ies|es|ed|ly|s)$/;
const CYRILLIC_RE = /[а-я]/;

export const STOP_WORDS = new Set(
    (
        // служебные слова RU
        'и в во на с со к ко о об от до по за из у не ни но а же ли бы то как что это этот эта эти ' +
        'там тут где когда чем так также или либо если чтобы для при без над под про через ' +
        'мне меня мой моя мои нам нас наш ваш вы ты он она они его её ее их кто какой какая какие каким ' +
        'есть был была были быть будет можно нужно надо нельзя ' +
        // «пустые» глаголы вопроса: ничего не говорят о теме
        'сделать делать сделал сделаю добавить добавлять хочу хотим хотел могу можем может ' +
        'подскажи подскажите скажи скажите расскажи расскажите помоги помогите объясни объясните пожалуйста ' +
        'почему зачем куда откуда сколько каким образом ' +
        // EN
        'the a an and or of to in on at for with by from is are was be can how what why where which ' +
        'do does i we you it this that please'
    ).split(/\s+/)
);

/**
 * @param {string} str
 * @return {string}
 */
export function normalize(str) {
    return String(str || '')
        .toLowerCase()
        .replace(/ё/g, 'е');
}

/**
 * @param {string} str
 * @return {string[]}
 */
export function tokenize(str) {
    return normalize(str).match(WORD_RE) || [];
}

/**
 * @param {string} word — уже нормализованное слово
 * @return {string}
 */
export function stem(word) {
    const { stemLength, minStemLength } = SEARCH_LIMITS;
    if (word.length <= minStemLength) {
        return word;
    }
    const re = CYRILLIC_RE.test(word) ? RU_ENDING_RE : EN_ENDING_RE;
    const cut = word.replace(re, '');
    const root = cut.length >= minStemLength ? cut : word;
    return root.slice(0, stemLength);
}

/**
 * Стемы значимых слов текста (с повторами — для подсчёта частоты).
 *
 * @param {string} str
 * @return {string[]}
 */
export function textStems(str) {
    return tokenize(str).map(stem);
}

/**
 * Уникальные стемы запроса без стоп-слов и слишком коротких слов.
 * Короткие латинские аббревиатуры (sql, kpi, ai, id) сохраняются.
 *
 * @param {string} str
 * @return {string[]}
 */
export function queryStems(str) {
    const result = [];
    tokenize(str).forEach((w) => {
        if (STOP_WORDS.has(w)) {
            return;
        }
        if (w.length <= 2 && !/^[a-z0-9]{2}$/.test(w)) {
            return;
        }
        const s = stem(w);
        if (!result.includes(s)) {
            result.push(s);
        }
    });
    return result;
}

/**
 * @param {string} str
 * @return {number}
 */
export function wordCount(str) {
    return tokenize(str).length;
}
