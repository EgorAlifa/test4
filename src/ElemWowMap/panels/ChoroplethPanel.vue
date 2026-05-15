<template>
    <w-panel>
        <ui-container>
            <div class="info-message">
                ℹ️ <strong>Настройки визуализации хороплета:</strong><br/>
                Регионы окрашиваются на основе выбранной метрики из панели "Метрики".<br/>
                Используется поле кода региона (RU-XXX) из панели "Поля данных".
            </div>

            <!-- Color scheme -->
            <ui-select
                prop="choroplethColorScheme"
                :options="options.colorSchemes"
                label="Цветовая схема">
            </ui-select>

            <!-- Color steps -->
            <ui-slider
                prop="choroplethColorSteps"
                :min="options.colorStepsMin"
                :max="options.colorStepsMax"
                :step="1"
                label="Количество цветов">
            </ui-slider>

            <!-- Missing data color -->
            <ui-input-cp
                prop="choroplethMissingDataColor"
                label="Цвет регионов без данных">
            </ui-input-cp>

            <!-- Border appearance -->
            <ui-select
                prop="choroplethBorderAppearance"
                :options="options.borderAppearances"
                label="Вид границ регионов">
            </ui-select>

            <!-- Tooltip Metrics Selection -->
            <div class="tooltip-metrics-container">
                <div class="form-label form-label-small tooltip-metrics-label">
                    Метрики в подсказке
                </div>
                <div class="tooltip-metrics-hint">
                    💡 Выберите метрики для отображения в подсказке при наведении на регионы
                </div>
                <div v-if="availableMetricsForTooltip.length > 0" class="tooltip-metrics-list">
                    <label 
                        v-for="metric in availableMetricsForTooltip" 
                        :key="metric.value"
                        class="tooltip-metric-checkbox-item">
                        <input 
                            type="checkbox" 
                            :value="metric.value"
                            :checked="isMetricSelectedForTooltip(metric.value)"
                            @change="handleTooltipMetricToggle(metric.value, $event)"
                            class="tooltip-metric-checkbox"
                        />
                        <span class="tooltip-metric-label">{{ metric.label }}</span>
                    </label>
                </div>
                <div v-else class="empty-metrics-message">
                    Сначала добавьте метрики в панели "Метрики"
                </div>
            </div>

            <!-- Custom Border Settings -->
            <div class="custom-border-settings-container">
                <div class="form-label form-label-small custom-border-settings-label">
                    Кастомные настройки границ
                </div>
                <ui-checkbox
                    prop="enableCustomBorder"
                    label="Включить кастомные настройки границ">
                </ui-checkbox>
                <div v-if="enableCustomBorder">
                    <ui-input-cp
                        prop="customBorderColor"
                        label="Цвет границ">
                    </ui-input-cp>
                    <ui-input
                        type="number"
                        prop="customBorderThickness"
                        :min="0.5"
                        :max="10"
                        :step="0.5"
                        label="Толщина границ">
                    </ui-input>
                    <ui-input
                        type="number"
                        prop="customBorderRounding"
                        :min="0"
                        :max="20"
                        :step="0.5"
                        label="Скругление углов (для прямоугольников матрицы)">
                    </ui-input>
                </div>
            </div>

            <!-- SVG Map Settings -->
            <div class="form-label form-label-small svg-map-settings-label">
                Настройки SVG карты
            </div>

            <!-- Map selector -->
            <ui-select
                prop="svgMapFile"
                :options="svgMapOptions"
                label="Выбор карты">
            </ui-select>

            <!-- Custom SVG File -->
            <ui-input-browse 
                type="file" 
                prop="customSvgUrl" 
                @change="propChanged('customSvgUrl')">
                Пользовательская SVG карта
            </ui-input-browse>

            <!-- ID field selector -->
            <ui-select
                prop="svgIdField"
                :options="svgIdFieldOptions"
                label="Поле идентификатора SVG">
            </ui-select>

            <!-- Use map name for hover -->
            <ui-checkbox
                prop="useMapNameForHover"
                label="Использовать название из карты для подсказок">
            </ui-checkbox>

            <!-- Drill-down Settings -->
            <div class="form-label form-label-small drill-down-settings-label">
                Настройки детализации
            </div>

            <!-- Enable drill-down -->
            <ui-checkbox
                prop="enableDrillDown"
                label="Включить детализацию (drill-down)">
            </ui-checkbox>

            <!-- Start level selector -->
            <ui-input
                v-if="props.enableDrillDown"
                prop="drillDownStartLevel"
                type="number"
                :min="0"
                label="Начальный уровень детализации (0 = все уровни, 1+ = конкретный уровень)">
            </ui-input>
        </ui-container>
    </w-panel>
