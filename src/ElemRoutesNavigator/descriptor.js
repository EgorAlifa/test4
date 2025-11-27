/* eslint-disable no-restricted-syntax */
import panels from './panels';

/**
 * @return {ElemDescriptor}
 */
export const descriptor = () => ({
    props: {
        title: {
            type: String,
            default: 'Навигация',
            label: 'Заголовок'
        },
        showTitle: {
            type: Boolean,
            default: true,
            label: 'Показывать заголовок'
        },
        dropdownText: {
            type: String,
            default: '',
            label: 'Текст выпадающего списка',
            hint: 'Отображается в выпадающем списке'
        },
        showSlug: {
            type: Boolean,
            default: false,
            label: 'Показывать пути (slug) страниц',
            hint: 'Показывает путь рядом с названием страницы'
        },
        orientation: {
            type: String,
            default: 'horizontal',
            label: 'Ориентация',
            options: [
                { label: 'Горизонтально', value: 'horizontal' },
                { label: 'Вертикально', value: 'vertical' },
                { label: 'Выпадающий список', value: 'dropdown' },
                { label: 'Гамбургер меню', value: 'kebab' }
            ]
        },
        itemsPerPage: {
            type: Number,
            default: 6,
            label: 'Элементов на странице',
            hint: 'Для dropdown и kebab меню, остальные через скролл'
        },
        openMode: {
            type: String,
            default: 'click',
            label: 'Режим открытия меню',
            options: [
                { label: 'По клику', value: 'click' },
                { label: 'При наведении', value: 'hover' }
            ],
            hint: 'Для dropdown и kebab меню'
        },
        buttonStyle: {
            type: String,
            default: 'filled',
            label: 'Стиль кнопок',
            options: [
                { label: 'Заполненные', value: 'filled' },
                { label: 'С обводкой', value: 'outlined' },
                { label: 'Без обводки', value: 'text' }
            ]
        },
        activeColor: {
            type: String,
            default: '#3b82f6',
            label: 'Цвет активной кнопки'
        },
        hoverColor: {
            type: String,
            default: '#60a5fa',
            label: 'Цвет при наведении'
        },
        backgroundColor: {
            type: String,
            default: '#ffffff',
            label: 'Фон контейнера'
        },
        textColor: {
            type: String,
            default: '#1f2937',
            label: 'Цвет текста'
        },
        buttonPadding: {
            type: Object,
            default: () => ({ size: 0.75, unit: 'rem' }),
            label: 'Отступ кнопок'
        },
        buttonGap: {
            type: Object,
            default: () => ({ size: 0.5, unit: 'rem' }),
            label: 'Расстояние между кнопками'
        },
        borderRadius: {
            type: String,
            default: '0.375rem',
            label: 'Скругление углов'
        },
        fontSize: {
            type: Object,
            default: () => ({ size: 0.875, unit: 'rem' }),
            label: 'Размер шрифта'
        },
        fontFamily: {
            type: String,
            default: 'inherit',
            label: 'Семейство шрифта'
        },
        appJsonUrl: {
            type: String,
            default: '',
            label: 'URL для app.json (опционально)',
            hint: 'Если не указан, URL строится автоматически'
        }
    }
});

export const meta = {
    descriptor,
    panels
};

export default descriptor;
