import { BaseViewModel } from '@goodt-common/layers';
import { useSDKFactory, useSDKDataProvider, Query } from '@goodt-common/dremio';
import { cloneDeep, isEqual } from 'lodash';
import { DEFAULT_SOURCE_LIMIT } from '../constants';

class ViewModel extends BaseViewModel {
    sdk;

    data = [];

    sources = [];

    _widget;

    constructor({ widget }) {
        super();
        /** @type {import('@goodt-common/dremio').SDK} */
        this.sdk = useSDKFactory();
        this._widget = widget;
    }

    /**
     * @return {boolean}
     */
    get isDremioPaginationLimit() {
        const { isDremioPaginationLimit } = this._widget.props;

        return isDremioPaginationLimit;
    }

    /**
     * @param {DremioSource[]} sources
     */
    setSources(sources) {
        this.data = [];
        this.sources = sources.map((source) => cloneDeep(source));
    }

    /**
     * @param {Record<string, any>} filters
     * @param {boolean} forceUpdate
     * @return {object[][]}
     */
    async fetchData(filters = {}, forceUpdate = false) {
        const { data, sources } = this;

        const requests = sources.map((source, index) => {
            if (source == null) {
                return null;
            }
            const appliedFiltersCount = this.applyQueryFilters(source, cloneDeep(filters));
            const shouldFetch = appliedFiltersCount > 0 || data[index] == null || forceUpdate;
            if (shouldFetch === false) {
                return null;
            }

            // index === 0 корневой источник, остальные являются доп. источниками
            if (index === 0) {
                return this.fetchSourceData(source, null);
            }

            // При выключенной пагинации внутри dremio source.limit равен 0
            const forceLimit = this.isDremioPaginationLimit
                ? source.limit || DEFAULT_SOURCE_LIMIT
                : DEFAULT_SOURCE_LIMIT;

            return this.fetchSourceData(source, forceLimit);
        });
        const fetchedData = await Promise.all(requests);
        this.data = fetchedData.map((chunk, index) => (sources[index] == null ? null : chunk ?? data[index]));
        return this.data;
    }

    /**
     * @param {DremioSource} source
     * @param {number?} forceLimit
     * @return {Record<string, any>[]?}
     */
    async fetchSourceData(source, forceLimit = null) {
        const { sdk } = this;
        const { query, dimensionList, limit } = source;
        const helper = new Query({ query, dimensionList });
        const { rows } = await useSDKDataProvider(sdk, source).getData(
            helper.buildQuery(),
            0,
            forceLimit === null ? limit : forceLimit
        );
        return rows;
    }

    /**
     * @param {DremioSource} source
     * @param {object} filters
     * @return {number}
     */
    applyQueryFilters({ query, dimensionList }, filters) {
        let numFiltersApplied = 0;
        const metricDimensionFieldNames = this.getQueryMetricDimensionFilterNames({ query, dimensionList });

        Object.entries(filters).forEach(([name, val]) => {
            if (metricDimensionFieldNames.includes(name) === false) {
                return;
            }
            const isNull = val === null;
            const isArray = Array.isArray(val);
            const value = isArray ? val : [val];
            const type = isArray ? Query.FILTER_TYPE.IN : Query.FILTER_TYPE.EQ;
            const foundFilter = query[Query.KEY.FILTERS].find((filter) => Query.getFilterName(filter) === name);

            if (isNull) {
                if (foundFilter != null) {
                    Query.queryRemoveFilter(query, name);
                    numFiltersApplied++;
                }
            } else {
                if (foundFilter && isEqual(Query.getFilterValue(foundFilter), value)) {
                    return;
                }
                const filter = Query.createFilter({ name, value, type });
                Query.queryInsertUpdateFilter(query, filter);
                numFiltersApplied++;
            }
        });

        return numFiltersApplied;
    }

    /**
     * @param {DremioSource} options
     * @return {string[]}
     */
    getQueryMetricDimensionFilterNames({ query, dimensionList }) {
        const names = [
            ...Query.queryFieldNames(query),
            ...Query.queryMetricNames(query),
            ...Object.keys(dimensionList)
        ];
        return [...new Set(names)];
    }
}

export const createViewModel = (options) => new ViewModel(options);
