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

            <ui-switch prop="isSaveFirstMetricValue">
                {{ descriptor.props.isSaveFirstMetricValue.label }}
            </ui-switch>

            <ui-switch prop="isDremioPaginationLimit">
                <ui-hint>
                    <template #label>Ограничение из пагинации</template>
                    Для источников фильтрации снимает дефолтное (равное 1) ограничение на количество получаемых строк из
                    источника для работы правил и использует установленное ограничение в пагинации.
                    <br />
                    Данная настройка корректно работает только с операторами массива - is null, is not null, in, not in.
                </ui-hint>
            </ui-switch>
        </ui-container>
    </ui-panel-container>
</template>
<script>
import { Panel } from '@goodt-wcore/core';
import { Query } from '@goodt-common/dremio';
import { PanelInstanceTypeDescriptor } from '../types';
import { MetricMeta } from '../constants';
import UiContainer from './components/UiContainer.vue';

export default {
    extends: Panel,
    components: { UiContainer },
    static: { MetricMeta },
    data: () => ({
        /**
         * @public
         */
        $meta: { name: 'Измерения/Метрики', icon: 'focus-field-horizontal' },
        ...PanelInstanceTypeDescriptor
    }),
    computed: {
        metricOptions() {
            const { dremio } = this.props;
            if (dremio == null) {
                return [];
            }
            const { query, dimensionList } = dremio;
            const options = [...Query.queryMetricNames(query), ...Object.keys(dimensionList)].map((value) => ({
                label: value,
                value
            }));
            return [{ value: null, label: '—' }, ...options];
        }
    }
};
</script>
