<template>
    <w-panel>
        <ui-container>

            <!-- ── 2×2 карточки: что делает кнопка ──────────────────────── -->
            <div class="action-grid">
                <div
                    v-for="a in actionCards"
                    :key="a.key"
                    class="action-card"
                    :class="[`action-card--${a.color}`, { 'action-card--on': a.active }]"
                    @click="a.toggle()">
                    <i :class="['mdi', a.icon, 'action-card__icon']" />
                    <div class="action-card__title">{{ a.title }}</div>
                    <div class="action-card__status">{{ a.status }}</div>
                </div>
            </div>

            <!-- ── Ссылка ──────────────────────────────────────────────────── -->
            <div class="sec-wrap" :class="{ 'sec-wrap--blue': props.url }">
                <div class="sec-hd" @click="openLink = !openLink">
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
                <transition name="sec-expand">
                    <div v-if="openLink" class="sec-body">
                        <ui-input-url prop="url" />
                        <!-- Route chips from parent Vuex store -->
                        <template v-if="availableRoutes.length">
                            <div class="route-chips-hd">
                                <span class="route-chips-hd__label">Страницы проекта</span>
                                <button class="route-chips-hd__btn" title="Обновить список" @click="loadRoutes">
                                    <i class="mdi mdi-refresh" />
                                </button>
                                <button v-if="props.url" class="route-chips-hd__btn route-chips-hd__btn--red" title="Очистить ссылку" @click="setUrl('')">
                                    <i class="mdi mdi-link-off" />
                                </button>
                            </div>
                            <div class="route-chips">
                                <button
                                    v-for="r in availableRoutes"
                                    :key="r.slug"
                                    class="route-chip"
                                    :class="{ 'route-chip--active': props.url === r.slug }"
                                    :title="r.slug"
                                    @click="setUrl(r.slug)">
                                    {{ r.title || r.name || r.slug }}
                                </button>
                            </div>
                        </template>
                        <ui-switch v-if="props.url" prop="isTargetBlank">Открыть в новой вкладке</ui-switch>
                    </div>
                </transition>
            </div>

            <!-- ── Событие ────────────────────────────────────────────────── -->
            <div class="sec-wrap" :class="{ 'sec-wrap--amber': eventName.length }">
                <div class="sec-hd" @click="openEvent = !openEvent">
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
                <transition name="sec-expand">
                    <div v-if="openEvent" class="sec-body">
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
                </transition>
            </div>

            <!-- ── Переключатель ──────────────────────────────────────────── -->
            <div class="sec-wrap" :class="{ 'sec-wrap--green': props.btnIsToggle }">
                <div class="sec-hd" @click="openToggle = !openToggle">
                    <span
                        class="sec-hd__ico"
                        :class="props.btnIsToggle ? 'sec-hd__ico--green' : 'sec-hd__ico--grey'">
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
                <transition name="sec-expand">
                    <div v-if="openToggle" class="sec-body">
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
                </transition>
            </div>

            <!-- ── Расширенные действия ───────────────────────────────────── -->
            <ui-collapse>
                <template #header>
                    Расширенные действия
                    <span v-if="hasAdvancedActions" class="badge">{{ advancedActionsCount }}</span>
                </template>
                <ui-container>

                    <!-- Установить переменные -->
                    <div class="adv-label">
                        <i class="mdi mdi-database-edit-outline" /> Установить переменные
                    </div>
                    <div
                        v-for="(filter, i) in props.filters"
                        :key="i"
                        class="filter-item">
                        <div class="filter-item__row">
                            <!-- Variable name: store select OR manual input, toggled per-row -->
                            <div class="mode-field">
                                <ui-select
                                    v-if="storeEntries.length && !isFilterManual(i)"
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
                                <button
                                    v-if="storeEntries.length"
                                    class="mode-btn"
                                    :class="{ 'mode-btn--manual': isFilterManual(i) }"
                                    :title="isFilterManual(i) ? 'Выбрать из хранилища' : 'Ввести вручную'"
                                    @click="toggleFilterMode(i)">
                                    <i :class="['mdi', isFilterManual(i) ? 'mdi-database-search-outline' : 'mdi-pencil-outline']" />
                                </button>
                            </div>
                            <!-- Value -->
                            <div class="filter-item__val">
                                <ui-input
                                    :value="getFilterData(filter)"
                                    @input="(val) => setFilterData(filter, val)"
                                    @change="onFilterChange(filter, i)">
                                    Значение
                                </ui-input>
                            </div>
                            <button class="del-btn" @click="onFilterDelete(filter)">
                                <i class="mdi mdi-close" />
                            </button>
                        </div>
                        <!-- Current store value hint -->
                        <div v-if="filter.name && storeHasVar(filter.name)" class="filter-item__hint">
                            <i class="mdi mdi-arrow-right-thin" />
                            Сейчас в хранилище: <strong>{{ getStoreVal(filter.name) }}</strong>
                        </div>
                    </div>
                    <datalist :id="`store-vars-${_uid}`">
                        <option v-for="v in storeVarNames" :key="v" :value="v" />
                    </datalist>
                    <ui-button type="ghost" @click="onFilterAdd">+ Добавить</ui-button>

                    <!-- Очистить переменные -->
                    <div class="adv-label">
                        <i class="mdi mdi-database-remove-outline" /> Очистить при нажатии
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
                            <i class="mdi mdi-link-plus" /> Передать переменные в ссылку
                        </div>
                        <div
                            v-for="(filter, i) in props.urlFilters"
                            :key="i"
                            class="filter-item">
                            <div class="filter-item__row">
                                <div class="mode-field">
                                    <ui-select
                                        v-model="filter.name"
                                        :options="storeVarOptions"
                                        @change="onUrlFilterChange">
                                        Переменная
                                    </ui-select>
                                </div>
                                <button class="del-btn" @click="onUrlFilterDelete(i)">
                                    <i class="mdi mdi-close" />
                                </button>
                            </div>
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

                    <!-- Store Explorer -->
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
                                :title="`Копировать «${entry.name}»`"
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
        openToggle: false,
        /** per-row mode: true = manual input, false = store select */
        filterManualModes: {},
        availableRoutes: []
    }),
    computed: {
        storeVarNames() {
            try { return Object.keys(store.state || {}).filter(Boolean).sort(); } catch (e) { return []; }
        },
        storeVarOptions() {
            return this.storeVarNames.map((k) => ({ label: k, value: k }));
        },
        storeEntries() {
            try {
                return Object.entries(store.state || {})
                    .filter(([k]) => k)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([name, val]) => {
                        const isNull = val === null || val === undefined;
                        const isArray = Array.isArray(val);
                        const isObject = !isNull && !isArray && typeof val === 'object';
                        return { name, isNull, isArray, isObject, display: this.formatStoreVal(val) };
                    });
            } catch (e) { return []; }
        },
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
        actionCards() {
            const url = this.props.url || '';
            const evCount = this.eventName.length;
            return [
                {
                    key: 'link',
                    title: 'Ссылка',
                    icon: 'mdi-link-variant',
                    color: 'blue',
                    active: !!url,
                    status: url ? this.truncUrl(url) : 'Не задана',
                    toggle: () => { this.openLink = !this.openLink; }
                },
                {
                    key: 'event',
                    title: 'Событие',
                    icon: 'mdi-lightning-bolt',
                    color: 'amber',
                    active: evCount > 0,
                    status: evCount > 0
                        ? this.eventName[0] + (evCount > 1 ? ` +${evCount - 1}` : '')
                        : 'Не задано',
                    toggle: () => { this.openEvent = !this.openEvent; }
                },
                {
                    key: 'toggle',
                    title: 'Тоггл',
                    icon: this.props.btnIsToggle ? 'mdi-toggle-switch' : 'mdi-toggle-switch-off-outline',
                    color: 'green',
                    active: this.props.btnIsToggle,
                    status: this.props.btnIsToggle ? 'Включён' : 'Выключен',
                    toggle: () => { this.openToggle = !this.openToggle; }
                },
                {
                    key: 'adv',
                    title: 'Действия',
                    icon: 'mdi-filter-variant',
                    color: 'purple',
                    active: this.hasAdvancedActions,
                    status: this.hasAdvancedActions ? this.ruPlural(this.advancedActionsCount, 'правило', 'правила', 'правил') : 'Нет',
                    toggle: () => {}
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
        this.loadRoutes();
    },
    methods: {
        isFilterManual(i) {
            return !!this.filterManualModes[i];
        },
        toggleFilterMode(i) {
            this.filterManualModes = { ...this.filterManualModes, [i]: !this.filterManualModes[i] };
        },
        storeHasVar(name) {
            return name && this.storeVarNames.includes(name);
        },
        truncUrl(url) {
            if (!url) return '';
            const max = 26;
            return url.length > max ? `${url.slice(0, max)}…` : url;
        },
        /** Russian plural: ruPlural(5, 'правило', 'правила', 'правил') → '5 правил' */
        ruPlural(n, one, few, many) {
            const m10 = n % 10;
            const m100 = n % 100;
            if (m10 === 1 && m100 !== 11) return `${n} ${one}`;
            if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return `${n} ${few}`;
            return `${n} ${many}`;
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
        /** Full store discovery — mirrors ElemRoutesNavigator logic */
        _findVuexStore() {
            // 1. Component's own store
            if (this.$store) return this.$store;
            if (this.$root?.$store) return this.$root.$store;
            // 2. Global Nuxt/Vue hooks in current window
            for (const src of [window.$nuxt, window.__NUXT__, window.__VUE__]) {
                if (src?.$store) return src.$store;
            }
            // 3. Parent window Nuxt/Vue hooks
            if (window.parent && window !== window.parent) {
                for (const src of [window.parent.$nuxt, window.parent.__NUXT__, window.parent.__VUE__]) {
                    if (src?.$store) return src.$store;
                }
                // 4. Parent window DOM root
                try {
                    const el = window.parent.document.getElementById('app') ||
                               window.parent.document.querySelector('[data-app]') ||
                               window.parent.document.querySelector('#__nuxt');
                    if (el?.__vue__?.$store) return el.__vue__.$store;
                } catch (e) { /* cross-origin */ }
            }
            // 5. Current window DOM root
            const el = document.getElementById('app') ||
                       document.querySelector('[data-app]') ||
                       document.querySelector('#__nuxt');
            if (el?.__vue__?.$store) return el.__vue__.$store;
            return null;
        },
        /** Extract routes array from Vuex state — tries all known paths */
        _routesFromState(state) {
            if (!state) return null;
            const fns = [
                () => state?.app?.app?.data?.routes,
                () => state?.app?.routes,
                () => state?.editor?.data?.routes,
                () => state?.editor?.routes,
                () => state?.routes,
                () => state?.application?.data?.routes
            ];
            for (const fn of fns) {
                try { const r = fn(); if (Array.isArray(r) && r.length) return r; } catch (e) { /* noop */ }
            }
            return null;
        },
        loadRoutes() {
            try {
                const vuexStore = this._findVuexStore();
                const routes = this._routesFromState(vuexStore?.state);
                if (routes) {
                    this.availableRoutes = routes
                        .filter((r) => r.enabled !== false && r.slug)
                        .slice(0, 40);
                }
            } catch (e) { /* noop — panel still works without route list */ }
        },
        setUrl(url) {
            this.props.url = url;
            this.propChanged('url');
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
            this.propChanged('filters');
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
/* ── 2×2 Action cards ───────────────────────────────────────────── */
.action-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
    margin-bottom: 10px;
}
.action-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    padding: 12px 6px 10px;
    border-radius: 10px;
    border: 1.5px solid #e2e8f0;
    cursor: pointer;
    background: #fafbfc;
    text-align: center;
    user-select: none;
    transition: transform 0.12s, box-shadow 0.12s, border-color 0.15s, background 0.15s;
}
.action-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 14px rgba(0,0,0,0.08);
    border-color: #c7d0e0;
}
.action-card__icon { font-size: 22px; color: #94a3b8; transition: color 0.15s; line-height: 1; }
.action-card__title { font-size: 11px; font-weight: 700; color: #64748b; line-height: 1.2; }
.action-card__status {
    font-size: 10px;
    color: #94a3b8;
    line-height: 1.2;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;
    padding: 0 4px;
}
/* Active: blue */
.action-card--on.action-card--blue {
    background: linear-gradient(145deg, #eff6ff, #dbeafe);
    border-color: #93c5fd;
    box-shadow: 0 2px 8px rgba(59,130,246,0.15);
}
.action-card--on.action-card--blue .action-card__icon  { color: #2563eb; }
.action-card--on.action-card--blue .action-card__title { color: #1e40af; }
.action-card--on.action-card--blue .action-card__status { color: #3b82f6; }
/* Active: amber */
.action-card--on.action-card--amber {
    background: linear-gradient(145deg, #fffbeb, #fef3c7);
    border-color: #fcd34d;
    box-shadow: 0 2px 8px rgba(245,158,11,0.15);
}
.action-card--on.action-card--amber .action-card__icon  { color: #d97706; }
.action-card--on.action-card--amber .action-card__title { color: #92400e; }
.action-card--on.action-card--amber .action-card__status { color: #f59e0b; }
/* Active: green */
.action-card--on.action-card--green {
    background: linear-gradient(145deg, #f0fdf4, #dcfce7);
    border-color: #86efac;
    box-shadow: 0 2px 8px rgba(34,197,94,0.15);
}
.action-card--on.action-card--green .action-card__icon  { color: #16a34a; }
.action-card--on.action-card--green .action-card__title { color: #14532d; }
.action-card--on.action-card--green .action-card__status { color: #22c55e; }
/* Active: purple */
.action-card--on.action-card--purple {
    background: linear-gradient(145deg, #faf5ff, #ede9fe);
    border-color: #c4b5fd;
    box-shadow: 0 2px 8px rgba(124,58,237,0.15);
}
.action-card--on.action-card--purple .action-card__icon  { color: #7c3aed; }
.action-card--on.action-card--purple .action-card__title { color: #4c1d95; }
.action-card--on.action-card--purple .action-card__status { color: #8b5cf6; }

/* ── Accordion wrapper ──────────────────────────────────────────── */
.sec-wrap {
    border: 1.5px solid #e0e6ef;
    border-radius: 10px;
    overflow: hidden;
    margin-top: 5px;
    background: #fff;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    transition: border-color 0.15s, box-shadow 0.15s;
}
.sec-wrap:hover { border-color: #c0cfe0; box-shadow: 0 2px 8px rgba(0,0,0,0.07); }
.sec-wrap--blue  { border-left: 3px solid #3b82f6; }
.sec-wrap--amber { border-left: 3px solid #f59e0b; }
.sec-wrap--green { border-left: 3px solid #22c55e; }

/* ── Section header ─────────────────────────────────────────────── */
.sec-hd {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    cursor: pointer;
    transition: background 0.12s;
    user-select: none;
}
.sec-hd:hover { background: #f7f9ff; }

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
.sec-hd__ico--blue  { background: #dbeafe; color: #2563eb; }
.sec-hd__ico--amber { background: #fef3c7; color: #d97706; }
.sec-hd__ico--green { background: #dcfce7; color: #16a34a; }
.sec-hd__ico--grey  { background: #f1f5f9; color: #64748b; }

.sec-hd__text { flex: 1; min-width: 0; }
.sec-hd__title { font-size: 13px; font-weight: 600; color: #1e293b; line-height: 1.3; }
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
    padding: 6px 12px 10px;
    border-top: 1px solid #f0f4f8;
    background: #fafcff;
}

/* ── Expand/collapse animation ──────────────────────────────────── */
.sec-expand-enter-active { transition: opacity 0.18s ease, transform 0.18s ease; }
.sec-expand-leave-active { transition: opacity 0.12s ease; }
.sec-expand-enter        { opacity: 0; transform: translateY(-6px); }
.sec-expand-leave-to     { opacity: 0; }

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

/* ── Filter items ───────────────────────────────────────────────── */
.filter-item { margin-bottom: 6px; }
.filter-item__row {
    display: flex;
    align-items: flex-end;
    gap: 5px;
}
.filter-item__val { flex: 1; min-width: 0; }

/* mode-field: input/select + toggle button side by side */
.mode-field {
    flex: 1;
    min-width: 0;
    position: relative;
    display: flex;
    align-items: flex-end;
    gap: 4px;
}
.mode-field > :first-child { flex: 1; min-width: 0; }

.mode-btn {
    flex-shrink: 0;
    width: 26px;
    height: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f1f5f9;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    cursor: pointer;
    color: #64748b;
    font-size: 13px;
    transition: background 0.12s, color 0.12s, border-color 0.12s;
    padding: 0;
    margin-bottom: 1px;
}
.mode-btn:hover { background: #e0e7ff; border-color: #a5b4fc; color: #4f6aff; }
.mode-btn--manual { background: #eff2ff; border-color: #a5b4fc; color: #4f6aff; }

.del-btn {
    flex-shrink: 0;
    width: 26px;
    height: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    cursor: pointer;
    color: #94a3b8;
    font-size: 13px;
    transition: background 0.12s, color 0.12s;
    padding: 0;
    margin-bottom: 1px;
}
.del-btn:hover { background: #fee2e2; border-color: #fca5a5; color: #dc2626; }

.filter-item__hint {
    display: flex;
    align-items: center;
    gap: 3px;
    font-size: 10px;
    color: #64748b;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    padding: 2px 7px;
    margin-top: 3px;
    line-height: 1.5;
}
.filter-item__hint .mdi { font-size: 12px; color: #94a3b8; }
.filter-item__hint strong { color: #1e293b; font-weight: 600; }

/* ── Store explorer ─────────────────────────────────────────────── */
.store-table {
    display: flex;
    flex-direction: column;
    gap: 1px;
    margin: 4px 0;
    max-height: 190px;
    overflow-y: auto;
}
.store-row {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 7px;
    border-radius: 5px;
    cursor: pointer;
    transition: background 0.1s;
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
.store-row__val--null  { color: #94a3b8; background: #f8fafc; font-style: italic; }
.store-row__val--array { background: #eff6ff; color: #2563eb; }
.store-row__val--obj   { background: #faf5ff; color: #7c3aed; }

/* ── Route chips (URL section) ──────────────────────────────────── */
.route-chips-hd {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 8px;
    margin-bottom: 5px;
}
.route-chips-hd__label {
    flex: 1;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: #94a3b8;
}
.route-chips-hd__btn {
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #e2e8f0;
    border-radius: 5px;
    background: #fff;
    color: #94a3b8;
    font-size: 13px;
    cursor: pointer;
    transition: background 0.1s, color 0.1s, border-color 0.1s;
    padding: 0;
}
.route-chips-hd__btn:hover { background: #f0f4ff; color: #4f6aff; border-color: #a5b4fc; }
.route-chips-hd__btn--red:hover { background: #fee2e2; color: #dc2626; border-color: #fca5a5; }
.route-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-bottom: 8px;
    max-height: 96px;
    overflow-y: auto;
}
.route-chip {
    padding: 3px 9px;
    border-radius: 16px;
    border: 1.5px solid #e2e8f0;
    background: #fff;
    color: #475569;
    font-size: 11px;
    font-weight: 500;
    cursor: pointer;
    transition: border-color 0.12s, background 0.12s, color 0.12s;
    white-space: nowrap;
    max-width: 140px;
    overflow: hidden;
    text-overflow: ellipsis;
}
.route-chip:hover { border-color: #93c5fd; color: #2563eb; background: #eff6ff; }
.route-chip--active { border-color: #4f6aff; background: #eff2ff; color: #4f6aff; font-weight: 600; }
</style>
