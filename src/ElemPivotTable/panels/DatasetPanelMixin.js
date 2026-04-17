import { createCellSettings, VerticalAligns } from '../utils/constants';

export const DatasetPanelMixin = {
    watch: {
        metrics: {
            handler(metrics) {
                const {
                    props: { values }
                } = this;

                if (metrics.length === 0 || values.length > 0) {
                    return;
                }
                const [metric] = metrics;
                this.props.values = [
                    createCellSettings({
                        dataAlias: metric,
                        title: metric,
                        verticalAlign: VerticalAligns.RIGHT
                    })
                ];

                this.propChanged('values');
            }
        }
    }
};
