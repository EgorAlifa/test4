<template>
    <w-elem>
        <code v-if="isEditorMode">{{ type }}</code>
        <div class="skeleton-grid" v-if="isLoading && isInitLoad && !isDevMode">
            <template v-if="props.isUseSkeleton">
                <div class="skeleton-grid__item skeleton" v-for="i in props.grid.cols * 2" :key="i"></div>
            </template>
        </div>
        <div class="slots-grid" :class="gridClasses" v-else>
            <div class="slot-item" v-for="name in slotNamesToRender" :key="name" :data-slot="name">
                <slot :name="name">
                    <div class="slot-item__placeholder" v-if="isEditorMode">
                        <code>{{ name }}</code>
                    </div>
                </slot>
            </div>
            <div class="slot-item" v-if="isShowDefaultSlot">
                <slot name="default">
                    <div class="slot-item__placeholder" v-if="isEditorMode">
                        <code>default</code>
                    </div>
                </slot>
            </div>
        </div>
    </w-elem>
</template>
<script>
import { Elem } from '@goodt-wcore/core';
import { store, ValueObject } from '@goodt-wcore/managers';
import { widget } from '@goodt-wcore/utils';
import { Query } from '@goodt-common/dremio';
import { meta, Vars, Events } from './descriptor';
import { ElemInstanceTypeDescriptor } from './types';
import { createViewModel } from './models';
import { SlotCondition, SlotConditionType, SlotConditionOperatorMeta, Metric, DEFAULT_SLOT_NAME } from './constants';

