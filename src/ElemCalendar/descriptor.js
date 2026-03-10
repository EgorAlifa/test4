import panels from './panels';

export const descriptor = () => ({
    props: {
        // ── View & behaviour ──────────────────────────────────────────
        calView: {
            type: String,
            default: 'month',
            label: 'Вид календаря'
        },
        calLocale: {
            type: String,
            default: 'ru',
            label: 'Язык'
        },
        calFirstDay: {
            type: Number,
            default: 1,
            label: 'Первый день недели (0=Вс, 1=Пн)'
        },
        calShowWeekNumbers: {
            type: Boolean,
            default: false,
            label: 'Показывать номера недель'
        },
        calShowViewSwitcher: {
            type: Boolean,
            default: true,
            label: 'Показывать переключатель видов'
        },
        calShowTodayBtn: {
            type: Boolean,
            default: true,
            label: 'Кнопка «Сегодня»'
        },
        calShowHeader: {
            type: Boolean,
            default: true,
            label: 'Показывать заголовок'
        },
        calShowWeekends: {
            type: Boolean,
            default: true,
            label: 'Показывать выходные'
        },
        calAvailableViews: {
            type: Array,
            default() {
                return ['month', 'week', 'day', 'agenda'];
            },
            label: 'Доступные виды'
        },
        // ── Selection ─────────────────────────────────────────────────
        calSelectionMode: {
            type: String,
            default: 'single',
            label: 'Режим выбора (none/single/range)'
        },
        calSelectedDate: {
            type: String,
            default: '',
            label: 'Выбранная дата (ISO)'
        },
        calSelectedStart: {
            type: String,
            default: '',
            label: 'Начало диапазона (ISO)'
        },
        calSelectedEnd: {
            type: String,
            default: '',
            label: 'Конец диапазона (ISO)'
        },
        // ── Store bindings ────────────────────────────────────────────
        calDateVar: {
            type: String,
            default: '',
            label: 'Переменная хранилища: выбранная дата'
        },
        calStartVar: {
            type: String,
            default: '',
            label: 'Переменная хранилища: начало диапазона'
        },
        calEndVar: {
            type: String,
            default: '',
            label: 'Переменная хранилища: конец диапазона'
        },
        calEventsVar: {
            type: String,
            default: '',
            label: 'Переменная хранилища: события (JSON)'
        },
        // ── Events data ───────────────────────────────────────────────
        calEventsJson: {
            type: String,
            default: '',
            label: 'Статические события (JSON)'
        },
        // ── Appearance: preset ────────────────────────────────────────
        calPreset: {
            type: String,
            default: 'corporate',
            label: 'Пресет оформления'
        },
        // ── Appearance: colors ────────────────────────────────────────
        calBg: {
            type: String,
            default: '#ffffff'
        },
        calHeaderBg: {
            type: String,
            default: '#4f6aff'
        },
        calHeaderColor: {
            type: String,
            default: '#ffffff'
        },
        calAccentColor: {
            type: String,
            default: '#4f6aff'
        },
        calTodayBg: {
            type: String,
            default: '#eef0ff'
        },
        calTodayColor: {
            type: String,
            default: '#4f6aff'
        },
        calWeekendColor: {
            type: String,
            default: '#ef4444'
        },
        calCellBg: {
            type: String,
            default: '#ffffff'
        },
        calCellHoverBg: {
            type: String,
            default: '#f5f7ff'
        },
        calCellBorderColor: {
            type: String,
            default: '#e8ecf4'
        },
        calSelectedBg: {
            type: String,
            default: '#4f6aff'
        },
        calSelectedColor: {
            type: String,
            default: '#ffffff'
        },
        calRangeBg: {
            type: String,
            default: 'rgba(79,106,255,0.10)'
        },
        // ── Appearance: shape & typography ───────────────────────────
        calRadius: {
            type: String,
            default: '12px'
        },
        calEventRadius: {
            type: String,
            default: '4px'
        },
        calShadow: {
            type: String,
            default: '0 4px 24px rgba(79,106,255,0.10), 0 1px 4px rgba(0,0,0,0.06)'
        },
        calFontFamily: {
            type: String,
            default: 'inherit'
        },
        calFontSize: {
            type: String,
            default: '13px'
        },
        // ── Custom CSS ────────────────────────────────────────────────
        calCustomCss: {
            type: String,
            default: ''
        }
    },
    vars: {},
    cssVars: {}
});

export const meta = {
    descriptor,
    panels,
    isChildAllowed: false
};

export default descriptor;
