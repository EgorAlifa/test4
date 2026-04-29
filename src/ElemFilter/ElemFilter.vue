<template>
    <w-elem :placeholder="$placeholder" class="filter-root">
        <div v-if="!props.isSmartSearch" class="w-100 h-100 pos-rel">
            <div
                class="filter-wrapper"
                :class="{
                    'filter-wrapper--opened': isFiltersShown,
                    'filter-wrapper--opened-no-search': isFiltersShown && !props.isSearchMode
                }"
                v-on="{
                    ...(props.isShowMenuByCursor &&
                        !props.isMenuAlwaysOpen && {
                            mouseenter: toggleMenuByCursor,
                            mouseleave: toggleMenuByCursor
                        })
                }">
                <!--INFO_DIV-->
                <div class="w-100" @click="toggleMenu">
                    <w-filter-header
                        v-bind="headerBinds"
                        @value-entered="resolveSearchValue"
                        @smart-search-enter-keyup="triggerSelectEvent"
                        @search-value-cleared="shouldClearEnteredValue = false">
                        <template #input:actions="{ clear, refreshTooltip, isEmpty }">
                            <i
                                v-if="isDeleteSingleDimBtnShown && isEmpty"
                                :title="props.btnClear.text"
                                @click.stop="deleteSingleDimension"
                                class="mdi mdi-close input-icon-delete cursor-pointer"></i>
                            <i
                                v-if="isDeleteAllDimsBtnShown && isEmpty"
                                :title="props.btnClear.text"
                                @click.stop="
                                    () => {
                                        deleteAllDimensions();
                                        clear();
                                        refreshTooltip();
                                    }
                                "
                                class="mdi mdi-close input-icon-delete cursor-pointer"></i>
                            <i
                                :class="isMenuVisible ? 'rotate-up' : 'rotate-down'"
                                :title="isMenuVisible ? 'Свернуть' : 'Развернуть'"
                                class="mdi mdi-menu-down chevron-filter chevron-animation cursor-pointer"
                                @click.stop="
                                    () => {
                                        isMenuVisible = !isMenuVisible;
                                    }
                                "></i>
                        </template>
                        <template #tooltip:delete>
                            <div ref="closeIcon" class="btn btn-inline" @click="deleteAllDimensions">&times;</div>
                        </template>
                    </w-filter-header>
                </div>

                <!--HIDDEN_CONTENT-->
                <div v-if="isFiltersShown" class="menu-wrapper">
                    <!--SORT-->
                    <div v-if="props.sort.isEnabled" class="sort-wrapper">
                        <div class="sort-title">Сортировка</div>
                        <div class="sort-buttons">
                            <button
                                class="sort-button"
                                :class="resolveSortButtonClasses(QuerySortDirection.ASC)"
                                @click="onSortClick(QuerySortDirection.ASC)">
                                Ая
                            </button>
                            <button
                                class="sort-button"
                                :class="resolveSortButtonClasses(QuerySortDirection.DESC)"
                                @click="onSortClick(QuerySortDirection.DESC)">
                                Яа
                            </button>
                        </div>
                    </div>
                    <!--SORT-->

                    <!--TAGS-->
                    <div v-if="shouldShowTags" class="tags-wrapper">
                        <div class="tags">
                            <div v-for="(tag, index) in multiSelect" :key="tag.name" class="tags__tag">
                                <span class="text-truncate" :title="tag.name">{{ tag.name }}</span>
                                <div class="btn btn-inline mar-left-2" @click.stop="deleteDimension(tag, index)">
                                    &times;
                                </div>
                            </div>
                        </div>
                    </div>
                    <!--TAGS-->

                    <!--EMBEDDED SEARCH INPUT-->
                    <div v-if="embeddedSearch.isEnabled" class="search">
                        <i
                            v-if="embeddedSearch.prefix"
                            class="mdi search-icon mar-left-3 cursor-pointer"
                            :class="embeddedSearch.prefix"
                            @click="$refs.embeddedSearch.focus()"></i>
                        <input
                            :value="findDimension"
                            type="text"
                            class="search__input"
                            :placeholder="embeddedSearch.placeholder"
                            ref="embeddedSearch"
                            @keyup.stop
                            @keydown.stop
                            @paste.prevent="onEmbeddedSearchPaste"
                            @input="({ target: { value } }) => resolveSearchValue(value)" />
                        <i
                            v-if="embeddedSearch.isClearIcon"
                            class="search__icon input-icon-delete"
                            @click.stop="clearEmbeddedSearch"></i>
                    </div>
                    <!--INPUT-->

                    <!--SINGLE_LIST-->
                    <ui-dynamic-scroller
                        v-if="isSingleListShown"
                        :items="filteredList"
                        :min-item-size="40"
                        key-field="index"
                        class="h-100">
                        <template #default="{ item, index, active }">
                            <ui-dynamic-scroller-item
                                v-if="!props.isMultiMode"
                                :ref="index"
                                class="cursor-pointer"
                                :item="item"
                                :active="active"
                                :size-dependencies="[item.name]"
                                :data-index="index">
                                <div
                                    class="item-wrapper"
                                    :class="{ disabled: item.disabled }"
                                    v-if="!props.shouldShowRadioButton"
                                    @click="selectSingleDimension(item.name, item.metric, item)">
                                    <span class="option" :class="resolveOptionClasses(item.name)">
                                        {{ item.name }}
                                    </span>

                                    <div v-if="resolveShouldShowMetric(item.metric)" class="metric-wrapper">
                                        <span class="metric">{{ formatMetric(item.metric) }}</span>
                                    </div>
                                </div>

                                <div v-else>
                                    <div class="item-wrapper" :class="{ disabled: item.disabled }">
                                        <label class="cursor-pointer">
                                            <input
                                                class="custom-radio__input"
                                                type="radio"
                                                v-model="singleSelect"
                                                :value="item.name"
                                                :disabled="item.disabled"
                                                @change="selectSingleDimension(singleSelect, item.metric, item)" />
                                            <span class="custom-radio__label" :class="resolveOptionClasses(item.name)">
                                                {{ item.name }}
                                            </span>
                                        </label>
                                        <div v-if="resolveShouldShowMetric(item.metric)" class="metric-wrapper">
                                            <span class="metric">{{ formatMetric(item.metric) }}</span>
                                        </div>
                                    </div>
                                </div>
                            </ui-dynamic-scroller-item>
                        </template>
                    </ui-dynamic-scroller>

                    <!--MULTI_LIST-->
                    <div v-else-if="isMultiSelect" class="multi-list-wrapper" :class="multiListClasses">
                        <div v-if="shouldShowTopButtons" class="button-wrapper" :style="buttonIconStyle">
                            <button
                                v-if="props.shouldShowBtnSelectAll"
                                class="button-wrapper__btn-all"
                                :class="buttonsInfo.btnSelectAll.classes"
                                :style="buttonsInfo.btnSelectAll.style"
                                @click="selectAllDimensions">
                                <i
                                    v-if="buttonsInfo.btnSelectAll.iconIsUsed"
                                    class="mdi button-wrapper__btn-all-icon"
                                    :class="buttonsInfo.btnSelectAll.icon.class"></i>
                                {{ buttonsInfo.btnSelectAll.text }}
                            </button>

                            <button
                                v-if="buttonsInfo.btnPasteFromClipboard.isShown"
                                class="button-wrapper__btn-paste-from-clipboard"
                                :class="buttonsInfo.btnPasteFromClipboard.classes"
                                :style="buttonsInfo.btnPasteFromClipboard.style"
                                @click="selectDimensionsFromClipboard">
                                <i
                                    v-if="buttonsInfo.btnPasteFromClipboard.iconIsUsed"
                                    class="mdi button-wrapper__btn-paste-from-clipboard-icon"
                                    :class="buttonsInfo.btnPasteFromClipboard.icon.class"></i>
                                {{ buttonsInfo.btnPasteFromClipboard.text }}
                            </button>

                            <button
                                v-if="buttonsInfo.btnClear.isShown !== false"
                                class="button-wrapper__btn-clear"
                                :class="buttonsInfo.btnClear.classes"
                                :style="buttonsInfo.btnClear.style"
                                @click="deleteAllDimensions">
                                <i
                                    v-if="buttonsInfo.btnClear.iconIsUsed"
                                    class="mdi button-wrapper__btn-clear-icon"
                                    :class="buttonsInfo.btnClear.icon.class"></i>
                                {{ buttonsInfo.btnClear.text }}
                            </button>
                        </div>

                        <transition-group name="flip-list" tag="ul" class="multi-list">
                            <li
                                v-for="item of filteredList"
                                :key="item.index"
                                class="multi-list__element"
                                @click="changeSelect(item)">
                                <div class="item-wrapper w-100" :class="{ disabled: item.disabled }">
                                    <div class="d-flex items-center">
                                        <label>
                                            <input
                                                type="checkbox"
                                                class="checkbox checkbox-item"
                                                :checked="item.selected"
                                                :disabled="item.disabled" />
                                        </label>

                                        <a class="multi-list__link">{{ item.name }}</a>
                                    </div>

                                    <div v-if="props.isMetricDisplayed && item.metric" class="metric-wrapper">
                                        <span class="metric">{{ formatMetric(item.metric) }}</span>
                                    </div>
                                </div>
                            </li>
                        </transition-group>
                    </div>

                    <div class="preloader pad-4 color-primary pos-abs pos-center" v-if="isLoading"></div>

                    <w-pagination
                        v-if="pages > 1 && props.paginationOptions.isEnable"
                        v-bind="{ page, pages, numItems: props.paginationOptions.numItems }"
                        @select="loadDataPage"></w-pagination>

                    <div v-if="shouldShowBottomButtons" class="button-wrapper" :style="buttonIconStyle">
                        <button
                            v-if="buttonsInfo.btnCancel.isShown !== false && isApplyMode"
                            class="button-wrapper__btn-cancel"
                            :class="buttonsInfo.btnCancel.classes"
                            :style="buttonsInfo.btnCancel.style"
                            :disabled="!isMultiSelectHasChanges && !applyMode.shouldCommitOnCancel"
                            @click="onBtnCancelClick">
                            <i
                                v-if="buttonsInfo.btnCancel.iconIsUsed"
                                class="mdi button-wrapper__btn-cancel-icon"
                                :class="props.btnCancel.icon.class"></i>
                            {{ props.btnCancel.text }}
                        </button>

                        <button
                            v-if="isApplyMode"
                            class="button-wrapper__btn-do"
                            :class="buttonsInfo.btnDo.classes"
                            :style="buttonsInfo.btnDo.style"
                            :disabled="!isMultiSelectHasChanges || applyMode.shouldCommitOnCancel"
                            @click="onBtnDoClick">
                            <i
                                v-if="buttonsInfo.btnDo.iconIsUsed"
                                class="mdi button-wrapper__btn-do-icon"
                                :class="props.btnDo.icon.class"></i>
                            {{ props.btnDo.text }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div v-else class="smart-search">
            <w-smart-search-view
                v-bind="{
                    headerBinds,
                    isResizable: props.isResizable,
                    closingMode: props.closingMode,
                    isClickedOutside,
                    isOpeningByEnter: props.isOpeningByEnter,
                    isSmartSearchGeneralPreview: props.isSmartSearchGeneralPreview,
                    shouldDisableContentHiding: props.shouldDisableContentHiding
                }"
                @value-entered="resolveSmartSearchValue"
                @smart-search-enter-keyup="triggerSelectEvent"
                @search-value-cleared="shouldClearEnteredValue = false">
                <!-- DEFAULT WIDGET SLOT -->
                <template #default>
                    <slot></slot>
                </template>
                <template #input:actions="{ clearSmartSearchDimensions, clear, isEmpty }">
                    <i
                        v-if="valueDimension.length > 0 && isEmpty"
                        :title="props.btnClear.text"
                        @click.stop="
                            () => {
                                clearStore();
                                clear();
                                clearSmartSearchDimensions();
                            }
                        "
                        class="mdi mdi-close input-icon-delete cursor-pointer"></i>
                </template>
                <template #tooltip:delete>
                    <div ref="closeIcon" class="btn btn-inline" @click="deleteAllDimensions">&times;</div>
                </template>
            </w-smart-search-view>
        </div>
    </w-elem>
