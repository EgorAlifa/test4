<template>
    <ui-pagination class="pull-right" v-bind="{ page, pages }" @select="page => onSelect(page)">
        <template #default="item">
            <div :key="item.index">
                <div :style="style" v-if="item.page == null">...</div>
                <div
                    class="btn btn-small"
                    :class="{ 'btn-active': item.page == page }"
                    :style="[item.page == page ? activeStyle : style]"
                    @click="item.selectPage(item.page)"
                    v-else
                >
                    {{ item.page.toLocaleString() }}
                </div>
            </div>
        </template>
    </ui-pagination>
</template>
<style scoped>
.btn-active {
    color: #fff;
    background: var(--color-primary);
}
</style>
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
        settings: {
            type: Object,
            default: () => {
                return null;
            }
        }
    },
    computed: {
        style() {
            let { fontFamily, fontSize, color } = this.settings;
            return {
                fontFamily,
                fontSize: `${fontSize}rem`,
                color
            };
        },
        activeStyle() {
            let { fontFamily, fontSize, activeColor, background } = this.settings;
            return {
                fontFamily,
                fontSize: `${fontSize}rem`,
                color: activeColor,
                background
            };
        }
    },
    methods: {
        onSelect(page) {
            this.$emit('select', page);
        }
    }
};
</script>
