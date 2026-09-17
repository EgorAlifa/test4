const DremioPanelAsync = () => import('./DremioPanel.vue');
const DimensionPanelAsync = () => import('./DimensionPanel.vue');
const WidgetSettingsPanelAsync = () => import('./WidgetSettingsPanel.vue');
const PaginationPanelAsync = () => import('./PaginationPanel.vue');

export default [DremioPanelAsync, DimensionPanelAsync, WidgetSettingsPanelAsync, PaginationPanelAsync];
