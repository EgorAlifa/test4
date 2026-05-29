<template>
    <ui-popover v-if="canShownPopover" v-bind="settings" :show.sync="isVisible">
        <div class="pivot-table-popover">
            <template v-if="canShownFilterContent">
                <div class="pivot-table-popover-search">
                    <input
                        type="text"
                        class="pivot-table-popover-search__input"
                        v-model="search"
                        placeholder="Поиск"
                        :disabled="isFilterActionsDisabled" />
                    <span type="text" class="pivot-table-popover-search__icon" />
                </div>
                <div class="pivot-table-popover-sort" v-if="shownSort">
                    <div class="pivot-table-popover-sort__label">Сортировка</div>
                    <div
                        class="pivot-table-popover-sort__value"
                        :class="ascClasses"
                        @click="setPlayerRowSort(false)"></div>
                    <div
                        class="pivot-table-popover-sort__value"
                        :class="descClasses"
                        @click="setPlayerRowSort(true)"></div>
                </div>
                <template v-if="isLoading">
                    <div class="pivot-table-popover-control" :style="filtersCssVars">
                        <div class="pivot-table-popover-control__label pivot-table-popover-control__label--center">
                            Загрузка...
                        </div>
                    </div>
                </template>
                <template v-else-if="errorMessage !== ''">
                    <div class="pivot-table-popover-control" :style="filtersCssVars">
                        <div class="pivot-table-popover-control__label pivot-table-popover-control__label--center">
                            {{ errorMessage }}
                        </div>
                    </div>
                    <div class="pivot-table-popover-tools">
                        <div class="pivot-table-popover-tools__elem">
                            <div
                                class="pivot-table-popover-button pivot-table-popover-button--colored"
                                @click="$emit('retry')">
                                Повторить
                            </div>
                        </div>
                    </div>
                </template>
                <template v-else>
                    <div class="pivot-table-popover-tools">
                        <div class="pivot-table-popover-tools__elem">
                            <div class="pivot-table-popover-button" @click="OnSelectAll">Выбрать все</div>
                        </div>
                        <div class="pivot-table-popover-tools__elem">
                            <div class="pivot-table-popover-button" @click="OnDropAll">Сбросить все</div>
                        </div>
                    </div>
                    <ui-recycle-scroller
                        v-if="isShownVirtualScroller"
                        :items="filtersSearched"
                        :style="filtersScrollerCssVars"
                        class="pivot-table-popover-scroller">
                        <template #default="{ item }">
                            <label class="pivot-table-popover-control" :style="filtersCssVars">
                                <div class="pivot-table-popover-control__control-container">
                                    <input
                                        class="checkbox"
                                        type="checkbox"
                                        :value="item[filterKey]"
                                        v-model="unreactiveFilters" />
                                </div>
                                <div class="pivot-table-popover-control__label" :title="item.name">
                                    <span>{{ item.name }}</span>
                                </div>
                            </label>
                        </template>
                    </ui-recycle-scroller>
                    <label
                        v-else
                        v-for="filter in filtersSearched"
                        :key="filter[filterKey] ?? filter.id ?? filter.name"
                        class="pivot-table-popover-control"
                        :style="filtersCssVars">
                        <div class="pivot-table-popover-control__control-container">
                            <input
                                class="checkbox"
                                type="checkbox"
                                :value="filter[filterKey]"
                                v-model="unreactiveFilters" />
                        </div>
                        <div class="pivot-table-popover-control__label" :title="filter.name">
                            <span
                                v-if="filter.colorSettings"
                                class="pivot-table-popover-control__color"
                                :style="resolveFilterColorStyle(filter.colorSettings)">
                                123
                            </span>
                            <span>{{ filter.name }}</span>
                        </div>
                    </label>
                    <div v-if="isShownVoidResult" class="pivot-table-popover-control" :style="filtersCssVars">
                        <div class="pivot-table-popover-control__label pivot-table-popover-control__label--center">
                            Нет совпадений
                        </div>
                    </div>
                    <div class="pivot-table-popover-tools">
                        <div class="pivot-table-popover-tools__elem">
                            <div
                                class="pivot-table-popover-button pivot-table-popover-button--colored"
                                @click="OnButtonSave">
                                Применить
                            </div>
                        </div>
                        <div class="pivot-table-popover-tools__elem">
                            <div class="pivot-table-popover-button" @click="OnButtonCancel">Отменить</div>
                        </div>
                    </div>
                    <div class="pivot-table-popover-tools" v-if="isCollapsable">
                        <div class="pivot-table-popover-tools__elem">
                            <div class="pivot-table-popover-button" @click="OnButtonCollapse">Свернуть всё</div>
                        </div>
                    </div>
                </template>
            </template>
            <template v-else>
                <div class="pivot-table-popover-sort" v-if="shownSort">
                    <div class="pivot-table-popover-sort__label">Сортировка</div>
                    <div
                        class="pivot-table-popover-sort__value"
                        :class="ascClasses"
                        @click="setPlayerRowSort(false, { forcedSave: true })"></div>
                    <div
                        class="pivot-table-popover-sort__value"
                        :class="descClasses"
                        @click="setPlayerRowSort(true, { forcedSave: true })"></div>
                </div>
            </template>
        </div>
    </ui-popover>
