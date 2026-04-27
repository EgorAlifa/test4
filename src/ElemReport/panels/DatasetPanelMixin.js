import { isEqual } from 'lodash';

export default {
    watch: {
        datasetRequests: {
            handler(cur, old) {
                const { reportDatasets } = this.props;
                if (cur.length >= old.length) {
                    return;
                }
                const deletedIndex = old.findIndex((oldDataset, index) => !isEqual(oldDataset, cur?.[index]));
                this.props.reportDatasets = reportDatasets.map((item) => {
                    const { datasetIndex, ...other } = item;
                    if (datasetIndex === '' || datasetIndex < deletedIndex) {
                        return item;
                    }
                    return { ...other, datasetIndex: datasetIndex === deletedIndex ? '' : datasetIndex - 1 };
                });
                this.propChanged('reportDatasets');
            }
        }
    }
};
