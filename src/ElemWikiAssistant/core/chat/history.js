/**
 * История диалога для запроса `ask`.
 *
 * @typedef {{ role: 'user'|'assistant', text: string, status?: 'pending'|'done'|'error', isLocal?: boolean }} ChatMessage
 * @typedef {{ role: 'user'|'assistant', content: string }} HistoryEntry
 */

import { API_LIMITS } from '../config.js';

/**
 * Собрать историю из сообщений чата: только завершённые пары «вопрос → ответ»
 * (ответ со статусом `done`, ни одно из сообщений не локальное), последние `maxMessages` записей.
 * История всегда начинается с вопроса пользователя и чередует роли.
 *
 * @param {ChatMessage[]} messages
 * @param {number} [maxMessages]
 * @return {HistoryEntry[]}
 */
export function buildHistory(messages, maxMessages = API_LIMITS.historyMessages) {
    const list = Array.isArray(messages) ? messages : [];
    const limit = API_LIMITS.historyMessageChars;
    const pairs = [];
    for (let i = 0; i < list.length - 1; i += 1) {
        const user = list[i];
        const assistant = list[i + 1];
        if (
            user &&
            assistant &&
            user.role === 'user' &&
            assistant.role === 'assistant' &&
            assistant.status === 'done' &&
            !user.isLocal &&
            !assistant.isLocal &&
            String(user.text || '').trim() &&
            String(assistant.text || '').trim()
        ) {
            pairs.push(
                { role: 'user', content: String(user.text).slice(0, limit) },
                { role: 'assistant', content: String(assistant.text).slice(0, limit) }
            );
            i += 1;
        }
    }
    const max = Math.max(0, Math.floor(Number(maxMessages) || 0));
    const count = max - (max % 2);
    return count > 0 ? pairs.slice(-count) : [];
}
