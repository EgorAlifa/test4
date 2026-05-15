/**
 * @file mixins.js
 * @description Vue mixins for ElemWowMap widget
 */

/**
 * Unit to pixel conversion mixin
 * Converts CSS units (px, rem, em, %) to pixels
 */
export const unit2PxMixin = {
    methods: {
        /**
         * Convert CSS unit value to pixels
         * @param {Object} unitObj - Object with value and unit properties
         * @param {number} unitObj.value - Numeric value
         * @param {string} unitObj.unit - Unit type (px, rem, em, %)
         * @returns {number} Value in pixels
         */
        takeUnit2Px(unitObj) {
            if (unitObj == null || typeof unitObj !== 'object') {
                return 0;
            }

            const { value, unit } = unitObj;
            
            if (value == null || Number.isNaN(value)) {
                return 0;
            }

            // Already in pixels
            if (unit === 'px' || unit == null) {
                return parseFloat(value);
            }

            // Convert rem to pixels (1rem = 16px default)
            if (unit === 'rem') {
                const rootFontSize = parseFloat(
                    getComputedStyle(document.documentElement).fontSize
                );
                return parseFloat(value) * rootFontSize;
            }

            // Convert em to pixels (relative to parent font size)
            if (unit === 'em') {
                const parentFontSize = 16; // Default assumption
                return parseFloat(value) * parentFontSize;
            }

            // Percentage - needs context, default to viewport width
            if (unit === '%') {
                const viewportWidth = window.innerWidth;
                return (parseFloat(value) / 100) * viewportWidth;
            }

            // Default to value as-is
            return parseFloat(value);
        }
    }
};

/**
 * Helper function to register descriptor variables
 * Used for cross-widget communication
 */
export const registerDescriptorVariable = (descriptor, variableName, dimensionMetricVars) => {
    if (descriptor != null && descriptor.vars != null && variableName) {
        // Register variable if it doesn't exist
        if (descriptor.vars[variableName] == null) {
            descriptor.vars[variableName] = { description: variableName };
        }
        
        // Track this variable
        if (!dimensionMetricVars.includes(variableName)) {
            dimensionMetricVars.push(variableName);
        }
    }
    return dimensionMetricVars;
};

