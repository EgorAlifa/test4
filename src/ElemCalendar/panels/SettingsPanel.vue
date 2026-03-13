<template>
    <w-panel>
        <ui-container>

            <!-- ── Вид ───────────────────────────────────────────────── -->
            <div class="p-section">
                <div class="p-section__label">Вид и поведение</div>

                <div class="p-row p-row--col">
                    <span class="p-row__label">Вид по умолчанию</span>
                    <div class="seg-ctrl seg-ctrl--wrap">
                        <button
                            v-for="v in viewOptions"
                            :key="v.value"
                            class="seg-ctrl__btn"
                            :class="{ 'seg-ctrl__btn--active': props.calView === v.value }"
                            @click="setView(v.value)">
                            {{ v.label }}
                        </button>
                    </div>
                </div>

                <div class="p-row p-row--col">
                    <span class="p-row__label">Доступные виды</span>
                    <div class="check-group">
                        <label
                            v-for="v in allViews"
                            :key="v.value"
                            class="check-item">
                            <input
                                type="checkbox"
                                class="check-item__input"
                                :checked="isViewAvailable(v.value)"
                                @change="toggleView(v.value, $event.target.checked)" />
                            <span class="check-item__box" />
                            <span class="check-item__label">{{ v.label }}</span>
                        </label>
                    </div>
                </div>

                <div class="p-row">
                    <span class="p-row__label">Язык</span>
                    <div class="seg-ctrl">
                        <button
                            v-for="l in localeOptions"
                            :key="l.value"
                            class="seg-ctrl__btn"
                            :class="{ 'seg-ctrl__btn--active': props.calLocale === l.value }"
                            @click="setLocale(l.value)">
                            {{ l.label }}
                        </button>
                    </div>
                </div>

                <div class="p-row">
                    <span class="p-row__label">Первый день недели</span>
                    <div class="seg-ctrl">
                        <button
                            class="seg-ctrl__btn"
                            :class="{ 'seg-ctrl__btn--active': props.calFirstDay === 1 }"
                            @click="set('calFirstDay', 1)">Пн</button>
                        <button
                            class="seg-ctrl__btn"
                            :class="{ 'seg-ctrl__btn--active': props.calFirstDay === 0 }"
                            @click="set('calFirstDay', 0)">Вс</button>
                    </div>
                </div>
            </div>

            <!-- ── Выбор дат ─────────────────────────────────────────── -->
            <div class="p-section">
                <div class="p-section__label">Выбор дат</div>

                <div class="p-hint" style="margin-bottom:8px">
                    Клик по дате записывает значение в переменную хранилища.
                    Другие виджеты (таблицы, графики) могут использовать эту
                    переменную как фильтр — так и происходит синхронизация
                    с источником данных.
                </div>

                <div class="p-row">
                    <span class="p-row__label">Режим</span>
                    <div class="seg-ctrl">
                        <button
                            v-for="m in selModes"
                            :key="m.value"
                            class="seg-ctrl__btn"
                            :class="{ 'seg-ctrl__btn--active': props.calSelectionMode === m.value }"
                            @click="set('calSelectionMode', m.value)">
                            {{ m.label }}
                        </button>
                    </div>
                </div>

                <template v-if="props.calSelectionMode !== 'none'">
                    <ui-input
                        :value="props.calDateVar"
                        :list="`store-list-${_uid}`"
                        @input="set('calDateVar', $event)">
                        Переменная: выбранная дата
                    </ui-input>

                    <template v-if="props.calSelectionMode === 'range'">
                        <ui-input
                            :value="props.calStartVar"
                            :list="`store-list-${_uid}`"
                            @input="set('calStartVar', $event)">
                            Переменная: начало диапазона
                        </ui-input>
                        <ui-input
                            :value="props.calEndVar"
                            :list="`store-list-${_uid}`"
                            @input="set('calEndVar', $event)">
                            Переменная: конец диапазона
                        </ui-input>
                    </template>

                    <datalist :id="`store-list-${_uid}`">
                        <option v-for="v in storeVarNames" :key="v" :value="v" />
                    </datalist>
                </template>
            </div>

            <!-- ── События ──────────────────────────────────────────── -->
            <div class="p-section">
                <div class="p-section__label">События</div>

                <!-- Источники данных — краткая шпаргалка -->
                <div class="sources-map">
                    <div class="sources-map__row">
                        <span class="sources-map__badge sources-map__badge--store">Хранилище</span>
                        <span class="sources-map__text">Переменная → JSON-массив событий от других виджетов</span>
                    </div>
                    <div class="sources-map__row">
                        <span class="sources-map__badge sources-map__badge--static">Статика</span>
                        <span class="sources-map__text">Ручной ввод событий прямо здесь</span>
                    </div>
                    <div class="sources-map__row">
                        <span class="sources-map__badge sources-map__badge--dataset">Данные</span>
                        <span class="sources-map__text">Столбцы источника → маппинг в панели «Данные»</span>
                    </div>
                </div>

                <ui-input
                    :value="props.calEventsVar"
                    :list="`store-list-${_uid}`"
                    @input="set('calEventsVar', $event)">
                    Переменная хранилища (JSON-массив)
                </ui-input>
                <span class="p-hint" style="display:block;margin-top:-4px;margin-bottom:10px">
                    Если задана — берёт приоритет над статическими событиями ниже
                </span>

                <!-- ── Визуальный редактор событий ────────────────── -->
                <div class="p-field-label">Статические события</div>
                <div class="ev-list">
                    <div
                        v-for="(ev, idx) in localEvents"
                        :key="idx"
                        class="ev-card">
                        <div class="ev-card__head">
                            <input
                                class="ev-card__title-input"
                                :value="ev.title"
                                placeholder="Название"
                                @input="updateEvent(idx, 'title', $event.target.value)" />
                            <button class="ev-card__color-btn" @click="openEvColor(idx)">
                                <span class="ev-card__color-dot" :style="{ background: ev.color || '#4f6aff' }" />
                                <input
                                    :ref="`evclr_${idx}`"
                                    type="color"
                                    class="ev-card__color-input"
                                    :value="ev.color || '#4f6aff'"
                                    @input="updateEvent(idx, 'color', $event.target.value)"
                                    @click.stop />
                            </button>
                            <button class="ev-card__del" @click="removeEvent(idx)" title="Удалить">
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                    <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                                </svg>
                            </button>
                        </div>
                        <div class="ev-card__row">
                            <label class="ev-card__field">
                                <span>Дата</span>
                                <input type="date" :value="ev.date" @input="updateEvent(idx, 'date', $event.target.value)" />
                            </label>
                            <label class="ev-card__field">
                                <span>До</span>
                                <input type="date" :value="ev.endDate" @input="updateEvent(idx, 'endDate', $event.target.value)" />
                            </label>
                        </div>
                        <div class="ev-card__row">
                            <label class="ev-card__field">
                                <span>Начало</span>
                                <input type="time" :value="ev.startTime" @input="updateEvent(idx, 'startTime', $event.target.value)" />
                            </label>
                            <label class="ev-card__field">
                                <span>Конец</span>
                                <input type="time" :value="ev.endTime" @input="updateEvent(idx, 'endTime', $event.target.value)" />
                            </label>
                        </div>
                        <input
                            class="ev-card__desc-input"
                            :value="ev.desc"
                            placeholder="Описание (необязательно)"
                            @input="updateEvent(idx, 'desc', $event.target.value)" />
                    </div>
                    <div v-if="!localEvents.length" class="ev-empty">Нет событий</div>
                </div>
                <button class="ev-add-btn" @click="addEvent">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style="margin-right:5px">
                        <path d="M6 1v10M1 6h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    Добавить событие
                </button>
                <div class="ev-actions">
                    <button class="ev-action-btn ev-action-btn--demo" @click="loadDemoEvents" title="Загрузить реалистичные примеры событий">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style="margin-right:4px">
                            <path d="M6 1v5.5M6 6.5l-2-2M6 6.5l2-2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M1 9h10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                        </svg>
                        Демо-события
                    </button>
                    <button v-if="localEvents.length" class="ev-action-btn ev-action-btn--clear" @click="clearAllEvents" title="Удалить все события">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style="margin-right:4px">
                            <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                        </svg>
                        Очистить все
                    </button>
                </div>
            </div>

            <!-- ── Метрика / Тепловая карта ─────────────────────────── -->
            <div class="p-section">
                <div class="p-section__label">Метрика и тепловая карта</div>

                <label class="toggle-row">
                    <span class="toggle-row__label">Включить тепловую карту</span>
                    <div class="toggle" :class="{ 'toggle--on': props.calHeatmapEnabled }" @click="toggleBool('calHeatmapEnabled')">
                        <div class="toggle__thumb" />
                    </div>
                </label>
                <label class="toggle-row">
                    <span class="toggle-row__label">Показывать значение в ячейке</span>
                    <div class="toggle" :class="{ 'toggle--on': props.calHeatmapShowValue }" @click="toggleBool('calHeatmapShowValue')">
                        <div class="toggle__thumb" />
                    </div>
                </label>

                <ui-input
                    :value="props.calMetricVar"
                    :list="`store-list-${_uid}`"
                    @input="set('calMetricVar', $event)">
                    Переменная хранилища (метрика)
                </ui-input>
                <span class="p-hint" style="display:block;margin-top:-4px;margin-bottom:8px">
                    Массив <code>[{"date":"YYYY-MM-DD","value":42},…]</code> или объект <code>{"2026-03-01":42,…}</code>
                </span>

                <!-- ── Визуальный редактор метрики ───────────────── -->
                <div class="p-field-label">Статические значения метрики</div>
                <div class="ev-list">
                    <div
                        v-for="(pt, idx) in localMetric"
                        :key="idx"
                        class="metric-card">
                        <label class="ev-card__field" style="flex:2">
                            <span>Дата</span>
                            <input type="date" :value="pt.date" @input="updateMetricPoint(idx, 'date', $event.target.value)" />
                        </label>
                        <label class="ev-card__field" style="flex:1">
                            <span>Значение</span>
                            <input type="number" step="any" :value="pt.value" @input="updateMetricPoint(idx, 'value', $event.target.value)" />
                        </label>
                        <button class="ev-card__del" style="align-self:flex-end;margin-bottom:2px" @click="removeMetricPoint(idx)">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                            </svg>
                        </button>
                    </div>
                    <div v-if="!localMetric.length" class="ev-empty">Нет точек данных</div>
                </div>
                <button class="ev-add-btn" @click="addMetricPoint">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style="margin-right:5px">
                        <path d="M6 1v10M1 6h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    Добавить точку
                </button>
                <div class="ev-actions">
                    <button class="ev-action-btn ev-action-btn--demo" @click="loadDemoMetric" title="Сгенерировать демо-метрику">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style="margin-right:4px">
                            <path d="M1 10 L3 6 L5 8 L7 4 L9 6 L11 2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                        </svg>
                        Демо-метрика
                    </button>
                    <button v-if="localMetric.length" class="ev-action-btn ev-action-btn--clear" @click="clearMetric">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style="margin-right:4px">
                            <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                        </svg>
                        Очистить
                    </button>
                </div>
            </div>

            <!-- ── Отображение ───────────────────────────────────────── -->
            <div class="p-section">
                <div class="p-section__label">Элементы интерфейса</div>

                <label class="toggle-row">
                    <span class="toggle-row__label">Показывать шапку</span>
                    <div class="toggle" :class="{ 'toggle--on': props.calShowHeader }" @click="toggleBool('calShowHeader')">
                        <div class="toggle__thumb" />
                    </div>
                </label>
                <label class="toggle-row">
                    <span class="toggle-row__label">Переключатель видов</span>
                    <div class="toggle" :class="{ 'toggle--on': props.calShowViewSwitcher }" @click="toggleBool('calShowViewSwitcher')">
                        <div class="toggle__thumb" />
                    </div>
                </label>
                <label class="toggle-row">
                    <span class="toggle-row__label">Кнопка «Сегодня»</span>
                    <div class="toggle" :class="{ 'toggle--on': props.calShowTodayBtn }" @click="toggleBool('calShowTodayBtn')">
                        <div class="toggle__thumb" />
                    </div>
                </label>
                <label class="toggle-row">
                    <span class="toggle-row__label">Номера недель</span>
                    <div class="toggle" :class="{ 'toggle--on': props.calShowWeekNumbers }" @click="toggleBool('calShowWeekNumbers')">
                        <div class="toggle__thumb" />
                    </div>
                </label>
                <label class="toggle-row">
                    <span class="toggle-row__label">Показывать выходные</span>
                    <div class="toggle" :class="{ 'toggle--on': props.calShowWeekends }" @click="toggleBool('calShowWeekends')">
                        <div class="toggle__thumb" />
                    </div>
                </label>
            </div>

        </ui-container>
    </w-panel>
