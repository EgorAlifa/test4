export const AREA = 'area';
export const FRACTION = '1fr';
export const COLUMN_WIDTH = 'minmax(7.5rem, 1fr)';
export const GAP = '0px';

/**
 * @enum {string}
 * @type {Readonly<Record<string, string>>}
 */
export const TableSlot = Object.freeze({
    HEADER: 'header',
    FOOTER: 'footer'
});

/**
 * @enum {string}
 * @type {Readonly<Record<string, string>>}
 */
export const WidgetType = Object.freeze({
    GRID_LAYOUT: 'basic::ElemGridLayout',
    TABLE_HEADER: 'insight::@IDP/Table/ElemHeader',
    TABLE_PAGINATOR: 'insight::@IDP/Table/ElemPaginator',
    TABLE_ROW: 'insight::@IDP/Table/ElemRow',
    TABLE_CELL: 'insight::@IDP/Table/ElemValue'
});
