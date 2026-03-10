<template>
    <div class="ui-date-picker">
        <div class="panel d-inline-flex flex-col scroll-hide">
            <div class="row row-collapse row-vgap-none flex-nowrap">
                <div class="col col-auto" v-if="$scopedSlots.left">
                    <!--
                    @slot Custom left content
                    -->
                    <slot name="left"></slot>
                </div>
                <div class="col col-auto">
                    <!--
                    @slot Custom header content
                    @binding {Function} prevYear    select previous year
                    @binding {Function} prevMonth   select previous month
                    @binding {Function} nextYear    select next year
                    @binding {Function} nextMonth   select next month
                    @binding {Function} setMonth    set month by index (0 = january)
                    @binding {Function} setYear     set year (4-digit)
                    @binding {Function} setToday    set today's date
                    @binding {Number} month         current month index (0 = january)
                    @binding {String} monthName     current month name
                    @binding {Number} year          current year (4-digit)
                    -->
                    <slot
                        name="header"
                        v-bind="{
                            prevYear,
                            prevMonth,
                            nextYear,
                            nextMonth,
                            setMonth,
                            setYear,
                            setToday,
                            month,
                            monthName: monthNames[month],
                            year
                        }">
                        <div class="ui-date-picker-header text-small mar-bot-3 bg-primary color-white pad-3">
                            <div class="flex-shrink nobr">
                                <div class="icon cursor-pointer" @click="prevYear">
                                    <i class="mdi mdi-chevron-double-left"></i>
                                </div>
                                <div class="icon cursor-pointer" @click="prevMonth">
                                    <i class="mdi mdi-chevron-left"></i>
                                </div>
                            </div>
                            <div class="flex-grow flex-h-center d-flex">
                                <span>{{ monthNames[month] }}</span>
                                <input class="color-inherit" type="number" v-model.number="year" />
                            </div>
                            <div class="flex-shrink nobr">
                                <div class="icon cursor-pointer" @click="nextMonth">
                                    <i class="mdi mdi-chevron-right"></i>
                                </div>
                                <div class="icon cursor-pointer" @click="nextYear">
                                    <i class="mdi mdi-chevron-double-right"></i>
                                </div>
                            </div>
                        </div>
                    </slot>
                    <div class="pad-3" :class="resolveDatePickerClass">
                        <div
                            v-if="calendarType === CalendarTypes.DAY_TYPE || calendarType === CalendarTypes.WEEK_TYPE"
                            class="ui-date-picker-day-cell text-small"
                            v-for="dayIndex of dayNamesIndexes"
                            :key="`day-${dayIndex}`">
                            <!--
                            @slot Custom day content
                            @binding {Number} dayIndex      day index (0 = sunday)
                            @binding {String} dayName       day name
                            @binding {Boolean} isWeekend    whether a weekend day
                            -->
                            <slot
                                name="cell-day"
                                v-bind="{
                                    dayIndex,
                                    dayName: dayNames[dayIndex],
                                    isWeekend: isWeekendDay(dayIndex)
                                }">
                                <div class="color-grey-dark">
                                    {{ dayNames[dayIndex] }}
                                </div>
                            </slot>
                        </div>
                        <div
                            class="ui-date-picker-date-cell text-small"
                            v-for="n in currentDates()"
                            :key="resolveCalendarKey(n)">
                            <!--
                            @slot Custom date content
                            @binding {Date} date            date
                            @binding {Date} dateStart       range start date
                            @binding {Date} dateEnd         range end date
                            @binding {Number} month         current view month
                            @binding {Number} year          current view year
                            @binding {Boolean} isCurrentMonthDate   is date in current month view
                            @binding {Boolean} isDisabledDate       is date disabled
                            @binding {Boolean} isInRange            is date in range
                            @binding {Boolean} isRangeStart         is date = range start
                            @binding {Boolean} isRangeEnd           is date = range end
                            @binding {Boolean} isSelected           is date selected
                            @binding {Boolean} isToday              is date today
                            @binding {Boolean} isWeekend            is date a weekend day
                            @binding {Boolean} canPick              can pick this date
                            @binding {Function} setDate             set date
                            -->
                            <slot
                                name="cell-date"
                                v-bind="{
                                    date: n,
                                    dateStart,
                                    dateEnd: resolveDateEnd(n),
                                    month,
                                    year,
                                    isCurrentMonthDate: isCurrentMonthDate(n),
                                    isDisabledDate: isDisabledDate(n),
                                    isInRange: isRangeDate(n),
                                    isRangeStart: isRangeStartDate(n),
                                    isRangeEnd: isRangeEndDate(n),
                                    isSelected: isSelectedDate(n),
                                    isToday: isTodayDate(n),
                                    isWeekend: isWeekendDate(n),
                                    setDate,
                                    canPick: canPick(n)
                                }">
                                <div
                                    class="btn btn-icon btn-small"
                                    :class="{
                                        'btn-primary': isSelectedDate(n) || isRangeDate(n),
                                        'radius-right-none': isRangeStartDate(n) && !isRangeEndDate(n) && dateEnd,
                                        'radius-left-none': !isRangeStartDate(n) && isRangeEndDate(n),
                                        'radius-none': isRangeDate(n) && !isRangeStartDate(n) && !isRangeEndDate(n),
                                        'disabled radius-none': isDisabledDate(n)
                                    }"
                                    @click="setDate(n)">
                                    <template v-if="isSelectedDate(n) || isRangeDate(n)">
                                        <div>{{ n.getDate() }}</div>
                                    </template>
                                    <template v-else-if="isTodayDate(n)">
                                        <div class="color-primary">{{ n.getDate() }}</div>
                                    </template>
                                    <template v-else-if="!isCurrentMonthDate(n)">
                                        <div class="text-muted">{{ n.getDate() }}</div>
                                    </template>
                                    <template v-else>
                                        <div class="color-body">{{ n.getDate() }}</div>
                                    </template>
                                </div>
                            </slot>
                        </div>
                    </div>
                    <!--
                    @slot Custom footer content
                    @binding {Function} prevYear    select previous year
                    @binding {Function} prevMonth   select previous month
                    @binding {Function} nextYear    select next year
                    @binding {Function} nextMonth   select next month
                    @binding {Function} setMonth    set month by index (0 = january)
                    @binding {Function} setYear     set year (4-digit)
                    @binding {Function} setToday    set today's date
                    @binding {Number} month         current month index (0 = january)
                    @binding {String} monthName     current month name
                    @binding {Number} year          current year (4-digit)
                    -->
                    <slot
                        name="footer"
                        v-bind="{
                            prevYear,
                            prevMonth,
                            nextYear,
                            nextMonth,
                            setMonth,
                            setYear,
                            setToday,
                            month,
                            monthName: monthNames[month],
                            year
                        }"></slot>
                </div>
                <div class="col col-auto" v-if="$scopedSlots.right">
                    <!--
                    @slot Custom right content
                    -->
                    <slot name="right"></slot>
                </div>
            </div>
        </div>
    </div>
