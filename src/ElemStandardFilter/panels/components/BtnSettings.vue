<template>
    <ui-container>
        <ui-input v-model="model.text" @change="saveModel">Текст кнопки</ui-input>
        <ui-input-units v-model="model.fontSize" :units="SizeUnits" @change="saveModel">Размер шрифта</ui-input-units>
        <ui-input-cp v-model="model.color" @change="saveModel">Цвет шрифта</ui-input-cp>
        <ui-input-cp v-model="model.background" @change="saveModel">Фон кнопки</ui-input-cp>
        <ui-input-tags v-model="model.classes" @change="saveModel">Классы кнопки</ui-input-tags>
        <ui-input-tags v-model="model.styles" @change="saveModel">Стили кнопки</ui-input-tags>

        <ui-has-panel>
            <ui-checkbox v-model="model.icon.isUsed" @change="saveModel">Иконка</ui-checkbox>
            <template #panel>
                <ui-panel :groups="[{ name: 'Настройка иконки', slot: 'default' }]">
                    <ui-container>
                        <ui-input v-model="model.icon.class" @change="saveModel">mdi-класс</ui-input>
                        <ui-select v-model="model.icon.position" :options="IconPositionOptions" @change="saveModel">
                            Расположение
                        </ui-select>
                        <ui-input-cp v-model="model.icon.style.color" @change="saveModel">Цвет</ui-input-cp>
                        <ui-input-units v-model="model.icon.style.fontSize" :units="SizeUnits" @change="saveModel">
                            Размер
                        </ui-input-units>
                        <ui-has-two-columns>
                            <template #left>
                                <ui-input-units
                                    v-model="model.icon.style.margin[3]"
                                    :units="SizeUnits"
                                    @change="saveModel">
                                    Отступ слева
                                </ui-input-units>
                            </template>
                            <template #right>
                                <ui-input-units
                                    v-model="model.icon.style.margin[1]"
                                    :units="SizeUnits"
                                    @change="saveModel">
                                    Отступ справа
                                </ui-input-units>
                            </template>
                        </ui-has-two-columns>
                        <ui-has-two-columns>
                            <template #left>
                                <ui-input-units
                                    v-model="model.icon.style.margin[0]"
                                    :units="SizeUnits"
                                    @change="saveModel">
                                    Отступ сверху
                                </ui-input-units>
                            </template>
                            <template #right>
                                <ui-input-units
                                    v-model="model.icon.style.margin[2]"
                                    :units="SizeUnits"
                                    @change="saveModel">
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
        value: {
            type: Object,
            default: null
        }
    },
    static: {
        SizeUnits,
        IconPositionOptions
    },
    computed: {
        model() {
            const { value } = this;
            return {
                classes: value.classes ?? [],
                styles: value.styles ?? [],
                icon: value.icon ?? {
                    isUsed: false,
                    class: '',
                    position: 'row',
                    // eslint-disable-next-line no-restricted-syntax
                    style: { color: '', fontSize: '', margin: ['0px', '0px', '0px', '0px'] }
                },
                text: value.text ?? '',
                background: value.background ?? '#1a67fe',
                fontSize: value.fontSize ?? '.875rem',
                color: value.color ?? '#fff'
            };
        }
    },
    methods: {
        saveModel() {
            this.$emit('input', this.model);
            this.$emit('change', this.model);
        }
    }
};
</script>