</template>

<style module src="./styles/style.module.pcss" lang="pcss"></style>
<style scoped src="./styles/style.css"></style>
<style src="vue-virtual-scroller/dist/vue-virtual-scroller.css"></style>

<script>
import { Elem } from '@goodt-wcore/elem';
import {
    get as _get,
    cloneDeep,
    isEqual,
    truncate as _truncate,
    kebabCase,
    omit,
    pick,
    debounce,
    uniqBy
} from 'lodash';
import { useElemDatasetBaseMixin } from '@goodt-common/data';
import { useNavigate } from '@goodt-wcore/utils';
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller';
import { formatNumber } from '@goodt-widgets-insight/utils';
import { meta, Vars } from './descriptor';
import { FilterHeader, SmartSearchView, Pagination } from './components';
import {
    DatasetFieldTypes,
    NonExistentValues,
    Buttons,
    STRING_LIST_DELIMITER,
    EXCEL_PASTE_DELIMITER_RE
} from './config';
import { TOGGLE_MENU_DELAY, EMPTY_FIELD_URL } from './constants';
import {
    buildCssStyle,
    composeSearchFilterLikeValue,
    resolvePreviousSelected,
    normalizeEntityProp,
    moveSelectedDimensionSort,
    defaultDimensionSort
} from './utils';
import { ElemInstanceTypeDescriptor } from './types';

/**
 * @typedef {object} SelectOption
 * @property {number} index
 * @property {string} name
 * @property {string|undefined} metric
 * @property {boolean} selected
 * @property {boolean} disabled
 * @property {boolean} visible
 * @property {Record<string, any>} row
 */
const { navigate } = useNavigate();

const DatasetMixin = useElemDatasetBaseMixin({
    panel: false,
    fetchEvent: { methodName: 'onFetchData' }
});

