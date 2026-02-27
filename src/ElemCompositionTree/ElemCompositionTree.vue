<template>
    <w-elem :placeholder="$placeholder" class="elem-decomposition-tree" :style="rootStyle">
        <div
            v-if="!hasData"
            class="decomp-tree-empty"
            role="status"
            aria-label="Нет данных для дерева декомпозиции"
        >
            <div class="decomp-tree-empty-content">
                <span class="decomp-tree-empty-icon" aria-hidden="true">⊘</span>
                <div class="decomp-tree-empty-title">Нет данных</div>
                <div class="decomp-tree-empty-desc">{{ emptyMessage }}</div>
            </div>
        </div>

        <div v-else class="decomp-tree-wrapper">
            <div
                class="decomp-tree-scroll"
                ref="treeRef"
                role="tree"
                aria-label="Дерево декомпозиции"
            >
                <div class="decomp-tree-content" ref="columnsRef">
                    <div class="decomp-tree-columns">
                        <template v-for="(col, colIndex) in treeColumns">
                            <div
                                v-if="colIndex > 0"
                                class="decomp-tree-connector-col"
                                aria-hidden="true"
                            />
                            <div class="decomp-tree-column" role="group">
                                <div class="decomp-tree-column-header">
                                    <div class="decomp-tree-column-header__label">{{ col.headerTitle }}</div>
                                    <div class="decomp-tree-column-header__actions">
                                        <div
                                            class="decomp-tree-column-header__filter-box"
                                            :class="{ 'decomp-tree-column-header__filter-box--active': col.appliedFilter }"
                                        >
                                            <span class="decomp-tree-column-header__filter-value">{{ col.appliedFilter || (colIndex === 0 ? '' : '—') }}</span>
                                            <button
                                                v-if="col.appliedFilter"
                                                type="button"
                                                class="decomp-tree-column-header__clear"
                                                aria-label="Сбросить фильтр"
                                                @click.stop="clearPathAt(colIndex)"
                                            >
                                                ×
                                            </button>
                                        </div>
                                        <button
                                            v-if="colIndex > 0"
                                            type="button"
                                            class="decomp-tree-column-header__exclude"
                                            aria-label="Исключить уровень"
                                            title="Исключить уровень"
                                            @click.stop="excludeLevel(colIndex)"
                                        >
                                            ⊖
                                        </button>
                                    </div>
                                </div>
                                <div class="decomp-tree-column-nodes">
                                    <div
                                        v-for="(node, nodeIndex) in col.nodes"
                                        :key="node.pathKey + '-' + nodeIndex"
                                        class="decomp-tree-node-wrap"
                                        :data-col-index="colIndex"
                                        :data-node-index="nodeIndex"
                                    >
                                        <div
                                            class="decomp-tree-node"
                                            :class="{
                                                'decomp-tree-node--root': node.isRoot,
                                                'decomp-tree-node--selected': isNodeInSelectedPath(node, colIndex)
                                            }"
                                            role="treeitem"
                                            :aria-expanded="hasExpanded(node, colIndex) ? 'true' : 'false'"
                                            :aria-label="nodeLabel(node)"
                                            tabindex="0"
                                            @click="handleNodeClick(node, colIndex)"
                                            @keydown="handleNodeKeydown($event, node, colIndex)"
                                        >
                                            <div class="decomp-tree-node__bar-row">
                                                <div
                                                    class="decomp-tree-node__bar decomp-tree-node__bar--value"
                                                    :class="{ 'decomp-tree-node__bar--value-selected': isNodeInSelectedPath(node, colIndex) }"
                                                    :style="barStyleForLevel(colIndex, node, col)"
                                                />
                                                <div
                                                    class="decomp-tree-node__bar decomp-tree-node__bar--rest"
                                                    :style="{ width: (100 - barWidthPercent(node, col)) + '%' }"
                                                />
                                            </div>
                                            <div class="decomp-tree-node__caption">
                                                <div class="decomp-tree-node__label">
                                                    {{ node.dimensionValue != null ? node.dimensionValue : (props.metricName || 'Итого') }}
                                                </div>
                                                <div class="decomp-tree-node__value">{{ formatMetric(node.value) }}</div>
                                            </div>
                                            <button
                                                v-if="canExpand(node, colIndex)"
                                                type="button"
                                                class="decomp-tree-node__plus"
                                                :class="{ 'decomp-tree-node__plus--selected': isNodeInSelectedPath(node, colIndex) }"
                                                aria-label="Разбить по измерению"
                                                @click.stop="toggleExpand(node, colIndex)"
                                            >
                                                +
                                            </button>
                                        </div>

                                        <div
                                            v-if="expandingPathKey === node.pathKey"
                                            class="decomp-tree-expand-menu"
                                            role="menu"
                                        >
                                            <div class="decomp-tree-expand-menu-title">Разбить по</div>
                                            <button
                                                v-for="dim in availableDimensionsFor(node, colIndex)"
                                                :key="dim"
                                                type="button"
                                                class="decomp-tree-expand-menu-item"
                                                role="menuitem"
                                                @click.stop="expandByDimension(node, dim, colIndex)"
                                            >
                                                {{ dim }}
                                            </button>
                                            <button
                                                type="button"
                                                class="decomp-tree-expand-menu-close"
                                                aria-label="Закрыть"
                                                @click.stop="expandingPathKey = null"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </template>
                    </div>
                    <svg
                        v-if="branchPaths.length > 0"
                        class="decomp-tree-branches-svg"
                        :width="svgSize.width"
                        :height="svgSize.height"
                        :viewBox="`0 0 ${svgSize.width} ${svgSize.height}`"
                        preserveAspectRatio="none"
                    >
                        <path
                            v-for="(bp, idx) in branchPaths"
                            :key="idx"
                            :d="bp.d"
                            :class="['decomp-tree-branch', bp.active ? 'decomp-tree-branch--active' : 'decomp-tree-branch--inactive']"
                            fill="none"
                        />
                    </svg>
                </div>
            </div>
        </div>
    </w-elem>
