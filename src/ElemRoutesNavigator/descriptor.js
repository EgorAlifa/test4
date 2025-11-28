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
            default: 'Выберите страницу для перехода',
            label: 'Текст выпадающего списка',
            hint: 'Отображается в выпадающем списке'
        },
        showSlug: {
            type: Boolean,
            default: false,
            label: 'Показывать пути (slug) страниц',
            hint: 'Показывает путь рядом с названием страницы'
        },
        highlightActivePage: {
            type: Boolean,
            default: false,
            label: 'Активная страница',
            hint: 'Показывает текущую страницу'
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
        buttonAlignment: {
            type: String,
            default: 'left',
            label: 'Позиционирование кнопок',
            options: [
                { label: 'По левому краю', value: 'left' },
                { label: 'По центру', value: 'center' },
                { label: 'По правому краю', value: 'right' }
            ],
            hint: 'Выравнивание текста в кнопках'
        },
        itemsPerPage: {
            type: Number,
            default: 6,
            label: 'Элементов на странице',
            hint: 'Для вертикальной ориентации, выпадающего списка и кебаб меню'
        },
        openMode: {
            type: String,
            default: 'click',
            label: 'Режим открытия меню',
            options: [
                { label: 'По клику', value: 'click' },
                { label: 'При наведении', value: 'hover' }
            ],
            hint: 'Для выпадающего списка и кебаб меню'
        },
        enablePagination: {
            type: Boolean,
            default: true,
            label: 'Включить пагинацию',
            hint: 'Для вертикальной ориентации, выпадающего списка и кебаб меню'
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
            label: 'Семейство шрифта',
            hint: 'Например: Arial, Helvetica, sans-serif'
        },
        showMenuBorder: {
            type: Boolean,
            default: true,
            label: 'Показывать границу списка',
            hint: 'Граница выпадающего списка и кебаб меню'
        },
        menuBorderColor: {
            type: String,
            default: '#1f2937',
            label: 'Цвет границы списка',
            hint: 'Цвет границы выпадающего списка и кебаб меню'
        },
        showToggleBorder: {
            type: Boolean,
            default: true,
            label: 'Показывать границу кнопки',
            hint: 'Граница кнопки выпадающего списка и кебаб меню'
        },
        toggleBorderColor: {
            type: String,
            default: '#1f2937',
            label: 'Цвет границы кнопки',
            hint: 'Цвет границы кнопки выпадающего списка и кебаб меню'
        },
        enableHierarchy: {
            type: Boolean,
            default: false,
            label: 'Включить иерархию',
            hint: 'Позволяет создавать вложенные разделы и подразделы'
        },
        navigateParents: {
            type: Boolean,
            default: true,
            label: 'Переходить по родителям',
            hint: 'При клике на родителя - перейти на страницу и развернуть детей'
        },
        hierarchy: {
            type: Object,
            default: () => ({}),
            label: 'Иерархия страниц',
            hint: 'Хранит связи родитель-ребенок (настраивается в панели Эксперт)'
        },
        routesOrder: {
            type: Array,
            default: () => ([]),
            label: 'Порядок страниц',
            hint: 'Хранит кастомный порядок страниц (настраивается в панели Эксперт)'
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
