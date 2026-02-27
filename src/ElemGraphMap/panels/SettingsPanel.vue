<template>
    <w-panel>
        <ui-container>
            <div class="form-label form-label-small">Источник данных</div>
            <ui-dataset />

            <div class="form-label form-label-small mt-3">Поля датасета (рёбра графа)</div>
            <ui-select
                prop="sourceIdField"
                :options="fieldsOptions"
                label="Поле ID источника (узла)"
            />
            <ui-select
                prop="targetIdField"
                :options="fieldsOptions"
                label="Поле ID цели (узла)"
            />
            <ui-select
                prop="weightField"
                :options="fieldsOptions"
                label="Поле веса связи (толщина линии)"
            >
                <template #help>
                    Опционально. Если задано, толщина линии будет зависеть от значения.
                </template>
            </ui-select>
            <ui-select
                prop="sourceLabelField"
                :options="fieldsOptions"
                label="Поле подписи источника"
            />
            <ui-select
                prop="targetLabelField"
                :options="fieldsOptions"
                label="Поле подписи цели"
            />
            <ui-select
                prop="sourceTypeField"
                :options="fieldsOptions"
                label="Поле типа источника (factor / operation / critical)"
            />
            <ui-select
                prop="targetTypeField"
                :options="fieldsOptions"
                label="Поле типа цели"
            />

            <div class="form-label form-label-small mt-3">Внешний вид узлов</div>
            <ui-input-cp prop="nodeColorFactor" label="Цвет узлов «Фактор»" />
            <ui-input-cp prop="nodeColorOperation" label="Цвет узлов «Прерывание операции»" />
            <ui-input-cp prop="nodeColorCritical" label="Цвет узлов «Критический»" />
            <ui-input
                prop="nodeSizeFactor"
                type="number"
                min="8"
                max="80"
                label="Размер узла «Фактор»"
            />
            <ui-input
                prop="nodeSizeOperation"
                type="number"
                min="8"
                max="80"
                label="Размер узла «Прерывание операции»"
            />
            <ui-input
                prop="nodeSizeCritical"
                type="number"
                min="8"
                max="80"
                label="Размер узла «Критический»"
            />

            <div class="form-label form-label-small mt-3">Рёбра</div>
            <ui-input-cp prop="edgeColor" label="Цвет рёбер" />
            <ui-input
                prop="edgeOpacity"
                type="number"
                min="0"
                max="1"
                step="0.1"
                label="Прозрачность рёбер"
            />
            <ui-input
                prop="edgeWidthMin"
                type="number"
                min="0.5"
                max="10"
                step="0.5"
                label="Минимальная толщина ребра"
            />
            <ui-input
                prop="edgeWidthMax"
                type="number"
                min="0.5"
                max="10"
                step="0.5"
                label="Максимальная толщина ребра"
            />
            <ui-checkbox prop="useWeightForWidth" label="Использовать вес связи для толщины линии" />

            <div class="form-label form-label-small mt-3">Дополнительно</div>
            <ui-checkbox prop="showLoading" label="Показывать загрузку" />
        </ui-container>
    </w-panel>
</template>

<script>
import { Panel } from '@goodt-wcore/panel';
import { usePanelDatasetMixin, PanelDatasetMixinTypes } from '@goodt-common/data';
import { PanelInstanceTypeDescriptor } from '../types';

export default {
    extends: Panel,
    mixins: [usePanelDatasetMixin()],

    meta: { name: 'Настройки виджета', icon: 'widgets' },

    data() {
        return {
            ...PanelInstanceTypeDescriptor
        };
    },

    computed: {
        ...PanelDatasetMixinTypes,

        fieldsOptions() {
            const allFields = [...(this.dimensions || []), ...(this.metrics || [])];
            return this.buildOptions(allFields, { empty: true });
        }
    },

    methods: {
        ...PanelInstanceTypeDescriptor,
        ...PanelDatasetMixinTypes
    }
};
</script>