</template>

<script>
import { Elem } from '@goodt-wcore/elem';
import { useElemDatasetBaseMixin, ElemDatasetBaseMixinTypes } from '@goodt-common/data';
import {
    aggregateSum,
    filterRowsByPath,
    getDimensionValuesWithMetric,
    formatMetricValue
} from './utils';
import { meta } from './descriptor';

const DatasetMixin = useElemDatasetBaseMixin({
    drilldown: false,
    panel: false,
    deviations: false
});

const pathToKey = (path) => {
    if (!path || path.length === 0) return 'root';
    return path.map((p) => `${p.dimensionName}:${p.value}`).join(',');
};

export default {
    extends: Elem,
    mixins: [DatasetMixin],

    meta,

    hooks: {
        then(results) {
            this.results = results || [];
            this.buildTree();
        }
    },

    data() {
        return {
            results: [],
            isLoading: false,
            levelExpandedDimensions: [],
            expandingPathKey: null,
            treeData: null,
            selectedPath: [],
            highlightedPath: [],
            branchPaths: [],
            svgSize: { width: 0, height: 0 },
            _drawBranchesTimer: null,
            _defaultsApplied: false,
            _syncStateTimer: null,
            ...ElemDatasetBaseMixinTypes
        };
    },

    computed: {
        rootStyle() {
            const { nodeColor, rootNodeColor, activeNodeColor, connectorColor, plusButtonBg, labelColor, valueColor } = this.props;
            const activeColor = activeNodeColor || '#FF6B35';
            const hexToRgba = (hex, alpha) => {
                const h = (hex || '').replace('#', '');
                let r, g, b;
                if (h.length === 3) {
                    r = parseInt(h[0] + h[0], 16);
                    g = parseInt(h[1] + h[1], 16);
                    b = parseInt(h[2] + h[2], 16);
                } else {
                    r = parseInt(h.substring(0, 2), 16);
                    g = parseInt(h.substring(2, 4), 16);
                    b = parseInt(h.substring(4, 6), 16);
                }
                if (isNaN(r) || isNaN(g) || isNaN(b)) return `rgba(255, 107, 53, ${alpha})`;
                return `rgba(${r}, ${g}, ${b}, ${alpha})`;
            };
            return {
                '--decomp-node-color': nodeColor,
                '--decomp-root-color': rootNodeColor,
                '--decomp-active-color': activeColor,
                '--decomp-active-bg': hexToRgba(activeColor, 0.08),
                '--decomp-active-mid': hexToRgba(activeColor, 0.20),
                '--decomp-active-hover': hexToRgba(activeColor, 0.05),
                '--decomp-connector-color': connectorColor,
                '--decomp-plus-bg': plusButtonBg,
                '--decomp-label-color': labelColor || '',
                '--decomp-value-color': valueColor || ''
            };
        },

        rows() {
            const r = this.results[0];
            return (r && r.rows) || [];
        },

        hasData() {
            return this.rows.length > 0 && this.props.metricName;
        },

        emptyMessage() {
            if (!this.props.dremio || this.props.dremio.length === 0) {
                return 'Выберите источник данных в блоке «Источник данных» выше. Если список пуст — добавьте датасет на страницу отчёта.';
            }
            if (!this.props.metricName) {
                return 'Выберите метрику для анализа в панели «Метрики».';
            }
            if (this.rows.length === 0) {
                return 'Нет строк в данных. Проверьте датасет и фильтры.';
            }
            return 'Нет данных для отображения.';
        },

        treeColumns() {
            if (!this.treeData) return [];
            const root = this.treeData;
            const columns = [];
            columns.push({
                headerTitle: this.props.metricName || 'Итого',
                appliedFilter: null,
                nodes: [root],
                maxValue: root.value > 0 ? root.value : 1
            });

            let nodesAtLevel = [root];
            for (let level = 1; level < 50; level++) {
                const expandedDim = this.levelExpandedDimensions[level - 1];
                if (!expandedDim) break;
                const nextRaw = nodesAtLevel.flatMap((n) => n.children || []);
                if (nextRaw.length === 0) break;

                const groupByValue = new Map();
                for (const node of nextRaw) {
                    const key = node.dimensionValue != null ? String(node.dimensionValue) : '';
                    if (!groupByValue.has(key)) {
                        groupByValue.set(key, []);
                    }
                    groupByValue.get(key).push(node);
                }

                const mergedNodes = [];
                const nextDim = this.levelExpandedDimensions[level];
                for (const [dimValue, group] of groupByValue.entries()) {
                    const parentPathKeysSet = new Set();
                    for (const n of group) {
                        const parentPath = n.path && n.path.length > 0 ? n.path.slice(0, -1) : [];
                        parentPathKeysSet.add(pathToKey(parentPath));
                        if (parentPath.length > 0) {
                            parentPathKeysSet.add(pathToKey(parentPath.slice(-1)));
                        }
                    }
                    const path = [{ dimensionName: expandedDim, value: dimValue }];
                    const pathKey = pathToKey(path);
                    const value = group.reduce((sum, n) => sum + (n.value || 0), 0);
                    let planVal = null;
                    if (this.props.planField) {
                        planVal = group.reduce((sum, n) => sum + (n.planValue != null ? n.planValue : 0), 0);
                    }
                    const fullPath = (group[0] && group[0].path && group[0].path.length > 0)
                        ? group[0].path.map((p) => ({ dimensionName: p.dimensionName, value: p.value }))
                        : path.slice();
                    const mergedNode = {
                        pathKey,
                        path,
                        fullPath,
                        value,
                        planValue: planVal,
                        dimensionName: expandedDim,
                        dimensionValue: dimValue,
                        isRoot: false,
                        parentPathKeys: Array.from(parentPathKeysSet),
                        children: nextDim ? this.buildChildrenForPath(fullPath, nextDim) : []
                    };
                    mergedNodes.push(mergedNode);
                }

                const maxValue = Math.max(...mergedNodes.map((n) => n.value), 1);
                const selectedAtLevel = this.selectedPath[level - 1];
                columns.push({
                    headerTitle: expandedDim,
                    appliedFilter: selectedAtLevel ? selectedAtLevel.value : null,
                    nodes: mergedNodes,
                    maxValue
                });
                nodesAtLevel = mergedNodes;
            }
            return columns;
        }
    },

    watch: {
        results: { handler() { this.buildTree(); }, deep: true },
        'props.metricName'() {
            this.buildTree();
            if (this.props.dremio?.length && this.requests?.length) this.loadData();
        },
        'props.explainByDimensionNames'() {
            this.buildTree();
            if (this.props.dremio?.length && this.requests?.length) this.loadData();
        },
        'props.topNPerLevel'() { this.buildTree(); },
        'props.planField'() { this.buildTree(); },
        treeColumns: { handler() { this.scheduleDrawBranches(); }, deep: true },
        selectedPath: { handler() { this.scheduleDrawBranches(); this.syncDefaultStateToProps(); }, deep: true },
        highlightedPath: { handler() { this.scheduleDrawBranches(); }, deep: true },
        levelExpandedDimensions: { handler() { this.syncDefaultStateToProps(); }, deep: true },
        'props.dremio': {
            handler(val) {
                if (val && val.length > 0) {
                    if (this.requests?.length) {
                        this.loadData();
                    } else {
                        this.$nextTick(() => {
                            if (this.requests?.length) this.loadData();
                        });
                    }
                }
            },
            deep: true
        }
    },

    mounted() {
        if (this.props.dremio && this.props.dremio.length > 0 && this.requests && this.requests.length > 0) {
            this.loadData();
        } else {
            this.$nextTick(() => {
                if (this.props.dremio?.length && this.requests?.length) this.loadData();
            });
        }
        this.scheduleDrawBranches();
    },

    beforeDestroy() {
        if (this._drawBranchesTimer) {
            clearTimeout(this._drawBranchesTimer);
        }
        if (this._syncStateTimer) {
            clearTimeout(this._syncStateTimer);
        }
    },

    methods: {
        async loadData(requests = this.requests) {
            if (!requests || requests.length === 0) return;
            this.$requestCancel(requests);
            this.isLoading = true;
            try {
                let results = await Promise.all(requests.map((r) => r?.send()));
                results = results.map((res, i) => res ?? this.results[i] ?? null);
                this.results = results;
                this.$options.hooks.then.call(this, this.results);
            } catch (err) {
                this.results = [];
                this.$handleError(err);
            } finally {
                this.isLoading = false;
            }
        },

        buildTree() {
            const rows = this.rows;
            const { metricName, explainByDimensionNames, topNPerLevel, planField } = this.props;
            if (!rows.length || !metricName) {
                this.treeData = null;
                return;
            }

            const topN = Math.max(1, Math.min(50, topNPerLevel || 10));

            const buildNode = (path, dimensionName, dimensionValue, isRoot = false) => {
                const pathKey = pathToKey(path);
                const filtered = filterRowsByPath(rows, path);
                const value = aggregateSum(filtered, metricName);
                let planVal = null;
                if (planField) {
                    planVal = aggregateSum(filtered, planField);
                }

                const node = {
                    pathKey,
                    path: path.slice(),
                    value,
                    planValue: planVal,
                    dimensionName: dimensionName || null,
                    dimensionValue: dimensionValue != null ? dimensionValue : null,
                    isRoot,
                    children: []
                };

                const expandedDim = this.levelExpandedDimensions[path.length];
                if (expandedDim && explainByDimensionNames && explainByDimensionNames.includes(expandedDim)) {
                    const options = getDimensionValuesWithMetric(filtered, expandedDim, metricName, topN);
                    node.children = options.map((opt) =>
                        buildNode(
                            path.concat([{ dimensionName: expandedDim, value: opt.value }]),
                            expandedDim,
                            opt.value,
                            false
                        )
                    );
                }
                return node;
            };

            this.treeData = buildNode([], null, null, true);
            this.applyDefaultStateIfNeeded();
        },

        availableDimensionsFor(node, colIndex) {
            const usedAtLevels = (this.levelExpandedDimensions || []).slice(0, colIndex);
            return (this.props.explainByDimensionNames || []).filter(
                (d) => !usedAtLevels.includes(d)
            );
        },

        canExpand(node, colIndex) {
            return this.availableDimensionsFor(node, colIndex).length > 0;
        },

        hasExpanded(node, colIndex) {
            return Boolean(this.levelExpandedDimensions[colIndex]);
        },

        toggleExpand(node, colIndex) {
            if (this.expandingPathKey === node.pathKey) {
                this.expandingPathKey = null;
                return;
            }
            if (!this.isNodeInSelectedPath(node, colIndex)) {
                this.selectedPath = node.path.map((p) => ({ dimensionName: p.dimensionName, value: p.value }));
                this.highlightedPath = (node.fullPath && node.fullPath.length > 0)
                    ? node.fullPath.map((p) => ({ dimensionName: p.dimensionName, value: p.value }))
                    : this.selectedPath.slice();
            }
            this.expandingPathKey = node.pathKey;
        },

        expandByDimension(node, dimensionName, colIndex) {
            const arr = this.levelExpandedDimensions.slice();
            while (arr.length <= colIndex) arr.push('');
            arr[colIndex] = dimensionName;
            this.levelExpandedDimensions = arr;
            this.expandingPathKey = null;
            this.buildTree();
        },

        buildChildrenForPath(path, nextDim) {
            const rows = this.rows;
            const { metricName, explainByDimensionNames, topNPerLevel, planField } = this.props;
            if (!rows.length || !nextDim || !explainByDimensionNames || !explainByDimensionNames.includes(nextDim)) return [];
            const topN = Math.max(1, Math.min(50, topNPerLevel || 10));
            const filtered = filterRowsByPath(rows, path);
            const options = getDimensionValuesWithMetric(filtered, nextDim, metricName, topN);
            return options.map((opt) => {
                const childPath = path.concat([{ dimensionName: nextDim, value: opt.value }]);
                const childFiltered = filterRowsByPath(rows, childPath);
                const value = aggregateSum(childFiltered, metricName);
                let planVal = null;
                if (planField) planVal = aggregateSum(childFiltered, planField);
                return {
                    pathKey: pathToKey(childPath),
                    path: childPath,
                    value,
                    planValue: planVal,
                    dimensionName: nextDim,
                    dimensionValue: opt.value,
                    isRoot: false,
                    children: []
                };
            });
        },

        getNodeAtPath(path) {
            if (!this.treeData) return null;
            let node = this.treeData;
            for (const step of path || []) {
                if (!node.children) return null;
                const child = node.children.find(
                    (c) => c.dimensionName === step.dimensionName && c.dimensionValue === step.value
                );
                if (!child) return null;
                node = child;
            }
            return node;
        },

        isNodeInSelectedPath(node, colIndex) {
            if (colIndex === 0) return node.isRoot;
            if (!node.path || node.path.length === 0) return false;
            const lastSeg = node.path[node.path.length - 1];
            if (!lastSeg) return false;
            const hl = this.highlightedPath;
            if (hl && hl.length >= colIndex) {
                const segAtLevel = hl[colIndex - 1];
                if (segAtLevel && segAtLevel.dimensionName === lastSeg.dimensionName && segAtLevel.value === lastSeg.value) {
                    return true;
                }
            }
            const sel = this.selectedPath;
            const selAtLevel = sel[colIndex - 1];
            if (!selAtLevel) return false;
            if (selAtLevel.dimensionName !== lastSeg.dimensionName || selAtLevel.value !== lastSeg.value) return false;
            if (node.path.length >= colIndex) {
                return sel.slice(0, colIndex).every(
                    (s, i) => s && node.path[i] && s.dimensionName === node.path[i].dimensionName && s.value === node.path[i].value
                );
            }
            return true;
        },

        barWidthPercent(node, col) {
            if (!col.maxValue || col.maxValue <= 0) return 0;
            return Math.min(100, (node.value / col.maxValue) * 100);
        },

        levelColor(colIndex) {
            const arr = this.props.levelColors;
            const c = Array.isArray(arr) && arr[colIndex] ? String(arr[colIndex]).trim() : '';
            if (c) return c;
            return colIndex === 0 ? this.props.rootNodeColor : this.props.nodeColor;
        },

        barStyleForLevel(colIndex, node, col) {
            return {
                width: this.barWidthPercent(node, col) + '%',
                backgroundColor: this.levelColor(colIndex)
            };
        },

        clearPathAt(colIndex) {
            if (colIndex <= 0) return;
            this.selectedPath = this.selectedPath.slice(0, colIndex - 1);
            this.highlightedPath = this.selectedPath.slice();
        },

        excludeLevel(colIndex) {
            if (colIndex <= 0) return;
            const levelIndex = colIndex - 1;
            const levelDims = this.levelExpandedDimensions.slice();
            if (levelIndex >= levelDims.length) return;
            levelDims.splice(levelIndex, 1);
            this.levelExpandedDimensions = levelDims;
            const removeSegmentAt = (path) => path.filter((_, idx) => idx !== levelIndex);
            this.selectedPath = removeSegmentAt(this.selectedPath);
            this.highlightedPath = removeSegmentAt(this.highlightedPath);
            this.buildTree();
        },

        applyDefaultStateIfNeeded() {
            if (this._defaultsApplied || !this.treeData) return;
            const path = this.props.defaultSelectedPath;
            const expanded = this.props.defaultExpandedNodes;
            const levelDims = this.props.defaultLevelExpandedDimensions;

            if (levelDims && Array.isArray(levelDims) && levelDims.length > 0) {
                this.levelExpandedDimensions = levelDims.slice();
            } else if (expanded && typeof expanded === 'object' && Object.keys(expanded).length > 0) {
                this.levelExpandedDimensions = [];
                Object.keys(expanded).forEach((pathKey) => {
                    const level = pathKey === 'root' ? 0 : pathKey.split(',').length;
                    this.$set(this.levelExpandedDimensions, level, expanded[pathKey]);
                });
            } else {
                const firstDim = this.props.explainByDimensionNames?.[0];
                if (firstDim) {
                    this.levelExpandedDimensions = [firstDim];
                    this._defaultsApplied = true;
                    this.buildTree();
                    return;
                }
            }

            if (path && path.length > 0) {
                this.selectedPath = path.map((p) => ({ dimensionName: p.dimensionName, value: p.value }));
                this.highlightedPath = this.selectedPath.slice();
            }
            this._defaultsApplied = true;
            this.buildTree();
        },

        syncDefaultStateToProps() {
            if (!this.isEditorMode || !this.treeData) return;
            if (this._syncStateTimer) clearTimeout(this._syncStateTimer);
            this._syncStateTimer = setTimeout(() => {
                this._syncStateTimer = null;
                this.props.defaultSelectedPath = this.selectedPath.map((p) => ({ dimensionName: p.dimensionName, value: p.value }));
                this.props.defaultLevelExpandedDimensions = this.levelExpandedDimensions.slice();
                this.propChanged('defaultSelectedPath');
                this.propChanged('defaultLevelExpandedDimensions');
            }, 300);
        },

        scheduleDrawBranches() {
            if (this._drawBranchesTimer) clearTimeout(this._drawBranchesTimer);
            this._drawBranchesTimer = setTimeout(() => {
                this._drawBranchesTimer = null;
                this.$nextTick(this.drawBranches);
            }, 100);
        },

        getNodeKeysLeadingToSelected() {
            const cols = this.treeColumns;
            const hl = this.highlightedPath;
            const setsByCol = new Map();
            if (!cols || cols.length === 0 || !hl || hl.length === 0) return setsByCol;

            const lastCol = cols.length - 1;
            const colSelected = hl.length;
            if (colSelected > lastCol) return setsByCol;

            for (let colIndex = 0; colIndex <= lastCol; colIndex++) {
                setsByCol.set(colIndex, new Set());
            }

            for (let colIndex = colSelected; colIndex >= 0; colIndex--) {
                const col = cols[colIndex];
                if (!col || !col.nodes) continue;
                if (colIndex === colSelected) {
                    col.nodes.forEach((node) => {
                        if (this.isNodeInSelectedPath(node, colIndex)) {
                            setsByCol.get(colIndex).add(node.pathKey);
                        }
                    });
                    continue;
                }
                const nextSet = setsByCol.get(colIndex + 1);
                const sourceCol = cols[colIndex];
                cols[colIndex + 1].nodes.forEach((node) => {
                    if (!nextSet.has(node.pathKey)) return;
                    (node.parentPathKeys || []).forEach((pk) => {
                        if (sourceCol.nodes.some((n) => n.pathKey === pk)) {
                            setsByCol.get(colIndex).add(pk);
                        }
                    });
                });
            }
            return setsByCol;
        },

        drawBranches() {
            const columnsEl = this.$refs.columnsRef;
            const scrollEl = this.$refs.treeRef;
            if (!columnsEl || !scrollEl || !this.treeColumns || this.treeColumns.length < 2) {
                this.branchPaths = [];
                this.svgSize = { width: 0, height: 0 };
                return;
            }

            const contentRect = columnsEl.getBoundingClientRect();
            const scrollLeft = scrollEl.scrollLeft || 0;
            const scrollTop = scrollEl.scrollTop || 0;

            const wraps = columnsEl.querySelectorAll('[data-col-index][data-node-index]');
            const rectMap = new Map();
            wraps.forEach((wrap) => {
                const colIndex = parseInt(wrap.getAttribute('data-col-index'), 10);
                const nodeIndex = parseInt(wrap.getAttribute('data-node-index'), 10);
                const r = wrap.getBoundingClientRect();
                const barRow = wrap.querySelector('.decomp-tree-node__bar-row');
                let barEndX = r.right - contentRect.left + scrollLeft;
                let barStartX = r.left - contentRect.left + scrollLeft;
                let barCenterY = r.top - contentRect.top + scrollTop + r.height / 2;
                if (barRow) {
                    const br = barRow.getBoundingClientRect();
                    barCenterY = br.top - contentRect.top + scrollTop + br.height / 2;
                    barStartX = br.left - contentRect.left + scrollLeft;
                    barEndX = br.right - contentRect.left + scrollLeft;
                }
                rectMap.set(`${colIndex}-${nodeIndex}`, {
                    barEndX,
                    barStartX,
                    barCenterY
                });
            });

            const getNodeRect = (colIndex, nodeIndex) => rectMap.get(`${colIndex}-${nodeIndex}`) || null;

            const paths = [];
            const cols = this.treeColumns;
            const keysLeadingToSelected = this.getNodeKeysLeadingToSelected();

            for (let colIndex = 0; colIndex < cols.length - 1; colIndex++) {
                const targetCol = cols[colIndex + 1];
                const sourceCol = cols[colIndex];
                const sourceSet = keysLeadingToSelected.get(colIndex);
                const targetSet = keysLeadingToSelected.get(colIndex + 1);

                targetCol.nodes.forEach((node, nodeIndex) => {
                    const parentPathKeys = node.parentPathKeys;
                    let parentIndices = [];
                    if (parentPathKeys && parentPathKeys.length > 0) {
                        parentPathKeys.forEach((pk) => {
                            const idx = sourceCol.nodes.findIndex((n) => n.pathKey === pk);
                            if (idx >= 0) parentIndices.push(idx);
                        });
                    }
                    if (parentIndices.length === 0) {
                        const parentPath = node.path && node.path.length > 0 ? node.path.slice(0, -1) : [];
                        const parentKey = pathToKey(parentPath);
                        const parentIdx = sourceCol.nodes.findIndex((n) => n.pathKey === parentKey);
                        if (parentIdx >= 0) parentIndices = [parentIdx];
                    }
                    parentIndices.forEach((parentIdx) => {
                        const srcRect = getNodeRect(colIndex, parentIdx);
                        const tgtRect = getNodeRect(colIndex + 1, nodeIndex);
                        if (!srcRect || !tgtRect) return;
                        const x1 = srcRect.barEndX;
                        const y1 = srcRect.barCenterY;
                        const x2 = tgtRect.barStartX;
                        const y2 = tgtRect.barCenterY;
                        const cpx = (x1 + x2) / 2;
                        const d = `M ${x1} ${y1} C ${cpx} ${y1}, ${cpx} ${y2}, ${x2} ${y2}`;
                        const sourceNode = sourceCol.nodes[parentIdx];
                        const targetInSet = targetSet != null && targetSet.has(node.pathKey);
                        const sourceInSet = colIndex === 0 || (sourceSet != null && sourceSet.has(sourceNode.pathKey));
                        const active = targetInSet && sourceInSet;
                        paths.push({ d, active });
                    });
                });
            }

            this.branchPaths = paths;
            const w = columnsEl.scrollWidth || columnsEl.offsetWidth || 1;
            const h = columnsEl.scrollHeight || columnsEl.offsetHeight || 1;
            this.svgSize = { width: w, height: h };
        },

        isPathSelected() {
            return false;
        },

        nodeLabel(node) {
            const name = node.dimensionValue != null ? node.dimensionValue : 'Итого';
            const val = this.formatMetric(node.value);
            return `${name}: ${val}`;
        },

        formatMetric(value) {
            return formatMetricValue(
                value,
                this.props.metricFormat,
                this.props.metricSeparator
            );
        },

        planValue(node) {
            if (!this.props.planField || node.planValue == null) return null;
            return node.planValue;
        },

        progressPercent(node) {
            const plan = this.planValue(node);
            if (plan == null || plan <= 0) return 0;
            return Math.min(100, (node.value / plan) * 100);
        },

        handleNodeClick(node, colIndex) {
            if (colIndex === 0) return;
            const segment = node.path && node.path.length > 0 ? node.path[node.path.length - 1] : null;
            if (!segment) return;
            const newPath = this.selectedPath.slice(0, colIndex);
            newPath[colIndex - 1] = { dimensionName: segment.dimensionName, value: segment.value };
            this.selectedPath = newPath;
            this.highlightedPath = (node.fullPath && node.fullPath.length > 0)
                ? node.fullPath.map((p) => ({ dimensionName: p.dimensionName, value: p.value }))
                : newPath.slice();
            this.$emit('select', { path: node.path, value: node.value, node });
            if (this.props.selectEvent && typeof this.props.selectEvent.handler === 'function') {
                this.props.selectEvent.handler({ path: node.path, value: node.value, node });
            }
        },

        handleNodeKeydown(event, node, colIndex) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                this.handleNodeClick(node, colIndex);
            }
            if (event.key === '+' && this.canExpand(node, colIndex)) {
                event.preventDefault();
                this.toggleExpand(node, colIndex);
            }
        }
    },

    implicitCssModule: false
};
</script>

<style src="./styles/style.pcss" lang="pcss"></style>

