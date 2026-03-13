<template>
    <w-panel>
        <ui-container>

            <!-- ── Источник данных ──────────────────────────────────── -->
            <div class="p-section__label">Источник данных</div>

            <ui-select
                prop="dimension"
                :options="dimensionOptions"
                label="Столбец дат (измерение)" />

            <div class="p-hint">
                Выберите столбец с датами — он становится основой для отображения
                событий и тепловой карты. При клике на дату метрика передаётся в хранилище.
            </div>

            <!-- ── Маппинг событий ──────────────────────────────────── -->
            <div class="p-section">
                <div class="p-section__label">Маппинг в события</div>
                <div class="p-hint" style="margin-bottom:8px">
                    Укажите, какие столбцы становятся полями каждого события.
                    «Столбец дат» обязателен — остальные необязательны.
                </div>

                <ui-select
                    prop="calDataTitleCol"
                    :options="allColOptions"
                    label="Заголовок события" />
                <ui-select
                    prop="calDataColorCol"
                    :options="allColOptions"
                    label="Цвет (hex или CSS)" />
                <ui-select
                    prop="calDataStartTimeCol"
                    :options="allColOptions"
                    label="Время начала (HH:MM)" />
                <ui-select
                    prop="calDataEndTimeCol"
                    :options="allColOptions"
                    label="Время конца (HH:MM)" />
                <ui-select
                    prop="calDataDescCol"
                    :options="allColOptions"
                    label="Описание" />
            </div>

            <!-- ── Тепловая карта ───────────────────────────────────── -->
            <div class="p-section">
                <div class="p-section__label">Метрика / тепловая карта</div>
                <div class="p-hint" style="margin-bottom:8px">
                    Числовой столбец, значения которого окрашивают ячейки
                    по градиенту (мин → макс). Включите «Тепловую карту»
                    в панели «Настройки».
                </div>

                <ui-select
                    prop="calMetricDataCol"
                    :options="metricOptions"
                    label="Столбец метрики" />
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
        allColOptions() {
            return this.buildOptions([...this.dimensions, ...this.metrics], { empty: true });
        },
        metricOptions() {
            return this.buildOptions(this.metrics, { empty: true });
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
.p-section {
    margin-top: 14px;
    padding-top: 14px;
    border-top: 1px solid #f1f5f9;
}
.p-hint {
    font-size: 11px;
    color: #94a3b8;
    line-height: 1.5;
    margin-top: 6px;
    padding: 8px 10px;
    background: #f8fafc;
    border-radius: 7px;
    border: 1px solid #e2e8f0;
}
</style>
