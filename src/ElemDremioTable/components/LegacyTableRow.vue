<template>
    <tr v-on="$listeners">
        <slot></slot>
    </tr>
</template>

<script>
export default {
    name: 'TableRow',
};
</script>
