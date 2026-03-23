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

const LOG_PREFIX = '[ElemAutoLogout]';

export default {
    extends: Elem,
    meta,
    data: () => ({
        showWarning: false,
        countdown: 0
    }),
    mounted() {
        console.log(LOG_PREFIX, 'mounted', {
            isEditorMode: this.isEditorMode,
            timeoutSeconds: this.props.timeoutSeconds,
            warningEnabled: this.props.warningEnabled,
            warningDuration: this.props.warningDuration,
            redirectType: this.props.redirectType,
            customRedirectUrl: this.props.customRedirectUrl
        });

        if (!this.isEditorMode) {
            this.startTracking();
        } else {
            console.log(LOG_PREFIX, 'editor mode — activity tracking disabled');
        }
    },
    beforeDestroy() {
        console.log(LOG_PREFIX, 'beforeDestroy — stopping tracking');
        this.stopTracking();
    },
    methods: {
        ...ElemInstanceTypeDescriptor,

        /**
         * Attach activity listeners and start the inactivity timer.
         */
        startTracking() {
            console.log(LOG_PREFIX, 'startTracking — attaching listeners:', ACTIVITY_EVENTS);
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
                console.log(LOG_PREFIX, 'stopTracking — listeners removed');
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

            console.log(LOG_PREFIX, 'resetTimer', {
                timeoutSeconds,
                effectiveWarning,
                idleDelayMs: idleDelay,
                logoutAt: new Date(Date.now() + timeoutSeconds * 1000).toLocaleTimeString()
            });

            if (effectiveWarning > 0) {
                this._idleTimer = setTimeout(() => {
                    console.log(LOG_PREFIX, 'idle threshold reached — showing warning');
                    this.startWarning(effectiveWarning);
                }, idleDelay);
            } else {
                this._idleTimer = setTimeout(() => {
                    console.log(LOG_PREFIX, 'idle threshold reached — no warning, logging out immediately');
                    this.performLogout();
                }, timeoutSeconds * 1000);
            }
        },

        /**
         * Show the warning dialog and start the countdown to logout.
         * @param {number} seconds
         */
        startWarning(seconds) {
            console.log(LOG_PREFIX, `startWarning — ${seconds}s until logout`);
            this.showWarning = true;
            this.countdown = seconds;

            this._countdownInterval = setInterval(() => {
                this.countdown -= 1;
                console.log(LOG_PREFIX, `warning countdown: ${this.countdown}s`);
                if (this.countdown <= 0) {
                    clearInterval(this._countdownInterval);
                    console.log(LOG_PREFIX, 'countdown reached zero — logging out');
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
            console.log(LOG_PREFIX, 'user chose to stay — resetting timer');
            this.resetTimer();
        },

        /**
         * Perform logout via AuthManager adapter, then redirect to the auth page.
         *
         * adapter.logout() only clears the session — it does NOT redirect the
         * browser.  After clearing the session we must explicitly redirect:
         *   - DEFAULT → AuthManager.instance.login() (same as ElemAuthContainer)
         *   - CUSTOM  → navigate to the configured URL
         *
         * AuthManager.instance.login() fires _loginHandlers registered by the
         * router, which calls router.push('/login').  Vue Router 3 rejects the
         * push promise with NavigationRedirected when a beforeEach guard
         * intercepts it — that rejection must be caught to avoid an unhandled
         * promise error in the console.
         */
        async performLogout() {
            console.log(LOG_PREFIX, 'performLogout — start');
            this.clearTimers();
            this.showWarning = false;

            /** @type {{ adapter: import('@goodt-common/auth/adapters/Adapter').default }} */
            const { adapter } = AuthManager.instance;
            if (!adapter) {
                console.warn(LOG_PREFIX, 'no AuthManager adapter found — aborting logout');
                return;
            }

            console.log(LOG_PREFIX, 'calling adapter.logout()');
            try {
                await adapter.logout();
                console.log(LOG_PREFIX, 'adapter.logout() resolved — session cleared');
            } catch (err) {
                console.warn(LOG_PREFIX, 'adapter.logout() threw — proceeding to redirect anyway', err);
            }

            const { redirectType, customRedirectUrl } = this.props;
            console.log(LOG_PREFIX, 'redirecting', { redirectType, customRedirectUrl });

            if (redirectType === RedirectType.CUSTOM && customRedirectUrl) {
                console.log(LOG_PREFIX, `navigating to custom URL: ${customRedirectUrl}`);
                window.location.href = customRedirectUrl;
            } else {
                console.log(LOG_PREFIX, 'calling AuthManager.instance.login() to redirect to Keycloak login page');
                // Vue Router 3 rejects the push promise with NavigationRedirected when the
                // router's beforeEach guard intercepts the push — catch it to keep the
                // console clean.
                AuthManager.instance.login().catch((err) => {
                    console.log(LOG_PREFIX, 'navigation to login page completed (NavigationRedirected is expected here)', err?.message);
                });
            }
        }
    }
};
</script>
<style lang="pcss" scoped src="./style.pcss"></style>
