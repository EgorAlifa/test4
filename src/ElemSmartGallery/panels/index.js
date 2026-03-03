/**
 * ElemSmartGallery Panels
 * Standard order: Настройки → Слоты → Сетка → Измерения/Метрики → Оформление → Я дизайнер
 */
export default [
    () => import('./SettingsPanel.vue'),    // Настройки (режим + mode-specific)
    () => import('./SlotsPanel.vue'),        // Слоты с условиями (gallery mode)
    () => import('./GridPanel.vue'),         // Сетка (gallery mode)
    () => import('./MetricsPanel.vue'),      // Измерения/Метрики (gallery mode)
    () => import('./AppearancePanel.vue'),   // Оформление
    () => import('./DesignerPanel.vue')      // Я дизайнер
];
