import { isEqual, isNaN } from 'lodash';
import { DeviationFormula } from './constants';

export const mixin = {
    watchEditor: {
        'props.deviationMeta': {
            handler: (meta, oldMeta) => {
                if (isEqual(meta, oldMeta) === false) {
                    this.buildDeviationData();
                }
            }
        }
    },
    methods: {
        /**
         * extends main source result`s rows with deviations & merges additional result`s rows
         * @param {import('goodt-dremio-sdk').DremioResult} addlResult
         * @return {Array}
         */
        extendRowsWithDeviations(result, addlResult) {
            const { mainSourceIdentifier, addlSourceIdentifier, deviations } = this.props.deviationMeta;
            if (addlResult == null) {
                return result.rows;
            }

            const deviationsHandler = (mainResultRow, addlResultRow) =>
                deviations.reduce((obj, { name, type, mainSourceMetric, addlSourceMetric }) => {
                    const mainMetricValue = mainResultRow[mainSourceMetric];
                    const addlMetricValue = addlResultRow[addlSourceMetric];
                    const deviationValue = DeviationFormula[type]?.(mainMetricValue, addlMetricValue);
                    return isNaN(deviationValue) ? obj : { ...obj, [name]: deviationValue };
                }, {});
            return result.reduce((rows, row) => {
                const foundRow = addlResult.rows.find(
                    ({ [addlSourceIdentifier]: value }) => value === row[mainSourceIdentifier]
                );

                if (foundRow == null) {
                    return [...rows, row];
                }

                const calculatedDeviations = deviationsHandler(row, foundRow);

                const rowWithDeviations = { ...row, ...calculatedDeviations };
                return [...rows, rowWithDeviations];
            }, []);
        },

        buildDeviationData() {
            const {
                resData,
                props: {
                    deviationMeta: { dimensionIndex = 0 }
                }
            } = this;

            this.resData.forEach((addlResult, index) => {
                const rowsWithDeviations = this.extendRowsWithDeviations(
                    this.resData[index].rows,
                    resData[dimensionIndex]
                );
                this.$set(this.resData, index, { ...this.resData[index], rows: rowsWithDeviations });
            });
        }
    }
};
