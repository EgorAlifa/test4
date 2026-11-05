// Чистые функции преобразования дат календаря в значения переменных и обратно.
// Всё время — ЛОКАЛЬНОЕ (часовой пояс браузера): строку 'YYYY-MM-DD' никогда не
// разбираем через new Date(str), потому что такая строка трактуется как UTC
// и в поясах западнее Гринвича даёт предыдущий день.

export const OUTPUT_FORMATS = {
    AUTO: 'auto',           // как раньше: timestamp при calWithTime, иначе ISO-дата
    DATE: 'date',           // 'YYYY-MM-DD'
    TIMESTAMP: 'timestamp', // число, миллисекунды Unix epoch
    DATETIME: 'datetime'    // 'YYYY-MM-DD HH:mm:ss' (локальное время, без пояса)
};

// Конец дня для конца диапазона, когда время не выбирается в интерфейсе
export const END_OF_DAY = { h: 23, m: 59, s: 59, ms: 999 };
const START_OF_DAY = { h: 0, m: 0, s: 0, ms: 0 };

// Числа меньше этого порога считаем секундами, а не миллисекундами:
// 1e11 мс — это 1973-03-03, а 1e11 с — 5138 год.
const SECONDS_THRESHOLD = 1e11;

const pad = (n, len = 2) => String(n).padStart(len, '0');

