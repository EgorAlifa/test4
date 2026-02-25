<template>
    <w-panel>
        <ui-container>

            <!-- ── Обзор: что делает кнопка ──────────────────────────────── -->
            <div class="act-status">
                <div
                    v-for="a in actionSummary"
                    :key="a.key"
                    class="act-status__chip"
                    :class="{ 'act-status__chip--on': a.active }">
                    <i :class="['mdi', a.icon]" />
                    <span>{{ a.label }}</span>
                    <span v-if="a.count" class="act-status__count">{{ a.count }}</span>
                </div>
            </div>

            <!-- ── Ссылка ──────────────────────────────────────────────────── -->
            <div
                class="sec-hd"
                :class="{ 'sec-hd--accent-blue': props.url }"
                @click="openLink = !openLink">
                <span class="sec-hd__ico sec-hd__ico--blue">
                    <i class="mdi mdi-link-variant" />
                </span>
                <div class="sec-hd__text">
                    <div class="sec-hd__title">Ссылка для перехода</div>
                    <div v-if="props.url" class="sec-hd__sub">{{ truncUrl(props.url) }}</div>
                    <div v-else class="sec-hd__sub sec-hd__sub--dim">Не задана</div>
                </div>
                <i class="mdi sec-hd__chev" :class="openLink ? 'mdi-chevron-up' : 'mdi-chevron-down'" />
            </div>
            <div v-show="openLink" class="sec-body sec-body--blue">
                <ui-input-url prop="url" />
                <ui-switch v-if="props.url" prop="isTargetBlank">Открыть в новой вкладке</ui-switch>
            </div>

            <!-- ── Событие ────────────────────────────────────────────────── -->
            <div
                class="sec-hd"
                :class="{ 'sec-hd--accent-amber': eventName.length }"
                @click="openEvent = !openEvent">
                <span class="sec-hd__ico sec-hd__ico--amber">
                    <i class="mdi mdi-lightning-bolt" />
                </span>
                <div class="sec-hd__text">
                    <div class="sec-hd__title">Событие при нажатии</div>
                    <div v-if="eventName.length" class="sec-hd__sub">{{ eventName.join(', ') }}</div>
                    <div v-else class="sec-hd__sub sec-hd__sub--dim">Не задано</div>
                </div>
                <i class="mdi sec-hd__chev" :class="openEvent ? 'mdi-chevron-up' : 'mdi-chevron-down'" />
            </div>
            <div v-show="openEvent" class="sec-body sec-body--amber">
                <ui-input-tags v-model="eventName">
                    Событие
                    <ui-tooltip>
                        <template #target="{ events, binds }">
                            <span class="mdi mdi-help-circle-outline" v-on="events" v-bind="binds" />
                        </template>
                        <div>Отправляет сигнал виджету «Событие».</div>
                    </ui-tooltip>
                </ui-input-tags>
            </div>

            <!-- ── Переключатель ──────────────────────────────────────────── -->
            <div
                class="sec-hd"
                :class="{ 'sec-hd--accent-green': props.btnIsToggle }"
                @click="openToggle = !openToggle">
                <span class="sec-hd__ico" :class="props.btnIsToggle ? 'sec-hd__ico--green' : 'sec-hd__ico--grey'">
                    <i :class="['mdi', props.btnIsToggle ? 'mdi-toggle-switch' : 'mdi-toggle-switch-off-outline']" />
                </span>
                <div class="sec-hd__text">
                    <div class="sec-hd__title">Кнопка-переключатель</div>
                    <div class="sec-hd__sub" :class="props.btnIsToggle ? '' : 'sec-hd__sub--dim'">
                        {{ props.btnIsToggle ? 'Включён' : 'Выключен' }}
                    </div>
                </div>
                <i class="mdi sec-hd__chev" :class="openToggle ? 'mdi-chevron-up' : 'mdi-chevron-down'" />
            </div>
            <div v-show="openToggle" class="sec-body sec-body--green">
                <ui-switch prop="btnIsToggle">
                    Включить переключатель
                    <ui-tooltip>
                        <template #target="{ events, binds }">
                            <span class="mdi mdi-help-circle-outline" v-on="events" v-bind="binds" />
                        </template>
                        <div>Кнопка выглядит «нажатой», пока переменная равна заданному значению.</div>
                    </ui-tooltip>
                </ui-switch>
                <template v-if="props.btnIsToggle">
                    <ui-select
                        v-if="storeVarOptions.length"
                        v-model="toggleStoreVar"
                        :options="toggleVarOptions">
                        Переменная
                    </ui-select>
                    <ui-input prop="btnToggleActiveValue" placeholder="1">
                        Значение «активно»
                    </ui-input>
                </template>
            </div>

            <!-- ── Расширенные действия ───────────────────────────────────── -->
            <ui-collapse>
                <template #header>
                    Расширенные действия
                    <span v-if="hasAdvancedActions" class="badge">{{ advancedActionsCount }}</span>
                </template>
                <ui-container>

                    <!-- Установить переменные хранилища -->
                    <div class="adv-label">
                        <i class="mdi mdi-database-edit-outline" />
                        Установить переменные
                    </div>
                    <div
                        v-for="(filter, i) in props.filters"
                        :key="i"
                        class="var-row">
                        <!-- Variable name: select from store if vars available, else free text -->
                        <div class="var-row__name">
                            <ui-select
                                v-if="storeEntries.length"
                                v-model="filter.name"
                                :options="filterVarOptions"
                                @change="onFilterChange(filter, i)">
                                Переменная
                            </ui-select>
                            <ui-input
                                v-else
                                v-model="filter.name"
                                :list="`store-vars-${_uid}`"
                                @change="onFilterChange(filter, i)">
                                Переменная
                            </ui-input>
                            <div
                                v-if="filter.name && storeEntries.some(e => e.name === filter.name)"
                                class="var-row__current">
                                <i class="mdi mdi-database-arrow-right-outline" />
                                Сейчас: <strong>{{ getStoreVal(filter.name) }}</strong>
                            </div>
                        </div>
                        <!-- Value -->
                        <div class="var-row__val">
                            <ui-input
                                :value="getFilterData(filter)"
                                @input="(val) => setFilterData(filter, val)"
                                @change="onFilterChange(filter, i)">
                                Значение
                            </ui-input>
                        </div>
                        <button class="var-row__del" @click="onFilterDelete(filter)">
                            <i class="mdi mdi-close" />
                        </button>
                    </div>
                    <datalist :id="`store-vars-${_uid}`">
                        <option v-for="v in storeVarNames" :key="v" :value="v" />
                    </datalist>
                    <ui-button type="ghost" @click="onFilterAdd">+ Добавить</ui-button>

                    <!-- Очистить переменные -->
                    <div class="adv-label">
                        <i class="mdi mdi-database-remove-outline" />
                        Очистить при нажатии
                    </div>
                    <ui-select
                        v-if="storeVarOptions.length"
                        v-model="cutParams"
                        multiple
                        :options="storeVarOptions">
                        Переменные для очистки
                    </ui-select>
                    <ui-input-tags v-else v-model="cutParams">Переменные для очистки</ui-input-tags>

                    <!-- Передать в URL -->
                    <template v-if="props.url && storeVarOptions.length">
                        <div class="adv-label">
                            <i class="mdi mdi-link-plus" />
                            Передать переменные в ссылку
                        </div>
                        <div
                            v-for="(filter, i) in props.urlFilters"
                            :key="i"
                            class="var-row">
                            <div class="var-row__name">
                                <ui-select
                                    v-model="filter.name"
                                    :options="storeVarOptions"
                                    @change="onUrlFilterChange">
                                    Переменная
                                </ui-select>
                            </div>
                            <button class="var-row__del" @click="onUrlFilterDelete(i)">
                                <i class="mdi mdi-close" />
                            </button>
                        </div>
                        <ui-button type="ghost" @click="onUrlFilterAdd">+ Добавить</ui-button>
                    </template>

                    <!-- Сохранить в URL страницы -->
                    <ui-select
                        v-if="routeQueryParamOptions.length > 0 && !props.url"
                        v-model="routeQueryParamNames"
                        multiple
                        :options="routeQueryParamOptions">
                        Сохранить в URL страницы
                    </ui-select>

                    <!-- Хранилище: мини-обзор -->
                    <ui-collapse v-if="storeEntries.length">
                        <template #header>
                            <i class="mdi mdi-database-eye-outline" />
                            Хранилище
                            <span class="badge">{{ storeEntries.length }}</span>
                        </template>
                        <div class="store-table">
                            <div
                                v-for="entry in storeEntries"
                                :key="entry.name"
                                class="store-row"
                                @click="copyToClipboard(entry.name)">
                                <span class="store-row__name">{{ entry.name }}</span>
                                <span
                                    class="store-row__val"
                                    :class="{
                                        'store-row__val--null':  entry.isNull,
                                        'store-row__val--array': entry.isArray,
                                        'store-row__val--obj':   entry.isObject
                                    }">
                                    {{ entry.display }}
                                </span>
                            </div>
                        </div>
                    </ui-collapse>

                </ui-container>
            </ui-collapse>

            <!-- ── Прочее ─────────────────────────────────────────────────── -->
            <ui-collapse>
                <template #header>Прочее</template>
                <ui-container>
                    <ui-switch prop="btnLoadingOnClick">
                        Индикатор загрузки после нажатия
                    </ui-switch>
                    <ui-select
                        v-if="storeVarOptions.length"
                        v-model="disableVar"
                        :options="disableVarOptions">
                        Заблокировать если переменная пуста
                        <ui-tooltip>
                            <template #target="{ events, binds }">
                                <span class="mdi mdi-help-circle-outline" v-on="events" v-bind="binds" />
                            </template>
                            <div>Кнопка становится недоступной, пока переменная пуста.</div>
                        </ui-tooltip>
                    </ui-select>
                    <ui-switch prop="isClickSelf">
                        Игнорировать клики внутри виджета
                    </ui-switch>
                    <ui-switch prop="isSaveUrlForStore">
                        Режим ElemHouseApi
                    </ui-switch>
                </ui-container>
            </ui-collapse>

        </ui-container>
    </w-panel>
