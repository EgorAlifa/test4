import {
    CaptionOptions,
    DaysOptions,
    GapOptions,
    HeaderOptions,
    IndexesOptions,
    InputModeOptions,
    MarkOptions,
    NotCurrentMonthDate,
    OffsetOptions,
    PresetStyles,
    RangeOptions,
    SelectedDateOptions,
    CellStyleOptions,
    CalendarExtra,
    TodayOptions,
    ResetButtonOptions
} from './config';
import { IntervalVars } from './constants';
import { cssVars } from './css-vars';
import panels from './panels';

export const Vars = Object.freeze({
    DATE: 'date',
    MONTH: 'month',
    ...IntervalVars
});

export const Events = Object.freeze({
    AUTO_REFRESH: 'autoRefresh'
});

const descriptor = () => ({
    props: {
        isInputMode: {
            type: Boolean,
            default: false
        },
        inputMode: {
            type: Object,
            default: () => InputModeOptions
        },
        header: {
            type: Object,
            default: () => HeaderOptions
        },
        caption: {
            type: Object,
            default: () => CaptionOptions
        },
        days: {
            type: Object,
            composeDays: (days) => (days?.backgroundColor ? days : { ...days, backgroundColor: '' }),
            default: () => DaysOptions
        },
        today: {
            type: Object,
            default: () => TodayOptions
        },
        selectedDate: {
            type: Object,
            default: () => SelectedDateOptions
        },
        notCurrentMonthDate: {
            type: Object,
            default: () => NotCurrentMonthDate
        },
        range: {
            type: Object,
            default: () => RangeOptions
        },
        enableOffsets: {
            type: Boolean,
            default: false
        },
        offsets: {
            type: Array,
            default: () => OffsetOptions
        },
        dimension: {
            type: String,
            default: ''
        },
        metric: {
            type: String,
            default: ''
        },
        dateCategories: {
            type: Array,
            default() {
                return [];
            }
        },
        cellWidth: {
            type: String,
            default: '2rem'
        },
        cellHeight: {
            type: String,
            default: '1.5rem'
        },
        gap: {
            type: Object,
            default: () => GapOptions
        },
        cellStyle: {
            type: Object,
            default: () => ({
                workDates: CellStyleOptions(),
                weekendDates: CellStyleOptions()
            })
        },
        presetCellStyle: {
            type: Object,
            default: () => CellStyleOptions()
        },
        calendarExtra: {
            type: Object,
            default: CalendarExtra
        },
        cellFontSize: {
            type: String,
            default: '1.125rem'
        },
        position: {
            type: String,
            default: 'pos-rel'
        },
        mark: {
            type: Object,
            default: () => MarkOptions
        },
        showLocalPopup: { type: Boolean, default: false },
        eventName: { type: String, default: '' },
        popupUrl: { type: String, default: '' },
        indexes: {
            type: Object,
            default: () => IndexesOptions
        },
        moduleName: { type: String, default: '' },
        moduleDescription: { type: String, default: '' },
        courseName: { type: String, default: '' },
        educationForm: { type: String, default: '' },
        conditions: {
            type: Array,
            default() {
                return [];
            }
        },
        borderRadius: { type: String, default: '' },
        placeholderColor: { type: String, default: '' },
        calendarBackground: { type: String, default: '' },
        interval: {
            type: Object,
            default: () => ({ isUsed: false })
        },
        metrics: {
            type: Object,
            default: () => ({ date: null })
        },
        events: {
            type: Object,
            default: () => ({
                [Events.AUTO_REFRESH]: 'auto_refresh'
            }),
            label: 'Событие для обновления виджета'
        },
        isManualDateInput: {
            type: Boolean,
            default: true,
            label: 'Ручной ввод даты'
        },
        isExpandedRange: {
            type: Boolean,
            default: false,
            label: 'Выбор нескольких диапозонов'
        },
        sqlLikeVarName: {
            type: Object,
            default: () => ({
                isEnable: false,
                varName: 'NAME'
            }),
            label: {
                'sqlLikeVarName.isEnable': 'SQL like значение переменной',
                'sqlLikeVarName.varName': 'Название аргумента для переменной стора'
            }
        },
        presetStyles: {
            type: Object,
            default: () => PresetStyles
        },
        resetBtn: {
            type: Object,
            default: () => ResetButtonOptions
        },
        hardPresets: {
            type: Boolean,
            default: false,
            label: 'Точные даты пресетов'
        },
        datePickerLimit: {
            type: Object,
            default: () => ({ limitStart: null, limitEnd: null })
        }
    },
    events: {
        [Events.AUTO_REFRESH]: ['trigger']
    },
    vars: {
        date: { description: 'Defines the calendar date' },
        month: { description: 'Defines the calendar current month' }
    }
});

export const meta = {
    descriptor,
    panels,
    isChildAllowed: false,
    slotNames: ['default'],
    cssVars
};
