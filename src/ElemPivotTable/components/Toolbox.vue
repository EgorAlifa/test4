<template>
    <div class="pivot-table-container__toolbox toolbox">
        <div class="toolbox__item" v-for="{ name, listener, iconClass } in tools">
            <div class="toolbox-button" @click="listener" :title="name">
                <i class="toolbox-button__icon" :class="iconClass" />
                <span>{{ name }}</span>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Toolbox',
    props: {
        tools: {
            type: Array,
            default: () => []
        }
    }
};
</script>

<style scoped></style>
