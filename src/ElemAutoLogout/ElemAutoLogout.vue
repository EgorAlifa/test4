<template>
    <w-elem>
        <component :is="'style'" v-html="customCssContent" />
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
    computed: {
        customCssContent() {
            const p = this.props;

            // ── Overlay ───────────────────────────────────────────────────
            const hex = (p.overlayColor && p.overlayColor.startsWith('#')) ? p.overlayColor : '#000000';
            const r = parseInt(hex.slice(1, 3), 16) || 0;
            const g = parseInt(hex.slice(3, 5), 16) || 0;
            const b = parseInt(hex.slice(5, 7), 16) || 0;
            const a = ((p.overlayOpacity != null ? p.overlayOpacity : 45) / 100).toFixed(2);
            let overlayCss = `background: rgba(${r},${g},${b},${a});`;
            if (p.overlayCustomCss) overlayCss += ` ${p.overlayCustomCss}`;
            let css = `.auto-logout__overlay { ${overlayCss} }`;

            // ── Dialog ────────────────────────────────────────────────────
            let dlg = '';
            if (p.dialogBgColor)   dlg += `background: ${p.dialogBgColor};`;
            if (p.dialogTextColor) dlg += `color: ${p.dialogTextColor};`;
            if (p.dialogRadius != null) dlg += `border-radius: ${p.dialogRadius}px;`;
            if (p.dialogCustomCss) dlg += ` ${p.dialogCustomCss}`;
            if (dlg) css += ` .auto-logout__dialog { ${dlg} }`;

            // ── Button ────────────────────────────────────────────────────
            let btn = '';
            if (p.btnBgColor)   btn += `background: ${p.btnBgColor} !important; border-color: ${p.btnBgColor} !important;`;
            if (p.btnTextColor) btn += `color: ${p.btnTextColor} !important;`;
            if (p.btnRadius != null) btn += `border-radius: ${p.btnRadius}px;`;
            if (p.btnFontFamily) btn += `font-family: ${p.btnFontFamily} !important;`;
            if (p.btnFontSize)   btn += `font-size: ${p.btnFontSize} !important;`;
            if (p.btnFontWeight) btn += `font-weight: ${p.btnFontWeight} !important;`;
            if (p.btnTextTransform && p.btnTextTransform !== 'none') btn += `text-transform: ${p.btnTextTransform} !important;`;
            if (p.btnLetterSpacing) btn += `letter-spacing: ${p.btnLetterSpacing} !important;`;
            if (p.dialogBtnCustomCss) btn += ` ${p.dialogBtnCustomCss}`;
            if (btn) {
                css += ` .auto-logout__dialog-btn { ${btn} }`;
                // Also override :hover/:focus so the framework's btn-primary hover doesn't bleed through
                if (p.btnBgColor) {
                    css += ` .auto-logout__dialog-btn:hover, .auto-logout__dialog-btn:focus { background: ${p.btnBgColor} !important; border-color: ${p.btnBgColor} !important; filter: brightness(0.88); }`;
                }
            }

            // ── Icon ──────────────────────────────────────────────────────
            if (p.iconColor) css += ` .auto-logout__dialog-icon { color: ${p.iconColor}; }`;

            return css;
        }
    },
    mounted() {
        console.log(LOG_PREFIX, 'mounted', {
            isEditorMode: this.isEditorMode,
            timeoutSeconds: this.props.timeoutSeconds,
            warningEnabled: this.props.warningEnabled,
            warningDuration: this.props.warningDuration,
            redirectType: this.props.redirectType,
            customRedirectUrl: this.props.customRedirectUrl
        });

        if (this.isEditorMode) {
            console.log(LOG_PREFIX, 'editor mode — activity tracking disabled');
            return;
        }

        /** @type {{ adapter: import('@goodt-common/auth/adapters/Adapter').default }} */
        const { adapter } = AuthManager.instance;
        if (!adapter || !adapter.authenticated) {
            // User is already logged out (e.g. widget lives on the /login page too).
            // Do not start tracking — avoids a logout loop after redirect.
            console.log(LOG_PREFIX, 'user is not authenticated — skipping activity tracking');
            return;
        }

        this.startTracking();
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
                this.resetTimer(true);
            }
        },

        /**
         * Reset the inactivity timer from scratch.
         * @param {boolean} [fromActivity] - true when called from a DOM activity event;
         *   suppresses the verbose log to avoid console spam on every mousemove/keydown.
         */
        resetTimer(fromActivity = false) {
            this.clearTimers();
            this.showWarning = false;

            const { timeoutSeconds, warningEnabled, warningDuration } = this.props;
            const effectiveWarning = warningEnabled ? Math.min(warningDuration, timeoutSeconds) : 0;
            const idleDelay = (timeoutSeconds - effectiveWarning) * 1000;

            if (!fromActivity) {
                console.log(LOG_PREFIX, 'resetTimer', {
                    timeoutSeconds,
                    effectiveWarning,
                    idleDelayMs: idleDelay,
                    logoutAt: new Date(Date.now() + timeoutSeconds * 1000).toLocaleTimeString()
                });
            }

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
         * Perform logout via AuthManager.instance.logout().
         *
         * AuthManager.instance.logout() fires all _logoutHandlers registered by
         * the platform (router, session manager, etc.) — this is the correct
         * platform-level logout, analogous to how ElemAuthContainer uses
         * AuthManager.instance.login() for the platform-level login redirect.
         *
         * Calling adapter.logout() directly would bypass these handlers; for the
         * Keycloak SSO adapter it is literally a no-op (calls super → Promise.resolve).
         *
         * Redirect behaviour:
         *   - DEFAULT: the platform's _logoutHandlers are responsible for the
         *              redirect — we do not trigger it manually.
         *   - CUSTOM:  navigate to the configured URL after the handlers resolve.
         */
        async performLogout() {
            console.log(LOG_PREFIX, 'performLogout — start');
            this.clearTimers();
            this.showWarning = false;

            const { redirectType, customRedirectUrl } = this.props;
            console.log(LOG_PREFIX, 'calling AuthManager.instance.logout()', { redirectType, customRedirectUrl });

            try {
                await AuthManager.instance.logout();
                console.log(LOG_PREFIX, 'AuthManager.instance.logout() resolved');
            } catch (err) {
                console.warn(LOG_PREFIX, 'AuthManager.instance.logout() threw', err);
            }

            if (redirectType === RedirectType.CUSTOM && customRedirectUrl) {
                console.log(LOG_PREFIX, `navigating to custom URL: ${customRedirectUrl}`);
                window.location.href = customRedirectUrl;
            }
        }
    }
};
</script>
<style lang="pcss" src="./style.pcss"></style>
