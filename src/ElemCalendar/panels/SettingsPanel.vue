<template>
    <w-panel>
        <ui-container>

            <!-- ── Режим виджета ─────────────────────────────────────── -->
            <div class="p-section">
                <div class="p-section__label">Режим виджета</div>
                <div class="mode-cards">
                    <div
                        class="mode-card"
                        :class="{ 'mode-card--active': props.calMode !== 'compact' }"
                        @click="setWidgetMode('full')">
                        <div class="mode-card__icon">🗓</div>
                        <div class="mode-card__title">Полный календарь</div>
                        <div class="mode-card__desc">Месяц, неделя, день, список, год. Для порталов и мониторинга.</div>
                    </div>
                    <div
                        class="mode-card"
                        :class="{ 'mode-card--active': props.calMode === 'compact' }"
                        @click="setWidgetMode('compact')">
                        <div class="mode-card__icon">📅</div>
                        <div class="mode-card__title">Компактный календарь</div>
                        <div class="mode-card__desc">Компактный выбор даты или периода для дашбордов и отчётов.</div>
                    </div>
                </div>
            </div>

            <!-- ── Режим компактного виджета ────────────────────────── -->
            <div v-if="isCompact" class="p-section">
                <div class="p-section__label">Режим компактного виджета</div>
                <div class="compact-modes">
                    <div class="compact-mode" :class="{ 'compact-mode--active': compactSubMode === 'standard' }" @click="setCompactMode('standard')">
                        Выбор периода
                    </div>
                    <div class="compact-mode" :class="{ 'compact-mode--active': compactSubMode === 'extended' }" @click="setCompactMode('extended')">
                        Выбор периода<br><span class="compact-mode__sub">расширенный</span>
                    </div>
                    <div class="compact-mode" :class="{ 'compact-mode--active': compactSubMode === 'simplified' }" @click="setCompactMode('simplified')">
                        Выбор периода<br><span class="compact-mode__sub">упрощённый</span>
                    </div>
                    <div class="compact-mode" :class="{ 'compact-mode--active': compactSubMode === 'input' }" @click="setCompactMode('input')">
                        Ввод дат
                    </div>
                </div>
            </div>

            <!-- ── Общие параметры (язык + первый день) ─────────────── -->
            <div class="p-section p-section--inline-row">
                <div class="p-row">
                    <span class="p-row__label">Язык</span>
                    <div class="seg-ctrl">
                        <button
                            v-for="l in localeOptions"
                            :key="l.value"
                            class="seg-ctrl__btn"
                            :class="{ 'seg-ctrl__btn--active': props.calLocale === l.value }"
                            @click="setLocale(l.value)">
                            {{ l.label }}
                        </button>
                    </div>
                </div>
                <!-- первый день: сетка мини-календаря, всплывающий календарь чипов, пресеты «Эта / Пр. неделя» (isFirstDayUseful) -->
                <div v-if="isFirstDayUseful" class="p-row">
                    <span class="p-row__label">Первый день недели</span>
                    <div class="seg-ctrl">
                        <button
                            class="seg-ctrl__btn"
                            :class="{ 'seg-ctrl__btn--active': props.calFirstDay === 1 }"
                            @click="set('calFirstDay', 1)">Пн</button>
                        <button
                            class="seg-ctrl__btn"
                            :class="{ 'seg-ctrl__btn--active': props.calFirstDay === 0 }"
                            @click="set('calFirstDay', 0)">Вс</button>
                    </div>
                </div>
            </div>

            <!-- ── Вид (только полный режим) ─────────────────────────── -->
            <div v-if="!isCompact" class="p-section">
                <div class="p-section__label">Виды календаря</div>
                <div class="view-list">
                    <div v-for="v in allViews" :key="v.value" class="view-row">
                        <div
                            class="view-row__toggle"
                            :class="{ 'view-row__toggle--on': isViewAvailable(v.value), 'view-row__toggle--locked': isLastView(v.value) }"
                            :title="isLastView(v.value) ? 'Должен остаться хотя бы один вид' : ''"
                            @click="toggleView(v.value, !isViewAvailable(v.value))">
                            <div class="view-row__toggle-thumb" />
                        </div>
                        <span
                            class="view-row__label"
                            :class="{ 'view-row__label--off': !isViewAvailable(v.value) }">
                            {{ v.label }}
                        </span>
                        <button
                            class="view-row__star"
                            :class="{ 'view-row__star--active': props.calView === v.value }"
                            :disabled="!isViewAvailable(v.value)"
                            title="Открывается по умолчанию"
                            @click="setView(v.value)">
                            <i :class="props.calView === v.value ? 'mdi mdi-star' : 'mdi mdi-star-outline'" />
                        </button>
                    </div>
                </div>
                <div class="p-hint" style="margin-top:4px">Звёздочка — вид при открытии виджета</div>
            </div>

            <!-- ── Режим выбора дат ──────────────────────────────────── -->
            <div class="p-section">
                <div class="p-section__label">Режим выбора дат</div>

                <div v-if="isCompact" class="p-row">
                    <span class="p-row__label">Выбор</span>
                    <div class="seg-ctrl">
                        <button
                            class="seg-ctrl__btn"
                            :class="{ 'seg-ctrl__btn--active': selectionMode === 'range' }"
                            @click="set('calSelectionMode', 'range')">
                            Диапазон
                        </button>
                        <button
                            class="seg-ctrl__btn"
                            :class="{ 'seg-ctrl__btn--active': props.calSelectionMode === 'single' }"
                            @click="set('calSelectionMode', 'single')">
                            Одиночный
                        </button>
                    </div>
                </div>
                <div v-else class="p-row">
                    <span class="p-row__label">Режим</span>
                    <div class="seg-ctrl">
                        <button
                            v-for="m in selModes"
                            :key="m.value"
                            class="seg-ctrl__btn"
                            :class="{ 'seg-ctrl__btn--active': props.calSelectionMode === m.value }"
                            @click="set('calSelectionMode', m.value)">
                            {{ m.label }}
                        </button>
                    </div>
                </div>

                <!-- Формат значения в переменных (date / dateStart / dateEnd / datesList).
                     «Авто» пишет в формате значения, уже лежащего в переменной (что определено — подпись ниже) -->
                <div v-if="selectionMode !== 'none'" class="p-row">
                    <span class="p-row__label p-row__label--nowrap">В переменную</span>
                    <div class="seg-ctrl seg-ctrl--tight">
                        <button
                            v-for="f in outputFormatOptions"
                            :key="f.value"
                            class="seg-ctrl__btn"
                            :class="{ 'seg-ctrl__btn--active': outputFormatGroup === f.value }"
                            @click="setOutputFormatGroup(f.value)">
                            {{ f.label }}
                        </button>
                    </div>
                </div>
                <template v-if="selectionMode !== 'none'">
                    <!-- «Дата и время»: строкой ('datetime') или числом в мс ('timestamp') -->
                    <div v-if="outputFormatGroup === 'datetime'" class="sub-group">
                        <div class="p-row">
                            <span class="p-row__label">Вид</span>
                            <div class="seg-ctrl seg-ctrl--tight">
                                <button
                                    class="seg-ctrl__btn"
                                    :class="{ 'seg-ctrl__btn--active': props.calOutputFormat === 'datetime' }"
                                    title="ГГГГ-ММ-ДД ЧЧ:мм:сс"
                                    @click="setOutputFormat('datetime')">Строкой</button>
                                <button
                                    class="seg-ctrl__btn"
                                    :class="{ 'seg-ctrl__btn--active': props.calOutputFormat === 'timestamp' }"
                                    title="Timestamp, миллисекунды"
                                    @click="setOutputFormat('timestamp')">Числом (мс)</button>
                            </div>
                        </div>
                    </div>
                    <div v-if="outputFormatGroup === 'auto'" class="p-hint" style="margin-bottom:4px">{{ autoFormatCaption }}</div>
                    <div v-if="formatShapeHint" class="p-hint" style="margin-bottom:4px">{{ formatShapeHint }}</div>
                </template>

                <!-- время: только для одиночной даты и диапазона; явный формат «Дата» время отбрасывает
                     ('auto' с временем виджет сам передаёт как timestamp) -->
                <template v-if="isTimeApplicable && props.calOutputFormat !== 'date'">
                    <label class="toggle-row">
                        <span class="toggle-row__label">Выбор времени</span>
                        <div class="toggle" :class="{ 'toggle--on': isTimeOn }" @click="toggleBool('calWithTime')">
                            <div class="toggle__thumb" />
                        </div>
                    </label>
                    <div v-if="!isTimeOn && ['timestamp', 'datetime'].includes(props.calOutputFormat)" class="p-hint" style="margin-bottom:4px">Без времени: начало — 00:00:00, конец — 23:59:59.</div>
                    <div v-if="isTimeOn" class="sub-group">
                        <div class="p-row">
                            <span class="p-row__label">{{ isRangeMode ? 'Время начала' : 'Время' }}</span>
                            <input
                                type="text"
                                class="time-input"
                                :class="{ 'time-input--invalid': isTimeInvalid('calDefaultStartTime') }"
                                :value="timeDisplay('calDefaultStartTime')"
                                placeholder="00:00"
                                maxlength="5"
                                @change="setTime('calDefaultStartTime', $event, '00:00')" />
                        </div>
                        <div v-if="isRangeMode" class="p-row">
                            <span class="p-row__label">Время конца</span>
                            <input
                                type="text"
                                class="time-input"
                                :class="{ 'time-input--invalid': isTimeInvalid('calDefaultEndTime') }"
                                :value="timeDisplay('calDefaultEndTime')"
                                placeholder="23:59"
                                maxlength="5"
                                @change="setTime('calDefaultEndTime', $event, '23:59')" />
                        </div>
                        <div v-if="isTimeInvalid('calDefaultStartTime') || isTimeInvalid('calDefaultEndTime')" class="p-warn" style="margin:0 0 4px">
                            Формат ЧЧ:мм, 00:00–23:59. Неверное значение не применяется.
                        </div>
                        <div v-if="!isCompact" class="p-hint">В полном календаре это время подставляется по умолчанию.</div>
                    </div>
                </template>
            </div>

            <!-- ── Отображение (компактный режим) ──────────────────── -->
            <div v-if="isCompact" class="p-section">
                <div class="p-section__label">Элементы интерфейса</div>

                <label class="toggle-row">
                    <span class="toggle-row__label">Мини-календарь</span>
                    <div class="toggle" :class="{ 'toggle--on': isCalendarOn }" @click="toggleBool('calCompactShowCalendar')">
                        <div class="toggle__thumb" />
                    </div>
                </label>
                <div v-if="isCalendarOn" class="sub-group">
                    <label class="toggle-row">
                        <span class="toggle-row__label">Два месяца рядом</span>
                        <div class="toggle" :class="{ 'toggle--on': isDualMonth }" @click="toggleBool('calCompactDualMonth')">
                            <div class="toggle__thumb" />
                        </div>
                    </label>
                    <label class="toggle-row">
                        <span class="toggle-row__label">Показывать выходные</span>
                        <div class="toggle" :class="{ 'toggle--on': props.calShowWeekends }" @click="toggleBool('calShowWeekends')">
                            <div class="toggle__thumb" />
                        </div>
                    </label>
                    <label class="toggle-row">
                        <span class="toggle-row__label">Выделять «Сегодня»</span>
                        <div class="toggle" :class="{ 'toggle--on': props.calHighlightToday !== false }" @click="toggleBool('calHighlightToday')">
                            <div class="toggle__thumb" />
                        </div>
                    </label>
                </div>

                <!-- в режиме «Два месяца рядом» кнопки «Сегодня» нет -->
                <label v-if="!isDualMonth" class="toggle-row">
                    <span class="toggle-row__label">{{ isCalendarOn ? 'Кнопка «Сегодня» в шапке' : 'Кнопка «Сегодня»' }}</span>
                    <div class="toggle" :class="{ 'toggle--on': props.calCompactShowToday !== false }" @click="toggleBool('calCompactShowToday')">
                        <div class="toggle__thumb" />
                    </div>
                </label>

                <label class="toggle-row">
                    <span class="toggle-row__label">Нижняя панель (ввод дат)</span>
                    <div class="toggle" :class="{ 'toggle--on': isBottomOn }" @click="toggleBool('calCompactShowBottom')">
                        <div class="toggle__thumb" />
                    </div>
                </label>
                <div v-if="isBottomOn" class="sub-group">
                    <div class="p-row">
                        <span class="p-row__label">Отступ между чипами</span>
                        <div class="num-unit-ctrl">
                            <input
                                type="number"
                                class="time-input num-unit-ctrl__num"
                                min="0"
                                step="0.5"
                                :value="chipsGapNum"
                                @change="setChipsGapNum($event.target.value)" />
                            <div class="seg-ctrl">
                                <button
                                    v-for="u in ['px', 'rem', 'em']"
                                    :key="u"
                                    class="seg-ctrl__btn"
                                    :class="{ 'seg-ctrl__btn--active': chipsGapUnit === u }"
                                    @click="setChipsGapUnit(u)">{{ u }}</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-else class="p-hint">Выбор применяется сразу, без «Применить».</div>

                <div v-if="isCompactEmpty" class="p-warn">
                    Всё выключено — выбрать дату в виджете нечем.
                </div>
            </div>

            <!-- ── Пресеты компактного режима ─────────────────────────── -->
            <div v-if="isCompact" class="p-section">
                <div class="p-section__label">Кнопки-пресеты дат</div>

                <label class="toggle-row" :style="{ marginBottom: isPresetsOn ? '8px' : '0' }">
                    <span class="toggle-row__label">Показывать пресеты</span>
                    <div class="toggle" :class="{ 'toggle--on': isPresetsOn }" @click="toggleBool('calCompactShowPresets')">
                        <div class="toggle__thumb" />
                    </div>
                </label>

                <template v-if="isPresetsOn">
                    <div class="p-row" style="margin-bottom:10px">
                        <span class="p-row__label">Колонок в ряду</span>
                        <input
                            type="number"
                            class="time-input"
                            min="0"
                            max="6"
                            :value="props.calPresetsColumns != null ? props.calPresetsColumns : 3"
                            @change="set('calPresetsColumns', Math.max(0, parseInt($event.target.value) || 0))" />
                    </div>

                    <div class="p-section__label" style="margin-bottom:4px">Список пресетов</div>
                    <div v-if="!isRangeMode" class="p-hint" style="margin-bottom:4px">
                        «Одиночный»: показываются только пресеты на один день.
                    </div>
                    <div v-if="localPresets.length === 0" class="preset-empty">Пресетов нет</div>
                    <div v-else-if="visiblePresetsCount === 0" class="p-warn" style="margin:0 0 6px">
                        Ни один пресет не подходит к режиму — кнопок не будет.
                    </div>
                    <div class="preset-cards">
                        <div
                            v-for="(p, idx) in localPresets"
                            :key="`${p.key}-${idx}`"
                            class="preset-card"
                            :class="{ 'preset-card--editing': editingPresetIdx === idx, 'preset-card--hidden': !!presetHiddenReason(p) }"
                            :title="presetHiddenReason(p)">
                            <span class="preset-badge" :class="presetBadgeClass(p)">{{ presetTypeShort(p) }}</span>
                            <input
                                class="preset-card__input"
                                type="text"
                                :value="p.label"
                                @input="updatePreset(idx, $event.target.value)" />
                            <button class="preset-card__edit" title="Редактировать пресет" @click="startEditPreset(idx)">✎</button>
                            <button class="preset-card__del" title="Удалить пресет" @click="removePreset(idx)">✕</button>
                        </div>
                    </div>

                    <!-- inline add form -->
                    <div v-if="!addingPreset" :key="'preset-trigger'" class="preset-add-trigger">
                        <button class="preset-add-trigger-btn" @click="startAddPreset">+ Добавить пресет</button>
                        <button class="preset-action-btn" @click="resetPresetsToDefault">По умолчанию</button>
                    </div>
                    <div v-if="addingPreset" :key="'preset-form'" ref="presetForm" class="preset-add-form">
                        <div v-if="editingPresetIdx != null" class="preset-add-form__title">Редактирование пресета</div>
                        <input
                            class="preset-add-form__input"
                            type="text"
                            v-model="newPreset.label"
                            placeholder="Название кнопки" />
                        <div class="p-row" style="margin-top:6px">
                            <span class="p-row__label">Тип</span>
                            <div class="seg-ctrl">
                                <button
                                    v-for="t in presetTypes"
                                    :key="t.value"
                                    class="seg-ctrl__btn"
                                    :class="{ 'seg-ctrl__btn--active': newPreset.type === t.value }"
                                    @click="newPreset.type = t.value">{{ t.label }}</button>
                            </div>
                        </div>
                        <template v-if="newPreset.type === 'builtin'">
                            <div class="p-hint" style="margin-bottom:4px">Готовые пресеты рассчитываются относительно текущей даты.</div>
                            <select v-model="newPreset.builtinKey" class="preset-add-select">
                                <option v-for="b in builtinOptions" :key="b.key" :value="b.key">{{ b.label }}</option>
                            </select>
                        </template>
                        <template v-if="newPreset.type === 'fixed'">
                            <div class="p-hint" style="margin-bottom:4px">Фиксированный диапазон — даты не меняются.</div>
                            <!-- текстовые поля с маской ДД.ММ.ГГГГ: нативный type="date" рисуется в локали браузера -->
                            <div class="p-row">
                                <span class="p-row__label">Начало</span>
                                <input
                                    type="text"
                                    class="date-input"
                                    :class="{ 'date-input--invalid': presetDateError.start }"
                                    :value="newPreset.start"
                                    placeholder="ДД.ММ.ГГГГ"
                                    inputmode="numeric"
                                    maxlength="10"
                                    @input="onPresetDateInput('start', $event)" />
                            </div>
                            <div class="p-row">
                                <span class="p-row__label">Конец</span>
                                <input
                                    type="text"
                                    class="date-input"
                                    :class="{ 'date-input--invalid': presetDateError.end }"
                                    :value="newPreset.end"
                                    placeholder="ДД.ММ.ГГГГ"
                                    inputmode="numeric"
                                    maxlength="10"
                                    @input="onPresetDateInput('end', $event)" />
                            </div>
                            <div v-if="presetDateError.start || presetDateError.end" class="p-warn" style="margin:0 0 4px">
                                Формат ДД.ММ.ГГГГ. Конец можно не указывать.
                            </div>
                        </template>
                        <template v-if="newPreset.type === 'relative'">
                            <div class="p-hint" style="margin-bottom:4px">Диапазон «последние N дней» от сегодня.</div>
                            <div class="p-row">
                                <span class="p-row__label">Количество дней</span>
                                <input type="number" class="time-input" min="1" max="3650" v-model.number="newPreset.daysBack" />
                            </div>
                        </template>
                        <div class="preset-add-form__actions">
                            <button class="preset-action-btn preset-action-btn--primary" @click="confirmAddPreset">
                                {{ editingPresetIdx != null ? 'Сохранить' : 'Добавить' }}
                            </button>
                            <button class="preset-action-btn" @click="cancelAddPreset">Отмена</button>
                        </div>
                    </div>
                </template>
            </div>

            <!-- ── Отображение (полный режим) ──────────────────────── -->
            <div v-if="!isCompact" class="p-section">
                <div class="p-section__label">Элементы интерфейса</div>

                <label class="toggle-row">
                    <span class="toggle-row__label">Показывать шапку</span>
                    <div class="toggle" :class="{ 'toggle--on': props.calShowHeader }" @click="toggleBool('calShowHeader')">
                        <div class="toggle__thumb" />
                    </div>
                </label>
                <!-- переключатель видов и кнопки «Сегодня»/«Сброс» живут в шапке -->
                <div v-if="props.calShowHeader" class="sub-group">
                    <label v-if="hasSeveralViews" class="toggle-row">
                        <span class="toggle-row__label">Переключатель видов</span>
                        <div class="toggle" :class="{ 'toggle--on': props.calShowViewSwitcher }" @click="toggleBool('calShowViewSwitcher')">
                            <div class="toggle__thumb" />
                        </div>
                    </label>
                    <label class="toggle-row">
                        <span class="toggle-row__label">Кнопка «Сегодня»</span>
                        <div class="toggle" :class="{ 'toggle--on': props.calShowTodayBtn }" @click="toggleBool('calShowTodayBtn')">
                            <div class="toggle__thumb" />
                        </div>
                    </label>
                    <label v-if="props.calSelectionMode !== 'none'" class="toggle-row">
                        <span class="toggle-row__label">Кнопка «Сброс» выделения</span>
                        <div class="toggle" :class="{ 'toggle--on': props.calShowResetBtn !== false }" @click="toggleBool('calShowResetBtn')">
                            <div class="toggle__thumb" />
                        </div>
                    </label>
                </div>

                <label class="toggle-row">
                    <span class="toggle-row__label">Выделять «Сегодня»</span>
                    <div class="toggle" :class="{ 'toggle--on': props.calHighlightToday !== false }" @click="toggleBool('calHighlightToday')">
                        <div class="toggle__thumb" />
                    </div>
                </label>
                <!-- номера недель и скрытие выходных — только сетка месяца -->
                <template v-if="hasMonthView">
                    <label class="toggle-row">
                        <span class="toggle-row__label">Номера недель</span>
                        <div class="toggle" :class="{ 'toggle--on': props.calShowWeekNumbers }" @click="toggleBool('calShowWeekNumbers')">
                            <div class="toggle__thumb" />
                        </div>
                    </label>
                    <label class="toggle-row">
                        <span class="toggle-row__label">Показывать выходные</span>
                        <div class="toggle" :class="{ 'toggle--on': props.calShowWeekends }" @click="toggleBool('calShowWeekends')">
                            <div class="toggle__thumb" />
                        </div>
                    </label>
                </template>
                <!-- тепловая карта красит ячейки месяца и года -->
                <template v-if="hasHeatmapView">
                    <label class="toggle-row">
                        <span class="toggle-row__label">Тепловая карта</span>
                        <div class="toggle" :class="{ 'toggle--on': props.calHeatmapEnabled }" @click="toggleBool('calHeatmapEnabled')">
                            <div class="toggle__thumb" />
                        </div>
                    </label>
                    <div v-if="props.calHeatmapEnabled" class="p-hint" style="margin:0 0 6px">
                        Данные метрики — в панели <strong>Данные</strong>.
                    </div>
                </template>
            </div>

        </ui-container>
    </w-panel>
