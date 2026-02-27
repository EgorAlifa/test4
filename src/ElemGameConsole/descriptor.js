/* eslint-disable no-restricted-syntax */
import panels from './panels';

/**
 * @return {ElemDescriptor}
 */
export const descriptor = () => ({
    props: {
        accentColor: {
            type: String,
            default: '#00ff88',
            label: 'Акцентный цвет',
            hint: 'Цвет неонового свечения в интерфейсе'
        },
        maxWaves: {
            type: Number,
            default: 10,
            label: 'Волн в Shooter',
            hint: 'Количество волн до победы (1–30)'
        },
        turnSensitivity: {
            type: Number,
            default: 3,
            label: 'Чувствительность поворота',
            hint: 'Скорость поворота в CS и Moto3D (1 — плавно, 5 — резко)'
        },
        secretEnabled: {
            type: Boolean,
            default: false,
            label: 'Секретная игра (Mario)',
            hint: 'Показать секретный платформер в меню'
        }
    }
});

export const meta = {
    descriptor,
    panels
};

export default descriptor;
