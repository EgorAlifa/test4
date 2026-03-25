<template>
    <ui-container>
        <ui-collapse>
            <template #header>Стили</template>
            <ui-container>
                <ui-font-settings v-model="model.style" @change="saveModel" />
                <ui-has-two-columns>
                    <template #left>
                        <ui-input-units v-model="model.style.height" :units="SizeUnits" @change="saveModel">
                            Высота
                        </ui-input-units>
                    </template>
                    <template #right>
                        <ui-input-units
                            v-model="model.style.borderRadius"
                            :units="SizeUnits"
                            :options="BorderRadiusOptions"
                            @change="saveModel">
                            Скругление углов
                        </ui-input-units>
                    </template>
                </ui-has-two-columns>
                <ui-input-cp v-model="model.style.bgColor" @change="saveModel">Цвет фона</ui-input-cp>
                <ui-input v-model="model.style.boxShadow" @change="saveModel">Тень</ui-input>
            </ui-container>
        </ui-collapse>
        <ui-collapse>
            <template #header>Текст</template>
            <ui-container>
                <ui-switch v-model="model.caption.isDisplayed" @change="saveModel">Отображать текст</ui-switch>
                <ui-input v-model="model.caption.text" @change="saveModel">Текст</ui-input>
            </ui-container>
        </ui-collapse>
        <ui-collapse>
            <template #header>Иконка</template>
            <ui-container>
                <ui-switch v-model="model.icon.isDisplayed" @change="saveModel">Отображать иконку</ui-switch>
                <ui-input v-model="model.icon.class" @change="saveModel">Иконка</ui-input>
                <ui-has-two-columns>
                    <template #left>
                        <ui-select v-model="model.icon.position" :options="IconPositionOptions" @change="saveModel">
                            Позиция
                        </ui-select>
                    </template>
                    <template #right>
                        <ui-input-units v-model="model.icon.fontSize" :units="SizeUnits" @change="saveModel">
                            Размер
                        </ui-input-units>
                    </template>
                </ui-has-two-columns>
                <ui-input-cp v-model="model.icon.color" @change="saveModel">Цвет</ui-input-cp>
                <ui-has-two-columns>
                    <template #left>
                        <ui-input-units v-model="model.icon.offset[0]" :units="SizeUnits" @change="saveModel">
                            Отступ слева
                        </ui-input-units>
                    </template>
                    <template #right>
                        <ui-input-units v-model="model.icon.offset[1]" :units="SizeUnits" @change="saveModel">
                            Отступ справа
                        </ui-input-units>
                    </template>
                </ui-has-two-columns>
            </ui-container>
        </ui-collapse>
    </ui-container>
</template>

<script>
import { PanelUi } from '@goodt-wcore/components';
import { SizeUnits } from '@goodt-wcore/panels';

import { UiFontSettings } from '../../../shared/panels/components';
import { BorderRadiusOptions } from '../../../shared/config';
import { IconPositionOptions } from '../../config';

export default {
    components: { ...PanelUi, UiFontSettings },
    props: {
        value: {
            type: Object,
            default: null
        }
    },
    computed: {
        model() {
            return this.value ?? {};
        }
    },
    static: {
        SizeUnits,
        BorderRadiusOptions,
        IconPositionOptions
    },
    methods: {
        saveModel() {
            this.$emit('input', this.model);
            this.$emit('change', this.model);
        }
    }
};
</script>
