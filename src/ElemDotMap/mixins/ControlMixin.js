import Leaflet from 'leaflet';
import 'leaflet-fullscreen';
import 'leaflet-minimap';
import 'leaflet-rotate';
import { isEqual } from 'lodash';

export default {
    data: () => ({
        infoZoomLevel: null,
        controlHome: null,
        controlScale: null,
        minimapControl: null,
        fullscreenControl: null,
        infoPanel: null,
        layersControl: null
    }),
    watchEditor: {
        'props.controlScale': {
            handler(value, oldValue) {
                if (isEqual(value, oldValue)) {
                    return;
                }

                this.setControlScale();
            },
            deep: true
        },
        'props.isVisibleControlHome': {
            handler(value, oldValue) {
                if (isEqual(value, oldValue)) {
                    return;
                }

                this.setControlHome();
            }
        },
        'props.shouldShowMinimap': {
            handler(value, oldValue) {
                if (isEqual(value, oldValue)) {
                    return;
                }

                this.setMinimapControl();
            }
        },
        'props.isEnabledFullscreen': {
            handler(value, oldValue) {
                if (isEqual(value, oldValue)) {
                    return;
                }

                this.setFullScreenControl();
            }
        },
        'props.rotateControl.isEnabled': {
            handler(value, oldValue) {
                if (isEqual(value, oldValue)) {
                    return;
                }

                this.initMap();
            }
        },
        'props.rotateControl.bearing': {
            handler(value, oldValue) {
                if (isEqual(value, oldValue)) {
                    return;
                }

                this.setMapRotation();
            }
        },
        [['props.layerManagement.isEnabled', 'props.layerManagement.position']]: {
            handler(value, oldValue) {
                if (isEqual(value, oldValue)) {
                    return;
                }

                this.setLayerManagementControl();
                this.updateMap();
            }
        }
    },
    methods: {
        buildControls() {
            this.setInfoZoom();
            this.setControlScale();
            this.setControlHome();
            this.setMinimapControl();
            this.setFullScreenControl();
            this.setMapRotation();
            this.setLayerManagementControl();
        },
        setInfoZoom() {
            if (this.Map == null) {
                return;
            }

            if (this.infoZoomLevel != null) {
                this.Map.removeControl(this.infoZoomLevel);
            }

            const { shouldShowZoomLevel } = this.props.zoom;
            if (!shouldShowZoomLevel) {
                return;
            }

            this.infoZoomLevel = Leaflet.control({ position: 'topright' });
            this.infoZoomLevel.onAdd = () => {
                const container = Leaflet.DomUtil.create('div');
                const gauge = Leaflet.DomUtil.create('div');
                container.style.padding = '5px';
                container.style.background = 'rgba(255,255,255,1)';
                gauge.innerHTML = `Zoom level: ${this.Map.getZoom()}`;

                this.Map.on('zoomstart zoom zoomend', () => {
                    gauge.innerHTML = `Zoom level: ${this.Map.getZoom()}`;
                });
                container.appendChild(gauge);

                return container;
            };

            this.infoZoomLevel.addTo(this.Map);
        },
        setControlScale() {
            if (this.Map == null) {
                return;
            }

            if (this.controlScale != null) {
                this.Map.removeControl(this.controlScale);
            }

            const { isEnabled } = this.props.controlScale;
            if (!isEnabled) {
                return;
            }

            this.controlScale = Leaflet.control.scale(this.controlScale);
            this.controlScale.addTo(this.Map);
        },
        setControlHome() {
            if (this.Map == null) {
                return;
            }

            if (this.controlHome != null) {
                this.Map.removeControl(this.controlHome);
            }

            const {
                centerLongitude,
                centerLatitude,
                zoom: { zoomFlightOfTheBumblebee },
                isVisibleControlHome
            } = this.props;
            if (isVisibleControlHome === false) {
                return;
            }

            this.controlHome = Leaflet.control({
                position: 'bottomleft'
            });

            this.controlHome.onAdd = () => {
                this._div = Leaflet.DomUtil.create('div', 'btn btn-small btn-primary mdi mdi-home');
                this._div.addEventListener('click', () => {
                    this.flyToPointByCoordinates({
                        coordinates: [centerLatitude, centerLongitude],
                        zoom: zoomFlightOfTheBumblebee
                    });
                });
                return this._div;
            };

            this.controlHome.addTo(this.Map);
        },
        setMinimapControl() {
            if (this.Map == null) {
                return;
            }

            if (this.minimapControl != null) {
                this.Map.removeControl(this.minimapControl);
            }

            const { shouldShowMinimap } = this.props;
            if (!shouldShowMinimap) {
                return;
            }

            const { tile } = this.props.tileLayer;
            const minimapLayer = Leaflet.tileLayer(tile, {});
            this.minimapControl = Leaflet.control.minimap(minimapLayer, { toggleDisplay: true });
            this.minimapControl.addTo(this.Map);
        },
        setFullScreenControl() {
            if (this.Map == null) {
                return;
            }

            if (this.fullscreenControl != null) {
                this.Map.removeControl(this.fullscreenControl);
            }

            const { isEnabledFullscreen } = this.props;
            if (!isEnabledFullscreen) {
                return;
            }

            this.fullscreenControl = Leaflet.control.fullscreen({
                position: 'topleft'
            });
            this.fullscreenControl.addTo(this.Map);
        },
        setMapRotation() {
            if (this.Map == null) {
                return;
            }

            const { isEnabled, bearing } = this.props.rotateControl;
            if (!isEnabled) {
                this.Map.setBearing(0);
                return;
            }

            this.Map.setBearing(bearing);
        },
        setLayerManagementControl() {
            if (this.Map == null) {
                return;
            }

            if (this.layersControl != null) {
                this.Map.removeControl(this.layersControl);
            }

            const { isEnabled, position, defaultBaseTileLayerName } = this.props.layerManagement;
            if (!isEnabled) {
                return;
            }

            const defaultLayer =
                this.tileLayer != null && this.props.isBaseLayerVisible
                    ? {
                          [defaultBaseTileLayerName]: this.tileLayer
                      }
                    : {};
            this.layersControl = Leaflet.control.layers(defaultLayer, null, { position });
            this.layersControl.addTo(this.Map);
        }
    }
};
