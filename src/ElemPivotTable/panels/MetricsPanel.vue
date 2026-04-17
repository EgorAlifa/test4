<template>
    <ui-panel-container>
        <ui-container>
            <ui-input prop="titleHeight" type="number">Высота заголовков</ui-input>
            <ui-input-cp prop="baseValuesSettings.backgroundColor">Цвет фона</ui-input-cp>
            <ui-has-panel>
                <div class="form-label text-truncate form-label-small">Настройки шрифта</div>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Настройки шрифта', slot: 'default' }]">
                        <ui-complex-font v-model="baseValuesSettingsFont" v-bind="complexFontBinds" />
                    </ui-panel>
                </template>
            </ui-has-panel>
            <ui-draggable v-model="props.values" v-bind="DraggableOptions" @change="propChanged('values')">
                <ui-collapse v-for="({ title }, i) in props.values" :key="i" class="mar-bot-3">
                    <template #header>
                        <div class="row row-collapse flex-center">
                            <div class="col col-auto col-vmid pad-right-2">
                                <div class="icon cursor-move drag-handle">
                                    <i class="mdi mdi-drag mdi-18px"></i>
                                </div>
                            </div>
                            <div class="col">
                                {{ title }}
                            </div>
                            <div class="col col-auto col-vmid">
                                <div class="icon cursor-pointer" @click.stop.prevent="deleteValue(i)">
                                    <i class="mdi opacity-30 mdi-delete-outline"></i>
                                </div>
                            </div>
                        </div>
                    </template>
                    <ui-metric-settings
                        v-model="props.values[i]"
                        @change="propChanged('values')"
                        v-bind="{
                            fieldsOptions,
                            dataAliasOptions: metrics
                        }"></ui-metric-settings>
                </ui-collapse>
            </ui-draggable>
            <ui-button @click="addValue" v-show="canBeAddedNewField">Добавить</ui-button>
        </ui-container>
    </ui-panel-container>
</template>
<script>
import { usePanelDatasetMixin, PanelDatasetMixinTypes } from '@goodt-common/data';
import { Panel } from '@goodt-wcore/panel';
import { FontWeightOptions, SizeUnits } from '@goodt-wcore/panels';
import draggable from 'vuedraggable';
import { PanelInstanceTypeDescriptor } from '../types';
import { VerticalAligns, createFont, createCellSettings, MetricType } from '../utils/constants';
import { DraggableOptions } from '../utils/config';
import uiMetricSettings from './components/MetricSettings.vue';

export default {
    extends: Panel,
    components: {
        uiDraggable: draggable,
        uiMetricSettings
    },
    mixins: [usePanelDatasetMixin()],
    meta: { name: 'Метрики', icon: 'gauge' },
    static: {
        DraggableOptions,
        complexFontBinds: {
            units: SizeUnits,
            fontWeightOptions: FontWeightOptions
        }
    },
    computed: {
        freeMetricsKeyIndex() {
            const {
                props: { values },
                metrics
            } = this;
            return metrics.findIndex((key) => values.every(({ dataAlias }) => dataAlias !== key));
        },
        canBeAddedNewField() {
            return this.freeMetricsKeyIndex !== -1;
        },
        baseValuesSettingsFont: {
            get() {
                return createFont({ ...this.props.baseValuesSettings });
            },
            set(val) {
                this.props.baseValuesSettings = {
                    ...this.props.baseValuesSettings,
                    ...val
                };
                this.propChanged('baseValuesSettings');
            }
        },
        fieldsOptions() {
            return this.buildOptions(this.fields, { empty: true });
        }
    },
    methods: {
        ...PanelInstanceTypeDescriptor,
        ...PanelDatasetMixinTypes,
        addValue() {
            const {
                props: { values },
                propChanged,
                canBeAddedNewField,
                freeMetricsKeyIndex,
                metrics
            } = this;
            if (!canBeAddedNewField) {
                return;
            }

            values.push(
                createCellSettings({
                    metricType: MetricType.METRIC,
                    dataAlias: metrics[freeMetricsKeyIndex] ?? '',
                    title: metrics[freeMetricsKeyIndex] ?? '',
                    verticalAlign: VerticalAligns.RIGHT
                })
            );
            propChanged('values');
        },
        deleteValue(index) {
            const {
                props: { values },
                propChanged
            } = this;
            values.splice(index, 1);
            propChanged('values');
        }
    }
};
</script>
