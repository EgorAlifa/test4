<template>
    <div :class="cssClass" :style="[cssStyle, activeStateCssStyle]">
        <slot :name="slotDefault" v-if="hasState(slotDefault)">
            <div v-if="isEditorMode" class="stack-slot-placeholder">
                <i class="mdi mdi-view-carousel-outline stack-slot-placeholder__icon" />
                <div class="stack-slot-placeholder__name">{{ slotDefault }}</div>
                <div class="stack-slot-placeholder__hint">Перетащите виджеты сюда</div>
            </div>
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
        stateStyles: {
            type: String,
            default: '{}',
            label: 'CSS стили для состояний (JSON-объект { имяСостояния: "css..." })'
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
    computed: {
        activeStateCssStyle() {
            try {
                const map = JSON.parse(this.props.stateStyles || '{}');
                const css = map[this.slotDefault];
                if (!css) return null;
                // Parse inline CSS string into a style object
                const styleObj = {};
                css.split(';').forEach((decl) => {
                    const idx = decl.indexOf(':');
                    if (idx < 0) return;
                    const prop = decl.slice(0, idx).trim();
                    const val = decl.slice(idx + 1).trim();
                    if (prop && val) {
                        // Convert kebab-case to camelCase
                        styleObj[prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = val;
                    }
                });
                return styleObj;
            } catch (e) {
                return null;
            }
        }
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

<style scoped>
.stack-slot-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-height: 80px;
    border: 2px dashed #c7d2fe;
    border-radius: 10px;
    background: #f5f7ff;
    padding: 18px 12px;
    pointer-events: none;
}
.stack-slot-placeholder__icon {
    font-size: 28px;
    color: #a5b4fc;
}
.stack-slot-placeholder__name {
    font-size: 13px;
    font-weight: 700;
    color: #6366f1;
}
.stack-slot-placeholder__hint {
    font-size: 11px;
    color: #94a3b8;
}
</style>
