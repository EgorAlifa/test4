import { useActionsPanel, useStyleConditionsPanel } from '@goodt-widgets-insight/table-common';

export const SettingsPanelAsync = () => import('./SettingsPanel.vue');

export default [SettingsPanelAsync, useActionsPanel(), useStyleConditionsPanel()];
