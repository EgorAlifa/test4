import { resolveValueWithUnits } from './utils';
import { SizeUnits } from '@goodt-wcore/panels';

export const cssVars = {
    'title_font-family': 'fontTitle',
    'title_font-weight': 'titleFontWeight',
    'title_font-size': ({ sizeTitle, sizeUnitTitle }) =>
        typeof sizeTitle === 'string' ? sizeTitle : resolveValueWithUnits(sizeTitle, sizeUnitTitle),
    title_color: 'colorTitle',
    'kpi-data_font-family': 'fontMetric',
    'metric_font-weight': 'metricFontWeight',
    'prefix-icon_color': 'prefixIconColor',
    'prefix-icon_font-size': ({ prefixIconFontSize: fontSize, prefixIconFontSizeUnit: unit }) =>
        resolveValueWithUnits(fontSize, unit),
    prefix_color: 'prefixColor',
    'prefix_font-family': 'prefixFont',
    'prefix_font-weight': 'prefixFontWeight',
    'prefix_font-size': 'prefixFontSize',
    'prefix_margin-right': 'prefixRightMargin',
    postfix_color: 'postfixColor',
    'postfix_font-family': 'postfixFont',
    'postfix_font-size': ({ postfixFontSize: fontSize, postfixFontSizeUnit: unit }) =>
        resolveValueWithUnits(fontSize, unit),
    'postfix_font-weight': 'postfixFontWeight',
    'postfix_margin-left': 'postfixLeftMargin',
    'bench-prefix_color': 'benchPrefixColor',
    'bench-prefix_font-family': 'benchPrefixFont',
    'bench-prefix_font-size': 'benchPrefixFontSize',
    'bench-prefix_font-weight': 'benchPrefixFontWeight',
    'bench-prefix_margin-right': 'benchPrefixRightMargin',
    'bench-postfix_color': 'benchPostfixColor',
    'bench-postfix_font-family': 'benchPostfixFont',
    'bench-postfix_font-size': 'benchPostfixFontSize',
    'bench-postfix_font-weight': 'benchPostfixFontWeight',
    'bench-postfix_margin-left': 'benchPostfixLeftMargin',
    'bench-value_font-weight': 'benchmarkFontWeight',
    'indicator-metric-icon-up_font-size': 'indicatorMetricIcon.iconUp.fontSize',
    'indicator-metric-icon-up_color': 'indicatorMetricIcon.iconUp.color',
    'indicator-metric-icon--by-rule_font-size': 'metricIconRules.fontSize',
    'indicator-metric-icon-down_font-size': 'indicatorMetricIcon.iconDown.fontSize',
    'indicator-metric-icon-down_color': 'indicatorMetricIcon.iconDown.color',
    'indicator-benchmark-icon-up_font-size': 'indicatorBenchmarkIcon.iconUp.fontSize',
    'indicator-benchmark-icon-up_color': 'indicatorBenchmarkIcon.iconUp.color',
    'indicator-benchmark-icon-down_font-size': 'indicatorBenchmarkIcon.iconDown.fontSize',
    'indicator-benchmark-icon-down_color': 'indicatorBenchmarkIcon.iconDown.color',
    'indicator-benchmark-icon_flex-direction': 'indicatorBenchmarkIcon.direction',
    'indicator-benchmark-icon--by-rule_font-size': 'benchmarkIconRules.fontSize',

    'kpi-hint-icon_color': 'colorHint',
    'kpi-hint-icon_font-size': ({ sizeIcon, sizeUnitIcon }) => resolveValueWithUnits(sizeIcon, sizeUnitIcon),
    'number-animation_height': ({ sizeMetric, sizeUnitMetric }) => resolveValueWithUnits(sizeMetric, sizeUnitMetric)
};
