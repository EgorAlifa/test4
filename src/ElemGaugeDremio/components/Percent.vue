<template>
    <div class="percent">
        <template v-for="(metric, index) in metricsSet">
            <div class="metric nobr" :key="index">
                <div class="metric-percent" :style="percentStyle">
                    {{ getValueByFormat(metric.value, metric.limit, metric.format, percentFormat)
                    }}{{ metric.format == 'percent' ? '%' : '' }}
                </div>
            </div>
        </template>
    </div>
</template>

<script>
import { mixinGauge } from '../utils/helper';

export default {
    mixins: [mixinGauge],
    props: {
        metricsSet: {
            type: Array,
            required: true
        },
        percentFormat: {
            type: [String]
        },
        percentStyle: {
            type: Object,
            default: () => {}
        }
    },
    methods: {}
};
</script>

<style scoped>
.percent {
    display: flex;
    padding: 10px 0 0 10px;
    flex-direction: var(--w-percent_flex-direction);
}

.metric {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    margin-right: 10px;
}
</style>
