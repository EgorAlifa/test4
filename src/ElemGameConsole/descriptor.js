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
        }
    }
});

export const meta = {
    descriptor,
    panels
};

export default descriptor;
