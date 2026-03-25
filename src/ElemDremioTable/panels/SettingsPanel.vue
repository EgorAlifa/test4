<template>
    <ui-panel-container>
        <ui-container>
            <ui-switch prop="isWaitingForStoreState">Скрывать, если хранилище пусто</ui-switch>
            <ui-switch prop="shouldResetSelectedRow">Сбрасывать состояние при скрытии</ui-switch>
            <ui-has-panel>
                <ui-checkbox prop="showHead">Отображать заголовки</ui-checkbox>
                <template #panel>
                    <ui-panel
                        :groups="[
                            { name: 'Настройки', slot: 'common' },
                            { name: 'Сложные заголовки', slot: 'top-header' }
                        ]">
                        <template #common>
                            <ui-switch prop="shouldTruncateHeader">Обрезать не умещающийся текст</ui-switch>
                        </template>
                        <template #top-header>
                            <ui-container>
                                <template v-if="props.topHeaders.length > 0">
                                    <ui-collapse v-for="({ title }, idx) in props.topHeaders" :key="idx">
                                        <template #header>{{ title }}</template>
                                        <ui-container>
                                            <ui-input
                                                v-model.trim="props.topHeaders[idx].title"
                                                @change="propChanged('topHeaders')">
                                                Текст
                                            </ui-input>
                                            <ui-input
                                                v-model="props.topHeaders[idx].style"
                                                @change="propChanged('topHeaders')">
                                                Стиль
                                            </ui-input>
                                            <ui-has-two-columns>
                                                <template #left>
                                                    <ui-input
                                                        :max="props.columns.length"
                                                        type="number"
                                                        min="1"
                                                        v-model.number="props.topHeaders[idx].range[0]"
                                                        @change="propChanged('topHeaders')">
                                                        Объединить, начиная с
                                                    </ui-input>
                                                </template>
                                                <template #right>
                                                    <ui-input
                                                        :max="props.columns.length"
                                                        type="number"
                                                        min="1"
                                                        v-model.number="props.topHeaders[idx].range[1]"
                                                        @change="propChanged('topHeaders')">
                                                        Заканчивая
                                                    </ui-input>
                                                </template>
                                            </ui-has-two-columns>
                                            <ui-button type="error" @click="deleteTopHeader(idx)">
                                                Удалить заголовок
                                            </ui-button>
                                        </ui-container>
                                    </ui-collapse>
                                </template>
                                <ui-button @click="createTopHeader">Создать заголовок</ui-button>
                            </ui-container>
                        </template>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-has-panel>
                <ui-checkbox prop="rowBorder.enable">Отображать границу у строки</ui-checkbox>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Настройки границы строки', slot: 'border' }]">
                        <template #border>
                            <ui-input-cp prop="rowBorder.color">Цвет границы строки</ui-input-cp>
                        </template>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-switch prop="hasRowStylePriority">
                Приоритетная стилизация
                <ui-tooltip position="top">
                    <template #target="{ events, binds }">
                        <div class="icon mar-left-2" v-on="events" v-bind="binds">
                            <i class="mdi mdi-alert-circle-outline" />
                        </div>
                    </template>
                    <span>
                        Стили, заданные строкам,
                        <br />
                        будут иметь более высокий приоритет,
                        <br />
                        чем стили шаблонов
                    </span>
                </ui-tooltip>
            </ui-switch>

            <ui-has-panel>
                <div class="form-label form-label-small text-truncate u-select-none">Стили строки при наведении</div>
                <template #panel>
                    <ui-row-style-settings
                        v-bind="{
                            propName: 'highlightedRowStyle',
                            propSettings: props.highlightedRowStyle
                        }"
                        @change="onRowSettingsChange" />
                </template>
            </ui-has-panel>

            <ui-has-panel>
                <div class="form-label form-label-small text-truncate u-select-none">Стили выбранной строки</div>
                <template #panel>
                    <ui-row-style-settings
                        v-bind="{
                            propName: 'selectedRowStyle',
                            propSettings: props.selectedRowStyle
                        }"
                        @change="onRowSettingsChange" />
                </template>
            </ui-has-panel>

            <ui-has-panel>
                <ui-checkbox prop="defaultValue.enable">Предустановленное значение</ui-checkbox>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Предустановленное значение', slot: 'default' }]">
                        <template #default>
                            <ui-container>
                                <ui-select prop="defaultValue.field" :options="dimensionMetricNameOptions">
                                    метрика/измерение значения
                                </ui-select>
                                <ui-input prop="defaultValue.value">Значение</ui-input>
                            </ui-container>
                        </template>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-switch prop="isFooterSlotShown">Отображать слот в подвале таблицы</ui-switch>

            <ui-switch prop="isRowSlotShown">Отображать слот строки</ui-switch>

            <ui-switch prop="isResultRowSticky">Фиксировать результирующую строку</ui-switch>

            <ui-has-panel>
                <ui-checkbox prop="alertNoRows.isShown">Предупреждение, если нет строк</ui-checkbox>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Настройки замещающего текста ', slot: 'no-rows' }]">
                        <template #no-rows>
                            <ui-container>
                                <ui-input prop="alertNoRows.text">Текст</ui-input>
                                <ui-input prop="alertNoRows.classes">CSS-классы</ui-input>
                                <ui-switch prop="alertNoRows.withColumns">Показывать заголовки у колонок</ui-switch>
                            </ui-container>
                        </template>
                    </ui-panel>
                </template>
            </ui-has-panel>
        </ui-container>
    </ui-panel-container>
</template>

<script>
import { Panel } from '@goodt-wcore/panel';
import { Query } from '@goodt-common/dremio';
import { Tooltip as UiTooltip } from 'goodteditor-ui';
import UiRowStyleSettings from './components/RowStyleSettings.vue';
import { TopHeaderFactory } from '../utils';
import { PanelInstanceTypeDescriptor } from '../types';

export default {
    extends: Panel,
    components: { UiTooltip, UiRowStyleSettings },
    data: () => ({
        /** @public */
        $meta: { name: 'Настройки виджета', icon: 'widgets' },
        ...PanelInstanceTypeDescriptor
    }),
    computed: {
        /**
         * @return {{label: string, value: any}[]}
         */
        dimensionMetricNameOptions() {
            if (this.props.dremio == null) {
                return [];
            }
            const { query, dimensionList } = this.props.dremio;
            const options = [...Query.queryMetricNames(query), ...Object.keys(dimensionList)]
                .sort((prev, next) => prev.localeCompare(next))
                .map((value) => ({ label: value, value }));
            return [{ label: '-', value: null }, ...options];
        }
    },
    methods: {
        /**
         * @param {string} propName
         * @param {Record<string, string>} settings
         */
        onRowSettingsChange(propName, settings) {
            this.props[propName] = settings;
            this.propChanged(propName);
        },
        createTopHeader() {
            const header = TopHeaderFactory();
            this.props.topHeaders.push(header);
            this.propChanged('topHeaders');
        },
        /**
         * @param {number} idx
         */
        deleteTopHeader(idx) {
            this.props.topHeaders.splice(idx, 1);
            this.propChanged('topHeaders');
        }
    }
};
</script>
