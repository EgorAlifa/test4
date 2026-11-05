<template>
    <!-- Якорь остаётся в чипе; сам календарь переносится в <body>, чтобы его не обрезал
         контейнер виджета (overflow) и не перекрывали соседние виджеты (z-index) -->
    <div class="dpp-anchor">
        <div
            :id="popupId || null"
            ref="pop"
            class="compact__popup"
            :class="{ 'compact__popup--up': placeUp, 'compact__popup--time': withTime }"
            :style="popStyle"
            role="dialog"
            :aria-label="ariaLabel || null"
            @mousedown.prevent
            @focusout="onFocusOut"
            @keydown.esc.prevent.stop="$emit('escape')">
            <div class="compact__popup-main">
                <div class="compact__popup-head">
                    <button type="button" class="compact__popup-nav" tabindex="-1" :title="locale.prev" :aria-label="locale.prev" @click="shiftMonth(-1)">
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
                    </button>
                    <span class="compact__popup-title" aria-live="polite">{{ locale.months[viewMonth] }} {{ viewYear }}</span>
                    <button type="button" class="compact__popup-nav" tabindex="-1" :title="locale.next" :aria-label="locale.next" @click="shiftMonth(1)">
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
                    </button>
                </div>
                <!-- Фокус держит сама сетка (aria-activedescendant): кнопки дней пересоздаются при смене
                     месяца, и фокус на них терялся бы -->
                <div
                    ref="grid"
                    class="compact__popup-grid"
                    role="grid"
                    tabindex="0"
                    :aria-label="`${locale.months[viewMonth]} ${viewYear}`"
                    :aria-activedescendant="cellId(focusIso)"
                    @keydown="onGridKeydown">
                    <div class="compact__popup-row" role="row">
                        <span
                            v-for="(wd, i) in weekdayHeaders"
                            :key="`wd-${i}`"
                            class="compact__popup-wd"
                            :class="{ 'compact__popup-wd--weekend': wd.weekend }"
                            role="columnheader"
                            :aria-label="wd.full">{{ wd.short }}</span>
                    </div>
                    <div v-for="(week, wi) in weeks" :key="`w-${wi}`" class="compact__popup-row" role="row">
                        <button
                            v-for="cell in week"
                            :key="cell.iso"
                            :id="cellId(cell.iso)"
                            type="button"
                            role="gridcell"
                            class="compact__popup-day"
                            :class="dayClass(cell)"
                            tabindex="-1"
                            :aria-selected="cell.iso === value ? 'true' : 'false'"
                            :aria-label="cell.label"
                            :data-iso="cell.iso"
                            @click="onDayClick(cell)">{{ cell.d }}</button>
                    </div>
                </div>
                <div class="compact__popup-foot">
                    <button type="button" class="compact__popup-link" tabindex="-1" @click="onClear">{{ locale.clear }}</button>
                    <button type="button" class="compact__popup-link" tabindex="-1" @click="onToday">{{ locale.today }}</button>
                </div>
            </div>
            <!-- Время: две колонки 24 ч (ЧЧ и мм), без AM/PM -->
            <div v-if="withTime" class="compact__popup-time">
                <div ref="hours" class="compact__popup-col" role="listbox" :aria-label="locale.pickerHours">
                    <button
                        v-for="h in HOURS"
                        :key="`h-${h}`"
                        type="button"
                        role="option"
                        class="compact__popup-tm"
                        :class="{ 'compact__popup-tm--active': h === curHour }"
                        :aria-selected="h === curHour ? 'true' : 'false'"
                        tabindex="-1"
                        :data-h="h"
                        @click="onTimeClick(h, curMin)">{{ h }}</button>
                </div>
                <div ref="minutes" class="compact__popup-col" role="listbox" :aria-label="locale.pickerMinutes">
                    <button
                        v-for="m in MINUTES"
                        :key="`m-${m}`"
                        type="button"
                        role="option"
                        class="compact__popup-tm"
                        :class="{ 'compact__popup-tm--active': m === curMin }"
                        :aria-selected="m === curMin ? 'true' : 'false'"
                        tabindex="-1"
                        :data-m="m"
                        @click="onTimeClick(curHour, m)">{{ m }}</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
