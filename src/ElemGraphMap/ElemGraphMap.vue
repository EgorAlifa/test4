<template>
    <w-elem :placeholder="shouldShowPlaceholder ? $placeholder : false" class="elem-graph-map">
        <div v-if="isLoading && props.showLoading" class="graph-map-loading">
            <div class="graph-map-loading-spinner"></div>
            <p class="graph-map-loading-text">Загрузка графа...</p>
        </div>

        <div
            v-else-if="!hasData"
            class="graph-map-empty"
            role="status"
            aria-label="Нет данных для графа"
        >
            <div class="graph-map-empty-content">
                <span class="graph-map-empty-icon" aria-hidden="true">⊘</span>
                <div class="graph-map-empty-title">Нет данных</div>
                <div class="graph-map-empty-desc">{{ emptyMessage }}</div>
            </div>
        </div>

        <div v-else class="graph-map-wrapper">
            <div
                ref="chartRef"
                class="graph-map-chart"
                role="img"
                :aria-label="`Графовая карта: ${displayGraphData.nodes.length} узлов, ${displayGraphData.links.length} связей`"
            />
        </div>
    </w-elem>
</template>

<script>
import { Elem } from '@goodt-wcore/elem';
import { useElemDatasetMixin, ElemDatasetMixinTypes } from '@goodt-common/data';
import echarts from 'echarts';
import { meta } from './descriptor';
import { ElemInstanceTypeDescriptor } from './types';
import { buildGraphFromDatasetRows } from './utils';
import { NODE_TYPES } from './constants';

const DatasetMixin = useElemDatasetMixin({
    drilldown: false,
    panel: false
});

