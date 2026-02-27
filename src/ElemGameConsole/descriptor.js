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
        }
    }
});

export const meta = {
    descriptor,
    panels
};

export default descriptor;
