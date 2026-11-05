<template>
    <input
        ref="input"
        type="text"
        inputmode="numeric"
        autocomplete="off"
        spellcheck="false"
        class="dt-input"
        :class="{ 'dt-input--invalid': invalid }"
        :value="text"
        :placeholder="placeholderText"
        :maxlength="fullMask.length"
        :aria-label="ariaLabel || null"
        :aria-invalid="invalid ? 'true' : null"
        :title="invalid ? invalidTitle : null"
        @input="onInput"
        @keydown.enter.prevent="onEnter"
        @keydown.esc.prevent.stop="onEsc"
        @blur="onBlur"
        @click.stop />
</template>

<script>
import { applyMask, formatByMask, parseByMask, maskDigitCount } from '../dateFormat';

// Поле ввода даты (и времени) с маской, без нативного пикера браузера.
// Формат даты задаётся маской из настроек виджета (LOCALE_DATA[calLocale].dateMask),
// время — всегда 24-часовое ЧЧ:мм. Локаль браузера ни на что не влияет.
//
// События:
//   commit({ iso: 'YYYY-MM-DD', time: 'HH:mm' }) — Enter или потеря фокуса при корректном вводе
//   cancel() — Esc, потеря фокуса при пустом/некорректном вводе (прежнее значение сохраняется)
const ISO_PASTE_RE = /^\s*(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2}))?/;

export default {
    name: 'DateTimeInput',

    props: {
        // Текущая дата в ISO 'YYYY-MM-DD' (или '')
        value: { type: String, default: '' },
        // Текущее время 'HH:mm' (используется при withTime)
        time: { type: String, default: '00:00' },
        withTime: { type: Boolean, default: false },
        // Маска даты локали виджета, например 'DD.MM.YYYY' или 'MM/DD/YYYY'
        dateMask: { type: String, default: 'DD.MM.YYYY' },
        // Подсказка формата даты, например 'ДД.ММ.ГГГГ'
        datePlaceholder: { type: String, default: '' },
        // Подсказка формата времени, например 'ЧЧ:ММ'
        timePlaceholder: { type: String, default: '' },
        invalidTitle: { type: String, default: '' },
        ariaLabel: { type: String, default: '' }
    },

    data() {
        return {
            text: '',
            invalid: false,
            // Защита от повторной обработки (Enter → закрытие → blur)
            done: false
        };
    },

    computed: {
        fullMask() {
            return this.withTime ? `${this.dateMask} HH:mm` : this.dateMask;
        },
        placeholderText() {
            const date = this.datePlaceholder || this.dateMask;
            if (!this.withTime) return date;
            return `${date} ${this.timePlaceholder || 'HH:mm'}`;
        }
    },

    watch: {
        value: 'syncFromProps',
        time: 'syncFromProps',
        withTime: 'syncFromProps',
        dateMask: 'syncFromProps'
    },

    created() {
        this.syncFromProps();
    },

    methods: {
        syncFromProps() {
            this.text = formatByMask(this.value, this.fullMask, this.time || '00:00');
            this.invalid = false;
            this.done = false;
        },

        focus() {
            const el = this.$refs.input;
            if (!el) return;
            el.focus();
            el.select();
        },

        onInput(e) {
            const el = e.target;
            const raw = el.value;
            let next;
            const iso = ISO_PASTE_RE.exec(raw);
            if (iso) {
                // Вставка ISO-строки (2026-11-05 / 2026-11-05T10:30) — переводим в формат виджета
                const t = iso[4] ? `${iso[4]}:${iso[5]}` : (this.time || '00:00');
                next = formatByMask(`${iso[1]}-${iso[2]}-${iso[3]}`, this.fullMask, t);
            } else {
                const caret = el.selectionStart == null ? raw.length : el.selectionStart;
                const digitsBefore = raw.slice(0, caret).replace(/\D/g, '').length;
                const digits = raw.replace(/\D/g, '').slice(0, maskDigitCount(this.fullMask));
                next = applyMask(digits, this.fullMask);
                this.text = next;
                el.value = next;
                // Каретка — после того же количества цифр, что и до форматирования
                let pos = 0;
                let seen = 0;
                while (pos < next.length && seen < digitsBefore) {
                    if (/\d/.test(next[pos])) seen++;
                    pos++;
                }
                if (document.activeElement === el) el.setSelectionRange(pos, pos);
                this.invalid = false;
                return;
            }
            this.text = next;
            el.value = next;
            this.invalid = false;
        },

        // Разбор текущего текста. При withTime допускается ввод только даты —
        // тогда сохраняется текущее время.
        parse() {
            const full = parseByMask(this.text, this.fullMask);
            if (full) return { iso: full.iso, time: full.time || this.time || '00:00' };
            if (this.withTime) {
                const dateOnly = parseByMask(this.text, this.dateMask);
                if (dateOnly) return { iso: dateOnly.iso, time: this.time || '00:00' };
            }
            return null;
        },

        onEnter() {
            if (this.done) return;
            if (!this.text.trim()) { this.finish('cancel'); return; }
            const parsed = this.parse();
            if (!parsed) { this.invalid = true; return; }
            this.finish('commit', parsed);
        },

        onEsc() {
            if (this.done) return;
            this.finish('cancel');
        },

        onBlur() {
            if (this.done) return;
            const parsed = this.text.trim() ? this.parse() : null;
            if (parsed) this.finish('commit', parsed);
            else this.finish('cancel');
        },

        finish(event, payload) {
            this.done = true;
            this.invalid = false;
            if (event === 'commit') this.$emit('commit', payload);
            else this.$emit('cancel');
        }
    }
};
</script>

<style scoped>
.dt-input {
    flex: 1;
    min-width: 0;
    width: 100%;
    border: none;
    border-radius: 4px;
    background: transparent;
    outline: none;
    font: inherit;
    font-size: 11px;
    font-weight: 500;
    font-variant-numeric: tabular-nums;
    color: #334155;
    cursor: text;
    padding: 0;
    box-shadow: none;
}
.dt-input::placeholder {
    color: #94a3b8;
    font-weight: 400;
}
.dt-input--invalid {
    color: #dc2626;
    box-shadow: 0 0 0 1.5px #ef4444;
}
</style>
