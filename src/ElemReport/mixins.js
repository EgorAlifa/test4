import { useElemDatasetBaseMixin } from '@goodt-common/data';
import { DatasetPanelMixin } from './panels';

export const DatasetMixin = useElemDatasetBaseMixin({
    panel: {
        isMultiple: true,
        mixins: [DatasetPanelMixin]
    }
});