</template>

<script>
import { Panel, Managers } from 'goodt-wcore';
import { applyMask, formatByMask, parseByMask } from '../dateFormat';
import { LOCALE_DATA, pluralize } from '../constants';
import { DATES_LIST_SHAPES, datesListShape, isAutoFormat } from '../utils/date-output';

const { store } = Managers.StoreManager;

const DEFAULT_PRESETS = [
    { key: 'yesterday',  label: 'Вчера' },
    { key: 'week',       label: 'Эта неделя' },
    { key: 'last_week',  label: 'Пр. неделя' },
    { key: 'month',      label: 'Этот месяц' },
    { key: 'last_month', label: 'Пр. месяц' }
];

const SINGLE_DAY_KEYS = ['today', 'yesterday'];

// Маска дат фиксированного пресета в форме панели
const PRESET_DATE_MASK = 'DD.MM.YYYY';

// 'H:mm' / 'HH:mm' / 'HHmm' / 'H.mm' (24 ч) → 'HH:mm'; иначе null
function normalizeTime(val) {
    const m = /^(\d{1,2})[:.]?(\d{2})$/.exec(String(val || '').trim());
    if (!m) return null;
    const h = Number(m[1]);
    const mi = Number(m[2]);
    if (h > 23 || mi > 59) return null;
    return `${String(h).padStart(2, '0')}:${m[2]}`;
}

