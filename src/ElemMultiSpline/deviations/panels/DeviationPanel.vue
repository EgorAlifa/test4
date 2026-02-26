<template>
    <ui-panel-container>
        <ui-container>
            <ui-select prop="deviationMeta.dimensionIndex" :options="dimensionOptions">
                <ui-hint>
                    <template #label>Источник данных отклонений</template>
                    Выбирается источник сравниваемой метрики, т.е. тот, который будет вычитаться из другого.
                </ui-hint>
            </ui-select>

            <ui-select prop="deviationMeta.mainSourceIdentifier" :options="dimensionNames">
                Измерение основного источника
            </ui-select>

            <ui-select prop="deviationMeta.addlSourceIdentifier" :options="dimensionNames">
                Измерение дополнительного источника
            </ui-select>

            <ui-collapse v-for="(deviation, idx) of props.deviationMeta.deviations" :key="idx">
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
        </ui-container>
    </ui-panel-container>
</template>

<script>
import { Panel, Dremio } from '@goodt-wcore/core';
import { DeviationType } from '../constants';

/**
 * @typedef {import('./DeviationDremioPanel').TInstance} TInstance
 * @type {TInstance}
 */
export const PanelInstanceTypeDescriptor = undefined;

const { Query } = Dremio;

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
const DeviationFactory = ({ name }) => ({
    name,
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
         * @return []
         */
        dimensionNames() {
            return [
                ...this.props.dremio.reduce((set, { dimensionList }) => {
                    Object.keys(dimensionList).forEach((dim) => {
                        set.add(dim);
                    });
                    return set;
                }, new Set())
            ];
        },
        /**
         * @return {DSelectOption[]}
         */
        dimensionOptions() {
            return this.props.dremio.map(({ query }, index) => ({
                value: `${index}`,
                label: `${query[Query.KEY.FROM].join('/')} [${index}]`
            }));
        },
        /**
         * @return {DSelectOption[]}
         */
        mainSourceMetricOptions() {
            if (this.props.dremio == null) {
                return [{ value: null, label: '-' }];
            }
            const metricOptions = this.props.dremio
                .map(({ query }) => Query.queryMetricNames(query))
                .flat()
                .sort((a, b) => a.localeCompare(b))
                .map((metric) => ({ value: metric, label: metric }));
            return [{ value: null, label: '-' }, ...metricOptions];
        },
        /**
         * @return {DSelectOption[]}
         */
        addlSourceMetricOptions() {
            const {
                props: {
                    dremio,
                    deviationMeta: { dimensionIndex }
                }
            } = this;
            if (dremio[dimensionIndex] == null) {
                return [{ value: null, label: '-' }];
            }
            const { query } = dremio[dimensionIndex];
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
            const deviation = DeviationFactory({ name: `Отклонение ${this.props.deviationMeta.deviations.length}` });
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
