/**
 * Список моделей провайдера для выпадающего списка в настройках виджета.
 *
 * OpenAI-совместимый `GET {baseUrl}/models` → `{ data: [{ id }] }` (OpenAI, OpenRouter, vLLM,
 * Ollama `/v1`, LM Studio, YandexGPT-совместимые шлюзы). Дополнительно понимает
 * `{ models: [{ name }] }` (Ollama `/api/tags`, часть шлюзов) и голый массив.
 */

import { providerHeaders } from './local-backend.js';

const TIMEOUT_MS = 10000;

/**
 * @param {unknown} data
 * @return {{ id: string, label: string }[]}
 */
export function parseModelList(data) {
    let list = [];
    if (Array.isArray(data)) {
        list = data;
    } else if (data && Array.isArray(data.data)) {
        list = data.data;
    } else if (data && Array.isArray(data.models)) {
        list = data.models;
    }
    const seen = new Set();
    return list
        .map((m) => {
            if (typeof m === 'string') {
                return { id: m, label: m };
            }
            const id = m && (m.id || m.name || m.model);
            if (!id || typeof id !== 'string') {
                return null;
            }
            const name = typeof m.name === 'string' && m.name !== id ? m.name : '';
            return { id, label: name ? `${name} (${id})` : id };
        })
        .filter((m) => m && !seen.has(m.id) && seen.add(m.id))
        .sort((a, b) => a.id.localeCompare(b.id));
}

/**
 * @param {{
 *   baseUrl: string, apiKey?: string, authHeader?: string, authPrefix?: string,
 *   fetchImpl?: typeof fetch, signal?: AbortSignal
 * }} options
 * @return {Promise<{ models: { id: string, label: string }[], error: string }>}
 *   error — понятный текст для панели, пустая строка при успехе
 */
export async function listProviderModels({ baseUrl, apiKey = '', authHeader, authPrefix, fetchImpl, signal }) {
    const base = String(baseUrl || '').trim().replace(/\/+$/, '');
    if (!base) {
        return { models: [], error: 'Укажите адрес API модели' };
    }
    const doFetch = fetchImpl || ((...args) => fetch(...args));
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const onAbort = () => controller.abort();
    if (signal) {
        signal.addEventListener('abort', onAbort, { once: true });
    }
    try {
        const headers = providerHeaders({ apiKey: String(apiKey).trim(), authHeader, authPrefix });
        delete headers['Content-Type'];
        const response = await doFetch(`${base}/models`, {
            method: 'GET',
            headers,
            signal: controller.signal,
            redirect: 'error',
            credentials: 'omit'
        });
        if (response.status === 401 || response.status === 403) {
            return { models: [], error: 'Ключ отклонён провайдером' };
        }
        if (response.status === 404) {
            return { models: [], error: 'По этому адресу нет списка моделей — введите модель вручную' };
        }
        if (!response.ok) {
            return { models: [], error: `Провайдер ответил ошибкой ${response.status}` };
        }
        const models = parseModelList(await response.json().catch(() => null));
        return { models, error: models.length ? '' : 'Провайдер вернул пустой список моделей' };
    } catch (error) {
        if (signal && signal.aborted) {
            throw error;
        }
        if (controller.signal.aborted) {
            return { models: [], error: 'Провайдер не ответил за 10 секунд' };
        }
        return { models: [], error: 'Адрес недоступен или провайдер не разрешает запросы из браузера (CORS)' };
    } finally {
        clearTimeout(timer);
        if (signal) {
            signal.removeEventListener('abort', onAbort);
        }
    }
}
