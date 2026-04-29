<template>
    <ui-pagination class="pagination" v-bind="{ page, pages, numItems }" @select="onSelect">
        <template #default="{ index, page, selectPage }">
            <div :key="index">
                <div class="pagination__button" v-if="page == null">...</div>
                <button
                    class="pagination__button"
                    :class="resolvePaginationButtonClasses({ index, page, selectPage })"
                    @click.stop="selectPage(page)"
                    v-else>
                    {{ page.toLocaleString() }}
                </button>
            </div>
        </template>
    </ui-pagination>
</template>
<script>
import { Pagination as UiPagination } from 'goodteditor-ui';

export default {
    components: {
        UiPagination
    },
    props: {
        page: {
            type: Number,
            default: 1
        },
        pages: {
            type: Number,
            default: 1
        },
        numItems: {
            type: Number,
            default: 7
        }
    },
    methods: {
        onSelect(page) {
            this.$emit('select', page);
        },
        resolvePaginationButtonClasses(item) {
            return {
                'pagination__button--active': item.page === this.page
            };
        }
    },
    implicitCssModule: true
};
</script>
<style module src="../styles/style.module.pcss" lang="pcss"></style>
