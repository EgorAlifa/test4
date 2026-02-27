<template>
    <w-panel>
        <ui-container>
            <ui-has-panel>
                <div class="form-label form-label-small">Настройки баров</div>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Настройка баров', slot: 'default' }]">
                        <ui-container>
                            <ui-input-units prop="barGap" :units="SizeUnits"></ui-input-units>
                        </ui-container>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-has-panel>
                <ui-checkbox prop="tooltip.show">Стандартный тултип</ui-checkbox>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Настройка тултипа', slot: 'tooltip' }]">
                        <template #tooltip>
                            <ui-container>
                                <ui-select prop="tooltip.trigger" :options="TRIGGER_OPTIONS">
                                    <ui-hint>
                                        <template #label>Показывать при наведении на</template>
                                        Настройки тултипа, показываемого при наведении на метрику, задаются в настройках
                                        самой Метрики.
                                    </ui-hint>
                                </ui-select>

                                <ui-switch prop="tooltip.isNestedFromMetric" :disabled="isItemTypeTooltipTrigger">
                                    Наследовать формат от метрик
                                </ui-switch>

                                <ui-select
                                    :disabled="isFormatSettingsDisabled"
                                    prop="tooltip.format"
                                    :options="METRIC_FORMAT_OPTIONS">
                                    Формат тултипа
                                </ui-select>

                                <ui-select
                                    :disabled="isFormatSettingsDisabled"
                                    prop="tooltip.separator"
                                    :options="separatorOptions">
                                    Формат разделителя разрядов
                                </ui-select>

                                <ui-has-two-columns>
                                    <template #left>
                                        <ui-input :disabled="isFormatSettingsDisabled" prop="tooltip.prefix">
                                            Префикс
                                        </ui-input>
                                    </template>
                                    <template #right>
                                        <ui-input :disabled="isFormatSettingsDisabled" prop="tooltip.postfix">
                                            Постфикс
                                        </ui-input>
                                    </template>
                                </ui-has-two-columns>

                                <ui-switch :disabled="isItemTypeTooltipTrigger" prop="tooltip.showCategory">
                                    Показать значение измерения
                                </ui-switch>

                                <ui-switch :disabled="isItemTypeTooltipTrigger" prop="tooltip.showNullishValues">
                                    Показать нулевые значения
                                </ui-switch>

                                <ui-switch :disabled="isItemTypeTooltipTrigger" prop="tooltip.reverseMetrics">
                                    Выводить в обратном порядке
                                </ui-switch>

                                <ui-switch :disabled="isItemTypeTooltipTrigger" prop="tooltip.isAbsoluteValue">
                                    Выводить абсолютные значения
                                </ui-switch>

                                <ui-select
                                    :disabled="isItemTypeTooltipTrigger"
                                    prop="tooltip.excludes"
                                    :options="metricNameOptions"
                                    multiple>
                                    Исключения
                                </ui-select>
                            </ui-container>
                        </template>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-has-panel>
                <ui-checkbox prop="axisPointer.show">Указатель оси</ui-checkbox>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Настройка указателя оси', slot: 'axis-pointer' }]">
                        <template #axis-pointer>
                            <ui-container>
                                <ui-input
                                    col-size="6-12"
                                    type="number"
                                    v-model.number="props.axisPointer.lineStyle.width"
                                    @change="propChanged('axisPointer')">
                                    Ширина линии
                                </ui-input>
                            </ui-container>
                        </template>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-has-panel>
                <ui-checkbox prop="legend.show">Легенда</ui-checkbox>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Настройка легенды', slot: 'legend' }]">
                        <template #legend>
                            <ui-container>
                                <ui-switch
                                    v-model="props.legendManualSize.isManualMode"
                                    @change="propChanged('legendManualSize')">
                                    Точное расположение
                                </ui-switch>
                                <ui-collapse v-if="props.legendManualSize.isManualMode">
                                    <template #header>Расположение</template>
                                    <ui-input-units
                                        v-model="props.legendManualSize.left"
                                        :units="SizeUnits"
                                        @change="propChanged('legendManualSize')">
                                        Отступ слева
                                    </ui-input-units>
                                    <ui-input-units
                                        v-model="props.legendManualSize.right"
                                        :units="SizeUnits"
                                        @change="propChanged('legendManualSize')">
                                        Отступ справа
                                    </ui-input-units>
                                    <ui-input-units
                                        v-model="props.legendManualSize.top"
                                        :units="SizeUnits"
                                        @change="propChanged('legendManualSize')">
                                        Отступ сверху
                                    </ui-input-units>
                                    <ui-input-units
                                        v-model="props.legendManualSize.bottom"
                                        :units="SizeUnits"
                                        @change="propChanged('legendManualSize')">
                                        Отступ снизу
                                    </ui-input-units>
                                </ui-collapse>
                                <ui-select
                                    v-else
                                    v-model="props.legend.position"
                                    :options="LEGEND_POSITIONS"
                                    @change="changeLegend('legend')">
                                    Расположение
                                </ui-select>
                                <ui-input-cp v-model="props.legend.textStyle.color" @change="propChanged('legend')">
                                    Цвет шрифта
                                </ui-input-cp>
                                <ui-input-auto
                                    v-model="props.legend.textStyle.fontFamily"
                                    @change="propChanged('legend')">
                                    Шрифт
                                </ui-input-auto>
                                <ui-input-units
                                    col-size="6-12"
                                    min="0"
                                    :units="FontSizeFirstPxUnits"
                                    v-model="propsLegendTextStyleFontSize"
                                    @change="propChanged('legend')">
                                    Размер шрифта
                                </ui-input-units>
                                <ui-select prop="legend.icon" :options="LegendIconOptions">Тип иконки</ui-select>
                                <ui-input type="number" min="0" prop="legend.itemWidth">Ширина иконки</ui-input>
                                <ui-input type="number" min="0" prop="legend.itemHeight">Высота иконки</ui-input>

                                <ui-input-cp prop="legend.itemStyle.borderColor">Цвет границы</ui-input-cp>
                                <ui-select prop="legend.itemStyle.borderType" :options="lineTypeOptions">
                                    Тип линии у границы
                                </ui-select>
                                <ui-input prop="legend.itemStyle.borderWidth" type="number">Толщина границы</ui-input>
                            </ui-container>
                        </template>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-has-panel>
                <ui-checkbox prop="mainTitle.show">Заголовок</ui-checkbox>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Настройка заголовка', slot: 'title' }]">
                        <template #title>
                            <ui-container>
                                <ui-input-auto prop="mainTitle.text">Текст</ui-input-auto>
                                <ui-select prop="mainTitle.left" :options="LabelAlignOptions">Выравнивание</ui-select>
                                <ui-complex-font
                                    prop="mainTitle.textStyle"
                                    :units="FontSizeFirstPxUnits"></ui-complex-font>
                            </ui-container>
                        </template>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-has-panel>
                <ui-checkbox v-model="background.show" @change="changeBackground">Фон</ui-checkbox>
                <template #panel>
                    <ui-panel
                        :groups="[
                            { name: 'Цвет', slot: 'color' },
                            { name: 'Градиент', slot: 'gradient' }
                        ]">
                        <template #color>
                            <ui-container>
                                <ui-input-cp v-model="background.color" @change="changeBackground">
                                    Цвет фона
                                </ui-input-cp>
                            </ui-container>
                        </template>
                        <template #gradient>
                            <ui-container>
                                <ui-switch v-model="background.gradient.enable" @change="changeBackground">
                                    Градиент
                                </ui-switch>
                                <ui-input-cp v-model="background.gradient.firstColor" @change="changeBackground">
                                    Первый цвет
                                </ui-input-cp>
                                <ui-input
                                    col-size="6-12"
                                    type="number"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    v-model="background.gradient.offSetFirstColor"
                                    @change="changeBackground">
                                    Смещение цвета
                                </ui-input>
                                <ui-input-cp v-model="background.gradient.secondColor" @change="changeBackground">
                                    Второй цвет
                                </ui-input-cp>
                                <ui-input
                                    col-size="6-12"
                                    type="number"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    v-model="background.gradient.offSetSecondColor"
                                    @change="changeBackground">
                                    Смещение цвета
                                </ui-input>
                                <ui-select
                                    v-model="background.gradient.position"
                                    :options="GRADIENT_POS_OPTIONS"
                                    @change="changeBackground">
                                    Направление градиента
                                </ui-select>
                            </ui-container>
                        </template>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-has-panel>
                <ui-checkbox prop="dataZoom.show">Полоса прокрутки</ui-checkbox>
                <template #panel>
                    <ui-panel
                        :groups="[
                            { name: 'Полоса', slot: 'dataZoom' },
                            { name: 'Подписи', slot: 'label' },
                            { name: 'Ползунок', slot: 'handle' }
                        ]">
                        <template #dataZoom>
                            <ui-container>
                                <ui-switch
                                    v-model="props.dataZoom.isUsedBaseMinMaxValue"
                                    @change="propChanged('dataZoom')">
                                    Подстройка значений
                                </ui-switch>
                                <ui-switch
                                    v-model="props.dataZoomInside.moveOnMouseWheel"
                                    :disabled="props.dataZoomInside.zoomOnMouseWheel"
                                    @change="propChanged('dataZoomInside')">
                                    Прокрутка колесиком
                                </ui-switch>
                                <ui-switch
                                    v-model="props.dataZoomInside.zoomOnMouseWheel"
                                    :disabled="props.dataZoomInside.moveOnMouseWheel"
                                    @change="propChanged('dataZoomInside')">
                                    Использовать зум
                                </ui-switch>
                                <ui-switch
                                    v-model="props.dataZoomInside.moveOnMouseMove"
                                    @change="propChanged('dataZoomInside')">
                                    Использовать свайп
                                </ui-switch>
                                <ui-select
                                    v-model="props.dataZoom.orient"
                                    :options="dataZoomOrient"
                                    @change="changeLegend('dataZoom')">
                                    Расположение
                                </ui-select>
                                <ui-input-cp v-model="props.dataZoom.backgroundColor" @change="propChanged('dataZoom')">
                                    Цвет бара
                                </ui-input-cp>
                                <ui-input-cp v-model="props.dataZoom.fillerColor" @change="propChanged('dataZoom')">
                                    Цвет активной части бара
                                </ui-input-cp>
                                <ui-input-cp v-model="props.dataZoom.borderColor" @change="propChanged('dataZoom')">
                                    Цвет границ
                                </ui-input-cp>
                                <ui-input-cp
                                    v-model="props.dataZoom.dataBackground.lineStyle.color"
                                    @change="propChanged('dataZoom')">
                                    Цвет линии данных
                                </ui-input-cp>
                                <ui-input
                                    type="number"
                                    min="0"
                                    step="any"
                                    v-model.number="props.dataZoom.dataBackground.lineStyle.width"
                                    @change="propChanged('dataZoom')">
                                    Толщина линии данных
                                </ui-input>
                                <ui-input-cp
                                    v-model="props.dataZoom.dataBackground.areaStyle.color"
                                    @change="propChanged('dataZoom')">
                                    Цвет зоны данных
                                </ui-input-cp>
                                <ui-checkbox v-model="props.dataZoom.isPercent" @change="propChanged('dataZoom')">
                                    Позиция в процентах
                                </ui-checkbox>
                                <ui-has-two-columns v-if="props.dataZoom.isPercent">
                                    <template #left>
                                        <ui-input
                                            type="number"
                                            :min="props.dataZoom.minPercentValue"
                                            :max="props.dataZoom.endPercentValue"
                                            v-model.number="props.dataZoom.startPercentValue"
                                            @change="propChanged('dataZoom')">
                                            Стартовая позиция
                                        </ui-input>
                                    </template>
                                    <template #right>
                                        <ui-input
                                            type="number"
                                            :min="props.dataZoom.startPercentValue"
                                            :max="props.dataZoom.maxPercentValue"
                                            v-model.number="props.dataZoom.endPercentValue"
                                            @change="propChanged('dataZoom')">
                                            Конечная позиция
                                        </ui-input>
                                    </template>
                                </ui-has-two-columns>
                                <template v-else>
                                    <ui-select
                                        v-model="dataZoomInverseDirection"
                                        :options="DataZoomDirectionOptions"
                                        @change="propChanged('dataZoom')">
                                        Начальная позиция
                                    </ui-select>
                                    <ui-input
                                        type="number"
                                        :min="props.dataZoom.startValue"
                                        v-model.number="props.dataZoom.endValue"
                                        @change="propChanged('dataZoom')">
                                        Кол-во измерений в видимой области
                                    </ui-input>
                                </template>

                                <ui-has-two-columns>
                                    <template #left>
                                        <ui-input-units
                                            :units="SizeUnits"
                                            :options="dataZoomTopPositions"
                                            v-model="props.dataZoom.top"
                                            @change="propChanged('dataZoom')">
                                            Отступ сверху
                                        </ui-input-units>
                                    </template>
                                    <template #right>
                                        <ui-input-units
                                            :units="SizeUnits"
                                            v-model="props.dataZoom.bottom"
                                            :options="[{ label: 'Auto', value: 'auto' }]"
                                            @change="propChanged('dataZoom')">
                                            Отступ снизу
                                        </ui-input-units>
                                    </template>
                                </ui-has-two-columns>
                                <ui-has-two-columns>
                                    <template #left>
                                        <ui-input-units
                                            :units="SizeUnits"
                                            :options="dataZoomLeftPositions"
                                            v-model="props.dataZoom.left"
                                            @change="propChanged('dataZoom')">
                                            Отступ слева
                                        </ui-input-units>
                                    </template>
                                    <template #right>
                                        <ui-input-units
                                            :units="SizeUnits"
                                            v-model="props.dataZoom.right"
                                            :options="[{ label: 'Авто', value: 'auto' }]"
                                            @change="propChanged('dataZoom')">
                                            Отступ справа
                                        </ui-input-units>
                                    </template>
                                </ui-has-two-columns>
                            </ui-container>
                        </template>
                        <template #label>
                            <ui-container>
                                <ui-switch v-model="props.dataZoom.showDetail" @change="propChanged('dataZoom')">
                                    Показывать подписи
                                </ui-switch>
                                <ui-input-cp v-model="props.dataZoom.textStyle.color" @change="propChanged('dataZoom')">
                                    Цвет шрифта
                                </ui-input-cp>
                                <ui-input-units
                                    :min="props.dataZoom.startValue"
                                    v-model="propsDataZoomTextStyleFontSize"
                                    :units="FontSizeFirstPxUnits"
                                    @change="propChanged('dataZoom')">
                                    Размер шрифта
                                </ui-input-units>
                                <ui-input
                                    v-model="props.dataZoom.textStyle.fontFamily"
                                    @change="propChanged('dataZoom')">
                                    Шрифт
                                </ui-input>
                            </ui-container>
                        </template>
                        <template #handle>
                            <ui-container>
                                <ui-input-units
                                    :units="SizeUnits"
                                    v-model="props.dataZoom.handleSize"
                                    @change="propChanged('dataZoom')">
                                    Размер ползунка
                                </ui-input-units>
                                <ui-input-cp
                                    v-model="props.dataZoom.handleStyle.color"
                                    @change="propChanged('dataZoom')">
                                    Цвет ползунка
                                </ui-input-cp>
                                <ui-input v-model="props.dataZoom.handleIcon" @change="propChanged('dataZoom')">
                                    Svg path иконки
                                </ui-input>
                                <ui-input-cp
                                    v-model="props.dataZoom.handleStyle.borderColor"
                                    @change="propChanged('dataZoom')">
                                    Цвет границы
                                </ui-input-cp>
                                <ui-input
                                    type="number"
                                    min="0"
                                    step="any"
                                    v-model.number="props.dataZoom.handleStyle.borderWidth"
                                    @change="propChanged('dataZoom')">
                                    Толщина границы
                                </ui-input>
                            </ui-container>
                        </template>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-has-panel>
                <ui-checkbox prop="topOptions.enable">
                    Режим топа
                    <w-tooltip position="top">
                        <template #target="{ events, binds }">
                            <i class="mdi mdi-18px mdi-help-circle-outline" v-on="events" v-bind="binds" />
                        </template>
                        <div>
                            Позволяет регулировать количество выводимых значений графика, суммируя оставшиеся значения в
                            одно
                        </div>
                    </w-tooltip>
                </ui-checkbox>
                <template #panel>
                    <ui-panel
                        :groups="[
                            { name: 'Параметры топа', slot: 'top' },
                            { name: 'Кнопка', slot: 'btn' }
                        ]">
                        <template #top>
                            <ui-container>
                                <ui-select
                                    v-model="props.topOptions.type"
                                    :options="TopTypeOptions"
                                    @change="propChanged('topOptions')">
                                    Тип
                                </ui-select>

                                <ui-collapse v-if="props.topOptions.type === TopType.METRIC">
                                    <template #header>Топ метрика</template>

                                    <w-top-metric-settings
                                        v-bind="{
                                            styles: props.topOptions.metricsStyle,
                                            axis: props.axis,
                                            dimensionOptions: props.dimensionOptions,
                                            dimValueNames,
                                            minorDimensionNames,
                                            condStyleFactory,
                                            elemComputedStyles
                                        }"
                                        @change-style="changeStyles"></w-top-metric-settings>
                                </ui-collapse>

                                <ui-select
                                    v-if="props.topOptions.type === TopType.DIMENSION"
                                    v-model="props.topOptions.metrics"
                                    :options="metricNameOptionsIncludingAll"
                                    multiple
                                    @change="propChanged('topOptions')">
                                    Метрики
                                </ui-select>
                                <ui-input
                                    type="number"
                                    min="1"
                                    v-model.number="props.topOptions.number"
                                    @change="propChanged('topOptions')">
                                    Число выводимых значений
                                </ui-input>
                                <ui-select
                                    v-model="props.topOptions.dir"
                                    :options="topDirections"
                                    @change="propChanged('topOptions')">
                                    Направление выборки
                                </ui-select>
                                <ui-switch v-model="props.topOptions.rest.show" @change="propChanged('topOptions')">
                                    Выводить оставшиеся
                                </ui-switch>
                                <ui-input v-model="props.topOptions.rest.title" @change="propChanged('topOptions')">
                                    Наименование
                                </ui-input>
                                <ui-switch
                                    v-if="props.topOptions.type === TopType.DIMENSION"
                                    v-model="props.topOptions.rest.reduce.enable"
                                    @change="propChanged('topOptions')">
                                    Обрезать значение
                                </ui-switch>
                                <ui-input
                                    v-if="props.topOptions.type === TopType.DIMENSION"
                                    type="number"
                                    min="0"
                                    v-model.number="props.topOptions.rest.reduce.percent"
                                    @change="propChanged('topOptions')">
                                    % свыше макс. значения
                                </ui-input>
                            </ui-container>
                        </template>
                        <template #btn>
                            <ui-container>
                                <ui-switch v-model="props.topOptions.btn.show" @change="propChanged('topOptions')">
                                    Отображать кнопку
                                </ui-switch>
                                <ui-input
                                    v-model="props.topOptions.btn.topIconPath"
                                    @change="propChanged('topOptions')">
                                    SVG путь иконки топа
                                </ui-input>
                                <ui-input
                                    v-model="props.topOptions.btn.defaultIconPath"
                                    @change="propChanged('topOptions')">
                                    SVG путь иконки станд. графика
                                </ui-input>
                                <ui-input v-model="props.topOptions.btn.title" @change="propChanged('topOptions')">
                                    Текст кнопки
                                </ui-input>
                            </ui-container>
                        </template>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-has-panel>
                <ui-checkbox prop="grid.isManualMode">Фиксировать отступы</ui-checkbox>
                <template #panel>
                    <ui-container>
                        <ui-input-units prop="grid.left" :units="SizeUnits">Отступ слева</ui-input-units>
                        <ui-input-units prop="grid.right" :units="SizeUnits">Отступ справа</ui-input-units>
                        <ui-input-units prop="grid.top" :units="SizeUnits">Отступ сверху</ui-input-units>
                        <ui-input-units prop="grid.bottom" :units="SizeUnits">Отступ снизу</ui-input-units>
                    </ui-container>
                </template>
            </ui-has-panel>

            <ui-has-panel>
                <ui-checkbox prop="neutralMetrics.isEnabled">Нейтральные метрики</ui-checkbox>
                <template #panel>
                    <ui-container>
                        <ui-input-cp prop="neutralMetrics.color">Цвет метрик</ui-input-cp>
                        <ui-input-cp prop="neutralMetrics.symbolColor">Цвет точек</ui-input-cp>
                        <ui-input-cp prop="neutralMetrics.symbolBdrColor">Цвет границ точек</ui-input-cp>
                    </ui-container>
                </template>
            </ui-has-panel>

            <ui-tooltip
                v-model="props.customTooltip"
                :options="dimensionsMetrics"
                @change="propChanged('customTooltip')">
                <ui-switch v-model="isTooltipFixed">Зафиксировать тултип</ui-switch>
            </ui-tooltip>

            <ui-has-panel>
                <div class="form-label form-label-small u-select-none">Дриллдаун</div>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Настройки дриллдауна', slot: 'default' }]">
                        <ui-container>
                            <ui-has-panel>
                                <ui-checkbox prop="toolbox.show">Тулбокс</ui-checkbox>
                                <template #panel>
                                    <ui-panel :groups="[{ name: 'Параметры тулбокса', slot: 'toolbox' }]">
                                        <template #toolbox>
                                            <ui-container>
                                                <ui-input
                                                    v-model="props.toolbox.prevTitle"
                                                    @change="propChanged('toolbox')">
                                                    Текст кнопки назад
                                                </ui-input>
                                                <ui-input
                                                    type="number"
                                                    min="1"
                                                    v-model.number="props.toolbox.itemSize"
                                                    @change="propChanged('toolbox')">
                                                    Размер иконок
                                                </ui-input>
                                                <ui-input-cp
                                                    v-model="props.toolbox.iconStyle.color"
                                                    @change="propChanged('toolbox')">
                                                    Цвет иконок
                                                </ui-input-cp>
                                            </ui-container>
                                        </template>
                                    </ui-panel>
                                </template>
                            </ui-has-panel>

                            <ui-has-panel>
                                <ui-checkbox prop="breadcrumb.isShown">
                                    <ui-hint>
                                        <template #label>Хлебные крошки</template>
                                        <div>
                                            При использовании дриллдауна отображает цепочку названий уровней, за
                                            исключением первого уровня.
                                        </div>
                                    </ui-hint>
                                </ui-checkbox>
                                <template #panel>
                                    <ui-container>
                                        <ui-input prop="breadcrumb.delimiter" :units="SizeUnits" type="text">
                                            Разделитель
                                        </ui-input>
                                        <ui-input prop="breadcrumb.fontFamily" :units="SizeUnits" type="text">
                                            Шрифт
                                        </ui-input>
                                        <ui-input-units prop="breadcrumb.fontSize" :units="SizeUnits">
                                            Размер шрифта
                                        </ui-input-units>
                                        <ui-select prop="breadcrumb.fontWeight" :options="FontWeightOptions">
                                            Ширина шрифта
                                        </ui-select>
                                        <ui-input-cp prop="breadcrumb.color">Цвет текста</ui-input-cp>
                                        <ui-input-units prop="breadcrumb.left" :units="SizeUnits">
                                            Отступ слева
                                        </ui-input-units>
                                        <ui-input-units prop="breadcrumb.right" :units="SizeUnits">
                                            Отступ справа
                                        </ui-input-units>
                                        <ui-input-units prop="breadcrumb.top" :units="SizeUnits">
                                            Отступ сверху
                                        </ui-input-units>
                                        <ui-input-units prop="breadcrumb.bottom" :units="SizeUnits">
                                            Отступ снизу
                                        </ui-input-units>
                                    </ui-container>
                                </template>
                            </ui-has-panel>

                            <ui-switch prop="shouldSkipLevelWithOneValue">Пропуск одинарных уровней</ui-switch>
                            <ui-switch prop="shouldSkipLevelWithIdenticalValue">Пропуск одинаковых уровней</ui-switch>

                            <ui-has-panel>
                                <ui-checkbox prop="multiLevelDimension.isUsed">
                                    <ui-hint>
                                        <template #label>Триггер составных измерений</template>
                                        Позволяет на каждом уровне дриллдауна триггерить не одну и ту же переменную,
                                        <br />
                                        а свою - соответствующую измерению из составного.
                                        <br />
                                        При этом необходимые переменные должны быть подписаны на триггер.
                                    </ui-hint>
                                </ui-checkbox>
                                <template #panel>
                                    <ui-panel :groups="[{ name: 'Настройки составных измерений', slot: 'default' }]">
                                        <ui-switch prop="multiLevelDimension.shouldResetFirstLevel">
                                            <ui-hint>
                                                <template #label>Отправлять null из корня</template>
                                                При возврате на самый верхний, корневой уровень, переменная триггерит
                                                значение = null
                                            </ui-hint>
                                        </ui-switch>
                                    </ui-panel>
                                </template>
                            </ui-has-panel>
                        </ui-container>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-switch prop="shouldResetVar">Сброс переменной</ui-switch>
        </ui-container>
    </w-panel>
