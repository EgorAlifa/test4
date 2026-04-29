<template>
    <div class="smart-search-view">
        <div class="header-wrapper" :class="resolveHeaderClasses" @click="showContent" @keyup.enter="showContent">
            <w-filter-header
                v-bind="headerBinds"
                @value-entered="emitEnteredValue"
                @smart-search-enter-keyup="selectInputValue"
                @search-value-cleared="onSearchValueCleared">
                <template #input:actions="binds">
                    <slot name="input:actions" v-bind="{ ...binds, clearSmartSearchDimensions }"></slot>
                    <i
                        :class="isShowContent ? 'rotate-up' : 'rotate-down'"
                        class="mdi mdi-menu-down chevron-filter chevron-animation cursor-pointer"></i>
                </template>
                <template #tooltip:delete>
                    <slot name="tooltip:delete"></slot>
                </template>
            </w-filter-header>
        </div>
        <div
            v-if="isShowContent || $slots.default == null"
            class="content-wrapper"
            data-slot="default"
            :class="resolveContentClasses"
            @click="hideContent">
            <slot>
                <div :class="slot.slot">Слот для виджета "Умного поиска"</div>
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
        shouldDisableContentHiding: {
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
    computed: {
        resolveHeaderClasses() {
            const { isShowContent, isResizable } = this;
            return {
                'header-wrapper_opened': isShowContent,
                'header-wrapper_resized': isShowContent && isResizable
            };
        },
        resolveContentClasses() {
            const { isResizable } = this;
            return {
                'content-wrapper_resized': isResizable
            };
        }
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

            if (this.shouldDisableContentHiding) {
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
<style module src="../styles/style.module.pcss" lang="pcss"></style>
<style module="slot" lang="pcss">
.slot {
    composes: d-flex w-100 pad-v-3 flex-v-center flex-h-center from global;
    border: 1px solid var(--color-muted);
    opacity: 0.4;
    transition: opacity 0.5s;
    background: url("data:image/svg+xml;charset=utf-8,%3Csvg width='8' height='8' viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M5 0h1L0 6V5zm1 5v1H5z' fill='%239C92AC' fill-rule='evenodd'/%3E%3C/svg%3E");

    &:hover {
        opacity: 0.65;
        cursor: copy;
        border: 1px solid var(--color-green);
    }
}
</style>
