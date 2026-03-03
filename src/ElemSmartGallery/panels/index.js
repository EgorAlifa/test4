const GridPanelAsync = () => import('./GridPanel.vue');
const MetricsPanelAsync = () => import('./MetricsPanel.vue');
const SlotsPanelAsync = () => import('./SlotsPanel.vue');

export default [MetricsPanelAsync, SlotsPanelAsync, GridPanelAsync];
