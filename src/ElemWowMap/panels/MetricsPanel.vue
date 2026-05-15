<template>
    <w-panel>
        <ui-container>
            <!-- Empty State -->
            <div v-if="selectedMetricsWithMeta.length === 0" class="empty-message">
                <strong>Добавьте метрики для визуализации на карте</strong>
                <div class="empty-hint">
                    Выберите любое поле из датасета ниже и нажмите "Добавить метрику".<br/>
                    Вы сможете настроить метод агрегации и форматирование для каждой метрики.
                </div>
            </div>
            
            <!-- Selected Metrics List with Accordion -->
            <ui-draggable-accordion
                v-else
                v-model="selectedMetricsWithMeta"
                v-bind="{ toolboxControls }"
                @change="handleMetricsReorder">
                <template #header="{ item }">
                    <div class="metric-header">
                        <span class="metric-icon">📊</span>
                        <span class="metric-name">{{ item.label }}</span>
                    </div>
                </template>
                <template #default="{ item }">
                    <ui-container>
                        <!-- Metric Label -->
                        <ui-input 
                            :value="getMetricSetting(item.name, 'label', item.name)"
                            @change="updateMetricSetting(item.name, 'label', $event)"
                            label="Название метрики">
                        </ui-input>
                        
                        <!-- Aggregation Method -->
                        <ui-select 
                            :value="getMetricSetting(item.name, 'aggregationMethod', 'count')"
                            @change="updateMetricSetting(item.name, 'aggregationMethod', $event)"
                            :options="aggregationOptions" 
                            label="Метод агрегации">
                        </ui-select>
                        
                        <div class="form-label form-label-small mt-2">Форматирование чисел</div>
                        
                        <!-- Number Format -->
                        <ui-select 
                            :value="getMetricSetting(item.name, 'numberFormat', '0')"
                            @change="updateMetricSetting(item.name, 'numberFormat', $event)"
                            :options="formatOptions" 
                            label="Формат метрики">
                        </ui-select>
                        
                        <!-- Separator -->
                        <ui-select 
                            :value="getMetricSetting(item.name, 'separator', '1')"
                            @change="updateMetricSetting(item.name, 'separator', $event)"
                            :options="separatorOptions" 
                            label="Формат разделителя разрядов">
                        </ui-select>
                        
                        <!-- Prefix and Postfix -->
                        <ui-has-two-columns>
                            <template #left>
                                <ui-input 
                                    :value="getMetricSetting(item.name, 'prefix', '')"
                                    @change="updateMetricSetting(item.name, 'prefix', $event)"
                                    placeholder="Префикс">
                                </ui-input>
                            </template>
                            <template #right>
                                <ui-input 
                                    :value="getMetricSetting(item.name, 'postfix', '')"
                                    @change="updateMetricSetting(item.name, 'postfix', $event)"
                                    placeholder="Постфикс">
                                </ui-input>
                            </template>
                        </ui-has-two-columns>
                    </ui-container>
                </template>
            </ui-draggable-accordion>
            
            <!-- Add Metric Section -->
            <div class="add-metric-section">
                <ui-select 
                    v-model="metricToAdd"
                    :options="availableMetricsOptions" 
                    label="Выберите метрику для добавления">
                </ui-select>
                <ui-button 
                    type="ghost" 
                    @click="addMetric"
                    :disabled="metricToAdd == null">
                    Добавить метрику
                </ui-button>
            </div>
        </ui-container>
    </w-panel>
</template>

<script>
import { Panel } from '@goodt-wcore/panel';
import { UiDraggableAccordion } from '@goodt-wcore/panel-ui';
import { usePanelDatasetMixin } from '@goodt-common/data';
import {
    AGGREGATION_METHOD_OPTIONS,
    MetricFormatOptions,
    SeparatorOptions
} from '../utils/constants';

