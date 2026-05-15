/**
 * @file DatasetPanelMixin.js
 * @description Mixin for auto-syncing dataset dimensions/metrics to widget props
 */

export const DatasetPanelMixin = {
    watch: {
        dimensions: {
            handler(dimensions) {
                // Auto-detect field mappings based on dimension names
                if (dimensions && dimensions.length > 0) {
                    this.autoDetectFieldMappings(dimensions);
                }
            },
            immediate: true
        },
        metrics: {
            handler(metrics) {
                // Auto-select first metric as value field if not set
                if (metrics && metrics.length > 0 && this.props.valueField == null) {
                    this.props.valueField = metrics[0];
                    this.propChanged('valueField');
                }
            },
            immediate: true
        }
    },

    methods: {
        autoDetectFieldMappings(dimensions) {
            // Auto-detect latitude field
            if (this.props.latitudeField == null || this.props.latitudeField === '') {
                const latField = dimensions.find(dim => 
                    /^(latitude|lat|y|coord_y)$/i.test(dim)
                );
                if (latField != null) {
                    this.props.latitudeField = latField;
                    this.propChanged('latitudeField');
                }
            }

            // Auto-detect longitude field
            if (this.props.longitudeField == null || this.props.longitudeField === '') {
                const lonField = dimensions.find(dim => 
                    /^(longitude|lon|lng|x|coord_x)$/i.test(dim)
                );
                if (lonField != null) {
                    this.props.longitudeField = lonField;
                    this.propChanged('longitudeField');
                }
            }

            // Auto-detect date field
            if (this.props.dateField == null || this.props.dateField === '') {
                const dateField = dimensions.find(dim => 
                    /^(date|datetime|time|timestamp|date_event)$/i.test(dim)
                );
                if (dateField != null) {
                    this.props.dateField = dateField;
                    this.propChanged('dateField');
                }
            }

            // Auto-detect category field
            if (this.props.categoryField == null || this.props.categoryField === '') {
                const categoryField = dimensions.find(dim => 
                    /^(category|type|class|group|category_event)$/i.test(dim)
                );
                if (categoryField != null) {
                    this.props.categoryField = categoryField;
                    this.propChanged('categoryField');
                }
            }

            // Auto-detect region fields
            const regionFields = { ...this.props.regionFields };
            let regionsUpdated = false;

            if (regionFields.level4 == null || regionFields.level4 === '') {
                const lvl4Field = dimensions.find(dim => 
                    /^(region.*lvl4|regionName_lvl4|district)$/i.test(dim)
                );
                if (lvl4Field != null) {
                    regionFields.level4 = lvl4Field;
                    regionsUpdated = true;
                }
            }

            if (regionFields.level6 == null || regionFields.level6 === '') {
                const lvl6Field = dimensions.find(dim => 
                    /^(region.*lvl6|regionName_lvl6)$/i.test(dim)
                );
                if (lvl6Field != null) {
                    regionFields.level6 = lvl6Field;
                    regionsUpdated = true;
                }
            }

            if (regionFields.level8 == null || regionFields.level8 === '') {
                const lvl8Field = dimensions.find(dim => 
                    /^(region.*lvl8|regionName_lvl8)$/i.test(dim)
                );
                if (lvl8Field != null) {
                    regionFields.level8 = lvl8Field;
                    regionsUpdated = true;
                }
            }

            if (regionsUpdated === true) {
                this.props.regionFields = regionFields;
                this.propChanged('regionFields');
            }
        }
    }
};

