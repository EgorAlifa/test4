<template>
    <w-elem>
        <h1>{{ props.message }}</h1>
    </w-elem>
</template>

<script>
import { Elem } from '@goodt-wcore/elem';
import { meta } from './descriptor';
import { ElemInstanceTypeDescriptor } from './types';

export default {
    extends: Elem,

    meta,

    /* static data used in <template></template> */
    static: {},
    data: () => ({
        ...ElemInstanceTypeDescriptor
    })
};
</script>

<style lang="pcss" scoped src="./style.pcss"></style>
