import { useDatasetMeta } from '@goodt-common/data';
import { DatasetPanelMixin } from './panels';

import panels from './panels';


/**
 * @description Don't change `descriptor` exported name
 * @return {ElemDescriptor}
 */
export const descriptor = () => ({
    props: {
        metric: {
            type: String,
            default: null,
            label: 'Метрика'
        },
        dimension: {
            type: String,
            default: null,
            label: 'Измерение'
        },
        dimensionOrMetric: {
            type: String,
            default: null,
            label: 'Измерение/метрика'
        },
        field: {
            type: String,
            default: null,
            label: 'Поле'
        },
        drilldownName: {
            type: String,
            default: null,
            label: 'Дриллдаун'
        },
    }
});

export const metaBase = {
    descriptor,
    panels,
    isChildAllowed: false
    /*
    cssVars,
    slotNames: ['default']
    */
};

export const meta = useDatasetMeta(metaBase, {
    panel: {
        // meta: { name: '', icon: '' },
        // isMultiple: false // (false by default)
        // DatasetPanelMixin расширяет поведение стандартной DatasetPanel.vue
        mixins: [DatasetPanelMixin]
    }
});