</template>
<script>
/* eslint-disable id-length */

/**
 * @typedef {import('./OptionsPanel').IComponentOptions} IComponentOptions
 * @typedef {import('./OptionsPanel').IInstance} IInstance
 */
import { Panel } from '@goodt-wcore/panel';
import { usePanelDatasetMixin, PanelDatasetMixinTypes } from '@goodt-common/data';
import { Tooltip as WTooltip } from 'goodteditor-ui';
import { SizeUnits, FontWeightOptions } from '@goodt-wcore/panels';
import { cloneDeep } from 'lodash';
import {
    LEGEND_POSITIONS,
    TRIGGER_OPTIONS,
    METRIC_FORMAT_OPTIONS,
    GRADIENT_POS_OPTIONS,
    SEPARATOR_OPTIONS,
    TOP_DIRECTIONS,
    DATA_ZOOM_ORIENT,
    DATA_ZOOM_TOP_POSITIONS,
    DATA_ZOOM_LEFT_POSITIONS,
    LegendIconOptions,
    LINE_TYPES,
    FontSizeFirstPxUnits,
    DataZoomDirectionOptions,
    LabelAlignOptions,
    TopTypeOptions,
    TopType
} from './config';
import WTopMetricSettings from './components/TopMetric.vue';
import { utils, condStyleFactory } from '../utils';

