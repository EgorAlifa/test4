/**
 * @file dataTransform.js
 * @description Data transformation utilities for ElemWowMap
 */

/**
 * Transform IDP dataset results to map data format
 * @param {Array} rows - Dataset rows
 * @param {Object} fieldMapping - Field mapping configuration
 * @returns {Array} Transformed data
 */
/**
 * Parse coordinate value (handles string/number, comma/dot)
 * @param {string|number} coord - Coordinate value
 * @returns {number|null} Parsed coordinate or null
 */
function parseCoordinate(coord) {
    if (coord == null) {
        return null;
    }

    // If it's a string, replace comma with dot
    if (typeof coord === 'string') {
        const parsed = parseFloat(coord.replace(',', '.'));
        return Number.isNaN(parsed) ? null : parsed;
    }

    // If it's already a number
    const parsed = parseFloat(coord);
    return Number.isNaN(parsed) ? null : parsed;
}

export function transformDatasetToMapFormat(rows, fieldMapping) {
    if (rows == null || rows.length === 0) {
        return [];
    }

    const {
        latitudeField,
        longitudeField,
        dateField,
        categoryField,
        valueField,
        descriptionField,
        regionCodeField
    } = fieldMapping;

    const transformed = rows.map((row, index) => {
        // Extract coordinates
        const latitude = parseCoordinate(row[latitudeField]);
        const longitude = parseCoordinate(row[longitudeField]);

        // Extract date
        const dateValue = row[dateField];
        const dateObj = dateValue ? new Date(dateValue) : null;
        const year = dateObj ? dateObj.getFullYear() : null;

        // Extract category
        const category = row[categoryField] ? String(row[categoryField]).trim() : 'UNKNOWN';

        // Extract value (metric)
        const value = valueField ? parseFloat(row[valueField]) : null;

        // Extract description
        const description = descriptionField ? row[descriptionField] : null;

        // Extract region code (should be in RU-XXX format to match SVG path IDs)
        const regionCode = regionCodeField ? row[regionCodeField] : null;

        // Return transformed record
        return {
            latitude,
            longitude,
            date_event: dateObj,
            year_event: year,
            category_event: category,
            value_event: value,
            description_event: description,
            regionCode,
            // Keep original row for reference
            // eslint-disable-next-line no-underscore-dangle
            originalRow: row
        };
    }).filter(record => {
        // Filter out invalid records (only coordinates are required)
        // Date is optional - some visualization modes work without it
        const isValid = record.latitude != null && 
                       record.longitude != null && 
                       !Number.isNaN(record.latitude) && 
                       !Number.isNaN(record.longitude);
        
        return isValid;
    });
    
    return transformed;
}

/**
 * Extract unique values from data
 * @param {Array} data - Transformed data array
 * @returns {Object} Object with uniqueYears and uniqueCategories
 */
export function extractUniqueValues(data) {
    const uniqueYears = [];
    const uniqueCategories = [];

    data.forEach(record => {
        // Extract years
        if (record.year_event != null && !uniqueYears.includes(record.year_event)) {
            uniqueYears.push(record.year_event);
        }

        // Extract categories
        if (record.category_event) {
            const category = record.category_event.trim();
            if (!uniqueCategories.some(cat => cat.toUpperCase() === category.toUpperCase())) {
                uniqueCategories.push(category);
            }
        }
    });

    // Sort years
    uniqueYears.sort((a, b) => a - b);
    
    // Sort categories alphabetically
    uniqueCategories.sort();

    return { uniqueYears, uniqueCategories };
}

/**
 * Check if point is inside polygon (lasso selection)
 * @param {Array} point - [lat, lng]
 * @param {Array} polygon - Array of [lat, lng] points
 * @returns {boolean} True if point is inside polygon
 */
function isPointInPolygon(point, polygon) {
    if (point == null || polygon == null || polygon.length < 3) { // eslint-disable-line no-magic-numbers
        return false;
    }

    const [lat, lng] = point;
    let isInside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const [latI, lngI] = polygon[i];
        const [latJ, lngJ] = polygon[j];

        const isIntersecting = ((lngI > lng) !== (lngJ > lng)) &&
            (lat < (latJ - latI) * (lng - lngI) / (lngJ - lngI) + latI);

        if (isIntersecting === true) {
            isInside = !isInside;
        }
    }

    return isInside;
}

