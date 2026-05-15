# ElemWowMap Widget

A comprehensive interactive map visualization widget for the Insight Platform, supporting multiple visualization modes including Heatmap, Dots, Choropleth, and time-based Animation.

## 📚 Documentation

- **[User Setup Guide (English)](./docs/en/setup.md)** - Comprehensive guide for setting up and configuring ElemWowMap
- **[Руководство пользователя (Русский)](./docs/ru/setup.md)** - Подробное руководство по настройке и конфигурации ElemWowMap
- **[Developer Playbook](../../../docs/ai-playbook/README.md)** - Technical documentation for widget development

## Features

### Visualization Modes

1. **Heatmap** - Display data density as a heatmap overlay
   - Configurable radius, blur, and opacity
   - Dynamic intensity calculation
   - Color gradient customization
   - Real-time rendering with Leaflet.heat

2. **Dots** - Display individual data points as colored markers
   - Category-based coloring
   - Interactive popups with event details
   - Customizable dot radius and opacity
   - Marker clustering support for large datasets

3. **Animation** - Temporal animation of events over time
   - Play/pause/reset controls
   - Configurable animation speed
   - Particle fade effects
   - Auto-play option
   - Timeline synchronization

4. **Choropleth** - Regional aggregation visualization using SVG maps
   - Support for custom SVG maps (e.g., `ru.svg`)
   - Color-coded regions based on aggregated values
   - Multiple aggregation methods (count, sum, average, min, max)
   - Multi-level drill-down support
   - Region code mapping (RU-XXX format)

### Dataset Integration

- **Flexible Field Mapping**: Map any dataset columns to required fields
  - Latitude and Longitude (required for most modes)
  - Date/Time field (for animation and temporal filtering)
  - Category field (for color coding)
  - Value field (for aggregation)
  - Description field (for popups)
  - Region code/name fields (for choropleth)

- **Auto-Detection**: Automatically detects common field names
- **IDP Integration**: Full support for Insight Data Platform datasets
- **Cross-Widget Communication**: Syncs filters with other widgets via variables

### Filtering & Interaction

- **Year Filter**: Filter data by year range
- **Category Filter**: Filter by data categories
- **Lasso Tool**: Manual selection of geographic areas
- **Variable Filters**: Integration with other widgets via IDP variables

### Theming & Customization

- **Multiple Themes**: Light, Dark, and Blue themes
- **Map Tile Providers**: OpenStreetMap, CartoDB, CartoDB Dark, or custom tiles
- **Initial View**: Configure initial center point and zoom level
- **UI Controls**: Show/hide controls panel, legend, and chart
- **Positioning**: Customize position of controls, legend, and chart
- **Custom CSS**: Advanced styling via Custom Styles Panel

### Empty State

The widget features an intelligent empty state that guides users through configuration:

- **No Dataset**: Shows prompt to configure data source
- **Missing Coordinates**: Indicates latitude/longitude fields need mapping
- **Missing Date**: Reminds user to map date field
- **No Data**: Explains that dataset is empty or filtered
- **Modern UI**: Gradient background with animated map icon

## Quick Start

### Basic Setup

1. **Register the widget** in `public/config/package/widgets.local.json`:
```json
{
  "elements": [
    {
      "type": "vendor::ElemWowMap",
      "name": "Map Widget",
      "icon": "mdi-map"
    }
  ]
}
```

2. **Add widget to your dashboard** from the widget palette

3. **Configure dataset** in the Dataset Panel:
   - Select latitude field
   - Select longitude field
   - Select date field (for animation)
   - Select category field (for coloring)
   - Optionally select value field (for aggregation)

4. **Choose visualization mode** in Visualization Panel:
   - Heatmap for density visualization
   - Dots for point markers
   - Choropleth for regional data
   - Animation for time-based visualization

For detailed setup instructions, see the [User Setup Guide](./docs/en/setup.md).

## Configuration Panels

1. **Dataset Panel** - Map dataset columns to widget fields
2. **Visualization Panel** - Select mode, theme, and display options
3. **Animation Panel** - Configure animation speed and effects (Animation mode)
4. **Heatmap Panel** - Adjust heatmap parameters (Heatmap mode)
5. **Choropleth Panel** - Configure SVG map, color scheme, and aggregation (Choropleth mode)
6. **Filter Panel** - Enable/disable year, category, and lasso filters
7. **Color Panel** - Customize category colors
8. **Custom Styles Panel** - Advanced CSS customization

