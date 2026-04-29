<template>
    <div class="h-100 w-100 filter-header filter-placeholder">
        <div v-if="parentProps.isSearchMode" class="pos-rel w-100">
            <ui-tooltip v-bind="TooltipOptions">
                <template #tooltip>
                    <div class="tooltip tooltip-wrapper" :style="tooltipStyleCssVars">
                        {{ tooltipTitle }}
                    </div>
                </template>
                <template #target="{ events: tooltipEvents, binds }">
                    <div v-bind="binds" class="search-input-wrapper">
                        <i
                            v-if="parentProps.searchModeInput.prefix"
                            class="mdi search-icon mar-left-5 cursor-pointer"
                            :class="parentProps.searchModeInput.prefix"
                            title="Поиск"
                            @click="onSearchIconClick"></i>
                        <input
                            class="search-input w-100 h-100"
                            :value="inputDimension"
                            :placeholder="searchModePlaceholderText"
                            ref="input"
                            v-on="{
                                ...inputListeners,
                                ...(isTooltipShown && tooltipEvents)
                            }" />
                        <i
                            v-if="(parentProps.isSmartSearch || isMenuVisible) && !isEmpty"
                            @click.stop="clearInput"
                            title="Очистить поиск"
                            class="mdi mdi-close input-icon-delete cursor-pointer"></i>
                        <template>
                            <slot name="input:actions" v-bind="{ clear: clearInput, isEmpty, refreshTooltip }"></slot>
                        </template>
                    </div>
                </template>
            </ui-tooltip>
        </div>
        <div v-else class="info-wrapper h-100 w-100">
            <ui-tooltip v-if="canShowTooltip" v-bind="TooltipOptions">
                <template #tooltip>
                    <div class="tooltip tooltip-wrapper" :style="tooltipStyleCssVars">
                        {{ tooltipTitle }}
                    </div>
                </template>
                <template #target="{ events, binds }">
                    <div
                        v-bind="binds"
                        class="flex-grow text-truncate placeholder"
                        :class="placeholderClass"
                        v-on="isTooltipShown ? events : {}">
                        <div v-if="!parentProps.isMultiMode" class="opacity-80">
                            {{ title }}
                        </div>
                        <div
                            v-else-if="parentProps.isMultiMode && parentProps.isMultiCount"
                            class="d-flex flex-v-center">
                            <div class="opacity-80">
                                {{ placeholderText }}
                            </div>
                            <div class="mar-left-3" v-show="multiSelect.length > 0">
                                <div class="badge">
                                    <span class="multy-count-unit">
                                        {{ multiSelect.length }} {{ parentProps.multiCountTextUnit }}
                                    </span>
                                    <slot name="tooltip:delete"></slot>
                                </div>
                            </div>
                        </div>
                        <div v-else class="dimension-list">
                            <span v-if="parentProps.embeddedSearch.isEnabled && selectedList !== ''">
                                {{ selectedList }}
                            </span>
                            <span v-else-if="isMenuVisible || selectedList === ''">
                                {{ placeholderText }}
                            </span>
                            <span v-else>{{ selectedList }}</span>
                        </div>
                    </div>
                </template>
            </ui-tooltip>
            <div class="d-flex flex-v-center mar-left-1">
                <slot name="input:actions" v-bind="{ clear: clearInput, isEmpty, refreshTooltip }"></slot>
            </div>
        </div>
    </div>
</template>

<script>
import { Tooltip as UiTooltip } from 'goodteditor-ui';
import { useComputedWhenMixin } from '@goodt-wcore/utils';
import { TooltipOptions } from '../config';
import { FilterHeaderInstanceTypes } from './types';

