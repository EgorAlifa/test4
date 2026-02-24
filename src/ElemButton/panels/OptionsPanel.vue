<template>
    <w-panel>
        <ui-container>

            <!-- ── 1. Переход ────────────────────────────────────────── -->
            <ui-input-url prop="url">Открыть страницу</ui-input-url>

            <template v-if="props.url">
                <ui-switch prop="isTargetBlank">В новой вкладке</ui-switch>

                <!-- Передать текущие значения переменных в ссылку -->
                <ui-collapse>
                    <template #header>
                        Передать в ссылку
                        <span v-if="props.urlFilters.length" class="badge">{{ props.urlFilters.length }}</span>
                    </template>
                    <ui-container>
                        <div
                            v-if="!storeVarOptions.length"
                            :style="{ fontSize: '12px', color: '#6b7280', padding: '4px 0 8px' }">
                            Нет переменных в хранилище
                        </div>
                        <div
                            v-for="(filter, i) in props.urlFilters"
                            :key="i"
                            class="row row-collapse">
                            <div class="col">
                                <ui-select
                                    v-model="filter.name"
                                    :options="storeVarOptions"
                                    @change="onUrlFilterChange">
                                    Переменная
                                </ui-select>
                            </div>
                            <div class="col col-auto col-vbot">
                                <ui-button type="ghost" inline icon @click="onUrlFilterDelete(i)">
                                    <i class="mdi mdi-delete" />
                                </ui-button>
                            </div>
                        </div>
                        <ui-button @click="onUrlFilterAdd">Добавить переменную</ui-button>
                    </ui-container>
                </ui-collapse>
            </template>

            <!-- ── 2. Событие ──────────────────────────────────────── -->
            <ui-input-tags v-model="eventName">
                Событие при нажатии
                <ui-tooltip>
                    <template #target="{ events, binds }">
                        <span class="mdi mdi-help-circle-outline" v-on="events" v-bind="binds" />
                    </template>
                    <div>
                        Отправляет сигнал виджету «Событие».
                        <div>Введите название и нажмите Enter.</div>
                    </div>
                </ui-tooltip>
            </ui-input-tags>

            <!-- ── 3. Фильтры хранилища ───────────────────────────── -->
            <ui-collapse>
                <template #header>
                    Фильтры
                    <span v-if="props.filters.length" class="badge">{{ props.filters.length }}</span>
                </template>
                <ui-container>

                    <!-- Установить переменные -->
                    <div
                        v-for="(filter, i) in props.filters"
                        :key="i"
                        class="row row-collapse">
                        <div class="col">
                            <ui-input
                                v-model="filter.name"
                                :list="`store-vars-${_uid}`"
                                @change="onFilterChange(filter, i)">
                                Переменная
                            </ui-input>
                        </div>
                        <div class="col">
                            <ui-input
                                class="mar-left-3"
                                :value="getFilterData(filter)"
                                @input="(val) => setFilterData(filter, val)"
                                @change="onFilterChange(filter, i)">
                                Значение
                            </ui-input>
                        </div>
                        <div class="col col-auto col-vbot">
                            <ui-button type="ghost" inline icon @click="onFilterDelete(filter)">
                                <i class="mdi mdi-delete" />
                            </ui-button>
                        </div>
                    </div>

                    <!-- datalist даёт автодополнение из стора -->
                    <datalist :id="`store-vars-${_uid}`">
                        <option v-for="v in storeVarNames" :key="v" :value="v" />
                    </datalist>

                    <ui-button @click="onFilterAdd">Добавить фильтр</ui-button>

                    <!-- Записать выбранные фильтры в URL текущей страницы -->
                    <ui-select
                        v-if="routeQueryParamOptions.length > 0 && !props.url"
                        v-model="routeQueryParamNames"
                        multiple
                        :options="routeQueryParamOptions">
                        Сохранить в URL страницы
                        <ui-tooltip>
                            <template #target="{ events, binds }">
                                <span class="mdi mdi-help-circle-outline" v-on="events" v-bind="binds" />
                            </template>
                            <div>
                                Выбранные фильтры запишутся в адрес страницы —
                                ссылка будет «с применёнными фильтрами».
                            </div>
                        </ui-tooltip>
                    </ui-select>

                    <!-- Сбросить переменные — multi-select из стора -->
                    <ui-select
                        v-if="storeVarOptions.length > 0"
                        v-model="cutParams"
                        multiple
                        :options="storeVarOptions">
                        Очистить при нажатии
                        <ui-tooltip>
                            <template #target="{ events, binds }">
                                <span class="mdi mdi-help-circle-outline" v-on="events" v-bind="binds" />
                            </template>
                            <div>Выбранные переменные будут удалены из хранилища при нажатии.</div>
                        </ui-tooltip>
                    </ui-select>

                    <!-- Fallback: tags input когда стор пуст -->
                    <ui-input-tags
                        v-else
                        v-model="cutParams">
                        Очистить при нажатии
                        <ui-tooltip>
                            <template #target="{ events, binds }">
                                <span class="mdi mdi-help-circle-outline" v-on="events" v-bind="binds" />
                            </template>
                            <div>Эти переменные будут удалены из хранилища при нажатии. Введите название и нажмите Enter.</div>
                        </ui-tooltip>
                    </ui-input-tags>

                </ui-container>
            </ui-collapse>

            <!-- ── 4. Дополнительно ───────────────────────────────── -->
            <ui-collapse>
                <template #header>Дополнительно</template>
                <ui-container>
                    <ui-switch prop="isClickSelf">
                        Игнорировать клики внутри
                        <template #hint>
                            Кнопка не срабатывает, если кликнули по виджету внутри неё.
                        </template>
                    </ui-switch>
                    <ui-switch prop="isSaveUrlForStore">
                        Режим ElemHouseApi
                        <template #hint>
                            Передаёт ссылку через postMessage для совместимости с ElemHouseApi.
                        </template>
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
    meta: { name: 'Настройки', icon: 'widgets' },
    components: { UiTooltip },
    data: () => ({
        ...ComponentInstanceTypeDescriptor
    }),
    computed: {
        /** Все переменные из хранилища — для select и datalist */
        storeVarNames() {
            try {
                return Object.keys(store.state || {}).filter(Boolean).sort();
            } catch (e) {
                return [];
            }
        },
        storeVarOptions() {
            return this.storeVarNames.map((k) => ({ label: k, value: k }));
        },

        routeQueryParamOptions() {
            return this.props.filters.map(({ name, data }) => ({ label: name, value: String(data) }));
        },
        routeQueryParamNames: {
            get() {
                return this.props.routeQueryParamNames.map((p) => String(p.value));
            },
            set(value) {
                this.props.routeQueryParamNames = this.routeQueryParamOptions.filter((o) =>
                    value.includes(o.value)
                );
                this.propChanged('routeQueryParamNames');
            }
        },
        eventName: {
            get() {
                return this.descriptor.props.eventName.getCompat(this.props.eventName);
            },
            set(val) {
                this.props.eventName = val.map((el) => el.trim());
                this.propChanged('eventName');
            }
        },
        cutParams: {
            get() {
                return this.descriptor.props.cutParams.getCompat(this.props.cutParams);
            },
            set(val) {
                this.props.cutParams = Array.isArray(val) ? val.map((el) => el.trim()) : [];
                this.propChanged('cutParams');
            }
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
