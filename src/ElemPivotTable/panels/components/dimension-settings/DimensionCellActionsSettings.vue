<template>
    <ui-container>
        <ui-switch prop="emptyValue" hint="Срабатывать для отсутствующих значений">
            Применять к "пустой" ячейке
            <template #hint>Применять активные действия при отсутствии значения в ячейке (null)</template>
        </ui-switch>
        <ui-collapse open>
            <template #header>События</template>
            <ui-container>
                <ui-input-tags prop="events.select">События при выборе</ui-input-tags>
                <ui-checkbox v-model="isCellEventUsed">Событие {{ targetName }}</ui-checkbox>
            </ui-container>
        </ui-collapse>
        <ui-collapse>
            <template #header>Ссылки</template>
            <ui-container>
                <ui-input-auto prop="link.url" :options="options">Ссылка</ui-input-auto>
                <ui-select v-model="linkQueryDataAliases" multiple :options="options">
                    Переменные для передачи
                </ui-select>
                <ui-collapse>
                    <template #header>Запись в url из хранилища</template>
                    <ui-container>
                        <div v-for="(filter, i) in props.urlFilters" :key="i">
                            <div class="row row-collapse">
                                <div class="col">
                                    <ui-input v-model="filter.name" @change="onUrlFilterChange">
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
                <ui-switch prop="link.isTargetBlank">В новой вкладке</ui-switch>
                <ui-object-control
                    v-model="props.link.query"
                    :labels="{ title: 'Параметры ссылки', key: 'Наименование' }"
                    prop-name="param_"
                    @change="propChanged('link')" />
            </ui-container>
        </ui-collapse>
    </ui-container>
</template>
<script>
import PanelChildComponentMixin from '../../mixins/PanelChildComponentMixin';
import { useActionsDescriptor, UiObjectControl } from '@goodt-widgets-insight/table-common';

const descriptor = useActionsDescriptor(() => ({
    props: {
        enabled: {
            type: Boolean,
            default: true
        },
        emptyValue: {
            type: Boolean,
            default: false
        }
    }
}));

export default {
    components: { UiObjectControl },
    mixins: [PanelChildComponentMixin],
    static() {
        return {
            descriptor: descriptor()
        };
    },
    props: {
        targetName: {
            type: String
        },
        options: {
            type: Array,
            default: () => []
        }
    },
    computed: {
        isCellEventUsed: {
            get() {
                const {
                    targetName,
                    props: {
                        events: { select = [] }
                    }
                } = this;
                return select.includes(targetName);
            },
            set(isUsed) {
                const {
                    targetName,
                    props: { events }
                } = this;
                // eslint-disable-next-line goodt-rules/no-long-prop-chains
                events.select = isUsed
                    ? [...events.select, targetName]
                    : events.select.filter((eventName) => eventName !== targetName);
                this.propChanged('events');
            }
        },
        linkQueryDataAliases: {
            get() {
                const { queryMetrics = [] } = this.props.link;
                return queryMetrics;
            },
            set(metrics) {
                // eslint-disable-next-line goodt-rules/no-long-prop-chains
                this.props.link.queryMetrics = metrics;
                this.propChanged('link');
            }
        }
    },
    methods: {
        onUrlFilterAdd() {
            const { urlFilters } = this.descriptor.props;
            this.props.urlFilters.push(urlFilters.factory());
            this.onUrlFilterChange();
        },
        onUrlFilterDelete(index) {
            this.props.urlFilters.splice(index, 1);
            this.onUrlFilterChange();
        },
        onUrlFilterChange() {
            this.propChanged('urlFilters');
        }
    }
};
</script>
