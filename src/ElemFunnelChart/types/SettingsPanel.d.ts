// TypeScript определения для панели настроек funnel виджета

export interface SettingsPanelProps {
    metric: string | null;
    dimension: string | null;
    drilldownName: string | null;
    orientation: string;
    sort: string;
    labelPosition: string;
    showPercentage: boolean;
    funnelWidth: string;
    funnelHeight: string;
    gap: number;
    colorScheme: string;
    showTitle: boolean;
    title: string;
    showLegend: boolean;
    legendPosition: string;
}

export interface SelectOption {
    label: string;
    value: string | number | null;
}

export interface FieldMetadata {
    name: string;
    label: string;
    type: string;
    required?: boolean;
}

export interface ValidationError {
    field: string;
    message: string;
}

export interface PreviewData {
    selectedMetricName: string;
    selectedDimensionName: string;
    orientationLabel: string;
    sortLabel: string;
    colorSchemeLabel: string;
    hasData: boolean;
} 