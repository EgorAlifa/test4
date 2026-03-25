import { useStyleConditionsPanel, useActionsPanel } from '../../shared';

export const SettingsPanelAsync = () => import('./SettingsPanel.vue');

export default [SettingsPanelAsync, useStyleConditionsPanel(), useActionsPanel()];