/**
 * Apply filters to data
 * @param {Array} data - Data to filter
 * @param {Object} filters - Filter configuration
 * @returns {Array} Filtered data
 */
export function applyFilters(data, filters) {
    if (data == null || data.length === 0) {
        return [];
    }

    let filtered = [...data];

    // Filter by years
    if (filters.selectedYears && filters.selectedYears.length > 0) {
        filtered = filtered.filter(record => 
            filters.selectedYears.includes(record.year_event)
        );
    }

    // Filter by categories
    if (filters.selectedCategories && filters.selectedCategories.length > 0) {
        filtered = filtered.filter(record => {
            const recordCategory = record.category_event?.toUpperCase();
            return filters.selectedCategories.some(cat => 
                cat.toUpperCase() === recordCategory
            );
        });
    }

    // Filter by lasso bounds (if provided)
    if (filters.lassoBounds != null) {
        filtered = filtered.filter(record => isPointInPolygon(
            [record.latitude, record.longitude],
            filters.lassoBounds
        ));
    }

    return filtered;
}

/**
 * Aggregate data by region for choropleth
 * @param {Array} data - Data to aggregate
 * @param {string} adminLevel - Admin level ('4', '6', '8')
 * @param {string} aggregationMethod - Aggregation method ('count', 'sum', 'average', etc.)
 * @returns {Object} Aggregated data by region
 */
export function aggregateByRegion(data, regionCodeField, aggregationMethod = 'count') {
    if (data == null || data.length === 0) {
        return {};
    }

    if (!regionCodeField) {
        return {};
    }

    const aggregated = {};

    data.forEach((record, index) => {
        // Get region code directly from the field (should be in RU-XXX format)
        const {regionCode} = record;
        
        if (regionCode == null || regionCode.trim() === '') {
            return;
        }

        if (aggregated[regionCode] == null) {
            aggregated[regionCode] = {
                count: 0,
                sum: 0,
                values: []
            };
        }

        aggregated[regionCode].count++;
        
        if (record.value_event != null) {
            aggregated[regionCode].sum += record.value_event;
            aggregated[regionCode].values.push(record.value_event);
        }
    });

    // Calculate final aggregated values
    const result = {};
    const regionCodes = Object.keys(aggregated);
    
    regionCodes.forEach(regionCode => {
        const regionData = aggregated[regionCode];
        
        let calculatedValue;
        switch (aggregationMethod) {
            case 'count':
                calculatedValue = regionData.count;
                break;
            case 'sum':
                calculatedValue = regionData.sum;
                break;
            case 'average':
                calculatedValue = regionData.values.length > 0 
                    ? regionData.sum / regionData.values.length 
                    : 0;
                break;
            case 'min':
                calculatedValue = regionData.values.length > 0 
                    ? Math.min(...regionData.values) 
                    : 0;
                break;
            case 'max':
                calculatedValue = regionData.values.length > 0 
                    ? Math.max(...regionData.values) 
                    : 0;
                break;
            default:
                calculatedValue = regionData.count;
        }
        
        result[regionCode] = calculatedValue;
    });
    
    return result;
}

/**
 * Get color for category using predefined color palette or custom colors
 * @param {string} category - Category name
 * @param {Object} categoryColorMap - Existing color map
 * @param {Array} predefinedColors - Array of color codes
 * @param {Object} customColors - Custom color overrides per category
 * @returns {string} Color code
 */
export function getCategoryColor(category, categoryColorMap, predefinedColors, customColors = {}) {
    if (category == null) {
        return predefinedColors[0];
    }

    const upperCategory = category.toUpperCase();
    
    // Check if there's a custom color override
    if (customColors != null && customColors[upperCategory] != null) {
        categoryColorMap[upperCategory] = customColors[upperCategory];
        return customColors[upperCategory];
    }
    
    // Otherwise use the predefined palette
    if (categoryColorMap[upperCategory] == null) {
        const nextIndex = Object.keys(categoryColorMap).length;
        categoryColorMap[upperCategory] = predefinedColors[nextIndex % predefinedColors.length];
    }

    return categoryColorMap[upperCategory];
}

