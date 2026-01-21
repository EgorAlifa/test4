<template>
    <ui-panel-container>
        <ui-container>
            <ui-select prop="points.dataset" :options="datasetOptions">Источник для настроек точек</ui-select>
            <ui-has-two-columns>
                <template #left>
                    <ui-select prop="points.longitude" :options="metrics">Долгота</ui-select>
                </template>
                <template #right>
                    <ui-select prop="points.latitude" :options="metrics">Широта</ui-select>
                </template>
            </ui-has-two-columns>
            <ui-select prop="points.type" :options="PointTypesOptions">Отображение по умолчанию</ui-select>
            <ui-has-two-columns v-if="isPointType">
                <template #left>
                    <ui-input-cp prop="points.point.defaultColor">Цвет по умолчанию</ui-input-cp>
                </template>
                <template #right>
                    <ui-input-units v-model="pointDefaultSizeWithUnit" :units="SizeUnits">
                        Размер по умолчанию
                    </ui-input-units>
                </template>
            </ui-has-two-columns>
            <ui-input-browse v-if="!isPointType" prop="points.marker.url">Маркер по умолчанию</ui-input-browse>
            <ui-has-two-columns v-if="!isPointType">
                <template #left>
                    <ui-input-units v-model="markerWidthWithUnit" :units="SizeUnits">Ширина маркера</ui-input-units>
                </template>
                <template #right>
                    <ui-input-units v-model="markerHeightWithUnit" :units="SizeUnits">Высота маркера</ui-input-units>
                </template>
            </ui-has-two-columns>
            <ui-has-panel>
                <ui-checkbox prop="points.sizeByRule.isEnabled">Размер по условию</ui-checkbox>
                <template #panel>
                    <ui-panel :groups="[{ slot: 'default', name: 'Размер по условию' }]">
                        <ui-container>
                            <ui-select prop="points.sizeByRule.metric" :options="metrics">
                                <ui-hint>
                                    <template #label>Расчет размера исходя из</template>
                                    Берётся минимальное значение из:
                                    <br />
                                    1.Размер по умолчанию*значение метрики/фиксация размера;
                                    <br />
                                    2.Максимальный размер.
                                </ui-hint>
                            </ui-select>

                            <ui-input-units v-model="optimizationSizeWithUnit" :units="SizeUnits">
                                Фиксация размера
                            </ui-input-units>

                            <ui-input-units v-model="maxSizePointWithUnit" :units="SizeUnits">
                                Максимальный размер
                            </ui-input-units>
                        </ui-container>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-has-panel>
                <ui-checkbox prop="points.viewByRules.isEnabled">Отображение по условию</ui-checkbox>
                <template #panel>
                    <ui-panel :groups="[{ slot: 'default', name: 'Отображение по условию' }]">
                        <ui-container>
                            <ui-select prop="points.viewByRules.metric" :options="metricDimensionList">
                                Измерение/метрика
                            </ui-select>
                            <ui-select prop="points.viewByRules.ruleType" :options="RuleTypesOptions">
                                Тип условия
                            </ui-select>
                            <ui-button @click="addRange">Добавить условие</ui-button>
                            <ui-collapse v-for="(rule, idx) in props.points.viewByRules.rules" :key="'range' + idx">
                                <template #header>
                                    Условие {{ idx + 1 }}
                                    <i
                                        class="pull-right mdi mdi-delete color-red mdi-16px"
                                        @click.stop="removeRange(idx)"></i>
                                </template>
                                <ui-container>
                                    <ui-has-two-columns v-if="isNumberRuleType">
                                        <template #left>
                                            <ui-input
                                                type="number"
                                                v-model.number="rule.from"
                                                min="0"
                                                @change="propChanged('points')">
                                                Значение от
                                            </ui-input>
                                        </template>
                                        <template #right>
                                            <ui-input
                                                type="number"
                                                v-model.number="rule.to"
                                                min="0"
                                                @change="propChanged('points')">
                                                Значение до
                                            </ui-input>
                                        </template>
                                    </ui-has-two-columns>
                                    <ui-input v-else v-model.number="rule.value" @change="propChanged('points')">
                                        Значение
                                    </ui-input>
                                    <ui-has-two-columns>
                                        <template #left>
                                            <ui-input
                                                type="number"
                                                v-model.number="rule.zoomFrom"
                                                min="0"
                                                @change="propChanged('points')">
                                                Масштаб от
                                            </ui-input>
                                        </template>
                                        <template #right>
                                            <ui-input
                                                type="number"
                                                v-model.number="rule.zoomTo"
                                                min="0"
                                                @change="propChanged('points')">
                                                Масштаб до
                                            </ui-input>
                                        </template>
                                    </ui-has-two-columns>
                                    <ui-input-cp
                                        v-if="isPointType"
                                        v-model="rule.color"
                                        @change="propChanged('points')">
                                        Настройка цвета
                                    </ui-input-cp>
                                    <ui-input-browse v-else v-model="rule.marker" @change="propChanged('points')">
                                        Маркер условия
                                    </ui-input-browse>
                                </ui-container>
                            </ui-collapse>
                        </ui-container>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-has-panel>
                <ui-checkbox prop="points.clusters.isEnabled">Агрегация точек</ui-checkbox>
                <template #panel>
                    <ui-panel :groups="[{ slot: 'default', name: 'Настройки агрегации' }]">
                        <ui-panel
                            :groups="[
                                { slot: 'rules', name: 'Правила' },
                                { slot: 'view', name: 'Отображение' }
                            ]">
                            <template #rules>
                                <ui-container>
                                    <ui-select prop="points.clusters.metric" :options="metricDimensionList">
                                        Измерение/метрика для агрегации
                                    </ui-select>
                                    <ui-switch prop="points.clusters.spiderfyOnMaxZoom">
                                        <ui-hint>
                                            <template #label>Граф объектов агрегата</template>
                                            При нажатии на агрегат на нижнем уровне масштабирования отображается граф
                                            объектов агрегата.
                                        </ui-hint>
                                    </ui-switch>
                                    <ui-input type="number" prop="points.clusters.distanceFromCenter">
                                        Расстояние объектов от центра
                                    </ui-input>
                                    <ui-input type="number" prop="points.clusters.markerDistance">
                                        Расстояние объектов друг от друга
                                    </ui-input>
                                </ui-container>
                            </template>
                            <template #view>
                                <ui-container>
                                    <ui-input-cp prop="points.clusters.defaultColor">Цвет текста</ui-input-cp>
                                    <ui-input-cp prop="points.clusters.defaultBackground">
                                        Цвет заливки агрегата
                                    </ui-input-cp>

                                    <ui-has-panel>
                                        <ui-checkbox prop="points.clusters.useRules">
                                            Заливка агрегата по условию
                                        </ui-checkbox>
                                        <template #panel>
                                            <ui-container>
                                                <p>Заливка агрегата по условию</p>
                                                <ui-button @click="addClusterRule">Добавить правило</ui-button>
                                                <ui-collapse
                                                    v-for="(rule, idx) in props.points.clusters.rules"
                                                    :key="idx">
                                                    <template #header>
                                                        <div class="d-flex flex-v-center flex-h-space-between">
                                                            <span class="text-truncate">
                                                                {{ getRuleName(rule, idx) }}
                                                            </span>

                                                            <div class="d-flex flex-v-center text-truncate">
                                                                <i
                                                                    class="pull-right mdi mdi-square mar-right-3"
                                                                    :style="{ color: rule.background }" />
                                                                <ui-button
                                                                    class="min-height-18"
                                                                    type="ghost"
                                                                    @click.stop="removeClusterRule(idx)">
                                                                    <i class="mdi mdi-delete color-red" />
                                                                </ui-button>
                                                            </div>
                                                        </div>
                                                    </template>
                                                    <ui-container>
                                                        <ui-has-two-columns>
                                                            <template #left>
                                                                <ui-input
                                                                    type="number"
                                                                    v-model.number="rule.from"
                                                                    min="0"
                                                                    @change="propChanged('points')">
                                                                    Значение от
                                                                </ui-input>
                                                            </template>
                                                            <template #right>
                                                                <ui-input
                                                                    type="number"
                                                                    v-model.number="rule.to"
                                                                    min="0"
                                                                    @change="propChanged('points')">
                                                                    Значение до
                                                                </ui-input>
                                                            </template>
                                                        </ui-has-two-columns>
                                                        <ui-input-cp
                                                            v-model="rule.background"
                                                            @change="propChanged('points')">
                                                            Цвет заливки агрегата
                                                        </ui-input-cp>
                                                        <ui-input-cp
                                                            v-model="rule.color"
                                                            @change="propChanged('points')">
                                                            Цвет текста
                                                        </ui-input-cp>
                                                    </ui-container>
                                                </ui-collapse>
                                            </ui-container>
                                        </template>
                                    </ui-has-panel>

                                    <ui-has-panel>
                                        <ui-checkbox prop="points.clusters.spiderfyShape.isEnabled">
                                            Показывать покрытие агрегата
                                        </ui-checkbox>
                                        <template #panel>
                                            <ui-panel :groups="[{ slot: 'default', name: 'Покрытие агрегата' }]">
                                                <ui-container>
                                                    <ui-input type="number" prop="points.clusters.spiderfyShape.weight">
                                                        Толщина линии
                                                    </ui-input>
                                                    <ui-input-cp prop="points.clusters.spiderfyShape.color">
                                                        Цвет линий
                                                    </ui-input-cp>
                                                    <ui-input-cp prop="points.clusters.spiderfyShape.fillColor">
                                                        Цвет покрытия агрегата
                                                    </ui-input-cp>
                                                </ui-container>
                                            </ui-panel>
                                        </template>
                                    </ui-has-panel>
                                </ui-container>
                            </template>
                        </ui-panel>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-has-panel>
                <ui-checkbox prop="points.hint.isEnabled">Подсказка</ui-checkbox>
                <template #panel>
                    <p>Настройки подсказки</p>
                    <ui-panel
                        :groups="[
                            { slot: 'view', name: 'Отображение' },
                            { slot: 'content', name: 'Содержимое' }
                        ]">
                        <template #view>
                            <ui-container>
                                <ui-select prop="points.hint.viewMode" :options="TooltipViewOptions">
                                    Режим отображения
                                </ui-select>
                                <ui-input-cp prop="points.hint.background">Цвет фона</ui-input-cp>
                                <ui-has-two-columns>
                                    <template #left>
                                        <ui-input-units prop="points.hint.borderWidth" :units="SizeUnits">
                                            Толщина границы
                                        </ui-input-units>
                                    </template>
                                    <template #right>
                                        <ui-input-cp prop="points.hint.borderColor">Цвет границы</ui-input-cp>
                                    </template>
                                </ui-has-two-columns>
                                <ui-select prop="points.hint.direction" :options="TooltipAlignOptions">
                                    Расположение подсказки от точки
                                </ui-select>
                                <ui-input-cp prop="points.hint.triangleColor">Цвет треугольника подсказки</ui-input-cp>
                                <ui-has-two-columns>
                                    <template #left>
                                        <ui-input-units prop="points.hint.verticalPadding" :units="SizeUnits">
                                            Вертикальный отступ
                                        </ui-input-units>
                                    </template>
                                    <template #right>
                                        <ui-input-units prop="points.hint.horizontalPadding" :units="SizeUnits">
                                            Горизонтальный отступ
                                        </ui-input-units>
                                    </template>
                                </ui-has-two-columns>
                                <ui-input prop="points.hint.boxShadow">Тень</ui-input>
                            </ui-container>
                        </template>
                        <template #content>
                            <ui-container>
                                <ui-button @click="addMetricsTooltip">Добавить значение</ui-button>
                                <draggable v-model="columns" v-bind="DEFAULT_DRAG_OPTIONS">
                                    <ui-collapse class="p" v-for="(metric, idx) in columns" :key="idx">
                                        <template #header>
                                            <div class="d-flex flex-v-center flex-h-space-between">
                                                <div class="d-flex flex-v-center text-truncate">
                                                    <i
                                                        class="mdi mdi-drag mdi-15px cursor-move drag-handle mar-right-3" />
                                                    <span
                                                        :title="metric.metric || 'Значение ' + (idx + 1)"
                                                        class="text-truncate">
                                                        {{ metric.metric || 'Значение ' + (idx + 1) }}
                                                    </span>
                                                </div>
                                                <ui-button
                                                    class="min-height-18"
                                                    type="ghost"
                                                    @click.stop="removeMetricTooltip(idx)">
                                                    <i class="mdi mdi-delete color-red" />
                                                </ui-button>
                                            </div>
                                        </template>
                                        <ui-container>
                                            <ui-select
                                                v-model="metric.metric"
                                                :options="metricDimensionList"
                                                @change="propChanged('points')">
                                                Измерение/метрика
                                            </ui-select>
                                            <ui-has-two-columns>
                                                <template #left>
                                                    <ui-input-units
                                                        v-model="metric.fontSize"
                                                        :units="SizeUnits"
                                                        @change="propChanged('points')">
                                                        Размер
                                                    </ui-input-units>
                                                </template>
                                                <template #right>
                                                    <ui-input-cp v-model="metric.color" @change="propChanged('points')">
                                                        Цвет
                                                    </ui-input-cp>
                                                </template>
                                            </ui-has-two-columns>
                                            <ui-select
                                                v-model="metric.textAlign"
                                                :options="TextAlignOptions"
                                                @change="propChanged('points')">
                                                Выравнивание текста
                                            </ui-select>
                                            <ui-input v-model="metric.fontFamily" @change="propChanged('points')">
                                                Шрифт
                                            </ui-input>

                                            <ui-has-two-columns>
                                                <template #left>
                                                    <ui-input v-model="metric.prefix" @change="propChanged('points')">
                                                        Префикс
                                                    </ui-input>
                                                </template>
                                                <template #right>
                                                    <ui-input v-model="metric.postfix" @change="propChanged('points')">
                                                        Постфикс
                                                    </ui-input>
                                                </template>
                                            </ui-has-two-columns>

                                            <ui-number-format v-model="metric.format" @change="propChanged('points')">
                                                Числовой формат
                                            </ui-number-format>
                                        </ui-container>
                                    </ui-collapse>
                                </draggable>
                            </ui-container>
                        </template>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-has-panel>
                <ui-checkbox prop="points.hoverSettings.isEnabled" :disabled="props.selectPointSettings.isEnabled">
                    Стили при наведении
                </ui-checkbox>
                <template #panel>
                    <p>Стили при наведении</p>
                    <ui-panel
                        :groups="[
                            { name: 'Выбранная', slot: 'hover' },
                            { name: 'Остальные', slot: 'unHover' }
                        ]">
                        <template #hover>
                            <ui-container>
                                <ui-input
                                    type="number"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    prop="points.hoverSettings.hoverOpacity">
                                    Прозрачность границы
                                </ui-input>
                                <ui-input
                                    type="number"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    prop="points.hoverSettings.hoverFillOpacity">
                                    Прозрачность заливки
                                </ui-input>
                            </ui-container>
                        </template>

                        <template #unHover>
                            <ui-container>
                                <ui-input type="number" min="0" max="1" step="0.1" prop="points.hoverSettings.opacity">
                                    Прозрачность границы
                                </ui-input>
                                <ui-input
                                    type="number"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    prop="points.hoverSettings.fillOpacity">
                                    Прозрачность заливки
                                </ui-input>
                            </ui-container>
                        </template>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-has-panel>
                <ui-checkbox prop="selectPointSettings.isEnabled" :disabled="props.points.hoverSettings.isEnabled">
                    <ui-hint>
                        <template #label>Стили при нажатии</template>
                        Данная настройка и "Стили при наведении" - взаимоисключающие.
                    </ui-hint>
                </ui-checkbox>
                <template #panel>
                    <p>Стили при нажатии</p>
                    <ui-panel
                        :groups="[
                            { name: 'Выбранная', slot: 'selected' },
                            { name: 'Остальные', slot: 'unSelected' }
                        ]">
                        <template #selected>
                            <ui-container>
                                <ui-input
                                    type="number"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    prop="selectPointSettings.selectOpacity">
                                    Прозрачность границы
                                </ui-input>
                                <ui-input
                                    type="number"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    prop="selectPointSettings.selectFillOpacity">
                                    Прозрачность заливки
                                </ui-input>
                            </ui-container>
                        </template>

                        <template #unSelected>
                            <ui-container>
                                <ui-input type="number" min="0" max="1" step="0.1" prop="selectPointSettings.opacity">
                                    Прозрачность границы
                                </ui-input>
                                <ui-input
                                    type="number"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    prop="selectPointSettings.fillOpacity">
                                    Прозрачность заливки
                                </ui-input>
                            </ui-container>
                        </template>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-has-panel>
                <span class="form-label form-label-small">
                    <ui-hint>
                        <template #label>Настройка фильтрации точек</template>
                        Настройка отображения при дриллдауне точек/маркеров только по конкретному объекту слоя.
                        <br />
                        Параметры указываются по слою, в который идет проваливание. Настройка доступна при активации
                        <br />
                        свитча "Фильтровать точки" в панели настройки слоев.
                    </ui-hint>
                </span>
                <template #panel>
                    <ui-panel :groups="[{ slot: 'default', name: 'Настройка фильтрации точек' }]">
                        <ui-container>
                            <ui-select
                                prop="filterPointMetric"
                                :disabled="!props.hasFilterPointsByRegion"
                                :options="metricDimensionList">
                                Идентификатор объекта в источнике
                            </ui-select>
                            <ui-input prop="filterGeoJSON" :disabled="!props.hasFilterPointsByRegion">
                                Идентификатор объекта в слое
                            </ui-input>
                        </ui-container>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-switch prop="shouldResetState">
                <ui-hint>
                    <template #label>Сброс переменной</template>
                    Настройка позволяет регулировать сброс переменной по повторному нажатию на уже выбранную
                    точку/маркер.
                </ui-hint>
            </ui-switch>

            <ui-select prop="metricsFlightOfTheBumblebee" :options="metricDimensionList">
                <ui-hint>
                    <template #label>Измерение/метрика для перемещения</template>
                    По значениям выбранного измерения/метрики происходит перемещение к точкам при получении
                    соответствующего значения переменной в хранилище.
                    <br />
                    Для настройки перемещения по координатам используется отдельная переменная "Перемещение", которая
                    принимает значения в виде [x,y].
                </ui-hint>
            </ui-select>

            <ui-select prop="searchMetric" :options="metricDimensionList">
                <ui-hint>
                    <template #label>Измерение/метрика для поиска</template>
                    По значениям выбранного измерения/метрики происходит перемещение к точкам при использовании поля
                    поиска.
                    <br />
                    При этом дополнительная настройка переменных не нужна.
                    <br />
                    Сброс поиска переносит на координаты "Центра карты" и "Масштаб перемещения" в настройках анимации.
                </ui-hint>
            </ui-select>

            <ui-input-auto prop="url">Переход по ссылке</ui-input-auto>
        </ui-container>
    </ui-panel-container>
