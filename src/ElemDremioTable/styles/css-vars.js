import { cssStrToObj, resolveStyle } from '../utils';

export const cssVars = {
    'columns-count': ({ columns }) => columns.length,
    'row_border-color': ['rowBorder.color', 'var(--color-border)'],
    'highlighted-row_bg-color': ({ highlightedRowStyle, highlightedRowCss }) =>
        resolveStyle(highlightedRowStyle, highlightedRowCss, 'backgroundColor') ??
        cssStrToObj(highlightedRowCss)?.background ??
        'var(--color-highlight)',
    'highlighted-row_color': ({ highlightedRowStyle, highlightedRowCss }) =>
        resolveStyle(highlightedRowStyle, highlightedRowCss, 'color') ?? 'inherit',
    'highlighted-row_font-weight': ({ highlightedRowStyle, highlightedRowCss }) =>
        resolveStyle(highlightedRowStyle, highlightedRowCss, 'fontWeight') ?? 'inherit',
    'highlighted-row_transition-duration': ({ highlightedRowStyle, highlightedRowCss }) =>
        `${resolveStyle(highlightedRowStyle, highlightedRowCss, 'transitionDuration') ?? 200}ms`,
    'selected-row_bg-color': ({ selectedRowStyle, selectedRowCss }) =>
        resolveStyle(selectedRowStyle, selectedRowCss, 'backgroundColor') ??
        cssStrToObj(selectedRowCss)?.background ??
        'inherit',
    'selected-row_color': ({ selectedRowStyle, selectedRowCss }) =>
        resolveStyle(selectedRowStyle, selectedRowCss, 'color') ?? 'inherit',
    'selected-row_font-weight': ({ selectedRowStyle, selectedRowCss }) =>
        resolveStyle(selectedRowStyle, selectedRowCss, 'fontWeight') ?? 'inherit',
    'selected-row_transition-duration': ({ selectedRowStyle, selectedRowCss }) =>
        `${resolveStyle(selectedRowStyle, selectedRowCss, 'transitionDuration') ?? 200}ms`,
    'tfoot_justify-content': ({ isFooterSlotShown }) => isFooterSlotShown ? 'flex-start' : 'flex-end',
    'result-row_position': ({ isResultRowSticky }) => isResultRowSticky ? 'sticky' : 'inherit'
};
