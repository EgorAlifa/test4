<template>
    <ui-container>
        <ui-switch v-model="currentOptions.showDataSet" @change="collectSettings">Отображать метрику</ui-switch>

        <ui-select
            v-model="currentOptions.customType"
            :options="chartTypes"
            :disabled="seriesType != null"
            @change="changeSeriesType">
            Тип отображения
        </ui-select>

        <ui-select v-model="currentOptions.originIdx" :options="datasetOptions" @change="collectSettings">
            Источник данных
        </ui-select>

        <ui-select v-model="currentOptions.metricName" :options="metricNamesOptions" @change="onMetricNameChange">
            Отображаемая метрика
        </ui-select>

        <ui-has-panel>
            <ui-checkbox v-model="currentOptions.multiMetricMode.enable" @change="collectSettings">
                Режим мульти-метрики
                <template #hint>
                    При использовании сложного измерения позволяет отображать на каждом уровне проваливания конкретную
                    метрику
                </template>
            </ui-checkbox>

            <template #panel>
                <ui-panel :groups="[{ name: 'Список метрик', slot: 'metrics' }]">
                    <template #metrics>
                        <p class="text-small">Расположите элементы в порядке уровней drill-down</p>
                        <ui-container>
                            <draggable v-model="multiMetricMap" v-bind="dragOptions" @change="collectSettings">
                                <div
                                    class="p"
                                    v-for="(_, idx) of currentOptions.multiMetricMode.metricNames"
                                    :key="idx">
                                    <div class="row row-collapse flex-nowrap">
                                        <div class="col col-auto col-vmid">
                                            <div class="icon cursor-move drag-handle">
                                                <i class="mdi mdi-drag mdi-18px"></i>
                                            </div>
                                        </div>
                                        <div class="col">
                                            <ui-collapse label="">
                                                <template #header>
                                                    {{ currentOptions.multiMetricMode.metricNames[idx] }}
                                                </template>
                                                <template #default>
                                                    <ui-container>
                                                        <ui-select
                                                            v-model="currentOptions.multiMetricMode.metricDatasets[idx]"
                                                            :options="datasetOptions"
                                                            @change="collectSettings">
                                                            Источник данных
                                                        </ui-select>
                                                        <ui-select
                                                            v-model="currentOptions.multiMetricMode.metricNames[idx]"
                                                            :options="
                                                                datasetMetricNamesOptions[
                                                                    currentOptions.multiMetricMode.metricDatasets[idx]
                                                                ]
                                                            "
                                                            @change="collectSettings">
                                                            Метрика
                                                        </ui-select>
                                                        <ui-select
                                                            v-model="currentOptions.multiMetricMode.metricSorts[idx]"
                                                            :options="SortOptions"
                                                            @change="collectSettings">
                                                            Сортировка
                                                        </ui-select>
                                                    </ui-container>
                                                </template>
                                            </ui-collapse>
                                        </div>
                                        <div class="col col-auto col-vmid">
                                            <div class="icon" @click="deleteMetricName(idx)">
                                                <i class="mdi mdi-close mdi-18px"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </draggable>
                            <ui-button @click="addMetricName">Добавить метрику</ui-button>
                        </ui-container>
                    </template>
                </ui-panel>
            </template>
        </ui-has-panel>

        <ui-input-auto v-model.trim="currentOptions.marker" @change="collectSettings">Маркер метрики</ui-input-auto>

        <ui-input-auto v-model.trim="currentOptions.name" @change="collectSettings">Наименование метрики</ui-input-auto>

        <ui-switch v-model="currentOptions.nullValues" @change="collectSettings">
            Убрать нулевые значения
            <template #hint>Скрывает графики, величина которых равна нулю</template>
        </ui-switch>

        <ui-switch v-model="currentOptions.voidValues" @change="collectSettings">
            Убрать пустые значения
            <template #hint>При включении настройки, пустые значения не будут отображаться на диаграмме.</template>
        </ui-switch>

        <ui-switch v-model="currentOptions.connectNulls" @change="collectSettings">
            Соединять пропуская пустые
            <template #hint>При выключении настройки, пустые значения будут обрывать диаграмму.</template>
        </ui-switch>

        <ui-switch v-model="currentOptions.isAbsoluteValue" @change="collectSettings">
            Выводить абсолютное значение
        </ui-switch>

        <ui-switch v-model="currentOptions.isAutoRound" @change="collectSettings">
            Авто-округление
            <template #hint>
                Активирует округление метрики по следующему алгоритму, где х - значение метрики:
                <br />
                а) если x>=1, то округление до целого значения;
                <br />
                б) если 0.1<=x<1, то отображение с 1 знаком после запятой;
                <br />
                в) если 0.01<=x<0.1, то отображение с 2 знаками после запятой;
                <br />
                г) если x<0.01, то отображение с 3 знаками после запятой.
            </template>
        </ui-switch>

        <ui-select
            :disabled="currentOptions.isAutoRound"
            v-model="currentOptions.metricFormat"
            :options="formatOptions"
            @change="collectSettings">
            Формат метрики
        </ui-select>

        <ui-select
            :disabled="currentOptions.isAutoRound"
            v-model="currentOptions.metricSeparator"
            :options="separatorOptions"
            @change="collectSettings">
            Формат разделителя разрядов
        </ui-select>

        <ui-has-two-columns>
            <template #left>
                <ui-input-auto v-model="currentOptions.metricPrefix" @change="collectSettings">Префикс</ui-input-auto>
            </template>
            <template #right>
                <ui-input-auto v-model="currentOptions.metricPostfix" @change="collectSettings">Постфикс</ui-input-auto>
            </template>
        </ui-has-two-columns>

        <template v-if="['line', 'bar'].includes(currentOptions.type)">
            <ui-switch
                v-model="currentOptions.isCumulativeTotal"
                :disabled="currentOptions.isCumulativeDifference"
                @change="collectSettings">
                Накопительный итог
                <template #hint>
                    Прибавляет к текущему значению графика его предыдущее значение. Корректное отображение происходит
                    при отключенной сортировке
                </template>
            </ui-switch>
            <ui-switch
                v-model="currentOptions.isCumulativeDifference"
                :disabled="currentOptions.isCumulativeTotal"
                @change="collectSettings">
                Разница
            </ui-switch>
        </template>

        <template v-if="currentOptions.customType === 'stacked line'">
            <ui-switch v-model="currentOptions.stackLines" @change="collectSettings">Складывать линии</ui-switch>
        </template>

        <template v-if="currentOptions.customType === 'plan'">
            <ui-input-auto v-model="currentOptions.nameExcess" @change="collectSettings">
                Наименование избытка
            </ui-input-auto>

            <ui-has-panel>
                <ui-checkbox v-model="currentOptions.excess.gradient" @change="collectComparedColors('excess')">
                    Градиент избытка
                </ui-checkbox>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Градиент избытка', slot: 'gradient' }]">
                        <template #gradient>
                            <ui-container>
                                <ui-input-cp
                                    v-model="currentOptions.excess.firstColor"
                                    @change="collectComparedColors('excess')">
                                    Первый цвет
                                </ui-input-cp>
                                <ui-input
                                    type="number"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    v-model="currentOptions.excess.firstOffSet"
                                    @change="collectComparedColors('excess')">
                                    Смещение цвета
                                </ui-input>
                                <ui-input-cp
                                    v-model="currentOptions.excess.secondColor"
                                    @change="collectComparedColors('excess')">
                                    Второй цвет
                                </ui-input-cp>
                                <ui-input
                                    type="number"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    v-model="currentOptions.excess.secondOffSet"
                                    @change="collectComparedColors('excess')">
                                    Смещение цвета
                                </ui-input>
                                <ui-select
                                    v-model="currentOptions.excess.gradPos"
                                    :options="gradientPosOptions"
                                    @change="collectComparedColors('excess')">
                                    Направление градиента
                                </ui-select>
                            </ui-container>
                        </template>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-input-cp
                v-model="currentOptions.excess.color"
                @change="collectComparedColors('excess')"
                v-if="!currentOptions.excess.gradient">
                Цвет избытка
            </ui-input-cp>

            <ui-input-auto v-model="currentOptions.nameLack" @change="collectSettings">
                Наименование недостатка
            </ui-input-auto>

            <ui-has-panel>
                <ui-checkbox v-model="currentOptions.lack.gradient" @change="collectComparedColors('lack')">
                    Градиент недостатка
                </ui-checkbox>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Градиент недостатка', slot: 'default' }]">
                        <ui-container>
                            <ui-input-cp
                                v-model="currentOptions.lack.firstColor"
                                @change="collectComparedColors('lack')">
                                Первый цвет
                            </ui-input-cp>
                            <ui-input
                                type="number"
                                min="0"
                                max="1"
                                step="0.1"
                                v-model="currentOptions.lack.firstOffSet"
                                @change="collectComparedColors('lack')">
                                Смещение цвета
                            </ui-input>
                            <ui-input-cp
                                v-model="currentOptions.lack.secondColor"
                                @change="collectComparedColors('lack')">
                                Второй цвет
                            </ui-input-cp>
                            <ui-input
                                type="number"
                                min="0"
                                max="1"
                                step="0.1"
                                v-model="currentOptions.lack.secondOffSet"
                                @change="collectComparedColors('lack')">
                                Смещение цвета
                            </ui-input>
                            <ui-select
                                v-model="currentOptions.lack.gradPos"
                                :options="gradientPosOptions"
                                @change="collectComparedColors('lack')">
                                Направление градиента
                            </ui-select>
                        </ui-container>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-input-cp
                v-model="currentOptions.lack.color"
                @change="collectComparedColors('lack')"
                v-if="!currentOptions.lack.gradient">
                Цвет недостатка
            </ui-input-cp>

            <ui-has-panel>
                <ui-checkbox v-model="currentOptions.excessLackLabel.show" @change="collectSettings">
                    Подписи избытка и недостатка
                </ui-checkbox>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Подписи избытка и недостатка', slot: 'default' }]">
                        <ui-container>
                            <ui-input-cp
                                v-model="currentOptions.excessLackLabel.color"
                                @change="collectSettings"
                                v-if="!currentOptions.lack.gradient">
                                Цвет подписи
                            </ui-input-cp>
                            <ui-input-auto
                                v-model="currentOptions.excessLackLabel.fontFamily"
                                @change="collectSettings">
                                Шрифт подписи
                            </ui-input-auto>
                            <ui-input
                                type="number"
                                min="0"
                                v-model="currentOptions.excessLackLabel.fontSize"
                                @change="collectSettings">
                                Размер подписи
                            </ui-input>
                            <ui-select
                                v-model="currentOptions.excessLackLabel.position"
                                :options="labelPosOptions"
                                @change="collectSettings">
                                Расположение подписей
                            </ui-select>
                            <ui-input
                                type="number"
                                min="-90"
                                max="90"
                                v-model.number="currentOptions.excessLackLabel.rotate"
                                @change="collectSettings">
                                Угол поворота подписей
                            </ui-input>
                            <ui-has-two-columns>
                                <template #left>
                                    <ui-input
                                        type="number"
                                        v-model.number="currentOptions.excessLackLabel.offset[0]"
                                        @change="collectSettings">
                                        Отступ по оси X
                                    </ui-input>
                                </template>
                                <template #right>
                                    <ui-input
                                        type="number"
                                        v-model.number="currentOptions.excessLackLabel.offset[1]"
                                        @change="collectSettings">
                                        Отступ по оси Y
                                    </ui-input>
                                </template>
                            </ui-has-two-columns>
                        </ui-container>
                    </ui-panel>
                </template>
            </ui-has-panel>
        </template>

        <template v-if="currentOptions.type !== 'line'">
            <ui-has-panel>
                <div class="form-label form-label-small">Настройка величины баров</div>

                <template #panel>
                    <ui-panel :groups="[{ name: 'Размер бара', slot: 'default' }]">
                        <ui-container>
                            <ui-input-units
                                :units="CommonSizeFirstPxUnits"
                                v-model="barMinHeight"
                                @change="collectSettings">
                                Минимальная высота столбца
                            </ui-input-units>

                            <ui-input-units
                                :units="CommonSizeFirstPxUnits"
                                v-model="barWidth"
                                @change="collectSettings">
                                Ширина столбца
                            </ui-input-units>

                            <ui-input-units
                                :units="CommonSizeFirstPxUnits"
                                v-model="barMinWidth"
                                @change="collectSettings">
                                Мин. ширина столбца
                                <template #hint>
                                    <div>Минимальная ширина столбца задает нижний предел для Ширины столбца.</div>
                                    <div>В случае, если Ширина столбца < Минимальной, то применяется минимальная</div>
                                </template>
                            </ui-input-units>

                            <ui-input-units
                                :units="CommonSizeFirstPxUnits"
                                v-model="barMaxWidth"
                                @change="collectSettings">
                                Макс. ширина
                                <template #hint>
                                    <div>Максимальная ширина столбца задает верхний предел для Ширины столбца.</div>
                                    <div>В случае, если Ширина столбца > Максимальной, то применяется максимальная</div>
                                </template>
                            </ui-input-units>
                        </ui-container>
                    </ui-panel>
                </template>
            </ui-has-panel>
        </template>
        <template v-if="['stacked', 'bar'].includes(currentOptions.type)">
            <ui-has-panel>
                <div class="form-label form-label-small">Настройка границы баров</div>
                <template #panel>
                    <ui-container>
                        <ui-has-two-columns>
                            <template #left>
                                <ui-input
                                    type="number"
                                    v-model.number="currentOptions.itemStyle.borderWidth"
                                    @change="collectSettings">
                                    Толщина границы
                                </ui-input>
                            </template>
                            <template #right>
                                <ui-input-cp
                                    type="number"
                                    v-model.number="currentOptions.itemStyle.borderColor"
                                    @change="collectSettings">
                                    Цвет границы
                                </ui-input-cp>
                            </template>
                        </ui-has-two-columns>
                        <ui-switch v-model="currentOptions.isRoundedBarBorder" @change="collectSettings">
                            Округление границ
                        </ui-switch>
                        <ui-has-two-columns>
                            <template #left>
                                <ui-input
                                    type="number"
                                    v-model.number="currentOptions.roundedBarBorder.leftTop"
                                    @change="collectSettings">
                                    Слева сверху
                                </ui-input>
                            </template>
                            <template #right>
                                <ui-input
                                    type="number"
                                    v-model.number="currentOptions.roundedBarBorder.rightTop"
                                    @change="collectSettings">
                                    Справа сверху
                                </ui-input>
                            </template>
                        </ui-has-two-columns>
                        <ui-has-two-columns>
                            <template #left>
                                <ui-input
                                    type="number"
                                    v-model.number="currentOptions.roundedBarBorder.leftBottom"
                                    @change="collectSettings">
                                    Слева снизу
                                </ui-input>
                            </template>
                            <template #right>
                                <ui-input
                                    type="number"
                                    v-model.number="currentOptions.roundedBarBorder.rightBottom"
                                    @change="collectSettings">
                                    Справа снизу
                                </ui-input>
                            </template>
                        </ui-has-two-columns>
                    </ui-container>
                </template>
            </ui-has-panel>
        </template>

        <ui-input-cp
            v-model="currentOptions.colorForLine"
            @change="collectAndUpdateColorsForLine"
            v-if="currentOptions.type === 'line'">
            Цвет линии
        </ui-input-cp>

        <ui-input-cp v-model="currentOptions.colorForBar" @change="collectColorForBar" v-else>Цвет бара</ui-input-cp>

        <template v-if="isStackedType">
            <ui-input type="number" min="1" v-model.number="currentOptions.colorStep" @change="collectSettings">
                Шаг цвета
            </ui-input>

            <ui-has-panel>
                <div class="form-label form-label-small">Кастомные цвета</div>

                <template #panel>
                    <ui-panel :groups="[{ name: 'Кастомные цвета', slot: 'default' }]">
                        <ui-container>
                            <ui-select v-model="customColor.name" :options="minorDimensionNamesOptions">
                                Измерение
                            </ui-select>
                            <ui-input-cp v-model="customColor.color" @change="changeCustomColor">Цвет</ui-input-cp>
                        </ui-container>
                    </ui-panel>
                </template>
            </ui-has-panel>
        </template>

        <template v-if="currentOptions.type === 'bar'">
            <ui-has-panel>
                <ui-checkbox v-model="currentOptions.gradientForBar" @change="collectColorForBar">
                    Градиент бара
                </ui-checkbox>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Градиент бара', slot: 'default' }]">
                        <ui-container>
                            <ui-input-cp v-model="currentOptions.barFirstColor" @change="collectColorForBar">
                                Первый цвет
                            </ui-input-cp>
                            <ui-input
                                type="number"
                                min="0"
                                max="1"
                                step="0.1"
                                v-model="currentOptions.barFirstOffSet"
                                @change="collectColorForBar">
                                Смещение цвета
                            </ui-input>
                            <ui-input-cp v-model="currentOptions.barSecondColor" @change="collectColorForBar">
                                Второй цвет
                            </ui-input-cp>
                            <ui-input
                                type="number"
                                min="0"
                                max="1"
                                step="0.1"
                                v-model="currentOptions.barSecondOffSet"
                                @change="collectColorForBar">
                                Смещение цвета
                            </ui-input>
                            <ui-select
                                v-model="currentOptions.barPos"
                                :options="gradientPosOptions"
                                @change="collectColorForBar">
                                Направление градиента
                            </ui-select>
                        </ui-container>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-has-panel>
                <ui-checkbox v-model="currentOptions.styleConditions.enable" @change="collectSettings">
                    Задать стили условием
                </ui-checkbox>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Условия', slot: 'default' }]">
                        <ui-container>
                            <ui-collapse
                                v-for="(cond, idx) in currentOptions.styleConditions.conditions"
                                :key="`cond-${idx}`">
                                <template #header>{{ `Условие ${idx + 1}` }}</template>
                                <ui-container>
                                    <ui-has-two-columns>
                                        <template #left>
                                            <ui-select
                                                v-model="cond.type"
                                                :options="condStyleTypes"
                                                @change="collectCondition(cond)">
                                                Условие
                                            </ui-select>
                                        </template>
                                        <template #right>
                                            <ui-input
                                                type="number"
                                                v-model.number="cond.value"
                                                :disabled="cond.type === 'ALL' || cond.dimValues.length > 0"
                                                @change="collectCondition(cond)">
                                                Значение
                                            </ui-input>
                                        </template>
                                    </ui-has-two-columns>
                                    <ui-select
                                        multiple
                                        v-model="cond.dimValues"
                                        :options="dimValueNames"
                                        :disabled="cond.value !== ''"
                                        @change="collectCondition(cond)">
                                        Значение измерения
                                    </ui-select>
                                    <ui-switch v-model="cond.useGradient" @change="collectCondition(cond)">
                                        Градиент
                                    </ui-switch>
                                    <ui-container v-if="cond.useGradient">
                                        <ui-input-cp
                                            v-model="cond.gradient.firstColor"
                                            @change="collectCondition(cond)">
                                            Первый цвет
                                        </ui-input-cp>
                                        <ui-input
                                            type="number"
                                            min="0"
                                            max="1"
                                            step="0.1"
                                            v-model="cond.gradient.firstOffset"
                                            @change="collectCondition(cond)">
                                            Смещение цвета
                                        </ui-input>
                                        <ui-input-cp
                                            v-model="cond.gradient.secondColor"
                                            @change="collectCondition(cond)">
                                            Второй цвет
                                        </ui-input-cp>
                                        <ui-input
                                            type="number"
                                            min="0"
                                            max="1"
                                            step="0.1"
                                            v-model="cond.gradient.secondOffset"
                                            @change="collectCondition(cond)">
                                            Смещение цвета
                                        </ui-input>
                                        <ui-select
                                            v-model="cond.gradient.pos"
                                            :options="gradientPosOptions"
                                            @change="collectCondition(cond)">
                                            Направление градиента
                                        </ui-select>
                                    </ui-container>
                                    <ui-input-cp v-else v-model="cond.color" @change="collectCondition(cond)">
                                        Цвет
                                    </ui-input-cp>

                                    <ui-button type="error" @click="deleteCondition(idx)">Удалить</ui-button>
                                </ui-container>
                            </ui-collapse>

                            <ui-button type="ghost" @click="addCondition">Добавить условие</ui-button>
                        </ui-container>
                    </ui-panel>
                </template>
            </ui-has-panel>
        </template>

        <template v-if="currentOptions.type === 'line'">
            <ui-has-panel>
                <ui-checkbox
                    v-model="currentOptions.fillLine"
                    :disabled="currentOptions.customFillLine"
                    @change="collectSettings">
                    Заливка линии
                </ui-checkbox>
                <template #panel>
                    <ui-panel
                        :groups="[
                            { name: 'Заливка', slot: 'fill' },
                            { name: 'Градиент', slot: 'gradient' }
                        ]">
                        <template #fill>
                            <ui-container>
                                <ui-switch v-model="currentOptions.shouldSyncColor" @change="collectSettings">
                                    Цвет дублирует цвет графика
                                </ui-switch>
                                <ui-select
                                    v-model="currentOptions.origin"
                                    :options="fillPositions"
                                    :disabled="currentOptions.smartFill"
                                    @change="collectSettings">
                                    Положение заливки
                                </ui-select>
                                <ui-switch v-model="currentOptions.smartFill" @change="collectSettings">
                                    Умная заливка
                                </ui-switch>
                                <ui-input-cp v-model="currentOptions.fillColor" @change="collectSettings">
                                    Настройка цвета
                                </ui-input-cp>
                            </ui-container>
                        </template>
                        <template #gradient>
                            <ui-container>
                                <ui-switch v-model="currentOptions.gradient" @change="collectSettings">
                                    Градиент заливки
                                </ui-switch>
                                <ui-input-cp v-model="currentOptions.firstColor" @change="collectSettings">
                                    Первый цвет
                                </ui-input-cp>
                                <ui-input
                                    type="number"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    v-model="currentOptions.offSetFirstColor"
                                    @change="collectSettings">
                                    Смещение цвета
                                </ui-input>
                                <ui-input-cp v-model="currentOptions.secondColor" @change="collectSettings">
                                    Второй цвет
                                </ui-input-cp>
                                <ui-input
                                    type="number"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    v-model="currentOptions.offSetSecondColor"
                                    @change="collectSettings">
                                    Смещение цвета
                                </ui-input>
                                <ui-select
                                    v-model="currentOptions.colorPos"
                                    :options="gradientPosOptions"
                                    @change="collectSettings">
                                    Направление градиента
                                </ui-select>
                            </ui-container>
                        </template>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-has-panel v-if="isStackedType">
                <ui-checkbox
                    v-model="currentOptions.customFillLine"
                    :disabled="currentOptions.fillLine"
                    @change="collectSettings">
                    Кастомная заливка линий
                </ui-checkbox>

                <template #panel>
                    <ui-panel :groups="[{ name: 'Кастомная заливка линий', slot: 'default' }]">
                        <ui-container>
                            <ui-select v-model="customColor.name" :options="minorDimensionNamesOptions">
                                Значение измерения
                            </ui-select>
                            <ui-input-cp
                                v-model="customColor.fillColor"
                                :disabled="!customColor.name || customColor.gradient"
                                @change="changeCustomColor">
                                Цвет заливки
                            </ui-input-cp>

                            <ui-switch
                                v-model="customColor.gradient"
                                :disabled="!customColor.name"
                                @change="changeCustomColor">
                                Градиент заливки
                            </ui-switch>

                            <template v-if="customColor.gradient">
                                <ui-input-cp v-model="customColor.firstColor" @change="changeCustomColor">
                                    Первый цвет
                                </ui-input-cp>
                                <ui-input
                                    type="number"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    v-model="customColor.offSetFirstColor"
                                    @change="changeCustomColor">
                                    Смещение цвета
                                </ui-input>
                                <ui-input-cp v-model="customColor.secondColor" @change="changeCustomColor">
                                    Второй цвет
                                </ui-input-cp>
                                <ui-input
                                    type="number"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    v-model="customColor.offSetSecondColor"
                                    @change="changeCustomColor">
                                    Смещение цвета
                                </ui-input>
                                <ui-select
                                    v-model="customColor.colorPos"
                                    :options="gradientPosOptions"
                                    @change="changeCustomColor">
                                    Направление градиента
                                </ui-select>
                            </template>
                        </ui-container>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-select v-model="currentOptions.lineStyle.type" :options="lineTypes" @change="collectSettings">
                Тип линии
            </ui-select>

            <ui-input-units :units="CommonSizeFirstPxUnits" v-model="lineStyleWidth" @change="collectSettings">
                Толщина линии
            </ui-input-units>

            <ui-has-panel>
                <ui-checkbox v-model="currentOptions.showSymbol" @change="collectSettings">Точки</ui-checkbox>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Настройка точек', slot: 'default' }]">
                        <ui-container>
                            <ui-select v-model="currentOptions.symbol" :options="symbolTypes" @change="collectSettings">
                                Вид
                            </ui-select>
                            <ui-input-units
                                :units="CommonSizeFirstPxUnits"
                                v-model="symbolSize"
                                @change="collectSettings">
                                Размер
                            </ui-input-units>
                            <ui-switch v-model="currentOptions.fillSymbol" @change="collectColorForLine">
                                Задавать цвет
                            </ui-switch>
                            <ui-input-cp v-model="currentOptions.symbolColor" @change="collectColorForLine">
                                Цвет
                            </ui-input-cp>
                            <ui-input-units
                                :units="CommonSizeFirstPxUnits"
                                v-model="symbolBdrWidth"
                                @change="collectColorForLine">
                                Размер границы
                            </ui-input-units>
                            <ui-input-cp v-model="currentOptions.symbolBdrColor" @change="collectColorForLine">
                                Цвет границы
                            </ui-input-cp>
                            <ui-switch v-model="currentOptions.shouldDotsSyncColor" @change="collectSettings">
                                Цвет дублирует цвет графика
                            </ui-switch>
                        </ui-container>
                    </ui-panel>
                </template>
            </ui-has-panel>
        </template>

        <template v-if="!isStackedType">
            <ui-input-auto v-model="currentOptions.stack" @change="collectSettings">
                Тег для стэка
                <template #hint>
                    Комбинирует разные графики при одинаковых названиях тегов, указанных в их метриках
                </template>
            </ui-input-auto>
        </template>

        <ui-has-panel>
            <div class="form-label form-label-small">Настройка тени</div>
            <template #panel>
                <ui-panel :groups="[{ name: 'Настройка тени', slot: 'default' }]">
                    <ui-container>
                        <ui-switch v-model="currentOptions.shouldSyncShadowColor" @change="collectSettings">
                            Цвет тени дублирует цвет графика
                        </ui-switch>
                        <ui-input
                            type="number"
                            v-model.number="currentOptions.itemStyle.shadowBlur"
                            @change="collectSettings">
                            Размытие тени
                        </ui-input>
                        <ui-input-cp v-model="currentOptions.itemStyle.shadowColor" @change="collectSettings">
                            Цвет тени
                        </ui-input-cp>
                        <ui-has-two-columns>
                            <template #left>
                                <ui-input
                                    type="number"
                                    v-model.number="currentOptions.itemStyle.shadowOffsetX"
                                    @change="collectSettings">
                                    Сдвиг по X
                                </ui-input>
                            </template>
                            <template #right>
                                <ui-input
                                    type="number"
                                    v-model.number="currentOptions.itemStyle.shadowOffsetY"
                                    @change="collectSettings">
                                    Сдвиг по Y
                                </ui-input>
                            </template>
                        </ui-has-two-columns>
                    </ui-container>
                </ui-panel>
            </template>
        </ui-has-panel>

        <ui-has-two-columns>
            <template #left>
                <ui-input type="number" min="0" v-model.number="currentOptions.xAxisIndex" @change="collectSettings">
                    Привязка к оси X
                </ui-input>
            </template>
            <template #right>
                <ui-input type="number" min="0" v-model.number="currentOptions.yAxisIndex" @change="collectSettings">
                    Привязка к оси Y
                </ui-input>
            </template>
        </ui-has-two-columns>

        <ui-switch v-model="currentOptions.smooth" @change="collectSettings">Сглаживание</ui-switch>

        <ui-input type="number" min="0" v-model.number="currentOptions.z" @change="collectSettings">
            Z-индекс
            <template #hint>
                <div>Отвечает за порядок отображения графиков.</div>
                <div>Визуально выше (на переднем плане) отобразится</div>
                <div>график с большим значением индекса</div>
            </template>
        </ui-input>

        <ui-has-panel>
            <ui-checkbox v-model="currentOptions.label.show" @change="collectSettings">Подписи</ui-checkbox>
            <template #panel>
                <ui-panel :groups="[{ name: 'Настройка подписей', slot: 'default' }]">
                    <ui-container>
                        <ui-input-cp v-model="currentOptions.label.color" @change="collectSettings">
                            Настройка цвета
                        </ui-input-cp>
                        <ui-has-two-columns>
                            <template #left>
                                <ui-input-auto v-model="currentOptions.label.fontFamily" @change="collectSettings">
                                    Шрифт подписи
                                </ui-input-auto>
                            </template>
                            <template #right>
                                <ui-input-units
                                    v-model="labelFontSize"
                                    :units="FontSizeFirstPxUnits"
                                    @change="collectSettings">
                                    Размер шрифта
                                </ui-input-units>
                            </template>
                        </ui-has-two-columns>
                        <ui-select
                            v-model="currentOptions.label.position"
                            :options="labelPosOptions"
                            @change="collectSettings">
                            Расположение подписей
                        </ui-select>
                        <ui-select
                            v-model="currentOptions.label.align"
                            :options="LabelAlignOptions"
                            @change="collectSettings">
                            Горизонтальное выравнивание
                        </ui-select>
                        <ui-input
                            type="number"
                            min="-90"
                            max="90"
                            v-model.number="currentOptions.label.rotate"
                            @change="collectSettings">
                            Угол поворота подписей
                        </ui-input>
                        <ui-has-two-columns>
                            <template #left>
                                <ui-input
                                    type="number"
                                    v-model.number="currentOptions.label.offset[0]"
                                    @change="collectSettings">
                                    Отступ по оси X
                                </ui-input>
                            </template>
                            <template #right>
                                <ui-input
                                    type="number"
                                    v-model.number="currentOptions.label.offset[1]"
                                    @change="collectSettings">
                                    Отступ по оси Y
                                </ui-input>
                            </template>
                        </ui-has-two-columns>

                        <ui-has-panel>
                            <ui-checkbox disabled v-model="currentOptions.labelLayout.use" @change="collectSettings">
                                <ui-hint>
                                    <template #label>Подписи прямой линией</template>
                                    Функционал в данный момент не активен и находится в процессе доработки
                                </ui-hint>
                            </ui-checkbox>
                            <template #panel>
                                <ui-panel :groups="[{ name: 'Настройки для подписей в линию', slot: 'default' }]">
                                    <ui-container>
                                        <ui-input
                                            type="number"
                                            v-model.number="currentOptions.labelLayout.x"
                                            @change="collectSettings">
                                            Позиция по Х
                                        </ui-input>
                                        <ui-input
                                            type="number"
                                            v-model.number="currentOptions.labelLayout.y"
                                            @change="collectSettings">
                                            Позиция по Y
                                        </ui-input>
                                        <ui-select
                                            v-model="currentOptions.labelLayout.align"
                                            :options="LabelAlignOptions"
                                            @change="collectSettings">
                                            Выравнивание по Х
                                        </ui-select>
                                        <ui-select
                                            v-model="currentOptions.labelLayout.verticalAlign"
                                            :options="VerticalAlignOptions"
                                            @change="collectSettings">
                                            Выравнивание по Y
                                        </ui-select>
                                    </ui-container>
                                </ui-panel>
                            </template>
                        </ui-has-panel>

                        <ui-switch v-model="currentOptions.label.isZeroValueShown" @change="collectSettings">
                            Отображать нули
                        </ui-switch>
                    </ui-container>
                </ui-panel>
            </template>
        </ui-has-panel>

        <ui-has-panel>
            <ui-checkbox v-model="currentOptions.label.isAddlLabelShown" @change="collectSettings">
                Дополнительная подпись
            </ui-checkbox>
            <template #panel>
                <ui-panel :groups="[{ name: 'Дополнительная подпись', slot: 'default' }]">
                    <ui-additional-label
                        v-model="currentOptions.label.rich"
                        v-bind="{ metricNamesOptions, condStyleTypes }"
                        @change="collectSettings" />
                </ui-panel>
            </template>
        </ui-has-panel>

        <ui-has-panel>
            <ui-checkbox v-model="currentOptions.animation" @change="collectSettings">Настройка анимации</ui-checkbox>
            <template #panel>
                <ui-panel :groups="[{ name: 'Настройка анимации', slot: 'default' }]">
                    <ui-container>
                        <ui-select
                            v-model="currentOptions.animationEasing"
                            :options="animationTypes"
                            @change="collectSettings">
                            Тип анимации
                        </ui-select>
                        <ui-input
                            type="number"
                            min="0"
                            v-model.number="currentOptions.animationDuration"
                            @change="collectSettings">
                            Продолжительность анимации
                        </ui-input>
                        <ui-input
                            type="number"
                            min="0"
                            v-model.number="currentOptions.animationDelay"
                            @change="collectSettings">
                            Продолжительность задержки
                        </ui-input>
                    </ui-container>
                </ui-panel>
            </template>
        </ui-has-panel>

        <ui-button type="error" @click="deleteMetric">Удалить</ui-button>
    </ui-container>
