/**
 * @file constants.js
 * @description Default props, options, and constants for ElemWowMap widget
 */

// ===== ANIMATION CONSTANTS (EXACT from map2) =====
export const PARTICLE_BASE_SIZE = 3;
export const HALO_SIZE_MULTIPLIER = 2.5;
export const INITIAL_FLASH = 100;
export const INITIAL_OPACITY = 100;
export const FADE_DURATION_DAYS = 10;
export const FLASH_FADE_SPEED_MULTIPLIER = 1.5;
export const ANIMATION_SPEED_MS = 750; // 5x slower than map2 default (was 150ms)
export const PARTICLE_IMAGE_SRC = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAIAAAAlC+aJAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7DAAAOwwHHb6hkAAAAB3RJTUUH1wQUCC4hoGmo9QAACvlJREFUaN69mltz00gQhS3NSCMlNjEmBYTi//8zCipUsIMd6zKytA/fctKMDITArh5ctqxLX06fvsxkiz84sizLsizPc74sFotpmvSZHPO/fnLxb8jwbNH1yZc8z8dx1HedT+Q7nU6LxWIcxz+U+zkKIC7CSYEsy7z3CDoMQ5ZlRVFwXiJO0zRNE7eM4zgMA2dQ5g+dkD0dKlKA9xVFYZVJjouLixhj13V5nnvvh2GY+wQd+MQnz9DE/VL0PM/zPHfOIX2e50VROOecc4KKvb4sS+yti8uyxPZnH44m2OUZCmS/tDqPFmZkeL1MQBrH0XtPMKAGpkXz0+mUZRkQUgzIe1w8DIN89UcKIJNzTqIvFgvvPX7QgWeKorBBoovHcYwxEiGCO0eMcRxHzlur931v1X4+hJDMGl74wd15npdl6b333kt67/00TUALbhXSsL2FYlEU6GZlBYFzhX/PA5bap2mSlJiKoIRqnHOWSefPEdNbqPDX6XSKMSqK2raVJlmWxRjx0i+j4owC2Iy3OudkJ8wplsTMNishMZ/EQIzxLEdxPfIh9ziOfd8TJ1xAtPR9/3sQEjMgeoIQ+IS/rI1FsvoSQkCZoiiUB6wfEj/zk8gRjKXJb3gAmPIsvQ/E6xpodB7x0oFIEOSIVM7IzHNcgZk8z2V4PN80zU90cHMFMLa40jlnDQ+QEo+BK8WuTDtnYfTUeRsVymXOObETj/pJTLs5eybIqetaNrbJSxgTz6iekwm4KymfcC/PgUx1XhcTcsitQutsQPsfxYDgpACw4chfmNM+V8WFrlceSCg//3ZYpuJpMcayLJXRkJ53zV2RJqayLCV0CIHXz6Uvy9JSEJaG2rEu71NgiLJsoSqWm+d1xYmA9KPy1idCCPryss4Iu1YfQUtqKxPrU9UEcaxqIqlw9QruGoahqqrj8SirJT5MPUDVJb+HEJS2FJGYWXGpUkKxS8QrPEIINmSVW9Q8JCWjJVwZmzhB86QMe1SAHC5PIRPS2/hDQ8mErDr4qfDI87yqKhUROkRuSQ/knKNVSDokgkG1WRLNLmFPHq0vFvpoKCvK8IjOT8tIhNA4jqfTyZZGArfVR5/iJesf6anM/Z0CiC6BhAFRSpKVrfRiUoku26OwrTgQRbaUDkIOr7CZDu9Rn8r51gl+Xn5KepuA8IllcVQVxpCbJM2VIYSiKIhCTsYYZWZyH84pikJZDKfJD+ouuq6TAN9BiFOErGgbR8sDokUuQAEMz/U8AcygQ1EUIQRbWsuHCKca21JnUucpEriYnluN6KMCtimR35VWLQywq3DPi8uyBHVlWVZVdXFxgSZ84UZ5RnDni3NO9lbehZGtmcdvh0j5OwiJsM5WyDYY8LtKbs5776uqEk29evWqLMvT6XR5eVkUxeFw2O12VMvg2znXtq0tGdCnKAphjDmArfnAcIwR9WKM/3pAQoj15QEZWHAkdv23Q967vLy8uLgoy3Kz2SyXy7quh2EIIVRVdTgc8jxfr9dVVbVty4tVCGF7Acb6wfbNakgEHingbZmu65I2yprfVhaQj/c+xrharW5ubrquy7JstVqFENbrtXOO4KOQXi6XwzB0XSfixvzee25E+qR5SHp/Tcf+ZReroi13bXE2r91VYClkKb+ur6+dc5vNBlagrQkhfPjwIcZYVdV6vd7v93QFIYSu6wAVwYCNLc/YQQY6E5aPtZCClackxYbQb2shEZS4CApqmubq6ur9+/dXV1ebzQaVNpvNp0+fQghv377tuq7ruhhj27bOORCvx1oRbfjKUaqg7GU+qW9t6WcLdFsO2WYf2rm+vq7rOoRQ1/Visbi5uXn37h2RsN1uMeput/v48WPf90lGR435oJeEYMeSSJhkYn8WbbpHYWS7MGUJuJnhwjRNq9Xq9evXb968Wa/XL1++xDlwy+Fw2O/3x+NRhY1NzDKnJVBbF3HX2dHdY5Kn57DMxeRD/47msNNZWtjj8fj169emaZxzNHFgtyxL6Gi1Wq3Xa6omSNOWusloUVRh7Xh+hGWjk0OZQonWjmPtpEAFRQhhuVyu1+sXL16IzsWV2IJ8V9c1OtgGRaKLQ+2AI/F8OgK0aUu4tJaw/Y0tnsmyIQQywHK5jDFut1tO1nVd1/XpdNrtdnd3dw8PD1++fNlut23bQqxaLpgPXZK/ZLL5LPlMTwxCxJ5iBpXKKsoV1k3T3N7eAp6+76uq+vz5M5VFjJHYZcLVdd0wDIfDwU61kh5F1Z7QO4eQvdhLVwmq3Mw0BfNohA9tM4gdx/H+/h6VLi8vYTpofhgGVGrbFg+M41jXddu2h8NhGAZCjrfbUicZYdi0o6Hvd9Uor6/rGolV9CsYLOWrU9PYEMAg+tXV1TRN+/3ee9/3/d3d3f39fdd1+/1+t9vt9/tpmo7HY9/3TdMQ+sgkZVQLqRGzIYfaWFP/OiUjiif1E+ggiSU3L8NdVKZnkYACbdviE+S7vb09HA4xRtYBGMUJLZzRSpSdoEBo8LUI81EB8aYaK+KdVCVq0joKdZH3XpYAVE3TnE4nPImZeU3btg8PD/v9/uHhoe/7vu9ZfZKftfInFAmxMpDeJSM+BjExoKrV8kDbtmJrbhOx4ge7bkda3W63fd8z4lwsFoRE0zQxRhKLTM6N3GtNru/yhu0NVcM+lhJaehnHkWU51UVIbFMbGb5pGgJGRE711jRNURS4247cEJ1QAUKiBMwHvm3SFIw5T7mq9PLYkYEKNXusc4mUxM12aqnq1RZOmj0JD8Qo0iAxtbTY3brCsr7tGLV6qwYATz52ZCoKkvWvZJBvl+JoyWkDtAKgZS+WNmwxoyqSF2N7WJi320Gdxbc1h1ydzOecxdZ8iijkAPF5eaeBuCKShb1pmsC90II+ElEYw1GS2C7JKBhY/MOHybKaS4Z7Wp5IloEBlbykqU5ShijvyNH2EJmIxe13lYl2wUpxP78mnY3aVVQ7N7fBZLt+HqSpt6UO7K0tBQAMw1s40Y5ZrrScI/yIPW20pAokwADlyGGjmSdqIJ4sVkuNLMsge5toVThoTduuzUjDJBKQQaxgG+LUA8liMNdpWde+TIW0TSvJqpEFhq0oiYpkxAm4bXeulAz6bUgkhV26xKSaW3lRDCv8KJhsF6JKi4QvhsG0IEosJJRj16TsUVHTtq3sTdCf2XCR/C6KQrshtEY2jiNlT9LvayBpuxPbIp4tg20LZXsDhTVSIr3Cw5LVz1YpbQrTdIl4UAqz5SrWFaLsrDyZLFmEWCa1a/fyUtd1mnlZMnjSQrcoT/NX2VXtTmJjMECVYafCtqwSThTcyaIY+lAXC0WqWH+00no++wrrdpJhk4Dd6mNlVadi14UksY1CywpIzLs0SVBo/XzzSvaj3SrIJ+gDJHKFXKk1qGT9Yr7fw2puvye9mLZ8UGsklcVvbzlDPrvJgCi33ki2HSSCzsPANuzCJ+gCZvKJ8saf7pmr69qKqMlFCEGTYPU9lr4SFrLVmBRQTrCuG4ZB8/e/sOlPyx/ahjOvPuZbl4TDZAsZqGCI2zTNHG/EwNM3nj112yUdpkZdli5ZTTrLcfNhjga6yW4i9TR/Z8/cL73BpC0ZoWm+WZalYpEmTpSf5AdVfr9km7+z8dWOr9XKnN18OUf/Wf+oyn9KvD5n3+icXpTUYIwkDc+rhiRR2KbEVqzP3rz7zL3TZ+s/NRJ2LR4IKSUlLc7/unf6iQfZw3pARLn4D46/4IEklOfZ92xN+rd2r/8DebSckAm1i/EAAAAASUVORK5CYII=";

