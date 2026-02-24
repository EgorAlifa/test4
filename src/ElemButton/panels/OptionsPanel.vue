<template>
    <w-panel>
        <ui-container>
            <ui-input-url prop="url">Ссылка для перехода</ui-input-url>

            <ui-input-tags v-model="eventName">
                События для отправки
                <ui-tooltip>
                    <template #target="{ events, binds }">
                        <span class="mdi mdi-help-circle-outline" v-on="events" v-bind="binds" />
                    </template>
                    <div>
                        Вписанное событие добавляется по нажатию на "enter". Поддерживает отправку множества событий.
                    </div>
                </ui-tooltip>
            </ui-input-tags>

            <ui-input-tags v-model="cutParams">Ключи для удаления из хранилища</ui-input-tags>

            <ui-select v-model="routeQueryParamNames" multiple :options="routeQueryParamOptions">
                Запись в текущий url страницы
                <ui-tooltip>
                    <template #target="{ events, binds }">
                        <span class="mdi mdi-help-circle-outline" v-on="events" v-bind="binds" />
                    </template>
                    <div>Не работает с "Ссылка для перехода"</div>
                </ui-tooltip>
            </ui-select>

            <ui-collapse>
                <template #header>Фильтры хранилища</template>
                <ui-container>
                    <div v-for="(filter, i) in props.filters" :key="i">
                        <div class="row row-collapse">
                            <div class="col">
                                <ui-input v-model="filter.name" @change="onFilterChange(filter, i)">имя</ui-input>
                            </div>
                            <div class="col">
                                <ui-input
                                    class="mar-left-3"
                                    :value="getFilterData(filter)"
                                    @input="(val) => setFilterData(filter, val)"
                                    @change="onFilterChange(filter, i)">
                                    значение
                                </ui-input>
                            </div>
                            <div class="col col-auto col-vbot">
                                <ui-button type="ghost" inline icon @click="onFilterDelete(filter)">
                                    <i class="mdi mdi-delete"></i>
                                </ui-button>
                            </div>
                        </div>
                    </div>
                    <ui-button @click="onFilterAdd">Добавить</ui-button>
                </ui-container>
            </ui-collapse>

            <ui-collapse>
                <template #header>Запись в url из хранилища</template>
                <ui-container>
                    <div v-for="(filter, i) in props.urlFilters" :key="i">
                        <div class="row row-collapse">
                            <div class="col">
                                <ui-input v-model="filter.name" @change="onUrlFilterChange(filter, i)">
                                    Имя переменной
                                </ui-input>
                            </div>
                            <div class="col col-auto col-vbot">
                                <ui-button type="ghost" inline icon @click="onUrlFilterDelete(i)">
                                    <i class="mdi mdi-delete"></i>
                                </ui-button>
                            </div>
                        </div>
                    </div>
                    <ui-button @click="onUrlFilterAdd">Добавить</ui-button>
                </ui-container>
            </ui-collapse>

            <ui-switch prop="isClickSelf">
                Отменить нажатие через слот
                <ui-tooltip>
                    <template #target="{ events, binds }">
                        <span class="mdi mdi-help-circle-outline" v-on="events" v-bind="binds" />
                    </template>
                    <div>
                        Не позволяет активировать кнопку, когда в её слоте размещен другой виджет,
                        <div>с которым происходит взаимодействие.</div>
                    </div>
                    <div>Настройка работает в режиме плеера</div>
                </ui-tooltip>
            </ui-switch>

            <ui-switch prop="isTargetBlank">Открытие в новой вкладке</ui-switch>

            <ui-switch prop="isSaveUrlForStore">
                Отправка ссылки в хранилище
                <ui-tooltip>
                    <template #target="{ events, binds }">
                        <span class="mdi mdi-help-circle-outline" v-on="events" v-bind="binds" />
                    </template>
                    <div>
                        Режим работы позволяет отправлять ссылку из поля "Ссылка для перехода" одновременно с отправкой
                        события для виджета ElemHouseApi, чтобы ссылка записалась в Window.postMessage() и была
                        корректно открыта.
                    </div>
                </ui-tooltip>
            </ui-switch>
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
                this.propChanged('curParams');
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
