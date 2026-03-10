import { PresetOrientation, PresetPosition, ResetAlign } from './constants';

export const InputModeOptions = {
    toneGradient: null,
    placeholder: 'дд.мм.гггг',
    style: {
        background: '',
        borderStyle: '',
        borderColor: '',
        borderWidth: '',
        borderRadius: '',
        height: '',
        width: '',
        color: ''
    },
    inpStyle: {
        color: '',
        'font-family': '',
        'font-size': ''
    },
    icon: {
        class: 'mdi-calendar',
        style: {
            'font-size': '',
            color: ''
        }
    },
    isResetDate: true
};

export const HeaderOptions = {
    toneGradient: null,
    iconGradient: null,
    color: 'var(--color-white)',
    backgroundColor: 'var(--color-primary)',
    iBackgroundColor: 'rgba(255, 255, 255, 0)',
    fontSize: '0.875rem',
    width: 'auto',
    height: 'auto',
    classPosition: 'flex-h-start'
};

export const ResetButtonOptions = {
    text: 'Сбросить',
    enabled: false,
    color: '',
    fontSize: '',
    bgColor: '',
    width: '',
    height: '',
    borderRadius: '',
    align: ResetAlign.CENTER,
    marginInline: '.5rem',
    marginBlock: '.5rem'
};

export const CaptionOptions = {
    show: false,
    text: 'Мой календарь',
    classPosition: 'caption-left',
    style: {
        fontFamily: '',
        color: '#ee2',
        fontSize: '0.875rem'
    }
};

export const DaysOptions = {
    highlightWeekend: false,
    color: 'var(--color-grey-dark)',
    fontSize: '0.875rem',
    backgroundColor: '',
    weekendColor: 'var(--color-red)',
    weekendFontFamily: '',
    weekendFontStyle: 'normal',
    weekendFontWeight: '400',
    weekendFontSize: '0.875rem'
};

export const TodayOptions = {
    toneGradient: null,
    shadow: null,
    border: {
        borderColor: '#aaa',
        borderStyle: 'solid',
        borderWidth: '0px'
    },
    withHighlight: true,
    color: 'var(--color-primary)',
    backgroundColor: 'rgba(255, 255, 255, 0)',
    fontWeight: '',
    borderRadius: ''
};

export const SelectedDateOptions = {
    toneGradient: null,
    shadow: null,
    border: null,
    color: '#fff',
    backgroundColor: 'var(--color-primary)',
    borderRadius: ''
};

export const NotCurrentMonthDate = {
    allDates: false,
    color: 'var(--color-grey-light)'
};

export const RangeOptions = {
    active: false,
    color: '#fff',
    backgroundColor: 'var(--color-primary)',
    shouldUseCustomStyle: false,
    backgroundRangeLine: 'var(--color-primary)'
};

export const GapOptions = {
    vertical: '0.25rem',
    horizontal: '0.25rem'
};

export const MarkOptions = {
    show: false,
    dimValues: {}
};

export const IndexesOptions = {
    isShow: false,
    metric: null,
    position: 'Сверху',
    location: 'Справа',
    color: '#999999',
    fontSize: '8px',
    fontFamily: 'Roboto',
    paddingVertical: '0px',
    paddingHorizontal: '0px'
};

export const PresetStyles = {
    isEnabled: false,
    width: '84px',
    height: '32px',
    fontSize: '14px',
    fontWeight: '400',
    fontFamily: '',
    borderRadius: '4px',
    borderWidth: '1px',
    borderColor: 'var(--color-primary)',
    color: 'var(--color-primary)',
    background: 'var(--color-white)',
    activeColor: 'var(--color-white)',
    activeBackground: 'var(--color-primary)',
    backgroundPreset: 'var(--color-white)',
    orientation: PresetOrientation.VERTICAL,
    position: PresetPosition.LEFT
};

export const OffsetOptions = [7, 30, 365];

export const CellStyleOptions = () => ({
    font: {},
    shadow: null,
    borderRadius: '0px'
});

export const CalendarExtra = () => ({
    toneGradient: null,
    shadow: null,
    border: {
        borderColor: '#aaa',
        borderStyle: 'solid',
        borderWidth: '0px',
        borderRadius: '0px'
    }
});
