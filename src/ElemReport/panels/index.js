export { default as DatasetPanelMixin } from './DatasetPanelMixin';

import { DatasetPanelMixin } from '../../PerformanceManagement/ElemPivotTable/panels';

const ReportPanelAsync = () => import('./ReportPanel.vue');
const ServicePanelAsync = () => import('./ServicePanel.vue');

export default [ReportPanelAsync, ServicePanelAsync];