// Пресет на один день: Сегодня/Вчера, фиксированная дата без конца (или конец = начало), «1 день»
function isSingleDayPreset(p) {
    if (SINGLE_DAY_KEYS.includes(p.key)) return true;
    if (p.start != null) return !p.end || p.end === p.start;
    return Number(p.daysBack) === 1;
}

export default {
    extends: Panel,
    meta: { name: 'Настройки', icon: 'cog' },

    data: () => ({
        allViews: [
            { value: 'month', label: 'Месяц' },
            { value: 'week', label: 'Неделя' },
            { value: 'day', label: 'День' },
            { value: 'agenda', label: 'Список' },
            { value: 'year', label: 'Год' }
        ],
        localeOptions: [
            { value: 'ru', label: 'RU' },
            { value: 'en', label: 'EN' }
        ],
        selModes: [
            { value: 'none', label: 'Нет' },
            { value: 'single', label: 'Дата' },
            { value: 'range', label: 'Диапазон' },
            { value: 'multi', label: 'Несколько' }
        ],
        localPresets: [],
        addingPreset: false,
        // индекс пресета, который редактируется в форме (null — форма добавляет новый)
        editingPresetIdx: null,
        // start / end фиксированного пресета в форме — текст ДД.ММ.ГГГГ (в пресет пишется ISO)
        newPreset: { label: '', type: 'builtin', builtinKey: 'today', start: '', end: '', daysBack: 7 },
        presetDateError: { start: false, end: false },
        // время, введённое в неверном формате (значение не сохранено)
        timeError: { calDefaultStartTime: false, calDefaultEndTime: false },
        // отклонённый ввод времени — показываем его в поле (с красной рамкой), пока пользователь не исправит
        timeDraft: { calDefaultStartTime: null, calDefaultEndTime: null },
        // подсказка после смены формата: как изменится datesList у существующего виджета
        formatShapeHint: ''
    }),

    computed: {
        /** Явные варианты calOutputFormat (utils/date-output.js); 'auto' — только значение по умолчанию */
        outputFormatOptions() {
            return [
                { label: 'Авто', value: 'auto' },
                { label: 'Дата', value: 'date' },
                { label: 'Дата и время', value: 'datetime' }
            ];
        },
        // Группа «В переменную»: 'auto' (и пустое/неизвестное), 'date', 'datetime' (= 'datetime' | 'timestamp')
        outputFormatGroup() {
            const f = this.props.calOutputFormat;
            if (isAutoFormat(f)) return 'auto';
            return f === 'date' ? 'date' : 'datetime';
        },
        // Подпись под «Авто»: что определил виджет (calOutputFormatResolved = '<формат>|<источник>')
        autoFormatCaption() {
            const [format, source] = String(this.props.calOutputFormatResolved || '').split('|');
            const formats = {
                date: 'дата',
                timestamp: 'дата и время числом (мс)',
                timestamp_s: 'дата и время числом (сек)',
                datetime: 'дата и время строкой',
                iso: 'ISO-строка',
                ddmmyyyy: 'ДД.ММ.ГГГГ'
            };
            const sources = {
                variable: 'по значению переменной',
                time: 'включён выбор времени',
                default: 'по умолчанию'
            };
            if (!formats[format]) return 'Авто: формат определится по значению переменной';
            return `Авто → ${formats[format]}${sources[source] ? ` (${sources[source]})` : ''}`;
        },
        // ── Зависимости настроек: условия совпадают с v-if в шаблоне ElemCalendar.vue ──
        isCompact() {
            return this.props.calMode === 'compact';
        },
        // Действующий режим выбора (как selectionMode в ElemCalendar.vue): компактный режим знает
        // только «Одиночный» и «Диапазон» — всё, кроме 'single', там считается диапазоном
        selectionMode() {
            if (this.isCompact) return this.props.calSelectionMode === 'single' ? 'single' : 'range';
            return this.props.calSelectionMode || 'single';
        },
        isRangeMode() {
            return this.selectionMode === 'range';
        },
        // время выбирается только для одиночной даты и диапазона
        isTimeApplicable() {
            return ['single', 'range'].includes(this.selectionMode);
        },
        // формат «Дата» отбрасывает время
        isDateOnlyFormat() {
            return this.props.calOutputFormat === 'date';
        },
        // то же условие, что isTimeUiOn в ElemCalendar.vue
        isTimeOn() {
            return this.isTimeApplicable && Boolean(this.props.calWithTime) && !this.isDateOnlyFormat;
        },
        isCalendarOn() {
            return this.props.calCompactShowCalendar !== false;
        },
        isBottomOn() {
            return this.props.calCompactShowBottom !== false;
        },
        isPresetsOn() {
            return this.props.calCompactShowPresets !== false;
        },
        // «Два месяца рядом» действует только при включённом мини-календаре
        isDualMonth() {
            return this.isCalendarOn && Boolean(this.props.calCompactDualMonth);
        },
        // первый день недели — сетка мини-календаря, всплывающий календарь чипов (нижняя панель)
        // и пресеты «Эта / Пр. неделя»; без всех трёх ни на что не влияет
        isFirstDayUseful() {
            return !this.isCompact || this.isCalendarOn || this.isPresetsOn || this.isBottomOn;
        },
        isCompactEmpty() {
            return !this.isCalendarOn && !this.isPresetsOn && !this.isBottomOn;
        },
        // как availableViewsList в виджете: пустой/не задан — все виды
        effectiveViews() {
            const arr = this.props.calAvailableViews;
            return Array.isArray(arr) && arr.length ? arr : this.allViews.map((v) => v.value);
        },
        hasSeveralViews() {
            return this.effectiveViews.length > 1;
        },
        // номера недель и скрытие выходных работают только в сетке месяца
        hasMonthView() {
            return this.effectiveViews.includes('month');
        },
        // тепловая карта красит ячейки месяца и года
        hasHeatmapView() {
            return this.effectiveViews.includes('month') || this.effectiveViews.includes('year');
        },
        visiblePresetsCount() {
            return this.localPresets.filter((p) => !this.presetHiddenReason(p)).length;
        },
        storeVarNames() {
            try { return Object.keys(store.state || {}).filter(Boolean).sort(); } catch (e) { return []; }
        },
        compactSubMode() {
            const p = this.props;
            if (!p.calCompactShowCalendar && !p.calCompactShowPresets) return 'input';
            if (!p.calCompactShowCalendar && p.calCompactShowPresets !== false) return 'simplified';
            if (p.calCompactDualMonth) return 'extended';
            return 'standard';
        },
        builtinOptions() {
            return [
                { key: 'today',      label: 'Сегодня' },
                { key: 'yesterday',  label: 'Вчера' },
                { key: 'week',       label: 'Эта неделя' },
                { key: 'last_week',  label: 'Прошлая неделя' },
                { key: 'month',      label: 'Этот месяц' },
                { key: 'last_month', label: 'Прошлый месяц' },
                { key: 'quarter',      label: 'Этот квартал' },
                { key: 'last_quarter', label: 'Прошлый квартал' },
                { key: 'd7',         label: '7 дней' },
                { key: 'd30',        label: '30 дней' },
                { key: 'd90',        label: '90 дней' },
                { key: 'year',       label: 'Этот год' }
            ];
        },
        presetTypes() {
            return [
                { value: 'builtin',  label: 'Готовый' },
                { value: 'fixed',    label: 'Даты' },
                { value: 'relative', label: 'N дней' }
            ];
        },
        chipsGapNum() {
            const m = (this.props.calCompactChipsGap || '').match(/^([\d.]+)/);
            return m ? parseFloat(m[1]) : 4;
        },
        chipsGapUnit() {
            const m = (this.props.calCompactChipsGap || '').match(/(px|rem|em)$/);
            return m ? m[1] : 'px';
        }
    },

    created() {
        // Старые компактные конфиги с режимом «Нет»/«Несколько»: виджет работает с ними как с диапазоном —
        // записываем это явно, чтобы панель и переменные не расходились
        if (this.isCompact && !['single', 'range'].includes(this.props.calSelectionMode)) {
            this.set('calSelectionMode', 'range');
        }
    },

    watch: {
        'props.calPresetsJson': {
            immediate: true,
            handler(val) {
                try {
                    const parsed = val ? JSON.parse(val) : null;
                    if (Array.isArray(parsed)) { this.localPresets = parsed; return; }
                } catch (e) { /* fall through */ }
                this.localPresets = DEFAULT_PRESETS.map(p => ({ ...p }));
            }
        }
    },

    methods: {
        set(key, val) {
            this.props[key] = val;
            this.propChanged(key);
        },

        toggleBool(key) {
            this.props[key] = !this.props[key];
            this.propChanged(key);
        },

        setView(v) {
            this.set('calView', v);
        },

        // Компактный режим умеет только «Диапазон» и «Одиночный» — «Нет»/«Несколько» переводим в диапазон
        setWidgetMode(mode) {
            this.set('calMode', mode);
            if (mode === 'compact' && !['single', 'range'].includes(this.props.calSelectionMode)) {
                this.set('calSelectionMode', 'range');
            }
        },

        setCompactMode(mode) {
            const base = {
                calCompactShowBottom: true,
                calCompactDualMonth: false,
                calCompactShowCalendar: true,
                calCompactShowPresets: true,
                calCompactShowToday: true,
                calHighlightToday: true
            };
            const map = {
                standard:   { ...base },
                extended:   { ...base, calCompactDualMonth: true },
                simplified: { ...base, calCompactShowCalendar: false, calCompactShowToday: false, calHighlightToday: false },
                input:      { ...base, calCompactShowCalendar: false, calCompactShowPresets: false, calCompactShowToday: false, calHighlightToday: false }
            };
            Object.entries(map[mode]).forEach(([k, v]) => this.set(k, v));
        },

        setLocale(l) {
            this.set('calLocale', l);
        },

        isViewAvailable(v) {
            const arr = this.props.calAvailableViews;
            return Array.isArray(arr) ? arr.includes(v) : true;
        },

        isLastView(v) {
            return this.effectiveViews.length === 1 && this.effectiveViews[0] === v;
        },

        toggleView(v, checked) {
            // пустой список виджет трактует как «все виды», поэтому последний вид не выключаем
            if (!checked && this.isLastView(v)) return;
            let arr = [...this.effectiveViews];
            if (checked && !arr.includes(v)) arr.push(v);
            if (!checked) arr = arr.filter((x) => x !== v);
            // сохраняем порядок как в списке видов
            arr = this.allViews.map((x) => x.value).filter((x) => arr.includes(x));
            this.set('calAvailableViews', arr);
            // вид по умолчанию выключен — звёздочка переходит на первый доступный
            if (!arr.includes(this.props.calView)) this.set('calView', arr[0]);
        },

        // Почему пресет не будет показан (логика совпадает с compactPresetsList в ElemCalendar.vue)
        presetHiddenReason(p) {
            const simplified = !this.props.calCompactShowCalendar && this.isPresetsOn;
            if (this.props.calSelectionMode === 'single') {
                if (!isSingleDayPreset(p)) return 'Диапазон — скрыт в режиме «Одиночный»';
                if (simplified && p.key === 'today' && this.props.calCompactShowToday !== false) {
                    return 'Дублирует кнопку «Сегодня» — скрыт';
                }
                return '';
            }
            if (simplified && SINGLE_DAY_KEYS.includes(p.key)) return 'Скрыт в режиме без мини-календаря';
            return '';
        },

        _savePresets() {
            this.set('calPresetsJson', JSON.stringify(this.localPresets));
        },

        updatePreset(idx, label) {
            this.localPresets = this.localPresets.map((p, i) => i === idx ? { ...p, label } : p);
            this._savePresets();
        },

        removePreset(idx) {
            if (this.editingPresetIdx === idx) {
                this.cancelAddPreset();
            } else if (this.editingPresetIdx != null && idx < this.editingPresetIdx) {
                this.editingPresetIdx -= 1;
            }
            this.localPresets = this.localPresets.filter((_, i) => i !== idx);
            this._savePresets();
        },

        presetType(p) {
            if (p.start != null) return 'fixed';
            if (p.daysBack != null) return 'relative';
            return 'builtin';
        },

        // Открывает форму с текущими значениями пресета; «Сохранить» заменит его на месте
        startEditPreset(idx) {
            const p = this.localPresets[idx];
            if (!p) return;
            const type = this.presetType(p);
            this.newPreset = {
                label: p.label || '',
                type,
                builtinKey: type === 'builtin' ? p.key : 'today',
                start: p.start ? formatByMask(p.start, PRESET_DATE_MASK) : '',
                end: p.end ? formatByMask(p.end, PRESET_DATE_MASK) : '',
                daysBack: p.daysBack || 7
            };
            this.presetDateError = { start: false, end: false };
            this.editingPresetIdx = idx;
            this.addingPreset = true;
            this.$nextTick(() => {
                if (this.$refs.presetForm) this.$refs.presetForm.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            });
        },

        startAddPreset() {
            this.editingPresetIdx = null;
            this.newPreset = { label: '', type: 'builtin', builtinKey: 'today', start: '', end: '', daysBack: 7 };
            this.presetDateError = { start: false, end: false };
            this.addingPreset = true;
            this.$nextTick(() => {
                if (this.$refs.presetForm) this.$refs.presetForm.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            });
        },

        confirmAddPreset() {
            const type = this.newPreset.type;
            let preset;
            if (type === 'builtin') {
                const def = this.builtinOptions.find(b => b.key === this.newPreset.builtinKey);
                const label = this.newPreset.label.trim() || (def ? def.label : this.newPreset.builtinKey);
                preset = { key: this.newPreset.builtinKey, label };
            } else if (type === 'fixed') {
                // в форме — ДД.ММ.ГГГГ, в пресете хранится ISO (как раньше)
                const s = parseByMask(this.newPreset.start, PRESET_DATE_MASK);
                const e = this.newPreset.end ? parseByMask(this.newPreset.end, PRESET_DATE_MASK) : s;
                this.presetDateError = { start: !s, end: Boolean(s) && !e };
                if (!s || !e) return;
                const [start, end] = s.iso <= e.iso ? [s.iso, e.iso] : [e.iso, s.iso];
                const fmt = (iso) => formatByMask(iso, PRESET_DATE_MASK);
                const label = this.newPreset.label.trim() || (start === end ? fmt(start) : `${fmt(start)} — ${fmt(end)}`);
                preset = { key: `fixed_${Date.now()}`, label, start, end };
            } else {
                const days = Math.max(1, this.newPreset.daysBack || 7);
                // «Последний 1 день» / «Последние 2 дня» / «Последние 5 дней» — эти формы узнаёт
                // AUTO_RELATIVE_LABEL_RE, и виджет переводит подпись на язык виджета
                const label = this.newPreset.label.trim() || pluralize(days, LOCALE_DATA.ru.lastNDays);
                preset = { key: `rel_${Date.now()}`, label, daysBack: days };
            }
            const idx = this.editingPresetIdx;
            const original = idx != null ? this.localPresets[idx] : null;
            if (original) {
                // тип не менялся — сохраняем ключ (fixed_/rel_…), чтобы не сбилась подсветка активного пресета
                if (type !== 'builtin' && this.presetType(original) === type) preset.key = original.key;
                this.localPresets = this.localPresets.map((p, i) => (i === idx ? preset : p));
            } else {
                this.localPresets = [...this.localPresets, preset];
            }
            this._savePresets();
            this.addingPreset = false;
            this.editingPresetIdx = null;
        },

        cancelAddPreset() {
            this.addingPreset = false;
            this.editingPresetIdx = null;
        },

        presetBadgeClass(p) {
            if (p.start != null) return 'preset-badge--fixed';
            if (p.daysBack != null) return 'preset-badge--relative';
            return 'preset-badge--builtin';
        },

        presetTypeShort(p) {
            if (p.start != null) return 'дата';
            if (p.daysBack != null) return `-${p.daysBack}д`;
            return 'авто';
        },

        resetPresetsToDefault() {
            this.localPresets = DEFAULT_PRESETS.map(p => ({ ...p }));
            this._savePresets();
        },

        setChipsGapNum(val) {
            const num = parseFloat(val);
            if (isNaN(num) || num < 0) return;
            this.set('calCompactChipsGap', `${num}${this.chipsGapUnit}`);
        },

        // Время по умолчанию: только ЧЧ:мм (24 ч). Пусто — значение по умолчанию; неверное — не сохраняем,
        // а оставляем введённый текст в поле (timeDraft) с красной рамкой, пока пользователь его не исправит
        setTime(key, event, fallback) {
            const raw = event.target.value.trim();
            const time = raw ? normalizeTime(raw) : fallback;
            this.timeError = { ...this.timeError, [key]: !time };
            this.timeDraft = { ...this.timeDraft, [key]: time ? null : raw };
            if (!time) return;
            event.target.value = time;
            if (time !== this.props[key]) this.set(key, time);
        },

        // в поле — отклонённый ввод (если есть), иначе сохранённое значение
        timeDisplay(key) {
            const draft = this.timeDraft[key];
            return draft != null ? draft : this.props[key];
        },

        // неверный ввод или уже сохранённое (старыми версиями) неверное значение
        isTimeInvalid(key) {
            const val = this.props[key];
            return this.timeError[key] || (val != null && val !== '' && normalizeTime(val) !== val);
        },

        // Маска ДД.ММ.ГГГГ: точки подставляются сами, лишние символы отбрасываются
        onPresetDateInput(side, event) {
            const masked = applyMask(event.target.value.replace(/\D/g, '').slice(0, 8), PRESET_DATE_MASK);
            event.target.value = masked;
            this.newPreset[side] = masked;
            this.presetDateError = { ...this.presetDateError, [side]: false };
        },

        // Клик по группе «Авто | Дата | Дата и время». Повторный клик по активной группе ничего не меняет;
        // «Дата и время» по умолчанию — строкой ('datetime'), вид меняется во второй строке
        setOutputFormatGroup(group) {
            if (group === this.outputFormatGroup) return;
            this.setOutputFormat(group === 'auto' ? 'auto' : group);
        },

        // Запись calOutputFormat; для явных форматов — подсказка, если меняется форма datesList
        setOutputFormat(format) {
            const stored = this.props.calOutputFormat;
            if (format === stored) return;
            const mode = this.selectionMode;
            const withTime = Boolean(this.props.calWithTime);
            let hint = '';
            if (!isAutoFormat(format) && (mode === 'range' || mode === 'multi')) {
                const before = datesListShape(mode, stored, withTime);
                const after = datesListShape(mode, format, withTime);
                if (before !== after) {
                    if (before === DATES_LIST_SHAPES.PAIR) hint = 'datesList: значение за каждый день вместо пары [начало, конец].';
                    else if (after === DATES_LIST_SHAPES.ARRAY) hint = 'datesList: массив значений вместо JSON-строки.';
                    else hint = 'datesList: JSON-строка дат вместо массива.';
                }
            }
            this.formatShapeHint = hint;
            this.set('calOutputFormat', format);
        },

        setChipsGapUnit(unit) {
            this.set('calCompactChipsGap', `${this.chipsGapNum}${unit}`);
        }
    }
};
</script>

