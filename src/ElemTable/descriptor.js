/* eslint-disable no-restricted-syntax */
import { StoreOperation } from '@goodt-wcore/elem';
import panels from './panels';
import { cssVars } from './css-vars';

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
        rowPreset: {
            type: Object,
            default: () => ({
                shouldChooseFirst: false,
                dataField: null,
                value: null
            })
        },
        isWaitingForState: {
            type: Boolean,
            default: false
        },
        zebraStyle: {
            type: Object,
            default: () => ({
                isShown: false,
                color: null,
                bgColor: '#F7F8F9'
            })
        },
        shouldDisplaySkeleton: {
            type: Boolean,
            default: true
        },
        fieldToSelectFilter: {
            type: String,
            default: null
        },
        fieldToApplyFilter: {
            type: String,
            default: null
        },
        canMultipleSelect: {
            type: Boolean,
            default: false
        },
        cardsMode: {
            type: Object,
            default: () => ({
                isEnabled: false,
                card: {
                    width: null,
                    height: null
                },
                gap: [null, null],
                columnCount: 1
            })
        },
        height: {
            type: String,
            default: '100'
        },
        routeQueryParamNames: {
            type: Array,
            default: () => []
        },
        resultRow: {
            type: Object,
            default: () => ({
                isEnabled: false,
                position: 'bottom'
            })
        },
        metricForSelect: {
            type: String,
            default: null
        },
        isQueryFilterOperatorLike: {
            type: Boolean,
            default: true,
            label: 'Режим работы с like'
        }
    },
    vars: Object.values(Vars).reduce((acc, varName) => ({ ...acc, [varName]: { description: varName } }), {}),
    dataset: {
        vars: {
            dimension: { operation: StoreOperation.ALL }
        }
    }
});

export const meta = {
    descriptor,
    panels,
    slotNames: ['default', 'header', 'footer', 'resultRow'],
    isChildAllowed() {
        return this.hasDataset;
    },
    cssVars
};

export default descriptor;
