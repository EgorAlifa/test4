const DimensionsPanelAsync = () => import('./DimensionsPanel.vue');
const MetricsPanelAsync = () => import('./MetricsPanel.vue');
const SettingsPanelAsync = () => import('./SettingsPanel.vue');
const FiltersPanelAsync = () => import('./FiltersPanel.vue');
export { DatasetPanelMixin } from './DatasetPanelMixin';

export default [DimensionsPanelAsync, MetricsPanelAsync, SettingsPanelAsync, FiltersPanelAsync];
