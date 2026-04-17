<template>
    <ui-container>
        <ui-switch v-model="settings.isShown">Отображение</ui-switch>
        <ui-select :options="MetricTypeOptions" v-model="settings.metricType">Тип</ui-select>
        <ui-select
            v-if="settings.metricType === MetricType.CUSTOM"
            :options="fieldsOptions"
            v-model="settings.dataAlias">
            Поле
        </ui-select>
        <ui-select v-else :options="dataAliasOptions" v-model="settings.dataAlias">Метрика</ui-select>
        <ui-input v-model="settings.title">Заголовок</ui-input>
        <ui-select :options="aggrageteMethpdsOptions" v-model="settings.aggregate">Агрегация</ui-select>
        <ui-has-panel>
            <ui-checkbox v-model="settings.calculatedCell.isUsed">Объединение метрик</ui-checkbox>
            <template #panel>
                <ui-panel :groups="[{ name: 'Объединение метрик', slot: 'default' }]">
                    <ui-container>
                        <ui-select :options="dataAliasOptions" v-model="settings.calculatedCell.dataAlias">
                            Метрика
                        </ui-select>
                        <ui-select :options="AggregateMethodsOptions" v-model="settings.calculatedCell.aggregate">
                            Агрегация
                        </ui-select>
                        <ui-select
                            :options="CalculatedCellAggregateMethodsOptions"
                            v-model="settings.calculatedCell.method">
                            Метод объединения
                        </ui-select>
                    </ui-container>
                </ui-panel>
            </template>
        </ui-has-panel>
        <ui-has-panel>
            <div class="form-label text-truncate form-label-small">Настройки заголовка</div>
            <template #panel>
                <ui-panel :groups="[{ name: 'Настройки заголовка', slot: 'default' }]">
                    <ui-container>
                        <ui-input-cp v-model="settings.titleSettings.backgroundColor">Цвет фона</ui-input-cp>
                        <ui-complex-font v-model="titleFontStyles" v-bind="complexFontBinds" />
                        <div>
                            <ui-label label-size="small">Выравнивание</ui-label>
                            <ui-has-two-columns>
                                <template #left>
                                    <ui-label label-size="small">По горизонтали</ui-label>
                                    <ui-radio-buttons
                                        v-model="settings.titleSettings.verticalAlign"
                                        v-bind="verticalBinds" />
                                </template>
                                <template #right>
                                    <ui-label label-size="small">По вертикали</ui-label>
                                    <ui-radio-buttons
                                        v-model="settings.titleSettings.horizontalAlign"
                                        v-bind="horizontalBinds" />
                                </template>
                            </ui-has-two-columns>
                        </div>
                    </ui-container>
                </ui-panel>
            </template>
        </ui-has-panel>
        <ui-has-panel>
            <div class="form-label text-truncate form-label-small">Настройки шрифта</div>
            <template #panel>
                <ui-panel :groups="[{ name: 'Настройки шрифта', slot: 'default' }]">
                    <ui-container>
                        <ui-complex-font v-model="fontStyles" v-bind="complexFontBinds" />
                        <div>
                            <ui-label label-size="small">Выравнивание</ui-label>
                            <ui-has-two-columns>
                                <template #left>
                                    <ui-label label-size="small">По горизонтали</ui-label>
                                    <ui-radio-buttons v-model="settings.verticalAlign" v-bind="verticalBinds" />
                                </template>
                                <template #right>
                                    <ui-label label-size="small">По вертикали</ui-label>
                                    <ui-radio-buttons v-model="settings.horizontalAlign" v-bind="horizontalBinds" />
                                </template>
                            </ui-has-two-columns>
                        </div>
                    </ui-container>
                </ui-panel>
            </template>
        </ui-has-panel>
        <ui-input-cp v-model="settings.backgroundColor">Цвет фона</ui-input-cp>
        <ui-number-format v-model="settings.format">Формат</ui-number-format>
    </ui-container>
</template>

<script>
import { FontWeightOptions, SizeUnits } from '@goodt-wcore/panels';
import { PanelUi } from '@goodt-wcore/components';
import { AggregateMethodsOptions, AggregateFieldsMethodsOptions } from '../../utils/config';
import {
    CalculatedCellAggregateMethodsOptions,
    HorizontalAlignOptions,
    VerticalAlignOptions,
    MetricTypeOptions
} from '../config';
import { createCellSettings, createFont, MetricType } from '../../utils/constants';

export default {
    components: { ...PanelUi },
    static: {
        MetricType,
        MetricTypeOptions,
        AggregateMethodsOptions,
        CalculatedCellAggregateMethodsOptions,
        complexFontBinds: {
            units: SizeUnits,
            fontWeightOptions: FontWeightOptions
        },
        verticalBinds: {
            options: VerticalAlignOptions
        },
        horizontalBinds: {
            options: HorizontalAlignOptions
        }
    },
    model: {
        prop: 'cellSettings',
        event: 'change'
    },
    props: {
        fieldsOptions: {
            type: Array,
            default: () => []
        },
        dataAliasOptions: {
            type: Array,
            default: () => []
        },
        cellSettings: {
            type: Object,
            default: () => createCellSettings()
        }
    },
    data: (vm) => ({
        settings: createCellSettings(vm.cellSettings)
    }),
    computed: {
        aggrageteMethpdsOptions() {
            return this.settings.metricType === MetricType.CUSTOM
                ? AggregateFieldsMethodsOptions
                : AggregateMethodsOptions;
        },
        fontStyles: {
            get() {
                return createFont(this.settings);
            },
            set(val) {
                this.settings = {
                    ...this.settings,
                    ...createFont(val)
                };
            }
        },
        titleFontStyles: {
            get() {
                return createFont(this.settings.titleSettings);
            },
            set(val) {
                this.settings.titleSettings = {
                    ...this.settings.titleSettings,
                    ...createFont(val)
                };
            }
        }
    },
    watch: {
        'settings.dataAlias': {
            handler(dataAlias, oldDataAlias) {
                if (dataAlias === oldDataAlias) {
                    return;
                }
                this.settings = createCellSettings({
                    ...this.settings,
                    aggregate: AggregateMethodsOptions.SUM,
                    title: dataAlias
                });
            }
        },
        'settings.metricType': {
            handler(metricType) {
                if (metricType === MetricType.CUSTOM) {
                    const foundField = this.fieldsOptions.find(({ value }) => value !== null);
                    this.settings.dataAlias = foundField.value ?? null;
                }
            }
        },
        settings: {
            deep: true,
            handler(settings) {
                this.$emit('change', createCellSettings(settings));
            }
        }
    }
};
</script>
