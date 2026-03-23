/* eslint-disable no-restricted-syntax */
import panels from './panels';
import { ButtonAlign, LayoutDirection } from './constants';

/**
 * @return {import('goodt-wcore').ElemDescriptor}
 */
export const descriptor = () => ({
    props: {
        width: {
            default: '14'
        },
        widthUnit: {
            default: 'rem'
        },
        successPath: {
            type: String,
            label: 'Роут при успешной аутентификации',
            default: '/'
        },
        labels: {
            type: Object,
            label: {
                labels: 'Настройки строк',
                'labels.username': 'Имя пользователя',
                'labels.password': 'Пароль',
                'labels.submit': 'Войти',
                'labels.error': 'Текст ошибки аутентификации'
            },
            default: () => ({
                username: 'Имя пользователя',
                password: 'Пароль',
                submit: 'Войти',
                error: 'Неверное имя пользователя/пароль'
            })
        },
        layout: {
            type: Object,
            label: {
                layout: 'Настройки вёрстки',
                'layout.direction': 'Направление вёрстки формы',
                'layout.gap': 'Отступ между полями',
                'layout.btnAlign': 'Выравнивание кнопки',
                'layout.btnIcon': 'Отображать иконку кнопки'
            },
            default: () => ({
                direction: LayoutDirection.COLUMN,
                gap: '1rem',
                btnAlign: ButtonAlign.RIGHT,
                btnIcon: true
            }),
            options: {
                'layout.direction': [
                    { label: 'Вертикальное', value: LayoutDirection.COLUMN },
                    { label: 'Горизонтальное', value: LayoutDirection.ROW }
                ],
                'layout.btnAlign': [
                    { label: 'По левой стороне', value: ButtonAlign.LEFT },
                    { label: 'По правой стороне', value: ButtonAlign.RIGHT }
                ]
            }
        }
    }
});

export const meta = {
    descriptor,
    panels,
    cssVars: {
        direction: ({ layout }) => layout.direction,
        align: ({ layout }) => (layout.direction === LayoutDirection.ROW ? 'end' : 'normal'),
        gap: ({ layout }) => layout.gap,
        btnAlign: ({ layout }) => layout.btnAlign
    }
};

export default descriptor;
