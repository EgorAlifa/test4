<template>
    <w-panel>
        <ui-container>

            <!-- ── Info ─────────────────────────────────────────────────── -->
            <div class="info-box">
                <i class="mdi mdi-information-outline info-box__icon" />
                <div class="info-box__text">
                    Редирект после выхода управляется через виджет «Авторизационный контейнер».
                </div>
            </div>

            <!-- ── Таймаут ──────────────────────────────────────────────── -->
            <div class="section-label">Время бездействия</div>
            <div class="field-row">
                <span class="field-row__label">Таймаут до выхода</span>
                <div class="field-row__input-group">
                    <input
                        class="num-input"
                        type="number"
                        min="0"
                        step="any"
                        :value="timeoutDisplayValue"
                        @change="onTimeoutChange" />
                    <div class="unit-switcher">
                        <button
                            v-for="u in units"
                            :key="u.value"
                            class="unit-btn"
                            :class="{ 'unit-btn--active': timeoutUnit === u.value }"
                            @click="setTimeoutUnit(u.value)">{{ u.label }}</button>
                    </div>
                </div>
            </div>

            <!-- ── Предупреждение ───────────────────────────────────────── -->
            <div class="section-label">Предупреждение</div>
            <div class="field-row field-row--toggle" @click="toggleWarning">
                <span class="field-row__label">Показывать предупреждение</span>
                <div class="toggle-pill" :class="{ 'toggle-pill--on': props.warningEnabled }">
                    <div class="toggle-pill__thumb" />
                </div>
            </div>

            <transition name="collapse">
                <div v-if="props.warningEnabled" class="field-row field-row--nested">
                    <span class="field-row__label">Длительность</span>
                    <div class="field-row__input-group">
                        <input
                            class="num-input"
                            type="number"
                            min="0"
                            step="any"
                            :value="warningDisplayValue"
                            @change="onWarningDurationChange" />
                        <div class="unit-switcher">
                            <button
                                v-for="u in units"
                                :key="u.value"
                                class="unit-btn"
                                :class="{ 'unit-btn--active': warningUnit === u.value }"
                                @click.stop="setWarningUnit(u.value)">{{ u.label }}</button>
                        </div>
                    </div>
                </div>
            </transition>

            <!-- ── Timeline ─────────────────────────────────────────────── -->
            <div class="timeline">
                <div class="timeline__track">
                    <div class="timeline__idle" :style="{ flex: idleRatio }" />
                    <div v-if="props.warningEnabled" class="timeline__warn" :style="{ flex: warnRatio }" />
                </div>
                <div class="timeline__labels">
                    <span>0</span>
                    <span v-if="props.warningEnabled" class="timeline__warn-label">
                        −{{ formatDuration(props.warningDuration) }}
                    </span>
                    <span>{{ formatDuration(props.timeoutSeconds) }}</span>
                </div>
            </div>

            <!-- ── Тексты ───────────────────────────────────────────────── -->
            <div class="section-label">Тексты интерфейса</div>
            <ui-has-panel>
                <div class="texts-row">
                    <i class="mdi mdi-translate texts-row__icon" />
                    <span>{{ getPropLabel('labels') }}</span>
                    <i class="mdi mdi-chevron-right texts-row__arrow" />
                </div>
                <template #panel>
                    <ui-panel :groups="[{ name: getPropLabel('labels'), slot: 'default' }]">
                        <template>
                            <ui-container>
                                <ui-input prop="labels.warningTitle"></ui-input>
                                <ui-input prop="labels.warningMessage"></ui-input>
                                <ui-input prop="labels.stayLoggedIn"></ui-input>
                                <ui-input prop="labels.seconds"></ui-input>
                            </ui-container>
                        </template>
                    </ui-panel>
                </template>
            </ui-has-panel>

        </ui-container>
    </w-panel>
</template>

<script>
import { Panel } from '@goodt-wcore/panel';

