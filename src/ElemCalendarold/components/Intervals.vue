<template>
    <div class="interval">
        <div>
            <span class="interval__label-begin">Начало периода</span>
            <w-interval-row v-model="model.start" @change="onSavePeriod('start', $event)"></w-interval-row>
        </div>
        <div>
            <span class="interval__label-end">Конец периода</span>
            <w-interval-row v-model="model.end" @change="onSavePeriod('end', $event)"></w-interval-row>
        </div>
    </div>
</template>

<script>
import { PanelUi } from '@goodt-wcore/components';
import { cloneDeep } from 'lodash';
import WIntervalRow from './IntervalRow.vue';

export default {
    components: { ...PanelUi, WIntervalRow },
    props: {
        value: {
            type: Object,
            default: null
        }
    },
    data() {
        return {
            model: {}
        };
    },
    watch: {
        value: {
            handler(value) {
                this.model = cloneDeep(value);
            },
            immediate: true
        }
    },
    methods: {
        onSavePeriod(period, data) {
            this.model[period] = data;
            this.$emit('change', this.model);
        }
    },

    implicitCssModule: true
};
</script>

<style src="../style.pcss" lang="pcss" module></style>
