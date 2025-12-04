const WidgetSettingsPanelAsync = () => import('./SettingsPanel.vue');
const PaginationPanelAsync = () => import('./PaginationPanel.vue');
const ExpertPanelAsync = () => import('./ExpertPanel.vue');
const DesignerPanelAsync = () => import('./DesignerPanel.vue');

export default [WidgetSettingsPanelAsync, PaginationPanelAsync, ExpertPanelAsync, DesignerPanelAsync];
