<template>
    <w-panel>
        <ui-container>
            <div>
                <i class="mdi mdi-table-row opacity-30 mar-right-3"></i>
                <b>Строки</b>
            </div>
            <ui-input prop="rowsHeight" type="number">Высота строк</ui-input>
            <ui-input-cp prop="baseRowsSettings.backgroundColor">Цвет фона</ui-input-cp>
            <ui-input-cp prop="baseRowsSettings.spaceBackgroundColor">Цвет фона пустых ячеек</ui-input-cp>
            <ui-has-panel>
                <div class="form-label text-truncate form-label-small">Настройки шрифта</div>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Настройки шрифта', slot: 'default' }]">
                        <ui-complex-font v-model="baseRowsSettingsFont" v-bind="complexFontBinds" />
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-draggable v-model="props.rows" v-bind="DimensionsDraggableOptions" @change="propChanged('rows')">
                <ui-collapse v-for="({ title }, i) in props.rows" :key="i" class="mar-bot-3">
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
                                <div class="icon cursor-pointer" @click.stop.prevent="deleteRow(i)">
                                    <i class="mdi opacity-30 mdi-delete-outline"></i>
                                </div>
                            </div>
                        </div>
                    </template>
                    <ui-dimension-settings
                        v-model="props.rows[i]"
                        @change="propChanged('rows')"
                        v-bind="{
                            dataAliasOptions: dimensions
                        }">
                        <template #default="{ settings }">
                            <ui-switch v-model="settings.sortDesc">Обратная сортировка</ui-switch>
                            <ui-input-units v-model="settings.width" :units="SizeUnits">Ширина столбца</ui-input-units>
                        </template>
                    </ui-dimension-settings>
                </ui-collapse>
            </ui-draggable>
            <ui-button @click="addRow" v-show="canBeAddedNewField">Добавить</ui-button>
            <div>
                <i class="mdi mdi-table-column opacity-30 mar-right-3"></i>
                <b>Столбцы</b>
            </div>
            <ui-input-units prop="columnsWidth" :units="SizeUnits">Ширина столбцов</ui-input-units>
            <ui-input-cp prop="baseColumnsSettings.backgroundColor">Цвет фона</ui-input-cp>
            <ui-has-panel>
                <div class="form-label text-truncate form-label-small">Настройки шрифта</div>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Настройки шрифта', slot: 'default' }]">
                        <ui-complex-font v-model="baseColumnsSettingsFont" v-bind="complexFontBinds" />
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-draggable v-model="props.columns" v-bind="DimensionsDraggableOptions" @change="propChanged('columns')">
                <ui-collapse v-for="({ title }, i) in props.columns" :key="i" class="mar-bot-3">
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
                                <div class="icon cursor-pointer" @click.stop.prevent="deleteColumn(i)">
                                    <i class="mdi opacity-30 mdi-delete-outline"></i>
                                </div>
                            </div>
                        </div>
                    </template>
                    <ui-dimension-settings
                        v-model="props.columns[i]"
                        @change="propChanged('columns')"
                        v-bind="{
                            dataAliasOptions: dimensions
                        }">
                        <template #default="{ settings }">
                            <ui-input v-model.number="settings.height" type="number" min="0">Высота строки</ui-input>
                        </template>
                    </ui-dimension-settings>
                </ui-collapse>
            </ui-draggable>
            <ui-button @click="addColumn" v-show="canBeAddedNewField">Добавить</ui-button>
            <div>
                <i class="mdi mdi-filter opacity-30 mar-right-3"></i>
                <b>Фильтры</b>
            </div>
            <ui-draggable
                v-model="props.filtersData"
                v-bind="DimensionsDraggableOptions"
                @change="propChanged('filtersData')">
                <div v-for="({ title }, i) in props.filtersData" :key="i" class="mar-bot-4">
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
                            <div class="icon cursor-pointer" @click.stop.prevent="deleteFilter(i)">
                                <i class="mdi opacity-30 mdi-delete-outline"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </ui-draggable>
            <ui-button @click="addFilter" v-show="canBeAddedNewField">Добавить</ui-button>
        </ui-container>
    </w-panel>
