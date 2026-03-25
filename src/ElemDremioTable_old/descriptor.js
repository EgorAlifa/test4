import { cssVars } from './styles/css-vars';

export const Vars = Object.freeze({});

export const descriptor = () => ({
    props: {
        dremio: {
            type: Object,
            default: null
        },
        additionalDremio: {
            type: Object,
            default: null
        },
        deviationMeta: {
            type: Object,
            default: () => ({
                mainSourceIdentifier: null,
                addlSourceIdentifier: null,
                deviations: []
            })
        },
        columns: {
            type: Array,
            default() {
                return [];
            },
            hasConst: true
        },
        pagination: {
            type: Object,
            default() {
                return {
                    fontSize: '',
                    fontFamily: '',
                    color: '',
                    activeColor: '',
                    background: ''
                };
            }
        },
        showHead: {
            type: Boolean,
            default: true
        },
        filterValueKey: {
            type: String,
            default: null
        },
        shouldShimBlockTable: {
            type: Boolean,
            default: false
        },
        canRowToggleItself: {
            type: Boolean,
            default: true
        },
        hasRowStylePriority: {
            type: Boolean,
            default: false
        },
        rowBorder: {
            type: Object,
            default: () => ({
                enable: true,
                color: ''
            })
        },
        // deprecated property left for backward compatibility
        highlightedRowCss: {
            type: String,
            default: 'background: rgba(255, 255, 221, 1);'
        },
        // deprecated property left for backward compatibility
        selectedRowCss: {
            type: String,
            default: ''
        },
        highlightedRowStyle: {
            type: Object,
            default: () => ({
                color: '',
                backgroundColor: '',
                fontWeight: '',
                transitionDuration: ''
            })
        },
        selectedRowStyle: {
            type: Object,
            default: () => ({
                color: '',
                backgroundColor: '',
                fontWeight: '',
                transitionDuration: ''
            })
        },
        defaultValue: {
            type: Object,
            default: () => ({
                enable: false,
                field: null,
                value: null
            })
        },
        isWaitingForStoreState: {
            type: Boolean,
            default: false
        },
        shouldResetSelectedRow: {
            type: Boolean,
            default: true
        },
        position: {
            default: 'pos-rel'
        },
        isFooterSlotShown: {
            type: Boolean,
            default: false
        },
        isRowSlotShown: {
            type: Boolean,
            default: false
        },
        isResultRowSticky: {
            type: Boolean,
            default: false
        },
        shouldTruncateHeader: {
            type: Boolean,
            default: true
        },
        alertNoRows: {
            type: Object,
            default: () => ({
                isShown: false,
                text: 'Нет строк для отображения',
                classes: 'alert-warn pad-5 text-small',
                withColumns: false
            })
        },
        filterLikeFields: {
            type: Array,
            default: () => []
        },
        topHeaders: {
            type: Array,
            default: () => []
        }
    },
    vars: Object.values(Vars).reduce((acc, varName) => ({ ...acc, [varName]: { description: varName } }), {})
});

export const meta = {
    descriptor,
    isChildAllowed: true,
    slotNames: ['table', 'row', 'footer'],
    cssVars
};

export default descriptor;
