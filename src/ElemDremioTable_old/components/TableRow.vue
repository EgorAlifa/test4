<template>
    <div v-on="$listeners">
        <div class="d-flex flex-nowrap subrow" :class="{ selected: isSelected, 'style-priority': hasStylePriority }">
            <slot v-bind="{ select }" />
        </div>
        <div v-if="isTableSlotShown" class="w-100">
            <slot name="table" v-bind="{ hasParentTable: true }" />
        </div>
    </div>
</template>
<script>
import isEqual from 'lodash/isEqual';

export default {
    name: 'TableRow',
    props: {
        row: {
            type: Object,
            default: () => ({})
        },
        selected: {
            type: Object,
            default: null
        },
        hasStylePriority: {
            type: Boolean,
            default: false
        }
    },
    computed: {
        isSelected() {
            return isEqual(this.row, this.selected);
        },
        isTableSlotShown() {
            return this.isSelected;
        }
    },
    methods: {
        select() {
            this.$emit('update:selected-row', this.row);
        }
    }
};
</script>
