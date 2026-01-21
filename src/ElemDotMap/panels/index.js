import { DremioPanelAsync } from '@goodt-common/dremio-panels';

const SettingsPanelAsync = () => import('./SettingsPanel.vue');
const DotsSettingsPanelAsync = () => import('./DotsSettingsPanel.vue');
const LayersPanelAsync = () => import('./LayersPanel.vue');
const AdditionalDremioPanelAsync = () => import('./DremioPanel.vue');

export default [
    DremioPanelAsync,
    AdditionalDremioPanelAsync,
    DotsSettingsPanelAsync,
    LayersPanelAsync,
    SettingsPanelAsync
];
