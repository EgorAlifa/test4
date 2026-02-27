<template>
    <w-panel>
        <ui-container>

            <!-- ── Дерево ─────────────────────────────────────────────────── -->
            <div class="sec-wrap">
                <div class="sec-hd" @click="openTree = !openTree">
                    <span class="sec-hd__ico sec-hd__ico--blue">
                        <i class="mdi mdi-file-tree-outline" />
                    </span>
                    <div class="sec-hd__text">
                        <div class="sec-hd__title">Дерево</div>
                        <div class="sec-hd__sub">Топ {{ topNValue }} на уровень</div>
                    </div>
                    <i class="mdi sec-hd__chev" :class="openTree ? 'mdi-chevron-up' : 'mdi-chevron-down'" />
                </div>
                <transition name="sec-expand">
                    <div v-if="openTree" class="sec-body">
                        <div class="top-n-label">Топ N на уровень</div>
                        <div class="top-n-controls">
                            <input
                                type="range"
                                class="top-n-slider"
                                :value="topNValue"
                                min="1"
                                max="50"
                                step="1"
                                @input="onTopNSlider"
                            />
                            <input
                                type="number"
                                class="top-n-input"
                                :value="topNValue"
                                min="1"
                                max="50"
                                @change="onTopNInput"
                            />
                        </div>
                        <div class="top-n-hint">
                            Показывать топ <strong>{{ topNValue }}</strong> значений на каждом уровне (от 1 до 50)
                        </div>
                    </div>
                </transition>
            </div>

            <!-- ── Формат числа ───────────────────────────────────────────── -->
            <div class="sec-wrap">
                <div class="sec-hd" @click="openFormat = !openFormat">
                    <span class="sec-hd__ico sec-hd__ico--violet">
                        <i class="mdi mdi-numeric" />
                    </span>
                    <div class="sec-hd__text">
                        <div class="sec-hd__title">Формат числа</div>
                        <div class="sec-hd__sub">{{ currentFormatLabel }} · {{ currentSeparatorLabel }}</div>
                    </div>
                    <i class="mdi sec-hd__chev" :class="openFormat ? 'mdi-chevron-up' : 'mdi-chevron-down'" />
                </div>
                <transition name="sec-expand">
                    <div v-if="openFormat" class="sec-body">
                        <div class="field-label">Формат</div>
                        <div class="chip-row">
                            <div
                                v-for="opt in METRIC_FORMAT_OPTIONS"
                                :key="opt.value"
                                class="chip"
                                :class="{ 'chip--active': props.metricFormat === opt.value }"
                                @click="setFormat(opt.value)"
                            >
                                {{ opt.label }}
                            </div>
                        </div>

                        <div class="field-label" style="margin-top:10px;">Разделитель разрядов</div>
                        <div class="chip-row">
                            <div
                                v-for="opt in SEPARATOR_OPTIONS"
                                :key="opt.value"
                                class="chip"
                                :class="{ 'chip--active': props.metricSeparator === opt.value }"
                                @click="setSeparator(opt.value)"
                            >
                                {{ opt.label }}
                            </div>
                        </div>
                    </div>
                </transition>
            </div>

            <!-- ── Цвета баров ────────────────────────────────────────────── -->
            <div class="sec-wrap">
                <div class="sec-hd" @click="openColors = !openColors">
                    <span class="sec-hd__ico sec-hd__ico--green">
                        <i class="mdi mdi-palette-outline" />
                    </span>
                    <div class="sec-hd__text">
                        <div class="sec-hd__title">Цвета</div>
                        <div class="sec-hd__sub">Узлы, корень, активный, соединения</div>
                    </div>
                    <i class="mdi sec-hd__chev" :class="openColors ? 'mdi-chevron-up' : 'mdi-chevron-down'" />
                </div>
                <transition name="sec-expand">
                    <div v-if="openColors" class="sec-body">
                        <div class="field-label">Цвета баров</div>
                        <ui-input-cp v-model="props.rootNodeColor" @change="propChanged('rootNodeColor')">
                            Цвет корневого узла
                        </ui-input-cp>
                        <ui-input-cp v-model="props.nodeColor" @change="propChanged('nodeColor')">
                            Цвет узлов
                        </ui-input-cp>
                        <ui-input-cp v-model="props.activeNodeColor" @change="propChanged('activeNodeColor')">
                            Цвет активного узла
                        </ui-input-cp>
                        <ui-input-cp v-model="props.connectorColor" @change="propChanged('connectorColor')">
                            Цвет соединительных линий
                        </ui-input-cp>
                        <ui-input-cp v-model="props.plusButtonBg" @change="propChanged('plusButtonBg')">
                            Фон кнопки «+»
                        </ui-input-cp>

                        <div class="field-label" style="margin-top:10px;">Цвета текста</div>
                        <ui-input-cp v-model="props.labelColor" @change="propChanged('labelColor')">
                            Цвет подписей
                        </ui-input-cp>
                        <ui-input-cp v-model="props.valueColor" @change="propChanged('valueColor')">
                            Цвет значений метрики
                        </ui-input-cp>
                    </div>
                </transition>
            </div>

            <!-- ── Цвета по уровням ───────────────────────────────────────── -->
            <div class="sec-wrap">
                <div class="sec-hd" @click="openLevels = !openLevels">
                    <span class="sec-hd__ico sec-hd__ico--amber">
                        <i class="mdi mdi-layers-outline" />
                    </span>
                    <div class="sec-hd__text">
                        <div class="sec-hd__title">Цвета по уровням</div>
                        <div class="sec-hd__sub">
                            {{ numLevelSlots }} {{ ruPlural(numLevelSlots, 'уровень', 'уровня', 'уровней') }} настроено
                        </div>
                    </div>
                    <i class="mdi sec-hd__chev" :class="openLevels ? 'mdi-chevron-up' : 'mdi-chevron-down'" />
                </div>
                <transition name="sec-expand">
                    <div v-if="openLevels" class="sec-body">
                        <p class="hint-text">
                            Переопределяет «Цвет узлов» для конкретного уровня.
                            0 — корень, 1 — первый разрез и т.д.
                        </p>
                        <div class="level-colors-grid">
                            <div
                                v-for="idx in numLevelSlots"
                                :key="idx - 1"
                                class="level-color-row"
                            >
                                <div class="level-color-badge">{{ idx - 1 }}</div>
                                <ui-input-cp
                                    :value="levelColorAt(idx - 1)"
                                    @change="setLevelColor(idx - 1, $event)"
                                />
                                <button
                                    v-if="idx === numLevelSlots && idx > 1"
                                    class="level-rm-btn"
                                    title="Удалить последний уровень"
                                    @click="removeLevelSlot"
                                >
                                    <i class="mdi mdi-minus" />
                                </button>
                                <div v-else class="level-rm-placeholder" />
                            </div>
                        </div>
                        <div class="level-actions">
                            <button
                                class="level-btn level-btn--add"
                                :disabled="numLevelSlots >= MAX_LEVELS"
                                @click="addLevelSlot"
                            >
                                <i class="mdi mdi-plus" /> Добавить уровень
                            </button>
                            <button
                                v-if="numLevelSlots > 1"
                                class="level-btn level-btn--rm"
                                @click="removeLevelSlot"
                            >
                                <i class="mdi mdi-minus" /> Убрать
                            </button>
                        </div>
                        <div v-if="numLevelSlots >= MAX_LEVELS" class="hint-text" style="margin-top:4px;">
                            Максимум {{ MAX_LEVELS }} уровней
                        </div>
                    </div>
                </transition>
            </div>

            <!-- ── Состояние по умолчанию ─────────────────────────────────── -->
            <div class="sec-wrap">
                <div class="sec-hd" @click="openState = !openState">
                    <span class="sec-hd__ico sec-hd__ico--grey">
                        <i class="mdi mdi-bookmark-outline" />
                    </span>
                    <div class="sec-hd__text">
                        <div class="sec-hd__title">Состояние по умолчанию</div>
                        <div class="sec-hd__sub">Автосохранение в редакторе</div>
                    </div>
                    <i class="mdi sec-hd__chev" :class="openState ? 'mdi-chevron-up' : 'mdi-chevron-down'" />
                </div>
                <transition name="sec-expand">
                    <div v-if="openState" class="sec-body">
                        <div class="info-box">
                            <i class="mdi mdi-information-outline info-box__icon" />
                            <span>
                                В режиме редактирования текущий вид дерева (выбранный путь и раскрытые узлы)
                                сохраняется автоматически и будет использоваться в плеере как начальное состояние.
                            </span>
                        </div>
                    </div>
                </transition>
            </div>

        </ui-container>
    </w-panel>
