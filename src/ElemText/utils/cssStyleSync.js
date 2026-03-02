/**
 * CSS Style Synchronization Utilities
 *
 * Provides two-way synchronization between:
 * - ElemText's individual style props (color, fontSize, etc.)
 * - Platform's default "Style/CSS Styles" panel (props.cssStyle)
 *
 * The platform's cssStyle is a flat object with camelCase keys:
 * { backgroundColor: 'red', fontSize: '16px', opacity: '0.5' }
 *
 * Our props may use different formats:
 * - Strings: 'red', '16px'
 * - Numbers: 0.5
 * - Objects: { size: 16, unit: 'px' }
 */

/**
 * Mapping between individual props and cssStyle keys
 * Only includes props that should sync with cssStyle
 */
export const STYLE_PROP_MAP = {
    // Typography
    color: 'color',
    fontSize: 'fontSize',
    fontWeight: 'fontWeight',
    fontFamily: 'fontFamily',
    textAlign: 'textAlign',
    lineHeight: 'lineHeight',
    letterSpacing: 'letterSpacing',
    textTransform: 'textTransform',
    textDecoration: 'textDecoration',

    // Background & Colors
    backgroundColor: 'backgroundColor',

    // Spacing
    padding: 'padding',
    margin: 'margin',

    // Border
    borderColor: 'borderColor',
    borderWidth: 'borderWidth',
    borderStyle: 'borderStyle',
    borderRadius: 'borderRadius',

    // Effects
    opacity: 'opacity',
    boxShadow: 'boxShadow',
    textShadow: 'textShadow'
};

/**
 * Props that use {size, unit} object format
 */
const SIZE_OBJECT_PROPS = [
    'fontSize',
    'lineHeight',
    'letterSpacing',
    'borderRadius',
    'borderWidth'
];

/**
 * Formats a prop value for cssStyle (our format → CSS string)
 *
 * @param {string} propName - The prop name
 * @param {*} value - The prop value
 * @returns {string|null} - CSS string value or null if empty
 */
export function formatPropForCss(propName, value) {
    // Empty values → null (will be removed from cssStyle)
    if (value == null || value === '') return null;

    // Object format {size, unit} → String "12px"
    if (typeof value === 'object' && value.size !== undefined) {
        // Handle empty unit (for unitless values like lineHeight: 1.5)
        const unit = value.unit != null ? value.unit : 'px';
        return `${value.size}${unit}`;
    }

    // Number → String (for opacity, fontWeight, etc.)
    if (typeof value === 'number') {
        return String(value);
    }

    return value;
}

/**
 * Parses a CSS value into our prop format (CSS string → our format)
 *
 * @param {string} propName - The prop name
 * @param {string} cssValue - The CSS value
 * @returns {*} - Parsed value in our prop format
 */
export function parseCssForProp(propName, cssValue) {
    // Empty values → empty string (our default)
    if (cssValue == null || cssValue === '') return '';

    // Size props → Object {size, unit}
    if (SIZE_OBJECT_PROPS.includes(propName)) {
        const str = String(cssValue);
        // Match number with optional unit: "12px", "1.5em", "100%", "1.5" (unitless)
        const match = str.match(/^(-?\d+(?:\.\d+)?)(px|rem|em|%|vw|vh)?$/);
        if (match) {
            return {
                size: parseFloat(match[1]),
                unit: match[2] || '' // Empty string for unitless
            };
        }
        // If doesn't match pattern, return as-is (could be "auto", "inherit", etc.)
        return cssValue;
    }

    // Opacity → Number
    if (propName === 'opacity') {
        const num = parseFloat(cssValue);
        return isNaN(num) ? '' : num;
    }

    // fontWeight → could be number or string ("400", "bold")
    if (propName === 'fontWeight') {
        const num = parseInt(cssValue, 10); // eslint-disable-line no-magic-numbers
        if (!isNaN(num)) return num;
    }

    return cssValue;
}

/**
 * Builds a cssStyle object from individual props
 * Used for initial sync (props → cssStyle)
 *
 * @param {Object} props - Component props
 * @returns {Object} - cssStyle object
 */
export function buildCssStyleFromProps(props) {
    const cssStyle = {};

    for (const [propName, cssKey] of Object.entries(STYLE_PROP_MAP)) {
        const value = props[propName];
        const formatted = formatPropForCss(propName, value);
        if (formatted != null) {
            cssStyle[cssKey] = formatted;
        }
    }

    return cssStyle;
}

/**
 * Computes prop updates from cssStyle changes
 * Used for sync (cssStyle → props)
 *
 * @param {Object} cssStyle - The cssStyle object
 * @param {Object} currentProps - Current component props
 * @returns {Object} - Object with prop names as keys and new values
 */
export function computePropUpdatesFromCssStyle(cssStyle, currentProps) {
    const updates = {};

    for (const [propName, cssKey] of Object.entries(STYLE_PROP_MAP)) {
        const cssValue = cssStyle[cssKey];

        // Skip if cssStyle doesn't have this key
        if (cssValue === undefined) continue;

        const parsed = parseCssForProp(propName, cssValue);
        const currentValue = currentProps[propName];

        // Compare values (deep comparison for objects)
        const isDifferent = JSON.stringify(parsed) !== JSON.stringify(currentValue);

        if (isDifferent) {
            updates[propName] = parsed;
        }
    }

    return updates;
}

/**
 * Gets the CSS key for a prop name
 *
 * @param {string} propName - The prop name
 * @returns {string|undefined} - The cssStyle key or undefined
 */
export function getCssKeyForProp(propName) {
    return STYLE_PROP_MAP[propName];
}

/**
 * Checks if a prop should be synced to cssStyle
 *
 * @param {string} propName - The prop name
 * @returns {boolean}
 */
export function isSyncableProp(propName) {
    return propName in STYLE_PROP_MAP;
}
