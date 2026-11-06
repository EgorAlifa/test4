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

// Пустое значение переменной (сбрасывает выбор). Нераспознанное непустое
// значение выбор НЕ сбрасывает — его просто игнорируем.
export function isEmptyInput(val) {
    return val == null || val === '';
}

// Пустой список дат (сбрасывает выбор multi): пустое значение, [] или JSON-строка '[]' / '[ ]'.
// Непустой список, в котором ничего не распознано, пустым НЕ считается.
export function isEmptyListInput(val) {
    if (isEmptyInput(val)) return true;
    if (Array.isArray(val)) return val.length === 0;
    if (typeof val === 'string') {
        try {
            const arr = JSON.parse(val);
            return Array.isArray(arr) && arr.length === 0;
        } catch (e) { return false; }
    }
    return false;
}

// Время по умолчанию из настроек → 'HH:mm'; некорректное (например, '25:99' из старого
// конфига) заменяется на fallback, чтобы подпись чипа и значение в переменной совпадали.
export function normalizeTime(time, fallback) {
    const t = parseTime(time);
    return t ? `${pad(t.h)}:${pad(t.m)}` : fallback;
}

// Числа с модулем меньше этого порога — не timestamp (8 цифр и меньше)
const MIN_TIMESTAMP = 1e8;

// '+03' | '+0300' | '+03:00' | 'Z' | 'UTC' | 'GMT' → '+03:00' / 'Z' (для new Date)
function normalizeZone(z) {
    const up = z.toUpperCase();
    if (up === 'Z' || up === 'UTC' || up === 'GMT') return 'Z';
    const m = /^([+-]\d{2}):?(\d{2})?$/.exec(up);
    return m ? `${m[1]}:${m[2] || '00'}` : null;
}

// Литеральные дата и время → { iso, time } (время как есть, без пересчёта пояса)
function literal(iso, timeStr) {
    if (!splitIso(iso)) return null;
    if (!timeStr) return { iso, time: null };
    const t = parseTime(timeStr.replace(/(\.\d{3})\d+$/, '$1'));
    return t ? { iso, time: `${pad(t.h)}:${pad(t.m)}` } : { iso, time: null };
}

// Значение переменной → { iso: 'YYYY-MM-DD', time: 'HH:mm' | null } или null (не распознано).
// Понимает:
//   - timestamp: число или числовая строка от 9 цифр (меньше 1e11 — секунды, иначе мс), Date;
//   - 'YYYYMMDD' (8 цифр, строка или число);
//   - 'YYYY-MM-DD', 'YYYY-MM-DD[T ]HH:mm[:ss[.SSS]]' — локальное время;
//   - то же с поясом: Z, UTC, GMT, ±HH, ±HHMM, ±HH:MM, хвост '[Europe/Moscow]';
//     IANA-имя в скобках не разбирается: '…T10:00:00[Europe/Moscow]' без смещения
//     читается как локальное время браузера (смещение берётся только из ±HH:MM / Z);
//   - 'DD.MM.YYYY' и 'DD.MM.YYYY HH:mm[:ss]' — локальное время;
//   - любая другая строка, начинающаяся с корректной 'YYYY-MM-DD', — берётся только дата.
// options.convertZone (по умолчанию true): строку с явным поясом переводить в локальное
// время браузера (дата может сместиться). false — брать дату и время из строки буквально
// (режим «только дата»: '2026-11-05T00:00:00Z' остаётся 5 ноября в любом поясе).
export function parseInputDate(val, { convertZone = true } = {}) {
    if (isEmptyInput(val)) return null;
    let d = null;
    if (val instanceof Date) {
        d = val;
    } else if (typeof val === 'number' || (typeof val === 'string' && /^\s*-?\d+(\.\d+)?\s*$/.test(val))) {
        const str = String(val).trim();
        if (/^\d{8}$/.test(str)) {
            return literal(`${str.slice(0, 4)}-${str.slice(4, 6)}-${str.slice(6, 8)}`, null);
        }
        const n = Number(str);
        if (!isFinite(n) || Math.abs(n) < MIN_TIMESTAMP) return null;
        d = new Date(Math.abs(n) < SECONDS_THRESHOLD ? n * 1000 : n);
    } else if (typeof val === 'string') {
        const s = val.trim();
        const ru = /^(\d{1,2})\.(\d{1,2})\.(\d{4})(?:\s+(\d{1,2}:\d{2}(?::\d{2})?))?$/.exec(s);
        if (ru) return literal(`${ru[3]}-${pad(ru[2])}-${pad(ru[1])}`, ru[4]);
        const m = /^(\d{4}-\d{2}-\d{2})(?:[T\s](\d{1,2}:\d{2}(?::\d{2}(?:\.\d+)?)?)\s*(Z|UTC|GMT|[+-]\d{2}(?::?\d{2})?)?)?\s*(?:\[[^\]]*\])?$/i.exec(s);
        if (!m) {
            // Неизвестный хвост — как раньше, берём только дату из первых 10 символов
            const head = /^(\d{4}-\d{2}-\d{2})/.exec(s);
            return head ? literal(head[1], null) : null;
        }
        const zone = m[3] ? normalizeZone(m[3]) : null;
        if (!m[2] || !zone || !convertZone) return literal(m[1], m[2]);
        const time = m[2].length === 4 ? `0${m[2]}` : m[2];
        d = new Date(`${m[1]}T${time}${zone}`);
    } else {
        return null;
    }
    if (!d || isNaN(d.getTime())) return null;
    return { iso: isoOf(d), time: hhmmOf(d) };
}

