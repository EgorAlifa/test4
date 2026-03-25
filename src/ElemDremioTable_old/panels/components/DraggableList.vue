<template>
    <draggable v-model="list" v-bind="dragOptions">
        <slot></slot>
    </draggable>
</template>
<script>
import draggable from 'vuedraggable';

export default {
    components: {
        draggable
    },
    props: {
        value: {
            type: Array
        },
        dragOptions: {
            type: Object,
            default() {
                return {
                    animation: 200,
                    handle: '.drag-handle'
                };
            }
        }
    },
    computed: {
        list: {
            set(val) {
                this.$emit('input', val);
            },
            get() {
                return this.value;
            }
        }
    }
};
</script>
