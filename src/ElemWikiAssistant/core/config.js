/**
 * Константы ядра помощника: разбор проекта вики, лимиты поиска, лимиты запросов.
 * Значения лимитов взяты из архитектуры wiki-assistant (§2, §3 документа).
 */

/** Разбор страниц проекта вики */
export const PARSE_DEFAULTS = Object.freeze({
    /** Классы ElemText → роль блока */
    titleClasses: ['textPageName'],
    leadClasses: ['textDesc'],
    headerClasses: ['textHeader'],
    /** Служебные подписи: «ПРИМЕР ВИДЖЕТА», подписи к картинкам, «Смотреть видео …», демо-данные */
    skipClasses: ['captionExample', 'captionImg', 'text-small', 'text-xsmall', 'text-h3'],
    /**
     * Поддеревья виджетов, которые не являются текстом вики (демо-таблицы, графики, KPI, фильтры).
     * Тип сравнивается без префикса пакета (`insight::`, `basic::`).
     * Любой тип с `/` в имени (`@IDP/Table/ElemValue`, `Table/ElemRow`) — пакетный демо-виджет.
     */
    skipTypePattern: /\/|^Elem(Image|Button|Dropdown|Calendar|Svg|SmartGallery|SystemGrid)$/,
    /** Типы, из которых берём текст */
    textTypes: ['ElemText'],
    /** Длинный раздел режется по подзаголовкам, но не короче этого размера */
    maxSectionChars: 3500,
    /** Раздел короче этого (после очистки) не нужен как отдельный */
    minSectionChars: 20
});

/** Поиск разделов (pickSections) */
export const SEARCH_LIMITS = Object.freeze({
    maxSections: 6,
    maxSectionChars: 3500,
    maxTotalChars: 10000,
    /** страниц по словам, помимо текущей и выбранных роутингом */
    maxWordPages: 3,
    /** разделов на одну страницу */
    sectionsPerPage: 2,
    /** порог: доля от лучшего счёта */
    relativeThreshold: 1 / 3,
    /** короткое уточнение ищется вместе с предыдущим вопросом */
    followUpMaxWords: 3,
    /** веса полей */
    weights: { title: 6, lead: 3, body: 1 },
    /** сколько знаков стема сравнивается */
    stemLength: 6,
    minStemLength: 3
});

/** Ограничения API (совпадают с серверными) */
export const API_LIMITS = Object.freeze({
    maxQuestionChars: 500,
    historyMessages: 6,
    historyMessageChars: 2000,
    routeTimeoutMs: 8000,
    askTimeoutMs: 90000,
    maxRoutePages: 200,
    maxRouteCatalogChars: 40000
});

/** Загрузка корпуса */
export const LOADER_DEFAULTS = Object.freeze({
    concurrency: 6,
    /** не проверять обновления чаще, чем раз в N мс */
    revalidateMs: 5 * 60 * 1000,
    idbName: 'wiki-assistant',
    idbStore: 'corpus',
    /** версия формата корпуса: при изменении парсера старый кеш игнорируется */
    formatVersion: 1
});
