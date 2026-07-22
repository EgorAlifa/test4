/**
 * ElemSmartGallery Panels — 4 tabs total.
 *
 * Grid and Metrics settings were merged into SettingsPanel (gallery section)
 * to avoid showing inapplicable tabs in stack/container modes.
 *
 * SlotsPanel is gallery-specific; ElemSmartGallery.getPanels() filters it
 * out when mode !== 'gallery'.
 */
export default [
    () => import('./SettingsPanel.vue'),   // Настройки (mode + all mode-specific)
    () => import('./SlotsPanel.vue'),       // Слоты с условиями (gallery mode only)
    () => import('./AppearancePanel.vue'),  // Оформление
    () => import('./DesignerPanel.vue')     // Я дизайнер
];
