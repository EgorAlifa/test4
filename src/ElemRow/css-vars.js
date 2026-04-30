import { resolveBackground } from '@goodt-widgets-insight/table-common';
import { resolveBorderRadius } from './utils';

export const cssVars = {
    'row_color--hover': 'style.hover.color',
    'row_font-weight--hover': 'style.hover.fontWeight',
    'row_background--hover': ({ style: { hover } }) => resolveBackground(hover) ?? 'var(--color-highlight)',
    'row_transition-duration--hover': ['style.hover.transitionDuration', '.2s'],
    'row_color--select': 'style.select.color',
    'row_font-weight--select': 'style.select.fontWeight',
    'row_background--select': ({ style: { select } }) => resolveBackground(select) ?? 'var(--color-highlight)',
    'row_border-width--select': ({
        style: {
            select: { border }
        }
    }) => (border?.isDisplayed ?? false ? border?.borders?.width ?? null : null),
    'row_border-color--select': ({
        style: {
            select: { border }
        }
    }) => (border?.isDisplayed ?? false ? border?.borders?.color ?? null : null),
    'row_border-style--select': ({
        style: {
            select: { border }
        }
    }) => (border?.isDisplayed ?? false ? border?.borders?.style ?? null : null),
    'row_border-radius--select': ({
        style: {
            select: { border }
        }
    }) => (border?.isDisplayed ?? false ? resolveBorderRadius(border?.borderRadius) : null),
    'row_transition-duration--select': ['style.select.transitionDuration', '.2s'],
    'row_border-width': ['border.width', '1px'],
    'row_border-color': ['border.color', 'color(--color-border)']
};
