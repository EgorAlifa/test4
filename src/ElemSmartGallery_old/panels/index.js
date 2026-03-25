import { DremioPanelAsync } from '@goodt-common/dremio-panels';

const DremioAddonsPanelAsync = () => import('./DremioAddonsPanel.vue');
const GridPanelAsync = () => import('./GridPanel.vue');
const MetricsPanelAsync = () => import('./MetricsPanel.vue');
const SlotsPanelAsync = () => import('./SlotsPanel.vue');

export default [DremioPanelAsync, DremioAddonsPanelAsync, MetricsPanelAsync, SlotsPanelAsync, GridPanelAsync];
