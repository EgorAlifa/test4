<template>
    <ui-container>
        <ui-input :prop="`${prop}.text`">Текст кнопки</ui-input>
        <ui-complex-font :prop="prop"></ui-complex-font>
        <ui-input-cp :prop="`${prop}.background`">Фон кнопки</ui-input-cp>
        <ui-has-panel>
            <ui-checkbox :prop="`${prop}.border.isEnabled`">Отображать границу</ui-checkbox>
            <template #panel>
                <ui-panel :groups="[{ name: 'Настройки границы', slot: 'default' }]">
                    <ui-container>
                        <ui-complex-border :prop="`${prop}.border.borders`" />
                        <ui-complex-border-radius :prop="`${prop}.border.borderRadius`" :units="SizeUnits" />
                    </ui-container>
                </ui-panel>
            </template>
        </ui-has-panel>
        <ui-input-tags :prop="`${prop}.classes`">Классы кнопки</ui-input-tags>
        <ui-input-tags :prop="`${prop}.styles`">Стили кнопки</ui-input-tags>

        <ui-has-panel>
            <ui-checkbox :prop="`${prop}.icon.isUsed`">Иконка</ui-checkbox>
            <template #panel>
                <ui-panel :groups="[{ name: 'Настройка иконки', slot: 'default' }]">
                    <ui-container>
                        <ui-input :prop="`${prop}.icon.class`">mdi-класс</ui-input>
                        <ui-select :prop="`${prop}.icon.position`" :options="IconPositionOptions">
                            Расположение
                        </ui-select>
                        <ui-input-cp :prop="`${prop}.icon.style.color`">Цвет</ui-input-cp>
                        <ui-input-units :prop="`${prop}.icon.style.fontSize`" :units="SizeUnits">Размер</ui-input-units>
                        <ui-has-two-columns>
                            <template #left>
                                <ui-input-units :prop="`${prop}.icon.style.margin[${3}]`" :units="SizeUnits">
                                    Отступ слева
                                </ui-input-units>
                            </template>
                            <template #right>
                                <ui-input-units :prop="`${prop}.icon.style.margin[${1}]`" :units="SizeUnits">
                                    Отступ справа
                                </ui-input-units>
                            </template>
                        </ui-has-two-columns>
                        <ui-has-two-columns>
                            <template #left>
                                <ui-input-units :prop="`${prop}.icon.style.margin[${0}]`" :units="SizeUnits">
                                    Отступ сверху
                                </ui-input-units>
                            </template>
                            <template #right>
                                <ui-input-units :prop="`${prop}.icon.style.margin[${2}]`" :units="SizeUnits">
                                    Отступ снизу
                                </ui-input-units>
                            </template>
                        </ui-has-two-columns>
                    </ui-container>
                </ui-panel>
            </template>
        </ui-has-panel>
    </ui-container>
</template>

<script>
import { PanelUi } from '@goodt-wcore/components';
import { SizeUnits } from '@goodt-wcore/panels';
import { IconPositionOptions } from '../../config';

export default {
    components: { ...PanelUi },
    props: {
        prop: {
            type: String,
            default: ''
        }
    },
    static: {
        SizeUnits,
        IconPositionOptions
    }
};
</script>