const UNITS = [
    { value: 's', label: 'сек' },
    { value: 'm', label: 'мин' },
    { value: 'h', label: 'час' },
];

export default {
    extends: Panel,
    meta: { name: 'Настройки виджета', icon: 'timer-off' },
    data() {
        return {
            timeoutUnit: 's',
            warningUnit: 's',
            units: UNITS,
        };
    },
    mounted() {
        this.timeoutUnit = this.bestUnit(this.props.timeoutSeconds || 1800);
        this.warningUnit = this.bestUnit(this.props.warningDuration || 30);
    },
    computed: {
        timeoutDisplayValue() {
            return this.toUnit(this.props.timeoutSeconds || 1800, this.timeoutUnit);
        },
        warningDisplayValue() {
            return this.toUnit(this.props.warningDuration || 30, this.warningUnit);
        },
        idleRatio() {
            const t = this.props.timeoutSeconds || 1800;
            const w = this.props.warningEnabled
                ? Math.min(this.props.warningDuration || 30, t)
                : 0;
            return Math.max(0, t - w);
        },
        warnRatio() {
            const t = this.props.timeoutSeconds || 1800;
            return Math.min(this.props.warningDuration || 30, t);
        },
    },
    methods: {
        bestUnit(seconds) {
            if (seconds >= 3600) return 'h';
            if (seconds >= 60) return 'm';
            return 's';
        },
        toUnit(seconds, unit) {
            if (unit === 'm') return Math.round((seconds / 60) * 100) / 100;
            if (unit === 'h') return Math.round((seconds / 3600) * 100) / 100;
            return seconds;
        },
        toSeconds(value, unit) {
            if (unit === 'm') return Math.round(value * 60);
            if (unit === 'h') return Math.round(value * 3600);
            return Math.round(value);
        },
        formatDuration(seconds) {
            if (!seconds) return '0с';
            if (seconds < 60) return `${seconds}с`;
            const m = Math.floor(seconds / 60);
            const rem = seconds % 60;
            if (seconds < 3600) return rem ? `${m}м ${rem}с` : `${m}м`;
            const h = Math.floor(seconds / 3600);
            const remM = Math.floor((seconds % 3600) / 60);
            return remM ? `${h}ч ${remM}м` : `${h}ч`;
        },
        setTimeoutUnit(unit) {
            const secs = this.props.timeoutSeconds || 1800;
            this.timeoutUnit = this.toUnit(secs, unit) < 0.01 ? this.bestUnit(secs) : unit;
        },
        setWarningUnit(unit) {
            const secs = this.props.warningDuration || 30;
            this.warningUnit = this.toUnit(secs, unit) < 0.01 ? this.bestUnit(secs) : unit;
        },
        getPropLabel(path) {
            const prop = path.split('.')[0];
            return this.descriptor.props[prop]?.label[path] ?? '';
        },
        onTimeoutChange(e) {
            const raw = parseFloat(e.target.value) || 0;
            const secs = Math.max(1, this.toSeconds(raw, this.timeoutUnit));
            this.timeoutUnit = this.bestUnit(secs);
            this.props.timeoutSeconds = secs;
            this.propChanged('timeoutSeconds');
        },
        onWarningDurationChange(e) {
            const raw = parseFloat(e.target.value) || 0;
            const secs = Math.max(1, this.toSeconds(raw, this.warningUnit));
            this.warningUnit = this.bestUnit(secs);
            this.props.warningDuration = secs;
            this.propChanged('warningDuration');
        },
        toggleWarning() {
            this.props.warningEnabled = !this.props.warningEnabled;
            this.propChanged('warningEnabled');
        },
    },
};
</script>

<style scoped>
/* ── Section label ────────────────────────────────────────────────── */
.section-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #94a3b8;
    margin-top: 8px;
    margin-bottom: 2px;
}

