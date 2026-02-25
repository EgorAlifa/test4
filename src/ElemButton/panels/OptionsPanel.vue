<template>
    <w-panel>
        <ui-container>

            <!-- ── Куда ведёт кнопка ──────────────────────────────────── -->
            <ui-input-url prop="url">Ссылка для перехода</ui-input-url>
            <ui-switch v-if="props.url" prop="isTargetBlank">Открыть в новой вкладке</ui-switch>

            <!-- ── Что делает кнопка ──────────────────────────────────── -->
            <ui-input-tags v-model="eventName">
                Событие при нажатии
                <ui-tooltip>
                    <template #target="{ events, binds }">
                        <span class="mdi mdi-help-circle-outline" v-on="events" v-bind="binds" />
                    </template>
                    <div>Отправляет сигнал виджету «Событие».</div>
                </ui-tooltip>
            </ui-input-tags>

            <!-- ── Toggle-режим ───────────────────────────────────────── -->
            <ui-switch prop="btnIsToggle">
                Кнопка-переключатель
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

            <!-- ── Расширенные действия ───────────────────────────────── -->
            <ui-collapse>
                <template #header>
                    Расширенные действия
                    <span v-if="hasAdvancedActions" class="badge">{{ advancedActionsCount }}</span>
                </template>
                <ui-container>

                    <!-- Установить переменные -->
                    <div class="adv-section-label">Установить переменные хранилища</div>
                    <div
                        v-for="(filter, i) in props.filters"
                        :key="i"
                        class="filter-row">
                        <ui-input
                            v-model="filter.name"
                            :list="`store-vars-${_uid}`"
                            class="filter-row__name"
                            @change="onFilterChange(filter, i)">
                            Переменная
                        </ui-input>
                        <ui-input
                            :value="getFilterData(filter)"
                            class="filter-row__val"
                            @input="(val) => setFilterData(filter, val)"
                            @change="onFilterChange(filter, i)">
                            Значение
                        </ui-input>
                        <button class="filter-row__del" @click="onFilterDelete(filter)">
                            <i class="mdi mdi-close" />
                        </button>
                    </div>
                    <datalist :id="`store-vars-${_uid}`">
                        <option v-for="v in storeVarNames" :key="v" :value="v" />
                    </datalist>
                    <ui-button type="ghost" @click="onFilterAdd">+ Добавить</ui-button>

                    <!-- Очистить переменные -->
                    <div class="adv-section-label">Очистить при нажатии</div>
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
                        <div class="adv-section-label">Передать переменные в ссылку</div>
                        <div
                            v-for="(filter, i) in props.urlFilters"
                            :key="i"
                            class="filter-row">
                            <ui-select
                                v-model="filter.name"
                                :options="storeVarOptions"
                                class="filter-row__name"
                                @change="onUrlFilterChange">
                                Переменная
                            </ui-select>
                            <button class="filter-row__del" @click="onUrlFilterDelete(i)">
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

                </ui-container>
            </ui-collapse>

            <!-- ── Прочее ─────────────────────────────────────────────── -->
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
    meta: { name: 'Настройки виджета', icon: 'settings' },
    components: { UiTooltip },
    data: () => ({ ...ComponentInstanceTypeDescriptor }),
    computed: {
        storeVarNames() {
            try { return Object.keys(store.state || {}).filter(Boolean).sort(); } catch (e) { return []; }
        },
        storeVarOptions() {
            return this.storeVarNames.map((k) => ({ label: k, value: k }));
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
    methods: {
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
.adv-section-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: #94a3b8;
    margin-top: 6px;
    margin-bottom: 4px;
}

.filter-row {
    display: flex;
    align-items: flex-end;
    gap: 6px;
    margin-bottom: 4px;
}
.filter-row__name { flex: 1; }
.filter-row__val  { flex: 1; }
.filter-row__del {
    flex-shrink: 0;
    width: 28px;
    height: 28px;
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
.filter-row__del:hover {
    background: #fee2e2;
    border-color: #fca5a5;
    color: #dc2626;
}
</style>
