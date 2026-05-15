import { useDatasetMeta } from '@goodt-common/data';
import { StoreOperation } from '@goodt-wcore/elem';
import panels, { DatasetPanelMixin } from './panels';
import { DEFAULT_PROPS } from './utils/constants';

/**
 * @description Widget descriptor for ElemWowMap
 * @return {ElemDescriptor}
 */
export const descriptor = () => ({
    props: {
        // Dataset field mapping
        latitudeField: {
            type: String,
            default: DEFAULT_PROPS.latitudeField,
            label: 'Поле широты'
        },
        longitudeField: {
            type: String,
            default: DEFAULT_PROPS.longitudeField,
            label: 'Поле долготы'
        },
        dateField: {
            type: String,
            default: DEFAULT_PROPS.dateField,
            label: 'Поле даты'
        },
        categoryField: {
            type: String,
            default: DEFAULT_PROPS.categoryField,
            label: 'Поле категории'
        },
        valueField: {
            type: String,
            default: DEFAULT_PROPS.valueField,
            label: 'Поле значения'
        },
        descriptionField: {
            type: String,
            default: DEFAULT_PROPS.descriptionField,
            label: 'Поле описания'
        },
        // Region code field (simplified - just one field with RU-XXX format codes)
        regionCodeField: {
            type: String,
            default: '',
            label: 'Поле кода региона (RU-XXX)'
        },
        regionNameField: {
            type: String,
            default: '',
            label: 'Поле названия региона (для подсказки)'
        },
        
        // SVG Map settings
        svgMapFile: {
            type: String,
            default: 'ru.svg',
            label: 'SVG Карта'
        },
        customSvgUrl: {
            type: Object,
            default: null,
            label: 'Пользовательская SVG карта'
        },
        svgIdField: {
            type: String,
            default: 'auto',
            label: 'Поле идентификатора SVG'
        },
        useMapNameForHover: {
            type: Boolean,
            default: false,
            label: 'Использовать название из карты для подсказок'
        },
        
        // Metrics configuration
        metrics: {
            type: Array,
            default: () => [],
            label: 'Метрики'
        },
        metricSettings: {
            type: Object,
            default: () => ({}),
            label: 'Настройки метрик'
        },
        
        // Visualization settings
        visualizationMode: {
            type: String,
            default: DEFAULT_PROPS.visualizationMode,
            label: 'Режим визуализации'
        },
        theme: {
            type: String,
            default: DEFAULT_PROPS.theme,
            label: 'Тема'
        },
        showControls: {
            type: Boolean,
            default: DEFAULT_PROPS.showControls,
            label: 'Показать панель управления'
        },
        showLegend: {
            type: Boolean,
            default: DEFAULT_PROPS.showLegend,
            label: 'Показать легенду'
        },
        showChart: {
            type: Boolean,
            default: DEFAULT_PROPS.showChart,
            label: 'Показать график событий'
        },
        mapTileProvider: {
            type: String,
            default: DEFAULT_PROPS.mapTileProvider,
            label: 'Провайдер карт'
        },
        
        // Map settings
        initialZoom: {
            type: Number,
            default: DEFAULT_PROPS.initialZoom,
            label: 'Начальное увеличение'
        },
        initialCenter: {
            type: Array,
            default: () => [...DEFAULT_PROPS.initialCenterCoords],
            label: 'Начальная позиция центра'
        },
        minZoom: {
            type: Number,
            default: DEFAULT_PROPS.minZoom,
            label: 'Минимальное увеличение'
        },
        maxZoom: {
            type: Number,
            default: DEFAULT_PROPS.maxZoom,
            label: 'Максимальное увеличение'
        },
        autoCenter: {
            type: Boolean,
            default: DEFAULT_PROPS.autoCenter,
            label: 'Автоцентрирование карты'
        },
        
        // Animation settings
        animationSpeed: {
            type: Number,
            default: DEFAULT_PROPS.animationSpeed,
            label: 'Скорость анимации'
        },
        particleGlowDuration: {
            type: Number,
            default: DEFAULT_PROPS.particleGlowDuration,
            label: 'Длительность свечения (мс)'
        },
        fadeTime: {
            type: Number,
            default: DEFAULT_PROPS.fadeTime,
            label: 'Время затухания (дни)'
        },
        animationSpeedMs: {
            type: Number,
            default: DEFAULT_PROPS.animationSpeedMs,
            label: 'Скорость анимации (мс)'
        },
        autoPlay: {
            type: Boolean,
            default: DEFAULT_PROPS.autoPlay,
            label: 'Автовоспроизведение'
        },
        
        // Heatmap settings
        heatmapRadius: {
            type: Number,
            default: DEFAULT_PROPS.heatmapRadius,
            label: 'Радиус теплокарты'
        },
        heatmapBlur: {
            type: Number,
            default: DEFAULT_PROPS.heatmapBlur,
            label: 'Размытие теплокарты'
        },
        heatmapMinOpacity: {
            type: Number,
            default: DEFAULT_PROPS.heatmapMinOpacity,
            label: 'Минимальная прозрачность'
        },
        heatmapMaxIntensity: {
            type: Number,
            default: DEFAULT_PROPS.heatmapMaxIntensity,
            label: 'Максимальная интенсивность'
        },
        heatmapMinIntensity: {
            type: Number,
            default: DEFAULT_PROPS.heatmapMinIntensity,
            label: 'Минимальная интенсивность'
        },
        
        // Dots settings
        dotRadius: {
            type: Number,
            default: DEFAULT_PROPS.dotRadius,
            label: 'Радиус точек'
        },
        dotOpacity: {
            type: Number,
            default: DEFAULT_PROPS.dotOpacity,
            label: 'Прозрачность точек'
        },
        dotSize: {
            type: Number,
            default: DEFAULT_PROPS.dotSize,
            label: 'Размер точки'
        },
        dotColorScheme: {
            type: String,
            default: DEFAULT_PROPS.dotColorScheme,
            label: 'Цветовая схема точек'
        },
        enableDotClustering: {
            type: Boolean,
            default: DEFAULT_PROPS.enableDotClustering,
            label: 'Включить кластеризацию'
        },
        dotColorMin: {
            type: String,
            default: DEFAULT_PROPS.dotColorMin,
            label: 'Цвет точек (мин. значение)'
        },
        dotColorMax: {
            type: String,
            default: DEFAULT_PROPS.dotColorMax,
            label: 'Цвет точек (макс. значение)'
        },
        dotSizeByValue: {
            type: Boolean,
            default: DEFAULT_PROPS.dotSizeByValue,
            label: 'Размер точки по значению'
        },

        // Choropleth settings
        choroplethColorScheme: {
            type: String,
            default: DEFAULT_PROPS.choroplethColorScheme,
            label: 'Цветовая схема хороплета'
        },
        choroplethColorSteps: {
            type: Number,
            default: DEFAULT_PROPS.choroplethColorSteps,
            label: 'Количество цветовых шагов'
        },
        choroplethAggregationMethod: {
            type: String,
            default: DEFAULT_PROPS.choroplethAggregationMethod,
            label: 'Метод агрегации'
        },
        choroplethLevelMetricMapping: {
            type: Object,
            default: () => ({}),
            label: 'Привязка метрик к уровням'
        },
        choroplethMissingDataColor: {
            type: String,
            default: DEFAULT_PROPS.choroplethMissingDataColor,
            label: 'Цвет регионов без данных'
        },
        choroplethBorderAppearance: {
            type: String,
            default: DEFAULT_PROPS.choroplethBorderAppearance,
            label: 'Вид границ регионов'
        },
        choroplethTooltipMetrics: {
            type: Array,
            default: () => [],
            label: 'Метрики для отображения в подсказке хороплета'
        },
        enableCustomBorder: {
            type: Boolean,
            default: DEFAULT_PROPS.enableCustomBorder,
            label: 'Включить кастомные настройки границ'
        },
        customBorderColor: {
            type: String,
            default: DEFAULT_PROPS.customBorderColor,
            label: 'Цвет границ'
        },
        customBorderThickness: {
            type: Number,
            default: DEFAULT_PROPS.customBorderThickness,
            label: 'Толщина границ'
        },
        customBorderRounding: {
            type: Number,
            default: DEFAULT_PROPS.customBorderRounding,
            label: 'Скругление углов (для прямоугольников матрицы)'
        },
        showLabels: {
            type: Boolean,
            default: DEFAULT_PROPS.showLabels,
            label: 'Показывать названия регионов (хороплет)'
        },

        // Drill-down settings
        enableDrillDown: {
            type: Boolean,
            default: DEFAULT_PROPS.enableDrillDown,
            label: 'Включить детализацию (drill-down)'
        },
        drillDownStartLevel: {
            type: Number,
            default: DEFAULT_PROPS.drillDownStartLevel,
            label: 'Начальный уровень детализации (0 = все уровни, 1 = уровень 1, 2 = уровень 2, ...)'
        },
        
        // Filter settings
        enableYearFilter: {
            type: Boolean,
            default: DEFAULT_PROPS.enableYearFilter,
            label: 'Включить фильтр по годам'
        },
        enableCategoryFilter: {
            type: Boolean,
            default: DEFAULT_PROPS.enableCategoryFilter,
            label: 'Включить фильтр по категориям'
        },
        enableLassoTool: {
            type: Boolean,
            default: DEFAULT_PROPS.enableLassoTool,
            label: 'Включить инструмент лассо'
        },
        selectedYears: {
            type: Array,
            default: () => [],
            label: 'Выбранные годы'
        },
        selectedCategories: {
            type: Array,
            default: () => [],
            label: 'Выбранные категории'
        },

        // Top-N filtering
        topN: {
            type: Number,
            default: DEFAULT_PROPS.topN,
            label: 'Показать только N точек (0 = все)'
        },
        topNOrder: {
            type: String,
            default: DEFAULT_PROPS.topNOrder,
            label: 'Порядок Top-N (desc = топ, asc = антитоп)'
        },

        // Yandex Maps API key
        yandexApiKey: {
            type: String,
            default: DEFAULT_PROPS.yandexApiKey,
            label: 'API-ключ Яндекс Карт'
        },

        // Marker overlay settings
        showMarkers: {
            type: Boolean,
            default: DEFAULT_PROPS.showMarkers,
            label: 'Показывать маркеры'
        },
        markerSymbol: {
            type: String,
            default: DEFAULT_PROPS.markerSymbol,
            label: 'Форма маркера (circle/pin/diamond/triangle/arrow)'
        },
        markerColor: {
            type: String,
            default: DEFAULT_PROPS.markerColor,
            label: 'Цвет маркера'
        },
        markerSize: {
            type: Number,
            default: DEFAULT_PROPS.markerSize,
            label: 'Размер маркера'
        },
        markerLatField: {
            type: String,
            default: DEFAULT_PROPS.markerLatField,
            label: 'Поле широты маркера'
        },
        markerLonField: {
            type: String,
            default: DEFAULT_PROPS.markerLonField,
            label: 'Поле долготы маркера'
        },
        markerLabelField: {
            type: String,
            default: DEFAULT_PROPS.markerLabelField,
            label: 'Поле подписи маркера'
        },

        varsToCommit: {
            type: Object,
            default: () => ({
                fromSources: [],
                fromUser: {}
            }),
            label: 'Переменные для отправки'
        },
        varAliases: {
            type: Object,
            default: () => ({}),
            label: 'Алиасы переменных'
        },
        
        // Available Options Settings (control which options are visible in settings panel)
        enableThemeSelector: {
            type: Boolean,
            default: DEFAULT_PROPS.enableThemeSelector,
            label: 'Доступен выбор темы'
        },
        enableModeSelector: {
            type: Boolean,
            default: DEFAULT_PROPS.enableModeSelector,
            label: 'Доступен выбор режима'
        },
        enableFadeSelector: {
            type: Boolean,
            default: DEFAULT_PROPS.enableFadeSelector,
            label: 'Доступен выбор затухания'
        },
        enableParticleSizeSelector: {
            type: Boolean,
            default: DEFAULT_PROPS.enableParticleSizeSelector,
            label: 'Доступен выбор размера частиц'
        },
        enableLegendToggle: {
            type: Boolean,
            default: DEFAULT_PROPS.enableLegendToggle,
            label: 'Доступно переключение легенды'
        },
        
        // UI settings
        controlsPosition: {
            type: String,
            default: DEFAULT_PROPS.controlsPosition,
            label: 'Позиция панели управления'
        },
        legendPosition: {
            type: String,
            default: DEFAULT_PROPS.legendPosition,
            label: 'Позиция легенды'
        },
        chartPosition: {
            type: String,
            default: DEFAULT_PROPS.chartPosition,
            label: 'Позиция графика'
        },
        
        // Color customization
        categoryColors: {
            type: Object,
            default: () => ({ ...DEFAULT_PROPS.categoryColors }),
            label: 'Цвета категорий'
        },
        
        // Custom CSS Styles (Я дизайнер panel)
        customStylePresets: {
            type: Array,
            default: () => [],
            label: 'Кастомные стили пресетов',
            hasConst: true
        },
        customStyles: {
            type: Object,
            default: () => ({
                // Base Container
                mapContainer: '',
                mapRoot: '',
                
                // Controls Panel
                controlsPanel: '',
                controlsPanelContent: '',
                controlsPanelFront: '',
                controlsPanelBack: '',
                controlsHeader: '',
                dateDisplay: '',
                dateLabel: '',
                dateValue: '',
                settingsBtn: '',
                
                // Filters in Controls
                controlsFilters: '',
                filterRow: '',
                filterRowLabel: '',
                filterSelectDropdown: '',
                
                // Animation Controls
                animationControlsCompact: '',
                controlButtonsRow: '',
                controlIconBtn: '',
                controlIconBtnActive: '',
                controlIconBtnWarn: '',
                speedControl: '',
                speedLabel: '',
                speedSlider: '',
                
                // Heatmap Controls
                heatmapControlsCompact: '',
                heatmapSliders: '',
                sliderControl: '',
                sliderLabel: '',
                sliderRow: '',
                heatmapSlider: '',
                sliderValue: '',
                heatmapLoadingIndicator: '',
                heatmapLoadingSpinner: '',
                
                // Dots Controls
                dotsControlsCompact: '',
                dotsSliders: '',
                dotsSlider: '',
                dotsLoadingIndicator: '',
                dotsLoadingSpinner: '',
                
                // Options Panel (Settings Back Face)
                optionsList: '',
                optionGroup: '',
                optionLabel: '',
                optionCheckboxes: '',
                optionCheckboxItem: '',
                optionCheckboxLabel: '',
                optionCheckbox: '',
                optionHint: '',
                
                // Legend Wrapper
                legendWrapper: '',
                
                // Leaflet Map Controls
                leafletZoomControl: '',
                leafletZoomButton: '',
                
                // Choropleth SVG
                choroplethContainer: '',
                choroplethSvgOverlay: '',
                choroplethPath: '',
                choroplethPathHover: '',
                
                // Dots Popup
                dotPopupContainer: '',
                dotPopupContent: '',
                dotPopupHeader: '',
                dotPopupDescription: '',
                dotPopupDate: '',
                
                // Loading & Error States
                loadingOverlay: '',
                loadingSpinner: '',
                errorContainer: '',
                errorTitle: '',
                errorMessage: ''
            }),
            label: 'Кастомные стили CSS'
        }
    },
    vars: {},
    dataset: {
        vars: {
            dimension: { operation: StoreOperation.ALL }
        }
    }
});

export const metaBase = {
    descriptor,
    panels,
    isChildAllowed: false
};

export const meta = useDatasetMeta(metaBase, {
    panel: {
        mixins: [DatasetPanelMixin]
    }
});

