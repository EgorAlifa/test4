<template>
    <ui-container>
        <ui-switch v-model="settings.isShown">Отображение</ui-switch>
        <ui-select :options="dataAliasOptions" v-model="settings.dataAlias">Измерение</ui-select>
        <ui-select :options="sortDataAliasOptions" v-model="settings.sortAlias">Поле сортировки</ui-select>
        <ui-input v-model="settings.title">Заголовок</ui-input>
        <ui-select v-model="settings.valueType" :options="ValueTypeOptions">Тип измерения</ui-select>
        <ui-select :options="CellSortTypeOptions" v-model="settings.sortDataType">Тип поля сортировки</ui-select>
        <slot :settings="settings" name="afterHeader"></slot>
        <ui-has-panel>
            <ui-label label-size="small">Настройки заголовка</ui-label>
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
            <ui-label label-size="small">Настройки шрифта</ui-label>
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
        <slot :settings="settings"></slot>
    </ui-container>
</template>

<script>
import { FontWeightOptions, SizeUnits } from '@goodt-wcore/panels';
import { PanelUi } from '@goodt-wcore/components';
import { createCellSettings, createFont } from '../../utils/constants';
import { ValueTypeOptions, CellSortTypeOptions, HorizontalAlignOptions, VerticalAlignOptions } from '../config';

export default {
    components: { ...PanelUi },
    static: {
        CellSortTypeOptions,
        complexFontBinds: {
            units: SizeUnits,
            fontWeightOptions: FontWeightOptions
        },
        verticalBinds: {
            options: VerticalAlignOptions
        },
        horizontalBinds: {
            options: HorizontalAlignOptions
        },
        ValueTypeOptions
    },
    model: {
        prop: 'cellSettings',
        event: 'change'
    },
    props: {
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
        sortDataAliasOptions() {
            return [{ label: '-', value: '' }, ...this.dataAliasOptions];
        },
        fontStyles: {
            get() {
                return createFont({ ...this.settings });
            },
            set(val) {
                this.settings = {
                    ...this.settings,
                    ...val
                };
            }
        },
        titleFontStyles: {
            get() {
                return createFont({ ...this.settings.titleSettings });
            },
            set(val) {
                this.settings.titleSettings = {
                    ...this.settings.titleSettings,
                    ...val
                };
            }
        }
    },
    watch: {
        'settings.dataAlias': {
            handler(dataAlias, oldDataAlias) {
                this.settings.title = dataAlias === oldDataAlias ? this.settings.title : dataAlias;
            }
        },
        settings: {
            deep: true,
            handler(settings, oldSettings) {
                const { title, dataAlias } = settings;
                const { dataAlias: oldDataAlias } = oldSettings;
                this.$emit(
                    'change',
                    createCellSettings({
                        ...settings,
                        title: dataAlias === oldDataAlias ? title : dataAlias
                    })
                );
            }
        }
    }
};
</script>