export default {
    components: {
        UiTooltip
    },
    mixins: [useComputedWhenMixin()],
    inject: ['$widget', '$formatCellDataString'],
    props: {
        multiSelect: {
            type: Array,
            default() {
                return [];
            }
        },
        isTooltipShown: {
            type: Boolean,
            default: false
        },
        isMenuVisible: {
            type: Boolean,
            default: false
        },
        selectedList: {
            type: String,
            default: ''
        },
        singleSelect: {
            type: String,
            default: ''
        },
        title: {
            type: String,
            default: ''
        },
        valueDimension: {
            type: [String, Array],
            default: ''
        },
        findDimension: {
            type: String,
            default: ''
        },
        shouldClearEnteredValue: {
            type: Boolean,
            default: false
        },
        selectedDimension: {
            type: Number,
            default: 0
        }
    },
    static: {
        TooltipOptions
    },
    data() {
        return {
            canShowTooltip: true,
            enteredValue: ''
        };
    },
    computedEditor: {
        parentProps() {
            return this.$widget.props;
        },
        /**
         * @return {string}
         */
        searchModePlaceholderText() {
            const { parentProps, selectedDimension } = this;
            const { isMetricTextPlaceholder, placeholder } = parentProps.searchModeInput;
            return isMetricTextPlaceholder ? selectedDimension : placeholder;
        },
        /**
         * @return {string}
         */
        placeholderText() {
            const { multiSelect, selectedDimension, parentProps } = this;
            const { isMetricTextPlaceholder, textPlaceholderMultiCount, textPlaceholder } = parentProps;

            if (isMetricTextPlaceholder) {
                return selectedDimension;
            }
            if (multiSelect.length > 0) {
                return textPlaceholderMultiCount.text;
            }

            return textPlaceholder;
        },
        /**
         * @return {boolean}
         */
        isQuickInput() {
            const { isSmartSearch, isQuickInput } = this.parentProps;
            return !isSmartSearch || (isSmartSearch && isQuickInput);
        }
    },
    computed: {
        tooltipTitle() {
            const {
                parentProps: { isMultiMode },
                selectedList,
                singleSelect
            } = this;
            return isMultiMode ? selectedList : singleSelect;
        },
        tooltipStyleCssVars() {
            const { tooltip } = this.parentProps;
            return this.$widget.buildCssVarsStyle(
                {
                    'tooltip_font-family': 'tooltip.fontFamily',
                    'tooltip_font-weight': 'tooltip.fontWeight',
                    'tooltip_font-size': ['tooltip.fontSize', 'var(--font-size-smaller)'],
                    // eslint-disable-next-line no-restricted-syntax
                    tooltip_color: ['tooltip.color', 'var(--color-white)'],
                    // eslint-disable-next-line no-restricted-syntax
                    tooltip_background: ['tooltip.background', 'var(--color-body)']
                },
                { tooltip }
            );
        },
        isEmpty() {
            return this.enteredValue === '';
        },
        placeholderClass() {
            const {
                parentProps: { isMultiCount },
                multiSelect
            } = this;
            return {
                multiselect: isMultiCount && multiSelect.length > 0
            };
        },
        inputDimension: {
            get() {
                const { isSmartSearch, isListeningVar, isMultiMode, embeddedSearch, isSearchMode } = this.parentProps;
                const { singleSelect, valueDimension, enteredValue, isMenuVisible, selectedList } = this;

                if (isSmartSearch && isListeningVar) {
                    return valueDimension;
                }

                if (isSmartSearch || (isSearchMode && isMenuVisible)) {
                    return enteredValue;
                }

                const isEmbeddedSearch = !isSearchMode && embeddedSearch.isEnabled;
                if (isMultiMode || isEmbeddedSearch) {
                    return selectedList;
                }

                return singleSelect;
            },
            set(enteredValue) {
                this.enteredValue = enteredValue;
                this.emitEnteredValue(this.enteredValue);
            }
        },
        inputListeners() {
            const {
                isQuickInput,
                parentProps: { isSmartSearch }
            } = this;
            const stop = (event) => event.stopPropagation();
            return {
                click: this.onInputClick,
                focus: this.onInputFocus,
                keyup: stop,
                keydown: stop,
                [isQuickInput ? 'input' : 'change']: ({ target: { value } }) => {
                    this.inputDimension = value;
                },
                ...(isQuickInput && { paste: this.onInputPaste }),
                ...(isSmartSearch && {
                    keyup: (event) => {
                        stop(event);
                        if (event.key === 'Enter') {
                            this.onSmartSearchEnterKeyup(event);
                        }
                    }
                })
            };
        }
    },
    watch: {
        findDimension(findDimension) {
            if (!this.parentProps.isSmartSearch && findDimension === '' && this.enteredValue !== '') {
                this.clearInput();
            }
        },
        shouldClearEnteredValue: {
            handler(shouldClear) {
                const { shouldClearSearchValueOnFetchDataEvent } = this.parentProps;

                if (shouldClear && shouldClearSearchValueOnFetchDataEvent) {
                    this.clearInput();
                    this.$emit('search-value-cleared');
                }
            }
        }
    },
    methods: {
        ...FilterHeaderInstanceTypes,
        refreshTooltip() {
            this.canShowTooltip = false;
            this.$nextTick(() => {
                this.canShowTooltip = true;
            });
        },
        emitEnteredValue(value = '') {
            this.$emit('value-entered', value);
        },
        clearInput() {
            this.enteredValue = '';
            this.emitEnteredValue(this.enteredValue);
        },
        onSmartSearchEnterKeyup(val) {
            this.$emit('smart-search-enter-keyup', val);
        },
        onInputClick(event) {
            if (this.isMenuVisible) {
                if (this.isEmpty) {
                    this.$refs.input.blur();
                    return;
                }
                event.stopImmediatePropagation();
                return;
            }
            this.$refs.input.focus();
        },
        onInputFocus() {
            this.emitEnteredValue(this.enteredValue);
        },
        /**
         * @param {ClipboardEvent} event
         */
        onInputPaste(event) {
            event.preventDefault();
            const pasteData = event.clipboardData.getData('text/plain');
            this.inputDimension = this.$formatCellDataString(pasteData);
        },
        onSearchIconClick(event) {
            this.$refs.input.focus();
            if (this.isMenuVisible) {
                event.stopImmediatePropagation();
            }
        }
    },
    implicitCssModule: true
};
</script>
<style module src="../styles/style.module.pcss" lang="pcss"></style>
