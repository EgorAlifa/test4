/* place render data: texts, ui control settings, options lists, css class and styles map here */

import {
    KPI_VARIANTS,
    KPI_SIZES,
    KPI_RADIUS,
    KPI_VALUE_ALIGN,
    KPI_ICONS,
    KPI_COLOR_SCHEMES,
    KPI_UNITS,
    KPI_DECIMALS_OPTIONS,
    KPI_DELTA_MODES,
    KPI_ELEVATION,
    KPI_DEFAULT_GOOD_IS_POSITIVE
} from './constants';

export const options = {
    variants: KPI_VARIANTS,
    sizes: KPI_SIZES,
    radiuses: KPI_RADIUS,
    aligns: KPI_VALUE_ALIGN,
    icons: KPI_ICONS,
    colorSchemes: KPI_COLOR_SCHEMES,
    units: KPI_UNITS,
    decimals: KPI_DECIMALS_OPTIONS,
    deltaModes: KPI_DELTA_MODES,
    elevation: KPI_ELEVATION
};

export const defaults = {
    title: 'Nominal Balance',
    subTitle: '',
    variant: 'default',
    size: 'md',
    radius: 'xl',
    align: 'left',
    icon: 'currency',
    colorScheme: 'zinc',
    showDelta: true,
    deltaMode: 'percent',
    decimals: 2,
    goodIsPositive: KPI_DEFAULT_GOOD_IS_POSITIVE,
    elevation: 2,
    showSparkline: true,
    showBadge: false,
    badgeText: '',
    unit: 'USD',
    sparklineScheme: 'emerald',
    iconScheme: 'pink',
    sparklineFollowDelta: true,
    sparklineWidth: 1.25,
    sparklineHeight: 36,
    sparklineFillOpacity: 0.15,
    useSparklineFill: true,
    iconUrl: '',
    titleFontColor: '#0a0a0a',
    titleFontSize: '1rem',
    titleFontWeight: '600',
    titleFontFamily: 'inherit',
    metricFontColor: '#0a0a0a',
    metricFontSize: '1.25rem',
    metricFontWeight: '700',
    metricFontFamily: 'inherit',
    showTitle: true,
    showIcon: true,
    showUnit: true,
    showBorder: true
};

export const uiMaps = {
    sizeToText: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg'
    },
    sizeToValue: {
        sm: 'text-2xl',
        md: 'text-3xl',
        lg: 'text-4xl'
    },
    sizeToDelta: {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base'
    },
    radiusToClass: {
        none: 'rounded-none',
        sm: 'rounded-md',
        md: 'rounded-xl',
        lg: 'rounded-2xl',
        full: 'rounded-full'
    },
    alignToClass: {
        left: 'text-left items-start',
        center: 'text-center items-center',
        right: 'text-right items-end'
    },
    elevationToClass: {
        0: 'shadow-none',
        1: 'shadow-sm',
        2: 'shadow-md',
        3: 'shadow-lg'
    }
};

export const schemeToClasses = (scheme) => ({
    base: `bg-white dark:bg-zinc-900`,
    border: 'border',
    textPrimary: `text-zinc-900 dark:text-zinc-100`,
    textMuted: `text-zinc-500 dark:text-zinc-400`,
    accent: 'text-zinc-600 dark:text-zinc-400',
    positive: `text-emerald-600 dark:text-emerald-400`,
    negative: `text-red-600 dark:text-red-400`,
});

// Tailwind JIT безопасные маппинги цветов (без динамических строк)
export const colorText500 = {
    emerald: 'text-emerald-500 dark:text-emerald-400',
    red: 'text-red-500 dark:text-red-400',
    blue: 'text-blue-500 dark:text-blue-400',
    violet: 'text-violet-500 dark:text-violet-400',
    pink: 'text-pink-500 dark:text-pink-400',
    orange: 'text-orange-500 dark:text-orange-400',
    zinc: 'text-zinc-500 dark:text-zinc-400'
};

export const colorText600 = {
    emerald: 'text-emerald-600 dark:text-emerald-400',
    red: 'text-red-600 dark:text-red-400',
    blue: 'text-blue-600 dark:text-blue-400',
    violet: 'text-violet-600 dark:text-violet-400',
    pink: 'text-pink-600 dark:text-pink-400',
    orange: 'text-orange-600 dark:text-orange-400',
    zinc: 'text-zinc-600 dark:text-zinc-400'
};

export const colorBgSoft = {
    emerald: 'bg-emerald-50 dark:bg-emerald-950/40',
    red: 'bg-red-50 dark:bg-red-950/40',
    blue: 'bg-blue-50 dark:bg-blue-950/40',
    violet: 'bg-violet-50 dark:bg-violet-950/40',
    pink: 'bg-pink-50 dark:bg-pink-950/40',
    orange: 'bg-orange-50 dark:bg-orange-950/40',
    zinc: 'bg-zinc-50 dark:bg-zinc-900'
};

export const colorBorderSoft = {
    emerald: 'border border-emerald-200/60 dark:border-emerald-900/30',
    red: 'border border-red-200/60 dark:border-red-900/30',
    blue: 'border border-blue-200/60 dark:border-blue-900/30',
    violet: 'border border-violet-200/60 dark:border-violet-900/30',
    pink: 'border border-pink-200/60 dark:border-pink-900/30',
    orange: 'border border-orange-200/60 dark:border-orange-900/30',
    zinc: 'border border-zinc-200/60 dark:border-zinc-900/30'
};

// Hex карты на случай отсутствия Tailwind
export const colorHex500 = {
    emerald: '#10b981',
    red: '#ef4444',
    blue: '#3b82f6',
    violet: '#8b5cf6',
    pink: '#ec4899',
    orange: '#f59e0b',
    zinc: '#6b7280'
};

export const colorHex600 = {
    emerald: '#059669',
    red: '#dc2626',
    blue: '#2563eb',
    violet: '#7c3aed',
    pink: '#db2777',
    orange: '#d97706',
    zinc: '#52525b'
};

export const colorBgSoftHex = {
    emerald: '#ecfdf5',
    red: '#fef2f2',
    blue: '#eff6ff',
    violet: '#f5f3ff',
    pink: '#fdf2f8',
    orange: '#fff7ed',
    zinc: '#f4f4f5'
};
