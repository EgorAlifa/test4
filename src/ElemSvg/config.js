export const Fields = {
    metricId: null,
    metricColor: null,
    metricByClick: null
};

// ── Value-card mode ────────────────────────────────────────────────
// Lets one node template (a KPI "card": title + value + signed % + plan)
// be reused across many rows, each row driving one bound SVG object via
// fields.metricId (unchanged) plus these extra field mappings.
export const CardFields = {
    titleField: null,
    titleField2: null,
    valueField: null,
    valueFormat: null,
    planField: null,
    planFormat: null,
    percentField: null, // if empty, computed as abs(value - plan) / plan
    percentFormat: null,
    // row field naming which diff direction counts as "good" (green): 'up' | 'down'
    positiveDirectionField: null,
    // row field: truthy => card uses cardStyle.highlightBg/highlightBorder
    highlightField: null,
    planLabel: 'План ',
    // Optional: row fields holding already-formatted display text, used verbatim
    // instead of valueFormat/planFormat/percentFormat. Use when rows need mixed
    // decimal precision (e.g. "716" vs "22,00" vs "5,0") a single format can't cover.
    valueDisplayField: null,
    planDisplayField: null,
    percentDisplayField: null
};

export const CardStyle = {
    fontFamily: 'Arial, Helvetica, sans-serif',
    titleColor: '#94A3B8',
    titleFontSize: '15px',
    valueColor: '#0F172A',
    valueFontSize: '26px',
    percentFontSize: '17px',
    planFontSize: '14px',
    planLabelColor: '#94A3B8',
    planValueColor: '#475569',
    positiveColor: '#16A34A',
    negativeColor: '#DC2626',
    bg: '#FFFFFF',
    border: '#E2E8F0',
    highlightBg: '#FEF2F2',
    highlightBorder: '#EF4444'
};

export const ColorSettings = {
    defaultColor: 'inherit',
    defaultStroke: 'inherit',
    nodes: [],
    shouldUseRules: false,
    rules: []
};

export const HoverSettings = {
    shouldHoverAllElements: false,
    shouldUseSettings: false,
    fill: 'rgba(107,255,98,1)',
    stroke: '#000',
    strokeWidth: '1px',
    additionalFill: 'rgba(167,164,164,1)',
    additionalStroke: 'rgba(167,164,164,1)'
};

export const GeneralSettings = {
    stroke: '#c0c0c0',
    strokeWidth: '1px',
    boxShadow: '0px 4px 8px #00000029'
};

export const SelectSettings = {
    isEnabled: false,
    shouldSelectAllElements: false,
    blockOpacity: '0.3',
    textOpacity: '0.3'
};

export const createNode = (id) => ({
    id,
    newId: id,
    isVisible: true,
    shouldChangeId: false
});

export const createLabelsSettings = (id) => ({
    id,
    useCustomLabelSettings: false,
    labelOffsetY: 0,
    labelOffsetX: 0,
    labelOffsetRight: 0,
    offsetBetweenLabels: 40
});

export const createLimitSettings = (id) => ({
    id,
    isEnabled: false,
    countRows: 3
});

export const SVG_STYLES = `
    tspan {filter: none; stroke-width: 0}
    text {filter: none; stroke-width: 0}
    path {transition: 0.5s all}
    p {margin: 0}
    .labels {
        display: -webkit-box;
        cursor: pointer;
        overflow: hidden;
        text-overflow: ellipsis;
        box-sizing: border-box;
        -webkit-box-orient: vertical;
    }`;
