<template>
    <ui-panel-container>
        <ui-has-two-columns class="p">
            <template #left>
                <ui-select
                    v-model="paramEdit.type"
                    :options="paramTypes"
                    @input="
                        () => {
                            paramEdit.value = '';
                            changed();
                        }
                    ">
                    Тип данных
                </ui-select>
            </template>
            <template #right>
                <ui-select
                    v-model="paramEdit.value"
                    :options="dimensionMetricNames"
                    @input="changed"
                    v-if="paramEdit.type === 'METRIC_DIMENSION'">
                    Значение
                </ui-select>

                <ui-input v-else v-model="paramEdit.value" @input="changed">Значение</ui-input>
            </template>
        </ui-has-two-columns>

        <ui-collapse class="p" v-for="(styleItem, idx) in paramEdit.style" :key="`cond-${idx}`">
            <template #header>{{ `Условие ${idx + 1}` }}</template>

            <ui-select class="p" v-model="styleItem.typeCondition" :options="separateParamTypes" @input="changed">
                Тип данных
            </ui-select>

            <ui-has-two-columns class="p">
                <template #left>
                    <ui-select v-model="styleItem.type" :options="paramStyleTypes" @input="changed">Условие</ui-select>
                </template>
                <template #right>
                    <ui-select
                        v-model="styleItem.value"
                        :options="dimensionMetricNames"
                        @input="changed"
                        v-if="styleItem.typeCondition === 'METRIC' || styleItem.typeCondition === 'DIMENSION'">
                        значение
                    </ui-select>

                    <ui-input v-else v-model="styleItem.value" @input="changed">значение</ui-input>
                </template>
            </ui-has-two-columns>

            <ui-input-tags
                class="p"
                :value="resolveStyleValue(styleItem.style)"
                :valueFilter="filterStyleValue"
                @change="(value) => changedStyle(value, idx)">
                Стиль
            </ui-input-tags>

            <ui-button type="error" @click="deleteStyleItem(idx)">Удалить</ui-button>
        </ui-collapse>

        <ui-button type="ghost" @click="addStyleItem">Добавить условие</ui-button>
    </ui-panel-container>
</template>
<script>
import cloneDeep from 'lodash/cloneDeep';
import * as ui from '@goodt-wcore/panel-ui';

export default {
    components: {
        ...ui
    },
    props: {
        param: {
            type: Object,
            default() {
                return null;
            }
        },
        paramTypes: {
            type: Array,
            default() {
                return [];
            }
        },
        paramFormats: {
            type: Array,
            default() {
                return [];
            }
        },
        paramStyleTypes: {
            type: Array,
            default() {
                return [];
            }
        },
        paramStyleFactory: {
            type: Function,
            default() {
                return null;
            }
        },
        dimensionMetricNames: {
            type: Array,
            default() {
                return [];
            }
        },
        separateParamTypes: {
            type: Array,
            default() {
                return [];
            }
        }
    },
    data() {
        return {
            paramEdit: null
        };
    },
    watch: {
        param: {
            handler(val) {
                this.paramEdit = cloneDeep(val);
            },
            immediate: true
        },
        'paramEdit.format': {
            handler(val) {
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
        },
        changedStyle(value, idx) {
            this.paramEdit.style[idx].style = value;
            this.changed();
        },
        resolveStyleValue(value) {
            return typeof value === 'string' ? value.split('; ') : value;
        },
        filterStyleValue(values, valuesNew) {
            return valuesNew.filter((v, i, a) => v && a.indexOf(v) === i && !values.includes(v));
        }
    }
};
</script>
