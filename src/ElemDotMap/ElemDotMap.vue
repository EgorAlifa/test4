<template>
    <w-elem>
        <div v-if="isLoading" class="pos-abs pos-center">
            <div class="preloader pad-6" />
        </div>
        <div class="map-container" :class="{ 'opacity-0': isLoading }">
            <div class="map" ref="map">
                <div v-if="props.searchMetric" class="map__search map-search">
                    <div class="map-search__header">
                        <i class="map-search__icon map-search__icon--map mdi mdi-map-search" @click="toggleSearch" />
                        <input
                            v-if="isSearchOpen"
                            class="map-search__input input"
                            type="text"
                            placeholder="поиск"
                            v-model="search" />
                        <i v-if="isSearchOpen" class="map-search__icon mdi mdi-close" @click.prevent="closeSearch" />
                    </div>
                    <ul v-if="isSearchOpen" class="map-search__list search-list" :style="mapSearchListStyle">
                        <li
                            v-for="(item, idx) in searchMetricsList"
                            class="search-list__item"
                            :key="idx"
                            :class="{ 'search-list__item--active': currentValue == item[props.searchMetric] }"
                            @click.prevent="searchFlightValue(item)">
                            {{ item[props.searchMetric] }}
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </w-elem>
</template>
<script>
/* eslint-disable vue-scoped-css/enforce-style-type, goodt-rules/block-lang */
import { Dremio, Elem } from 'goodt-wcore';
import { convertCssVarToComputedValue } from '@goodt-common/utils';
import { isEqual, isEmpty } from 'lodash';
import Leaflet from 'leaflet';
// eslint-disable-next-line no-restricted-syntax
import 'leaflet.markercluster';

import { meta, Vars } from './descriptor';
import {
    DEFAULT_FILL_OPACITY,
    DEFAULT_OPACITY,
    LayerType,
    PointTypes,
    RuleTypes,
    SectionType,
    TooltipViewType
} from './constants';
import { createGeoApiService } from './api/GeoApiService';

import Mixins from './mixins';
import { MapUtils } from './utils';
import { buildGradientForLayer } from './utils/gradientColorUtils';
import {
    addPointToMap,
    buildCanvasMarker,
    buildCircle,
    buildClusterGroup,
    isCorrectCoordinates,
    setPointsHoverStyles,
    updatePointsStyles,
    updatePointStyles
} from './utils/pointUtils';
import {
    buildLayerLabels,
    buildLayerLegend,
    computeStyleLayer,
    filterGeoJSONLayers,
    findGeoJSONLayer,
    getMinZoomFromByLayers
} from './utils/layerUtils';
import { mapSearchCssVars } from './styles/css-vars';

const { mixin: DremioMixin } = Dremio;

