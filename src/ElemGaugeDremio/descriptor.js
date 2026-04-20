import panels from './panels';

const descriptor = () => ({
    props: {
        showTitle: {
            type: Boolean,
            default: false
        },
        title: {
            type: String,
            default: 'Gauge'
        },
        titleColor: {
            type: String,
            default: '#808080'
        },
        titleFontSize: {
            type: String,
            default: '1rem'
        },
        titleFont: {
            type: String,
            default: 'inherit'
        },
        barDistance: {
            type: [String, Number],
            default: '0'
        },
        showPercent: {
            type: Boolean,
            default: true
        },
        percentColor: {
            type: String,
            default: '#808080'
        },
        percentFormat: {
            type: [String, Number],
            default: '2'
        },
        percentFontSize: {
            type: String,
            default: '1rem'
        },
        percentFont: {
            type: String,
            default: 'inherit'
        },
        percentPosition: {
            type: String,
            default: 'right',
            validator: (value) => ['right', 'left', 'top', 'bottom', 'center'].indexOf(value) !== -1
        },
        showLegend: {
            type: Boolean,
            default: true
        },
        legendFormat: {
            type: String,
            default: 'percent'
        },
        legendFontSize: {
            type: String,
            default: '1rem'
        },
        legendFont: {
            type: String,
            default: 'inherit'
        },
        legendPosition: {
            type: String,
            default: 'right',
            validator: (value) => ['right', 'left', 'top', 'bottom'].includes(value)
        },
        showBackground: {
            type: Boolean,
            default: false
        },
        backgroundColor: {
            type: String,
            default: '#cccccc'
        },
        iconShow: {
            type: Boolean,
            default: false
        },
        iconClass: {
            type: String,
            default: 'mdi-margin'
        },
        iconSize: {
            type: String,
            default: '1rem'
        },
        iconColor: {
            type: String,
            default: '#03a9f4'
        },
        levels: {
            type: Array,
            default: () => []
        },
        showTooltip: {
            type: Boolean,
            default: true
        },
        fitHeight: {
            type: Boolean,
            default: false
        },
        updateEvent: {
            type: String,
            default: ''
        }
    }
});

export const meta = {
    descriptor,
    panels,
    isChildAllowed: false,
    cssVars: {
        'icon-size': 'iconSize',
        'icon-color': 'iconColor',
        'legend_font-size': 'legendFontSize',
        'legend_font-family': 'legendFont',
        title_display: ({ showTitle }) => (showTitle ? 'block' : 'none'),
        title_color: 'titleColor',
        'title_font-size': 'titleFontSize',
        'title_font-family': 'titleFont',
        'percent-align': ({ percentPosition }) =>
            ({
                left: 'row-reverse',
                bottom: 'column',
                top: 'column-reverse',
                center: 'center'
            }[percentPosition] ?? ''),
        'percent_flex-direction': ({ percentPosition }) =>
            ['top', 'bottom'].includes(percentPosition) ? 'row' : 'column',
        percent_color: 'percentColor',
        'percent_font-size': 'percentFontSize',
        'percent_font-family': 'percentFont'
    }
};