<style scoped>
/* ── Mode cards ───────────────────────────────────────────────── */
.mode-cards {
    display: flex;
    gap: 8px;
    margin-bottom: 4px;
}
.mode-card {
    flex: 1;
    border: 1.5px solid #e2e8f0;
    border-radius: 10px;
    padding: 10px 8px;
    text-align: center;
    cursor: pointer;
    background: #f8fafc;
    transition: border-color 0.15s, background 0.15s;
}
.mode-card--active {
    border-color: #4f6aff;
    background: #eef1ff;
}
.mode-card__icon { font-size: 20px; line-height: 1; margin-bottom: 4px; }
.mode-card__title { font-size: 11px; font-weight: 700; color: #334155; margin-bottom: 2px; }
.mode-card__desc { font-size: 10px; color: #94a3b8; line-height: 1.4; }

/* ── Compact sub-modes ────────────────────────────────────────── */
.compact-modes {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
}
.compact-mode {
    border: 1.5px solid #e2e8f0;
    border-radius: 8px;
    padding: 8px;
    text-align: center;
    font-size: 11px;
    font-weight: 600;
    color: #475569;
    line-height: 1.4;
    cursor: pointer;
    background: #f8fafc;
    transition: border-color 0.15s, background 0.15s, color 0.15s;
}
.compact-mode:hover { border-color: #a5b4fc; background: #f5f7ff; }
.compact-mode--active { border-color: #4f6aff; background: #eef1ff; color: #3d55e8; }
.compact-mode__sub { display: block; font-size: 10px; font-weight: 500; opacity: 0.75; }

/* ── Sections ─────────────────────────────────────────────────── */
.p-section {
    margin-bottom: 6px;
    padding-bottom: 6px;
    border-bottom: 1px solid #f1f5f9;
}
.p-section:last-child { border-bottom: none; margin-bottom: 0; }

.p-section--inline-row {
    padding-bottom: 2px;
    margin-bottom: 2px;
}

.p-section__label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #94a3b8;
    margin-bottom: 4px;
}

/* ── Row ──────────────────────────────────────────────────────── */
.p-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 4px;
}
.p-row--col { flex-direction: column; align-items: flex-start; }
.p-row__label { font-size: 12px; font-weight: 500; color: #334155; }

/* ── Segmented control ────────────────────────────────────────── */
.seg-ctrl {
    display: flex;
    background: #f1f5f9;
    border-radius: 7px;
    padding: 2px;
    gap: 1px;
}
.seg-ctrl--wrap {
    flex-wrap: wrap;
    width: 100%;
}
.seg-ctrl__btn {
    padding: 4px 10px;
    border: none;
    border-radius: 5px;
    background: transparent;
    color: #64748b;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.12s, color 0.12s;
    white-space: nowrap;
}
.seg-ctrl__btn:hover { color: #334155; }
.seg-ctrl--tight .seg-ctrl__btn { padding: 4px 7px; }
.p-row__label--nowrap { white-space: nowrap; }
.seg-ctrl__btn--active {
    background: #fff;
    color: #4f6aff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* ── View list ────────────────────────────────────────────────── */
.view-list { display: flex; flex-direction: column; gap: 2px; }
.view-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 0;
}
.view-row__toggle {
    width: 28px;
    height: 16px;
    border-radius: 8px;
    background: #e2e8f0;
    position: relative;
    flex-shrink: 0;
    cursor: pointer;
    transition: background 0.18s;
}
.view-row__toggle--on { background: #4f6aff; }
.view-row__toggle--locked { opacity: 0.55; cursor: not-allowed; }
.view-row__toggle-thumb {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 1px 3px rgba(0,0,0,0.18);
    transition: transform 0.18s;
}
.view-row__toggle--on .view-row__toggle-thumb { transform: translateX(12px); }
.view-row__label {
    flex: 1;
    font-size: 12px;
    font-weight: 500;
    color: #334155;
    transition: color 0.12s;
}
.view-row__label--off { color: #cbd5e1; }
.view-row__star {
    border: none;
    background: transparent;
    font-size: 16px;
    line-height: 1;
    color: #cbd5e1;
    cursor: pointer;
    padding: 0 2px;
    flex-shrink: 0;
    transition: color 0.12s, transform 0.1s;
}
.view-row__star:not(:disabled):hover { color: #f59e0b; transform: scale(1.2); }
.view-row__star--active { color: #f59e0b; }
.view-row__star:disabled { opacity: 0.2; cursor: not-allowed; }

/* ── Toggle ───────────────────────────────────────────────────── */
.toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 5px 0;
    cursor: pointer;
    gap: 8px;
}
.toggle-row__label { font-size: 12px; color: #334155; font-weight: 500; flex: 1; }

/* Зависимые настройки — с отступом под «родительским» переключателем */
.sub-group {
    margin: 0 0 2px 6px;
    padding-left: 10px;
    border-left: 2px solid #eef1ff;
}

/* Предупреждение о конфликте настроек */
.p-warn {
    font-size: 10px;
    line-height: 1.5;
    color: #b45309;
    background: #fffbeb;
    border: 1px solid #fde68a;
    border-radius: 6px;
    padding: 4px 8px;
    margin-top: 6px;
}

.toggle {
    width: 36px;
    height: 20px;
    border-radius: 10px;
    background: #e2e8f0;
    position: relative;
    flex-shrink: 0;
    transition: background 0.18s;
    cursor: pointer;
}
.toggle--on { background: #4f6aff; }
.toggle__thumb {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.18);
    transition: transform 0.18s;
}
.toggle--on .toggle__thumb { transform: translateX(16px); }

/* ── Textarea ─────────────────────────────────────────────────── */
.p-textarea {
    width: 100%;
    font-family: 'Consolas', 'Monaco', monospace;
    font-size: 11px;
    line-height: 1.55;
    padding: 8px 10px;
    background: #f8fafc;
    color: #1e293b;
    border: 1.5px solid #e2e8f0;
    border-radius: 8px;
    resize: vertical;
    box-sizing: border-box;
    outline: none;
    transition: border-color 0.15s;
}
.p-textarea:focus { border-color: #4f6aff; background: #fff; }

/* ── Hint ─────────────────────────────────────────────────────── */
.p-hint {
    font-size: 10px;
    color: #94a3b8;
    line-height: 1.5;
}
.p-hint code {
    font-family: monospace;
    background: #f1f5f9;
    padding: 1px 4px;
    border-radius: 3px;
    font-size: 10px;
    color: #4f6aff;
}
.p-field-label {
    font-size: 11px;
    font-weight: 600;
    color: #64748b;
    margin-bottom: 6px;
}

/* ── Preset management ────────────────────────────────────────── */
.preset-empty {
    font-size: 11px;
    color: #94a3b8;
    padding: 4px 0;
    font-style: italic;
}
.preset-cards {
    display: flex;
    flex-direction: column;
    gap: 3px;
    margin-bottom: 6px;
}
.preset-card {
    display: flex;
    align-items: center;
    gap: 4px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 4px 6px;
}
.preset-badge {
    font-size: 9px;
    font-weight: 700;
    padding: 1px 5px;
    border-radius: 4px;
    white-space: nowrap;
    flex-shrink: 0;
    line-height: 1.5;
}
.preset-badge--builtin  { background: #eef1ff; color: #4f6aff; }
.preset-badge--fixed    { background: #f0fdf4; color: #16a34a; }
.preset-badge--relative { background: #fff7ed; color: #ea580c; }
.preset-card__input {
    flex: 1;
    font-size: 11px;
    border: none;
    background: transparent;
    color: #334155;
    outline: none;
    min-width: 0;
    padding: 0;
}
.preset-card__input:focus { color: #1e293b; }
.preset-card__del {
    border: none;
    background: transparent;
    color: #94a3b8;
    cursor: pointer;
    font-size: 11px;
    padding: 0 2px;
    flex-shrink: 0;
    line-height: 1;
    transition: color 0.12s;
}
.preset-card__del:hover { color: #ef4444; }
.preset-card--editing { border-color: #4f6aff; background: #f5f7ff; }
/* пресет не показывается в текущем режиме (см. presetHiddenReason) */
.preset-card--hidden { border-style: dashed; }
.preset-card--hidden .preset-badge,
.preset-card--hidden .preset-card__input { opacity: 0.45; text-decoration: line-through; }
.preset-card__edit {
    border: none;
    background: transparent;
    color: #94a3b8;
    cursor: pointer;
    font-size: 12px;
    padding: 0 2px;
    flex-shrink: 0;
    line-height: 1;
    transition: color 0.12s;
}
.preset-card__edit:hover,
.preset-card--editing .preset-card__edit { color: #4f6aff; }
.preset-add-form__title {
    font-size: 11px;
    font-weight: 600;
    color: #4f6aff;
    margin-bottom: 6px;
}

.preset-add-trigger {
    display: flex;
    gap: 6px;
    margin-top: 2px;
}
.preset-add-trigger-btn {
    flex: 1;
    font-size: 11px;
    font-weight: 600;
    border: 1.5px dashed #cbd5e1;
    border-radius: 6px;
    background: transparent;
    color: #4f6aff;
    padding: 5px 0;
    cursor: pointer;
    transition: border-color 0.12s, background 0.12s;
}
.preset-add-trigger-btn:hover { border-color: #4f6aff; background: #f5f7ff; }

.preset-add-form {
    background: #f8fafc;
    border: 1.5px solid #e2e8f0;
    border-radius: 8px;
    padding: 8px;
    margin-top: 4px;
}
.preset-add-form__input {
    width: 100%;
    font-size: 12px;
    border: 1.5px solid #e2e8f0;
    border-radius: 6px;
    padding: 5px 8px;
    background: #fff;
    color: #334155;
    outline: none;
    box-sizing: border-box;
    transition: border-color 0.12s;
}
.preset-add-form__input:focus { border-color: #4f6aff; }
.preset-add-form__input::placeholder { color: #94a3b8; }
.preset-add-form__actions {
    display: flex;
    gap: 6px;
    margin-top: 8px;
}
.preset-add-select {
    width: 100%;
    font-size: 11px;
    border: 1.5px solid #e2e8f0;
    border-radius: 6px;
    padding: 5px 8px;
    background: #fff;
    color: #334155;
    outline: none;
    box-sizing: border-box;
    cursor: pointer;
}
.date-input {
    font-size: 11px;
    border: 1.5px solid #e2e8f0;
    border-radius: 6px;
    padding: 4px 8px;
    background: #fff;
    color: #334155;
    outline: none;
    transition: border-color 0.12s;
}
.date-input:focus { border-color: #4f6aff; }

.preset-action-btn {
    flex: 1;
    font-size: 11px;
    font-weight: 600;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    background: #fff;
    color: #64748b;
    padding: 5px 0;
    cursor: pointer;
    transition: background 0.12s;
}
.preset-action-btn:hover { background: #f1f5f9; }
.preset-action-btn--primary {
    background: #4f6aff;
    border-color: #4f6aff;
    color: #fff;
}
.preset-action-btn--primary:hover { background: #3b55e6; }

/* ── Number + unit control ────────────────────────────────────── */
.num-unit-ctrl {
    display: flex;
    align-items: center;
    gap: 4px;
}
.num-unit-ctrl__num {
    width: 52px;
}

/* ── Time input ───────────────────────────────────────────────── */
.time-input {
    width: 72px;
    font-size: 12px;
    font-weight: 600;
    color: #334155;
    border: 1.5px solid #e2e8f0;
    border-radius: 6px;
    padding: 4px 8px;
    background: #fff;
    outline: none;
    text-align: center;
    transition: border-color 0.12s;
}
.time-input:focus { border-color: #4f6aff; }
.time-input--invalid,
.time-input--invalid:focus,
.date-input--invalid,
.date-input--invalid:focus { border-color: #ef4444; background: #fef2f2; color: #b91c1c; }

/* ── Var select ───────────────────────────────────────────────── */
.p-var-select {
    width: 100%;
    font-size: 12px;
    color: #334155;
    border: 1.5px solid #e2e8f0;
    border-radius: 7px;
    padding: 5px 8px;
    background: #fff;
    outline: none;
    box-sizing: border-box;
    transition: border-color 0.12s;
    cursor: pointer;
}
.p-var-select:focus { border-color: #4f6aff; }
</style>