export const PredefinedColors = [
    '#FF6B6B', // Red
    '#FFA500', // Orange  
    '#FFFFFF', // White
    '#32CD32', // Lime Green
    '#4ECDC4', // Teal
    '#1E90FF', // Dodger Blue
    '#9370DB', // Medium Purple
    '#FF1493', // Deep Pink
    '#00CED1', // Dark Turquoise
    '#FF8C00', // Dark Orange
    '#20B2AA', // Light Sea Green
    '#BA55D3', // Medium Orchid
    '#FF4500', // Orange Red
    '#3CB371', // Medium Sea Green
    '#4169E1', // Royal Blue
    '#DC143C', // Crimson
    '#FFFFFF', // White
    '#48D1CC', // Medium Turquoise
    '#DA70D6', // Orchid
    '#FF69B4'  // Hot Pink
];

// Magic number constants
const INITIAL_ZOOM_LEVEL = 3;
const DEFAULT_LATITUDE = 62;
const DEFAULT_LONGITUDE = 95;
const MAX_ZOOM_LEVEL = 18;
const PARTICLE_GLOW_MS = 3000;
const FADE_DAYS = 10;
export const HEATMAP_DEFAULT_RADIUS = 25;
export const HEATMAP_DEFAULT_BLUR = 15;
export const HEATMAP_MIN_OPACITY_VALUE = 0.5;
const DOT_DEFAULT_RADIUS = 8;
const DOT_DEFAULT_OPACITY = 0.7;
export const DOT_DEFAULT_SIZE = 5;
const CHOROPLETH_DEFAULT_STEPS = 5;
// Default missing data color (light grey)
export const CHOROPLETH_DEFAULT_MISSING_DATA_COLOR = '#e5e7eb';

