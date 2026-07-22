<template>
    <ui-panel-container>
        <ui-container>

            <!-- ── Режим работы ─────────────────────────────────────────── -->
            <div class="sp-section-label">Режим работы</div>
            <div class="mode-grid">
                <div
                    v-for="m in modeOptions"
                    :key="m.value"
                    class="mode-card"
                    :class="{ 'mode-card--active': currentMode === m.value }"
                    @click="setMode(m.value)">
                    <i class="mdi mode-card__icon" :class="m.icon" />
                    <div class="mode-card__label">{{ m.label }}</div>
                    <div class="mode-card__desc">{{ m.desc }}</div>
                </div>
            </div>

            <!-- ══════════════════ GALLERY mode ══════════════════════════ -->
            <template v-if="isGalleryMode">

                <!-- Сетка -->
                <div class="sp-section-label sp-section-label--mt">Сетка</div>
                <div class="grid-presets">
                    <button
                        v-for="p in gridPresets"
                        :key="p.label"
                        class="grid-preset-btn"
                        :class="{ 'grid-preset-btn--active': props.grid.cols === p.cols }"
                        @click="setGrid(p)">
                        {{ p.label }}
                    </button>
                </div>
                <ui-input prop="grid.cols" min="1" type="number">
                    {{ descriptor.props.grid.label.cols }}
                </ui-input>
                <ui-input-units prop="grid.gap" :units="SizeUnits">
                    {{ descriptor.props.grid.label.gap }}
                </ui-input-units>
                <ui-switch prop="isEqualWidthColumns">
                    {{ descriptor.props.isEqualWidthColumns.label }}
                </ui-switch>

                <!-- Отображение -->
                <div class="sp-section-label sp-section-label--mt">Отображение</div>
                <ui-switch prop="isShowDefaultSlot">
                    <template #hint>
                        Отображает дефолтный слот когда ни одно из условий всех правил не выполняется.
                    </template>
                </ui-switch>
                <ui-switch prop="isUseSkeleton">
                    {{ descriptor.props.isUseSkeleton.label }}
                </ui-switch>
                <ui-switch v-model="isDevMode">Показать все слоты</ui-switch>

                <!-- Дополнительно -->
                <div class="adv-toggle" @click="showAdvanced = !showAdvanced">
                    <i class="mdi" :class="showAdvanced ? 'mdi-chevron-up' : 'mdi-chevron-down'" />
                    Дополнительно
                </div>
                <template v-if="showAdvanced">

                    <ui-input v-model="props.events.updateData" @change="propChanged('events')">
                        {{ descriptor.props.events.label.updateData }}
                    </ui-input>

                    <ui-has-panel>
                        <ui-checkbox prop="awaitStoreFilter">
                            {{ descriptor.props.awaitStoreFilter.label }}
                        </ui-checkbox>
                        <template #panel>
                            <ui-panel :groups="[{ name: 'Настройка переменных', slot: 'default' }]">
                                <ui-select prop="awaitVariableModeVariables" :options="awaitModeVariableOptions" multiple>
                                    Переменные
                                </ui-select>
                            </ui-panel>
                        </template>
                    </ui-has-panel>

                    <div class="sp-section-label sp-section-label--mt">Метрики</div>
                    <ui-input
                        :value="props.metrics[metricNameKey]"
                        @input="setMetric(metricNameKey, $event)">
                        Поле «имя» слота
                    </ui-input>
                    <ui-switch prop="isSaveFirstMetricValue">
                        {{ descriptor.props.isSaveFirstMetricValue.label }}
                    </ui-switch>

                    <ui-switch prop="isDremioPaginationLimit">
                        <template #hint>
                            Снимает дефолтное ограничение (1 строка) на источники фильтрации.
                            Работает корректно только с операторами is null, is not null, in, not in.
                        </template>
                        {{ descriptor.props.isDremioPaginationLimit.label }}
                    </ui-switch>

                    <ui-input-units prop="grid.rowMinHeight" :units="SizeUnits" :options="rowHeightOptions">
                        {{ descriptor.props.grid.label.rowMinHeight }}
                    </ui-input-units>

                </template>

            </template>

            <!-- ══════════════════ STACK mode ═════════════════════════════ -->
            <template v-else-if="isStackMode">

                <div class="sp-section-label sp-section-label--mt">Состояния</div>
                <div class="stack-hint">
                    <i class="mdi mdi-information-outline"></i>
                    Выберите состояние — виджеты, перетащенные в контейнер, попадут в его слот.
                </div>
                <form class="row row-collapse sp-add-row" @submit.prevent="addState">
                    <div class="col">
                        <input
                            class="input input-small w-100"
                            type="text"
                            placeholder="Новое состояние"
                            v-model="newStateName"
                        />
                    </div>
                    <div class="col col-auto">
                        <button class="btn btn-ghost btn-icon btn-small" type="submit">
                            <i class="mdi mdi-plus"></i>
                        </button>
                    </div>
                </form>

                <div v-for="state in props.states" :key="state.name" class="stack-state-row">
                    <div
                        class="stack-state-row__name-btn"
                        :class="{ 'stack-state-row__name-btn--active': props.activeState === state.name }"
                        title="Нажмите, чтобы выбрать активный слот"
                        @click="setActiveState(state)">
                        <i class="mdi mdi-eye stack-state-row__eye" v-if="props.activeState === state.name" />
                        <code>{{ state.name }}</code>
                    </div>
                    <div class="form-control form-control-icon-left flex-1">
                        <input
                            class="input input-small w-100"
                            type="text"
                            placeholder="Событие"
                            v-model="state.event"
                            @change="propChanged('states')"
                        />
                        <div class="icon"><i class="mdi mdi-flash color-grey"></i></div>
                    </div>
                    <button
                        class="btn btn-ghost btn-icon btn-small"
                        :class="{ disabled: props.states.length <= 1 }"
                        @click.stop="removeState(state)">
                        <i class="mdi mdi-close"></i>
                    </button>
                </div>

            </template>

            <!-- ══════════════════ CONTAINER mode ════════════════════════ -->
            <template v-else-if="isContainerMode">

                <ui-switch prop="initShow">{{ descriptor.props.initShow.label }}</ui-switch>
                <ui-switch prop="showMode">{{ descriptor.props.showMode.label }}</ui-switch>

                <template v-if="!props.showMode">
                    <ui-input prop="eventShow">{{ descriptor.props.eventShow.label }}</ui-input>
                    <ui-input prop="eventHide">{{ descriptor.props.eventHide.label }}</ui-input>
                </template>
                <template v-else>
                    <ui-input prop="eventShowHide">{{ descriptor.props.eventShowHide.label }}</ui-input>
                    <ui-switch prop="reverseEvent">{{ descriptor.props.reverseEvent.label }}</ui-switch>
                </template>

                <ui-switch v-if="isEditorMode" v-model="containerPreview">
                    Показать в редакторе
                </ui-switch>

            </template>

        </ui-container>
    </ui-panel-container>
