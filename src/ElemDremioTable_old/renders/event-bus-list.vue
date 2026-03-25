<template>
    <div :class="cellCssClass" v-on="cellEventHandlers">
        <ui-tooltip v-bind="{ ...tooltipOpts }">
            <template #target="{ events, binds }">
                <div
                    :class="{
                        'w-100': shouldTruncateText.value,
                        'text-truncate': shouldTruncateText.value
                    }"
                    v-bind="binds"
                    v-on="tooltip.enable ? events : {}">
                    <div
                        v-for="(item, i) in value"
                        :key="i"
                        :class="[...item.cssClass(), { 'text-truncate': shouldTruncateText.value }]"
                        :style="item.style()">
                        {{ item.format() }}
                    </div>
                </div>
            </template>
            <div v-if="tooltip.value == null">
                <div v-for="(item, i) in value" :key="i" :style="tooltipStyle">
                    {{ item.format() }}
                </div>
            </div>
            <div v-else :style="tooltipStyle">
                {{ tooltip.value }}
            </div>
        </ui-tooltip>
    </div>
</template>
<script>
import { store as globalStore } from '@goodt-wcore/managers';
import { Tooltip as UiTooltip } from 'goodteditor-ui';
import RenderMixin from './render-mixin';
import { ColumnParamTypeNames } from '../utils/constants';

export default {
    components: { UiTooltip },
    mixins: [RenderMixin],
    props: {
        value: {
            type: Array,
            default: () => []
        },
        useEventCancel: {
            type: Object,
            default: () => ({
                value: true,
                type: ColumnParamTypeNames.BOOLEAN
            })
        },
        eventName: {
            type: [Array, Object],
            default: () => []
        },
        eventValue: {
            type: [Array, Object],
            default: () => []
        },
        url: {
            type: Object,
            default: () => ({})
        },
        urlParamName: {
            type: [Array, Object],
            default: () => []
        },
        urlParamValue: {
            type: [Array, Object],
            default: () => []
        },
        shouldOpenNewTab: {
            type: Object,
            default: () => ({
                value: false,
                type: ColumnParamTypeNames.BOOLEAN
            })
        },
        shouldTruncateText: {
            type: Object,
            default: () => ({
                value: false,
                type: ColumnParamTypeNames.BOOLEAN
            })
        },
        customParamNames: {
            type: Array,
            default: () => []
        },
        customParamValues: {
            type: Array,
            default: () => []
        },
        shouldTriggerVarsBeforeEvents: {
            type: Object,
            default: () => ({
                value: false,
                type: ColumnParamTypeNames.BOOLEAN
            })
        }
    },
    computed: {
        isParentRowSelected() {
            const { $parent } = this;
            if ($parent.$options?.name === 'TableRow') {
                return $parent.isSelected;
            }
            throw new Error('Родителем рендера не является компонент TableRow');
        }
    },
    methods: {
        /** @public */
        clickHandler() {
            if (!this.canRowToggleItself && !this.canCollapseExpandRow) {
                return;
            }
            const {
                useEventCancel: { value: useEventCancel },
                eventName,
                eventValue,
                customParamNames,
                customParamValues,
                $widget
            } = this;
            let eventState = [eventName]
                .flat()
                .filter(({ name }) => name != null)
                .reduce(
                    (obj, { name }, idx) => ({
                        ...obj,
                        [name]:
                            this.isParentRowSelected && useEventCancel === true
                                ? null
                                : eventValue[idx]?.format() ?? null
                    }),
                    {}
                );
            if ($widget.props.isRowMultiselect) {
                eventState = this.convertEventState(eventState);
            }

            if (this.shouldTriggerVarsBeforeEvents.value) {
                this.$storeCommit(eventState);
                this.triggerCustomEvents({ customParamNames, customParamValues });
            } else {
                this.triggerCustomEvents({ customParamNames, customParamValues });
                this.$storeCommit(eventState);
            }

            this.$emit('click');
            this.buildRoute();
        },
        triggerCustomEvents({ customParamNames, customParamValues }) {
            customParamNames.forEach((paramName, idx) => {
                if (paramName.name != null) {
                    const value = customParamValues[idx]?.format() ?? null;
                    this.$eventTrigger(paramName.value, value);
                }
            });
        },
        convertEventState(stateToCommit) {
            const { $widget, eventValue } = this;

            return Object.entries(stateToCommit).reduce((acc, [key, value]) => {
                const stateFieldName = $widget.props.varAliases[key]?.trigger ?? null;
                const { value: stateFieldValue } = globalStore.state[stateFieldName] ?? {};
                const fieldValueFlattened = [stateFieldValue].flat().filter(Boolean);
                const { value: actualValue } = eventValue.find(({ name }) => name === key);

                if (fieldValueFlattened.includes(actualValue)) {
                    const fieldValueFiltered = fieldValueFlattened.filter((item) => item !== actualValue);
                    return { ...acc, [key]: fieldValueFiltered.length === 0 ? null : fieldValueFiltered };
                }

                // eslint-disable-next-line no-restricted-syntax
                return { ...acc, [key]: [...fieldValueFlattened, value] };
            }, {});
        },
        buildRoute() {
            const {
                url: { value: path },
                urlParamName,
                urlParamValue,
                shouldOpenNewTab
            } = this;

            if (path == null) {
                return;
            }

            const query = [urlParamName]
                .flat()
                .filter(({ name }) => name != null)
                .reduce(
                    (obj, { name }, idx) => ({
                        ...obj,
                        [name]: urlParamValue[idx]?.format() ?? null
                    }),
                    {}
                );

            this.navigate({ path, query }, shouldOpenNewTab.value);
        }
    }
};
</script>
