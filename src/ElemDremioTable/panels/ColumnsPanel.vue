<template>
    <div>
        <ui-button class="p" @click="addColumn">Добавить колонку</ui-button>
        <ui-draggable v-model="columns" v-bind="dragOptions">
            <div v-for="(col, i) in columns" :key="i">
                <div class="row row-collapse">
                    <div class="col col-auto col-vmid">
                        <div class="icon cursor-move drag-handle">
                            <i class="mdi mdi-drag mdi-18px"></i>
                        </div>
                    </div>
                    <div class="col">
                        <ui-input class="p" v-model="col.title" @change="propChanged('columns')">заголовок</ui-input>
                        <ui-select v-model="col.render" :options="rendersOptions" @change="onColumnRenderChanged(col)">
                            шаблон
                        </ui-select>
                    </div>
                    <div class="col col-auto">
                        <div class="d-flex flex-col flex-h-space-between h-100">
                            <div class="btn btn-icon btn-small">
                                <div class="icon cursor-pointer" @click="duplicateColumn(i)">
                                    <i class="mdi mdi-content-copy mdi-18px"></i>
                                </div>
                            </div>
                            <div class="btn btn-icon btn-small">
                                <div class="icon cursor-pointer" @click="showSettings(i)">
                                    <i class="mdi mdi-cog mdi-18px"></i>
                                </div>
                            </div>
                            <div class="btn btn-icon btn-small">
                                <div class="icon cursor-pointer" @click="deleteColumn(i)">
                                    <i class="mdi mdi-close mdi-18px"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <hr v-if="i < columns.length - 1" class="mar-v-l1" />
            </div>
        </ui-draggable>

        <ui-popup :visible="columnEdit != null" :dialog="{ class: 'w-f5' }" @close="onClose">
            <template v-if="columnEdit" #body>
                <h3>Настройка столбца</h3>
                <ui-select
                    class="p"
                    v-model="columnEdit.sort"
                    :options="dimensionMetricNames"
                    @change="propChanged('columns')">
                    метрика/измерение сортировки
                </ui-select>
                <ui-input class="p" v-model="columnEdit.style" @change="propChanged('columns')">
                    стиль заголовка
                </ui-input>
                <ui-input class="p" v-model="columnEdit.styleCell" @change="propChanged('columns')">
                    стиль ячеек
                </ui-input>
                <div class="tile pad-3 p">
                    <ui-button type="ghost" inline @click="isIconTitleCollapsed = !isIconTitleCollapsed">
                        <span>Иконка заголовка</span>
                        <i
                            class="mdi color-primary mar-left-3"
                            :class="[isIconTitleCollapsed ? 'mdi-chevron-down' : 'mdi-chevron-up']"></i>
                    </ui-button>
                    <div v-if="!isIconTitleCollapsed" class="mar-top-l1">
                        <ui-switch v-model="columnEdit.icon.enable" class="p" @change="propChanged('columns')">
                            Показать иконку
                        </ui-switch>

                        <ui-input class="p" v-model="columnEdit.icon.name" @change="propChanged('columns')">
                            Название
                        </ui-input>

                        <ui-has-two-columns class="p">
                            <template #left>
                                <ui-select
                                    v-model="columnEdit.icon.position"
                                    :options="[
                                        { label: 'left', value: '-1' },
                                        { label: 'right', value: '1' }
                                    ]"
                                    @change="propChanged('columns')">
                                    Позиция
                                </ui-select>
                            </template>
                            <template #right>
                                <ui-input-units
                                    v-model="columnEdit.icon.size"
                                    :units="SizeUnits"
                                    @change="propChanged('columns')">
                                    Размер
                                </ui-input-units>
                            </template>
                        </ui-has-two-columns>

                        <ui-has-two-columns>
                            <template #left>
                                <ui-input-cp v-model="columnEdit.icon.color" @change="propChanged('columns')">
                                    Цвет
                                </ui-input-cp>
                            </template>
                            <template #right>
                                <ui-input-cp v-model="columnEdit.icon.colorHover" @change="propChanged('columns')">
                                    Цвет при наведении
                                </ui-input-cp>
                            </template>
                        </ui-has-two-columns>

                        <hr class="mar-v-l1" />

                        <ui-tooltip-settings
                            :tooltip-options="columnEdit.icon.tooltip"
                            :dimension-metric-names="dimensionMetricNames"
                            @tooltip-changed="(params) => onTooltipChange(columnEdit.icon, params)" />
                    </div>
                </div>

                <div class="tile pad-3 p">
                    <ui-button type="ghost" inline @click="isTooltipCollapsed = !isTooltipCollapsed">
                        <span>Подсказка</span>
                        <i
                            class="mdi color-primary mar-left-3"
                            :class="[isTooltipCollapsed ? 'mdi-chevron-down' : 'mdi-chevron-up']"></i>
                    </ui-button>
                    <div v-if="!isTooltipCollapsed" class="mar-top-l1">
                        <ui-tooltip-settings
                            :tooltip-options="columnEdit.tooltip"
                            :dimension-metric-names="dimensionMetricNames"
                            @tooltip-changed="(params) => onTooltipChange(columnEdit, params)" />
                    </div>
                </div>

                <template v-if="columnEdit.render">
                    <div class="text-lead mar-v-l1">Параметры шаблона</div>
                    <div v-for="(param, paramName) in columnEdit.params" :key="paramName" class="tile pad-3 p">
                        <template v-if="Array.isArray(param)">
                            <div class="p">
                                <div class="row row-collapse">
                                    <div class="col">
                                        <code>{{ paramName }}</code>
                                    </div>
                                    <div class="col col-auto col-vmid">
                                        <div
                                            class="btn btn-icon btn-ghost btn-small"
                                            @click="onAddColumnRenderParam(columnEdit, paramName)">
                                            <div class="icon">
                                                <i class="mdi mdi-plus"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <ui-draggable-list
                                :value="param"
                                @input="(val) => onColumnRenderParamChanged(columnEdit, paramName, val)">
                                <div v-for="(paramItem, i) in param" :key="i">
                                    <div class="row row-collapse">
                                        <div class="col col-auto">
                                            <div class="btn btn-icon btn-small">
                                                <i class="mdi mdi-drag mdi-18px cursor-move drag-handle"></i>
                                            </div>
                                        </div>
                                        <div class="col">
                                            <ui-render-param-editor
                                                class="w-100"
                                                v-bind="{
                                                    param: paramItem,
                                                    paramTypes: columnParamTypes,
                                                    paramFormats: columnParamFormats,
                                                    paramStyleTypes: columnParamStyleTypes,
                                                    paramStyleValueTypes: columnParamStyleValueTypes,
                                                    paramStyleFactory: columnParamStyleFactory,
                                                    dimensionMetricNames
                                                }"
                                                @change="
                                                    (param) =>
                                                        onColumnRenderParamChanged(columnEdit, paramName, param, i)
                                                "></ui-render-param-editor>
                                        </div>
                                        <div class="col col-auto">
                                            <div
                                                class="btn btn-icon btn-small"
                                                @click="onRemoveColumnRenderParam(columnEdit, paramName, i)">
                                                <i class="mdi mdi-close"></i>
                                            </div>
                                        </div>
                                    </div>
                                    <hr v-if="i < param.length - 1" class="mar-v-l1" />
                                </div>
                            </ui-draggable-list>
                        </template>
                        <template v-else>
                            <div class="p">
                                <code>{{ paramName }}</code>
                            </div>
                            <ui-render-param-editor
                                v-bind="{
                                    param,
                                    paramTypes: columnParamTypes,
                                    paramFormats: columnParamFormats,
                                    paramStyleTypes: columnParamStyleTypes,
                                    paramStyleValueTypes: columnParamStyleValueTypes,
                                    paramStyleFactory: columnParamStyleFactory,
                                    dimensionMetricNames
                                }"
                                @change="
                                    (param) => onColumnRenderParamChanged(columnEdit, paramName, param)
                                "></ui-render-param-editor>
                        </template>
                    </div>
                </template>
            </template>
            <template #footer="{ close }">
                <div class="text-right">
                    <ui-button type="ghost" inline @click="close">Закрыть</ui-button>
                </div>
            </template>
        </ui-popup>
    </div>