</template>

<script>
import { Panel } from '@goodt-wcore/panel';
import { METRIC_FORMAT_OPTIONS, SEPARATOR_OPTIONS, MAX_LEVELS, DEFAULT_LEVEL_SLOTS } from '../constants';

export default {
    extends: Panel,

    meta: { name: 'Настройки виджета', icon: 'widgets' },

    static: {
        METRIC_FORMAT_OPTIONS,
        SEPARATOR_OPTIONS,
        MAX_LEVELS
    },

    data() {
        return {
            numLevelSlots: DEFAULT_LEVEL_SLOTS,
            openTree: true,
            openFormat: false,
            openColors: false,
            openLevels: false,
            openState: false
        };
    },

    computed: {
        topNValue() {
            return this.props.topNPerLevel || 10;
        },
        currentFormatLabel() {
            const opt = METRIC_FORMAT_OPTIONS.find((o) => o.value === this.props.metricFormat);
            return opt ? opt.label : 'Авто';
        },
        currentSeparatorLabel() {
            const opt = SEPARATOR_OPTIONS.find((o) => o.value === this.props.metricSeparator);
            return opt ? opt.label : 'Пробел';
        }
    },

    mounted() {
        const existing = (this.props.levelColors || []).filter(Boolean).length;
        this.numLevelSlots = Math.max(DEFAULT_LEVEL_SLOTS, existing > 0 ? existing + 1 : DEFAULT_LEVEL_SLOTS);
        if (this.numLevelSlots > MAX_LEVELS) this.numLevelSlots = MAX_LEVELS;
    },

    methods: {
        onTopNSlider(e) {
            this.props.topNPerLevel = Number(e.target.value);
            this.propChanged('topNPerLevel');
        },

        onTopNInput(e) {
            const val = Math.max(1, Math.min(50, Number(e.target.value) || 10));
            this.props.topNPerLevel = val;
            this.propChanged('topNPerLevel');
        },

        setFormat(value) {
            this.props.metricFormat = value;
            this.propChanged('metricFormat');
        },

        setSeparator(value) {
            this.props.metricSeparator = value;
            this.propChanged('metricSeparator');
        },

        levelColorAt(index) {
            const levelColors = this.props.levelColors;
            return (Array.isArray(levelColors) && levelColors[index]) ? levelColors[index] : '';
        },

        setLevelColor(index, value) {
            const levelColorsCopy = [...(this.props.levelColors || [])];
            while (levelColorsCopy.length <= index) {
                levelColorsCopy.push('');
            }
            levelColorsCopy[index] = value;
            this.props.levelColors = levelColorsCopy;
            this.propChanged('levelColors');
        },

        addLevelSlot() {
            if (this.numLevelSlots < MAX_LEVELS) {
                this.numLevelSlots++;
            }
        },

        removeLevelSlot() {
            if (this.numLevelSlots > 1) {
                this.setLevelColor(this.numLevelSlots - 1, '');
                this.numLevelSlots--;
            }
        },

        ruPlural(n, one, few, many) {
            const m10 = n % 10;
            const m100 = n % 100;
            if (m10 === 1 && m100 !== 11) return `${n} ${one}`;
            if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return `${n} ${few}`;
            return `${n} ${many}`;
        }
    }
};
</script>

