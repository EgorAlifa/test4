<template>
    <ui-panel-container>
        <ui-select
            class="p"
            v-model="props.deviationMeta.mainSourceIdentifier"
            :options="mainSourceDimensionOptions"
            @change="onChange">
            Измерение основного источника
        </ui-select>

        <ui-select
            class="p"
            v-model="props.deviationMeta.addlSourceIdentifier"
            :options="addlSourceDimensionOptions"
            @change="onChange">
            Измерение дополнительного источника
        </ui-select>

        <ui-collapse class="p" v-for="(deviation, idx) of props.deviationMeta.deviations" :key="idx">
            <template #header>{{ deviation.name }}</template>
            <ui-input v-model="deviation.name" class="p" @change="onChange">Наименование отклонения</ui-input>
            <ui-select v-model="deviation.type" :options="deviationTypeOptions" class="p" @change="onChange">
                Тип сравнения
            </ui-select>
            <ui-select
                v-model="deviation.mainSourceMetric"
                :options="mainSourceMetricOptions"
                class="p"
                @change="onChange">
                Метрика основного источника
            </ui-select>
            <ui-select
                v-model="deviation.addlSourceMetric"
                :options="addlSourceMetricOptions"
                class="p"
                @change="onChange">
                Метрика дополнительного источника
            </ui-select>
            <ui-button type="error" @click="deleteDeviation(idx)">Удалить</ui-button>
        </ui-collapse>

        <ui-button type="ghost" @click="addDeviation">Задать отклонение</ui-button>
    </ui-panel-container>
</template>

<script>
import { Panel } from '@goodt-wcore/panel';
import { Query } from '@goodt-common/dremio';
import { DeviationType } from '../constants';

/**
 * @typedef {import('./DeviationDremioPanel').TInstance} TInstance
 * @type {TInstance}
 */
export const PanelInstanceTypeDescriptor = undefined;

/**
 * @typedef {Object} DDeviation
 * @property {string} name
 * @property {string|null} type                 absolute/percent
 * @property {string|null} mainSourceMetric     metric
 * @property {string|null} addlSourceMetric     metric
 */

/**
 * @return {DDeviation}
 */
const DeviationFactory = () => ({
    name: 'Новое отклонение',
    type: null,
    mainSourceMetric: null,
    addlSourceMetric: null
});

export default {
    extends: Panel,
    data: () => ({
        /** @public */
        $meta: { name: 'Отклонения', icon: 'sigma-lower' }
    }),
    static: {
        deviationTypeOptions: [
            { value: null, label: '-' },
            { value: DeviationType.ABS, label: 'Абсолютное' },
            { value: DeviationType.PCT, label: 'В процентном выражении' }
        ]
    },
    computed: {
        /**
         * @typedef {Object} DSelectOption
         * @property {string} label
         * @property {string|null} value
         */

        /**
         * @return {DSelectOption[]}
         */
        mainSourceDimensionOptions() {
            if (this.props.dremio == null) {
                return [{ value: null, label: '-' }];
            }
            const { dimensionList } = this.props.dremio;
            const dimensionOptions = Object.keys(dimensionList)
                .sort((a, b) => a.localeCompare(b))
                .map((dim) => ({ value: dim, label: dim }));
            return [{ value: null, label: '-' }, ...dimensionOptions];
        },
        /**
         * @return {DSelectOption[]}
         */
        addlSourceDimensionOptions() {
            if (this.props.additionalDremio == null) {
                return [{ value: null, label: '-' }];
            }
            const { dimensionList } = this.props.additionalDremio;
            const dimensionOptions = Object.keys(dimensionList)
                .sort((a, b) => a.localeCompare(b))
                .map((dim) => ({ value: dim, label: dim }));
            return [{ value: null, label: '-' }, ...dimensionOptions];
        },
        /**
         * @return {DSelectOption[]}
         */
        mainSourceMetricOptions() {
            if (this.props.dremio == null) {
                return [{ value: null, label: '-' }];
            }
            const { query } = this.props.dremio;
            const metricOptions = Query.queryMetricNames(query)
                .sort((a, b) => a.localeCompare(b))
                .map((metric) => ({ value: metric, label: metric }));
            return [{ value: null, label: '-' }, ...metricOptions];
        },
        /**
         * @return {DSelectOption[]}
         */
        addlSourceMetricOptions() {
            if (this.props.additionalDremio == null) {
                return [{ value: null, label: '-' }];
            }
            const { query } = this.props.additionalDremio;
            const metricOptions = Query.queryMetricNames(query)
                .sort((a, b) => a.localeCompare(b))
                .map((metric) => ({ value: metric, label: metric }));
            return [{ value: null, label: '-' }, ...metricOptions];
        }
    },
    methods: {
        onChange() {
            this.propChanged('deviationMeta');
        },
        addDeviation() {
            const deviation = DeviationFactory();
            this.props.deviationMeta.deviations.push(deviation);
            this.onChange();
        },
        /**
         * @param {number} idx
         */
        deleteDeviation(idx) {
            this.props.deviationMeta.deviations.splice(idx, 1);
            this.onChange();
        }
    },
    ...PanelInstanceTypeDescriptor
};
</script>
