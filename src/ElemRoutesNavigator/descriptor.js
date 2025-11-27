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
        showIcons: {
            type: Boolean,
            default: true,
            label: 'Показывать иконки'
        },
        orientation: {
            type: String,
            default: 'vertical',
            label: 'Ориентация'
        },
        buttonStyle: {
            type: String,
            default: 'filled',
            label: 'Стиль кнопок'
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
            default: () => ({ size: 12, unit: 'px' }), // eslint-disable-line no-magic-numbers
            label: 'Отступ кнопок'
        },
        buttonGap: {
            type: Object,
            default: () => ({ size: 8, unit: 'px' }), // eslint-disable-line no-magic-numbers
            label: 'Расстояние между кнопками'
        },
        borderRadius: {
            type: String,
            default: '6px',
            label: 'Скругление углов'
        },
        fontSize: {
            type: Object,
            default: () => ({ size: 14, unit: 'px' }), // eslint-disable-line no-magic-numbers
            label: 'Размер шрифта'
        },
        appJsonUrl: {
            type: String,
            default: 'app.json',
            label: 'Путь к app.json'
        }
    }
});

export const meta = {
    descriptor,
    panels
};

export default descriptor;
