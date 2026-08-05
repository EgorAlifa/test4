<template>
    <ui-has-panel class="form-label form-label-small">
        {{ title }}
        <template #panel>
            <ui-panel :groups="[{ slot: 'default', name: title }]">
                <ui-container>
                    <ui-input-cp v-model="styles.color" @change="updateModel">Цвет текста</ui-input-cp>
                    <ui-has-two-columns>
                        <template #left>
                            <ui-input v-model="styles.fontFamily" @change="updateModel">Шрифт</ui-input>
                        </template>
                        <template #right>
                            <ui-input-units v-model="styles.fontSize" :units="FontSizes" @change="updateModel">
                                Размер шрифта
                            </ui-input-units>
                        </template>
                    </ui-has-two-columns>

                    <ui-select v-model="styles.fontWeight" :options="FontWeightOptions" @change="updateModel">
                        Начертание шрифта
                    </ui-select>
                </ui-container>
            </ui-panel>
        </template>
    </ui-has-panel>
</template>

<script>
import { Components, Panels } from 'goodt-wcore';
import { cloneDeep } from 'lodash';
import { TextAnchorOptions, FontSizes } from '../config';

const { FontWeightOptions } = Panels;

export default {
    components: { ...Components.PanelUi },
    props: {
        value: {
            type: Object,
            default: () => ({})
        },
        title: {
            type: String,
            default: ''
        }
    },
    static: {
        FontSizes,
        TextAnchorOptions,
        FontWeightOptions
    },
    data() {
        return {
            styles: {}
        };
    },
    watch: {
        passStyle: {
            immediate: true,
            handler() {
                this.styles = cloneDeep(this.value);
            }
        }
    },
    methods: {
        updateModel() {
            this.$emit('input', this.styles);
            this.$emit('change', this.styles);
        }
    }
};
</script>