</template>

<script>
import { Panel } from '@goodt-wcore/panel';
import { usePanelDatasetMixin } from '@goodt-common/data';
// eslint-disable-next-line import/named
import {
    CHOROPLETH_COLOR_SCHEME_OPTIONS,
    CHOROPLETH_COLOR_STEPS_MIN,
    CHOROPLETH_COLOR_STEPS_MAX
} from '../utils/constants';

const MAX_ELEMENTS_TO_CHECK = 10;
const MAX_PREVIEW_LENGTH_ID_TITLE = 20;
const MAX_PREVIEW_LENGTH_DESC = 30;

const BorderAppearanceOptions = [
    { value: 'theme', label: 'Как в теме' },
    { value: 'colored', label: 'Цветные' },
    { value: 'neon', label: 'Неоновое свечение' }
];

export default {
    extends: Panel,

    mixins: [usePanelDatasetMixin()],

    meta: { name: 'Хороплет', icon: 'map' },

    data() {
        return {
            options: {
                colorSchemes: CHOROPLETH_COLOR_SCHEME_OPTIONS,
                colorStepsMin: CHOROPLETH_COLOR_STEPS_MIN,
                colorStepsMax: CHOROPLETH_COLOR_STEPS_MAX,
                borderAppearances: BorderAppearanceOptions
            },
            svgFieldExamples: {
                id: null,
                title: null,
                desc: null
            }
        };
    },

    computed: {
        enableCustomBorder() {
            if (this.props == null) {
                return false;
            }
            return this.props.enableCustomBorder === true;
        },

        availableMetricsForTooltip() {
            if (this.props == null || this.props.metrics == null) {
                return [];
            }
            
            const metrics = this.props.metrics || [];
            const metricSettings = this.props.metricSettings || {};
            
            return metrics.map(metricName => {
                const config = metricSettings[metricName] || {};
                const label = config.label || metricName;
                
                return {
                    value: metricName,
                    label
                };
            });
        },

        svgMapOptions() {
            return [
                { label: 'Актуальная карта РФ', value: 'ru.svg' },
                { label: 'Матричная карта РФ', value: 'ru_matrix.svg' },
                { label: 'Матричная карта РФ (длинные названия)', value: 'ru_matrix_long.svg' }
                // Add more SVG maps here as they become available
            ];
        },

        svgIdFieldOptions() {
            const idExample = this.svgFieldExamples.id;
            const titleExample = this.svgFieldExamples.title; // Now contains RU-XXX format
            const descExample = this.svgFieldExamples.desc;

            const baseOptions = [
                { 
                    label: 'Авто (поиск во всех атрибутах)', 
                    value: 'auto',
                    preview: idExample || titleExample || descExample || null
                }
            ];

            // Add ID option with preview
            const idLabel = idExample 
                ? `ID (например: ${idExample})`
                : 'ID';
            baseOptions.push({ label: idLabel, value: 'id', preview: idExample });

            // Add Title option with preview (now shows RU-XXX format)
            const titleLabel = titleExample 
                ? `Title (например: ${titleExample})`
                : 'Title';
            baseOptions.push({ label: titleLabel, value: 'title', preview: titleExample });

            // Add Desc option with preview
            const descLabel = descExample 
                ? `Desc (например: ${descExample})`
                : 'Desc';
            baseOptions.push({ label: descLabel, value: 'desc', preview: descExample });

            return baseOptions;
        },

    },

    watch: {
        'props.customSvgUrl': {
            handler(newValue) {
                // Check if custom SVG is provided (non-null, non-undefined, and non-empty)
                if (newValue != null && newValue !== '') {
                    // Parse custom SVG when selected (takes priority)
                    this.parseSVGForExamples(newValue);
                } else if (this.props.svgMapFile) {
                    // Fall back to default SVG when custom is cleared
                    this.parseSVGForExamples(this.props.svgMapFile);
                }
            },
            immediate: true
        },
        'props.svgMapFile': {
            handler(newValue) {
                // Only parse if custom SVG is not selected (null, undefined, or empty string)
                const hasCustomSvg = this.props.customSvgUrl != null && this.props.customSvgUrl !== '';
                if (newValue && !hasCustomSvg) {
                    this.parseSVGForExamples(newValue);
                }
            },
            immediate: true
        }
    },

    methods: {
        isMetricSelectedForTooltip(metricName) {
            const selectedMetrics = this.props.choroplethTooltipMetrics || [];
            return selectedMetrics.includes(metricName);
        },

        handleTooltipMetricToggle(metricName, event) {
            const isChecked = event.target.checked;
            let selectedMetrics = [...(this.props.choroplethTooltipMetrics || [])];
            
            if (isChecked) {
                // Add metric if not already selected
                if (!selectedMetrics.includes(metricName)) {
                    selectedMetrics.push(metricName);
                }
            } else {
                // Remove metric
                selectedMetrics = selectedMetrics.filter(m => m !== metricName);
            }
            
            this.props.choroplethTooltipMetrics = selectedMetrics;
            this.propChanged('choroplethTooltipMetrics');
        },

        async parseSVGForExamples(svgSource) {
            try {
                let svgUrl;
                
                // Check if svgSource is a custom uploaded file (string starting with 'upload/') or asset file name
                if (typeof svgSource === 'string') {
                    // Check if it's a custom uploaded file (starts with 'upload/')
                    if (svgSource.startsWith('upload/')) {
                        // Custom SVG attachment from project files - use as URL directly
                        svgUrl = svgSource;
                    } else {
                        // SVG file name from assets directory
                        const svgModule = await import(`../assets/${svgSource}`);
                        svgUrl = svgModule.default || svgModule;
                    }
                } else if (typeof svgSource === 'object' && svgSource != null) {
                    // Legacy: Custom SVG attachment as object (if it ever happens)
                    svgUrl = svgSource;
                } else {
                    return;
                }
                
                // Fetch SVG content
                const response = await fetch(svgUrl);
                
                if (response.ok === false) {
                    return;
                }
                
                const svgText = await response.text();
                
                // Parse SVG
                const parser = new DOMParser();
                const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
                
                // Find first few path, polygon, polyline, or g elements
                const elements = svgDoc.querySelectorAll('path, polygon, polyline, g');
                
                if (elements.length === 0) {
                    return;
                }

                // Pick ONE random element to extract all field examples from
                const randomIndex = Math.floor(Math.random() * elements.length);
                const randomElement = elements[randomIndex];
                
                // Extract all fields from this single element
                let idExample = null;
                let titleExample = null;
                let descExample = null;
                
                // Get ID
                const id = randomElement.getAttribute('id');
                if (id != null && id.trim() !== '') {
                    idExample = id;
                }
                
                // Get Title (attribute or element)
                const title = randomElement.getAttribute('title');
                if (title != null && title.trim() !== '') {
                    titleExample = title;
                } else {
                    const titleElement = randomElement.querySelector('title');
                    if (titleElement != null && titleElement.textContent != null && titleElement.textContent.trim() !== '') {
                        titleExample = titleElement.textContent.trim();
                    }
                }
                
                // Get Desc (attribute or element)
                const desc = randomElement.getAttribute('desc');
                if (desc != null && desc.trim() !== '') {
                    descExample = desc;
                } else {
                    const descElement = randomElement.querySelector('desc');
                    if (descElement != null && descElement.textContent != null && descElement.textContent.trim() !== '') {
                        descExample = descElement.textContent.trim();
                    }
                }
                
                // If we didn't get all examples from random element, try a few more
                if (idExample == null || titleExample == null || descExample == null) {
                    const maxElementsToCheck = Math.min(elements.length, MAX_ELEMENTS_TO_CHECK);
                    for (let i = 0; i < maxElementsToCheck; i++) {
                        if (i !== randomIndex) {
                            const element = elements[i];
                            
                            if (idExample == null) {
                                const elementId = element.getAttribute('id');
                                if (elementId != null && elementId.trim() !== '') {
                                    idExample = elementId;
                                }
                            }
                            
                            if (titleExample == null) {
                                const elementTitle = element.getAttribute('title');
                                if (elementTitle != null && elementTitle.trim() !== '') {
                                    titleExample = elementTitle;
                                } else {
                                    const titleEl = element.querySelector('title');
                                    if (titleEl != null && titleEl.textContent != null && titleEl.textContent.trim() !== '') {
                                        titleExample = titleEl.textContent.trim();
                                    }
                                }
                            }
                            
                            if (descExample == null) {
                                const elementDesc = element.getAttribute('desc');
                                if (elementDesc != null && elementDesc.trim() !== '') {
                                    descExample = elementDesc;
                                } else {
                                    const descEl = element.querySelector('desc');
                                    if (descEl != null && descEl.textContent != null && descEl.textContent.trim() !== '') {
                                        descExample = descEl.textContent.trim();
                                    }
                                }
                            }
                            
                            if (idExample != null && titleExample != null && descExample != null) {
                                break;
                            }
                        }
                    }
                }

                // Update examples (truncate long values for display)
                const truncateText = (text, maxLength) => {
                    if (text == null) {
                        return null;
                    }
                    if (text.length > maxLength) {
                        return `${text.substring(0, maxLength)}...`;
                    }
                    return text;
                };

                this.svgFieldExamples = {
                    id: truncateText(idExample, MAX_PREVIEW_LENGTH_ID_TITLE),
                    title: truncateText(titleExample, MAX_PREVIEW_LENGTH_ID_TITLE),
                    desc: truncateText(descExample, MAX_PREVIEW_LENGTH_DESC)
                };
            } catch (error) {
                // Reset examples on error
                this.svgFieldExamples = {
                    id: null,
                    title: null,
                    desc: null
                };
            }
        }
    }
};
</script>

