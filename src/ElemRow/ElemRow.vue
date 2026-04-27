<template>
    <w-elem @click="onClick">
        <div class="tr" :class="rowCssClass" :style="rowCssStyle">
            <slot><code v-if="isEditorMode">Data slot</code></slot>
        </div>
        <div v-if="isSelectedRow" data-slot="sub-row">
            <slot name="sub-row"><code v-if="isEditorMode">Sub-row slot</code></slot>
        </div>
    </w-elem>
</template>
<script>
import { Elem } from '@goodt-wcore/core';

import { useTableRow, useActions, useStyleConditions, resolveNavigateQueryParams } from '@goodt-widgets-insight/table-common';
import { meta } from './descriptor';
import { ElemInstanceTypeDescriptor } from './types';

export default {
    extends: Elem,
    mixins: [useTableRow(), useActions(), useStyleConditions()],
    meta,
    data: () => ({
        /* Vetur HACK for type hinting */
        ...ElemInstanceTypeDescriptor
    }),
    computed: {
        /**
         * @return {boolean}
         */
        isBorderDisplayed() {
            // eslint-disable-next-line goodt-rules/no-long-prop-chains
            return this.props.border.isDisplayed;
        },
        /**
         * @return {Record<string, boolean>}
         */
        rowCssClass() {
            const { isSelectedRow, isBorderDisplayed, hasActiveActions, cssClassConditional } = this;
            return {
                selected: isSelectedRow,
                'has-border': isBorderDisplayed,
                'cursor-pointer': hasActiveActions,
                ...cssClassConditional
            };
        },
        /**
         * @return {Record<string, string>}
         */
        rowCssStyle() {
            return this.cssStyleConditional;
        }
    },
    mounted() {
        this.$el.addEventListener('actions-send', this.onActionsSend);
    },
    beforeDestroy() {
        this.$el.removeEventListener('actions-send', this.onActionsSend);
    },
    methods: {
        onClick() {
            const { rowData, props } = this;
            const { isEventBubbles, canSelectRow } = props;

            if (isEventBubbles === true) {
                return;
            }
            const actions = this.createActions({ link: { query: this.buildNavigateQueryParams() } });

            if (canSelectRow && rowData != null) {
                this.setSelectedRow(rowData);
            }

            this.runActions(actions);
        },

        buildNavigateQueryParams() {
            const { urlFilters } = this.props;

            return resolveNavigateQueryParams({ urlFilters });
        },
        /**
         * @param {CustomEvent} event
         */
        onActionsSend(event) {
            event.stopPropagation();

            const { rowData, props } = this;
            const { isEventBubbles } = props;
            const { shouldSelectRow, actions, shouldMergeActions } = event.detail;

            if (isEventBubbles === false && shouldMergeActions === true) {
                return;
            }

            const newActions = shouldMergeActions ? this.createActions(actions) : actions;

            if (newActions.link) {
                newActions.link.query = { ...newActions.link.query, ...this.buildNavigateQueryParams() };
            }
            /*
             * из строки сначала сажаем выбранную строку, потом
             * посылаем сформированные заранее экшены
             */
            if (shouldSelectRow || props.canSelectRow) {
                this.setSelectedRow(rowData);
            }

            this.runActions(newActions);
        }
    }
};
</script>
<style lang="pcss" scoped src="./style.pcss"></style>
