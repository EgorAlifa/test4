export const PointTypes = Object.freeze({
    POINT: 'point',
    MARKER: 'marker'
});

export const RuleTypes = Object.freeze({
    NUMBER: 'number',
    STRING: 'string'
});

export const LayerType = Object.freeze({
    WMS: 'wms',
    GEO_JSON: 'geoJson'
});

export const SectionType = Object.freeze({
    BASE_LAYER: 'baseLayer',
    ADDITIONAL_LAYER: 'additionalLayer',
    POINTS: 'points'
});

export const ClusterBackgroundColor = Object.freeze({
    SMALL: 'rgba(110, 204, 57, 1)',
    MEDIUM: 'rgba(240, 194, 12, 1)',
    LARGE: 'rgba(241, 128, 23, 1)'
});

export const TooltipViewType = Object.freeze({
    ALL: 'all',
    CLICK: 'click',
    HOVER: 'hover'
});

export const FIX_MIN_RANGE = 0.01;
export const MIN_COLOR_GRADIENT_DEFAULT = 'rgba(255,255,255,1.0)';
export const MAX_COLOR_GRADIENT_DEFAULT = 'rgba(0,0,255,1.0)';
export const DEFAULT_FILL_OPACITY = 0.8;
export const DEFAULT_OPACITY = 1;

export const createLayerManagementObject = () => ({
    isEnabled: false,
    position: 'topright',
    style: {
        color: '#000',
        fontSize: '14px',
        fontFamily: '',
        offset: '10px',
        textAlign: 'left',
        direction: 'row',
        buttonColor: '#000',
        buttonSize: '14px'
    },
    defaultBaseTileLayerName: 'Стандартный',
    baseLayers: [],
    additionalLayers: [],
    markers: {
        isEnabled: false,
        rules: [],
        name: 'Точки'
    }
});

export const createPointsSettingsObject = () => ({
    dataset: null,
    longitude: null,
    latitude: null,
    type: PointTypes.POINT,
    point: {
        defaultColor: '#ff0000',
        defaultSize: 30
    },
    marker: {
        url: null,
        width: 40,
        height: 40
    },
    sizeByRule: {
        isEnabled: false,
        metric: null,
        optimizationSize: 50,
        maxSizePoint: 3000
    },
    viewByRules: {
        isEnabled: false,
        metric: null,
        ruleType: RuleTypes.NUMBER,
        rules: []
    },
    clusters: {
        isEnabled: false,
        metric: null,
        spiderfyOnMaxZoom: false,
        distanceFromCenter: 1,
        markerDistance: 1,
        defaultBackground: 'rgba(0, 255, 35, 1)',
        defaultColor: '#fff',
        useRules: false,
        rules: [],
        spiderfyShape: {
            isEnabled: false,
            weight: 5,
            color: '#b43',
            fillColor: '#000'
        }
    },
    hint: {
        isEnabled: false,
        viewMode: TooltipViewType.HOVER,
        background: '#ffffff',
        direction: 'left',
        verticalPadding: '1rem',
        horizontalPadding: '0.75rem',
        triangleColor: 'rgba(0, 145, 255, 1)',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.4)',
        metrics: [],
        borderWidth: '1px',
        borderColor: 'white'
    },
    hoverSettings: {
        isEnabled: false,
        hoverOpacity: 1,
        hoverFillOpacity: 0.8,
        opacity: 0.3,
        fillOpacity: 0.1
    }
});

export const createPointsSelectSettingsObject = () => ({
    isEnabled: false,
    selectOpacity: DEFAULT_OPACITY,
    selectFillOpacity: DEFAULT_FILL_OPACITY,
    opacity: 0.3,
    fillOpacity: 0.1
});

export const createInfoPanelObject = () => ({
    isVisible: false,
    firstLevel: {
        hint: 'Выберите регион',
        panelTemplates: []
    },
    secondLevel: {
        hint: 'Выберите МО',
        panelTemplates: []
    }
});

export const createZoomObject = () => ({
    shouldShowZoomLevel: false,
    zoomMap: 2,
    minZoomMap: 2,
    maxZoomMap: 18,
    zoomFlightOfTheBumblebee: 7,
    zoomSnap: 1,
    wheelPxPerZoomLevel: 60,
    shouldVisibleAllMarkers: false,
    drlldownZoom: null
});

export const createDefaultHoverStyleObject = () => ({
    isEnabled: false,
    weight: 1,
    color: '#ff1f1f',
    fillColor: '#ff6868'
});

export const createTileLayerObject = () => ({
    tile: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    url: ''
});

export const createControlScaleObject = () => ({
    isEnabled: false,
    maxWidth: 150
});

export const createGradientObject = () => ({
    gradientColorUse: false,
    gradientColorMax: 'rgba(0, 255, 0, 1)',
    gradientColorMin: 'rgba(255, 0, 0, 1)',
    gradientSmoothing: 12,
    gradientFormat: null
});

export const createRotateControlObject = () => ({
    isEnabled: false,
    bearing: 45
});

export const createSearchObject = () => ({
    top: '128px'
});

// два уровня слоев
export const createLayerSettings = () => [[], []];
