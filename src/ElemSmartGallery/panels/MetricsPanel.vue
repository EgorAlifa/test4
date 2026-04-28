<template>
    <ui-panel-container>
        <ui-container>
            <ui-select
                v-for="({ label }, key) in MetricMeta"
                v-model="props.metrics[key]"
                :options="metricOptions"
                :key="key"
                @change="propChanged('metrics')">
                {{ label }}
            </ui-select>

            <ui-switch prop="isSaveFirstMetricValue"></ui-switch>

            <ui-switch prop="isDremioPaginationLimit">
                <template #hint>
                    <div>
                        Для источников фильтрации снимает дефолтное (равное 1) ограничение на количество получаемых
                        строк
                    </div>
                    <div>из источника для работы правил и использует установленное ограничение в пагинации.</div>
                    <div>
                        Данная настройка корректно работает только с операторами массива - is null, is not null, in, not
                        in.
                    </div>
                </template>
            </ui-switch>
        </ui-container>
    </ui-panel-container>
</template>
<script>
import { Panel } from '@goodt-wcore/panel';
import { usePanelDatasetMixin, PanelDatasetMixinTypes, DatasetQueryModelFactory } from '@goodt-common/data';
import { MetricMeta } from '../constants';
import { DATASET_ADDITIONAL_PROP } from '../descriptor';
import UiContainer from './components/UiContainer.vue';

export default {
    extends: Panel,
    components: { UiContainer },
    mixins: [usePanelDatasetMixin()],
    meta: { name: 'Измерения/Метрики', icon: 'focus-field-horizontal' },
    static: { MetricMeta },
    data: () => ({
        ...PanelDatasetMixinTypes
    }),
    computed: {
        metricOptions() {
            return this.buildOptions([...new Set([...this.dimensionsMetrics, ...this.additionalMetricDimensions])], {
                empty: true
            });
        },
        additionalMetricDimensions() {
            const queries = this.props[DATASET_ADDITIONAL_PROP] ?? [];
            const models = queries.map(({ query }) => DatasetQueryModelFactory(query));
            return models
                .map(({ metrics, dimensions }) => [...metrics, ...dimensions])
                .flat()
                .sort((a, b) => a.localeCompare(b));
        }
    }
};
</script>