export default {
    extends: Elem,
    mixins: [DatasetMixin],

    meta,

    hooks: {
        before() {
            this.isLoading = true;
        },
        then(results) {
            this.applyResult(results);
        },
        catch() {
            this.graphData = { nodes: [], links: [] };
        },
        finally() {
            this.isLoading = false;
        }
    },

    data() {
        return {
            isLoading: false,
            graphData: { nodes: [], links: [] },
            chartInstance: null,
            lastRowCount: 0,
            ...ElemDatasetMixinTypes,
            ...ElemInstanceTypeDescriptor
        };
    },

    computed: {
        hasData() {
            const { nodes = [], links = [] } = this.graphData;
            return nodes.length > 0 || links.length > 0;
        },

        displayGraphData() {
            return this.graphData;
        },

        shouldShowPlaceholder() {
            return !this.hasData && !this.isLoading;
        },

        emptyMessage() {
            const hasDremio = this.props.dremio && this.props.dremio.length > 0;
            if (!hasDremio) {
                return 'Добавьте источник данных в настройках виджета.';
            }
            if (!this.props.sourceIdField || !this.props.targetIdField) {
                return 'Выберите «Поле ID источника» и «Поле ID цели» в настройках — граф построится по данным.';
            }
            if (this.lastRowCount > 0) {
                return `Загружено строк: ${this.lastRowCount}. Проверьте соответствие полей колонкам датасета.`;
            }
            return 'Нет данных для отображения. Проверьте датасет и фильтры.';
        },

        chartOption() {
            const { nodes = [], links = [] } = this.displayGraphData;
            const p = this.props;
            const colorByType = {
                [NODE_TYPES.FACTOR]: p.nodeColorFactor,
                [NODE_TYPES.OPERATION]: p.nodeColorOperation,
                [NODE_TYPES.CRITICAL]: p.nodeColorCritical
            };
            const sizeByType = {
                [NODE_TYPES.FACTOR]: p.nodeSizeFactor,
                [NODE_TYPES.OPERATION]: p.nodeSizeOperation,
                [NODE_TYPES.CRITICAL]: p.nodeSizeCritical
            };
            const categories = [
                { name: NODE_TYPES.FACTOR, itemStyle: { color: colorByType[NODE_TYPES.FACTOR] } },
                { name: NODE_TYPES.OPERATION, itemStyle: { color: colorByType[NODE_TYPES.OPERATION] } },
                { name: NODE_TYPES.CRITICAL, itemStyle: { color: colorByType[NODE_TYPES.CRITICAL] } }
            ];
            const nodeData = nodes.map((n) => ({
                ...n,
                symbolSize: sizeByType[n.category] ?? p.nodeSizeFactor,
                itemStyle: { color: colorByType[n.category] ?? p.nodeColorFactor }
            }));
            const linkData = links.map((link) => ({
                ...link,
                lineStyle: {
                    color: p.edgeColor,
                    opacity: p.edgeOpacity,
                    ...(link.lineStyle || {})
                }
            }));

            return {
                tooltip: {
                    trigger: 'item',
                    formatter: (params) => {
                        if (!params || typeof params.data === 'function') return '';
                        if (params.dataType === 'node') {
                            return (params.data && (params.data.label || params.name)) || params.name || '';
                        }
                        if (params.data) {
                            return `${params.data.source} → ${params.data.target}`;
                        }
                        return String(params.name || '');
                    }
                },
                series: [
                    {
                        type: 'graph',
                        layout: 'force',
                        roam: true,
                        draggable: true,
                        edgeSymbol: ['none', 'arrow'],
                        edgeSymbolSize: [0, 10],
                        data: nodeData,
                        edges: linkData,
                        categories,
                        force: {
                            repulsion: 200,
                            gravity: 0.1,
                            edgeLength: [80, 150],
                            layoutAnimation: true
                        },
                        label: {
                            show: true,
                            position: 'right',
                            formatter: (params) => {
                                if (!params || typeof params.data === 'function') return params?.name ?? '';
                                return (params.data && (params.data.label ?? params.name)) ?? params.name ?? '';
                            }
                        },
                        lineStyle: {
                            color: p.edgeColor,
                            opacity: p.edgeOpacity,
                            curveness: 0.2
                        }
                    }
                ]
            };
        }
    },

    watch: {
        chartOption: {
            handler() {
                this.updateChart();
            },
            deep: true
        },
        'props.dremio': {
            handler(val) {
                if (val && val.length > 0 && this.props.sourceIdField && this.props.targetIdField) {
                    this.loadData();
                }
            },
            deep: true
        },
        'props.sourceIdField'() {
            if (this.props.dremio?.length && this.props.targetIdField) this.loadData();
        },
        'props.targetIdField'() {
            if (this.props.dremio?.length && this.props.sourceIdField) this.loadData();
        },
        result: {
            handler(newResult) {
                if (newResult && this.props.sourceIdField && this.props.targetIdField) {
                    this.applyResult(newResult);
                }
            },
            immediate: false
        },
    },

    mounted() {
        if (this.props.dremio?.length && this.props.sourceIdField && this.props.targetIdField) {
            if (this.result) {
                this.applyResult(this.result);
            } else {
                this.loadData();
            }
        }
        this.$nextTick(() => {
            if (this.hasData) this.updateChart();
        });
    },

    beforeDestroy() {
        window.removeEventListener('resize', this.handleResize);
        if (this.chartInstance) {
            this.chartInstance.dispose();
            this.chartInstance = null;
        }
    },

    methods: {
        ...ElemInstanceTypeDescriptor,
        ...ElemDatasetMixinTypes,

        applyResult(results) {
            const rows = this.getRowsFromResults(results);
            this.lastRowCount = rows ? rows.length : 0;
            if (!rows || rows.length === 0) {
                this.graphData = { nodes: [], links: [] };
                return;
            }
            const fieldNames = {
                sourceId: this.props.sourceIdField,
                targetId: this.props.targetIdField,
                weight: this.props.weightField || null,
                sourceLabel: this.props.sourceLabelField || null,
                targetLabel: this.props.targetLabelField || null,
                sourceType: this.props.sourceTypeField || null,
                targetType: this.props.targetTypeField || null
            };
            this.graphData = buildGraphFromDatasetRows(rows, fieldNames, {
                weightToWidth: this.props.useWeightForWidth,
                minEdgeWidth: this.props.edgeWidthMin,
                maxEdgeWidth: this.props.edgeWidthMax,
                defaultEdgeWidth: 1.5
            });
            this.$nextTick(() => this.updateChart());
        },

        getRowsFromResults(results) {
            if (!results) return [];
            const rawRows = results.rows && Array.isArray(results.rows)
                ? results.rows
                : results.data?.rows && Array.isArray(results.data.rows)
                    ? results.data.rows
                    : Array.isArray(results)
                        ? (results[0]?.rows && Array.isArray(results[0].rows)
                            ? results[0].rows
                            : results[0]?.data?.rows && Array.isArray(results[0].data.rows)
                                ? results[0].data.rows
                                : Array.isArray(results[0])
                                    ? results[0]
                                    : [])
                        : [];
            if (!rawRows.length) return [];
            const first = rawRows[0];
            const meta = results.columns || (Array.isArray(results) && results[0] ? results[0].columns : null)
                || results.fields || (Array.isArray(results) && results[0] ? results[0].fields : null);
            if (Array.isArray(first) && meta && Array.isArray(meta)) {
                const cols = meta.map((c) => (typeof c === 'object' ? c.name || c.id || c.key : c));
                return rawRows.map((arr) => {
                    const obj = {};
                    cols.forEach((name, i) => { obj[name] = arr[i]; });
                    return obj;
                });
            }
            return rawRows;
        },

        initChart() {
            if (!this.$refs.chartRef) return;
            if (this.chartInstance) {
                this.chartInstance.dispose();
                this.chartInstance = null;
            }
            this.chartInstance = echarts.init(this.$refs.chartRef);
            window.addEventListener('resize', this.handleResize);
        },

        handleResize() {
            this.chartInstance?.resize();
        },

        updateChart() {
            if (!this.hasData) return;
            this.$nextTick(() => {
                if (!this.chartInstance && this.$refs.chartRef) {
                    this.initChart();
                }
                if (this.chartInstance) {
                    const opt = this.getPlainChartOption();
                    this.chartInstance.setOption(opt, true);
                    this.chartInstance.resize();
                }
            });
        },

        /**
         * Возвращает копию опции без реактивности Vue, чтобы ECharts не получал Proxy
         * и не возникала ошибка "n.data is not a function".
         */
        getPlainChartOption() {
            const opt = this.chartOption;
            const clone = (v) => {
                if (v == null || typeof v !== 'object') return v;
                if (typeof v === 'function') return v;
                if (Array.isArray(v)) return v.map(clone);
                return Object.keys(v).reduce((acc, k) => {
                    acc[k] = clone(v[k]);
                    return acc;
                }, {});
            };
            return clone(opt);
        }
    }
};
</script>

<style lang="pcss" scoped>
.elem-graph-map {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    min-height: 0;
}

.graph-map-loading,
.graph-map-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    min-height: 200px;
    width: 100%;
}

.graph-map-wrapper {
    flex: 1;
    width: 100%;
    min-height: 0;
    position: relative;
}


.graph-map-chart {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    min-height: 300px;
}

.graph-map-loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #e5e7eb;
    border-top-color: #8b5cf6;
    border-radius: 50%;
    animation: graph-map-spin 0.8s linear infinite;
}

.graph-map-loading-text {
    margin-left: 12px;
    color: #6b7280;
    font-size: 14px;
}

.graph-map-empty-content {
    text-align: center;
    color: #9ca3af;
}

.graph-map-empty-icon {
    font-size: 48px;
    line-height: 1;
    opacity: 0.5;
}

.graph-map-empty-title {
    font-size: 16px;
    font-weight: 500;
    margin-top: 8px;
}

.graph-map-empty-desc {
    font-size: 13px;
    margin-top: 4px;
}

@keyframes graph-map-spin {
    to {
        transform: rotate(360deg);
    }
}
</style>
