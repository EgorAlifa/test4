const DremioPanelAsync = () => import('./DremioPanel.vue');
const DimensionsPanelAsync = () => import('./DimensionsPanel.vue');
const MetricsPanelAsync = () => import('./MetricsPanel.vue');
const AxisPanelAsync = () => import('./AxisPanel.vue');
const OptionsPanelAsync = () => import('./OptionsPanel.vue');

export { DremioPanelAsync, DimensionsPanelAsync, MetricsPanelAsync, AxisPanelAsync, OptionsPanelAsync };

export const panels = [DremioPanelAsync, DimensionsPanelAsync, MetricsPanelAsync, AxisPanelAsync, OptionsPanelAsync];
