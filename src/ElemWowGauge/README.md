# ElemWoWGauge Widget

A customizable gauge widget inspired by modern dashboard designs. Perfect for displaying KPIs, goals, and progress metrics with automatic percentage calculation.

## Features

- **Multiple gauge styles**: 
  - **Half-circle gauge** with configurable segments (inspired by World of Warcraft UI)
  - **Ring gauge** with dots and progress arc (inspired by modern dashboards)
  - **Needle gauge** - classic tachometer/speedometer dial: tick marks, configurable
    colored threshold bands (e.g. red up to the target, green past it) and a needle
    pointing at the current value/benchmark ratio. Modeled after the Power BI
    "Tachometer" custom visual.
- **Dual metric support**: Value metric ÷ Benchmark metric = Automatic percentage
- **Auto-fit design**: Responsive sizing that adapts to container
- **Fully customizable appearance**: colors, fonts, and styling with color pickers
- **Multiple value formats**: percent, number, currency
- **Centered value display**: Value positioned above label for optimal readability
- **Floating option panels**: Modern UI pattern similar to ElemMultiSpline
- **Dark mode support**
- **Smooth animations** and transitions
- **Dataset integration** via Insight platform

## Usage

1. Add the widget to your dashboard
2. Configure the dataset and select two metrics:
   - **Value Metric**: The numerator (e.g., current sales)
   - **Benchmark Metric**: The denominator (e.g., sales goal)
3. The widget automatically calculates: `value ÷ benchmark` and displays as percentage
4. Customize appearance using the floating option panels

## Configuration Options

The widget uses a multi-panel configuration system similar to ElemMultiSpline:

### Panel 1: Метрики (Metrics)

**Метрики (Metrics)**
- **Value Metric**: The numeric field to use as the numerator
- **Benchmark Metric**: The numeric field to use as the denominator

### Panel 2: Настройки виджета (Widget Settings)

**Стиль датчика (Gauge Style)**
- **Half-circle (Полукруг)**: Classic half-circle gauge with segments
- **Ring (Круг с точками)**: Full circle gauge with dots and progress arc
- **Needle (Стрелка)**: Tachometer-style dial - ticks, colored threshold bands, needle

