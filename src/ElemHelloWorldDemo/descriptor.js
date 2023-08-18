/* eslint-disable no-restricted-syntax */
import panels from './panels';

/**
 * @return {ElemDescriptor}
 */
export const descriptor = () => ({
    props: {
        message: {
            type: String,
            default: 'Hello World!',
            label: 'Message'
        }
    }
});

export const meta = {
    descriptor,
    panels
}

export default descriptor;
