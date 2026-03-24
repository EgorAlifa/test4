<template>
    <w-panel>
        <ui-container>

            <!-- ── Info ─────────────────────────────────────────────────── -->
            <div class="info-box">
                <i class="mdi mdi-timer-off-outline info-box__icon" />
                <div class="info-box__text">
                    Завершает сессию при бездействии. Для редиректа на страницу входа добавьте
                    <strong>ElemAuthContainer</strong> на страницу.
                </div>
            </div>

            <!-- ── Таймаут ──────────────────────────────────────────────── -->
            <div class="section-label">Время бездействия</div>
            <div class="timing-card">
                <i class="mdi mdi-clock-outline timing-card__icon" />
                <div class="timing-card__body">
                    <div class="timing-card__label">До автоматического выхода</div>
                    <div class="timing-card__sub">Таймер сбрасывается при любой активности</div>
                </div>
                <div class="timing-input-group">
                    <input
                        class="timing-input"
                        type="number"
                        min="30"
                        step="30"
                        :value="props.timeoutSeconds"
                        @change="onTimeoutChange" />
                    <span class="timing-unit">сек</span>
                </div>
            </div>

            <!-- ── Предупреждение ───────────────────────────────────────── -->
            <div class="section-label">Предупреждение</div>
            <div
                class="toggle-card"
                :class="{ 'toggle-card--on': props.warningEnabled }"
                role="switch"
                :aria-checked="props.warningEnabled"
                @click="toggleWarning">
                <div class="toggle-card__body">
                    <i class="mdi mdi-alert-circle-outline toggle-card__icon"
                       :class="{ 'toggle-card__icon--on': props.warningEnabled }" />
                    <div>
                        <div class="toggle-card__label">Показывать предупреждение</div>
                        <div class="toggle-card__sub">Окно с обратным отсчётом перед выходом</div>
                    </div>
                </div>
                <div class="toggle-pill" :class="{ 'toggle-pill--on': props.warningEnabled }">
                    <div class="toggle-pill__thumb" />
                </div>
            </div>

            <transition name="slide-down">
                <div v-if="props.warningEnabled" class="timing-card timing-card--nested">
                    <i class="mdi mdi-timer-sand timing-card__icon" />
                    <div class="timing-card__body">
                        <div class="timing-card__label">Длительность предупреждения</div>
                        <div class="timing-card__sub">Секунд до выхода после появления окна</div>
                    </div>
                    <div class="timing-input-group">
                        <input
                            class="timing-input"
                            type="number"
                            min="5"
                            step="5"
                            :value="props.warningDuration"
                            @change="onWarningDurationChange" />
                        <span class="timing-unit">сек</span>
                    </div>
                </div>
            </transition>

            <!-- ── Timeline ─────────────────────────────────────────────── -->
            <div class="timeline">
                <div class="timeline__track">
                    <div class="timeline__seg timeline__seg--idle" :style="{ flex: idleRatio }">
                        <span class="timeline__seg-label">Бездействие</span>
                    </div>
                    <div v-if="props.warningEnabled && warnRatio > 0"
                         class="timeline__seg timeline__seg--warn"
                         :style="{ flex: warnRatio }">
                        <span class="timeline__seg-label">⚠</span>
                    </div>
                    <div class="timeline__seg timeline__seg--logout" style="flex: 0 0 6px">
                        <span class="timeline__seg-label">🚪</span>
                    </div>
                </div>
                <div class="timeline__axis">
                    <span>0</span>
                    <span>{{ timelineLabel }}</span>
                </div>
            </div>

            <!-- ── Тексты ───────────────────────────────────────────────── -->
            <div class="section-label">Тексты интерфейса</div>
            <ui-has-panel>
                <div class="texts-trigger">
                    <i class="mdi mdi-translate texts-trigger__icon" />
                    <span class="texts-trigger__label">{{ getPropLabel('labels') }}</span>
                    <i class="mdi mdi-chevron-right texts-trigger__arrow" />
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

export default {
    extends: Panel,
    meta: { name: 'Настройки виджета', icon: 'timer-off' },
    computed: {
        idleRatio() {
            const t = this.props.timeoutSeconds || 1800;
            const w = this.props.warningEnabled
                ? Math.min(this.props.warningDuration || 30, t)
                : 0;
            return (t - w) / t;
        },
        warnRatio() {
            const t = this.props.timeoutSeconds || 1800;
            const w = Math.min(this.props.warningDuration || 30, t);
            return w / t;
        },
        timelineLabel() {
            const s = this.props.timeoutSeconds || 1800;
            if (s < 60) return `${s}с`;
            const m = Math.floor(s / 60);
            const rem = s % 60;
            return rem ? `${m}м ${rem}с` : `${m}м`;
        }
    },
    methods: {
        getPropLabel(path) {
            const prop = path.split('.')[0];
            return this.descriptor.props[prop]?.label[path] ?? '';
        },
        onTimeoutChange(e) {
            const val = Math.max(30, parseInt(e.target.value, 10) || 1800);
            this.props.timeoutSeconds = val;
            this.propChanged('timeoutSeconds');
        },
        onWarningDurationChange(e) {
            const val = Math.max(5, parseInt(e.target.value, 10) || 30);
            this.props.warningDuration = val;
            this.propChanged('warningDuration');
        },
        toggleWarning() {
            this.props.warningEnabled = !this.props.warningEnabled;
            this.propChanged('warningEnabled');
        }
    }
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
    margin-top: 6px;
    margin-bottom: 4px;
}

