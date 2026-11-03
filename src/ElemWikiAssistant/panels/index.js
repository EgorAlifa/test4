/**
 * Панели ElemWikiAssistant
 * Порядок: Настройки → Оформление → Я дизайнер → Кнопка
 */
export default [
    () => import('./SettingsPanel.vue'), // «Настройки»
    () => import('./AppearancePanel.vue'), // «Оформление»
    () => import('./DesignerPanel.vue'), // «Я дизайнер»
    () => import('./FabPanel.vue') // «Кнопка» — вид плавающей кнопки с живым превью
];