/* ── Info box ─────────────────────────────────────────────────────── */
.info-box {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 11px;
    background: #f0f9ff;
    border: 1px solid #bae6fd;
    border-radius: 8px;
    margin-bottom: 2px;
}
.info-box__icon { font-size: 16px; color: #0284c7; flex-shrink: 0; }
.info-box__text { font-size: 12px; color: #0c4a6e; line-height: 1.45; }

/* ── Field row ────────────────────────────────────────────────────── */
.field-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 0;
    border-bottom: 1px solid #f1f5f9;
}
.field-row--toggle { cursor: pointer; user-select: none; }
.field-row--toggle:hover .field-row__label { color: #1e293b; }
.field-row--nested {
    padding-left: 12px;
    border-left: 2px solid #e2e8f0;
    margin-left: 2px;
    border-bottom: none;
}
.field-row__label {
    flex: 1;
    font-size: 13px;
    color: #334155;
    font-weight: 500;
}
.field-row__input-group {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
}

/* ── Number input ─────────────────────────────────────────────────── */
.num-input {
    width: 52px;
    padding: 4px 6px;
    border: 1.5px solid #e2e8f0;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    color: #1e293b;
    background: #fff;
    text-align: right;
    outline: none;
    transition: border-color 0.15s;
}
.num-input:focus { border-color: #4f6aff; }

/* ── Unit switcher ────────────────────────────────────────────────── */
.unit-switcher {
    display: flex;
    border: 1.5px solid #e2e8f0;
    border-radius: 6px;
    overflow: hidden;
}
.unit-btn {
    padding: 4px 6px;
    font-size: 11px;
    font-weight: 500;
    color: #94a3b8;
    background: #fff;
    border: none;
    border-left: 1px solid #e2e8f0;
    cursor: pointer;
    transition: background 0.12s, color 0.12s;
    line-height: 1;
}
.unit-btn:first-child { border-left: none; }
.unit-btn:hover { background: #f8fafc; color: #475569; }
.unit-btn--active { background: #4f6aff; color: #fff; }
.unit-btn--active:hover { background: #4060ee; }

/* ── Toggle pill ──────────────────────────────────────────────────── */
.toggle-pill {
    flex-shrink: 0;
    width: 34px;
    height: 18px;
    background: #cbd5e1;
    border-radius: 999px;
    position: relative;
    transition: background 0.2s;
}
.toggle-pill--on { background: #4f6aff; }
.toggle-pill__thumb {
    position: absolute;
    top: 2px; left: 2px;
    width: 14px; height: 14px;
    background: #fff;
    border-radius: 50%;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    transition: transform 0.2s;
}
.toggle-pill--on .toggle-pill__thumb { transform: translateX(16px); }

/* ── Collapse transition ──────────────────────────────────────────── */
.collapse-enter-active, .collapse-leave-active {
    transition: max-height 0.18s ease, opacity 0.18s ease;
    overflow: hidden;
    max-height: 60px;
}
.collapse-enter, .collapse-leave-to { max-height: 0; opacity: 0; }

/* ── Timeline ─────────────────────────────────────────────────────── */
.timeline { margin: 6px 0 4px; }
.timeline__track {
    display: flex;
    height: 6px;
    border-radius: 3px;
    overflow: hidden;
    background: #e2e8f0;
}
.timeline__idle { background: #cbd5e1; transition: flex 0.3s; }
.timeline__warn { background: #fbbf24; transition: flex 0.3s; }
.timeline__labels {
    display: flex;
    justify-content: space-between;
    font-size: 10px;
    color: #94a3b8;
    margin-top: 3px;
}
.timeline__warn-label { color: #d97706; font-weight: 600; }

/* ── Texts row ────────────────────────────────────────────────────── */
.texts-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 0;
    cursor: pointer;
}
.texts-row:hover span { color: #1e293b; }
.texts-row span { flex: 1; font-size: 13px; color: #334155; font-weight: 500; }
.texts-row__icon { font-size: 16px; color: #64748b; flex-shrink: 0; }
.texts-row__arrow { font-size: 16px; color: #94a3b8; flex-shrink: 0; }
</style>