/* ── Info box ─────────────────────────────────────────────────────── */
.info-box {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 10px 13px;
    background: #f0f9ff;
    border: 1px solid #bae6fd;
    border-radius: 10px;
    margin-bottom: 4px;
}
.info-box__icon {
    font-size: 20px;
    color: #0284c7;
    flex-shrink: 0;
    margin-top: 1px;
}
.info-box__text {
    font-size: 12px;
    color: #0c4a6e;
    line-height: 1.5;
}

/* ── Timing card ──────────────────────────────────────────────────── */
.timing-card {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 13px;
    background: #f8fafc;
    border: 1.5px solid #e2e8f0;
    border-radius: 10px;
    margin-bottom: 4px;
}
.timing-card--nested {
    margin-left: 12px;
    border-style: dashed;
    border-color: #cbd5e1;
    background: #f8fafc;
}
.timing-card__icon {
    font-size: 20px;
    color: #64748b;
    flex-shrink: 0;
}
.timing-card__body {
    flex: 1;
    min-width: 0;
}
.timing-card__label {
    font-size: 13px;
    font-weight: 600;
    color: #1e293b;
    line-height: 1.3;
}
.timing-card__sub {
    font-size: 11px;
    color: #94a3b8;
    margin-top: 1px;
}
.timing-input-group {
    display: flex;
    align-items: center;
    gap: 5px;
    flex-shrink: 0;
}
.timing-input {
    width: 64px;
    padding: 5px 8px;
    border: 1.5px solid #e2e8f0;
    border-radius: 7px;
    font-size: 13px;
    font-weight: 600;
    color: #1e293b;
    background: #fff;
    text-align: right;
    outline: none;
    transition: border-color 0.15s;
}
.timing-input:focus { border-color: #4f6aff; }
.timing-unit {
    font-size: 11px;
    color: #94a3b8;
    font-weight: 500;
}

/* ── Toggle card ──────────────────────────────────────────────────── */
.toggle-card {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 13px;
    background: #f8fafc;
    border: 1.5px solid #e2e8f0;
    border-radius: 10px;
    cursor: pointer;
    user-select: none;
    margin-bottom: 4px;
    transition: border-color 0.15s, background 0.15s;
}
.toggle-card:hover { border-color: #a5b4fc; background: #f5f7ff; }
.toggle-card--on { border-color: #4f6aff; background: #eff2ff; }
.toggle-card__body {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
}
.toggle-card__icon {
    font-size: 20px;
    color: #94a3b8;
    flex-shrink: 0;
    transition: color 0.15s;
}
.toggle-card__icon--on { color: #f59e0b; }
.toggle-card__label {
    font-size: 13px;
    font-weight: 600;
    color: #1e293b;
    line-height: 1.3;
}
.toggle-card__sub {
    font-size: 11px;
    color: #94a3b8;
    margin-top: 1px;
}

/* ── Toggle pill ──────────────────────────────────────────────────── */
.toggle-pill {
    flex-shrink: 0;
    width: 36px;
    height: 20px;
    background: #cbd5e1;
    border-radius: 999px;
    position: relative;
    transition: background 0.2s;
}
.toggle-pill--on { background: #4f6aff; }
.toggle-pill__thumb {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 14px;
    height: 14px;
    background: #fff;
    border-radius: 50%;
    box-shadow: 0 1px 4px rgba(0,0,0,0.18);
    transition: transform 0.2s;
}
.toggle-pill--on .toggle-pill__thumb { transform: translateX(16px); }

/* ── Slide-down transition ────────────────────────────────────────── */
.slide-down-enter-active, .slide-down-leave-active {
    transition: max-height 0.2s ease, opacity 0.2s ease;
    overflow: hidden;
    max-height: 120px;
}
.slide-down-enter, .slide-down-leave-to { max-height: 0; opacity: 0; }

/* ── Timeline ─────────────────────────────────────────────────────── */
.timeline {
    margin: 4px 0 8px;
}
.timeline__track {
    display: flex;
    border-radius: 6px;
    overflow: hidden;
    height: 22px;
}
.timeline__seg {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 0;
    overflow: hidden;
    transition: flex 0.3s;
}
.timeline__seg--idle  { background: #e2e8f0; }
.timeline__seg--warn  { background: #fef3c7; }
.timeline__seg--logout { background: #fee2e2; }
.timeline__seg-label {
    font-size: 10px;
    font-weight: 600;
    color: #64748b;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 0 5px;
}
.timeline__seg--warn .timeline__seg-label  { color: #92400e; }
.timeline__seg--logout .timeline__seg-label { color: #991b1b; }
.timeline__axis {
    display: flex;
    justify-content: space-between;
    font-size: 10px;
    color: #94a3b8;
    margin-top: 3px;
    padding: 0 2px;
}

/* ── Texts trigger ────────────────────────────────────────────────── */
.texts-trigger {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 9px 13px;
    background: #f8fafc;
    border: 1.5px solid #e2e8f0;
    border-radius: 10px;
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s;
}
.texts-trigger:hover { border-color: #a5b4fc; background: #f5f7ff; }
.texts-trigger__icon { font-size: 18px; color: #64748b; flex-shrink: 0; }
.texts-trigger__label { flex: 1; font-size: 13px; font-weight: 600; color: #1e293b; }
.texts-trigger__arrow { font-size: 18px; color: #94a3b8; flex-shrink: 0; }
</style>
