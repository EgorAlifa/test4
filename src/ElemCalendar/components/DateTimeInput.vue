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
        :aria-label="ariaLabel || null"
        :aria-invalid="invalid ? 'true' : null"
        :title="invalid ? invalidTitle : null"
        @input="onInput"
        @keydown="onKeydown"
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
//   cancel() — Esc или потеря фокуса с пустым/неполным/некорректным вводом
//              (прежнее значение сохраняется, редактор закрывается)
//   finish({ viaKey }) — после commit/cancel; viaKey = true для Enter/Esc
//              (родитель возвращает фокус на чип; при потере фокуса — не трогает)
//   draft({ iso, time } | null) — текущий текст разобран (для всплывающего календаря)
// Методы для всплывающего календаря: setValue(iso, time), commitByKey(), cancelByKey(),
// blurCommit(). Проп blurGuard(el) → true, если фокус ушёл «к своим» (в календарь) —
// тогда потеря фокуса не закрывает редактор.
// Enter с некорректным вводом оставляет поле открытым, в фокусе и подсвеченным красным.
//
// Клавиатура: Backspace/Delete удаляют ближайшую цифру (разделители маски пропускаются),
// цифра перед существующей цифрой заменяет её (без сдвига остальных), в конце — дописывается.
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
        // (relatedTarget) => true, если фокус перешёл в связанный элемент (всплывающий календарь)
        blurGuard: { type: Function, default: null },
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
        text: {
            immediate: true,
            handler() { this.$emit('draft', this.parse()); }
        },
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
                this.setDigits(raw.replace(/\D/g, ''), digitsBefore);
                return;
            }
            this.text = next;
            el.value = next;
            this.invalid = false;
        },

        // Backspace/Delete и замена цифр в заполненном поле — сами, чтобы маска
        // не возвращала удалённый разделитель и каретку на место
        onKeydown(e) {
            const el = e.target;
            if (e.ctrlKey || e.metaKey || e.altKey) return;
            const start = el.selectionStart;
            if (start == null || start !== el.selectionEnd) return; // выделение — штатно, затем onInput
            const digits = el.value.replace(/\D/g, '');
            const k = el.value.slice(0, start).replace(/\D/g, '').length; // цифр слева от каретки
            if (e.key === 'Backspace') {
                e.preventDefault();
                if (k === 0) return;
                this.setDigits(digits.slice(0, k - 1) + digits.slice(k), k - 1);
            } else if (e.key === 'Delete') {
                e.preventDefault();
                if (k >= digits.length) return;
                this.setDigits(digits.slice(0, k) + digits.slice(k + 1), k);
            } else if (/^\d$/.test(e.key)) {
                if (k < digits.length) {
                    // каретка перед цифрой — замена, чтобы не сдвигать день/месяц/время
                    e.preventDefault();
                    this.setDigits(digits.slice(0, k) + e.key + digits.slice(k + 1), k + 1);
                } else if (digits.length >= maskDigitCount(this.fullMask)) {
                    e.preventDefault();
                }
                // иначе — штатная вставка в конец, затем onInput
            }
        },

        // Раскладывает цифры по маске и ставит каретку после digitsBefore цифр
        setDigits(rawDigits, digitsBefore) {
            const el = this.$refs.input;
            const next = applyMask(rawDigits.slice(0, maskDigitCount(this.fullMask)), this.fullMask);
            this.text = next;
            this.invalid = false;
            if (!el) return;
            el.value = next;
            let pos = 0;
            let seen = 0;
            while (pos < next.length && seen < digitsBefore) {
                if (/\d/.test(next[pos])) seen++;
                pos++;
            }
            if (document.activeElement === el) el.setSelectionRange(pos, pos);
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
            if (!this.text.trim()) { this.finish('cancel', null, true); return; }
            const parsed = this.parse();
            if (!parsed) { this.invalid = true; return; }
            this.finish('commit', parsed, true);
        },

        onEsc() {
            if (this.done) return;
            this.finish('cancel', null, true);
        },

        onBlur(e) {
            if (this.done) return;
            if (this.blurGuard && e && this.blurGuard(e.relatedTarget)) return;
            this.blurCommit();
        },

        // Логика потери фокуса: корректное значение — commit, иначе — cancel
        blurCommit() {
            if (this.done) return;
            // фокус ушёл: корректное значение применяем, иначе — отмена (прежнее значение,
            // редактор закрывается), чтобы не оставалось «осиротевшего» открытого поля
            const parsed = this.text.trim() ? this.parse() : null;
            if (parsed) this.finish('commit', parsed, false);
            else this.finish('cancel', null, false);
        },

        // Значение, выбранное во всплывающем календаре: только текст, без commit
        setValue(iso, time) {
            if (this.done || !iso) return;
            const current = this.parse();
            const t = time || (current && current.time) || this.time || '00:00';
            this.text = formatByMask(iso, this.fullMask, t);
            this.invalid = false;
        },

        commitByKey() { this.onEnter(); },

        cancelByKey() { this.onEsc(); },

        finish(event, payload, viaKey) {
            this.done = true;
            this.invalid = false;
            if (event === 'commit') this.$emit('commit', payload);
            else this.$emit('cancel');
            this.$emit('finish', { viaKey: Boolean(viaKey) });
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
