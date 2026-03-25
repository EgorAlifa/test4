<template>
    <div :class="cellCssClass" v-on="cellEventHandlers">
        <ui-tooltip v-bind="{ ...tooltipOpts }">
            <template #target="{ events, binds }">
                <div
                    class="d-inline-flex"
                    :class="value.cssClass()"
                    :style="styleObject"
                    v-bind="binds"
                    v-on="tooltip.enable ? events : {}">
                    <i class="mdi mdi-circle box"></i>
                </div>
            </template>
            <div :style="tooltipStyle">{{ tooltipValue }}</div>
        </ui-tooltip>
    </div>
</template>
<script>
import { Tooltip as UiTooltip } from 'goodteditor-ui';
import RenderMixin from './render-mixin';

const TaskStatus = Object.freeze({
    HIGH: 'В работе высокой важности',
    MIDDLE: 'В работе средней важности',
    LOW: 'В работе низкой важности',
    MONITORING: 'Закрыт, находится в мониторинге',
    CLOSED: 'Закрыт'
});
const PULSE_ANIMATION = 'radial-pulse 0.6s infinite alternate;';
const RADIAL_GRADIENT = 'radial-gradient(farthest-side, red, transparent) center no-repeat;';
const StatusStyle = Object.freeze({
    [TaskStatus.HIGH]: {
        '--color': 'red',
        '--animation': PULSE_ANIMATION,
        '--background': RADIAL_GRADIENT
    },
    [TaskStatus.MIDDLE]: {
        '--color': 'yellow',
        '--animation': PULSE_ANIMATION,
        '--background': RADIAL_GRADIENT
    },
    [TaskStatus.LOW]: {
        '--color': 'green',
        '--animation': PULSE_ANIMATION,
        '--background': RADIAL_GRADIENT
    },
    [TaskStatus.MONITORING]: {
        '--color': 'cyan'
    },
    [TaskStatus.CLOSED]: {
        '--color': 'lightgrey'
    }
});

export default {
    components: { UiTooltip },
    mixins: [RenderMixin],
    props: {
        value: {
            type: Object,
            default: () => ({})
        }
    },
    computed: {
        tooltipValue() {
            const { tooltip, value } = this;
            return tooltip.value == null ? value.format() : tooltip.value;
        },
        styleObject() {
            const { value = '' } = this.value;
            let obj = {};

            if (value.includes(TaskStatus.HIGH)) {
                obj = StatusStyle[TaskStatus.HIGH];
            } else if (value.includes(TaskStatus.MIDDLE)) {
                obj = StatusStyle[TaskStatus.MIDDLE];
            } else if (value.includes(TaskStatus.LOW)) {
                obj = StatusStyle[TaskStatus.LOW];
            } else if (value.includes(TaskStatus.MONITORING)) {
                obj = StatusStyle[TaskStatus.MONITORING];
            } else if (value.includes(TaskStatus.CLOSED)) {
                obj = StatusStyle[TaskStatus.CLOSED];
            }
            return obj;
        }
    }
};
</script>
<style scoped lang="less" src="./status.less"></style>
