/**
 * ElemText Panels — VIBE 2.0 (Figma Parity)
 *
 * Six panels for comprehensive text widget configuration:
 * 1. ContentPanel - HTML content, design system, presets
 * 2. AppearancePanel - Opacity, corner radius, fills, strokes (Figma-like UI)
 * 3. TypographyPanel - Font settings, horizontal + vertical alignment, truncation
 * 4. EffectsPanel - Shadows (drop/inner), blur effects (layer/backdrop)
 * 5. DesignerPanel - Advanced styling (colors, spacing, borders)
 * 6. VariablesPanel - Variable bindings for cross-widget communication (VIBE 2.0)
 */

const ContentPanelAsync = () => import('./ContentPanel.vue');
const AppearancePanelAsync = () => import('./AppearancePanel.vue');
const TypographyPanelAsync = () => import('./TypographyPanel.vue');
const EffectsPanelAsync = () => import('./EffectsPanel.vue');
const DesignerPanelAsync = () => import('./DesignerPanel.vue');
const VariablesPanelAsync = () => import('./VariablesPanel.vue');

export default [
    ContentPanelAsync,
    AppearancePanelAsync,
    TypographyPanelAsync,
    EffectsPanelAsync,
    DesignerPanelAsync,
    VariablesPanelAsync
];
