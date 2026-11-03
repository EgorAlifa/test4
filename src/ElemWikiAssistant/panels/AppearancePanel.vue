<template>
    <w-panel>
        <div class="aiw-appearance-panel">
            <!-- Цвета -->
            <div class="panel-section">
                <div class="panel-section__title">Цвета</div>
                <div class="panel-row panel-row--inline">
                    <span class="panel-label">Акцентный цвет</span>
                    <ui-input-cp prop="accentColor" />
                </div>
                <div class="panel-row panel-row--inline">
                    <span class="panel-label">Фон панели</span>
                    <ui-input-cp prop="backgroundColor" />
                </div>
                <div class="panel-row panel-row--inline">
                    <span class="panel-label">Цвет текста</span>
                    <ui-input-cp prop="textColor" />
                </div>
            </div>

            <!-- Размеры -->
            <div class="panel-section">
                <div class="panel-section__title">Размеры</div>
                <div v-if="props.displayMode !== 'inline'" class="panel-row panel-row--inline">
                    <span class="panel-label">Ширина панели ({{ props.panelWidth }}px)</span>
                    <input
                        type="range"
                        class="range-slider"
                        min="300"
                        max="640"
                        step="10"
                        :value="props.panelWidth"
                        @input="setNumber('panelWidth', $event)"
                    />
                </div>
                <div v-if="props.displayMode !== 'inline'" class="panel-row panel-row--inline">
                    <span class="panel-label">Высота панели ({{ props.panelHeight }}px)</span>
                    <input
                        type="range"
                        class="range-slider"
                        min="360"
                        max="900"
                        step="10"
                        :value="props.panelHeight"
                        @input="setNumber('panelHeight', $event)"
                    />
                </div>
                <div class="panel-row panel-row--inline">
                    <span class="panel-label">Шрифт ({{ props.fontSize }}px)</span>
                    <input
                        type="range"
                        class="range-slider"
                        min="12"
                        max="18"
                        step="1"
                        :value="props.fontSize"
                        @input="setNumber('fontSize', $event)"
                    />
                </div>
                <div class="panel-row panel-row--inline">
                    <span class="panel-label">Скругление ({{ props.borderRadius }}px)</span>
                    <input
                        type="range"
                        class="range-slider"
                        min="0"
                        max="28"
                        step="1"
                        :value="props.borderRadius"
                        @input="setNumber('borderRadius', $event)"
                    />
                </div>
            </div>

        </div>
    </w-panel>
</template>

<script>
import { Panel } from '@goodt-wcore/panel';
import { PanelInstanceTypeDescriptor } from '../types';

export default {
    extends: Panel,

    meta: { name: 'Оформление', icon: 'palette-outline' },

    data: () => ({
        ...PanelInstanceTypeDescriptor
    }),

    methods: {
        /**
         * Записать числовой проп из нативного range-контрола
         * @param {string} name
         * @param {Event} event
         */
        setNumber(name, event) {
            const value = Number(event.target.value);
            if (!Number.isFinite(value)) {
                return;
            }
            this.props[name] = value;
            this.propChanged(name);
        }
    }
};
</script>

<style lang="pcss" scoped>
.aiw-appearance-panel {
    padding: 12px;

    .panel-section {
        margin-bottom: 16px;

        &:last-child {
            margin-bottom: 0;
        }

        &__title {
            margin-bottom: 8px;
            font-size: 11px;
            font-weight: 600;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            color: #666;
        }
    }

    .panel-row {
        margin-bottom: 8px;

        &--inline {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
        }
    }

    .panel-label {
        flex-shrink: 0;
        font-size: 12px;
        color: #333;
    }

    .range-slider {
        width: 120px;
        accent-color: #4f46e5;
    }
}
</style>
