/**
 * Панели ElemWikiAssistant
 * Порядок: Настройки → Оформление → Я дизайнер
 */
export default [
    () => import('./SettingsPanel.vue'), // «Настройки»
    () => import('./AppearancePanel.vue'), // «Оформление»
    () => import('./DesignerPanel.vue') // «Я дизайнер»
];
