#!/usr/bin/env node
/**
 * Проверка сборщика корпуса и поиска ElemWikiAssistant на распакованном ZIP проекта вики.
 *
 *   node scripts/wiki-assistant-check.mjs <папка проекта с app.json> [вопрос ...]
 *   node scripts/wiki-assistant-check.mjs ./WIKI --dump corpus.json
 *   node scripts/wiki-assistant-check.mjs ./WIKI --page /button
 *
 * Без вопросов прогоняет встроенный набор и печатает, какие разделы ушли бы модели.
 */

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { loadCorpus } from '../src/ElemWikiAssistant/core/corpus/corpus-loader.js';
import { getSearchIndex, pickSections, buildRouteCatalog } from '../src/ElemWikiAssistant/core/search/search-index.js';

const DEFAULT_QUESTIONS = [
    'как настроить кнопку для перехода по ссылке',
    'как скопировать ссылку на дашборд с фильтрами',
    'как сделать сводную таблицу',
    'как добавить линейный график',
    'что такое накопительный итог',
    'как подключить источник данных',
    'как настроить фильтр по дате',
    'как сделать попап',
    'как выгрузить данные в excel',
    'как поменять цвет кнопки',
    'как работают переменные в хранилище',
    'как создать новое приложение и как его назвать'
];

const args = process.argv.slice(2);
const dir = args.shift();
if (!dir) {
    console.error('Укажите папку проекта (где лежит app.json).');
    process.exit(1);
}
const flag = (name) => {
    const i = args.indexOf(name);
    if (i === -1) {
        return null;
    }
    const value = args[i + 1];
    args.splice(i, 2);
    return value;
};
const dumpPath = flag('--dump');
const pageSlug = flag('--page');
const questions = args.length ? [args.join(' ')] : DEFAULT_QUESTIONS;

const source = {
    key: path.resolve(dir),
    getAppJson: () => readFile(path.join(dir, 'app.json'), 'utf8'),
    getPageJson: (pageId) => readFile(path.join(dir, 'pages', `${pageId}.json`), 'utf8')
};

let t = Date.now();
const corpus = await loadCorpus({ source });
const loadMs = Date.now() - t;
t = Date.now();
const index = getSearchIndex(corpus);
const indexMs = Date.now() - t;

const s = corpus.stats;
const sectionLengths = corpus.pages.flatMap((p) => p.sections.map((x) => x.text.length)).sort((a, b) => a - b);
const pct = (q) => sectionLengths[Math.min(sectionLengths.length - 1, Math.floor(q * sectionLengths.length))];
console.log(`Корпус ${corpus.version}: маршрутов ${s.routes}, страниц ${s.pages}, разделов ${s.sections}`);
console.log(`Текст: ${s.chars} символов (~${Math.round(s.chars / 3)} токенов). Сборка ${loadMs} мс, индекс ${indexMs} мс`);
console.log(`Длина раздела: медиана ${pct(0.5)}, p90 ${pct(0.9)}, max ${pct(1)}`);
if (s.failed.length) {
    console.log(`Не загрузились: ${s.failed.join(', ')}`);
}
const empty = corpus.stats.routes - corpus.stats.pages;
if (empty) {
    console.log(`Страниц без текста (пропущены): ${empty}`);
}
const catalog = JSON.stringify(buildRouteCatalog(corpus));
console.log(`Оглавление для /route: ${catalog.length} символов`);

// повторная сборка с previous: всё переиспользуется, версия та же
const again = await loadCorpus({ source, previous: corpus });
console.log(`Повторная сборка: версия ${again.version === corpus.version ? 'не изменилась' : 'ИЗМЕНИЛАСЬ'}`);

if (dumpPath) {
    await writeFile(dumpPath, JSON.stringify(corpus, null, 1));
    console.log(`Корпус сохранён в ${dumpPath}`);
}

if (pageSlug) {
    const page = index.pagesBySlug.get(pageSlug);
    if (!page) {
        console.log(`Страница ${pageSlug} не найдена`);
    } else {
        console.log(`\n=== [[${page.id}]] ${page.title}\nЛид: ${page.lead}`);
        page.sections.forEach((x) => console.log(`\n--- ${x.id} · ${x.heading} (${x.text.length})\n${x.text}`));
    }
    process.exit(0);
}

for (const question of questions) {
    t = Date.now();
    const result = pickSections(index, { question });
    const ms = Date.now() - t;
    const total = result.sections.reduce((n, x) => n + x.text.length, 0);
    console.log(`\n? ${question}   (${ms} мс, ${result.sections.length} разделов, ${total} символов)`);
    result.debug.ranked.slice(0, 5).forEach((r) => {
        const p = index.pagesById.get(r.id);
        console.log(`    ${r.score.toFixed(2).padStart(6)}  ${r.id} — ${p.title}`);
    });
    result.sections.forEach((x) => console.log(`  → [[${x.pageId}]] ${x.heading} (${x.text.length})`));
}
