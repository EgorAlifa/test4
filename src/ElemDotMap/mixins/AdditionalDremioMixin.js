import { cloneDeep, isEqual } from 'lodash';
import { Dremio } from 'goodt-wcore';

const { Query, SDKFactory } = Dremio;

export default {
    data() {
        return {
            dremioSdkAdditional: null,
            addlDremioVars: [],
            addlQueryHelper: null,
            additionalDremioDatasets: [],
            currentFeature: null
        };
    },
    mounted() {
        this.dremioSdkAdditional = SDKFactory();
        /**
         * @property {string[]}
         */
        this.addlDremioVars = [];
        this.addlDremioHandler();
        // watch store state if enabled
        if (this.watchStoreState) {
            this.$watchStore({ handler: (_, state) => this.storeStateWatcherAdditionalDremio(state) });
        }
        if (this.isEditorMode) {
            this.$watch('addlDremioStr', this.addlDremioHandler);
        }
    },
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
    destroyed() {
        this.dremioSdkAdditional.cancelActiveRequests();
    },
    methods: {
        loadAddlData() {
            this.dremioSdkAdditional.cancelActiveRequests();
            const query = this.addlQueryHelper.buildQuery();

            this.dremioSdkAdditional
                .getData(query, 0, 0)
                .then(({ rows }) => {
                    this.additionalDremioDatasets = rows;
                    this.updateMap();
                })
                .catch(this.handleError);
        },
        addlDremioHandler() {
            const { additionalDremio } = this.props;
            if (additionalDremio == null || Array.isArray(additionalDremio) === true) {
                this.additionalDremioDatasets = null;
                return;
            }

            this.addlQueryHelper = new Query(cloneDeep(additionalDremio));
            this.setAddlDremioVars();
            this.loadAddlData();
        },
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
        storeStateWatcherAdditionalDremio(state) {
            if (Object.keys(state).length === 0) {
                return;
            }
            this.$nextTick(() => {
                if (this.applyAddlDremioFilters(state)) {
                    this.offset = 0;
                    this.loadAddlData();
                }
            });
        },
        handleError(error) {
            if (error.isCancel) {
                return;
            }
            if (this.isEditorMode) {
                this.error = error;
            }
        }
    }
};
