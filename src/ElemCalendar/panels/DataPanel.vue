<template>
    <w-panel>
        <ui-container>

            <div class="p-section__label">Источник данных</div>

            <!-- Dimension: date column -->
            <ui-select
                prop="dimension"
                :options="dimensionOptions"
                label="Столбец дат (измерение)" />

            <!-- Metric: data column -->
            <ui-select
                prop="metrics.date"
                :options="metricOptions"
                label="Метрика данных" />

            <div class="p-hint">
                Выбранное измерение используется для подсветки дат в календаре,
                у которых есть данные в источнике.
                При клике на такую дату метрика передаётся в хранилище.
            </div>

        </ui-container>
    </w-panel>
</template>

<script>
import { Panel } from 'goodt-wcore';
import { usePanelDatasetMixin, PanelDatasetMixinTypes } from '@goodt-common/data';

export default {
    extends: Panel,
    mixins: [usePanelDatasetMixin()],
    meta: { name: 'Данные', icon: 'database' },

    data: () => ({
        ...PanelDatasetMixinTypes
    }),

    computed: {
        dimensionOptions() {
            return this.buildOptions(this.dimensions, { empty: true });
        },
        metricOptions() {
            return this.buildOptions([...this.dimensions, ...this.metrics], { empty: true });
        }
    }
};
</script>

<style scoped>
.p-section__label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #94a3b8;
    margin-bottom: 8px;
}
.p-hint {
    font-size: 11px;
    color: #94a3b8;
    line-height: 1.5;
    margin-top: 8px;
    padding: 8px 10px;
    background: #f8fafc;
    border-radius: 7px;
    border: 1px solid #e2e8f0;
}
</style>
