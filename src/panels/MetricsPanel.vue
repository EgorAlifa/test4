<template>
    <w-panel>
        <ui-container>
            <div class="form-label form-label-small">Анализ (метрика)</div>
            <ui-hint>
                <template #label>Метрика для анализа</template>
                Одна метрика, которая отображается в узлах дерева.
            </ui-hint>
            <ui-select
                v-model="props.metricName"
                :options="metricOptions"
                @change="propChanged('metricName')"
            >
                Метрика
            </ui-select>

            <!-- Блок плана для композиций скрыт по требованию -->
        </ui-container>
    </w-panel>
</template>
<script>
import { Panel } from '@goodt-wcore/panel';
import { usePanelDatasetMixin, PanelDatasetMixinTypes } from '@goodt-common/data';

export default {
    extends: Panel,
    mixins: [usePanelDatasetMixin()],

    meta: { name: 'Метрики', icon: 'gauge' },

    data() {
        return {
            ...PanelDatasetMixinTypes
        };
    },

    computed: {
        metricOptions() {
            return this.buildOptions(this.metrics || [], { empty: true });
        },
        allFieldsOptions() {
            const all = [...(this.dimensions || []), ...(this.metrics || [])];
            return this.buildOptions(all, { empty: true });
        }
    }
};
</script>

