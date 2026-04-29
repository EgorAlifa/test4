import { cloneDeep, isEqual } from 'lodash';
import { normalizeEntityProp } from '../utils';

export const DatasetPanelMixin = {
    watch: {
        dimensionsMetrics: {
            handler() {
                const { props, dimensions, metrics } = this;
                const clonedProps = cloneDeep(props);
                props.selectedDimension = normalizeEntityProp(props.selectedDimension, dimensions);
                props.selectedMetric = normalizeEntityProp(props.selectedMetric, metrics);
                props.smartSearchDimensions = props.smartSearchDimensions.map((dimension) => ({
                    ...dimension,
                    name: normalizeEntityProp(dimension.name, dimensions)
                }));
                
                if (isEqual(props, clonedProps) === false) {
                    this.propChanged();
                }
            },
            immediate: true
        }
    }
};
