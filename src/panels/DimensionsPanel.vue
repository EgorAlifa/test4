<template>
    <w-panel>
        <ui-container>
            <div class="form-label form-label-small">Объяснить по</div>
            <ui-hint>
                <template #label>Измерения для детализации</template>
                Выберите измерения, по которым можно раскрывать дерево. Порядок определяет список при нажатии «+».
            </ui-hint>
            <ui-select
                v-model="props.explainByDimensionNames"
                :options="dimensionsOptions"
                multiple
                @change="propChanged('explainByDimensionNames')"
            >
                Измерения
            </ui-select>
        </ui-container>
    </w-panel>
</template>
<script>
import { Panel } from '@goodt-wcore/panel';
import { usePanelDatasetMixin, PanelDatasetMixinTypes } from '@goodt-common/data';

export default {
    extends: Panel,
    mixins: [usePanelDatasetMixin()],

    meta: { name: 'Измерения', icon: 'altimeter' },

    data() {
        return {
            ...PanelDatasetMixinTypes
        };
    },

    computed: {
        dimensionsOptions() {
            return this.buildOptions(this.dimensions || [], { empty: false });
        }
    }
};
</script>

