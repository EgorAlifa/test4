<template>
    <w-elem>
    <div class="elem-cal" :class="calDynamicClass" :style="[cssStyle, calCssVars]">
        <!-- ── Header ──────────────────────────────────────────────── -->
        <div v-if="props.calShowHeader" class="elem-cal__header">
            <div class="elem-cal__nav">
                <button class="elem-cal__nav-btn" title="Назад" @click="prevPeriod">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M10 12L6 8l4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
                <button
                    v-if="props.calShowTodayBtn"
                    class="elem-cal__today-btn"
                    @click="goToday">
                    {{ locale.today }}
                </button>
                <button class="elem-cal__nav-btn" title="Вперёд" @click="nextPeriod">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            </div>

            <div class="elem-cal__title-wrap">
                <h2 class="elem-cal__title">{{ currentTitle }}</h2>
            </div>

            <div v-if="props.calShowViewSwitcher" class="elem-cal__view-switch">
                <button
                    v-for="v in availableViewsList"
                    :key="v"
                    class="elem-cal__view-btn"
                    :class="{ 'elem-cal__view-btn--active': currentView === v }"
                    @click="setView(v)">
                    {{ locale.views[v] }}
                </button>
            </div>
        </div>

        <!-- ── Month view ──────────────────────────────────────────── -->
        <div v-if="currentView === 'month'" class="elem-cal__month">
            <div class="elem-cal__weekrow">
                <div v-if="props.calShowWeekNumbers" class="elem-cal__wnum-hd" />
                <div
                    v-for="(d, i) in weekdayHeaders"
                    :key="i"
                    class="elem-cal__weekday"
                    :class="{ 'elem-cal__weekday--weekend': isWeekendCol(i) }">
                    {{ d }}
                </div>
            </div>
            <div class="elem-cal__grid">
                <template v-for="(week, wi) in monthWeeks">
                    <div v-if="props.calShowWeekNumbers" :key="`wn-${wi}`" class="elem-cal__wnum">
                        {{ week.num }}
                    </div>
                    <div
                        v-for="day in week.days"
                        :key="day.key"
                        class="elem-cal__cell"
                        :class="dayCellClass(day)"
                        @click="onDayClick(day)"
                        @mouseenter="onDayHover(day)">
                        <div class="elem-cal__cell-inner">
                            <span class="elem-cal__day-num">{{ day.d }}</span>
                            <div class="elem-cal__events-wrap">
                                <div
                                    v-for="ev in day.events.slice(0, maxEventsPerCell)"
                                    :key="ev.id"
                                    class="elem-cal__event"
                                    :style="eventStyle(ev)"
                                    :title="ev.title"
                                    @click.stop="onEventClick(ev)">
                                    <span class="elem-cal__event-dot" :style="{ background: ev.color || props.calAccentColor }" />
                                    <span class="elem-cal__event-label">{{ ev.title }}</span>
                                </div>
                                <div v-if="day.events.length > maxEventsPerCell" class="elem-cal__more">
                                    +{{ day.events.length - maxEventsPerCell }}
                                </div>
                            </div>
                        </div>
                    </div>
                </template>
            </div>
        </div>

        <!-- ── Week view ───────────────────────────────────────────── -->
        <div v-else-if="currentView === 'week'" class="elem-cal__week">
            <div class="elem-cal__week-head">
                <div class="elem-cal__time-gutter" />
                <div
                    v-for="day in weekDays"
                    :key="day.key"
                    class="elem-cal__week-col-hd"
                    :class="{ 'elem-cal__week-col-hd--today': day.isToday, 'elem-cal__week-col-hd--weekend': day.isWeekend }"
                    @click="drillDown(day)">
                    <div class="elem-cal__week-dow">{{ locale.weekdaysShort[day.dow] }}</div>
                    <div class="elem-cal__week-num" :class="{ 'elem-cal__week-num--today': day.isToday }">{{ day.d }}</div>
                </div>
            </div>
            <div class="elem-cal__week-body">
                <div class="elem-cal__time-col">
                    <div v-for="h in 24" :key="h" class="elem-cal__hour-label">
                        {{ formatHour(h - 1) }}
                    </div>
                </div>
                <div class="elem-cal__week-cols">
                    <div
                        v-for="day in weekDays"
                        :key="day.key"
                        class="elem-cal__week-col"
                        :class="{ 'elem-cal__week-col--today': day.isToday }"
                        @click="onWeekColClick(day, $event)">
                        <div v-for="h in 24" :key="h" class="elem-cal__hour-slot" />
                        <div
                            v-for="ev in day.events"
                            :key="ev.id"
                            class="elem-cal__week-event"
                            :style="weekEventStyle(ev)"
                            :title="ev.title"
                            @click.stop="onEventClick(ev)">
                            <span class="elem-cal__week-event-title">{{ ev.title }}</span>
                            <span class="elem-cal__week-event-time">{{ ev.startTime }}</span>
                        </div>
                        <div v-if="day.isToday" class="elem-cal__now-line" :style="nowLineStyle" />
                    </div>
                </div>
            </div>
        </div>

        <!-- ── Day view ────────────────────────────────────────────── -->
        <div v-else-if="currentView === 'day'" class="elem-cal__day-view">
            <div class="elem-cal__day-head">
                <div class="elem-cal__time-gutter" />
                <div
                    class="elem-cal__week-col-hd elem-cal__week-col-hd--single"
                    :class="{ 'elem-cal__week-col-hd--today': dayViewDay && dayViewDay.isToday }">
                    <div class="elem-cal__week-dow">{{ dayViewDay ? locale.weekdays[dayViewDay.dow] : '' }}</div>
                    <div class="elem-cal__week-num" :class="{ 'elem-cal__week-num--today': dayViewDay && dayViewDay.isToday }">
                        {{ dayViewDay ? dayViewDay.d : '' }}
                    </div>
                </div>
            </div>
            <div class="elem-cal__week-body">
                <div class="elem-cal__time-col">
                    <div v-for="h in 24" :key="h" class="elem-cal__hour-label">{{ formatHour(h - 1) }}</div>
                </div>
                <div class="elem-cal__week-cols">
                    <div class="elem-cal__week-col elem-cal__week-col--full" :class="{ 'elem-cal__week-col--today': dayViewDay && dayViewDay.isToday }">
                        <div v-for="h in 24" :key="h" class="elem-cal__hour-slot" />
                        <div
                            v-for="ev in dayViewEvents"
                            :key="ev.id"
                            class="elem-cal__week-event"
                            :style="weekEventStyle(ev)"
                            :title="ev.title"
                            @click.stop="onEventClick(ev)">
                            <span class="elem-cal__week-event-title">{{ ev.title }}</span>
                            <span class="elem-cal__week-event-time">{{ ev.startTime }}</span>
                        </div>
                        <div v-if="dayViewDay && dayViewDay.isToday" class="elem-cal__now-line" :style="nowLineStyle" />
                    </div>
                </div>
            </div>
        </div>

        <!-- ── Agenda view ─────────────────────────────────────────── -->
        <div v-else-if="currentView === 'agenda'" class="elem-cal__agenda">
            <div v-if="agendaGroups.length === 0" class="elem-cal__no-events">
                {{ locale.noEvents }}
            </div>
            <div v-for="group in agendaGroups" :key="group.key" class="elem-cal__agenda-group">
                <div class="elem-cal__agenda-date" :class="{ 'elem-cal__agenda-date--today': group.isToday }">
                    <span class="elem-cal__agenda-day-num">{{ group.d }}</span>
                    <span class="elem-cal__agenda-day-name">{{ group.dayName }}</span>
                </div>
                <div class="elem-cal__agenda-events">
                    <div
                        v-for="ev in group.events"
                        :key="ev.id"
                        class="elem-cal__agenda-event"
                        @click="onEventClick(ev)">
                        <div class="elem-cal__agenda-event-bar" :style="{ background: ev.color || props.calAccentColor }" />
                        <div class="elem-cal__agenda-event-body">
                            <div class="elem-cal__agenda-event-time">{{ ev.startTime || locale.allDay }}</div>
                            <div class="elem-cal__agenda-event-title">{{ ev.title }}</div>
                            <div v-if="ev.desc" class="elem-cal__agenda-event-desc">{{ ev.desc }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- ── Custom CSS injection ────────────────────────────────── -->
        <component v-if="customCssContent" :is="'style'" v-html="customCssContent" />
    </div>
    </w-elem>
</template>

<script>
import { Elem, Managers } from 'goodt-wcore';
import { useElemDatasetMixin, ElemDatasetMixinTypes } from '@goodt-common/data';
import { meta } from './descriptor';
import { VIEWS, LOCALE_DATA, PRESETS, SELECTION_MODES, AGENDA_DAYS_AHEAD, HOUR_HEIGHT } from './constants';

const { store, ValueObject } = Managers.StoreManager;

// ── Pure date helpers ──────────────────────────────────────────────
function daysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }
function isoDate(d) { return d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` : ''; }
function parseIso(s) { if (!s) return null; const p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
function isSameDay(a, b) { return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }
function getWeekNumber(d) {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
    const y = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil((((date - y) / 86400000) + 1) / 7);
}
function startOfWeek(date, firstDay) {
    const d = new Date(date);
    const dow = d.getDay();
    const diff = (dow - firstDay + 7) % 7;
    d.setDate(d.getDate() - diff);
    d.setHours(0, 0, 0, 0);
    return d;
}
function addDays(d, n) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }

export default {
    extends: Elem,
    meta,
    mixins: [useElemDatasetMixin()],
    hooks: {
        then() {
            this.buildDimensionValues();
        }
    },

    data: () => ({
        ...ElemDatasetMixinTypes,
        currentView: 'month',
        navDate: new Date(),
        today: new Date(),
        rangeStart: null,
        rangeEnd: null,
        hoveredDate: null,
        nowTimer: null,
        dimensionValues: []
    }),

    computed: {
        locale() {
            return LOCALE_DATA[this.props.calLocale] || LOCALE_DATA.ru;
        },

        firstDay() {
            return this.props.calFirstDay ?? 1;
        },

        availableViewsList() {
            const v = this.props.calAvailableViews;
            return Array.isArray(v) && v.length ? v : Object.values(VIEWS);
        },

        // ── CSS vars object ──────────────────────────────────────────
        calCssVars() {
            const p = this.props;
            return {
                '--cal-bg':             p.calBg,
                '--cal-header-bg':      p.calHeaderBg,
                '--cal-header-color':   p.calHeaderColor,
                '--cal-accent':         p.calAccentColor,
                '--cal-today-bg':       p.calTodayBg,
                '--cal-today-color':    p.calTodayColor,
                '--cal-weekend-color':  p.calWeekendColor,
                '--cal-cell-bg':        p.calCellBg,
                '--cal-cell-hover-bg':  p.calCellHoverBg,
                '--cal-cell-border':    p.calCellBorderColor,
                '--cal-selected-bg':    p.calSelectedBg,
                '--cal-selected-color': p.calSelectedColor,
                '--cal-range-bg':       p.calRangeBg,
                '--cal-radius':         p.calRadius,
                '--cal-event-radius':   p.calEventRadius,
                '--cal-shadow':         p.calShadow,
                '--cal-font-family':      p.calFontFamily || 'inherit',
                '--cal-font-size':        p.calFontSize || '13px',
                '--cal-font-weight':      p.calFontWeight || '400',
                '--cal-letter-spacing':   p.calLetterSpacing || '0',
                '--cal-text-transform':   p.calTextTransform || 'none'
            };
        },

        // ── Dataset result ───────────────────────────────────────────
        hasResult() {
            const { result, props: { dimension } } = this;
            return result?.rows?.length > 0 && Boolean(dimension);
        },

        calDynamicClass() {
            return {
                [`elem-cal--${this.currentView}`]: true,
                'elem-cal--no-weekends': !this.props.calShowWeekends,
                'elem-cal--week-numbers': this.props.calShowWeekNumbers,
                'elem-cal--editor': this.isEditorMode
            };
        },

        weekdayHeaders() {
            const short = this.locale.weekdaysShort;
            const result = [];
            for (let i = 0; i < 7; i++) {
                result.push(short[(i + this.firstDay) % 7]);
            }
            return result;
        },

        // ── Month grid ───────────────────────────────────────────────
        monthWeeks() {
            const y = this.navDate.getFullYear();
            const m = this.navDate.getMonth();
            const total = daysInMonth(y, m);
            const firstDow = new Date(y, m, 1).getDay();
            const offset = (firstDow - this.firstDay + 7) % 7;

            const cells = [];
            // Prev month padding
            const prevTotal = daysInMonth(y, m - 1);
            for (let i = offset - 1; i >= 0; i--) {
                const d = new Date(y, m - 1, prevTotal - i);
                cells.push(this._buildDay(d, false));
            }
            // Current month
            for (let d = 1; d <= total; d++) {
                cells.push(this._buildDay(new Date(y, m, d), true));
            }
            // Next month padding
            const remaining = 42 - cells.length;
            for (let d = 1; d <= remaining; d++) {
                cells.push(this._buildDay(new Date(y, m + 1, d), false));
            }

            const weeks = [];
            for (let w = 0; w < 6; w++) {
                const slice = cells.slice(w * 7, w * 7 + 7);
                weeks.push({ num: getWeekNumber(slice[0].date), days: slice });
            }
            return weeks;
        },

        // ── Week view days ───────────────────────────────────────────
        weekDays() {
            const start = startOfWeek(this.navDate, this.firstDay);
            const days = [];
            for (let i = 0; i < 7; i++) {
                const d = addDays(start, i);
                days.push(this._buildDayFull(d));
            }
            return days;
        },

        // ── Day view ─────────────────────────────────────────────────
        dayViewDay() {
            return this._buildDayFull(this.navDate);
        },

        dayViewEvents() {
            return this.dayViewDay ? this.dayViewDay.events : [];
        },

        // ── Agenda view ──────────────────────────────────────────────
        agendaGroups() {
            const groups = [];
            const start = new Date(this.navDate);
            start.setHours(0, 0, 0, 0);
            for (let i = 0; i < AGENDA_DAYS_AHEAD; i++) {
                const d = addDays(start, i);
                const evs = this._eventsForDay(d);
                if (evs.length > 0) {
                    groups.push({
                        key: isoDate(d),
                        d: d.getDate(),
                        dayName: this.locale.weekdays[d.getDay()],
                        isToday: isSameDay(d, this.today),
                        events: evs
                    });
                }
            }
            return groups;
        },

        // ── Parsed events ────────────────────────────────────────────
        parsedEvents() {
            let raw = [];
            // From store var
            if (this.props.calEventsVar) {
                try {
                    const val = store.state[this.props.calEventsVar]?.value;
                    if (val) raw = typeof val === 'string' ? JSON.parse(val) : val;
                } catch (e) { /* noop */ }
            }
            // From static JSON prop
            if (!raw.length && this.props.calEventsJson) {
                try { raw = JSON.parse(this.props.calEventsJson); } catch (e) { /* noop */ }
            }
            if (!Array.isArray(raw)) return [];
            return raw.map((ev, i) => ({
                id: ev.id || `ev-${i}`,
                title: ev.title || ev.name || '(без названия)',
                date: ev.date || ev.start || '',
                endDate: ev.endDate || ev.end || ev.date || ev.start || '',
                startTime: ev.startTime || ev.time || '',
                endTime: ev.endTime || '',
                color: ev.color || '',
                desc: ev.desc || ev.description || ''
            }));
        },

        // ── Current title ────────────────────────────────────────────
        currentTitle() {
            const y = this.navDate.getFullYear();
            const m = this.navDate.getMonth();
            const d = this.navDate.getDate();
            const months = this.locale.months;
            if (this.currentView === 'month') return `${months[m]} ${y}`;
            if (this.currentView === 'week') {
                const ws = startOfWeek(this.navDate, this.firstDay);
                const we = addDays(ws, 6);
                if (ws.getMonth() === we.getMonth()) {
                    return `${ws.getDate()}–${we.getDate()} ${months[ws.getMonth()]} ${y}`;
                }
                return `${ws.getDate()} ${this.locale.monthsShort[ws.getMonth()]} – ${we.getDate()} ${this.locale.monthsShort[we.getMonth()]} ${y}`;
            }
            if (this.currentView === 'day') {
                return `${d} ${months[m]} ${y}`;
            }
            return `${months[m]} ${y}`;
        },

        // ── Selection parsed ─────────────────────────────────────────
        selectedDate() {
            const v = this.props.calDateVar ? store.state[this.props.calDateVar]?.value : null;
            return parseIso(v || this.props.calSelectedDate);
        },

        maxEventsPerCell() {
            return 3;
        },

        // ── Now line position ────────────────────────────────────────
        nowLineStyle() {
            const h = this.today.getHours();
            const min = this.today.getMinutes();
            const top = (h + min / 60) * HOUR_HEIGHT;
            return { top: `${top}px` };
        },

        customCssContent() {
            const SELS = {
                header: '.elem-cal__header', title: '.elem-cal__title',
                navBtn: '.elem-cal__nav-btn', viewBtn: '.elem-cal__view-btn',
                weekday: '.elem-cal__weekday', cell: '.elem-cal__cell',
                dayNum: '.elem-cal__day-num', todayCell: '.elem-cal__cell--today',
                selectedCell: '.elem-cal__cell--selected', event: '.elem-cal__event',
                weekEvent: '.elem-cal__week-event', agendaEvent: '.elem-cal__agenda-event'
            };
            const parts = [];
            if (this.props.calCustomCss) parts.push(`.elem-cal { ${this.props.calCustomCss} }`);
            try {
                const blocks = JSON.parse(this.props.calDesignerCss || '{}');
                Object.entries(blocks).forEach(([k, css]) => {
                    if (css && SELS[k]) parts.push(`${SELS[k]} { ${css} }`);
                });
            } catch (e) { /* noop */ }
            return parts.length ? parts.join('\n') : null;
        }
    },

    watch: {
        'props.calView'(v) {
            if (v && Object.values(VIEWS).includes(v)) this.currentView = v;
        },
        'props.calSelectedDate'(v) {
            if (v) { const d = parseIso(v); if (d) this.navDate = new Date(d); }
        }
    },

    mounted() {
        // Init view
        const v = this.props.calView;
        if (v && Object.values(VIEWS).includes(v)) this.currentView = v;

        // Init selected date
        const sd = this.selectedDate;
        if (sd) this.navDate = new Date(sd);

        // Init range from props
        if (this.props.calSelectedStart) this.rangeStart = parseIso(this.props.calSelectedStart);
        if (this.props.calSelectedEnd) this.rangeEnd = parseIso(this.props.calSelectedEnd);

        // Tick timer for "now" line
        this._tickNow();
        this.nowTimer = setInterval(() => this._tickNow(), 60000);
    },

    beforeDestroy() {
        if (this.nowTimer) clearInterval(this.nowTimer);
    },

    methods: {
        // ── Dataset ──────────────────────────────────────────────────
        buildDimensionValues() {
            const { dimension } = this.props;
            if (!this.hasResult || !dimension) { this.dimensionValues = []; return; }
            this.dimensionValues = this.result.rows.map((row) => row[dimension]).filter(Boolean);
        },

        hasDataForDay(date) {
            if (!this.dimensionValues.length) return false;
            const iso = isoDate(date);
            return this.dimensionValues.some((v) => String(v).includes(iso));
        },

        // ── Build day cell data ──────────────────────────────────────
        _buildDay(date, inMonth) {
            const iso = isoDate(date);
            return {
                date,
                key: iso,
                d: date.getDate(),
                dow: date.getDay(),
                iso,
                inMonth,
                isToday: isSameDay(date, this.today),
                isWeekend: date.getDay() === 0 || date.getDay() === 6,
                hasData: this.hasDataForDay(date),
                events: this._eventsForDay(date)
            };
        },

        _buildDayFull(date) {
            const day = this._buildDay(date, true);
            return day;
        },

        _eventsForDay(date) {
            const iso = isoDate(date);
            return this.parsedEvents.filter((ev) => {
                if (!ev.date) return false;
                const start = ev.date.slice(0, 10);
                const end = ev.endDate ? ev.endDate.slice(0, 10) : start;
                return iso >= start && iso <= end;
            });
        },

        // ── Navigation ───────────────────────────────────────────────
        prevPeriod() {
            const d = new Date(this.navDate);
            if (this.currentView === 'month') d.setMonth(d.getMonth() - 1);
            else if (this.currentView === 'week') d.setDate(d.getDate() - 7);
            else if (this.currentView === 'day') d.setDate(d.getDate() - 1);
            else if (this.currentView === 'agenda') d.setMonth(d.getMonth() - 1);
            this.navDate = d;
        },

        nextPeriod() {
            const d = new Date(this.navDate);
            if (this.currentView === 'month') d.setMonth(d.getMonth() + 1);
            else if (this.currentView === 'week') d.setDate(d.getDate() + 7);
            else if (this.currentView === 'day') d.setDate(d.getDate() + 1);
            else if (this.currentView === 'agenda') d.setMonth(d.getMonth() + 1);
            this.navDate = d;
        },

        goToday() {
            this.navDate = new Date();
        },

        setView(v) {
            this.currentView = v;
            this.props.calView = v;
            this.propChanged('calView');
        },

        drillDown(day) {
            this.navDate = new Date(day.date);
            this.setView('day');
        },

        // ── Selection ────────────────────────────────────────────────
        onDayClick(day) {
            const mode = this.props.calSelectionMode || SELECTION_MODES.SINGLE;
            if (mode === SELECTION_MODES.NONE) return;

            if (mode === SELECTION_MODES.SINGLE) {
                this._commitDate(day.iso);
            } else if (mode === SELECTION_MODES.RANGE) {
                if (!this.rangeStart || (this.rangeStart && this.rangeEnd)) {
                    this.rangeStart = day.date;
                    this.rangeEnd = null;
                    this.hoveredDate = null;
                } else {
                    if (day.date < this.rangeStart) {
                        this.rangeEnd = new Date(this.rangeStart);
                        this.rangeStart = day.date;
                    } else {
                        this.rangeEnd = day.date;
                    }
                    this._commitRange(isoDate(this.rangeStart), isoDate(this.rangeEnd));
                }
            }
        },

        onDayHover(day) {
            if (this.props.calSelectionMode === SELECTION_MODES.RANGE && this.rangeStart && !this.rangeEnd) {
                this.hoveredDate = day.date;
            }
        },

        onWeekColClick(day) {
            this._commitDate(day.iso);
        },

        onEventClick(ev) {
            this.$eventTrigger && this.$eventTrigger('calendarEventClick', ev);
        },

        _commitDate(iso) {
            this.props.calSelectedDate = iso;
            this.propChanged('calSelectedDate');
            if (this.props.calDateVar) {
                store.commit(
                    { [this.props.calDateVar]: new ValueObject(iso, store.state[this.props.calDateVar]?.meta) },
                    { context: this }
                );
            }
        },

        _commitRange(start, end) {
            this.props.calSelectedStart = start;
            this.props.calSelectedEnd = end;
            this.propChanged('calSelectedStart');
            this.propChanged('calSelectedEnd');
            if (this.props.calStartVar) {
                store.commit({ [this.props.calStartVar]: new ValueObject(start) }, { context: this });
            }
            if (this.props.calEndVar) {
                store.commit({ [this.props.calEndVar]: new ValueObject(end) }, { context: this });
            }
        },

        // ── Cell classes ─────────────────────────────────────────────
        dayCellClass(day) {
            const mode = this.props.calSelectionMode || SELECTION_MODES.SINGLE;
            const selDate = this.selectedDate;
            const isSelected = mode === SELECTION_MODES.SINGLE && selDate && isSameDay(day.date, selDate);
            const isRangeStart = mode === SELECTION_MODES.RANGE && this.rangeStart && isSameDay(day.date, this.rangeStart);
            const isRangeEnd = mode === SELECTION_MODES.RANGE && this.rangeEnd && isSameDay(day.date, this.rangeEnd);

            const hovered = this.hoveredDate || this.rangeEnd;
            const rangeMin = this.rangeStart && hovered ? (this.rangeStart < hovered ? this.rangeStart : hovered) : null;
            const rangeMax = this.rangeStart && hovered ? (this.rangeStart < hovered ? hovered : this.rangeStart) : null;
            const isInRange = mode === SELECTION_MODES.RANGE && rangeMin && rangeMax && day.date > rangeMin && day.date < rangeMax;

            return {
                'elem-cal__cell--other-month': !day.inMonth,
                'elem-cal__cell--today': day.isToday,
                'elem-cal__cell--weekend': day.isWeekend,
                'elem-cal__cell--selected': isSelected || isRangeStart || isRangeEnd,
                'elem-cal__cell--range-start': isRangeStart,
                'elem-cal__cell--range-end': isRangeEnd,
                'elem-cal__cell--in-range': isInRange,
                'elem-cal__cell--has-events': day.events.length > 0,
                'elem-cal__cell--has-data': day.hasData
            };
        },

        isWeekendCol(colIndex) {
            const dow = (colIndex + this.firstDay) % 7;
            return dow === 0 || dow === 6;
        },

        // ── Event styles ─────────────────────────────────────────────
        eventStyle(ev) {
            return {
                '--ev-color': ev.color || this.props.calAccentColor
            };
        },

        weekEventStyle(ev) {
            const [sh, sm] = (ev.startTime || '00:00').split(':').map(Number);
            const [eh, em] = (ev.endTime || `${sh + 1}:00`).split(':').map(Number);
            const top = (sh + sm / 60) * HOUR_HEIGHT;
            const height = Math.max((eh + em / 60 - sh - sm / 60) * HOUR_HEIGHT, 20);
            return {
                top: `${top}px`,
                height: `${height}px`,
                background: ev.color || this.props.calAccentColor
            };
        },

        // ── Helpers ──────────────────────────────────────────────────
        formatHour(h) {
            return `${String(h).padStart(2, '0')}:00`;
        },

        _tickNow() {
            this.today = new Date();
        }
    }
};
</script>

<style scoped>
/* ═══════════════════════════════════════════════════════════════════
   ElemCalendar — base styles
   All colors are CSS vars so presets just swap the vars.
═══════════════════════════════════════════════════════════════════ */
.elem-cal {
    --cal-bg:             #ffffff;
    --cal-header-bg:      #4f6aff;
    --cal-header-color:   #ffffff;
    --cal-accent:         #4f6aff;
    --cal-today-bg:       #eef0ff;
    --cal-today-color:    #4f6aff;
    --cal-weekend-color:  #ef4444;
    --cal-cell-bg:        #ffffff;
    --cal-cell-hover-bg:  #f5f7ff;
    --cal-cell-border:    #e8ecf4;
    --cal-selected-bg:    #4f6aff;
    --cal-selected-color: #ffffff;
    --cal-range-bg:       rgba(79, 106, 255, 0.10);
    --cal-radius:         12px;
    --cal-event-radius:   4px;
    --cal-shadow:         0 4px 24px rgba(79, 106, 255, 0.10), 0 1px 4px rgba(0, 0, 0, 0.06);
    --cal-font-family:     inherit;
    --cal-font-size:       13px;
    --cal-font-weight:     400;
    --cal-letter-spacing:  0;
    --cal-text-transform:  none;

    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    min-height: 320px;
    background: var(--cal-bg);
    border-radius: var(--cal-radius);
    box-shadow: var(--cal-shadow);
    font-family: var(--cal-font-family);
    font-size: var(--cal-font-size);
    font-weight: var(--cal-font-weight);
    letter-spacing: var(--cal-letter-spacing);
    text-transform: var(--cal-text-transform);
    overflow: hidden;
    box-sizing: border-box;
    -webkit-font-smoothing: antialiased;
}

/* ── Header ──────────────────────────────────────────────────────── */
.elem-cal__header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    background: var(--cal-header-bg);
    color: var(--cal-header-color);
    flex-shrink: 0;
}

.elem-cal__nav {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
}

.elem-cal__nav-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border: none;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.15);
    color: inherit;
    cursor: pointer;
    transition: background 0.15s;
    padding: 0;
}
.elem-cal__nav-btn:hover { background: rgba(255, 255, 255, 0.28); }

.elem-cal__today-btn {
    padding: 5px 12px;
    border: 1.5px solid rgba(255, 255, 255, 0.35);
    border-radius: 20px;
    background: transparent;
    color: inherit;
    font-size: 0.92em;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s;
    white-space: nowrap;
}
.elem-cal__today-btn:hover { background: rgba(255, 255, 255, 0.2); border-color: rgba(255, 255, 255, 0.6); }

.elem-cal__title-wrap { flex: 1; text-align: center; }
.elem-cal__title {
    margin: 0;
    font-size: 1.15em;
    font-weight: 700;
    letter-spacing: 0.01em;
    color: inherit;
}

.elem-cal__view-switch {
    display: flex;
    gap: 2px;
    background: rgba(0, 0, 0, 0.15);
    border-radius: 9px;
    padding: 3px;
    flex-shrink: 0;
}

.elem-cal__view-btn {
    padding: 4px 10px;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: rgba(255, 255, 255, 0.75);
    font-size: 0.92em;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
    white-space: nowrap;
}
.elem-cal__view-btn:hover { background: rgba(255, 255, 255, 0.15); color: #fff; }
.elem-cal__view-btn--active {
    background: rgba(255, 255, 255, 0.95);
    color: var(--cal-accent);
    font-weight: 700;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
}

/* ── Month view ──────────────────────────────────────────────────── */
.elem-cal__month {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden;
}

.elem-cal__weekrow {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    background: var(--cal-bg);
    border-bottom: 1px solid var(--cal-cell-border);
    flex-shrink: 0;
}

.elem-cal--week-numbers .elem-cal__weekrow {
    grid-template-columns: 28px repeat(7, 1fr);
}

.elem-cal__wnum-hd {
    background: var(--cal-bg);
    border-right: 1px solid var(--cal-cell-border);
}

.elem-cal__weekday {
    padding: 7px 4px 6px;
    text-align: center;
    font-size: 0.85em;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #94a3b8;
}
.elem-cal__weekday--weekend { color: var(--cal-weekend-color); opacity: 0.85; }

.elem-cal__grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    grid-template-rows: repeat(6, 1fr);
    flex: 1;
    min-height: 0;
}

.elem-cal--week-numbers .elem-cal__grid {
    grid-template-columns: 28px repeat(7, 1fr);
}

.elem-cal__wnum {
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding-top: 8px;
    font-size: 0.77em;
    color: #c0cdd9;
    font-weight: 500;
    border-right: 1px solid var(--cal-cell-border);
    border-bottom: 1px solid var(--cal-cell-border);
}

/* ── Calendar cell ───────────────────────────────────────────────── */
.elem-cal__cell {
    position: relative;
    background: var(--cal-cell-bg);
    border-right: 1px solid var(--cal-cell-border);
    border-bottom: 1px solid var(--cal-cell-border);
    cursor: pointer;
    transition: background 0.12s;
    overflow: hidden;
    min-height: 0;
}
.elem-cal__cell:hover { background: var(--cal-cell-hover-bg); }

.elem-cal__cell--other-month { opacity: 0.35; }

.elem-cal__cell--today {
    background: var(--cal-today-bg);
}
.elem-cal__cell--today .elem-cal__day-num {
    background: var(--cal-today-color);
    color: #fff;
    border-radius: 50%;
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.elem-cal__cell--weekend .elem-cal__day-num { color: var(--cal-weekend-color); }

.elem-cal__cell--selected {
    background: var(--cal-selected-bg) !important;
}
.elem-cal__cell--selected .elem-cal__day-num { color: var(--cal-selected-color) !important; font-weight: 700; }

.elem-cal__cell--in-range { background: var(--cal-range-bg) !important; }

.elem-cal__cell-inner {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 5px 5px 3px;
    box-sizing: border-box;
}

.elem-cal__day-num {
    font-size: 0.92em;
    font-weight: var(--cal-font-weight);
    line-height: 1;
    color: #334155;
    flex-shrink: 0;
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    align-self: flex-start;
    transition: background 0.15s, color 0.15s;
}

.elem-cal__events-wrap {
    display: flex;
    flex-direction: column;
    gap: 1px;
    margin-top: 2px;
    overflow: hidden;
    flex: 1;
}

.elem-cal__event {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 1px 4px;
    border-radius: var(--cal-event-radius);
    background: rgba(79, 106, 255, 0.10);
    cursor: pointer;
    transition: opacity 0.12s;
    overflow: hidden;
}
.elem-cal__event:hover { opacity: 0.8; }

.elem-cal__event-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
    background: var(--ev-color, var(--cal-accent));
}

.elem-cal__event-label {
    font-size: 0.77em;
    font-weight: var(--cal-font-weight);
    color: #334155;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.4;
}

.elem-cal__more {
    font-size: 0.77em;
    color: #94a3b8;
    font-weight: 600;
    padding: 0 4px;
    line-height: 1.4;
}

/* ── Data dot: cell has matching record in dataset ───────────────── */
.elem-cal__cell--has-data .elem-cal__day-num {
    position: relative;
}
.elem-cal__cell--has-data .elem-cal__day-num::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 50%;
    transform: translateX(-50%);
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--cal-accent);
    opacity: 0.75;
}
.elem-cal__cell--today.elem-cal__cell--has-data .elem-cal__day-num::after { background: #fff; opacity: 0.9; }
.elem-cal__cell--selected.elem-cal__cell--has-data .elem-cal__day-num::after { background: rgba(255, 255, 255, 0.8); }

/* ── Week / Day view ─────────────────────────────────────────────── */
.elem-cal__week,
.elem-cal__day-view {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    overflow: hidden;
}

.elem-cal__week-head,
.elem-cal__day-head {
    display: flex;
    border-bottom: 1px solid var(--cal-cell-border);
    flex-shrink: 0;
    background: var(--cal-bg);
}

.elem-cal__time-gutter {
    width: 52px;
    flex-shrink: 0;
    border-right: 1px solid var(--cal-cell-border);
}

.elem-cal__week-col-hd {
    flex: 1;
    text-align: center;
    padding: 8px 4px;
    cursor: pointer;
    border-right: 1px solid var(--cal-cell-border);
    transition: background 0.12s;
}
.elem-cal__week-col-hd:hover { background: var(--cal-cell-hover-bg); }
.elem-cal__week-col-hd--single { flex: 1; cursor: default; }
.elem-cal__week-col-hd--today { background: var(--cal-today-bg); }
.elem-cal__week-col-hd--weekend .elem-cal__week-dow { color: var(--cal-weekend-color); }

.elem-cal__week-dow {
    font-size: 0.77em;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #94a3b8;
}

.elem-cal__week-num {
    font-size: 1.38em;
    font-weight: 700;
    color: #334155;
    line-height: 1.2;
    margin-top: 2px;
}
.elem-cal__week-num--today {
    background: var(--cal-today-color);
    color: #fff;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 1.08em;
}

.elem-cal__week-body {
    display: flex;
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    min-height: 0;
}

.elem-cal__time-col {
    width: 52px;
    flex-shrink: 0;
    border-right: 1px solid var(--cal-cell-border);
}

.elem-cal__hour-label {
    height: 60px;
    display: flex;
    align-items: flex-start;
    justify-content: flex-end;
    padding: 2px 6px 0 0;
    font-size: 0.77em;
    color: #94a3b8;
    font-weight: 500;
    box-sizing: border-box;
}

.elem-cal__week-cols {
    display: flex;
    flex: 1;
    min-width: 0;
    position: relative;
}

.elem-cal__week-col {
    flex: 1;
    position: relative;
    border-right: 1px solid var(--cal-cell-border);
    min-height: 1440px; /* 24*60px */
    cursor: pointer;
}
.elem-cal__week-col--today { background: var(--cal-today-bg); }
.elem-cal__week-col--full { flex: 1; }

.elem-cal__hour-slot {
    height: 60px;
    border-bottom: 1px solid var(--cal-cell-border);
    box-sizing: border-box;
}

.elem-cal__week-event {
    position: absolute;
    left: 2px;
    right: 2px;
    border-radius: var(--cal-event-radius);
    background: var(--cal-accent);
    color: #fff;
    padding: 3px 6px;
    font-size: 0.85em;
    font-weight: var(--cal-font-weight);
    cursor: pointer;
    overflow: hidden;
    transition: opacity 0.12s, transform 0.1s;
    box-sizing: border-box;
    z-index: 1;
}
.elem-cal__week-event:hover { opacity: 0.88; transform: scaleX(0.97); }

.elem-cal__week-event-title {
    display: block;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.3;
}

.elem-cal__week-event-time {
    display: block;
    font-size: 0.77em;
    opacity: 0.8;
    line-height: 1.3;
}

.elem-cal__now-line {
    position: absolute;
    left: 0;
    right: 0;
    height: 2px;
    background: var(--cal-accent);
    z-index: 2;
    border-radius: 1px;
}
.elem-cal__now-line::before {
    content: '';
    position: absolute;
    left: -4px;
    top: -4px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--cal-accent);
}

/* ── Agenda view ─────────────────────────────────────────────────── */
.elem-cal__agenda {
    flex: 1;
    overflow-y: auto;
    padding: 12px 0;
}

.elem-cal__no-events {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    min-height: 120px;
    color: #94a3b8;
    font-size: 1.08em;
}

.elem-cal__agenda-group {
    display: flex;
    gap: 0;
    border-bottom: 1px solid var(--cal-cell-border);
    padding: 8px 14px;
}

.elem-cal__agenda-date {
    width: 52px;
    flex-shrink: 0;
    text-align: center;
    padding-right: 12px;
    padding-top: 2px;
}

.elem-cal__agenda-date--today .elem-cal__agenda-day-num {
    background: var(--cal-today-color);
    color: #fff;
    border-radius: 50%;
    width: 28px;
    height: 28px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.elem-cal__agenda-day-num {
    display: block;
    font-size: 1.38em;
    font-weight: 700;
    color: #334155;
    line-height: 1.2;
}

.elem-cal__agenda-day-name {
    display: block;
    font-size: 0.77em;
    color: #94a3b8;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-top: 2px;
}

.elem-cal__agenda-events {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.elem-cal__agenda-event {
    display: flex;
    gap: 10px;
    padding: 8px 10px;
    background: var(--cal-cell-bg);
    border-radius: 8px;
    border: 1px solid var(--cal-cell-border);
    cursor: pointer;
    transition: background 0.12s, transform 0.1s;
}
.elem-cal__agenda-event:hover { background: var(--cal-cell-hover-bg); transform: translateX(2px); }

.elem-cal__agenda-event-bar {
    width: 4px;
    border-radius: 2px;
    flex-shrink: 0;
    background: var(--cal-accent);
    min-height: 30px;
}

.elem-cal__agenda-event-body { flex: 1; min-width: 0; }

.elem-cal__agenda-event-time {
    font-size: 0.85em;
    color: #94a3b8;
    font-weight: 600;
    margin-bottom: 2px;
}

.elem-cal__agenda-event-title {
    font-size: 1em;
    font-weight: var(--cal-font-weight);
    color: #1e293b;
    line-height: 1.3;
}

.elem-cal__agenda-event-desc {
    font-size: 0.85em;
    font-weight: var(--cal-font-weight);
    color: #64748b;
    margin-top: 2px;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}


/* ── No-weekends modifier ────────────────────────────────────────── */
.elem-cal--no-weekends .elem-cal__cell--weekend {
    display: none;
}
.elem-cal--no-weekends .elem-cal__weekday--weekend {
    display: none;
}
.elem-cal--no-weekends .elem-cal__grid {
    grid-template-columns: repeat(5, 1fr);
}
.elem-cal--no-weekends.elem-cal--week-numbers .elem-cal__grid {
    grid-template-columns: 28px repeat(5, 1fr);
}
.elem-cal--no-weekends .elem-cal__weekrow {
    grid-template-columns: repeat(5, 1fr);
}
.elem-cal--no-weekends.elem-cal--week-numbers .elem-cal__weekrow {
    grid-template-columns: 28px repeat(5, 1fr);
}
</style>
