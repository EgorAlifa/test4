<template>
    <w-panel>
        <ui-container>
            <!-- ── 1. Переход ──────────────────────────────────────────── -->
            <ui-input-url prop="url">Ссылка для перехода</ui-input-url>

            <ui-switch v-show="!!props.url" prop="isTargetBlank">
                Открыть в новой вкладке
            </ui-switch>

            <!-- ── 2. Событие при нажатии ──────────────────────────────── -->
            <ui-input-tags v-model="eventName">
                Событие при нажатии
                <ui-tooltip>
                    <template #target="{ events, binds }">
                        <span class="mdi mdi-help-circle-outline" v-on="events" v-bind="binds" />
                    </template>
                    <div>
                        Название события из виджета «Ивент-контейнер».
                        <div>Введите название и нажмите Enter. Можно добавить несколько.</div>
                    </div>
                </ui-tooltip>
            </ui-input-tags>

            <!-- ── 3. Переменные ───────────────────────────────────────── -->
            <ui-collapse>
                <template #header>Переменные</template>
                <ui-container>
                    <div v-for="(filter, i) in props.filters" :key="i">
                        <div class="row row-collapse">
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
                                    <i class="mdi mdi-delete"></i>
                                </ui-button>
                            </div>
                        </div>
                    </div>
                    <ui-button @click="onFilterAdd">Добавить переменную</ui-button>

                    <ui-input-tags v-model="cutParams">
                        Удалить переменные
                        <ui-tooltip>
                            <template #target="{ events, binds }">
                                <span class="mdi mdi-help-circle-outline" v-on="events" v-bind="binds" />
                            </template>
                            <div>
                                Переменные из этого списка будут полностью удалены при нажатии.
                                <div>Введите название и нажмите Enter.</div>
                            </div>
                        </ui-tooltip>
                    </ui-input-tags>
                </ui-container>
            </ui-collapse>

            <!-- ── 4. Параметры URL ────────────────────────────────────── -->
            <ui-collapse>
                <template #header>Параметры URL</template>
                <ui-container>
                    <ui-select
                        v-model="routeQueryParamNames"
                        multiple
                        :options="routeQueryParamOptions"
                        :disabled="!!props.url">
                        Сохранить переменные в URL страницы
                        <ui-tooltip>
                            <template #target="{ events, binds }">
                                <span class="mdi mdi-help-circle-outline" v-on="events" v-bind="binds" />
                            </template>
                            <div v-if="props.url">Недоступно при заполненной «Ссылке для перехода»</div>
                            <div v-else-if="routeQueryParamOptions.length === 0">
                                Сначала добавьте переменные в разделе «Переменные»
                            </div>
                            <div v-else>
                                Выбранные переменные будут записаны в URL текущей страницы при нажатии.
                                <div>Полезно для создания ссылок с примёнёнными фильтрами.</div>
                            </div>
                        </ui-tooltip>
                    </ui-select>

                    <div v-for="(filter, i) in props.urlFilters" :key="i">
                        <div class="row row-collapse">
                            <div class="col">
                                <ui-input v-model="filter.name" @change="onUrlFilterChange(filter, i)">
                                    Переменная в URL при переходе
                                    <ui-tooltip>
                                        <template #target="{ events, binds }">
                                            <span
                                                class="mdi mdi-help-circle-outline"
                                                v-on="events"
                                                v-bind="binds" />
                                        </template>
                                        <div>
                                            Текущее значение этой переменной будет добавлено как параметр в «Ссылку для
                                            перехода»
                                        </div>
                                    </ui-tooltip>
                                </ui-input>
                            </div>
                            <div class="col col-auto col-vbot">
                                <ui-button type="ghost" inline icon @click="onUrlFilterDelete(i)">
                                    <i class="mdi mdi-delete"></i>
                                </ui-button>
                            </div>
                        </div>
                    </div>
                    <ui-button @click="onUrlFilterAdd">Добавить параметр при переходе</ui-button>
                </ui-container>
            </ui-collapse>

            <!-- ── 5. Дополнительно ────────────────────────────────────── -->
            <ui-collapse>
                <template #header>Дополнительно</template>
                <ui-container>
                    <ui-switch prop="isClickSelf">
                        Не срабатывать при клике на вложенный элемент
                        <template #hint>
                            Кнопка не реагирует на нажатие, если пользователь кликнул по виджету внутри неё. Работает
                            только в режиме плеера.
                        </template>
                    </ui-switch>

                    <ui-switch prop="isSaveUrlForStore">
                        Режим совместимости с ElemHouseApi
                        <template #hint>
                            Отправляет ссылку через Window.postMessage для корректной работы с виджетом ElemHouseApi.
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
    meta: { name: 'Настройки виджета', icon: 'widgets' },
    components: { UiTooltip },
    data: () => ({
        ...ComponentInstanceTypeDescriptor
    }),
    computed: {
        routeQueryParamOptions() {
            const { filters } = this.props;
            return filters.map(({ name, data }) => ({ label: name, value: String(data) }));
        },
        routeQueryParamNames: {
            get() {
                const { routeQueryParamNames } = this.props;
                return routeQueryParamNames.map((param) => String(param.value));
            },
            set(value) {
                this.props.routeQueryParamNames = this.routeQueryParamOptions.filter((option) =>
                    value.includes(option.value)
                );
                this.propChanged('routeQueryParamNames');
            }
        },
        eventName: {
            get() {
                const {
                    props: {
                        eventName: { getCompat }
                    }
                } = this.descriptor;

                return getCompat(this.props.eventName);
            },
            set(val) {
                this.props.eventName = val.map((el) => el.trim());
                this.propChanged('eventName');
            }
        },
        cutParams: {
            get() {
                const {
                    props: {
                        cutParams: { getCompat }
                    }
                } = this.descriptor;

                return getCompat(this.props.cutParams);
            },
            set(val) {
                this.props.cutParams = val.map((el) => el.trim());
                this.propChanged('cutParams');
            }
        }
    },
    methods: {
        /**
         * @param {import('../descriptor').FilterItem}
         * @param {string} data
         */
        setFilterData(filter, data) {
            try {
                filter.data = JSON.parse(data);
            } catch (e) {
                // noop
            }
        },
        /**
         * @param {import('../descriptor').FilterItem}
         * @param {string} data
         */
        getFilterData({ data }) {
            try {
                return JSON.stringify(data);
            } catch (e) {
                return String(data);
            }
        },
        saveFilters() {
            const { filters } = this.props;
            this.props.filters = filters.filter(({ name }) => name.length > 0);
            this.propChanged('filters');
        },
        /**
         * @param {import('../descriptor').FilterItem} filter
         * @param {number} index
         */
        onFilterChange({ name }, index) {
            if (name == null || name.length === 0) {
                return;
            }
            const { filters } = this.props;
            const foundIndex = filters.findIndex((el) => el.name === name);
            if (foundIndex !== index && foundIndex >= 0) {
                filters.splice(foundIndex, 1);
            }
            this.saveFilters();
        },
        /**
         * @param {import('../descriptor').FilterItem} filter
         */
        onFilterDelete(filter) {
            this.props.filters = this.props.filters.filter((el) => el !== filter);
            this.saveFilters();
        },
        onFilterAdd() {
            const { filters } = this.descriptor.props;
            this.props.filters.push(filters.factory());
        },
        saveUrlFilters() {
            const { urlFilters } = this.props;
            this.props.urlFilters = urlFilters.filter(({ name }) => name.length > 0);
            this.propChanged('urlFilters');
        },
        onUrlFilterAdd() {
            const { urlFilters } = this.descriptor.props;
            this.props.urlFilters.push(urlFilters.factory());
        },
        onUrlFilterDelete(index) {
            this.props.urlFilters = this.props.urlFilters.filter((el, indx) => indx !== index);
            this.saveUrlFilters();
        },
        onUrlFilterChange() {
            this.saveUrlFilters();
        }
    }
};
</script>
