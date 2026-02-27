<template>
    <w-panel>
        <ui-container>

            <!-- ── Дерево ────────────────────────────────────────────── -->
            <div class="section-label">Дерево</div>

            <div class="top-n-row">
                <span class="top-n-label">Топ N на уровень</span>
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
            </div>
            <div class="top-n-hint">
                Показывать топ <strong>{{ topNValue }}</strong> значений на каждом уровне разбивки (от 1 до 50)
            </div>

            <!-- ── Формат числа ───────────────────────────────────── -->
            <div class="section-label">Формат числа</div>

            <div class="format-grid">
                <div
                    v-for="opt in METRIC_FORMAT_OPTIONS"
                    :key="opt.value"
                    class="format-chip"
                    :class="{ 'format-chip--active': props.metricFormat === opt.value }"
                    @click="setFormat(opt.value)"
                >
                    {{ opt.label }}
                </div>
            </div>

            <div class="sep-row">
                <span class="sep-label">Разделитель разрядов</span>
                <div class="sep-options">
                    <div
                        v-for="opt in SEPARATOR_OPTIONS"
                        :key="opt.value"
                        class="sep-chip"
                        :class="{ 'sep-chip--active': props.metricSeparator === opt.value }"
                        @click="setSeparator(opt.value)"
                    >
                        {{ opt.label }}
                    </div>
                </div>
            </div>

            <!-- ── Цвета ─────────────────────────────────────────── -->
            <div class="section-label">Цвета баров</div>
            <ui-input-cp v-model="props.rootNodeColor" @change="propChanged('rootNodeColor')">
                Цвет корневого узла
            </ui-input-cp>
            <ui-input-cp v-model="props.nodeColor" @change="propChanged('nodeColor')">
                Цвет узлов
            </ui-input-cp>
            <ui-input-cp v-model="props.connectorColor" @change="propChanged('connectorColor')">
                Цвет соединительных линий
            </ui-input-cp>
            <ui-input-cp v-model="props.plusButtonBg" @change="propChanged('plusButtonBg')">
                Фон кнопки «+»
            </ui-input-cp>

            <!-- ── Цвета текста ───────────────────────────────────── -->
            <div class="section-label">Цвета текста</div>
            <ui-input-cp v-model="props.labelColor" @change="propChanged('labelColor')">
                Цвет подписей
            </ui-input-cp>
            <ui-input-cp v-model="props.valueColor" @change="propChanged('valueColor')">
                Цвет значений метрики
            </ui-input-cp>

            <!-- ── Цвета по уровням ───────────────────────────────── -->
            <div class="section-label">Цвета баров по уровням</div>
            <p class="hint-text">
                Переопределяет «Цвет узлов» для конкретного уровня. 0 — корень, 1 — первый разрез и т.д.
                Пустое значение — берётся цвет из полей выше.
            </p>

            <div class="level-colors-grid">
                <div
                    v-for="levelIdx in maxLevelColors"
                    :key="levelIdx"
                    class="level-color-row"
                >
                    <div class="level-color-badge">{{ levelIdx - 1 }}</div>
                    <ui-input-cp
                        :value="levelColorAt(levelIdx - 1)"
                        @change="setLevelColor(levelIdx - 1, $event)"
                    />
                </div>
            </div>

            <!-- ── Состояние по умолчанию ─────────────────────────── -->
            <div class="section-label">Состояние по умолчанию</div>
            <div class="info-box">
                <i class="mdi mdi-information-outline info-box__icon" />
                <span>
                    В режиме редактирования текущий вид дерева (выбранный путь и раскрытые узлы)
                    сохраняется автоматически и будет использоваться в плеере как начальное состояние.
                </span>
            </div>

        </ui-container>
    </w-panel>
</template>

<script>
import { Panel } from '@goodt-wcore/panel';
import { METRIC_FORMAT_OPTIONS, SEPARATOR_OPTIONS } from '../constants';

const MAX_LEVEL_COLORS = 10;

export default {
    extends: Panel,

    meta: { name: 'Настройки виджета', icon: 'widgets' },

    static: {
        METRIC_FORMAT_OPTIONS,
        SEPARATOR_OPTIONS
    },

    data() {
        return { maxLevelColors: MAX_LEVEL_COLORS };
    },

    computed: {
        topNValue() {
            return this.props.topNPerLevel || 10;
        }
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
        }
    }
};
</script>

<style scoped>
/* ── Section label ────────────────────────────────────────────── */
.section-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #94a3b8;
    margin-top: 16px;
    margin-bottom: 8px;
}
.section-label:first-child {
    margin-top: 0;
}

/* ── Top-N controls ──────────────────────────────────────────── */
.top-n-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 4px;
}
.top-n-label {
    font-size: 12px;
    color: #475569;
    white-space: nowrap;
    flex-shrink: 0;
    min-width: 110px;
}
.top-n-controls {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
}
.top-n-slider {
    flex: 1;
    height: 4px;
    accent-color: #4f6aff;
    cursor: pointer;
}
.top-n-input {
    width: 48px;
    text-align: center;
    border: 1.5px solid #e2e8f0;
    border-radius: 6px;
    padding: 3px 4px;
    font-size: 13px;
    font-family: inherit;
    color: #1e293b;
    background: #fff;
    outline: none;
    transition: border-color 0.15s;
}
.top-n-input:focus { border-color: #4f6aff; }
.top-n-hint {
    font-size: 11px;
    color: #94a3b8;
    margin-bottom: 4px;
}

/* ── Format chips grid ───────────────────────────────────────── */
.format-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    margin-bottom: 10px;
}
.format-chip {
    padding: 4px 11px;
    border-radius: 20px;
    border: 1.5px solid #e2e8f0;
    background: #fff;
    color: #475569;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: border-color 0.12s, background 0.12s, color 0.12s;
    white-space: nowrap;
}
.format-chip:hover { border-color: #a5b4fc; color: #4f6aff; background: #f5f7ff; }
.format-chip--active { border-color: #4f6aff; background: #4f6aff; color: #fff; }

/* ── Separator row ───────────────────────────────────────────── */
.sep-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 4px;
}
.sep-label {
    font-size: 12px;
    color: #475569;
    flex-shrink: 0;
    min-width: 130px;
}
.sep-options {
    display: flex;
    gap: 5px;
}
.sep-chip {
    padding: 4px 11px;
    border-radius: 20px;
    border: 1.5px solid #e2e8f0;
    background: #fff;
    color: #475569;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: border-color 0.12s, background 0.12s, color 0.12s;
    white-space: nowrap;
}
.sep-chip:hover { border-color: #a5b4fc; color: #4f6aff; background: #f5f7ff; }
.sep-chip--active { border-color: #4f6aff; background: #4f6aff; color: #fff; }

/* ── Hint text ───────────────────────────────────────────────── */
.hint-text {
    font-size: 11px;
    color: #94a3b8;
    margin-top: 0;
    margin-bottom: 8px;
    line-height: 1.5;
}

/* ── Level colors grid ───────────────────────────────────────── */
.level-colors-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4px 12px;
    margin-bottom: 4px;
}
.level-color-row {
    display: flex;
    align-items: center;
    gap: 8px;
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

/* ── Info box ────────────────────────────────────────────────── */
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
