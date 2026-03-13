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

            <!-- ── Вид ───────────────────────────────────────────────── -->
            <div v-if="props.calMode !== 'compact'" class="p-section">
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

            <!-- ── Выбор дат / Выход в хранилище ──────────────────────── -->
            <div class="p-section">
                <div class="p-section__label">Хранилище (выход)</div>

                <!-- Compact mode: always range, just configure vars -->
                <template v-if="props.calMode === 'compact'">
                    <div class="p-hint" style="margin-bottom:8px">
                        Фильтр дат всегда работает как диапазон between.
                        Записывает выбранные даты в переменные хранилища.
                    </div>
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
                    </template>
                </template>

                <datalist :id="`store-list-${_uid}`">
                    <option v-for="v in storeVarNames" :key="v" :value="v" />
                </datalist>
            </div>

            <!-- ── Настройки компактного режима ───────────────────── -->
            <div v-if="props.calMode === 'compact'" class="p-section">
                <div class="p-section__label">Параметры календаря</div>

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
                    <span class="toggle-row__label">Нижняя панель (ввод дат)</span>
                    <div class="toggle" :class="{ 'toggle--on': props.calCompactShowBottom !== false }" @click="toggleBool('calCompactShowBottom')">
                        <div class="toggle__thumb" />
                    </div>
                </label>
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

const { store } = Managers.StoreManager;

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