**Тема (Theme)**
- **Light**: White background with dark text (auto-switches font colors)
- **Dark**: Dark blue background (#3b4d61) with white text matching CodePen example
- Font colors automatically adapt when switching themes

**Значение (Value)** - Checkbox with Floating Panel
- **Show Value**: Enable/disable checkbox
- **Settings** (in floating panel):
  - Format: 1000, 1000,1, 1000,12, 1000,123, 12%, 12,3%, 12,34%, 12,345%
  - Separator: 10000, 10 000, 10.000, 10,000
  - Prefix: Text before value
  - Postfix: Text after value
  - Font settings (ElemMultiSpline pattern):
    - Color picker (Цвет шрифта)
    - Font family selector (Шрифт) with autocomplete
    - Font size with units (Размер шрифта) - px, rem, em, %

**Заголовок (Title/Legend)** - Checkbox with Floating Panel
- **Show Title**: Enable/disable checkbox (default: ON)
- **Title Text**: Auto-set to first metric name, editable in floating panel
- **Font Settings** (in floating panel, ElemMultiSpline pattern):
  - Color picker (Цвет шрифта)
  - Font family selector (Шрифт) with autocomplete
  - Font size with units (Размер шрифта) - px, rem, em, %

**Дизайн датчика (Gauge Design)**
- **Active Color**: Color picker for filled segments/arc (default: #ef4444 red/coral)
- **Inactive Color**: Color picker for unfilled segments/dots (default: #64748b slate gray)

**Half-circle specific settings:**
- **Segment Style**: Rounded or square corners
- **Number of Segments**: Total gauge segments (default: 14)

**Ring gauge specific settings:**
- **Number of Dots**: Total dots around the circle (default: 16)

**Needle gauge specific settings:**
- **Scale End Value**: what percent (as a fraction, 1 = 100%) maps to the right end of the
  dial - set above 1 to leave headroom on the dial for values that overshoot the benchmark
  (default: 1)
- **Show Ticks** / **Number of Ticks** / **Tick Color**: dial tick marks (default: on, 9, `#94a3b8`)
- **Color Zones**: a list of `{ up to fraction, color }` bands, each starting where the
  previous one ends (default: `0–0.9` red, `0.9–1` green) - e.g. red below target, green
  at/above it
- **Band Style**: rounded or flat band ends
- **Band Width**, **Needle Color**, **Needle Pivot Color**

**Оформление (Appearance)**
- **Border Radius**: none, sm, md, lg
- **Elevation**: Shadow depth (0-3, default: 0)
- **Show Border**: Toggle container border (default: OFF)
- **Container Padding**: Padding with units - px, rem, em, % (default: 16px)
- **Text Vertical Position**: (Half-circle and needle gauges) Position of text relative to
  gauge (default: 70%)

## Example

A typical configuration for a "Sales Goals" gauge:
- Gauge Style: Half-circle WoW
- Theme: Dark
- Value Metric: `current_sales`
- Benchmark Metric: `sales_target`
- Title: Auto-set to "current_sales" (editable)
- Format: 1% (12,3%)
- Separator: 1 (10 000)
- Prefix: (empty)
- Postfix: (empty)
- Active Color: #ef4444 (red/coral)
- Inactive Color: #64748b (slate gray)
- Number of Segments: 14
- Container Padding: 16px (with unit selector)

If `current_sales = 67200` and `sales_target = 100000`, the widget will automatically calculate and display **67,2%** with a beautiful half-circle gauge showing progress aligned to the bottom baseline.

## Design Philosophy

- **Auto-sizing**: Widget automatically fits its container, no manual size selection needed
- **Two metrics required**: Enforces best practice of comparing value against benchmark
- **Automatic calculation**: No manual percentage entry—calculated from real data
- **Auto-naming**: Title automatically set to metric name from dataset
- **Bottom-aligned layout**: Value and title aligned to the bottom line of the gauge
- **Responsive fonts**: Uses clamp() for scalable typography matching proportions
- **Theme support**: Dark theme (default) matching CodePen inspiration, plus light theme
- **Auto font colors**: Font colors automatically switch when changing themes
- **Modern UI**: Floating panels like ElemMultiSpline for advanced options
- **Checkbox controls**: Main features (Value, Title) as checkboxes with detailed floating panels
- **Color pickers**: All colors use color pickers instead of predefined schemes
- **Simplified**: Clean, minimal design with sensible defaults
- **Number formatting**: Uses same pattern as ElemMultiSpline with format, separator, prefix, postfix
- **Font settings**: Standard ElemMultiSpline pattern with color picker, font family autocomplete, and unit-based size inputs

**Анимация (Animation)** - Checkbox with Floating Panel
- **Enable Animation**: Smooth transitions for value changes
- **Animation Settings** (in floating panel):
  - **Easing Type**: linear, ease, ease-in, ease-out, ease-in-out
  - **Duration**: Animation length in milliseconds (default: 1000ms)
  - **Delay**: Animation start delay in milliseconds (default: 0ms)

## Gauge Styles

### Half-circle Gauge
A classic half-circle gauge with configurable segments positioned at the bottom. The value and title are positioned along the diameter baseline. Inspired by World of Warcraft UI design.

**Best for**: Dashboard KPIs, progress tracking, goal completion metrics

### Ring Gauge
A full circle gauge with dots around the perimeter and a colored arc showing progress. The value and title are centered within the circle. Inspired by modern analytics dashboards.

**Best for**: Conversion rates, percentage metrics, compact space layouts

### Needle Gauge
A classic automotive-style dial: tick marks around a 180° arc, one or more colored
threshold bands (e.g. red for "below target", green for "at/above target"), and a
needle that rotates to point at the current value/benchmark ratio - 0% points left,
100% (or whatever `needleScaleMax` is set to) points right, sweeping through the top.
The value and title sit on the diameter baseline, same layout as the half-circle gauge.
Modeled after the Power BI "Tachometer" custom visual.

**Best for**: Single KPIs against a target/threshold where "which side of the line" matters
more than the exact number - SLA compliance, quality yield, utilization rate.

## Roadmap

Future gauge styles may include:
- Arc gauge variants
- Linear/horizontal gauge
- Thermometer gauge
- And more...
