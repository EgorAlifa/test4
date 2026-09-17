<template>
    <div class="smart-search-view">
        <div
            class="header-wrapper"
            :class="{
                'header-wrapper_opened': isShowContent,
                'header-wrapper_resized': isShowContent && isResizable
            }"
            @click="showContent"
            @keyup.enter="showContent">
            <w-filter-header
                v-bind="headerBinds"
                @single-dimension-deleted="clearSingleDimension"
                @all-dimensions-deleted="clearAllDimensions"
                @value-entered="emitEnteredValue"
                @smart-search-enter-keyup="selectInputValue"
                @smart-search-dimensions-deleted="clearSmartSearchDimensions"
                @search-value-cleared="onSearchValueCleared"></w-filter-header>
        </div>
        <div
            v-if="isShowContent"
            class="content-wrapper"
            :class="{
                'content-wrapper_resized': isResizable
            }"
            @click="hideContent">
            <slot>
                <code>default slot</code>
            </slot>
        </div>
    </div>
</template>

<script>
import FilterHeader from './FilterHeader.vue';
import { CloseMode } from '../config';

export default {
    components: {
        WFilterHeader: FilterHeader
    },
    props: {
        headerBinds: {
            type: Object,
            default() {
                return null;
            }
        },
        isResizable: {
            type: Boolean,
            default: false
        },
        closingMode: {
            type: String,
            default: ''
        },
        isClickedOutside: {
            type: Boolean,
            default: false
        },
        isOpeningByEnter: {
            type: Boolean,
            default: false
        },
        isSmartSearchGeneralPreview: {
            type: Boolean,
            default: false
        },
        disableContentHiding: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            isShowContent: false,
            searchValue: ''
        };
    },
    watch: {
        isClickedOutside: {
            handler(isClickedOutside) {
                if (isClickedOutside && this.closingMode !== CloseMode.SIMPLE) {
                    this.isShowContent = false;
                }
            }
        }
    },
    methods: {
        clearSingleDimension() {
            this.$emit('single-dimension-cleared');
        },
        clearAllDimensions() {
            this.$emit('all-dimensions-cleared');
        },
        emitEnteredValue(value) {
            this.searchValue = value;
            this.$emit('value-entered', value);
        },
        selectInputValue(val) {
            this.$emit('smart-search-enter-keyup', val);
        },
        clearSmartSearchDimensions() {
            this.isShowContent = false;
            this.searchValue = '';
            this.$emit('smart-dimensions-cleared');
        },
        showContent(event) {
            if (this.closingMode === CloseMode.SIMPLE) {
                return;
            }

            if (this.searchValue === '' && this.isSmartSearchGeneralPreview) {
                return;
            }

            if (event.type === 'keyup' && this.isOpeningByEnter) {
                this.isShowContent = true;
                return;
            }

            if (this.disableContentHiding) {
                this.isShowContent = true;
                return;
            }

            this.isShowContent = !this.isShowContent;
        },
        hideContent() {
            if (this.closingMode === CloseMode.NO_CLICK) {
                return;
            }

            this.isShowContent = false;
        },
        onSearchValueCleared() {
            this.$emit('search-value-cleared');
        }
    },
    implicitCssModule: true
};
</script>

<style module lang="pcss" src="./styles/smartSearchView.pcss"></style>