<style scoped>
.info-message {
    padding: 12px;
    margin: 12px 0;
    background-color: #eff6ff;
    border: 1px solid #bfdbfe;
    border-radius: 6px;
    font-size: 13px;
    color: #1e40af;
    line-height: 1.5;
}

.svg-map-settings-label {
    margin-top: 16px;
}

.custom-border-settings-container {
    margin-bottom: 16px;
    padding: 12px;
    background-color: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
}

.custom-border-settings-label {
    margin-bottom: 8px;
}

.tooltip-metrics-container {
    margin-bottom: 16px;
    padding: 12px;
    background-color: #f0f9ff;
    border: 1px solid #bae6fd;
    border-radius: 8px;
}

.tooltip-metrics-label {
    margin-bottom: 8px;
}

.tooltip-metrics-hint {
    margin-bottom: 12px;
    font-size: 12px;
    color: #0369a1;
    line-height: 1.5;
}

.tooltip-metrics-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.tooltip-metric-checkbox-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px;
    background-color: #ffffff;
    border: 1px solid #e0f2fe;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.tooltip-metric-checkbox-item:hover {
    background-color: #f0f9ff;
    border-color: #7dd3fc;
}

.tooltip-metric-checkbox {
    width: 18px;
    height: 18px;
    cursor: pointer;
    accent-color: #0284c7;
}

.tooltip-metric-label {
    font-size: 13px;
    color: #0c4a6e;
    font-weight: 500;
    flex: 1;
}

.empty-metrics-message {
    padding: 12px;
    text-align: center;
    font-size: 13px;
    color: #64748b;
    background-color: #f8fafc;
    border: 1px dashed #cbd5e1;
    border-radius: 6px;
}
</style>