export default {
    extends: Elem,
    meta,
    data: () => ({
        // режим, который отключает все фильтрации слотов
        isDevMode: false,
        isLoading: true,
        isInitLoad: true,
        // eslint-disable-next-line no-restricted-syntax
        sourcesData: [],

        /* Vetur HACK */
        ...ElemInstanceTypeDescriptor
    }),
    computed: {
        /**
         * @return {import('./descriptor').Slot[]}
         */
        slots() {
            const { sourcesData, isDevMode, slotNamesToShow } = this;
            const { slots, metrics } = this.props;
            const [mainData, ...addonsData] = sourcesData;
            // skip
            if (isDevMode) {
                return slots;
            }

            // по списку
            if (Array.isArray(slotNamesToShow)) {
                return slots.filter(({ name }) => slotNamesToShow.includes(name));
            }

            let slotsFilteredAndSorted = slots;
            // {1} фильтр по основному датасету
            if (mainData != null) {
                const { [Metric.NAME]: nameField } = metrics;
                // нет метрики "имя" слота
                if (nameField == null) {
                    return slotsFilteredAndSorted;
                }
                const slotNames = mainData.map((item) => item[nameField]);
                slotsFilteredAndSorted = slots
                    .filter((item) => slotNames.includes(item.name))
                    .sort((a, b) => {
                        const aIndex = slotNames.indexOf(a.name);
                        const bIndex = slotNames.indexOf(b.name);
                        return aIndex - bIndex;
                    });
            }

            // {2} фильтрация по датасетам для фильтрации
            const addonsDataFlat = addonsData.flat();
            // нет данных
            if (addonsData.length === 0) {
                return mainData == null ? [] : slotsFilteredAndSorted;
            }
            return slotsFilteredAndSorted.filter((slot) => {
                const rules = (slot.rules ?? []).filter((conditions) => conditions.length > 0);
                // правила -> правило1 OR правило2...
                // правило1 -> условие1 AND условие2...
                for (const conditions of rules) {
                    // соберем массив из проверок всех условий
                    const conditionMatches = conditions.map((conditionStr) => {
                        const {
                            a: leftValue,
                            b: rightValue,
                            op: operation,
                            type,
                            typeForLeftField
                        } = SlotCondition.fromString(conditionStr);
                        const rightTargetValue =
                            type === SlotConditionType.INPUT ? rightValue : this.getStoreValue(rightValue);
                        const { resolve } = SlotConditionOperatorMeta[operation];
                        // сравнивать по сути будем -> obj[metricName] == metricTargetValue
                        if (typeForLeftField == null || typeForLeftField === SlotConditionType.METRIC) {
                            const hasMetricMatch =
                                addonsDataFlat.find(
                                    (item) => leftValue in item && resolve(item[leftValue], rightTargetValue)
                                ) != null;
                            return hasMetricMatch;
                        }
                        const leftTargetValue = this.getStoreValue(leftValue);

                        return resolve(leftTargetValue, rightTargetValue);
                    });
                    // правило подходит, если все условия подошли
                    const hasRuleMatch = conditionMatches.every((item) => item === true);
                    if (hasRuleMatch) {
                        return true;
                    }
                }
                // если у слота нет правил -> подходит; иначе -> ни одно правило не подошло
                return rules.length === 0;
            });
        },
        /**
         * @return {string[]}
         */
        slotNames() {
            return [...this.props.slots.map(({ name }) => name), DEFAULT_SLOT_NAME];
        },
        /**
         * @return {string[]}
         */
        slotNamesToRender() {
            return this.slots.map(({ name }) => name);
        },
        /**
         * @return {string[]?}
         */
        slotNamesToShow() {
            const names = this.$storeState[Vars.SLOT_NAMES];
            if (names == null) {
                return names;
            }
            return [names].flat().map((name) => String(name));
        },
        /**
         * @return {string}
         * @public
         */
        dremioSourcesStr() {
            try {
                const { dremio, dremioAddons } = this.props;
                return JSON.stringify([dremio, ...(dremioAddons ?? [])]);
            } catch (e) {
                return '';
            }
        },
        /**
         * @return {boolean}
         */
        isHeightPercent() {
            const { rowMinHeight } = this.props.grid;
            return rowMinHeight.slice(-1) === '%';
        },
        gridClasses() {
            if (!this.isHeightPercent) {
                return [];
            }
            return this.isEditorMode ? ['slots-grid__percent-editor'] : ['slots-grid__percent'];
        },
        isShowDefaultSlot() {
            return (this.isEditorMode || this.slotNamesToRender.length === 0) && this.props.isShowDefaultSlot;
        },
        isAllowedLoadData() {
            const { awaitStoreFilter: isAwaitStoreFilter, awaitVariableModeVariables } = this.props;

            if (!isAwaitStoreFilter) {
                return true;
            }

            if (isAwaitStoreFilter && awaitVariableModeVariables.length === 0) {
                return Object.keys(this.$storeState).some((key) => key !== Vars.SLOT_NAMES);
            }

            return awaitVariableModeVariables.every((variable) => this.$storeState[variable] != null);
        }
    },
    watch: {
        sourcesData() {
            const { isSaveFirstMetricValue } = this.props;
            const [mainData] = this.sourcesData;
            let result = null;

            if (isSaveFirstMetricValue) {
                result =
                    mainData[0] != null
                        ? Object.fromEntries(Object.entries(mainData[0]).filter(([_, value]) => value != null))
                        : null;
            } else {
                result = mainData?.reduce((state, row) => {
                    let resultState = { ...state };

                    Object.entries(row)
                        .filter(([_, value]) => value != null)
                        .forEach(([key, value]) => {
                            resultState = {
                                ...resultState,
                                [key]: resultState[key] == null ? [value] : [...resultState[key], value]
                            };
                        });

                    return resultState;
                }, {});
            }

            if (result == null) {
                return;
            }
            this.$storeCommit(result);
        }
    },
    watchEditor: {
        dremioSourcesStr: {
            async handler() {
                this.setSources();
                await this.fetchData();
            }
        }
    },
    watchStore: [
        {
            async handler() {
                if (this.isAllowedLoadData) {
                    await this.fetchData();
                }
            }
        }
    ],
    subscribe: [
        {
            event: Events.UPDATE_DATA,
            handler(e) {
                this.fetchData(true);
            }
        }
    ],
    created() {
        this.dremioVars = [];
        this.vm = createViewModel({ widget: widget(this) });
        this.setSources();
    },
    methods: {
        setSources() {
            const { dremio, dremioAddons } = this.props;
            this.vm.setSources([dremio, ...dremioAddons]);
            this.injectDremioVars();
        },
        /**
         * Injects dremio.query metrics/dimensions/fields in descriptor.vars
         */
        injectDremioVars() {
            const { vars: descriptorVars } = this.descriptor;
            const { dremioVars: dremioVarsOld } = this;
            const dremioVarsNew = this.getDremioVarNames();
            dremioVarsOld.forEach((name) => this.$delete(descriptorVars, name));

            dremioVarsNew.forEach((name) => {
                this.$set(descriptorVars, name, { description: name });
                this.dremioVars.push(name);
            });
        },
        getDremioVarNames() {
            const { dremio, dremioAddons } = this.props;
            const vars = [dremio, ...dremioAddons]
                .filter((item) => item != null)
                .flatMap(({ query, dimensionList }) => [
                    ...Query.queryMetricNames(query),
                    ...Object.keys(dimensionList),
                    ...Query.queryFieldNames(query)
                ]);
            return [...new Set(vars)];
        },
        async fetchData(forceUpdate = false) {
            const { $storeState, vm } = this;

            this.isLoading = true;
            try {
                this.sourcesData = await vm.fetchData($storeState, forceUpdate);
            } finally {
                this.isLoading = false;
                this.isInitLoad = false;
            }
        },
        /**
         * @return {string[]}
         * @public
         */
        getSlotNames() {
            return this.slotNames;
        },
        getStoreValue(key) {
            const { state } = store;
            return key in state ? ValueObject.getValue(state[key]) : undefined;
        }
    },
    implicitCssModule: true
};
</script>
<style lang="less" module src="./style.less"></style>
