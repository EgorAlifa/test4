<template>
    <div :class="cssClass" :style="cssStyle">
        <slot v-if="show">
            <code v-if="isEditorMode">default slot</code>
        </slot>
        <code v-else-if="isEditorMode">{{ type }}</code>
    </div>
</template>
<script>
import { Elem } from 'goodt-wcore';

const descriptor = () => ({
    props: {
        eventShow: {
            type: String,
            default: ''
        },
        eventHide: {
            type: String,
            default: ''
        },
        eventShowHide: {
            type: String,
            default: ''
        },
        initShow: {
            type: Boolean,
            default: true
        },
        showMode: {
            type: Boolean,
            default: false
        },
        reverseEvent: {
            type: Boolean,
            default: false
        }
    },
    vars: {}
});

export default {
    extends: Elem,
    data() {
        return {
            descriptor: descriptor(),
            show: false
        };
    },
    created() {
        this.show = this.props.initShow;
        this.$emit();
        if (this.isEditorMode) {
            this.$watch('props', () => this.attachEventHandlers(), {
                deep: true
            });
        }
    },
    methods: {
        isChildAllowed(type) {
            return true;
        },
        getSlotNames() {
            return ['default'];
        },
        getPanels() {
            return [import('./panels/OptionsPanel.vue')];
        },
        subscribe() {
            this.attachEventHandlers();
        },
        attachEventHandlers() {
            const { showMode, eventShowHide, reverseEvent } = this.props;
            this.$eventBus.destroy();
            if (showMode) {
                this.$eventListen(eventShowHide, (e, val) => {
                    if (typeof val !== 'boolean') {
                        return;
                    }
                    this.show = reverseEvent ? !val : val;
                });
            } else {
                if (this.props.eventShow) {
                    this.$eventListen(this.props.eventShow, () => {
                        this.show = true;
                    });
                }
                if (this.props.eventHide) {
                    this.$eventListen(this.props.eventHide, () => {
                        this.show = false;
                    });
                }
            }
        }
    }
};
</script>
