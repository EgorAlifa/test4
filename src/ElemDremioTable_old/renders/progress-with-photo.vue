<template>
    <div :class="cellCssClass" v-on="cellEventHandlers">
        <ui-tooltip v-bind="{ ...tooltipOpts }">
            <template #target="{ events, binds }">
                <div class="row row-gap-none h-100 w-100" v-bind="binds" v-on="tooltip.enable ? events : {}">
                    <div class="col col-vmid">
                        <div
                            class="progress-bar"
                            :class="[...barCss.cssClass(), ...barCssClass]"
                            :style="barCss.style()">
                            <div
                                class="progress-line w-0"
                                :class="[...lineCss.cssClass(), ...lineCssClass]"
                                :style="lineCssStyle"></div>
                            <div
                                v-for="(point, idx) of points"
                                :key="idx"
                                class="marker"
                                :style="createMarkerStyle(point)">
                                <img
                                    alt="employee"
                                    :src="images[idx]"
                                    :class="[...imageCss.cssClass(), ...imageCssClass]"
                                    :style="imageCss.style()" />
                                <i
                                    class="mdi"
                                    :class="[...pointCss.cssClass(), ...pointCssClass]"
                                    :style="pointCss.style()"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
            <div :style="tooltipStyle">{{ tooltipValue }}</div>
        </ui-tooltip>
    </div>
</template>

<style scoped lang="less" src="./progress-with-photo.less"></style>

<script>
import { Tooltip as UiTooltip } from 'goodteditor-ui';
import RenderMixin from './render-mixin';
import { ColumnParamTypeNames, ColumnParamFormatTypes } from '../utils/constants';
import { buildQueryFromUrlParam } from '../utils/utils';

export default {
    components: { UiTooltip },
    mixins: [RenderMixin],
    props: {
        minProgressValue: {
            type: Object,
            default: () => ({
                format: ColumnParamFormatTypes.NUM
            })
        },
        progressValue: {
            type: Object,
            default: () => ({
                format: ColumnParamFormatTypes.NUM
            })
        },
        maxProgressValue: {
            type: Object,
            default: () => ({
                format: ColumnParamFormatTypes.NUM
            })
        },
        pointPositions: {
            type: Object,
            default: () => ({})
        },
        isPointsIntegers: {
            type: Object,
            default: () => ({
                value: false,
                type: ColumnParamTypeNames.BOOLEAN
            })
        },
        imageUrls: {
            type: Object,
            default: () => ({})
        },
        lineCss: {
            type: Object,
            default: () => ({
                value: 'h-100, bg-red',
                type: ColumnParamTypeNames.INPUT
            })
        },
        barCss: {
            type: Object,
            default: () => ({
                value: 'radius-5, h-2.5, bg-grey-light',
                type: ColumnParamTypeNames.INPUT
            })
        },
        pointCss: {
            type: Object,
            default: () => ({
                value: 'mdi-circle',
                type: ColumnParamTypeNames.INPUT
            })
        },
        imageCss: {
            type: Object,
            default: () => ({
                value: 'avatar',
                type: ColumnParamTypeNames.INPUT
            })
        },
        url: {
            type: Object,
            default: () => ({})
        },
        urlParamName: {
            type: Object,
            default: () => ({})
        },
        urlParamValue: {
            type: Object,
            default: () => ({})
        },
        shouldOpenNewTab: {
            type: Object,
            default: () => ({
                value: false,
                type: ColumnParamTypeNames.BOOLEAN
            })
        }
    },
    computed: {
        tooltipValue() {
            const { tooltip, progressValue } = this;
            return tooltip.value == null ? progressValue.format() : tooltip.value;
        },
        barCssClass() {
            const { value } = this.barCss;
            return value ? value.replaceAll(/\s/g, '').split(',') : value;
        },
        lineCssClass() {
            const { value } = this.lineCss;
            return value ? value.replaceAll(/\s/g, '').split(',') : value;
        },
        pointCssClass() {
            const { value } = this.pointCss;
            return value ? value.replaceAll(/\s/g, '').split(',') : 'mdi-circle';
        },
        imageCssClass() {
            const { value } = this.imageCss;
            return value ? value.replaceAll(/\s/g, '').split(',') : value;
        },
        lineCssStyle() {
            const { lineCss, progressValue, minProgressValue, maxProgressValue } = this;
            const retStyle = lineCss?.style() ?? {};
            const value = progressValue?.format() ?? 0;
            const minPgsValue = minProgressValue?.format() ?? 0;
            const maxPgsValue = maxProgressValue?.format() ?? 100;
            let width = 0;
            width = value > maxPgsValue - minPgsValue ? 100 : (value / (maxPgsValue - minPgsValue)) * 100;
            retStyle.width = `${Math.round(width)}%`;
            return retStyle;
        },
        points() {
            return this.pointPositions?.value?.split(',') ?? [];
        },
        images() {
            return this.imageUrls?.value?.split(',') ?? [];
        }
    },
    methods: {
        createMarkerStyle(point) {
            const value = this.isPointsIntegers.value ? point : point * 100;
            return { '--marker-left': `${value}%` };
        },
        /** @public */
        clickHandler() {
            const {
                url: { value: path },
                urlParamName,
                urlParamValue,
                shouldOpenNewTab
            } = this;

            if (this.canRowToggleItself || this.canCollapseExpandRow) {
                this.$emit('click');
            }

            if (path == null) {
                return;
            }

            const query = buildQueryFromUrlParam(urlParamName, urlParamValue);

            this.navigate({ path, query }, shouldOpenNewTab.value);
        }
    }
};
</script>
