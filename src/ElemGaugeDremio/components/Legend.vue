<template>
    <div class="legend">
        <template v-for="(metric, index) in metricsSet">
            <div class="metric nobr" :key="index">
                <div class="metric-color" :style="{ backgroundColor: metric.valueColor }"></div>
                <div class="metric-name">
                    {{ metric.nameValue }}:
                    {{ getValueByFormat(metric.value, metric.limit, metric.format, percentFormat)
                    }}{{ metric.format == 'percent' ? '%' : '' }}
                </div>
            </div>
            <div class="metric nobr" v-if="metric.showLimit" :key="'limit' + index">
                <div class="metric-color" :style="{ backgroundColor: metric.limitColor }"></div>
                <div class="metric-name">
                    {{ metric.nameLimit }}:
                    {{ getValueByFormat(metric.limit, metric.limit, metric.format, percentFormat)
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
            type: String
        }
    }
};
</script>

<style scoped>
.legend {
    display: flex;
    padding: 10px 0 0 10px;
    font-size: var(--w-legend_font-size);
    font-family: var(--w-legend_font-family);
    flex-direction: var(--w-percent_flex-direction);
}
.metric {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    margin-right: 10px;
}
.metric-color {
    height: 15px;
    width: 20px;
    border-radius: 2px;
    margin-right: 7px;
}
</style>