</template>

<script>
import { Panel, Managers } from 'goodt-wcore';
import { buildDemoEvents, buildDemoMetric } from '../constants';

const { store } = Managers.StoreManager;

export default {
    extends: Panel,
    meta: { name: 'Настройки', icon: 'cog' },

    data: () => ({
        localEvents: [],
        localMetric: [],
        allViews: [
            { value: 'month', label: 'Месяц' },
            { value: 'week', label: 'Неделя' },
            { value: 'day', label: 'День' },
            { value: 'agenda', label: 'Список' },
            { value: 'year', label: 'Год' }
        ],
        viewOptions: [
            { value: 'month', label: 'Месяц' },
            { value: 'week', label: 'Неделя' },
            { value: 'day', label: 'День' },
            { value: 'agenda', label: 'Список' },
            { value: 'year', label: 'Год' }
        ],
        localeOptions: [
            { value: 'ru', label: 'RU' },
            { value: 'en', label: 'EN' }
        ],
        selModes: [
            { value: 'none', label: 'Нет' },
            { value: 'single', label: 'Дата' },
            { value: 'range', label: 'Диапазон' }
        ]
    }),

    computed: {
        storeVarNames() {
            try { return Object.keys(store.state || {}).filter(Boolean).sort(); } catch (e) { return []; }
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
            const ev = { ...this.localEvents[idx], [field]: val };
            this.localEvents = this.localEvents.map((e, i) => i === idx ? ev : e);
            this._saveEvents();
        },

        openEvColor(idx) {
            const ref = this.$refs[`evclr_${idx}`];
            const el = Array.isArray(ref) ? ref[0] : ref;
            if (el) el.click();
        },

        toggleBool(key) {
            this.props[key] = !this.props[key];
            this.propChanged(key);
        },

        setView(v) {
            this.set('calView', v);
        },

        setLocale(l) {
            this.set('calLocale', l);
        },

        isViewAvailable(v) {
            const arr = this.props.calAvailableViews;
            return Array.isArray(arr) ? arr.includes(v) : true;
        },

        // ── Metric editor ────────────────────────────────────────────
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

        toggleView(v, checked) {
            let arr = Array.isArray(this.props.calAvailableViews)
                ? [...this.props.calAvailableViews]
                : ['month', 'week', 'day', 'agenda'];
            if (checked && !arr.includes(v)) arr.push(v);
            if (!checked) arr = arr.filter((x) => x !== v);
            this.set('calAvailableViews', arr);
        }
    }
};
</script>

