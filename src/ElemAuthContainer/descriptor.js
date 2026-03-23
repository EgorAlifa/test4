import panels from './panels';
import { Behaviour } from './constants';

export const Vars = Object.freeze({});

export const descriptor = () => ({
    props: {
        domTag: {
            type: String,
            default: 'div'
        },
        behaviour: {
            type: String,
            default: Behaviour.LOGIN,
            options: [
                { value: Behaviour.LOGIN, label: Behaviour.LOGIN },
                { value: Behaviour.RENDER, label: Behaviour.RENDER },
                { value: Behaviour.REDIRECT, label: Behaviour.REDIRECT }
            ]
        },
        redirectUrl: {
            type: String,
            default: ''
        },
        height: {
            type: String,
            default: '100'
        },
        heightUnit: {
            type: String,
            default: '%'
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
