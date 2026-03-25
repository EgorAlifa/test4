<template>
    <div>
        <div class="row row-collapse">
            <div class="col">
                <ui-select
                    v-model="paramEdit.type"
                    :options="paramTypes"
                    @change="
                        () => {
                            paramEdit.value = '';
                            changed();
                        }
                    ">
                    тип
                </ui-select>
            </div>
            <div class="col">
                <ui-select
                    v-if="paramEdit.type === 'METRIC_DIMENSION'"
                    v-model="paramEdit.value"
                    :options="dimensionMetricNames"
                    @change="changed">
                    значение
                </ui-select>
                <ui-input v-else-if="paramEdit.type === 'INPUT'" v-model="paramEdit.value" @change="changed">
                    значение
                </ui-input>
                <ui-select v-else v-model="paramEdit.value" :options="$options.static.booleanOptions" @change="changed">
                    значение
                </ui-select>
            </div>
            <div class="col">
                <ui-select v-model="paramEdit.format" :options="paramFormats" @change="changed">формат</ui-select>
            </div>
        </div>
        <div v-if="formatOptions" class="mar-top-l1">
            <div class="row row-collapse">
                <div v-for="(opt, name) in formatOptions" :key="name" class="col">
                    <template v-if="opt.type === Number">
                        <ui-input v-model="paramEdit.formatOpt[name]" type="number" step="" @change="changed" />
                    </template>
                    <template v-else>
                        <ui-input v-model="paramEdit.formatOpt[name]" @change="changed" />
                    </template>
                    <div class="form-label form-label-xsmall form-label-sticky">{{ opt.name }}</div>
                </div>
            </div>
        </div>
        <div class="mar-top-3">
            <div class="row row-collapse">
                <div class="col col-vmid">
                    <div class="btn btn-ghost btn-small" @click="isStylePanelCollapsed = !isStylePanelCollapsed">
                        <template v-if="paramEdit.style.length > 0">стиль ({{ paramEdit.style.length }})</template>
                        <template v-else>стиль</template>
                        <i
                            class="mdi color-primary mar-left-3"
                            :class="[isStylePanelCollapsed ? 'mdi-chevron-down' : 'mdi-chevron-up']"></i>
                    </div>
                </div>
                <div class="col col-auto col-vmid">
                    <div class="btn btn-icon btn-ghost btn-small" @click="addStyleItem">
                        <div class="icon">
                            <i class="mdi mdi-plus"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="!isStylePanelCollapsed" class="mar-top-l1">
            <draggable v-model="paramEdit.style" v-bind="dragOptions" @change="changed">
                <div v-for="(styleItem, i) in paramEdit.style" :key="i" class="p">
                    <div class="row row-collapse">
                        <div class="col col-auto col-vmid">
                            <div class="icon cursor-move drag-handle">
                                <i class="mdi mdi-drag mdi-18px"></i>
                            </div>
                        </div>
                        <div class="col">
                            <div class="row row-gap-l1">
                                <div class="col col-20">
                                    <ui-select v-model="styleItem.type" :options="paramStyleTypes" @change="changed" />
                                    <div class="form-label form-label-xsmall form-label-sticky">условие</div>
                                </div>
                                <div class="col col-80">
                                    <ui-input v-model="styleItem.style" @change="changed" />
                                    <div class="form-label form-label-xsmall form-label-sticky">стиль</div>
                                </div>
                                <div class="col col-12-12">
                                    <ui-input-tags
                                        v-model="styleItem.cssClass"
                                        v-bind="{ delimiter: ' ' }"
                                        @change="changed" />
                                    <div class="form-label form-label-xsmall form-label-sticky">класс</div>
                                </div>
                                <div class="col col-6-12">
                                    <ui-select
                                        v-model="styleItem.comparedValueType"
                                        :options="paramStyleValueTypes"
                                        @change="changed" />
                                    <div class="form-label form-label-xsmall form-label-sticky">
                                        тип сравниваемого значения
                                    </div>
                                </div>
                                <div class="col col-6-12">
                                    <ui-select
                                        v-model="styleItem.valueType"
                                        :options="paramStyleValueTypes"
                                        @change="changed" />
                                    <div class="form-label form-label-xsmall form-label-sticky">тип значения</div>
                                </div>
                                <div class="col col-6-12">
                                    <ui-select
                                        v-if="styleItem.comparedValueType === 'MD'"
                                        v-model="styleItem.comparedValue"
                                        :options="dimensionMetricNames"
                                        @change="changed" />
                                    <ui-input
                                        v-else-if="styleItem.comparedValueType === 'INP'"
                                        v-model="styleItem.comparedValue"
                                        @change="changed" />
                                    <div class="form-label form-label-xsmall form-label-sticky">
                                        сравниваемое значение
                                    </div>
                                </div>
                                <div class="col col-6-12">
                                    <ui-select
                                        v-if="styleItem.valueType === 'MD'"
                                        v-model="styleItem.value"
                                        :options="dimensionMetricNames"
                                        @change="changed" />
                                    <ui-input
                                        v-else-if="styleItem.valueType === 'INP'"
                                        v-model="styleItem.value"
                                        @change="changed" />
                                    <div class="form-label form-label-xsmall form-label-sticky">значение</div>
                                </div>
                            </div>
                        </div>
                        <div class="col col-auto col-vmid">
                            <div class="btn btn-icon btn-small">
                                <div class="icon cursor-pointer" @click="deleteStyleItem(i)">
                                    <i class="mdi mdi-close"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                    <hr v-if="i < paramEdit.style.length - 1" class="mar-v-l1" />
                </div>
            </draggable>
        </div>
    </div>
</template>
<script>
import draggable from 'vuedraggable';
import cloneDeep from 'lodash/cloneDeep';
import { PanelUi } from '@goodt-wcore/components';

const DRAG_ANIMATION_TIME = 200;

export default {
    components: {
        draggable,
        ...PanelUi
    },
    props: {
        param: {
            type: Object,
            default: () => ({})
        },
        paramTypes: {
            type: Array,
            default: () => []
        },
        paramFormats: {
            type: Array,
            default: () => []
        },
        paramStyleTypes: {
            type: Array,
            default: () => []
        },
        paramStyleValueTypes: {
            type: Array,
            default: () => []
        },
        paramStyleFactory: {
            type: Function,
            default: () => {}
        },
        dimensionMetricNames: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            paramEdit: null,
            dragOptions: {
                animation: DRAG_ANIMATION_TIME,
                handle: '.drag-handle'
            },
            isStylePanelCollapsed: true
        };
    },
    computed: {
        formatOptions() {
            const obj = this.paramFormats.find(({ value }) => value === this.paramEdit.format);
            return obj ? obj.options : null;
        }
    },
    static: {
        booleanOptions: [
            { value: true, label: 'true' },
            { value: false, label: 'false' }
        ]
    },
    watch: {
        param: {
            handler(val) {
                this.paramEdit = cloneDeep(val);
            },
            immediate: true
        },
        'paramEdit.format': {
            handler() {
                this.paramEdit.formatOpt = {};
                this.changed();
            }
        }
    },
    methods: {
        changed() {
            this.$emit('change', this.paramEdit);
        },
        addStyleItem() {
            this.paramEdit.style.push(this.paramStyleFactory());
            this.changed();
        },
        deleteStyleItem(i) {
            this.paramEdit.style.splice(i, 1);
            this.changed();
        }
    }
};
</script>
