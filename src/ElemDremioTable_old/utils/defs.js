/**
 * @typedef {Object} DColumn
 * @property {string} title
 * @property {string|null} sort          metric/dimension
 * @property {string|null} style         css string
 * @property {string|null} styleCell     css string
 * @property {string|null} render        render id
 * @property {DColumnTooltip} tooltip
 * @property {DColumnTitleIcon} icon
 * @property {Object.<string, DColumnParam>} params
 */
/**
 * @typedef {Object} DColumnParam
 * @property {string|null} value
 * @property {string} type               param-type id
 * @property {string|null} format        format id
 * @property {Object} formatOpt          format options
 * @property {DColumnParamStyle[]} style
 */
/**
 * @typedef {Object} DColumnParamStyle
 * @property {string} value
 * @property {string|null} type         param style-type id
 * @property {string} style             css string
 * @property {string[]} cssClass        css classes list
 */
/**
 * @typedef {Object} DColumnTooltip
 * @property {boolean} enable       whether tooltip is visible or not
 * @property {string} position      position of tooltip
 * @property {number} offsetX       x-axis offset
 * @property {number} offsetY       y-axis offset
 * @property {number} hideDelay     time after which tooltip will disappear
 * @property {string|null} style    css string
 * @property {string} [text]        text
 */
/**
 * @typedef {Object} DColumnTitleIcon
 * @property {boolean} enable           whether icon is visible or not
 * @property {string} name              mdi-icon class name
 * @property {string} position          whether order of icon in header row
 * @property {string} size              font-size of icon
 * @property {string} color             string format hex, rgb(a), hsl
 * @property {DColumnTooltip} tooltip   icon tooltip options
 */
/**
 * @typedef {Object} DTopHeader
 * @property {string} title                                     header title
 * @property {string} style                                     header style
 * @property {[number|string|null, number|string|null]} range       numbers that set the range of columns to merge
 */
