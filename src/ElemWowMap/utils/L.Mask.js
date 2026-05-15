/**
 * Leaflet.Mask
 * https://github.com/ptma/Leaflet.Mask
 */

// eslint-disable-next-line func-names, no-unused-vars
(function (factory, window) {
    // eslint-disable-next-line no-undef
    if (typeof define === 'function' && define.amd) {
        // eslint-disable-next-line no-undef
        define(['leaflet'], factory);
    } else if (typeof exports === 'object') {
        // eslint-disable-next-line no-undef, import/no-commonjs
        // eslint-disable-next-line
        module.exports = factory(require('leaflet'));
    }
    // eslint-disable-next-line no-undef
    if (typeof window !== 'undefined' && window.L) {
        // eslint-disable-next-line no-undef
        window.L.Mask = factory(window.L);
    }
// eslint-disable-next-line func-names, no-shadow, id-length, prefer-arrow-callback, func-style
}(function (L) { // eslint-disable-line id-length
    // eslint-disable-next-line id-length
    L.Mask = L.LayerGroup.extend({
        options: {
            // @option fillColor: String = '#333'
            // Fill color for the mask
            fillColor: '#333',
            
            // @option fillOpacity: Number = 0.5
            // Fill opacity for the mask
            fillOpacity: 0.5, // eslint-disable-line no-magic-numbers
            
            // @option color: String = '#333'
            // Stroke color
            color: '#333',
            
            // @option weight: Number = 0
            // Stroke width in pixels
            weight: 0,
            
            // @option interactive: Boolean = false
            // Whether the layer is interactive
            interactive: false
        },

        // eslint-disable-next-line func-names, object-shorthand
        initialize: function (geojson, options) {
            L.setOptions(this, options);
            L.LayerGroup.prototype.initialize.call(this);
            
            if (geojson != null) {
                this.addData(geojson);
            }
        },

        // eslint-disable-next-line func-names, object-shorthand
        addData: function (geojson) {
            const bounds = L.geoJSON(geojson).getBounds();
            const northLatitude = 90; // eslint-disable-line no-magic-numbers
            const southLatitude = -90; // eslint-disable-line no-magic-numbers
            const westLongitude = -180; // eslint-disable-line no-magic-numbers
            const eastLongitude = 180; // eslint-disable-line no-magic-numbers
            const worldBounds = [
                [northLatitude, westLongitude],
                [northLatitude, eastLongitude],
                [southLatitude, eastLongitude],
                [southLatitude, westLongitude],
                [northLatitude, westLongitude]
            ];

            const maskCoordinates = [worldBounds];

            if (geojson.type === 'FeatureCollection') {
                geojson.features.forEach(feature => {
                    if (feature.geometry.type === 'Polygon') {
                        maskCoordinates.push(feature.geometry.coordinates[0].map(coord => [coord[1], coord[0]]));
                    } else if (feature.geometry.type === 'MultiPolygon') {
                        feature.geometry.coordinates.forEach(polygon => {
                            maskCoordinates.push(polygon[0].map(coord => [coord[1], coord[0]]));
                        });
                    }
                });
            } else if (geojson.type === 'Feature') {
                if (geojson.geometry.type === 'Polygon') {
                    maskCoordinates.push(geojson.geometry.coordinates[0].map(coord => [coord[1], coord[0]]));
                } else if (geojson.geometry.type === 'MultiPolygon') {
                    geojson.geometry.coordinates.forEach(polygon => {
                        maskCoordinates.push(polygon[0].map(coord => [coord[1], coord[0]]));
                    });
                }
            } else if (geojson.type === 'Polygon') {
                maskCoordinates.push(geojson.coordinates[0].map(coord => [coord[1], coord[0]]));
            } else if (geojson.type === 'MultiPolygon') {
                geojson.coordinates.forEach(polygon => {
                    maskCoordinates.push(polygon[0].map(coord => [coord[1], coord[0]]));
                });
            }

            const polygon = L.polygon(maskCoordinates, this.options);
            this.addLayer(polygon);
            
            return this;
        }
    });

    // eslint-disable-next-line func-names, no-shadow, id-length
    L.mask = function (geojson, options) {
        return new L.Mask(geojson, options);
    };

    return L.Mask;
// eslint-disable-next-line no-undef
}, window));

