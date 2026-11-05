// ── Форматирование и разбор дат по маске локали виджета ─────────────
// Формат задаётся только настройками виджета (LOCALE_DATA[calLocale].dateMask),
// а не локалью браузера. Время — всегда 24-часовое ЧЧ:мм.
// Токены маски: DD — день, MM — месяц, YYYY — год, YY — год (2 цифры),
// HH — часы (00–23), mm — минуты. Остальные символы — разделители.

const TOKEN_RE = /YYYY|YY|DD|MM|HH|mm/g;

const pad2 = (n) => String(n).padStart(2, '0');

// Разбивает маску на токены и литералы: [{ token: 'DD', len: 2 } | { literal: '.' }]
function tokenize(mask) {
    const parts = [];
    let last = 0;
    let m;
    TOKEN_RE.lastIndex = 0;
    while ((m = TOKEN_RE.exec(mask)) !== null) {
        if (m.index > last) parts.push({ literal: mask.slice(last, m.index) });
        parts.push({ token: m[0], len: m[0].length });
        last = m.index + m[0].length;
    }
    if (last < mask.length) parts.push({ literal: mask.slice(last) });
    return parts;
}

// Количество цифр, которое вмещает маска
export function maskDigitCount(mask) {
    return tokenize(mask).reduce((sum, p) => sum + (p.token ? p.len : 0), 0);
}

// ISO 'YYYY-MM-DD' (+ опционально 'HH:mm') → строка по маске
export function formatByMask(iso, mask, time) {
    if (!iso || typeof iso !== 'string') return '';
    const [y, mo, d] = iso.slice(0, 10).split('-');
    if (!y || !mo || !d) return '';
    const [h, mi] = (time || '00:00').split(':');
    const values = { YYYY: y, YY: y.slice(-2), MM: mo, DD: d, HH: pad2(+h || 0), mm: pad2(+mi || 0) };
    return mask.replace(TOKEN_RE, (t) => values[t]);
}

// Раскладывает введённые цифры по маске: разделители подставляются автоматически,
// но только если за ними уже есть цифры (чтобы Backspace работал естественно).
export function applyMask(digits, mask) {
    const parts = tokenize(mask);
    let out = '';
    let i = 0;
    for (let p = 0; p < parts.length; p++) {
        const part = parts[p];
        if (part.literal) {
            if (i < digits.length) out += part.literal;
            else break;
        } else {
            const chunk = digits.slice(i, i + part.len);
            out += chunk;
            i += chunk.length;
            if (chunk.length < part.len) break;
        }
    }
    return out;
}

// Разбор строки по маске. Возвращает { iso, time } или null, если ввод неполный/некорректный.
// time === null, если в маске нет времени.
export function parseByMask(str, mask) {
    if (!str) return null;
    const digits = String(str).replace(/\D/g, '');
    if (digits.length !== maskDigitCount(mask)) return null;
    const values = {};
    let i = 0;
    tokenize(mask).forEach((p) => {
        if (!p.token) return;
        values[p.token] = Number(digits.slice(i, i + p.len));
        i += p.len;
    });
    const y = values.YYYY;
    const mo = values.MM;
    const d = values.DD;
    if (!(y >= 1000) || !(mo >= 1 && mo <= 12)) return null;
    const dim = new Date(y, mo, 0).getDate();
    if (!(d >= 1 && d <= dim)) return null;
    const iso = `${y}-${pad2(mo)}-${pad2(d)}`;
    if (!('HH' in values)) return { iso, time: null };
    const h = values.HH;
    const mi = values.mm;
    if (!(h >= 0 && h <= 23) || !(mi >= 0 && mi <= 59)) return null;
    return { iso, time: `${pad2(h)}:${pad2(mi)}` };
}