// Список дат из переменной (массив или JSON-строка массива; элементы — в любом
// формате, который понимает parseInputDate) → отсортированные уникальные ISO-даты.
// Пустое значение → []; не массив / битый JSON → null (выбор не трогаем).
// Нераспознанные элементы пропускаются. options — как у parseInputDate.
export function parseInputDateList(val, options) {
    if (val == null || val === '') return [];
    let arr = val;
    if (typeof val === 'string') {
        try { arr = JSON.parse(val); } catch (e) { return null; }
    }
    if (!Array.isArray(arr)) return null;
    const set = new Set();
    arr.forEach((v) => {
        const p = parseInputDate(v, options);
        if (p) set.add(p.iso);
    });
    return Array.from(set).sort();
}

// ── Режим 'auto': формат по значению, которое уже лежит в переменной ──────────
//
// detectValueFormat(value) → описание формата или null (пусто / не распознано / Date):
//   { kind: 'timestamp', unit: 'ms' | 's', type: 'number' | 'string' }
//       число или числовая строка: < 1e11 — секунды (10 цифр), иначе мс (13 цифр);
//       timestamp в мс до 1973-03-03 (< 1e11) поэтому считается секундами — осознанно;
//   { kind: 'datetime', sep: ' ' | 'T', seconds, ms }   'YYYY-MM-DD HH:mm[:ss[.SSS]]' без пояса;
//   { kind: 'iso', sep, seconds, ms, zone: 'Z' | 'offset', offsetStyle: 'colon' | 'compact' | 'hours' }
//       'YYYY-MM-DDTHH:mm[:ss][.SSS]' с Z (UTC, GMT) или ±hh:mm / ±hhmm / ±hh;
//   { kind: 'date' }                                    'YYYY-MM-DD';
//   { kind: 'yyyymmdd', type: 'number' | 'string' }     8 цифр;
//   { kind: 'ddmmyyyy', time, seconds }                 'DD.MM.YYYY[ HH:mm[:ss]]';
//   { kind: 'list', container: 'array' | 'json', item } список дат; item — формат первого
//       распознанного элемента. Пустой список или список без распознанных дат → null.
function detectScalarFormat(val) {
    if (typeof val === 'number' || (typeof val === 'string' && /^\s*\d+\s*$/.test(val))) {
        const type = typeof val === 'number' ? 'number' : 'string';
        const str = String(val).trim();
        if (!isFinite(Number(str))) return null;
        if (/^\d{8}$/.test(str)) return parseInputDate(str) ? { kind: 'yyyymmdd', type } : null;
        const n = Number(str);
        if (n < MIN_TIMESTAMP || !Number.isInteger(n)) return null;
        return { kind: 'timestamp', unit: n < SECONDS_THRESHOLD ? 's' : 'ms', type };
    }
    if (typeof val !== 'string') return null;
    const s = val.trim();
    const ru = /^(\d{1,2})\.(\d{1,2})\.(\d{4})(?:\s+(\d{1,2}:\d{2})(:\d{2})?)?$/.exec(s);
    if (ru) return parseInputDate(s) ? { kind: 'ddmmyyyy', time: Boolean(ru[4]), seconds: Boolean(ru[5]) } : null;
    const m = /^(\d{4}-\d{2}-\d{2})(?:([T\s])(\d{1,2}:\d{2})(:\d{2})?(\.\d+)?\s*(Z|UTC|GMT|[+-]\d{2}(?::?\d{2})?)?)?$/i.exec(s);
    if (!m || !parseInputDate(s, { convertZone: false })) return null;
    if (!m[2]) return { kind: 'date' };
    if (!parseTime(m[3])) return null;
    const base = { sep: m[2] === 'T' ? 'T' : ' ', seconds: Boolean(m[4]), ms: Boolean(m[5]) };
    if (!m[6]) return { kind: 'datetime', ...base };
    const z = m[6].toUpperCase();
    if (z === 'Z' || z === 'UTC' || z === 'GMT') return { kind: 'iso', ...base, zone: 'Z' };
    const offsetStyle = z.includes(':') ? 'colon' : (z.length === 3 ? 'hours' : 'compact');
    return { kind: 'iso', ...base, zone: 'offset', offsetStyle };
}

