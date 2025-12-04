import panels from './panels';
import { Mode } from './constants';

export const Vars = Object.freeze({});

export const descriptor = () => ({
    props: {
        mode: {
            type: String,
            default: Mode.BUTTON
        },
        requests: {
            type: Array,
            default: []
        },
        generatedOAuthToken: {
            type: String,
            default: ''
        }
    },
    vars: Object.values(Vars).reduce((acc, varName) => ({ ...acc, [varName]: { description: varName } }), {}),
    cssVars: {}
});

export const meta = {
    descriptor,
    panels,
    isChildAllowed: true,
    slotNames: ['default']
};

export default descriptor;
