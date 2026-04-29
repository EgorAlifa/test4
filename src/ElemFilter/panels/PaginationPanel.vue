<template>
    <ui-panel-container>
        <ui-container>
            <ui-switch prop="paginationOptions.isEnable">Включить пагинацию</ui-switch>

            <ui-font-settings
                v-model="props.paginationOptions"
                colorTitle="Цвет текста неактивной кнопки"
                @change="propChanged('paginationOptions')" />

            <ui-input-cp prop="paginationOptions.activeColor">Цвет текста активной кнопки</ui-input-cp>
            <ui-input-cp prop="paginationOptions.activeBackground">Цвет активной кнопки</ui-input-cp>
            <ui-input-cp prop="paginationOptions.inactiveBackground">Цвет неактивной кнопки</ui-input-cp>
            <ui-has-two-columns>
                <template #left>
                    <ui-input-units prop="paginationOptions.height" :units="SizeUnits">Высота кнопки</ui-input-units>
                </template>
                <template #right>
                    <ui-input-units prop="paginationOptions.width" :units="SizeUnits">Ширина кнопки</ui-input-units>
                </template>
            </ui-has-two-columns>

            <ui-select prop="paginationOptions.justify" :options="JustifyOptions">Выравнивание</ui-select>

            <ui-has-panel>
                <ui-label>Скругление углов</ui-label>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Скругление углов', slot: 'default' }]">
                        <ui-container>
                            <ui-complex-border-radius
                                v-model="borderRadiusSettings"
                                :units="SizeUnits"></ui-complex-border-radius>
                        </ui-container>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-has-panel>
                <ui-label>Внутренние отступы</ui-label>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Внутренние отступы', slot: 'default' }]">
                        <ui-container>
                            <ui-has-two-columns>
                                <template #left>
                                    <ui-input-units
                                        v-model="props.paginationOptions.padding[0]"
                                        :units="SizeUnits"
                                        @change="propChanged('paginationOptions')">
                                        Сверху
                                    </ui-input-units>
                                </template>
                                <template #right>
                                    <ui-input-units
                                        v-model="props.paginationOptions.padding[2]"
                                        :units="SizeUnits"
                                        @change="propChanged('paginationOptions')">
                                        Снизу
                                    </ui-input-units>
                                </template>
                            </ui-has-two-columns>
                            <ui-has-two-columns>
                                <template #left>
                                    <ui-input-units
                                        v-model="props.paginationOptions.padding[3]"
                                        :units="SizeUnits"
                                        @change="propChanged('paginationOptions')">
                                        Слева
                                    </ui-input-units>
                                </template>
                                <template #right>
                                    <ui-input-units
                                        v-model="props.paginationOptions.padding[1]"
                                        :units="SizeUnits"
                                        @change="propChanged('paginationOptions')">
                                        Справа
                                    </ui-input-units>
                                </template>
                            </ui-has-two-columns>
                        </ui-container>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-input-units prop="paginationOptions.gap" :units="SizeUnits">Отступ между кнопками</ui-input-units>
            <ui-select prop="paginationOptions.digitSeparator" :options="SeparatorOptions">
                Формат разделителя разрядов
            </ui-select>
            <ui-input prop="paginationOptions.numItems" type="number" min="0">Число страниц для показа</ui-input>
        </ui-container>
    </ui-panel-container>
</template>
<script>
import { Panel } from '@goodt-wcore/panel';
import { SizeUnits } from '@goodt-wcore/panels';
import { UiComplexBorderRadius } from '@goodt-wcore/panel-ui';
// eslint-disable-next-line no-restricted-syntax
import { createBorderRadius } from '@goodt-wcore/panel-ui/utils';
import UiFontSettings from './components/FontSettings.vue';
import { SeparatorOptions, JustifyOptions } from '../config';
import { PanelInstanceTypeDescriptor } from '../types';

export default {
    extends: Panel,
    components: { UiFontSettings, UiComplexBorderRadius },
    static: {
        SizeUnits,
        SeparatorOptions,
        JustifyOptions
    },
    meta: { name: 'Пагинация', icon: 'book-open-page-variant-outline' },
    computed: {
        borderRadiusSettings: {
            get() {
                return createBorderRadius(this.props.paginationOptions.borderRadius);
            },
            set(value) {
                const { paginationOptions } = this.props;
                paginationOptions.borderRadius = {
                    ...paginationOptions.borderRadius,
                    ...value
                };
                this.propChanged('paginationOptions');
            }
        }
    },
    methods: {
        ...PanelInstanceTypeDescriptor
    }
};
</script>