export function detectValueFormat(val) {
    if (isEmptyInput(val) || val instanceof Date) return null;
    let arr = null;
    let container = null;
    if (Array.isArray(val)) {
        arr = val;
        container = 'array';
    } else if (typeof val === 'string' && /^\s*\[/.test(val)) {
        try { arr = JSON.parse(val); } catch (e) { return null; }
        if (!Array.isArray(arr)) return null;
        container = 'json';
    }
    if (arr) {
        for (const v of arr) {
            const item = detectScalarFormat(v);
            if (item) return { kind: 'list', container, item };
        }
        return null;
    }
    return detectScalarFormat(val);
}

// Есть ли в формате время (дата, ГГГГММДД и ДД.ММ.ГГГГ без времени — нет)
export function valueFormatHasTime(desc) {
    if (!desc) return false;
    if (desc.kind === 'list') return valueFormatHasTime(desc.item);
    if (desc.kind === 'date' || desc.kind === 'yyyymmdd') return false;
    if (desc.kind === 'ddmmyyyy') return Boolean(desc.time);
    return true;
}

// Имя формата для панели: 'date' | 'timestamp' | 'timestamp_s' | 'datetime' | 'iso' | 'ddmmyyyy' | 'yyyymmdd'
export function formatName(desc) {
    if (!desc) return null;
    if (desc.kind === 'list') return formatName(desc.item);
    if (desc.kind === 'timestamp') return desc.unit === 's' ? 'timestamp_s' : 'timestamp';
    return desc.kind;
}

// Одинаковые ли описания формата
export function sameValueFormat(a, b) {
    return JSON.stringify(a || null) === JSON.stringify(b || null);
}

// Точность формата: 'ms' | 's' | 'min' | 'day' — от неё зависит «конец дня»
// (23:59:59.999 / 23:59:59 / 23:59)
function precisionOf(desc) {
    switch (desc.kind) {
        case 'timestamp': return desc.unit === 'ms' ? 'ms' : 's';
        case 'datetime':
        case 'iso': return desc.ms ? 'ms' : (desc.seconds ? 's' : 'min');
        case 'ddmmyyyy': return desc.seconds ? 's' : 'min';
        default: return 'day';
    }
}

// Смещение локального пояса на момент d в стиле исходного значения
function offsetText(d, style) {
    const off = -d.getTimezoneOffset();
    const sign = off < 0 ? '-' : '+';
    const hh = pad(Math.floor(Math.abs(off) / 60));
    const mm = pad(Math.abs(off) % 60);
    if (style === 'hours' && mm === '00') return `${sign}${hh}`;
    if (style === 'compact') return `${sign}${hh}${mm}`;
    return `${sign}${hh}:${mm}`;
}

// Дата в формате desc (см. detectValueFormat).
//   iso      — 'YYYY-MM-DD'; пусто / некорректно → null
//   time     — выбранное время 'HH:mm' (учитывается только при withTime)
//   withTime — выбор времени включён; иначе начало — 00:00:00, конец (isEnd) — 23:59:59
//              с точностью формата (.999 для мс; 23:59 для формата без секунд)
export function formatAs(desc, iso, time, { withTime = false, isEnd = false } = {}) {
    if (!desc || !iso || !splitIso(iso)) return null;
    if (desc.kind === 'list') return formatAs(desc.item, iso, time, { withTime, isEnd });
    if (desc.kind === 'date') return iso;
    if (desc.kind === 'yyyymmdd') {
        const s = iso.replace(/-/g, '');
        return desc.type === 'number' ? Number(s) : s;
    }
    const [y, mo, dd] = splitIso(iso);
    if (desc.kind === 'ddmmyyyy' && !desc.time) return `${pad(dd)}.${pad(mo)}.${y}`;
    const prec = precisionOf(desc);
    let t = withTime ? parseTime(time) : null;
    if (t) t = { ...t, s: 0, ms: 0 };
    else if (isEnd) t = { h: 23, m: 59, s: prec === 'min' ? 0 : 59, ms: prec === 'ms' ? 999 : 0 };
    else t = START_OF_DAY;
    const ts = isoTimeToTs(iso, t);
    const d = new Date(ts);
    if (desc.kind === 'timestamp') {
        const n = desc.unit === 's' ? Math.floor(ts / 1000) : ts;
        return desc.type === 'string' ? String(n) : n;
    }
    // Время с точностью формата
    const tail = (h, m, s, ms) => {
        let out = `${pad(h)}:${pad(m)}`;
        if (prec === 's' || prec === 'ms') out += `:${pad(s)}`;
        if (prec === 'ms') out += `.${pad(ms, 3)}`;
        return out;
    };
    if (desc.kind === 'ddmmyyyy') {
        return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${tail(d.getHours(), d.getMinutes(), d.getSeconds(), 0)}`;
    }
    if (desc.kind === 'iso' && desc.zone === 'Z') {
        const u = `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
        return `${u}${desc.sep}${tail(d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds(), d.getUTCMilliseconds())}Z`;
    }
    const local = `${isoOf(d)}${desc.sep}${tail(d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds())}`;
    if (desc.kind === 'iso') return `${local}${offsetText(d, desc.offsetStyle)}`;
    return local; // datetime
}

// Список дат в контейнере из desc ({ kind: 'list', container }): массив или JSON-строка.
// values — уже отформатированные элементы. Пустой список → null.
export function formatListAs(desc, values) {
    const list = values.filter((v) => v != null && v !== '');
    if (!list.length) return null;
    return desc && desc.container === 'json' ? JSON.stringify(list) : list;
}
