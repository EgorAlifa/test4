export const MetricsDimensionsPanelAsync = () => import('./MetricsDimensionsPanel.vue');
export const DisplaySettingsPanelAsync = () => import('./DisplaySettingsPanel.vue');
export const CategoryPanelAsync = () => import('./CategoryPanel.vue');
export const OptionsPanelAsync = () => import('./OptionsPanel.vue');

export default [
    MetricsDimensionsPanelAsync,
    DisplaySettingsPanelAsync,
    CategoryPanelAsync,
    OptionsPanelAsync
];
