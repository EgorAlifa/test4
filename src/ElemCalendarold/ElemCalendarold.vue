<template>
    <w-elem>
        <div v-if="props.isExpandedRange" class="date-list">
            <span v-for="(curDate, idx) in date" class="date-list__element">
                {{ resolveFormattedDatesString(curDate) }}
                <i class="mdi mdi-close cursor-pointer" @click="removeDate(idx)"></i>
            </span>
        </div>
        <component :is="component" v-model="date" v-bind="dpBinds" v-on="dpEvents">
            <template #[dpSlotNames.input]="{ inputId, valueLabel, inputBinds, inputEvents }">
                <w-intervals v-if="haveIntervals" v-model="intervals" @change="onIntervalsChange"></w-intervals>
                <input
                    v-else
                    class="ui-input-date-picker-input custom-input w-100"
                    type="text"
                    :disabled="!props.isManualDateInput"
                    :id="inputId"
                    :value="valueLabel"
                    v-bind="inputBinds"
                    v-on="inputEvents"
                    @change="onChange" />
            </template>

            <template #clear="{ clear }">
                <div v-if="haveIntervals"></div>
                <div
                    v-else
                    v-show="props.inputMode.isResetDate"
                    class="icon cursor-pointer w-auto h-auto mar-left-2"
                    @click="clear">
                    <i class="mdi mdi-close"></i>
                </div>
            </template>

            <template #icon="{ toggle: togglePopover }">
                <span
                    class="ui-input-date-picker-icon cursor-pointer mdi mar-left-3"
                    :class="inputModeIconClass"
                    @click="onToggleIconClick(togglePopover)"></span>
            </template>

            <template #[dpSlotNames.left]>
                <div class="preset-holder">
                    <div v-if="props.hardPresets" class="preset-slot">
                        <button
                            class="btn btn-small d-flex w-100"
                            :class="resolveHardPresetBtnClass(CalendarTypes.DAY_TYPE)"
                            @click="setCalendarType(CalendarTypes.DAY_TYPE)">
                            День
                        </button>
                        <button
                            class="btn btn-small d-flex w-100"
                            :class="resolveHardPresetBtnClass(CalendarTypes.WEEK_TYPE)"
                            @click="setCalendarType(CalendarTypes.WEEK_TYPE)">
                            Неделя
                        </button>
                        <button
                            class="btn btn-small d-flex w-100"
                            :class="resolveHardPresetBtnClass(CalendarTypes.MONTH_TYPE)"
                            @click="setCalendarType(CalendarTypes.MONTH_TYPE)">
                            Месяц
                        </button>
                        <button
                            class="btn btn-small d-flex w-100"
                            :class="resolveHardPresetBtnClass(CalendarTypes.QUARTERS_TYPE)"
                            @click="setCalendarType(CalendarTypes.QUARTERS_TYPE)">
                            Квартал
                        </button>
                        <button
                            class="btn btn-small d-flex w-100"
                            :class="resolveHardPresetBtnClass(CalendarTypes.YEAR_TYPE)"
                            @click="setCalendarType(CalendarTypes.YEAR_TYPE)">
                            Год
                        </button>
                    </div>
                    <div
                        v-if="props.enableOffsets && calendarType === CalendarTypes.DAY_TYPE"
                        class="preset-slot"
                        :style="presetSlotStyles">
                        <button
                            v-for="daysCount in props.offsets"
                            class="btn btn-small d-flex w-100"
                            :key="daysCount"
                            :style="resolveOffsetBtnStyle(daysCount)"
                            :class="resolveOffsetBtnClass(daysCount)"
                            @click="setDaysOffset(daysCount)">
                            {{ pluralize(daysCount) }}
                        </button>
                    </div>
                </div>
            </template>

            <template
                #[dpSlotNames.header]="{ nextMonth, prevMonth, setYear, month, monthName, year, prevYear, nextYear }">
                <w-intervals
                    v-if="haveIntervals && !props.isInputMode"
                    v-model="intervals"
                    @change="onIntervalsChange"></w-intervals>

                <div class="ui-date-picker-header elem-calendar-header" :style="headerStyle">
                    <div class="flex-shrink nobr">
                        <div
                            class="elem-calendar-header__icon"
                            :style="iconStyle"
                            @click="
                                resolveHeaderClickChevron({ month, year, paramMonth: prevMonth, paramYear: prevYear })
                            ">
                            <i class="mdi mdi-chevron-left"></i>
                        </div>
                    </div>

                    <div class="d-flex flex-grow" :class="props.header.classPosition">
                        <div class="caption" :class="props.caption.classPosition">
                            <span v-if="props.caption.show" class="caption__text">{{ props.caption.text }}</span>
                            <div class="d-flex">
                                <span
                                    v-if="
                                        calendarType === CalendarTypes.DAY_TYPE ||
                                        calendarType === CalendarTypes.WEEK_TYPE
                                    ">
                                    {{ monthName }}&#160;
                                </span>
                                <span
                                    class="outline-none"
                                    contenteditable="true"
                                    @keypress="onSetYear($event, setYear)"
                                    @blur="(e) => setYear(Number(e.target.textContent))">
                                    {{ year }}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div class="flex-shrink nobr">
                        <div
                            class="elem-calendar-header__icon"
                            :style="iconStyle"
                            @click="
                                resolveHeaderClickChevron({ month, year, paramMonth: nextMonth, paramYear: nextYear })
                            ">
                            <i class="mdi mdi-chevron-right"></i>
                        </div>
                    </div>
                </div>
            </template>

            <template #[dpSlotNames.cellDay]="{ dayName, isWeekend }">
                <div
                    class="w-100 h-100 d-flex flex-center"
                    :class="resolveDayNameClass(isWeekend)"
                    :style="resolveDayNameStyle(isWeekend)">
                    {{ dayName }}
                </div>
            </template>

            <template #[dpSlotNames.footer]>
                <div class="d-flex flex-col" v-if="props.resetBtn.enabled">
                    <button class="dp-reset-btn btn btn-primary" @click="clear">{{ props.resetBtn.text }}</button>
                </div>
            </template>

            <template
                #[dpSlotNames.cellDate]="{
                    date: cellDate,
                    isDisabledDate,
                    dateEnd,
                    isCurrentMonthDate,
                    isSelected,
                    isToday,
                    isInRange,
                    isRangeStart,
                    isRangeEnd,
                    isWeekend,
                    setDate,
                    canPick
                }">
                <template v-if="calendarType === CalendarTypes.YEAR_TYPE">
                    <div
                        class="cal-date"
                        :style="
                            resolveCellStyle({
                                isToday,
                                isSelected,
                                isInRange,
                                date: cellDate,
                                isCurrentMonthDate,
                                isWeekend,
                                isRangeStart,
                                isRangeEnd
                            })
                        "
                        @click.self="onDateYearSelected({ setDate, cellDate, $event, canPick })">
                        {{ cellDate }}
                    </div>
                </template>
                <template v-else-if="calendarType === CalendarTypes.MONTH_TYPE">
                    <div
                        class="cal-date"
                        :style="
                            resolveCellStyle({
                                isToday,
                                isSelected,
                                isInRange,
                                date: cellDate,
                                isCurrentMonthDate,
                                isWeekend,
                                isRangeStart,
                                isRangeEnd
                            })
                        "
                        @click.self="onDateMonthSelected({ setDate, cellDate, $event, canPick })">
                        {{ RussianMonthsShort[cellDate.getMonth()] }}
                    </div>
                </template>
                <template v-else-if="calendarType === CalendarTypes.QUARTERS_TYPE">
                    <div
                        class="cal-date"
                        :style="
                            resolveCellStyle({
                                isToday,
                                isSelected,
                                isInRange,
                                date: cellDate,
                                isCurrentMonthDate,
                                isWeekend,
                                isRangeStart,
                                isRangeEnd
                            })
                        "
                        @click.self="onDateQuarterSelected({ setDate, cellDate: cellDate.date, $event, canPick })">
                        {{ cellDate.name }}
                    </div>
                </template>
                <template v-else>
                    <div
                        v-if="
                            props.range.shouldUseCustomStyle &&
                            (isRangeStart || isRangeEnd) &&
                            isRangeStart !== isRangeEnd
                        "
                        class="cal-date-before"
                        :style="cellBeforeStyles"
                        :class="resolveCustomCellClass({ isRangeStart, isRangeEnd, dateEnd })" />
                    <div
                        class="cal-date"
                        :style="
                            resolveCellDayStyle({
                                isToday,
                                isSelected,
                                isInRange,
                                date: cellDate,
                                isCurrentMonthDate,
                                isWeekend,
                                isRangeStart,
                                isRangeEnd,
                                canPick
                            })
                        "
                        :class="
                            resolveCellClass({
                                isRangeStart,
                                isToday,
                                isSelected,
                                isRangeEnd,
                                isInRange,
                                dateEnd,
                                date: cellDate
                            })
                        "
                        @click.self="
                            calendarType === CalendarTypes.WEEK_TYPE
                                ? onDateWeekSelected({ setDate, cellDate, $event, canPick })
                                : onDateSelected({ setDate, cellDate, $event, canPick })
                        ">
                        {{ cellDate.getDate() }}
                        <span
                            v-if="isIndexVisibleForDate(cellDate) && isCurrentMonthDate"
                            :style="indexStyle"
                            class="pos-abs">
                            {{ getIndexByDate(cellDate) }}
                        </span>
                        <div
                            v-for="(record, idx) in coursesDataByDate[formatDateToIso(cellDate)]"
                            class="d-flex pos-abs cursor-default"
                            v-show="isMarksVisibleForDate(cellDate)"
                            :key="idx"
                            :class="resolveMarkProperty('classPosition', record)">
                            <span
                                class="mdi"
                                :class="resolveMarkProperty('mdiClass', record)"
                                :style="resolveMarkProperty('style', record)" />
                        </div>
                    </div>
                </template>
            </template>
        </component>

        <div v-if="isLoading" class="shim">
            <div class="shim-content d-flex flex-v-center flex-h-center h-100">
                <div class="preloader pad-l1 color-primary"></div>
            </div>
        </div>

        <div class="alert alert-error" v-if="error">
            <div class="close" @click="error = null">
                <i class="mdi mdi-close"></i>
            </div>
            <div class="alert-body text-small pre-wrap">{{ error }}</div>
        </div>

        <div v-if="recordsForDay" ref="courseInfo" class="popup-window" tabindex="-1" @blur="recordsForDay = null">
            <div v-for="(record, idx) in recordsForDay" :key="idx" class="popup-window-item pad-5">
                <div class="d-flex flex-h-space-between flex-v-center">
                    <p class="d-flex flex-v-center text-upper">
                        <span
                            class="mar-right-3 mdi"
                            :class="resolveMarkProperty('mdiClass', record)"
                            :style="resolveMarkProperty('style', record)"></span>
                        <span class="ui-muted text-xsmall">{{ formatDateTimeInRus(record.sourceDate) }}</span>
                        <span class="ui-muted text-xsmall mar-left-7">{{ record.educationForm }}</span>
                    </p>
                    <p
                        v-if="idx === 0"
                        class="mdi mdi-window-close text-h4 cursor-pointer"
                        @click="recordsForDay = null"></p>
                </div>

                <p class="text-base">{{ record.moduleName }}. {{ record.courseName }}</p>
                <span class="ui-muted text-small">{{ record.moduleDescription }}</span>
            </div>
        </div>
    </w-elem>
