<template>
    <ui-panel-container>
        <ui-container>
            <ui-button :disabled="datasetResult == null" @click="generateTable">Сгенерировать таблицу</ui-button>
            <ui-button :disabled="datasetRequests.length === 0" @click="loadData">Загрузить данные</ui-button>

            <ui-has-panel>
                <ui-checkbox prop="zebraStyle.isShown">Стиль "зебра"</ui-checkbox>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Настройки стиля &quot;зебра&quot;', slot: 'default' }]">
                        <ui-container>
                            <ui-input-cp prop="zebraStyle.color">
                                Цвет текста
                                <template #hint>
                                    <div>Настройка применится только в случае, если она</div>
                                    <div>не была переопределена на уровне компонента таблицы</div>
                                    <div>(строки, колонки, шаблона)</div>
                                </template>
                            </ui-input-cp>
                            <ui-input-cp prop="zebraStyle.bgColor">Цвет фона</ui-input-cp>
                        </ui-container>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-has-panel>
                <ui-checkbox prop="cardsMode.isEnabled">Режим "карточки"</ui-checkbox>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Карточки', slot: 'default' }]">
                        <ui-container>
                            <ui-input
                                :disabled="isCardSizeSettledManually"
                                min="0"
                                prop="cardsMode.columnCount"
                                type="number">
                                Количество колонок
                            </ui-input>
                            <ui-has-two-columns>
                                <template #left>
                                    <ui-input-units :units="SizeUnits" prop="cardsMode.gap[0]">
                                        Верт. отступ
                                    </ui-input-units>
                                </template>
                                <template #right>
                                    <ui-input-units :units="SizeUnits" prop="cardsMode.gap[1]">
                                        Гориз. отступ
                                    </ui-input-units>
                                </template>
                            </ui-has-two-columns>
                            <ui-has-two-columns>
                                <template #left>
                                    <ui-input-units
                                        :options="SizeOptions"
                                        :units="SizeUnits"
                                        prop="cardsMode.card.width">
                                        Ширина карточки
                                    </ui-input-units>
                                </template>
                                <template #right>
                                    <ui-input-units
                                        :options="SizeOptions"
                                        :units="SizeUnits"
                                        prop="cardsMode.card.height">
                                        Высота карточки
                                    </ui-input-units>
                                </template>
                            </ui-has-two-columns>
                        </ui-container>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-has-panel>
                <ui-checkbox prop="resultRow.isEnabled">Результирующая строка</ui-checkbox>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Результирующая строка', slot: 'default' }]">
                        <ui-container>
                            <ui-select prop="resultRow.position" :options="ResultRowPositionOptions">
                                Расположение
                            </ui-select>
                        </ui-container>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-has-panel>
                <ui-label label-size="small">Группировка</ui-label>
                <template #panel>
                    <ui-panel :groups="[{ slot: 'default', name: 'Группировка' }]">
                        <ui-container>
                            <ui-select prop="fieldToSelectFilter" :options="dimensionMetricOptions">
                                Метрика/измерение группировки
                                <template #hint>Задает признак группировки на уровне родительской таблицы</template>
                            </ui-select>
                            <ui-select prop="fieldToApplyFilter" :options="dataFieldOptions">
                                Поле для применения группировки
                                <template #hint>Определяет признак группировки значений дочерней таблицы</template>
                            </ui-select>
                        </ui-container>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-has-panel>
                <ui-label label-size="small">Предустановленное значение</ui-label>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Предустановленное значение', slot: 'default' }]">
                        <ui-container>
                            <ui-switch prop="rowPreset.shouldChooseFirst">Первое значение</ui-switch>
                            <ui-select
                                prop="rowPreset.dataField"
                                :options="dimensionMetricOptions"
                                :disabled="props.rowPreset.shouldChooseFirst">
                                метрика/измерение
                            </ui-select>
                            <ui-input prop="rowPreset.value" :disabled="props.rowPreset.shouldChooseFirst">
                                Значение
                            </ui-input>
                        </ui-container>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-switch prop="canMultipleSelect">Мультиселект строк</ui-switch>

            <ui-switch prop="isWaitingForState">Скрывать, если хранилище пусто</ui-switch>

            <ui-switch prop="shouldDisplaySkeleton">Отображать скелетон при загрузке</ui-switch>

            <ui-select prop="routeQueryParamNames" multiple :options="dimensionMetricOptions">
                Запись в url страницы
            </ui-select>

            <ui-select prop="metricForSelect" :options="dimensionMetricOptions">
                Измерение/метрика для селекта
                <template #hint>
                    При отправке значений на слушание переменной выбранного измерения/метрики будет происходить селект
                    соответствующих значений виджета.
                </template>
            </ui-select>
            <ui-switch prop="isQueryFilterOperatorLike"></ui-switch>
        </ui-container>
    </ui-panel-container>
</template>
<script>
import { Panel } from '@goodt-wcore/panel';
import { SizeUnits } from '@goodt-wcore/panels';
import { usePanelDatasetMixin, PanelDatasetMixinTypes } from '@goodt-common/data';

import { PanelInstanceTypeDescriptor } from '../types';
import { SizeOptions, ResultRowPositionOptions } from './config';

export default {
    extends: Panel,
    mixins: [usePanelDatasetMixin()],
    meta: { name: 'Настройки виджета', icon: 'widgets' },
    static: {
        SizeUnits,
        SizeOptions,
        ResultRowPositionOptions
    },
    computed: {
        dimensionMetricOptions() {
            return this.buildOptions(this.dimensionsMetrics, { empty: true });
        },
        dataFieldOptions() {
            return this.buildOptions(this.fields, { empty: true });
        },
        datasetResult() {
            return this.elementInstance?.result;
        },
        isCardSizeSettledManually() {
            // eslint-disable-next-line goodt-rules/no-long-prop-chains
            return this.props.cardsMode.card.width != null;
        }
    },
    methods: {
        ...PanelDatasetMixinTypes,
        ...PanelInstanceTypeDescriptor,
        generateTable() {
            this.elementInstance?.generateTable();
        },
        loadData() {
            this.elementInstance?.loadData();
        }
    }
};
</script>