</template>
<style lang="pcss" module>
.cursor-move {
    cursor: move;
}
</style>
<script>
import Vue from 'vue';
import { Panel } from '@goodt-wcore/panel';
import { Popup as UiPopup } from '@goodt-wcore/components';
import { Query } from '@goodt-common/dremio';
import { SizeUnits } from '@goodt-wcore/panels';
import UiDraggable from 'vuedraggable';
import { cloneDeep } from 'lodash';
import {
    RenderParamEditor as UiRenderParamEditor,
    DraggableList as UiDraggableList,
    TooltipSettings as UiTooltipSettings
} from './components';
import { RenderTypes, ColumnFactory, ColumnParamFactory, ColumnParamStyleFactory } from '../utils';
import { PanelInstanceTypeDescriptor } from '../types';

const {
    VALUE,
    LIST,
    VALUE_IMG,
    BENCHMARK,
    LINK,
    EMPLOYEE,
    DRILLDOWN_LINK,
    EVENT_BUS_LIST,
    DATE_RANGE,
    PROGRESS,
    STATUS
} = RenderTypes;

const RenderParamObservers = {
    // eslint-disable-next-line no-restricted-syntax
    value: [VALUE, LIST, BENCHMARK, DRILLDOWN_LINK, EVENT_BUS_LIST],
    'imageLeft,imageRight': [VALUE_IMG, STATUS],
    // eslint-disable-next-line no-restricted-syntax
    urlParamValue: [LINK],
    // eslint-disable-next-line no-restricted-syntax
    surname: [EMPLOYEE],
    // eslint-disable-next-line no-restricted-syntax
    valueFrom: [DATE_RANGE],
    'valueLeft,valueRight': [PROGRESS]
};

