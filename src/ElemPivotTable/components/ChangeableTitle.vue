<template>
    <div class="text-truncate">
        <ui-auto-focused-input
            class="auto-focused-input"
            v-if="isShownInput"
            :value="value"
            @input="onInput"
            @blur="onBlur" />
        <div v-else @dblclick="onDblClick">{{ title }}</div>
    </div>
</template>

<script>
import AutoFocusedInput from './AutoFocusedInput.vue';

export default {
    name: 'ChangeableTitle',
    components: {
        UiAutoFocusedInput: AutoFocusedInput
    },
    props: {
        title: {
            type: String,
            default: ''
        },
        value: {
            type: String,
            default: ''
        }
    },
    data: () => ({
        isShownInput: false
    }),
    methods: {
        onInput(text) {
            this.$emit('input', text);
        },
        onDblClick() {
            this.isShownInput = true;
        },
        onBlur() {
            this.isShownInput = false;
        }
    },
    implicitCssModule: true
};
</script>
<style lang="pcss" src="./styles/changeableTitle.pcss" module></style>