// Всплывающий календарь для чипов «С / По», когда мини-календарь виджета скрыт.
// Заменяет нативный пикер браузера: язык, первый день недели и 24-часовое время —
// только из настроек виджета.
//
// События:
//   pick({ iso, time, commit }) — выбран день/время; commit = true — сразу применить
//                                 (клик по дню без времени, Enter на дне, «Сегодня» без времени)
//   clear()   — «Очистить»
//   escape()  — Esc внутри календаря
//   leave()   — фокус ушёл из календаря и из поля ввода (клик/таб наружу)
const pad2 = (n) => String(n).padStart(2, '0');
const isoOf = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const parseIsoLocal = (s) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s || '');
    return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
};
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const HOURS = Array.from({ length: 24 }, (_, i) => pad2(i));
const MINUTES = Array.from({ length: 60 }, (_, i) => pad2(i));
const GAP = 4;

export default {
    name: 'DatePickerPopup',

    props: {
        // Текущее значение (черновик поля ввода или выбранная дата), ISO 'YYYY-MM-DD'
        value: { type: String, default: '' },
        time: { type: String, default: '00:00' },
        withTime: { type: Boolean, default: false },
        // Края выбранного диапазона — для подсветки
        rangeStart: { type: String, default: '' },
        rangeEnd: { type: String, default: '' },
        locale: { type: Object, required: true },
        firstDay: { type: Number, default: 1 },
        today: { type: Date, default: () => new Date() },
        // CSS-переменные виджета: календарь живёт в <body> и не наследует их от .elem-cal
        cssVars: { type: Object, default: () => ({}) },
        popupId: { type: String, default: '' },
        ariaLabel: { type: String, default: '' },
        // (el) => true, если el — поле ввода этого чипа (переход фокуса туда не закрывает календарь)
        isOwnInput: { type: Function, default: null }
    },

    data() {
        const base = parseIsoLocal(this.value) || this.today;
        return {
            HOURS,
            MINUTES,
            viewYear: base.getFullYear(),
            viewMonth: base.getMonth(),
            focusIso: isoOf(base),
            pos: { top: 0, left: 0 },
            placeUp: false,
            ready: false
        };
    },

    computed: {
        curHour() { return pad2(Number((this.time || '00:00').split(':')[0]) || 0); },
        curMin() { return pad2(Number((this.time || '00:00').split(':')[1]) || 0); },

        weekdayHeaders() {
            const res = [];
            for (let i = 0; i < 7; i++) {
                const dow = (i + this.firstDay) % 7;
                res.push({ short: this.locale.weekdaysShort[dow], full: this.locale.weekdays[dow], weekend: dow === 0 || dow === 6 });
            }
            return res;
        },

        // 6 недель: дни соседних месяцев приглушены, но кликабельны (как у нативного пикера)
        weeks() {
            const first = new Date(this.viewYear, this.viewMonth, 1);
            const offset = (first.getDay() - this.firstDay + 7) % 7;
            const start = addDays(first, -offset);
            const todayIso = isoOf(this.today);
            const gen = this.locale.monthsGenitive || this.locale.months;
            const weeks = [];
            for (let w = 0; w < 6; w++) {
                const row = [];
                for (let i = 0; i < 7; i++) {
                    const d = addDays(start, w * 7 + i);
                    const iso = isoOf(d);
                    row.push({
                        iso,
                        d: d.getDate(),
                        other: d.getMonth() !== this.viewMonth,
                        weekend: d.getDay() === 0 || d.getDay() === 6,
                        today: iso === todayIso,
                        label: `${d.getDate()} ${gen[d.getMonth()]} ${d.getFullYear()}`
                    });
                }
                weeks.push(row);
            }
            return weeks;
        },

        popStyle() {
            return {
                ...this.cssVars,
                top: `${this.pos.top}px`,
                left: `${this.pos.left}px`,
                visibility: this.ready ? 'visible' : 'hidden'
            };
        }
    },

    watch: {
        // Календарь следует за набранной в поле датой
        value(v) {
            const d = parseIsoLocal(v);
            if (!d) return;
            this.viewYear = d.getFullYear();
            this.viewMonth = d.getMonth();
            this.focusIso = v;
        },
        time() { this.$nextTick(this.scrollTimeIntoView); }
    },

    mounted() {
        document.body.appendChild(this.$refs.pop);
        this.reposition();
        this.ready = true;
        this.$nextTick(this.scrollTimeIntoView);
        this._onWin = () => this.reposition();
        window.addEventListener('resize', this._onWin);
        window.addEventListener('scroll', this._onWin, true);
    },

    beforeDestroy() {
        window.removeEventListener('resize', this._onWin);
        window.removeEventListener('scroll', this._onWin, true);
        const pop = this.$refs.pop;
        if (pop && pop.parentNode) pop.parentNode.removeChild(pop);
    },

    methods: {
        contains(el) {
            return Boolean(el && this.$refs.pop && this.$refs.pop.contains(el));
        },

        // Под чипом; если снизу не помещается, а сверху помещается — над чипом.
        // По горизонтали прижимается к краям окна.
        reposition() {
            const anchor = this.$el && this.$el.parentElement;
            const pop = this.$refs.pop;
            if (!anchor || !pop) return;
            const r = anchor.getBoundingClientRect();
            const w = pop.offsetWidth;
            const h = pop.offsetHeight;
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            const below = vh - r.bottom - GAP;
            const above = r.top - GAP;
            this.placeUp = below < h && above > below;
            const top = this.placeUp ? Math.max(GAP, r.top - GAP - h) : r.bottom + GAP;
            const left = Math.max(GAP, Math.min(r.left, vw - w - GAP));
            this.pos = { top: Math.round(top), left: Math.round(left) };
        },

        scrollTimeIntoView() {
            if (!this.withTime) return;
            [['hours', `[data-h="${this.curHour}"]`], ['minutes', `[data-m="${this.curMin}"]`]].forEach(([ref, sel]) => {
                const col = this.$refs[ref];
                const item = col && col.querySelector(sel);
                if (item) col.scrollTop = item.offsetTop - col.clientHeight / 2 + item.offsetHeight / 2;
            });
        },

        dayClass(cell) {
            const lo = this.rangeStart && this.rangeEnd && this.rangeStart <= this.rangeEnd ? this.rangeStart : '';
            const hi = lo ? this.rangeEnd : '';
            return {
                'compact__popup-day--other': cell.other,
                'compact__popup-day--weekend': cell.weekend,
                'compact__popup-day--today': cell.today,
                'compact__popup-day--selected': cell.iso === this.value,
                'compact__popup-day--in-range': Boolean(lo) && cell.iso > lo && cell.iso < hi,
                'compact__popup-day--edge': Boolean(lo) && (cell.iso === lo || cell.iso === hi) && cell.iso !== this.value,
                'compact__popup-day--focus': cell.iso === this.focusIso
            };
        },

        shiftMonth(n) {
            const d = new Date(this.viewYear, this.viewMonth + n, 1);
            this.viewYear = d.getFullYear();
            this.viewMonth = d.getMonth();
            // фокусная дата — тот же день в новом месяце (не дальше его конца)
            const cur = parseIsoLocal(this.focusIso) || d;
            const dim = new Date(this.viewYear, this.viewMonth + 1, 0).getDate();
            this.focusIso = isoOf(new Date(this.viewYear, this.viewMonth, Math.min(cur.getDate(), dim)));
        },

        moveFocus(days) {
            const cur = parseIsoLocal(this.focusIso) || this.today;
            const next = addDays(cur, days);
            this.focusIso = isoOf(next);
            this.viewYear = next.getFullYear();
            this.viewMonth = next.getMonth();
            this.$nextTick(this.focusDay);
        },

        cellId(iso) {
            return `${this.popupId || 'dpp'}-d-${iso}`;
        },

        // Фокус на сетку (ArrowDown из поля ввода); текущий день — aria-activedescendant
        focusDay() {
            if (this.$refs.grid) this.$refs.grid.focus();
        },

        onGridKeydown(e) {
            const map = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
            if (map[e.key] != null) {
                e.preventDefault();
                this.moveFocus(map[e.key]);
            } else if (e.key === 'PageUp' || e.key === 'PageDown') {
                e.preventDefault();
                this.shiftMonth(e.key === 'PageUp' ? -1 : 1);
                this.$nextTick(this.focusDay);
            } else if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.$emit('pick', { iso: this.focusIso, time: this.withTime ? `${this.curHour}:${this.curMin}` : null, commit: true });
            }
        },

        onDayClick(cell) {
            this.focusIso = cell.iso;
            // без времени — сразу применить; со временем — подставить дату и ждать выбора времени
            this.$emit('pick', { iso: cell.iso, time: this.withTime ? `${this.curHour}:${this.curMin}` : null, commit: !this.withTime });
        },

        onTimeClick(h, m) {
            const iso = this.value || isoOf(this.today);
            this.$emit('pick', { iso, time: `${h}:${m}`, commit: false });
        },

        onToday() {
            const iso = isoOf(this.today);
            this.focusIso = iso;
            this.$emit('pick', { iso, time: this.withTime ? `${this.curHour}:${this.curMin}` : null, commit: !this.withTime });
        },

        onClear() {
            this.$emit('clear');
        },

        onFocusOut(e) {
            const to = e.relatedTarget;
            if (this.contains(to)) return;
            if (this.isOwnInput && this.isOwnInput(to)) return;
            this.$emit('leave');
        }
    }
};
</script>

