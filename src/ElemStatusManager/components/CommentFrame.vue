<template>
    <div class="container" @click.self="onCancel">
        <div class="container__accept-popup accept-popup" :class="popupSetting.popupCssClass">
            <div class="accept-popup__title" :class="popupSetting.titleCssClass">
                {{ POPUP_TITLE }}
                <i class="accept-popup__close-icon" :class="popupSetting.closeIconCssClass" @click="onCancel" />
            </div>
            <hr />
            <div class="accept-popup__description" :class="popupSetting.bodyCssClass">{{ POPUP_DESCRIPTION }}</div>
            <hr />
            <div class="accept-popup__actions actions" :class="popupSetting.footerCssClass">
                <button
                    class="actions__button actions__button--cancel"
                    :class="popupSetting.cancelButtonCssClass"
                    @click="onCancel">
                    {{ DECLINE_BUTTON_TITLE }}
                </button>
                <button
                    class="actions__button actions__button--approve"
                    :class="popupSetting.confirmButtonCssClass"
                    @click="onAcceptCom">
                    {{ buttonName }}
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import { useComputedWhenMixin } from '@goodt-wcore/utils';
import { DECLINE_BUTTON_TITLE, POPUP_DESCRIPTION, POPUP_TITLE } from '../config';

export default {
    name: 'Comment',
    mixins: [useComputedWhenMixin()],
    inject: ['$widget'],
    static: {
        DECLINE_BUTTON_TITLE,
        POPUP_TITLE,
        POPUP_DESCRIPTION
    },
    props: {
        buttonName: {
            type: String,
            default: ''
        }
    },
    computedEditor: {
        popupSetting() {
            const { popupSetting } = this.$widget.props;
            return popupSetting;
        }
    },
    methods: {
        onAcceptCom() {
            this.$emit('change-accepted');
            this.$emit('on-cancel');
        },
        onCancel() {
            this.$emit('on-cancel');
        }
    },
    implicitCssModule: true
};
</script>

<style module lang="pcss">
@b container {
    composes: w-100 h-100 pos-fixed pos-top-left from global;
    background-color: #4e4e4e4a;
    z-index: 10;
    @e accept-popup {
        composes: bg-white mar-auto pos-rel radius-1 d-flex flex-col from global;
        max-width: 780px;
        min-width: 38vw;
        top: 50%;
        transform: translateY(-50%);
    }
}

@b accept-popup {
    @e title {
        composes: text-h3 pad-h-7 pad-v-6 from global;
    }
    @e close-icon {
        composes: mdi mdi-close line-height-h2 color-grey pull-right text-h3 cursor-pointer from global;
        line-height: 24px;
    }
    @e description {
        composes: color-black pad-7 lh-1 from global;
    }
    @e actions {
        composes: d-flex flex-h-start pad-7 from global;
    }
}

@b actions {
    @e button {
        composes: btn btn-small text-small text-upper pad-h-6 pad-v-5 shadow-2 from global;

        @m cancel {
            composes: btn-ghost lh-1 mar-right-6 h-12 from global;
        }
        @m approve {
            composes: btn-primary lh-1 h-12 from global;
        }
    }
}
</style>
