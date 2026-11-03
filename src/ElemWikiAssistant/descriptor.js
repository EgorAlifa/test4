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
            default: 'Помощник по вики',
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
        apiBase: {
            type: String,
            default: '/api/wiki-assistant/',
            label: 'Адрес API помощника'
        },
        useMockBackend: {
            type: Boolean,
            default: true,
            label: 'Демо-режим (без сервера)',
            hint: 'Ответы формируются в браузере, запросы к API не отправляются'
        },
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