</template>

<script>
/* eslint-disable no-magic-numbers */
import { Elem } from '@goodt-wcore/core';
import { useElemDatasetMixin, ElemDatasetMixinTypes } from '@goodt-common/data';
import { pluralize } from '@goodt-common/utils';
import UiInputDatePicker from './components/InputDatePicker';
import UiDatePicker from './components/DatePicker';
import { camelCase } from 'lodash';
import { meta, Vars, Events } from './descriptor';
import {
    DATE_FORMAT_ISO,
    DATE_FORMAT_LOCAL,
    PresetPosition,
    KeyCodes,
    CalendarTypes,
    RussianMonthsShort
} from './constants';
import {
    dayjs,
    formatDateToIso,
    formatDateToLocal,
    isConditionExecuted,
    isDateValid,
    monthNumber,
    createIntervals,
    buildIntervalVarAliasKey,
    isValidFormat,
    buildCssVars,
    createDateFromDPProp
} from './utils';
import WIntervals from './components/Intervals.vue';
import { ElemInstanceTypeDescriptor } from './types';

export default {
    meta,
    extends: Elem,
    components: {
        WIntervals,
        UiDatePicker,
        UiInputDatePicker
    },
    mixins: [useElemDatasetMixin()],
    hooks: {
        then() {
            this.buildDimensionValues();
        }
    },

    data() {
        return {
            date: null,
            today: null,
            prevDate: null,
            error: null,
            daysOffset: 0,
            dimensionValues: [],
            intervals: createIntervals(),
            recordsForDay: null,
            calendarType: CalendarTypes.DAY_TYPE,
            ...ElemDatasetMixinTypes,
            ...ElemInstanceTypeDescriptor
        };
    },

    computed: {
        component() {
            return this.props.isInputMode ? 'ui-input-date-picker' : 'ui-date-picker';
        },
        dpBinds() {
            const { active: range } = this.props.range;
            const { isInputMode, isExpandedRange } = this.props;
            const { placeholder } = this.props.inputMode;
            return isInputMode
                ? {
                      placeholder: range ? `${placeholder} - ${placeholder}` : placeholder,
                      toLocalFormat: formatDateToLocal,
                      datepicker: {
                          range,
                          style: this.calendarStyles,
                          class: this.calendarClasses
                      },
                      delimiter: ' - ',
                      style: this.inputModeStyles,
                      class: this.calendarClasses
                  }
                : {
                      range,
                      isExpandedRange,
                      style: this.calendarStyles,
                      class: this.calendarClasses,
                      calendarType: this.calendarType,
                      calendarLimit: this.formatCalendarLimit
                  };
        },
        dpEvents() {
            const { isInputMode, enableOffsets } = this.props;
            // TODO SQLLike при (isInputMode || enableOffsets) === true не работает, отдебажить ивент set-date и input
            return isInputMode || enableOffsets
                ? { 'set-date': this.commitDateToStore, clear: this.clear }
                : { input: this.commitDateToStore };
        },
        dpSlotNames() {
            const prefix = this.props.isInputMode ? 'dp-' : '';
            return {
                input: 'input',
                header: `${prefix}header`,
                footer: `${prefix}footer`,
                left: `${prefix}left`,
                right: `${prefix}right`,
                cellDay: `${prefix}cell-day`,
                cellDate: `${prefix}cell-date`
            };
        },
        headerStyle() {
            const { color, width, height, fontSize, fontFamily, fontStyle, fontWeight, backgroundColor, toneGradient } =
                this.props.header;
            const background = this.resolveGradientBackground(backgroundColor, toneGradient);
            return this.$genCssVarsStyle(
                buildCssVars({
                    prefix: 'header',
                    properties: { color, fontSize, fontFamily, fontStyle, fontWeight, background, width, height }
                })
            );
        },
        iconStyle() {
            const { iBackgroundColor, iconGradient } = this.props.header;
            const background = this.resolveGradientBackground(iBackgroundColor, iconGradient);
            return this.$genCssVarsStyle(
                buildCssVars({
                    prefix: 'header-icon',
                    properties: { background }
                })
            );
        },
        cellBlockStyle() {
            const {
                cellWidth,
                cellHeight,
                gap,
                cellFontSize,
                range: { shouldUseCustomStyle, active: isActive }
            } = this.props;
            const haveCustomStyle = isActive && shouldUseCustomStyle;
            return {
                width: cellWidth,
                height: cellHeight,
                'box-sizing': haveCustomStyle ? 'content-box' : 'border-box',
                [haveCustomStyle ? 'padding' : 'margin']: `${gap.vertical} ${gap.horizontal}`,
                fontSize: cellFontSize
            };
        },
        coursesDataByDate() {
            const { dimension, metric, moduleName, moduleDescription, courseName, educationForm } = this.props;
            if (
                // eslint-disable-next-line yoda
                false ===
                [this.hasResult, metric, moduleName, moduleDescription, courseName, educationForm].every(Boolean)
            ) {
                return {};
            }

            const {
                result: { rows }
            } = this;

            return rows.reduce((acc, row) => {
                const dateType = row[dimension];
                const moduleNames = row[moduleName].split(',');
                const moduleDescriptions = row[moduleDescription].split(',');
                const courseNames = row[courseName].split(',');
                const educationForms = row[educationForm].split(',');
                const sourceDates = row[metric].split(',');

                sourceDates.forEach((sourceDate, idx) => {
                    const keyDate = sourceDate.slice(0, 10);
                    const { [keyDate]: courseItems = [] } = acc;

                    acc[keyDate] = [
                        ...courseItems,
                        {
                            dateType,
                            moduleName: moduleNames[idx],
                            moduleDescription: moduleDescriptions[idx],
                            courseName: courseNames[idx],
                            educationForm: educationForms[idx],
                            sourceDate
                        }
                    ];
                });

                return acc;
            }, {});
        },
        indexStyle() {
            const { position, location, color, fontSize, fontFamily, paddingVertical, paddingHorizontal } =
                this.props.indexes;
            const styles = { color, fontSize, fontFamily };

            styles[position] = paddingVertical;
            styles[location] = paddingHorizontal;

            return styles;
        },
        indexesWithDates() {
            const { metric: DATE_METRIC, conditions } = this.props;
            const { metric: INDEX_METRIC } = this.props.indexes;
            if (this.hasResult === false || INDEX_METRIC == null) {
                return [];
            }

            const { rows } = this.result;
            return rows.flatMap((item) => {
                const datesString = item[DATE_METRIC] == null ? '' : item[DATE_METRIC];

                const { [INDEX_METRIC]: metricsString = '' } = item;
                const dates = datesString.split(',').map(formatDateToLocal);
                const indexes = metricsString.split(',');
                /** checking conditions */
                const shouldShowIndex = (indexValue) =>
                    conditions.every(({ condition, type, value }) => {
                        const filterValue = type === 'Значение' ? value : item[value];
                        return isConditionExecuted(condition, Number(indexValue), Number(filterValue));
                    });

                // prettier-ignore
                return indexes.map((index, idx) =>
                    shouldShowIndex(index)
                        ? { date: dates[idx], index }
                        : null
                ).filter(Boolean);
            });
        },
        hasResult() {
            const {
                result,
                props: { dimension }
            } = this;

            return result?.rows?.length > 0 && dimension !== '';
        },
        inputModeStyles() {
            const { style, toneGradient } = this.props.inputMode;
            return this.$genCssVarsStyle({
                'input-mode-background': this.resolveGradientBackground(style.background, toneGradient)
            });
        },
        calendarStyles() {
            const { isEnabled, position } = this.props.presetStyles;
            const { calendarBackground, calendarExtra } = this.props;
            const { borderColor, borderRadius, borderStyle, borderWidth } = calendarExtra.border;
            return this.$genCssVarsStyle({
                'flex-direction': isEnabled ? position : PresetPosition.LEFT,
                background: this.resolveGradientBackground(calendarBackground, calendarExtra.toneGradient),
                border: [borderWidth, borderStyle, borderColor].join(' '),
                'border-radius': borderRadius,
                'box-shadow': this.resolveBoxShadow(calendarExtra.shadow)
            });
        },
        calendarClasses() {
            const {
                presetStyles: { isEnabled }
            } = this.props;
            return `${isEnabled ? 'elem-calendar-preset-slot-custom' : ''} elem-calendar-datepicker-custom`;
        },
        cellBeforeStyles() {
            const { borderRadius = 'var(--border-radius5)' } = this.props.selectedDate;
            const { backgroundRangeLine, shouldUseCustomStyle, backgroundColor } = this.props.range;
            const cellStyle = {
                borderRadius: borderRadius != null && borderRadius !== '' ? borderRadius : null,
                background:
                    !shouldUseCustomStyle || backgroundRangeLine == null || backgroundRangeLine === ''
                        ? backgroundColor
                        : backgroundRangeLine
            };

            return this.$genCssVarsStyle(
                buildCssVars({
                    prefix: 'cal-date-before',
                    properties: { borderRadius: cellStyle.borderRadius, background: cellStyle.background }
                })
            );
        },
        presetSlotStyles() {
            const { backgroundPreset: background, orientation: flexDirection, isEnabled } = this.props.presetStyles;
            return isEnabled
                ? this.$genCssVarsStyle(
                      buildCssVars({
                          prefix: 'preset-slot',
                          properties: { background, flexDirection }
                      })
                  )
                : {};
        },
        formatCalendarLimit() {
            const { limitStart, limitEnd } = this.props.datePickerLimit;
            const startDate = limitStart === '' ? null : limitStart;
            const endDate = limitEnd === '' ? null : limitEnd;
            return { startDate, endDate };
        }
    },

    computedEditor: {
        haveIntervals() {
            const { interval, range } = this.props;
            return interval.isUsed && range.active === true;
        },
        inputModeIconClass() {
            const { inputMode } = this.props;
            return [inputMode.icon.class, this.haveIntervals ? 'mar-top-4' : ''];
        }
    },

    subscribe: [
        {
            event: [Events.AUTO_REFRESH],
            handler() {
                this.resetData();
            }
        }
    ],
    watchStore: [
        {
            vars: [Vars.DATE],
            handler([date]) {
                const { isInputMode, range } = this.props;
                if (date == null) {
                    this.date = range.active === true ? [] : null;
                    return;
                }
                if (
                    typeof date === 'string' &&
                    isDateValid(this.buildDate(date, DATE_FORMAT_ISO)) &&
                    range.active === false
                ) {
                    const value = this.buildDate(date, DATE_FORMAT_ISO);
                    this.date = isInputMode ? this.formatDateToLocal(value) : value;
                    return;
                }
                if (Array.isArray(date) && this.buildDate(date, DATE_FORMAT_ISO).every(isDateValid)) {
                    let value;
                    if (range.active) {
                        value = this.buildDate([date[0], date[date.length - 1]], DATE_FORMAT_ISO);
                        const [start, end] = value;
                        value = start < end ? [start, end] : [end, start];
                        this.date = isInputMode ? this.formatDateToLocal(value) : value;
                        return;
                    }

                    value = this.buildDate(date, DATE_FORMAT_ISO);
                    value = Math.max(...value);
                    this.date = isInputMode ? this.formatDateToLocal(value) : value;
                }
            }
        }
    ],

    watchEditor: {
        'props.isInputMode': {
            handler() {
                this.date = null;
            }
        },
        'props.enableOffsets': {
            handler() {
                this.daysOffset = 0;
            }
        },
        'props.dimension': {
            handler() {
                this.buildDimensionValues();
            }
        }
    },
    static: {
        CalendarTypes,
        RussianMonthsShort
    },
    created() {
        this.resetData();
    },

    methods: {
        clear() {
            const { result, props } = this;
            const commitState = { [Vars.DATE]: null };
            const extraCommitState = Object.keys({ ...result?.rows?.[0] }).reduce(
                (acc, key) => ({ ...acc, [key]: null }),
                {}
            );
            this.$storeCommit({
                ...commitState,
                ...extraCommitState
            });
            this.resetData();
        },
        resolveGradientBackground(backgroundColor, backgroundFields) {
            const { isUsed, direction, colors } = backgroundFields ?? {};
            return isUsed ? `linear-gradient(${[direction, colors[0], colors[1]].join(',')})` : backgroundColor;
        },
        resolveBoxShadow(shadow) {
            const { isUsed, blur, spread, color, offsetX, offsetY, inset } = shadow ?? {};
            return isUsed ? [offsetX, offsetY, blur, spread, color, inset ? 'inset' : ''].join(' ') : '';
        },
        onSetYear(event, setYear) {
            const { keyCode, key, target } = event;
            if (/\d/i.test(key) === false) {
                event.preventDefault();
            }
            if (keyCode === KeyCodes.ENTER) {
                setYear(Number(target.textContent));
            }
        },
        resetData() {
            const { range, isExpandedRange } = this.props;

            if (isExpandedRange && this.date != null) {
                const dateLength = this.date.length;
                for (let i = 0; dateLength > i; i++) {
                    this.date.splice(0, 1);
                }
            } else {
                this.date = range.active === true ? [] : null;
            }
            this.today = dayjs().format(DATE_FORMAT_ISO);
            this.intervals = createIntervals();
        },
        onIntervalsChange(data) {
            this.intervals = data;
            const { intervals, result } = this;
            const sendValues = Object.entries(intervals).reduce((acc, [range, periods]) => {
                const fields = Object.entries(periods).reduce((struct, [field, period]) => {
                    const { date, month, year } = intervals[range];
                    const monthNum = monthNumber(month);
                    const composedDate = `${year}-${monthNum}-${date}`;
                    const isIsoDate = isValidFormat(composedDate, DATE_FORMAT_ISO);
                    const key = buildIntervalVarAliasKey({ field, range });
                    const actualValue = field === 'date' && period != null ? composedDate : period;
                    return isIsoDate || period == null || (period !== '' && field !== 'date')
                        ? { ...struct, [Vars[key]]: actualValue }
                        : struct;
                }, {});
                return { ...acc, ...fields };
            }, {});
            this.$storeCommit(sendValues);

            const nullPeriods = Object.entries(intervals).reduce(
                (acc, [range, periods]) => ({ ...acc, [range]: Object.values(periods).every((elem) => elem === null) }),
                {}
            );
            if (nullPeriods.start === true || nullPeriods.end === true) {
                this.date = [];
                const { rows = [] } = result ?? {};
                const fields = Object.keys(rows[0] ?? []);
                const nullFields = fields.reduce((acc, field) => ({ ...acc, [field]: null }), {});
                this.$storeCommit({ [Vars.DATE]: null, ...nullFields });
            }

            const dateStart = sendValues[Vars.DATE_INTERVAL_START];
            const dateEnd = sendValues[Vars.DATE_INTERVAL_END];
            if (dateStart == null || dateEnd == null || new Date(dateStart) > new Date(dateEnd)) {
                return;
            }
            this.date = this.props.isInputMode
                ? this.formatDateToLocal([dateStart, dateEnd])
                : this.buildDate([dateStart, dateEnd]);
            this.commitDateToStore();
        },
        onChange(event) {
            const { value } = event.target;
            const { range } = this.props;
            let date = null;

            if (range.active) {
                const dateLocal = this.buildDate(value.split(' - '), DATE_FORMAT_LOCAL);
                const [dateOne, dateTwo] = dateLocal;
                if (isDateValid(dateOne) && isDateValid(dateTwo) && dateOne < dateTwo) {
                    this.date = this.formatDateToLocal(dateLocal);
                    date = this.formatDateToIso(this.fillRangeWithDates(dateOne, dateTwo));
                }
            } else if (dayjs(value, DATE_FORMAT_LOCAL).isValid()) {
                this.date = value;
                date = this.formatDateToIso(value);
            }

            this.$storeCommit({ [Vars.DATE]: date });
        },
        onToggleIconClick(togglePopover) {
            togglePopover();
            this.prevDate = null;
        },
        fillRangeWithDates(dateOne, dateTwo) {
            const dates = [dateOne];
            while (dates[dates.length - 1].getTime() !== dateTwo.getTime()) {
                dates.push(
                    dayjs(dates[dates.length - 1])
                        .add(1, 'd')
                        .toDate()
                );
            }
            return dates;
        },
        buildDimensionValues() {
            const {
                result,
                props: { dimension }
            } = this;

            if (!this.hasResult) {
                return;
            }
            this.dimensionValues = result.rows.map((row) => row[dimension]);
        },
        formatDateToLocal(date) {
            return Array.isArray(date) ? date.map(formatDateToLocal) : formatDateToLocal(date);
        },
        formatDateToIso(date) {
            return Array.isArray(date) ? date.map(formatDateToIso) : formatDateToIso(date);
        },
        buildDate(value, DATE_FORMAT) {
            return Array.isArray(value)
                ? value.map((str) => dayjs(str, DATE_FORMAT).toDate())
                : dayjs(value, DATE_FORMAT).toDate();
        },

        resolveCommittingDate({ activeDate, committingDate }) {
            const { isInputMode, isExpandedRange, sqlLikeVarName, range } = this.props;

            if (isExpandedRange && range.active) {
                if (sqlLikeVarName.isEnable) {
                    return this.resolveStoreSQLStyleVar(activeDate, sqlLikeVarName.varName);
                }
                return activeDate.reduce((acc, { dateStart, dateEnd }) => {
                    if (dateStart != null && dateEnd == null) {
                        return [...acc, this.formatDateToIso(dateStart)];
                    }
                    if (dateEnd == null) {
                        return acc;
                    }
                    const actualDates = this.formatDateToIso(this.fillRangeWithDates(dateStart, dateEnd));
                    return [...acc, ...actualDates];
                }, []);
            }

            if (this.daysOffset !== 0) {
                const dateOne = dayjs(committingDate).subtract(this.daysOffset, 'd').toDate();
                const dateTwo = dayjs(committingDate).subtract(1, 'd').toDate();
                if (sqlLikeVarName.isEnable) {
                    return this.resolveStoreSQLStyleVar(
                        [{ dateStart: dateOne, dateEnd: dateTwo }],
                        sqlLikeVarName.varName
                    );
                }
                this.date = isInputMode ? this.formatDateToLocal([dateOne, dateTwo]) : [dateOne, dateTwo];

                return this.formatDateToIso(this.fillRangeWithDates(dateOne, dateTwo));
            }

            if (activeDate == null || activeDate.length === 0) {
                return null;
            }

            if (range.active === false) {
                if (sqlLikeVarName.isEnable) {
                    return this.resolveStoreSQLStyleVar([{ dateStart: activeDate }], sqlLikeVarName.varName);
                }
                return this.formatDateToIso(activeDate);
            }

            if (activeDate.length === 2) {
                if (sqlLikeVarName.isEnable) {
                    return this.resolveStoreSQLStyleVar(
                        [{ dateStart: activeDate[0], dateEnd: activeDate[1] }],
                        sqlLikeVarName.varName
                    );
                }
                const [dateOne, dateTwo] = isInputMode ? this.buildDate(activeDate, DATE_FORMAT_LOCAL) : activeDate;
                return this.formatDateToIso(this.fillRangeWithDates(dateOne, dateTwo));
            }

            return null;
        },

        resolveCommittingDateValues(committingDate) {
            const { result, props } = this;
            const { rows = [] } = result ?? {};
            const intersectingDates = [committingDate].flat().reduce((acc, dateValue) => {
                const foundRow = rows.find((row) => row[props.metrics.date] === dateValue);
                return foundRow == null ? acc : [...acc, foundRow];
            }, []);
            const fields = intersectingDates.length === 0 || rows.length === 0 ? [] : Object.keys(rows[0]);
            return fields.reduce((acc, field) => {
                const records = intersectingDates.map((record) => record[field]);
                return { ...acc, [field]: props.range.active === true ? records : records[0] };
            }, {});
        },

        commitDateToStore(date) {
            const committingDate = this.resolveCommittingDate({ activeDate: this.date, committingDate: date });
            const sendValues = this.resolveCommittingDateValues(committingDate);
            this.$storeCommit({ [Vars.DATE]: committingDate, ...sendValues });
        },

        commitMonthToStore({ month, year, paramMonth }) {
            paramMonth();
            let monthValue = month;
            let yearValue = year;
            if (this.hasDataset) {
                let currentMonth;
                let currentYear;
                if (/prevMonth/.test(paramMonth.name)) {
                    monthValue--;
                    currentMonth = monthValue < 0 ? 11 : monthValue;
                    currentYear = monthValue < 0 ? --yearValue : yearValue;
                } else if (/nextMonth/.test(paramMonth.name)) {
                    monthValue++;
                    currentMonth = monthValue > 11 ? 0 : monthValue;
                    currentYear = monthValue > 11 ? ++yearValue : yearValue;
                }
                if (currentMonth !== null && currentYear !== null) {
                    const date = this.formatDateToIso(new Date(currentYear, currentMonth, 1));
                    this.$storeCommit({ [Vars.MONTH]: date });
                }
            }
        },
        resolveDayNameStyle(isWeekend) {
            const { days } = this.props;
            const { highlightWeekend } = days;
            const cssProperties = ['color', 'fontFamily', 'fontSize', 'fontStyle', 'fontWeight', 'backgroundColor'];
            const sharedCssProperties = new Set(['backgroundColor']);

            const dayType = isWeekend && highlightWeekend ? '-weekend' : '';

            return this.$genCssVarsStyle(
                buildCssVars({
                    prefix: `cal-day${dayType}`,
                    properties: cssProperties.reduce(
                        (acc, property) => ({
                            ...acc,
                            [property]:
                                days[camelCase(sharedCssProperties.has(property) ? property : `${dayType}-${property}`)]
                        }),
                        {}
                    )
                })
            );
        },
        resolveDayNameClass(isWeekend) {
            const { highlightWeekend } = this.props.days;
            const dayType = isWeekend && highlightWeekend ? '__weekend' : '';
            return `cal-day${dayType}`;
        },
        findDateInDataset(date) {
            const { metric } = this.props;
            const { result } = this;
            if (this.hasResult && metric) {
                return result.rows.find((row) => {
                    if (row[metric] == null) {
                        return false;
                    }
                    return row[metric].split(',').some((fullDate) => fullDate.includes(formatDateToIso(date)));
                });
            }
            return null;
        },
        resolveCellStyle({ isSelected }) {
            const { range, dimension, dateCategories, today, selectedDate, notCurrentMonthDate } = this.props;
            const currentStyle = this.props.presetCellStyle;
            const boxShadow = this.resolveBoxShadow(currentStyle.shadow);
            const cellStyle = { ...this.cellBlockStyle, ...currentStyle.font, boxShadow };
            const getStyle = (styles) => ({ ...cellStyle, ...styles });

            if (isSelected) {
                const { backgroundColor, toneGradient, shadow, border } = selectedDate;
                return this.$genCssVarsStyle(
                    buildCssVars({
                        prefix: 'cal-date',
                        properties: getStyle({
                            borderRadius: selectedDate.borderRadius ?? 'var(--border-radius5)',
                            ...border,
                            color: selectedDate.color,
                            fontSize: selectedDate.fontSize,
                            fontFamily: selectedDate.fontFamily,
                            fontStyle: selectedDate.fontStyle,
                            fontWeight: selectedDate.fontWeight,
                            background: this.resolveGradientBackground(backgroundColor, toneGradient),
                            boxShadow: this.resolveBoxShadow(shadow)
                        })
                    })
                );
            }

            cellStyle.borderRadius = currentStyle.borderRadius;
            return cellStyle;
        },
        resolveCellDayStyle({
            isToday,
            isSelected,
            isInRange,
            date,
            isCurrentMonthDate,
            isWeekend,
            isRangeStart,
            isRangeEnd,
            canPick
        }) {
            const { range, dimension, dateCategories, today, selectedDate, notCurrentMonthDate } = this.props;
            const { workDates, weekendDates } = this.props.cellStyle;
            const currentStyle = isWeekend ? { ...weekendDates } : { ...workDates };
            const boxShadow = this.resolveBoxShadow(currentStyle.shadow);
            const cellStyle = { ...this.cellBlockStyle, ...currentStyle.font, boxShadow };
            const getStyle = (styles) => ({ ...cellStyle, ...styles });

            if (!canPick) {
                return this.$genCssVarsStyle(
                    buildCssVars({
                        prefix: 'cal-date',
                        properties: getStyle({
                            color: notCurrentMonthDate.color,
                            fontSize: notCurrentMonthDate.fontSize,
                            fontFamily: notCurrentMonthDate.fontFamily,
                            fontStyle: notCurrentMonthDate.fontStyle,
                            fontWeight: notCurrentMonthDate.fontWeight,
                            boxShadow: ''
                        })
                    })
                );
            }

            if (range.active === false && this.hasDataset) {
                const row = this.findDateInDataset(date);
                if (row != null) {
                    const category = dateCategories.find(({ name }) => name === row[dimension]);
                    if (category == null) {
                        return {};
                    }
                    const { color, backgroundColor, fontWeight, borderStyle, borderColor, borderWidth, borderRadius } =
                        category;

                    return this.$genCssVarsStyle(
                        buildCssVars({
                            prefix: 'cal-date',
                            properties: getStyle({
                                color,
                                background: backgroundColor,
                                fontWeight,
                                borderStyle,
                                borderColor,
                                borderWidth,
                                borderRadius
                            })
                        })
                    );
                }
            }

            if (range.active === true && this.date != null && this.date.length === 2 && this.prevDate == null) {
                const [startDate, endDate] = this.date;
                const formatDate = dayjs(date).format(DATE_FORMAT_LOCAL);
                if (startDate === formatDate && startDate === endDate) {
                    const { color, backgroundColor } = range;
                    return this.$genCssVarsStyle(
                        buildCssVars({
                            prefix: 'cal-date',
                            properties: getStyle({
                                color,
                                background: backgroundColor,
                                borderRadius: 'var(--border-radius5)'
                            })
                        })
                    );
                }
            }

            if (isToday && !(isSelected || isInRange) && today.withHighlight) {
                const { backgroundColor, toneGradient, shadow, border } = today;
                return this.$genCssVarsStyle(
                    buildCssVars({
                        prefix: 'cal-date',
                        properties: getStyle({
                            borderRadius: today.borderRadius ?? 'var(--border-radius5)',
                            ...border,
                            color: today.color,
                            fontSize: today.fontSize,
                            fontFamily: today.fontFamily,
                            fontStyle: today.fontStyle,
                            fontWeight: today.fontWeight,
                            background: this.resolveGradientBackground(backgroundColor, toneGradient),
                            boxShadow: this.resolveBoxShadow(shadow)
                        })
                    })
                );
            }

            if (isInRange) {
                const { color, backgroundColor, shouldUseCustomStyle, backgroundRangeLine } = range;
                const isEmptyBackgroundRangeLine = backgroundRangeLine == null || backgroundRangeLine === '';
                const isExtremeDate = isRangeStart || isRangeEnd;
                return this.$genCssVarsStyle(
                    buildCssVars({
                        prefix: 'cal-date',
                        properties: getStyle({
                            color,
                            borderRadius: isExtremeDate ? 'var(--border-radius5)' : '',
                            background:
                                !shouldUseCustomStyle || isExtremeDate || isEmptyBackgroundRangeLine
                                    ? backgroundColor
                                    : backgroundRangeLine
                        })
                    })
                );
            }

            if (isSelected) {
                const { backgroundColor, toneGradient, shadow, border } = selectedDate;
                return this.$genCssVarsStyle(
                    buildCssVars({
                        prefix: 'cal-date',
                        properties: getStyle({
                            borderRadius: selectedDate.borderRadius ?? 'var(--border-radius5)',
                            ...border,
                            color: selectedDate.color,
                            fontSize: selectedDate.fontSize,
                            fontFamily: selectedDate.fontFamily,
                            fontStyle: selectedDate.fontStyle,
                            fontWeight: selectedDate.fontWeight,
                            background: this.resolveGradientBackground(backgroundColor, toneGradient),
                            boxShadow: this.resolveBoxShadow(shadow)
                        })
                    })
                );
            }

            const useNotCurrentMonth =
                notCurrentMonthDate.allDates && dayjs(new Date()).month() !== dayjs(date).month();

            if (!isCurrentMonthDate || useNotCurrentMonth) {
                return this.$genCssVarsStyle(
                    buildCssVars({
                        prefix: 'cal-date',
                        properties: getStyle({
                            color: notCurrentMonthDate.color,
                            fontSize: notCurrentMonthDate.fontSize,
                            fontFamily: notCurrentMonthDate.fontFamily,
                            fontStyle: notCurrentMonthDate.fontStyle,
                            fontWeight: notCurrentMonthDate.fontWeight,
                            boxShadow: ''
                        })
                    })
                );
            }
            cellStyle.borderRadius = currentStyle.borderRadius;
            return cellStyle;
        },
        resolveCustomCellClass({ isRangeStart, isRangeEnd, dateEnd }) {
            if (isRangeStart && dateEnd) {
                return 'radius-right-none';
            }

            return isRangeEnd ? 'radius-left-none' : '';
        },

        resolveCellClass({ isRangeStart, isRangeEnd, isInRange, dateEnd, date }) {
            const { active, shouldUseCustomStyle } = this.props.range;
            if (active === false && this.hasDataset) {
                if (this.findDateInDataset(date)) {
                    return 'radius-none';
                }
            }
            if (isRangeStart && !isRangeEnd && dateEnd && !shouldUseCustomStyle) {
                return 'cal-date__extra radius-right-none';
            }
            if (isRangeEnd && !isRangeStart && !shouldUseCustomStyle) {
                return 'cal-date__extra radius-left-none';
            }
            if (isInRange && !(isRangeStart || isRangeEnd)) {
                return 'radius-none';
            }
            return '';
        },

        setDaysOffset(n) {
            this.daysOffset = this.daysOffset === n ? 0 : n;
            if (this.daysOffset !== 0) {
                this.commitDateToStore(dayjs(this.today, DATE_FORMAT_ISO).toDate());
            } else {
                this.date = [];
                this.clear();
            }
        },
        onDateMonthSelected({ $event, cellDate, setDate, canPick }) {
            if (!canPick) {
                return;
            }
            this.closeOpenedDate();

            const startMonth = new Date(cellDate.getFullYear(), cellDate.getMonth(), 1);
            const endMonth = new Date(cellDate.getFullYear(), cellDate.getMonth() + 1, 0);
            this.onDateSelected({ $event, cellDate: startMonth, setDate });
            this.onDateSelected({ $event, cellDate: endMonth, setDate });
        },
        onDateYearSelected({ $event, cellDate, setDate, canPick }) {
            if (!canPick) {
                return;
            }
            this.closeOpenedDate();

            const startYear = new Date(cellDate, 0, 1);
            const endYear = new Date(cellDate, 11, 31);
            this.onDateSelected({ $event, cellDate: startYear, setDate });
            this.onDateSelected({ $event, cellDate: endYear, setDate });
        },
        onDateQuarterSelected({ $event, cellDate, setDate, canPick }) {
            if (!canPick) {
                return;
            }
            this.closeOpenedDate();

            this.onDateSelected({ $event, cellDate: cellDate.quarterDateStart, setDate });
            this.onDateSelected({ $event, cellDate: cellDate.quarterDateEnd, setDate });
        },
        onDateWeekSelected({ $event, cellDate, setDate, canPick }) {
            if (!canPick) {
                return;
            }
            this.closeOpenedDate();
            const { monday, sunday } = this.getWeekStartEnd(cellDate);

            const { startDate, endDate } = this.formatCalendarLimit;
            const startLimitDate = createDateFromDPProp(startDate);
            const endLimitDate = createDateFromDPProp(endDate);
            if (
                (startLimitDate != null && monday <= startLimitDate) ||
                (endLimitDate != null && sunday >= endLimitDate)
            ) {
                return;
            }

            this.onDateSelected({ $event, cellDate: monday, setDate });
            this.onDateSelected({ $event, cellDate: sunday, setDate });
        },

        getWeekStartEnd(date) {
            // Получаем день недели: 0-воскр, 1-пн, 2-вт, 3-ср, 4-чт, 5-пт, 6-сб
            const dayOfWeek = date.getDay();

            // Вычисляем, на сколько дней нужно сдвинуться до понедельника
            // Если воскресенье (0) -> -6 дней назад
            // Если любой другой день -> 1 - dayOfWeek (например, для вторника: 1-2 = -1)
            const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

            // Находим понедельник этой недели
            const monday = new Date(date);
            monday.setDate(date.getDate() + daysToMonday);

            // Находим воскресенье этой недели
            const sunday = new Date(monday);
            sunday.setDate(monday.getDate() + 6);

            return { monday, sunday };
        },
        closeOpenedDate() {
            const openedDateIndex = this.date.findIndex(({ dateEnd }) => dateEnd == null);
            if (openedDateIndex < 0) {
                return;
            }
            this.removeDate(openedDateIndex);
        },
        onDateSelected({ $event, cellDate, setDate, canPick = true }) {
            if (!canPick) {
                return;
            }
            this.commitToStoreDuplicatedDates(cellDate);

            this.$nextTick(() => setDate(cellDate));
            if (this.props.showLocalPopup) {
                this.openPopup(cellDate, $event);
            }
            const { popupUrl: path, eventName } = this.props;
            if (path !== '') {
                this.$routeNavigate({ path });
            }
            if (eventName !== '') {
                this.$eventTrigger(eventName, {});
            }
        },

        commitToStoreDuplicatedDates(date) {
            const { active: isActive } = this.props.range;
            if (isActive && this.prevDate === date) {
                this.$storeCommit({ [Vars.DATE]: this.formatDateToIso([date]) });
                const newDate = this.props.isInputMode ? dayjs(date).format(DATE_FORMAT_LOCAL) : new Date(date);
                this.date = [newDate, newDate];
                this.prevDate = null;
                return;
            }

            this.prevDate = date;
        },

        openPopup(date, event) {
            this.recordsForDay = this.coursesDataByDate[formatDateToIso(date)];

            if (this.recordsForDay == null) {
                return;
            }
            const box = event.target.parentElement.getBoundingClientRect();

            this.$nextTick(() => {
                const { courseInfo } = this.$refs;
                const cstyle = courseInfo.style;
                courseInfo.focus();
                let xCoord = box.x - courseInfo.offsetWidth;
                if (xCoord < 0) {
                    xCoord = box.right;
                }
                let yCoord = box.bottom;
                if (yCoord + courseInfo.offsetHeight > document.body.clientHeight) {
                    yCoord = box.y - courseInfo.offsetHeight;
                }

                cstyle.left = `${xCoord}px`;
                cstyle.top = `${yCoord}px`;
            });
        },
        formatDateTimeInRus(sourceDate) {
            return dayjs(sourceDate).locale('ru').format('D MMMM YYYY [|] HH:mm');
        },
        resolveMarkProperty(propertyName, record) {
            const { dateCategories } = this.props;
            return dateCategories.length > 0 ? this.props.mark.dimValues[record.dateType]?.[propertyName] : '';
        },
        isMarksVisibleForDate(cellDate) {
            const { show } = this.props.mark;
            return show && this.coursesDataByDate[this.formatDateToIso(cellDate)];
        },
        isIndexVisibleForDate(cellDate) {
            const { isShow } = this.props.indexes;
            if (!isShow) {
                return false;
            }
            const theDate = formatDateToLocal(cellDate);
            return this.indexesWithDates.some(({ date }) => date === theDate);
        },
        getIndexByDate(cellDate) {
            const theDate = formatDateToLocal(cellDate);
            const { index = null } = this.indexesWithDates.find(({ date }) => date === theDate);

            return index;
        },
        pluralize(daysCount) {
            return `${daysCount} ${pluralize(daysCount, ['день', 'дня', 'дней'])}`;
        },
        resolveOffsetBtnStyle(daysCount) {
            const {
                width,
                height,
                fontSize,
                fontWeight,
                fontFamily,
                borderRadius,
                borderWidth,
                borderColor,
                color,
                background,
                activeColor,
                activeBackground,
                isEnabled
            } = this.props.presetStyles;
            if (!isEnabled) {
                return {};
            }
            return this.$genCssVarsStyle(
                buildCssVars({
                    prefix: 'preset-slot-btn',
                    properties: {
                        width,
                        height,
                        fontSize,
                        fontWeight,
                        fontFamily,
                        borderRadius,
                        border: `${borderWidth} solid ${borderColor}`,
                        color: this.daysOffset === daysCount ? activeColor : color,
                        background: this.daysOffset === daysCount ? activeBackground : background
                    }
                })
            );
        },
        resolveOffsetBtnClass(daysCount) {
            const { isEnabled } = this.props.presetStyles;
            return `${this.daysOffset === daysCount ? 'btn-primary' : 'btn-outline'} ${
                isEnabled ? 'preset-slot__btn' : ''
            }`;
        },
        resolveHardPresetBtnClass(currentCalendarType) {
            return this.calendarType === currentCalendarType ? 'btn-primary' : 'btn-outline';
        },
        resolveStoreSQLStyleVar(activeDate, storeVarArgumentName) {
            const datesExtremumList = activeDate.reduce((acc, { dateStart, dateEnd }) => {
                if (dateStart != null && dateEnd == null) {
                    return [...acc, [`${storeVarArgumentName} = '${this.formatDateToIso(dateStart)}'`]];
                }
                if (dateEnd == null) {
                    return acc;
                }
                const dateStartIso = this.formatDateToIso(dateStart);
                const dateEndIso = this.formatDateToIso(dateEnd);

                if (dateStartIso === dateEndIso) {
                    return [...acc, [`${storeVarArgumentName} = '${dateStartIso}'`]];
                }

                return [
                    ...acc,
                    [`${storeVarArgumentName} >= '${dateStartIso}'`, `${storeVarArgumentName} <= '${dateEndIso}'`]
                ];
            }, []);

            const datesString = datesExtremumList
                .map((dates) => {
                    const singleDate = dates.length === 1;
                    if (!singleDate) {
                        return `(${dates.join(' AND ')})`;
                    }

                    return dates[0];
                })
                .join(' OR ');

            return `(${datesString})`;
        },
        resolveFormattedDatesString({ dateStart, dateEnd }) {
            const dateStartFormatted = dayjs(dateStart).locale('ru').format('D.MM.YYYY');
            if (dateEnd == null) {
                return dateStartFormatted;
            }
            const dateEndFormatted = dayjs(dateEnd).locale('ru').format('D.MM.YYYY');
            if (dateStartFormatted === dateEndFormatted) {
                return dateStartFormatted;
            }
            return `${dateStartFormatted} - ${dateEndFormatted}`;
        },
        removeDate(index) {
            this.date.splice(index, 1);
            this.commitDateToStore();
        },
        setCalendarType(currentCalendarType) {
            this.calendarType = currentCalendarType;
        },
        resolveHeaderClickChevron({ month, year, paramMonth, paramYear }) {
            if (this.calendarType !== CalendarTypes.DAY_TYPE && this.calendarType !== CalendarTypes.WEEK_TYPE) {
                paramYear();
                return;
            }
            this.commitMonthToStore({ month, year, paramMonth });
        }
    },
    implicitCssModule: true
};
</script>

<style src="./style.pcss" lang="pcss" module></style>

<!-- global styles for popup ui-input-date-picker -->
<style lang="pcss">
.elem-calendar-preset-slot-custom > div > div {
    flex-direction: var(--w-flex-direction)
}

.elem-calendar-datepicker-custom > div {
    background: var(--w-background, #fff);
    border: var(--w-border);
    border-radius: var(--w-border-radius);
    box-shadow: var(--w-box-shadow, 0 calc(0.0625rem * 2) calc(0.25rem * 2) -0.125rem rgba(0, 0, 0, 0.25));
}

.elem-calendar-datepicker-custom.ui-input-date-picker {
    background: var(--w-input-mode-background);
    border: var(--w-idp_border-width) var(--w-idp_border-style) var(--w-idp_border-color);
    border-radius: var(--w-idp_border-radius);
    height: var(--w-idp-height);
    width: var(--w-idp-width);
}

.elem-calendar-datepicker-custom > .ui-input-date-picker-wrapper {
    box-shadow: none;
    background: transparent;
}
</style>