</template>
<style lang="less" scoped>
.ui-date-picker {
    display: inline-flex;
    color: var(--color-body);
    &-header {
        display: flex;
        align-items: center;
        input {
            width: 3em;
            border: none;
            background: transparent;
            outline: none;
            text-align: center;
            margin: 0;
            padding: 0;
            outline: none;
            -moz-appearance: textfield;
            &::-webkit-outer-spin-button,
            &::-webkit-inner-spin-button {
                -webkit-appearance: none;
                margin: 0;
            }
        }
    }
    &-day-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        grid-auto-rows: 1fr;
        row-gap: 1px;
    }
    &-four-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        grid-auto-rows: 1fr;
        row-gap: 1px;
    }
    &-day-cell,
    &-date-cell {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .flex-nowrap {
        flex-wrap: nowrap;
    }
    .radius-left-none {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
    }
    .radius-right-none {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
    }
}
</style>
<script>
import { CalendarTypes } from '../constants';
import { createDateFromDPProp } from '../utils';

const isDateValid = (d) => d instanceof Date && !isNaN(d.getTime());

export default {
    props: {
        /**
         * @model
         */
        value: {
            type: [Date, Array],
            default: null,
            validation(val) {
                if (Array.isArray(val)) {
                    return val.find((el) => !this.isValid(el)) == null;
                } else {
                    return this.isValid(val);
                }
            }
        },
        /**
         * Min date (inclusive)
         */
        min: {
            type: Date,
            default: null
        },
        /**
         * Max date (inclusive)
         */
        max: {
            type: Date,
            default: null
        },
        /**
         * Allowed date filter function(date:Date):Boolean
         */
        allowed: {
            type: Function,
            default: () => true
        },
        /**
         * Range mode
         */
        range: {
            type: Boolean,
            default: false
        },
        /**
         * Day names starting from 'Sunday'
         */
        dayNames: {
            type: Array,
            default() {
                return ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
            }
        },
        /**
         * Weekend day indexes (0 = Sunday; 6 = Saturday)
         */
        weekendDays: {
            type: Array,
            default() {
                return [0, 6];
            }
        },
        /**
         * Month names starting from 'January'
         */
        monthNames: {
            type: Array,
            default() {
                return [
                    'Январь',
                    'Февраль',
                    'Март',
                    'Апрель',
                    'Май',
                    'Июнь',
                    'Июль',
                    'Август',
                    'Сентябрь',
                    'Октябрь',
                    'Ноябрь',
                    'Декабрь'
                ];
            }
        },
        /**
         * Which day is the first day of the week (0 = Sunday; 6 = Saturday)
         */
        dayOfWeek: {
            type: Number,
            default: 1,
            validation(val) {
                return val >= 0 && val < 7;
            }
        },
        isExpandedRange: {
            type: Boolean,
            default: false
        },
        calendarType: {
            type: String,
            default: CalendarTypes.DAY_TYPE
        },
        calendarLimit: {
            type: Object,
            default: { startDate: null, endDate: null }
        }
    },
    static: {
        CalendarTypes
    },
    data() {
        return {
            date: null,
            dateStart: null,
            dateEnd: null,
            month: null,
            year: null,
            syncMonthYear: true,
            dateList: []
        };
    },
    computed: {
        dayNamesIndexes() {
            let a = [];
            for (let i = this.dayOfWeek; i < 7 + this.dayOfWeek; ++i) {
                a.push(i >= 7 ? i - 7 : i);
            }
            return a;
        },
        firstDayOfMonth() {
            let n = new Date(this.year, this.month, 1).getDay() - this.dayOfWeek;
            return n < 0 ? 7 + n : n;
        },
        lastDayOfMonth() {
            let n = new Date(this.year, this.month + 1, 0).getDay() - this.dayOfWeek;
            return n < 0 ? 7 + n : n;
        },
        daysInMonth() {
            return new Date(this.year, this.month + 1, 0).getDate();
        },
        currentMonthDates() {
            let dates = [...new Array(this.daysInMonth)].map((v, i) => new Date(this.year, this.month, i + 1));
            return [...this.prevMonthDates, ...dates, ...this.nextMonthDates];
        },
        prevMonthDates() {
            let n = this.firstDayOfMonth;
            let pmd = new Date(this.year, this.month, 0).getDate();
            return [...new Array(n)].map((v, i) => new Date(this.year, this.month - 1, pmd - i)).reverse();
        },
        nextMonthDates() {
            let n = 6 - this.lastDayOfMonth;
            return [...new Array(n)].map((v, i) => new Date(this.year, this.month + 1, i + 1));
        },
        resolveDatePickerClass() {
            const calendarTypeClass = `date-picker__${this.calendarType}-dates`;
            if (this.calendarType === CalendarTypes.DAY_TYPE || this.calendarType === CalendarTypes.WEEK_TYPE) {
                return ['ui-date-picker-day-grid', calendarTypeClass];
            }
            return ['ui-date-picker-four-grid', calendarTypeClass];
        }
    },
    watch: {
        value: {
            handler(val) {
                let d = new Date();
                if (this.range && Array.isArray(val) && val.length > 0 && val[0]?.dateStart != null) {
                    let { dateStart, dateEnd } = val[0];
                    this.dateStart = dateStart || null;
                    this.dateEnd = dateEnd || null;
                    d = dateStart || d;
                } else if (this.range && Array.isArray(val)) {
                    let [start, end] = val;
                    this.dateStart = start || null;
                    this.dateEnd = end || null;
                    d = start || d;
                } else {
                    this.date = val;
                    d = val || d;
                }
                if (this.syncMonthYear && !(Array.isArray(d) && d.length > 0)) {
                    this.month = d.getMonth();
                    this.year = d.getFullYear();
                }
                this.syncMonthYear = true;
            },
            immediate: true
        },
        range() {
            this.date = null;
            this.dateStart = null;
            this.dateEnd = null;
            this._triggerChange();
        }
    },
    methods: {
        isValid(date) {
            return isDateValid(date);
        },
        prevMonth() {
            let n = this.month - 1;
            this.month = n < 0 ? 11 : n;
            this.year -= n < 0 ? 1 : 0;
        },
        prevYear() {
            this.year = this.year - 1;
        },
        nextMonth() {
            let n = this.month + 1;
            this.month = n > 11 ? 0 : n;
            this.year += n > 11 ? 1 : 0;
        },
        nextYear() {
            this.year = this.year + 1;
        },
        setYear(n) {
            this.year = n;
        },
        setMonth(n) {
            this.month = n;
        },
        setDate(date) {
            let d = this.isValid(date) ? date : new Date(this.year, this.month, date);

            if (this.isExpandedRange) {
                this.dateList = this.handleDateSelection(this.dateList, date);
                this._triggerChange();
                return;
            }

            if (this.range) {
                if (!this.dateStart || (this.dateStart && this.dateEnd)) {
                    this.dateStart = d;
                    this.dateEnd = null;
                } else {
                    if (d < this.dateStart) {
                        this.dateEnd = this.dateStart;
                        this.dateStart = d;
                    } else if (d > this.dateStart) {
                        this.dateEnd = d;
                    } else {
                        return;
                    }
                    this._triggerChange();
                }
            } else {
                this.date = d;
                this._triggerChange();
            }
            /**
             * Set date event
             * @property {Date} date
             */
            this.$emit('set-date', d);
        },
        setToday() {
            this.date = new Date();
            this.month = this.date.getMonth();
            this.year = this.date.getFullYear();
            this._triggerChange();
            /**
             * Set date event
             * @property {Date} date
             */
            this.$emit('set-date', this.date);
        },
        isCurrentMonthDate(date) {
            if (this.isValid(date)) {
                return this.month == date.getMonth();
            }
            return true;
        },
        isDisabledDate(date) {
            let d = this.isValid(date) ? date : new Date(this.year, this.month, date);
            let { min, max, allowed } = this;
            return (min && d < min) || (max && d > max) || (allowed && !allowed(d));
        },
        isRangeStartDate(date) {
            let d = this.isValid(date) ? date : new Date(this.year, this.month, date);
            if (this.isExpandedRange) {
                const dateFound = this.dateList.find(({ dateStart, dateEnd }) => {
                    return dateStart && +d == +dateStart;
                });
                return dateFound != null;
            }

            return this.dateStart && +d == +this.dateStart;
        },
        isRangeEndDate(date) {
            let d = this.isValid(date) ? date : new Date(this.year, this.month, date);
            if (this.isExpandedRange) {
                const dateFound = this.dateList.find(({ dateStart, dateEnd }) => {
                    return dateEnd && +d == +dateEnd;
                });
                return dateFound != null;
            }

            return this.dateEnd && +d == +this.dateEnd;
        },
        isRangeDate(date) {
            let d = this.isValid(date) ? date : new Date(this.year, this.month, date);
            if (this.isExpandedRange) {
                const dateFound = this.dateList.find(({ dateStart, dateEnd }) => {
                    if (dateStart && +d == +dateStart) {
                        return true;
                    }
                    return dateStart && dateEnd && d >= dateStart && d <= dateEnd;
                });
                return dateFound != null;
            }

            if (this.dateStart && +d == +this.dateStart) {
                return true;
            }
            return this.dateStart && this.dateEnd && d >= this.dateStart && d <= this.dateEnd;
        },
        isSelectedDate(date) {
            if (this.calendarType === CalendarTypes.YEAR_TYPE) {
                const currentYearStart = new Date(date, 0, 1);
                const currentYearEnd = new Date(date, 11, 31);
                return this.dateList.find(({ dateStart, dateEnd }) => {
                    return dateStart && dateEnd && currentYearStart >= dateStart && currentYearEnd <= dateEnd;
                });
            }

            if (this.calendarType === CalendarTypes.MONTH_TYPE) {
                const currentMonthStart = new Date(date.getFullYear(), date.getMonth(), 1);
                const currentMonthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
                return this.dateList.find(({ dateStart, dateEnd }) => {
                    return dateStart && dateEnd && currentMonthStart >= dateStart && currentMonthEnd <= dateEnd;
                });
            }

            if (this.calendarType === CalendarTypes.QUARTERS_TYPE) {
                const quarterMonthStart = new Date(
                    date.date.quarterDateStart.getFullYear(),
                    date.date.quarterDateStart.getMonth(),
                    1
                );
                const quarterMonthEnd = new Date(
                    date.date.quarterDateEnd.getFullYear(),
                    date.date.quarterDateEnd.getMonth(),
                    0
                );
                return this.dateList.find(({ dateStart, dateEnd }) => {
                    return dateStart && dateEnd && quarterMonthStart >= dateStart && quarterMonthEnd <= dateEnd;
                });
            }

            let d = this.isValid(date) ? date : new Date(this.year, this.month, date);
            return this.date && +this.date == +date;
        },
        isWeekendDate(date) {
            let d = this.isValid(date) ? date : new Date(this.year, this.month, date);
            return this.weekendDays.includes(d.getDay());
        },
        isTodayDate(date) {
            let d = this.isValid(date) ? date : new Date(this.year, this.month, date);
            let now = new Date();
            return (
                now.getFullYear() === d.getFullYear() &&
                now.getMonth() === d.getMonth() &&
                now.getDate() === d.getDate()
            );
        },
        isWeekendDay(day) {
            return this.weekendDays.includes(day);
        },
        _triggerChange() {
            let val = this.date;
            if (this.isExpandedRange) {
                val = this.dateList;
            } else if (this.range) {
                val = this.dateStart && this.dateEnd ? [this.dateStart, this.dateEnd] : [];
            }
            this.syncMonthYear = false;
            /**
             * Date change event
             * @property {Date} date
             */
            this.$emit('input', val);
            /**
             * Date change event
             * @property {Date} date
             */
            this.$emit('change', val);
        },
        handleDateSelection(periods, clickedDate) {
            const activePeriodIndex = periods.findIndex((p) => p.dateEnd === null);

            if (activePeriodIndex >= 0) {
                const activePeriod = periods[activePeriodIndex];

                // Сортируем даты: меньшая -> большая
                const newPeriod = {
                    dateStart: activePeriod.dateStart < clickedDate ? activePeriod.dateStart : clickedDate,
                    dateEnd: activePeriod.dateStart < clickedDate ? clickedDate : activePeriod.dateStart
                };

                const actualPeriods = periods.filter((period, index) => {
                    if (index === activePeriodIndex) {
                        return false;
                    }

                    if (!period.dateEnd) {
                        return true;
                    }

                    const hasOverlap = period.dateStart <= newPeriod.dateEnd && period.dateEnd >= newPeriod.dateStart;
                    return !hasOverlap;
                });
                actualPeriods.push(newPeriod);
                return actualPeriods;
            } else {
                const actualPeriods = periods.filter((period) => {
                    const containsClicked = clickedDate >= period.dateStart && clickedDate <= period.dateEnd;
                    return !containsClicked;
                });

                actualPeriods.push({
                    dateStart: clickedDate,
                    dateEnd: null
                });

                return actualPeriods;
            }
        },
        resolveDateEnd(date) {
            if (!this.isExpandedRange) {
                return this.dateEnd;
            }
            let d = this.isValid(date) ? date : new Date(this.year, this.month, date);
            const dateFound = this.dateList.find(({ dateStart, dateEnd }) => dateStart <= d && d < dateEnd);
            return dateFound != null ? dateFound.dateEnd : false;
        },
        currentDates() {
            if (this.calendarType === CalendarTypes.YEAR_TYPE) {
                let dates = [...new Array(20)].map((v, i) => new Date(this.year + i, 0, 1).getFullYear());
                return dates;
            }
            if (this.calendarType === CalendarTypes.MONTH_TYPE) {
                let dates = [...new Array(12)].map((v, i) => new Date(this.year, i, 1));
                return dates;
            }
            if (this.calendarType === CalendarTypes.QUARTERS_TYPE) {
                const quarter1 = {
                    quarterDateStart: new Date(this.year, 0, 1),
                    quarterDateEnd: new Date(this.year, 3, 0)
                };
                const quarter2 = {
                    quarterDateStart: new Date(this.year, 3, 1),
                    quarterDateEnd: new Date(this.year, 6, 0)
                };
                const quarter3 = {
                    quarterDateStart: new Date(this.year, 6, 1),
                    quarterDateEnd: new Date(this.year, 9, 0)
                };
                const quarter4 = {
                    quarterDateStart: new Date(this.year, 9, 1),
                    quarterDateEnd: new Date(this.year + 1, 0, 0)
                };
                return [
                    { date: quarter1, name: 'Q1' },
                    { date: quarter2, name: 'Q2' },
                    { date: quarter3, name: 'Q3' },
                    { date: quarter4, name: 'Q4' }
                ];
            }
            return this.currentMonthDates;
        },
        resolveCalendarKey(n) {
            if (this.calendarType === CalendarTypes.YEAR_TYPE) {
                return n;
            }

            if (this.calendarType === CalendarTypes.MONTH_TYPE) {
                return `${n.getFullYear()}-${n.getMonth()}}`;
            }

            if (this.calendarType === CalendarTypes.QUARTERS_TYPE) {
                return n;
            }
            return `${n.getMonth()}-${n.getDate()}`;
        },
        canPick(date) {
            // Проверка на кварталы
            if (
                typeof date === 'object' &&
                date !== null &&
                Object.prototype.toString.call(date) === '[object Object]'
            ) {
                return this.canPick(date?.date?.quarterDateStart) && this.canPick(date?.date?.quarterDateEnd);
            }

            const startLimitDate = createDateFromDPProp(this.calendarLimit.startDate);
            const endLimitDate = createDateFromDPProp(this.calendarLimit.endDate);

            if (this.calendarType === CalendarTypes.YEAR_TYPE) {
                const startYearDate = new Date(date, 0, 1);
                const endYearDate = new Date(date, 11, 31);
                const startYearPass = startLimitDate == null || startYearDate >= startLimitDate;
                const endYearPass = endLimitDate == null || endYearDate <= endLimitDate;

                return startYearPass && endYearPass;
            }

            if (this.calendarType === CalendarTypes.MONTH_TYPE) {
                const startMonthDate = new Date(date.getFullYear(), date.getMonth(), 1);
                const endMonthDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);

                if (startLimitDate != null && startMonthDate <= startLimitDate) {
                    return false;
                }

                if (endLimitDate != null && endMonthDate >= endLimitDate) {
                    return false;
                }
                return true;
            }

            if (startLimitDate != null && date <= startLimitDate) {
                return false;
            }

            if (endLimitDate != null && date >= endLimitDate) {
                return false;
            }
            return true;
        }
    }
};
</script>
