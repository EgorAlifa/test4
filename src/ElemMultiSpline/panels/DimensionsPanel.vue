<template>
    <w-panel>
        <ui-collapse class="p">
            <template #header>Основное измерение</template>
            <ui-select
                class="p"
                v-model="props.dimensionOptions.main.name"
                :options="dimensionsOptions"
                @change="propChanged('dimensionOptions')">
                Наименование
            </ui-select>
            <ui-select
                class="p"
                v-model="props.dimensionOptions.main.format"
                :options="dimValueFormats"
                @change="propChanged('dimensionOptions')">
                Формат
            </ui-select>
            <ui-select
                v-model="props.dimensionOptions.main.sort"
                :options="sortOptions"
                @change="propChanged('dimensionOptions')">
                Сортировка
            </ui-select>
        </ui-collapse>
        <ui-collapse>
            <template #header>Дополнительное измерение</template>
            <ui-select
                class="p"
                v-model="props.dimensionOptions.minor.name"
                :options="dimensionsOptions"
                @change="propChanged('dimensionOptions')">
                Наименование
            </ui-select>
            <ui-select
                class="p"
                v-model="props.dimensionOptions.minor.format"
                :options="dimValueFormats"
                @change="propChanged('dimensionOptions')">
                Формат
            </ui-select>
            <ui-select
                v-model="props.dimensionOptions.minor.sort"
                :options="sortOptions"
                @change="propChanged('dimensionOptions')">
                Сортировка
            </ui-select>
        </ui-collapse>
    </w-panel>
</template>
<script>
/**
 * @typedef {import('./DimensionsPanel').IComponentOptions} IComponentOptions
 * @typedef {import('./DimensionsPanel').IInstance} IInstance
 *
 */
import { Panel } from '@goodt-wcore/panel';
import { usePanelDatasetMixin, PanelDatasetMixinTypes } from '@goodt-common/data';
import { DIM_VALUE_FORMATS, SORT_OPTIONS } from './config';
/**
 * @type {IComponentOptions}
 */
export default {
    extends: Panel,
    mixins: [usePanelDatasetMixin()],

    meta: { name: 'Измерения', icon: 'altimeter' },

    static: {
        dimValueFormats: DIM_VALUE_FORMATS,
        sortOptions: SORT_OPTIONS
    },
    data() {
        return {
            ...PanelDatasetMixinTypes
        };
    },
    computed: {
        /**
         * @return {{ label: string, value: any }[]}
         */
        dimensionsOptions() {
            return this.buildOptions(this.dimensions, { empty: { label: '', value: null } })
        }
    }
};
</script>
