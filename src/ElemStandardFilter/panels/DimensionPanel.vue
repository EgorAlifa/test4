<template>
    <ui-panel-container>
        <ui-container>
            <ui-select v-if="!props.isSmartSearch" prop="selectedDimension" :options="dimensionNames">
                Измерение
            </ui-select>

            <template v-if="props.isSmartSearch">
                <div class="d-flex items-center" v-for="(dimension, index) in props.smartSearchDimensions" :key="index">
                    <ui-select
                        class="w-100"
                        v-model="dimension.name"
                        :options="dimensionNames"
                        @change="propChanged('smartSearchDimensions')">
                        Измерение
                    </ui-select>
                    <i class="mdi mdi-close mar-left-2 cursor-pointer" @click="deleteDimension(dimension.name)"></i>
                </div>

                <button class="btn btn-small btn-primary w-100" @click="addDimension">Добавить измерение</button>
            </template>

            <ui-select prop="dremioUrlFieldName" :options="urlFieldOptions">Переход по ссылке</ui-select>

            <ui-switch prop="isOpenedUrlFromNewTab">Открытие в новой вкладке</ui-switch>

            <ui-has-panel>
                <ui-checkbox prop="isDisplayMetric">Метрика</ui-checkbox>

                <template #panel>
                    <ui-panel :groups="[{ name: 'Настройки метрики', slot: 'metricSettings' }]">
                        <template #metricSettings>
                            <ui-container>
                                <ui-select prop="selectedMetric" :options="metricNames">Метрика</ui-select>

                                <ui-input-cp prop="metricOptions.color">Цвет текста</ui-input-cp>

                                <ui-has-two-columns>
                                    <template #left>
                                        <ui-input prop="metricOptions.fontFamily">Шрифт</ui-input>
                                    </template>
                                    <template #right>
                                        <ui-input-units :units="SizeUnits" prop="metricOptions.fontSize">
                                            Размер шрифта
                                        </ui-input-units>
                                    </template>
                                </ui-has-two-columns>

                                <ui-select prop="metricOptions.fontWeight" :options="FontWeightOptions">
                                    Начертание шрифта
                                </ui-select>

                                <ui-input-cp prop="metricOptions.backgroundColor">Цвет фона</ui-input-cp>

                                <ui-select prop="metricOptions.textAlign" :options="AlignOptions">
                                    Выравнивание
                                </ui-select>

                                <ui-number-format prop="metricOptions.format">Числовой формат</ui-number-format>
                            </ui-container>
                        </template>
                    </ui-panel>
                </template>
            </ui-has-panel>
        </ui-container>
    </ui-panel-container>
</template>
<script>
/**
 * @typedef {import('./DimensionPanel').IComponentOptions} IComponentOptions
 * @typedef {import('./DimensionPanel').IInstance} IInstance
 */
import { Panel } from 'goodt-wcore';
import { FontWeightOptions } from '@goodt-wcore/panels';
import { AlignOptions, SizeUnits } from '../config';
import { EMPTY_FIELD_URL } from '../constants';

/**
 * @type {IComponentOptions}
 */
export default {
    extends: Panel,
    static: { FontWeightOptions, SizeUnits, AlignOptions },
    data() {
        return {
            /** @public */
            $meta: { name: 'Измерение/Метрика', icon: 'gauge' }
        };
    },
    computed: {
        /**
         * @return {object|null}
         */
        queryHelper() {
            return this.elementInstance && this.elementInstance.getQueryHelper
                ? this.elementInstance.getQueryHelper()
                : null;
        },
        dimensionNames() {
            return (
                this.queryHelper
                    ?.map((helper) => {
                        if (helper == null) {
                            return [];
                        }

                        return helper.dimensionList;
                    })
                    .map((dimensions) => Object.keys(dimensions))
                    .flat() ?? []
            );
        },
        metricNames() {
            return (
                this.queryHelper
                    ?.map((helper) => helper?.query?.$metrics ?? [])
                    .flat()
                    .flatMap((metric) => Object.keys(metric)) ?? []
            );
        },
        urlFieldOptions() {
            return [EMPTY_FIELD_URL, ...this.dimensionNames, ...this.metricNames];
        }
    },
    methods: {
        addDimension() {
            this.props.smartSearchDimensions = [...this.props.smartSearchDimensions, { name: '' }];
            this.propChanged('smartSearchDimensions');
        },
        deleteDimension(name) {
            this.props.smartSearchDimensions = this.props.smartSearchDimensions.filter(
                ({ name: dimensionName }) => dimensionName !== name
            );
            this.propChanged('smartSearchDimensions');
        }
    }
};
</script>