## Visualization Modes Details

### Heatmap Mode

**Best for**: Visualizing density and concentration of events

**Key Settings**:
- **Radius**: Size of heat points (5-100px, default: 25)
- **Blur**: Amount of blur effect (5-50px, default: 15)
- **Min Opacity**: Minimum opacity level (0-1)
- **Intensity Range**: Optional min/max intensity values

**Performance**: Works well with any dataset size

### Dots Mode

**Best for**: Seeing individual events with category distinction

**Key Settings**:
- **Dot Radius**: Size of dots (2-20px, default: 5)
- **Dot Opacity**: Transparency of dots (0.1-1)
- **Color Scheme**: Color palette for categories
- **Clustering**: Enable/disable marker clustering (recommended for >1000 points)

**Performance**: Best with < 10,000 points (use clustering for more)

### Animation Mode

**Best for**: Understanding temporal patterns and event progression

**Key Settings**:
- **Auto Play**: Start animation on load
- **Speed**: Animation speed multiplier (0.5x - 5x)
- **Glow Duration**: How long particles glow (500-10000ms)
- **Fade Time**: How long particles remain visible (1-30 days)

**Controls**:
- Play/Pause button
- Reset button
- Speed slider
- Date display

**Performance**: Best with < 50,000 points for smooth playback

### Choropleth Mode

**Best for**: Regional comparison and aggregated statistics

**Key Settings**:
- **SVG Map File**: Choose map file (e.g., `ru.svg`)
- **Region Code Field**: Field containing region identifiers (RU-XXX format)
- **Color Scheme**: Choose from various color gradients (YlOrRd, Blues, Greens, etc.)
- **Color Steps**: Number of color categories (3-10)
- **Aggregation Method**: count, sum, average, min, or max
- **Missing Data Color**: Color for regions without data

**Performance**: Works with any dataset size (aggregates automatically)

## Data Requirements

### Minimum Requirements

- **Latitude/Longitude**: Valid coordinate ranges (lat: -90 to 90, lng: -180 to 180)
- **Date Field**: Valid date formats (ISO 8601 recommended)
- **Dataset**: At least 3 columns (lat, lng, date)

### Recommended Dataset Size

- **Heatmap**: Any size
- **Dots**: < 10,000 points (use clustering for more)
- **Animation**: < 50,000 points for smooth playback
- **Choropleth**: Any size (aggregates automatically)

## Performance Tips

1. Use **Heatmap** for large datasets (> 10,000 points)
2. Enable **clustering** in Dots mode for better performance
3. Filter data by year range to reduce dataset size
4. Use **Choropleth** for regional analysis instead of individual points
5. Adjust animation **fade time** to control memory usage
6. Use server-side filtering when possible

## Cross-Widget Communication

The widget supports cross-widget communication via IDP variables:

- **Year selections** are shared as filter values (`varsToCommit`)
- **Category selections** are broadcast to other widgets
- Other widgets can filter the map by setting store variables
- Configure `varsToCommit` and `varAliases` in Filter Panel

## Troubleshooting

### Map doesn't appear
- Check that latitude and longitude fields are correctly mapped
- Verify coordinates are valid numbers
- Ensure dataset has data
- Check browser console for Leaflet errors

### No data showing
- Check that filters aren't excluding all data
- Verify date field is correctly formatted
- Check console for error messages
- Verify dataset permissions

### Heatmap not rendering
- Verify latitude/longitude fields contain valid numeric values
- Check value field has numeric data
- Adjust heatmap radius and blur settings
- Increase max intensity if heatmap is too faint

### Choropleth not coloring regions
- Verify region code field matches SVG element IDs
- Check region code format (should match `RU-XXX` pattern)
- Ensure value field has data for regions
- Check aggregation method is appropriate
- Verify SVG map file is loaded correctly

### Animation not working
- Verify date field is selected and contains valid dates
- Check date format matches expected format
- Ensure `autoPlay` is enabled or use play button
- Adjust animation speed settings
- Check `fadeTime` isn't too short

