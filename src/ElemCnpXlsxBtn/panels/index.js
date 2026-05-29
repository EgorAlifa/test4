const SettingsPanelAsync = () => import('./SettingsPanel.vue');
const BtnPanelAsync = () => import('./BtnPanel.vue');
const ColsPanelAsync = () => import('./ColsPanel.vue');
const DebugPanelAsync = () => import('./DebugPanel.vue');

export default [SettingsPanelAsync, BtnPanelAsync, ColsPanelAsync, DebugPanelAsync];
