/**
 * @file css-vars.js
 * @description CSS variables for ElemWowMap theming
 */

const cssVars = ({ palette, typography }) => ({
    // Map background
    mapBackgroundColor: palette.background.default,
    
    // Controls panel
    controlsPanelBg: palette.background.paper,
    controlsPanelBorder: palette.divider,
    controlsPanelShadow: palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.1)',
    
    // Legend
    legendBg: palette.background.paper,
    legendTextColor: typography.body.color,
    legendBorder: palette.divider,
    
    // Buttons
    primaryButtonBg: palette.primary.main,
    primaryButtonColor: palette.primary.contrastText,
    secondaryButtonBg: palette.secondary.main,
    secondaryButtonColor: palette.secondary.contrastText,
    
    // Text colors
    headingColor: typography.heading.color,
    bodyColor: typography.body.color,
    captionColor: typography.caption.color,
    
    // Chart
    chartBg: palette.background.paper,
    chartBorder: palette.divider,
    chartAxisColor: typography.caption.color,
    
    // Filter panel
    filterPanelBg: palette.background.paper,
    filterPanelBorder: palette.divider,
    
    // Loading
    loadingOverlayBg: palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
    spinnerColor: palette.primary.main
});

export { cssVars };

