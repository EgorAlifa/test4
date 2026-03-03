<template>
    <ui-panel-container>
        <ui-container>
            <ui-draggable v-model="slots">
                <ui-has-panel class="slot-item" v-for="(slot, i) in slots" :key="slot.id">
                    <div class="slot-item__label flex-v-center">
                        <div class="noscroll" @dblclick.stop="onSlotDoubleClick(slot.name)">
                            <span class="text-small drag-handle">{{ slot.name }}</span>
                        </div>
                        <ui-button type="ghost" inline icon @click="toggleShowSlot(slot, i)">
                            <i v-if="slot.show" class="mdi mdi-eye"></i>
                            <i v-else class="mdi mdi-eye-closed"></i>
                        </ui-button>
                        <ui-button type="ghost" inline icon @click="removeSlotAt(i)">
                            <i class="mdi mdi-delete"></i>
                        </ui-button>
                    </div>
                    <template #panel>
                        <ui-panel
                            class="slot-item__panel"
                            :groups="[
                                { name: 'Настройки', slot: 'default' },
                                { name: 'Правила', slot: 'rules' }
                            ]">
                            <ui-input :value="slot.name" @input="(name) => setSlotName(slot, name)">название</ui-input>
                            <template #rules>
                                <ui-rules-list
                                    v-model="slot.rules"
                                    v-bind="{ metricDimensions: addonsMetricDimensions }"
                                    @input="slotsChanged"></ui-rules-list>
                            </template>
                        </ui-panel>
                    </template>
                </ui-has-panel>
            </ui-draggable>
            <ui-button @click="addSlot">Добавить слот</ui-button>
        </ui-container>
    </ui-panel-container>
</template>
<script>
import { Panel } from '@goodt-wcore/panel';
import { usePanelDatasetMixin } from '@goodt-common/data';
import UiDraggable from 'vuedraggable';
import UiContainer from './components/UiContainer.vue';
import UiRulesList from './components/UiRulesList.vue';
import { DATASET_ADDITIONAL_PROP } from '../descriptor';

export default {
    extends: Panel,
    components: { UiContainer, UiRulesList, UiDraggable },
    mixins: [usePanelDatasetMixin({ prop: DATASET_ADDITIONAL_PROP })],
    meta: { name: 'Слоты', icon: 'table-plus', id: 'SlotsPanel' },
    computed: {
        slots: {
            get() {
                return this.props.slots;
            },
            set(val) {
                this.props.slots = val;
                this.slotsChanged();
            }
        },
        addonsMetricDimensions() {
            return this.buildOptions([...this.metrics, ...this.dimensions]);
        }
    },
    mounted() {
        const {
            slots: { factory }
        } = this.descriptor.props;
        this.slots = this.slots.map(factory);
    },
    methods: {
        slotsChanged() {
            this.propChanged('slots');
        },
        /**
         * @return {string}
         */
        getNextSlotName() {
            const n = this.slots.reduce((acc, { name }) => {
                const i = parseInt(name.replace(/\D/g, ''), 10);
                return Math.max(acc, Number.isNaN(i) ? 0 : i);
            }, 0);
            return `слот ${n + 1}`;
        },
        /**
         * @param {number} index
         */
        removeSlotAt(index) {
            this.slots.splice(index, 1);
            this.slotsChanged();
        },
        toggleShowSlot(slot, index) {
            this.slots = this.slots.toSpliced(index, 1, { ...slot, show: !slot.show });
        },
        addSlot() {
            const {
                slots: { factory }
            } = this.descriptor.props;
            const name = this.getNextSlotName();
            const slot = factory({ name });
            this.slots.push(slot);
            this.slotsChanged();
        },
        setSlotName(slot, name) {
            const foundSlot = this.slots.find(({ name: slotName }) => slotName === name);
            if (foundSlot && foundSlot === slot) {
                return;
            }
            slot.name = name;
            this.slotsChanged();
        },
        onSlotDoubleClick(slotName) {
            const { elementInstance } = this;
            const { chosenSlotNameToShow } = elementInstance;
            elementInstance.chosenSlotNameToShow = chosenSlotNameToShow === slotName ? null : slotName;
        }
    }
};
</script>
<style lang="pcss" scoped>
@b slot-item {
    @e label {
        display: grid;
        grid-template-columns: 1fr auto auto;
    }
}
.drag-handle {
    cursor: move;
}
</style>
