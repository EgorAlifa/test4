import { Query } from '@goodt-common/dremio';
import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';
import isNaN from 'lodash/isNaN';
import isEmpty from 'lodash/isEmpty';

import { DeviationFormula } from './constants';
export const mixin = {
    data: () => ({
        addlQueryHelper: null
    }),
    computed: {
        /**
         * @return {?string}
         */
        addlDremioStr() {
            try {
                return JSON.stringify(this.props.additionalDremio);
            } catch {
                return null;
            }
        }
    },
    mounted() {
        /**
         * @property {string[]}
         */
        this.addlDremioVars = [];

        this.addlDremioHandler();

        if (this.isEditorMode) {
            this.$watch('addlDremioStr', this.addlDremioHandler);
            this.$watch(
                'props.deviationMeta',
                (meta, oldMeta) => {
                    if (isEqual(meta, oldMeta) === false) {
                        this.loadAddlData();
                    }
                },
                { deep: true }
            );
        }
    },
    methods: {
        setAddlDremioVars() {
            const dremioParams = this.getAddlDremioQueryParamNames();

            this.addlDremioVars = this.addlDremioVars.reduce((varsAcc, name) => {
                if (dremioParams.includes(name)) {
                    varsAcc.push(name);
                    return varsAcc;
                }
                this.$delete(this.descriptor.vars, name);
                return varsAcc;
            }, []);

            dremioParams.forEach((name) => {
                const variable = { description: name };
                this.$set(this.descriptor.vars, name, variable);
                this.addlDremioVars.push(name);
            });
        },

        /**
         * extends main source result`s rows with deviations & merges additional result`s rows
         * @param {import('goodt-dremio-sdk').DremioResult} addlResult
         * @return {Array}
         */
        extendRowsWithDeviations(addlResult) {
            const { mainSourceIdentifier, addlSourceIdentifier, deviations } = this.props.deviationMeta;

            if (addlResult == null) {
                return this.result.rows;
            }

            const deviationsHandler = (mainResultRow, addlResultRow) =>
                deviations.reduce((obj, { name, type, mainSourceMetric, addlSourceMetric }) => {
                    const mainMetricValue = mainResultRow[mainSourceMetric];
                    const addlMetricValue = addlResultRow[addlSourceMetric];
                    const deviationValue = DeviationFormula[type]?.(mainMetricValue, addlMetricValue);

                    return isNaN(deviationValue) ? obj : { ...obj, [name]: deviationValue };
                }, {});

            return this.result.rows.reduce((rows, row) => {
                const foundRow = addlResult.rows.find(
                    ({ [addlSourceIdentifier]: value }) => value === row[mainSourceIdentifier]
                );

                if (foundRow == null) {
                    return [...rows, row];
                }

                const calculatedDeviations = deviationsHandler(row, foundRow);
                const rowWithDeviations = { ...row, ...foundRow, ...calculatedDeviations };

                return [...rows, rowWithDeviations];
            }, []);
        },

        loadAddlData() {
            const { result, addlQueryHelper } = this;
            const { mainSourceIdentifier, addlSourceIdentifier, deviations } = this.props.deviationMeta;

            if ([result, addlQueryHelper, mainSourceIdentifier, addlSourceIdentifier, deviations].some(isEmpty)) {
                return;
            }

            const filter = Query.createFilter({
                name: addlSourceIdentifier,
                value: result.rows.map((row) => row[mainSourceIdentifier]),
                type: Query.FILTER_TYPE.IN
            });

            addlQueryHelper.query = Query.queryInsertUpdateFilter(addlQueryHelper.query, filter);

            const query = addlQueryHelper.buildQuery();

            this.dremioSdk
                .getData(query, 0, 0)
                .then((addlResult) => {
                    const rowsWithDeviations = this.extendRowsWithDeviations(addlResult);
                    this.$set(this.result, 'rows', rowsWithDeviations);
                })
                .catch(this.handleError);
        },
        handleError(error) {
            if (error.isCancel) {
                return;
            }
            if (this.isEditorMode) {
                this.error = error;
            }
        },

        /**
         * Applies dremio filters
         *
         * @param {Record<string, any>} params   params to be injected
         * @return {boolean}
         */
        applyAddlDremioFilters(params) {
            if (this.addlQueryHelper == null) {
                return false;
            }

            let { query } = this.addlQueryHelper;
            const originalQuery = cloneDeep(query);
            const dremioParams = this.getAddlDremioQueryParamNames();
            let anyFilterApplied = false;

            Object.entries(params).forEach(([name, paramVal]) => {
                if (dremioParams.includes(name)) {
                    if (paramVal !== null) {
                        /** @see https://goodt-git.goodt.me/projects/GOOD/repos/goodt-wcore/browse/src/core/dremio/index.js#243 */
                        const filter = this.createDremioFilter(name, paramVal);
                        query = Query.queryInsertUpdateFilter(query, filter);
                    } else {
                        query = Query.queryRemoveFilter(query, name);
                    }
                    anyFilterApplied = isEqual(query, originalQuery) === false;
                }
            });

            return anyFilterApplied;
        },

        /**
         * Returns dremio query metric/dimension/field names
         *
         * @return {string[]}
         */
        getAddlDremioQueryParamNames() {
            if (this.addlQueryHelper == null) {
                return [];
            }

            const { query, dimensionList } = this.addlQueryHelper;
            const metrics = Query.queryMetricNames(query);
            const dimensions = Object.keys(dimensionList);
            const fields = Query.queryFieldNames(query);
            return [...metrics, ...dimensions, ...fields];
        },

        addlDremioHandler() {
            const { additionalDremio } = this.props;
            if (additionalDremio == null) {
                return;
            }

            this.addlQueryHelper = new Query(cloneDeep(additionalDremio));
            this.setAddlDremioVars();
            this.loadAddlData();
        }
    }
};

export default mixin;
