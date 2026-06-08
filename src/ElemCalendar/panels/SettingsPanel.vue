<template>
    <w-panel>
        <ui-container>

            <!-- ── Режим виджета ─────────────────────────────────────── -->
            <div class="p-section">
                <div class="p-section__label">Режим виджета</div>
                <div class="mode-cards">
                    <div
                        class="mode-card"
                        :class="{ 'mode-card--active': props.calMode !== 'compact' }"
                        @click="set('calMode', 'full')">
                        <div class="mode-card__icon">🗓</div>
                        <div class="mode-card__title">Полный календарь</div>
                        <div class="mode-card__desc">Месяц, неделя, день, список, год. Для порталов и мониторинга.</div>
                    </div>
                    <div
                        class="mode-card"
                        :class="{ 'mode-card--active': props.calMode === 'compact' }"
                        @click="set('calMode', 'compact')">
                        <div class="mode-card__icon">📅</div>
                        <div class="mode-card__title">Компактный календарь</div>
                        <div class="mode-card__desc">Компактный выбор диапазона between для дашбордов и отчётов.</div>
                    </div>
                </div>
            </div>

            <!-- ── Общие параметры (язык + первый день) ─────────────── -->
            <div class="p-section p-section--inline-row">
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

            <!-- ── Вид (только полный режим) ─────────────────────────── -->
            <div v-if="props.calMode !== 'compact'" class="p-section">
                <div class="p-section__label">Виды календаря</div>
                <div class="view-list">
                    <div v-for="v in allViews" :key="v.value" class="view-row">
                        <div
                            class="view-row__toggle"
                            :class="{ 'view-row__toggle--on': isViewAvailable(v.value) }"
                            @click="toggleView(v.value, !isViewAvailable(v.value))">
                            <div class="view-row__toggle-thumb" />
                        </div>
                        <span
                            class="view-row__label"
                            :class="{ 'view-row__label--off': !isViewAvailable(v.value) }">
                            {{ v.label }}
                        </span>
                        <button
                            class="view-row__star"
                            :class="{ 'view-row__star--active': props.calView === v.value }"
                            :disabled="!isViewAvailable(v.value)"
                            title="Открывается по умолчанию"
                            @click="setView(v.value)">
                            <i :class="props.calView === v.value ? 'mdi mdi-star' : 'mdi mdi-star-outline'" />
                        </button>
                    </div>
                </div>
                <div class="p-hint" style="margin-top:4px">Звёздочка — вид при открытии виджета</div>
            </div>

            <!-- ── Переменные хранилища ───────────────────────────────── -->
            <div class="p-section">
                <div class="p-section__label">Переменные хранилища</div>

                <!-- Compact mode: single or range -->
                <template v-if="props.calMode === 'compact'">
                    <div class="p-row" style="margin-bottom:8px">
                        <span class="p-row__label">Выбор</span>
                        <div class="seg-ctrl">
                            <button
                                class="seg-ctrl__btn"
                                :class="{ 'seg-ctrl__btn--active': props.calSelectionMode !== 'single' }"
                                @click="set('calSelectionMode', 'range')">
                                Диапазон
                            </button>
                            <button
                                class="seg-ctrl__btn"
                                :class="{ 'seg-ctrl__btn--active': props.calSelectionMode === 'single' }"
                                @click="set('calSelectionMode', 'single')">
                                Одиночный
                            </button>
                        </div>
                    </div>
                    <ui-input
                        :value="props.calDateVar"
                        :list="`store-list-${_uid}`"
                        @input="set('calDateVar', $event)">
                        Переменная: выбранная дата
                    </ui-input>
                    <template v-if="props.calSelectionMode !== 'single'">
                        <ui-input
                            :value="props.calStartVar"
                            :list="`store-list-${_uid}`"
                            @input="set('calStartVar', $event)">
                            Переменная: дата начала
                        </ui-input>
                        <ui-input
                            :value="props.calEndVar"
                            :list="`store-list-${_uid}`"
                            @input="set('calEndVar', $event)">
                            Переменная: дата конца
                        </ui-input>
                        <ui-input
                            :value="props.calRangeVar"
                            :list="`store-list-${_uid}`"
                            @input="set('calRangeVar', $event)">
                            Переменная: диапазон (массив)
                        </ui-input>
                        <div class="p-hint" style="margin:-4px 0 8px">
                            Если задана — в переменную пишется JSON-массив <strong>всех дат</strong> диапазона:
                            <code>["2024-01-01","2024-01-02","2024-01-03"]</code>.
                        </div>
                    </template>

                    <!-- ── Режим с временем ────────────────────────── -->
                    <label class="toggle-row">
                        <span class="toggle-row__label">Передавать timestamp (с временем)</span>
                        <div class="toggle" :class="{ 'toggle--on': props.calWithTime }" @click="toggleBool('calWithTime')">
                            <div class="toggle__thumb" />
                        </div>
                    </label>
                    <template v-if="props.calWithTime">
                        <div class="p-hint" style="margin:2px 0 8px">
                            Переменные получат Unix timestamp (мс). Ввод дат в формате <code>ДД.ММ.ГГГГ ЧЧ:мм</code>.
                            При выборе из календаря проставляется время по умолчанию.
                        </div>
                        <div class="p-row">
                            <span class="p-row__label">Время начала по умолчанию</span>
                            <input
                                type="text"
                                class="time-input"
                                :value="props.calDefaultStartTime"
                                placeholder="00:00"
                                @change="set('calDefaultStartTime', $event.target.value || '00:00')" />
                        </div>
                        <div class="p-row">
                            <span class="p-row__label">Время конца по умолчанию</span>
                            <input
                                type="text"
                                class="time-input"
                                :value="props.calDefaultEndTime"
                                placeholder="23:59"
                                @change="set('calDefaultEndTime', $event.target.value || '23:59')" />
                        </div>
                    </template>
                </template>

                <!-- Full mode: selection mode picker + vars -->
                <template v-else>
                    <div class="p-hint" style="margin-bottom:8px">
                        Клик по дате записывает значение в переменную хранилища.
                        Другие виджеты используют её как фильтр.
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

                        <!-- single / range: single-date var -->
                        <ui-input
                            v-if="props.calSelectionMode !== 'multi'"
                            :value="props.calDateVar"
                            :list="`store-list-${_uid}`"
                            @input="set('calDateVar', $event)">
                            Переменная: выбранная дата
                        </ui-input>

                        <!-- range: start + end vars -->
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

                        <!-- multi: single var receives the full array -->
                        <template v-if="props.calSelectionMode === 'multi'">
                            <div class="p-hint" style="margin-bottom:8px">
                                Кликните по нескольким датам — каждый клик добавляет или убирает дату.
                                Весь массив пишется в одну переменную хранилища в формате
                                <code>["2024-01-05","2024-01-12"]</code>.
                            </div>
                            <ui-input
                                :value="props.calDatesVar"
                                :list="`store-list-${_uid}`"
                                @input="set('calDatesVar', $event)">
                                Переменная: список дат (массив)
                            </ui-input>
                        </template>

                    </template>
                </template>

                <datalist :id="`store-list-${_uid}`">
                    <option v-for="v in storeVarNames" :key="v" :value="v" />
                </datalist>
            </div>

            <!-- ── Отображение (компактный режим) ──────────────────── -->
            <div v-if="props.calMode === 'compact'" class="p-section">
                <div class="p-section__label">Элементы интерфейса</div>

                <label class="toggle-row">
                    <span class="toggle-row__label">Показывать выходные</span>
                    <div class="toggle" :class="{ 'toggle--on': props.calShowWeekends }" @click="toggleBool('calShowWeekends')">
                        <div class="toggle__thumb" />
                    </div>
                </label>
                <label class="toggle-row">
                    <span class="toggle-row__label">Выделять «Сегодня»</span>
                    <div class="toggle" :class="{ 'toggle--on': props.calHighlightToday !== false }" @click="toggleBool('calHighlightToday')">
                        <div class="toggle__thumb" />
                    </div>
                </label>
                <label class="toggle-row">
                    <span class="toggle-row__label">Мини-календарь</span>
                    <div class="toggle" :class="{ 'toggle--on': props.calCompactShowCalendar !== false }" @click="toggleBool('calCompactShowCalendar')">
                        <div class="toggle__thumb" />
                    </div>
                </label>
                <label class="toggle-row">
                    <span class="toggle-row__label">Нижняя панель (ввод дат)</span>
                    <div class="toggle" :class="{ 'toggle--on': props.calCompactShowBottom !== false }" @click="toggleBool('calCompactShowBottom')">
                        <div class="toggle__thumb" />
                    </div>
                </label>
                <div v-if="props.calCompactShowBottom !== false" class="p-row" style="margin-top:4px">
                    <span class="p-row__label">Отступ между чипами</span>
                    <div class="num-unit-ctrl">
                        <input
                            type="number"
                            class="time-input num-unit-ctrl__num"
                            min="0"
                            step="0.5"
                            :value="chipsGapNum"
                            @change="setChipsGapNum($event.target.value)" />
                        <div class="seg-ctrl">
                            <button
                                v-for="u in ['px', 'rem', 'em']"
                                :key="u"
                                class="seg-ctrl__btn"
                                :class="{ 'seg-ctrl__btn--active': chipsGapUnit === u }"
                                @click="setChipsGapUnit(u)">{{ u }}</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ── Пресеты компактного режима ─────────────────────────── -->
            <div v-if="props.calMode === 'compact'" class="p-section">
                <div class="p-section__label">Кнопки-пресеты дат</div>

                <label class="toggle-row" style="margin-bottom:8px">
                    <span class="toggle-row__label">Показывать пресеты</span>
                    <div class="toggle" :class="{ 'toggle--on': props.calCompactShowPresets !== false }" @click="toggleBool('calCompactShowPresets')">
                        <div class="toggle__thumb" />
                    </div>
                </label>

                <template v-if="props.calCompactShowPresets !== false">
                    <label class="toggle-row" style="margin-bottom:8px">
                        <span class="toggle-row__label">Кнопка «Сегодня» в шапке</span>
                        <div class="toggle" :class="{ 'toggle--on': props.calCompactShowToday !== false }" @click="toggleBool('calCompactShowToday')">
                            <div class="toggle__thumb" />
                        </div>
                    </label>

                    <div class="p-row" style="margin-bottom:10px">
                        <span class="p-row__label">Колонок в ряду</span>
                        <input
                            type="number"
                            class="time-input"
                            min="0"
                            max="6"
                            :value="props.calPresetsColumns != null ? props.calPresetsColumns : 3"
                            @change="set('calPresetsColumns', Math.max(0, parseInt($event.target.value) || 0))" />
                    </div>

                    <div class="p-section__label" style="margin-bottom:4px">Список пресетов</div>
                    <div v-if="localPresets.length === 0" class="preset-empty">Пресеты не добавлены</div>
                    <div class="preset-cards">
                        <div v-for="(p, idx) in localPresets" :key="`${p.key}-${idx}`" class="preset-card">
                            <span class="preset-badge" :class="presetBadgeClass(p)">{{ presetTypeShort(p) }}</span>
                            <input
                                class="preset-card__input"
                                type="text"
                                :value="p.label"
                                @input="updatePreset(idx, $event.target.value)" />
                            <button class="preset-card__del" @click="removePreset(idx)">✕</button>
                        </div>
                    </div>

                    <!-- inline add form -->
                    <div v-if="!addingPreset" class="preset-add-trigger">
                        <button class="preset-add-trigger-btn" @click="startAddPreset">+ Добавить пресет</button>
                        <button class="preset-action-btn" @click="resetPresetsToDefault">По умолчанию</button>
                    </div>
                    <div v-else class="preset-add-form">
                        <input
                            class="preset-add-form__input"
                            type="text"
                            v-model="newPreset.label"
                            placeholder="Название кнопки" />
                        <div class="p-row" style="margin-top:6px">
                            <span class="p-row__label">Тип</span>
                            <div class="seg-ctrl">
                                <button
                                    v-for="t in presetTypes"
                                    :key="t.value"
                                    class="seg-ctrl__btn"
                                    :class="{ 'seg-ctrl__btn--active': newPreset.type === t.value }"
                                    @click="newPreset.type = t.value">{{ t.label }}</button>
                            </div>
                        </div>
                        <template v-if="newPreset.type === 'builtin'">
                            <div class="p-hint" style="margin-bottom:4px">Готовые пресеты рассчитываются относительно текущей даты.</div>
                            <select v-model="newPreset.builtinKey" class="preset-add-select">
                                <option v-for="b in builtinOptions" :key="b.key" :value="b.key">{{ b.label }}</option>
                            </select>
                        </template>
                        <template v-if="newPreset.type === 'fixed'">
                            <div class="p-hint" style="margin-bottom:4px">Фиксированный диапазон — даты не меняются.</div>
                            <div class="p-row">
                                <span class="p-row__label">Начало</span>
                                <input type="date" class="date-input" v-model="newPreset.start" />
                            </div>
                            <div class="p-row">
                                <span class="p-row__label">Конец</span>
                                <input type="date" class="date-input" v-model="newPreset.end" />
                            </div>
                        </template>
                        <template v-if="newPreset.type === 'relative'">
                            <div class="p-hint" style="margin-bottom:4px">Диапазон «последние N дней» от сегодня.</div>
                            <div class="p-row">
                                <span class="p-row__label">Количество дней</span>
                                <input type="number" class="time-input" min="1" max="3650" v-model.number="newPreset.daysBack" />
                            </div>
                        </template>
                        <div class="preset-add-form__actions">
                            <button class="preset-action-btn preset-action-btn--primary" @click="confirmAddPreset">Добавить</button>
                            <button class="preset-action-btn" @click="cancelAddPreset">Отмена</button>
                        </div>
                    </div>
                </template>
            </div>

            <!-- ── Отображение (полный режим) ──────────────────────── -->
            <div v-if="props.calMode !== 'compact'" class="p-section">
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
                    <span class="toggle-row__label">Выделять «Сегодня»</span>
                    <div class="toggle" :class="{ 'toggle--on': props.calHighlightToday !== false }" @click="toggleBool('calHighlightToday')">
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
                <label class="toggle-row">
                    <span class="toggle-row__label">Тепловая карта</span>
                    <div class="toggle" :class="{ 'toggle--on': props.calHeatmapEnabled }" @click="toggleBool('calHeatmapEnabled')">
                        <div class="toggle__thumb" />
                    </div>
                </label>
                <div v-if="props.calHeatmapEnabled" class="p-hint" style="margin:0 0 6px">
                    Привяжите столбец метрики в панели <strong>Данные</strong> (поле «Столбец метрики»),
                    затем укажите переменную хранилища или статичный JSON с данными метрики.
                </div>
                <label class="toggle-row">
                    <span class="toggle-row__label">Кнопка «Сброс» выделения</span>
                    <div class="toggle" :class="{ 'toggle--on': props.calShowResetBtn !== false }" @click="toggleBool('calShowResetBtn')">
                        <div class="toggle__thumb" />
                    </div>
                </label>
            </div>

        </ui-container>
    </w-panel>
