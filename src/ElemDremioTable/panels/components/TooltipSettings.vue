<template>
    <div>
        <ui-switch v-model="internalSettings.enable" class="p" @change="onChange">Активировать подсказку</ui-switch>

        <ui-input
            v-if="internalSettings.text != null"
            v-model.trim="internalSettings.text"
            class="p"
            @change="onChange">
            Текст
        </ui-input>

        <ui-has-two-columns class="p">
            <template #left>
                <ui-select v-model="internalSettings.position" :options="TooltipPositionOptions" @change="onChange">
                    Позиция подсказки
                </ui-select>
            </template>
            <template #right>
                <ui-input
                    v-model.number="internalSettings.hideDelay"
                    type="number"
                    min="0"
                    step="100"
                    @change="onChange">
                    Скрывать через (мс)
                </ui-input>
            </template>
        </ui-has-two-columns>

        <ui-has-two-columns class="p">
            <template #left>
                <ui-input v-model.number="internalSettings.offsetX" @change="onChange">Горизонтальный отступ</ui-input>
            </template>
            <template #right>
                <ui-input v-model.number="internalSettings.offsetY" @change="onChange">Вертикальный отступ</ui-input>
            </template>
        </ui-has-two-columns>

        <ui-has-two-columns class="p">
            <template #left>
                <ui-switch v-model="internalSettings.appendToBody" @change="onChange">
                    Подсказка создается вне таблицы
                </ui-switch>
            </template>
        </ui-has-two-columns>

        <ui-input v-model="internalSettings.style" @change="onChange">Стили</ui-input>

        <ui-select v-model="internalSettings.value" :options="dimensionMetricNames" @change="onChange">
            Измерение/метрика
        </ui-select>
    </div>
</template>

<script>
import { PanelUi } from '@goodt-wcore/components';
import { TooltipFactory, TooltipPositionOptions } from '../../utils/constants';

export default {
    components: { ...PanelUi },
    props: {
        tooltipOptions: {
            type: Object,
            default: () => TooltipFactory()
        },
        dimensionMetricNames: {
            type: Array,
            default: () => []
        }
    },
    data: () => ({
        internalSettings: null
    }),
    watch: {
        tooltipOptions: {
            handler(options) {
                this.internalSettings = { ...TooltipFactory(), ...options };
            },
            immediate: true
        }
    },
    static: {
        TooltipPositionOptions
    },
    methods: {
        onChange() {
            this.$emit('tooltip-changed', { ...this.internalSettings });
        }
    }
};
</script>
