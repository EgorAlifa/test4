<template>
    <w-elem>
        <div :id="rootId" class="aiw" :class="rootClasses" :style="cssVars">
            <!-- Плавающая кнопка -->
            <button
                v-if="isFloating"
                v-show="!isOpen"
                type="button"
                class="aiw-fab"
                :title="props.title"
                :aria-label="props.title"
                @click="open">
                <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
                    <path
                        fill="currentColor"
                        d="M12 3C6.5 3 2 6.6 2 11c0 2.4 1.3 4.5 3.4 6L4.6 21l4.2-2.3c1 .2 2.1.3 3.2.3 5.5 0 10-3.6 10-8s-4.5-8-10-8Zm-4 9.3a1.3 1.3 0 1 1 0-2.6 1.3 1.3 0 0 1 0 2.6Zm4 0a1.3 1.3 0 1 1 0-2.6 1.3 1.3 0 0 1 0 2.6Zm4 0a1.3 1.3 0 1 1 0-2.6 1.3 1.3 0 0 1 0 2.6Z"
                    />
                </svg>
            </button>

            <transition name="aiw-pop">
                <section
                    v-show="!isFloating || isOpen"
                    ref="panel"
                    class="aiw-panel"
                    :role="isFloating ? 'dialog' : 'region'"
                    :aria-label="props.title"
                    @keydown.esc="onEscape">
                    <!-- Шапка -->
                    <header class="aiw-header">
                        <span class="aiw-header__dot" :class="`aiw-header__dot--${assistantStatus}`"></span>
                        <span class="aiw-header__title">{{ props.title }}</span>
                        <button
                            type="button"
                            class="aiw-icon-btn"
                            title="Новый диалог"
                            aria-label="Новый диалог"
                            :disabled="!messages.length && !isBusy"
                            @click="newDialog">
                            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                                <path fill="currentColor" d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5Z" />
                            </svg>
                        </button>
                        <button
                            v-if="isFloating"
                            type="button"
                            class="aiw-icon-btn"
                            title="Закрыть"
                            aria-label="Закрыть"
                            @click="close">
                            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                                <path
                                    fill="currentColor"
                                    d="m6.4 5 5.6 5.6L17.6 5 19 6.4 13.4 12l5.6 5.6-1.4 1.4-5.6-5.6L6.4 19 5 17.6l5.6-5.6L5 6.4 6.4 5Z"
                                />
                            </svg>
                        </button>
                    </header>

                    <!-- Состояние базы знаний -->
                    <div v-if="corpusLine" class="aiw-corpus" :class="`aiw-corpus--${corpusState.phase}`">
                        <span class="aiw-corpus__text">{{ corpusLine }}</span>
                        <button
                            v-if="corpusState.phase === 'error'"
                            type="button"
                            class="aiw-link-btn"
                            @click="retryCorpus">
                            Повторить
                        </button>
                    </div>

                    <!-- Доступность помощника -->
                    <div v-if="assistantStatus === 'unavailable'" class="aiw-banner aiw-banner--warn" role="status">
                        <span>Помощник сейчас недоступен.</span>
                        <button type="button" class="aiw-link-btn" @click="checkStatus">Проверить снова</button>
                    </div>
                    <div v-else-if="assistantStatus === 'signed-out'" class="aiw-banner" role="status">
                        Нужно войти, чтобы пользоваться помощником
                    </div>
                    <div v-else-if="assistantStatus === 'disabled'" class="aiw-banner" role="status">
                        Помощник отключён: не указан адрес API
                    </div>

                    <!-- Сообщения -->
                    <div ref="list" class="aiw-messages" aria-live="polite" @click="onListClick">
                        <div v-if="!messages.length" class="aiw-empty">
                            <p class="aiw-empty__greeting">{{ props.greeting }}</p>
                            <div v-if="suggestionList.length" class="aiw-suggestions">
                                <button
                                    v-for="(suggestion, idx) in suggestionList"
                                    :key="idx"
                                    type="button"
                                    class="aiw-suggestion"
                                    :disabled="!isOnline"
                                    @click="send(suggestion)">
                                    {{ suggestion }}
                                </button>
                            </div>
                        </div>
                        <assistant-message
                            v-for="msg in messages"
                            :key="msg.id"
                            :message="msg"
                            :pages-by-id="pagesById"
                        />
                    </div>

                    <!-- Поле ввода -->
                    <form class="aiw-composer" @submit.prevent="send()">
                        <textarea
                            ref="input"
                            v-model="draft"
                            class="aiw-input"
                            rows="1"
                            :maxlength="maxQuestionChars"
                            :placeholder="props.placeholder"
                            :disabled="!isOnline"
                            aria-label="Вопрос"
                            @keydown.enter="onEnter"
                            @input="autosize"
                        ></textarea>
                        <button
                            v-if="isBusy"
                            type="button"
                            class="aiw-send aiw-send--stop"
                            title="Остановить"
                            aria-label="Остановить"
                            @click="stop">
                            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                                <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" />
                            </svg>
                        </button>
                        <button
                            v-else
                            type="submit"
                            class="aiw-send"
                            title="Отправить"
                            aria-label="Отправить"
                            :disabled="!canSend">
                            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                                <path fill="currentColor" d="M3.4 20.4 21 12 3.4 3.6 3.4 10l12.6 2-12.6 2v6.4Z" />
                            </svg>
                        </button>
                    </form>
                </section>
            </transition>

            <component :is="'style'" v-if="customCssContent" v-html="customCssContent" />
        </div>
    </w-elem>
