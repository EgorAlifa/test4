<template>
    <div :class="cssClass" :style="cssStyle">
        <slot :name="slotDefault" v-if="hasState(slotDefault)">
            <code v-if="isEditorMode">{{ slotDefault }} slot</code>
        </slot>
    </div>
</template>
<script>
import { Elem } from 'goodt-wcore';

const descriptor = () => ({
    props: {
        activeState: {
            type: String,
            default: 'default'
        },
        states: {
            type: Array,
            default() {
                return [{ name: 'default', event: '' }];
            }
        },
        height: {
            type: String,
            default: '100'
        },
        heightUnit: {
            type: String,
            default: '%'
        }
    },
    vars: {}
});

export default {
    extends: Elem,
    data() {
        return {
            descriptor: descriptor(),
            slotDefault: null
        };
    },
    created() {
        this.slotDefault = this.props.activeState;
        if (this.isEditorMode) {
            this.$watch('props.activeState', (val) => (this.slotDefault = val));
            this.$watch('props.states', () => this.attachEventHandlers());
        }
    },
    methods: {
        isChildAllowed(type) {
            return true;
        },
        hasState(stateName) {
            return this.props.states.find((state) => state.name === stateName) != null;
        },
        getSlotNames() {
            return this.props.states.map((state) => state.name);
        },
        getPanels() {
            return [import('./panels/OptionsPanel.vue')];
        },
        subscribe() {
            this.attachEventHandlers();
        },
        attachEventHandlers() {
            this.$eventBus.destroy();
            this.props.states
                .filter((s) => s.event.length > 0)
                .forEach(({ name, event }) =>
                    this.$eventListen(event, () => (this.slotDefault = name))
                );
        }
    }
};
</script>
