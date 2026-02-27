<template>
    <w-panel>
        <ui-container>

            <!-- ── Header card ──────────────────────────────────────────── -->
            <div class="metric-card" :class="{ 'metric-card--active': !!props.metricName }">
                <div class="metric-card__ico">
                    <i class="mdi mdi-gauge" />
                </div>
                <div class="metric-card__body">
                    <div class="metric-card__title">Метрика анализа</div>
                    <div
                        class="metric-card__sub"
                        :class="props.metricName ? 'metric-card__sub--set' : 'metric-card__sub--empty'"
                    >
                        <template v-if="props.metricName">
                            <i class="mdi mdi-check-circle-outline" />
                            {{ props.metricName }}
                        </template>
                        <template v-else>
                            <i class="mdi mdi-alert-circle-outline" />
                            Не выбрана
                        </template>
                    </div>
                </div>
            </div>

            <!-- ── Select ────────────────────────────────────────────────── -->
            <div class="field-label">Выберите метрику</div>
            <ui-select
                v-model="props.metricName"
                :options="metricOptions"
                @change="propChanged('metricName')"
            >
                Метрика
            </ui-select>

            <!-- ── Hint ──────────────────────────────────────────────────── -->
            <div class="info-box">
                <i class="mdi mdi-information-outline info-box__icon" />
                <span>Одна метрика, отображаемая в узлах дерева. Значения сравниваются между собой на каждом уровне разбивки.</span>
            </div>

        </ui-container>
    </w-panel>
</template>

<script>
import { Panel } from '@goodt-wcore/panel';
import { usePanelDatasetMixin, PanelDatasetMixinTypes } from '@goodt-common/data';

export default {
    extends: Panel,
    mixins: [usePanelDatasetMixin()],

    meta: { name: 'Метрики', icon: 'gauge' },

    data() {
        return {
            ...PanelDatasetMixinTypes
        };
    },

    computed: {
        metricOptions() {
            return this.buildOptions(this.metrics || [], { empty: true });
        }
    }
};
</script>

<style scoped>
/* ── Metric header card ────────────────────────────────────────── */
.metric-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    border: 1.5px solid #e2e8f0;
    border-radius: 12px;
    background: #f8fafc;
    margin-bottom: 14px;
    transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
}
.metric-card--active {
    border-color: #86efac;
    background: linear-gradient(135deg, #f0fdf4, #dcfce7);
    box-shadow: 0 2px 8px rgba(34, 197, 94, 0.12);
}

.metric-card__ico {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: #e2e8f0;
    color: #64748b;
    font-size: 20px;
    flex-shrink: 0;
    transition: background 0.15s, color 0.15s;
}
.metric-card--active .metric-card__ico {
    background: #bbf7d0;
    color: #15803d;
}

.metric-card__body { flex: 1; min-width: 0; }
.metric-card__title {
    font-size: 13px;
    font-weight: 700;
    color: #1e293b;
    line-height: 1.3;
}
.metric-card__sub {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    margin-top: 2px;
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.metric-card__sub--set   { color: #16a34a; }
.metric-card__sub--empty { color: #94a3b8; font-style: italic; }
.metric-card__sub .mdi   { font-size: 13px; flex-shrink: 0; }

/* ── Field label ───────────────────────────────────────────────── */
.field-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #94a3b8;
    margin-bottom: 6px;
}

/* ── Info box ──────────────────────────────────────────────────── */
.info-box {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 9px 11px;
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    border-radius: 8px;
    font-size: 11px;
    color: #1e40af;
    line-height: 1.5;
    margin-top: 10px;
}
.info-box__icon {
    font-size: 14px;
    color: #3b82f6;
    flex-shrink: 0;
    margin-top: 1px;
}
</style>
