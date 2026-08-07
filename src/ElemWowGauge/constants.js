/* Gauge widget constant values and configuration options */

export const GaugeSegments = 14; // Number of segments in the gauge
export const GaugeAngle = 180; // Half-circle angle

export const GaugeStyles = [
    { label: 'Полукруг', value: 'halfCircle' },
    { label: 'Круг с точками', value: 'ring' },
    { label: 'Стрелка (спидометр)', value: 'needle' },
];

// Needle (tachometer-style) gauge - classic dial: light tick marks around a
// 180° arc, a few colored threshold bands (e.g. red up to the target, green
// past it), and a needle pointing at the current value. Modeled after the
// Power BI "Tachometer" custom visual referenced by the source report.
export const NeedleBandStyles = [
    { label: 'Закругленные концы', value: 'round' },
    { label: 'Прямые концы', value: 'butt' },
];

export const DefaultNeedleBands = [
    { to: 0.9, color: '#ef4444' },
    { to: 1, color: '#22c55e' }
];

export const DefaultGaugeStyle = 'halfCircle';

export const GaugeRadiuses = [
    { label: 'Нет', value: 'none' },
    { label: 'Малый', value: 'sm' },
    { label: 'Средний', value: 'md' },
    { label: 'Большой', value: 'lg' },
];

export const GaugeFormatOptions = [
    { value: '0', label: '1000' },
    { value: '1', label: '1000,1' },
    { value: '2', label: '1000,12' },
    { value: '3', label: '1000,123' },
    { value: '0%', label: '12%' },
    { value: '1%', label: '12,3%' },
    { value: '2%', label: '12,34%' },
    { value: '3%', label: '12,345%' }
];

export const GaugeSeparatorOptions = [
    { value: '0', label: '10000' },
    { value: '1', label: '10 000' },
    { value: '2', label: '10.000' },
    { value: '3', label: '10,000' }
];

const ElevationTwo = 2;
const ElevationThree = 3;

export const GaugeElevations = [
    { label: 'Нет', value: 0 },
    { label: 'Малая', value: 1 },
    { label: 'Средняя', value: ElevationTwo },
    { label: 'Большая', value: ElevationThree },
];

export const GaugeSegmentStyles = [
    { label: 'Закругленные', value: 'rounded' },
    { label: 'Квадратные', value: 'square' },
];

export const GaugeThemes = [
    { label: 'Светлая', value: 'light' },
    { label: 'Темная', value: 'dark' },
];

export const AnimationEasingTypes = [
    { value: 'linear', label: 'Linear' },
    { value: 'ease', label: 'Ease' },
    { value: 'ease-in', label: 'Ease In' },
    { value: 'ease-out', label: 'Ease Out' },
    { value: 'ease-in-out', label: 'Ease In Out' }
];

const defaultAnimationDuration = 1000;
const defaultAnimationDelay = 0;

export { defaultAnimationDuration, defaultAnimationDelay };

