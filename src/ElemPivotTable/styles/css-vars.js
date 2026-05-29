import { CELL_MIN_HEIGHT } from '../utils/constants';

export const cssVars = {
    width: 'cellWidth',
    'toolbox-button-background': 'toolboxButtonBackground',
    'toolbox-button-font-color': 'toolboxButtonFontColor',
    'toolbox-button-icon-color': 'toolboxButtonIconColor',
    'toolbox-button-background-hover': 'toolboxButtonBackgroundHover',
    'toolbox-button-font-color-hover': 'toolboxButtonFontColorHover',
    'toolbox-button-icon-color-hover': 'toolboxButtonIconColorHover',
    'index-height': 'indexesHeight',
    'table-border-color': 'tableBorderColor',
    'table-border-weight': 'tableBorderWeight'
};
export const buildFiltersCssVars = ({ height }) => ({
    height: `${height}px`
});
export const buildResizedCssVars = ({ width }) => ({
    width: `${width}px`
});
export const buildResizedLineOffsetCssVars = ({ offset, size }) => ({
    offset: `${offset}px`,
    size: `${size}px`
});
export const buildCellCssVars = ({
    fontSize = '',
    fontFamily = '',
    fontWeight = '',
    color = '',
    backgroundColor = '',
    verticalAlign = '',
    horizontalAlign = '',
    width = ''
} = {}) => ({
    'font-size': fontSize,
    'font-family': fontFamily,
    'font-weight': fontWeight,
    'background-color': backgroundColor,
    color,
    width,
    'horizontal-align': (() => {
        if (horizontalAlign === 'top') {
            return 'flex-start';
        }
        if (horizontalAlign === 'middle') {
            return 'center';
        }
        if (horizontalAlign === 'bottom') {
            return 'flex-end';
        }
        return horizontalAlign;
    })(),
    'vertical-align': (() => {
        if (verticalAlign === 'top' || verticalAlign === 'left' || verticalAlign === 'flex-start') {
            return 'left';
        }
        if (verticalAlign === 'middle' || verticalAlign === 'center') {
            return 'center';
        }
        if (verticalAlign === 'bottom' || verticalAlign === 'right' || verticalAlign === 'flex-end') {
            return 'right';
        }
        return verticalAlign;
    })(),
    'vertical-align-justify': (() => {
        if (verticalAlign === 'top' || verticalAlign === 'left' || verticalAlign === 'flex-start') {
            return 'flex-start';
        }
        if (verticalAlign === 'middle' || verticalAlign === 'center') {
            return 'center';
        }
        if (verticalAlign === 'bottom' || verticalAlign === 'right' || verticalAlign === 'flex-end') {
            return 'flex-end';
        }
        return verticalAlign;
    })()
});

export const buildRowCssVars = ({ size }) => ({
    'cell-height': `max(${size}px, ${CELL_MIN_HEIGHT})`
});

export const buildResizeLineCssVars = ({ left, top }) => ({
    top: top != null ? `${top}px` : 0,
    left: left != null ? `${left}px` : 0
});
