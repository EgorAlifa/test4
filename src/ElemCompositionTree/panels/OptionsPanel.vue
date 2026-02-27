<template>
    <w-panel>
        <ui-container>
            <div class="form-label form-label-small">Дерево</div>
            <ui-input
                v-model.number="props.topNPerLevel"
                type="number"
                min="1"
                max="50"
                @change="propChanged('topNPerLevel')"
            >
                Топ N значений на уровень
            </ui-input>

            <div class="form-label form-label-small mt-3">Формат числа</div>
            <ui-select
                v-model="props.metricFormat"
                :options="METRIC_FORMAT_OPTIONS"
                @change="propChanged('metricFormat')"
            >
                Формат метрики
            </ui-select>
            <ui-select
                v-model="props.metricSeparator"
                :options="SEPARATOR_OPTIONS"
                @change="propChanged('metricSeparator')"
            >
                Разделитель разрядов
            </ui-select>

            <div class="form-label form-label-small mt-3">Цвета</div>
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

            <div class="form-label form-label-small mt-3">Цвета по уровням</div>
            <p class="text-muted text-small mt-1 mb-2">
                Задайте цвет бара для каждого уровня (0 — корень, 1 — первый размер и т.д.). Пусто — цвет из полей выше.
            </p>
            <div
                v-for="levelIdx in maxLevelColors"
                :key="levelIdx"
                class="decomp-options-level-color-row"
            >
                <span class="decomp-options-level-label">Уровень {{ levelIdx - 1 }}</span>
                <ui-input-cp
                    :value="levelColorAt(levelIdx - 1)"
                    @change="setLevelColor(levelIdx - 1, $event)"
                />
            </div>

            <div class="form-label form-label-small mt-3">Состояние по умолчанию</div>
            <p class="text-muted text-small mt-1 mb-0">
                В режиме редактирования текущий вид дерева (выбранный путь и раскрытые узлы) сохраняется автоматически и будет использоваться в плеере как начальное состояние.
            </p>
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

    methods: {
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
.decomp-options-level-color-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
}
.decomp-options-level-label {
    min-width: 72px;
    font-size: 12px;
    color: #666;
}
</style>

