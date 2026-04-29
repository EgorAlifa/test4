const DimensionPanelAsync = () => import('./DimensionPanel.vue');
const SettingsPanelAsync = () => import('./SettingsPanel.vue');
const PaginationPanelAsync = () => import('./PaginationPanel.vue');

export { DatasetPanelMixin } from './DatasetPanelMixin';
export default [DimensionPanelAsync, SettingsPanelAsync, PaginationPanelAsync];
