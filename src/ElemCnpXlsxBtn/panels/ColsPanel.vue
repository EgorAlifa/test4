<template>
    <ui-panel-container>
        <ui-container>
            <ui-input prop="emptyCellPlaceholder">Плейсхолдер пустой ячейки</ui-input>
            <ui-switch prop="isTransposed">Транспонированные данные</ui-switch>
            <template v-if="!props.isTransposed">
                <template v-if="metricDimensionNameOptions.length > 0">
                    <ui-draggable v-model="props.datasetMapped" @change="propChanged('datasetMapped')">
                        <div
                            class="row row-collapse mar-top-5"
                            v-for="{ label, value } of metricDimensionNameOptions"
                            :key="label">
                            <div class="col col-auto col-vbot pad-v-2">
                                <div class="icon cursor-pointer drag-handle">
                                    <i class="mdi mdi-drag mdi-18px"></i>
                                </div>
                            </div>
                            <div class="col col-vmid">
                                <ui-input v-model="props.datasetTitles[value]" @change="propChanged('datasetTitles')">
                                    {{ label }}
                                </ui-input>
                            </div>
                            <div class="col col-auto col-vbot pad-v-2">
                                <div
                                    v-if="isColExcluded(value)"
                                    class="icon cursor-pointer color-grey-dark"
                                    @click="onRestoreColIconClick(value)">
                                    <i class="mdi mdi-eye-off-outline mdi-18px"></i>
                                </div>
                                <div
                                    v-else
                                    class="icon cursor-pointer color-primary"
                                    @click="onExcludeColIconClick(value)">
                                    <i class="mdi mdi-eye-outline mdi-18px"></i>
                                </div>
                            </div>
                        </div>
                    </ui-draggable>
                </template>
                <template v-else>Нет данных из dremio</template>
            </template>
            <template v-else>
                <ui-select prop="transposedSettings.firstDimensionAlias" :options="dimensions">Измерение</ui-select>
                <ui-input prop="transposedSettings.firstDimensionTitle">Заголовок первого столбца</ui-input>
                <ui-select prop="transposedSettings.secondDimensionAlias" :options="dimensions">
                    Измерение для столбцов
                </ui-select>
                <ui-select v-model="metricAlias" :options="metrics" @change="changeMetricAlias">
                    Метрика для транспонирования
                </ui-select>
                <ui-select prop="transposedSettings.additionalMetricAliases" multiple :options="metrics">
                    Стандартные метрики
                </ui-select>

                <ui-has-panel>
                    Сортировка метрик
                    <template #panel>
                        <ui-panel :groups="[{ name: 'Сортировка метрик', slot: 'default' }]">
                            <ui-draggable v-model="props.datasetMapped" @change="propChanged('datasetMapped')">
                                <div
                                    class="row mar-left-none mar-top-5"
                                    :class="resolveDraggableMetricCLasses(value)"
                                    v-for="{ label, value } of metricDimensionNameOptions"
                                    :key="label">
                                    <div class="col pad-none w-1-12 col-vbot mar-bot-2">
                                        <div class="icon cursor-pointer drag-handle flex-h-start">
                                            <i class="mdi mdi-drag mdi-18px"></i>
                                        </div>
                                    </div>
                                    <ui-input
                                        class="w-11-12"
                                        v-model="props.datasetTitles[value]"
                                        @change="propChanged('datasetTitles')">
                                        {{ label }}
                                    </ui-input>
                                </div>
                            </ui-draggable>
                        </ui-panel>
                    </template>
                </ui-has-panel>
            </template>
        </ui-container>
    </ui-panel-container>
</template>
<script>
import { Panel } from '@goodt-wcore/panel';
import { usePanelDatasetMixin } from '@goodt-common/data';
import UiDraggable from 'vuedraggable';
import { PanelInstanceTypeDescriptor } from '../types';

export default {
    extends: Panel,
    meta: { name: 'Настройки колонок', icon: 'format-columns' },
    components: { UiDraggable },
    mixins: [usePanelDatasetMixin()],
    data() {
        return {
            metricAlias: '',
            ...PanelInstanceTypeDescriptor
        };
    },
    computed: {
        metricDimensionNameOptions() {
            const { metricDimensionNames } = this;
            return this.buildOptions(
                metricDimensionNames.sort((nameA, nameB) => {
                    const foundNameAIndex = this.props.datasetMapped.indexOf(nameA);
                    const foundNameBIndex = this.props.datasetMapped.indexOf(nameB);
                    return foundNameAIndex - foundNameBIndex;
                })
            );
        },
        metricDimensionNames() {
            return [...new Set([...this.metrics, ...this.dimensions])];
        }
    },
    watch: {
        metricDimensionNames: {
            handler(names) {
                if (names.length === 0) {
                    return;
                }

                if (this.isChangeDataset(Object.keys(this.props.datasetTitles), names)) {
                    this.props.datasetTitles = this.composeDatasetTitles(this.props.datasetTitles, names);
                    this.propChanged('datasetTitles');
                }

                if (this.isChangeDataset(this.props.datasetMapped, names)) {
                    this.props.datasetMapped = this.composeDatasetMapped(this.props.datasetMapped, names);
                    this.propChanged('datasetMapped');
                }
            },
            immediate: true
        }
    },
    created() {
        const { transposedSettings } = this.props;
        this.metricAlias = Array.isArray(transposedSettings.metricAlias)
            ? transposedSettings.metricAlias[0] ?? ''
            : transposedSettings.metricAlias;
    },
    methods: {
        resolveDraggableMetricCLasses(value) {
            return { hide: !this.props.transposedSettings.additionalMetricAliases.includes(value) };
        },
        isChangeDataset(dataset, names) {
            return names.some((name) => !dataset.includes(name));
        },
        composeDatasetTitles(datasetTitles, names) {
            const result = { ...datasetTitles };
            names.forEach((name) => {
                if (result[name] == null) {
                    result[name] = name;
                }
            });
            return result;
        },
        composeDatasetMapped(datasetMapped, names) {
            return [
                ...datasetMapped.filter((fieldName) => fieldName != null && names.includes(fieldName)),
                ...names.filter((name) => !datasetMapped.includes(name))
            ];
        },
        changeMetricAlias() {
            const { transposedSettings } = this.props;
            transposedSettings.metricAlias = this.metricAlias;
            this.propChanged('transposedSettings');
        },
        isColExcluded(colName) {
            return this.props.excludedDataFields.includes(colName);
        },
        onRestoreColIconClick(colName) {
            this.props.excludedDataFields = this.props.excludedDataFields.filter((fieldName) => fieldName !== colName);
            this.propChanged('excludedDataFields');
        },
        onExcludeColIconClick(colName) {
            this.props.excludedDataFields.push(colName);
            this.propChanged('excludedDataFields');
        }
    }
};
</script>
