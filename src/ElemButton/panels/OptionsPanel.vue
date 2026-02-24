<template>
    <w-panel>
        <ui-container>

            <!-- ── Открыть страницу ─────────────────────────────────── -->
            <ui-input-url prop="url">Открыть страницу</ui-input-url>

            <template v-if="props.url">
                <ui-switch prop="isTargetBlank">В новой вкладке</ui-switch>

                <!-- urlFilters: передать переменные именно в эту ссылку -->
                <ui-collapse>
                    <template #header>Передать переменные в ссылку</template>
                    <ui-container>
                        <div v-for="(filter, i) in props.urlFilters" :key="i" class="row row-collapse">
                            <div class="col">
                                <ui-input v-model="filter.name" @change="onUrlFilterChange">
                                    Переменная
                                </ui-input>
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

            <!-- ── Событие при нажатии ────────────────────────────── -->
            <ui-input-tags v-model="eventName">
                Событие при нажатии
                <ui-tooltip>
                    <template #target="{ events, binds }">
                        <span class="mdi mdi-help-circle-outline" v-on="events" v-bind="binds" />
                    </template>
                    <div>
                        Запускает действие в виджете «Событие».
                        <div>Введите название и нажмите Enter.</div>
                    </div>
                </ui-tooltip>
            </ui-input-tags>

            <!-- ── Фильтры хранилища ──────────────────────────────── -->
            <ui-collapse>
                <template #header>Фильтры</template>
                <ui-container>
                    <!-- Установить переменные -->
                    <div v-for="(filter, i) in props.filters" :key="i" class="row row-collapse">
                        <div class="col">
                            <ui-input v-model="filter.name" @change="onFilterChange(filter, i)">
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
                    <ui-button @click="onFilterAdd">Добавить фильтр</ui-button>

                    <!-- Записать выбранные фильтры в URL страницы — только без ссылки перехода -->
                    <ui-select
                        v-if="routeQueryParamOptions.length > 0"
                        v-model="routeQueryParamNames"
                        multiple
                        :options="routeQueryParamOptions"
                        :disabled="!!props.url">
                        Сохранить в URL страницы
                        <ui-tooltip>
                            <template #target="{ events, binds }">
                                <span class="mdi mdi-help-circle-outline" v-on="events" v-bind="binds" />
                            </template>
                            <div v-if="props.url">Недоступно при заполненной ссылке перехода</div>
                            <div v-else>
                                Выбранные фильтры запишутся в адрес текущей страницы — ссылка станет «поделяемой».
                            </div>
                        </ui-tooltip>
                    </ui-select>

                    <!-- Сбросить переменные -->
                    <ui-input-tags v-model="cutParams">
                        Очистить при нажатии
                        <ui-tooltip>
                            <template #target="{ events, binds }">
                                <span class="mdi mdi-help-circle-outline" v-on="events" v-bind="binds" />
                            </template>
                            <div>Эти переменные будут удалены из хранилища при нажатии.</div>
                        </ui-tooltip>
                    </ui-input-tags>
                </ui-container>
            </ui-collapse>

            <!-- ── Дополнительно ──────────────────────────────────── -->
            <ui-collapse>
                <template #header>Дополнительно</template>
                <ui-container>
                    <ui-switch prop="isClickSelf">
                        Игнорировать клики внутри
                        <template #hint>
                            Кнопка не срабатывает, если кликнули по виджету внутри неё. Только в режиме плеера.
                        </template>
                    </ui-switch>
                    <ui-switch prop="isSaveUrlForStore">
                        Режим ElemHouseApi
                        <template #hint>
                            Передаёт ссылку через postMessage для работы с виджетом ElemHouseApi.
                        </template>
                    </ui-switch>
                </ui-container>
            </ui-collapse>

        </ui-container>
    </w-panel>
</template>

<script>
import { Panel } from 'goodt-wcore';
import { Tooltip as UiTooltip } from 'goodteditor-ui';

/**
 * @typedef {import('./OptionsPanel').TInstance} TInstance
 * @type {TInstance}
 */
const ComponentInstanceTypeDescriptor = undefined;

export default {
    extends: Panel,
    meta: { name: 'Настройки', icon: 'widgets' },
    components: { UiTooltip },
    data: () => ({
        ...ComponentInstanceTypeDescriptor
    }),
    computed: {
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
                this.props.cutParams = val.map((el) => el.trim());
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