export default {
    extends: Panel,
    components: {
        WTooltip,
        WTopMetricSettings
    },
    mixins: [usePanelDatasetMixin()],
    meta: { name: 'Настройки виджета', icon: 'widgets' },
    static: {
        TRIGGER_OPTIONS,
        LEGEND_POSITIONS,
        METRIC_FORMAT_OPTIONS,
        GRADIENT_POS_OPTIONS,
        separatorOptions: SEPARATOR_OPTIONS,
        topDirections: TOP_DIRECTIONS,
        dataZoomOrient: DATA_ZOOM_ORIENT,
        dataZoomTopPositions: DATA_ZOOM_TOP_POSITIONS,
        dataZoomLeftPositions: DATA_ZOOM_LEFT_POSITIONS,
        SizeUnits,
        FontWeightOptions,
        LegendIconOptions,
        lineTypeOptions: LINE_TYPES,
        FontSizeFirstPxUnits,
        DataZoomDirectionOptions,
        LabelAlignOptions,
        TopTypeOptions,
        TopType,
        condStyleFactory
    },

    data() {
        return {
            background: {
                show: false,
                color: 'rgba(255, 255, 255, 1)',
                gradient: {
                    enable: false,
                    position: '0 0 0 1',
                    firstColor: '#FFFFFF',
                    secondColor: '#F7F8F9',
                    offSetFirstColor: '0',
                    offSetSecondColor: '1'
                }
            }
        };
    },

    computed: {
        elemComputedStyles() {
            return this.elementInstance != null ? getComputedStyle(this.elementInstance.$el) : {};
        },
        minorDimensionNames() {
            const {
                minor: { name: minorDimName }
            } = this.props.dimensionOptions;
            const results = this.elementInstance?.results ?? [];
            return results
                .reduce((acc, { rows }) => [...acc, ...utils.getDimValues(rows, minorDimName)], [])
                .sort((a, b) => a.localeCompare(b));
        },
        dimValueNames() {
            return this.elementInstance?.mainDimValues ?? [];
        },
        /**
         * @return {object[]}
         */
        metricNameOptions() {
            return this.props.metricsStyle.map(({ name }) => ({ label: name, value: name }));
        },
        /**
         * @return {object[]}
         */
        metricNameOptionsIncludingAll() {
            return [{ label: 'Все', value: 'all' }, ...this.metricNameOptions];
        },
        dataZoomInverseDirection: {
            get() {
                const {
                    dataZoom: { inverseDirection = false }
                } = this.props;
                return inverseDirection;
            },
            set(val) {
                const { dataZoom } = this.props;
                dataZoom.inverseDirection = val;
            }
        },
        propsLegendTextStyleFontSize: {
            get() {
                const {
                    legend: {
                        textStyle: { fontSize }
                    }
                } = this.props;
                return `${fontSize}`;
            },
            set(val) {
                const {
                    legend: { textStyle }
                } = this.props;
                textStyle.fontSize = val;
            }
        },
        propsDataZoomTextStyleFontSize: {
            get() {
                const {
                    dataZoom: {
                        textStyle: { fontSize }
                    }
                } = this.props;
                return `${fontSize}`;
            },
            set(val) {
                const {
                    dataZoom: { textStyle }
                } = this.props;
                textStyle.fontSize = val;
            }
        },
        isItemTypeTooltipTrigger() {
            const {
                tooltip: { trigger }
            } = this.props;
            return trigger === 'item';
        },
        isFormatSettingsDisabled() {
            const {
                tooltip: { isNestedFromMetric }
            } = this.props;
            return this.isItemTypeTooltipTrigger || isNestedFromMetric;
        },
        isTooltipFixed: {
            set(value) {
                const { options } = this.elementInstance.customTooltip;
                options.isFixed = value;
            },
            get() {
                const { options = {} } = this.elementInstance?.customTooltip ?? {};
                return options.isFixed ?? false;
            }
        }
    },

    methods: {
        ...PanelDatasetMixinTypes,
        changeStyles(styles, idx) {
            const { topOptions } = this.props;
            topOptions.metricsStyle = cloneDeep(styles);
            this.propChanged('topOptions');
        },
        changeBackground() {
            const { show: isShown, color, gradient } = this.background;
            if (isShown) {
                if (gradient.enable) {
                    const [x, y, x2, y2] = gradient.position.split(' ');

                    this.props.backgroundColor = {
                        type: 'linear',
                        x,
                        y,
                        x2,
                        y2,
                        colorStops: [
                            {
                                offset: gradient.offSetFirstColor,
                                color: gradient.firstColor
                            },
                            {
                                offset: gradient.offSetSecondColor,
                                color: gradient.secondColor
                            }
                        ]
                    };
                } else {
                    this.props.backgroundColor = {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [
                            {
                                offset: 1,
                                color
                            },
                            {
                                offset: 1,
                                color
                            }
                        ]
                    };
                }
            } else {
                this.props.backgroundColor = {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [
                        {
                            offset: 1,
                            color: 'transparent'
                        },
                        {
                            offset: 1,
                            color: 'transparent'
                        }
                    ]
                };
            }

            this.propChanged('backgroundColor');
        },
        /**
         * @param {string} prop - property`s name
         */
        changeLegend(prop) {
            const { legend, mainTitle } = this.props;

            if (legend.position === 'top') {
                legend.bottom = null;
                legend.top = mainTitle.show ? 20 : 0;
            } else {
                legend.top = null;
                legend.bottom = 0;
            }

            legend.padding = [5, 50, 5, 5];
            this.propChanged(prop);
        }
    }
};
</script>
