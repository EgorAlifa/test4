/**
 * Промпты помощника (порт серверных SYSTEM_PROMPT / ROUTE_PROMPT из wiki-assistant).
 *
 * System-сообщение неизменно между запросами (prefix cache провайдера):
 * всё переменное — вопрос и разделы — уходит в user-ход.
 */

export const SYSTEM_PROMPT = [
    'Ты — помощник по руководству (вики) платформы Insight. Отвечай пользователю на русском языке.',
    '',
    'Правила:',
    '1. Отвечай только по приложенным разделам руководства. Не придумывай кнопки, пункты меню, настройки и разделы, которых там нет.',
    '2. Если в разделах действительно нет ответа, скажи одной фразой: «В руководстве об этом не написано» — и предложи переформулировать вопрос. ' +
        'Но если ответ можно собрать из текста, даже без прямой формулировки, — собери его.',
    '3. Если спрашивают о самом руководстве или его странице — опиши эту страницу. Если ввод бессмысленный — попроси уточнить вопрос.',
    '4. Отвечай полно, но по делу. Действия описывай нумерованными шагами. ' +
        'Не упоминай «фрагменты», «контекст», «выдержки» или «приложенные разделы»: для пользователя это просто руководство.',
    '5. После каждого утверждения ставь ссылку на страницу в формате [[id-страницы]] — id берётся из заголовка раздела. Других ссылок не давай.',
    '6. На вопросы «кто ты» и «что умеешь» коротко ответь, что ты помощник по руководству Insight и отвечаешь на вопросы по нему.',
    '7. Предыдущие сообщения диалога — только для понимания контекста; факты бери из разделов руководства.',
    '8. Форматирование: короткие абзацы, списки, **жирный** для названий кнопок и полей. Без таблиц и HTML.'
].join('\n');

export const ROUTE_PROMPT = [
    'Тебе дан список страниц руководства в формате «id — название: описание» и вопрос пользователя.',
    'Выбери по смыслу от 1 до 3 страниц, где скорее всего есть ответ.',
    'Ответь только id через запятую, лучший первым, без пояснений. Если подходящих страниц нет — ответь none.'
].join('\n');

const LANGUAGE_LINES = {
    en: 'Answer in English, even though the guide is in Russian.'
};

/**
 * @param {string} prompt
 * @param {string} locale
 * @return {string}
 */
export function withAnswerLanguage(prompt, locale) {
    const line = LANGUAGE_LINES[String(locale || '').slice(0, 2)];
    return line ? `${prompt}\n\n${line}` : prompt;
}

/**
 * @param {{ pageId: string, title?: string, heading?: string, text: string }[]} sections
 * @param {string} question
 * @return {string}
 */
export function buildAskUserMessage(sections, question) {
    const blocks = sections.map((s) => {
        const title = s.title && s.heading && s.heading !== s.title ? `${s.title} — ${s.heading}` : s.title || s.heading;
        return `### [[${s.pageId}]] ${title || ''}\n${s.text}`;
    });
    return `Разделы руководства:\n\n${blocks.join('\n\n')}\n\nВопрос пользователя: ${question}`;
}

/**
 * @param {{ id: string, title?: string, lead?: string }[]} pages
 * @param {string} question
 * @return {string}
 */
export function buildRouteUserMessage(pages, question) {
    const lines = pages.map((p) => `${p.id} — ${p.title || ''}${p.lead ? `: ${p.lead}` : ''}`);
    return `Страницы:\n${lines.join('\n')}\n\nВопрос: ${question}`;
}