export default {
    extends: Elem,
    components: {
        WFilterHeader: FilterHeader,
        UiDynamicScroller: DynamicScroller,
        UiDynamicScrollerItem: DynamicScrollerItem,
        WSmartSearchView: SmartSearchView,
        WPagination: Pagination
    },
    mixins: [DatasetMixin],
    meta,
    hooks: {
        before(cancel) {
            if (this.requests.length === 0) {
                return;
            }
            if (this.isAllowedLoadData === false || (this.isMenuVisible === false && this.props.loadDataOnOpen)) {
                cancel();
            }
        },
        then() {
            const { selectedDimension, $storeState, metrics, dimensions } = this;
            const subState = pick($storeState, [...metrics, ...dimensions, selectedDimension]);
            const selectedDimensionState = selectedDimension == null ? null : subState?.[selectedDimension];
            const isSelectedDimensionStateDefined = [selectedDimensionState]
                .flat()
                .some((value) => value != null && `${value}` !== '');

            if (isSelectedDimensionStateDefined) {
                this.isFirstAppearance = false;
            }

            this.subState = subState;
            this.createFilterData(subState);
            this.triggerEventAndCommitToStore();
        }
    },
    provide() {
        const { formatCellDataString } = this;
        return {
            $formatCellDataString: formatCellDataString
        };
    },
    data() {
        return {
            offset: 0,
            isMenuVisible: false,
            singleSelect: '',
            singleSelectMetric: '',
            valueDimension: '',
            /**
             * @type {SelectOption[]}
             */
            // eslint-disable-next-line no-restricted-syntax
            multiSelect: [],
            /**
             * @type {SelectOption[]}
             */
            // eslint-disable-next-line goodt-rules/data-boolean-key-naming,no-restricted-syntax
            dimensionOptions: [],
            findDimension: '',
            isFirstAppearance: true,
            /**
             * @type {SelectOption[]|undefined}
             */
            prevMultiSelect: undefined,
            /**
             * @type {import('@goodt-wcore/managers/StoreManager').StoreElemState}
             */
            state: null,
            /**
             * @type {import('@goodt-wcore/managers/StoreManager').StoreElemState}
             */
            subState: null,
            /**
             * @type {import('@goodt-wcore/managers/StoreManager').StoreElemState}
             */
            firstSubState: null,
            firstDimensionValues: [],
            prevSelectedDimensionValue: undefined,
            shouldClearEnteredValue: false,
            isClickedOutside: false,
            activeSortDirection: '',
            applyMode: {
                shouldCommitOnCancel: false
            }
        };
    },
    computedEditor: {
        multiListClasses() {
            const { paginationOptions } = this.props;
            return {
                'multi-list-wrapper--full-growth': paginationOptions.isEnable
            };
        },
        smartSearchDimensions() {
            return this.props.smartSearchDimensions.map(({ name }) => this.dimensions[name] ?? name);
        },
        /**
         */
        buttonIconStyle() {
            const vars = Buttons.reduce((acc, btn) => {
                const { icon = {} } = this.props[btn];
                const { margin = [] } = icon.style ?? {};
                return { ...acc, [`${kebabCase(btn).replace('select-', '')}__icon_margin`]: margin.join(' ') };
            }, {});

            return this.$genCssVarsStyle(vars);
        },
        /**
         */
        isDeleteSmartSearchDims() {
            return this.props.isSmartSearch;
        },
        /**
         * @this { Vue & import('./types/ElemFilter').TElemInstance }
         * @return {*|null}
         */
        selectedMetric() {
            const {
                props: { selectedMetric },
                metrics
            } = this;
            const normalizedMetric = normalizeEntityProp(selectedMetric, metrics);
            return metrics[normalizedMetric] ?? normalizedMetric;
        },
        embeddedSearchEditor() {
            const {
                isSearchMode,
                searchModeInput: { prefix },
                embeddedSearch: { isEnabled, isMetricTextPlaceholder }
            } = this.props;

            const placeholder = isMetricTextPlaceholder ? this.selectedDimension : 'Поиск';

            return {
                isEnabled: !isSearchMode && isEnabled,
                placeholder,
                prefix
            };
        },
        shouldShowTopButtons() {
            const { btnClear, btnPasteFromClipboard, shouldShowBtnSelectAll, isMultiMode, isClearEnable } = this.props;
            return (
                (btnPasteFromClipboard.isShown || btnClear.isShown || shouldShowBtnSelectAll) &&
                isMultiMode &&
                isClearEnable
            );
        },
        shouldShowBottomButtons() {
            const { btnCancel, btnDo, isMultiMode, isClearEnable } = this.props;
            return (btnCancel.isShown || btnDo.isShown) && isMultiMode && isClearEnable;
        },
        /**
         * @return {Object}
         */
        buttonsInfo() {
            return Buttons.reduce((struct, btn) => {
                const { styles = [], icon = {}, classes = [], ...rest } = this.props[btn];
                const style = buildCssStyle(styles);
                const iconIsUsed = icon.isUsed;
                const attributes = ['color', 'background'];
                const extraClasses = attributes
                    .filter((attribute) => this.props[btn][attribute].trim() !== '')
                    .map((attr) => `button-wrapper__${kebabCase(btn).replace('select-', '')}--${attr}`);

                return {
                    ...struct,
                    [btn]: { ...rest, icon, iconIsUsed, style, classes: [...classes, ...extraClasses] }
                };
            }, {});
        },
        isMenuAlwaysOpen() {
            const { props, isEditorMode } = this;
            return isEditorMode && props.isMenuAlwaysOpen;
        },
        isApplyMode() {
            const {
                isClearEnable,
                btnDo: { isShown }
            } = this.props;
            return isClearEnable && isShown;
        },
        selectedDimension() {
            const { selectedDimension } = this.props;
            const normalizedDimension = normalizeEntityProp(selectedDimension, this.dimensions);
            return this.dimensions[normalizedDimension] ?? normalizedDimension;
        }
    },
    computed: {
        embeddedSearch() {
            const { embeddedSearchEditor, findDimension } = this;
            return {
                ...embeddedSearchEditor,
                isClearIcon: findDimension !== ''
            };
        },
        shouldShowTags() {
            const { isMultiCount } = this.props;
            const { multiSelect } = this;
            return isMultiCount && multiSelect.length > 0;
        },
        /**
         * @return {Object}
         */
        headerBinds() {
            const {
                valueDimension,
                isTooltipShown,
                isMenuVisible,
                selectedList,
                singleSelect,
                title,
                multiSelect,
                shouldClearEnteredValue,
                findDimension,
                selectedDimension
            } = this;
            return {
                valueDimension,
                isTooltipShown,
                isMenuVisible,
                selectedList,
                singleSelect,
                title,
                // eslint-disable-next-line no-restricted-syntax
                multiSelect,
                shouldClearEnteredValue,
                findDimension,
                selectedDimension
            };
        },
        /**
         * @return {string}
         */
        title() {
            let singleSelectText = this.singleSelect;

            if (this.props.isTrimTheLine) {
                singleSelectText = _truncate(singleSelectText, {
                    length: this.props.cutStringLength
                });
            }

            if (this.props.isMultiMode === false || !this.isMenuAlwaysOpen) {
                return this.isMenuVisible ? this.props.textPlaceholder : singleSelectText || this.props.textPlaceholder;
            }

            return '';
        },
        /**
         * @return {SelectOption[]}
         */

        dimensionSortedOptions() {
            return [...this.dimensionOptions].sort((a, b) => {
                return this.props.moveSelectedValue ? moveSelectedDimensionSort(a, b) : defaultDimensionSort(a, b);
            });
        },
        /**
         * @return {SelectOption[]}
         */
        dimensionListPrepared() {
            return (this.props.isMultiCount ? this.dimensionOptions : this.dimensionSortedOptions).filter(
                ({ visible }) => visible === true
            );
        },
        /**
         * @return {string[]}
         */
        findDimensionList() {
            return [
                ...new Set(
                    this.findDimension
                        .split(STRING_LIST_DELIMITER)
                        .map((value) => value.trim().toLowerCase())
                        .filter((value) => value !== '')
                )
            ];
        },
        /**
         * @return {SelectOption[]}
         */
        filteredList() {
            const {
                dimensionListPrepared,
                findDimensionList,
                props: { paginationOptions }
            } = this;

            if (paginationOptions.isEnable || findDimensionList.length === 0) {
                return dimensionListPrepared;
            }

            return dimensionListPrepared.filter(({ name }) => {
                const normalizedName = name.toLowerCase();
                return findDimensionList.some((dimension) => normalizedName.includes(dimension));
            });
        },
        /**
         * @return {string}
         */
        selectedList() {
            return this.multiSelect.map((item) => item.name).join(`${STRING_LIST_DELIMITER} `);
        },
        /**
         * @return {Object.<string,any>}
         */
        dataRow() {
            const {
                singleSelect,
                singleSelectMetric,
                selectedDimension,
                selectedMetric,
                props: { isMetricDisplayed }
            } = this;

            return this.allDatasetsRows.find(
                (row) =>
                    row[selectedDimension] === singleSelect &&
                    (!isMetricDisplayed || row[selectedMetric] === singleSelectMetric)
            );
        },
        /**
         * @return {boolean}
         */
        isDeleteSingleDimBtnShown() {
            const {
                singleSelect,
                props: { isMultiMode, isNoFullReset }
            } = this;
            return Boolean(!isMultiMode && singleSelect && !isNoFullReset);
        },
        /**
         * @return {boolean}
         */
        isDeleteAllDimsBtnShown() {
            const {
                multiSelect,
                props: { isMultiMode, isMultiCount }
            } = this;
            return isMultiMode && !isMultiCount && multiSelect.length > 0;
        },
        /**
         * @return {boolean}
         */
        isTooltipShown() {
            const { singleSelect, selectedList } = this;
            return singleSelect !== '' || selectedList !== '';
        },
        allDatasetsRows() {
            const { results } = this;

            if (results.length === 0) {
                return [];
            }

            const allRows = results.filter((result) => result != null).flatMap((result) => result.rows);

            const {
                props: { paginationOptions, selectedDimension },
                subState
            } = this;

            if (paginationOptions.isEnable === false || subState == null) {
                return allRows;
            }

            const { dimensionValues: selectedDimensionValues } = this.resolveStateSelectedDimensionValues({
                results,
                subState
            });

            const stateDimensions = [...new Set(selectedDimensionValues)]
                .filter((dim) => !allRows.some((row) => row[selectedDimension] === dim))
                .map((dim) => ({ [selectedDimension]: dim }));

            return [...stateDimensions, ...allRows];
        },
        isFiltersShown() {
            const {
                findDimension,
                isMenuVisible,
                props: { isGeneralPreview, isSearchMode }
            } = this;
            if (isGeneralPreview && isSearchMode) {
                return findDimension !== '';
            }

            return isMenuVisible;
        },
        isSingleListShown() {
            const {
                findDimension,
                props: { isMultiMode, isGeneralPreview }
            } = this;
            if (!isMultiMode && isGeneralPreview) {
                return findDimension !== '';
            }

            return !isMultiMode;
        },
        isMultiSelect() {
            const {
                findDimension,
                props: { isMultiMode, isGeneralPreview }
            } = this;
            if (isMultiMode && isGeneralPreview) {
                return findDimension !== '';
            }

            return isMultiMode;
        },
        /** @public */
        rowCount() {
            const { results, selectedDimension } = this;
            if (results.length === 0) {
                return 0;
            }
            const foundResult = results.find(({ schema }) => schema.find(({ name }) => name === selectedDimension));

            return foundResult?.rowCount ?? 0;
        },
        /** @public */
        limit() {
            const { requests, selectedDimension } = this;
            const selectedRequest = requests
                .filter(Boolean)
                .find(({ query }) => query.dimensions.includes(selectedDimension));
            return selectedRequest?.limit ?? 0;
        },
        page: {
            /**
             * @param {number} page
             */
            set(page) {
                this.offset = (page - 1) * this.limit;
                this.requests.forEach((request) => {
                    request.offset = this.offset;
                });
            },
            /**
             * @return {number}
             */
            get() {
                return this.limit ? Math.ceil(this.offset / this.limit) + 1 : 1;
            }
        },
        /**
         * @return {number}
         */
        pages() {
            return this.limit ? Math.ceil(this.rowCount / this.limit) : 1;
        },
        isAllowedLoadData() {
            const {
                isAwaitVariableMode,
                awaitVariableModeSettings: { variables }
            } = this.props;

            return isAwaitVariableMode ? variables.every((variable) => this.$storeState[variable] != null) : true;
        },
        isMultiSelectHasChanges() {
            const { multiSelect, prevMultiSelect = [] } = this;
            return !isEqual(
                multiSelect.map(({ name }) => name),
                prevMultiSelect.map(({ name }) => name)
            );
        }
    },
    watch: {
        /**
         * @param {string} value
         */
        singleSelect(value) {
            if (value === '') {
                this.dimensionOptions = this.dimensionOptions.map(
                    /**
                     * @param {SelectOption} dimension
                     * @return {SelectOption}
                     */
                    (dimension) => ({
                        ...dimension,
                        selected: false
                    })
                );
            }
        },
        /**
         * @param {boolean} isMenuVisible
         */
        isMenuVisible(isMenuVisible) {
            if (isMenuVisible && this.prevMultiSelect == null) {
                this.prevMultiSelect = [...this.multiSelect];
            }
            if (isMenuVisible && this.props.loadDataOnOpen) {
                this.loadData();
            }
            if (isMenuVisible) {
                this.createFilterData();
            }
        }
    },
    watchEditor: {
        'props.isMenuAlwaysOpen': {
            handler(value) {
                this.isMenuVisible = value && this.isEditorMode;
            }
        },
        'props.isAwaitVariableMode': {
            handler() {
                this.loadDataPage();
            }
        },
        'props.selectedDimension': {
            handler() {
                this.loadData();
            }
        },
        props: {
            handler() {
                this.createFilterData();
            },
            deep: true
        },
        datasetRequests: {
            handler(datasetRequests) {
                if (datasetRequests.length === 0) {
                    this.results = [];
                }
            }
        }
    },
    watchStore: [
        {
            all: true,
            vars() {
                return this.selectedDimension ? [this.selectedDimension] : [];
            },
            handler([selectedDimension]) {
                const { isSmartSearch } = this.props;
                const prevSelectedDimensionValue = this.prevSelectedDimensionValue;
                this.prevSelectedDimensionValue = selectedDimension;

                if (isSmartSearch) {
                    this.valueDimension = selectedDimension ?? '';
                }

                if (
                    prevSelectedDimensionValue !== null &&
                    prevSelectedDimensionValue !== undefined &&
                    selectedDimension === null
                ) {
                    this.triggerResetEvent();
                }
            }
        },
        {
            vars: [Vars.EXCLUDE_FILTER_VALUE],
            handler([excludeFilterValue]) {
                const [request] = this.applyQueryParamsExcludeFilterValue(excludeFilterValue);
                if (request != null) {
                    this.$nextTick(() => {
                        this.loadDataPage();
                    });
                }
            }
        }
    ],
    destroyed() {
        document.removeEventListener('click', this.onDocClick);
    },
    created() {
        document.addEventListener('click', this.onDocClick);
    },
    mounted() {
        this.isMenuVisible = this.isMenuAlwaysOpen;
    },
    methods: {
        ...ElemInstanceTypeDescriptor,
        /** @public */
        async onFetchData() {
            this.shouldClearEnteredValue = true;
            this.isFirstAppearance = true;
            await this.loadDataPage();
        },
        async loadDataPage(page = 1, requests = this.requests) {
            this.page = page;
            await this.loadData(requests);
        },
        commitPropFiltersToStore() {
            const { filters } = this.props;
            if (filters.length > 0) {
                const state = filters.reduce((acc, { name, data }) => ({ ...acc, [name]: data }), {});
                this.$storeCommit(state, { hasMap: false });
            }
        },
        /**
         * @param {string[]} values
         * @param isKeepNotAppliedSelected
         */
        setSelectedDimensions(values, isKeepNotAppliedSelected) {
            const { isMultiMode } = this.props;
            // multi select mode
            if (isMultiMode) {
                this.dimensionOptions = uniqBy(
                    [
                        ...this.multiSelect,
                        ...this.dimensionOptions.map(
                            /**
                             * @param {SelectOption} option
                             * @return {SelectOption}
                             */
                            (option) => {
                                const prevSelectedOption = this.multiSelect.find((prevSelect) => {
                                    return JSON.stringify(option.name) === JSON.stringify(prevSelect.name);
                                });

                                return {
                                    ...option,
                                    selected:
                                        values.includes(option.name) ||
                                        (isKeepNotAppliedSelected ? option.selected : false) ||
                                        prevSelectedOption != null
                                };
                            }
                        )
                    ],
                    'name'
                );
                this.multiSelect = uniqBy(
                    [...this.multiSelect, ...this.dimensionOptions.filter(({ selected }) => selected)],
                    'name'
                );
                return;
            }
            // При первой загрузки виджета values старые инвалидные данный, но this.singleSelect уже корректно инициализирован
            if (values.length > 0 && values.every((val) => val != null)) {
                this.dimensionOptions = this.dimensionOptions.map(
                    /**
                     * @param {SelectOption} option
                     * @return {SelectOption}
                     */
                    (option) => ({ ...option, selected: false })
                );
                this.singleSelect = this.createStandardSingleFilter(values[values.length - 1]);
            }
        },
        setSelectedDimensionsWithoutData(state, selectedDimension) {
            const values = state[selectedDimension];
            const { isMultiMode } = this.props;

            const valuesFormatted = [values].flat().filter((val) => val != null);
            if (isMultiMode) {
                this.multiSelect = valuesFormatted.map((val) =>
                    Object({ name: val, row: { [selectedDimension]: val }, selected: true })
                );
                return;
            }
            this.singleSelect = valuesFormatted[0] == null ? '' : valuesFormatted[0];
        },
        applyQueryParamsExcludeFilterValue(excludeFilterValue) {
            const { excludedField } = this.props;
            const excludeFilterState = {
                [excludedField]:
                    excludeFilterValue == null
                        ? null
                        : {
                              __t: -1,
                              name: excludedField,
                              operator: this.QueryFilterOperator.IN_NOT,
                              value: [excludeFilterValue].flat()
                          }
            };
            return this.$storeApplyQueryFilters(excludeFilterState);
        },
        createFilterData(subState = {}) {
            const {
                props: { shouldMuteFiltrationRows, isChangeCategoryResetValues, isMultiMode, isSearchMode },
                selectedDimension,
                findDimension,
                findDimensionList
            } = this;
            const storeValues = Object.values(this.$storeState);
            const storeEntries = Object.entries(this.$storeState);
            const stateNames = subState?.[selectedDimension] == null ? [] : [subState?.[selectedDimension]].flat();

            const newDimensionOptions = this.allDatasetsRows
                .filter((row) => row[selectedDimension] != null)
                .map((row) => {
                    const name = row[selectedDimension];
                    const metric = row[this.selectedMetric];
                    const isSelected = stateNames.some(
                        (stateName) => stateName != null && stateName.trim().toLowerCase() === name.trim().toLowerCase()
                    );
                    const hasRowStore = Object.entries(row).some(([key, value]) =>
                        storeEntries.some(([storeKey, storeValue]) => {
                            if (storeKey !== key || storeValue == null) {
                                return false;
                            }
                            return [storeValue]
                                .flat()
                                .map((val) => val.trim().toLowerCase())
                                .includes(value.trim().toLowerCase());
                        })
                    );
                    const isDisabled =
                        hasRowStore === false &&
                        shouldMuteFiltrationRows === true &&
                        isSelected === false &&
                        storeValues.some((val) => val != null && !Object.values(row).includes(val));

                    return {
                        name,
                        metric,
                        index: null,
                        disabled: isDisabled,
                        selected: isSelected,
                        visible: true,
                        row
                    };
                });

            const previousSelected = resolvePreviousSelected({
                isChangeCategoryResetValues,
                findDimensionList,
                multiSelectValues:
                    (isSearchMode && findDimension != null && findDimension !== '') || this.isMenuVisible
                        ? this.multiSelect
                        : [],
                newDimensionOptions
            });

            const mergedDimensionOptions = uniqBy([...previousSelected, ...newDimensionOptions], 'name').map(
                /**
                 * @param {SelectOption} option
                 * @param {number} index
                 * @return {SelectOption}
                 */
                (option, index) => ({
                    ...option,
                    index
                })
            );

            this.dimensionOptions = mergedDimensionOptions;

            const selectedOptions = mergedDimensionOptions.filter(({ selected }) => selected);
            if (isMultiMode) {
                this.multiSelect = selectedOptions;
                return;
            }
            this.singleSelect = selectedOptions[0]?.name ?? '';
        },
        triggerEventAndCommitToStore({ isDatasetFiltered = false } = {}) {
            const { results, subState, selectedDimension, isApplyMode } = this;
            if (results.length === 0) {
                return;
            }

            const { isMultiMode, paginationOptions, isAlwaysFirstValue, isChangeCategoryResetValues } = this.props;

            if (this.isFirstAppearance) {
                this.isFirstAppearance = false;
                this.triggerDefaultValues();
            } else if (isAlwaysFirstValue && isDatasetFiltered) {
                this.multiSelect = [];
                this.triggerFirstValue({ isDatasetFiltered });
            }

            let isOnlySelectedDimension = true;
            if (subState != null) {
                const { isAnotherDimension, dimensionValues: selectedDimensionValues } =
                    this.resolveStateSelectedDimensionValues({ results, subState });
                isOnlySelectedDimension = !isAnotherDimension;
                if (this.firstSubState == null) {
                    this.firstSubState = cloneDeep(subState);
                    this.firstDimensionValues = cloneDeep(selectedDimensionValues);
                }
                if (
                    isMultiMode &&
                    selectedDimensionValues.length > 0 &&
                    selectedDimensionValues.every((val) => val == null)
                ) {
                    if (!isApplyMode) {
                        this.multiSelect = [];
                        this.dimensionOptions = this.dimensionOptions.map((dimension) => ({
                            ...dimension,
                            selected: false
                        }));
                    }
                    if (!paginationOptions.isEnable) {
                        this.findDimension = '';
                    }
                } else {
                    const { isMultiSelectHasChanges } = this;
                    const isKeepNotAppliedSelected = isMultiSelectHasChanges && isApplyMode;
                    this.setSelectedDimensions(selectedDimensionValues, isKeepNotAppliedSelected);
                }

                if (isChangeCategoryResetValues) {
                    this.formStateToCommit();
                }
                if (!isOnlySelectedDimension) {
                    this.state = {
                        ...this.state,
                        [selectedDimension]: selectedDimensionValues
                    };
                    this.$storeCommit(this.state);
                }
            }

            if ((isMultiMode && this.multiSelect.length > 0) || this.singleSelect !== '' || !isOnlySelectedDimension) {
                this.triggerSelectEvent();
            }
        },
        /**
         * @param {string} dimension
         * @param {string} metric
         * @param {SelectOption} selectedItem
         */
        selectSingleDimension(dimension, metric, selectedItem) {
            if (selectedItem.disabled) {
                return;
            }

            if (this.props.isMetricDisplayed && metric != null) {
                this.singleSelectMetric = metric;
                this.triggerEventAndCommitToStore();
            }
            this.singleSelect = dimension;
            this.formStateToCommit();
            this.isMenuVisible = this.isMenuAlwaysOpen;
            this.triggerSelectEvent();
            this.navigateSelectedUrl();
        },
        /**
         * @param {SelectOption} selectedItem
         */
        changeSelect(selectedItem) {
            if (selectedItem.disabled) {
                return;
            }

            const {
                dimensionOptions,
                multiSelect,
                applyMode,
                isApplyMode,
                props: { isSearchMode }
            } = this;

            //
            if (isApplyMode && applyMode.shouldCommitOnCancel) {
                applyMode.shouldCommitOnCancel = false;
                this.prevMultiSelect = [...multiSelect];
            }

            const optionIndex = dimensionOptions.findIndex(({ index }) => index === selectedItem.index);
            const updatedOption = { ...selectedItem, selected: !selectedItem.selected };

            this.$set(dimensionOptions, optionIndex, updatedOption);

            if (updatedOption.selected) {
                multiSelect.push(updatedOption);
                this.triggerSelectEvent();
            } else {
                const foundIndex = multiSelect.findIndex(({ index }) => index === selectedItem.index);
                multiSelect.splice(foundIndex, 1);
                this.triggerResetEvent();
            }

            // if (!isSearchMode) {
            //     this.findDimension = '';
            // }

            if (isApplyMode === true) {
                return;
            }

            if (multiSelect.length > 0) {
                this.formStateToCommit();
            } else {
                this.clearStore();
            }
        },
        commitSelectedDimensionsToStore() {
            const { multiSelect } = this;
            if (multiSelect.length > 0) {
                this.formStateToCommit({ commitByClick: true });
            } else {
                this.deleteAllDimensions();
            }
        },
        /**
         * @param {SelectOption} dimension
         * @param {number} index
         */
        deleteDimension(dimension, index) {
            const { isApplyMode } = this;
            // eslint-disable-next-line no-shadow
            const foundDimensionIndex = this.dimensionOptions.findIndex(({ index }) => index === dimension.index);
            if (foundDimensionIndex !== -1) {
                const updatedDimension = {
                    ...this.dimensionOptions[foundDimensionIndex],
                    // eslint-disable-next-line no-restricted-syntax
                    selected: !this.dimensionOptions[foundDimensionIndex].selected
                };
                this.multiSelect.splice(index, 1);

                this.$set(this.dimensionOptions, foundDimensionIndex, updatedDimension);

                if (isApplyMode) {
                    return;
                }

                if (this.multiSelect.length > 0) {
                    this.formStateToCommit();
                } else {
                    this.clearStore();
                }
                this.triggerResetEvent();
            }
        },
        deleteAllDimensions() {
            const { isResetToDefault, paginationOptions } = this.props;

            if (this.isApplyMode) {
                const { applyMode } = this;
                this.prevMultiSelect = [...this.multiSelect];
                applyMode.shouldCommitOnCancel = true;
            }

            const isFullReset = isEqual(
                this.multiSelect.filter(({ selected }) => selected === true).map(({ name }) => name),
                this.firstDimensionValues
            );

            this.multiSelect = [];
            this.dimensionOptions =
                !isFullReset && isResetToDefault
                    ? this.dimensionOptions.map((dimension) => {
                          const isFirstDimension = this.firstDimensionValues.includes(dimension.name);
                          if (isFirstDimension) {
                              this.multiSelect.push({ ...dimension, selected: true });
                          }

                          return {
                              ...dimension,
                              selected: isFirstDimension
                          };
                      })
                    : this.dimensionOptions.map((dimension) => ({
                          ...dimension,
                          selected: false
                      }));

            // if clear search required
            if (this.findDimension !== '') {
                this.findDimension = '';
                this.ensureLoadData([]);
            } else if (paginationOptions.isEnable) {
                // filter only dimensions on current page
                this.dimensionOptions = this.dimensionOptions.filter(({ name }) =>
                    this.allDatasetsRows.some((row) => row[this.selectedDimension] === name)
                );
            }

            this.clearStore(isFullReset);
            this.triggerResetEvent();
        },
        /**
         */
        toggleMenu() {
            const {
                props: { isMultiCount, isSearchMode },
                isMenuVisible,
                isMenuAlwaysOpen,
                findDimension
            } = this;
            if (isMultiCount || isMenuAlwaysOpen) {
                return;
            }
            if (isSearchMode && isMenuVisible && findDimension !== '') {
                return;
            }
            this.isMenuVisible = !isMenuVisible;
        },
        toggleMenuByCursor() {
            if (this.isMenuVisible) {
                setTimeout(() => {
                    this.isMenuVisible = false;
                }, TOGGLE_MENU_DELAY);
            }
            this.isMenuVisible = true;
        },
        /**
         * @param {string} paramVal
         */
        createStandardSingleFilter(paramVal) {
            const {
                props: { isMetricDisplayed },
                singleSelectMetric
            } = this;
            const foundDimension = this.dimensionOptions.find(
                ({ name, metric }) =>
                    name === paramVal &&
                    (!isMetricDisplayed || singleSelectMetric === '' || metric === singleSelectMetric)
            );

            if (foundDimension == null || foundDimension.selected) {
                return '';
            }

            foundDimension.selected = true;

            return foundDimension.name;
        },
        /**
         * @param {MouseEvent} event
         */
        onDocClick(event) {
            event.stopPropagation();

            if (this.$el.contains(event.target) === false) {
                this.isMenuVisible = this.isMenuAlwaysOpen;
                this.isClickedOutside = true;

                if (this.props.isGeneralPreview) {
                    this.findDimension = '';
                }
                return;
            }

            this.isClickedOutside = false;
        },
        deleteSingleDimension() {
            const isFullReset = this.firstDimensionValues.includes(this.singleSelect);
            this.singleSelect = '';

            this.findDimension = '';
            this.clearStore(isFullReset);
            this.triggerResetEvent();

            this.ensureLoadData([]);
        },
        triggerDefaultValues() {
            const {
                props: { defaultValues, shouldSelectFirstValue, isMultiMode, isAlwaysFirstValue },
                selectedDimension,
                dimensionOptions
            } = this;
            const values = defaultValues.map(({ name }) => name.trim());

            if ((shouldSelectFirstValue || isAlwaysFirstValue) && selectedDimension !== '' && this.results.length > 0) {
                const value = _get(this.results[0], `rows[0][${selectedDimension}]`, null);
                const isNotDimension = value === null ? false : !values.includes(value);

                if (value !== null && isNotDimension) {
                    values.push(value);
                }
            }

            if (isMultiMode === true) {
                const dims = values.reduce((acc, dimensionName) => {
                    const foundDimension = dimensionOptions.find(({ name }) => name === dimensionName);

                    if (foundDimension == null) {
                        return acc;
                    }

                    acc.push(foundDimension);
                    return acc;
                }, []);

                this.dimensionOptions = dimensionOptions.map((item) => {
                    const dim = dims.find(({ name }) => name === item.name);
                    return dim != null ? { ...item, selected: true } : item;
                });
                this.multiSelect = [...this.multiSelect, ...dims.map((item) => ({ ...item, selected: true }))];
            } else {
                this.singleSelect = values[0] || '';
            }

            if (values.length === 0) {
                return;
            }

            this.formStateToCommit();
            this.triggerSelectEvent();
        },
        triggerFirstValue({ isDatasetFiltered = false } = {}) {
            if (!isDatasetFiltered) {
                return;
            }

            const { selectedDimension } = this;
            const value = this.results[0]?.rows[0]?.[selectedDimension];

            if (value == null) {
                return;
            }

            this.singleSelect = value;

            this.formStateToCommit();
            this.triggerSelectEvent();
        },
        formStateToCommit({ commitByClick = false } = {}) {
            const { isMultiMode, isChangeCategoryResetValues } = this.props;
            let state = this.dataRow;
            if (isMultiMode) {
                const rows = this.multiSelect.map(({ row }) => row);

                state = rows.reduce((obj, row) => {
                    const entries = Object.entries(row);
                    entries.forEach(([key, value]) => {
                        if (obj[key]?.includes(value)) {
                            return;
                        }
                        if (obj[key] == null) {
                            obj[key] = [value];
                        } else {
                            obj[key].push(value);
                        }
                    });
                    return obj;
                }, {});
            }

            const { isApplyMode } = this;
            const isOnlySelect = isMultiMode === true && isApplyMode === true;

            if (isOnlySelect === true && commitByClick === false) {
                this.$storeWatchHandler(state);
            }

            this.state = state;
            const stateToCommit =
                isChangeCategoryResetValues && Object.keys(state).length === 0
                    ? { [this.selectedDimension]: null }
                    : state;
            this.$storeCommit(stateToCommit);
        },
        triggerSelectEvent(domEvent) {
            const { customEvent, dynamicEvent, isMultiMode, isSmartSearch } = this.props;
            if (customEvent.enable === false) {
                return;
            }

            const resolveEventType = () => {
                if (dynamicEvent.enable && isMultiMode === false) {
                    const dataRow = this.dimensionOptions.find(({ name }) => name === domEvent?.target.value);
                    return isSmartSearch ? dataRow?.name : this.dataRow[dynamicEvent.onSelectName];
                }
                return customEvent.onSelectName;
            };

            const eventType = resolveEventType();
            if (eventType == null) {
                return;
            }

            this.$eventTrigger(eventType);
        },
        triggerResetEvent() {
            const { customEvent, dynamicEvent, isMultiMode } = this.props;
            if (customEvent.enable === false) {
                return;
            }

            const eventType = dynamicEvent.enable && !isMultiMode ? dynamicEvent.onResetName : customEvent.onResetName;
            this.$eventTrigger(eventType, {});
        },
        navigateSelectedUrl() {
            const { metricNavigateLink, isOpenedUrlFromNewTab } = this.props;

            if (this.dataRow == null || metricNavigateLink === EMPTY_FIELD_URL) {
                return;
            }

            const url = this.dataRow[metricNavigateLink];

            if (url != null && url.length > 0) {
                navigate({ url }, { isNewWindow: isOpenedUrlFromNewTab });
            }
        },
        /**
         * @public
         * @type {import('@goodt-common/data').IElemDatasetBaseMixinInstance.$queryInitParamsStoreFilters}
         */
        $queryInitParamsStoreFilters() {
            const { selectedDimension } = this;
            const paramsState = omit(pick(this.$storeState, this.$storeWatchHandlerVars), selectedDimension);
            this.$storeApplyQueryFilters(paramsState);
        },
        /**
         * @public
         * @param {object} state
         */
        $storeWatchHandler(state) {
            const { isSmartSearch, shouldMuteFiltrationRows } = this.props;

            if (isSmartSearch === true) {
                return;
            }

            const subState = pick(state, [...this.metrics, ...this.dimensions, this.selectedDimension]);

            this.createFilterData(subState);
            if (shouldMuteFiltrationRows === true) {
                return;
            }

            const shouldLoadData = Object.keys(state).length > 0 && !isEqual(this.state, state);
            if (!shouldLoadData) {
                this.subState = subState;
                return;
            }
            this.state = state;

            const datasetFiltersState = omit(pick(state, this.$storeWatchHandlerVars), [
                ...this.metrics,
                this.selectedDimension
            ]);
            const [request] = this.$storeApplyQueryFilters(datasetFiltersState);

            this.$nextTick(async () => {
                if (!this.isFiltersShown) {
                    this.setSelectedDimensionsWithoutData(state, this.selectedDimension);
                }
                if (request != null) {
                    this.subState = subState;
                    await this.loadDataPage();
                    return;
                }

                if (isEqual(this.subState, subState) === false) {
                    this.subState = subState;
                    this.triggerEventAndCommitToStore({ isDatasetFiltered: true });
                }
            });
        },
        resolveStateSelectedDimensionValues({ results = this.results, subState }) {
            const { selectedDimension } = this.props;
            let isAnotherDimension = false;
            const flattedRows = results.flatMap(({ rows }) => rows);

            const dimensionValues = Object.entries(subState ?? {}).flatMap(([key, value]) => {
                if (key === selectedDimension) {
                    return value;
                }

                const storeValues = new Set([value].flat().map(String));
                return flattedRows
                    .filter((row) => {
                        if (key in row) {
                            return false;
                        }

                        isAnotherDimension = true;
                        return storeValues.has(String(row[key]));
                    })
                    .map((row) => row[selectedDimension]);
            });

            return {
                dimensionValues: [...new Set(dimensionValues)],
                isAnotherDimension
            };
        },
        clearStore(isFullReset = false) {
            this.commitPropFiltersToStore();
            const { metrics, dimensions } = this;
            let clearedState = [...metrics, ...dimensions].reduce(
                (acc, key) => ({
                    ...acc,
                    [key]: null
                }),
                {}
            );

            if (this.props.isResetToDefault && !isFullReset) {
                clearedState = {
                    ...clearedState,
                    ...this.firstSubState,
                    [this.selectedDimension]: this.firstDimensionValues.length > 0 ? this.firstDimensionValues : null
                };
            }
            this.state = clearedState;
            this.$storeCommit(clearedState);
            this.valueDimension = '';
            this.triggerResetEvent();
        },
        buildStateByDimension(dimension) {
            const filteredRows = this.allDatasetsRows.filter((row) => {
                const rowEntries = Object.entries(row);
                return (
                    rowEntries.some(([key]) => this.smartSearchDimensions.includes(key)) &&
                    rowEntries.some(
                        ([, value]) => dimension !== '' && String(value).toLowerCase().includes(dimension.toLowerCase())
                    )
                );
            });

            if (filteredRows.length === 0) {
                const foundRowKeys = this.smartSearchDimensions.flatMap((dim) => {
                    const foundRow = this.allDatasetsRows.find((row) => Object.keys(row).includes(dim));

                    return foundRow != null ? Object.keys(foundRow) : [];
                });

                return foundRowKeys.reduce((acc, key) => {
                    const foundDatasetResult = this.results.find(({ schema }) =>
                        schema.some(({ name }) => key === name)
                    );
                    const { schema = [] } = foundDatasetResult;
                    const foundSchemaQueryParam = schema.find(({ name }) => name === key);
                    const isNumberType = DatasetFieldTypes.NUMBER_TYPES.includes(foundSchemaQueryParam.type);
                    const NonExistentValue = isNumberType ? NonExistentValues.NUMBER : NonExistentValues.STRING;

                    return {
                        ...acc,
                        [key]: dimension === '' ? null : NonExistentValue
                    };
                }, {});
            }

            return filteredRows.reduce(
                (state, row) =>
                    Object.entries(row).reduce(
                        (acc, [key, value]) => ({
                            ...acc,
                            // eslint-disable-next-line no-restricted-syntax
                            [key]: [...new Set([...(acc[key] ?? []), value])]
                        }),
                        state
                    ),
                {}
            );
        },
        /**
         * @param {string} dimension
         */
        resolveSearchValue(dimension) {
            const {
                props: { isMultiMode, minSearchingLength }
            } = this;

            if (!isMultiMode) {
                this.singleSelect = '';
            }

            const previousDimension = this.findDimension;
            this.findDimension = dimension;

            const isTooShortSearch = dimension.length > 0 && minSearchingLength > dimension.length;
            const isSameSearch = previousDimension === dimension;

            if (!isTooShortSearch && !isSameSearch) {
                this.ensureLoadData(this.findDimensionList);
            }
        },
        /**
         * @param {string} dimension
         */
        resolveSmartSearchValue(dimension) {
            const {
                props: { isMultiMode, minSearchingLength }
            } = this;

            if (!isMultiMode) {
                this.singleSelect = '';
            }

            const previousDimension = this.findDimension;
            this.findDimension = dimension;

            const isTooShortSearch = dimension.length > 0 && minSearchingLength > dimension.length;
            const isSameSearch = previousDimension === dimension;

            if (!isTooShortSearch && !isSameSearch) {
                const newState = this.buildStateByDimension(dimension);
                this.$storeCommit(newState);
            }
        },
        /**
         * @param {string} dimensionName
         * @return {Object}
         */
        resolveOptionClasses(dimensionName) {
            const {
                props: { isSingleSelectBacklight },
                singleSelect
            } = this;
            return {
                'option--selected': isSingleSelectBacklight && singleSelect === dimensionName
            };
        },
        selectAllDimensions() {
            if (this.isApplyMode && this.applyMode.shouldCommitOnCancel) {
                this.prevMultiSelect = [...this.multiSelect];
                this.applyMode.shouldCommitOnCancel = false;
            }
            const dimensionIndexes = this.filteredList.filter(({ disabled }) => !disabled).map(({ index }) => index);
            this.dimensionOptions = this.dimensionOptions.map((filter) => ({
                ...filter,
                selected: dimensionIndexes.includes(filter.index)
            }));
            this.multiSelect = uniqBy(
                [...this.multiSelect, ...this.dimensionOptions.filter(({ selected }) => selected)],
                'name'
            );

            if (this.isApplyMode === false) {
                this.commitSelectedDimensionsToStore();
            }
        },
        async selectDimensionsFromClipboard() {
            const {
                props: { paginationOptions }
            } = this;
            const clipText = await navigator.clipboard.readText();
            const dimensions = clipText
                .replace(/\r|`/g, '')
                .split('\n')
                .flatMap((row) => row.split('\t'))
                .map((value) => value.trim())
                .filter(Boolean);

            const selectDimensions = () => {
                this.dimensionOptions = this.dimensionOptions.map(
                    /**
                     * @param {SelectOption} option
                     * @return {SelectOption}
                     */
                    (option) => ({
                        ...option,
                        // только полное совпадение по регистру и значению
                        // без вхождений
                        selected: dimensions.includes(option.name) || option.selected
                    })
                );

                const { isApplyMode, applyMode } = this;
                if (isApplyMode && applyMode.shouldCommitOnCancel) {
                    applyMode.shouldCommitOnCancel = false;
                    this.prevMultiSelect = [...this.multiSelect];
                }

                this.multiSelect = [...this.dimensionOptions.filter(({ selected }) => selected)];

                if (isApplyMode === false) {
                    this.commitSelectedDimensionsToStore();
                }
            };

            if (paginationOptions.isEnable) {
                // await this.ensureLoadData([]);
                // this.findDimension = dimensions.join(`${STRING_LIST_DELIMITER} `)
                await this.ensureLoadData(dimensions);
                const off = this.$watch(
                    () => this.dimensionOptions,
                    () => {
                        off();
                        this.findDimension = '';
                        selectDimensions();
                        this.ensureLoadData([]);
                    }
                );
            } else {
                selectDimensions();
            }
        },
        /**
         * @param {string[]} findDimensionList
         */
        async ensureLoadData(findDimensionList) {
            const {
                props: { paginationOptions, isSmartSearch }
            } = this;

            if (!paginationOptions.isEnable || isSmartSearch) {
                return;
            }
            await this.applyQueryParamsFilter(findDimensionList);
        },
        /**
         * @param {string[]} findDimensionList
         */
        applyQueryParamsFilter: debounce(async function (findDimensionList = this.findDimensionList) {
            const { selectedDimension } = this;
            const selectedDimensionFilter =
                findDimensionList.length === 0 ? null : this.resolveSelectedDimensionFilter(findDimensionList);

            const [request] = this.$storeApplyQueryFilters({
                [selectedDimension]: selectedDimensionFilter
            });

            if (request != null) {
                await this.loadDataPage(1);
            }
        }, 500),
        resolveSelectedDimensionFilter(findDimensionList) {
            const { selectedDimension } = this;
            const { isQueryFilterOperatorLike } = this.props;

            const operator = isQueryFilterOperatorLike
                ? this.QueryFilterOperator.LIKE
                : this.QueryFilterOperator.LIKE_CI;
            const value = isQueryFilterOperatorLike
                ? composeSearchFilterLikeValue(findDimensionList)
                : findDimensionList.map((value) => `%${value}%`);

            return this.$queryCreateStoreFilter({
                name: selectedDimension,
                operator,
                value
            });
        },
        clearEmbeddedSearch() {
            this.findDimension = '';
            this.ensureLoadData([]);
            this.commitPropFiltersToStore();
        },
        formatMetric(metric) {
            const { format } = this.props.metricOptions;
            return formatNumber(metric, format);
        },
        async onSortClick(direction) {
            const { selectedDimension } = this;

            if (this.activeSortDirection === direction) {
                this.activeSortDirection = '';
                this.requests.forEach((request) => {
                    request.query.sortRemove(selectedDimension);
                });
            } else {
                this.activeSortDirection = direction;
                this.requests.forEach((request) => {
                    request.query.sortAdd({ name: selectedDimension, direction });
                });
            }

            await this.loadDataPage();
        },
        resolveSortButtonClasses(direction) {
            return {
                'sort-button--active': this.activeSortDirection === direction
            };
        },
        resolveShouldShowMetric(metric) {
            const { isMetricDisplayed } = this.props;
            return isMetricDisplayed && metric;
        },
        onBtnCancelClick() {
            const { applyMode, isApplyMode } = this;
            const dimensionValues = (this.prevMultiSelect ?? []).reduce(
                (acc, { name, selected }) => (selected ? [...acc, name] : acc),
                []
            );
            this.setSelectedDimensions(dimensionValues, false);
            this.prevMultiSelect = [...this.multiSelect];

            // ensure commit to store
            if (isApplyMode && applyMode.shouldCommitOnCancel) {
                this.commitSelectedDimensionsToStore();
                applyMode.shouldCommitOnCancel = false;
            }
        },
        onBtnDoClick() {
            const { applyMode } = this;
            this.commitSelectedDimensionsToStore();
            applyMode.shouldCommitOnCancel = true;
        },
        /**
         * @param {ClipboardEvent} event
         */
        onEmbeddedSearchPaste(event) {
            const pasteString = event.clipboardData.getData('text/plain');
            this.resolveSearchValue(this.formatCellDataString(pasteString));
        },
        /**
         * @param {string} inputString
         * @return {string}
         */
        formatCellDataString(inputString) {
            return [
                ...new Set(
                    inputString
                        .split(EXCEL_PASTE_DELIMITER_RE)
                        .map((value) => value.trim())
                        .filter((value) => value !== '')
                )
            ].join(`${STRING_LIST_DELIMITER} `);
        }
    },
    implicitCssModule: true
};
</script>