</template>

<script>
/* eslint-disable id-length */
import { cloneDeep, get as _get } from 'lodash';
import Color from 'color';
import draggable from 'vuedraggable';
import { PanelUi } from '@goodt-wcore/components';
import { convertCssVarToComputedValue } from '@goodt-common/utils';

import { createSeriesTemplateByIndex } from '../../utils/constants';
import { utils } from '../../utils';
import { unit2PxMixin } from '../../utils/mixins';
import {
    METRIC_FORMAT_OPTIONS,
    SEPARATOR_OPTIONS,
    GRADIENT_POS_OPTIONS,
    CHART_TYPES,
    LABEL_POS_OPTIONS,
    FILL_POSITIONS,
    LINE_TYPES,
    SYMBOL_TYPES,
    ANIMATION_TYPES,
    LabelAlignOptions,
    SortOptions,
    VerticalAlignOptions,
    CommonSizeFirstPxUnits,
    FontSizeFirstPxUnits
} from '../config';
import UiAdditionalLabel from './AdditionalLabel.vue';

const DRAG_ANIMATION_TIME = 200;

export default {
    components: {
        ...PanelUi,
        draggable,
        UiAdditionalLabel
    },
    mixins: [unit2PxMixin],
    props: {
        styles: {
            type: Object,
            default: () => ({})
        },
        index: {
            type: Number,
            default: 0
        },
        axis: {
            type: Array,
            default: () => []
        },
        seriesType: {
            type: String,
            default: null
        },
        metricNames: {
            type: Array,
            default: () => []
        },
        datasetNames: {
            type: Array,
            default: () => []
        },
        dimValueNames: {
            type: Array,
            default: () => []
        },
        condStyleFactory: {
            type: Function,
            default: () => {}
        },
        condStyleTypes: {
            type: Array,
            default: () => []
        },
        minorDimensionNames: {
            type: Array,
            default: () => []
        },
        elemComputedStyles: {
            type: CSSStyleDeclaration,
            default: () => ({})
        },
        templateIndex: {
            type: Number,
            default: 0
        }
    },
    data() {
        return {
            currentOptions: {},
            multiMetricMap: [],
            customColor: {
                name: '',
                color: '',
                fillColor: '',
                gradient: false,
                firstColor: '',
                offSetFirstColor: '',
                secondColor: '',
                offSetSecondColor: '',
                colorPos: ''
            },
            dragOptions: {
                animation: DRAG_ANIMATION_TIME,
                handle: '.drag-handle'
            }
        };
    },

    computed: {
        lineStyleWidth: {
            get() {
                const { lineStyle } = this.currentOptions;
                return `${lineStyle.width}`;
            },
            set(val) {
                const { lineStyle } = this.currentOptions;
                lineStyle.width = val;
            }
        },
        symbolSize: {
            get() {
                return `${this.currentOptions.symbolSize}`;
            },
            set(val) {
                this.currentOptions.symbolSize = val;
            }
        },
        symbolBdrWidth: {
            get() {
                return `${this.currentOptions.symbolBdrWidth}`;
            },
            set(val) {
                this.currentOptions.symbolBdrWidth = val;
            }
        },
        barMinHeight: {
            get() {
                return `${this.currentOptions.barMinHeight}`;
            },
            set(val) {
                this.currentOptions.barMinHeight = val;
            }
        },
        barWidth: {
            get() {
                return `${this.currentOptions.barWidth}`;
            },
            set(val) {
                this.currentOptions.barWidth = val;
            }
        },
        barMinWidth: {
            get() {
                return `${this.currentOptions.barMinWidth}`;
            },
            set(val) {
                const currentWidthPx = this.takeUnit2Px({ size: val });
                const maxWidthPx = this.takeUnit2Px({ size: this.currentOptions.barMaxWidth });
                if (currentWidthPx < maxWidthPx) {
                    this.currentOptions.barMinWidth = val;
                }
            }
        },
        barMaxWidth: {
            get() {
                return `${this.currentOptions.barMaxWidth}`;
            },
            set(val) {
                const currentWidthPx = this.takeUnit2Px({ size: val });
                const minWidthPx = this.takeUnit2Px({ size: this.currentOptions.barMinWidth });
                if (currentWidthPx > minWidthPx) {
                    this.currentOptions.barMaxWidth = val;
                }
            }
        },
        labelFontSize: {
            get() {
                const {
                    label: { fontSize }
                } = this.currentOptions;
                return `${fontSize}`;
            },
            set(val) {
                const { label } = this.currentOptions;
                label.fontSize = val;
            }
        },
        isStackedType() {
            return this.currentOptions.customType.includes('stacked');
        },
        datasetMetricNamesOptions() {
            const options = this.metricNames.reduce(
                (acc, { dimensionIndex, ...data }) => ({
                    ...acc,
                    [dimensionIndex]: acc[dimensionIndex] ? [...acc[dimensionIndex], data] : [data]
                }),
                {}
            );
            return Object.fromEntries(
                Object.entries(options)
                    .filter(([key]) => key !== -1)
                    .map(([key, data]) => [key, [...data, ...(options[-1] ?? [])]])
            );
        },
        metricNamesOptions() {
            const { originIdx } = this.currentOptions;
            return this.datasetMetricNamesOptions[originIdx];
        },
        hasNotComparedType() {
            const { customType } = this.currentOptions;
            return customType !== 'plan' && customType !== 'fact';
        },
        categoryAxisType() {
            const categoryAxis = this.axis.find((item) => item.type === 'category');
            return categoryAxis?.typeAxis ?? '';
        },
        datasetOptions() {
            return this.datasetNames.map((name, idx) => ({
                value: `${idx}`,
                label: `${name} [${idx}]`
            }));
        },
        minorDimensionNamesOptions() {
            return this.minorDimensionNames.map((name) => ({ value: name, label: name }));
        }
    },

    static: {
        formatOptions: METRIC_FORMAT_OPTIONS,
        separatorOptions: SEPARATOR_OPTIONS,
        gradientPosOptions: GRADIENT_POS_OPTIONS,
        chartTypes: CHART_TYPES,
        labelPosOptions: LABEL_POS_OPTIONS,
        fillPositions: FILL_POSITIONS,
        lineTypes: LINE_TYPES,
        symbolTypes: SYMBOL_TYPES,
        animationTypes: ANIMATION_TYPES,
        LabelAlignOptions,
        VerticalAlignOptions,
        SortOptions,
        CommonSizeFirstPxUnits,
        FontSizeFirstPxUnits
    },

    watch: {
        'customColor.name': {
            handler() {
                const {
                    currentOptions: { customColors }
                } = this;
                const index = customColors.findIndex(({ name }) => name === this.customColor.name);
                this.customColor = {
                    ...this.customColor,
                    color: customColors?.[index]?.color ?? '',
                    fillColor: customColors?.[index]?.fillColor ?? '',
                    gradient: customColors?.[index]?.gradient ?? false,
                    firstColor: customColors?.[index]?.firstColor ?? '',
                    offSetFirstColor: customColors?.[index]?.offSetFirstColor ?? '0',
                    secondColor: customColors?.[index]?.secondColor ?? '',
                    offSetSecondColor: customColors?.[index]?.offSetSecondColor ?? '1',
                    colorPos: customColors?.[index]?.colorPos ?? '0 0 0 1'
                };
            }
        },
        multiMetricMap: {
            handler(newMap) {
                const {
                    currentOptions: { multiMetricMode }
                } = this;
                const metricNames = multiMetricMode?.metricNames;
                const metricDatasets = multiMetricMode?.metricDatasets;
                const metricSorts = multiMetricMode?.metricSorts;
                if (metricNames === null || metricDatasets === null || metricSorts === null) {
                    return;
                }
                newMap.forEach(({ metric, dataset, sort }, index) => {
                    metricNames[index] = metric;
                    metricDatasets[index] = dataset;
                    metricSorts[index] = sort;
                });
            },
            immediate: true
        },
        categoryAxisType(value, oldValue) {
            if (value !== oldValue) {
                this.collectSettings();
            }
        },
        'currentOptions.colorStep': {
            handler(colorStep, oldColorStep) {
                if (oldColorStep != null && colorStep !== oldColorStep) {
                    this.onColorStepChange(colorStep, oldColorStep);
                }
            }
        },
        'currentOptions.multiMetricMode': {
            handler() {
                const {
                    currentOptions: { multiMetricMode }
                } = this;

                const metricNames = multiMetricMode?.metricNames || [];
                const metricDatasets = multiMetricMode?.metricDatasets || [];
                const metricSorts = multiMetricMode?.metricSorts || [];
                if (metricDatasets.length < metricNames.length) {
                    multiMetricMode.metricDatasets = [
                        ...metricDatasets,
                        ...new Array(metricNames.length - metricDatasets.length).fill('')
                    ];
                }
                if (metricSorts.length < metricNames.length) {
                    multiMetricMode.metricSorts = [
                        ...metricSorts,
                        ...new Array(metricNames.length - metricSorts.length).fill('')
                    ];
                }

                this.multiMetricMap = metricNames.map((metric, index) => ({
                    metric,
                    dataset: metricDatasets?.[index] || this.datasetOptions[this.currentOptions.originIdx].value || '',
                    sort: metricSorts?.[index] || ''
                }));
            },
            immediate: true,
            deep: true
        }
    },

    created() {
        this.currentOptions = { ...createSeriesTemplateByIndex(this.templateIndex), ...cloneDeep(this.styles) };

        if (_get(this.currentOptions, 'areaStyle', null)) {
            if (this.currentOptions.fillUnderLine && !this.currentOptions.gradient) {
                this.currentOptions.fillColor = _get(this.currentOptions.areaStyle, 'colorStops[0].color', '#d74545');
            } else if (this.currentOptions.fillUnderLine) {
                this.currentOptions.firstColor = _get(this.currentOptions.areaStyle.color, 'colorStops[0].color');
                this.currentOptions.offSetFirstColor = _get(
                    this.currentOptions.areaStyle.color,
                    'colorStops[0].offset'
                );
                this.currentOptions.secondColor = _get(this.currentOptions.areaStyle.color, 'colorStops[1].color');
                this.currentOptions.offSetSecondColor = _get(
                    this.currentOptions.areaStyle.color,
                    'colorStops[1].offset'
                );
            }
        }
    },

    methods: {
        deleteMetric() {
            this.$emit('delete', this.index);
        },
        resolveColorValue(color) {
            return convertCssVarToComputedValue(color, this.elemComputedStyles);
        },
        changeSeriesType(seriesType) {
            const { minorDimensionNames: dimensionNames, currentOptions } = this;
            const { customColors, color, colorStep } = this.currentOptions;
            switch (seriesType) {
                case 'stacked':
                case 'stacked line':
                    currentOptions.type = seriesType === 'stacked line' ? 'line' : 'bar';
                    if (customColors.length === 0) {
                        const resolvedColor = this.resolveColorValue(color);
                        currentOptions.customColors = utils.buildColorSet(resolvedColor, colorStep, dimensionNames);
                    }
                    break;
                case 'line':
                    if (currentOptions.type === 'bar') {
                        currentOptions.colorForLine = currentOptions.colorForBar;
                    }
                    this.currentOptions.type = seriesType;
                    this.currentOptions.itemStyle = {};
                    break;
                case 'bar':
                case 'plan':
                case 'fact':
                    if (currentOptions.type === 'line') {
                        currentOptions.colorForBar = currentOptions.colorForLine;
                    }
                    this.currentOptions.type = 'bar';
                    this.currentOptions.itemStyle = {};
            }

            this.collectSettings();
        },
        onColorStepChange(colorStep, oldColorStep) {
            const customColors = this.currentOptions.customColors.map(({ name, color }) => {
                let newColor = Color(color);
                const { l: light } = newColor.hsl().object();
                newColor = newColor.lightness((light / oldColorStep) * colorStep).string();
                return { name, color: newColor };
            });

            this.currentOptions.colorStep = colorStep;
            this.currentOptions.customColors = customColors;
            this.changed();
        },
        onMetricNameChange(metricName) {
            this.currentOptions = { ...this.currentOptions, marker: metricName, name: metricName };
            this.collectSettings();
        },
        collectSettings() {
            const { type, smooth, gradient, fillLine, itemStyle, isRoundedBarBorder, roundedBarBorder } =
                this.currentOptions;

            if (type === 'bar') {
                if (smooth && this.hasNotComparedType) {
                    const roundedBdr = 500;
                    itemStyle.barBorderRadius = [0, 0, 0, 0];

                    if (this.categoryAxisType === 'x') {
                        itemStyle.barBorderRadius = [roundedBdr, roundedBdr, 0, 0];
                    } else if (this.categoryAxisType === 'y') {
                        itemStyle.barBorderRadius = [0, roundedBdr, roundedBdr, 0];
                    }
                } else {
                    itemStyle.barBorderRadius = [0, 0, 0, 0];
                }
            }

            if (['bar', 'stacked'].includes(type) && isRoundedBarBorder) {
                const { leftTop = 0, rightTop = 0, rightBottom = 0, leftBottom = 0 } = roundedBarBorder ?? {};
                itemStyle.barBorderRadius = [leftTop, rightTop, rightBottom, leftBottom];
            }

            if (type === 'line' && fillLine) {
                this.currentOptions.areaStyle = {};
                const { areaStyle } = this.currentOptions;
                if (gradient && fillLine) {
                    const [x, y, x2, y2] = this.currentOptions.colorPos.split(' ');

                    areaStyle.color = {
                        type: 'linear',
                        x,
                        y,
                        x2,
                        y2,
                        colorStops: [
                            {
                                offset: this.currentOptions.offSetFirstColor,
                                color: this.currentOptions.firstColor
                            },
                            {
                                offset: this.currentOptions.offSetSecondColor,
                                color: this.currentOptions.secondColor
                            }
                        ]
                    };
                    areaStyle.shadowBlur = 10;
                    areaStyle.shadowColor = 'rgba(0, 0, 0, 0.1)';
                    areaStyle.origin = this.currentOptions.smartFill ? 'auto' : this.currentOptions.origin;
                } else if (fillLine) {
                    this.currentOptions.areaStyle = {
                        origin: this.currentOptions.smartFill ? 'auto' : this.currentOptions.origin
                    };

                    if (this.currentOptions.fillColor !== '') {
                        this.currentOptions.areaStyle.color = {
                            type: 'linear',
                            x: 0,
                            y: 0,
                            x2: 0,
                            y2: 1,
                            colorStops: [
                                {
                                    offset: '0',
                                    color: this.currentOptions.fillColor
                                },
                                {
                                    offset: '1',
                                    color: this.currentOptions.fillColor
                                }
                            ]
                        };
                    }
                }
            } else {
                this.currentOptions.areaStyle = null;
            }
            this.changed();
        },
        collectAndUpdateColorsForLine() {
            const { minorDimensionNames: dimensionNames, currentOptions } = this;
            const { colorForLine, colorStep } = currentOptions;
            const resolvedColor = this.resolveColorValue(colorForLine);
            this.currentOptions = {
                ...currentOptions,
                customColors: utils.buildColorSet(resolvedColor, colorStep, dimensionNames)
            };
            this.collectColorForLine();
        },
        collectColorForLine() {
            const { colorForLine, fillSymbol, symbolColor, symbolBdrWidth, symbolBdrColor, lineStyle, itemStyle } =
                this.currentOptions;

            this.currentOptions = {
                ...this.currentOptions,
                color: colorForLine,
                itemStyle: {
                    ...itemStyle,
                    color: fillSymbol ? symbolColor : colorForLine,
                    borderWidth: symbolBdrWidth,
                    borderColor: symbolBdrColor
                },
                lineStyle: { ...lineStyle, color: colorForLine }
            };
            this.changed();
        },

        buildColorFromGradient(gradient) {
            if (gradient === undefined) {
                return '';
            }

            const { pos, firstColor, firstOffset, secondOffset, secondColor } = gradient;

            const [x, y, x2, y2] = pos.split(' ');

            return {
                type: 'linear',
                x,
                y,
                x2,
                y2,
                colorStops: [
                    {
                        offset: firstOffset,
                        color: firstColor
                    },
                    {
                        offset: secondOffset,
                        color: secondColor
                    }
                ]
            };
        },

        collectCondition(condition) {
            const { useGradient, gradient } = condition;

            if (useGradient) {
                condition.gradientColor = this.buildColorFromGradient(gradient);
            }

            this.collectSettings();
        },
        collectColorForBar() {
            const { minorDimensionNames: dimensionNames, currentOptions } = this;
            const { gradientForBar, barPos, colorForBar, colorStep } = currentOptions;

            if (gradientForBar && barPos?.length > 0) {
                const {
                    barFirstOffSet: firstOffset,
                    barFirstColor: firstColor,
                    barSecondOffSet: secondOffset,
                    barSecondColor: secondColor
                } = currentOptions;
                const [x, y, x2, y2] = barPos.split(' ');

                this.currentOptions.color = {
                    type: 'linear',
                    x,
                    y,
                    x2,
                    y2,
                    colorStops: [
                        {
                            offset: firstOffset,
                            color: firstColor
                        },
                        {
                            offset: secondOffset,
                            color: secondColor
                        }
                    ]
                };
            } else {
                this.currentOptions.color = colorForBar;
                const resolvedColor = this.resolveColorValue(colorForBar);
                this.currentOptions.customColors = utils.buildColorSet(resolvedColor, colorStep, dimensionNames);
            }
            this.changed();
        },
        collectComparedColors(item) {
            if (item == null) {
                return;
            }

            const { gradient, gradPos, firstOffSet, firstColor, secondOffSet, secondColor } = this.currentOptions[item];

            if (gradient && gradPos) {
                const [x, y, x2, y2] = this.currentOptions.colorPos.split(' ');

                this.currentOptions[item].color = {
                    type: 'linear',
                    x,
                    y,
                    x2,
                    y2,
                    colorStops: [
                        {
                            offset: firstOffSet,
                            color: firstColor
                        },
                        {
                            offset: secondOffSet,
                            color: secondColor
                        }
                    ]
                };
            }
            this.changed();
        },
        changeCustomColor() {
            const idx = this.currentOptions.customColors.findIndex(({ name }) => name === this.customColor.name);
            if (idx === -1) {
                this.currentOptions.customColors.push({ ...this.customColor });
                this.changed();
                return;
            }
            this.currentOptions.customColors.splice(idx, 1, { ...this.customColor });
            this.changed();
        },
        addCondition() {
            this.currentOptions.styleConditions.conditions.push(this.condStyleFactory());
            this.changed();
        },
        deleteCondition(idx) {
            this.currentOptions.styleConditions.conditions.splice(idx, 1);
            this.changed();
        },
        addMetricName() {
            const { multiMetricMode } = this.currentOptions;
            const metricNames = multiMetricMode?.metricNames || [];
            const metricDatasets = multiMetricMode?.metricDatasets || [];
            const metricSorts = multiMetricMode?.metricSorts || [];
            this.currentOptions.multiMetricMode = {
                ...multiMetricMode,
                metricNames: [...metricNames, ''],
                metricDatasets: [...metricDatasets, ''],
                metricSorts: [...metricSorts, '']
            };
            this.changed();
        },
        deleteMetricName(idx) {
            this.currentOptions.multiMetricMode.metricNames.splice(idx, 1);
            this.currentOptions.multiMetricMode.metricDatasets.splice(idx, 1);
            this.changed();
        },
        changed() {
            this.$emit('change-style', this.currentOptions, this.index);
        }
    }
};
</script>
