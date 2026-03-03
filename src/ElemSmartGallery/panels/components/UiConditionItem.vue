<template>
    <div :class="['condition-item', isInputBFocused && 'condition-item__input-opened']">
        <template v-if="value">
            <template v-if="!isInputBFocused">
                <span
                    v-if="typeForLeftField == null || typeForLeftField === SlotConditionType.METRIC"
                    :id="aListId"
                    class="condition-item__badge badge text-small w-100 text-truncate"
                    :title="a"
                    @click="toggleAList">
                    {{ a ? a : '_' }}
                </span>
                <input v-else class="input input-small pad-v-none w-100" type="text" v-model="a" />
                <i
                    class="mdi cursor-pointer"
                    :class="typeMetaForLeftField.icon"
                    :title="typeMetaForLeftField.label"
                    @click="toggleTypeForLeftField"></i>
                <span :id="opListId" class="condition-item__badge badge badge-primary text-small" @click="toggleOpList">
                    {{ op }}
                </span>
            </template>

            <input
                class="input input-small pad-v-none w-100"
                type="text"
                v-model="b"
                :title="b"
                @click="toggleInputBFocused(true)"
                :disabled="isDisabledSecondValue" />

            <template v-if="!isInputBFocused">
                <i
                    class="mdi cursor-pointer"
                    :class="typeMetaForRightField.icon"
                    :title="typeMetaForRightField.label"
                    @click="toggleTypeForRightField"></i>
                <i class="mdi mdi-delete color-primary cursor-pointer" @click="$emit('delete')"></i>
            </template>
            <template v-else>
                <i class="mdi mdi-undo-variant cursor-pointer" @click="toggleInputBFocused(false)"></i>
            </template>

            <ui-popover v-bind="{ target: '#' + aListId }" :show.sync="isAListShown">
                <ui-datalist :options="aOptions" size="small">
                    <template #option="{ option }">
                        <li @click="() => (a = option.value)">{{ option.label }}</li>
                    </template>
                </ui-datalist>
            </ui-popover>
            <ui-popover v-bind="{ target: '#' + opListId }" :show.sync="isOpListShown">
                <ui-datalist :options="opOptions" size="small">
                    <template #option="{ option }">
                        <li @click="() => (op = option.value)">{{ option.label }}</li>
                    </template>
                </ui-datalist>
            </ui-popover>
        </template>
    </div>
</template>
<script>
import { Datalist as UiDatalist, Popover as UiPopover } from 'goodteditor-ui';
import { PanelUi } from '@goodt-wcore/panel-ui';
import {
    SlotCondition,
    SlotConditionOperatorMeta,
    SlotConditionType,
    SlotConditionTypeMeta,
    SlotConditionOperator
} from '../../constants';

let id = 0;

export default {
    components: { ...PanelUi, UiPopover, UiDatalist },
    props: {
        value: {
            type: String,
            default: null
        },
        metricDimensions: {
            type: Array,
            default: () => []
        }
    },
    static: {
        SlotConditionType
    },
    data: () => ({
        isOpListShown: false,
        isAListShown: false,
        opListId: `operators-list-${id++}`,
        aListId: `a-list-${id++}`,
        isInputBFocused: false
    }),
    computed: {
        condition() {
            return SlotCondition.fromString(this.value);
        },
        aOptions() {
            return this.metricDimensions;
        },
        opOptions() {
            return Object.entries(SlotConditionOperatorMeta).map(([value, { label }]) => ({ label, value }));
        },
        a: {
            get() {
                return this.condition.a;
            },
            set(val) {
                this.setConditionProp('a', val);
                this.isAListShown = false;
            }
        },
        b: {
            get() {
                return this.condition.b;
            },
            set(val) {
                this.setConditionProp('b', val);
            }
        },
        op: {
            get() {
                return this.condition.op;
            },
            set(val) {
                this.setConditionProp('op', val);
                this.isOpListShown = false;
            }
        },
        typeForLeftField: {
            get() {
                return this.condition.typeForLeftField;
            },
            set(val) {
                this.setConditionProp('typeForLeftField', val);
            }
        },
        typeForRightField: {
            get() {
                return this.condition.type;
            },
            set(val) {
                this.setConditionProp('type', val);
            }
        },
        typeMetaForLeftField() {
            return SlotConditionTypeMeta[this.typeForLeftField];
        },
        typeMetaForRightField() {
            return SlotConditionTypeMeta[this.typeForRightField];
        },
        isDisabledSecondValue() {
            return [SlotConditionOperator.IS, SlotConditionOperator.ISN].includes(this.op);
        }
    },
    methods: {
        setConditionProp(prop, val) {
            const condition = this.condition.clone();
            condition[prop] = val;
            this.$emit('input', condition.toString());
        },
        toggleAList() {
            this.isAListShown = !this.isAListShown;
        },
        toggleOpList() {
            this.isOpListShown = !this.isOpListShown;
        },
        toggleTypeForLeftField() {
            const { METRIC, STORE } = SlotConditionType;
            this.typeForLeftField = this.typeForLeftField === STORE ? METRIC : STORE;
        },
        toggleTypeForRightField() {
            const { INPUT, STORE } = SlotConditionType;
            this.typeForRightField = this.typeForRightField === STORE ? INPUT : STORE;
        },
        toggleInputBFocused(value) {
            this.isInputBFocused = value;
        }
    }
};
</script>
<style lang="less" scoped>
.condition-item {
    display: grid;
    gap: 0.25rem;
    grid-template-columns: 4fr max-content max-content 2.5fr max-content max-content;
    align-items: center;

    &__input-opened {
        grid-template-columns: 1fr max-content;
    }
    &__badge {
        display: inline-block;
        cursor: pointer;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
}
</style>
