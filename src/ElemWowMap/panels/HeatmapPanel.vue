<template>
    <w-panel>
        <ui-container>
            <!-- Radius -->
            <ui-input
                type="number"
                :min="options.radiusMin"
                :max="options.radiusMax"
                prop="heatmapRadius"
                placeholder="25"
                label="Радиус">
            </ui-input>

            <!-- Blur -->
            <ui-input
                type="number"
                :min="options.blurMin"
                :max="options.blurMax"
                prop="heatmapBlur"
                placeholder="15"
                label="Размытие">
            </ui-input>

            <!-- Min opacity -->
            <ui-input
                type="number"
                :min="options.opacityMin"
                :max="options.opacityMax"
                :step="options.opacityStep"
                prop="heatmapMinOpacity"
                placeholder="0.5"
                label="Минимальная прозрачность">
            </ui-input>

            <div class="form-label form-label-small">Диапазон интенсивности</div>

            <!-- Max intensity -->
            <ui-input
                type="number"
                min="0"
                prop="heatmapMaxIntensity"
                placeholder="Авто"
                label="Максимальная интенсивность (авто если пусто)">
            </ui-input>
        </ui-container>
    </w-panel>
</template>

<script>
import { Panel } from '@goodt-wcore/panel';
import { usePanelDatasetMixin } from '@goodt-common/data';
import {
    HEATMAP_RADIUS_MIN,
    HEATMAP_RADIUS_MAX,
    HEATMAP_BLUR_MIN,
    HEATMAP_BLUR_MAX,
    HEATMAP_OPACITY_MIN,
    HEATMAP_OPACITY_MAX,
    HEATMAP_OPACITY_STEP
} from '../utils/constants';

export default {
    extends: Panel,
    mixins: [usePanelDatasetMixin()],

    meta: { name: 'Тепловая карта', icon: 'fire' },

    data() {
        return {
            options: {
                radiusMin: HEATMAP_RADIUS_MIN,
                radiusMax: HEATMAP_RADIUS_MAX,
                blurMin: HEATMAP_BLUR_MIN,
                blurMax: HEATMAP_BLUR_MAX,
                opacityMin: HEATMAP_OPACITY_MIN,
                opacityMax: HEATMAP_OPACITY_MAX,
                opacityStep: HEATMAP_OPACITY_STEP
            }
        };
    }
};
</script>


