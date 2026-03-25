<template>
    <div>
        <ui-collapse class="p">
            <template #header>Основное измерение</template>
            <ui-select
                class="p"
                v-model="props.dimensionOptions.main.name"
                :options="dimNamesOptions"
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
                :options="dimNamesOptions"
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
    </div>
</template>
<script>
/**
 * @typedef {import('./DimensionsPanel').IComponentOptions} IComponentOptions
 * @typedef {import('./DimensionsPanel').IInstance} IInstance
 */
import { Panel } from 'goodt-wcore';
import { DIM_VALUE_FORMATS, SORT_OPTIONS } from './config';
/**
 * @type {IComponentOptions}
 */
export default {
    extends: Panel,

    data() {
        return {
            $meta: { name: 'Измерения', icon: 'altimeter' }
        };
    },

    computed: {
        /**
         * @return {object[]}
         */
        queryHelper() {
            return this.elementInstance && this.elementInstance.getQueryHelper
                ? this.elementInstance.getQueryHelper()
                : [];
        },
        /**
         * @return {string[]}
         */
        dimensionNames() {
            return [
                ...this.queryHelper.reduce((set, { dimensionList }) => {
                    Object.keys(dimensionList).forEach((dim) => {
                        set.add(dim);
                    });
                    return set;
                }, new Set())
            ];
        },
        /**
         * @return {{ label: string, value: any }[]}
         */
        dimNamesOptions() {
            return [
                { label: '', value: null },
                ...this.dimensionNames.map((value) => ({
                    label: value,
                    value
                }))
            ];
        }
    },

    static: {
        dimValueFormats: DIM_VALUE_FORMATS,
        sortOptions: SORT_OPTIONS
    }
};
</script>
