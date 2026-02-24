export { DatasetPanelMixin } from './DatasetPanelMixin';

export default [
    () => import('./ApiConfigPanel.vue'),
    () => import('./DisplayPanel.vue'),
    () => import('./StylePanel.vue')
];

