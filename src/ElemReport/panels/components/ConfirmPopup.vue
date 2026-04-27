<template>
    <ui-portal>
        <ui-popup :visible="true" v-bind="popupSettings">
            <template #body>
                <slot name="header">
                    <div class="popup-title">Подтверждение</div>
                </slot>

                <slot name="main">
                    <div>Вы уверены, что хотите совершить это действие?</div>
                </slot>
            </template>
            <template #footer>
                <slot name="footer">
                    <div class="footer-btns">
                        <ui-button type="secondary" @click="$emit('cancel')">{{ cancelBtnText }}</ui-button>
                        <ui-button type="error" @click="$emit('confirm')">
                            {{ confirmBtnText }}
                        </ui-button>
                    </div>
                </slot>
            </template>
        </ui-popup>
    </ui-portal>
</template>

<script>
import { UiButton, Popup as UiPopup, Portal as UiPortal } from '@goodt-wcore/components';

export default {
    name: 'ConfirmPopup',
    components: { UiButton, UiPopup, UiPortal },
    props: {
        cancelBtnText: {
            type: String,
            default: 'Отменить'
        },
        confirmBtnText: {
            type: String,
            default: 'Подтвердить'
        }
    },
    static: {
        popupSettings: {
            modal: true,
            fullscreen: false,
            usePadding: true,
            showCloseButton: false,
            dialog: {
                class: {},
                style: {
                    width: '545px'
                }
            }
        }
    }
};
</script>

<style scoped>
.popup-title {
    font-size: 24px;
    padding-bottom: 25px;
}
.footer-btns {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    gap: 20px;
}
.footer-btns > button {
    flex: 1;
    text-transform: uppercase;
}
</style>
