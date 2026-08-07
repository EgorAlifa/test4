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
            handler(metrics) {
                // Auto-select first two metrics if not set
                if (this.props.valueMetric == null && metrics.length > 0) {
                    this.props.valueMetric = metrics[0];
                    this.propChanged('valueMetric');
                    
                    // Set default title to metric name if title is empty
                    if (this.props.title == null || this.props.title === '' || this.props.title === 'Sales Goals') {
                        this.props.title = metrics[0];
                        this.propChanged('title');
                    }
                }
                if (this.props.benchmarkMetric == null && metrics.length > 1) {
                    this.props.benchmarkMetric = metrics[1];
                    this.propChanged('benchmarkMetric');
                }
            },
            immediate: true
        },
        dimensionsMetrics: {
             handler(value, valueOld) {
             }
        }
    }
};

