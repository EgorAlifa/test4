<template>
    <div :class="cellCssClass" v-on="cellEventHandlers">
        <ui-tooltip v-bind="{ ...tooltipOpts }">
            <template #target="{ events, binds }">
                <div
                    :class="{
                        'w-100 text-truncate': shouldTruncateText.value
                    }"
                    class="d-flex flex-v-center"
                    v-bind="binds"
                    v-on="tooltip.enable ? events : {}">
                    <div class="icon mar-right-l1">
                        <i class="mdi" :class="iconClass" :style="icons.style()"></i>
                    </div>
                    <div
                        :class="{
                            'text-truncate': shouldTruncateText.value
                        }">
                        <span :class="value.cssClass()" :style="value.style()">{{ value.format() }}</span>
                    </div>
                </div>
                <div v-if="tags.length > 0" class="row row-gap-2">
                    <div class="col col-vmid col-auto" v-for="(tag, idx) in tags" :key="idx">
                        <div class="badge" :class="additionalValue.cssClass()" :style="additionalValue.style()">
                            {{ tag }}
                        </div>
                    </div>
                </div>
            </template>
            <div :style="tooltipStyle">{{ tooltipValue }}</div>
        </ui-tooltip>
    </div>
</template>

<script>
import { Tooltip as UiTooltip } from 'goodteditor-ui';
import RenderMixin from './render-mixin';
import { buildQueryFromUrlParam } from '../utils/utils';
import { ColumnParamTypeNames } from '../utils/constants';

export default {
    components: { UiTooltip },
    mixins: [RenderMixin],
    inject: ['getAllSelectedRows'],
    props: {
        value: {
            type: Object,
            default: () => ({})
        },
        additionalValue: {
            type: Object,
            default: () => ({})
        },
        url: {
            type: Object,
            default: () => ({})
        },
        urlParamName: {
            type: Object,
            default: () => ({})
        },
        urlParamValue: {
            type: Object,
            default: () => ({})
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
                value: true,
                type: ColumnParamTypeNames.BOOLEAN
            })
        },
        eventName: {
            type: Object,
            default: () => ({})
        },
        eventValue: {
            type: Object,
            default: () => ({})
        },
        icons: {
            type: Object,
            default: () => ({})
        }
    },
    computed: {
        tooltipValue() {
            const { tooltip, value } = this;
            return tooltip.value == null ? value.format() : tooltip.value;
        },
        isParentRowSelected() {
            const { $parent } = this;
            if ($parent.$options?.name === 'TableRow') {
                return $parent.isSelected;
            }
            throw new Error('Родителем рендера не является компонент TableRow');
        },
        iconClass() {
            const obj = {};
            let [openIcon, closeIcon] = ['mdi-menu-down', 'mdi-menu-right'];
            const { value } = this.icons;
            if (value != null) {
                [openIcon, closeIcon] = value.includes(',') ? value.split(',') : [value, value];
            }
            obj[this.isParentRowSelected ? openIcon : closeIcon] = true;
            return obj;
        },
        tags() {
            const value = this.additionalValue.format();

            if (value == null) {
                return [];
            }

            return value.trim() === '' ? [] : value.split(',');
        }
    },
    beforeDestroy() {
        const { $widget, eventName } = this;
        if ($widget.props.isRowMultiselect) {
            this.$storeCommit(this.buildEventState([eventName.name]));
        }
    },
    methods: {
        /** @public */
        clickHandler() {
            if (!this.canRowToggleItself && !this.canCollapseExpandRow) {
                return;
            }

            const {
                url: { value: path },
                urlParamName,
                urlParamValue,
                shouldOpenNewTab,
                eventName,
                eventValue,
                $widget
            } = this;
            let eventState = {};
            if (eventName.name != null) {
                eventState[eventName.name] = this.isParentRowSelected ? null : eventValue.format();
            }
            this.$emit('click');

            if ($widget.props.isRowMultiselect) {
                eventState = this.buildEventState(Object.keys(eventState));
            }

            this.$storeCommit(eventState);
            if (path == null) {
                return;
            }

            const query = buildQueryFromUrlParam(urlParamName, urlParamValue);

            this.navigate({ path, query }, shouldOpenNewTab.value);
        },
        buildEventState(keys) {
            const { getAllSelectedRows } = this;
            const rows = [...(getAllSelectedRows() ?? [])];
            return keys.reduce((acc, key) => {
                const values = rows.map((row) => row[key]);
                return {
                    ...acc,
                    [key]: values.length > 0 ? values : null
                };
            }, {});
        }
    }
};
</script>