// Visualization modes
const VisualizationModesConfig = {
    ANIMATION: 'animation',
    HEATMAP: 'heatmap',
    DOTS: 'dots',
    CHOROPLETH: 'choropleth'
};

export const VISUALIZATION_MODES = VisualizationModesConfig;

const VisualizationModeItems = [
    { value: 'animation', label: 'Анимация' },
    { value: 'heatmap', label: 'Тепловая карта' },
    { value: 'dots', label: 'Точечная карта' },
    { value: 'choropleth', label: 'Хороплет' }
];

// Themes
const ThemeItems = [
    { value: 'light', label: 'Светлая' },
    { value: 'dark', label: 'Тёмная' },
    { value: 'blue', label: 'Синяя' }
];

// Admin levels for choropleth
const AdminLevelItems = [
    { value: '4', label: 'Уровень 4 (район)' },
    { value: '6', label: 'Уровень 6 (подрайон)' },
    { value: '8', label: 'Уровень 8 (населённый пункт)' }
];

// Color schemes
const ColorSchemeItems = [
    { value: 'category10', label: 'Категория 10' },
    { value: 'category20', label: 'Категория 20' },
    { value: 'tableau10', label: 'Tableau 10' },
    { value: 'paired', label: 'Парные' },
    { value: 'set1', label: 'Набор 1' },
    { value: 'set2', label: 'Набор 2' },
    { value: 'set3', label: 'Набор 3' }
];

