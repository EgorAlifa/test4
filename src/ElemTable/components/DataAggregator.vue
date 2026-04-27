<template>
    <div :style="cssStyle">
        <slot></slot>
    </div>
</template>
<script>
import { isEqual } from 'lodash';

export default {
    inject: {
        $widget: {
            default: null
        },
        row: {
            default: null
        }
    },
    provide(vm = this) {
        const childTable = {
            get filter() {
                return vm.rowData?.[vm.fieldToSelectFilter] ?? null;
            }
        };
        const row = {
            get selectedRows() {
                return vm.row.selectedRows;
            },
            get isSelectedRow() {
                const { metricForSelect } = vm;
                const isMetricForSelectDefined = metricForSelect != null && metricForSelect !== '';

                return vm.row.selectedRows.some((rowData) => {
                    const isMatchedByMetric =
                        isMetricForSelectDefined &&
                        rowData?.[metricForSelect] != null &&
                        rowData?.[metricForSelect] === vm.rowData?.[metricForSelect];

                    return isEqual(rowData, vm.rowData) || isMatchedByMetric;
                });
            },
            get rowIndex() {
                return vm.rowIndex;
            },
            setSelectedRow: vm.row.setSelectedRow,
            runActions: vm.row.runActions
        };
        const data = {
            get rowData() {
                return vm.rowData;
            }
        };

        return {
            childTable,
            row,
            data
        };
    },
    props: {
        /**
         * @public
         */
        rowData: {
            type: Object,
            default: () => ({})
        },
        rowIndex: {
            type: Number,
            default: 0
        },
        fieldToSelectFilter: {
            type: String,
            default: null
        },
        metricForSelect: {
            type: String,
            default: null
        }
    },
    computed: {
        widgetProps() {
            return this.$widget.props;
        },
        cssStyle() {
            const { widgetProps, rowIndex } = this;

            if (widgetProps.zebraStyle.isShown && rowIndex % 2 !== 0) {
                return {
                    backgroundColor: 'var(--w-table-zebra_bg-color)',
                    color: 'var(--w-table-zebra_color)'
                };
            }

            return null;
        }
    }
};
</script>