</template>

<script>
import { Panel, Managers } from 'goodt-wcore';
import { Tooltip as UiTooltip } from 'goodteditor-ui';

/**
 * @typedef {import('./OptionsPanel').TInstance} TInstance
 * @type {TInstance}
 */
const ComponentInstanceTypeDescriptor = undefined;

const { store } = Managers.StoreManager;

export default {
    extends: Panel,
    meta: { name: 'Настройки виджета', icon: 'cog' },
    components: { UiTooltip },
    data: () => ({
        ...ComponentInstanceTypeDescriptor,
        openLink: false,
        openEvent: false,
        openToggle: false
    }),
    computed: {
        storeVarNames() {
            try { return Object.keys(store.state || {}).filter(Boolean).sort(); } catch (e) { return []; }
        },
        storeVarOptions() {
            return this.storeVarNames.map((k) => ({ label: k, value: k }));
        },
        /** Full store entries with formatted display values */
        storeEntries() {
            try {
                return Object.entries(store.state || {})
                    .filter(([k]) => k)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([name, val]) => {
                        const isNull = val === null || val === undefined;
                        const isArray = Array.isArray(val);
                        const isObject = !isNull && !isArray && typeof val === 'object';
                        return {
                            name,
                            isNull,
                            isArray,
                            isObject,
                            display: this.formatStoreVal(val)
                        };
                    });
            } catch (e) { return []; }
        },
        /** Options for filter variable select with current value in label */
        filterVarOptions() {
            return [
                { label: '— выбрать переменную —', value: '' },
                ...this.storeEntries.map(({ name, display }) => ({
                    value: name,
                    label: `${name}  (${display})`
                }))
            ];
        },
        toggleVarOptions() {
            return [{ label: '—', value: '' }, ...this.storeVarOptions];
        },
        disableVarOptions() {
            return [{ label: '— Нет —', value: '' }, ...this.storeVarOptions];
        },
        routeQueryParamOptions() {
            return this.props.filters.map(({ name, data }) => ({ label: name, value: String(data) }));
        },
        hasAdvancedActions() {
            return this.props.filters.length > 0 ||
                this.cutParams.length > 0 ||
                this.props.urlFilters.length > 0;
        },
        advancedActionsCount() {
            return this.props.filters.length +
                this.cutParams.length +
                this.props.urlFilters.length;
        },
        actionSummary() {
            return [
                {
                    key: 'link',
                    label: 'Ссылка',
                    icon: 'mdi-link-variant',
                    active: !!this.props.url
                },
                {
                    key: 'event',
                    label: 'Событие',
                    icon: 'mdi-lightning-bolt',
                    active: this.eventName.length > 0,
                    count: this.eventName.length || null
                },
                {
                    key: 'toggle',
                    label: 'Тоггл',
                    icon: 'mdi-toggle-switch',
                    active: this.props.btnIsToggle
                },
                {
                    key: 'adv',
                    label: 'Действия',
                    icon: 'mdi-filter-variant',
                    active: this.hasAdvancedActions,
                    count: this.hasAdvancedActions ? this.advancedActionsCount : null
                }
            ];
        },
        routeQueryParamNames: {
            get() { return this.props.routeQueryParamNames.map((p) => String(p.value)); },
            set(value) {
                this.props.routeQueryParamNames = this.routeQueryParamOptions.filter((o) => value.includes(o.value));
                this.propChanged('routeQueryParamNames');
            }
        },
        eventName: {
            get() { return this.descriptor.props.eventName.getCompat(this.props.eventName); },
            set(val) { this.props.eventName = val.map((el) => el.trim()); this.propChanged('eventName'); }
        },
        cutParams: {
            get() { return this.descriptor.props.cutParams.getCompat(this.props.cutParams); },
            set(val) {
                this.props.cutParams = Array.isArray(val) ? val.map((el) => el.trim()) : [];
                this.propChanged('cutParams');
            }
        },
        toggleStoreVar: {
            get() { return this.props.btnToggleStoreVar || ''; },
            set(val) { this.props.btnToggleStoreVar = val; this.propChanged('btnToggleStoreVar'); }
        },
        disableVar: {
            get() { return this.props.btnDisableVar || ''; },
            set(val) { this.props.btnDisableVar = val; this.propChanged('btnDisableVar'); }
        }
    },
    mounted() {
        this.openLink = !!this.props.url;
        this.openEvent = this.eventName.length > 0;
        this.openToggle = this.props.btnIsToggle;
    },
    methods: {
        truncUrl(url) {
            if (!url) return '';
            const max = 28;
            return url.length > max ? `${url.slice(0, max)}…` : url;
        },
        formatStoreVal(val) {
            if (val === null || val === undefined) return '∅';
            if (typeof val === 'boolean') return val ? 'true' : 'false';
            if (Array.isArray(val)) return `[${val.length} эл.]`;
            if (typeof val === 'object') return `{${Object.keys(val).length} кл.}`;
            const s = String(val);
            return s.length > 22 ? `${s.slice(0, 22)}…` : s || '—';
        },
        getStoreVal(name) {
            try { return this.formatStoreVal(store.state[name]); } catch (e) { return '—'; }
        },
        copyToClipboard(text) {
            try { navigator.clipboard.writeText(text); } catch (e) { /* noop */ }
        },
        setFilterData(filter, data) {
            try { filter.data = JSON.parse(data); } catch (e) { /* noop */ }
        },
        getFilterData({ data }) {
            try { return JSON.stringify(data); } catch (e) { return String(data); }
        },
        saveFilters() {
            this.props.filters = this.props.filters.filter(({ name }) => name.length > 0);
            this.propChanged('filters');
        },
        onFilterChange({ name }, index) {
            if (!name) return;
            const { filters } = this.props;
            const dup = filters.findIndex((el) => el.name === name);
            if (dup !== index && dup >= 0) filters.splice(dup, 1);
            this.saveFilters();
        },
        onFilterDelete(filter) {
            this.props.filters = this.props.filters.filter((el) => el !== filter);
            this.saveFilters();
        },
        onFilterAdd() {
            this.props.filters.push(this.descriptor.props.filters.factory());
        },
        saveUrlFilters() {
            this.props.urlFilters = this.props.urlFilters.filter(({ name }) => name.length > 0);
            this.propChanged('urlFilters');
        },
        onUrlFilterAdd() {
            this.props.urlFilters.push(this.descriptor.props.urlFilters.factory());
        },
        onUrlFilterDelete(index) {
            this.props.urlFilters = this.props.urlFilters.filter((_, i) => i !== index);
            this.saveUrlFilters();
        },
        onUrlFilterChange() {
            this.saveUrlFilters();
        }
    }
};
</script>

