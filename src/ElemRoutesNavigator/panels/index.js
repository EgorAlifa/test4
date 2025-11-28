const WidgetSettingsPanelAsync = () => import('./SettingsPanel.vue');
const PaginationPanelAsync = () => import('./PaginationPanel.vue');
const ExpertPanelAsync = () => import('./ExpertPanel.vue');

export default [WidgetSettingsPanelAsync, PaginationPanelAsync, ExpertPanelAsync];
