import { useElemDatasetMixin } from '@goodt-common/data';
import { DatasetPanelMixin } from '../panels';

export const DatasetMixin = useElemDatasetMixin({
    panel: {
        mixins: [DatasetPanelMixin]
    }
});

export { default as CellActionsMixin } from './CellActionsMixin';