<style scoped>
/* ── Action status strip ────────────────────────────────────────── */
.act-status {
    display: flex;
    gap: 5px;
    flex-wrap: wrap;
    margin-bottom: 6px;
}
.act-status__chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 9px;
    border-radius: 20px;
    border: 1.5px solid #e2e8f0;
    background: #f8fafc;
    color: #94a3b8;
    font-size: 11px;
    font-weight: 600;
    transition: border-color 0.15s, background 0.15s, color 0.15s;
}
.act-status__chip--on {
    border-color: #a5b4fc;
    background: #eff2ff;
    color: #4f6aff;
}
.act-status__chip .mdi { font-size: 13px; }
.act-status__count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 16px;
    height: 16px;
    border-radius: 8px;
    background: #4f6aff;
    color: #fff;
    font-size: 10px;
    font-weight: 700;
    padding: 0 3px;
}

/* ── Section accordion header ───────────────────────────────────── */
.sec-hd {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 10px;
    cursor: pointer;
    background: #fff;
    border: 1.5px solid #e0e6ef;
    margin-top: 5px;
    transition: border-color 0.15s, background 0.15s, box-shadow 0.15s, transform 0.1s;
    user-select: none;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
.sec-hd:hover {
    border-color: #a5b4fc;
    background: #f7f9ff;
    box-shadow: 0 3px 10px rgba(79,106,255,0.1);
    transform: translateY(-1px);
}
/* Colored left accent when configured */
.sec-hd--accent-blue  { border-left: 3px solid #3b82f6; }
.sec-hd--accent-amber { border-left: 3px solid #f59e0b; }
.sec-hd--accent-green { border-left: 3px solid #22c55e; }

.sec-hd__ico {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    flex-shrink: 0;
    font-size: 17px;
}
/* Vivid icon backgrounds */
.sec-hd__ico--blue  { background: #dbeafe; color: #2563eb; }
.sec-hd__ico--amber { background: #fef3c7; color: #d97706; }
.sec-hd__ico--green { background: #dcfce7; color: #16a34a; }
.sec-hd__ico--grey  { background: #f1f5f9; color: #64748b; }

.sec-hd__text { flex: 1; min-width: 0; }
.sec-hd__title {
    font-size: 13px;
    font-weight: 600;
    color: #1e293b;
    line-height: 1.3;
}
.sec-hd__sub {
    font-size: 11px;
    color: #475569;
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 180px;
}
.sec-hd__sub--dim { color: #c8d5e8; }

.sec-hd__chev { font-size: 18px; color: #94a3b8; flex-shrink: 0; }

/* ── Section body ───────────────────────────────────────────────── */
.sec-body {
    padding: 8px 4px 4px;
    border-left: 2px solid #e2e8f0;
    margin-left: 18px;
    padding-left: 12px;
    margin-bottom: 2px;
}
.sec-body--blue  { border-left-color: #bfdbfe; }
.sec-body--amber { border-left-color: #fde68a; }
.sec-body--green { border-left-color: #bbf7d0; }

/* ── Advanced section labels ────────────────────────────────────── */
.adv-label {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #64748b;
    margin-top: 10px;
    margin-bottom: 5px;
    padding-bottom: 4px;
    border-bottom: 1px solid #f1f5f9;
}
.adv-label .mdi { font-size: 14px; }

/* ── Variable rows (filter rows with store values) ──────────────── */
.var-row {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    margin-bottom: 6px;
}
.var-row__name { flex: 1; min-width: 0; }
.var-row__val  { flex: 1; min-width: 0; }
.var-row__current {
    display: flex;
    align-items: center;
    gap: 3px;
    font-size: 10px;
    color: #64748b;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    padding: 2px 6px;
    margin-top: 3px;
    line-height: 1.4;
}
.var-row__current .mdi { font-size: 11px; color: #94a3b8; }
.var-row__current strong { color: #1e293b; font-weight: 600; }
.var-row__del {
    flex-shrink: 0;
    width: 28px;
    height: 28px;
    margin-top: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    cursor: pointer;
    color: #94a3b8;
    transition: background 0.12s, color 0.12s;
    padding: 0;
}
.var-row__del:hover {
    background: #fee2e2;
    border-color: #fca5a5;
    color: #dc2626;
}

/* ── Store explorer table ───────────────────────────────────────── */
.store-table {
    display: flex;
    flex-direction: column;
    gap: 2px;
    margin: 4px 0;
    max-height: 200px;
    overflow-y: auto;
}
.store-row {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 8px;
    border-radius: 5px;
    cursor: pointer;
    transition: background 0.1s;
    font-size: 12px;
}
.store-row:hover { background: #f0f4ff; }
.store-row__name {
    flex: 1;
    font-weight: 500;
    color: #334155;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-family: monospace;
    font-size: 11px;
}
.store-row__val {
    max-width: 110px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-family: monospace;
    font-size: 11px;
    padding: 1px 6px;
    border-radius: 3px;
    background: #f1f5f9;
    color: #475569;
}
.store-row__val--null   { color: #94a3b8; background: #f8fafc; font-style: italic; }
.store-row__val--array  { background: #eff6ff; color: #2563eb; }
.store-row__val--obj    { background: #faf5ff; color: #7c3aed; }
</style>
