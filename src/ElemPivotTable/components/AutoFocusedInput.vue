<template>
    <input ref="input" :value="value" type="text" @input="onInput" @blur="onBlur" />
</template>

<script>
export default {
    name: 'AutoFocusedInput',
    props: {
        value: {
            type: String,
            default: ''
        }
    },
    mounted() {
        this.$refs.input.focus();
    },
    methods: {
        onInput($event) {
            this.$emit('input', $event.target.value);
        },
        onBlur($event) {
            this.$emit('blur', $event);
        }
    }
};
</script>
