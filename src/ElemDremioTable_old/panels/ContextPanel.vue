<template>
    <w-panel>
        <ui-container>
            <ui-select :options="dimensionNames" v-model="props.filterValueKey" @change="propChanged('filterValueKey')">
                Измерение для фильтрации контекста
            </ui-select>
            <ui-switch v-model="props.canRowToggleItself" @change="propChanged('canRowToggleItself')">
                Раскрывать кликом по строке
            </ui-switch>

            <ui-collapse>
                <template #header>Фильтр через оператор %Like%</template>
                <ui-select prop="filterLikeFields" multiple :options="metricDimensionOptions">
                    Метрики, измерения
                </ui-select>
            </ui-collapse>

            <ui-switch prop="shouldShimBlockTable">
                Не блокировать таблицу прелоадером
                <template #hint>Когда включено, таблица не блокируется и доступна для кликов мышью</template>
            </ui-switch>
        </ui-container>
    </w-panel>
</template>

<script>
import { Panel } from '@goodt-wcore/panel';
import { Query } from '@goodt-common/dremio';
import { PanelInstanceTypeDescriptor } from '../types';

export default {
    extends: Panel,
    data: () => ({
        /** @public */
        $meta: { name: 'Настройки контекста', icon: 'table-arrow-down' },
        ...PanelInstanceTypeDescriptor
    }),
    computed: {
        /**
         * @return {{label: string, value: any}[]}
         */
        dimensionNames() {
            const { dremio } = this.props;
            const defaultOption = { label: '-', value: null };
            if (dremio == null) {
                return [defaultOption];
            }
            return [defaultOption, ...Object.keys(dremio.dimensionList).map((value) => ({ label: value, value }))];
        },
        metricDimensionOptions() {
            const { dremio } = this.props;
            if (dremio == null) {
                return [];
            }
            return [...Query.queryMetricNames(dremio.query), ...Object.keys(dremio.dimensionList)].sort();
        }
    }
};
</script>
