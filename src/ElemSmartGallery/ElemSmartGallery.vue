<template>
    <w-elem :placeholder="$placeholder">

        <!-- ── GALLERY MODE (data-driven slot visibility) ─────────────────── -->
        <template v-if="mode === 'gallery'">
            <div class="skeleton-grid" v-if="isLoadingData && isInitLoad && !isDevMode">
                <template v-if="props.isUseSkeleton">
                    <div class="skeleton-grid__item skeleton" v-for="i in props.grid.cols * 2" :key="i"></div>
                </template>
            </div>
            <div class="slots-grid" :class="gridClasses" :style="appearanceStyle" v-else>
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
        </template>

        <!-- ── STACK MODE (event-driven single-slot switching) ─────────────── -->
        <template v-else-if="mode === 'stack'">
            <div class="sg-mode-wrapper" :style="appearanceStyle">
                <!-- .slot-item wrapper keeps CSS selectors consistent with Gallery mode -->
                <div class="slot-item" v-if="hasStackState(activeStackSlot)">
                    <slot :name="activeStackSlot">
                        <div class="slot-item__placeholder" v-if="isEditorMode">
                            <code>{{ activeStackSlot }}</code>
                        </div>
                    </slot>
                </div>
            </div>
        </template>

        <!-- ── CONTAINER MODE (show/hide single slot via events) ───────────── -->
        <template v-else-if="mode === 'container'">
            <div class="sg-mode-wrapper" :style="appearanceStyle">
                <!-- .slot-item wrapper keeps CSS selectors consistent with Gallery mode -->
                <div class="slot-item" v-if="containerVisible">
                    <slot>
                        <div class="slot-item__placeholder" v-if="isEditorMode">default slot</div>
                    </slot>
                </div>
                <div class="slot-item__placeholder" v-else-if="isEditorMode">
                    <code>скрыто</code>
                </div>
            </div>
        </template>

        <!-- custom CSS injection (DesignerPanel) -->
        <component v-if="customCssContent" :is="'style'" v-html="customCssContent" />

    </w-elem>
</template>
<script>
import { Elem, ElemPlaceholderReasonType } from '@goodt-wcore/elem';
import { store, ValueObject } from '@goodt-wcore/managers';
import { widget } from '@goodt-wcore/utils';
import { useElemDatasetBaseMixin, ElemDatasetBaseMixinTypes } from '@goodt-common/data';
import { meta, Vars, Events, DATASET_ADDITIONAL_PROP } from './descriptor';
import { createViewModel } from './models';
import { SlotCondition, SlotConditionType, SlotConditionOperatorMeta, Metric, Mode } from './constants';

const DatasetMixin = useElemDatasetBaseMixin({ panel: { isMultiple: false } });

