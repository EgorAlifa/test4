import panels from './panels';

export const descriptor = () => ({
    props: {
        // ── Mode ──────────────────────────────────────────────────────
        calMode: {
            type: String,
            default: 'full',
            label: 'Режим: full (полный) | compact (компактный фильтр дат)'
        },
        calCompactShowBottom: {
            type: Boolean,
            default: true,
            label: 'Компактный режим: показывать нижнюю панель (ввод дат + кнопки)'
        },
        calCompactShowPresets: {
            type: Boolean,
            default: true,
            label: 'Компактный режим: показывать кнопки-пресеты'
        },
        calPresetsJson: {
            type: String,
            default: null,
            label: 'Компактный режим: пресеты дат (JSON-массив [{key,label}])'
        },
        calCompactShowToday: {
            type: Boolean,
            default: true,
            label: 'Компактный режим: показывать кнопку «Сегодня» в шапке'
        },
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
                return ['month', 'week', 'day', 'agenda', 'year'];
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
        calRangeVar: {
            type: String,
            default: '',
            label: 'Переменная хранилища: диапазон (JSON-массив [start, end])'
        },
        calDatesVar: {
            type: String,
            default: '',
            label: 'Переменная хранилища: список дат (JSON-массив ["YYYY-MM-DD", ...])'
        },
        calSelectedDates: {
            type: String,
            default: '',
            label: 'Выбранные даты (JSON-массив ISO дат, режим "multi")'
        },
        calEventsVar: {
            type: String,
            default: '',
            label: 'Переменная хранилища: события (JSON)'
        },
        // ── Dataset column mapping for events ─────────────────────────
        calDataTitleCol: {
            type: String,
            default: '',
            label: 'Столбец заголовка события'
        },
        calDataStartTimeCol: {
            type: String,
            default: '',
            label: 'Столбец времени начала'
        },
        calDataEndTimeCol: {
            type: String,
            default: '',
            label: 'Столбец времени конца'
        },
        calDataDescCol: {
            type: String,
            default: '',
            label: 'Столбец описания события'
        },
        calMetricDataCol: {
            type: String,
            default: '',
            label: 'Столбец метрики (тепловая карта)'
        },
        // ── Events data ───────────────────────────────────────────────
        calEventsJson: {
            type: String,
            default: '',
            label: 'Статические события (JSON)'
        },
        // ── Heatmap / metric ─────────────────────────────────────────
        calHeatmapEnabled: {
            type: Boolean,
            default: false,
            label: 'Тепловая карта'
        },
        calMetricVar: {
            type: String,
            default: '',
            label: 'Переменная хранилища: метрика'
        },
        calMetricJson: {
            type: String,
            default: '',
            label: 'Статическая метрика (JSON)'
        },
        calHeatmapColorLow: {
            type: String,
            default: '#f0f9ff',
            label: 'Цвет минимума тепловой карты'
        },
        calHeatmapColorHigh: {
            type: String,
            default: '#4f46e5',
            label: 'Цвет максимума тепловой карты'
        },
        calHeatmapShowValue: {
            type: Boolean,
            default: true,
            label: 'Показывать значение метрики в ячейке'
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
        // ── Dataset / Dremio integration ──────────────────────────────
        dimension: {
            type: String,
            default: '',
            label: 'Измерение (столбец дат в источнике)'
        },
        metrics: {
            type: Object,
            default: () => ({ date: null }),
            label: 'Метрики источника данных'
        },
        // ── Typography extras ─────────────────────────────────────────
        calFontWeight: {
            type: String,
            default: '400'
        },
        calLetterSpacing: {
            type: String,
            default: '0'
        },
        calTextTransform: {
            type: String,
            default: 'none'
        },
        // ── Custom CSS ────────────────────────────────────────────────
        calCustomCss: {
            type: String,
            default: ''
        },
        // ── Designer per-element CSS (JSON object) ────────────────────
        calDesignerCss: {
            type: String,
            default: '{}'
        }
    },
    vars: {
        date: { description: 'Выбранная дата (ISO)' },
        dateStart: { description: 'Начало диапазона (ISO)' },
        dateEnd: { description: 'Конец диапазона (ISO)' },
        range: { description: 'Диапазон дат (JSON-массив [start, end])' },
        datesList: { description: 'Массив выбранных дат (JSON, режим "multi")' }
    },
    cssVars: {}
});

export const meta = {
    descriptor,
    panels,
    isChildAllowed: false
};

export default descriptor;
