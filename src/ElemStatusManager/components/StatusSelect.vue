<template>
    <div>
        <div class="select" :id="popoverTargetId" :class="selectSetting.selectCssClass" @click="onTogglePopover">
            <i class="select__icon" :class="selectStatusIconCssClass" :style="statusIconCssVarsStyle" />
            <span class="select__value">{{ currentStatus.title }}</span>
            <i class="select__icon" :class="selectIconCssClass" />
        </div>
        <ui-popover :show.sync="isPopoverShown" v-bind="popoverOptions">
            <ui-datalist class="datalist" v-bind="{ options }" :class="selectSetting.datalistCssClass">
                <template #option="{ option }">
                    <li
                        class="datalist__option"
                        :class="[
                            {
                                active: isActiveOptionSelected(option),
                                'datalist__option--disabled': option.isAvailable === false
                            },
                            ...selectSetting.optionCssClass
                        ]"
                        @click="onSelect(option)">
                        <i
                            class="datalist__option-icon"
                            :class="[option.icon, ...selectSetting.optionStatusIconCssClass]"
                            :style="resolveDatalistOptionCssVarsStyle(option)" />
                        <span>{{ option.title }}</span>
                    </li>
                </template>
            </ui-datalist>
        </ui-popover>
    </div>
</template>

<script>
import { Popover as UiPopover, Datalist as UiDatalist } from 'goodteditor-ui';
import { useComputedWhenMixin } from '@goodt-wcore/utils';
import { StatusCssVars } from '../css-vars';

export default {
    name: 'StatusSelect',
    components: {
        UiPopover,
        UiDatalist
    },
    mixins: [useComputedWhenMixin()],
    inject: ['$widget'],
    props: {
        currentStatus: {
            type: Object,
            required: true
        },
        options: {
            type: Array,
            default() {
                return [];
            }
        }
    },
    data: () => ({
        isPopoverShown: false
    }),
    computedEditor: {
        selectSetting() {
            const { selectSetting } = this.$widget.props;
            return selectSetting;
        }
    },
    computed: {
        selectIconCssClass() {
            return this.isPopoverShown ? 'select__icon--up' : 'select__icon--down';
        },
        statusIconCssVarsStyle() {
            return this.resolveDatalistOptionCssVarsStyle(this.currentStatus);
        },
        selectStatusIconCssClass() {
            const { icon } = this.currentStatus;
            return [icon, ...this.selectSetting.statusIconCssClass];
        },
        popoverTargetId() {
            return `popover-target-${new Date().getMilliseconds()}`;
        },
        popoverTarget() {
            return `#${this.popoverTargetId}`;
        },
        popoverOptions() {
            const { zIndex, popoverTarget: target } = this;
            return {
                zIndex,
                position: 'bl',
                appendToBody: true,
                autoWidth: true,
                target
            };
        }
    },
    methods: {
        resolveDatalistOptionCssVarsStyle(option) {
            return this.$widget.buildCssVarsStyle(StatusCssVars, option);
        },
        onTogglePopover() {
            this.isPopoverShown = !this.isPopoverShown;
        },
        isActiveOptionSelected({ statusToId }) {
            return this.currentStatus.statusToId === statusToId;
        },
        onSelect(option) {
            this.$emit('option-selected', option);
            this.onTogglePopover();
        }
    },
    implicitCssModule: true
};
</script>
<style lang="pcss" module>
@b select {
    composes: d-flex cursor-pointer items-center pad-h-5 pad-v-3 gap-4 radius-3 border-none bg-white poad w-100 from global;
    box-shadow: 0 2px 6px 0 rgba(17, 133, 179, 0.08);

    @e value {
        composes: w-100 text-h3 color-black font-semibold opacity-80 from global;
    }

    @e icon {
        composes: mdi icon mdi-24px from global;
        color: var(--w-status_color);

        @m up {
            composes: mdi-menu-up from global;
            color: var(--color-grey);
        }

        @m down {
            composes: mdi-menu-down from global;
            color: var(--color-grey);
        }
    }
}

@b datalist {
    composes: w-100 from global;
    border-radius: 16px;

    @e option {
        composes: text-truncate from global;

        @m disabled {
            composes: disabled from global;
            pointer-events: none;
            color: var(--color-disabled-dark);
        }
    }

    @e option-icon {
        composes: icon mdi mdi-24px mar-right-5 from global;
        color: var(--w-status_color);

    }
}
</style>
