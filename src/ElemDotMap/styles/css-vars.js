export const cssVars = {
    'layer-control_display': ({ isBaseLayerOnBottom }) => (isBaseLayerOnBottom ? 'flex' : 'block'),
    tooltip_background: 'points.hint.background',
    'tooltip_border-width': 'points.hint.borderWidth',
    'tooltip_border-color': 'points.hint.borderColor',
    'tooltip_vertical-padding': 'points.hint.verticalPadding',
    'tooltip_horizontal-padding': 'points.hint.horizontalPadding',
    'tooltip_triangle-color': 'points.hint.triangleColor',
    'tooltip_box-shadow': 'points.hint.boxShadow',
    'leaflet-control-layers_color': 'layerManagement.style.color',
    'leaflet-control-layers_font-size': 'layerManagement.style.fontSize',
    'leaflet-control-layers_font-family': 'layerManagement.style.fontFamily',
    'leaflet-control-layers_offset': 'layerManagement.style.offset',
    'leaflet-control-layers_button-color': 'layerManagement.style.buttonColor',
    'leaflet-control-layers_button-size': 'layerManagement.style.buttonSize',
    'leaflet-control-layers_text-align': 'layerManagement.style.textAlign',
    'leaflet-control-layers_flex-direction': 'layerManagement.style.direction',
    'map-search_top': 'search.top'
};

export const mapSearchCssVars = ({ mapHeight }) => ({
    'search-max-height': `calc(${mapHeight} - 2rem - var(--w-map-search_top))`
});