export default {
    extends: Elem,
    mixins: [DatasetMixin],
    meta,
    static: {
        DATASET_ADDITIONAL_PROP
    },
    data: () => ({
        // режим, который отключает все фильтрации слотов
        isDevMode: false,
        isLoadingData: true,
        isInitLoad: true,
        // eslint-disable-next-line no-restricted-syntax
        sourcesData: [],
        chosenSlotNameToShow: null,
        // stack mode: currently displayed state name
        activeStackSlot: null,
        // container mode: visibility flag
        containerVisible: false,

        /* Vetur HACK */
        ...ElemDatasetBaseMixinTypes
    }),
    computed: {
        /** Active display mode */
        mode() {
            return this.props.mode || Mode.GALLERY;
        },

        /**
         * Inline styles from AppearancePanel props, applied to the inner container.
         * Keeps Elem mixin's own cssStyle on the root w-elem untouched.
         */
        appearanceStyle() {
            const p = this.props;
            const style = {};
            if (p.backgroundColor) style.backgroundColor = p.backgroundColor;
            if (p.textColor)       style.color = p.textColor;
            if (p.borderRadius && p.borderRadius !== '0') style.borderRadius = p.borderRadius;
            if (p.boxShadow)       style.boxShadow = p.boxShadow;
            const opacity = parseFloat(p.opacity);
            if (!isNaN(opacity) && opacity < 1) style.opacity = opacity; // eslint-disable-line no-restricted-globals
            return style;
        },

        /**
         * Custom CSS injected by DesignerPanel.
         * Keys: container, slot, stackSlot.
         * container CSS is applied to both .slots-grid (gallery) and .sg-mode-wrapper
         * (stack/container) so styles work in all modes.
         */
        customCssContent() {
            const styles = this.props.customStyles;
            if (!styles || typeof styles !== 'object') return null;
            const rules = [];
            if (styles.container) {
                rules.push(`.slots-grid { ${styles.container} }`);
                rules.push(`.sg-mode-wrapper { ${styles.container} }`);
            }
            if (styles.slot) {
                rules.push(`.slot-item { ${styles.slot} }`);
            }
            if (styles.stackSlot) {
                rules.push(`.slot-item__placeholder { ${styles.stackSlot} }`);
            }
            return rules.length ? rules.join('\n') : null;
        },

        /**
         * @return {import('./types').Slot[]}
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
            // Правила вычисляются всегда, даже без аддон-данных: условия могут
            // опираться на переменные хранилища без участия датасета.
            // Ранний выход — только когда ни у одного слота нет правил.
            const hasAnyRules = slotsFilteredAndSorted.some(
                ({ rules = [] }) => rules.some((group) => group.length > 0)
            );
            if (addonsData.length === 0 && !hasAnyRules) {
                return mainData == null ? [] : slotsFilteredAndSorted;
            }
            return slotsFilteredAndSorted.filter((slot) => {
                const rules = (slot.rules ?? []).filter((conditions) => conditions.length > 0);
                // правила -> правило1 OR правило2...
                // правило1 -> условие1 AND условие2...
                for (const conditions of rules) {
                    // соберем массив из проверок всех условий
                    const conditionMatches = conditions.map((conditionStr) => {
                        const parsed = SlotCondition.fromString(conditionStr);
                        if (parsed == null) {
                            return false;
                        }
                        const {
                            a: leftValue,
                            b: rightValue,
                            op: operation,
                            type,
                            typeForLeftField
                        } = parsed;
                        const rightTargetValue =
                            type === SlotConditionType.INPUT ? rightValue : this.getStoreValue(rightValue);
                        const operatorMeta = SlotConditionOperatorMeta[operation];
                        if (operatorMeta == null) {
                            return false;
                        }
                        const { resolve } = operatorMeta;
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
        slotNamesToRender() {
            return this.slots.filter(({ show = true }) => show === true).map(({ name }) => name);
        },
        /**
         * @return {string[]?}
         */
        slotNamesToShow() {
            const { chosenSlotNameToShow } = this;
            const names = chosenSlotNameToShow ?? this.$storeState[Vars.SLOT_NAMES];

            if (names == null) {
                return names;
            }

            return [names].flat().map((name) => String(name));
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
    computedEditor: {
        /**
         * @public
         */
        datasetRequests() {
            return [this.props[this.DATASET_PROP][0] ?? null, ...this.props[this.DATASET_ADDITIONAL_PROP]];
        },
        $placeholder() {
            const { props: { slots } } = this;
            return {
                toggle: true,
                show: slots.length === 0,
                content: 'Настройте слоты',
                reason: {
                    type: ElemPlaceholderReasonType.CUSTOM,
                    description:
                        'Добавьте слоты и настройте правила их отображения с помощью источника данных и хранилища',
                    actions: [
                        {
                            title: 'Настроить слоты',
                            icon: 'table-plus',
                            panel: 'SlotsPanel'
                        }
                    ]
                }
            }
        }
    },
    watch: {
        sourcesData() {
            const { isSaveFirstMetricValue } = this.props;
            const [mainData = []] = this.sourcesData;
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
        requests: {
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
                } else {
                    this.sourcesData = [];
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
        this.vm = createViewModel({ widget: widget(this) });
        this.setSources();

        // Stack mode: init active slot, watch prop changes in editor
        if (this.mode === Mode.STACK) {
            this.activeStackSlot = this.props.activeState;
            if (this.isEditorMode) {
                this.$watch('props.activeState', (val) => { this.activeStackSlot = val; });
                this.$watch('props.states', () => this.attachStackEventHandlers(), { deep: true });
            }
        }

        // Container mode: init visibility, watch prop changes in editor
        if (this.mode === Mode.CONTAINER) {
            this.containerVisible = this.props.initShow;
            if (this.isEditorMode) {
                this.$watch('props', () => this.attachContainerEventHandlers(), { deep: true });
            }
        }
    },
    methods: {
        // ── Stack mode ────────────────────────────────────────────────────────
        hasStackState(name) {
            return (this.props.states || []).some((s) => s.name === name);
        },
        attachStackEventHandlers() {
            this.$eventBus.destroy();
            (this.props.states || [])
                .filter((s) => s.event?.length > 0)
                .forEach(({ name, event }) => this.$eventListen(event, () => { this.activeStackSlot = name; }));
        },

        // ── Container mode ────────────────────────────────────────────────────
        attachContainerEventHandlers() {
            const { showMode, eventShowHide, reverseEvent, eventShow, eventHide } = this.props;
            this.$eventBus.destroy();
            if (showMode) {
                this.$eventListen(eventShowHide, (e, val) => {
                    if (typeof val === 'boolean') {
                        this.containerVisible = reverseEvent ? !val : val;
                    }
                });
            } else {
                if (eventShow) this.$eventListen(eventShow, () => { this.containerVisible = true; });
                if (eventHide) this.$eventListen(eventHide, () => { this.containerVisible = false; });
            }
        },

        // ── Elem framework subscribe hook ─────────────────────────────────────
        // Called by Elem after event bus is ready. Handles stack/container events.
        // Gallery UPDATE_DATA event is handled by the subscribe: [...] array above.
        subscribe() {
            if (this.mode === Mode.STACK) {
                this.attachStackEventHandlers();
            } else if (this.mode === Mode.CONTAINER) {
                this.attachContainerEventHandlers();
            }
        },

        setSources() {
            this.vm.setRequests(this.requests);
        },
        async fetchData(forceUpdate = false) {
            const { $storeState, vm } = this;
            this.isLoadingData = true;
            try {
                const changedRequests = this.$storeApplyQueryFilters($storeState);
                this.sourcesData = await vm.fetchData(changedRequests, forceUpdate);
            } catch (error) {
                this.sourcesData = [];
                this.$handleError(error);
            } finally {
                this.isLoadingData = false;
                this.isInitLoad = false;
            }
        },
        getStoreValue(key) {
            // Use the global store (not the filtered $storeState) so that rule
            // conditions can reference ANY store variable without requiring it
            // to be declared in descriptor.vars or awaitVariableModeVariables.
            // Accessing store.state[key] also establishes a Vue reactive
            // dependency, so slots recomputes automatically when the value changes.
            const entry = store.state[key];
            if (entry == null) return null;
            // store entries may be ValueObject instances ({ value }) or plain values
            const value = (entry !== null && typeof entry === 'object' && 'value' in entry)
                ? entry.value
                : entry;
            return value == null ? null : value;
        }
    },
    implicitCssModule: true
};
</script>
<style lang="pcss" module src="./style.pcss"></style>