</template>

<script>
import { Panel } from '@goodt-wcore/panel';
import { SizeUnits } from '@goodt-wcore/panels';
import { Mode, Metric } from '../constants';
import UiContainer from './components/UiContainer.vue';

const MODE_OPTIONS = [
    {
        value: Mode.GALLERY,
        label: 'Галерея',
        icon: 'mdi-view-grid',
        desc: 'По условиям из данных',
    },
    {
        value: Mode.STACK,
        label: 'Стек',
        icon: 'mdi-layers',
        desc: 'Переключение по событию',
    },
    {
        value: Mode.CONTAINER,
        label: 'Контейнер',
        icon: 'mdi-eye-outline',
        desc: 'Показать / скрыть',
    },
];

const GRID_PRESETS = [
    { label: '×1', cols: 1, gap: '0' },
    { label: '×2', cols: 2, gap: '1rem' },
    { label: '×3', cols: 3, gap: '1rem' },
    { label: '×4', cols: 4, gap: '0.5rem' },
];

export default {
    extends: Panel,
    components: { UiContainer },

    meta: { name: 'Настройки', icon: 'cog-outline' },

    static: {
        SizeUnits,
        rowHeightOptions: [{ value: 'inherit', label: 'inherit' }],
        gridPresets: GRID_PRESETS,
    },

    data: () => ({
        newStateName: '',
        metricNameKey: Metric.NAME,
        showAdvanced: false,
    }),

    computed: {
        modeOptions: () => MODE_OPTIONS,

        currentMode() {
            return this.props.mode || Mode.GALLERY;
        },
        isGalleryMode()   { return this.currentMode === Mode.GALLERY; },
        isStackMode()     { return this.currentMode === Mode.STACK; },
        isContainerMode() { return this.currentMode === Mode.CONTAINER; },

        isDevMode: {
            get() { return this.elementInstance?.isDevMode ?? false; },
            set(val) { if (this.elementInstance) this.elementInstance.isDevMode = val; }
        },

        containerPreview: {
            get() { return this.elementInstance?.containerVisible ?? false; },
            set(val) { if (this.elementInstance) this.elementInstance.containerVisible = val; }
        },

        awaitModeVariableOptions() {
            return Object.keys({
                ...this.descriptor.vars,
                ...this.elementInstance?.descriptor.vars
            }).sort();
        }
    },

    methods: {
        setMode(value) {
            this.$set(this.props, 'mode', value);
            this.propChanged('mode');
        },

        setGrid(preset) {
            this.props.grid.cols = preset.cols;
            this.props.grid.gap = preset.gap;
            this.propChanged('grid');
        },

        setMetric(key, value) {
            this.$set(this.props.metrics, key, value || null);
            this.propChanged('metrics');
        },

        // ── Stack ────────────────────────────────────────────────────────
        addState() {
            const name = this.newStateName.trim();
            if (!name || this.props.states.some((s) => s.name === name)) return;
            this.props.states.push({ name, event: '' });
            // Auto-activate the new state so dropped widgets land in its slot
            this.props.activeState = name;
            this.newStateName = '';
            this.propChanged('states');
            this.propChanged('activeState');
        },

        removeState(state) {
            if (this.props.states.length <= 1) return;
            this.props.states = this.props.states.filter((s) => s.name !== state.name);
            if (this.props.activeState === state.name) {
                this.props.activeState = this.props.states[0].name;
                this.propChanged('activeState');
            }
            this.propChanged('states');
        },

        /**
         * Select the active state both in props (so the builder inserts widgets
         * into the correct slot) and on the live instance (immediate visual update).
         */
        setActiveState(state) {
            this.props.activeState = state.name;
            this.propChanged('activeState');
            if (this.elementInstance) this.elementInstance.activeStackSlot = state.name;
        }
    }
};
</script>

