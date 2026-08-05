import { TooltipDefaultFactory } from '@goodt-wcore/components';
import panels from './panels';
import {
    CardFields,
    CardStyle,
    ColorSettings,
    FactorPanelFields,
    Fields,
    GeneralSettings,
    HoverSettings,
    SelectSettings
} from './config';

/**
 * @enum {string}
 * @type {Readonly<Record<string, string>>}
 */
export const Vars = Object.freeze({
    SELECT_OBJECT_BY_ID: 'select_object_by_id'
});

export const Events = Object.freeze({
    UNSELECT_OBJECT: 'unselect'
});

/**
 * @description Don't change `descriptor` exported name
 * @return {ElemDescriptor}
 */
const descriptor = () => ({
    props: {
        height: {
            type: String,
            default: '100'
        },
        svg: {
            type: Object,
            default: null
        },
        nodes: {
            type: Array,
            default: () => []
        },
        labels: {
            type: Array,
            default: () => []
        },
        labelsSettings: {
            type: Array,
            default: () => []
        },
        limitSettings: {
            type: Array,
            default: () => []
        },
        labelOffsetY: {
            type: Number,
            default: 0
        },
        labelOffsetX: {
            type: Number,
            default: 0
        },
        labelOffsetRight: {
            type: Number,
            default: 0
        },
        offsetBetweenLabels: {
            type: Number,
            default: 40
        },
        fields: {
            type: Object,
            default: () => Fields
        },
        routeUrl: {
            type: String,
            default: '',
            hasConst: true
        },
        colorSettings: {
            type: Object,
            default: () => ColorSettings
        },
        hoverSettings: {
            type: Object,
            default: () => HoverSettings
        },
        generalSettings: {
            type: Object,
            default: () => GeneralSettings
        },
        selectSettings: {
            type: Object,
            default: () => SelectSettings
        },
        resetStoreVariables: {
            type: Boolean,
            default: true
        },
        customTooltip: {
            type: Object,
            default: TooltipDefaultFactory
        },
        shouldDrawForeignObject: {
            type: Boolean,
            default: false
        },
        // ── Value-card mode ─────────────────────────────────────────
        cardMode: {
            type: Boolean,
            default: false
        },
        cardFields: {
            type: Object,
            default: () => CardFields
        },
        cardStyle: {
            type: Object,
            default: () => CardStyle
        },
        // ── Factor-breakdown panel mode ──────────────────────────────
        factorPanel: {
            type: Object,
            default: () => FactorPanelFields
        },
        events: {
            type: Object,
            default: () => ({
                [Events.UNSELECT_OBJECT]: ''
            })
        }
    },
    events: {
        [Events.UNSELECT_OBJECT]: ['trigger']
    },
    vars: Vars
});

export const meta = {
    descriptor,
    panels,
    isChildAllowed: true,
    slotNames: ['tooltip']
};
