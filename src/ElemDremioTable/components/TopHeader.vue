<template>
    <div class="top-header" :style="topHeaderStyle">
        <div
            v-for="(header, i) in topHeaders"
            :key="i"
            :style="buildTopHeaderCellStyle(header)"
            class="top-header__cell">
            {{ header.title }}
        </div>
    </div>
</template>

<script>
import { cssStrToObj } from '../utils';

export default {
    props: {
        parentRefs: {
            type: Object,
            default: () => ({})
        },
        topHeaders: {
            type: Array,
            default: () => []
        }
    },
    data: () => ({
        topHeaderStyle: null
    }),
    mounted() {
        this.topHeaderStyle = this.buildTopHeaderStyle();
    },
    methods: {
        /**
         * @return Record<string, string>
         */
        buildTopHeaderStyle() {
            const { headCells = [], thead } = this.parentRefs;

            if (headCells.length === 0) {
                return {};
            }

            const { offsetWidth: headerWidth } = thead;
            const gridTemplateColumns = headCells
                .map(({ $el }) => `${($el.offsetWidth / headerWidth * 100).toFixed(1)}%`)
                .join(' ');

            return {
                gridTemplateColumns
            }
        },
        /**
         * @param {DTopHeader} header
         * @return Record<string, string>
         */
        buildTopHeaderCellStyle(header) {
            const styles = cssStrToObj(header.style);
            const { headCells } = this.parentRefs;
            const headCellsCount = headCells?.length ?? 0;

            if (headCells == null || headCellsCount === 0) {
                return styles;
            }

            let [rangeStart, rangeEnd] = header.range;
            rangeStart = rangeStart || 1;
            rangeEnd = rangeEnd || headCellsCount;

            if (rangeStart > rangeEnd) {
                [rangeStart, rangeEnd] = [rangeEnd, rangeStart];
            }

            return {
                ...styles,
                gridColumn: `${rangeStart} / ${rangeEnd + 1}`
            }
        }
    }
}
</script>