// Choropleth color schemes
// Datawrapper-inspired color palettes
export const ColorPalettes = {
    // Existing UI options (capitalized to match constants.js)
    YlOrRds: ['#ffffb2', '#fed976', '#feb24c', '#fd8d3c', '#fc4e2a', '#e31a1c', '#bd0026', '#800026'],
    YlGnBus: ['#ffffcc', '#c7e9b4', '#7fcdbb', '#41b6c4', '#1d91c0', '#225ea8', '#0c2c84', '#081d58'],
    RdYlGns: ['#d73027', '#f46d43', '#fdae61', '#fee08b', '#d9ef8b', '#a6d96a', '#66bd63', '#1a9850'],
    Blues: ['#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#08519c', '#08306b'],
    Greens: ['#e5f5e0', '#c7e9c0', '#a1d99b', '#74c476', '#41ab5d', '#238b45', '#006d2c', '#00441b'],
    Reds: ['#fee5d9', '#fcbba1', '#fc9272', '#fb6a4a', '#ef3b2c', '#cb181d', '#a50f15', '#67000d'],
    Purples: ['#f2f0f7', '#dadaeb', '#bcbddc', '#9e9ac8', '#807dba', '#6a51a3', '#54278f', '#3f007d'],
    
    // Additional sequential palettes
    Oranges: ['#feedde', '#fdd0a2', '#fdae6b', '#fd8d3c', '#f16913', '#d94801', '#a63603', '#7f2704'],
    Greys: ['#f7f7f7', '#d9d9d9', '#bdbdbd', '#969696', '#737373', '#525252', '#252525', '#000000'],
    
    // Datawrapper signature palettes
    BlueGreens: ['#e0f3db', '#ccebc5', '#a8ddb5', '#7bccc4', '#4eb3d3', '#2b8cbe', '#0868ac', '#084081'],
    PurpleReds: ['#f1eef6', '#d7b5d8', '#df65b0', '#dd1c77', '#980043', '#67001f'],
    YellowGreens: ['#ffffcc', '#d9f0a3', '#addd8e', '#78c679', '#41ab5d', '#238443', '#005a32'],
    YellowOrangeBrowns: ['#ffffd4', '#fee391', '#fec44f', '#fe9929', '#ec7014', '#cc4c02', '#8c2d04'],
    
    // Diverging palettes
    RedBlues: ['#67001f', '#b2182b', '#d6604d', '#f4a582', '#fddbc7', '#d1e5f0', '#92c5de', '#4393c3', '#2166ac', '#053061'],
    BrownTeals: ['#8c510a', '#bf812d', '#dfc27d', '#f6e8c3', '#f5f5f5', '#c7eae5', '#80cdc1', '#35978f', '#01665e', '#003c30'],
    PurpleGreens: ['#762a83', '#9970ab', '#c2a5cf', '#e7d4e8', '#f7f7f7', '#d9f0d3', '#a6dba0', '#5aae61', '#1b7837', '#00441b'],
    PinkGreens: ['#c51b7d', '#de77ae', '#f1b6da', '#fde0ef', '#f7f7f7', '#e6f5d0', '#b8e186', '#7fbc41', '#4d9221', '#276419'],
    
    // Warm and cool
    Warms: ['#fff5eb', '#fee6ce', '#fdd0a2', '#fdae6b', '#fd8d3c', '#f16913', '#d94801', '#8c2d04'],
    Cools: ['#f1eef6', '#d4b9da', '#c994c7', '#df65b0', '#e7298a', '#ce1256', '#91003f'],
    
    // Vibrant
    Vibrants: ['#8dd3c7', '#ffffb3', '#bebada', '#fb8072', '#80b1d3', '#fdb462', '#b3de69', '#fccde5'],
    
    // Blue theme palette - blue shades matching the image
    // Image shows: medium-dark blue for most regions, darker blue for higher values
    // Palette goes from medium-dark (lightest) to very dark (darkest)
    BlueThemes: ['#3b82f6', '#2563eb', '#1e40af', '#1e3a8a', '#1e293b', '#0f172a', '#020617', '#000000'],
    
    // Neon palette for dark mode - vibrant neon colors (blue, yellow, pink)
    // Designed to pop on dark backgrounds with neon glow effect
    Neons: ['#00ffff', '#00bfff', '#1e90ff', '#4169e1', '#ffd700', '#ffa500', '#ff69b4', '#ff1493'],
    
    // Green to Orange palette - light green (50%) to orange (100%)
    // Matching the cash withdrawal map gradient
    GreenToOrange: ['#d4f4dd', '#b8e6c1', '#9dd8a5', '#82ca89', '#ffd4a3', '#ffc085', '#ffac67', '#ff9849'],
    
    // Blue to Orange palette - light blue to orange gradient
    BlueToOrange: ['#d4e6f4', '#b8d4e6', '#9cc2d8', '#80b0ca', '#ffd4a3', '#ffc085', '#ffac67', '#ff9849']
};