</template>

<script>
import { Panel, Managers } from 'goodt-wcore';

const { store } = Managers.StoreManager;

const DEFAULT_PRESETS = [
    { key: 'yesterday',  label: 'Вчера' },
    { key: 'week',       label: 'Эта неделя' },
    { key: 'last_week',  label: 'Пр. неделя' },
    { key: 'month',      label: 'Этот месяц' },
    { key: 'last_month', label: 'Пр. месяц' }
];

export default {
    extends: Panel,
    meta: { name: 'Настройки', icon: 'cog' },

    data: () => ({
        allViews: [
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
            { value: 'range', label: 'Диапазон' },
            { value: 'multi', label: 'Несколько' }
        ],
        localPresets: [],
        addingPreset: false,
        newPreset: { label: '', type: 'builtin', builtinKey: 'today', start: '', end: '', daysBack: 7 }
    }),

    computed: {
        storeVarNames() {
            try { return Object.keys(store.state || {}).filter(Boolean).sort(); } catch (e) { return []; }
        },
        builtinOptions() {
            return [
                { key: 'today',      label: 'Сегодня' },
                { key: 'yesterday',  label: 'Вчера' },
                { key: 'week',       label: 'Эта неделя' },
                { key: 'last_week',  label: 'Прошлая неделя' },
                { key: 'month',      label: 'Этот месяц' },
                { key: 'last_month', label: 'Прошлый месяц' },
                { key: 'd7',         label: '7 дней' },
                { key: 'd30',        label: '30 дней' },
                { key: 'd90',        label: '90 дней' },
                { key: 'year',       label: 'Этот год' }
            ];
        },
        presetTypes() {
            return [
                { value: 'builtin',  label: 'Готовый' },
                { value: 'fixed',    label: 'Даты' },
                { value: 'relative', label: 'N дней' }
            ];
        },
        chipsGapNum() {
            const m = (this.props.calCompactChipsGap || '').match(/^([\d.]+)/);
            return m ? parseFloat(m[1]) : 4;
        },
        chipsGapUnit() {
            const m = (this.props.calCompactChipsGap || '').match(/(px|rem|em)$/);
            return m ? m[1] : 'px';
        }
    },

    watch: {
        'props.calPresetsJson': {
            immediate: true,
            handler(val) {
                try {
                    const parsed = val ? JSON.parse(val) : null;
                    if (Array.isArray(parsed)) { this.localPresets = parsed; return; }
                } catch (e) { /* fall through */ }
                this.localPresets = DEFAULT_PRESETS.map(p => ({ ...p }));
            }
        }
    },

    methods: {
        set(key, val) {
            this.props[key] = val;
            this.propChanged(key);
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

        toggleView(v, checked) {
            let arr = Array.isArray(this.props.calAvailableViews)
                ? [...this.props.calAvailableViews]
                : ['month', 'week', 'day', 'agenda'];
            if (checked && !arr.includes(v)) arr.push(v);
            if (!checked) arr = arr.filter((x) => x !== v);
            this.set('calAvailableViews', arr);
        },

        _savePresets() {
            this.set('calPresetsJson', JSON.stringify(this.localPresets));
        },

        updatePreset(idx, label) {
            this.localPresets = this.localPresets.map((p, i) => i === idx ? { ...p, label } : p);
            this._savePresets();
        },

        removePreset(idx) {
            this.localPresets = this.localPresets.filter((_, i) => i !== idx);
            this._savePresets();
        },

        startAddPreset() {
            this.newPreset = { label: '', type: 'builtin', builtinKey: 'today', start: '', end: '', daysBack: 7 };
            this.addingPreset = true;
        },

        confirmAddPreset() {
            const type = this.newPreset.type;
            let preset;
            if (type === 'builtin') {
                const def = this.builtinOptions.find(b => b.key === this.newPreset.builtinKey);
                const label = this.newPreset.label.trim() || (def ? def.label : this.newPreset.builtinKey);
                preset = { key: this.newPreset.builtinKey, label };
            } else if (type === 'fixed') {
                const start = this.newPreset.start;
                if (!start) return;
                const label = this.newPreset.label.trim() || `${start} — ${this.newPreset.end || start}`;
                preset = { key: `fixed_${Date.now()}`, label, start, end: this.newPreset.end || start };
            } else {
                const days = Math.max(1, this.newPreset.daysBack || 7);
                const label = this.newPreset.label.trim() || `Последние ${days} дней`;
                preset = { key: `rel_${Date.now()}`, label, daysBack: days };
            }
            this.localPresets = [...this.localPresets, preset];
            this._savePresets();
            this.addingPreset = false;
        },

        cancelAddPreset() {
            this.addingPreset = false;
        },

        presetBadgeClass(p) {
            if (p.start != null) return 'preset-badge--fixed';
            if (p.daysBack != null) return 'preset-badge--relative';
            return 'preset-badge--builtin';
        },

        presetTypeShort(p) {
            if (p.start != null) return 'дата';
            if (p.daysBack != null) return `-${p.daysBack}д`;
            return 'авто';
        },

        resetPresetsToDefault() {
            this.localPresets = DEFAULT_PRESETS.map(p => ({ ...p }));
            this._savePresets();
        },

        setChipsGapNum(val) {
            const num = parseFloat(val);
            if (isNaN(num) || num < 0) return;
            this.set('calCompactChipsGap', `${num}${this.chipsGapUnit}`);
        },

        setChipsGapUnit(unit) {
            this.set('calCompactChipsGap', `${this.chipsGapNum}${unit}`);
        }
    }
};
</script>

<style scoped>
/* ── Mode cards ───────────────────────────────────────────────── */
.mode-cards {
    display: flex;
    gap: 8px;
    margin-bottom: 4px;
}
.mode-card {
    flex: 1;
    border: 1.5px solid #e2e8f0;
    border-radius: 10px;
    padding: 10px 8px;
    text-align: center;
    cursor: pointer;
    background: #f8fafc;
    transition: border-color 0.15s, background 0.15s;
}
.mode-card--active {
    border-color: #4f6aff;
    background: #eef1ff;
}
.mode-card__icon { font-size: 20px; line-height: 1; margin-bottom: 4px; }
.mode-card__title { font-size: 11px; font-weight: 700; color: #334155; margin-bottom: 2px; }
.mode-card__desc { font-size: 10px; color: #94a3b8; line-height: 1.4; }

/* ── Sections ─────────────────────────────────────────────────── */
.p-section {
    margin-bottom: 6px;
    padding-bottom: 6px;
    border-bottom: 1px solid #f1f5f9;
}
.p-section:last-child { border-bottom: none; margin-bottom: 0; }

.p-section--inline-row {
    padding-bottom: 2px;
    margin-bottom: 2px;
}

.p-section__label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #94a3b8;
    margin-bottom: 4px;
}

/* ── Row ──────────────────────────────────────────────────────── */
.p-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 4px;
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

/* ── View list ────────────────────────────────────────────────── */
.view-list { display: flex; flex-direction: column; gap: 2px; }
.view-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 0;
}
.view-row__toggle {
    width: 28px;
    height: 16px;
    border-radius: 8px;
    background: #e2e8f0;
    position: relative;
    flex-shrink: 0;
    cursor: pointer;
    transition: background 0.18s;
}
.view-row__toggle--on { background: #4f6aff; }
.view-row__toggle-thumb {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 1px 3px rgba(0,0,0,0.18);
    transition: transform 0.18s;
}
.view-row__toggle--on .view-row__toggle-thumb { transform: translateX(12px); }
.view-row__label {
    flex: 1;
    font-size: 12px;
    font-weight: 500;
    color: #334155;
    transition: color 0.12s;
}
.view-row__label--off { color: #cbd5e1; }
.view-row__star {
    border: none;
    background: transparent;
    font-size: 16px;
    line-height: 1;
    color: #cbd5e1;
    cursor: pointer;
    padding: 0 2px;
    flex-shrink: 0;
    transition: color 0.12s, transform 0.1s;
}
.view-row__star:not(:disabled):hover { color: #f59e0b; transform: scale(1.2); }
.view-row__star--active { color: #f59e0b; }
.view-row__star:disabled { opacity: 0.2; cursor: not-allowed; }

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

/* ── Preset management ────────────────────────────────────────── */
.preset-empty {
    font-size: 11px;
    color: #94a3b8;
    padding: 4px 0;
    font-style: italic;
}
.preset-cards {
    display: flex;
    flex-direction: column;
    gap: 3px;
    margin-bottom: 6px;
}
.preset-card {
    display: flex;
    align-items: center;
    gap: 4px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 4px 6px;
}
.preset-badge {
    font-size: 9px;
    font-weight: 700;
    padding: 1px 5px;
    border-radius: 4px;
    white-space: nowrap;
    flex-shrink: 0;
    line-height: 1.5;
}
.preset-badge--builtin  { background: #eef1ff; color: #4f6aff; }
.preset-badge--fixed    { background: #f0fdf4; color: #16a34a; }
.preset-badge--relative { background: #fff7ed; color: #ea580c; }
.preset-card__input {
    flex: 1;
    font-size: 11px;
    border: none;
    background: transparent;
    color: #334155;
    outline: none;
    min-width: 0;
    padding: 0;
}
.preset-card__input:focus { color: #1e293b; }
.preset-card__del {
    border: none;
    background: transparent;
    color: #94a3b8;
    cursor: pointer;
    font-size: 11px;
    padding: 0 2px;
    flex-shrink: 0;
    line-height: 1;
    transition: color 0.12s;
}
.preset-card__del:hover { color: #ef4444; }

.preset-add-trigger {
    display: flex;
    gap: 6px;
    margin-top: 2px;
}
.preset-add-trigger-btn {
    flex: 1;
    font-size: 11px;
    font-weight: 600;
    border: 1.5px dashed #cbd5e1;
    border-radius: 6px;
    background: transparent;
    color: #4f6aff;
    padding: 5px 0;
    cursor: pointer;
    transition: border-color 0.12s, background 0.12s;
}
.preset-add-trigger-btn:hover { border-color: #4f6aff; background: #f5f7ff; }

.preset-add-form {
    background: #f8fafc;
    border: 1.5px solid #e2e8f0;
    border-radius: 8px;
    padding: 8px;
    margin-top: 4px;
}
.preset-add-form__input {
    width: 100%;
    font-size: 12px;
    border: 1.5px solid #e2e8f0;
    border-radius: 6px;
    padding: 5px 8px;
    background: #fff;
    color: #334155;
    outline: none;
    box-sizing: border-box;
    transition: border-color 0.12s;
}
.preset-add-form__input:focus { border-color: #4f6aff; }
.preset-add-form__input::placeholder { color: #94a3b8; }
.preset-add-form__actions {
    display: flex;
    gap: 6px;
    margin-top: 8px;
}
.preset-add-select {
    width: 100%;
    font-size: 11px;
    border: 1.5px solid #e2e8f0;
    border-radius: 6px;
    padding: 5px 8px;
    background: #fff;
    color: #334155;
    outline: none;
    box-sizing: border-box;
    cursor: pointer;
}
.date-input {
    font-size: 11px;
    border: 1.5px solid #e2e8f0;
    border-radius: 6px;
    padding: 4px 8px;
    background: #fff;
    color: #334155;
    outline: none;
    transition: border-color 0.12s;
}
.date-input:focus { border-color: #4f6aff; }

.preset-action-btn {
    flex: 1;
    font-size: 11px;
    font-weight: 600;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    background: #fff;
    color: #64748b;
    padding: 5px 0;
    cursor: pointer;
    transition: background 0.12s;
}
.preset-action-btn:hover { background: #f1f5f9; }
.preset-action-btn--primary {
    background: #4f6aff;
    border-color: #4f6aff;
    color: #fff;
}
.preset-action-btn--primary:hover { background: #3b55e6; }

/* ── Number + unit control ────────────────────────────────────── */
.num-unit-ctrl {
    display: flex;
    align-items: center;
    gap: 4px;
}
.num-unit-ctrl__num {
    width: 52px;
}

/* ── Time input ───────────────────────────────────────────────── */
.time-input {
    width: 72px;
    font-size: 12px;
    font-weight: 600;
    color: #334155;
    border: 1.5px solid #e2e8f0;
    border-radius: 6px;
    padding: 4px 8px;
    background: #fff;
    outline: none;
    text-align: center;
    transition: border-color 0.12s;
}
.time-input:focus { border-color: #4f6aff; }

/* ── Var select ───────────────────────────────────────────────── */
.p-var-select {
    width: 100%;
    font-size: 12px;
    color: #334155;
    border: 1.5px solid #e2e8f0;
    border-radius: 7px;
    padding: 5px 8px;
    background: #fff;
    outline: none;
    box-sizing: border-box;
    transition: border-color 0.12s;
    cursor: pointer;
}
.p-var-select:focus { border-color: #4f6aff; }
</style>
