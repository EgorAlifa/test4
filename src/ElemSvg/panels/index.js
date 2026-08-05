const ObjectSettingsPanelAsync = () => import('./ObjectSettingsPanel.vue');
const DimensionsMetricsPanelAsync = () => import('./DimensionsMetricsPanel.vue');
const SettingsPanelAsync = () => import('./SettingsPanel.vue');

export default [ObjectSettingsPanelAsync, DimensionsMetricsPanelAsync, SettingsPanelAsync];
