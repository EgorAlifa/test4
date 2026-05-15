/**
 * Leaflet.Mask
 * https://github.com/ptma/Leaflet.Mask
 *
 * Rewritten as ES module — call registerLMask(window.L) after Leaflet is loaded.
 */

// eslint-disable-next-line id-length
export function registerLMask(L) {
    if (!L || L.Mask) return;

    // eslint-disable-next-line id-length
    L.Mask = L.LayerGroup.extend({
        options: {
            fillColor: '#333',
            fillOpacity: 0.5, // eslint-disable-line no-magic-numbers
            color: '#333',
            weight: 0,
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

    // eslint-disable-next-line func-names, id-length
    L.mask = function (geojson, options) {
        return new L.Mask(geojson, options);
    };
}
