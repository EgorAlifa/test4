<template>
    <w-grid class="pos-rel w-100 h-100 table scroll-x" v-bind="GridProps">
        <template #thead="{ style }">
            <div :style="style" :class="tableHeadClass" class="thead" data-slot="header">
                <slot name="header"></slot>
            </div>
        </template>
        <template #tbody="{ style }">
            <div :style="style" :class="tableBodyClass" class="tbody scroll-y">
                <slot v-if="isLoading" name="preload"></slot>
                <div v-else>
                    <slot></slot>
                </div>
            </div>
        </template>
        <template #tfoot="{ style }">
            <div :style="style" class="tfoot" data-slot="footer">
                <slot name="footer"></slot>
            </div>
        </template>
    </w-grid>
</template>
<style module lang="pcss">
.with-scrollbar-gutter {
    scrollbar-gutter: stable;
}
</style>
<script>
import { Grid as WGrid } from 'goodteditor-ui';

export default {
    components: { WGrid },
    props: {
        isLoading: {
            type: Boolean,
            default: false
        },
        isCardsMode: {
            type: Boolean,
            default: false
        }
    },
    static: {
        GridProps: {
            areas: [['thead'], ['tbody'], ['tfoot']],
            rows: ['auto', '1fr', 'auto']
        }
    },
    computed: {
        /**
         * @return {Record<string, boolean>}
         */
        tableHeadClass() {
            return { 'with-scrollbar-gutter': this.isCardsMode === false };
        },
        /**
         * @return {Record<string, boolean>}
         */
        tableBodyClass() {
            return { 'with-scrollbar-gutter': this.isCardsMode === false };
        }
    },
    implicitCssModule: true
};
</script>
