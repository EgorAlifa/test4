const DatasetPanelAsync = () => import('./DatasetPanel.vue');
const MetricsPanelAsync = () => import('./MetricsPanel.vue');
const VisualizationPanelAsync = () => import('./VisualizationPanel.vue');
const AnimationPanelAsync = () => import('./AnimationPanel.vue');
const HeatmapPanelAsync = () => import('./HeatmapPanel.vue');
const ChoroplethPanelAsync = () => import('./ChoroplethPanel.vue');
const FilterPanelAsync = () => import('./FilterPanel.vue');
const ColorPanelAsync = () => import('./ColorPanel.vue');
const CustomStylesPanelAsync = () => import('./CustomStylesPanel.vue');
const MarkersPanelAsync = () => import('./MarkersPanel.vue');

export { DatasetPanelMixin } from './DatasetPanelMixin';

export default [
    DatasetPanelAsync,
    MetricsPanelAsync,
    VisualizationPanelAsync,
    AnimationPanelAsync,
    HeatmapPanelAsync,
    ChoroplethPanelAsync,
    FilterPanelAsync,
    ColorPanelAsync,
    MarkersPanelAsync,
    CustomStylesPanelAsync
];

