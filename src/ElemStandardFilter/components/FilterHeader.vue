<template>
    <div class="h-100 w-100 filter-header">
        <div v-if="parentProps.isSearchMode" class="pos-rel">
            <ui-tooltip v-bind="{ ...tooltipOptions }">
                <template #target="{ events, binds }">
                    <div v-bind="binds" class="search-input-wrapper">
                        <i
                            v-if="parentProps.searchModeInput.prefix"
                            class="mdi search-icon mar-left-5"
                            @click="onSearchIconClick"
                            :class="parentProps.searchModeInput.prefix"></i>
                        <input
                            v-if="isQuickInput"
                            ref="input"
                            v-model="inputDimension"
                            type="text"
                            v-on="isTooltipShown ? events : {}"
                            @keyup.enter="onSmartSearchEnterKeyup"
                            @click="onInputClick"
                            class="search-input w-100 h-100"
                            :placeholder="parentProps.searchModeInput.placeholder" />
                        <input
                            v-else
                            ref="input"
                            v-model.lazy="inputDimension"
                            type="text"
                            v-on="isTooltipShown ? events : {}"
                            class="search-input w-100 h-100"
                            @keyup.enter="onSmartSearchEnterKeyup"
                            @click="onInputClick"
                            :placeholder="parentProps.searchModeInput.placeholder" />
                        <i
                            v-if="isMenuVisible && !parentProps.isSmartSearch && inputDimension !== ''"
                            @click.stop="clearInput"
                            class="mdi mdi-close input-icon-delete cursor-pointer"></i>
                        <template v-if="inputDimension === '' || !isMenuVisible">
                            <i
                                v-if="isDeleteSingleDimBtnShown"
                                @click.stop="deleteSingleDimension"
                                class="mdi mdi-close input-icon-delete cursor-pointer"></i>
                            <i
                                v-if="isDeleteAllDimsBtnShown"
                                @click.stop="deleteAllDimensions"
                                class="mdi mdi-close input-icon-delete cursor-pointer"></i>
                            <i
                                v-if="isDeleteSmartSearchDims"
                                @click.stop="deleteSmartSearchDimensions"
                                class="mdi mdi-close input-icon-delete cursor-pointer"></i>
                        </template>
                    </div>
                </template>
                <div>{{ parentProps.multiMode ? selectedList : singleSelect }}</div>
            </ui-tooltip>
        </div>
        <div v-else class="info-wrapper h-100 w-100 filter-placeholder">
            <ui-tooltip v-if="canShowTooltip" v-bind="{ ...tooltipOptions }">
                <template #target="{ events, binds }">
                    <div
                        v-bind="binds"
                        class="flex-grow noscroll placeholder"
                        :class="placeholderClass"
                        v-on="isTooltipShown ? events : {}">
                        <div v-if="!parentProps.multiMode" class="opacity-80">
                            {{ title }}
                        </div>
                        <div v-else-if="parentProps.multiMode && parentProps.multiCount" class="d-flex flex-v-center">
                            <div class="opacity-80">
                                {{
                                    multiSelect.length > 0
                                        ? parentProps.textPlaceholderMultiCount.textPlaceholder
                                        : parentProps.textPlaceholder
                                }}:
                            </div>
                            <div class="mar-left-3" v-show="multiSelect.length > 0">
                                <div class="badge text-small mar-none flex-center flex-nowrap">
                                    <span class="mar-2 multy-count-unit">
                                        {{ multiSelect.length }} {{ parentProps.textUnit }}
                                    </span>
                                    <div ref="closeIcon" class="btn btn-inline mar-2" @click="deleteAllDimensions">
                                        &times;
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div v-else class="dimension-list">
                            <span v-if="isMenuVisible || !selectedList">
                                {{ parentProps.textPlaceholder }}
                            </span>
                            <span v-else>{{ selectedList }}</span>
                        </div>
                    </div>
                </template>
                <div>{{ parentProps.multiMode ? selectedList : singleSelect }}</div>
            </ui-tooltip>
            <div class="d-flex flex-v-center mar-left-1">
                <i
                    v-if="isDeleteSingleDimBtnShown"
                    @click.stop="deleteSingleDimension"
                    class="mdi mdi-close cursor-pointer icon-delete"></i>
                <i
                    v-if="isDeleteAllDimsBtnShown"
                    @click.stop="deleteAllDimensions"
                    class="mdi mdi-close cursor-pointer icon-delete"></i>
                <i
                    :class="isMenuVisible ? 'rotate-up' : 'rotate-down'"
                    class="mdi mdi-menu-down chevron-filter chevron-animation"></i>
            </div>
        </div>
    </div>
