<template>
    <ui-has-panel>
        <ui-checkbox v-model="model.isUsed" @change="saveModel">Тень</ui-checkbox>
        <template #panel>
            <ui-panel :groups="[{ name: 'Настройка тени', slot: 'default' }]">
                <ui-container>
                    <ui-has-two-columns>
                        <template #left>
                            <ui-input-units v-model="model.blur" :units="SizeUnits" @change="saveModel">
                                Размытие
                            </ui-input-units>
                        </template>
                        <template #right>
                            <ui-input-units v-model="model.spread" :units="SizeUnits" @change="saveModel">
                                Растяжение
                            </ui-input-units>
                        </template>
                    </ui-has-two-columns>

                    <ui-input-cp v-model="model.color" @change="saveModel">Цвет тени</ui-input-cp>

                    <ui-has-two-columns>
                        <template #left>
                            <ui-input-units v-model="model.offsetX" :units="SizeUnits" @change="saveModel">
                                Сдвиг по X
                            </ui-input-units>
                        </template>
                        <template #right>
                            <ui-input-units v-model="model.offsetY" :units="SizeUnits" @change="saveModel">
                                Сдвиг по Y
                            </ui-input-units>
                        </template>
                    </ui-has-two-columns>

                    <ui-switch v-model="model.inset" @change="saveModel">Тень внутри элемента</ui-switch>
                </ui-container>
            </ui-panel>
        </template>
    </ui-has-panel>
</template>

<script>
import { PanelUi } from '@goodt-wcore/components';
import { SizeUnits } from '@goodt-wcore/panels';

export default {
    components: { ...PanelUi },
    props: {
        value: {
            type: Object,
            default: null
        }
    },
    computed: {
        model() {
            return (
                this.value ?? {
                    isUsed: false,
                    blur: '4px',
                    spread: '2px',
                    color: '',
                    offsetX: '0px',
                    offsetY: '0px',
                    inset: false
                }
            );
        }
    },
    static: {
        SizeUnits
    },
    methods: {
        saveModel() {
            const { model } = this;
            this.$emit('input', model);
            this.$emit('change', model);
        }
    }
};
</script>
