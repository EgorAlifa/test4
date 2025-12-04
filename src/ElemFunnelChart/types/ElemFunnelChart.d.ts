// TypeScript определения для ElemFunnelChart виджета

export interface FunnelDataItem {
    name: string;
    value: number;
}

export interface FunnelChartOptions {
    data: FunnelDataItem[];
    orientation?: 'vertical' | 'horizontal';
    labelPosition?: 'outside' | 'inside' | 'left' | 'right' | 'top' | 'bottom' | 'center';
    showPercentage?: boolean;
    funnelWidth?: string;
    funnelHeight?: string;
    gap?: number;
    colorScheme?: string;
    showTitle?: boolean;
    title?: string;
    showLegend?: boolean;
    legendPosition?: 'left' | 'right' | 'top' | 'bottom';
}

export interface ElemFunnelChartProps {
    // Настройки данных
    metric: string | null;
    dimension: string | null;
    drilldownName: string | null;
    
    // Настройки отображения
    orientation: 'vertical' | 'horizontal';
    sort: 'ascending' | 'descending' | 'none';
    labelPosition: 'outside' | 'inside' | 'left' | 'right' | 'top' | 'bottom' | 'center';
    showPercentage: boolean;
    
    // Размеры и отступы
    funnelWidth: string;
    funnelHeight: string;
    gap: number;
    
    // Цветовая схема
    colorScheme: string;
    
    // Настройки заголовка
    showTitle: boolean;
    title: string;
    
    // Настройки легенды
    showLegend: boolean;
    legendPosition: 'left' | 'right' | 'top' | 'bottom';
}

export interface DrilldownState {
    canPop: boolean;
    canPush: boolean;
    name?: string;
}

export interface SelectedSegment {
    name: string;
    value: number;
}

// Интерфейс для экземпляра ECharts
export interface EChartsInstance {
    setOption(option: any, notMerge?: boolean, lazyUpdate?: boolean): void;
    on(eventName: string, handler: Function): void;
    off(eventName: string, handler?: Function): void;
    dispose(): void;
    resize(opts?: { width?: number | string; height?: number | string }): void;
}

// Интерфейс для параметров клика ECharts
export interface EChartsClickParams {
    name: string;
    value: number;
    percent: number;
    dataIndex: number;
    seriesIndex: number;
    seriesName: string;
    color: string;
}

export interface ColorPalette {
    [key: string]: string[];
}

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}

export interface RecommendationResult {
    [key: string]: any;
    reason?: string;
} 