</template>

<script>
import { Popover } from 'goodteditor-ui';
import { RecycleScroller } from 'vue-virtual-scroller';
import { buildFiltersCssVars } from '../styles/css-vars';
import {
    createSimpleCondition,
    FILTER_HEIGHT,
    FILTER_SCROLLER_ITEMS_COUNT,
    ValueFilterLogicOperator
} from '../utils/constants';
import { ConditionsOptions } from '../utils/config';

export default {
    components: {
        UiRecycleScroller: RecycleScroller,
        UiPopover: Popover
    },
    static: {
        ConditionsOptions,
        ValueFilterLogicOperator
    },
    props: {
        valuesFilterFirst: {
            type: Object,
            default: () => createSimpleCondition()
        },
        valuesFilterSecond: {
            type: Object,
            default: () => createSimpleCondition()
        },
        valuesFilterOperator: {
            type: String,
            default: ValueFilterLogicOperator.AND
        },
        filterKey: {
            type: String,
            default: 'name'
        },
        visible: {
            type: Boolean,
            default: false
        },
        settings: {
            type: Object,
            default: () => ({})
        },
        isSort: {
            type: Boolean,
            default: true
        },
        isSortDesc: {
            type: Boolean,
            default: false
        },
        shownSort: {
            type: Boolean,
            default: true
        },
        filters: {
            type: Array,
            default: () => []
        },
        usedFilters: {
            type: Array,
            default: () => []
        },
        isCollapsable: {
            type: Boolean,
            default: true
        },
        isFilterAvailable: {
            type: Boolean,
            default: false
        },
        isLoading: {
            type: Boolean,
            default: false
        },
        errorMessage: {
            type: String,
            default: ''
        }
    },
    data: (vm) => ({
        isVisible: vm.visible,
        search: '',
        isSetProps: false,
        isInit: false,
        filtersUpdateKey: Symbol(''),
        copyProps: {
            isSort: true,
            isSortDesc: false,
            filters: [],
            valuesFilterFirst: createSimpleCondition(),
            valuesFilterSecond: createSimpleCondition(),
            valuesFilterOperator: ValueFilterLogicOperator.AND
        }
    }),
    computed: {
        canShownPopover() {
            return this.canShownFilterContent || this.shownSort || this.isLoading || this.errorMessage !== '';
        },
        canShownFilterContent() {
            return this.isFilterAvailable || this.filters.length > 0;
        },
        isFilterActionsDisabled() {
            return this.isLoading || this.errorMessage !== '';
        },
        filtersCssVars() {
            return buildFiltersCssVars({ height: FILTER_HEIGHT });
        },
        filtersScrollerCssVars() {
            return buildFiltersCssVars({ height: FILTER_HEIGHT * FILTER_SCROLLER_ITEMS_COUNT });
        },
        filtersSorted() {
            const { isSortDesc, filters } = this;
            const collator = new Intl.Collator('ru-kn', { sensitivity: 'base', ignorePunctuation: true });
            const comparedFn = ({ name: aName }, { name: bName }) =>
                isSortDesc ? collator.compare(bName, aName) : collator.compare(aName, bName);
            return filters.toSorted(comparedFn);
        },
        filtersSearched() {
            const { filterKey } = this;
            const searchLower = this.search.toLowerCase();
            return this.filtersSorted.filter(({ [filterKey]: name }) => `${name}`.toLowerCase().includes(searchLower));
        },
        isShownVirtualScroller() {
            return this.filtersSearched.length > FILTER_SCROLLER_ITEMS_COUNT;
        },
        isShownVoidResult() {
            return this.filtersSearched.length === 0;
        },
        ascClasses() {
            const { isSortDesc, isSort } = this.copyProps;
            return {
                'pivot-table-popover-sort__value--active': !isSortDesc && isSort,
                'pivot-table-popover-sort__value--asc': isSortDesc || !isSort,
                'pivot-table-popover-sort__value--asc-active': !isSortDesc && isSort
            };
        },
        descClasses() {
            const { isSortDesc, isSort } = this.copyProps;
            return {
                'pivot-table-popover-sort__value--active': isSortDesc && isSort,
                'pivot-table-popover-sort__value--desc': !isSortDesc || !isSort,
                'pivot-table-popover-sort__value--desc-active': isSortDesc && isSort
            };
        },
        unreactiveFilters: {
            get() {
                const { filtersUpdateKey } = this;
                return this.unreactiveFiltersBuf ?? [];
            },
            set(val) {
                this.filtersUpdateKey = Symbol('');
                this.unreactiveFiltersBuf = val;
            }
        }
    },
    watch: {
        /** .sync modifier supported */
        visible() {
            this.isVisible = this.visible;
        },
        isVisible() {
            const { isVisible, updateData } = this;
            this.$emit('update:visible', isVisible);
            if (!isVisible) {
                return;
            }
            updateData();
        },
        copyProps: {
            deep: true,
            handler() {
                if (!this.isInit) {
                    this.isInit = true;
                    return;
                }
                this.isSetProps = true;
            }
        },
        usedFilters() {
            if (this.isVisible) {
                this.updateData();
            }
        }
    },
    created() {
        this.updateData();
    },

    methods: {
        resolveFilterColorStyle({ color, backgroundColor }) {
            return {
                color,
                backgroundColor
            };
        },
        saveData() {
            const {
                copyProps: { isSortDesc, isSort, valuesFilterFirst, valuesFilterSecond, valuesFilterOperator },
                unreactiveFilters
            } = this;
            this.$emit('saved', {
                isSortDesc,
                usedFilters: unreactiveFilters,
                isSort,
                valuesFilterFirst,
                valuesFilterSecond,
                valuesFilterOperator
            });
        },
        updateData() {
            const { isSortDesc, isSort, usedFilters, valuesFilterFirst, valuesFilterSecond, valuesFilterOperator } =
                this;

            this.search = '';
            this.isInit = false;
            this.isSetProps = false;
            this.copyProps = {
                isSort,
                isSortDesc,
                valuesFilterFirst: createSimpleCondition(valuesFilterFirst),
                valuesFilterSecond: createSimpleCondition(valuesFilterSecond),
                valuesFilterOperator
            };
            this.unreactiveFilters = usedFilters;
        },
        close() {
            this.isVisible = false;
        },

        setPlayerRowSort(val, { forcedSave = false } = {}) {
            if (this.isFilterActionsDisabled) {
                return;
            }
            this.copyProps.isSortDesc = val;
            this.copyProps.isSort = true;
            if (forcedSave) {
                this.saveData();
            }
        },
        OnSelectAll() {
            if (this.isFilterActionsDisabled) {
                return;
            }
            const { unreactiveFilters, filtersSearched, filterKey } = this;
            this.unreactiveFilters = Array.from(
                new Set(filtersSearched.map(({ [filterKey]: name }) => name).concat(unreactiveFilters))
            );
        },
        OnDropAll() {
            if (this.isFilterActionsDisabled) {
                return;
            }
            const { unreactiveFilters, filtersSearched, filterKey } = this;
            if (filtersSearched.length === unreactiveFilters.length) {
                this.unreactiveFilters = [];
                return;
            }
            this.unreactiveFilters = Array.from(
                new Set(unreactiveFilters).difference(new Set(filtersSearched.map(({ [filterKey]: name }) => name)))
            );
        },
        OnButtonSave() {
            if (this.isFilterActionsDisabled) {
                return;
            }
            this.saveData();
            this.close();
        },
        OnButtonCancel() {
            this.updateData();
            this.close();
        },
        OnButtonCollapse() {
            this.$emit('collapse');
        }
    },
    implicitCssModule: true
};
</script>

<style src="./styles/filterPopover.pcss" lang="pcss" module></style>
