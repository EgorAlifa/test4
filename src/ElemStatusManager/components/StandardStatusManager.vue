<template>
    <div class="status-manager">
        <div v-if="isButtonShown" class="status-manager__button" @click="onOptionFirstClick">{{ label }}</div>
        <div v-else class="status-manager__select" @click="onSelectClicked">
            <span class="placeholder" :class="placeholderCssClass">
                {{ label }}
            </span>
            <div class="icon-container" :class="iconContainerCssClass">
                <i v-if="isOpenedPopover" class="icon-container__menu-icon icon-container__menu-icon--opened"></i>
                <i v-else class="icon-container__menu-icon icon-container__menu-icon--closed"></i>
            </div>
        </div>
        <div class="status-manager__dropdown" v-if="isOpenedPopover">
            <div
                v-for="(option, index) in options"
                :key="index"
                class="option"
                :class="{
                    'option--disabled': option.isAvailable === false
                }"
                @click="onOptionClick(option)">
                {{ option.statusTitle != null ? option.statusTitle : option.title }}
            </div>
        </div>
    </div>
</template>

<script>
import { useComputedWhenMixin } from '@goodt-wcore/utils';
import { STRING_VALUE_TRUE, ONCE_OPTION } from '../constants';
import { Vars } from '../descriptor';

export default {
    name: 'StandardStatusManager',
    mixins: [useComputedWhenMixin()],
    inject: ['$widget'],
    props: {
        options: {
            type: Array,
            default: () => []
        },
        selectedOptionTitle: {
            type: String,
            default: null
        }
    },
    data: () => ({
        isOpenedPopover: false
    }),
    computed: {
        iconContainerCssClass() {
            return [this.isOpenedPopover ? 'icon-container--opened' : 'icon-container--closed'];
        },
        placeholderCssClass() {
            return [this.isOpenedPopover ? 'placeholder--opened' : 'placeholder--closed'];
        },
        isButtonShown() {
            return this.options.length === ONCE_OPTION;
        },
        label() {
            return this.selectedOptionTitle ?? this.placeholderOpened;
        },
        isActive() {
            const isActiveValue = this.$widget.storeState[Vars.IS_ACTIVE];
            return typeof isActiveValue === 'string' ? isActiveValue === STRING_VALUE_TRUE : isActiveValue;
        }
    },
    computedEditor: {
        placeholderOpened() {
            const { placeholderOpenedText } = this.$widget.props;
            return placeholderOpenedText;
        }
    },
    methods: {
        onOptionFirstClick() {
            const [option] = this.options;
            this.$emit('option-selected', option);
        },
        onSelectClicked() {
            if (this.isActive != null && !this.isActive) {
                return;
            }
            this.isOpenedPopover = !this.isOpenedPopover;
        },

        onOptionClick(option) {
            this.$emit('option-selected', option);
            this.isOpenedPopover = false;
        }
    },
    implicitCssModule: true
};
</script>

<style module lang="pcss">
@b status-manager {
    composes: bg-primary radius-1 from global;

    @e select {
        composes: w-100 color-white text-upper text-small d-flex cursor-pointer from global;
        min-height: calc(var(--line-height) * 1rem);

        @m disabled {
            composes: disabled bg-muted from global;
            cursor: default;
        }
    }

    @e dropdown {
        composes: w-100 pad-bot-5 text-small from global;
        z-index: 10;
        position: relative;
        overflow: hidden;
    }

    @e button {
        composes: btn w-100 color-white text-upper from global;

        @m disabled {
            composes: disabled from global;
        }
    }
}

@b placeholder {
    composes: pad-top-5 pad-h-6 w-100 color-white lh-1 from global;
    @m opened {
        composes: pad-bot-none opacity-60 from global;
    }
    @m closed {
        composes: pad-bot-5 opacity-100 from global;
    }
}

@b icon-container {
    composes: pad-h-6 pad-top-5 from global;
    @m opened {
        composes: pad-bot-none from global;
    }
    @m closed {
        composes: pad-bot-5 from global;
    }
    @e menu-icon {
        height: 0.875rem;
        width: 0;
        composes: mdi w-100 text-h2 opacity-40 cursor-pointer d-flex items-center from global;
        justify-content: center;

        @m opened {
            composes: mdi-menu-up from global;
        }
        @m closed {
            composes: mdi-menu-down from global;
        }
        @m disabled {
            cursor: default;
        }
    }
}

@b option {
    composes: bg-primary cursor-pointer mar-top-6 mar-h-6 color-white lh-1 text-upper from global;

    @m disabled {
        pointer-events: none;
        color: var(--color-disabled-dark);
    }
}
</style>