function isoOf(d) {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function hhmmOf(d) {
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// 'auto' / пусто / неизвестное значение → формат по старым правилам
export function resolveOutputFormat(format, withTime) {
    if (!isAutoFormat(format)) return format;
    return withTime ? OUTPUT_FORMATS.TIMESTAMP : OUTPUT_FORMATS.DATE;
}

// true — формат не задан явно ('auto' / пусто / неизвестное значение)
export function isAutoFormat(format) {
    return format !== OUTPUT_FORMATS.DATE && format !== OUTPUT_FORMATS.TIMESTAMP && format !== OUTPUT_FORMATS.DATETIME;
}

// Форма значения datesList для режима выбора ('range' | 'multi') и формата calOutputFormat.
//   'pair'  — [начало, конец] (старое поведение 'auto' + calWithTime в режиме диапазона)
//   'json'  — JSON-строка ISO-дат (режим multi: формат 'date' и любой 'auto')
//   'array' — массив значений по каждому дню в выбранном формате
// В режиме 'auto' формы сохраняются как раньше ради обратной совместимости.
export const DATES_LIST_SHAPES = { PAIR: 'pair', JSON: 'json', ARRAY: 'array' };
export function datesListShape(mode, format, withTime) {
    const auto = isAutoFormat(format);
    const resolved = resolveOutputFormat(format, withTime);
    if (mode === 'multi') {
        return (auto || resolved === OUTPUT_FORMATS.DATE) ? DATES_LIST_SHAPES.JSON : DATES_LIST_SHAPES.ARRAY;
    }
    return (auto && resolved === OUTPUT_FORMATS.TIMESTAMP) ? DATES_LIST_SHAPES.PAIR : DATES_LIST_SHAPES.ARRAY;
}

// 'HH:mm' | 'HH:mm:ss' | 'HH:mm:ss.SSS' → { h, m, s, ms } или null
export function parseTime(time) {
    if (typeof time !== 'string') return null;
    const m = /^(\d{1,2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/.exec(time.trim());
    if (!m) return null;
    const t = { h: +m[1], m: +m[2], s: m[3] ? +m[3] : 0, ms: m[4] ? +m[4].padEnd(3, '0') : 0 };
    if (t.h > 23 || t.m > 59 || t.s > 59) return null;
    return t;
}

// 'YYYY-MM-DD' → [y, mo, d] или null (с проверкой существования даты)
function splitIso(iso) {
    const m = typeof iso === 'string' ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso) : null;
    if (!m) return null;
    const y = +m[1], mo = +m[2], d = +m[3];
    const probe = new Date(y, mo - 1, d);
    if (probe.getFullYear() !== y || probe.getMonth() !== mo - 1 || probe.getDate() !== d) return null;
    return [y, mo, d];
}

// Локальная дата + время → timestamp (мс). time — строка 'HH:mm[:ss]' или объект { h, m, s, ms }.
// Некорректное время заменяется на 00:00. Некорректная дата → null.
export function isoTimeToTs(iso, time) {
    const parts = splitIso(iso);
    if (!parts) return null;
    const t = (typeof time === 'object' && time) ? time : (parseTime(time) || START_OF_DAY);
    const [y, mo, d] = parts;
    // Конструктор с компонентами работает в локальном поясе. Если время попадает
    // в «дыру» перехода на летнее время, движок сам сдвинет его вперёд.
    return new Date(y, mo - 1, d, t.h, t.m, t.s || 0, t.ms || 0).getTime();
}

// Значение переменной для одной даты.
//   iso      — 'YYYY-MM-DD' ('' / null → пустое значение)
//   format   — уже разрешённый формат (см. resolveOutputFormat)
//   withTime — включён ли выбор времени в интерфейсе (calWithTime)
//   time     — выбранное время 'HH:mm' (учитывается только при withTime)
//   isEnd    — конец диапазона: без выбора времени берётся 23:59:59.999
export function toOutputValue(iso, { format, withTime = false, time = null, isEnd = false } = {}) {
    if (!iso) return format === OUTPUT_FORMATS.DATE ? '' : null;
    if (!splitIso(iso)) return null;
    if (format === OUTPUT_FORMATS.DATE) return iso;
    let t = withTime ? parseTime(time) : null;
    if (!t) t = isEnd ? END_OF_DAY : START_OF_DAY;
    const ts = isoTimeToTs(iso, t);
    if (format === OUTPUT_FORMATS.TIMESTAMP) return ts;
    // DATETIME: из timestamp обратно в локальные компоненты — так учитывается
    // сдвиг несуществующего времени при переходе на летнее время
    const d = new Date(ts);
    return `${isoOf(d)} ${hhmmOf(d)}:${pad(d.getSeconds())}`;
}

// Значение переменной (ISO, timestamp, числовая строка, Date, ISO с временем/поясом)
// → { iso: 'YYYY-MM-DD', time: 'HH:mm' | null } в локальном поясе, либо null.
export function parseInputDate(val) {
    if (val == null || val === '') return null;
    let d = null;
    if (val instanceof Date) {
        d = val;
    } else if (typeof val === 'number' || (typeof val === 'string' && /^\s*-?\d+(\.\d+)?\s*$/.test(val))) {
        const n = Number(val);
        if (!isFinite(n)) return null;
        d = new Date(Math.abs(n) < SECONDS_THRESHOLD ? n * 1000 : n);
    } else if (typeof val === 'string') {
        const s = val.trim();
        const m = /^(\d{4}-\d{2}-\d{2})(?:[T\s](\d{1,2}:\d{2}(?::\d{2}(?:\.\d+)?)?)\s*(Z|[+-]\d{2}:?\d{2})?)?$/i.exec(s);
        if (!m) return null;
        if (!m[2]) return splitIso(m[1]) ? { iso: m[1], time: null } : null;
        if (!m[3]) {
            // Время без пояса — считаем локальным
            const t = parseTime(m[2].replace(/(\.\d{3})\d+$/, '$1'));
            if (!t || !splitIso(m[1])) return null;
            return { iso: m[1], time: `${pad(t.h)}:${pad(t.m)}` };
        }
        // Явный пояс (Z / +03:00) — переводим в локальное время браузера
        d = new Date(`${m[1]}T${m[2].length === 4 ? '0' + m[2] : m[2]}${m[3].toUpperCase().replace(/^([+-]\d{2})(\d{2})$/, '$1:$2')}`);
    } else {
        return null;
    }
    if (!d || isNaN(d.getTime())) return null;
    return { iso: isoOf(d), time: hhmmOf(d) };
}

// Список дат из переменной (массив или JSON-строка массива; элементы — в любом
// формате, который понимает parseInputDate) → отсортированные уникальные ISO-даты.
// Пустое значение → []; не массив / битый JSON → null (выбор не трогаем).
export function parseInputDateList(val) {
    if (val == null || val === '') return [];
    let arr = val;
    if (typeof val === 'string') {
        try { arr = JSON.parse(val); } catch (e) { return null; }
    }
    if (!Array.isArray(arr)) return null;
    const set = new Set();
    arr.forEach((v) => {
        const p = parseInputDate(v);
        if (p) set.add(p.iso);
    });
    return Array.from(set).sort();
}
