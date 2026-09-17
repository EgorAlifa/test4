<template>
    <ui-panel-container>
        <ui-container>
            <ui-switch v-model="props.paginationOptions.isEnable" @change="propChanged('paginationOptions')">
                Включить пагинацию
            </ui-switch>
            <ui-input v-model="props.paginationOptions.fontFamily" @change="propChanged('paginationOptions')">
                Шрифт
            </ui-input>
            <ui-input-units
                v-model="props.paginationOptions.fontSize"
                :units="units"
                @change="propChanged('paginationOptions')">
                Размер шрифта
            </ui-input-units>
            <ui-input-cp v-model="props.paginationOptions.color" @change="propChanged('paginationOptions')">
                Цвет текста
            </ui-input-cp>
            <ui-input-cp v-model="props.paginationOptions.activeColor" @change="propChanged('paginationOptions')">
                Цвет текста активной кнопки
            </ui-input-cp>
            <ui-input-cp v-model="props.paginationOptions.activeBackground" @change="propChanged('paginationOptions')">
                Цвет активной кнопки
            </ui-input-cp>
            <ui-input type="number" v-model.number="props.paginationOptions.numItems" @change="propChanged('numItems')">
                Число страниц для показа
            </ui-input>
        </ui-container>
    </ui-panel-container>
</template>
<script>
/**
 * @typedef {import('./DimensionPanel').IComponentOptions} IComponentOptions
 * @typedef {import('./DimensionPanel').IInstance} IInstance
 */
import { Panel, Dremio } from 'goodt-wcore';
import { SizeUnits } from '@goodt-wcore/panels';
import { CloseOptions } from '../config';
// eslint-disable-next-line import/no-cycle
import { Events } from '../descriptor';

const { Query } = Dremio;

/**
 * @type {IComponentOptions}
 */
export default {
    extends: Panel,
    static: {
        units: SizeUnits,
        CloseOptions,
        Events
    },
    data: () => ({
        /** @public */
        $meta: { name: 'Настройки пагинации', icon: 'book-open-page-variant-outline' }
    }),
    computed: {},
    created() {},
    methods: {}
};
</script>
