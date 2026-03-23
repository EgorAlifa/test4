<template>
    <w-elem>
        <!-- Displayed only in editor mode as a visual placeholder -->
        <div v-if="isEditorMode" class="auto-logout__placeholder">
            <i class="mdi mdi-timer-off-outline"></i>
            <span>Автовыход: {{ props.timeoutSeconds }}с бездействия</span>
        </div>
        <!-- Warning overlay shown before automatic logout -->
        <transition name="auto-logout">
            <div v-if="showWarning" class="auto-logout__overlay">
                <div class="auto-logout__dialog">
                    <i class="mdi mdi-alert-circle-outline auto-logout__dialog-icon"></i>
                    <div class="auto-logout__dialog-title">{{ props.labels.warningTitle }}</div>
                    <div class="auto-logout__dialog-message">
                        {{ props.labels.warningMessage }}
                        <strong>{{ countdown }} {{ props.labels.seconds }}</strong>
                    </div>
                    <button class="btn btn-primary auto-logout__dialog-btn" @click="onStayLoggedIn">
                        {{ props.labels.stayLoggedIn }}
                    </button>
                </div>
            </div>
        </transition>
    </w-elem>
</template>
<script>
import { AuthManager } from '@goodt-wcore/managers';
import { Elem } from '@goodt-wcore/elem';
import { meta } from './descriptor';
import { ElemInstanceTypeDescriptor } from './types';
import { RedirectType, ACTIVITY_EVENTS } from './constants';

export default {
    extends: Elem,
    meta,
    data: () => ({
        showWarning: false,
        countdown: 0
    }),
    mounted() {
        if (!this.isEditorMode) {
            this.startTracking();
        }
    },
    beforeDestroy() {
        this.stopTracking();
    },
    methods: {
        ...ElemInstanceTypeDescriptor,

        /**
         * Attach activity listeners and start the inactivity timer.
         */
        startTracking() {
            this._boundHandleActivity = this.handleActivity.bind(this);
            ACTIVITY_EVENTS.forEach((event) => {
                document.addEventListener(event, this._boundHandleActivity, { passive: true });
            });
            this.resetTimer();
        },

        /**
         * Remove activity listeners and clear all timers.
         */
        stopTracking() {
            if (this._boundHandleActivity) {
                ACTIVITY_EVENTS.forEach((event) => {
                    document.removeEventListener(event, this._boundHandleActivity);
                });
                this._boundHandleActivity = null;
            }
            this.clearTimers();
        },

        /**
         * Called on each user activity event.
         * Resets timer only when no warning is currently shown.
         */
        handleActivity() {
            if (!this.showWarning) {
                this.resetTimer();
            }
        },

        /**
         * Reset the inactivity timer from scratch.
         */
        resetTimer() {
            this.clearTimers();
            this.showWarning = false;

            const { timeoutSeconds, warningEnabled, warningDuration } = this.props;
            const effectiveWarning = warningEnabled ? Math.min(warningDuration, timeoutSeconds) : 0;
            const idleDelay = (timeoutSeconds - effectiveWarning) * 1000;

            if (effectiveWarning > 0) {
                this._idleTimer = setTimeout(() => {
                    this.startWarning(effectiveWarning);
                }, idleDelay);
            } else {
                this._idleTimer = setTimeout(() => {
                    this.performLogout();
                }, timeoutSeconds * 1000);
            }
        },

        /**
         * Show the warning dialog and start the countdown to logout.
         * @param {number} seconds
         */
        startWarning(seconds) {
            this.showWarning = true;
            this.countdown = seconds;

            this._countdownInterval = setInterval(() => {
                this.countdown -= 1;
                if (this.countdown <= 0) {
                    clearInterval(this._countdownInterval);
                    this.performLogout();
                }
            }, 1000);
        },

        /**
         * Clear all active timers and intervals.
         */
        clearTimers() {
            clearTimeout(this._idleTimer);
            clearInterval(this._countdownInterval);
            this._idleTimer = null;
            this._countdownInterval = null;
        },

        /**
         * "Stay logged in" button handler — dismiss warning and reset timer.
         */
        onStayLoggedIn() {
            this.resetTimer();
        },

        /**
         * Perform logout via AuthManager adapter, then redirect to the auth page.
         *
         * adapter.logout() only clears the session — it does NOT redirect the
         * browser.  After clearing the session we must explicitly redirect:
         *   - DEFAULT → AuthManager.instance.login() (same as ElemAuthContainer)
         *   - CUSTOM  → navigate to the configured URL
         */
        async performLogout() {
            this.clearTimers();
            this.showWarning = false;

            /** @type {{ adapter: import('@goodt-common/auth/adapters/Adapter').default }} */
            const { adapter } = AuthManager.instance;
            if (!adapter) {
                return;
            }

            try {
                // adapter.logout() accepts no arguments; it only clears the session
                await adapter.logout();
            } catch {
                // ignore — proceed to redirect regardless
            }

            const { redirectType, customRedirectUrl } = this.props;
            if (redirectType === RedirectType.CUSTOM && customRedirectUrl) {
                window.location.href = customRedirectUrl;
            } else {
                // Redirect to the Keycloak login page, identical to ElemAuthContainer behaviour
                AuthManager.instance.login();
            }
        }
    }
};
</script>
<style lang="pcss" scoped src="./style.pcss"></style>
