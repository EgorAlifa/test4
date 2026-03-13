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

            <!-- ── Статические события ──────────────────────────────── -->
            <div class="p-section">
                <div class="p-section__label">Статические события</div>
                <div class="p-hint" style="margin-bottom:10px">
                    События, заданные вручную. Отображаются поверх данных из источника.
                    Цвет задаётся здесь — не зависит от источника.
                </div>

                <div v-if="localEvents.length === 0" class="ev-empty">Нет событий</div>

                <div class="ev-list">
                    <div v-for="(ev, idx) in localEvents" :key="idx" class="ev-card">
                        <div class="ev-card__head">
                            <button class="ev-card__color-btn" @click="openEvColor(idx)">
                                <span class="ev-card__color-dot" :style="{ background: ev.color || '#4f6aff' }"></span>
                                <input
                                    :ref="`evclr_${idx}`"
                                    type="color"
                                    class="ev-card__color-input"
                                    :value="ev.color || '#4f6aff'"
                                    @input="updateEvent(idx, 'color', $event.target.value)" />
                            </button>
                            <input
                                class="ev-card__title-input"
                                type="text"
                                placeholder="Название события"
                                :value="ev.title"
                                @input="updateEvent(idx, 'title', $event.target.value)" />
                            <button class="ev-card__del" @click="removeEvent(idx)">✕</button>
                        </div>
                        <div class="ev-card__row">
                            <div class="ev-card__field">
                                <div class="ev-card__field-label">Дата начала</div>
                                <input type="date" class="ev-card__input" :value="ev.date"
                                    @input="updateEvent(idx, 'date', $event.target.value)" />
                            </div>
                            <div class="ev-card__field">
                                <div class="ev-card__field-label">Дата конца</div>
                                <input type="date" class="ev-card__input" :value="ev.endDate"
                                    @input="updateEvent(idx, 'endDate', $event.target.value)" />
                            </div>
                        </div>
                        <div class="ev-card__row">
                            <div class="ev-card__field">
                                <div class="ev-card__field-label">Начало</div>
                                <input type="time" class="ev-card__input" :value="ev.startTime"
                                    @input="updateEvent(idx, 'startTime', $event.target.value)" />
                            </div>
                            <div class="ev-card__field">
                                <div class="ev-card__field-label">Конец</div>
                                <input type="time" class="ev-card__input" :value="ev.endTime"
                                    @input="updateEvent(idx, 'endTime', $event.target.value)" />
                            </div>
                        </div>
                        <textarea class="ev-card__desc-input" rows="2" placeholder="Описание (необязательно)"
                            :value="ev.desc"
                            @input="updateEvent(idx, 'desc', $event.target.value)"></textarea>
                    </div>
                </div>

                <button class="ev-add-btn" @click="addEvent">+ Добавить событие</button>

                <div class="ev-actions">
                    <button class="ev-action-btn ev-action-btn--demo" @click="loadDemoEvents">Демо-события</button>
                    <button class="ev-action-btn ev-action-btn--clear" @click="clearAllEvents">Очистить</button>
                </div>
            </div>

            <!-- ── Статическая метрика ──────────────────────────────── -->
            <div class="p-section">
                <div class="p-section__label">Статическая метрика</div>
                <div class="p-hint" style="margin-bottom:10px">
                    Тепловая карта по вручную заданным значениям.
                    Задайте дату и числовое значение для каждой точки.
                </div>

                <div v-if="localMetric.length === 0" class="ev-empty">Нет точек</div>

                <div class="metric-list">
                    <div v-for="(pt, idx) in localMetric" :key="idx" class="metric-card">
                        <div class="ev-card__field" style="flex:1">
                            <div class="ev-card__field-label">Дата</div>
                            <input type="date" class="ev-card__input" :value="pt.date"
                                @input="updateMetricPoint(idx, 'date', $event.target.value)" />
                        </div>
                        <div class="ev-card__field" style="flex:1">
                            <div class="ev-card__field-label">Значение</div>
                            <input type="number" class="ev-card__input" :value="pt.value"
                                @input="updateMetricPoint(idx, 'value', $event.target.value)" />
                        </div>
                        <button class="ev-card__del" style="align-self:flex-end;margin-bottom:2px" @click="removeMetricPoint(idx)">✕</button>
                    </div>
                </div>

                <button class="ev-add-btn" @click="addMetricPoint">+ Добавить точку</button>

                <div class="ev-actions">
                    <button class="ev-action-btn ev-action-btn--demo" @click="loadDemoMetric">Демо-данные</button>
                    <button class="ev-action-btn ev-action-btn--clear" @click="clearMetric">Очистить</button>
                </div>
            </div>

        </ui-container>
    </w-panel>