export default {
    extends: Panel,
    components: { UiDraggableAccordion },
    mixins: [usePanelDatasetMixin()],

    meta: { name: 'Метрики', icon: 'gauge' },

    data: (vm) => ({
        metricToAdd: null,
        toolboxControls: [
            { icon: 'mdi-minus-box-outline', label: 'Удалить', handler: vm.deleteMetric }
        ]
    }),

    computed: {
        // List of currently selected metrics
        selectedMetrics() {
            return this.props.metrics || [];
        },

        // Transform metrics for accordion display
        selectedMetricsWithMeta() {
            return this.selectedMetrics.map(metric => {
                const label = this.getMetricLabel(metric);
                
                return {
                    name: metric,
                    label,
                    uid: metric // required for ui-draggable-accordion
                };
            });
        },

        // Available fields from dataset (dimensions + metrics)
        availableMetricsOptions() {
            const selected = this.selectedMetrics;
            
            // Get ALL fields from dataset - both dimensions and metrics
            const allDimensions = this.dimensions || [];
            const allMetrics = this.metrics || [];
            const allFields = [...allDimensions, ...allMetrics];
            
            // Filter out already selected and create options
            const availableOptions = allFields
                .filter(field => {
                    const fieldName = typeof field === 'object' ? field.name : field;
                    return !selected.includes(fieldName);
                })
                .map(field => {
                    const fieldName = typeof field === 'object' ? field.name : field;
                    const fieldLabel = typeof field === 'object' && field.label ? field.label : fieldName;
                    return { value: fieldName, label: fieldLabel };
                });
            
            return [
                { value: null, label: '-- Выберите метрику --' },
                ...availableOptions
            ];
        },

        aggregationOptions() {
            return AGGREGATION_METHOD_OPTIONS;
        },

        formatOptions() {
            return MetricFormatOptions;
        },

        separatorOptions() {
            return SeparatorOptions;
        }
    },

    methods: {
        getMetricLabel(metric) {
            // Get the custom label if set, otherwise use the metric name
            const settings = this.props.metricSettings || {};
            const metricConfig = settings[metric] || {};
            const customLabel = metricConfig.label;
            return customLabel || metric;
        },

        getMetricSetting(metricName, key, defaultValue) {
            const settings = this.props.metricSettings || {};
            const metricConfig = settings[metricName] || {};
            return metricConfig[key] != null ? metricConfig[key] : defaultValue;
        },

        updateMetricSetting(metricName, key, value) {
            const settings = { ...this.props.metricSettings };
            if (settings[metricName] == null) {
                settings[metricName] = {};
            }
            
            settings[metricName][key] = value;
            
            this.props.metricSettings = settings;
            this.propChanged('metricSettings');
        },

        addMetric() {
            if (this.metricToAdd == null) {
                return;
            }
            
            // Check if already added
            if (this.selectedMetrics.includes(this.metricToAdd)) {
                this.metricToAdd = null;
                return;
            }
            
            // Add to metrics array
            const metrics = [...this.selectedMetrics, this.metricToAdd];
            this.props.metrics = metrics;
            this.propChanged('metrics');
            
            // Initialize default settings for new metric
            const settings = { ...this.props.metricSettings };
            if (settings[this.metricToAdd] == null) {
                settings[this.metricToAdd] = {
                    label: this.metricToAdd,
                    aggregationMethod: 'count',
                    numberFormat: '0',
                    separator: '1',
                    prefix: '',
                    postfix: ''
                };
            }
            this.props.metricSettings = settings;
            this.propChanged('metricSettings');
            
            // Reset selection
            this.metricToAdd = null;
        },

        handleMetricsReorder(newMetricsWithMeta) {
            // Extract metric names from the reordered items
            const metrics = newMetricsWithMeta.map(item => item.name);
            
            // Update metrics array
            this.props.metrics = metrics;
            this.propChanged('metrics');
        },

        deleteMetric(index) {
            const metricName = this.selectedMetrics[index];
            const metrics = this.selectedMetrics.filter(met => met !== metricName);
            
            this.props.metrics = metrics;
            this.propChanged('metrics');
            
            // Optionally clean up settings
            const settings = { ...this.props.metricSettings };
            delete settings[metricName];
            this.props.metricSettings = settings;
            this.propChanged('metricSettings');
        }
    }
};
</script>

<style scoped>
.empty-message {
    padding: 1rem;
    text-align: center;
    font-size: 14px;
    color: #1f2937;
    background: #f9fafb;
    border: 2px dashed #e5e7eb;
    border-radius: 8px;
    margin-bottom: 16px;
}

.empty-hint {
    margin-top: 8px;
    font-size: 12px;
    color: #6b7280;
    font-weight: normal;
    line-height: 1.5;
}

.metric-header {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
}

.metric-icon {
    font-size: 16px;
    flex-shrink: 0;
}

.metric-name {
    flex: 1;
    font-weight: 500;
    font-size: 14px;
}

.add-metric-section {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #e5e7eb;
}

.mt-2 {
    margin-top: 8px;
}
</style>

