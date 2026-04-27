<template>
    <ui-panel-container>
        <ui-container>
            <ui-has-panel>
                <ui-label>Общая стилизация</ui-label>
                <template #panel>
                    <ui-panel
                        :groups="[
                            { name: 'Ховер', slot: 'hover' },
                            { name: 'Селект', slot: 'select' }
                        ]">
                        <template #hover>
                            <ui-container>
                                <ui-input-cp prop="style.hover.color">Цвет шрифта</ui-input-cp>
                                <ui-select prop="style.hover.fontWeight" :options="FontWeightOptions">
                                    Начертание шрифта
                                </ui-select>
                                <ui-input-cp prop="style.hover.bgColor">Цвет заливки</ui-input-cp>
                                <ui-input-gradient
                                    v-model="props.style.hover.gradient"
                                    @change="propChanged('style')" />
                                <ui-input prop="style.hover.transitionDuration" type="number">
                                    Длительность анимации (мс)
                                </ui-input>
                            </ui-container>
                        </template>
                        <template #select>
                            <ui-container>
                                <ui-input-cp prop="style.select.color">Цвет шрифта</ui-input-cp>
                                <ui-select prop="style.select.fontWeight" :options="FontWeightOptions">
                                    Начертание шрифта
                                </ui-select>
                                <ui-input-cp prop="style.select.bgColor">Цвет заливки</ui-input-cp>
                                <ui-input-gradient
                                    v-model="props.style.select.gradient"
                                    @change="propChanged('style')" />
                                <ui-input prop="style.select.transitionDuration" type="number">
                                    Длительность анимации (мс)
                                </ui-input>
                                <ui-border-settings prop="style.select.border"></ui-border-settings>
                            </ui-container>
                        </template>
                    </ui-panel>
                </template>
            </ui-has-panel>
            <ui-switch prop="border.isDisplayed">Отображать границу</ui-switch>
            <ui-input-cp prop="border.color">Цвет границы</ui-input-cp>
            <ui-input-units prop="border.width" :units="BorderWidthUnits">Толщина границы</ui-input-units>
        </ui-container>
    </ui-panel-container>
</template>
<script>
import { Panel } from '@goodt-wcore/core';
import { FontWeightOptions, BorderWidthUnits } from '@goodt-wcore/panels';
import { PanelInstanceTypeDescriptor } from '../types';
import { UiInputGradient } from '@goodt-widgets-insight/table-common';
import UiBorderSettings from './components/BorderSettings.vue';

export default {
    extends: Panel,
    components: { UiInputGradient, UiBorderSettings },
    meta: { name: 'Настройки виджета', icon: 'widgets' },
    data: () => ({
        ...PanelInstanceTypeDescriptor
    }),
    static: {
        FontWeightOptions: [{ value: null, label: '-' }, ...FontWeightOptions],
        BorderWidthUnits
    }
};
</script>
