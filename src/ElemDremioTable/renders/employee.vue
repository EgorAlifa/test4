<template>
    <div :class="cellCssClass" v-on="cellEventHandlers">
        <ui-tooltip v-bind="{ ...tooltipOpts }">
            <template #target="{ events, binds }">
                <div class="row row-collapse" v-bind="binds" v-on="tooltip.enable ? events : {}">
                    <div v-if="fotoLeft.name" class="col col-auto">
                        <img
                            v-if="fotoLeft.value"
                            class="avatar avatar-3 round mar-right-l1 obj-cover"
                            :class="fotoLeft.cssClass()"
                            :style="fotoLeft.style()"
                            :src="fotoLeft.value" />
                        <div
                            v-else
                            class="avatar avatar-3 round bg-grey-lighter shadow d-flex flex-center scroll-hide mar-right-l1">
                            <div class="text-small text-bold color-grey">{{ photoLetters }}</div>
                        </div>
                    </div>
                    <div class="col">
                        <div>
                            <span :class="name.cssClass()" :style="name.style()">{{ name.format() }}</span>
                            <span>&#160;</span>
                            <span :class="surname.cssClass()" :style="surname.style()">{{ surname.format() }}</span>
                        </div>
                        <div :class="statusName.cssClass()" :style="statusName.style()">
                            {{ statusName.format() }}
                        </div>
                    </div>
                    <div v-if="fotoRight.name" class="col col-auto">
                        <img
                            v-if="fotoRight.value"
                            class="avatar avatar-3 round mar-left-l1 obj-cover"
                            :class="fotoRight.cssClass()"
                            :style="fotoRight.style()"
                            :src="fotoRight.value" />
                        <div
                            v-else
                            class="avatar avatar-3 round bg-grey-lighter shadow d-flex flex-center scroll-hide mar-left-l1">
                            <div class="text-small text-bold color-grey">{{ photoLetters }}</div>
                        </div>
                    </div>
                </div>
            </template>
            <div :style="tooltipStyle">{{ tooltipValue }}</div>
        </ui-tooltip>
    </div>
</template>
<script>
import { Tooltip as UiTooltip } from 'goodteditor-ui';
import RenderMixin from './render-mixin';
import { ColumnParamTypeNames } from '../utils/constants';
import { buildQueryFromUrlParam } from '../utils/utils';

export default {
    components: { UiTooltip },
    mixins: [RenderMixin],
    props: {
        fotoLeft: {
            type: Object,
            default: () => ({})
        },
        fotoRight: {
            type: Object,
            default: () => ({})
        },
        name: {
            type: Object,
            default: () => ({})
        },
        surname: {
            type: Object,
            default: () => ({})
        },
        statusName: {
            type: Object,
            default: () => ({})
        },
        url: {
            type: Object,
            default: () => ({
                type: ColumnParamTypeNames.INPUT
            })
        },
        urlParamName: {
            type: Object,
            default: () => ({
                type: ColumnParamTypeNames.INPUT
            })
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
            const { tooltip, name, surname } = this;
            return tooltip.value == null ? `${name.format()} ${surname.format()}` : tooltip.value;
        },
        photoLetters() {
            const {
                name: { value: name = '' },
                surname: { value: surname = '' }
            } = this;
            return `${name ? name[0] : ''}${surname ? surname[0] : ''}`;
        }
    },
    methods: {
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
