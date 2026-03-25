import { DremioPanelAsync } from '@goodt-common/dremio-panels';

const ColumnsPanelAsync = () => import('./ColumnsPanel.vue');
const SettingsPanelAsync = () => import('./SettingsPanel.vue');
export const ContextPanelAsync = () => import('./ContextPanel.vue');
export const PaginationPanelAsync = () => import('./PaginationPanel.vue');

export default [DremioPanelAsync, ColumnsPanelAsync, SettingsPanelAsync];
