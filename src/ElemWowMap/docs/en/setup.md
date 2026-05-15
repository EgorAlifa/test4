# ElemWowMap Setup Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Prerequisites](#prerequisites)
3. [Widget Registration](#widget-registration)
4. [Configuration Files](#configuration-files)
5. [Visualization Modes](#visualization-modes)
6. [Common Setup Scenarios](#common-setup-scenarios)
7. [Troubleshooting](#troubleshooting)

## Introduction

ElemWowMap is an interactive map widget for the Insight platform that supports multiple visualization modes including heatmaps, point markers, choropleth maps, and time-based animations. This guide will help you set up and configure the ElemWowMap widget in your Insight environment.

## Prerequisites

Before setting up ElemWowMap, ensure you have:

- **Node.js** version 18 or higher
- **npm** version 9 or higher
- Access to the Insight platform
- Basic understanding of JSON configuration files
- Dataset with geographic data (latitude/longitude or region codes)

## Widget Registration

To make ElemWowMap available in the Insight editor, you need to register it in the configuration files.

### Step 1: Platform Configuration

First, configure the platform to recognize your widget package. Edit `public/config/platform/widgets.local.json`:

```json
{
  "widgets": {
    "packages": {
      "vendor": {
        "url": "./widgets.local/vendor"
      }
    }
  }
}
```

### Step 2: Package Configuration

Register ElemWowMap in `public/config/package/widgets.local.json`:

```json
{
  "elements": [
    {
      "type": "vendor::ElemWowMap",
      "name": "Map Widget",
      "icon": "mdi-map"
    }
  ],
  "tools": {
    "page": [
      {
        "name": "Visualizations",
        "elements": [
          "vendor::ElemWowMap"
        ]
      }
    ],
    "template": [
      {
        "name": "Visualizations",
        "elements": [
          "vendor::ElemWowMap"
        ]
      }
    ]
  }
}
```

### Configuration Fields Explained

- **`type`**: The widget identifier `vendor::ElemWowMap`
- **`name`**: Display name shown in the widget palette
- **`icon`**: Material Design Icons icon name (e.g., `mdi-map`)
- **`tools.page`**: Widgets available when editing pages
- **`tools.template`**: Widgets available when editing templates

## Configuration Files

### Widget Descriptor

The ElemWowMap widget has a `descriptor.js` file that defines:

- **Props**: Configurable properties (field mappings, colors, settings)
- **Dataset Contract**: Required dataset fields and operations
- **Panels**: Configuration panels available in the editor
- **CSS Variables**: Theme customization options

Key descriptor properties include:

```javascript
export const descriptor = () => ({
    props: {
        // Field mappings
        latitudeField: {
            type: String,
            default: 'latitude',
            label: 'Latitude Field'
        },
        longitudeField: {
            type: String,
            default: 'longitude',
            label: 'Longitude Field'
        },
        valueField: {
            type: String,
            default: 'value',
            label: 'Value Field'
        },
        // ... more props
    },
    dataset: {
        vars: {
            dimension: { operation: StoreOperation.ALL }
        }
    }
});
```

### Panel Configuration

ElemWowMap exposes several configuration panels:

- **Dataset Panel**: Select and configure data sources, map fields
- **Visualization Panel**: Choose visualization mode (heatmap, dots, choropleth)
- **Heatmap Panel**: Configure heatmap radius, blur, intensity
- **Choropleth Panel**: Configure color schemes, aggregation methods
- **Animation Panel**: Configure time-based animations
- **Filter Panel**: Set up year and category filters
- **Color Panel**: Customize category colors
- **Custom Styles Panel**: Advanced CSS customization

## Visualization Modes

### Heatmap Mode

Visualizes data density using color intensity:

**Configuration:**
- **Radius**: Size of heat points (default: 25)
- **Blur**: Blur amount (default: 15)
- **Min Opacity**: Minimum transparency (0-1)
- **Max Intensity**: Maximum color intensity
- **Min Intensity**: Minimum color intensity

**Use Cases:**
- Population density
- Event frequency
- Activity hotspots

### Dots Mode

Displays individual data points as markers:

**Configuration:**
- **Dot Radius**: Size of dots (default: 5)
- **Dot Opacity**: Transparency (0-1)
- **Dot Size**: Scale factor
- **Color Scheme**: Color mapping for categories
- **Clustering**: Enable/disable marker clustering

**Use Cases:**
- Individual locations
- Point-of-interest markers
- Event locations

### Choropleth Mode

Colors regions based on aggregated data:

**Configuration:**
- **SVG Map File**: Map file to use (e.g., `ru.svg`)
- **Region Code Field**: Field containing region identifiers (RU-XXX format)
- **Color Scheme**: Color palette (e.g., YlOrRd, Blues, Greens)
- **Color Steps**: Number of color gradations
- **Aggregation Method**: How to aggregate values (sum, avg, max, min)
- **Missing Data Color**: Color for regions without data

**Use Cases:**
- Regional statistics
- Administrative data
- Geographic comparisons

### Animation Mode

Time-based visualization with particle effects:

**Configuration:**
- **Date Field**: Field containing dates/timestamps
- **Animation Speed**: Playback speed
- **Auto Play**: Automatically start animation
- **Fade Time**: How long particles remain visible (in days)
- **Particle Glow Duration**: Glow effect duration (ms)

**Use Cases:**
- Temporal data analysis
- Event progression
- Time-series visualization

## Common Setup Scenarios

### Scenario 1: Basic Heatmap Setup

1. **Register the widget** in `widgets.local.json`:
```json
{
  "type": "vendor::ElemWowMap",
  "name": "Map",
  "icon": "mdi-map"
}
```

2. **Configure dataset fields** in the Dataset Panel:
   - Select latitude field (e.g., `lat`)
   - Select longitude field (e.g., `lng`)
   - Select value field for aggregation (e.g., `count`)

3. **Choose Heatmap mode** in Visualization Panel

4. **Configure heatmap settings**:
   - Set radius: 25-50
   - Set blur: 15-25
   - Adjust intensity range

5. **Customize appearance**:
   - Set map provider (OpenStreetMap default)
   - Configure initial zoom level
   - Enable/disable controls

### Scenario 2: Choropleth Map with Regions

1. **Prepare your dataset**:
   - Include region code field (format: `RU-XXX`)
   - Include value field for aggregation
   - Optionally include region name field

2. **Configure fields**:
   - Set `regionCodeField` to your region code column
   - Set `valueField` to your metric column
   - Set `svgMapFile` to `ru.svg` (or your custom map)

3. **Choose Choropleth mode**

4. **Configure choropleth**:
   - Select color scheme (e.g., YlOrRd)
   - Set color steps (5-7 recommended)
   - Choose aggregation method (sum, avg, etc.)
   - Set missing data color

5. **Enable drill-down** (optional):
   - Set `enableDrillDown` to true
   - Configure drill-down start level

### Scenario 3: Animated Time Series

1. **Prepare dataset** with date field

2. **Configure fields**:
   - Set latitude and longitude fields
   - Set date field for animation
   - Set value field

3. **Choose Dots or Heatmap mode**

4. **Configure animation**:
   - Enable `autoPlay`
   - Set `animationSpeed` (1-10)
   - Configure `fadeTime` (days particles remain visible)
   - Set `particleGlowDuration` (ms)

5. **Add filters** (optional):
   - Enable year filter
   - Enable category filter
   - Configure filter options

### Scenario 4: Custom SVG Map

1. **Prepare SVG map file**:
   - Ensure SVG elements have `id` attributes matching region codes
   - Place SVG file in `src/ElemWowMap/assets/` or provide URL

2. **Configure custom map**:
   - Set `customSvgUrl` to your SVG file path/URL
   - Set `svgIdField` to match your dataset identifier field
   - Configure `useMapNameForHover` if using map element names

3. **Set up choropleth**:
   - Choose Choropleth mode
   - Map region codes to SVG element IDs
   - Configure color scheme

## Troubleshooting

### Widget Not Appearing in Palette

**Problem**: ElemWowMap doesn't show up in the editor palette.

**Solutions**:
1. Verify `widgets.local.json` syntax is valid JSON
2. Check widget type is exactly `vendor::ElemWowMap`
3. Ensure package URL is correct in platform config
4. Restart the development server (`npm start`)
5. Clear browser cache

### Map Not Displaying

**Problem**: Map shows blank or error.

**Solutions**:
1. Check browser console for JavaScript errors
2. Verify map provider URL is accessible
3. Check CORS settings if using custom tile provider
4. Ensure Leaflet library is loaded
5. Verify map container has dimensions

### Dataset Not Loading

**Problem**: Widget shows "No data" or loading error.

**Solutions**:
1. Verify dataset fields match widget requirements:
   - Latitude field exists and contains valid coordinates
   - Longitude field exists and contains valid coordinates
   - Value field exists (for aggregation)
2. Check field names are correct (case-sensitive)
3. Ensure dataset has data for selected date range
4. Check browser console for API errors
5. Verify dataset permissions

### Heatmap Not Rendering

**Problem**: Heatmap layer doesn't appear.

**Solutions**:
1. Verify latitude/longitude fields contain valid numeric values
2. Check value field has numeric data
3. Adjust heatmap radius and blur settings
4. Increase max intensity if heatmap is too faint
5. Check browser console for Leaflet.heat errors

### Choropleth Not Coloring Regions

**Problem**: Regions appear but aren't colored.

**Solutions**:
1. Verify region code field matches SVG element IDs
2. Check region code format (should match `RU-XXX` pattern)
3. Ensure value field has data for regions
4. Check aggregation method is appropriate
5. Verify SVG map file is loaded correctly
6. Check `svgIdField` configuration matches your data

### Animation Not Working

**Problem**: Animation doesn't play or particles don't appear.

**Solutions**:
1. Verify date field is selected and contains valid dates
2. Check date format matches expected format
3. Ensure `autoPlay` is enabled or use play button
4. Adjust animation speed settings
5. Check `fadeTime` isn't too short
6. Verify dataset has multiple time points

### Performance Issues

**Problem**: Map is slow or unresponsive.

**Solutions**:
1. Reduce dataset size (add filters)
2. Enable dot clustering for large point datasets
3. Increase heatmap blur to reduce rendering load
4. Disable unnecessary animations
5. Reduce number of visible particles
6. Check for memory leaks in browser console
7. Use server-side filtering when possible

### Styling Not Applied

**Problem**: Custom CSS styles don't appear.

**Solutions**:
1. Check CSS selector specificity
2. Verify namespace isolation (`.elemwowmap-widget-root`)
3. Ensure styles are scoped to widget container
4. Check for CSS syntax errors
5. Verify custom styles panel configuration
6. Check that styles aren't overridden by theme

## Additional Resources

- **Platform Documentation**: [https://docs.goodt.me/front/](https://docs.goodt.me/front/)
- **Developer Playbook**: [../../../docs/ai-playbook/README.md](../../../docs/ai-playbook/README.md)
- **Widget README**: [../README.md](../README.md)
- **Widget Examples**: Check `example/map2/` directory for sample implementations

## Getting Help

If you encounter issues not covered in this guide:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review the widget README file: `src/ElemWowMap/README.md`
3. Consult the [Developer Playbook](../../../docs/ai-playbook/README.md) for technical details
4. Check browser console for error messages
5. Review dataset structure and field mappings
6. Verify all required fields are properly configured

---

*Last updated: 2025-01-18*

