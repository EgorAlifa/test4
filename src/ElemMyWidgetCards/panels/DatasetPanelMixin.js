export const DatasetPanelMixin = {
    watch: {
        queryModel: {
            handler(value, valueOld) {
            }
        },
        queryModels: {
            handler(value, valueOld) {
            }
        },
        metrics: {
             handler(value, valueOld) {
             }
        },
        dimensionsMetrics: {
             handler(value, valueOld) {
             }
        },
        dimensions: {
            handler(dimensions) {
                if (dimensions.includes(this.props.dimension) === false) {
                    this.props.dimension = dimensions[0] ?? '';
                    this.propChanged('dimension');
                }
            },
            immediate: true
        }
    }
};