</template>
<script>
import { Panel, Panels, Dremio } from 'goodt-wcore';
import draggable from 'vuedraggable';

import {
    PointTypesOptions,
    RuleTypesOptions,
    TooltipViewOptions,
    TextAlignOptions,
    TooltipAlignOptions
} from './config';
import { PointTypes, RuleTypes } from '../constants';
import { DEFAULT_DRAG_OPTIONS } from './constants';
import { resolveSizeUnits } from '../utils/utils';

const { Query } = Dremio;

const { SizeUnits } = Panels;

export default {
    extends: Panel,
    components: {
        draggable
    },
    static: {
        PointTypesOptions,
        RuleTypesOptions,
        PointTypes,
        RuleTypes,
        SizeUnits,
        TooltipViewOptions,
        TextAlignOptions,
        TooltipAlignOptions,
        DEFAULT_DRAG_OPTIONS
    },
    data() {
        return {
            /** @public */
            $meta: { name: 'Настройки точек', icon: 'map-marker' }
        };
    },
    computed: {
        pointDefaultSizeWithUnit: {
            get() {
                const {
                    points: {
                        point: { defaultSize }
                    }
                } = this.props;
                return resolveSizeUnits(defaultSize);
            },
            set(value) {
                // eslint-disable-next-line goodt-rules/no-long-prop-chains
                this.props.points.point.defaultSize = value;
                this.propChanged('points');
            }
        },
        markerWidthWithUnit: {
            get() {
                const {
                    points: {
                        marker: { width }
                    }
                } = this.props;
                return resolveSizeUnits(width);
            },
            set(value) {
                // eslint-disable-next-line goodt-rules/no-long-prop-chains
                this.props.points.marker.width = value;
                this.propChanged('points');
            }
        },
        markerHeightWithUnit: {
            get() {
                const {
                    points: {
                        marker: { height }
                    }
                } = this.props;
                return resolveSizeUnits(height);
            },
            set(value) {
                // eslint-disable-next-line goodt-rules/no-long-prop-chains
                this.props.points.marker.height = value;
                this.propChanged('points');
            }
        },
        optimizationSizeWithUnit: {
            get() {
                const {
                    points: {
                        sizeByRule: { optimizationSize }
                    }
                } = this.props;
                return resolveSizeUnits(optimizationSize);
            },
            set(value) {
                // eslint-disable-next-line goodt-rules/no-long-prop-chains
                this.props.points.sizeByRule.optimizationSize = value;
                this.propChanged('points');
            }
        },
        maxSizePointWithUnit: {
            get() {
                const {
                    points: {
                        sizeByRule: { maxSizePoint }
                    }
                } = this.props;
                return resolveSizeUnits(maxSizePoint);
            },
            set(value) {
                // eslint-disable-next-line goodt-rules/no-long-prop-chains
                this.props.points.sizeByRule.maxSizePoint = value;
                this.propChanged('points');
            }
        },
        isPointType() {
            const { type } = this.props.points;
            return type === PointTypes.POINT;
        },
        isNumberRuleType() {
            const {
                viewByRules: { ruleType }
            } = this.props.points;
            return ruleType === RuleTypes.NUMBER;
        },
        columns: {
            get() {
                const {
                    hint: { metrics }
                } = this.props.points;
                return metrics;
            },
            set(val) {
                const { hint } = this.props.points;
                hint.metrics = val;
                this.propChanged('points');
            }
        },
        queryHelper() {
            return this.elementInstance ? this.elementInstance.queryHelper : null;
        },
        datasetOptions() {
            const defaultOption = { value: null, label: '-' };
            if (this.queryHelper == null) {
                return [defaultOption];
            }

            const mainDatasetOption = {
                value: 'main',
                label: this.queryHelper.query[Query.KEY.FROM].slice(-1)[0]
            };

            const { additionalDremio } = this.props;
            if (additionalDremio == null) {
                return [defaultOption, mainDatasetOption];
            }

            const additionalDatasetOption = {
                value: 0,
                label:
                    additionalDremio.query[Query.KEY.FROM].slice(-1)[0] === mainDatasetOption.label
                        ? `${additionalDremio.query[Query.KEY.FROM].slice(-1)[0]} - доп источник`
                        : additionalDremio.query[Query.KEY.FROM].slice(-1)[0]
            };

            return [defaultOption, mainDatasetOption, additionalDatasetOption];
        },
        metrics() {
            const { dataset } = this.props.points;
            const defaultMetric = { label: '-', value: null };

            if (dataset == null) {
                return [defaultMetric];
            }

            if (dataset === 'main') {
                const { dremio } = this.props;
                if (dremio == null) {
                    return [defaultMetric];
                }

                const metrics = Query.queryMetricNames(dremio.query).map((value) => ({
                    label: value,
                    value
                }));

                return [defaultMetric, ...metrics];
            }

            const { additionalDremio } = this.props;
            if (additionalDremio == null) {
                return [defaultMetric];
            }

            const metrics = Query.queryMetricNames(additionalDremio.query).map((value) => ({
                label: value,
                value
            }));
            return [defaultMetric, ...metrics];
        },
        dimensions() {
            const { dataset } = this.props.points;

            if (dataset == null) {
                return [];
            }

            if (dataset === 'main') {
                const { dremio } = this.props;
                if (dremio == null) {
                    return [];
                }

                return Object.keys(dremio.dimensionList);
            }

            const { additionalDremio } = this.props;
            if (additionalDremio == null) {
                return [];
            }

            return Object.keys(additionalDremio.dimensionList);
        },
        metricDimensionList() {
            return [...this.metrics, ...this.dimensions];
        }
    },
    methods: {
        removeMetricTooltip(idx) {
            this.props.points.hint.metrics.splice(idx, 1);
            this.propChanged('points');
        },
        addMetricsTooltip() {
            this.props.points.hint.metrics.push({
                metric: null,
                fontSize: '14px',
                textAlign: 'left',
                prefix: '',
                postfix: '',
                fontFamily: '',
                color: 'rgba(0, 0, 0, 1)',
                format: ''
            });
            this.propChanged('points');
        },
        addRange() {
            this.props.points.viewByRules.rules.push({
                to: null,
                from: null,
                value: null,
                zoomFrom: 2,
                zoomTo: 8,
                color: '#00EEFF',
                marker: null
            });
            this.propChanged('points');
        },
        removeRange(idx) {
            this.props.points.viewByRules.rules.splice(idx, 1);
            this.propChanged('points');
        },
        addClusterRule() {
            this.props.points.clusters.rules.push({
                from: 0,
                to: 10,
                background: '',
                color: ''
            });
            this.propChanged('points');
        },
        removeClusterRule(idx) {
            this.props.points.clusters.rules.splice(idx, 1);
            this.propChanged('points');
        },
        getRuleName(rule) {
            return `Правило ${rule.from}-${rule.to}`;
        }
    }
};
</script>
<style lang="pcss" scoped src="./defaultPanelStyles.pcss" />