const ChoroplethColorSchemeItems = [
    // Datawrapper signature schemes
    { value: 'YlOrRds', label: 'Жёлто-оранжево-красная' },
    { value: 'YlGnBus', label: 'Жёлто-зелёно-синяя' },
    { value: 'RdYlGns', label: 'Красно-жёлто-зелёная (дивергентная)' },
    
    // Sequential single-hue schemes
    { value: 'Blues', label: 'Синие' },
    { value: 'Greens', label: 'Зелёные' },
    { value: 'Reds', label: 'Красные' },
    { value: 'Purples', label: 'Фиолетовые' },
    { value: 'Oranges', label: 'Оранжевые' },
    { value: 'Greys', label: 'Серые' },
    
    // Multi-hue sequential
    { value: 'BlueGreens', label: 'Сине-зелёная' },
    { value: 'PurpleReds', label: 'Пурпурно-красная' },
    { value: 'YellowGreens', label: 'Жёлто-зелёная' },
    { value: 'YellowOrangeBrowns', label: 'Жёлто-оранжево-коричневая' },
    
    // Diverging schemes
    { value: 'RedBlues', label: 'Красно-синяя (дивергентная)' },
    { value: 'BrownTeals', label: 'Коричнево-бирюзовая (дивергентная)' },
    { value: 'PurpleGreens', label: 'Фиолетово-зелёная (дивергентная)' },
    { value: 'PinkGreens', label: 'Розово-зелёная (дивергентная)' },
    
    // Temperature schemes
    { value: 'Warms', label: 'Тёплые тона' },
    { value: 'Cools', label: 'Холодные тона' },
    
    // Special
    { value: 'Vibrants', label: 'Яркие цвета' },
    
    // Blue theme palette
    { value: 'BlueThemes', label: 'Синяя тема' },
    
    // Neon palette for dark mode
    { value: 'Neons', label: 'Неоновая' },
    
    // Green to Orange palette
    { value: 'GreenToOrange', label: 'Зелёно-оранжевая' },
    
    // Blue to Orange palette
    { value: 'BlueToOrange', label: 'Сине-оранжевая' }
];

