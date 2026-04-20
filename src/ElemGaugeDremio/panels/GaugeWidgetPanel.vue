<template>
    <w-panel>
        <ui-has-panel class="p">
            <ui-checkbox v-model="props.showTitle" @change="propChanged('showTitle')">Добавить заголовок</ui-checkbox>
            <template #panel>
                <ui-panel :groups="[{ name: 'Настройка заголовка', slot: 'show-title' }]">
                    <template #show-title>
                        <ui-input class="p" v-model="props.title" @change="propChanged('title')">Заголовок</ui-input>

                        <ui-input-cp class="p" v-model="props.titleColor" @input="propChanged('titleColor')">
                            Цвет заголовка
                        </ui-input-cp>

                        <ui-input-units
                            class="p"
                            colSize="6-12"
                            :units="FontUnits"
                            v-model="props.titleFontSize"
                            @change="propChanged('titleFontSize')">
                            Размер
                        </ui-input-units>

                        <ui-input colSize="6-12" v-model="props.titleFont" @change="propChanged('titleFont')">
                            Шрифт заголовка
                        </ui-input>
                    </template>
                </ui-panel>
            </template>
        </ui-has-panel>

        <ui-has-panel class="p">
            <ui-checkbox v-model="props.showLegend" @change="propChanged('showLegend')">Добавить легенду</ui-checkbox>
            <template #panel>
                <ui-panel :groups="[{ name: 'Настройка легенды', slot: 'show-legend' }]">
                    <template #show-legend>
                        <ui-select class="p" colSize="6-12" :options="NumberFormatOptions" v-model="props.legendFormat">
                            Тип
                        </ui-select>

                        <ui-input-units
                            class="p"
                            colSize="6-12"
                            :units="FontUnits"
                            v-model="props.legendFontSize"
                            @change="propChanged('legendFontSize')">
                            Размер
                        </ui-input-units>

                        <ui-input colSize="6-12" v-model="props.legendFont" @change="propChanged('legendFont')">
                            Шрифт
                        </ui-input>
                    </template>
                </ui-panel>
            </template>
        </ui-has-panel>

        <ui-has-panel class="p">
            <ui-checkbox v-model="props.iconShow" @change="propChanged('iconShow')">Добавить иконку</ui-checkbox>
            <template #panel>
                <ui-panel :groups="[{ name: 'Настройка иконки', slot: 'icon-show' }]">
                    <template #icon-show>
                        <ui-input class="p" v-model="props.iconClass" @change="propChanged('iconClass')">
                            Класс mdi иконки
                        </ui-input>

                        <ui-input-cp class="p" v-model="props.iconColor" @input="propChanged('iconColor')">
                            Цвет иконоки
                        </ui-input-cp>

                        <ui-input-units
                            colSize="6-12"
                            :units="FontUnits"
                            v-model="props.iconSize"
                            @change="propChanged('iconSize')">
                            Размер иконоки
                        </ui-input-units>
                    </template>
                </ui-panel>
            </template>
        </ui-has-panel>

        <ui-has-panel class="p">
            <ui-checkbox v-model="props.showBackground" @change="propChanged('showBackground')">
                Добавить фон
            </ui-checkbox>
            <template #panel>
                <ui-panel :groups="[{ name: 'Настройка фона', slot: 'show-background' }]">
                    <template #show-background>
                        <ui-input-cp v-model="props.backgroundColor" @input="propChanged('backgroundColor')">
                            Цвет фона
                        </ui-input-cp>
                    </template>
                </ui-panel>
            </template>
        </ui-has-panel>

        <ui-has-panel class="p">
            <ui-checkbox v-model="props.showPercent" @change="propChanged('showPercent')">
                Добавить проценты
            </ui-checkbox>
            <template #panel>
                <ui-panel :groups="[{ name: 'Настройка процентов', slot: 'show-percent' }]">
                    <template #show-percent>
                        <ui-input-cp class="p" v-model="props.percentColor" @input="propChanged('percentColor')">
                            Цвет процентов
                        </ui-input-cp>

                        <ui-input-units
                            class="p"
                            colSize="6-12"
                            :units="FontUnits"
                            v-model="props.percentFontSize"
                            @change="propChanged('percentFontSize')">
                            Размер
                        </ui-input-units>

                        <ui-select
                            class="p"
                            colSize="6-12"
                            :options="PercentFormatOptions"
                            v-model="props.percentFormat"
                            @change="propChanged('percentFormat')">
                            Формат процента
                        </ui-select>

                        <ui-input
                            class="p"
                            colSize="6-12"
                            v-model="props.percentFont"
                            @change="propChanged('percentFont')">
                            Шрифт процентов
                        </ui-input>

                        <ui-select
                            :options="PercentPosition"
                            v-model="props.percentPosition"
                            @change="propChanged('percentPosition')">
                            Расположение процентов
                        </ui-select>
                    </template>
                </ui-panel>
            </template>
        </ui-has-panel>

        <ui-switch class="p" v-model="props.showTooltip" @change="propChanged('showTooltip')">
            Всплывающее окно с показателем
        </ui-switch>

        <ui-switch class="p" v-model="props.fitHeight" @change="propChanged('fitHeight')">
            Вписывать по высоте
        </ui-switch>

        <ui-input
                class="p"
                v-model="props.updateEvent"
                @change="propChanged('updateEvent')">
            Событие для обновления
        </ui-input>
    </w-panel>
</template>
<script>
import { Panel } from '@goodt-wcore/panel';
import { BorderWidthUnits as FontUnits } from '@goodt-wcore/panels';
import { NumberFormatOptions, PercentFormatOptions, PercentPosition } from '../utils/constants';

export default {
    extends: Panel,
    static: {
        PercentPosition,
        FontUnits,
        NumberFormatOptions,
        PercentFormatOptions
    },
    meta: { name: 'Настройки виджета', icon: 'widgets' }
};
</script>
