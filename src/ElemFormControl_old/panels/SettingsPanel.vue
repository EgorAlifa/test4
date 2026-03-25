<template>
    <ui-panel-container>
        <ui-container>
            <ui-select prop="dataField" :options="dimensionMetricNamesOptions">Измерение/Метрика</ui-select>
            <ui-select prop="control.type" :options="ControlTypeOptions">Тип отображения</ui-select>
            <ui-has-two-columns>
                <template #left>
                    <ui-input-units prop="control.size" :units="SizeUnits">Размер</ui-input-units>
                </template>
                <template #right>
                    <ui-input-units prop="control.borderRadius" :units="SizeUnits" :options="BorderRadiusOptions">
                        Скругление краев
                    </ui-input-units>
                </template>
            </ui-has-two-columns>
            <ui-input-cp prop="control.bgColor">Цвет фона</ui-input-cp>
            <ui-input-cp prop="control.bgColorActive">Цвет фона активный</ui-input-cp>
            <ui-input prop="control.bgImage">
                <ui-hint>
                    <template #label>Путь до иконки</template>
                    <div>
                        <span>
                            Задается в формате: url('
                            <code>Image url</code>
                            ')
                        </span>
                    </div>
                </ui-hint>
            </ui-input>
            <ui-has-panel>
                <ui-checkbox prop="isButtonDisplayed">Отображать в виде кнопки</ui-checkbox>
                <template #panel>
                    <ui-panel
                        :groups="[
                            { name: 'Общий вид', slot: 'default' },
                            { name: 'Активный', slot: 'active' }
                        ]">
                        <ui-button-settings v-model="props.button.default" @change="propChanged('button')" />
                        <template #active>
                            <ui-button-settings v-model="props.button.active" @change="propChanged('button')" />
                        </template>
                    </ui-panel>
                </template>
            </ui-has-panel>
        </ui-container>
    </ui-panel-container>
</template>
<script>
import { Panel } from '@goodt-wcore/core';
import { SizeUnits } from '@goodt-wcore/panels';

import { BorderRadiusOptions } from '../../shared';
import { PanelInstanceTypeDescriptor } from '../types';
import { ControlTypeOptions } from '../config';
import UiButtonSettings from './components/ButtonSettings.vue';

export default {
    extends: Panel,
    components: { UiButtonSettings },
    meta: { name: 'Настройки виджета', icon: 'widgets' },
    data: () => ({
        ...PanelInstanceTypeDescriptor
    }),
    computed: {
        dimensionMetricNames() {
            return this.elementInstance?.dimensionMetricNames ?? [];
        },
        dimensionMetricNamesOptions() {
            return [{ value: null, label: '-' }, ...this.dimensionMetricNames];
        }
    },
    static: {
        ControlTypeOptions,
        SizeUnits,
        BorderRadiusOptions
    }
};
</script>