// Map tile providers
const MapTileItems = [
    { value: 'osm', label: 'OpenStreetMap' },
    { value: 'osm-light', label: 'CartoDB Светлая' },
    { value: 'osm-dark', label: 'CartoDB Тёмная' },
    { value: 'yandex', label: 'Яндекс Карты' },
    { value: 'rosreestr', label: 'Росреестр (НСПД)' }
];

// Aggregation methods for choropleth
const AggregationMethodItems = [
    { value: 'count', label: 'Количество' },
    { value: 'sum', label: 'Сумма' },
    { value: 'average', label: 'Среднее' },
    { value: 'min', label: 'Минимум' },
    { value: 'max', label: 'Максимум' }
];

// Default values
const DefaultPropsConfig = {
    // Dataset field mapping
    latitudeField: 'latitude',
    longitudeField: 'longitude',
    dateField: 'date_event',
    categoryField: 'category_event',
    valueField: null,
    descriptionField: 'description_event',
    // Region code field (simplified - one field with RU-XXX format)
    regionCodeField: '',
    regionNameField: '',
    
    // SVG Map settings
    svgMapFile: 'ru.svg',
    svgIdField: 'auto', // 'id', 'title', 'desc', 'auto'
    useMapNameForHover: false,
    
    // Visualization settings
    visualizationMode: 'heatmap',
    theme: 'light',
    showControls: true,
    showLegend: true,
    showChart: true,
    mapTileProvider: 'osm',
    
    // Map settings
    initialZoom: INITIAL_ZOOM_LEVEL,
    initialCenterCoords: [DEFAULT_LATITUDE, DEFAULT_LONGITUDE],
    minZoom: INITIAL_ZOOM_LEVEL,
    maxZoom: MAX_ZOOM_LEVEL,
    autoCenter: true,
    
    // Animation settings
    animationSpeed: 1,
    particleGlowDuration: PARTICLE_GLOW_MS,
    fadeTime: FADE_DAYS,
    animationSpeedMs: ANIMATION_SPEED_MS,
    autoPlay: false,
    
    // Heatmap settings
    heatmapRadius: HEATMAP_DEFAULT_RADIUS,
    heatmapBlur: HEATMAP_DEFAULT_BLUR,
    heatmapMinOpacity: HEATMAP_MIN_OPACITY_VALUE,
    heatmapMaxIntensity: null,
    heatmapMinIntensity: null,
    
    // Dots settings
    dotRadius: DOT_DEFAULT_RADIUS,
    dotOpacity: DOT_DEFAULT_OPACITY,
    dotSize: DOT_DEFAULT_SIZE,
    dotColorScheme: 'category10',
    enableDotClustering: true,
    dotColorMin: '#bfdbfe',
    dotColorMax: '#1d4ed8',
    dotSizeByValue: false,

    // Choropleth settings
    choroplethColorScheme: 'YlOrRds',
    choroplethColorSteps: CHOROPLETH_DEFAULT_STEPS,
    choroplethAggregationMethod: 'sum',
    choroplethMissingDataColor: CHOROPLETH_DEFAULT_MISSING_DATA_COLOR,
    choroplethBorderAppearance: 'theme',
    enableCustomBorder: false,
    customBorderColor: '#000000',
    customBorderThickness: 1,
    customBorderRounding: 0,
    showLabels: false,

    // Drill-down settings
    enableDrillDown: false,
    drillDownStartLevel: 0, // 0 = show all, 1 = level 1, 2 = level 2, etc.

    // Metrics configuration
    metrics: [],
    metricSettings: {},

    // Filter settings
    enableYearFilter: true,
    enableCategoryFilter: true,
    enableLassoTool: false,
    selectedYears: [],
    selectedCategories: [],

    // Top-N filtering
    topN: null,
    topNOrder: 'desc',

    // Yandex tile API key
    yandexApiKey: '',

    // Marker overlay (shown on top of all modes)
    showMarkers: false,
    markerSymbol: 'circle',
    markerColor: '#e53935',
    markerSize: 10,
    markerLatField: '',
    markerLonField: '',
    markerLabelField: '',

    // Available Options Settings (control which options are visible in settings panel)
    enableThemeSelector: true,
    enableModeSelector: true,
    enableFadeSelector: true,
    enableParticleSizeSelector: true,
    enableLegendToggle: true,

    // UI settings
    controlsPosition: 'topright',
    legendPosition: 'bottomleft',
    chartPosition: 'bottom',

    // Color customization
    categoryColors: {}
};