<style scoped>
.dpp-anchor { display: none; }

.compact__popup {
    position: fixed;
    z-index: 10000;
    display: flex;
    gap: 8px;
    padding: 10px;
    background: var(--cal-bg, #fff);
    color: #1e293b;
    border: 1px solid var(--cal-cell-border, #e8ecf4);
    border-radius: min(var(--cal-radius, 12px), 14px);
    box-shadow: 0 10px 32px rgba(15, 23, 42, 0.18), 0 2px 8px rgba(15, 23, 42, 0.08);
    font-family: var(--cal-font-family, inherit);
    font-size: 12px;
    line-height: 1.2;
    box-sizing: border-box;
    user-select: none;
}
.compact__popup *,
.compact__popup *::before,
.compact__popup *::after { box-sizing: border-box; }

.compact__popup-main { display: flex; flex-direction: column; gap: 6px; width: 224px; }

.compact__popup-head { display: flex; align-items: center; gap: 4px; }
.compact__popup-title { flex: 1; text-align: center; font-weight: 700; font-size: 13px; }
.compact__popup-nav {
    width: 26px;
    height: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0;
    padding: 0;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: inherit;
    cursor: pointer;
}
.compact__popup-nav:hover { background: var(--cal-cell-hover-bg, #f5f7ff); color: var(--cal-accent, #4f6aff); }

.compact__popup-grid { display: flex; flex-direction: column; gap: 2px; }
.compact__popup-row { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; }
.compact__popup-wd {
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 700;
    color: #94a3b8;
}
.compact__popup-wd--weekend { color: var(--cal-weekend-color, #ef4444); }

.compact__popup-day {
    height: 28px;
    margin: 0;
    padding: 0;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: inherit;
    font: inherit;
    font-variant-numeric: tabular-nums;
    cursor: pointer;
    outline: none;
}
.compact__popup-day:hover { background: var(--cal-cell-hover-bg, #f5f7ff); }
.compact__popup-day--weekend { color: var(--cal-weekend-color, #ef4444); }
.compact__popup-day--other { opacity: 0.4; }
.compact__popup-day--today { box-shadow: inset 0 0 0 1.5px var(--cal-accent, #4f6aff); font-weight: 700; }
.compact__popup-day--in-range { background: var(--cal-range-bg, rgba(79, 106, 255, 0.1)); border-radius: 0; }
.compact__popup-day--edge { background: var(--cal-range-bg, rgba(79, 106, 255, 0.1)); font-weight: 700; }
.compact__popup-day--selected,
.compact__popup-day--selected:hover {
    background: var(--cal-selected-bg, #4f6aff);
    color: var(--cal-selected-color, #fff);
    font-weight: 700;
    opacity: 1;
}
.compact__popup-grid { outline: none; }
.compact__popup-grid:focus .compact__popup-day--focus { box-shadow: 0 0 0 2px var(--cal-accent, #4f6aff); }

.compact__popup-foot { display: flex; justify-content: space-between; }
.compact__popup-link {
    margin: 0;
    padding: 4px 6px;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: var(--cal-accent, #4f6aff);
    font: inherit;
    font-weight: 600;
    cursor: pointer;
}
.compact__popup-link:hover { background: var(--cal-cell-hover-bg, #f5f7ff); }

.compact__popup-time {
    display: flex;
    gap: 4px;
    padding-left: 8px;
    border-left: 1px solid var(--cal-cell-border, #e8ecf4);
}
.compact__popup-col {
    width: 40px;
    height: 236px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 2px;
    scrollbar-width: thin;
}
.compact__popup-tm {
    flex-shrink: 0;
    height: 26px;
    margin: 0;
    padding: 0;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: inherit;
    font: inherit;
    font-variant-numeric: tabular-nums;
    cursor: pointer;
}
.compact__popup-tm:hover { background: var(--cal-cell-hover-bg, #f5f7ff); }
.compact__popup-tm--active,
.compact__popup-tm--active:hover {
    background: var(--cal-selected-bg, #4f6aff);
    color: var(--cal-selected-color, #fff);
    font-weight: 700;
}
</style>
