/* Render data: UI control settings, options lists, CSS class and styles map */

import {
    GaugeRadiuses,
    GaugeFormatOptions,
    GaugeSeparatorOptions,
    GaugeElevations,
    GaugeSegmentStyles,
    GaugeStyles,
    GaugeThemes,
    AnimationEasingTypes,
    NeedleBandStyles,
    DefaultNeedleBands,
    defaultAnimationDuration,
    defaultAnimationDelay
} from './constants';

export const options = {
    radiuses: GaugeRadiuses,
    formats: GaugeFormatOptions,
    separators: GaugeSeparatorOptions,
    elevation: GaugeElevations,
    segmentStyles: GaugeSegmentStyles,
    gaugeStyles: GaugeStyles,
    themes: GaugeThemes,
    animationEasings: AnimationEasingTypes,
    needleBandStyles: NeedleBandStyles
};

const defaultNumberOfSegments = 14;
const defaultNumberOfDots = 16;
const defaultGaugePadding = 20;
const defaultSegmentGap = 2;
const defaultValueFontSize = 4;
const defaultValueFontUnit = 'rem';
const defaultTitleFontSize = 3;
const defaultTitleFontUnit = 'rem';
const defaultContainerPaddingSize = 16;
const defaultTextVerticalPosition = 70;

export const defaults = {
    title: '',
    gaugeStyle: 'halfCircle',
    theme: 'dark',
    radius: 'lg',
    activeColor: '#ef4444',
    inactiveColor: '#64748b',
    format: '1%',
    separator: '1',
    prefix: '',
    postfix: '',
    elevation: 0,
    showBorder: false,
    segmentStyle: 'rounded',
    numberOfSegments: defaultNumberOfSegments,
    numberOfDots: defaultNumberOfDots,
    gaugePadding: defaultGaugePadding,
    segmentGap: defaultSegmentGap,
    showTitle: true,
    showValue: true,
    valueFontColor: '#ffffff',
    valueFontSize: { size: defaultValueFontSize, unit: defaultValueFontUnit },
    valueFontFamily: 'Inter, system-ui, sans-serif',
    titleFontColor: '#ffffff',
    titleFontSize: { size: defaultTitleFontSize, unit: defaultTitleFontUnit },
    titleFontFamily: 'Inter, system-ui, sans-serif',
    containerPadding: { size: defaultContainerPaddingSize, unit: 'px' },
    animation: true,
    animationEasing: 'ease-out',
    animationDuration: defaultAnimationDuration,
    animationDelay: defaultAnimationDelay,
    textVerticalPosition: defaultTextVerticalPosition,
    // ── Needle (tachometer) gauge ────────────────────────────────
    needleBands: DefaultNeedleBands,
    needleBandStyle: 'round',
    needleBandWidth: 1.6,
    needleColor: '#0f172a',
    needlePivotColor: '#0f172a',
    showTicks: true,
    numberOfTicks: 9,
    tickColor: '#94a3b8',
    needleScaleMax: 1,
    customStyles: {
        container: '',
        svg: '',
        segment: '',
        dot: '',
        arc: '',
        tick: '',
        band: '',
        needle: '',
        valueText: '',
        titleText: '',
        textContainer: '',
        loadingState: '',
        errorState: ''
    }
};

const elevationMedium = 2;
const elevationLarge = 3;

export const uiMaps = {
    radiusToClass: {
        none: 'rounded-none',
        small: 'rounded-md',
        medium: 'rounded-xl',
        large: 'rounded-2xl'
    },
    elevationToClass: {
        0: 'shadow-none',
        1: 'shadow-sm',
        [elevationMedium]: 'shadow-md',
        [elevationLarge]: 'shadow-lg'
    }
};

export const schemeToClasses = (scheme) => ({
    base: `bg-white dark:bg-zinc-900`,
    border: 'border',
    textPrimary: `text-zinc-900 dark:text-zinc-100`,
    textMuted: `text-zinc-500 dark:text-zinc-400`
});

// Color mappings for gauge segments
export const colorPrimary = {
    emerald: '#059669',
    red: '#dc2626',
    blue: '#2563eb',
    violet: '#7c3aed',
    pink: '#db2777',
    orange: '#d97706',
    zinc: '#52525b'
};

export const colorLight = {
    emerald: '#d1fae5',
    red: '#fee2e2',
    blue: '#dbeafe',
    violet: '#ede9fe',
    pink: '#fce7f3',
    orange: '#ffedd5',
    zinc: '#f4f4f5'
};

export const colorDark = {
    emerald: '#047857',
    red: '#b91c1c',
    blue: '#1d4ed8',
    violet: '#6d28d9',
    pink: '#be185d',
    orange: '#c2410c',
    zinc: '#3f3f46'
};