<style scoped>
.sp-section-label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #94a3b8;
    margin: 4px 0 4px;
}
.sp-section-label--mt { margin-top: 8px; }

/* ── Карточки режима ──────────────────────────────────────────────── */
.mode-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
}
.mode-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    padding: 10px 6px 8px;
    border-radius: 10px;
    border: 1.5px solid #e2e8f0;
    background: #fff;
    cursor: pointer;
    transition: border-color 0.12s, background 0.12s;
    text-align: center;
}
.mode-card:hover { border-color: #94a3b8; background: #f8fafc; }
.mode-card--active { border-color: #4f6aff; background: #f5f7ff; }
.mode-card__icon {
    font-size: 20px;
    color: #94a3b8;
    transition: color 0.12s;
}
.mode-card--active .mode-card__icon { color: #4f6aff; }
.mode-card__label {
    font-size: 12px;
    font-weight: 600;
    color: #475569;
}
.mode-card--active .mode-card__label { color: #4f6aff; }
.mode-card__desc {
    font-size: 10px;
    color: #94a3b8;
    line-height: 1.3;
}

/* ── Пресеты сетки ────────────────────────────────────────────────── */
.grid-presets {
    display: flex;
    gap: 6px;
    margin-bottom: 4px;
}
.grid-preset-btn {
    flex: 1;
    padding: 6px 4px;
    border-radius: 8px;
    border: 1.5px solid #e2e8f0;
    background: #fff;
    font-size: 12px;
    font-weight: 600;
    color: #475569;
    cursor: pointer;
    text-align: center;
    transition: border-color 0.12s;
}
.grid-preset-btn:hover { border-color: #94a3b8; }
.grid-preset-btn--active { border-color: #4f6aff; color: #4f6aff; background: #f5f7ff; }

/* ── Дополнительно ────────────────────────────────────────────────── */
.adv-toggle {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    font-weight: 500;
    color: #64748b;
    cursor: pointer;
    padding: 6px 2px;
    user-select: none;
    border-top: 1px solid #f1f5f9;
    margin-top: 4px;
}
.adv-toggle:hover { color: #4f6aff; }
.adv-toggle .mdi { font-size: 16px; }

/* ── Стек ─────────────────────────────────────────────────────────── */
.sp-add-row { margin-bottom: 6px; }
.flex-1 { flex: 1; }
.stack-state-row {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 6px;
}
.stack-state-row__name-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    min-width: 60px;
    flex-shrink: 0;
    padding: 3px 6px;
    border-radius: 6px;
    cursor: pointer;
    border: 1.5px solid transparent;
    transition: border-color 0.12s, background 0.12s;
}
.stack-state-row__name-btn:hover { border-color: #a5b4fc; background: #f5f7ff; }
.stack-state-row__name-btn--active { border-color: #4f6aff; background: #eff2ff; }
.stack-state-row__name-btn--active code { color: #4f6aff; }
.stack-state-row__eye { font-size: 13px; color: #4f6aff; }
.stack-hint {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    font-size: 11px;
    color: #64748b;
    line-height: 1.5;
    margin-bottom: 6px;
    padding: 7px 9px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 7px;
}
.stack-hint .mdi { font-size: 14px; flex-shrink: 0; margin-top: 1px; }
</style>
