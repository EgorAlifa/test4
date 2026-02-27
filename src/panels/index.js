const DimensionsPanelAsync = () => import('./DimensionsPanel.vue');
const MetricsPanelAsync = () => import('./MetricsPanel.vue');
const OptionsPanelAsync = () => import('./OptionsPanel.vue');

export { DatasetPanelMixin } from './DatasetPanelMixin';

export default [DimensionsPanelAsync, MetricsPanelAsync, OptionsPanelAsync];