</template>

<script>
import { Elem } from '@goodt-wcore/elem';
import { meta } from './descriptor';
import { ElemInstanceTypeDescriptor } from './types';
import AssistantMessage from './components/AssistantMessage.vue';
import {
    ASSISTANT_STATUS,
    COMPOSER_MAX_HEIGHT,
    CORPUS_PHASE,
    CSS_ELEMENTS,
    MAX_QUESTION_CHARS,
    NARROW_SCREEN_WIDTH,
    SCROLL_STICK_THRESHOLD,
    STORE_LOOKUP_ATTEMPTS,
    STORE_LOOKUP_INTERVAL_MS,
    STORE_MUTATION_PATTERN,
    STORE_STALE_DEBOUNCE_MS,
    REBUILD_DEBOUNCE_MS,
    BACKEND_MODE,
    INTERNAL_API_BASE
} from './constants';
import { resolveProjectBaseUrl, createHttpProjectSource } from './core/corpus/project-source.js';
import { getCorpusManager } from './core/corpus/corpus-manager.js';
import { getSearchIndex, pickSections, buildRouteCatalog } from './core/search/search-index.js';
import { createAssistantApi } from './core/api/assistant-api.js';
import { createMockFetch } from './core/api/mock-backend.js';
import { createLocalBackendFetch } from './core/backend/local-backend.js';
import { citedPageIds } from './core/chat/render.js';
import { buildHistory } from './core/chat/history.js';
import { matchSmallTalk } from './core/chat/small-talk.js';
import { errorText } from './core/chat/errors.js';

/** Минут → мс */
const MINUTE_MS = 60 * 1000;

/**
 * Число из пропа (в панели number-поле может записать строку)
 * @param {*} value
 * @param {number} fallback
 * @return {number}
 */
const toNumber = (value, fallback) => {
    const num = Number(value);
    return value === '' || value == null || !Number.isFinite(num) ? fallback : num;
};

/**
 * Ссылка страницы без ведущих «#» и «/» и без завершающего «/»
 * @param {string} slug
 * @return {string}
 */
