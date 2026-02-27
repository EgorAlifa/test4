const MetricPanelAsync = () => import('./MetricPanel.vue');
const BenchPanelAsync = () => import('./BenchPanel.vue');
const SettingsPanelAsync = () => import('./WidgetSettingsPanel.vue');

export { DatasetPanelMixin } from "./DatasetPanelMixin";
export default [MetricPanelAsync, BenchPanelAsync, SettingsPanelAsync];
