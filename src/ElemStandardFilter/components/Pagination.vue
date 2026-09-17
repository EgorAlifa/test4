<template>
    <ui-pagination class="pagination" v-bind="{ page, pages, numItems }" @select="(page) => onSelect(page)">
        <template #default="item">
            <div :key="item.index">
                <div class="pagination__button" v-if="item.page == null">...</div>
                <button
                    class="pagination__button"
                    :class="{
                        'pagination__button--active': item.page === page
                    }"
                    @click="item.selectPage(item.page)"
                    v-else>
                    {{ item.page.toLocaleString() }}
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
        }
    },
    implicitCssModule: true
};
</script>
<style module lang="pcss" src="./styles/pagination.pcss"></style>
