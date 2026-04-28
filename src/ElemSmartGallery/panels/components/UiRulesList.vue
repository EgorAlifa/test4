<template>
    <ui-container>
        <ui-draggable v-model="conditions" v-bind="dragOptions">
            <ui-collapse class="p" v-for="(group, i) in conditions" :key="i">
                <template #header>
                    <div class="condition-rule">
                        <i class="mdi mdi-cursor-move mar-right-3 drag-handle"></i>
                        Правило {{ i + 1 }}
                        <div class="btn btn-inline btn-ghost" @click.stop="removeGroup(i)">
                            <i class="mdi mdi-delete"></i>
                        </div>
                    </div>
                </template>
                <ui-container>
                    <ui-condition-item
                        v-for="(cond, j) in group"
                        :value="cond"
                        :key="i + '-' + j"
                        v-bind="{ metricDimensions }"
                        @input="(condNew) => updateCond(i, j, condNew)"
                        @delete="removeCond(i, j)"></ui-condition-item>
                    <ui-button @click="addCond(i)">Добавить условие</ui-button>
                </ui-container>
            </ui-collapse>
        </ui-draggable>
        <ui-button @click="addGroup">Добавить правило</ui-button>
    </ui-container>
</template>
<script>
import { cloneDeep } from 'lodash';
import { PanelUi } from '@goodt-wcore/panel-ui';
import UiDraggable from 'vuedraggable';
import UiContainer from './UiContainer.vue';
import UiConditionItem from './UiConditionItem.vue';
import { SlotCondition } from '../../constants';

export default {
    components: { UiDraggable, UiContainer, UiConditionItem, ...PanelUi },
    props: {
        value: {
            type: Array,
            default: () => []
        },
        metricDimensions: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            dragOptions: {
                handle: '.drag-handle'
            }
        };
    },
    computed: {
        conditions: {
            get() {
                return this.value;
            },
            set(val) {
                this.$emit('input', val);
            }
        }
    },

    methods: {
        addCond(i) {
            const { value } = this;
            const clone = cloneDeep(value);
            clone[i].push(SlotCondition.toString(new SlotCondition()));
            this.$emit('input', clone);
        },
        removeCond(i, j) {
            const { value } = this;
            const clone = cloneDeep(value);
            clone[i].splice(j, 1);
            this.$emit('input', clone);
        },
        updateCond(i, j, condNew) {
            const { value } = this;
            const clone = cloneDeep(value);
            clone[i][j] = condNew;
            this.$emit('input', clone);
        },
        addGroup() {
            this.$emit('input', [...this.value, []]);
        },
        removeGroup(i) {
            const { value } = this;
            const clone = cloneDeep(value);
            clone.splice(i, 1);
            this.$emit('input', clone);
        }
    }
};
</script>
<style lang="less" scoped>
.condition-rule {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
}
.drag-handle {
    cursor: move;
}
</style>
