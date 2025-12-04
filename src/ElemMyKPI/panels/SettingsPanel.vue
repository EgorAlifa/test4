<template>
    <w-panel>
        <ui-container>
            <!-- your panel goes here -->
            <ui-select prop="metric" :options="metrics"></ui-select>
            <ui-select prop="dimension" :options="dimensions"></ui-select>
            <ui-select prop="dimensionOrMetric" :options="dimensionsMetricsOptions"></ui-select>
            <ui-select prop="field" :options="fields"></ui-select>
            <ui-select prop="drilldownName" :options="drilldowns"></ui-select>
            <ui-select :options="drilldownDimensionsOptions">
                Выберите измерение из дриллдауна
            </ui-select>

            <ui-divider></ui-divider>
            <div class="flex items-center gap-2">
                <ui-input class="flex-1" prop="title" placeholder="Заголовок"></ui-input>
                <ui-button size="sm" @click="showTitleFont = !showTitleFont">✎</ui-button>
            </div>
            <div v-if="showTitleFont" class="grid gap-2 mar-top-1">
                <ui-input prop="titleFontColor" placeholder="Цвет (например, #000000)"></ui-input>
                <ui-input prop="titleFontSize" placeholder="Размер (например, 1rem)"></ui-input>
                <ui-input prop="titleFontWeight" placeholder="Насыщенность (например, 600)"></ui-input>
                <ui-input prop="titleFontFamily" placeholder="Семейство (например, Inter, sans-serif)"></ui-input>
            </div>
            <ui-input prop="subTitle" placeholder="Подзаголовок"></ui-input>

            <div class="grid grid-cols-2 gap-2">
                <ui-select prop="variant" :options="options.variants" label="Вариант"></ui-select>
                <ui-select prop="size" :options="options.sizes" label="Размер"></ui-select>
                <ui-select prop="radius" :options="options.radiuses" label="Скругление"></ui-select>
                <ui-select prop="align" :options="options.aligns" label="Выравнивание"></ui-select>
                <ui-select prop="icon" :options="options.icons" label="Иконка"></ui-select>
                <ui-select prop="colorScheme" :options="options.colorSchemes" label="Цвет"></ui-select>
                <ui-select prop="iconScheme" :options="options.colorSchemes" label="Цвет иконки"></ui-select>
                <ui-select prop="sparklineScheme" :options="options.colorSchemes" label="Цвет спарклайна"></ui-select>
                <ui-select prop="positiveColor" :options="options.colorSchemes" label="Цвет роста"></ui-select>
                <ui-select prop="negativeColor" :options="options.colorSchemes" label="Цвет падения"></ui-select>
                <ui-select prop="decimals" :options="options.decimals" label="Десятичные"></ui-select>
                <ui-select prop="deltaMode" :options="options.deltaModes" label="Режим изменения"></ui-select>
                <ui-select prop="deltaIconStyle" :options="[{label: 'Круг', value: 'circle'},{label:'Стрелка', value:'arrow'}]" label="Иконка дельты"></ui-select>
            </div>

            <div class="grid grid-cols-2 gap-2">
                <ui-switch prop="showDelta">Показывать изменение</ui-switch>
                <ui-switch prop="goodIsPositive">Рост — хорошо</ui-switch>
                <ui-switch prop="showSparkline">Спарклайн</ui-switch>
                <ui-switch prop="showBadge">Бэйдж</ui-switch>
                <ui-switch prop="showTitle">Заголовок</ui-switch>
                <ui-switch prop="showIcon">Иконка</ui-switch>
                <ui-switch prop="showUnit">Единица</ui-switch>
                <ui-switch prop="showBorder">Бордер</ui-switch>
                <ui-switch prop="sparklineFollowDelta">Цвет спарклайна по тренду</ui-switch>
            </div>

            <ui-divider></ui-divider>
            <div class="grid grid-cols-2 gap-2">
                <ui-input prop="metricFontColor" label="Цвет метрики"></ui-input>
                <ui-input prop="metricFontSize" label="Размер метрики"></ui-input>
                <ui-input prop="metricFontWeight" label="Насыщенность метрики"></ui-input>
                <ui-input prop="metricFontFamily" label="Шрифт метрики"></ui-input>
            </div>

            <ui-input prop="badgeText" placeholder="Текст бэйджа" v-if="props.showBadge"></ui-input>
            <ui-input prop="unit" placeholder="Единица (например, USD)"></ui-input>
            <ui-select prop="elevation" :options="options.elevation" label="Тень"></ui-select>
            <ui-input prop="iconUrl" placeholder="URL иконки"></ui-input>
            <div class="grid grid-cols-2 gap-2">
                <ui-input type="number" prop="sparklineWidth" placeholder="Толщина графика"></ui-input>
                <ui-input type="number" prop="sparklineHeight" placeholder="Высота графика"></ui-input>
                <ui-input type="number" step="0.05" prop="sparklineFillOpacity" placeholder="Прозрачность заливки"></ui-input>
                <ui-switch prop="useSparklineFill">Заливка графика</ui-switch>
            </div>
        </ui-container>
    </w-panel>
</template>

<script>
import { Panel } from '@goodt-wcore/panel';
import { usePanelDatasetMixin, PanelDatasetMixinTypes } from '@goodt-common/data';
import { PanelInstanceTypeDescriptor } from '../types';
import { options, defaults } from '../config';

export default {
    extends: Panel,
    mixins: [usePanelDatasetMixin()],

    meta: { name: 'Настройки виджета', icon: 'widgets' },

    data: () => ({ options, defaults, showTitleFont: false }),
    computed: {
        dimensionsMetricsOptions() {
            return this.buildOptions(this.dimensionsMetrics, { empty: true });
        },
        drilldownDimensionsOptions() {
            if (!this.$drilldown || !this.props || !this.props.drilldownName) return [];
            const dims = this.$drilldown.getDimensions(this.props.drilldownName) || [];
            return dims.map((dimension, index) => ({
                label: dimension,
                value: index
            }));
        },
    },
    watch: {
        dimensions: {
            handler(dimensions) {
                if (dimensions.includes(this.props.dimension) === false) {
                    this.props.dimension = dimensions[0] ?? '';
                    this.propChanged('dimension');
                }
            },
            immediate: true
        }
    },
    methods: {
        ...PanelInstanceTypeDescriptor,
        ...PanelDatasetMixinTypes
    }
};
</script>

