import { useNavigate } from '@goodt-wcore/utils';
import { resolveNavigateQueryParams } from '@goodt-widgets-insight/table-common';
import { CellsTypes } from '../utils/constants';

const { navigate, buildNavigateOptions } = useNavigate();

/**
 * @typedef {Object} Actions
 * @property {{ select: string[] }} events
 * @property {{url: string, query: Record<string, string>, queryMetrics: string[], isTargetBlank: boolean}} [link]
 */

const MIXIN_NAME = 'CellActionsMixin';

const Methods = {
    handleCellActions: `${MIXIN_NAME}.handleCellActions`,
    resolveCellActionsParams: `${MIXIN_NAME}.resolveCellActionsParams`,
    resolveCellActionLinkUrl: `${MIXIN_NAME}.resolveCellActionLinkUrl`
};

export default {
    _name: MIXIN_NAME,
    computedEditor: {
        /**
         * @return {Record<string, Actions>}
         */
        cellTypeActions() {
            const { rows, columns } = this.props;
            return [...rows, ...columns].reduce((acc, { actions, dataAlias }) => {
                if (actions?.enabled !== true) {
                    return acc;
                }
                const { events, link } = actions;
                const extra =
                    events.select.length > 0 || link.url.length > 0
                        ? {
                              [dataAlias]: actions
                          }
                        : null;
                return {
                    ...acc,
                    ...extra
                };
            }, {});
        }
    },
    methods: {
        onCellActionsApply(currentCell) {
            const {
                cellTypeActions,
                [Methods.resolveCellActionsParams]: resolveCellActionsParams,
                [Methods.handleCellActions]: handleCellActions
            } = this;
            const actionsParams = resolveCellActionsParams(currentCell);
            if (actionsParams == null) {
                return;
            }
            const found = actionsParams.find(
                ({ columnIndex, rowIndex }) => columnIndex === currentCell.index && rowIndex === currentCell.rowIndex
            );
            if (found == null) {
                return;
            }
            const { dataAlias, value } = found;

            const cellActions = cellTypeActions[dataAlias];
            // if no actions for dataAlias
            if (cellActions == null) {
                return;
            }
            // if cell value is nullish and empty value processing not enabled
            if (value == null && cellActions.emptyValue === false) {
                return;
            }
            handleCellActions(cellActions, actionsParams);
        },
        /**
         * @param {Actions} actions
         * @param {Record<string, any>} actionsParams
         */
        [Methods.handleCellActions](actions, actionsParams) {
            const { events, link } = actions;
            if (events?.select.length > 0) {
                events.select.forEach(this.$eventTrigger);
            }

            if (link?.url.length > 0) {
                const { urlFilters = [] } = actions;
                const { url, isTargetBlank, query, queryMetrics } = link;
                const linkUrl = this[Methods.resolveCellActionLinkUrl](url, actionsParams);

                const queryDataParams = actionsParams
                    .filter(({ dataAlias }) => queryMetrics.includes(dataAlias))
                    .reduce(
                        (acc, { dataAlias, value }) => ({
                            ...acc,
                            [dataAlias]: value
                        }),
                        {}
                    );
                const queryStoreParams = resolveNavigateQueryParams({ urlFilters });
                const mergedQuery = {
                    ...query,
                    ...queryStoreParams,
                    ...queryDataParams
                };

                // Absolute URLs must not be wrapped by buildNavigateOptions (which prepends platform host).
                if (/^https?:\/\//i.test(linkUrl)) {
                    const qs = new URLSearchParams(
                        Object.fromEntries(
                            Object.entries(mergedQuery)
                                .filter(([, v]) => v != null)
                                .map(([k, v]) => [k, String(v)])
                        )
                    ).toString();
                    const finalUrl = qs
                        ? linkUrl + (linkUrl.includes('?') ? '&' : '?') + qs
                        : linkUrl;
                    window.open(finalUrl, isTargetBlank ? '_blank' : '_self');
                } else {
                    const navigateOptions = buildNavigateOptions(linkUrl, { query: mergedQuery });
                    navigate(navigateOptions, { isNewWindow: isTargetBlank });
                }
            }
        },
        [Methods.resolveCellActionLinkUrl](url, actionsParams) {
            return actionsParams.find(({ dataAlias }) => dataAlias === url)?.value ?? url;
        },

        [Methods.resolveCellActionsParams](currentCell) {
            const { type: currentType, rowIndex: currentRowIndex, index: currentColumnIndex } = currentCell;
            if (currentType === CellsTypes.ROW) {
                const dataRowIndex = currentRowIndex - this.tableHeadRows.length;
                const { cells: selectedRowCells } = this.tableRows[dataRowIndex];

                const { cells: titleRowCells } = this.tableHeadRows.find(({ cells }) =>
                    cells.some(({ type: cellType }) => cellType === CellsTypes.ROW_TITLE)
                );
                const titleRowTargetCells = titleRowCells
                    .map((rowCell, index) => ({ ...rowCell, index }))
                    .filter(({ type: cellType }) => cellType === CellsTypes.ROW_TITLE);

                const actionsParams = titleRowTargetCells.map(({ index, value }) => ({
                    type: currentType,
                    dataAlias: value,
                    value: selectedRowCells[index].value,
                    columnIndex: index,
                    rowIndex: currentRowIndex
                }));

                const [sourceRowIndex] = this.getHeapNodeRowsByPath({
                    heap: this.tableMaps.rowsHeap,
                    path: currentCell.path
                });
                const sourceRow = this.result.rows[sourceRowIndex];

                const enriched = actionsParams.map((param) => ({
                    ...param,
                    value: param.value ?? sourceRow?.[param.dataAlias]
                }));

                if (sourceRow != null) {
                    const existingAliases = new Set(enriched.map((p) => p.dataAlias));
                    const extra = Object.entries(sourceRow)
                        .filter(([key]) => !existingAliases.has(key))
                        .map(([key, val]) => ({
                            type: currentType,
                            dataAlias: key,
                            value: val,
                            columnIndex: -1,
                            rowIndex: currentRowIndex
                        }));
                    return [...enriched, ...extra];
                }

                return enriched;
            }

            if (currentType === CellsTypes.COLUMN) {
                const targetRows = this.tableHeadRows
                    .map((row, index) => ({ ...row, index }))
                    .filter(({ cells }) => cells[currentColumnIndex].type === CellsTypes.COLUMN);
                const actionsParams = targetRows.map(({ cells, index: rowIndex }) => {
                    const { value: dataAlias } = cells.find(({ type: cellType }) => cellType === CellsTypes.TITLE);
                    const { value } = cells[currentColumnIndex];
                    return {
                        type: currentType,
                        dataAlias,
                        value,
                        rowIndex,
                        columnIndex: currentColumnIndex
                    };
                }, {});
                return actionsParams;
            }

            return null;
        }
    }
};
