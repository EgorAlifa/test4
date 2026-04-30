/* eslint-disable no-restricted-syntax */
import { useActionsDescriptor, useStyleConditionsDescriptor } from '@goodt-widgets-insight/table-common';
import panels from './panels';
import { cssVars } from './css-vars';
import { HoverStyleFactory, SelectStyleFactory } from './constants';

/**
 * @enum {string}
 * @type {Readonly<Record<string, string>>}
 */
export const Vars = Object.freeze({});

/**
 * @description Don't change `descriptor` exported name
 * @return {ElemDescriptor}
 */
export const descriptor = () => ({
    props: {
        style: {
            type: Object,
            default: () => ({
                hover: HoverStyleFactory({
                    color: '#2C3E5D',
                    bgColor: '#F1F2F4',
                    gradient: {
                        colorStops: ['#F7F8F9', '#F1F2F4']
                    }
                }),
                select: SelectStyleFactory()
            })
        },
        border: {
            type: Object,
            default: () => ({
                isDisplayed: false,
                width: null,
                color: null
            })
        }
    },
    vars: Object.values(Vars).reduce((acc, varName) => ({ ...acc, [varName]: { description: varName } }), {})
});

export const meta = {
    descriptor: [useActionsDescriptor, useStyleConditionsDescriptor].reduce((acc, fnc) => fnc(acc), descriptor),
    panels,
    isChildAllowed: true,
    slotNames: ['default', 'sub-row'],
    cssVars
};

export default descriptor;