</template>

<script>
import { Tooltip as UiTooltip } from 'goodteditor-ui';

export default {
    components: {
        UiTooltip
    },
    inject: ['$widget'],
    props: {
        parentProps: {
            type: Object,
            default() {
                return null;
            }
        },
        tooltipOptions: {
            type: Object,
            default() {
                return null;
            }
        },
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
        isDeleteSingleDimBtnShown: {
            type: Boolean,
            default: false
        },
        isDeleteAllDimsBtnShown: {
            type: Boolean,
            default: false
        },
        isDeleteSmartSearchDims: {
            type: Boolean,
            default: false
        },
        title: {
            type: String,
            default: ''
        },
        valueDimension: {
            type: [String, Array],
            default: ''
        },
        shouldClearEnteredValue: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            canShowTooltip: true,
            enteredValue: ''
        };
    },
    computed: {
        placeholderClass() {
            const {
                parentProps: { multiCount },
                multiSelect
            } = this;
            return {
                multiselect: multiCount && multiSelect.length > 0
            };
        },
        inputDimension: {
            get() {
                const { isSmartSearch, isListeningVar } = this.parentProps;

                if (isSmartSearch && isListeningVar) {
                    return this.valueDimension;
                }

                if (isSmartSearch || this.isMenuVisible) {
                    return this.enteredValue;
                }

                if (this.selectedList === '') {
                    return this.singleSelect || '';
                }

                return this.selectedList;
            },
            set(val) {
                this.enteredValue = val;
                this.emitEnteredValue(this.enteredValue);
            }
        },
        isQuickInput() {
            return !this.parentProps.isSmartSearch || (this.parentProps.isSmartSearch && this.parentProps.isQuickInput);
        }
    },
    watch: {
        shouldClearEnteredValue: {
            handler(value) {
                const { props } = this.$widget;

                if (value && props.shouldClearEnteredValueAfterHardReloadEvent) {
                    this.inputDimension = '';
                    this.$emit('search-value-cleared');
                }
            }
        }
    },
    methods: {
        deleteSingleDimension() {
            this.$emit('single-dimension-deleted');
        },
        deleteAllDimensions() {
            this.canShowTooltip = false;
            this.$nextTick(() => {
                this.canShowTooltip = true;
            });

            this.$emit('all-dimensions-deleted');
        },
        deleteSmartSearchDimensions() {
            this.enteredValue = '';
            this.$emit('smart-search-dimensions-deleted');
        },
        emitEnteredValue(val) {
            this.$emit('value-entered', val);
        },
        clearInput() {
            this.enteredValue = '';
            this.emitEnteredValue(this.enteredValue);
        },
        onSmartSearchEnterKeyup(val) {
            if (this.parentProps.isSmartSearch) {
                this.$emit('smart-search-enter-keyup', val);
            }
        },
        onInputClick() {
            if (this.isMenuVisible) {
                this.$refs.input.blur();
            }
        },
        onSearchIconClick() {
            if (!this.isMenuVisible) {
                this.$refs.input.focus();
            }
        }
    },
    implicitCssModule: true
};
</script>

<style module lang="pcss" src="./styles/headerStyle.pcss"></style>
