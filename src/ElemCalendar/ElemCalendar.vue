<template>
    <w-elem :style="compactMode ? (props.calCompactShowCalendar === false ? 'display:block;width:100%' : 'display:inline-block') : 'height:100%;display:block'">
    <div :id="calRootId" class="elem-cal" :class="calDynamicClass" :style="[cssStyle, calCssVars]">
        <!-- ── Header (full mode only) ─────────────────────────────── -->
        <div v-if="props.calShowHeader && !compactMode" class="elem-cal__header">
            <div class="elem-cal__nav">
                <button class="elem-cal__nav-btn" :title="locale.prev" :aria-label="locale.prev" @click="prevPeriod">
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
                <button class="elem-cal__nav-btn" :title="locale.next" :aria-label="locale.next" @click="nextPeriod">
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
            <button
                v-if="props.calShowResetBtn !== false && props.calSelectionMode !== 'none'"
                class="elem-cal__reset-btn"
                @click="onFullReset">
                {{ locale.reset }}
            </button>
        </div>

        <!-- ── Compact mode (dashboard date-range picker) ───────────── -->
        <div v-if="compactMode" class="elem-cal__compact" :class="{ 'elem-cal__compact--wide': props.calCompactShowCalendar === false }">
          <div class="compact__inner" :style="compactInnerStyle">

            <!-- Preset chips -->
            <div
                v-if="props.calCompactShowPresets !== false && compactPresetsList.length"
                class="compact__presets"
                :style="presetsGridStyle">
                <button
                    v-for="p in compactPresetsList"
                    :key="p.key"
                    class="compact__preset"
                    :class="{ 'compact__preset--active': activePreset === p.key }"
                    @click="applyPreset(p)">
                    {{ p.label }}
                </button>
            </div>

            <!-- Сегодня: только когда календарь скрыт (упрощённый режим); «Два месяца» без календаря не действует -->
            <div v-if="props.calCompactShowCalendar === false && props.calCompactShowToday !== false" class="compact__today-row">
                <button class="compact__today-chip" @click="applyPreset({ key: 'today' })">{{ locale.today }}</button>
            </div>

            <!-- Month header + selection hint + calendar grid -->
            <template v-if="props.calCompactShowCalendar !== false">
                <!-- DUAL-MONTH MODE -->
                <template v-if="props.calCompactDualMonth">
                    <div v-if="compactSelectionHint" class="compact__hint">{{ compactSelectionHint }}</div>
                    <div class="compact__dual-grids">
                        <div class="compact__dual-col">
                            <div class="compact__head">
                                <button class="compact__nav" :title="locale.prev" :aria-label="locale.prev" @click="prevPeriod">
                                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                                        <path d="M10 12L6 8l4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                </button>
                                <span class="compact__month-label">{{ currentTitle }}</span>
                                <button class="compact__nav" :title="locale.next" :aria-label="locale.next" @click="nextPeriod">
                                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                                        <path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                </button>
                            </div>
                            <div class="compact__grid" :class="{ 'compact__grid--no-weekends': !props.calShowWeekends }">
                                <div
                                    v-for="(wd, i) in weekdayHeaders"
                                    :key="`cwd1-${i}`"
                                    class="compact__wd"
                                    :class="{ 'compact__wd--weekend': isWeekendCol(i) }">
                                    {{ wd }}
                                </div>
                                <div
                                    v-for="(c, i) in compactOffsetCells"
                                    :key="`ce1-${i}`"
                                    class="compact__day compact__day--empty"
                                    :class="{ 'compact__day--weekend': c.isWeekend }" />
                                <div
                                    v-for="cell in compactCells"
                                    :key="cell.iso"
                                    class="compact__day"
                                    :class="compactCellClass(cell)"
                                    @click="onCompactDayClick(cell)"
                                    @mouseenter="onCompactDayHover(cell, $event)"
                                    @mouseleave="onCompactDayLeave">
                                    <span class="compact__day-num">{{ cell.d }}</span>
                                </div>
                            </div>
                        </div>
                        <div class="compact__dual-col">
                            <div class="compact__head">
                                <button class="compact__nav" :title="locale.prev" :aria-label="locale.prev" @click="prevPeriod2">
                                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                                        <path d="M10 12L6 8l4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                </button>
                                <span class="compact__month-label">{{ compactTitle2 }}</span>
                                <button class="compact__nav" :title="locale.next" :aria-label="locale.next" @click="nextPeriod2">
                                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                                        <path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                </button>
                            </div>
                            <div class="compact__grid" :class="{ 'compact__grid--no-weekends': !props.calShowWeekends }">
                                <div
                                    v-for="(wd, i) in weekdayHeaders"
                                    :key="`cwd2-${i}`"
                                    class="compact__wd"
                                    :class="{ 'compact__wd--weekend': isWeekendCol(i) }">
                                    {{ wd }}
                                </div>
                                <div
                                    v-for="(c, i) in compactOffsetCells2"
                                    :key="`ce2-${i}`"
                                    class="compact__day compact__day--empty"
                                    :class="{ 'compact__day--weekend': c.isWeekend }" />
                                <div
                                    v-for="cell in compactCells2"
                                    :key="cell.iso"
                                    class="compact__day"
                                    :class="compactCellClass(cell)"
                                    @click="onCompactDayClick(cell)"
                                    @mouseenter="onCompactDayHover(cell, $event)"
                                    @mouseleave="onCompactDayLeave">
                                    <span class="compact__day-num">{{ cell.d }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </template>

                <!-- SINGLE-MONTH MODE -->
                <template v-if="!props.calCompactDualMonth">
                    <div class="compact__head">
                        <button class="compact__nav" :title="locale.prev" :aria-label="locale.prev" @click="prevPeriod">
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                                <path d="M10 12L6 8l4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                        <span class="compact__month-label">{{ currentTitle }}</span>
                        <button v-if="props.calCompactShowToday !== false" class="compact__today-chip" @click="applyPreset({ key: 'today' })">{{ locale.today }}</button>
                        <button class="compact__nav" :title="locale.next" :aria-label="locale.next" @click="nextPeriod">
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                                <path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                    </div>
                    <div v-if="compactSelectionHint" class="compact__hint">{{ compactSelectionHint }}</div>
                    <div class="compact__grid" :class="{ 'compact__grid--no-weekends': !props.calShowWeekends }">
                        <div
                            v-for="(wd, i) in weekdayHeaders"
                            :key="`cwd-${i}`"
                            class="compact__wd"
                            :class="{ 'compact__wd--weekend': isWeekendCol(i) }">
                            {{ wd }}
                        </div>
                        <div
                            v-for="(c, i) in compactOffsetCells"
                            :key="`ce-${i}`"
                            class="compact__day compact__day--empty"
                            :class="{ 'compact__day--weekend': c.isWeekend }" />
                        <div
                            v-for="cell in compactCells"
                            :key="cell.iso"
                            class="compact__day"
                            :class="compactCellClass(cell)"
                            @click="onCompactDayClick(cell)"
                            @mouseenter="onCompactDayHover(cell, $event)"
                            @mouseleave="onCompactDayLeave">
                            <span class="compact__day-num">{{ cell.d }}</span>
                        </div>
                    </div>
                </template>
            </template>

            <!-- Tap-to-edit date chips + action buttons -->
            <div v-if="props.calCompactShowBottom !== false" class="compact__bottom">
                <div
                    class="compact__chips"
                    :class="{ 'compact__chips--time': isTimeUiOn }"
                    :style="props.calCompactChipsGap ? { gap: props.calCompactChipsGap } : undefined">
                    <div
                        ref="chipStart"
                        class="compact__chip"
                        :class="{ 'compact__chip--active': editingStart }"
                        role="button"
                        :tabindex="editingStart ? -1 : 0"
                        :aria-label="`${compactStartAria}: ${compactStart ? compactStartDisplay : '—'}`"
                        @click.stop="startEditingStart"
                        @keydown.enter.self.prevent="startEditingStart"
                        @keydown.space.self.prevent="startEditingStart">
                        <span class="compact__chip-label">{{ isCompactSingle ? locale.compactDate : locale.compactFrom }}</span>
                        <!-- Своё поле с маской вместо type="date"/"datetime-local": нативный пикер
                             рисуется в локали браузера (AM/PM, mm/dd/yyyy) и игнорирует настройки виджета -->
                        <date-time-input
                            v-if="editingStart"
                            ref="inputStart"
                            class="compact__chip-input"
                            :value="compactStart"
                            :time="rangeStartTime || '00:00'"
                            :with-time="isTimeUiOn"
                            :date-mask="locale.dateMask"
                            :date-placeholder="locale.datePlaceholder"
                            :time-placeholder="locale.timePlaceholder"
                            :invalid-title="locale.invalidDate"
                            :aria-label="compactStartAria"
                            :blur-guard="(el) => _isInsidePicker('start', el)"
                            @commit="_handleCompactInputCommit($event, 'start')"
                            @cancel="editingStart = false"
                            @finish="_onChipEditorFinish('start', $event)"
                            @draft="_setChipDraft('start', $event)"
                            @keydown.native.down="_focusPicker('start', $event)" />
                        <!-- Мини-календарь скрыт («Ввод дат») — свой всплывающий календарь вместо
                             нативного пикера браузера (язык, первый день недели, 24 ч — из настроек) -->
                        <date-picker-popup
                            v-if="editingStart && compactPickerOn"
                            ref="pickerStart"
                            :value="pickerValue('start')"
                            :fallback="compactEnd"
                            :time="pickerTime('start')"
                            :with-time="isTimeUiOn"
                            :range-start="isCompactSingle ? '' : compactStart"
                            :range-end="isCompactSingle ? '' : compactEnd"
                            :locale="locale"
                            :first-day="firstDay"
                            :today="today"
                            :css-vars="calCssVars"
                            :popup-id="`${calRootId}-popup`"
                            :aria-label="locale.chooseDate"
                            :is-own-input="(el) => _isChipInput('start', el)"
                            @pick="_onPickerPick('start', $event)"
                            @clear="_onPickerClear('start')"
                            @escape="_onPickerEscape('start')"
                            @leave="_onPickerLeave('start')" />
                        <span v-else class="compact__chip-value">{{ compactStart ? compactStartDisplay : '—' }}</span>
                    </div>
                    <!-- «По» нужен только диапазону: в режиме «Одиночный» второй чип скрыт -->
                    <span v-if="!isCompactSingle" class="compact__chip-sep">→</span>
                    <div
                        v-if="!isCompactSingle"
                        ref="chipEnd"
                        class="compact__chip"
                        :class="{ 'compact__chip--active': editingEnd }"
                        role="button"
                        :tabindex="editingEnd ? -1 : 0"
                        :aria-label="`${locale.compactEndAria}: ${compactEnd ? compactEndDisplay : '—'}`"
                        @click.stop="startEditingEnd"
                        @keydown.enter.self.prevent="startEditingEnd"
                        @keydown.space.self.prevent="startEditingEnd">
                        <span class="compact__chip-label">{{ locale.compactTo }}</span>
                        <date-time-input
                            v-if="editingEnd"
                            ref="inputEnd"
                            class="compact__chip-input"
                            :value="compactEnd"
                            :time="rangeEndTime || '23:59'"
                            :with-time="isTimeUiOn"
                            :date-mask="locale.dateMask"
                            :date-placeholder="locale.datePlaceholder"
                            :time-placeholder="locale.timePlaceholder"
                            :invalid-title="locale.invalidDate"
                            :aria-label="locale.compactEndAria"
                            :blur-guard="(el) => _isInsidePicker('end', el)"
                            @commit="_handleCompactInputCommit($event, 'end')"
                            @cancel="editingEnd = false"
                            @finish="_onChipEditorFinish('end', $event)"
                            @draft="_setChipDraft('end', $event)"
                            @keydown.native.down="_focusPicker('end', $event)" />
                        <!-- Мини-календарь скрыт («Ввод дат») — свой всплывающий календарь вместо
                             нативного пикера браузера (язык, первый день недели, 24 ч — из настроек) -->
                        <date-picker-popup
                            v-if="editingEnd && compactPickerOn"
                            ref="pickerEnd"
                            :value="pickerValue('end')"
                            :fallback="compactStart"
                            :time="pickerTime('end')"
                            :with-time="isTimeUiOn"
                            :range-start="isCompactSingle ? '' : compactStart"
                            :range-end="isCompactSingle ? '' : compactEnd"
                            :locale="locale"
                            :first-day="firstDay"
                            :today="today"
                            :css-vars="calCssVars"
                            :popup-id="`${calRootId}-popup`"
                            :aria-label="locale.chooseDate"
                            :is-own-input="(el) => _isChipInput('end', el)"
                            @pick="_onPickerPick('end', $event)"
                            @clear="_onPickerClear('end')"
                            @escape="_onPickerEscape('end')"
                            @leave="_onPickerLeave('end')" />
                        <span v-else class="compact__chip-value">{{ compactEnd ? compactEndDisplay : '—' }}</span>
                    </div>
                </div>
                <div class="compact__actions">
                    <button class="compact__btn compact__btn--reset" @click="onCompactReset">{{ locale.compactReset }}</button>
                    <button class="compact__btn compact__btn--apply" :disabled="!compactStart" @click="onCompactApply">{{ locale.apply }}</button>
                </div>
            </div>

          </div>
        </div>

        <!-- ── Month view ──────────────────────────────────────────── -->
        <div v-else-if="currentView === 'month'" class="elem-cal__month">
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
                        :style="heatmapCellStyle(day)"
                        @click="onDayClick(day)"
                        @mouseenter="onDayHover(day, $event)"
                        @mouseleave="hideTooltip">
                        <div class="elem-cal__cell-inner">
                            <div class="elem-cal__cell-top">
                                <span class="elem-cal__day-num">{{ day.d }}</span>
                                <span v-if="props.calHeatmapShowValue && getMetricValue(day.iso) !== undefined" class="elem-cal__metric-val">{{ formatMetric(getMetricValue(day.iso)) }}</span>
                            </div>
                            <div class="elem-cal__events-wrap">
                                <div
                                    v-for="ev in day.events.slice(0, maxEventsPerCell)"
                                    :key="ev.id"
                                    class="elem-cal__event"
                                    :style="eventStyle(ev)"
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
            <div class="elem-cal__week-scroller">
                <div class="elem-cal__week-head">
                    <div class="elem-cal__time-gutter" />
                    <div
                        v-for="day in weekDays"
                        :key="day.key"
                        class="elem-cal__week-col-hd"
                        :class="[weekColClass(day, 'elem-cal__week-col-hd'), { 'elem-cal__week-col-hd--weekend': day.isWeekend }]"
                        @click="drillDown(day)">
                        <div class="elem-cal__week-dow">{{ locale.weekdaysShort[day.dow] }}</div>
                        <div class="elem-cal__week-num" :class="{ 'elem-cal__week-num--today': day.isToday && todayHighlight }">{{ day.d }}</div>
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
                            :class="weekColClass(day)"
                            @click="onWeekColClick(day)"
                            @mouseenter="onWeekColHover(day)"
                            @mouseleave="onWeekColLeave">
                            <div v-for="h in 24" :key="h" class="elem-cal__hour-slot" />
                            <div
                                v-for="ev in day.events"
                                :key="ev.id"
                                class="elem-cal__week-event"
                                :style="weekEventStyle(ev)"
                                @click.stop="onEventClick(ev)">
                                <span class="elem-cal__week-event-title">{{ ev.title }}</span>
                                <span class="elem-cal__week-event-time">{{ ev.startTime }}</span>
                            </div>
                            <div v-if="day.isToday" class="elem-cal__now-line" :style="nowLineStyle" />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- ── Day view ────────────────────────────────────────────── -->
        <div v-else-if="currentView === 'day'" class="elem-cal__day-view">
            <div class="elem-cal__week-scroller">
                <div class="elem-cal__day-head">
                    <div class="elem-cal__time-gutter" />
                    <div
                        class="elem-cal__week-col-hd elem-cal__week-col-hd--single"
                        :class="weekColClass(dayViewDay, 'elem-cal__week-col-hd')">
                        <div class="elem-cal__week-dow">{{ dayViewDay ? locale.weekdays[dayViewDay.dow] : '' }}</div>
                        <div class="elem-cal__week-num" :class="{ 'elem-cal__week-num--today': dayViewDay && dayViewDay.isToday && todayHighlight }">
                            {{ dayViewDay ? dayViewDay.d : '' }}
                        </div>
                    </div>
                </div>
                <div class="elem-cal__week-body">
                    <div class="elem-cal__time-col">
                        <div v-for="h in 24" :key="h" class="elem-cal__hour-label">{{ formatHour(h - 1) }}</div>
                    </div>
                    <div class="elem-cal__week-cols">
                        <!-- клик по колонке дня выбирает этот день — как клик по колонке в недельном виде -->
                        <div
                            class="elem-cal__week-col elem-cal__week-col--full"
                            :class="weekColClass(dayViewDay)"
                            @click="onWeekColClick(dayViewDay)"
                            @mouseenter="onWeekColHover(dayViewDay)"
                            @mouseleave="onWeekColLeave">
                            <div v-for="h in 24" :key="h" class="elem-cal__hour-slot" />
                            <div
                                v-for="ev in dayViewEvents"
                                :key="ev.id"
                                class="elem-cal__week-event"
                                :style="weekEventStyle(ev)"
                                @click.stop="onEventClick(ev)">
                                <span class="elem-cal__week-event-title">{{ ev.title }}</span>
                                <span class="elem-cal__week-event-time">{{ ev.startTime }}</span>
                            </div>
                            <div v-if="dayViewDay && dayViewDay.isToday" class="elem-cal__now-line" :style="nowLineStyle" />
                        </div>
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
                <div class="elem-cal__agenda-date" :class="{ 'elem-cal__agenda-date--today': group.isToday && todayHighlight }">
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

        <!-- ── Year view ─────────────────────────────────────────────── -->
        <div v-else-if="currentView === 'year'" class="elem-cal__year">
            <div
                v-for="month in yearMonths"
                :key="month.m"
                class="elem-cal__year-month">
                <div class="elem-cal__year-month-hd" @click="goToMonth(month.m)">{{ month.label }}</div>
                <div class="elem-cal__year-month-grid">
                    <div v-for="(wd, wi) in weekdayHeaders" :key="`yw-${wi}`" class="elem-cal__year-wd">{{ wd.charAt(0) }}</div>
                    <template v-for="(cell, ci) in month.cells">
                        <div
                            v-if="cell"
                            :key="`yd-${month.m}-${ci}`"
                            class="elem-cal__year-day"
                            :class="yearDayClass(cell)"
                            :style="yearDayStyle(cell)"
                            @click="goToDay(cell)"
                            @mouseenter="props.calShowTooltip !== false && showTooltip(cell, $event)"
                            @mouseleave="hideTooltip">{{ cell.d }}</div>
                        <div v-else :key="`ye-${month.m}-${ci}`" class="elem-cal__year-day elem-cal__year-day--empty" />
                    </template>
                </div>
            </div>
        </div>

        <!-- ── Tooltip ───────────────────────────────────────────────── -->
        <!-- компактный режим управляется своим свитчем (calCompactShowTooltip проверяется в onCompactDayHover) -->
        <div v-if="tooltipDay && (compactMode || props.calShowTooltip !== false)" class="elem-cal__tooltip" :style="tooltipStyle">
            <div class="elem-cal__tooltip-date">{{ tooltipDateLabel }}</div>
            <div v-if="tooltipMetricVal !== null" class="elem-cal__tooltip-metric">
                <span class="elem-cal__tooltip-metric-icon">◉</span> {{ tooltipMetricVal }}
            </div>
            <div v-if="tooltipDay.events && tooltipDay.events.length" class="elem-cal__tooltip-events">
                <div
                    v-for="ev in tooltipDay.events.slice(0, 5)"
                    :key="ev.id || ev.title"
                    class="elem-cal__tooltip-ev">
                    <span class="elem-cal__tooltip-ev-dot" :style="{ background: ev.color || props.calAccentColor }" />
                    <span class="elem-cal__tooltip-ev-title">{{ ev.title }}</span>
                </div>
                <div v-if="tooltipDay.events.length > 5" class="elem-cal__tooltip-more">+{{ tooltipDay.events.length - 5 }} {{ locale.more }}</div>
            </div>
            <div v-else class="elem-cal__tooltip-empty">{{ locale.noEvents }}</div>
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
import {
    VIEWS, LOCALE_DATA, PRESETS, SELECTION_MODES, AGENDA_DAYS_AHEAD, HOUR_HEIGHT,
    AUTO_PRESET_LABELS, AUTO_RELATIVE_LABEL_RE, AUTO_FIXED_LABEL_RE, pluralize,
    DESIGNER_BLOCKS, withImportant,
    resolveDataSections, hasActiveMetricSource
} from './constants';
import {
    DATES_LIST_SHAPES, datesListShape, resolveOutputFormat, toOutputValue, isAutoFormat,
    isEmptyInput, isEmptyListInput, normalizeTime, parseInputDate, parseInputDateList,
    detectValueFormat, sameValueFormat, formatName, formatAs, formatListAs, valueFormatHasTime
} from './utils/date-output';
import { formatByMask } from './dateFormat';
import DateTimeInput from './components/DateTimeInput.vue';
import DatePickerPopup from './components/DatePickerPopup.vue';

const { store, ValueObject } = Managers.StoreManager;

// Сколько ждать эха собственной записи в хранилище: оно приходит в ближайший тик
const ECHO_WINDOW_MS = 2000;

// ── Pure date helpers ──────────────────────────────────────────────
function daysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }
function isoDate(d) { if (!d || isNaN(d.getTime())) return ''; return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
function parseIso(s) {
    if (!s || typeof s !== 'string') return null;
    const p = s.split('-');
    if (p.length < 3) return null;
    const y = +p[0], mo = +p[1] - 1, day = +p[2];
    if (isNaN(y) || isNaN(mo) || isNaN(day)) return null;
    return new Date(y, mo, day);
}
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
// Calendar quarter containing `date`, shifted by `offset` quarters (0 — this, -1 — previous).
// Quarters are 90–92 days long (Q1: 90, 91 in a leap year; Q2: 91; Q3/Q4: 92), so the end
// is taken as "day 0 of the month after the quarter" — always the last day of its 3rd month.
function quarterRange(date, offset = 0) {
    const index = date.getFullYear() * 4 + Math.floor(date.getMonth() / 3) + offset;
    const y = Math.floor(index / 4);
    const startMonth = (index - y * 4) * 3;
    return { start: new Date(y, startMonth, 1), end: new Date(y, startMonth + 3, 0) };
}
// Returns every ISO date string from start to end inclusive
function expandDateRange(start, end) {
    if (!start || !end) return [];
    const result = [];
    let cur = parseIso(start);
    const last = parseIso(end);
    if (!cur || !last) return [];
    const [s, e] = cur <= last ? [cur, last] : [last, cur];
    cur = s;
    while (cur <= e) { result.push(isoDate(cur)); cur = addDays(cur, 1); }
    return result;
}

// ── Heatmap color helpers ──────────────────────────────────────────
function hexToRgb(hex) {
    if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) return null;
    const c = hex.length === 4 ? hex.replace(/([^#])/g, '$1$1') : hex;
    const m = /^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(c);
    return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : null;
}
function lerpColor(lowHex, highHex, t) {
    const lo = hexToRgb(lowHex) || [240, 249, 255];
    const hi = hexToRgb(highHex) || [79, 70, 229];
    const r = Math.round(lo[0] + (hi[0] - lo[0]) * t);
    const g = Math.round(lo[1] + (hi[1] - lo[1]) * t);
    const b = Math.round(lo[2] + (hi[2] - lo[2]) * t);
    return `rgb(${r},${g},${b})`;
}

export default {
    extends: Elem,
    meta,
    components: { DateTimeInput, DatePickerPopup },
    mixins: [useElemDatasetMixin()],
    hooks: {
        then() {
            this.buildDimensionValues();
        }
    },
    subscribe: [
        {
            event: 'refresh',
            handler() {
                this.loadData();
                this._refreshStoreEvents();
                this._refreshStoreMetric();
            }
        }
    ],

    // ── Bidirectional store variable sync ────────────────────────────────
    // Fires immediately on mount (framework sets immediate:true) and on every
    // change to any of the four mapped vars — handles both incoming values
    // (navigate + apply) and null resets (clear selection).
    watchStore: [
        {
            vars: ['date', 'dateStart', 'dateEnd', 'datesList'],
            // Платформа (goodt-wcore) вызывает обработчик через $nextTick после created —
            // уже после mounted, — и затем при каждом изменении любой из переменных.
            // Значение приходит только для переменных, привязанных на чтение (varAliases.listen);
            // для непривязанных — undefined.
            handler([date, dateStart, dateEnd, datesList]) {
                this._applyStoreDelivery({ date, dateStart, dateEnd, datesList }, 'out');
                // Refresh store-sourced events / metric on any store change
                this._refreshStoreEvents();
                this._refreshStoreMetric();
            }
        }
    ],

    data: () => ({
        ...ElemDatasetMixinTypes,
        currentView: 'month',
        navDate: new Date(),
        navDate2: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
        today: new Date(),
        rangeStart: null,
        rangeEnd: null,
        hoveredDate: null,
        nowTimer: null,
        dimensionValues: [],
        tooltipDay: null,
        tooltipMeta: { x: 0, y: 0 },
        // ── Compact mode state ───────────────────────────────────────
        compactHoverCell: null,
        compactClickStep: 0,       // 0 = idle, 1 = start selected, awaiting end click
        activePreset: null,
        editingStart: false,
        editingEnd: false,
        // разобранный текст открытого поля чипа ({ side, iso, time } | null) — для всплывающего календаря
        chipDraft: null,
        rangeStartTime: '00:00',
        rangeEndTime: '23:59',
        // true, если время начала / конца уже пришло из переменной до mounted
        // (immediate-вотчеры) — тогда mounted не затирает его значением по умолчанию
        startTimeFromStore: false,
        endTimeFromStore: false,
        // Чем на деле пишет режим «Авто»: '<формат>|<источник>' (см. effectiveOutputFormat).
        // Не сохраняется в конфиг: панель читает его с экземпляра виджета (elementInstance)
        outputFormatResolved: '',
        // Выбор в редакторе: внешние значения переменных и клики показываются на холсте,
        // но не пишутся в props (иначе попали бы в конфиг виджета). null — брать из props.
        editorSelection: { calSelectedDate: null, calSelectedStart: null, calSelectedEnd: null, calSelectedDates: null },
        // ── Multi mode state ─────────────────────────────────────────
        selectedDates: [],         // Array of ISO date strings for 'multi' mode
        // ── Store-sourced data (reactive cache) ───────────────────────
        _eventsStoreRaw: null,     // cached value from store var calEventsVar
        _metricStoreRaw: null      // cached value from store var calMetricVar
    }),

    computed: {
        // ── Reactive store-input reads (bypass varAliases/watchStore) ──
        _storeInDate() {
            return this.props.calDateVar ? store.state[this.props.calDateVar]?.value : undefined;
        },
        _storeInDateStart() {
            return this.props.calDateStartVar ? store.state[this.props.calDateStartVar]?.value : undefined;
        },
        _storeInDateEnd() {
            return this.props.calDateEndVar ? store.state[this.props.calDateEndVar]?.value : undefined;
        },
        _storeInDatesList() {
            return this.props.calDatesListVar ? store.state[this.props.calDatesListVar]?.value : undefined;
        },

        todayHighlight() {
            return this.props.calHighlightToday !== false;
        },

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
                '--cal-text-transform':   p.calTextTransform || 'none',
                '--cal-tooltip-bg':          this.tooltipBgColor,
                '--cal-tooltip-color':       p.calTooltipColor || '#f1f5f9',
                '--cal-tooltip-radius':      p.calTooltipRadius || '10px',
                '--cal-tooltip-font-family': p.calTooltipFontFamily || 'inherit',
                '--cal-tooltip-font-size':   p.calTooltipFontSize || '12px',
                '--cal-tooltip-shadow':      p.calTooltipShadow || '0 8px 32px rgba(0,0,0,0.22), 0 2px 8px rgba(0,0,0,0.14)',
                '--cal-tooltip-border':      (p.calTooltipBorderWidth && p.calTooltipBorderWidth !== '0px') ? `${p.calTooltipBorderWidth} solid ${p.calTooltipBorderColor || 'rgba(255,255,255,0.15)'}` : 'none',
                '--cal-tooltip-min-width':   p.calTooltipMinWidth || '165px',
                '--cal-tooltip-max-width':   p.calTooltipMaxWidth || '245px',
                '--cal-tooltip-min-height':  p.calTooltipMinHeight || '0',
                '--cal-tooltip-max-height':  p.calTooltipMaxHeight || 'none'
            };
        },

        // Tooltip background as rgba, blending calTooltipBg with calTooltipOpacity
        tooltipBgColor() {
            const hex = this.props.calTooltipBg || '#1e293b';
            const opacity = this.props.calTooltipOpacity;
            if (opacity == null || opacity === '' || Number(opacity) >= 100) return hex;
            const rgb = hexToRgb(hex);
            if (!rgb) return hex;
            const a = Math.max(0, Math.min(100, Number(opacity))) / 100;
            return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${a})`;
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
                days.push(this._buildDay(d, true));
            }
            return days;
        },

        // ── Day view ─────────────────────────────────────────────────
        dayViewDay() {
            // полночь: navDate может нести текущее время, а выделение сравнивает даты целиком
            const d = new Date(this.navDate);
            d.setHours(0, 0, 0, 0);
            return this._buildDay(d, true);
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

        // ── Data panel sections: switched-off sources are ignored ─────
        dataSections() {
            return resolveDataSections(this.props);
        },

        // ── Parsed events ────────────────────────────────────────────
        parsedEvents() {
            const sections = this.dataSections;
            let raw = [];
            // From store var — read from reactive cache populated by _refreshStoreEvents()
            if (this.props.calEventsVar && this._eventsStoreRaw != null) {
                try {
                    const val = this._eventsStoreRaw;
                    if (val) raw = typeof val === 'string' ? JSON.parse(val) : val;
                } catch (e) { /* noop */ }
            }
            // From static JSON prop
            if (!raw.length && sections.staticEvents && this.props.calEventsJson) {
                try { raw = JSON.parse(this.props.calEventsJson); } catch (e) { /* noop */ }
            }
            if (!Array.isArray(raw)) raw = [];

            // From dataset rows — merge with static events
            if (this.hasResult && this.props.dimension) {
                const dateCol = this.props.dimension;
                // «Поля события из источника» выключены — столбцы не используются
                const useCols = sections.eventFields;
                const titleCol = useCols ? this.props.calDataTitleCol : '';
                const startCol = useCols ? this.props.calDataStartTimeCol : '';
                const endCol = useCols ? this.props.calDataEndTimeCol : '';
                const descCol = useCols ? this.props.calDataDescCol : '';
                const dsEvents = (this.result.rows || []).map((row, i) => {
                    const rawDate = row[dateCol];
                    if (!rawDate) return null;
                    const dateStr = String(rawDate).slice(0, 10);
                    return {
                        id: `ds-${i}`,
                        title: titleCol && row[titleCol] != null ? String(row[titleCol]) : dateStr,
                        date: dateStr, endDate: dateStr,
                        startTime: startCol && row[startCol] != null ? String(row[startCol]) : '',
                        endTime: endCol && row[endCol] != null ? String(row[endCol]) : '',
                        color: '',
                        desc: descCol && row[descCol] != null ? String(row[descCol]) : ''
                    };
                }).filter(Boolean);
                raw = [...dsEvents, ...raw];
            }

            return raw.map((ev, i) => ({
                id: ev.id || `ev-${i}`,
                title: ev.title || ev.name || this.locale.untitled,
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
            // после числа — родительный падеж («5 ноября»), в en совпадает с months
            const monthsGen = this.locale.monthsGenitive || months;
            if (this.currentView === 'month') return `${months[m]} ${y}`;
            if (this.currentView === 'week') {
                const ws = startOfWeek(this.navDate, this.firstDay);
                const we = addDays(ws, 6);
                const wy = ws.getFullYear();
                if (ws.getMonth() === we.getMonth()) {
                    return `${ws.getDate()}–${we.getDate()} ${monthsGen[ws.getMonth()]} ${wy}`;
                }
                if (wy === we.getFullYear()) {
                    return `${ws.getDate()} ${this.locale.monthsShort[ws.getMonth()]} – ${we.getDate()} ${this.locale.monthsShort[we.getMonth()]} ${wy}`;
                }
                return `${ws.getDate()} ${this.locale.monthsShort[ws.getMonth()]} ${wy} – ${we.getDate()} ${this.locale.monthsShort[we.getMonth()]} ${we.getFullYear()}`;
            }
            if (this.currentView === 'day') {
                return `${d} ${monthsGen[m]} ${y}`;
            }
            if (this.currentView === 'year') return `${y}`;
            return `${months[m]} ${y}`;
        },

        // От чего зависит effectiveOutputFormat (кроме нереактивных запомненных форматов)
        _resolvedFormatDeps() {
            return [this.props.calOutputFormat, this.isTimeUiOn, this.selectionMode, this.isEditorMode].join('|');
        },

        // ── Формат значений, которые пишутся в переменные ────────────
        outputFormat() {
            // Действующий флаг времени (isTimeUiOn), а не сырой calWithTime: в режимах без
            // выбора времени 'auto' даёт ISO-даты, как и раньше для multi
            return resolveOutputFormat(this.props.calOutputFormat, this.isTimeUiOn);
        },

        // Время по умолчанию из настроек, проверенное (некорректное → 00:00 / 23:59)
        defaultStartTime() {
            return normalizeTime(this.props.calDefaultStartTime, '00:00');
        },

        defaultEndTime() {
            return normalizeTime(this.props.calDefaultEndTime, '23:59');
        },

        // ── Selection parsed ─────────────────────────────────────────
        selectedDate() {
            return parseIso(this._sel('calSelectedDate'));
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

        // id корня: CSS «Я дизайнер» пишется как «#id .селектор» — специфичность id
        // перебивает scoped-правила виджета (.x[data-v-…]) и не задевает другие календари
        calRootId() {
            return `elem-cal-${this._uid}`;
        },

        customCssContent() {
            const root = `#${this.calRootId}`;
            const parts = [];
            if (this.props.calCustomCss) parts.push(`${root}.elem-cal { ${this.props.calCustomCss} }`);
            try {
                const values = JSON.parse(this.props.calDesignerCss || '{}');
                [...DESIGNER_BLOCKS.full, ...DESIGNER_BLOCKS.compact].forEach((block) => {
                    const css = values && values[block.key];
                    if (!css) return;
                    // portal: элемент вынесен в <body> (всплывающий календарь) — адресуется по его id:
                    // 'self' — сам календарь, 'inside' — элемент внутри него
                    let sel = `${root} ${block.sel}`;
                    if (block.portal === 'inside') sel = `${root}-popup ${block.sel}`;
                    else if (block.portal) sel = `${root}-popup${block.sel}`;
                    parts.push(`${sel} { ${block.important ? withImportant(css) : css} }`);
                });
            } catch (e) { /* noop */ }
            return parts.length ? parts.join('\n') : null;
        },

        // ── Metric / heatmap data ────────────────────────────────────
        metricData() {
            const sections = this.dataSections;
            let raw = [];
            // From store var — read from reactive cache populated by _refreshStoreMetric()
            if (this.props.calMetricVar && this._metricStoreRaw != null) {
                try {
                    const v = this._metricStoreRaw;
                    if (v) raw = typeof v === 'string' ? JSON.parse(v) : (Array.isArray(v) ? v : []);
                } catch (e) { /* noop */ }
            }
            let map = {};
            if (!raw.length && sections.staticMetric && this.props.calMetricJson) {
                try {
                    const parsed = JSON.parse(this.props.calMetricJson);
                    if (Array.isArray(parsed)) raw = parsed;
                    else if (parsed && typeof parsed === 'object') map = parsed; // map format
                } catch (e) { /* noop */ }
            }
            raw.forEach((item) => {
                if (item && item.date) map[item.date.slice(0, 10)] = Number(item.value);
            });
            // From dataset when metric column is mapped
            if (!Object.keys(map).length && this.hasResult && sections.metricCol && this.props.calMetricDataCol && this.props.dimension) {
                (this.result.rows || []).forEach((row) => {
                    const d = row[this.props.dimension];
                    const v = row[this.props.calMetricDataCol];
                    if (d != null && v != null) map[String(d).slice(0, 10)] = Number(v);
                });
            }
            return map;
        },

        metricMinMax() {
            const vals = Object.values(this.metricData).filter((v) => !isNaN(v));
            if (!vals.length) return { min: 0, max: 1 };
            return { min: Math.min(...vals), max: Math.max(...vals) };
        },

        // ── Year view months ─────────────────────────────────────────
        yearMonths() {
            const y = this.navDate.getFullYear();
            return Array.from({ length: 12 }, (_, m) => {
                const total = daysInMonth(y, m);
                const firstDow = new Date(y, m, 1).getDay();
                const offset = (firstDow - this.firstDay + 7) % 7;
                const cells = [];
                for (let i = 0; i < offset; i++) cells.push(null);
                for (let d = 1; d <= total; d++) {
                    const date = new Date(y, m, d);
                    const iso = isoDate(date);
                    cells.push({ d, iso, date, isToday: isSameDay(date, this.today), isWeekend: date.getDay() === 0 || date.getDay() === 6, events: this._eventsForDay(date) });
                }
                return { m, label: this.locale.months[m], cells };
            });
        },

        // ── Tooltip ──────────────────────────────────────────────────
        tooltipStyle() {
            return { position: 'fixed', left: `${this.tooltipMeta.x}px`, top: `${this.tooltipMeta.y}px`, zIndex: 9999, pointerEvents: 'none' };
        },

        tooltipDateLabel() {
            if (!this.tooltipDay) return '';
            const d = this.tooltipDay.date;
            if (!d) return '';
            const monthsGen = this.locale.monthsGenitive || this.locale.months;
            return `${this.locale.weekdays[d.getDay()]}, ${d.getDate()} ${monthsGen[d.getMonth()]} ${d.getFullYear()}`;
        },

        tooltipMetricVal() {
            if (!this.tooltipDay || !this.props.calHeatmapEnabled) return null;
            if (this.props.calTooltipShowMetric === false) return null;
            const val = this.getMetricValue(this.tooltipDay.iso);
            return val !== undefined ? this.formatMetric(val) : null;
        },

        // ── Compact mode ─────────────────────────────────────────────
        compactMode() {
            return this.props.calMode === 'compact';
        },

        compactStart() {
            if (this.rangeStart) return isoDate(this.rangeStart);
            // «Одиночный»: зафиксированная дата хранится в calSelectedDate (переменная date)
            if (this.isCompactSingle) return this._sel('calSelectedDate') || '';
            return this._sel('calSelectedStart') || '';
        },

        compactEnd() {
            if (this.isCompactSingle) return '';
            if (this.rangeEnd) return isoDate(this.rangeEnd);
            // Only fall back to the committed prop value when NOT mid-selection.
            // During step 1 (start chosen, awaiting end click) rangeEnd is null
            // but props.calSelectedEnd still holds the PREVIOUS range's end —
            // returning it here would draw a spurious stale range on the grid.
            if (this.compactClickStep === 0) return this._sel('calSelectedEnd') || '';
            return '';
        },

        // aria-подпись первого чипа: в режиме «Одиночный» это просто «Дата»
        compactStartAria() {
            return this.isCompactSingle ? this.locale.compactDate : this.locale.compactStartAria;
        },

        // Подпись чипа «С»: формат даты — из локали виджета, время — всегда 24 ч
        compactStartDisplay() {
            const iso = this.compactStart;
            if (!iso) return '—';
            if (!this.isTimeUiOn) return formatByMask(iso, this.locale.dateShortMask);
            return formatByMask(iso, `${this.locale.dateMask} HH:mm`, this.rangeStartTime || '00:00');
        },

        compactEndDisplay() {
            const iso = this.compactEnd;
            if (!iso) return '—';
            if (!this.isTimeUiOn) return formatByMask(iso, this.locale.dateShortMask);
            return formatByMask(iso, `${this.locale.dateMask} HH:mm`, this.rangeEndTime || '23:59');
        },

        compactOffsetCells() {
            const y = this.navDate.getFullYear();
            const m = this.navDate.getMonth();
            const firstDow = new Date(y, m, 1).getDay();
            const count = (firstDow - this.firstDay + 7) % 7;
            const cells = [];
            for (let i = 0; i < count; i++) {
                const dow = (this.firstDay + i) % 7;
                cells.push({ isWeekend: dow === 0 || dow === 6 });
            }
            return cells;
        },

        compactCells() {
            const y = this.navDate.getFullYear();
            const m = this.navDate.getMonth();
            const total = daysInMonth(y, m);
            const start = parseIso(this.compactStart);
            const hoverEnd = this.compactHoverCell ? this.compactHoverCell.date : null;
            const end = parseIso(this.compactEnd) || (this.compactClickStep === 1 && hoverEnd ? hoverEnd : null);
            const rangeMin = start && end ? (start <= end ? start : end) : start;
            const rangeMax = start && end ? (start <= end ? end : start) : null;
            const cells = [];
            for (let d = 1; d <= total; d++) {
                const date = new Date(y, m, d);
                const iso = isoDate(date);
                const isStart = start && isSameDay(date, rangeMin);
                const isEnd = rangeMax && isSameDay(date, rangeMax);
                const inRange = rangeMin && rangeMax && date > rangeMin && date < rangeMax;
                cells.push({
                    d, iso, date,
                    isToday: isSameDay(date, this.today),
                    isWeekend: date.getDay() === 0 || date.getDay() === 6,
                    isStart, isEnd, inRange
                });
            }
            return cells;
        },

        compactTitle2() {
            const nav = this.navDate2;
            return `${this.locale.months[nav.getMonth()]} ${nav.getFullYear()}`;
        },

        compactOffsetCells2() {
            const y = this.navDate2.getFullYear();
            const m = this.navDate2.getMonth();
            const firstDow = new Date(y, m, 1).getDay();
            const count = (firstDow - this.firstDay + 7) % 7;
            const cells = [];
            for (let i = 0; i < count; i++) {
                const dow = (this.firstDay + i) % 7;
                cells.push({ isWeekend: dow === 0 || dow === 6 });
            }
            return cells;
        },

        compactCells2() {
            const y = this.navDate2.getFullYear();
            const m = this.navDate2.getMonth();
            const total = daysInMonth(y, m);
            const start = parseIso(this.compactStart);
            const hoverEnd = this.compactHoverCell ? this.compactHoverCell.date : null;
            const end = parseIso(this.compactEnd) || (this.compactClickStep === 1 && hoverEnd ? hoverEnd : null);
            const rangeMin = start && end ? (start <= end ? start : end) : start;
            const rangeMax = start && end ? (start <= end ? end : start) : null;
            const cells = [];
            for (let d = 1; d <= total; d++) {
                const date = new Date(y, m, d);
                const iso = isoDate(date);
                const isStart = start && isSameDay(date, rangeMin);
                const isEnd = rangeMax && isSameDay(date, rangeMax);
                const inRange = rangeMin && rangeMax && date > rangeMin && date < rangeMax;
                cells.push({
                    d, iso, date,
                    isToday: isSameDay(date, this.today),
                    isWeekend: date.getDay() === 0 || date.getDay() === 6,
                    isStart, isEnd, inRange
                });
            }
            return cells;
        },

        /**
         * Действующий режим выбора. Компактный режим знает только «Одиночный» и «Диапазон»:
         * всё, кроме 'single' (в т.ч. 'multi'/'none' из старых конфигов), — диапазон.
         */
        selectionMode() {
            if (this.compactMode) return this.props.calSelectionMode === 'single' ? 'single' : 'range';
            return this.props.calSelectionMode || 'single';
        },

        /** Компактный режим «Одиночный»: один чип «Дата» вместо «С / По» */
        isCompactSingle() {
            return this.props.calSelectionMode === 'single';
        },

        /**
         * Время выбирается в чипах только при calWithTime, если формат переменных не 'date'
         * (в нём время отбрасывается) и режим выбора — дата или диапазон
         */
        // Всплывающий календарь у чипов — только когда мини-календарь виджета скрыт
        compactPickerOn() {
            return this.props.calCompactShowCalendar === false;
        },

        isTimeUiOn() {
            return Boolean(this.props.calWithTime)
                && this.props.calOutputFormat !== 'date'
                && ['single', 'range'].includes(this.selectionMode);
        },

        compactPresetsList() {
            const SINGLE_DAY_KEYS = ['today', 'yesterday'];
            const simplified = !this.props.calCompactShowCalendar && this.props.calCompactShowPresets !== false;
            // Режим «Одиночный»: пресеты-диапазоны выбрали бы диапазон — оставляем только пресеты на один день
            // (та же логика — presetHiddenReason в panels/SettingsPanel.vue)
            const filterList = (list) => {
                if (this.props.calSelectionMode !== 'single') {
                    return simplified ? list.filter(p => !SINGLE_DAY_KEYS.includes(p.key)) : list;
                }
                const todayRow = simplified && this.props.calCompactShowToday !== false;
                return list.filter((p) => {
                    if (todayRow && p.key === 'today') return false;
                    if (SINGLE_DAY_KEYS.includes(p.key)) return true;
                    if (p.start != null) return !p.end || p.end === p.start;
                    return Number(p.daysBack) === 1;
                });
            };
            if (this.props.calPresetsJson) {
                try {
                    const parsed = JSON.parse(this.props.calPresetsJson);
                    if (Array.isArray(parsed)) return filterList(parsed.map(p => this._localizePreset(p)));
                } catch (e) { /* fall through */ }
            }
            const labels = this.locale.presets;
            const fallback = ['today', 'yesterday', 'week', 'last_week', 'month', 'last_month', 'd7', 'd30', 'd90', 'year']
                .map(key => ({ key, label: labels[key] }));
            return filterList(fallback);
        },

        compactInnerStyle() {
            if (this.props.calCompactShowCalendar === false) return { width: 'auto' };
            if (this.props.calCompactDualMonth) return { width: '520px' };
            return {};
        },

        presetsGridStyle() {
            const cols = Number(this.props.calPresetsColumns);
            if (!cols || cols < 1) return {};
            return { display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)` };
        },

        compactSelectionHint() {
            return '';
        }
    },

    watch: {
        isEditorMode(val, oldVal) {
            this.editorSelection = { calSelectedDate: null, calSelectedStart: null, calSelectedEnd: null, calSelectedDates: null };
            // Выход из редактора: сбрасываем только видимый выбор. Выбор в редакторе живёт в
            // editorSelection (props не трогаются), поэтому ни писать props, ни звать propChanged
            // не нужно — иначе переключение пометило бы виджет изменённым и сохранило бы пустые
            // calSelected* в конфиг.
            if (oldVal === true && val === false) {
                this.rangeStart = null;
                this.rangeEnd = null;
                this.hoveredDate = null;
                this.selectedDates = [];
                this.compactClickStep = 0;
                this.compactHoverCell = null;
                this.activePreset = null;
                // Видимый выбор — снова из сохранённых props, как при mounted
                this._restoreSelectionFromProps();
            }
        },
        'props.calView'(v) {
            if (v && Object.values(VIEWS).includes(v)) this.currentView = v;
        },
        'props.calSelectedDate'(v) {
            if (v) { const d = parseIso(v); if (d) this.navDate = new Date(d); }
        },
        // Подсказка панели: чем на деле пишет режим 'auto' (calOutputFormatResolved)
        _resolvedFormatDeps: {
            immediate: true,
            handler() { this._syncResolvedFormat(); }
        },
        // ── Store-backed data: refresh cache when var names change ────
        'props.calEventsVar': {
            immediate: true,
            handler() { this._refreshStoreEvents(); }
        },
        // ── Input variable watchers (reactive store → calendar) ───────
        '_storeInDate': {
            immediate: true,
            handler(val) { this._queueStoreInput('date', val); }
        },
        '_storeInDateStart': {
            immediate: true,
            handler(val) { this._queueStoreInput('dateStart', val); }
        },
        '_storeInDateEnd': {
            immediate: true,
            handler(val) { this._queueStoreInput('dateEnd', val); }
        },
        '_storeInDatesList': {
            immediate: true,
            handler(val) { this._queueStoreInput('datesList', val); }
        },
        // ── Heatmap auto-toggle ──────────────────────────────────────
        // Enable heatmap automatically when any metric source is provided;
        // disable when all sources are cleared.
        'props.calMetricVar': {
            immediate: true,
            handler() { this._autoHeatmap(); this._refreshStoreMetric(); }
        },
        'props.calMetricJson'()  { this._autoHeatmap(); },
        'props.calMetricDataCol'() { this._autoHeatmap(); },
        'props.calUseMetricCol'() { this._autoHeatmap(); },
        'props.calUseStaticMetric'() { this._autoHeatmap(); }
    },

    mounted() {
        // Init view
        const v = this.props.calView;
        if (v && Object.values(VIEWS).includes(v)) this.currentView = v;

        // Init selection (date / range / multi) from props
        this._restoreSelectionFromProps();

        // Tick timer for "now" line
        this._tickNow();
        this.nowTimer = setInterval(() => this._tickNow(), 60000);

        // Restore time defaults from props when calWithTime is enabled.
        // Время, уже пришедшее из переменной (immediate-вотчеры срабатывают до mounted),
        // не затираем значениями по умолчанию.
        if (this.props.calWithTime) {
            if (!this.startTimeFromStore) this.rangeStartTime = this.defaultStartTime;
            if (!this.endTimeFromStore) this.rangeEndTime = this.defaultEndTime;
        }
    },

    beforeDestroy() {
        if (this.nowTimer) clearInterval(this.nowTimer);
    },

    methods: {
        // Видимый выбор из сохранённых props.calSelected* (mounted, выход из редактора)
        _restoreSelectionFromProps() {
            const sd = this.selectedDate;
            if (sd) this.navDate = new Date(sd);
            if (this.props.calSelectedStart) this.rangeStart = parseIso(this.props.calSelectedStart);
            if (this.props.calSelectedEnd) this.rangeEnd = parseIso(this.props.calSelectedEnd);
            if (!this.selectedDates.length && this.props.calSelectedDates) {
                try {
                    const parsed = JSON.parse(this.props.calSelectedDates);
                    if (Array.isArray(parsed)) this.selectedDates = parsed.map(String).filter(Boolean);
                } catch (e) { /* noop */ }
            }
        },

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
            if (this.compactMode) { d.setMonth(d.getMonth() - 1); }
            else if (this.currentView === 'month') d.setMonth(d.getMonth() - 1);
            else if (this.currentView === 'week') d.setDate(d.getDate() - 7);
            else if (this.currentView === 'day') d.setDate(d.getDate() - 1);
            else if (this.currentView === 'agenda') d.setMonth(d.getMonth() - 1);
            else if (this.currentView === 'year') d.setFullYear(d.getFullYear() - 1);
            this.navDate = d;
            // In dual-month compact mode navDate2 must stay at least one month ahead
            if (this.compactMode && this.props.calCompactDualMonth) {
                const n1 = d.getFullYear() * 12 + d.getMonth();
                const n2 = this.navDate2.getFullYear() * 12 + this.navDate2.getMonth();
                if (n2 <= n1) this.navDate2 = new Date(d.getFullYear(), d.getMonth() + 1, 1);
            }
        },

        nextPeriod() {
            const d = new Date(this.navDate);
            if (this.compactMode) { d.setMonth(d.getMonth() + 1); }
            else if (this.currentView === 'month') d.setMonth(d.getMonth() + 1);
            else if (this.currentView === 'week') d.setDate(d.getDate() + 7);
            else if (this.currentView === 'day') d.setDate(d.getDate() + 1);
            else if (this.currentView === 'agenda') d.setMonth(d.getMonth() + 1);
            else if (this.currentView === 'year') d.setFullYear(d.getFullYear() + 1);
            this.navDate = d;
            // In dual-month compact mode navDate2 must stay at least one month ahead
            if (this.compactMode && this.props.calCompactDualMonth) {
                const n1 = d.getFullYear() * 12 + d.getMonth();
                const n2 = this.navDate2.getFullYear() * 12 + this.navDate2.getMonth();
                if (n2 <= n1) this.navDate2 = new Date(d.getFullYear(), d.getMonth() + 1, 1);
            }
        },

        prevPeriod2() {
            const d = new Date(this.navDate2);
            d.setMonth(d.getMonth() - 1);
            // navDate2 must remain strictly after navDate (by at least one month)
            const n1 = this.navDate.getFullYear() * 12 + this.navDate.getMonth();
            const n2 = d.getFullYear() * 12 + d.getMonth();
            if (n2 <= n1) return;
            this.navDate2 = d;
        },

        nextPeriod2() {
            const d = new Date(this.navDate2);
            d.setMonth(d.getMonth() + 1);
            this.navDate2 = d;
        },

        goToday() {
            this.navDate = new Date();
            if (this.compactMode && this.props.calCompactDualMonth) {
                this.navDate2 = new Date(this.navDate.getFullYear(), this.navDate.getMonth() + 1, 1);
            }
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
                const selDate = this.selectedDate;
                if (selDate && isSameDay(day.date, selDate)) {
                    this._commitDate('');
                    return;
                }
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
                    this.hoveredDate = null;
                    this._commitRange(isoDate(this.rangeStart), isoDate(this.rangeEnd));
                }
            } else if (mode === SELECTION_MODES.MULTI) {
                // Toggle: clicking a selected date removes it; clicking unselected adds it
                const idx = this.selectedDates.indexOf(day.iso);
                if (idx >= 0) {
                    this.selectedDates = this.selectedDates.filter((d) => d !== day.iso);
                } else {
                    this.selectedDates = [...this.selectedDates, day.iso].sort();
                }
                this._commitMultiple(this.selectedDates);
            }
        },

        onDayHover(day, event) {
            if (this.props.calSelectionMode === SELECTION_MODES.RANGE && this.rangeStart && !this.rangeEnd) {
                this.hoveredDate = day.date;
            }
            if (event && this.props.calShowTooltip !== false) this.showTooltip(day, event);
        },

        // Клик по колонке дня в недельном виде — тот же выбор, что и клик по дню в месяце
        // (раньше всегда записывал одну дату, даже в режимах «Диапазон» и «Несколько»)
        onWeekColClick(day) {
            this.onDayClick(day);
        },

        onEventClick(ev) {
            this.$eventTrigger && this.$eventTrigger('calendarEventClick', ev);
        },

        onFullReset() {
            const mode = this.props.calSelectionMode || SELECTION_MODES.SINGLE;
            if (mode === SELECTION_MODES.MULTI) {
                this.selectedDates = [];
                this._commitMultiple([]);
            } else if (mode === SELECTION_MODES.RANGE) {
                this.rangeStart = null;
                this.rangeEnd = null;
                this.hoveredDate = null;
                this._commitRange('', '');
            } else {
                this._commitDate('');
            }
        },

        // ── Выбор: props вне редактора, теневое состояние в редакторе ──
        _sel(key) {
            if (this.isEditorMode) {
                const v = this.editorSelection[key];
                if (v !== null && v !== undefined) return v;
            }
            return this.props[key];
        },

        _setSel(key, value) {
            if (this.isEditorMode) this.editorSelection[key] = value;
            else this.props[key] = value;
        },

        // ── Входящие значения переменных: одно решение на доставку ───
        // Два канала: 'out' — watchStore по переменным виджета (date / dateStart / dateEnd /
        // datesList, привязанным на чтение), 'in' — входные переменные calDate*Var. Оба канала
        // проходят через _applyStoreDelivery: эхо, запоминание формата и выбор — по одним правилам.

        // Входной канал: значения четырёх вотчеров собираются и применяются один раз за тик —
        // иначе порядок вотчеров решал бы, чьё значение победит, а промежуточные состояния мигали бы.
        _queueStoreInput(key, val) {
            const st = this._fmtState();
            st.input[key] = val;
            if (st.inputQueued) return;
            st.inputQueued = true;
            this.$nextTick(() => {
                st.inputQueued = false;
                const { date, dateStart, dateEnd, datesList } = st.input;
                this._applyStoreDelivery({ date, dateStart, dateEnd, datesList }, 'in');
            });
        },

        // Эхо собственной записи. Решается по изменившимся переменным доставки (changed):
        //   - есть изменившаяся переменная, которую мы не записывали, — доставка внешняя;
        //   - все изменившиеся записаны нами и совпадают с записанным по смыслу (хранилище может
        //     вернуть число строкой) — эхо.
        // Ожидание эха снимается любой доставкой с изменениями и устаревает через ECHO_WINDOW_MS
        // (своё эхо приходит в ближайший тик; если значение не изменилось — доставки нет вовсе).
        _isEchoDelivery(values, changed, channel) {
            const st = this._fmtState();
            const pend = st.pendingEcho[channel];
            if (!pend) return false;
            if (Date.now() - pend.at > ECHO_WINDOW_MS) {
                st.pendingEcho[channel] = null;
                return false;
            }
            const keys = Object.keys(changed).filter((k) => changed[k]);
            if (!keys.length) return false;
            st.pendingEcho[channel] = null;
            return keys.every((k) => Object.prototype.hasOwnProperty.call(pend.values, k)
                && this._sameStoreValue(values[k], pend.values[k], k === 'datesList'));
        },

        // Какие переменные изменились с прошлой доставки по этому каналу. Сравнение по JSON:
        // платформа доставляет только при изменении JSON, так что внешняя запись той же даты в
        // другом виде ('2026-11-10' → '2026-11-10 00:00:00') — тоже изменение.
        // undefined — переменная не привязана, изменением не считается.
        _storeChanges(values, channel) {
            const seen = this._fmtState().seen[channel];
            const changed = {};
            Object.keys(values).forEach((k) => {
                const v = values[k];
                if (v === undefined) return;
                const json = JSON.stringify(v);
                changed[k] = !Object.prototype.hasOwnProperty.call(seen, k) || seen[k] !== json;
                seen[k] = json;
            });
            return changed;
        },

        // Одна доставка значений переменных → выбор. Эхо собственной записи ничего не меняет
        // (только запоминается как последняя доставка).
        _applyStoreDelivery(values, channel) {
            const changed = this._storeChanges(values, channel);
            if (this._isEchoDelivery(values, changed, channel)) return;
            const { date, dateStart, dateEnd, datesList } = values;
            // 'auto': запоминаем формат внешних значений
            ['date', 'dateStart', 'dateEnd', 'datesList'].forEach((k) => {
                if (changed[k]) this._learnFormat(k, values[k]);
            });
            const selMode = this.selectionMode;
            if (selMode === 'multi') {
                if (changed.datesList) this._applyStoreDatesList(datesList);
            } else if (selMode === 'range') {
                // Начало/конец пусты, а в `date` есть значение (в т. ч. при первой доставке) —
                // берём `date`
                const preferDate = changed.date && !isEmptyInput(date)
                    && isEmptyInput(dateStart) && isEmptyInput(dateEnd);
                if ((changed.dateStart || changed.dateEnd) && !preferDate) {
                    this._applyStoreDateRange(
                        dateStart !== undefined ? dateStart : null,
                        dateEnd !== undefined ? dateEnd : null
                    );
                } else if (changed.date) {
                    // Снаружи задали только `date` — однодневный диапазон
                    this._applyStoreDateAsRange(date);
                }
            } else if (changed.date && !(isEmptyInput(date) && changed.dateStart && !isEmptyInput(dateStart))) {
                this._applyStoreDate(date);
            } else if (changed.dateStart) {
                // Одиночный режим: снаружи задали только начало диапазона — берём его как дату
                this._applyStoreDate(dateStart);
            }
        },

        // ── Режим 'auto': формат по значению в переменной ────────────
        // Нереактивное состояние экземпляра: запомненный формат каждой переменной
        // (hints), ожидаемое эхо последней записи по каналам (pendingEcho) и последняя
        // доставка по каналам (seen) — своё эхо из хранилища ни формат, ни выбор не меняет.
        // Живёт, пока жив виджет: после
        // «Сбросить» (null) формат не откатывается к умолчанию.
        _fmtState() {
            if (!this.__fmtState) {
                this.__fmtState = { hints: {}, pendingEcho: { out: null, in: null }, seen: { out: {}, in: {} }, input: {} };
            }
            return this.__fmtState;
        },

        // Одинаковы ли два значения переменной по смыслу: та же дата и время (HH:mm)
        // или тот же список дат. Сравнение по разобранному значению, а не по JSON:
        // хранилище может вернуть число строкой или иначе обернуть значение.
        _sameStoreValue(a, b, isList) {
            if (isList) {
                if (isEmptyListInput(a) || isEmptyListInput(b)) return isEmptyListInput(a) && isEmptyListInput(b);
                const la = parseInputDateList(a, this._readOptions());
                const lb = parseInputDateList(b, this._readOptions());
                return Boolean(la && lb && la.length) && JSON.stringify(la) === JSON.stringify(lb);
            }
            if (isEmptyInput(a) || isEmptyInput(b)) return isEmptyInput(a) && isEmptyInput(b);
            const pa = parseInputDate(a, this._readOptions());
            const pb = parseInputDate(b, this._readOptions());
            return Boolean(pa && pb) && pa.iso === pb.iso && (pa.time || '') === (pb.time || '');
        },

        // Запомнить формат значения переменной key ('date' | 'dateStart' | 'dateEnd' | 'datesList').
        // Пустое / нераспознанное значение формат не меняет (эхо сюда не доходит —
        // его отсекает _applyStoreDelivery); новое внешнее значение другого формата —
        // заменяет запомненный.
        _learnFormat(key, value) {
            if (isEmptyInput(value)) return;
            const st = this._fmtState();
            const desc = detectValueFormat(value);
            if (!desc || (key === 'datesList') !== (desc.kind === 'list')) return;
            if (sameValueFormat(st.hints[key], desc)) return;
            st.hints[key] = desc;
            this._syncResolvedFormat();
        },

        // Формат для переменной: свой, иначе соседней (начало ↔ конец ↔ дата)
        _formatHint(key) {
            const chains = {
                date: ['date', 'dateStart', 'dateEnd'],
                dateStart: ['dateStart', 'dateEnd', 'date'],
                dateEnd: ['dateEnd', 'dateStart', 'date'],
                datesList: ['datesList']
            };
            const { hints } = this._fmtState();
            const found = (chains[key] || [key]).find((k) => hints[k]);
            return found ? hints[found] : null;
        },

        // Запомненный формат для записи — только в режиме 'auto'. Формат без времени
        // (дата, ГГГГММДД, ДД.ММ.ГГГГ) при включённом выборе времени не используется:
        // выбранное время не должно пропадать — пишется как раньше (timestamp мс).
        _autoHint(key) {
            if (!isAutoFormat(this.props.calOutputFormat)) return null;
            const hint = this._formatHint(key);
            if (hint && this.isTimeUiOn && !valueFormatHasTime(hint)) return null;
            return hint;
        },

        // Чем на деле пишет виджет: { format, source }.
        //   format — 'date' | 'timestamp' | 'timestamp_s' | 'datetime' | 'iso' | 'ddmmyyyy' | 'yyyymmdd'
        //            (при явном формате — значение calOutputFormat);
        //   source — 'variable' (по значению в переменной), 'time' (выбор времени включён),
        //            'default' (ISO-дата), 'setting' (формат задан явно).
        effectiveOutputFormat() {
            const explicit = this.props.calOutputFormat;
            if (!isAutoFormat(explicit)) return { format: explicit, source: 'setting' };
            const mode = this.selectionMode;
            const key = mode === 'multi' ? 'datesList' : (mode === 'range' ? 'dateStart' : 'date');
            const hint = this._autoHint(key);
            if (hint) return { format: formatName(hint), source: 'variable' };
            return this.isTimeUiOn ? { format: 'timestamp', source: 'time' } : { format: 'date', source: 'default' };
        },

        // Подсказка для панели: '<формат>|<источник>', например 'timestamp|variable'.
        // Реактивное поле экземпляра (outputFormatResolved), а не prop: панель получает
        // экземпляр виджета (elementInstance) и читает его оттуда — без propChanged
        // виджет не помечается изменённым и служебное значение не попадает в конфиг.
        _syncResolvedFormat() {
            if (!this.props) return;
            const r = this.effectiveOutputFormat();
            const value = `${r.format}|${r.source}`;
            if (this.outputFormatResolved !== value) this.outputFormatResolved = value;
        },

        // Запись в переменные с запоминанием записанного: следующая доставка по каждому
        // каналу, в которой изменились только записанные переменные и совпали с записью, — эхо
        // (см. _isEchoDelivery)
        _storeWrite(values) {
            const st = this._fmtState();
            const snapshot = {};
            Object.keys(values).forEach((k) => {
                const v = values[k];
                snapshot[k] = Array.isArray(v) ? v.slice() : v;
            });
            const pend = { values: snapshot, at: Date.now() };
            st.pendingEcho = { out: pend, in: pend };
            this.$storeCommit(values);
        },

        // Значение для переменной по выбранному формату (calOutputFormat).
        // Без выбора времени: начало — 00:00:00.000, конец диапазона — 23:59:59.999.
        // 'auto' с запомненным форматом переменной key — в этом формате (formatAs),
        // иначе — как раньше (ISO-дата / timestamp мс при выборе времени).
        _outValue(iso, isEnd = false, key = null) {
            // Время учитывается там же, где его можно выбрать в чипах (isTimeUiOn — по
            // действующему режиму selectionMode): старый конфиг compact + 'multi' работает
            // как диапазон и время берёт, а calWithTime в полном режиме multi — нет
            const withTime = this.isTimeUiOn;
            const time = isEnd
                ? (this.rangeEndTime || this.defaultEndTime)
                : (this.rangeStartTime || this.defaultStartTime);
            const hint = key ? this._autoHint(key) : null;
            // Пустое значение: '' для ISO-даты (как раньше), null для остальных форматов
            if (hint && !iso) return hint.kind === 'date' ? '' : null;
            if (hint) return formatAs(hint, iso, time, { withTime, isEnd });
            return toOutputValue(iso, { format: this.outputFormat, withTime, time, isEnd });
        },

        // Каждая дата списка — начало её дня (или время начала при calWithTime)
        _outList(isoList, key = null) {
            return isoList.map((iso) => this._outValue(iso, false, key)).filter((v) => v != null && v !== '');
        },

        _commitDate(iso) {
            this._setSel('calSelectedDate', iso);
            if (!this.isEditorMode) this.propChanged('calSelectedDate');
            this._storeWrite({ date: this._outValue(iso, false, 'date') });
        },

        _commitRange(start, end) {
            this._setSel('calSelectedStart', start);
            this._setSel('calSelectedEnd', end);
            if (!this.isEditorMode) {
                this.propChanged('calSelectedStart');
                this.propChanged('calSelectedEnd');
            }
            const dateValue = start ? this._outValue(start, false, 'date') : null;
            const startValue = start ? this._outValue(start, false, 'dateStart') : null;
            const endValue = end ? this._outValue(end, true, 'dateEnd') : null;
            // Форма списка (пара / все дни) — по старым правилам; контейнер (массив / JSON)
            // и формат элементов — по запомненному формату datesList, если он есть
            const listHint = this._autoHint('datesList');
            const isPair = datesListShape('range', this.props.calOutputFormat, this.isTimeUiOn) === DATES_LIST_SHAPES.PAIR;
            let datesList;
            if (isPair) {
                // 'auto' + calWithTime — как раньше: [начало, конец]
                const pair = listHint
                    ? [this._outValue(start, false, 'datesList'), this._outValue(end, true, 'datesList')]
                    : [startValue, endValue];
                const filled = pair.filter((v) => v != null && v !== '');
                if (listHint) datesList = formatListAs(listHint, filled);
                else datesList = filled.length ? filled : null;
            } else {
                // все дни диапазона в выбранном формате
                const days = start && end ? this._outList(expandDateRange(start, end), 'datesList') : null;
                datesList = days && listHint ? formatListAs(listHint, days) : days;
            }
            this._storeWrite({ date: dateValue, dateStart: startValue, dateEnd: endValue, datesList });
        },

        _commitMultiple(dates) {
            if (dates.length === 0) {
                this._setSel('calSelectedDates', '');
                if (!this.isEditorMode) this.propChanged('calSelectedDates');
                this._storeWrite({ datesList: null });
                return;
            }
            const json = JSON.stringify(dates);
            this._setSel('calSelectedDates', json);
            if (!this.isEditorMode) this.propChanged('calSelectedDates');
            // 'auto' с запомненным форматом — в нём; иначе 'auto' и 'date' — JSON-строка
            // ISO-дат (как раньше); timestamp / дата-время — массивом
            const listHint = this._autoHint('datesList');
            let value;
            if (listHint) {
                value = formatListAs(listHint, this._outList(dates, 'datesList'));
            } else {
                const shape = datesListShape('multi', this.props.calOutputFormat, this.isTimeUiOn);
                value = shape === DATES_LIST_SHAPES.JSON ? json : this._outList(dates);
            }
            this._storeWrite({ datesList: value });
        },

        // ── Cell classes ─────────────────────────────────────────────
        // Состояние выделения дня — общее для сетки месяца, колонок недели и вида «День»
        _daySelection(day) {
            const mode = this.props.calSelectionMode || SELECTION_MODES.SINGLE;
            const selDate = this.selectedDate;
            const isSelected = mode === SELECTION_MODES.SINGLE && selDate && isSameDay(day.date, selDate);
            const isRangeStart = mode === SELECTION_MODES.RANGE && this.rangeStart && isSameDay(day.date, this.rangeStart);
            const isRangeEnd = mode === SELECTION_MODES.RANGE && this.rangeEnd && isSameDay(day.date, this.rangeEnd);

            const hovered = this.hoveredDate || this.rangeEnd;
            const rangeMin = this.rangeStart && hovered ? (this.rangeStart < hovered ? this.rangeStart : hovered) : null;
            const rangeMax = this.rangeStart && hovered ? (this.rangeStart < hovered ? hovered : this.rangeStart) : null;
            const isInRange = mode === SELECTION_MODES.RANGE && rangeMin && rangeMax && day.date > rangeMin && day.date < rangeMax;
            const isMultiSelected = mode === SELECTION_MODES.MULTI && this.selectedDates.includes(day.iso);

            return {
                selected: Boolean(isSelected || isRangeStart || isRangeEnd),
                rangeStart: Boolean(isRangeStart),
                rangeEnd: Boolean(isRangeEnd),
                inRange: Boolean(isInRange),
                multi: Boolean(isMultiSelected)
            };
        },

        dayCellClass(day) {
            const s = this._daySelection(day);
            return {
                'elem-cal__cell--other-month': !day.inMonth,
                'elem-cal__cell--today': day.isToday && this.todayHighlight,
                'elem-cal__cell--weekend': day.isWeekend,
                'elem-cal__cell--selected': s.selected,
                'elem-cal__cell--range-start': s.rangeStart,
                'elem-cal__cell--range-end': s.rangeEnd,
                'elem-cal__cell--in-range': s.inRange,
                'elem-cal__cell--multi-selected': s.multi,
                'elem-cal__cell--has-events': day.events.length > 0,
                'elem-cal__cell--has-data': day.hasData
            };
        },

        // Колонка (base = 'elem-cal__week-col') или её заголовок (base = 'elem-cal__week-col-hd')
        // в видах «Неделя» / «День»: те же состояния выделения, что и в сетке месяца
        weekColClass(day, base = 'elem-cal__week-col') {
            if (!day) return {};
            const s = this._daySelection(day);
            return {
                [`${base}--today`]: day.isToday && this.todayHighlight,
                [`${base}--selected`]: s.selected || s.multi,
                [`${base}--range-start`]: s.rangeStart,
                [`${base}--range-end`]: s.rangeEnd,
                [`${base}--in-range`]: s.inRange
            };
        },

        // Наведение на колонку: превью диапазона, как в месяце. Тултип дня над сеткой часов не показываем —
        // он закрывал бы события; события колонки и так видны
        onWeekColHover(day) {
            if (this.props.calSelectionMode === SELECTION_MODES.RANGE && this.rangeStart && !this.rangeEnd) {
                this.hoveredDate = day.date;
            }
        },

        onWeekColLeave() {
            if (this.rangeStart && !this.rangeEnd) this.hoveredDate = null;
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
            const endFallback = sh >= 23 ? '23:59' : `${sh + 1}:00`;
            const [eh, em] = (ev.endTime || endFallback).split(':').map(Number);
            const top = (sh + sm / 60) * HOUR_HEIGHT;
            const height = Math.max((eh + em / 60 - sh - sm / 60) * HOUR_HEIGHT, 20);
            return {
                top: `${top}px`,
                height: `${height}px`,
                background: ev.color || this.props.calAccentColor
            };
        },

        // ── Tooltip ──────────────────────────────────────────────────
        showTooltip(day, event) {
            const rect = event.currentTarget.getBoundingClientRect();
            const offsetX = Number(this.props.calTooltipOffsetX) || 0;
            const offsetY = Number(this.props.calTooltipOffsetY) || 0;
            const tw = parseInt(this.props.calTooltipMaxWidth, 10) || 245;
            const th = parseInt(this.props.calTooltipMaxHeight, 10) || 210;
            let x, y;
            switch (this.props.calTooltipPosition) {
                case 'cursor':
                    x = event.clientX + offsetX;
                    y = event.clientY + offsetY;
                    break;
                case 'left':
                    x = rect.left - tw - offsetX;
                    y = rect.top + offsetY;
                    break;
                case 'top':
                    x = rect.left + offsetX;
                    y = rect.top - th - offsetY;
                    break;
                case 'bottom':
                    x = rect.left + offsetX;
                    y = rect.bottom + offsetY;
                    break;
                default: // 'right'
                    x = rect.right + offsetX;
                    y = rect.top + offsetY;
            }
            x = Math.max(4, Math.min(x, window.innerWidth - tw - 4));
            y = Math.max(4, Math.min(y, window.innerHeight - th - 4));
            this.tooltipDay = day;
            this.tooltipMeta = { x, y };
        },

        hideTooltip() {
            this.tooltipDay = null;
        },

        // ── Heatmap ──────────────────────────────────────────────────
        _heatmapBg(iso) {
            if (!this.props.calHeatmapEnabled) return null;
            const val = this.metricData[iso];
            if (val === undefined) return null;
            const { min, max } = this.metricMinMax;
            const t = max > min ? (val - min) / (max - min) : 0.5;
            const low = this.props.calHeatmapColorLow || '#f0f9ff';
            const high = this.props.calHeatmapColorHigh || this.props.calAccentColor || '#4f46e5';
            return lerpColor(low, high, t);
        },

        heatmapCellStyle(day) {
            if (day.isToday && this.todayHighlight) return {};
            const bg = this._heatmapBg(day.iso);
            return bg ? { background: bg } : {};
        },

        getMetricValue(iso) {
            return this.metricData[iso];
        },

        formatMetric(val) {
            if (val === undefined || val === null) return '';
            const num = Number(val);
            if (isNaN(num)) return String(val);
            if (Math.abs(num) >= 1e6) return (num / 1e6).toFixed(1) + 'M';
            if (Math.abs(num) >= 1e3) return (num / 1e3).toFixed(1) + 'K';
            return Number.isInteger(num) ? String(num) : num.toFixed(1);
        },

        // ── Year view navigation ─────────────────────────────────────
        goToMonth(m) {
            const d = new Date(this.navDate);
            d.setMonth(m);
            this.navDate = d;
            this.setView('month');
        },

        goToDay(cell) {
            this.navDate = new Date(cell.date);
            this.setView('day');
        },

        yearDayClass(cell) {
            const mode = this.props.calSelectionMode || SELECTION_MODES.SINGLE;
            return {
                'elem-cal__year-day--today': cell.isToday && this.todayHighlight,
                'elem-cal__year-day--weekend': cell.isWeekend,
                'elem-cal__year-day--has-events': cell.events.length > 0,
                'elem-cal__year-day--multi-selected': mode === SELECTION_MODES.MULTI && this.selectedDates.includes(cell.iso)
            };
        },

        yearDayStyle(cell) {
            if (cell.isToday && this.todayHighlight) return {};
            const bg = this._heatmapBg(cell.iso);
            return bg ? { background: bg } : {};
        },

        // ── Compact mode methods ─────────────────────────────────────
        compactCellClass(cell) {
            return {
                'compact__day--today':       cell.isToday && this.todayHighlight,
                'compact__day--weekend':     cell.isWeekend,
                'compact__day--range-start': cell.isStart,
                'compact__day--range-end':   cell.isEnd,
                'compact__day--in-range':    cell.inRange
            };
        },

        applyPreset(p) {
            const t = this.today;
            const y = t.getFullYear(), m = t.getMonth();
            let s, e;
            if (p.start != null) {
                s = p.start;
                e = p.end || p.start;
            } else if (p.daysBack != null) {
                s = isoDate(addDays(t, -(p.daysBack - 1)));
                e = isoDate(t);
            } else if (p.key === 'today')      { s = isoDate(t); e = s; }
            else if (p.key === 'yesterday') { const y2 = addDays(t, -1); s = isoDate(y2); e = s; }
            else if (p.key === 'week')  { const w = startOfWeek(t, this.firstDay); s = isoDate(w); e = isoDate(addDays(w, 6)); }
            else if (p.key === 'last_week') { const w = startOfWeek(addDays(t, -7), this.firstDay); s = isoDate(w); e = isoDate(addDays(w, 6)); }
            else if (p.key === 'month') { s = `${y}-${String(m+1).padStart(2,'0')}-01`; e = isoDate(new Date(y, m+1, 0)); }
            else if (p.key === 'last_month') { const pm = m === 0 ? 11 : m-1; const py = m === 0 ? y-1 : y; s = `${py}-${String(pm+1).padStart(2,'0')}-01`; e = isoDate(new Date(py, pm+1, 0)); }
            else if (p.key === 'd7')    { s = isoDate(addDays(t, -6)); e = isoDate(t); }
            else if (p.key === 'd30')   { s = isoDate(addDays(t, -29)); e = isoDate(t); }
            else if (p.key === 'd90')   { s = isoDate(addDays(t, -89)); e = isoDate(t); }
            else if (p.key === 'year')  { s = `${y}-01-01`; e = `${y}-12-31`; }
            else if (p.key === 'quarter' || p.key === 'last_quarter') {
                const q = quarterRange(t, p.key === 'quarter' ? 0 : -1);
                s = isoDate(q.start); e = isoDate(q.end);
            }
            if (s) {
                this.activePreset = p.key;
                if (this.props.calWithTime) {
                    this.rangeStartTime = this.defaultStartTime;
                    this.rangeEndTime = this.defaultEndTime;
                }
                this._setCompactRange(s, e || s);
            }
        },

        _setCompactRange(start, end) {
            this.rangeStart = parseIso(start);
            this.compactClickStep = 0;
            this.compactHoverCell = null;
            // Single day (presets Today/Yesterday, double-click same date)
            // компактный режим: всё, кроме «Одиночный», — диапазон (см. selectionMode)
            const isRange = !this.isCompactSingle;
            if (start && start === end) {
                // Диапазон — однодневный (чип «По» показывает ту же дату, что уйдёт в dateEnd);
                // одиночный режим — только дата
                this.rangeEnd = isRange ? parseIso(end) : null;
                // Auto-commit only when there is no Apply button to confirm
                if (!this.props.calCompactShowBottom) {
                    if (isRange) {
                        this._commitRange(start, start);
                    } else {
                        this._commitDate(start);
                    }
                }
            } else {
                this.rangeEnd = parseIso(end);
                if (!this.props.calCompactShowBottom) this._commitRange(start, end);
            }
            if (this.rangeStart) {
                this.navDate = new Date(this.rangeStart.getFullYear(), this.rangeStart.getMonth(), 1);
                if (this.props.calCompactDualMonth) {
                    const n1 = this.navDate.getFullYear() * 12 + this.navDate.getMonth();
                    if (this.rangeEnd) {
                        // An explicit end date is known (typed in, or picked on the mini-calendar) —
                        // jump the second month to it so it's always visible, instead of leaving
                        // navDate2 wherever it last happened to be.
                        const endNav = new Date(this.rangeEnd.getFullYear(), this.rangeEnd.getMonth(), 1);
                        const nEnd = endNav.getFullYear() * 12 + endNav.getMonth();
                        this.navDate2 = nEnd > n1 ? endNav : new Date(this.navDate.getFullYear(), this.navDate.getMonth() + 1, 1);
                    } else {
                        const n2 = this.navDate2.getFullYear() * 12 + this.navDate2.getMonth();
                        if (n2 <= n1) this.navDate2 = new Date(this.navDate.getFullYear(), this.navDate.getMonth() + 1, 1);
                    }
                }
            }
        },

        // Two-click range selection on the mini calendar
        onCompactDayClick(cell) {
            this.activePreset = null;
            const isSingle = this.isCompactSingle;

            if (isSingle) {
                // Single mode: one click commits the date and finishes
                this.rangeStart = cell.date;
                this.rangeEnd = null;
                this.compactClickStep = 0;
                this.compactHoverCell = null;
                this._commitDate(cell.iso);
                return;
            }

            if (this.compactClickStep === 0) {
                // First click: select the start date; wait for second click (or Apply)
                this.rangeStart = cell.date;
                this.rangeEnd = null;
                this.compactHoverCell = cell;
                this.compactClickStep = 1;
                if (this.props.calWithTime) {
                    this.rangeStartTime = this.defaultStartTime;
                    this.rangeEndTime = this.defaultEndTime;
                }
            } else {
                // Second click: extend to a full range and commit
                const s = this.rangeStart;
                const e = cell.date;
                const [start, end] = s <= e ? [s, e] : [e, s];
                if (this.props.calWithTime) {
                    this.rangeStartTime = this.defaultStartTime;
                    this.rangeEndTime = this.defaultEndTime;
                }
                this._setCompactRange(isoDate(start), isoDate(end));
            }
        },

        onCompactDayHover(cell, event) {
            if (this.compactClickStep === 1) {
                this.compactHoverCell = cell;
            }
            if (this.props.calCompactShowTooltip && event) {
                this.showTooltip({ ...cell, events: this._eventsForDay(cell.date) }, event);
            }
        },

        onCompactDayLeave() {
            if (this.compactClickStep === 1) {
                this.compactHoverCell = null;
            }
            if (this.props.calCompactShowTooltip) this.hideTooltip();
        },

        onCompactReset() {
            const isRange = !this.isCompactSingle;
            this.rangeStart = null;
            this.rangeEnd = null;
            this.compactClickStep = 0;
            this.compactHoverCell = null;
            this.activePreset = null;
            if (this.props.calWithTime) {
                this.rangeStartTime = this.defaultStartTime;
                this.rangeEndTime = this.defaultEndTime;
            }
            // Одиночный режим сбрасывает только дату — как полный режим (onFullReset)
            if (isRange) this._commitRange('', '');
            else         this._commitDate('');
        },

        onCompactApply() {
            const isRange = !this.isCompactSingle;
            if (this.compactClickStep === 1 && this.rangeStart) {
                // User clicked Apply mid-selection (only start chosen) — commit as one-day range/date
                const iso = isoDate(this.rangeStart);
                this.rangeEnd = null;
                this.compactClickStep = 0;
                this.compactHoverCell = null;
                if (isRange) {
                    this._commitRange(iso, iso);
                } else {
                    this._commitDate(iso);
                }
            } else if (!isRange && this.compactStart) {
                // Одиночный режим: дата могла прийти из переменной / сохранённого calSelectedDate
                this._commitDate(this.compactStart);
            } else if (this.rangeStart) {
                // Step 0: range already set locally — now commit it
                const start = isoDate(this.rangeStart);
                if (this.rangeEnd) {
                    this._commitRange(start, isoDate(this.rangeEnd));
                } else if (isRange) {
                    // Same-day preset (today/yesterday): rangeEnd is null but mode expects a range
                    this._commitRange(start, start);
                } else {
                    this._commitDate(start);
                }
            }
        },

        // Открыт всегда только один редактор чипа
        startEditingStart() {
            if (!this.editingStart) this.chipDraft = null; // черновик другого чипа не переносится
            this.editingEnd = false;
            this.editingStart = true;
            this.$nextTick(() => this.$refs.inputStart && this.$refs.inputStart.focus());
        },

        startEditingEnd() {
            if (!this.editingEnd) this.chipDraft = null;
            this.editingStart = false;
            this.editingEnd = true;
            this.$nextTick(() => this.$refs.inputEnd && this.$refs.inputEnd.focus());
        },

        // После Enter/Esc фокус возвращается на чип (иначе он падает на body);
        // при потере фокуса (клик в другое место) фокус не перехватываем
        _onChipEditorFinish(side, info) {
            this.chipDraft = null;
            if (!info || !info.viaKey) return;
            this.$nextTick(() => {
                const chip = side === 'start' ? this.$refs.chipStart : this.$refs.chipEnd;
                if (chip && chip.focus) chip.focus();
            });
        },

        // ── Всплывающий календарь чипов (DatePickerPopup) ────────────
        // Выбор в календаре идёт через поле ввода: setValue → commitByKey → тот же
        // _handleCompactInputCommit, что и при наборе с клавиатуры (значения идентичны).
        _chipInput(side) {
            return side === 'start' ? this.$refs.inputStart : this.$refs.inputEnd;
        },

        _chipPicker(side) {
            return side === 'start' ? this.$refs.pickerStart : this.$refs.pickerEnd;
        },

        _setChipDraft(side, draft) {
            this.chipDraft = draft ? { side, iso: draft.iso, time: draft.time } : null;
        },

        _ownDraft(side) {
            return this.chipDraft && this.chipDraft.side === side ? this.chipDraft : null;
        },

        // Пустой чип: календарь открывается на дате другого края (fallback) или на сегодня
        pickerValue(side) {
            const draft = this._ownDraft(side);
            if (draft && draft.iso) return draft.iso;
            return side === 'start' ? this.compactStart : this.compactEnd;
        },

        pickerTime(side) {
            const draft = this._ownDraft(side);
            if (draft && draft.time) return draft.time;
            return side === 'start' ? (this.rangeStartTime || '00:00') : (this.rangeEndTime || '23:59');
        },

        _isInsidePicker(side, el) {
            const picker = this._chipPicker(side);
            return Boolean(picker && picker.contains(el));
        },

        _isChipInput(side, el) {
            const input = this._chipInput(side);
            return Boolean(input && el && input.$el === el);
        },

        // ArrowDown в поле ввода — фокус в сетку календаря
        _focusPicker(side, e) {
            const picker = this._chipPicker(side);
            if (!picker) return;
            e.preventDefault();
            picker.focusDay();
        },

        _onPickerPick(side, { iso, time, commit }) {
            const input = this._chipInput(side);
            if (!input) return;
            input.setValue(iso, time);
            if (commit) input.commitByKey();
        },

        // «Очистить» — закрыть поле и сбросить выбор (как кнопка «Сбросить»)
        _onPickerClear(side) {
            const input = this._chipInput(side);
            if (input) input.cancelByKey();
            this.onCompactReset();
        },

        _onPickerEscape(side) {
            const input = this._chipInput(side);
            if (input) input.cancelByKey();
        },

        // Фокус ушёл и из календаря, и из поля — как потеря фокуса полем
        _onPickerLeave(side) {
            const input = this._chipInput(side);
            if (input) input.blurCommit();
        },

        formatChipDate(iso) {
            if (!iso) return '—';
            return formatByMask(iso, this.locale.dateShortMask);
        },

        // Подпись пресета на языке виджета. Пользовательская подпись не трогается;
        // автоподписи панели настроек (по-русски) и пустые заменяются на LOCALE_DATA.
        _localizePreset(p) {
            if (!p || typeof p !== 'object') return p;
            const label = typeof p.label === 'string' ? p.label.trim() : '';
            if (p.start == null && p.daysBack == null) {
                const builtin = this.locale.presets[p.key];
                const auto = AUTO_PRESET_LABELS[p.key] || [];
                if (builtin && (!label || auto.includes(label))) return { ...p, label: builtin };
                return p;
            }
            if (p.daysBack != null) {
                const m = label.match(AUTO_RELATIVE_LABEL_RE);
                if (!label || (m && Number(m[1]) === Number(p.daysBack))) {
                    return { ...p, label: pluralize(p.daysBack, this.locale.lastNDays) };
                }
                return p;
            }
            // Фиксированные даты: автоподпись панели («ДД.ММ.ГГГГ — ДД.ММ.ГГГГ», «ДД.ММ.ГГГГ»
            // при одной дате, у старых пресетов — ISO «2026-01-01 — 2026-01-31») → формат локали
            const end = p.end || p.start;
            const m = label.match(AUTO_FIXED_LABEL_RE);
            const sameDate = (text, iso) => text === iso || text === formatByMask(iso, 'DD.MM.YYYY');
            const isAuto = m && sameDate(m[1], p.start) && (m[2] ? sameDate(m[2], end) : p.start === end);
            if (!label || isAuto) {
                const mask = this.locale.dateMask;
                const text = p.start === end
                    ? formatByMask(p.start, mask)
                    : `${formatByMask(p.start, mask)} — ${formatByMask(end, mask)}`;
                return { ...p, label: text };
            }
            return p;
        },

        // ── Поля ввода в чипах «С / По» (DateTimeInput) ──────────────
        // parsed = { iso: 'YYYY-MM-DD', time: 'HH:mm' } — уже проверенное значение.
        // Некорректный ввод сюда не попадает (компонент шлёт cancel, прежнее значение сохраняется).
        _handleCompactInputCommit(parsed, side) {
            const isEditing = side === 'start' ? this.editingStart : this.editingEnd;
            if (!isEditing || !parsed || !parsed.iso) return;
            this.activePreset = null;
            if (!this.isCompactSingle) this._applyCompactRangeInput(parsed, side);
            else this._applyCompactSingleInput(parsed);
            if (side === 'start') this.editingStart = false;
            else                  this.editingEnd   = false;
        },

        // Одиночный режим: введённая дата фиксируется сразу, как клик по дню
        _applyCompactSingleInput(parsed) {
            if (this.isTimeUiOn && parsed.time) this.rangeStartTime = parsed.time;
            this.rangeStart = parseIso(parsed.iso);
            this.rangeEnd = null;
            this.compactClickStep = 0;
            this.compactHoverCell = null;
            this._navigateTo(parsed.iso);
            this._commitDate(parsed.iso);
        },

        // Диапазон: введённое значение всегда остаётся в том чипе, куда его ввели; подстраивается
        // другой край. «С» позже «По» → «По» := та же дата (однодневный диапазон, время «По»
        // сохраняется); «По» раньше «С» → «С» := та же дата. Если в один день время конца
        // оказалось раньше времени начала — подтягивается время другого края (конец ≥ начала).
        // Без второй даты получается однодневный диапазон.
        _applyCompactRangeInput(parsed, side) {
            const withTime = this.isTimeUiOn;
            const typedTime = withTime && parsed.time ? parsed.time : null;
            let start = this.compactStart || parsed.iso;
            let end = this.compactEnd || parsed.iso;
            if (side === 'start') {
                start = parsed.iso;
                if (end < start) end = start;
                if (withTime && typedTime) this.rangeStartTime = typedTime;
            } else {
                end = parsed.iso;
                if (start > end) start = end;
                if (withTime && typedTime) this.rangeEndTime = typedTime;
            }
            if (withTime && start === end && this.rangeStartTime && this.rangeEndTime
                && this.rangeEndTime < this.rangeStartTime) {
                if (side === 'start') this.rangeEndTime = this.rangeStartTime;
                else                  this.rangeStartTime = this.rangeEndTime;
            }
            this._setCompactRange(start, end);
        },

        // ── Helpers ──────────────────────────────────────────────────
        formatHour(h) {
            return `${String(h).padStart(2, '0')}:00`;
        },

        _autoHeatmap() {
            // учитывает свитчи панели «Данные»: выключенная метрика выключает тепловую карту
            const hasMetric = hasActiveMetricSource(this.props);
            if (hasMetric === this.props.calHeatmapEnabled) return;
            this.props.calHeatmapEnabled = hasMetric;
            this.propChanged('calHeatmapEnabled');
        },

        _tickNow() {
            this.today = new Date();
        },

        // ── Store-sourced data cache refresh ─────────────────────────
        // Direct access to store.state is non-reactive in computed properties.
        // These methods read from the store and write to local reactive data,
        // making parsedEvents / metricData update when the store changes.
        _refreshStoreEvents() {
            if (!this.props.calEventsVar) { this._eventsStoreRaw = null; return; }
            try {
                const v = store.state[this.props.calEventsVar]?.value;
                this._eventsStoreRaw = v != null ? v : null;
            } catch (e) { this._eventsStoreRaw = null; }
        },

        _refreshStoreMetric() {
            if (!this.props.calMetricVar) { this._metricStoreRaw = null; return; }
            try {
                const v = store.state[this.props.calMetricVar]?.value;
                this._metricStoreRaw = v != null ? v : null;
            } catch (e) { this._metricStoreRaw = null; }
        },

        // ── Store → local state sync helpers ─────────────────────────
        // Converts an incoming store value (ISO date / datetime, timestamp ms or s,
        // YYYYMMDD, DD.MM.YYYY, Date) into { iso: 'YYYY-MM-DD', time: 'HH:mm' | null }.
        // Returns null on empty / unparseable (see isEmptyInput to tell them apart).
        // Строка с явным поясом (Z / UTC / GMT / ±hh:mm):
        //   - выбор времени включён — это момент времени, переводится в пояс браузера;
        //   - выключен (только дата) — дата берётся буквально, как в исходной версии
        //     (slice(0, 10)): '2026-11-05T00:00:00Z' — 5 ноября в любом поясе.
        // Запись (formatAs) устроена так же, поэтому формат «Z» не сдвигает выбор.
        _readOptions() {
            return { convertZone: this.isTimeUiOn };
        },

        _parseStoreDate(val) {
            return parseInputDate(val, this._readOptions());
        },

        // Применить время из переменной к полю времени (только в режиме с временем)
        _applyStoreTime(parsed, side) {
            if (!parsed || !parsed.time || !this.isTimeUiOn) return false;
            const key = side === 'end' ? 'rangeEndTime' : 'rangeStartTime';
            if (side === 'end') this.endTimeFromStore = true;
            else                this.startTimeFromStore = true;
            if (this[key] === parsed.time) return false;
            this[key] = parsed.time;
            return true;
        },

        // Navigate the visible month/year to the given ISO date. When an end date is
        // also passed (range mode), the second month jumps to it so it's visible
        // instead of always defaulting to start's month + 1.
        _navigateTo(isoStr, endIsoStr) {
            const d = parseIso(isoStr);
            if (!d) return;
            this.navDate = new Date(d.getFullYear(), d.getMonth(), 1);
            if (this.props.calCompactDualMonth) {
                const n1 = this.navDate.getFullYear() * 12 + this.navDate.getMonth();
                const endDate = endIsoStr ? parseIso(endIsoStr) : null;
                if (endDate) {
                    const endNav = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
                    const nEnd = endNav.getFullYear() * 12 + endNav.getMonth();
                    this.navDate2 = nEnd > n1 ? endNav : new Date(this.navDate.getFullYear(), this.navDate.getMonth() + 1, 1);
                } else {
                    this.navDate2 = new Date(this.navDate.getFullYear(), this.navDate.getMonth() + 1, 1);
                }
            }
        },

        // Apply an incoming store value for the `date` var (single mode).
        // Эхо собственной записи сюда не доходит — его отсекает _applyStoreDelivery.
        _applyStoreDate(val) {
            const parsed = this._parseStoreDate(val);
            // Нераспознанное непустое значение выбор не сбрасывает
            if (!parsed && !isEmptyInput(val)) return;
            const iso = parsed ? parsed.iso : null;
            // Use ?? '' so that null and '' both normalise to '' — prevents the
            // early-return from firing when the prop is '' and iso is null
            // (both would have become null with || null, hiding the clear).
            const curIso = this._sel('calSelectedDate') ?? '';
            // Время применяем и при той же дате — иначе смена только времени теряется
            this._applyStoreTime(parsed, 'start');
            if ((iso ?? '') === curIso) return;
            // Компактный режим «Одиночный» показывает rangeStart — держим его в синхроне
            this.rangeStart = iso ? parseIso(iso) : null;
            this.rangeEnd = null;
            this.compactClickStep = 0;
            this.compactHoverCell = null;
            this.activePreset = null;
            if (!iso) {
                this._setSel('calSelectedDate', '');
            } else {
                this._setSel('calSelectedDate', iso);
                this._navigateTo(iso);
            }
        },

        // Режим диапазона, снаружи задали только `date`: однодневный диапазон
        // (начало = конец = дата; время начала — из значения, время конца не трогаем).
        _applyStoreDateAsRange(val) {
            const parsed = this._parseStoreDate(val);
            if (!parsed && !isEmptyInput(val)) return;
            this._applyStoreDateRange(val, parsed ? parsed.iso : null, { endTime: false });
        },

        // Apply incoming store values for `dateStart` + `dateEnd` (range mode).
        // options.endTime: false — время конца из значения не брать.
        _applyStoreDateRange(startVal, endVal, { endTime = true } = {}) {
            const startParsed = this._parseStoreDate(startVal);
            const endParsed   = this._parseStoreDate(endVal);
            // Нераспознанное непустое значение — игнорируем обновление целиком
            if ((!startParsed && !isEmptyInput(startVal)) || (!endParsed && !isEmptyInput(endVal))) return;
            const startIso = startParsed ? startParsed.iso : null;
            const endIso   = endParsed   ? endParsed.iso   : null;
            // Use ?? '' so that null and '' both normalise to '' — prevents the
            // early-return from firing when the props are '' and incoming ISOs
            // are null (both would have become null with || null, hiding the clear).
            const curStart = this._sel('calSelectedStart') ?? '';
            const curEnd   = this._sel('calSelectedEnd')   ?? '';
            // Время применяем и при тех же датах — иначе смена только времени теряется
            this._applyStoreTime(startParsed, 'start');
            if (endTime) this._applyStoreTime(endParsed, 'end');
            if ((startIso ?? '') === curStart && (endIso ?? '') === curEnd) return;

            if (!startIso) {
                this.rangeStart = null;
                this.rangeEnd = null;
                this.activePreset = null;
                this.compactClickStep = 0;
                this.compactHoverCell = null;
                this.editingStart = false;
                this.editingEnd = false;
                this._setSel('calSelectedStart', '');
                this._setSel('calSelectedEnd', '');
                return;
            }
            this.rangeStart = parseIso(startIso);
            this.rangeEnd   = endIso ? parseIso(endIso) : null;
            this._setSel('calSelectedStart', startIso);
            this._setSel('calSelectedEnd', endIso || '');
            this.activePreset = null;
            this.compactClickStep = 0;
            this.compactHoverCell = null;
            this._navigateTo(startIso, endIso);
        },

        // Apply an incoming store value for `datesList` (multi mode).
        _applyStoreDatesList(val) {
            // null / '' / [] / '[]' — сброс (виджет сам пишет [] при сбросе в timestamp / datetime)
            if (isEmptyListInput(val)) {
                // Guard: skip only when BOTH the local array and the prop are
                // already cleared — avoids a no-op but still catches the case
                // where selectedDates is [] while calSelectedDates still holds a
                // stale string, which would cause the null reset to be silently
                // ignored with the previous `selectedDates.length === 0` check.
                if (this.selectedDates.length === 0 && !this._sel('calSelectedDates')) return;
                this.selectedDates = [];
                this._setSel('calSelectedDates', '');
                return;
            }
            // Элементы — ISO-даты, timestamp'ы или числовые строки; массив или JSON-строка.
            // Не массив, или в непустом списке ни один элемент не распознан — выбор не трогаем.
            const newDates = parseInputDateList(val, this._readOptions());
            if (!newDates || !newDates.length) return;
            if (JSON.stringify(newDates) === JSON.stringify(this.selectedDates.slice().sort())) return;
            this.selectedDates = newDates;
            this._setSel('calSelectedDates', JSON.stringify(newDates));
            if (newDates.length) this._navigateTo(newDates[0]);
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
    min-height: 0;
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

.elem-cal__reset-btn {
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
    flex-shrink: 0;
}
.elem-cal__reset-btn:hover { background: rgba(255, 255, 255, 0.2); border-color: rgba(255, 255, 255, 0.6); }

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

/* ── Multi selection ─────────────────────────────────────────────── */
.elem-cal__cell--multi-selected {
    background: var(--cal-selected-bg) !important;
    position: relative;
}
.elem-cal__cell--multi-selected .elem-cal__day-num {
    color: var(--cal-selected-color) !important;
    font-weight: 700;
}
/* Small check badge in top-right corner for multi-selected dates */
.elem-cal__cell--multi-selected::after {
    content: '✓';
    position: absolute;
    top: 3px;
    right: 4px;
    font-size: 9px;
    line-height: 1;
    color: var(--cal-selected-color);
    opacity: 0.75;
    pointer-events: none;
}

.elem-cal__cell-inner {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 5px 5px 3px;
    box-sizing: border-box;
}

.elem-cal__cell-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    flex-shrink: 0;
}

.elem-cal__metric-val {
    font-size: 0.77em;
    font-weight: 700;
    color: var(--cal-accent);
    line-height: 22px;
    text-align: right;
    flex-shrink: 0;
    padding-right: 2px;
    opacity: 0.85;
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

/* Single scroll container — header is sticky inside it so both
   header cols and body cols always share the same layout width,
   eliminating the scrollbar-gutter misalignment. */
.elem-cal__week-scroller {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    min-height: 0;
    display: flex;
    flex-direction: column;
}

.elem-cal__week-head,
.elem-cal__day-head {
    display: flex;
    border-bottom: 1px solid var(--cal-cell-border);
    flex-shrink: 0;
    background: var(--cal-bg);
    position: sticky;
    top: 0;
    z-index: 2;
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
    flex-shrink: 0;
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

/* ── Выделение в видах «Неделя» / «День» ─────────────────────────────
   Колонка — лёгкая заливка (события поверх остаются читаемыми), заголовок — цвет выделения */
.elem-cal__week-col--in-range { background: var(--cal-range-bg); }
.elem-cal__week-col--selected::before {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--cal-selected-bg);
    opacity: 0.12;
    pointer-events: none;
}
.elem-cal__week-col-hd--in-range { background: var(--cal-range-bg); }
.elem-cal__week-col-hd--selected,
.elem-cal__week-col-hd--selected:hover { background: var(--cal-selected-bg); }
.elem-cal__week-col-hd--selected .elem-cal__week-dow,
.elem-cal__week-col-hd--selected .elem-cal__week-num:not(.elem-cal__week-num--today) { color: var(--cal-selected-color); }
/* выбранный «сегодня»: кружок сохраняет белый текст, обводка отделяет его от фона выделения */
.elem-cal__week-col-hd--selected .elem-cal__week-num--today { box-shadow: 0 0 0 2px var(--cal-selected-color); }

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


/* ── Year view ───────────────────────────────────────────────────── */
.elem-cal__year {
    flex: 1;
    overflow-y: auto;
    min-height: 0;
    padding: 12px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(155px, 1fr));
    gap: 12px;
    align-content: start;
}

.elem-cal__year-month {
    background: var(--cal-cell-bg);
    border: 1px solid var(--cal-cell-border);
    border-radius: 10px;
    padding: 10px 8px;
}

.elem-cal__year-month-hd {
    font-size: 0.85em;
    font-weight: 700;
    color: #334155;
    text-align: center;
    margin-bottom: 7px;
    padding: 3px 4px;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.12s, color 0.12s;
}
.elem-cal__year-month-hd:hover { background: var(--cal-cell-hover-bg); color: var(--cal-accent); }

.elem-cal__year-month-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 1px;
}

.elem-cal__year-wd {
    text-align: center;
    font-size: 0.69em;
    font-weight: 700;
    color: #94a3b8;
    padding: 2px 0 4px;
    text-transform: uppercase;
}

.elem-cal__year-day {
    text-align: center;
    font-size: 0.77em;
    font-weight: 500;
    color: #475569;
    border-radius: 50%;
    cursor: pointer;
    transition: background 0.1s, color 0.1s;
    line-height: 1;
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
}
.elem-cal__year-day:hover:not(.elem-cal__year-day--empty):not(.elem-cal__year-day--today) { background: var(--cal-cell-hover-bg); }
.elem-cal__year-day--empty { cursor: default; pointer-events: none; }
.elem-cal__year-day--today { background: var(--cal-today-color) !important; color: #fff !important; font-weight: 700; }
.elem-cal__year-day--weekend { color: var(--cal-weekend-color); }
.elem-cal__year-day--has-events::after {
    content: '';
    position: absolute;
    bottom: 1px;
    left: 50%;
    transform: translateX(-50%);
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: var(--cal-accent);
}
.elem-cal__year-day--today.elem-cal__year-day--has-events::after { background: rgba(255,255,255,0.7); }
.elem-cal__year-day--multi-selected {
    background: var(--cal-selected-bg) !important;
    color: var(--cal-selected-color) !important;
    font-weight: 700;
}

/* ── Tooltip ─────────────────────────────────────────────────────── */
.elem-cal__tooltip {
    min-width: var(--cal-tooltip-min-width, 165px);
    max-width: var(--cal-tooltip-max-width, 245px);
    min-height: var(--cal-tooltip-min-height, 0);
    max-height: var(--cal-tooltip-max-height, none);
    overflow: auto;
    padding: 10px 12px;
    background: var(--cal-tooltip-bg);
    color: var(--cal-tooltip-color);
    border-radius: var(--cal-tooltip-radius);
    border: var(--cal-tooltip-border, none);
    box-shadow: var(--cal-tooltip-shadow);
    font-family: var(--cal-tooltip-font-family, inherit);
    font-size: var(--cal-tooltip-font-size, 12px);
    line-height: 1.4;
    box-sizing: border-box;
}

.elem-cal__tooltip-date {
    font-weight: 700;
    color: inherit;
    opacity: 0.95;
    margin-bottom: 7px;
    font-size: 0.92em;
}

.elem-cal__tooltip-metric {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 4px 8px;
    background: rgba(255,255,255,0.10);
    border-radius: 6px;
    margin-bottom: 7px;
    font-size: 0.92em;
    font-weight: 700;
}
.elem-cal__tooltip-metric-icon { color: var(--cal-accent); font-size: 0.85em; }

.elem-cal__tooltip-events { display: flex; flex-direction: column; gap: 4px; }

.elem-cal__tooltip-ev {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.92em;
}
.elem-cal__tooltip-ev-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.elem-cal__tooltip-ev-title { opacity: 0.72; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px; }
.elem-cal__tooltip-more { font-size: 0.85em; opacity: 0.5; margin-top: 2px; }
.elem-cal__tooltip-empty { font-size: 0.85em; opacity: 0.5; font-style: italic; }

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

/* ═══════════════════════════════════════════════════════════════════
   Compact mode — dashboard / report date-range picker
═══════════════════════════════════════════════════════════════════ */
.elem-cal__compact {
    display: inline-flex;
    justify-content: flex-start;
    align-items: flex-start;
    padding: 10px 12px;
    height: auto;
    width: auto;
    box-sizing: border-box;
}
/* simplified / input — растягиваем на всю ширину контейнера */
.elem-cal__compact--wide {
    display: flex;
    width: 100%;
}
.compact__inner {
    display: flex;
    flex-direction: column;
    gap: 6px;
    width: 280px;
    flex-shrink: 0;
}
.elem-cal__compact--wide .compact__inner {
    flex: 1;
    width: auto;
    min-width: 280px;
    flex-shrink: 1;
}

/* Preset chips */
.compact__presets {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
}
.compact__preset {
    padding: 4px 10px;
    border-radius: 20px;
    border: 1.5px solid var(--cal-cell-border);
    background: var(--cal-cell-bg);
    color: #475569;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    transition: border-color 0.12s, background 0.12s, color 0.12s;
    white-space: nowrap;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
}
.compact__preset:hover { border-color: var(--cal-accent); color: var(--cal-accent); }
.compact__preset--active {
    background: var(--cal-accent);
    border-color: var(--cal-accent);
    color: #fff;
}
/* Month navigation */
.compact__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
    padding: 2px 0;
}
.compact__nav {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border: none;
    border-radius: 7px;
    background: var(--cal-cell-hover-bg);
    color: #475569;
    cursor: pointer;
    transition: background 0.12s;
    flex-shrink: 0;
    padding: 0;
}
.compact__nav:hover { background: var(--cal-cell-border); }
.compact__month-label {
    font-size: 0.95em;
    font-weight: 700;
    color: #1e293b;
    flex: 1;
    text-align: center;
}
.compact__today-chip {
    border: 1px solid var(--cal-cell-border);
    border-radius: 20px;
    background: transparent;
    font-size: 10px;
    font-weight: 600;
    color: var(--cal-accent);
    padding: 2px 8px;
    cursor: pointer;
    flex-shrink: 0;
    transition: background 0.12s, border-color 0.12s;
}
.compact__today-chip:hover { background: var(--cal-range-bg); border-color: var(--cal-accent); }
.compact__today-row { display: flex; justify-content: center; padding: 2px 0 4px; }
.compact__dual-grids {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
}
.compact__dual-col {
    min-width: 0;
    overflow: hidden;
}
.compact__dual-col .compact__head { padding: 2px 0 4px; }
.compact__dual-col .compact__day { font-size: 0.72em; }

/* Calendar grid */
.compact__grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 2px 0;
}
.compact__wd {
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.65em;
    font-weight: 700;
    color: #94a3b8;
    text-transform: uppercase;
}
.compact__day {
    aspect-ratio: 1;
    height: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.77em;
    font-weight: 500;
    color: #475569;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.1s, color 0.1s;
    user-select: none;
}
.compact__day:hover:not(.compact__day--empty):not(.compact__day--today):not(.compact__day--in-range) {
    background: var(--cal-cell-hover-bg);
}
.compact__day:not(.compact__day--empty) { cursor: pointer; }
.compact__day--empty { cursor: default; pointer-events: none; }
.compact__day--today { background: var(--cal-today-bg); color: var(--cal-today-color); font-weight: 700; }
.compact__day--weekend { color: var(--cal-weekend-color); }
.compact__day--range-start,
.compact__day--range-end {
    /* как в полном режиме — цвета «Фон / Текст выделения» из панели «Оформление» */
    background: var(--cal-selected-bg) !important;
    color: var(--cal-selected-color) !important;
    font-weight: 700;
    border-radius: 4px;
}
.compact__day--in-range {
    background: var(--cal-range-bg);
    border-radius: 0;
}
.compact__day--range-start { border-radius: 4px 0 0 4px; }
.compact__day--range-end   { border-radius: 0 4px 4px 0; }
.compact__day--range-start.compact__day--range-end { border-radius: 4px; }

/* Selection hint */
.compact__hint {
    font-size: 10px;
    color: var(--cal-accent);
    font-weight: 600;
    text-align: center;
    padding: 2px 0;
    min-height: 16px;
}

/* Bottom panel: tap-to-edit chips + action buttons */
.compact__bottom {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding-top: 2px;
}

/* Date chips row */
.compact__chips {
    display: flex;
    align-items: center;
    gap: 4px;
}
.compact__chip {
    display: flex;
    align-items: center;
    gap: 5px;
    flex: 1;
    min-width: 0;
    background: var(--cal-cell-bg);
    border: 1.5px solid var(--cal-cell-border);
    border-radius: 8px;
    padding: 5px 8px;
    cursor: pointer;
    transition: border-color 0.12s;
    user-select: none;
}
.compact__chip:hover { border-color: var(--cal-accent); }
.compact__chip--active { border-color: var(--cal-accent); }
.compact__chip:focus-visible {
    outline: none;
    border-color: var(--cal-accent);
    box-shadow: 0 0 0 2px var(--cal-range-bg, rgba(79,106,255,0.15));
}
/* С временем «ДД.ММ.ГГГГ ЧЧ:мм» два чипа в ряд не помещаются в узком виджете:
   чипы переносятся на отдельные строки (стрелка тогда не нужна), текст не рвётся */
.compact__chips--time { flex-wrap: wrap; }
.compact__chips--time .compact__chip { flex: 1 1 150px; }
.compact__chips--time .compact__chip-sep { display: none; }
.compact__chip-label {
    font-size: 10px;
    font-weight: 700;
    color: #94a3b8;
    text-transform: uppercase;
    flex-shrink: 0;
}
.compact__chip-value {
    font-size: 12px;
    font-weight: 600;
    color: #334155;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-variant-numeric: tabular-nums;
}
.compact__chip-input {
    flex: 1;
    border: none;
    background: transparent;
    outline: none;
    font-size: 11px;
    color: #334155;
    font-weight: 500;
    min-width: 0;
    width: 100%;
    cursor: text;
}
.compact__chip-sep {
    font-size: 13px;
    color: #cbd5e1;
    flex-shrink: 0;
}

/* Action buttons */
.compact__actions {
    display: flex;
    gap: 6px;
}
.compact__btn {
    flex: 1;
    border: none;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
    padding: 7px 0;
    cursor: pointer;
    transition: background 0.12s, opacity 0.12s;
}
.compact__btn--reset {
    background: var(--cal-cell-hover-bg);
    color: #64748b;
    border: 1.5px solid var(--cal-cell-border);
}
.compact__btn--reset:hover { background: var(--cal-cell-border); }
.compact__btn--apply {
    background: var(--cal-accent);
    color: #fff;
}
.compact__btn--apply:hover { opacity: 0.88; }
.compact__btn--apply:disabled { opacity: 0.4; cursor: not-allowed; }

/* No-weekends: collapse weekend columns, matching large calendar behaviour */
.compact__grid--no-weekends {
    grid-template-columns: repeat(5, 1fr);
}
.compact__grid--no-weekends .compact__wd--weekend,
.compact__grid--no-weekends .compact__day--weekend {
    display: none;
}
</style>
