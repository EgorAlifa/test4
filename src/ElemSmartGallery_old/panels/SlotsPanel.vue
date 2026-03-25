<template>
    <ui-panel-container>
        <ui-container>
            <ui-has-panel>
                <ui-checkbox prop="awaitStoreFilter">
                    {{ descriptor.props.awaitStoreFilter.label }}
                </ui-checkbox>
                <template #panel>
                    <ui-panel
                        :groups="[{ name: 'Настройка переменных', slot: 'default' }]">
                        <ui-select
                            prop="awaitVariableModeVariables"
                            :options="awaitModeVariableOptions"
                            multiple>
                            Переменные
                        </ui-select>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-switch prop="isUseSkeleton">
                {{ descriptor.props.isUseSkeleton.label }}
            </ui-switch>

            <ui-input v-model="props.events.updateData" @change="propChanged('events')">
                {{ descriptor.props.events.label.updateData }}
            </ui-input>

            <ui-switch v-model="isDevMode">Показать все слоты</ui-switch>

            <ui-switch prop="isShowDefaultSlot">
                <ui-hint>
                    <template #label>Дефолтный слот</template>
                    Отображает дефолтный слот в случае, когда ни одно из условий всех правил не выполняется.
                </ui-hint>
            </ui-switch>

            <ui-draggable v-model="slots">
                <ui-has-panel class="slot-item" v-for="(slot, i) in slots" :key="slot.id">
                    <div class="slot-item__label">
                        <div>
                            <span class="text-truncate text-small drag-handle">{{ slot.name }}</span>
                        </div>
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
                                    v-bind="{ metricDimensions: dremioAddonsMetricDimensions }"
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
import { Panel } from '@goodt-wcore/core';
import { Query } from '@goodt-common/dremio';
import UiDraggable from 'vuedraggable';
import { PanelInstanceTypeDescriptor } from '../types';
import UiContainer from './components/UiContainer.vue';
import UiRulesList from './components/UiRulesList.vue';

export default {
    extends: Panel,
    components: { UiContainer, UiRulesList, UiDraggable },
    data: () => ({
        /**
         * @public
         */
        $meta: { name: 'Слоты', icon: 'table-plus' },
        ...PanelInstanceTypeDescriptor
    }),
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
        isDevMode: {
            get() {
                const { elementInstance: el } = this;
                return el.isDevMode;
            },
            set(val) {
                const { elementInstance: el } = this;
                if (el) {
                    el.isDevMode = val;
                }
            }
        },
        dremioAddonsMetricDimensions() {
            const { dremioAddons } = this.props;
            const names = dremioAddons.reduce(
                (acc, { query, dimensionList }) => [
                    ...acc,
                    ...Object.keys(dimensionList),
                    ...Query.queryMetricNames(query)
                ],
                []
            );
            return [...new Set(names)];
        },
        awaitModeVariableOptions() {
            return Object.keys({
                ...this.descriptor.vars,
                ...this.elementInstance?.descriptor.vars
            }).sort();
        }
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
                const i = parseInt(name.replace(/\D/g, ''));
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
        addSlot() {
            const { factory } = this.descriptor.props.slots;
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
        }
    }
};
</script>
<style lang="less" scoped>
.slot-item {
    &__label {
        display: grid;
        grid-template-columns: 1fr auto auto;
    }
}
.drag-handle {
    cursor: move;
}
</style>
