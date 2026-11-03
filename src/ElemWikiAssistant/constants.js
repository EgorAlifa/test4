/**
 * Константы виджета ElemWikiAssistant (UI-слой).
 */

/** Максимальная длина вопроса (совпадает с серверным лимитом) */
export const MAX_QUESTION_CHARS = 500;

/** Автопрокрутка вниз — только если пользователь ближе этого расстояния к низу списка, px */
export const SCROLL_STICK_THRESHOLD = 80;

/** Ширина экрана, начиная с которой плавающая панель становится полноэкранной, px */
export const NARROW_SCREEN_WIDTH = 520;

/** Пауза перед пометкой корпуса устаревшим после мутаций Vuex в редакторе, мс */
export const STORE_STALE_DEBOUNCE_MS = 1500;

/** Пауза перед пересборкой менеджера корпуса после правки пропов источника, мс */
export const REBUILD_DEBOUNCE_MS = 600;

/** Поиск Vuex store редактора: число попыток и интервал между ними */
export const STORE_LOOKUP_ATTEMPTS = 10;
export const STORE_LOOKUP_INTERVAL_MS = 500;

/** Мутации редактора, после которых вики могла измениться */
export const STORE_MUTATION_PATTERN = /page|route|elem|widget|save/i;

/** Плашки источников под ответом показываются, если страниц больше этого числа */
export const SOURCES_CHIPS_MIN = 3;

/** Сколько плашек источников видно до «Ещё N» */
export const SOURCES_VISIBLE = 3;

/** Максимальная высота поля ввода при авторазмере, px */
export const COMPOSER_MAX_HEIGHT = 140;

/** Состояния доступности помощника */
export const ASSISTANT_STATUS = Object.freeze({
    CHECKING: 'checking',
    ONLINE: 'online',
    SIGNED_OUT: 'signed-out',
    UNAVAILABLE: 'unavailable',
    DISABLED: 'disabled'
});

/** Фазы загрузки базы знаний */
export const CORPUS_PHASE = Object.freeze({
    IDLE: 'idle',
    LOADING: 'loading',
    READY: 'ready',
    ERROR: 'error'
});

/**
 * Элементы для панели «Я дизайнер»: ключ в customStyles → CSS-селектор внутри корня виджета.
 * Селекторы указываются относительно корня `.aiw` (корень — ключ `root`).
 */
export const CSS_ELEMENTS = Object.freeze([
    { key: 'root', label: 'Корневой контейнер', selector: '.aiw' },
    { key: 'fab', label: 'Плавающая кнопка', selector: '.aiw-fab' },
    { key: 'panel', label: 'Панель чата', selector: '.aiw-panel' },
    { key: 'header', label: 'Шапка', selector: '.aiw-header' },
    { key: 'messages', label: 'Список сообщений', selector: '.aiw-messages' },
    { key: 'userBubble', label: 'Сообщение пользователя', selector: '.aiw-msg--user .aiw-msg__bubble' },
    { key: 'assistantBubble', label: 'Ответ помощника', selector: '.aiw-msg--assistant .aiw-msg__bubble' },
    { key: 'citation', label: 'Ссылка на страницу', selector: '.aiw-cite' },
    { key: 'suggestion', label: 'Подсказка-вопрос', selector: '.aiw-suggestion' },
    { key: 'composer', label: 'Блок ввода', selector: '.aiw-composer' },
    { key: 'input', label: 'Поле ввода', selector: '.aiw-input' },
    { key: 'sendButton', label: 'Кнопка отправки', selector: '.aiw-send' }
]);