For more troubleshooting help, see the [User Setup Guide - Troubleshooting](./docs/en/setup.md#troubleshooting).

## Dependencies

The following npm packages are required:

```json
{
  "leaflet": "^1.9.4",
  "leaflet.heat": "^0.2.0",
  "leaflet-lasso": "^2.2.13",
  "leaflet.glify": "^3.3.1"
}
```

## File Structure

```
src/ElemWowMap/
├── ElemWowMap.vue              # Main widget component
├── descriptor.js                # Props and meta configuration
├── README.md                    # This file
├── docs/                        # User documentation
│   ├── en/                      # English documentation
│   └── ru/                      # Russian documentation
├── components/                  # Visualization components
│   ├── LeafletMap.vue          # Base Leaflet map
│   ├── HeatmapLayer.vue        # Heatmap visualization
│   ├── DotsLayer.vue           # Dots visualization
│   ├── AnimationLayer.vue      # Animation visualization
│   ├── ChoroplethMap.vue       # Choropleth visualization
│   ├── ChoroplethLegend.vue    # Choropleth legend
│   ├── HeatmapLegend.vue       # Heatmap legend
│   ├── MapLegend.vue           # General map legend
│   └── CustomSelect.vue        # Custom select component
├── panels/                      # Configuration panels
│   ├── DatasetPanel.vue        # Dataset field mapping
│   ├── VisualizationPanel.vue  # Mode and theme selection
│   ├── AnimationPanel.vue      # Animation settings
│   ├── HeatmapPanel.vue        # Heatmap settings
│   ├── ChoroplethPanel.vue     # Choropleth settings
│   ├── FilterPanel.vue         # Filter configuration
│   ├── ColorPanel.vue          # Color customization
│   └── CustomStylesPanel.vue   # CSS customization
├── utils/                       # Utilities and helpers
│   ├── constants.js            # Default props and constants
│   ├── mapUtils.js             # Map utility functions
│   ├── mapHelpers.js           # Helper functions
│   ├── dataTransform.js        # Data transformation
│   └── particles.js            # Particle effects
├── styles/                      # CSS and theming
│   ├── css-vars.js             # CSS variables
│   └── style.pcss              # Widget styles
└── assets/                      # SVG map files
    └── ru.svg                   # Russia SVG map
```

## Development

### Adding New Features

1. Update `descriptor.js` with new props
2. Add configuration UI in appropriate panel
3. Implement feature in visualization component
4. Update `ElemWowMap.vue` to use new feature
5. Test and document
6. Update user documentation if needed

### Code Style

- Follow Vue 2.7 composition API patterns
- Use scoped CSS with namespace isolation (`.elemwowmap-widget-root`)
- Follow project linting rules
- Use TypeScript types where applicable

## API Reference

### Props

See `descriptor.js` for complete prop definitions. Key props include:

- **Field Mappings**: `latitudeField`, `longitudeField`, `dateField`, `categoryField`, `valueField`
- **Visualization**: `visualizationMode`, `theme`, `showControls`, `showLegend`
- **Map Settings**: `mapTileProvider`, `initialZoom`, `initialCenter`, `autoCenter`
- **Animation**: `animationSpeed`, `autoPlay`, `fadeTime`, `particleGlowDuration`
- **Heatmap**: `heatmapRadius`, `heatmapBlur`, `heatmapMinOpacity`, `heatmapMaxIntensity`
- **Choropleth**: `choroplethColorScheme`, `choroplethColorSteps`, `choroplethAggregationMethod`
- **Filters**: `enableYearFilter`, `enableCategoryFilter`, `enableLassoTool`

### Events

- `animation-complete`: Fired when animation finishes
- `animation-progress`: Fired during animation with progress info
- `map-ready`: Fired when Leaflet map is initialized

### Methods

Access via widget instance:

- `initializeVisualization()`: Re-initialize current visualization
- `applyCurrentFilters()`: Reapply filters to data
- `updateDescriptorVars()`: Update cross-widget variables

## License

Part of the Insight Platform widget library.

## Support

- **User Documentation**: [Setup Guide](./docs/en/setup.md)
- **Developer Documentation**: [AI Playbook](../../../docs/ai-playbook/README.md)
- **Platform Documentation**: [https://docs.goodt.me/front/](https://docs.goodt.me/front/)

For issues, questions, or feature requests, please contact the Insight Platform development team.

---

*Last updated: 2025-01-18*
