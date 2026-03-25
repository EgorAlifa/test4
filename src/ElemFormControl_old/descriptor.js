/* eslint-disable no-restricted-syntax */
import { useActionsDescriptor, useStyleConditionsDescriptor, useTableCellDescriptor, ControlType } from '../shared';
import panels from './panels';
import { ButtonOptionsFactory } from './constants';
import { cssVars } from './css-vars';

/**
 * @enum {string}
 * @type {Readonly<Record<string, string>>}
 */
export const Vars = Object.freeze({});

/**
 * @enum {string}
 * @type {Readonly<Record<string, string>>}
 */
export const Events = Object.freeze({
    /*
    OPEN: 'open',
    CLOSE: 'close'
    */
});

/**
 * @description Don't change `descriptor` exported name
 * @return {ElemDescriptor}
 */
export const descriptor = () => ({
    props: {
        control: {
            type: Object,
            default: () => ({
                type: ControlType.CHECKBOX,
                size: null,
                borderRadius: null,
                bgColor: null,
                bgColorActive: null,
                bgImage: null
            })
        },
        isButtonDisplayed: {
            type: Boolean,
            default: false
        },
        button: {
            type: Object,
            default: () => ({
                default: ButtonOptionsFactory(),
                active: ButtonOptionsFactory()
            })
        }
    },
    vars: Object.values(Vars).reduce((acc, varName) => ({ ...acc, [varName]: { description: varName } }), {})
});

export const meta = {
    descriptor: [useTableCellDescriptor, useActionsDescriptor, useStyleConditionsDescriptor].reduce(
        (acc, factory) => factory(acc),
        descriptor
    ),
    panels,
    isChildAllowed: false,
    cssVars
};

export default descriptor;
