export const SettingsPanelAsync = () => import('./SettingsPanel.vue');
export const ApiPanelAsync = () => import('./ApiPanel.vue');

export default [ApiPanelAsync, SettingsPanelAsync];