const normalizeSlug = (slug) =>
    String(slug || '')
        .replace(/^[#/]+/, '')
        .replace(/[?#].*$/, '')
        .replace(/\/+$/, '');

/**
 * @param {*} error
 * @return {boolean}
 */
const isAbortError = (error) => !!error && error.name === 'AbortError';

let messageSeq = 0;

export default {
    extends: Elem,

    components: { AssistantMessage },

    meta,

    /* статические данные для <template></template> */
    static: {},

    data: () => ({
        ...ElemInstanceTypeDescriptor,
        assistantStatus: ASSISTANT_STATUS.CHECKING,
        isOpen: false,
        messages: [],
        draft: '',
        isBusy: false,
        corpusState: {
            phase: CORPUS_PHASE.IDLE,
            loaded: 0,
            total: 0,
            pages: 0,
            sections: 0,
            error: null
        },
        // Счётчик версий корпуса: сам корпус не реактивен, перерисовка идёт по этому числу
        corpusRevision: 0
    }),

    computed: {
        rootId() {
            return `aiw-${this._uid}`;
        },

        maxQuestionChars() {
            return MAX_QUESTION_CHARS;
        },

        isFloating() {
            return this.props.displayMode !== 'inline';
        },

        isOnline() {
            return this.assistantStatus === ASSISTANT_STATUS.ONLINE;
        },

        canSend() {
            return this.isOnline && !this.isBusy && this.draft.trim().length > 0;
        },

        rootClasses() {
            return {
                'aiw--floating': this.isFloating,
                'aiw--inline': !this.isFloating,
                'aiw--open': this.isOpen,
                'aiw--left': this.isFloating && this.props.position === 'bottom-left'
            };
        },

        cssVars() {
            const p = this.props;
            return {
                '--aiw-accent': p.accentColor || '#4f46e5',
                '--aiw-bg': p.backgroundColor || '#ffffff',
                '--aiw-text': p.textColor || '#1f2937',
                '--aiw-width': `${toNumber(p.panelWidth, 380)}px`,
                '--aiw-height': `${toNumber(p.panelHeight, 560)}px`,
                '--aiw-font-size': `${toNumber(p.fontSize, 14)}px`,
                '--aiw-radius': `${toNumber(p.borderRadius, 16)}px`,
                '--aiw-offset': `${toNumber(p.offset, 24)}px`,
                '--aiw-z': String(toNumber(p.zIndex, 1000))
            };
        },

        suggestionList() {
            const list = Array.isArray(this.props.suggestions) ? this.props.suggestions : [];
            return list.map((s) => String(s || '').trim()).filter(Boolean);
        },

        /** Map<id, page> текущего корпуса (не реактивный объект, пересчёт по corpusRevision) */
        pagesById() {
            // eslint-disable-next-line no-unused-expressions
            this.corpusRevision;
            const index = this.getIndex();
            return index ? index.pagesById : null;
        },

        corpusLine() {
            const s = this.corpusState;
            if (s.phase === CORPUS_PHASE.LOADING) {
                return s.total ? `Читаю вики: ${s.loaded}/${s.total}` : 'Читаю вики…';
            }
            if (s.phase === CORPUS_PHASE.READY) {
                const isMock = this.props.backendMode !== BACKEND_MODE.LOCAL && this.props.backendMode !== BACKEND_MODE.SERVER;
                return `База знаний: ${s.pages} страниц${isMock ? ' · мок: ответы без модели' : ''}`;
            }
            if (s.phase === CORPUS_PHASE.ERROR) {
                return s.error || 'Не удалось прочитать вики';
            }
            return '';
        },

        customCssContent() {
            const styles = this.props.customStyles;
            if (!styles || typeof styles !== 'object') {
                return null;
            }
            const scope = `#${this.rootId}`;
            const css = CSS_ELEMENTS.filter(({ key }) => styles[key])
                .map(({ key, selector }) => {
                    const target = key === 'root' ? scope : `${scope} ${selector}`;
                    return `${target} { ${styles[key]} }`;
                })
                .join('\n');
            return css || null;
        }
    },

    watch: {
        'props.backendMode'() {
            this.rebuildApi();
        },
        'props.apiBase'() {
            this.scheduleRebuildApi();
        },
        'props.llmBaseUrl'() {
            this.scheduleRebuildApi();
        },
        'props.llmApiKey'() {
            this.scheduleRebuildApi();
        },
        'props.llmModel'() {
            this.scheduleRebuildApi();
        },
        'props.llmAuthHeader'() {
            this.scheduleRebuildApi();
        },
        'props.llmAuthPrefix'() {
            this.scheduleRebuildApi();
        },
        'props.llmTemperature'() {
            this.scheduleRebuildApi();
        },
        'props.llmMaxTokens'() {
            this.scheduleRebuildApi();
        },
        'props.llmSupportsStream'() {
            this.rebuildApi();
        },
        'props.projectBaseUrl'() {
            this.scheduleRebuildManager();
        },
        'props.excludedSlugs'() {
            this.scheduleRebuildManager();
        },
        'props.revalidateMinutes'() {
            this.scheduleRebuildManager();
        },
        'props.displayMode'(mode) {
            if (mode === 'inline') {
                this.isOpen = false;
                this.ensureCorpusRequested();
            }
        }
    },

    created() {
        // Не реактивное состояние: API, менеджер корпуса, корпус (~1 МБ), контроллеры, таймеры
        this._aiw = {
            api: null,
            statusInfo: null,
            statusController: null,
            manager: null,
            unsubscribeManager: null,
            corpus: null,
            corpusRequested: false,
            controller: null,
            deltaBuffer: '',
            deltaMessage: null,
            flushHandle: null,
            storeUnsubscribe: null,
            storeTimer: null,
            storeLookupTimer: null,
            rebuildTimer: null,
            apiRebuildTimer: null
        };
    },

    mounted() {
        this.rebuildManager();
        this.rebuildApi();
        if (!this.isFloating) {
            this.ensureCorpusRequested();
        }
        if (this.isEditorContext()) {
            this.setupStoreObserver();
        }
    },

    beforeDestroy() {
        const nr = this._aiw;
        this.abortCurrent();
        if (nr.statusController) {
            nr.statusController.abort();
        }
        if (nr.unsubscribeManager) {
            nr.unsubscribeManager();
        }
        if (nr.storeUnsubscribe) {
            nr.storeUnsubscribe();
        }
        clearTimeout(nr.storeTimer);
        clearTimeout(nr.rebuildTimer);
        clearTimeout(nr.apiRebuildTimer);
        clearInterval(nr.storeLookupTimer);
        nr.corpus = null;
        nr.manager = null;
    },

    methods: {
        // ─── API и статус ─────────────────────────────────────────

        /** Адрес API и пропы модели меняются при наборе в панели — пересобираем API с паузой */
        scheduleRebuildApi() {
            const nr = this._aiw;
            clearTimeout(nr.apiRebuildTimer);
            nr.apiRebuildTimer = setTimeout(() => {
                nr.apiRebuildTimer = null;
                this.rebuildApi();
            }, REBUILD_DEBOUNCE_MS);
        },

        /**
         * fetch для текущего режима: mock/local — в браузере, server — настоящий fetch (undefined)
         * @param {string} mode
         * @return {Function|undefined}
         */
        createBackendFetch(mode) {
            const p = this.props;
            if (mode === BACKEND_MODE.MOCK) {
                return createMockFetch();
            }
            if (mode === BACKEND_MODE.LOCAL) {
                return createLocalBackendFetch({
                    baseUrl: String(p.llmBaseUrl || '').trim(),
                    apiKey: String(p.llmApiKey || '').trim(),
                    model: String(p.llmModel || '').trim(),
                    authHeader: String(p.llmAuthHeader || '').trim(),
                    authPrefix: String(p.llmAuthPrefix ?? ''),
                    temperature: toNumber(p.llmTemperature, 0.2),
                    maxTokens: toNumber(p.llmMaxTokens, 1200),
                    stream: p.llmSupportsStream !== false
                });
            }
            return undefined;
        },

        rebuildApi() {
            const nr = this._aiw;
            clearTimeout(nr.apiRebuildTimer);
            nr.apiRebuildTimer = null;
            this.abortCurrent();
            const mode = Object.values(BACKEND_MODE).includes(this.props.backendMode)
                ? this.props.backendMode
                : BACKEND_MODE.MOCK;
            const apiBase = String(this.props.apiBase || '').trim();
            if (mode === BACKEND_MODE.SERVER && !apiBase) {
                nr.api = null;
                this.assistantStatus = ASSISTANT_STATUS.DISABLED;
                return;
            }
            nr.api = createAssistantApi({
                apiBase: mode === BACKEND_MODE.SERVER ? apiBase : apiBase || INTERNAL_API_BASE,
                fetchImpl: this.createBackendFetch(mode),
                locale: 'ru'
            });
            this.checkStatus();
        },

        async checkStatus() {
            const nr = this._aiw;
            const { api } = nr;
            if (!api) {
                this.assistantStatus = ASSISTANT_STATUS.DISABLED;
                return;
            }
            if (nr.statusController) {
                nr.statusController.abort();
            }
            const controller = new AbortController();
            nr.statusController = controller;
            this.assistantStatus = ASSISTANT_STATUS.CHECKING;
            try {
                const info = await api.status({ signal: controller.signal });
                if (controller.signal.aborted || api !== nr.api) {
                    return;
                }
                nr.statusInfo = info;
                if (info.isAvailable) {
                    this.assistantStatus = ASSISTANT_STATUS.ONLINE;
                } else if (info.reason === 'signed-out') {
                    this.assistantStatus = ASSISTANT_STATUS.SIGNED_OUT;
                } else if (info.reason === 'disabled') {
                    this.assistantStatus = ASSISTANT_STATUS.DISABLED;
                } else {
                    this.assistantStatus = ASSISTANT_STATUS.UNAVAILABLE;
                }
            } catch (error) {
                if (!isAbortError(error) && api === nr.api) {
                    this.assistantStatus = ASSISTANT_STATUS.UNAVAILABLE;
                }
            } finally {
                if (nr.statusController === controller) {
                    nr.statusController = null;
                }
            }
        },

        // ─── Корпус вики ──────────────────────────────────────────

        /** Пропы источника меняются при наборе в панели — пересобираем менеджер с паузой */
        scheduleRebuildManager() {
            const nr = this._aiw;
            clearTimeout(nr.rebuildTimer);
            nr.rebuildTimer = setTimeout(() => {
                nr.rebuildTimer = null;
                this.rebuildManager();
            }, REBUILD_DEBOUNCE_MS);
        },

        rebuildManager() {
            const nr = this._aiw;
            if (nr.unsubscribeManager) {
                nr.unsubscribeManager();
                nr.unsubscribeManager = null;
            }
            nr.manager = null;
            nr.corpus = null;
            this.corpusRevision += 1;

            const baseUrl = resolveProjectBaseUrl({ override: String(this.props.projectBaseUrl || '').trim() });
            if (!baseUrl) {
                this.setCorpusState({ phase: CORPUS_PHASE.ERROR, error: 'Не удалось определить адрес проекта вики' });
                return;
            }
            const excludedSlugs = (Array.isArray(this.props.excludedSlugs) ? this.props.excludedSlugs : [])
                .map((s) => String(s || '').trim())
                .filter(Boolean);
            const manager = getCorpusManager({
                source: createHttpProjectSource({ baseUrl }),
                excludedSlugs,
                revalidateMs: Math.max(1, toNumber(this.props.revalidateMinutes, 5)) * MINUTE_MS
            });
            nr.manager = manager;
            nr.unsubscribeManager = manager.subscribe((corpus) => {
                if (nr.manager === manager && corpus) {
                    this.applyCorpus(corpus);
                }
            });

            const current = manager.peek();
            if (current) {
                this.applyCorpus(current);
            } else {
                this.setCorpusState({ phase: CORPUS_PHASE.IDLE, loaded: 0, total: 0, pages: 0, sections: 0 });
            }
            if (nr.corpusRequested) {
                this.loadCorpus().catch(() => {});
            }
        },

        /** Первое открытие (или встроенный режим) — начать чтение вики */
        ensureCorpusRequested() {
            if (this._aiw.corpusRequested) {
                return;
            }
            this._aiw.corpusRequested = true;
            this.loadCorpus().catch(() => {});
        },

        /**
         * @param {{ force?: boolean }} [options]
         * @return {Promise<object>} корпус
         */
        loadCorpus({ force = false } = {}) {
            const { manager } = this._aiw;
            if (!manager) {
                return Promise.reject(new Error('Не удалось определить адрес проекта вики'));
            }
            if (!manager.peek()) {
                this.setCorpusState({ phase: CORPUS_PHASE.LOADING, loaded: 0, total: 0, error: null });
            }
            const onProgress = ({ loaded, total }) => {
                if (manager === this._aiw.manager && this.corpusState.phase === CORPUS_PHASE.LOADING) {
                    this.corpusState.loaded = loaded;
                    this.corpusState.total = total;
                }
            };
            return manager.get({ force, onProgress }).then(
                (corpus) => {
                    if (manager === this._aiw.manager) {
                        this.applyCorpus(corpus);
                    }
                    return corpus;
                },
                (error) => {
                    if (manager === this._aiw.manager && !manager.peek()) {
                        this.setCorpusState({ phase: CORPUS_PHASE.ERROR, error: 'Не удалось прочитать вики' });
                    }
                    throw error;
                }
            );
        },

        retryCorpus() {
            this._aiw.corpusRequested = true;
            this.loadCorpus({ force: true }).catch(() => {});
        },

        /** @param {object} corpus */
        applyCorpus(corpus) {
            if (!corpus || corpus === this._aiw.corpus) {
                return;
            }
            this._aiw.corpus = corpus;
            const stats = corpus.stats || {};
            const pages = Array.isArray(corpus.pages) ? corpus.pages : [];
            this.setCorpusState({
                phase: CORPUS_PHASE.READY,
                error: null,
                pages: toNumber(stats.pages, pages.length),
                sections: toNumber(
                    stats.sections,
                    pages.reduce((sum, page) => sum + (page.sections ? page.sections.length : 0), 0)
                )
            });
            this.corpusRevision += 1;
        },

        /** @param {object} patch */
        setCorpusState(patch) {
            Object.assign(this.corpusState, patch);
        },

        /** Индекс поиска текущего корпуса (кешируется в search-index по объекту корпуса) */
        getIndex() {
            const { corpus } = this._aiw || {};
            return corpus ? getSearchIndex(corpus) : null;
        },

        // ─── Наблюдение за редактором ─────────────────────────────

        isEditorContext() {
            return Boolean(this.isEditorMode) || this.detectPlatformMode() === 'editor';
        },

        /** Поиск Vuex store редактора (как в ElemRoutesNavigator) */
        findStore() {
            if (this.$store) {
                return this.$store;
            }
            if (this.$root && this.$root.$store) {
                return this.$root.$store;
            }
            const fromWindow = (win) => {
                try {
                    if (win.$nuxt && win.$nuxt.$store) {
                        return win.$nuxt.$store;
                    }
                    if (win.__NUXT__ && win.__NUXT__.$store) {
                        return win.__NUXT__.$store;
                    }
                    if (win.__VUE__ && win.__VUE__.$store) {
                        return win.__VUE__.$store;
                    }
                    const doc = win.document;
                    const appEl =
                        doc.getElementById('app') || doc.querySelector('[data-app]') || doc.querySelector('#__nuxt');
                    return appEl && appEl.__vue__ ? appEl.__vue__.$store || null : null;
                } catch (e) {
                    // чужой origin у parent — пропускаем
                    return null;
                }
            };
            let store = fromWindow(window);
            if (!store && window.parent && window.parent !== window) {
                store = fromWindow(window.parent);
            }
            return store || null;
        },

        setupStoreObserver() {
            if (typeof window === 'undefined') {
                return;
            }
            const nr = this._aiw;
            const trySubscribe = () => {
                const store = this.findStore();
                if (!store || typeof store.subscribe !== 'function') {
                    return false;
                }
                nr.storeUnsubscribe = store.subscribe((mutation) => {
                    const type = mutation && mutation.type ? String(mutation.type) : '';
                    if (!STORE_MUTATION_PATTERN.test(type)) {
                        return;
                    }
                    clearTimeout(nr.storeTimer);
                    nr.storeTimer = setTimeout(() => {
                        if (nr.manager) {
                            nr.manager.markStale();
                        }
                    }, STORE_STALE_DEBOUNCE_MS);
                });
                return true;
            };
            if (trySubscribe()) {
                return;
            }
            // store может быть ещё не готов при mounted — повторяем несколько раз
            let attempts = 0;
            nr.storeLookupTimer = setInterval(() => {
                attempts += 1;
                if (trySubscribe() || attempts >= STORE_LOOKUP_ATTEMPTS) {
                    clearInterval(nr.storeLookupTimer);
                    nr.storeLookupTimer = null;
                }
            }, STORE_LOOKUP_INTERVAL_MS);
        },

        // ─── Открытие/закрытие ────────────────────────────────────

        open() {
            this.isOpen = true;
            this.ensureCorpusRequested();
            this.$nextTick(() => {
                this.scrollToBottom();
                if (this.$refs.input && !this.$refs.input.disabled) {
                    this.$refs.input.focus();
                }
            });
        },

        close() {
            this.isOpen = false;
        },

        onEscape() {
            if (this.isFloating && this.isOpen) {
                this.close();
            }
        },

        // ─── Отправка вопроса ─────────────────────────────────────

        /**
         * @param {Partial<{ role: string, text: string, status: string, isLocal: boolean }>} fields
         * @return {object} реактивное сообщение из массива
         */
        pushMessage(fields) {
            // Свой вопрос всегда прокручиваем в видимую область, ответы — только если пользователь у низа
            const stick = fields.role === 'user' || this.isNearBottom();
            messageSeq += 1;
            this.messages.push({
                id: `m${Date.now().toString(36)}${messageSeq}`,
                role: fields.role,
                text: fields.text || '',
                status: fields.status || 'done',
                isLocal: Boolean(fields.isLocal),
                pageIds: [],
                error: null
            });
            this.$nextTick(() => this.scrollToBottom(!stick));
            return this.messages[this.messages.length - 1];
        },

        /** @param {object} msg */
        removeMessage(msg) {
            const idx = this.messages.indexOf(msg);
            if (idx !== -1) {
                this.messages.splice(idx, 1);
            }
        },

        onEnter(event) {
            if (event.shiftKey || event.isComposing) {
                return;
            }
            event.preventDefault();
            this.send();
        },

        /** @param {string} [text] текст подсказки; без аргумента — черновик */
        async send(text) {
            const question = String(text != null ? text : this.draft)
                .trim()
                .slice(0, MAX_QUESTION_CHARS);
            const nr = this._aiw;
            if (!question || !this.isOnline || !nr.api) {
                return;
            }
            this.abortCurrent();

            const previousMessages = this.messages.slice();
            const previousUser = previousMessages.filter((m) => m.role === 'user').pop();
            if (text == null) {
                this.draft = '';
                this.$nextTick(this.autosize);
            }
            this.pushMessage({ role: 'user', text: question });

            // Приветствия и благодарности — без запроса к серверу
            const smallTalk = matchSmallTalk(question);
            if (smallTalk) {
                this.pushMessage({ role: 'assistant', text: smallTalk, status: 'done', isLocal: true });
                return;
            }

            const msg = this.pushMessage({ role: 'assistant', status: 'pending' });
            const controller = new AbortController();
            const { signal } = controller;
            const { api } = nr;
            nr.controller = controller;
            this.isBusy = true;

            try {
                const corpus = await this.loadCorpus();
                if (signal.aborted) {
                    throw this.makeAbortError();
                }
                const index = getSearchIndex(corpus);
                const statusInfo = nr.statusInfo || {};
                const routed = statusInfo.isFullGuide
                    ? []
                    : await api.route({ question, pages: buildRouteCatalog(corpus) }, { signal });
                const currentPageId = this.findCurrentPageId(index);
                const picked = pickSections(index, {
                    question,
                    previousQuestion: previousUser ? previousUser.text : '',
                    routedPageIds: routed,
                    currentPageId
                });
                const result = await api.ask(
                    {
                        question,
                        sections: picked.sections,
                        history: buildHistory(previousMessages),
                        stream: true,
                        pageId: currentPageId
                    },
                    { signal, onDelta: (delta) => this.queueDelta(msg, delta) }
                );
                this.cancelFlush();
                const answer = String((result && result.answer) || '');
                msg.text = answer;
                msg.pageIds = citedPageIds(answer, index.pagesById);
                msg.status = 'done';
                this.$nextTick(() => this.scrollToBottom());
            } catch (error) {
                this.cancelFlush();
                if (isAbortError(error) || signal.aborted) {
                    this.removeMessage(msg);
                } else {
                    msg.text = '';
                    msg.status = 'error';
                    msg.error = errorText(error);
                    const status = error && typeof error.status === 'number' ? error.status : -1;
                    if (status === 401) {
                        this.assistantStatus = ASSISTANT_STATUS.SIGNED_OUT;
                    } else if (status === 0 || status === 503) {
                        this.assistantStatus = ASSISTANT_STATUS.UNAVAILABLE;
                    }
                    // Вернуть вопрос в поле ввода, чтобы его можно было отправить снова
                    if (!this.draft.trim()) {
                        this.draft = question;
                        this.$nextTick(this.autosize);
                    }
                }
            } finally {
                if (nr.controller === controller) {
                    nr.controller = null;
                    this.isBusy = false;
                }
            }
        },

        stop() {
            this.abortCurrent();
        },

        newDialog() {
            this.abortCurrent();
            this.messages = [];
            this.draft = '';
            this.$nextTick(this.autosize);
        },

        abortCurrent() {
            const nr = this._aiw;
            if (nr && nr.controller) {
                const { controller } = nr;
                nr.controller = null;
                controller.abort();
                this.isBusy = false;
            }
            this.cancelFlush();
        },

        makeAbortError() {
            if (typeof DOMException === 'function') {
                return new DOMException('Aborted', 'AbortError');
            }
            const error = new Error('Aborted');
            error.name = 'AbortError';
            return error;
        },

        // ─── Стриминг: накопление дельт и сброс раз в кадр ────────

        /**
         * @param {object} msg
         * @param {string} delta
         */
        queueDelta(msg, delta) {
            const nr = this._aiw;
            if (nr.deltaMessage !== msg) {
                nr.deltaBuffer = '';
                nr.deltaMessage = msg;
            }
            nr.deltaBuffer += delta;
            if (nr.flushHandle != null) {
                return;
            }
            const raf = typeof requestAnimationFrame === 'function' ? requestAnimationFrame : (fn) => setTimeout(fn, 16);
            nr.flushHandle = raf(() => {
                nr.flushHandle = null;
                this.flushDeltas();
            });
        },

        flushDeltas() {
            const nr = this._aiw;
            const msg = nr.deltaMessage;
            if (!msg || !nr.deltaBuffer) {
                return;
            }
            const stick = this.isNearBottom();
            msg.text += nr.deltaBuffer;
            nr.deltaBuffer = '';
            if (stick) {
                this.$nextTick(() => this.scrollToBottom());
            }
        },

        cancelFlush() {
            const nr = this._aiw;
            if (!nr) {
                return;
            }
            if (nr.flushHandle != null) {
                if (typeof cancelAnimationFrame === 'function') {
                    cancelAnimationFrame(nr.flushHandle);
                }
                clearTimeout(nr.flushHandle);
                nr.flushHandle = null;
            }
            nr.deltaBuffer = '';
            nr.deltaMessage = null;
        },

        // ─── Прокрутка и поле ввода ───────────────────────────────

        isNearBottom() {
            const list = this.$refs.list;
            if (!list) {
                return true;
            }
            return list.scrollHeight - list.scrollTop - list.clientHeight <= SCROLL_STICK_THRESHOLD;
        },

        /** @param {boolean} [onlyIfNear] прокручивать, только если пользователь у низа списка */
        scrollToBottom(onlyIfNear = false) {
            const list = this.$refs.list;
            if (!list || (onlyIfNear && !this.isNearBottom())) {
                return;
            }
            list.scrollTop = list.scrollHeight;
        },

        autosize() {
            const el = this.$refs.input;
            if (!el) {
                return;
            }
            el.style.height = 'auto';
            el.style.height = `${Math.min(el.scrollHeight, COMPOSER_MAX_HEIGHT)}px`;
        },

        // ─── Навигация по ссылкам на страницы ─────────────────────

        /** Делегирование кликов по ссылкам `[data-page-id]` в ответах */
        onListClick(event) {
            const target = event.target && event.target.closest ? event.target.closest('[data-page-id]') : null;
            if (!target || !this.$refs.list.contains(target)) {
                return;
            }
            event.preventDefault();
            this.navigateToPage(target.getAttribute('data-page-id'));
        },

        /** @param {string} pageId */
        navigateToPage(pageId) {
            const index = this.getIndex();
            const page = index && pageId ? index.pagesById.get(pageId) : null;
            if (!page || !page.slug) {
                return;
            }
            const slug = page.slug;
            this.$emit('navigate', { slug, title: page.title, pageId });

            if (this.isFloating && typeof window !== 'undefined' && window.innerWidth <= NARROW_SCREEN_WIDTH) {
                this.close();
            }
            if (typeof window === 'undefined' || this.detectPlatformMode() === 'editor') {
                // В редакторе переключение страниц делает редактор по событию navigate
                return;
            }
            if (this.$router) {
                const path = `/${normalizeSlug(slug)}`;
                const result = this.$router.push(path);
                if (result && typeof result.catch === 'function') {
                    result.catch(() => {});
                }
            } else {
                window.location.href = this.buildNavigationUrl(slug);
            }
        },

        /**
         * Режим платформы по URL (как в ElemRoutesNavigator)
         * @return {'player'|'editor'|'unknown'}
         */
        detectPlatformMode() {
            if (typeof window === 'undefined') {
                return 'unknown';
            }
            const href = window.location.href;
            // /player/ проверяем первым — URL плеера тоже содержит /editor/
            if (href.includes('/player/')) {
                return 'player';
            }
            if (href.includes('/editor/')) {
                return 'editor';
            }
            return 'player';
        },

        /**
         * Полный URL перехода на страницу плеера (hash-роутинг)
         * @param {string} slug
         * @return {string}
         */
        buildNavigationUrl(slug) {
            if (/^https?:\/\//.test(slug)) {
                return slug;
            }
            const href = window.location.href;
            const hashIdx = href.indexOf('#');
            const base = hashIdx >= 0 ? href.substring(0, hashIdx) : href;
            return `${base}#/${normalizeSlug(slug)}`;
        },

        /**
         * id страницы вики, открытой сейчас в плеере
         * @param {object} index
         * @return {string|null}
         */
        findCurrentPageId(index) {
            if (!index || typeof window === 'undefined') {
                return null;
            }
            let current = '';
            if (this.$route && this.$route.path && this.$route.path !== '/') {
                current = this.$route.path;
            } else if (window.location.hash) {
                current = window.location.hash;
            }
            current = normalizeSlug(current);
            if (!current) {
                return null;
            }
            if (index.pagesBySlug) {
                const direct = index.pagesBySlug.get(current) || index.pagesBySlug.get(`/${current}`);
                if (direct) {
                    return direct.id;
                }
            }
            const found = Array.from(index.pagesById.entries()).find(
                ([, page]) => normalizeSlug(page && page.slug) === current
            );
            return found ? found[0] : null;
        }
    }
};
</script>

<style lang="pcss" src="./style.pcss"></style>
