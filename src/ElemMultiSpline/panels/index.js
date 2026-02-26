// const DremioPanelAsync = () => import('./DremioPanel.vue');
const DimensionsPanelAsync = () => import('./DimensionsPanel.vue');
const MetricsPanelAsync = () => import('./MetricsPanel.vue');
const AxisPanelAsync = () => import('./AxisPanel.vue');
const OptionsPanelAsync = () => import('./OptionsPanel.vue');


// export { /*DremioPanelAsync,*/ DimensionsPanelAsync, MetricsPanelAsync, AxisPanelAsync, OptionsPanelAsync };
export { DatasetPanelMixin } from './DatasetPanelMixin';

export default [/*DremioPanelAsync,*/ DimensionsPanelAsync, MetricsPanelAsync, AxisPanelAsync, OptionsPanelAsync];