export default {
    meta,
    extends: Elem,
    mixins: [DremioMixin, ...Mixins],
    data() {
        return {
            Map: null,
            canvas: null,
            layerLevel: 1,

            isLoading: false,

            geoJsonLayers: [],
            layers: [],
            drillDownLayerId: null,

            infoPanels: [],
            legends: [],

            points: [],
            selectedPoint: null,
            filteredDatasetRows: [],
            markersGroups: null,

            flightOfTheBumblebeeMetric: null,

            search: '',
            currentValue: '',
            isSearchOpen: false,

            baseLayers: [],
            overlayLayers: [],
            result: null,

            geoApiService: null,
            /** @public */
            loadDataHooks: {
                before: () => {
                    this.removePoints();
                    this.removeClusters();
                },
                then: async (result) => {
                    this.onLoadData(result);

                    if (this.flightOfTheBumblebeeMetric != null) {
                        this.flightOfTheBumblebee();
                        return;
                    }

                    if (this.movingCoordinates != null && this.movingCoordinates.length > 0) {
                        this.flyByCoordinates(this.movingCoordinates, this.$storeState[Vars.SCALING]);
                    }
                }
            },
            // eslint-disable-next-line goodt-rules/data-boolean-key-naming,vue/no-unused-properties
            watchStoreState: false,
            mapHeight: '0px'
        };
    },
    computed: {
        mapSearchListStyle() {
            const { mapHeight } = this;
            return this.$genCssVarsStyle(mapSearchCssVars({ mapHeight }));
        },
        searchMetricsList() {
            const search = this.search.toLowerCase().replace(/\s\s+/g, ' ');
            if (this.props.searchMetric && search !== '') {
                return this.datasetPoints.filter((elem) =>
                    elem[this.props.searchMetric].toLowerCase().includes(search)
                );
            }

            return [];
        },
        movingCoordinates() {
            if (this.$storeState[Vars.MOVING] == null) {
                return [];
            }

            return JSON.parse(this.$storeState[Vars.MOVING]).map(Number);
        },
        datasetPoints() {
            const { dataset } = this.props.points;
            if (dataset == null) {
                return [];
            }

            return dataset === 'main' ? this.result : this.additionalDremioDatasets;
        },
        filteredDatasetPoints() {
            const { hasFilterPointsByRegion, showPointsOnlyOnSecondLevel } = this.props;
            if (hasFilterPointsByRegion && this.layerLevel === 2 && showPointsOnlyOnSecondLevel) {
                return this.filteredDatasetRows;
            }

            return this.datasetPoints;
        },
        datasetLayers() {
            const { layerDataset } = this.props;
            if (layerDataset == null) {
                return [];
            }

            return layerDataset === 'main' ? this.result : this.additionalDremioDatasets;
        },
        computedStyle() {
            return this.$el != null ? getComputedStyle(this.$el) : {};
        }
    },
    watchStore: [
        {
            all: true,
            vars: [Vars.MOVING],
            handler() {
                if (this.movingCoordinates != null && this.movingCoordinates.length > 0) {
                    this.flyByCoordinates(this.movingCoordinates, this.$storeState[Vars.SCALING]);
                }
            }
        },
        {
            handler(_, state) {
                const {
                    props: { metricsFlightOfTheBumblebee }
                } = this;

                if (!(metricsFlightOfTheBumblebee in state)) {
                    this.storeStateWatcher(state);
                    this.storeStateWatcherAdditionalDremio(state);
                    return;
                }

                this.flightOfTheBumblebeeMetric = state[metricsFlightOfTheBumblebee];
                if (this.flightOfTheBumblebeeMetric != null) {
                    this.flightOfTheBumblebee();
                    return;
                }

                this.storeStateWatcher(state);
                this.storeStateWatcherAdditionalDremio(state);
            }
        }
    ],
    watchEditor: {
        'props.tileLayer': {
            handler(value, oldValue) {
                if (isEqual(value, oldValue)) {
                    return;
                }

                this.updateTileLayers();
            },
            deep: true
        },
        'props.zoom': {
            handler(value, oldValue) {
                if (isEqual(value, oldValue)) {
                    return;
                }

                this.updateZoomSettings();
                this.setControlHome();
                this.setInfoZoom();
            },
            deep: true
        },
        [['props.centerLatitude', 'props.centerLongitude']]: {
            handler(value, oldValue) {
                if (isEqual(value, oldValue)) {
                    return;
                }

                this.setControlHome();
                const { zoomMap } = this.props.zoom;
                this.Map.setView(this.resolveCenterMap(), this.takeUnit2Px({ size: zoomMap }));
            }
        },
        'props.isDrilldown': {
            handler(value, oldValue) {
                if (isEqual(value, oldValue)) {
                    return;
                }

                this.updateMap();
            }
        },
        'props.layerSettings': {
            async handler(value, oldValue) {
                if (isEqual(value, oldValue)) {
                    return;
                }

                await this.fetchAllLayers();
                this.updateMap();
            },
            deep: true
        },
        [[
            'props.showPointsOnlyOnSecondLevel',
            'props.shouldUseSecondLevel',
            'props.layerManagement.markers',
            'props.url',
            'props.points'
        ]]: {
            handler(value, oldValue) {
                if (isEqual(value, oldValue)) {
                    return;
                }

                this.updateMapMarkers();
                this.addMapOverlays();
                this.managingPointsVisibility();
                this.setBaseLayers();
            }
        },
        'props.infoPanel': {
            handler(value, oldValue) {
                if (isEqual(value, oldValue)) {
                    return;
                }

                this.updateInfoPanels();
            },
            deep: true
        },
        'props.layerManagement.baseLayers': {
            handler(value, oldValue) {
                if (isEqual(value, oldValue)) {
                    return;
                }

                this.setBaseLayers();
            }
        },
        [['props.isBaseLayerVisible', 'props.layerManagement.defaultBaseTileLayerName']]: {
            handler(value, oldValue) {
                if (isEqual(value, oldValue) || this.layersControl == null || this.tileLayer == null) {
                    return;
                }

                this.setLayerManagementControl();
                this.updateMap();
            }
        },
        'props.layerManagement.additionalLayers': {
            handler(value, oldValue) {
                if (isEqual(value, oldValue)) {
                    return;
                }

                this.updateLayers();
                this.addMapOverlays();
                this.managingLayersVisibility();
            }
        },
        'props.layerManagement.overLayers': {
            handler(value, oldValue) {
                if (isEqual(value, oldValue) || this.layersControl == null || this.tileLayer == null) {
                    return;
                }

                this.addMapOverlays();
            }
        }
    },

    created() {
        this.geoApiService = createGeoApiService();
    },

    mounted() {
        MapUtils.createIconMaterial();
        MapUtils.createCanvasMarker();

        this.initMap();
    },

    beforeDestroy() {
        if (this.Map != null) {
            this.removePoints();
            this.removeLegends();
            this.removeLayers();
            this.removeOverlayLayers();
            this.removeClusters();
            this.removeClusterLayers();
            this.Map.remove();
        }
        this.geoApiService.dispose();
    },
    methods: {
        async initMap() {
            if (this.Map != null) {
                this.Map.remove();
            }

            const {
                zoom: { zoomMap, maxZoomMap, minZoomMap, zoomSnap, wheelPxPerZoomLevel },
                tileLayer: { tile, url },
                rotateControl: { isEnabled: rotate }
            } = this.props;

            this.tileLayer = tile != null ? Leaflet.tileLayer(tile === 'url' ? url : tile) : null;
            this.canvas = Leaflet.canvas();
            this.Map = Leaflet.map(this.$refs.map, {
                renderer: this.canvas,
                zoom: this.takeUnit2Px({ size: zoomMap }),
                zoomDelta: this.takeUnit2Px({ size: zoomSnap }),
                zoomSnap: this.takeUnit2Px({ size: zoomSnap }),
                wheelPxPerZoomLevel: this.takeUnit2Px({ size: wheelPxPerZoomLevel }),
                maxZoom: this.takeUnit2Px({ size: maxZoomMap }),
                minZoom: this.takeUnit2Px({ size: minZoomMap }),
                center: this.resolveCenterMap(),
                layers: this.tileLayer,
                rotate
            });

            await this.fetchAllLayers();
            this.buildControls();
            this.updateMap();

            this.Map.on('zoomend', this.onZoomMapEnd);
            this.Map.on('overlayadd', this.onOverlayAdded);
        },
        onOverlayAdded() {
            const {
                isDotsOnTop,
                points: { type }
            } = this.props;
            if (!isDotsOnTop || type === PointTypes.MARKER) {
                return;
            }

            this.points.forEach((point) => {
                if (this.Map.hasLayer(point)) {
                    point.bringToFront();
                }
            });
        },
        updateMap() {
            if (this.Map == null) {
                return;
            }

            this.setBaseLayers();
            this.updateLayers();
            this.updateMapMarkers();
            this.addMapOverlays();
            this.updateInfoPanels();

            this.managingLayersVisibility();
            this.managingPointsVisibility();
            this.showAllMarkersOnMap();
        },
        onLoadData({ rows }) {
            this.result = Object.freeze(rows);
            this.updateMap();
        },

        async fetchAllLayers() {
            this.isLoading = true;

            try {
                this.geoJsonLayers = await Promise.all(
                    this.props.layerSettings.map(async (layers) => {
                        const geoLayers = await Promise.all(
                            layers
                                .filter(({ type, geoJson: { files } }) => type === LayerType.GEO_JSON && files.length > 0)
                                .map(({ id, isSecondLevel, geoJson: { files, metricEvent } }) =>
                                    this.fetchGeoLayersByLevel({ id, isSecondLevel, files, metricEvent })
                                )
                        );
                        return geoLayers.flat();
                    })
                );
            } catch (error) {
                this.handleError(error);
            } finally {
                this.isLoading = false;
            }
        },
        async fetchGeoLayersByLevel({ id, isSecondLevel, files, metricEvent }) {
            const applyStyleLayer = ({ geoJsonData, region }) => ({
                layerId: isSecondLevel ? Number(`1${id}`) : Number(`0${id}`),
                properties: {
                    geo: geoJsonData,
                    options: {
                        layerId: id,
                        title: region,
                        metricEvent
                    }
                }
            });

            const fetchDataLayer = async ({ url, region }) => {
                const { result: geoJsonData = { features: null, type: null } } =
                    await this.geoApiService.getGeoDataLayer(url);

                return applyStyleLayer({ geoJsonData, region });
            };

            return Promise.all(
                files.filter(({ url }) => !isEmpty(url)).map(({ url, region }) => fetchDataLayer({ url, region }))
            );
        },

        updateMapMarkers() {
            if (this.Map == null) {
                return;
            }

            this.removeClusterLayers();
            this.removePoints();
            this.removeClusters();

            const { shouldUseSecondLevel, showPointsOnlyOnSecondLevel, isDrilldown } = this.props;
            const shouldShowPointOnlySecondLevel =
                shouldUseSecondLevel && showPointsOnlyOnSecondLevel && this.layerLevel === 1 && isDrilldown;
            if (
                shouldShowPointOnlySecondLevel ||
                this.filteredDatasetPoints == null ||
                this.filteredDatasetPoints.length === 0
            ) {
                return;
            }
            const { clusters, type, viewByRules } = this.props.points;
            const { metric, isEnabled } = clusters;

            // filter dataset after filtering by metrics
            if (this.layerLevel === 2) {
                this.filteredDatasetRows = this.filterDatasetPoints(this.selectedGeoJSONLayer);
            }

            this.markersGroups = buildClusterGroup({
                dataset: this.filteredDatasetPoints,
                viewByRules,
                clusterFilterMetric: metric,
                polygonOptions: clusters,
                type,
                shouldBuildClusters: isEnabled,
                computedStyle: this.computedStyle
            });

            this.points = this.buildPoints({
                dataset: this.filteredDatasetPoints,
                markersGroups: this.markersGroups
            });
        },
        /**
         * Устанавливает вид карты, содержащий все точки на карте (автомасштабирование)
         */
        showAllMarkersOnMap() {
            const { shouldVisibleAllMarkers } = this.props.zoom;
            if (this.points.length > 0 && shouldVisibleAllMarkers) {
                const bounds = Leaflet.latLngBounds(
                    this.points.filter((point) => this.Map.hasLayer(point)).map((point) => point.getLatLng())
                );
                if (isEmpty(bounds)) {
                    return;
                }

                this.Map.fitBounds(bounds);
            }
        },

        updateLayers() {
            if (this.Map == null) {
                return;
            }

            this.removeLegends();
            this.removeLayers();

            const { isDrilldown } = this.props;
            if (isDrilldown) {
                this.updateLayersByLevel(this.layerLevel);
            } else {
                this.updateAllLayers();
            }

            this.overlayLayers = this.buildOverlayAdditionalLayers();
        },
        updateLayersByLevel(level) {
            this.removeOverlayLayers();
            if (level === 1) {
                // массив перевернут для отображения слоев в нужном порядке на карте
                this.layers = this.buildLayers({
                    layers: [...this.props.layerSettings[level - 1]].reverse(),
                    geoLayers: this.geoJsonLayers[level - 1]
                });
                return;
            }

            const { layerSettings } = this.props;
            const filteredLayers = layerSettings[this.layerLevel - 1].filter(({ id }) => id !== this.drillDownLayerId);

            // поиск слоя из файлов, в который провалились через дриллдаун
            const selectedLayer = layerSettings[this.layerLevel - 1].find(({ id }) => id === this.drillDownLayerId);
            this.layers = [
                this.buildGeoJSONLayers({
                    layer: selectedLayer,
                    geoLayers: [this.selectedGeoJSONLayer]
                }),
                ...this.buildLayers({
                    layers: [...filteredLayers].reverse(),
                    geoLayers: this.geoJsonLayers[level - 1]
                })
            ];
        },
        updateAllLayers() {
            this.removeOverlayLayers();
            this.layers = this.buildLayers({
                layers: [...this.props.layerSettings.map((settings) => settings.reverse()).flat()],
                geoLayers: this.geoJsonLayers.flat()
            });
        },
        buildLayers({ layers, geoLayers }) {
            return layers
                .flatMap((layer) => {
                    if (layer.type === LayerType.WMS) {
                        return this.buildWMSLayer(layer);
                    }
                    const currentLayerId = layer.isSecondLevel ? Number(`1${layer.id}`) : Number(`0${layer.id}`);

                    const filteredGeoLayers = geoLayers.filter(({ layerId }) => layerId === currentLayerId);
                    return this.buildGeoJSONLayers({
                        layer,
                        geoLayers: filteredGeoLayers
                    });
                })
                .filter(Boolean);
        },
        buildWMSLayer(layer) {
            const { server, properties } = layer.wms;
            if (isEmpty(server) || properties.length === 0) {
                return null;
            }

            const wmsTileLayer = Leaflet.tileLayer.wms(
                server,
                properties.reduce(
                    (acc, { key, value }) => ({
                        [key]: value,
                        ...acc
                    }),
                    {}
                )
            );

            this.Map.addLayer(wmsTileLayer);
            return { settings: layer, layer: wmsTileLayer };
        },
        buildGeoJSONLayers({ layer, geoLayers }) {
            const { colorMetric } = layer.geoJson;
            const gradient = buildGradientForLayer({
                dataset: this.datasetLayers,
                gradient: layer.geoJson.gradient,
                layer,
                colorMetric,
                computedStyle: this.computedStyle
            });

            const geoJSONLayers = geoLayers.map(({ properties }) => {
                const { options, geo } = properties;
                options.geoJson = layer.geoJson;
                return Leaflet.geoJSON(geo, {
                    ...options,
                    renderer: this.canvas,
                    onEachFeature: this.onEachFeatureLayer,
                    style: (feature) =>
                        computeStyleLayer({
                            feature,
                            layer,
                            dataset: this.datasetLayers,
                            gradient,
                            computedStyle: this.computedStyle
                        }),
                    layerId: layer.id
                });
            });

            const featureGroup = Leaflet.featureGroup(geoJSONLayers);

            this.addLayerLegend({ layer, dataset: this.datasetLayers, gradient });

            featureGroup.addTo(this.Map);

            return { featureGroup, settings: layer };
        },
        addLayerLegend({ layer, dataset, gradient }) {
            const legend = buildLayerLegend({ layer, dataset, gradient });
            if (legend == null) {
                return;
            }
            this.legends.push(legend);
            legend.addTo(this.Map);
        },
        buildOverlayAdditionalLayers() {
            if (this.layersControl == null || this.layers.length === 0) {
                return [];
            }

            return this.props.layerManagement.additionalLayers
                .map(({ object, title }) => {
                    // eslint-disable-next-line no-restricted-syntax
                    const foundLayer = this.layers.find(
                        ({ settings }) => object === `${settings.isSecondLevel ? 1 : 0},${settings.id}`
                    );
                    if (foundLayer == null) {
                        return null;
                    }

                    const { featureGroup, layer, settings } = foundLayer;
                    if (settings.type === LayerType.WMS) {
                        return { layer, title, type: SectionType.ADDITIONAL_LAYER };
                    }

                    return { layer: featureGroup, title, type: SectionType.ADDITIONAL_LAYER };
                })
                .filter((layer) => layer != null);
        },

        onEachFeatureLayer(feature, layer) {
            const { metricJSON, metricEvent, metricFilter, labels } = layer.options.geoJson;
            const { [metricJSON]: JSONValue } = layer.feature.properties;
            const foundItem = this.datasetLayers?.find(
                ({ [metricFilter]: filterValue }) => String(filterValue) === String(JSONValue)
            );

            buildLayerLabels({ labels, data: foundItem, layer });

            layer.on({
                click: (event) =>
                    this.zoomToFeature({
                        event,
                        eventName: foundItem != null ? foundItem[metricEvent] : null,
                        geoJsonInfo: layer.options.geoJson
                    }),
                mouseover: this.highlightFeature,
                mouseout: this.resetHighlightFeature
            });
        },
        highlightFeature(e) {
            const layer = e.target;
            const {
                props: { defaultStyleInHover }
            } = this;
            if (defaultStyleInHover.isEnabled) {
                layer.setStyle({
                    ...defaultStyleInHover,
                    fillColor: convertCssVarToComputedValue(defaultStyleInHover.fillColor, this.computedStyle),
                    color: convertCssVarToComputedValue(defaultStyleInHover.color, this.computedStyle)
                });
                layer.bringToBack();
            }

            this.infoPanels.forEach((infoPanel) => {
                infoPanel.update({ data: layer.feature.properties, layerId: layer.defaultOptions.layerId });
            });
        },
        resetHighlightFeature() {
            this.layers.forEach(({ featureGroup, settings: { type } }) => {
                if (featureGroup == null || type === LayerType.WMS) {
                    return;
                }
                const layers = featureGroup.getLayers();
                layers.forEach((geoLayer) => {
                    geoLayer.resetStyle();
                });
            });

            this.infoPanels.forEach((infoPanel) => infoPanel.update({ isReset: true }));
        },

        setBaseLayers() {
            if (this.layersControl == null) {
                return;
            }

            const { isEnabled, baseLayers } = this.props.layerManagement;
            if (!isEnabled) {
                return;
            }

            this.baseLayers.forEach((layer) => this.layersControl.removeLayer(layer));
            this.baseLayers = [];

            baseLayers.forEach(({ title, object }) => {
                const tileLayer = Leaflet.tileLayer(object);
                this.baseLayers.push(tileLayer);
                this.layersControl.addBaseLayer(tileLayer, title);
            });
        },
        addMapOverlays() {
            if (this.layersControl == null) {
                return;
            }

            this.removeClusterLayers();
            this.removeOverlayLayers(false);
            const { overLayers } = this.props.layerManagement;
            (overLayers ?? [{ id: 0 }]).forEach(({ id }) => {
                if ([0, 1].includes(id)) {
                    this.overlayLayers.forEach(({ layer, title }) => {
                        this.layersControl.addOverlay(layer, title);
                    });
                }
                if (id === 1) {
                    return;
                }
                this.addClustersLayers();
            });
        },
        addClustersLayers() {
            const {
                markers: { name, isEnabled, rules }
            } = this.props.layerManagement;
            if (!isEnabled) {
                return;
            }

            if (this.markersGroups == null || this.layersControl == null) {
                return;
            }

            const { defaultCluster, ...clusters } = this.markersGroups;
            if (isEmpty(clusters)) {
                this.layersControl.addOverlay(defaultCluster, name);
                return;
            }

            const {
                viewByRules: { isEnabled: shouldShowPointByRules }
            } = this.props.points;
            if (shouldShowPointByRules && rules.length > 0) {
                Object.values(clusters).forEach((cluster, index) => {
                    this.layersControl.addOverlay(cluster, rules[index].name);
                });
                return;
            }

            Object.entries(clusters).forEach(([key, cluster]) => {
                this.layersControl.addOverlay(cluster, key);
            });
        },

        managingPointsVisibility() {
            const zoomLevel = this.Map.getZoom();
            const {
                viewByRules: { rules, isEnabled: shouldShowPointsByRules }
            } = this.props.points;
            if (this.points.length === 0) {
                return;
            }

            if (!shouldShowPointsByRules || rules.length === 0) {
                this.showClusters();
                return;
            }

            const { type } = this.props.points;
            Object.keys(this.markersGroups).forEach((markerGroup) => {
                const isFoundRule = rules.some(({ zoomFrom, zoomTo, color, marker }) => {
                    const isExisting =
                        type === PointTypes.POINT
                            ? convertCssVarToComputedValue(color, this.computedStyle) === markerGroup
                            : marker === markerGroup;
                    return zoomLevel >= zoomFrom && zoomLevel <= zoomTo && isExisting;
                });
                this.Map[isFoundRule ? 'addLayer' : 'removeLayer'](this.markersGroups[markerGroup]);
            });
        },
        managingLayersVisibility() {
            const zoomLevel = this.Map.getZoom();
            this.managingVisibilityByLayers({ layers: filterGeoJSONLayers(this.layers), zoomLevel });
            if (this.layerLevel === 1) {
                return;
            }

            const minZoom = getMinZoomFromByLayers(this.layers);
            if (zoomLevel < minZoom) {
                this.setFirstLevelMap();
            }
        },
        managingVisibilityByLayers({ layers, zoomLevel }) {
            layers.forEach(({ settings, featureGroup }) => {
                const { zoomFrom, zoomTo } = settings.geoJson;
                if (zoomFrom == null || zoomFrom === '' || zoomTo == null || zoomTo === '') {
                    return;
                }
                if (zoomLevel >= zoomFrom && zoomLevel < zoomTo) {
                    const isExistLayer = this.Map.hasLayer(featureGroup);
                    if (isExistLayer) {
                        return;
                    }

                    this.Map.addLayer(featureGroup);
                    return;
                }

                this.Map.removeLayer(featureGroup);
            });
        },

        updateTileLayers() {
            if (this.Map == null) {
                return;
            }

            if (this.tileLayer != null) {
                this.Map.removeLayer(this.tileLayer);
            }

            const { tile, url } = this.props.tileLayer;
            if (tile == null) {
                return;
            }

            this.tileLayer = Leaflet.tileLayer(tile === 'url' ? url : tile);
            this.tileLayer.addTo(this.Map);
            this.tileLayer.bringToBack();

            this.setMinimapControl();
        },
        updateZoomSettings() {
            if (this.Map == null) {
                return;
            }

            const {
                zoom: { zoomMap, maxZoomMap, minZoomMap, zoomSnap, wheelPxPerZoomLevel }
            } = this.props;

            this.Map.setMinZoom(this.takeUnit2Px({ size: minZoomMap }));
            this.Map.setMaxZoom(this.takeUnit2Px({ size: maxZoomMap }));

            const { options } = this.Map;
            options.wheelPxPerZoomLevel = this.takeUnit2Px({ size: wheelPxPerZoomLevel });
            options.zoomDelta = this.takeUnit2Px({ size: zoomSnap });
            options.zoomSnap = this.takeUnit2Px({ size: zoomSnap });

            this.Map.setZoom(this.takeUnit2Px({ size: zoomMap }));
            this.showAllMarkersOnMap();
        },
        updateMapHeight() {
            this.mapHeight = getComputedStyle(this.$refs.map).getPropertyValue('height');
        },
        toggleSearch() {
            if (!this.isSearchOpen) {
                this.isSearchOpen = true;
                this.updateMapHeight();
                return;
            }

            this.isSearchOpen = false;
            this.search = '';
            this.currentValue = '';
        },
        closeSearch() {
            this.isSearchOpen = false;
            this.search = '';
            this.currentValue = '';

            const {
                centerLongitude,
                centerLatitude,
                zoom: { zoomMap },
                animateDuration
            } = this.props;
            this.Map.flyTo([centerLatitude, centerLongitude], this.takeUnit2Px({ size: zoomMap }), {
                animate: true,
                duration: animateDuration
            });
        },
        searchFlightValue(item) {
            const {
                searchMetric,
                points: { latitude, longitude },
                zoom: { zoomFlightOfTheBumblebee }
            } = this.props;
            this.currentValue = item[searchMetric];
            const coordinates = [item[latitude], item[longitude]];
            this.flyToPointByCoordinates({ coordinates, zoom: this.takeUnit2Px({ size: zoomFlightOfTheBumblebee }) });
        },

        flightOfTheBumblebee() {
            const { dataset } = this.props.points;
            if (this.Map == null || dataset == null) {
                return;
            }

            const {
                centerLongitude,
                centerLatitude,
                zoom: { zoomMap, zoomFlightOfTheBumblebee }
            } = this.props;
            if (this.flightOfTheBumblebeeMetric == null) {
                this.flyToPointByCoordinates({
                    coordinates: [centerLatitude, centerLongitude],
                    zoom: this.takeUnit2Px({ size: zoomMap })
                });
                return;
            }

            const currentDataset = dataset === 'main' ? this.result : this.additionalDremioDatasets;
            if (currentDataset == null) {
                return;
            }

            const {
                points: { longitude, latitude },
                metricsFlightOfTheBumblebee
            } = this.props;
            const coordinates = this.searchFlyCoordinated({
                dataset: currentDataset,
                metricsFlightOfTheBumblebee,
                longitude,
                latitude,
                searchValue: this.flightOfTheBumblebeeMetric
            });

            if (coordinates != null) {
                this.flyToPointByCoordinates({
                    coordinates,
                    zoom: this.takeUnit2Px({ size: zoomFlightOfTheBumblebee })
                });
            }
        },
        searchFlyCoordinated({ dataset, metricsFlightOfTheBumblebee, longitude, latitude, searchValue }) {
            const point = dataset.find((obj) => obj[metricsFlightOfTheBumblebee] === searchValue);

            if (longitude != null && latitude != null && point != null) {
                return [point[latitude], point[longitude]];
            }

            return null;
        },

        buildPoints({ dataset, markersGroups }) {
            const { clusters, latitude, longitude, type } = this.props.points;
            const { isDrilldown } = this.props;

            const { metric: clusterMetric } = clusters;
            return dataset
                .map((pointData, idx) => {
                    const coordinates = [pointData[latitude], pointData[longitude]];
                    if (isCorrectCoordinates(...coordinates) === false) {
                        return null;
                    }

                    const point =
                        type === PointTypes.POINT
                            ? this.buildPoint({ coordinates, idx, pointData })
                            : this.buildMarker({ coordinates, pointData });

                    this.addPointHandlers({ pointData, point });
                    addPointToMap({
                        isDrilldown,
                        point,
                        markersGroups,
                        markerGroupValue:
                            type === PointTypes.POINT
                                ? convertCssVarToComputedValue(point.options.color, this.computedStyle)
                                : point.options.url,
                        clusterFilterMetric: pointData[clusterMetric]
                    });

                    return point;
                })
                .filter(Boolean);
        },
        buildPoint({ coordinates, idx, pointData }) {
            const color = convertCssVarToComputedValue(this.computePointColor(pointData), this.computedStyle);
            const radius = this.calcPointSize(pointData);

            return buildCircle({ canvas: this.canvas, radius, color, coordinates, idx });
        },
        buildMarker({ coordinates, pointData }) {
            const markerIcon = this.resolveMarkerIcon(pointData);
            const iconSized = this.calcMarkerSize(pointData);

            return buildCanvasMarker({ coordinates, markerIcon, iconSized });
        },

        addPointHandlers({ pointData, point }) {
            const { hint, hoverSettings } = this.props.points;
            if (hoverSettings.isEnabled) {
                this.addHoverListeners({ point, settings: hoverSettings });
            }

            const { isEnabled, viewMode, metrics, direction } = hint;
            if (!isEnabled) {
                this.addDefaultClickEvent({
                    url: this.props.url,
                    point,
                    data: pointData,
                    listener: this.listenerPoint
                });
                return;
            }

            const content = this.createHintContent({ pointData, metrics });
            this.addPointTooltip({
                viewMode,
                content,
                direction,
                url: this.props.url,
                point,
                data: pointData
            });
        },
        createHintContent({ pointData, metrics }) {
            if (!Array.isArray(metrics)) {
                return '';
            }

            return metrics.reduce(
                (acc, { color, fontSize, textAlign, fontFamily, prefix, metric, format, postfix }) =>
                    `${acc} <div class="mar-bot-2" style="color:${convertCssVarToComputedValue(
                        color,
                        this.computedStyle
                    )}; font-family: ${fontFamily}; font-size: ${fontSize}; text-align: ${textAlign}">${prefix} ${MapUtils.formatMetric(
                        MapUtils.isIntegerNumber(Number(pointData[metric]))
                            ? Number(pointData[metric])
                            : pointData[metric],
                        format
                    )} ${postfix}</div>`,
                ''
            );
        },
        addHoverListeners({ point, settings }) {
            const { type } = this.props.points;
            point.on('mouseover', ({ target: selectedPoint }) => {
                setPointsHoverStyles({ points: this.points, type, selectedPoint, settings });
            });

            point.on('mouseout', () => {
                updatePointsStyles({
                    points: this.points,
                    opacity: DEFAULT_OPACITY,
                    fillOpacity: DEFAULT_FILL_OPACITY,
                    type
                });
            });
        },
        listenerPoint({ url = null, data, point }) {
            this.$storeCommit(data);
            this.togglePointSelection({ point, data });

            if (url == null) {
                return;
            }

            this.$routeNavigate({ path: url });
        },
        togglePointSelection({ point, data }) {
            const {
                selectPointSettings: {
                    isEnabled: useSelectedPointStyling,
                    selectOpacity,
                    selectFillOpacity,
                    opacity,
                    fillOpacity
                },
                points: { type },
                shouldResetState
            } = this.props;
            const isPointAlreadySelected = isEqual(this.selectedPoint, point);
            this.selectedPoint = isPointAlreadySelected ? null : point;
            if (isPointAlreadySelected && shouldResetState) {
                this.$storeCommit(Object.keys(data).reduce((state, key) => ({ ...state, [key]: null }), {}));
            }

            if (!useSelectedPointStyling) {
                return;
            }

            updatePointsStyles({
                points: this.points,
                type,
                opacity: isPointAlreadySelected ? DEFAULT_OPACITY : opacity,
                fillOpacity: isPointAlreadySelected ? DEFAULT_OPACITY : fillOpacity
            });
            if (this.selectedPoint == null) {
                return;
            }
            updatePointStyles({
                type,
                point: this.selectedPoint,
                opacity: selectOpacity,
                fillOpacity: selectFillOpacity
            });
        },
        calcPointSize(pointData) {
            const {
                sizeByRule: { isEnabled, metric, optimizationSize, maxSizePoint },
                point: { defaultSize }
            } = this.props.points;

            if (!isEnabled) {
                return this.takeUnit2Px({ size: defaultSize });
            }

            const metricValue = pointData[metric];
            if (metricValue == null) {
                return this.takeUnit2Px({ size: defaultSize });
            }

            return Math.min(
                (this.takeUnit2Px({ size: defaultSize }) * metricValue) / this.takeUnit2Px({ size: optimizationSize }),
                this.takeUnit2Px({ size: maxSizePoint })
            );
        },
        calcMarkerSize(pointData) {
            const {
                sizeByRule: { isEnabled, metric, optimizationSize, maxSizePoint },
                marker: { width, height }
            } = this.props.points;
            const defaultSizes = [width, height].map((item) => this.takeUnit2Px({ size: item }));
            if (!isEnabled) {
                return defaultSizes;
            }

            const metricValue = pointData[metric];
            if (metricValue == null) {
                return defaultSizes;
            }

            return [
                Math.min(
                    (this.takeUnit2Px({ size: width }) * metricValue) / this.takeUnit2Px({ size: optimizationSize }),
                    this.takeUnit2Px({ size: maxSizePoint })
                ),
                Math.min(
                    (this.takeUnit2Px({ size: height }) * metricValue) / this.takeUnit2Px({ size: optimizationSize }),
                    this.takeUnit2Px({ size: maxSizePoint })
                )
            ];
        },
        addPointTooltip({ viewMode, content, direction, url, point, data }) {
            if (viewMode === TooltipViewType.ALL) {
                point.bindTooltip(content, { permanent: true, direction });
                return;
            }

            if (viewMode === TooltipViewType.CLICK) {
                point.bindTooltip(content, { direction, className: 'custom-tooltip' });
                point.off();
                point.on({
                    click: () => {
                        point.openTooltip();
                    }
                });
                return;
            }

            point.bindTooltip(content, { permanent: false, direction });
            point.on(
                'click',
                this.listenerPoint.bind(this, {
                    content,
                    url,
                    data,
                    point
                })
            );
        },
        addDefaultClickEvent({ point, url, data, listener }) {
            point.on(
                'click',
                listener.bind(this, {
                    url,
                    data,
                    point
                })
            );
        },
        computePointColor(pointData) {
            const {
                point: { defaultColor },
                viewByRules: { metric, rules, isEnabled, ruleType }
            } = this.props.points;

            const numberValue = Number(pointData[metric]);
            if (!isEnabled || numberValue == null) {
                return defaultColor;
            }

            const foundRule = rules.find(({ from, to, value }) => {
                const searchValues =
                    value != null
                        ? value
                              .toLowerCase()
                              .split(';')
                              .map((string) => string.trim())
                        : [];
                return ruleType === RuleTypes.STRING
                    ? searchValues.includes(String(pointData[metric]).toLowerCase().trim())
                    : numberValue >= from && numberValue <= to;
            });
            if (foundRule == null) {
                return defaultColor;
            }

            return foundRule.color;
        },
        resolveMarkerIcon(pointData) {
            const {
                marker: { url: defaultMarkerIcon },
                viewByRules: { isEnabled, metric, ruleType, rules }
            } = this.props.points;
            if (metric == null || rules.length === 0 || !isEnabled) {
                return defaultMarkerIcon;
            }

            const metricValue = pointData[metric];
            const variant = rules.find(({ value, from, to }) => {
                const searchValues =
                    value != null
                        ? value
                              .toLowerCase()
                              .split(';')
                              .map((string) => string.trim())
                        : [];

                return ruleType === RuleTypes.STRING
                    ? searchValues.includes(String(pointData[metric]).toLowerCase().trim())
                    : metricValue >= from && metricValue <= to;
            });

            if (variant == null) {
                return defaultMarkerIcon;
            }

            return variant.marker;
        },
        flyByCoordinates(coordinates, zoom) {
            const { zoomFlightOfTheBumblebee } = this.props.zoom;
            this.flyToPointByCoordinates({
                coordinates,
                zoom: zoom || this.takeUnit2Px({ size: zoomFlightOfTheBumblebee })
            });
        },
        flyToPointByCoordinates({ coordinates, zoom }) {
            if (this.Map == null) {
                return;
            }

            this.hideClusters();

            const { animateDuration: duration } = this.props;
            const { maxZoomMap, minZoomMap } = this.props.zoom;
            const numberZoom = Number(zoom);
            const isLowerZoom = numberZoom < this.takeUnit2Px({ size: minZoomMap });
            const isBiggerZoom = numberZoom > this.takeUnit2Px({ size: maxZoomMap });
            let currentZoom = numberZoom;
            if (isLowerZoom) {
                currentZoom = this.takeUnit2Px({ size: minZoomMap });
            }
            if (isBiggerZoom) {
                currentZoom = this.takeUnit2Px({ size: maxZoomMap });
            }

            this.Map.flyTo(coordinates.map(Number), currentZoom, {
                animate: true,
                duration
            });

            setTimeout(() => {
                this.showClusters();
            }, duration * 1000);
        },

        updateInfoPanels() {
            const { isVisible } = this.props.infoPanel;
            this.infoPanels.forEach((infoPanel) => this.Map.removeControl(infoPanel));
            this.infoPanels = [];
            if (!isVisible) {
                return;
            }

            if (this.layerLevel === 1) {
                const {
                    firstLevel: { panelTemplates, hint }
                } = this.props.infoPanel;
                this.infoPanels = panelTemplates.map((panelTemplate) => this.buildInfoPanel({ panelTemplate, hint }));
                return;
            }

            const {
                secondLevel: { panelTemplates, hint }
            } = this.props.infoPanel;
            this.infoPanels = panelTemplates.map((panelTemplate) => this.buildInfoPanel({ panelTemplate, hint }));
        },
        buildInfoPanel({ panelTemplate, hint }) {
            const { layer, metricFilter, metricJSON, metrics } = panelTemplate;
            const infoPanel = Leaflet.control();
            infoPanel.onAdd = function () {
                this._div = Leaflet.DomUtil.create('div', 'info');
                this.update({ isReset: true });
                return this._div;
            };
            infoPanel.update = function ({ data, layerId, isReset = false }) {
                if (isReset) {
                    this._div.innerHTML = hint;
                    return;
                }
                if (layerId !== layer || data == null) {
                    this._div.innerHTML = hint;
                    return;
                }
                this._div.innerHTML = this.getInfoData(data);
            };
            infoPanel.getInfoData = (data) => {
                if (this.datasetLayers == null || data == null || [metricJSON, metricFilter].includes(null)) {
                    return 'Нет данных';
                }

                const metric = data[metricJSON];
                // eslint-disable-next-line eqeqeq
                const regionRows = this.datasetLayers.filter((elem) => elem[metricFilter] === String(metric));
                if (regionRows.length === 0) {
                    return 'Нет данных';
                }

                return this.createContentHandler({ regionRows, metrics });
            };
            infoPanel.addTo(this.Map);
            return infoPanel;
        },
        createContentHandler({ regionRows, metrics }) {
            if (!Array.isArray(metrics)) {
                return '';
            }

            return metrics.reduce(
                (acc, item) =>
                    `${acc} <div class="mar-bot-2" style="color:${convertCssVarToComputedValue(
                        item.color,
                        this.computedStyle
                    )}; font-size: ${item.fontSize}; text-align: ${item.textAlign}">${
                        item.prefix
                    } ${MapUtils.formatMetric(
                        MapUtils.isIntegerNumber(Number(regionRows[0][item.metric])) && item.useSum
                            ? this.getTotalValueByMetric(regionRows, item.metric)
                            : regionRows[0][item.metric],
                        item.format
                    )} ${item.postfix}</div>`,
                ''
            );
        },

        removePoints() {
            this.points.forEach((point) => point.remove());
            this.points = [];
        },
        hideClusters() {
            if (this.markersGroups == null) {
                return;
            }

            Object.values(this.markersGroups).forEach((markersGroup) => {
                this.Map.removeLayer(markersGroup);
            });
        },
        showClusters() {
            if (this.markersGroups == null) {
                return;
            }

            Object.values(this.markersGroups).forEach((markersGroup) => {
                this.Map.addLayer(markersGroup);
            });
        },
        removeClusters() {
            if (this.markersGroups == null) {
                return;
            }

            Object.values(this.markersGroups).forEach((markersGroup) => {
                this.Map.removeLayer(markersGroup);
            });
            this.markersGroups = null;
        },
        removeClusterLayers() {
            if (this.markersGroups == null || this.layersControl == null) {
                return;
            }

            Object.values(this.markersGroups).forEach((markersGroup) => {
                this.layersControl.removeLayer(markersGroup);
            });
        },
        removeOverlayLayers(shouldResetState = true) {
            this.overlayLayers.forEach(({ layer }) => {
                this.layersControl.removeLayer(layer);
            });

            if (shouldResetState) {
                this.overlayLayers = [];
            }
        },
        removeLayers() {
            this.layers.forEach(({ featureGroup, layer, settings }) => {
                if (settings.type === LayerType.WMS) {
                    this.Map.removeLayer(layer);
                    return;
                }

                this.Map.removeLayer(featureGroup);
            });

            this.layers = [];
        },
        removeLegends() {
            this.legends.forEach((legend) => this.Map.removeControl(legend));
            this.legends = [];
        },

        resolveCenterMap() {
            const { centerLongitude, centerLatitude } = this.props;
            return Leaflet.latLng(centerLatitude, centerLongitude);
        },
        setFirstLevelMap() {
            this.currentFeature = null;
            this.layerLevel = 1;
            this.updateMap();
        },

        zoomToFeature({ event, eventName, geoJsonInfo }) {
            // trigger event by click layer
            if (eventName == null || eventName !== '') {
                this.$eventTrigger(eventName);
            }

            // commit to store data by layer
            this.currentFeature = event;
            const { drillDownLayer: secondLayerId, metricJSON, metricFilter, drillDownMetricJSON, path } = geoJsonInfo;
            const {
                properties: { [metricJSON]: geoJSONValue }
            } = event.target.feature;
            const dataByRegion = this.datasetLayers.find((item) => String(item[metricFilter]) === String(geoJSONValue));
            if (dataByRegion != null) {
                this.$storeCommit(dataByRegion);
            }

            if (path != null && path.trim() !== '') {
                this.$routeNavigate({ path });
            }

            const { isDrilldown } = this.props;
            if (!isDrilldown) {
                return;
            }

            const geoJSONLayer = findGeoJSONLayer({
                layers: this.geoJsonLayers[this.layerLevel],
                secondLayerId,
                drillDownMetricJSON,
                geoJSONValue
            });
            if (geoJSONLayer == null) {
                return;
            }

            const { drilldownZoom } = this.props.zoom;
            if (drilldownZoom == null || drilldownZoom === '') {
                this.Map.fitBounds(event.target.getBounds());
            } else {
                this.Map.setView(event.target.getBounds().getCenter(), this.takeUnit2Px({ size: drilldownZoom }));
            }

            this.selectedGeoJSONLayer = geoJSONLayer;
            this.drillDownLayerId = secondLayerId;
            this.filteredDatasetRows = this.filterDatasetPoints(geoJSONLayer);
            this.layerLevel = 2;

            this.setBaseLayers();
            this.updateMapMarkers();
            this.updateLayers();
            this.addMapOverlays();
            this.updateInfoPanels();
        },
        filterDatasetPoints(layer) {
            const { filterPointMetric, filterGeoJSON } = this.props;
            const {
                features: [feature]
            } = layer.properties.geo;
            const { [filterGeoJSON]: filterValue } = feature.properties;

            return this.props.hasFilterPointsByRegion
                ? this.datasetPoints.filter(({ [filterPointMetric]: value }) => String(value) === String(filterValue))
                : this.datasetPoints;
        },
        onZoomMapEnd() {
            this.managingLayersVisibility();
            this.managingPointsVisibility();
        },
        getTotalValueByMetric(el, metric) {
            return el.reduce((acc, { [metric]: value }) => acc + Number(value), 0);
        }
    }
};
</script>

<style scoped lang="pcss" src="./styles/style.pcss" />
<style lang="css" src="leaflet-fullscreen/dist/leaflet.fullscreen.css" />
<style lang="css" src="leaflet-minimap/dist/Control.MiniMap.min.css" />
<style lang="css" src="leaflet/dist/leaflet.css" />