export const DEFAULT_PROPS = DefaultPropsConfig;

// Animation constants
export const ANIMATION_SPEED_MIN = 0.5;
export const ANIMATION_SPEED_MAX = 5;
export const ANIMATION_SPEED_STEP = 0.5;
export const DEFAULT_GLOW_DURATION = 3000;
export const DEFAULT_FADE_DAYS = 10; // EXACT from map2 (FADE_DURATION_DAYS)

// Heatmap constants
export const HEATMAP_RADIUS_MIN = 5;
export const HEATMAP_RADIUS_MAX = 100;
export const HEATMAP_BLUR_MIN = 5;
export const HEATMAP_BLUR_MAX = 50;
export const HEATMAP_OPACITY_MIN = 0;
export const HEATMAP_OPACITY_MAX = 1;
export const HEATMAP_OPACITY_STEP = 0.1;

// Dots constants
export const DOT_SIZE_MIN = 1;
export const DOT_SIZE_MAX = 20;
export const DOT_SIZE_STEP = 1;
export const DOT_RADIUS_MIN = 2;
export const DOT_RADIUS_MAX = 20;
export const DOT_OPACITY_MIN = 0.1;
export const DOT_OPACITY_MAX = 1;
export const DOT_OPACITY_STEP = 0.1;

// Choropleth constants
export const CHOROPLETH_COLOR_STEPS_MIN = 3;
export const CHOROPLETH_COLOR_STEPS_MAX = 10;

// Metric formatting options
export const MetricFormatOptions = [
    { value: '0', label: '1000' },
    { value: '1', label: '1000,1' },
    { value: '2', label: '1000,12' },
    { value: '3', label: '1000,123' },
    { value: '0%', label: '12%' },
    { value: '1%', label: '12,3%' },
    { value: '2%', label: '12,34%' },
    { value: '3%', label: '12,345%' }
];

export const SeparatorOptions = [
    { value: '0', label: '10000' },
    { value: '1', label: '10 000' },
    { value: '2', label: '10.000' },
    { value: '3', label: '10,000' }
];

// Map constants
const DefaultMapCenterCoords = [DEFAULT_LATITUDE, DEFAULT_LONGITUDE];
export const DEFAULT_MAP_CENTER = DefaultMapCenterCoords;
export const DEFAULT_MAP_ZOOM = INITIAL_ZOOM_LEVEL;

// Map constants
// Marker symbol options
export const MARKER_SYMBOL_OPTIONS = [
    { value: 'circle', label: 'Круг' },
    { value: 'pin', label: 'Маркер (пин)' },
    { value: 'diamond', label: 'Ромб' },
    { value: 'triangle', label: 'Треугольник' },
    { value: 'arrow', label: 'Стрелка' }
];

// Top-N order options
export const TOP_N_ORDER_OPTIONS = [
    { value: 'desc', label: 'По убыванию (топ)' },
    { value: 'asc', label: 'По возрастанию (антитоп)' }
];

// Tile provider URLs
const TileProvidersConfig = {
    osm: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    cartodb: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
    'osm-light': 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    cartodbDark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
    'osm-dark': 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    rosreestr: '/api/tile-proxy/rosreestr/{z}/{x}/{y}'
};