</template>
<script>
import { Panel } from '@goodt-wcore/panel';
import { usePanelDatasetMixin } from '@goodt-common/data';
import { SizeUnits, FontWeightOptions } from '@goodt-wcore/panels';
import draggable from 'vuedraggable';
import { PanelInstanceTypeDescriptor } from '../types';
import { createCellSettings, createFont } from '../utils/constants';
import { DimensionsDraggableOptions } from '../utils/config';
import uiDimensionSettings from './components/DimensionSettings.vue';

export default {
    extends: Panel,
    components: {
        uiDraggable: draggable,
        uiDimensionSettings
    },
    mixins: [usePanelDatasetMixin()],
    meta: { name: 'Измерения', icon: 'altimeter' },
    data: () => ({
        ...PanelInstanceTypeDescriptor
    }),
    static: {
        DimensionsDraggableOptions,
        SizeUnits,
        FontWeightOptions,
        complexFontBinds: {
            units: SizeUnits,
            fontWeightOptions: FontWeightOptions
        }
    },
    computed: {
        baseRowsSettingsFont: {
            get() {
                return createFont({ ...this.props.baseRowsSettings });
            },
            set(val) {
                this.props.baseRowsSettings = {
                    ...this.props.baseRowsSettings,
                    ...val
                };
                this.propChanged('baseRowsSettings');
            }
        },
        baseColumnsSettingsFont: {
            get() {
                return createFont({ ...this.props.baseColumnsSettings });
            },
            set(val) {
                this.props.baseColumnsSettings = {
                    ...this.props.baseColumnsSettings,
                    ...val
                };
                this.propChanged('baseColumnsSettings');
            }
        },
        freeDimensionKeyIndex() {
            const {
                props: { rows, columns, filtersData },
                dimensions
            } = this;
            const fields = [...rows, ...columns, ...filtersData];
            return dimensions.findIndex((key) => fields.every(({ dataAlias }) => dataAlias !== key));
        },

        canBeAddedNewField() {
            return this.freeDimensionKeyIndex !== -1;
        }
    },
    methods: {
        addRow() {
            const {
                props: { rows },
                propChanged,
                canBeAddedNewField,
                freeDimensionKeyIndex,
                dimensions
            } = this;
            if (!canBeAddedNewField) {
                return;
            }
            rows.push(
                createCellSettings({
                    dataAlias: dimensions[freeDimensionKeyIndex] ?? '',
                    title: dimensions[freeDimensionKeyIndex] ?? ''
                })
            );
            propChanged('rows');
        },
        deleteRow(index) {
            const {
                props: { rows },
                propChanged
            } = this;
            rows.splice(index, 1);
            propChanged('rows');
        },
        addColumn() {
            const {
                props: { columns },
                propChanged,
                canBeAddedNewField,
                freeDimensionKeyIndex,
                dimensions
            } = this;
            if (!canBeAddedNewField) {
                return;
            }
            columns.push(
                createCellSettings({
                    dataAlias: dimensions[freeDimensionKeyIndex] ?? '',
                    title: dimensions[freeDimensionKeyIndex] ?? ''
                })
            );
            propChanged('columns');
        },
        deleteColumn(index) {
            const {
                props: { columns },
                propChanged
            } = this;
            columns.splice(index, 1);
            propChanged('columns');
        },

        addFilter() {
            const {
                props: { filtersData },
                propChanged,
                canBeAddedNewField,
                freeDimensionKeyIndex,
                dimensions
            } = this;
            if (!canBeAddedNewField) {
                return;
            }
            filtersData.push(
                createCellSettings({
                    dataAlias: dimensions[freeDimensionKeyIndex] ?? '',
                    title: dimensions[freeDimensionKeyIndex] ?? ''
                })
            );
            propChanged('filtersData');
        },
        deleteFilter(index) {
            const {
                props: { filtersData },
                propChanged
            } = this;
            filtersData.splice(index, 1);
            propChanged('filtersData');
        }
    }
};
</script>
