/* eslint-disable no-restricted-syntax */
import panels from './panels';

/**
 * @return {ElemDescriptor}
 */
export const descriptor = () => ({
    props: {
        // ─── Поведение ─────────────────────────────────────────────
        title: {
            type: String,
            default: 'AI-помощник',
            label: 'Заголовок'
        },
        displayMode: {
            type: String,
            default: 'floating',
            label: 'Режим отображения',
            options: [
                { label: 'Плавающая кнопка', value: 'floating' },
                { label: 'Встроенный чат', value: 'inline' }
            ],
            hint: 'Плавающая кнопка открывает чат поверх страницы; встроенный чат занимает область виджета'
        },
        position: {
            type: String,
            default: 'bottom-right',
            label: 'Положение кнопки',
            options: [
                { label: 'Справа внизу', value: 'bottom-right' },
                { label: 'Слева внизу', value: 'bottom-left' }
            ]
        },
        greeting: {
            type: String,
            default:
                'Здравствуйте! Я отвечаю на вопросы по вики Insight: как собрать страницу, ' +
                'настроить виджет или подключить данные. Спросите что-нибудь.',
            label: 'Приветствие',
            hint: 'Показывается в пустом чате'
        },
        placeholder: {
            type: String,
            default: 'Задайте вопрос по вики…',
            label: 'Подсказка в поле ввода'
        },
        suggestions: {
            type: Array,
            default: () => [
                'Как добавить виджет на страницу?',
                'Как настроить фильтр для таблицы?',
                'Как опубликовать проект в плеере?'
            ],
            label: 'Готовые вопросы',
            hint: 'Кнопки с вопросами в пустом чате'
        },

        // ─── Источник ответов ──────────────────────────────────────
        backendMode: {
            type: String,
            default: 'mock',
            label: 'Источник ответов',
            options: [
                { label: 'Без модели (поиск по вики)', value: 'mock' },
                { label: 'Модель из браузера', value: 'local' },
                { label: 'Сервер (apiBase)', value: 'server' }
            ],
            hint: 'Мок — ответы-заглушки; модель из браузера — запросы к LLM напрямую; сервер — запросы к API помощника'
        },
        apiBase: {
            type: String,
            default: '',
            label: 'Адрес сервера помощника',
            hint:
                'Режим «Сервер». Можно указать только адрес сервера (https://host:port) — путь ' +
                '/api/assistant-widget/v1/ добавится сам. Вход — по токену Keycloak платформы.'
        },

        // ─── Модель (режим «Модель из браузера») ───────────────────
        llmBaseUrl: {
            type: String,
            default: 'https://api.openai.com/v1',
            label: 'Адрес API модели',
            hint: 'OpenAI-совместимый адрес; можно указать прокси на том же домене, который сам добавляет ключ'
        },
        llmApiKey: {
            type: String,
            default: '',
            label: 'Ключ API модели',
            hint:
                'Ключ сохраняется в настройках проекта и виден любому зрителю. ' +
                'Оставьте пустым, если прокси добавляет ключ сам'
        },
        llmModel: {
            type: String,
            default: '',
            label: 'Модель'
        },
        llmAuthHeader: {
            type: String,
            default: 'Authorization',
            label: 'Заголовок авторизации'
        },
        llmAuthPrefix: {
            type: String,
            default: 'Bearer ',
            label: 'Префикс ключа'
        },
        llmTemperature: {
            type: Number,
            default: 0.2,
            label: 'Температура'
        },
        llmMaxTokens: {
            type: Number,
            default: 1200,
            label: 'Максимум токенов ответа'
        },
        llmSupportsStream: {
            type: Boolean,
            default: true,
            label: 'Потоковый ответ (stream)'
        },

        // ─── База знаний ───────────────────────────────────────────
        projectBaseUrl: {
            type: String,
            default: '',
            label: 'Адрес проекта вики',
            hint: 'Папка с app.json и pages/. Пусто — определяется автоматически'
        },
        excludedSlugs: {
            type: Array,
            default: () => [],
            label: 'Исключённые страницы',
            hint: 'Ссылки страниц, которые не попадают в базу знаний'
        },
        revalidateMinutes: {
            type: Number,
            default: 5,
            label: 'Проверять обновления вики, мин'
        },

        // ─── Оформление ────────────────────────────────────────────
        accentColor: {
            type: String,
            default: '#4f46e5',
            label: 'Акцентный цвет'
        },
        backgroundColor: {
            type: String,
            default: '#ffffff',
            label: 'Фон панели'
        },
        textColor: {
            type: String,
            default: '#1f2937',
            label: 'Цвет текста'
        },
        panelWidth: {
            type: Number,
            default: 380,
            label: 'Ширина панели, px'
        },
        panelHeight: {
            type: Number,
            default: 560,
            label: 'Высота панели, px'
        },
        fontSize: {
            type: Number,
            default: 14,
            label: 'Размер шрифта, px'
        },
        borderRadius: {
            type: Number,
            default: 16,
            label: 'Скругление, px'
        },
        offset: {
            type: Number,
            default: 24,
            label: 'Отступ от края экрана, px'
        },
        zIndex: {
            type: Number,
            default: 1000,
            label: 'Слой (z-index)'
        },

        // ─── Кнопка (панель «Кнопка», пресеты — в fab.js) ───────────
        fabSize: {
            type: Number,
            default: 56,
            label: 'Размер кнопки, px'
        },
        fabShape: {
            type: String,
            default: 'circle',
            label: 'Форма кнопки',
            options: [
                { label: 'Круг', value: 'circle' },
                { label: 'Скруглённый квадрат', value: 'squircle' },
                { label: 'Квадрат', value: 'square' }
            ]
        },
        fabIcon: {
            type: String,
            default: 'chat',
            label: 'Иконка кнопки'
        },
        fabLabel: {
            type: String,
            default: '',
            label: 'Текст на кнопке',
            hint: 'Пусто — только иконка; с текстом кнопка становится «пилюлей»'
        },
        fabBg: {
            type: String,
            default: '',
            label: 'Фон кнопки',
            hint: 'Пусто — акцентный цвет'
        },
        fabIconColor: {
            type: String,
            default: '#ffffff',
            label: 'Цвет иконки и текста',
            hint: 'Пусто — акцентный цвет'
        },
        fabShadow: {
            type: String,
            default: 'm',
            label: 'Тень кнопки'
        },
        fabBorderWidth: {
            type: Number,
            default: 0,
            label: 'Толщина рамки кнопки, px'
        },
        fabBorderColor: {
            type: String,
            default: '#ffffff',
            label: 'Цвет рамки кнопки'
        },
        fabPulse: {
            type: Boolean,
            default: true,
            label: 'Пульсация до первого открытия'
        },

        // ─── Я дизайнер ────────────────────────────────────────────
        customStyles: {
            type: Object,
            default: () => ({}),
            label: 'Пользовательские CSS стили',
            hint: 'Кастомные стили для элементов (настраивается в панели "Я дизайнер")'
        }
    }
});

export const meta = {
    descriptor,
    panels
};

export default descriptor;
