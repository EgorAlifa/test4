<template>
    <w-panel>
        <ui-container>

            <!-- ── Info ─────────────────────────────────────────────────── -->
            <div class="info-box">
                <i class="mdi mdi-information-outline info-box__icon" />
                <div class="info-box__text">
                    Редирект после выхода управляется через
                    <strong>ElemAuthContainer</strong>.
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
                        min="30"
                        step="30"
                        :value="props.timeoutSeconds"
                        @change="onTimeoutChange" />
                    <span class="num-unit">сек</span>
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
                            min="5"
                            step="5"
                            :value="props.warningDuration"
                            @change="onWarningDurationChange" />
                        <span class="num-unit">сек</span>
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
                        −{{ props.warningDuration }}с
                    </span>
                    <span>{{ timelineLabel }}</span>
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

export default {
    extends: Panel,
    meta: { name: 'Настройки виджета', icon: 'timer-off' },
    computed: {
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
.num-input {
    width: 60px;
    padding: 4px 7px;
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
.num-unit { font-size: 11px; color: #94a3b8; min-width: 22px; }

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
.timeline {
    margin: 6px 0 4px;
}
.timeline__track {
    display: flex;
    height: 6px;
    border-radius: 3px;
    overflow: hidden;
    background: #e2e8f0;
}
.timeline__idle {
    background: #cbd5e1;
    transition: flex 0.3s;
}
.timeline__warn {
    background: #fbbf24;
    transition: flex 0.3s;
}
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