</template>

<script>
import { Panel } from 'goodt-wcore';
import { usePanelDatasetMixin, PanelDatasetMixinTypes } from '@goodt-common/data';
import { buildDemoEvents, buildDemoMetric } from '../constants';

export default {
    extends: Panel,
    mixins: [usePanelDatasetMixin()],
    meta: { name: 'Данные', icon: 'database' },

    data: () => ({
        ...PanelDatasetMixinTypes,
        localEvents: [],
        localMetric: []
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
    },

    watch: {
        'props.calEventsJson': {
            immediate: true,
            handler(val) {
                try {
                    const parsed = val ? JSON.parse(val) : [];
                    if (Array.isArray(parsed)) this.localEvents = parsed;
                } catch (e) { /* keep current */ }
            }
        },
        'props.calMetricJson': {
            immediate: true,
            handler(val) {
                try {
                    const parsed = val ? JSON.parse(val) : [];
                    if (Array.isArray(parsed)) this.localMetric = parsed;
                    else if (parsed && typeof parsed === 'object') {
                        this.localMetric = Object.entries(parsed).map(([date, value]) => ({ date, value: String(value) }));
                    }
                } catch (e) { /* keep current */ }
            }
        }
    },

    methods: {
        set(key, val) {
            this.props[key] = val;
            this.propChanged(key);
        },

        // ── Events ──────────────────────────────────────────────────
        _saveEvents() {
            this.set('calEventsJson', JSON.stringify(this.localEvents));
        },

        addEvent() {
            const today = new Date();
            const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            this.localEvents = [...this.localEvents, { title: '', date: iso, color: '#4f6aff', endDate: '', startTime: '', endTime: '', desc: '' }];
            this._saveEvents();
        },

        removeEvent(idx) {
            this.localEvents = this.localEvents.filter((_, i) => i !== idx);
            this._saveEvents();
        },

        updateEvent(idx, field, val) {
            this.localEvents = this.localEvents.map((e, i) => i === idx ? { ...e, [field]: val } : e);
            this._saveEvents();
        },

        openEvColor(idx) {
            const ref = this.$refs[`evclr_${idx}`];
            const el = Array.isArray(ref) ? ref[0] : ref;
            if (el) el.click();
        },

        loadDemoEvents() {
            const now = new Date();
            this.localEvents = buildDemoEvents(now.getFullYear(), now.getMonth() + 1);
            this._saveEvents();
        },

        clearAllEvents() {
            this.localEvents = [];
            this._saveEvents();
        },

        // ── Metric ──────────────────────────────────────────────────
        _saveMetric() {
            this.set('calMetricJson', JSON.stringify(this.localMetric));
        },

        addMetricPoint() {
            const today = new Date();
            const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            this.localMetric = [...this.localMetric, { date: iso, value: '0' }];
            this._saveMetric();
        },

        removeMetricPoint(idx) {
            this.localMetric = this.localMetric.filter((_, i) => i !== idx);
            this._saveMetric();
        },

        updateMetricPoint(idx, field, val) {
            this.localMetric = this.localMetric.map((p, i) => i === idx ? { ...p, [field]: val } : p);
            this._saveMetric();
        },

        loadDemoMetric() {
            const now = new Date();
            this.localMetric = buildDemoMetric(now.getFullYear(), now.getMonth() + 1).map((p) => ({ date: p.date, value: String(p.value) }));
            this._saveMetric();
        },

        clearMetric() {
            this.localMetric = [];
            this._saveMetric();
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
.flow-steps { display: flex; flex-direction: column; gap: 6px; }
.flow-step { display: flex; align-items: flex-start; gap: 8px; }
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
.flow-step__text { font-size: 11px; color: #0c4a6e; line-height: 1.45; }

/* ── Event editor ─────────────────────────────────────────────── */
.ev-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 8px; }
.ev-empty { font-size: 11px; color: #94a3b8; text-align: center; padding: 10px 0; }

.ev-card {
    border: 1.5px solid #e2e8f0;
    border-radius: 10px;
    padding: 9px 10px;
    background: #f8fafc;
    display: flex;
    flex-direction: column;
    gap: 6px;
}
.ev-card__head { display: flex; align-items: center; gap: 6px; }
.ev-card__title-input {
    flex: 1;
    font-size: 12px;
    font-weight: 600;
    color: #1e293b;
    border: none;
    background: transparent;
    outline: none;
    min-width: 0;
    padding: 0;
}
.ev-card__title-input::placeholder { color: #cbd5e1; font-weight: 400; }

.ev-card__color-btn {
    position: relative;
    width: 20px;
    height: 20px;
    border: none;
    background: transparent;
    padding: 0;
    cursor: pointer;
    flex-shrink: 0;
}
.ev-card__color-dot {
    display: block;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: 2px solid rgba(0,0,0,0.12);
}
.ev-card__color-input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
    pointer-events: none;
}
.ev-card__del {
    border: none;
    background: transparent;
    color: #94a3b8;
    cursor: pointer;
    font-size: 12px;
    padding: 2px 4px;
    border-radius: 4px;
    flex-shrink: 0;
    line-height: 1;
}
.ev-card__del:hover { color: #ef4444; background: #fee2e2; }

.ev-card__row { display: flex; gap: 8px; }
.ev-card__field { display: flex; flex-direction: column; gap: 3px; flex: 1; }
.ev-card__field-label { font-size: 10px; color: #94a3b8; font-weight: 600; }
.ev-card__input {
    font-size: 11px;
    color: #334155;
    border: 1.5px solid #e2e8f0;
    border-radius: 5px;
    padding: 4px 7px;
    background: #fff;
    outline: none;
    width: 100%;
    box-sizing: border-box;
    transition: border-color 0.12s;
}
.ev-card__input:focus { border-color: #4f6aff; }
.ev-card__desc-input {
    font-size: 11px;
    color: #334155;
    border: 1.5px solid #e2e8f0;
    border-radius: 5px;
    padding: 4px 7px;
    background: #fff;
    outline: none;
    width: 100%;
    box-sizing: border-box;
    resize: vertical;
    font-family: inherit;
    transition: border-color 0.12s;
}
.ev-card__desc-input::placeholder { color: #cbd5e1; }
.ev-card__desc-input:focus { border-color: #4f6aff; }

.ev-add-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 7px;
    border: 1.5px dashed #cbd5e1;
    border-radius: 8px;
    background: transparent;
    color: #64748b;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: border-color 0.12s, color 0.12s, background 0.12s;
}
.ev-add-btn:hover { border-color: #4f6aff; color: #4f6aff; background: #f5f7ff; }

.ev-actions { display: flex; gap: 6px; margin-top: 6px; }
.ev-action-btn {
    display: flex;
    align-items: center;
    flex: 1;
    justify-content: center;
    padding: 6px 8px;
    border-radius: 7px;
    border: 1.5px solid;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.12s, color 0.12s, border-color 0.12s;
}
.ev-action-btn--demo { border-color: #c4b5fd; background: #faf5ff; color: #7c3aed; }
.ev-action-btn--demo:hover { background: #ede9fe; border-color: #7c3aed; }
.ev-action-btn--clear { border-color: #fca5a5; background: #fff5f5; color: #ef4444; }
.ev-action-btn--clear:hover { background: #fee2e2; border-color: #ef4444; }

/* ── Metric editor ─────────────────────────────────────────────── */
.metric-list { display: flex; flex-direction: column; gap: 6px; margin-bottom: 8px; }
.metric-card {
    border: 1.5px solid #e2e8f0;
    border-radius: 10px;
    padding: 8px 10px;
    background: #f8fafc;
    display: flex;
    flex-direction: row;
    align-items: flex-end;
    gap: 8px;
}
</style>
