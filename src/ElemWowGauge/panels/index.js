const DatasetPanelAsync = () => import('./DatasetPanel.vue');
const SettingsPanelAsync = () => import('./SettingsPanel.vue');
const CustomStylesPanelAsync = () => import('./CustomStylesPanel.vue');

export { DatasetPanelMixin } from './DatasetPanelMixin';

export default [DatasetPanelAsync, SettingsPanelAsync, CustomStylesPanelAsync];
