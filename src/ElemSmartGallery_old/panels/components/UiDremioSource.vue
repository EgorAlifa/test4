<template>
    <div class="ui-dremio-source">
        <div class="text-truncate text-small" @click="toggleQueryEditor">
            <i class="mdi mdi-database pad-right-3"></i>
            <span class="link" click="toggleQueryEditor" :title="datasetFullname">{{ datasetName }}</span>
        </div>

        <div class="d-flex">
            <ui-button type="ghost" icon title="Клонировать" @click="emitClone">
                <i class="mdi mdi-content-copy color-body"></i>
            </ui-button>
            <ui-button type="ghost" icon title="Удалить" @click="emitDelete">
                <i class="mdi mdi-delete"></i>
            </ui-button>
        </div>

        <ui-portal>
            <ui-query-editor
                v-if="isQueryEditorShown"
                v-bind="{ initQuery: query, initDimensionList: dimensionList, initLimit: limit }"
                @close="onQueryEditorClose"
                @save="onQueryEditorSave" />
        </ui-portal>
    </div>
</template>
<script>
import { Portal as UiPortal } from '@goodt-wcore/components';
import { PanelUi } from '@goodt-wcore/panel-ui';
import { Query } from '@goodt-common/dremio';
import { QueryEditor as UiQueryEditor } from '@goodt-common/dremio-panels';

export default {
    components: { ...PanelUi, UiPortal, UiQueryEditor },
    props: {
        query: {
            type: Object,
            default: null
        },
        dimensionList: {
            type: Object,
            default: () => ({})
        },
        limit: {
            type: Number,
            default: 0
        }
    },
    data: () => ({ isQueryEditorShown: false }),
    computed: {
        /**
         * @return {string[]}
         */
        datasetPath() {
            const { query } = this;
            if (query == null) {
                return [];
            }
            return query[Query.KEY.FROM];
        },
        /**
         * @return {string}
         */
        datasetFullname() {
            return this.datasetPath.join('/');
        },
        /**
         * @return {string}
         */
        datasetName() {
            return this.datasetPath.slice(-1).toString();
        }
    },
    methods: {
        emitChange({ query = null, dimensionList = {}, limit = 0 } = {}) {
            this.$emit('change', { query, dimensionList, limit });
        },
        emitClone() {
            this.$emit('clone');
        },
        emitDelete() {
            this.$emit('delete');
        },
        toggleQueryEditor() {
            this.isQueryEditorShown = !this.isQueryEditorShown;
        },
        onQueryEditorClose() {
            this.toggleQueryEditor();
        },
        onQueryEditorSave({ query, dimensionList, limit }) {
            this.emitChange({ query, dimensionList, limit });
            this.toggleQueryEditor();
        }
    }
};
</script>
<style lang="less" scoped>
.ui-dremio-source {
    display: grid;
    gap: 0.5rem;
    align-items: center;
    grid-template-columns: 1fr auto;
}
</style>