<style scoped>
/* ── Sections ─────────────────────────────────────────────────── */
.p-section {
    margin-bottom: 16px;
    padding-bottom: 14px;
    border-bottom: 1px solid #f1f5f9;
}
.p-section:last-child { border-bottom: none; margin-bottom: 0; }

.p-section__label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #94a3b8;
    margin-bottom: 8px;
}

/* ── Row ──────────────────────────────────────────────────────── */
.p-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 6px;
}
.p-row--col { flex-direction: column; align-items: flex-start; }
.p-row__label { font-size: 12px; font-weight: 500; color: #334155; }

/* ── Segmented control ────────────────────────────────────────── */
.seg-ctrl {
    display: flex;
    background: #f1f5f9;
    border-radius: 7px;
    padding: 2px;
    gap: 1px;
}
.seg-ctrl--wrap {
    flex-wrap: wrap;
    width: 100%;
}
.seg-ctrl__btn {
    padding: 4px 10px;
    border: none;
    border-radius: 5px;
    background: transparent;
    color: #64748b;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.12s, color 0.12s;
    white-space: nowrap;
}
.seg-ctrl__btn:hover { color: #334155; }
.seg-ctrl__btn--active {
    background: #fff;
    color: #4f6aff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* ── Checkbox group ───────────────────────────────────────────── */
.check-group { display: flex; flex-wrap: wrap; gap: 6px 12px; margin-top: 4px; }
.check-item {
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    user-select: none;
}
.check-item__input { display: none; }
.check-item__box {
    width: 16px;
    height: 16px;
    border: 1.5px solid #cbd5e1;
    border-radius: 4px;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: border-color 0.12s, background 0.12s;
}
.check-item__input:checked + .check-item__box {
    background: #4f6aff;
    border-color: #4f6aff;
}
.check-item__input:checked + .check-item__box::after {
    content: '';
    width: 9px;
    height: 6px;
    border-left: 2px solid #fff;
    border-bottom: 2px solid #fff;
    transform: rotate(-45deg) translateY(-1px);
    display: block;
}
.check-item__label { font-size: 12px; color: #334155; font-weight: 500; }

/* ── Toggle ───────────────────────────────────────────────────── */
.toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 5px 0;
    cursor: pointer;
    gap: 8px;
}
.toggle-row__label { font-size: 12px; color: #334155; font-weight: 500; flex: 1; }

.toggle {
    width: 36px;
    height: 20px;
    border-radius: 10px;
    background: #e2e8f0;
    position: relative;
    flex-shrink: 0;
    transition: background 0.18s;
    cursor: pointer;
}
.toggle--on { background: #4f6aff; }
.toggle__thumb {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.18);
    transition: transform 0.18s;
}
.toggle--on .toggle__thumb { transform: translateX(16px); }

/* ── Textarea ─────────────────────────────────────────────────── */
.p-textarea {
    width: 100%;
    font-family: 'Consolas', 'Monaco', monospace;
    font-size: 11px;
    line-height: 1.55;
    padding: 8px 10px;
    background: #f8fafc;
    color: #1e293b;
    border: 1.5px solid #e2e8f0;
    border-radius: 8px;
    resize: vertical;
    box-sizing: border-box;
    outline: none;
    transition: border-color 0.15s;
}
.p-textarea:focus { border-color: #4f6aff; background: #fff; }

/* ── Hint ─────────────────────────────────────────────────────── */
.p-hint {
    font-size: 10px;
    color: #94a3b8;
    line-height: 1.5;
}
.p-hint code {
    font-family: monospace;
    background: #f1f5f9;
    padding: 1px 4px;
    border-radius: 3px;
    font-size: 10px;
    color: #4f6aff;
}
.p-field-label {
    font-size: 11px;
    font-weight: 600;
    color: #64748b;
    margin-bottom: 6px;
}

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
.ev-card__head {
    display: flex;
    align-items: center;
    gap: 6px;
}
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
    inset: 0;
    opacity: 0;
    cursor: pointer;
    width: 100%;
    height: 100%;
    padding: 0;
    border: none;
}
.ev-card__del {
    width: 22px;
    height: 22px;
    border: none;
    background: transparent;
    color: #94a3b8;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    flex-shrink: 0;
    transition: background 0.12s, color 0.12s;
}
.ev-card__del:hover { background: #fee2e2; color: #ef4444; }

.ev-card__row {
    display: flex;
    gap: 8px;
}
.ev-card__field {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
    min-width: 0;
}
.ev-card__field span {
    font-size: 9px;
    font-weight: 600;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}
.ev-card__field input {
    font-size: 11px;
    color: #334155;
    border: 1.5px solid #e2e8f0;
    border-radius: 5px;
    padding: 3px 6px;
    background: #fff;
    outline: none;
    width: 100%;
    box-sizing: border-box;
    transition: border-color 0.12s;
}
.ev-card__field input:focus { border-color: #4f6aff; }

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

.ev-actions {
    display: flex;
    gap: 6px;
    margin-top: 6px;
}
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
.ev-action-btn--demo {
    border-color: #c4b5fd;
    background: #faf5ff;
    color: #7c3aed;
}
.ev-action-btn--demo:hover { background: #ede9fe; border-color: #7c3aed; }
.ev-action-btn--clear {
    border-color: #fca5a5;
    background: #fff5f5;
    color: #ef4444;
}
.ev-action-btn--clear:hover { background: #fee2e2; border-color: #ef4444; }

/* ── Metric card editor ───────────────────────────────────────── */
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

/* ── Sources map ──────────────────────────────────────────────── */
.sources-map {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 9px;
    padding: 9px 11px;
    margin-bottom: 10px;
    display: flex;
    flex-direction: column;
    gap: 5px;
}
.sources-map__row {
    display: flex;
    align-items: center;
    gap: 7px;
}
.sources-map__badge {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    padding: 2px 7px;
    border-radius: 4px;
    flex-shrink: 0;
    white-space: nowrap;
}
.sources-map__badge--store  { background: #ede9fe; color: #6d28d9; }
.sources-map__badge--static { background: #dcfce7; color: #16a34a; }
.sources-map__badge--dataset{ background: #dbeafe; color: #1d4ed8; }
.sources-map__text {
    font-size: 10px;
    color: #64748b;
    line-height: 1.4;
}
</style>
