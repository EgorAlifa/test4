<template>
    <w-panel>
        <ui-container>

            <!-- ── Как работает подключение ────────────────────────── -->
            <div class="flow-block">
                <div class="flow-block__title">Как это работает</div>
                <div class="flow-steps">
                    <div class="flow-step">
                        <span class="flow-step__num">1</span>
                        <span class="flow-step__text">Выберите <b>столбец дат</b> — он связывает строки источника с ячейками календаря</span>
                    </div>
                    <div class="flow-step">
                        <span class="flow-step__num">2</span>
                        <span class="flow-step__text">Укажите остальные столбцы (необязательно) — они станут полями события</span>
                    </div>
                    <div class="flow-step">
                        <span class="flow-step__num">3</span>
                        <span class="flow-step__text">При клике на дату значение уходит в хранилище → используйте его как фильтр в других виджетах</span>
                    </div>
                </div>
            </div>

            <!-- ── Столбец дат ──────────────────────────────────────── -->
            <div class="p-section__label" style="margin-top:4px">Столбец дат <span class="req-badge">обязательный</span></div>

            <ui-select
                prop="dimension"
                :options="dimensionOptions"
                label="Столбец с датами" />

            <div class="p-hint">
                Строки с одинаковой датой группируются в одно событие.
                Формат: <code>YYYY-MM-DD</code> или совместимый.
            </div>

            <!-- ── Маппинг в события ──────────────────────────────────── -->
            <div class="p-section">
                <div class="p-section__label">Поля события из источника</div>
                <div class="p-hint" style="margin-bottom:8px">
                    Все поля необязательны. Если столбец не выбран — поле остаётся пустым.
                </div>

                <ui-select
                    prop="calDataTitleCol"
                    :options="allColOptions"
                    label="Название события" />

                <ui-select
                    prop="calDataStartTimeCol"
                    :options="allColOptions"
                    label="Время начала (ЧЧ:ММ)" />

                <ui-select
                    prop="calDataEndTimeCol"
                    :options="allColOptions"
                    label="Время конца (ЧЧ:ММ)" />

                <ui-select
                    prop="calDataDescCol"
                    :options="allColOptions"
                    label="Описание" />

                <ui-select
                    prop="calDataColorCol"
                    :options="allColOptions"
                    label="Цвет (необязательно)" />

                <div class="p-hint p-hint--info">
                    <b>Цвет:</b> если в каждой строке есть цвет категории (например
                    <code>#4f6aff</code> или <code>red</code>) — события окрасятся
                    по-разному. Иначе используется цвет из панели «Внешний вид».
                </div>
            </div>

            <!-- ── Тепловая карта ────────────────────────────────────── -->
            <div class="p-section">
                <div class="p-section__label">Метрика / тепловая карта</div>
                <div class="p-hint" style="margin-bottom:8px">
                    Числовой столбец — значения окрашивают ячейки по градиенту.
                    Включите «Тепловую карту» в панели «Настройки».
                </div>

                <ui-select
                    prop="calMetricDataCol"
                    :options="metricOptions"
                    label="Столбец числовой метрики" />
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
    display: flex;
    align-items: center;
    gap: 6px;
}
.req-badge {
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    background: #fef9c3;
    color: #854d0e;
    border: 1px solid #fde68a;
    padding: 1px 6px;
    border-radius: 4px;
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
.p-hint--info {
    background: #eff6ff;
    border-color: #bfdbfe;
    color: #1e40af;
    margin-top: 8px;
}
.p-hint code {
    font-family: monospace;
    background: rgba(0,0,0,0.07);
    padding: 1px 4px;
    border-radius: 3px;
    font-size: 10px;
}

/* ── How-it-works block ─────────────────────────────────────── */
.flow-block {
    background: #f0f9ff;
    border: 1px solid #bae6fd;
    border-radius: 9px;
    padding: 10px 12px;
    margin-bottom: 12px;
}
.flow-block__title {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: #0369a1;
    margin-bottom: 8px;
}
.flow-steps {
    display: flex;
    flex-direction: column;
    gap: 6px;
}
.flow-step {
    display: flex;
    align-items: flex-start;
    gap: 8px;
}
.flow-step__num {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #0ea5e9;
    color: #fff;
    font-size: 10px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-top: 1px;
}
.flow-step__text {
    font-size: 11px;
    color: #0c4a6e;
    line-height: 1.45;
}
</style>
