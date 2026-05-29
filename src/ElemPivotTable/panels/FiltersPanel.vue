<template>
    <ui-panel-container>
        <ui-container>
            <ui-switch
                @change="onFilterChange(key, $event)"
                :value="filters[key]"
                v-for="(_, key) in filters"
                :key="key">
                {{ key }}
            </ui-switch>
        </ui-container>
    </ui-panel-container>
</template>
<script>
import { Panel } from '@goodt-wcore/panel';
import { usePanelDatasetMixin } from '@goodt-common/data';
import { PanelInstanceTypeDescriptor } from '../types';

export default {
    extends: Panel,
    mixins: [usePanelDatasetMixin()],
    meta: { name: 'Настройки отображения', icon: 'eye' },
    data: () => ({
        ...PanelInstanceTypeDescriptor
    }),
    computed: {
        filters() {
            const {
                dimensions,
                props: { filters }
            } = this;
            return dimensions.reduce(
                (acc, dimension) => ({
                    ...acc,
                    [dimension]: filters?.[dimension] ?? true
                }),
                {}
            );
        }
    },
    methods: {
        onFilterChange(key, val) {
            this.props.filters[key] = val;
            this.propChanged('filters');
        }
    }
};
</script>
