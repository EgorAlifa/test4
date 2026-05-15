<template>
    <w-panel>
        <ui-container>
            <!-- Auto play -->
            <ui-checkbox prop="autoPlay">Автовоспроизведение при загрузке</ui-checkbox>

            <div class="form-label form-label-small">Скорость анимации</div>

            <!-- Animation speed in milliseconds -->
            <ui-input
                type="number"
                min="100"
                max="3000"
                step="50"
                prop="animationSpeedMs"
                label="Скорость анимации (мс)">
            </ui-input>

            <div class="form-label form-label-small">Настройки частиц</div>

            <!-- Particle glow duration -->
            <ui-input
                type="number"
                min="500"
                max="10000"
                step="100"
                prop="particleGlowDuration"
                label="Длительность свечения (мс)">
            </ui-input>

            <!-- Fade time -->
            <ui-input
                type="number"
                min="1"
                max="30"
                step="1"
                prop="fadeTime"
                label="Время затухания (дни)">
            </ui-input>
        </ui-container>
    </w-panel>
</template>

<script>
import { Panel } from '@goodt-wcore/panel';
import { usePanelDatasetMixin } from '@goodt-common/data';
import {
    ANIMATION_SPEED_MIN,
    ANIMATION_SPEED_MAX,
    ANIMATION_SPEED_STEP
} from '../utils/constants';

export default {
    extends: Panel,
    mixins: [usePanelDatasetMixin()],

    meta: { name: 'Анимация', icon: 'play-circle' },

    data() {
        return {
            // Animation speed options - kept for potential future use
            // eslint-disable-next-line no-unused-vars, vue/no-unused-properties
            animationSpeedOptions: {
                speedMin: ANIMATION_SPEED_MIN,
                speedMax: ANIMATION_SPEED_MAX,
                speedStep: ANIMATION_SPEED_STEP
            }
        };
    }
};
</script>