<style scoped>
/* ── Accordion wrapper ─────────────────────────────────────────── */
.sec-wrap {
    border: 1.5px solid #e0e6ef;
    border-radius: 10px;
    overflow: hidden;
    margin-top: 6px;
    background: #fff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    transition: border-color 0.15s, box-shadow 0.15s;
}
.sec-wrap:first-child { margin-top: 0; }
.sec-wrap:hover { border-color: #c0cfe0; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07); }

/* ── Section header ────────────────────────────────────────────── */
.sec-hd {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    cursor: pointer;
    transition: background 0.12s;
    user-select: none;
}
.sec-hd:hover { background: #f7f9ff; }

.sec-hd__ico {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    flex-shrink: 0;
    font-size: 17px;
}
.sec-hd__ico--blue   { background: #dbeafe; color: #2563eb; }
.sec-hd__ico--violet { background: #ede9fe; color: #7c3aed; }
.sec-hd__ico--green  { background: #dcfce7; color: #16a34a; }
.sec-hd__ico--amber  { background: #fef3c7; color: #d97706; }
.sec-hd__ico--grey   { background: #f1f5f9; color: #64748b; }

.sec-hd__text { flex: 1; min-width: 0; }
.sec-hd__title {
    font-size: 13px;
    font-weight: 600;
    color: #1e293b;
    line-height: 1.3;
}
.sec-hd__sub {
    font-size: 11px;
    color: #64748b;
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.sec-hd__chev { font-size: 18px; color: #94a3b8; flex-shrink: 0; transition: transform 0.15s; }

/* ── Section body ──────────────────────────────────────────────── */
.sec-body {
    padding: 8px 12px 12px;
    border-top: 1px solid #f0f4f8;
    background: #fafcff;
}

/* ── Expand animation ──────────────────────────────────────────── */
.sec-expand-enter-active { transition: opacity 0.18s ease, transform 0.18s ease; }
.sec-expand-leave-active { transition: opacity 0.12s ease; }
.sec-expand-enter        { opacity: 0; transform: translateY(-6px); }
.sec-expand-leave-to     { opacity: 0; }

/* ── Field label ───────────────────────────────────────────────── */
.field-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #94a3b8;
    margin-bottom: 6px;
}

/* ── Top-N controls ────────────────────────────────────────────── */
.top-n-label {
    font-size: 12px;
    color: #475569;
    margin-bottom: 6px;
}
.top-n-controls {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
}
.top-n-slider {
    flex: 1;
    height: 4px;
    accent-color: #4f6aff;
    cursor: pointer;
}
.top-n-input {
    width: 50px;
    text-align: center;
    border: 1.5px solid #e2e8f0;
    border-radius: 6px;
    padding: 4px;
    font-size: 13px;
    font-family: inherit;
    color: #1e293b;
    background: #fff;
    outline: none;
    transition: border-color 0.15s;
    flex-shrink: 0;
}
.top-n-input:focus { border-color: #4f6aff; }
.top-n-hint {
    font-size: 11px;
    color: #94a3b8;
    line-height: 1.5;
}

/* ── Chips ─────────────────────────────────────────────────────── */
.chip-row {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
}
.chip {
    padding: 4px 12px;
    border-radius: 20px;
    border: 1.5px solid #e2e8f0;
    background: #fff;
    color: #475569;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: border-color 0.12s, background 0.12s, color 0.12s;
    white-space: nowrap;
    user-select: none;
}
.chip:hover { border-color: #a5b4fc; color: #4f6aff; background: #f5f7ff; }
.chip--active { border-color: #4f6aff; background: #4f6aff; color: #fff; }
.chip--active:hover { border-color: #3b58e8; background: #3b58e8; }

/* ── Hint text ─────────────────────────────────────────────────── */
.hint-text {
    font-size: 11px;
    color: #94a3b8;
    margin: 0 0 8px;
    line-height: 1.5;
}

/* ── Level colors grid ─────────────────────────────────────────── */
.level-colors-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4px 12px;
    margin-bottom: 8px;
}
.level-color-row {
    display: flex;
    align-items: center;
    gap: 6px;
}
.level-color-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 22px;
    height: 22px;
    border-radius: 50%;
    background: #e2e8f0;
    color: #475569;
    font-size: 11px;
    font-weight: 700;
    flex-shrink: 0;
}
.level-rm-btn {
    flex-shrink: 0;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    cursor: pointer;
    color: #94a3b8;
    font-size: 12px;
    padding: 0;
    transition: background 0.12s, color 0.12s, border-color 0.12s;
}
.level-rm-btn:hover { background: #fee2e2; border-color: #fca5a5; color: #dc2626; }
.level-rm-placeholder { width: 20px; flex-shrink: 0; }

/* ── Level action buttons ──────────────────────────────────────── */
.level-actions {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
}
.level-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 5px 12px;
    border-radius: 7px;
    font-size: 12px;
    font-weight: 500;
    font-family: inherit;
    cursor: pointer;
    transition: background 0.12s, border-color 0.12s, color 0.12s;
    border: 1.5px solid transparent;
}
.level-btn:disabled { opacity: 0.45; cursor: not-allowed; }
.level-btn--add {
    background: #eff2ff;
    border-color: #a5b4fc;
    color: #4f6aff;
}
.level-btn--add:not(:disabled):hover { background: #e0e7ff; border-color: #818cf8; }
.level-btn--rm {
    background: #fff;
    border-color: #e2e8f0;
    color: #64748b;
}
.level-btn--rm:hover { background: #fee2e2; border-color: #fca5a5; color: #dc2626; }

/* ── Info box ──────────────────────────────────────────────────── */
.info-box {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 9px 11px;
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    border-radius: 8px;
    font-size: 12px;
    color: #1e40af;
    line-height: 1.5;
}
.info-box__icon {
    font-size: 15px;
    color: #3b82f6;
    flex-shrink: 0;
    margin-top: 2px;
}
</style>
