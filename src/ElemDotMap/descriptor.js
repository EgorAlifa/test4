import { cssVars } from './styles/css-vars';
import panels from './panels';
import {
    createLayerManagementObject,
    createPointsSettingsObject,
    createInfoPanelObject,
    createZoomObject,
    createRotateControlObject,
    createGradientObject,
    createControlScaleObject,
    createDefaultHoverStyleObject,
    createTileLayerObject,
    createLayerSettings,
    createSearchObject,
    createPointsSelectSettingsObject
} from './constants';

export const Vars = {
    MOVING: 'перемещение',
    SCALING: 'масштабирование'
};

const descriptor = () => ({
    props: {
        dremio: {
            type: Object,
            default: null
        },
        additionalDremio: {
            type: Array,
            default: null
        },
        height: {
            type: String,
            default: '100'
        },
        heightUnit: {
            type: String,
            default: '%'
        },
        infoPanel: {
            type: Object,
            default: createInfoPanelObject
        },
        isDrilldown: {
            type: Boolean,
            default: true
        },
        controlScale: {
            type: Object,
            default: createControlScaleObject
        },
        defaultStyleInHover: {
            type: Object,
            default: createDefaultHoverStyleObject
        },
        zoom: {
            type: Object,
            default: createZoomObject
        },
        animateDuration: {
            type: Number,
            default: 3
        },
        tileLayer: {
            type: Object,
            default: createTileLayerObject
        },
        metricsFlightOfTheBumblebee: {
            type: String,
            default: null
        },
        centerLongitude: {
            type: String,
            default: 100
        },
        centerLatitude: {
            type: String,
            default: 60
        },
        points: {
            type: Object,
            default: createPointsSettingsObject
        },
        selectPointSettings: {
            type: Object,
            default: createPointsSelectSettingsObject
        },
        url: {
            type: String,
            default: '',
            hasConst: true
        },
        searchMetric: {
            type: String,
            default: null
        },
        hasFilterPointsByRegion: {
            type: Boolean,
            default: false
        },
        filterPointMetric: {
            type: String,
            default: null
        },
        filterGeoJSON: {
            type: String,
            default: null
        },
        gradient: {
            type: Object,
            default: createGradientObject
        },
        isVisibleControlHome: {
            type: Boolean,
            default: true
        },
        isEnabledFullscreen: {
            type: Boolean,
            default: false
        },
        shouldShowMinimap: {
            type: Boolean,
            default: false
        },
        rotateControl: {
            type: Object,
            default: createRotateControlObject
        },
        layerDataset: {
            type: String,
            default: null
        },
        layerSettings: {
            type: Array,
            default: createLayerSettings
        },
        layerManagement: {
            type: Object,
            default: createLayerManagementObject
        },
        shouldUseSecondLevel: {
            type: Boolean,
            default: false
        },
        showPointsOnlyOnSecondLevel: {
            type: Boolean,
            default: false
        },
        search: {
            type: Object,
            default: createSearchObject
        },
        isBaseLayerVisible: {
            type: Boolean,
            default: true
        },
        isBaseLayerOnBottom: {
            type: Boolean,
            default: false
        },
        isDotsOnTop: {
            type: Boolean,
            default: false
        },
        shouldResetState: {
            type: Boolean,
            default: false
        }
    },
    vars: Object.values(Vars).reduce((acc, varName) => ({ ...acc, [varName]: { description: varName } }), {})
});

export const meta = {
    descriptor,
    cssVars,
    panels
};