export default {
    extends: Panel,
    components: {
        UiRenderParamEditor,
        UiDraggableList,
        UiPopup,
        UiDraggable,
        UiTooltipSettings
    },
    data() {
        return {
            /** @public */
            $meta: { name: 'Колонки', icon: 'table-column' },
            dragOptions: {
                // eslint-disable-next-line no-magic-numbers
                animation: 200,
                handle: '.drag-handle'
            },
            columnEditIndex: -1,
            columnParamStyleFactory: ColumnParamStyleFactory,
            isTooltipCollapsed: true,
            isIconTitleCollapsed: true,
            ...PanelInstanceTypeDescriptor
        };
    },
    computed: {
        /**
         * @return DColumn|null
         */
        columnEdit() {
            return this.columns[this.columnEditIndex] || null;
        },
        columns: {
            /**
             * @return DColumn[]
             */
            get() {
                return this.props.columns;
            },
            /**
             * @param {DColumn[]} columns
             */
            set(columns) {
                this.props.columns = columns;
                this.propChanged('columns');
            }
        },
        /**
         * @return Record<string, any>
         */
        renders() {
            return this.elementInstance?.columnRenders ?? {};
        },
        /**
         * @return {{label: string, value: any}[]}
         */
        rendersOptions() {
            return this.buildOptions(this.renders);
        },
        /**
         * @return {{label: string, value: any}[]}
         */
        columnParamStyleTypes() {
            const styleTypes = this.elementInstance?.columnParamStyleTypes ?? {};
            return this.buildOptions(styleTypes);
        },
        /**
         * @return {{label: string, value: any}[]}
         */
        columnParamStyleValueTypes() {
            const styleValueTypes = this.elementInstance?.columnParamStyleValueTypes ?? {};
            return this.buildOptions(styleValueTypes);
        },
        /**
         * @return {{label: string, value: any}[]}
         */
        columnParamFormats() {
            const paramFormats = this.elementInstance?.columnParamFormats ?? {};
            return [{ label: '-', value: null }, ...this.buildOptions(paramFormats)];
        },
        /**
         * @return {{label: string, value: any}[]}
         */
        columnParamTypes() {
            const paramTypes = this.elementInstance?.columnParamTypes ?? {};
            return this.buildOptions(paramTypes);
        },
        /**
         * @return {{label: string, value: any}[]}
         */
        dimensionMetricNames() {
            const { dremio, additionalDremio, deviationMeta } = this.props;
            let names = [];

            if (dremio == null) {
                return names;
            }

            const buildMetricDimensionNames = ({ query, dimensionList }) => [
                ...Query.queryMetricNames(query),
                ...Object.keys(dimensionList)
            ];
            names = buildMetricDimensionNames(dremio);

            if (additionalDremio != null) {
                names = names.concat(buildMetricDimensionNames(additionalDremio));
            }

            if (deviationMeta.deviations.length > 0) {
                names = names.concat(deviationMeta.deviations.map(({ name }) => name));
            }

            names = names.sort((prev, next) => prev.localeCompare(next)).map((value) => ({ label: value, value }));
            return [{ label: '-', value: null }].concat(names);
        }
    },
    static: {
        SizeUnits
    },
    created() {
        this.props.columns = this.props.columns.map((col) => ({
            ...col,
            params: {
                ...this.getRenderDefaultParams(col.render),
                ...col.params
            }
        }));
        this.propChanged('columns');
    },
    methods: {
        /**
         * @param {Record<string, any>} obj
         * @return {{label: string, value: any}[]}
         */
        buildOptions(obj) {
            return Object.entries(obj).map(([value, { name, options = [] }]) => ({ label: name, value, options }));
        },
        /**
         * @param {string} renderKey
         * @return Record<string, any>
         */
        getRenderDefaultParams(renderKey) {
            const renderInfo = this.renders[renderKey];
            if (renderInfo == null) {
                return {};
            }
            const { props } = Vue.extend(renderInfo.component).options;
            return Object.entries(props).reduce((acc, [name, paramInfo]) => {
                if (paramInfo.private !== true) {
                    const paramDefault = typeof paramInfo.default === 'function' ? paramInfo.default() : {};
                    acc[name] = [paramInfo.type].flat().includes(Array)
                        ? []
                        : { ...ColumnParamFactory(), ...paramDefault };
                }
                return acc;
            }, {});
        },
        addColumn() {
            this.columns.unshift(ColumnFactory());
            this.propChanged('columns');
        },
        /**
         * @param {number} i
         * @effect columns
         */
        deleteColumn(i) {
            this.columns.splice(i, 1);
            this.propChanged('columns');
        },
        /**
         * @param {number} i
         * @effect columns
         */
        duplicateColumn(i) {
            const { columns } = this;
            this.columns = [...columns, cloneDeep(columns[i])];
        },
        /**
         * @param {number} i
         * @effect columnEditIndex
         */
        showSettings(i) {
            this.columnEditIndex = i;
        },
        /**
         * @param {DColumn} col
         */
        onColumnRenderChanged(col) {
            col.params = this.getRenderDefaultParams(col.render);
            this.propChanged('columns');
        },
        /**
         * @param {DColumn} col
         * @param {string} name
         * @param {number} i
         */
        onRemoveColumnRenderParam(col, name, i) {
            col.params[name].splice(i, 1);
            this.propChanged('columns');
        },
        /**
         * @param {DColumn} col
         * @param {string} name
         */
        onAddColumnRenderParam(col, name) {
            col.params[name].push(ColumnParamFactory());
            this.propChanged('columns');
        },
        /**
         * @param {DColumn} col
         * @param {string} name
         * @param {DColumnParam} param
         * @param {number} [i]
         * @effect columnEdit
         */
        onColumnRenderParamChanged(col, name, param, i) {
            let [paramNames] =
                Object.entries(RenderParamObservers).find(([__, renders]) =>
                    renders.includes(this.columnEdit.render)
                ) ?? [];
            if (paramNames != null) {
                paramNames = paramNames.split(',');
                if (paramNames.includes(name)) {
                    this.columnEdit.sort = param.value;
                }
            }

            if (Array.isArray(col.params[name]) && i != null) {
                this.$set(col.params[name], i, param);
            } else {
                this.$set(col.params, name, param);
            }
            this.propChanged('columns');
        },
        /**
         * @effect columnEditIndex, isTooltipCollapsed, isIconTitleCollapsed
         */
        onClose() {
            this.columnEditIndex = -1;
            this.isTooltipCollapsed = true;
            this.isIconTitleCollapsed = true;
        },
        /**
         * @param {DColumn} col
         * @param {DColumnTooltip} params
         */
        onTooltipChange(col, params) {
            this.$set(col, 'tooltip', params);
            this.propChanged('columns');
        }
    }
};
</script>