export const TILE_PROVIDERS = TileProvidersConfig;

// Tile provider attributions
const TileAttributionsConfig = {
    osm: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    cartodb: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    'osm-light': '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    cartodbDark: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    'osm-dark': '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    rosreestr: '&copy; <a href="https://pkk.rosreestr.ru">Росреестр</a>',
    yandex: '&copy; <a href="https://yandex.ru/maps">Яндекс.Карты</a>'
};

export const TILE_ATTRIBUTIONS = TileAttributionsConfig;

export const PREDEFINED_COLORS = PredefinedColors;
export const VISUALIZATION_MODE_OPTIONS = VisualizationModeItems;
export const THEME_OPTIONS = ThemeItems;
export const ADMIN_LEVEL_OPTIONS = AdminLevelItems;
export const COLOR_SCHEME_OPTIONS = ColorSchemeItems;
export const CHOROPLETH_COLOR_SCHEME_OPTIONS = ChoroplethColorSchemeItems;
export const MAP_TILE_OPTIONS = MapTileItems;
export const AGGREGATION_METHOD_OPTIONS = AggregationMethodItems;

export default {
    VISUALIZATION_MODES,
    VISUALIZATION_MODE_OPTIONS,
    THEME_OPTIONS,
    ADMIN_LEVEL_OPTIONS,
    COLOR_SCHEME_OPTIONS,
    CHOROPLETH_COLOR_SCHEME_OPTIONS,
    MAP_TILE_OPTIONS,
    AGGREGATION_METHOD_OPTIONS,
    DEFAULT_PROPS,
    ANIMATION_SPEED_MIN,
    ANIMATION_SPEED_MAX,
    ANIMATION_SPEED_STEP,
    DEFAULT_GLOW_DURATION,
    DEFAULT_FADE_DAYS,
    HEATMAP_RADIUS_MIN,
    HEATMAP_RADIUS_MAX,
    HEATMAP_BLUR_MIN,
    HEATMAP_BLUR_MAX,
    HEATMAP_OPACITY_MIN,
    HEATMAP_OPACITY_MAX,
    HEATMAP_OPACITY_STEP,
    DOT_RADIUS_MIN,
    DOT_RADIUS_MAX,
    DOT_OPACITY_MIN,
    DOT_OPACITY_MAX,
    DOT_OPACITY_STEP,
    CHOROPLETH_COLOR_STEPS_MIN,
    CHOROPLETH_COLOR_STEPS_MAX,
    PREDEFINED_COLORS,
    DEFAULT_MAP_CENTER,
    DEFAULT_MAP_ZOOM,
    TILE_PROVIDERS,
    TILE_ATTRIBUTIONS,
    // Animation constants (EXACT from map2)
    PARTICLE_BASE_SIZE,
    HALO_SIZE_MULTIPLIER,
    INITIAL_FLASH,
    INITIAL_OPACITY,
    FADE_DURATION_DAYS,
    FLASH_FADE_SPEED_MULTIPLIER,
    ANIMATION_SPEED_MS,
    PARTICLE_IMAGE_SRC,
    // Heatmap constants
    HEATMAP_DEFAULT_RADIUS,
    HEATMAP_DEFAULT_BLUR,
    HEATMAP_MIN_OPACITY_VALUE,
    // Dots constants
    DOT_DEFAULT_SIZE
};

// Chart constants (EXACT from map2)
export const CHART_NEON_GLOW_BLUR_RADIUS = 10;
export const CHART_NEON_GLOW_COLOR_DARK_THEME = '#00ffff';
export const CHART_NEON_GLOW_ENABLED_LIGHT_THEME = true;
export const CHART_NEON_GLOW_COLOR_LIGHT_THEME = 'rgba(0,0,0,0.3)';
export const SIGNIFICANT_INCREASE_THRESHOLD = 0.20;
export const SIGNIFICANT_INCREASE_FADE_DAYS = 7;

