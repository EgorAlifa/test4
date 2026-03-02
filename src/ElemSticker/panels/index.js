/**
 * ElemSticker Panels - Async Exports
 *
 * Code-split panel loading for optimal bundle size.
 */

const ContentPanelAsync = () => import('./ContentPanel.vue');
const AppearancePanelAsync = () => import('./AppearancePanel.vue');
const MetadataPanelAsync = () => import('./MetadataPanel.vue');
const VariablesPanelAsync = () => import('./VariablesPanel.vue');

export default [
    ContentPanelAsync,
    AppearancePanelAsync,
    MetadataPanelAsync,
    VariablesPanelAsync
];

export {
    ContentPanelAsync,
    AppearancePanelAsync,
    MetadataPanelAsync,
    VariablesPanelAsync
};
